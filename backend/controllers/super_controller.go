package controllers

import (
	"log"
	"time"
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// GetFacultyStats returns aggregated statistics for Super Admin (Localized Version)
func GetFacultyStats(c *fiber.Ctx) error {
	var results []struct {
		FacultyName string `json:"facultyName"`
		TotalOrmawa int    `json:"totalOrmawa"`
		TotalStudents int  `json:"totalStudents"`
		TotalProposals int `json:"totalProposals"`
	}

	// Update to look at new localized table names
	config.DB.Raw(`
		SELECT 
			f.nama_fakultas as faculty_name,
			(SELECT COUNT(*) FROM ormawas WHERE faculty_id = f.id) as total_ormawa,
			(SELECT COUNT(*) FROM mahasiswa m JOIN program_studi p ON m.prodi_id = p.id WHERE p.fakultas_id = f.id) as total_students,
			(SELECT COUNT(*) FROM proposals WHERE fakultas_id = f.id) as total_proposals
		FROM fakultas f
	`).Scan(&results)

	return c.JSON(fiber.Map{"status": "success", "data": results})
}

// GetGlobalSummary returns high-level university stats
func GetGlobalSummary(c *fiber.Ctx) error {
	var stats struct {
		TotalStudents   int64 `json:"totalStudents"`
		TotalOrmawa     int64 `json:"totalOrmawa"`
		TotalFaculty    int64 `json:"totalFaculty"`
		ActiveProposals int64 `json:"activeProposals"`
	}

	config.DB.Model(&models.Student{}).Count(&stats.TotalStudents)
	config.DB.Model(&models.Ormawa{}).Count(&stats.TotalOrmawa)
	config.DB.Model(&models.Faculty{}).Count(&stats.TotalFaculty)
	config.DB.Model(&models.Proposal{}).Where("status = ?", "disetujui_fakultas").Count(&stats.ActiveProposals)

	log.Printf("[SuperAdmin] Dashboard Global Summary Hit - Students: %d, Ormawa: %d, Faculty: %d, Proposals: %d", 
		stats.TotalStudents, stats.TotalOrmawa, stats.TotalFaculty, stats.ActiveProposals)

	return c.JSON(fiber.Map{"status": "success", "data": stats})
}

// GetAllProposals returns every proposal for university level review
func GetAllProposals(c *fiber.Ctx) error {
	var proposals []models.Proposal
	// Only show proposals that have been approved by faculty, or already approved/revised by super admin
	if err := config.DB.Where("status IN ?", []string{"disetujui_fakultas", "disetujui_univ", "revisi"}).Preload("Ormawa").Preload("Fakultas").Preload("Student").Order("created_at DESC").Find(&proposals).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": proposals})
}

// SuperUpdateProposalStatus handles final approval from university level
func SuperUpdateProposalStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var proposal models.Proposal
	if err := config.DB.First(&proposal, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Proposal tidak ditemukan"})
	}

	type UpdateReq struct {
		Status string `json:"status"`
		Notes  string `json:"notes"`
	}
	var req UpdateReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload tidak valid"})
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Update status and notes
		updates := map[string]interface{}{
			"status": req.Status,
			"notes":  req.Notes,
		}
		if err := tx.Model(&proposal).Updates(updates).Error; err != nil {
			return err
		}

		// 2. Add History
		history := models.ProposalHistory{
			ProposalID: proposal.ID,
			Status:     req.Status,
			Notes:      req.Notes,
			CreatedAt:  time.Now(),
		}
		if err := tx.Create(&history).Error; err != nil {
			return err
		}

		// 3. Trigger Disbursement if Approved by Univ AND it wasn't approved before
		if req.Status == "disetujui_univ" && proposal.Status != "disetujui_univ" {
			mutation := models.CashMutation{
				OrmawaID:    proposal.OrmawaID,
				Type:        "masuk",
				Nominal:     proposal.Budget,
				Category:    "Pencairan Proposal",
				Description: "Dana dicairkan oleh Universitas: " + proposal.Title,
				ProposalID:  &proposal.ID,
				Date:        time.Now(),
			}
			if err := tx.Create(&mutation).Error; err != nil {
				return err
			}

			// Notification
			tx.Create(&models.OrmawaNotification{
				OrmawaID: proposal.OrmawaID,
				Type:     "fund",
				Title:    "Dana Kegiatan Dicairkan",
				Desc:     "Dana untuk proposal '" + proposal.Title + "' telah disetujui Universitas dan masuk ke kas.",
			})
		}

		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal update proposal: " + err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Proposal berhasil diupdate"})
}

// GetAllStudents returns the master list of students across all faculties
func GetAllStudents(c *fiber.Ctx) error {
	var students []models.Student
	if err := config.DB.Preload("Major.Faculty").Preload("User").Find(&students).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": students})
}

// AdminCreateStudent handles new student registration along with their user account
func AdminCreateStudent(c *fiber.Ctx) error {
	type Request struct {
		Name      string  `json:"name"`
		NIM       string  `json:"nim"`
		MajorID   uint    `json:"majorId"`
		EntryYear int     `json:"entryYear"`
		GPA       float64 `json:"gpa"`
		Status    string  `json:"status"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	// Start Transaction
	tx := config.DB.Begin()

	// 1. Create a User account (Default password: password123)
	user := models.User{
		Email:        req.NIM + "@student.bku.ac.id",
		PasswordHash: "$2a$10$r9C799sXvD8/Zk9m6p.hQ.m7I8WjKz.Y1vS/F1f7nI.Z1f7nI.Z1", // password123
		RoleID:       4, // Student Role
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal membuat akun user: " + err.Error()})
	}

	// 2. Create Student record
	student := models.Student{
		UserID:    user.ID,
		Name:      req.Name,
		NIM:       req.NIM,
		MajorID:   req.MajorID,
		EntryYear: req.EntryYear,
		GPA:       req.GPA,
		Status:    req.Status,
	}

	if err := tx.Create(&student).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan data mahasiswa: " + err.Error()})
	}

	tx.Commit()
	return c.Status(201).JSON(fiber.Map{"status": "success", "data": student})
}

// AdminUpdateStudent updates an existing student's data
func AdminUpdateStudent(c *fiber.Ctx) error {
	id := c.Params("id")
	var student models.Student
	if err := config.DB.First(&student, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Mahasiswa tidak ditemukan"})
	}

	// Use Map or separate struct to avoid overwriting UserID to 0
	var updateData map[string]interface{}
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	// Manual mapping for safety
	if val, ok := updateData["name"].(string); ok { student.Name = val }
	if val, ok := updateData["nim"].(string); ok { student.NIM = val }
	if val, ok := updateData["majorId"].(float64); ok { student.MajorID = uint(val) }
	if val, ok := updateData["entryYear"].(float64); ok { student.EntryYear = int(val) }
	if val, ok := updateData["gpa"].(float64); ok { student.GPA = val }
	if val, ok := updateData["status"].(string); ok { student.Status = val }

	if err := config.DB.Save(&student).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui data: " + err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "data": student})
}

// AdminDeleteStudent removes a student from the system
func AdminDeleteStudent(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Student{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus mahasiswa"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Mahasiswa berhasil dihapus"})
}

// GetAllMajors returns all study programs for dropdown selection
func GetAllMajors(c *fiber.Ctx) error {
	var majors []models.Major
	if err := config.DB.Preload("Faculty").Find(&majors).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": majors})
}

// ADMIN / USER MANAGEMENT (RBAC)

// GetAllUsers returns all administrative users
func GetAllUsers(c *fiber.Ctx) error {
	var users []models.User
	if err := config.DB.Preload("Role").Preload("Faculty").Find(&users).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": users})
}

// GetAllRoles returns all available roles
func GetAllRoles(c *fiber.Ctx) error {
	var roles []models.Role
	if err := config.DB.Find(&roles).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": roles})
}

// CreateUser handles creating a new admin/staff user
func CreateUser(c *fiber.Ctx) error {
	type Request struct {
		Email     string `json:"email"`
		Password  string `json:"password"`
		RoleID    uint   `json:"roleId"`
		FacultyID *uint  `json:"facultyId"`
		IsActive  bool   `json:"isActive"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	// Encrypt password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengenkripsi password"})
	}

	user := models.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		RoleID:       req.RoleID,
		FacultyID:    req.FacultyID,
		IsActive:     req.IsActive,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal membuat user: " + err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{"status": "success", "data": user})
}

// UpdateUser handles updating user information or password
func UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "User tidak ditemukan"})
	}

	type Request struct {
		Email     string  `json:"email"`
		Password  *string `json:"password,omitempty"`
		RoleID    uint    `json:"roleId"`
		FacultyID *uint   `json:"facultyId"`
		IsActive  bool    `json:"isActive"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	user.Email = req.Email
	user.RoleID = req.RoleID
	user.FacultyID = req.FacultyID
	user.IsActive = req.IsActive

	if req.Password != nil && *req.Password != "" {
		hashed, _ := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		user.PasswordHash = string(hashed)
	}

	config.DB.Save(&user)
	return c.JSON(fiber.Map{"status": "success", "data": user})
}

// DeleteUser removes a user
func DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.User{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus user"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "User berhasil dihapus"})
}

// GetAllOrmawas returns all organizations across the university
func GetAllOrmawas(c *fiber.Ctx) error {
	var ormawas []models.Ormawa
	if err := config.DB.Preload("Faculty").Find(&ormawas).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": ormawas})
}

// GetFacultiesWithStats returns a list of all faculties with their metadata and member counts
func GetFacultiesWithStats(c *fiber.Ctx) error {
	type FacultyResult struct {
		ID            uint   `json:"id"`
		Name          string `json:"name"`
		Code          string `json:"code"`
		DeanName      string `json:"deanName"`
		TotalStudents int64  `json:"totalStudents"`
		TotalProdi    int64  `json:"totalProdi"`
		Status        string `json:"status"` // Placeholder for UI
	}

	var results []FacultyResult

	log.Println("[SuperAdmin] Fetching faculties with stats...")

	// Use RAW SQL to get counts efficiently
	config.DB.Raw(`
		SELECT 
			f.id,
			f.nama_fakultas as name,
			f.kode_fakultas as code,
			f.dekan as dean_name,
			(SELECT COUNT(*) FROM program_studi WHERE fakultas_id = f.id) as total_prodi,
			(SELECT COUNT(*) FROM mahasiswa m JOIN program_studi p ON m.prodi_id = p.id WHERE p.fakultas_id = f.id) as total_students,
			'Aktif' as status
		FROM fakultas f
		ORDER BY f.id ASC
	`).Scan(&results)

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   results,
	})
}

// GetAllLecturersWithStats returns the master list of lecturers with affiliation details
func GetAllLecturersWithStats(c *fiber.Ctx) error {
	var lecturers []models.Lecturer
	if err := config.DB.Preload("Faculty").Preload("Major").Preload("User").Find(&lecturers).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": lecturers})
}

// AdminCreateLecturer registers a new lecturer
func AdminCreateLecturer(c *fiber.Ctx) error {
	type Request struct {
		Name      string `json:"name"`
		NIDN      string `json:"nidn"`
		FacultyID uint   `json:"facultyId"`
		MajorID   uint   `json:"majorId"`
		Jabatan   string `json:"jabatan"`
		Email     string `json:"email"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	// Create user account for lecturer
	var user models.User
	hash, _ := bcrypt.GenerateFromPassword([]byte("dosen123"), bcrypt.DefaultCost)
	
	// Check if role exists
	var role models.Role
	config.DB.Where("nama_peran = ?", "FacultyAdmin").First(&role) // Default to FacultyAdmin or similar if needed

	user = models.User{
		Email:        req.Email,
		PasswordHash: string(hash),
		RoleID:       role.ID,
		FacultyID:    &req.FacultyID,
		IsActive:     true,
	}
	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal membuat akun user dosen: " + err.Error()})
	}

	lecturer := models.Lecturer{
		UserID:    user.ID,
		NIDN:      req.NIDN,
		Name:      req.Name,
		FacultyID: req.FacultyID,
		MajorID:   req.MajorID,
		Jabatan:   req.Jabatan,
	}

	if err := config.DB.Create(&lecturer).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mendaftarkan dosen"})
	}

	return c.Status(201).JSON(fiber.Map{"status": "success", "data": lecturer})
}

// AdminUpdateLecturer updates lecturer data
func AdminUpdateLecturer(c *fiber.Ctx) error {
	id := c.Params("id")
	var lecturer models.Lecturer
	if err := config.DB.First(&lecturer, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Dosen tidak ditemukan"})
	}

	type Request struct {
		Name      string `json:"name"`
		NIDN      string `json:"nidn"`
		FacultyID uint   `json:"facultyId"`
		MajorID   uint   `json:"majorId"`
		Jabatan   string `json:"jabatan"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	lecturer.Name = req.Name
	lecturer.NIDN = req.NIDN
	lecturer.FacultyID = req.FacultyID
	lecturer.MajorID = req.MajorID
	lecturer.Jabatan = req.Jabatan

	if err := config.DB.Save(&lecturer).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui data dosen: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": lecturer})
}

// AdminDeleteLecturer removes a lecturer from the system
func AdminDeleteLecturer(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Lecturer{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus dosen"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Dosen berhasil dihapus"})
}

// GetAllOrmawasWithStats returns all organizations with their affiliation details
func GetAllOrmawasWithStats(c *fiber.Ctx) error {
	var ormawas []models.Ormawa
	if err := config.DB.Preload("Faculty").Find(&ormawas).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": ormawas})
}

// CreateOrmawa handles new organization registration
func CreateOrmawa(c *fiber.Ctx) error {
	var ormawa models.Ormawa
	if err := c.BodyParser(&ormawa); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}
	if err := config.DB.Create(&ormawa).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mendaftarkan ormawa"})
	}
	return c.Status(201).JSON(fiber.Map{"status": "success", "data": ormawa})
}

// UpdateOrmawa updates an existing organization
func UpdateOrmawa(c *fiber.Ctx) error {
	id := c.Params("id")
	var ormawa models.Ormawa
	if err := config.DB.First(&ormawa, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Ormawa tidak ditemukan"})
	}
	if err := c.BodyParser(&ormawa); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}
	config.DB.Save(&ormawa)
	return c.JSON(fiber.Map{"status": "success", "data": ormawa})
}

// DeleteOrmawa removes an organization
func DeleteOrmawa(c *fiber.Ctx) error {
	id := c.Params("id")
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Delete associated data
		tx.Where("ormawa_id = ?", id).Delete(&models.Proposal{})
		tx.Where("ormawa_id = ?", id).Delete(&models.OrmawaMember{})
		tx.Where("ormawa_id = ?", id).Delete(&models.CashMutation{})
		tx.Where("ormawa_id = ?", id).Delete(&models.OrmawaNotification{})
		
		// 2. Delete the Ormawa
		if err := tx.Delete(&models.Ormawa{}, id).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus ormawa: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Ormawa berhasil dihapus beserta seluruh datanya"})
}

// GetScholarshipSummary returns high-level scholarship metrics
func GetScholarshipSummary(c *fiber.Ctx) error {
	var summary struct {
		TotalPrograms   int64 `json:"totalPrograms"`
		TotalApplicants int64 `json:"totalApplicants"`
		TotalAccepted   int64 `json:"totalAccepted"`
		TotalQuota      int64 `json:"totalQuota"`
	}

	config.DB.Model(&models.Beasiswa{}).Count(&summary.TotalPrograms)
	config.DB.Model(&models.PengajuanBeasiswa{}).Count(&summary.TotalApplicants)
	config.DB.Model(&models.PengajuanBeasiswa{}).Where("status = ?", "diterima").Count(&summary.TotalAccepted)
	
	var totalQuota int64
	config.DB.Model(&models.Beasiswa{}).Select("COALESCE(SUM(kuota), 0)").Scan(&totalQuota)
	summary.TotalQuota = totalQuota

	return c.JSON(fiber.Map{"status": "success", "data": summary})
}

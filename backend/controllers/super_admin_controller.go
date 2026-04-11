package controllers

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func GetUsers(c *fiber.Ctx) error {
	fmt.Println(">>> RBAC: Fetching all users via RAW SQL...")
	var users []models.User
	result := config.DB.Raw("SELECT id, email, role, fakultas_id, created_at, updated_at FROM public.users WHERE deleted_at IS NULL").Scan(&users)
	if result.Error != nil {
		fmt.Printf(">>> RAW SQL Error: %v\n", result.Error)
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal mengambil data user dari database",
			"debug":   result.Error.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   users,
	})
}

// UpdateUserRole handles role assignment and logs the event in log_aktivitas
func UpdateUserRole(c *fiber.Ctx) error {
	type UpdateRequest struct {
		UserID uint   `json:"userId"`
		Role   string `json:"role"`
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		fmt.Printf(">>> RBAC Error: BodyParser failed: %v\n", err)
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request payload"})
	}
	fmt.Printf(">>> RBAC: Updating User %d to Role %s\n", req.UserID, req.Role)

	// 1. Find user to be modified
	var user models.User
	if err := config.DB.First(&user, req.UserID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "User not found"})
	}

	// 2. Execution with User Update
	err := config.DB.Transaction(func(tx *gorm.DB) error {

		// Update user role via raw SQL to bypass any GORM association issues
		if err := tx.Exec("UPDATE public.users SET role = ?, updated_at = ? WHERE id = ?", req.Role, time.Now(), user.ID).Error; err != nil {
			return err
		}

		// Log activity (Temporarily disabled until schema fix)
		/*
			logEntry := models.LogAktivitas{
				UserID:    user.ID,
				Aktivitas: "UPDATE_USER_ROLE",
				Deskripsi: fmt.Sprintf("Changed role from '%s' to '%s'. IP: %s", oldRole, req.Role, c.IP()),
				IPAddress: c.IP(),
			}
			if err := tx.Create(&logEntry).Error; err != nil {
				return err
			}
		*/

		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Critical failure during role update",
			"debug":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Institutional role has been successfully updated",
		"data": fiber.Map{
			"user":     user.Email,
			"new_role": req.Role,
		},
	})
}

// GetAuditLogs returns all historical actions performed in the system
func GetAuditLogs(c *fiber.Ctx) error {
	var logs []models.LogAktivitas
	result := config.DB.Preload("User").Order("created_at desc").Limit(100).Find(&logs)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Database error retrieving logs"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": logs})
}

func CreateUser(c *fiber.Ctx) error {
	type CreateRequest struct {
		Email    string `json:"Email"`
		Password string `json:"Password"`
		Role     string `json:"Role"`
	}
	var req CreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request"})
	}

	// Use BCrypt to hash the password before saving
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to hash password"})
	}

	user := models.User{
		Email:    req.Email,
		Password: string(hashedPassword),
		Role:     req.Role,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to create user"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": user})
}

func DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.User{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to delete user"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "User deleted"})
}

// GetDashboardStats returns high-level metrics for University oversight
func GetDashboardStats(c *fiber.Ctx) error {
	var totalMhs int64
	var aspirasiAktif int64
	var slaOverdue int64
	var resolvedToday int64
	var antreanProposal int64
	var totalAnggotaOrmawa int64

	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	config.DB.Model(&models.Mahasiswa{}).Count(&totalMhs)
	config.DB.Model(&models.Aspirasi{}).Where("status != ?", "Selesai").Count(&aspirasiAktif)
	config.DB.Model(&models.Aspirasi{}).Where("status != ? AND deadline < ?", "Selesai", now).Count(&slaOverdue)
	config.DB.Model(&models.Aspirasi{}).Where("status = ? AND updated_at >= ?", "Selesai", todayStart).Count(&resolvedToday)
	config.DB.Model(&models.Proposal{}).Where("status = ?", "disetujui_fakultas").Count(&antreanProposal)
	config.DB.Model(&models.OrmawaAnggota{}).Count(&totalAnggotaOrmawa)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"total_mahasiswa":      totalMhs,
			"aspirasi_aktif":       aspirasiAktif,
			"sla_overdue":          slaOverdue,
			"resolved_today":       resolvedToday,
			"antrean_proposal":     antreanProposal,
			"total_anggota_ormawa": totalAnggotaOrmawa,
		},
	})
}

// GetGlobalProposals returns proposals waiting for university approval
func GetGlobalProposals(c *fiber.Ctx) error {
	var proposals []models.Proposal
	result := config.DB.Preload("Ormawa").Preload("Fakultas").Where("status = ?", "disetujui_fakultas").Order("created_at desc").Find(&proposals)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": result.Error.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": proposals})
}

// ApproveProposalUniv final approval by university
func ApproveProposalUniv(c *fiber.Ctx) error {
	id := c.Params("id")
	var proposal models.Proposal
	if err := config.DB.First(&proposal, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Proposal not found"})
	}

	proposal.Status = "disetujui_univ"
	config.DB.Save(&proposal)

	return c.JSON(fiber.Map{"status": "success", "message": "Proposal has been officially approved by University"})
}

// RejectProposalUniv rejection with note
func RejectProposalUniv(c *fiber.Ctx) error {
	id := c.Params("id")
	type RejectReq struct {
		Catatan string `json:"catatan"`
	}
	var req RejectReq
	c.BodyParser(&req)

	var proposal models.Proposal
	if err := config.DB.First(&proposal, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Proposal not found"})
	}

	proposal.Status = "ditolak"
	proposal.Catatan = req.Catatan
	config.DB.Save(&proposal)

	return c.JSON(fiber.Map{"status": "success", "message": "Proposal has been rejected"})
}

// GetAllFakultas master data
func GetAllFakultas(c *fiber.Ctx) error {
	var faks []models.Fakultas
	config.DB.Preload("ProgramStudi").Find(&faks)

	type FacultyWithCount struct {
		models.Fakultas
		JumlahProdi int `json:"jumlah_prodi"`
	}

	var result []FacultyWithCount
	for _, f := range faks {
		result = append(result, FacultyWithCount{
			Fakultas:    f,
			JumlahProdi: len(f.ProgramStudi),
		})
	}

	return c.JSON(fiber.Map{"status": "success", "data": result})
}

func CreateFakultas(c *fiber.Ctx) error {
	var fak models.Fakultas
	if err := c.BodyParser(&fak); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	if err := config.DB.Create(&fak).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": fak})
}

func UpdateFakultas(c *fiber.Ctx) error {
	id := c.Params("id")
	var fak models.Fakultas
	if err := config.DB.First(&fak, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Fakultas not found"})
	}
	c.BodyParser(&fak)
	config.DB.Save(&fak)
	return c.JSON(fiber.Map{"status": "success", "data": fak})
}

func DeleteFakultas(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Fakultas{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Fakultas deleted"})
}

func GetAllOrmawa(c *fiber.Ctx) error {
	var orgs []struct {
		models.Ormawa
		JumlahAnggota int64 `json:"jumlah_anggota"`
	}

	var baseOrgs []models.Ormawa
	if err := config.DB.Order("nama asc").Find(&baseOrgs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	for _, o := range baseOrgs {
		var count int64
		config.DB.Model(&models.OrmawaAnggota{}).Where("ormawa_id = ?", o.ID).Count(&count)
		orgs = append(orgs, struct {
			models.Ormawa
			JumlahAnggota int64 `json:"jumlah_anggota"`
		}{o, count})
	}

	return c.JSON(fiber.Map{"status": "success", "data": orgs})
}

func GetAllStudents(c *fiber.Ctx) error {
	var mhs []models.Mahasiswa
	config.DB.Preload("Fakultas").Preload("ProgramStudi").Order("nama asc").Find(&mhs)
	return c.JSON(fiber.Map{"status": "success", "data": mhs})
}

func GetAllLecturers(c *fiber.Ctx) error {
	var lecturers []models.Dosen
	config.DB.Preload("Fakultas").Preload("ProgramStudi").Order("nama asc").Find(&lecturers)
	return c.JSON(fiber.Map{"status": "success", "data": lecturers})
}

func GetGlobalAspirations(c *fiber.Ctx) error {
	var asps []models.Aspirasi
	config.DB.Preload("Mahasiswa.Fakultas").Order("created_at desc").Find(&asps)
	return c.JSON(fiber.Map{"status": "success", "data": asps})
}

// Additional CRUD for Mahasiswa
func CreateStudent(c *fiber.Ctx) error {
	var mhs models.Mahasiswa
	if err := c.BodyParser(&mhs); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	// 1. Create User automatically
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		email := mhs.EmailKampus
		if email == "" {
			email = fmt.Sprintf("%s@bku.ac.id", mhs.NIM)
		}

		user := models.User{
			Email:    email,
			Password: "password123",
			Role:     "mahasiswa",
		}
		// 1. Create User first
		if err := tx.Create(&user).Error; err != nil {
			fmt.Printf("[DEBUG] User creation failed: %v\n", err)
			return err
		}

		// DOUBLE CHECK: Pastikan ID user tidak nol
		if user.ID == 0 {
			return fmt.Errorf("failed to retrieve new User ID after insertion")
		}

		fmt.Printf("[DEBUG] User created with ID: %d\n", user.ID)

		// 2. Prepare Mahasiswa data
		mhs.PenggunaID = user.ID
		mhs.Pengguna = user // Beritahu GORM ini user-nya
		mhs.SemesterSekarang = 1
		mhs.StatusAkun = "Aktif"

		// 3. Create Mahasiswa
		if err := tx.Omit("Pengguna").Create(&mhs).Error; err != nil {
			fmt.Printf("[DEBUG] Mahasiswa creation failed: %v\n", err)
			return err
		}
		return nil
	})

	if err != nil {
		fmt.Printf("Error CreateStudent: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal simpan: " + err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "data": mhs, "message": "Mahasiswa berhasil dibuat"})
}

func UpdateStudent(c *fiber.Ctx) error {
	id := c.Params("id")
	var mhs models.Mahasiswa
	if err := config.DB.First(&mhs, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Mahasiswa not found"})
	}
	if err := c.BodyParser(&mhs); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Save(&mhs)
	return c.JSON(fiber.Map{"status": "success", "data": mhs})
}

func DeleteStudent(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Mahasiswa{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Mahasiswa deleted"})
}

func GetAllProgramStudi(c *fiber.Ctx) error {
	var prodis []models.ProgramStudi
	config.DB.Preload("Fakultas").Find(&prodis)
	return c.JSON(fiber.Map{"status": "success", "data": prodis})
}

func CreateProgramStudi(c *fiber.Ctx) error {
	var prodi models.ProgramStudi
	if err := c.BodyParser(&prodi); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	if err := config.DB.Create(&prodi).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": prodi})
}

func UpdateProgramStudi(c *fiber.Ctx) error {
	id := c.Params("id")
	var prodi models.ProgramStudi
	if err := config.DB.First(&prodi, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Program Studi not found"})
	}
	c.BodyParser(&prodi)
	config.DB.Save(&prodi)
	return c.JSON(fiber.Map{"status": "success", "data": prodi})
}

func DeleteProgramStudi(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.ProgramStudi{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Program Studi deleted"})
}

// Scholarship Handlers
func GetAllScholarships(c *fiber.Ctx) error {
	var list []models.Beasiswa
	config.DB.Find(&list)

	// Manual mapping to PascalCase for Frontend compatibility without changing the model
	var mappedList []map[string]interface{}
	for _, b := range list {
		m := map[string]interface{}{
			"ID":            b.ID,
			"Nama":          b.Nama,
			"Penyelenggara": b.Penyelenggara,
			"Deskripsi":     b.Deskripsi,
			"Deadline":      b.Deadline,
			"Kuota":         b.Kuota,
			"IPKMin":        b.IPKMin,
			"Anggaran":      b.Anggaran, // Capitalized for Frontend
			"CreatedAt":     b.CreatedAt,
		}
		mappedList = append(mappedList, m)
	}

	return c.JSON(fiber.Map{"status": "success", "data": mappedList})
}

func CreateScholarship(c *fiber.Ctx) error {
	var payload struct {
		Nama          string  `json:"Nama"`
		Penyelenggara string  `json:"Penyelenggara"`
		Deskripsi     string  `json:"Deskripsi"`
		Deadline      string  `json:"Deadline"`
		Kuota         int     `json:"Kuota"`
		IPKMin        float64 `json:"IPKMin"`
		Anggaran      float64 `json:"Anggaran"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	dead, _ := time.Parse(time.RFC3339, payload.Deadline)

	err := config.DB.Exec("INSERT INTO mahasiswa.beasiswa (nama, penyelenggara, deskripsi, deadline, kuota, ip_k_min, anggaran, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		payload.Nama, payload.Penyelenggara, payload.Deskripsi, dead, payload.Kuota, payload.IPKMin, payload.Anggaran, time.Now(), time.Now()).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Beasiswa created"})
}

func UpdateScholarship(c *fiber.Ctx) error {
	id := c.Params("id")
	var payload struct {
		Nama          string  `json:"Nama"`
		Penyelenggara string  `json:"Penyelenggara"`
		Deskripsi     string  `json:"Deskripsi"`
		Deadline      string  `json:"Deadline"`
		Kuota         int     `json:"Kuota"`
		IPKMin        float64 `json:"IPKMin"`
		Anggaran      float64 `json:"Anggaran"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	dead, _ := time.Parse(time.RFC3339, payload.Deadline)

	err := config.DB.Exec("UPDATE mahasiswa.beasiswa SET nama = ?, penyelenggara = ?, deskripsi = ?, deadline = ?, kuota = ?, ip_k_min = ?, anggaran = ?, updated_at = ? WHERE id = ?",
		payload.Nama, payload.Penyelenggara, payload.Deskripsi, dead, payload.Kuota, payload.IPKMin, payload.Anggaran, time.Now(), id).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Beasiswa updated"})
}

func DeleteScholarship(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Beasiswa{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

// Counseling Handlers
func GetAllCounseling(c *fiber.Ctx) error {
	var list []models.Konseling
	if err := config.DB.Preload("Mahasiswa").Preload("Dosen").Find(&list).Error; err != nil {
		fmt.Printf("Database Error (GetAllCounseling): %v\n", err)
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal mengambil data: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func CreateCounseling(c *fiber.Ctx) error {
	var data models.Konseling
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request"})
	}
	// Omit associations to prevent GORM from trying to insert them again
	if err := config.DB.Omit("Mahasiswa", "Dosen").Create(&data).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": data})
}

func UpdateCounseling(c *fiber.Ctx) error {
	id := c.Params("id")
	var data models.Konseling
	if err := config.DB.First(&data, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not found"})
	}
	c.BodyParser(&data)
	if err := config.DB.Omit("Mahasiswa", "Dosen").Save(&data).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": data})
}

func DeleteCounseling(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Konseling{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

func CreateOrmawa(c *fiber.Ctx) error {
	var payload struct {
		Nama      string `json:"Nama"`
		Singkatan string `json:"Singkatan"`
		Deskripsi string `json:"Deskripsi"`
		Visi      string `json:"Visi"`
		Misi      string `json:"Misi"`
		Email     string `json:"Email"`
		Phone     string `json:"Phone"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid payload"})
	}

	err := config.DB.Exec("INSERT INTO ormawa.ormawa (nama, singkatan, deskripsi, visi, misi, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		payload.Nama, payload.Singkatan, payload.Deskripsi, payload.Visi, payload.Misi, payload.Email, payload.Phone, time.Now(), time.Now()).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Ormawa created successfully"})
}

func UpdateOrmawa(c *fiber.Ctx) error {
	id := c.Params("id")
	var payload struct {
		Nama      string `json:"Nama"`
		Singkatan string `json:"Singkatan"`
		Deskripsi string `json:"Deskripsi"`
		Visi      string `json:"Visi"`
		Misi      string `json:"Misi"`
		Email     string `json:"Email"`
		Phone     string `json:"Phone"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid payload"})
	}

	err := config.DB.Exec("UPDATE ormawa.ormawa SET nama = ?, singkatan = ?, deskripsi = ?, visi = ?, misi = ?, email = ?, phone = ?, updated_at = ? WHERE id = ?",
		payload.Nama, payload.Singkatan, payload.Deskripsi, payload.Visi, payload.Misi, payload.Email, payload.Phone, time.Now(), id).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Ormawa updated successfully"})
}

func DeleteOrmawa(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Ormawa{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Ormawa deleted"})
}
func CreateLecturer(c *fiber.Ctx) error {
	var lec models.Dosen
	if err := c.BodyParser(&lec); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		user := models.User{
			Email:    lec.Email,
			Password: "password123",
			Role:     "dosen",
		}

		if user.Email == "" {
			user.Email = fmt.Sprintf("%s@dosen.siakad.com", lec.NIDN)
		}

		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		if user.ID == 0 {
			return fmt.Errorf("failed to generate user ID for lecturer")
		}

		lec.PenggunaID = user.ID
		if err := tx.Create(&lec).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal integrasi akun dosen: " + err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "data": lec})
}

func UpdateLecturer(c *fiber.Ctx) error {
	id := c.Params("id")
	var lec models.Dosen
	if err := config.DB.First(&lec, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Dosen not found"})
	}
	if err := c.BodyParser(&lec); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Save(&lec)
	return c.JSON(fiber.Map{"status": "success", "data": lec})
}

func DeleteLecturer(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Dosen{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Dosen deleted"})
}

// News Handlers
func GetAllNews(c *fiber.Ctx) error {
	var list []models.Berita
	config.DB.Order("tanggal_publish desc").Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func CreateNews(c *fiber.Ctx) error {
	var b models.Berita
	if err := c.BodyParser(&b); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	b.TanggalPublish = time.Now()
	if err := config.DB.Create(&b).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": b})
}

func UpdateNews(c *fiber.Ctx) error {
	id := c.Params("id")
	var b models.Berita
	if err := config.DB.First(&b, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Berita tidak ditemukan"})
	}
	if err := c.BodyParser(&b); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Save(&b)
	return c.JSON(fiber.Map{"status": "success", "data": b})
}

func DeleteNews(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Berita{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Berita dihapus"})
}

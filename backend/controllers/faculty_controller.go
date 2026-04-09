package controllers

import (
	"fmt"
	"time"
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

// GetLecturers returns all lecturers
func GetLecturers(c *fiber.Ctx) error {
	var lecturers []models.Lecturer
	if err := config.DB.Debug().Preload("User").Preload("Faculty").Find(&lecturers).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": lecturers})
}

// GetLecturerByID returns a single lecturer by ID
func GetLecturerByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var lecturer models.Lecturer
	if err := config.DB.Preload("User").Preload("Faculty").First(&lecturer, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Dosen tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": lecturer})
}

// CreateLecturer handles new lecturer registration
func CreateLecturer(c *fiber.Ctx) error {
	type RequestBody struct {
		Email     string `json:"email"`
		Password  string `json:"password"`
		NIDN      string `json:"nidn"`
		Name      string `json:"name"`
		FacultyID uint   `json:"facultyId"`
		IsDPA     bool   `json:"isDpa"`
	}

	var body RequestBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	// Check if Email already exists
	var existingUser models.User
	if err := config.DB.Where("email = ?", body.Email).First(&existingUser).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Email '" + body.Email + "' sudah digunakan"})
	}

	// Check if NIDN already exists (only if provided)
	if body.NIDN != "" {
		var existingLecturer models.Lecturer
		if err := config.DB.Where("nidn = ?", body.NIDN).First(&existingLecturer).Error; err == nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "NIDN '" + body.NIDN + "' sudah terdaftar"})
		}
	}

	// Start Transaction
	tx := config.DB.Begin()

	// 1. Create User
	user := models.User{
		Email:        body.Email,
		PasswordHash: "$2a$10$r9C799sXvD8/Zk9m6p.hQ.m7I8WjKz.Y1vS/F1f7nI.Z1f7nI.Z1", // Default 'password123'
		RoleID:       3,                                                             // Lecturer role (assuming 3)
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to create user account: " + err.Error()})
	}

	// 2. Create Lecturer
	lecturer := models.Lecturer{
		UserID:    user.ID,
		NIDN:      body.NIDN,
		Name:      body.Name,
		FacultyID: body.FacultyID,
		IsDPA:     body.IsDPA,
	}

	if err := tx.Create(&lecturer).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to create lecturer profile: " + err.Error()})
	}

	// Commit Transaction
	tx.Commit()

	return c.Status(201).JSON(fiber.Map{"status": "success", "message": "Dosen berhasil ditambahkan", "data": lecturer})
}

// UpdateLecturer updates lecturer information
func UpdateLecturer(c *fiber.Ctx) error {
	id := c.Params("id")
	var lecturer models.Lecturer
	if err := config.DB.Preload("User").First(&lecturer, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Dosen tidak ditemukan"})
	}

	type UpdateBody struct {
		Name      string `json:"name"`
		NIDN      string `json:"nidn"`
		Email     string `json:"email"`
		FacultyID uint   `json:"facultyId"`
		IsDPA     bool   `json:"isDpa"`
	}

	var body UpdateBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	lecturer.Name = body.Name
	lecturer.NIDN = body.NIDN
	lecturer.FacultyID = body.FacultyID
	lecturer.IsDPA = body.IsDPA

	// Update User email if changed
	if lecturer.User.ID != 0 && body.Email != "" && body.Email != lecturer.User.Email {
		lecturer.User.Email = body.Email
		config.DB.Save(&lecturer.User)
	}

	if err := config.DB.Save(&lecturer).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengupdate data dosen"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Data dosen berhasil diupdate", "data": lecturer})
}

// DeleteLecturer removes a lecturer and their user account
func DeleteLecturer(c *fiber.Ctx) error {
	id := c.Params("id")
	var lecturer models.Lecturer
	if err := config.DB.First(&lecturer, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Dosen tidak ditemukan"})
	}

	userID := lecturer.UserID
	config.DB.Delete(&lecturer)
	config.DB.Delete(&models.User{}, userID)

	return c.JSON(fiber.Map{"status": "success", "message": "Dosen berhasil dihapus"})
}

// GetStudents returns all students
func GetStudents(c *fiber.Ctx) error {
	var students []models.Student
	if err := config.DB.Debug().Preload("User").Preload("Major").Preload("DPALecturer").Find(&students).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": students})
}

// GetStudentByID returns a single student by ID
func GetStudentByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var student models.Student
	if err := config.DB.Preload("User").Preload("Major").Preload("DPALecturer").First(&student, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Mahasiswa tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": student})
}

// CreateStudent handles new student registration
func CreateStudent(c *fiber.Ctx) error {
	type RequestBody struct {
		Email           string `json:"email"`
		Password        string `json:"password"`
		NIM             string `json:"nim"`
		Name            string `json:"name"`
		MajorID         uint   `json:"majorId"`
		DPALecturerID   uint   `json:"dpaLecturerId"`
		CurrentSemester int    `json:"currentSemester"`
	}

	var body RequestBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	// Check if Email already exists
	var existingUser models.User
	if err := config.DB.Where("email = ?", body.Email).First(&existingUser).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Email '" + body.Email + "' sudah digunakan"})
	}

	// Check if NIM already exists
	var existingStudent models.Student
	if err := config.DB.Where("nim = ?", body.NIM).First(&existingStudent).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "NIM '" + body.NIM + "' sudah terdaftar"})
	}

	// Start Transaction
	tx := config.DB.Begin()

	// 1. Create User
	user := models.User{
		Email:        body.Email,
		PasswordHash: "$2a$10$r9C799sXvD8/Zk9m6p.hQ.m7I8WjKz.Y1vS/F1f7nI.Z1f7nI.Z1", // Default 'password123'
		RoleID:       4,                                                             // Student role
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to create user: " + err.Error()})
	}

	// 2. Create Student
	student := models.Student{
		UserID:          user.ID,
		NIM:             body.NIM,
		Name:            body.Name,
		MajorID:         body.MajorID,
		CurrentSemester: body.CurrentSemester,
		Status:          "active",
	}

	if body.DPALecturerID != 0 {
		student.DPALecturerID = &body.DPALecturerID
	}

	if err := tx.Create(&student).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to create student: " + err.Error()})
	}

	// Commit Transaction
	tx.Commit()

	return c.Status(201).JSON(fiber.Map{"status": "success", "message": "Student created successfully", "data": student})
}

// UpdateStudent updates student information
func UpdateStudent(c *fiber.Ctx) error {
	id := c.Params("id")
	var student models.Student
	if err := config.DB.Preload("User").First(&student, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Student not found"})
	}

	type UpdateBody struct {
		Name            string `json:"name"`
		Email           string `json:"email"`
		NIM             string `json:"nim"`
		MajorID         uint   `json:"majorId"`
		DPALecturerID   uint   `json:"dpaLecturerId"`
		CurrentSemester int    `json:"semester"`
		Status          string `json:"status"`
	}

	var body UpdateBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	student.Name = body.Name
	student.NIM = body.NIM
	student.MajorID = body.MajorID
	student.CurrentSemester = body.CurrentSemester
	student.Status = body.Status

	if body.DPALecturerID != 0 {
		student.DPALecturerID = &body.DPALecturerID
	} else {
		student.DPALecturerID = nil
	}

	// Update User email
	if student.User.ID != 0 && body.Email != "" && body.Email != student.User.Email {
		student.User.Email = body.Email
		config.DB.Save(&student.User)
	}

	if err := config.DB.Save(&student).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to update student"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Student updated successfully", "data": student})
}

// DeleteStudent removes a student and their user account
func DeleteStudent(c *fiber.Ctx) error {
	id := c.Params("id")
	var student models.Student
	if err := config.DB.First(&student, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Mahasiswa tidak ditemukan"})
	}

	tx := config.DB.Begin()

	// 1. Delete student (this might fail if foreign key constraints are violated)
	if err := tx.Delete(&student).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"status": "error", 
			"message": "Gagal menghapus mahasiswa. Pastikan semua data terkait (KRS, Prestasi, Beasiswa, dll) sudah dibersihkan atau coba lagi. Detail: " + err.Error(),
		})
	}

	// 2. Delete user account
	if err := tx.Delete(&models.User{}, student.UserID).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus akun user mahasiswa: " + err.Error()})
	}

	tx.Commit()

	return c.JSON(fiber.Map{"status": "success", "message": "Mahasiswa dan akun berhasil dihapus"})
}

// GetCourses returns all subjects
func GetCourses(c *fiber.Ctx) error {
	var courses []models.Matakuliah
	if err := config.DB.Find(&courses).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": courses})
}

// GetRooms returns all classrooms
func GetRooms(c *fiber.Ctx) error {
	var rooms []models.Ruangan
	if err := config.DB.Find(&rooms).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": rooms})
}

// GetSchedules returns all weekly class schedules with relations
func GetSchedules(c *fiber.Ctx) error {
	var schedules []models.FacultySchedule
	if err := config.DB.Preload("Course").Preload("Lecturer").Preload("Room").Find(&schedules).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": schedules})
}

// CreateSchedule adds a new class schedule with conflict checking
func CreateSchedule(c *fiber.Ctx) error {
	var schedule models.FacultySchedule
	if err := c.BodyParser(&schedule); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format request tidak valid"})
	}

	// 1. Check for Room Conflict
	var conflict models.FacultySchedule
	if err := config.DB.Where("hari = ? AND ruangan_id = ? AND jam_mulai < ? AND jam_selesai > ?", 
		schedule.Hari, schedule.RoomID, schedule.JamSelesai, schedule.JamMulai).First(&conflict).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{
			"status": "error", 
			"message": fmt.Sprintf("Ruangan sudah terpakai pada %s jam %s - %s", conflict.Hari, conflict.JamMulai, conflict.JamSelesai),
		})
	}

	// 2. Check for Lecturer Conflict
	var lConflict models.FacultySchedule
	if err := config.DB.Where("hari = ? AND dosen_id = ? AND jam_mulai < ? AND jam_selesai > ?", 
		schedule.Hari, schedule.LecturerID, schedule.JamSelesai, schedule.JamMulai).First(&lConflict).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{
			"status": "error", 
			"message": fmt.Sprintf("Dosen sudah memiliki jadwal lain pada %s jam %s - %s", lConflict.Hari, lConflict.JamMulai, lConflict.JamSelesai),
		})
	}

	if err := config.DB.Create(&schedule).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menambahkan jadwal"})
	}

	config.DB.Preload("Course").Preload("Lecturer").Preload("Room").First(&schedule, schedule.ID)
	return c.Status(201).JSON(fiber.Map{"status": "success", "data": schedule})
}

// UpdateSchedule updates an existing class schedule with conflict checking
func UpdateSchedule(c *fiber.Ctx) error {
	id := c.Params("id")
	var schedule models.FacultySchedule
	if err := config.DB.First(&schedule, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Jadwal tidak ditemukan"})
	}

	if err := c.BodyParser(&schedule); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format request tidak valid"})
	}

	// 1. Check for Room Conflict (excluding self)
	var conflict models.FacultySchedule
	if err := config.DB.Where("id != ? AND hari = ? AND ruangan_id = ? AND jam_mulai < ? AND jam_selesai > ?", 
		id, schedule.Hari, schedule.RoomID, schedule.JamSelesai, schedule.JamMulai).First(&conflict).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{
			"status": "error", 
			"message": fmt.Sprintf("Ruangan sudah terpakai pada %s jam %s - %s", conflict.Hari, conflict.JamMulai, conflict.JamSelesai),
		})
	}

	// 2. Check for Lecturer Conflict (excluding self)
	var lConflict models.FacultySchedule
	if err := config.DB.Where("id != ? AND hari = ? AND dosen_id = ? AND jam_mulai < ? AND jam_selesai > ?", 
		id, schedule.Hari, schedule.LecturerID, schedule.JamSelesai, schedule.JamMulai).First(&lConflict).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{
			"status": "error", 
			"message": fmt.Sprintf("Dosen sudah memiliki jadwal lain pada %s jam %s - %s", lConflict.Hari, lConflict.JamMulai, lConflict.JamSelesai),
		})
	}

	if err := config.DB.Save(&schedule).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengupdate jadwal"})
	}

	config.DB.Preload("Course").Preload("Lecturer").Preload("Room").First(&schedule, schedule.ID)
	return c.JSON(fiber.Map{"status": "success", "data": schedule})
}

// DeleteSchedule removes a schedule
func DeleteSchedule(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.FacultySchedule{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus jadwal"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Jadwal berhasil dihapus"})
}

// GetDashboardSummary returns combined statistics for the faculty dashboard
func GetDashboardSummary(c *fiber.Ctx) error {
	var totalStudents int64
	var totalLecturers int64
	var totalCourses int64
	var activeSchedules int64

	config.DB.Model(&models.Student{}).Count(&totalStudents)
	config.DB.Model(&models.Lecturer{}).Count(&totalLecturers)
	config.DB.Model(&models.Matakuliah{}).Count(&totalCourses)
	config.DB.Model(&models.FacultySchedule{}).Count(&activeSchedules)

	// Fetch recent schedules for the dashboard
	var recentSchedules []models.FacultySchedule
	config.DB.Preload("Course").Preload("Lecturer").Preload("Room").Limit(4).Find(&recentSchedules)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"totalStudents":   totalStudents,
			"totalLecturers":  totalLecturers,
			"totalCourses":    totalCourses,
			"activeSchedules": activeSchedules,
			"recentSchedules": recentSchedules,
		},
	})
}

// --- PROGRAM STUDI (MAJOR) CRUD ---

// GetMajors returns all majors enriched with stats from database
func GetMajors(c *fiber.Ctx) error {
	var majors []models.Major
	if err := config.DB.Preload("Faculty").Find(&majors).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal mengambil data program studi",
		})
	}

	type MajorEnriched struct {
		models.Major
		MahasiswaAktif int64 `json:"mahasiswaAktif"`
		MataKuliah     int64 `json:"mataKuliah"`
		DosenCount     int64 `json:"dosenCount"`
	}

	var enrichedList []MajorEnriched
	var totalStudents int64 = 0
	var totalCourses int64 = 0

	for _, m := range majors {
		var sCount int64
		var cCount int64
		var dCount int64
		config.DB.Model(&models.Student{}).Where("major_id = ?", m.ID).Count(&sCount)
		config.DB.Model(&models.Matakuliah{}).Where("major_id = ?", m.ID).Count(&cCount)
		config.DB.Model(&models.Lecturer{}).Where("faculty_id = ?", m.FacultyID).Count(&dCount)

		enrichedList = append(enrichedList, MajorEnriched{
			Major:          m,
			MahasiswaAktif: sCount,
			MataKuliah:     cCount,
			DosenCount:     dCount,
		})
		totalStudents += sCount
		totalCourses += cCount
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   enrichedList,
		"summary": fiber.Map{
			"totalStudents": totalStudents,
			"totalCourses":  totalCourses,
		},
	})
}

// GetMajorByID returns a single major by its primary key
func GetMajorByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var major models.Major
	if err := config.DB.Preload("Faculty").First(&major, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"status":  "error",
			"message": "Program studi tidak ditemukan",
		})
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   major,
	})
}

// CreateMajor handles the creation of a new Program Study
func CreateMajor(c *fiber.Ctx) error {
	type RequestBody struct {
		Name        string `json:"name"`
		Code        string `json:"code"`
		FacultyID   uint   `json:"facultyId"`
		DegreeLevel string `json:"degreeLevel"`
		Akreditasi  string `json:"akreditasi"`
		Kapasitas   int    `json:"kapasitas"`
	}

	var body RequestBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"status":  "error",
			"message": "Format request tidak valid",
		})
	}

	major := models.Major{
		Name:        body.Name,
		Code:        body.Code,
		FacultyID:   body.FacultyID,
		DegreeLevel: body.DegreeLevel,
		Akreditasi:  body.Akreditasi,
		Kapasitas:   body.Kapasitas,
	}

	if err := config.DB.Create(&major).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal menambahkan program studi",
		})
	}

	// Fetch the major with faculty for the response
	config.DB.Preload("Faculty").First(&major, major.ID)

	return c.Status(201).JSON(fiber.Map{
		"status":  "success",
		"message": "Program studi berhasil ditambahkan",
		"data":    major,
	})
}

// UpdateMajor updates an existing Program Study
func UpdateMajor(c *fiber.Ctx) error {
	id := c.Params("id")
	var major models.Major
	if err := config.DB.First(&major, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"status":  "error",
			"message": "Program studi tidak ditemukan",
		})
	}

	type RequestBody struct {
		Name        string `json:"name"`
		Code        string `json:"code"`
		FacultyID   uint   `json:"facultyId"`
		DegreeLevel string `json:"degreeLevel"`
		Akreditasi  string `json:"akreditasi"`
		Kapasitas   int    `json:"kapasitas"`
	}

	var body RequestBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"status":  "error",
			"message": "Format request tidak valid",
		})
	}

	major.Name = body.Name
	major.Code = body.Code
	major.FacultyID = body.FacultyID
	major.DegreeLevel = body.DegreeLevel
	major.Akreditasi = body.Akreditasi
	major.Kapasitas = body.Kapasitas

	if err := config.DB.Save(&major).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal mengupdate program studi",
		})
	}

	// Fetch the major with faculty for the response
	config.DB.Preload("Faculty").First(&major, major.ID)

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Program studi berhasil diupdate",
		"data":    major,
	})
}

// DeleteMajor deletes a Program Study from database
func DeleteMajor(c *fiber.Ctx) error {
	id := c.Params("id")
	var major models.Major
	if err := config.DB.First(&major, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"status":  "error",
			"message": "Program studi tidak ditemukan",
		})
	}

	if err := config.DB.Delete(&major).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal menghapus program studi",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Program studi berhasil dihapus",
	})
}

// GetFaculties returns all faculties (for select options)
func GetFaculties(c *fiber.Ctx) error {
	var faculties []models.Faculty
	if err := config.DB.Find(&faculties).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal mengambil data fakultas",
		})
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   faculties,
	})
}

// --- FAKULTAS (FACULTY) CRUD ---

// CreateFaculty handles the creation of a new Faculty
func CreateFaculty(c *fiber.Ctx) error {
	var faculty models.Faculty
	if err := c.BodyParser(&faculty); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"status":  "error",
			"message": "Format request tidak valid",
		})
	}

	if err := config.DB.Create(&faculty).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal menambahkan fakultas",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"status":  "success",
		"message": "Fakultas berhasil ditambahkan",
		"data":    faculty,
	})
}

// UpdateFaculty updates an existing Faculty
func UpdateFaculty(c *fiber.Ctx) error {
	id := c.Params("id")
	var faculty models.Faculty
	if err := config.DB.First(&faculty, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"status":  "error",
			"message": "Fakultas tidak ditemukan",
		})
	}

	if err := c.BodyParser(&faculty); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"status":  "error",
			"message": "Format request tidak valid",
		})
	}

	if err := config.DB.Save(&faculty).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal mengupdate fakultas",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Fakultas berhasil diupdate",
		"data":    faculty,
	})
}

// DeleteFaculty deletes a Faculty from database
func DeleteFaculty(c *fiber.Ctx) error {
	id := c.Params("id")
	var faculty models.Faculty
	if err := config.DB.First(&faculty, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"status":  "error",
			"message": "Fakultas tidak ditemukan",
		})
	}

	// Check if any majors still belong to this faculty
	var majorCount int64
	config.DB.Model(&models.Major{}).Where("faculty_id = ?", faculty.ID).Count(&majorCount)
	if majorCount > 0 {
		return c.Status(400).JSON(fiber.Map{
			"status":  "error",
			"message": "Tidak dapat menghapus fakultas yang masih memiliki program studi",
		})
	}

	if err := config.DB.Delete(&faculty).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal menghapus fakultas",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Fakultas berhasil dihapus",
	})
}

// --- KRS & PERWALIAN (ADVISORY) CRUD ---

// GetKRSSubmissions returns all KRS submissions with full associations.
func GetKRSSubmissions(c *fiber.Ctx) error {
	var submissions []models.KRSSubmission
	if err := config.DB.Debug().
		Preload("Student").
		Preload("Student.Major").
		Preload("Student.User").
		Preload("Items").
		Preload("Items.Course").
		Order("created_at DESC").
		Find(&submissions).Error; err != nil {
		fmt.Printf("GetKRSSubmissions Error: %v\n", err)
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"message": "Gagal mengambil data perwalian: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data": submissions,
	})
}

// GetKRSSubmissionByID returns a single krs submission detail
func GetKRSSubmissionByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var submission models.KRSSubmission
	if err := config.DB.
		Preload("Student").
		Preload("Student.Major").
		Preload("Student.User").
		Preload("Items").
		Preload("Items.Course").
		First(&submission, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"status": "error",
			"message": "Pengajuan KRS tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data": submission,
	})
}

// ValidateKRSSubmission approves or rejects a student's study plan
func ValidateKRSSubmission(c *fiber.Ctx) error {
	id := c.Params("id")
	type ValidationRequest struct {
		Status  string `json:"status"`  // "Disetujui" or "Ditolak"
		Remarks string `json:"remarks"` // optional
	}

	var req ValidationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	var submission models.KRSSubmission
	if err := config.DB.First(&submission, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "KRS Submission NOT FOUND"})
	}

	submission.Status = req.Status
	submission.Remarks = req.Remarks
	
	// Set validated time
	now := time.Now()
	submission.ValidatedAt = &now

	if err := config.DB.Save(&submission).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui status perwalian"})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"message": "KRS " + req.Status,
		"data": submission,
	})
}

// --- ASPIRASI (STUDENT FEEDBACK) CRUD ---

// GetAspirations returns all student aspirations
func GetAspirations(c *fiber.Ctx) error {
	var aspirations []models.Aspiration
	if err := config.DB.Preload("Student.Major").Preload("Student.User").Order("created_at DESC").Find(&aspirations).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data aspirasi"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": aspirations})
}

// UpdateAspiration handles admin response and status change
func UpdateAspiration(c *fiber.Ctx) error {
	id := c.Params("id")
	type UpdateRequest struct {
		Status   string `json:"status"`   // proses, klarifikasi, selesai, ditolak
		Response string `json:"response"` // Jawaban admin
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	var aspiration models.Aspiration
	if err := config.DB.First(&aspiration, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Aspirasi tidak ditemukan"})
	}

	aspiration.Status = req.Status
	aspiration.Response = req.Response
	
	if err := config.DB.Save(&aspiration).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui aspirasi"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Aspirasi berhasil diperbarui", "data": aspiration})
}

// DeleteAspiration removes an aspiration record
func DeleteAspiration(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Aspiration{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus aspirasi"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Aspirasi berhasil dihapus"})
}

// --- PRESTASI (ACHIEVEMENTS) CRUD ---

// GetAchievements returns all student achievement submissions
func GetAchievements(c *fiber.Ctx) error {
	var achievements []models.Achievement
	if err := config.DB.Preload("Student.Major").Preload("Student.User").Order("created_at DESC").Find(&achievements).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data prestasi: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": achievements})
}

// VerifyAchievement handles validation, points, and status change
func VerifyAchievement(c *fiber.Ctx) error {
	id := c.Params("id")
	type VerifyRequest struct {
		Status   string `json:"status"`   // Terverifikasi, Ditolak
		Points   int    `json:"points"`   // Poin SKPI
		Notes    string `json:"notes"`    // Catatan verifikasi
	}

	var req VerifyRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	var achievement models.Achievement
	if err := config.DB.First(&achievement, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Data prestasi tidak ditemukan"})
	}

	achievement.Status = req.Status
	achievement.PoinSKPI = req.Points
	achievement.CatatanVerifikator = req.Notes
	
	now := time.Now()
	achievement.VerifiedAt = &now
	// achievement.VerifiedBy = // Could get from JWT if needed

	if err := config.DB.Save(&achievement).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memverifikasi prestasi"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Prestasi berhasil diverifikasi", "data": achievement})
}

// DeleteAchievement removes an achievement record
func DeleteAchievement(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Achievement{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus data prestasi"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Data prestasi berhasil dihapus"})
}

// --- E-PERSURATAN (LETTER REQUESTS) CRUD ---

// GetLetterRequests returns all student letter applications
func GetLetterRequests(c *fiber.Ctx) error {
	var requests []models.LetterRequest
	if err := config.DB.Preload("Student.Major").Preload("Student.User").Order("created_at DESC").Find(&requests).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data surat: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": requests})
}

// UpdateLetterStatus handles administrative processing of letters
func UpdateLetterStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	type UpdateRequest struct {
		Status       string `json:"status"`       // diajukan, diproses, siap_ambil, selesai, ditolak
		CatatanAdmin string `json:"adminNotes"`   // Catatan untuk mahasiswa
		FileURL      string `json:"fileUrl"`      // Link download jika sudah selesai
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	var letter models.LetterRequest
	if err := config.DB.First(&letter, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Data pengajuan surat tidak ditemukan"})
	}

	letter.Status = req.Status
	letter.CatatanAdmin = req.CatatanAdmin
	if req.FileURL != "" {
		letter.FileURL = req.FileURL
	}
	
	if err := config.DB.Save(&letter).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui status surat"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Status surat berhasil diperbarui", "data": letter})
}

// DeleteLetterRequest removes a letter request record
func DeleteLetterRequest(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.LetterRequest{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus pengajuan surat"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Pengajuan surat berhasil dihapus"})
}

// --- PENDAFTARAN YUDISIUM (GRADUATION) CRUD ---

// GetGraduationSubmissions returns all graduation/judicium applications
func GetGraduationSubmissions(c *fiber.Ctx) error {
	var submissions []models.GraduationSubmission
	if err := config.DB.Preload("Student.Major").Preload("Student.User").Order("created_at DESC").Find(&submissions).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data yudisium: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": submissions})
}

// UpdateGraduationStatus handles status change and exam scheduling
func UpdateGraduationStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	type UpdateRequest struct {
		Status        string `json:"status"`         // pendaftaran, verifikasi, sidang, revisi, lulus, ditolak
		Keterangan    string `json:"notes"`          // Catatan admin
		TanggalSidang string `json:"examDate"`       // Format string YYYY-MM-DD
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	var graduation models.GraduationSubmission
	if err := config.DB.First(&graduation, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Data yudisium tidak ditemukan"})
	}

	graduation.Status = req.Status
	graduation.Keterangan = req.Keterangan

	if req.TanggalSidang != "" {
		t, err := time.Parse("2006-01-02", req.TanggalSidang)
		if err == nil {
			graduation.TanggalSidang = &t
		}
	}
	
	if err := config.DB.Save(&graduation).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui status yudisium"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Status yudisium berhasil diperbarui", "data": graduation})
}

// DeleteGraduationSubmission removes a graduation record
func DeleteGraduationSubmission(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.GraduationSubmission{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus data yudisium"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Data yudisium berhasil dihapus"})
}

// --- MBKM PROGRAM MANAGEMENT CRUD ---

// GetMBKMPrograms returns all students participating in MBKM
func GetMBKMPrograms(c *fiber.Ctx) error {
	var programs []models.MBKMProgram
	if err := config.DB.Preload("Student.Major").Preload("Student.User").Order("created_at DESC").Find(&programs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data MBKM: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": programs})
}

// UpdateMBKMStatus handles status and SKS conversion
func UpdateMBKMStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	type UpdateRequest struct {
		Status string `json:"status"` // terdaftar, berjalan, rekon_sks, selesai, ditolak
		SKS    int    `json:"sks"`    // SKS yang dikonversi
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	var program models.MBKMProgram
	if err := config.DB.First(&program, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Data MBKM tidak ditemukan"})
	}

	program.Status = req.Status
	program.SKSKonversi = req.SKS

	if err := config.DB.Save(&program).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui status MBKM"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Status MBKM berhasil diperbarui", "data": program})
}

// DeleteMBKMProgram removes an MBKM record
func DeleteMBKMProgram(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.MBKMProgram{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus data MBKM"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Data MBKM berhasil dihapus"})
}

// --- SCHOLARSHIP MANAGEMENT CRUD ---

// GetScholarships returns all scholarship programs with accepted count
func GetScholarships(c *fiber.Ctx) error {
	type ScholarshipWithCount struct {
		models.Scholarship
		AcceptedCount int64 `json:"acceptedCount"`
	}
	var scholarships []models.Scholarship
	if err := config.DB.Order("deadline DESC").Find(&scholarships).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data beasiswa: " + err.Error()})
	}

	var results []ScholarshipWithCount
	for _, s := range scholarships {
		var count int64
		config.DB.Model(&models.ScholarshipApplication{}).Where("scholarship_id = ? AND status = ?", s.ID, "diterima").Count(&count)
		results = append(results, ScholarshipWithCount{
			Scholarship:   s,
			AcceptedCount: count,
		})
	}

	return c.JSON(fiber.Map{"status": "success", "data": results})
}

// ScholarshipDTO for flexible request handling
type ScholarshipDTO struct {
	Name        string  `json:"name"`
	Provider    string  `json:"provider"`
	Description string  `json:"description"`
	MinGPA      float64 `json:"minGpa"`
	Quota       int     `json:"quota"`
	Deadline    string  `json:"deadline"` // Catch as string first
	Status      string  `json:"status"`
}

// CreateScholarship adds a new program
func CreateScholarship(c *fiber.Ctx) error {
	var dto ScholarshipDTO
	if err := c.BodyParser(&dto); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	deadline, _ := time.Parse("2006-01-02", dto.Deadline)
	
	scholarship := models.Scholarship{
		Name:        dto.Name,
		Provider:    dto.Provider,
		Description: dto.Description,
		MinGPA:      dto.MinGPA,
		Quota:       dto.Quota,
		Deadline:    deadline,
		Status:      dto.Status,
	}

	if err := config.DB.Create(&scholarship).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal membuat beasiswa"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Program beasiswa berhasil dibuat", "data": scholarship})
}

// UpdateScholarship updates a program
func UpdateScholarship(c *fiber.Ctx) error {
	id := c.Params("id")
	var scholarship models.Scholarship
	if err := config.DB.First(&scholarship, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Data beasiswa tidak ditemukan"})
	}

	var dto ScholarshipDTO
	if err := c.BodyParser(&dto); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body format"})
	}

	// Update fields manually from DTO
	scholarship.Name = dto.Name
	scholarship.Provider = dto.Provider
	scholarship.Description = dto.Description
	scholarship.MinGPA = dto.MinGPA
	scholarship.Quota = dto.Quota
	scholarship.Status = dto.Status
	
	if dto.Deadline != "" {
		if d, err := time.Parse("2006-01-02", dto.Deadline); err == nil {
			scholarship.Deadline = d
		} else {
			// Try fallback format if needed
			if d, err := time.Parse(time.RFC3339, dto.Deadline); err == nil {
				scholarship.Deadline = d
			}
		}
	}

	if err := config.DB.Save(&scholarship).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui beasiswa"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Program beasiswa berhasil diperbarui", "data": scholarship})
}

// DeleteScholarship removes a program
func DeleteScholarship(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Scholarship{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus beasiswa"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Program beasiswa dihapus"})
}

// GetOrmawaProposals gets all submissions
func GetOrmawaProposals(c *fiber.Ctx) error {
	var proposals []models.OrmawaProposal
	if err := config.DB.Preload("Student").Find(&proposals).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data proposal"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": proposals})
}

// UpdateOrmawaProposalStatus updates status and notes
func UpdateOrmawaProposalStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status     string `json:"status"`
		AdminNotes string `json:"adminNotes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	if err := config.DB.Model(&models.OrmawaProposal{}).Where("id = ?", id).Updates(models.OrmawaProposal{
		Status:     req.Status,
		AdminNotes: req.AdminNotes,
	}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui status proposal"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Status proposal berhasil diperbarui"})
}

// DeleteOrmawaProposal removes a record
func DeleteOrmawaProposal(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.OrmawaProposal{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus data proposal"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Data proposal berhasil dihapus"})
}

// --- SCHOLARSHIP APPLICATIONS ---

// --- FACULTY ORGANIZATIONS ---

func GetFacultyOrganizations(c *fiber.Ctx) error {
	var orgs []models.FacultyOrganization
	if err := config.DB.Order("id asc").Find(&orgs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data organisasi"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": orgs})
}

func CreateFacultyOrganization(c *fiber.Ctx) error {
	var org models.FacultyOrganization
	if err := c.BodyParser(&org); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}
	if err := config.DB.Create(&org).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menambah organisasi"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Organisasi berhasil ditambahkan", "data": org})
}

func UpdateFacultyOrganization(c *fiber.Ctx) error {
	id := c.Params("id")
	var org models.FacultyOrganization
	if err := config.DB.First(&org, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Organisasi tidak ditemukan"})
	}

	var updateData models.FacultyOrganization
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	config.DB.Model(&org).Updates(updateData)
	return c.JSON(fiber.Map{"status": "success", "message": "Data organisasi berhasil diperbarui"})
}

func DeleteFacultyOrganization(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.FacultyOrganization{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Organisasi berhasil dihapus"})
}

// --- NEWS / ARTICLES ---

func GetArticles(c *fiber.Ctx) error {
	var articles []models.Article
	if err := config.DB.Order("created_at desc").Find(&articles).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data artikel"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": articles})
}

func CreateArticle(c *fiber.Ctx) error {
	var article models.Article
	if err := c.BodyParser(&article); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}
	if err := config.DB.Create(&article).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal membuat konten"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Konten berhasil dipublikasikan", "data": article})
}

func UpdateArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	var article models.Article
	if err := config.DB.First(&article, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Konten tidak ditemukan"})
	}
	var updateData models.Article
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}
	config.DB.Model(&article).Updates(updateData)
	return c.JSON(fiber.Map{"status": "success", "message": "Konten berhasil diperbarui"})
}

func DeleteArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Article{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Konten berhasil dihapus"})
}

// GetScholarshipApplications returns all student applications
func GetScholarshipApplications(c *fiber.Ctx) error {
	var applications []models.ScholarshipApplication
	if err := config.DB.Preload("Scholarship").Preload("Student.Major").Preload("Student.User").Order("created_at DESC").Find(&applications).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data pendaftar: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": applications})
}

// UpdateScholarshipApplicationStatus handles verification with quota & GPA checks
func UpdateScholarshipApplicationStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	type UpdateRequest struct {
		Status string `json:"status"` // proses, wawancara, diterima, ditolak
		Notes  string `json:"notes"`
	}
	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	var application models.ScholarshipApplication
	if err := config.DB.Preload("Scholarship").Preload("Student").First(&application, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Data pendaftaran tidak ditemukan"})
	}

	if req.Status == "diterima" {
		var acceptedCount int64
		config.DB.Model(&models.ScholarshipApplication{}).Where("scholarship_id = ? AND status = ?", application.ScholarshipID, "diterima").Count(&acceptedCount)
		
		if int(acceptedCount) >= application.Scholarship.Quota {
			return c.Status(400).JSON(fiber.Map{
				"status": "error", 
				"message": fmt.Sprintf("Gagal menerima: Kuota beasiswa (%d) sudah penuh!", application.Scholarship.Quota),
			})
		}
	}

	application.Status = req.Status
	application.AdminNotes = req.Notes

	if err := config.DB.Save(&application).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui status pendaftaran"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Status pendaftaran berhasil diperbarui"})
}

// DeleteScholarshipApplication removes an application
func DeleteScholarshipApplication(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.ScholarshipApplication{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus data pendaftaran"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Data pendaftaran berhasil dihapus"})
}

// --- PMB ADMISSION CRUD ---

func GetAdmissions(c *fiber.Ctx) error {
	var admissions []models.Admission
	if err := config.DB.Order("created_at DESC").Find(&admissions).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data pendaftar: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": admissions})
}

func CreateAdmission(c *fiber.Ctx) error {
	var admission models.Admission
	if err := c.BodyParser(&admission); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	// Generate NomorDaftar format PMB-YYYY-XXX
	var count int64
	config.DB.Model(&models.Admission{}).Count(&count)
	admission.NomorDaftar = fmt.Sprintf("PMB-%d-%03d", time.Now().Year(), count+1)
	admission.TanggalDaftar = time.Now()

	if err := config.DB.Create(&admission).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menambahkan pendaftar"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Pendaftar berhasil ditambahkan", "data": admission})
}

func UpdateAdmissionStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	type UpdateRequest struct {
		Status string `json:"status"` // Diterima, Verifikasi, Pending, Ditolak
	}
	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	if err := config.DB.Model(&models.Admission{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui status"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Status berhasil diperbarui"})
}

func DeleteAdmission(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Admission{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus pendaftar"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Pendaftar berhasil dihapus"})
}

// === FACULTY RBAC CONTROLLERS ===

// GetFacultyRoles retrieves all custom roles for the faculty
func GetFacultyRoles(c *fiber.Ctx) error {
	var roles []models.FacultyRole
	if err := config.DB.Find(&roles).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data role"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": roles})
}

// CreateFacultyRole creates a new custom role with permissions
func CreateFacultyRole(c *fiber.Ctx) error {
	role := new(models.FacultyRole)
	if err := c.BodyParser(role); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Data tidak valid"})
	}

	if err := config.DB.Create(&role).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal membuat role"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": role})
}

// UpdateFacultyRole updates an existing role and its permissions
func UpdateFacultyRole(c *fiber.Ctx) error {
	id := c.Params("id")
	var role models.FacultyRole
	if err := config.DB.First(&role, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Role tidak ditemukan"})
	}

	if err := c.BodyParser(&role); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Data tidak valid"})
	}

	if err := config.DB.Save(&role).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui role"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": role})
}

// DeleteFacultyRole removes a custom role
func DeleteFacultyRole(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.FacultyRole{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus role"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Role berhasil dihapus"})
}

// AssignUserFacultyRole links a user to a specific faculty role
func AssignUserFacultyRole(c *fiber.Ctx) error {
	type AssignRequest struct {
		UserID        uint `json:"userId"`
		FacultyRoleID uint `json:"facultyRoleId"`
	}
	req := new(AssignRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Data tidak valid"})
	}

	if err := config.DB.Model(&models.User{}).Where("id = ?", req.UserID).Update("faculty_role_id", req.FacultyRoleID).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal assigning role"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Role berhasil ditugaskan"})
}

// GetFacultyReports generates comprehensive statistics for reporting
func GetFacultyReports(c *fiber.Ctx) error {
	var summary struct {
		Total    int64   `json:"total"`
		Active   int64   `json:"active"`
		Graduated int64   `json:"graduated"`
		AvgGPA   float64 `json:"avgGpa"`
	}

	// 1. Basic Summary
	config.DB.Model(&models.Student{}).Count(&summary.Total)
	config.DB.Model(&models.Student{}).Where("status_akun = ?", "Aktif").Count(&summary.Active)
	config.DB.Model(&models.Student{}).Where("status_akun = ?", "Lulus").Count(&summary.Graduated)
	config.DB.Model(&models.Student{}).Select("AVG(ipk)").Row().Scan(&summary.AvgGPA)

	// 2. Mahasiswa per Angkatan
	type AngkatanStat struct {
		Angkatan string `json:"angkatan"`
		Aktif    int    `json:"aktif"`
		Lulus    int    `json:"lulus"`
		Cuti     int    `json:"cuti"`
	}
	var perAngkatan []AngkatanStat
	config.DB.Raw(`
		SELECT tahun_masuk as angkatan,
		COUNT(CASE WHEN status_akun = 'Aktif' THEN 1 END) as aktif,
		COUNT(CASE WHEN status_akun = 'Lulus' THEN 1 END) as lulus,
		COUNT(CASE WHEN status_akun = 'Cuti' THEN 1 END) as cuti
		FROM mahasiswa
		GROUP BY tahun_masuk
		ORDER BY tahun_masuk ASC
	`).Scan(&perAngkatan)

	// 3. Mahasiswa per Prodi (Detailed for Table)
	type ProdiStat struct {
		Name      string  `json:"name"`
		Value     int     `json:"value"`
		Active    int     `json:"active"`
		Leave     int     `json:"leave"`
		Graduated int     `json:"graduated"`
		AvgGPA    float64 `json:"avgGpa"`
	}
	var perProdi []ProdiStat
	config.DB.Raw(`
		SELECT 
			m.nama_prodi as name, 
			COUNT(s.id) as value,
			COUNT(CASE WHEN s.status_akun = 'Aktif' THEN 1 END) as active,
			COUNT(CASE WHEN s.status_akun = 'Cuti' THEN 1 END) as leave,
			COUNT(CASE WHEN s.status_akun = 'Lulus' THEN 1 END) as graduated,
			AVG(s.ipk) as avg_gpa
		FROM program_studi m
		LEFT JOIN mahasiswa s ON s.prodi_id = m.id
		GROUP BY m.nama_prodi
	`).Scan(&perProdi)

	// 4. IPK Distribution
	type IPKStat struct {
		Range  string `json:"range"`
		Jumlah int    `json:"jumlah"`
	}
	var ipkDist []IPKStat
	config.DB.Raw(`
		SELECT 
			CASE 
				WHEN ipk < 2.0 THEN '< 2.0'
				WHEN ipk >= 2.0 AND ipk < 2.5 THEN '2.0-2.5'
				WHEN ipk >= 2.5 AND ipk < 3.0 THEN '2.5-3.0'
				WHEN ipk >= 3.0 AND ipk < 3.5 THEN '3.0-3.5'
				ELSE '3.5-4.0'
			END as range,
			COUNT(*) as jumlah
		FROM mahasiswa
		GROUP BY range
		ORDER BY range ASC
	`).Scan(&ipkDist)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"summary":     summary,
			"perAngkatan": perAngkatan,
			"perProdi":    perProdi,
			"ipkDist":     ipkDist,
		},
	})
}

// Helper to calculate Grade Label and Point based on Final Score
// 80-100: A (4.0), 75-79: AB (3.5), 70-74: B (3.0), 
// 65-69: BC (2.5), 60-64: C (2.0), 50-59: D (1.0), 0-49: E (0.0)
func calculateGradeLabel(score float64) (string, float64) {
	if score >= 80 {
		return "A", 4.0
	} else if score >= 75 {
		return "AB", 3.5
	} else if score >= 70 {
		return "B", 3.0
	} else if score >= 65 {
		return "BC", 2.5
	} else if score >= 60 {
		return "C", 2.0
	} else if score >= 50 {
		return "D", 1.0
	}
	return "E", 0.0
}

// GetGrades returns student grades for a specific course and year
// It lists ALL enrolled students, even if they don't have a grade yet.
func GetGrades(c *fiber.Ctx) error {
	courseID := c.Query("course_id")
	tahun := c.Query("tahun")
	semester := c.Query("semester")

	if courseID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "course_id is required"})
	}

	type EnrollmentResult struct {
		StudentID     uint    `json:"student_id"`
		NIM           string  `json:"nim"`
		StudentName   string  `json:"student_name"`
		Absensi       float64 `json:"absensi"`
		Tugas         float64 `json:"tugas"`
		UTS           float64 `json:"uts"`
		UAS           float64 `json:"uas"`
		NilaiAkhir    float64 `json:"nilai_akhir"`
		GradeLabel    string  `json:"grade_label"`
		Point         float64 `json:"point"`
	}

	var results []EnrollmentResult

	// Join Students -> KRSValidation -> KRSItems -> (Left Join) Grades
	config.DB.Raw(`
		SELECT 
			s.id as student_id,
			s.nim,
			s.nama_mahasiswa as student_name,
			COALESCE(g.absensi, 0) as absensi,
			COALESCE(g.tugas, 0) as tugas,
			COALESCE(g.uts, 0) as uts,
			COALESCE(g.uas, 0) as uas,
			COALESCE(g.nilai_akhir, 0) as nilai_akhir,
			COALESCE(g.grade_label, '-') as grade_label,
			COALESCE(g.point, 0) as point
		FROM mahasiswa s
		JOIN krs_validation kv ON kv.student_id = s.id
		JOIN krs_items ki ON ki.krs_submission_id = kv.id
		LEFT JOIN grades g ON g.student_id = s.id AND g.matakuliah_id = ki.course_id
		WHERE ki.course_id = ? AND kv.tahun_akademik = ? AND kv.semester_tipe = ?
	`, courseID, tahun, semester).Scan(&results)

	return c.JSON(fiber.Map{"status": "success", "data": results})
}

// InputGrade creates or updates a student's grade
func InputGrade(c *fiber.Ctx) error {
	var input struct {
		StudentID     uint    `json:"student_id"`
		CourseID      uint    `json:"course_id"`
		TahunAkademik string  `json:"tahun_akademik"`
		Semester      int     `json:"semester"`
		Absensi       float64 `json:"absensi"`
		Tugas         float64 `json:"tugas"`
		UTS           float64 `json:"uts"`
		UAS           float64 `json:"uas"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Calculate Final Score (Standard Siakad: 10% Absen, 20% Tugas, 30% UTS, 40% UAS)
	finalScore := (input.Absensi * 0.1) + (input.Tugas * 0.2) + (input.UTS * 0.3) + (input.UAS * 0.4)
	label, point := calculateGradeLabel(finalScore)

	var grade models.Grade
	result := config.DB.Where("student_id = ? AND course_id = ? AND tahun_akademik = ?", 
		input.StudentID, input.CourseID, input.TahunAkademik).First(&grade)

	grade.StudentID = input.StudentID
	grade.CourseID = input.CourseID
	grade.TahunAkademik = input.TahunAkademik
	grade.Semester = input.Semester
	grade.Absensi = input.Absensi
	grade.Tugas = input.Tugas
	grade.UTS = input.UTS
	grade.UAS = input.UAS
	grade.NilaiAkhir = finalScore
	grade.GradeLabel = label
	grade.Point = point

	if result.RowsAffected > 0 {
		if err := config.DB.Save(&grade).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Gagal update nilai"})
		}
	} else {
		if err := config.DB.Create(&grade).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Gagal simpan nilai baru"})
		}
	}

	return c.JSON(fiber.Map{
		"status": "success", 
		"message": "Nilai berhasil disimpan", 
		"data": grade,
	})
}

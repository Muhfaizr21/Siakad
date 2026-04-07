package controllers

import (
	"fmt"
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
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Student not found"})
	}

	// Delete both student and user
	userID := student.UserID
	config.DB.Delete(&student)
	config.DB.Delete(&models.User{}, userID)

	return c.JSON(fiber.Map{"status": "success", "message": "Student deleted successfully"})
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

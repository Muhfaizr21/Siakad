package kencana

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func MentorDashboard(c *fiber.Ctx) error {
	mentor, err := currentMentor(c)
	if err != nil {
		return err
	}
	period, err := activePeriod(config.DB)
	if err != nil {
		return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"mentor": mentor, "period": nil, "student_count": 0}})
	}
	var count int64
	config.DB.Model(&models.KencanaMentorAssignment{}).Where("period_id = ? AND mentor_id = ? AND status = ?", period.ID, mentor.ID, "active").Count(&count)
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"mentor": mentor, "period": period, "student_count": count}})
}

func MentorProfile(c *fiber.Ctx) error {
	mentor, err := currentMentor(c)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": mentor})
}

func UpdateMentorProfile(c *fiber.Ctx) error {
	mentor, err := currentMentor(c)
	if err != nil {
		return err
	}
	type reqBody struct {
		Name  string `json:"name"`
		Phone string `json:"phone"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload profil tidak valid"})
	}
	if req.Name != "" {
		mentor.Name = req.Name
	}
	mentor.Phone = req.Phone
	if err := config.DB.Save(mentor).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan profil"})
	}
	return c.JSON(fiber.Map{"success": true, "data": mentor})
}

func MentorAvailableStudents(c *fiber.Ctx) error {
	mentor, err := currentMentor(c)
	if err != nil {
		return err
	}
	periodID := c.QueryInt("period_id")
	if periodID == 0 {
		period, err := activePeriod(config.DB)
		if err == nil {
			periodID = int(period.ID)
		}
	}
	if periodID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Periode Kencana belum tersedia"})
	}

	search := c.Query("search")

	var assignments []models.KencanaMentorAssignment
	config.DB.Preload("Mentor").Where("period_id = ? AND status IN ?", periodID, []string{"active", "pending"}).Find(&assignments)
	assignedMap := map[uint]string{}
	for _, a := range assignments {
		if a.Mentor.Name != "" {
			assignedMap[a.StudentID] = a.Mentor.Name
		}
	}
	q := config.DB.Preload("Fakultas").Preload("ProgramStudi").Order("nama asc")
	if mentor.ScopeType == "faculty" {
		if mentor.FakultasID == nil {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Scope fakultas mentor belum dikonfigurasi"})
		}
		q = q.Where("fakultas_id = ?", *mentor.FakultasID)
	}
	if search != "" {
		q = q.Joins("LEFT JOIN fakultas.program_studi ON mahasiswa.mahasiswa.program_studi_id = fakultas.program_studi.id")
		q = q.Where("mahasiswa.mahasiswa.nama ILIKE ? OR mahasiswa.mahasiswa.nim ILIKE ? OR fakultas.program_studi.nama ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	var students []models.Mahasiswa
	if err := q.Find(&students).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat mahasiswa"})
	}
	data := []fiber.Map{}
	for _, s := range students {
		mentorName, hasMentor := assignedMap[s.ID]
		data = append(data, fiber.Map{
			"id": s.ID, 
			"name": s.Nama, 
			"nim": s.NIM, 
			"fakultas": s.Fakultas.Nama, 
			"program_studi": s.ProgramStudi.Nama, 
			"already_has_mentor": hasMentor,
			"mentor_name": mentorName,
		})
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func MentorStudents(c *fiber.Ctx) error {
	mentor, err := currentMentor(c)
	if err != nil {
		return err
	}
	periodID := c.QueryInt("period_id")
	q := config.DB.Preload("Mentor").Where("mentor_id = ? AND status IN ?", mentor.ID, []string{"active", "pending", "rejected"})
	if periodID != 0 {
		q = q.Where("period_id = ?", periodID)
	}
	var assignments []models.KencanaMentorAssignment
	if err := q.Order("created_at desc").Find(&assignments).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat mahasiswa bimbingan"})
	}
	studentIDs := []uint{}
	for _, a := range assignments {
		studentIDs = append(studentIDs, a.StudentID)
	}
	var students []models.Mahasiswa
	if len(studentIDs) > 0 {
		config.DB.Preload("Fakultas").Preload("ProgramStudi").Find(&students, studentIDs)
	}
	byID := map[uint]models.Mahasiswa{}
	for _, s := range students {
		byID[s.ID] = s
	}
	data := []fiber.Map{}
	for _, a := range assignments {
		s, ok := byID[a.StudentID]
		if !ok {
			continue
		}
		data = append(data, fiber.Map{
			"id":         a.ID,
			"period_id":  a.PeriodID,
			"mentor_id":  a.MentorID,
			"student_id": a.StudentID,
			"status":     a.Status,
			"student": fiber.Map{
				"id":            s.ID,
				"nim":           s.NIM,
				"nama":          s.Nama,
				"fakultas":      s.Fakultas.Nama,
				"program_studi": s.ProgramStudi.Nama,
			},
		})
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func MentorInviteStudents(c *fiber.Ctx) error {
	mentor, err := currentMentor(c)
	if err != nil {
		return err
	}
	type reqBody struct {
		PeriodID   uint   `json:"period_id"`
		StudentIDs []uint `json:"student_ids"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil || len(req.StudentIDs) == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload invite tidak valid"})
	}
	if req.PeriodID == 0 {
		period, err := activePeriod(config.DB)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Periode Kencana aktif belum tersedia"})
		}
		req.PeriodID = period.ID
	}
	uid, _ := userID(c)
	invalid := []uint{}
	conflicts := []uint{}
	invited := 0
	err = config.DB.Transaction(func(tx *gorm.DB) error {
		for _, studentID := range req.StudentIDs {
			var student models.Mahasiswa
			if err := tx.First(&student, studentID).Error; err != nil {
				invalid = append(invalid, studentID)
				continue
			}
			if mentor.ScopeType == "faculty" && (mentor.FakultasID == nil || student.FakultasID != *mentor.FakultasID) {
				invalid = append(invalid, studentID)
				continue
			}
			var count int64
			tx.Model(&models.KencanaMentorAssignment{}).Where("period_id = ? AND student_id = ? AND status IN ?", req.PeriodID, studentID, []string{"active", "pending"}).Count(&count)
			if count > 0 {
				conflicts = append(conflicts, studentID)
				continue
			}
			assignment := models.KencanaMentorAssignment{PeriodID: req.PeriodID, MentorID: mentor.ID, StudentID: studentID, AssignedBy: &uid, AssignmentSource: "mentor_invite", Status: "pending"}
			if err := tx.Create(&assignment).Error; err != nil {
				conflicts = append(conflicts, studentID)
				continue
			}
			invited++
		}
		return nil
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal invite mahasiswa"})
	}
	if len(invalid) > 0 || len(conflicts) > 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Sebagian mahasiswa tidak dapat diundang", "invalid_student_ids": invalid, "conflict_student_ids": conflicts, "invited_count": invited})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Undangan berhasil dikirim. Menunggu konfirmasi mahasiswa.", "data": fiber.Map{"invited_count": invited}})
}

func MentorRemoveAssignment(c *fiber.Ctx) error {
	mentor, err := currentMentor(c)
	if err != nil {
		return err
	}
	var assignment models.KencanaMentorAssignment
	if err := config.DB.First(&assignment, "id = ? AND mentor_id = ?", c.Params("id"), mentor.ID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Assignment tidak ditemukan"})
	}
	if err := config.DB.Unscoped().Delete(&assignment).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal melepas mahasiswa"})
	}
	return c.JSON(fiber.Map{"success": true, "data": assignment})
}

func MentorStudentProgress(c *fiber.Ctx) error {
	student, periodID, err := mentorStudentScope(c)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"student": student, "progress_total": progressSummary(periodID, student)}})
}

func MentorStudentScore(c *fiber.Ctx) error {
	student, periodID, err := mentorStudentScope(c)
	if err != nil {
		return err
	}
	score, blockers, _ := calculateAndStoreScore(config.DB, periodID, student.ID)
	var items []models.KencanaScoreItem
	config.DB.Where("period_id = ? AND student_id = ?", periodID, student.ID).Order("component asc, created_at desc").Find(&items)
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"student": student, "score": score, "items": items, "blockers": blockers}})
}

func MentorStudentAttendance(c *fiber.Ctx) error {
	student, periodID, err := mentorStudentScope(c)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": attendanceSummary(config.DB, periodID, student.ID)})
}

func MentorStudentHandbook(c *fiber.Ctx) error {
	student, periodID, err := mentorStudentScope(c)
	if err != nil {
		return err
	}
	var handbook models.KencanaHandbook
	config.DB.Where("period_id = ? AND student_id = ?", periodID, student.ID).First(&handbook)
	return c.JSON(fiber.Map{"success": true, "data": handbook})
}

func MentorCreateNote(c *fiber.Ctx) error {
	student, periodID, err := mentorStudentScope(c)
	if err != nil {
		return err
	}
	type reqBody struct {
		Notes string `json:"notes"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil || req.Notes == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Catatan wajib diisi"})
	}
	uid, _ := userID(c)
	now := time.Now()
	item := models.KencanaScoreItem{PeriodID: periodID, StudentID: student.ID, Component: "note", ItemName: "Catatan Pembimbing", SourceType: "manual", AssessedBy: &uid, AssessedAt: &now, Notes: req.Notes}
	if err := config.DB.Create(&item).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan catatan"})
	}
	return c.JSON(fiber.Map{"success": true, "data": item})
}

func MentorCreateScoreItem(c *fiber.Ctx) error {
	student, periodID, err := mentorStudentScope(c)
	if err != nil {
		return err
	}
	type reqBody struct {
		Component string  `json:"component"`
		ItemName  string  `json:"item_name"`
		Score     float64 `json:"score"`
		Notes     string  `json:"notes"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil || req.ItemName == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload nilai tidak valid"})
	}
	if req.Component != "psychomotor" && req.Component != "affective" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Mentor hanya dapat input nilai psikomotor atau afektif"})
	}
	uid, _ := userID(c)
	now := time.Now()
	item := models.KencanaScoreItem{PeriodID: periodID, StudentID: student.ID, Component: req.Component, ItemName: req.ItemName, Score: req.Score, SourceType: "manual", AssessedBy: &uid, AssessedAt: &now, Notes: req.Notes}
	if err := config.DB.Create(&item).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan nilai"})
	}
	calculateAndStoreScore(config.DB, periodID, student.ID)
	return c.JSON(fiber.Map{"success": true, "data": item})
}

func currentMentor(c *fiber.Ctx) (*models.KencanaMentor, error) {
	uid, err := userID(c)
	if err != nil {
		return nil, err
	}
	var mentor models.KencanaMentor
	if err := config.DB.Preload("Fakultas").First(&mentor, "user_id = ? AND status = ?", uid, "active").Error; err != nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Profil Dewan Pembimbing tidak ditemukan")
	}
	return &mentor, nil
}

func mentorStudentScope(c *fiber.Ctx) (*models.Mahasiswa, uint, error) {
	mentor, err := currentMentor(c)
	if err != nil {
		return nil, 0, err
	}
	studentID, err := c.ParamsInt("studentId")
	if err != nil {
		return nil, 0, fiber.NewError(fiber.StatusBadRequest, "Mahasiswa tidak valid")
	}
	periodID := uint(c.QueryInt("period_id"))
	if periodID == 0 {
		period, err := activePeriod(config.DB)
		if err == nil {
			periodID = period.ID
		}
	}
	if periodID == 0 {
		return nil, 0, fiber.NewError(fiber.StatusBadRequest, "Periode Kencana belum tersedia")
	}
	var assignment models.KencanaMentorAssignment
	if err := config.DB.First(&assignment, "period_id = ? AND mentor_id = ? AND student_id = ? AND status = ?", periodID, mentor.ID, studentID, "active").Error; err != nil {
		return nil, 0, fiber.NewError(fiber.StatusForbidden, "Mahasiswa bukan bimbingan pembimbing ini")
	}
	var student models.Mahasiswa
	if err := config.DB.Preload("Fakultas").Preload("ProgramStudi").First(&student, studentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, 0, fiber.NewError(fiber.StatusNotFound, "Mahasiswa tidak ditemukan")
		}
		return nil, 0, err
	}
	return &student, periodID, nil
}

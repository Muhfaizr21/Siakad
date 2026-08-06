package kencana

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)


func mentorGroup(db *gorm.DB, periodID uint, mentorID uint) *models.KencanaGroup {
	var g models.KencanaGroup
	if err := db.Where("period_id = ? AND mentor_id = ? AND status = ?", periodID, mentorID, "active").First(&g).Error; err == nil {
		return &g
	}
	return nil
}

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
	mg := mentorGroup(config.DB, period.ID, mentor.ID)
	if mg != nil {
		config.DB.Model(&models.KencanaGroupMember{}).
			Where("group_id = ? AND status IN ?", mg.ID, []string{"active", "pending"}).
			Count(&count)
	} else {
		config.DB.Model(&models.KencanaMentorAssignment{}).Where("period_id = ? AND mentor_id = ? AND status = ?", period.ID, mentor.ID, "active").Count(&count)
	}
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

	assignedMap := map[uint]string{}

	var groupMembers []models.KencanaGroupMember
	config.DB.Preload("Group.Mentor").
		Joins("JOIN mahasiswa.kencana_groups ON mahasiswa.kencana_groups.id = mahasiswa.kencana_group_members.group_id").
		Where("mahasiswa.kencana_group_members.period_id = ? AND mahasiswa.kencana_group_members.status IN ? AND mahasiswa.kencana_groups.scope_type = ?", periodID, []string{"active", "pending"}, mentor.ScopeType).
		Find(&groupMembers)

	for _, gm := range groupMembers {
		if gm.Group.Name != "" {
			if gm.Status == "pending" {
				assignedMap[gm.StudentID] = "Diundang ke " + gm.Group.Name
			} else {
				assignedMap[gm.StudentID] = "Kelompok " + gm.Group.Name
			}
		} else {
			assignedMap[gm.StudentID] = "Sudah dalam kelompok"
		}
	}

	// We only check if they are in a Group for the current scope.
	// Old 1-on-1 assignments are ignored so they can be invited to new groups.

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
			"id":                 s.ID,
			"name":               s.Nama,
			"nim":                s.NIM,
			"fakultas":           s.Fakultas.Nama,
			"program_studi":      s.ProgramStudi.Nama,
			"already_has_mentor": hasMentor,
			"mentor_name":        mentorName,
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
	
	var data []fiber.Map

	// 1. Fetch Assignments
	qA := config.DB.Preload("Mentor").Where("mentor_id = ? AND status IN ?", mentor.ID, []string{"active", "pending", "rejected"})
	if periodID != 0 {
		qA = qA.Where("period_id = ?", periodID)
	}
	var assignments []models.KencanaMentorAssignment
	qA.Order("created_at desc").Find(&assignments)

	// 2. Fetch Group Members
	qG := config.DB.Joins("JOIN mahasiswa.kencana_groups ON mahasiswa.kencana_groups.id = mahasiswa.kencana_group_members.group_id").
		Where("mahasiswa.kencana_groups.mentor_id = ? AND mahasiswa.kencana_group_members.status IN ?", mentor.ID, []string{"active", "pending", "rejected"})
	if periodID != 0 {
		qG = qG.Where("mahasiswa.kencana_groups.period_id = ?", periodID)
	}
	var members []models.KencanaGroupMember
	qG.Order("mahasiswa.kencana_group_members.created_at desc").Find(&members)

	studentIDs := []uint{}
	for _, a := range assignments { studentIDs = append(studentIDs, a.StudentID) }
	for _, m := range members { studentIDs = append(studentIDs, m.StudentID) }
	
	var students []models.Mahasiswa
	if len(studentIDs) > 0 {
		config.DB.Preload("Fakultas").Preload("ProgramStudi").Find(&students, studentIDs)
	}
	byID := map[uint]models.Mahasiswa{}
	for _, s := range students { byID[s.ID] = s }

	for _, a := range assignments {
		s, ok := byID[a.StudentID]
		if !ok { continue }
		data = append(data, fiber.Map{
			"id": a.ID, "period_id": a.PeriodID, "mentor_id": a.MentorID, "student_id": a.StudentID, "status": a.Status, "type": "assignment",
			"student": fiber.Map{"id": s.ID, "nim": s.NIM, "nama": s.Nama, "fakultas": s.Fakultas.Nama, "program_studi": s.ProgramStudi.Nama},
		})
	}
	for _, m := range members {
		s, ok := byID[m.StudentID]
		if !ok { continue }
		data = append(data, fiber.Map{
			"id": m.ID, "period_id": m.PeriodID, "group_id": m.GroupID, "student_id": m.StudentID, "status": m.Status, "type": "group",
			"student": fiber.Map{"id": s.ID, "nim": s.NIM, "nama": s.Nama, "fakultas": s.Fakultas.Nama, "program_studi": s.ProgramStudi.Nama},
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
	mg := mentorGroup(config.DB, req.PeriodID, mentor.ID)

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
			if mg != nil {
				tx.Model(&models.KencanaGroupMember{}).
					Joins("JOIN mahasiswa.kencana_groups ON mahasiswa.kencana_groups.id = mahasiswa.kencana_group_members.group_id").
					Where("mahasiswa.kencana_group_members.period_id = ? AND mahasiswa.kencana_group_members.student_id = ? AND mahasiswa.kencana_group_members.status IN ? AND mahasiswa.kencana_groups.scope_type = ?", req.PeriodID, studentID, []string{"active", "pending"}, mentor.ScopeType).
					Count(&count)
				if count > 0 {
					conflicts = append(conflicts, studentID)
					continue
				}
				var existingMember models.KencanaGroupMember
				if err := tx.Unscoped().Where("group_id = ? AND student_id = ?", mg.ID, studentID).First(&existingMember).Error; err == nil {
					if err := tx.Unscoped().Model(&existingMember).Updates(map[string]interface{}{"status": "pending", "period_id": req.PeriodID, "added_by": uid, "deleted_at": nil}).Error; err != nil {
						conflicts = append(conflicts, studentID)
						continue
					}
				} else {
					member := models.KencanaGroupMember{GroupID: mg.ID, PeriodID: req.PeriodID, StudentID: studentID, AddedBy: &uid, Status: "pending"}
					if err := tx.Create(&member).Error; err != nil {
						conflicts = append(conflicts, studentID)
						continue
					}
				}
			} else {
				tx.Model(&models.KencanaMentorAssignment{}).
					Joins("JOIN mahasiswa.kencana_mentors ON mahasiswa.kencana_mentors.id = mahasiswa.kencana_mentor_assignments.mentor_id").
					Where("mahasiswa.kencana_mentor_assignments.period_id = ? AND mahasiswa.kencana_mentor_assignments.student_id = ? AND mahasiswa.kencana_mentor_assignments.status IN ? AND mahasiswa.kencana_mentors.scope_type = ?", req.PeriodID, studentID, []string{"active", "pending"}, mentor.ScopeType).
					Count(&count)
				if count > 0 {
					conflicts = append(conflicts, studentID)
					continue
				}
				
				var existingAssignment models.KencanaMentorAssignment
				if err := tx.Unscoped().Where("mentor_id = ? AND student_id = ?", mentor.ID, studentID).First(&existingAssignment).Error; err == nil {
					if err := tx.Unscoped().Model(&existingAssignment).Updates(map[string]interface{}{"status": "pending", "period_id": req.PeriodID, "assigned_by": uid, "assignment_source": "mentor_invite", "deleted_at": nil}).Error; err != nil {
						conflicts = append(conflicts, studentID)
						continue
					}
				} else {
					assignment := models.KencanaMentorAssignment{PeriodID: req.PeriodID, MentorID: mentor.ID, StudentID: studentID, AssignedBy: &uid, AssignmentSource: "mentor_invite", Status: "pending"}
					if err := tx.Create(&assignment).Error; err != nil {
						conflicts = append(conflicts, studentID)
						continue
					}
				}
			}
			invited++
		}
		return nil
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal invite mahasiswa"})
	}

	// Send notifications to successfully invited students
	if invited > 0 {
		for _, studentID := range req.StudentIDs {
			isSkipped := false
			for _, id := range invalid {
				if id == studentID {
					isSkipped = true
					break
				}
			}
			for _, id := range conflicts {
				if id == studentID {
					isSkipped = true
					break
				}
			}
			if isSkipped {
				continue
			}

			var title, content string
			if mg != nil {
				title = "Undangan Kelompok Kencana"
				content = fmt.Sprintf("Dewan Pembimbing %s mengundang Anda bergabung ke kelompok %s.", mentor.Name, mg.Name)
			} else {
				title = "Undangan Dewan Pembimbing"
				content = fmt.Sprintf("Dewan Pembimbing %s mengundang Anda sebagai anak bimbingannya.", mentor.Name)
			}

			_ = notifikasi.Kirim(config.DB, notifikasi.KirimParams{
				MahasiswaID: studentID,
				Type:        "kencana",
				Title:       title,
				Content:     content,
				Link:        "/student/kencana/invitations",
			})
		}
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
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"student": student, "score": score, "items": items, "blockers": blockers, "score_definitions": mentorScoreDefinitions(periodID)}})
}

func mentorScoreDefinitions(periodID uint) fiber.Map {
	var sessions []models.KencanaSession
	config.DB.Preload("Quizzes", "status IN ?", []string{"active", "published"}).
		Joins("JOIN mahasiswa.kencana_stages ON mahasiswa.kencana_stages.id = mahasiswa.kencana_sessions.stage_id").
		Where("mahasiswa.kencana_stages.period_id = ? AND mahasiswa.kencana_stages.type = ?", periodID, "kencana_universitas").
		Where("mahasiswa.kencana_sessions.status IN ?", []string{"active", "published"}).
		Order("mahasiswa.kencana_sessions.order_number asc, mahasiswa.kencana_sessions.id asc").
		Find(&sessions)

	cognitive := []fiber.Map{}
	for _, session := range sessions {
		for _, quiz := range session.Quizzes {
			cognitive = append(cognitive, fiber.Map{
				"key":    fmt.Sprintf("Quiz #%d", quiz.ID),
				"label":  fmt.Sprintf("Post Test (%s)", quiz.Title),
				"manual": false,
			})
		}
	}
	return fiber.Map{"cognitive": cognitive}
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
	if !mentorCanWriteScoreItem(req.Component, req.ItemName) {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Mentor hanya dapat input nilai psikomotor, afektif, atau syarat kelulusan"})
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

	if mentor.ScopeType == "university" {
		var member models.KencanaGroupMember
		if err := config.DB.Table("mahasiswa.kencana_group_members").
			Select("mahasiswa.kencana_group_members.period_id").
			Joins("JOIN mahasiswa.kencana_groups ON mahasiswa.kencana_group_members.group_id = mahasiswa.kencana_groups.id").
			Where("mahasiswa.kencana_groups.mentor_id = ? AND mahasiswa.kencana_group_members.student_id = ? AND mahasiswa.kencana_group_members.status IN ?", mentor.ID, studentID, []string{"active", "pending"}).
			First(&member).Error; err != nil {
			return nil, 0, fiber.NewError(fiber.StatusForbidden, "Mahasiswa bukan anggota kelompok ini")
		}
		if periodID == 0 {
			periodID = member.PeriodID
		}
	} else {
		var assignment models.KencanaMentorAssignment
		if err := config.DB.First(&assignment, "mentor_id = ? AND student_id = ? AND status IN ?", mentor.ID, studentID, []string{"active", "pending"}).Error; err != nil {
			return nil, 0, fiber.NewError(fiber.StatusForbidden, "Mahasiswa bukan bimbingan pembimbing ini")
		}
		if periodID == 0 {
			periodID = assignment.PeriodID
		}
	}

	if periodID == 0 {
		period, err := activePeriod(config.DB)
		if err == nil {
			periodID = period.ID
		}
	}
	if periodID == 0 {
		return nil, 0, fiber.NewError(fiber.StatusBadRequest, "Periode Kencana belum tersedia")
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

func MentorUpsertBulkScoreItems(c *fiber.Ctx) error {
	student, periodID, err := mentorStudentScope(c)
	if err != nil {
		return err
	}
	type itemPayload struct {
		Component string  `json:"component"`
		ItemName  string  `json:"item_name"`
		Score     float64 `json:"score"`
		Notes     string  `json:"notes"`
	}
	type reqBody struct {
		Items []itemPayload `json:"items"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil || len(req.Items) == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload tidak valid"})
	}
	uid, _ := userID(c)
	now := time.Now()

	for _, it := range req.Items {
		if !mentorCanWriteScoreItem(it.Component, it.ItemName) {
			continue
		}
		if it.Score < 0 || it.Score > 100 {
			continue
		}
		var existing models.KencanaScoreItem
		err := config.DB.Where("period_id = ? AND student_id = ? AND component = ? AND item_name = ?",
			periodID, student.ID, it.Component, it.ItemName).First(&existing).Error
		if err == nil {
			existing.Score = it.Score
			existing.Notes = it.Notes
			existing.AssessedBy = &uid
			existing.AssessedAt = &now
			config.DB.Save(&existing)
		} else {
			item := models.KencanaScoreItem{
				PeriodID: periodID, StudentID: student.ID,
				Component: it.Component, ItemName: it.ItemName,
				Score: it.Score, SourceType: "manual",
				AssessedBy: &uid, AssessedAt: &now, Notes: it.Notes,
			}
			config.DB.Create(&item)
		}
	}
	calculateAndStoreScore(config.DB, periodID, student.ID)
	return c.JSON(fiber.Map{"success": true, "message": "Nilai berhasil disimpan"})
}

func mentorCanWriteScoreItem(component string, itemName string) bool {
	component = strings.ToLower(strings.TrimSpace(component))
	itemName = strings.ToLower(strings.TrimSpace(itemName))
	return component == "psychomotor" || component == "affective" || component == "requirements" || (component == "cognitive" && itemName == "handbook")
}

func MentorReviewHandbook(c *fiber.Ctx) error {
	student, periodID, err := mentorStudentScope(c)
	if err != nil {
		return err
	}
	type reqBody struct {
		Status   string `json:"status"` // approved / rejected
		Feedback string `json:"feedback"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil || (req.Status != "approved" && req.Status != "rejected") {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Status review tidak valid"})
	}
	var handbook models.KencanaHandbook
	if err := config.DB.Where("period_id = ? AND student_id = ?", periodID, student.ID).First(&handbook).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Handbook belum disubmit oleh mahasiswa"})
	}
	uid, _ := userID(c)
	now := time.Now()
	handbook.Status = req.Status
	handbook.Feedback = req.Feedback
	handbook.ReviewedBy = &uid
	handbook.ReviewedAt = &now
	if err := config.DB.Save(&handbook).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan review handbook"})
	}

	calculateAndStoreScore(config.DB, periodID, student.ID)
	return c.JSON(fiber.Map{"success": true, "data": handbook})
}

// MentorListGroups - Get groups assigned to this mentor
func MentorListGroups(c *fiber.Ctx) error {
	mentor, err := currentMentor(c)
	if err != nil {
		return err
	}
	periodID := c.QueryInt("period_id")
	if periodID == 0 {
		if period, err := activePeriod(config.DB); err == nil {
			periodID = int(period.ID)
		}
	}
	var groups []models.KencanaGroup
	q := config.DB.Preload("Period").Preload("Mentor").Where("mentor_id = ?", mentor.ID)
	if periodID != 0 {
		q = q.Where("period_id = ?", periodID)
	}

	search := c.Query("search")
	if search != "" {
		q = q.Where("LOWER(name) LIKE ? OR LOWER(code) LIKE ?", "%"+strings.ToLower(search)+"%", "%"+strings.ToLower(search)+"%")
	}

	if err := q.Order("group_number asc").Find(&groups).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat kelompok mentor"})
	}

	// Pre-calculate member counts to match Admin response structure
	var groupIDs []uint
	for _, g := range groups {
		groupIDs = append(groupIDs, g.ID)
	}
	memberCounts := make(map[uint]int64)
	if len(groupIDs) > 0 {
		rows, err := config.DB.Model(&models.KencanaGroupMember{}).Where("group_id IN ?", groupIDs).Select("group_id, count(*) as count").Group("group_id").Rows()
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var id uint
				var count int64
				rows.Scan(&id, &count)
				memberCounts[id] = count
			}
		}
	}

	var data []fiber.Map
	for _, g := range groups {
		d := groupResponse(g)
		d["members_count"] = memberCounts[g.ID]
		data = append(data, d)
	}

	return c.JSON(fiber.Map{"success": true, "data": data})
}

// MentorGetGroup - Get specific group details for mentor
func MentorGetGroup(c *fiber.Ctx) error {
	mentor, err := currentMentor(c)
	if err != nil {
		return err
	}
	var group models.KencanaGroup
	q := config.DB.Preload("Period").Preload("Mentor").Preload("Members.Student.Fakultas").Preload("Members.Student.ProgramStudi").Where("mentor_id = ?", mentor.ID)
	if err := q.First(&group, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Kelompok tidak ditemukan atau bukan milik Anda"})
	}
	return c.JSON(fiber.Map{"success": true, "data": groupResponse(group)})
}

// MentorAddGroupMembers - Add members to mentor's group
func MentorAddGroupMembers(c *fiber.Ctx) error {
	mentor, err := currentMentor(c)
	if err != nil {
		return err
	}
	var group models.KencanaGroup
	if err := config.DB.Where("mentor_id = ?", mentor.ID).First(&group, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Kelompok tidak ditemukan atau bukan milik Anda"})
	}
	var req struct {
		StudentIDs []uint `json:"student_ids"`
	}
	if err := c.BodyParser(&req); err != nil || len(req.StudentIDs) == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "student_ids wajib diisi"})
	}
	now := time.Now()
	uid, _ := userID(c)
	added := 0
	conflicts := []uint{}
	for _, studentID := range req.StudentIDs {
		// Verify student is valid for group (same faculty logic if faculty scope)
		if err := validateStudentForGroup(group, studentID); err != nil {
			continue
		}
		var existing models.KencanaGroupMember
		err := config.DB.Unscoped().Where("period_id = ? AND student_id = ?", group.PeriodID, studentID).First(&existing).Error
		if err == nil {
			if existing.Status == "active" && existing.GroupID != group.ID && !existing.DeletedAt.Valid {
				conflicts = append(conflicts, studentID)
				continue
			}
			existing.GroupID = group.ID
			existing.Status = "pending"
			existing.DeletedAt = gorm.DeletedAt{}
			existing.JoinedAt = &now
			existing.AddedBy = &uid
			if config.DB.Unscoped().Save(&existing).Error == nil {
				added++
				_ = notifikasi.Kirim(config.DB, notifikasi.KirimParams{
					MahasiswaID: studentID,
					Type:        "kencana",
					Title:       "Undangan Kelompok Kencana",
					Content:     fmt.Sprintf("Dewan Pembimbing %s mengundang Anda bergabung ke kelompok %s.", mentor.Name, group.Name),
					Link:        "/student/kencana/invitations",
				})
			}
		} else {
			member := models.KencanaGroupMember{GroupID: group.ID, PeriodID: group.PeriodID, StudentID: studentID, Status: "pending", JoinedAt: &now, AddedBy: &uid}
			if config.DB.Create(&member).Error == nil {
				added++
				_ = notifikasi.Kirim(config.DB, notifikasi.KirimParams{
					MahasiswaID: studentID,
					Type:        "kencana",
					Title:       "Undangan Kelompok Kencana",
					Content:     fmt.Sprintf("Dewan Pembimbing %s mengundang Anda bergabung ke kelompok %s.", mentor.Name, group.Name),
					Link:        "/student/kencana/invitations",
				})
			}
		}
	}
	if len(conflicts) > 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Sebagian mahasiswa sudah aktif di kelompok lain", "conflict_student_ids": conflicts, "invited_count": added})
	}
	return c.JSON(fiber.Map{"success": true, "message": fmt.Sprintf("Berhasil mengundang %d mahasiswa ke kelompok", added)})
}

// MentorRemoveGroupMember - Remove member from mentor's group
func MentorRemoveGroupMember(c *fiber.Ctx) error {
	mentor, err := currentMentor(c)
	if err != nil {
		return err
	}
	var group models.KencanaGroup
	if err := config.DB.Where("mentor_id = ?", mentor.ID).First(&group, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Kelompok tidak ditemukan atau bukan milik Anda"})
	}
	studentParam, err := c.ParamsInt("studentId")
	if err != nil || studentParam == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "student_id tidak valid"})
	}
	if err := config.DB.Where("group_id = ? AND student_id = ?", group.ID, uint(studentParam)).Delete(&models.KencanaGroupMember{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengeluarkan anggota"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Anggota dikeluarkan dari kelompok"})
}

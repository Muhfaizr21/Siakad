package kencana

import (
	"encoding/json"
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func kencanaAdminScope(c *fiber.Ctx) (role string, fakultasID uint) {
	role, _ = c.Locals("role").(string)
	role = strings.ToLower(role)
	if v, ok := c.Locals("fakultas_id").(uint); ok {
		fakultasID = v
	}
	return role, fakultasID
}

func applyKencanaMentorScope(c *fiber.Ctx, q *gorm.DB) *gorm.DB {
	role, fakultasID := kencanaAdminScope(c)
	if role == "kencana_admin" {
		return q.Where("scope_type = ?", "university")
	}
	if role == "kencana_fakultas" {
		return q.Where("scope_type = ? AND fakultas_id = ?", "faculty", fakultasID)
	}
	return q
}

func ListPeriods(c *fiber.Ctx) error {
	var periods []models.KencanaPeriod
	if err := config.DB.Order("created_at desc").Find(&periods).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat periode"})
	}
	return c.JSON(fiber.Map{"success": true, "data": periods})
}

func CreatePeriod(c *fiber.Ctx) error {
	var period models.KencanaPeriod
	if err := c.BodyParser(&period); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload periode tidak valid"})
	}
	uid, _ := userID(c)
	period.CreatedBy = &uid
	if period.Status == "" {
		period.Status = "draft"
	}
	if err := config.DB.Create(&period).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuat periode"})
	}
	return c.JSON(fiber.Map{"success": true, "data": period})
}

func UpdatePeriod(c *fiber.Ctx) error {
	var period models.KencanaPeriod
	if err := config.DB.First(&period, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Periode tidak ditemukan"})
	}
	if err := c.BodyParser(&period); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload periode tidak valid"})
	}
	if err := config.DB.Save(&period).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui periode"})
	}
	return c.JSON(fiber.Map{"success": true, "data": period})
}

func ListStages(c *fiber.Ctx) error {
	var stages []models.KencanaStage
	q := config.DB.Preload("Sessions").Order("period_id desc, order_number asc")
	if periodID := c.Query("period_id"); periodID != "" {
		q = q.Where("period_id = ?", periodID)
	}
	if err := q.Find(&stages).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat tahap"})
	}
	return c.JSON(fiber.Map{"success": true, "data": stages})
}

func CreateStage(c *fiber.Ctx) error { return createRecord(c, &models.KencanaStage{}, "Tahap") }
func UpdateStage(c *fiber.Ctx) error { return updateRecord(c, &models.KencanaStage{}, "Tahap") }
func ListSessions(c *fiber.Ctx) error {
	var sessions []models.KencanaSession
	q := config.DB.Preload("Materials").Preload("Quizzes").Preload("Assignments").Order("stage_id desc, order_number asc")
	if stageID := c.Query("stage_id"); stageID != "" {
		q = q.Where("stage_id = ?", stageID)
	}
	if err := q.Find(&sessions).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat sesi"})
	}
	return c.JSON(fiber.Map{"success": true, "data": sessions})
}
func CreateSession(c *fiber.Ctx) error  { return createRecord(c, &models.KencanaSession{}, "Sesi") }
func UpdateSession(c *fiber.Ctx) error  { return updateRecord(c, &models.KencanaSession{}, "Sesi") }
func CreateMaterial(c *fiber.Ctx) error { return createRecord(c, &models.KencanaMaterial{}, "Materi") }
func CreateQuiz(c *fiber.Ctx) error     { return createRecord(c, &models.KencanaQuiz{}, "Quiz") }

func GetQuizDetail(c *fiber.Ctx) error {
	quizID := c.Params("id")
	var quiz models.KencanaQuiz

	err := config.DB.
		Preload("Questions", func(db *gorm.DB) *gorm.DB { return db.Order("order_number asc") }).
		Preload("Questions.Options", func(db *gorm.DB) *gorm.DB { return db.Order("order_number asc") }).
		First(&quiz, quizID).Error

	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Quiz tidak ditemukan"})
	}

	return c.JSON(fiber.Map{"success": true, "data": quiz})
}
func CreateQuestion(c *fiber.Ctx) error { return saveQuestion(c, 0) }

func UpdateQuestion(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil || id == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Soal tidak valid"})
	}
	return saveQuestion(c, uint(id))
}

func saveQuestion(c *fiber.Ctx, questionID uint) error {
	type optionBody struct {
		ID          uint   `json:"id"`
		OptionText  string `json:"option_text"`
		IsCorrect   bool   `json:"is_correct"`
		OrderNumber int    `json:"order_number"`
	}
	type reqBody struct {
		QuizID       uint         `json:"quiz_id"`
		QuestionText string       `json:"question_text"`
		QuestionType string       `json:"question_type"`
		Score        float64      `json:"score"`
		OrderNumber  int          `json:"order_number"`
		Options      []optionBody `json:"options"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil || strings.TrimSpace(req.QuestionText) == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload soal tidak valid"})
	}
	if req.QuestionType == "" {
		req.QuestionType = "multiple_choice"
	}
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		question := models.KencanaQuestion{QuizID: req.QuizID, QuestionText: req.QuestionText, QuestionType: req.QuestionType, Score: req.Score, OrderNumber: req.OrderNumber}
		if questionID != 0 {
			if err := tx.First(&question, questionID).Error; err != nil {
				return err
			}
			question.QuestionText = req.QuestionText
			question.QuestionType = req.QuestionType
			question.Score = req.Score
			question.OrderNumber = req.OrderNumber
			if req.QuizID != 0 {
				question.QuizID = req.QuizID
			}
			if err := tx.Save(&question).Error; err != nil {
				return err
			}
			if err := tx.Where("question_id = ?", question.ID).Delete(&models.KencanaQuestionOption{}).Error; err != nil {
				return err
			}
		} else if err := tx.Create(&question).Error; err != nil {
			return err
		}
		if question.QuestionType == "multiple_choice" {
			for idx, opt := range req.Options {
				if strings.TrimSpace(opt.OptionText) == "" {
					continue
				}
				order := opt.OrderNumber
				if order == 0 {
					order = idx + 1
				}
				option := models.KencanaQuestionOption{QuestionID: question.ID, OptionText: opt.OptionText, IsCorrect: opt.IsCorrect, OrderNumber: order}
				if err := tx.Create(&option).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan soal"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Soal berhasil disimpan"})
}
func CreateAssignment(c *fiber.Ctx) error {
	return createRecord(c, &models.KencanaAssignment{}, "Tugas")
}

func ListParticipants(c *fiber.Ctx) error {
	var students []models.Mahasiswa
	q := config.DB.Preload("Fakultas").Preload("ProgramStudi").Order("nama asc")
	if facultyID := c.Query("fakultas_id"); facultyID != "" {
		q = q.Where("fakultas_id = ?", facultyID)
	}
	if err := q.Find(&students).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat peserta"})
	}

	// Fetch active mentor assignments
	var assignments []models.KencanaMentorAssignment
	config.DB.Preload("Mentor.User").Where("status = ?", "active").Find(&assignments)

	assignmentMap := make(map[uint]models.KencanaMentorAssignment)
	for _, a := range assignments {
		assignmentMap[a.StudentID] = a
	}

	var results []fiber.Map
	for _, s := range students {
		mentorName := "-"
		if a, ok := assignmentMap[s.ID]; ok {
			mentorName = a.Mentor.Name
		}

		results = append(results, fiber.Map{
			"id":                 s.ID,
			"nim":                s.NIM,
			"nama":               s.Nama,
			"email_kampus":       s.EmailKampus,
			"email_personal":     s.EmailPersonal,
			"fakultas_name":      s.Fakultas.Nama,
			"program_studi_name": s.ProgramStudi.Nama,
			"mentor_name":        mentorName,
		})
	}

	return c.JSON(fiber.Map{"success": true, "data": results})
}

func ListScores(c *fiber.Ctx) error {
	var scores []models.KencanaScore
	q := config.DB.Order("final_score desc")
	if periodID := c.Query("period_id"); periodID != "" {
		q = q.Where("period_id = ?", periodID)
	}
	if err := q.Find(&scores).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat nilai"})
	}
	return c.JSON(fiber.Map{"success": true, "data": scores})
}

func CreateRemedial(c *fiber.Ctx) error {
	return createRecord(c, &models.KencanaRemedial{}, "Remedial")
}

func GenerateCertificate(c *fiber.Ctx) error {
	type reqBody struct {
		PeriodID  uint `json:"period_id"`
		StudentID uint `json:"student_id"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil || req.PeriodID == 0 || req.StudentID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload sertifikat tidak valid"})
	}
	score, blockers, _ := calculateAndStoreScore(config.DB, req.PeriodID, req.StudentID)
	if score.GraduationStatus != statusPassed {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Mahasiswa belum lulus", "blockers": blockers})
	}
	now := time.Now()
	cert := models.KencanaCertificate{PeriodID: req.PeriodID, StudentID: req.StudentID, CertificateNumber: "KNC-" + time.Now().Format("20060102150405"), FileURL: "/uploads/sertifikat/kencana-demo.pdf", IssuedAt: &now, Status: "available"}
	if err := config.DB.Where("period_id = ? AND student_id = ?", req.PeriodID, req.StudentID).FirstOrCreate(&cert).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal generate sertifikat"})
	}
	return c.JSON(fiber.Map{"success": true, "data": cert})
}

func ListMentors(c *fiber.Ctx) error {
	var mentors []models.KencanaMentor
	q := applyKencanaMentorScope(c, config.DB.Preload("Fakultas").Preload("User").Order("created_at desc"))
	if err := q.Find(&mentors).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat mentor"})
	}
	return c.JSON(fiber.Map{"success": true, "data": mentors})
}

func CreateMentor(c *fiber.Ctx) error {
	type reqBody struct {
		Email      string `json:"email"`
		Password   string `json:"password"`
		Name       string `json:"name"`
		Phone      string `json:"phone"`
		ScopeType  string `json:"scope_type"`
		FakultasID uint   `json:"fakultas_id"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload mentor tidak valid"})
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Name = strings.TrimSpace(req.Name)
	req.ScopeType = strings.TrimSpace(req.ScopeType)
	if req.ScopeType == "" {
		req.ScopeType = "faculty"
	}
	role, adminFakultasID := kencanaAdminScope(c)

	var rbacRole models.RBACRole
	if err := config.DB.Where("key = ?", role).First(&rbacRole).Error; err == nil {
		var perms []string
		json.Unmarshal(rbacRole.Permissions, &perms)
		
		hasPerm := false
		for _, p := range perms {
			if p == "*" || (role == "kencana_fakultas" && p == "kencana.faculty.mentor.manage") || (role == "kencana_admin" && p == "kencana.mentor.university.manage") {
				hasPerm = true
				break
			}
		}
		if !hasPerm && role != "super_admin" {
			return c.Status(403).JSON(fiber.Map{"success": false, "message": "Anda tidak memiliki izin (permission) untuk membuat mentor"})
		}
	}
	if role == "kencana_fakultas" {
		if adminFakultasID == 0 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Admin Kencana Fakultas belum memiliki scope fakultas"})
		}
		req.ScopeType = "faculty"
		req.FakultasID = adminFakultasID
	} else if role == "kencana_admin" {
		req.ScopeType = "university"
		req.FakultasID = 0
	}
	if req.Email == "" || req.Password == "" || req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Nama, email, dan password wajib diisi"})
	}
	if req.ScopeType == "faculty" && req.FakultasID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Fakultas wajib dipilih untuk mentor fakultas"})
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengamankan password"})
	}
	var mentor models.KencanaMentor
	err = config.DB.Transaction(func(tx *gorm.DB) error {
		user := models.User{Email: req.Email, Password: string(hash), Role: "kencana_mentor"}
		if req.FakultasID != 0 {
			user.FakultasID = &req.FakultasID
		}
		if err := tx.Create(&user).Error; err != nil {
			return err
		}
		mentor = models.KencanaMentor{UserID: user.ID, Name: req.Name, Email: req.Email, Phone: req.Phone, ScopeType: req.ScopeType, Status: "active"}
		if req.FakultasID != 0 {
			mentor.FakultasID = &req.FakultasID
		}
		return tx.Create(&mentor).Error
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuat mentor: " + err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": mentor})
}

func UpdateMentor(c *fiber.Ctx) error {
	var mentor models.KencanaMentor
	q := applyKencanaMentorScope(c, config.DB)
	if err := q.First(&mentor, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mentor tidak ditemukan atau di luar scope"})
	}
	if err := c.BodyParser(&mentor); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload Mentor tidak valid"})
	}
	role, adminFakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		mentor.ScopeType = "faculty"
		mentor.FakultasID = &adminFakultasID
	}
	if err := config.DB.Save(&mentor).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui Mentor"})
	}
	return c.JSON(fiber.Map{"success": true, "data": mentor})
}

func DeleteMentor(c *fiber.Ctx) error {
	q := applyKencanaMentorScope(c, config.DB)
	if err := q.Delete(&models.KencanaMentor{}, c.Params("id")).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menghapus mentor"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Mentor dihapus"})
}

func ListMentorAssignments(c *fiber.Ctx) error {
	var assignments []models.KencanaMentorAssignment
	q := config.DB.Preload("Mentor").Order("created_at desc")
	if periodID := c.Query("period_id"); periodID != "" {
		q = q.Where("period_id = ?", periodID)
	}
	if err := q.Find(&assignments).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat assignment mentor"})
	}
	return c.JSON(fiber.Map{"success": true, "data": assignments})
}

func CreateMentorAssignment(c *fiber.Ctx) error {
	type reqBody struct {
		PeriodID  uint `json:"period_id"`
		MentorID  uint `json:"mentor_id"`
		StudentID uint `json:"student_id"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil || req.PeriodID == 0 || req.MentorID == 0 || req.StudentID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload assignment tidak valid"})
	}
	uid, _ := userID(c)
	assignment := models.KencanaMentorAssignment{PeriodID: req.PeriodID, MentorID: req.MentorID, StudentID: req.StudentID, AssignedBy: &uid, AssignmentSource: "admin_assign", Status: "active"}
	if err := config.DB.Create(&assignment).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Gagal assign mentor. Pastikan mahasiswa belum punya mentor aktif."})
	}
	return c.JSON(fiber.Map{"success": true, "data": assignment})
}

func MoveMentorAssignment(c *fiber.Ctx) error {
	type reqBody struct {
		MentorID uint `json:"mentor_id"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil || req.MentorID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Mentor tujuan wajib diisi"})
	}
	var assignment models.KencanaMentorAssignment
	if err := config.DB.First(&assignment, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Assignment tidak ditemukan"})
	}
	assignment.MentorID = req.MentorID
	assignment.AssignmentSource = "admin_assign"
	if err := config.DB.Save(&assignment).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memindahkan mentor"})
	}
	return c.JSON(fiber.Map{"success": true, "data": assignment})
}

func DeleteMentorAssignment(c *fiber.Ctx) error {
	var assignment models.KencanaMentorAssignment
	if err := config.DB.First(&assignment, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Assignment tidak ditemukan"})
	}
	assignment.Status = "removed"
	if err := config.DB.Save(&assignment).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal melepas assignment"})
	}
	return c.JSON(fiber.Map{"success": true, "data": assignment})
}

func createRecord(c *fiber.Ctx, dest any, label string) error {
	if err := c.BodyParser(dest); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload " + label + " tidak valid"})
	}
	if err := config.DB.Create(dest).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuat " + label})
	}
	return c.JSON(fiber.Map{"success": true, "data": dest})
}

func updateRecord(c *fiber.Ctx, dest any, label string) error {
	if err := config.DB.First(dest, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": label + " tidak ditemukan"})
	}
	if err := c.BodyParser(dest); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload " + label + " tidak valid"})
	}
	if err := config.DB.Save(dest).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui " + label})
	}
	return c.JSON(fiber.Map{"success": true, "data": dest})
}

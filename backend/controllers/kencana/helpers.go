package kencana

import (
	"math"
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

const (
	statusPassed          = "passed"
	statusConditionalPass = "conditional_pass"
	statusNotEligible     = "not_eligible"
	statusRemedial        = "remedial"
	statusInProgress      = "in_progress"
	statusNotStarted      = "not_started"
)

func userID(c *fiber.Ctx) (uint, error) {
	v, ok := c.Locals("user_id").(uint)
	if !ok || v == 0 {
		return 0, fiber.NewError(fiber.StatusUnauthorized, "User tidak terautentikasi")
	}
	return v, nil
}

func currentStudent(c *fiber.Ctx) (*models.Mahasiswa, error) {
	uid, err := userID(c)
	if err != nil {
		return nil, err
	}
	var student models.Mahasiswa
	if err := config.DB.Preload("Fakultas").Preload("ProgramStudi").First(&student, "pengguna_id = ?", uid).Error; err != nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Mahasiswa tidak ditemukan")
	}
	return &student, nil
}

func activePeriod(db *gorm.DB) (*models.KencanaPeriod, error) {
	var period models.KencanaPeriod
	err := db.Where("status IN ?", []string{"active", "published"}).Order("start_date desc nulls last, created_at desc").First(&period).Error
	if err != nil {
		return nil, err
	}
	return &period, nil
}

func ensureDemoPeriod(db *gorm.DB, student *models.Mahasiswa) (*models.KencanaPeriod, error) {
	period, err := activePeriod(db)
	if err == nil {
		return period, nil
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	now := time.Now()
	start := now.AddDate(0, 0, -3)
	end := now.AddDate(0, 1, 0)
	period = &models.KencanaPeriod{
		Name:        "Kencana " + time.Now().Format("2006"),
		Year:        now.Year(),
		Description: "Periode orientasi dan pembinaan mahasiswa baru.",
		StartDate:   &start,
		EndDate:     &end,
		Status:      "active",
	}

	if err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(period).Error; err != nil {
			return err
		}
		return seedDemoKencana(tx, period, student)
	}); err != nil {
		return nil, err
	}
	return period, nil
}

func seedDemoKencana(tx *gorm.DB, period *models.KencanaPeriod, student *models.Mahasiswa) error {
	now := time.Now()
	stageDefs := []struct {
		name          string
		typ           string
		desc          string
		day           int
		facultyScoped bool
	}{
		{"Pra-Kencana", "pra_kencana", "Persiapan awal, pengenalan aturan, dan pembekalan dasar.", -3, false},
		{"Kencana / Orientasi Utama", "kencana_utama", "Orientasi utama universitas dan budaya akademik.", -1, false},
		{"Kencana Fakultas", "kencana_fakultas", "Pengenalan fakultas, program studi, dan komunitas akademik.", 2, true},
		{"Pasca Kencana", "pasca_kencana", "Refleksi, penugasan akhir, dan finalisasi handbook.", 5, false},
	}

	for i, def := range stageDefs {
		start := now.AddDate(0, 0, def.day)
		end := start.AddDate(0, 0, 2)
		status := "locked"
		if now.Before(start) {
			status = "not_open"
		} else if now.After(end) {
			status = "completed"
		} else {
			status = "active"
		}
		var fakultasID *uint
		if def.facultyScoped {
			fakultasID = &student.FakultasID
		}
		stage := models.KencanaStage{
			PeriodID: period.ID, FakultasID: fakultasID, Name: def.name, Type: def.typ,
			Description: def.desc, StartDate: &start, EndDate: &end, OrderNumber: i + 1,
			Status: status, IsPublished: true,
		}
		if err := tx.Create(&stage).Error; err != nil {
			return err
		}

		for s := 1; s <= 2; s++ {
			sessionStart := start.Add(time.Duration(s-1) * 24 * time.Hour)
			sessionEnd := sessionStart.Add(23 * time.Hour)
			session := models.KencanaSession{
				StageID: stage.ID, Title: def.name + " - Sesi " + string(rune('0'+s)),
				Description: "Ikuti materi, quiz, dan tugas pada sesi ini sesuai jadwal yang dipublikasikan.",
				OrderNumber: s, StartDate: &sessionStart, EndDate: &sessionEnd, Status: status,
				IsRequired: true, IsPublished: true,
			}
			if err := tx.Create(&session).Error; err != nil {
				return err
			}

			material := models.KencanaMaterial{
				SessionID: session.ID, Title: "Materi " + session.Title, Type: "text",
				Content:     "Pelajari panduan Kencana pada sesi ini. Materi dapat berupa teks, file, link, atau video sesuai unggahan admin.",
				OrderNumber: 1, IsRequired: true,
			}
			if err := tx.Create(&material).Error; err != nil {
				return err
			}

			quizOpen := sessionStart
			quizClose := sessionEnd
			quiz := models.KencanaQuiz{
				SessionID: session.ID, Title: "Quiz " + session.Title,
				Description:     "Quiz pilihan ganda untuk mengukur pemahaman materi.",
				Instruction:     "Pilih satu jawaban paling tepat. Submit sebelum timer berakhir.",
				DurationMinutes: 20, OpenAt: &quizOpen, CloseAt: &quizClose, MaxAttempts: 2,
				ShowScore: true, Status: "published", IsRequired: true,
			}
			if err := tx.Create(&quiz).Error; err != nil {
				return err
			}
			questions := []models.KencanaQuestion{
				{QuizID: quiz.ID, QuestionText: "Apa tujuan utama mengikuti Kencana?", QuestionType: "multiple_choice", Score: 50, OrderNumber: 1},
				{QuizID: quiz.ID, QuestionText: "Komponen apa yang menjadi syarat wajib kelulusan penuh?", QuestionType: "multiple_choice", Score: 50, OrderNumber: 2},
			}
			for qi := range questions {
				if err := tx.Create(&questions[qi]).Error; err != nil {
					return err
				}
				options := []models.KencanaQuestionOption{
					{QuestionID: questions[qi].ID, OptionText: "Memahami budaya akademik dan menyelesaikan pembinaan", IsCorrect: qi == 0, OrderNumber: 1},
					{QuestionID: questions[qi].ID, OptionText: "Kehadiran 100% dan handbook disetujui", IsCorrect: qi == 1, OrderNumber: 2},
					{QuestionID: questions[qi].ID, OptionText: "Hanya mengunduh sertifikat", IsCorrect: false, OrderNumber: 3},
					{QuestionID: questions[qi].ID, OptionText: "Tidak ada kewajiban", IsCorrect: false, OrderNumber: 4},
				}
				if err := tx.Create(&options).Error; err != nil {
					return err
				}
			}

			assignment := models.KencanaAssignment{
				SessionID: session.ID, Title: "Tugas Refleksi " + session.Title,
				Description: "Tuliskan refleksi singkat setelah mengikuti sesi.", DueDate: &sessionEnd,
				SubmissionType: "text", Status: "published", IsRequired: true,
			}
			if err := tx.Create(&assignment).Error; err != nil {
				return err
			}
		}
	}
	return nil
}

func studentVisibleStages(db *gorm.DB, periodID uint, student *models.Mahasiswa) *gorm.DB {
	return db.Where("period_id = ? AND is_published = ? AND (fakultas_id IS NULL OR fakultas_id = ?)", periodID, true, student.FakultasID)
}

func average(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}
	sum := 0.0
	for _, v := range values {
		sum += v
	}
	return sum / float64(len(values))
}

func roundScore(v float64) float64 { return math.Round(v*100) / 100 }

func calculateAndStoreScore(db *gorm.DB, periodID, studentID uint) (*models.KencanaScore, []string, error) {
	var items []models.KencanaScoreItem
	if err := db.Where("period_id = ? AND student_id = ?", periodID, studentID).Find(&items).Error; err != nil {
		return nil, nil, err
	}
	components := map[string][]float64{"cognitive": {}, "psychomotor": {}, "affective": {}}
	for _, item := range items {
		components[strings.ToLower(item.Component)] = append(components[strings.ToLower(item.Component)], item.Score)
	}
	cog := roundScore(average(components["cognitive"]))
	psy := roundScore(average(components["psychomotor"]))
	aff := roundScore(average(components["affective"]))
	final := roundScore(cog*0.25 + psy*0.35 + aff*0.40)
	now := time.Now()
	status, blockers := graduationStatus(db, periodID, studentID, final)
	score := models.KencanaScore{
		PeriodID: periodID, StudentID: studentID,
		CognitiveAverage: cog, PsychomotorAverage: psy, AffectiveAverage: aff,
		CognitiveWeighted: roundScore(cog * 0.25), PsychomotorWeighted: roundScore(psy * 0.35), AffectiveWeighted: roundScore(aff * 0.40),
		FinalScore: final, GraduationStatus: status, Notes: strings.Join(blockers, "; "), CalculatedAt: &now,
	}
	var existing models.KencanaScore
	err := db.Where("period_id = ? AND student_id = ?", periodID, studentID).First(&existing).Error
	if err == nil {
		score.ID = existing.ID
		score.CreatedAt = existing.CreatedAt
		if err := db.Save(&score).Error; err != nil {
			return nil, nil, err
		}
	} else if err == gorm.ErrRecordNotFound {
		if err := db.Create(&score).Error; err != nil {
			return nil, nil, err
		}
	} else {
		return nil, nil, err
	}
	return &score, blockers, nil
}

func graduationStatus(db *gorm.DB, periodID, studentID uint, finalScore float64) (string, []string) {
	blockers := []string{}
	attendance := attendanceSummary(db, periodID, studentID)
	if attendance.RequiredSessions > 0 && attendance.Percentage < 100 {
		blockers = append(blockers, "Kehadiran belum 100%")
	}
	var handbook models.KencanaHandbook
	if err := db.Where("period_id = ? AND student_id = ?", periodID, studentID).First(&handbook).Error; err != nil || handbook.Status != "approved" {
		blockers = append(blockers, "Handbook belum disetujui")
	}
	if finalScore < 75 {
		blockers = append(blockers, "Nilai akhir masih di bawah 75")
	}
	var remedialCount int64
	db.Model(&models.KencanaRemedial{}).Where("period_id = ? AND student_id = ? AND status IN ?", periodID, studentID, []string{"open", "in_progress"}).Count(&remedialCount)
	if remedialCount > 0 {
		return statusRemedial, blockers
	}
	if len(blockers) == 0 && finalScore >= 75 {
		return statusPassed, blockers
	}
	if finalScore > 0 && finalScore < 75 {
		return statusConditionalPass, blockers
	}
	if finalScore == 0 {
		return statusInProgress, blockers
	}
	return statusNotEligible, blockers
}

type attendanceInfo struct {
	RequiredSessions int     `json:"required_sessions"`
	AttendedSessions int     `json:"attended_sessions"`
	Percentage       float64 `json:"percentage"`
	Status           string  `json:"status"`
}

func attendanceSummary(db *gorm.DB, periodID, studentID uint) attendanceInfo {
	var sessionIDs []uint
	db.Model(&models.KencanaSession{}).
		Joins("JOIN mahasiswa.kencana_stages ON mahasiswa.kencana_stages.id = mahasiswa.kencana_sessions.stage_id").
		Where("mahasiswa.kencana_stages.period_id = ? AND mahasiswa.kencana_sessions.is_required = ? AND mahasiswa.kencana_sessions.status = ?", periodID, true, "active").
		Pluck("mahasiswa.kencana_sessions.id", &sessionIDs)
	info := attendanceInfo{RequiredSessions: len(sessionIDs), Status: "Belum Lengkap"}
	if len(sessionIDs) == 0 {
		info.Status = "Lengkap"
		info.Percentage = 100
		return info
	}
	var attended int64
	db.Model(&models.KencanaAttendance{}).Where("student_id = ? AND session_id IN ? AND status = ?", studentID, sessionIDs, "present").Count(&attended)
	info.AttendedSessions = int(attended)
	info.Percentage = roundScore(float64(attended) / float64(len(sessionIDs)) * 100)
	if info.Percentage >= 100 {
		info.Status = "Lengkap"
	} else {
		info.Status = "Belum Lengkap"
	}
	return info
}

func activeMentorForStudent(periodID uint, studentID uint) fiber.Map {
	var assignment models.KencanaMentorAssignment
	if err := config.DB.Preload("Mentor").Preload("Mentor.Fakultas").First(&assignment, "period_id = ? AND student_id = ? AND status = ?", periodID, studentID, "active").Error; err != nil {
		return nil
	}
	mentor := assignment.Mentor
	return fiber.Map{"id": mentor.ID, "name": mentor.Name, "email": mentor.Email, "phone": mentor.Phone, "scope_type": mentor.ScopeType, "fakultas": mentor.Fakultas}
}

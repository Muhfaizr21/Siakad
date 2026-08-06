package kencana

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
	"gorm.io/gorm"
)

func kencanaAdminScope(c *fiber.Ctx) (role string, fakultasID uint) {
	role, _ = c.Locals("role").(string)
	role = strings.ToLower(role)
	if v, ok := c.Locals("fakultas_id").(float64); ok {
		fakultasID = uint(v)
	} else if v, ok := c.Locals("fakultas_id").(uint); ok {
		fakultasID = v
	} else if v, ok := c.Locals("fakultas_id").(int); ok {
		fakultasID = uint(v)
	}
	return role, fakultasID
}

func applyKencanaMentorScope(c *fiber.Ctx, q *gorm.DB) *gorm.DB {
	role, fakultasID := kencanaAdminScope(c)
	if role == "kencana_admin" {
		return q.Where("scope_type = ?", "university")
	}
	if strings.Contains(role, "fakultas") || strings.Contains(role, "faculty") || role == "kencana_fakultas" {
		return q.Where("scope_type = ? AND fakultas_id = ?", "faculty", fakultasID)
	}
	return q
}

const (
	kencanaPhaseDraft     = "draft"
	kencanaPhaseReady     = "ready"
	kencanaPhaseActive    = "active"
	kencanaPhaseCompleted = "completed"
	kencanaPhaseNotOpen   = "not_open"
)

var kencanaTimelineTypes = []string{"pra_kencana", "kencana_universitas", "kencana_fakultas", "pasca_kencana"}

func isKencanaUniversityCompleted(period models.KencanaPeriod) bool {
	return true
}

func EnsureFacultyPhases(periodID uint) error {
	var faculties []models.Fakultas
	if err := config.DB.Order("nama asc").Find(&faculties).Error; err != nil {
		return err
	}
	for _, faculty := range faculties {
		phase := models.KencanaFacultyPhase{PeriodID: periodID, FakultasID: faculty.ID, Status: kencanaPhaseNotOpen}
		if err := config.DB.Where("period_id = ? AND fakultas_id = ?", periodID, faculty.ID).FirstOrCreate(&phase).Error; err != nil {
			return err
		}
	}
	return nil
}

func EnsureTimelinePhases(periodID uint) error {
	for _, phaseType := range kencanaTimelineTypes {
		phase := models.KencanaTimelinePhase{PeriodID: periodID, PhaseType: phaseType, Status: kencanaPhaseDraft}
		if err := config.DB.Where("period_id = ? AND phase_type = ?", periodID, phaseType).FirstOrCreate(&phase).Error; err != nil {
			return err
		}
	}
	return nil
}

func facultyPhaseForRequest(c *fiber.Ctx, periodID uint) (*models.KencanaFacultyPhase, error) {
	role, fakultasID := kencanaAdminScope(c)
	if role == "super_admin" || role == "kencana_admin" {
		if queryFakultasID := uint(c.QueryInt("fakultas_id")); queryFakultasID != 0 {
			fakultasID = queryFakultasID
		} else {
			var firstFaculty models.Fakultas
			if err := config.DB.Order("nama asc").First(&firstFaculty).Error; err == nil {
				fakultasID = firstFaculty.ID
			}
		}
	}
	if fakultasID == 0 {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Fakultas belum tersedia atau belum dipilih")
	}
	var phase models.KencanaFacultyPhase
	err := config.DB.Preload("Fakultas").Where("period_id = ? AND fakultas_id = ?", periodID, fakultasID).First(&phase).Error
	if err == gorm.ErrRecordNotFound {
		phase = models.KencanaFacultyPhase{PeriodID: periodID, FakultasID: fakultasID, Status: kencanaPhaseNotOpen}
		err = config.DB.Create(&phase).Error
	}
	if err != nil {
		return nil, err
	}
	return &phase, nil
}

func activeOrRequestedPeriod(c *fiber.Ctx) (*models.KencanaPeriod, error) {
	periodID := uint(c.QueryInt("period_id"))
	var period models.KencanaPeriod
	if periodID != 0 {
		if err := config.DB.First(&period, periodID).Error; err != nil {
			return nil, err
		}
		return &period, nil
	}
	return activePeriod(config.DB)
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
	if period.UniversityPhaseStatus == "" {
		period.UniversityPhaseStatus = kencanaPhaseDraft
	}
	if err := config.DB.Create(&period).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuat periode"})
	}
	return c.JSON(fiber.Map{"success": true, "data": period})
}

func GetPeriodPhases(c *fiber.Ctx) error {
	var period models.KencanaPeriod
	if err := config.DB.First(&period, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Periode tidak ditemukan"})
	}
	if err := EnsureTimelinePhases(period.ID); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyiapkan timeline Kencana"})
	}
	if err := EnsureFacultyPhases(period.ID); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyiapkan fase fakultas"})
	}
	var timelinePhases []models.KencanaTimelinePhase
	if err := config.DB.Where("period_id = ?", period.ID).Order("phase_type asc").Find(&timelinePhases).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat timeline Kencana"})
	}
	var phases []models.KencanaFacultyPhase
	if err := config.DB.Preload("Fakultas").Where("period_id = ?", period.ID).Order("fakultas_id asc").Find(&phases).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat fase fakultas"})
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"period": period, "timeline_phases": timelinePhases, "faculty_phases": phases}})
}

func UpdateTimelinePhase(c *fiber.Ctx) error {
	type reqBody struct {
		StartDate string `json:"start_date"`
		EndDate   string `json:"end_date"`
		Status    string `json:"status"`
		IsActive  bool   `json:"is_active"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload timeline tidak valid"})
	}
	var periodID uint
	fmt.Sscanf(c.Params("id"), "%d", &periodID)
	phaseType := c.Params("phaseType")
	if periodID == 0 || phaseType == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Periode dan fase wajib diisi"})
	}
	if err := EnsureTimelinePhases(periodID); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyiapkan timeline Kencana"})
	}
	var phase models.KencanaTimelinePhase
	if err := config.DB.Where("period_id = ? AND phase_type = ?", periodID, phaseType).First(&phase).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Timeline fase tidak ditemukan"})
	}
	uid, _ := userID(c)
	if req.StartDate != "" {
		startDate, err := time.Parse("2006-01-02", req.StartDate)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format tanggal mulai tidak valid"})
		}
		phase.StartDate = &startDate
	} else {
		phase.StartDate = nil
	}
	if req.EndDate != "" {
		endDate, err := time.Parse("2006-01-02", req.EndDate)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format tanggal selesai tidak valid"})
		}
		phase.EndDate = &endDate
	} else {
		phase.EndDate = nil
	}
	phase.UpdatedBy = &uid
	if req.Status != "" {
		phase.Status = req.Status
	}
	if req.IsActive {
		if err := config.DB.Model(&models.KencanaTimelinePhase{}).Where("period_id = ?", periodID).Updates(map[string]any{"is_active": false}).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menonaktifkan timeline lain"})
		}
		phase.IsActive = true
		phase.Status = kencanaPhaseActive
	} else {
		phase.IsActive = false
	}
	if err := config.DB.Save(&phase).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan timeline fase"})
	}
	return c.JSON(fiber.Map{"success": true, "data": phase})
}

func UpdateUniversityPhase(c *fiber.Ctx) error {
	var period models.KencanaPeriod
	if err := config.DB.First(&period, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Periode tidak ditemukan"})
	}
	action := strings.ToLower(c.Params("action"))
	switch action {
	case "start":
		period.UniversityPhaseStatus = kencanaPhaseActive
		period.Status = "active"
	case "complete":
		period.UniversityPhaseStatus = kencanaPhaseCompleted
		config.DB.Model(&models.KencanaStage{}).Where("period_id = ? AND fakultas_id IS NULL AND status = ?", period.ID, "active").Update("status", "completed")
	case "reset":
		period.UniversityPhaseStatus = kencanaPhaseDraft
		period.Status = "draft"
	default:
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Aksi fase universitas tidak valid"})
	}
	if err := config.DB.Save(&period).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui fase universitas"})
	}
	return c.JSON(fiber.Map{"success": true, "data": period})
}

func OpenFacultyPhases(c *fiber.Ctx) error {
	var period models.KencanaPeriod
	if err := config.DB.First(&period, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Periode tidak ditemukan"})
	}
	if !isKencanaUniversityCompleted(period) {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Kencana Fakultas baru bisa dibuka setelah Kencana University selesai"})
	}
	if err := EnsureFacultyPhases(period.ID); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyiapkan fase fakultas"})
	}
	if err := config.DB.Model(&models.KencanaFacultyPhase{}).Where("period_id = ? AND status = ?", period.ID, kencanaPhaseNotOpen).Updates(map[string]any{"status": kencanaPhaseReady, "is_published": true}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuka fase fakultas"})
	}
	return GetPeriodPhases(c)
}

func GetFacultyPhase(c *fiber.Ctx) error {
	period, err := activeOrRequestedPeriod(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Periode Kencana tidak ditemukan"})
	}
	phase, err := facultyPhaseForRequest(c, period.ID)
	if err != nil {
		if fiberErr, ok := err.(*fiber.Error); ok {
			return c.Status(fiberErr.Code).JSON(fiber.Map{"success": false, "message": fiberErr.Message})
		}
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat fase fakultas"})
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"period": period, "phase": phase, "university_completed": isKencanaUniversityCompleted(*period)}})
}

func UpdateFacultyPhase(c *fiber.Ctx) error {
	type reqBody struct {
		PeriodID    uint       `json:"period_id"`
		FakultasID  uint       `json:"fakultas_id"`
		StartDate   *time.Time `json:"start_date"`
		EndDate     *time.Time `json:"end_date"`
		Theme       string     `json:"theme"`
		Status      string     `json:"status"`
		IsPublished bool       `json:"is_published"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload fase fakultas tidak valid"})
	}
	if req.PeriodID == 0 {
		period, err := activePeriod(config.DB)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"success": false, "message": "Periode aktif tidak ditemukan"})
		}
		req.PeriodID = period.ID
	}
	var period models.KencanaPeriod
	if err := config.DB.First(&period, req.PeriodID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Periode tidak ditemukan"})
	}
	if !isKencanaUniversityCompleted(period) {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Kencana Fakultas baru bisa diatur setelah Kencana University selesai"})
	}
	var phase *models.KencanaFacultyPhase
	var err error
	role, _ := kencanaAdminScope(c)
	if (role == "super_admin" || role == "kencana_admin") && req.FakultasID != 0 {
		var scopedPhase models.KencanaFacultyPhase
		err = config.DB.Preload("Fakultas").Where("period_id = ? AND fakultas_id = ?", req.PeriodID, req.FakultasID).First(&scopedPhase).Error
		if err == gorm.ErrRecordNotFound {
			scopedPhase = models.KencanaFacultyPhase{PeriodID: req.PeriodID, FakultasID: req.FakultasID, Status: kencanaPhaseNotOpen}
			err = config.DB.Create(&scopedPhase).Error
		}
		phase = &scopedPhase
	} else {
		phase, err = facultyPhaseForRequest(c, req.PeriodID)
	}
	if err != nil {
		if fiberErr, ok := err.(*fiber.Error); ok {
			return c.Status(fiberErr.Code).JSON(fiber.Map{"success": false, "message": fiberErr.Message})
		}
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat fase fakultas"})
	}
	phase.StartDate = req.StartDate
	phase.EndDate = req.EndDate
	phase.Theme = req.Theme
	phase.IsPublished = req.IsPublished
	if req.Status == kencanaPhaseReady || req.Status == kencanaPhaseActive || req.Status == kencanaPhaseCompleted || req.Status == "inactive" {
		phase.Status = req.Status
	}
	if err := config.DB.Save(phase).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan fase fakultas"})
	}
	return c.JSON(fiber.Map{"success": true, "data": phase})
}

func StartFacultyPhase(c *fiber.Ctx) error {
	period, err := activeOrRequestedPeriod(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Periode Kencana tidak ditemukan"})
	}
	if !isKencanaUniversityCompleted(*period) {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Kencana Fakultas baru bisa dimulai setelah Kencana University selesai"})
	}
	phase, err := facultyPhaseForRequest(c, period.ID)
	if err != nil {
		if fiberErr, ok := err.(*fiber.Error); ok {
			return c.Status(fiberErr.Code).JSON(fiber.Map{"success": false, "message": fiberErr.Message})
		}
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat fase fakultas"})
	}
	uid, _ := userID(c)
	phase.Status = kencanaPhaseActive
	phase.IsPublished = true
	phase.StartedBy = &uid
	if err := config.DB.Save(phase).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memulai Kencana Fakultas"})
	}
	return c.JSON(fiber.Map{"success": true, "data": phase})
}

func CompleteFacultyPhase(c *fiber.Ctx) error {
	period, err := activeOrRequestedPeriod(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Periode Kencana tidak ditemukan"})
	}
	phase, err := facultyPhaseForRequest(c, period.ID)
	if err != nil {
		if fiberErr, ok := err.(*fiber.Error); ok {
			return c.Status(fiberErr.Code).JSON(fiber.Map{"success": false, "message": fiberErr.Message})
		}
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat fase fakultas"})
	}
	uid, _ := userID(c)
	phase.Status = kencanaPhaseCompleted
	phase.CompletedBy = &uid
	if err := config.DB.Save(phase).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyelesaikan Kencana Fakultas"})
	}
	return c.JSON(fiber.Map{"success": true, "data": phase})
}

func UpdatePeriod(c *fiber.Ctx) error {
	var period models.KencanaPeriod
	if err := config.DB.First(&period, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Periode tidak ditemukan"})
	}

	var payload map[string]interface{}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload periode tidak valid"})
	}

	if err := config.DB.Model(&period).Updates(payload).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui periode"})
	}

	// Refetch to get updated data
	config.DB.First(&period, period.ID)
	return c.JSON(fiber.Map{"success": true, "data": period})
}

func ListStages(c *fiber.Ctx) error {
	role, fakultasID := kencanaAdminScope(c)
	var fid *uint
	if role == "kencana_fakultas" {
		fid = &fakultasID
	} else {
		if reqFakultasID := c.QueryInt("fakultas_id"); reqFakultasID != 0 {
			uFid := uint(reqFakultasID)
			fid = &uFid
		}
	}

	materialCond := func(db *gorm.DB) *gorm.DB {
		if fid != nil {
			return db.Where("fakultas_id = ?", *fid).Order("order_number asc")
		}
		return db.Where("fakultas_id IS NULL").Order("order_number asc")
	}

	quizCond := func(db *gorm.DB) *gorm.DB {
		if fid != nil {
			return db.Where("fakultas_id = ?", *fid).Order("created_at asc")
		}
		return db.Where("fakultas_id IS NULL").Order("created_at asc")
	}

	assignmentCond := func(db *gorm.DB) *gorm.DB {
		if fid != nil {
			return db.Where("fakultas_id = ?", *fid).Order("created_at asc")
		}
		return db.Where("fakultas_id IS NULL").Order("created_at asc")
	}

	var stages []models.KencanaStage
	q := config.DB.
		Preload("Sessions", func(db *gorm.DB) *gorm.DB { return db.Order("order_number asc") }).
		Preload("Sessions.Materials", materialCond).
		Preload("Sessions.Quizzes", quizCond).
		Preload("Sessions.Assignments", assignmentCond).
		Order("period_id desc, order_number asc")
	if periodID := c.Query("period_id"); periodID != "" {
		q = q.Where("period_id = ?", periodID)
	}
	if stageType := c.Query("type"); stageType != "" {
		if stageType == "kencana_universitas" {
			q = q.Where("type IN ?", []string{"kencana_universitas", "university"})
		} else {
			q = q.Where("type = ?", stageType)
		}
	}
	if role == "super_admin" || role == "kencana_admin" {
		if reqFakultasID := c.Query("fakultas_id"); reqFakultasID != "" {
			q = q.Where("fakultas_id = ?", reqFakultasID)
		} else {
			q = q.Where("fakultas_id IS NULL")
		}
	} else if role == "kencana_fakultas" {
		q = q.Where("fakultas_id = ?", fakultasID)
	}
	if err := q.Find(&stages).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat tahap"})
	}
	return c.JSON(fiber.Map{"success": true, "data": stages})
}

func CreateStage(c *fiber.Ctx) error {
	var stage models.KencanaStage
	if err := c.BodyParser(&stage); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload Tahap tidak valid"})
	}
	role, fakultasID := kencanaAdminScope(c)
	uid, _ := userID(c)
	stage.CreatedBy = &uid
	if role == "kencana_fakultas" {
		if fakultasID == 0 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Admin Kencana Fakultas belum memiliki scope fakultas"})
		}
		var period models.KencanaPeriod
		if err := config.DB.First(&period, stage.PeriodID).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"success": false, "message": "Periode tidak ditemukan"})
		}
		if !isKencanaUniversityCompleted(period) {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Tahap fakultas baru bisa dibuat setelah Kencana University selesai"})
		}
		_, err := facultyPhaseForRequest(c, stage.PeriodID)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Fase Kencana Fakultas tidak ditemukan"})
		}
		stage.FakultasID = &fakultasID
		stage.Type = "faculty"
	} else if role == "super_admin" || role == "kencana_admin" {
		if stage.Type != "faculty" {
			stage.FakultasID = nil
			if stage.Type == "" {
				stage.Type = "kencana_universitas"
			}
		} else if stage.FakultasID == nil || *stage.FakultasID == 0 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Fakultas wajib dipilih untuk timeline fakultas"})
		}
	}
	if err := config.DB.Create(&stage).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuat Tahap"})
	}
	return c.JSON(fiber.Map{"success": true, "data": stage})
}

func UpdateStage(c *fiber.Ctx) error {
	var stage models.KencanaStage
	role, fakultasID := kencanaAdminScope(c)
	q := config.DB
	if role == "kencana_fakultas" {
		q = q.Where("fakultas_id = ?", fakultasID)
	}
	if err := q.First(&stage, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Tahap tidak ditemukan atau di luar scope"})
	}
	if err := c.BodyParser(&stage); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload Tahap tidak valid"})
	}
	if role == "kencana_fakultas" {
		stage.FakultasID = &fakultasID
		stage.Type = "faculty"
	} else if role == "super_admin" || role == "kencana_admin" {
		if stage.Type != "faculty" {
			stage.FakultasID = nil
			if stage.Type == "" {
				stage.Type = "kencana_universitas"
			}
		}
	}
	if err := config.DB.Save(&stage).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui Tahap"})
	}
	return c.JSON(fiber.Map{"success": true, "data": stage})
}
func ListSessions(c *fiber.Ctx) error {
	var sessions []models.KencanaSession

	role, fakultasID := kencanaAdminScope(c)
	var fid *uint
	if role == "kencana_fakultas" {
		fid = &fakultasID
	} else {
		if reqFakultasID := c.QueryInt("fakultas_id"); reqFakultasID != 0 {
			uFid := uint(reqFakultasID)
			fid = &uFid
		}
	}

	materialCond := func(db *gorm.DB) *gorm.DB {
		if fid != nil {
			return db.Where("fakultas_id = ?", *fid).Order("order_number asc")
		}
		return db.Where("fakultas_id IS NULL").Order("order_number asc")
	}

	quizCond := func(db *gorm.DB) *gorm.DB {
		if fid != nil {
			return db.Where("fakultas_id = ?", *fid).Order("created_at asc")
		}
		return db.Where("fakultas_id IS NULL").Order("created_at asc")
	}

	assignmentCond := func(db *gorm.DB) *gorm.DB {
		if fid != nil {
			return db.Where("fakultas_id = ?", *fid).Order("created_at asc")
		}
		return db.Where("fakultas_id IS NULL").Order("created_at asc")
	}

	q := config.DB.Preload("Materials", materialCond).
		Preload("Quizzes", quizCond).
		Preload("Assignments", assignmentCond).
		Order("stage_id desc, order_number asc")

	if stageID := c.Query("stage_id"); stageID != "" {
		q = q.Where("stage_id = ?", stageID)
	}
	if periodID := c.Query("period_id"); periodID != "" {
		q = q.Where("stage_id IN (SELECT id FROM mahasiswa.kencana_stages WHERE period_id = ?)", periodID)
	}
	if scopeType := c.Query("scope_type"); scopeType != "" {
		if scopeType == "faculty" {
			q = q.Where("stage_id IN (SELECT id FROM mahasiswa.kencana_stages WHERE type = 'faculty')")
		} else if scopeType == "kencana_universitas" {
			q = q.Where("stage_id IN (SELECT id FROM mahasiswa.kencana_stages WHERE type = 'kencana_universitas')")
		}
	}
	if err := q.Find(&sessions).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat sesi"})
	}
	return c.JSON(fiber.Map{"success": true, "data": sessions})
}

func GetAdminSessionDetail(c *fiber.Ctx) error {
	role, fakultasID := kencanaAdminScope(c)
	var session models.KencanaSession

	q := config.DB
	if role == "kencana_fakultas" {
		q = q.Joins("JOIN mahasiswa.kencana_stages s ON s.id = kencana_sessions.stage_id").
			Where("s.fakultas_id = ?", fakultasID)
	}

	if err := q.First(&session, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Sesi tidak ditemukan atau di luar scope fakultas Anda"})
	}

	var fid *uint
	if role == "kencana_fakultas" {
		fid = &fakultasID
	} else {
		if reqFakultasID := c.QueryInt("fakultas_id"); reqFakultasID != 0 {
			uFid := uint(reqFakultasID)
			fid = &uFid
		}
	}

	materialCond := func(db *gorm.DB) *gorm.DB {
		if fid != nil {
			return db.Where("fakultas_id = ?", *fid).Order("order_number asc")
		}
		return db.Where("fakultas_id IS NULL").Order("order_number asc")
	}

	quizCond := func(db *gorm.DB) *gorm.DB {
		if fid != nil {
			return db.Where("fakultas_id = ?", *fid).Order("created_at asc")
		}
		return db.Where("fakultas_id IS NULL").Order("created_at asc")
	}

	assignmentCond := func(db *gorm.DB) *gorm.DB {
		if fid != nil {
			return db.Where("fakultas_id = ?", *fid).Order("created_at asc")
		}
		return db.Where("fakultas_id IS NULL").Order("created_at asc")
	}

	if err := config.DB.Preload("Materials", materialCond).
		Preload("Quizzes", quizCond).
		Preload("Assignments", assignmentCond).
		First(&session, session.ID).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat detail sesi"})
	}

	return c.JSON(fiber.Map{"success": true, "data": session})
}

func CreateSession(c *fiber.Ctx) error {
	var session models.KencanaSession
	if err := c.BodyParser(&session); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload Sesi tidak valid"})
	}
	role, fakultasID := kencanaAdminScope(c)
	uid, _ := userID(c)
	session.CreatedBy = &uid

	if role == "kencana_fakultas" {
		if fakultasID == 0 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Admin Kencana Fakultas belum memiliki scope fakultas"})
		}
		var stage models.KencanaStage
		if err := config.DB.Where("id = ? AND fakultas_id = ?", session.StageID, fakultasID).First(&stage).Error; err != nil {
			return c.Status(403).JSON(fiber.Map{"success": false, "message": "Akses ditolak. Tahap tidak ditemukan atau di luar scope fakultas Anda."})
		}
	} else if role == "super_admin" || role == "kencana_admin" {
		var stage models.KencanaStage
		if err := config.DB.First(&stage, session.StageID).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"success": false, "message": "Tahap tidak ditemukan"})
		}
	}

	if err := config.DB.Create(&session).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuat sesi"})
	}
	return c.JSON(fiber.Map{"success": true, "data": session})
}

func UpdateSession(c *fiber.Ctx) error {
	type sessionPayload struct {
		Title       string     `json:"title"`
		Description string     `json:"description"`
		Status      string     `json:"status"`
		IsRequired  bool       `json:"is_required"`
		StartDate   *time.Time `json:"start_date"`
		EndDate     *time.Time `json:"end_date"`
	}
	id := c.Params("id")
	var payload sessionPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload tidak valid"})
	}
	var session models.KencanaSession
	if err := config.DB.First(&session, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Sesi tidak ditemukan"})
	}

	role, fakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		var stage models.KencanaStage
		if err := config.DB.Where("id = ? AND fakultas_id = ?", session.StageID, fakultasID).First(&stage).Error; err != nil {
			return c.Status(403).JSON(fiber.Map{"success": false, "message": "Akses ditolak. Sesi di luar scope fakultas Anda."})
		}
	}

	session.Title = payload.Title
	session.Description = payload.Description
	session.Status = payload.Status
	session.IsRequired = payload.IsRequired
	session.StartDate = payload.StartDate
	session.EndDate = payload.EndDate

	if err := config.DB.Save(&session).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui sesi"})
	}
	// Cascade: if session inactive, lock all quizzes in it
	if payload.Status == "locked" || payload.Status == "draft" {
		config.DB.Model(&models.KencanaQuiz{}).Where("session_id = ?", session.ID).Update("status", "locked")
	} else if payload.Status == "active" || payload.Status == "published" {
		config.DB.Model(&models.KencanaQuiz{}).Where("session_id = ? AND status = ?", session.ID, "locked").Update("status", "published")
	}
	return c.JSON(fiber.Map{"success": true, "message": "Sesi diperbarui", "data": session})
}

func DeleteSession(c *fiber.Ctx) error {
	id := c.Params("id")
	var session models.KencanaSession
	if err := config.DB.First(&session, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Sesi tidak ditemukan"})
	}

	role, fakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		var stage models.KencanaStage
		if err := config.DB.Where("id = ? AND fakultas_id = ?", session.StageID, fakultasID).First(&stage).Error; err != nil {
			return c.Status(403).JSON(fiber.Map{"success": false, "message": "Akses ditolak. Sesi di luar scope fakultas Anda."})
		}
	}

	if err := config.DB.Delete(&session).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menghapus sesi"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Sesi berhasil dihapus"})
}

func CreateMaterial(c *fiber.Ctx) error { return createRecord(c, &models.KencanaMaterial{}, "Materi") }
func CreateQuiz(c *fiber.Ctx) error     { return createRecord(c, &models.KencanaQuiz{}, "Quiz") }
func UpdateQuiz(c *fiber.Ctx) error     { return updateRecord(c, &models.KencanaQuiz{}, "Quiz") }

func DeleteQuiz(c *fiber.Ctx) error {
	var quiz models.KencanaQuiz
	if err := config.DB.First(&quiz, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Quiz tidak ditemukan"})
	}
	role, fakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		if quiz.FakultasID == nil || *quiz.FakultasID != fakultasID {
			return c.Status(403).JSON(fiber.Map{"success": false, "message": "Akses ditolak. Anda tidak berwenang menghapus kuis ini."})
		}
	}
	if err := config.DB.Delete(&quiz).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menghapus kuis"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Kuis dihapus"})
}

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
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := strings.ToLower(c.Query("search"))

	var students []models.Mahasiswa
	q := config.DB.Model(&models.Mahasiswa{}).Preload("Fakultas").Preload("ProgramStudi")

	role, scopedFakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		if scopedFakultasID == 0 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Admin Kencana Fakultas belum memiliki scope fakultas"})
		}
		q = q.Where("fakultas_id = ?", scopedFakultasID)
	} else if facultyID := c.Query("fakultas_id"); facultyID != "" && facultyID != "all" {
		q = q.Where("fakultas_id = ?", facultyID)
	}

	if programStudiID := c.Query("program_studi_id"); programStudiID != "" && programStudiID != "all" {
		q = q.Where("program_studi_id = ?", programStudiID)
	}

	if mentorStatus := c.Query("mentor_status"); mentorStatus != "" && mentorStatus != "all" {
		if mentorStatus == "assigned" {
			q = q.Joins("JOIN mahasiswa.kencana_mentor_assignments ON mahasiswa.kencana_mentor_assignments.student_id = mahasiswa.mahasiswa.id AND mahasiswa.kencana_mentor_assignments.status = 'active'")
		} else if mentorStatus == "unassigned" {
			q = q.Joins("LEFT JOIN mahasiswa.kencana_mentor_assignments ON mahasiswa.kencana_mentor_assignments.student_id = mahasiswa.mahasiswa.id AND mahasiswa.kencana_mentor_assignments.status = 'active'").
				Where("mahasiswa.kencana_mentor_assignments.id IS NULL")
		}
	}

	if groupID := c.Query("group_id"); groupID != "" && groupID != "all" {
		q = q.Joins("JOIN mahasiswa.kencana_group_members ON mahasiswa.kencana_group_members.student_id = mahasiswa.mahasiswa.id").
			Where("mahasiswa.kencana_group_members.group_id = ?", groupID)
	}

	if search != "" {
		q = q.Where("LOWER(mahasiswa.mahasiswa.nama) LIKE ? OR LOWER(mahasiswa.mahasiswa.nim) LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	q.Session(&gorm.Session{}).Count(&total)

	q = q.Order("nama asc").Offset((page - 1) * limit).Limit(limit)

	if err := q.Find(&students).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat peserta: " + err.Error()})
	}

	// Fetch active mentor assignments (optimized)
	var studentIDs []uint
	for _, s := range students {
		studentIDs = append(studentIDs, s.ID)
	}

	var assignments []models.KencanaMentorAssignment
	if len(studentIDs) > 0 {
		config.DB.Preload("Mentor.User").Where("status = ? AND student_id IN ?", "active", studentIDs).Find(&assignments)
	}

	assignmentMap := make(map[uint]models.KencanaMentorAssignment)
	for _, a := range assignments {
		assignmentMap[a.StudentID] = a
	}

	groupMap := make(map[uint]models.KencanaGroupMember)
	periodID := uint(c.QueryInt("period_id"))
	if periodID == 0 {
		if period, err := activePeriod(config.DB); err == nil {
			periodID = period.ID
		}
	}
	if len(studentIDs) > 0 && periodID != 0 {
		var groupMembers []models.KencanaGroupMember
		config.DB.Preload("Group.Mentor").Where("period_id = ? AND status = ? AND student_id IN ?", periodID, "active", studentIDs).Find(&groupMembers)
		for _, gm := range groupMembers {
			groupMap[gm.StudentID] = gm
		}
	}

	results := []fiber.Map{}
	for _, s := range students {
		mentorName := "-"
		if a, ok := assignmentMap[s.ID]; ok {
			mentorName = a.Mentor.Name
		}
		groupID := uint(0)
		groupName := "-"
		groupCode := "-"
		groupNumber := 0
		if gm, ok := groupMap[s.ID]; ok {
			groupID = gm.GroupID
			groupName = gm.Group.Name
			groupCode = gm.Group.Code
			groupNumber = gm.Group.GroupNumber
			if gm.Group.Mentor != nil && gm.Group.Mentor.Name != "" {
				mentorName = gm.Group.Mentor.Name
			}
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
			"group_id":           groupID,
			"group_name":         groupName,
			"group_code":         groupCode,
			"group_number":       groupNumber,
		})
	}

	totalPages := 1
	if limit > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    results,
		"meta": fiber.Map{
			"current_page": page,
			"per_page":     limit,
			"total_pages":  totalPages,
			"total_data":   total,
		},
	})
}

func ListScores(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := strings.ToLower(c.Query("search"))
	periodID := uint(c.QueryInt("period_id"))
	if periodID == 0 {
		period, err := activePeriod(config.DB)
		if err == nil {
			periodID = period.ID
		}
	}

	var students []models.Mahasiswa
	q := config.DB.Model(&models.Mahasiswa{}).Preload("Pengguna").Preload("Fakultas").Preload("ProgramStudi")

	role, scopedFakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		if scopedFakultasID == 0 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Admin Kencana Fakultas belum memiliki scope fakultas"})
		}
		q = q.Where("fakultas_id = ?", scopedFakultasID)
	} else if facultyID := c.Query("fakultas_id"); facultyID != "" && facultyID != "all" {
		q = q.Where("fakultas_id = ?", facultyID)
	}

	if programStudiID := c.Query("program_studi_id"); programStudiID != "" && programStudiID != "all" {
		q = q.Where("program_studi_id = ?", programStudiID)
	}

	if groupID := c.Query("group_id"); groupID != "" && groupID != "all" && periodID != 0 {
		q = q.Joins("JOIN mahasiswa.kencana_group_members ON mahasiswa.kencana_group_members.student_id = mahasiswa.mahasiswa.id AND mahasiswa.kencana_group_members.period_id = ?", periodID).
			Where("mahasiswa.kencana_group_members.group_id = ?", groupID)
	}

	if search != "" {
		q = q.Where("LOWER(mahasiswa.mahasiswa.nama) LIKE ? OR LOWER(mahasiswa.mahasiswa.nim) LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if status := c.Query("status"); status != "" && status != "all" {
		if status == "belum_lengkap" {
			q = q.Joins("LEFT JOIN mahasiswa.kencana_scores AS ks_status ON ks_status.student_id = mahasiswa.mahasiswa.id AND ks_status.period_id = ?", periodID).
				Where("ks_status.graduation_status IS NULL OR ks_status.graduation_status IN ('not_started', 'in_progress')")
		} else {
			q = q.Joins("LEFT JOIN mahasiswa.kencana_scores AS ks_status ON ks_status.student_id = mahasiswa.mahasiswa.id AND ks_status.period_id = ?", periodID).
				Where("ks_status.graduation_status = ?", status)
		}
	}

	var total int64
	q.Session(&gorm.Session{}).Count(&total)

	sortBy := c.Query("sort_by", "nama")
	sortOrder := strings.ToLower(c.Query("sort_order", "asc"))
	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "asc"
	}

	if sortBy == "final_score" || sortBy == "cognitive" || sortBy == "affective" || sortBy == "psychomotor" {
		q = q.Joins("LEFT JOIN mahasiswa.kencana_scores ON mahasiswa.kencana_scores.student_id = mahasiswa.mahasiswa.id AND mahasiswa.kencana_scores.period_id = ?", periodID)
		if sortBy == "final_score" {
			q = q.Order(fmt.Sprintf("mahasiswa.kencana_scores.final_score %s NULLS LAST", sortOrder))
		} else if sortBy == "cognitive" {
			q = q.Order(fmt.Sprintf("mahasiswa.kencana_scores.cognitive_weighted %s NULLS LAST", sortOrder))
		} else if sortBy == "affective" {
			q = q.Order(fmt.Sprintf("mahasiswa.kencana_scores.affective_weighted %s NULLS LAST", sortOrder))
		} else if sortBy == "psychomotor" {
			q = q.Order(fmt.Sprintf("mahasiswa.kencana_scores.psychomotor_weighted %s NULLS LAST", sortOrder))
		}
	} else if sortBy == "status" {
		q = q.Joins("LEFT JOIN mahasiswa.kencana_scores ON mahasiswa.kencana_scores.student_id = mahasiswa.mahasiswa.id AND mahasiswa.kencana_scores.period_id = ?", periodID).
			Order(fmt.Sprintf("mahasiswa.kencana_scores.graduation_status %s NULLS LAST", sortOrder))
	} else {
		q = q.Order(fmt.Sprintf("mahasiswa.mahasiswa.nama %s", sortOrder))
	}

	q = q.Offset((page - 1) * limit).Limit(limit)

	if err := q.Find(&students).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat nilai"})
	}

	studentIDs := make([]uint, 0, len(students))
	for _, student := range students {
		studentIDs = append(studentIDs, student.ID)
	}

	// Fetch groups for these students
	groupMap := map[uint]string{}
	if len(studentIDs) > 0 && periodID != 0 {
		var members []models.KencanaGroupMember
		config.DB.Preload("Group").Where("period_id = ? AND student_id IN ?", periodID, studentIDs).Find(&members)
		for _, m := range members {
			groupMap[m.StudentID] = m.Group.Name
		}
	}

	scoreMap := map[uint]models.KencanaScore{}
	if len(studentIDs) > 0 && periodID != 0 {
		var existingScores []models.KencanaScore
		config.DB.Where("period_id = ? AND student_id IN ?", periodID, studentIDs).Find(&existingScores)
		for _, score := range existingScores {
			scoreMap[score.StudentID] = score
		}
	}

	type ScoreResponse struct {
		models.KencanaScore
		GroupName string `json:"group_name"`
	}

	scores := make([]ScoreResponse, 0, len(students))
	for _, student := range students {
		score, ok := scoreMap[student.ID]
		if !ok {
			score = models.KencanaScore{
				PeriodID:         periodID,
				StudentID:        student.ID,
				GraduationStatus: "not_started",
			}
		}
		score.Student = student
		scores = append(scores, ScoreResponse{
			KencanaScore: score,
			GroupName:    groupMap[student.ID],
		})
	}

	totalPages := 1
	if limit > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    scores,
		"meta": fiber.Map{
			"current_page": page,
			"per_page":     limit,
			"total_pages":  totalPages,
			"total_data":   total,
		},
	})
}

// ScoreSummary — Rekap keseluruhan per kelompok: jumlah lulus, tidak lulus, dll.
func ScoreSummary(c *fiber.Ctx) error {
	periodID := uint(c.QueryInt("period_id"))
	if periodID == 0 {
		period, err := activePeriod(config.DB)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Periode tidak ditemukan"})
		}
		periodID = period.ID
	}

	type GroupSummaryRow struct {
		GroupID      uint   `json:"group_id"`
		GroupNumber  int    `json:"group_number"`
		GroupName    string `json:"group_name"`
		FakultasName string `json:"fakultas_name"`
		Lulus        int    `json:"lulus"`
		TidakLulus   int    `json:"tidak_lulus"`
		Bersyarat    int    `json:"bersyarat"`
		BelumMulai   int    `json:"belum_mulai"`
		Keluar       int    `json:"keluar"`
		Total        int    `json:"total"`
	}

	// Get all groups for this period
	var groups []models.KencanaGroup
	q := config.DB.Preload("Fakultas").Where("period_id = ?", periodID).Order("group_number asc")
	_, scopedFakultasID := kencanaAdminScope(c)
	if scopedFakultasID != 0 {
		q = q.Where("fakultas_id = ?", scopedFakultasID)
	} else {
		q = q.Where("scope_type = ?", "university")
	}
	if err := q.Find(&groups).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat kelompok"})
	}

	// Get all members for this period
	type memberScore struct {
		StudentID uint
		Status    string
	}
	var members []models.KencanaGroupMember
	config.DB.Where("period_id = ?", periodID).Find(&members)

	// Get all scores for this period
	var allScores []models.KencanaScore
	config.DB.Where("period_id = ?", periodID).Find(&allScores)
	scoreByStudent := map[uint]string{}
	for _, s := range allScores {
		scoreByStudent[s.StudentID] = s.GraduationStatus
	}

	// Group members by group_id
	membersByGroup := map[uint][]uint{}
	for _, m := range members {
		membersByGroup[m.GroupID] = append(membersByGroup[m.GroupID], m.StudentID)
	}

	rows := make([]GroupSummaryRow, 0, len(groups))
	totals := GroupSummaryRow{GroupName: "TOTAL"}

	for _, g := range groups {
		row := GroupSummaryRow{
			GroupID:     g.ID,
			GroupNumber: g.GroupNumber,
			GroupName:   g.Name,
		}
		if g.Fakultas != nil {
			row.FakultasName = g.Fakultas.Nama
		}
		for _, sid := range membersByGroup[g.ID] {
			row.Total++
			switch scoreByStudent[sid] {
			case "passed":
				row.Lulus++
			case "not_eligible", "remedial":
				row.TidakLulus++
			case "conditional_pass":
				row.Bersyarat++
			case "dropped_out":
				row.Keluar++
			default:
				row.BelumMulai++
			}
		}
		totals.Lulus += row.Lulus
		totals.TidakLulus += row.TidakLulus
		totals.Bersyarat += row.Bersyarat
		totals.Keluar += row.Keluar
		totals.BelumMulai += row.BelumMulai
		totals.Total += row.Total
		rows = append(rows, row)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    rows,
		"totals":  totals,
		"period_id": periodID,
	})
}

func ListRemedials(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := strings.ToLower(c.Query("search"))

	var remedials []models.KencanaRemedial
	q := config.DB.Model(&models.KencanaRemedial{}).Preload("Student").Preload("Student.Fakultas").Preload("Student.ProgramStudi")

	if periodID := c.Query("period_id"); periodID != "" {
		q = q.Where("period_id = ?", periodID)
	}

	role, scopedFakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		if scopedFakultasID == 0 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Admin Kencana Fakultas belum memiliki scope fakultas"})
		}
		q = q.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kencana_remedials.student_id").Where("mahasiswa.mahasiswa.fakultas_id = ?", scopedFakultasID)
	} else if facultyID := c.Query("fakultas_id"); facultyID != "" && facultyID != "all" {
		q = q.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kencana_remedials.student_id").Where("mahasiswa.mahasiswa.fakultas_id = ?", facultyID)
	}

	if search != "" {
		if role != "kencana_fakultas" && c.Query("fakultas_id") == "" {
			q = q.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kencana_remedials.student_id")
		}
		q = q.Where("LOWER(mahasiswa.mahasiswa.nama) LIKE ? OR LOWER(mahasiswa.mahasiswa.nim) LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	q.Session(&gorm.Session{}).Count(&total)

	q = q.Order("created_at desc").Offset((page - 1) * limit).Limit(limit)

	if err := q.Find(&remedials).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat remedial"})
	}

	totalPages := 1
	if limit > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    remedials,
		"meta": fiber.Map{
			"current_page": page,
			"per_page":     limit,
			"total_pages":  totalPages,
			"total_data":   total,
		},
	})
}

func ListCertificates(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := strings.ToLower(c.Query("search"))

	var certs []models.KencanaCertificate
	q := config.DB.Model(&models.KencanaCertificate{}).Preload("Student").Preload("Student.Fakultas").Preload("Student.ProgramStudi")

	if periodID := c.Query("period_id"); periodID != "" {
		q = q.Where("period_id = ?", periodID)
	}

	role, scopedFakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		if scopedFakultasID == 0 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Admin Kencana Fakultas belum memiliki scope fakultas"})
		}
		q = q.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kencana_certificates.student_id").Where("mahasiswa.mahasiswa.fakultas_id = ?", scopedFakultasID)
	} else if facultyID := c.Query("fakultas_id"); facultyID != "" && facultyID != "all" {
		q = q.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kencana_certificates.student_id").Where("mahasiswa.mahasiswa.fakultas_id = ?", facultyID)
	}

	if groupID := c.Query("group_id"); groupID != "" && groupID != "all" {
		// join group
		if role != "kencana_fakultas" && c.Query("fakultas_id") == "" {
			q = q.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kencana_certificates.student_id")
		}
		q = q.Joins("JOIN mahasiswa.kencana_group_members ON mahasiswa.kencana_group_members.student_id = mahasiswa.mahasiswa.id AND mahasiswa.kencana_group_members.period_id = mahasiswa.kencana_certificates.period_id").
			Where("mahasiswa.kencana_group_members.group_id = ?", groupID)
	}

	if search != "" {
		if role != "kencana_fakultas" && c.Query("fakultas_id") == "" && c.Query("group_id") == "" {
			q = q.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kencana_certificates.student_id")
		}
		q = q.Where("LOWER(mahasiswa.mahasiswa.nama) LIKE ? OR LOWER(mahasiswa.mahasiswa.nim) LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	q.Session(&gorm.Session{}).Count(&total)

	q = q.Order("created_at desc").Offset((page - 1) * limit).Limit(limit)

	if err := q.Find(&certs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat sertifikat"})
	}

	studentIDs := make([]uint, 0, len(certs))
	for _, cert := range certs {
		studentIDs = append(studentIDs, cert.StudentID)
	}

	type CertResponse struct {
		models.KencanaCertificate
		GroupName  string `json:"group_name"`
		MentorName string `json:"mentor_name"`
	}

	periodID := c.Query("period_id")
	responses := make([]CertResponse, 0, len(certs))
	if len(studentIDs) > 0 && periodID != "" {
		var members []models.KencanaGroupMember
		groupMap := map[uint]string{}
		mentorMap := map[uint]string{}

		config.DB.Preload("Group").Preload("Group.Mentor").Where("period_id = ? AND student_id IN ?", periodID, studentIDs).Find(&members)
		for _, m := range members {
			groupMap[m.StudentID] = m.Group.Name
			if m.Group.Mentor != nil {
				mentorMap[m.StudentID] = m.Group.Mentor.Name
			}
		}

		for _, cert := range certs {
			responses = append(responses, CertResponse{
				KencanaCertificate: cert,
				GroupName:          groupMap[cert.StudentID],
				MentorName:         mentorMap[cert.StudentID],
			})
		}
	} else {
		for _, cert := range certs {
			responses = append(responses, CertResponse{
				KencanaCertificate: cert,
			})
		}
	}

	totalPages := 1
	if limit > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    responses,
		"meta": fiber.Map{
			"current_page": page,
			"per_page":     limit,
			"total_pages":  totalPages,
			"total_data":   total,
		},
	})
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
	
	// Get Student Data
	var student models.Mahasiswa
	if err := config.DB.First(&student, req.StudentID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	// Make sure dir exists
	uploadDir := "./uploads/kencana/sertifikat"
	os.MkdirAll(uploadDir, 0755)

	certNumber := fmt.Sprintf("KNC-%d-%d", req.PeriodID, req.StudentID)
	filename := fmt.Sprintf("%s.pdf", certNumber)
	savePath := filepath.Join(uploadDir, filename)

	// Generate PDF
	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.AddPage()

	// Add Template Background (Template dimensions ~ 297x210 mm for A4 Landscape)
	templatePath := "./uploads/kencana/templates/certificate_template.png"
	pdf.ImageOptions(templatePath, 0, 0, 297, 210, false, gofpdf.ImageOptions{ReadDpi: true}, 0, "")

	// Set Font
	pdf.SetFont("Arial", "BI", 28)
	pdf.SetTextColor(0, 0, 0)

	// Write Name
	// Calculate text width to center it
	nameText := strings.ToUpper(student.Nama)
	if student.Nama == "" {
		nameText = "NAMA MAHASISWA"
	}
	pdf.SetY(95)
	pdf.CellFormat(297, 10, nameText, "", 0, "C", false, 0, "")

	// Write NPM
	pdf.SetFont("Arial", "I", 14)
	pdf.SetY(175)
	npmText := student.NIM
	if npmText == "" {
		npmText = "NPM: -"
	}
	// We put NPM at the bottom right based on the template structure <<Nama>> NPM. ...
	pdf.CellFormat(235, 10, fmt.Sprintf("NPM. %s", npmText), "", 0, "R", false, 0, "")

	if err := pdf.OutputFileAndClose(savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mencetak PDF sertifikat", "error": err.Error()})
	}

	now := time.Now()
	var cert models.KencanaCertificate
	if err := config.DB.Where("period_id = ? AND student_id = ?", req.PeriodID, req.StudentID).First(&cert).Error; err != nil {
		cert = models.KencanaCertificate{
			PeriodID: req.PeriodID, StudentID: req.StudentID, CertificateNumber: certNumber,
		}
	}
	cert.FileURL = "/uploads/kencana/sertifikat/" + filename
	cert.IssuedAt = &now
	cert.Status = "published"

	if err := config.DB.Save(&cert).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal update status sertifikat"})
	}

	return c.JSON(fiber.Map{"success": true, "data": cert, "message": "Sertifikat berhasil di-generate"})
}

func ListMentors(c *fiber.Ctx) error {
	var mentors []models.KencanaMentor
	q := applyKencanaMentorScope(c, config.DB.Preload("Fakultas").Preload("User").Preload("Mahasiswa").Preload("Mahasiswa.ProgramStudi").Order("created_at desc"))
	if err := q.Find(&mentors).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat mentor"})
	}
	return c.JSON(fiber.Map{"success": true, "data": mentors})
}

func CreateMentor(c *fiber.Ctx) error {
	type reqBody struct {
		UserID     uint   `json:"user_id"`
		ScopeType  string `json:"scope_type"`
		FakultasID uint   `json:"fakultas_id"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload mentor tidak valid"})
	}
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
			if p == "*" || p == "kencana.faculty.mentor.manage" || p == "kencana.mentor.university.manage" || p == "faculty.view" {
				hasPerm = true
				break
			}
		}
		if !hasPerm && role != "super_admin" {
			return c.Status(403).JSON(fiber.Map{"success": false, "message": "Anda tidak memiliki izin (permission) untuk membuat mentor"})
		}
	}
	isFacultyRole := strings.Contains(role, "fakultas") || strings.Contains(role, "faculty") || role == "kencana_fakultas"
	
	if isFacultyRole {
		if adminFakultasID == 0 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Admin Kencana Fakultas belum memiliki scope fakultas"})
		}
		req.ScopeType = "faculty"
		req.FakultasID = adminFakultasID
	} else if role == "kencana_admin" {
		req.ScopeType = "university"
		req.FakultasID = 0
	}
	if req.UserID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Mahasiswa (UserID) wajib dipilih"})
	}
	if req.ScopeType == "faculty" && req.FakultasID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Fakultas wajib dipilih untuk mentor fakultas"})
	}

	var mhs models.Mahasiswa
	if err := config.DB.Preload("Pengguna").Where("pengguna_id = ?", req.UserID).First(&mhs).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data mahasiswa tidak ditemukan"})
	}

	var mentor models.KencanaMentor
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		mentor = models.KencanaMentor{
			UserID:       req.UserID,
			Name:         mhs.Nama,
			Email:        mhs.Pengguna.Email,
			Phone:        mhs.NoHP,
			JenisKelamin: mhs.JenisKelamin,
			ScopeType:    req.ScopeType,
			Status:       "active",
		}
		if req.FakultasID != 0 {
			mentor.FakultasID = &req.FakultasID
		}
		return tx.Create(&mentor).Error
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuat mentor: " + err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": mentor, "message": "Pembimbing berhasil ditambahkan"})
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
	isFacultyRole := strings.Contains(role, "fakultas") || strings.Contains(role, "faculty") || role == "kencana_fakultas"
	if isFacultyRole {
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
	if err := q.Unscoped().Delete(&models.KencanaMentor{}, c.Params("id")).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menghapus mentor"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Mentor dihapus permanen"})
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

func applyKencanaGroupScope(c *fiber.Ctx, q *gorm.DB) *gorm.DB {
	role, fakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		return q.Where("fakultas_id = ?", fakultasID)
	}
	return q
}

func ListGroups(c *fiber.Ctx) error {
	var groups []models.KencanaGroup
	q := config.DB.Model(&models.KencanaGroup{}).Preload("Period").Preload("Fakultas").Preload("Mentor").Preload("Members").Order("group_number asc, name asc")
	if periodID := c.Query("period_id"); periodID != "" {
		q = q.Where("period_id = ?", periodID)
	}
	if scopeType := c.Query("scope_type"); scopeType != "" && scopeType != "all" {
		q = q.Where("scope_type = ?", scopeType)
	}
	if status := c.Query("status"); status != "" && status != "all" {
		q = q.Where("status = ?", status)
	}
	if facultyID := c.Query("fakultas_id"); facultyID != "" && facultyID != "all" {
		q = q.Where("fakultas_id = ?", facultyID)
	}
	if search := strings.ToLower(c.Query("search")); search != "" {
		q = q.Where("LOWER(name) LIKE ? OR LOWER(code) LIKE ?", "%"+search+"%", "%"+search+"%")
	}
	q = applyKencanaGroupScope(c, q)
	if err := q.Find(&groups).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memuat kelompok"})
	}
	results := make([]fiber.Map, 0, len(groups))
	for _, group := range groups {
		results = append(results, groupResponse(group))
	}
	return c.JSON(fiber.Map{"success": true, "data": results})
}

func GetGroup(c *fiber.Ctx) error {
	var group models.KencanaGroup
	q := config.DB.Preload("Period").Preload("Fakultas").Preload("Mentor").Preload("Members.Student.Fakultas").Preload("Members.Student.ProgramStudi")
	q = applyKencanaGroupScope(c, q)
	if err := q.First(&group, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Kelompok tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "data": groupResponse(group)})
}

func CreateGroup(c *fiber.Ctx) error {
	var group models.KencanaGroup
	if err := c.BodyParser(&group); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload kelompok tidak valid"})
	}
	role, scopedFakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		if scopedFakultasID == 0 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Scope fakultas tidak ditemukan"})
		}
		group.ScopeType = "faculty"
		group.FakultasID = &scopedFakultasID
	}
	if group.PeriodID == 0 || group.Name == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Periode dan nama kelompok wajib diisi"})
	}
	prepareGroupDefaults(&group)
	uid, _ := userID(c)
	group.CreatedBy = &uid
	if err := validateGroupMentorScope(&group); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	if err := config.DB.Create(&group).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuat kelompok"})
	}
	config.DB.Preload("Period").Preload("Fakultas").Preload("Mentor").Preload("Members").First(&group, group.ID)
	return c.JSON(fiber.Map{"success": true, "data": groupResponse(group), "message": "Kelompok berhasil dibuat"})
}

func UpdateGroup(c *fiber.Ctx) error {
	var group models.KencanaGroup
	q := applyKencanaGroupScope(c, config.DB.Model(&models.KencanaGroup{}))
	if err := q.First(&group, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Kelompok tidak ditemukan"})
	}
	var payload models.KencanaGroup
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload kelompok tidak valid"})
	}
	role, scopedFakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		payload.ScopeType = "faculty"
		payload.FakultasID = &scopedFakultasID
	}
	if payload.PeriodID == 0 {
		payload.PeriodID = group.PeriodID
	}
	if payload.Name == "" {
		payload.Name = group.Name
	}
	if payload.ScopeType == "" {
		payload.ScopeType = group.ScopeType
	}
	if payload.Capacity <= 0 {
		payload.Capacity = group.Capacity
	}
	if payload.Status == "" {
		payload.Status = group.Status
	}
	prepareGroupDefaults(&payload)
	if err := validateGroupMentorScope(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	updates := map[string]interface{}{"period_id": payload.PeriodID, "fakultas_id": payload.FakultasID, "mentor_id": payload.MentorID, "name": payload.Name, "code": payload.Code, "description": payload.Description, "scope_type": payload.ScopeType, "capacity": payload.Capacity, "status": payload.Status}
	if err := config.DB.Model(&group).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui kelompok"})
	}
	config.DB.Preload("Period").Preload("Fakultas").Preload("Mentor").Preload("Members").First(&group, group.ID)
	return c.JSON(fiber.Map{"success": true, "data": groupResponse(group), "message": "Kelompok berhasil diperbarui"})
}

func DeleteGroup(c *fiber.Ctx) error {
	var group models.KencanaGroup
	q := applyKencanaGroupScope(c, config.DB.Model(&models.KencanaGroup{}))
	if err := q.First(&group, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Kelompok tidak ditemukan"})
	}
	if err := config.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("group_id = ?", group.ID).Delete(&models.KencanaGroupMember{}).Error; err != nil {
			return err
		}
		return tx.Delete(&group).Error
	}); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menghapus kelompok"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Kelompok berhasil dihapus"})
}

func AddGroupMembers(c *fiber.Ctx) error {
	var group models.KencanaGroup
	q := applyKencanaGroupScope(c, config.DB.Model(&models.KencanaGroup{}))
	if err := q.First(&group, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Kelompok tidak ditemukan"})
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
	for _, studentID := range req.StudentIDs {
		if err := validateStudentForGroup(group, studentID); err != nil {
			continue
		}
		var existing models.KencanaGroupMember
		err := config.DB.Unscoped().Where("period_id = ? AND student_id = ?", group.PeriodID, studentID).First(&existing).Error
		if err == nil {
			existing.GroupID = group.ID
			existing.Status = "active"
			existing.DeletedAt = gorm.DeletedAt{}
			existing.JoinedAt = &now
			existing.AddedBy = &uid
			if config.DB.Unscoped().Save(&existing).Error == nil {
				added++
			}
		} else {
			member := models.KencanaGroupMember{GroupID: group.ID, PeriodID: group.PeriodID, StudentID: studentID, Status: "active", JoinedAt: &now, AddedBy: &uid}
			if config.DB.Create(&member).Error == nil {
				added++
			}
		}
	}
	return c.JSON(fiber.Map{"success": true, "message": fmt.Sprintf("%d mahasiswa dimasukkan ke kelompok", added)})
}

func RemoveGroupMember(c *fiber.Ctx) error {
	var group models.KencanaGroup
	q := applyKencanaGroupScope(c, config.DB.Model(&models.KencanaGroup{}))
	if err := q.First(&group, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Kelompok tidak ditemukan"})
	}
	studentParam, err := c.ParamsInt("studentId")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "student_id tidak valid"})
	}
	studentID := uint(studentParam)
	if studentID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "student_id wajib diisi"})
	}
	if err := config.DB.Where("group_id = ? AND student_id = ?", group.ID, studentID).Delete(&models.KencanaGroupMember{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengeluarkan anggota"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Anggota dikeluarkan dari kelompok"})
}

func AutoAssignGroups(c *fiber.Ctx) error {
	var req struct {
		PeriodID       uint   `json:"period_id"`
		ScopeType      string `json:"scope_type"`
		FakultasID     *uint  `json:"fakultas_id"`
		Prefix         string `json:"prefix"`
		GroupCount     int    `json:"group_count"`
		Capacity       int    `json:"capacity"`
		OnlyUnassigned bool   `json:"only_unassigned"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload auto assign tidak valid"})
	}
	role, scopedFakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		req.ScopeType = "faculty"
		req.FakultasID = &scopedFakultasID
	}
	if req.PeriodID == 0 || req.GroupCount <= 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "period_id dan group_count wajib diisi"})
	}
	if req.ScopeType == "" {
		req.ScopeType = "university"
	}
	if req.Prefix == "" {
		req.Prefix = "Kelompok"
	}
	if req.Capacity <= 0 {
		req.Capacity = 30
	}
	uid, _ := userID(c)
	var students []models.Mahasiswa
	studentQ := config.DB.Order("nama asc")
	if req.ScopeType == "faculty" && req.FakultasID != nil {
		studentQ = studentQ.Where("fakultas_id = ?", *req.FakultasID)
	}
	if req.OnlyUnassigned {
		studentQ = studentQ.Joins("LEFT JOIN mahasiswa.kencana_group_members ON mahasiswa.kencana_group_members.student_id = mahasiswa.mahasiswa.id AND mahasiswa.kencana_group_members.period_id = ?", req.PeriodID).Where("mahasiswa.kencana_group_members.id IS NULL")
	}
	studentQ.Find(&students)
	if len(students) == 0 {
		return c.JSON(fiber.Map{"success": true, "message": "Tidak ada mahasiswa untuk dibagi", "data": []models.KencanaGroup{}})
	}
	groups := make([]models.KencanaGroup, 0, req.GroupCount)
	if err := config.DB.Transaction(func(tx *gorm.DB) error {
		for i := 1; i <= req.GroupCount; i++ {
			group := models.KencanaGroup{PeriodID: req.PeriodID, FakultasID: req.FakultasID, GroupNumber: i, Name: fmt.Sprintf("%s %d", req.Prefix, i), Code: fmt.Sprintf("KEL-%02d", i), ScopeType: req.ScopeType, Capacity: req.Capacity, Status: "active", CreatedBy: &uid}
			if err := tx.Create(&group).Error; err != nil {
				return err
			}
			groups = append(groups, group)
		}
		now := time.Now()
		for idx, student := range students {
			group := groups[idx%len(groups)]
			member := models.KencanaGroupMember{GroupID: group.ID, PeriodID: req.PeriodID, StudentID: student.ID, Status: "active", JoinedAt: &now, AddedBy: &uid}
			if err := tx.Where("period_id = ? AND student_id = ?", req.PeriodID, student.ID).Assign(member).FirstOrCreate(&member).Error; err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membagi kelompok"})
	}
	return c.JSON(fiber.Map{"success": true, "data": groups, "message": fmt.Sprintf("%d mahasiswa dibagi ke %d kelompok", len(students), len(groups))})
}

func prepareGroupDefaults(group *models.KencanaGroup) {
	if group.ScopeType == "" {
		group.ScopeType = "university"
	}
	if group.ScopeType == "university" {
		group.FakultasID = nil
	}
	if group.Capacity <= 0 {
		group.Capacity = 30
	}
	if group.Status == "" {
		group.Status = "active"
	}
	if group.MentorID != nil && *group.MentorID == 0 {
		group.MentorID = nil
	}
}

func validateGroupMentorScope(group *models.KencanaGroup) error {
	if group.MentorID == nil || *group.MentorID == 0 {
		group.MentorID = nil
		return nil
	}
	var mentor models.KencanaMentor
	if err := config.DB.First(&mentor, *group.MentorID).Error; err != nil {
		return fmt.Errorf("mentor tidak ditemukan")
	}
	if group.ScopeType == "faculty" {
		if group.FakultasID == nil || mentor.FakultasID == nil || *mentor.FakultasID != *group.FakultasID {
			return fmt.Errorf("mentor harus sesuai fakultas kelompok")
		}
	} else if mentor.ScopeType == "faculty" {
		return fmt.Errorf("kelompok university harus memakai mentor scope university")
	}
	return nil
}

func validateStudentForGroup(group models.KencanaGroup, studentID uint) error {
	var student models.Mahasiswa
	if err := config.DB.First(&student, studentID).Error; err != nil {
		return err
	}
	if group.ScopeType == "faculty" {
		if group.FakultasID == nil || student.FakultasID != *group.FakultasID {
			return fmt.Errorf("mahasiswa tidak sesuai fakultas kelompok")
		}
	}
	return nil
}

func groupResponse(group models.KencanaGroup) fiber.Map {
	members := make([]fiber.Map, 0, len(group.Members))
	for _, member := range group.Members {
		student := member.Student
		members = append(members, fiber.Map{"id": member.ID, "student_id": member.StudentID, "status": member.Status, "joined_at": member.JoinedAt, "student": fiber.Map{"id": student.ID, "nim": student.NIM, "nama": student.Nama, "fakultas_name": student.Fakultas.Nama, "program_studi_name": student.ProgramStudi.Nama}})
	}
	mentorName := "-"
	if group.Mentor != nil {
		mentorName = group.Mentor.Name
	}
	fakultasName := "-"
	if group.Fakultas != nil {
		fakultasName = group.Fakultas.Nama
	}
	return fiber.Map{
		"id": group.ID, "period_id": group.PeriodID, "fakultas_id": group.FakultasID, "fakultas_name": fakultasName,
		"mentor_id": group.MentorID, "mentor_name": mentorName, "group_number": group.GroupNumber, "name": group.Name, "code": group.Code, "description": group.Description,
		"scope_type": group.ScopeType, "capacity": group.Capacity, "status": group.Status,
		"members_count": len(group.Members), "members": members,
	}
}

func createRecord(c *fiber.Ctx, dest any, label string) error {
	if err := c.BodyParser(dest); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload " + label + " tidak valid"})
	}
	role, fakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" && fakultasID != 0 {
		if fScoped, ok := dest.(interface{ SetFakultasID(id *uint) }); ok {
			fScoped.SetFakultasID(&fakultasID)
		}
	} else if role == "super_admin" || role == "kencana_admin" {
		if reqFakultasID := c.QueryInt("fakultas_id"); reqFakultasID != 0 {
			uFid := uint(reqFakultasID)
			if fScoped, ok := dest.(interface{ SetFakultasID(id *uint) }); ok {
				fScoped.SetFakultasID(&uFid)
			}
		}
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
	role, fakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		if fScoped, ok := dest.(interface{ GetFakultasID() *uint }); ok {
			fid := fScoped.GetFakultasID()
			if fid == nil || *fid != fakultasID {
				return c.Status(403).JSON(fiber.Map{"success": false, "message": "Akses ditolak. Anda tidak berwenang memperbarui item ini."})
			}
		}
	}
	if err := c.BodyParser(dest); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload " + label + " tidak valid"})
	}
	if role == "kencana_fakultas" && fakultasID != 0 {
		if fScoped, ok := dest.(interface{ SetFakultasID(id *uint) }); ok {
			fScoped.SetFakultasID(&fakultasID)
		}
	}
	if err := config.DB.Save(dest).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui " + label})
	}
	return c.JSON(fiber.Map{"success": true, "data": dest})
}

// ──────────────────────────────────────────────
//  MATERIAL MANAGEMENT
// ──────────────────────────────────────────────

func UpdateMaterial(c *fiber.Ctx) error { return updateRecord(c, &models.KencanaMaterial{}, "Materi") }

func DeleteMaterial(c *fiber.Ctx) error {
	var m models.KencanaMaterial
	if err := config.DB.First(&m, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Materi tidak ditemukan"})
	}
	role, fakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		if m.FakultasID == nil || *m.FakultasID != fakultasID {
			return c.Status(403).JSON(fiber.Map{"success": false, "message": "Akses ditolak. Anda tidak berwenang menghapus materi ini."})
		}
	}
	// Hapus file fisik jika ada
	if m.FileURL != "" {
		path := "." + m.FileURL
		_ = os.Remove(path)
	}
	if err := config.DB.Delete(&m).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menghapus materi"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Materi dihapus"})
}
func UploadMedia(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "File tidak ditemukan di request"})
	}

	// Validasi ekstensi
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExt := map[string]bool{
		".pdf": true, ".doc": true, ".docx": true,
		".jpg": true, ".jpeg": true, ".png": true, ".webp": true,
		".mp4": true,
	}
	if !allowedExt[ext] {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Tipe file tidak diizinkan. Gunakan PDF/DOC, Gambar, atau MP4."})
	}

	// Buat direktori jika belum ada
	uploadDir := "./uploads/kencana/media"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuat direktori upload"})
	}

	// Buat nama file unik
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	savePath := filepath.Join(uploadDir, filename)

	// Simpan file
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan file"})
	}

	fileURL := "/uploads/kencana/media/" + filename
	return c.JSON(fiber.Map{
		"success": true,
		"url":     fileURL,
		"message": "File berhasil diunggah",
	})
}

func UploadMaterial(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "File tidak ditemukan di request"})
	}

	// Validasi ekstensi yang diizinkan
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExt := map[string]bool{".pdf": true, ".doc": true, ".docx": true, ".ppt": true, ".pptx": true, ".xlsx": true, ".xls": true, ".jpg": true, ".jpeg": true, ".png": true, ".mp4": true}
	if !allowedExt[ext] {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Tipe file tidak diizinkan. Gunakan PDF, DOC, PPT, gambar, atau video."})
	}

	// Buat direktori jika belum ada
	uploadDir := "./uploads/kencana/materials"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuat direktori upload"})
	}

	// Nama file unik agar tidak bertabrakan
	uniqueName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	savePath := filepath.Join(uploadDir, uniqueName)

	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan file"})
	}

	// URL publik yang akan disimpan ke database
	publicURL := "/uploads/kencana/materials/" + uniqueName

	// Parse data materi dari form
	sessionID := c.FormValue("session_id")
	title := c.FormValue("title")
	if title == "" {
		title = strings.TrimSuffix(file.Filename, ext)
	}

	// Tentukan tipe materi dari ekstensi
	materialType := "file"
	if ext == ".mp4" {
		materialType = "video"
	} else if ext == ".pdf" {
		materialType = "pdf"
	}

	material := models.KencanaMaterial{
		Title:            title,
		Type:             materialType,
		FileURL:          publicURL,
		OriginalFileName: file.Filename,
		IsRequired:       true,
	}

	if sessionID != "" {
		var sid uint
		fmt.Sscanf(sessionID, "%d", &sid)
		material.SessionID = sid
	}

	role, fakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" && fakultasID != 0 {
		material.FakultasID = &fakultasID
	} else if role == "super_admin" || role == "kencana_admin" {
		if reqFakultasID := c.QueryInt("fakultas_id"); reqFakultasID != 0 {
			uFid := uint(reqFakultasID)
			material.FakultasID = &uFid
		}
	}

	if err := config.DB.Create(&material).Error; err != nil {
		_ = os.Remove(savePath)
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan data materi ke database"})
	}

	return c.JSON(fiber.Map{"success": true, "data": material, "url": publicURL})
}

// ──────────────────────────────────────────────
//  ASSIGNMENT MANAGEMENT
// ──────────────────────────────────────────────

func UpdateAssignment(c *fiber.Ctx) error {
	return updateRecord(c, &models.KencanaAssignment{}, "Tugas")
}

func DeleteAssignment(c *fiber.Ctx) error {
	var a models.KencanaAssignment
	if err := config.DB.First(&a, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Tugas tidak ditemukan"})
	}
	role, fakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		if a.FakultasID == nil || *a.FakultasID != fakultasID {
			return c.Status(403).JSON(fiber.Map{"success": false, "message": "Akses ditolak. Anda tidak berwenang menghapus tugas ini."})
		}
	}
	if err := config.DB.Delete(&a).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menghapus tugas"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Tugas dihapus"})
}

// ──────────────────────────────────────────────
//  SCORE MANAGEMENT (ADMIN)
// ──────────────────────────────────────────────

// UpsertScoreItem — Admin dapat input/update satu sub-item nilai mahasiswa
func UpsertScoreItem(c *fiber.Ctx) error {
	type reqBody struct {
		PeriodID  uint    `json:"period_id"`
		StudentID uint    `json:"student_id"`
		Component string  `json:"component"` // cognitive / psychomotor / affective
		ItemName  string  `json:"item_name"`
		Score     float64 `json:"score"`
		Notes     string  `json:"notes"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil || req.StudentID == 0 || req.ItemName == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload nilai tidak valid"})
	}
	validComponents := map[string]bool{"cognitive": true, "psychomotor": true, "affective": true, "requirements": true}
	if !validComponents[req.Component] {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Komponen tidak valid. Gunakan: cognitive, psychomotor, affective, requirements"})
	}
	if req.Score < 0 || req.Score > 100 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Nilai harus antara 0 dan 100"})
	}
	if req.PeriodID == 0 {
		period, err := activePeriod(config.DB)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Periode aktif tidak ditemukan"})
		}
		req.PeriodID = period.ID
	}
	uid, _ := userID(c)
	now := time.Now()

	// Cari item yang sudah ada dengan kombinasi period+student+component+itemName
	var existing models.KencanaScoreItem
	err := config.DB.Where("period_id = ? AND student_id = ? AND component = ? AND item_name = ?",
		req.PeriodID, req.StudentID, req.Component, req.ItemName).First(&existing).Error

	if err == nil {
		// Update yang sudah ada
		existing.Score = req.Score
		existing.Notes = req.Notes
		existing.AssessedBy = &uid
		existing.AssessedAt = &now
		if err := config.DB.Save(&existing).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui nilai"})
		}
		calculateAndStoreScore(config.DB, req.PeriodID, req.StudentID)
		return c.JSON(fiber.Map{"success": true, "data": existing})
	}

	// Buat baru
	item := models.KencanaScoreItem{
		PeriodID: req.PeriodID, StudentID: req.StudentID,
		Component: req.Component, ItemName: req.ItemName,
		Score: req.Score, SourceType: "manual",
		AssessedBy: &uid, AssessedAt: &now, Notes: req.Notes,
	}
	if err := config.DB.Create(&item).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan nilai"})
	}
	calculateAndStoreScore(config.DB, req.PeriodID, req.StudentID)
	return c.JSON(fiber.Map{"success": true, "data": item})
}

// BulkUpsertScoreItems — Input nilai banyak mahasiswa sekaligus
func BulkUpsertScoreItems(c *fiber.Ctx) error {
	type itemPayload struct {
		StudentID uint    `json:"student_id"`
		Component string  `json:"component"`
		ItemName  string  `json:"item_name"`
		Score     float64 `json:"score"`
		Notes     string  `json:"notes"`
	}
	type reqBody struct {
		PeriodID uint          `json:"period_id"`
		Items    []itemPayload `json:"items"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil || len(req.Items) == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload tidak valid"})
	}
	if req.PeriodID == 0 {
		period, err := activePeriod(config.DB)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Periode aktif tidak ditemukan"})
		}
		req.PeriodID = period.ID
	}
	uid, _ := userID(c)
	now := time.Now()
	updatedStudents := map[uint]bool{}

	for _, it := range req.Items {
		if it.Score < 0 || it.Score > 100 {
			continue
		}
		var existing models.KencanaScoreItem
		err := config.DB.Where("period_id = ? AND student_id = ? AND component = ? AND item_name = ?",
			req.PeriodID, it.StudentID, it.Component, it.ItemName).First(&existing).Error
		if err == nil {
			existing.Score = it.Score
			existing.Notes = it.Notes
			existing.AssessedBy = &uid
			existing.AssessedAt = &now
			config.DB.Save(&existing)
		} else {
			item := models.KencanaScoreItem{
				PeriodID: req.PeriodID, StudentID: it.StudentID,
				Component: it.Component, ItemName: it.ItemName,
				Score: it.Score, SourceType: "manual",
				AssessedBy: &uid, AssessedAt: &now, Notes: it.Notes,
			}
			config.DB.Create(&item)
		}
		updatedStudents[it.StudentID] = true
	}

	// Recalculate scores untuk semua mahasiswa yang datanya diupdate
	for sid := range updatedStudents {
		calculateAndStoreScore(config.DB, req.PeriodID, sid)
	}

	return c.JSON(fiber.Map{"success": true, "message": fmt.Sprintf("%d item nilai berhasil disimpan", len(req.Items))})
}

// CalculateAllScores — Admin klik "Hitung Nilai Semua" untuk satu periode
func CalculateAllScores(c *fiber.Ctx) error {
	periodID := uint(c.QueryInt("period_id"))
	if periodID == 0 {
		period, err := activePeriod(config.DB)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Periode tidak ditemukan"})
		}
		periodID = period.ID
	}
	var studentIDs []uint
	studentQuery := config.DB.Model(&models.Mahasiswa{})
	role, scopedFakultasID := kencanaAdminScope(c)
	if role == "kencana_fakultas" {
		if scopedFakultasID == 0 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Admin Kencana Fakultas belum memiliki scope fakultas"})
		}
		studentQuery = studentQuery.Where("fakultas_id = ?", scopedFakultasID)
	}
	studentQuery.Pluck("id", &studentIDs)

	calculated := 0
	for _, sid := range studentIDs {
		_, _, err := calculateAndStoreScore(config.DB, periodID, sid)
		if err == nil {
			calculated++
		}
	}
	return c.JSON(fiber.Map{"success": true, "message": fmt.Sprintf("Nilai %d mahasiswa berhasil dihitung ulang", calculated)})
}

// AdminListScoreItems — Lihat semua score item untuk satu mahasiswa (per periode)
func AdminListScoreItems(c *fiber.Ctx) error {
	periodID := uint(c.QueryInt("period_id"))
	studentID := uint(c.QueryInt("student_id"))
	if studentID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "student_id wajib diisi"})
	}
	if periodID == 0 {
		period, err := activePeriod(config.DB)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Periode aktif tidak ditemukan"})
		}
		periodID = period.ID
	}
	var items []models.KencanaScoreItem
	config.DB.Where("period_id = ? AND student_id = ?", periodID, studentID).Order("component asc, item_name asc").Find(&items)
	score, blockers, _ := calculateAndStoreScore(config.DB, periodID, studentID)
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{
		"items":    items,
		"score":    score,
		"blockers": blockers,
	}})
}

// SearchStudents mencari mahasiswa untuk ditambahkan sebagai mentor (berdasarkan nama/nim)
func SearchStudents(c *fiber.Ctx) error {
	var students []models.Mahasiswa
	query := config.DB.Preload("Pengguna").Preload("ProgramStudi.Fakultas")
	
	if search := c.Query("search"); search != "" {
		query = query.Where("nama ILIKE ? OR nim ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	
	if err := query.Limit(30).Find(&students).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	
	results := []map[string]interface{}{}
	for _, s := range students {
		results = append(results, map[string]interface{}{
			"id": s.ID,
			"user_id": s.PenggunaID,
			"name": s.Nama,
			"nim": s.NIM,
			"email": s.Pengguna.Email,
			"phone": s.NoHP,
			"jenis_kelamin": s.JenisKelamin,
			"prodi": s.ProgramStudi.Nama,
			"fakultas": s.ProgramStudi.Fakultas.Nama,
			"fakultas_id": s.ProgramStudi.FakultasID,
		})
	}
	return c.JSON(fiber.Map{"success": true, "data": results})
}

package controllers

import (
	"fmt"
	"os"
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// --- DASHBOARD ---

func GetOrmawaStats(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	if ormawaId == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "ormawaId is required"})
	}

	var totalProposal int64
	var totalMember int64
	var totalEvents int64
	var totalAnnouncements int64
	
	// Stats Counts
	config.DB.Model(&models.Proposal{}).Where("ormawa_id = ?", ormawaId).Count(&totalProposal)
	config.DB.Model(&models.OrmawaMember{}).Where("ormawa_id = ?", ormawaId).Count(&totalMember)
	config.DB.Model(&models.EventSchedule{}).Where("ormawa_id = ?", ormawaId).Count(&totalEvents)
	config.DB.Model(&models.OrmawaAnnouncement{}).Where("ormawa_id = ?", ormawaId).Count(&totalAnnouncements)
	
	// Kas Calculation
	var masuk float64
	var keluar float64
	config.DB.Model(&models.CashMutation{}).Where("ormawa_id = ? AND type = ?", ormawaId, "masuk").Select("COALESCE(SUM(nominal), 0)").Scan(&masuk)
	config.DB.Model(&models.CashMutation{}).Where("ormawa_id = ? AND type = ?", ormawaId, "keluar").Select("COALESCE(SUM(nominal), 0)").Scan(&keluar)
	totalKas := masuk - keluar

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"totalProposals":     totalProposal,
			"totalMembers":       totalMember,
			"totalEvents":        totalEvents,
			"totalAnnouncements": totalAnnouncements,
			"totalKas":           totalKas,
		},
	})
}

// --- PROPOSALS ---

func GetProposals(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var proposals []models.Proposal
	query := config.DB.Preload("Ormawa")
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Order("created_at desc").Find(&proposals)
	return c.JSON(fiber.Map{"status": "success", "data": proposals})
}

func GetProposalHistory(c *fiber.Ctx) error {
	id := c.Params("id")
	var history []models.ProposalHistory
	config.DB.Where("proposal_id = ?", id).Order("created_at asc").Find(&history)
	return c.JSON(fiber.Map{"status": "success", "data": history})
}

func CreateProposal(c *fiber.Ctx) error {
	var payload models.Proposal
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid: " + err.Error()})
	}

	// Basic Validation
	if payload.Title == "" || payload.OrmawaID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Judul dan Organisasi wajib diisi"})
	}
	if payload.Budget <= 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Anggaran harus lebih besar dari 0"})
	}

	// Blokir jika ada LPJ yang belum selesai (Mandatory Workflow)
	var unfinishedLpjCount int64
	config.DB.Model(&models.Proposal{}).
		Joins("LEFT JOIN lpjs ON lpjs.proposal_id = proposals.id").
		Where("proposals.ormawa_id = ?", payload.OrmawaID).
		Where("proposals.status = ?", "disetujui_univ").
		Where("proposals.date_event < ?", time.Now()).
		Where("(lpjs.id IS NULL OR lpjs.status != ?)", "disetujui").
		Count(&unfinishedLpjCount)

	if unfinishedLpjCount > 0 {
		return c.Status(403).JSON(fiber.Map{
			"status":  "blocked",
			"message": "Pengajuan diblokir! Selesaikan LPJ kegiatan sebelumnya terlebih dahulu.",
		})
	}

	// Create Proposal
	if err := config.DB.Create(&payload).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan proposal"})
	}

	// Log History
	config.DB.Create(&models.ProposalHistory{
		ProposalID: payload.ID,
		Status:     "diajukan",
		Notes:      "Proposal baru dibuat oleh sistem",
	})

	return c.Status(201).JSON(fiber.Map{"status": "success", "data": payload})
}

func UpdateProposal(c *fiber.Ctx) error {
	id := c.Params("id")
	var proposal models.Proposal
	if err := config.DB.First(&proposal, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Proposal tidak ditemukan"})
	}
	
	var payload struct {
		Status string  `json:"status"`
		Notes  string  `json:"notes"`
		UserId uint    `json:"userId"`
		Budget float64 `json:"budget"`
		Title  string  `json:"title"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload tidak valid"})
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		if payload.Status != "" && payload.Status != "diajukan" {
			// This logic might need refinement based on roles, but kept as is from original
			// return fmt.Errorf("anda tidak memiliki otoritas untuk menetapkan status '%s'", payload.Status)
		}

		if payload.Status != "" || payload.Notes != "" {
			history := models.ProposalHistory{
				ProposalID: proposal.ID,
				Status:     payload.Status,
				Notes:      payload.Notes,
				CreatedBy:  payload.UserId,
			}
			if err := tx.Create(&history).Error; err != nil {
				return err
			}
		}

		updates := make(map[string]interface{})
		if payload.Status != "" { updates["status"] = payload.Status }
		if payload.Title != "" { updates["title"] = payload.Title }
		if payload.Budget > 0 { updates["budget"] = payload.Budget }
		
		if len(updates) > 0 {
			if err := tx.Model(&proposal).Updates(updates).Error; err != nil {
				return err
			}
		}

		if payload.Status == "disetujui_univ" {
			mutation := models.CashMutation{
				OrmawaID:    proposal.OrmawaID,
				Type:        "masuk",
				Nominal:     proposal.Budget,
				Category:    "Pencairan Proposal",
				Description: fmt.Sprintf("Pencairan dana kegiatan: %s", proposal.Title),
				ProposalID:  &proposal.ID,
				Date:        time.Now(),
			}
			if err := tx.Create(&mutation).Error; err != nil {
				return err
			}
			
			tx.Create(&models.OrmawaNotification{
				OrmawaID: proposal.OrmawaID,
				Type:     "fund",
				Title:    "Dana Kegiatan Dicairkan",
				Desc:     fmt.Sprintf("Dana untuk proposal '%s' telah masuk ke kas organisasi.", proposal.Title),
			})
		} else if payload.Status != "" {
			tx.Create(&models.OrmawaNotification{
				OrmawaID: proposal.OrmawaID,
				Type:     "proposal",
				Title:    "Update Proposal",
				Desc:     fmt.Sprintf("Proposal '%s' sekarang berstatus: %s", proposal.Title, payload.Status),
			})
		}

		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal sinkronisasi data"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Proposal updated & integrated"})
}

func DeleteProposal(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Proposal{}, id)
	config.DB.Where("proposal_id = ?", id).Delete(&models.ProposalHistory{})
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

// --- SETTINGS ---

func GetOrmawaSettings(c *fiber.Ctx) error {
	id := c.Params("id")
	var ormawa models.Ormawa
	if err := config.DB.First(&ormawa, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Organisasi tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": ormawa})
}

func UpdateOrmawaSettings(c *fiber.Ctx) error {
	id := c.Params("id")
	var ormawa models.Ormawa
	if err := config.DB.First(&ormawa, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Organisasi tidak ditemukan"})
	}

	if err := c.BodyParser(&ormawa); err != nil {
		return c.Status(422).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}

	if err := config.DB.Save(&ormawa).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan perubahan"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": ormawa})
}

// --- FINANCE ---

func GetCashMutations(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var mutasi []models.CashMutation
	query := config.DB.Preload("Ormawa")
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Order("date desc").Find(&mutasi)
	return c.JSON(fiber.Map{"status": "success", "data": mutasi})
}

func CreateCashMutation(c *fiber.Ctx) error {
	var mutation models.CashMutation
	if err := c.BodyParser(&mutation); err != nil {
		return c.Status(422).JSON(fiber.Map{"status": "error", "message": "Input tidak valid"})
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		if mutation.Date.IsZero() {
			mutation.Date = time.Now()
		}
		if err := tx.Create(&mutation).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mencatat mutasi kas"})
	}
	return c.Status(201).JSON(fiber.Map{"status": "success", "data": mutation})
}

// --- EVENTS ---

func GetEvents(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var events []models.EventSchedule
	query := config.DB.Model(&models.EventSchedule{})
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Find(&events)
	return c.JSON(fiber.Map{"status": "success", "data": events})
}

func CreateEvent(c *fiber.Ctx) error {
	var payload models.EventSchedule
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "data": payload})
}

func UpdateEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	var event models.EventSchedule
	if err := config.DB.First(&event, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not Found"})
	}
	c.BodyParser(&event)
	config.DB.Save(&event)
	return c.JSON(fiber.Map{"status": "success", "data": event})
}

func DeleteEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.EventSchedule{}, id)
	return c.JSON(fiber.Map{"status": "success"})
}

// --- ATTENDANCE ---

func GetAttendance(c *fiber.Ctx) error {
	eventId := c.Params("eventId")
	var attendance []models.EventAttendance
	config.DB.Preload("Student").Where("event_schedule_id = ?", eventId).Find(&attendance)
	return c.JSON(fiber.Map{"status": "success", "data": attendance})
}

func SubmitAttendance(c *fiber.Ctx) error {
	var payload models.EventAttendance
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Input tidak valid"})
	}
	
	if payload.EventScheduleID == 0 || payload.StudentID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "EventID dan StudentID wajib diisi"})
	}

	var existing models.EventAttendance
	err := config.DB.Where("event_schedule_id = ? AND student_id = ?", payload.EventScheduleID, payload.StudentID).First(&existing).Error
	
	if err == nil {
		// Update existing attendance
		existing.Status = payload.Status
		if existing.TimeIn.IsZero() {
			existing.TimeIn = time.Now()
		}
		config.DB.Save(&existing)
		return c.JSON(fiber.Map{"status": "success", "message": "Absensi diperbarui", "data": existing})
	}

	// Create new record
	if payload.TimeIn.IsZero() {
		payload.TimeIn = time.Now()
	}
	if err := config.DB.Create(&payload).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mencatat absensi"})
	}
	
	return c.Status(201).JSON(fiber.Map{"status": "success", "data": payload})
}

// --- ANNOUNCEMENTS ---

func GetAnnouncements(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var list []models.OrmawaAnnouncement
	query := config.DB.Model(&models.OrmawaAnnouncement{})
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Order("created_at desc").Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func CreateAnnouncement(c *fiber.Ctx) error {
	var payload models.OrmawaAnnouncement
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "data": payload})
}

func UpdateAnnouncement(c *fiber.Ctx) error {
	id := c.Params("id")
	var item models.OrmawaAnnouncement
	if err := config.DB.First(&item, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not found"})
	}
	c.BodyParser(&item)
	config.DB.Save(&item)
	return c.JSON(fiber.Map{"status": "success", "data": item})
}

func DeleteAnnouncement(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.OrmawaAnnouncement{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

// --- ROLES ---

func GetOrmawaRoles(c *fiber.Ctx) error {
	var roles []models.OrmawaRole
	config.DB.Find(&roles)
	return c.JSON(fiber.Map{"status": "success", "data": roles})
}

func DeleteOrmawaRole(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.OrmawaRole{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

// --- MEMBERS ---

func GetMembers(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var members []models.OrmawaMember
	query := config.DB.Preload("Student")
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Find(&members)
	return c.JSON(fiber.Map{"status": "success", "data": members})
}

func UpdateMember(c *fiber.Ctx) error {
	id := c.Params("id")
	var member models.OrmawaMember
	if err := config.DB.First(&member, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Member not found"})
	}
	c.BodyParser(&member)
	config.DB.Save(&member)
	return c.JSON(fiber.Map{"status": "success", "data": member})
}

func CreateMember(c *fiber.Ctx) error {
	var payload models.OrmawaMember
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "data": payload})
}

func DeleteMember(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.OrmawaMember{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

// --- NOTIFICATIONS ---

func GetOrmawaNotifications(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	if ormawaId == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "ormawaId is required"})
	}
	var list []models.OrmawaNotification
	config.DB.Where("ormawa_id = ?", ormawaId).Order("created_at desc").Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func MarkNotificationRead(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Model(&models.OrmawaNotification{}).Where("id = ?", id).Update("is_read", true)
	return c.JSON(fiber.Map{"status": "success"})
}

func MarkAllNotificationsRead(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	if ormawaId == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "ormawaId is required"})
	}
	config.DB.Model(&models.OrmawaNotification{}).Where("ormawa_id = ? AND is_read = ?", ormawaId, false).Update("is_read", true)
	return c.JSON(fiber.Map{"status": "success"})
}

func DeleteNotification(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.OrmawaNotification{}, id)
	return c.JSON(fiber.Map{"status": "success"})
}

// --- DIVISIONS ---

func GetDivisions(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var list []models.OrmawaDivision
	query := config.DB.Model(&models.OrmawaDivision{})
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func CreateDivision(c *fiber.Ctx) error {
	var payload models.OrmawaDivision
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "data": payload})
}

func DeleteDivision(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.OrmawaDivision{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

// --- LPJ ---

func GetLPJs(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var list []models.LPJ
	query := config.DB.Preload("Proposal").Preload("Documents")
	if ormawaId != "" {
		query = query.Joins("JOIN proposals ON proposals.id = lpjs.proposal_id").
			Where("proposals.ormawa_id = ?", ormawaId)
	}
	query.Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func CreateLPJ(c *fiber.Ctx) error {
	var payload models.LPJ
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	
	var existing models.LPJ
	if err := config.DB.Where("proposal_id = ?", payload.ProposalID).First(&existing).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "LPJ already exists for this proposal"})
	}

	config.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "data": payload})
}

func UpdateLPJ(c *fiber.Ctx) error {
	id := c.Params("id")
	var lpj models.LPJ
	if err := config.DB.Preload("Proposal").Preload("Documents").First(&lpj, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not Found"})
	}
	
	var payload struct {
		Status         string  `json:"status"`
		Notes          string  `json:"notes"`
		RealizedBudget float64 `json:"realizedBudget"`
	}
	c.BodyParser(&payload)

	if payload.Status == "diajukan" {
		mandatory := []string{"Dokumentasi", "Laporan Keuangan", "Presensi"}
		uploadedCategories := make(map[string]bool)
		for _, doc := range lpj.Documents {
			uploadedCategories[doc.Category] = true
		}

		var missing []string
		for _, m := range mandatory {
			if !uploadedCategories[m] {
				missing = append(missing, m)
			}
		}

		if len(missing) > 0 {
			return c.Status(400).JSON(fiber.Map{
				"status":  "error",
				"message": fmt.Sprintf("Lengkapi dokumen wajib: %v", missing),
			})
		}
	}

	oldStatus := lpj.Status

	if payload.Status != "" {
		if payload.Status != "draft" && payload.Status != "diajukan" {
			// return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Akses ditolak"})
		}
		lpj.Status = payload.Status 
	}
	if payload.Notes != "" { lpj.Notes = payload.Notes }
	if payload.RealizedBudget > 0 { lpj.RealizedBudget = payload.RealizedBudget }
	
	config.DB.Save(&lpj)
	
	if lpj.Status == "disetujui" && oldStatus != "disetujui" {
		config.DB.Model(&models.Proposal{}).Where("id = ?", lpj.ProposalID).Update("status", "selesai")
		
		config.DB.Create(&models.CashMutation{
			OrmawaID:    lpj.Proposal.OrmawaID,
			Type:        "keluar",
			Nominal:     lpj.RealizedBudget,
			Category:    "Kegiatan Selesai",
			Description: "Realisasi Dana LPJ: " + lpj.Proposal.Title,
			Date:        time.Now(),
			ProposalID:  &lpj.ProposalID,
		})

		config.DB.Create(&models.OrmawaNotification{
			OrmawaID: lpj.Proposal.OrmawaID,
			Type:     "finance",
			Title:    "Saldo Terupdate",
			Desc:     "Realisasi dana " + lpj.Proposal.Title + " telah diposting ke Buku Kas.",
		})
	}

	return c.JSON(fiber.Map{"status": "success", "data": lpj})
}

func UploadLPJDocument(c *fiber.Ctx) error {
	lpjId := c.Params("id")
	category := c.FormValue("category")
	
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "No file uploaded"})
	}

	os.MkdirAll("./uploads", 0755)
	filename := fmt.Sprintf("LPJ_%s_%d_%s", category, time.Now().Unix(), file.Filename)
	filePath := "./uploads/" + filename
	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to save file"})
	}

	var lpj models.LPJ
	if err := config.DB.First(&lpj, lpjId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "LPJ not found"})
	}

	if lpj.Status == "disetujui" {
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": "LPJ sudah disetujui"})
	}

	doc := models.LPJDocument{
		LPJID:    lpj.ID,
		Category: category,
		FileNama: file.Filename,
		FileUrl:  "/uploads/" + filename,
	}
	
	config.DB.Create(&doc)
	return c.JSON(fiber.Map{"status": "success", "data": doc})
}

func DeleteLPJDocument(c *fiber.Ctx) error {
	docId := c.Params("docId")
	config.DB.Delete(&models.LPJDocument{}, docId)
	return c.JSON(fiber.Map{"status": "success", "message": "Dokumen dihapus"})
}

// --- ASPIRATIONS ---

func GetAspirations(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	if ormawaId == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "ormawaId wajib diisi"})
	}

	var list []models.OrmawaAspiration
	config.DB.Preload("Student").Where("ormawa_id = ?", ormawaId).Order("created_at desc").Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func CreateAspiration(c *fiber.Ctx) error {
	var payload models.OrmawaAspiration
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "data": payload})
}

func UpdateAspiration(c *fiber.Ctx) error {
	id := c.Params("id")
	var item models.OrmawaAspiration
	config.DB.First(&item, id)
	c.BodyParser(&item)
	config.DB.Save(&item)
	return c.JSON(fiber.Map{"status": "success", "data": item})
}

// --- GENERIC UPLOAD ---

func UploadFile(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "No file uploaded"})
	}
	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
	os.MkdirAll("./uploads", 0755)
	if err := c.SaveFile(file, "./uploads/"+filename); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to save file"})
	}
	return c.JSON(fiber.Map{"status": "success", "url": "/uploads/" + filename})
}

func GetStudentsLookup(c *fiber.Ctx) error {
	var students []models.Student
	if err := config.DB.Select("id, nama_mahasiswa as name, nim").Find(&students).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memuat data mahasiswa"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": students})
}

package routes

import (
	"fmt"
	"os"
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

func SetupOrmawaRoutes(app *fiber.App) {
	api := app.Group("/api/ormawa")

	// DASHBOARD STATS
	api.Get("/stats", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		var totalProposal int64
		var totalMember int64
		var totalKas float64
		
		queryProp := config.DB.Model(&models.Proposal{})
		queryMem := config.DB.Model(&models.OrmawaMember{})
		queryKasMasuk := config.DB.Model(&models.CashMutation{}).Where("type = ?", "masuk")
		queryKasKeluar := config.DB.Model(&models.CashMutation{}).Where("type = ?", "keluar")

		if ormawaId != "" {
			queryProp = queryProp.Where("ormawa_id = ?", ormawaId)
			queryMem = queryMem.Where("ormawa_id = ?", ormawaId)
			queryKasMasuk = queryKasMasuk.Where("ormawa_id = ?", ormawaId)
			queryKasKeluar = queryKasKeluar.Where("ormawa_id = ?", ormawaId)
		}

		queryProp.Count(&totalProposal)
		queryMem.Count(&totalMember)
		
		var masuk float64
		var keluar float64
		queryKasMasuk.Select("SUM(nominal)").Scan(&masuk)
		queryKasKeluar.Select("SUM(nominal)").Scan(&keluar)
		totalKas = masuk - keluar

		return c.JSON(fiber.Map{
			"status": "success",
			"data": fiber.Map{
				"totalProposals": totalProposal,
				"totalMembers":   totalMember,
				"totalKas":       totalKas,
			},
		})
	})

	// PROPOSALS
	api.Get("/proposals", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		var proposals []models.Proposal
		query := config.DB.Preload("Ormawa")
		if ormawaId != "" {
			query = query.Where("ormawa_id = ?", ormawaId)
		}
		query.Order("created_at desc").Find(&proposals)
		return c.JSON(fiber.Map{"status": "success", "data": proposals})
	})

	api.Get("/proposals/:id/history", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var history []models.ProposalHistory
		config.DB.Where("proposal_id = ?", id).Order("created_at asc").Find(&history)
		return c.JSON(fiber.Map{"status": "success", "data": history})
	})

	api.Post("/proposals", func(c *fiber.Ctx) error {
		var payload models.Proposal
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}

		// BUSINESS LOGIC: BLOCK IF UNFINISHED LPJ EXISTS
		// Check for accepted proposals whose event date is in the past but have no approved LPJ
		var unfinishedLpjCount int64
		// We consider event dates in the past as needing an LPJ
		// Status 'disetujui_univ' is the final stage before an event is considered "happening"
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
				"message": "Pengajuan diblokir! Anda memiliki LPJ kegiatan sebelumnya yang belum diselesaikan (Approved). Mohon selesaikan LPJ tersebut terlebih dahulu.",
			})
		}

		config.DB.Create(&payload)

		// Initial history
		config.DB.Create(&models.ProposalHistory{
			ProposalID: payload.ID,
			Status:     "diajukan",
			Notes:      "Proposal baru dibuat",
		})

		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	api.Put("/proposals/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var proposal models.Proposal
		if err := config.DB.First(&proposal, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not Found"})
		}
		
		var payload struct {
			Status string  `json:"status"`
			Notes  string  `json:"notes"`
			UserId uint    `json:"userId"`
			Budget float64 `json:"budget"`
			Title  string  `json:"title"`
		}
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		
		oldStatus := proposal.Status

		// Handle logical transitions
		if payload.Status != "" { 
			proposal.Status = payload.Status 
			
			// Auto History point
			config.DB.Create(&models.ProposalHistory{
				ProposalID: proposal.ID,
				Status:     payload.Status,
				Notes:      payload.Notes,
				CreatedBy:  payload.UserId,
			})

			// POINT 4: AUTO CASH MUTATION ON FINAL APPROVAL
			if payload.Status == "disetujui_univ" && oldStatus != "disetujui_univ" {
				config.DB.Create(&models.CashMutation{
					OrmawaID:    proposal.OrmawaID,
					Type:        "masuk", // Assuming from university to Ormawa
					Nominal:     proposal.Budget,
					Category:    "Pencairan Dana",
					Description: "Dana Cair: " + proposal.Title,
					ProposalID:  &proposal.ID,
					Date:        time.Now(),
				})
				
				// Create notification
				config.DB.Create(&models.OrmawaNotification{
					OrmawaID: proposal.OrmawaID,
					Type:     "fund",
					Title:    "Dana Dicairkan",
					Desc:     "Dana untuk proposal " + proposal.Title + " telah masuk ke kas.",
				})
			}
		}
		if payload.Title != "" { proposal.Title = payload.Title }
		if payload.Budget > 0 { proposal.Budget = payload.Budget }
		
		config.DB.Save(&proposal)
		return c.JSON(fiber.Map{"status": "success", "data": proposal})
	})

	api.Delete("/proposals/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		config.DB.Delete(&models.Proposal{}, id)
		config.DB.Where("proposal_id = ?", id).Delete(&models.ProposalHistory{})
		return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
	})

	// FILE UPLOAD HANDLER
	api.Post("/upload", func(c *fiber.Ctx) error {
		file, err := c.FormFile("file")
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "No file uploaded"})
		}

		// Ensure directory exists
		os.MkdirAll("./uploads", os.ModePerm)

		fileName := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
		filePath := fmt.Sprintf("./uploads/%s", fileName)
		if err := c.SaveFile(file, filePath); err != nil {
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}

		return c.JSON(fiber.Map{
			"status": "success", 
			"url":    fmt.Sprintf("http://localhost:8000/uploads/%s", fileName),
		})
	})

	// SETTINGS & PROFILE
	api.Get("/settings/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var ormawa models.Ormawa
		if err := config.DB.First(&ormawa, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Ormawa not found"})
		}
		return c.JSON(fiber.Map{"status": "success", "data": ormawa})
	})

	api.Put("/settings/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var ormawa models.Ormawa
		if err := config.DB.First(&ormawa, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Ormawa not found"})
		}
		c.BodyParser(&ormawa)
		config.DB.Save(&ormawa)
		return c.JSON(fiber.Map{"status": "success", "data": ormawa})
	})

	// CASH MUTATIONS (BUKU KAS)
	api.Get("/kas", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		var mutasi []models.CashMutation
		query := config.DB.Preload("Ormawa")
		if ormawaId != "" {
			query = query.Where("ormawa_id = ?", ormawaId)
		}
		query.Order("date desc").Find(&mutasi)
		return c.JSON(fiber.Map{"status": "success", "data": mutasi})
	})

	api.Post("/kas", func(c *fiber.Ctx) error {
		var payload models.CashMutation
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		config.DB.Create(&payload)
		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	// LPJ routes were duplicated, removing the old one here to use the enhanced version below


	// Older LPJ Post/Put removed to use more advanced logic below

	// EVENTS
	api.Get("/events", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		var events []models.EventSchedule
		query := config.DB.Model(&models.EventSchedule{})
		if ormawaId != "" {
			query = query.Where("ormawa_id = ?", ormawaId)
		}
		query.Find(&events)
		return c.JSON(fiber.Map{"status": "success", "data": events})
	})

	api.Post("/events", func(c *fiber.Ctx) error {
		var payload models.EventSchedule
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		config.DB.Create(&payload)
		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	api.Put("/events/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var event models.EventSchedule
		if err := config.DB.First(&event, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not Found"})
		}
		c.BodyParser(&event)
		config.DB.Save(&event)
		return c.JSON(fiber.Map{"status": "success", "data": event})
	})

	api.Delete("/events/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		config.DB.Delete(&models.EventSchedule{}, id)
		return c.JSON(fiber.Map{"status": "success"})
	})

	// ATTENDANCE
	api.Get("/attendance/:eventId", func(c *fiber.Ctx) error {
		eventId := c.Params("eventId")
		var attendance []models.EventAttendance
		config.DB.Preload("Student").Where("event_schedule_id = ?", eventId).Find(&attendance)
		return c.JSON(fiber.Map{"status": "success", "data": attendance})
	})

	api.Post("/attendance", func(c *fiber.Ctx) error {
		var payload models.EventAttendance
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		config.DB.Create(&payload)
		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	// ANNOUNCEMENTS
	api.Get("/announcements", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		var list []models.OrmawaAnnouncement
		query := config.DB.Model(&models.OrmawaAnnouncement{})
		if ormawaId != "" {
			query = query.Where("ormawa_id = ?", ormawaId)
		}
		query.Order("created_at desc").Find(&list)
		return c.JSON(fiber.Map{"status": "success", "data": list})
	})

	api.Post("/announcements", func(c *fiber.Ctx) error {
		var payload models.OrmawaAnnouncement
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		config.DB.Create(&payload)
		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	api.Delete("/announcements/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		config.DB.Delete(&models.OrmawaAnnouncement{}, id)
		return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
	})

	// ROLES
	api.Get("/roles", func(c *fiber.Ctx) error {
		// Roles might be global or ormawa specific, let's filter if ormawaId present
		ormawaId := c.Query("ormawaId")
		var roles []models.OrmawaRole
		query := config.DB.Model(&models.OrmawaRole{})
		if ormawaId != "" {
			// Logic for custom roles per ormawa if applicable
		}
		query.Find(&roles)
		return c.JSON(fiber.Map{"status": "success", "data": roles})
	})

	api.Post("/roles", func(c *fiber.Ctx) error {
		var payload models.OrmawaRole
		c.BodyParser(&payload)
		config.DB.Create(&payload)
		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	api.Put("/roles/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var role models.OrmawaRole
		config.DB.First(&role, id)
		c.BodyParser(&role)
		config.DB.Save(&role)
		return c.JSON(fiber.Map{"status": "success", "data": role})
	})

	api.Delete("/roles/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		config.DB.Delete(&models.OrmawaRole{}, id)
		return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
	})

	// MEMBERS
	api.Get("/members", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		var members []models.OrmawaMember
		query := config.DB.Preload("Student")
		if ormawaId != "" {
			query = query.Where("ormawa_id = ?", ormawaId)
		}
		query.Find(&members)
		return c.JSON(fiber.Map{"status": "success", "data": members})
	})

	api.Put("/members/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var member models.OrmawaMember
		if err := config.DB.First(&member, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Member not found"})
		}
		c.BodyParser(&member)
		config.DB.Save(&member)
		return c.JSON(fiber.Map{"status": "success", "data": member})
	})

	api.Post("/members", func(c *fiber.Ctx) error {
		var payload models.OrmawaMember
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		config.DB.Create(&payload)
		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	api.Delete("/members/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		config.DB.Delete(&models.OrmawaMember{}, id)
		return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
	})

	api.Get("/students", func(c *fiber.Ctx) error {
		var students []models.Student
		config.DB.Find(&students)
		return c.JSON(fiber.Map{"status": "success", "data": students})
	})

	// NOTIFICATIONS
	api.Get("/notifications", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		var list []models.OrmawaNotification
		query := config.DB.Model(&models.OrmawaNotification{})
		if ormawaId != "" {
			query = query.Where("ormawa_id = ?", ormawaId)
		}
		query.Order("created_at desc").Find(&list)
		return c.JSON(fiber.Map{"status": "success", "data": list})
	})

	api.Put("/notifications/:id/read", func(c *fiber.Ctx) error {
		id := c.Params("id")
		config.DB.Model(&models.OrmawaNotification{}).Where("id = ?", id).Update("is_read", true)
		return c.JSON(fiber.Map{"status": "success"})
	})

	api.Put("/notifications/read-all", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		query := config.DB.Model(&models.OrmawaNotification{}).Where("is_read = ?", false)
		if ormawaId != "" {
			query = query.Where("ormawa_id = ?", ormawaId)
		}
		query.Update("is_read", true)
		return c.JSON(fiber.Map{"status": "success"})
	})

	api.Delete("/notifications/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		config.DB.Delete(&models.OrmawaNotification{}, id)
		return c.JSON(fiber.Map{"status": "success"})
	})

	// ANNOUNCEMENTS
	api.Get("/announcements", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		var list []models.OrmawaAnnouncement
		query := config.DB.Model(&models.OrmawaAnnouncement{})
		if ormawaId != "" {
			query = query.Where("ormawa_id = ?", ormawaId)
		}
		query.Order("created_at desc").Find(&list)
		return c.JSON(fiber.Map{"status": "success", "data": list})
	})

	api.Post("/announcements", func(c *fiber.Ctx) error {
		var payload models.OrmawaAnnouncement
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		config.DB.Create(&payload)
		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	api.Put("/announcements/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var item models.OrmawaAnnouncement
		if err := config.DB.First(&item, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not found"})
		}
		c.BodyParser(&item)
		config.DB.Save(&item)
		return c.JSON(fiber.Map{"status": "success", "data": item})
	})

	api.Delete("/announcements/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		config.DB.Delete(&models.OrmawaAnnouncement{}, id)
		return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
	})

	// DIVISIONS
	api.Get("/divisions", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		var list []models.OrmawaDivision
		query := config.DB.Model(&models.OrmawaDivision{})
		if ormawaId != "" {
			query = query.Where("ormawa_id = ?", ormawaId)
		}
		query.Find(&list)
		return c.JSON(fiber.Map{"status": "success", "data": list})
	})

	api.Post("/divisions", func(c *fiber.Ctx) error {
		var payload models.OrmawaDivision
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		config.DB.Create(&payload)
		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	api.Delete("/divisions/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		config.DB.Delete(&models.OrmawaDivision{}, id)
		return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
	})

	// KAS / FINANCE
	api.Get("/kas", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		var list []models.CashMutation
		query := config.DB.Model(&models.CashMutation{})
		if ormawaId != "" {
			query = query.Where("ormawa_id = ?", ormawaId)
		}
		query.Order("date desc").Find(&list)
		return c.JSON(fiber.Map{"status": "success", "data": list})
	})

	api.Post("/kas", func(c *fiber.Ctx) error {
		var payload models.CashMutation
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		if payload.Date.IsZero() {
			payload.Date = time.Now()
		}
		config.DB.Create(&payload)
		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	// ATTENDANCE
	api.Get("/attendance/:eventId", func(c *fiber.Ctx) error {
		eventId := c.Params("eventId")
		var list []models.EventAttendance
		config.DB.Where("event_schedule_id = ?", eventId).Preload("Student").Find(&list)
		return c.JSON(fiber.Map{"status": "success", "data": list})
	})

	api.Post("/attendance", func(c *fiber.Ctx) error {
		var payload models.EventAttendance
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		
		// UPSERT logic: If already exists for this student and event, update status
		var existing models.EventAttendance
		err := config.DB.Where("event_schedule_id = ? AND student_id = ?", payload.EventScheduleID, payload.StudentID).First(&existing).Error
		if err == nil {
			existing.Status = payload.Status
			existing.TimeIn = time.Now()
			config.DB.Save(&existing)
			return c.JSON(fiber.Map{"status": "success", "data": existing})
		}

		if payload.TimeIn.IsZero() {
			payload.TimeIn = time.Now()
		}
		config.DB.Create(&payload)
		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	// LPJ
	api.Get("/lpjs", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		var list []models.LPJ
		query := config.DB.Preload("Proposal").Preload("Documents")
		if ormawaId != "" {
			query = query.Joins("JOIN proposals ON proposals.id = lpjs.proposal_id").
				Where("proposals.ormawa_id = ?", ormawaId)
		}
		query.Find(&list)
		return c.JSON(fiber.Map{"status": "success", "data": list})
	})

	api.Post("/lpjs", func(c *fiber.Ctx) error {
		var payload models.LPJ
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		
		// If creating for the first time, check if already exists
		var existing models.LPJ
		if err := config.DB.Where("proposal_id = ?", payload.ProposalID).First(&existing).Error; err == nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "LPJ already exists for this proposal"})
		}

		config.DB.Create(&payload)
		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	api.Put("/lpjs/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var lpj models.LPJ
		if err := config.DB.Preload("Documents").First(&lpj, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not Found"})
		}
		
		var payload struct {
			Status         string  `json:"status"`
			Notes          string  `json:"notes"`
			RealizedBudget float64 `json:"realizedBudget"`
		}
		c.BodyParser(&payload)

		// MANDATORY FOLDER CHECK BEFORE SUBMITTING (diajukan)
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

		if payload.Status != "" { lpj.Status = payload.Status }
		if payload.Notes != "" { lpj.Notes = payload.Notes }
		if payload.RealizedBudget > 0 { lpj.RealizedBudget = payload.RealizedBudget }
		
		config.DB.Save(&lpj)
		
		// If approved, mark proposal as finished
		if lpj.Status == "disetujui" {
			config.DB.Model(&models.Proposal{}).Where("id = ?", lpj.ProposalID).Update("status", "selesai")
		}

		return c.JSON(fiber.Map{"status": "success", "data": lpj})
	})

	// NEW: LPJ Document Upload (Folder based)
	api.Post("/lpjs/:id/documents", func(c *fiber.Ctx) error {
		lpjId := c.Params("id")
		category := c.FormValue("category") // Dokumentasi, Laporan Keuangan, Presensi
		
		file, err := c.FormFile("file")
		if err != nil {
			fmt.Println("Upload Error: No file in context", err)
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "No file uploaded"})
		}

		// Ensure uploads dir exists with full permissions
		if err := os.MkdirAll("./uploads", 0755); err != nil {
			fmt.Println("Upload Error: Failed to create directory", err)
		}

		filename := fmt.Sprintf("LPJ_%s_%d_%s", category, time.Now().Unix(), file.Filename)
		filePath := "./uploads/" + filename
		if err := c.SaveFile(file, filePath); err != nil {
			fmt.Println("Upload Error: SaveFile failed", err)
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to save file"})
		}

		var lpj models.LPJ
		if err := config.DB.First(&lpj, lpjId).Error; err != nil {
			fmt.Println("Upload Error: LPJ ID not found", lpjId)
			return c.Status(404).JSON(fiber.Map{"status": "error", "message": "LPJ not found"})
		}

		doc := models.LPJDocument{
			LPJID:    lpj.ID,
			Category: category,
			FileName: file.Filename,
			FileUrl:  "/uploads/" + filename,
		}
		
		if err := config.DB.Create(&doc).Error; err != nil {
			fmt.Println("Upload Error: DB Save failed", err)
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to save to database"})
		}

		return c.JSON(fiber.Map{"status": "success", "data": doc})
	})

	api.Delete("/lpjs/documents/:docId", func(c *fiber.Ctx) error {
		docId := c.Params("docId")
		if err := config.DB.Delete(&models.LPJDocument{}, docId).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus dokumen"})
		}
		return c.JSON(fiber.Map{"status": "success", "message": "Dokumen dihapus"})
	})

	// UPLOAD (Generic)
	api.Post("/upload", func(c *fiber.Ctx) error {
		file, err := c.FormFile("file")
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "No file uploaded"})
		}
		filename := time.Now().Format("20060102150405") + "_" + file.Filename
		if _, err := os.Stat("./uploads"); os.IsNotExist(err) {
			os.Mkdir("./uploads", 0755)
		}
		if err := c.SaveFile(file, "./uploads/"+filename); err != nil {
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to save file"})
		}
		return c.JSON(fiber.Map{"status": "success", "url": "/uploads/" + filename})
	})

	// ASPIRATIONS
	api.Get("/aspirations", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		var list []models.OrmawaAspiration
		query := config.DB.Preload("Student")
		if ormawaId != "" {
			query = query.Where("ormawa_id = ?", ormawaId)
		}
		query.Order("created_at desc").Find(&list)
		return c.JSON(fiber.Map{"status": "success", "data": list})
	})

	api.Post("/aspirations", func(c *fiber.Ctx) error {
		var payload models.OrmawaAspiration
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		config.DB.Create(&payload)
		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	api.Put("/aspirations/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var item models.OrmawaAspiration
		config.DB.First(&item, id)
		c.BodyParser(&item)
		config.DB.Save(&item)
		return c.JSON(fiber.Map{"status": "success", "data": item})
	})
}

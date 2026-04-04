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

	// LPJs
	api.Get("/lpjs", func(c *fiber.Ctx) error {
		ormawaId := c.Query("ormawaId")
		var lpjs []models.LPJ
		query := config.DB.Preload("Proposal")
		if ormawaId != "" {
			query = query.Joins("JOIN proposals ON proposals.id = lpjs.proposal_id").Where("proposals.ormawa_id = ?", ormawaId)
		}
		query.Find(&lpjs)
		return c.JSON(fiber.Map{"status": "success", "data": lpjs})
	})


	api.Post("/lpjs", func(c *fiber.Ctx) error {
		var payload models.LPJ
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		config.DB.Create(&payload)
		return c.JSON(fiber.Map{"status": "success", "data": payload})
	})

	api.Put("/lpjs/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var lpj models.LPJ
		if err := config.DB.First(&lpj, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not Found"})
		}
		c.BodyParser(&lpj)
		config.DB.Save(&lpj)
		return c.JSON(fiber.Map{"status": "success", "data": lpj})
	})

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
}

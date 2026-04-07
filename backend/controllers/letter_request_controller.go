package controllers

import (
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

// GetLetterRequests Fetches all letter requests with student data
func GetLetterRequests(c *fiber.Ctx) error {
	var requests []models.LetterRequest
	// We need to preload Student
	if err := config.DB.Preload("Student").Order("created_at desc").Find(&requests).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal mengambil data persuratan",
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   requests,
	})
}

// UpdateLetterRequestStatus Updates the status and optional notes
func UpdateLetterRequestStatus(c *fiber.Ctx) error {
	id := c.Params("id")

	var req models.LetterRequest
	if err := config.DB.First(&req, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"status":  "error",
			"message": "Surat tidak ditemukan",
		})
	}

	var payload struct {
		Status       string `json:"status"`
		CatatanAdmin string `json:"catatan_admin"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"status":  "error",
			"message": "Format request tidak valid",
		})
	}

	if payload.Status != "" {
		req.Status = payload.Status
	}
	if payload.CatatanAdmin != "" {
		req.CatatanAdmin = payload.CatatanAdmin
	}

	if err := config.DB.Save(&req).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal mengupdate status surat",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Status surat berhasi diupdate",
		"data":    req,
	})
}

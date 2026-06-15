package controllers

import (
	"errors"
	"siakad-backend/config"
	"siakad-backend/models"

	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetLandingSettings handles fetching the dynamic landing page contents
func GetLandingSettings(c *fiber.Ctx) error {
	var settings models.LandingSetting

	// Find the first record
	if err := config.DB.First(&settings).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create a blank one, DB defaults will apply
			emptySettings := models.LandingSetting{}
			config.DB.Create(&emptySettings)
			// Fetch again to get defaults applied by DB
			config.DB.First(&settings)
		} else {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"message": "Failed to fetch landing settings",
				"error":   err.Error(),
			})
		}
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   settings,
	})
}

// UpdateLandingSettings handles updating the dynamic landing page contents (Super Admin only)
func UpdateLandingSettings(c *fiber.Ctx) error {
	var payload models.LandingSetting

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request payload",
		})
	}

	var settings models.LandingSetting
	if err := config.DB.First(&settings).Error; err != nil {
		// If not found, create it
		if err := config.DB.Create(&payload).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"message": "Failed to create landing settings",
			})
		}
		settings = payload
	} else {
		// Get User ID from locals if needed (auth protected)
		userIDRaw := c.Locals("user_id")
		if userIDRaw != nil {
			if uid, ok := userIDRaw.(uint); ok {
				payload.UpdatedByID = &uid
			} else if uidFloat, ok := userIDRaw.(float64); ok {
				uidInt := uint(uidFloat)
				payload.UpdatedByID = &uidInt
			}
		}

		// Update existing using Updates map to update all non-zero and zero fields that are provided
		// Or just explicitly set fields:
		settings.HeroBadge = payload.HeroBadge
		settings.HeroTitle = payload.HeroTitle
		settings.HeroSubtitle = payload.HeroSubtitle
		settings.StatsJson = payload.StatsJson

		settings.StatsSectionTitle = payload.StatsSectionTitle
		settings.StatsSectionSubtitle = payload.StatsSectionSubtitle
		settings.StatsSectionDesc = payload.StatsSectionDesc
		settings.StatsSectionItems = payload.StatsSectionItems

		settings.ProgramsTitle = payload.ProgramsTitle
		settings.ProgramsSubtitle = payload.ProgramsSubtitle
		settings.ProgramsDesc = payload.ProgramsDesc
		settings.ProgramsItems = payload.ProgramsItems

		settings.LocationsTitle = payload.LocationsTitle
		settings.LocationsSubtitle = payload.LocationsSubtitle
		settings.LocationsDesc = payload.LocationsDesc
		settings.LocationsItems = payload.LocationsItems

		settings.TestimonialsTitle = payload.TestimonialsTitle
		settings.TestimonialsSubtitle = payload.TestimonialsSubtitle
		settings.TestimonialsDesc = payload.TestimonialsDesc
		settings.TestimonialsItems = payload.TestimonialsItems

		settings.NewsTitle = payload.NewsTitle
		settings.NewsSubtitle = payload.NewsSubtitle
		settings.NewsDesc = payload.NewsDesc
		settings.NewsItems = payload.NewsItems

		settings.CtaTitle = payload.CtaTitle
		settings.CtaSubtitle = payload.CtaSubtitle
		settings.CtaDesc = payload.CtaDesc
		settings.CtaButtonText = payload.CtaButtonText
		settings.CtaButtonLink = payload.CtaButtonLink

		// Tentang
		settings.TentangTitle = payload.TentangTitle
		settings.TentangSubtitle = payload.TentangSubtitle
		settings.TentangVisi = payload.TentangVisi
		settings.TentangMisi = payload.TentangMisi
		settings.TentangSejarah = payload.TentangSejarah
		settings.TentangLeaders = payload.TentangLeaders

		// Kontak
		settings.KontakTitle = payload.KontakTitle
		settings.KontakSubtitle = payload.KontakSubtitle
		settings.KontakEmail = payload.KontakEmail
		settings.KontakPhone = payload.KontakPhone
		settings.KontakAddress = payload.KontakAddress
		settings.KontakJamOpr = payload.KontakJamOpr

		// Prodi
		settings.ProdiPageTitle = payload.ProdiPageTitle
		settings.ProdiPageSubtitle = payload.ProdiPageSubtitle

		// Berita
		settings.BeritaPageTitle = payload.BeritaPageTitle
		settings.BeritaPageSubtitle = payload.BeritaPageSubtitle

		// Footer
		settings.FooterDesc = payload.FooterDesc
		settings.FooterCopyright = payload.FooterCopyright
		settings.FooterSocials = payload.FooterSocials

		if payload.UpdatedByID != nil {
			settings.UpdatedByID = payload.UpdatedByID
		}

		if err := config.DB.Save(&settings).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"message": "Failed to update landing settings",
			})
		}
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Landing settings updated successfully",
		"data":    settings,
	})
}

// LandingUploadImage handles image uploads for landing page (e.g. locations, testimonials)
func LandingUploadImage(c *fiber.Ctx) error {
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "No file uploaded: " + err.Error()})
	}

	uploadDir := "./uploads/landing"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to create directory: " + err.Error()})
	}

	// Generate random name
	filename := fmt.Sprintf("%d-%s", time.Now().Unix(), file.Filename)
	savePath := filepath.Join(uploadDir, filename)

	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to save file: " + err.Error()})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"url":    fmt.Sprintf("/uploads/landing/%s", filename),
	})
}

// GetPublicNews fetches top published news for the public landing page
func GetPublicNews(c *fiber.Ctx) error {
	var news []models.Berita

	limit := c.QueryInt("limit", 3)

	if err := config.DB.Where("status = ?", "Published").Order("tanggal_publish desc").Limit(limit).Find(&news).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch public news",
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   news,
	})
}

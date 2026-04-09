package voice

import (
	"fmt"
	"math"
	"siakad-backend/config"
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"

	"github.com/gofiber/fiber/v2"
)

// GetStats returns count summary for student voice
func GetStats(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var total, diProses, selesai int64

	config.DB.Model(&models.Aspirasi{}).Where("mahasiswa_id = ?", student.ID).Count(&total)
	config.DB.Model(&models.Aspirasi{}).Where("mahasiswa_id = ? AND status = ?", student.ID, "Diproses").Count(&diProses)
	config.DB.Model(&models.Aspirasi{}).Where("mahasiswa_id = ? AND status = ?", student.ID, "Selesai").Count(&selesai)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total":     total,
			"di_proses": diProses,
			"selesai":   selesai,
		},
	})
}

func CreateAspirasi(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)

	var student models.Mahasiswa
	if err := config.DB.Preload("ProgramStudi").First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	judul := c.FormValue("judul")
	kategori := c.FormValue("kategori")
	isi := c.FormValue("isi")
	tujuan := c.FormValue("tujuan") // Fakultas / Universitas
	isAnonim := c.FormValue("is_anonim") == "true"

	if judul == "" || kategori == "" || isi == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Judul, kategori, dan isi wajib diisi"})
	}

	tiket := models.Aspirasi{
		MahasiswaID: student.ID,
		Kategori:    kategori,
		Judul:       judul,
		Isi:         isi,
		Tujuan:      tujuan,
		IsAnonim:    isAnonim,
		Status:      "Menunggu",
	}

	if err := config.DB.Create(&tiket).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan aspirasi"})
	}

	// Trigger Notification
	notifikasi.Kirim(config.DB, notifikasi.KirimParams{
		MahasiswaID: student.ID,
		Type:        "info",
		Title:       "Aspirasi Berhasil Dikirim",
		Content:     fmt.Sprintf("Aspirasi kamu ('%s') telah dikirim.", judul),
		Link:        "/student/voice",
	})

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Aspirasi berhasil dikirim",
		"data":    tiket,
	})
}

func GetAspirasiList(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	offset := (page - 1) * limit

	var total int64
	var tikets []models.Aspirasi

	query := config.DB.Model(&models.Aspirasi{}).Where("mahasiswa_id = ?", student.ID)
	query.Count(&total)
	query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&tikets)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total":     total,
			"page":      page,
			"last_page": math.Ceil(float64(total) / float64(limit)),
			"list":      tikets,
		},
	})
}

func GetDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	PenggunaID := c.Locals("user_id").(uint)

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var tiket models.Aspirasi
	if err := config.DB.First(&tiket, "id = ? AND mahasiswa_id = ?", id, student.ID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Aspirasi tidak ditemukan"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    tiket,
	})
}

func CancelAspirasi(c *fiber.Ctx) error {
	id := c.Params("id")
	PenggunaID := c.Locals("user_id").(uint)

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var tiket models.Aspirasi
	if err := config.DB.First(&tiket, "id = ? AND mahasiswa_id = ?", id, student.ID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Aspirasi tidak ditemukan"})
	}

	if tiket.Status == "Selesai" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Aspirasi sudah selesai dan tidak dapat dibatalkan"})
	}

	if err := config.DB.Model(&tiket).Update("status", "Dibatalkan").Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membatalkan aspirasi"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Aspirasi berhasil dibatalkan",
	})
}

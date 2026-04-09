package counseling

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GetCounselingStatus returns student's counseling records
func GetCounselingStatus(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var records []models.Konseling
	if err := config.DB.Preload("Dosen").Where("mahasiswa_id = ?", student.ID).Order("tanggal desc").Find(&records).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil data"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    records,
	})
}

// RequestCounseling handles new counseling submission
func RequestCounseling(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	type RequestBody struct {
		DosenID uint      `json:"dosen_id"`
		Topik   string    `json:"topik"`
		Tanggal time.Time `json:"tanggal"`
	}

	var req RequestBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Input tidak valid"})
	}

	konseling := models.Konseling{
		MahasiswaID: student.ID,
		DosenID:     req.DosenID,
		Tanggal:     req.Tanggal,
		Topik:       req.Topik,
		Status:      "Menunggu",
	}

	if err := config.DB.Create(&konseling).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengajukan konseling"})
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Konseling berhasil diajukan",
		"data":    konseling,
	})
}

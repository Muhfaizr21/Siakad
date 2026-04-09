package health

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GetHealthRiwayat returns all health screenings
func GetHealthRiwayat(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var histories []models.Kesehatan
	err := config.DB.Where("mahasiswa_id = ?", student.ID).Order("tanggal DESC").Find(&histories).Error
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil riwayat kesehatan"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    histories,
	})
}

// CreateHealthRecord handles new health input
func CreateHealthRecord(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	type Input struct {
		Tanggal          time.Time `json:"tanggal"`
		JenisPemeriksaan string    `json:"jenis_pemeriksaan"`
		Hasil            string    `json:"hasil"`
		Catatan          string    `json:"catatan"`
	}

	var input Input
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data tidak valid"})
	}

	hasil := models.Kesehatan{
		MahasiswaID:      student.ID,
		Tanggal:          input.Tanggal,
		JenisPemeriksaan: input.JenisPemeriksaan,
		Hasil:            input.Hasil,
		Catatan:          input.Catatan,
	}

	if err := config.DB.Create(&hasil).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan data"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Data kesehatan berhasil disimpan.",
		"data":    hasil,
	})
}

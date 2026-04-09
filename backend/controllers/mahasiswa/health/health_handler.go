package health

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

func getStudentFromCtx(c *fiber.Ctx) (*models.Mahasiswa, error) {
	PenggunaID, ok := c.Locals("user_id").(uint)
	if !ok || PenggunaID == 0 {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return nil, err
	}
	return &student, nil
}

// GetHealthRiwayat returns all health screenings
func GetHealthRiwayat(c *fiber.Ctx) error {
	student, err := getStudentFromCtx(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var histories []models.Kesehatan
	if err = config.DB.Where("mahasiswa_id = ?", student.ID).Order("tanggal DESC").Find(&histories).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil riwayat kesehatan"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    histories,
	})
}

// CreateHealthRecord handles new health input
func CreateHealthRecord(c *fiber.Ctx) error {
	student, err := getStudentFromCtx(c)
	if err != nil {
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

	tanggal := input.Tanggal
	if tanggal.IsZero() {
		tanggal = time.Now()
	}

	hasil := models.Kesehatan{
		MahasiswaID:      student.ID,
		Tanggal:          tanggal,
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

// FE compatibility: /health/ringkasan
func GetHealthRingkasan(c *fiber.Ctx) error {
	student, err := getStudentFromCtx(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var last models.Kesehatan
	_ = config.DB.Where("mahasiswa_id = ?", student.ID).Order("tanggal DESC").First(&last).Error

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"terakhir":   last,
			"ada_data":   last.ID != 0,
			"updated_at": time.Now(),
		},
	})
}

// FE compatibility: /health/riwayat/:id
func GetHealthDetail(c *fiber.Ctx) error {
	student, err := getStudentFromCtx(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	id := c.Params("id")
	var rec models.Kesehatan
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", id, student.ID).First(&rec).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Riwayat kesehatan tidak ditemukan"})
	}

	return c.JSON(fiber.Map{"success": true, "data": rec})
}

// FE compatibility: /health/mandiri
func CreateHealthMandiri(c *fiber.Ctx) error {
	return CreateHealthRecord(c)
}

// FE compatibility: /health/tips
func GetHealthTips(c *fiber.Ctx) error {
	bmi := c.QueryFloat("bmi", 0)
	tips := "Pertahankan pola makan seimbang, tidur cukup, dan olahraga rutin."
	if bmi > 0 && bmi < 18.5 {
		tips = "BMI rendah: tambah asupan nutrisi seimbang dan konsultasi bila perlu."
	} else if bmi >= 25 {
		tips = "BMI tinggi: perbanyak aktivitas fisik dan kurangi konsumsi gula/lemak berlebih."
	}

	return c.JSON(fiber.Map{"success": true, "tips": tips})
}

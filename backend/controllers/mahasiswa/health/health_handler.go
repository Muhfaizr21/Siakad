package health

import (
	"math"
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GetHealthRingkasan returns the most recent health screening for the student
func GetHealthRingkasan(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)

	var student models.Mahasiswa
	if err := config.DB.First(&student, "user_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var latest models.HasilKesehatan
	err := config.DB.Where("student_id = ?", student.ID).
		Order("tanggal_periksa DESC, created_at DESC").
		First(&latest).Error
	if err != nil {
		return c.JSON(fiber.Map{
			"success": true,
			"data":    nil,
			"message": "Belum ada data pemeriksaan kesehatan.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    latest,
	})
}

// GetHealthRiwayat returns all health screenings with pagination and filtering
func GetHealthRiwayat(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)
	sumber := c.Query("sumber") // mandiri, kencana_screening, klinik_kampus

	var student models.Mahasiswa
	if err := config.DB.First(&student, "user_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	query := config.DB.Where("student_id = ?", student.ID)
	if sumber != "" && sumber != "Semua" {
		query = query.Where("sumber = ?", sumber)
	}

	var histories []models.HasilKesehatan
	err := query.Order("tanggal_periksa DESC, created_at DESC").Find(&histories).Error
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil riwayat kesehatan"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    histories,
	})
}

// GetHealthDetailRecord returns single health screening data
func GetHealthDetailRecord(c *fiber.Ctx) error {
	id := c.Params("id")
	PenggunaID := c.Locals("user_id").(uint)

	var student models.Mahasiswa
	if err := config.DB.First(&student, "user_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var detail models.HasilKesehatan
	if err := config.DB.Where("id = ? AND student_id = ?", id, student.ID).First(&detail).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    detail,
	})
}

// CreateHealthMandiri handles student self-input
func CreateHealthMandiri(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)

	var student models.Mahasiswa
	if err := config.DB.First(&student, "user_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	// Rate Limit: Max 3 entries per day
	var todayCount int64
	today := time.Now().Format("2006-01-02")
	config.DB.Model(&models.HasilKesehatan{}).
		Where("student_id = ? AND sumber = 'mandiri' AND DATE(created_at) = ?", student.ID, today).
		Count(&todayCount)

	if todayCount >= 3 {
		return c.Status(429).JSON(fiber.Map{
			"success": false, 
			"message": "Batas input harian tercapai (maks. 3x sehari). Silakan coba lagi besok.",
		})
	}

	type MandiriInput struct {
		TinggiBadan float64   `json:"tinggi_badan"`
		BeratBadan  float64   `json:"berat_badan"`
		Sistolik    int       `json:"sistolik"`
		Diastolik   int       `json:"diastolik"`
		Keluhan     string    `json:"keluhan"`
		Tanggal     time.Time `json:"tanggal"`
	}

	var input MandiriInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data tidak valid"})
	}

	// Validation
	if input.TinggiBadan < 100 || input.TinggiBadan > 250 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Tinggi badan tidak wajar (100-250 cm)"})
	}
	if input.BeratBadan < 20 || input.BeratBadan > 300 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Berat badan tidak wajar (20-300 kg)"})
	}
	if input.Tanggal.After(time.Now()) {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Tanggal pemeriksaan tidak boleh masa depan"})
	}

	// Calculate BMI
	bmi := input.BeratBadan / math.Pow(input.TinggiBadan/100, 2)
	bmi = math.Round(bmi*10) / 10

	// Determine Status Kesehatan
	status := "sehat"
	
	// BMI Checks
	isObesitas := bmi >= 30
	isOverweight := bmi >= 25 && bmi < 30
	isUnderweight := bmi < 18.5
	
	// Blood Pressure Checks (if provided)
	isBPHigh := input.Sistolik >= 140 || input.Diastolik >= 90
	isBPWarning := (input.Sistolik >= 120 && input.Sistolik < 140) || (input.Diastolik >= 80 && input.Diastolik < 90)

	if isObesitas || isBPHigh {
		status = "perlu_tindak_lanjut"
	} else if isOverweight || isUnderweight || isBPWarning {
		status = "perlu_perhatian"
	}

	hasil := models.HasilKesehatan{
		MahasiswaID:             student.ID,
		TanggalPeriksa:        input.Tanggal,
		TinggiBadan:           input.TinggiBadan,
		BeratBadan:            input.BeratBadan,
		BMI:                   bmi,
		TekananDarahSistolik:  input.Sistolik,
		TekananDarahDiastolik: input.Diastolik,
		GolonganDarah:         student.GolonganDarah, // Inherit from student profile
		Keluhan:               input.Keluhan,
		StatusKesehatan:       status,
		Sumber:                "mandiri",
		CreatedAt:             time.Now(),
	}

	if err := config.DB.Create(&hasil).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan data"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Data kesehatan berhasil disimpan mandiri.",
		"data":    hasil,
	})
}

// GetHealthTips returns static tips based on current BMI
func GetHealthTips(c *fiber.Ctx) error {
	bmiStr := c.Query("bmi")
	if bmiStr == "" {
		return c.JSON(fiber.Map{"success": true, "tips": "Masukkan data kesehatan untuk mendapatkan tips yang sesuai."})
	}

	tips := "Jaga pola makan sehat dan rutin berolahraga minimal 30 menit sehari."
	
	return c.JSON(fiber.Map{
		"success": true,
		"tips":    tips,
	})
}

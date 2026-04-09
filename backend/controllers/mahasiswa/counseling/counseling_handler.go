package counseling

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

func currentStudent(c *fiber.Ctx) (*models.Mahasiswa, error) {
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

// GetCounselingStatus returns student's counseling records
func GetCounselingStatus(c *fiber.Ctx) error {
	student, err := currentStudent(c)
	if err != nil {
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
	student, err := currentStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	type RequestBody struct {
		DosenID     uint      `json:"dosen_id"`
		JadwalID    uint      `json:"jadwal_id"`
		Topik       string    `json:"topik"`
		KeluhanAwal string    `json:"keluhan_awal"`
		Tanggal     time.Time `json:"tanggal"`
	}

	var req RequestBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Input tidak valid"})
	}

	topik := req.Topik
	if topik == "" {
		topik = req.KeluhanAwal
	}
	if topik == "" {
		topik = "Konseling"
	}

	dosenID := req.DosenID
	if dosenID == 0 {
		dosenID = req.JadwalID
	}
	if dosenID == 0 {
		var firstDosen models.Dosen
		if err := config.DB.Select("id").First(&firstDosen).Error; err == nil {
			dosenID = firstDosen.ID
		}
	}
	if dosenID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Dosen konseling tidak tersedia"})
	}
	var dosen models.Dosen
	if err := config.DB.Select("id").First(&dosen, dosenID).Error; err != nil {
		var firstDosen models.Dosen
		if errFirst := config.DB.Select("id").First(&firstDosen).Error; errFirst != nil || firstDosen.ID == 0 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Dosen konseling tidak ditemukan"})
		}
		dosenID = firstDosen.ID
	}

	tanggal := req.Tanggal
	if tanggal.IsZero() {
		tanggal = time.Now().AddDate(0, 0, 1)
	}

	konseling := models.Konseling{
		MahasiswaID: student.ID,
		DosenID:     dosenID,
		Tanggal:     tanggal,
		Topik:       topik,
		Status:      "Menunggu",
	}

	if err := config.DB.Create(&konseling).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": fmt.Sprintf("Gagal mengajukan konseling: %v", err)})
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Konseling berhasil diajukan",
		"data":    konseling,
	})
}

// FE compatibility: /counseling/jadwal
func GetCounselingJadwal(c *fiber.Ctx) error {
	var dosens []models.Dosen
	if err := config.DB.Select("id", "nama", "email").Limit(50).Find(&dosens).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil jadwal konseling"})
	}

	today := time.Now()
	slots := make([]fiber.Map, 0, len(dosens))
	for _, d := range dosens {
		slots = append(slots, fiber.Map{
			"ID":           d.ID,
			"NamaKonselor": d.Nama,
			"Tipe":         "Akademik",
			"Tanggal":      today,
			"JamMulai":     "09:00",
			"JamSelesai":   "10:00",
			"Lokasi":       "Ruang Konseling",
			"Kuota":        10,
			"SisaKuota":    8,
		})
	}

	return c.JSON(fiber.Map{"success": true, "data": slots})
}

// FE compatibility: /counseling/riwayat
func GetCounselingRiwayat(c *fiber.Ctx) error {
	return GetCounselingStatus(c)
}

// FE compatibility: /counseling/booking
func CreateBooking(c *fiber.Ctx) error {
	return RequestCounseling(c)
}

// FE compatibility: DELETE /counseling/riwayat/:id
func CancelBooking(c *fiber.Ctx) error {
	student, err := currentStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "ID booking wajib diisi"})
	}

	var booking models.Konseling
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", id, student.ID).First(&booking).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Booking tidak ditemukan"})
	}

	if booking.Status == "Dikonfirmasi" || booking.Status == "Selesai" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Booking tidak dapat dibatalkan"})
	}

	if err := config.DB.Model(&booking).Update("status", "Dibatalkan").Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membatalkan booking"})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Booking berhasil dibatalkan"})
}

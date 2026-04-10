package counseling

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

func getStudent(c *fiber.Ctx) (*models.Mahasiswa, error) {
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
	student, err := getStudent(c)
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
	student, err := getStudent(c)
	if err != nil {
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

	if req.DosenID == 0 {
		var dosen models.Dosen
		if err := config.DB.Order("id asc").First(&dosen).Error; err == nil {
			req.DosenID = dosen.ID
		}
	}
	if req.DosenID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Dosen konseling belum tersedia"})
	}
	if req.Topik == "" {
		req.Topik = "Konseling"
	}
	if req.Tanggal.IsZero() {
		req.Tanggal = time.Now().AddDate(0, 0, 1)
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

func GetCounselingJadwal(c *fiber.Ctx) error {
	var dosens []models.Dosen
	if err := config.DB.Select("id", "nama", "email").Limit(50).Find(&dosens).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil jadwal konseling"})
	}

	now := time.Now()
	list := make([]fiber.Map, 0, len(dosens))
	for _, d := range dosens {
		list = append(list, fiber.Map{
			"ID":           d.ID,
			"NamaKonselor": d.Nama,
			"Tipe":         "Akademik",
			"Tanggal":      now,
			"JamMulai":     "09:00",
			"JamSelesai":   "10:00",
			"Lokasi":       "Ruang Konseling",
			"Kuota":        10,
			"SisaKuota":    8,
		})
	}

	return c.JSON(fiber.Map{"success": true, "data": list})
}

func GetCounselingRiwayat(c *fiber.Ctx) error {
	return GetCounselingStatus(c)
}

func CreateBooking(c *fiber.Ctx) error {
	type BookingPayload struct {
		JadwalID    uint   `json:"jadwal_id"`
		KeluhanAwal string `json:"keluhan_awal"`
		DosenID     uint   `json:"dosen_id"`
		Topik       string `json:"topik"`
		Tanggal     string `json:"tanggal"`
	}

	var payload BookingPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Input booking tidak valid"})
	}

	parsedDate := time.Now().AddDate(0, 0, 1)
	if payload.Tanggal != "" {
		if t, err := time.Parse(time.RFC3339, payload.Tanggal); err == nil {
			parsedDate = t
		}
	}

	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	dosenID := payload.DosenID
	if dosenID == 0 {
		dosenID = payload.JadwalID
	}
	if dosenID == 0 {
		var d models.Dosen
		if err := config.DB.Order("id asc").First(&d).Error; err == nil {
			dosenID = d.ID
		}
	}
	if dosenID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Dosen konseling belum tersedia"})
	}

	topik := payload.Topik
	if topik == "" {
		topik = payload.KeluhanAwal
	}
	if topik == "" {
		topik = "Konseling"
	}

	konseling := models.Konseling{
		MahasiswaID: student.ID,
		DosenID:     dosenID,
		Tanggal:     parsedDate,
		Topik:       topik,
		Status:      "Menunggu",
	}

	if err := config.DB.Create(&konseling).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengajukan booking"})
	}

	return c.Status(201).JSON(fiber.Map{"success": true, "message": "Booking konseling berhasil diajukan", "data": konseling})
}

func CancelBooking(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	id := c.Params("id")
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

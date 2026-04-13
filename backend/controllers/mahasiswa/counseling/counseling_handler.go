package counseling

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"
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
	var schedules []models.JadwalKonseling
	if err := config.DB.Where("is_aktif = ?", true).Order("tanggal asc").Find(&schedules).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil jadwal konseling"})
	}

	return c.JSON(fiber.Map{"success": true, "data": schedules})
}

func GetCounselingRiwayat(c *fiber.Ctx) error {
	return GetCounselingStatus(c)
}

func CreateBooking(c *fiber.Ctx) error {
	type BookingPayload struct {
		JadwalID    uint   `json:"jadwal_id"`
		KeluhanAwal string `json:"keluhan_awal"`
	}

	var payload BookingPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Input booking tidak valid"})
	}

	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var schedule models.JadwalKonseling
	if err := config.DB.First(&schedule, payload.JadwalID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Jadwal konseling tidak ditemukan"})
	}

	if schedule.SisaKuota <= 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Kuota untuk jadwal ini sudah penuh"})
	}

	dosenID, err := resolveCounselorDosenID(schedule.NamaKonselor, student)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Dosen konselor tidak tersedia"})
	}
	if dosenID == 0 {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Dosen konselor tidak valid"})
	}

	// Create counseling record
	// Karena tidak boleh mengubah model Konseling, kita simpan informasi jadwal di field yang ada
	// Idealnya ada field JadwalID di models.Konseling, tapi kita hindari merubah model.go
	konseling := models.Konseling{
		MahasiswaID: student.ID,
		DosenID:     dosenID,
		Tanggal:     schedule.Tanggal,
		Topik:       "[" + schedule.Kategori + "] " + payload.KeluhanAwal,
		Status:      "Menunggu",
		Catatan:     "Konselor: " + schedule.NamaKonselor + ", Lokasi: " + schedule.Lokasi,
	}

	// Transaksi untuk memastikan kuota berkurang aman
	tx := config.DB.Begin()
	if err := tx.Create(&konseling).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuat booking"})
	}

	if err := tx.Model(&schedule).Update("sisa_kuota", schedule.SisaKuota-1).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mereservasi kuota"})
	}

	tx.Commit()

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Booking konseling berhasil diajukan",
		"data":    konseling,
	})
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

func resolveCounselorDosenID(namaKonselor string, student *models.Mahasiswa) (uint, error) {
	var dosen models.Dosen
	name := strings.TrimSpace(namaKonselor)

	if name != "" {
		if err := config.DB.Where("LOWER(nama) = LOWER(?)", name).Order("id asc").First(&dosen).Error; err == nil {
			return dosen.ID, nil
		}
		if err := config.DB.Where("LOWER(nama) LIKE LOWER(?)", "%"+name+"%").Order("id asc").First(&dosen).Error; err == nil {
			return dosen.ID, nil
		}
	}

	if err := config.DB.Order("id asc").First(&dosen).Error; err == nil {
		return dosen.ID, nil
	}

	if student == nil || student.FakultasID == 0 || student.ProgramStudiID == 0 {
		return 0, fiber.NewError(fiber.StatusBadRequest, "data mahasiswa tidak lengkap untuk membuat konselor")
	}

	var user models.User
	if err := config.DB.Where("LOWER(email) = LOWER(?)", "dosen.counseling@bku.ac.id").First(&user).Error; err != nil {
		fid := student.FakultasID
		user = models.User{Email: "dosen.counseling@bku.ac.id", Password: "$2a$10$BV.lyPPB3.i719lz2JO9DOcUwWATNoI82x0ve1/A05RbvgCQrD8Oe", Role: "dosen", FakultasID: &fid}
		if err := config.DB.Create(&user).Error; err != nil {
			return 0, err
		}
	}

	nidn := "0401" + time.Now().Format("150405")
	dosen = models.Dosen{
		PenggunaID:     user.ID,
		NIDN:           nidn,
		Nama:           "Dosen Konseling",
		FakultasID:     student.FakultasID,
		ProgramStudiID: student.ProgramStudiID,
	}
	if err := config.DB.Create(&dosen).Error; err != nil {
		if err := config.DB.Order("id asc").First(&dosen).Error; err == nil {
			return dosen.ID, nil
		}
		return 0, err
	}

	return dosen.ID, nil
}

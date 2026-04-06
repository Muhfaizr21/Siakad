package counseling

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// ResponseDTO to omit sensitive CatatanKonselor
type BookingResponse struct {
	ID              uint                   `json:"id"`
	Tipe            string                 `json:"tipe"`
	NamaKonselor    string                 `json:"nama_konselor"`
	Tanggal         time.Time              `json:"tanggal"`
	JamMulai        string                 `json:"jam_mulai"`
	JamSelesai      string                 `json:"jam_selesai"`
	Lokasi          string                 `json:"lokasi"`
	KeluhanAwal     string                 `json:"keluhan_awal"`
	Status          string                 `json:"status"`
	CreatedAt       time.Time              `json:"created_at"`
}

// GetJadwalKonseling returns available slots
func GetJadwalKonseling(c *fiber.Ctx) error {
	var jadwal []models.JadwalKonseling
	// Only show future/active schedules with sisa_kuota > 0
	err := config.DB.Where("is_aktif = ? AND sisa_kuota > ? AND tanggal >= ?", true, 0, time.Now().Format("2006-01-02")).
		Order("tanggal asc, jam_mulai asc").
		Find(&jadwal).Error
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil jadwal"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    jadwal,
	})
}

// CreateBooking handles student booking request
func CreateBooking(c *fiber.Ctx) error {
	userID := c.Locals("user_id")

	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	type BookingRequest struct {
		JadwalID    uint   `json:"jadwal_id"`
		KeluhanAwal string `json:"keluhan_awal"`
	}

	var req BookingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format request tidak valid"})
	}

	if len(req.KeluhanAwal) < 20 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Deskripsi keluhan minimal 20 karakter"})
	}

	// Transaction to ensure atomicity
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		var jadwal models.JadwalKonseling
		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&jadwal, req.JadwalID).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		if jadwal.SisaKuota <= 0 || !jadwal.IsAktif {
			return fiber.NewError(400, "Kuota jadwal ini sudah habis")
		}

		// Double booking check: student should not have another "Menunggu/Dikonfirmasi" booking on same slot
		var existing models.BookingKonseling
		tx.Where("student_id = ? AND jadwal_id = ? AND status IN ?", student.ID, jadwal.ID, []string{"Menunggu", "Dikonfirmasi"}).First(&existing)
		if existing.ID != 0 {
			return fiber.NewError(400, "Kamu sudah memiliki booking aktif untuk jadwal ini")
		}

		// Update Quota
		if err := tx.Model(&jadwal).Update("sisa_kuota", jadwal.SisaKuota-1).Error; err != nil {
			return err
		}

		// Create Booking Record
		newBooking := models.BookingKonseling{
			StudentID:   student.ID,
			JadwalID:    jadwal.ID,
			KeluhanAwal: req.KeluhanAwal,
			Status:      "Menunggu",
			CreatedAt:   time.Now(),
		}

		if err := tx.Create(&newBooking).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Booking berhasil diajukan. Mohon tunggu konfirmasi admin.",
	})
}

// GetRiwayatBooking returns student history without CatatanKonselor
func GetRiwayatBooking(c *fiber.Ctx) error {
	userID := c.Locals("user_id")

	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var bookings []models.BookingKonseling
	err := config.DB.Preload("JadwalKonseling").
		Where("student_id = ?", student.ID).
		Order("created_at desc").
		Find(&bookings).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil riwayat"})
	}

	// Map to Clean DTO
	var cleanList []BookingResponse
	for _, b := range bookings {
		cleanList = append(cleanList, BookingResponse{
			ID:           b.ID,
			Tipe:         b.JadwalKonseling.Tipe,
			NamaKonselor: b.JadwalKonseling.NamaKonselor,
			Tanggal:      b.JadwalKonseling.Tanggal,
			JamMulai:     b.JadwalKonseling.JamMulai,
			JamSelesai:   b.JadwalKonseling.JamSelesai,
			Lokasi:       b.JadwalKonseling.Lokasi,
			KeluhanAwal:  b.KeluhanAwal,
			Status:       b.Status,
			CreatedAt:    b.CreatedAt,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    cleanList,
	})
}

// CancelBooking cancels a pending booking
func CancelBooking(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user_id")

	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		var booking models.BookingKonseling
		if err := tx.First(&booking, "id = ? AND student_id = ?", id, student.ID).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		if booking.Status != "Menunggu" {
			return fiber.NewError(400, "Booking hanya bisa dibatalkan jika masih status Menunggu")
		}

		// Update Booking Status
		if err := tx.Model(&booking).Update("status", "Dibatalkan").Error; err != nil {
			return err
		}

		// Revert Quota
		if err := tx.Model(&models.JadwalKonseling{}).Where("id = ?", booking.JadwalID).UpdateColumn("sisa_kuota", gorm.Expr("sisa_kuota + 1")).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Booking berhasil dibatalkan",
	})
}

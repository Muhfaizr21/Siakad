package voice

import (
	"errors"
	"fmt"
	"math"
	"path/filepath"
	"siakad-backend/config"
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetStats returns count summary for student voice
func GetStats(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var total, diFakultas, diUniversitas, selesai int64
	
	config.DB.Model(&models.TiketAspirasi{}).Where("student_id = ?", student.ID).Count(&total)
	config.DB.Model(&models.TiketAspirasi{}).Where("student_id = ?", student.ID).
		Where("level_saat_ini = ?", "fakultas").Where("status != ?", "selesai").Count(&diFakultas)
	config.DB.Model(&models.TiketAspirasi{}).Where("student_id = ?", student.ID).
		Where("level_saat_ini = ?", "universitas").Where("status != ?", "selesai").Count(&diUniversitas)
	config.DB.Model(&models.TiketAspirasi{}).Where("student_id = ?", student.ID).
		Where("status = ?", "selesai").Count(&selesai)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total":          total,
			"di_fakultas":    diFakultas,
			"di_universitas": diUniversitas,
			"selesai":        selesai,
		},
	})
}

// CreateAspirasi handles new aspiration submission with file upload support
func CreateAspirasi(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var student models.Student
	if err := config.DB.Preload("Major").First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	judul := c.FormValue("judul")
	kategori := c.FormValue("kategori")
	isi := c.FormValue("isi")
	isAnonim := c.FormValue("is_anonim") == "true"
	
	// Validations
	if judul == "" || kategori == "" || isi == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Judul, kategori, dan isi wajib diisi"})
	}
	if len(judul) > 150 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Judul maksimal 150 karakter"})
	}
	if len(isi) < 50 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Isi aspirasi minimal 50 karakter"})
	}

	// Generate Nomor Tiket: SV-YYYYMMDD-XXXX
	today := time.Now().Format("20060102")
	prefix := fmt.Sprintf("SV-%s-", today)
	
	var lastTicket models.TiketAspirasi
	config.DB.Where("nomor_tiket LIKE ?", prefix+"%").Order("nomor_tiket DESC").First(&lastTicket)
	
	nextNum := 1
	if lastTicket.NomorTiket != "" {
		parts := strings.Split(lastTicket.NomorTiket, "-")
		if len(parts) == 3 {
			fmt.Sscanf(parts[2], "%d", &nextNum)
			nextNum++
		}
	}
	nomorTiket := fmt.Sprintf("%s%04d", prefix, nextNum)

	// Handle File Upload
	var lampiranURL string
	file, err := c.FormFile("lampiran")
	if err == nil {
		if file.Size > 5*1024*1024 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Ukuran lampiran maksimal 5MB"})
		}
		
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext == ".pdf" || ext == ".jpg" || ext == ".jpeg" || ext == ".png" {
			filename := fmt.Sprintf("%s_%d%s", nomorTiket, time.Now().Unix(), ext)
			savePath := filepath.Join("./uploads/student_voice", filename)
			if err := c.SaveFile(file, savePath); err == nil {
				lampiranURL = "/uploads/student_voice/" + filename
			}
		}
	}

	// Create Ticket
	tiket := models.TiketAspirasi{
		NomorTiket:   nomorTiket,
		StudentID:    student.ID,
		FakultasID:   student.Major.FacultyID,
		Kategori:     kategori,
		Judul:        judul,
		Isi:          isi,
		LampiranURL:  lampiranURL,
		IsAnonim:     isAnonim,
		LevelSaatIni: "fakultas",
		Status:       "menunggu",
	}

	if err := config.DB.Create(&tiket).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan aspirasi"})
	}

	// Create Initial Timeline Event
	fakultasName := "Fakultas"
	var faculty models.Faculty
	if err := config.DB.First(&faculty, student.Major.FacultyID).Error; err == nil {
		fakultasName = faculty.Name
	}

	timelineText := fmt.Sprintf("Aspirasi berhasil dikirim ke Admin %s.", fakultasName)
	if isAnonim {
		timelineText = fmt.Sprintf("Aspirasi berhasil dikirim secara anonim ke Admin %s.", fakultasName)
	}

	config.DB.Create(&models.TiketTimelineEvent{
		TiketID:    tiket.ID,
		TipeEvent:  "dikirim",
		Level:      "sistem",
		IsiRespons: timelineText,
	})

	// Trigger Notification to Student
	notifikasi.Kirim(config.DB, notifikasi.KirimParams{
		StudentID: student.ID,
		Type:      "student_voice",
		Title:     "Aspirasi Berhasil Dikirim",
		Content:   fmt.Sprintf("Aspirasi %s telah dikirim ke Admin %s.", nomorTiket, fakultasName),
		Link:      fmt.Sprintf("/student/voice/tiket/%s", tiket.ID),
	})

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Aspirasi berhasil dikirim dengan Nomor Tiket: " + nomorTiket,
		"data":    tiket,
	})
}

// GetAspirasiList returns paged list of student's own tickets
func GetAspirasiList(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	offset := (page - 1) * limit

	var total int64
	var tikets []models.TiketAspirasi

	query := config.DB.Model(&models.TiketAspirasi{}).Where("student_id = ?", student.ID)
	query.Count(&total)
	query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&tikets)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total":        total,
			"page":         page,
			"last_page":    math.Ceil(float64(total) / float64(limit)),
			"list":         tikets,
		},
	})
}

// GetDetail returns full detail with timeline
func GetDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user_id").(uint)

	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var tiket models.TiketAspirasi
	if err := config.DB.Preload("Timeline", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at DESC")
	}).First(&tiket, "id = ? AND student_id = ?", id, student.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(404).JSON(fiber.Map{"success": false, "message": "Tiket tidak ditemukan"})
		}
		// Return 500 for other database errors (like missing table)
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Terjadi kesalahan internal data: " + err.Error()})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    tiket,
	})
}

// CancelAspirasi allows student to cancel their own ticket
func CancelAspirasi(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user_id").(uint)

	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var tiket models.TiketAspirasi
	if err := config.DB.First(&tiket, "id = ? AND student_id = ?", id, student.ID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Tiket tidak ditemukan"})
	}

	if tiket.Status == "selesai" || tiket.LevelSaatIni == "universitas" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Aspirasi sudah diproses dan tidak dapat dibatalkan"})
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&tiket).Updates(map[string]interface{}{
			"status": "selesai",
			"level_saat_ini": "selesai",
		}).Error; err != nil {
			return err
		}

		return tx.Create(&models.TiketTimelineEvent{
			TiketID:    tiket.ID,
			TipeEvent:  "selesai",
			Level:      "sistem",
			IsiRespons: "Aspirasi dibatalkan oleh mahasiswa.",
		}).Error
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membatalkan aspirasi"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Aspirasi berhasil dibatalkan",
	})
}

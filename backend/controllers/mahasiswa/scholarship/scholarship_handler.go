package scholarship

import (
	"fmt"
	"os"
	"path/filepath"
	"siakad-backend/config"
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Pipeline Statuses
const (
	StatusDikirim       = "dikirim"
	StatusSeleksiBerkas = "seleksi_berkas"
	StatusEvaluasi      = "evaluasi"
	StatusReview        = "review"
	StatusPenetapan     = "penetapan"
	StatusDiterima      = "diterima"
	StatusDitolak       = "ditolak"
)

// GetKatalogBeasiswa retrieves all active scholarships with optional filtering
func GetKatalogBeasiswa(c *fiber.Ctx) error {
	var beasiswaList []models.Beasiswa
	kategori := c.Query("kategori", "")
	sort := c.Query("sort", "deadline_asc")

	query := config.DB.Where("is_aktif = ?", true).Where("deadline > ?", time.Now())

	if kategori != "" && kategori != "Semua" {
		query = query.Where("kategori = ?", kategori)
	}

	switch sort {
	case "nilai_desc":
		query = query.Order("nilai_bantuan desc")
	case "deadline_asc":
		query = query.Order("deadline asc")
	default:
		query = query.Order("deadline asc")
	}

	query.Find(&beasiswaList)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    beasiswaList,
	})
}

// GetBeasiswaDetail retrieves detail info for a single scholarship
func GetBeasiswaDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	var beasiswa models.Beasiswa

	if err := config.DB.First(&beasiswa, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Beasiswa tidak ditemukan"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    beasiswa,
	})
}

// DaftarBeasiswa handles multipart/form-data for scholarship applications with Transaction & Pipeline
func DaftarBeasiswa(c *fiber.Ctx) error {
	beasiswaID := c.Params("id")
	PenggunaID := c.Locals("user_id")

	var student models.Mahasiswa
	if err := config.DB.First(&student, "user_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	// START TRANSACTION
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var beasiswa models.Beasiswa
	// Use SELECT FOR UPDATE to handle race condition on SisaKuota
	if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&beasiswa, beasiswaID).Error; err != nil {
		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Beasiswa tidak ditemukan"})
	}

	// VALIDATIONS
	if !beasiswa.IsAktif || time.Now().After(beasiswa.Deadline) {
		tx.Rollback()
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Pendaftaran beasiswa ini sudah ditutup"})
	}

	if beasiswa.SisaKuota <= 0 {
		tx.Rollback()
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Kuota beasiswa telah terpenuhi"})
	}

	var existing models.PengajuanBeasiswa
	tx.Where("student_id = ? AND beasiswa_id = ?", student.ID, beasiswa.ID).First(&existing)
	if existing.ID != 0 {
		tx.Rollback()
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Kamu sudah pernah mendaftar beasiswa ini"})
	}

	// PARSE FORM
	motivasi := c.FormValue("motivasi")
	prestasi := c.FormValue("prestasi")
	if len(motivasi) < 150 {
		tx.Rollback()
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Surat motivasi minimal 150 karakter"})
	}

	// Generate Reference Number: BSW-YYYYMMDD-XXXX
	dateStr := time.Now().Format("20060102")
	var countToday int64
	tx.Model(&models.PengajuanBeasiswa{}).Where("nomor_referensi LIKE ?", "BSW-"+dateStr+"-%").Count(&countToday)
	refNum := fmt.Sprintf("BSW-%s-%04d", dateStr, countToday+1)

	// CREATE PENGAJUAN
	pengajuan := models.PengajuanBeasiswa{
		MahasiswaID:      student.ID,
		BeasiswaID:     beasiswa.ID,
		NomorReferensi: refNum,
		Motivasi:       motivasi,
		Prestasi:       prestasi,
		Status:         StatusDikirim,
		SubmittedAt:    time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := tx.Create(&pengajuan).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan pengajuan"})
	}

	// HANDLE FILES
	uploadDir := "./uploads/scholarship"
	_ = os.MkdirAll(uploadDir, os.ModePerm)

	// List of mandatory keys for files
	fileKeys := []string{"foto", "ktm", "kk"}
	if beasiswa.IsBerbasisEkonomi {
		fileKeys = append(fileKeys, "sktm")
	}
	if beasiswa.SyaratIPKMin > 0 {
		fileKeys = append(fileKeys, "transkrip")
	}

	for _, key := range fileKeys {
		file, err := c.FormFile(key)
		if err != nil {
			tx.Rollback()
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Berkas " + key + " wajib diunggah"})
		}

		ext := strings.ToLower(filepath.Ext(file.Filename))
		fileNamaMahasiswa := fmt.Sprintf("%s_%s_%s%s", refNum, key, uuid.New().String()[:8], ext)
		savePath := filepath.Join(uploadDir, fileNamaMahasiswa)

		if err := c.SaveFile(file, savePath); err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan berkas " + key})
		}

		tx.Create(&models.PengajuanBerkas{
			PengajuanID: pengajuan.ID,
			TipeBerkas:  key,
			FileURL:     "/uploads/scholarship/" + fileNamaMahasiswa,
			UploadedAt:  time.Now(),
		})
	}

	// CREATE INITIAL LOG
	tx.Create(&models.PengajuanPipelineLog{
		PengajuanID:  pengajuan.ID,
		Tahap:        StatusDikirim,
		CatatanAdmin: "Pengajuan berhasil diterima oleh sistem",
		CreatedAt:    time.Now(),
	})

	// UPDATE SISA KUOTA (Optional, usually sisa_kuota updated after 'Diterima')
	// For this request, we keep sisa_kuota as catalog info. 
	// Actual deduction happens during 'Penetapan' -> 'Diterima'.

	if err := tx.Commit().Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memproses pendaftaran"})
	}

	// Trigger Notification
	notifikasi.Kirim(config.DB, notifikasi.KirimParams{
		MahasiswaID: student.ID,
		Type:      "beasiswa",
		Title:     "Pendaftaran Berhasil",
		Content:   "Pengajuan beasiswa '" + beasiswa.Nama + "' berhasil dikirim. Nomor Referensi: " + refNum,
		Link:      "/student/scholarship/pengajuan/" + fmt.Sprint(pengajuan.ID),
	})

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Pendaftaran berhasil diajukan",
		"data":    pengajuan,
	})
}

// GetRiwayatPengajuan retrieves historical submissions with stats
func GetRiwayatPengajuan(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id")

	var student models.Mahasiswa
	if err := config.DB.First(&student, "user_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var riwayat []models.PengajuanBeasiswa
	config.DB.Preload("Beasiswa").Where("student_id = ?", student.ID).Order("submitted_at desc").Find(&riwayat)

	// Calculate Stats
	stats := fiber.Map{
		"total":    len(riwayat),
		"proses":   0,
		"diterima": 0,
		"ditolak":  0,
	}
	for _, r := range riwayat {
		if r.Status == StatusDiterima {
			stats["diterima"] = stats["diterima"].(int) + 1
		} else if r.Status == StatusDitolak {
			stats["ditolak"] = stats["ditolak"].(int) + 1
		} else {
			stats["proses"] = stats["proses"].(int) + 1
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    riwayat,
		"stats":   stats,
	})
}

// GetPengajuanDetail retrieves detailed tracking info + pipeline logs
func GetPengajuanDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	PenggunaID := c.Locals("user_id")

	var student models.Mahasiswa
	config.DB.First(&student, "user_id = ?", PenggunaID)

	var pengajuan models.PengajuanBeasiswa
	if err := config.DB.Preload("Beasiswa").Where("id = ? AND student_id = ?", id, student.ID).First(&pengajuan).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Pengajuan tidak ditemukan"})
	}

	var logs []models.PengajuanPipelineLog
	config.DB.Where("pengajuan_id = ?", pengajuan.ID).Order("created_at asc").Find(&logs)

	var berkas []models.PengajuanBerkas
	config.DB.Where("pengajuan_id = ?", pengajuan.ID).Find(&berkas)

	return c.JSON(fiber.Map{
		"success":   true,
		"pengajuan": pengajuan,
		"logs":      logs,
		"berkas":    berkas,
	})
}

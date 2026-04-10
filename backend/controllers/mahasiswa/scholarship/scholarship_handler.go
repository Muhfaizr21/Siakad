package scholarship

import (
	"fmt"
	"path/filepath"
	"siakad-backend/config"
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func getUserID(c *fiber.Ctx) (uint, error) {
	v, ok := c.Locals("user_id").(uint)
	if !ok || v == 0 {
		return 0, fiber.NewError(fiber.StatusUnauthorized, "User tidak terautentikasi")
	}
	return v, nil
}

// Pipeline Statuses
const (
	StatusMenunggu = "Menunggu"
	StatusProses   = "Proses"
	StatusDiterima = "Diterima"
	StatusDitolak  = "Ditolak"
)

// GetKatalogBeasiswa retrieves all active scholarships
func GetKatalogBeasiswa(c *fiber.Ctx) error {
	var beasiswaList []models.Beasiswa
	query := config.DB.Where("deadline > ?", time.Now())

	kategori := c.Query("kategori")
	if kategori != "" && kategori != "Semua" {
		query = query.Where("kategori = ?", kategori)
	}

	sortParam := c.Query("sort")
	if sortParam == "nilai_desc" {
		query = query.Order("nilai_bantuan desc")
	} else {
		query = query.Order("deadline asc") // default deadline_asc
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

// DaftarBeasiswa handles scholarship applications
func DaftarBeasiswa(c *fiber.Ctx) error {
	beasiswaID := c.Params("id")
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var beasiswa models.Beasiswa
	if err := config.DB.First(&beasiswa, beasiswaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Beasiswa tidak ditemukan"})
	}

	// VALIDATIONS
	if time.Now().After(beasiswa.Deadline) {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Pendaftaran beasiswa ini sudah ditutup"})
	}

	var existing models.BeasiswaPendaftaran
	config.DB.Where("mahasiswa_id = ? AND beasiswa_id = ?", student.ID, beasiswa.ID).First(&existing)
	if existing.ID != 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Kamu sudah pernah mendaftar beasiswa ini"})
	}

	// HANDLE FILE UPLOAD (Bukti URL)
	var buktiURL string
	file, err := c.FormFile("berkas_utama") // Generic main file
	if err == nil {
		ext := strings.ToLower(filepath.Ext(file.Filename))
		filename := fmt.Sprintf("beasiswa_%d_%s%s", student.ID, uuid.New().String()[:8], ext)
		savePath := "./uploads/scholarship/" + filename
		if err := c.SaveFile(file, savePath); err == nil {
			buktiURL = "/uploads/scholarship/" + filename
		}
	}

	// CREATE PENGAJUAN
	pengajuan := models.BeasiswaPendaftaran{
		MahasiswaID: student.ID,
		BeasiswaID:  beasiswa.ID,
		Status:      StatusMenunggu,
		Catatan:     c.FormValue("catatan"),
		BuktiURL:    buktiURL,
	}

	if err := config.DB.Create(&pengajuan).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan pendaftaran"})
	}

	// Trigger Notification
	notifikasi.Kirim(config.DB, notifikasi.KirimParams{
		MahasiswaID: student.ID,
		Type:        "beasiswa",
		Title:       "Pendaftaran Berhasil",
		Content:     "Pendaftaran beasiswa '" + beasiswa.Nama + "' berhasil dikirim. Menunggu verifikasi admin.",
		Link:        "/student/scholarship",
	})

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Pendaftaran berhasil diajukan",
		"data":    pengajuan,
	})
}

// GetRiwayatPengajuan retrieves historical submissions
func GetRiwayatPengajuan(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var riwayat []models.BeasiswaPendaftaran
	config.DB.Preload("Beasiswa").Where("mahasiswa_id = ?", student.ID).Order("created_at desc").Find(&riwayat)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    riwayat,
	})
}

// GetPengajuanDetail retrieves detailed tracking info
func GetPengajuanDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var student models.Mahasiswa
	config.DB.First(&student, "pengguna_id = ?", PenggunaID)

	var pengajuan models.BeasiswaPendaftaran
	if err := config.DB.Preload("Beasiswa").Where("id = ? AND mahasiswa_id = ?", id, student.ID).First(&pengajuan).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Pengajuan tidak ditemukan"})
	}

	return c.JSON(fiber.Map{
		"success":   true,
		"pengajuan": pengajuan,
	})
}

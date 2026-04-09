package kencana

import (
	"fmt"
	"math"
	"siakad-backend/config"
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"
	"time"

	"github.com/gofiber/fiber/v2"
)

// ==================== HELPER ====================

func getStudent(c *fiber.Ctx) (models.Mahasiswa, error) {
	PenggunaValue := c.Locals("user_id")
	PenggunaID, ok := PenggunaValue.(uint)
	if !ok {
		return models.Mahasiswa{}, fmt.Errorf("invalid user id")
	}
	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return student, err
	}
	return student, nil
}

// ==================== GET PROGRESS ====================

func GetProgress(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	// 1. Get All Activities
	var kegiatan []models.PkkmbKegiatan
	config.DB.Order("tanggal asc").Find(&kegiatan)

	// 2. Get Student Progress
	var progress []models.PkkmbProgress
	config.DB.Where("mahasiswa_id = ?", student.ID).Find(&progress)

	progressMap := make(map[uint]string)
	for _, p := range progress {
		progressMap[p.KegiatanID] = p.Status
	}

	// 3. Get Final Result
	var hasil models.PkkmbHasil
	config.DB.Where("mahasiswa_id = ?", student.ID).First(&hasil)

	// Build List Info
	type ActivityInfo struct {
		ID        uint      `json:"id"`
		Nama      string    `json:"nama"`
		Deskripsi string    `json:"deskripsi"`
		Tanggal   time.Time `json:"tanggal"`
		Lokasi    string    `json:"lokasi"`
		Status    string    `json:"status"` // Terdaftar, Hadir, Selesai
	}

	var list []ActivityInfo
	selesaiCount := 0
	for _, k := range kegiatan {
		status := "Belum"
		if s, ok := progressMap[k.ID]; ok {
			status = s
			if s == "Selesai" {
				selesaiCount++
			}
		}
		list = append(list, ActivityInfo{
			ID:        k.ID,
			Nama:      k.Judul,
			Deskripsi: k.Deskripsi,
			Tanggal:   k.Tanggal,
			Lokasi:    k.Lokasi,
			Status:    status,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"mahasiswa": student.Nama,
			"hasil":     hasil,
			"progress":  list,
			"stats": fiber.Map{
				"total":   len(kegiatan),
				"selesai": selesaiCount,
				"persen":  float64(selesaiCount) / math.Max(1, float64(len(kegiatan))) * 100,
			},
		},
	})
}

// CheckIn handles student check-in for a PKKMB event
func CheckIn(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	kegiatanID, _ := c.ParamsInt("id")

	var pg models.PkkmbProgress
	if err := config.DB.Where("mahasiswa_id = ? AND kegiatan_id = ?", student.ID, kegiatanID).First(&pg).Error; err != nil {
		// New registration
		pg = models.PkkmbProgress{
			MahasiswaID: student.ID,
			KegiatanID:  uint(kegiatanID),
			Status:      "Hadir",
		}
		config.DB.Create(&pg)
	} else {
		pg.Status = "Hadir"
		config.DB.Save(&pg)
	}

	return c.JSON(fiber.Map{"success": true, "message": "Berhasil check-in kegiatan"})
}

// GetSertifikat retrieves certificate if graduated
func GetSertifikat(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var sertif models.PkkmbSertifikat
	if err := config.DB.Where("mahasiswa_id = ?", student.ID).First(&sertif).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Sertifikat belum tersedia"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"has_sertifikat": true,
			"eligible":       true,
			"file_url":       sertif.FileURL,
			"nomor":          sertif.ID,
		},
	})
}

// SubmitBanding handles graduation appeal
func SubmitBanding(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	type BandingReq struct {
		Alasan string `json:"alasan"`
	}
	var req BandingReq
	c.BodyParser(&req)

	banding := models.PkkmbBanding{
		MahasiswaID: student.ID,
		Alasan:      req.Alasan,
		Status:      "Menunggu",
	}

	if err := config.DB.Create(&banding).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengajukan banding"})
	}

	// Trigger Notification
	notifikasi.Kirim(config.DB, notifikasi.KirimParams{
		UserID:  student.PenggunaID,
		Type:    "info",
		Title:   "Banding PKKMB",
		Content: "Pengajuan banding kelulusan PKKMB kamu telah diterima dan sedang diproses.",
	})

	return c.JSON(fiber.Map{"success": true, "message": "Banding berhasil diajukan"})
}

func GetBandingList(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var list []models.PkkmbBanding
	if err := config.DB.Where("mahasiswa_id = ?", student.ID).Order("created_at desc").Find(&list).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil data banding"})
	}

	return c.JSON(fiber.Map{"success": true, "data": list})
}

func GenerateSertifikat(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var existing models.PkkmbSertifikat
	if err := config.DB.Where("mahasiswa_id = ?", student.ID).First(&existing).Error; err == nil {
		return c.JSON(fiber.Map{"success": true, "data": existing})
	}

	newCert := models.PkkmbSertifikat{
		MahasiswaID:   student.ID,
		FileURL:       "/uploads/sertifikat/pkkmb-demo.pdf",
		TanggalTerbit: time.Now(),
	}
	if err := config.DB.Create(&newCert).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal generate sertifikat"})
	}

	return c.JSON(fiber.Map{"success": true, "data": newCert})
}

func GetKuisSoal(c *fiber.Ctx) error {
	kuisID := c.Params("id")
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"kuis_id":       kuisID,
			"judul":         "Kuis belum tersedia",
			"passing_grade": 70,
			"durasi_menit":  30,
			"bobot_persen":  0,
			"soal":          []any{},
		},
	})
}

func SubmitKuis(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"nilai":                   0,
			"lulus":                   false,
			"jumlah_benar":            0,
			"total_soal":              0,
			"nilai_kumulatif_terbaru": 0,
			"eligible_sertifikat":     false,
		},
	})
}

package controllers

import (
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

// --- RINGKASAN & MONITORING (UNTUK DASHBOARD) ---

func AmbilRingkasanPkkmb(c *fiber.Ctx) error {
	var totalMaba int64
	var totalLulus int64
	var totalProses int64

	config.DB.Model(&models.Mahasiswa{}).Count(&totalMaba)
	config.DB.Model(&models.PkkmbHasil{}).Where("status_kelulusan = ?", "Lulus").Count(&totalLulus)
	config.DB.Model(&models.PkkmbHasil{}).Where("status_kelulusan = ?", "Proses").Count(&totalProses)

	// Breakdown per Prodi
	type ProdiStats struct {
		ID          uint    `json:"id"`
		Prodi       string  `json:"prodi"`
		Partisipasi float64 `json:"partisipasi"`
		Nilai       float64 `json:"nilai"`
		Status      string  `json:"status"`
	}

	var prodis []models.ProgramStudi
	config.DB.Find(&prodis)

	var listStats []ProdiStats
	for _, p := range prodis {
		var mabaProdi int64
		config.DB.Model(&models.Mahasiswa{}).Where("program_studi_id = ?", p.ID).Count(&mabaProdi)

		var mabaLulus int64
		config.DB.Model(&models.PkkmbHasil{}).
			Joins("JOIN mahasiswa ON mahasiswa.id = pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.program_studi_id = ?", p.ID).
			Where("pkkmb_hasil.status_kelulusan = ?", "Lulus").
			Count(&mabaLulus)

		var avgNilai float64
		config.DB.Model(&models.PkkmbHasil{}).
			Joins("JOIN mahasiswa ON mahasiswa.id = pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.program_studi_id = ?", p.ID).
			Select("COALESCE(AVG(pkkmb_hasil.nilai), 0)").
			Scan(&avgNilai)

		partisipasi := 0.0
		if mabaProdi > 0 {
			partisipasi = (float64(mabaLulus) / float64(mabaProdi)) * 100
		}

		status := "Optimal"
		if partisipasi < 80 {
			status = "Warning"
		}

		listStats = append(listStats, ProdiStats{
			ID:          p.ID,
			Prodi:       p.Nama,
			Partisipasi: partisipasi,
			Nilai:       avgNilai,
			Status:      status,
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"stats": fiber.Map{
			"totalMaba":   totalMaba,
			"totalLulus":  totalLulus,
			"totalProses": totalProses,
		},
		"prodiBreakdown": listStats,
	})
}

// --- KEGIATAN (AGENDA) ---

func AmbilDaftarKegiatanPkkmb(c *fiber.Ctx) error {
	var k []models.PkkmbKegiatan
	config.DB.Order("tanggal asc").Find(&k)
	return c.JSON(fiber.Map{"status": "success", "data": k})
}

func TambahKegiatanPkkmb(c *fiber.Ctx) error {
	var k models.PkkmbKegiatan
	if err := c.BodyParser(&k); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Gagal memproses data"})
	}
	config.DB.Create(&k)
	return c.Status(201).JSON(fiber.Map{"status": "success", "data": k})
}

// --- MATERI ---

func AmbilDaftarMateriPkkmb(c *fiber.Ctx) error {
	// Model PkkmbMateri tidak ada di model.go
	return c.JSON(fiber.Map{"status": "success", "data": []string{}})
}

// --- TUGAS ---

func AmbilDaftarTugasPkkmb(c *fiber.Ctx) error {
	// Model PkkmbTugas tidak ada di model.go
	return c.JSON(fiber.Map{"status": "success", "data": []string{}})
}

// --- KELULUSAN (MAHASISWA) ---

func AmbilStatusKelulusanMahasiswa(c *fiber.Ctx) error {
	mID := c.Params("id")
	var s models.PkkmbHasil
	if err := config.DB.Preload("Mahasiswa").Where("mahasiswa_id = ?", mID).First(&s).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Status tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": s})
}

func AmbilDaftarKelulusanMaba(c *fiber.Ctx) error {
	var list []models.PkkmbHasil
	config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

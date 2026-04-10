package controllers

import (
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

// --- RINGKASAN & MONITORING (UNTUK DASHBOARD) ---

func AmbilRingkasanPkkmb(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var totalMaba int64
	var totalLulus int64
	var totalProses int64

	qMhs := config.DB.Model(&models.Mahasiswa{})
	qHasil := config.DB.Model(&models.PkkmbHasil{})

	if role == "faculty_admin" {
		qMhs = qMhs.Where("fakultas_id = ?", fid)
		qHasil = qHasil.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)
	}

	qMhs.Count(&totalMaba)
	qHasil.Where("status_kelulusan = ?", "Lulus").Count(&totalLulus)
	qHasil.Where("status_kelulusan = ?", "Proses").Count(&totalProses)

	// Breakdown per Prodi
	type ProdiStats struct {
		ID          uint    `json:"id"`
		Prodi       string  `json:"prodi"`
		Partisipasi float64 `json:"partisipasi"`
		Nilai       float64 `json:"nilai"`
		Status      string  `json:"status"`
	}

	var prodis []models.ProgramStudi
	qProdi := config.DB
	if role == "faculty_admin" {
		qProdi = qProdi.Where("fakultas_id = ?", fid)
	}
	qProdi.Find(&prodis)

	var listStats []ProdiStats
	for _, p := range prodis {
		var mabaProdi int64
		config.DB.Model(&models.Mahasiswa{}).Where("program_studi_id = ?", p.ID).Count(&mabaProdi)

		var mabaLulus int64
		config.DB.Model(&models.PkkmbHasil{}).
			Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.program_studi_id = ?", p.ID).
			Where("mahasiswa.pkkmb_hasil.status_kelulusan = ?", "Lulus").
			Count(&mabaLulus)

		var avgNilai float64
		config.DB.Model(&models.PkkmbHasil{}).
			Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.program_studi_id = ?", p.ID).
			Select("COALESCE(AVG(mahasiswa.pkkmb_hasil.nilai), 0)").
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
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	mID := c.Params("id")
	var s models.PkkmbHasil
	
	query := config.DB.Preload("Mahasiswa")
	if role == "faculty_admin" {
		query = query.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)
	}

	if err := query.Where("mahasiswa_id = ?", mID).First(&s).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Status tidak ditemukan atau Anda tidak memiliki akses"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": s})
}

func AmbilDaftarKelulusanMaba(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var list []models.PkkmbHasil
	query := config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna")
	
	if role == "faculty_admin" {
		query = query.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)
	}

	query.Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

package ormawa

import (
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

// --- RINGKASAN & MONITORING (UNTUK DASHBOARD ORMAWA) ---

func AmbilRingkasanPkkmb(c *fiber.Ctx) error {
	var totalMaba int64
	var totalLulus int64
	var totalProses int64

	qMhs := config.DB.Model(&models.Mahasiswa{})
	qHasil := config.DB.Model(&models.PkkmbHasil{})

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
	config.DB.Find(&prodis)

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

func AmbilDaftarKelulusanMaba(c *fiber.Ctx) error {
	var list []models.PkkmbHasil
	config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

// --- KEGIATAN (AGENDA) CRUD ORMAWA ---

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

func UpdateKegiatanPkkmb(c *fiber.Ctx) error {
	id := c.Params("id")
	var k models.PkkmbKegiatan
	if err := config.DB.First(&k, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Kegiatan tidak ditemukan"})
	}
	if err := c.BodyParser(&k); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}
	config.DB.Save(&k)
	return c.JSON(fiber.Map{"status": "success", "data": k, "message": "Kegiatan berhasil diperbarui"})
}

func HapusKegiatanPkkmb(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.PkkmbKegiatan{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus kegiatan"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Kegiatan berhasil dihapus"})
}

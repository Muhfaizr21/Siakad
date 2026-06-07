package controllers

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// --- RINGKASAN & MONITORING (UNTUK DASHBOARD) ---

func AmbilRingkasanPkkmb(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	// Fallback to X-Faculty-ID header for SuperAdmin
	headerFid := c.Get("X-Faculty-ID")
	if headerFid != "" && headerFid != "undefined" && headerFid != "null" && headerFid != "all" {
		if parsedFid, err := strconv.ParseUint(headerFid, 10, 32); err == nil {
			fid = uint(parsedFid)
			role = "faculty_admin"
		}
	}

	var totalMaba int64
	var totalLulus int64
	var totalProses int64
	var totalSertifikat int64

	if role == "faculty_admin" {
		config.DB.Model(&models.PkkmbHasil{}).
			Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid).
			Count(&totalMaba)

		config.DB.Model(&models.PkkmbHasil{}).
			Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid).
			Where("mahasiswa.pkkmb_hasil.status_kelulusan = ?", "Lulus").
			Count(&totalLulus)

		config.DB.Model(&models.PkkmbSertifikat{}).
			Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_sertifikat.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid).
			Count(&totalSertifikat)

		config.DB.Model(&models.PkkmbHasil{}).
			Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid).
			Where("mahasiswa.pkkmb_hasil.status_kelulusan = ?", "Proses").
			Count(&totalProses)
	} else if role == "prodi_admin" {
		pid, _ := c.Locals("program_studi_id").(uint)
		config.DB.Model(&models.PkkmbHasil{}).
			Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ? AND mahasiswa.mahasiswa.program_studi_id = ?", fid, pid).
			Count(&totalMaba)

		config.DB.Model(&models.PkkmbHasil{}).
			Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ? AND mahasiswa.mahasiswa.program_studi_id = ?", fid, pid).
			Where("mahasiswa.pkkmb_hasil.status_kelulusan = ?", "Lulus").
			Count(&totalLulus)

		config.DB.Model(&models.PkkmbSertifikat{}).
			Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_sertifikat.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ? AND mahasiswa.mahasiswa.program_studi_id = ?", fid, pid).
			Count(&totalSertifikat)

		config.DB.Model(&models.PkkmbHasil{}).
			Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ? AND mahasiswa.mahasiswa.program_studi_id = ?", fid, pid).
			Where("mahasiswa.pkkmb_hasil.status_kelulusan = ?", "Proses").
			Count(&totalProses)
	} else {
		config.DB.Model(&models.PkkmbHasil{}).Count(&totalMaba)
		config.DB.Model(&models.PkkmbHasil{}).Where("status_kelulusan = ?", "Lulus").Count(&totalLulus)
		config.DB.Model(&models.PkkmbSertifikat{}).Count(&totalSertifikat)
		config.DB.Model(&models.PkkmbHasil{}).Where("status_kelulusan = ?", "Proses").Count(&totalProses)
	}

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
	} else if role == "prodi_admin" {
		pid, _ := c.Locals("program_studi_id").(uint)
		qProdi = qProdi.Where("fakultas_id = ? AND id = ?", fid, pid)
	}
	qProdi.Find(&prodis)

	var listStats []ProdiStats
	for _, p := range prodis {
		var mabaProdi int64
		config.DB.Model(&models.PkkmbHasil{}).
			Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.program_studi_id = ?", p.ID).
			Count(&mabaProdi)

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
			"totalMaba":       totalMaba,
			"totalLulus":      totalLulus,
			"totalProses":     totalProses,
			"totalSertifikat": totalSertifikat,
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
	} else if role == "prodi_admin" {
		pid, _ := c.Locals("program_studi_id").(uint)
		query = query.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ? AND mahasiswa.mahasiswa.program_studi_id = ?", fid, pid)
	}

	if err := query.Where("mahasiswa_id = ?", mID).First(&s).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Status tidak ditemukan atau Anda tidak memiliki akses"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": s})
}

func AmbilDaftarKelulusanMaba(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	// Fallback to X-Faculty-ID header for SuperAdmin
	headerFid := c.Get("X-Faculty-ID")
	if headerFid != "" && headerFid != "undefined" && headerFid != "null" && headerFid != "all" {
		if parsedFid, err := strconv.ParseUint(headerFid, 10, 32); err == nil {
			fid = uint(parsedFid)
			role = "faculty_admin"
		}
	}

	var list []models.PkkmbHasil
	query := config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Preload("Mahasiswa.PkkmbSertifikat")
	
	if role == "faculty_admin" {
		query = query.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)
	} else if role == "prodi_admin" {
		pid, _ := c.Locals("program_studi_id").(uint)
		query = query.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ? AND mahasiswa.mahasiswa.program_studi_id = ?", fid, pid)
	}

	query.Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

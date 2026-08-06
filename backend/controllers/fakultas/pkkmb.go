package controllers

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
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

	headerPid := c.Get("X-Prodi-ID")
	if headerPid != "" && headerPid != "undefined" && headerPid != "null" && headerPid != "all" {
		if parsedPid, err := strconv.ParseUint(headerPid, 10, 32); err == nil {
			c.Locals("program_studi_id", uint(parsedPid))
			role = "prodi_admin"
		}
	}

	var totalMaba int64
	var totalLulus int64
	var totalProses int64
	var totalSertifikat int64
	var totalGagal int64

	// Helper function untuk get base query
	getBaseQuery := func() *gorm.DB {
		q := config.DB.Model(&models.PkkmbHasil{})
		if role == "faculty_admin" {
			q = q.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
				Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)
		} else if role == "prodi_admin" {
			pid, _ := c.Locals("program_studi_id").(uint)
			q = q.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id").
				Where("mahasiswa.mahasiswa.fakultas_id = ? AND mahasiswa.mahasiswa.program_studi_id = ?", fid, pid)
		}
		return q
	}

	getBaseQuery().Count(&totalMaba)
	getBaseQuery().Where("status_kelulusan = ?", "Lulus").Count(&totalLulus)
	getBaseQuery().Where("status_kelulusan = ?", "Proses").Count(&totalProses)
	getBaseQuery().Where("status_kelulusan = ?", "Gagal").Count(&totalGagal)

	// Count sertifikat
	sertifikatQuery := config.DB.Model(&models.PkkmbSertifikat{})
	if role == "faculty_admin" {
		sertifikatQuery = sertifikatQuery.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_sertifikat.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)
	} else if role == "prodi_admin" {
		pid, _ := c.Locals("program_studi_id").(uint)
		sertifikatQuery = sertifikatQuery.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_sertifikat.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ? AND mahasiswa.mahasiswa.program_studi_id = ?", fid, pid)
	}
	sertifikatQuery.Count(&totalSertifikat)

	// Distribusi Status (untuk Pie/Donut Chart)
	distribusi := fiber.Map{
		"Lulus":   totalLulus,
		"Proses":  totalProses,
		"Gagal":   totalGagal,
		"Total":   totalMaba,
	}

	// Breakdown per Angkatan
	type AngkatanStats struct {
		Angkatan  string `json:"angkatan"`
		Total     int64  `json:"total"`
		Lulus     int64  `json:"lulus"`
		Proses    int64  `json:"proses"`
		Gagal     int64  `json:"gagal"`
	}
	var angkatanList []AngkatanStats
	angkatanQuery := `SELECT
		COALESCE(mahasiswa.mahasiswa.angkatan, 'Unknown') as angkatan,
		COUNT(*) as total,
		SUM(CASE WHEN mahasiswa.pkkmb_hasil.status_kelulusan = 'Lulus' THEN 1 ELSE 0 END) as lulus,
		SUM(CASE WHEN mahasiswa.pkkmb_hasil.status_kelulusan = 'Proses' THEN 1 ELSE 0 END) as proses,
		SUM(CASE WHEN mahasiswa.pkkmb_hasil.status_kelulusan = 'Gagal' THEN 1 ELSE 0 END) as gagal
	FROM mahasiswa.pkkmb_hasil
	JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id`

	if role == "faculty_admin" {
		angkatanQuery += " WHERE mahasiswa.mahasiswa.fakultas_id = ? GROUP BY mahasiswa.mahasiswa.angkatan ORDER BY angkatan DESC"
		config.DB.Raw(angkatanQuery, fid).Scan(&angkatanList)
	} else if role == "prodi_admin" {
		pid, _ := c.Locals("program_studi_id").(uint)
		angkatanQuery += " WHERE mahasiswa.mahasiswa.fakultas_id = ? AND mahasiswa.mahasiswa.program_studi_id = ? GROUP BY mahasiswa.mahasiswa.angkatan ORDER BY angkatan DESC"
		config.DB.Raw(angkatanQuery, fid, pid).Scan(&angkatanList)
	} else {
		angkatanQuery += " GROUP BY mahasiswa.mahasiswa.angkatan ORDER BY angkatan DESC"
		config.DB.Raw(angkatanQuery).Scan(&angkatanList)
	}

	// Breakdown Gender
	type GenderStats struct {
		Gender  string `json:"gender"`
		Total   int64  `json:"total"`
		Lulus   int64  `json:"lulus"`
	}
	var genderList []GenderStats
	genderQuery := `SELECT
		COALESCE(mahasiswa.mahasiswa.jenis_kelamin, 'Unknown') as gender,
		COUNT(*) as total,
		SUM(CASE WHEN mahasiswa.pkkmb_hasil.status_kelulusan = 'Lulus' THEN 1 ELSE 0 END) as lulus
	FROM mahasiswa.pkkmb_hasil
	JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id`

	if role == "faculty_admin" {
		genderQuery += " WHERE mahasiswa.mahasiswa.fakultas_id = ? GROUP BY mahasiswa.mahasiswa.jenis_kelamin"
		config.DB.Raw(genderQuery, fid).Scan(&genderList)
	} else if role == "prodi_admin" {
		pid, _ := c.Locals("program_studi_id").(uint)
		genderQuery += " WHERE mahasiswa.mahasiswa.fakultas_id = ? AND mahasiswa.mahasiswa.program_studi_id = ? GROUP BY mahasiswa.mahasiswa.jenis_kelamin"
		config.DB.Raw(genderQuery, fid, pid).Scan(&genderList)
	} else {
		genderQuery += " GROUP BY mahasiswa.mahasiswa.jenis_kelamin"
		config.DB.Raw(genderQuery).Scan(&genderList)
	}

	// Distribusi Nilai (Histogram)
	type NilaiDist struct {
		Range string `json:"range"`
		Count int64  `json:"count"`
	}
	var nilaiDist []NilaiDist
	nilaiQuery := `SELECT
		CASE
			WHEN nilai >= 90 THEN '90-100'
			WHEN nilai >= 80 THEN '80-89'
			WHEN nilai >= 70 THEN '70-79'
			WHEN nilai >= 60 THEN '60-69'
			WHEN nilai >= 50 THEN '50-59'
			ELSE '0-49'
		END as range,
		COUNT(*) as count
	FROM mahasiswa.pkkmb_hasil
	JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pkkmb_hasil.mahasiswa_id`

	if role == "faculty_admin" {
		nilaiQuery += " WHERE mahasiswa.mahasiswa.fakultas_id = ? GROUP BY range ORDER BY range"
		config.DB.Raw(nilaiQuery, fid).Scan(&nilaiDist)
	} else if role == "prodi_admin" {
		pid, _ := c.Locals("program_studi_id").(uint)
		nilaiQuery += " WHERE mahasiswa.mahasiswa.fakultas_id = ? AND mahasiswa.mahasiswa.program_studi_id = ? GROUP BY range ORDER BY range"
		config.DB.Raw(nilaiQuery, fid, pid).Scan(&nilaiDist)
	} else {
		nilaiQuery += " GROUP BY range ORDER BY range"
		config.DB.Raw(nilaiQuery).Scan(&nilaiDist)
	}

	// Batas Nilai Kelulusan (threshold)
	batasNilai := 70.0 // default

	// Kegiatan (Agenda) PKKMB
	type KegiatanInfo struct {
		ID          uint    `json:"id"`
		Nama        string  `json:"nama" gorm:"column:judul"`
		Tanggal     string  `json:"tanggal"`
		Lokasi      string  `json:"lokasi"`
		Status      string  `json:"status"`
	}
	var kegiatanList []KegiatanInfo
	config.DB.Model(&models.PkkmbKegiatan{}).Limit(5).Order("tanggal asc").Scan(&kegiatanList)

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
			"totalGagal":      totalGagal,
			"totalSertifikat": totalSertifikat,
		},
		"distribusi":      distribusi,
		"angkatanStats":   angkatanList,
		"genderStats":     genderList,
		"nilaiDist":       nilaiDist,
		"batasNilai":      batasNilai,
		"kegiatanList":    kegiatanList,
		"prodiBreakdown":  listStats,
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

	headerPid := c.Get("X-Prodi-ID")
	if headerPid != "" && headerPid != "undefined" && headerPid != "null" && headerPid != "all" {
		if parsedPid, err := strconv.ParseUint(headerPid, 10, 32); err == nil {
			c.Locals("program_studi_id", uint(parsedPid))
			role = "prodi_admin"
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

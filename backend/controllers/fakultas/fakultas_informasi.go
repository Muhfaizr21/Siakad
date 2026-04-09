package controllers

import (
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

// --- DASHBOARD ---

func AmbilRingkasanDashboard(c *fiber.Ctx) error {
	var totalMhs int64
	var totalDosen int64
	var totalProdi int64

	config.DB.Model(&models.Mahasiswa{}).Count(&totalMhs)
	config.DB.Model(&models.Dosen{}).Count(&totalDosen)
	var totalPrestasiPending int64
	config.DB.Model(&models.Prestasi{}).Where("status = ?", "MENUNGGU").Count(&totalPrestasiPending)
	config.DB.Model(&models.ProgramStudi{}).Count(&totalProdi)

	// Status counts (Aktif, Cuti, Lulus, DO, etc.)
	type StatusCount struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}
	var statusCounts []StatusCount
	config.DB.Table("mahasiswa").
		Select("status_akun as status, count(*) as count").
		Group("status_akun").
		Scan(&statusCounts)

	// Prodi Distribution with Accreditation & Avg IPK
	type ProdiDist struct {
		NamaProdi  string  `json:"nama_prodi"`
		Jumlah     int64   `json:"jumlah"`     // Total Mahasiswa
		Active     int64   `json:"active"`     // Aktif
		Graduated  int64   `json:"graduated"`  // Lulus
		AvgIPK     float64 `json:"avgIPK"`     // Rata-rata IPK
		Akreditasi string  `json:"akreditasi"` // Akreditasi
	}
	var prodiDist []ProdiDist
	config.DB.Table("program_studi").
		Select("program_studi.nama as nama_prodi, " +
			"program_studi.akreditasi as akreditasi, " +
			"count(mahasiswa.id) as jumlah, " +
			"sum(case when mahasiswa.status_akun = 'Aktif' then 1 else 0 end) as active, " +
			"sum(case when mahasiswa.status_akun = 'Lulus' then 1 else 0 end) as graduated, " +
			"coalesce(avg(mahasiswa.ipk), 0) as avg_IPK").
		Joins("left join mahasiswa on mahasiswa.program_studi_id = program_studi.id").
		Group("program_studi.id, program_studi.nama, program_studi.akreditasi").
		Scan(&prodiDist)

	// Per Angkatan (Trend)
	type AngkatanDist struct {
		Tahun     int   `json:"tahun"`
		Diterima  int64 `json:"diterima"`
		Pendaftar int64 `json:"pendaftar"`
	}
	var trendData []AngkatanDist
	config.DB.Table("mahasiswa").
		Select("tahun_masuk as tahun, count(*) as diterima, count(*) + 5 as pendaftar"). // Mocking pendaftar as slightly more than accepted
		Where("tahun_masuk > 0").
		Group("tahun_masuk").
		Order("tahun_masuk asc").
		Scan(&trendData)

	// Aktivitas Terbaru (Gabungan Prestasi, Aspirasi, Beasiswa, Mahasiswa Baru)
	type ActivityItem struct {
		User   string `json:"user"`
		Action string `json:"action"`
		Time   string `json:"time"`
		Avatar string `json:"avatar"`
	}
	var logs []ActivityItem

	// Ambil 5 Prestasi Terbaru
	var pList []models.Prestasi
	config.DB.Preload("Mahasiswa").Order("id desc").Limit(3).Find(&pList)
	for _, p := range pList {
		logs = append(logs, ActivityItem{
			User:   p.Mahasiswa.Nama,
			Action: "mengajukan prestasi: " + p.NamaKegiatan,
			Time:   "Baru saja",
			Avatar: string(p.Mahasiswa.Nama[0]),
		})
	}

	// Ambil 2 Mahasiswa Terbaru
	var mList []models.Mahasiswa
	config.DB.Order("id desc").Limit(2).Find(&mList)
	for _, m := range mList {
		logs = append(logs, ActivityItem{
			User:   m.Nama,
			Action: "terdaftar sebagai mahasiswa baru",
			Time:   "Hari ini",
			Avatar: string(m.Nama[0]),
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"totalStudents":     totalMhs,
			"totalLecturers":    totalDosen,
			"totalProdi":        totalProdi,
			"totalPrestasi":     totalPrestasiPending,
			"statusCounts":      statusCounts,
			"prodiDistribution": prodiDist,
			"trendData":         trendData,
			"recentActivity":    logs,
		},
	})
}

// --- ARTIKEL / BERITA ---

func AmbilDaftarBerita(c *fiber.Ctx) error {
	var daftar []models.Berita
	config.DB.Order("created_at desc").Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func TambahBeritaBaru(c *fiber.Ctx) error {
	var b models.Berita
	if err := c.BodyParser(&b); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}
	config.DB.Create(&b)
	return c.JSON(fiber.Map{"status": "success", "message": "Berita diterbitkan", "data": b})
}

func PerbaruiBerita(c *fiber.Ctx) error {
	id := c.Params("id")
	var b models.Berita
	if err := config.DB.First(&b, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not Found"})
	}
	c.BodyParser(&b)
	config.DB.Save(&b)
	return c.JSON(fiber.Map{"status": "success", "message": "Berita diperbarui"})
}

func HapusBerita(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Berita{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Berita dihapus"})
}

// --- PMB (PENDAFTARAN MAHASISWA BARU) ---

func AmbilDaftarPendaftarMB(c *fiber.Ctx) error {
	// Model Admission tidak ada di model.go
	return c.JSON(fiber.Map{"status": "success", "data": []string{}})
}

func PerbaruiStatusPendaftarMB(c *fiber.Ctx) error {
	return c.Status(501).JSON(fiber.Map{"status": "error", "message": "Fitur tidak tersedia"})
}

// --- RBAC & PERAN ---

func AmbilDaftarPeran(c *fiber.Ctx) error {
	// Model Peran tidak ada di model.go, peran adalah string di model User
	return c.JSON(fiber.Map{"status": "success", "data": []string{"admin_fakultas", "dosen", "mahasiswa"}})
}

// --- LAPORAN & STATISTIK ---

func AmbilRingkasanLaporan(c *fiber.Ctx) error {
	var total int64
	var active int64
	var graduated int64
	var avgIPK float64
	var totalPrestasi int64
	var totalBeasiswa int64
	var totalKonseling int64

	config.DB.Model(&models.Mahasiswa{}).Count(&total)
	config.DB.Model(&models.Mahasiswa{}).Where("status_akun = ?", "Aktif").Count(&active)
	config.DB.Model(&models.Mahasiswa{}).Where("status_akun = ?", "Lulus").Count(&graduated)
	config.DB.Model(&models.Prestasi{}).Count(&totalPrestasi)
	config.DB.Model(&models.Beasiswa{}).Count(&totalBeasiswa)
	config.DB.Model(&models.Konseling{}).Count(&totalKonseling)

	// Gunakan Raw untuk AVG agar tidak error saat data kosong
	config.DB.Raw("SELECT COALESCE(AVG(ipk), 0) FROM mahasiswa").Scan(&avgIPK)

	// Per Prodi (Distribusi) - Menampilkan semua prodi meskipun belum ada mahasiswanya
	type ProdiDist struct {
		NamaProdi      string  `json:"nama_prodi"`
		Value     int64   `json:"value"`     // Total Mahasiswa
		Active    int64   `json:"active"`    // Aktif
		Leave     int64   `json:"leave"`     // Cuti
		Graduated int64   `json:"graduated"` // Lulus
		AvgIPK    float64 `json:"avgIPK"`    // Rata-rata IPK
	}
	var perProdi []ProdiDist
	config.DB.Table("program_studi").
		Select("program_studi.nama as nama_prodi, " +
			"count(mahasiswa.id) as value, " +
			"sum(case when mahasiswa.status_akun = 'Aktif' then 1 else 0 end) as active, " +
			"sum(case when mahasiswa.status_akun = 'Cuti' then 1 else 0 end) as leave, " +
			"sum(case when mahasiswa.status_akun = 'Lulus' then 1 else 0 end) as graduated, " +
			"coalesce(avg(mahasiswa.ipk), 0) as avg_IPK").
		Joins("left join mahasiswa on mahasiswa.program_studi_id = program_studi.id").
		Group("program_studi.id, program_studi.nama").
		Scan(&perProdi)

	// Per Angkatan (Trend)
	type AngkatanDist struct {
		Angkatan int   `json:"angkatan"`
		Aktif    int64 `json:"aktif"`
		Lulus    int64 `json:"lulus"`
	}
	var perAngkatan []AngkatanDist
	config.DB.Table("mahasiswa").
		Select("tahun_masuk as angkatan, " +
			"sum(case when status_akun = 'Aktif' then 1 else 0 end) as aktif, " +
			"sum(case when status_akun = 'Lulus' then 1 else 0 end) as lulus").
		Where("tahun_masuk > 0").
		Group("tahun_masuk").
		Order("tahun_masuk asc").
		Scan(&perAngkatan)

	// Distribusi IPK Real
	type IPKRange struct {
		Range string `json:"range"`
		Count int64  `json:"count"`
	}
	var ipkDist []IPKRange
	config.DB.Raw(`
		SELECT 
			CASE 
				WHEN ipk >= 3.5 THEN '3.5 - 4.0'
				WHEN ipk >= 3.0 THEN '3.0 - 3.49'
				WHEN ipk >= 2.5 THEN '2.5 - 2.99'
				ELSE '< 2.5'
			END as range,
			COUNT(*) as count
		FROM mahasiswa
		GROUP BY range
		ORDER BY range DESC
	`).Scan(&ipkDist)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"summary": fiber.Map{
				"total":          total,
				"active":         active,
				"graduated":      graduated,
				"avgIPK":         avgIPK,
				"totalPrestasi":  totalPrestasi,
				"totalBeasiswa":  totalBeasiswa,
				"totalKonseling": totalKonseling,
			},
			"perProdi":    perProdi,
			"perAngkatan": perAngkatan,
			"ipkDist":     ipkDist,
		},
	})
}

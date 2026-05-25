package controllers

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// --- DASHBOARD ---

func AmbilRingkasanDashboard(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var totalMhs int64
	var totalProdi int64

	qMhs := config.DB.Model(&models.Mahasiswa{})
	qPrestasi := config.DB.Model(&models.Prestasi{})
	qProdi := config.DB.Model(&models.ProgramStudi{})

	if role == "faculty_admin" {
		qMhs = qMhs.Where("fakultas_id = ?", fid)
		qPrestasi = qPrestasi.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
		qProdi = qProdi.Where("fakultas_id = ?", fid)
	}

	qMhs.Count(&totalMhs)
	qProdi.Count(&totalProdi)

	var totalPrestasiPending int64
	qPrestasi.Where("status = ?", "Menunggu").Count(&totalPrestasiPending)

	// Status counts (Aktif, Cuti, Lulus, DO, etc.)
	type StatusCount struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}
	var statusCounts = []StatusCount{}
	qStatus := config.DB.Table("mahasiswa.mahasiswa").
		Select("status_akun as status, count(*) as count").
		Where("deleted_at IS NULL").
		Group("status_akun")

	if role == "faculty_admin" {
		qStatus = qStatus.Where("fakultas_id = ?", fid)
	}
	qStatus.Scan(&statusCounts)

	// Prodi Distribution with Accreditation & Avg IPK
	type ProdiDist struct {
		Name       string  `gorm:"column:name" json:"name"`
		Jumlah     int64   `gorm:"column:jumlah" json:"jumlah"`
		Active     int64   `gorm:"column:active" json:"active"`
		Graduated  int64   `gorm:"column:graduated" json:"graduated"`
		AvgGpa     float64 `gorm:"column:avg_gpa" json:"avgGpa"`
		Akreditasi string  `gorm:"column:akreditasi" json:"akreditasi"`
	}
	var prodiDist = []ProdiDist{}

	sqlProdi := `
		SELECT 
			ps.nama || ' (' || ps.jenjang || ')' as name,
			ps.akreditasi as akreditasi,
			COUNT(m.id) as jumlah,
			SUM(CASE WHEN m.status_akun = 'Aktif' THEN 1 ELSE 0 END) as active,
			SUM(CASE WHEN m.status_akun = 'Lulus' THEN 1 ELSE 0 END) as graduated,
			COALESCE(AVG(m.ip_k), 0) as avg_gpa
		FROM fakultas.program_studi ps
		LEFT JOIN mahasiswa.mahasiswa m ON m.program_studi_id = ps.id AND m.deleted_at IS NULL
		WHERE ps.deleted_at IS NULL `

	if role == "faculty_admin" {
		sqlProdi += fmt.Sprintf(" AND ps.fakultas_id = %d ", fid)
	}

	sqlProdi += " GROUP BY ps.id, ps.nama, ps.jenjang, ps.akreditasi"
	config.DB.Raw(sqlProdi).Scan(&prodiDist)

	// Per Angkatan (Trend)
	type AngkatanDist struct {
		Tahun     int   `json:"tahun"`
		Diterima  int64 `json:"diterima"`
		Pendaftar int64 `json:"pendaftar"`
	}
	var trendData = []AngkatanDist{}
	qTrend := config.DB.Table("mahasiswa.mahasiswa").
		Select("tahun_masuk as tahun, count(*) as diterima, count(*) + 5 as pendaftar").
		Where("tahun_masuk > 0 AND deleted_at IS NULL").
		Group("tahun_masuk").
		Order("tahun_masuk asc")

	if role == "faculty_admin" {
		qTrend = qTrend.Where("fakultas_id = ?", fid)
	}
	qTrend.Scan(&trendData)

	// Aktivitas Terbaru
	type ActivityItem struct {
		User   string `json:"user"`
		Action string `json:"action"`
		Time   string `json:"time"`
		Avatar string `json:"avatar"`
	}
	var logs = []ActivityItem{}

	qPList := config.DB.Preload("Mahasiswa").Order("id desc").Limit(3)
	if role == "faculty_admin" {
		qPList = qPList.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}
	var pList []models.Prestasi
	qPList.Find(&pList)
	for _, p := range pList {
		logs = append(logs, ActivityItem{
			User:   p.Mahasiswa.Nama,
			Action: "mengajukan prestasi: " + p.NamaKegiatan,
			Time:   "Baru saja",
			Avatar: string(p.Mahasiswa.Nama[0]),
		})
	}

	qMList := config.DB.Order("id desc").Limit(2)
	if role == "faculty_admin" {
		qMList = qMList.Where("fakultas_id = ?", fid)
	}
	var mList []models.Mahasiswa
	qMList.Find(&mList)
	for _, m := range mList {
		logs = append(logs, ActivityItem{
			User:   m.Nama,
			Action: "terdaftar sebagai mahasiswa baru",
			Time:   "Hari ini",
			Avatar: string(m.Nama[0]),
		})
	}

	var activePeriod models.AcademicPeriod
	config.DB.Where("is_aktif = ?", true).First(&activePeriod)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"totalStudents":     totalMhs,
			"totalLecturers":    0,
			"totalProdi":        totalProdi,
			"totalPrestasi":     totalPrestasiPending,
			"statusCounts":      statusCounts,
			"prodiDistribution": prodiDist,
			"trendData":         trendData,
			"recentActivity":    logs,
			"activePeriod":      activePeriod.Name,
		},
	})
}

// --- PMB (PENDAFTARAN MAHASISWA BARU) ---

func AmbilDaftarPendaftarMB(c *fiber.Ctx) error {
	var list []models.PendaftaranMahasiswaBaru
	if err := config.DB.Order("id asc").Find(&list).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data pendaftaran"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func PerbaruiStatusPendaftarMB(c *fiber.Ctx) error {
	id := c.Params("id")

	type StatusReq struct {
		Status string `json:"status"`
	}
	var req StatusReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}

	var admission models.PendaftaranMahasiswaBaru
	if err := config.DB.First(&admission, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Data pendaftaran tidak ditemukan"})
	}

	oldStatus := admission.Status
	admission.Status = req.Status
	if err := config.DB.Save(&admission).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui status pendaftaran"})
	}

	// Jika pendaftaran disetujui / diverifikasi, otomatis daftarkan sebagai Mahasiswa Aktif dan Peserta PKKMB
	if (req.Status == "Verified" || req.Status == "Approved") && (oldStatus != "Verified" && oldStatus != "Approved") {
		var countMhs int64
		config.DB.Model(&models.Mahasiswa{}).Where("nama = ? OR email_personal = ?", admission.NamaLengkap, admission.Email).Count(&countMhs)
		if countMhs == 0 {
			var prodi models.ProgramStudi
			if err := config.DB.Where("nama ILIKE ?", "%"+admission.PilihanProdi+"%").First(&prodi).Error; err != nil {
				config.DB.First(&prodi) // Default
			}

			// Generate NIM
			nim := fmt.Sprintf("261%s%03d", prodi.Kode, admission.ID)

			err := config.DB.Transaction(func(tx *gorm.DB) error {
				defaultPassword := "pass" + nim
				hashedPassword, err := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)
				if err != nil {
					return err
				}

				user := models.User{
					Email:    admission.Email,
					Password: string(hashedPassword),
					Role:     "mahasiswa",
				}
				if err := tx.Create(&user).Error; err != nil {
					return err
				}

				mhs := models.Mahasiswa{
					PenggunaID:       user.ID,
					Nama:             admission.NamaLengkap,
					NIM:              nim,
					FakultasID:       prodi.FakultasID,
					ProgramStudiID:   prodi.ID,
					StatusAkun:       "Aktif",
					StatusAkademik:   "Aktif",
					SemesterSekarang: 1,
					TahunMasuk:       time.Now().Year(),
					EmailPersonal:    admission.Email,
					NoHP:             admission.NoHP,
					JalurMasuk:       admission.Jalur,
				}
				if err := tx.Omit("Pengguna").Create(&mhs).Error; err != nil {
					return err
				}

				pkkmb := models.PkkmbHasil{
					MahasiswaID:     mhs.ID,
					Nilai:           0.0,
					StatusKelulusan: "Proses",
				}
				if err := tx.Create(&pkkmb).Error; err != nil {
					return err
				}

				return nil
			})
			if err != nil {
				return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal meregistrasikan mahasiswa aktif baru: " + err.Error()})
			}
		}
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Status pendaftaran berhasil diperbarui"})
}

// --- RBAC & PERAN ---

func AmbilDaftarPeran(c *fiber.Ctx) error {
	// Model Peran tidak ada di model.go, peran adalah string di model User
	return c.JSON(fiber.Map{"status": "success", "data": []string{"admin_fakultas", "mahasiswa"}})
}

// --- LAPORAN & STATISTIK ---

func AmbilRingkasanLaporan(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var total int64
	var active int64
	var graduated int64
	var avgIPK float64
	var totalPrestasi int64
	var totalBeasiswa int64
	var totalKonseling int64

	qMhs := config.DB.Model(&models.Mahasiswa{})
	if role == "faculty_admin" {
		qMhs = qMhs.Where("fakultas_id = ?", fid)
	}

	qMhs.Count(&total)
	qMhs.Where("status_akun = ?", "Aktif").Count(&active)
	qMhs.Where("status_akun = ?", "Lulus").Count(&graduated)

	qP := config.DB.Model(&models.Prestasi{})
	qB := config.DB.Model(&models.Beasiswa{}) // Beasiswa is global, but pendaftar is per mhs
	qK := config.DB.Model(&models.Konseling{})

	if role == "faculty_admin" {
		qP = qP.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
		qK = qK.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
		// For beasiswa, we count participants from this faculty
		config.DB.Model(&models.BeasiswaPendaftaran{}).Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid).Count(&totalBeasiswa)
	} else {
		qB.Count(&totalBeasiswa)
	}

	qP.Count(&totalPrestasi)
	qK.Count(&totalKonseling)

	sqlAvg := "SELECT COALESCE(AVG(ip_k), 0) FROM mahasiswa.mahasiswa WHERE deleted_at IS NULL"
	if role == "faculty_admin" {
		sqlAvg += fmt.Sprintf(" AND fakultas_id = %d", fid)
	}
	config.DB.Raw(sqlAvg).Scan(&avgIPK)

	// Per Prodi (Distribusi)
	type ProdiDistReport struct {
		NamaProdi string  `gorm:"column:nama_prodi" json:"nama_prodi"`
		Value     int64   `gorm:"column:value" json:"value"`
		Active    int64   `gorm:"column:active" json:"active"`
		Leave     int64   `gorm:"column:leave" json:"leave"`
		Graduated int64   `gorm:"column:graduated" json:"graduated"`
		AvgGpa    float64 `gorm:"column:avg_gpa" json:"avgIPK"`
	}
	var perProdi = []ProdiDistReport{}

	sqlProdiDist := `
		SELECT 
			ps.nama || ' (' || ps.jenjang || ')' as nama_prodi,
			COUNT(m.id) as value,
			SUM(CASE WHEN m.status_akun = 'Aktif' THEN 1 ELSE 0 END) as active,
			SUM(CASE WHEN m.status_akun = 'Cuti' THEN 1 ELSE 0 END) as leave,
			SUM(CASE WHEN m.status_akun = 'Lulus' THEN 1 ELSE 0 END) as graduated,
			COALESCE(AVG(m.ip_k), 0) as avg_gpa
		FROM fakultas.program_studi ps
		LEFT JOIN mahasiswa.mahasiswa m ON m.program_studi_id = ps.id AND m.deleted_at IS NULL
		WHERE ps.deleted_at IS NULL `

	if role == "faculty_admin" {
		sqlProdiDist += fmt.Sprintf(" AND ps.fakultas_id = %d ", fid)
	}
	sqlProdiDist += " GROUP BY ps.id, ps.nama, ps.jenjang"

	config.DB.Raw(sqlProdiDist).Scan(&perProdi)

	// Per Angkatan (Trend)
	type AngkatanDistReport struct {
		Angkatan int   `json:"angkatan"`
		Aktif    int64 `json:"aktif"`
		Lulus    int64 `json:"lulus"`
	}
	var perAngkatan = []AngkatanDistReport{}
	qTrend := config.DB.Table("mahasiswa.mahasiswa").
		Select("tahun_masuk as angkatan, " +
			"sum(case when status_akun = 'Aktif' then 1 else 0 end) as aktif, " +
			"sum(case when status_akun = 'Lulus' then 1 else 0 end) as lulus").
		Where("tahun_masuk > 0 AND deleted_at IS NULL").
		Group("tahun_masuk").
		Order("tahun_masuk asc")

	if role == "faculty_admin" {
		qTrend = qTrend.Where("fakultas_id = ?", fid)
	}
	qTrend.Scan(&perAngkatan)

	// Distribusi IPK Real
	type IPKRange struct {
		Range string `json:"range"`
		Count int64  `json:"count"`
	}
	var ipkDist = []IPKRange{}
	sqlIPK := `
		SELECT 
			CASE 
				WHEN ip_k >= 3.5 THEN '3.5 - 4.0'
				WHEN ip_k >= 3.0 THEN '3.0 - 3.49'
				WHEN ip_k >= 2.5 THEN '2.5 - 2.99'
				ELSE '< 2.5'
			END as range,
			COUNT(*) as count
		FROM mahasiswa.mahasiswa 
		WHERE deleted_at IS NULL `

	if role == "faculty_admin" {
		sqlIPK += fmt.Sprintf(" AND fakultas_id = %d", fid)
	}
	sqlIPK += " GROUP BY range ORDER BY range DESC"
	config.DB.Raw(sqlIPK).Scan(&ipkDist)

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

func AmbilNotifikasiAntrean(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var countAspirasi int64
	var countSurat int64
	var countPrestasi int64
	var countProposal int64

	// Flexible status check: Count anything NOT in a final state
	// Final states: 'Selesai', 'Ditolak', 'Arsip', 'Dibatalkan', 'disetujui_univ'

	qAsp := config.DB.Model(&models.Aspirasi{}).Where("LOWER(status) NOT IN ?", []string{"selesai", "ditolak", "arsip", "dibatalkan"})
	qSurat := config.DB.Model(&models.PengajuanSurat{}).Where("LOWER(status) NOT IN ?", []string{"selesai", "ditolak", "arsip", "dibatalkan"})
	qPres := config.DB.Model(&models.Prestasi{}).Where("LOWER(status) NOT IN ?", []string{"selesai", "ditolak", "terverifikasi", "disetujui"})
	qProp := config.DB.Model(&models.Proposal{}).Where("LOWER(status) NOT IN ?", []string{"selesai", "ditolak", "disetujui_univ", "revisi"})

	if role == "faculty_admin" {
		qAsp = qAsp.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.aspirasi.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)

		qSurat = qSurat.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.pengajuan_surat.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)

		qPres = qPres.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.prestasi.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)

		qProp = qProp.Where("fakultas_id = ?", fid)
	}

	qAsp.Count(&countAspirasi)
	qSurat.Count(&countSurat)
	qPres.Count(&countPrestasi)
	qProp.Count(&countProposal)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"aspirasi": countAspirasi,
			"surat":    countSurat,
			"prestasi": countPrestasi,
			"proposal": countProposal,
			"total":    countAspirasi + countSurat + countPrestasi + countProposal,
		},
	})
}

package dashboard

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"sort"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type DeadlineItem struct {
	Tipe     string    `json:"tipe"`
	Nama     string    `json:"nama"`
	Tanggal  time.Time `json:"tanggal"`
	SisaHari int       `json:"sisa_hari"`
	Link     string    `json:"link"`
}

func firstWordOrDefault(s string, fallback string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return fallback
	}
	parts := strings.Fields(s)
	if len(parts) == 0 {
		return fallback
	}
	return parts[0]
}

func GetDashboard(c *fiber.Ctx) error {
	PenggunaID, ok := c.Locals("user_id").(uint)
	if !ok || PenggunaID == 0 {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	// 1. Fetch Student Data
	var student models.Mahasiswa
	if err := config.DB.Preload("ProgramStudi").First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	// 2. Banner / Latest News
	var news models.Berita
	config.DB.Order("tanggal_publish desc").First(&news)

	// 3. PKKMB (Formerly KENCANA) Stats
	var totalPkkmb int64
	var selesaiPkkmb int64
	config.DB.Model(&models.PkkmbKegiatan{}).Count(&totalPkkmb)
	config.DB.Model(&models.PkkmbProgress{}).Where("mahasiswa_id = ? AND status = ?", student.ID, "selesai").Count(&selesaiPkkmb)

	pkkmbStatus := "Belum Dimulai"
	pkkmbPersentase := 0.0
	if selesaiPkkmb > 0 {
		if selesaiPkkmb == totalPkkmb {
			pkkmbStatus = "Selesai ✓"
		} else {
			pkkmbStatus = "Sedang Berlangsung"
		}
	}
	if totalPkkmb > 0 {
		pkkmbPersentase = float64(selesaiPkkmb) / float64(totalPkkmb) * 100
	}

	// 4. Beasiswa Stats
	var countBeasiswaProses int64
	var countBeasiswaMenunggu int64
	config.DB.Model(&models.BeasiswaPendaftaran{}).Where("mahasiswa_id = ? AND status = ?", student.ID, "Proses").Count(&countBeasiswaProses)
	config.DB.Model(&models.BeasiswaPendaftaran{}).Where("mahasiswa_id = ? AND status = ?", student.ID, "Menunggu").Count(&countBeasiswaMenunggu)

	// 5. Student Voice (Aspirasi) Stats
	var countAspirasiAktif int64
	var countAspirasiBelumRespons int64
	config.DB.Model(&models.Aspirasi{}).Where("mahasiswa_id = ? AND status != ?", student.ID, "selesai").Count(&countAspirasiAktif)
	config.DB.Model(&models.Aspirasi{}).Where("mahasiswa_id = ? AND respon = ?", student.ID, "").Count(&countAspirasiBelumRespons)

	// 6. Aggregated Deadlines (Next 14 Days)
	var deadlines []DeadlineItem
	now := time.Now()
	fourteenDaysLater := now.AddDate(0, 0, 14)

	// Beasiswa Deadlines
	var activeBeasiswa []models.Beasiswa
	config.DB.Where("deadline BETWEEN ? AND ?", now, fourteenDaysLater).Find(&activeBeasiswa)
	for _, b := range activeBeasiswa {
		deadlines = append(deadlines, DeadlineItem{
			Tipe:     "beasiswa",
			Nama:     "Deadline " + b.Nama,
			Tanggal:  b.Deadline,
			SisaHari: int(b.Deadline.Sub(now).Hours() / 24),
			Link:     "/student/scholarship",
		})
	}

	// Counseling Sessions
	var myBookings []models.Konseling
	config.DB.Where("mahasiswa_id = ? AND status = ? AND tanggal BETWEEN ? AND ?", student.ID, "Dikonfirmasi", now, fourteenDaysLater).Find(&myBookings)
	for _, bk := range myBookings {
		deadlines = append(deadlines, DeadlineItem{
			Tipe:     "konseling",
			Nama:     "Sesi Konseling: " + bk.Topik,
			Tanggal:  bk.Tanggal,
			SisaHari: int(bk.Tanggal.Sub(now).Hours() / 24),
			Link:     "/student/counseling",
		})
	}

	// Sort deadlines by date
	sort.Slice(deadlines, func(i, j int) bool {
		return deadlines[i].Tanggal.Before(deadlines[j].Tanggal)
	})
	if len(deadlines) > 3 {
		deadlines = deadlines[:3]
	}

	// 7. Recent Activity (Last 5)
	var activities []models.LogAktivitas
	config.DB.Where("mahasiswa_id = ?", student.ID).Order("created_at desc").Limit(5).Find(&activities)

	// 8. Recent Berita
	var recentNews []models.Berita
	config.DB.Order("tanggal_publish desc").Limit(3).Find(&recentNews)

	// 10. Contextual Greeting Logic
	pesan := "Semangat menjalani hari ini! Ada yang bisa kami bantu?"
	link := ""

	// Priority 1: PKKMB
	if selesaiPkkmb < totalPkkmb && totalPkkmb > 0 {
		pesan = "Kamu masih memiliki modul PKKMB yang belum diselesaikan. Yuk lanjutkan! →"
		link = "/student/kencana"
	} else if len(deadlines) > 0 {
		for _, d := range deadlines {
			if d.Tipe == "beasiswa" && d.SisaHari < 7 {
				pesan = "⚠️ " + d.Nama + " akan ditutup dalam " + strings.TrimSpace(strings.Repeat(" ", 1)) + " hari. Segera daftar! →"
				link = "/student/scholarship"
				break
			}
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"mahasiswa": fiber.Map{
				"id":         student.ID,
				"nim":        student.NIM,
				"nama":       student.Nama,
				"nama_depan": firstWordOrDefault(student.Nama, "Mahasiswa"),
				"prodi":      student.ProgramStudi.Nama,
				"semester":   student.SemesterSekarang,
				"foto_url":   student.FotoURL,
				"status":     student.StatusAkun,
			},
			"banner_pinned": fiber.Map{
				"aktif": news.ID != 0,
				"id":    news.ID,
				"pesan": news.Judul,
				"link":  "/student/news",
			},
			"kencana": fiber.Map{
				"total_modul":   totalPkkmb,
				"modul_selesai": selesaiPkkmb,
				"persentase":    pkkmbPersentase,
				"status":        pkkmbStatus,
			},
			"beasiswa": fiber.Map{
				"jumlah_proses":   countBeasiswaProses,
				"jumlah_menunggu": countBeasiswaMenunggu,
			},
			"student_voice": fiber.Map{
				"jumlah_aktif":           countAspirasiAktif,
				"jumlah_belum_direspons": countAspirasiBelumRespons,
			},
			"deadlines":         deadlines,
			"aktivitas_terbaru": activities,
			"pengumuman":        recentNews,
			"pesan_kontekstual": pesan,
			"link_kontekstual":  link,
		},
	})
}

func GetKegiatan(c *fiber.Ctx) error {
	PenggunaID, ok := c.Locals("user_id").(uint)
	if !ok || PenggunaID == 0 {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}
	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	bulan := c.QueryInt("bulan", int(time.Now().Month()))
	tahun := c.QueryInt("tahun", time.Now().Year())

	startOfMonth := time.Date(tahun, time.Month(bulan), 1, 0, 0, 0, 0, time.Local)
	endOfMonth := startOfMonth.AddDate(0, 1, -1).Add(23*time.Hour + 59*time.Minute)

	type Event struct {
		Tanggal  time.Time `json:"tanggal"`
		Judul    string    `json:"judul"`
		Kategori string    `json:"kategori"`
	}
	var events []Event

	// 1. Deadline Beasiswa
	var beasiswas []models.Beasiswa
	config.DB.Where("deadline BETWEEN ? AND ?", startOfMonth, endOfMonth).Find(&beasiswas)
	for _, b := range beasiswas {
		events = append(events, Event{Tanggal: b.Deadline, Judul: "Deadline: " + b.Nama, Kategori: "beasiswa"})
	}

	// 2. Counseling Bookings
	var bookings []models.Konseling
	config.DB.Where("mahasiswa_id = ? AND status = ?", student.ID, "Dikonfirmasi").Find(&bookings)
	for _, b := range bookings {
		if b.Tanggal.After(startOfMonth) && b.Tanggal.Before(endOfMonth) {
			events = append(events, Event{Tanggal: b.Tanggal, Judul: "Konseling: " + b.Topik, Kategori: "konseling"})
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    events,
	})
}

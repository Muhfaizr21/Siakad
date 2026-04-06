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
	Tipe      string    `json:"tipe"`
	Nama      string    `json:"nama"`
	Tanggal   time.Time `json:"tanggal"`
	SisaHari  int       `json:"sisa_hari"`
	Link      string    `json:"link"`
}

func GetDashboard(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	// 1. Fetch Student Data
	var student models.Student
	if err := config.DB.Preload("Major").First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	// 2. Banner Pinned
	var banner models.Pengumuman
	config.DB.Where("is_pinned = ? AND is_aktif = ?", true, true).Order("published_at desc").First(&banner)

	// 3. KENCANA Stats
	var totalKencana int64
	var selesaiKencana int64
	config.DB.Model(&models.KencanaKuis{}).Count(&totalKencana)
	config.DB.Model(&models.KencanaHasilKuis{}).Where("student_id = ? AND lulus = ?", student.ID, true).Count(&selesaiKencana)
	
	kencanaStatus := "Belum Dimulai"
	if selesaiKencana > 0 {
		if selesaiKencana == totalKencana {
			kencanaStatus = "Selesai ✓"
		} else {
			kencanaStatus = "Sedang Berlangsung"
		}
	}

	// 4. Beasiswa Stats
	var countBeasiswaProses int64
	var countBeasiswaMenunggu int64
	config.DB.Model(&models.PengajuanBeasiswa{}).Where("student_id = ? AND status = ?", student.ID, "Proses").Count(&countBeasiswaProses)
	config.DB.Model(&models.PengajuanBeasiswa{}).Where("student_id = ? AND status = ?", student.ID, "Menunggu").Count(&countBeasiswaMenunggu)

	// 5. Student Voice Stats
	var countAspirasiAktif int64
	var countAspirasiBelumRespons int64
	config.DB.Model(&models.TiketAspirasi{}).Where("student_id = ? AND status != ?", student.ID, "Selesai").Count(&countAspirasiAktif)
	config.DB.Model(&models.TiketAspirasi{}).Where("student_id = ? AND balasan_admin IS NULL", student.ID).Count(&countAspirasiBelumRespons)

	// 6. Aggregated Deadlines (Next 14 Days)
	var deadlines []DeadlineItem
	now := time.Now()
	fourteenDaysLater := now.AddDate(0, 0, 14)

	// Beasiswa Deadlines for active offerings
	var activeBeasiswa []models.Beasiswa
	config.DB.Where("deadline BETWEEN ? AND ? AND is_aktif = ?", now, fourteenDaysLater, true).Find(&activeBeasiswa)
	for _, b := range activeBeasiswa {
		deadlines = append(deadlines, DeadlineItem{
			Tipe:     "beasiswa",
			Nama:     "Deadline Beasiswa " + b.Nama,
			Tanggal:  b.Deadline,
			SisaHari: int(b.Deadline.Sub(now).Hours() / 24),
			Link:     "/student/scholarship",
		})
	}

	// Counseling Sessions for the student
	var myBookings []models.BookingKonseling
	config.DB.Preload("JadwalKonseling").Where("student_id = ? AND status = ?", student.ID, "Dikonfirmasi").Find(&myBookings)
	for _, bk := range myBookings {
		if bk.JadwalKonseling.Tanggal.After(now) && bk.JadwalKonseling.Tanggal.Before(fourteenDaysLater) {
			deadlines = append(deadlines, DeadlineItem{
				Tipe:     "konseling",
				Nama:     "Sesi Konseling " + bk.JadwalKonseling.Tipe,
				Tanggal:  bk.JadwalKonseling.Tanggal,
				SisaHari: int(bk.JadwalKonseling.Tanggal.Sub(now).Hours() / 24),
				Link:     "/student/counseling",
			})
		}
	}

	// Campus Events
	var events []models.KegiatanKampus
	config.DB.Where("tanggal_mulai BETWEEN ? AND ? AND is_aktif = ?", now, fourteenDaysLater, true).Find(&events)
	for _, e := range events {
		deadlines = append(deadlines, DeadlineItem{
			Tipe:     e.Kategori,
			Nama:     "Kegiatan " + e.Judul,
			Tanggal:  e.TanggalMulai,
			SisaHari: int(e.TanggalMulai.Sub(now).Hours() / 24),
			Link:     "/student/dashboard", // Default to dashboard for now
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
	var activities []models.AktivitasLog
	config.DB.Where("student_id = ?", student.ID).Order("created_at desc").Limit(5).Find(&activities)

	// 8. Monthly Events
	var monthlyEvents []models.KegiatanKampus
	currentMonth := time.Now().Month()
	currentYear := time.Now().Year()
	startOfMonth := time.Date(currentYear, currentMonth, 1, 0, 0, 0, 0, time.Local)
	endOfMonth := startOfMonth.AddDate(0, 1, -1)
	config.DB.Where("tanggal_mulai BETWEEN ? AND ? AND is_aktif = ?", startOfMonth, endOfMonth, true).Order("tanggal_mulai asc").Limit(4).Find(&monthlyEvents)

	// 9. Recent Announcements
	var recentNews []models.Pengumuman
	config.DB.Where("is_aktif = ?", true).Order("created_at desc").Limit(3).Find(&recentNews)

	// 10. Contextual Greeting Logic
	pesan := "Semangat menjalani hari ini! Ada yang bisa kami bantu?"
	link := ""

	// Priority 1: KENCANA
	if selesaiKencana < totalKencana {
		pesan = "Kamu masih punya " + strings.TrimSpace(strings.Repeat(" ", 1)) + " modul KENCANA yang belum diselesaikan. Yuk lanjutkan! →"
		link = "/student/kencana"
	} else {
		// Priority 2: Beasiswa deadlines < 7 days
		for _, d := range deadlines {
			if d.Tipe == "beasiswa" && d.SisaHari < 7 {
				pesan = "⚠️ " + d.Nama + " akan ditutup dalam " + strings.TrimSpace(strings.Repeat(" ", 1)) + " hari. Segera lengkapi pengajuanmu! →"
				link = "/student/scholarship"
				break
			}
		}
		// Priority 3: Counseling today
		if link == "" {
			for _, bk := range myBookings {
				if bk.JadwalKonseling.Tanggal.Format("2006-01-02") == now.Format("2006-01-02") {
					pesan = "📅 Kamu ada sesi konseling hari ini pukul " + bk.JadwalKonseling.JamMulai + " dengan " + bk.JadwalKonseling.NamaKonselor + "."
					link = "/student/counseling"
					break
				}
			}
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"mahasiswa": fiber.Map{
				"id":       student.ID,
				"nim":      student.NIM,
				"nama":     student.Name,
				"nama_depan": strings.Split(student.Name, " ")[0],
				"prodi":    student.Major.Name,
				"semester": student.CurrentSemester,
				"foto_url": student.PhotoURL,
				"status":   student.Status,
			},
			"banner_pinned": fiber.Map{
				"aktif": banner.ID != 0,
				"id":    banner.ID,
				"pesan": banner.IsiSingkat,
				"link":  "/student/scholarship", // Mock link for seeder
			},
			"kencana": fiber.Map{
				"total_modul":   totalKencana,
				"modul_selesai": selesaiKencana,
				"persentase":    float64(selesaiKencana) / float64(totalKencana) * 100,
				"status":        kencanaStatus,
			},
			"beasiswa": fiber.Map{
				"jumlah_proses":   countBeasiswaProses,
				"jumlah_menunggu": countBeasiswaMenunggu,
			},
			"student_voice": fiber.Map{
				"jumlah_aktif":           countAspirasiAktif,
				"jumlah_belum_direspons": countAspirasiBelumRespons,
			},
			"deadlines":          deadlines,
			"aktivitas_terbaru":  activities,
			"kegiatan_bulan_ini": monthlyEvents,
			"pengumuman":         recentNews,
			"pesan_kontekstual":  pesan,
			"link_kontekstual":   link,
		},
	})
}

func GetKegiatan(c *fiber.Ctx) error {
	studentID := c.Locals("user_id").(uint) // Get from context
	
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

	// 1. Kegiatan Kampus
	var kamps []models.KegiatanKampus
	config.DB.Where("tanggal_mulai BETWEEN ? AND ? AND is_aktif = ?", startOfMonth, endOfMonth, true).Find(&kamps)
	for _, k := range kamps {
		events = append(events, Event{Tanggal: k.TanggalMulai, Judul: k.Judul, Kategori: k.Kategori})
	}

	// 2. Deadline Beasiswa
	var beasiswas []models.Beasiswa
	config.DB.Where("deadline BETWEEN ? AND ? AND is_aktif = ?", startOfMonth, endOfMonth, true).Find(&beasiswas)
	for _, b := range beasiswas {
		events = append(events, Event{Tanggal: b.Deadline, Judul: "Deadline: " + b.Nama, Kategori: "beasiswa"})
	}

	// 3. Counseling Bookings
	var bookings []models.BookingKonseling
	config.DB.Preload("JadwalKonseling").Where("student_id = ? AND status = ?", studentID, "Dikonfirmasi").Find(&bookings)
	for _, b := range bookings {
		if b.JadwalKonseling.Tanggal.After(startOfMonth) && b.JadwalKonseling.Tanggal.Before(endOfMonth) {
			events = append(events, Event{Tanggal: b.JadwalKonseling.Tanggal, Judul: "Sesi Konseling " + b.JadwalKonseling.Tipe, Kategori: "konseling"})
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    events,
	})
}

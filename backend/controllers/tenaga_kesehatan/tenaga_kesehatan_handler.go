package tenaga_kesehatan

import (
	"fmt"
	"strings"
	"time"

	"siakad-backend/config"
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func currentTenagaKesehatan(c *fiber.Ctx) (models.TenagaKesehatan, error) {
	userID, ok := c.Locals("user_id").(uint)
	if !ok || userID == 0 {
		return models.TenagaKesehatan{}, fiber.NewError(fiber.StatusUnauthorized, "User tidak valid")
	}

	var tk models.TenagaKesehatan
	if err := config.DB.Preload("User").Where("user_id = ?", userID).First(&tk).Error; err != nil {
		var user models.User
		if err := config.DB.First(&user, userID).Error; err == nil {
			name := strings.Split(user.Email, "@")[0]
			name = strings.Title(strings.ReplaceAll(name, ".", " "))
			tk = models.TenagaKesehatan{
				UserID:       userID,
				Nama:         name,
				Email:        user.Email,
				NoHP:         "-",
				Spesialisasi: "Pemeriksaan Umum",
				Lokasi:       "Klinik Kampus BKU",
				IsAktif:      true,
			}
			if err := config.DB.Create(&tk).Error; err != nil {
				return models.TenagaKesehatan{}, fiber.NewError(fiber.StatusInternalServerError, "Gagal menginisialisasi profil")
			}
		} else {
			return models.TenagaKesehatan{}, fiber.NewError(fiber.StatusNotFound, "Profil Tenaga Kesehatan belum tersedia")
		}
	}

	return tk, nil
}

func jsonOK(c *fiber.Ctx, data any) error {
	return c.JSON(fiber.Map{"status": "success", "data": data})
}

func initials(name string) string {
	parts := strings.Fields(name)
	if len(parts) == 0 {
		return "-"
	}
	result := ""
	for i, part := range parts {
		if i >= 3 {
			break
		}
		result += strings.ToUpper(string([]rune(part)[0]))
	}
	return result
}

func GetMe(c *fiber.Ctx) error {
	tk, err := currentTenagaKesehatan(c)
	if err != nil {
		return err
	}
	return jsonOK(c, tk)
}

func UpdateProfile(c *fiber.Ctx) error {
	tk, err := currentTenagaKesehatan(c)
	if err != nil {
		return err
	}

	var body struct {
		Nama         string `json:"nama"`
		Email        string `json:"email"`
		NoHP         string `json:"no_hp"`
		Spesialisasi string `json:"spesialisasi"`
		Lokasi       string `json:"lokasi"`
		IsAktif      *bool  `json:"is_aktif"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload tidak valid")
	}

	updates := map[string]any{}
	if body.Nama != "" {
		updates["nama"] = strings.TrimSpace(body.Nama)
	}
	if body.Email != "" {
		updates["email"] = strings.TrimSpace(body.Email)
	}
	if body.NoHP != "" {
		updates["no_hp"] = strings.TrimSpace(body.NoHP)
	}
	if body.Spesialisasi != "" {
		updates["spesialisasi"] = strings.TrimSpace(body.Spesialisasi)
	}
	if body.Lokasi != "" {
		updates["lokasi"] = strings.TrimSpace(body.Lokasi)
	}
	if body.IsAktif != nil {
		updates["is_aktif"] = *body.IsAktif
	}

	if len(updates) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "Tidak ada data yang diperbarui")
	}

	if err := config.DB.Model(&tk).Updates(updates).Error; err != nil {
		return err
	}

	_ = config.DB.Preload("User").First(&tk, tk.ID).Error
	return jsonOK(c, tk)
}

func ChangePassword(c *fiber.Ctx) error {
	tk, err := currentTenagaKesehatan(c)
	if err != nil {
		return err
	}

	var body struct {
		OldPassword     string `json:"old_password"`
		NewPassword     string `json:"new_password"`
		ConfirmPassword string `json:"confirm_password"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload tidak valid")
	}

	body.OldPassword = strings.TrimSpace(body.OldPassword)
	body.NewPassword = strings.TrimSpace(body.NewPassword)
	body.ConfirmPassword = strings.TrimSpace(body.ConfirmPassword)
	if body.OldPassword == "" || body.NewPassword == "" || body.ConfirmPassword == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Semua field password wajib diisi")
	}
	if len(body.NewPassword) < 8 {
		return fiber.NewError(fiber.StatusBadRequest, "Password baru minimal 8 karakter")
	}
	if body.NewPassword != body.ConfirmPassword {
		return fiber.NewError(fiber.StatusBadRequest, "Konfirmasi password tidak sama")
	}

	var user models.User
	if err := config.DB.First(&user, tk.UserID).Error; err != nil {
		return err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.OldPassword)); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Password saat ini salah")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(body.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	if err := config.DB.Exec("UPDATE users SET password = ? WHERE id = ?", string(hash), user.ID).Error; err != nil {
		return err
	}
	return jsonOK(c, fiber.Map{"updated": true, "message": "Password berhasil diubah"})
}

func GetDashboard(c *fiber.Ctx) error {
	tk, err := currentTenagaKesehatan(c)
	if err != nil {
		return err
	}

	today := time.Now().Truncate(24 * time.Hour)
	tomorrow := today.Add(24 * time.Hour)

	var totalDiperiksa int64
	config.DB.Model(&models.Kesehatan{}).
		Where("tanggal >= ? AND tanggal < ?", today, tomorrow).
		Count(&totalDiperiksa)

	var belumScreening int64
	config.DB.Model(&models.Mahasiswa{}).
		Where("id NOT IN (SELECT DISTINCT mahasiswa_id FROM mahasiswa.kesehatan)").
		Count(&belumScreening)

	var perluPerhatian int64
	config.DB.Model(&models.Kesehatan{}).
		Where("status_kesehatan IN ('kritis', 'pantauan', 'tindak_lanjut') OR hasil = 'Perlu Perhatian' OR hasil = 'Tidak Layak'").
		Count(&perluPerhatian)

	var bookingHariIni int64
	config.DB.Model(&models.BookingKesehatan{}).
		Joins("JOIN public.jadwal_kesehatan jk ON jk.id = booking_kesehatan.jadwal_id").
		Where("jk.tenaga_kes_id = ? AND jk.tanggal >= ? AND jk.tanggal < ?", tk.ID, today, tomorrow).
		Count(&bookingHariIni)

	// Fetch Booking Hari Ini (Limit 10)
	var bookings []models.BookingKesehatan
	config.DB.Preload("Jadwal").Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").
		Joins("JOIN public.jadwal_kesehatan jk ON jk.id = booking_kesehatan.jadwal_id").
		Where("jk.tenaga_kes_id = ? AND jk.tanggal >= ? AND jk.tanggal < ?", tk.ID, today, tomorrow).
		Order("jk.jam_mulai asc").
		Limit(10).Find(&bookings)

	bookingItems := make([]fiber.Map, 0, len(bookings))
	for _, b := range bookings {
		bookingItems = append(bookingItems, bookingResponseFull(b))
	}

	// Fetch Alert Mahasiswa Perlu Perhatian
	var criticalHealth []models.Kesehatan
	config.DB.Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").
		Where("status_kesehatan IN ('kritis', 'pantauan', 'tindak_lanjut') OR hasil = 'Tidak Layak'").
		Order("tanggal desc").
		Limit(10).Find(&criticalHealth)

	criticalItems := make([]fiber.Map, 0, len(criticalHealth))
	for _, h := range criticalHealth {
		criticalItems = append(criticalItems, fiber.Map{
			"id":               h.ID,
			"mahasiswa_id":     h.MahasiswaID,
			"nim":              h.Mahasiswa.NIM,
			"nama":             h.Mahasiswa.Nama,
			"event":            h.JenisPemeriksaan,
			"status":           h.Hasil,
			"status_kesehatan": h.StatusKesehatan,
			"tanggal":          h.Tanggal.Format("02 Jan 2006"),
		})
	}

	return jsonOK(c, fiber.Map{
		"total_diperiksa_hari_ini": totalDiperiksa,
		"belum_screening":          belumScreening,
		"perlu_perhatian":          perluPerhatian,
		"booking_hari_ini_count":   bookingHariIni,
		"bookings":                 bookingItems,
		"alerts":                   criticalItems,
	})
}

// ========================
// JADWAL WORKER CRUD
// ========================

func GetSchedules(c *fiber.Ctx) error {
	tk, err := currentTenagaKesehatan(c)
	if err != nil {
		return err
	}

	var slots []models.JadwalKesehatan
	if err := config.DB.Where("tenaga_kes_id = ?", tk.ID).Order("tanggal desc, jam_mulai asc").Find(&slots).Error; err != nil {
		return err
	}

	return jsonOK(c, slots)
}

func CreateSchedule(c *fiber.Ctx) error {
	tk, err := currentTenagaKesehatan(c)
	if err != nil {
		return err
	}

	var body struct {
		Tanggal     string `json:"tanggal"`
		JamMulai    string `json:"jam_mulai"`
		JamSelesai  string `json:"jam_selesai"`
		Kuota       int    `json:"kuota"`
		Lokasi      string `json:"lokasi"`
		TipeLayanan string `json:"tipe_layanan"`
		EventID     *uint  `json:"event_id"`
		Catatan     string `json:"catatan"`
		IsRepeat    bool   `json:"is_repeat"`
		RepeatDays  string `json:"repeat_days"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload tidak valid")
	}

	parsedDate, err := time.Parse("2006-01-02", body.Tanggal)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Format tanggal harus YYYY-MM-DD")
	}

	kuota := body.Kuota
	if kuota <= 0 {
		kuota = 1
	}

	schedule := models.JadwalKesehatan{
		TenagaKesID: tk.ID,
		Tanggal:     parsedDate,
		JamMulai:    body.JamMulai,
		JamSelesai:  body.JamSelesai,
		Kuota:       kuota,
		Lokasi:      body.Lokasi,
		TipeLayanan: body.TipeLayanan,
		EventID:     body.EventID,
		Catatan:     body.Catatan,
		IsRepeat:    body.IsRepeat,
		RepeatDays:  body.RepeatDays,
	}

	if err := config.DB.Create(&schedule).Error; err != nil {
		return err
	}

	return jsonOK(c, schedule)
}

func UpdateSchedule(c *fiber.Ctx) error {
	tk, err := currentTenagaKesehatan(c)
	if err != nil {
		return err
	}

	id := c.Params("id")
	var schedule models.JadwalKesehatan
	if err := config.DB.Where("id = ? AND tenaga_kes_id = ?", id, tk.ID).First(&schedule).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Jadwal tidak ditemukan")
	}

	var body struct {
		Tanggal     string `json:"tanggal"`
		JamMulai    string `json:"jam_mulai"`
		JamSelesai  string `json:"jam_selesai"`
		Kuota       int    `json:"kuota"`
		Lokasi      string `json:"lokasi"`
		TipeLayanan string `json:"tipe_layanan"`
		EventID     *uint  `json:"event_id"`
		Catatan     string `json:"catatan"`
		IsRepeat    bool   `json:"is_repeat"`
		RepeatDays  string `json:"repeat_days"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload tidak valid")
	}

	updates := map[string]any{}
	if body.Tanggal != "" {
		if t, err := time.Parse("2006-01-02", body.Tanggal); err == nil {
			updates["tanggal"] = t
		}
	}
	if body.JamMulai != "" {
		updates["jam_mulai"] = body.JamMulai
	}
	if body.JamSelesai != "" {
		updates["jam_selesai"] = body.JamSelesai
	}
	if body.Kuota > 0 {
		updates["kuota"] = body.Kuota
	}
	if body.Lokasi != "" {
		updates["lokasi"] = body.Lokasi
	}
	if body.TipeLayanan != "" {
		updates["tipe_layanan"] = body.TipeLayanan
	}
	updates["event_id"] = body.EventID
	updates["catatan"] = body.Catatan
	updates["is_repeat"] = body.IsRepeat
	updates["repeat_days"] = body.RepeatDays

	if err := config.DB.Model(&schedule).Updates(updates).Error; err != nil {
		return err
	}

	config.DB.First(&schedule, schedule.ID)
	return jsonOK(c, schedule)
}

func DeleteSchedule(c *fiber.Ctx) error {
	tk, err := currentTenagaKesehatan(c)
	if err != nil {
		return err
	}

	id := c.Params("id")
	var schedule models.JadwalKesehatan
	if err := config.DB.Where("id = ? AND tenaga_kes_id = ?", id, tk.ID).First(&schedule).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Jadwal tidak ditemukan")
	}

	var bookingCount int64
	config.DB.Model(&models.BookingKesehatan{}).Where("jadwal_id = ? AND status != 'Ditolak' AND status != 'Dibatalkan'", schedule.ID).Count(&bookingCount)
	if bookingCount > 0 {
		return fiber.NewError(fiber.StatusBadRequest, "Jadwal tidak bisa dihapus karena sudah memiliki booking aktif.")
	}

	if err := config.DB.Delete(&schedule).Error; err != nil {
		return err
	}

	return jsonOK(c, fiber.Map{"deleted": true})
}

// ========================
// BOOKINGS MANAGEMENT
// ========================

func GetBookings(c *fiber.Ctx) error {
	tk, err := currentTenagaKesehatan(c)
	if err != nil {
		return err
	}

	// Get all jadwal IDs for this TK first
	var jadwalIDs []uint
	config.DB.Model(&models.JadwalKesehatan{}).Where("tenaga_kes_id = ?", tk.ID).Pluck("id", &jadwalIDs)

	if len(jadwalIDs) == 0 {
		return jsonOK(c, []fiber.Map{})
	}

	var bookings []models.BookingKesehatan
	if err := config.DB.Preload("Jadwal").
		Preload("Mahasiswa.Fakultas").
		Preload("Mahasiswa.ProgramStudi").
		Where("jadwal_id IN ?", jadwalIDs).
		Order("created_at desc").
		Find(&bookings).Error; err != nil {
		return err
	}

	items := make([]fiber.Map, 0, len(bookings))
	for _, b := range bookings {
		items = append(items, bookingResponseFull(b))
	}

	return jsonOK(c, items)
}

func bookingResponseFull(b models.BookingKesehatan) fiber.Map {
	student := b.Mahasiswa
	prodiName := ""
	fakName := ""
	if student.ProgramStudi.Nama != "" {
		prodiName = student.ProgramStudi.Nama
	}
	if student.Fakultas.Nama != "" {
		fakName = student.Fakultas.Nama
	}
	return fiber.Map{
		"id":           b.ID,
		"mahasiswa_id": b.MahasiswaID,
		"name":         student.Nama,
		"nim":          student.NIM,
		"email":        student.EmailPersonal,
		"phone":        student.NoHP,
		"prodi":        prodiName,
		"faculty":      fakName,
		"semester":     student.SemesterSekarang,
		"jadwal": fiber.Map{
			"id":           b.Jadwal.ID,
			"tanggal":      b.Jadwal.Tanggal,
			"jam_mulai":    b.Jadwal.JamMulai,
			"jam_selesai":  b.Jadwal.JamSelesai,
			"lokasi":       b.Jadwal.Lokasi,
			"tipe_layanan": b.Jadwal.TipeLayanan,
		},
		"date":         b.Jadwal.Tanggal.Format("02 Jan 2006"),
		"raw_date":     b.Jadwal.Tanggal.Format("2006-01-02"),
		"time":         strings.TrimSpace(b.Jadwal.JamMulai + " - " + b.Jadwal.JamSelesai),
		"tipe_layanan": b.Jadwal.TipeLayanan,
		"note":         b.Keluhan,
		"status":       b.Status,
		"created_at":   b.CreatedAt,
	}
}

func GetBookingDetail(c *fiber.Ctx) error {
	tk, err := currentTenagaKesehatan(c)
	if err != nil {
		return err
	}

	var booking models.BookingKesehatan
	if err := config.DB.Preload("Jadwal").Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").
		Joins("JOIN public.jadwal_kesehatan jk ON jk.id = booking_kesehatan.jadwal_id").
		Where("booking_kesehatan.id = ? AND jk.tenaga_kes_id = ?", c.Params("id"), tk.ID).
		First(&booking).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Booking tidak ditemukan")
	}

	return jsonOK(c, bookingResponseFull(booking))
}

func UpdateBookingStatus(c *fiber.Ctx) error {
	tk, err := currentTenagaKesehatan(c)
	if err != nil {
		return err
	}

	var body struct {
		Status          string `json:"status"`
		AlasanPenolakan string `json:"alasan_penolakan"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload tidak valid")
	}

	allowed := map[string]bool{"Menunggu Konfirmasi": true, "Dikonfirmasi": true, "Ditolak": true, "Selesai": true}
	if !allowed[body.Status] {
		return fiber.NewError(fiber.StatusBadRequest, "Status booking tidak valid")
	}

	var booking models.BookingKesehatan
	if err := config.DB.Preload("Mahasiswa").Preload("Jadwal").
		Joins("JOIN public.jadwal_kesehatan jk ON jk.id = booking_kesehatan.jadwal_id").
		Where("booking_kesehatan.id = ? AND jk.tenaga_kes_id = ?", c.Params("id"), tk.ID).
		First(&booking).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Booking tidak ditemukan")
	}

	updates := map[string]any{
		"status":           body.Status,
		"alasan_penolakan": body.AlasanPenolakan,
	}

	if err := config.DB.Model(&booking).Updates(updates).Error; err != nil {
		return err
	}

	go func() {
		var notifTitle, notifContent string
		switch body.Status {
		case "Dikonfirmasi":
			notifTitle = "Booking Layanan Kesehatan Dikonfirmasi ✅"
			notifContent = fmt.Sprintf(
				"Pemesanan jadwal kesehatan Anda pada tanggal %s pukul %s (%s) telah disetujui oleh %s.",
				booking.Jadwal.Tanggal.Format("02 Jan 2006"),
				booking.Jadwal.JamMulai,
				booking.Jadwal.TipeLayanan,
				tk.Nama,
			)
		case "Ditolak":
			notifTitle = "Booking Layanan Kesehatan Ditolak ❌"
			notifContent = fmt.Sprintf(
				"Maaf, pemesanan jadwal kesehatan Anda pada tanggal %s pukul %s ditolak.",
				booking.Jadwal.Tanggal.Format("02 Jan 2006"),
				booking.Jadwal.JamMulai,
			)
			if body.AlasanPenolakan != "" {
				notifContent += "\nAlasan: " + body.AlasanPenolakan
			}
		case "Selesai":
			notifTitle = "Pemeriksaan Kesehatan Selesai 🏥"
			notifContent = fmt.Sprintf(
				"Sesi konsultasi/pemeriksaan kesehatan Anda dengan %s pada tanggal %s telah selesai.",
				tk.Nama,
				booking.Jadwal.Tanggal.Format("02 Jan 2006"),
			)
		}

		if notifTitle != "" {
			_ = notifikasi.Kirim(config.DB, notifikasi.KirimParams{
				MahasiswaID: booking.MahasiswaID,
				Type:        "info",
				Title:       notifTitle,
				Content:     notifContent,
			})
		}
	}()

	return jsonOK(c, fiber.Map{"id": booking.ID, "status": body.Status})
}

// ========================
// REKAM MEDIS & SCREENING (Tahap 3 & 5)
// ========================

func mapMahasiswaToFrontend(student models.Mahasiswa, latestAlergi string) fiber.Map {
	prodiName := ""
	prodiID := uint(0)
	prodiKode := ""
	if student.ProgramStudi.ID != 0 {
		prodiName = student.ProgramStudi.Nama
		prodiID = student.ProgramStudi.ID
		prodiKode = student.ProgramStudi.Kode
	}

	fakName := ""
	fakID := uint(0)
	fakKode := ""
	if student.Fakultas.ID != 0 {
		fakName = student.Fakultas.Nama
		fakID = student.Fakultas.ID
		fakKode = student.Fakultas.Kode
	}

	prodiMap := fiber.Map{
		"id":           prodiID,
		"nama":         prodiName,
		"Nama":         prodiName,
		"kode":         prodiKode,
		"jenjang":      student.ProgramStudi.Jenjang,
		"akreditasi":   student.ProgramStudi.Akreditasi,
		"kepala_prodi": student.ProgramStudi.KepalaProdi,
	}

	fakMap := fiber.Map{
		"id":    fakID,
		"nama":  fakName,
		"Nama":  fakName,
		"kode":  fakKode,
		"dekan": student.Fakultas.Dekan,
	}

	return fiber.Map{
		"id":                student.ID,
		"nama":              student.Nama,
		"Nama":              student.Nama,
		"nim":               student.NIM,
		"NIM":               student.NIM,
		"jenis_kelamin":     student.JenisKelamin,
		"JenisKelamin":      student.JenisKelamin,
		"ProgramStudi":      prodiMap,
		"program_studi":     prodiMap,
		"Fakultas":          fakMap,
		"fakultas":          fakMap,
		"no_hp":             student.NoHP,
		"NoHP":              student.NoHP,
		"email_personal":    student.EmailPersonal,
		"EmailPersonal":    student.EmailPersonal,
		"email_kampus":      student.EmailKampus,
		"EmailKampus":      student.EmailKampus,
		"semester_sekarang": student.SemesterSekarang,
		"SemesterSekarang":  student.SemesterSekarang,
		"golongan_darah":    student.GolonganDarah,
		"GolonganDarah":    student.GolonganDarah,
		"alergi_obat":       latestAlergi,
		"AlergiObat":        latestAlergi,
	}
}

func GetPatients(c *fiber.Ctx) error {
	var students []models.Mahasiswa
	if err := config.DB.Preload("Fakultas").Preload("ProgramStudi").Limit(50).Find(&students).Error; err != nil {
		return err
	}

	items := make([]fiber.Map, 0, len(students))
	for _, s := range students {
		items = append(items, mapMahasiswaToFrontend(s, ""))
	}

	return jsonOK(c, items)
}

func GetMedicalRecord(c *fiber.Ctx) error {
	studentID := c.Params("id")
	var student models.Mahasiswa
	if err := config.DB.Preload("Fakultas").Preload("ProgramStudi").First(&student, studentID).Error; err != nil {
		return err
	}

	var records []models.Kesehatan
	config.DB.Where("mahasiswa_id = ?", student.ID).Order("tanggal desc").Find(&records)

	latestAlergi := ""
	if len(records) > 0 {
		latestAlergi = records[0].AlergiObat
	}

	return jsonOK(c, fiber.Map{
		"patient": mapMahasiswaToFrontend(student, latestAlergi),
		"records": records,
	})
}

func CreateScreening(c *fiber.Ctx) error {
	tk, err := currentTenagaKesehatan(c)
	if err != nil {
		return err
	}

	studentID := c.Params("id")
	var student models.Mahasiswa
	if err := config.DB.Preload("Fakultas").First(&student, studentID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Mahasiswa tidak ditemukan")
	}

	var body struct {
		Tanggal           string  `json:"tanggal"`
		JenisPemeriksaan  string  `json:"jenis_pemeriksaan"`
		TinggiBadan       float64 `json:"tinggi_badan"`
		BeratBadan        float64 `json:"berat_badan"`
		Sistole           int     `json:"sistole"`
		Diastole          int     `json:"diastole"`
		GulaDarah         int     `json:"gula_darah"`
		ButaWarna         string  `json:"buta_warna"`
		RiwayatPenyakit   string  `json:"riwayat_penyakit"`
		GolonganDarah     string  `json:"golongan_darah"`
		SuhuTubuh         float64 `json:"suhu_tubuh"`
		DenyutNadi        int     `json:"denyut_nadi"`
		SpO2              int     `json:"spo2"`
		SkalaNyeri        int     `json:"skala_nyeri"`
		AlergiObat        string  `json:"alergi_obat"`
		KondisiPsikologis string  `json:"kondisi_psikologis"`
		KonsumsiObat      string  `json:"konsumsi_obat"`
		TindakanDiberikan string  `json:"tindakan_diberikan"`
		ObatDiberikan     string  `json:"obat_diberikan"`
		Catatan           string  `json:"catatan"`
		Hasil             string  `json:"hasil"` // Layak Kegiatan / Perlu Perhatian / Tidak Layak
		Rekomendasi       string  `json:"rekomendasi"`
		EventID           *uint   `json:"event_id"`
		BookingID         *uint   `json:"booking_id"`

		// Eskalasi flags
		EskalasiPsikolog bool `json:"eskalasi_psikolog"`
		EskalasiFakultas bool `json:"eskalasi_fakultas"`
		PsikologID       uint `json:"psikolog_id"` // chosen psychologist if any
	}

	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload tidak valid")
	}

	// 1. Parse Tanggal
	parsedDate := time.Now()
	if body.Tanggal != "" {
		if t, err := time.Parse("2006-01-02", body.Tanggal); err == nil {
			parsedDate = t
		}
	}

	// 2. Calculate BMI
	heightMeter := body.TinggiBadan / 100
	imt := 0.0
	if heightMeter > 0 {
		imt = body.BeratBadan / (heightMeter * heightMeter)
	}

	// 3. Auto Logic
	statusKesehatan := "stabil"
	if body.Sistole >= 140 || body.Diastole >= 90 || imt >= 30 || body.SuhuTubuh > 38.0 || body.SpO2 < 92 {
		statusKesehatan = "kritis"
	} else if body.SuhuTubuh > 37.5 || body.SpO2 < 95 || imt < 18.5 || imt >= 25 {
		statusKesehatan = "pantauan"
	} else {
		statusKesehatan = "prima"
	}

	hasilText := body.Hasil
	if body.SuhuTubuh > 38.0 || body.SpO2 < 92 {
		hasilText = "Tidak Layak"
	} else if hasilText == "" {
		hasilText = "Layak Kegiatan"
	}

	// Create Kesehatan record
	record := models.Kesehatan{
		MahasiswaID:       student.ID,
		Tanggal:           parsedDate,
		JenisPemeriksaan:  body.JenisPemeriksaan,
		Hasil:             hasilText,
		Catatan:           body.Catatan,
		TinggiBadan:       body.TinggiBadan,
		BeratBadan:        body.BeratBadan,
		Sistole:           body.Sistole,
		Diastole:          body.Diastole,
		GulaDarah:         body.GulaDarah,
		ButaWarna:         body.ButaWarna,
		RiwayatPenyakit:   body.RiwayatPenyakit,
		GolonganDarah:     body.GolonganDarah,
		StatusKesehatan:   statusKesehatan,
		SuhuTubuh:         body.SuhuTubuh,
		DenyutNadi:        body.DenyutNadi,
		SpO2:              body.SpO2,
		SkalaNyeri:        body.SkalaNyeri,
		AlergiObat:        body.AlergiObat,
		KondisiPsikologis: body.KondisiPsikologis,
		KonsumsiObat:      body.KonsumsiObat,
		TindakanDiberikan: body.TindakanDiberikan,
		ObatDiberikan:     body.ObatDiberikan,
		Rekomendasi:       body.Rekomendasi,
		TenagaKesID:       &tk.ID,
		EventID:           body.EventID,
		BookingID:         body.BookingID,
	}

	if err := config.DB.Create(&record).Error; err != nil {
		return err
	}

	// Update Mahasiswa's Golongan Darah if provided
	if body.GolonganDarah != "" {
		config.DB.Model(&student).Update("golongan_darah", body.GolonganDarah)
	}

	// If this screening was started from a booking, mark the booking as Selesai
	if body.BookingID != nil {
		config.DB.Model(&models.BookingKesehatan{}).Where("id = ?", *body.BookingID).Update("status", "Selesai")
	}

	// Send notification to Mahasiswa
	go func() {
		notifTitle := "Hasil Pemeriksaan Kesehatan Baru 🏥"
		notifContent := fmt.Sprintf("Hasil pemeriksaan kesehatan Anda pada %s telah diinput oleh Tenaga Kesehatan (%s). Hasil akhir: %s.", parsedDate.Format("02 Jan 2006"), tk.Nama, hasilText)
		
		if hasilText == "Tidak Layak" {
			notifTitle = "Rekomendasi Istirahat: Hasil Kesehatan Tidak Layak ⚠️"
			notifContent = fmt.Sprintf("Berdasarkan pemeriksaan oleh %s pada %s, Anda direkomendasikan untuk beristirahat. Rekomendasi: %s", tk.Nama, parsedDate.Format("02 Jan 2006"), body.Rekomendasi)
		}

		_ = notifikasi.Kirim(config.DB, notifikasi.KirimParams{
			MahasiswaID: student.ID,
			Type:        "info",
			Title:       notifTitle,
			Content:     notifContent,
		})
	}()

	// 4. Eskalasi Logic
	// Eskalasi ke Psikolog
	if body.EskalasiPsikolog || body.KondisiPsikologis == "Perlu Rujukan Psikolog" {
		go func() {
			if body.PsikologID != 0 {
				var psi models.Psikolog
				if err := config.DB.First(&psi, body.PsikologID).Error; err == nil {
					_ = notifikasi.Kirim(config.DB, notifikasi.KirimParams{
						UserID:  psi.UserID,
						Type:    "warning",
						Title:   "Rujukan Pasien Baru (Eskalasi Medis) 🩺",
						Content: fmt.Sprintf("Tenaga Kesehatan %s merujuk mahasiswa %s (%s) untuk sesi konseling psikologi. Catatan: %s", tk.Nama, student.Nama, student.NIM, body.Catatan),
					})
				}
			} else {
				var psychologists []models.Psikolog
				config.DB.Where("is_aktif = ?", true).Find(&psychologists)
				for _, psi := range psychologists {
					_ = notifikasi.Kirim(config.DB, notifikasi.KirimParams{
						UserID:  psi.UserID,
						Type:    "warning",
						Title:   "Rujukan Pasien Baru (Eskalasi Medis) 🩺",
						Content: fmt.Sprintf("Tenaga Kesehatan %s merujuk mahasiswa %s (%s) untuk sesi konseling psikologi. Catatan: %s", tk.Nama, student.Nama, student.NIM, body.Catatan),
					})
				}
			}

			_ = notifikasi.Kirim(config.DB, notifikasi.KirimParams{
				MahasiswaID: student.ID,
				Type:        "info",
				Title:       "Rekomendasi Konseling Psikologi 🧑‍⚕️",
				Content:     fmt.Sprintf("Tenaga Kesehatan %s merekomendasikan Anda untuk melakukan sesi konseling dengan Psikolog. Silakan buat janji di menu Konseling.", tk.Nama),
			})
		}()
	}

	// Eskalasi ke Admin Fakultas
	if body.EskalasiFakultas || hasilText == "Tidak Layak" {
		go func() {
			var adminUsers []models.User
			config.DB.Where("role = ? AND fakultas_id = ?", "faculty_admin", student.FakultasID).Find(&adminUsers)
			for _, admin := range adminUsers {
				_ = notifikasi.Kirim(config.DB, notifikasi.KirimParams{
					UserID:  admin.ID,
					Type:    "error",
					Title:   "Laporan Kondisi Kritis Mahasiswa 🚨",
					Content: fmt.Sprintf("Tenaga Kesehatan %s melaporkan kondisi kesehatan kritis/tidak layak untuk mahasiswa %s (%s) dari Fakultas %s. Catatan: %s", tk.Nama, student.Nama, student.NIM, student.Fakultas.Nama, body.Catatan),
				})
			}
		}()
	}

	return jsonOK(c, record)
}

func LookupStudent(c *fiber.Ctx) error {
	query := c.Query("query")
	var students []models.Mahasiswa
	config.DB.Preload("Fakultas").Preload("ProgramStudi").
		Where("nim LIKE ? OR nama LIKE ?", "%"+query+"%", "%"+query+"%").
		Limit(10).Find(&students)

	items := make([]fiber.Map, 0, len(students))
	for _, s := range students {
		items = append(items, mapMahasiswaToFrontend(s, ""))
	}

	return jsonOK(c, items)
}

// ========================
// REPORTS & EXPORT
// ========================

func ExportExcel(c *fiber.Ctx) error {
	return jsonOK(c, fiber.Map{"message": "Export Excel successfully stubbed"})
}

func ExportPDF(c *fiber.Ctx) error {
	return jsonOK(c, fiber.Map{"message": "Export PDF successfully stubbed"})
}

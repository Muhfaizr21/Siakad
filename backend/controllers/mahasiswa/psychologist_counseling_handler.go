package mahasiswa

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

func studentWithRelations(c *fiber.Ctx) (*models.Mahasiswa, error) {
	userID, err := getUserID(c)
	if err != nil {
		return nil, err
	}

	var student models.Mahasiswa
	if err := config.DB.Preload("Fakultas").Preload("ProgramStudi").Where("pengguna_id = ?", userID).First(&student).Error; err != nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Profil mahasiswa tidak ditemukan")
	}
	return &student, nil
}

func studentProfileResponse(student *models.Mahasiswa) fiber.Map {
	return fiber.Map{
		"id":               student.ID,
		"user_id":          student.PenggunaID,
		"nim":              student.NIM,
		"name":             student.Nama,
		"email":            student.EmailKampus,
		"phone":            student.NoHP,
		"faculty_id":       student.FakultasID,
		"faculty":          student.Fakultas.Nama,
		"program_studi_id": student.ProgramStudiID,
		"program_studi":    student.ProgramStudi.Nama,
		"status":           student.StatusAkun,
		"tahun_masuk":      student.TahunMasuk,
	}
}

func psychologistProfileResponse(psikolog models.Psikolog) fiber.Map {
	return fiber.Map{
		"id":             psikolog.ID,
		"user_id":        psikolog.UserID,
		"name":           psikolog.Nama,
		"email":          psikolog.Email,
		"phone":          psikolog.NoHP,
		"specialization": psikolog.Spesialisasi,
		"bio":            psikolog.Bio,
		"photo_url":      psikolog.FotoURL,
		"location":       psikolog.Lokasi,
		"languages":      splitCSV(psikolog.Bahasa),
		"fee":            psikolog.Tarif,
		"is_active":      psikolog.IsAktif,
	}
}

func psychologistBookingResponse(booking models.PsikologBooking) fiber.Map {
	return fiber.Map{
		"id":              booking.ID,
		"psychologist":    psychologistProfileResponse(booking.Psikolog),
		"psychologist_id": booking.PsikologID,
		"student_id":      booking.MahasiswaID,
		"date":            booking.Tanggal.Format("2006-01-02"),
		"display_date":    booking.Tanggal.Format("02 Jan 2006"),
		"start":           booking.JamMulai,
		"end":             booking.JamSelesai,
		"topic":           booking.Topik,
		"complaint":       booking.Keluhan,
		"status":          booking.Status,
		"admin_note":      booking.CatatanAdmin,
	}
}

func jsonSuccess(c *fiber.Ctx, data any) error {
	return c.JSON(fiber.Map{"success": true, "data": data})
}

// GetStudentSummary returns compact student data that can be consumed by web or mobile dashboards.
func GetStudentSummary(c *fiber.Ctx) error {
	student, err := studentWithRelations(c)
	if err != nil {
		return err
	}

	var achievements int64
	config.DB.Model(&models.Prestasi{}).Where("mahasiswa_id = ?", student.ID).Count(&achievements)
	var scholarships int64
	config.DB.Model(&models.BeasiswaPendaftaran{}).Where("mahasiswa_id = ?", student.ID).Count(&scholarships)
	var aspirations int64
	config.DB.Model(&models.Aspirasi{}).Where("mahasiswa_id = ?", student.ID).Count(&aspirations)
	var health int64
	config.DB.Model(&models.Kesehatan{}).Where("mahasiswa_id = ?", student.ID).Count(&health)
	var psikologBookings int64
	config.DB.Model(&models.PsikologBooking{}).Where("mahasiswa_id = ?", student.ID).Count(&psikologBookings)

	return jsonSuccess(c, fiber.Map{
		"profile": studentProfileResponse(student),
		"stats": fiber.Map{
			"achievements":          achievements,
			"scholarship_requests":  scholarships,
			"aspirations":           aspirations,
			"health_records":        health,
			"psychologist_bookings": psikologBookings,
		},
	})
}

// ListPsychologists returns active psychologists that students can book.
func ListPsychologists(c *fiber.Ctx) error {
	var psychologists []models.Psikolog
	query := config.DB.Where("is_aktif = ?", true).Order("nama asc")
	if search := strings.TrimSpace(c.Query("search")); search != "" {
		like := "%" + search + "%"
		query = query.Where("nama ILIKE ? OR spesialisasi ILIKE ? OR lokasi ILIKE ?", like, like, like)
	}
	if err := query.Find(&psychologists).Error; err != nil {
		return err
	}

	items := make([]fiber.Map, 0, len(psychologists))
	for _, psikolog := range psychologists {
		items = append(items, psychologistProfileResponse(psikolog))
	}
	return jsonSuccess(c, items)
}

// GetPsychologistSchedules returns active schedule slots for one psychologist.
func GetPsychologistSchedules(c *fiber.Ctx) error {
	psikologID := c.Params("id")
	var psikolog models.Psikolog
	if err := config.DB.Where("id = ? AND is_aktif = ?", psikologID, true).First(&psikolog).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Psikolog tidak ditemukan")
	}

	var slots []models.PsikologScheduleSlot
	if err := config.DB.Where("psikolog_id = ? AND is_aktif = ?", psikolog.ID, true).Order("hari asc, jam_mulai asc").Find(&slots).Error; err != nil {
		return err
	}

	days := []string{"Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"}
	dayOrder := map[string]int{}
	for index, day := range days {
		dayOrder[day] = index
	}
	sort.Slice(slots, func(i, j int) bool {
		if dayOrder[slots[i].Hari] == dayOrder[slots[j].Hari] {
			return slots[i].JamMulai < slots[j].JamMulai
		}
		return dayOrder[slots[i].Hari] < dayOrder[slots[j].Hari]
	})

	items := make([]fiber.Map, 0, len(slots))
	for _, slot := range slots {
		items = append(items, fiber.Map{
			"id":          slot.ID,
			"day":         slot.Hari,
			"start":       slot.JamMulai,
			"end":         slot.JamSelesai,
			"location":    slot.Lokasi,
			"quota":       slot.Kuota,
			"is_active":   slot.IsAktif,
			"next_date":   nextDateForIndonesianDay(slot.Hari).Format("2006-01-02"),
			"display":     fmt.Sprintf("%s, %s - %s", slot.Hari, slot.JamMulai, slot.JamSelesai),
			"psikolog_id": psikolog.ID,
		})
	}

	return jsonSuccess(c, fiber.Map{"psychologist": psychologistProfileResponse(psikolog), "slots": items})
}

// GetStudentPsychologistBookings returns the logged-in student's bookings in the psychologist module.
func GetStudentPsychologistBookings(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return err
	}

	var bookings []models.PsikologBooking
	if err := config.DB.Preload("Psikolog").Where("mahasiswa_id = ?", student.ID).Order("tanggal desc, jam_mulai desc").Find(&bookings).Error; err != nil {
		return err
	}

	items := make([]fiber.Map, 0, len(bookings))
	for _, booking := range bookings {
		items = append(items, psychologistBookingResponse(booking))
	}
	return jsonSuccess(c, items)
}

// CreateStudentPsychologistBooking creates a booking in the psychologist module from the student counseling flow.
func CreateStudentPsychologistBooking(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return err
	}

	var body struct {
		PsikologID uint   `json:"psikolog_id"`
		SlotID     uint   `json:"slot_id"`
		Date       string `json:"date"`
		Start      string `json:"start"`
		End        string `json:"end"`
		Topic      string `json:"topic"`
		Complaint  string `json:"complaint"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload booking tidak valid")
	}
	if body.PsikologID == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "psikolog_id wajib diisi")
	}

	var psikolog models.Psikolog
	if err := config.DB.Where("id = ? AND is_aktif = ?", body.PsikologID, true).First(&psikolog).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Psikolog tidak tersedia")
	}

	if body.SlotID != 0 {
		var slot models.PsikologScheduleSlot
		if err := config.DB.Where("id = ? AND psikolog_id = ? AND is_aktif = ?", body.SlotID, psikolog.ID, true).First(&slot).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "Slot jadwal tidak tersedia")
		}
		body.Start = slot.JamMulai
		body.End = slot.JamSelesai
		if body.Date == "" {
			body.Date = nextDateForIndonesianDay(slot.Hari).Format("2006-01-02")
		}
	}

	date, err := time.Parse("2006-01-02", strings.TrimSpace(body.Date))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "date wajib berformat YYYY-MM-DD")
	}
	if strings.TrimSpace(body.Start) == "" || strings.TrimSpace(body.End) == "" {
		return fiber.NewError(fiber.StatusBadRequest, "start dan end wajib diisi")
	}
	if strings.TrimSpace(body.Topic) == "" {
		body.Topic = "Konseling"
	}

	var existing int64
	config.DB.Model(&models.PsikologBooking{}).
		Where("psikolog_id = ? AND tanggal = ? AND jam_mulai = ? AND status IN ?", psikolog.ID, date, body.Start, []string{"Menunggu", "Dikonfirmasi"}).
		Count(&existing)
	if existing > 0 {
		return fiber.NewError(fiber.StatusConflict, "Slot ini sudah memiliki booking aktif")
	}

	booking := models.PsikologBooking{
		PsikologID:  psikolog.ID,
		MahasiswaID: student.ID,
		Tanggal:     date,
		JamMulai:    body.Start,
		JamSelesai:  body.End,
		Topik:       body.Topic,
		Keluhan:     body.Complaint,
		Status:      "Menunggu",
	}
	if err := config.DB.Create(&booking).Error; err != nil {
		return err
	}

	notification := models.PsikologNotification{
		PsikologID: psikolog.ID,
		UserID:     psikolog.UserID,
		Judul:      "Booking Konseling Baru",
		Deskripsi:  fmt.Sprintf("%s mengajukan booking konseling %s pukul %s.", student.Nama, date.Format("02 Jan 2006"), booking.JamMulai),
		Tipe:       "booking",
		IsRead:     false,
	}
	_ = config.DB.Create(&notification).Error

	if err := config.DB.Preload("Psikolog").First(&booking, booking.ID).Error; err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": psychologistBookingResponse(booking)})
}

// CancelStudentPsychologistBooking cancels the logged-in student's psychologist booking.
func CancelStudentPsychologistBooking(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return err
	}

	var booking models.PsikologBooking
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", c.Params("id"), student.ID).First(&booking).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Booking tidak ditemukan")
	}
	if booking.Status == "Selesai" {
		return fiber.NewError(fiber.StatusBadRequest, "Booking selesai tidak dapat dibatalkan")
	}
	if err := config.DB.Model(&booking).Update("status", "Dibatalkan").Error; err != nil {
		return err
	}
	return jsonSuccess(c, fiber.Map{"id": booking.ID, "status": "Dibatalkan"})
}

func nextDateForIndonesianDay(day string) time.Time {
	targets := map[string]time.Weekday{
		"Minggu": time.Sunday,
		"Senin":  time.Monday,
		"Selasa": time.Tuesday,
		"Rabu":   time.Wednesday,
		"Kamis":  time.Thursday,
		"Jumat":  time.Friday,
		"Sabtu":  time.Saturday,
	}
	now := time.Now()
	target, ok := targets[day]
	if !ok {
		return now
	}
	daysUntil := (int(target) - int(now.Weekday()) + 7) % 7
	if daysUntil == 0 {
		daysUntil = 7
	}
	return now.AddDate(0, 0, daysUntil)
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

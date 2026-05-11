package routes

import (
	"siakad-backend/controllers/mahasiswa"
	"siakad-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

// SetupMahasiswaRoutes mendaftarkan semua rute untuk role mahasiswa
func SetupMahasiswaRoutes(app *fiber.App) {
	api := app.Group("/api", middleware.AuthProtected)

	// Mahasiswa Dashboard
	api.Get("/mahasiswa/dashboard", mahasiswa.GetDashboard)
	api.Get("/mahasiswa/kegiatan", mahasiswa.GetKegiatan)

	// PKKMB (Kencana)
	kencanaGroup := api.Group("/kencana")
	kencanaGroup.Get("/progress", mahasiswa.GetProgress)
	kencanaGroup.Post("/check-in/:id", mahasiswa.CheckIn)
	kencanaGroup.Get("/sertifikat", mahasiswa.GetSertifikat)
	kencanaGroup.Post("/sertifikat/generate", mahasiswa.GenerateSertifikat)
	kencanaGroup.Get("/banding", mahasiswa.GetBandingList)
	kencanaGroup.Post("/banding", mahasiswa.SubmitBanding)
	kencanaGroup.Get("/kuis/:id/soal", mahasiswa.GetKuisSoal)
	kencanaGroup.Post("/kuis/:id/submit", mahasiswa.SubmitKuis)

	// Achievement
	achievementGroup := api.Group("/achievement")
	achievementGroup.Get("/", mahasiswa.GetAchievements)
	achievementGroup.Post("/", mahasiswa.CreateAchievement)
	achievementGroup.Get("/:id", mahasiswa.GetAchievementDetail)
	achievementGroup.Delete("/:id", mahasiswa.DeleteAchievement)

	// Organisasi
	organisasiGroup := api.Group("/organisasi")
	organisasiGroup.Get("/", mahasiswa.GetList)
	organisasiGroup.Post("/", mahasiswa.Create)
	organisasiGroup.Put("/:id", mahasiswa.Update)
	organisasiGroup.Delete("/:id", mahasiswa.Delete)

	// Profil
	profilGroup := api.Group("/profil")
	profilGroup.Get("/", mahasiswa.GetProfile)
	profilGroup.Put("/data-diri", mahasiswa.UpdateProfile)
	profilGroup.Put("/change-password", mahasiswa.ChangePassword)
	profilGroup.Post("/foto", mahasiswa.UploadAvatar)
	profilGroup.Get("/preferensi-notif", mahasiswa.GetPreferensiNotif)
	profilGroup.Put("/preferensi-notif", mahasiswa.UpdatePreferensiNotif)
	profilGroup.Get("/sesi-aktif", mahasiswa.GetSesiAktif)
	profilGroup.Get("/riwayat-login", mahasiswa.GetRiwayatLogin)

	// Student Health Records
	studentHealthGroup := api.Group("/student-health")
	studentHealthGroup.Get("/riwayat", mahasiswa.GetHealthRiwayat)
	studentHealthGroup.Get("/riwayat/:id", mahasiswa.GetHealthDetail)
	studentHealthGroup.Get("/ringkasan", mahasiswa.GetHealthRingkasan)
	studentHealthGroup.Get("/tips", mahasiswa.GetHealthTips)
	studentHealthGroup.Post("/record", mahasiswa.CreateHealthRecord)
	studentHealthGroup.Post("/mandiri", mahasiswa.CreateHealthMandiri)

	// Counseling
	counselingGroup := api.Group("/counseling")
	counselingGroup.Get("/status", mahasiswa.GetCounselingStatus)
	counselingGroup.Get("/jadwal", mahasiswa.GetCounselingJadwal)
	counselingGroup.Post("/booking", mahasiswa.CreateBooking)
	counselingGroup.Post("/request", mahasiswa.RequestCounseling)
	counselingGroup.Get("/riwayat", mahasiswa.GetCounselingRiwayat)
	counselingGroup.Delete("/riwayat/:id", mahasiswa.CancelBooking)

	// Scholarship
	scholarshipGroup := api.Group("/scholarship")
	scholarshipGroup.Get("/", mahasiswa.GetKatalogBeasiswa)
	scholarshipGroup.Get("/riwayat", mahasiswa.GetRiwayatPengajuan)
	scholarshipGroup.Get("/:id", mahasiswa.GetBeasiswaDetail)
	scholarshipGroup.Post("/:id/daftar", mahasiswa.DaftarBeasiswa)
	scholarshipGroup.Get("/pengajuan/:id", mahasiswa.GetPengajuanDetail)

	// Voice (Aspirasi)
	voiceGroup := api.Group("/student-voice")
	voiceGroup.Get("/stats", mahasiswa.GetStats)
	voiceGroup.Get("/", mahasiswa.GetAspirasiList)
	voiceGroup.Post("/create", mahasiswa.CreateAspirasi)
	voiceGroup.Get("/:id", mahasiswa.GetDetail)
	voiceGroup.Put("/:id/cancel", mahasiswa.CancelAspirasi)

	// Notification
	notifGroup := api.Group("/notifikasi")
	notifGroup.Get("/", mahasiswa.GetNotifications)
	notifGroup.Get("/unread-count", mahasiswa.GetUnreadCount)
	notifGroup.Put("/:id/baca", mahasiswa.MarkAsRead)
	notifGroup.Put("/baca-semua", mahasiswa.MarkAllAsRead)
}
package routes

import (
	"siakad-backend/controllers/mahasiswa/achievement"
	"siakad-backend/controllers/mahasiswa/counseling"
	"siakad-backend/controllers/mahasiswa/dashboard"
	"siakad-backend/controllers/mahasiswa/health"
	"siakad-backend/controllers/mahasiswa/kencana"
	"siakad-backend/controllers/mahasiswa/notifikasi"
	"siakad-backend/controllers/mahasiswa/organisasi"
	"siakad-backend/controllers/mahasiswa/profil"
	"siakad-backend/controllers/mahasiswa/scholarship"
	"siakad-backend/controllers/mahasiswa/voice"
	"siakad-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

// SetupMahasiswaRoutes mendaftarkan semua rute untuk role mahasiswa
func SetupMahasiswaRoutes(app *fiber.App) {
	api := app.Group("/api", middleware.AuthProtected)

	// Mahasiswa Dashboard
	api.Get("/mahasiswa/dashboard", dashboard.GetDashboard)
	api.Get("/mahasiswa/kegiatan", dashboard.GetKegiatan)

	// PKKMB (Kencana)
	kencanaGroup := api.Group("/kencana")
	kencanaGroup.Get("/progress", kencana.GetProgress)
	kencanaGroup.Post("/check-in/:id", kencana.CheckIn)
	kencanaGroup.Get("/sertifikat", kencana.GetSertifikat)
	kencanaGroup.Post("/sertifikat/generate", kencana.GenerateSertifikat)
	kencanaGroup.Get("/banding", kencana.GetBandingList)
	kencanaGroup.Post("/banding", kencana.SubmitBanding)
	kencanaGroup.Get("/kuis/:id/soal", kencana.GetKuisSoal)
	kencanaGroup.Post("/kuis/:id/submit", kencana.SubmitKuis)

	// Achievement
	achievementGroup := api.Group("/achievement")
	achievementGroup.Get("/", achievement.GetAchievements)
	achievementGroup.Post("/", achievement.CreateAchievement)
	achievementGroup.Get("/:id", achievement.GetAchievementDetail)
	achievementGroup.Delete("/:id", achievement.DeleteAchievement)

	// Organisasi
	organisasiGroup := api.Group("/organisasi")
	organisasiGroup.Get("/", organisasi.GetList)
	organisasiGroup.Post("/", organisasi.Create)
	organisasiGroup.Put("/:id", organisasi.Update)
	organisasiGroup.Delete("/:id", organisasi.Delete)

	// Profil
	profilGroup := api.Group("/profil")
	profilGroup.Get("/", profil.GetProfile)
	profilGroup.Put("/data-diri", profil.UpdateProfile)
	profilGroup.Put("/change-password", profil.ChangePassword)
	profilGroup.Post("/foto", profil.UploadAvatar)
	profilGroup.Get("/preferensi-notif", profil.GetPreferensiNotif)
	profilGroup.Put("/preferensi-notif", profil.UpdatePreferensiNotif)
	profilGroup.Get("/sesi-aktif", profil.GetSesiAktif)
	profilGroup.Get("/riwayat-login", profil.GetRiwayatLogin)

	// Student Health Records
	studentHealthGroup := api.Group("/student-health")
	studentHealthGroup.Get("/riwayat", health.GetHealthRiwayat)
	studentHealthGroup.Get("/riwayat/:id", health.GetHealthDetail)
	studentHealthGroup.Get("/ringkasan", health.GetHealthRingkasan)
	studentHealthGroup.Get("/tips", health.GetHealthTips)
	studentHealthGroup.Post("/record", health.CreateHealthRecord)
	studentHealthGroup.Post("/mandiri", health.CreateHealthMandiri)

	// Counseling
	counselingGroup := api.Group("/counseling")
	counselingGroup.Get("/status", counseling.GetCounselingStatus)
	counselingGroup.Get("/jadwal", counseling.GetCounselingJadwal)
	counselingGroup.Post("/booking", counseling.CreateBooking)
	counselingGroup.Post("/request", counseling.RequestCounseling)
	counselingGroup.Get("/riwayat", counseling.GetCounselingRiwayat)
	counselingGroup.Delete("/riwayat/:id", counseling.CancelBooking)

	// Scholarship
	scholarshipGroup := api.Group("/scholarship")
	scholarshipGroup.Get("/", scholarship.GetKatalogBeasiswa)
	scholarshipGroup.Get("/riwayat", scholarship.GetRiwayatPengajuan)
	scholarshipGroup.Get("/:id", scholarship.GetBeasiswaDetail)
	scholarshipGroup.Post("/:id/daftar", scholarship.DaftarBeasiswa)
	scholarshipGroup.Get("/pengajuan/:id", scholarship.GetPengajuanDetail)

	// Voice (Aspirasi)
	voiceGroup := api.Group("/student-voice")
	voiceGroup.Get("/stats", voice.GetStats)
	voiceGroup.Get("/", voice.GetAspirasiList)
	voiceGroup.Post("/create", voice.CreateAspirasi)
	voiceGroup.Get("/:id", voice.GetDetail)
	voiceGroup.Put("/:id/cancel", voice.CancelAspirasi)

	// Notification
	notifGroup := api.Group("/notifikasi")
	notifGroup.Get("/", notifikasi.GetNotifications)
	notifGroup.Get("/unread-count", notifikasi.GetUnreadCount)
	notifGroup.Put("/:id/baca", notifikasi.MarkAsRead)
	notifGroup.Put("/baca-semua", notifikasi.MarkAllAsRead)
}
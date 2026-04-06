package main

import (
	"log"
	"os"

	"siakad-backend/config"
	"siakad-backend/middleware"
	"siakad-backend/modules/auth"
	"siakad-backend/modules/dashboard"
	"siakad-backend/modules/achievement"
	"siakad-backend/modules/scholarship"
	"siakad-backend/modules/counseling"
	"siakad-backend/modules/health"
	"siakad-backend/modules/voice"
	"siakad-backend/modules/organisasi"
	"siakad-backend/modules/kencana"
	"siakad-backend/modules/krs"
	"siakad-backend/modules/profil"
	"siakad-backend/modules/notifikasi"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// Initialize .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file or .env file not found, continuing with system defaults")
	}

	// Connect to PostgreSQL
	config.ConnectDB()

	// Setup Fiber App
	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173", // URL frontend Vite Anda
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))

	// Basic route to check if DB is connected
	app.Get("/api/health", func(c *fiber.Ctx) error {
		// Ping DB
		sqlDB, err := config.DB.DB()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Database not configured properly", "data": err.Error()})
		}
		err = sqlDB.Ping()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Database is disconnected", "data": err.Error()})
		}
		return c.JSON(fiber.Map{"status": "success", "message": "Backend API is running and Database is fully connected!"})
	})

	// Auth Routes
	api := app.Group("/api/v1")
	authGroup := api.Group("/auth")
	authGroup.Post("/login", func(c *fiber.Ctx) error {
		// Because of cycle imports or to keep it simple, we wrap the call.
		// Wait, we need to import siakad-backend/modules/auth and siakad-backend/middleware.
		// I will just add the import at the top later if not there.
		return auth.Login(c)
	})
	authGroup.Post("/refresh", auth.RefreshToken)
	authGroup.Post("/logout", auth.Logout)
	authGroup.Put("/change-password", middleware.AuthProtected, auth.ChangePassword)

	// Mahasiswa Routes
	mahasiswaGroup := api.Group("/mahasiswa")
	mahasiswaGroup.Get("/dashboard", middleware.AuthProtected, dashboard.GetDashboard)
	mahasiswaGroup.Get("/kegiatan", middleware.AuthProtected, dashboard.GetKegiatan)

	// KRS Routes
	krsGroup := api.Group("/krs", middleware.AuthProtected)
	krsGroup.Get("/periode", krs.GetPeriode)
	krsGroup.Get("/matakuliah", krs.GetKatalog)
	krsGroup.Get("/saya", krs.GetKRSSaya)
	krsGroup.Post("/tambah", krs.TambahKRS)
	krsGroup.Delete("/:id", krs.HapusKRS)
	krsGroup.Post("/submit", krs.SubmitKRS)
	krsGroup.Get("/cetak", krs.CetakKRS)

	// Kencana Routes
	kencanaGroup := api.Group("/kencana", middleware.AuthProtected)
	kencanaGroup.Get("/progress", kencana.GetProgress)
	kencanaGroup.Get("/kuis/:kuisId/soal", kencana.GetSoalKuis)
	kencanaGroup.Post("/kuis/:kuisId/submit", kencana.SubmitKuis)
	kencanaGroup.Get("/sertifikat", kencana.CekSertifikat)
	kencanaGroup.Post("/sertifikat/generate", kencana.GenerateSertifikat)
	kencanaGroup.Get("/banding", kencana.GetBanding)
	kencanaGroup.Post("/banding", kencana.AjukanBanding)

	// Achievement Routes
	achievementGroup := api.Group("/achievement", middleware.AuthProtected)
	achievementGroup.Get("/", achievement.GetAchievements)
	achievementGroup.Get("/:id", achievement.GetAchievementDetail)
	achievementGroup.Post("/", achievement.CreateAchievement)
	achievementGroup.Delete("/:id", achievement.DeleteAchievement)
	
	// Profil Routes
	profilGroup := api.Group("/profil", middleware.AuthProtected)
	profilGroup.Get("/", profil.GetProfile)
	profilGroup.Put("/data-diri", profil.UpdateProfile)
	profilGroup.Post("/foto", profil.UploadAvatar)
	profilGroup.Put("/ganti-password", profil.ChangePassword)
	profilGroup.Get("/sesi-aktif", profil.GetSessions)
	profilGroup.Get("/riwayat-login", profil.GetLoginHistory)
	profilGroup.Get("/preferensi-notif", profil.GetPreferences)
	profilGroup.Put("/preferensi-notif", profil.UpdatePreferences)

	// Scholarship Routes
	scholarshipGroup := api.Group("/scholarship", middleware.AuthProtected)
	scholarshipGroup.Get("/", scholarship.GetKatalogBeasiswa)
	scholarshipGroup.Get("/riwayat", scholarship.GetRiwayatPengajuan)
	scholarshipGroup.Get("/pengajuan/:id", scholarship.GetPengajuanDetail)
	scholarshipGroup.Get("/:id", scholarship.GetBeasiswaDetail)
	scholarshipGroup.Post("/:id/daftar", scholarship.DaftarBeasiswa)

	// Counseling Routes
	counselingGroup := api.Group("/counseling", middleware.AuthProtected)
	counselingGroup.Get("/jadwal", counseling.GetJadwalKonseling)
	counselingGroup.Get("/riwayat", counseling.GetRiwayatBooking)
	// counselingGroup.Get("/riwayat/:id", counseling.GetRiwayatDetail) // Not strictly needed yet if list has info
	// counselingGroup.Get("/catatan/:id", counseling.GetCatatan) // Only for Counselor Role (Future)
	counselingGroup.Post("/booking", counseling.CreateBooking)
	counselingGroup.Delete("/riwayat/:id", counseling.CancelBooking)

	// Health Routes
	healthGroup := api.Group("/health", middleware.AuthProtected)
	healthGroup.Get("/ringkasan", health.GetHealthRingkasan)
	healthGroup.Get("/riwayat", health.GetHealthRiwayat)
	healthGroup.Get("/riwayat/:id", health.GetHealthDetailRecord)
	healthGroup.Post("/mandiri", health.CreateHealthMandiri)
	healthGroup.Get("/tips", health.GetHealthTips)

	// Student Voice Routes
	voiceGroup := api.Group("/student-voice", middleware.AuthProtected)
	voiceGroup.Get("/", voice.GetAspirasiList)
	voiceGroup.Get("/stats", voice.GetStats)
	voiceGroup.Get("/:id", voice.GetDetail)
	voiceGroup.Post("/", voice.CreateAspirasi)
	voiceGroup.Put("/:id/cancel", voice.CancelAspirasi)

	// Organisasi Routes
	orgGroup := api.Group("/organisasi", middleware.AuthProtected)
	orgGroup.Get("/", organisasi.GetList)
	orgGroup.Post("/", organisasi.Create)
	orgGroup.Put("/:id", organisasi.Update)
	orgGroup.Delete("/:id", organisasi.Delete)
	
	// Notification Routes
	notifGroup := api.Group("/notifikasi", middleware.AuthProtected)
	notifGroup.Get("/", notifikasi.GetNotifications)
	notifGroup.Get("/unread-count", notifikasi.GetUnreadCount)
	notifGroup.Put("/:id/baca", notifikasi.MarkAsRead)
	notifGroup.Put("/baca-semua", notifikasi.MarkAllAsRead)
	notifGroup.Delete("/hapus-bulk", notifikasi.DeleteBulk)
	notifGroup.Delete("/hapus-sudah-dibaca", notifikasi.DeleteRead)
	notifGroup.Delete("/:id", notifikasi.DeleteNotification)
	
	adminGroup := api.Group("/admin")
	adminGroup.Get("/achievement/export", achievement.ExportSimkatmawa)

	// Serve Static Files for Uploads
	app.Static("/uploads", "./uploads")

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}
	
	log.Printf("Starting Server on port %s...", port)
	err = app.Listen(":" + port)
	if err != nil {
		log.Fatal(err)
	}
}

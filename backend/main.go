package main

import (
	"log"
	authSvc "siakad-backend/auth"
	"siakad-backend/config"
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
	"siakad-backend/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Peringatan: Tidak dapat memuat file .env, menggunakan environment default")
	}

	// Connect to Database
	config.ConnectDB()

	// Bootstrap Data
	authSvc.EnsureBootstrapData()

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173, http://127.0.0.1:5173",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: true,
	}))

	// Static files
	app.Static("/uploads", "./uploads")

	// Unprotected routes
	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status":  "success",
			"message": "Backend is online",
		})
	})
	app.Get("/api/status", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status":  "success",
			"message": "Backend is online",
		})
	})

	// Auth Routes
	authGroup := app.Group("/api/auth")
	authGroup.Post("/login", authSvc.Login)

	// Admin Routes (Protected separately)
	adminGroup := app.Group("/api/admin", middleware.AuthProtected, middleware.AdminCheck)
	routes.SetupSuperAdminRoutes(adminGroup)

	// API Group for typical authenticated users
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
	scholarshipGroup.Get("/pengajuan/:id", scholarship.GetRiwayatPengajuan) // Placeholder for detail if needed

	// Voice (Aspirasi)
	voiceGroup := api.Group("/student-voice")
	voiceGroup.Get("/stats", voice.GetStats)
	voiceGroup.Get("/", voice.GetAspirasiList)
	voiceGroup.Post("/create", voice.CreateAspirasi)
	voiceGroup.Put("/:id/cancel", voice.CancelAspirasi)
	voiceGroup.Get("/:id", voice.GetDetail)

	// Notification
	notifGroup := api.Group("/notifikasi")
	notifGroup.Get("/", notifikasi.GetNotifications)
	notifGroup.Get("/unread-count", notifikasi.GetUnreadCount)
	notifGroup.Put("/:id/baca", notifikasi.MarkAsRead)
	notifGroup.Put("/baca-semua", notifikasi.MarkAllAsRead)

	// Modular Routes
	routes.InisialisasiRuteFakultas(app)
	routes.SetupOrmawaRoutes(app)

	// Start Server
	port := "8000"
	log.Fatal(app.Listen(":" + port))
}

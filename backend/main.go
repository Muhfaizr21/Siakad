package main

import (
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
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// Connect to Database
	config.ConnectDB()

	// Bootstrap Data (Optional)
	authSvc.EnsureBootstrapData()

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173, http://127.0.0.1:5173",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE",
		AllowCredentials: true,
	}))

	// Static files for uploads
	app.Static("/uploads", "./uploads")

	// API Groups
	api := app.Group("/api")

	// Auth Routes
	authGroup := api.Group("/auth")
	authGroup.Post("/login", authSvc.Login)
	authGroup.Post("/refresh", authSvc.RefreshToken)
	authGroup.Post("/logout", authSvc.Logout)
	authGroup.Put("/change-password", middleware.AuthProtected, authSvc.ChangePassword)

	// Mahasiswa Routes
	mahasiswaGroup := api.Group("/mahasiswa", middleware.AuthProtected)
	mahasiswaGroup.Get("/dashboard", dashboard.GetDashboard)
	mahasiswaGroup.Get("/kegiatan", dashboard.GetKegiatan)

	// PKKMB (Kencana) Routes
	kencanaGroup := api.Group("/kencana", middleware.AuthProtected)
	kencanaGroup.Get("/progress", kencana.GetProgress)
	kencanaGroup.Post("/check-in/:id", kencana.CheckIn)
	kencanaGroup.Get("/sertifikat", kencana.GetSertifikat)
	kencanaGroup.Post("/banding", kencana.SubmitBanding)

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

	// Scholarship Routes
	scholarshipGroup := api.Group("/scholarship", middleware.AuthProtected)
	scholarshipGroup.Get("/", scholarship.GetKatalogBeasiswa)
	scholarshipGroup.Get("/riwayat", scholarship.GetRiwayatPengajuan)
	scholarshipGroup.Get("/pengajuan/:id", scholarship.GetPengajuanDetail)
	scholarshipGroup.Get("/:id", scholarship.GetBeasiswaDetail)
	scholarshipGroup.Post("/daftar/:id", scholarship.DaftarBeasiswa)

	// Counseling Routes
	counselingGroup := api.Group("/counseling", middleware.AuthProtected)
	counselingGroup.Get("/status", counseling.GetCounselingStatus)
	counselingGroup.Post("/request", counseling.RequestCounseling)

	// Health Routes
	healthGroup := api.Group("/health", middleware.AuthProtected)
	healthGroup.Get("/riwayat", health.GetHealthRiwayat)
	healthGroup.Post("/record", health.CreateHealthRecord)

	// Student Voice (Aspirasi) Routes
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

	// Modular Routes
	routes.InisialisasiRuteFakultas(app)
	routes.SetupOrmawaRoutes(app)
	routes.SetupSuperAdminRoutes(app)

	// Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}
	app.Listen(":" + port)
}

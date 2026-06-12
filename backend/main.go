package main

import (
	"log"
	"os"
	authSvc "siakad-backend/auth"
	"siakad-backend/config"
	"siakad-backend/controllers"
	"siakad-backend/cron"
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

	// Initialize Scheduler (Cron Jobs)
	cron.InitCron()

	app := fiber.New(fiber.Config{
		BodyLimit: 50 * 1024 * 1024, // 50 MB limit for file uploads
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
		AllowOriginsFunc: func(origin string) bool {
			return true
		},
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With, X-Faculty-ID, X-Student-ID, X-Ormawa-ID, X-Prodi-ID, X-Academic-Period-ID",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: true,
	}))

	// Prevent caching for all API responses to ensure real-time score updates
	app.Use(func(c *fiber.Ctx) error {
		c.Set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
		c.Set("Pragma", "no-cache")
		c.Set("Expires", "0")
		return c.Next()
	})

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
	app.Get("/api/public/theme", controllers.GetPublicTheme)

	// Auth Routes
	authGroup := app.Group("/api/auth")
	authGroup.Post("/login", authSvc.Login)
	authGroup.Post("/login/select-role", authSvc.LoginSelectRole)
	authGroup.Post("/register/mahasiswa", authSvc.RegisterMahasiswa) // NEW: Student self-registration
	authGroup.Put("/change-password", middleware.AuthProtected, authSvc.ChangePassword)
	authGroup.Put("/update-email", middleware.AuthProtected, authSvc.UpdateEmail) // NEW: Student update email
	authGroup.Post("/refresh", authSvc.RefreshToken)
	authGroup.Post("/logout", authSvc.Logout)

	// Admin Routes (Protected separately)
	adminGroup := app.Group("/api/admin", middleware.AuthProtected, middleware.AdminCheck)
	routes.SetupSuperAdminRoutes(adminGroup)

	// Modular Routes
	routes.SetupMahasiswaRoutes(app)
	routes.SetupKencanaRoutes(app)
	routes.InisialisasiRuteFakultas(app)
	routes.SetupOrmawaRoutes(app)
	routes.SetupPsychologistRoutes(app)
	routes.SetupTenagaKesehatanRoutes(app)
	routes.SetupHealthRoutes(app)

	// PDDIKTI Routes
	api := app.Group("/api", middleware.AuthProtected)
	pddiktiGroup := api.Group("/pddikti")
	routes.SetupPddiktiRoutes(pddiktiGroup)

	// Print all registered routes for debugging
	log.Println("=== REGISTERED ROUTES ===")
	for _, r := range app.GetRoutes() {
		log.Printf("%s %s", r.Method, r.Path)
	}
	log.Println("=========================")

	// Start Server

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(app.Listen(":" + port))
}

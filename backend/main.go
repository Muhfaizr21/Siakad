package main

import (
	"log"
	"os"
	authSvc "siakad-backend/auth"
	"siakad-backend/config"
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

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173" // fallback
	}

	allowOrigins := frontendURL
	if frontendURL != "http://localhost:5173" {
		allowOrigins = frontendURL + ", http://localhost:5173, http://127.0.0.1:5173"
	} else {
		allowOrigins = "http://localhost:5173, http://127.0.0.1:5173"
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowOrigins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With",
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

	// Modular Routes
	routes.SetupMahasiswaRoutes(app)
	routes.InisialisasiRuteFakultas(app)
	routes.SetupOrmawaRoutes(app)
	routes.SetupPsychologistRoutes(app)

	// PDDIKTI Routes
	api := app.Group("/api", middleware.AuthProtected)
	pddiktiGroup := api.Group("/pddikti")
	routes.SetupPddiktiRoutes(pddiktiGroup)

	// Start Server

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(app.Listen(":" + port))
}

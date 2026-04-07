package main

import (
	"log"
	"os"

	"siakad-backend/config"
	"siakad-backend/routes"

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
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
	}))

	// Serve Static Files
	app.Static("/uploads", "./uploads")

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

	// Setup Faculty Admin Routes (Our module)
	routes.SetupFacultyRoutes(app)

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

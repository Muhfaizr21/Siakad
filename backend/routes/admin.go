package routes

import (
	admin "siakad-backend/controllers/admin"
	"siakad-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func InisialisasiRuteSuperAdmin(app *fiber.App) {
	api := app.Group("/api/admin", middleware.AuthProtected, middleware.RequireRoles("super_admin"))

	api.Get("/faculty-admins", admin.ListFacultyAdmins)
	api.Post("/faculty-admins", admin.CreateFacultyAdmin)
	api.Get("/students", admin.ListAllStudents)
}

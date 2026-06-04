package routes

import (
	"siakad-backend/controllers/tenaga_kesehatan"
	"siakad-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupTenagaKesehatanRoutes(app *fiber.App) {
	api := app.Group("/api/tenagakes", middleware.AuthProtected, middleware.TenagaKesehatanCheck)

	api.Get("/me", tenaga_kesehatan.GetMe)
	api.Put("/profile", tenaga_kesehatan.UpdateProfile)
	api.Put("/change-password", tenaga_kesehatan.ChangePassword)
	api.Get("/dashboard", tenaga_kesehatan.GetDashboard)

	// Jadwal & Booking
	api.Get("/schedules", tenaga_kesehatan.GetSchedules)
	api.Post("/schedules", tenaga_kesehatan.CreateSchedule)
	api.Put("/schedules/:id", tenaga_kesehatan.UpdateSchedule)
	api.Delete("/schedules/:id", tenaga_kesehatan.DeleteSchedule)

	api.Get("/bookings", tenaga_kesehatan.GetBookings)
	api.Get("/bookings/:id", tenaga_kesehatan.GetBookingDetail)
	api.Put("/bookings/:id/status", tenaga_kesehatan.UpdateBookingStatus)

	// Rekam Medis & Screening
	api.Get("/patients", tenaga_kesehatan.GetPatients)
	api.Get("/patients/:id/medical-record", tenaga_kesehatan.GetMedicalRecord)
	api.Post("/patients/:id/screening", tenaga_kesehatan.CreateScreening)

	// QR / NIM Lookup
	api.Get("/students/lookup", tenaga_kesehatan.LookupStudent)

	// Laporan
	api.Get("/reports/export-excel", tenaga_kesehatan.ExportExcel)
	api.Get("/reports/export-pdf", tenaga_kesehatan.ExportPDF)
}

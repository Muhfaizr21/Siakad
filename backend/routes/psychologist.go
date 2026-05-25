package routes

import (
	"siakad-backend/controllers/psychologist"
	"siakad-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupPsychologistRoutes(app *fiber.App) {
	api := app.Group("/api/psychologist", middleware.AuthProtected, middleware.PsikologCheck)

	api.Get("/me", psychologist.GetMe)
	api.Put("/profile", psychologist.UpdateProfile)
	api.Put("/change-password", psychologist.ChangePassword)
	api.Get("/dashboard", psychologist.GetDashboard)

	api.Get("/bookings", psychologist.GetBookings)
	api.Get("/bookings/:id", psychologist.GetBookingDetail)
	api.Put("/bookings/:id/status", psychologist.UpdateBookingStatus)

	api.Get("/schedules", psychologist.GetSchedules)
	api.Put("/schedules", psychologist.SaveSchedules)

	api.Get("/patients", psychologist.GetPatients)
	api.Get("/patients/:id/medical-record", psychologist.GetMedicalRecord)
	api.Post("/patients/:id/session-notes", psychologist.CreateSessionNote)
	api.Put("/patients/:studentId/status", psychologist.UpdatePatientStatus)

	api.Get("/assessments", psychologist.GetAssessments)
	api.Post("/assessments", psychologist.CreateAssessment)

	api.Get("/analytics", psychologist.GetAnalytics)
	api.Get("/reports", psychologist.GetReports)
	api.Post("/reports", psychologist.CreateReport)
	api.Get("/reports/:id/download", psychologist.DownloadReport)

	api.Get("/notifications", psychologist.GetNotifications)
	api.Put("/notifications/read-all", psychologist.MarkAllNotificationsRead)
	api.Put("/notifications/:id/read", psychologist.MarkNotificationRead)
	api.Delete("/notifications/:id", psychologist.DeleteNotification)
}

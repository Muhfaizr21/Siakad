package routes

import (
	ormawa "siakad-backend/controllers/ormawa"
	"github.com/gofiber/fiber/v2"
)

func SetupOrmawaRoutes(app *fiber.App) {
	api := app.Group("/api/ormawa")

	// DASHBOARD STATS
	api.Get("/stats", ormawa.GetOrmawaStats)

	// PROPOSALS
	api.Get("/proposals", ormawa.GetProposals)
	api.Get("/proposals/:id/history", ormawa.GetProposalHistory)
	api.Post("/proposals", ormawa.CreateProposal)
	api.Put("/proposals/:id", ormawa.UpdateProposal)
	api.Delete("/proposals/:id", ormawa.DeleteProposal)

	// SETTINGS & PROFILE
	api.Get("/settings/:id", ormawa.GetOrmawaSettings)
	api.Put("/settings/:id", ormawa.UpdateOrmawaSettings)

	// CASH MUTATIONS (BUKU KAS)
	api.Get("/kas", ormawa.GetCashMutations)
	api.Post("/kas", ormawa.CreateCashMutation)

	// EVENTS
	api.Get("/events", ormawa.GetEvents)
	api.Post("/events", ormawa.CreateEvent)
	api.Put("/events/:id", ormawa.UpdateEvent)
	api.Delete("/events/:id", ormawa.DeleteEvent)

	// ATTENDANCE
	api.Get("/attendance/:eventId", ormawa.GetAttendance)
	api.Post("/attendance", ormawa.SubmitAttendance)

	// ANNOUNCEMENTS
	api.Get("/announcements", ormawa.GetAnnouncements)
	api.Post("/announcements", ormawa.CreateAnnouncement)
	api.Put("/announcements/:id", ormawa.UpdateAnnouncement)
	api.Delete("/announcements/:id", ormawa.DeleteAnnouncement)

	// ROLES
	api.Get("/roles", ormawa.GetOrmawaRoles)
	api.Delete("/roles/:id", ormawa.DeleteOrmawaRole)

	// MEMBERS
	api.Get("/members", ormawa.GetMembers)
	api.Post("/members", ormawa.CreateMember)
	api.Put("/members/:id", ormawa.UpdateMember)
	api.Delete("/members/:id", ormawa.DeleteMember)

	// LOOKUPS
	api.Get("/students", ormawa.GetStudentsLookup)

	// NOTIFICATIONS
	api.Get("/notifications", ormawa.GetOrmawaNotifications)
	api.Put("/notifications/:id/read", ormawa.MarkNotificationRead)
	api.Put("/notifications/read-all", ormawa.MarkAllNotificationsRead)
	api.Delete("/notifications/:id", ormawa.DeleteNotification)

	// DIVISIONS
	api.Get("/divisions", ormawa.GetDivisions)
	api.Post("/divisions", ormawa.CreateDivision)
	api.Delete("/divisions/:id", ormawa.DeleteDivision)

	// LPJ
	api.Get("/lpjs", ormawa.GetLPJs)
	api.Post("/lpjs", ormawa.CreateLPJ)
	api.Put("/lpjs/:id", ormawa.UpdateLPJ)
	api.Post("/lpjs/:id/documents", ormawa.UploadLPJDocument)
	api.Delete("/lpjs/documents/:docId", ormawa.DeleteLPJDocument)

	// ASPIRATIONS
	api.Get("/aspirations", ormawa.GetAspirations)
	api.Post("/aspirations", ormawa.CreateAspiration)
	api.Put("/aspirations/:id", ormawa.UpdateAspiration)

	// FILE UPLOAD HANDLER
	api.Post("/upload", ormawa.UploadFile)
}
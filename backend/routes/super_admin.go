package routes

import (
	"siakad-backend/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupSuperAdminRoutes(app *fiber.App) {
	admin := app.Group("/api/admin")

	// User & RBAC Management
	admin.Get("/stats", controllers.GetDashboardStats)
	admin.Get("/users", controllers.GetUsers)
	admin.Post("/users", controllers.CreateUser)
	admin.Put("/users/role", controllers.UpdateUserRole)
	admin.Delete("/users/:id", controllers.DeleteUser)
	admin.Get("/audit-logs", controllers.GetAuditLogs)

	// Global Proposal Pipeline (University Level)
	admin.Get("/proposals", controllers.GetGlobalProposals)
	admin.Put("/proposals/:id/approve", controllers.ApproveProposalUniv)
	admin.Put("/proposals/:id/reject", controllers.RejectProposalUniv)

	// Master Data Management
	admin.Get("/fakultas", controllers.GetAllFakultas)
	admin.Post("/fakultas", controllers.CreateFakultas)
	admin.Put("/fakultas/:id", controllers.UpdateFakultas)
	admin.Delete("/fakultas/:id", controllers.DeleteFakultas)

	admin.Get("/ormawa", controllers.GetAllOrmawa)
	admin.Post("/ormawa", controllers.CreateOrmawa)
	admin.Put("/ormawa/:id", controllers.UpdateOrmawa)
	admin.Delete("/ormawa/:id", controllers.DeleteOrmawa)
	admin.Get("/students", controllers.GetAllStudents)
	admin.Post("/students", controllers.CreateStudent)
	admin.Put("/students/:id", controllers.UpdateStudent)
	admin.Delete("/students/:id", controllers.DeleteStudent)

	admin.Get("/prodi", controllers.GetAllProgramStudi)
	admin.Post("/prodi", controllers.CreateProgramStudi)
	admin.Put("/prodi/:id", controllers.UpdateProgramStudi)
	admin.Delete("/prodi/:id", controllers.DeleteProgramStudi)

	admin.Get("/lecturers", controllers.GetAllLecturers)
	admin.Post("/lecturers", controllers.CreateLecturer)
	admin.Put("/lecturers/:id", controllers.UpdateLecturer)
	admin.Delete("/lecturers/:id", controllers.DeleteLecturer)
	admin.Get("/aspirations", controllers.GetGlobalAspirations)

	admin.Get("/scholarships", controllers.GetAllScholarships)
	admin.Post("/scholarships", controllers.CreateScholarship)
	admin.Put("/scholarships/:id", controllers.UpdateScholarship)
	admin.Delete("/scholarships/:id", controllers.DeleteScholarship)

	admin.Get("/counseling", controllers.GetAllCounseling)
}

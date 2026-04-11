package routes

import (
	"siakad-backend/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupSuperAdminRoutes(r fiber.Router) {
	// User & RBAC Management
	r.Get("/stats", controllers.GetDashboardStats)
	r.Get("/users", controllers.GetUsers)
	r.Post("/users", controllers.CreateUser)
	r.Put("/users/role", controllers.UpdateUserRole)
	r.Delete("/users/:id", controllers.DeleteUser)
	r.Get("/audit-logs", controllers.GetAuditLogs)
	r.Get("/profile", controllers.GetAdminProfile)
	r.Put("/profile", controllers.UpdateAdminProfile)

	// Global Proposal Pipeline
	r.Get("/proposals", controllers.GetGlobalProposals)
	r.Put("/proposals/:id/approve", controllers.ApproveProposalUniv)
	r.Put("/proposals/:id/reject", controllers.RejectProposalUniv)

	// Master Data
	r.Get("/fakultas", controllers.GetAllFakultas)
	r.Post("/fakultas", controllers.CreateFakultas)
	r.Put("/fakultas/:id", controllers.UpdateFakultas)
	r.Delete("/fakultas/:id", controllers.DeleteFakultas)

	r.Get("/ormawa", controllers.GetAllOrmawa)
	r.Post("/ormawa", controllers.CreateOrmawa)
	r.Put("/ormawa/:id", controllers.UpdateOrmawa)
	r.Delete("/ormawa/:id", controllers.DeleteOrmawa)

	r.Get("/students", controllers.GetAllStudents)
	r.Post("/students", controllers.CreateStudent)
	r.Put("/students/:id", controllers.UpdateStudent)
	r.Delete("/students/:id", controllers.DeleteStudent)

	r.Get("/prodi", controllers.GetAllProgramStudi)
	r.Post("/prodi", controllers.CreateProgramStudi)
	r.Put("/prodi/:id", controllers.UpdateProgramStudi)
	r.Delete("/prodi/:id", controllers.DeleteProgramStudi)

	r.Get("/lecturers", controllers.GetAllLecturers)
	r.Post("/lecturers", controllers.CreateLecturer)
	r.Put("/lecturers/:id", controllers.UpdateLecturer)
	r.Delete("/lecturers/:id", controllers.DeleteLecturer)

	r.Get("/aspirations", controllers.GetGlobalAspirations)

	r.Get("/scholarships", controllers.GetAllScholarships)
	r.Post("/scholarships", controllers.CreateScholarship)
	r.Put("/scholarships/:id", controllers.UpdateScholarship)
	r.Delete("/scholarships/:id", controllers.DeleteScholarship)

	// Counseling
	r.Get("/counseling-records", controllers.GetAllCounseling)
	r.Post("/counseling-records", controllers.CreateCounseling)
	r.Put("/counseling-records/:id", controllers.UpdateCounseling)
	r.Delete("/counseling-records/:id", controllers.DeleteCounseling)

	// News & Content
	r.Get("/news", controllers.GetAllNews)
	r.Post("/news", controllers.CreateNews)
	r.Put("/news/:id", controllers.UpdateNews)
	r.Delete("/news/:id", controllers.DeleteNews)
	r.Get("/academic-settings", controllers.GetAcademicSettings)
	r.Put("/academic-settings", controllers.UpdateAcademicSettings)
}

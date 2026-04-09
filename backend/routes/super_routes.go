package routes

import (
	"siakad-backend/controllers"
	"siakad-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupSuperAdminRoutes(app *fiber.App) {
	api := app.Group("/api/v1/admin/super", middleware.AuthProtected)

	// Dashboard & Stats
	api.Get("/summary", controllers.GetGlobalSummary)
	api.Get("/proposals", controllers.GetAllProposals)
	api.Put("/proposals/:id", controllers.SuperUpdateProposalStatus)

	// User & RBAC Management
	api.Get("/users", controllers.GetAllUsers)
	api.Get("/roles", controllers.GetAllRoles)
	api.Post("/users", controllers.CreateUser)
	api.Put("/users/:id", controllers.UpdateUser)
	api.Delete("/users/:id", controllers.DeleteUser)

	// Master Data Management
	api.Get("/proposals", controllers.GetAllProposals)
	api.Get("/students", controllers.GetAllStudents)
	api.Post("/students", controllers.AdminCreateStudent)
	api.Put("/students/:id", controllers.AdminUpdateStudent)
	api.Delete("/students/:id", controllers.AdminDeleteStudent)
	api.Get("/ormawas", controllers.GetAllOrmawasWithStats)

	// Faculty & Ormawa Management
	api.Get("/faculties", controllers.GetFacultiesWithStats)
	api.Get("/majors", controllers.GetAllMajors)
	api.Post("/majors", controllers.CreateMajor)
	api.Put("/majors/:id", controllers.UpdateMajor)
	api.Delete("/majors/:id", controllers.DeleteMajor)
	
	api.Get("/lecturers", controllers.GetAllLecturersWithStats)
	api.Post("/lecturers", controllers.AdminCreateLecturer)
	api.Put("/lecturers/:id", controllers.AdminUpdateLecturer)
	api.Delete("/lecturers/:id", controllers.AdminDeleteLecturer)

	api.Post("/faculties", controllers.CreateFaculty)
	api.Put("/faculties/:id", controllers.UpdateFaculty)
	api.Delete("/faculties/:id", controllers.DeleteFaculty)

	// Ormawa CRUD
	api.Get("/ormawas", controllers.GetAllOrmawasWithStats)
	api.Post("/ormawas", controllers.CreateOrmawa)
	api.Put("/ormawas/:id", controllers.UpdateOrmawa)
	api.Delete("/ormawas/:id", controllers.DeleteOrmawa)

	// Scholarship Management
	api.Get("/scholarships", controllers.GetScholarships)
	api.Post("/scholarships", controllers.CreateScholarship)
	api.Put("/scholarships/:id", controllers.UpdateScholarship)
	api.Delete("/scholarships/:id", controllers.DeleteScholarship)
	api.Get("/scholarships/summary", controllers.GetScholarshipSummary)
	api.Get("/scholarships/applications", controllers.GetScholarshipApplications)
	api.Put("/scholarships/applications/:id", controllers.UpdateScholarshipApplicationStatus)
}

package routes

import (
	"siakad-backend/controllers"

	"github.com/gofiber/fiber/v2"
)

// SetupFacultyRoutes registers all Faculty Admin routes
func SetupFacultyRoutes(app *fiber.App) {
	api := app.Group("/api/faculty")

	// Academic routes
	api.Get("/lecturers", controllers.GetLecturers)
	api.Get("/lecturers/:id", controllers.GetLecturerByID)
	api.Post("/lecturers", controllers.CreateLecturer)
	api.Put("/lecturers/:id", controllers.UpdateLecturer)
	api.Delete("/lecturers/:id", controllers.DeleteLecturer)
	api.Get("/students", controllers.GetStudents)
	api.Get("/students/:id", controllers.GetStudentByID)
	api.Post("/students", controllers.CreateStudent)
	api.Put("/students/:id", controllers.UpdateStudent)
	api.Delete("/students/:id", controllers.DeleteStudent)
	api.Get("/courses", controllers.GetCourses)
	api.Get("/rooms", controllers.GetRooms)
	api.Get("/schedules", controllers.GetSchedules)
	api.Post("/schedules", controllers.CreateSchedule)
	api.Put("/schedules/:id", controllers.UpdateSchedule)
	api.Delete("/schedules/:id", controllers.DeleteSchedule)
	api.Get("/summary", controllers.GetDashboardSummary)
	
	// Faculty Organizations (Master Data)
	orgs := api.Group("/organizations")
	orgs.Get("", controllers.GetFacultyOrganizations)
	orgs.Post("", controllers.CreateFacultyOrganization)
	orgs.Put("/:id", controllers.UpdateFacultyOrganization)
	orgs.Delete("/:id", controllers.DeleteFacultyOrganization)

	api.Get("/faculties", controllers.GetFaculties)
	api.Post("/faculties", controllers.CreateFaculty)
	api.Put("/faculties/:id", controllers.UpdateFaculty)
	api.Delete("/faculties/:id", controllers.DeleteFaculty)

	// Program Study (Major) routes
	api.Get("/majors", controllers.GetMajors)
	api.Get("/majors/:id", controllers.GetMajorByID)
	api.Post("/majors", controllers.CreateMajor)
	api.Put("/majors/:id", controllers.UpdateMajor)
	api.Delete("/majors/:id", controllers.DeleteMajor)


	// KRS & Advisory routes
	api.Get("/krs", controllers.GetKRSSubmissions)
	api.Get("/krs/:id", controllers.GetKRSSubmissionByID)
	api.Put("/krs/:id/validasi", controllers.ValidateKRSSubmission)

	// Aspiration routes
	api.Get("/aspirasi", controllers.GetAspirations)
	api.Put("/aspirasi/:id", controllers.UpdateAspiration)
	api.Delete("/aspirasi/:id", controllers.DeleteAspiration)

	// Achievement routes
	api.Get("/prestasi", controllers.GetAchievements)
	api.Put("/prestasi/:id", controllers.VerifyAchievement)
	api.Delete("/prestasi/:id", controllers.DeleteAchievement)

	// LetterRequest routes
	api.Get("/surat", controllers.GetLetterRequests)
	api.Put("/surat/:id", controllers.UpdateLetterStatus)
	api.Delete("/surat/:id", controllers.DeleteLetterRequest)

	// Graduation/Yudisium routes
	api.Get("/yudisium", controllers.GetGraduationSubmissions)
	api.Put("/yudisium/:id", controllers.UpdateGraduationStatus)
	api.Delete("/yudisium/:id", controllers.DeleteGraduationSubmission)

	// MBKM routes
	api.Get("/mbkm", controllers.GetMBKMPrograms)
	api.Put("/mbkm/:id", controllers.UpdateMBKMStatus)
	api.Delete("/mbkm/:id", controllers.DeleteMBKMProgram)

	// Scholarship routes
	api.Get("/scholarships", controllers.GetScholarships)
	api.Post("/scholarships", controllers.CreateScholarship)
	api.Put("/scholarships/:id", controllers.UpdateScholarship)
	api.Delete("/scholarships/:id", controllers.DeleteScholarship)
	api.Get("/scholarships/applications", controllers.GetScholarshipApplications)
	api.Put("/scholarships/applications/:id", controllers.UpdateScholarshipApplicationStatus)
	api.Delete("/scholarships/applications/:id", controllers.DeleteScholarshipApplication)

	// Ormawa Proposals & LPJ
	ormawa := api.Group("/ormawa")
	ormawa.Get("/proposals", controllers.GetProposals)
	ormawa.Put("/proposals/:id", controllers.UpdateProposalStatus)
	ormawa.Delete("/proposals/:id", controllers.DeleteProposal)
	ormawa.Get("/lpjs", controllers.GetLpjs)
	ormawa.Put("/lpjs/:id", controllers.UpdateLpjStatus)

	// News / Content Management
	news := api.Group("/news")
	news.Get("", controllers.GetArticles)
	news.Post("", controllers.CreateArticle)
	news.Put("/:id", controllers.UpdateArticle)
	news.Delete("/:id", controllers.DeleteArticle)

	// PMB Admission routes
	pmb := api.Group("/pmb")
	pmb.Get("/admissions", controllers.GetAdmissions)
	pmb.Post("/", controllers.CreateAdmission)
	pmb.Put("/:id/status", controllers.UpdateAdmissionStatus)
	pmb.Delete("/:id", controllers.DeleteAdmission)

	// Faculty RBAC Routes
	roles := api.Group("/roles")
	{
		roles.Get("/", controllers.GetFacultyRoles)
		roles.Post("/", controllers.CreateFacultyRole)
		roles.Put("/:id", controllers.UpdateFacultyRole)
		roles.Delete("/:id", controllers.DeleteFacultyRole)
		roles.Post("/assign", controllers.AssignUserFacultyRole)
	}

	// Reports & Statistics
	api.Get("/reports/summary", controllers.GetFacultyReports)

	// Grading & Scores
	api.Get("/grades", controllers.GetGrades)
	api.Post("/grades", controllers.InputGrade)
}

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

	// Persuratan routes
	api.Get("/persuratan", controllers.GetLetterRequests)
	api.Put("/persuratan/:id", controllers.UpdateLetterRequestStatus)
}

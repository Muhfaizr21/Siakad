package routes

import (
	"siakad-backend/controllers"
	fakultas "siakad-backend/controllers/fakultas"
	ormawa "siakad-backend/controllers/ormawa"

	"github.com/gofiber/fiber/v2"
)

func SetupSuperAdminRoutes(r fiber.Router) {
	// User & RBAC Management
	r.Get("/stats", controllers.GetDashboardStats)
	r.Get("/system-health", controllers.GetSystemHealth)
	r.Get("/users", controllers.GetUsers)
	r.Post("/users", controllers.CreateUser)
	r.Put("/users/role", controllers.UpdateUserRole)
	r.Patch("/users/:id", controllers.UpdateUser)
	r.Delete("/users/:id", controllers.DeleteUser)

	r.Get("/rbac/roles", controllers.GetRBACRoles)
	r.Post("/rbac/roles", controllers.CreateRBACRole)
	r.Put("/rbac/roles/:id", controllers.UpdateRBACRole)
	r.Delete("/rbac/roles/:id", controllers.DeleteRBACRole)
	r.Get("/audit-logs", controllers.GetAuditLogs)
	r.Get("/profile", controllers.GetAdminProfile)
	r.Put("/profile", controllers.UpdateAdminProfile)

	// Global Proposal Pipeline
	r.Get("/proposals", controllers.GetGlobalProposals)
	r.Put("/proposals/:id/approve", controllers.ApproveProposalUniv)
	r.Put("/proposals/:id/reject", controllers.RejectProposalUniv)

	// Master Data
	r.Get("/academic-periods", controllers.GetAllAcademicPeriods)
	r.Get("/fakultas", controllers.GetAllFakultas)
	r.Post("/fakultas", controllers.CreateFakultas)
	r.Put("/fakultas/:id", controllers.UpdateFakultas)
	r.Delete("/fakultas/:id", controllers.DeleteFakultas)

	r.Get("/ormawa", controllers.GetAllOrmawa)
	r.Post("/ormawa", controllers.CreateOrmawa)
	r.Get("/ormawa/leaderboard", controllers.GetOrmawaLeaderboard)
	r.Get("/ormawa/gamifikasi/history", controllers.GetGlobalOrmawaPoinHistory)
	r.Get("/ormawa/gamifikasi/rules", controllers.GetOrmawaGamifikasiRules)
	r.Post("/ormawa/gamifikasi/rules", controllers.CreateOrmawaGamifikasiRule)
	r.Put("/ormawa/gamifikasi/rules/:id", controllers.UpdateOrmawaGamifikasiRule)
	r.Delete("/ormawa/gamifikasi/rules/:id", controllers.DeleteOrmawaGamifikasiRule)
	r.Get("/ormawa/lpjs", controllers.GetGlobalLPJs)
	r.Put("/ormawa/lpjs/:id/review", controllers.ReviewLPJ)
	r.Put("/ormawa/:id", controllers.UpdateOrmawa)
	r.Delete("/ormawa/:id", controllers.DeleteOrmawa)

	// Kategori Ormawa — Master Data (Super Admin CRUD)
	r.Get("/ormawa-kategori", ormawa.GetAllKategoriOrmawa)
	r.Post("/ormawa-kategori", ormawa.CreateKategoriOrmawa)
	r.Put("/ormawa-kategori/:id", ormawa.UpdateKategoriOrmawa)
	r.Delete("/ormawa-kategori/:id", ormawa.DeleteKategoriOrmawa)

	r.Get("/students", controllers.GetAllStudents)
	r.Post("/students", controllers.CreateStudent)
	r.Put("/students/:id", controllers.UpdateStudent)
	r.Delete("/students/:id", controllers.DeleteStudent)

	r.Get("/lecturers", controllers.GetAllLecturers)
	r.Post("/lecturers", controllers.CreateLecturer)
	r.Put("/lecturers/:id", controllers.UpdateLecturer)
	r.Delete("/lecturers/:id", controllers.DeleteLecturer)

	r.Get("/prodi", controllers.GetAllProgramStudi)
	r.Post("/prodi", controllers.CreateProgramStudi)
	r.Put("/prodi/:id", controllers.UpdateProgramStudi)
	r.Delete("/prodi/:id", controllers.DeleteProgramStudi)

	r.Get("/psychologists", controllers.GetAllPsychologists)
	r.Put("/psychologists/:id", controllers.UpdatePsychologist)
	r.Delete("/psychologists/:id", controllers.DeletePsychologist)
	r.Get("/psychologists/bookings", controllers.GetPsychologistBookingsAdmin)
	r.Get("/psychologists/medical-records", controllers.GetPsychologistMedicalRecordsAdmin)
	r.Get("/psychologists/referrals", controllers.GetPsychologistReferralsAdmin)
	r.Post("/psychologists/referrals/:id/approve", controllers.ApprovePsychologistReferral)
	r.Get("/psychologists/:id/schedules", controllers.GetPsychologistSchedulesAdmin)
	r.Put("/psychologists/:id/schedules", controllers.SavePsychologistSchedulesAdmin)

	// Tenaga Kesehatan Management (Super Admin)
	r.Get("/tenagakes", controllers.GetAllTenagaKesehatan)
	r.Put("/tenagakes/:id", controllers.UpdateTenagaKesehatan)
	r.Delete("/tenagakes/:id", controllers.DeleteTenagaKesehatan)
	r.Get("/tenagakes/bookings", controllers.GetTenagaKesehatanBookingsAdmin)
	r.Get("/tenagakes/medical-records", controllers.GetTenagaKesehatanMedicalRecordsAdmin)
	r.Get("/tenagakes/:id/schedules", controllers.GetTenagaKesehatanSchedulesAdmin)
	r.Post("/tenagakes/:id/schedules", controllers.CreateTenagaKesehatanScheduleAdmin)
	r.Put("/tenagakes/schedules/:id", controllers.UpdateTenagaKesehatanScheduleAdmin)
	r.Delete("/tenagakes/schedules/:id", controllers.DeleteTenagaKesehatanScheduleAdmin)

	r.Get("/aspirations", controllers.GetGlobalAspirations)
	r.Put("/aspirations/:id/status", controllers.UpdateAspirationStatus)

	r.Get("/scholarships", controllers.GetAllScholarships)
	r.Post("/scholarships", controllers.CreateScholarship)
	r.Put("/scholarships/:id", controllers.UpdateScholarship)
	r.Delete("/scholarships/:id", controllers.DeleteScholarship)
	r.Get("/scholarship-applications", controllers.GetAllScholarshipApplications)
	r.Put("/scholarship-applications/bulk/status", controllers.UpdateBulkScholarshipApplicationStatus)
	r.Put("/scholarship-applications/:id/status", controllers.UpdateScholarshipApplicationStatus)

	// Achievements (Prestasi Mahasiswa)
	r.Get("/achievements", fakultas.AmbilDaftarPrestasi)
	r.Post("/achievements/import", fakultas.ImportAchievements)
	r.Put("/achievements/:id/verify", fakultas.VerifikasiPrestasi)
	r.Post("/achievements/:id/sync-simkatmawa", fakultas.SyncSimkatmawa)
	r.Put("/achievements/:id/simkatmawa-status", fakultas.UpdateSimkatmawaStatus)
	r.Delete("/achievements/:id", fakultas.HapusPrestasi)

	// Counseling
	r.Get("/counseling-records", controllers.GetAllCounseling)
	r.Post("/counseling-records", controllers.CreateCounseling)
	r.Put("/counseling-records/:id", controllers.UpdateCounseling)
	r.Delete("/counseling-records/:id", controllers.DeleteCounseling)
	r.Get("/counseling-schedules", controllers.GetAllCounselingJadwal)
	r.Post("/counseling-schedules", controllers.CreateCounselingJadwal)
	r.Put("/counseling-schedules/:id", controllers.UpdateCounselingJadwal)
	r.Delete("/counseling-schedules/:id", controllers.DeleteCounselingJadwal)

	// News & Content
	r.Get("/news", controllers.GetAllNews)
	r.Post("/news", controllers.CreateNews)
	r.Put("/news/:id", controllers.UpdateNews)
	r.Delete("/news/:id", controllers.DeleteNews)
	r.Get("/academic-settings", controllers.GetAcademicSettings)
	r.Put("/academic-settings", controllers.UpdateAcademicSettings)
	r.Put("/landing-settings", controllers.UpdateLandingSettings)
	r.Post("/landing/upload", controllers.LandingUploadImage)

	// Theme Customizer
	r.Get("/theme", controllers.GetTheme)
	r.Put("/theme", controllers.UpdateTheme)
	r.Post("/theme/reset", controllers.ResetTheme)
	r.Post("/theme/upload-logo", controllers.UploadLogo)
	r.Post("/theme/upload-favicon", controllers.UploadFavicon)
}

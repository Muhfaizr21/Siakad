package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"siakad-backend/config"
	"siakad-backend/models"
	"siakad-backend/pkg/gamifikasi"
	"siakad-backend/pkg/notifikasi"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var rbacPermissionCatalog = []fiber.Map{
	{"module": "Core Security", "items": []string{"admin.dashboard.view", "admin.audit.view", "admin.profile.update", "rbac.users.view", "rbac.users.create", "rbac.users.update_role", "rbac.users.delete", "rbac.roles.view", "rbac.roles.create", "rbac.roles.update", "rbac.roles.delete", "rbac.permissions.assign"}},
	{"module": "Master Data Akademik", "items": []string{"faculty.view", "faculty.create", "faculty.update", "faculty.delete", "program_studi.view", "program_studi.create", "program_studi.update", "program_studi.delete", "students.view", "students.create", "students.update", "students.delete"}},
	{"module": "Ormawa", "items": []string{
		"ormawa.view", "ormawa.create", "ormawa.update", "ormawa.delete",
		"ormawa.members.view", "ormawa.members.create", "ormawa.members.update", "ormawa.members.delete", "ormawa.members.manage",
		"ormawa.events.view", "ormawa.events.create", "ormawa.events.update", "ormawa.events.delete", "ormawa.events.manage",
		"ormawa.finance.view", "ormawa.finance.create", "ormawa.finance.update", "ormawa.finance.delete", "ormawa.finance.manage",
		"ormawa.proposals.view", "ormawa.proposals.create", "ormawa.proposals.update", "ormawa.proposals.delete", "ormawa.proposals.manage",
		"ormawa.lpj.view", "ormawa.lpj.create", "ormawa.lpj.update", "ormawa.lpj.delete", "ormawa.lpj.manage",
		"ormawa.announcements.view", "ormawa.announcements.create", "ormawa.announcements.update", "ormawa.announcements.delete", "ormawa.announcements.manage",
		"ormawa.aspirations.view", "ormawa.aspirations.create", "ormawa.aspirations.update", "ormawa.aspirations.delete", "ormawa.aspirations.manage",
		"ormawa.recruitment.view", "ormawa.recruitment.create", "ormawa.recruitment.update", "ormawa.recruitment.delete", "ormawa.recruitment.manage",
	}},
	{"module": "Layanan Mahasiswa", "items": []string{
		"student.dashboard.view", "student.profile.update",
		"achievement.view", "achievement.create", "achievement.update", "achievement.delete", "achievement.verify",
		"scholarship.view", "scholarship.create", "scholarship.update", "scholarship.delete", "scholarship.manage",
		"aspiration.view", "aspiration.create", "aspiration.update", "aspiration.delete", "aspiration.update_status",
		"letters.view", "letters.create", "letters.update", "letters.delete", "letters.manage",
		"health.view", "health.create", "health.update", "health.delete",
	}},
	{"module": "Konseling Psikolog", "items": []string{
		"psychologist.view", "psychologist.create", "psychologist.update", "psychologist.delete", "psychologist.manage",
		"psychologist.bookings.view", "psychologist.bookings.create", "psychologist.bookings.update", "psychologist.bookings.delete",
		"psychologist.medical_records.view", "psychologist.medical_records.create", "psychologist.medical_records.update", "psychologist.medical_records.delete",
		"psychologist.referrals.view", "psychologist.referrals.create", "psychologist.referrals.update", "psychologist.referrals.delete", "psychologist.referrals.manage",
		"psychologist.schedules.view", "psychologist.schedules.create", "psychologist.schedules.update", "psychologist.schedules.delete", "psychologist.schedules.manage",
		"psychologist.reports.view", "psychologist.reports.create", "psychologist.reports.update", "psychologist.reports.delete", "psychologist.reports.manage",
	}},
	{"module": "Kencana Mahasiswa", "items": []string{"kencana.student.dashboard", "kencana.student.timeline", "kencana.student.session", "kencana.student.quiz", "kencana.student.assignment", "kencana.student.handbook", "kencana.student.attendance", "kencana.student.score", "kencana.student.remedial", "kencana.student.certificate", "kencana.student.mentor_invitations"}},
	{"module": "Kencana Admin Universitas", "items": []string{"kencana.period.view", "kencana.period.create", "kencana.period.update", "kencana.stage.view", "kencana.stage.create", "kencana.stage.update", "kencana.session.view", "kencana.session.create", "kencana.session.update", "kencana.material.create", "kencana.quiz.create", "kencana.quiz.update", "kencana.question.create", "kencana.question.update", "kencana.assignment.create", "kencana.participants.view", "kencana.scores.view", "kencana.remedial.create", "kencana.certificate.generate", "kencana.mentor.university.manage", "kencana.mentor.assignment.override"}},
	{"module": "Kencana Admin Fakultas", "items": []string{"kencana.faculty.dashboard", "kencana.faculty.participants.view", "kencana.faculty.scores.view", "kencana.faculty.stages.view", "kencana.faculty.mentor.manage", "kencana.faculty.attendance.review", "kencana.faculty.handbook.review"}},
	{"module": "Dewan Pembimbing Kencana", "items": []string{"kencana.mentor.dashboard", "kencana.mentor.available_students", "kencana.mentor.invite", "kencana.mentor.students.view", "kencana.mentor.student_progress", "kencana.mentor.student_score", "kencana.mentor.student_attendance", "kencana.mentor.student_handbook", "kencana.mentor.notes.create", "kencana.mentor.score_items.create", "kencana.mentor.profile.update"}},
}

var defaultRBACRoles = []models.RBACRole{
	{Key: "super_admin", Label: "Super Admin", Description: "Otoritas penuh untuk seluruh modul dan pengaturan sistem.", IsSystem: true, Status: "active", Permissions: mustJSON([]string{"*"})},
	{Key: "faculty_admin", Label: "Admin Fakultas", Description: "Mengelola data akademik dan mahasiswa dalam scope fakultas.", IsSystem: true, Status: "active", Permissions: mustJSON([]string{"faculty.view", "program_studi.view", "students.view", "students.create", "students.update", "achievement.verify"})},
	{Key: "ormawa_admin", Label: "Admin Ormawa", Description: "Mengelola organisasi mahasiswa dan proposal kegiatan.", IsSystem: true, Status: "active", Permissions: mustJSON([]string{
		"ormawa.view",
		"ormawa.members.view", "ormawa.members.create", "ormawa.members.update", "ormawa.members.delete", "ormawa.members.manage",
		"ormawa.events.view", "ormawa.events.create", "ormawa.events.update", "ormawa.events.delete", "ormawa.events.manage",
		"ormawa.proposals.view", "ormawa.proposals.create", "ormawa.proposals.update", "ormawa.proposals.delete", "ormawa.proposals.manage",
		"ormawa.lpj.view", "ormawa.lpj.create", "ormawa.lpj.update", "ormawa.lpj.delete", "ormawa.lpj.manage",
		"ormawa.recruitment.view", "ormawa.recruitment.create", "ormawa.recruitment.update", "ormawa.recruitment.delete", "ormawa.recruitment.manage",
	})},
	{Key: "ormawa", Label: "Pengurus Ormawa", Description: "Akses operasional internal organisasi mahasiswa.", IsSystem: true, Status: "active", Permissions: mustJSON([]string{
		"ormawa.events.view", "ormawa.events.create", "ormawa.events.update", "ormawa.events.delete", "ormawa.events.manage",
		"ormawa.proposals.view", "ormawa.proposals.create", "ormawa.proposals.update", "ormawa.proposals.delete", "ormawa.proposals.manage",
		"ormawa.announcements.view", "ormawa.announcements.create", "ormawa.announcements.update", "ormawa.announcements.delete", "ormawa.announcements.manage",
	})},
	{Key: "mahasiswa", Label: "Mahasiswa", Description: "Akses layanan mandiri mahasiswa termasuk Kencana mahasiswa.", IsSystem: true, Status: "active", Permissions: mustJSON([]string{"student.dashboard.view", "student.profile.update", "kencana.student.dashboard", "kencana.student.timeline", "kencana.student.session", "kencana.student.quiz", "kencana.student.assignment", "kencana.student.handbook", "kencana.student.attendance", "kencana.student.score", "kencana.student.remedial", "kencana.student.certificate", "kencana.student.mentor_invitations"})},
	{Key: "psikolog", Label: "Psikolog", Description: "Mengelola layanan konseling dan rekam interaksi psikologis.", IsSystem: true, Status: "active", Permissions: mustJSON([]string{
		"psychologist.bookings.view", "psychologist.bookings.create", "psychologist.bookings.update", "psychologist.bookings.delete",
		"psychologist.medical_records.view", "psychologist.medical_records.create", "psychologist.medical_records.update", "psychologist.medical_records.delete",
		"psychologist.referrals.view", "psychologist.referrals.create", "psychologist.referrals.update", "psychologist.referrals.delete", "psychologist.referrals.manage",
		"psychologist.schedules.view", "psychologist.schedules.create", "psychologist.schedules.update", "psychologist.schedules.delete", "psychologist.schedules.manage",
		"psychologist.reports.view", "psychologist.reports.create", "psychologist.reports.update", "psychologist.reports.delete", "psychologist.reports.manage",
	})},
	{Key: "kencana_admin", Label: "Admin Kencana Universitas", Description: "Mengelola Kencana level universitas, periode, timeline, quiz, mentor universitas, remedial, dan sertifikat.", IsSystem: true, Status: "active", Permissions: mustJSON([]string{"kencana.period.view", "kencana.period.create", "kencana.period.update", "kencana.stage.view", "kencana.stage.create", "kencana.stage.update", "kencana.session.view", "kencana.session.create", "kencana.session.update", "kencana.material.create", "kencana.quiz.create", "kencana.quiz.update", "kencana.question.create", "kencana.question.update", "kencana.assignment.create", "kencana.participants.view", "kencana.scores.view", "kencana.remedial.create", "kencana.certificate.generate", "kencana.mentor.university.manage", "kencana.mentor.assignment.override"})},
	{Key: "kencana_fakultas", Label: "Admin Kencana Fakultas", Description: "Mengelola Kencana dalam scope fakultas.", IsSystem: true, Status: "active", Permissions: mustJSON([]string{"kencana.faculty.dashboard", "kencana.faculty.participants.view", "kencana.faculty.scores.view", "kencana.faculty.stages.view", "kencana.faculty.mentor.manage", "kencana.faculty.attendance.review", "kencana.faculty.handbook.review"})},
	{Key: "kencana_mentor", Label: "Dewan Pembimbing Kencana", Description: "Mendampingi mahasiswa Kencana, mengundang mahasiswa, mencatat progress, dan memberi nilai afektif/psikomotor.", IsSystem: true, Status: "active", Permissions: mustJSON([]string{"kencana.mentor.dashboard", "kencana.mentor.available_students", "kencana.mentor.invite", "kencana.mentor.students.view", "kencana.mentor.student_progress", "kencana.mentor.student_score", "kencana.mentor.student_attendance", "kencana.mentor.student_handbook", "kencana.mentor.notes.create", "kencana.mentor.score_items.create", "kencana.mentor.profile.update"})},
}

func mustJSON(v any) []byte {
	b, _ := json.Marshal(v)
	return b
}

func ensureDefaultRBACRoles(db *gorm.DB) {
	for _, role := range defaultRBACRoles {
		var existing models.RBACRole
		if err := db.Where("key = ?", role.Key).First(&existing).Error; err == gorm.ErrRecordNotFound {
			db.Create(&role)
		} else {
			if existing.IsSystem {
				db.Model(&existing).Update("permissions", role.Permissions)
			}
		}
	}
}

func GetUsers(c *fiber.Ctx) error {
	type UserWithContext struct {
		models.User
		FakultasNama     string `json:"fakultas_nama"`
		IdentityName     string `json:"identity_name"`
		IdentityCode     string `json:"identity_code"`
		ProdiNama        string `json:"prodi_nama"`
		OrmawaNama       string `json:"ormawa_nama"`
		FotoURL          string `json:"foto_url"`
		KencanaScopeType string `json:"kencana_scope_type"`
	}

	var results []UserWithContext
	// Hardened SQL join with explicit quoting for PostgreSQL schema/table/column resolution
	err := config.DB.Table("public.users").
		Select(`
			"public"."users".*, 
			f.nama as fakultas_nama,
			COALESCE(m.nama, d.nama, ps.nama, km.name, tk.nama) as identity_name,
			COALESCE(m.nim, d.n_id_n) as identity_code,
			p.nama as prodi_nama,
			km.scope_type as kencana_scope_type,
			COALESCE(m.foto_url, tk.foto_url, '') as foto_url,
			(SELECT orm.nama FROM ormawa.ormawa_anggota oa 
			 JOIN ormawa.ormawa orm ON orm.id = oa.ormawa_id 
			 WHERE oa.mahasiswa_id = m.id LIMIT 1) as ormawa_nama
		`).
		Joins(`LEFT JOIN "fakultas"."fakultas" f ON f.id = "public"."users".fakultas_id`).
		Joins(`LEFT JOIN "mahasiswa"."mahasiswa" m ON m.pengguna_id = "public"."users".id`).
		Joins(`LEFT JOIN "fakultas"."program_studi" p ON p.id = COALESCE(m.program_studi_id, "public"."users".program_studi_id)`).
		Joins(`LEFT JOIN "fakultas"."dosen" d ON d.pengguna_id = "public"."users".id`).
		Joins(`LEFT JOIN "psikolog"."profiles" ps ON ps.user_id = "public"."users".id`).
		Joins(`LEFT JOIN "mahasiswa"."kencana_mentors" km ON km.user_id = "public"."users".id`).
		Joins(`LEFT JOIN "public"."tenaga_kesehatan" tk ON tk.user_id = "public"."users".id`).
		Where(`"public"."users".deleted_at IS NULL`).
		Order(`"public"."users".created_at desc`).
		Scan(&results).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal sinkronisasi data identitas: " + err.Error()})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   results,
	})
}

func isAllowedRBACRole(role string) bool {
	ensureDefaultRBACRoles(config.DB)
	parts := strings.Split(role, ",")
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		var count int64
		config.DB.Model(&models.RBACRole{}).Where("key = ? AND status = ?", p, "active").Count(&count)
		if count > 0 {
			continue
		}
		switch p {
		case "super_admin", "faculty_admin", "prodi_admin", "ormawa_admin", "ormawa", "mahasiswa", "psikolog", "PSIKOLOG", "dosen", "DOSEN", "kencana_admin", "kencana_fakultas", "kencana_mentor", "tenaga_kesehatan", "tenagakes":
			// allowed
		default:
			return false
		}
	}
	return true
}

func GetRBACRoles(c *fiber.Ctx) error {
	ensureDefaultRBACRoles(config.DB)
	var roles []models.RBACRole
	if err := config.DB.Order("is_system desc, key asc").Find(&roles).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memuat role RBAC"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": fiber.Map{"roles": roles, "catalog": rbacPermissionCatalog}})
}

func CreateRBACRole(c *fiber.Ctx) error {
	type reqBody struct {
		Key         string   `json:"key"`
		Label       string   `json:"label"`
		Description string   `json:"description"`
		Permissions []string `json:"permissions"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload role tidak valid"})
	}
	req.Key = strings.ToLower(strings.TrimSpace(req.Key))
	req.Label = strings.TrimSpace(req.Label)
	if req.Key == "" || req.Label == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Role key dan label wajib diisi"})
	}
	role := models.RBACRole{Key: req.Key, Label: req.Label, Description: req.Description, Permissions: mustJSON(req.Permissions), Status: "active", IsSystem: false}
	if err := config.DB.Create(&role).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Gagal membuat role: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Role RBAC berhasil dibuat", "data": role})
}

func UpdateRBACRole(c *fiber.Ctx) error {
	type reqBody struct {
		Label       string   `json:"label"`
		Description string   `json:"description"`
		Permissions []string `json:"permissions"`
		Status      string   `json:"status"`
	}
	var req reqBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload role tidak valid"})
	}
	var role models.RBACRole
	if err := config.DB.First(&role, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Role tidak ditemukan"})
	}
	if strings.TrimSpace(req.Label) != "" {
		role.Label = strings.TrimSpace(req.Label)
	}
	role.Description = req.Description
	role.Permissions = mustJSON(req.Permissions)
	if req.Status == "inactive" || req.Status == "active" {
		role.Status = req.Status
	}
	if err := config.DB.Save(&role).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan role"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Permission role berhasil disimpan", "data": role})
}

func DeleteRBACRole(c *fiber.Ctx) error {
	var role models.RBACRole
	if err := config.DB.First(&role, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Role tidak ditemukan"})
	}
	if role.IsSystem {
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Role sistem tidak dapat dihapus"})
	}
	// Cek apakah ada user yang masih menggunakan role ini
	var userCount int64
	config.DB.Model(&models.User{}).Where("role LIKE ?", "%"+role.Key+"%").Count(&userCount)
	if userCount > 0 {
		return c.Status(409).JSON(fiber.Map{
			"status":  "error",
			"message": "Role masih digunakan oleh " + fmt.Sprintf("%d", userCount) + " pengguna. Reassign terlebih dahulu sebelum menghapus.",
		})
	}
	if err := config.DB.Delete(&role).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus role"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Role berhasil dihapus"})
}

func normalizeKencanaScope(scope string) string {
	if strings.TrimSpace(scope) == "university" {
		return "university"
	}
	return "faculty"
}

// UpdateUserRole handles role assignment with RBAC hierarchy validation
func UpdateUserRole(c *fiber.Ctx) error {
	type UpdateRequest struct {
		UserID           uint   `json:"userId"`
		Role             string `json:"role"`
		OrmawaID         uint   `json:"ormawaId"`
		OrmawaAssign     string `json:"ormawaAssign"`
		FakultasID       uint   `json:"fakultasId"`
		ProgramStudiID   uint   `json:"prodiId"`
		KencanaScopeType string `json:"kencanaScopeType"`
		Reason           string `json:"reason"`
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request payload"})
	}

	// 1. Validate request
	if req.UserID == 0 || req.Role == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "userId dan role wajib diisi"})
	}

	// 2. Get assigner info from JWT
	assignerID := c.Locals("user_id").(uint)
	assignerRole := c.Locals("role").(string)

	// 3. Find target user
	var targetUser models.User
	if err := config.DB.First(&targetUser, req.UserID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "User tidak ditemukan"})
	}

	req.Role = strings.TrimSpace(req.Role)
	req.KencanaScopeType = normalizeKencanaScope(req.KencanaScopeType)

	// 4. Validate role exists
	if !isAllowedRBACRole(req.Role) {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Role tidak valid: " + req.Role})
	}

	// ==========================================
	// ROLE HIERARCHY VALIDATION
	// ==========================================
	
	// 5. Super Admin validations
	if assignerRole == "super_admin" {
		// Super Admin CANNOT assign org-level roles directly
		// pengurus_ormawa harus di-assign via admin_ormawa
		if req.Role == "pengurus_ormawa" {
			return c.Status(403).JSON(fiber.Map{
				"status":  "error",
				"message": "Super Admin tidak boleh assign 'pengurus_ormawa' langsung. Role ini harus di-assign oleh admin_ormawa.",
			})
		}
		
		// Super Admin CANNOT assign admin_prodi directly
		// admin_prodi harus di-assign via admin_fakultas
		if req.Role == "admin_prodi" && req.FakultasID == 0 {
			return c.Status(403).JSON(fiber.Map{
				"status":  "error",
				"message": "Super Admin tidak boleh assign 'admin_prodi' tanpa scope. Gunakan admin_fakultas untuk assign role ini.",
			})
		}
	}

	// 6. Admin Ormawa validations
	if assignerRole == "admin_ormawa" {
		// Admin Ormawa ONLY dapat assign pengurus_ormawa
		if req.Role != "pengurus_ormawa" {
			return c.Status(403).JSON(fiber.Map{
				"status":  "error",
				"message": "Admin Ormawa hanya boleh assign 'pengurus_ormawa'",
			})
		}

		// Admin Ormawa harus punya OrmawaID
		if req.OrmawaID == 0 {
			return c.Status(400).JSON(fiber.Map{
				"status":  "error",
				"message": "OrmawaID wajib untuk Admin Ormawa assignment",
			})
		}

		// Verify target user adalah member di ormawa yang sama
		var mhs models.Mahasiswa
		if err := config.DB.Where("pengguna_id = ?", targetUser.ID).First(&mhs).Error; err != nil {
			return c.Status(400).JSON(fiber.Map{
				"status":  "error",
				"message": "Target user tidak memiliki profile mahasiswa",
			})
		}

		var membership models.OrmawaAnggota
		if err := config.DB.Where("mahasiswa_id = ? AND ormawa_id = ?", mhs.ID, req.OrmawaID).First(&membership).Error; err != nil {
			return c.Status(403).JSON(fiber.Map{
				"status":  "error",
				"message": "Target user bukan member di ormawa ini",
			})
		}
	}

	// 7. Admin Fakultas validations
	if assignerRole == "admin_fakultas" {
		// Admin Fakultas hanya bisa assign admin_prodi
		allowedRoles := map[string]bool{"admin_prodi": true}
		if !allowedRoles[req.Role] {
			return c.Status(403).JSON(fiber.Map{
				"status":  "error",
				"message": "Admin Fakultas hanya boleh assign 'admin_prodi'",
			})
		}

		// Admin Fakultas harus select FakultasID
		if req.FakultasID == 0 {
			return c.Status(400).JSON(fiber.Map{
				"status":  "error",
				"message": "FakultasID wajib untuk Admin Fakultas assignment",
			})
		}
	}

	// 8. Validate required fields berdasarkan role
	roleLower := "," + strings.ToLower(req.Role) + ","
	if strings.Contains(roleLower, ",kencana_fakultas,") && req.FakultasID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Fakultas wajib dipilih untuk role kencana_fakultas"})
	}
	if strings.Contains(roleLower, ",kencana_mentor,") && req.KencanaScopeType == "faculty" && req.FakultasID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Fakultas wajib dipilih untuk Mentor Kencana scope fakultas"})
	}

	// 9. Check role conflict
	newRoles := strings.Split(req.Role, ",")
	
	if hasRoleConflict(newRoles) {
		return c.Status(400).JSON(fiber.Map{
			"status":  "error",
			"message": "Kombinasi role tidak valid",
		})
	}

	// 10. Execute role assignment
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		var fakultasPtr *uint
		if req.FakultasID != 0 {
			fakultasPtr = &req.FakultasID
		}

		var ormawaPtr *uint
		if req.OrmawaID != 0 {
			ormawaPtr = &req.OrmawaID
		}

		var prodiPtr *uint
		if req.ProgramStudiID != 0 {
			prodiPtr = &req.ProgramStudiID
		}

		// Join new roles properly without duplicates
		uniqueRoles := make(map[string]bool)
		var finalRoles []string
		for _, r := range newRoles {
			r = strings.TrimSpace(r)
			if r != "" && !uniqueRoles[r] {
				uniqueRoles[r] = true
				finalRoles = append(finalRoles, r)
			}
		}
		finalRoleStr := strings.Join(finalRoles, ",")

		// Update user role via raw SQL to bypass any GORM association issues
		if err := tx.Exec("UPDATE public.users SET role = ?, ormawa_assign = ?, ormawa_id = ?, fakultas_id = ?, program_studi_id = ?, updated_at = ? WHERE id = ?", finalRoleStr, req.OrmawaAssign, ormawaPtr, fakultasPtr, prodiPtr, time.Now(), targetUser.ID).Error; err != nil {
			return err
		}

		// Handle Kencana Mentor
		if strings.Contains(roleLower, ",kencana_mentor,") {
			mentor := models.KencanaMentor{
				UserID:    targetUser.ID,
				Name:      strings.Split(targetUser.Email, "@")[0],
				Email:     targetUser.Email,
				ScopeType: req.KencanaScopeType,
				Status:    "active",
			}
			if fakultasPtr != nil {
				mentor.FakultasID = fakultasPtr
			}

			var existing models.KencanaMentor
			if err := tx.Where("user_id = ?", targetUser.ID).First(&existing).Error; err == nil {
				existing.ScopeType = req.KencanaScopeType
				existing.FakultasID = fakultasPtr
				existing.Status = "active"
				if err := tx.Save(&existing).Error; err != nil {
					return err
				}
			} else if err == gorm.ErrRecordNotFound {
				if err := tx.Create(&mentor).Error; err != nil {
					return err
				}
			}
		}

		// Handle Ormawa roles
		if strings.Contains(roleLower, ",ormawa_admin,") || strings.Contains(roleLower, ",mahasiswa,") || strings.Contains(roleLower, ",ormawa,") || strings.Contains(roleLower, ",pengurus_ormawa,") {
			var mhs models.Mahasiswa
			err := tx.Where("pengguna_id = ?", targetUser.ID).First(&mhs).Error
			if err == gorm.ErrRecordNotFound {
				nim := strings.Split(targetUser.Email, "@")[0]
				mhs = models.Mahasiswa{
					PenggunaID:       targetUser.ID,
					Nama:             strings.Split(targetUser.Email, "@")[0],
					NIM:              nim,
					FakultasID:       req.FakultasID,
					StatusAkun:       "Aktif",
					StatusAkademik:   "Aktif",
					SemesterSekarang: 1,
					TahunMasuk:       time.Now().Year(),
				}
				if err := tx.Create(&mhs).Error; err != nil {
					return err
				}
			} else if err != nil {
				return err
			}

		// Link to Ormawa
			if req.OrmawaID != 0 && (strings.Contains(roleLower, ",ormawa_admin,") || strings.Contains(roleLower, ",ormawa,") || strings.Contains(roleLower, ",pengurus_ormawa,")) {
				var exists bool
				tx.Raw("SELECT EXISTS(SELECT 1 FROM ormawa.ormawa_anggota WHERE mahasiswa_id = ? AND ormawa_id = ?)", mhs.ID, req.OrmawaID).Scan(&exists)
				if !exists {
					if err := tx.Exec(
						"INSERT INTO ormawa.ormawa_anggota (mahasiswa_id, ormawa_id, role, status, joined_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
						mhs.ID, req.OrmawaID, "Ketua/Admin", "aktif", time.Now(), time.Now(), time.Now(),
					).Error; err != nil {
						return fmt.Errorf("failed to link user to ormawa: %w", err)
					}
				}
			}
		}

		// Handle Psikolog
		if strings.Contains(roleLower, ",psikolog,") {
			var psikolog models.Psikolog
			err := tx.Where("user_id = ?", targetUser.ID).First(&psikolog).Error
			if err == gorm.ErrRecordNotFound {
				psikolog = models.Psikolog{
					UserID:       targetUser.ID,
					Nama:         strings.Split(targetUser.Email, "@")[0],
					Email:        targetUser.Email,
					Spesialisasi: "Umum",
					IsAktif:      true,
				}
				if err := tx.Create(&psikolog).Error; err != nil {
					return fmt.Errorf("failed to create psikolog profile: %w", err)
				}
			}
		}

		// Handle Tenaga Kesehatan
		if strings.Contains(roleLower, ",tenaga_kesehatan,") || strings.Contains(roleLower, ",tenagakes,") {
			var tk models.TenagaKesehatan
			err := tx.Where("user_id = ?", targetUser.ID).First(&tk).Error
			if err == gorm.ErrRecordNotFound {
				tk = models.TenagaKesehatan{
					UserID:       targetUser.ID,
					Nama:         strings.Split(targetUser.Email, "@")[0],
					Email:        targetUser.Email,
					NoHP:         "-",
					Spesialisasi: "Pemeriksaan Umum",
					FotoURL:      "",
					Lokasi:       "Klinik Kampus BKU",
					IsAktif:      true,
				}
				if err := tx.Create(&tk).Error; err != nil {
					return fmt.Errorf("failed to create tenaga kesehatan profile: %w", err)
				}
			}
		}

		// Log audit trail
		audit := models.LogAktivitas{
			UserID:     assignerID,
			Aktivitas:  "ROLE_ASSIGNMENT",
			Deskripsi:  fmt.Sprintf("Assign role %s to user %s (%d)", req.Role, targetUser.Email, req.UserID),
			IPAddress:  c.IP(),
		}
		// Gunakan config.DB agar error tidak merusak scope tx utama jika tidak fatal
		if err := config.DB.Create(&audit).Error; err != nil {
			fmt.Printf("Warning: Failed to create audit log: %v\n", err)
		}

		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Role assignment failed: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": fmt.Sprintf("Role %s berhasil di-assign ke %s", req.Role, targetUser.Email),
		"data": fiber.Map{
			"user_id":  req.UserID,
			"email":    targetUser.Email,
			"new_role": req.Role,
		},
	})
}

// hasRoleConflict mengecek kombinasi role yang tidak valid
func hasRoleConflict(roles []string) bool {
	roleMap := make(map[string]bool)
	for _, r := range roles {
		roleMap[strings.ToLower(strings.TrimSpace(r))] = true
	}

	// Define invalid combinations
	invalidCombinations := [][]string{
		{"super_admin", "mahasiswa"},
		{"super_admin", "dosen"},
		{"super_admin", "psikolog"},
		{"super_admin", "tenaga_kesehatan"},
		{"admin_ormawa", "admin_fakultas"},
		{"admin_ormawa", "admin_prodi"},
		{"admin_fakultas", "pengurus_ormawa"},
	}

	for _, combo := range invalidCombinations {
		hasFirst := roleMap[combo[0]]
		hasSecond := roleMap[combo[1]]
		if hasFirst && hasSecond {
			return true
		}
	}

	return false
}

// GetAuditLogs returns all historical actions performed in the system
func GetAuditLogs(c *fiber.Ctx) error {
	var logs []models.LogAktivitas
	result := config.DB.Preload("User").Order("created_at desc").Limit(100).Find(&logs)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Database error retrieving logs"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": logs})
}

func CreateUser(c *fiber.Ctx) error {
	type CreateRequest struct {
		Email            string `json:"Email"`
		Password         string `json:"Password"`
		Role             string `json:"Role"`
		Nama             string `json:"Nama"`
		FakultasID       uint   `json:"FakultasID"`
		ProgramStudiID   uint   `json:"ProgramStudiID"`
		OrmawaID         uint   `json:"OrmawaID"`
		OrmawaAssign     string `json:"OrmawaAssign"`
		KencanaScopeType string `json:"KencanaScopeType"`
		Phone            string `json:"Phone"`
	}

	var req CreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}

	if req.Email == "" || req.Password == "" || req.Role == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Email, Password dan Role wajib diisi"})
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Role = strings.TrimSpace(req.Role)
	req.Nama = strings.TrimSpace(req.Nama)
	req.KencanaScopeType = normalizeKencanaScope(req.KencanaScopeType)

	if !isAllowedRBACRole(req.Role) {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Role tidak valid"})
	}

	newRoles := strings.Split(req.Role, ",")
	if hasRoleConflict(newRoles) {
		return c.Status(400).JSON(fiber.Map{
			"status":  "error",
			"message": "Kombinasi role tidak valid (hirarki dilanggar)",
		})
	}

	roleLower := "," + strings.ToLower(req.Role) + ","
	requiresFakultas := false
	if strings.Contains(roleLower, ",faculty_admin,") || strings.Contains(roleLower, ",prodi_admin,") || strings.Contains(roleLower, ",mahasiswa,") || strings.Contains(roleLower, ",ormawa_admin,") || strings.Contains(roleLower, ",ormawa,") || (strings.Contains(roleLower, ",kencana_mentor,") && req.KencanaScopeType == "faculty") {
		requiresFakultas = true
	}

	if requiresFakultas && req.FakultasID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Fakultas wajib dipilih"})
	}
	if strings.Contains(roleLower, ",kencana_fakultas,") && req.FakultasID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Fakultas wajib dipilih untuk Admin Kencana Fakultas"})
	}

	if strings.Contains(roleLower, ",ormawa_admin,") && req.ProgramStudiID != 0 {
		var prodi models.ProgramStudi
		if err := config.DB.First(&prodi, req.ProgramStudiID).Error; err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Program studi tidak valid"})
		}
		if req.FakultasID != 0 && prodi.FakultasID != req.FakultasID {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Program studi tidak sesuai fakultas"})
		}
	}

	if strings.Contains(roleLower, ",mahasiswa,") {
		if req.ProgramStudiID == 0 {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Program studi wajib dipilih untuk mahasiswa"})
		}
	}

	if strings.Contains(roleLower, ",prodi_admin,") {
		if req.ProgramStudiID == 0 {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Program studi wajib dipilih untuk Admin Prodi"})
		}
	}

	// 1. Hash Password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengamankan password"})
	}

	// 2. Begin Transaction
	err = config.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Create User
		user := models.User{
			Email:        req.Email,
			Password:     string(hashedPassword),
			Role:         req.Role,
			OrmawaAssign: req.OrmawaAssign,
		}

		// Set FakultasID for Admin/Faculty roles
		if req.FakultasID != 0 {
			user.FakultasID = &req.FakultasID
		}

		// Set OrmawaID if provided
		if req.OrmawaID != 0 {
			user.OrmawaID = &req.OrmawaID
		}

		if req.ProgramStudiID != 0 {
			user.ProgramStudiID = &req.ProgramStudiID
		}

		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		// 2. Create Identity Link (Mahasiswa/Dosen/etc)
		if strings.Contains(roleLower, ",mahasiswa,") || strings.Contains(roleLower, ",ormawa_admin,") || strings.Contains(roleLower, ",ormawa,") {
			nim := strings.Split(req.Email, "@")[0] // Fallback NIM from email
			mhs := models.Mahasiswa{
				PenggunaID:       user.ID,
				Nama:             req.Nama,
				NIM:              nim,
				FakultasID:       req.FakultasID,
				ProgramStudiID:   req.ProgramStudiID,
				StatusAkun:       "Aktif",
				StatusAkademik:   "Aktif",
				SemesterSekarang: 1,
				TahunMasuk:       time.Now().Year(),
			}
			if err := tx.Create(&mhs).Error; err != nil {
				return err
			}

			// Assign to Ormawa if provided
			if (strings.Contains(roleLower, ",ormawa_admin,") || strings.Contains(roleLower, ",ormawa,")) && req.OrmawaID != 0 {
				tx.Exec("INSERT INTO ormawa.ormawa_anggota (mahasiswa_id, ormawa_id, role, status, joined_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
					mhs.ID, req.OrmawaID, "Ketua/Admin", "aktif", time.Now(), time.Now(), time.Now())
			}
		}

		if strings.Contains(roleLower, ",dosen,") {
			nidn := strings.Split(req.Email, "@")[0]
			dosen := models.Dosen{
				PenggunaID:     user.ID,
				Nama:           req.Nama,
				NIDN:           nidn,
				FakultasID:     req.FakultasID,
				ProgramStudiID: req.ProgramStudiID,
			}
			if err := tx.Create(&dosen).Error; err != nil {
				return err
			}
		}

		if strings.Contains(roleLower, ",psikolog,") {
			psikolog := models.Psikolog{
				UserID:       user.ID,
				Nama:         req.Nama,
				Email:        req.Email,
				Spesialisasi: "Umum", // Default spesialisasi
				IsAktif:      true,
			}
			if err := tx.Create(&psikolog).Error; err != nil {
				return err
			}
		}

		if strings.Contains(roleLower, ",tenaga_kesehatan,") || strings.Contains(roleLower, ",tenagakes,") {
			tk := models.TenagaKesehatan{
				UserID:       user.ID,
				Nama:         req.Nama,
				Email:        req.Email,
				NoHP:         "-",
				Spesialisasi: "Pemeriksaan Umum",
				FotoURL:      "",
				Lokasi:       "Klinik Kampus BKU",
				IsAktif:      true,
			}
			if err := tx.Create(&tk).Error; err != nil {
				return err
			}
		}

		if strings.Contains(roleLower, ",kencana_mentor,") {
			mentor := models.KencanaMentor{
				UserID:    user.ID,
				Name:      req.Nama,
				Email:     req.Email,
				Phone:     req.Phone,
				ScopeType: req.KencanaScopeType,
				Status:    "active",
			}
			if req.KencanaScopeType == "faculty" && req.FakultasID != 0 {
				mentor.FakultasID = &req.FakultasID
			}
			if err := tx.Create(&mentor).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate key") {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Email/NIM/NIDN sudah digunakan"})
		}
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal registrasi akun: " + err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Akun berhasil diregistrasi dengan identitas terhubung"})
}

func DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.User{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to delete user"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "User deleted"})
}

// GetDashboardStats returns high-level metrics for University oversight with optional filters
func GetDashboardStats(c *fiber.Ctx) error {
	periodID := c.QueryInt("period_id", 0)
	tahunMasuk := c.QueryInt("tahun_masuk", 0)
	fakultasID := c.QueryInt("fakultas_id", 0)
	prodiID := c.QueryInt("program_studi_id", 0)
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	var filterStartYear, filterEndYear int
	var hasDateFilter bool
	var filterStartDate, filterEndDate time.Time

	if startDateStr != "" && endDateStr != "" {
		sDate, err1 := time.Parse("2006-01-02", startDateStr)
		eDate, err2 := time.Parse("2006-01-02", endDateStr)
		if err1 == nil && err2 == nil {
			hasDateFilter = true
			filterStartDate = sDate
			filterEndDate = time.Date(eDate.Year(), eDate.Month(), eDate.Day(), 23, 59, 59, 999999999, eDate.Location())
			filterStartYear = sDate.Year()
			filterEndYear = eDate.Year()
		}
	}

	// If period_id is provided, resolve the academic year
	if periodID > 0 {
		var selectedPeriod models.AcademicPeriod
		if err := config.DB.First(&selectedPeriod, periodID).Error; err == nil {
			var year int
			fmt.Sscanf(selectedPeriod.AcademicYear, "%d", &year)
			if year > 0 {
				tahunMasuk = year
			}
		}
	}

	// Base queries
	dbMhs := config.DB.Model(&models.Mahasiswa{})
	dbAsp := config.DB.Model(&models.Aspirasi{})
	dbProp := config.DB.Model(&models.Proposal{})
	dbAnggota := config.DB.Model(&models.OrmawaAnggota{})

	// Joins and Filters
	needMhsJoin := (tahunMasuk > 0) || (fakultasID > 0) || (prodiID > 0) || hasDateFilter

	if needMhsJoin {
		dbAsp = dbAsp.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.aspirasi.mahasiswa_id")
		dbProp = dbProp.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = ormawa.proposal.mahasiswa_id")
		dbAnggota = dbAnggota.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = ormawa.ormawa_anggota.mahasiswa_id")
	}

	if hasDateFilter {
		dbMhs = dbMhs.Where("mahasiswa.mahasiswa.tahun_masuk BETWEEN ? AND ?", filterStartYear, filterEndYear)
		dbAsp = dbAsp.Where("mahasiswa.aspirasi.created_at BETWEEN ? AND ?", filterStartDate, filterEndDate)
		dbProp = dbProp.Where("ormawa.proposal.created_at BETWEEN ? AND ?", filterStartDate, filterEndDate)
		dbAnggota = dbAnggota.Where("mahasiswa.mahasiswa.tahun_masuk BETWEEN ? AND ?", filterStartYear, filterEndYear)
	} else if tahunMasuk > 0 {
		dbMhs = dbMhs.Where("mahasiswa.mahasiswa.tahun_masuk = ?", tahunMasuk)
		dbAsp = dbAsp.Where("mahasiswa.mahasiswa.tahun_masuk = ?", tahunMasuk)
		dbProp = dbProp.Where("mahasiswa.mahasiswa.tahun_masuk = ?", tahunMasuk)
		dbAnggota = dbAnggota.Where("mahasiswa.mahasiswa.tahun_masuk = ?", tahunMasuk)
	}

	if fakultasID > 0 {
		dbMhs = dbMhs.Where("mahasiswa.mahasiswa.fakultas_id = ?", fakultasID)
		dbAsp = dbAsp.Where("mahasiswa.mahasiswa.fakultas_id = ?", fakultasID)
		dbProp = dbProp.Where("ormawa.proposal.fakultas_id = ?", fakultasID)
		dbAnggota = dbAnggota.Where("mahasiswa.mahasiswa.fakultas_id = ?", fakultasID)
	}

	if prodiID > 0 {
		dbMhs = dbMhs.Where("mahasiswa.mahasiswa.program_studi_id = ?", prodiID)
		dbAsp = dbAsp.Where("mahasiswa.mahasiswa.program_studi_id = ?", prodiID)
		dbProp = dbProp.Where("mahasiswa.mahasiswa.program_studi_id = ?", prodiID)
		dbAnggota = dbAnggota.Where("mahasiswa.mahasiswa.program_studi_id = ?", prodiID)
	}

	var totalMhs int64
	var aspirasiAktif int64
	var slaOverdue int64
	var resolvedToday int64
	var antreanProposal int64
	var totalAnggotaOrmawa int64

	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	dbMhs.Session(&gorm.Session{}).Count(&totalMhs)
	dbAsp.Session(&gorm.Session{}).Where("mahasiswa.aspirasi.status != ?", "Selesai").Count(&aspirasiAktif)
	dbAsp.Session(&gorm.Session{}).Where("mahasiswa.aspirasi.status != ? AND mahasiswa.aspirasi.deadline < ?", "Selesai", now).Count(&slaOverdue)
	dbAsp.Session(&gorm.Session{}).Where("mahasiswa.aspirasi.status = ? AND mahasiswa.aspirasi.updated_at >= ?", "Selesai", todayStart).Count(&resolvedToday)
	dbProp.Session(&gorm.Session{}).Where("ormawa.proposal.status = ?", "disetujui_fakultas").Count(&antreanProposal)
	dbAnggota.Session(&gorm.Session{}).Count(&totalAnggotaOrmawa)

	// Fetch dynamic list of available Tahun Masuk for the filter dropdown
	var tahunMasukList []int
	config.DB.Model(&models.Mahasiswa{}).Distinct("tahun_masuk").Order("tahun_masuk desc").Pluck("tahun_masuk", &tahunMasukList)

	// Fetch all Academic Periods
	var periods []models.AcademicPeriod
	config.DB.Order("id desc").Find(&periods)

	// Fetch detailed listings for drill down
	var detailMhs []models.Mahasiswa
	dbMhs.Session(&gorm.Session{}).Preload("Fakultas").Preload("ProgramStudi").Limit(100).Find(&detailMhs)

	var detailAsp []models.Aspirasi
	dbAsp.Session(&gorm.Session{}).Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").Limit(100).Find(&detailAsp)

	var detailProp []models.Proposal
	dbProp.Session(&gorm.Session{}).Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").Preload("Ormawa").Limit(100).Find(&detailProp)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"total_mahasiswa":      totalMhs,
			"aspirasi_aktif":       aspirasiAktif,
			"sla_overdue":          slaOverdue,
			"resolved_today":       resolvedToday,
			"antrean_proposal":     antreanProposal,
			"total_anggota_ormawa": totalAnggotaOrmawa,
			"tahun_masuk_list":     tahunMasukList,
			"periods":              periods,
			"detail_mahasiswa":     detailMhs,
			"detail_aspirasi":      detailAsp,
			"detail_proposal":      detailProp,
		},
	})
}

// GetGlobalProposals returns proposals waiting for university approval
func GetGlobalProposals(c *fiber.Ctx) error {
	var proposals []models.Proposal
	result := config.DB.Preload("Ormawa").Preload("Fakultas").Where("status = ?", "disetujui_fakultas").Order("created_at desc").Find(&proposals)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": result.Error.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": proposals})
}

// ApproveProposalUniv final approval by university with financial integration
func ApproveProposalUniv(c *fiber.Ctx) error {
	id := c.Params("id")
	var proposal models.Proposal

	// Preload Ormawa for notification and balance update
	if err := config.DB.Preload("Ormawa").First(&proposal, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Proposal not found"})
	}

	// Double check to only approve if it's already approved by faculty
	if proposal.Status != "disetujui_fakultas" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Proposal must be approved by Faculty first"})
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Update status to final
		if err := tx.Model(&proposal).Update("status", "disetujui_univ").Error; err != nil {
			return err
		}

		// Award points to Ormawa: +20
		if err := gamifikasi.AwardOrmawaPoints(tx, proposal.OrmawaID, "proposal_disetujui", 20, "tambah", fmt.Sprintf("Proposal disetujui Universitas: %s", proposal.Judul)); err != nil {
			return err
		}

		// 2. Create financial mutation (Disbursement)
		mutation := models.OrmawaMutasiSaldo{
			OrmawaID:   proposal.OrmawaID,
			Tipe:       "masuk",
			Nominal:    proposal.Anggaran, // Now using Anggaran field from proposal
			Kategori:   "Pencairan Proposal",
			Deskripsi:  fmt.Sprintf("Pencairan dana Universitas untuk kegiatan: %s", proposal.Judul),
			ProposalID: &proposal.ID,
			Tanggal:    time.Now(),
		}
		if err := tx.Create(&mutation).Error; err != nil {
			return err
		}

		// 3. Create Notification for Ormawa
		tx.Create(&models.OrmawaNotifikasi{
			OrmawaID: proposal.OrmawaID,
			Tipe:     "proposal",
			Judul:    "Dana Disyahkan Universitas",
			Pesan:    fmt.Sprintf("Proposal '%s' telah disetujui Universitas. Anggaran %v telah dicairkan ke kas organisasi.", proposal.Judul, proposal.Anggaran),
		})

		// 4. Ensure draft LPJ exists
		var lpjCount int64
		if err := tx.Model(&models.LaporanPertanggungjawaban{}).Where("proposal_id = ?", proposal.ID).Count(&lpjCount).Error; err == nil && lpjCount == 0 {
			lpj := models.LaporanPertanggungjawaban{
				ProposalID:        proposal.ID,
				RealisasiAnggaran: 0,
				Status:            "draft",
				Catatan:           "LPJ otomatis di-draft setelah proposal disetujui Universitas.",
			}
			if err := tx.Create(&lpj).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memproses pengesahan & pencairan: " + err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Proposal has been officially approved & funds disbursed"})
}

// RejectProposalUniv rejection with note and notification
func RejectProposalUniv(c *fiber.Ctx) error {
	id := c.Params("id")
	type RejectReq struct {
		Catatan string `json:"catatan"`
	}
	var req RejectReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Body request tidak valid"})
	}

	var proposal models.Proposal
	if err := config.DB.First(&proposal, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Proposal not found"})
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// Update status and note
		updates := map[string]interface{}{
			"status":  "revisi", // Changed from 'ditolak' to 'revisi' to follow standard flow
			"catatan": req.Catatan,
		}

		if err := tx.Model(&proposal).Updates(updates).Error; err != nil {
			return err
		}

		// Create Notification for Ormawa
		tx.Create(&models.OrmawaNotifikasi{
			OrmawaID: proposal.OrmawaID,
			Tipe:     "proposal",
			Judul:    "Proposal Dikembalikan Univ",
			Pesan:    fmt.Sprintf("Proposal '%s' membutuhkan revisi dari Universitas: %s", proposal.Judul, req.Catatan),
		})

		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memproses penolakan: " + err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Proposal has been sent back for revision"})
}

// GetAllFakultas master data
func GetAllFakultas(c *fiber.Ctx) error {
	var faks []models.Fakultas
	if err := config.DB.Preload("ProgramStudi").Find(&faks).Error; err != nil {
		fmt.Printf("[ERROR] GetAllFakultas: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data Fakultas: " + err.Error()})
	}

	type FacultyWithCount struct {
		models.Fakultas
		JumlahProdi int `json:"jumlah_prodi"`
	}

	var result []FacultyWithCount
	for _, f := range faks {
		result = append(result, FacultyWithCount{
			Fakultas:    f,
			JumlahProdi: len(f.ProgramStudi),
		})
	}

	return c.JSON(fiber.Map{"status": "success", "data": result})
}

func CreateFakultas(c *fiber.Ctx) error {
	var fak models.Fakultas
	if err := c.BodyParser(&fak); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	if err := config.DB.Create(&fak).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": fak})
}

func UpdateFakultas(c *fiber.Ctx) error {
	id := c.Params("id")
	var fak models.Fakultas
	if err := config.DB.First(&fak, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Fakultas not found"})
	}
	var req struct {
		Nama string `json:"nama"`
		Kode string `json:"kode"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}
	if req.Nama != "" {
		fak.Nama = req.Nama
	}
	if req.Kode != "" {
		fak.Kode = req.Kode
	}
	config.DB.Save(&fak)
	return c.JSON(fiber.Map{"status": "success", "data": fak})
}

func DeleteFakultas(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Fakultas{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Fakultas deleted"})
}

func GetAllOrmawa(c *fiber.Ctx) error {
	var orgs []struct {
		models.Ormawa
		JumlahAnggota int64 `json:"jumlah_anggota"`
	}

	var baseOrgs []models.Ormawa
	if err := config.DB.Order("nama asc").Find(&baseOrgs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	for _, o := range baseOrgs {
		var count int64
		config.DB.Model(&models.OrmawaAnggota{}).Where("ormawa_id = ?", o.ID).Count(&count)
		orgs = append(orgs, struct {
			models.Ormawa
			JumlahAnggota int64 `json:"jumlah_anggota"`
		}{o, count})
	}

	return c.JSON(fiber.Map{"status": "success", "data": orgs})
}

func GetAllStudents(c *fiber.Ctx) error {
	var mhs []models.Mahasiswa
	config.DB.Preload("Fakultas").Preload("ProgramStudi").Order("nama asc").Find(&mhs)
	return c.JSON(fiber.Map{"status": "success", "data": mhs})
}

func GetAllPsychologists(c *fiber.Ctx) error {
	var psychologists []models.Psikolog
	config.DB.Order("nama asc").Find(&psychologists)
	return c.JSON(fiber.Map{"status": "success", "data": psychologists})
}

func UpdatePsychologist(c *fiber.Ctx) error {
	id := c.Params("id")
	var psikolog models.Psikolog
	if err := config.DB.First(&psikolog, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Psikolog not found"})
	}
	if err := c.BodyParser(&psikolog); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Save(&psikolog)
	return c.JSON(fiber.Map{"status": "success", "data": psikolog})
}

func DeletePsychologist(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Psikolog{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Psikolog deleted"})
}

func GetPsychologistSchedulesAdmin(c *fiber.Ctx) error {
	id := c.Params("id")
	log.Printf("[SCHEDULE-ADMIN] GetPsychologistSchedulesAdmin called for ID: %s", id)

	var psikolog models.Psikolog
	if err := config.DB.First(&psikolog, id).Error; err != nil {
		log.Printf("[SCHEDULE-ADMIN] Psikolog not found for ID: %s", id)
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Psikolog not found"})
	}

	days := []string{"Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"}
	var slots []models.PsikologScheduleSlot
	if err := config.DB.Where("psikolog_id = ?", psikolog.ID).Order("id asc").Find(&slots).Error; err != nil {
		log.Printf("[SCHEDULE-ADMIN] Failed to fetch slots: %v", err)
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	log.Printf("[SCHEDULE-ADMIN] Found %d slots for psikolog_id=%d", len(slots), psikolog.ID)

	grouped := make([]fiber.Map, 0, len(days))
	for _, day := range days {
		daySlots := []fiber.Map{}
		enabled := false
		for _, slot := range slots {
			if slot.Hari == day {
				if slot.IsAktif != nil && *slot.IsAktif {
					enabled = true
				}
				daySlots = append(daySlots, fiber.Map{
					"id":           slot.ID,
					"kategori":     firstNonEmptyLocal(slot.Kategori, "Personal"),
					"start":        slot.JamMulai,
					"end":          slot.JamSelesai,
					"lokasi":       slot.Lokasi,
					"kuota":        slot.Kuota,
					"is_available": slot.IsAktif != nil && *slot.IsAktif,
				})
			}
		}
		grouped = append(grouped, fiber.Map{"day": day, "enabled": enabled, "slots": daySlots})
	}
	return c.JSON(fiber.Map{"status": "success", "data": grouped})
}

func SavePsychologistSchedulesAdmin(c *fiber.Ctx) error {
	id := c.Params("id")
	log.Printf("[SCHEDULE-ADMIN] SavePsychologistSchedulesAdmin called for ID: %s", id)

	var psikolog models.Psikolog
	if err := config.DB.First(&psikolog, id).Error; err != nil {
		log.Printf("[SCHEDULE-ADMIN] Psikolog not found for ID: %s", id)
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Psikolog not found"})
	}

	// Parse the raw body for debugging
	rawBody := string(c.Body())
	log.Printf("[SCHEDULE-ADMIN] Raw body (first 500 chars): %.500s", rawBody)

	var body []struct {
		Day     string `json:"day"`
		Enabled bool   `json:"enabled"`
		Slots   []struct {
			Kategori    string `json:"kategori"`
			Start       string `json:"start"`
			End         string `json:"end"`
			Lokasi      string `json:"lokasi"`
			Kuota       int    `json:"kuota"`
			IsAvailable *bool  `json:"is_available"`
		} `json:"slots"`
	}
	if err := c.BodyParser(&body); err != nil {
		log.Printf("[SCHEDULE-ADMIN] BodyParser error: %v", err)
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload jadwal tidak valid: " + err.Error()})
	}

	log.Printf("[SCHEDULE-ADMIN] Parsed %d days from body", len(body))
	for _, d := range body {
		log.Printf("[SCHEDULE-ADMIN]   Day=%s Enabled=%v Slots=%d", d.Day, d.Enabled, len(d.Slots))
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// HARD DELETE old slots (Unscoped to bypass soft-delete)
		if err := tx.Unscoped().Where("psikolog_id = ?", psikolog.ID).Delete(&models.PsikologScheduleSlot{}).Error; err != nil {
			log.Printf("[SCHEDULE-ADMIN] Failed to delete old slots: %v", err)
			return err
		}
		log.Printf("[SCHEDULE-ADMIN] Old slots deleted for psikolog_id=%d", psikolog.ID)

		for _, day := range body {
			for _, slot := range day.Slots {
				kuota := slot.Kuota
				if kuota <= 0 {
					kuota = 1
				}
				kategori := normalizeScheduleCategoryLocal(slot.Kategori)

				// is_aktif: if slot-level is_available was sent, use it; otherwise fall back to day.Enabled
				isAktif := day.Enabled
				if slot.IsAvailable != nil {
					isAktif = *slot.IsAvailable
				}

				isAktifVal := isAktif
				record := models.PsikologScheduleSlot{
					PsikologID: psikolog.ID,
					Hari:       day.Day,
					Kategori:   kategori,
					JamMulai:   slot.Start,
					JamSelesai: slot.End,
					Lokasi:     slot.Lokasi,
					Kuota:      kuota,
					IsAktif:    &isAktifVal,
				}
				if err := tx.Create(&record).Error; err != nil {
					log.Printf("[SCHEDULE-ADMIN] Failed to create slot for %s: %v", day.Day, err)
					return err
				}
			}
		}
		log.Printf("[SCHEDULE-ADMIN] All new slots created successfully")
		return nil
	})
	if err != nil {
		log.Printf("[SCHEDULE-ADMIN] Transaction error: %v", err)
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	// Re-fetch and return updated data
	days := []string{"Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"}
	var slots []models.PsikologScheduleSlot
	if err := config.DB.Where("psikolog_id = ?", psikolog.ID).Order("id asc").Find(&slots).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	log.Printf("[SCHEDULE-ADMIN] Re-fetched %d slots after save", len(slots))

	grouped := make([]fiber.Map, 0, len(days))
	for _, day := range days {
		daySlots := []fiber.Map{}
		enabled := false
		for _, slot := range slots {
			if slot.Hari == day {
				if slot.IsAktif != nil && *slot.IsAktif {
					enabled = true
				}
				daySlots = append(daySlots, fiber.Map{
					"id":           slot.ID,
					"kategori":     firstNonEmptyLocal(slot.Kategori, "Personal"),
					"start":        slot.JamMulai,
					"end":          slot.JamSelesai,
					"lokasi":       slot.Lokasi,
					"kuota":        slot.Kuota,
					"is_available": slot.IsAktif != nil && *slot.IsAktif,
				})
			}
		}
		grouped = append(grouped, fiber.Map{"day": day, "enabled": enabled, "slots": daySlots})
	}
	log.Printf("[SCHEDULE-ADMIN] Returning %d grouped days", len(grouped))
	return c.JSON(fiber.Map{"status": "success", "data": grouped})
}

func firstNonEmptyLocal(values ...string) string {
	for _, value := range values {
		if trimmed := strings.TrimSpace(value); trimmed != "" {
			return trimmed
		}
	}
	return ""
}

func normalizeScheduleCategoryLocal(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "akademik":
		return "Akademik"
	case "karir":
		return "Karir"
	case "personal":
		return "Personal"
	default:
		return "Personal"
	}
}

func GetGlobalAspirations(c *fiber.Ctx) error {
	var asps []models.Aspirasi
	config.DB.Preload("Mahasiswa.Fakultas").Order("created_at desc").Find(&asps)
	return c.JSON(fiber.Map{"status": "success", "data": asps})
}

func UpdateAspirationStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var payload struct {
		Status string `json:"status"`
		Respon string `json:"respon"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	var asp models.Aspirasi
	if err := config.DB.First(&asp, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Aspiration not found"})
	}

	asp.Status = payload.Status
	asp.Respon = payload.Respon

	if err := config.DB.Save(&asp).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Status aspirasi berhasil diperbarui",
		"data":    asp,
	})
}

// Additional CRUD for Mahasiswa
func CreateStudent(c *fiber.Ctx) error {
	var req struct {
		models.Mahasiswa
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	mhs := req.Mahasiswa

	email := mhs.EmailKampus
	if email == "" {
		email = fmt.Sprintf("%s@bku.ac.id", mhs.NIM)
	}

	// Check if student already exists (including soft-deleted)
	var existingMhs models.Mahasiswa
	errExisting := config.DB.Unscoped().Where("nim = ?", mhs.NIM).First(&existingMhs).Error
	if errExisting == nil {
		// Student exists! We will restore and update them
		err := config.DB.Transaction(func(tx *gorm.DB) error {
			// Restore/Update user
			var user models.User
			errUser := tx.Unscoped().Where("id = ?", existingMhs.PenggunaID).First(&user).Error
			if errUser == nil {
				user.DeletedAt = gorm.DeletedAt{}
				user.Email = email
				if req.Password != "" {
					hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
					if err == nil {
						user.Password = string(hashedPassword)
					}
				}
				if err := tx.Save(&user).Error; err != nil {
					return err
				}
			}

			// Restore/Update student
			existingMhs.DeletedAt = gorm.DeletedAt{}
			existingMhs.Nama = mhs.Nama
			existingMhs.EmailKampus = email
			existingMhs.FakultasID = mhs.FakultasID
			existingMhs.ProgramStudiID = mhs.ProgramStudiID
			existingMhs.SemesterSekarang = mhs.SemesterSekarang
			existingMhs.StatusAkun = "Aktif"
			existingMhs.TahunMasuk = mhs.TahunMasuk

			if err := tx.Save(&existingMhs).Error; err != nil {
				return err
			}

			return nil
		})

		if err != nil {
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memulihkan data mahasiswa: " + err.Error()})
		}

		return c.JSON(fiber.Map{"status": "success", "data": existingMhs, "message": "Data mahasiswa berhasil dipulihkan dan diperbarui"})
	}

	// Check if Email already exists in User table
	var countUser int64
	config.DB.Model(&models.User{}).Where("email = ?", email).Count(&countUser)
	if countUser > 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Email sudah terdaftar untuk pengguna lain"})
	}

	// Check if NIM already exists in Mahasiswa table
	if mhs.NIM != "" {
		var countMhs int64
		config.DB.Model(&models.Mahasiswa{}).Where("nim = ?", mhs.NIM).Count(&countMhs)
		if countMhs > 0 {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "NIM sudah terdaftar untuk mahasiswa lain"})
		}
	}

	// 1. Create User automatically
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		defaultPassword := req.Password
		if defaultPassword == "" {
			defaultPassword = "password123"
			if mhs.NIM != "" {
				defaultPassword = "pass" + mhs.NIM
			}
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)
		if err != nil {
			fmt.Printf("[DEBUG] Password hashing failed: %v\n", err)
			return err
		}

		user := models.User{
			Email:    email,
			Password: string(hashedPassword),
			Role:     "mahasiswa",
		}
		// 1. Create User first
		if err := tx.Create(&user).Error; err != nil {
			fmt.Printf("[DEBUG] User creation failed: %v\n", err)
			return err
		}

		// DOUBLE CHECK: Pastikan ID user tidak nol
		if user.ID == 0 {
			return fmt.Errorf("failed to retrieve new User ID after insertion")
		}

		fmt.Printf("[DEBUG] User created with ID: %d\n", user.ID)

		// 2. Prepare Mahasiswa data
		mhs.PenggunaID = user.ID
		mhs.Pengguna = user // Beritahu GORM ini user-nya
		mhs.StatusAkun = "Aktif"

		// 3. Create Mahasiswa
		if err := tx.Omit("Pengguna").Create(&mhs).Error; err != nil {
			fmt.Printf("[DEBUG] Mahasiswa creation failed: %v\n", err)
			return err
		}

		// Otomatis daftarkan ke PKKMB jika semester 1 atau maba
		if mhs.SemesterSekarang == 1 {
			pkkmb := models.PkkmbHasil{
				MahasiswaID:     mhs.ID,
				Nilai:           0.0,
				StatusKelulusan: "Proses",
			}
			if err := tx.Create(&pkkmb).Error; err != nil {
				fmt.Printf("[DEBUG] PKKMB creation failed: %v\n", err)
				return err
			}
		}
		return nil
	})

	if err != nil {
		fmt.Printf("Error CreateStudent: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal simpan: " + err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "data": mhs, "message": "Mahasiswa berhasil dibuat"})
}

func UpdateStudent(c *fiber.Ctx) error {
	id := c.Params("id")
	var mhs models.Mahasiswa
	if err := config.DB.First(&mhs, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Mahasiswa tidak ditemukan"})
	}

	var req struct {
		models.Mahasiswa
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	email := req.EmailKampus
	if email == "" {
		email = fmt.Sprintf("%s@bku.ac.id", req.NIM)
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// Update user info
		if mhs.PenggunaID != 0 {
			var user models.User
			if err := tx.First(&user, mhs.PenggunaID).Error; err == nil {
				user.Email = email
				if req.Password != "" {
					hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
					if err == nil {
						user.Password = string(hashedPassword)
					}
				}
				if err := tx.Save(&user).Error; err != nil {
					return err
				}
			}
		}

		// Update student info
		mhs.NIM = req.NIM
		mhs.Nama = req.Nama
		mhs.EmailKampus = email
		mhs.FakultasID = req.FakultasID
		mhs.ProgramStudiID = req.ProgramStudiID
		mhs.SemesterSekarang = req.SemesterSekarang
		mhs.StatusAkun = req.StatusAkun
		mhs.TahunMasuk = req.TahunMasuk
		mhs.Alamat = req.Alamat

		if err := tx.Save(&mhs).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui data mahasiswa: " + err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "data": mhs, "message": "Data mahasiswa berhasil diperbarui"})
}

func DeleteStudent(c *fiber.Ctx) error {
	id := c.Params("id")
	var mhs models.Mahasiswa
	if err := config.DB.First(&mhs, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Mahasiswa tidak ditemukan"})
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Soft delete Mahasiswa
		if err := tx.Delete(&models.Mahasiswa{}, id).Error; err != nil {
			return err
		}

		// 2. Soft delete User if exists
		if mhs.PenggunaID != 0 {
			if err := tx.Delete(&models.User{}, mhs.PenggunaID).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus mahasiswa: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Mahasiswa deleted successfully"})
}

func GetAllProgramStudi(c *fiber.Ctx) error {
	var prodis []models.ProgramStudi
	if err := config.DB.Preload("Fakultas").Find(&prodis).Error; err != nil {
		fmt.Printf("[ERROR] GetAllProgramStudi: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data Prodi: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": prodis})
}

func CreateProgramStudi(c *fiber.Ctx) error {
	var prodi models.ProgramStudi
	if err := c.BodyParser(&prodi); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Gagal memproses body request: " + err.Error()})
	}
	if err := config.DB.Create(&prodi).Error; err != nil {
		fmt.Printf("[ERROR] CreateProgramStudi: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan Prodi: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": prodi})
}

func UpdateProgramStudi(c *fiber.Ctx) error {
	id := c.Params("id")
	var prodi models.ProgramStudi
	if err := config.DB.First(&prodi, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Program Studi not found"})
	}
	c.BodyParser(&prodi)
	config.DB.Save(&prodi)
	return c.JSON(fiber.Map{"status": "success", "data": prodi})
}

func DeleteProgramStudi(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.ProgramStudi{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Program Studi deleted"})
}

// Scholarship Handlers
func GetAllScholarships(c *fiber.Ctx) error {
	var list []models.Beasiswa
	config.DB.Find(&list)

	// Manual mapping to PascalCase for Frontend compatibility without changing the model
	var mappedList []map[string]interface{}
	for _, b := range list {
		m := map[string]interface{}{
			"ID":             b.ID,
			"Nama":           b.Nama,
			"Penyelenggara":  b.Penyelenggara,
			"Deskripsi":      b.Deskripsi,
			"Persyaratan":    b.Persyaratan,
			"Deadline":       b.Deadline,
			"Kuota":          b.Kuota,
			"IPKMin":         b.IPKMin,
			"Anggaran":       b.Anggaran, // Capitalized for Frontend
			"Kategori":       b.Kategori,
			"NilaiBantuan":   b.NilaiBantuan,
			"FileKtm":        b.FileKtm,
			"FileTranskrip":  b.FileTranskrip,
			"FileSertifikat": b.FileSertifikat,
			"CreatedAt":      b.CreatedAt,
		}
		mappedList = append(mappedList, m)
	}

	return c.JSON(fiber.Map{"status": "success", "data": mappedList})
}

func CreateScholarship(c *fiber.Ctx) error {
	var payload struct {
		Nama           string  `json:"Nama"`
		Penyelenggara  string  `json:"Penyelenggara"`
		Deskripsi      string  `json:"Deskripsi"`
		Persyaratan    string  `json:"Persyaratan"`
		Deadline       string  `json:"Deadline"`
		Kuota          int     `json:"Kuota"`
		IPKMin         float64 `json:"IPKMin"`
		Anggaran       float64 `json:"Anggaran"`
		Kategori       string  `json:"Kategori"`
		FileKtm        string  `json:"FileKtm"`
		FileTranskrip  string  `json:"FileTranskrip"`
		FileSertifikat string  `json:"FileSertifikat"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	dead, _ := time.Parse(time.RFC3339, payload.Deadline)

	kategori := payload.Kategori
	if kategori == "" {
		kategori = "Internal"
	}

	nilaiBantuan := float64(0)
	if payload.Kuota > 0 {
		nilaiBantuan = payload.Anggaran / float64(payload.Kuota)
	}

	// Default fallbacks if empty
	fileKtm := payload.FileKtm
	if fileKtm == "" {
		fileKtm = "wajib"
	}
	fileTranskrip := payload.FileTranskrip
	if fileTranskrip == "" {
		fileTranskrip = "wajib"
	}
	fileSertifikat := payload.FileSertifikat
	if fileSertifikat == "" {
		fileSertifikat = "opsional"
	}

	beasiswa := models.Beasiswa{
		Nama:           payload.Nama,
		Penyelenggara:  payload.Penyelenggara,
		Deskripsi:      payload.Deskripsi,
		Persyaratan:    payload.Persyaratan,
		Deadline:       dead,
		Kuota:          payload.Kuota,
		IPKMin:         payload.IPKMin,
		Anggaran:       payload.Anggaran,
		Kategori:       kategori,
		NilaiBantuan:   nilaiBantuan,
		FileKtm:        fileKtm,
		FileTranskrip:  fileTranskrip,
		FileSertifikat: fileSertifikat,
	}

	if err := config.DB.Create(&beasiswa).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Beasiswa created"})
}

func UpdateScholarship(c *fiber.Ctx) error {
	id := c.Params("id")
	var payload struct {
		Nama           string  `json:"Nama"`
		Penyelenggara  string  `json:"Penyelenggara"`
		Deskripsi      string  `json:"Deskripsi"`
		Persyaratan    string  `json:"Persyaratan"`
		Deadline       string  `json:"Deadline"`
		Kuota          int     `json:"Kuota"`
		IPKMin         float64 `json:"IPKMin"`
		Anggaran       float64 `json:"Anggaran"`
		Kategori       string  `json:"Kategori"`
		FileKtm        string  `json:"FileKtm"`
		FileTranskrip  string  `json:"FileTranskrip"`
		FileSertifikat string  `json:"FileSertifikat"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	dead, _ := time.Parse(time.RFC3339, payload.Deadline)

	var beasiswa models.Beasiswa
	if err := config.DB.First(&beasiswa, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Beasiswa not found"})
	}

	nilaiBantuan := float64(0)
	if payload.Kuota > 0 {
		nilaiBantuan = payload.Anggaran / float64(payload.Kuota)
	}

	beasiswa.Nama = payload.Nama
	beasiswa.Penyelenggara = payload.Penyelenggara
	beasiswa.Deskripsi = payload.Deskripsi
	beasiswa.Persyaratan = payload.Persyaratan
	beasiswa.Deadline = dead
	beasiswa.Kuota = payload.Kuota
	beasiswa.IPKMin = payload.IPKMin
	beasiswa.Anggaran = payload.Anggaran
	beasiswa.NilaiBantuan = nilaiBantuan
	if payload.Kategori != "" {
		beasiswa.Kategori = payload.Kategori
	}
	if payload.FileKtm != "" {
		beasiswa.FileKtm = payload.FileKtm
	}
	if payload.FileTranskrip != "" {
		beasiswa.FileTranskrip = payload.FileTranskrip
	}
	if payload.FileSertifikat != "" {
		beasiswa.FileSertifikat = payload.FileSertifikat
	}

	if err := config.DB.Save(&beasiswa).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Beasiswa updated"})
}

func DeleteScholarship(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Beasiswa{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

// Counseling Handlers
func GetAllCounseling(c *fiber.Ctx) error {
	var list []models.Konseling
	if err := config.DB.Preload("Mahasiswa").Preload("Dosen").Find(&list).Error; err != nil {
		fmt.Printf("Database Error (GetAllCounseling): %v\n", err)
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal mengambil data: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func CreateCounseling(c *fiber.Ctx) error {
	var data models.Konseling
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request"})
	}
	// Omit associations to prevent GORM from trying to insert them again
	if err := config.DB.Omit("Mahasiswa", "Dosen").Create(&data).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": data})
}

func UpdateCounseling(c *fiber.Ctx) error {
	id := c.Params("id")
	var data models.Konseling
	if err := config.DB.First(&data, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not found"})
	}
	c.BodyParser(&data)
	if err := config.DB.Omit("Mahasiswa", "Dosen").Save(&data).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": data})
}

func DeleteCounseling(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Konseling{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

// Jadwal Konseling Handlers (Master Data)
func GetAllCounselingJadwal(c *fiber.Ctx) error {
	var list []models.JadwalKonseling
	if err := config.DB.Order("tanggal desc").Find(&list).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func CreateCounselingJadwal(c *fiber.Ctx) error {
	var data models.JadwalKonseling
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request"})
	}
	data.SisaKuota = data.Kuota
	if err := config.DB.Create(&data).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": data})
}

func UpdateCounselingJadwal(c *fiber.Ctx) error {
	id := c.Params("id")
	var data models.JadwalKonseling
	if err := config.DB.First(&data, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not found"})
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request"})
	}
	if err := config.DB.Save(&data).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": data})
}

func DeleteCounselingJadwal(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.JadwalKonseling{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

func CreateOrmawa(c *fiber.Ctx) error {
	var payload struct {
		Nama      string `json:"Nama"`
		Singkatan string `json:"Singkatan"`
		Deskripsi string `json:"Deskripsi"`
		Visi      string `json:"Visi"`
		Misi      string `json:"Misi"`
		Email     string `json:"Email"`
		Phone     string `json:"Phone"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid payload"})
	}

	err := config.DB.Exec("INSERT INTO ormawa.ormawa (nama, singkatan, deskripsi, visi, misi, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		payload.Nama, payload.Singkatan, payload.Deskripsi, payload.Visi, payload.Misi, payload.Email, payload.Phone, time.Now(), time.Now()).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Ormawa created successfully"})
}

func UpdateOrmawa(c *fiber.Ctx) error {
	id := c.Params("id")
	var payload struct {
		Nama      string `json:"Nama"`
		Singkatan string `json:"Singkatan"`
		Deskripsi string `json:"Deskripsi"`
		Visi      string `json:"Visi"`
		Misi      string `json:"Misi"`
		Email     string `json:"Email"`
		Phone     string `json:"Phone"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid payload"})
	}

	err := config.DB.Exec("UPDATE ormawa.ormawa SET nama = ?, singkatan = ?, deskripsi = ?, visi = ?, misi = ?, email = ?, phone = ?, updated_at = ? WHERE id = ?",
		payload.Nama, payload.Singkatan, payload.Deskripsi, payload.Visi, payload.Misi, payload.Email, payload.Phone, time.Now(), id).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Ormawa updated successfully"})
}

func DeleteOrmawa(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Ormawa{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Ormawa deleted"})
}

// News Handlers
func GetAllNews(c *fiber.Ctx) error {
	var list []models.Berita
	config.DB.Order("tanggal_publish desc").Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func broadcastNewsNotifications(db *gorm.DB, b *models.Berita) {
	if b.Status != "Published" || b.Notified {
		return
	}

	var targetUserIDs []uint

	switch b.TargetAudience {
	case "fakultas":
		if b.TargetFakultasID != nil && *b.TargetFakultasID > 0 {
			// Get faculty admins
			var adminIDs []uint
			db.Model(&models.User{}).Where("role = ? AND fakultas_id = ?", "faculty_admin", *b.TargetFakultasID).Pluck("id", &adminIDs)
			targetUserIDs = append(targetUserIDs, adminIDs...)

			// Get students
			var studentUserIDs []uint
			db.Table("mahasiswa.mahasiswa").Where("fakultas_id = ?", *b.TargetFakultasID).Pluck("pengguna_id", &studentUserIDs)
			targetUserIDs = append(targetUserIDs, studentUserIDs...)
		}

	case "ormawa":
		var ormawaIDs []uint
		if b.TargetOrmawaIDs != "" {
			parts := strings.Split(b.TargetOrmawaIDs, ",")
			for _, p := range parts {
				p = strings.TrimSpace(p)
				var id uint
				if _, err := fmt.Sscanf(p, "%d", &id); err == nil && id > 0 {
					ormawaIDs = append(ormawaIDs, id)
				}
			}
		} else if b.TargetOrmawaID != nil && *b.TargetOrmawaID > 0 {
			ormawaIDs = []uint{*b.TargetOrmawaID}
		}

		for _, oID := range ormawaIDs {
			// 1. Get ormawa admins (users with ormawa_id directly set)
			var adminIDs []uint
			db.Model(&models.User{}).Where("ormawa_id = ?", oID).Pluck("id", &adminIDs)
			targetUserIDs = append(targetUserIDs, adminIDs...)

			// 2. Get ormawa members from ormawa.ormawa_anggota -> mahasiswa -> pengguna_id
			var memberUserIDs []uint
			db.Table("ormawa.ormawa_anggota").
				Select("mahasiswa.pengguna_id").
				Joins("join mahasiswa.mahasiswa on mahasiswa.id = ormawa_anggota.mahasiswa_id").
				Where("ormawa_anggota.ormawa_id = ? AND ormawa_anggota.deleted_at IS NULL", oID).
				Pluck("pengguna_id", &memberUserIDs)
			targetUserIDs = append(targetUserIDs, memberUserIDs...)

			// 3. Create a record in OrmawaNotifikasi so it shows up inside the specific Ormawa portal notification list
			db.Create(&models.OrmawaNotifikasi{
				OrmawaID: oID,
				Tipe:     "sistem",
				Judul:    b.Judul,
				Pesan:    b.Isi,
				IsRead:   false,
			})
		}

	case "mahasiswa":
		if b.TargetMahasiswaIDs != "" {
			parts := strings.Split(b.TargetMahasiswaIDs, ",")
			var mhsIDs []uint
			for _, p := range parts {
				p = strings.TrimSpace(p)
				var id uint
				if _, err := fmt.Sscanf(p, "%d", &id); err == nil && id > 0 {
					mhsIDs = append(mhsIDs, id)
				}
			}
			if len(mhsIDs) > 0 {
				var studentUserIDs []uint
				db.Table("mahasiswa.mahasiswa").Where("id IN ?", mhsIDs).Pluck("pengguna_id", &studentUserIDs)
				targetUserIDs = append(targetUserIDs, studentUserIDs...)
			}
		} else if b.TargetFakultasID != nil && *b.TargetFakultasID > 0 {
			// Get students in specific faculty
			var studentUserIDs []uint
			db.Table("mahasiswa.mahasiswa").Where("fakultas_id = ?", *b.TargetFakultasID).Pluck("pengguna_id", &studentUserIDs)
			targetUserIDs = append(targetUserIDs, studentUserIDs...)
		} else {
			// Get all students
			var studentUserIDs []uint
			db.Table("mahasiswa.mahasiswa").Pluck("pengguna_id", &studentUserIDs)
			targetUserIDs = append(targetUserIDs, studentUserIDs...)
		}

	default: // "semua" or empty
		// Get all users
		db.Model(&models.User{}).Pluck("id", &targetUserIDs)
	}

	// Remove duplicates (just in case)
	uniqueIDs := make(map[uint]bool)
	var finalIDs []uint
	for _, id := range targetUserIDs {
		if id > 0 && !uniqueIDs[id] {
			uniqueIDs[id] = true
			finalIDs = append(finalIDs, id)
		}
	}

	if len(finalIDs) > 0 {
		notifications := make([]models.Notifikasi, len(finalIDs))
		for i, uID := range finalIDs {
			notifications[i] = models.Notifikasi{
				UserID:    uID,
				Tipe:      "sistem",
				Judul:     b.Judul,
				Deskripsi: b.Isi,
				IsRead:    false,
			}
		}
		// Bulk insert notifications in batches of 100 to optimize performance
		db.CreateInBatches(notifications, 100)
	}

	// Update notified status to prevent resending
	db.Model(b).Update("notified", true)
}

func CreateNews(c *fiber.Ctx) error {
	var b models.Berita
	if err := c.BodyParser(&b); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"status": "error", "message": "Author identity required"})
	}

	b.PenulisID = userID
	b.TanggalPublish = time.Now()

	if err := config.DB.Create(&b).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan berita: " + err.Error()})
	}

	// Broadcast notifications if published
	if b.Status == "Published" {
		broadcastNewsNotifications(config.DB, &b)
	}

	return c.JSON(fiber.Map{"status": "success", "data": b})
}

func UpdateNews(c *fiber.Ctx) error {
	id := c.Params("id")
	var b models.Berita
	if err := config.DB.First(&b, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Berita tidak ditemukan"})
	}
	if err := c.BodyParser(&b); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Save(&b)

	// Broadcast notifications if published and not yet notified
	if b.Status == "Published" && !b.Notified {
		broadcastNewsNotifications(config.DB, &b)
	}

	return c.JSON(fiber.Map{"status": "success", "data": b})
}

func DeleteNews(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Berita{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Berita dihapus"})
}

// GetAdminProfile returns the profile of the currently logged-in admin
func GetAdminProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Unauthorized access"})
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Admin not found"})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   user,
	})
}

// UpdateAdminProfile updates basic security info for admin
func UpdateAdminProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Unauthorized access"})
	}

	type UpdateReq struct {
		Email       string `json:"Email"`
		OldPassword string `json:"OldPassword"`
		NewPassword string `json:"NewPassword"`
	}
	var req UpdateReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Admin not found"})
	}

	// Update Email
	if req.Email != "" {
		user.Email = req.Email
	}

	// Update Password if requested
	if req.OldPassword != "" && req.NewPassword != "" {
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Incorrect current password"})
		}

		hashed, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to hash new password"})
		}
		user.Password = string(hashed)
	}

	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to update profile"})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Admin profile updated successfully",
		"data":    user,
	})
}

// GetAcademicSettings returns the global academic configuration
func GetAcademicSettings(c *fiber.Ctx) error {
	var settings models.PengaturanAkademik
	// Try to find the first/active settings
	if err := config.DB.First(&settings).Error; err != nil {
		// If not found, create a default one
		settings = models.PengaturanAkademik{
			TahunAkademik: "2024 / 2025",
			Semester:      "Ganjil",
			IsKRSOpen:     false,
			IsNilaiOpen:   false,
			IsMBKMOpen:    false,
		}
		config.DB.Create(&settings)
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   settings,
	})
}

// UpdateAcademicSettings updates the global academic configuration
func UpdateAcademicSettings(c *fiber.Ctx) error {
	var payload models.PengaturanAkademik
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	var settings models.PengaturanAkademik
	if err := config.DB.First(&settings).Error; err != nil {
		// If not found, create a new one
		if err := config.DB.Create(&payload).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}
		settings = payload
	} else {
		// Update existing
		config.DB.Model(&settings).Updates(payload)
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Konfigurasi akademik berhasil diperbarui",
		"data":    settings,
	})
}

// GetAllScholarshipApplications returns all scholarship applications
func GetAllScholarshipApplications(c *fiber.Ctx) error {
	var applications []models.BeasiswaPendaftaran
	err := config.DB.Preload("Mahasiswa").Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Preload("Beasiswa").Order("created_at desc").Find(&applications).Error
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "data": applications})
}

// UpdateScholarshipApplicationStatus updates the status of a scholarship application
func UpdateScholarshipApplicationStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var payload struct {
		Status  string `json:"status"`
		Catatan string `json:"catatan"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}

	log.Printf("[UpdateStatus] ID: %s, Parsed Status: %s, Parsed Catatan: %s\n", id, payload.Status, payload.Catatan)

	var application models.BeasiswaPendaftaran
	if err := config.DB.Preload("Beasiswa").First(&application, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Application not found"})
	}

	// Use FOR UPDATE to prevent TOCTOU race: lock the student's existing accepted application
	if payload.Status == "Diterima" {
		var accepted models.BeasiswaPendaftaran
		if err := config.DB.
			Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("mahasiswa_id = ? AND status = ? AND id != ?", application.MahasiswaID, "Diterima", application.ID).
			First(&accepted).Error; err == nil {
			return c.Status(409).JSON(fiber.Map{
				"status":  "error",
				"message": fmt.Sprintf("Mahasiswa ini sudah menerima beasiswa lain (%s)", accepted.Beasiswa.Nama),
			})
		}
	}

	application.Status = payload.Status
	application.Catatan = payload.Catatan

	if err := config.DB.Model(&application).Updates(map[string]interface{}{
		"status":  payload.Status,
		"catatan": payload.Catatan,
	}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}


	// Trigger Notification to student
	_ = notifikasi.Kirim(config.DB, notifikasi.KirimParams{
		MahasiswaID: application.MahasiswaID,
		Type:        "beasiswa",
		Title:       "Status Beasiswa Diperbarui",
		Content:     "Status pendaftaran beasiswa '" + application.Beasiswa.Nama + "' Anda telah diperbarui menjadi: " + payload.Status + ".",
		Link:        "/student/scholarship",
	})

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Status pendaftaran beasiswa berhasil diperbarui",
		"data":    application,
	})
}

// GetPsychologistBookingsAdmin returns all bookings in the psychologist module for superadmin review
func GetPsychologistBookingsAdmin(c *fiber.Ctx) error {
	var bookings []models.PsikologBooking
	err := config.DB.
		Preload("Psikolog").
		Preload("Mahasiswa").
		Preload("Mahasiswa.Fakultas").
		Preload("Mahasiswa.ProgramStudi").
		Order("tanggal desc, jam_mulai desc").
		Find(&bookings).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": bookings})
}

// GetPsychologistMedicalRecordsAdmin returns all medical records (session notes) in the psychologist module
func GetPsychologistMedicalRecordsAdmin(c *fiber.Ctx) error {
	var records []models.PsikologSessionNote
	err := config.DB.
		Preload("Psikolog").
		Preload("Mahasiswa").
		Preload("Mahasiswa.Fakultas").
		Preload("Mahasiswa.ProgramStudi").
		Preload("Booking").
		Order("tanggal desc").
		Find(&records).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": records})
}

// GetPsychologistReferralsAdmin returns all referrals (tindak lanjut) in the psychologist module
func GetPsychologistReferralsAdmin(c *fiber.Ctx) error {
	var referrals []models.PsikologReferral
	err := config.DB.
		Preload("Psikolog").
		Preload("Mahasiswa").
		Preload("Mahasiswa.Fakultas").
		Preload("Mahasiswa.ProgramStudi").
		Preload("Booking").
		Order("tanggal_dibuat desc").
		Find(&referrals).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": referrals})
}

// GetAllTenagaKesehatan returns all registered health workers (Tenaga Kesehatan) profiles
func GetAllTenagaKesehatan(c *fiber.Ctx) error {
	var list []models.TenagaKesehatan
	if err := config.DB.Preload("User").Order("nama asc").Find(&list).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

// UpdateTenagaKesehatan updates a health worker profile
func UpdateTenagaKesehatan(c *fiber.Ctx) error {
	id := c.Params("id")
	var tk models.TenagaKesehatan
	if err := config.DB.First(&tk, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Tenaga Kesehatan not found"})
	}

	type UpdateReq struct {
		Nama         string `json:"nama"`
		Email        string `json:"email"`
		NoHP         string `json:"no_hp"`
		Spesialisasi string `json:"spesialisasi"`
		FotoURL      string `json:"foto_url"`
		Lokasi       string `json:"lokasi"`
		IsAktif      *bool  `json:"is_aktif"`
	}
	var req UpdateReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	if req.Nama != "" {
		tk.Nama = req.Nama
	}
	if req.Email != "" {
		tk.Email = req.Email
	}
	if req.NoHP != "" {
		tk.NoHP = req.NoHP
	}
	if req.Spesialisasi != "" {
		tk.Spesialisasi = req.Spesialisasi
	}
	if req.FotoURL != "" {
		tk.FotoURL = req.FotoURL
	}
	if req.Lokasi != "" {
		tk.Lokasi = req.Lokasi
	}
	if req.IsAktif != nil {
		tk.IsAktif = *req.IsAktif
	}

	if err := config.DB.Save(&tk).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": tk})
}

// DeleteTenagaKesehatan deletes a health worker profile
func DeleteTenagaKesehatan(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.TenagaKesehatan{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Tenaga Kesehatan deleted"})
}

// GetTenagaKesehatanSchedulesAdmin returns all schedules for a specific health worker
func GetTenagaKesehatanSchedulesAdmin(c *fiber.Ctx) error {
	id := c.Params("id")
	var slots []models.JadwalKesehatan
	if err := config.DB.Where("tenaga_kes_id = ?", id).Order("tanggal desc, jam_mulai asc").Find(&slots).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": slots})
}

// CreateTenagaKesehatanScheduleAdmin creates a new schedule slot for a health worker
func CreateTenagaKesehatanScheduleAdmin(c *fiber.Ctx) error {
	tkID := c.Params("id")
	var body struct {
		Tanggal     string `json:"tanggal"`
		JamMulai    string `json:"jam_mulai"`
		JamSelesai  string `json:"jam_selesai"`
		Kuota       int    `json:"kuota"`
		Lokasi      string `json:"lokasi"`
		TipeLayanan string `json:"tipe_layanan"`
		Catatan     string `json:"catatan"`
		IsRepeat    bool   `json:"is_repeat"`
		RepeatDays  string `json:"repeat_days"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload tidak valid"})
	}

	parsedDate, err := time.Parse("2006-01-02", body.Tanggal)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format tanggal harus YYYY-MM-DD"})
	}

	kuota := body.Kuota
	if kuota <= 0 {
		kuota = 1
	}

	var tk models.TenagaKesehatan
	if err := config.DB.First(&tk, tkID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Tenaga Kesehatan not found"})
	}

	schedule := models.JadwalKesehatan{
		TenagaKesID: tk.ID,
		Tanggal:     parsedDate,
		JamMulai:    body.JamMulai,
		JamSelesai:  body.JamSelesai,
		Kuota:       kuota,
		Lokasi:      body.Lokasi,
		TipeLayanan: body.TipeLayanan,
		Catatan:     body.Catatan,
		IsRepeat:    body.IsRepeat,
		RepeatDays:  body.RepeatDays,
	}

	if err := config.DB.Create(&schedule).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "data": schedule})
}

// UpdateTenagaKesehatanScheduleAdmin updates a schedule slot by ID
func UpdateTenagaKesehatanScheduleAdmin(c *fiber.Ctx) error {
	id := c.Params("id")
	var schedule models.JadwalKesehatan
	if err := config.DB.First(&schedule, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Jadwal tidak ditemukan"})
	}

	var body struct {
		Tanggal     string `json:"tanggal"`
		JamMulai    string `json:"jam_mulai"`
		JamSelesai  string `json:"jam_selesai"`
		Kuota       int    `json:"kuota"`
		Lokasi      string `json:"lokasi"`
		TipeLayanan string `json:"tipe_layanan"`
		Catatan     string `json:"catatan"`
		IsRepeat    bool   `json:"is_repeat"`
		RepeatDays  string `json:"repeat_days"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload tidak valid"})
	}

	updates := map[string]any{}
	if body.Tanggal != "" {
		if t, err := time.Parse("2006-01-02", body.Tanggal); err == nil {
			updates["tanggal"] = t
		}
	}
	if body.JamMulai != "" {
		updates["jam_mulai"] = body.JamMulai
	}
	if body.JamSelesai != "" {
		updates["jam_selesai"] = body.JamSelesai
	}
	if body.Kuota > 0 {
		updates["kuota"] = body.Kuota
	}
	if body.Lokasi != "" {
		updates["lokasi"] = body.Lokasi
	}
	if body.TipeLayanan != "" {
		updates["tipe_layanan"] = body.TipeLayanan
	}
	updates["catatan"] = body.Catatan
	updates["is_repeat"] = body.IsRepeat
	updates["repeat_days"] = body.RepeatDays

	if err := config.DB.Model(&schedule).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	config.DB.First(&schedule, id)
	return c.JSON(fiber.Map{"status": "success", "data": schedule})
}

// DeleteTenagaKesehatanScheduleAdmin deletes a schedule slot
func DeleteTenagaKesehatanScheduleAdmin(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.JadwalKesehatan{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Jadwal berhasil dihapus"})
}

// GetTenagaKesehatanBookingsAdmin returns all bookings in the health worker module for superadmin review
func GetTenagaKesehatanBookingsAdmin(c *fiber.Ctx) error {
	var bookings []models.BookingKesehatan
	err := config.DB.
		Preload("Jadwal").
		Preload("Jadwal.TenagaKes").
		Preload("Mahasiswa").
		Preload("Mahasiswa.Fakultas").
		Preload("Mahasiswa.ProgramStudi").
		Order("created_at desc").
		Find(&bookings).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": bookings})
}

// GetTenagaKesehatanMedicalRecordsAdmin returns all medical records (session notes) in the health worker module
func GetTenagaKesehatanMedicalRecordsAdmin(c *fiber.Ctx) error {
	var records []models.Kesehatan
	err := config.DB.
		Preload("Mahasiswa").
		Preload("Mahasiswa.Fakultas").
		Preload("Mahasiswa.ProgramStudi").
		Preload("TenagaKes").
		Order("tanggal desc").
		Find(&records).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": records})
}

// GetOrmawaLeaderboard returns all Ormawa ranked by points descending
func GetOrmawaLeaderboard(c *fiber.Ctx) error {
	var list []models.Ormawa
	if err := config.DB.Order("poin desc, nama asc").Find(&list).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	type LeaderboardItem struct {
		ID        uint   `json:"id"`
		Nama      string `json:"nama"`
		Singkatan string `json:"singkatan"`
		Poin      int    `json:"poin"`
		Peringkat int    `json:"peringkat"`
	}

	var result []LeaderboardItem
	for idx, item := range list {
		result = append(result, LeaderboardItem{
			ID:        item.ID,
			Nama:      item.Nama,
			Singkatan: item.Singkatan,
			Poin:      item.Poin,
			Peringkat: idx + 1,
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   result,
	})
}

// GetGlobalOrmawaPoinHistory returns global point histories
func GetGlobalOrmawaPoinHistory(c *fiber.Ctx) error {
	var history []models.OrmawaPoinHistory
	if err := config.DB.Preload("Ormawa").Order("created_at desc").Limit(50).Find(&history).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   history,
	})
}

// GetOrmawaGamifikasiRules returns all point-awarding rules
func GetOrmawaGamifikasiRules(c *fiber.Ctx) error {
	var rules []models.OrmawaGamifikasiRule
	if err := config.DB.Order("id asc").Find(&rules).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   rules,
	})
}

// UpdateOrmawaGamifikasiRule updates a point rule
func UpdateOrmawaGamifikasiRule(c *fiber.Ctx) error {
	id := c.Params("id")
	var rule models.OrmawaGamifikasiRule
	if err := config.DB.First(&rule, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Aturan tidak ditemukan"})
	}

	type UpdatePayload struct {
		Poin      int    `json:"poin"`
		Label     string `json:"label"`
		Deskripsi string `json:"deskripsi"`
	}

	var payload UpdatePayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload tidak valid"})
	}

	rule.Poin = payload.Poin
	if payload.Label != "" {
		rule.Label = payload.Label
	}
	if payload.Deskripsi != "" {
		rule.Deskripsi = payload.Deskripsi
	}

	if err := config.DB.Save(&rule).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"message": "Aturan gamifikasi berhasil diperbarui",
		"data":   rule,
	})
}

// GetGlobalLPJs returns all LPJs for Super Admin review
func GetGlobalLPJs(c *fiber.Ctx) error {
	var list []models.LaporanPertanggungjawaban
	if err := config.DB.Preload("Proposal.Ormawa").Order("created_at desc").Find(&list).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	type LPJListItem struct {
		ID                uint      `json:"id"`
		ProposalID        uint      `json:"proposalId"`
		OrmawaName        string    `json:"ormawaName"`
		OrmawaSingkatan   string    `json:"ormawaSingkatan"`
		Title             string    `json:"title"`
		Date              string    `json:"date"`
		Status            string    `json:"status"`
		Catatan           string    `json:"catatan"`
		RealisasiAnggaran float64   `json:"realisasiAnggaran"`
		TotalAnggaran     float64   `json:"totalAnggaran"`
		FileURL           string    `json:"fileUrl"`
		CreatedAt         string    `json:"createdAt"`
	}

	var result []LPJListItem
	for _, item := range list {
		dateStr := ""
		if !item.CreatedAt.IsZero() {
			dateStr = item.CreatedAt.Format("2006-01-02")
		}

		ormawaName := item.Proposal.Ormawa.Nama
		ormawaSingkatan := item.Proposal.Ormawa.Singkatan
		proposalTitle := item.Proposal.Judul
		totalAnggaran := item.Proposal.Anggaran

		result = append(result, LPJListItem{
			ID:                item.ID,
			ProposalID:        item.ProposalID,
			OrmawaName:        ormawaName,
			OrmawaSingkatan:   ormawaSingkatan,
			Title:             proposalTitle,
			Date:              dateStr,
			Status:            item.Status,
			Catatan:           item.Catatan,
			RealisasiAnggaran: item.RealisasiAnggaran,
			TotalAnggaran:     totalAnggaran,
			FileURL:           item.FileURL,
			CreatedAt:         item.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   result,
	})
}

// ReviewLPJ approves or issues a warning for an LPJ, adjusting Ormawa points accordingly
func ReviewLPJ(c *fiber.Ctx) error {
	id := c.Params("id")
	var lpj models.LaporanPertanggungjawaban
	if err := config.DB.Preload("Proposal").First(&lpj, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "LPJ tidak ditemukan"})
	}

	type ReviewPayload struct {
		Action  string `json:"action"` // "approve" or "warn"
		Catatan string `json:"catatan"`
	}

	var payload ReviewPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload tidak valid"})
	}

	txErr := config.DB.Transaction(func(tx *gorm.DB) error {
		if payload.Action == "approve" {
			lpj.Status = "disetujui"
			if payload.Catatan != "" {
				lpj.Catatan = payload.Catatan
			}

			// Update proposal status
			if err := tx.Model(&models.Proposal{}).Where("id = ?", lpj.ProposalID).Update("status", "selesai").Error; err != nil {
				return err
			}

			// Create cash mutation
			if err := tx.Create(&models.OrmawaMutasiSaldo{
				OrmawaID:   lpj.Proposal.OrmawaID,
				Tipe:       "keluar",
				Nominal:    lpj.RealisasiAnggaran,
				Kategori:   "Kegiatan Selesai",
				Deskripsi:  "Realisasi Dana LPJ: " + lpj.Proposal.Judul,
				Tanggal:    time.Now(),
				ProposalID: &lpj.ProposalID,
				Sumber:     "kampus",
			}).Error; err != nil {
				return err
			}

			// Award points
			if err := gamifikasi.AwardOrmawaPoints(tx, lpj.Proposal.OrmawaID, "lpj_disetujui", 100, "tambah", fmt.Sprintf("LPJ disetujui: %s", lpj.Proposal.Judul)); err != nil {
				return err
			}

		} else if payload.Action == "warn" {
			lpj.Status = "Warning Sent"
			if payload.Catatan != "" {
				lpj.Catatan = payload.Catatan
			}

			// Deduct points
			if err := gamifikasi.AwardOrmawaPoints(tx, lpj.Proposal.OrmawaID, "lpj_terlambat", -50, "kurang", fmt.Sprintf("Peringatan LPJ terlambat/tidak lengkap: %s", lpj.Proposal.Judul)); err != nil {
				return err
			}
		} else {
			return fmt.Errorf("action tidak valid")
		}

		if err := tx.Save(&lpj).Error; err != nil {
			return err
		}

		// Create notification
		if err := tx.Create(&models.OrmawaNotifikasi{
			OrmawaID: lpj.Proposal.OrmawaID,
			Tipe:     "lpj",
			Judul:    "Status LPJ Diperbarui",
			Pesan:    fmt.Sprintf("LPJ '%s' telah ditinjau: status berubah menjadi '%s'.", lpj.Proposal.Judul, lpj.Status),
		}).Error; err != nil {
			return err
		}

		return nil
	})

	if txErr != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": txErr.Error()})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "LPJ berhasil ditinjau & poin ormawa diperbarui",
		"data":    lpj,
	})
}

// ========================
// DOSEN (LECTURER) CRUD
// ========================

func GetAllLecturers(c *fiber.Ctx) error {
	var lecturers []models.Dosen
	if err := config.DB.Preload("Pengguna").Preload("Fakultas").Preload("ProgramStudi").Find(&lecturers).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memuat data dosen: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": lecturers})
}

func CreateLecturer(c *fiber.Ctx) error {
	var payload struct {
		NIDN           string `json:"NIDN"`
		Nama           string `json:"Nama"`
		Email          string `json:"Email"`
		Jabatan        string `json:"Jabatan"`
		FakultasID     uint   `json:"FakultasID"`
		ProgramStudiID uint   `json:"ProgramStudiID"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload tidak valid"})
	}

	tx := config.DB.Begin()

	var user models.User
	err := tx.Where("email = ?", payload.Email).First(&user).Error
	if err == gorm.ErrRecordNotFound {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		if err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengamankan password"})
		}
		user = models.User{
			Email:          payload.Email,
			Password:       string(hashedPassword),
			Role:           "dosen",
			FakultasID:     &payload.FakultasID,
			ProgramStudiID: &payload.ProgramStudiID,
		}
		if err := tx.Create(&user).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal membuat akun dosen: " + err.Error()})
		}
	} else if err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Database error: " + err.Error()})
	}

	dosen := models.Dosen{
		PenggunaID:     user.ID,
		NIDN:           payload.NIDN,
		Nama:           payload.Nama,
		FakultasID:     payload.FakultasID,
		ProgramStudiID: payload.ProgramStudiID,
		Jabatan:        payload.Jabatan,
		Email:          payload.Email,
	}

	if err := tx.Create(&dosen).Error; err != nil {
		tx.Rollback()
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "NIDN sudah digunakan"})
		}
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan data dosen: " + err.Error()})
	}

	tx.Commit()
	return c.JSON(fiber.Map{"status": "success", "message": "Dosen berhasil didaftarkan", "data": dosen})
}

func UpdateLecturer(c *fiber.Ctx) error {
	id := c.Params("id")
	var dosen models.Dosen
	if err := config.DB.Preload("Pengguna").First(&dosen, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Dosen tidak ditemukan"})
	}

	var payload struct {
		NIDN           string `json:"NIDN"`
		Nama           string `json:"Nama"`
		Email          string `json:"Email"`
		Jabatan        string `json:"Jabatan"`
		FakultasID     uint   `json:"FakultasID"`
		ProgramStudiID uint   `json:"ProgramStudiID"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload tidak valid"})
	}

	tx := config.DB.Begin()

	dosen.NIDN = payload.NIDN
	dosen.Nama = payload.Nama
	dosen.FakultasID = payload.FakultasID
	dosen.ProgramStudiID = payload.ProgramStudiID
	dosen.Jabatan = payload.Jabatan
	dosen.Email = payload.Email

	if err := tx.Save(&dosen).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui data dosen: " + err.Error()})
	}

	if dosen.PenggunaID != 0 && payload.Email != "" {
		if err := tx.Exec("UPDATE public.users SET email = ?, fakultas_id = ?, program_studi_id = ? WHERE id = ?", payload.Email, payload.FakultasID, payload.ProgramStudiID, dosen.PenggunaID).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui akun terkait: " + err.Error()})
		}
	}

	tx.Commit()
	return c.JSON(fiber.Map{"status": "success", "message": "Data dosen diperbarui", "data": dosen})
}

func DeleteLecturer(c *fiber.Ctx) error {
	id := c.Params("id")
	var dosen models.Dosen
	if err := config.DB.First(&dosen, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Dosen tidak ditemukan"})
	}

	tx := config.DB.Begin()
	penggunaID := dosen.PenggunaID

	if err := tx.Delete(&dosen).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus profil dosen: " + err.Error()})
	}

	if penggunaID != 0 {
		if err := tx.Exec("DELETE FROM public.users WHERE id = ?", penggunaID).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus akun dosen: " + err.Error()})
		}
	}

	tx.Commit()
	return c.JSON(fiber.Map{"status": "success", "message": "Data dosen dihapus"})
}



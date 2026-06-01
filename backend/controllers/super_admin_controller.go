package controllers

import (
	"fmt"
	"log"
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

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
			COALESCE(m.nama, d.nama, ps.nama, km.name) as identity_name,
			COALESCE(m.nim, d.n_id_n) as identity_code,
			p.nama as prodi_nama,
			km.scope_type as kencana_scope_type,
			COALESCE(m.foto_url, '') as foto_url,
			(SELECT orm.nama FROM ormawa.ormawa_anggota oa 
			 JOIN ormawa.ormawa orm ON orm.id = oa.ormawa_id 
			 WHERE oa.mahasiswa_id = m.id LIMIT 1) as ormawa_nama
		`).
		Joins(`LEFT JOIN "fakultas"."fakultas" f ON f.id = "public"."users".fakultas_id`).
		Joins(`LEFT JOIN "mahasiswa"."mahasiswa" m ON m.pengguna_id = "public"."users".id`).
		Joins(`LEFT JOIN "fakultas"."program_studi" p ON p.id = m.program_studi_id`).
		Joins(`LEFT JOIN "fakultas"."dosen" d ON d.pengguna_id = "public"."users".id`).
		Joins(`LEFT JOIN "psikolog"."profiles" ps ON ps.user_id = "public"."users".id`).
		Joins(`LEFT JOIN "mahasiswa"."kencana_mentors" km ON km.user_id = "public"."users".id`).
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
	switch role {
	case "super_admin", "faculty_admin", "ormawa_admin", "ormawa", "mahasiswa", "psikolog", "PSIKOLOG", "dosen", "DOSEN", "kencana_admin", "kencana_fakultas", "kencana_mentor":
		return true
	default:
		return false
	}
}

func normalizeKencanaScope(scope string) string {
	if strings.TrimSpace(scope) == "university" {
		return "university"
	}
	return "faculty"
}

// UpdateUserRole handles role assignment and logs the event in log_aktivitas
func UpdateUserRole(c *fiber.Ctx) error {
	type UpdateRequest struct {
		UserID           uint   `json:"userId"`
		Role             string `json:"role"`
		OrmawaID         uint   `json:"ormawaId"`
		OrmawaAssign     string `json:"ormawaAssign"`
		FakultasID       uint   `json:"fakultasId"`
		KencanaScopeType string `json:"kencanaScopeType"`
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		fmt.Printf(">>> RBAC Error: BodyParser failed: %v\n", err)
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request payload"})
	}
	fmt.Printf(">>> RBAC: Updating User %d to Role %s\n", req.UserID, req.Role)

	// 1. Find user to be modified
	var user models.User
	if err := config.DB.First(&user, req.UserID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "User not found"})
	}

	req.Role = strings.TrimSpace(req.Role)
	req.KencanaScopeType = normalizeKencanaScope(req.KencanaScopeType)
	if !isAllowedRBACRole(req.Role) {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Role tidak valid"})
	}
	if req.Role == "kencana_fakultas" && req.FakultasID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Fakultas wajib dipilih untuk Admin Kencana Fakultas"})
	}
	if req.Role == "kencana_mentor" && req.KencanaScopeType == "faculty" && req.FakultasID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Fakultas wajib dipilih untuk Mentor Kencana scope fakultas"})
	}

	// 2. Execution with User Update
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		var fakultasPtr *uint
		if req.FakultasID != 0 {
			fakultasPtr = &req.FakultasID
		}

		// Update user role via raw SQL to bypass any GORM association issues
		if err := tx.Exec("UPDATE public.users SET role = ?, ormawa_assign = ?, fakultas_id = ?, updated_at = ? WHERE id = ?", req.Role, req.OrmawaAssign, fakultasPtr, time.Now(), user.ID).Error; err != nil {
			return err
		}

		if req.Role == "kencana_mentor" {
			mentor := models.KencanaMentor{UserID: user.ID, Name: strings.Split(user.Email, "@")[0], Email: user.Email, ScopeType: req.KencanaScopeType, FakultasID: fakultasPtr, Status: "active"}
			var existing models.KencanaMentor
			if err := tx.Where("user_id = ?", user.ID).First(&existing).Error; err == nil {
				existing.ScopeType = req.KencanaScopeType
				existing.FakultasID = fakultasPtr
				existing.Status = "active"
				if existing.Name == "" {
					existing.Name = mentor.Name
				}
				if err := tx.Save(&existing).Error; err != nil {
					return err
				}
			} else if err == gorm.ErrRecordNotFound {
				if err := tx.Create(&mentor).Error; err != nil {
					return err
				}
			} else {
				return err
			}
		}

		// Handle Ormawa Assignment for ormawa_admin
		if req.Role == "ormawa_admin" && req.OrmawaID != 0 {
			var mhs models.Mahasiswa
			if err := tx.Where("pengguna_id = ?", user.ID).First(&mhs).Error; err == nil {
				// Create or update membership
				var exists bool
				tx.Raw("SELECT EXISTS(SELECT 1 FROM ormawa.ormawa_anggota WHERE mahasiswa_id = ? AND ormawa_id = ?)", mhs.ID, req.OrmawaID).Scan(&exists)
				if !exists {
					tx.Exec("INSERT INTO ormawa.ormawa_anggota (mahasiswa_id, ormawa_id, role, status, joined_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
						mhs.ID, req.OrmawaID, "Ketua/Admin", "aktif", time.Now(), time.Now(), time.Now())
				}
			}
		}

		// Log activity (Temporarily disabled until schema fix)
		/*
			logEntry := models.LogAktivitas{
				UserID:    user.ID,
				Aktivitas: "UPDATE_USER_ROLE",
				Deskripsi: fmt.Sprintf("Changed role from '%s' to '%s'. IP: %s", oldRole, req.Role, c.IP()),
				IPAddress: c.IP(),
			}
			if err := tx.Create(&logEntry).Error; err != nil {
				return err
			}
		*/

		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Critical failure during role update",
			"debug":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Institutional role has been successfully updated",
		"data": fiber.Map{
			"user":     user.Email,
			"new_role": req.Role,
		},
	})
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

	requiresFakultas := true
	if req.Role == "super_admin" || req.Role == "psikolog" || req.Role == "PSIKOLOG" || req.Role == "kencana_admin" || (req.Role == "kencana_mentor" && req.KencanaScopeType == "university") {
		requiresFakultas = false
	}
	if req.Role == "kencana_fakultas" {
		requiresFakultas = false // Handled separately below
	}

	if requiresFakultas && req.FakultasID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Fakultas wajib dipilih"})
	}
	if req.Role == "kencana_fakultas" && req.FakultasID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Fakultas wajib dipilih untuk Admin Kencana Fakultas"})
	}

	if req.Role == "ormawa_admin" && req.ProgramStudiID != 0 {
		var prodi models.ProgramStudi
		if err := config.DB.First(&prodi, req.ProgramStudiID).Error; err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Program studi tidak valid"})
		}
		if req.FakultasID != 0 && prodi.FakultasID != req.FakultasID {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Program studi tidak sesuai fakultas"})
		}
	}

	if req.Role == "mahasiswa" || req.Role == "MAHASISWA" {
		if req.ProgramStudiID == 0 {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Program studi wajib dipilih untuk mahasiswa"})
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

		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		// 2. Create Identity Link (Mahasiswa/Dosen/etc)
		switch req.Role {
		case "mahasiswa", "MAHASISWA":
			nim := strings.Split(req.Email, "@")[0] // Fallback NIM from email
			mhs := models.Mahasiswa{
				PenggunaID:     user.ID,
				Nama:           req.Nama,
				NIM:            nim,
				FakultasID:     req.FakultasID,
				ProgramStudiID: req.ProgramStudiID,
				StatusAkun:     "Aktif",
				StatusAkademik: "Aktif",
				TahunMasuk:     time.Now().Year(),
			}
			if err := tx.Create(&mhs).Error; err != nil {
				return err
			}
		case "dosen", "DOSEN":
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
		case "ormawa_admin":
			nim := strings.Split(req.Email, "@")[0]
			mhs := models.Mahasiswa{
				PenggunaID:       user.ID,
				Nama:             req.Nama,
				NIM:              nim,
				FakultasID:       req.FakultasID,
				ProgramStudiID:   req.ProgramStudiID, // Optional for ormawa_admin
				StatusAkun:       "Aktif",
				StatusAkademik:   "Aktif",
				SemesterSekarang: 1,
				TahunMasuk:       time.Now().Year(),
			}
			if err := tx.Create(&mhs).Error; err != nil {
				return err
			}

			// Assign to Ormawa if provided
			if req.OrmawaID != 0 {
				tx.Exec("INSERT INTO ormawa.ormawa_anggota (mahasiswa_id, ormawa_id, role, status, joined_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
					mhs.ID, req.OrmawaID, "Ketua/Admin", "aktif", time.Now(), time.Now(), time.Now())
			}
		case "psikolog", "PSIKOLOG":
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
		case "kencana_mentor":
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
	c.BodyParser(&fak)
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
	var mhs models.Mahasiswa
	if err := c.BodyParser(&mhs); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	// 1. Create User automatically
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		email := mhs.EmailKampus
		if email == "" {
			email = fmt.Sprintf("%s@bku.ac.id", mhs.NIM)
		}

		defaultPassword := "password123"
		if mhs.NIM != "" {
			defaultPassword = "pass" + mhs.NIM
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
		mhs.SemesterSekarang = 1
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
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Mahasiswa not found"})
	}
	if err := c.BodyParser(&mhs); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Save(&mhs)
	return c.JSON(fiber.Map{"status": "success", "data": mhs})
}

func DeleteStudent(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Mahasiswa{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Mahasiswa deleted"})
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
			"ID":            b.ID,
			"Nama":          b.Nama,
			"Penyelenggara": b.Penyelenggara,
			"Deskripsi":     b.Deskripsi,
			"Deadline":      b.Deadline,
			"Kuota":         b.Kuota,
			"IPKMin":        b.IPKMin,
			"Anggaran":      b.Anggaran, // Capitalized for Frontend
			"CreatedAt":     b.CreatedAt,
		}
		mappedList = append(mappedList, m)
	}

	return c.JSON(fiber.Map{"status": "success", "data": mappedList})
}

func CreateScholarship(c *fiber.Ctx) error {
	var payload struct {
		Nama          string  `json:"Nama"`
		Penyelenggara string  `json:"Penyelenggara"`
		Deskripsi     string  `json:"Deskripsi"`
		Deadline      string  `json:"Deadline"`
		Kuota         int     `json:"Kuota"`
		IPKMin        float64 `json:"IPKMin"`
		Anggaran      float64 `json:"Anggaran"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	dead, _ := time.Parse(time.RFC3339, payload.Deadline)

	err := config.DB.Exec("INSERT INTO mahasiswa.beasiswa (nama, penyelenggara, deskripsi, deadline, kuota, ip_k_min, anggaran, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		payload.Nama, payload.Penyelenggara, payload.Deskripsi, dead, payload.Kuota, payload.IPKMin, payload.Anggaran, time.Now(), time.Now()).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Beasiswa created"})
}

func UpdateScholarship(c *fiber.Ctx) error {
	id := c.Params("id")
	var payload struct {
		Nama          string  `json:"Nama"`
		Penyelenggara string  `json:"Penyelenggara"`
		Deskripsi     string  `json:"Deskripsi"`
		Deadline      string  `json:"Deadline"`
		Kuota         int     `json:"Kuota"`
		IPKMin        float64 `json:"IPKMin"`
		Anggaran      float64 `json:"Anggaran"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	dead, _ := time.Parse(time.RFC3339, payload.Deadline)

	err := config.DB.Exec("UPDATE mahasiswa.beasiswa SET nama = ?, penyelenggara = ?, deskripsi = ?, deadline = ?, kuota = ?, ip_k_min = ?, anggaran = ?, updated_at = ? WHERE id = ?",
		payload.Nama, payload.Penyelenggara, payload.Deskripsi, dead, payload.Kuota, payload.IPKMin, payload.Anggaran, time.Now(), id).Error

	if err != nil {
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

	var application models.BeasiswaPendaftaran
	if err := config.DB.Preload("Beasiswa").First(&application, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Application not found"})
	}

	application.Status = payload.Status
	application.Catatan = payload.Catatan

	if err := config.DB.Save(&application).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

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

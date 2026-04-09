package config

import (
	"log"
	"siakad-backend/models"

	"gorm.io/gorm"
)

func migrateModels(db *gorm.DB) error {
	// Buat schema fakultas_admin jika belum ada
	db.Exec("CREATE SCHEMA IF NOT EXISTS fakultas_admin;")

	return db.AutoMigrate(
		// ─── PUBLIC SCHEMA ──────────────────────────────────────────────────────
		// Core Entities
		&models.Role{},
		&models.User{},
		&models.Faculty{},
		&models.Major{},
		&models.Lecturer{},
		&models.Student{},
		// Akademik & KRS
		&models.PeriodeAkademik{},
		&models.MataKuliah{},
		&models.MataKuliahPrasyarat{},
		&models.JadwalKuliah{},
		&models.KHS{},
		&models.KRSHeader{},
		&models.KRSDetail{},
		// Kencana (PKKMB)
		&models.KencanaTahap{},
		&models.KencanaMateri{},
		&models.KencanaKuis{},
		&models.KuisSoal{},
		&models.KencanaHasilKuis{},
		&models.KencanaProgress{},
		&models.KencanaBanding{},
		&models.KencanaSertifikat{},
		// Prestasi, Beasiswa, Konseling
		&models.Achievement{},
		&models.Beasiswa{},
		&models.PengajuanBeasiswa{},
		&models.PengajuanBerkas{},
		&models.PengajuanPipelineLog{},
		&models.JadwalKonseling{},
		&models.BookingKonseling{},
		// Student Voice & Organisasi
		&models.TiketAspirasi{},
		&models.TiketTimelineEvent{},
		&models.RiwayatOrganisasi{},
		// Notifikasi & Umum
		&models.Pengumuman{},
		&models.KegiatanKampus{},
		&models.AktivitasLog{},
		&models.LoginHistory{},
		&models.NotificationPreference{},
		&models.Notification{},
		// PKKMB & Health from new SQL
		&models.ProgramScreening{},
		&models.HasilScreening{},
		&models.PkkmbKegiatan{},
		&models.Article{},
		&models.Admission{},
		// Ormawa
		&models.Ormawa{},
		&models.OrmawaMember{},
		&models.Proposal{},
		&models.ProposalHistory{},
		&models.CashMutation{},
		&models.OrmawaRole{},
		&models.LPJ{},
		&models.LPJDocument{},
		&models.OrmawaAspiration{},
		&models.EventSchedule{},
		&models.EventAttendance{},
		&models.OrmawaAnnouncement{},
		&models.OrmawaNotification{},
		&models.OrmawaDivision{},

		// ─── SCHEMA: fakultas_admin ──────────────────────────────────────────────
		// Core Admin Fakultas (diperlukan sebelum tabel feature)
		&models.FakRole{},
		&models.FakFaculty{},
		&models.FakUser{},
		&models.FakMajor{},
		&models.FakLecturer{},
		// Bridge: Data Mahasiswa di sisi Admin Fakultas
		&models.FakStudent{},
		// Feature Tables (bergantung ke FakStudent)
		&models.FakAchievement{},
		&models.FakPKKMB{},
		&models.FakHealthScreening{},
		&models.FakAspiration{},
		&models.FakScholarship{},
		&models.FakScholarshipApp{},
		&models.FakCounseling{},
	)
}

// InitialSyncFakultas melakukan sinkronisasi awal data dari public schema ke fakultas_admin.
// Ini berguna jika tabel baru saja dibuat dan kita ingin data lama langsung muncul di sana.
func InitialSyncFakultas(db *gorm.DB) {
	log.Println("[Initial Sync] Memulai sinkronisasi data ke fakultas_admin...")

	// 1. Sync Faculties
	var faculties []models.Faculty
	db.Find(&faculties)
	for _, f := range faculties {
		models.SyncFacultyToAdmin(db, &f)
	}

	// 2. Sync Majors
	var majors []models.Major
	db.Find(&majors)
	for _, m := range majors {
		models.SyncMajorToAdmin(db, &m)
	}

	// 3. Sync Students
	var students []models.Student
	db.Find(&students)
	for _, s := range students {
		models.SyncStudentToFaculty(db, &s)
	}

	log.Println("[Initial Sync] Sinkronisasi selesai.")
}

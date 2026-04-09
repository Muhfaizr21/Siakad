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
		&models.Peran{},
		&models.Pengguna{},
		&models.Fakultas{},
		&models.ProgramStudi{},
		&models.Dosen{},
		&models.Mahasiswa{},
		// Kencana (PKKMB)
		&models.KencanaTahap{},
		&models.KencanaMateri{},
		&models.KencanaKuis{},
		&models.KuisSoal{},
		&models.KencanaHasilKuis{},
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
		// PKKMB & Health
		&models.PkkmbKegiatan{},
		&models.PkkmbMateri{},
		&models.PkkmbTugas{},
		&models.PkkmbKelulusan{},
		&models.HasilKesehatan{},
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
		// Proposal Baru
		&models.PengajuanSurat{},
		&models.ProgramMBKM{},
		&models.OrganisasiMahasiswa{},
		&models.ProposalOrmawa{},
		&models.ProposalFakultas{},
	)
}

// InitialSyncFakultas melakukan sinkronisasi awal data dari public schema ke fakultas_admin.
func InitialSyncFakultas(db *gorm.DB) {
	log.Println("[Initial Sync] Memulai sinkronisasi data ke fakultas_admin...")

	// 1. Sync Faculties
	var faculties []models.Fakultas
	db.Find(&faculties)
	for _, f := range faculties {
		models.SyncFakultasKeAdmin(db, &f)
	}

	// 2. Sync Majors
	var majors []models.ProgramStudi
	db.Find(&majors)
	for _, m := range majors {
		models.SyncProdiKeAdmin(db, &m)
	}

	// 3. Sync Students
	var students []models.Mahasiswa
	db.Find(&students)
	for _, s := range students {
		models.SyncMahasiswaKeFakultas(db, &s)
	}

	log.Println("[Initial Sync] Sinkronisasi selesai.")
}

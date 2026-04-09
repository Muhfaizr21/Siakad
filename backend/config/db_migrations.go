package config

import (
	"log"
	"siakad-backend/models"

	"gorm.io/gorm"
)

func migrateModels(db *gorm.DB) error {
	// Buat schema fakultas_admin jika belum ada
	db.Exec("CREATE SCHEMA IF NOT EXISTS fakultas_admin;")

	// 1. Core Public Entities
	log.Println("[Migration] Migrating Core Public Entities...")
	if err := db.AutoMigrate(
		&models.Role{},
		&models.User{},
		&models.Faculty{},
		&models.Major{},
		&models.Lecturer{},
		&models.Student{},
		&models.PeriodeAkademik{},
		&models.MataKuliah{},
		&models.MataKuliahPrasyarat{},
		&models.JadwalKuliah{},
		&models.KHS{},
		&models.KRSHeader{},
		&models.KRSDetail{},
	); err != nil {
		log.Printf("[Migration Error] Core Public: %v", err)
	}

	// 2. Kencana & Feature Modules
	log.Println("[Migration] Migrating Feature Modules...")
	if err := db.AutoMigrate(
		&models.KencanaTahap{},
		&models.KencanaMateri{},
		&models.KencanaKuis{},
		&models.KuisSoal{},
		&models.KencanaHasilKuis{},
		&models.KencanaProgress{},
		&models.KencanaBanding{},
		&models.KencanaSertifikat{},
		&models.Achievement{},
		&models.Beasiswa{},
		&models.PengajuanBeasiswa{},
		&models.PengajuanBerkas{},
		&models.PengajuanPipelineLog{},
		&models.JadwalKonseling{},
		&models.BookingKonseling{},
		&models.TiketAspirasi{},
		&models.TiketTimelineEvent{},
		&models.RiwayatOrganisasi{},
		&models.Pengumuman{},
		&models.KegiatanKampus{},
		&models.AktivitasLog{},
		&models.LoginHistory{},
		&models.NotificationPreference{},
		&models.Notification{},
	); err != nil {
		log.Printf("[Migration Error] Feature Modules: %v", err)
	}

	// 3. Health & Ormawa
	log.Println("[Migration] Migrating Health & Ormawa...")
	if err := db.AutoMigrate(
		&models.ProgramScreening{},
		&models.HasilScreening{},
		&models.HasilKesehatan{},
		&models.PkkmbKegiatan{},
		&models.Article{},
		&models.Admission{},
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
	); err != nil {
		log.Printf("[Migration Error] Health/Ormawa: %v", err)
	}

	// 4. Schema: fakultas_admin
	log.Println("[Migration] Migrating Fakultad Admin Schema...")
	if err := db.AutoMigrate(
		&models.FakRole{},
		&models.FakFaculty{},
		&models.FakUser{},
		&models.FakMajor{},
		&models.FakLecturer{},
		&models.FakStudent{},
		&models.FakAchievement{},
		&models.FakPKKMB{},
		&models.FakHealthScreening{},
		&models.FakAspiration{},
		&models.FakScholarship{},
		&models.FakScholarshipApp{},
		&models.FakCounseling{},
		&models.PeriodeAkademikFak{},
		&models.PkkmbMateri{},
		&models.PkkmbTugas{},
		&models.PkkmbKelulusan{},
		&models.PengajuanSurat{},
		&models.ProgramMBKM{},
		&models.OrganisasiMahasiswa{},
		&models.ProposalOrmawa{},
		&models.ProposalFakultas{},
		&models.PengumumanFak{},
		&models.BeritaFak{},
	); err != nil {
		log.Printf("[Migration Error] Fakultad Admin: %v", err)
	}

	return nil
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

	ResetSequences(db)
	log.Println("[Initial Sync] Sinkronisasi selesai.")
}

// ResetSequences mensinkronkan kembali sequence ID PostgreSQL dengan data yang ada di tabel.
// Hal ini mencegah error "duplicate key value violates unique constraint" saat menambahkan data baru
// setelah proses Seeding data dengan ID manual.
func ResetSequences(db *gorm.DB) {
	log.Println("[Database] Mensinkronkan sequence ID...")
	
	tables := []struct {
		SchemaName string
		TableName  string
	}{
		{"public", "roles"},
		{"public", "users"},
		{"public", "fakultas"},
		{"public", "program_studi"},
		{"public", "dosen"},
		{"public", "mahasiswa"},
		{"fakultas_admin", "peran"},
		{"fakultas_admin", "pengguna"},
		{"fakultas_admin", "fakultas"},
		{"fakultas_admin", "program_studi"},
		{"fakultas_admin", "dosen"},
		{"fakultas_admin", "mahasiswa"},
	}

	for _, t := range tables {
		fullName := t.TableName
		if t.SchemaName != "public" {
			fullName = t.SchemaName + "." + t.TableName
		}
		
		// Kita cari nama sequence-nya (biasanya {table}_{column}_seq)
		// Tapi lebih aman pakai pg_get_serial_sequence
		var seqName string
		db.Raw("SELECT pg_get_serial_sequence(?, 'id')", fullName).Scan(&seqName)
		
		if seqName != "" {
			db.Exec("SELECT setval(?, COALESCE((SELECT MAX(id) FROM ?), 1), true)", seqName, fullName)
		}
	}
	log.Println("[Database] Sequence ID berhasil disinkronkan.")
}

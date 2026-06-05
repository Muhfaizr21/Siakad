package config

import (
	"fmt"
	"log"
	"siakad-backend/models"

	"gorm.io/gorm"
)

func migrateModels(db *gorm.DB) error {
	// ========================
	// CREATE SCHEMA
	// ========================
	schemas := []string{"public", "fakultas", "mahasiswa", "ormawa", "psikolog"}
	for _, s := range schemas {
		if err := db.Exec(fmt.Sprintf("CREATE SCHEMA IF NOT EXISTS %s;", s)).Error; err != nil {
			return err
		}
	}

	// ========================
	// PUBLIC (GLOBAL / AUTH / MASTER)
	// ========================
	if err := db.AutoMigrate(
		&models.User{},
		&models.RBACRole{},
		&models.ThemeSettings{},
		&models.TenagaKesehatan{},
		&models.JadwalKesehatan{},
		&models.BookingKesehatan{},
		&models.PemeriksaanMassal{},
		&models.PengajuanAsuransi{},
		&models.BeritaAcaraPemeriksaan{},
		&models.SelfScreening{},
		&models.RujukanKesehatan{},
		&models.ThemeSettings{},
	); err != nil {
		return err
	}

	// ========================
	// FAKULTAS
	// ========================
	if err := db.AutoMigrate(
		&models.Fakultas{},
		&models.ProgramStudi{},
		&models.Dosen{},
	); err != nil {
		return err
	}

	if err := db.AutoMigrate(
		&models.AcademicPeriod{},
		&models.PengaturanAkademik{},
		&models.ProgramMBKM{},
		&models.Berita{},
	); err != nil {
		return err
	}

	// ========================
	// MAHASISWA
	// ========================
	if err := db.AutoMigrate(
		&models.Mahasiswa{},
		&models.Prestasi{},
		&models.Beasiswa{},
		&models.BeasiswaPendaftaran{},
		&models.Aspirasi{},
		&models.JadwalKonseling{},
		&models.Konseling{},
		&models.PengajuanSurat{},
		&models.Kesehatan{},
		&models.LogAktivitas{},
		&models.RiwayatOrganisasi{},
		&models.Notifikasi{},
		&models.PendaftaranMahasiswaBaru{},
	); err != nil {
		return err
	}

	// ========================
	// PSIKOLOG
	// ========================
	if err := db.AutoMigrate(
		&models.Psikolog{},
		&models.PsikologScheduleSlot{},
		&models.PsikologBooking{},
		&models.PsikologSessionNote{},
		&models.PsikologAssessment{},
		&models.PsikologNotification{},
		&models.PsikologReferral{},
	); err != nil {
		return err
	}

	// ========================
	// ORMAWA
	// ========================
	if err := db.AutoMigrate(
		&models.Proposal{},
		&models.ProposalRiwayat{},
		&models.Ormawa{},
		&models.OrmawaAnggota{},
		&models.OrmawaDivisi{},
		&models.OrmawaRole{},
		&models.OrmawaKegiatan{},
		&models.OrmawaKehadiran{},
		&models.OrmawaPengumuman{},
		&models.OrmawaMutasiSaldo{},
		&models.OrmawaAspirasi{},
		&models.OrmawaNotifikasi{},
		&models.LaporanPertanggungjawaban{},
		&models.OrmawaPoinHistory{},
		&models.OrmawaGamifikasiRule{},
	); err != nil {
		return err
	}

	// ========================
	// PKKMB (MASUK MAHASISWA)
	// ========================
	if err := db.AutoMigrate(
		&models.PkkmbTahap{},
		&models.PkkmbMateri{},
		&models.PkkmbKegiatan{},
		&models.PkkmbProgress{},
		&models.PkkmbHasil{},
		&models.PkkmbBanding{},
		&models.PkkmbSertifikat{},
		&models.PkkmbQuiz{},
		&models.PkkmbQuizQuestion{},
		&models.PkkmbQuizOption{},
		&models.PkkmbQuizAttempt{},
	); err != nil {
		return err
	}

	// ========================
	// KENCANA ORIENTASI MAHASISWA
	// ========================
	if err := db.AutoMigrate(
		&models.KencanaPeriod{},
		&models.KencanaTimelinePhase{},
		&models.KencanaFacultyPhase{},
		&models.KencanaStage{},
		&models.KencanaSession{},
		&models.KencanaMaterial{},
		&models.KencanaMaterialProgress{},
		&models.KencanaQuiz{},
		&models.KencanaQuestion{},
		&models.KencanaQuestionOption{},
		&models.KencanaQuizAttempt{},
		&models.KencanaQuizAnswer{},
		&models.KencanaAssignment{},
		&models.KencanaAssignmentSubmission{},
		&models.KencanaHandbook{},
		&models.KencanaAttendance{},
		&models.KencanaScore{},
		&models.KencanaScoreItem{},
		&models.KencanaMentor{},
		&models.KencanaGroup{},
		&models.KencanaGroupMember{},
		&models.KencanaMentorAssignment{},
		&models.KencanaRemedial{},
		&models.KencanaCertificate{},
	); err != nil {
		return err
	}

	return nil
}

// ========================
// SYNC DATA (OPTIONAL)
// ========================

func InitialSyncFakultas(db *gorm.DB) {
	log.Println("[Initial Sync] Memulai sinkronisasi data ke fakultas...")

	var count int64
	db.Table("fakultas.fakultas").Count(&count)
	if count == 0 {
		log.Println("[Initial Sync] Tabel fakultas kosong. Melakukan seeding data awal...")
		seeds := []models.Fakultas{
			{Nama: "School of Computing", Kode: "SOC", Email: "soc@bku.ac.id"},
			{Nama: "School of Nursing", Kode: "SON", Email: "son@bku.ac.id"},
			{Nama: "School of Pharmacy", Kode: "SOP", Email: "sop@bku.ac.id"},
		}
		for _, s := range seeds {
			db.Create(&s)
		}
		log.Println("[Initial Sync] Seeding selesai.")
	}

	var admissionCount int64
	db.Model(&models.PendaftaranMahasiswaBaru{}).Count(&admissionCount)
	if admissionCount == 0 {
		log.Println("[Initial Sync] Tabel pendaftaran_mahasiswa_baru kosong. Melakukan seeding 100 data calon mahasiswa baru...")
		firstNames := []string{
			"Aditya", "Bagas", "Cahyo", "Dimas", "Erlangga", "Fahri", "Galih", "Hafiz", "Ihsan", "Jatmiko",
			"Kresna", "Lutfi", "Mahendra", "Naufal", "Okta", "Prabowo", "Raditya", "Satria", "Tegar", "Utomo",
			"Wahyu", "Yuda", "Zaki", "Alya", "Bunga", "Clara", "Dina", "Elsa", "Farida", "Gisela",
			"Hana", "Intan", "Jasmine", "Keyla", "Lia", "Mutiara", "Nadia", "Olga", "Putri", "Rania",
			"Salsa", "Tiara", "Ulya", "Vina", "Winda", "Yasmine", "Zahra", "Aldo", "Bimo", "Daffa",
		}
		lastNames := []string{
			"Saputra", "Pratama", "Wibowo", "Setiawan", "Hidayat", "Nugraha", "Kurnia", "Lestari", "Putri",
			"Utami", "Rahmawati", "Wijaya", "Kusuma", "Anggraini", "Fitriani", "Indriani", "Permata", "Sari",
			"Ramadhan", "Gunawan", "Susanto", "Budiman", "Hartono", "Siregar", "Nasution", "Pramono",
		}
		jalurList := []string{"SNBP", "SNBT", "Mandiri"}

		randIndex := 0
		for i := 1; i <= 100; i++ {
			fn := firstNames[randIndex%len(firstNames)]
			ln := lastNames[(randIndex+7)%len(lastNames)]
			fullName := fn + " " + ln
			emailName := fmt.Sprintf("%s.%s%d@gmail.com", fn, ln, i)

			prodi := "Farmasi S1"
			if i%3 == 0 {
				prodi = "Farmasi D3"
			}

			jalur := jalurList[randIndex%len(jalurList)]

			status := "Verified"
			if i%5 == 0 {
				status = "Pending"
			} else if i%13 == 0 {
				status = "Rejected"
			}

			db.Create(&models.PendaftaranMahasiswaBaru{
				NomorDaftar:  fmt.Sprintf("PMB-2024-%03d", i),
				NamaLengkap:  fullName,
				Email:        emailName,
				PilihanProdi: prodi,
				Jalur:        jalur,
				Status:       status,
				NoHP:         fmt.Sprintf("08123456%03d", i),
				NilaiRapor:   80.0 + float64(i%15),
			})

			randIndex += 13
		}
		log.Println("[Initial Sync] Seeding 100 data pendaftaran_mahasiswa_baru selesai.")
	}

	log.Println("[Initial Sync] Sinkronisasi data selesai.")
}

func InitialSyncGamifikasiRules(db *gorm.DB) {
	log.Println("[Initial Sync] Memulai sinkronisasi aturan gamifikasi...")

	defaultRules := []models.OrmawaGamifikasiRule{
		{Key: "proposal_disetujui", Label: "Proposal Disetujui", Poin: 20, Deskripsi: "Poin diberikan ketika proposal kegiatan disetujui oleh universitas"},
		{Key: "kegiatan_selesai", Label: "Kegiatan Selesai", Poin: 50, Deskripsi: "Poin diberikan ketika kegiatan selesai diselenggarakan dan dilaporkan"},
		{Key: "aspirasi_selesai", Label: "Aspirasi Diselesaikan", Poin: 10, Deskripsi: "Poin diberikan ketika aspirasi mahasiswa berhasil ditangani oleh Ormawa"},
		{Key: "prestasi_terverifikasi", Label: "Prestasi Ormawa Terverifikasi", Poin: 100, Deskripsi: "Poin diberikan ketika prestasi organisasi kemahasiswaan berhasil diverifikasi"},
		{Key: "lpj_disetujui", Label: "LPJ Disetujui", Poin: 100, Deskripsi: "Poin diberikan ketika Laporan Pertanggungjawaban (LPJ) keuangan & proker disetujui"},
		{Key: "lpj_terlambat", Label: "Peringatan Kepatuhan LPJ", Poin: -50, Deskripsi: "Poin dikurangi ketika LPJ terlambat diajukan atau dikirim surat peringatan"},
	}

	for _, rule := range defaultRules {
		var existing models.OrmawaGamifikasiRule
		if err := db.Where("key = ?", rule.Key).First(&existing).Error; err != nil {
			db.Create(&rule)
			log.Printf("[Initial Sync] Seed rule: %s (%d Pts)\n", rule.Key, rule.Poin)
		}
	}
	log.Println("[Initial Sync] Sinkronisasi aturan gamifikasi selesai.")
}

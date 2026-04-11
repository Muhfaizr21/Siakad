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
	schemas := []string{"public", "fakultas", "mahasiswa", "ormawa"}
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

	return nil
}

// ========================
// SYNC DATA (OPTIONAL)
// ========================

func InitialSyncFakultas(db *gorm.DB) {
	log.Println("[Initial Sync] Memulai sinkronisasi data ke fakultas...")

	// contoh nanti:
	// db.Exec("INSERT INTO fakultas.fakultas SELECT * FROM public.fakultas")

	log.Println("[Initial Sync] Sinkronisasi selesai.")
}

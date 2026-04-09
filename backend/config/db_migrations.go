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
	if err := db.Table("public.users").AutoMigrate(
		&models.User{},
	); err != nil {
		return err
	}

	// ========================
	// FAKULTAS
	// ========================
	if err := db.Table("fakultas.fakultas").AutoMigrate(
		&models.Fakultas{},
	); err != nil {
		return err
	}

	if err := db.Table("fakultas.program_studi").AutoMigrate(
		&models.ProgramStudi{},
	); err != nil {
		return err
	}

	if err := db.Table("fakultas.dosen").AutoMigrate(
		&models.Dosen{},
	); err != nil {
		return err
	}

	if err := db.Table("fakultas.pengaturan_akademik").AutoMigrate(
		&models.PengaturanAkademik{},
	); err != nil {
		return err
	}

	if err := db.Table("fakultas.program_mbkm").AutoMigrate(
		&models.ProgramMBKM{},
	); err != nil {
		return err
	}

	if err := db.Table("fakultas.berita").AutoMigrate(
		&models.Berita{},
	); err != nil {
		return err
	}

	// ========================
	// MAHASISWA
	// ========================
	if err := db.Table("mahasiswa.mahasiswa").AutoMigrate(
		&models.Mahasiswa{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.prestasi").AutoMigrate(
		&models.Prestasi{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.beasiswa").AutoMigrate(
		&models.Beasiswa{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.beasiswa_pendaftaran").AutoMigrate(
		&models.BeasiswaPendaftaran{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.aspirasi").AutoMigrate(
		&models.Aspirasi{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.konseling").AutoMigrate(
		&models.Konseling{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.pengajuan_surat").AutoMigrate(
		&models.PengajuanSurat{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.kesehatan").AutoMigrate(
		&models.Kesehatan{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.log_aktivitas").AutoMigrate(
		&models.LogAktivitas{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.riwayat_organisasis").AutoMigrate(
		&models.RiwayatOrganisasi{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.notifikasi").AutoMigrate(
		&models.Notifikasi{},
	); err != nil {
		return err
	}

	// ========================
	// ORMAWA
	// ========================
	if err := db.Table("ormawa.ormawa").AutoMigrate(
		&models.Ormawa{},
	); err != nil {
		return err
	}

	if err := db.Table("ormawa.ormawa_anggota").AutoMigrate(
		&models.OrmawaAnggota{},
	); err != nil {
		return err
	}

	if err := db.Table("ormawa.ormawa_divisi").AutoMigrate(
		&models.OrmawaDivisi{},
	); err != nil {
		return err
	}

	if err := db.Table("ormawa.ormawa_role").AutoMigrate(
		&models.OrmawaRole{},
	); err != nil {
		return err
	}

	if err := db.Table("ormawa.ormawa_kegiatan").AutoMigrate(
		&models.OrmawaKegiatan{},
	); err != nil {
		return err
	}

	if err := db.Table("ormawa.ormawa_kehadiran").AutoMigrate(
		&models.OrmawaKehadiran{},
	); err != nil {
		return err
	}

	if err := db.Table("ormawa.ormawa_pengumuman").AutoMigrate(
		&models.OrmawaPengumuman{},
	); err != nil {
		return err
	}

	if err := db.Table("ormawa.ormawa_mutasi_saldo").AutoMigrate(
		&models.OrmawaMutasiSaldo{},
	); err != nil {
		return err
	}

	if err := db.Table("ormawa.ormawa_aspirasi").AutoMigrate(
		&models.OrmawaAspirasi{},
	); err != nil {
		return err
	}

	if err := db.Table("ormawa.ormawa_notifikasi").AutoMigrate(
		&models.OrmawaNotifikasi{},
	); err != nil {
		return err
	}

	if err := db.Table("ormawa.proposal").AutoMigrate(
		&models.Proposal{},
	); err != nil {
		return err
	}

	if err := db.Table("ormawa.proposal_riwayat").AutoMigrate(
		&models.ProposalRiwayat{},
	); err != nil {
		return err
	}

	if err := db.Table("ormawa.laporan_pertanggungjawaban").AutoMigrate(
		&models.LaporanPertanggungjawaban{},
	); err != nil {
		return err
	}

	// ========================
	// PKKMB (MASUK MAHASISWA)
	// ========================
	if err := db.Table("mahasiswa.pkkmb_kegiatan").AutoMigrate(
		&models.PkkmbKegiatan{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.pkkmb_progress").AutoMigrate(
		&models.PkkmbProgress{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.pkkmb_hasil").AutoMigrate(
		&models.PkkmbHasil{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.pkkmb_banding").AutoMigrate(
		&models.PkkmbBanding{},
	); err != nil {
		return err
	}

	if err := db.Table("mahasiswa.pkkmb_sertifikat").AutoMigrate(
		&models.PkkmbSertifikat{},
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

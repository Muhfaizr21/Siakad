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
		&models.User{},
		&models.Fakultas{},
		&models.ProgramStudi{},
		&models.Dosen{},
		&models.Mahasiswa{},
		&models.PengaturanAkademik{},
		&models.ProgramMBKM{},
		&models.Prestasi{},
		&models.Beasiswa{},
		&models.BeasiswaPendaftaran{},
		&models.Aspirasi{},
		&models.Konseling{},
		&models.PengajuanSurat{},
		&models.Kesehatan{},
		&models.LogAktivitas{},
		&models.RiwayatOrganisasi{},
		&models.Notifikasi{},
		&models.Ormawa{},
		&models.OrmawaAnggota{},
		&models.OrmawaDivisi{},
		&models.OrmawaRole{},
		&models.OrmawaKegiatan{},
		&models.OrmawaKehadiran{},
		&models.OrmawaPengumuman{},
		&models.OrmawaMutasiSaldo{},
		&models.Proposal{},
		&models.ProposalRiwayat{},
		&models.LaporanPertanggungjawaban{},
		&models.PkkmbKegiatan{},
		&models.PkkmbProgress{},
		&models.PkkmbHasil{},
		&models.PkkmbBanding{},
		&models.PkkmbSertifikat{},
		&models.Berita{},
	)
}

// InitialSyncFakultas melakukan sinkronisasi awal data dari public schema ke fakultas_admin.
func InitialSyncFakultas(db *gorm.DB) {
	log.Println("[Initial Sync] Memulai sinkronisasi data ke fakultas_admin...")

	log.Println("[Initial Sync] Sinkronisasi selesai.")
}

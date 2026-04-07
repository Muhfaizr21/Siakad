package config

import (
	"siakad-backend/models"

	"gorm.io/gorm"
)

func migrateModels(db *gorm.DB) error {
	return db.AutoMigrate(
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
	)
}

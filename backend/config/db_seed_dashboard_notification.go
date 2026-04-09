package config

import (
	"time"

	"siakad-backend/models"

	"gorm.io/gorm"
)

func seedDashboardData(db *gorm.DB) {
	var count int64
	db.Model(&models.Berita{}).Count(&count)
	if count == 0 {
		var user models.User
		db.First(&user)
		db.Create(&models.Berita{
			Judul:          "Pendaftaran Beasiswa KIP-K 2025",
			Isi:            "Pendaftaran beasiswa KIP-K dibuka hingga 30 April 2025. Segera lengkapi berkasmu!",
			PenulisID:      user.ID,
			Status:         "Published",
			TanggalPublish: time.Now(),
		})
	}

	var logCount int64
	db.Model(&models.LogAktivitas{}).Count(&logCount)
	if logCount == 0 {
		var mhs models.Mahasiswa
		db.First(&mhs)
		db.Create(&models.LogAktivitas{
			MahasiswaID: mhs.ID,
			Aktivitas:   "Prestasi Verifikasi",
			Deskripsi:   "Prestasi 'Juara 2 Lomba Karya Tulis' berhasil diverifikasi",
		})
	}
}

func seedNotificationData(db *gorm.DB) {
	var notifCount int64
	db.Model(&models.Notifikasi{}).Count(&notifCount)
	if notifCount != 0 {
		return
	}

	var user models.User
	db.First(&user)

	db.Create(&models.Notifikasi{
		UserID:    user.ID,
		Tipe:      "Prestasi",
		Judul:     "Prestasi Diverifikasi",
		Deskripsi: "Pencapaian kamu 'Juara 1 Lomba Koding' telah diverifikasi oleh admin. Selamat!",
		IsRead:    false,
	})
	db.Create(&models.Notifikasi{
		UserID:    user.ID,
		Tipe:      "Sistem",
		Judul:     "Selamat Datang!",
		Deskripsi: "Selamat datang di portal Siakad. Lengkapi profilmu sekarang.",
		IsRead:    true,
	})
}

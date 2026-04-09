package config

import (
	"time"

	"siakad-backend/models"

	"gorm.io/gorm"
)

func seedDashboardData(db *gorm.DB) {
	var pCount int64
	db.Model(&models.Pengumuman{}).Count(&pCount)
	if pCount <= 3 {
		publishedAt := time.Now()
		db.Create(&models.Pengumuman{
			Judul:       "Pendaftaran Beasiswa KIP-K 2025",
			IsiSingkat:  "Pendaftaran beasiswa KIP-K dibuka hingga 30 April 2025. Segera lengkapi berkasmu!",
			IsiLengkap:  "Pengumuman lengkap pendaftaran KIP-K...",
			Kategori:    "Kemahasiswaan",
			IsPinned:    true,
			IsAktif:     true,
			PublishedAt: &publishedAt,
			CreatedAt:   time.Now(),
		})

		db.Create(&models.Pengumuman{
			Judul:       "Informasi Libur Hari Raya",
			IsiSingkat:  "Kegiatan akademik diliburkan mulai tanggal 10 April s.d 15 April 2025.",
			IsiLengkap:  "Detail pengumuman libur...",
			Kategori:    "Umum",
			IsPinned:    false,
			IsAktif:     true,
			PublishedAt: &publishedAt,
			CreatedAt:   time.Now(),
		})
	}

	var kegCount int64
	db.Model(&models.KegiatanKampus{}).Count(&kegCount)
	if kegCount == 0 {
		startDate := time.Now().AddDate(0, 0, 5)
		endDate := startDate.Add(2 * time.Hour)
		db.Create(&models.KegiatanKampus{
			Judul:          "Webinar Persiapan Karir di Industri Farmasi",
			Deskripsi:      "Webinar bersama praktisi dari PT Bio Farma.",
			TanggalMulai:   startDate,
			TanggalSelesai: &endDate,
			Kategori:       "kampus",
			IsAktif:        true,
		})

		kencanaDate := time.Now().AddDate(0, 0, 8)
		db.Create(&models.KegiatanKampus{
			Judul:        "Pelatihan Sistem Akademik (KENCANA)",
			Deskripsi:    "Sesi offline pelatihan penggunaan portal.",
			TanggalMulai: kencanaDate,
			Kategori:     "kencana",
			IsAktif:      true,
		})
	}

	var logCount int64
	db.Model(&models.AktivitasLog{}).Count(&logCount)
	if logCount == 0 {
		db.Create(&models.AktivitasLog{
			StudentID: 1,
			Tipe:      "achievement",
			Deskripsi: "Prestasi 'Juara 2 Lomba Karya Tulis' berhasil diverifikasi",
			Link:      "/student/achievement",
			CreatedAt: time.Now().Add(-2 * time.Hour),
		})
		db.Create(&models.AktivitasLog{
			StudentID: 1,
			Tipe:      "voice",
			Deskripsi: "Tiket aspirasi #SV-20260401-0001 telah direspons oleh admin",
			Link:      "/student/voice",
			CreatedAt: time.Now().AddDate(0, 0, -1),
		})
		db.Create(&models.AktivitasLog{
			StudentID: 1,
			Tipe:      "beasiswa",
			Deskripsi: "Pengajuan beasiswa 'Beasiswa Industri Farmasi Juara' berhasil dikirim",
			Link:      "/student/scholarship",
			CreatedAt: time.Now().AddDate(0, 0, -3),
		})
	}
}

func seedNotificationData(db *gorm.DB) {
	var prefCount int64
	db.Model(&models.NotificationPreference{}).Where("pengguna_id = ?", 1).Count(&prefCount)
	if prefCount == 0 {
		db.Create(&models.NotificationPreference{UserID: 1})
	}

	var notifCount int64
	db.Model(&models.Notification{}).Count(&notifCount)
	if notifCount != 0 {
		return
	}

	db.Create(&models.Notification{
		UserID:    1,
		Type:      "achievement",
		Title:     "Prestasi Diverifikasi",
		Message:   "Pencapaian kamu 'Juara 1 Lomba Koding' telah diverifikasi oleh admin. Selamat!",
		Link:      "/student/achievement",
		IsRead:    false,
	})
	db.Create(&models.Notification{
		UserID:    1,
		Type:      "konseling",
		Title:     "Konseling Dikonfirmasi",
		Message:   "Jadwal konseling kamu besok pukul 10:00 telah dikonfirmasi oleh konselor.",
		Link:      "/student/counseling",
		IsRead:    false,
	})
	db.Create(&models.Notification{
		UserID:    1,
		Type:      "sistem",
		Title:     "Selamat Datang!",
		Message:   "Selamat datang di portal BKU Student Hub. Lengkapi profilmu sekarang.",
		Link:      "/student/profil",
		IsRead:    true,
	})
}

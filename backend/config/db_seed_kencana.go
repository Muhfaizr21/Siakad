package config

import (
	"log"
	"time"

	"siakad-backend/models"

	"gorm.io/gorm"
)

func seedKencanaData(db *gorm.DB) {
	var count int64
	db.Model(&models.PkkmbKegiatan{}).Count(&count)
	if count != 0 {
		return
	}

	Kegiatans := []models.PkkmbKegiatan{
		{
			Judul:     "Pembukaan PKKMB",
			Deskripsi: "Upacara pembukaan dan pengenalan rektorat.",
			Tanggal:   time.Now().AddDate(0, 4, 0),
			Lokasi:    "Gedung Serbaguna",
		},
		{
			Judul:     "Seminar Kebangsaan",
			Deskripsi: "Materi bela negara dan radikalisme.",
			Tanggal:   time.Now().AddDate(0, 4, 1),
			Lokasi:    "Aula Utama",
		},
		{
			Judul:     "Pengenalan Ormawa",
			Deskripsi: "Expo organisasi kemahasiswaan.",
			Tanggal:   time.Now().AddDate(0, 4, 2),
			Lokasi:    "Lapangan Kampus",
		},
	}

	for _, k := range Kegiatans {
		db.Create(&k)
	}

	log.Println("==> Seeder: Setup PKKMB Data successfully.")
}

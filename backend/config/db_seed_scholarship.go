package config

import (
	"log"
	"time"

	"siakad-backend/models"

	"gorm.io/gorm"
)

func seedScholarshipData(db *gorm.DB) {
	scholarships := []models.Beasiswa{
		{
			Nama:          "Beasiswa Bhakti Mahasiswa",
			Penyelenggara: "Yayasan Bhakti Kencana",
			Deskripsi:     "Program bantuan pendidikan semesteran bagi mahasiswa aktif yang memiliki semangat belajar tinggi.",
			Deadline:      time.Now().AddDate(0, 1, 0),
			Kuota:         50,
			IPKMin:        3.25,
		},
		{
			Nama:          "Bantuan Pendidikan Alumni BKU",
			Penyelenggara: "Ikatan Alumni BKU",
			Deskripsi:     "Bantuan khusus untuk penyelesaian tugas akhir (Skripsi).",
			Deadline:      time.Now().AddDate(0, 0, 10),
			Kuota:         20,
			IPKMin:        2.75,
		},
		{
			Nama:          "Beasiswa Industri Juara (Kimia Farma)",
			Penyelenggara: "PT Kimia Farma Tbk.",
			Deskripsi:     "Program beasiswa prestasi dengan ikatan dinas bagi mahasiswa Farmasi terbaik.",
			Deadline:      time.Now().AddDate(0, 0, 5),
			Kuota:         5,
			IPKMin:        3.50,
		},
	}

	for _, s := range scholarships {
		var existing models.Beasiswa
		db.Where("nama = ?", s.Nama).First(&existing)
		if existing.ID == 0 {
			db.Create(&s)
		} else {
			db.Model(&existing).Updates(s)
		}
	}

	log.Println("==> Seeder: Setup Scholarship Data successfully.")
}

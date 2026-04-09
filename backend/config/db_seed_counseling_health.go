package config

import (
	"log"
	"time"

	"siakad-backend/models"

	"gorm.io/gorm"
)

func seedCounselingData(db *gorm.DB) {
	var count int64
	db.Model(&models.Konseling{}).Count(&count)
	if count != 0 {
		return
	}

	var student models.Mahasiswa
	db.First(&student)
	var dosen models.Dosen
	db.First(&dosen)

	db.Create(&models.Konseling{
		MahasiswaID: student.ID,
		DosenID:     dosen.ID,
		Tanggal:     time.Now().AddDate(0, 0, 1),
		Topik:       "Bimbingan Akademik Semester 5",
		Status:      "Selesai",
		Catatan:     "Mahasiswa disarankan fokus pada mata kuliah inti.",
	})

	log.Println("==> Seeder: Setup Counseling Data successfully.")
}

func seedHealthData(db *gorm.DB) {
	var count int64
	db.Model(&models.Kesehatan{}).Count(&count)
	if count != 0 {
		return
	}

	var student models.Mahasiswa
	db.First(&student)

	db.Create(&models.Kesehatan{
		MahasiswaID:      student.ID,
		Tanggal:          time.Now().AddDate(0, -6, 0),
		JenisPemeriksaan: "Screening Mahasiswa Baru",
		Hasil:            "Sehat",
		Catatan:          "Kondisi fisik prima.",
	})

	log.Println("==> Seeder: Setup Health Data successfully.")
}

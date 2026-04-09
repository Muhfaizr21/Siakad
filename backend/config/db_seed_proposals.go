package config

import (
	"log"
	"time"

	"siakad-backend/models"

	"gorm.io/gorm"
)

func seedProposalData(db *gorm.DB) {
	var count int64
	db.Model(&models.Proposal{}).Count(&count)
	if count > 0 {
		return
	}

	// Wait for ormawa data if needed, or create one if not exists
	var ormawa models.Ormawa
	if err := db.First(&ormawa).Error; err != nil {
		log.Println("==> Seeder: No Ormawa found, cannot seed proposals.")
		return
	}

	var faculty models.Faculty
	db.First(&faculty)

	var student models.Student
	db.First(&student)

	proposals := []models.Proposal{
		{
			OrmawaID:    ormawa.ID,
			Title:       "LDKS Organisasi 2026",
			Description: "Latihan Dasar Kepemimpinan Siswa untuk pengurus baru.",
			Budget:      5000000,
			Status:      "disetujui_fakultas",
			FakultasID:  &faculty.ID,
			StudentID:   &student.ID,
			CreatedAt:   time.Now().AddDate(0, 0, -2),
		},
		{
			OrmawaID:    ormawa.ID,
			Title:       "Seminar Nasional Farmasi",
			Description: "Seminar dengan pembicara dari industri farmasi.",
			Budget:      15000000,
			Status:      "disetujui_fakultas",
			FakultasID:  &faculty.ID,
			StudentID:   &student.ID,
			CreatedAt:   time.Now().AddDate(0, 0, -5),
		},
		{
			OrmawaID:    ormawa.ID,
			Title:       "Bakti Sosial Ramadhan",
			Description: "Pembagian sembako di sekitar kampus.",
			Budget:      3000000,
			Status:      "disetujui_univ",
			FakultasID:  &faculty.ID,
			StudentID:   &student.ID,
			CreatedAt:   time.Now().AddDate(0, 0, -10),
		},
		{
			OrmawaID:    ormawa.ID,
			Title:       "Kompetisi E-Sport Universitas",
			Description: "Turnamen game untuk mahasiswa.",
			Budget:      7500000,
			Status:      "revisi",
			FakultasID:  &faculty.ID,
			StudentID:   &student.ID,
			CreatedAt:   time.Now().AddDate(0, 0, -3),
		},
	}

	for _, p := range proposals {
		db.Create(&p)
	}

	log.Println("==> Seeder: Setup Proposal Data successfully.")
}

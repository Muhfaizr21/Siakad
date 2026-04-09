package main

import (
	"log"
	"siakad-backend/config"
	"siakad-backend/models"
	"time"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found")
	}
	config.ConnectDB()

	admissions := []models.Admission{
		{
			NomorDaftar: "PMB-2024-001",
			NamaLengkap: "Ahmad Fauzi",
			Email:       "ahmad.fauzi@email.com",
			NoHp:        "081234567890",
			PilihanProdi: "Teknik Informatika",
			Jalur:       "SNBP",
			Status:      "Diterima",
			NilaiRapor:  85.5,
			TanggalDaftar: time.Now().AddDate(0, 0, -5),
		},
		{
			NomorDaftar: "PMB-2024-002",
			NamaLengkap: "Siti Nurhaliza",
			Email:       "siti.nurhaliza@email.com",
			NoHp:        "081234567891",
			PilihanProdi: "Sistem Informasi",
			Jalur:       "SNBT",
			Status:      "Verifikasi",
			NilaiRapor:  82.3,
			TanggalDaftar: time.Now().AddDate(0, 0, -4),
		},
		{
			NomorDaftar: "PMB-2024-003",
			NamaLengkap: "Budi Santoso",
			Email:       "budi.santoso@email.com",
			NoHp:        "081234567892",
			PilihanProdi: "Teknik Elektro",
			Jalur:       "Mandiri",
			Status:      "Pending",
			NilaiRapor:  78.8,
			TanggalDaftar: time.Now().AddDate(0, 0, -3),
		},
	}

	for _, a := range admissions {
		if err := config.DB.Create(&a).Error; err != nil {
			log.Printf("Gagal seed pendaftar %s: %v", a.NamaLengkap, err)
		}
	}

	log.Println("Seeder PMB Admission berhasil dijalankan!")
}

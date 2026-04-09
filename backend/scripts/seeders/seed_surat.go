package seeders

import (
	"fmt"
	"log"
	"os"
	"siakad-backend/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func SeedSurat() {
	godotenv.Load("../../.env")
	godotenv.Load("../.env")
	godotenv.Load(".env")

	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbName, port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("--- SEEDING LETTER REQUESTS ---")

	var student models.Mahasiswa
	db.First(&student)

	if student.ID == 0 {
		log.Fatal("Run students seeder first!")
	}

	requests := []models.PengajuanSurat{
		{
			MahasiswaID: student.ID,
			JenisSurat:  "Surat Keterangan Aktif Kuliah",
			Keperluan:   "Pengajuan Beasiswa Bank Indonesia",
			Status:      "diajukan",
		},
		{
			MahasiswaID: student.ID,
			JenisSurat:  "Surat Izin Penelitian",
			Keperluan:   "Tugas Akhir Skripsi di PT. Maju Jaya",
			Status:      "diproses",
		},
	}

	for _, r := range requests {
		db.Create(&r)
	}

	fmt.Println("Success! Seeded 2 letter requests for Student ID:", student.ID)
}

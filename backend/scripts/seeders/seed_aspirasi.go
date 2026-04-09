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

func SeedAspirasi() {
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

	fmt.Println("--- SEEDING ASPIRATIONS ---")

	var student models.Mahasiswa
	db.First(&student) // Get any student

	if student.ID == 0 {
		log.Fatal("Run final_seed.go or other seeder first to ensure students exist!")
	}

	aspirations := []models.TiketAspirasi{
		{
			MahasiswaID:   student.ID,
			Judul:     "AC Ruang 204 Mati",
			Isi: "Mohon segera diperbaiki AC di ruang 204 karena kipasnya tidak berputar dan suhu sangat panas saat jam kuliah siang.",
			Kategori:    "Fasilitas",
			Status:      "proses",
		},
		{
			MahasiswaID:   student.ID,
			Judul:       "Update Jadwal Ujian",
			Isi: "Mohon informasi terkait jadwal UTS semester Ganjil segera dipublikasikan di dashboard mahasiswa.",
			Kategori:    "Akademik",
			Status:      "klarifikasi",
		},
		{
			MahasiswaID:   student.ID,
			Judul:       "Lampu Lorong Lantai 2",
			Isi: "Lampu lorong depan laboratorium komputer lantai 2 sering berkedip dan mulai redup.",
			Kategori:    "Fasilitas",
			Status:      "proses",
		},
	}

	for _, a := range aspirations {
		db.Create(&a)
	}

	fmt.Println("Success! Seeded 3 aspirations for Student ID:", student.ID)
}

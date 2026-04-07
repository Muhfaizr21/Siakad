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
	godotenv.Load("../.env")
	godotenv.Load(".env")

	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbname, port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("--- SEEDING ASPIRATIONS ---")

	var student models.Student
	db.First(&student) // Get any student

	if student.ID == 0 {
		log.Fatal("Run final_seed.go or other seeder first to ensure students exist!")
	}

	aspirations := []models.Aspiration{
		{
			StudentID:   student.ID,
			Title:       "AC Ruang 204 Mati",
			Description: "Mohon segera diperbaiki AC di ruang 204 karena kipasnya tidak berputar dan suhu sangat panas saat jam kuliah siang.",
			Category:    "Fasilitas",
			Status:      "proses",
		},
		{
			StudentID:   student.ID,
			Title:       "Update Jadwal Ujian",
			Description: "Mohon informasi terkait jadwal UTS semester Ganjil segera dipublikasikan di dashboard mahasiswa.",
			Category:    "Akademik",
			Status:      "klarifikasi",
		},
		{
			StudentID:   student.ID,
			Title:       "Lampu Lorong Lantai 2",
			Description: "Lampu lorong depan laboratorium komputer lantai 2 sering berkedip dan mulai redup.",
			Category:    "Fasilitas",
			Status:      "proses",
		},
	}

	for _, a := range aspirations {
		db.Create(&a)
	}

	fmt.Println("Success! Seeded 3 aspirations for Student ID:", student.ID)
}

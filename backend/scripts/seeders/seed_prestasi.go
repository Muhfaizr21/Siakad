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

func SeedPrestasi() {
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

	fmt.Println("--- SEEDING ACHIEVEMENTS ---")

	// Ensure table exists
	err = db.AutoMigrate(&models.Achievement{})
	if err != nil {
		log.Fatal("AutoMigrate error:", err)
	}

	var student models.Student
	db.First(&student)

	if student.ID == 0 {
		log.Fatal("Run students seeder first!")
	}

	achievements := []models.Achievement{
		{
			StudentID:    student.ID,
			NamaPrestasi: "Juara 1 Lomba National Programming Contest",
			Bidang:       "Akademik",
			Tingkat:      "Nasional",
			Peringkat:    "Juara 1",
			Tahun:        2024,
			Penyelenggara: "RISTEKDIKTI",
			SertifikatURL: "https://example.com/sertifikat1.pdf",
			Status:       "Menunggu",
		},
		{
			StudentID:    student.ID,
			NamaPrestasi: "Medali Perak Karatedo Internasional Open",
			Bidang:       "Non-Akademik",
			Tingkat:      "Internasional",
			Peringkat:    "Medali Perak",
			Tahun:        2024,
			Penyelenggara: "WKF (World Karate Federation)",
			SertifikatURL: "https://example.com/sertifikat2.pdf",
			Status:       "Menunggu",
		},
	}

	for _, a := range achievements {
		if err := db.Create(&a).Error; err != nil {
			fmt.Println("Failed to seed achievement:", err)
		} else {
			fmt.Printf("Seeded: %s for Student ID: %d\n", a.NamaPrestasi, a.StudentID)
		}
	}

	fmt.Println("--- DONE ---")
}

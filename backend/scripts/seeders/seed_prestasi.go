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

	fmt.Println("--- SEEDING ACHIEVEMENTS ---")

	var student models.Mahasiswa
	db.First(&student)

	if student.ID == 0 {
		log.Fatal("Run students seeder first!")
	}

	achievements := []models.Achievement{
		{
			MahasiswaID:   student.ID,
			NamaLomba:     "Juara 1 Lomba National Programming Contest",
			Kategori:      "Akademik",
			Tingkat:       "Nasional",
			Peringkat:     "Juara 1",
			Tahun:         2024,
			Penyelenggara: "RISTEKDIKTI",
			SertifikatURL: "https://example.com/sertifikat1.pdf",
			Status:        "Menunggu",
		},
		{
			MahasiswaID:   student.ID,
			NamaLomba:     "Medali Perak Karatedo Internasional Open",
			Kategori:      "Non-Akademik",
			Tingkat:       "Internasional",
			Peringkat:     "Medali Perak",
			Tahun:         2024,
			Penyelenggara: "WKF (World Karate Federation)",
			SertifikatURL: "https://example.com/sertifikat2.pdf",
			Status:        "Menunggu",
		},
	}

	for _, a := range achievements {
		if err := db.Create(&a).Error; err != nil {
			fmt.Println("Failed to seed achievement:", err)
		} else {
			fmt.Printf("Seeded: %s for Student ID: %d\n", a.NamaLomba, a.MahasiswaID)
		}
	}

	fmt.Println("--- DONE ---")
}

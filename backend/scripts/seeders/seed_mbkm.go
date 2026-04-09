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

func SeedMbkm() {
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

	fmt.Println("--- SEEDING MBKM PROGRAMS ---")

	var student models.Mahasiswa
	db.First(&student)

	if student.ID == 0 {
		log.Fatal("Run students seeder first!")
	}

	programs := []models.ProgramMBKM{
		{
			MahasiswaID: student.ID,
			JenisMBKM:   "Magang Bersertifikat",
			MitraNama:   "PT Telkom Indonesia",
			DurasiBulan: 6,
			Status:      "berjalan",
			SKSKonversi: 20,
		},
		{
			MahasiswaID: student.ID,
			JenisMBKM:   "Studi Independen",
			MitraNama:   "Gojek (GoAcademy)",
			DurasiBulan: 4,
			Status:      "terdaftar",
			SKSKonversi: 20,
		},
	}

	for _, p := range programs {
		db.Create(&p)
	}

	fmt.Println("Success! Seeded 2 MBKM programs for Student ID:", student.ID)
}

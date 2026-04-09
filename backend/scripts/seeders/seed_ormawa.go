package seeders

import (
	"fmt"
	"log"
	"os"
	"siakad-backend/models"
	"time"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func SeedOrmawa() {
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

	fmt.Println("--- SEEDING ORMAWA PROPOSALS ---")

	var student models.Mahasiswa
	db.First(&student)

	var ormawa models.Ormawa
	db.First(&ormawa)

	if student.ID == 0 || ormawa.ID == 0 {
		fmt.Println("No students or ormawas found. Please seed them first.")
		return
	}

	proposals := []models.Proposal{
		{
			OrmawaID:    ormawa.ID,
			Title:       "Seminar Web 3.0 & Blockchain",
			DateEvent:   time.Now().AddDate(0, 1, 0),
			Budget:      5000000,
			Status:      "diajukan",
			RequestedBy: student.ID,
		},
		{
			OrmawaID:    ormawa.ID,
			Title:       "Lomba Robotik Fakultas 2024",
			DateEvent:   time.Now().AddDate(0, 0, 20),
			Budget:      12000000,
			Status:      "diajukan",
			RequestedBy: student.ID,
		},
		{
			OrmawaID:    ormawa.ID,
			Title:       "Pameran Lukisan Digital",
			DateEvent:   time.Now().AddDate(0, 2, 0),
			Budget:      3500000,
			Status:      "revisi",
			Notes:       "Tolong detailkan rincian biaya sewa alat.",
			RequestedBy: student.ID,
		},
	}

	for _, p := range proposals {
		db.Where(models.Proposal{Title: p.Title}).FirstOrCreate(&p)
	}

	fmt.Println("Success! Seeded ORMAWA proposals.")
}

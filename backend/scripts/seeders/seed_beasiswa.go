package main

import (
	"fmt"
	"log"
	"os"
	"time"
	"siakad-backend/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	godotenv.Load("../../.env")
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

	fmt.Println("--- SEEDING SCHOLARSHIPS ---")

	scholarships := []models.Scholarship{
		{
			Name:        "Beasiswa Prestasi Akademik",
			Provider:    "Kemendikbudristek",
			Description: "Bantuan biaya pendidikan untuk mahasiswa dengan IPK di atas 3.5.",
			MinGPA:      3.5,
			Deadline:    time.Now().AddDate(0, 1, 0),
			Quota:       50,
			Status:      "buka",
		},
		{
			Name:        "Beasiswa Bakti Negeri",
			Provider:    "Yayasan Bank Mandiri",
			Description: "Program beasiswa untuk mahasiswa kurang mampu namun berprestasi.",
			MinGPA:      3.0,
			Deadline:    time.Now().AddDate(0, 0, 15),
			Quota:       20,
			Status:      "buka",
		},
	}

	for i := range scholarships {
		db.Where(models.Scholarship{Name: scholarships[i].Name}).FirstOrCreate(&scholarships[i])
	}

	// Seed multiple applications
	var students []models.Student
	db.Limit(5).Find(&students)

	if len(students) > 0 {
		for i, student := range students {
			// Alternate scholarships
			sID := scholarships[0].ID
			if i%2 != 0 {
				sID = scholarships[1].ID
			}

			app := models.ScholarshipApplication{
				ScholarshipID: sID,
				StudentID:     student.ID,
				DocumentURL:   fmt.Sprintf("https://storage.googleapi.com/siakad/scholarship/cv_%d.pdf", student.ID),
				Status:        "proses",
				AdminNotes:    "Dokumen menunggu verifikasi",
			}
			// Use Create instead of FirstOrCreate for apps to allow re-testing if needed (or use Where)
			db.Where(models.ScholarshipApplication{ScholarshipID: sID, StudentID: student.ID}).FirstOrCreate(&app)
		}
		fmt.Printf("Success! Seeded programs and %d applications.\n", len(students))
	} else {
		fmt.Println("Success! Seeded scholarship programs only (no students found).")
	}
}

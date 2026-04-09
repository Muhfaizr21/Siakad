package seeders

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

func SeedBeasiswa() {
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

	fmt.Println("--- SEEDING SCHOLARSHIPS ---")

	scholarships := []models.Beasiswa{
		{
			Nama:          "Beasiswa Prestasi Akademik",
			Penyelenggara: "Kemendikbudristek",
			Deskripsi:     "Bantuan biaya pendidikan untuk mahasiswa dengan IPK di atas 3.5.",
			SyaratIPKMin:  3.5,
			Deadline:      time.Now().AddDate(0, 1, 0),
			Kuota:         50,
			Status:        "Buka",
		},
		{
			Nama:          "Beasiswa Bakti Negeri",
			Penyelenggara: "Yayasan Bank Mandiri",
			Deskripsi:     "Program beasiswa untuk mahasiswa kurang mampu namun berprestasi.",
			SyaratIPKMin:  3.0,
			Deadline:      time.Now().AddDate(0, 0, 15),
			Kuota:         20,
			Status:        "Buka",
		},
	}

	for i := range scholarships {
		db.Where(models.Beasiswa{Nama: scholarships[i].Nama}).FirstOrCreate(&scholarships[i])
	}

	// Seed multiple applications
	var students []models.Mahasiswa
	db.Limit(5).Find(&students)

	if len(students) > 0 {
		for i, student := range students {
			// Alternate scholarships
			sID := scholarships[0].ID
			if i%2 != 0 {
				sID = scholarships[1].ID
			}

			app := models.PengajuanBeasiswa{
				BeasiswaID:   sID,
				MahasiswaID:  student.ID,
				FileURL:      fmt.Sprintf("https://storage.googleapi.com/siakad/scholarship/cv_%d.pdf", student.ID),
				Status:       "Proses",
				CatatanAdmin: "Dokumen menunggu verifikasi",
			}
			db.Where(models.PengajuanBeasiswa{BeasiswaID: sID, MahasiswaID: student.ID}).FirstOrCreate(&app)
		}
		fmt.Printf("Success! Seeded programs and %d applications.\n", len(students))
	} else {
		fmt.Println("Success! Seeded scholarship programs only (no students found).")
	}
}

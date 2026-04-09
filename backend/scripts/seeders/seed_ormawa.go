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

func SeedOrmawa() {
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

	fmt.Println("--- SEEDING ORMAWA PROPOSALS ---")

	var students []models.Student
	db.Limit(3).Find(&students)

	if len(students) == 0 {
		fmt.Println("No students found in 'students' table. Please seed students first.")
		return
	}

	var ormawas []models.Ormawa
	db.Limit(3).Find(&ormawas)
	if len(ormawas) == 0 {
		fmt.Println("No ormawas found. Please seed organizations first.")
		return
	}

	proposals := []models.Proposal{
		{
			StudentID:   &students[0].ID,
			OrmawaID:    ormawas[0].ID,
			Title:       "Seminar Web 3.0 & Blockchain",
			Description: "Kegiatan edukasi mengenai teknologi masa depan bagi mahasiswa IT.",
			FileUrl:     "https://storage.googleapi.com/siakad/ormawa/proposal_web3.pdf",
			Budget:      5000000,
			Status:      "diajukan",
			RequestedBy: students[0].UserID,
			DateEvent:   time.Now().AddDate(0, 1, 0),
		},
	}

	// Add more if more students/ormawas exist
	if len(students) > 1 && len(ormawas) > 1 {
		proposals = append(proposals, models.Proposal{
			StudentID:   &students[1].ID,
			OrmawaID:    ormawas[1].ID,
			Title:       "Lomba Robotik Fakultas 2024",
			Description: "Kompetisi robotik antar mahasiswa semesta fakultas teknik.",
			FileUrl:     "https://storage.googleapi.com/siakad/ormawa/robotik_proposal.pdf",
			Budget:      12000000,
			Status:      "diajukan",
			RequestedBy: students[1].UserID,
			DateEvent:   time.Now().AddDate(0, 2, 0),
		})
	}
	if len(students) > 2 && len(ormawas) > 2 {
		proposals = append(proposals, models.Proposal{
			StudentID:   &students[2].ID,
			OrmawaID:    ormawas[2].ID,
			Title:       "Pameran Lukisan Digital",
			Description: "Pameran karya seni digital mahasiswa fakultas.",
			FileUrl:     "https://storage.googleapi.com/siakad/ormawa/seni_digital.pdf",
			Budget:      3500000,
			Status:      "revisi",
			Notes:       "Tolong detailkan rincian biaya sewa alat.",
			RequestedBy: students[2].UserID,
			DateEvent:   time.Now().AddDate(0, 1, 15),
		})
	}

	for _, p := range proposals {
		db.Where(models.Proposal{Title: p.Title}).FirstOrCreate(&p)
	}

	fmt.Println("Success! Seeded ORMAWA proposals.")
}

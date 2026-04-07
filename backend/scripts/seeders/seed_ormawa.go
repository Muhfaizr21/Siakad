package main

import (
	"fmt"
	"log"
	"os"
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

	fmt.Println("--- SEEDING ORMAWA PROPOSALS ---")

	var students []models.Student
	db.Limit(3).Find(&students)

	if len(students) == 0 {
		fmt.Println("No students found in 'students' table. Please seed students first.")
		return
	}

	proposals := []models.OrmawaProposal{
		{
			StudentID:       students[0].ID,
			OrmawaName:      "HIMA Informatika",
			Title:           "Seminar Web 3.0 & Blockchain",
			Description:     "Kegiatan edukasi mengenai teknologi masa depan bagi mahasiswa IT.",
			DocumentURL:     "https://storage.googleapi.com/siakad/ormawa/proposal_web3.pdf",
			RequestedBudget: 5000000,
			Status:          "diajukan",
		},
	}

	// Add more if more students exist
	if len(students) > 1 {
		proposals = append(proposals, models.OrmawaProposal{
			StudentID:       students[1].ID,
			OrmawaName:      "HIMA Elektro",
			Title:           "Lomba Robotik Fakultas 2024",
			Description:     "Kompetisi robotik antar mahasiswa semesta fakultas teknik.",
			DocumentURL:     "https://storage.googleapi.com/siakad/ormawa/robotik_proposal.pdf",
			RequestedBudget: 12000000,
			Status:          "diajukan",
		})
	}
	if len(students) > 2 {
		proposals = append(proposals, models.OrmawaProposal{
			StudentID:       students[2].ID,
			OrmawaName:      "Unit Seni Mahasiswa",
			Title:           "Pameran Lukisan Digital",
			Description:     "Pameran karya seni digital mahasiswa fakultas.",
			DocumentURL:     "https://storage.googleapi.com/siakad/ormawa/seni_digital.pdf",
			RequestedBudget: 3500000,
			Status:          "revisi",
			AdminNotes:      "Tolong detailkan rincian biaya sewa alat.",
		})
	}

	for _, p := range proposals {
		db.Where(models.OrmawaProposal{Title: p.Title}).FirstOrCreate(&p)
	}

	fmt.Println("Success! Seeded ORMAWA proposals.")
}

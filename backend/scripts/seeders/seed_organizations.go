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

	fmt.Println("--- SEEDING FACULTY ORGANIZATIONS ---")

	orgs := []models.FacultyOrganization{
		{
			OrgCode:     "ORG-001",
			Name:        "BEM Fakultas Teknik",
			LeaderName:  "Alvin Jonathan",
			MemberCount: 45,
			Status:      "Aktif",
			Description: "Badan Eksekutif Mahasiswa tingkat Fakultas.",
		},
		{
			OrgCode:     "ORG-002",
			Name:        "DPM Fakultas Teknik",
			LeaderName:  "Bella Safitra",
			MemberCount: 25,
			Status:      "Aktif",
			Description: "Dewan Perwakilan Mahasiswa tingkat Fakultas.",
		},
		{
			OrgCode:     "ORG-003",
			Name:        "HIMA Informatika",
			LeaderName:  "Caca Maheswari",
			MemberCount: 80,
			Status:      "Aktif",
			Description: "Himpunan Mahasiswa Informatika.",
		},
		{
			OrgCode:     "ORG-004",
			Name:        "HIMA Sistem Informasi",
			LeaderName:  "Dicky Fernando",
			MemberCount: 65,
			Status:      "Pembekuan",
			Description: "Himpunan Mahasiswa Sistem Informasi.",
		},
	}

	for _, o := range orgs {
		db.Where(models.FacultyOrganization{OrgCode: o.OrgCode}).FirstOrCreate(&o)
	}

	fmt.Println("Success! Seeded faculty organizations.")
}

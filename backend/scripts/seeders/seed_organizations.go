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

func SeedOrganizations() {
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

	fmt.Println("--- SEEDING FACULTY ORGANIZATIONS ---")

	orgs := []models.OrganisasiMahasiswa{
		{
			KodeOrg:       "ORG-001",
			NamaOrg:       "BEM Fakultas Teknik",
			KetuaNama:     "Alvin Jonathan",
			JumlahAnggota: 45,
			Status:        "Aktif",
			Deskripsi:     "Badan Eksekutif Mahasiswa tingkat Fakultas.",
			Tipe:          "BEM",
		},
		{
			KodeOrg:       "ORG-002",
			NamaOrg:       "DPM Fakultas Teknik",
			KetuaNama:     "Bella Safitra",
			JumlahAnggota: 25,
			Status:        "Aktif",
			Deskripsi:     "Dewan Perwakilan Mahasiswa tingkat Fakultas.",
			Tipe:          "DPM",
		},
		{
			KodeOrg:       "ORG-003",
			NamaOrg:       "HIMA Informatika",
			KetuaNama:     "Caca Maheswari",
			JumlahAnggota: 80,
			Status:        "Aktif",
			Deskripsi:     "Himpunan Mahasiswa Informatika.",
			Tipe:          "Himpunan",
		},
		{
			KodeOrg:       "ORG-004",
			NamaOrg:       "HIMA Sistem Informasi",
			KetuaNama:     "Dicky Fernando",
			JumlahAnggota: 65,
			Status:        "Pembekuan",
			Deskripsi:     "Himpunan Mahasiswa Sistem Informasi.",
			Tipe:          "Himpunan",
		},
	}

	for _, o := range orgs {
		db.Where(models.OrganisasiMahasiswa{KodeOrg: o.KodeOrg}).FirstOrCreate(&o)
	}

	fmt.Println("Success! Seeded faculty organizations.")
}

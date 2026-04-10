package main

import (
	"fmt"
	"log"
	"math/rand"
	"os"
	"siakad-backend/models"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPass := getEnv("DB_PASSWORD", "nidan29april")
	dbName := getEnv("DB_NAME", "studenthub")

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		dbHost, dbUser, dbPass, dbName, dbPort,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("🚀 Injecting Beasiswa & Surat Seeder Data...")

	var mhsList []models.Mahasiswa
	db.Limit(100).Find(&mhsList)
	if len(mhsList) == 0 {
		log.Fatal("No Mahasiswa found.")
	}

	rand.Seed(time.Now().UnixNano())
	
	// Create Beasiswa Master Data
	bList := []models.Beasiswa{
		{
			Nama: "Beasiswa Djarum Plus 2026",
			Penyelenggara: "Djarum Foundation",
			Deskripsi: "Beasiswa prestasi plus pelatihan soft skill.",
			Deadline: time.Now().AddDate(0, 1, 0),
			Kuota: 50,
			IPKMin: 3.5,
		},
		{
			Nama: "Beasiswa BCA Finance",
			Penyelenggara: "PT BCA Finance",
			Deskripsi: "Bantuan UKT selama 8 semester.",
			Deadline: time.Now().AddDate(0, 0, 15),
			Kuota: 20,
			IPKMin: 3.2,
		},
	}
	
	for _, b := range bList {
		db.Create(&b)
	}
	
	var savedB []models.Beasiswa
	db.Find(&savedB)

	// Inject Beasiswa Applications and Surat
	tx := db.Begin()
	for i, m := range mhsList {
		// Beasiswa
		if i%4 == 0 {
			tx.Create(&models.BeasiswaPendaftaran{
				MahasiswaID: m.ID,
				BeasiswaID: savedB[rand.Intn(len(savedB))].ID,
			})
		}
		
		// Surat
		if i%3 == 0 {
			statusList := []string{"diproses", "selesai", "ditolak"}
			jenisList := []string{"Surat Keterangan Aktif Kuliah", "Surat Pengantar Riset/Magang", "Surat Keterangan Lulus"}
			tx.Create(&models.PengajuanSurat{
				MahasiswaID: m.ID,
				Jenis: jenisList[rand.Intn(len(jenisList))],
				Status: statusList[rand.Intn(len(statusList))],
				NomorSurat: fmt.Sprintf("SRT/%04d/%d", rand.Intn(1000), time.Now().Year()),
				Catatan: "Mohon segera diproses untuk keperluan pendaftaran magang.",
			})
		}
	}
	tx.Commit()

	fmt.Println("✨ Beasiswa & Surat injected successfully!")
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

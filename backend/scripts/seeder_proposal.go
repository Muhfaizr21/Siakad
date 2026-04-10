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

	fmt.Println("🚀 Injecting ORMAWA & Proposal Seeder Data...")
	
	rand.Seed(time.Now().UnixNano())

	// 1. Ensure ORMAWAs exist
	var ormawas []models.Ormawa
	db.Find(&ormawas)
	
	if len(ormawas) < 4 {
		fmt.Println("Creating additional ORMAWAs...")
		ormawaList := []models.Ormawa{
			{Nama: "BEM Fakultas Teknik", Kode: "BEM-FT", Status: "Aktif", JumlahAnggota: 45, Deskripsi: "Siti Rahmawati", Email: "bem@ft.siakad.ac.id"},
			{Nama: "Hima Informatika", Kode: "HMIF", Status: "Aktif", JumlahAnggota: 60, Deskripsi: "Rian Hidayat", Email: "hmif@ft.siakad.ac.id"},
			{Nama: "Hima Sistem Informasi", Kode: "HMSI", Status: "Aktif", JumlahAnggota: 55, Deskripsi: "Andi Saputra", Email: "hmsi@ft.siakad.ac.id"},
			{Nama: "Unit Kegiatan Riset", Kode: "UKR", Status: "Aktif", JumlahAnggota: 30, Deskripsi: "Diah Larasati", Email: "ukr@ft.siakad.ac.id"},
		}
		for _, o := range ormawaList {
			// Check if already exists by name/kode to avoid duplicates if possible, or just create
			var existing models.Ormawa
			if err := db.Where("kode = ?", o.Kode).First(&existing).Error; err != nil {
				db.Create(&o)
			}
		}
		db.Find(&ormawas)
	}

	if len(ormawas) == 0 {
		log.Fatal("Failed to ensure ORMAWA data.")
	}

	// 2. Need some mahasiswa & fakultas for foreign keys
	var mhs models.Mahasiswa
	if err := db.First(&mhs).Error; err != nil {
		log.Fatal("No Mahasiswa found in DB. Run bulk student seeder first.")
	}
	
	var fakultas models.Fakultas
	if err := db.First(&fakultas).Error; err != nil {
		log.Fatal("No Fakultas found in DB.")
	}

	// 3. Inject Proposals
	proposalTitles := []string{
		"Tech Bootcamp & Exhibition 2026",
		"Pelatihan Web Development Intensif",
		"Study Visit Industri IT",
		"Simposium Riset Teknologi Nasional",
		"Lomba E-Sport Mahasiswa",
		"Seminar Kewirausahaan Digital",
	}

	proposalTypes := []string{"Event", "Pelatihan", "Kunjungan", "Seminar", "Kompetisi"}
	statuses := []string{"pending", "approved", "rejected"}

	for i := 0; i < 15; i++ {
		o := ormawas[i%len(ormawas)]
		p := models.Proposal{
			OrmawaID:        o.ID,
			MahasiswaID:     mhs.ID,
			FakultasID:      fakultas.ID,
			Judul:           fmt.Sprintf("%s #%d", proposalTitles[rand.Intn(len(proposalTitles))], i+1),
			TanggalKegiatan: time.Now().AddDate(0, rand.Intn(4), rand.Intn(28)),
			Anggaran:        float64(5000000 + rand.Intn(45)*1000000),
			Jenis:           proposalTypes[rand.Intn(len(proposalTypes))],
			Status:          statuses[rand.Intn(len(statuses))],
			Catatan:         "Sample proposal data injected by seeder.",
		}
		if err := db.Create(&p).Error; err != nil {
			fmt.Printf("Error creating proposal: %v\n", err)
		}
	}
	
	fmt.Println("✨ ORMAWA & Proposal injected successfully!")
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

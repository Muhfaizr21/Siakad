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
	// 1. Load Environment & Connect DB
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

	fmt.Println("🚀 Bulk Seeder Started: Injecting 5000 Students...")

	// 2. Preparation (Get existing IDs)
	var prodis []models.ProgramStudi
	db.Find(&prodis)
	if len(prodis) == 0 {
		log.Fatal("No Program Studi found. Please run initial sync first.")
	}

	var dpaList []models.Dosen
	db.Where("is_dpa = ?", true).Find(&dpaList)
	if len(dpaList) == 0 {
		fmt.Println("⚠️  No Dosen PA found. Creating 5 dummy DPAs...")
		p := prodis[0]
		for k := 1; k <= 5; k++ {
			email := fmt.Sprintf("dpa_%d_%d@siakad.ac.id", time.Now().Unix(), k)
			user := models.User{Email: email, Password: "$2a$10$r9C799sXvD8/Zk9m6p.hQ.m7I8WjKz.Y1vS/F1f7nI.Z1f7nI.Z1", Role: "dosen"}
			if err := db.Create(&user).Error; err != nil {
				log.Fatalf("Failed to create DPA user: %v", err)
			}
			dosen := models.Dosen{
				PenggunaID:     user.ID,
				NIDN:           fmt.Sprintf("DPA00%d", k),
				Nama:           fmt.Sprintf("Dosen PA %d", k),
				IsDPA:          true,
				FakultasID:     p.FakultasID,
				ProgramStudiID: p.ID,
			}
			if err := db.Create(&dosen).Error; err != nil {
				log.Fatalf("Failed to create DPA profile: %v", err)
			}
			dpaList = append(dpaList, dosen)
		}
		fmt.Println("✅ 5 DPAs Created.")
	}

	firstNames := []string{"Budi", "Siti", "Andi", "Dewi", "Joko", "Rina", "Agus", "Maya", "Rian", "Sari", "Eko", "Ani", "Dodi", "Ina", "Tono", "Lina", "Heri", "Mira", "Ari", "Yuni"}
	lastNames := []string{"Saputra", "Wulandari", "Pratama", "Lestari", "Susanto", "Rahayu", "Kurniawan", "Indah", "Hidayat", "Putri", "Wijaya", "Setyowati", "Santoso", "Utami", "Nugroho", "Fitriani"}

	rand.Seed(time.Now().UnixNano())

	batchSize := 100
	totalTarget := 5000

	for i := 0; i < totalTarget/batchSize; i++ {
		tx := db.Begin()
		
		for j := 0; j < batchSize; j++ {
			counter := i*batchSize + j + 1
			fName := firstNames[rand.Intn(len(firstNames))]
			lName := lastNames[rand.Intn(len(lastNames))]
			fullName := fmt.Sprintf("%s %s %d", fName, lName, counter)
			email := fmt.Sprintf("mhs_%d_%d@siakad.ac.id", time.Now().UnixNano(), counter)
			nim := fmt.Sprintf("210%05d_%d", counter, rand.Intn(1000))
			
			// A. Create User
			user := models.User{
				Email:    email,
				Password: "$2a$10$r9C799sXvD8/Zk9m6p.hQ.m7I8WjKz.Y1vS/F1f7nI.Z1f7nI.Z1", // password123
				Role:     "mahasiswa",
			}
			if err := tx.Create(&user).Error; err != nil {
				tx.Rollback()
				log.Fatalf("Failed to create user %d: %v", counter, err)
			}

			// B. Create Mahasiswa Profile
			prodi := prodis[rand.Intn(len(prodis))]
			dpa := dpaList[rand.Intn(len(dpaList))]
			
			mhs := models.Mahasiswa{
				PenggunaID:       user.ID,
				NIM:              nim,
				Nama:             fullName,
				FakultasID:       prodi.FakultasID,
				ProgramStudiID:   prodi.ID,
				DosenPAID:        dpa.ID,
				SemesterSekarang: rand.Intn(8) + 1,
				StatusAkun:       "Aktif",
				StatusAkademik:   "Aktif",
				IPK:              2.5 + rand.Float64()*1.5,
				TotalSKS:         rand.Intn(144),
				TahunMasuk:       2020 + rand.Intn(4),
				JalurMasuk:        []string{"SNMPTN", "SBMPTN", "Mandiri"}[rand.Intn(3)],
				JenisKelamin:      []string{"Laki-laki", "Perempuan"}[rand.Intn(2)],
				GolonganDarah:    []string{"A", "B", "AB", "O"}[rand.Intn(4)],
			}
			if err := tx.Create(&mhs).Error; err != nil {
				tx.Rollback()
				fmt.Printf("❌ Failed to create profile %d (NIM: %s, DPA_ID: %d, Prodi_ID: %d): %v\n", counter, nim, dpa.ID, prodi.ID, err)
				os.Exit(1)
			}

			// C. PKKMB Result
			pkkmbStatus := []string{"Lulus", "Proses", "Gagal"}[rand.Intn(3)]
			tx.Create(&models.PkkmbHasil{
				MahasiswaID:     mhs.ID,
				Nilai:           60 + rand.Float64()*40,
				StatusKelulusan: pkkmbStatus,
			})

			// D. Kesehatan Record (Sample 1 per 2 students)
			if counter%2 == 0 {
				conds := []string{"prima", "stabil", "pantauan"}
				tx.Create(&models.Kesehatan{
					MahasiswaID:      mhs.ID,
					Tanggal:          time.Now().AddDate(0, 0, -rand.Intn(30)),
					JenisPemeriksaan: "Screening Tahunan",
					Hasil:            "Pemeriksaan Selesai",
					StatusKesehatan:  conds[rand.Intn(len(conds))],
					TinggiBadan:      150 + rand.Float64()*30,
					BeratBadan:       45 + rand.Float64()*40,
					Sistole:          110 + rand.Intn(30),
					Diastole:         70 + rand.Intn(20),
					GulaDarah:        80 + rand.Intn(40),
					GolonganDarah:    mhs.GolonganDarah,
					Catatan:          "Kondisi fisik secara umum baik.",
				})
			}

			// E. Konseling Session (Sample 1 per 5 students)
			if counter%5 == 0 {
				tx.Create(&models.Konseling{
					MahasiswaID: mhs.ID,
					DosenID:     dpa.ID,
					Tanggal:     time.Now().AddDate(0, 0, rand.Intn(14)),
					Topik:       []string{"Akademik", "Karir", "Pribadi"}[rand.Intn(3)],
					Status:      []string{"pending", "approved", "finished"}[rand.Intn(3)],
					Catatan:     "Mahasiswa membutuhkan bimbingan terkait rencana studi semester depan.",
				})
			}

			// F. Prestasi (Sample 1 per 10 students)
			if counter%10 == 0 {
				tx.Create(&models.Prestasi{
					MahasiswaID:  mhs.ID,
					NamaKegiatan: "Lomba Karya Tulis Ilmiah Nasional",
					Kategori:     "Akademik",
					Tingkat:      "Nasional",
					Peringkat:    "Juara 1",
					Status:       "verified",
					Poin:         15,
				})
			}

			// G. Aspirasi (Sample 1 per 20 students)
			if counter%20 == 0 {
				tx.Create(&models.Aspirasi{
					MahasiswaID: mhs.ID,
					Judul:       "Fasilitas Lab Komputer",
					Isi:         "Mohon pembaharuan software di lab komputer lantai 2.",
					Kategori:    "Fasilitas",
					Status:      "pending",
				})
			}
		}

		tx.Commit()
		if (i+1)%5 == 0 {
			fmt.Printf("✅ Injected %d students...\n", (i+1)*batchSize)
		}
	}

	fmt.Println("✨ Bulk Seeder Completed Successfully! 5000 Students Injected.")
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

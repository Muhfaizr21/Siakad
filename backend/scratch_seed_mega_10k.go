package main

import (
	"fmt"
	"math/rand"
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"golang.org/x/crypto/bcrypt"
)

type tempMhs struct {
	nim      string
	fullName string
	email    string
}

func main() {
	dsn := "host=localhost user=muhfaiizr password=admin dbname=siakad port=5432 sslmode=disable TimeZone=Asia/Jakarta"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		SkipDefaultTransaction: true,
		PrepareStmt:            true,
	})
	if err != nil {
		fmt.Printf("❌ Connection Failed: %v\n", err)
		return
	}
	config.DB = db

	fmt.Println("🚀 Starting MEGA SEEDER (10,000 Students)...")

	// 1. HARD RESET (Wipe all student data and its dependencies)
	fmt.Println("🧹 Performing HARD RESET on student data...")
	db.Exec("TRUNCATE TABLE mahasiswa.mahasiswa CASCADE")
	db.Exec("DELETE FROM public.users WHERE role = 'mahasiswa' OR email ~ '^[0-9]+@bku\\.ac\\.id$'")

	var prodis []models.ProgramStudi
	db.Find(&prodis)
	if len(prodis) == 0 {
		fmt.Println("❌ No Program Studi found. Please seed master data first.")
		return
	}

	rand.Seed(time.Now().UnixNano())

	firstNames := []string{"Budi", "Siti", "Andi", "Dewi", "Joko", "Rina", "Agus", "Lestari", "Adi", "Maya", "Rizky", "Putri", "Hendra", "Ratna", "Denny", "Yulia", "Eko", "Dwi", "Tri", "Catur", "Puji", "Wahyu", "Slamet", "Ani", "Iwan", "Doni", "Rian", "Fajar", "Bambang", "Rudi", "Anisa", "Indah", "Zaky", "Farhan", "Bagas", "Dimas", "Asep", "Cecep", "Dedi", "Eneng", "Fitri", "Gita", "Hana", "Ira", "Jajang", "Kiki", "Lulu", "Maman"}
	middleNames := []string{"Nur", "Cahya", "Adi", "Sri", "Wahyu", "Dwi", "Tri", "Kurnia", "Agung", "Rizky", "Putra", "Putri", "Ayu", "Bagus", "Bakti", "Bina", "Candra", "Darma", "Eka", "Fajar", "Guna", "Hadi", "Hasan", "Iman", "Jaya"}
	lastNames := []string{"Santoso", "Aminah", "Wijaya", "Kusuma", "Prabowo", "Sari", "Hidayat", "Utami", "Saputra", "Wulandari", "Maulana", "Fitri", "Gunawan", "Pertiwi", "Setiawan", "Heryanto", "Nugroho", "Susilo", "Wibowo", "Sutrisno", "Purnomo", "Budiman", "Mulyadi", "Basuki", "Laksana", "Wahyudi", "Firmansyah", "Kurniawan", "Sitorus", "Nasution", "Simanjuntak", "Hutagalung", "Siregar", "Pane", "Batubara", "Harahap", "Pasaribu", "Ginting", "Tarigan"}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

	totalToSeed := 10000
	batchSize := 500
	usedNames := make(map[string]bool)
	
	for i := 0; i < totalToSeed; i += batchSize {
		end := i + batchSize
		if end > totalToSeed { end = totalToSeed }

		var batchUsers []models.User
		var mhsDetails []tempMhs

		for j := i; j < end; j++ {
			// using 50-59 as prefix to avoid collisions with any previously generated 22-24 NIMs
			nim := fmt.Sprintf("%02d%02d%05d", 50+rand.Intn(10), rand.Intn(99), j+1)
			
			// Ensure unique name within batch
			var name string
			for {
				fn := firstNames[rand.Intn(len(firstNames))]
				mn := middleNames[rand.Intn(len(middleNames))]
				ln := lastNames[rand.Intn(len(lastNames))]
				name = fn + " " + mn + " " + ln
				if !usedNames[name] {
					usedNames[name] = true
					break
				}
			}
			
			email := fmt.Sprintf("%s@bku.ac.id", nim)

			batchUsers = append(batchUsers, models.User{
				Password: string(hashedPassword),
				Role:     "mahasiswa",
				Email:    email,
			})
			mhsDetails = append(mhsDetails, tempMhs{nim: nim, fullName: name, email: email})
		}

		if err := db.Create(&batchUsers).Error; err != nil {
			fmt.Printf("❌ Error Users Batch %d: %v\n", i, err)
			continue
		}

		var batchStudents []models.Mahasiswa
		for k, user := range batchUsers {
			p := prodis[rand.Intn(len(prodis))]
			detail := mhsDetails[k]
			
			batchStudents = append(batchStudents, models.Mahasiswa{
				PenggunaID:      user.ID,
				NIM:             detail.nim,
				Nama:            detail.fullName,
				FakultasID:      p.FakultasID,
				ProgramStudiID:  p.ID,
				SemesterSekarang: rand.Intn(8) + 1,
				IPK:             2.5 + (rand.Float64() * 1.4),
				TotalSKS:        rand.Intn(144),
				TahunMasuk:      2022 + rand.Intn(3),
				StatusAkun:      "Aktif",
				EmailKampus:     detail.email,
			})
		}

		if err := db.Create(&batchStudents).Error; err != nil {
			fmt.Printf("❌ Error Students Batch %d: %v\n", i, err)
		}
		fmt.Printf("✅ Seeding progress: %d / %d\n", end, totalToSeed)
	}

	fmt.Println("🏁 MEGA SEEDER COMPLETED SUCCESSFULLY!")
}

package scratch

import (
	"fmt"
	"math/rand"
	"siakad-backend/models"
	"time"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "host=localhost user=muhfaiizr password=admin dbname=siakad port=5432 sslmode=disable TimeZone=Asia/Jakarta"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Printf("❌ Connection Failed: %v\n", err)
		return
	}

	fmt.Println("🧹 Cleaning up orphaned students & users...")
	db.Unscoped().Where("role = ?", "mahasiswa").Delete(&models.User{})
	db.Unscoped().Where("1=1").Delete(&models.Mahasiswa{})

	fmt.Println("🚀 Restarting Mass Seeding of 5,000 Students...")

	var faculties []models.Fakultas
	db.Find(&faculties)
	var prodis []models.ProgramStudi
	db.Find(&prodis)
	var lecturers []models.Dosen
	db.Find(&lecturers)

	if len(lecturers) == 0 {
		fmt.Println("❌ Error: No Dosen found. Please seed Dosen first.")
		return
	}

	rand.Seed(time.Now().UnixNano())
	
	firstNames := []string{"Budi", "Siti", "Andi", "Dewi", "Joko", "Rina", "Agus", "Lestari", "Adi", "Maya", "Rizky", "Putri", "Hendra", "Ratna", "Denny", "Yulia"}
	lastNames := []string{"Santoso", "Aminah", "Wijaya", "Kusuma", "Prabowo", "Sari", "Hidayat", "Utami", "Saputra", "Wulandari", "Maulana", "Fitri", "Gunawan", "Pertiwi"}

	totalToSeed := 5000
	batchSize := 250 

	for i := 0; i < totalToSeed; i += batchSize {
		currentBatchSize := batchSize
		if i+batchSize > totalToSeed {
			currentBatchSize = totalToSeed - i
		}

		var usersBatch []models.User
		for j := 0; j < currentBatchSize; j++ {
			usersBatch = append(usersBatch, models.User{
				Email:    fmt.Sprintf("student.%d@siakad.com", i+j+10000),
				Password: "password123", 
				Role:     "mahasiswa",
			})
		}
		db.Create(&usersBatch)

		var mhsBatch []models.Mahasiswa
		for j := range usersBatch {
			u := &usersBatch[j]
			fn := firstNames[rand.Intn(len(firstNames))]
			ln := lastNames[rand.Intn(len(lastNames))]
			nim := fmt.Sprintf("BKU%d%06d", 2020+rand.Intn(5), i+j+1)
			
			fak := faculties[rand.Intn(len(faculties))]
			var prodiID uint
			for _, p := range prodis {
				if p.FakultasID == fak.ID {
					prodiID = p.ID
					break
				}
			}
			if prodiID == 0 { prodiID = prodis[0].ID }

			// Assign Random Dosen PA
			pa := lecturers[rand.Intn(len(lecturers))]

			mhsBatch = append(mhsBatch, models.Mahasiswa{
				PenggunaID:     u.ID,
				Nama:           fmt.Sprintf("%s %s", fn, ln),
				NIM:            nim,
				FakultasID:     fak.ID,
				ProgramStudiID: prodiID,
				DosenPAID:      pa.ID,
				TahunMasuk:     2020 + rand.Intn(5),
				IPK:            2.5 + rand.Float64()*(4.0-2.5),
				StatusAkademik: "Aktif",
				StatusAkun:     "Verified",
			})
		}

		if err := db.Create(&mhsBatch).Error; err != nil {
			fmt.Printf("❌ Batch Failed: %v\n", err)
		} else {
			fmt.Printf("📦 Processed: %d / %d students...\n", i+currentBatchSize, totalToSeed)
		}
	}

	fmt.Println("🏁 Re-seeding complete.")
}

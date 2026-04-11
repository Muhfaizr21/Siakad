package main

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	if err := godotenv.Overload(); err != nil {
		log.Println("Peringatan: .env tidak ditemukan")
	}

	config.ConnectDB()
	db := config.DB

	fmt.Println("🏗️  [MONSTER-SEEDER] Siapkan mental, 15.000 data mahasiswa akan disuntik...")

	// 1. Setup Password (Pre-hashed for speed)
	passwordHash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	passStr := string(passwordHash)

	// 2. Clear / Prep Master Data
	var fh, ft, fe, soc models.Fakultas
	db.Where("kode = ?", "FH").FirstOrCreate(&fh, models.Fakultas{Nama: "Fakultas Hukum", Kode: "FH", Dekan: "Prof. Hukum"})
	db.Where("kode = ?", "FT").FirstOrCreate(&ft, models.Fakultas{Nama: "Fakultas Teknik", Kode: "FT", Dekan: "Prof. Teknik"})
	db.Where("kode = ?", "FE").FirstOrCreate(&fe, models.Fakultas{Nama: "Fakultas Ekonomi", Kode: "FE", Dekan: "Prof. Ekonomi"})
	db.Where("kode = ?", "SOC").FirstOrCreate(&soc, models.Fakultas{Nama: "School of Computing", Kode: "SOC", Dekan: "Prof. Computing"})

	prodis := []models.ProgramStudi{
		{Nama: "Ilmu Hukum", Kode: "LAW01", FakultasID: fh.ID, Jenjang: "S1"},
		{Nama: "Teknik Sipil", Kode: "CIV01", FakultasID: ft.ID, Jenjang: "S1"},
		{Nama: "Manajemen", Kode: "MAN01", FakultasID: fe.ID, Jenjang: "S1"},
		{Nama: "Informatika", Kode: "INF01", FakultasID: soc.ID, Jenjang: "S1"},
		{Nama: "Sistem Informasi", Kode: "SI01", FakultasID: soc.ID, Jenjang: "S1"},
	}
	for i := range prodis {
		db.Where("kode = ?", prodis[i].Kode).FirstOrCreate(&prodis[i])
	}

	// 3. Prepare Bulk Data
	totalMahasiswa := 15000
	batchSize := 500

	firstNames := []string{"Budi", "Siti", "Andi", "Ani", "Rizky", "Siska", "Dedi", "Maya", "Fajri", "Dewi", "Gilang", "Putri", "Eko", "Yanti", "Hendra", "Nur"}
	lastNames := []string{"Santoso", "Wijaya", "Pratama", "Hidayat", "Kusuma", "Sari", "Lestari", "Putra", "Utami", "Gunawan", "Saputra"}

	fmt.Printf("📦 Memulai Batch Insert (%d data per batch)...\n", batchSize)

	for i := 0; i < totalMahasiswa; i += batchSize {
		users := []models.User{}
		mahasiswas := []models.Mahasiswa{}

		for j := 0; j < batchSize; j++ {
			idx := i + j + 1
			email := fmt.Sprintf("student%d@bku.ac.id", idx)
			
			// Randomize Faculty & Prodi
			prodi := prodis[rand.Intn(len(prodis))]

			user := models.User{
				Email:      email,
				Password:   passStr,
				Role:       "student",
				FakultasID: &prodi.FakultasID,
			}
			users = append(users, user)
		}

		// Insert Users Batch
		db.Create(&users)

		for j := 0; j < batchSize; j++ {
			idx := i + j + 1
			nim := fmt.Sprintf("BKU2024%05d", idx)
			prodi := prodis[rand.Intn(len(prodis))]
			nama := firstNames[rand.Intn(len(firstNames))] + " " + lastNames[rand.Intn(len(lastNames))]

			mhs := models.Mahasiswa{
				PenggunaID:       users[j].ID,
				NIM:              nim,
				Nama:             nama,
				FakultasID:       prodi.FakultasID,
				ProgramStudiID:   prodi.ID,
				SemesterSekarang: rand.Intn(8) + 1,
				StatusAkun:       "Aktif",
				StatusAkademik:   "Aktif",
				IPK:              2.5 + rand.Float64()*(1.5),
				TotalSKS:         rand.Intn(144),
				TahunMasuk:       2020 + rand.Intn(5),
				JalurMasuk:       "SNBP",
				EmailKampus:      users[j].Email,
				NoHP:             fmt.Sprintf("0812%d", 10000000+idx),
				TanggalLahir:     time.Now().AddDate(-20-rand.Intn(5), 0, 0),
			}
			mahasiswas = append(mahasiswas, mhs)
		}

		// Insert Mahasiswa Batch
		db.Create(&mahasiswas)

		// 4. GENERATE DETAIL DATA (Kesehatan, Prestasi, Aspirasi) for current batch
		kesehatans := []models.Kesehatan{}
		prestasies := []models.Prestasi{}
		aspirasis := []models.Aspirasi{}

		for j := 0; j < batchSize; j++ {
			mID := mahasiswas[j].ID
			
			// Health (1 per student)
			kesehatans = append(kesehatans, models.Kesehatan{
				MahasiswaID: mID,
				Tanggal: time.Now(),
				JenisPemeriksaan: "Screening Rutin",
				Hasil: "Sehat",
				StatusKesehatan: []string{"prima", "stabil", "pantauan"}[rand.Intn(3)],
				GolonganDarah: []string{"A", "B", "AB", "O"}[rand.Intn(4)],
				TinggiBadan: 150 + rand.Float64()*30,
				BeratBadan: 45 + rand.Float64()*40,
				Sistole: 110 + rand.Intn(30),
				Diastole: 70 + rand.Intn(20),
			})

			// Prestasi (30% probability)
			if rand.Float64() < 0.3 {
				prestasies = append(prestasies, models.Prestasi{
					MahasiswaID: mID,
					NamaKegiatan: "Lomba " + []string{"Coding", "Debat", "Esai", "Olahraga"}[rand.Intn(4)],
					Kategori: "Akademik",
					Tingkat: "Nasional",
					Peringkat: "Juara " + fmt.Sprintf("%d", rand.Intn(3)+1),
					Status: "Approved",
					Poin: 20 + rand.Intn(30),
				})
			}

			// Aspirasi (20% probability)
			if rand.Float64() < 0.2 {
				aspirasis = append(aspirasis, models.Aspirasi{
					MahasiswaID: mID,
					Judul: "Keluhan " + []string{"Fasilitas", "Dosen", "Parkir", "Kantin"}[rand.Intn(4)],
					Isi: "Mohon segera ditindaklanjuti karena mengganggu...",
					Kategori: "Fasilitas",
					Tujuan: "Sarpras",
					Status: "Diproses",
					Prioritas: "MEDIUM",
				})
			}
		}

		db.Create(&kesehatans)
		if len(prestasies) > 0 { db.Create(&prestasies) }
		if len(aspirasis) > 0 { db.Create(&aspirasis) }

		fmt.Printf("✅ Terproses: %d / %d mahasiswa\n", i+batchSize, totalMahasiswa)
	}

	fmt.Println("🏆 [MONSTER-SEEDER] SELESAI! Dashboard kamu sekarang penuh data nyata (15.000 Mahasiswa).")
}

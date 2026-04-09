package seeders

import (
	"fmt"
	"math/rand"
	"siakad-backend/config"
	"siakad-backend/models"
	"time"
	"github.com/joho/godotenv"
)

func SeedReports() {
	godotenv.Load()
	config.ConnectDB()

	// 1. Get Prodis
	var prodis []models.ProgramStudi
	config.DB.Find(&prodis)
	if len(prodis) == 0 {
		fmt.Println("Gak ada prodi! Seed prodi dulu wok.")
		return
	}

	fmt.Printf("Sedang menanam %d mahasiswa ke prodi...\n", 150)

	namaDepans := []string{"Budi", "Siti", "Agus", "Rina", "Andi", "Dewi", "Eko", "Maya", "Rudi", "Lani", "Faiz", "Gita", "Heri", "Ika", "Joko"}
	namaBelakangs := []string{"Saputra", "Lestari", "Kusuma", "Sari", "Wijaya", "Utami", "Pratama", "Putri", "Hidayat", "Ramadhani"}
	statuses := []string{"Aktif", "Aktif", "Aktif", "Lulus", "Cuti"}
	jenisKelamins := []string{"Laki-laki", "Perempuan"}

	rand.Seed(time.Now().UnixNano())

	for i := 0; i < 150; i++ {
		namaLengkap := namaDepans[rand.Intn(len(namaDepans))] + " " + namaBelakangs[rand.Intn(len(namaBelakangs))]
		prodi := prodis[rand.Intn(len(prodis))]
		year := 2020 + rand.Intn(5) // 2020 to 2024
		
		// Create User first
		email := fmt.Sprintf("std%d%d@siakad.ac.id", year, i)
		user := models.Pengguna{
			Email:     email,
			KataSandi: "$2a$10$7Q9lR.U2.E.uH2z.A.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u", // dummy
			PeranID:   2, // Role Mahasiswa
		}
		config.DB.Create(&user)

		nim := fmt.Sprintf("%s%d%04d", prodi.KodeProdi, year%100, i)
		student := models.Mahasiswa{
			PenggunaID:       user.ID,
			NIM:              nim,
			NamaMahasiswa:    namaLengkap,
			ProgramStudiID:   prodi.ID,
			TahunMasuk:       year,
			IPK:              2.0 + rand.Float64()*(4.0-2.0), // 2.0 to 4.0
			StatusAkun:       statuses[rand.Intn(len(statuses))],
			JenisKelamin:     jenisKelamins[rand.Intn(len(jenisKelamins))],
			SemesterSekarang: (2024-year)*2 + 1,
		}
		
		if student.StatusAkun == "Lulus" {
			student.SemesterSekarang = 8
		}
		
		config.DB.Create(&student)
	}

	fmt.Println("150 Mahasisa berhasil ditanam! Laporan Anda sekarang pasti GAGAH wok! 🔥")
}

package main

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	err := godotenv.Load("../.env")
	if err != nil {
		godotenv.Load(".env")
	}
	config.ConnectDB()

	hash, _ := bcrypt.GenerateFromPassword([]byte("12345678"), bcrypt.DefaultCost)
	hashedPassword := string(hash)

	email := "himakes.student@student.bku.ac.id"

	// Hapus user lama jika ada
	var existingUser models.User
	if err := config.DB.Where("email = ?", email).First(&existingUser).Error; err == nil {
		config.DB.Where("pengguna_id = ?", existingUser.ID).Delete(&models.Mahasiswa{})
		config.DB.Delete(&existingUser)
	}
	
	// Create user
	user := models.User{
		Email:    email,
		Password: hashedPassword,
		Role:     "mahasiswa",
	}
	config.DB.Create(&user)

	// Create Mahasiswa with Fakultas=13 and Prodi=39 (HIMAKES)
	mhs := models.Mahasiswa{
		PenggunaID:       user.ID,
		NIM:              "23HIMAKES01",
		Nama:             "Mahasiswa Tester HIMAKES",
		FakultasID:       13,
		ProgramStudiID:   39,
		SemesterSekarang: 3,
		StatusAkun:       "Aktif",
		StatusAkademik:   "Aktif",
		IPK:              3.85,
		TotalSKS:         45,
		CreditLimit:      24,
		TahunMasuk:       2023,
		JalurMasuk:       "Mandiri",
		NIK:              "1234567890123456",
		EmailKampus:      email,
		EmailPersonal:    "himakes.personal@example.com",
		NoHP:             "081234567890",
		Alamat:           "Jl. HIMAKES No 1",
		JenisKelamin:     "Laki-laki",
	}
	config.DB.Create(&mhs)

	fmt.Printf("✅ Berhasil membuat akun mahasiswa:\n")
	fmt.Printf("Nama: %s\n", mhs.Nama)
	fmt.Printf("NIM: %s\n", mhs.NIM)
	fmt.Printf("Fakultas ID: %d, Prodi ID: %d\n", mhs.FakultasID, mhs.ProgramStudiID)
	fmt.Printf("Email Login: %s\n", email)
	fmt.Printf("Password: 12345678\n")
}

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

	fmt.Println("--- SEEDING GRADUATION SUBMISSIONS ---")

	var student models.Student
	db.First(&student)

	if student.ID == 0 {
		log.Fatal("Run students seeder first!")
	}

	submissions := []models.GraduationSubmission{
		{
			StudentID:    student.ID,
			JudulSkripsi: "Analisis Sentimen Pengguna Twitter Terhadap Layanan Publik Menggunakan Algoritma Support Vector Machine",
			IPKAkhir:     3.85,
			Status:       "verifikasi",
			Keterangan:   "Berkas lengkap, sedang menunggu validasi prodi.",
		},
		{
			StudentID:    student.ID,
			JudulSkripsi: "Sistem Informasi Geografis Pemetaan Daerah Rawan Banjir di Kota Semarang Berbasis Web",
			IPKAkhir:     3.62,
			Status:       "pendaftaran",
			Keterangan:   "Baru mendaftar.",
		},
	}

	for _, s := range submissions {
		db.Create(&s)
	}

	fmt.Println("Success! Seeded 2 graduation submissions for Student ID:", student.ID)
}

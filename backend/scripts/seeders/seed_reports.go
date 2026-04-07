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

	// 1. Get Majors (Prodi)
	var majors []models.Major
	config.DB.Find(&majors)
	if len(majors) == 0 {
		fmt.Println("Gak ada prodi! Seed prodi dulu wok.")
		return
	}

	fmt.Printf("Sedang menanam %d mahasiswa ke prodi...\n", 150)

	names := []string{"Budi", "Siti", "Agus", "Rina", "Andi", "Dewi", "Eko", "Maya", "Rudi", "Lani", "Faiz", "Gita", "Heri", "Ika", "Joko"}
	lastNames := []string{"Saputra", "Lestari", "Kusuma", "Sari", "Wijaya", "Utami", "Pratama", "Putri", "Hidayat", "Ramadhani"}
	statuses := []string{"active", "active", "active", "graduated", "leave"}
	genders := []string{"L", "P"}

	rand.Seed(time.Now().UnixNano())

	for i := 0; i < 150; i++ {
		name := names[rand.Intn(len(names))] + " " + lastNames[rand.Intn(len(lastNames))]
		major := majors[rand.Intn(len(majors))]
		year := 2020 + rand.Intn(5) // 2020 to 2024
		
		// Create User first
		email := fmt.Sprintf("std%d%d@siakad.ac.id", year, i)
		user := models.User{
			Email:        email,
			PasswordHash: "$2a$10$7Q9lR.U2.E.uH2z.A.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u", // dummy
			RoleID:       2, // Role Mahasiswa
		}
		config.DB.Create(&user)

		nim := fmt.Sprintf("%s%d%04d", major.Code, year%100, i)
		student := models.Student{
			UserID:          user.ID,
			NIM:             nim,
			Name:            name,
			MajorID:         major.ID,
			EntryYear:       int16(year),
			GPA:             2.0 + rand.Float64()*(4.0-2.0), // 2.0 to 4.0
			Status:          statuses[rand.Intn(len(statuses))],
			Gender:          genders[rand.Intn(len(genders))],
			CurrentSemester: (2024-year)*2 + 1,
		}
		
		if student.Status == "graduated" {
			student.CurrentSemester = 8
		}
		
		config.DB.Create(&student)
	}

	fmt.Println("150 Mahasisa berhasil ditanam! Laporan Anda sekarang pasti GAGAH wok! 🔥")
}

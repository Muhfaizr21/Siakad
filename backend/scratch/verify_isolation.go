package main

import (
	"fmt"
	"log"
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	config.ConnectDB()

	var users []models.User
	config.DB.Where("role = ?", "faculty_admin").Find(&users)

	fmt.Println("=== Faculty Admin Users ===")
	for _, u := range users {
		fid := "NULL"
		if u.FakultasID != nil {
			fid = fmt.Sprintf("%d", *u.FakultasID)
		}
		fmt.Printf("Email: %s | Role: %s | FakultasID: %s\n", u.Email, u.Role, fid)
	}

	// Check some sample counts as a global vs isolated
	var totalMhs int64
	config.DB.Model(&models.Mahasiswa{}).Count(&totalMhs)
	fmt.Printf("\nTotal Mahasiswa (Global): %d\n", totalMhs)

	// Sample: FT Admin (usually ID 2 if seeded in order)
	var ftMhs int64
	config.DB.Model(&models.Mahasiswa{}).Where("fakultas_id = ?", 2).Count(&ftMhs)
	fmt.Printf("Total Mahasiswa (Fakultas ID 2): %d\n", ftMhs)
}

package main

import (
	"fmt"
	"log"

	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load("../backend/.env")
	if err != nil {
		err = godotenv.Load("backend/.env")
		if err != nil {
			log.Fatal("Error loading .env file")
		}
	}

	config.ConnectDB()

	var countFakultas int64
	config.DB.Model(&models.Fakultas{}).Count(&countFakultas)
	fmt.Printf("Total Fakultas: %d\n", countFakultas)

	var countProdi int64
	config.DB.Model(&models.ProgramStudi{}).Count(&countProdi)
	fmt.Printf("Total Program Studi: %d\n", countProdi)

	var prodis []models.ProgramStudi
	config.DB.Limit(5).Find(&prodis)
	for _, p := range prodis {
		fmt.Printf("Prodi: ID=%d, Nama=%s, FakultasID=%d\n", p.ID, p.Nama, p.FakultasID)
	}
}

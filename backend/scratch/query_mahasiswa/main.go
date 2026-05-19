package main

import (
	"encoding/json"
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env")
	config.ConnectDB()

	var students []models.Mahasiswa
	config.DB.Preload("Pengguna").Find(&students)

	bytes, _ := json.MarshalIndent(students, "", "  ")
	fmt.Println(string(bytes))
}

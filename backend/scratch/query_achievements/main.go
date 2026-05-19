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

	var achievements []models.Prestasi
	config.DB.Order("id desc").Find(&achievements)

	bytes, _ := json.MarshalIndent(achievements, "", "  ")
	fmt.Println(string(bytes))
}

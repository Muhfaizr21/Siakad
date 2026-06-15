package main

import (
	"log"
	"siakad-backend/config"
	"siakad-backend/models"
)

func main() {
	config.ConnectDB()
	err := config.DB.AutoMigrate(&models.LandingSetting{})
	if err != nil {
		log.Fatalf("Failed to migrate: %v", err)
	}
	log.Println("Successfully migrated LandingSetting")
}

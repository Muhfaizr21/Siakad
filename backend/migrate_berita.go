package main

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"log"
)

func main() {
	config.ConnectDB()
	err := config.DB.AutoMigrate(&models.Berita{})
	if err != nil {
		log.Fatalf("Failed to migrate: %v", err)
	}
	log.Println("Migrated successfully!")
}

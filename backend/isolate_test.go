package main

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	config.ConnectDB()
	var ids []uint
	// Check what we can query
	fmt.Println("DB Connected")
}

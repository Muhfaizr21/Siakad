package main

import (
	"fmt"
	"log"
	"siakad-backend/config"
	"github.com/joho/godotenv"
)

func main() {
	// Root of backend is one level up from scratch/
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	config.ConnectDB()
	db := config.DB

	fmt.Println("⚠️  Memulai pembersihan total database...")

	// 1. Drop specific schemas that hold the data to be clean
	// This is more effective than individual table deletes for mass purging
	schemas := []string{"mahasiswa", "ormawa", "fakultas"}
	for _, schema := range schemas {
		fmt.Printf("- Dropping schema: %s\n", schema)
		db.Exec(fmt.Sprintf("DROP SCHEMA IF EXISTS %s CASCADE", schema))
	}

	// 2. Clean public.users (keeping common schema)
	fmt.Println("- Cleaning public.users table...")
	db.Exec("TRUNCATE TABLE public.users RESTART IDENTITY CASCADE")

	fmt.Println("✅ Database cleaned. Next run of the app will re-create schemas via migrations.")
}

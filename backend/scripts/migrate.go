package main

import (
	"fmt"
	"io/ioutil"
	"log"
	
	"siakad-backend/config"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load("../.env")
	if err != nil {
		log.Println("No .env found outside. Trying current folder...")
		godotenv.Load(".env")
	}

	config.ConnectDB()
	db, err := config.DB.DB()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Dropping existing schema public to start fresh...")
	_, err = db.Exec("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
	if err != nil {
		log.Fatal("Failed dropping schema: ", err)
	}

	fmt.Println("Reading migration file: 01_ormawa_schema.sql")
	sqlBytes, err := ioutil.ReadFile("database/migrations/01_ormawa_schema.sql")
	if err != nil {
		log.Fatal("Failed reading file: ", err)
	}

	fmt.Println("Executing migration script...")
	_, err = db.Exec(string(sqlBytes))
	if err != nil {
		log.Fatal("Migration failed executing: ", err)
	}

	fmt.Println("MIGRATION COMPLETED SUCCESSFULLY! All Ormawa Models applied.")
}

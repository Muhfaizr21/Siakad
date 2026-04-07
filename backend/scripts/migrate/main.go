package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"
	"sort"
	
	"siakad-backend/config"

	"github.com/joho/godotenv"
)

func main() {
	// Robust env loading
	var loaded bool
	for _, p := range []string{"../../.env", "../.env", ".env"} {
		if err := godotenv.Load(p); err == nil {
			log.Println("Loaded .env from:", p)
			loaded = true
			break
		}
	}
	if !loaded {
		log.Println("WARNING: No .env file loaded. DB connection might fail.")
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

	// Read all SQL files from migrations directory
	files, err := ioutil.ReadDir("database/migrations")
	if err != nil {
		log.Fatal("Failed reading migrations directory: ", err)
	}

	var sqlFiles []string
	for _, file := range files {
		if !file.IsDir() && filepath.Ext(file.Name()) == ".sql" {
			sqlFiles = append(sqlFiles, file.Name())
		}
	}
	
	sort.Strings(sqlFiles)

	for _, fileName := range sqlFiles {
		fmt.Printf("Executing migration file: %s...\n", fileName)
		sqlBytes, err := ioutil.ReadFile(filepath.Join("database/migrations", fileName))
		if err != nil {
			log.Fatal("Failed reading file: ", err)
		}

		_, err = db.Exec(string(sqlBytes))
		if err != nil {
			log.Fatal("Migration failed executing: ", err, " in file ", fileName)
		}
	}

	fmt.Println("ALL MIGRATIONS COMPLETED SUCCESSFULLY!")
}

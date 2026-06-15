package main

import (
	"encoding/json"
	"fmt"
	"log"

	"siakad-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "host=localhost user=postgres password=12345 dbname=studenthub port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	var fakultas []models.Fakultas
	db.Find(&fakultas)
	b, _ := json.Marshal(fakultas)
	fmt.Println("Fakultas:", string(b))

	var prodi []models.ProgramStudi
	db.Find(&prodi)
	b2, _ := json.Marshal(prodi)
	fmt.Println("Prodi:", string(b2))
}

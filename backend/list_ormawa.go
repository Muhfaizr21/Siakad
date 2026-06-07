package main

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "host=127.0.0.1 user=postgres password=postgres dbname=siakad port=5432 sslmode=disable TimeZone=Asia/Jakarta"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	type Ormawa struct {
		ID        uint
		Nama      string
		Singkatan string
	}

	var ormawas []Ormawa
	// Include soft-deleted rows just in case
	db.Raw("SELECT id, nama, singkatan FROM ormawa.ormawa").Scan(&ormawas)
	fmt.Printf("Ormawas in DB: %+v\n", ormawas)
}

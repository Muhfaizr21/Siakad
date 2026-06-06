package main

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"os"
)

func main() {
	dsn := "host=localhost user=postgres password=postgres dbname=siakad_bku port=5432 sslmode=disable TimeZone=Asia/Jakarta"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Println("failed to connect database")
		os.Exit(1)
	}
	var role string
	db.Raw("SELECT role FROM users WHERE email = 'ha@gmail.com'").Scan(&role)
	fmt.Printf("ROLE: %s\n", role)
}

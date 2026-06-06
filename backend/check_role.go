//go:build ignore

package main

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"os"
)

func main() {
	dsn := "host=localhost user=postgres password=12345 dbname=studenthub port=5432 sslmode=disable TimeZone=Asia/Jakarta"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Printf("failed to connect database: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("--- NON-STUDENT USERS ---")
	var dbUsers []map[string]interface{}
	db.Raw("SELECT id, email, role FROM users WHERE role != 'mahasiswa'").Scan(&dbUsers)
	for _, u := range dbUsers {
		fmt.Printf("User: %v | Email: %v | Role: %v\n", u["id"], u["email"], u["role"])
	}
}

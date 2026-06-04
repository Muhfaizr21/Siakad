package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID    uint   `gorm:"primaryKey"`
	Email string `gorm:"uniqueIndex"`
	Role  string
}

func (User) TableName() string {
	return "public.users"
}

func main() {
	err := godotenv.Load("backend/.env")
	if err != nil {
		log.Println("Error loading .env file")
	}

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	var users []User
	db.Where("role = ?", "psikolog").Find(&users)

	fmt.Println("USERS IN DATABASE:")
	for _, u := range users {
		fmt.Printf("ID: %d | Email: %s | Role: %s\n", u.ID, u.Email, u.Role)
	}
}

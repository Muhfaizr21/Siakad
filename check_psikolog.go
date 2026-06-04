package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID       uint   `gorm:"primaryKey"`
	Email    string `gorm:"uniqueIndex"`
	Password string
	Role     string
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

	var u User
	err = db.Where("email = ?", "psikolog@bku.ac.id").First(&u).Error
	if err != nil {
		log.Fatal("User not found:", err)
	}

	fmt.Println("User Password Hash:", u.Password)
	err = bcrypt.CompareHashAndPassword([]byte(u.Password), []byte("12345678"))
	if err != nil {
		fmt.Println("Password verification FAILED:", err)
	} else {
		fmt.Println("Password verification SUCCEEDED")
	}
}

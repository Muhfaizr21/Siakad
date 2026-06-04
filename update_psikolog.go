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

	hash, err := bcrypt.GenerateFromPassword([]byte("12345678"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	result := db.Model(&User{}).Where("email = ?", "psikolog@bku.ac.id").Update("password", string(hash))
	if result.Error != nil {
		log.Fatal(result.Error)
	}

	fmt.Printf("Updated %d user(s). Password for psikolog@bku.ac.id set to '12345678'\n", result.RowsAffected)
}

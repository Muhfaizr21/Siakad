package config

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"siakad-backend/models"
)

var DB *gorm.DB

func ConnectDB() {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbname, port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database. \n", err)
	}

	log.Println("Connected Successfully to Database")

	/* 
	// Commenting out GORM AutoMigrate as we are using raw SQL migrations now
	log.Println("Running Migrations...")
	err = db.AutoMigrate(
		&models.Role{},
		&models.User{},
		&models.Faculty{},
		&models.Major{},
		&models.Lecturer{},
		&models.Student{},
	)
	if err != nil {
		log.Println("Migration Error:", err)
	} else {
		log.Println("Migrations Completed")
	}
	*/
	
	err = db.AutoMigrate(
		&models.Ormawa{},
		&models.OrmawaMember{},
		&models.Proposal{},
		&models.ProposalHistory{},
		&models.CashMutation{},
		&models.OrmawaRole{},
		&models.LPJ{},
		&models.EventSchedule{},
		&models.EventAttendance{},
		&models.OrmawaAnnouncement{},
		&models.OrmawaNotification{},
	)
	if err != nil {
		log.Println("Error migrating Ormawa models:", err)
	}
	
	DB = db
}

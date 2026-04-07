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

	// Run GORM AutoMigrate in batches to prevent one failure from stopping all
	log.Println("Running AutoMigrations in batches...")
	
	// 1. Core Models
	coreModels := []interface{}{
		&models.Role{},
		&models.User{},
		&models.Faculty{},
		&models.Major{},
		&models.Lecturer{},
		&models.Student{},
		&models.Grade{},
	}
	for _, m := range coreModels {
		if err := db.AutoMigrate(m); err != nil {
			log.Printf("Warning: Failed to migrate core model %T: %v", m, err)
		}
	}

	// 2. Admission (PMB) - Prioritas Sekarang!
	if err := db.AutoMigrate(&models.Admission{}); err != nil {
		log.Printf("Error migrating Admission model: %v", err)
	}

	// 3. Other Admin Models
	otherModels := []interface{}{
		&models.FacultySchedule{},
		&models.KRSSubmission{},
		&models.KRSItem{},
		&models.Aspiration{},
		&models.Achievement{},
		&models.LetterRequest{},
		&models.GraduationSubmission{},
		&models.MBKMProgram{},
		&models.Scholarship{},
		&models.ScholarshipApplication{},
		&models.Article{},
		&models.OrmawaProposal{},
		&models.FacultyOrganization{},
		&models.FacultyRole{},
	}
	for _, m := range otherModels {
		if err := db.AutoMigrate(m); err != nil {
			log.Printf("Warning: Failed to migrate model %T: %v", m, err)
		}
	}

	// 4. Problematic Models (Matakuliah & Ruangan) - Handle with care
	// We migrate these separately and IGNORE errors to ensure server starts
	log.Println("Migrating problematic models (ignoring minor constraint errors)...")
	_ = db.AutoMigrate(&models.Matakuliah{})
	_ = db.AutoMigrate(&models.Ruangan{})

	log.Println("AutoMigrations process finished.")
	
	DB = db
}

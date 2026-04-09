package config

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

type databaseConfig struct {
	Host     string
	User     string
	Password string
	Name     string
	Port     string
}

func ConnectDB() {
	cfg := loadDatabaseConfig()

	ensureDatabaseExists(cfg)

	db, err := connectPostgres(buildDSN(cfg, cfg.Name), logger.Info)
	if err != nil {
		log.Fatal("Failed to connect to database. \n", err)
	}

	log.Println("Connected Successfully to Database")

	enablePostgresExtensions(db)

	log.Println("Running Migrations...")
	if err := migrateModels(db); err != nil {
		log.Println("Migration Error:", err)
	} else {
		log.Println("Migrations Completed")
		InitialSyncFakultas(db)
	}

	if shouldRunSeed() {
		seedData(db)
	} else {
		log.Println("Seeder skipped (set RUN_SEED=true to enable)")
	}

	DB = db
}

func loadDatabaseConfig() databaseConfig {
	return databaseConfig{
		Host:     os.Getenv("DB_HOST"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		Name:     os.Getenv("DB_NAME"),
		Port:     os.Getenv("DB_PORT"),
	}
}

func buildDSN(cfg databaseConfig, dbName string) string {
	return fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		cfg.Host,
		cfg.User,
		cfg.Password,
		dbName,
		cfg.Port,
	)
}

func ensureDatabaseExists(cfg databaseConfig) {
	defaultDB, err := connectPostgres(buildDSN(cfg, "postgres"), logger.Silent)
	if err != nil {
		return
	}

	var existing string
	defaultDB.Raw("SELECT datname FROM pg_database WHERE datname = ?", cfg.Name).Scan(&existing)
	if existing == "" {
		log.Println("Database does not exist. Creating database:", cfg.Name)
		defaultDB.Exec(fmt.Sprintf("CREATE DATABASE %s;", cfg.Name))
	}
}

func connectPostgres(dsn string, logMode logger.LogLevel) (*gorm.DB, error) {
	return gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logMode),
	})
}

func enablePostgresExtensions(db *gorm.DB) {
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";")
}

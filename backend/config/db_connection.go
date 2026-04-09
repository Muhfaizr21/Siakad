package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

type databaseConfig struct {
	Host     string
	User     string
	Password string
	DBName   string
	Port     string
}

func ConnectDB() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	cfg := loadDatabaseConfig()

	ensureDatabaseExists(cfg)

	db, err := connectPostgres(buildDSN(cfg, cfg.DBName), logger.Info)
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

	DB = db
}

func loadDatabaseConfig() databaseConfig {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}

	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "siakad"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}

	log.Printf("[DB Config] Host: %s, Port: %s, User: %s, DBName: %s\n", host, port, user, dbname)

	return databaseConfig{
		Host:     host,
		User:     user,
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   dbname,
		Port:     port,
	}
}

func buildDSN(cfg databaseConfig, dbName string) string {
	passwordPart := ""
	if cfg.Password != "" {
		passwordPart = ":" + cfg.Password
	}
	return fmt.Sprintf(
		"postgres://%s%s@%s:%s/%s?sslmode=disable&TimeZone=Asia/Jakarta",
		cfg.User,
		passwordPart,
		cfg.Host,
		cfg.Port,
		dbName,
	)
}

func ensureDatabaseExists(cfg databaseConfig) {
	defaultDB, err := connectPostgres(buildDSN(cfg, "postgres"), logger.Silent)
	if err != nil {
		return
	}

	var existing string
	defaultDB.Raw("SELECT datname FROM pg_database WHERE datname = ?", cfg.DBName).Scan(&existing)
	if existing == "" {
		log.Println("Database does not exist. Creating database:", cfg.DBName)
		defaultDB.Exec(fmt.Sprintf("CREATE DATABASE %s;", cfg.DBName))
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

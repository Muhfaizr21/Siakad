package config

import (
	"log"
	"os"
	"strings"

	"gorm.io/gorm"
)

func seedData(db *gorm.DB) {
	seedCoreAcademicData(db)
	seedStudentModuleData(db)
	log.Println("Seed process completed")
}

func shouldRunSeed() bool {
	raw := strings.TrimSpace(strings.ToLower(os.Getenv("RUN_SEED")))
	return raw == "1" || raw == "true" || raw == "yes"
}

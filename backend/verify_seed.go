package scratch

import (
	"fmt"
	"siakad-backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "host=localhost user=muhfaiizr password=admin dbname=siakad port=5432 sslmode=disable TimeZone=Asia/Jakarta"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Printf("❌ Failed: %v\n", err)
		return
	}

	var countMhs int64
	db.Model(&models.Mahasiswa{}).Count(&countMhs)
	fmt.Printf("📊 Total Mahasiswa: %d\n", countMhs)

	var countUser int64
	db.Model(&models.User{}).Where("role = ?", "mahasiswa").Count(&countUser)
	fmt.Printf("📊 Total User (Mahasiswa): %d\n", countUser)

	var mhs1 models.Mahasiswa
	db.First(&mhs1)
	fmt.Printf("🔍 First Mhs: Name=%s, ID=%d, UserID=%d\n", mhs1.Nama, mhs1.ID, mhs1.PenggunaID)
}

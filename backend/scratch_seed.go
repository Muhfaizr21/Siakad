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
		fmt.Printf("❌ Failed to connect database: %v\n", err)
		return
	}

	fmt.Println("🚀 Seeding 3 Premium Lecturers & Accounts...")

	// 1. Get Faculty & Prodi
	var fak models.Fakultas
	db.First(&fak)
	var prodi models.ProgramStudi
	db.First(&prodi)

	if fak.ID == 0 || prodi.ID == 0 {
		fmt.Println("❌ Error: No Faculty or Prodi found. Run migrations first.")
		return
	}

	// 2. Prepare Data
	data := []struct {
		Name    string
		NIDN    string
		Jabatan string
		Email   string
	}{
		{"Dr. Ahmad Wijaya, M.T.", "0401018501", "Lektor Kepala", "ahmad.wijaya@bku.ac.id"},
		{"Siti Aminah, M.Kom.", "0412059002", "Asisten Ahli", "siti.aminah@bku.ac.id"},
		{"Ir. Bambang Triyono, Ph.D.", "0009087503", "Profesor", "bambang.tri@bku.ac.id"},
	}

	for _, d := range data {
		// Create User first to avoid FK violation
		user := models.User{
			Email:    d.Email,
			Password: "hashed_password_here", // Should use real hashing in production
			Role:     "dosen",
		}
		
		var existingUser models.User
		db.Where("email = ?", d.Email).First(&existingUser)
		
		if existingUser.ID == 0 {
			db.Create(&user)
		} else {
			user = existingUser
		}

		// Create Dosen
		lec := models.Dosen{
			Nama:           d.Name,
			NIDN:           d.NIDN,
			Jabatan:        d.Jabatan,
			FakultasID:     fak.ID,
			ProgramStudiID: prodi.ID,
			Email:          d.Email,
			PenggunaID:     user.ID,
		}

		// Use struct in Where to let GORM handle column naming (n_id_n)
		var existingLec models.Dosen
		db.Where("n_id_n = ?", d.NIDN).First(&existingLec)

		if existingLec.ID == 0 {
			if err := db.Create(&lec).Error; err != nil {
				fmt.Printf("❌ Failed: %s - %v\n", d.Name, err)
			} else {
				fmt.Printf("✅ Success: %s\n", d.Name)
			}
		} else {
			fmt.Printf("ℹ️  Existing: %s\n", d.Name)
		}
	}

	fmt.Println("🏁 Seeding complete.")
}

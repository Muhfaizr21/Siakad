package config

import (
	"log"

	"siakad-backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func seedCoreAcademicData(db *gorm.DB) {
	// Create Fakultas
	var fakultas models.Fakultas
	db.Where("kode = ?", "FIK").FirstOrCreate(&fakultas, models.Fakultas{
		Nama: "Fakultas Ilmu Komputer",
		Kode: "FIK",
	})

	// Create Program Studi
	var prodi models.ProgramStudi
	db.Where("nama = ? AND fakultas_id = ?", "Teknik Informatika", fakultas.ID).FirstOrCreate(&prodi, models.ProgramStudi{
		Nama:       "Teknik Informatika",
		Kode:       "IF",
		FakultasID: fakultas.ID,
	})

	// Create Dosen User
	var dosenUser models.User
	db.Where("email = ?", "dosen1@bku.ac.id").First(&dosenUser)
	if dosenUser.ID == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		dosenUser = models.User{
			Email:    "dosen1@bku.ac.id",
			Password: string(hash),
			Role:     "Dosen",
		}
		db.Create(&dosenUser)
	}

	// Create Dosen Profile
	var dosen models.Dosen
	db.Where("pengguna_id = ?", dosenUser.ID).FirstOrCreate(&dosen, models.Dosen{
		PenggunaID:     dosenUser.ID,
		NIDN:           "9988776655",
		Nama:           "Budi Santoso, M.Kom",
		FakultasID:     fakultas.ID,
		ProgramStudiID: prodi.ID,
	})

	// Create Mahasiswa User
	var mhsUser models.User
	db.Where("email = ?", "mahasiswa@bku.ac.id").First(&mhsUser)
	if mhsUser.ID == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		mhsUser = models.User{
			Email:    "mahasiswa@bku.ac.id",
			Password: string(hash),
			Role:     "Mahasiswa",
		}
		db.Create(&mhsUser)
	}

	// Create Mahasiswa Profile
	var mhs models.Mahasiswa
	db.Where("pengguna_id = ?", mhsUser.ID).FirstOrCreate(&mhs, models.Mahasiswa{
		PenggunaID:       mhsUser.ID,
		NIM:              "10123456",
		Nama:             "Tegar Mahasiswa BKU",
		FakultasID:       fakultas.ID,
		ProgramStudiID:   prodi.ID,
		SemesterSekarang: 5,
		StatusAkun:       "Aktif",
		TahunMasuk:       2021,
	})

	log.Println("==> Seeder: Setup Academic Data successfully.")
}

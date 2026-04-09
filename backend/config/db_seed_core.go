package config

import (
	"log"

	"siakad-backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func seedCoreAcademicData(db *gorm.DB) {
	var peran models.Peran
	db.FirstOrCreate(&peran, models.Peran{NamaPeran: "Mahasiswa"})

	var fakultas models.Fakultas
	db.Where("kode_fakultas = ?", "FIK").FirstOrCreate(&fakultas, models.Fakultas{
		NamaFakultas: "Fakultas Ilmu Komputer",
		KodeFakultas: "FIK",
	})

	var prodi models.ProgramStudi
	db.Where("nama_prodi = ? AND fakultas_id = ?", "Teknik Informatika", fakultas.ID).FirstOrCreate(&prodi, models.ProgramStudi{
		NamaProdi:  "Teknik Informatika",
		KodeProdi:  "IF",
		FakultasID: fakultas.ID,
	})

	var dosen models.Dosen
	var dosenUser models.Pengguna
	db.Where("email = ?", "dosen1@bku.ac.id").First(&dosenUser)
	if dosenUser.ID == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		dosenUser = models.Pengguna{
			Email:     "dosen1@bku.ac.id",
			KataSandi: string(hash),
			PeranID:   peran.ID,
			Aktif:     true,
		}
		db.Create(&dosenUser)
	}
	db.Where("pengguna_id = ?", dosenUser.ID).FirstOrCreate(&dosen, models.Dosen{
		PenggunaID: dosenUser.ID,
		NIDN:       "9988776655",
		NamaDosen:  "Budi Santoso, M.Kom",
		FakultasID: fakultas.ID,
	})

	var mhs models.Mahasiswa
	var mhsUser models.Pengguna
	db.Where("email = ?", "mahasiswa@bku.ac.id").First(&mhsUser)
	if mhsUser.ID == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		mhsUser = models.Pengguna{
			Email:     "mahasiswa@bku.ac.id",
			KataSandi: string(hash),
			PeranID:   peran.ID,
			Aktif:     true,
		}
		db.Create(&mhsUser)
	}
	db.Where("pengguna_id = ?", mhsUser.ID).FirstOrCreate(&mhs, models.Mahasiswa{
		PenggunaID:       mhsUser.ID,
		NIM:              "10123456",
		NamaMahasiswa:    "Tegar Mahasiswa BKU",
		ProgramStudiID:   prodi.ID,
		SemesterSekarang: 5,
		StatusAkun:       "Aktif",
		TahunMasuk:       2021,
	})

	log.Println("==> Seeder: Setup Academic Data successfully.")
}

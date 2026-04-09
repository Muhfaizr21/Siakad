package config

import (
	"log"

	"siakad-backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func seedCoreAcademicData(db *gorm.DB) {
	var role models.Role
	db.FirstOrCreate(&role, models.Role{Name: "Student"})

	var faculty models.Faculty
	db.Where("kode_fakultas = ?", "FIK").FirstOrCreate(&faculty, models.Faculty{
		Name: "Fakultas Ilmu Komputer",
		Code: "FIK",
	})

	var major models.Major
	db.Where("nama_prodi = ? AND fakultas_id = ?", "Teknik Informatika", faculty.ID).FirstOrCreate(&major, models.Major{
		Name:      "Teknik Informatika",
		FacultyID: faculty.ID,
	})

	var dosen models.Lecturer
	var dosenUser models.User
	db.Where("email = ?", "dosen1@bku.ac.id").First(&dosenUser)
	if dosenUser.ID == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		dosenUser = models.User{
			Email:        "dosen1@bku.ac.id",
			PasswordHash: string(hash),
			RoleID:       role.ID,
			IsActive:     true,
		}
		db.Create(&dosenUser)
	}
	db.Where("pengguna_id = ?", dosenUser.ID).FirstOrCreate(&dosen, models.Lecturer{
		UserID:    dosenUser.ID,
		NIDN:      "9988776655",
		Name:      "Budi Santoso, M.Kom",
		FacultyID: faculty.ID,
	})

	var student models.Student
	var user models.User
	db.Where("email = ?", "mahasiswa@bku.ac.id").First(&user)
	if user.ID == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		user = models.User{
			Email:        "mahasiswa@bku.ac.id",
			PasswordHash: string(hash),
			RoleID:       role.ID,
			IsActive:     true,
		}
		db.Create(&user)
	}
	db.Where("pengguna_id = ?", user.ID).FirstOrCreate(&student, models.Student{
		UserID:          user.ID,
		NIM:             "10123456",
		Name:            "Tegar Mahasiswa BKU",
		MajorID:         major.ID,
		CurrentSemester: 5,
		Status:          "Aktif",
		EntryYear:       2021,
	})

	var periodePast models.PeriodeAkademik
	db.Where("name = ?", "Genap 2025/2026").FirstOrCreate(&periodePast, models.PeriodeAkademik{
		Name:     "Genap 2025/2026",
		Semester: "Genap",
		IsActive: false,
		KRSOpen:  false,
	})

	var periodeActive models.PeriodeAkademik
	db.Where("name = ?", "Ganjil 2026/2027").FirstOrCreate(&periodeActive, models.PeriodeAkademik{
		Name:     "Ganjil 2026/2027",
		Semester: "Ganjil",
		IsActive: true,
		KRSOpen:  true,
	})

	var jCount int64
	db.Model(&models.JadwalKuliah{}).Count(&jCount)
	if jCount == 0 {
		mkAlgodat := models.MataKuliah{Code: "IF101", Name: "Algoritma & Struktur Data", SKS: 3, Semester: 2, MajorID: major.ID}
		db.FirstOrCreate(&mkAlgodat, models.MataKuliah{Code: "IF101"})

		mkWeb := models.MataKuliah{Code: "IF201", Name: "Pemrograman Web Lanjut", SKS: 3, Semester: 5, MajorID: major.ID}
		db.FirstOrCreate(&mkWeb, models.MataKuliah{Code: "IF201"})

		mkAI := models.MataKuliah{Code: "IF301", Name: "Kecerdasan Buatan", SKS: 4, Semester: 5, MajorID: major.ID}
		db.FirstOrCreate(&mkAI, models.MataKuliah{Code: "IF301"})

		mkRPL := models.MataKuliah{Code: "IF302", Name: "Rekayasa Perangkat Lunak", SKS: 3, Semester: 5, MajorID: major.ID}
		db.FirstOrCreate(&mkRPL, models.MataKuliah{Code: "IF302"})

		db.FirstOrCreate(&models.MataKuliahPrasyarat{}, models.MataKuliahPrasyarat{
			MataKuliahID: mkWeb.ID,
			PrasyaratID:  mkAlgodat.ID,
		})

		db.Create(&models.JadwalKuliah{
			MataKuliahID:  mkWeb.ID,
			LecturerID:    dosen.ID,
			PeriodeID:     periodeActive.ID,
			Hari:          1,
			JamMulai:      "08:00",
			JamSelesai:    "10:30",
			Ruang:         "Lab Komputer 1",
			Kuota:         40,
			TahunAkademik: "2026",
		})

		db.Create(&models.JadwalKuliah{
			MataKuliahID:  mkAI.ID,
			LecturerID:    dosen.ID,
			PeriodeID:     periodeActive.ID,
			Hari:          1,
			JamMulai:      "10:00",
			JamSelesai:    "12:30",
			Ruang:         "Ruang 301",
			Kuota:         40,
			TahunAkademik: "2026",
		})

		db.Create(&models.JadwalKuliah{
			MataKuliahID:  mkRPL.ID,
			LecturerID:    dosen.ID,
			PeriodeID:     periodeActive.ID,
			Hari:          2,
			JamMulai:      "13:00",
			JamSelesai:    "15:30",
			Ruang:         "Ruang 302",
			Kuota:         0,
			TahunAkademik: "2026",
		})

		db.Create(&models.KHS{
			StudentID:    student.ID,
			MataKuliahID: mkAlgodat.ID,
			PeriodeID:    periodePast.ID,
			NilaiHuruf:   "B",
			Bobot:        3.0,
		})

		log.Println("==> Seeder: Setup Academic Data successfully.")
	}
}

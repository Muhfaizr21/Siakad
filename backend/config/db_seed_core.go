package config

import (
	"log"

	"siakad-backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func seedCoreAcademicData(db *gorm.DB) {
	var studentRole models.Role
	db.Where("nama_peran = ?", "Student").FirstOrCreate(&studentRole, models.Role{Name: "Student"})
	
	var superAdminRole models.Role
	db.Where("nama_peran = ?", "SuperAdmin").FirstOrCreate(&superAdminRole, models.Role{Name: "SuperAdmin"})

	var facultyAdminRole models.Role
	db.Where("nama_peran = ?", "FacultyAdmin").FirstOrCreate(&facultyAdminRole, models.Role{Name: "FacultyAdmin"})

	// Create Super Admin User
	var superUser models.User
	db.Where("email = ?", "admin@siakad.com").First(&superUser)
	if superUser.ID == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		superUser = models.User{
			Email:        "admin@siakad.com",
			PasswordHash: string(hash),
			RoleID:       superAdminRole.ID,
			IsActive:     true,
		}
		db.Create(&superUser)
	}

	var faculty models.Faculty
	db.Where("kode_fakultas = ?", "FIK").FirstOrCreate(&faculty, models.Faculty{
		Name: "Fakultas Ilmu Komputer",
		Code: "FIK",
		DeanName: "Budi Rahardjo, Ph.D",
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
			RoleID:       3, // FacultyAdmin or similar
			IsActive:     true,
		}
		db.Create(&dosenUser)
	}
	
	db.Where("pengguna_id = ?", dosenUser.ID).First(&dosen)
	if dosen.ID == 0 {
		dosen = models.Lecturer{
			UserID:    dosenUser.ID,
			NIDN:      "9988776655",
			Name:      "Budi Santoso, M.Kom",
			FacultyID: faculty.ID,
		}
		db.Create(&dosen)
	}

	var student models.Student
	var user models.User
	db.Where("email = ?", "mahasiswa@bku.ac.id").First(&user)
	if user.ID == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		user = models.User{
			Email:        "mahasiswa@bku.ac.id",
			PasswordHash: string(hash),
			RoleID:       studentRole.ID,
			IsActive:     true,
		}
		db.Create(&user)
	}
	
	db.Where("pengguna_id = ?", user.ID).First(&student)
	if student.ID == 0 {
		student = models.Student{
			UserID:          user.ID,
			NIM:             "10123456",
			Name:            "Tegar Mahasiswa BKU",
			MajorID:         major.ID,
			CurrentSemester: 5,
			Status:          "Aktif",
			EntryYear:       2021,
		}
		db.Create(&student)
	}

	var periodePast models.PeriodeAkademik
	db.Where("name = ?", "Genap 2025/2026").First(&periodePast)
	if periodePast.ID == 0 {
		periodePast = models.PeriodeAkademik{
			Name:     "Genap 2025/2026",
			Semester: "Genap",
			IsActive: false,
			KRSOpen:  false,
		}
		db.Create(&periodePast)
	}

	var periodeActive models.PeriodeAkademik
	db.Where("name = ?", "Ganjil 2026/2027").First(&periodeActive)
	if periodeActive.ID == 0 {
		periodeActive = models.PeriodeAkademik{
			Name:     "Ganjil 2026/2027",
			Semester: "Ganjil",
			IsActive: true,
			KRSOpen:  true,
		}
		db.Create(&periodeActive)
	}

	var jCount int64
	db.Model(&models.JadwalKuliah{}).Count(&jCount)
	if jCount == 0 {
		mkAlgodat := models.MataKuliah{Code: "IF101", Name: "Algoritma & Struktur Data", SKS: 3, Semester: 2, MajorID: major.ID}
		db.Where("kode_mk = ?", "IF101").FirstOrCreate(&mkAlgodat)

		mkWeb := models.MataKuliah{Code: "IF201", Name: "Pemrograman Web Lanjut", SKS: 3, Semester: 5, MajorID: major.ID}
		db.Where("kode_mk = ?", "IF201").FirstOrCreate(&mkWeb)

		mkAI := models.MataKuliah{Code: "IF301", Name: "Kecerdasan Buatan", SKS: 4, Semester: 5, MajorID: major.ID}
		db.Where("kode_mk = ?", "IF301").FirstOrCreate(&mkAI)

		mkRPL := models.MataKuliah{Code: "IF302", Name: "Rekayasa Perangkat Lunak", SKS: 3, Semester: 5, MajorID: major.ID}
		db.Where("kode_mk = ?", "IF302").FirstOrCreate(&mkRPL)

		if mkWeb.ID != 0 && mkAlgodat.ID != 0 {
			db.FirstOrCreate(&models.MataKuliahPrasyarat{}, models.MataKuliahPrasyarat{
				MataKuliahID: mkWeb.ID,
				PrasyaratID:  mkAlgodat.ID,
			})
		}

		if dosen.ID != 0 && periodeActive.ID != 0 {
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
		}

		if student.ID != 0 && mkAlgodat.ID != 0 && periodePast.ID != 0 {
			db.Create(&models.KHS{
				StudentID:    student.ID,
				MataKuliahID: mkAlgodat.ID,
				PeriodeID:    periodePast.ID,
				NilaiHuruf:   "B",
				Bobot:        3.0,
			})
		}

		log.Println("==> Seeder: Setup Academic Data successfully.")
	}
}

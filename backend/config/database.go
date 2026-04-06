package config

import (
	"fmt"
	"log"
	"os"

	"siakad-backend/models"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"golang.org/x/crypto/bcrypt"
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

	// --- AUTO CREATE DATABASE SNIPPET ---
	// Connect to default 'postgres' db first to create our target DB if missing
	dsnDefault := fmt.Sprintf("host=%s user=%s password=%s dbname=postgres port=%s sslmode=disable",
		host, user, password, port)
	defaultDb, errDef := gorm.Open(postgres.Open(dsnDefault), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if errDef == nil {
		var checkDb string
		defaultDb.Raw("SELECT datname FROM pg_database WHERE datname = ?", dbname).Scan(&checkDb)
		if checkDb == "" {
			log.Println("Database does not exist. Creating database:", dbname)
			defaultDb.Exec(fmt.Sprintf("CREATE DATABASE %s;", dbname))
		}
	}
	// ------------------------------------

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database. \n", err)
	}

	log.Println("Connected Successfully to Database")

	// Enable pgcrypto for UUIDs
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";")

	// Migrate the schema
	log.Println("Running Migrations...")
	err = db.AutoMigrate(
		&models.Role{},
		&models.User{},
		&models.Faculty{},
		&models.Major{},
		&models.Lecturer{},
		&models.Student{},
		&models.PeriodeAkademik{},
		&models.MataKuliah{},
		&models.MataKuliahPrasyarat{},
		&models.JadwalKuliah{},
		&models.KHS{},
		&models.KRSHeader{},
		&models.KRSDetail{},
		// BKU Modules
		&models.KencanaTahap{},
		&models.KencanaMateri{},
		&models.KencanaKuis{},
		&models.KuisSoal{},
		&models.KencanaHasilKuis{},
		&models.KencanaProgress{},
		&models.KencanaBanding{},
		&models.KencanaSertifikat{},
		&models.Achievement{},
		&models.Beasiswa{},
		&models.PengajuanBeasiswa{},
		&models.PengajuanBerkas{},
		&models.PengajuanPipelineLog{},
		&models.JadwalKonseling{},
		&models.BookingKonseling{},
		&models.HasilKesehatan{},
		&models.TiketAspirasi{},
		&models.RiwayatOrganisasi{},
		&models.Pengumuman{},
		&models.KegiatanKampus{},
		&models.AktivitasLog{},
		&models.LoginHistory{},
		&models.NotificationPreference{},
		&models.Notification{},
	)
	if err != nil {
		log.Println("Migration Error:", err)
	} else {
		log.Println("Migrations Completed")
	}

	// === AUTO SEED TEST DATA ===
	seedData(db)
	
	DB = db
}

func seedData(db *gorm.DB) {
	// 1. Roles
	var role models.Role
	db.FirstOrCreate(&role, models.Role{Name: "Student"})

	// 2. Faculty & Major
	var faculty models.Faculty
	db.Where("code = ?", "FIK").FirstOrCreate(&faculty, models.Faculty{
		Name: "Fakultas Ilmu Komputer",
		Code: "FIK",
	})

	var major models.Major
	db.Where("name = ? AND faculty_id = ?", "Teknik Informatika", faculty.ID).FirstOrCreate(&major, models.Major{
		Name:      "Teknik Informatika",
		FacultyID: faculty.ID,
	})

	// 3. Lecturer (Dosen)
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
	db.Where("user_id = ?", dosenUser.ID).FirstOrCreate(&dosen, models.Lecturer{
		UserID:    dosenUser.ID,
		NIDN:      "9988776655",
		Name:      "Budi Santoso, M.Kom",
		FacultyID: faculty.ID,
	})

	// 4. Student (Mahasiswa)
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
	db.Where("user_id = ?", user.ID).FirstOrCreate(&student, models.Student{
		UserID:          user.ID,
		NIM:             "10123456",
		Name:            "Tegar Mahasiswa BKU",
		MajorID:         major.ID,
		CurrentSemester: 5,
		Status:          "aktif",
		EntryYear:       2021,
	})

	// 5. Academic Periods
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

	// 6. Courses & Schedules (Check if Schedules exist before proceeding)
	var jCount int64
	db.Model(&models.JadwalKuliah{}).Count(&jCount)
	if jCount == 0 {
		// Mata Kuliah
		mkAlgodat := models.MataKuliah{Code: "IF101", Name: "Algoritma & Struktur Data", SKS: 3, Semester: 2, MajorID: major.ID}
		db.FirstOrCreate(&mkAlgodat, models.MataKuliah{Code: "IF101"})

		mkWeb := models.MataKuliah{Code: "IF201", Name: "Pemrograman Web Lanjut", SKS: 3, Semester: 5, MajorID: major.ID}
		db.FirstOrCreate(&mkWeb, models.MataKuliah{Code: "IF201"})

		mkAI := models.MataKuliah{Code: "IF301", Name: "Kecerdasan Buatan", SKS: 4, Semester: 5, MajorID: major.ID}
		db.FirstOrCreate(&mkAI, models.MataKuliah{Code: "IF301"})

		mkRPL := models.MataKuliah{Code: "IF302", Name: "Rekayasa Perangkat Lunak", SKS: 3, Semester: 5, MajorID: major.ID}
		db.FirstOrCreate(&mkRPL, models.MataKuliah{Code: "IF302"})

		// Prasyarat
		db.FirstOrCreate(&models.MataKuliahPrasyarat{}, models.MataKuliahPrasyarat{
			MataKuliahID: mkWeb.ID,
			PrasyaratID:  mkAlgodat.ID,
		})

		// Schedules
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
			JamMulai:      "10:00", // CONFLICT
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
			Kuota:         0, // FULL
			TahunAkademik: "2026",
		})

		// Grades (KHS)
		db.Create(&models.KHS{
			StudentID:    student.ID,
			MataKuliahID: mkAlgodat.ID,
			PeriodeID:    periodePast.ID,
			NilaiHuruf:   "B",
			Bobot:        3.0,
		})

		log.Println("==> Seeder: Setup Academic Data successfully.")
	}

	// 7. Kencana Seeder — 3 Tahap
	var tahapCount int64
	db.Model(&models.KencanaTahap{}).Count(&tahapCount)
	if tahapCount == 0 {
		// Buat 3 Tahap
		tanggalPra := time.Date(2026, 8, 15, 0, 0, 0, 0, time.Local)
		tanggalPraEnd := time.Date(2026, 8, 17, 0, 0, 0, 0, time.Local)
		tahapPra := models.KencanaTahap{
			Nama: "pra", Label: "Pra-KENCANA", Urutan: 1,
			TanggalMulai: &tanggalPra, TanggalSelesai: &tanggalPraEnd,
			Status: "berlangsung", IsAktif: true,
		}
		db.Create(&tahapPra)

		tanggalInti := time.Date(2026, 8, 18, 0, 0, 0, 0, time.Local)
		tanggalIntiEnd := time.Date(2026, 8, 22, 0, 0, 0, 0, time.Local)
		tahapInti := models.KencanaTahap{
			Nama: "inti", Label: "KENCANA Inti", Urutan: 2,
			TanggalMulai: &tanggalInti, TanggalSelesai: &tanggalIntiEnd,
			Status: "akan_datang", IsAktif: true,
		}
		db.Create(&tahapInti)

		tanggalPasca := time.Date(2026, 8, 23, 0, 0, 0, 0, time.Local)
		tanggalPascaEnd := time.Date(2026, 8, 25, 0, 0, 0, 0, time.Local)
		tahapPasca := models.KencanaTahap{
			Nama: "pasca", Label: "Pasca-KENCANA", Urutan: 3,
			TanggalMulai: &tanggalPasca, TanggalSelesai: &tanggalPascaEnd,
			Status: "akan_datang", IsAktif: true,
		}
		db.Create(&tahapPasca)

		// Tahap 1: Pra-KENCANA — 2 modul (total bobot 40%)
		m1 := models.KencanaMateri{TahapID: tahapPra.ID, Urutan: 1,
			Judul: "Sejarah & Nilai Dasar Universitas Bhakti Kencana",
			Tipe: "PDF", FileURL: "https://example.com/materi1.pdf", IsAktif: true,
		}
		db.Create(&m1)
		bobot1 := 20.0
		k1 := models.KencanaKuis{KencanaMateriID: m1.ID, Judul: "Kuis Modul 1: Sejarah BKU",
			PassingGrade: 75, BobotPersen: bobot1, IsAktif: true,
		}
		db.Create(&k1)
		db.Create(&models.KuisSoal{KencanaKuisID: k1.ID, Urutan: 1,
			Pertanyaan: "Tahun berapa Universitas Bhakti Kencana diresmikan?",
			OpsiA: "2019", OpsiB: "2010", OpsiC: "2005", OpsiD: "1998", KunciJawaban: "A",
		})
		db.Create(&models.KuisSoal{KencanaKuisID: k1.ID, Urutan: 2,
			Pertanyaan: "Warna yang mendominasi logo BKU adalah?",
			OpsiA: "Merah", OpsiB: "Orange", OpsiC: "Biru", OpsiD: "Hijau", KunciJawaban: "B",
		})
		db.Create(&models.KuisSoal{KencanaKuisID: k1.ID, Urutan: 3,
			Pertanyaan: "Apa visi utama Universitas Bhakti Kencana?",
			OpsiA: "Menjadi universitas berbasis riset", OpsiB: "Menghasilkan lulusan berbudi pekerti luhur dan kompeten",
			OpsiC: "Menjadi universitas internasional", OpsiD: "Mencetak pengusaha muda", KunciJawaban: "B",
		})

		m2 := models.KencanaMateri{TahapID: tahapPra.ID, Urutan: 2,
			Judul: "Sistem Akademik & Peraturan Kampus",
			Tipe: "Video", FileURL: "https://www.youtube.com/embed/dQw4w9WgXcQ", IsAktif: true,
		}
		db.Create(&m2)
		bobot2 := 20.0
		k2 := models.KencanaKuis{KencanaMateriID: m2.ID, Judul: "Kuis Modul 2: Sistem Akademik",
			PassingGrade: 75, BobotPersen: bobot2, IsAktif: true,
		}
		db.Create(&k2)
		db.Create(&models.KuisSoal{KencanaKuisID: k2.ID, Urutan: 1,
			Pertanyaan: "Apa kepanjangan dari SKS?",
			OpsiA: "Sistem Kelas Singkat", OpsiB: "Standar Kesuksesan Studi",
			OpsiC: "Sistem Kredit Semester", OpsiD: "Satuan Kredit Siswa", KunciJawaban: "C",
		})
		db.Create(&models.KuisSoal{KencanaKuisID: k2.ID, Urutan: 2,
			Pertanyaan: "Berapa SKS maksimal yang bisa diambil per semester jika IPK >= 3.0?",
			OpsiA: "18 SKS", OpsiB: "20 SKS", OpsiC: "22 SKS", OpsiD: "24 SKS", KunciJawaban: "D",
		})

		// Tahap 2: KENCANA Inti — 2 modul (total bobot 40%)
		m3 := models.KencanaMateri{TahapID: tahapInti.ID, Urutan: 1,
			Judul: "Kehidupan Kemahasiswaan & Organisasi",
			Tipe: "PDF", FileURL: "https://example.com/materi3.pdf", IsAktif: true,
		}
		db.Create(&m3)
		bobot3 := 20.0
		k3 := models.KencanaKuis{KencanaMateriID: m3.ID, Judul: "Kuis Modul 3: Kemahasiswaan",
			PassingGrade: 75, BobotPersen: bobot3, IsAktif: true,
		}
		db.Create(&k3)
		db.Create(&models.KuisSoal{KencanaKuisID: k3.ID, Urutan: 1,
			Pertanyaan: "Apa nama organisasi mahasiswa tertinggi di BKU?",
			OpsiA: "HIMA", OpsiB: "BEM", OpsiC: "DPM", OpsiD: "UKM", KunciJawaban: "B",
		})
		db.Create(&models.KuisSoal{KencanaKuisID: k3.ID, Urutan: 2,
			Pertanyaan: "Apa kepanjangan dari BEM?",
			OpsiA: "Badan Eksekutif Mahasiswa", OpsiB: "Badan Edukasi Mahasiswa",
			OpsiC: "Biro Eksekutif Mahasiswa", OpsiD: "Biro Edukasi Mandiri", KunciJawaban: "A",
		})

		m4 := models.KencanaMateri{TahapID: tahapInti.ID, Urutan: 2,
			Judul: "Layanan Kesehatan & Konseling Kampus",
			Tipe: "PDF", FileURL: "https://example.com/materi4.pdf", IsAktif: true,
		}
		db.Create(&m4)
		bobot4 := 20.0
		k4 := models.KencanaKuis{KencanaMateriID: m4.ID, Judul: "Kuis Modul 4: Layanan Kampus",
			PassingGrade: 75, BobotPersen: bobot4, IsAktif: true,
		}
		db.Create(&k4)
		db.Create(&models.KuisSoal{KencanaKuisID: k4.ID, Urutan: 1,
			Pertanyaan: "Di mana lokasi klinik kesehatan BKU?",
			OpsiA: "Gedung A", OpsiB: "Gedung B", OpsiC: "Gedung C - Lantai 1", OpsiD: "Di luar kampus", KunciJawaban: "C",
		})

		// Tahap 3: Pasca-KENCANA — 1 modul (total bobot 20%)
		m5 := models.KencanaMateri{TahapID: tahapPasca.ID, Urutan: 1,
			Judul: "Etika Digital & Media Sosial Mahasiswa",
			Tipe: "Video", FileURL: "https://www.youtube.com/embed/dQw4w9WgXcQ", IsAktif: true,
		}
		db.Create(&m5)
		bobot5 := 20.0
		k5 := models.KencanaKuis{KencanaMateriID: m5.ID, Judul: "Kuis Modul 5: Etika Digital",
			PassingGrade: 75, BobotPersen: bobot5, IsAktif: true,
		}
		db.Create(&k5)
		db.Create(&models.KuisSoal{KencanaKuisID: k5.ID, Urutan: 1,
			Pertanyaan: "Perilaku mana yang termasuk etika digital yang baik?",
			OpsiA: "Menyebarkan informasi tanpa verifikasi",
			OpsiB: "Menggunakan nama asli saat berinteraksi online",
			OpsiC: "Mengejek teman di media sosial",
			OpsiD: "Membagikan data pribadi orang lain",
			KunciJawaban: "B",
		})
		db.Create(&models.KuisSoal{KencanaKuisID: k5.ID, Urutan: 2,
			Pertanyaan: "Apa yang dimaksud dengan cyberbullying?",
			OpsiA: "Bermain game online", OpsiB: "Belajar coding",
			OpsiC: "Perundungan melalui media digital", OpsiD: "Berbelanja online",
			KunciJawaban: "C",
		})

		log.Println("==> Seeder: Setup KENCANA 3-Tahap Data successfully.")
	}

	// 8. Scholarship Seeder (Robust Upsert)
	scholarships := []models.Beasiswa{
		{
			Nama:              "Beasiswa Bhakti Mahasiswa",
			Penyelenggara:     "Yayasan Bhakti Kencana",
			Kategori:          "Internal",
			Deskripsi:         "Program bantuan pendidikan semesteran bagi mahasiswa aktif yang memiliki semangat belajar tinggi.",
			Persyaratan:       "- Mahasiswa aktif minimal semester 2\n- IPK minimal 3.25\n- Aktif dalam organisasi kemahasiswaan\n- Tidak sedang menerima beasiswa lain",
			NilaiBantuan:      5000000,
			Kuota:             50,
			SisaKuota:         42,
			Deadline:          time.Now().AddDate(0, 1, 0),
			SyaratIPKMin:      3.25,
			IsBerbasisEkonomi: false,
			IsAktif:           true,
		},
		{
			Nama:              "Bantuan Pendidikan Alumni BKU",
			Penyelenggara:     "Ikatan Alumni BKU",
			Kategori:          "Alumni",
			Deskripsi:         "Bantuan khusus untuk penyelesaian tugas akhir (Skripsi) yang didanai oleh jaringan alumni BKU.",
			Persyaratan:       "- Mahasiswa tingkat akhir (Semester 7/8)\n- Melampirkan draf skripsi yang sudah disetujui DPA\n- Rekomendasi dari Kaprodi",
			NilaiBantuan:      3500000,
			Kuota:             20,
			SisaKuota:         15,
			Deadline:          time.Now().AddDate(0, 0, 10),
			SyaratIPKMin:      2.75,
			IsBerbasisEkonomi: true,
			IsAktif:           true,
		},
		{
			Nama:              "Beasiswa Industri Juara (Kimia Farma)",
			Penyelenggara:     "PT Kimia Farma Tbk.",
			Kategori:          "Mitra",
			Deskripsi:         "Program beasiswa prestasi dengan ikatan dinas bagi mahasiswa Farmasi terbaik.",
			Persyaratan:       "- Mahasiswa Prodi Farmasi\n- IPK minimal 3.50\n- Bersedia mengikuti program magang selama 3 bulan",
			NilaiBantuan:      12000000,
			Kuota:             5,
			SisaKuota:         3,
			Deadline:          time.Now().AddDate(0, 0, 5),
			SyaratIPKMin:      3.50,
			IsBerbasisEkonomi: false,
			IsAktif:           true,
		},
	}

	for _, s := range scholarships {
		var existing models.Beasiswa
		db.Where("nama = ?", s.Nama).First(&existing)
		if existing.ID == 0 {
			s.CreatedAt = time.Now()
			db.Create(&s)
		} else {
			// Update specific fields for existing records to sync new structure
			db.Model(&existing).Updates(map[string]interface{}{
				"penyelenggara":       s.Penyelenggara,
				"kategori":            s.Kategori,
				"deskripsi":           s.Deskripsi,
				"persyaratan":         s.Persyaratan,
				"nilai_bantuan":       s.NilaiBantuan,
				"kuota":               s.Kuota,
				"sisa_kuota":          s.SisaKuota,
				"deadline":            s.Deadline,
				"syarat_ipk_min":      s.SyaratIPKMin,
				"is_berbasis_ekonomi": s.IsBerbasisEkonomi,
				"is_aktif":            s.IsAktif,
			})
		}
	}
	log.Println("==> Seeder: Setup Scholarship Data successfully.")

	// 9. Counseling Seeder
	var cCount int64
	db.Model(&models.JadwalKonseling{}).Count(&cCount)
	if cCount == 0 {
		db.Create(&models.JadwalKonseling{
			Tipe:         "Akademik",
			NamaKonselor: "Dr. Siti Aminah, M.Pd",
			Tanggal:      time.Now().AddDate(0, 0, 1),
			JamMulai:     "10:00",
			JamSelesai:   "11:00",
			Kuota:        5,
			SisaKuota:    5,
			Lokasi:       "Gedung Rektorat Lt. 2 - Ruang 201",
			IsAktif:      true,
		})

		db.Create(&models.JadwalKonseling{
			Tipe:         "Personal",
			NamaKonselor: "Budi Santoso, M.Psi, Psikolog",
			Tanggal:      time.Now().AddDate(0, 0, 2),
			JamMulai:     "13:00",
			JamSelesai:   "14:00",
			Kuota:        3,
			SisaKuota:    3,
			Lokasi:       "Pusat Layanan Mahasiswa - Ruang BK",
			IsAktif:      true,
		})

		db.Create(&models.JadwalKonseling{
			Tipe:         "Karir",
			NamaKonselor: "Andri Wijaya, S.T., M.M.",
			Tanggal:      time.Now().AddDate(0, 0, 3),
			JamMulai:     "09:00",
			JamSelesai:   "10:00",
			Kuota:        10,
			SisaKuota:    10,
			Lokasi:       "Career Center BKU - Lt. 1",
			IsAktif:      true,
		})

		log.Println("==> Seeder: Setup Counseling Data successfully.")
	}

	// 10. Health Screening Seeder
	var hCount int64
	db.Model(&models.HasilKesehatan{}).Count(&hCount)
	if hCount == 0 {
		// Mock Admin ID for petugas check
		petugasID := uint(1)

		db.Create(&models.HasilKesehatan{
			StudentID:             1,
			TanggalPeriksa:        time.Now().AddDate(0, -6, 0),
			TinggiBadan:           170,
			BeratBadan:            65,
			BMI:                   22.5,
			TekananDarahSistolik:  118,
			TekananDarahDiastolik: 78,
			GolonganDarah:         "O",
			CatatanMedis:          "Kondisi fisik prima, siap mengikuti rangkaian PKKMB.",
			StatusKesehatan:       "sehat",
			PetugasID:             &petugasID,
			DiperiksaOleh:         "dr. H. Ahmad Fauzi",
			Sumber:                "kencana_screening",
			CreatedAt:             time.Now().AddDate(0, -6, 0),
		})

		db.Create(&models.HasilKesehatan{
			StudentID:             1,
			TanggalPeriksa:        time.Now().AddDate(0, -2, 0),
			TinggiBadan:           170,
			BeratBadan:            75,
			BMI:                   26.0,
			TekananDarahSistolik:  135,
			TekananDarahDiastolik: 88,
			GolonganDarah:         "O",
			Keluhan:               "Sering merasa cepat lelah saat beraktivitas.",
			StatusKesehatan:       "perlu_perhatian",
			Sumber:                "mandiri",
			CreatedAt:             time.Now().AddDate(0, -2, 0),
		})

		db.Create(&models.HasilKesehatan{
			StudentID:             1,
			TanggalPeriksa:        time.Now().AddDate(0, 0, -5),
			TinggiBadan:           171,
			BeratBadan:            72,
			BMI:                   24.6,
			TekananDarahSistolik:  122,
			TekananDarahDiastolik: 81,
			GolonganDarah:         "O",
			CatatanMedis:          "Kondisi stabil, tekanan darah mulai terkontrol.",
			StatusKesehatan:       "sehat",
			PetugasID:             &petugasID,
			DiperiksaOleh:         "Klinik Pratama BKU",
			Sumber:                "klinik_kampus",
			CreatedAt:             time.Now().AddDate(0, 0, -5),
		})

		log.Println("==> Seeder: Setup Health Data successfully.")
	}

	// 11. Student Voice Seeder
	var vCount int64
	db.Model(&models.TiketAspirasi{}).Count(&vCount)
	if vCount == 0 {
		now := time.Now()
		
		// Tiket 1: Selesai
		t1 := models.TiketAspirasi{
			NomorTiket:   "SV-20260401-0001",
			StudentID:    1,
			FakultasID:   1, // Farmasi
			Kategori:     "Fasilitas",
			Judul:        "AC Mati di Ruang 301",
			Isi:          "Mohon bantuan perbaikan AC di ruang 301 Gedung C, kondisinya mati total sehingga kuliah terasa sangat panas.",
			Status:       "selesai",
			LevelSaatIni: "selesai",
			IsAnonim:     false,
			CreatedAt:    now.AddDate(0, 0, -5),
		}
		db.Create(&t1)

		db.Create(&models.TiketTimelineEvent{
			TiketID:    t1.ID,
			TipeEvent:  "dikirim",
			Level:      "sistem",
			IsiRespons: "Aspirasi berhasil dikirim ke Admin Fakultas Farmasi.",
			CreatedAt:  t1.CreatedAt,
		})
		db.Create(&models.TiketTimelineEvent{
			TiketID:    t1.ID,
			TipeEvent:  "respons_fakultas",
			Level:      "fakultas",
			IsiRespons: "Terima kasih atas laporannya. Tim sarpras sedang menjadwalkan pengecekan.",
			CreatedAt:  t1.CreatedAt.Add(time.Hour * 2),
		})
		db.Create(&models.TiketTimelineEvent{
			TiketID:    t1.ID,
			TipeEvent:  "selesai",
			Level:      "fakultas",
			IsiRespons: "AC sudah diperbaiki oleh tim sarpras pada tanggal 2 April 2026. Silakan cek kembali.",
			CreatedAt:  t1.CreatedAt.Add(time.Hour * 24),
		})

		// Tiket 2: Diproses di Fakultas
		t2 := models.TiketAspirasi{
			NomorTiket:   "SV-20260403-0001",
			StudentID:    1,
			FakultasID:   1,
			Kategori:     "Akademik",
			Judul:        "Keterlambatan Input Nilai Farmakologi",
			Isi:          "Sampai saat ini nilai mata kuliah Farmakologi belum muncul di KHS, mohon bantuan untuk kroscek ke dosen pengampu.",
			Status:       "diproses",
			LevelSaatIni: "fakultas",
			IsAnonim:     true,
			CreatedAt:    now.AddDate(0, 0, -2),
		}
		db.Create(&t2)

		db.Create(&models.TiketTimelineEvent{
			TiketID:    t2.ID,
			TipeEvent:  "dikirim",
			Level:      "sistem",
			IsiRespons: "Aspirasi berhasil dikirim secara anonim ke Admin Fakultas Farmasi.",
			CreatedAt:  t2.CreatedAt,
		})
		db.Create(&models.TiketTimelineEvent{
			TiketID:    t2.ID,
			TipeEvent:  "diterima_fakultas",
			Level:      "fakultas",
			IsiRespons: "Aspirasi telah diterima dan sedang divalidasi oleh bagian akademik fakultas.",
			CreatedAt:  t2.CreatedAt.Add(time.Hour * 4),
		})

		log.Println("==> Seeder: Setup Student Voice Data successfully.")
	}

	// 12. Organisasi Seeder
	var orgCount int64
	db.Model(&models.RiwayatOrganisasi{}).Count(&orgCount)
	if orgCount == 0 {
		selesai2024 := 2024
		selesai2025 := 2025
		db.Create(&models.RiwayatOrganisasi{
			StudentID:         1,
			NamaOrganisasi:    "UKM Korps Sukarela PMI",
			Tipe:              "UKM",
			Jabatan:           "Anggota Divisi Medis",
			PeriodeMulai:      2023,
			PeriodeSelesai:    &selesai2024,
			DeskripsiKegiatan: "Aktif dalam kegiatan donor darah rutin dan pelatihan pertolongan pertama di area kampus BKU.",
			StatusVerifikasi:  "Diverifikasi",
			CreatedAt:         time.Now(),
		})

		db.Create(&models.RiwayatOrganisasi{
			StudentID:         1,
			NamaOrganisasi:    "Himpunan Mahasiswa Farmasi BKU",
			Tipe:              "Himpunan",
			Jabatan:           "Sekretaris Umum",
			PeriodeMulai:      2024,
			PeriodeSelesai:    &selesai2025,
			DeskripsiKegiatan: "Bertanggung jawab atas administrasi surat menyurat dan dokumentasi kegiatan himpunan selama satu periode kepengurusan.",
			StatusVerifikasi:  "Menunggu",
			CreatedAt:         time.Now(),
		})

		log.Println("==> Seeder: Setup Organisasi Data successfully.")
	}

	// 13. Dashboard & Announcements Seeder
	var pCount int64
	db.Model(&models.Pengumuman{}).Count(&pCount)
	if pCount <= 3 { // If only dummy/old ones exist
		publishedAt := time.Now()
		db.Create(&models.Pengumuman{
			Judul:       "Pendaftaran Beasiswa KIP-K 2025",
			IsiSingkat:  "Pendaftaran beasiswa KIP-K dibuka hingga 30 April 2025. Segera lengkapi berkasmu!",
			IsiLengkap:  "Pengumuman lengkap pendaftaran KIP-K...",
			Kategori:    "Kemahasiswaan",
			IsPinned:    true,
			IsAktif:     true,
			PublishedAt: &publishedAt,
			CreatedAt:   time.Now(),
		})

		db.Create(&models.Pengumuman{
			Judul:       "Informasi Libur Hari Raya",
			IsiSingkat:  "Kegiatan akademik diliburkan mulai tanggal 10 April s.d 15 April 2025.",
			IsiLengkap:  "Detail pengumuman libur...",
			Kategori:    "Umum",
			IsPinned:    false,
			IsAktif:     true,
			PublishedAt: &publishedAt,
			CreatedAt:   time.Now(),
		})
	}

	var kegCount int64
	db.Model(&models.KegiatanKampus{}).Count(&kegCount)
	if kegCount == 0 {
		startDate := time.Now().AddDate(0, 0, 5) // 5 days from now
		endDate := startDate.Add(2 * time.Hour)
		db.Create(&models.KegiatanKampus{
			Judul:        "Webinar Persiapan Karir di Industri Farmasi",
			Deskripsi:    "Webinar bersama praktisi dari PT Bio Farma.",
			TanggalMulai: startDate,
			TanggalSelesai: &endDate,
			Kategori:     "kampus",
			IsAktif:      true,
		})

		kencanaDate := time.Now().AddDate(0, 0, 8)
		db.Create(&models.KegiatanKampus{
			Judul:        "Pelatihan Sistem Akademik (KENCANA)",
			Deskripsi:    "Sesi offline pelatihan penggunaan portal.",
			TanggalMulai: kencanaDate,
			Kategori:     "kencana",
			IsAktif:      true,
		})
	}

	var logCount int64
	db.Model(&models.AktivitasLog{}).Count(&logCount)
	if logCount == 0 {
		db.Create(&models.AktivitasLog{
			StudentID: 1,
			Tipe:      "achievement",
			Deskripsi: "Prestasi 'Juara 2 Lomba Karya Tulis' berhasil diverifikasi",
			Link:      "/student/achievement",
			CreatedAt: time.Now().Add(-2 * time.Hour),
		})
		db.Create(&models.AktivitasLog{
			StudentID: 1,
			Tipe:      "voice",
			Deskripsi: "Tiket aspirasi #SV-20260401-0001 telah direspons oleh admin",
			Link:      "/student/voice",
			CreatedAt: time.Now().AddDate(0, 0, -1),
		})
		db.Create(&models.AktivitasLog{
			StudentID: 1,
			Tipe:      "beasiswa",
			Deskripsi: "Pengajuan beasiswa 'Beasiswa Industri Farmasi Juara' berhasil dikirim",
			Link:      "/student/scholarship",
			CreatedAt: time.Now().AddDate(0, 0, -3),
		})
	}

	// 14. Default Notification Preferences for Student 1
	var prefCount int64
	db.Model(&models.NotificationPreference{}).Where("student_id = ?", 1).Count(&prefCount)
	if prefCount == 0 {
		db.Create(&models.NotificationPreference{
			StudentID: 1,
		})
	}

	// 15. Notification Seeder
	var notifCount int64
	db.Model(&models.Notification{}).Count(&notifCount)
	if notifCount == 0 {
		db.Create(&models.Notification{
			StudentID: 1,
			Type:      "achievement",
			Title:     "Prestasi Diverifikasi",
			Content:   "Pencapaian kamu 'Juara 1 Lomba Koding' telah diverifikasi oleh admin. Selamat!",
			Link:      "/student/achievement",
			IsRead:    false,
		})
		db.Create(&models.Notification{
			StudentID: 1,
			Type:      "konseling",
			Title:     "Konseling Dikonfirmasi",
			Content:   "Jadwal konseling kamu besok pukul 10:00 telah dikonfirmasi oleh konselor.",
			Link:      "/student/counseling",
			IsRead:    false,
		})
		db.Create(&models.Notification{
			StudentID: 1,
			Type:      "sistem",
			Title:     "Selamat Datang!",
			Content:   "Selamat datang di portal BKU Student Hub. Lengkapi profilmu sekarang.",
			Link:      "/student/profil",
			IsRead:    true,
		})
	}
}

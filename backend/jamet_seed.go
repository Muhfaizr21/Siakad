package main

import (
	"fmt"
	"log"
	"time"

	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// 1. Load Environment
	if err := godotenv.Load(); err != nil {
		log.Println("Peringatan: .env tidak ditemukan, menggunakan environment OS")
	}

	// 2. Connect DB
	config.ConnectDB()
	db := config.DB

	fmt.Println("🚀 [JAMET-SEEDER] Memulai proses suntik data masal (Multi-Fakultas)...")

	// Prefetches
	passwordHash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	passStr := string(passwordHash)

	// --- 1. SEED FAKULTAS ---
	faculties := []models.Fakultas{
		{Nama: "Fakultas Hukum", Kode: "FH", Dekan: "Dr. Justitia, S.H., M.H."},
		{Nama: "Fakultas Teknik", Kode: "FT", Dekan: "Ir. Mechanic, M.T."},
		{Nama: "Fakultas Ekonomi", Kode: "FE", Dekan: "Prof. Money, Ph.D."},
		{Nama: "School of Computing", Kode: "SOC", Dekan: "Dr. Binary, M.Kom."},
	}
	for _, f := range faculties {
		db.Where(models.Fakultas{Kode: f.Kode}).FirstOrCreate(&f)
	}

	var fh, ft, fe, soc models.Fakultas
	db.Where("kode = ?", "FH").First(&fh)
	db.Where("kode = ?", "FT").First(&ft)
	db.Where("kode = ?", "FE").First(&fe)
	db.Where("kode = ?", "SOC").First(&soc)

	// --- 2. SEED PROGRAM STUDI ---
	majorSeeds := []models.ProgramStudi{
		{Nama: "Ilmu Hukum", Kode: "LAW01", FakultasID: fh.ID, Jenjang: "S1"},
		{Nama: "Teknik Informatika", Kode: "INF01", FakultasID: soc.ID, Jenjang: "S1"},
		{Nama: "Teknik Sipil", Kode: "CIV01", FakultasID: ft.ID, Jenjang: "S1"},
		{Nama: "Manajemen", Kode: "MAN01", FakultasID: fe.ID, Jenjang: "S1"},
	}
	for _, m := range majorSeeds {
		db.Where(models.ProgramStudi{Kode: m.Kode}).FirstOrCreate(&m)
	}

	var ifMajor models.ProgramStudi
	db.Where("kode = ?", "INF01").First(&ifMajor)
	var lawMajor models.ProgramStudi
	db.Where("kode = ?", "LAW01").First(&lawMajor)

	// --- 3. SEED TAHUN AKADEMIK ---
	periods := []models.AcademicPeriod{
		{Name: "Ganjil 2024/2025", Semester: "Ganjil", AcademicYear: "2024/2025", IsActive: false, IsKRSOpen: false},
		{Name: "Genap 2024/2025", Semester: "Genap", AcademicYear: "2024/2025", IsActive: true, IsKRSOpen: true},
	}
	for _, p := range periods {
		db.Where(models.AcademicPeriod{Name: p.Name}).FirstOrCreate(&p)
	}

	// --- 4. SEED USERS & LECTURERS ---
	lecturerData := []struct {
		Name    string
		NIDN    string
		Email   string
		Fac     uint
		Role    string
	}{
		{"Ahmad Hukum", "NIDNFH01", "ahmad.hukum@bku.ac.id", fh.ID, "dosen"},
		{"Budi Teknik", "NIDNFT01", "budi.teknik@bku.ac.id", ft.ID, "dosen"},
		{"Siti Ekonomi", "NIDNFE01", "siti.ekonomi@bku.ac.id", fe.ID, "dosen"},
		{"Faiz Komputer", "NIDNSOC01", "faiz.soc@bku.ac.id", soc.ID, "dosen"},
		{"Admin Hukum", "ADMINFH01", "admin.fh@bku.ac.id", fh.ID, "faculty_admin"},
		{"Admin Teknik", "ADMINFT01", "admin.ft@bku.ac.id", ft.ID, "faculty_admin"},
		{"Admin Ekonomi", "ADMINFE01", "admin.fe@bku.ac.id", fe.ID, "faculty_admin"},
		{"Admin SOC", "ADMINSOC01", "admin.soc@bku.ac.id", soc.ID, "faculty_admin"},
		{"Super Admin", "ADMINSUPER", "superadmin@bku.ac.id", soc.ID, "super_admin"},
	}

	for _, ld := range lecturerData {
		var u models.User
		if err := db.Where("email = ?", ld.Email).First(&u).Error; err != nil {
			u = models.User{Email: ld.Email, Password: passStr, Role: ld.Role, FakultasID: &ld.Fac}
			db.Create(&u)
		}
		if ld.Role == "dosen" || ld.Role == "faculty_admin" {
			var d models.Dosen
			if err := db.Where("n_id_n = ?", ld.NIDN).First(&d).Error; err != nil {
				d = models.Dosen{Nama: ld.Name, NIDN: ld.NIDN, PenggunaID: u.ID, FakultasID: ld.Fac, Email: ld.Email}
				db.Create(&d)
			}
		}
	}

	// --- 5. SEED STUDENTS ---
	studentData := []struct {
		Name string
		NIM  string
		Email string
		Fac   uint
	}{
		{"Mhs Hukum 1", "HUK001", "hukum1@bku.ac.id", fh.ID},
		{"Mhs Hukum 2", "HUK002", "hukum2@bku.ac.id", fh.ID},
		{"Mhs Teknik 1", "TEK001", "teknik1@bku.ac.id", ft.ID},
		{"Mhs Ekonomi 1", "EKO001", "ekonomi1@bku.ac.id", fe.ID},
		{"Mhs Komputer 1", "BKU001", "student@bku.ac.id", soc.ID},
	}

	for _, sd := range studentData {
		var u models.User
		if err := db.Where("email = ?", sd.Email).First(&u).Error; err != nil {
			u = models.User{Email: sd.Email, Password: passStr, Role: "student", FakultasID: &sd.Fac}
			db.Create(&u)
		}
		var s models.Mahasiswa
		if err := db.Where("nim = ?", sd.NIM).First(&s).Error; err != nil {
			s = models.Mahasiswa{
				Nama: sd.Name, NIM: sd.NIM, PenggunaID: u.ID, FakultasID: sd.Fac, 
				SemesterSekarang: 2, StatusAkun: "Aktif", IPK: 3.5, 
				EmailKampus: sd.Email, NoHP: "08123456789",
			}
			db.Create(&s)
		}

		// --- 6. SEED KESEHATAN (For EACH Student) ---
		healthSeeds := []models.Kesehatan{
			{MahasiswaID: s.ID, Tanggal: time.Now().AddDate(0, 0, -5), JenisPemeriksaan: "Screening Tahunan", Hasil: "Sehat", Sistole: 115, Diastole: 75, GulaDarah: 90, StatusKesehatan: "prima", GolonganDarah: "O", TinggiBadan: 170, BeratBadan: 65, Catatan: "Kesehatan secara umum sangat baik."},
			{MahasiswaID: s.ID, Tanggal: time.Now().AddDate(0, -6, 0), JenisPemeriksaan: "Cek Rutin", Hasil: "Stabil", Sistole: 125, Diastole: 85, GulaDarah: 110, StatusKesehatan: "stabil", GolonganDarah: "O", TinggiBadan: 170, BeratBadan: 64},
		}
		for _, h := range healthSeeds {
			db.Where(models.Kesehatan{MahasiswaID: h.MahasiswaID, JenisPemeriksaan: h.JenisPemeriksaan}).FirstOrCreate(&h)
		}
	}

	fmt.Println("🏁 [JAMET-SEEDER] DATA MULTI-FAKULTAS (TERMASUK KESEHATAN) BERHASIL DISUNTIK SEMUA!")
}

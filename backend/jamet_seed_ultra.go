package main

import (
	"fmt"
	"log"
	"math/rand"
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Peringatan: Tidak dapat memuat file .env")
	}

	config.ConnectDB()
	db := config.DB

	fmt.Println("🚀 [ULTRA-SEEDER] Starting massive seed process (10,000 Students + All Features)...")

	// 1. Roles & Initial Users
	seedRolesAndAdmins(db)

	// 2. Faculties & Programs
	faculties, prodis := seedFacultiesAndProdis(db)

	// 3. Dosen (Lecturers)
	dosens := seedDosens(db, faculties, prodis)

	// 4. THE BIG ONE: 10,000 Students
	students := seedStudents(db, 10000, faculties, prodis, dosens)

	// 5. Ormawa (Organizations)
	ormawas := seedOrmawas(db)

	// 6. Connect Students to Ormawa
	seedOrmawaMembers(db, students, ormawas)

	// 7. Features: Proposals, Events, LPJ
	seedProposalsAndEvents(db, ormawas, students, faculties)

	// 8. Features: Scholarships & Achievements
	seedScholarshipsAndAchievements(db, students)

	// 9. Features: Health & Counseling
	seedHealthAndCounseling(db, students, dosens)

	// 10. Features: Aspirations & Notifications
	seedAspirationsAndNotifs(db, students)

	// 11. Features: PKKMB (Kencana)
	seedPKKMB(db, students)

	// 12. Features: News (Berita)
	seedNews(db)

	fmt.Println("\n🏁 [ULTRA-SEEDER] SUCCESS! 10,000 students and all features seeded.")
}

func seedRolesAndAdmins(db *gorm.DB) {
	fmt.Println("📍 Seeding Roles & Admins...")
	hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	
	admins := []models.User{
		{Email: "superadmin@siakad.ac.id", Password: string(hash), Role: "super_admin"},
		{Email: "ormawa.admin@siakad.ac.id", Password: string(hash), Role: "ormawa_admin"},
	}

	for _, admin := range admins {
		db.Where("email = ?", admin.Email).FirstOrCreate(&admin)
	}
}

func seedFacultiesAndProdis(db *gorm.DB) ([]models.Fakultas, []models.ProgramStudi) {
	fmt.Println("📍 Seeding Faculties & Programs...")
	
	faks := []models.Fakultas{
		{Nama: "Fakultas Teknik", Kode: "FT", Dekan: "Prof. Dr. Ir. H. Sudirman, M.T."},
		{Nama: "Fakultas Ekonomi & Bisnis", Kode: "FEB", Dekan: "Dr. Sri Mulyani, S.E., M.Ak."},
		{Nama: "Fakultas Kedokteran", Kode: "FK", Dekan: "dr. Terawan, Sp.Rad."},
		{Nama: "Fakultas Hukum", Kode: "FH", Dekan: "Prof. Mahfud MD, S.H., S.U."},
		{Nama: "Fakultas MIPA", Kode: "FMIPA", Dekan: "Prof. Yohanes Surya, Ph.D."},
	}

	for i := range faks {
		db.Where("kode = ?", faks[i].Kode).FirstOrCreate(&faks[i])
	}

	allProdis := []models.ProgramStudi{}
	prodiData := map[string][]string{
		"FT":    {"Teknik Informatika", "Sistem Informasi", "Teknik Sipil", "Teknik Elektro", "Teknik Mesin"},
		"FEB":   {"Akuntansi", "Manajemen", "Ekonomi Pembangunan"},
		"FK":    {"Pendidikan Dokter", "Farmasi", "Keperawatan"},
		"FH":    {"Ilmu Hukum"},
		"FMIPA": {"Matematika", "Fisika", "Kimia", "Biologi"},
	}

	for _, fak := range faks {
		names := prodiData[fak.Kode]
		for i, name := range names {
			p := models.ProgramStudi{
				Nama:       name,
				Kode:       fmt.Sprintf("%s-%d", fak.Kode, i+1),
				FakultasID: fak.ID,
				Jenjang:    "S1",
				Akreditasi: "A",
			}
			db.Where("kode = ?", p.Kode).FirstOrCreate(&p)
			allProdis = append(allProdis, p)
		}
	}

	return faks, allProdis
}

func seedDosens(db *gorm.DB, faks []models.Fakultas, prodis []models.ProgramStudi) []models.Dosen {
	fmt.Println("📍 Seeding Dosens...")
	dosens := []models.Dosen{}
	hash, _ := bcrypt.GenerateFromPassword([]byte("dosen123"), bcrypt.DefaultCost)

	firstNames := []string{"Bambang", "Siti", "Agus", "Dewi", "Eko", "Indah", "Budi", "Lestari", "Hadi", "Ratna"}
	lastNames := []string{"Wijaya", "Saputra", "Utami", "Hidayat", "Kusuma", "Santoso", "Pratiwi", "Mulyono", "Sari", "Gunawan"}

	for i := 0; i < 50; i++ {
		name := fmt.Sprintf("%s %s, Ph.D.", firstNames[rand.Intn(len(firstNames))], lastNames[rand.Intn(len(lastNames))])
		email := strings.ToLower(fmt.Sprintf("dosen%d@siakad.ac.id", i+1))
		
		user := models.User{Email: email, Password: string(hash), Role: "dosen"}
		db.Where("email = ?", email).FirstOrCreate(&user)

		p := prodis[rand.Intn(len(prodis))]
		d := models.Dosen{
			Nama:           name,
			NIDN:           fmt.Sprintf("040%07d", i+1),
			PenggunaID:     user.ID,
			FakultasID:     p.FakultasID,
			ProgramStudiID: p.ID,
			Jabatan:        "Lektor",
			Email:          email,
		}
		db.Where("n_id_n = ?", d.NIDN).FirstOrCreate(&d)
		dosens = append(dosens, d)
	}
	return dosens
}

func seedStudents(db *gorm.DB, count int, faks []models.Fakultas, prodis []models.ProgramStudi, dosens []models.Dosen) []models.Mahasiswa {
	fmt.Printf("📍 Seeding %d Students (this may take a minute)...\n", count)
	
	firstNames := []string{"Aditya", "Bahrul", "Chandra", "Dimas", "Erlangga", "Fajar", "Gilang", "Hendra", "Iqbal", "Joko"}
	lastNames := []string{"Maulana", "Rahman", "Setiawan", "Pratama", "Nugroho", "Ramadhan", "Hidayat", "Putra", "Kurniawan", "Sanjaya"}
	cities := []string{"Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Medan", "Makassar", "Semarang", "Malang"}

	hash, _ := bcrypt.GenerateFromPassword([]byte("student123"), bcrypt.DefaultCost)
	
	startTime := time.Now()
	allStudents := []models.Mahasiswa{}

	// We'll use 1000 per batch for efficiency
	batchSize := 1000
	for i := 0; i < count; i += batchSize {
		currentBatchLimit := i + batchSize
		if currentBatchLimit > count {
			currentBatchLimit = count
		}

		userBatch := []models.User{}
		for j := i; j < currentBatchLimit; j++ {
			email := fmt.Sprintf("student%d@siakad.ac.id", j+1)
			userBatch = append(userBatch, models.User{
				Email:    email,
				Password: string(hash),
				Role:     "student",
			})
		}
		db.Create(&userBatch)

		studentBatch := []models.Mahasiswa{}
		for j, user := range userBatch {
			idx := i + j
			name := fmt.Sprintf("%s %s", firstNames[rand.Intn(len(firstNames))], lastNames[rand.Intn(len(lastNames))])
			prodi := prodis[rand.Intn(len(prodis))]
			dpa := dosens[rand.Intn(len(dosens))]
			
			nim := fmt.Sprintf("2024%06d", idx+1)
			
			s := models.Mahasiswa{
				PenggunaID:       user.ID,
				NIM:              nim,
				Nama:             name,
				FakultasID:       prodi.FakultasID,
				ProgramStudiID:   prodi.ID,
				DosenPAID:        &dpa.ID,
				SemesterSekarang: rand.Intn(8) + 1,
				StatusAkun:       "Aktif",
				StatusAkademik:   "Aktif",
				IPK:              2.5 + rand.Float64()*1.5,
				TotalSKS:         rand.Intn(144),
				TahunMasuk:       2024 - (rand.Intn(4)),
				Kota:             cities[rand.Intn(len(cities))],
				JenisKelamin:     []string{"Laki-laki", "Perempuan"}[rand.Intn(2)],
			}
			studentBatch = append(studentBatch, s)
		}
		db.Create(&studentBatch)
		
		fmt.Printf("   - Progress: %d/%d students created...\n", currentBatchLimit, count)
		allStudents = append(allStudents, studentBatch...)
	}

	fmt.Printf("✅ Finished seeding students in %v\n", time.Since(startTime))
	return allStudents
}

func seedOrmawas(db *gorm.DB) []models.Ormawa {
	fmt.Println("📍 Seeding Ormawas...")
	ormawas := []models.Ormawa{
		{Nama: "BEM Universitas", Singkatan: "BEM-U", Kategori: "BEM"},
		{Nama: "Himpunan Mahasiswa Informatika", Singkatan: "HMIF", Kategori: "Himpunan"},
		{Nama: "UKM Olahraga", Singkatan: "UKM-O", Kategori: "UKM"},
		{Nama: "Mapala", Singkatan: "MAPALA", Kategori: "UKM"},
		{Nama: "UKM Musik", Singkatan: "MUSIK", Kategori: "UKM"},
	}

	for i := range ormawas {
		db.Where("singkatan = ?", ormawas[i].Singkatan).FirstOrCreate(&ormawas[i])
	}
	return ormawas
}

func seedOrmawaMembers(db *gorm.DB, students []models.Mahasiswa, ormawas []models.Ormawa) {
	fmt.Println("📍 Seeding Ormawa Members...")
	members := []models.OrmawaAnggota{}
	for _, ormawa := range ormawas {
		// Pick 50 random students for each ormawa
		for i := 0; i < 50; i++ {
			s := students[rand.Intn(len(students))]
			members = append(members, models.OrmawaAnggota{
				OrmawaID:    ormawa.ID,
				MahasiswaID: s.ID,
				Role:       "Anggota",
				Status:     "Aktif",
				JoinedAt:   time.Now().AddDate(0, -rand.Intn(12), 0),
			})
		}
	}
	db.CreateInBatches(members, 500)
}

func seedProposalsAndEvents(db *gorm.DB, ormawas []models.Ormawa, students []models.Mahasiswa, faks []models.Fakultas) {
	fmt.Println("📍 Seeding Proposals & Events...")
	for _, ormawa := range ormawas {
		p := models.Proposal{
			OrmawaID:        ormawa.ID,
			MahasiswaID:     students[rand.Intn(len(students))].ID,
			FakultasID:      faks[0].ID,
			Judul:           "Event Anniversary " + ormawa.Singkatan,
			TanggalKegiatan: time.Now().AddDate(0, 1, 0),
			Anggaran:        5000000 + rand.Float64()*10000000,
			Status:          "approved",
		}
		db.Create(&p)

		// Create Event from proposal
		k := models.OrmawaKegiatan{
			OrmawaID:       ormawa.ID,
			Judul:          p.Judul,
			Deskripsi:      "Rayakan hari jadi kami!",
			TanggalMulai:   p.TanggalKegiatan,
			TanggalSelesai: p.TanggalKegiatan.Add(4 * time.Hour),
			Lokasi:         "Aula Utama",
			Status:         "terjadwal",
		}
		db.Create(&k)
	}
}

func seedScholarshipsAndAchievements(db *gorm.DB, students []models.Mahasiswa) {
	fmt.Println("📍 Seeding Scholarships & Achievements...")
	beasiswas := []models.Beasiswa{
		{Nama: "Beasiswa Unggulan 2024", Penyelenggara: "Kemendikbud", Deskripsi: "Untuk mahasiswa berprestasi", IPKMin: 3.5, NilaiBantuan: 10000000},
		{Nama: "Beasiswa PPA", Penyelenggara: "Universitas", Deskripsi: "Bantuan peningkatan akademik", IPKMin: 3.0, NilaiBantuan: 5000000},
	}
	for i := range beasiswas {
		db.Where("nama = ?", beasiswas[i].Nama).FirstOrCreate(&beasiswas[i])
	}

	// Some students apply
	apps := []models.BeasiswaPendaftaran{}
	for i := 0; i < 200; i++ {
		s := students[rand.Intn(len(students))]
		b := beasiswas[rand.Intn(len(beasiswas))]
		apps = append(apps, models.BeasiswaPendaftaran{
			MahasiswaID: s.ID,
			BeasiswaID:  b.ID,
			Status:      "Pending",
			Catatan:     "Mohon dipertimbangkan",
		})
	}
	db.CreateInBatches(apps, 500)

	// Achievements
	achievements := []models.Prestasi{}
	for i := 0; i < 300; i++ {
		s := students[rand.Intn(len(students))]
		achievements = append(achievements, models.Prestasi{
			MahasiswaID:  s.ID,
			NamaKegiatan: "Lomba " + []string{"Coding", "Debat", "Futsal", "Esai"}[rand.Intn(4)],
			Kategori:     "Akademik",
			Tingkat:      "Nasional",
			Peringkat:    "Juara 1",
			Status:       "verified",
			Poin:         50,
		})
	}
	db.CreateInBatches(achievements, 500)
}

func seedHealthAndCounseling(db *gorm.DB, students []models.Mahasiswa, dosens []models.Dosen) {
	fmt.Println("📍 Seeding Health & Counseling...")
	healths := []models.Kesehatan{}
	for i := 0; i < 500; i++ {
		s := students[rand.Intn(len(students))]
		healths = append(healths, models.Kesehatan{
			MahasiswaID:      s.ID,
			Tanggal:          time.Now(),
			JenisPemeriksaan: "Screening Rutin",
			Hasil:            "Sehat",
			StatusKesehatan:  "prima",
			GolonganDarah:    "O",
		})
	}
	db.CreateInBatches(healths, 500)

	// Counseling
	counselings := []models.Konseling{}
	for i := 0; i < 100; i++ {
		s := students[rand.Intn(len(students))]
		d := dosens[rand.Intn(len(dosens))]
		counselings = append(counselings, models.Konseling{
			MahasiswaID: s.ID,
			DosenID:     d.ID,
			Tanggal:     time.Now().AddDate(0, 0, rand.Intn(30)),
			Topik:       "Bimbingan KRS",
			Status:      "Selesai",
		})
	}
	db.CreateInBatches(counselings, 500)
}

func seedAspirationsAndNotifs(db *gorm.DB, students []models.Mahasiswa) {
	fmt.Println("📍 Seeding Aspirations & Notifs...")
	aspirasis := []models.Aspirasi{}
	for i := 0; i < 200; i++ {
		s := students[rand.Intn(len(students))]
		aspirasis = append(aspirasis, models.Aspirasi{
			MahasiswaID: s.ID,
			Judul:       "Perbaikan Fasilitas Kamar Mandi",
			Isi:         "Kamar mandi gedung B rusak.",
			Kategori:    "Fasilitas",
			Tujuan:      "Sarpras",
			Status:      "Pending",
		})
	}
	db.CreateInBatches(aspirasis, 500)

	// Notifications
	notifs := []models.Notifikasi{}
	for i := 0; i < 500; i++ {
		s := students[rand.Intn(len(students))]
		notifs = append(notifs, models.Notifikasi{
			UserID:    s.PenggunaID,
			Judul:     "Pengumuman Baru",
			Deskripsi: "Ada pembaruan jadwal kuliah.",
			Tipe:      "info",
			IsRead:    false,
		})
	}
	db.CreateInBatches(notifs, 500)
}

func seedPKKMB(db *gorm.DB, students []models.Mahasiswa) {
	fmt.Println("📍 Seeding PKKMB (Kencana)...")
	tahaps := []models.PkkmbTahap{
		{Label: "Pendaftaran", Status: "selesai", Order: 1},
		{Label: "Materi Umum", Status: "berlangsung", Order: 2},
		{Label: "Ujian Akhir", Status: "akan_datang", Order: 3},
	}
	for i := range tahaps {
		db.Where("label = ?", tahaps[i].Label).FirstOrCreate(&tahaps[i])
	}

	for _, t := range tahaps {
		m := models.PkkmbMateri{
			TahapID:   t.ID,
			Judul:     "Visi Misi Kampus",
			Tipe:      "VIDEO",
			FileURL:   "https://youtube.com/watch?v=demo",
			Deskripsi: "Wajib tonton",
		}
		db.Create(&m)
		
		q := models.PkkmbQuiz{
			MateriID:  m.ID,
			Judul:     "Kuis Wawasan Kebangsaan",
			Deskripsi: "Uji pemahamanmu",
			Durasi:    15,
		}
		db.Create(&q)
	}

	// Student Progress
	progress := []models.PkkmbProgress{}
	for i := 0; i < 1000; i++ {
		s := students[rand.Intn(len(students))]
		progress = append(progress, models.PkkmbProgress{
			MahasiswaID: s.ID,
			KegiatanID:  1,
			Status:      "Selesai",
		})
	}
	db.CreateInBatches(progress, 500)
}

func seedNews(db *gorm.DB) {
	fmt.Println("📍 Seeding News...")
	var admin models.User
	db.Where("role = ?", "super_admin").First(&admin)

	berita := []models.Berita{
		{Judul: "Juara Umum Gemastik 2024", Isi: "Universitas kita menang lagi!", Status: "published", TanggalPublish: time.Now(), PenulisID: admin.ID},
		{Judul: "Kunjungan Industri ke Google Indonesia", Isi: "Mahasiswa Informatika berkunjung ke Google.", Status: "published", TanggalPublish: time.Now(), PenulisID: admin.ID},
	}
	for i := range berita {
		db.Where("judul = ?", berita[i].Judul).FirstOrCreate(&berita[i])
	}
}

//go:build ignore

package main

import (
	"fmt"
	"math/rand"
	"time"

	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/brianvoe/gofakeit/v6"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Try loading from backend root if run from seeder directory, or vice versa
	err := godotenv.Load("../.env")
	if err != nil {
		godotenv.Load(".env")
	}
	config.ConnectDB()

	gofakeit.Seed(0)
	rand.Seed(time.Now().UnixNano())

	// 1. Create or ensure Fakultas & Prodi exist
	var fakultasList []models.Fakultas
	config.DB.Find(&fakultasList)
	if len(fakultasList) == 0 {
		fakultasList = []models.Fakultas{
			{Nama: "Fakultas Teknik", Kode: "FT", Dekan: "Prof. Dr. Teknik", Email: "ft@bku.ac.id", NoHP: "08120000001"},
			{Nama: "Fakultas Bisnis", Kode: "FB", Dekan: "Prof. Dr. Bisnis", Email: "fb@bku.ac.id", NoHP: "08120000002"},
		}
		config.DB.Create(&fakultasList)
	}

	var prodiList []models.ProgramStudi
	config.DB.Find(&prodiList)
	if len(prodiList) == 0 {
		prodiList = []models.ProgramStudi{
			{FakultasID: fakultasList[0].ID, Nama: "Teknik Informatika", Kode: "TIF", Jenjang: "S1", Akreditasi: "A", Kapasitas: 500, KepalaProdi: "Dr. TIF"},
			{FakultasID: fakultasList[0].ID, Nama: "Sistem Informasi", Kode: "SI", Jenjang: "S1", Akreditasi: "A", Kapasitas: 500, KepalaProdi: "Dr. SI"},
			{FakultasID: fakultasList[1].ID, Nama: "Manajemen", Kode: "MNJ", Jenjang: "S1", Akreditasi: "A", Kapasitas: 500, KepalaProdi: "Dr. MNJ"},
		}
		config.DB.Create(&prodiList)
	}

	// 2. Generate generic password hash (12345678)
	hash, _ := bcrypt.GenerateFromPassword([]byte("12345678"), bcrypt.DefaultCost)
	hashedPassword := string(hash)

	// 3. Generate 1000 Mahasiswa if none exist
	var mahasiswas []models.Mahasiswa
	config.DB.Find(&mahasiswas)
	if len(mahasiswas) == 0 {
		totalMahasiswa := 1000
		fmt.Printf("Generating %d Mahasiswa...\n", totalMahasiswa)

		var users []models.User
		for i := 0; i < totalMahasiswa; i++ {
			nim := fmt.Sprintf("23%04d", i+1)
			email := nim + "@student.bku.ac.id"
			
			prodi := prodiList[rand.Intn(len(prodiList))]
			fakultasID := prodi.FakultasID

			user := models.User{
				Email:    email,
				Password: hashedPassword,
				Role:     "mahasiswa",
			}
			users = append(users, user)

			mhs := models.Mahasiswa{
				NIM:              nim,
				Nama:             gofakeit.Name(),
				FakultasID:       fakultasID,
				ProgramStudiID:   prodi.ID,
				SemesterSekarang: rand.Intn(8) + 1,
				StatusAkun:       "Aktif",
				StatusAkademik:   "Aktif",
				IPK:              float64(rand.Intn(200)+200) / 100.0, // 2.00 to 4.00
				TotalSKS:         rand.Intn(100) + 20,
				CreditLimit:      24,
				TahunMasuk:       2023,
				JalurMasuk:       []string{"SNMPTN", "SBMPTN", "Mandiri"}[rand.Intn(3)],
				NIK:              gofakeit.Regex("^[0-9]{16}$"),
				NISN:             gofakeit.Regex("^[0-9]{10}$"),
				TempatLahir:      gofakeit.City(),
				TanggalLahir:     gofakeit.DateRange(time.Now().AddDate(-25, 0, 0), time.Now().AddDate(-18, 0, 0)),
				JenisKelamin:     []string{"Laki-laki", "Perempuan"}[rand.Intn(2)],
				Agama:            []string{"Islam", "Kristen", "Katolik", "Hindu", "Buddha"}[rand.Intn(5)],
				EmailKampus:      email,
				EmailPersonal:    gofakeit.Email(),
				NoHP:             gofakeit.Phone(),
				Alamat:           gofakeit.Address().Address,
				Kota:             gofakeit.City(),
				KodePos:          gofakeit.Zip(),
				NamaAyah:         gofakeit.Name(),
				NamaIbuKandung:   gofakeit.Name(),
				AsalSekolah:      "SMA Negeri " + fmt.Sprintf("%d ", rand.Intn(10)+1) + gofakeit.City(),
				GolonganDarah:    []string{"A", "B", "AB", "O"}[rand.Intn(4)],
			}
			mahasiswas = append(mahasiswas, mhs)
		}

		fmt.Println("Inserting Users...")
		config.DB.CreateInBatches(&users, 100)

		for i := range mahasiswas {
			mahasiswas[i].PenggunaID = users[i].ID
		}

		fmt.Println("Inserting Mahasiswa...")
		config.DB.CreateInBatches(&mahasiswas, 100)
	} else {
		fmt.Printf("Using %d existing Mahasiswa records.\n", len(mahasiswas))
	}

	// 4. Generate Psikolog
	var psikologs []models.Psikolog
	config.DB.Find(&psikologs)
	if len(psikologs) == 0 {
		for i := 0; i < 5; i++ {
			pUser := models.User{
				Email:    fmt.Sprintf("psikolog%d@bku.ac.id", i+1),
				Password: hashedPassword,
				Role:     "psikolog",
			}
			config.DB.Create(&pUser)
			psikolog := models.Psikolog{
				UserID:       pUser.ID,
				Nama:         "Psikolog " + gofakeit.Name(),
				Email:        pUser.Email,
				NoHP:         gofakeit.Phone(),
				Spesialisasi: "Klinis Dewasa",
				Bio:          gofakeit.Paragraph(1, 2, 5, " "),
				Lokasi:       "Klinik Kampus BKU",
				Tarif:        0,
				IsAktif:      true,
			}
			psikologs = append(psikologs, psikolog)
		}
		config.DB.Create(&psikologs)
	}

	// 5. Generate Dosen
	var dosens []models.Dosen
	config.DB.Find(&dosens)
	if len(dosens) == 0 {
		for i := 0; i < 10; i++ {
			dUser := models.User{
				Email:    fmt.Sprintf("dosen%d@bku.ac.id", i+1),
				Password: hashedPassword,
				Role:     "dosen",
			}
			config.DB.Create(&dUser)

			dosen := models.Dosen{
				PenggunaID:     dUser.ID,
				NIDN:           gofakeit.Regex("^[0-9]{10}$"),
				Nama:           "Dr. " + gofakeit.Name(),
				FakultasID:     fakultasList[0].ID,
				ProgramStudiID: prodiList[0].ID,
				IsDPA:          true,
				Email:          dUser.Email,
				NoHP:           gofakeit.Phone(),
			}
			dosens = append(dosens, dosen)
		}
		config.DB.Create(&dosens)
	}

	// 6. Generate Related Data
	fmt.Println("Clearing previous related data...")
	config.DB.Exec("DELETE FROM mahasiswa.pkkmb_progress")
	config.DB.Exec("DELETE FROM mahasiswa.pkkmb_hasil")
	config.DB.Exec("DELETE FROM mahasiswa.pkkmb_sertifikat")
	config.DB.Exec("DELETE FROM mahasiswa.kesehatan")
	config.DB.Exec("DELETE FROM mahasiswa.konseling")
	config.DB.Exec("DELETE FROM mahasiswa.psikolog_booking")

	fmt.Println("Generating Related Data (PKKMB, Kesehatan, Konseling)...")
	
	kegiatanPkkmb := models.PkkmbKegiatan{
		Judul: "PKKMB Universitas 2023",
		Deskripsi: "Masa orientasi mahasiswa baru",
		Tanggal: time.Now().AddDate(0, -6, 0),
		Lokasi: "Auditorium Kampus",
	}
	config.DB.FirstOrCreate(&kegiatanPkkmb, models.PkkmbKegiatan{Judul: "PKKMB Universitas 2023"})

	var pkkmbProgress []models.PkkmbProgress
	var pkkmbHasil []models.PkkmbHasil
	var pkkmbSertifikat []models.PkkmbSertifikat
	var kesehatan []models.Kesehatan
	var konseling []models.Konseling
	var bookings []models.PsikologBooking

	for i := 0; i < 500; i++ {
		mID := mahasiswas[i].ID
		
		pkkmbProgress = append(pkkmbProgress, models.PkkmbProgress{
			MahasiswaID: mID,
			KegiatanID:  kegiatanPkkmb.ID,
			Status:      "Hadir",
		})
		
		statusKelulusan := "Lulus"
		if i >= 300 && i < 450 {
			statusKelulusan = "Proses"
		} else if i >= 450 {
			statusKelulusan = "Gagal"
		}

		pkkmbHasil = append(pkkmbHasil, models.PkkmbHasil{
			MahasiswaID:     mID,
			Nilai:           float64(rand.Intn(40) + 60),
			StatusKelulusan: statusKelulusan,
		})

		if statusKelulusan == "Lulus" && i < 150 {
			pkkmbSertifikat = append(pkkmbSertifikat, models.PkkmbSertifikat{
				MahasiswaID:   mID,
				FileURL:       "/uploads/sertifikat/sample.pdf",
				TanggalTerbit: time.Now().AddDate(0, 0, -i),
			})
		}

		if i < 300 {
			statusKesehatan := []string{"prima", "stabil", "pantauan", "kritis"}[rand.Intn(4)]
			butaWarna := []string{"Normal", "Parsial", "Total"}[rand.Intn(3)]
			if rand.Float32() > 0.15 {
				butaWarna = "Normal" // 85% normal
			}
			
			riwayatPenyakit := ""
			if rand.Float32() < 0.25 {
				riwayatPenyakit = []string{"Asma", "Alergi Debu", "Gastritis/Maag", "Migrain", "Hipertensi"}[rand.Intn(5)]
			}

			catatan := "Hasil pemeriksaan secara umum baik."
			if statusKesehatan == "pantauan" {
				catatan = "Perlu dipantau kembali tekanan darah atau kadar gula darahnya secara berkala."
			} else if statusKesehatan == "kritis" {
				catatan = "Kondisi membutuhkan rujukan dan penanganan medis secepatnya dari tim dokter universitas."
			}

			fileURL := ""
			if rand.Float32() < 0.5 {
				fileURL = "/uploads/kesehatan/screening_sample.pdf"
			}

			kesehatan = append(kesehatan, models.Kesehatan{
				MahasiswaID:      mID,
				Tanggal:          time.Now().AddDate(0, -rand.Intn(6), -rand.Intn(30)),
				JenisPemeriksaan: []string{"Screening Kesehatan Awal", "Skrining Berkala", "Cek Up Khusus"}[rand.Intn(3)],
				Hasil:            []string{"Sehat", "Perlu Pantauan", "Butuh Penanganan"}[rand.Intn(3)],
				TinggiBadan:      float64(rand.Intn(30) + 150),
				BeratBadan:       float64(rand.Intn(40) + 45),
				Sistole:          rand.Intn(40) + 100,
				Diastole:         rand.Intn(30) + 60,
				GulaDarah:        rand.Intn(80) + 70,
				ButaWarna:        butaWarna,
				RiwayatPenyakit:  riwayatPenyakit,
				GolonganDarah:    mahasiswas[i].GolonganDarah,
				StatusKesehatan:  statusKesehatan,
				Catatan:          catatan,
				FileURL:          fileURL,
			})
		}

		if i < 100 && len(dosens) > 0 && len(psikologs) > 0 {
			konseling = append(konseling, models.Konseling{
				MahasiswaID: mID,
				DosenID:     dosens[rand.Intn(len(dosens))].ID,
				Tanggal:     time.Now().AddDate(0, 0, -rand.Intn(30)),
				Topik:       "Bimbingan Akademik",
				Status:      "Selesai",
				Catatan:     "Mahasiswa aktif dan IPK aman.",
			})

			bookings = append(bookings, models.PsikologBooking{
				MahasiswaID: mID,
				PsikologID:  psikologs[rand.Intn(len(psikologs))].ID,
				Tanggal:     time.Now().AddDate(0, 0, rand.Intn(14)),
				JamMulai:    "09:00",
				JamSelesai:  "10:00",
				Topik:       "Manajemen Stres",
				Keluhan:     "Merasa kewalahan dengan tugas",
				Status:      "Confirmed",
				Mode:        "Tatap Muka",
			})
		}
	}

	fmt.Println("Inserting PKKMB...")
	config.DB.CreateInBatches(&pkkmbProgress, 100)
	config.DB.CreateInBatches(&pkkmbHasil, 100)

	if len(pkkmbSertifikat) > 0 {
		fmt.Println("Inserting PKKMB Sertifikat...")
		config.DB.CreateInBatches(&pkkmbSertifikat, 100)
	}

	fmt.Println("Inserting Kesehatan...")
	config.DB.CreateInBatches(&kesehatan, 100)

	fmt.Println("Inserting Konseling & Booking Psikolog...")
	config.DB.CreateInBatches(&konseling, 50)
	config.DB.CreateInBatches(&bookings, 50)

	fmt.Println("DONE! 1000 Mahasiswa data successfully seeded.")
}

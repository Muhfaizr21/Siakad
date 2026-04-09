package config

import (
	"log"
	"time"

	"siakad-backend/models"

	"gorm.io/gorm"
)

func seedCounselingData(db *gorm.DB) {
	var cCount int64
	db.Model(&models.JadwalKonseling{}).Count(&cCount)
	if cCount != 0 {
		return
	}

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

func seedHealthData(db *gorm.DB) {
	var hCount int64
	db.Model(&models.HasilKesehatan{}).Count(&hCount)
	if hCount != 0 {
		return
	}

	petugasID := uint(1)

	db.Create(&models.HasilKesehatan{
		MahasiswaID:             1,
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
		MahasiswaID:             1,
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
		MahasiswaID:             1,
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

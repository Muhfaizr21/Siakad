package config

import (
	"log"

	"siakad-backend/models"

	"gorm.io/gorm"
)

func seedStudentVoiceData(db *gorm.DB) {
	var count int64
	db.Model(&models.Aspirasi{}).Count(&count)
	if count != 0 {
		return
	}

	var student models.Mahasiswa
	if err := db.First(&student).Error; err != nil {
		return
	}

	aspirasi := []models.Aspirasi{
		{
			MahasiswaID: student.ID,
			Judul:       "AC Mati di Ruang 301",
			Isi:         "Mohon bantuan perbaikan AC di ruang 301 Gedung C.",
			Kategori:    "Fasilitas",
			Tujuan:      "Sarpras",
			Status:      "Selesai",
			IsAnonim:    false,
			Respon:      "AC sudah diperbaiki oleh tim sarpras.",
		},
		{
			MahasiswaID: student.ID,
			Judul:       "Keterlambatan Input Nilai",
			Isi:         "Nilai Farmakologi belum muncul di KHS.",
			Kategori:    "Akademik",
			Tujuan:      "Akademik",
			Status:      "Diproses",
			IsAnonim:    true,
		},
	}

	for _, a := range aspirasi {
		db.Create(&a)
	}

	log.Println("==> Seeder: Setup Student Voice Data successfully.")
}

func seedOrganisasiData(db *gorm.DB) {
	var count int64
	db.Model(&models.RiwayatOrganisasi{}).Count(&count)
	if count != 0 {
		return
	}

	// Create some Ormawa first since Riwayat needs OrmawaID
	ormawas := []models.Ormawa{
		{Nama: "UKM Korps Sukarela PMI", Deskripsi: "Unit Kegiatan Mahasiswa di bidang kemanusiaan."},
		{Nama: "Himpunan Mahasiswa Farmasi", Deskripsi: "Organisasi mahasiswa tingkat program studi."},
	}

	for _, o := range ormawas {
		db.Create(&o)
	}

	var students []models.Mahasiswa
	db.Find(&students)

	var pmi, hmf models.Ormawa
	db.Where("nama = ?", "UKM Korps Sukarela PMI").First(&pmi)
	db.Where("nama = ?", "Himpunan Mahasiswa Farmasi").First(&hmf)

	for _, student := range students {
		riwayat := []models.RiwayatOrganisasi{
			{
				MahasiswaID:      student.ID,
				NamaOrganisasi:   pmi.Nama,
				Tipe:             "UKM",
				Jabatan:          "Anggota Divisi Medis",
				PeriodeMulai:     2023,
				StatusVerifikasi: "Diverifikasi",
			},
			{
				MahasiswaID:      student.ID,
				NamaOrganisasi:   hmf.Nama,
				Tipe:             "Himpunan Prodi",
				Jabatan:          "Sekretaris Umum",
				PeriodeMulai:     2024,
				StatusVerifikasi: "Menunggu",
			},
		}

		for _, r := range riwayat {
			db.Create(&r)
		}
	}

	log.Println("==> Seeder: Setup Organisasi Data successfully.")
}

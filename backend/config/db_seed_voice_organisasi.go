package config

import (
	"log"
	"time"

	"siakad-backend/models"

	"gorm.io/gorm"
)

func seedStudentVoiceData(db *gorm.DB) {
	var vCount int64
	db.Model(&models.TiketAspirasi{}).Count(&vCount)
	if vCount != 0 {
		return
	}

	// Get first available student to associate seed data with
	var student models.Student
	if err := db.Preload("Major").First(&student).Error; err != nil {
		log.Println("==> Seeder: No student found, skipping Student Voice seeds.")
		return
	}

	now := time.Now()

	t1 := models.TiketAspirasi{
		NomorTiket:   "SV-20260401-0001",
		StudentID:    student.ID,
		FakultasID:   student.Major.FacultyID,
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
		IsiRespons: "Aspirasi berhasil dikirim ke Admin Fakultas.",
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

	t2 := models.TiketAspirasi{
		NomorTiket:   "SV-20260403-0001",
		StudentID:    student.ID,
		FakultasID:   student.Major.FacultyID,
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
		IsiRespons: "Aspirasi berhasil dikirim secara anonim ke Admin Fakultas.",
		CreatedAt:  t2.CreatedAt,
	})
	db.Create(&models.TiketTimelineEvent{
		TiketID:    t2.ID,
		TipeEvent:  "diterima_fakultas",
		Level:      "fakultas",
		IsiRespons: "Aspirasi telah diterima dan sedang divalidasi oleh bagian akademik fakultas.",
		CreatedAt:  t2.CreatedAt.Add(time.Hour * 4),
	})

	log.Println("==> Seeder: Setup Student Voice Data successfully for student:", student.Name)
}

func seedOrganisasiData(db *gorm.DB) {
	var orgCount int64
	db.Model(&models.RiwayatOrganisasi{}).Count(&orgCount)
	if orgCount != 0 {
		return
	}

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

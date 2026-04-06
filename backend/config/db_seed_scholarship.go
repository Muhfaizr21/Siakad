package config

import (
	"log"
	"time"

	"siakad-backend/models"

	"gorm.io/gorm"
)

func seedScholarshipData(db *gorm.DB) {
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
}

package config

import (
	"log"
	"time"

	"siakad-backend/models"

	"gorm.io/gorm"
)

func seedKencanaData(db *gorm.DB) {
	var tahapCount int64
	db.Model(&models.KencanaTahap{}).Count(&tahapCount)
	if tahapCount != 0 {
		return
	}

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

	m1 := models.KencanaMateri{TahapID: tahapPra.ID, Urutan: 1,
		Judul: "Sejarah & Nilai Dasar Universitas Bhakti Kencana",
		Tipe:  "PDF", FileURL: "https://example.com/materi1.pdf", IsAktif: true,
	}
	db.Create(&m1)
	bobot1 := 20.0
	k1 := models.KencanaKuis{KencanaMateriID: m1.ID, Judul: "Kuis Modul 1: Sejarah BKU",
		PassingGrade: 75, BobotPersen: bobot1, IsAktif: true,
	}
	db.Create(&k1)
	db.Create(&models.KuisSoal{KencanaKuisID: k1.ID, Urutan: 1,
		Pertanyaan: "Tahun berapa Universitas Bhakti Kencana diresmikan?",
		OpsiA:      "2019", OpsiB: "2010", OpsiC: "2005", OpsiD: "1998", KunciJawaban: "A",
	})
	db.Create(&models.KuisSoal{KencanaKuisID: k1.ID, Urutan: 2,
		Pertanyaan: "Warna yang mendominasi logo BKU adalah?",
		OpsiA:      "Merah", OpsiB: "Orange", OpsiC: "Biru", OpsiD: "Hijau", KunciJawaban: "B",
	})
	db.Create(&models.KuisSoal{KencanaKuisID: k1.ID, Urutan: 3,
		Pertanyaan: "Apa visi utama Universitas Bhakti Kencana?",
		OpsiA:      "Menjadi universitas berbasis riset", OpsiB: "Menghasilkan lulusan berbudi pekerti luhur dan kompeten",
		OpsiC: "Menjadi universitas internasional", OpsiD: "Mencetak pengusaha muda", KunciJawaban: "B",
	})

	m2 := models.KencanaMateri{TahapID: tahapPra.ID, Urutan: 2,
		Judul: "Sistem Akademik & Peraturan Kampus",
		Tipe:  "Video", FileURL: "https://www.youtube.com/embed/dQw4w9WgXcQ", IsAktif: true,
	}
	db.Create(&m2)
	bobot2 := 20.0
	k2 := models.KencanaKuis{KencanaMateriID: m2.ID, Judul: "Kuis Modul 2: Sistem Akademik",
		PassingGrade: 75, BobotPersen: bobot2, IsAktif: true,
	}
	db.Create(&k2)
	db.Create(&models.KuisSoal{KencanaKuisID: k2.ID, Urutan: 1,
		Pertanyaan: "Apa kepanjangan dari SKS?",
		OpsiA:      "Sistem Kelas Singkat", OpsiB: "Standar Kesuksesan Studi",
		OpsiC: "Sistem Kredit Semester", OpsiD: "Satuan Kredit Siswa", KunciJawaban: "C",
	})
	db.Create(&models.KuisSoal{KencanaKuisID: k2.ID, Urutan: 2,
		Pertanyaan: "Berapa SKS maksimal yang bisa diambil per semester jika IPK >= 3.0?",
		OpsiA:      "18 SKS", OpsiB: "20 SKS", OpsiC: "22 SKS", OpsiD: "24 SKS", KunciJawaban: "D",
	})

	m3 := models.KencanaMateri{TahapID: tahapInti.ID, Urutan: 1,
		Judul: "Kehidupan Kemahasiswaan & Organisasi",
		Tipe:  "PDF", FileURL: "https://example.com/materi3.pdf", IsAktif: true,
	}
	db.Create(&m3)
	bobot3 := 20.0
	k3 := models.KencanaKuis{KencanaMateriID: m3.ID, Judul: "Kuis Modul 3: Kemahasiswaan",
		PassingGrade: 75, BobotPersen: bobot3, IsAktif: true,
	}
	db.Create(&k3)
	db.Create(&models.KuisSoal{KencanaKuisID: k3.ID, Urutan: 1,
		Pertanyaan: "Apa nama organisasi mahasiswa tertinggi di BKU?",
		OpsiA:      "HIMA", OpsiB: "BEM", OpsiC: "DPM", OpsiD: "UKM", KunciJawaban: "B",
	})
	db.Create(&models.KuisSoal{KencanaKuisID: k3.ID, Urutan: 2,
		Pertanyaan: "Apa kepanjangan dari BEM?",
		OpsiA:      "Badan Eksekutif Mahasiswa", OpsiB: "Badan Edukasi Mahasiswa",
		OpsiC: "Biro Eksekutif Mahasiswa", OpsiD: "Biro Edukasi Mandiri", KunciJawaban: "A",
	})

	m4 := models.KencanaMateri{TahapID: tahapInti.ID, Urutan: 2,
		Judul: "Layanan Kesehatan & Konseling Kampus",
		Tipe:  "PDF", FileURL: "https://example.com/materi4.pdf", IsAktif: true,
	}
	db.Create(&m4)
	bobot4 := 20.0
	k4 := models.KencanaKuis{KencanaMateriID: m4.ID, Judul: "Kuis Modul 4: Layanan Kampus",
		PassingGrade: 75, BobotPersen: bobot4, IsAktif: true,
	}
	db.Create(&k4)
	db.Create(&models.KuisSoal{KencanaKuisID: k4.ID, Urutan: 1,
		Pertanyaan: "Di mana lokasi klinik kesehatan BKU?",
		OpsiA:      "Gedung A", OpsiB: "Gedung B", OpsiC: "Gedung C - Lantai 1", OpsiD: "Di luar kampus", KunciJawaban: "C",
	})

	m5 := models.KencanaMateri{TahapID: tahapPasca.ID, Urutan: 1,
		Judul: "Etika Digital & Media Sosial Mahasiswa",
		Tipe:  "Video", FileURL: "https://www.youtube.com/embed/dQw4w9WgXcQ", IsAktif: true,
	}
	db.Create(&m5)
	bobot5 := 20.0
	k5 := models.KencanaKuis{KencanaMateriID: m5.ID, Judul: "Kuis Modul 5: Etika Digital",
		PassingGrade: 75, BobotPersen: bobot5, IsAktif: true,
	}
	db.Create(&k5)
	db.Create(&models.KuisSoal{KencanaKuisID: k5.ID, Urutan: 1,
		Pertanyaan:   "Perilaku mana yang termasuk etika digital yang baik?",
		OpsiA:        "Menyebarkan informasi tanpa verifikasi",
		OpsiB:        "Menggunakan nama asli saat berinteraksi online",
		OpsiC:        "Mengejek teman di media sosial",
		OpsiD:        "Membagikan data pribadi orang lain",
		KunciJawaban: "B",
	})
	db.Create(&models.KuisSoal{KencanaKuisID: k5.ID, Urutan: 2,
		Pertanyaan: "Apa yang dimaksud dengan cyberbullying?",
		OpsiA:      "Bermain game online", OpsiB: "Belajar coding",
		OpsiC: "Perundungan melalui media digital", OpsiD: "Berbelanja online",
		KunciJawaban: "C",
	})

	log.Println("==> Seeder: Setup KENCANA 3-Tahap Data successfully.")
}

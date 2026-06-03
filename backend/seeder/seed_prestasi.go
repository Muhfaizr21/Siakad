//go:build ignore

package main

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/brianvoe/gofakeit/v6"
)

func main() {
	config.ConnectDB()

	var mahasiswaList []models.Mahasiswa
	if err := config.DB.Find(&mahasiswaList).Error; err != nil {
		log.Fatalf("Gagal mengambil data mahasiswa: %v", err)
	}

	if len(mahasiswaList) == 0 {
		log.Fatalf("Tidak ada data mahasiswa. Jalankan seed mahasiswa terlebih dahulu.")
	}

	rand.Seed(time.Now().UnixNano())

	kategoriList := []string{"Akademik", "Non-Akademik"}
	tingkatList := []string{"Internasional", "Nasional", "Provinsi", "Kabupaten/Kota", "Universitas"}
	peringkatList := []string{"Juara 1", "Juara 2", "Juara 3", "Harapan 1", "Finalis", "Peserta"}
	statusList := []string{"Menunggu", "Diverifikasi", "Ditolak"}

	var prestasiList []models.Prestasi
	fmt.Println("Generating Prestasi...")

	for i := 0; i < 200; i++ {
		mhs := mahasiswaList[rand.Intn(len(mahasiswaList))]

		kategori := kategoriList[rand.Intn(len(kategoriList))]
		tingkat := tingkatList[rand.Intn(len(tingkatList))]
		peringkat := peringkatList[rand.Intn(len(peringkatList))]
		status := statusList[rand.Intn(len(statusList))]

		poin := 10
		if tingkat == "Internasional" {
			poin = 50
		} else if tingkat == "Nasional" {
			poin = 30
		} else if tingkat == "Provinsi" {
			poin = 20
		}

		if peringkat == "Juara 1" {
			poin += 20
		} else if peringkat == "Juara 2" {
			poin += 15
		} else if peringkat == "Juara 3" {
			poin += 10
		}

		prestasi := models.Prestasi{
			MahasiswaID:  mhs.ID,
			NamaKegiatan: gofakeit.JobTitle() + " Competition",
			Kategori:     kategori,
			Tingkat:      tingkat,
			Peringkat:    peringkat,
			Status:       status,
			Poin:         poin,
			BuktiURL:     "https://example.com/sertifikat/" + gofakeit.UUID() + ".pdf",
		}
		
		prestasiList = append(prestasiList, prestasi)
	}

	if err := config.DB.CreateInBatches(&prestasiList, 50).Error; err != nil {
		log.Fatalf("Gagal menyimpan data prestasi: %v", err)
	}

	fmt.Printf("DONE! %d data prestasi berhasil di-seed.\n", len(prestasiList))
}

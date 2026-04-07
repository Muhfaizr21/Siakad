package main

import (
	"fmt"
	"log"
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load("../../.env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	config.ConnectDB()

	articles := []models.Article{
		{
			Title:     "Jadwal UAS Semester Genap 2023/2024",
			Content:   "Diberitahukan kepada seluruh mahasiswa bahwa pelaksanaan UAS akan dimulai pada tanggal 3 Juni 2024. Harap persiapkan syarat administrasi dan kartu ujian.",
			Category:  "Akademik",
			Author:    "Humas Fakultas",
			Status:    "Published",
			Views:     1250,
		},
		{
			Title:     "Workshop Machine Learning & AI Modern",
			Content:   "Ikuti workshop intensif mengenai perkembangan AI terbaru bersama pakar industri pada Sabtu besok di Aula Utama.",
			Category:  "Kegiatan",
			Author:    "BEM Fakultas",
			Status:    "Published",
			Views:     850,
		},
		{
			Title:     "Penerimaan Beasiswa PPA Periode II",
			Content:   "Pendaftaran beasiswa PPA telah dibuka. Mahasiswa dengan IPK minimal 3.25 dapat mengajukan berkas melalui sistem Siakad.",
			Category:  "Beasiswa",
			Author:    "Kemahasiswaan",
			Status:    "Published",
			Views:     2100,
		},
	}

	for _, a := range articles {
		var existing models.Article
		if err := config.DB.Where("title = ?", a.Title).First(&existing).Error; err != nil {
			if err := config.DB.Create(&a).Error; err != nil {
				fmt.Printf("Gagal buat artikel %s: %v\n", a.Title, err)
			} else {
				fmt.Printf("Berhasil buat artikel: %s\n", a.Title)
			}
		}
	}

	fmt.Println("Seeder Berita Selesai!")
}

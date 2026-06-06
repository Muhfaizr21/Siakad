//go:build ignore

package main

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env")
	config.ConnectDB()

	var count int64
	config.DB.Model(&models.Ormawa{}).Count(&count)
	fmt.Printf("TOTAL ORMAWA COUNT: %d\n", count)

	var list []models.Ormawa
	config.DB.Find(&list)
	for _, o := range list {
		fmt.Printf("ID: %d, Nama: %s, Singkatan: %s, Status: %s, Kategori: %s\n", o.ID, o.Nama, o.Singkatan, o.Status, o.Kategori)
	}
}

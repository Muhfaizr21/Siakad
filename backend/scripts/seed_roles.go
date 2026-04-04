package main

import (
	"encoding/json"
	"log"
	
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env")
	config.ConnectDB()

	roles := []models.OrmawaRole{
		{
			Name:        "Sekretaris Umum",
			Description: "Menangani seluruh administrasi, persuratan, pengajuan proposal, dan publikasi pengumuman.",
			IsCustom:    false,
			Permissions: json.RawMessage(`{"anggota": ["view", "create", "edit", "export"], "proposal": ["view", "create", "edit", "delete", "submit"], "jadwal": ["view", "create", "edit", "delete"], "absensi": ["view", "create", "scan", "export"], "keuangan": ["view"], "lpj": ["view", "create", "edit", "submit"], "pengumuman": ["view", "create", "edit", "delete", "publish"], "struktur": ["view", "edit"]}`),
		},
		{
			Name:        "Bendahara Umum",
			Description: "Mengelola arus kas, transaksi masuk/keluar, dan pembuatan Laporan Pertanggungjawaban (LPJ) keuangan.",
			IsCustom:    false,
			Permissions: json.RawMessage(`{"anggota": ["view"], "proposal": ["view"], "jadwal": ["view"], "absensi": ["view"], "keuangan": ["view", "create", "edit", "delete", "export"], "lpj": ["view", "create", "edit", "delete", "submit"], "pengumuman": ["view"], "struktur": ["view"]}`),
		},
		{
			Name:        "Kepala Divisi / Departemen",
			Description: "Akses spesifik untuk mengelola program kalender kerja dan melihat ringkasan keuangan divisi sendiri.",
			IsCustom:    true,
			Permissions: json.RawMessage(`{"anggota": ["view"], "proposal": ["view", "create", "edit"], "jadwal": ["view", "create", "edit"], "absensi": ["view", "create", "scan"], "keuangan": ["view"], "lpj": ["view", "create", "edit"], "pengumuman": ["view"], "struktur": ["view"]}`),
		},
	}

	for _, role := range roles {
		var existing models.OrmawaRole
		if err := config.DB.Where("name = ?", role.Name).First(&existing).Error; err != nil {
			// not found
			config.DB.Create(&role)
			log.Println("Created role:", role.Name)
		} else {
			existing.Permissions = role.Permissions
			config.DB.Save(&existing)
			log.Println("Updated role:", role.Name)
		}
	}

	log.Println("Seeding completed!")
}

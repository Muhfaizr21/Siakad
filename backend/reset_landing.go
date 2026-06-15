package main

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "host=localhost user=postgres password=12345 dbname=studenthub port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	defaultPrograms := `[{"faculty":"Fakultas Ilmu Kesehatan","icon":"Heart","color":"bg-[var(--theme-primary)]","programs":["Keperawatan (S1)","Farmasi (S1)","Kebidanan (D3)"]},{"faculty":"Fakultas Ilmu Sosial & Humaniora","icon":"BookOpen","color":"bg-[var(--theme-primary)]","programs":["Psikologi (S1)","Ilmu Komunikasi (S1)","Hukum (S1)"]},{"faculty":"Fakultas Sains & Teknologi","icon":"Microscope","color":"bg-[var(--theme-primary)]","programs":["Informatika (S1)","Sistem Informasi (S1)","Bioteknologi (S1)"]},{"faculty":"Fakultas Ekonomi & Bisnis","icon":"Scale","color":"bg-[var(--theme-primary)]","programs":["Manajemen (S1)","Akuntansi (S1)","Ekonomi Syariah (S1)"]},{"faculty":"Fakultas Pendidikan & Keguruan","icon":"Computer","color":"bg-[var(--theme-primary)]","programs":["PGSD (S1)","PAUD (S1)","Bimbingan Konseling (S1)"]},{"faculty":"Program Profesi","icon":"Building2","color":"bg-[var(--theme-primary)]","programs":["Profesi Ners","Profesi Apoteker","Profesi Psikolog"]}]`

	db.Exec("UPDATE landing_settings SET programs_items = ?", defaultPrograms)

	log.Println("Berhasil mereset programs_items ke data default awal!")
}

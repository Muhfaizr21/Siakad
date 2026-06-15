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

	// 7 = Ilmu Kesehatan, 6 = Keperawatan, 5 = Farmasi
	db.Exec("UPDATE fakultas.program_studi SET fakultas_id = 7 WHERE nama ILIKE '%GIZI%' OR nama ILIKE '%FISIOTERAPI%' OR nama ILIKE '%BIDAN%'")
	db.Exec("UPDATE fakultas.program_studi SET fakultas_id = 6 WHERE nama ILIKE '%KEPERAWATAN%' OR nama ILIKE '%NERS%'")
	db.Exec("UPDATE fakultas.program_studi SET fakultas_id = 5 WHERE nama ILIKE '%APOTEKER%'")
	
	log.Println("Berhasil memperbaiki pemetaan prodi di database!")
}

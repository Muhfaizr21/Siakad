package main

import (
	"log"
	"time"

	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load("../../.env", "../.env", ".env")
	config.ConnectDB()

	db := config.DB

	// Drop tables explicitly to ensure clean slate
	db.Migrator().DropTable(
		&models.Peran{}, &models.Pengguna{}, &models.Fakultas{}, &models.ProgramStudi{}, 
		&models.Dosen{}, &models.Mahasiswa{}, &models.Ormawa{}, 
		&models.OrmawaMember{}, &models.Proposal{}, &models.CashMutation{},
	)

	log.Println("1. Migrating DB Schema...")
	err := db.AutoMigrate(
		&models.Ormawa{},
		&models.OrmawaMember{},
		&models.Proposal{},
		&models.CashMutation{},
	)
	if err != nil {
		log.Fatal("Migration failed:", err)
	}

	log.Println("2. Seeding Data...")
	
	// Create Mock Ormawas
	hima := models.Ormawa{Nama: "HIMPUNAN MAHASISWA INFORMATIKA", Description: "Organisasi kemahasiswaan tertinggi di tingkat Program Studi Informatika."}
	bem := models.Ormawa{Nama: "BEM Fasilkom", Description: "Badan Eksekutif Mahasiswa Fasilkom"}
	db.Where(models.Ormawa{Nama: hima.Nama}).FirstOrCreate(&hima)
	db.Where(models.Ormawa{Nama: bem.Nama}).FirstOrCreate(&bem)

	// Create Students
	s1 := models.Mahasiswa{NamaMahasiswa: "Muhamad Faiz", NIM: "220510001", StatusAkun: "active"}
	s2 := models.Mahasiswa{NamaMahasiswa: "Rizky Agung", NIM: "220510002", StatusAkun: "active"}
	s3 := models.Mahasiswa{NamaMahasiswa: "Nurul Hidayah", NIM: "220510003", StatusAkun: "active"}
	db.Where(models.Mahasiswa{NIM: s1.NIM}).FirstOrCreate(&s1)
	db.Where(models.Mahasiswa{NIM: s2.NIM}).FirstOrCreate(&s2)
	db.Where(models.Mahasiswa{NIM: s3.NIM}).FirstOrCreate(&s3)

	// Create Memberships for HIMA
	m1 := models.OrmawaMember{OrmawaID: hima.ID, MahasiswaID: s1.ID, Role: "Ketua Umum", Division: "Inti", Status: "aktif", JoinedAt: time.Now()}
	m2 := models.OrmawaMember{OrmawaID: hima.ID, MahasiswaID: s2.ID, Role: "Bendahara Umum", Division: "Inti", Status: "aktif", JoinedAt: time.Now()}
	m3 := models.OrmawaMember{OrmawaID: hima.ID, MahasiswaID: s3.ID, Role: "Staf", Division: "Minat Bakat", Status: "aktif", JoinedAt: time.Now()}
	db.Where(models.OrmawaMember{OrmawaID: hima.ID, MahasiswaID: s1.ID}).FirstOrCreate(&m1)
	db.Where(models.OrmawaMember{OrmawaID: hima.ID, MahasiswaID: s2.ID}).FirstOrCreate(&m2)
	db.Where(models.OrmawaMember{OrmawaID: hima.ID, MahasiswaID: s3.ID}).FirstOrCreate(&m3)

	// Create Proposals
	p1 := models.Proposal{
		OrmawaID: hima.ID, Title: "Seminar Nasional IT & Karir 2024", DateEvent: time.Now().AddDate(0, 1, 0), Budget: 15000000, Status: "pending_review", RequestedBy: s1.ID,
	}
	p2 := models.Proposal{
		OrmawaID: hima.ID, Title: "TurNaman Esport Antar Angkatan", DateEvent: time.Now().AddDate(0, 0, 14), Budget: 5000000, Status: "disetujui", RequestedBy: s3.ID,
	}
	db.Where(models.Proposal{Title: p1.Title}).FirstOrCreate(&p1)
	db.Where(models.Proposal{Title: p2.Title}).FirstOrCreate(&p2)

	// Create Financial Records
	c1 := models.CashMutation{
		OrmawaID: hima.ID, Type: "masuk", Nominal: 20000000, Category: "Pencairan Fakultas", Description: "Suntikan Dana SK Dekan", Date: time.Now(),
	}
	c2 := models.CashMutation{
		OrmawaID: hima.ID, Type: "keluar", Nominal: 5000000, Category: "Kegiatan", Description: "Pencairan Proposal Esport", Date: time.Now(),
	}
	db.Where(models.CashMutation{Description: c1.Description}).FirstOrCreate(&c1)
	db.Where(models.CashMutation{Description: c2.Description}).FirstOrCreate(&c2)

	log.Println("✅ Seeding Ormawa Data Success!")
}

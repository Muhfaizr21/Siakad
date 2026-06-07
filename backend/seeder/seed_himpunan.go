//go:build ignore

package main

import (
	"fmt"
	"time"

	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	godotenv.Load(".env")
	config.ConnectDB()

	loginID := "hima@bku.ac.id"
	password := "hima12345"

	var fakultas models.Fakultas
	config.DB.Where("LOWER(kode) = LOWER(?)", "FF").First(&fakultas)
	if fakultas.ID == 0 {
		config.DB.First(&fakultas)
	}
	fakultasID := fakultas.ID
	fmt.Printf("Using Fakultas: %d — %s\n", fakultasID, fakultas.Nama)

	var prodi models.ProgramStudi
	config.DB.Where("fakultas_id = ?", fakultasID).First(&prodi)
	if prodi.ID == 0 {
		config.DB.First(&prodi)
	}
	prodiID := prodi.ID
	fmt.Printf("Using Prodi: %d — %s\n", prodiID, prodi.Nama)

	ormawa := models.Ormawa{
		Nama:          "Himpunan Mahasiswa Farmasi",
		Singkatan:     "HIMAFAR",
		Deskripsi:     "Himpunan Mahasiswa Program Studi Farmasi",
		FakultasID:    &fakultasID,
		Status:        "Aktif",
		Kategori:      "Himpunan",
		JumlahAnggota: 1,
		Email:         loginID,
	}
	config.DB.Where("LOWER(singkatan) = LOWER(?)", "HIMAFAR").FirstOrCreate(&ormawa, models.Ormawa{Singkatan: "HIMAFAR"})
	fmt.Printf("Ormawa ID: %d — %s\n", ormawa.ID, ormawa.Nama)

	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	var user models.User
	err := config.DB.Where("LOWER(email) = ?", loginID).First(&user).Error
	if err != nil {
		user = models.User{
			Email:    loginID,
			Password: string(hash),
			Role:     "ormawa",
			OrmawaID: &ormawa.ID,
		}
		config.DB.Create(&user)
		fmt.Println("User created ID:", user.ID)
	} else {
		user.Password = string(hash)
		user.Role = "ormawa"
		user.OrmawaID = &ormawa.ID
		config.DB.Save(&user)
		fmt.Println("User updated ID:", user.ID)
	}

	var mhs models.Mahasiswa
	err = config.DB.Where("nim = ?", loginID).First(&mhs).Error
	if err != nil {
		mhs = models.Mahasiswa{
			PenggunaID:     user.ID,
			NIM:            loginID,
			Nama:           "Admin HIMAFAR",
			StatusAkun:     "Aktif",
			ProgramStudiID: prodiID,
			FakultasID:     fakultasID,
		}
		config.DB.Create(&mhs)
		fmt.Println("Mahasiswa created NIM:", mhs.NIM)
	} else {
		mhs.PenggunaID = user.ID
		config.DB.Save(&mhs)
		fmt.Println("Mahasiswa updated NIM:", mhs.NIM)
	}

	var anggota models.OrmawaAnggota
	err = config.DB.Where("ormawa_id = ? AND mahasiswa_id = ?", ormawa.ID, mhs.ID).First(&anggota).Error
	if err != nil {
		anggota = models.OrmawaAnggota{
			OrmawaID:    ormawa.ID,
			MahasiswaID: mhs.ID,
			Role:        "Ketua",
			Status:      "Aktif",
			Divisi:      "Inti",
			JoinedAt:    time.Now(),
		}
		config.DB.Create(&anggota)
		fmt.Println("Anggota created")
	} else {
		fmt.Println("Anggota already exists")
	}

	proposal := models.Proposal{
		OrmawaID:              ormawa.ID,
		MahasiswaID:           mhs.ID,
		FakultasID:            mhs.FakultasID,
		Judul:                 "Loka Karya Kefarmasian Nasional 2026",
		TanggalKegiatan:       time.Now().AddDate(0, 1, 15),
		Anggaran:              18000000,
		Jenis:                 "Kegiatan Mahasiswa",
		Status:                "disetujui_fakultas",
		Catatan:               "Telah divalidasi oleh Dekan Farmasi, menunggu persetujuan akhir Super Admin",
		LandasanKegiatan:      "Program Kerja HIMAFAR 2026 Bidang Keilmuan",
		Deskripsi:             "Loka karya nasional bertema Masa Depan Farmasi Klinik dan Komunitas di Era AI.",
		BentukKegiatan:        "Seminar Nasional, Loka Karya, & Poster Competition",
		Mitra:                 "Ikatan Apoteker Indonesia (IAI) Jawa Barat",
		LatarBelakang:         "Perkembangan teknologi kecerdasan buatan dalam dunia kefarmasian memerlukan edukasi intensif.",
		TujuanKegiatan:        "Membekali mahasiswa farmasi dengan kompetensi teknologi masa depan dan memperluas jaringan nasional.",
		JadwalPelaksanaan:      "Sabtu, 25 Juli 2026, 08:00 - 16:00 WIB",
		SasaranKegiatan:        "Mahasiswa Farmasi se-Indonesia & Apoteker Praktisi",
		IndikatorKeberhasilan: "Diikuti oleh minimal 300 peserta dan 50 abstrak kompetisi poster.",
		SumberDana:            "Dana Alokasi Ormawa & Biaya Pendaftaran Peserta",
		PJKegiatan:            "Admin HIMAFAR (HIMAFAR)",
	}

	var existingProp models.Proposal
	err = config.DB.Where("ormawa_id = ? AND judul = ?", ormawa.ID, proposal.Judul).First(&existingProp).Error
	if err != nil {
		config.DB.Create(&proposal)
		fmt.Printf("Proposal created: %s (Status: %s)\n", proposal.Judul, proposal.Status)
	} else {
		proposal.ID = existingProp.ID
		config.DB.Save(&proposal)
		fmt.Printf("Proposal updated: %s (Status: %s)\n", proposal.Judul, proposal.Status)
	}

	var riwayat models.ProposalRiwayat
	err = config.DB.Where("proposal_id = ? AND status = ?", proposal.ID, proposal.Status).First(&riwayat).Error
	if err != nil {
		riwayat = models.ProposalRiwayat{
			ProposalID: proposal.ID,
			Status:     proposal.Status,
			Catatan:    proposal.Catatan,
			CreatedBy:  user.ID,
		}
		config.DB.Create(&riwayat)
		fmt.Println("Proposal history seeded")
	}

	fmt.Println("SUCCESS — Login: hima@bku.ac.id / hima12345")
}

package controllers

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// --- DOSEN ---

func AmbilDaftarDosen(c *fiber.Ctx) error {
	var daftarDosen []models.Dosen
	if err := config.DB.Preload("Pengguna").Preload("Fakultas").Preload("ProgramStudi.Fakultas").Find(&daftarDosen).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": daftarDosen})
}

func AmbilDosenBerdasarID(c *fiber.Ctx) error {
	id := c.Params("id")
	var dosen models.Dosen
	if err := config.DB.Preload("Pengguna").Preload("Fakultas").Preload("ProgramStudi.Fakultas").First(&dosen, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Dosen tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": dosen})
}

func TambahDosenBaru(c *fiber.Ctx) error {
	var d models.Dosen
	var payload struct {
		Email string `json:"email"`
	}

	if err := c.BodyParser(&d); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}
	c.BodyParser(&payload)

	tx := config.DB.Begin()

	user := models.User{
		Email:    payload.Email,
		Password: "$2a$10$r9C799sXvD8/Zk9m6p.hQ.m7I8WjKz.Y1vS/F1f7nI.Z1f7nI.Z1", // password123
		Role:     "dosen",
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal membuat akun dosen: " + err.Error()})
	}

	d.PenggunaID = user.ID
	if err := tx.Create(&d).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal membuat profil dosen: " + err.Error()})
	}

	tx.Commit()
	return c.Status(201).JSON(fiber.Map{"status": "success", "message": "Dosen berhasil ditambahkan", "data": d})
}

func PerbaruiDataDosen(c *fiber.Ctx) error {
	id := c.Params("id")
	var dosen models.Dosen
	if err := config.DB.Preload("Pengguna").Preload("Fakultas").Preload("ProgramStudi.Fakultas").First(&dosen, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Dosen tidak ditemukan"})
	}

	var payload struct {
		Email string `json:"email"`
	}

	if err := c.BodyParser(&dosen); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Data tidak valid"})
	}
	c.BodyParser(&payload)

	tx := config.DB.Begin()

	if payload.Email != "" && payload.Email != dosen.Pengguna.Email {
		if err := tx.Model(&dosen.Pengguna).Update("email", payload.Email).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui email akun"})
		}
	}

	if err := tx.Save(&dosen).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui profil dosen"})
	}

	tx.Commit()
	return c.JSON(fiber.Map{"status": "success", "message": "Data dosen diperbarui", "data": dosen})
}

func HapusDataDosen(c *fiber.Ctx) error {
	id := c.Params("id")
	var dosen models.Dosen
	if err := config.DB.First(&dosen, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Dosen tidak ditemukan"})
	}

	penggunaID := dosen.PenggunaID
	config.DB.Delete(&dosen)
	config.DB.Delete(&models.User{}, penggunaID)

	return c.JSON(fiber.Map{"status": "success", "message": "Dosen dan akun berhasil dihapus"})
}

// --- MAHASISWA ---

func AmbilDaftarMahasiswa(c *fiber.Ctx) error {
	var mhs []models.Mahasiswa
	query := config.DB.Preload("Pengguna").Preload("ProgramStudi.Fakultas").Preload("DosenPA")

	angkatan := c.Query("angkatan")
	if angkatan != "" {
		query = query.Where("tahun_masuk = ?", angkatan)
	}

	if err := query.Find(&mhs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": mhs})
}

func AmbilMahasiswaBerdasarID(c *fiber.Ctx) error {
	id := c.Params("id")
	var mhs models.Mahasiswa
	if err := config.DB.Preload("Pengguna").Preload("ProgramStudi.Fakultas").Preload("DosenPA").First(&mhs, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Mahasiswa tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": mhs})
}

func TambahMahasiswaBaru(c *fiber.Ctx) error {
	var req struct {
		NIM             string `json:"nim"`
		Nama            string `json:"nama"`
		NamaMahasiswa   string `json:"nama_mahasiswa"`
		Email           string `json:"email"`
		Password        string `json:"password"`
		ProgramStudiID  uint   `json:"program_studi_id"`
		ProdiID         uint   `json:"prodi_id"`
		DosenPAID       uint   `json:"dosen_pa_id"`
		DPALecturerID   uint   `json:"dpa_lecturer_id"`
		CurrentSemester int    `json:"currentSemester"`
		Semester        int    `json:"semester"`
		Status          string `json:"status"`
		StatusAkun      string `json:"status_akun"`
		Alamat          string `json:"alamat"`
		NoHP            string `json:"no_hp"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}

	nim := strings.TrimSpace(req.NIM)
	nama := strings.TrimSpace(req.Nama)
	if nama == "" {
		nama = strings.TrimSpace(req.NamaMahasiswa)
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))
	prodiID := req.ProgramStudiID
	if prodiID == 0 {
		prodiID = req.ProdiID
	}
	dosenPAID := req.DosenPAID
	if dosenPAID == 0 {
		dosenPAID = req.DPALecturerID
	}
	semester := req.Semester
	if semester == 0 {
		semester = req.CurrentSemester
	}
	if semester <= 0 {
		semester = 1
	}
	statusAkun := strings.TrimSpace(req.StatusAkun)
	if statusAkun == "" {
		statusAkun = strings.TrimSpace(req.Status)
	}
	if statusAkun == "" {
		statusAkun = "Aktif"
	}

	if nim == "" || nama == "" || email == "" || prodiID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "NIM, nama, email, dan program studi wajib diisi"})
	}

	var existing models.User
	if err := config.DB.Where("LOWER(email) = ?", email).First(&existing).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Email sudah digunakan"})
	}

	var existingMhs models.Mahasiswa
	if err := config.DB.Where("nim = ?", nim).First(&existingMhs).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "NIM sudah terdaftar"})
	}

	var prodi models.ProgramStudi
	if err := config.DB.First(&prodi, prodiID).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Program studi tidak ditemukan"})
	}

	tx := config.DB.Begin()

	passwordToHash := "password123"
	if strings.TrimSpace(req.Password) != "" {
		passwordToHash = strings.TrimSpace(req.Password)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(passwordToHash), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memproses password"})
	}

	user := models.User{
		Email:    email,
		Password: string(hash),
		Role:     "mahasiswa",
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal membuat akun mahasiswa: " + err.Error()})
	}

	m := models.Mahasiswa{
		PenggunaID:       user.ID,
		NIM:              nim,
		Nama:             nama,
		FakultasID:       prodi.FakultasID,
		ProgramStudiID:   prodiID,
		DosenPAID:        dosenPAID,
		SemesterSekarang: semester,
		StatusAkun:       statusAkun,
		Alamat:           strings.TrimSpace(req.Alamat),
		NoHP:             strings.TrimSpace(req.NoHP),
	}

	if err := tx.Create(&m).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal membuat profil mahasiswa: " + err.Error()})
	}

	tx.Commit()
	return c.Status(201).JSON(fiber.Map{"status": "success", "message": "Mahasiswa berhasil ditambahkan", "data": m})
}

func PerbaruiDataMahasiswa(c *fiber.Ctx) error {
	id := c.Params("id")
	var mhs models.Mahasiswa
	if err := config.DB.Preload("Pengguna").First(&mhs, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Mahasiswa tidak ditemukan"})
	}

	var payload struct {
		Email string `json:"email"`
	}

	if err := c.BodyParser(&mhs); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Data tidak valid"})
	}
	c.BodyParser(&payload)

	tx := config.DB.Begin()

	if payload.Email != "" && payload.Email != mhs.Pengguna.Email {
		if err := tx.Model(&mhs.Pengguna).Update("email", payload.Email).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui email akun"})
		}
	}

	if err := tx.Save(&mhs).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui data mahasiswa"})
	}

	tx.Commit()
	return c.JSON(fiber.Map{"status": "success", "message": "Data mahasiswa diperbarui", "data": mhs})
}

func HapusDataMahasiswa(c *fiber.Ctx) error {
	id := c.Params("id")
	var mhs models.Mahasiswa
	if err := config.DB.First(&mhs, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Mahasiswa tidak ditemukan"})
	}

	penggunaID := mhs.PenggunaID
	config.DB.Delete(&mhs)
	config.DB.Delete(&models.User{}, penggunaID)

	return c.JSON(fiber.Map{"status": "success", "message": "Mahasiswa dan akun berhasil dihapus"})
}

// --- FAKULTAS & PRODI ---

func AmbilDaftarFakultas(c *fiber.Ctx) error {
	var f []models.Fakultas
	config.DB.Find(&f)
	return c.JSON(fiber.Map{"status": "success", "data": f})
}

func AmbilDaftarProdi(c *fiber.Ctx) error {
	var p []models.ProgramStudi
	config.DB.Preload("Fakultas").Find(&p)
	return c.JSON(fiber.Map{"status": "success", "data": p})
}

func TambahProdiBaru(c *fiber.Ctx) error {
	var p models.ProgramStudi
	if err := c.BodyParser(&p); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Salah format data"})
	}
	config.DB.Create(&p)
	config.DB.Preload("Fakultas").First(&p, p.ID)
	return c.JSON(fiber.Map{"status": "success", "data": p})
}

func PerbaruiProdi(c *fiber.Ctx) error {
	id := c.Params("id")
	var p models.ProgramStudi
	if err := config.DB.First(&p, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Prodi tidak ditemukan"})
	}
	c.BodyParser(&p)
	config.DB.Save(&p)
	return c.JSON(fiber.Map{"status": "success", "message": "Data prodi diperbarui", "data": p})
}

func HapusProdi(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.ProgramStudi{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Terhapus"})
}

// --- PENGATURAN AKADEMIK ---

func AmbilPengaturanAkademik(c *fiber.Ctx) error {
	// Fitur ini memerlukan model AcademicSettings yang saat ini tidak tersedia di models.go
	return c.JSON(fiber.Map{"status": "success", "message": "Fitur Pengaturan Akademik sedang dalam pemeliharaan"})
}

func SimpanPengaturanAkademik(c *fiber.Ctx) error {
	return c.Status(501).JSON(fiber.Map{"status": "error", "message": "Fitur simpan pengaturan akademik tidak tersedia"})
}

// --- END OF ACADEMIC CONTROLLERS ---

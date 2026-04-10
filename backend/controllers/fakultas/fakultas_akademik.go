package controllers

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

// --- DOSEN ---

func AmbilDaftarDosen(c *fiber.Ctx) error {
	var daftarDosen = []models.Dosen{}
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
	var mhs = []models.Mahasiswa{}
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
	var m models.Mahasiswa
	var payload struct {
		Email string `json:"email"`
	}

	if err := c.BodyParser(&m); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}
	c.BodyParser(&payload)

	// --- LOGIKA CEK KAPASITAS (SLOT) ---
	var prodi models.ProgramStudi
	if err := config.DB.First(&prodi, m.ProgramStudiID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Program Studi tidak ditemukan"})
	}

	var currentCount int64
	config.DB.Model(&models.Mahasiswa{}).Where("program_studi_id = ?", m.ProgramStudiID).Count(&currentCount)

	if prodi.Kapasitas > 0 && currentCount >= int64(prodi.Kapasitas) {
		return c.Status(400).JSON(fiber.Map{
			"status":  "error",
			"message": fmt.Sprintf("Kapasitas Penuh! Slot (%d/%d) untuk prodi %s sudah habis.", currentCount, prodi.Kapasitas, prodi.Nama),
		})
	}
	// ------------------------------------

	tx := config.DB.Begin()

	user := models.User{
		Email:    payload.Email,
		Password: "$2a$10$r9C799sXvD8/Zk9m6p.hQ.m7I8WjKz.Y1vS/F1f7nI.Z1f7nI.Z1",
		Role:     "mahasiswa",
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal membuat akun mahasiswa: " + err.Error()})
	}

	m.PenggunaID = user.ID
	m.StatusAkun = "Aktif"

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

	// --- LOGIKA CEK KAPASITAS (SLOT) SAAT PINDAH PRODI ---
	if mhs.ProgramStudiID != 0 {
		var prodi models.ProgramStudi
		if err := config.DB.First(&prodi, mhs.ProgramStudiID).Error; err == nil {
			var currentCount int64
			config.DB.Model(&models.Mahasiswa{}).
				Where("program_studi_id = ?", mhs.ProgramStudiID).
				Where("id <> ?", mhs.ID). // Jangan hitung diri sendiri
				Count(&currentCount)

			if prodi.Kapasitas > 0 && currentCount >= int64(prodi.Kapasitas) {
				return c.Status(400).JSON(fiber.Map{
					"status":  "error",
					"message": fmt.Sprintf("Gagal Pindah! Kapasitas prodi %s sudah penuh (%d/%d).", prodi.Nama, currentCount, prodi.Kapasitas),
				})
			}
		}
	}
	// ----------------------------------------------------

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
	var f = []models.Fakultas{}
	config.DB.Find(&f)
	return c.JSON(fiber.Map{"status": "success", "data": f})
}

func AmbilDaftarProdi(c *fiber.Ctx) error {
	var p = []models.ProgramStudi{}
	config.DB.Preload("Fakultas").Find(&p)

	// Hitung jumlah mahasiswa untuk setiap prodi (Slot)
	for i := range p {
		var count int64
		config.DB.Model(&models.Mahasiswa{}).Where("program_studi_id = ?", p[i].ID).Count(&count)
		p[i].CurrentMahasiswa = count
	}

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

// --- PENGATURAN AKADEMIK ---

func AmbilPengaturanAkademik(c *fiber.Ctx) error {
	var period models.AcademicPeriod
	// Ambil periode yang aktif
	if err := config.DB.Where("is_aktif = ?", true).First(&period).Error; err != nil {
		// Jika tidak ada yang aktif, ambil yang terakhir dibuat
		config.DB.Order("id desc").First(&period)
	}

	// Map ke format yang diharapkan frontend
	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"id":               period.ID,
			"activeYear":       period.AcademicYear,
			"activeSemester":   period.Semester,
			"isKrsOpen":        period.IsKRSOpen,
			"isGradeInputOpen": true, // Defaulting for dashboard compatibility
			"updatedAt":        period.UpdatedAt,
		},
	})
}

func SimpanPengaturanAkademik(c *fiber.Ctx) error {
	var payload struct {
		ID               uint   `json:"id"`
		ActiveYear       string `json:"activeYear"`
		ActiveSemester   string `json:"activeSemester"`
		IsKrsOpen        bool   `json:"isKrsOpen"`
		IsGradeInputOpen bool   `json:"isGradeInputOpen"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid payload"})
	}

	var period models.AcademicPeriod
	if payload.ID != 0 {
		config.DB.First(&period, payload.ID)
	}

	period.AcademicYear = payload.ActiveYear
	period.Semester = payload.ActiveSemester
	period.IsKRSOpen = payload.IsKrsOpen
	period.IsActive = true
	period.Name = fmt.Sprintf("%s %s", payload.ActiveSemester, payload.ActiveYear)

	// Set yang lain jadi tidak aktif jika ini aktif
	config.DB.Model(&models.AcademicPeriod{}).Where("id <> ?", period.ID).Update("is_aktif", false)

	if err := config.DB.Save(&period).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan periode: " + err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Periode akademik diperbarui", "data": period})
}

// --- END OF ACADEMIC CONTROLLERS ---

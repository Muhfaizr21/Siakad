package controllers

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// --- DOSEN ---

func AmbilDaftarDosen(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var daftarDosen = []models.Dosen{}
	query := config.DB.Preload("Pengguna").Preload("Fakultas").Preload("ProgramStudi.Fakultas")

	if role == "faculty_admin" {
		query = query.Where("fakultas_id = ?", fid)
	}

	if err := query.Find(&daftarDosen).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": daftarDosen})
}

func AmbilDosenBerdasarID(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var dosen models.Dosen
	query := config.DB.Preload("Pengguna").Preload("Fakultas").Preload("ProgramStudi.Fakultas")

	if role == "faculty_admin" {
		query = query.Where("fakultas_id = ?", fid)
	}

	if err := query.First(&dosen, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Dosen tidak ditemukan atau Anda tidak memiliki akses"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": dosen})
}

func TambahDosenBaru(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var d models.Dosen
	var payload struct {
		Email string `json:"email"`
	}

	if err := c.BodyParser(&d); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}
	c.BodyParser(&payload)

	// Force FakultasID if faculty_admin
	if role == "faculty_admin" {
		d.FakultasID = fid
	}

	tx := config.DB.Begin()
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyiapkan password akun dosen"})
	}

	user := models.User{
		Email:      payload.Email,
		Password:   string(hashedPassword),
		Role:       "dosen",
		FakultasID: &d.FakultasID,
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
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var dosen models.Dosen

	query := config.DB.Preload("Pengguna")
	if role == "faculty_admin" {
		query = query.Where("fakultas_id = ?", fid)
	}

	if err := query.First(&dosen, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Dosen tidak ditemukan atau Anda tidak memiliki akses"})
	}

	var payload struct {
		Email string `json:"email"`
	}
	if err := c.BodyParser(&dosen); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}
	c.BodyParser(&payload)

	tx := config.DB.Begin()

	// Update email if changed
	if payload.Email != "" && payload.Email != dosen.Pengguna.Email {
		if err := tx.Model(&dosen.Pengguna).Update("email", payload.Email).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui email akun"})
		}
	}

	// Always ensure FakultasID stays correct for faculty_admin
	if role == "faculty_admin" {
		dosen.FakultasID = fid
	}

	if err := tx.Save(&dosen).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui profil dosen"})
	}

	tx.Commit()
	return c.JSON(fiber.Map{"status": "success", "message": "Data dosen berhasil diperbarui", "data": dosen})
}

func HapusDataDosen(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var dosen models.Dosen

	query := config.DB
	if role == "faculty_admin" {
		query = query.Where("fakultas_id = ?", fid)
	}

	if err := query.First(&dosen, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Dosen tidak ditemukan atau Anda tidak memiliki akses"})
	}

	config.DB.Delete(&dosen)
	return c.JSON(fiber.Map{"status": "success", "message": "Data dosen berhasil dihapus"})
}

// --- MAHASISWA ---

func AmbilDaftarMahasiswa(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var mhs = []models.Mahasiswa{}
	query := config.DB.Preload("Pengguna").Preload("ProgramStudi.Fakultas").Preload("DosenPA")

	if role == "faculty_admin" {
		query = query.Where("fakultas_id = ?", fid)
	}

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
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var mhs models.Mahasiswa
	query := config.DB.Preload("Pengguna").Preload("ProgramStudi.Fakultas").Preload("DosenPA")

	if role == "faculty_admin" {
		query = query.Where("fakultas_id = ?", fid)
	}

	if err := query.First(&mhs, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Mahasiswa tidak ditemukan atau Anda tidak memiliki akses"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": mhs})
}

func TambahMahasiswaBaru(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var m models.Mahasiswa
	var payload struct {
		Email string `json:"email"`
	}

	if err := c.BodyParser(&m); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}
	c.BodyParser(&payload)

	// Force FakultasID if faculty_admin
	if role == "faculty_admin" {
		m.FakultasID = fid
	}

	// --- LOGIKA CEK KAPASITAS (SLOT) ---
	var prodi models.ProgramStudi
	if err := config.DB.First(&prodi, m.ProgramStudiID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Program Studi tidak ditemukan"})
	}

	// Double check: if faculty_admin, prodi must belong to their faculty
	if role == "faculty_admin" && prodi.FakultasID != fid {
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Anda tidak diizinkan menambah mahasiswa ke Program Studi di luar fakultas Anda"})
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
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyiapkan password akun mahasiswa"})
	}

	user := models.User{
		Email:      payload.Email,
		Password:   string(hashedPassword),
		Role:       "mahasiswa",
		FakultasID: &m.FakultasID,
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
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var mhs models.Mahasiswa

	query := config.DB.Preload("Pengguna")
	if role == "faculty_admin" {
		query = query.Where("fakultas_id = ?", fid)
	}

	if err := query.First(&mhs, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Mahasiswa tidak ditemukan atau Anda tidak memiliki akses"})
	}

	var payload struct {
		Email string `json:"email"`
	}
	if err := c.BodyParser(&mhs); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}
	c.BodyParser(&payload)

	tx := config.DB.Begin()

	// Update email if requested
	if payload.Email != "" && payload.Email != mhs.Pengguna.Email {
		if err := tx.Model(&mhs.Pengguna).Update("email", payload.Email).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui email akun"})
		}
	}

	// Always ensure FakultasID stays correct for faculty_admin
	if role == "faculty_admin" {
		mhs.FakultasID = fid
	}

	if err := tx.Save(&mhs).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui data mahasiswa"})
	}

	tx.Commit()
	return c.JSON(fiber.Map{"status": "success", "message": "Data mahasiswa berhasil diperbarui", "data": mhs})
}

func HapusDataMahasiswa(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var mhs models.Mahasiswa

	query := config.DB
	if role == "faculty_admin" {
		query = query.Where("fakultas_id = ?", fid)
	}

	if err := query.First(&mhs, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Mahasiswa tidak ditemukan atau Anda tidak memiliki akses"})
	}

	penggunaID := mhs.PenggunaID
	tx := config.DB.Begin()

	if err := tx.Delete(&mhs).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus profil mahasiswa"})
	}

	if err := tx.Delete(&models.User{}, penggunaID).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus akun mahasiswa"})
	}

	tx.Commit()
	return c.JSON(fiber.Map{"status": "success", "message": "Mahasiswa dan akun berhasil dihapus"})
}

// --- FAKULTAS & PRODI ---

func AmbilDaftarFakultas(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var f = []models.Fakultas{}
	query := config.DB
	if role == "faculty_admin" {
		query = query.Where("id = ?", fid)
	}

	query.Find(&f)
	return c.JSON(fiber.Map{"status": "success", "data": f})
}

func AmbilDaftarProdi(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var p = []models.ProgramStudi{}
	query := config.DB.Preload("Fakultas")
	if role == "faculty_admin" {
		query = query.Where("fakultas_id = ?", fid)
	}
	query.Find(&p)

	// Hitung jumlah mahasiswa untuk setiap prodi (Slot)
	for i := range p {
		var count int64
		config.DB.Model(&models.Mahasiswa{}).Where("program_studi_id = ?", p[i].ID).Count(&count)
		p[i].CurrentMahasiswa = count
	}

	return c.JSON(fiber.Map{"status": "success", "data": p})
}

func TambahProdiBaru(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var p models.ProgramStudi
	if err := c.BodyParser(&p); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}

	// Force FakultasID if faculty_admin
	if role == "faculty_admin" {
		p.FakultasID = fid
	}

	if err := config.DB.Create(&p).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menambah Program Studi"})
	}
	return c.Status(201).JSON(fiber.Map{"status": "success", "data": p})
}

func PerbaruiProdi(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var p models.ProgramStudi

	query := config.DB
	if role == "faculty_admin" {
		query = query.Where("fakultas_id = ?", fid)
	}

	if err := query.First(&p, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Prodi tidak ditemukan atau Anda tidak memiliki akses"})
	}

	if err := c.BodyParser(&p); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}

	// Force FakultasID if faculty_admin
	if role == "faculty_admin" {
		p.FakultasID = fid
	}

	config.DB.Save(&p)
	return c.JSON(fiber.Map{"status": "success", "message": "Data prodi berhasil diperbarui", "data": p})
}

func HapusProdi(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var p models.ProgramStudi

	query := config.DB
	if role == "faculty_admin" {
		query = query.Where("fakultas_id = ?", fid)
	}

	if err := query.First(&p, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Prodi tidak ditemukan atau Anda tidak memiliki akses"})
	}

	config.DB.Delete(&p)
	return c.JSON(fiber.Map{"status": "success", "message": "Program Studi berhasil dihapus"})
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

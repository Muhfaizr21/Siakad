package mahasiswa

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)


// GetList returns all organisation history for the logged-in student
func GetList(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}
	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var list []models.RiwayatOrganisasi
	config.DB.Preload("Prestasi").Where("mahasiswa_id = ?", student.ID).Order("periode_mulai desc").Find(&list)

	return c.JSON(fiber.Map{"success": true, "data": list})
}

type OrgRequest struct {
	NamaOrganisasi    string `json:"nama_organisasi"`
	Tipe              string `json:"tipe"`
	Jabatan           string `json:"jabatan"`
	PeriodeMulai      int    `json:"periode_mulai"`
	PeriodeSelesai    *int   `json:"periode_selesai"`
	DeskripsiKegiatan string `json:"deskripsi_kegiatan"`
	Apresiasi         string `json:"apresiasi"`
}

// Create adds a new organisation record
func Create(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}
	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var req OrgRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format request tidak valid"})
	}

	rec := models.RiwayatOrganisasi{
		MahasiswaID:       student.ID,
		NamaOrganisasi:    req.NamaOrganisasi,
		Tipe:              req.Tipe,
		Jabatan:           req.Jabatan,
		PeriodeMulai:      req.PeriodeMulai,
		PeriodeSelesai:    req.PeriodeSelesai,
		DeskripsiKegiatan: req.DeskripsiKegiatan,
		Apresiasi:         req.Apresiasi,
		StatusVerifikasi:  "Menunggu",
	}

	if err := config.DB.Create(&rec).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menambah riwayat organisasi"})
	}

	return c.Status(201).JSON(fiber.Map{"success": true, "data": rec})
}

// Update modifies an existing organisation record
func Update(c *fiber.Ctx) error {
	id := c.Params("id")
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}
	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var rec models.RiwayatOrganisasi
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", id, student.ID).First(&rec).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}

	var req OrgRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format request tidak valid"})
	}

	rec.NamaOrganisasi = req.NamaOrganisasi
	rec.Tipe = req.Tipe
	rec.Jabatan = req.Jabatan
	rec.PeriodeMulai = req.PeriodeMulai
	rec.PeriodeSelesai = req.PeriodeSelesai
	rec.DeskripsiKegiatan = req.DeskripsiKegiatan
	rec.Apresiasi = req.Apresiasi

	if err := config.DB.Save(&rec).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan perubahan"})
	}

	return c.JSON(fiber.Map{"success": true, "data": rec})
}

// Delete removes a record
func Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}
	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var rec models.RiwayatOrganisasi
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", id, student.ID).First(&rec).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}

	config.DB.Delete(&rec)
	return c.JSON(fiber.Map{"success": true, "message": "Riwayat organisasi berhasil dihapus"})
}

// GetOrmawaList returns all active Ormawas
func GetOrmawaList(c *fiber.Ctx) error {
	var list []models.Ormawa
	if err := config.DB.Where("status = ?", "Aktif").Order("nama asc").Find(&list).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil data Ormawa"})
	}
	return c.JSON(fiber.Map{"success": true, "data": list})
}

// DaftarOrmawa registers a student to an Ormawa
func DaftarOrmawa(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var req struct {
		OrmawaID uint   `json:"ormawa_id"`
		Divisi   string `json:"divisi"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload request tidak valid"})
	}

	if req.OrmawaID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Ormawa ID wajib diisi"})
	}

	// Check if already registered (either pending or active)
	var count int64
	config.DB.Model(&models.OrmawaAnggota{}).Where("mahasiswa_id = ? AND ormawa_id = ? AND status IN ?", student.ID, req.OrmawaID, []string{"aktif", "pending"}).Count(&count)
	if count > 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Anda sudah terdaftar atau memiliki pendaftaran pending di Ormawa ini"})
	}

	div := req.Divisi
	if div == "" {
		div = "Umum"
	}

	now := time.Now()
	anggota := models.OrmawaAnggota{
		OrmawaID:    req.OrmawaID,
		MahasiswaID: student.ID,
		Role:        "Anggota",
		Divisi:      div,
		Status:      "pending",
		JoinedAt:    now,
	}

	if err := config.DB.Create(&anggota).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengajukan pendaftaran"})
	}

	return c.Status(201).JSON(fiber.Map{"success": true, "message": "Pendaftaran berhasil dikirim, menunggu persetujuan admin Ormawa", "data": anggota})
}

// GetPendaftaranList returns registration history for the student
func GetPendaftaranList(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var list []models.OrmawaAnggota
	if err := config.DB.Preload("Ormawa").Where("mahasiswa_id = ?", student.ID).Order("created_at desc").Find(&list).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil data pendaftaran"})
	}

	return c.JSON(fiber.Map{"success": true, "data": list})
}

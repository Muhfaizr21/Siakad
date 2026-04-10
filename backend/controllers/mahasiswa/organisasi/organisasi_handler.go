package organisasi

import (
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

func getUserID(c *fiber.Ctx) (uint, error) {
	v, ok := c.Locals("user_id").(uint)
	if !ok || v == 0 {
		return 0, fiber.NewError(fiber.StatusUnauthorized, "User tidak terautentikasi")
	}
	return v, nil
}

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

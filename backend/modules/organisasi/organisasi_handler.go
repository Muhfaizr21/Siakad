package organisasi

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GetList returns all organisation history for the logged-in student
func GetList(c *fiber.Ctx) error {
	userID := c.Locals("user_id")
	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var list []models.RiwayatOrganisasi
	config.DB.Where("student_id = ?", student.ID).Order("periode_mulai desc").Find(&list)

	return c.JSON(fiber.Map{"success": true, "data": list})
}

// Create adds a new organisation record
func Create(c *fiber.Ctx) error {
	userID := c.Locals("user_id")
	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
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

	var req OrgRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format request tidak valid"})
	}

	if req.NamaOrganisasi == "" || req.Jabatan == "" || req.PeriodeMulai == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Nama organisasi, jabatan, dan periode mulai wajib diisi"})
	}
	if req.PeriodeSelesai != nil && *req.PeriodeSelesai < req.PeriodeMulai {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Periode selesai harus lebih besar dari periode mulai"})
	}

	rec := models.RiwayatOrganisasi{
		StudentID:         student.ID,
		NamaOrganisasi:    req.NamaOrganisasi,
		Tipe:              req.Tipe,
		Jabatan:           req.Jabatan,
		PeriodeMulai:      req.PeriodeMulai,
		PeriodeSelesai:    req.PeriodeSelesai,
		DeskripsiKegiatan: req.DeskripsiKegiatan,
		Apresiasi:         req.Apresiasi,
		StatusVerifikasi:  "Menunggu",
		CreatedAt:         time.Now(),
	}

	if err := config.DB.Create(&rec).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menambah riwayat organisasi"})
	}

	return c.Status(201).JSON(fiber.Map{"success": true, "data": rec})
}

// Update edits an existing record (only if status is Menunggu)
func Update(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user_id")
	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var rec models.RiwayatOrganisasi
	if err := config.DB.Where("id = ? AND student_id = ?", id, student.ID).First(&rec).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}
	if rec.StatusVerifikasi != "Menunggu" {
		return c.Status(403).JSON(fiber.Map{"success": false, "message": "Data yang sudah diverifikasi tidak dapat diubah"})
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
	var req OrgRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format request tidak valid"})
	}
	if req.PeriodeSelesai != nil && *req.PeriodeSelesai < req.PeriodeMulai {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Periode selesai harus lebih besar dari periode mulai"})
	}

	rec.NamaOrganisasi = req.NamaOrganisasi
	rec.Tipe = req.Tipe
	rec.Jabatan = req.Jabatan
	rec.PeriodeMulai = req.PeriodeMulai
	rec.PeriodeSelesai = req.PeriodeSelesai
	rec.DeskripsiKegiatan = req.DeskripsiKegiatan
	rec.Apresiasi = req.Apresiasi
	config.DB.Save(&rec)

	return c.JSON(fiber.Map{"success": true, "data": rec})
}

// Delete removes a record (only if status is Menunggu)
func Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user_id")
	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var rec models.RiwayatOrganisasi
	if err := config.DB.Where("id = ? AND student_id = ?", id, student.ID).First(&rec).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}
	if rec.StatusVerifikasi != "Menunggu" {
		return c.Status(403).JSON(fiber.Map{"success": false, "message": "Data yang sudah diverifikasi tidak dapat dihapus"})
	}

	config.DB.Delete(&rec)
	return c.JSON(fiber.Map{"success": true, "message": "Riwayat organisasi berhasil dihapus"})
}

package achievement

import (
	"fmt"
	"os"
	"path/filepath"
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func getUserID(c *fiber.Ctx) (uint, error) {
	v, ok := c.Locals("user_id").(uint)
	if !ok || v == 0 {
		return 0, fiber.NewError(fiber.StatusUnauthorized, "User tidak terautentikasi")
	}
	return v, nil
}

// GetAchievements returns paginated achievements and total stats for an individual student
func GetAchievements(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	search := c.Query("search", "")

	// Base Query
	query := config.DB.Model(&models.Prestasi{}).Where("mahasiswa_id = ?", student.ID)

	if search != "" {
		query = query.Where("nama_kegiatan LIKE ?", "%"+search+"%")
	}

	var totalReported, verifiedCount, pendingCount int64
	// Stats for all achievements (ignoring search)
	config.DB.Model(&models.Prestasi{}).Where("mahasiswa_id = ?", student.ID).Count(&totalReported)
	config.DB.Model(&models.Prestasi{}).Where("mahasiswa_id = ? AND status = ?", student.ID, "Diverifikasi").Count(&verifiedCount)
	config.DB.Model(&models.Prestasi{}).Where("mahasiswa_id = ? AND status = ?", student.ID, "Menunggu").Count(&pendingCount)

	// Fetch List
	var achievements []models.Prestasi
	query.Order("created_at desc").Find(&achievements)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"stats": fiber.Map{
				"total":    totalReported,
				"verified": verifiedCount,
				"pending":  pendingCount,
			},
			"list": achievements,
		},
	})
}

// CreateAchievement handles new achievement submissions with file upload
func CreateAchievement(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	namaKegiatan := c.FormValue("nama_kegiatan")
	kategori := c.FormValue("kategori")
	tingkat := c.FormValue("tingkat")
	peringkat := c.FormValue("peringkat")

	if namaKegiatan == "" || tingkat == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Field nama kegiatan dan tingkat wajib diisi"})
	}

	// Handle File Upload
	file, err := c.FormFile("bukti")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "File bukti wajib diunggah"})
	}

	// Validate File Size (Max 5MB)
	if file.Size > 5*1024*1024 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Ukuran file melebihi 5MB"})
	}

	// Validate Extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".pdf" && ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format file hanya boleh PDF, JPG, atau PNG"})
	}

	// Buat direktori jika belum ada
	uploadDir := "./uploads/achievements"
	_ = os.MkdirAll(uploadDir, os.ModePerm)

	fileId := uuid.New().String()
	fileOutputName := fmt.Sprintf("%s%s", fileId, ext)
	savePath := filepath.Join(uploadDir, fileOutputName)

	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan file"})
	}

	buktiURL := "/uploads/achievements/" + fileOutputName

	achievement := models.Prestasi{
		MahasiswaID:  student.ID,
		NamaKegiatan: namaKegiatan,
		Kategori:     kategori,
		Tingkat:      tingkat,
		Peringkat:    peringkat,
		BuktiURL:     buktiURL,
		Status:       "Menunggu",
		Poin:         0, // Default for now
	}

	config.DB.Create(&achievement)

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Prestasi berhasil dilaporkan",
		"data":    achievement,
	})
}

// GetAchievementDetail returns single achievement data
func GetAchievementDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var achievement models.Prestasi
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", id, student.ID).First(&achievement).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    achievement,
	})
}

// DeleteAchievement deletes an achievement ONLY if its status is Menunggu
func DeleteAchievement(c *fiber.Ctx) error {
	id := c.Params("id")
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var achievement models.Prestasi
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", id, student.ID).First(&achievement).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}

	if achievement.Status != "Menunggu" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Hanya prestasi dengan status Menunggu yang dapat dihapus"})
	}

	config.DB.Delete(&achievement)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Prestasi berhasil dihapus",
	})
}

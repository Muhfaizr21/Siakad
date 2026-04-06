package achievement

import (
	"fmt"
	"os"
	"path/filepath"
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetAchievements returns paginated achievements and total stats for an individual student
func GetAchievements(c *fiber.Ctx) error {
	userID := c.Locals("user_id")

	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	search := c.Query("search", "")

	// Base Query
	query := config.DB.Model(&models.Achievement{}).Where("student_id = ?", student.ID)

	if search != "" {
		query = query.Where("nama_lomba ILIKE ?", "%"+search+"%")
	}

	var totalReported, verifiedCount, pendingCount int64
	// Stats for all achievements (ignoring search)
	config.DB.Model(&models.Achievement{}).Where("student_id = ?", student.ID).Count(&totalReported)
	config.DB.Model(&models.Achievement{}).Where("student_id = ? AND status = ?", student.ID, "Diverifikasi").Count(&verifiedCount)
	config.DB.Model(&models.Achievement{}).Where("student_id = ? AND status = ?", student.ID, "Menunggu").Count(&pendingCount)

	// Fetch List
	var achievements []models.Achievement
	query.Order("created_at desc").Find(&achievements)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"stats": fiber.Map{
				"total":         totalReported,
				"verified":      verifiedCount,
				"pending":       pendingCount,
			},
			"list": achievements,
		},
	})
}

// CreateAchievement handles new achievement submissions with file upload
func CreateAchievement(c *fiber.Ctx) error {
	userID := c.Locals("user_id")

	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	namaLomba := c.FormValue("nama_lomba")
	kategori := c.FormValue("kategori")
	penyelenggara := c.FormValue("penyelenggara")
	tingkat := c.FormValue("tingkat")
	tanggalStr := c.FormValue("tanggal")
	peringkat := c.FormValue("peringkat")

	if namaLomba == "" || tingkat == "" || penyelenggara == "" || tanggalStr == "" || peringkat == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Semua field teks harus diisi"})
	}

	tanggal, err := time.Parse("2006-01-02", tanggalStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format tanggal salah (YYYY-MM-DD)"})
	}

	// Handle File Upload
	file, err := c.FormFile("sertifikat")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "File sertifikat wajib diunggah"})
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
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuat direktori sistem"})
	}

	fileId := uuid.New().String()
	filename := fmt.Sprintf("%s%s", fileId, ext)
	savePath := filepath.Join(uploadDir, filename)

	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan file"})
	}

	// Relative Public URL (akan dihost oleh fiber static route)
	sertifikatURL := "/uploads/achievements/" + filename

	achievement := models.Achievement{
		StudentID:     student.ID,
		NamaLomba:     namaLomba,
		Kategori:      kategori,
		Penyelenggara: penyelenggara,
		Tingkat:       tingkat,
		Tanggal:       tanggal,
		Peringkat:     peringkat,
		SertifikatURL: sertifikatURL,
		Status:        "Menunggu",
		CreatedAt:     time.Now(),
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
	userID := c.Locals("user_id")

	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var achievement models.Achievement
	if err := config.DB.Where("id = ? AND student_id = ?", id, student.ID).First(&achievement).Error; err != nil {
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
	userID := c.Locals("user_id")

	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var achievement models.Achievement
	if err := config.DB.Where("id = ? AND student_id = ?", id, student.ID).First(&achievement).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}

	if achievement.Status != "Menunggu" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Hanya presatsi dengan status Menunggu yang dapat dihapus"})
	}

	config.DB.Delete(&achievement)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Prestasi berhasil dihapus",
	})
}

// ExportSimkatmawa generates a CSV mock response for Kemendikbud Reporting (for admin ideally, but placed here for dummy)
func ExportSimkatmawa(c *fiber.Ctx) error {
	// Di skenario asli fungsi ini butuh otorisasi (Role Admin), namun untuk demonstrasi
	// kita mengekspor data yang sudah Diverifikasi saja dari seluruh mahasiswa.
	
	type SimkatmawaDump struct {
		NamaMahasiswa string    `json:"nama_mahasiswa"`
		NIM           string    `json:"nim"`
		ProgramStudi  string    `json:"prodi"`
		NamaLomba     string    `json:"nama_lomba"`
		Tingkat       string    `json:"tingkat"`
		Peringkat     string    `json:"peringkat"`
		Penyelenggara string    `json:"penyelenggara"`
		Tanggal       time.Time `json:"tanggal"`
	}

	var results []SimkatmawaDump
	config.DB.Table("achievements").
		Select("users.name as nama_mahasiswa, students.nim, majors.name as program_studi, achievements.nama_lomba, achievements.tingkat, achievements.peringkat, achievements.penyelenggara, achievements.tanggal").
		Joins("left join students on students.id = achievements.student_id").
		Joins("left join users on users.id = students.user_id").
		Joins("left join majors on majors.id = students.major_id").
		Where("achievements.status = ?", "Diverifikasi").
		Scan(&results)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    results, // Output raw json mapped to Simkatmawa
	})
}

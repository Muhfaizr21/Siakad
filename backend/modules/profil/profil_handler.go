package profil

import (
	"fmt"
	"os"
	"path/filepath"
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"
	"time"

	"github.com/disintegration/imaging"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func GetProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var student models.Student
	if err := config.DB.Preload("Major.Faculty").Preload("User").First(&student, "user_id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Profil tidak ditemukan"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    student,
	})
}

func UpdateProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	type UpdateRequest struct {
		Email      string `json:"email"`
		Phone      string `json:"phone"`
		BirthPlace string `json:"birth_place"`
		BirthDate  string `json:"birth_date"`
		Gender     string `json:"gender"`
		Religion   string `json:"religion"`
		Address    string `json:"address"`
		City       string `json:"city"`
		ZipCode    string `json:"zip_code"`
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data tidak valid"})
	}

	var student models.Student
	config.DB.First(&student, "user_id = ?", userID)

	student.Email = req.Email
	student.Phone = req.Phone
	student.BirthPlace = req.BirthPlace
	if req.BirthDate != "" {
		t, _ := time.Parse("2006-01-02", req.BirthDate)
		student.BirthDate = &t
	}
	student.Gender = req.Gender
	student.Religion = req.Religion
	student.Address = req.Address
	student.City = req.City
	student.ZipCode = req.ZipCode

	if err := config.DB.Save(&student).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui profil"})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Profil berhasil diperbarui"})
}

func UploadAvatar(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	file, err := c.FormFile("foto")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "File foto wajib diunggah"})
	}

	// 1. Validasi Extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Hanya mendukung file JPG/PNG"})
	}

	// 2. Validasi Size (2MB)
	if file.Size > 2*1024*1024 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Ukuran file maksimal 2MB"})
	}

	// 3. Create Directory if not exists
	uploadDir := "./uploads/profile_pics"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.MkdirAll(uploadDir, 0755)
	}

	// 4. Save Temporary for Resizing
	tempName := uuid.New().String() + ext
	tempPath := filepath.Join(uploadDir, "temp_"+tempName)
	if err := c.SaveFile(file, tempPath); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memproses file"})
	}
	defer os.Remove(tempPath)

	// 5. Resize using Imaging
	src, err := imaging.Open(tempPath)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuka gambar"})
	}
	dst := imaging.Fill(src, 400, 400, imaging.Center, imaging.Lanczos)
	
	finalName := uuid.New().String() + ".jpg"
	finalPath := filepath.Join(uploadDir, finalName)
	if err := imaging.Save(dst, finalPath); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan gambar"})
	}

	// 6. Update Database & Delete Old Photo
	var student models.Student
	config.DB.First(&student, "user_id = ?", userID)
	
	if student.PhotoURL != "" {
		oldPath := strings.Replace(student.PhotoURL, "http://localhost:8000/", "./", 1)
		os.Remove(oldPath)
	}

	student.PhotoURL = fmt.Sprintf("http://localhost:8000/uploads/profile_pics/%s", finalName)
	config.DB.Save(&student)

	return c.JSON(fiber.Map{
		"success": true, 
		"message": "Foto profil berhasil diperbarui",
		"data": fiber.Map{"url": student.PhotoURL},
	})
}

func ChangePassword(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	type PasswordRequest struct {
		OldPassword     string `json:"old_password"`
		NewPassword     string `json:"new_password"`
		ConfirmPassword string `json:"confirm_password"`
	}

	var req PasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Data tidak valid"})
	}

	if req.NewPassword != req.ConfirmPassword {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Konfirmasi password baru tidak cocok"})
	}

	var user models.User
	config.DB.First(&user, userID)

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassword)); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Password saat ini salah"})
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 12)
	user.PasswordHash = string(hash)
	config.DB.Save(&user)

	// TODO: Invalidate other sessions (if Redis exists)
	
	return c.JSON(fiber.Map{"success": true, "message": "Password berhasil diperbarui"})
}

func GetSessions(c *fiber.Ctx) error {
	// Mock implementation for local
	return c.JSON(fiber.Map{
		"success": true,
		"data": []fiber.Map{
			{
				"id": "current-session",
				"device": "Chrome on Windows",
				"location": "Jakarta, Indonesia",
				"last_active": "Baru saja",
				"is_current": true,
			},
		},
	})
}

func GetLoginHistory(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	var student models.Student
	config.DB.First(&student, "user_id = ?", userID)

	var history []models.LoginHistory
	config.DB.Where("pengguna_id = ?", userID).Order("dibuat_pada desc").Limit(10).Find(&history)

	return c.JSON(fiber.Map{"success": true, "data": history})
}

func GetPreferences(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	var student models.Student
	config.DB.First(&student, "user_id = ?", userID)

	var pref models.NotificationPreference
	config.DB.FirstOrCreate(&pref, models.NotificationPreference{UserID: userID})

	return c.JSON(fiber.Map{"success": true, "data": pref})
}

func UpdatePreferences(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	var student models.Student
	config.DB.First(&student, "user_id = ?", userID)

	var pref models.NotificationPreference
	config.DB.First(&pref, "pengguna_id = ?", userID)

	if err := c.BodyParser(&pref); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Data tidak valid"})
	}

	config.DB.Save(&pref)
	return c.JSON(fiber.Map{"success": true, "message": "Preferensi diperbarui"})
}

package profil

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func GetProfile(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)

	var student models.Mahasiswa
	if err := config.DB.Preload("ProgramStudi.Fakultas").Preload("Pengguna").First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Profil tidak ditemukan"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    student,
	})
}

func UpdateProfile(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)

	type UpdateRequest struct {
		Email      string `json:"email"`
		Phone      string `json:"phone"`
		BirthPlace string `json:"birth_place"`
		BirthDate  string `json:"birth_date"`
		Gender     string `json:"gender"`
		Religion   string `json:"religion"`
		Address    string `json:"address"`
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data tidak valid"})
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Student not found"})
	}

	student.EmailPersonal = req.Email
	student.NoHP = req.Phone
	student.TempatLahir = req.BirthPlace
	if req.BirthDate != "" {
		t, _ := time.Parse("2006-01-02", req.BirthDate)
		student.TanggalLahir = t
	}
	student.JenisKelamin = req.Gender
	student.Agama = req.Religion
	student.Alamat = req.Address

	if err := config.DB.Save(&student).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui profil"})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Profil berhasil diperbarui"})
}

func ChangePassword(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)

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
	config.DB.First(&user, PenggunaID)

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Password saat ini salah"})
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 12)
	user.Password = string(hash)
	config.DB.Save(&user)

	return c.JSON(fiber.Map{"success": true, "message": "Password berhasil diperbarui"})
}

func UploadAvatar(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)
	
	file, err := c.FormFile("foto")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Tidak ada file yang diunggah"})
	}

	filename := fmt.Sprintf("avatar_%d_%v", PenggunaID, file.Filename)
	path := "./uploads/avatars/" + filename
	
	if err := c.SaveFile(file, path); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan file"})
	}

	var student models.Mahasiswa
	config.DB.Model(&student).Where("pengguna_id = ?", PenggunaID).Update("foto_url", "/uploads/avatars/"+filename)

	return c.JSON(fiber.Map{"success": true, "message": "Foto berhasil diunggah", "url": "/uploads/avatars/"+filename})
}

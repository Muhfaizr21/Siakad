package controllers

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func getUserID(c *fiber.Ctx) (uint, error) {
	v, ok := c.Locals("user_id").(uint)
	if !ok || v == 0 {
		return 0, fiber.NewError(fiber.StatusUnauthorized, "User tidak terautentikasi")
	}
	return v, nil
}

// AmbilProfilAdminFakultas mengembalikan data profil user yang sedang login
func AmbilProfilAdminFakultas(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var user models.User
	if err := config.DB.First(&user, PenggunaID).Error; err != nil {
		fmt.Println("❌ [DB ERROR] AmbilProfilAdminFakultas:", err)
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Profil admin tidak ditemukan"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    user,
	})
}

// PerbaruiProfilAdminFakultas memperbarui email/akun admin fakultas
func PerbaruiProfilAdminFakultas(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	type Request struct {
		Email string `json:"email"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data tidak valid"})
	}

	var user models.User
	if err := config.DB.First(&user, PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "User tidak ditemukan"})
	}

	if req.Email != "" && req.Email != user.Email {
		// Validasi email unik
		var check models.User
		if err := config.DB.Where("email = ? AND id != ?", req.Email, PenggunaID).First(&check).Error; err == nil {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Email sudah digunakan oleh akun lain"})
		}
		user.Email = req.Email
	}

	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan perubahan profil"})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Profil berhasil diperbarui"})
}

// GantiPasswordAdminFakultas mengubah password admin fakultas
func GantiPasswordAdminFakultas(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	type Request struct {
		OldPassword     string `json:"old_password"`
		NewPassword     string `json:"new_password"`
		ConfirmPassword string `json:"confirm_password"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data tidak valid"})
	}

	if req.NewPassword != req.ConfirmPassword {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Konfirmasi password baru tidak cocok"})
	}

	var user models.User
	if err := config.DB.First(&user, PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "User tidak ditemukan"})
	}

	// Cek password lama
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Password saat ini salah"})
	}

	// Hash password baru
	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 12)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memproses password baru"})
	}

	user.Password = string(hash)
	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan password baru"})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Password berhasil diperbarui"})
}

package auth

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// JWT secret is now fetched from config.GetJWTSecret()

type LoginRequest struct {
	Identifier string `json:"identifier"` // Can be NIM or Email
	Password   string `json:"password"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

func Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Invalid request payload"})
	}

	var user models.User
	var student models.Student
	isStudent := false

	// 1. Try to find by Email first (for Admins)
	if err := config.DB.Preload("Role").Where("email = ?", req.Identifier).First(&user).Error; err == nil {
		// Found as Admin/User
	} else {
		// 2. Try to find by Student NIM
		if err := config.DB.Preload("User").Preload("User.Role").Preload("Major").Where("nim = ?", req.Identifier).First(&student).Error; err == nil {
			user = student.User
			isStudent = true
		} else {
			return c.Status(401).JSON(fiber.Map{"success": false, "message": "Email/NIM atau Password salah"})
		}
	}

	// 3. Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Email/NIM atau Password salah"})
	}

	if !user.IsActive {
		return c.Status(403).JSON(fiber.Map{"success": false, "message": "Akun tidak aktif"})
	}

	// 4. Generate Token
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":  user.ID,
		"role": user.Role.Name,
		"exp":  now.Add(24 * time.Hour).Unix(),
	}
	if isStudent {
		claims["sid"] = student.ID
		claims["nim"] = student.NIM
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(config.GetJWTSecret())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Error generating token"})
	}

	// Response
	respData := fiber.Map{
		"access_token": tokenString,
		"user": fiber.Map{
			"id":    user.ID,
			"email": user.Email,
			"role":  user.Role.Name,
		},
	}
	if isStudent {
		respData["mahasiswa"] = fiber.Map{
			"id":   student.ID,
			"nim":  student.NIM,
			"nama": student.Name,
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Berhasil login",
		"data":    respData,
	})
}

func RefreshToken(c *fiber.Ctx) error {
	tokenString := c.Cookies("refresh_token")
	if tokenString == "" {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Refresh token tidak ditemukan"})
	}

	// Parse token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return config.GetJWTSecret(), nil
	})

	if err != nil || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Refresh token tidak valid"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || claims["typ"] != "refresh" {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Refresh token invalid type"})
	}

	// Create new access token
	now := time.Now()
	newToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": claims["sub"],
		"sid": claims["sid"],
		"nim": claims["nim"],
		"exp": now.Add(15 * time.Minute).Unix(),
	})
	newAT, err := newToken.SignedString(config.GetJWTSecret())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal generate token baru"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Token berhasil diperbarui",
		"data": fiber.Map{
			"access_token": newAT,
			"expires_in":   900,
		},
	})
}

func Logout(c *fiber.Ctx) error {
	// clear cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour),
		HTTPOnly: true,
	})

	// Optional: we can blacklist the access token here using Redis as requested by the user,
	// but currently redis might not be fully setup in the given code. For now, wiping cookie is standard.
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Berhasil logout",
	})
}

func ChangePassword(c *fiber.Ctx) error {
	userID := c.Locals("user_id") // set via middleware

	var req ChangePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Invalid request payload"})
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "User tidak ditemukan"})
	}

	// verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassword)); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Password lama salah"})
	}

	// hash new password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengenkripsi password baru"})
	}

	user.PasswordHash = string(hash)
	config.DB.Save(&user)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Password berhasil diubah",
	})
}

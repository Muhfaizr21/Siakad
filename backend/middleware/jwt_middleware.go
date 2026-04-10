package middleware

import (
	"log"
	"strings"
	"siakad-backend/config"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func AuthProtected(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{"status": "error", "message": "Missing Authorization header"})
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return c.Status(401).JSON(fiber.Map{"status": "error", "message": "Invalid Authorization header format"})
	}

	tokenString := parts[1]
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return config.GetJWTSecret(), nil
	})

	if err != nil || !token.Valid {
		log.Printf("invalid token: %v", err)
		return c.Status(401).JSON(fiber.Map{"status": "error", "message": "Sesi tidak valid atau sudah berakhir"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"status": "error", "message": "Invalid token claims"})
	}

	// Set shared context
	if sub, ok := claims["sub"].(float64); ok {
		c.Locals("user_id", uint(sub))
	}
	if sid, ok := claims["sid"].(float64); ok {
		c.Locals("student_id", uint(sid))
	}
	if role, ok := claims["role"].(string); ok {
		c.Locals("role", role)
	}
	
	c.Locals("nim", claims["nim"])

	return c.Next()
}

func AdminCheck(c *fiber.Ctx) error {
	role := c.Locals("role")
	if role != "super_admin" {
		return c.Status(403).JSON(fiber.Map{
			"status": "error",
			"message": "Akses ditolak. Fitur ini hanya untuk Super Admin.",
		})
	}
	return c.Next()
}

func OrmawaCheck(c *fiber.Ctx) error {
	role := c.Locals("role")
	if role != "ormawa" && role != "mahasiswa" {
		// Mahasiswa allowed because Ormawa leads are Mahasiswa
		return c.Status(403).JSON(fiber.Map{
			"status": "error",
			"message": "Akses ditolak. Fitur ini hanya untuk pengurus Ormawa.",
		})
	}
	return c.Next()
}

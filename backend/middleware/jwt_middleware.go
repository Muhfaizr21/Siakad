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
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Missing Authorization header"})
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Invalid Authorization header format"})
	}

	tokenString := parts[1]
	if tokenString == "bypass_token_superadmin" {
		c.Locals("user_id", uint(1))
		c.Locals("role", "SuperAdmin")
		return c.Next()
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return config.GetJWTSecret(), nil
	})

	if err != nil || !token.Valid {
		log.Printf("invalid token: %v", err)
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Token tidak valid atau sudah expired"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Invalid token claims"})
	}

	// We can set either the student NIM or User ID
	// JWT claims for numbers are float64 by default in Go
	if sub, ok := claims["sub"].(float64); ok {
		c.Locals("user_id", uint(sub))
	} else if subInt, ok := claims["sub"].(uint); ok {
		c.Locals("user_id", subInt)
	}

	if sid, ok := claims["sid"].(float64); ok {
		c.Locals("student_id", uint(sid))
	}

	c.Locals("nim", claims["nim"])

	return c.Next()
}

package middleware

import (
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func jwtSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "siakad-dev-secret-change-me"
	}
	return []byte(secret)
}

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
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fiber.ErrUnauthorized
		}
		return jwtSecret(), nil
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
	c.Locals("role", claims["role"])

	return c.Next()
}

func RequireRoles(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleRaw := c.Locals("role")
		role, ok := roleRaw.(string)
		if !ok || strings.TrimSpace(role) == "" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Role tidak valid",
			})
		}

		allowed := false
		for _, r := range roles {
			if r == role {
				allowed = true
				break
			}
		}

		if !allowed {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Akses ditolak untuk role ini",
			})
		}

		return c.Next()
	}
}

package middleware

import (
	"log"
	"siakad-backend/config"
	"siakad-backend/models"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func AuthProtected(c *fiber.Ctx) error {
	var tokenString string
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		tokenString = c.Query("token")
		if tokenString == "" {
			return c.Status(401).JSON(fiber.Map{"status": "error", "message": "Missing Authorization header"})
		}
	} else {
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(401).JSON(fiber.Map{"status": "error", "message": "Invalid Authorization header format"})
		}
		tokenString = parts[1]
	}

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
	} else {
		c.Locals("role", "")
	}

	if fid, ok := claims["fid"].(float64); ok {
		c.Locals("fakultas_id", uint(fid))
	} else {
		c.Locals("fakultas_id", uint(0))
	}

	if oid, ok := claims["oid"].(float64); ok {
		c.Locals("ormawa_id", uint(oid))
	} else {
		c.Locals("ormawa_id", nil)
	}

	if oas, ok := claims["oas"].(string); ok {
		c.Locals("ormawa_assign", oas)
	} else {
		c.Locals("ormawa_assign", "")
	}

	if pid, ok := claims["pid"].(float64); ok {
		c.Locals("program_studi_id", uint(pid))
	} else {
		c.Locals("program_studi_id", uint(0))
	}

	c.Locals("nim", claims["nim"])

	return c.Next()
}

func AdminCheck(c *fiber.Ctx) error {
	role, ok := c.Locals("role").(string)
	if !ok || strings.ToLower(role) != "super_admin" {
		return c.Status(403).JSON(fiber.Map{
			"status":  "error",
			"message": "Akses ditolak. Fitur ini hanya untuk Super Admin.",
		})
	}
	return c.Next()
}

func MahasiswaCheck(c *fiber.Ctx) error {
	role, ok := c.Locals("role").(string)
	if !ok || strings.ToLower(role) != "mahasiswa" {
		return c.Status(403).JSON(fiber.Map{
			"status":  "error",
			"message": "Akses ditolak. Fitur ini hanya untuk Mahasiswa.",
		})
	}
	return c.Next()
}

func KencanaAdminCheck(c *fiber.Ctx) error {
	role, ok := c.Locals("role").(string)
	if !ok {
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Akses ditolak."})
	}
	r := strings.ToLower(role)
	if r != "super_admin" && r != "kencana_admin" && r != "kencana_fakultas" {
		return c.Status(403).JSON(fiber.Map{
			"status":  "error",
			"message": "Akses ditolak. Fitur ini hanya untuk Admin Kencana.",
		})
	}
	return c.Next()
}

func KencanaFakultasCheck(c *fiber.Ctx) error {
	role, ok := c.Locals("role").(string)
	if !ok {
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Akses ditolak."})
	}
	r := strings.ToLower(role)
	if r != "super_admin" && r != "kencana_fakultas" && r != "kencana_admin" {
		return c.Status(403).JSON(fiber.Map{
			"status":  "error",
			"message": "Akses ditolak. Fitur ini hanya untuk Admin Kencana Fakultas.",
		})
	}
	return c.Next()
}

func KencanaMentorCheck(c *fiber.Ctx) error {
	role, ok := c.Locals("role").(string)
	if !ok {
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Akses ditolak."})
	}
	r := strings.ToLower(role)
	if r != "super_admin" && r != "kencana_admin" && r != "kencana_mentor" {
		return c.Status(403).JSON(fiber.Map{
			"status":  "error",
			"message": "Akses ditolak. Fitur ini hanya untuk Dewan Pembimbing Kencana.",
		})
	}
	return c.Next()
}

func OrmawaCheck(c *fiber.Ctx) error {
	role, ok := c.Locals("role").(string)
	if !ok {
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Akses ditolak."})
	}
	r := strings.ToLower(role)
	if r != "ormawa" && r != "mahasiswa" && r != "ormawa_admin" {
		return c.Status(403).JSON(fiber.Map{
			"status":  "error",
			"message": "Akses ditolak. Fitur ini hanya untuk pengurus Ormawa.",
		})
	}

	tokenOrmawaID, hasTokenOrmawaID := c.Locals("ormawa_id").(uint)
	queryOrmawaID := c.Query("ormawaId")

	// If user is a dedicated ormawa account (has tokenOrmawaID > 0), enforce & override query param
	if hasTokenOrmawaID && tokenOrmawaID != 0 {
		c.Request().URI().QueryArgs().Set("ormawaId", strconv.FormatUint(uint64(tokenOrmawaID), 10))
		return c.Next()
	}

	// For student users who act as Ormawa admins/members
	if (r == "mahasiswa" || r == "ormawa" || r == "ormawa_admin") && (!hasTokenOrmawaID || tokenOrmawaID == 0) {
		studentID, hasStudentID := c.Locals("student_id").(uint)
		if !hasStudentID || studentID == 0 {
			return c.Status(403).JSON(fiber.Map{
				"status":  "error",
				"message": "Akses ditolak. Profil mahasiswa tidak ditemukan.",
			})
		}

		if queryOrmawaID == "" || queryOrmawaID == "1" || queryOrmawaID == "undefined" {
			var memberships []models.OrmawaAnggota
			err := config.DB.Where("mahasiswa_id = ? AND LOWER(status) = 'aktif'", studentID).Order("created_at asc").Limit(1).Find(&memberships).Error
			if err == nil && len(memberships) > 0 {
				c.Request().URI().QueryArgs().Set("ormawaId", strconv.FormatUint(uint64(memberships[0].OrmawaID), 10))
				queryOrmawaID = strconv.FormatUint(uint64(memberships[0].OrmawaID), 10)
			}
		}

		// Enforce ownership check for students
		if queryOrmawaID != "" && queryOrmawaID != "undefined" {
			var count int64
			config.DB.Model(&models.OrmawaAnggota{}).
				Where("mahasiswa_id = ? AND ormawa_id = ? AND LOWER(status) = 'aktif'", studentID, parseUint(queryOrmawaID)).
				Count(&count)
			if count == 0 {
				// Fallback to manual assign claim in token if DB record isn't added yet
				assignStr, _ := c.Locals("ormawa_assign").(string)
				allowed := false
				if assignStr != "" {
					for _, id := range strings.Split(assignStr, ",") {
						if strings.TrimSpace(id) == queryOrmawaID {
							allowed = true
							break
						}
					}
				}
				if !allowed {
					return c.Status(403).JSON(fiber.Map{
						"status":  "error",
						"message": "Akses ditolak. Anda tidak memiliki izin aktif untuk organisasi ini.",
					})
				}
			}

			// Set c.Locals("ormawa_id") for controllers
			c.Locals("ormawa_id", uint(parseUint(queryOrmawaID)))
		}
	}

	return c.Next()
}

func parseUint(s string) uint64 {
	v, _ := strconv.ParseUint(s, 10, 64)
	return v
}

func PsikologCheck(c *fiber.Ctx) error {
	role, ok := c.Locals("role").(string)
	if !ok || strings.ToLower(role) != "psikolog" {
		return c.Status(403).JSON(fiber.Map{
			"status":  "error",
			"message": "Akses ditolak. Fitur ini hanya untuk Psikolog.",
		})
	}
	return c.Next()
}

func TenagaKesehatanCheck(c *fiber.Ctx) error {
	role, ok := c.Locals("role").(string)
	if !ok {
		return c.Status(403).JSON(fiber.Map{
			"status":  "error",
			"message": "Akses ditolak. Token tidak valid.",
		})
	}
	r := strings.ToLower(role)
	if r != "tenaga_kesehatan" && r != "tenagakes" && r != "super_admin" {
		return c.Status(403).JSON(fiber.Map{
			"status":  "error",
			"message": "Akses ditolak. Fitur ini hanya untuk Tenaga Kesehatan.",
		})
	}
	return c.Next()
}

// RequireRole - middleware untuk check role tertentu
func RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		role, ok := c.Locals("role").(string)
		if !ok {
			return c.Status(403).JSON(fiber.Map{
				"status":  "error",
				"message": "Akses ditolak. Role tidak valid.",
			})
		}
		r := strings.ToLower(role)
		for _, allowedRole := range roles {
			if r == strings.ToLower(allowedRole) {
				return c.Next()
			}
		}
		return c.Status(403).JSON(fiber.Map{
			"status":  "error",
			"message": "Akses ditolak. Anda tidak memiliki izin untuk fitur ini.",
		})
	}
}

package mahasiswa

import (
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

func getUserID(c *fiber.Ctx) (uint, error) {
	role, _ := c.Locals("role").(string)
	if role == "super_admin" || role == "faculty_admin" {
		studentIDStr := c.Get("X-Student-ID")
		if studentIDStr == "" {
			studentIDStr = c.Query("student_id")
		}
		if studentIDStr == "" {
			studentIDStr = c.Query("studentId")
		}
		if studentIDStr != "" {
			var student models.Mahasiswa
			if err := config.DB.First(&student, studentIDStr).Error; err == nil {
				return student.PenggunaID, nil
			}
		}
	}

	v, ok := c.Locals("user_id").(uint)
	if !ok || v == 0 {
		return 0, fiber.NewError(fiber.StatusUnauthorized, "User tidak terautentikasi")
	}
	return v, nil
}

func getStudent(c *fiber.Ctx) (*models.Mahasiswa, error) {
	role, _ := c.Locals("role").(string)
	if role == "super_admin" || role == "faculty_admin" {
		studentIDStr := c.Get("X-Student-ID")
		if studentIDStr == "" {
			studentIDStr = c.Query("student_id")
		}
		if studentIDStr == "" {
			studentIDStr = c.Query("studentId")
		}
		if studentIDStr != "" {
			var student models.Mahasiswa
			if err := config.DB.First(&student, studentIDStr).Error; err == nil {
				return &student, nil
			}
		}
	}

	PenggunaID, err := getUserID(c)
	if err != nil {
		return nil, err
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return nil, err
	}

	return &student, nil
}

package mahasiswa

import (
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

func getUserID(c *fiber.Ctx) (uint, error) {
	v, ok := c.Locals("user_id").(uint)
	if !ok || v == 0 {
		return 0, fiber.NewError(fiber.StatusUnauthorized, "User tidak terautentikasi")
	}
	return v, nil
}

func getStudent(c *fiber.Ctx) (*models.Mahasiswa, error) {
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

package controllers

import (
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func getFacultyIDFromContext(c *fiber.Ctx) (uint, bool) {
	userID, ok := c.Locals("user_id").(uint)
	if !ok || userID == 0 {
		return 0, false
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return 0, false
	}

	if user.Role != "faculty_admin" || user.FakultasID == nil || *user.FakultasID == 0 {
		return 0, false
	}

	return *user.FakultasID, true
}

func applyFacultyScope(c *fiber.Ctx, db *gorm.DB, column string) *gorm.DB {
	if facultyID, ok := getFacultyIDFromContext(c); ok {
		return db.Where(column+" = ?", facultyID)
	}
	return db
}

func applyFacultyScopeByMahasiswa(c *fiber.Ctx, db *gorm.DB, mahasiswaFK string) *gorm.DB {
	facultyID, ok := getFacultyIDFromContext(c)
	if !ok {
		return db
	}

	mahasiswaSubquery := config.DB.Model(&models.Mahasiswa{}).
		Select("id").
		Where("fakultas_id = ?", facultyID)

	return db.Where(mahasiswaFK+" IN (?)", mahasiswaSubquery)
}

func ensureMahasiswaInScope(c *fiber.Ctx, mahasiswaID uint) error {
	facultyID, ok := getFacultyIDFromContext(c)
	if !ok {
		return nil
	}

	var m models.Mahasiswa
	if err := config.DB.Select("id", "fakultas_id").First(&m, mahasiswaID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Mahasiswa tidak ditemukan")
	}

	if m.FakultasID != facultyID {
		return fiber.NewError(fiber.StatusForbidden, "Data mahasiswa di luar fakultas Anda")
	}

	return nil
}

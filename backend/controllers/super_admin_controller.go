package controllers

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetUsers returns list of all users for RBAC management
func GetUsers(c *fiber.Ctx) error {
	var users []models.User
	result := config.DB.Find(&users)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"message": "Failed to fetch users from database",
			"debug": result.Error.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"data": users,
	})
}

// UpdateUserRole handles role assignment and logs the event in log_aktivitas
func UpdateUserRole(c *fiber.Ctx) error {
	type UpdateRequest struct {
		UserID uint   `json:"userId"`
		Role   string `json:"role"`
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request payload"})
	}

	// 1. Find user to be modified
	var user models.User
	if err := config.DB.First(&user, req.UserID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "User not found"})
	}

	// 2. Execution with User Update
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		oldRole := user.Role
		
		// Update user role
		if err := tx.Model(&user).Update("role", req.Role).Error; err != nil {
			return err
		}

		// Log activity if user is a student (LogAktivitas in model.go is tied to Mahasiswa)
		var maba models.Mahasiswa
		if err := tx.Where("pengguna_id = ?", user.ID).First(&maba).Error; err == nil {
			logEntry := models.LogAktivitas{
				MahasiswaID: maba.ID,
				Aktivitas:   "UPDATE_USER_ROLE",
				Deskripsi:   fmt.Sprintf("Changed role from '%s' to '%s'. IP: %s", oldRole, req.Role, c.IP()),
				IPAddress:   c.IP(),
			}
			tx.Create(&logEntry)
		}
		
		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"message": "Critical failure during role update",
			"debug": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status": "success", 
		"message": "Institutional role has been successfully updated",
		"data": fiber.Map{
			"user": user.Email,
			"new_role": req.Role,
		},
	})
}

// GetAuditLogs returns all historical actions performed in the system
func GetAuditLogs(c *fiber.Ctx) error {
	var logs []models.LogAktivitas
	result := config.DB.Preload("Mahasiswa").Order("created_at desc").Limit(100).Find(&logs)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Database error retrieving logs"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": logs})
}

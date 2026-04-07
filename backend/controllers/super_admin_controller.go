package controllers

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetUsers returns list of all users with their roles for RBAC management
func GetUsers(c *fiber.Ctx) error {
	var users []models.User
	result := config.DB.Preload("Role").Find(&users)
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

// UpdateUserRole handles role assignment and logs the event in audit_log
func UpdateUserRole(c *fiber.Ctx) error {
	type UpdateRequest struct {
		UserID uint `json:"userId"`
		RoleID uint `json:"roleId"`
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request payload"})
	}

	// 1. Find user to be modified
	var user models.User
	if err := config.DB.Preload("Role").First(&user, req.UserID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "User sequence not found"})
	}

	// 2. Validate Role existence before assignment
	var newRole models.Role
	if err := config.DB.First(&newRole, req.RoleID).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "The specified Role ID does not exist"})
	}

	// 3. Execution with Transaction & Audit Logging
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		oldRoleName := user.Role.Name
		
		// Update user role
		if err := tx.Model(&user).Update("role_id", req.RoleID).Error; err != nil {
			return err
		}

		// Create Audit Log Entry
		audit := models.AuditLog{
			UserID:    1, // TODO: Get from auth middleware context
			Action:    "UPDATE_USER_ROLE",
			Entity:    "users",
			EntityID:  req.UserID,
			OldValue:  oldRoleName,
			NewValue:  newRole.Name,
			IPAddress: c.IP(),
			UserAgent: c.Get("User-Agent"),
		}
		
		return tx.Create(&audit).Error
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"message": "Critical failure during role update or audit logging",
			"debug": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status": "success", 
		"message": "Institutional role has been successfully elevated/revoked",
		"data": fiber.Map{
			"user": user.Email,
			"new_role": newRole.Name,
		},
	})
}

// GetAuditLogs returns all historical actions performed in the system
func GetAuditLogs(c *fiber.Ctx) error {
	var logs []models.AuditLog
	result := config.DB.Order("created_at desc").Limit(100).Find(&logs)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Database error retrieving logs"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": logs})
}

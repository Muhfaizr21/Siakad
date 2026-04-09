package notifikasi

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GetNotifications returns a list of notifications for the current student
func GetNotifications(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)
	
	// Filters
	tipe := c.Query("tipe")
	waktu := c.Query("waktu") // hari_ini, minggu_ini, bulan_ini
	status := c.Query("status") // unread, read
	
	query := config.DB.Model(&models.Notification{}).Where("pengguna_id = ?", PenggunaID)
	
	if tipe != "" && tipe != "Semua" {
		query = query.Where("tipe = ?", tipe)
	}
	
	if status == "unread" {
		query = query.Where("sudah_dibaca = ?", false)
	} else if status == "read" {
		query = query.Where("sudah_dibaca = ?", true)
	}
	
	now := time.Now()
	switch waktu {
	case "hari_ini":
		startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		query = query.Where("dibuat_pada >= ?", startOfDay)
	case "minggu_ini":
		startOfWeek := now.AddDate(0, 0, -int(now.Weekday()))
		query = query.Where("dibuat_pada >= ?", startOfWeek)
	case "bulan_ini":
		startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		query = query.Where("dibuat_pada >= ?", startOfMonth)
	}
	
	var notifs []models.Notification
	err := query.Order("dibuat_pada DESC").Find(&notifs).Error
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil notifikasi"})
	}
	
	return c.JSON(fiber.Map{"success": true, "data": notifs})
}

// GetUnreadCount returns the number of unread notifications
func GetUnreadCount(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)
	
	var count int64
	err := config.DB.Model(&models.Notification{}).
		Where("pengguna_id = ? AND sudah_dibaca = ?", PenggunaID, false).
		Count(&count).Error
		
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menghitung notifikasi"})
	}
	
	return c.JSON(fiber.Map{"success": true, "count": count})
}

// MarkAsRead marks a single notification as read
func MarkAsRead(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)
	id := c.Params("id")
	
	now := time.Now()
	err := config.DB.Model(&models.Notification{}).
		Where("id = ? AND pengguna_id = ?", id, PenggunaID).
		Updates(map[string]interface{}{
			"sudah_dibaca": true,
			"dibaca_pada":  &now,
		}).Error
		
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui notifikasi"})
	}
	
	return c.JSON(fiber.Map{"success": true, "message": "Notifikasi ditandai telah dibaca"})
}

// MarkAllAsRead marks all notifications as read for the current user
func MarkAllAsRead(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)
	
	now := time.Now()
	err := config.DB.Model(&models.Notification{}).
		Where("pengguna_id = ? AND sudah_dibaca = ?", PenggunaID, false).
		Updates(map[string]interface{}{
			"sudah_dibaca": true,
			"dibaca_pada":  &now,
		}).Error
		
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui semua notifikasi"})
	}
	
	return c.JSON(fiber.Map{"success": true, "message": "Semua notifikasi ditandai telah dibaca"})
}

// DeleteNotification deletes a single notification
func DeleteNotification(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)
	id := c.Params("id")
	
	err := config.DB.Where("id = ? AND pengguna_id = ?", id, PenggunaID).Delete(&models.Notification{}).Error
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menghapus notifikasi"})
	}
	
	return c.JSON(fiber.Map{"success": true, "message": "Notifikasi berhasil dihapus"})
}

// DeleteBulk deletes multiple notifications
func DeleteBulk(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)
	
	var req struct {
		IDs []string `json:"ids"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Data tidak valid"})
	}
	
	err := config.DB.Where("id IN ? AND pengguna_id = ?", req.IDs, PenggunaID).Delete(&models.Notification{}).Error
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menghapus beberapa notifikasi"})
	}
	
	return c.JSON(fiber.Map{"success": true, "message": "Notifikasi terpilih berhasil dihapus"})
}

// DeleteRead deletes all read notifications
func DeleteRead(c *fiber.Ctx) error {
	PenggunaID := c.Locals("user_id").(uint)
	
	err := config.DB.Where("pengguna_id = ? AND sudah_dibaca = ?", PenggunaID, true).Delete(&models.Notification{}).Error
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menghapus notifikasi"})
	}
	
	return c.JSON(fiber.Map{"success": true, "message": "Semua notifikasi yang sudah dibaca berhasil dihapus"})
}

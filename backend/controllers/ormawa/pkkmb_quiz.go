package ormawa

import (
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

func AmbilDaftarKuis(c *fiber.Ctx) error {
	var kuis []models.PkkmbQuiz
	config.DB.Preload("Questions.Options").Find(&kuis)
	return c.JSON(fiber.Map{"status": "success", "data": kuis})
}

func TambahKuis(c *fiber.Ctx) error {
	var kuis models.PkkmbQuiz
	if err := c.BodyParser(&kuis); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Gagal memproses data"})
	}

	if err := config.DB.Create(&kuis).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan kuis"})
	}

	return c.Status(201).JSON(fiber.Map{"status": "success", "data": kuis})
}

func UpdateKuis(c *fiber.Ctx) error {
	id := c.Params("id")
	var kuis models.PkkmbQuiz
	if err := config.DB.First(&kuis, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Kuis tidak ditemukan"})
	}

	if err := c.BodyParser(&kuis); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}

	config.DB.Save(&kuis)
	return c.JSON(fiber.Map{"status": "success", "data": kuis})
}

func HapusKuis(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.PkkmbQuiz{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menghapus kuis"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Kuis berhasil dihapus"})
}

func AmbilHasilKuis(c *fiber.Ctx) error {
	var attempts []models.PkkmbQuizAttempt
	config.DB.Preload("Mahasiswa").Preload("Quiz").Find(&attempts)
	return c.JSON(fiber.Map{"status": "success", "data": attempts})
}

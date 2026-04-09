package admin

import (
	"fmt"
	"strings"

	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type createFacultyAdminRequest struct {
	Email        string `json:"email"`
	Password     string `json:"password"`
	FakultasID   uint   `json:"fakultas_id"`
	FakultasKode string `json:"fakultas_kode"`
}

func resolveFakultas(req createFacultyAdminRequest) (*models.Fakultas, error) {
	var fakultas models.Fakultas
	if req.FakultasID != 0 {
		if err := config.DB.First(&fakultas, req.FakultasID).Error; err != nil {
			return nil, err
		}
		return &fakultas, nil
	}

	kode := strings.TrimSpace(strings.ToUpper(req.FakultasKode))
	if kode == "" {
		return nil, fiber.NewError(fiber.StatusBadRequest, "fakultas_id atau fakultas_kode wajib diisi")
	}

	if err := config.DB.Where("kode = ?", kode).First(&fakultas).Error; err != nil {
		return nil, err
	}

	return &fakultas, nil
}

func CreateFacultyAdmin(c *fiber.Ctx) error {
	var req createFacultyAdminRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload tidak valid"})
	}

	if strings.TrimSpace(req.Email) == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Email wajib diisi"})
	}

	fakultas, err := resolveFakultas(req)
	if err != nil {
		if ferr, ok := err.(*fiber.Error); ok {
			return c.Status(ferr.Code).JSON(fiber.Map{"success": false, "message": ferr.Message})
		}
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Fakultas tidak ditemukan"})
	}

	password := strings.TrimSpace(req.Password)
	if password == "" {
		password = "adminfak123"
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	roleLabel := fmt.Sprintf("admin_fakultas_%s", strings.ToLower(fakultas.Kode))

	newAdmin := models.User{
		Email:          strings.ToLower(strings.TrimSpace(req.Email)),
		Password:       string(hash),
		Role:           "faculty_admin",
		FakultasID:     &fakultas.ID,
		AdminRoleLabel: roleLabel,
	}

	if err := config.DB.Create(&newAdmin).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Gagal membuat admin fakultas: " + err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Admin fakultas berhasil dibuat",
		"data": fiber.Map{
			"id":            newAdmin.ID,
			"email":         newAdmin.Email,
			"role":          newAdmin.Role,
			"admin_role":    newAdmin.AdminRoleLabel,
			"fakultas_id":   fakultas.ID,
			"fakultas":      fakultas.Nama,
			"fakultas_kode": fakultas.Kode,
		},
	})
}

func ListFacultyAdmins(c *fiber.Ctx) error {
	var users []models.User
	if err := config.DB.Where("role = ?", "faculty_admin").Order("id asc").Find(&users).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil admin fakultas"})
	}

	var facultyMap = map[uint]models.Fakultas{}
	var result []fiber.Map
	for _, u := range users {
		var namaFak, kodeFak string
		if u.FakultasID != nil && *u.FakultasID != 0 {
			fID := *u.FakultasID
			if _, ok := facultyMap[fID]; !ok {
				var f models.Fakultas
				if err := config.DB.First(&f, fID).Error; err == nil {
					facultyMap[fID] = f
				}
			}
			if f, ok := facultyMap[fID]; ok {
				namaFak = f.Nama
				kodeFak = f.Kode
			}
		}

		result = append(result, fiber.Map{
			"id":            u.ID,
			"email":         u.Email,
			"role":          u.Role,
			"admin_role":    u.AdminRoleLabel,
			"fakultas_id":   u.FakultasID,
			"fakultas":      namaFak,
			"fakultas_kode": kodeFak,
		})
	}

	return c.JSON(fiber.Map{"success": true, "data": result})
}

func ListAllStudents(c *fiber.Ctx) error {
	var mhs []models.Mahasiswa
	if err := config.DB.Preload("Pengguna").Preload("Fakultas").Preload("ProgramStudi").Order("id asc").Find(&mhs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil data mahasiswa"})
	}

	return c.JSON(fiber.Map{"success": true, "data": mhs})
}

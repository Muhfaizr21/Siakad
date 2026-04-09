package auth

import (
	"errors"
	"os"
	"strings"
	"time"

	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type loginRequest struct {
	Identifier string `json:"identifier"`
	Password   string `json:"password"`
}

type userResponse struct {
	ID    uint   `json:"id"`
	Email string `json:"email"`
	Role  string `json:"role"`
	NIM   string `json:"nim,omitempty"`
	Nama  string `json:"nama,omitempty"`
}

func jwtSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "siakad-dev-secret-change-me"
	}
	return []byte(secret)
}

func createToken(penggunaID uint, role string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"uid":  penggunaID,
		"role": role,
		"iat":  now.Unix(),
		"exp":  now.Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret())
}

func parseBearerToken(c *fiber.Ctx) (jwt.MapClaims, error) {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return nil, errors.New("missing authorization header")
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return nil, errors.New("invalid authorization format")
	}

	token, err := jwt.Parse(parts[1], func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret(), nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

func Login(c *fiber.Ctx) error {
	var body loginRequest
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request payload",
		})
	}

	identifier := strings.TrimSpace(body.Identifier)
	password := strings.TrimSpace(body.Password)
	if identifier == "" || password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Identifier and password are required",
		})
	}

	var user models.Pengguna
	var roleName string
	var nim string
	var nama string

	var student models.Mahasiswa
	studentErr := config.DB.Preload("Pengguna.Peran").Where("nim = ?", identifier).First(&student).Error
	if studentErr == nil {
		user = student.Pengguna
		nim = student.NIM
		nama = student.NamaMahasiswa
		roleName = student.Pengguna.Peran.NamaPeran
	} else {
		userErr := config.DB.Preload("Peran").Where("email = ?", identifier).First(&user).Error
		if userErr != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Email/NIM atau password salah",
			})
		}
		roleName = user.Peran.NamaPeran

		if roleName == "student" {
			_ = config.DB.Where("pengguna_id = ?", user.ID).First(&student).Error
			if student.ID != 0 {
				nim = student.NIM
				nama = student.NamaMahasiswa
			}
		}
	}

	if !user.Aktif {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"status":  "error",
			"message": "Akun dinonaktifkan. Hubungi administrator",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.KataSandi), []byte(password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Email/NIM atau password salah",
		})
	}

	token, err := createToken(user.ID, roleName)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to create access token",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Login berhasil",
		"data": fiber.Map{
			"token": token,
			"user": userResponse{
				ID:    user.ID,
				Email: user.Email,
				Role:  roleName,
				NIM:   nim,
				Nama:  nama,
			},
		},
	})
}

func Me(c *fiber.Ctx) error {
	claims, err := parseBearerToken(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": err.Error(),
		})
	}

	uidValue, ok := claims["uid"].(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid token payload",
		})
	}

	var user models.Pengguna
	if err := config.DB.Preload("Peran").First(&user, uint(uidValue)).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "User not found",
		})
	}

	var student models.Mahasiswa
	_ = config.DB.Where("pengguna_id = ?", user.ID).First(&student).Error

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"user": userResponse{
				ID:    user.ID,
				Email: user.Email,
				Role:  user.Peran.NamaPeran,
				NIM:   student.NIM,
				Nama:  student.NamaMahasiswa,
			},
		},
	})
}

func EnsureBootstrapData() error {
	roles := []string{"super_admin", "faculty_admin", "ormawa_admin", "student"}
	for _, roleName := range roles {
		peran := models.Peran{NamaPeran: roleName}
		if err := config.DB.Where(models.Peran{NamaPeran: roleName}).FirstOrCreate(&peran).Error; err != nil {
			return err
		}
	}

	var studentRole models.Peran
	if err := config.DB.Where("nama_peran = ?", "student").First(&studentRole).Error; err != nil {
		return err
	}

	var user models.Pengguna
	userErr := config.DB.Where("email = ?", "student@bku.ac.id").First(&user).Error
	if errors.Is(userErr, gorm.ErrRecordNotFound) {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("student123"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		user = models.Pengguna{
			Email:     "student@bku.ac.id",
			KataSandi: string(hashedPassword),
			PeranID:   studentRole.ID,
			Aktif:     true,
		}
		if err := config.DB.Create(&user).Error; err != nil {
			return err
		}
	} else if userErr != nil {
		return userErr
	}

	var fakultas models.Fakultas
	dbFakultas := config.DB.Where("kode_fakultas = ?", "SOC").First(&fakultas)
	if dbFakultas.Error != nil {
		fakultas = models.Fakultas{NamaFakultas: "School of Computing", KodeFakultas: "SOC", Dekan: "Prof. Demo"}
		config.DB.Create(&fakultas)
	}

	var major models.ProgramStudi
	dbProdi := config.DB.Where("nama_prodi = ?", "Informatics").First(&major)
	if dbProdi.Error != nil {
		major = models.ProgramStudi{NamaProdi: "Informatics", FakultasID: fakultas.ID, Jenjang: "S1"}
		config.DB.Create(&major)
	}

	var student models.Mahasiswa
	dbStudent := config.DB.Where("nim = ?", "BKU2024001").First(&student)
	if dbStudent.Error != nil {
		student = models.Mahasiswa{
			PenggunaID:       user.ID,
			NIM:              "BKU2024001",
			NamaMahasiswa:    "Mahasiswa Demo",
			ProgramStudiID:   major.ID,
			SemesterSekarang: 2,
			StatusAkun:       "Aktif",
		}
		config.DB.Create(&student)
	}

	return nil
}

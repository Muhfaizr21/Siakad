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
	Name  string `json:"name,omitempty"`
}

func jwtSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "siakad-dev-secret-change-me"
	}
	return []byte(secret)
}

func createToken(userID uint, role string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"uid":  userID,
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

	var user models.User
	var roleName string
	var nim string
	var name string

	var student models.Student
	studentErr := config.DB.Preload("User.Role").Where("nim = ?", identifier).First(&student).Error
	if studentErr == nil {
		user = student.User
		nim = student.NIM
		name = student.Name
		roleName = student.User.Role.Name
	} else {
		userErr := config.DB.Preload("Role").Where("email = ?", identifier).First(&user).Error
		if userErr != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Email/NIM atau password salah",
			})
		}
		roleName = user.Role.Name

		if roleName == "student" {
			_ = config.DB.Where("user_id = ?", user.ID).First(&student).Error
			if student.ID != 0 {
				nim = student.NIM
				name = student.Name
			}
		}
	}

	if !user.IsActive {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"status":  "error",
			"message": "Akun dinonaktifkan. Hubungi administrator",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
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
				Name:  name,
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

	var user models.User
	if err := config.DB.Preload("Role").First(&user, uint(uidValue)).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "User not found",
		})
	}

	var student models.Student
	_ = config.DB.Where("user_id = ?", user.ID).First(&student).Error

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"user": userResponse{
				ID:    user.ID,
				Email: user.Email,
				Role:  user.Role.Name,
				NIM:   student.NIM,
				Name:  student.Name,
			},
		},
	})
}

func EnsureBootstrapData() error {
	roles := []string{"super_admin", "faculty_admin", "ormawa_admin", "student"}
	for _, roleName := range roles {
		role := models.Role{Name: roleName}
		if err := config.DB.Where(models.Role{Name: roleName}).FirstOrCreate(&role).Error; err != nil {
			return err
		}
	}

	var studentRole models.Role
	if err := config.DB.Where("name = ?", "student").First(&studentRole).Error; err != nil {
		return err
	}

	var user models.User
	userErr := config.DB.Where("email = ?", "student@bku.ac.id").First(&user).Error
	if errors.Is(userErr, gorm.ErrRecordNotFound) {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("student123"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		user = models.User{
			Email:        "student@bku.ac.id",
			PasswordHash: string(hashedPassword),
			RoleID:       studentRole.ID,
			IsActive:     true,
		}
		if err := config.DB.Create(&user).Error; err != nil {
			return err
		}
	} else if userErr != nil {
		return userErr
	}

	faculty := models.Faculty{Name: "School of Computing", Code: "SOC", DeanName: "Prof. Demo"}
	if err := config.DB.Where(models.Faculty{Code: "SOC"}).FirstOrCreate(&faculty).Error; err != nil {
		return err
	}

	major := models.Major{Name: "Informatics", FacultyID: faculty.ID, DegreeLevel: "S1"}
	if err := config.DB.Where(models.Major{Name: "Informatics", FacultyID: faculty.ID}).FirstOrCreate(&major).Error; err != nil {
		return err
	}

	student := models.Student{
		UserID:          user.ID,
		NIM:             "BKU2024001",
		Name:            "Mahasiswa Demo",
		MajorID:         major.ID,
		CurrentSemester: 2,
		Status:          "active",
	}
	if err := config.DB.Where(models.Student{NIM: "BKU2024001"}).FirstOrCreate(&student).Error; err != nil {
		return err
	}

	return nil
}

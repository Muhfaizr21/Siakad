package auth

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type loginRequest struct {
	Identifier string `json:"identifier"`
	Email      string `json:"email"`
	NIM        string `json:"nim"`
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
	return config.GetJWTSecret()
}

func createToken(userID uint, studentID uint, nim string, role string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":  userID,
		"sid":  studentID,
		"nim":  nim,
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
	if identifier == "" {
		identifier = strings.TrimSpace(body.Email)
	}
	if identifier == "" {
		identifier = strings.TrimSpace(body.NIM)
	}
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

	// 1. Try to find student by NIM first
	var student models.Mahasiswa
	err := config.DB.Preload("Pengguna").Where("nim = ?", identifier).First(&student).Error
	if err == nil {
		user = student.Pengguna
		nim = student.NIM
		roleName = student.Pengguna.Role
	} else {
		// 2. Try to find user by Email
		if err := config.DB.Where("LOWER(email) = ?", strings.ToLower(identifier)).First(&user).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Email/NIM atau password salah",
			})
		}
		roleName = user.Role

		if roleName == "mahasiswa" || roleName == "student" {
			_ = config.DB.Where("pengguna_id = ?", user.ID).First(&student).Error
			if student.ID != 0 {
				nim = student.NIM
			}
		}
	}

	// Password check
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Email/NIM atau password salah",
		})
	}

	token, err := createToken(user.ID, student.ID, nim, roleName)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to create access token",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"status":  "success",
		"data": fiber.Map{
			"token":        token,
			"access_token": token,
			"mahasiswa":    student, // although for admin it might be empty
			"user": userResponse{
				ID:    user.ID,
				Email: user.Email,
				Role:  roleName,
				NIM:   student.NIM,
				Nama:  student.Nama,
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

	uidValue, ok := claims["sub"].(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid token payload",
		})
	}

	var user models.User
	if err := config.DB.First(&user, uint(uidValue)).Error; err != nil {
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
				Role:  user.Role,
				NIM:   student.NIM,
				Nama:  student.Nama,
			},
		},
	})
}

func RefreshToken(c *fiber.Ctx) error {
	tokenString := c.Cookies("refresh_token")
	if tokenString == "" {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Refresh token tidak ditemukan"})
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret(), nil
	})

	if err != nil || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Refresh token tidak valid"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || claims["typ"] != "refresh" {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Refresh token invalid type"})
	}

	now := time.Now()
	newToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": claims["sub"],
		"sid": claims["sid"],
		"nim": claims["nim"],
		"exp": now.Add(15 * time.Minute).Unix(),
	})
	newAT, err := newToken.SignedString(jwtSecret())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal generate token baru"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Token berhasil diperbarui",
		"data": fiber.Map{
			"access_token": newAT,
			"expires_in":   900,
		},
	})
}

func Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour),
		HTTPOnly: true,
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Berhasil logout",
	})
}

func ChangePassword(c *fiber.Ctx) error {
	UserID := c.Locals("user_id")

	type ChangePasswordRequest struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	var req ChangePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Invalid request payload"})
	}

	var user models.User
	if err := config.DB.First(&user, UserID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "User tidak ditemukan"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Password lama salah"})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengenkripsi password baru"})
	}

	user.Password = string(hash)
	config.DB.Save(&user)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Password berhasil diubah",
	})
}

func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		claims, err := parseBearerToken(c)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Sesi berakhir atau tidak valid. Silakan login kembali.",
			})
		}

		c.Locals("user_id", uint(claims["sub"].(float64)))
		c.Locals("role", claims["role"].(string))
		if sid, ok := claims["sid"].(float64); ok {
			c.Locals("student_id", uint(sid))
		}

		return c.Next()
	}
}

func EnsureBootstrapData() error {
	fmt.Println("🚀 [SEEDER] Starting aggressive seed process...")

	// 1. Ensure Fakultas
	fakultasSeeds := []models.Fakultas{
		{Nama: "School of Computing", Kode: "SOC", Dekan: "Prof. Demo"},
		{Nama: "Fakultas Teknik", Kode: "FT", Dekan: "Prof. Teknik"},
		{Nama: "Fakultas Hukum", Kode: "FH", Dekan: "Prof. Hukum"},
		{Nama: "Fakultas Ekonomi", Kode: "FE", Dekan: "Prof. Ekonomi"},
	}
	for _, seed := range fakultasSeeds {
		var existing models.Fakultas
		if err := config.DB.Where("kode = ?", seed.Kode).First(&existing).Error; err != nil {
			if err := config.DB.Create(&seed).Error; err != nil {
				panic("Failed to seed Fakultas: " + err.Error())
			}
			fmt.Printf("✅ [SEEDER] Created Fakultas: %s\n", seed.Kode)
		}
	}

	var fakultasSOC models.Fakultas
	if err := config.DB.Where("kode = ?", "SOC").First(&fakultasSOC).Error; err != nil {
		panic("Failed to get SOC Fakultas: " + err.Error())
	}
	var fakultasFH models.Fakultas
	if err := config.DB.Where("kode = ?", "FH").First(&fakultasFH).Error; err != nil {
		panic("Failed to get FH Fakultas: " + err.Error())
	}

	// 2. Ensure Program Studi
	var majorSOC models.ProgramStudi
	if err := config.DB.Where("kode = ?", "INF01").First(&majorSOC).Error; err != nil {
		majorSOC = models.ProgramStudi{Nama: "Informatics", FakultasID: fakultasSOC.ID, Jenjang: "S1", Kode: "INF01"}
		if err := config.DB.Create(&majorSOC).Error; err != nil {
			panic("Failed to seed ProgramStudi SOC: " + err.Error())
		}
		fmt.Println("✅ [SEEDER] Created Program Studi: Informatics")
	}
	var majorFH models.ProgramStudi
	if err := config.DB.Where("kode = ?", "LAW01").First(&majorFH).Error; err != nil {
		majorFH = models.ProgramStudi{Nama: "Ilmu Hukum", FakultasID: fakultasFH.ID, Jenjang: "S1", Kode: "LAW01"}
		if err := config.DB.Create(&majorFH).Error; err != nil {
			panic("Failed to seed ProgramStudi FH: " + err.Error())
		}
		fmt.Println("✅ [SEEDER] Created Program Studi: Ilmu Hukum")
	}

	// 3. Ensure Dosen User & Dosen Profile
	var dosenUser models.User
	if err := config.DB.Where("email = ?", "dosen@bku.ac.id").First(&dosenUser).Error; err != nil {
		hp, _ := bcrypt.GenerateFromPassword([]byte("dosen123"), bcrypt.DefaultCost)
		dosenUser = models.User{Email: "dosen@bku.ac.id", Password: string(hp), Role: "dosen"}
		config.DB.Create(&dosenUser)
	} else if dosenUser.Role != "dosen" {
		dosenUser.Role = "dosen"
		config.DB.Save(&dosenUser)
	}

	var dosen models.Dosen
	// Note: GORM maps NIDN to n_id_n by default
	if err := config.DB.Where("n_id_n = ?", "0400000001").First(&dosen).Error; err != nil {
		dosen = models.Dosen{
			Nama:           "Dosen PA Demo",
			NIDN:           "0400000001",
			PenggunaID:     dosenUser.ID,
			FakultasID:     fakultasSOC.ID,
			ProgramStudiID: majorSOC.ID,
		}
		if err := config.DB.Create(&dosen).Error; err != nil {
			panic("Failed to seed Dosen: " + err.Error())
		}
		fmt.Println("✅ [SEEDER] Created Dosen: 0400000001")
	}

	// 4. Ensure Ormawa
	var ormawa models.Ormawa
	if err := config.DB.Where("id = ?", 1).First(&ormawa).Error; err != nil {
		ormawa = models.Ormawa{
			Nama:      "HMP Informatics",
			Deskripsi: "Himpunan Mahasiswa Informatics",
			Visi:      "Menjadi himpunan terbaik",
			Misi:      "Meningkatkan skill mahasiswa",
		}
		ormawa.ID = 1
		if err := config.DB.Create(&ormawa).Error; err != nil {
			panic("Failed to seed Ormawa: " + err.Error())
		}
		fmt.Println("✅ [SEEDER] Created Ormawa ID: 1")
	}

	// 5. Ensure Super Admin User
	var superAdmin models.User
	if err := config.DB.Where("email = ?", "superadmin@bku.ac.id").First(&superAdmin).Error; err != nil {
		hash, _ := bcrypt.GenerateFromPassword([]byte("superadmin123"), bcrypt.DefaultCost)
		superAdmin = models.User{Email: "superadmin@bku.ac.id", Password: string(hash), Role: "super_admin"}
		if err := config.DB.Create(&superAdmin).Error; err != nil {
			panic("Failed to seed Super Admin: " + err.Error())
		}
		fmt.Println("✅ [SEEDER] Created Super Admin: superadmin@bku.ac.id")
	}

	// 6. Ensure Faculty Admin User per Fakultas
	var allFakultas []models.Fakultas
	config.DB.Find(&allFakultas)
	for _, fak := range allFakultas {
		email := strings.ToLower(fmt.Sprintf("admin.%s@bku.ac.id", fak.Kode))
		var facultyAdmin models.User
		if err := config.DB.Where("email = ?", email).First(&facultyAdmin).Error; err != nil {
			hash, _ := bcrypt.GenerateFromPassword([]byte("adminfak123"), bcrypt.DefaultCost)
			facultyAdmin = models.User{Email: email, Password: string(hash), Role: "faculty_admin"}
			if err := config.DB.Create(&facultyAdmin).Error; err != nil {
				panic("Failed to seed Faculty Admin: " + err.Error())
			}
			fmt.Printf("✅ [SEEDER] Created Faculty Admin: %s\n", email)
		}
	}

	// 7. Ensure Ormawa Admin User
	var ormawaAdmin models.User
	if err := config.DB.Where("email = ?", "ormawa@bku.ac.id").First(&ormawaAdmin).Error; err != nil {
		hash, _ := bcrypt.GenerateFromPassword([]byte("ormawa123"), bcrypt.DefaultCost)
		ormawaAdmin = models.User{Email: "ormawa@bku.ac.id", Password: string(hash), Role: "ormawa_admin"}
		if err := config.DB.Create(&ormawaAdmin).Error; err != nil {
			panic("Failed to seed Ormawa Admin: " + err.Error())
		}
		fmt.Println("✅ [SEEDER] Created Ormawa Admin: ormawa@bku.ac.id")
	}

	// 8. Ensure Student User
	var user models.User
	if err := config.DB.Where("email = ?", "student@bku.ac.id").First(&user).Error; err != nil {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("student123"), bcrypt.DefaultCost)
		user = models.User{Email: "student@bku.ac.id", Password: string(hashedPassword), Role: "student"}
		if err := config.DB.Create(&user).Error; err != nil {
			panic("Failed to seed User: " + err.Error())
		}
		fmt.Println("✅ [SEEDER] Created User: student@bku.ac.id (role: student)")
	} else if user.Role != "student" {
		user.Role = "student"
		config.DB.Save(&user)
	}

	// 9. Ensure Mahasiswa
	var student models.Mahasiswa
	if err := config.DB.Where("nim = ?", "BKU2024001").First(&student).Error; err != nil {
		student = models.Mahasiswa{
			PenggunaID:       user.ID,
			NIM:              "BKU2024001",
			Nama:             "Mahasiswa Demo",
			FakultasID:       fakultasFH.ID,
			ProgramStudiID:   majorFH.ID,
			DosenPAID:        dosen.ID,
			SemesterSekarang: 2,
			StatusAkun:       "Aktif",
		}
		if err := config.DB.Create(&student).Error; err != nil {
			panic("Failed to seed Mahasiswa: " + err.Error())
		}
		fmt.Println("✅ [SEEDER] Created Mahasiswa: BKU2024001")
	} else {
		student.FakultasID = fakultasFH.ID
		student.ProgramStudiID = majorFH.ID
		if student.PenggunaID == 0 {
			student.PenggunaID = user.ID
		}
		config.DB.Save(&student)
	}

	fmt.Println("🏁 [SEEDER] All data seeded successfully.")
	return nil
}

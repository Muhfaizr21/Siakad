package auth

import (
	"errors"
	"fmt"
	"os"
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
	var nama string

	// 1. Try to find student by NIM first
	var student models.Mahasiswa
	err := config.DB.Preload("Pengguna").Where("nim = ?", identifier).First(&student).Error
	if err == nil {
		user = student.Pengguna
		nim = student.NIM
		nama = student.Nama
		roleName = student.Pengguna.Role
	} else {
		// 2. Try to find user by Email
		if err := config.DB.Where("email = ?", identifier).First(&user).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Email/NIM atau password salah",
			})
		}
		roleName = user.Role

		if roleName == "student" {
			_ = config.DB.Where("pengguna_id = ?", user.ID).First(&student).Error
			if student.ID != 0 {
				nim = student.NIM
				nama = student.Nama
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

func EnsureBootstrapData() error {
	fmt.Println("🚀 [SEEDER] Starting aggressive seed process...")

	// 1. Ensure Fakultas
	var fakultas models.Fakultas
	if err := config.DB.Where("kode = ?", "SOC").First(&fakultas).Error; err != nil {
		fakultas = models.Fakultas{Nama: "School of Computing", Kode: "SOC", Dekan: "Prof. Demo"}
		if err := config.DB.Create(&fakultas).Error; err != nil {
			panic("Failed to seed Fakultas: " + err.Error())
		}
		fmt.Println("✅ [SEEDER] Created Fakultas: SOC")
	}

	// 2. Ensure Program Studi (Expanded)
	majors := []models.ProgramStudi{
		{Nama: "Informatics", FakultasID: fakultas.ID, Jenjang: "S1", Kode: "INF01", Akreditasi: "Unggul"},
		{Nama: "Sistem Informasi", FakultasID: fakultas.ID, Jenjang: "S1", Kode: "SI01", Akreditasi: "A"},
		{Nama: "Teknik Sipil", FakultasID: fakultas.ID, Jenjang: "S1", Kode: "TS01", Akreditasi: "B"},
		{Nama: "Teknik Mesin", FakultasID: fakultas.ID, Jenjang: "S1", Kode: "TM01", Akreditasi: "Unggul"},
		{Nama: "Arsitektur", FakultasID: fakultas.ID, Jenjang: "S1", Kode: "ARS01", Akreditasi: "B"},
		{Nama: "Teknik Elektro", FakultasID: fakultas.ID, Jenjang: "S1", Kode: "TE01", Akreditasi: "Unggul"},
		{Nama: "Teknik Kimia", FakultasID: fakultas.ID, Jenjang: "S1", Kode: "TK01", Akreditasi: "A"},
	}

	var major models.ProgramStudi // Default for students
	for i, m := range majors {
		var existing models.ProgramStudi
		if err := config.DB.Where("nama = ?", m.Nama).First(&existing).Error; err != nil {
			config.DB.Create(&m)
			fmt.Printf("✅ [SEEDER] Created Program Studi: %s\n", m.Nama)
			if i == 0 {
				major = m
			}
		} else {
			if i == 0 {
				major = existing
			}
		}
	}

	// 3. Ensure Dosen User & Dosen Profile
	var dosenUser models.User
	if err := config.DB.Where("email = ?", "dosen@bku.ac.id").First(&dosenUser).Error; err != nil {
		hp, _ := bcrypt.GenerateFromPassword([]byte("dosen123"), bcrypt.DefaultCost)
		dosenUser = models.User{Email: "dosen@bku.ac.id", Password: string(hp), Role: "dosen"}
		config.DB.Create(&dosenUser)
	}

	var dosen models.Dosen
	// Note: GORM maps NIDN to n_id_n by default
	if err := config.DB.Where("n_id_n = ?", "0400000001").First(&dosen).Error; err != nil {
		dosen = models.Dosen{
			Nama:           "Dosen PA Demo",
			NIDN:           "0400000001",
			Jabatan:        "Dosen Pengajar",
			IsDPA:          true,
			PenggunaID:     dosenUser.ID,
			FakultasID:     fakultas.ID,
			ProgramStudiID: major.ID,
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
			Nama:          "HMP Informatics",
			Kode:          "HMP-I",
			Status:        "Aktif",
			JumlahAnggota: 150,
			Deskripsi:     "Himpunan Mahasiswa Informatics",
			Visi:          "Menjadi himpunan terbaik",
			Misi:          "Meningkatkan skill mahasiswa",
			Email:         "hmp.inf@siakad.ac.id",
			Phone:         "08123456789",
		}
		ormawa.ID = 1
		if err := config.DB.Create(&ormawa).Error; err != nil {
			panic("Failed to seed Ormawa: " + err.Error())
		}
		fmt.Println("✅ [SEEDER] Created Ormawa ID: 1")
	} else {
		// Update if empty
		if ormawa.Email == "" || ormawa.Phone == "" || ormawa.Kode == "" {
			ormawa.Email = "hmp.inf@siakad.ac.id"
			ormawa.Phone = "08123456789"
			ormawa.Kode = "HMP-I"
			ormawa.Status = "Aktif"
			ormawa.JumlahAnggota = 150
			config.DB.Save(&ormawa)
			fmt.Println("✅ [SEEDER] Updated Ormawa ID: 1 with missing fields")
		}
	}

	// 5. Ensure Student User
	var user models.User
	if err := config.DB.Where("email = ?", "student@bku.ac.id").First(&user).Error; err != nil {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("student123"), bcrypt.DefaultCost)
		user = models.User{Email: "student@bku.ac.id", Password: string(hashedPassword), Role: "student"}
		if err := config.DB.Create(&user).Error; err != nil {
			panic("Failed to seed User: " + err.Error())
		}
		fmt.Println("✅ [SEEDER] Created User: student@bku.ac.id")
	}

	// 6. Ensure Mahasiswa
	var student models.Mahasiswa
	if err := config.DB.Where("nim = ?", "BKU2024001").First(&student).Error; err != nil {
		student = models.Mahasiswa{
			PenggunaID:       user.ID,
			NIM:              "BKU2024001",
			Nama:             "Mahasiswa Demo",
			FakultasID:       fakultas.ID,
			ProgramStudiID:   major.ID,
			DosenPAID:        dosen.ID,
			SemesterSekarang: 2,
			StatusAkun:       "Aktif",
		}
		if err := config.DB.Create(&student).Error; err != nil {
			panic("Failed to seed Mahasiswa: " + err.Error())
		}
		fmt.Println("✅ [SEEDER] Created Mahasiswa: BKU2024001")

		// Create Demo Health Record
		health := models.Kesehatan{
			MahasiswaID:      student.ID,
			Tanggal:          time.Now(),
			JenisPemeriksaan: "Screening Tahunan",
			Hasil:            "Sehat",
			StatusKesehatan:  "prima",
			Catatan:          "Kondisi fisik sangat baik, disarankan menjaga asupan cairan.",
			TinggiBadan:      175,
			BeratBadan:       68,
			Sistole:          120,
			Diastole:         80,
			GulaDarah:        95,
			ButaWarna:        "Normal",
			GolonganDarah:    "O",
		}
		config.DB.Create(&health)
		fmt.Println("✅ [SEEDER] Created Health Record for Demo Student")
	}

	// 7. Distribute Students across Prodis (for demo variety)
	var allProdis []models.ProgramStudi
	config.DB.Find(&allProdis)
	if len(allProdis) > 1 {
		var studList []models.Mahasiswa
		config.DB.Limit(100).Find(&studList) // Redistribute first 100 students
		for i, s := range studList {
			targetProdi := allProdis[i%len(allProdis)]
			config.DB.Model(&s).Update("program_studi_id", targetProdi.ID)
		}
		fmt.Println("🎨 [SEEDER] Distributed 100 students across various prodis for visualization.")
	}

	fmt.Println("🏁 [SEEDER] All data seeded successfully.")
	return nil
}

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

func createToken(userID uint, studentID uint, nim string, role string, facultyID *uint) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":  userID,
		"sid":  studentID,
		"nim":  nim,
		"role": role,
		"fid":  facultyID,
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

	token, err := createToken(user.ID, student.ID, nim, roleName, user.FakultasID)
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

	var fid *uint
	if f, ok := claims["fid"].(float64); ok {
		val := uint(f)
		fid = &val
	}

	newAT, err := createToken(uint(claims["sub"].(float64)), uint(claims["sid"].(float64)), claims["nim"].(string), claims["role"].(string), fid)
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
	// 2. Ensure Program Studi
	var majorSOC models.ProgramStudi
	config.DB.Where("kode = ?", "INF01").FirstOrCreate(&majorSOC, models.ProgramStudi{
		Nama:       "Informatics",
		FakultasID: fakultasSOC.ID,
		Jenjang:    "S1",
		Kode:       "INF01",
	})
	fmt.Println("✅ [SEEDER] Verified Program Studi: Informatics")

	var majorFH models.ProgramStudi
	config.DB.Where("kode = ?", "LAW01").FirstOrCreate(&majorFH, models.ProgramStudi{
		Nama:       "Ilmu Hukum",
		FakultasID: fakultasFH.ID,
		Jenjang:    "S1",
		Kode:       "LAW01",
	})
	fmt.Println("✅ [SEEDER] Verified Program Studi: Ilmu Hukum")

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

	// Additional Premium Lecturers
	premiumLecturers := []struct {
		Name    string
		NIDN    string
		Jabatan string
		Email   string
	}{
		{"Dr. Ahmad Wijaya, M.T.", "0401018501", "Lektor Kepala", "ahmad.wijaya@bku.ac.id"},
		{"Siti Aminah, M.Kom.", "0412059002", "Asisten Ahli", "siti.aminah@bku.ac.id"},
		{"Ir. Bambang Triyono, Ph.D.", "0009087503", "Profesor", "bambang.tri@bku.ac.id"},
	}

	for _, d := range premiumLecturers {
		var u models.User
		if err := config.DB.Where("email = ?", d.Email).First(&u).Error; err != nil {
			hp, _ := bcrypt.GenerateFromPassword([]byte("dosen123"), bcrypt.DefaultCost)
			u = models.User{Email: d.Email, Password: string(hp), Role: "dosen"}
			config.DB.Create(&u)
		}
		var l models.Dosen
		if err := config.DB.Where("n_id_n = ?", d.NIDN).First(&l).Error; err != nil {
			l = models.Dosen{
				Nama:           d.Name,
				NIDN:           d.NIDN,
				Jabatan:        d.Jabatan,
				PenggunaID:     u.ID,
				FakultasID:     fakultasSOC.ID,
				ProgramStudiID: majorSOC.ID,
				Email:          d.Email,
			}
			config.DB.Create(&l)
			fmt.Printf("✅ [SEEDER] Created Premium Dosen: %s\n", d.Name)
		}
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
	hashSA, _ := bcrypt.GenerateFromPassword([]byte("superadmin123"), bcrypt.DefaultCost)
	if err := config.DB.Where("email = ?", "superadmin@bku.ac.id").First(&superAdmin).Error; err != nil {
		superAdmin = models.User{Email: "superadmin@bku.ac.id", Password: string(hashSA), Role: "super_admin"}
		config.DB.Create(&superAdmin)
		fmt.Println("✅ [SEEDER] Created Super Admin: superadmin@bku.ac.id")
	} else {
		superAdmin.Password = string(hashSA)
		superAdmin.Role = "super_admin"
		config.DB.Save(&superAdmin)
	}

	// 6. Ensure Faculty Admin User per Fakultas
	var allFakultas []models.Fakultas
	config.DB.Find(&allFakultas)
	hashFA, _ := bcrypt.GenerateFromPassword([]byte("adminfak123"), bcrypt.DefaultCost)
	for _, fak := range allFakultas {
		email := strings.ToLower(fmt.Sprintf("admin.%s@bku.ac.id", fak.Kode))
		var facultyAdmin models.User
		if err := config.DB.Where("email = ?", email).First(&facultyAdmin).Error; err != nil {
			facultyAdmin = models.User{
				Email:      email,
				Password:   string(hashFA),
				Role:       "faculty_admin",
				FakultasID: &fak.ID,
			}
			config.DB.Create(&facultyAdmin)
			fmt.Printf("✅ [SEEDER] Created Faculty Admin: %s\n", email)
		} else {
			facultyAdmin.Password = string(hashFA)
			facultyAdmin.Role = "faculty_admin"
			facultyAdmin.FakultasID = &fak.ID
			config.DB.Save(&facultyAdmin)
		}
	}

	// 7. Ensure Ormawa Admin User
	var ormawaAdmin models.User
	hashOA, _ := bcrypt.GenerateFromPassword([]byte("ormawa123"), bcrypt.DefaultCost)
	if err := config.DB.Where("email = ?", "ormawa@bku.ac.id").First(&ormawaAdmin).Error; err != nil {
		ormawaAdmin = models.User{Email: "ormawa@bku.ac.id", Password: string(hashOA), Role: "ormawa_admin"}
		config.DB.Create(&ormawaAdmin)
		fmt.Println("✅ [SEEDER] Created Ormawa Admin: ormawa@bku.ac.id")
	} else {
		ormawaAdmin.Password = string(hashOA)
		ormawaAdmin.Role = "ormawa_admin"
		config.DB.Save(&ormawaAdmin)
	}

	// 8. Ensure Student User
	var studentUser models.User
	if err := config.DB.Unscoped().Where("email = ?", "student@bku.ac.id").First(&studentUser).Error; err != nil {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("student123"), bcrypt.DefaultCost)
		studentUser = models.User{Email: "student@bku.ac.id", Password: string(hashedPassword), Role: "student"}
		if err := config.DB.Create(&studentUser).Error; err != nil {
			fmt.Println("⚠️ [SEEDER] Failed to create Student User, it may already exist due to unique constraints:", err)
		} else {
			fmt.Println("✅ [SEEDER] Created User: student@bku.ac.id (role: student)")
		}
	} else {
		if studentUser.Role != "student" || studentUser.DeletedAt.Valid {
			studentUser.Role = "student"
			studentUser.DeletedAt.Valid = false
			config.DB.Unscoped().Save(&studentUser)
		}
	}

	// 9. Ensure Mahasiswa
	var student models.Mahasiswa
	if err := config.DB.Unscoped().Where("nim = ?", "BKU2024001").First(&student).Error; err != nil {
		student = models.Mahasiswa{
			PenggunaID:       studentUser.ID,
			NIM:              "BKU2024001",
			Nama:             "Mahasiswa Demo",
			FakultasID:       fakultasFH.ID,
			ProgramStudiID:   majorFH.ID,
			DosenPAID:        &dosen.ID,
			SemesterSekarang: 2,
			StatusAkun:       "Aktif",
		}
		if err := config.DB.Create(&student).Error; err != nil {
			fmt.Println("⚠️ [SEEDER] Failed to create Mahasiswa:", err)
		} else {
			fmt.Println("✅ [SEEDER] Created Mahasiswa: BKU2024001")
		}
	} else {
		student.DeletedAt.Valid = false
		student.FakultasID = fakultasFH.ID
		student.ProgramStudiID = majorFH.ID
		if student.PenggunaID == 0 {
			student.PenggunaID = studentUser.ID
		}
		config.DB.Unscoped().Save(&student)
	}

	// 10. Ensure Student Voice (Aspirasi)
	var aspirasiCount int64
	config.DB.Model(&models.Aspirasi{}).Count(&aspirasiCount)
	if aspirasiCount == 0 && student.ID != 0 {
		aspirasis := []models.Aspirasi{
			{
				MahasiswaID: student.ID,
				Judul:       "AC Mati di Ruang 301",
				Isi:         "Mohon bantuan perbaikan AC di ruang 301 Gedung C.",
				Kategori:    "Fasilitas",
				Tujuan:      "Sarpras",
				Status:      "Selesai",
				IsAnonim:    false,
				Respon:      "AC sudah diperbaiki oleh tim sarpras.",
			},
			{
				MahasiswaID: student.ID,
				Judul:       "Keterlambatan Input Nilai",
				Isi:         "Nilai Farmakologi belum muncul di KHS.",
				Kategori:    "Akademik",
				Tujuan:      "Akademik",
				Status:      "Diproses",
				IsAnonim:    true,
			},
		}
		for _, a := range aspirasis {
			config.DB.Create(&a)
		}
		fmt.Println("✅ [SEEDER] Created Aspirasi data")
	}

	// 11. Ensure more Ormawa and Riwayat Organisasi
	var ormawaPMI models.Ormawa
	if err := config.DB.Where("nama = ?", "UKM Korps Sukarela PMI").First(&ormawaPMI).Error; err != nil {
		ormawaPMI = models.Ormawa{Nama: "UKM Korps Sukarela PMI", Deskripsi: "Unit Kegiatan Mahasiswa di bidang kemanusiaan."}
		config.DB.Create(&ormawaPMI)
	}

	var ormawaHMF models.Ormawa
	if err := config.DB.Where("nama = ?", "Himpunan Mahasiswa Farmasi").First(&ormawaHMF).Error; err != nil {
		ormawaHMF = models.Ormawa{Nama: "Himpunan Mahasiswa Farmasi", Deskripsi: "Organisasi mahasiswa tingkat program studi."}
		config.DB.Create(&ormawaHMF)
	}

	// Update sequence manually if needed (postgres fix)
	config.DB.Exec("SELECT setval('ormawa.ormawa_id_seq', (SELECT MAX(id) FROM ormawa.ormawa))")

	var riwayatCount int64
	config.DB.Model(&models.RiwayatOrganisasi{}).Count(&riwayatCount)
	if riwayatCount == 0 && student.ID != 0 && ormawaPMI.ID != 0 && ormawaHMF.ID != 0 {
		riwayats := []models.RiwayatOrganisasi{
			{
				MahasiswaID:      student.ID,
				OrmawaID:         ormawaPMI.ID,
				NamaOrganisasi:   ormawaPMI.Nama,
				Tipe:             "UKM",
				Jabatan:          "Anggota Divisi Medis",
				PeriodeMulai:     2023,
				StatusVerifikasi: "Diverifikasi",
			},
			{
				MahasiswaID:      student.ID,
				OrmawaID:         ormawaHMF.ID,
				NamaOrganisasi:   ormawaHMF.Nama,
				Tipe:             "Himpunan Prodi",
				Jabatan:          "Sekretaris Umum",
				PeriodeMulai:     2024,
				StatusVerifikasi: "Menunggu",
			},
		}
		for _, r := range riwayats {
			config.DB.Create(&r)
		}
		fmt.Println("✅ [SEEDER] Created Riwayat Organisasi data")
	}

	fmt.Println("🏁 [SEEDER] All data seeded successfully.")
	return nil
}

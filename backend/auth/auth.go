package auth

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"siakad-backend/config"
	"siakad-backend/controllers/kencana"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type loginRequest struct {
	Identifier string `json:"identifier"`
	Email      string `json:"email"`
	NIM        string `json:"nim"`
	Password   string `json:"password"`
}

type userResponse struct {
	ID             uint     `json:"id"`
	Email          string   `json:"email"`
	Role           string   `json:"role"`
	RoleDisplay    string   `json:"role_display,omitempty"`
	OrmawaName     string   `json:"ormawa_name,omitempty"`
	NIM            string   `json:"nim,omitempty"`
	Nama           string   `json:"nama,omitempty"`
	FakultasID     *uint    `json:"fakultas_id,omitempty"`
	ProgramStudiID *uint    `json:"program_studi_id,omitempty"`
	OrmawaID       *uint    `json:"ormawa_id,omitempty"`
	Permissions    []string `json:"permissions,omitempty"`
}

type roleMeta struct {
	Label       string `json:"label"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
}

func getRoleMeta(role string) roleMeta {
	switch role {
	case "super_admin":
		return roleMeta{"Super Admin", "Kelola seluruh sistem akademik", "shield", "#6366F1"}
	case "faculty_admin":
		return roleMeta{"Admin Fakultas", "Kelola data akademik dan mahasiswa", "building-2", "#0EA5E9"}
	case "psikolog":
		return roleMeta{"Psikolog", "Konseling dan asesmen psikologi mahasiswa", "brain", "#8B5CF6"}
	case "tenaga_kesehatan":
		return roleMeta{"Tenaga Kesehatan", "Layanan kesehatan dan pemeriksaan mahasiswa", "heart-pulse", "#10B981"}
	case "ormawa", "ormawa_admin":
		return roleMeta{"Ormawa", "Kelola organisasi mahasiswa", "users", "#F59E0B"}
	case "dosen":
		return roleMeta{"Dosen", "Portal dosen pengajar", "graduation-cap", "#EC4899"}
	case "mahasiswa", "student":
		return roleMeta{"Mahasiswa", "Portal layanan mahasiswa", "book-open", "#3B82F6"}
	case "kencana_admin":
		return roleMeta{"Admin Kencana", "Kelola program PKKMB Kencana", "sparkles", "#F97316"}
	case "kencana_mentor":
		return roleMeta{"Mentor Kencana", "Bimbingan peserta PKKMB", "hand-helping", "#14B8A6"}
	default:
		label := strings.ReplaceAll(role, "_", " ")
		words := strings.Fields(label)
		for i, w := range words {
			if len(w) > 0 {
				words[i] = strings.ToUpper(w[:1]) + w[1:]
			}
		}
		return roleMeta{strings.Join(words, " "), "Akses portal " + role, "user", "#6B7280"}
	}
}

func jwtSecret() []byte {
	return config.GetJWTSecret()
}

func createToken(userID uint, studentID uint, nim string, role string, facultyID *uint, programStudiID *uint, ormawaID *uint, ormawaAssign string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":  userID,
		"sid":  studentID,
		"nim":  nim,
		"role": role,
		"fid":  facultyID,
		"pid":  programStudiID,
		"oid":  ormawaID,
		"oas":  ormawaAssign,
		"iat":  now.Unix(),
		"exp":  now.Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret())
}

func createTempToken(userID uint) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub": userID,
		"typ": "role_select",
		"iat": now.Unix(),
		"exp": now.Add(5 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret())
}

func createRefreshToken(userID uint, studentID uint, nim string, role string, facultyID *uint, programStudiID *uint, ormawaID *uint, ormawaAssign string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":  userID,
		"sid":  studentID,
		"nim":  nim,
		"role": role,
		"fid":  facultyID,
		"pid":  programStudiID,
		"oid":  ormawaID,
		"oas":  ormawaAssign,
		"typ":  "refresh",
		"iat":  now.Unix(),
		"exp":  now.Add(7 * 24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret())
}

func setRefreshTokenCookie(c *fiber.Ctx, tokenString string) {
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    tokenString,
		Expires:  time.Now().Add(7 * 24 * time.Hour),
		HTTPOnly: true,
		Secure:   false, // Set true in production if using HTTPS
		SameSite: "Lax",
		Path:     "/",
	})
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

func getUserPermissions(user models.User, roleName string, studentID uint) []string {
	var permissions []string

	// If the role is related to Ormawa
	if roleName == "ormawa" || roleName == "ormawa_admin" {
		if studentID != 0 {
			var membership models.OrmawaAnggota
			// Find active membership for the student (case-insensitive status check)
			if err := config.DB.Where("mahasiswa_id = ? AND LOWER(status) = 'aktif'", studentID).First(&membership).Error; err == nil {
				var ormawaRole models.OrmawaRole
				// Find custom role in that Ormawa case-insensitively
				if err := config.DB.Where("ormawa_id = ? AND LOWER(nama) = LOWER(?)", membership.OrmawaID, membership.Role).First(&ormawaRole).Error; err == nil {
					var customPerms []string
					if err := json.Unmarshal(ormawaRole.Permissions, &customPerms); err == nil && len(customPerms) > 0 {
						return customPerms
					}
				}
				
				// Fallback if no custom role is defined in the database:
				roleLower := strings.ToLower(membership.Role)
				if roleLower == "ketua" || roleLower == "ketua umum" {
					return []string{"*"}
				}
				
				if roleLower == "wakil ketua" {
					return []string{
						"view_dashboard", "view_notifications",
						"view_members", "create_members", "edit_members",
						"view_staff", "manage_staff", "view_structure", "manage_structure",
						"view_proposal", "create_proposal", "edit_proposal", "delete_proposal",
						"view_lpj", "create_lpj", "edit_lpj", "upload_lpj_doc", "delete_lpj",
						"view_calendar", "create_calendar", "edit_calendar", "delete_calendar",
						"view_attendance", "submit_attendance", "edit_attendance",
						"view_finance", "create_finance",
						"view_aspirations", "respond_aspirations",
						"view_announcements", "create_announcements", "edit_announcements", "delete_announcements",
						"view_settings",
					}
				}
				
				if roleLower == "sekretaris" {
					return []string{
						"view_dashboard", "view_notifications",
						"view_members", "create_members", "edit_members",
						"view_staff", "manage_staff", "view_structure",
						"view_proposal", "create_proposal", "edit_proposal", "delete_proposal",
						"view_lpj", "create_lpj", "edit_lpj", "upload_lpj_doc",
						"view_calendar", "create_calendar", "edit_calendar", "delete_calendar",
						"view_attendance", "submit_attendance", "edit_attendance",
						"view_announcements", "create_announcements", "edit_announcements", "delete_announcements",
					}
				}
				
				if roleLower == "bendahara" {
					return []string{
						"view_dashboard", "view_notifications",
						"view_lpj", "create_lpj", "edit_lpj", "upload_lpj_doc",
						"view_finance", "create_finance", "delete_finance",
					}
				}

				if roleLower == "kepala divisi" || roleLower == "kadiv" {
					return []string{
						"view_dashboard", "view_notifications",
						"view_members",
						"view_staff", "view_structure",
						"view_proposal", "create_proposal", "edit_proposal",
						"view_lpj", "create_lpj", "upload_lpj_doc",
						"view_calendar", "create_calendar", "edit_calendar", "delete_calendar",
						"view_attendance", "submit_attendance",
						"view_announcements", "create_announcements", "edit_announcements",
					}
				}

				// Standard fallback for Staff/Anggota or any other role
				return []string{
					"view_dashboard", "view_notifications",
					"view_calendar", "view_announcements",
				}
			}
		} else {
			// If they don't have a student profile (e.g. main admin account like ormawa@bku.ac.id),
			// they should have full access by default.
			return []string{"*"}
		}
	}

	// If the role is related to Prodi Admin
	if roleName == "prodi_admin" {
		var prodiRole models.FakultasProdiRole
		if user.FakultasID != nil && user.OrmawaAssign != "" {
			if err := config.DB.Where("fakultas_id = ? AND LOWER(nama) = LOWER(?)", *user.FakultasID, strings.ToLower(user.OrmawaAssign)).First(&prodiRole).Error; err == nil {
				var customPerms []string
				if err := json.Unmarshal(prodiRole.Permissions, &customPerms); err == nil && len(customPerms) > 0 {
					return customPerms
				}
			}
		}
		// Fallback default permissions for prodi_admin
		return []string{"view_dashboard", "view_mahasiswa"}
	}

	// Fallback to standard RBAC permissions
	var rbacRole models.RBACRole
	if err := config.DB.Where("key = ?", roleName).First(&rbacRole).Error; err == nil {
		json.Unmarshal(rbacRole.Permissions, &permissions)
	}
	return permissions
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
	err := config.DB.Preload("Pengguna").Preload("ProgramStudi").Preload("Fakultas").Where("nim = ?", identifier).First(&student).Error
	if err == nil {
		user = student.Pengguna
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
		// Always try to load student profile if they have one linked
		_ = config.DB.Preload("ProgramStudi").Preload("Fakultas").Where("pengguna_id = ?", user.ID).First(&student).Error
	}

	if student.ID != 0 {
		nim = student.NIM
		// Lookup active Ormawa membership (unlimited for multi-ormawa detection)
		var memberships []models.OrmawaAnggota
		config.DB.Where("mahasiswa_id = ? AND LOWER(status) = 'aktif'", student.ID).Find(&memberships)
		if len(memberships) > 0 {
			user.OrmawaID = &memberships[0].OrmawaID
		}
	}

	// Password check
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Email/NIM atau password salah",
		})
	}

	// Multi-role check: if user.Role contains commas, require role selection
	allRolesRaw := strings.Split(roleName, ",")
	var allRoles []string
	hasOrmawa := false
	for _, r := range allRolesRaw {
		rClean := strings.TrimSpace(r)
		if rClean != "" {
			allRoles = append(allRoles, rClean)
			if rClean == "ormawa" {
				hasOrmawa = true
			}
		}
	}

	// Dynamically check if this user is a student with an active Ormawa membership
	if student.ID != 0 && !hasOrmawa {
		var membershipCount int64
		config.DB.Model(&models.OrmawaAnggota{}).Where("mahasiswa_id = ? AND LOWER(status) = 'aktif'", student.ID).Count(&membershipCount)
		if membershipCount > 0 {
			allRoles = append(allRoles, "ormawa")
		}
	}
	if len(allRoles) > 1 {
		tempToken, err := createTempToken(user.ID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status":  "error",
				"message": "Gagal membuat token sementara",
			})
		}

		roleOptions := []fiber.Map{}
		for _, r := range allRoles {
			meta := getRoleMeta(r)

			// Custom meta for dynamic Ormawa roles
			if r == "ormawa" && student.ID != 0 {
				var membership models.OrmawaAnggota
				if err := config.DB.Preload("Ormawa").Where("mahasiswa_id = ? AND LOWER(status) = 'aktif'", student.ID).First(&membership).Error; err == nil {
					meta.Label = fmt.Sprintf("Ormawa (%s)", membership.Role)
					if membership.Ormawa.Nama != "" {
						meta.Description = fmt.Sprintf("Akses sebagai %s di %s", membership.Role, membership.Ormawa.Nama)
					} else {
						meta.Description = fmt.Sprintf("Akses sebagai %s organisasi mahasiswa", membership.Role)
					}
				}
			}

			roleOptions = append(roleOptions, fiber.Map{
				"role":        r,
				"label":       meta.Label,
				"description": meta.Description,
				"icon":        meta.Icon,
				"color":       meta.Color,
			})
		}

		// Try to get display name from linked profiles
		var displayName string
		var psi models.Psikolog
		if err := config.DB.Where("user_id = ?", user.ID).First(&psi).Error; err == nil {
			displayName = psi.Nama
		}
		if displayName == "" {
			var tk models.TenagaKesehatan
			if err := config.DB.Where("user_id = ?", user.ID).First(&tk).Error; err == nil {
				displayName = tk.Nama
			}
		}

		return c.JSON(fiber.Map{
			"success": true,
			"status":  "success",
			"data": fiber.Map{
				"requires_role_selection": true,
				"temp_token":             tempToken,
				"roles":                  roleOptions,
				"user": fiber.Map{
					"id":    user.ID,
					"email": user.Email,
					"nama":  displayName,
				},
			},
		})
	}

	var displayName string
	if student.ID != 0 {
		displayName = student.Nama
	} else {
		if user.FakultasID != nil && *user.FakultasID != 0 {
			var fak models.Fakultas
			if err := config.DB.First(&fak, *user.FakultasID).Error; err == nil {
				displayName = "Admin " + fak.Nama
			}
		}
		if displayName == "" {
			var psi models.Psikolog
			if err := config.DB.Where("user_id = ?", user.ID).First(&psi).Error; err == nil {
				displayName = psi.Nama
			}
		}
		if displayName == "" {
			var tk models.TenagaKesehatan
			if err := config.DB.Where("user_id = ?", user.ID).First(&tk).Error; err == nil {
				displayName = tk.Nama
			}
		}
	}

	token, err := createToken(user.ID, student.ID, nim, roleName, user.FakultasID, user.ProgramStudiID, user.OrmawaID, user.OrmawaAssign)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to create access token",
		})
	}

	if rt, err := createRefreshToken(user.ID, student.ID, nim, roleName, user.FakultasID, user.ProgramStudiID, user.OrmawaID, user.OrmawaAssign); err == nil {
		setRefreshTokenCookie(c, rt)
	}

	permissions := getUserPermissions(user, roleName, student.ID)

	return c.JSON(fiber.Map{
		"success": true,
		"status":  "success",
		"data": fiber.Map{
			"token":        token,
			"access_token": token,
			"mahasiswa":    student, // although for admin it might be empty
			"user": userResponse{
				ID:             user.ID,
				Email:          user.Email,
				Role:           roleName,
				NIM:            student.NIM,
				Nama:           displayName,
				FakultasID:     user.FakultasID,
				ProgramStudiID: user.ProgramStudiID,
				OrmawaID:       user.OrmawaID,
				Permissions:    permissions,
			},
		},
	})
}

func LoginSelectRole(c *fiber.Ctx) error {
	var body struct {
		TempToken    string `json:"temp_token"`
		SelectedRole string `json:"selected_role"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request payload",
		})
	}

	if body.TempToken == "" || body.SelectedRole == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Token dan role harus diisi",
		})
	}

	// Parse and validate temp token
	token, err := jwt.Parse(body.TempToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret(), nil
	})
	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Token sementara tidak valid atau sudah kadaluarsa. Silakan login ulang.",
		})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Token tidak valid",
		})
	}

	// Verify token type
	if typ, ok := claims["typ"].(string); !ok || typ != "role_select" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Token tidak valid untuk pemilihan role",
		})
	}

	userID := uint(claims["sub"].(float64))

	// Get user from DB
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "User tidak ditemukan",
		})
	}

	// Validate selected role is in user's comma-separated roles
	userRoles := strings.Split(user.Role, ",")
	validRole := false
	for _, r := range userRoles {
		if strings.TrimSpace(r) == body.SelectedRole {
			validRole = true
			break
		}
	}
	if !validRole && body.SelectedRole == "ormawa" {
		var student models.Mahasiswa
		_ = config.DB.Where("pengguna_id = ?", user.ID).First(&student).Error
		if student.ID != 0 {
			var membershipCount int64
			config.DB.Model(&models.OrmawaAnggota{}).Where("mahasiswa_id = ? AND LOWER(status) = 'aktif'", student.ID).Count(&membershipCount)
			if membershipCount > 0 {
				validRole = true
			}
		}
	}
	if !validRole {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"status":  "error",
			"message": "Role tidak tersedia untuk akun ini",
		})
	}

	selectedRole := body.SelectedRole

	var student models.Mahasiswa
	var nim string

	// Always load student profile if it exists, to ensure student ID and NIM claims are present in JWT token
	_ = config.DB.Preload("ProgramStudi").Preload("Fakultas").Where("pengguna_id = ?", user.ID).First(&student).Error
	if student.ID != 0 {
		nim = student.NIM
		var memberships []models.OrmawaAnggota
		if err := config.DB.Where("mahasiswa_id = ? AND LOWER(status) = 'aktif'", student.ID).Limit(1).Find(&memberships).Error; err == nil && len(memberships) > 0 {
			user.OrmawaID = &memberships[0].OrmawaID
		}
	}

	accessToken, err := createToken(user.ID, student.ID, nim, selectedRole, user.FakultasID, user.ProgramStudiID, user.OrmawaID, user.OrmawaAssign)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal membuat token akses",
		})
	}

	if rt, err := createRefreshToken(user.ID, student.ID, nim, selectedRole, user.FakultasID, user.ProgramStudiID, user.OrmawaID, user.OrmawaAssign); err == nil {
		setRefreshTokenCookie(c, rt)
	}

	permissions := getUserPermissions(user, selectedRole, student.ID)

	// Get display name
	var displayName string
	if student.ID != 0 {
		displayName = student.Nama
	} else {
		if user.FakultasID != nil && *user.FakultasID != 0 {
			var fak models.Fakultas
			if err := config.DB.First(&fak, *user.FakultasID).Error; err == nil {
				displayName = "Admin " + fak.Nama
			}
		}
		if displayName == "" {
			var psi models.Psikolog
			if err := config.DB.Where("user_id = ?", user.ID).First(&psi).Error; err == nil {
				displayName = psi.Nama
			}
		}
		if displayName == "" {
			var tk models.TenagaKesehatan
			if err := config.DB.Where("user_id = ?", user.ID).First(&tk).Error; err == nil {
				displayName = tk.Nama
			}
		}
	}

	var roleDisplay string
	var ormawaName string
	if (selectedRole == "ormawa" || selectedRole == "ormawa_admin") && student.ID != 0 {
		var membership models.OrmawaAnggota
		if err := config.DB.Preload("Ormawa").Where("mahasiswa_id = ? AND LOWER(status) = 'aktif'", student.ID).First(&membership).Error; err == nil {
			roleDisplay = membership.Role
			ormawaName = membership.Ormawa.Nama
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"status":  "success",
		"data": fiber.Map{
			"token":        accessToken,
			"access_token": accessToken,
			"mahasiswa":    student,
			"user": userResponse{
				ID:             user.ID,
				Email:          user.Email,
				Role:           selectedRole,
				RoleDisplay:    roleDisplay,
				OrmawaName:     ormawaName,
				NIM:            student.NIM,
				Nama:           displayName,
				FakultasID:     user.FakultasID,
				ProgramStudiID: user.ProgramStudiID,
				OrmawaID:       user.OrmawaID,
				Permissions:    permissions,
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
	if student.ID != 0 {
		var membership models.OrmawaAnggota
		if err := config.DB.Where("mahasiswa_id = ? AND LOWER(status) = 'aktif'", student.ID).First(&membership).Error; err == nil {
			user.OrmawaID = &membership.OrmawaID
		}
	}

	roleVal, ok := claims["role"].(string)
	if !ok || roleVal == "" {
		roleVal = user.Role
	}

	permissions := getUserPermissions(user, roleVal, student.ID)

	var roleDisplay string
	var ormawaName string
	if (roleVal == "ormawa" || roleVal == "ormawa_admin") && student.ID != 0 {
		var membership models.OrmawaAnggota
		if err := config.DB.Preload("Ormawa").Where("mahasiswa_id = ? AND LOWER(status) = 'aktif'", student.ID).First(&membership).Error; err == nil {
			roleDisplay = membership.Role
			ormawaName = membership.Ormawa.Nama
		}
	}

	var displayName string
	if student.ID != 0 {
		displayName = student.Nama
	} else {
		if user.FakultasID != nil && *user.FakultasID != 0 {
			var fak models.Fakultas
			if err := config.DB.First(&fak, *user.FakultasID).Error; err == nil {
				displayName = "Admin " + fak.Nama
			}
		}
		if displayName == "" {
			var psi models.Psikolog
			if err := config.DB.Where("user_id = ?", user.ID).First(&psi).Error; err == nil {
				displayName = psi.Nama
			}
		}
		if displayName == "" {
			var tk models.TenagaKesehatan
			if err := config.DB.Where("user_id = ?", user.ID).First(&tk).Error; err == nil {
				displayName = tk.Nama
			}
		}
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"user": userResponse{
				ID:             user.ID,
				Email:          user.Email,
				Role:           roleVal,
				RoleDisplay:    roleDisplay,
				OrmawaName:     ormawaName,
				NIM:            student.NIM,
				Nama:           displayName,
				FakultasID:     user.FakultasID,
				ProgramStudiID: user.ProgramStudiID,
				OrmawaID:       user.OrmawaID,
				Permissions:    permissions,
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

	var oid *uint
	if o, ok := claims["oid"].(float64); ok {
		val := uint(o)
		oid = &val
	}

	var pid *uint
	if p, ok := claims["pid"].(float64); ok {
		val := uint(p)
		pid = &val
	}

	var oas string
	if as, ok := claims["oas"].(string); ok {
		oas = as
	}

	newAT, err := createToken(uint(claims["sub"].(float64)), uint(claims["sid"].(float64)), claims["nim"].(string), claims["role"].(string), fid, pid, oid, oas)
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

// RegisterMahasiswa handles student self-registration
func RegisterMahasiswa(c *fiber.Ctx) error {
	type RegisterRequest struct {
		NIM          string `json:"nim"`
		Email        string `json:"email"`
		Password     string `json:"password"`
		Nama         string `json:"nama"`
		FakultasID   uint   `json:"fakultas_id"`
		ProgramStudi uint   `json:"program_studi_id"`
	}

	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data tidak valid"})
	}

	// Validation
	req.NIM = strings.TrimSpace(req.NIM)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Password = strings.TrimSpace(req.Password)
	req.Nama = strings.TrimSpace(req.Nama)

	if req.NIM == "" || req.Email == "" || req.Password == "" || req.Nama == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "NIM, email, password, dan nama wajib diisi"})
	}

	// Check if NIM already registered
	var existingStudent models.Mahasiswa
	if err := config.DB.Where("nim = ?", req.NIM).First(&existingStudent).Error; err == nil {
		// Check if user already exists for this student
		if existingStudent.PenggunaID != 0 {
			var existingUser models.User
			if err := config.DB.First(&existingUser, existingStudent.PenggunaID).Error; err == nil {
				return c.Status(400).JSON(fiber.Map{"success": false, "message": "NIM ini sudah terdaftar. Silakan login atau reset password."})
			}
		}
		// Student record exists but no user - proceed to create user
	}

	// Check if email already taken by another user
	var existingUserByEmail models.User
	if err := config.DB.Where("LOWER(email) = ?", req.Email).First(&existingUserByEmail).Error; err == nil {
		// Check if this email belongs to a different student
		var studentWithEmail models.Mahasiswa
		if err := config.DB.Where("pengguna_id = ?", existingUserByEmail.ID).First(&studentWithEmail).Error; err == nil {
			if studentWithEmail.NIM != req.NIM {
				return c.Status(400).JSON(fiber.Map{"success": false, "message": "Email sudah digunakan oleh akun lain"})
			}
		} else {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Email sudah digunakan"})
		}
	}

	// Validate password strength
	if len(req.Password) < 8 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Password minimal 8 karakter"})
	}

	// Find student by NIM (must exist in database already)
	var student models.Mahasiswa
	if err := config.DB.Preload("Pengguna").Where("nim = ?", req.NIM).First(&student).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa dengan NIM ini tidak ditemukan. Hubungi admin untuk data NIM."})
	}

	// If student already has user account, don't allow re-registration
	if student.PenggunaID != 0 && student.Pengguna.ID != 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Akun dengan NIM ini sudah terdaftar"})
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memproses password"})
	}

	// Create user
	newUser := models.User{
		Email:    req.Email,
		Password: string(hash),
		Role:     "mahasiswa",
	}

	if req.FakultasID != 0 {
		newUser.FakultasID = &req.FakultasID
	}

	if err := config.DB.Create(&newUser).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal membuat akun: " + err.Error()})
	}

	// Link user to student
	student.PenggunaID = newUser.ID
	student.EmailKampus = req.Email
	if req.FakultasID != 0 {
		student.FakultasID = req.FakultasID
	}
	if req.ProgramStudi != 0 {
		student.ProgramStudiID = req.ProgramStudi
	}
	config.DB.Save(&student)

	// Generate tokens
	fakultasID := student.FakultasID
	var prodiID *uint
	if student.ProgramStudiID != 0 {
		prodiID = &student.ProgramStudiID
	}
	accessToken, _ := createToken(newUser.ID, student.ID, student.NIM, "mahasiswa", &fakultasID, prodiID, nil, "")
	refreshToken, _ := createRefreshToken(newUser.ID, student.ID, student.NIM, "mahasiswa", &fakultasID, prodiID, nil, "")
	setRefreshTokenCookie(c, refreshToken)

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Registrasi berhasil",
		"data": fiber.Map{
			"user": fiber.Map{
				"id":    newUser.ID,
				"email": newUser.Email,
				"role":  "mahasiswa",
				"nim":   student.NIM,
				"nama":  student.Nama,
			},
			"access_token": accessToken,
		},
	})
}

// UpdateEmail allows authenticated student to update their email
func UpdateEmail(c *fiber.Ctx) error {
	UserID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	type UpdateEmailRequest struct {
		Email          string `json:"email"`
		ConfirmEmail   string `json:"confirm_email"`
		Password       string `json:"password"`
	}

	var req UpdateEmailRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data tidak valid"})
	}

	// Normalize
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.ConfirmEmail = strings.TrimSpace(strings.ToLower(req.ConfirmEmail))
	req.Password = strings.TrimSpace(req.Password)

	// Validation
	if req.Email == "" || req.ConfirmEmail == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Email baru, konfirmasi email, dan password wajib diisi"})
	}

	if req.Email != req.ConfirmEmail {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Email dan konfirmasi email tidak cocok"})
	}

	// Validate email format
	if !isValidEmail(req.Email) {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format email tidak valid"})
	}

	// Get current user
	var user models.User
	if err := config.DB.First(&user, UserID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "User tidak ditemukan"})
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Password salah"})
	}

	// Check if new email is same as current
	if strings.ToLower(user.Email) == req.Email {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Email baru sama dengan email saat ini"})
	}

	// Check if email is already taken by another user
	var existingUser models.User
	if err := config.DB.Where("LOWER(email) = ? AND id != ?", req.Email, UserID).First(&existingUser).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Email sudah digunakan oleh akun lain"})
	}

	// Update email in users table
	oldEmail := user.Email
	user.Email = req.Email
	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui email"})
	}

	// Sync to mahasiswa table (EmailKampus)
	var student models.Mahasiswa
	if err := config.DB.Where("pengguna_id = ?", UserID).First(&student).Error; err == nil {
		student.EmailKampus = req.Email
		student.EmailPersonal = req.Email
		config.DB.Save(&student)
	}

	// Log activity
	log.Printf("[AUTH] Email updated for user %d: %s -> %s", UserID, oldEmail, req.Email)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Email berhasil diperbarui",
		"data": fiber.Map{
			"email":     req.Email,
			"old_email": oldEmail,
		},
	})
}

func isValidEmail(email string) bool {
	if email == "" {
		return false
	}
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return false
	}
	if len(parts[0]) < 1 || len(parts[1]) < 3 {
		return false
	}
	if !strings.Contains(parts[1], ".") {
		return false
	}
	return true
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
		if fid, ok := claims["fid"].(float64); ok {
			c.Locals("fakultas_id", uint(fid))
		}
		if oid, ok := claims["oid"].(float64); ok {
			c.Locals("ormawa_id", uint(oid))
		}

		return c.Next()
	}
}

func EnsureBootstrapData() error {
	fmt.Println("🚀 [SEEDER] Starting clean bootstrap process...")

	// Sync all Postgres serial sequences to prevent duplicate key constraint violations
	if err := SyncPostgresSequences(config.DB); err != nil {
		log.Printf("[SEEDER-WARN] Failed to sync database sequences: %v", err)
	}

	// 1. Ensure Fakultas (Real UBK Structure)
	fakultasSeeds := []models.Fakultas{
		{Nama: "Fakultas Farmasi", Kode: "FF", Dekan: "Dr. Farmasi"},
		{Nama: "Fakultas Keperawatan", Kode: "FK", Dekan: "Dr. Keperawatan"},
		{Nama: "Fakultas Ilmu Kesehatan", Kode: "FIK", Dekan: "Dr. Kesehatan"},
		{Nama: "Fakultas Sosial", Kode: "FS", Dekan: "Dr. Sosial"},
	}
	for _, seed := range fakultasSeeds {
		var existing models.Fakultas
		// Use UNIQUE Kode to prevent duplication
		if err := config.DB.Where("kode = ?", seed.Kode).First(&existing).Error; err != nil {
			config.DB.Create(&seed)
		}
	}

	// 2. Load fakultas map
	var allFakultas []models.Fakultas
	if err := config.DB.Find(&allFakultas).Error; err != nil {
		return err
	}
	fakultasByKode := map[string]models.Fakultas{}
	for _, fak := range allFakultas {
		fakultasByKode[fak.Kode] = fak
	}

	// 3. Ensure baseline prodi (idempotent)
	prodiSeeds := []models.ProgramStudi{}
	if ff, ok := fakultasByKode["FF"]; ok {
		prodiSeeds = append(prodiSeeds,
			models.ProgramStudi{Nama: "Farmasi", Jenjang: "S1", Kode: "FF-FAR-S1", FakultasID: ff.ID},
			models.ProgramStudi{Nama: "Farmasi", Jenjang: "D3", Kode: "FF-FAR-D3", FakultasID: ff.ID},
		)
	}
	if fk, ok := fakultasByKode["FK"]; ok {
		prodiSeeds = append(prodiSeeds,
			models.ProgramStudi{Nama: "Keperawatan", Jenjang: "S1", Kode: "FK-KEP-S1", FakultasID: fk.ID},
			models.ProgramStudi{Nama: "Keperawatan", Jenjang: "D3", Kode: "FK-KEP-D3", FakultasID: fk.ID},
		)
	}
	if fik, ok := fakultasByKode["FIK"]; ok {
		prodiSeeds = append(prodiSeeds,
			models.ProgramStudi{Nama: "Kebidanan", Jenjang: "D3", Kode: "FIK-KBD-D3", FakultasID: fik.ID},
			models.ProgramStudi{Nama: "Kesehatan Masyarakat", Jenjang: "S1", Kode: "FIK-KM-S1", FakultasID: fik.ID},
		)
	}
	if fs, ok := fakultasByKode["FS"]; ok {
		prodiSeeds = append(prodiSeeds,
			models.ProgramStudi{Nama: "Ilmu Komunikasi", Jenjang: "S1", Kode: "FS-IKOM-S1", FakultasID: fs.ID},
			models.ProgramStudi{Nama: "Psikologi", Jenjang: "S1", Kode: "FS-PSI-S1", FakultasID: fs.ID},
		)
	}
	for _, seed := range prodiSeeds {
		var existing models.ProgramStudi
		err := config.DB.Where("LOWER(nama) = LOWER(?) AND LOWER(jenjang) = LOWER(?)", seed.Nama, seed.Jenjang).First(&existing).Error
		if err != nil {
			config.DB.Create(&seed)
		}
	}

	// 4. Ensure Super Admin
	superAdminUser, err := ensureUser("superadmin@bku.ac.id", "superadmin123", "super_admin", nil, nil)
	if err != nil {
		return err
	}

	// 5. Ensure Faculty Admins
	for _, fak := range allFakultas {
		email := strings.ToLower(fmt.Sprintf("admin.%s@bku.ac.id", fak.Kode))
		if _, err := ensureUser(email, "adminfak123", "faculty_admin", &fak.ID, nil); err != nil {
			return err
		}
	}

	// 6. Ensure mahasiswa seeds (multi faculty)
	studentSeeds := []struct {
		NIM          string
		Nama         string
		ProdiNama    string
		ProdiJenjang string
		FakKode      string
		TahunMasuk   int
	}{
		{NIM: "231FF01001", Nama: "Mahasiswa Farmasi", ProdiNama: "Farmasi", ProdiJenjang: "S1", FakKode: "FF", TahunMasuk: 2023},
		{NIM: "231FK01001", Nama: "Mahasiswa Keperawatan", ProdiNama: "Keperawatan", ProdiJenjang: "S1", FakKode: "FK", TahunMasuk: 2023},
		{NIM: "231FIK01001", Nama: "Mahasiswa Ilmu Kesehatan", ProdiNama: "Kesehatan Masyarakat", ProdiJenjang: "S1", FakKode: "FIK", TahunMasuk: 2023},
		{NIM: "231FS01001", Nama: "Mahasiswa Sosial", ProdiNama: "Ilmu Komunikasi", ProdiJenjang: "S1", FakKode: "FS", TahunMasuk: 2023},
	}
	for _, s := range studentSeeds {
		fak, ok := fakultasByKode[s.FakKode]
		if !ok {
			continue
		}

		var prodi models.ProgramStudi
		if err := config.DB.Where("LOWER(nama) = LOWER(?) AND LOWER(jenjang) = LOWER(?)", s.ProdiNama, s.ProdiJenjang).First(&prodi).Error; err != nil {
			continue
		}

		email := strings.ToLower(fmt.Sprintf("%s@student.bku.ac.id", s.NIM))
		user, err := ensureUser(email, "student123", "mahasiswa", &fak.ID, nil)
		if err != nil {
			return err
		}

		var mhs models.Mahasiswa
		if err := config.DB.Where("nim = ?", s.NIM).First(&mhs).Error; err != nil {
			mhs = models.Mahasiswa{
				PenggunaID:       user.ID,
				NIM:              s.NIM,
				Nama:             s.Nama,
				FakultasID:       fak.ID,
				ProgramStudiID:   prodi.ID,
				SemesterSekarang: 6,
				StatusAkun:       "Aktif",
				TahunMasuk:       s.TahunMasuk,
				JalurMasuk:       "SEEDER",
				EmailKampus:      email,
			}
			if err := config.DB.Create(&mhs).Error; err != nil {
				return err
			}
		} else {
			updates := map[string]interface{}{
				"pengguna_id":      user.ID,
				"nama":             s.Nama,
				"fakultas_id":      fak.ID,
				"program_studi_id": prodi.ID,
				"email_kampus":     email,
				"status_akun":      "Aktif",
			}
			if mhs.SemesterSekarang <= 0 {
				updates["semester_sekarang"] = 6
			}
			if err := config.DB.Model(&mhs).Updates(updates).Error; err != nil {
				return err
			}
		}
	}

	// 7. Ensure Ormawa role account + organisasi sample
	var defaultFakID *uint
	if ff, ok := fakultasByKode["FF"]; ok {
		defaultFakID = &ff.ID
	}
	ormawaUser, err := ensureUser("ormawa@bku.ac.id", "ormawa123", "ormawa", defaultFakID, nil)
	if err != nil {
		return err
	}

	var ormawa models.Ormawa
	if err := config.DB.Where("LOWER(singkatan) = LOWER(?)", "BEMKBK").First(&ormawa).Error; err != nil {
		var firstFak models.Fakultas
		config.DB.First(&firstFak)

		ormawa = models.Ormawa{
			Nama:          "BEM KBM Bhakti Kencana",
			Singkatan:     "BEMKBK",
			Deskripsi:     "Badan Eksekutif Mahasiswa tingkat universitas",
			FakultasID:    &firstFak.ID,
			Status:        "Aktif",
			Kategori:      "BEM",
			JumlahAnggota: 1,
			Email:         "ormawa@bku.ac.id",
		}
		if err := config.DB.Create(&ormawa).Error; err != nil {
			return err
		}
	}

	// Link user to Ormawa
	config.DB.Model(&ormawaUser).Update("ormawa_id", ormawa.ID)

	var sampleMhs models.Mahasiswa
	if err := config.DB.Where("nim = ?", "231FF01001").First(&sampleMhs).Error; err == nil {
		var anggota models.OrmawaAnggota
		if err := config.DB.Where("ormawa_id = ? AND mahasiswa_id = ?", ormawa.ID, sampleMhs.ID).First(&anggota).Error; err != nil {
			anggota = models.OrmawaAnggota{
				OrmawaID:    ormawa.ID,
				MahasiswaID: sampleMhs.ID,
				Role:        "Ketua",
				Status:      "Aktif",
				Divisi:      "Inti",
				JoinedAt:    time.Now(),
			}
			if err := config.DB.Create(&anggota).Error; err != nil {
				return err
			}
		}
	}

	// Ensure each seeded student has organisasi portfolio data
	for _, s := range studentSeeds {
		var mhs models.Mahasiswa
		if err := config.DB.Where("nim = ?", s.NIM).First(&mhs).Error; err != nil {
			continue
		}

		var riwayat models.RiwayatOrganisasi
		if err := config.DB.Where("mahasiswa_id = ? AND ormawa_id = ? AND jabatan = ?", mhs.ID, ormawa.ID, "Anggota").First(&riwayat).Error; err != nil {
			mulai := s.TahunMasuk
			selesai := s.TahunMasuk + 1
			riwayat = models.RiwayatOrganisasi{
				MahasiswaID:       mhs.ID,
				OrmawaID:          ormawa.ID,
				NamaOrganisasi:    ormawa.Nama,
				Tipe:              ormawa.Kategori,
				Jabatan:           "Anggota",
				PeriodeMulai:      mulai,
				PeriodeSelesai:    &selesai,
				DeskripsiKegiatan: "Aktif sebagai anggota organisasi kampus",
				Apresiasi:         "Partisipasi kegiatan internal",
				StatusVerifikasi:  "Terverifikasi",
				Periode:           fmt.Sprintf("%d/%d", mulai, selesai),
				Status:            "Aktif",
			}
			if err := config.DB.Create(&riwayat).Error; err != nil {
				return err
			}
		}
	}

	// 8. Ensure Dosen seed for counseling and academic workflows
	var sampleDosen models.Dosen
	if ff, ok := fakultasByKode["FF"]; ok {
		var prodiFarmasi models.ProgramStudi
		if err := config.DB.Where("LOWER(nama) = LOWER(?) AND LOWER(jenjang) = LOWER(?)", "Farmasi", "S1").First(&prodiFarmasi).Error; err == nil {
			dosenUser, err := ensureUser("dosen.farmasi@bku.ac.id", "dosen123", "dosen", &ff.ID, nil)
			if err != nil {
				return err
			}
			if err := config.DB.Where("n_id_n = ?", "0401000001").First(&sampleDosen).Error; err != nil {
				sampleDosen = models.Dosen{
					PenggunaID:     dosenUser.ID,
					NIDN:           "0401000001",
					Nama:           "Dr. Dosen Pembimbing",
					FakultasID:     ff.ID,
					ProgramStudiID: prodiFarmasi.ID,
				}
				if err := config.DB.Create(&sampleDosen).Error; err != nil {
					return err
				}
			}
		}
	}

	// 9. Seed Academic configuration for faculty admin menus
	var period models.AcademicPeriod
	if err := config.DB.Where("nama_periode = ?", "Genap 2025/2026").First(&period).Error; err != nil {
		period = models.AcademicPeriod{Name: "Genap 2025/2026", Semester: "Genap", AcademicYear: "2025/2026", IsActive: true, IsKRSOpen: true}
		if err := config.DB.Create(&period).Error; err != nil {
			return err
		}
	}

	// Ensure Kencana Period follows the active AcademicPeriod
	var kencanaPeriod models.KencanaPeriod
	kencanaPeriodName := "Kencana " + period.Name
	if err := config.DB.Where("name = ?", kencanaPeriodName).First(&kencanaPeriod).Error; err != nil {
		now := time.Now()
		start := now.AddDate(0, 0, -5)
		end := now.AddDate(0, 0, 30)
		kencanaPeriod = models.KencanaPeriod{
			Name:                  kencanaPeriodName,
			Year:                  now.Year(),
			Description:           "Periode orientasi mahasiswa baru untuk " + period.Name + ".",
			StartDate:             &start,
			EndDate:               &end,
			Status:                "active",
			UniversityPhaseStatus: "completed", // Set completed so faculty phases are open
			Theme:                 "Bhakti Kencana Berkarya",
			PassingGrade:          75,
			RemedialGrade:         50,
		}
		if err := config.DB.Create(&kencanaPeriod).Error; err == nil {
			// Auto initialize timeline phases and faculty phases
			kencana.EnsureTimelinePhases(kencanaPeriod.ID)
			kencana.EnsureFacultyPhases(kencanaPeriod.ID)
		}
	}

	var setting models.PengaturanAkademik
	if err := config.DB.Where("tahun_akademik = ? AND semester = ?", "2025/2026", "Genap").First(&setting).Error; err != nil {
		setting = models.PengaturanAkademik{TahunAkademik: "2025/2026", Semester: "Genap", IsKRSOpen: true, IsNilaiOpen: true, IsMBKMOpen: true}
		if err := config.DB.Create(&setting).Error; err != nil {
			return err
		}
	}

	var mbkm models.ProgramMBKM
	if err := config.DB.Where("nama_program = ?", "Magang Industri Farmasi").First(&mbkm).Error; err != nil {
		mbkm = models.ProgramMBKM{NamaProgram: "Magang Industri Farmasi", Jenis: "Magang", Mitra: "PT Sehat Sentosa", Deskripsi: "Program magang 1 semester", SKSKonversiDefault: 20, Periode: "2025/2026 Genap"}
		if err := config.DB.Create(&mbkm).Error; err != nil {
			return err
		}
	}

	// 10. Seed Student service menus
	if sampleMhs.ID != 0 {
		// Seed Beasiswa 1: Prestasi
		var bea models.Beasiswa
		if err := config.DB.Where("nama = ?", "Beasiswa Prestasi UBK").First(&bea).Error; err != nil {
			bea = models.Beasiswa{
				Nama:          "Beasiswa Prestasi UBK",
				Penyelenggara: "Universitas Bhakti Kencana",
				Deskripsi:     "Beasiswa untuk mahasiswa berprestasi akademik dan non akademik",
				Persyaratan:   "1. Mahasiswa aktif UBK\n2. IPK Minimal 3.25\n3. Memiliki sertifikat prestasi tingkat nasional/internasional\n4. Surat rekomendasi dekan fakultas",
				Deadline:      time.Now().AddDate(0, 6, 0),
				Kuota:         50,
				IPKMin:        3.25,
				Kategori:      "Prestasi",
				NilaiBantuan:  5000000,
				Anggaran:      250000000,
				FileKtm:       "wajib",
				FileTranskrip: "wajib",
				FileSertifikat: "wajib",
			}
			if err := config.DB.Create(&bea).Error; err != nil {
				return err
			}
		} else {
			// Always refresh deadline so catalog always shows this scholarship
			config.DB.Model(&bea).Updates(map[string]interface{}{
				"deadline":        time.Now().AddDate(0, 6, 0),
				"persyaratan":     "1. Mahasiswa aktif UBK\n2. IPK Minimal 3.25\n3. Memiliki sertifikat prestasi tingkat nasional/internasional\n4. Surat rekomendasi dekan fakultas",
				"file_ktm":        "wajib",
				"file_transkrip":  "wajib",
				"file_sertifikat": "wajib",
			})
		}

		// Seed Beasiswa 2: Internal
		var beaInternal models.Beasiswa
		if err := config.DB.Where("nama = ?", "Beasiswa Biaya Kuliah Internal").First(&beaInternal).Error; err != nil {
			beaInternal = models.Beasiswa{
				Nama:          "Beasiswa Biaya Kuliah Internal",
				Penyelenggara: "Yayasan Bhakti Kencana",
				Deskripsi:     "Beasiswa subsidi biaya kuliah penuh bagi mahasiswa kurang mampu yang berprestasi.",
				Persyaratan:   "1. Mahasiswa aktif UBK semester 2-8\n2. IPK Minimal 3.00\n3. Surat Keterangan Tidak Mampu (SKTM) resmi\n4. Surat pernyataan tidak sedang menerima beasiswa lain",
				Deadline:      time.Now().AddDate(0, 4, 0),
				Kuota:         30,
				IPKMin:        3.00,
				Kategori:      "Internal",
				NilaiBantuan:  8000000,
				Anggaran:      240000000,
				FileKtm:       "wajib",
				FileTranskrip: "wajib",
				FileSertifikat: "opsional",
			}
			if err := config.DB.Create(&beaInternal).Error; err != nil {
				return err
			}
		} else {
			config.DB.Model(&beaInternal).Updates(map[string]interface{}{
				"deadline":        time.Now().AddDate(0, 4, 0),
				"persyaratan":     "1. Mahasiswa aktif UBK semester 2-8\n2. IPK Minimal 3.00\n3. Surat Keterangan Tidak Mampu (SKTM) resmi\n4. Surat pernyataan tidak sedang menerima beasiswa lain",
				"file_ktm":        "wajib",
				"file_transkrip":  "wajib",
				"file_sertifikat": "opsional",
			})
		}

		// Rename category 'Alumni' to 'Mitra' for existing records
		config.DB.Model(&models.Beasiswa{}).Where("kategori = ?", "Alumni").Update("kategori", "Mitra")

		// Seed Beasiswa 3: Mitra
		var beaAlumni models.Beasiswa
		if err := config.DB.Where("nama = ?", "Beasiswa Alumni Peduli").First(&beaAlumni).Error; err != nil {
			beaAlumni = models.Beasiswa{
				Nama:          "Beasiswa Alumni Peduli",
				Penyelenggara: "Ikatan Alumni UBK",
				Deskripsi:     "Beasiswa yang didanai oleh para alumni UBK untuk mendukung generasi berikutnya.",
				Persyaratan:   "1. Mahasiswa aktif UBK semester 4 ke atas\n2. IPK Minimal 2.75\n3. Portofolio keaktifan organisasi/kegiatan sosial\n4. Lolos wawancara dengan perwakilan Ikatan Alumni",
				Deadline:      time.Now().AddDate(0, 3, 0),
				Kuota:         20,
				IPKMin:        2.75,
				Kategori:      "Mitra",
				NilaiBantuan:  3500000,
				Anggaran:      70000000,
				FileKtm:       "wajib",
				FileTranskrip: "wajib",
				FileSertifikat: "opsional",
			}
			if err := config.DB.Create(&beaAlumni).Error; err != nil {
				return err
			}
		} else {
			config.DB.Model(&beaAlumni).Updates(map[string]interface{}{
				"deadline":        time.Now().AddDate(0, 3, 0),
				"kategori":        "Mitra",
				"persyaratan":     "1. Mahasiswa aktif UBK semester 4 ke atas\n2. IPK Minimal 2.75\n3. Portofolio keaktifan organisasi/kegiatan sosial\n4. Lolos wawancara dengan perwakilan Ikatan Alumni",
				"file_ktm":        "wajib",
				"file_transkrip":  "wajib",
				"file_sertifikat": "opsional",
			})
		}

		var daftarBea models.BeasiswaPendaftaran
		if err := config.DB.Where("mahasiswa_id = ? AND beasiswa_id = ?", sampleMhs.ID, bea.ID).First(&daftarBea).Error; err != nil {
			daftarBea = models.BeasiswaPendaftaran{MahasiswaID: sampleMhs.ID, BeasiswaID: bea.ID, Status: "Diajukan", Catatan: "Dokumen lengkap", BuktiURL: "/uploads/sample-beasiswa.pdf"}
			if err := config.DB.Create(&daftarBea).Error; err != nil {
				return err
			}
		}

		var aspirasi models.Aspirasi
		if err := config.DB.Where("mahasiswa_id = ? AND judul = ?", sampleMhs.ID, "Peningkatan Fasilitas Laboratorium").First(&aspirasi).Error; err != nil {
			aspirasi = models.Aspirasi{MahasiswaID: sampleMhs.ID, Judul: "Peningkatan Fasilitas Laboratorium", Isi: "Mohon penambahan alat praktikum terbaru untuk mendukung pembelajaran.", Kategori: "Akademik", Tujuan: "Fakultas", Status: "Menunggu", Prioritas: "HIGH", IsAnonim: false}
			if err := config.DB.Create(&aspirasi).Error; err != nil {
				return err
			}
		}

		if sampleDosen.ID != 0 {
			var konseling models.Konseling
			if err := config.DB.Where("mahasiswa_id = ? AND topik = ?", sampleMhs.ID, "Rencana Studi Semester").First(&konseling).Error; err != nil {
				konseling = models.Konseling{MahasiswaID: sampleMhs.ID, DosenID: sampleDosen.ID, Tanggal: time.Now().AddDate(0, 0, 3), Topik: "Rencana Studi Semester", Status: "Terjadwal", Catatan: "Diskusi mata kuliah dan target IPK"}
				if err := config.DB.Create(&konseling).Error; err != nil {
					return err
				}
			}
		}

		var surat models.PengajuanSurat
		if err := config.DB.Where("mahasiswa_id = ? AND jenis = ?", sampleMhs.ID, "Surat Keterangan Aktif").First(&surat).Error; err != nil {
			surat = models.PengajuanSurat{MahasiswaID: sampleMhs.ID, Jenis: "Surat Keterangan Aktif", NomorSurat: "SKA/UBK/2026/001", Status: "Diproses", Catatan: "Menunggu verifikasi akademik"}
			if err := config.DB.Create(&surat).Error; err != nil {
				return err
			}
		}

		var kesehatan models.Kesehatan
		if err := config.DB.Where("mahasiswa_id = ? AND jenis_pemeriksaan = ?", sampleMhs.ID, "Screening Tahunan").First(&kesehatan).Error; err != nil {
			kesehatan = models.Kesehatan{MahasiswaID: sampleMhs.ID, Tanggal: time.Now().AddDate(0, -1, 0), JenisPemeriksaan: "Screening Tahunan", Hasil: "Sehat", Catatan: "Kondisi umum baik", TinggiBadan: 168, BeratBadan: 62, Sistole: 120, Diastole: 80, GulaDarah: 95, ButaWarna: "Normal", StatusKesehatan: "prima", GolonganDarah: "O"}
			if err := config.DB.Create(&kesehatan).Error; err != nil {
				return err
			}
		}
	}

	// 11. Seed ORMAWA menus
	if ormawa.ID != 0 && sampleMhs.ID != 0 {
		proposalsToSeed := []models.Proposal{
			{
				OrmawaID:              ormawa.ID,
				MahasiswaID:           sampleMhs.ID,
				FakultasID:            &sampleMhs.FakultasID,
				Judul:                 "Festival Mahasiswa UBK 2026",
				TanggalKegiatan:       time.Now().AddDate(0, 1, 10),
				Anggaran:              25000000,
				Jenis:                 "Kegiatan Mahasiswa",
				Status:                "diajukan",
				Catatan:               "Proposal awal kegiatan lintas fakultas",
				LandasanKegiatan:      "Program Kerja BEM KBM UBK 2026 Bidang Minat Bakat",
				Deskripsi:             "Festival musik, seni, dan pameran wirausaha mahasiswa Bhakti Kencana.",
				BentukKegiatan:        "Pameran, Lomba Seni, & Pentas Musik",
				Mitra:                 "Sponsor Swasta & Koperasi Mahasiswa",
				LatarBelakang:         "Meningkatkan sportivitas dan kreativitas seni mahasiswa.",
				TujuanKegiatan:        "Mempererat silaturahmi antar fakultas dan mengasah minat bakat mahasiswa.",
				JadwalPelaksanaan:      "Jumat-Sabtu, 14-15 Agustus 2026, 08:00 - 17:00 WIB",
				SasaranKegiatan:        "Seluruh Mahasiswa Universitas Bhakti Kencana",
				IndikatorKeberhasilan: "Diikuti oleh minimal 500 mahasiswa dan 20 stan wirausaha.",
				SumberDana:            "Dana Kemahasiswaan & Kontribusi Tenant",
				PJKegiatan:            "Ahmad Dahlan (BEM KBM)",
			},
			{
				OrmawaID:              ormawa.ID,
				MahasiswaID:           sampleMhs.ID,
				FakultasID:            &sampleMhs.FakultasID,
				Judul:                 "Latihan Kepemimpinan Manajemen Mahasiswa (LKMM)",
				TanggalKegiatan:       time.Now().AddDate(0, 1, 1),
				Anggaran:              12500000,

				Jenis:                 "Kaderisasi",
				Status:                "disetujui_univ",
				Catatan:               "Telah divalidasi oleh Warek Kemahasiswaan",
				LandasanKegiatan:      "GBHP BEM KBM Bhakti Kencana 2026",
				Deskripsi:             "Pelatihan kepemimpinan tingkat menengah untuk calon pengurus Ormawa.",
				BentukKegiatan:        "Latihan Kepemimpinan & Outbound",
				Mitra:                 "Ikatan Alumni BKU",
				LatarBelakang:         "Kebutuhan regenerasi kepemimpinan organisasi kemahasiswaan.",
				TujuanKegiatan:        "Membentuk karakter pemimpin yang adaptif, komunikatif, dan berintegritas.",
				JadwalPelaksanaan:      "Sabtu-Minggu, 4-5 Juli 2026, 08:00 - 16:00 WIB",
				SasaranKegiatan:        "Calon Pengurus Baru Ormawa se-UBK",
				IndikatorKeberhasilan: "Meluluskan 50 peserta dengan nilai kepemimpinan minimal B.",
				SumberDana:            "Dana Alokasi Ormawa & Kas Internal",
				PJKegiatan:            "Rizki Amalia (Kepala PSDM)",
			},
			{
				OrmawaID:              ormawa.ID,
				MahasiswaID:           sampleMhs.ID,
				FakultasID:            &sampleMhs.FakultasID,
				Judul:                 "Bakti Sosial Kesehatan Masyarakat",
				TanggalKegiatan:       time.Now().AddDate(0, 0, 21),
				Anggaran:              8000000,

				Jenis:                 "Pengabdian Masyarakat",
				Status:                "disetujui_fakultas",
				Catatan:               "Disetujui Fakultas, lanjut review Universitas",
				LandasanKegiatan:      "Tri Dharma Perguruan Tinggi (Pengabdian)",
				Deskripsi:             "Pemeriksaan kesehatan gratis dan penyuluhan sanitasi di desa binaan.",
				BentukKegiatan:        "Pemeriksaan Medis & Penyuluhan",
				Mitra:                 "Puskesmas Kecamatan Cibiru",
				LatarBelakang:         "Rendahnya tingkat kesadaran sanitasi masyarakat di daerah pinggiran kota.",
				TujuanKegiatan:        "Meningkatkan kesehatan masyarakat dan melatih kepedulian sosial mahasiswa.",
				JadwalPelaksanaan:      "Rabu, 24 Juni 2026, 09:00 - 15:00 WIB",
				SasaranKegiatan:        "Warga Kelurahan Cibiru Wetan",
				IndikatorKeberhasilan: "Melayani minimal 100 warga lansia dan anak-anak.",
				SumberDana:            "Dana Pengabdian Universitas & Donasi Umum",
				PJKegiatan:            "Dedi Setiadi (Departemen Sosial)",
			},
			{
				OrmawaID:              ormawa.ID,
				MahasiswaID:           sampleMhs.ID,
				FakultasID:            &sampleMhs.FakultasID,
				Judul:                 "Seminar Nasional Entrepreneurship Muda",
				TanggalKegiatan:       time.Now().AddDate(0, 0, 15),
				Anggaran:              15000000,

				Jenis:                 "Akademik",
				Status:                "disetujui_dosen",
				Catatan:               "Disetujui Dosen Pembimbing, menunggu approval Fakultas",
				LandasanKegiatan:      "Rekomendasi Rektorat Bidang Kewirausahaan",
				Deskripsi:             "Seminar kewirausahaan digital menghadirkan praktisi start-up nasional.",
				BentukKegiatan:        "Seminar Interaktif & Talkshow",
				Mitra:                 "Kadin Kota Bandung",
				LatarBelakang:         "Pentingnya menumbuhkan jiwa wirausaha di kalangan mahasiswa.",
				TujuanKegiatan:        "Memberikan wawasan bisnis praktis dan memotivasi mahasiswa berwirausaha.",
				JadwalPelaksanaan:      "Kamis, 18 Juni 2026, 09:00 - 12:00 WIB",
				SasaranKegiatan:        "Mahasiswa Umum & Publik",
				IndikatorKeberhasilan: "Dihadiri 300 peserta online/offline.",
				SumberDana:            "Dana Hibah Kewirausahaan & Tiket Peserta",
				PJKegiatan:            "Indah Permata (Divisi Kewirausahaan)",
			},
			{
				OrmawaID:              ormawa.ID,
				MahasiswaID:           sampleMhs.ID,
				FakultasID:            &sampleMhs.FakultasID,
				Judul:                 "Webinar Kebangsaan & Bela Negara",
				TanggalKegiatan:       time.Now().AddDate(0, 0, 17),
				Anggaran:              3000000,

				Jenis:                 "Kebangsaan",
				Status:                "revisi",
				Catatan:               "Harap perbaiki rincian honor narasumber",
				LandasanKegiatan:      "Instruksi Kemendikbudristek perihal Bela Negara",
				Deskripsi:             "Webinar penguatan wawasan kebangsaan dan pencegahan radikalisme.",
				BentukKegiatan:        "Webinar Online via Zoom",
				Mitra:                 "Kodim setempat",
				LatarBelakang:         "Maraknya disinformasi dan ancaman radikalisme di media sosial.",
				TujuanKegiatan:        "Menanamkan nilai-nilai cinta tanah air pada mahasiswa.",
				JadwalPelaksanaan:      "Sabtu, 20 Juni 2026, 13:00 - 15:30 WIB",
				SasaranKegiatan:        "Seluruh Mahasiswa Baru UBK",
				IndikatorKeberhasilan: "Kehadiran minimal 80% dari total mahasiswa baru.",
				SumberDana:            "Dana Kemahasiswaan",
				PJKegiatan:            "Yusuf Habibie (Departemen Humas)",
			},
		}

		for _, pSeed := range proposalsToSeed {
			var proposal models.Proposal
			if err := config.DB.Where("ormawa_id = ? AND judul = ?", ormawa.ID, pSeed.Judul).First(&proposal).Error; err != nil {
				proposal = pSeed
				if err := config.DB.Create(&proposal).Error; err != nil {
					return err
				}
			} else {
				pSeed.ID = proposal.ID
				config.DB.Save(&pSeed)
				proposal = pSeed
			}

			var riwayat models.ProposalRiwayat
			if err := config.DB.Where("proposal_id = ? AND status = ?", proposal.ID, proposal.Status).First(&riwayat).Error; err != nil {
				riwayat = models.ProposalRiwayat{
					ProposalID: proposal.ID,
					Status:     proposal.Status,
					Catatan:    proposal.Catatan,
					CreatedBy:  ormawaUser.ID,
				}
				if err := config.DB.Create(&riwayat).Error; err != nil {
					return err
				}
			}

			if proposal.Status == "disetujui_univ" {
				var lpj models.LaporanPertanggungjawaban
				if err := config.DB.Where("proposal_id = ?", proposal.ID).First(&lpj).Error; err != nil {
					lpj = models.LaporanPertanggungjawaban{
						ProposalID:        proposal.ID,
						RealisasiAnggaran: proposal.Anggaran,
						Status:            "Draft",
						Catatan:           "LPJ kegiatan BEM KBM",
					}
					if err := config.DB.Create(&lpj).Error; err != nil {
						return err
					}
				}
			}
		}

		eventsToSeed := []models.OrmawaKegiatan{
			{
				OrmawaID:              ormawa.ID,
				Judul:                 "Grand Launching BEM KBM UBK 2026",
				Deskripsi:             "Pemberitahuan resmi kepengurusan baru BEM KBM periode 2026.",
				TanggalMulai:          time.Now().AddDate(0, 0, -2),
				TanggalSelesai:        time.Now().AddDate(0, 0, -2).Add(8 * time.Hour),
				Lokasi:                "Aula Utama Kampus A",
				Status:                "Selesai",
				LandasanKegiatan:      "SK Rektor No. 12/SK/2026",
				BentukKegiatan:        "Seremoni & Orasi Visi Misi",
				Mitra:                 "Humas Universitas",
				LatarBelakang:         "Pentingnya pengenalan struktur organisasi baru kepada sivitas akademika.",
				TujuanKegiatan:        "Mensosialisasikan program kerja setahun ke depan.",
				JadwalPelaksanaan:      "Senin, 1 Juni 2026, 08:00 - 16:00 WIB",
				SasaranKegiatan:        "Dosen, Staff, dan Mahasiswa UBK",
				IndikatorKeberhasilan: "Dihadiri perwakilan seluruh UKM dan Himpunan.",
				SumberDana:            "Dana Awal BEM",
				EstimasiDana:          2500000,
				PJKegiatan:            "Hendra Wijaya (Sekjen)",
			},
			{
				OrmawaID:              ormawa.ID,
				Judul:                 "Latihan Kepemimpinan Manajemen Mahasiswa (LKMM)",
				Deskripsi:             "Pelatihan kepemimpinan tingkat menengah untuk calon pengurus Ormawa.",
				TanggalMulai:          time.Now().AddDate(0, 1, 1),
				TanggalSelesai:        time.Now().AddDate(0, 1, 2),
				Lokasi:                "Wisma Caringin, Lembang",
				Status:                "Terjadwal",
				LandasanKegiatan:      "GBHP BEM KBM Bhakti Kencana 2026",
				BentukKegiatan:        "Latihan Kepemimpinan & Outbound",
				Mitra:                 "Ikatan Alumni BKU",
				LatarBelakang:         "Kebutuhan regenerasi kepemimpinan organisasi kemahasiswaan.",
				TujuanKegiatan:        "Membentuk karakter pemimpin yang adaptif, komunikatif, dan berintegritas.",
				JadwalPelaksanaan:      "Sabtu-Minggu, 4-5 Juli 2026, 08:00 - 16:00 WIB",
				SasaranKegiatan:        "Calon Pengurus Baru Ormawa se-UBK",
				IndikatorKeberhasilan: "Meluluskan 50 peserta dengan nilai kepemimpinan minimal B.",
				SumberDana:            "Dana Alokasi Ormawa & Kas Internal",
				EstimasiDana:          12500000,
				PJKegiatan:            "Rizki Amalia (Kepala PSDM)",
			},
			{
				OrmawaID:              ormawa.ID,
				Judul:                 "Bakti Sosial Kesehatan Masyarakat",
				Deskripsi:             "Pemeriksaan kesehatan gratis dan penyuluhan sanitasi di desa binaan.",
				TanggalMulai:          time.Now().AddDate(0, 0, 21),
				TanggalSelesai:        time.Now().AddDate(0, 0, 21).Add(6 * time.Hour),
				Lokasi:                "Balai Desa Cibiru Wetan",
				Status:                "Terjadwal",
				LandasanKegiatan:      "Tri Dharma Perguruan Tinggi (Pengabdian)",
				BentukKegiatan:        "Pemeriksaan Medis & Penyuluhan",
				Mitra:                 "Puskesmas Kecamatan Cibiru",
				LatarBelakang:         "Rendahnya tingkat kesadaran sanitasi masyarakat di daerah pinggiran kota.",
				TujuanKegiatan:        "Meningkatkan kesehatan masyarakat dan melatih kepedulian sosial mahasiswa.",
				JadwalPelaksanaan:      "Rabu, 24 Juni 2026, 09:00 - 15:00 WIB",
				SasaranKegiatan:        "Warga Kelurahan Cibiru Wetan",
				IndikatorKeberhasilan: "Melayani minimal 100 warga lansia dan anak-anak.",
				SumberDana:            "Dana Pengabdian Universitas & Donasi Umum",
				EstimasiDana:          8000000,
				PJKegiatan:            "Dedi Setiadi (Departemen Sosial)",
			},
		}

		for _, eSeed := range eventsToSeed {
			var event models.OrmawaKegiatan
			if err := config.DB.Where("ormawa_id = ? AND judul = ?", ormawa.ID, eSeed.Judul).First(&event).Error; err != nil {
				if err := config.DB.Create(&eSeed).Error; err != nil {
					return err
				}
			} else {
				eSeed.ID = event.ID
				config.DB.Save(&eSeed)
			}
		}

		var pengumuman models.OrmawaPengumuman
		if err := config.DB.Where("ormawa_id = ? AND judul = ?", ormawa.ID, "Open Recruitment Pengurus").First(&pengumuman).Error; err != nil {
			pengumuman = models.OrmawaPengumuman{OrmawaID: ormawa.ID, Judul: "Open Recruitment Pengurus", Isi: "Pendaftaran pengurus baru dibuka sampai akhir bulan.", Target: "Semua Mahasiswa", TanggalMulai: time.Now(), TanggalSelesai: time.Now().AddDate(0, 0, 14)}
			if err := config.DB.Create(&pengumuman).Error; err != nil {
				return err
			}
		}

		var mutasi models.OrmawaMutasiSaldo
		if err := config.DB.Where("ormawa_id = ? AND deskripsi = ?", ormawa.ID, "Saldo awal organisasi").First(&mutasi).Error; err != nil {
			mutasi = models.OrmawaMutasiSaldo{OrmawaID: ormawa.ID, Tipe: "pemasukan", Nominal: 10000000, Kategori: "Dana Awal", Deskripsi: "Saldo awal organisasi", Tanggal: time.Now()}
			if err := config.DB.Create(&mutasi).Error; err != nil {
				return err
			}
		} else if mutasi.Tipe == "Kredit" {
			config.DB.Model(&mutasi).Update("tipe", "pemasukan")
		}
	}

	// 12. Seed content/news and audit
	var berita models.Berita
	if err := config.DB.Where("judul = ?", "Kalender Akademik 2026").First(&berita).Error; err != nil {
		berita = models.Berita{Judul: "Kalender Akademik 2026", Isi: "Informasi kalender akademik terbaru untuk seluruh mahasiswa.", PenulisID: superAdminUser.ID, Status: "Published", TanggalPublish: time.Now()}
		if err := config.DB.Create(&berita).Error; err != nil {
			return err
		}
	}

	var logAct models.LogAktivitas
	if err := config.DB.Where("user_id = ? AND aktivitas = ?", superAdminUser.ID, "SEEDER_BOOTSTRAP").First(&logAct).Error; err != nil {
		logAct = models.LogAktivitas{UserID: superAdminUser.ID, Aktivitas: "SEEDER_BOOTSTRAP", Deskripsi: "Seeder default untuk semua role dan menu", IPAddress: "127.0.0.1"}
		if err := config.DB.Create(&logAct).Error; err != nil {
			log.Printf("⚠️ [SEEDER] Warning: Failed to seed logAct (likely due to Mahasiswa FK constraint): %v\n", err)
		}
	}

	_, err = ensureUser("tenagakes@bku.ac.id", "tenagakes123", "tenaga_kesehatan", nil, nil)
	if err != nil {
		return err
	}

	psikologUser, err := ensureUser("psikolog@bku.ac.id", "psikolog123", "psikolog", nil, nil)
	if err != nil {
		return err
	}

	if err := ensurePsychologistBootstrap(psikologUser); err != nil {
		return err
	}

	if err := ensurePkkmbBootstrap(); err != nil {
		return err
	}

	fmt.Println("✅ [SEEDER] Bootstrap completed successfully.")
	fmt.Println("   super_admin   : superadmin@bku.ac.id / superadmin123")
	fmt.Println("   faculty_admin : admin.<KODE_FAK>@bku.ac.id / adminfak123")
	fmt.Println("   mahasiswa     : <NIM>@student.bku.ac.id / student123")
	fmt.Println("   ormawa        : ormawa@bku.ac.id / ormawa123")
	fmt.Println("   psikolog      : psikolog@bku.ac.id / psikolog123")
	fmt.Println("   tenaga_kes    : tenagakes@bku.ac.id / tenagakes123")

	// 12. Ensure Multi-Role Test Account
	fmt.Println("🔄 [SEEDER] Seeding multi-role test account...")
	multiRoleEmail := "multirole@bku.ac.id"
	multiRoleStr := "faculty_admin,psikolog,tenaga_kesehatan"
	var multiUser models.User
	if err := config.DB.Where("LOWER(email) = ?", strings.ToLower(multiRoleEmail)).First(&multiUser).Error; err != nil {
		hash, _ := bcrypt.GenerateFromPassword([]byte("multirole123"), bcrypt.DefaultCost)
		multiUser = models.User{
			Email:    multiRoleEmail,
			Password: string(hash),
			Role:     multiRoleStr,
		}
		if ff, ok := fakultasByKode["FF"]; ok {
			multiUser.FakultasID = &ff.ID
		}
		if err := config.DB.Create(&multiUser).Error; err != nil {
			log.Printf("[SEEDER] Warning: failed to create multi-role user: %v", err)
		} else {
			fmt.Println("✅ [SEEDER] Multi-role user created:", multiRoleEmail)
		}
	} else {
		if !strings.Contains(multiUser.Role, ",") {
			config.DB.Model(&multiUser).Update("role", multiRoleStr)
		}
		if multiUser.FakultasID == nil {
			if ff, ok := fakultasByKode["FF"]; ok {
				config.DB.Model(&multiUser).Update("fakultas_id", ff.ID)
			}
		}
	}

	// Create Psikolog profile for multi-role user
	if multiUser.ID != 0 {
		var multiPsi models.Psikolog
		if err := config.DB.Where("user_id = ?", multiUser.ID).First(&multiPsi).Error; err != nil {
			multiPsi = models.Psikolog{
				UserID:       multiUser.ID,
				Nama:         "Dr. Multi Role, M.Psi",
				Email:        multiRoleEmail,
				NoHP:         "+62 812 0000 0001",
				Spesialisasi: "Psikologi Klinis",
				Bio:          "Tenaga profesional multi-disiplin di bidang kesehatan dan konseling",
				Lokasi:       "Gedung C Lt.2",
				Bahasa:       "Indonesia",
				Tarif:        150000,
				IsAktif:      true,
			}
			config.DB.Create(&multiPsi)
		}

		var multiTK models.TenagaKesehatan
		if err := config.DB.Where("user_id = ?", multiUser.ID).First(&multiTK).Error; err != nil {
			multiTK = models.TenagaKesehatan{
				UserID:       multiUser.ID,
				Nama:         "Dr. Multi Role, M.Psi",
				Email:        multiRoleEmail,
				NoHP:         "+62 812 0000 0001",
				Spesialisasi: "Kesehatan Umum",
				Lokasi:       "Klinik Kampus Lt.1",
				IsAktif:      true,
			}
			config.DB.Create(&multiTK)
		}
	}

	fmt.Println("   multi_role    : multirole@bku.ac.id / multirole123")
	return nil
}

func ensurePsychologistBootstrap(user models.User) error {
	var psikolog models.Psikolog
	if err := config.DB.Where("user_id = ?", user.ID).First(&psikolog).Error; err != nil {
		psikolog = models.Psikolog{
			UserID:       user.ID,
			Nama:         "Psikolog BKU",
			Email:        user.Email,
			NoHP:         "+62 812 3456 7890",
			Spesialisasi: "Psikolog Klinis Pendidikan",
			Bio:          "Berpengalaman menangani stres akademik, kecemasan, adaptasi kampus, dan pengembangan diri mahasiswa.",
			Lokasi:       "Ruang Konseling Student Hub",
			Bahasa:       "Indonesia, Inggris",
			Tarif:        150000,
			IsAktif:      true,
		}
		if err := config.DB.Create(&psikolog).Error; err != nil {
			return err
		}
	} else {
		updates := map[string]interface{}{
			"email":    user.Email,
			"is_aktif": true,
		}
		if psikolog.Nama == "" {
			updates["nama"] = "Psikolog BKU"
		}
		if psikolog.Spesialisasi == "" {
			updates["spesialisasi"] = "Psikolog Klinis Pendidikan"
		}
		if err := config.DB.Model(&psikolog).Updates(updates).Error; err != nil {
			return err
		}
	}

	scheduleSeeds := []models.PsikologScheduleSlot{
		{PsikologID: psikolog.ID, Hari: "Senin", JamMulai: "09:00", JamSelesai: "12:00", Lokasi: "Ruang Konseling A", Kuota: 3, IsAktif: ptrBool(true)},
		{PsikologID: psikolog.ID, Hari: "Senin", JamMulai: "13:00", JamSelesai: "16:00", Lokasi: "Ruang Konseling A", Kuota: 3, IsAktif: ptrBool(true)},
		{PsikologID: psikolog.ID, Hari: "Selasa", JamMulai: "10:00", JamSelesai: "15:00", Lokasi: "Ruang Konseling A", Kuota: 4, IsAktif: ptrBool(true)},
		{PsikologID: psikolog.ID, Hari: "Rabu", JamMulai: "09:00", JamSelesai: "12:00", Lokasi: "Ruang Konseling B", Kuota: 3, IsAktif: ptrBool(true)},
		{PsikologID: psikolog.ID, Hari: "Jumat", JamMulai: "08:00", JamSelesai: "11:00", Lokasi: "Ruang Konseling A", Kuota: 2, IsAktif: ptrBool(true)},
	}
	for _, seed := range scheduleSeeds {
		var existing models.PsikologScheduleSlot
		if err := config.DB.Where("psikolog_id = ? AND hari = ? AND jam_mulai = ?", psikolog.ID, seed.Hari, seed.JamMulai).First(&existing).Error; err != nil {
			if err := config.DB.Create(&seed).Error; err != nil {
				return err
			}
		}
	}

	// Seed Dr. Sarah Amalia
	sarahUser, err := ensureUser("sarah@bku.ac.id", "sarah123", "psikolog", nil, nil)
	if err == nil {
		var sarah models.Psikolog
		if err := config.DB.Where("user_id = ?", sarahUser.ID).First(&sarah).Error; err != nil {
			sarah = models.Psikolog{
				UserID:       sarahUser.ID,
				Nama:         "Dr. Sarah Amalia, M.Psi",
				Email:        sarahUser.Email,
				NoHP:         "+62 812 3456 7891",
				Spesialisasi: "Psikologi Klinis & Pendidikan",
				Bio:          "Ahli dalam diagnosis klinis, konsultasi akademik, dan penanganan trauma emosional.",
				FotoURL:      "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=200&auto=format&fit=crop",
				Lokasi:       "Ruang Konseling Student Hub A",
				Bahasa:       "Indonesia, Inggris",
				Tarif:        180000,
				IsAktif:      true,
			}
			if err := config.DB.Create(&sarah).Error; err == nil {
				sarahSlots := []models.PsikologScheduleSlot{
					{PsikologID: sarah.ID, Hari: "Senin", JamMulai: "09:00", JamSelesai: "10:00", Lokasi: "Ruang Konseling Student Hub A", Kuota: 3, IsAktif: ptrBool(true)},
					{PsikologID: sarah.ID, Hari: "Rabu", JamMulai: "10:00", JamSelesai: "11:00", Lokasi: "Ruang Konseling Student Hub A", Kuota: 3, IsAktif: ptrBool(true)},
					{PsikologID: sarah.ID, Hari: "Jumat", JamMulai: "13:00", JamSelesai: "14:00", Lokasi: "Ruang Konseling Student Hub A", Kuota: 3, IsAktif: ptrBool(true)},
				}
				for _, slot := range sarahSlots {
					var existing models.PsikologScheduleSlot
					if err := config.DB.Where("psikolog_id = ? AND hari = ? AND jam_mulai = ?", sarah.ID, slot.Hari, slot.JamMulai).First(&existing).Error; err != nil {
						config.DB.Create(&slot)
					}
				}
			}
		}
	}

	// Seed Rian Hidayat
	rianUser, err := ensureUser("rian@bku.ac.id", "rian123", "psikolog", nil, nil)
	if err == nil {
		var rian models.Psikolog
		if err := config.DB.Where("user_id = ?", rianUser.ID).First(&rian).Error; err != nil {
			rian = models.Psikolog{
				UserID:       rianUser.ID,
				Nama:         "Rian Hidayat, S.Psi",
				Email:        rianUser.Email,
				NoHP:         "+62 812 3456 7892",
				Spesialisasi: "Konseling Karir & Pengembangan Diri",
				Bio:          "Membantu mahasiswa merencanakan karir, mengatasi demotivasi belajar, dan melatih resiliensi diri.",
				FotoURL:      "https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=200&auto=format&fit=crop",
				Lokasi:       "Ruang Konseling Student Hub B",
				Bahasa:       "Indonesia",
				Tarif:        120000,
				IsAktif:      true,
			}
			if err := config.DB.Create(&rian).Error; err == nil {
				rianSlots := []models.PsikologScheduleSlot{
					{PsikologID: rian.ID, Hari: "Selasa", JamMulai: "10:00", JamSelesai: "11:00", Lokasi: "Ruang Konseling Student Hub B", Kuota: 4, IsAktif: ptrBool(true)},
					{PsikologID: rian.ID, Hari: "Kamis", JamMulai: "14:00", JamSelesai: "15:00", Lokasi: "Ruang Konseling Student Hub B", Kuota: 4, IsAktif: ptrBool(true)},
				}
				for _, slot := range rianSlots {
					var existing models.PsikologScheduleSlot
					if err := config.DB.Where("psikolog_id = ? AND hari = ? AND jam_mulai = ?", rian.ID, slot.Hari, slot.JamMulai).First(&existing).Error; err != nil {
						config.DB.Create(&slot)
					}
				}
			}
		}
	}

	students := []models.Mahasiswa{}
	if err := config.DB.Preload("Fakultas").Preload("ProgramStudi").Limit(4).Find(&students).Error; err != nil {
		return err
	}
	if len(students) == 0 {
		return nil
	}

	// Hanya seed data transaksi (booking, notes, assessments, reports, notif)
	// jika RUN_SEED=true di .env — supaya tidak overwrite data real
	if os.Getenv("RUN_SEED") != "true" {
		return nil
	}

	topics := []string{"Stres Akademik", "Anxiety", "Adaptasi Kampus", "Kecemasan Ujian"}
	statuses := []string{"Menunggu", "Dikonfirmasi", "Selesai", "Ditolak"}
	for i, student := range students {
		var booking models.PsikologBooking
		if err := config.DB.Where("psikolog_id = ? AND mahasiswa_id = ? AND topik = ?", psikolog.ID, student.ID, topics[i%len(topics)]).First(&booking).Error; err != nil {
			booking = models.PsikologBooking{
				PsikologID:  psikolog.ID,
				MahasiswaID: student.ID,
				Tanggal:     time.Now().AddDate(0, 0, i+1),
				JamMulai:    fmt.Sprintf("%02d:00", 9+i),
				JamSelesai:  fmt.Sprintf("%02d:00", 10+i),
				Topik:       topics[i%len(topics)],
				Keluhan:     "Mahasiswa membutuhkan pendampingan terkait tekanan akademik dan pengelolaan emosi.",
				Status:      statuses[i%len(statuses)],
			}
			if err := config.DB.Create(&booking).Error; err != nil {
				return err
			}
		}

		if i < 3 {
			var note models.PsikologSessionNote
			if err := config.DB.Where("psikolog_id = ? AND mahasiswa_id = ? AND keluhan = ?", psikolog.ID, student.ID, topics[i%len(topics)]).First(&note).Error; err != nil {
				note = models.PsikologSessionNote{
					PsikologID:   psikolog.ID,
					MahasiswaID:  student.ID,
					BookingID:    &booking.ID,
					Tanggal:      time.Now().AddDate(0, 0, -i-1),
					Keluhan:      topics[i%len(topics)],
					Observasi:    "Mahasiswa terlihat kooperatif, mampu menjelaskan pemicu utama, dan membutuhkan struktur belajar yang lebih jelas.",
					Rekomendasi:  "Latihan pernapasan, jurnal harian, dan jadwal belajar bertahap selama satu minggu.",
					Mood:         []string{"Cemas", "Netral", "Stabil"}[i%3],
					JenisSesi:    "Konseling Individu",
					StatusPasien: []string{"Perlu Perhatian", "Pemulihan", "Stabil"}[i%3],
				}
				if err := config.DB.Create(&note).Error; err != nil {
					return err
				}
			}
		}
	}

	assessmentSeeds := []models.PsikologAssessment{
		{PsikologID: psikolog.ID, MahasiswaID: &students[0].ID, Nama: "DASS-21 (Depresi)", Kategori: "Kesehatan Mental", Deskripsi: "Screening kondisi depresi, kecemasan, dan stres", Skor: "Normal", Status: "Selesai", SubmittedAt: ptrTime(time.Now().AddDate(0, 0, -1))},
		{PsikologID: psikolog.ID, MahasiswaID: &students[0].ID, Nama: "Kecemasan Akademik", Kategori: "Kesehatan Mental", Deskripsi: "Pengukuran kecemasan terkait proses akademik", Skor: "Tinggi", Status: "Perlu Tinjauan", SubmittedAt: ptrTime(time.Now().AddDate(0, 0, -2))},
		{PsikologID: psikolog.ID, Nama: "Tes Minat Karir", Kategori: "Minat Bakat", Deskripsi: "Instrumen eksplorasi minat karir mahasiswa", Skor: "-", Status: "Draft"},
	}
	for _, seed := range assessmentSeeds {
		var existing models.PsikologAssessment
		if err := config.DB.Where("psikolog_id = ? AND nama = ?", psikolog.ID, seed.Nama).First(&existing).Error; err != nil {
			if err := config.DB.Create(&seed).Error; err != nil {
				return err
			}
		}
	}




	notificationSeeds := []models.PsikologNotification{
		{PsikologID: psikolog.ID, UserID: user.ID, Judul: "Janji Temu Baru", Deskripsi: "Mahasiswa menjadwalkan sesi konseling baru untuk besok pagi.", Tipe: "booking", IsRead: false},
		{PsikologID: psikolog.ID, UserID: user.ID, Judul: "Submisi Asesmen", Deskripsi: "Hasil asesmen kecemasan akademik membutuhkan tinjauan.", Tipe: "assessment", IsRead: false},
		{PsikologID: psikolog.ID, UserID: user.ID, Judul: "Laporan Siap", Deskripsi: "Laporan bulanan telah berhasil dibuat.", Tipe: "report", IsRead: true},
	}
	for _, seed := range notificationSeeds {
		var existing models.PsikologNotification
		if err := config.DB.Where("psikolog_id = ? AND judul = ?", psikolog.ID, seed.Judul).First(&existing).Error; err != nil {
			if err := config.DB.Create(&seed).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

func ptrTime(value time.Time) *time.Time {
	return &value
}

func ptrBool(v bool) *bool {
	return &v
}

func ensureUser(email, plainPassword, role string, fakultasID *uint, ormawaID *uint) (models.User, error) {
	var user models.User
	if err := config.DB.Where("LOWER(email) = ?", strings.ToLower(email)).First(&user).Error; err == nil {
		updates := map[string]interface{}{}
		if role != "" && user.Role != role {
			updates["role"] = role
		}
		if fakultasID != nil {
			updates["fakultas_id"] = *fakultasID
		}
		if ormawaID != nil {
			updates["ormawa_id"] = *ormawaID
		}

		// DO NOT reset password — respect user's ChangePassword

		if len(updates) > 0 {
			if err := config.DB.Model(&user).Updates(updates).Error; err != nil {
				return models.User{}, err
			}
			_ = config.DB.First(&user, user.ID).Error
		}
		return user, nil
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
	if err != nil {
		return models.User{}, err
	}

	user = models.User{
		Email:    strings.ToLower(email),
		Password: string(hash),
		Role:     role,
	}
	if fakultasID != nil {
		user.FakultasID = fakultasID
	}
	if ormawaID != nil {
		user.OrmawaID = ormawaID
	}

	if err := config.DB.Create(&user).Error; err != nil {
		return models.User{}, err
	}

	return user, nil
}

func ensurePkkmbBootstrap() error {
	// Seed PKKMB Hasil data if empty
	var hasilCount int64
	config.DB.Model(&models.PkkmbHasil{}).Count(&hasilCount)
	if hasilCount == 0 {
		if err := seedPkkmbHasilData(); err != nil {
			log.Printf("[PKKMB Seeder] Warning: failed to seed PKKMB results: %v", err)
		}
	}

	var count int64
	config.DB.Model(&models.PkkmbTahap{}).Count(&count)
	if count > 0 {
		return nil
	}

	log.Println("[PKKMB Seeder] Seeding PKKMB stages, materials, and quizzes...")

	now := time.Now()

	// 1. Tahap 1: Pra-PKKMB
	tahap1 := models.PkkmbTahap{
		Label:          "Pra-PKKMB",
		Status:         "berlangsung",
		TanggalMulai:   now,
		TanggalSelesai: now.AddDate(0, 0, 7),
		Order:          1,
	}
	if err := config.DB.Create(&tahap1).Error; err != nil {
		return err
	}

	materi1 := models.PkkmbMateri{
		TahapID:   tahap1.ID,
		Judul:     "Tata Tertib & Pengenalan Umum",
		Tipe:      "PDF",
		FileURL:   "/uploads/materi/tata-tertib.pdf",
		Deskripsi: "Materi ini berisi petunjuk teknis, tata tertib, dan panduan umum pelaksanaan PKKMB Kencana 2026.",
		Order:     1,
	}
	if err := config.DB.Create(&materi1).Error; err != nil {
		return err
	}

	quiz1 := models.PkkmbQuiz{
		MateriID:  materi1.ID,
		Judul:     "Kuis Tata Tertib & Aturan",
		Deskripsi: "Evaluasi pemahaman mengenai tata tertib dan peraturan PKKMB.",
		Durasi:    15,
		IsActive:  true,
		Bobot:     30,
	}
	if err := config.DB.Create(&quiz1).Error; err != nil {
		return err
	}

	q1 := models.PkkmbQuizQuestion{
		QuizID:     quiz1.ID,
		Pertanyaan: "Apa warna atribut pita yang harus dikenakan peserta PKKMB Kencana?",
		Tipe:       "multiple_choice",
		Point:      50,
	}
	config.DB.Create(&q1)
	config.DB.Create(&models.PkkmbQuizOption{QuestionID: q1.ID, Opsi: "Pita Biru", IsBenar: true})
	config.DB.Create(&models.PkkmbQuizOption{QuestionID: q1.ID, Opsi: "Pita Merah", IsBenar: false})
	config.DB.Create(&models.PkkmbQuizOption{QuestionID: q1.ID, Opsi: "Pita Hijau", IsBenar: false})

	q2 := models.PkkmbQuizQuestion{
		QuizID:     quiz1.ID,
		Pertanyaan: "Berapa batas keterlambatan maksimal toleransi kehadiran PKKMB?",
		Tipe:       "multiple_choice",
		Point:      50,
	}
	config.DB.Create(&q2)
	config.DB.Create(&models.PkkmbQuizOption{QuestionID: q2.ID, Opsi: "15 Menit", IsBenar: true})
	config.DB.Create(&models.PkkmbQuizOption{QuestionID: q2.ID, Opsi: "30 Menit", IsBenar: false})
	config.DB.Create(&models.PkkmbQuizOption{QuestionID: q2.ID, Opsi: "Tanpa Toleransi", IsBenar: false})


	// 2. Tahap 2: Pelaksanaan Inti
	tahap2 := models.PkkmbTahap{
		Label:          "Pelaksanaan Inti",
		Status:         "akan_datang",
		TanggalMulai:   now.AddDate(0, 0, 7),
		TanggalSelesai: now.AddDate(0, 0, 14),
		Order:          2,
	}
	if err := config.DB.Create(&tahap2).Error; err != nil {
		return err
	}

	materi2 := models.PkkmbMateri{
		TahapID:   tahap2.ID,
		Judul:     "Materi Pengenalan Universitas",
		Tipe:      "PDF",
		FileURL:   "/uploads/materi/materi-univ.pdf",
		Deskripsi: "Materi pengenalan jajaran pimpinan universitas, struktur kurikulum, dan fasilitas kampus.",
		Order:     1,
	}
	if err := config.DB.Create(&materi2).Error; err != nil {
		return err
	}

	quiz2 := models.PkkmbQuiz{
		MateriID:  materi2.ID,
		Judul:     "Kuis Pengenalan Universitas",
		Deskripsi: "Uji wawasan akademik dan tata pamong universitas.",
		Durasi:    20,
		IsActive:  true,
		Bobot:     40,
	}
	if err := config.DB.Create(&quiz2).Error; err != nil {
		return err
	}

	q3 := models.PkkmbQuizQuestion{
		QuizID:     quiz2.ID,
		Pertanyaan: "Siapa Rektor Universitas Bhakti Kencana saat ini?",
		Tipe:       "multiple_choice",
		Point:      100,
	}
	config.DB.Create(&q3)
	config.DB.Create(&models.PkkmbQuizOption{QuestionID: q3.ID, Opsi: "Dr. apt. Entris Sutrisno, MH.Kes.", IsBenar: true})
	config.DB.Create(&models.PkkmbQuizOption{QuestionID: q3.ID, Opsi: "Dr. Sarah Amalia", IsBenar: false})
	config.DB.Create(&models.PkkmbQuizOption{QuestionID: q3.ID, Opsi: "Prof. Ahmad Yani", IsBenar: false})


	// 3. Tahap 3: Pasca-PKKMB
	tahap3 := models.PkkmbTahap{
		Label:          "Pasca-PKKMB",
		Status:         "akan_datang",
		TanggalMulai:   now.AddDate(0, 0, 14),
		TanggalSelesai: now.AddDate(0, 0, 21),
		Order:          3,
	}
	if err := config.DB.Create(&tahap3).Error; err != nil {
		return err
	}

	materi3 := models.PkkmbMateri{
		TahapID:   tahap3.ID,
		Judul:     "Materi Keormawaan & Lembaga",
		Tipe:      "PDF",
		FileURL:   "/uploads/materi/materi-prodi.pdf",
		Deskripsi: "Pengenalan organisasi mahasiswa, UKM, program studi, dan evaluasi kelulusan.",
		Order:     1,
	}
	if err := config.DB.Create(&materi3).Error; err != nil {
		return err
	}

	quiz3 := models.PkkmbQuiz{
		MateriID:  materi3.ID,
		Judul:     "Kuis Keormawaan & Prodi",
		Deskripsi: "Kuis akhir seputar UKM, BEM, DPM, serta program studi masing-masing.",
		Durasi:    15,
		IsActive:  true,
		Bobot:     30,
	}
	if err := config.DB.Create(&quiz3).Error; err != nil {
		return err
	}

	q4 := models.PkkmbQuizQuestion{
		QuizID:     quiz3.ID,
		Pertanyaan: "Apa kepanjangan dari BEM di lingkungan kampus?",
		Tipe:       "multiple_choice",
		Point:      100,
	}
	config.DB.Create(&q4)
	config.DB.Create(&models.PkkmbQuizOption{QuestionID: q4.ID, Opsi: "Badan Eksekutif Mahasiswa", IsBenar: true})
	config.DB.Create(&models.PkkmbQuizOption{QuestionID: q4.ID, Opsi: "Badan Evaluasi Mandiri", IsBenar: false})
	config.DB.Create(&models.PkkmbQuizOption{QuestionID: q4.ID, Opsi: "Barisan Edukasi Mahasiswa", IsBenar: false})

	log.Println("[PKKMB Seeder] Seeding PKKMB stages completed successfully!")
	return nil
}

func seedPkkmbHasilData() error {
	log.Println("[PKKMB Seeder] Seeding PKKMB participant results...")

	var prodis []models.ProgramStudi
	if err := config.DB.Find(&prodis).Error; err != nil {
		return err
	}

	getNIMPrefix := func(kode string) string {
		switch kode {
		case "FF-FAR-S1":
			return "261FF010"
		case "FF-FAR-D3":
			return "261FF020"
		case "FK-KEP-S1":
			return "261FK010"
		case "FK-KEP-D3":
			return "261FK020"
		case "FIK-KBD-D3":
			return "261FIK010"
		case "FIK-KM-S1":
			return "261FIK020"
		case "FS-IKOM-S1":
			return "261FS010"
		case "FS-PSI-S1":
			return "261FS020"
		default:
			prefix := kode
			if len(kode) > 3 {
				prefix = kode[:3]
			}
			return "26" + prefix + "010"
		}
	}

	for _, p := range prodis {
		nimPrefix := getNIMPrefix(p.Kode)
		for i := 1; i <= 5; i++ {
			nim := fmt.Sprintf("%s%02d", nimPrefix, i)
			name := fmt.Sprintf("Maba %s %c", p.Nama, 'A'+i-1)
			email := strings.ToLower(nim) + "@student.bku.ac.id"

			// Ensure user exists
			user, err := ensureUser(email, "student123", "mahasiswa", &p.FakultasID, nil)
			if err != nil {
				log.Printf("Failed to create user for %s: %v", email, err)
				continue
			}

			// Ensure student exists
			var mhs models.Mahasiswa
			if err := config.DB.Where("nim = ?", nim).First(&mhs).Error; err != nil {
				mhs = models.Mahasiswa{
					PenggunaID:       user.ID,
					NIM:              nim,
					Nama:             name,
					FakultasID:       p.FakultasID,
					ProgramStudiID:   p.ID,
					SemesterSekarang: 1,
					StatusAkun:       "Aktif",
					TahunMasuk:       2026,
					JalurMasuk:       "PKKMB",
					EmailKampus:      email,
				}
				if err := config.DB.Create(&mhs).Error; err != nil {
					log.Printf("Failed to create student %s: %v", nim, err)
					continue
				}
			}

			// Determine kelulusan and nilai
			status := "Lulus"
			nilai := 75.0 + float64(i)*4.5 // values around 80-97
			
			if p.Kode == "FS-PSI-S1" {
				if i > 3 {
					status = "Proses"
					nilai = 55.0 + float64(i)*2.0 // values around 63-65
				}
			} else {
				if i > 4 {
					status = "Proses"
					nilai = 60.0 + float64(i)*1.5 // values around 67
				}
			}

			// Create PkkmbHasil
			pkkmbHasil := models.PkkmbHasil{
				MahasiswaID:     mhs.ID,
				Nilai:           nilai,
				StatusKelulusan: status,
			}
			if err := config.DB.Create(&pkkmbHasil).Error; err != nil {
				log.Printf("Failed to create pkkmb_hasil for student %s: %v", nim, err)
			}
		}
	}
	log.Println("[PKKMB Seeder] Seeding PKKMB participant results completed.")
	return nil
}

// SyncPostgresSequences resets/synchronizes the serial/bigserial primary key sequences
// of critical Postgres tables in our database schema to their current MAX(id).
// This prevents "duplicate key value violates unique constraint" errors when inserting rows.
func SyncPostgresSequences(db *gorm.DB) error {
	tables := []string{
		"mahasiswa.beasiswa",
		"mahasiswa.beasiswa_pendaftaran",
		"mahasiswa.mahasiswa",
		"mahasiswa.prestasi",
		"mahasiswa.aspirasi",
		"mahasiswa.konseling",
		"mahasiswa.pengajuan_surat",
		"mahasiswa.kesehatan",
		"mahasiswa.log_aktivitas",
		"mahasiswa.riwayat_organisasis",
		"mahasiswa.notifikasi",
		"ormawa.ormawa",
		"ormawa.ormawa_anggota",
		"ormawa.ormawa_divisi",
		"ormawa.ormawa_role",
		"ormawa.ormawa_kegiatan",
		"ormawa.ormawa_kehadiran",
		"ormawa.ormawa_pengumuman",
		"ormawa.ormawa_mutasi_saldo",
		"ormawa.ormawa_aspirasi",
		"ormawa.ormawa_notifikasi",
		"ormawa.proposal",
		"ormawa.proposal_riwayat",
		"ormawa.laporan_pertanggungjawaban",
		"public.users",
		"public.rbac_roles",
		"fakultas.fakultas",
		"fakultas.program_studi",
		"fakultas.dosen",
		"fakultas.academic_periods",
		"fakultas.pengaturan_akademik",
		"fakultas.program_mbkm",
		"fakultas.berita",
	}

	for _, table := range tables {
		query := fmt.Sprintf("SELECT setval(pg_get_serial_sequence('%s', 'id'), COALESCE(MAX(id), 1)) FROM %s;", table, table)
		if err := db.Exec(query).Error; err != nil {
			// Some tables might use UUID/different PK column and lack serial seq, this is expected
			log.Printf("[DB-SEQ] Info: Skipping/Failed sequence sync for %s (non-serial or custom PK): %v", table, err)
		} else {
			log.Printf("[DB-SEQ] Synced serial sequence for %s", table)
		}
	}
	return nil
}


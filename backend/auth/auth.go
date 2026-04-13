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
	ID        uint   `json:"id"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	NIM       string `json:"nim,omitempty"`
	Nama      string `json:"nama,omitempty"`
	OrmawaID  *uint  `json:"ormawa_id,omitempty"`
}

func jwtSecret() []byte {
	return config.GetJWTSecret()
}

func createToken(userID uint, studentID uint, nim string, role string, facultyID *uint, ormawaID *uint, ormawaAssign string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":  userID,
		"sid":  studentID,
		"nim":  nim,
		"role": role,
		"fid":  facultyID,
		"oid":  ormawaID,
		"oas":  ormawaAssign,
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

	token, err := createToken(user.ID, student.ID, nim, roleName, user.FakultasID, user.OrmawaID, user.OrmawaAssign)
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
				ID:        user.ID,
				Email:     user.Email,
				Role:      roleName,
				NIM:       student.NIM,
				Nama:      student.Nama,
				OrmawaID:  user.OrmawaID,
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
				ID:        user.ID,
				Email:     user.Email,
				Role:      user.Role,
				NIM:       student.NIM,
				Nama:      student.Nama,
				OrmawaID:  user.OrmawaID,
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

	var oas string
	if as, ok := claims["oas"].(string); ok {
		oas = as
	}

	newAT, err := createToken(uint(claims["sub"].(float64)), uint(claims["sid"].(float64)), claims["nim"].(string), claims["role"].(string), fid, oid, oas)
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
		ormawa = models.Ormawa{
			Nama:          "BEM KBM Bhakti Kencana",
			Singkatan:     "BEMKBK",
			Deskripsi:     "Badan Eksekutif Mahasiswa tingkat universitas",
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
		var bea models.Beasiswa
		if err := config.DB.Where("nama = ?", "Beasiswa Prestasi UBK").First(&bea).Error; err != nil {
			bea = models.Beasiswa{
				Nama:          "Beasiswa Prestasi UBK",
				Penyelenggara: "Universitas Bhakti Kencana",
				Deskripsi:     "Beasiswa untuk mahasiswa berprestasi akademik dan non akademik",
				Deadline:      time.Now().AddDate(0, 2, 0),
				Kuota:         50,
				IPKMin:        3.25,
				Kategori:      "Prestasi",
				NilaiBantuan:  5000000,
				Anggaran:      250000000,
			}
			if err := config.DB.Create(&bea).Error; err != nil {
				return err
			}
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
		var proposal models.Proposal
		if err := config.DB.Where("ormawa_id = ? AND judul = ?", ormawa.ID, "Festival Mahasiswa UBK 2026").First(&proposal).Error; err != nil {
			proposal = models.Proposal{
				OrmawaID:        ormawa.ID,
				MahasiswaID:     sampleMhs.ID,
				FakultasID:      sampleMhs.FakultasID,
				Judul:           "Festival Mahasiswa UBK 2026",
				TanggalKegiatan: time.Now().AddDate(0, 1, 10),
				Anggaran:        25000000,
				Jenis:           "Kegiatan Mahasiswa",
				Status:          "Diajukan",
				Catatan:         "Proposal awal kegiatan lintas fakultas",
			}
			if err := config.DB.Create(&proposal).Error; err != nil {
				return err
			}
		}

		var riwayat models.ProposalRiwayat
		if err := config.DB.Where("proposal_id = ? AND status = ?", proposal.ID, "Diajukan").First(&riwayat).Error; err != nil {
			riwayat = models.ProposalRiwayat{ProposalID: proposal.ID, Status: "Diajukan", Catatan: "Pengajuan awal", CreatedBy: ormawaUser.ID}
			if err := config.DB.Create(&riwayat).Error; err != nil {
				return err
			}
		}

		var lpj models.LaporanPertanggungjawaban
		if err := config.DB.Where("proposal_id = ?", proposal.ID).First(&lpj).Error; err != nil {
			lpj = models.LaporanPertanggungjawaban{ProposalID: proposal.ID, RealisasiAnggaran: 0, Status: "Draft", Catatan: "LPJ belum final"}
			if err := config.DB.Create(&lpj).Error; err != nil {
				return err
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
			mutasi = models.OrmawaMutasiSaldo{OrmawaID: ormawa.ID, Tipe: "Kredit", Nominal: 10000000, Kategori: "Dana Awal", Deskripsi: "Saldo awal organisasi", Tanggal: time.Now()}
			if err := config.DB.Create(&mutasi).Error; err != nil {
				return err
			}
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
			return err
		}
	}

	fmt.Println("✅ [SEEDER] Bootstrap completed successfully.")
	fmt.Println("   super_admin   : superadmin@bku.ac.id / superadmin123")
	fmt.Println("   faculty_admin : admin.<KODE_FAK>@bku.ac.id / adminfak123")
	fmt.Println("   mahasiswa     : <NIM>@student.bku.ac.id / student123")
	fmt.Println("   ormawa        : ormawa@bku.ac.id / ormawa123")
	return nil
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

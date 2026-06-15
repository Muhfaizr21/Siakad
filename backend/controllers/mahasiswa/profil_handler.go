package mahasiswa

import (
	"fmt"
	"os"
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)


func GetProfile(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Profil tidak ditemukan"})
	}

	config.DB.Preload("ProgramStudi.Fakultas").Preload("Pengguna").First(student, student.ID)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    student,
	})
}

func UpdateProfile(c *fiber.Ctx) error {

	type UpdateRequest struct {
		Email            string `json:"email"`
		Phone            string `json:"phone"`
		BirthPlace       string `json:"birth_place"`
		BirthDate        string `json:"birth_date"`
		Gender           string `json:"gender"`
		Religion         string `json:"religion"`
		Address          string `json:"address"`
		City             string `json:"city"`
		ZipCode          string `json:"zip_code"`
		NIK              string `json:"nik"`
		NISN             string `json:"nisn"`
		Kewarganegaraan  string `json:"kewarganegaraan"`
		StatusPernikahan string `json:"status_pernikahan"`
		GolonganDarah    string `json:"golongan_darah"`
		NamaAyah         string `json:"nama_ayah"`
		NamaIbuKandung   string `json:"nama_ibu_kandung"`
		PekerjaanAyah    string `json:"pekerjaan_ayah"`
		PekerjaanIbu     string `json:"pekerjaan_ibu"`
		PenghasilanOrtu  int    `json:"penghasilan_ortu"`
		AsalSekolah      string `json:"asal_sekolah"`
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data tidak valid"})
	}

	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Student not found"})
	}

	student.EmailPersonal = req.Email
	student.NoHP = req.Phone
	student.TempatLahir = req.BirthPlace
	if req.BirthDate != "" {
		t, _ := time.Parse("2006-01-02", req.BirthDate)
		student.TanggalLahir = t
	}
	student.JenisKelamin = req.Gender
	student.Agama = req.Religion
	student.Alamat = req.Address
	student.Kota = req.City
	student.KodePos = req.ZipCode
	student.NIK = req.NIK
	student.NISN = req.NISN
	student.Kewarganegaraan = req.Kewarganegaraan
	student.StatusPernikahan = req.StatusPernikahan
	student.GolonganDarah = req.GolonganDarah
	student.NamaAyah = req.NamaAyah
	student.NamaIbuKandung = req.NamaIbuKandung
	student.PekerjaanAyah = req.PekerjaanAyah
	student.PekerjaanIbu = req.PekerjaanIbu
	student.PenghasilanOrtu = req.PenghasilanOrtu
	student.AsalSekolah = req.AsalSekolah

	if err := config.DB.Save(&student).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui profil"})
	}

	// Sinkronisasi Golongan Darah ke tabel kesehatan jika ada perubahan
	if req.GolonganDarah != "" {
		config.DB.Model(&models.Kesehatan{}).Where("mahasiswa_id = ?", student.ID).Update("golongan_darah", strings.ToUpper(strings.TrimSpace(req.GolonganDarah)))
	}

	logActivity(c, "Memperbarui profil", "Data diri berhasil diperbarui")

	return c.JSON(fiber.Map{"success": true, "message": "Profil berhasil diperbarui"})
}

func ChangePassword(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	type PasswordRequest struct {
		OldPassword     string `json:"old_password"`
		NewPassword     string `json:"new_password"`
		ConfirmPassword string `json:"confirm_password"`
	}

	var req PasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Data tidak valid"})
	}

	if req.NewPassword != req.ConfirmPassword {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Konfirmasi password baru tidak cocok"})
	}

	var user models.User
	config.DB.First(&user, PenggunaID)

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Password saat ini salah"})
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 12)
	user.Password = string(hash)
	config.DB.Save(&user)

	return c.JSON(fiber.Map{"success": true, "message": "Password berhasil diperbarui"})
}

func UploadAvatar(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	file, err := c.FormFile("foto")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Tidak ada file yang diunggah"})
	}

	filename := fmt.Sprintf("avatar_%d_%v", PenggunaID, file.Filename)
	uploadDir := "./uploads/avatars"
	_ = os.MkdirAll(uploadDir, os.ModePerm)
	path := uploadDir + "/" + filename

	if err := c.SaveFile(file, path); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan file"})
	}

	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Student not found"})
	}
	config.DB.Model(student).Update("foto_url", "/uploads/avatars/"+filename)

	return c.JSON(fiber.Map{"success": true, "message": "Foto berhasil diunggah", "url": "/uploads/avatars/" + filename})
}

func GetPreferensiNotif(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"email":  true,
			"push":   true,
			"in_app": true,
		},
	})
}

func UpdatePreferensiNotif(c *fiber.Ctx) error {
	var body map[string]any
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data tidak valid"})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Preferensi berhasil diperbarui", "data": body})
}

func GetSesiAktif(c *fiber.Ctx) error {
	userID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var sessions []fiber.Map

	// Ambil dari log_aktivitas untuk sesi terbaru
	var logs []models.LogAktivitas
	config.DB.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(5).
		Find(&logs)

	for i, log := range logs {
		sessions = append(sessions, fiber.Map{
			"device":      "Web Browser",
			"last_active": log.CreatedAt,
			"ip":          log.IPAddress,
			"current":     i == 0,
		})
	}

	if len(sessions) == 0 {
		sessions = []fiber.Map{{
			"device":      "Web Browser",
			"last_active": time.Now(),
			"ip":          "127.0.0.1",
			"current":     true,
		}}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    sessions,
	})
}

func GetRiwayatLogin(c *fiber.Ctx) error {
	userID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var logs []models.LogAktivitas
	config.DB.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(20).
		Find(&logs)

	var riwayat []fiber.Map
	for _, log := range logs {
		riwayat = append(riwayat, fiber.Map{
			"created_at": log.CreatedAt,
			"user_agent": "Web Browser",
			"location":   "Tidak diketahui",
			"ip":         log.IPAddress,
			"status":     "Berhasil",
		})
	}

	if len(riwayat) == 0 {
		riwayat = []fiber.Map{{
			"created_at": time.Now(),
			"user_agent": "Web Browser",
			"location":   "Tidak diketahui",
			"ip":         "127.0.0.1",
			"status":     "Berhasil",
		}}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    riwayat,
	})
}

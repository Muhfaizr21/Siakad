package achievement

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type prestasiMandiriRequest struct {
	Level              string      `json:"level"`
	Kategori           string      `json:"kategori"`
	Lomba              string      `json:"lomba"`
	Cabang             string      `json:"cabang"`
	Penyelenggara      string      `json:"penyelenggara"`
	Peringkat          string      `json:"peringkat"`
	JumlahUnitPeserta  int         `json:"jumlah_unit_peserta"`
	KelompokPrestasi   string      `json:"kelompok_prestasi"`
	Bentuk             string      `json:"bentuk"`
	URLPeserta         string      `json:"url_peserta"`
	URLSertifikat      string      `json:"url_sertifikat"`
	TanggalSertifikat  string      `json:"tgl_sertifikat"`
	URLFotoUPP         string      `json:"url_foto_upp"`
	URLDokumenUndangan string      `json:"url_dokumen_undangan"`
	Keterangan         string      `json:"keterangan"`
	Mahasiswa          interface{} `json:"mahasiswa"`
	Dosen              interface{} `json:"dosen"`
}

func getUserID(c *fiber.Ctx) (uint, error) {
	v, ok := c.Locals("user_id").(uint)
	if !ok || v == 0 {
		return 0, fiber.NewError(fiber.StatusUnauthorized, "User tidak terautentikasi")
	}
	return v, nil
}

// GetAchievements returns paginated achievements and total stats for an individual student
func GetAchievements(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	search := c.Query("search", "")

	// Base Query
	query := config.DB.Model(&models.Prestasi{}).Where("mahasiswa_id = ?", student.ID)

	if search != "" {
		query = query.Where("nama_kegiatan LIKE ?", "%"+search+"%")
	}

	var totalReported, verifiedCount, pendingCount int64
	// Stats for all achievements (ignoring search)
	config.DB.Model(&models.Prestasi{}).Where("mahasiswa_id = ?", student.ID).Count(&totalReported)
	config.DB.Model(&models.Prestasi{}).Where("mahasiswa_id = ? AND status = ?", student.ID, "Diverifikasi").Count(&verifiedCount)
	config.DB.Model(&models.Prestasi{}).Where("mahasiswa_id = ? AND status = ?", student.ID, "Menunggu").Count(&pendingCount)

	// Fetch List
	var achievements []models.Prestasi
	query.Order("created_at desc").Find(&achievements)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"stats": fiber.Map{
				"total":    totalReported,
				"verified": verifiedCount,
				"pending":  pendingCount,
			},
			"list": achievements,
		},
	})
}

// CreateAchievement handles new achievement submissions with file upload
func CreateAchievement(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	namaKegiatan := c.FormValue("nama_kegiatan")
	kategori := c.FormValue("kategori")
	tingkat := c.FormValue("tingkat")
	peringkat := c.FormValue("peringkat")

	if namaKegiatan == "" || tingkat == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Field nama kegiatan dan tingkat wajib diisi"})
	}

	// Handle File Upload
	file, err := c.FormFile("bukti")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "File bukti wajib diunggah"})
	}

	// Validate File Size (Max 5MB)
	if file.Size > 5*1024*1024 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Ukuran file melebihi 5MB"})
	}

	// Validate Extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".pdf" && ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format file hanya boleh PDF, JPG, atau PNG"})
	}

	// Buat direktori jika belum ada
	uploadDir := "./uploads/achievements"
	_ = os.MkdirAll(uploadDir, os.ModePerm)

	fileId := uuid.New().String()
	fileOutputName := fmt.Sprintf("%s%s", fileId, ext)
	savePath := filepath.Join(uploadDir, fileOutputName)

	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan file"})
	}

	buktiURL := "/uploads/achievements/" + fileOutputName

	achievement := models.Prestasi{
		MahasiswaID:  student.ID,
		NamaKegiatan: namaKegiatan,
		Kategori:     kategori,
		Tingkat:      tingkat,
		Peringkat:    peringkat,
		BuktiURL:     buktiURL,
		Status:       "Menunggu",
		Poin:         0, // Default for now
	}

	orgID := c.FormValue("riwayat_organisasi_id")
	if orgID != "" {
		var org models.RiwayatOrganisasi
		if err := config.DB.First(&org, orgID).Error; err == nil {
			achievement.RiwayatOrganisasiID = &org.ID
		}
	}

	config.DB.Create(&achievement)

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Prestasi berhasil dilaporkan",
		"data":    achievement,
	})
}

func parsePrestasiMandiriPayload(req prestasiMandiriRequest) (models.Prestasi, error) {
	prestasi := models.Prestasi{
		NamaKegiatan:       req.Lomba,
		Kategori:           req.Kategori,
		Tingkat:            req.Level,
		Peringkat:          req.Peringkat,
		Level:              req.Level,
		Cabang:             req.Cabang,
		Penyelenggara:      req.Penyelenggara,
		JumlahUnitPeserta:  req.JumlahUnitPeserta,
		KelompokPrestasi:   req.KelompokPrestasi,
		Bentuk:             req.Bentuk,
		URLPeserta:         req.URLPeserta,
		URLSertifikat:      req.URLSertifikat,
		URLFotoUPP:         req.URLFotoUPP,
		URLDokumenUndangan: req.URLDokumenUndangan,
		Keterangan:         req.Keterangan,
		Status:             "draft",
		StatusSinkron:      "draft",
	}

	if req.TanggalSertifikat != "" {
		t, err := time.Parse("2006-01-02", req.TanggalSertifikat)
		if err != nil {
			return prestasi, fiber.NewError(fiber.StatusBadRequest, "Format tgl_sertifikat harus YYYY-MM-DD")
		}
		prestasi.TanggalSertifikat = &t
	}

	if req.Mahasiswa != nil {
		mBytes, err := json.Marshal(req.Mahasiswa)
		if err != nil {
			return prestasi, fiber.NewError(fiber.StatusBadRequest, "Payload mahasiswa tidak valid")
		}
		prestasi.MahasiswaPayload = mBytes
	}

	if req.Dosen != nil {
		dBytes, err := json.Marshal(req.Dosen)
		if err != nil {
			return prestasi, fiber.NewError(fiber.StatusBadRequest, "Payload dosen tidak valid")
		}
		prestasi.DosenPayload = dBytes
	}

	if prestasi.Level == "" || prestasi.Kategori == "" || prestasi.NamaKegiatan == "" || prestasi.Peringkat == "" {
		return prestasi, fiber.NewError(fiber.StatusBadRequest, "Field level, kategori, lomba, dan peringkat wajib diisi")
	}

	return prestasi, nil
}

// CreatePrestasiMandiri creates prestasi mandiri draft from JSON payload
func CreatePrestasiMandiri(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var req prestasiMandiriRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload JSON tidak valid"})
	}

	prestasi, err := parsePrestasiMandiriPayload(req)
	if err != nil {
		if ferr, ok := err.(*fiber.Error); ok {
			return c.Status(ferr.Code).JSON(fiber.Map{"success": false, "message": ferr.Message})
		}
		return c.Status(400).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	prestasi.MahasiswaID = student.ID
	if err := config.DB.Create(&prestasi).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan prestasi mandiri"})
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Draft prestasi mandiri berhasil disimpan",
		"data":    prestasi,
	})
}

// UpdatePrestasiMandiri updates a student draft/rejected submission
func UpdatePrestasiMandiri(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	id := c.Params("id")
	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var existing models.Prestasi
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", id, student.ID).First(&existing).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}

	if existing.Status != "draft" && existing.Status != "rejected_superadmin" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Data hanya bisa diubah saat draft atau ditolak super admin"})
	}

	var req prestasiMandiriRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload JSON tidak valid"})
	}

	updated, err := parsePrestasiMandiriPayload(req)
	if err != nil {
		if ferr, ok := err.(*fiber.Error); ok {
			return c.Status(ferr.Code).JSON(fiber.Map{"success": false, "message": ferr.Message})
		}
		return c.Status(400).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	updated.Status = existing.Status
	updated.StatusSinkron = existing.StatusSinkron

	if err := config.DB.Model(&existing).Updates(updated).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui data"})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Prestasi mandiri berhasil diperbarui"})
}

// SubmitPrestasiMandiri forwards draft to faculty admin queue
func SubmitPrestasiMandiri(c *fiber.Ctx) error {
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	id := c.Params("id")
	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var item models.Prestasi
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", id, student.ID).First(&item).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}

	if item.Status != "draft" && item.Status != "rejected_superadmin" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Data tidak dapat dikirim pada status saat ini"})
	}

	if err := config.DB.Model(&item).Updates(map[string]interface{}{
		"status": "submitted_to_fakultas",
	}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengirim ke fakultas"})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Prestasi mandiri berhasil dikirim ke admin fakultas"})
}

// GetAchievementDetail returns single achievement data
func GetAchievementDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var achievement models.Prestasi
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", id, student.ID).First(&achievement).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    achievement,
	})
}

// DeleteAchievement deletes an achievement only in editable states
func DeleteAchievement(c *fiber.Ctx) error {
	id := c.Params("id")
	PenggunaID, err := getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "User tidak terautentikasi"})
	}

	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var achievement models.Prestasi
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", id, student.ID).First(&achievement).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}

	if achievement.Status != "Menunggu" && achievement.Status != "draft" && achievement.Status != "rejected_superadmin" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Data hanya dapat dihapus saat draft/menunggu/ditolak"})
	}

	config.DB.Delete(&achievement)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Prestasi berhasil dihapus",
	})
}

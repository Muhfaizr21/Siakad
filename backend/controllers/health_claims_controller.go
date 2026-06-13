package controllers

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
	"gorm.io/gorm"
)

// ========================
// INSURANCE CLAIMS (MAHASISWA)
// ========================

func mapClaimToFrontend(claim models.PengajuanAsuransi) fiber.Map {
	var mhsMap fiber.Map = nil
	if claim.Mahasiswa.ID != 0 {
		prodiName := ""
		if claim.Mahasiswa.ProgramStudi.ID != 0 {
			prodiName = claim.Mahasiswa.ProgramStudi.Nama
		}
		fakName := ""
		if claim.Mahasiswa.Fakultas.ID != 0 {
			fakName = claim.Mahasiswa.Fakultas.Nama
		}

		mhsMap = fiber.Map{
			"id":            claim.Mahasiswa.ID,
			"nama":          claim.Mahasiswa.Nama,
			"nim":           claim.Mahasiswa.NIM,
			"program_studi": fiber.Map{
				"id":   claim.Mahasiswa.ProgramStudiID,
				"nama": prodiName,
			},
			"fakultas":      fiber.Map{
				"id":   claim.Mahasiswa.FakultasID,
				"nama": fakName,
			},
			"email_personal": claim.Mahasiswa.EmailPersonal,
			"no_hp":          claim.Mahasiswa.NoHP,
		}
	}

	// Dynamic PDF regeneration if missing on disk
	if claim.Status == models.StatusAsuransiApprovedTK && claim.SuratPengantarURL != "" {
		filePath := "." + claim.SuratPengantarURL
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			fullClaim := claim
			if fullClaim.Mahasiswa.ID == 0 {
				config.DB.Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").First(&fullClaim, claim.ID)
			}
			nomorSurat := fullClaim.SuratPengantarURL
			nomorSurat = strings.TrimPrefix(nomorSurat, "/uploads/surat/")
			nomorSurat = strings.TrimSuffix(nomorSurat, ".pdf")

			_, errGen := BuildSuratPengantarPDF(fullClaim, nomorSurat)
			if errGen != nil {
				log.Printf("[Asuransi] Gagal meregenerasi PDF surat pengantar: %v", errGen)
			}
		}
	}

	return fiber.Map{
		"id":                  claim.ID,
		"mahasiswa_id":        claim.MahasiswaID,
		"mahasiswa":           mhsMap,
		"jenis_provider":      claim.JenisProvider,
		"tanggal_kejadian":    claim.TanggalKejadian,
		"lokasi_faskes":       claim.LokasiFaskes,
		"deskripsi":           claim.Deskripsi,
		"estimasi_biaya":      claim.EstimasiBiaya,
		"file_url":            claim.FileURL,
		"file_url_2":          claim.FileURL2,
		"nama_file":           claim.NamaFile,
		"nama_file_2":         claim.NamaFile2,
		"status":              claim.Status,
		"catatan_review":      claim.CatatanReview,
		"reviewed_by":         claim.ReviewedBy,
		"reviewed_at":         claim.ReviewedAt,
		"surat_pengantar_url": claim.SuratPengantarURL,
		"created_at":          claim.CreatedAt,
		"updated_at":          claim.UpdatedAt,
	}
}

// GetInsuranceClaims - List all insurance claims (filtered by role)
func GetInsuranceClaims(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	role := c.Locals("role").(string)

	// Base query with preloading
	query := config.DB.Model(&models.PengajuanAsuransi{}).Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi")

	// Role-based filtering
	switch role {
	case "mahasiswa":
		// Mahasiswa hanya bisa lihat miliknya
		var mahasiswa models.Mahasiswa
		if err := config.DB.Where("pengguna_id = ?", userID).First(&mahasiswa).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "Profil mahasiswa tidak ditemukan")
		}
		query = query.Where("mahasiswa_id = ?", mahasiswa.ID)
	case "tenaga_kesehatan":
		// TK bisa lihat semua yang belum direview atau yang sudah dia review sendiri
		query = query.Where("status = ? OR reviewed_by = ?", models.StatusAsuransiPending, userID)
	case "super_admin":
		// Super admin bisa lihat semua
	default:
		// Admin fakultas bisa lihat based on fakultas
		var fakultasID *uint
		config.DB.Model(&models.User{}).Where("id = ?", userID).Pluck("fakultas_id", &fakultasID)
		if fakultasID != nil {
			query = query.Joins("JOIN mahasiswa.mahasiswa m ON m.id = pengajuan_asuransi.mahasiswa_id").
				Where("m.fakultas_id = ?", *fakultasID)
		}
	}

	// Apply filters
	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	jenisProvider := c.Query("jenis_provider")
	if jenisProvider != "" {
		query = query.Where("jenis_provider = ?", jenisProvider)
	}

	// Date range filter
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	if startDate != "" && endDate != "" {
		query = query.Where("tanggal_kejadian >= ? AND tanggal_kejadian <= ?", startDate, endDate+" 23:59:59")
	}

	var claims []models.PengajuanAsuransi
	if err := query.Order("created_at desc").Find(&claims).Error; err != nil {
		return err
	}

	var data []fiber.Map
	for _, claim := range claims {
		data = append(data, mapClaimToFrontend(claim))
	}

	return c.JSON(fiber.Map{"status": "success", "data": data})
}

// GetInsuranceClaimDetail - Get single insurance claim
func GetInsuranceClaimDetail(c *fiber.Ctx) error {
	claimID := c.Params("id")
	userID := c.Locals("user_id").(uint)
	role := c.Locals("role").(string)

	var claim models.PengajuanAsuransi
	if err := config.DB.Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").First(&claim, claimID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Pengajuan tidak ditemukan")
	}

	// Check access
	if role == "mahasiswa" {
		var mahasiswa models.Mahasiswa
		if err := config.DB.Where("pengguna_id = ?", userID).First(&mahasiswa).Error; err != nil {
			return fiber.NewError(fiber.StatusForbidden, "Akses ditolak")
		}
		if claim.MahasiswaID != mahasiswa.ID {
			return fiber.NewError(fiber.StatusForbidden, "Akses ditolak")
		}
	}

	return c.JSON(fiber.Map{"status": "success", "data": mapClaimToFrontend(claim)})
}

// CreateInsuranceClaim - Create new insurance claim (Mahasiswa)
func CreateInsuranceClaim(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	role := c.Locals("role").(string)

	// Only mahasiswa can create
	if role != "mahasiswa" {
		return fiber.NewError(fiber.StatusForbidden, "Hanya mahasiswa yang bisa mengajukan klaim")
	}

	// Find mahasiswa profile
	var mahasiswa models.Mahasiswa
	if err := config.DB.Where("pengguna_id = ?", userID).First(&mahasiswa).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Profil mahasiswa tidak ditemukan")
	}

	var body struct {
		JenisProvider   string  `json:"jenis_provider"`
		TanggalKejadian string  `json:"tanggal_kejadian"`
		LokasiFaskes    string  `json:"lokasi_faskes"`
		Deskripsi       string  `json:"deskripsi"`
		EstimasiBiaya   float64 `json:"estimasi_biaya"`
	}

	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload tidak valid")
	}

	// Validate required fields
	if body.JenisProvider == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Jenis provider wajib diisi")
	}
	if body.TanggalKejadian == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Tanggal kejadian wajib diisi")
	}
	if body.Deskripsi == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Deskripsi kronologis wajib diisi")
	}

	// Parse date
	parsedDate, err := time.Parse("2006-01-02", body.TanggalKejadian)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Format tanggal tidak valid (YYYY-MM-DD)")
	}

	// Create claim
	claim := models.PengajuanAsuransi{
		MahasiswaID:     mahasiswa.ID,
		JenisProvider:   body.JenisProvider,
		TanggalKejadian: parsedDate,
		LokasiFaskes:    body.LokasiFaskes,
		Deskripsi:       body.Deskripsi,
		EstimasiBiaya:   body.EstimasiBiaya,
		Status:          models.StatusAsuransiPending,
	}

	if err := config.DB.Create(&claim).Error; err != nil {
		return err
	}

	// Reload with mahasiswa data
	config.DB.Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").First(&claim, claim.ID)

	return c.JSON(fiber.Map{"status": "success", "data": mapClaimToFrontend(claim), "message": "Pengajuan klaim berhasil"})
}

// UpdateInsuranceClaimStatus - Update status (TK/Admin review)
func UpdateInsuranceClaimStatus(c *fiber.Ctx) error {
	claimID := c.Params("id")
	userID := c.Locals("user_id").(uint)
	role := c.Locals("role").(string)

	// Only TK and admin can update status
	if role != "tenaga_kesehatan" && role != "super_admin" {
		return fiber.NewError(fiber.StatusForbidden, "Akses ditolak")
	}

	var body struct {
		Status        string `json:"status"`
		CatatanReview string `json:"catatan_review"`
	}

	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload tidak valid")
	}

	// Validate status
	validStatuses := map[string]bool{
		models.StatusAsuransiPending:       true,
		models.StatusAsuransiApprovedTK:   true,
		models.StatusAsuransiApprovedFinal: true,
		models.StatusAsuransiRejected:     true,
	}

	if !validStatuses[body.Status] {
		return fiber.NewError(fiber.StatusBadRequest, "Status tidak valid")
	}

	var claim models.PengajuanAsuransi
	if err := config.DB.First(&claim, claimID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Pengajuan tidak ditemukan")
	}

	// Update claim
	now := time.Now()
	updates := map[string]interface{}{
		"status":         body.Status,
		"catatan_review": body.CatatanReview,
		"reviewed_by":    userID,
		"reviewed_at":    &now,
	}

	if body.Status == models.StatusAsuransiApprovedTK {
		// Generate nomor surat
		nomorSurat := fmt.Sprintf("XX/Direktorat-LK/%s/%d", "Klaim-Assurance", now.Year())
		updates["surat_pengantar_url"] = "/uploads/surat/" + nomorSurat + ".pdf"

		// Preload Mahasiswa data to generate the PDF
		var fullClaim models.PengajuanAsuransi
		if err := config.DB.Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").First(&fullClaim, claimID).Error; err == nil {
			_, errGen := BuildSuratPengantarPDF(fullClaim, nomorSurat)
			if errGen != nil {
				log.Printf("[Asuransi] Gagal generate PDF surat pengantar: %v", errGen)
			}
		} else {
			log.Printf("[Asuransi] Gagal load fullClaim untuk PDF: %v", err)
		}
	}

	if err := config.DB.Model(&claim).Updates(updates).Error; err != nil {
		return err
	}

	// Reload
	config.DB.Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").First(&claim, claim.ID)

	// Send notification to mahasiswa
	go func() {
		var title, content string
		switch body.Status {
		case models.StatusAsuransiApprovedTK:
			title = "Klaim Asuransi Disetujui 🎉"
			content = "Pengajuan klaim asuransi Anda telah disetujui oleh Tenaga Kesehatan. Surat pengantar sedang dalam proses."
		case models.StatusAsuransiApprovedFinal:
			title = "Klaim Asuransi Final Approved ✅"
			content = "Pengajuan klaim asuransi Anda telah disetujui secara final."
		case models.StatusAsuransiRejected:
			title = "Klaim Asuransi Ditolak ❌"
			content = "Maaf, pengajuan klaim asuransi Anda ditolak. Catatan: " + body.CatatanReview
		}

		config.DB.Create(&models.Notifikasi{
			UserID:    claim.MahasiswaID,
			Judul:     title,
			Deskripsi: content,
			IsRead:    false,
		})
	}()

	return c.JSON(fiber.Map{"status": "success", "data": mapClaimToFrontend(claim), "message": "Status berhasil diperbarui"})
}

// UploadInsuranceDocument - Upload document for insurance claim
func UploadInsuranceDocument(c *fiber.Ctx) error {
	claimID := c.Params("id")
	userID := c.Locals("user_id").(uint)
	role := c.Locals("role").(string)

	var claim models.PengajuanAsuransi
	if err := config.DB.First(&claim, claimID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Pengajuan tidak ditemukan")
	}

	// Check ownership (mahasiswa only can upload to their own)
	if role == "mahasiswa" {
		var mahasiswa models.Mahasiswa
		if err := config.DB.Where("pengguna_id = ?", userID).First(&mahasiswa).Error; err != nil {
			return fiber.NewError(fiber.StatusForbidden, "Akses ditolak")
		}
		if claim.MahasiswaID != mahasiswa.ID {
			return fiber.NewError(fiber.StatusForbidden, "Akses ditolak")
		}
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "File tidak ditemukan")
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		return fiber.NewError(fiber.StatusBadRequest, "Ukuran file maksimal 5MB")
	}

	// Validate file type
	ext := filepath.Ext(file.Filename)
	validExts := map[string]bool{".pdf": true, ".jpg": true, ".jpeg": true, ".png": true}
	if !validExts[ext] {
		return fiber.NewError(fiber.StatusBadRequest, "Format file tidak valid (pdf, jpg, png)")
	}

	// Generate filename
	filename := fmt.Sprintf("insurance_%s_%d%s", claimID, time.Now().Unix(), ext)
	savePath := "uploads/insurance/" + filename

	// Save file
	if err := c.SaveFile(file, savePath); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Gagal menyimpan file")
	}

	// Update claim
	updates := map[string]interface{}{
		"file_url":  savePath,
		"nama_file": file.Filename,
	}

	// Check if second file
	docNum := c.FormValue("doc_number")
	if docNum == "2" {
		updates["file_url_2"] = savePath
		updates["nama_file_2"] = file.Filename
	}

	config.DB.Model(&claim).Updates(updates)
	config.DB.Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").First(&claim, claim.ID)

	return c.JSON(fiber.Map{"status": "success", "data": mapClaimToFrontend(claim), "message": "Dokumen berhasil diupload"})
}

// GetInsuranceStats - Get insurance claim statistics
func GetInsuranceStats(c *fiber.Ctx) error {
	var stats struct {
		TotalPengajuan   int64 `json:"total_pengajuan"`
		Pending          int64 `json:"pending"`
		ApprovedTK       int64 `json:"approved_tk"`
		ApprovedFinal    int64 `json:"approved_final"`
		Rejected         int64 `json:"rejected"`
		TotalEstimasiBiaya float64 `json:"total_estimasi_biaya"`
	}

	// Total all
	config.DB.Model(&models.PengajuanAsuransi{}).Count(&stats.TotalPengajuan)
	config.DB.Model(&models.PengajuanAsuransi{}).Where("status = ?", models.StatusAsuransiPending).Count(&stats.Pending)
	config.DB.Model(&models.PengajuanAsuransi{}).Where("status = ?", models.StatusAsuransiApprovedTK).Count(&stats.ApprovedTK)
	config.DB.Model(&models.PengajuanAsuransi{}).Where("status = ?", models.StatusAsuransiApprovedFinal).Count(&stats.ApprovedFinal)
	config.DB.Model(&models.PengajuanAsuransi{}).Where("status = ?", models.StatusAsuransiRejected).Count(&stats.Rejected)
	config.DB.Model(&models.PengajuanAsuransi{}).Select("COALESCE(SUM(estimasi_biaya), 0)").Row().Scan(&stats.TotalEstimasiBiaya)

	// By provider
	type ProviderStats struct {
		Provider string `json:"provider"`
		Count    int    `json:"count"`
		Total    float64 `json:"total"`
	}

	var byProvider []ProviderStats
	config.DB.Model(&models.PengajuanAsuransi{}).
		Select("jenis_provider as provider, count(*) as count, COALESCE(sum(estimasi_biaya), 0) as total").
		Group("jenis_provider").
		Scan(&byProvider)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"summary":     stats,
			"by_provider": byProvider,
		},
	})
}

// ========================
// SELF-SCREENING (MAHASISWA)
// ========================

// GetSelfScreenings - Get all self-screenings (own for mahasiswa, all for TK/admin)
func GetSelfScreenings(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	role := c.Locals("role").(string)

	query := config.DB.Model(&models.SelfScreening{}).Preload("Mahasiswa")

	switch role {
	case "mahasiswa":
		// Find mahasiswa ID
		var mahasiswa models.Mahasiswa
		if err := config.DB.Where("pengguna_id = ?", userID).First(&mahasiswa).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "Profil mahasiswa tidak ditemukan")
		}
		query = query.Where("mahasiswa_id = ?", mahasiswa.ID)
	case "tenaga_kesehatan":
		// TK bisa filter by status
		isCompleted := c.Query("is_completed")
		if isCompleted == "true" {
			query = query.Where("is_completed_tk = ?", true)
		} else if isCompleted == "false" {
			query = query.Where("is_completed_tk = ?", false)
		}
	}

	// Date filter
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	if startDate != "" && endDate != "" {
		query = query.Where("created_at >= ? AND created_at <= ?", startDate, endDate+" 23:59:59")
	}

	var screenings []models.SelfScreening
	if err := query.Order("created_at desc").Find(&screenings).Error; err != nil {
		return err
	}

	return c.JSON(fiber.Map{"status": "success", "data": screenings})
}

// GetSelfScreeningDetail - Get single self-screening
func GetSelfScreeningDetail(c *fiber.Ctx) error {
	screeningID := c.Params("id")
	userID := c.Locals("user_id").(uint)
	role := c.Locals("role").(string)

	var screening models.SelfScreening
	if err := config.DB.Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").First(&screening, screeningID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Data screening tidak ditemukan")
	}

	// Check access
	if role == "mahasiswa" {
		var mahasiswa models.Mahasiswa
		if err := config.DB.Where("pengguna_id = ?", userID).First(&mahasiswa).Error; err != nil {
			return fiber.NewError(fiber.StatusForbidden, "Akses ditolak")
		}
		if screening.MahasiswaID != mahasiswa.ID {
			return fiber.NewError(fiber.StatusForbidden, "Akses ditolak")
		}
	}

	// Get related data if exists
	if screening.BookingID != nil {
		var booking models.BookingKesehatan
		config.DB.Preload("Jadwal").First(&booking, *screening.BookingID)
		_ = booking // bisa ditambahkan ke response
	}

	return c.JSON(fiber.Map{"status": "success", "data": screening})
}

// CreateSelfScreening - Create new self-screening (Mahasiswa)
func CreateSelfScreening(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	// Find mahasiswa profile
	var mahasiswa models.Mahasiswa
	if err := config.DB.Where("pengguna_id = ?", userID).First(&mahasiswa).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Profil mahasiswa tidak ditemukan")
	}

	var body struct {
		BookingID    *uint  `json:"booking_id"`
		KeluhanUtama string `json:"keluhan_utama"`
		SkalaNyeri   int    `json:"skala_nyeri"`
		AlergiObat   string `json:"alergi_obat"`
		KonsumsiObat string `json:"konsumsi_obat"`
	}

	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload tidak valid")
	}

	// Validate
	if body.KeluhanUtama == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Keluhan utama wajib diisi")
	}

	// Skala nyeri validation
	if body.SkalaNyeri < 0 || body.SkalaNyeri > 10 {
		return fiber.NewError(fiber.StatusBadRequest, "Skala nyeri harus antara 0-10")
	}

	// Create screening
	screening := models.SelfScreening{
		MahasiswaID:  mahasiswa.ID,
		BookingID:     body.BookingID,
		KeluhanUtama:  body.KeluhanUtama,
		SkalaNyeri:    body.SkalaNyeri,
		AlergiObat:    body.AlergiObat,
		KonsumsiObat:  body.KonsumsiObat,
		IsCompletedTK: false,
	}

	if err := config.DB.Create(&screening).Error; err != nil {
		return err
	}

	// Reload with mahasiswa data
	config.DB.Preload("Mahasiswa").First(&screening, screening.ID)

	return c.JSON(fiber.Map{"status": "success", "data": screening, "message": "Data screening berhasil disimpan"})
}

// CompleteSelfScreening - Mark self-screening as completed by TK
func CompleteSelfScreening(c *fiber.Ctx) error {
	screeningID := c.Params("id")
	userID := c.Locals("user_id").(uint)
	role := c.Locals("role").(string)

	if role != "tenaga_kesehatan" && role != "super_admin" {
		return fiber.NewError(fiber.StatusForbidden, "Akses ditolak")
	}

	var screening models.SelfScreening
	if err := config.DB.First(&screening, screeningID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Data screening tidak ditemukan")
	}

	now := time.Now()
	updates := map[string]interface{}{
		"is_completed_tk": true,
		"screened_at":      &now,
		"tk_id":            userID,
	}

	if err := config.DB.Model(&screening).Updates(updates).Error; err != nil {
		return err
	}

	config.DB.Preload("Mahasiswa").First(&screening, screening.ID)

	// Notify mahasiswa
	go func() {
		config.DB.Create(&models.Notifikasi{
			UserID:    screening.MahasiswaID,
			Judul:     "Pemeriksaan Telah Selesai ✅",
			Deskripsi: "Data screening Anda telah diverifikasi oleh Tenaga Kesehatan. Silakan ke klinik untuk pemeriksaan lebih lanjut jika diperlukan.",
			IsRead:    false,
		})
	}()

	return c.JSON(fiber.Map{"status": "success", "data": screening, "message": "Screening ditandai selesai"})
}

// ========================
// BAP KESEHATAN (TENAGA KESEHATAN)
// ========================

// GetBAPs - Get all BAP Kesehatan
func GetBAPs(c *fiber.Ctx) error {
	query := config.DB.Model(&models.BeritaAcaraPemeriksaan{})

	// Filters
	eventID := c.Query("event_id")
	if eventID != "" {
		query = query.Where("event_id = ?", eventID)
	}

	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	if startDate != "" && endDate != "" {
		query = query.Where("tanggal_pelaksanaan >= ? AND tanggal_pelaksanaan <= ?", startDate, endDate+" 23:59:59")
	}

	var baps []models.BeritaAcaraPemeriksaan
	if err := query.Order("tanggal_pelaksanaan desc").Find(&baps).Error; err != nil {
		return err
	}

	return c.JSON(fiber.Map{"status": "success", "data": baps})
}

// GetBAPDetail - Get single BAP
func GetBAPDetail(c *fiber.Ctx) error {
	bapID := c.Params("id")

	var bap models.BeritaAcaraPemeriksaan
	if err := config.DB.First(&bap, bapID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "BAP tidak ditemukan")
	}

	// Get related event
	if bap.EventID != nil {
		var event models.PemeriksaanMassal
		config.DB.First(&event, *bap.EventID)
		_ = event
	}

	return c.JSON(fiber.Map{"status": "success", "data": bap})
}

// CreateBAP - Create new BAP
func CreateBAP(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var body struct {
		EventID          *uint  `json:"event_id"`
		NamaKegiatan     string `json:"nama_kegiatan"`
		TanggalPelaksanaan string `json:"tanggal_pelaksanaan"`
		WaktuMulai       string `json:"waktu_mulai"`
		WaktuSelesai     string `json:"waktu_selesai"`
		Tempat           string `json:"tempat"`
		JumlahPeserta    int    `json:"jumlah_peserta"`
		JumlahDiperiksa  int    `json:"jumlah_diperiksa"`
		TotalLayak       int    `json:"total_layak"`
		TotalPantauan    int    `json:"total_pantauan"`
		TotalTidakLayak  int    `json:"total_tidak_layak"`
	}

	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload tidak valid")
	}

	if body.NamaKegiatan == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Nama kegiatan wajib diisi")
	}

	// Parse date
	parsedDate, err := time.Parse("2006-01-02", body.TanggalPelaksanaan)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Format tanggal tidak valid")
	}

	bap := models.BeritaAcaraPemeriksaan{
		EventID:             body.EventID,
		TKID:                &userID,
		NamaKegiatan:        body.NamaKegiatan,
		TanggalPelaksanaan:  parsedDate,
		WaktuMulai:          body.WaktuMulai,
		WaktuSelesai:        body.WaktuSelesai,
		Tempat:              body.Tempat,
		JumlahPeserta:       body.JumlahPeserta,
		JumlahDiperiksa:     body.JumlahDiperiksa,
		TotalLayak:          body.TotalLayak,
		TotalPantauan:       body.TotalPantauan,
		TotalTidakLayak:     body.TotalTidakLayak,
		Status:              models.BAPStatusDraft,
	}

	if err := config.DB.Create(&bap).Error; err != nil {
		return err
	}

	config.DB.First(&bap, bap.ID)
	return c.JSON(fiber.Map{"status": "success", "data": bap, "message": "BAP berhasil dibuat"})
}

// UpdateBAP - Update BAP
func UpdateBAP(c *fiber.Ctx) error {
	bapID := c.Params("id")

	var bap models.BeritaAcaraPemeriksaan
	if err := config.DB.First(&bap, bapID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "BAP tidak ditemukan")
	}

	var body struct {
		NamaKegiatan     string `json:"nama_kegiatan"`
		TanggalPelaksanaan string `json:"tanggal_pelaksanaan"`
		WaktuMulai       string `json:"waktu_mulai"`
		WaktuSelesai     string `json:"waktu_selesai"`
		Tempat           string `json:"tempat"`
		JumlahPeserta    int    `json:"jumlah_peserta"`
		JumlahDiperiksa  int    `json:"jumlah_diperiksa"`
		TotalLayak       int    `json:"total_layak"`
		TotalPantauan    int    `json:"total_pantauan"`
		TotalTidakLayak  int    `json:"total_tidak_layak"`
		Status           string `json:"status"`
		TTDKepalaDivisi  string `json:"ttd_kepala_divisi"`
		TTDTimMedis      string `json:"ttd_tim_medis"`
	}

	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload tidak valid")
	}

	updates := map[string]interface{}{}

	if body.NamaKegiatan != "" {
		updates["nama_kegiatan"] = body.NamaKegiatan
	}
	if body.TanggalPelaksanaan != "" {
		if parsedDate, err := time.Parse("2006-01-02", body.TanggalPelaksanaan); err == nil {
			updates["tanggal_pelaksanaan"] = parsedDate
		}
	}
	if body.WaktuMulai != "" {
		updates["waktu_mulai"] = body.WaktuMulai
	}
	if body.WaktuSelesai != "" {
		updates["waktu_selesai"] = body.WaktuSelesai
	}
	if body.Tempat != "" {
		updates["tempat"] = body.Tempat
	}
	if body.JumlahPeserta > 0 {
		updates["jumlah_peserta"] = body.JumlahPeserta
	}
	if body.JumlahDiperiksa >= 0 {
		updates["jumlah_diperiksa"] = body.JumlahDiperiksa
	}
	if body.TotalLayak >= 0 {
		updates["total_layak"] = body.TotalLayak
	}
	if body.TotalPantauan >= 0 {
		updates["total_pantauan"] = body.TotalPantauan
	}
	if body.TotalTidakLayak >= 0 {
		updates["total_tidak_layak"] = body.TotalTidakLayak
	}
	if body.Status != "" {
		updates["status"] = body.Status
	}
	if body.TTDKepalaDivisi != "" {
		updates["ttd_kepala_divisi"] = body.TTDKepalaDivisi
	}
	if body.TTDTimMedis != "" {
		updates["ttd_tim_medis"] = body.TTDTimMedis
	}

	if err := config.DB.Model(&bap).Updates(updates).Error; err != nil {
		return err
	}

	config.DB.First(&bap, bap.ID)
	return c.JSON(fiber.Map{"status": "success", "data": bap, "message": "BAP berhasil diperbarui"})
}

// DeleteBAP - Delete BAP
func DeleteBAP(c *fiber.Ctx) error {
	bapID := c.Params("id")

	var bap models.BeritaAcaraPemeriksaan
	if err := config.DB.First(&bap, bapID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "BAP tidak ditemukan")
	}

	if bap.Status == models.BAPStatusFinal {
		return fiber.NewError(fiber.StatusBadRequest, "BAP yang sudah FINAL tidak bisa dihapus")
	}

	config.DB.Delete(&bap)
	return c.JSON(fiber.Map{"status": "success", "message": "BAP berhasil dihapus"})
}

// ========================
// RUJUKAN KESEHATAN
// ========================

// CreateRujukan - Create new rujukan (TK only)
func CreateRujukan(c *fiber.Ctx) error {
	role := c.Locals("role").(string)

	if role != "tenaga_kesehatan" && role != "super_admin" {
		return fiber.NewError(fiber.StatusForbidden, "Akses ditolak")
	}

	var body struct {
		SelfScreeningID *uint  `json:"self_screening_id"`
		KesehatanID     *uint  `json:"kesehatan_id"`
		MahasiswaID     uint   `json:"mahasiswa_id"`
		FaskesTujuan    string `json:"faskes_tujuan"`
		AlasanRujukan   string `json:"alasan_rujukan"`
		KeluhanUtama    string `json:"keluhan_utama"`
		SuhuTubuh       float64 `json:"suhu_tubuh"`
		Sistole         int    `json:"sistole"`
		Diastole        int    `json:"diastole"`
		DenyutNadi      int    `json:"denyut_nadi"`
		SpO2            int    `json:"spo2"`
		Diagnosis       string `json:"diagnosis"`
	}

	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload tidak valid")
	}

	if body.FaskesTujuan == "" || body.AlasanRujukan == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Faskes tujuan dan alasan rujukan wajib diisi")
	}

	rujukan := models.RujukanKesehatan{
		SelfScreeningID: body.SelfScreeningID,
		KesehatanID:     body.KesehatanID,
		MahasiswaID:     body.MahasiswaID,
		FaskesTujuan:    body.FaskesTujuan,
		AlasanRujukan:   body.AlasanRujukan,
		KeluhanUtama:    body.KeluhanUtama,
		SuhuTubuh:       body.SuhuTubuh,
		Sistole:         body.Sistole,
		Diastole:        body.Diastole,
		DenyutNadi:      body.DenyutNadi,
		SpO2:            body.SpO2,
		Diagnosis:       body.Diagnosis,
		IsPublished:     false,
	}

	if err := config.DB.Create(&rujukan).Error; err != nil {
		return err
	}

	// Update self_screening if linked
	if body.SelfScreeningID != nil {
		config.DB.Model(&models.SelfScreening{}).Where("id = ?", *body.SelfScreeningID).Updates(map[string]interface{}{
			"has_rujukan": true,
			"rujukan_id":   rujukan.ID,
		})
	}

	config.DB.Preload("Mahasiswa").First(&rujukan, rujukan.ID)

	return c.JSON(fiber.Map{"status": "success", "data": rujukan, "message": "Rujukan berhasil dibuat"})
}

// GetRujukans - Get all rujukans (filtered by role)
func GetRujukans(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	role := c.Locals("role").(string)

	query := config.DB.Model(&models.RujukanKesehatan{}).Preload("Mahasiswa")

	switch role {
	case "mahasiswa":
		var mahasiswa models.Mahasiswa
		if err := config.DB.Where("pengguna_id = ?", userID).First(&mahasiswa).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "Profil mahasiswa tidak ditemukan")
		}
		// Only published rujukans for mahasiswa
		query = query.Where("mahasiswa_id = ? AND is_published = ?", mahasiswa.ID, true)
	case "tenaga_kesehatan":
		// Filter by published status
		isPublished := c.Query("is_published")
		if isPublished != "" {
			query = query.Where("is_published = ?", isPublished == "true")
		}
	}

	var rujukans []models.RujukanKesehatan
	if err := query.Order("created_at desc").Find(&rujukans).Error; err != nil {
		return err
	}

	return c.JSON(fiber.Map{"status": "success", "data": rujukans})
}

// GetRujukanDetail - Get single rujukan
func GetRujukanDetail(c *fiber.Ctx) error {
	rujukanID := c.Params("id")
	role := c.Locals("role").(string)

	var rujukan models.RujukanKesehatan
	if err := config.DB.Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").First(&rujukan, rujukanID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Rujukan tidak ditemukan")
	}

	// Check access
	if role == "mahasiswa" && !rujukan.IsPublished {
		return fiber.NewError(fiber.StatusForbidden, "Rujukan belum dipublikasikan")
	}

	return c.JSON(fiber.Map{"status": "success", "data": rujukan})
}

// PublishRujukan - Publish rujukan (make available to mahasiswa)
func PublishRujukan(c *fiber.Ctx) error {
	rujukanID := c.Params("id")
	userID := c.Locals("user_id").(uint)
	role := c.Locals("role").(string)

	if role != "tenaga_kesehatan" && role != "super_admin" {
		return fiber.NewError(fiber.StatusForbidden, "Akses ditolak")
	}

	var rujukan models.RujukanKesehatan
	if err := config.DB.First(&rujukan, rujukanID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Rujukan tidak ditemukan")
	}

	now := time.Now()
	updates := map[string]interface{}{
		"is_published": true,
		"published_at":  &now,
		"published_by":   &userID,
	}

	if err := config.DB.Model(&rujukan).Updates(updates).Error; err != nil {
		return err
	}

	config.DB.Preload("Mahasiswa").First(&rujukan, rujukan.ID)

	// Notify mahasiswa
	go func() {
		config.DB.Create(&models.Notifikasi{
			UserID:    rujukan.MahasiswaID,
			Judul:     "Surat Rujukan Siap Diunduh 📄",
			Deskripsi: "Surat rujukan ke " + rujukan.FaskesTujuan + " telah siap. Silakan download dari menu Kesehatan.",
			IsRead:    false,
		})
	}()

	return c.JSON(fiber.Map{"status": "success", "data": rujukan, "message": "Rujukan berhasil dipublikasikan"})
}

// ========================
// CLINICAL REPORTS
// ========================

// GetClinicalReports - Get clinical reports data
func GetClinicalReports(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	role := c.Locals("role").(string)

	// Date range
	startDate := c.Query("start_date", time.Now().AddDate(0, -1, 0).Format("2006-01-02"))
	endDate := c.Query("end_date", time.Now().Format("2006-01-02"))

	// Base query condition builder to ensure filters are applied consistently
	applyFilters := func(q *gorm.DB) *gorm.DB {
		q = q.Where("tanggal >= ? AND tanggal <= ?", startDate, endDate+" 23:59:59")
		if role == "tenaga_kesehatan" {
			var tk models.TenagaKesehatan
			if err := config.DB.Where("user_id = ?", userID).First(&tk).Error; err == nil {
				q = q.Where("tenaga_kes_id = ?", tk.ID)
			}
		}
		return q
	}

	// Summary stats
	var stats struct {
		TotalDiperiksa int64 `json:"total_diperiksa"`
		Layak          int64 `json:"layak"`
		PerluPerhatian int64 `json:"perlu_perhatian"`
		TidakLayak     int64 `json:"tidak_layak"`
	}

	applyFilters(config.DB.Model(&models.Kesehatan{})).Count(&stats.TotalDiperiksa)
	applyFilters(config.DB.Model(&models.Kesehatan{})).Where("hasil = ?", "Layak Kegiatan").Count(&stats.Layak)
	applyFilters(config.DB.Model(&models.Kesehatan{})).Where("hasil = ?", "Perlu Perhatian").Count(&stats.PerluPerhatian)
	applyFilters(config.DB.Model(&models.Kesehatan{})).Where("hasil = ?", "Tidak Layak").Count(&stats.TidakLayak)

	// Records
	var records []models.Kesehatan
	applyFilters(config.DB.Preload("Mahasiswa").Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").Preload("TenagaKes")).
		Order("tanggal desc").
		Limit(100).Find(&records)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"summary": stats,
			"records": records,
			"filters": fiber.Map{
				"start_date": startDate,
				"end_date":   endDate,
			},
		},
	})
}

// ========================
// PDF EXPORT HELPERS (STUBS)
// ========================

// ExportSuratPengantarPDF - Generate/Serve Surat Pengantar Klaim PDF
func ExportSuratPengantarPDF(c *fiber.Ctx) error {
	claimID := c.Params("id")

	var claim models.PengajuanAsuransi
	if err := config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Fakultas").First(&claim, claimID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Pengajuan tidak ditemukan")
	}

	if claim.Status != models.StatusAsuransiApprovedTK {
		return fiber.NewError(fiber.StatusBadRequest, "Surat pengantar hanya tersedia untuk pengajuan yang telah disetujui Tenaga Kesehatan")
	}

	// Generate nomor surat if not exists
	if claim.SuratPengantarURL == "" {
		now := time.Now()
		nomorSurat := fmt.Sprintf("XX/Direktorat-LK/%s/%d", "Klaim-Assurance", now.Year())
		claim.SuratPengantarURL = "/uploads/surat/" + nomorSurat + ".pdf"
		config.DB.Model(&claim).Update("surat_pengantar_url", claim.SuratPengantarURL)
	}

	filePath := "." + claim.SuratPengantarURL
	// Build/regenerate if file doesn't exist
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		nomorSurat := claim.SuratPengantarURL
		nomorSurat = strings.TrimPrefix(nomorSurat, "/uploads/surat/")
		nomorSurat = strings.TrimSuffix(nomorSurat, ".pdf")

		var errGen error
		filePath, errGen = BuildSuratPengantarPDF(claim, nomorSurat)
		if errGen != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Gagal membuat PDF surat pengantar: "+errGen.Error())
		}
	}

	// Set header for file download
	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=surat_pengantar_klaim_%s.pdf", claimID))
	return c.SendFile(filePath)
}

// ExportBAPPDF - Generate BAP PDF
func ExportBAPPDF(c *fiber.Ctx) error {
	bapID := c.Params("id")

	var bap models.BeritaAcaraPemeriksaan
	if err := config.DB.First(&bap, bapID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "BAP tidak ditemukan")
	}

	// Build/regenerate file
	fileName := fmt.Sprintf("bap_%d.pdf", bap.ID)
	dirPath := "uploads/bap"
	if err := os.MkdirAll(dirPath, 0755); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Gagal membuat direktori PDF")
	}

	filePath := filepath.Join(dirPath, fileName)
	_ = os.Remove(filePath) // clean up old file if exists

	if err := BuildBAPPDF(bap, filePath); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Gagal membuat PDF BAP: "+err.Error())
	}

	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=bap_%s.pdf", bapID))
	return c.SendFile(filePath)
}

func getIndonesianDay(t time.Time) string {
	days := map[string]string{
		"Sunday":    "Minggu",
		"Monday":    "Senin",
		"Tuesday":   "Selasa",
		"Wednesday": "Rabu",
		"Thursday":  "Kamis",
		"Friday":    "Jumat",
		"Saturday":  "Sabtu",
	}
	return days[t.Format("Monday")]
}

func getIndonesianMonth(t time.Time) string {
	months := map[string]string{
		"January":   "Januari",
		"February":  "Februari",
		"March":     "Maret",
		"April":     "April",
		"May":       "Mei",
		"June":      "Juni",
		"July":      "Juli",
		"August":    "Agustus",
		"September": "September",
		"October":   "Oktober",
		"November":  "November",
		"December":  "Desember",
	}
	return months[t.Format("January")]
}

func BuildBAPPDF(bap models.BeritaAcaraPemeriksaan, filePath string) error {
	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(20, 15, 20)
	pdf.SetAutoPageBreak(false, 0)
	pdf.AddPage()

	// Kop Surat (Header)
	logoPath := "../frontend/public/images/bku logo.png"
	if _, err := os.Stat(logoPath); err == nil {
		pdf.ImageOptions(logoPath, 20, 12, 18, 18, false, gofpdf.ImageOptions{ImageType: "PNG", ReadDpi: true}, 0, "")
	}

	// Yayasan & University Name
	pdf.SetFont("Helvetica", "B", 11)
	pdf.SetXY(42, 14)
	pdf.CellFormat(0, 5, "YAYASAN ADHI GUNA KENCANA", "", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "B", 15)
	pdf.SetX(42)
	pdf.CellFormat(0, 7, "UNIVERSITAS BHAKTI KENCANA", "", 1, "L", false, 0, "")

	// Contact Info
	pdf.SetFont("Helvetica", "", 9)
	pdf.SetXY(20, 13)
	pdf.CellFormat(0, 4.5, "Jl. Soekarno Hatta No 754 Bandung", "", 1, "R", false, 0, "")
	pdf.CellFormat(0, 4.5, "Telp: (022) 7830 760, (022) 7830 768", "", 1, "R", false, 0, "")
	pdf.CellFormat(0, 4.5, "Web: bku.ac.id | Email: contact@bku.ac.id", "", 1, "R", false, 0, "")

	// Horizontal double line
	pdf.SetLineWidth(0.8)
	pdf.Line(20, 33, 277, 33)
	pdf.SetLineWidth(0.3)
	pdf.Line(20, 34.5, 277, 34.5)

	// Title
	pdf.SetFont("Helvetica", "B", 13)
	pdf.SetXY(20, 39)
	pdf.CellFormat(0, 7, "BERITA ACARA PEMERIKSAAN KESEHATAN MAHASISWA", "", 1, "C", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.CellFormat(0, 5, fmt.Sprintf("Nomor: %04d/BAP-KES/%d", bap.ID, bap.TanggalPelaksanaan.Year()), "", 1, "C", false, 0, "")
	pdf.Ln(4)

	// Opening statement
	pdf.SetX(20)
	indDay := getIndonesianDay(bap.TanggalPelaksanaan)
	indMonth := getIndonesianMonth(bap.TanggalPelaksanaan)
	formattedDate := fmt.Sprintf("%s, %d %s %d", indDay, bap.TanggalPelaksanaan.Day(), indMonth, bap.TanggalPelaksanaan.Year())
	pdf.CellFormat(0, 5, fmt.Sprintf("Pada hari ini %s, telah dilaksanakan kegiatan pemeriksaan kesehatan mahasiswa dengan rincian sebagai berikut:", formattedDate), "", 1, "L", false, 0, "")
	pdf.Ln(3)

	// A. Informasi Kegiatan Section
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetX(20)
	pdf.CellFormat(0, 5, "A. INFORMASI KEGIATAN", "", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	
	pdf.SetX(25)
	pdf.CellFormat(40, 5, "Nama Kegiatan", "", 0, "L", false, 0, "")
	pdf.CellFormat(5, 5, ":", "", 0, "C", false, 0, "")
	pdf.CellFormat(0, 5, bap.NamaKegiatan, "", 1, "L", false, 0, "")

	pdf.SetX(25)
	pdf.CellFormat(40, 5, "Waktu Pelaksanaan", "", 0, "L", false, 0, "")
	pdf.CellFormat(5, 5, ":", "", 0, "C", false, 0, "")
	pdf.CellFormat(0, 5, fmt.Sprintf("%s - %s WIB", bap.WaktuMulai, bap.WaktuSelesai), "", 1, "L", false, 0, "")

	pdf.SetX(25)
	pdf.CellFormat(40, 5, "Tempat", "", 0, "L", false, 0, "")
	pdf.CellFormat(5, 5, ":", "", 0, "C", false, 0, "")
	pdf.CellFormat(0, 5, bap.Tempat, "", 1, "L", false, 0, "")
	pdf.Ln(4)

	// B. Statistik Pemeriksaan Section
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetX(20)
	pdf.CellFormat(0, 5, "B. REKAPITULASI HASIL PEMERIKSAAN", "", 1, "L", false, 0, "")
	pdf.Ln(2)

	// Statistics Table
	pdf.SetX(20)
	pdf.SetFont("Helvetica", "B", 9)
	pdf.SetFillColor(240, 240, 240)
	
	// Table Headers
	colWidths := []float64{45, 45, 49, 49, 49}
	headers := []string{"Total Target Peserta", "Total Mahasiswa Diperiksa", "Hasil: Layak", "Hasil: Dalam Pantauan", "Hasil: Tidak Layak"}
	for i, header := range headers {
		pdf.CellFormat(colWidths[i], 8, header, "1", 0, "C", true, 0, "")
	}
	pdf.Ln(8)

	// Table Data Row
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetX(20)
	data := []string{
		fmt.Sprintf("%d Orang", bap.JumlahPeserta),
		fmt.Sprintf("%d Orang", bap.JumlahDiperiksa),
		fmt.Sprintf("%d Orang", bap.TotalLayak),
		fmt.Sprintf("%d Orang", bap.TotalPantauan),
		fmt.Sprintf("%d Orang", bap.TotalTidakLayak),
	}
	for i, val := range data {
		pdf.CellFormat(colWidths[i], 8, val, "1", 0, "C", false, 0, "")
	}
	pdf.Ln(12)

	// Closing statement
	pdf.SetX(20)
	pdf.CellFormat(0, 5, "Demikian Berita Acara Pemeriksaan ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya.", "", 1, "L", false, 0, "")

	// Signature Area
	pdf.Ln(10)
	sigY := pdf.GetY()
	pdf.SetXY(195, sigY)
	pdf.SetFont("Helvetica", "", 10)
	pdf.CellFormat(60, 5, fmt.Sprintf("Bandung, %d %s %d", bap.TanggalPelaksanaan.Day(), indMonth, bap.TanggalPelaksanaan.Year()), "", 1, "C", false, 0, "")
	pdf.SetX(195)
	pdf.CellFormat(60, 5, "Tenaga Kesehatan / Tim Medis,", "", 1, "C", false, 0, "")
	
	pdf.SetXY(195, sigY + 22)
	pdf.CellFormat(60, 5, "(........................................)", "", 1, "C", false, 0, "")

	return pdf.OutputFileAndClose(filePath)
}

// ExportRujukanPDF - Generate Rujukan Medis PDF
func ExportRujukanPDF(c *fiber.Ctx) error {
	rujukanID := c.Params("id")

	var rujukan models.RujukanKesehatan
	if err := config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Fakultas").First(&rujukan, rujukanID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Rujukan tidak ditemukan")
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"message": "Rujukan PDF export - to be implemented with gofpdf",
		"data": fiber.Map{
			"mahasiswa": rujukan.Mahasiswa.Nama,
			"nim": rujukan.Mahasiswa.NIM,
			"prodi": rujukan.Mahasiswa.ProgramStudi.Nama,
			"faskes_tujuan": rujukan.FaskesTujuan,
			"alasan_rujukan": rujukan.AlasanRujukan,
			"diagnosis": rujukan.Diagnosis,
			"tanggal": time.Now().Format("02 January 2006"),
		},
	})
}

func BuildSuratPengantarPDF(claim models.PengajuanAsuransi, nomorSurat string) (string, error) {
	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(25, 45, 25)
	pdf.SetAutoPageBreak(false, 0)
	pdf.AliasNbPages("")

	pdf.SetHeaderFunc(func() {
		pdf.Image("assets/kop_rektorat_landscape.jpeg", 0, 0, 297, 210, false, "JPEG", 0, "")
	})

	pdf.AddPage()

	// Title
	pdf.SetFont("Helvetica", "B", 13)
	pdf.SetTextColor(15, 23, 42) // Slate 900
	pdf.CellFormat(0, 6, "SURAT PENGANTAR KLAIM ASURANSI", "", 1, "C", false, 0, "")
	pdf.SetFont("Helvetica", "", 9.5)
	pdf.SetTextColor(100, 116, 139) // Slate 500
	refNum := fmt.Sprintf("Nomor: %s", nomorSurat)
	pdf.CellFormat(0, 5, refNum, "", 1, "C", false, 0, "")
	pdf.Ln(4)

	// Content
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetTextColor(15, 23, 42)
	pdf.MultiCell(0, 5, "Yang bertanda tangan di bawah ini, Direktorat Kemahasiswaan Universitas Bhakti Kencana menerangkan bahwa mahasiswa berikut ini mengajukan klaim asuransi kesehatan:", "", "L", false)
	pdf.Ln(4)

	// Student Profile Table Grid (2 Columns)
	col1 := [][]string{
		{"Nama Mahasiswa", claim.Mahasiswa.Nama},
		{"NIM", claim.Mahasiswa.NIM},
		{"Program Studi", claim.Mahasiswa.ProgramStudi.Nama},
		{"Fakultas", claim.Mahasiswa.Fakultas.Nama},
	}

	col2 := [][]string{
		{"Jenis Provider", claim.JenisProvider},
		{"Tanggal Kejadian", claim.TanggalKejadian.Format("02 January 2006")},
		{"Fasilitas Kesehatan", claim.LokasiFaskes},
		{"Estimasi Biaya", fmt.Sprintf("Rp %.0f", claim.EstimasiBiaya)},
	}

	yStartTable := pdf.GetY()
	for i := 0; i < 4; i++ {
		// Draw Column 1
		pdf.SetXY(25, yStartTable + float64(i)*5)
		pdf.SetFont("Helvetica", "B", 9)
		pdf.CellFormat(35, 5, col1[i][0], "", 0, "L", false, 0, "")
		pdf.SetFont("Helvetica", "", 9)
		pdf.CellFormat(5, 5, ":", "", 0, "C", false, 0, "")
		pdf.CellFormat(80, 5, col1[i][1], "", 0, "L", false, 0, "")

		// Draw Column 2
		pdf.SetXY(150, yStartTable + float64(i)*5)
		pdf.SetFont("Helvetica", "B", 9)
		pdf.CellFormat(35, 5, col2[i][0], "", 0, "L", false, 0, "")
		pdf.SetFont("Helvetica", "", 9)
		pdf.CellFormat(5, 5, ":", "", 0, "C", false, 0, "")
		pdf.CellFormat(80, 5, col2[i][1], "", 0, "L", false, 0, "")
	}
	pdf.SetY(yStartTable + 20)
	pdf.Ln(4)

	pdf.SetFont("Helvetica", "B", 9.5)
	pdf.Cell(0, 5, "Deskripsi Kronologis Kejadian:")
	pdf.Ln(6)

	pdf.SetFont("Helvetica", "", 9)
	pdf.MultiCell(0, 4.5, claim.Deskripsi, "", "L", false)
	pdf.Ln(6)

	pdf.SetFont("Helvetica", "", 10)
	pdf.MultiCell(0, 5, "Demikian surat pengantar ini dibuat agar dapat dipergunakan sebagaimana mestinya untuk proses klaim ke provider asuransi yang bersangkutan.", "", "L", false)

	// Signature Block (Fixed at the bottom of Page 1)
	sigY := 142.0
	pdf.SetFont("Helvetica", "", 9)
	pdf.SetXY(180, sigY)
	pdf.Cell(0, 5, fmt.Sprintf("Bandung, %s", time.Now().Format("02 January 2006")))
	pdf.SetXY(180, sigY+5)
	pdf.Cell(0, 5, "Mengetahui,")
	pdf.SetXY(180, sigY+10)
	pdf.Cell(0, 5, "Direktur Kemahasiswaan BKU")

	// Signature space (increased to 30mm space)
	pdf.SetXY(180, sigY+40)
	pdf.SetFont("Helvetica", "BU", 9.5)
	pdf.Cell(0, 5, "Bagian Pelayanan Kesehatan BKU")

	dirPath := filepath.Dir("uploads/surat/" + nomorSurat + ".pdf")
	if err := os.MkdirAll(dirPath, 0755); err != nil {
		return "", err
	}

	filePath := "uploads/surat/" + nomorSurat + ".pdf"
	// Delete existing file first if it exists to overwrite cleanly
	_ = os.Remove(filePath)

	if err := pdf.OutputFileAndClose(filePath); err != nil {
		return "", err
	}

	return filePath, nil
}
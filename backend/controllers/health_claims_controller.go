package controllers

import (
	"fmt"
	"path/filepath"
	"siakad-backend/config"
	"siakad-backend/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
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
		// TK bisa lihat semua (for review)
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

	// Base query for kesehatan
	query := config.DB.Model(&models.Kesehatan{}).Where("tanggal >= ? AND tanggal <= ?", startDate, endDate+" 23:59:59")

	// For TK, filter by their own records
	if role == "tenaga_kesehatan" {
		var tk models.TenagaKesehatan
		if err := config.DB.Where("user_id = ?", userID).First(&tk).Error; err == nil {
			query = query.Where("tenaga_kes_id = ?", tk.ID)
		}
	}

	// Summary stats
	var stats struct {
		TotalDiperiksa int64 `json:"total_diperiksa"`
		Layak          int64 `json:"layak"`
		PerluPerhatian int64 `json:"perlu_perhatian"`
		TidakLayak     int64 `json:"tidak_layak"`
	}

	query.Count(&stats.TotalDiperiksa)
	config.DB.Model(&models.Kesehatan{}).Where("tanggal >= ? AND tanggal <= ? AND hasil = ?", startDate, endDate+" 23:59:59", "Layak Kegiatan").Count(&stats.Layak)
	config.DB.Model(&models.Kesehatan{}).Where("tanggal >= ? AND tanggal <= ? AND hasil = ?", startDate, endDate+" 23:59:59", "Perlu Perhatian").Count(&stats.PerluPerhatian)
	config.DB.Model(&models.Kesehatan{}).Where("tanggal >= ? AND tanggal <= ? AND hasil = ?", startDate, endDate+" 23:59:59", "Tidak Layak").Count(&stats.TidakLayak)

	// Records
	var records []models.Kesehatan
	config.DB.Preload("Mahasiswa.Fakultas").Preload("Mahasiswa.ProgramStudi").Preload("TenagaKes").
		Where("tanggal >= ? AND tanggal <= ?", startDate, endDate+" 23:59:59").
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

// ExportSuratPengantarPDF - Generate Surat Pengantar Klaim PDF
func ExportSuratPengantarPDF(c *fiber.Ctx) error {
	claimID := c.Params("id")

	var claim models.PengajuanAsuransi
	if err := config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Fakultas").First(&claim, claimID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Pengajuan tidak ditemukan")
	}

	// For now, return placeholder
	return c.JSON(fiber.Map{
		"status": "success",
		"message": "PDF export for claim " + claimID + " - to be implemented with gofpdf",
		"data": fiber.Map{
			"nomor_surat": "XX/Direktorat-LK/Klaim-Assurance/" + strconv.Itoa(time.Now().Year()),
			"tanggal":     time.Now().Format("02 January 2006"),
			"mahasiswa":  claim.Mahasiswa.Nama,
			"nim":         claim.Mahasiswa.NIM,
			"prodi":       claim.Mahasiswa.ProgramStudi.Nama,
			"jenis_provider": claim.JenisProvider,
			"deskripsi":   claim.Deskripsi,
		},
	})
}

// ExportBAPPDF - Generate BAP PDF
func ExportBAPPDF(c *fiber.Ctx) error {
	bapID := c.Params("id")

	var bap models.BeritaAcaraPemeriksaan
	if err := config.DB.First(&bap, bapID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "BAP tidak ditemukan")
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"message": "BAP PDF export - to be implemented with gofpdf",
		"data": fiber.Map{
			"nama_kegiatan": bap.NamaKegiatan,
			"tanggal":       bap.TanggalPelaksanaan.Format("02 January 2006"),
			"jumlah_peserta": bap.JumlahPeserta,
			"jumlah_diperiksa": bap.JumlahDiperiksa,
			"layak": bap.TotalLayak,
			"pantauan": bap.TotalPantauan,
			"tidak_layak": bap.TotalTidakLayak,
		},
	})
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
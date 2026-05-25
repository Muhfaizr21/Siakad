package psychologist

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"siakad-backend/config"
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
	"github.com/google/uuid"
)

// GetReferrals — list semua referral milik psikolog
func GetReferrals(c *fiber.Ctx) error {
	psikolog, err := currentPsikolog(c)
	if err != nil {
		return err
	}

	var referrals []models.PsikologReferral
	if err := config.DB.
		Preload("Mahasiswa").
		Preload("Booking").
		Where("psikolog_id = ?", psikolog.ID).
		Order("created_at desc").
		Find(&referrals).Error; err != nil {
		return err
	}

	items := make([]fiber.Map, 0, len(referrals))
	for _, r := range referrals {
		items = append(items, fiber.Map{
			"id":                r.ID,
			"mahasiswa_id":      r.MahasiswaID,
			"mahasiswa_name":    r.Mahasiswa.Nama,
			"tipe":              r.Tipe,
			"alasan":            r.Alasan,
			"status":            r.Status,
			"pihak_tujuan":      r.PihakTujuan,
			"email_tujuan":      r.EmailTujuan,
			"tanggal_dibuat":    r.TanggalDibuat,
			"tanggal_dikirim":   r.TanggalDikirim,
			"tanggal_diterima":  r.TanggalDiterima,
			"surat_rujukan_url": r.SuratRujiukanURL,
		})
	}
	return jsonOK(c, items)
}

// CreateReferral — psikolog buat referral baru
func CreateReferral(c *fiber.Ctx) error {
	psikolog, err := currentPsikolog(c)
	if err != nil {
		return err
	}

	var body struct {
		MahasiswaID uint   `json:"mahasiswa_id"`
		BookingID   *uint  `json:"booking_id"`
		Tipe        string `json:"tipe"`        // "Medis" atau "Akademik"
		Alasan      string `json:"alasan"`
		PihakTujuan string `json:"pihak_tujuan"`
		EmailTujuan string `json:"email_tujuan"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload tidak valid: " + err.Error())
	}

	// Validasi mahasiswa_id
	if body.MahasiswaID == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "mahasiswa_id harus diisi dan valid")
	}

	// Validasi tipe
	if body.Tipe != "Medis" && body.Tipe != "Akademik" {
		return fiber.NewError(fiber.StatusBadRequest, "Tipe harus 'Medis' atau 'Akademik'")
	}

	// Validasi alasan
	if body.Alasan == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Alasan tidak boleh kosong")
	}

	// Validasi pihak tujuan
	if body.PihakTujuan == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Pihak tujuan tidak boleh kosong")
	}

	// Validasi email tujuan
	if body.EmailTujuan == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Email tujuan tidak boleh kosong")
	}

	// Validasi mahasiswa
	var mahasiswa models.Mahasiswa
	if err := config.DB.Where("id = ?", body.MahasiswaID).First(&mahasiswa).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Mahasiswa tidak ditemukan")
	}

	// Handle file upload
	filePendukungURL := ""
	file, err := c.FormFile("file_pendukung")
	if err == nil && file != nil {
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".pdf" {
			return fiber.NewError(fiber.StatusBadRequest, "File harus PDF")
		}
		if file.Size > 2*1024*1024 {
			return fiber.NewError(fiber.StatusBadRequest, "Ukuran file maksimal 2MB")
		}

		dir := "./uploads/referrals"
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("gagal membuat direktori upload: %w", err)
		}

		fileName := fmt.Sprintf("%d_%s.pdf", time.Now().UnixMilli(), uuid.New().String()[:8])
		savePath := filepath.Join(dir, fileName)

		src, err := file.Open()
		if err != nil {
			return err
		}
		defer src.Close()

		dst, err := os.Create(savePath)
		if err != nil {
			return err
		}
		defer dst.Close()
		if _, err := io.Copy(dst, src); err != nil {
			return err
		}

		filePendukungURL = "/uploads/referrals/" + fileName
	}

	// Generate surat rujukan (simplified - just create placeholder)
	suratRujiukanURL := generateReferralLetter(psikolog, mahasiswa, body.Tipe, body.Alasan)

	referral := models.PsikologReferral{
		PsikologID:       psikolog.ID,
		MahasiswaID:      body.MahasiswaID,
		BookingID:        body.BookingID,
		Tipe:             body.Tipe,
		Alasan:           body.Alasan,
		FilePendukungURL: filePendukungURL,
		SuratRujiukanURL: suratRujiukanURL,
		Status:           "Pending",
		PihakTujuan:      body.PihakTujuan,
		EmailTujuan:      body.EmailTujuan,
		TanggalDibuat:    time.Now(),
	}

	if err := config.DB.Create(&referral).Error; err != nil {
		return err
	}

	// Kirim notifikasi ke mahasiswa
	go func() {
		_ = notifikasi.Kirim(config.DB, notifikasi.KirimParams{
			MahasiswaID: body.MahasiswaID,
			Type:        "info",
			Title:       "Surat Rujukan Dibuat",
			Content: fmt.Sprintf(
				"Psikolog %s telah membuat surat rujukan %s untuk Anda. Silakan cek di aplikasi.",
				psikolog.Nama,
				body.Tipe,
			),
		})
	}()

	return jsonOK(c, fiber.Map{
		"id":                referral.ID,
		"status":            referral.Status,
		"surat_rujukan_url": referral.SuratRujiukanURL,
		"tanggal_dibuat":    referral.TanggalDibuat,
	})
}

// SendReferral — psikolog kirim referral ke pihak tujuan
func SendReferral(c *fiber.Ctx) error {
	psikolog, err := currentPsikolog(c)
	if err != nil {
		return err
	}

	referralID := c.Params("id")
	var referral models.PsikologReferral
	if err := config.DB.Where("id = ? AND psikolog_id = ?", referralID, psikolog.ID).First(&referral).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Referral tidak ditemukan")
	}

	if referral.Status != "Pending" {
		return fiber.NewError(fiber.StatusBadRequest, "Referral sudah dikirim sebelumnya")
	}

	// Update status
	now := time.Now()
	if err := config.DB.Model(&referral).Updates(map[string]any{
		"status":           "Sent",
		"tanggal_dikirim":  now,
	}).Error; err != nil {
		return err
	}

	// TODO: Send email to pihak_tujuan dengan surat rujukan

	return jsonOK(c, fiber.Map{
		"id":              referral.ID,
		"status":          "Sent",
		"tanggal_dikirim": now,
	})
}

// ConfirmReferralReceived — pihak tujuan confirm terima referral
func ConfirmReferralReceived(c *fiber.Ctx) error {
	referralID := c.Params("id")
	var referral models.PsikologReferral
	if err := config.DB.Where("id = ?", referralID).First(&referral).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Referral tidak ditemukan")
	}

	if referral.Status != "Sent" {
		return fiber.NewError(fiber.StatusBadRequest, "Referral belum dikirim")
	}

	now := time.Now()
	if err := config.DB.Model(&referral).Updates(map[string]any{
		"status":            "Received",
		"tanggal_diterima":  now,
	}).Error; err != nil {
		return err
	}

	// Kirim notifikasi ke psikolog
	go func() {
		_ = notifikasi.Kirim(config.DB, notifikasi.KirimParams{
			UserID: referral.Psikolog.UserID,
			Type:       "info",
			Title:      "Surat Rujukan Diterima",
			Content: fmt.Sprintf(
				"Surat rujukan untuk %s telah diterima oleh %s.",
				referral.Mahasiswa.Nama,
				referral.PihakTujuan,
			),
		})
	}()

	return jsonOK(c, fiber.Map{
		"id":               referral.ID,
		"status":           "Received",
		"tanggal_diterima": now,
	})
}

// DownloadReferralPDF — download surat rujukan PDF
func DownloadReferralPDF(c *fiber.Ctx) error {
	psikolog, err := currentPsikolog(c)
	if err != nil {
		return err
	}

	referralID := c.Params("id")
	var referral models.PsikologReferral
	if err := config.DB.Where("id = ? AND psikolog_id = ?", referralID, psikolog.ID).First(&referral).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Referral tidak ditemukan")
	}

	if referral.SuratRujiukanURL == "" {
		return fiber.NewError(fiber.StatusNotFound, "File surat rujukan tidak tersedia")
	}

	// Extract filename from URL
	filePath := "." + referral.SuratRujiukanURL
	
	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return fiber.NewError(fiber.StatusNotFound, "File tidak ditemukan")
	}

	// Set response headers
	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"surat_rujukan_%s.pdf\"", referral.Mahasiswa.Nama))

	return c.SendFile(filePath)
}

// ─── Helper ───────────────────────────────────────────────────────────────────

func generateReferralLetter(psikolog models.Psikolog, mahasiswa models.Mahasiswa, tipe, alasan string) string {
	// Generate actual PDF file for referral letter
	_, fileName, err := buildReferralLetterPDF(psikolog, mahasiswa, tipe, alasan)
	if err != nil {
		// Fallback to placeholder if PDF generation fails
		return fmt.Sprintf("/uploads/referrals/referral_%d_%d_%s.pdf", psikolog.ID, mahasiswa.ID, time.Now().Format("20060102150405"))
	}
	return "/uploads/referrals/" + fileName
}

func buildReferralLetterPDF(psikolog models.Psikolog, mahasiswa models.Mahasiswa, tipe, alasan string) (string, string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(20, 20, 20)
	pdf.AliasNbPages("")

	// Header
	pdf.SetHeaderFunc(func() {
		pdf.SetFillColor(0, 35, 111) // Primary color
		pdf.Rect(0, 0, 210, 5, "F")
	})

	// Footer
	pdf.SetFooterFunc(func() {
		pdf.SetY(-20)
		pdf.SetFont("Helvetica", "I", 8)
		pdf.SetTextColor(148, 163, 184)
		pdf.CellFormat(170, 6, "Dokumen Rahasia BKU Care - Surat Rujukan", "", 0, "L", false, 0, "")
		pdf.SetX(-40)
		pdf.CellFormat(20, 6, fmt.Sprintf("Halaman %d dari {nb}", pdf.PageNo()), "", 0, "R", false, 0, "")
	})

	pdf.AddPage()

	// ── Header Banner ────────────────────────────────────────────────────────
	pdf.SetFillColor(0, 35, 111)
	pdf.Rect(20, 15, 170, 25, "F")

	pdf.SetTextColor(255, 255, 255)
	pdf.SetFont("Helvetica", "B", 14)
	pdf.SetXY(25, 19)
	pdf.Cell(160, 6, "SURAT RUJUKAN")

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetXY(25, 26)
	pdf.Cell(160, 5, fmt.Sprintf("BKU Care • Rujukan %s", tipe))
	
	pdf.SetXY(25, 31)
	pdf.Cell(160, 5, fmt.Sprintf("Dibuat pada: %s", time.Now().Format("02 January 2006 15:04")))

	// ── Referral Details ─────────────────────────────────────────────────────
	pdf.SetTextColor(15, 23, 42)
	pdf.SetXY(20, 48)
	pdf.SetFont("Helvetica", "B", 11)
	pdf.Cell(170, 6, "DETAIL RUJUKAN")
	pdf.Ln(8)

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetFillColor(248, 250, 252)
	pdf.Rect(20, pdf.GetY(), 170, 40, "F")

	infoY := pdf.GetY() + 3
	pdf.SetXY(24, infoY)
	pdf.Cell(80, 5, fmt.Sprintf("Nama Pasien: %s", mahasiswa.Nama))
	pdf.SetXY(110, infoY)
	pdf.Cell(80, 5, fmt.Sprintf("NIM: %s", mahasiswa.NIM))

	pdf.SetXY(24, infoY+6)
	pdf.Cell(80, 5, fmt.Sprintf("Tipe Rujukan: %s", tipe))
	pdf.SetXY(110, infoY+6)
	pdf.Cell(80, 5, fmt.Sprintf("Tanggal: %s", time.Now().Format("02 Jan 2006")))

	pdf.SetXY(24, infoY+12)
	pdf.Cell(170, 5, fmt.Sprintf("Psikolog: %s", psikolog.Nama))

	pdf.SetXY(24, infoY+18)
	pdf.Cell(170, 5, fmt.Sprintf("Spesialisasi: %s", psikolog.Spesialisasi))

	pdf.SetXY(24, infoY+24)
	pdf.Cell(170, 5, fmt.Sprintf("Email Psikolog: %s", psikolog.Email))

	pdf.SetY(pdf.GetY() + 45)

	// ── Alasan Rujukan ───────────────────────────────────────────────────────
	pdf.SetFont("Helvetica", "B", 11)
	pdf.Cell(170, 6, "ALASAN RUJUKAN")
	pdf.Ln(8)

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetFillColor(248, 250, 252)
	pdf.Rect(20, pdf.GetY(), 170, 30, "F")
	pdf.SetXY(24, pdf.GetY()+3)
	pdf.Cell(162, 5, alasan)

	pdf.SetY(pdf.GetY() + 5)

	// ── Signature Section ────────────────────────────────────────────────────
	pdf.Ln(8)
	sigY := pdf.GetY()
	
	pdf.SetFont("Helvetica", "", 9.5)
	pdf.SetXY(20, sigY)
	pdf.Cell(80, 5, "Disetujui & Ditandatangani,")
	
	pdf.Ln(20)
	
	currentY := pdf.GetY()
	pdf.SetDrawColor(148, 163, 184)
	pdf.Line(20, currentY, 85, currentY)
	
	pdf.SetFont("Helvetica", "B", 9.5)
	pdf.SetXY(20, currentY+2)
	pdf.Cell(70, 5, psikolog.Nama)
	
	pdf.SetFont("Helvetica", "", 8.5)
	pdf.SetTextColor(100, 116, 139)
	pdf.SetXY(20, currentY+7)
	pdf.Cell(70, 5, fmt.Sprintf("Spesialisasi: %s", psikolog.Spesialisasi))
	pdf.SetXY(20, currentY+11)
	pdf.Cell(70, 5, fmt.Sprintf("Email: %s", psikolog.Email))

	// Save file
	uploadsDir := "uploads/referrals"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return "", "", err
	}

	fileName := fmt.Sprintf("referral_%d_%d_%s.pdf", psikolog.ID, mahasiswa.ID, time.Now().Format("20060102150405"))
	filePath := filepath.Join(uploadsDir, fileName)

	if err := pdf.OutputFileAndClose(filePath); err != nil {
		return "", "", err
	}

	return filePath, fileName, nil
}

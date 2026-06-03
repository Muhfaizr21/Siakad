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
	if err := config.DB.Preload("Fakultas").Preload("ProgramStudi").Where("id = ?", body.MahasiswaID).First(&mahasiswa).Error; err != nil {
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

	// Generate surat rujukan
	suratRujiukanURL := generateReferralLetter(psikolog, mahasiswa, body.Tipe, body.Alasan, body.PihakTujuan, body.EmailTujuan)

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
	if err := config.DB.
		Preload("Mahasiswa").
		Preload("Mahasiswa.Fakultas").
		Preload("Mahasiswa.ProgramStudi").
		Preload("Psikolog").
		Where("id = ? AND psikolog_id = ?", referralID, psikolog.ID).
		First(&referral).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Referral tidak ditemukan")
	}

	// Build file path from URL stored in DB
	filePath := "." + referral.SuratRujiukanURL

	// If file doesn't exist on disk (e.g. old data), regenerate it
	if referral.SuratRujiukanURL == "" || func() bool { _, e := os.Stat(filePath); return os.IsNotExist(e) }() {
		newPath, newFile, err := buildReferralLetterPDF(
			referral.Psikolog, referral.Mahasiswa,
			referral.Tipe, referral.Alasan,
			referral.PihakTujuan, referral.EmailTujuan,
		)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Gagal generate PDF: "+err.Error())
		}
		newURL := "/uploads/referrals/" + newFile
		config.DB.Model(&referral).Update("surat_rujiukan_url", newURL)
		filePath = newPath
	}

	// Set response headers
	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"surat_rujukan_%s.pdf\"", referral.Mahasiswa.Nama))

	return c.SendFile(filePath)
}

// ─── Helper ───────────────────────────────────────────────────────────────────

func generateReferralLetter(psikolog models.Psikolog, mahasiswa models.Mahasiswa, tipe, alasan, pihakTujuan, emailTujuan string) string {
	// Generate actual PDF file for referral letter
	_, fileName, err := buildReferralLetterPDF(psikolog, mahasiswa, tipe, alasan, pihakTujuan, emailTujuan)
	if err != nil {
		// Fallback to placeholder if PDF generation fails
		return fmt.Sprintf("/uploads/referrals/referral_%d_%d_%s.pdf", psikolog.ID, mahasiswa.ID, time.Now().Format("20060102150405"))
	}
	return "/uploads/referrals/" + fileName
}

func buildReferralLetterPDF(psikolog models.Psikolog, mahasiswa models.Mahasiswa, tipe, alasan, pihakTujuan, emailTujuan string) (string, string, error) {
	// A4 Landscape: width 297mm, height 210mm
	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(25, 45, 25) // Left 25mm, Top 45mm to leave space for Kop Rektorat header
	pdf.SetAutoPageBreak(true, 25)
	pdf.AliasNbPages("")

	// Background Kop Surat
	pdf.SetHeaderFunc(func() {
		// Draw full-page landscape letterhead image
		pdf.Image("assets/kop_rektorat_landscape.jpeg", 0, 0, 297, 210, false, "JPEG", 0, "")
	})

	pdf.AddPage()

	// ── Title ────────────────────────────────────────────────────────────────
	pdf.SetFont("Helvetica", "B", 13)
	pdf.SetTextColor(15, 23, 42) // Slate 900
	pdf.CellFormat(0, 6, "SURAT RUJUKAN KONSELING (REFERRAL LETTER)", "", 1, "C", false, 0, "")
	pdf.SetFont("Helvetica", "", 9.5)
	pdf.SetTextColor(100, 116, 139) // Slate 500
	refNum := fmt.Sprintf("Nomor: Ref/BKU-Care/%s/%05d", time.Now().Format("2006/01"), time.Now().UnixMilli()%100000)
	pdf.CellFormat(0, 5, refNum, "", 1, "C", false, 0, "")
	pdf.Ln(5)

	// ── Student & Referral Details Grid ──────────────────────────────────────
	pdf.SetFont("Helvetica", "B", 9.5)
	pdf.SetTextColor(15, 23, 42)
	pdf.Cell(0, 5, "I. IDENTITAS MAHASISWA & TUJUAN RUJUKAN")
	pdf.Ln(6)

	pdf.SetFont("Helvetica", "", 9)
	details := [][]string{
		{"Nama Mahasiswa", mahasiswa.Nama},
		{"NIM", mahasiswa.NIM},
		{"Program Studi", mahasiswa.ProgramStudi.Nama},
		{"Fakultas", mahasiswa.Fakultas.Nama},
		{"Tipe Rujukan", tipe},
		{"Pihak / Instansi Tujuan", pihakTujuan},
		{"Email Tujuan", emailTujuan},
	}

	for _, d := range details {
		pdf.SetFont("Helvetica", "B", 9)
		pdf.CellFormat(50, 5, d[0], "", 0, "L", false, 0, "")
		pdf.SetFont("Helvetica", "", 9)
		pdf.CellFormat(5, 5, ":", "", 0, "C", false, 0, "")
		pdf.CellFormat(0, 5, d[1], "", 1, "L", false, 0, "")
	}
	pdf.Ln(6)

	// ── Fetch and Render Counseling History ──────────────────────────────────
	pdf.SetFont("Helvetica", "B", 9.5)
	pdf.Cell(0, 5, "II. RIWAYAT KONSELING DI BKU CARE (COUNSELING HISTORY)")
	pdf.Ln(6)

	var sessions []models.PsikologSessionNote
	if err := config.DB.Preload("Psikolog").Where("mahasiswa_id = ?", mahasiswa.ID).Order("tanggal asc").Find(&sessions).Error; err != nil {
		// Log error if any, but continue
	}

	if len(sessions) == 0 {
		pdf.SetFont("Helvetica", "I", 9)
		pdf.SetTextColor(100, 116, 139)
		pdf.Cell(0, 5, "Tidak ada riwayat sesi konseling sebelumnya yang tercatat di sistem.")
		pdf.Ln(6)
	} else {
		// Total width: 247mm
		// Cols: No (10mm), Tanggal (35mm), Psikolog (50mm), Keluhan (72mm), Rekomendasi (80mm)
		pdf.SetFont("Helvetica", "B", 8.5)
		pdf.SetFillColor(241, 245, 249) // Slate 100
		pdf.SetTextColor(51, 65, 85)   // Slate 700
		
		pdf.CellFormat(10, 6, "No", "1", 0, "C", true, 0, "")
		pdf.CellFormat(35, 6, "Tanggal Sesi", "1", 0, "C", true, 0, "")
		pdf.CellFormat(50, 6, "Psikolog / Konselor", "1", 0, "C", true, 0, "")
		pdf.CellFormat(72, 6, "Keluhan / Kondisi Awal", "1", 0, "C", true, 0, "")
		pdf.CellFormat(80, 6, "Rekomendasi / Tindakan", "1", 1, "C", true, 0, "")

		pdf.SetFont("Helvetica", "", 8.5)
		pdf.SetTextColor(15, 23, 42)
		
		for idx, s := range sessions {
			noStr := fmt.Sprintf("%d", idx+1)
			tglStr := s.Tanggal.Format("02 Jan 2006")
			psikologNama := s.Psikolog.Nama
			if psikologNama == "" {
				psikologNama = "Psikolog BKU"
			}

			keluhanLines := pdf.SplitLines([]byte(s.Keluhan), 72)
			rekomLines := pdf.SplitLines([]byte(s.Rekomendasi), 80)
			
			maxLines := len(keluhanLines)
			if len(rekomLines) > maxLines {
				maxLines = len(rekomLines)
			}
			if maxLines < 1 {
				maxLines = 1
			}
			rowHeight := float64(maxLines) * 4.5
			if rowHeight < 6 {
				rowHeight = 6
			}

			// Page break validation before drawing row
			if pdf.GetY() + rowHeight > 180 {
				pdf.AddPage()
				// Re-draw headers on new page
				pdf.SetFont("Helvetica", "B", 8.5)
				pdf.SetFillColor(241, 245, 249)
				pdf.SetTextColor(51, 65, 85)
				pdf.CellFormat(10, 6, "No", "1", 0, "C", true, 0, "")
				pdf.CellFormat(35, 6, "Tanggal Sesi", "1", 0, "C", true, 0, "")
				pdf.CellFormat(50, 6, "Psikolog / Konselor", "1", 0, "C", true, 0, "")
				pdf.CellFormat(72, 6, "Keluhan / Kondisi Awal", "1", 0, "C", true, 0, "")
				pdf.CellFormat(80, 6, "Rekomendasi / Tindakan", "1", 1, "C", true, 0, "")
				pdf.SetFont("Helvetica", "", 8.5)
				pdf.SetTextColor(15, 23, 42)
			}

			curX := pdf.GetX()
			curY := pdf.GetY()
			
			pdf.Rect(curX, curY, 247, rowHeight, "D")
			pdf.CellFormat(10, rowHeight, noStr, "R", 0, "C", false, 0, "")
			pdf.CellFormat(35, rowHeight, tglStr, "R", 0, "C", false, 0, "")
			pdf.CellFormat(50, rowHeight, psikologNama, "R", 0, "L", false, 0, "")
			
			// MultiCell for Keluhan
			pdf.SetXY(curX + 95, curY + 1)
			pdf.MultiCell(72, 4, s.Keluhan, "", "L", false)
			
			// MultiCell for Rekomendasi
			pdf.SetXY(curX + 167, curY + 1)
			pdf.MultiCell(80, 4, s.Rekomendasi, "", "L", false)
			
			// Reset cursor
			pdf.SetXY(curX, curY + rowHeight)
		}
		pdf.Ln(4)
	}
	pdf.SetTextColor(15, 23, 42)
	pdf.Ln(2)

	// ── Alasan Rujukan / Catatan ──────────────────────────────────────────────
	pdf.SetFont("Helvetica", "B", 9.5)
	pdf.Cell(0, 5, "III. PERNYATAAN RUJUKAN & CATATAN KLINIS")
	pdf.Ln(6)

	pdf.SetFont("Helvetica", "", 9)
	alasanLines := pdf.SplitLines([]byte(alasan), 247)
	alasanHeight := float64(len(alasanLines)) * 4.5
	if pdf.GetY() + alasanHeight > 180 {
		pdf.AddPage()
	}
	pdf.MultiCell(247, 4.5, alasan, "", "L", false)
	pdf.Ln(6)

	// ── Signature Block ──────────────────────────────────────────────────────
	if pdf.GetY() + 35 > 180 {
		pdf.AddPage()
	}

	sigY := pdf.GetY()
	pdf.SetFont("Helvetica", "", 9)
	
	// Bandung, [Date] placed on the right column
	pdf.SetXY(180, sigY)
	dateStr := fmt.Sprintf("Bandung, %s", time.Now().Format("02 January 2006"))
	pdf.Cell(0, 5, dateStr)
	
	pdf.SetXY(180, sigY + 5)
	pdf.Cell(0, 5, "Psikolog Perujuk,")
	
	// Signature space
	pdf.SetXY(180, sigY + 23)
	pdf.SetFont("Helvetica", "BU", 9.5) // Underlined
	pdf.Cell(0, 5, psikolog.Nama)
	
	pdf.SetXY(180, sigY + 28)
	pdf.SetFont("Helvetica", "", 8)
	pdf.SetTextColor(100, 116, 139)
	pdf.Cell(0, 4, "BKU Care Center")
	
	pdf.SetXY(180, sigY + 32)
	pdf.Cell(0, 4, fmt.Sprintf("Spesialisasi: %s", psikolog.Spesialisasi))

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

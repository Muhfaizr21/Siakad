package psychologist

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/jung-kurt/gofpdf"
)

// GenerateClinicalReport membuat PDF laporan klinis (clinical report)
func GenerateClinicalReport(psikolog models.Psikolog, startDate, endDate time.Time) (string, string, error) {
	// Ambil semua session notes dalam periode
	var sessionNotes []models.PsikologSessionNote
	if err := config.DB.
		Preload("Mahasiswa").
		Where("psikolog_id = ? AND tanggal BETWEEN ? AND ?", psikolog.ID, startDate, endDate).
		Order("tanggal desc").
		Find(&sessionNotes).Error; err != nil {
		return "", "", err
	}

	// Hitung statistik
	stats := map[string]int{
		"total":      len(sessionNotes),
		"low":        0,
		"medium":     0,
		"high":       0,
		"flagged":    0,
	}

	moodStats := map[string]int{}

	for _, note := range sessionNotes {
		// Count flagged cases (Perlu Perhatian or Mendesak)
		if note.StatusPasien == "Perlu Perhatian" || note.StatusPasien == "Mendesak" {
			stats["flagged"]++
		}
		if note.Mood != "" {
			moodStats[note.Mood]++
		}
	}

	// Generate PDF
	filePath, fileName, err := buildClinicalPDF(psikolog, sessionNotes, stats, moodStats, startDate, endDate)
	if err != nil {
		return "", "", err
	}
	return filePath, fileName, nil
}

func buildClinicalPDF(psikolog models.Psikolog, sessionNotes []models.PsikologSessionNote, stats map[string]int, moodStats map[string]int, startDate, endDate time.Time) (string, string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(20, 20, 20)
	pdf.AliasNbPages("")

	// Define Header and Footer
	pdf.SetHeaderFunc(func() {
		// Draw thin primary line at top
		pdf.SetFillColor(0, 35, 111) // Primary color #00236f
		pdf.Rect(0, 0, 210, 5, "F")
	})

	pdf.SetFooterFunc(func() {
		pdf.SetY(-20)
		pdf.SetFont("Helvetica", "I", 8)
		pdf.SetTextColor(148, 163, 184) // Slate 400
		pdf.CellFormat(170, 6, "Dokumen Rahasia BKU Care - Laporan Klinis Konseling", "", 0, "L", false, 0, "")
		
		// Page number on the right
		pdf.SetX(-40)
		pdf.CellFormat(20, 6, fmt.Sprintf("Halaman %d dari {nb}", pdf.PageNo()), "", 0, "R", false, 0, "")
	})

	pdf.AddPage()

	// ── Corporate Header Banner ────────────────────────────────────────────────
	pdf.SetFillColor(0, 35, 111) // Primary color
	pdf.Rect(20, 15, 170, 25, "F")

	pdf.SetTextColor(255, 255, 255)
	pdf.SetFont("Helvetica", "B", 14)
	pdf.SetXY(25, 19)
	pdf.Cell(160, 6, "LAPORAN KLINIS KONSELING")

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetXY(25, 26)
	pdf.Cell(160, 5, "BKU Care • Laporan Analisis Klinis & Risiko Kesehatan Mental")
	
	pdf.SetXY(25, 31)
	pdf.Cell(160, 5, fmt.Sprintf("Dibuat pada: %s", time.Now().Format("02 January 2006 15:04")))

	// ── Info Psikolog ────────────────────────────────────────────────────────
	pdf.SetTextColor(15, 23, 42) // Slate 900
	pdf.SetXY(20, 48)
	pdf.SetFont("Helvetica", "B", 11)
	pdf.Cell(170, 6, "PROFIL PSIKOLOG")
	pdf.Ln(8)

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetFillColor(248, 250, 252) // Slate 50
	pdf.Rect(20, pdf.GetY(), 170, 24, "F")

	infoY := pdf.GetY() + 3
	pdf.SetXY(24, infoY)
	pdf.Cell(80, 5, fmt.Sprintf("Nama: %s", psikolog.Nama))
	pdf.SetXY(110, infoY)
	pdf.Cell(80, 5, fmt.Sprintf("Spesialisasi: %s", psikolog.Spesialisasi))

	pdf.SetXY(24, infoY+6)
	pdf.Cell(80, 5, fmt.Sprintf("Email: %s", psikolog.Email))
	pdf.SetXY(110, infoY+6)
	pdf.Cell(80, 5, fmt.Sprintf("Lokasi: %s", psikolog.Lokasi))

	pdf.SetXY(24, infoY+12)
	pdf.Cell(170, 5, fmt.Sprintf("Periode Laporan: %s s/d %s",
		startDate.Format("02 Jan 2006"), endDate.Format("02 Jan 2006")))

	pdf.SetY(pdf.GetY() + 30)

	// ── Ringkasan Statistik Klinis ──────────────────────────────────────────
	pdf.SetFont("Helvetica", "B", 11)
	pdf.Cell(170, 6, "RINGKASAN STATISTIK KLINIS")
	pdf.Ln(8)

	// Stats cards configuration
	statsData := []struct {
		label string
		value string
		color [3]int
	}{
		{"Total Sesi", fmt.Sprintf("%d Sesi", stats["total"]), [3]int{15, 23, 42}},      // Slate 900
		{"Sesi Aktif", fmt.Sprintf("%d Sesi", stats["total"] - stats["flagged"]), [3]int{16, 185, 129}}, // Emerald 500
		{"Perlu Perhatian", fmt.Sprintf("%d Kasus", stats["flagged"]), [3]int{217, 119, 6}}, // Amber 600
		{"Selesai", fmt.Sprintf("%d Sesi", stats["total"]), [3]int{0, 35, 111}}, // Primary
	}

	boxY := pdf.GetY()
	for i, stat := range statsData {
		x := 20 + float64(i)*43
		// Draw statistical card
		pdf.SetFillColor(255, 255, 255)
		pdf.Rect(x, boxY, 39, 20, "F")
		
		// Colored top accent border
		pdf.SetFillColor(stat.color[0], stat.color[1], stat.color[2])
		pdf.Rect(x, boxY, 39, 2, "F")
		
		// Thin gray borders around the card
		pdf.SetDrawColor(226, 232, 240) // Slate 200
		pdf.Rect(x, boxY, 39, 20, "D")

		pdf.SetTextColor(stat.color[0], stat.color[1], stat.color[2])
		pdf.SetFont("Helvetica", "B", 12)
		pdf.SetXY(x, boxY+4)
		pdf.CellFormat(39, 6, stat.value, "", 0, "C", false, 0, "")
		
		pdf.SetTextColor(71, 85, 105) // Slate 600
		pdf.SetFont("Helvetica", "", 7.5)
		pdf.SetXY(x, boxY+11)
		pdf.CellFormat(39, 5, stat.label, "", 0, "C", false, 0, "")
	}

	pdf.SetTextColor(15, 23, 42) // Reset text color
	pdf.SetY(boxY + 28)

	// ── Distribusi Mood ──────────────────────────────────────────────────────
	if len(moodStats) > 0 {
		pdf.SetFont("Helvetica", "B", 11)
		pdf.Cell(170, 6, "DISTRIBUSI MOOD PASIEN")
		pdf.Ln(8)

		pdf.SetFont("Helvetica", "B", 9)
		pdf.SetFillColor(0, 35, 111) // Primary
		pdf.SetTextColor(255, 255, 255)
		pdf.SetDrawColor(226, 232, 240)
		
		pdf.CellFormat(100, 7, " Mood", "1", 0, "L", true, 0, "")
		pdf.CellFormat(35, 7, "Jumlah", "1", 0, "C", true, 0, "")
		pdf.CellFormat(35, 7, "Persentase", "1", 1, "C", true, 0, "")

		pdf.SetFont("Helvetica", "", 8.5)
		pdf.SetTextColor(15, 23, 42)
		total := stats["total"]
		row := 0
		for mood, count := range moodStats {
			if row%2 == 0 {
				pdf.SetFillColor(248, 250, 252) // Slate 50
			} else {
				pdf.SetFillColor(255, 255, 255)
			}
			pct := 0.0
			if total > 0 {
				pct = float64(count) / float64(total) * 100
			}
			pdf.CellFormat(100, 6, "  "+mood, "1", 0, "L", true, 0, "")
			pdf.CellFormat(35, 6, fmt.Sprintf("%d", count), "1", 0, "C", true, 0, "")
			pdf.CellFormat(35, 6, fmt.Sprintf("%.1f%%", pct), "1", 1, "C", true, 0, "")
			row++
		}
		pdf.Ln(8)
	}

	// ── Daftar Sesi Klinis Detail ────────────────────────────────────────────
	if len(sessionNotes) > 0 {
		if pdf.GetY() > 220 {
			pdf.AddPage()
		}

		pdf.SetFont("Helvetica", "B", 11)
		pdf.Cell(170, 6, "DAFTAR SESI KLINIS DETAIL")
		pdf.Ln(8)

		pdf.SetFont("Helvetica", "B", 8)
		pdf.SetFillColor(0, 35, 111)
		pdf.SetTextColor(255, 255, 255)
		pdf.SetDrawColor(226, 232, 240)
		
		pdf.CellFormat(20, 7, "No", "1", 0, "C", true, 0, "")
		pdf.CellFormat(28, 7, "Tanggal", "1", 0, "C", true, 0, "")
		pdf.CellFormat(35, 7, " Mahasiswa", "1", 0, "L", true, 0, "")
		pdf.CellFormat(25, 7, "Mood", "1", 0, "C", true, 0, "")
		pdf.CellFormat(25, 7, "Jenis", "1", 0, "C", true, 0, "")
		pdf.CellFormat(37, 7, "Status", "1", 1, "C", true, 0, "")

		pdf.SetFont("Helvetica", "", 7.5)
		pdf.SetTextColor(15, 23, 42)
		for i, note := range sessionNotes {
			if pdf.GetY() > 270 {
				pdf.AddPage()
				// Re-print header
				pdf.SetFont("Helvetica", "B", 8)
				pdf.SetFillColor(0, 35, 111)
				pdf.SetTextColor(255, 255, 255)
				pdf.SetDrawColor(226, 232, 240)
				pdf.CellFormat(20, 7, "No", "1", 0, "C", true, 0, "")
				pdf.CellFormat(28, 7, "Tanggal", "1", 0, "C", true, 0, "")
				pdf.CellFormat(35, 7, " Mahasiswa", "1", 0, "L", true, 0, "")
				pdf.CellFormat(25, 7, "Mood", "1", 0, "C", true, 0, "")
				pdf.CellFormat(25, 7, "Jenis", "1", 0, "C", true, 0, "")
				pdf.CellFormat(37, 7, "Status", "1", 1, "C", true, 0, "")
				pdf.SetFont("Helvetica", "", 7.5)
				pdf.SetTextColor(15, 23, 42)
			}
			if i%2 == 0 {
				pdf.SetFillColor(248, 250, 252)
			} else {
				pdf.SetFillColor(255, 255, 255)
			}
			nama := "-"
			if note.Mahasiswa.Nama != "" {
				nama = note.Mahasiswa.Nama
			}
			pdf.CellFormat(20, 6, fmt.Sprintf("%d", i+1), "1", 0, "C", true, 0, "")
			pdf.CellFormat(28, 6, note.Tanggal.Format("02/01/2006"), "1", 0, "C", true, 0, "")
			pdf.CellFormat(35, 6, " "+truncate(nama, 18), "1", 0, "L", true, 0, "")
			pdf.CellFormat(25, 6, truncate(note.Mood, 12), "1", 0, "C", true, 0, "")
			pdf.CellFormat(25, 6, truncate(note.JenisSesi, 12), "1", 0, "C", true, 0, "")
			pdf.CellFormat(37, 6, truncate(note.StatusPasien, 18), "1", 1, "C", true, 0, "")
		}
		pdf.Ln(8)
	}

	// ── Catatan Penting ──────────────────────────────────────────────────────
	if stats["flagged"] > 0 {
		if pdf.GetY() > 220 {
			pdf.AddPage()
		}

		pdf.SetFont("Helvetica", "B", 11)
		pdf.SetTextColor(239, 68, 68) // Red 500
		pdf.Cell(170, 6, fmt.Sprintf("⚠ CATATAN PENTING: %d Kasus Memerlukan Perhatian Khusus", stats["flagged"]))
		pdf.SetTextColor(15, 23, 42)
		pdf.Ln(8)

		pdf.SetFont("Helvetica", "", 9)
		pdf.SetFillColor(254, 242, 242) // Red 50
		pdf.Rect(20, pdf.GetY(), 170, 15, "F")
		pdf.SetXY(24, pdf.GetY()+2)
		pdf.Cell(162, 4, "Terdapat kasus yang memerlukan perhatian khusus atau penanganan mendesak. Psikolog direkomendasikan untuk melakukan follow-up dan eskalasi jika diperlukan.")
		pdf.Ln(2)
	}

	// ── Signature Section ──────────────────────────────────────────────────────
	if pdf.GetY() > 220 {
		pdf.AddPage()
	}
	
	pdf.Ln(8)
	sigY := pdf.GetY()
	
	pdf.SetFont("Helvetica", "", 9.5)
	pdf.SetXY(20, sigY)
	pdf.Cell(80, 5, "Disetujui & Diverifikasi,")
	
	pdf.SetXY(120, sigY)
	pdf.Cell(70, 5, "Psikolog Penanggung Jawab,")
	
	pdf.Ln(20) // spacing for signature
	
	currentY := pdf.GetY()
	pdf.SetDrawColor(148, 163, 184)
	pdf.Line(120, currentY, 185, currentY) // signature line
	
	pdf.SetFont("Helvetica", "B", 9.5)
	pdf.SetXY(120, currentY+2)
	pdf.Cell(70, 5, psikolog.Nama)
	
	pdf.SetFont("Helvetica", "", 8.5)
	pdf.SetTextColor(100, 116, 139) // Slate 500
	pdf.SetXY(120, currentY+7)
	pdf.Cell(70, 5, fmt.Sprintf("Spesialisasi: %s", psikolog.Spesialisasi))
	pdf.SetXY(120, currentY+11)
	pdf.Cell(70, 5, fmt.Sprintf("Email: %s", psikolog.Email))

	// Simpan file
	uploadsDir := "uploads/reports/clinical"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return "", "", err
	}

	fileName := fmt.Sprintf("laporan_klinis_%s_%d.pdf",
		time.Now().Format("20060102_150405"),
		time.Now().Unix())
	filePath := filepath.Join(uploadsDir, fileName)

	if err := pdf.OutputFileAndClose(filePath); err != nil {
		return "", "", err
	}

	return filePath, fileName, nil
}

package psychologist

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/jung-kurt/gofpdf"
)

// ReportData berisi semua data yang dibutuhkan untuk generate laporan
type ReportData struct {
	Psikolog        models.Psikolog
	Periode         string
	TipeReport      string // "Bulanan" atau "Tahunan"
	TotalSesi       int64
	TotalPasien     int64
	SesiSelesai     int64
	SesiMenunggu    int64
	KasusMenudesak  int64
	SessionNotes    []models.PsikologSessionNote
	Bookings        []models.PsikologBooking
	TopIssues       map[string]int
}

// GenerateReport membuat PDF laporan dan menyimpannya ke disk
// Mengembalikan path file yang disimpan
func GenerateReport(psikolog models.Psikolog, tipe string, periode string) (string, string, error) {
	// Parse periode
	var startDate, endDate time.Time
	now := time.Now()

	if tipe == "Bulanan" {
		// Format: "2006-01" atau "January 2006"
		t, err := time.Parse("2006-01", periode)
		if err != nil {
			t, err = time.Parse("January 2006", periode)
			if err != nil {
				t = now
			}
		}
		startDate = time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, time.Local)
		endDate = startDate.AddDate(0, 1, 0).Add(-time.Second)
	} else {
		// Tahunan — format: "2006"
		t, err := time.Parse("2006", periode)
		if err != nil {
			t = now
		}
		startDate = time.Date(t.Year(), 1, 1, 0, 0, 0, 0, time.Local)
		endDate = time.Date(t.Year(), 12, 31, 23, 59, 59, 0, time.Local)
	}

	// Ambil data dari DB
	data := ReportData{
		Psikolog:   psikolog,
		Periode:    periode,
		TipeReport: tipe,
		TopIssues:  map[string]int{},
	}

	config.DB.Model(&models.PsikologSessionNote{}).
		Where("psikolog_id = ? AND tanggal BETWEEN ? AND ?", psikolog.ID, startDate, endDate).
		Count(&data.TotalSesi)

	config.DB.Model(&models.PsikologBooking{}).
		Where("psikolog_id = ? AND tanggal BETWEEN ? AND ?", psikolog.ID, startDate, endDate).
		Distinct("mahasiswa_id").Count(&data.TotalPasien)

	config.DB.Model(&models.PsikologBooking{}).
		Where("psikolog_id = ? AND tanggal BETWEEN ? AND ? AND status = ?", psikolog.ID, startDate, endDate, "Selesai").
		Count(&data.SesiSelesai)

	config.DB.Model(&models.PsikologBooking{}).
		Where("psikolog_id = ? AND tanggal BETWEEN ? AND ? AND status = ?", psikolog.ID, startDate, endDate, "Menunggu").
		Count(&data.SesiMenunggu)

	config.DB.Model(&models.PsikologSessionNote{}).
		Where("psikolog_id = ? AND tanggal BETWEEN ? AND ? AND status_pasien IN ?", psikolog.ID, startDate, endDate, []string{"Perlu Perhatian", "Mendesak"}).
		Count(&data.KasusMenudesak)

	config.DB.Preload("Mahasiswa").
		Where("psikolog_id = ? AND tanggal BETWEEN ? AND ?", psikolog.ID, startDate, endDate).
		Order("tanggal desc").Limit(50).
		Find(&data.SessionNotes)

	var bookings []models.PsikologBooking
	config.DB.Preload("Mahasiswa").
		Where("psikolog_id = ? AND tanggal BETWEEN ? AND ?", psikolog.ID, startDate, endDate).
		Find(&bookings)
	data.Bookings = bookings
	for _, b := range bookings {
		if b.Topik != "" {
			data.TopIssues[b.Topik]++
		}
	}

	// Generate PDF
	filePath, fileName, err := buildPDF(data, startDate, endDate)
	if err != nil {
		return "", "", err
	}
	return filePath, fileName, nil
}

func buildPDF(data ReportData, startDate, endDate time.Time) (string, string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(20, 20, 20)
	pdf.AliasNbPages("")

	// Define Header and Footer
	pdf.SetHeaderFunc(func() {
		// Draw thin primary line at top
		pdf.SetFillColor(15, 23, 42) // Slate 900
		pdf.Rect(0, 0, 210, 5, "F")
	})

	pdf.SetFooterFunc(func() {
		pdf.SetY(-20)
		pdf.SetFont("Helvetica", "I", 8)
		pdf.SetTextColor(148, 163, 184) // Slate 400
		pdf.CellFormat(170, 6, "Dokumen Rahasia BKU Care - Laporan Konseling Psikolog", "", 0, "L", false, 0, "")
		
		// Page number on the right
		pdf.SetX(-40)
		pdf.CellFormat(20, 6, fmt.Sprintf("Halaman %d dari {nb}", pdf.PageNo()), "", 0, "R", false, 0, "")
	})

	pdf.AddPage()

	// ── Corporate Header Banner ────────────────────────────────────────────────
	pdf.SetFillColor(30, 41, 59) // Slate 800
	pdf.Rect(20, 15, 170, 25, "F")

	pdf.SetTextColor(255, 255, 255)
	pdf.SetFont("Helvetica", "B", 14)
	pdf.SetXY(25, 19)
	pdf.Cell(160, 6, "LAPORAN KONSELING PSIKOLOG")

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetXY(25, 26)
	pdf.Cell(160, 5, fmt.Sprintf("BKU Care • Laporan %s • Periode: %s", data.TipeReport, data.Periode))
	
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
	pdf.Cell(80, 5, fmt.Sprintf("Nama: %s", data.Psikolog.Nama))
	pdf.SetXY(110, infoY)
	pdf.Cell(80, 5, fmt.Sprintf("Spesialisasi: %s", data.Psikolog.Spesialisasi))

	pdf.SetXY(24, infoY+6)
	pdf.Cell(80, 5, fmt.Sprintf("Email: %s", data.Psikolog.Email))
	pdf.SetXY(110, infoY+6)
	pdf.Cell(80, 5, fmt.Sprintf("Lokasi: %s", data.Psikolog.Lokasi))

	pdf.SetXY(24, infoY+12)
	pdf.Cell(170, 5, fmt.Sprintf("Periode Laporan: %s s/d %s",
		startDate.Format("02 Jan 2006"), endDate.Format("02 Jan 2006")))

	pdf.SetY(pdf.GetY() + 30)

	// ── Ringkasan Statistik ──────────────────────────────────────────────────
	pdf.SetFont("Helvetica", "B", 11)
	pdf.Cell(170, 6, "RINGKASAN STATISTIK SESI")
	pdf.Ln(8)

	// Stats cards configuration
	stats := []struct {
		label string
		value string
		color [3]int
	}{
		{"Total Sesi", fmt.Sprintf("%d Sesi", data.TotalSesi), [3]int{15, 23, 42}},      // Slate 900
		{"Total Pasien", fmt.Sprintf("%d Orang", data.TotalPasien), [3]int{16, 185, 129}}, // Emerald 500
		{"Sesi Selesai", fmt.Sprintf("%d Sesi", data.SesiSelesai), [3]int{99, 102, 241}}, // Indigo 500
		{"Kasus Mendesak", fmt.Sprintf("%d Kasus", data.KasusMenudesak), [3]int{239, 68, 68}}, // Red 500
	}

	boxY := pdf.GetY()
	for i, stat := range stats {
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

	// ── Distribusi Topik ─────────────────────────────────────────────────────
	if len(data.TopIssues) > 0 {
		pdf.SetFont("Helvetica", "B", 11)
		pdf.Cell(170, 6, "DISTRIBUSI TOPIK KONSELING")
		pdf.Ln(8)

		pdf.SetFont("Helvetica", "B", 9)
		pdf.SetFillColor(30, 41, 59) // Slate 800
		pdf.SetTextColor(255, 255, 255)
		pdf.SetDrawColor(226, 232, 240)
		
		pdf.CellFormat(100, 7, " Topik", "1", 0, "L", true, 0, "")
		pdf.CellFormat(35, 7, "Jumlah", "1", 0, "C", true, 0, "")
		pdf.CellFormat(35, 7, "Persentase", "1", 1, "C", true, 0, "")

		pdf.SetFont("Helvetica", "", 8.5)
		pdf.SetTextColor(15, 23, 42)
		total := len(data.Bookings)
		row := 0
		for topik, count := range data.TopIssues {
			if row%2 == 0 {
				pdf.SetFillColor(248, 250, 252) // Slate 50
			} else {
				pdf.SetFillColor(255, 255, 255)
			}
			pct := 0.0
			if total > 0 {
				pct = float64(count) / float64(total) * 100
			}
			pdf.CellFormat(100, 6, "  "+topik, "1", 0, "L", true, 0, "")
			pdf.CellFormat(35, 6, fmt.Sprintf("%d", count), "1", 0, "C", true, 0, "")
			pdf.CellFormat(35, 6, fmt.Sprintf("%.1f%%", pct), "1", 1, "C", true, 0, "")
			row++
		}
		pdf.Ln(8)
	}

	// ── Riwayat Sesi ─────────────────────────────────────────────────────────
	if len(data.SessionNotes) > 0 {
		if pdf.GetY() > 220 {
			pdf.AddPage()
		}

		pdf.SetFont("Helvetica", "B", 11)
		pdf.Cell(170, 6, "RIWAYAT SESI KONSELING")
		pdf.Ln(8)

		pdf.SetFont("Helvetica", "B", 8)
		pdf.SetFillColor(30, 41, 59)
		pdf.SetTextColor(255, 255, 255)
		pdf.SetDrawColor(226, 232, 240)
		
		pdf.CellFormat(28, 7, "Tanggal", "1", 0, "C", true, 0, "")
		pdf.CellFormat(52, 7, " Mahasiswa", "1", 0, "L", true, 0, "")
		pdf.CellFormat(30, 7, "Jenis Sesi", "1", 0, "C", true, 0, "")
		pdf.CellFormat(25, 7, "Mood", "1", 0, "C", true, 0, "")
		pdf.CellFormat(35, 7, "Status Pasien", "1", 1, "C", true, 0, "")

		pdf.SetFont("Helvetica", "", 8)
		pdf.SetTextColor(15, 23, 42)
		for i, note := range data.SessionNotes {
			if pdf.GetY() > 270 {
				pdf.AddPage()
				// Re-print header
				pdf.SetFont("Helvetica", "B", 8)
				pdf.SetFillColor(30, 41, 59)
				pdf.SetTextColor(255, 255, 255)
				pdf.SetDrawColor(226, 232, 240)
				pdf.CellFormat(28, 7, "Tanggal", "1", 0, "C", true, 0, "")
				pdf.CellFormat(52, 7, " Mahasiswa", "1", 0, "L", true, 0, "")
				pdf.CellFormat(30, 7, "Jenis Sesi", "1", 0, "C", true, 0, "")
				pdf.CellFormat(25, 7, "Mood", "1", 0, "C", true, 0, "")
				pdf.CellFormat(35, 7, "Status Pasien", "1", 1, "C", true, 0, "")
				pdf.SetFont("Helvetica", "", 8)
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
			pdf.CellFormat(28, 6, note.Tanggal.Format("02/01/2006"), "1", 0, "C", true, 0, "")
			pdf.CellFormat(52, 6, " "+truncate(nama, 28), "1", 0, "L", true, 0, "")
			pdf.CellFormat(30, 6, truncate(note.JenisSesi, 18), "1", 0, "C", true, 0, "")
			pdf.CellFormat(25, 6, truncate(note.Mood, 14), "1", 0, "C", true, 0, "")
			pdf.CellFormat(35, 6, truncate(note.StatusPasien, 20), "1", 1, "C", true, 0, "")
		}
		pdf.Ln(8)
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
	pdf.Cell(70, 5, data.Psikolog.Nama)
	
	pdf.SetFont("Helvetica", "", 8.5)
	pdf.SetTextColor(100, 116, 139) // Slate 500
	pdf.SetXY(120, currentY+7)
	pdf.Cell(70, 5, fmt.Sprintf("Spesialisasi: %s", data.Psikolog.Spesialisasi))
	pdf.SetXY(120, currentY+11)
	pdf.Cell(70, 5, fmt.Sprintf("Email: %s", data.Psikolog.Email))

	// Simpan file
	uploadsDir := "uploads/reports"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return "", "", err
	}

	fileName := fmt.Sprintf("laporan_%s_%s_%d.pdf",
		strings.ToLower(strings.ReplaceAll(data.TipeReport, " ", "_")),
		strings.ReplaceAll(data.Periode, " ", "_"),
		time.Now().Unix())
	filePath := filepath.Join(uploadsDir, fileName)

	if err := pdf.OutputFileAndClose(filePath); err != nil {
		return "", "", err
	}

	return filePath, fileName, nil
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max-2] + ".."
}

// ─────────────────────────────────────────────────────────────────────────
// REFERRAL PDF GENERATOR
// ─────────────────────────────────────────────────────────────────────────

type ReferralData struct {
	ID            string
	Psikolog      models.Psikolog
	Mahasiswa     models.Mahasiswa
	Tipe          string // Medis/Akademik
	Alasan        string
	PihakTujuan   string
	EmailTujuan   string
	TanggalDibuat time.Time
}

// GenerateReferralPDF membuat PDF surat rujukan dan menyimpannya ke disk
func GenerateReferralPDF(data ReferralData) (string, string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(20, 20, 20)
	pdf.AliasNbPages("")

	// Define Header and Footer
	pdf.SetHeaderFunc(func() {
		// Draw thin primary line at top
		pdf.SetFillColor(15, 23, 42) // Slate 900
		pdf.Rect(0, 0, 210, 5, "F")
	})

	pdf.SetFooterFunc(func() {
		pdf.SetY(-20)
		pdf.SetFont("Helvetica", "I", 8)
		pdf.SetTextColor(148, 163, 184) // Slate 400
		pdf.CellFormat(170, 6, "Dokumen Rahasia BKU Care - Surat Rujukan", "", 0, "L", false, 0, "")
		
		// Page number on the right
		pdf.SetX(-40)
		pdf.CellFormat(20, 6, fmt.Sprintf("Halaman %d dari {nb}", pdf.PageNo()), "", 0, "R", false, 0, "")
	})

	pdf.AddPage()

	// ── Corporate Header Banner ────────────────────────────────────────────────
	pdf.SetFillColor(30, 41, 59) // Slate 800
	pdf.Rect(20, 15, 170, 25, "F")

	pdf.SetTextColor(255, 255, 255)
	pdf.SetFont("Helvetica", "B", 14)
	pdf.SetXY(25, 19)
	pdf.Cell(160, 6, "SURAT RUJUKAN")

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetXY(25, 26)
	pdf.Cell(160, 5, fmt.Sprintf("BKU Care • Rujukan %s • Nomor: %s", data.Tipe, data.ID))
	
	pdf.SetXY(25, 31)
	pdf.Cell(160, 5, fmt.Sprintf("Dibuat pada: %s", data.TanggalDibuat.Format("02 January 2006 15:04")))

	// ── Kepada ────────────────────────────────────────────────────────────────
	pdf.SetTextColor(15, 23, 42) // Slate 900
	pdf.SetXY(20, 48)
	pdf.SetFont("Helvetica", "B", 11)
	pdf.Cell(170, 6, "KEPADA YTH:")
	pdf.Ln(8)

	pdf.SetFont("Helvetica", "", 10)
	pdf.SetFillColor(248, 250, 252) // Slate 50
	pdf.Rect(20, pdf.GetY(), 170, 20, "F")

	infoY := pdf.GetY() + 3
	pdf.SetXY(24, infoY)
	pdf.CellFormat(160, 5, data.PihakTujuan, "", 0, "L", false, 0, "")
	pdf.SetXY(24, infoY+6)
	pdf.CellFormat(160, 5, fmt.Sprintf("Email: %s", data.EmailTujuan), "", 0, "L", false, 0, "")

	pdf.SetY(pdf.GetY() + 25)

	// ── Isi Surat ──────────────────────────────────────────────────────────────
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetTextColor(15, 23, 42)
	pdf.MultiCell(170, 5, "Dengan hormat,\n\nKami dari BKU Care Universitas dengan ini merujuk seorang mahasiswa untuk mendapatkan penanganan lebih lanjut.", "", "L", false)
	pdf.Ln(8)

	// ── Data Mahasiswa ─────────────────────────────────────────────────────────
	pdf.SetFont("Helvetica", "B", 11)
	pdf.CellFormat(170, 6, "DATA MAHASISWA:", "", 1, "L", false, 0, "")
	pdf.Ln(4)

	pdf.SetFont("Helvetica", "B", 9)
	pdf.SetFillColor(30, 41, 59)
	pdf.SetTextColor(255, 255, 255)
	pdf.SetDrawColor(226, 232, 240)
	
	pdf.CellFormat(85, 7, " Informasi", "1", 0, "L", true, 0, "")
	pdf.CellFormat(85, 7, "Detail", "1", 1, "L", true, 0, "")

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetTextColor(15, 23, 42)
	
	fields := []struct {
		label string
		value string
	}{
		{"Nama", data.Mahasiswa.Nama},
		{"NIM", data.Mahasiswa.NIM},
		{"Email", data.Mahasiswa.EmailKampus},
		{"No. HP", data.Mahasiswa.NoHP},
		{"Program Studi", data.Mahasiswa.ProgramStudi.Nama},
		{"Fakultas", data.Mahasiswa.Fakultas.Nama},
		{"Semester", fmt.Sprintf("%d", data.Mahasiswa.SemesterSekarang)},
	}

	for i, field := range fields {
		if i%2 == 0 {
			pdf.SetFillColor(248, 250, 252)
		} else {
			pdf.SetFillColor(255, 255, 255)
		}
		pdf.CellFormat(85, 6, " "+field.label, "1", 0, "L", true, 0, "")
		pdf.CellFormat(85, 6, field.value, "1", 1, "L", true, 0, "")
	}

	pdf.Ln(8)

	// ── Alasan Rujukan ─────────────────────────────────────────────────────────
	pdf.SetFont("Helvetica", "B", 11)
	pdf.Cell(170, 6, "ALASAN RUJUKAN:")
	pdf.Ln(8)

	pdf.SetFont("Helvetica", "", 10)
	pdf.SetFillColor(248, 250, 252)
	pdf.Rect(20, pdf.GetY(), 170, 30, "F")
	pdf.SetXY(24, pdf.GetY()+3)
	pdf.MultiCell(162, 5, data.Alasan, "", "L", false)

	pdf.Ln(8)

	// ── Tipe Rujukan ───────────────────────────────────────────────────────────
	pdf.SetFont("Helvetica", "B", 11)
	pdf.CellFormat(170, 6, "TIPE RUJUKAN:", "", 1, "L", false, 0, "")
	pdf.Ln(2)

	pdf.SetFont("Helvetica", "", 10)
	pdf.SetFillColor(30, 41, 59)
	pdf.SetTextColor(255, 255, 255)
	pdf.Rect(20, pdf.GetY(), 170, 8, "F")
	pdf.SetXY(20, pdf.GetY())
	pdf.CellFormat(170, 8, " "+data.Tipe, "", 1, "L", false, 0, "")

	pdf.Ln(8)

	// ── Psikolog Pengirim ──────────────────────────────────────────────────────
	pdf.SetTextColor(15, 23, 42)
	pdf.SetFont("Helvetica", "B", 11)
	pdf.CellFormat(170, 6, "PSIKOLOG PENGIRIM:", "", 1, "L", false, 0, "")
	pdf.Ln(4)

	pdf.SetFont("Helvetica", "B", 9)
	pdf.SetFillColor(30, 41, 59)
	pdf.SetTextColor(255, 255, 255)
	pdf.SetDrawColor(226, 232, 240)
	
	pdf.CellFormat(85, 7, " Informasi", "1", 0, "L", true, 0, "")
	pdf.CellFormat(85, 7, "Detail", "1", 1, "L", true, 0, "")

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetTextColor(15, 23, 42)
	
	psikologFields := []struct {
		label string
		value string
	}{
		{"Nama", data.Psikolog.Nama},
		{"Spesialisasi", data.Psikolog.Spesialisasi},
		{"Email", data.Psikolog.Email},
		{"Lokasi", data.Psikolog.Lokasi},
	}

	for i, field := range psikologFields {
		if i%2 == 0 {
			pdf.SetFillColor(248, 250, 252)
		} else {
			pdf.SetFillColor(255, 255, 255)
		}
		pdf.CellFormat(85, 6, " "+field.label, "1", 0, "L", true, 0, "")
		pdf.CellFormat(85, 6, field.value, "1", 1, "L", true, 0, "")
	}

	pdf.Ln(12)

	// ── Penutup ────────────────────────────────────────────────────────────────
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetTextColor(15, 23, 42)
	pdf.MultiCell(170, 5, "Demikian surat rujukan ini kami buat untuk dapat ditindaklanjuti sesuai dengan kebutuhan mahasiswa.\n\nAtas perhatian dan kerjasamanya, kami ucapkan terima kasih.", "", "L", false)

	pdf.Ln(12)

	// ── Signature Section ──────────────────────────────────────────────────────
	pdf.SetFont("Helvetica", "", 9.5)
	pdf.SetXY(20, pdf.GetY())
	pdf.CellFormat(80, 5, "Hormat kami,", "", 1, "L", false, 0, "")
	
	pdf.Ln(20) // spacing for signature
	
	currentY := pdf.GetY()
	pdf.SetDrawColor(148, 163, 184)
	pdf.Line(20, currentY, 85, currentY) // signature line
	
	pdf.SetFont("Helvetica", "B", 9.5)
	pdf.SetXY(20, currentY+2)
	pdf.CellFormat(70, 5, data.Psikolog.Nama, "", 0, "L", false, 0, "")
	
	pdf.SetFont("Helvetica", "", 8.5)
	pdf.SetTextColor(100, 116, 139) // Slate 500
	pdf.SetXY(20, currentY+7)
	pdf.CellFormat(70, 5, fmt.Sprintf("Spesialisasi: %s", data.Psikolog.Spesialisasi), "", 0, "L", false, 0, "")
	pdf.SetXY(20, currentY+11)
	pdf.CellFormat(70, 5, fmt.Sprintf("Email: %s", data.Psikolog.Email), "", 0, "L", false, 0, "")

	// Simpan file
	uploadsDir := "uploads/referrals"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return "", "", err
	}

	fileName := fmt.Sprintf("referral_%s_%d.pdf",
		strings.ReplaceAll(data.ID, "-", "_"),
		time.Now().Unix())
	filePath := filepath.Join(uploadsDir, fileName)

	if err := pdf.OutputFileAndClose(filePath); err != nil {
		return "", "", err
	}

	return filePath, fileName, nil
}

package kencana

import (
	"fmt"
	"math"
	"path/filepath"
	"siakad-backend/config"
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

// ==================== HELPER ====================

func getStudent(c *fiber.Ctx) (models.Student, error) {
	userID := c.Locals("user_id")
	var student models.Student
	if err := config.DB.First(&student, "user_id = ?", userID).Error; err != nil {
		return student, err
	}
	return student, nil
}

// hitungKumulatif menghitung nilai kumulatif berdasarkan bobot per kuis
func hitungKumulatif(studentID uint) float64 {
	var kuisList []models.KencanaKuis
	config.DB.Where("is_aktif = true").Find(&kuisList)

	var kumulatif float64
	for _, kuis := range kuisList {
		// Ambil nilai terbaik
		var hasil models.KencanaHasilKuis
		config.DB.Where("student_id = ? AND kencana_kuis_id = ?", studentID, kuis.ID).
			Order("skor desc").First(&hasil)

		nilaiKuis := 0.0
		if hasil.ID != 0 {
			nilaiKuis = hasil.Skor
		}
		kumulatif += nilaiKuis * (kuis.BobotPersen / 100.0)
	}
	return math.Round(kumulatif*100) / 100
}

// ==================== GET PROGRESS ====================

// GetProgress — mengembalikan progress lengkap berstruktur 3 tahap
func GetProgress(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	// Ambil semua tahap
	var tahaps []models.KencanaTahap
	config.DB.Order("urutan asc").Find(&tahaps)

	// Hitung nilai kumulatif
	nilaiKumulatif := hitungKumulatif(student.ID)

	// Tentukan status keseluruhan
	var totalKuis, kuisSelesai int64
	config.DB.Model(&models.KencanaKuis{}).Where("is_aktif = true").Count(&totalKuis)
	config.DB.Model(&models.KencanaHasilKuis{}).
		Where("student_id = ? AND kencana_kuis_id IN (?)",
			student.ID,
			config.DB.Model(&models.KencanaKuis{}).Select("id").Where("is_aktif = true"),
		).
		Select("DISTINCT kencana_kuis_id").
		Count(&kuisSelesai)

	statusKeseluruhan := "belum_mulai"
	if kuisSelesai > 0 && kuisSelesai < totalKuis {
		statusKeseluruhan = "berlangsung"
	} else if kuisSelesai == totalKuis && totalKuis > 0 {
		if nilaiKumulatif >= 75 {
			statusKeseluruhan = "lulus"
		} else {
			statusKeseluruhan = "tidak_lulus"
		}
	}

	// Build response per tahap
	type KuisInfo struct {
		KuisID      uint    `json:"kuis_id"`
		JudulKuis   string  `json:"judul_kuis"`
		PassingGrade int    `json:"passing_grade"`
		BobotPersen float64 `json:"bobot_persen"`
		DurasiMenit *int    `json:"durasi_menit"`
		Status      string  `json:"status"` // belum, Lulus, Tidak_Lulus
		NilaiTerbaik float64 `json:"nilai_terbaik"`
		JumlahAttempt int   `json:"jumlah_attempt"`
		TerakhirDikerjakan *time.Time `json:"terakhir_dikerjakan"`
	}
	type MateriInfo struct {
		MateriID  uint      `json:"materi_id"`
		Judul     string    `json:"judul"`
		Tipe      string    `json:"tipe"`
		FileURL   string    `json:"file_url"`
		Urutan    int       `json:"urutan"`
		Kuis      *KuisInfo `json:"kuis"`
	}
	type TahapInfo struct {
		TahapID        uint         `json:"tahap_id"`
		Nama           string       `json:"nama"`
		Label          string       `json:"label"`
		Urutan         int          `json:"urutan"`
		Status         string       `json:"status"`
		TanggalMulai   *time.Time   `json:"tanggal_mulai"`
		TanggalSelesai *time.Time   `json:"tanggal_selesai"`
		TotalKuis      int          `json:"total_kuis"`
		KuisSelesai    int          `json:"kuis_selesai"`
		Materis        []MateriInfo `json:"materis"`
	}

	tahapInfos := make([]TahapInfo, 0)
	for _, tahap := range tahaps {
		var materis []models.KencanaMateri
		config.DB.Where("tahap_id = ? AND is_aktif = true", tahap.ID).
			Order("urutan asc").Find(&materis)

		materiInfos := make([]MateriInfo, 0)
		tahapKuisTotal := 0
		tahapKuisSelesai := 0

		for _, materi := range materis {
			var kuis models.KencanaKuis
			config.DB.Where("kencana_materi_id = ? AND is_aktif = true", materi.ID).First(&kuis)

			var kuisInfo *KuisInfo
			if kuis.ID != 0 {
				tahapKuisTotal++

				var hasilTerbaik models.KencanaHasilKuis
				config.DB.Where("student_id = ? AND kencana_kuis_id = ?", student.ID, kuis.ID).
					Order("skor desc").First(&hasilTerbaik)

				var countAttempt int64
				config.DB.Model(&models.KencanaHasilKuis{}).
					Where("student_id = ? AND kencana_kuis_id = ?", student.ID, kuis.ID).Count(&countAttempt)

				status := "belum_dikerjakan"
				var tglKerjakan *time.Time
				if hasilTerbaik.ID != 0 {
					tahapKuisSelesai++
					if hasilTerbaik.Lulus {
						status = "lulus"
					} else {
						status = "tidak_lulus"
					}
					t := hasilTerbaik.CreatedAt
					tglKerjakan = &t
				}

				kuisInfo = &KuisInfo{
					KuisID:      kuis.ID,
					JudulKuis:   kuis.Judul,
					PassingGrade: kuis.PassingGrade,
					BobotPersen: kuis.BobotPersen,
					DurasiMenit: kuis.DurasiMenit,
					Status:      status,
					NilaiTerbaik: hasilTerbaik.Skor,
					JumlahAttempt: int(countAttempt),
					TerakhirDikerjakan: tglKerjakan,
				}
			}

			materiInfos = append(materiInfos, MateriInfo{
				MateriID: materi.ID,
				Judul:    materi.Judul,
				Tipe:     materi.Tipe,
				FileURL:  materi.FileURL,
				Urutan:   materi.Urutan,
				Kuis:     kuisInfo,
			})
		}

		tahapInfos = append(tahapInfos, TahapInfo{
			TahapID:        tahap.ID,
			Nama:           tahap.Nama,
			Label:          tahap.Label,
			Urutan:         tahap.Urutan,
			Status:         tahap.Status,
			TanggalMulai:   tahap.TanggalMulai,
			TanggalSelesai: tahap.TanggalSelesai,
			TotalKuis:      tahapKuisTotal,
			KuisSelesai:    tahapKuisSelesai,
			Materis:        materiInfos,
		})
	}

	// Update KencanaProgress
	var progress models.KencanaProgress
	config.DB.Where("student_id = ?", student.ID).FirstOrCreate(&progress, models.KencanaProgress{
		StudentID: student.ID,
	})
	progress.NilaiKumulatif = nilaiKumulatif
	progress.StatusKeseluruhan = statusKeseluruhan
	progress.LastUpdated = time.Now()
	config.DB.Save(&progress)

	// Cek sertifikat
	var sertifikat models.KencanaSertifikat
	config.DB.Where("student_id = ?", student.ID).First(&sertifikat)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"nilai_kumulatif":    nilaiKumulatif,
			"status_keseluruhan": statusKeseluruhan,
			"kuis_selesai":       kuisSelesai,
			"total_kuis":         totalKuis,
			"eligible_sertifikat": nilaiKumulatif >= 75,
			"has_sertifikat":     sertifikat.ID != 0,
			"nomor_sertifikat":   sertifikat.NomorSertifikat,
			"tahaps":             tahapInfos,
		},
	})
}

// ==================== KUIS ====================

// DTO Response Soal Kuis tanpa KunciJawaban
type SoalKuisResponse struct {
	ID         uint   `json:"id"`
	Pertanyaan string `json:"pertanyaan"`
	OpsiA      string `json:"opsi_a"`
	OpsiB      string `json:"opsi_b"`
	OpsiC      string `json:"opsi_c"`
	OpsiD      string `json:"opsi_d"`
	Urutan     int    `json:"urutan"`
}

// GetSoalKuis mengembalikan list soal tanpa kunci jawaban
func GetSoalKuis(c *fiber.Ctx) error {
	kuisID := c.Params("kuisId")

	var kuis models.KencanaKuis
	if err := config.DB.First(&kuis, kuisID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Kuis tidak ditemukan"})
	}

	var soalDB []models.KuisSoal
	config.DB.Where("kencana_kuis_id = ?", kuisID).Order("urutan asc").Find(&soalDB)

	var soalList []SoalKuisResponse
	for _, s := range soalDB {
		soalList = append(soalList, SoalKuisResponse{
			ID:         s.ID,
			Pertanyaan: s.Pertanyaan,
			OpsiA:      s.OpsiA,
			OpsiB:      s.OpsiB,
			OpsiC:      s.OpsiC,
			OpsiD:      s.OpsiD,
			Urutan:     s.Urutan,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"kuis_id":      kuis.ID,
			"judul":        kuis.Judul,
			"passing_grade": kuis.PassingGrade,
			"durasi_menit": kuis.DurasiMenit,
			"bobot_persen": kuis.BobotPersen,
			"soal":         soalList,
		},
	})
}

// Request Body untuk Submit Kuis
type SubmitKuisRequest struct {
	Jawaban map[uint]string `json:"jawaban"` // map[soal_id]pilihan
}

// SubmitKuis — auto-grading, simpan nilai terbaik, hitung ulang kumulatif
func SubmitKuis(c *fiber.Ctx) error {
	kuisID := c.Params("kuisId")

	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var kuis models.KencanaKuis
	if err := config.DB.First(&kuis, kuisID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Kuis tidak ditemukan"})
	}

	var req SubmitKuisRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format jawaban salah"})
	}

	// Cek jawaban
	var soalLengkap []models.KuisSoal
	config.DB.Where("kencana_kuis_id = ?", kuisID).Find(&soalLengkap)

	jumlahBenar := 0
	totalSoal := len(soalLengkap)
	for _, soal := range soalLengkap {
		if jwb, ok := req.Jawaban[soal.ID]; ok {
			if strings.EqualFold(jwb, soal.KunciJawaban) {
				jumlahBenar++
			}
		}
	}

	var nilai float64
	if totalSoal > 0 {
		nilai = math.Round((float64(jumlahBenar)/float64(totalSoal))*100*100) / 100
	}
	lulus := int(nilai) >= kuis.PassingGrade

	// Cari attempt ke-berapa
	var countAttempt int64
	config.DB.Model(&models.KencanaHasilKuis{}).
		Where("student_id = ? AND kencana_kuis_id = ?", student.ID, kuis.ID).Count(&countAttempt)

	now := time.Now()
	hasil := models.KencanaHasilKuis{
		StudentID:     student.ID,
		KencanaKuisID: kuis.ID,
		Skor:          nilai,
		JumlahBenar:   jumlahBenar,
		TotalSoal:     totalSoal,
		Lulus:         lulus,
		PercobaanKe:   int(countAttempt) + 1,
		CreatedAt:     now,
	}
	config.DB.Create(&hasil)

	// Hitung ulang nilai kumulatif
	nilaiKumulatif := hitungKumulatif(student.ID)

	// Update KencanaProgress
	var progress models.KencanaProgress
	config.DB.Where("student_id = ?", student.ID).FirstOrCreate(&progress, models.KencanaProgress{StudentID: student.ID})
	progress.NilaiKumulatif = nilaiKumulatif
	if nilaiKumulatif >= 75 {
		progress.StatusKeseluruhan = "lulus"
	} else {
		progress.StatusKeseluruhan = "berlangsung"
	}
	progress.LastUpdated = time.Now()
	config.DB.Save(&progress)

	// Trigger Notification
	if lulus {
		notifikasi.Kirim(config.DB, notifikasi.KirimParams{
			StudentID: student.ID,
			Type:      "kencana",
			Title:     "Lulus Kuis KENCANA",
			Content:   fmt.Sprintf("Selamat! Kamu lulus kuis '%s' dengan nilai %.0f.", kuis.Judul, nilai),
			Link:      "/student/kencana",
		})
	}
	if nilaiKumulatif >= 75 && progress.StatusKeseluruhan == "lulus" {
		notifikasi.Kirim(config.DB, notifikasi.KirimParams{
			StudentID: student.ID,
			Type:      "kencana",
			Title:     "🎉 Selamat! Kamu Lulus KENCANA",
			Content:   fmt.Sprintf("Nilai kumulatif KENCANA kamu mencapai %.1f. Sertifikat sudah bisa diunduh!", nilaiKumulatif),
			Link:      "/student/kencana",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kuis berhasil disubmit",
		"data": fiber.Map{
			"nilai":                nilai,
			"lulus":               lulus,
			"jumlah_benar":        jumlahBenar,
			"total_soal":          totalSoal,
			"attempt_ke":          int(countAttempt) + 1,
			"nilai_kumulatif_terbaru": nilaiKumulatif,
			"eligible_sertifikat": nilaiKumulatif >= 75,
		},
	})
}

// ==================== SERTIFIKAT ====================

func CekSertifikat(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	nilaiKumulatif := hitungKumulatif(student.ID)

	var cert models.KencanaSertifikat
	config.DB.Where("student_id = ?", student.ID).First(&cert)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"has_sertifikat":      cert.ID != 0,
			"eligible":            nilaiKumulatif >= 75,
			"nilai_kumulatif":     nilaiKumulatif,
			"file_url":            cert.FileURL,
			"nomor":               cert.NomorSertifikat,
			"diterbitkan_at":      cert.DiterbitkanAt,
		},
	})
}

func GenerateSertifikat(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	nilaiKumulatif := hitungKumulatif(student.ID)
	if nilaiKumulatif < 75 {
		return c.Status(403).JSON(fiber.Map{
			"success": false,
			"message": fmt.Sprintf("Nilai kumulatif belum mencapai 75 (saat ini: %.1f)", nilaiKumulatif),
		})
	}

	// Cek apakah sudah ada
	var existing models.KencanaSertifikat
	config.DB.Where("student_id = ?", student.ID).First(&existing)
	if existing.ID != 0 {
		return c.JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"file_url": existing.FileURL,
				"nomor":    existing.NomorSertifikat,
			},
		})
	}

	// Generate mock sertifikat
	nomorSerti := fmt.Sprintf("BKU-PKKMB-%d-%s", time.Now().Year(), student.NIM)
	dummyURL := fmt.Sprintf("/uploads/sertifikat/%s.pdf", nomorSerti)

	sertifikat := models.KencanaSertifikat{
		StudentID:       student.ID,
		NomorSertifikat: nomorSerti,
		FileURL:         dummyURL,
		DiterbitkanAt:   time.Now(),
	}
	config.DB.Create(&sertifikat)

	notifikasi.Kirim(config.DB, notifikasi.KirimParams{
		StudentID: student.ID,
		Type:      "kencana",
		Title:     "Sertifikat KENCANA Terbit",
		Content:   fmt.Sprintf("Sertifikat PKKMB (%s) telah diterbitkan. Silakan unduh di menu KENCANA.", nomorSerti),
		Link:      "/student/kencana",
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sertifikat berhasil dibuat",
		"data": fiber.Map{
			"file_url": dummyURL,
			"nomor":    nomorSerti,
		},
	})
}

// ==================== BANDING ====================

func GetBanding(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var bandings []models.KencanaBanding
	config.DB.Preload("Kuis").Where("student_id = ?", student.ID).
		Order("created_at desc").Find(&bandings)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    bandings,
	})
}

func AjukanBanding(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	kuisIDStr := c.FormValue("kuis_id")
	alasan := c.FormValue("alasan")

	if kuisIDStr == "" || alasan == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "kuis_id dan alasan wajib diisi"})
	}
	if len(alasan) < 50 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Alasan minimal 50 karakter"})
	}

	var kuis models.KencanaKuis
	if err := config.DB.First(&kuis, kuisIDStr).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Kuis tidak ditemukan"})
	}

	// Cek apakah ada hasil kuis (dikerjakan dalam 72 jam terakhir)
	var hasil models.KencanaHasilKuis
	config.DB.Where("student_id = ? AND kencana_kuis_id = ?", student.ID, kuis.ID).
		Order("dibuat_pada desc").First(&hasil)

	if hasil.ID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Kamu belum mengerjakan kuis ini"})
	}
	if time.Since(hasil.CreatedAt) > 72*time.Hour {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Batas waktu pengajuan banding 72 jam setelah kuis dikerjakan sudah lewat"})
	}

	// Cek banding aktif untuk kuis ini
	var existingBanding models.KencanaBanding
	config.DB.Where("student_id = ? AND kuis_id = ? AND status IN (?)", student.ID, kuis.ID, []string{"menunggu", "diproses"}).
		First(&existingBanding)
	if existingBanding.ID != 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Kamu sudah memiliki banding aktif untuk kuis ini"})
	}

	// Upload bukti opsional
	buktiURL := ""
	file, _ := c.FormFile("bukti_file")
	if file != nil {
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".pdf" {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format file bukti harus JPG, PNG, atau PDF"})
		}
		if file.Size > 5*1024*1024 {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Ukuran file maksimal 5MB"})
		}
		filename := fmt.Sprintf("banding_%d_%d%s", student.ID, time.Now().UnixNano(), ext)
		savePath := fmt.Sprintf("./uploads/banding/%s", filename)
		if saveErr := c.SaveFile(file, savePath); saveErr == nil {
			buktiURL = fmt.Sprintf("/uploads/banding/%s", filename)
		}
	}

	banding := models.KencanaBanding{
		StudentID: student.ID,
		KuisID:    kuis.ID,
		Alasan:    alasan,
		BuktiURL:  buktiURL,
		Status:    "menunggu",
		CreatedAt: time.Now(),
	}
	config.DB.Create(&banding)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Banding berhasil diajukan",
		"data":    banding,
	})
}

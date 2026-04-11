package kencana

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// ==================== HELPER ====================

func getStudent(c *fiber.Ctx) (models.Mahasiswa, error) {
	PenggunaValue := c.Locals("user_id")
	PenggunaID, ok := PenggunaValue.(uint)
	if !ok {
		return models.Mahasiswa{}, fmt.Errorf("invalid user id")
	}
	var student models.Mahasiswa
	if err := config.DB.First(&student, "pengguna_id = ?", PenggunaID).Error; err != nil {
		return student, err
	}
	return student, nil
}

// ==================== GET PROGRESS ====================

func GetProgress(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	// 1. Fetch All Stages with Materials and their Quizzes
	var tahaps []models.PkkmbTahap
	if err := config.DB.Order("\"order\" asc").Preload("Materis", func(db *gorm.DB) *gorm.DB {
		return db.Order("\"order\" asc")
	}).Preload("Materis.Quiz").Find(&tahaps).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil data tahapan"})
	}

	// 2. Fetch All Quiz Attempts for this student
	var attempts []models.PkkmbQuizAttempt
	config.DB.Where("mahasiswa_id = ?", student.ID).Find(&attempts)

	// Map best score and status for each quiz
	type quizResult struct {
		BestScore float64
		Attempts  int
		Status    string
	}
	resultMap := make(map[uint]quizResult)
	for _, a := range attempts {
		res := resultMap[a.QuizID]
		res.Attempts++
		if a.Nilai > res.BestScore {
			res.BestScore = a.Nilai
		}
		if a.Nilai >= 70 { // Assuming 70 is passing grade
			res.Status = "lulus"
		} else if res.Status != "lulus" {
			res.Status = "tidak_lulus"
		}
		resultMap[a.QuizID] = res
	}

	// 3. Build Hierarchical Response
	totalKuis := 0
	kuisSelesai := 0
	nilaiTotal := 0.0

	type QuizInfo struct {
		KuisID           uint    `json:"kuis_id"`
		Status           string  `json:"status"`
		NilaiTerbaik     float64 `json:"nilai_terbaik"`
		BobotPersen      int     `json:"bobot_persen"`
		JumlahAttempt    int     `json:"jumlah_attempt"`
		JudulKuis        string  `json:"judul_kuis"`
	}

	type MateriInfo struct {
		MateriID  uint      `json:"materi_id"`
		Judul     string    `json:"judul"`
		Tipe      string    `json:"tipe"`
		FileURL   string    `json:"file_url"`
		Kuis      *QuizInfo `json:"kuis"`
	}

	type TahapInfo struct {
		TahapID        uint         `json:"tahap_id"`
		Label          string       `json:"label"`
		Status         string       `json:"status"`
		TanggalMulai   time.Time    `json:"tanggal_mulai"`
		TanggalSelesai time.Time    `json:"tanggal_selesai"`
		TotalKuis      int          `json:"total_kuis"`
		KuisSelesai    int          `json:"kuis_selesai"`
		Materis        []MateriInfo `json:"materis"`
	}

	var stages []TahapInfo
	for _, t := range tahaps {
		tTotal := 0
		tSelesai := 0
		var mInfos []MateriInfo

		for _, m := range t.Materis {
			var qInfo *QuizInfo
			if m.Quiz != nil {
				tTotal++
				totalKuis++
				res := resultMap[m.Quiz.ID]
				
				status := "belum_dikerjakan"
				if res.Attempts > 0 {
					status = res.Status
					if status == "lulus" {
						tSelesai++
						kuisSelesai++
						nilaiTotal += (res.BestScore * float64(m.Quiz.Bobot) / 100)
					}
				}

				qInfo = &QuizInfo{
					KuisID:        m.Quiz.ID,
					Status:        status,
					NilaiTerbaik:  res.BestScore,
					BobotPersen:   m.Quiz.Bobot,
					JumlahAttempt: res.Attempts,
					JudulKuis:     m.Quiz.Judul,
				}
			}

			mInfos = append(mInfos, MateriInfo{
				MateriID: m.ID,
				Judul:    m.Judul,
				Tipe:     m.Tipe,
				FileURL:  m.FileURL,
				Kuis:     qInfo,
			})
		}

		// Determine stage status
		tahapStatus := t.Status
		if tSelesai == tTotal && tTotal > 0 {
			tahapStatus = "selesai"
		} else if tSelesai > 0 {
			tahapStatus = "berlangsung"
		}

		stages = append(stages, TahapInfo{
			TahapID:        t.ID,
			Label:          t.Label,
			Status:         tahapStatus,
			TanggalMulai:   t.TanggalMulai,
			TanggalSelesai: t.TanggalSelesai,
			TotalKuis:      tTotal,
			KuisSelesai:    tSelesai,
			Materis:        mInfos,
		})
	}

	// Overall status
	statusKeseluruhan := "belum_mulai"
	if kuisSelesai == totalKuis && totalKuis > 0 {
		statusKeseluruhan = "lulus"
	} else if kuisSelesai > 0 {
		statusKeseluruhan = "berlangsung"
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"nilai_kumulatif":     nilaiTotal,
			"status_keseluruhan":  statusKeseluruhan,
			"total_kuis":          totalKuis,
			"kuis_selesai":        kuisSelesai,
			"tahaps":              stages,
			"has_sertifikat":      false, // Logic for sertifikat can be added
			"eligible_sertifikat": statusKeseluruhan == "lulus",
		},
	})
}

// CheckIn handles student check-in for a PKKMB event
func CheckIn(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	kegiatanID, _ := c.ParamsInt("id")

	var pg models.PkkmbProgress
	if err := config.DB.Where("mahasiswa_id = ? AND kegiatan_id = ?", student.ID, kegiatanID).First(&pg).Error; err != nil {
		// New registration
		pg = models.PkkmbProgress{
			MahasiswaID: student.ID,
			KegiatanID:  uint(kegiatanID),
			Status:      "Hadir",
		}
		config.DB.Create(&pg)
	} else {
		pg.Status = "Hadir"
		config.DB.Save(&pg)
	}

	return c.JSON(fiber.Map{"success": true, "message": "Berhasil check-in kegiatan"})
}

// GetSertifikat retrieves certificate if graduated
func GetSertifikat(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var sertif models.PkkmbSertifikat
	if err := config.DB.Where("mahasiswa_id = ?", student.ID).First(&sertif).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Sertifikat belum tersedia"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"has_sertifikat": true,
			"eligible":       true,
			"file_url":       sertif.FileURL,
			"nomor":          sertif.ID,
		},
	})
}

// SubmitBanding handles graduation appeal
func SubmitBanding(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	type BandingReq struct {
		Alasan string `json:"alasan"`
	}
	var req BandingReq
	c.BodyParser(&req)

	banding := models.PkkmbBanding{
		MahasiswaID: student.ID,
		Alasan:      req.Alasan,
		Status:      "Menunggu",
	}

	if err := config.DB.Create(&banding).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengajukan banding"})
	}

	// Trigger Notification
	notifikasi.Kirim(config.DB, notifikasi.KirimParams{
		UserID:  student.PenggunaID,
		Type:    "info",
		Title:   "Banding PKKMB",
		Content: "Pengajuan banding kelulusan PKKMB kamu telah diterima dan sedang diproses.",
	})

	return c.JSON(fiber.Map{"success": true, "message": "Banding berhasil diajukan"})
}

func GetBandingList(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var list []models.PkkmbBanding
	if err := config.DB.Where("mahasiswa_id = ?", student.ID).Order("created_at desc").Find(&list).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil data banding"})
	}

	return c.JSON(fiber.Map{"success": true, "data": list})
}

func GenerateSertifikat(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var existing models.PkkmbSertifikat
	if err := config.DB.Where("mahasiswa_id = ?", student.ID).First(&existing).Error; err == nil {
		return c.JSON(fiber.Map{"success": true, "data": existing})
	}

	newCert := models.PkkmbSertifikat{
		MahasiswaID:   student.ID,
		FileURL:       "/uploads/sertifikat/pkkmb-demo.pdf",
		TanggalTerbit: time.Now(),
	}
	if err := config.DB.Create(&newCert).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal generate sertifikat"})
	}

	return c.JSON(fiber.Map{"success": true, "data": newCert})
}

func GetKuisSoal(c *fiber.Ctx) error {
	kuisID := c.Params("id")
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"kuis_id":       kuisID,
			"judul":         "Kuis belum tersedia",
			"passing_grade": 70,
			"durasi_menit":  30,
			"bobot_persen":  0,
			"soal":          []any{},
		},
	})
}

func SubmitKuis(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"nilai":                   0,
			"lulus":                   false,
			"jumlah_benar":            0,
			"total_soal":              0,
			"nilai_kumulatif_terbaru": 0,
			"eligible_sertifikat":     false,
		},
	})
}

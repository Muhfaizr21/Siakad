package krs

import (
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

// Get Periode KRS Aktif
func GetPeriode(c *fiber.Ctx) error {
	var periode models.PeriodeAkademik
	err := config.DB.Where("is_active = ?", true).First(&periode).Error
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Tidak ada periode aktif"})
	}
	return c.JSON(fiber.Map{"success": true, "data": periode})
}

// Get Katalog Jadwal Mata Kuliah yang Tersedia
func GetKatalog(c *fiber.Ctx) error {
	studentID := GetStudentID(c)
	if studentID == 0 {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	// Dapatkan periode aktif
	var periode models.PeriodeAkademik
	config.DB.Where("is_active = ?", true).First(&periode)

	// Dapatkan data prodi mahasiswa
	var student models.Student
	config.DB.First(&student, studentID)

	var jadwal []models.JadwalKuliah
	config.DB.Preload("MataKuliah").Preload("Lecturer").
		Joins("JOIN mata_kuliahs ON mata_kuliahs.id = jadwal_kuliahs.mata_kuliah_id").
		Where("jadwal_kuliahs.periode_id = ?", periode.ID).
		Where("mata_kuliahs.prodi_id = ?", student.MajorID).
		Find(&jadwal)

	return c.JSON(fiber.Map{"success": true, "data": jadwal})
}

// Get Rencana Studi (KRS) Milik Saya
func GetKRSSaya(c *fiber.Ctx) error {
	studentID := GetStudentID(c)
	if studentID == 0 {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var periode models.PeriodeAkademik
	config.DB.Where("is_active = ?", true).First(&periode)

	var header models.KRSHeader
	err := config.DB.Where("student_id = ? AND periode_id = ?", studentID, periode.ID).First(&header).Error
	if err != nil {
		// Buat draft header jika belum ada
		header = models.KRSHeader{
			StudentID: studentID,
			PeriodeID: periode.ID,
			Status:    "draft",
		}
		config.DB.Create(&header)
	}

	var details []models.KRSDetail
	config.DB.Preload("JadwalKuliah").Preload("JadwalKuliah.MataKuliah").Preload("JadwalKuliah.Lecturer").
		Where("krs_header_id = ?", header.ID).Find(&details)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"header":  header,
			"details": details,
		},
	})
}

// Menambahkan Mata Kuliah ke KRS Terpilih
func TambahKRS(c *fiber.Ctx) error {
	studentID := GetStudentID(c)
	if studentID == 0 {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}
	payload := struct {
		JadwalKuliahID uint `json:"jadwal_kuliah_id"`
	}{}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Invalid request"})
	}

	var periode models.PeriodeAkademik
	config.DB.Where("is_active = ?", true).First(&periode)
	if !periode.KRSOpen {
		return c.Status(403).JSON(fiber.Map{"success": false, "message": "Periode Pengisian KRS telah ditutup!"})
	}

	var header models.KRSHeader
	config.DB.FirstOrCreate(&header, models.KRSHeader{StudentID: studentID, PeriodeID: periode.ID, Status: "draft"})

	if header.Status != "draft" && header.Status != "ditolak" {
		return c.Status(403).JSON(fiber.Map{"success": false, "message": "Status KRS sudah di-submit. Tidak dapat mengubah mata kuliah."})
	}

	// Cek Target Jadwal Baru
	var jadwalBaru models.JadwalKuliah
	if err := config.DB.Preload("MataKuliah").First(&jadwalBaru, payload.JadwalKuliahID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Jadwal MK tidak ditemukan"})
	}

	// 1. Cek Kuota
	var countCurrent int64
	config.DB.Model(&models.KRSDetail{}).Where("jadwal_kuliah_id = ?", jadwalBaru.ID).Count(&countCurrent)
	if int(countCurrent) >= jadwalBaru.Kuota {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Gagal: Kuota Mata Kuliah sudah penuh!"})
	}

	// 2. Cek Total SKS
	var currentSKS int
	var currentDetails []models.KRSDetail
	config.DB.Preload("JadwalKuliah.MataKuliah").Where("krs_header_id = ?", header.ID).Find(&currentDetails)
	
	for _, det := range currentDetails {
		if det.JadwalKuliahID == jadwalBaru.ID {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Gagal: Mata kuliah ini sudah ada di KRS Anda!"})
		}
		currentSKS += det.JadwalKuliah.MataKuliah.SKS
	}
	
	maxSKS := 24 // Untuk sementara diset rata 24 SKS
	if currentSKS+jadwalBaru.MataKuliah.SKS > maxSKS {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Gagal: SKS akan melampaui batas maksimum (24 SKS)!"})
	}

	// 3. Cek Tabrakan Jadwal 
	// Asumsi format JamMulai & JamSelesai adalah "HH:mm". String compare bisa bekerja karena format statis.
	for _, det := range currentDetails {
		jLama := det.JadwalKuliah
		if jLama.Hari == jadwalBaru.Hari {
			// Tabrakan jika JamSelesai Lama > JamMulai Baru AND JamMulai Lama < JamSelesai Baru
			if jLama.JamSelesai > jadwalBaru.JamMulai && jLama.JamMulai < jadwalBaru.JamSelesai {
				return c.Status(400).JSON(fiber.Map{"success": false, "message": "Gagal: Tabrakan jadwal dengan MK " + jLama.MataKuliah.Name})
			}
		}
	}

	// 4. Cek Prasyarat (apakah sudah pernah ambil & nilai bukan E)
	var prasyarat []models.MataKuliahPrasyarat
	config.DB.Where("mata_kuliah_id = ?", jadwalBaru.MataKuliahID).Find(&prasyarat)
	
	for _, req := range prasyarat {
		var khs models.KHS
		err := config.DB.Where("student_id = ? AND mata_kuliah_id = ?", studentID, req.PrasyaratID).Order("bobot desc").First(&khs).Error
		if err != nil || khs.NilaiHuruf == "E" || khs.NilaiHuruf == "" {
			var namaMK models.MataKuliah
			config.DB.First(&namaMK, req.PrasyaratID)
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Gagal Prasyarat: Anda belum lulus / mengambil MK " + namaMK.Name})
		}
	}

	// Tambahkan ke Keranjang
	detail := models.KRSDetail{
		KRSHeaderID:    header.ID,
		JadwalKuliahID: jadwalBaru.ID,
	}
	config.DB.Create(&detail)

	// Update Total SKS di Header
	header.TotalSKS = currentSKS + jadwalBaru.MataKuliah.SKS
	config.DB.Save(&header)

	return c.JSON(fiber.Map{"success": true, "message": "Berhasil ditambahkan", "data": detail})
}

// Hapus Mata Kuliah dari KRS
func HapusKRS(c *fiber.Ctx) error {
	studentID := GetStudentID(c)
	if studentID == 0 {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}
	detailID := c.Params("id")

	var periode models.PeriodeAkademik
	config.DB.Where("is_active = ?", true).First(&periode)
	if !periode.KRSOpen {
		return c.Status(403).JSON(fiber.Map{"success": false, "message": "Periode Pengisian KRS telah ditutup!"})
	}

	var header models.KRSHeader
	config.DB.Where("student_id = ? AND periode_id = ?", studentID, periode.ID).First(&header)

	if header.Status != "draft" && header.Status != "ditolak" {
		return c.Status(403).JSON(fiber.Map{"success": false, "message": "KRS sedang diproses, tidak bisa hapus jadwal!"})
	}

	var detail models.KRSDetail
	err := config.DB.Preload("JadwalKuliah.MataKuliah").Where("id = ? AND krs_header_id = ?", detailID, header.ID).First(&detail).Error
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Item KRS tidak ditemukan"})
	}

	config.DB.Delete(&detail)
	
	header.TotalSKS = header.TotalSKS - detail.JadwalKuliah.MataKuliah.SKS
	config.DB.Save(&header)

	return c.JSON(fiber.Map{"success": true, "message": "Berhasil dihapus dari keranjang KRS"})
}

// Submit KRS
func SubmitKRS(c *fiber.Ctx) error {
	studentID := GetStudentID(c)
	if studentID == 0 {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}
	
	var periode models.PeriodeAkademik
	config.DB.Where("is_active = ?", true).First(&periode)

	var header models.KRSHeader
	err := config.DB.Where("student_id = ? AND periode_id = ?", studentID, periode.ID).First(&header).Error
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "KRS belum dibuat"})
	}

	if header.TotalSKS == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "KRS Kosong. Harap ambil minimal 1 mata kuliah."})
	}

	header.Status = "menunggu_approval"
	config.DB.Save(&header)

	return c.JSON(fiber.Map{"success": true, "message": "KRS Berhasil Di-submit ke Dosen Wali"})
}

// Safe way to get Student ID
func GetStudentID(c *fiber.Ctx) uint {
	val := c.Locals("student_id")
	if val != nil {
		if id, ok := val.(uint); ok {
			return id
		}
	}

	// fallback: find by user_id
	userID := c.Locals("user_id")
	if userID == nil {
		return 0
	}

	var student models.Student
	config.DB.First(&student, "user_id = ?", userID)
	return student.ID
}

// Generate Cetak KRS PDF
func CetakKRS(c *fiber.Ctx) error {
	studentID := GetStudentID(c)
	if studentID == 0 {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Unauthorized student access"})
	}
	// ... rest of CetakKRS
	var student models.Student
	config.DB.Preload("Major").Preload("Major.Faculty").First(&student, studentID)

	var periode models.PeriodeAkademik
	config.DB.Where("is_active = ?", true).First(&periode)

	var header models.KRSHeader
	err := config.DB.Where("student_id = ? AND periode_id = ?", studentID, periode.ID).First(&header).Error
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "KRS belum dibuat"})
	}

	var details []models.KRSDetail
	config.DB.Preload("JadwalKuliah.MataKuliah").Preload("JadwalKuliah.Lecturer").
		Where("krs_header_id = ?", header.ID).Find(&details)

	// In a real approach we'd use proper go-pdf usage
	// Due to limited environment context in this code block, we will mock PDF as a JSON for testing
	// Next step: fully integrate fpdf
	
	// Create mock PDF bytes for now
	c.Set("Content-Type", "application/pdf")
	return c.Send([]byte("%PDF-1.4\n1 0 obj\n<< /Title (Kartu Rencana Studi SIAKAD BKU) >>\nendobj\n"))
}

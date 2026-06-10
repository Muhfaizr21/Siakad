package mahasiswa

import (
	"encoding/json"
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)


// GetList returns all organisation history for the logged-in student
func GetList(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var list []models.RiwayatOrganisasi
	config.DB.Preload("Prestasi").Where("mahasiswa_id = ?", student.ID).Order("periode_mulai desc").Find(&list)

	return c.JSON(fiber.Map{"success": true, "data": list})
}

type OrgRequest struct {
	NamaOrganisasi    string `json:"nama_organisasi"`
	Tipe              string `json:"tipe"`
	Jabatan           string `json:"jabatan"`
	PeriodeMulai      int    `json:"periode_mulai"`
	PeriodeSelesai    *int   `json:"periode_selesai"`
	DeskripsiKegiatan string `json:"deskripsi_kegiatan"`
	Apresiasi         string `json:"apresiasi"`
}

// Create adds a new organisation record
func Create(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var req OrgRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format request tidak valid"})
	}

	rec := models.RiwayatOrganisasi{
		MahasiswaID:       student.ID,
		NamaOrganisasi:    req.NamaOrganisasi,
		Tipe:              req.Tipe,
		Jabatan:           req.Jabatan,
		PeriodeMulai:      req.PeriodeMulai,
		PeriodeSelesai:    req.PeriodeSelesai,
		DeskripsiKegiatan: req.DeskripsiKegiatan,
		Apresiasi:         req.Apresiasi,
		StatusVerifikasi:  "Menunggu",
	}

	if err := config.DB.Create(&rec).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menambah riwayat organisasi"})
	}

	return c.Status(201).JSON(fiber.Map{"success": true, "data": rec})
}

// Update modifies an existing organisation record
func Update(c *fiber.Ctx) error {
	id := c.Params("id")
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var rec models.RiwayatOrganisasi
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", id, student.ID).First(&rec).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}

	var req OrgRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format request tidak valid"})
	}

	rec.NamaOrganisasi = req.NamaOrganisasi
	rec.Tipe = req.Tipe
	rec.Jabatan = req.Jabatan
	rec.PeriodeMulai = req.PeriodeMulai
	rec.PeriodeSelesai = req.PeriodeSelesai
	rec.DeskripsiKegiatan = req.DeskripsiKegiatan
	rec.Apresiasi = req.Apresiasi

	if err := config.DB.Save(&rec).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan perubahan"})
	}

	return c.JSON(fiber.Map{"success": true, "data": rec})
}

// Delete removes a record
func Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var rec models.RiwayatOrganisasi
	if err := config.DB.Where("id = ? AND mahasiswa_id = ?", id, student.ID).First(&rec).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Data tidak ditemukan"})
	}

	config.DB.Delete(&rec)
	return c.JSON(fiber.Map{"success": true, "message": "Riwayat organisasi berhasil dihapus"})
}

// GetOrmawaList returns all active Ormawas
func GetOrmawaList(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var list []models.Ormawa
	if err := config.DB.Preload("KategoriDetail").Where("status = ?", "Aktif").Order("nama asc").Find(&list).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil data Ormawa"})
	}

	// Filter based on Kategori and student affiliation
	var filtered []models.Ormawa
	for _, o := range list {
		isUniversal := false
		if o.KategoriDetail != nil && !o.KategoriDetail.TerafiliasiFakultas && !o.KategoriDetail.WajibProdi {
			isUniversal = true
		} else if o.KategoriDetail == nil {
			k := o.Kategori
			if k == "BEM" || k == "MPM" || k == "UKM" || k == "UKK" {
				isUniversal = true
			}
		}

		if isUniversal {
			filtered = append(filtered, o)
		} else {
			// Himpunan and other categories: check affiliation
			if o.ProgramStudiID != nil && *o.ProgramStudiID > 0 {
				if student.ProgramStudiID == *o.ProgramStudiID {
					filtered = append(filtered, o)
				}
			} else if o.FakultasID != nil && *o.FakultasID > 0 {
				if student.FakultasID == *o.FakultasID {
					filtered = append(filtered, o)
				}
			} else {
				// If no affiliation is set, keep it
				filtered = append(filtered, o)
			}
		}
	}

	return c.JSON(fiber.Map{"success": true, "data": filtered})
}

// DaftarOrmawa registers a student to an Ormawa
func DaftarOrmawa(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var req struct {
		OrmawaID         uint                   `json:"ormawa_id"`
		Divisi           string                 `json:"divisi"`
		DivisiPilihanDua string                 `json:"divisi_pilihan_dua"`
		Alasan           string                 `json:"alasan"`
		CVURL            string                 `json:"cv_url"`
		CustomAnswers    map[string]interface{} `json:"custom_answers"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Payload request tidak valid"})
	}

	if req.OrmawaID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Ormawa ID wajib diisi"})
	}

	// Fetch Ormawa details to check affiliation and open recruitment status
	var ormawa models.Ormawa
	if err := config.DB.Preload("KategoriDetail").First(&ormawa, req.OrmawaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Ormawa tidak ditemukan"})
	}

	// Validate Open Recruitment status!
	if !ormawa.OpenRecruitment {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Pendaftaran Ormawa ini sedang ditutup"})
	}

	// Validate dates if set!
	now := time.Now()
	if ormawa.RecruitmentStart != nil && !ormawa.RecruitmentStart.IsZero() && now.Before(*ormawa.RecruitmentStart) {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Pendaftaran Ormawa belum dibuka"})
	}
	if ormawa.RecruitmentEnd != nil && !ormawa.RecruitmentEnd.IsZero() && now.After(*ormawa.RecruitmentEnd) {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Pendaftaran Ormawa sudah ditutup"})
	}

	// Validate academic standard: Minimum GPA (IPK)!
	if ormawa.MinIPK > 0 && student.IPK < ormawa.MinIPK {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": fmt.Sprintf("IPK Anda (%.2f) tidak memenuhi syarat minimal IPK (%.2f) untuk Ormawa ini", student.IPK, ormawa.MinIPK)})
	}

	// Validate affiliation!
	isUniversal := false
	if ormawa.KategoriDetail != nil && !ormawa.KategoriDetail.TerafiliasiFakultas && !ormawa.KategoriDetail.WajibProdi {
		isUniversal = true
	} else if ormawa.KategoriDetail == nil {
		k := ormawa.Kategori
		if k == "BEM" || k == "MPM" || k == "UKM" || k == "UKK" {
			isUniversal = true
		}
	}

	if !isUniversal {
		if ormawa.ProgramStudiID != nil && *ormawa.ProgramStudiID > 0 {
			if student.ProgramStudiID != *ormawa.ProgramStudiID {
				return c.Status(403).JSON(fiber.Map{"success": false, "message": "Ormawa ini hanya terbuka untuk Program Studi yang bersangkutan"})
			}
		} else if ormawa.FakultasID != nil && *ormawa.FakultasID > 0 {
			if student.FakultasID != *ormawa.FakultasID {
				return c.Status(403).JSON(fiber.Map{"success": false, "message": "Ormawa ini hanya terbuka untuk Fakultas yang bersangkutan"})
			}
		}
	}

	// Check if already registered (either pending or active)
	var count int64
	config.DB.Model(&models.OrmawaAnggota{}).Where("mahasiswa_id = ? AND ormawa_id = ? AND status IN ?", student.ID, req.OrmawaID, []string{"aktif", "pending"}).Count(&count)
	if count > 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Anda sudah terdaftar atau memiliki pendaftaran pending di Ormawa ini"})
	}

	div := req.Divisi
	if div == "" {
		div = "Umum"
	}

	// Serialize custom answers to JSON
	customAnswersJSON := ""
	if len(req.CustomAnswers) > 0 {
		jb, _ := json.Marshal(req.CustomAnswers)
		customAnswersJSON = string(jb)
	}

	anggota := models.OrmawaAnggota{
		OrmawaID:         req.OrmawaID,
		MahasiswaID:      student.ID,
		Role:             "Anggota",
		Divisi:           div,
		DivisiPilihanDua: req.DivisiPilihanDua,
		IPK:              student.IPK,
		Alasan:           req.Alasan,
		CVURL:            req.CVURL,
		CustomAnswers:    customAnswersJSON,
		Status:           "pending",
		JoinedAt:         now,
	}

	if err := config.DB.Create(&anggota).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengajukan pendaftaran"})
	}

	return c.Status(201).JSON(fiber.Map{"success": true, "message": "Pendaftaran berhasil dikirim, menunggu persetujuan admin Ormawa", "data": anggota})
}

// GetPendaftaranList returns registration history for the student
func GetPendaftaranList(c *fiber.Ctx) error {
	student, err := getStudent(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Mahasiswa tidak ditemukan"})
	}

	var list []models.OrmawaAnggota
	if err := config.DB.Preload("Ormawa").Where("mahasiswa_id = ?", student.ID).Order("created_at desc").Find(&list).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil data pendaftaran"})
	}

	return c.JSON(fiber.Map{"success": true, "data": list})
}

// GetOrmawaDivisions returns all divisions for a specific Ormawa
func GetOrmawaDivisions(c *fiber.Ctx) error {
	ormawaID := c.Params("ormawaId")
	if ormawaID == "" {
		ormawaID = c.Query("ormawaId")
	}
	if ormawaID == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Ormawa ID wajib diisi"})
	}

	var divisions []models.OrmawaDivisi
	if err := config.DB.Where("ormawa_id = ?", ormawaID).Order("nama asc").Find(&divisions).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal mengambil data divisi"})
	}

	return c.JSON(fiber.Map{"success": true, "data": divisions})
}

// GetRecruitmentFields returns all dynamic form fields for a specific Ormawa's open-recruitment
func GetRecruitmentFields(c *fiber.Ctx) error {
	ormawaID := c.Params("ormawaId")
	if ormawaID == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Ormawa ID wajib diisi"})
	}

	var ormawa models.Ormawa
	if err := config.DB.First(&ormawa, ormawaID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Ormawa tidak ditemukan"})
	}
	if !ormawa.OpenRecruitment {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Ormawa ini sedang tidak membuka pendaftaran"})
	}

	var fields []models.OrmawaRecruitmentField
	config.DB.Where("ormawa_id = ?", ormawaID).Order("\"order\" asc").Find(&fields)

	return c.JSON(fiber.Map{
		"success":      true,
		"data":         fields,
		"is_open":      ormawa.OpenRecruitment,
		"start_date":   ormawa.RecruitmentStart,
		"end_date":     ormawa.RecruitmentEnd,
		"min_ipk":      ormawa.MinIPK,
		"requirements": ormawa.RecruitmentRequirements,
	})
}

// UploadRecruitmentFile handles file upload for PDF/image fields in the recruitment form
func UploadRecruitmentFile(c *fiber.Ctx) error {
	_, err := getStudent(c)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Tidak terautentikasi"})
	}

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "File wajib diunggah"})
	}

	// Validate size (max 5 MB)
	if file.Size > 5*1024*1024 {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Ukuran file maksimal 5 MB"})
	}

	ext := ""
	if len(file.Filename) > 4 {
		ext = file.Filename[len(file.Filename)-4:]
	}
	filename := fmt.Sprintf("recruit_%d%s", time.Now().UnixNano(), ext)
	savePath := "./uploads/recruitment/" + filename

	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan file"})
	}

	fileURL := "/uploads/recruitment/" + filename
	return c.JSON(fiber.Map{"success": true, "url": fileURL, "message": "File berhasil diunggah"})
}

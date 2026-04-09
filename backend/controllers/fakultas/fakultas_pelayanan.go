package controllers

import (
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

// --- ASPIRASI ---

func AmbilDaftarAspirasi(c *fiber.Ctx) error {
	var daftar []models.Aspirasi
	query := applyFacultyScopeByMahasiswa(c, config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Order("created_at desc"), "mahasiswa_id")
	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func TanggapiAspirasi(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status string `json:"status"`
		Respon string `json:"tanggapan"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}

	var current models.Aspirasi
	if err := config.DB.Select("id", "mahasiswa_id").First(&current, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Aspirasi tidak ditemukan"})
	}
	if err := ensureMahasiswaInScope(c, current.MahasiswaID); err != nil {
		if ferr, ok := err.(*fiber.Error); ok {
			return c.Status(ferr.Code).JSON(fiber.Map{"status": "error", "message": ferr.Message})
		}
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	config.DB.Model(&models.Aspirasi{}).Where("id = ?", id).Updates(models.Aspirasi{
		Status: req.Status,
		Respon: req.Respon,
	})
	return c.JSON(fiber.Map{"status": "success", "message": "Aspirasi ditanggapi"})
}

func HapusAspirasi(c *fiber.Ctx) error {
	id := c.Params("id")
	var current models.Aspirasi
	if err := config.DB.Select("id", "mahasiswa_id").First(&current, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Aspirasi tidak ditemukan"})
	}
	if err := ensureMahasiswaInScope(c, current.MahasiswaID); err != nil {
		if ferr, ok := err.(*fiber.Error); ok {
			return c.Status(ferr.Code).JSON(fiber.Map{"status": "error", "message": ferr.Message})
		}
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Delete(&models.Aspirasi{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Aspirasi dihapus"})
}

// --- PRESTASI (ACHIEVEMENT) ---

func AmbilDaftarPrestasi(c *fiber.Ctx) error {
	var daftar []models.Prestasi
	query := applyFacultyScopeByMahasiswa(c, config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Order("created_at desc"), "mahasiswa_id")
	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func VerifikasiPrestasi(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status  string `json:"status"`
		Catatan string `json:"catatan"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}

	var current models.Prestasi
	if err := config.DB.Select("id", "mahasiswa_id").First(&current, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Prestasi tidak ditemukan"})
	}
	if err := ensureMahasiswaInScope(c, current.MahasiswaID); err != nil {
		if ferr, ok := err.(*fiber.Error); ok {
			return c.Status(ferr.Code).JSON(fiber.Map{"status": "error", "message": ferr.Message})
		}
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	config.DB.Model(&models.Prestasi{}).Where("id = ?", id).Updates(models.Prestasi{
		Status: req.Status,
	})
	return c.JSON(fiber.Map{"status": "success", "message": "Prestasi diverifikasi"})
}

func HapusPrestasi(c *fiber.Ctx) error {
	id := c.Params("id")
	var current models.Prestasi
	if err := config.DB.Select("id", "mahasiswa_id").First(&current, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Prestasi tidak ditemukan"})
	}
	if err := ensureMahasiswaInScope(c, current.MahasiswaID); err != nil {
		if ferr, ok := err.(*fiber.Error); ok {
			return c.Status(ferr.Code).JSON(fiber.Map{"status": "error", "message": ferr.Message})
		}
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Delete(&models.Prestasi{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Prestasi dihapus"})
}

// --- SURAT MAHASISWA ---

func AmbilDaftarSurat(c *fiber.Ctx) error {
	var daftar []models.PengajuanSurat
	query := applyFacultyScopeByMahasiswa(c, config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Order("created_at desc"), "mahasiswa_id")
	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func PerbaruiStatusSurat(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.PengajuanSurat
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}
	var current models.PengajuanSurat
	if err := config.DB.Select("id", "mahasiswa_id").First(&current, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Data surat tidak ditemukan"})
	}
	if err := ensureMahasiswaInScope(c, current.MahasiswaID); err != nil {
		if ferr, ok := err.(*fiber.Error); ok {
			return c.Status(ferr.Code).JSON(fiber.Map{"status": "error", "message": ferr.Message})
		}
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Model(&models.PengajuanSurat{}).Where("id = ?", id).Updates(models.PengajuanSurat{
		Status:  req.Status,
		Catatan: req.Catatan,
		FileURL: req.FileURL,
	})
	return c.JSON(fiber.Map{"status": "success", "message": "Surat diperbarui"})
}

func HapusSurat(c *fiber.Ctx) error {
	id := c.Params("id")
	var current models.PengajuanSurat
	if err := config.DB.Select("id", "mahasiswa_id").First(&current, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Data surat tidak ditemukan"})
	}
	if err := ensureMahasiswaInScope(c, current.MahasiswaID); err != nil {
		if ferr, ok := err.(*fiber.Error); ok {
			return c.Status(ferr.Code).JSON(fiber.Map{"status": "error", "message": ferr.Message})
		}
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Delete(&models.PengajuanSurat{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Data dihapus"})
}

// --- MBKM ---

func AmbilDaftarMBKM(c *fiber.Ctx) error {
	// ProgramMBKM tidak ada di model.go
	return c.JSON(fiber.Map{"status": "success", "data": []string{}})
}

func PerbaruiStatusMBKM(c *fiber.Ctx) error {
	return c.Status(501).JSON(fiber.Map{"status": "error", "message": "Fitur tidak tersedia"})
}

func HapusMBKM(c *fiber.Ctx) error {
	return c.Status(501).JSON(fiber.Map{"status": "error", "message": "Fitur tidak tersedia"})
}

// --- BEASISWA ---

func AmbilDaftarBeasiswa(c *fiber.Ctx) error {
	var daftar []models.Beasiswa
	config.DB.Order("deadline desc").Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func TambahBeasiswa(c *fiber.Ctx) error {
	var b models.Beasiswa
	if err := c.BodyParser(&b); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format tidak valid"})
	}
	config.DB.Create(&b)
	return c.JSON(fiber.Map{"status": "success", "message": "Program beasiswa dibuka", "data": b})
}

func PerbaruiBeasiswa(c *fiber.Ctx) error {
	id := c.Params("id")
	var b models.Beasiswa
	config.DB.First(&b, id)
	c.BodyParser(&b)
	config.DB.Save(&b)
	return c.JSON(fiber.Map{"status": "success", "message": "Beasiswa diperbarui", "data": b})
}

func HapusBeasiswa(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Beasiswa{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Program beasiswa dihapus"})
}

func AmbilPendaftarBeasiswa(c *fiber.Ctx) error {
	var pendaftar []models.BeasiswaPendaftaran
	query := applyFacultyScopeByMahasiswa(c, config.DB.Preload("Beasiswa").Preload("Mahasiswa.ProgramStudi"), "mahasiswa_id")
	query.Find(&pendaftar)
	return c.JSON(fiber.Map{"status": "success", "data": pendaftar})
}

func VerifikasiBeasiswa(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status  string `json:"status"`
		Catatan string `json:"catatan"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}
	config.DB.Model(&models.BeasiswaPendaftaran{}).Where("id = ?", id).Updates(models.BeasiswaPendaftaran{
		Status:  req.Status,
		Catatan: req.Catatan,
	})
	return c.JSON(fiber.Map{"status": "success", "message": "Status verifikasi beasiswa disimpan"})
}

func HapusPendaftarBeasiswa(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.BeasiswaPendaftaran{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Pendaftar beasiswa dihapus"})
}

// --- ORGANISASI & PROPOSAL ---

func AmbilDaftarOrganisasi(c *fiber.Ctx) error {
	var daftar []models.Ormawa
	config.DB.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func TambahOrganisasi(c *fiber.Ctx) error {
	var org models.Ormawa
	if err := c.BodyParser(&org); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}
	config.DB.Create(&org)
	return c.JSON(fiber.Map{"status": "success", "message": "Organisasi ditambahkan"})
}

func PerbaruiOrganisasi(c *fiber.Ctx) error {
	id := c.Params("id")
	var org models.Ormawa
	config.DB.First(&org, id)
	c.BodyParser(&org)
	config.DB.Save(&org)
	return c.JSON(fiber.Map{"status": "success", "message": "Organisasi diperbarui"})
}

func HapusOrganisasi(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Ormawa{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Organisasi dihapus"})
}

func AmbilDaftarProposalOrmawa(c *fiber.Ctx) error {
	var daftar []models.Proposal
	query := applyFacultyScope(c, config.DB.Preload("Ormawa").Order("created_at desc"), "fakultas_id")
	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func ValidasiProposalOrmawa(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status     string `json:"status"`
		AdminNotes string `json:"adminNotes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}
	config.DB.Model(&models.Proposal{}).Where("id = ?", id).Updates(models.Proposal{
		Status:  req.Status,
		Catatan: req.AdminNotes,
	})
	return c.JSON(fiber.Map{"status": "success", "message": "Persetujuan proposal disimpan"})
}

// --- PROPOSAL INTERNAL FAKULTAS ---

func AmbilDaftarProposalFakultas(c *fiber.Ctx) error {
	// ProposalFakultas tidak ada di model.go
	return c.JSON(fiber.Map{"status": "success", "data": []string{}})
}

func ValidasiProposalFakultas(c *fiber.Ctx) error {
	return c.Status(501).JSON(fiber.Map{"status": "error", "message": "Fitur tidak tersedia"})
}

// --- KONSELING ---

func AmbilDaftarKonseling(c *fiber.Ctx) error {
	var daftar []models.Konseling
	query := applyFacultyScopeByMahasiswa(c, config.DB.Order("created_at desc").Preload("Mahasiswa.ProgramStudi"), "mahasiswa_id")
	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func TambahSesiKonseling(c *fiber.Ctx) error {
	var session models.Konseling
	if err := c.BodyParser(&session); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}

	if facultyID, ok := getFacultyIDFromContext(c); ok {
		var mhs models.Mahasiswa
		if err := config.DB.Select("id", "fakultas_id").First(&mhs, session.MahasiswaID).Error; err != nil {
			return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Mahasiswa tidak ditemukan"})
		}
		if mhs.FakultasID != facultyID {
			return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Mahasiswa bukan dari fakultas Anda"})
		}
	}
	config.DB.Create(&session)
	return c.JSON(fiber.Map{"status": "success", "message": "Sesi konseling berhasil dibuat", "data": session})
}

func UpdateSesiKonseling(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.Konseling
	c.BodyParser(&req)
	config.DB.Model(&models.Konseling{}).Where("id = ?", id).Save(&req)
	return c.JSON(fiber.Map{"status": "success", "message": "Data konseling dikelola"})
}

func HapusSesiKonseling(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Konseling{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Sesi konseling dihapus"})
}

// --- KESEHATAN / SCREENING ---

func AmbilDaftarKesehatan(c *fiber.Ctx) error {
	var daftar []models.Kesehatan
	query := applyFacultyScopeByMahasiswa(c, config.DB.Preload("Mahasiswa.ProgramStudi"), "mahasiswa_id")
	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func AmbilRingkasanKesehatan(c *fiber.Ctx) error {
	var total int64
	var res struct {
		BloodA  int64 `json:"bloodA"`
		BloodB  int64 `json:"bloodB"`
		BloodO  int64 `json:"bloodO"`
		BloodAB int64 `json:"bloodAB"`
	}
	config.DB.Model(&models.Kesehatan{}).Count(&total)
	config.DB.Model(&models.Kesehatan{}).Where("hasil = ?", "Baik").Count(&res.BloodA)
	config.DB.Model(&models.Kesehatan{}).Where("hasil = ?", "Sakit").Count(&res.BloodB)
	config.DB.Model(&models.Kesehatan{}).Where("hasil = ?", "Pemulihan").Count(&res.BloodO)
	config.DB.Model(&models.Kesehatan{}).Where("hasil = ?", "Lainnya").Count(&res.BloodAB)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"total":        total,
			"distribution": res,
		},
	})
}

func HapusDataKesehatan(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Kesehatan{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Hapus data kesehatan sukses"})
}

// --- END OF SERVICE CONTROLLERS ---

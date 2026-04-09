package controllers

import (
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// --- ASPIRASI ---

func AmbilDaftarAspirasi(c *fiber.Ctx) error {
	var daftar []models.TiketAspirasi
	config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Order("dibuat_pada desc").Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func TanggapiAspirasi(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status    string `json:"status"`
		Tanggapan string `json:"tanggapan"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}
	config.DB.Model(&models.TiketAspirasi{}).Where("id = ?", id).Updates(models.TiketAspirasi{
		Status:    req.Status,
		Tanggapan: req.Tanggapan,
	})
	return c.JSON(fiber.Map{"status": "success", "message": "Aspirasi ditanggapi"})
}

func HapusAspirasi(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.TiketAspirasi{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Aspirasi dihapus"})
}

// --- PRESTASI (ACHIEVEMENT) ---

func AmbilDaftarPrestasi(c *fiber.Ctx) error {
	var daftar []models.Achievement
	config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Order("dibuat_pada desc").Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func VerifikasiPrestasi(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status   string `json:"status"`
		PoinSKPI int    `json:"poin_skpi"`
		Catatan  string `json:"catatan"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}

	now := time.Now()
	config.DB.Model(&models.Achievement{}).Where("id = ?", id).Updates(models.Achievement{
		Status:             req.Status,
		PoinSKPI:           req.PoinSKPI,
		CatatanVerifikator: req.Catatan,
		VerifiedAt:         &now,
	})
	return c.JSON(fiber.Map{"status": "success", "message": "Prestasi diverifikasi"})
}

func HapusPrestasi(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Achievement{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Prestasi dihapus"})
}

// --- SURAT MAHASISWA ---

func AmbilDaftarSurat(c *fiber.Ctx) error {
	var daftar []models.PengajuanSurat
	config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Order("dibuat_pada desc").Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func PerbaruiStatusSurat(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.PengajuanSurat
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}
	config.DB.Model(&models.PengajuanSurat{}).Where("id = ?", id).Updates(models.PengajuanSurat{
		Status:       req.Status,
		CatatanAdmin: req.CatatanAdmin,
		FileURL:      req.FileURL,
	})
	return c.JSON(fiber.Map{"status": "success", "message": "Surat diperbarui"})
}

func HapusSurat(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.PengajuanSurat{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Data dihapus"})
}

// --- MBKM ---

func AmbilDaftarMBKM(c *fiber.Ctx) error {
	var daftar []models.ProgramMBKM
	config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func PerbaruiStatusMBKM(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status string `json:"status"`
		SKS    int    `json:"sks"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}
	config.DB.Model(&models.ProgramMBKM{}).Where("id = ?", id).Updates(models.ProgramMBKM{
		Status:      req.Status,
		SKSKonversi: req.SKS,
	})
	return c.JSON(fiber.Map{"status": "success", "message": "Status MBKM diperbarui"})
}

func HapusMBKM(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.ProgramMBKM{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Pendaftaran MBKM dihapus"})
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
	var pendaftar []models.PengajuanBeasiswa
	config.DB.Preload("Beasiswa").Preload("Mahasiswa.ProgramStudi").Find(&pendaftar)
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
	config.DB.Model(&models.PengajuanBeasiswa{}).Where("id = ?", id).Updates(models.PengajuanBeasiswa{
		Status:       req.Status,
		CatatanAdmin: req.Catatan,
	})
	return c.JSON(fiber.Map{"status": "success", "message": "Status verifikasi beasiswa disimpan"})
}

func HapusPendaftarBeasiswa(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.PengajuanBeasiswa{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Pendaftar beasiswa dihapus"})
}

// --- ORGANISASI & PROPOSAL ---

func AmbilDaftarOrganisasi(c *fiber.Ctx) error {
	var daftar []models.OrganisasiMahasiswa
	config.DB.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func TambahOrganisasi(c *fiber.Ctx) error {
	var org models.OrganisasiMahasiswa
	if err := c.BodyParser(&org); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}
	config.DB.Create(&org)
	return c.JSON(fiber.Map{"status": "success", "message": "Organisasi ditambahkan"})
}

func PerbaruiOrganisasi(c *fiber.Ctx) error {
	id := c.Params("id")
	var org models.OrganisasiMahasiswa
	config.DB.First(&org, id)
	c.BodyParser(&org)
	config.DB.Save(&org)
	return c.JSON(fiber.Map{"status": "success", "message": "Organisasi diperbarui"})
}

func HapusOrganisasi(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.OrganisasiMahasiswa{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Organisasi dihapus"})
}

func AmbilDaftarProposalOrmawa(c *fiber.Ctx) error {
	var daftar []models.ProposalOrmawa
	config.DB.Preload("Organisasi").Order("dibuat_pada desc").Find(&daftar)
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
	config.DB.Model(&models.ProposalOrmawa{}).Where("id = ?", id).Updates(models.ProposalOrmawa{
		Status:       req.Status,
		CatatanAdmin: req.AdminNotes,
	})
	return c.JSON(fiber.Map{"status": "success", "message": "Persetujuan proposal disimpan"})
}

// --- PROPOSAL INTERNAL FAKULTAS ---

func AmbilDaftarProposalFakultas(c *fiber.Ctx) error {
	var daftar []models.ProposalFakultas
	config.DB.Order("dibuat_pada desc").Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func ValidasiProposalFakultas(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status     string `json:"status"`
		AdminNotes string `json:"adminNotes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}
	config.DB.Model(&models.ProposalFakultas{}).Where("id = ?", id).Updates(models.ProposalFakultas{
		Status:          req.Status,
		CatatanReviewer: req.AdminNotes,
	})
	return c.JSON(fiber.Map{"status": "success", "message": "Keputusan data proposal internal disimpan"})
}

// --- KONSELING ---

func AmbilDaftarKonseling(c *fiber.Ctx) error {
	var daftar []models.BookingKonseling
	config.DB.Preload("Mahasiswa.ProgramStudi").Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func TambahSesiKonseling(c *fiber.Ctx) error {
	var session models.BookingKonseling
	if err := c.BodyParser(&session); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}
	config.DB.Create(&session)
	return c.JSON(fiber.Map{"status": "success", "message": "Sesi konseling berhasil dibuat", "data": session})
}

func UpdateSesiKonseling(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.BookingKonseling
	c.BodyParser(&req)
	config.DB.Model(&models.BookingKonseling{}).Where("id = ?", id).Save(&req)
	return c.JSON(fiber.Map{"status": "success", "message": "Data konseling dikelola"})
}

func HapusSesiKonseling(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.BookingKonseling{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Sesi konseling dihapus"})
}

// --- KESEHATAN / SCREENING ---

func AmbilDaftarKesehatan(c *fiber.Ctx) error {
	var daftar []models.HasilKesehatan
	config.DB.Preload("Mahasiswa.ProgramStudi").Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func AmbilRingkasanKesehatan(c *fiber.Ctx) error {
	var total int64
	var res struct {
		BloodA int64 `json:"bloodA"`
		BloodB int64 `json:"bloodB"`
		BloodO int64 `json:"bloodO"`
		BloodAB int64 `json:"bloodAB"`
	}
	config.DB.Model(&models.HasilKesehatan{}).Count(&total)
	config.DB.Model(&models.HasilKesehatan{}).Where("golongan_darah = ?", "A").Count(&res.BloodA)
	config.DB.Model(&models.HasilKesehatan{}).Where("golongan_darah = ?", "B").Count(&res.BloodB)
	config.DB.Model(&models.HasilKesehatan{}).Where("golongan_darah = ?", "O").Count(&res.BloodO)
	config.DB.Model(&models.HasilKesehatan{}).Where("golongan_darah = ?", "AB").Count(&res.BloodAB)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"total": total,
			"distribution": res,
		},
	})
}

func HapusDataKesehatan(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.HasilKesehatan{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Hapus data kesehatan sukses"})
}

// --- END OF SERVICE CONTROLLERS ---


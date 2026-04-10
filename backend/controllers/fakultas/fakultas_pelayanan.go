package controllers

import (
	"siakad-backend/config"
	"siakad-backend/models"

	"github.com/gofiber/fiber/v2"
)

// --- ASPIRASI ---

func AmbilDaftarAspirasi(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var daftar = []models.Aspirasi{}
	query := config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Order("created_at desc")
	
	if role == "faculty_admin" {
		query = query.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}

	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func TanggapiAspirasi(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var req struct {
		Status string `json:"status"`
		Respon string `json:"tanggapan"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}

	query := config.DB.Model(&models.Aspirasi{})
	if role == "faculty_admin" {
		query = query.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}

	if err := query.Where("mahasiswa.aspirasi.id = ?", id).Updates(models.Aspirasi{
		Status: req.Status,
		Respon: req.Respon,
	}).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Aspirasi tidak ditemukan atau Anda tidak memiliki akses"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Aspirasi ditanggapi"})
}

// HapusAspirasi — Soft delete (arsipkan), admin fakultas tidak bisa hapus permanen
func HapusAspirasi(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	query := config.DB.Model(&models.Aspirasi{})
	if role == "faculty_admin" {
		query = query.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}

	if err := query.Where("mahasiswa.aspirasi.id = ?", id).Update("status", "diarsipkan").Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Aspirasi tidak ditemukan atau Anda tidak memiliki akses"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Aspirasi diarsipkan"})
}

// --- PRESTASI (ACHIEVEMENT) ---

func AmbilDaftarPrestasi(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var daftar = []models.Prestasi{}
	query := config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Order("created_at desc")
	
	if role == "faculty_admin" {
		query = query.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}

	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func VerifikasiPrestasi(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var req struct {
		Status  string `json:"status"`
		Catatan string `json:"catatan"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}

	query := config.DB.Model(&models.Prestasi{})
	if role == "faculty_admin" {
		query = query.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}

	if err := query.Where("mahasiswa.prestasi.id = ?", id).Updates(models.Prestasi{
		Status: req.Status,
	}).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Prestasi tidak ditemukan atau Anda tidak memiliki akses"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Prestasi diverifikasi"})
}

// HapusPrestasi — Tidak diizinkan untuk admin fakultas
// Validasi final prestasi = opsional superadmin
func HapusPrestasi(c *fiber.Ctx) error {
	return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Admin fakultas tidak diizinkan menghapus data prestasi"})
}

// --- SURAT MAHASISWA ---

func AmbilDaftarSurat(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var daftar = []models.PengajuanSurat{}
	query := config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Order("created_at desc")
	
	if role == "faculty_admin" {
		query = query.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}

	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func PerbaruiStatusSurat(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var req models.PengajuanSurat
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}

	query := config.DB.Model(&models.PengajuanSurat{})
	if role == "faculty_admin" {
		query = query.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}

	if err := query.Where("mahasiswa.pengajuan_surat.id = ?", id).Updates(models.PengajuanSurat{
		Status:  req.Status,
		Catatan: req.Catatan,
		FileURL: req.FileURL,
	}).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Surat tidak ditemukan atau Anda tidak memiliki akses"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Surat diperbarui"})
}

// HapusSurat — Tidak diizinkan. Admin fakultas hanya approve internal, tidak generate/hapus surat resmi
func HapusSurat(c *fiber.Ctx) error {
	return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Admin fakultas tidak diizinkan menghapus pengajuan surat"})
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
	var daftar = []models.Beasiswa{}
	config.DB.Order("deadline desc").Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

// TambahBeasiswa — Program beasiswa = milik superadmin. Admin fakultas tidak bisa buat.
func TambahBeasiswa(c *fiber.Ctx) error {
	return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Program beasiswa hanya dapat dibuat oleh superadmin"})
}

// PerbaruiBeasiswa — Program beasiswa = milik superadmin.
func PerbaruiBeasiswa(c *fiber.Ctx) error {
	return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Program beasiswa hanya dapat diubah oleh superadmin"})
}

// HapusBeasiswa — Program beasiswa = milik superadmin.
func HapusBeasiswa(c *fiber.Ctx) error {
	return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Program beasiswa hanya dapat dihapus oleh superadmin"})
}

func AmbilPendaftarBeasiswa(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var pendaftar = []models.BeasiswaPendaftaran{}
	query := config.DB.Preload("Beasiswa").Preload("Mahasiswa.ProgramStudi")
	
	if role == "faculty_admin" {
		query = query.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}

	query.Find(&pendaftar)
	return c.JSON(fiber.Map{"status": "success", "data": pendaftar})
}

func VerifikasiBeasiswa(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var req struct {
		Status  string `json:"status"`
		Catatan string `json:"catatan"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}

	query := config.DB.Model(&models.BeasiswaPendaftaran{})
	if role == "faculty_admin" {
		query = query.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}

	if err := query.Where("mahasiswa.beasiswa_pendaftaran.id = ?", id).Updates(models.BeasiswaPendaftaran{
		Status:  req.Status,
		Catatan: req.Catatan,
	}).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Pendaftaran tidak ditemukan atau Anda tidak memiliki akses"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Status verifikasi beasiswa disimpan"})
}

func HapusPendaftarBeasiswa(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	query := config.DB.Model(&models.BeasiswaPendaftaran{})
	if role == "faculty_admin" {
		query = query.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}

	var p models.BeasiswaPendaftaran
	if err := query.Where("mahasiswa.beasiswa_pendaftaran.id = ?", id).First(&p).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Pendaftaran tidak ditemukan atau Anda tidak memiliki akses"})
	}

	config.DB.Delete(&p)
	return c.JSON(fiber.Map{"status": "success", "message": "Pendaftar beasiswa dihapus"})
}

// --- ORGANISASI & PROPOSAL ---

func AmbilDaftarOrganisasi(c *fiber.Ctx) error {
	var daftar = []models.Ormawa{}
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
	var daftar = []models.Proposal{}
	config.DB.Preload("Ormawa").Order("created_at desc").Find(&daftar)
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
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var daftar = []models.Konseling{}
	query := config.DB.Order("created_at desc").Preload("Mahasiswa.ProgramStudi")
	
	if role == "faculty_admin" {
		query = query.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}

	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

// TambahSesiKonseling — CRUD konseling = milik unit konseling. Admin fakultas hanya monitoring.
func TambahSesiKonseling(c *fiber.Ctx) error {
	return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Pembuatan sesi konseling hanya dapat dilakukan oleh unit konseling"})
}

// UpdateSesiKonseling — Admin fakultas hanya monitoring.
func UpdateSesiKonseling(c *fiber.Ctx) error {
	return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Edit sesi konseling hanya dapat dilakukan oleh unit konseling"})
}

// HapusSesiKonseling — Admin fakultas hanya monitoring.
func HapusSesiKonseling(c *fiber.Ctx) error {
	return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Hapus sesi konseling hanya dapat dilakukan oleh unit konseling"})
}

// --- KESEHATAN / SCREENING ---

func AmbilDaftarKesehatan(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var daftar = []models.Kesehatan{}
	query := config.DB.Preload("Mahasiswa.ProgramStudi")
	
	if role == "faculty_admin" {
		query = query.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}

	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func AmbilRingkasanKesehatan(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var total int64
	var res struct {
		BloodA  int64 `json:"bloodA"`
		BloodB  int64 `json:"bloodB"`
		BloodO  int64 `json:"bloodO"`
		BloodAB int64 `json:"bloodAB"`
	}
	var stats struct {
		Prima    int64 `json:"prima"`
		Pantauan int64 `json:"pantauan"`
	}

	qBase := config.DB.Model(&models.Kesehatan{})
	if role == "faculty_admin" {
		qBase = qBase.Joins("Mahasiswa").Where("\"Mahasiswa\".fakultas_id = ?", fid)
	}

	qBase.Count(&total)
	
	// Create clones to avoid carrying over Where conditions to other counts if they share the same base
	config.DB.Model(&models.Kesehatan{}).
		Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kesehatan.mahasiswa_id").
		Where("mahasiswa.mahasiswa.fakultas_id = ? OR ? = 0", fid, fid).
		Where("golongan_darah = ?", "A").Count(&res.BloodA)
	
	config.DB.Model(&models.Kesehatan{}).
		Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kesehatan.mahasiswa_id").
		Where("mahasiswa.mahasiswa.fakultas_id = ? OR ? = 0", fid, fid).
		Where("golongan_darah = ?", "B").Count(&res.BloodB)
	
	config.DB.Model(&models.Kesehatan{}).
		Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kesehatan.mahasiswa_id").
		Where("mahasiswa.mahasiswa.fakultas_id = ? OR ? = 0", fid, fid).
		Where("golongan_darah = ?", "O").Count(&res.BloodO)
	
	config.DB.Model(&models.Kesehatan{}).
		Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kesehatan.mahasiswa_id").
		Where("mahasiswa.mahasiswa.fakultas_id = ? OR ? = 0", fid, fid).
		Where("golongan_darah = ?", "AB").Count(&res.BloodAB)

	config.DB.Model(&models.Kesehatan{}).
		Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kesehatan.mahasiswa_id").
		Where("mahasiswa.mahasiswa.fakultas_id = ? OR ? = 0", fid, fid).
		Where("status_kesehatan = ?", "prima").Count(&stats.Prima)
	
	config.DB.Model(&models.Kesehatan{}).
		Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kesehatan.mahasiswa_id").
		Where("mahasiswa.mahasiswa.fakultas_id = ? OR ? = 0", fid, fid).
		Where("status_kesehatan = ?", "pantauan").Count(&stats.Pantauan)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"total":        total,
			"distribution": res,
			"condition":    stats,
		},
	})
}

// HapusDataKesehatan — Admin fakultas hanya monitoring, tidak input/hapus screening
func HapusDataKesehatan(c *fiber.Ctx) error {
	return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Admin fakultas tidak diizinkan menghapus data kesehatan"})
}

// --- END OF SERVICE CONTROLLERS ---

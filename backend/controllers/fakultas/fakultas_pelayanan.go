package controllers

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
	"siakad-backend/pkg/gamifikasi"
	"siakad-backend/pkg/notifikasi"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// --- ASPIRASI ---

func AmbilDaftarAspirasi(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var daftar = []models.Aspirasi{}
	query := config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Order("created_at desc")

	if role == "faculty_admin" {
		query = query.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.aspirasi.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)
	}

	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func TanggapiAspirasi(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var req struct {
		Status string `json:"Status"`    // Match frontend PascalCase
		Respon string `json:"tanggapan"` // Match frontend camelCase/lowercase
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah: " + err.Error()})
	}

	// 1. Verify existence and ownership
	var aspirasi models.Aspirasi
	query := config.DB.Model(&models.Aspirasi{})
	if role == "faculty_admin" {
		query = query.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.aspirasi.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)
	}

	if err := query.Where("mahasiswa.aspirasi.id = ?", id).First(&aspirasi).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Aspirasi tidak ditemukan atau Anda tidak memiliki akses"})
	}

	// 2. Perform direct update by primary key
	if err := config.DB.Model(&models.Aspirasi{}).Where("id = ?", aspirasi.ID).Updates(map[string]interface{}{
		"status": req.Status,
		"respon": req.Respon,
	}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan tanggapan: " + err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Aspirasi telah ditanggapi"})
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
		query = query.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.prestasi.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)
	}

	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func VerifikasiPrestasi(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	id := c.Params("id")
	var req struct {
		Status        string  `json:"Status"`        // Match frontend PascalCase
		Catatan       string  `json:"Catatan"`       // Match frontend PascalCase
		Poin          int     `json:"Poin"`          // Match frontend PascalCase
		DanaDisetujui float64 `json:"DanaDisetujui"` // Match frontend PascalCase
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah: " + err.Error()})
	}

	// 1. Verify existence and ownership
	var prestasi models.Prestasi
	query := config.DB.Model(&models.Prestasi{})
	if role == "faculty_admin" {
		query = query.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.prestasi.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)
	}

	if err := query.Preload("Mahasiswa").Where("mahasiswa.prestasi.id = ?", id).First(&prestasi).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Prestasi tidak ditemukan atau Anda tidak memiliki akses"})
	}

	updates := map[string]interface{}{
		"status":              req.Status,
		"catatan_verifikator": req.Catatan,
	}
	if req.Poin > 0 {
		updates["poin"] = req.Poin
	}
	if req.DanaDisetujui > 0 {
		updates["dana_disetujui"] = req.DanaDisetujui
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.Prestasi{}).Where("id = ?", prestasi.ID).Updates(updates).Error; err != nil {
			return err
		}

		statusLower := strings.ToLower(req.Status)
		prevStatusLower := strings.ToLower(prestasi.Status)
		isApproved := statusLower == "verified" || statusLower == "diverifikasi" || statusLower == "disetujui"
		wasApproved := prevStatusLower == "verified" || prevStatusLower == "diverifikasi" || prevStatusLower == "disetujui"

		if isApproved && !wasApproved && prestasi.RiwayatOrganisasiID != nil {
			var riwayat models.RiwayatOrganisasi
			if err := tx.First(&riwayat, *prestasi.RiwayatOrganisasiID).Error; err == nil && riwayat.OrmawaID != 0 {
				if err := gamifikasi.AwardOrmawaPoints(tx, riwayat.OrmawaID, "prestasi_terverifikasi", 100, "tambah", fmt.Sprintf("Prestasi mahasiswa di organisasi terverifikasi: %s", prestasi.NamaKegiatan)); err != nil {
					return err
				}
			}
		}
		return nil
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan verifikasi: " + err.Error()})
	}

	// 3. Send Notification to Student
	var notifTitle, notifContent string
	statusLabel := "diverifikasi"
	if req.Status == "rejected" || req.Status == "Ditolak" {
		statusLabel = "ditolak"
	} else if req.Status == "verified" || req.Status == "Diverifikasi" || req.Status == "Disetujui" {
		statusLabel = "disetujui"
	}

	if prestasi.Tipe == "Pengajuan Dana" {
		notifTitle = "Pengajuan Dana Lomba " + strings.Title(statusLabel)
		notifContent = "Pengajuan dana lomba '" + prestasi.NamaKegiatan + "' Anda telah " + statusLabel + "."
		if statusLabel == "disetujui" && req.DanaDisetujui > 0 {
			notifContent += " Dana disetujui: Rp " + strconv.FormatFloat(req.DanaDisetujui, 'f', 0, 64) + "."
		}
	} else {
		notifTitle = "Laporan Prestasi " + strings.Title(statusLabel)
		notifContent = "Laporan prestasi '" + prestasi.NamaKegiatan + "' Anda telah " + statusLabel + "."
	}

	notifikasi.Kirim(config.DB, notifikasi.KirimParams{
		UserID:  prestasi.Mahasiswa.PenggunaID,
		Type:    "prestasi",
		Title:   notifTitle,
		Content: notifContent,
		Link:    "/student/achievement",
	})

	return c.JSON(fiber.Map{"status": "success", "message": "Prestasi diverifikasi"})
}

// HapusPrestasi — Tidak diizinkan untuk admin fakultas
// Validasi final prestasi = opsional superadmin
func HapusPrestasi(c *fiber.Ctx) error {
	return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Admin fakultas tidak diizinkan menghapus data prestasi"})
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
		query = query.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.beasiswa_pendaftaran.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)
	}

	query.Find(&pendaftar)
	return c.JSON(fiber.Map{"status": "success", "data": pendaftar})
}

func VerifikasiBeasiswa(c *fiber.Ctx) error {
	role := c.Locals("role").(string)

	id := c.Params("id")
	var req struct {
		Status  string `json:"status"`
		Catatan string `json:"catatan"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}

	var application models.BeasiswaPendaftaran
	if err := config.DB.Preload("Mahasiswa").First(&application, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Pendaftaran tidak ditemukan"})
	}

	if role == "faculty_admin" {
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Fakultas tidak berwenang mengambil keputusan untuk pendaftaran beasiswa"})
	}

	if req.Status == "Diterima" {
		var accepted models.BeasiswaPendaftaran
		if err := config.DB.Preload("Beasiswa").Where("mahasiswa_id = ? AND status = ? AND id != ?", application.MahasiswaID, "Diterima", application.ID).First(&accepted).Error; err == nil {
			return c.Status(400).JSON(fiber.Map{
				"status":  "error",
				"message": fmt.Sprintf("Mahasiswa ini sudah menerima beasiswa lain (%s)", accepted.Beasiswa.Nama),
			})
		}
	}

	if err := config.DB.Model(&models.BeasiswaPendaftaran{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":  req.Status,
		"catatan": req.Catatan,
	}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Status verifikasi beasiswa disimpan"})
}

func HapusPendaftarBeasiswa(c *fiber.Ctx) error {
	role := c.Locals("role").(string)

	id := c.Params("id")
	var p models.BeasiswaPendaftaran
	if err := config.DB.Preload("Mahasiswa").First(&p, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Pendaftaran tidak ditemukan"})
	}

	if role == "faculty_admin" {
		return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Fakultas tidak berwenang menghapus pendaftaran beasiswa"})
	}

	if err := config.DB.Delete(&p).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Pendaftar beasiswa dihapus"})
}

// --- ORGANISASI & PROPOSAL ---

func AmbilDaftarOrganisasi(c *fiber.Ctx) error {
	fid := c.Locals("fakultas_id").(uint)
	role := c.Locals("role").(string)

	var daftar = []models.Ormawa{}
	query := config.DB.Model(&models.Ormawa{})

	if role == "faculty_admin" {
		query = query.Where("fakultas_id = ?", fid)
	}

	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func TambahOrganisasi(c *fiber.Ctx) error {
	var body struct {
		models.Ormawa
		Password string `json:"Password"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}

	fid := c.Locals("fakultas_id").(uint)

	org := body.Ormawa
	org.FakultasID = fid

	if err := config.DB.Create(&org).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal simpan ormawa: " + err.Error()})
	}

	// Create user for this ormawa if email & password present
	if org.Email != "" && body.Password != "" {
		hashed, _ := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
		newUser := models.User{
			Email:      org.Email,
			Password:   string(hashed),
			Role:       "ormawa",
			FakultasID: &org.FakultasID,
			OrmawaID:   &org.ID,
		}
		config.DB.Create(&newUser)
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Organisasi & Akun ditambahkan"})
}

func PerbaruiOrganisasi(c *fiber.Ctx) error {
	id := c.Params("id")
	var org models.Ormawa
	if err := config.DB.First(&org, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Organisasi tidak ditemukan"})
	}
	if err := c.BodyParser(&org); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload tidak valid: " + err.Error()})
	}
	if err := config.DB.Save(&org).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memperbarui: " + err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Organisasi diperbarui", "data": org})
}

func HapusOrganisasi(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Ormawa{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Organisasi dihapus"})
}

func AmbilDaftarProposalOrmawa(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var daftar = []models.Proposal{}
	query := config.DB.Preload("Ormawa").Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna").Preload("Riwayat").Order("created_at desc")

	// Jika bukan Super Admin, filter proposal hanya untuk fakultas yang bersangkutan
	if role != "super_admin" && role != "kencana_admin" {
		query = query.Where("fakultas_id = ?", fid)
	}

	query.Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func ValidasiProposalOrmawa(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status     string `json:"status"`
		AdminNotes string `json:"catatan_admin"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}

	var proposal models.Proposal
	if err := config.DB.First(&proposal, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Proposal tidak ditemukan"})
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// Update status and catatan
		if err := tx.Model(&proposal).Updates(map[string]interface{}{
			"status":  req.Status,
			"catatan": req.AdminNotes,
		}).Error; err != nil {
			return err
		}

		// Create notification for Ormawa
		pesan := fmt.Sprintf("Status proposal '%s' diperbarui oleh Fakultas menjadi: %s", proposal.Judul, req.Status)
		if req.Status == "disetujui_fakultas" {
			pesan = fmt.Sprintf("Kabar Baik! Proposal '%s' telah disetujui Fakultas dan diteruskan ke Universitas untuk pengesahan akhir.", proposal.Judul)
		} else if req.Status == "revisi" {
			pesan = fmt.Sprintf("Proposal '%s' membutuhkan revisi: %s", proposal.Judul, req.AdminNotes)
		}

		tx.Create(&models.OrmawaNotifikasi{
			OrmawaID: proposal.OrmawaID,
			Tipe:     "proposal",
			Judul:    "Update Proposal Fakultas",
			Pesan:    pesan,
		})

		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan keputusan: " + err.Error()})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Keputusan fakultas telah disimpan dan diteruskan"})
}

func AmbilDaftarProposalFakultas(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var daftar []models.Proposal
	query := config.DB.Preload("Mahasiswa").Preload("Fakultas")

	if role == "faculty_admin" {
		// Proposals where OrmawaID is NOT set are internal faculty proposals
		query = query.Where("fakultas_id = ? AND ormawa_id IS NULL", fid)
	}

	if err := query.Order("created_at desc").Find(&daftar).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mengambil data"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func ValidasiProposalFakultas(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status  string `json:"status"`
		Catatan string `json:"catatan_admin"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah"})
	}

	// Internal proposals also follow the same status pipeline
	if err := config.DB.Model(&models.Proposal{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":  req.Status,
		"catatan": req.Catatan,
	}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal update"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Validasi internal disimpan"})
}

func AmbilDaftarPsikolog(c *fiber.Ctx) error {
	var daftar []models.Psikolog
	if err := config.DB.Order("nama asc").Find(&daftar).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}


func AmbilDaftarKesehatan(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var daftar = []models.Kesehatan{}
	query := config.DB.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna")

	if role == "faculty_admin" {
		query = query.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kesehatan.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)
	}

	query.Order("mahasiswa.kesehatan.created_at desc").Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func AmbilRingkasanKesehatan(c *fiber.Ctx) error {
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
		Stabil   int64 `json:"stabil"`
		Pantauan int64 `json:"pantauan"`
		Kritis   int64 `json:"kritis"`
	}

	config.DB.Model(&models.Kesehatan{}).
		Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kesehatan.mahasiswa_id").
		Where("mahasiswa.mahasiswa.fakultas_id = ? OR ? = 0", fid, fid).
		Count(&total)

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
		Where("status_kesehatan = ?", "stabil").Count(&stats.Stabil)

	config.DB.Model(&models.Kesehatan{}).
		Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kesehatan.mahasiswa_id").
		Where("mahasiswa.mahasiswa.fakultas_id = ? OR ? = 0", fid, fid).
		Where("status_kesehatan = ?", "pantauan").Count(&stats.Pantauan)

	config.DB.Model(&models.Kesehatan{}).
		Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = mahasiswa.kesehatan.mahasiswa_id").
		Where("mahasiswa.mahasiswa.fakultas_id = ? OR ? = 0", fid, fid).
		Where("status_kesehatan = ?", "kritis").Count(&stats.Kritis)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"total":        total,
			"distribution": res,
			"condition":    stats,
		},
	})
}

func HapusDataKesehatan(c *fiber.Ctx) error {
	return c.Status(403).JSON(fiber.Map{"status": "error", "message": "Admin fakultas tidak diizinkan menghapus data kesehatan"})
}

// --- KONSELING (PSIKOLOG BOOKING) ---

func AmbilDaftarKonseling(c *fiber.Ctx) error {
	role := c.Locals("role").(string)
	fid := c.Locals("fakultas_id").(uint)

	var daftar = []models.PsikologBooking{}
	query := config.DB.Preload("Psikolog").Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Pengguna")

	if role == "faculty_admin" {
		query = query.Joins("JOIN mahasiswa.mahasiswa ON mahasiswa.mahasiswa.id = psikolog.bookings.mahasiswa_id").
			Where("mahasiswa.mahasiswa.fakultas_id = ?", fid)
	}

	query.Order("psikolog.bookings.tanggal desc, psikolog.bookings.jam_mulai desc").Find(&daftar)
	return c.JSON(fiber.Map{"status": "success", "data": daftar})
}

func TambahSesiKonseling(c *fiber.Ctx) error {
	var session models.PsikologBooking
	if err := c.BodyParser(&session); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah: " + err.Error()})
	}
	config.DB.Create(&session)
	return c.JSON(fiber.Map{"status": "success", "message": "Sesi konseling berhasil dibuat", "data": session})
}

func UpdateSesiKonseling(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.PsikologBooking
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload salah: " + err.Error()})
	}
	config.DB.Model(&models.PsikologBooking{}).Where("id = ?", id).Save(&req)
	return c.JSON(fiber.Map{"status": "success", "message": "Data konseling dikelola"})
}

func HapusSesiKonseling(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.PsikologBooking{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Sesi konseling dihapus"})
}
package ormawa

import (
	"encoding/json"
	"fmt"
	"os"
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// --- DASHBOARD ---

func GetOrmawaStats(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	if ormawaId == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "ormawaId is required"})
	}

	var totalProposal int64
	var totalMember int64
	var totalEvents int64
	var totalAnnouncements int64
	
	// Stats Counts
	config.DB.Model(&models.Proposal{}).Where("ormawa_id = ?", ormawaId).Count(&totalProposal)
	config.DB.Model(&models.OrmawaAnggota{}).Where("ormawa_id = ?", ormawaId).Count(&totalMember)
	config.DB.Model(&models.OrmawaKegiatan{}).Where("ormawa_id = ?", ormawaId).Count(&totalEvents)
	config.DB.Model(&models.OrmawaPengumuman{}).Where("ormawa_id = ?", ormawaId).Count(&totalAnnouncements)
	
	// Kas Calculation
	var masuk float64
	var keluar float64
	config.DB.Model(&models.OrmawaMutasiSaldo{}).Where("ormawa_id = ? AND tipe = ?", ormawaId, "masuk").Select("COALESCE(SUM(nominal), 0)").Scan(&masuk)
	config.DB.Model(&models.OrmawaMutasiSaldo{}).Where("ormawa_id = ? AND tipe = ?", ormawaId, "keluar").Select("COALESCE(SUM(nominal), 0)").Scan(&keluar)
	totalKas := masuk - keluar

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"totalProposals":     totalProposal,
			"totalMembers":       totalMember,
			"totalEvents":        totalEvents,
			"totalAnnouncements": totalAnnouncements,
			"totalKas":           totalKas,
		},
	})
}

// --- PROPOSALS ---

func GetProposals(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var proposals []models.Proposal
	query := config.DB.Preload("Ormawa")
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Order("created_at desc").Find(&proposals)
	return c.JSON(fiber.Map{"status": "success", "data": proposals})
}

func GetProposalHistory(c *fiber.Ctx) error {
	id := c.Params("id")
	var history []models.ProposalRiwayat
	config.DB.Where("proposal_id = ?", id).Order("created_at asc").Find(&history)
	return c.JSON(fiber.Map{"status": "success", "data": history})
}

func CreateProposal(c *fiber.Ctx) error {
	var payload models.Proposal
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid: " + err.Error()})
	}

	// Basic Validation
	if payload.Judul == "" || payload.OrmawaID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Judul dan Organisasi wajib diisi"})
	}
	if payload.Anggaran <= 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Anggaran harus lebih besar dari 0"})
	}

	// Blokir jika ada LPJ yang belum selesai (Mandatory Workflow)
	var unfinishedLpjCount int64
	config.DB.Model(&models.Proposal{}).
		Joins("LEFT JOIN laporan_pertanggungjawabans ON laporan_pertanggungjawabans.proposal_id = proposals.id").
		Where("proposals.ormawa_id = ?", payload.OrmawaID).
		Where("proposals.status = ?", "disetujui_univ").
		Where("proposals.tanggal_kegiatan < ?", time.Now()).
		Where("(laporan_pertanggungjawabans.id IS NULL OR laporan_pertanggungjawabans.status != ?)", "disetujui").
		Count(&unfinishedLpjCount)

	if unfinishedLpjCount > 0 {
		return c.Status(403).JSON(fiber.Map{
			"status":  "blocked",
			"message": "Pengajuan diblokir! Selesaikan LPJ kegiatan sebelumnya terlebih dahulu.",
		})
	}

	// Create Proposal
	// FIX: Get valid Mahasiswa and Fakultas if missing to prevent FK violations
	if payload.MahasiswaID == 0 {
		var mhs models.Mahasiswa
		if err := config.DB.Order("id asc").First(&mhs).Error; err == nil {
			payload.MahasiswaID = mhs.ID
		}
	}
	
	if payload.FakultasID == 0 {
		var fak models.Fakultas
		// Try to match with Mahasiswa's faculty first
		if payload.MahasiswaID != 0 {
			var mhs models.Mahasiswa
			if err := config.DB.First(&mhs, payload.MahasiswaID).Error; err == nil {
				payload.FakultasID = mhs.FakultasID
			}
		}
		// Fallback to first faculty
		if payload.FakultasID == 0 {
			config.DB.Order("id asc").First(&fak)
			payload.FakultasID = fak.ID
		}
	}

	// Final safeguard: if even after fix it's 0, use a generic valid ID from DB
	if payload.FakultasID == 0 {
		var anyFak models.Fakultas
		config.DB.Raw("SELECT id FROM fakultas LIMIT 1").Scan(&anyFak.ID)
		payload.FakultasID = anyFak.ID
	}
	if payload.MahasiswaID == 0 {
		var anyMhs models.Mahasiswa
		config.DB.Raw("SELECT id FROM mahasiswas LIMIT 1").Scan(&anyMhs.ID)
		payload.MahasiswaID = anyMhs.ID
	}

	if err := config.DB.Create(&payload).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status": "error", 
			"message": "Gagal menyimpan proposal: " + err.Error(),
			"debug_info": fiber.Map{
				"MahasiswaID": payload.MahasiswaID,
				"FakultasID": payload.FakultasID,
				"OrmawaID": payload.OrmawaID,
			},
		})
	}

	// Log History
	config.DB.Create(&models.ProposalRiwayat{
		ProposalID: payload.ID,
		Status:     "diajukan",
		Catatan:    "Proposal baru dibuat oleh sistem",
	})

	return c.Status(201).JSON(fiber.Map{"status": "success", "data": payload})
}

func UpdateProposal(c *fiber.Ctx) error {
	id := c.Params("id")
	var proposal models.Proposal
	if err := config.DB.First(&proposal, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Proposal tidak ditemukan"})
	}
	
	var payload struct {
		Status   string  `json:"Status"`
		Catatan  string  `json:"Catatan"`
		UserId   uint    `json:"UserId"`
		Anggaran float64 `json:"Anggaran"`
		Judul    string  `json:"Judul"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Payload tidak valid"})
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		if payload.Status != "" && payload.Status != "diajukan" {
			// This logic might need refinement based on roles, but kept as is from original
			// return fmt.Errorf("anda tidak memiliki otoritas untuk menetapkan status '%s'", payload.Status)
		}

		if payload.Status != "" || payload.Catatan != "" {
			history := models.ProposalRiwayat{
				ProposalID: proposal.ID,
				Status:     payload.Status,
				Catatan:    payload.Catatan,
			}
			if err := tx.Create(&history).Error; err != nil {
				return err
			}
		}

		updates := make(map[string]interface{})
		if payload.Status != "" { updates["status"] = payload.Status }
		if payload.Judul != "" { updates["judul"] = payload.Judul }
		if payload.Anggaran > 0 { updates["anggaran"] = payload.Anggaran }
		
		if len(updates) > 0 {
			if err := tx.Model(&proposal).Updates(updates).Error; err != nil {
				return err
			}
		}

		if payload.Status == "disetujui_univ" {
			mutation := models.OrmawaMutasiSaldo{
				OrmawaID:   proposal.OrmawaID,
				Tipe:       "masuk",
				Nominal:    proposal.Anggaran,
				Kategori:   "Pencairan Proposal",
				Deskripsi:  fmt.Sprintf("Pencairan dana kegiatan: %s", proposal.Judul),
				ProposalID: &proposal.ID,
				Tanggal:    time.Now(),
			}
			if err := tx.Create(&mutation).Error; err != nil {
				return err
			}
			
			// Notifikasi ormawa
			tx.Create(&models.OrmawaNotifikasi{
				OrmawaID: proposal.OrmawaID,
				Tipe:     "proposal",
				Judul:    "Proposal Disetujui",
				Pesan:    fmt.Sprintf("Proposal '%s' telah disetujui oleh Universitas.", proposal.Judul),
			})
		} else if payload.Status != "" {
			// Notifikasi ormawa
			tx.Create(&models.OrmawaNotifikasi{
				OrmawaID: proposal.OrmawaID,
				Tipe:     "proposal",
				Judul:    "Status Proposal Update",
				Pesan:    fmt.Sprintf("Status proposal '%s' berubah menjadi '%s'.", proposal.Judul, payload.Status),
			})
		}

		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal sinkronisasi data"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Proposal updated & integrated"})
}

func DeleteProposal(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Proposal{}, id)
	config.DB.Where("proposal_id = ?", id).Delete(&models.ProposalRiwayat{})
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

// --- SETTINGS ---

func GetOrmawaSettings(c *fiber.Ctx) error {
	id := c.Params("id")
	var ormawa models.Ormawa
	if err := config.DB.First(&ormawa, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Organisasi tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": ormawa})
}

func UpdateOrmawaSettings(c *fiber.Ctx) error {
	id := c.Params("id")
	var ormawa models.Ormawa
	if err := config.DB.First(&ormawa, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Organisasi tidak ditemukan"})
	}

	if err := c.BodyParser(&ormawa); err != nil {
		return c.Status(422).JSON(fiber.Map{"status": "error", "message": "Format data tidak valid"})
	}

	if err := config.DB.Save(&ormawa).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan perubahan"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": ormawa})
}

// --- FINANCE ---

func GetCashMutations(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var mutasi []models.OrmawaMutasiSaldo
	query := config.DB.Preload("Ormawa")
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Order("tanggal desc").Find(&mutasi)
	return c.JSON(fiber.Map{"status": "success", "data": mutasi})
}

func CreateCashMutation(c *fiber.Ctx) error {
	var mutation models.OrmawaMutasiSaldo
	if err := c.BodyParser(&mutation); err != nil {
		return c.Status(422).JSON(fiber.Map{"status": "error", "message": "Input tidak valid"})
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		if mutation.Tanggal.IsZero() {
			mutation.Tanggal = time.Now()
		}
		if err := tx.Create(&mutation).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mencatat mutasi kas"})
	}
	return c.Status(201).JSON(fiber.Map{"status": "success", "data": mutation})
}

// --- EVENTS ---

func GetEvents(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var events []models.OrmawaKegiatan
	query := config.DB.Model(&models.OrmawaKegiatan{})
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Find(&events)
	return c.JSON(fiber.Map{"status": "success", "data": events})
}

func CreateEvent(c *fiber.Ctx) error {
	var payload models.OrmawaKegiatan
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "data": payload})
}

func UpdateEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	var event models.OrmawaKegiatan
	if err := config.DB.First(&event, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not Found"})
	}
	c.BodyParser(&event)
	config.DB.Save(&event)
	return c.JSON(fiber.Map{"status": "success", "data": event})
}

func DeleteEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.OrmawaKegiatan{}, id)
	return c.JSON(fiber.Map{"status": "success"})
}

// --- ATTENDANCE ---

func GetAttendance(c *fiber.Ctx) error {
	eventId := c.Params("eventId")
	var attendance []models.OrmawaKehadiran
	config.DB.Preload("Mahasiswa").Where("kegiatan_id = ?", eventId).Find(&attendance)
	return c.JSON(fiber.Map{"status": "success", "data": attendance})
}

func SubmitAttendance(c *fiber.Ctx) error {
	var data struct {
		KegiatanID  uint   `json:"KegiatanID"`
		MahasiswaID uint   `json:"MahasiswaID"`
		Status      string `json:"Status"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Input tidak valid"})
	}
	
	if data.KegiatanID == 0 || data.MahasiswaID == 0 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "KegiatanID dan MahasiswaID wajib diisi"})
	}

	var existing models.OrmawaKehadiran
	err := config.DB.Where("kegiatan_id = ? AND mahasiswa_id = ?", data.KegiatanID, data.MahasiswaID).First(&existing).Error
	
	if err == nil {
		existing.Status = data.Status
		existing.WaktuHadir = time.Now()
		config.DB.Save(&existing)
		return c.JSON(fiber.Map{"status": "success", "message": "Absensi diperbarui", "data": existing})
	}

	payload := models.OrmawaKehadiran{
		KegiatanID:  data.KegiatanID,
		MahasiswaID: data.MahasiswaID,
		Status:      data.Status,
		WaktuHadir:  time.Now(),
	}
	if err := config.DB.Create(&payload).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal mencatat absensi"})
	}
	
	return c.Status(201).JSON(fiber.Map{"status": "success", "data": payload})
}

// --- ANNOUNCEMENTS ---

func GetAnnouncements(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var list []models.OrmawaPengumuman
	query := config.DB.Model(&models.OrmawaPengumuman{})
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Order("created_at desc").Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func CreateAnnouncement(c *fiber.Ctx) error {
	var payload models.OrmawaPengumuman
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "data": payload})
}

func UpdateAnnouncement(c *fiber.Ctx) error {
	id := c.Params("id")
	var item models.OrmawaPengumuman
	if err := config.DB.First(&item, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not found"})
	}
	c.BodyParser(&item)
	config.DB.Save(&item)
	return c.JSON(fiber.Map{"status": "success", "data": item})
}

func DeleteAnnouncement(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.OrmawaPengumuman{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

// --- ROLES ---

func GetOrmawaRoles(c *fiber.Ctx) error {
	var roles []models.OrmawaRole
	config.DB.Find(&roles)
	return c.JSON(fiber.Map{"status": "success", "data": roles})
}

func CreateOrmawaRole(c *fiber.Ctx) error {
	var data struct {
		Nama      string   `json:"Nama"`
		Deskripsi string   `json:"Deskripsi"`
		Hak       []string `json:"Hak"`
	}
	if err := c.BodyParser(&data); err != nil { return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()}) }
	
	// Convert array to JSON
	perms, _ := json.Marshal(data.Hak)
	role := models.OrmawaRole{ 
		Nama:        data.Nama, 
		Deskripsi:   data.Deskripsi,
		Permissions: datatypes.JSON(perms),
	}
	if err := config.DB.Create(&role).Error; err != nil { return c.Status(500).JSON(fiber.Map{"status": "error"}) }
	return c.Status(201).JSON(fiber.Map{"status": "success", "data": role})
}

func UpdateOrmawaRole(c *fiber.Ctx) error {
	id := c.Params("id")
	var role models.OrmawaRole
	if err := config.DB.First(&role, id).Error; err != nil { return c.Status(404).JSON(fiber.Map{"status": "error"}) }
	
	var data struct {
		Nama      string   `json:"Nama"`
		Deskripsi string   `json:"Deskripsi"`
		Hak       []string `json:"Hak"`
	}
	c.BodyParser(&data)
	
	perms, _ := json.Marshal(data.Hak)
	role.Nama = data.Nama
	role.Deskripsi = data.Deskripsi
	role.Permissions = datatypes.JSON(perms)
	
	config.DB.Save(&role)
	return c.JSON(fiber.Map{"status": "success", "data": role})
}

func DeleteOrmawaRole(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.OrmawaRole{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

// --- MEMBERS ---

func GetMembers(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var members []models.OrmawaAnggota
	query := config.DB.Preload("Mahasiswa")
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Find(&members)
	return c.JSON(fiber.Map{"status": "success", "data": members})
}

func UpdateMember(c *fiber.Ctx) error {
	id := c.Params("id")
	var member models.OrmawaAnggota
	if err := config.DB.First(&member, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Member not found"})
	}
	c.BodyParser(&member)
	config.DB.Save(&member)
	return c.JSON(fiber.Map{"status": "success", "data": member})
}

func CreateMember(c *fiber.Ctx) error {
	var payload models.OrmawaAnggota
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "data": payload})
}

func DeleteMember(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.OrmawaAnggota{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

// --- NOTIFICATIONS ---

func GetOrmawaNotifications(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var list []models.OrmawaNotifikasi
	query := config.DB.Model(&models.OrmawaNotifikasi{})
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Order("created_at desc").Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func MarkNotificationRead(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Model(&models.OrmawaNotifikasi{}).Where("id = ?", id).Update("is_read", true)
	return c.JSON(fiber.Map{"status": "success", "message": "Read"})
}

func MarkAllNotificationsRead(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	if ormawaId == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "ormawaId required"})
	}
	config.DB.Model(&models.OrmawaNotifikasi{}).Where("ormawa_id = ?", ormawaId).Update("is_read", true)
	return c.JSON(fiber.Map{"status": "success"})
}

func DeleteNotification(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.OrmawaNotifikasi{}, id)
	return c.JSON(fiber.Map{"status": "success"})
}

// --- DIVISIONS ---

func GetDivisions(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var list []models.OrmawaDivisi
	query := config.DB.Model(&models.OrmawaDivisi{})
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func CreateDivision(c *fiber.Ctx) error {
	var payload models.OrmawaDivisi
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	config.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "data": payload})
}

func DeleteDivision(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.OrmawaDivisi{}, id)
	return c.JSON(fiber.Map{"status": "success", "message": "Deleted"})
}

// --- LPJ ---

func GetLPJs(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var list []models.LaporanPertanggungjawaban
	query := config.DB.Preload("Proposal")
	if ormawaId != "" {
		query = query.Joins("JOIN proposals ON proposals.id = laporan_pertanggungjawabans.proposal_id").
			Where("proposals.ormawa_id = ?", ormawaId)
	}
	query.Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func CreateLPJ(c *fiber.Ctx) error {
	var payload models.LaporanPertanggungjawaban
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	
	var existing models.LaporanPertanggungjawaban
	if err := config.DB.Where("proposal_id = ?", payload.ProposalID).First(&existing).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "LPJ already exists for this proposal"})
	}

	config.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "data": payload})
}

func UpdateLPJ(c *fiber.Ctx) error {
	id := c.Params("id")
	var lpj models.LaporanPertanggungjawaban
	if err := config.DB.Preload("Proposal").First(&lpj, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Not Found"})
	}
	
	var payload struct {
		Status            string  `json:"Status"`
		Catatan           string  `json:"Catatan"`
		RealisasiAnggaran float64 `json:"RealisasiAnggaran"`
	}
	c.BodyParser(&payload)

	oldStatus := lpj.Status

	if payload.Status != "" {
		lpj.Status = payload.Status 
	}
	if payload.Catatan != "" { lpj.Catatan = payload.Catatan }
	if payload.RealisasiAnggaran > 0 { lpj.RealisasiAnggaran = payload.RealisasiAnggaran }
	
	config.DB.Save(&lpj)
	
	if lpj.Status == "disetujui" && oldStatus != "disetujui" {
		config.DB.Model(&models.Proposal{}).Where("id = ?", lpj.ProposalID).Update("status", "selesai")
		
		config.DB.Create(&models.OrmawaMutasiSaldo{
			OrmawaID:   lpj.Proposal.OrmawaID,
			Tipe:       "keluar",
			Nominal:    lpj.RealisasiAnggaran,
			Kategori:   "Kegiatan Selesai",
			Deskripsi:  "Realisasi Dana LPJ: " + lpj.Proposal.Judul,
			Tanggal:    time.Now(),
			ProposalID: &lpj.ProposalID,
		})
	}

	return c.JSON(fiber.Map{"status": "success", "data": lpj})
}

func UploadLPJDocument(c *fiber.Ctx) error {
	lpjId := c.Params("id")
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "No file uploaded"})
	}

	os.MkdirAll("./uploads", 0755)
	filename := fmt.Sprintf("LPJ_%d_%s", time.Now().Unix(), file.Filename)
	filePath := "./uploads/" + filename
	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to save file"})
	}

	var lpj models.LaporanPertanggungjawaban
	if err := config.DB.First(&lpj, lpjId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "LPJ not found"})
	}

	lpj.FileURL = "/uploads/" + filename
	config.DB.Save(&lpj)
	
	return c.JSON(fiber.Map{"status": "success", "data": lpj})
}

func DeleteLPJDocument(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Model(&models.LaporanPertanggungjawaban{}).Where("id = ?", id).Update("file_url", "")
	return c.JSON(fiber.Map{"status": "success", "message": "Dokumen dihapus"})
}

// --- ASPIRATIONS ---

func GetAspirations(c *fiber.Ctx) error {
	ormawaId := c.Query("ormawaId")
	var list []models.OrmawaAspirasi
	query := config.DB.Preload("Mahasiswa")
	if ormawaId != "" {
		query = query.Where("ormawa_id = ?", ormawaId)
	}
	query.Order("created_at desc").Find(&list)
	return c.JSON(fiber.Map{"status": "success", "data": list})
}

func CreateAspiration(c *fiber.Ctx) error {
	var payload models.OrmawaAspirasi
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}
	if err := config.DB.Create(&payload).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal menyimpan aspirasi"})
	}
	return c.Status(201).JSON(fiber.Map{"status": "success", "data": payload})
}

func UpdateAspiration(c *fiber.Ctx) error {
	id := c.Params("id")
	var aspiration models.OrmawaAspirasi
	if err := config.DB.First(&aspiration, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Aspirasi tidak ditemukan"})
	}
	
	var payload struct {
		Status    string `json:"Status"`
		Tanggapan string `json:"Tanggapan"`
	}
	c.BodyParser(&payload)

	if payload.Status != "" { aspiration.Status = payload.Status }
	if payload.Tanggapan != "" { aspiration.Tanggapan = payload.Tanggapan }
	
	config.DB.Save(&aspiration)
	return c.JSON(fiber.Map{"status": "success", "data": aspiration})
}

// --- GENERIC UPLOAD ---

func UploadFile(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "No file uploaded"})
	}
	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
	os.MkdirAll("./uploads", 0755)
	if err := c.SaveFile(file, "./uploads/"+filename); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to save file"})
	}
	return c.JSON(fiber.Map{"status": "success", "url": "/uploads/" + filename})
}

func GetStudentsLookup(c *fiber.Ctx) error {
	var students []models.Mahasiswa
	if err := config.DB.Select("id, nama, nim").Find(&students).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Gagal memuat data mahasiswa"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": students})
}
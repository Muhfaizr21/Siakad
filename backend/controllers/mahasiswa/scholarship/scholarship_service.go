package scholarship

import (
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"
	"time"

	"gorm.io/gorm"
)

// UpdatePengajuanStatus sets status and sends a notification
func UpdatePengajuanStatus(db *gorm.DB, pengajuanID uint, status string, reason string) error {
	var pengajuan models.BeasiswaPendaftaran
	if err := db.Preload("Beasiswa").Preload("Mahasiswa").First(&pengajuan, pengajuanID).Error; err != nil {
		return err
	}

	err := db.Model(&pengajuan).Updates(map[string]interface{}{
		"status":  status, // Diterima, Ditolak
		"catatan": reason,
	}).Error

	if err != nil {
		return err
	}

	// Trigger Notification
	title := "Update Pengajuan Beasiswa"
	content := "Status pengajuan beasiswa '" + pengajuan.Beasiswa.Nama + "' kamu sekarang: " + status
	if status == "Ditolak" && reason != "" {
		content += ". Alasan: " + reason
	}

	notifikasi.Kirim(db, notifikasi.KirimParams{
		UserID:  pengajuan.Mahasiswa.PenggunaID,
		Type:    "beasiswa",
		Title:   title,
		Content: content,
		Link:    "/student/scholarship",
	})

	return nil
}

// CekDeadlineBeasiswa is a mock crontjob helper for sending notifications
func CekDeadlineBeasiswa(db *gorm.DB) error {
	var list []models.Beasiswa
	// Find active scholarships with deadline <= 3 days
	limit := time.Now().AddDate(0, 0, 3)
	db.Where("deadline <= ? AND deadline > ?", limit, time.Now()).Find(&list)

	for _, b := range list {
		// In a real app, you would send to all students or specific eligible ones
		// For now, let's just trigger a notification (dummy user 1)
		notifikasi.Kirim(db, notifikasi.KirimParams{
			UserID:  1, // User 1 example
			Type:    "beasiswa",
			Title:   "Peringatan Deadline Beasiswa",
			Content: "Pendaftaran '" + b.Nama + "' akan ditutup dalam 3 hari. Segera daftar!",
			Link:    "/student/scholarship",
		})
	}
	return nil
}

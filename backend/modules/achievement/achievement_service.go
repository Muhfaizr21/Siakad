package achievement

import (
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"
	"time"

	"gorm.io/gorm"
)

// VerifyAchievement sets status to Diverifikasi and sends a notification
func VerifyAchievement(db *gorm.DB, achievementID uint, adminID uint) error {
	var achievement models.Achievement
	if err := db.First(&achievement, achievementID).Error; err != nil {
		return err
	}

	now := time.Now()
	err := db.Model(&achievement).Updates(map[string]interface{}{
		"status":      "Diverifikasi",
		"verified_by": &adminID,
		"verified_at": &now,
	}).Error

	if err != nil {
		return err
	}

	// Trigger Notification
	notifikasi.Kirim(db, notifikasi.KirimParams{
		MahasiswaID: achievement.MahasiswaID,
		Type:      "achievement",
		Title:     "Prestasi Diverifikasi",
		Content:   "Pencapaian kamu '" + achievement.NamaLomba + "' telah diverifikasi oleh admin. Selamat!",
		Link:      "/student/achievement",
	})

	return nil
}

// RejectAchievement sets status to Ditolak and sends a notification
func RejectAchievement(db *gorm.DB, achievementID uint, adminID uint, reason string) error {
	var achievement models.Achievement
	if err := db.First(&achievement, achievementID).Error; err != nil {
		return err
	}

	now := time.Now()
	err := db.Model(&achievement).Updates(map[string]interface{}{
		"status":              "Ditolak",
		"catatan_verifikator": reason,
		"verified_by":         &adminID,
		"verified_at":         &now,
	}).Error

	if err != nil {
		return err
	}

	// Trigger Notification
	notifikasi.Kirim(db, notifikasi.KirimParams{
		MahasiswaID: achievement.MahasiswaID,
		Type:      "achievement",
		Title:     "Prestasi Ditolak",
		Content:   "Mohon maaf, laporan prestasi '" + achievement.NamaLomba + "' kamu ditolak. Alasan: " + reason,
		Link:      "/student/achievement",
	})

	return nil
}

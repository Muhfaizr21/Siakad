package voice

import (
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"
	"time"

	"gorm.io/gorm"
)

// RespondAspirasi sets admin response and sends a notification
func RespondAspirasi(db *gorm.DB, ticketID uint, response string, status string) error {
	var ticket models.TiketAspirasi
	if err := db.First(&ticket, ticketID).Error; err != nil {
		return err
	}

	now := time.Now()
	err := db.Model(&ticket).Updates(map[string]interface{}{
		"status":        status, // Diproses, Selesai
		"balasan_admin": response,
		"dibalas_at":    &now,
		"updated_at":    now,
	}).Error

	if err != nil {
		return err
	}

	// Trigger Notification
	notifikasi.Kirim(db, notifikasi.KirimParams{
		StudentID: ticket.StudentID,
		Type:      "student_voice",
		Title:     "Aspirasi Dibalas",
		Content:   "Tiket aspirasi kamu #" + ticket.NomorTiket + " ('" + ticket.Judul + "') telah mendapatkan respon dari admin.",
		Link:      "/student/voice",
	})

	return nil
}

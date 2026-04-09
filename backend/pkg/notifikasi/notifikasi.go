package notifikasi

import (
	"fmt"
	"log"
	"siakad-backend/models"

	"gorm.io/gorm"
)

type KirimParams struct {
	MahasiswaID uint
	UserID      uint
	Type        string // info, warning, success, error
	Title       string
	Content     string
	Link        string
}

// Kirim sends a notification to a user (DB + Async Email)
func Kirim(db *gorm.DB, params KirimParams) error {
	finalUserID := params.UserID

	// Backward compatibility: If MahasiswaID is provided instead of UserID
	if finalUserID == 0 && params.MahasiswaID != 0 {
		var maba models.Mahasiswa
		if err := db.Select("pengguna_id").First(&maba, params.MahasiswaID).Error; err == nil {
			finalUserID = maba.PenggunaID
		}
	}

	if finalUserID == 0 {
		return fmt.Errorf("no valid user id provided for notification")
	}

	// 1. Save to Database
	notif := models.Notifikasi{
		UserID:    finalUserID,
		Tipe:      params.Type,
		Judul:     params.Title,
		Deskripsi: params.Content,
		IsRead:    false,
	}

	if err := db.Create(&notif).Error; err != nil {
		return fmt.Errorf("failed to save notification: %w", err)
	}

	// 2. Send Email (Async)
	// Preferensi notifikasi dilewati sementara karena model tidak tersedia di model.go
	go func() {
		kirimEmail(finalUserID, params)
	}()

	return nil
}

// kirimEmail is a placeholder for actual email sending logic
func kirimEmail(userID uint, params KirimParams) {
	log.Printf("[Notifikasi] SENDING EMAIL to User %d: [%s] %s - %s", 
		userID, params.Type, params.Title, params.Content)
}

package notifikasi

import (
	"fmt"
	"log"
	"siakad-backend/models"

	"gorm.io/gorm"
)

type KirimParams struct {
	StudentID uint
	Type      string // achievement, beasiswa, konseling, student_voice, kencana, sistem
	Title     string
	Content   string
	Link      string
}

// Kirim sends a notification to a student (DB + Async Email)
func Kirim(db *gorm.DB, params KirimParams) error {
	// 1. Save to Database
	notif := models.Notification{
		UserID:  params.StudentID, // Mapping student to user for now if IDs match
		Type:    params.Type,
		Title:   params.Title,
		Message: params.Content,
		Link:    params.Link,
		IsRead:  false,
	}

	if err := db.Create(&notif).Error; err != nil {
		return fmt.Errorf("failed to save notification: %w", err)
	}

	// 2. Check Preferences & Send Email (Async)
	go func() {
		var pref models.NotificationPreference
		if err := db.Where("pengguna_id = ?", params.StudentID).First(&pref).Error; err != nil {
			log.Printf("[Notifikasi] Error checking preferences for student %d: %v", params.StudentID, err)
			return
		}

		// Check if email should be sent for this type
		shouldSend := false
		switch params.Type {
		case "achievement":
			shouldSend = pref.EmailAchievement
		case "beasiswa":
			shouldSend = pref.EmailBeasiswa
		case "konseling":
			shouldSend = pref.EmailCounseling
		case "student_voice":
			shouldSend = pref.EmailVoice
		case "kencana":
			shouldSend = pref.EmailKencana
		case "sistem":
			shouldSend = pref.EmailNews
		}

		if shouldSend {
			kirimEmail(params)
		}
	}()

	return nil
}

// kirimEmail is a placeholder for actual email sending logic
func kirimEmail(params KirimParams) {
	// Here you would integrate with an SMTP server or email API
	log.Printf("[Notifikasi] SENDING EMAIL to Student %d: [%s] %s - %s", 
		params.StudentID, params.Type, params.Title, params.Content)
	
	// Mock HTML Template logic
	/*
	html := fmt.Sprintf(`
		<div style="font-family: sans-serif; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; max-width: 600px;">
			<div style="background: #f97316; padding: 20px; color: white; text-align: center;">
				<h1 style="margin: 0;">BKU Student Hub</h1>
			</div>
			<div style="padding: 20px;">
				<h2 style="color: #171717;">%s</h2>
				<p style="color: #525252; line-height: 1.6;">%s</p>
				<div style="margin-top: 30px; text-align: center;">
					<a href="http://localhost:5173%s" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Lihat Detail</a>
				</div>
			</div>
			<div style="background: #fafafa; padding: 20px; color: #a3a3a3; font-size: 12px; text-align: center; border-top: 1px solid #f5f5f5;">
				Email ini dikirim otomatis oleh BKU Student Hub. 
				Untuk berhenti menerima email ini, atur preferensi notifikasi di portal.
			</div>
		</div>
	`, params.Title, params.Content, params.Link)
	*/
}

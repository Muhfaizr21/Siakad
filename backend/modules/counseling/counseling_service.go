package counseling

import (
	"siakad-backend/models"
	"siakad-backend/pkg/notifikasi"

	"gorm.io/gorm"
)

// ConfirmBooking sets status to Dikonfirmasi and sends a notification
func ConfirmBooking(db *gorm.DB, bookingID uint) error {
	var booking models.BookingKonseling
	if err := db.Preload("JadwalKonseling").First(&booking, bookingID).Error; err != nil {
		return err
	}

	err := db.Model(&booking).Update("status", "Dikonfirmasi").Error
	if err != nil {
		return err
	}

	// Trigger Notification
	tanggalStr := booking.JadwalKonseling.Tanggal.Format("02 January 2006")
	notifikasi.Kirim(db, notifikasi.KirimParams{
		StudentID: booking.StudentID,
		Type:      "konseling",
		Title:     "Konseling Dikonfirmasi",
		Content:   "Jadwal konseling kamu dengan " + booking.JadwalKonseling.NamaKonselor + " pada tanggal " + tanggalStr + " pukul " + booking.JadwalKonseling.JamMulai + " telah dikonfirmasi.",
		Link:      "/student/counseling",
	})

	return nil
}

// RemindBooking sends a reminder 1 hour specifically for tomorrow or today
func RemindBooking(db *gorm.DB, bookingID uint) error {
	var booking models.BookingKonseling
	if err := db.Preload("JadwalKonseling").First(&booking, bookingID).Error; err != nil {
		return err
	}

	// Trigger Notification
	notifikasi.Kirim(db, notifikasi.KirimParams{
		StudentID: booking.StudentID,
		Type:      "konseling",
		Title:     "Peringatan Konseling",
		Content:   "Jangan lupa! Kamu memiliki jadwal konseling hari ini pukul " + booking.JadwalKonseling.JamMulai + " di " + booking.JadwalKonseling.Lokasi,
		Link:      "/student/counseling",
	})

	return nil
}

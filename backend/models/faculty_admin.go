package models

import (
	"time"
)

// LetterRequest represents a student's request for an administrative letter
type LetterRequest struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	StudentID    uint      `json:"studentId"`
	Student      Student   `gorm:"foreignKey:StudentID" json:"student"`
	JenisSurat   string    `gorm:"column:jenis_surat;not null" json:"jenis_surat"` // Surat Keterangan Aktif, Cuti, dll
	Keperluan    string    `gorm:"column:keperluan;type:text;not null" json:"keperluan"`
	Status       string    `gorm:"column:status;default:'diajukan'" json:"status"` // diajukan, diproses, siap_ambil, selesai, ditolak
	FileUrl      string    `gorm:"column:file_url;type:text" json:"file_url"`
	CatatanAdmin string    `gorm:"column:catatan_admin;type:text" json:"catatan_admin"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// TableName overrides the table name used by LetterRequest to `letter_requests`
func (LetterRequest) TableName() string {
	return "letter_requests"
}

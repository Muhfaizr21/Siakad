package models

import (
	"time"
    "encoding/json"
)

// Ormawa represents a student organization
type Ormawa struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `gorm:"not null" json:"name"` // e.g. "BEM Fakultas", "HIMA Informatika"
	Description string `json:"description"`
	Vision      string `gorm:"type:text" json:"vision"`
	Mission     string `gorm:"type:text" json:"mission"`
	LogoUrl     string `json:"logoUrl"`
	Email       string `json:"email"`
	Phone       string `json:"phone"`
	Instagram   string `json:"instagram"`
	Website     string `json:"website"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// OrmawaMember represents a student joining an Ormawa
type OrmawaMember struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	OrmawaID  uint    `json:"ormawaId"`
	Ormawa    Ormawa  `gorm:"foreignKey:OrmawaID" json:"ormawa"`
	StudentID uint    `json:"studentId"`
	Student   Student `gorm:"foreignKey:StudentID" json:"student"` // references NIM, Name from Student table
	Role      string  `gorm:"not null" json:"role"`             // e.g. "Ketua Umum", "Sekretaris", "Staf"
	Division  string  `json:"division"` // e.g. "Minat Bakat", "Kaderisasi"
	Status    string  `gorm:"default:'pending'" json:"status"` // pending, aktif, ditolak, alumni
	ParentID  *uint   `json:"parentId"`          // For hierarchy (reports to)
	JoinedAt  time.Time `json:"joinedAt"`
}

// Proposal represents an event proposal by an Ormawa
type Proposal struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	OrmawaID            uint      `json:"ormawaId"`
	Ormawa              Ormawa    `gorm:"foreignKey:OrmawaID" json:"ormawa"`
	Title               string    `gorm:"not null" json:"title"`
	DateEvent           time.Time `json:"dateEvent"`
	Budget              float64   `json:"budget"`
	Status              string    `gorm:"default:'diajukan'" json:"status"` // diajukan, disetujui_dosen, disetujui_fakultas, disetujui_univ, ditolak, revisi
	Notes               string    `gorm:"type:text" json:"notes"`
	RequestedBy         uint      `json:"requestedBy"` // User ID who created
	ApprovedByDosenID   *uint     `json:"approvedByDosenId"`
	ApprovedByFacultyID *uint     `json:"approvedByFacultyId"`
	ApprovedBySuperID   *uint     `json:"approvedBySuperId"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
}

// ProposalHistory tracks changes in status
type ProposalHistory struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ProposalID uint      `json:"proposalId"`
	Status     string    `json:"status"`
	Notes      string    `json:"notes"`
	CreatedBy  uint      `json:"createdBy"` // User ID
	CreatedAt  time.Time `json:"createdAt"`
}

// CashMutation represents Ormawa financial ledger
type CashMutation struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	OrmawaID    uint      `json:"ormawaId"`
	Ormawa      Ormawa    `gorm:"foreignKey:OrmawaID" json:"ormawa"`
	Type        string    `gorm:"not null" json:"type"` // masuk, keluar
	Nominal     float64   `gorm:"not null" json:"nominal"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	ProposalID  *uint     `json:"proposalId"` // Link to proposal if it's a disbursement
	Date        time.Time `json:"date"`
	CreatedAt   time.Time `json:"createdAt"`
}

// OrmawaRole represents custom and default roles in Ormawa
type OrmawaRole struct {
	ID          uint            `gorm:"primaryKey" json:"id"`
	Name        string          `gorm:"not null" json:"name"`
	Description string          `json:"description"`
	UserCount   int             `gorm:"-" json:"userCount"`
	IsCustom    bool            `json:"isCustom"`
	Permissions json.RawMessage `gorm:"type:jsonb" json:"permissions"` // Stored as JSON data
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

// LPJ represents accountability report for an event
type LPJ struct {
	ID             uint          `gorm:"primaryKey" json:"id"`
	ProposalID     uint          `json:"proposalId"`
	Proposal       Proposal      `gorm:"foreignKey:ProposalID" json:"proposal"`
	Documents      []LPJDocument `gorm:"foreignKey:LPJID" json:"documents"`
	RealizedBudget float64       `json:"realizedBudget"`
	Status         string        `gorm:"default:'draft'" json:"status"` // draft, diajukan, disetujui, revisi
	Notes          string        `gorm:"type:text" json:"notes"`
	SubmittedBy    uint          `json:"submittedBy"` // ID Student/User
	CreatedAt      time.Time     `json:"createdAt"`
	UpdatedAt      time.Time     `json:"updatedAt"`
}

// LPJDocument represents mandatory or optional file uploads for LPJ
type LPJDocument struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	LPJID     uint      `json:"lpjId"`
	Category  string    `json:"category"` // e.g. "Dokumentasi", "Keuangan", "Daftar Hadir"
	FileName  string    `json:"fileName"`
	FileUrl   string    `json:"fileUrl"`
	CreatedAt time.Time `json:"createdAt"`
}

type OrmawaAspiration struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	OrmawaID    uint      `json:"ormawaId"`
	StudentID   uint      `json:"studentId"`
	Student     Student   `gorm:"foreignKey:StudentID" json:"student"`
	Category    string    `json:"category"` // Keluhan, Ide, Aspirasi Umum
	Title       string    `json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	Status      string    `gorm:"default:'pending'" json:"status"` // pending, responded, ignored
	Response    string    `gorm:"type:text" json:"response"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// EventSchedule represents an event schedule in calendar
type EventSchedule struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
	Location    string    `json:"location"`
	Status      string    `gorm:"default:'terjadwal'" json:"status"` // terjadwal, dibatalkan
	OrmawaID    uint      `json:"ormawaId"`
}

// EventAttendance represents attendance of members to an event
type EventAttendance struct {
	ID              uint          `gorm:"primaryKey" json:"id"`
	EventScheduleID uint          `json:"eventScheduleId"`
	EventSchedule   EventSchedule `gorm:"foreignKey:EventScheduleID" json:"eventSchedule"`
	StudentID       uint          `json:"studentId"`
	Student         Student       `gorm:"foreignKey:StudentID" json:"student"`
	Status          string        `json:"status"` // hadir, izin, sakit, alpa
	TimeIn          time.Time     `json:"timeIn"`
}

// OrmawaAnnouncement represents a broadcasted message
type OrmawaAnnouncement struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"not null" json:"title" binding:"required"`
	Content   string    `gorm:"type:text" json:"content" binding:"required"`
	Target    string    `json:"target"` // Semua Anggota, Divisi Keuangan, etc.
	StartDate time.Time `json:"startDate"`
	EndDate   time.Time `json:"endDate"`
	OrmawaID  uint      `json:"ormawaId"`
	CreatedAt time.Time `json:"createdAt"`
}

// OrmawaNotification represents a logged operational event
type OrmawaNotification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Type      string    `json:"type"` // approval, proposal, fund, event
	Title     string    `gorm:"not null" json:"title"`
	Desc      string    `json:"desc"`
	IsRead    bool      `gorm:"default:false" json:"isRead"`
	OrmawaID  uint      `json:"ormawaId"`
	CreatedAt time.Time `json:"createdAt"`
}

// OrmawaDivision represents a functional department
type OrmawaDivision struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	OrmawaID    uint      `json:"ormawaId"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
}


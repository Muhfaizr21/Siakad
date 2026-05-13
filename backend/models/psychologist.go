package models

import (
	"time"

	"gorm.io/datatypes"
)

type Psikolog struct {
	BaseModel
	UserID uint `gorm:"uniqueIndex" json:"user_id"`
	User   User `gorm:"foreignKey:UserID" json:"user,omitempty"`

	Nama         string `json:"nama"`
	Email        string `json:"email"`
	NoHP         string `json:"no_hp"`
	Spesialisasi string `json:"spesialisasi"`
	Bio          string `json:"bio"`
	FotoURL      string `json:"foto_url"`
	Lokasi       string `json:"lokasi"`
	Bahasa       string `json:"bahasa"`
	Tarif        int    `json:"tarif"`
	IsAktif      bool   `gorm:"default:true" json:"is_aktif"`
}

func (Psikolog) TableName() string {
	return "psikolog.profiles"
}

type PsikologScheduleSlot struct {
	BaseModel
	PsikologID uint     `gorm:"index" json:"psikolog_id"`
	Psikolog   Psikolog `gorm:"foreignKey:PsikologID" json:"psikolog,omitempty"`

	Hari       string `gorm:"index" json:"hari"`
	JamMulai   string `json:"jam_mulai"`
	JamSelesai string `json:"jam_selesai"`
	Lokasi     string `json:"lokasi"`
	Kuota      int    `json:"kuota"`
	IsAktif    bool   `gorm:"default:true" json:"is_aktif"`
}

func (PsikologScheduleSlot) TableName() string {
	return "psikolog.schedule_slots"
}

type PsikologBooking struct {
	BaseModel
	PsikologID  uint      `gorm:"index" json:"psikolog_id"`
	Psikolog    Psikolog  `gorm:"foreignKey:PsikologID" json:"psikolog,omitempty"`
	MahasiswaID uint      `gorm:"index" json:"mahasiswa_id"`
	Mahasiswa   Mahasiswa `gorm:"foreignKey:MahasiswaID" json:"mahasiswa,omitempty"`

	Tanggal      time.Time `gorm:"index" json:"tanggal"`
	JamMulai     string    `json:"jam_mulai"`
	JamSelesai   string    `json:"jam_selesai"`
	Topik        string    `json:"topik"`
	Keluhan      string    `json:"keluhan"`
	Status       string    `gorm:"index" json:"status"`
	CatatanAdmin string    `json:"catatan_admin"`
}

func (PsikologBooking) TableName() string {
	return "psikolog.bookings"
}

type PsikologSessionNote struct {
	BaseModel
	PsikologID  uint             `gorm:"index" json:"psikolog_id"`
	Psikolog    Psikolog         `gorm:"foreignKey:PsikologID" json:"psikolog,omitempty"`
	MahasiswaID uint             `gorm:"index" json:"mahasiswa_id"`
	Mahasiswa   Mahasiswa        `gorm:"foreignKey:MahasiswaID" json:"mahasiswa,omitempty"`
	BookingID   *uint            `gorm:"index" json:"booking_id"`
	Booking     *PsikologBooking `gorm:"foreignKey:BookingID" json:"booking,omitempty"`

	Tanggal      time.Time `gorm:"index" json:"tanggal"`
	Keluhan      string    `json:"keluhan"`
	Observasi    string    `json:"observasi"`
	Rekomendasi  string    `json:"rekomendasi"`
	Mood         string    `json:"mood"`
	JenisSesi    string    `json:"jenis_sesi"`
	StatusPasien string    `json:"status_pasien"`
}

func (PsikologSessionNote) TableName() string {
	return "psikolog.session_notes"
}

type PsikologAssessment struct {
	BaseModel
	PsikologID  uint       `gorm:"index" json:"psikolog_id"`
	Psikolog    Psikolog   `gorm:"foreignKey:PsikologID" json:"psikolog,omitempty"`
	MahasiswaID *uint      `gorm:"index" json:"mahasiswa_id"`
	Mahasiswa   *Mahasiswa `gorm:"foreignKey:MahasiswaID" json:"mahasiswa,omitempty"`

	Nama        string         `json:"nama"`
	Kategori    string         `gorm:"index" json:"kategori"`
	Deskripsi   string         `json:"deskripsi"`
	Skor        string         `json:"skor"`
	Status      string         `gorm:"index" json:"status"`
	SubmittedAt *time.Time     `json:"submitted_at"`
	Metadata    datatypes.JSON `json:"metadata"`
}

func (PsikologAssessment) TableName() string {
	return "psikolog.assessments"
}

type PsikologReport struct {
	BaseModel
	PsikologID uint     `gorm:"index" json:"psikolog_id"`
	Psikolog   Psikolog `gorm:"foreignKey:PsikologID" json:"psikolog,omitempty"`

	Judul     string    `json:"judul"`
	Tipe      string    `json:"tipe"`
	Ukuran    string    `json:"ukuran"`
	Status    string    `gorm:"index" json:"status"`
	FileURL   string    `json:"file_url"`
	Periode   string    `json:"periode"`
	Ringkasan string    `json:"ringkasan"`
	Tanggal   time.Time `json:"tanggal"`
}

func (PsikologReport) TableName() string {
	return "psikolog.reports"
}

type PsikologNotification struct {
	BaseModel
	PsikologID uint     `gorm:"index" json:"psikolog_id"`
	Psikolog   Psikolog `gorm:"foreignKey:PsikologID" json:"psikolog,omitempty"`
	UserID     uint     `gorm:"index" json:"user_id"`
	User       User     `gorm:"foreignKey:UserID" json:"user,omitempty"`

	Judul     string `json:"judul"`
	Deskripsi string `json:"deskripsi"`
	Tipe      string `gorm:"index" json:"tipe"`
	IsRead    bool   `gorm:"default:false" json:"is_read"`
}

func (PsikologNotification) TableName() string {
	return "psikolog.notifications"
}

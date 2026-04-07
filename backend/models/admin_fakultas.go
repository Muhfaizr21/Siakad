package models

import (
	"time"
)

// Matakuliah represents a subject in the faculty admin module
type Matakuliah struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	KodeMK    string    `gorm:"unique;not null" json:"kode_mk"`
	NamaMK    string    `gorm:"not null" json:"nama_mk"`
	SKS       int       `json:"sks"`
	Semester  int       `json:"semester"`
	Sifat     string    `gorm:"default:'Wajib'" json:"status_mk"` // Wajib/Pilihan
	Kurikulum string    `json:"kurikulum"`
	MajorID   uint      `json:"majorId"`
	Major     Major     `gorm:"foreignKey:MajorID" json:"major"`
	CreatedAt time.Time `json:"created_at"`
}

// TableName overrides to match SQL
func (Matakuliah) TableName() string {
	return "matakuliah"
}

// Ruangan represents a classroom
type Ruangan struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	NamaRuangan  string    `gorm:"not null" json:"nama_ruangan"`
	KodeRuangan  string    `json:"kode_ruangan"`
	Kapasitas    int       `json:"kapasitas"`
	LokasiGedung string    `json:"lokasi_gedung"`
	TipeRuangan  string    `json:"tipe_ruangan"` // Kelas, Lab
	CreatedAt    time.Time `json:"created_at"`
}

// TableName overrides to match SQL
func (Ruangan) TableName() string {
	return "ruangan"
}

// FacultySchedule represents a weekly class schedule
type FacultySchedule struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	CourseID      uint       `json:"matakuliah_id"`
	Course        Matakuliah `gorm:"foreignKey:CourseID" json:"matakuliah"`
	LecturerID    uint       `json:"dosen_id"`
	Lecturer      Lecturer   `gorm:"foreignKey:LecturerID" json:"dosen"`
	RoomID        uint       `json:"ruangan_id"`
	Room          Ruangan    `gorm:"foreignKey:RoomID" json:"ruangan"`
	Hari          string     `json:"hari"`
	JamMulai      string     `json:"jam_mulai"`
	JamSelesai    string     `json:"jam_selesai"`
	Kelas         string     `json:"kelas"`
	TahunAkademik string     `json:"tahun_akademik"`
	SemesterTipe  string     `json:"semester_tipe"`
	CreatedAt     time.Time  `json:"created_at"`
}

// TableName overrides to match SQL
func (FacultySchedule) TableName() string {
	return "schedules"
}

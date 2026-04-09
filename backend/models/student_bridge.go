package models

import (
	"time"
)

// --- BRIDGE MODELS FOR FAKULTAS_ADMIN SCHEMA ---
// These models represent the tables in the "fakultas_admin" schema
// and are used for data synchronization and reporting.

type FakRole struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"column:nama_peran"`
	Description string `gorm:"column:deskripsi"`
}

func (FakRole) TableName() string {
	return "fakultas_admin.peran"
}

type FakFaculty struct {
	ID           uint      `gorm:"primaryKey"`
	Name         string    `gorm:"column:nama_fakultas"`
	KodeFakultas string    `gorm:"column:kode_fakultas"`
	Dekan        string    `gorm:"column:dekan"`
	CreatedAt    time.Time `gorm:"column:dibuat_pada"`
}

func (FakFaculty) TableName() string {
	return "fakultas_admin.fakultas"
}

type FakMajor struct {
	ID         uint      `gorm:"primaryKey"`
	FakultasID uint      `gorm:"column:fakultas_id"`
	KodeProdi  string    `gorm:"column:kode_prodi"`
	Name       string    `gorm:"column:nama_prodi"`
	Akreditasi string    `gorm:"column:akreditasi"`
	Jenjang    string    `gorm:"column:jenjang"`
}

func (FakMajor) TableName() string {
	return "fakultas_admin.program_studi"
}

type FakLecturer struct {
	ID            uint   `gorm:"primaryKey"`
	PenggunaID    *uint  `gorm:"column:pengguna_id"`
	FakultasID    uint   `gorm:"column:fakultas_id"`
	NIDN          string `gorm:"column:nidn"`
	Name          string `gorm:"column:nama_dosen"`
	IsDPA         bool   `gorm:"column:apakah_dpa"`
}

func (FakLecturer) TableName() string {
	return "fakultas_admin.dosen"
}

type FakStudent struct {
	ID               uint       `gorm:"primaryKey"`
	PenggunaID       *uint      `gorm:"column:pengguna_id"`
	NIM              string     `gorm:"column:nim"`
	Name             string     `gorm:"column:nama_mahasiswa"`
	MajorID          uint       `gorm:"column:prodi_id"`
	DPALecturerID    *uint      `gorm:"column:dosen_pa_id"`
	SemesterSekarang int        `gorm:"column:semester_sekarang"`
	JoinYear         int        `gorm:"column:tahun_masuk"`
	Gender           string     `gorm:"column:jenis_kelamin"`
	IPK              float64    `gorm:"column:ipk"`
	CreditLimit      int        `gorm:"column:credit_limit"`
	Status           string     `gorm:"column:status_akun"`
	CreatedAt        time.Time  `gorm:"column:dibuat_pada"`
	UpdatedAt        time.Time  `gorm:"column:diperbarui_pada"`
	
	// Relations for Preloading in Dashboard
	Major        FakMajor    `gorm:"foreignKey:MajorID" json:"prodi,omitempty"`
	Achievements []FakAchievement `gorm:"foreignKey:MahasiswaID" json:"prestasi,omitempty"`
}

func (FakStudent) TableName() string {
	return "fakultas_admin.mahasiswa"
}

type FakAchievement struct {
	ID           uint      `gorm:"primaryKey"`
	MahasiswaID  uint      `gorm:"column:mahasiswa_id"`
	Name         string    `gorm:"column:nama_prestasi"`
	Field        string    `gorm:"column:bidang"`
	Level        string    `gorm:"column:tingkat"`
	Rank         string    `gorm:"column:peringkat"`
	Year         int       `gorm:"column:tahun"`
	Organizer    string    `gorm:"column:penyelenggara"`
	Status       string    `gorm:"column:status"`
	Points       int       `gorm:"column:poin_skpi"`
}

func (FakAchievement) TableName() string {
	return "fakultas_admin.prestasi"
}

type FakPKKMB struct {
	ID               uint      `gorm:"primaryKey"`
	MahasiswaID      uint      `gorm:"column:mahasiswa_id"`
	ExecutionYear    int       `gorm:"column:tahun_pelaksanaan"`
	AcademicScore    float64   `gorm:"column:nilai_akademik"`
	Attendance       int       `gorm:"column:kehadiran"`
	GraduationStatus string    `gorm:"column:status_kelulusan"`
}

func (FakPKKMB) TableName() string {
	return "fakultas_admin.pkkmb_kelulusan"
}

type FakHealthScreening struct {
	ID          uint      `gorm:"primaryKey"`
	MahasiswaID uint      `gorm:"column:mahasiswa_id"`
	ScreeningDate time.Time `gorm:"column:tanggal_screening"`
	BloodType   string    `gorm:"column:golongan_darah"`
	Category    string    `gorm:"column:kategori_kesehatan"`
}

func (FakHealthScreening) TableName() string {
	return "fakultas_admin.kesehatan"
}

type FakScholarshipApp struct {
	ID          uint   `gorm:"primaryKey"`
	MahasiswaID uint   `gorm:"column:mahasiswa_id"`
	ScholarshipID uint `gorm:"column:beasiswa_id"`
	IPKAtTime   float64 `gorm:"column:ipk_saat_mendaftar"`
	Status      string `gorm:"column:status"`
}

func (FakScholarshipApp) TableName() string {
	return "fakultas_admin.pendaftaran_beasiswa"
}

type FakCounseling struct {
	ID          uint      `gorm:"primaryKey"`
	MahasiswaID uint      `gorm:"column:mahasiswa_id"`
	Date        time.Time `gorm:"column:tanggal_konseling"`
	Topic       string    `gorm:"column:topik"`
	Status      string    `gorm:"column:status"`
}

func (FakCounseling) TableName() string {
	return "fakultas_admin.konseling"
}

type FakAspiration struct {
	ID          uint   `gorm:"primaryKey"`
	MahasiswaID uint   `gorm:"column:mahasiswa_id"`
	Topic       string `gorm:"column:topik"`
	Category    string `gorm:"column:kategori"`
	Status      string `gorm:"column:status"`
}

func (FakAspiration) TableName() string {
	return "fakultas_admin.aspirasi_fakultas"
}

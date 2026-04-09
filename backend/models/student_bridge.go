package models

import "time"

// ============================================================
//  STUDENT BRIDGE — GORM Models
//  Menghubungkan data mahasiswa (public.students) ke tabel-tabel
//  di schema fakultas_admin.* agar data sinkron antara
//  portal mahasiswa dan dashboard admin fakultas.
//
//  Sinkron dengan: backend/database/migrations/02_admin_fakultas_schema.sql
//  Schema PostgreSQL: fakultas_admin.*
// ============================================================

// FakRole merepresentasikan tabel fakultas_admin.roles
// Tabel role khusus di environment Admin Fakultas.
type FakRole struct {
	ID          uint      `gorm:"primaryKey;column:id"                        json:"id"`
	Name        string    `gorm:"column:nama_peran;not null;uniqueIndex"      json:"name"`
	Description string    `gorm:"column:deskripsi;type:text"                  json:"description"`
	CreatedAt   time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (FakRole) TableName() string {
	return "fakultas_admin.peran"
}

// FakFaculty merepresentasikan tabel fakultas_admin.faculties
// Menyimpan data Fakultas di environment Admin Fakultas.
type FakFaculty struct {
	ID        uint      `gorm:"primaryKey;column:id"                        json:"id"`
	Name      string    `gorm:"column:nama_fakultas;not null"               json:"name"`
	Code      string    `gorm:"column:kode_fakultas;not null;uniqueIndex"   json:"code"`
	DeanName  string    `gorm:"column:dekan"                                json:"dean_name"`
	CreatedAt time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP"  json:"updated_at"`
}

func (FakFaculty) TableName() string {
	return "fakultas_admin.fakultas"
}

// FakUser merepresentasikan tabel fakultas_admin.users
// Akun admin/dosen yang beroperasi di lingkungan Admin Fakultas.
// Berbeda dari public.users yang digunakan oleh mahasiswa dan ormawa.
type FakUser struct {
	ID           uint       `gorm:"primaryKey;column:id"                        json:"id"`
	Email        string     `gorm:"column:email;not null;uniqueIndex"           json:"email"`
	PasswordHash string     `gorm:"column:kata_sandi;not null"                  json:"-"`
	RoleID       *uint      `gorm:"column:peran_id"                             json:"role_id"`
	Role         *FakRole   `gorm:"foreignKey:RoleID"                           json:"role,omitempty"`
	FacultyID    *uint      `gorm:"column:fakultas_id"                          json:"faculty_id"`
	Faculty      *FakFaculty `gorm:"foreignKey:FacultyID"                       json:"faculty,omitempty"`
	IsActive     bool       `gorm:"column:aktif;default:true"                   json:"is_active"`
	CreatedAt    time.Time  `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt    time.Time  `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (FakUser) TableName() string {
	return "fakultas_admin.pengguna"
}

// FakMajor merepresentasikan tabel fakultas_admin.majors (Program Studi)
// Menyimpan data Program Studi yang berhubungan dengan mahasiswa di level Fakultas.
type FakMajor struct {
	ID         uint       `gorm:"primaryKey;column:id"                        json:"id"`
	FacultyID  uint       `gorm:"column:fakultas_id;not null"                 json:"faculty_id"`
	Faculty    FakFaculty `gorm:"foreignKey:FacultyID;constraint:OnDelete:CASCADE" json:"faculty,omitempty"`
	Code       string     `gorm:"column:kode_prodi;not null;uniqueIndex"       json:"code"`
	Name       string     `gorm:"column:nama_prodi;not null"                   json:"name"`
	Akreditasi string     `gorm:"column:akreditasi;default:'B'"               json:"akreditasi"`
	Jenjang    string     `gorm:"column:jenjang;default:'S1'"                 json:"jenjang"`
	KaprodiID  *uint      `gorm:"column:kaprodi_id"                           json:"kaprodi_id"`
	CreatedAt  time.Time  `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt  time.Time  `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP"  json:"updated_at"`
}

func (FakMajor) TableName() string {
	return "fakultas_admin.program_studi"
}

// FakLecturer merepresentasikan tabel fakultas_admin.lecturers (Dosen)
// Menyimpan data Dosen di lingkungan Admin Fakultas,
// termasuk dosen yang berstatus sebagai DPA/Wali Dosen.
type FakLecturer struct {
	ID        uint       `gorm:"primaryKey;column:id"                        json:"id"`
	UserID    *uint      `gorm:"column:pengguna_id;uniqueIndex"              json:"user_id"`
	User      *FakUser   `gorm:"foreignKey:UserID"                           json:"user,omitempty"`
	FacultyID uint       `gorm:"column:fakultas_id;not null"                 json:"faculty_id"`
	Faculty   FakFaculty `gorm:"foreignKey:FacultyID;constraint:OnDelete:CASCADE" json:"faculty,omitempty"`
	NIDN      string     `gorm:"column:nidn;uniqueIndex"                     json:"nidn"`
	Name      string     `gorm:"column:nama_dosen;not null"                  json:"name"`
	IsDPA     bool       `gorm:"column:apakah_dpa;default:false"             json:"is_dpa"`
	CreatedAt time.Time  `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time  `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP"  json:"updated_at"`
}

func (FakLecturer) TableName() string {
	return "fakultas_admin.dosen"
}

// FakStudent merepresentasikan tabel fakultas_admin.mahasiswa
//
// JEMBATAN UTAMA (Bridge) antara sistem portal mahasiswa dan Admin Fakultas.
// Semua aktivitas seperti Prestasi, Konseling, Beasiswa, dan Screening Kesehatan
// menggunakan mahasiswa_id dari tabel ini sebagai Foreign Key.
type FakStudent struct {
	ID               uint        `gorm:"primaryKey;column:id"                          json:"id"`
	UserID           *uint       `gorm:"column:pengguna_id;uniqueIndex"                json:"pengguna_id"`
	NIM              string      `gorm:"column:nim;not null;uniqueIndex"               json:"nim"`
	Name             string      `gorm:"column:nama_mahasiswa;not null"                json:"nama_mahasiswa"`
	MajorID          uint        `gorm:"column:prodi_id;not null"                      json:"prodi_id"`
	Major            FakMajor    `gorm:"foreignKey:MajorID"                            json:"prodi,omitempty"`
	DPALecturerID    *uint       `gorm:"column:dosen_pa_id"                            json:"dosen_pa_id"`
	DPALecturer      *FakLecturer `gorm:"foreignKey:DPALecturerID"                     json:"dosen_pa,omitempty"`
	SemesterSekarang int         `gorm:"column:semester_sekarang;default:1"            json:"semester_sekarang"` // [NEW]
	JoinYear         int         `gorm:"column:tahun_masuk"                            json:"tahun_masuk"`
	Gender           string      `gorm:"column:jenis_kelamin;size:1"                   json:"jenis_kelamin"`
	GPA              float64     `gorm:"column:ipk;default:0.00"                       json:"ipk"`
	CreditLimit      int         `gorm:"column:credit_limit;default:24"                json:"credit_limit"`
	Status           string      `gorm:"column:status_akun;default:'Aktif'"            json:"status_akun"`
	CreatedAt        time.Time   `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP"  json:"dibuat_pada"`
	UpdatedAt        time.Time   `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP" json:"diperbarui_pada"` // [NEW]

	// Computed relations
	Achievements    []FakAchievement     `gorm:"foreignKey:StudentID" json:"prestasi,omitempty"`
	PKKMBHistory    []FakPKKMB           `gorm:"foreignKey:StudentID" json:"pkkmb,omitempty"`
	HealthRecords   []FakHealthScreening `gorm:"foreignKey:StudentID" json:"kesehatan,omitempty"`
	Aspirations     []FakAspiration      `gorm:"foreignKey:StudentID" json:"aspirasi,omitempty"`
	ScholarshipApps []FakScholarshipApp  `gorm:"foreignKey:StudentID" json:"beasiswa_apps,omitempty"`
	Counselings     []FakCounseling      `gorm:"foreignKey:StudentID" json:"konseling,omitempty"`
}

func (FakStudent) TableName() string {
	return "fakultas_admin.mahasiswa"
}

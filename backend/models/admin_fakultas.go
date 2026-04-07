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

// Aspiration represents a student feedback or complaint
type Aspiration struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	StudentID   uint      `gorm:"column:student_id" json:"studentId"`
	Student     Student   `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student"`
	Title       string    `gorm:"column:title" json:"title"`
	Description string    `gorm:"column:description" json:"description"`
	Category    string    `gorm:"column:category" json:"category"`
	Status      string    `gorm:"column:status;default:'proses'" json:"status"` // proses, klarifikasi, selesai, ditolak
	Response    string    `gorm:"column:response" json:"response"`
	AdminID     *uint     `gorm:"column:admin_id" json:"adminId"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

func (Aspiration) TableName() string {
	return "aspirations"
}


// LetterRequest represents a student's administrative letter application
type LetterRequest struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	StudentID    uint      `gorm:"column:student_id" json:"studentId"`
	Student      Student   `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student"`
	JenisSurat   string    `gorm:"column:jenis_surat" json:"type"`
	Keperluan    string    `gorm:"column:keperluan" json:"purpose"`
	Status       string    `gorm:"column:status;default:'diajukan'" json:"status"` // diajukan, diproses, siap_ambil, selesai, ditolak
	FileURL      string    `gorm:"column:file_url" json:"fileUrl"`
	CatatanAdmin string    `gorm:"column:catatan_admin" json:"adminNotes"`
	CreatedAt    time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

func (LetterRequest) TableName() string {
	return "letter_requests"
}

// GraduationSubmission represents a student application for graduation
type GraduationSubmission struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	StudentID     uint      `gorm:"column:student_id" json:"studentId"`
	Student       Student   `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student"`
	JudulSkripsi  string    `gorm:"column:judul_skripsi" json:"thesisTitle"`
	IPKAkhir      float64   `gorm:"column:ipk_akhir" json:"gpa"`
	Status        string    `gorm:"column:status;default:'pendaftaran'" json:"status"` // pendaftaran, verifikasi, sidang, revisi, lulus, ditolak
	TanggalSidang *time.Time `gorm:"column:tanggal_sidang" json:"examDate"`
	Keterangan    string    `gorm:"column:keterangan" json:"notes"`
	CreatedAt     time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

func (GraduationSubmission) TableName() string {
	return "graduation_submissions"
}

// MBKMProgram represents a student's participation in MBKM programs
type MBKMProgram struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	StudentID     uint      `gorm:"column:student_id" json:"studentId"`
	Student       Student   `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student"`
	JenisMBKM     string    `gorm:"column:jenis_mbkm" json:"type"` // Magang, Studi Independen, Kampus Mengajar, dll
	MitraNama     string    `gorm:"column:mitra_nama" json:"partner"`
	DurasiBulan   int       `gorm:"column:durasi_bulan" json:"duration"`
	Status        string    `gorm:"column:status;default:'terdaftar'" json:"status"` // terdaftar, berjalan, rekon_sks, selesai, ditolak
	SKSKonversi   int       `gorm:"column:sks_konversi;default:0" json:"sks"`
	CreatedAt     time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

func (MBKMProgram) TableName() string {
	return "mbkm_programs"
}

// Scholarship represents a scholarship offered by the faculty or partners
type Scholarship struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Provider    string    `json:"provider"`
	Description string    `json:"description"`
	MinGPA      float64   `gorm:"column:min_gpa" json:"minGpa"`
	Deadline    time.Time `json:"deadline"`
	Quota       int       `json:"quota"`
	Status      string    `gorm:"default:'buka'" json:"status"` // buka, tutup
	PosterURL   string    `gorm:"column:poster_url" json:"posterUrl"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (Scholarship) TableName() string {
	return "scholarships"
}

// ScholarshipApplication represents a student's application to a scholarship
type ScholarshipApplication struct {
	ID            uint        `gorm:"primaryKey" json:"id"`
	ScholarshipID uint        `gorm:"column:scholarship_id" json:"scholarshipId"`
	Scholarship   Scholarship `gorm:"foreignKey:ScholarshipID" json:"scholarship"`
	StudentID     uint        `gorm:"column:student_id" json:"studentId"`
	Student       Student     `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student"`
	DocumentURL   string      `gorm:"column:document_url" json:"documentUrl"`
	Status        string      `gorm:"default:'proses'" json:"status"` // proses, wawancara, diterima, ditolak
	AdminNotes    string      `gorm:"column:admin_notes" json:"adminNotes"`
	CreatedAt     time.Time   `json:"createdAt"`
	UpdatedAt     time.Time   `json:"updatedAt"`
}

type OrmawaProposal struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	StudentID     uint      `gorm:"column:student_id" json:"studentId"`
	Student       Student   `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student"`
	OrmawaName    string    `gorm:"column:ormawa_name" json:"ormawaName"`
	Title         string    `gorm:"column:title" json:"title"`
	Description   string    `gorm:"column:description" json:"description"`
	DocumentURL   string    `gorm:"column:document_url" json:"documentUrl"`
	RequestedBudget float64 `gorm:"column:requested_budget" json:"budget"`
	Status        string    `gorm:"column:status;default:'diajukan'" json:"status"` // diajukan, revisi, disetujui, ditolak
	AdminNotes    string    `gorm:"column:admin_notes" json:"adminNotes"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

func (OrmawaProposal) TableName() string {
	return "ormawa_proposals"
}

type FacultyOrganization struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	OrgCode     string    `gorm:"column:org_code;unique" json:"orgCode"`
	Name        string    `gorm:"column:name" json:"name"`
	LeaderName  string    `gorm:"column:leader_name" json:"leaderName"`
	MemberCount int       `gorm:"column:member_count" json:"memberCount"`
	Status      string    `gorm:"column:status;default:'Aktif'" json:"status"` // Aktif, Pembekuan
	Description string    `gorm:"column:description" json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (FacultyOrganization) TableName() string {
	return "faculty_organizations"
}

type Article struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"column:title" json:"title"`
	Content   string    `gorm:"column:content;type:text" json:"content"`
	Category  string    `gorm:"column:category" json:"category"` // Berita, Pengumuman, Agenda
	Thumbnail string    `gorm:"column:thumbnail" json:"thumbnail"`
	Author    string    `gorm:"column:author" json:"author"`
	Status    string    `gorm:"column:status;default:'Published'" json:"status"` // Published, Draft
	Views     int       `gorm:"column:views;default:0" json:"views"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (Article) TableName() string {
	return "articles"
}

func (ScholarshipApplication) TableName() string {
	return "scholarship_applications"
}

type Admission struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	PendaftarID  string    `gorm:"column:pendaftar_id;unique" json:"pendaftarId"`
	Nama         string    `gorm:"column:nama" json:"nama"`
	Email        string    `gorm:"column:email" json:"email"`
	NoHp         string    `gorm:"column:no_hp" json:"noHp"`
	Prodi        string    `gorm:"column:prodi" json:"prodi"`
	Jalur        string    `gorm:"column:jalur" json:"jalur"` // SNBP, SNBT, Mandiri
	Status       string    `gorm:"column:status;default:'Pending'" json:"status"` // Diterima, Verifikasi, Pending, Ditolak
	NilaiRapor   float64   `gorm:"column:nilai_rapor" json:"nilaiRapor"`
	TanggalDaftar time.Time `gorm:"column:tanggal_daftar" json:"tanggalDaftar"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

func (Admission) TableName() string {
	return "admissions"
}

type FacultyRole struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	Permissions string    `gorm:"type:text" json:"permissions"` // Simpan sebagai JSON string
	IsCustom    bool      `gorm:"default:true" json:"isCustom"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (FacultyRole) TableName() string {
	return "faculty_roles"
}

// Grade represents a student's score for a subject
type Grade struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	StudentID     uint       `json:"student_id"`
	Student       Student    `gorm:"foreignKey:StudentID" json:"student"`
	CourseID      uint       `json:"matakuliah_id"`
	Course        Matakuliah `gorm:"foreignKey:CourseID" json:"matakuliah"`
	TahunAkademik string     `json:"tahun_akademik"`
	Semester      int        `json:"semester"`
	Absensi       float64    `gorm:"default:0" json:"absensi"`
	Tugas         float64    `gorm:"default:0" json:"tugas"`
	UTS           float64    `gorm:"default:0" json:"uts"`
	UAS           float64    `gorm:"default:0" json:"uas"`
	NilaiAkhir    float64    `gorm:"default:0" json:"nilai_akhir"`
	GradeLabel    string     `json:"grade_label"` // A, B, C, D, E
	Point         float64    `json:"point"`       // 4.0, 3.0, etc.
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

func (Grade) TableName() string {
	return "grades"
}

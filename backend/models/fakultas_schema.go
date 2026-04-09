package models

import "time"

// ============================================================
//  FAKULTAS ADMIN SCHEMA — GORM Models
//  Sinkron dengan: backend/database/migrations/02_admin_fakultas_schema.sql
//  Schema PostgreSQL: fakultas_admin.*
//  Note: Setiap struct mengimplementasikan TableName() untuk
//        mengarahkan GORM ke schema & tabel yang benar.
// ============================================================

// --- 7. PRESTASI MAHASISWA (achievements) ---

// FakAchievement merepresentasikan tabel fakultas_admin.prestasi
// Digunakan oleh Admin Fakultas untuk validasi prestasi mahasiswa.
type FakAchievement struct {
	ID                uint       `gorm:"primaryKey;column:id"                            json:"id"`
	StudentID         uint       `gorm:"column:mahasiswa_id;not null"                    json:"mahasiswa_id"`
	Student           FakStudent `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student,omitempty"`
	NamaPrestasi      string     `gorm:"column:nama_prestasi;not null"                   json:"nama_prestasi"`
	Bidang            string     `gorm:"column:bidang;not null"                          json:"bidang"`
	Tingkat           string     `gorm:"column:tingkat;not null"                         json:"tingkat"`
	Peringkat         string     `gorm:"column:peringkat"                                json:"peringkat"`
	Tahun             int        `gorm:"column:tahun;not null"                           json:"tahun"`
	Penyelenggara     string     `gorm:"column:penyelenggara"                            json:"penyelenggara"`
	SertifikatURL     string     `gorm:"column:sertifikat_url;type:text"                 json:"sertifikat_url"`
	Status            string     `gorm:"column:status;default:'Menunggu'"                json:"status"`
	PoinSKPI          int        `gorm:"column:poin_skpi;default:0"                      json:"poin_skpi"`
	Catatan           string     `gorm:"column:catatan;type:text"                        json:"catatan"`
	DiverifikasiPada  *time.Time `gorm:"column:diverifikasi_pada"                        json:"diverifikasi_pada"`  // [NEW]
	DiverifikasiOleh  *uint      `gorm:"column:diverifikasi_oleh"                        json:"diverifikasi_oleh"`
	CreatedAt         time.Time  `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP"    json:"dibuat_pada"`
	UpdatedAt         time.Time  `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP" json:"diperbarui_pada"`
}

func (FakAchievement) TableName() string {
	return "fakultas_admin.prestasi"
}

// --- 8. PKKMB / KENCANA (pkkmb_participations) ---

// FakPKKMB merepresentasikan tabel fakultas_admin.pkkmb_participations
// Digunakan Admin Fakultas untuk memonitor partisipasi PKKMB mahasiswa.
type FakPKKMB struct {
	ID               uint      `gorm:"primaryKey;column:id"                       json:"id"`
	StudentID        uint      `gorm:"column:student_id;not null"                 json:"student_id"`
	Student          FakStudent `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student,omitempty"`
	TahunPelaksanaan int       `gorm:"column:tahun_pelaksanaan;not null"          json:"tahun_pelaksanaan"`
	NilaiAkademik    float64   `gorm:"column:nilai_akademik;default:0.00"         json:"nilai_akademik"`
	Kehadiran        int       `gorm:"column:kehadiran;default:0"                 json:"kehadiran"` // persen kehadiran
	StatusKelulusan  string    `gorm:"column:status_kelulusan;default:'Tidak Lulus'" json:"status_kelulusan"`
	SertifikatURL    string    `gorm:"column:sertifikat_url;type:text"            json:"sertifikat_url"`
	Catatan          string    `gorm:"column:catatan;type:text"                   json:"catatan"`
	CreatedAt        time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt        time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (FakPKKMB) TableName() string {
	return "fakultas_admin.pkkmb_participations"
}

// --- 9. KESEHATAN (health_screenings) ---

// FakHealthScreening merepresentasikan tabel fakultas_admin.health_screenings
// Digunakan Admin Fakultas untuk memantau data kesehatan mahasiswa.
type FakHealthScreening struct {
	ID                uint      `gorm:"primaryKey;column:id"                       json:"id"`
	StudentID         uint      `gorm:"column:student_id;not null"                 json:"student_id"`
	Student           FakStudent `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student,omitempty"`
	TanggalScreening  time.Time `gorm:"column:tanggal_screening;not null"          json:"tanggal_screening"`
	GolonganDarah     string    `gorm:"column:golongan_darah"                      json:"golongan_darah"` // A, B, AB, O
	TinggiBadanCM     int       `gorm:"column:tinggi_badan_cm"                     json:"tinggi_badan_cm"`
	BeratBadanKG      int       `gorm:"column:berat_badan_kg"                      json:"berat_badan_kg"`
	TekananDarah      string    `gorm:"column:tekanan_darah"                       json:"tekanan_darah"` // e.g. "120/80"
	Alergi            string    `gorm:"column:alergi;type:text"                    json:"alergi"`
	ButaWarna         string    `gorm:"column:buta_warna;default:'Tidak'"          json:"buta_warna"`
	RiwayatPenyakit   string    `gorm:"column:riwayat_penyakit;type:text"          json:"riwayat_penyakit"`
	KategoriKesehatan string    `gorm:"column:kategori_kesehatan"                  json:"kategori_kesehatan"` // Sehat, Perlu Perhatian, dll
	CatatanMedis      string    `gorm:"column:catatan_medis;type:text"             json:"catatan_medis"`
	CreatedAt         time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt         time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (FakHealthScreening) TableName() string {
	return "fakultas_admin.health_screenings"
}

// --- 10. ASPIRASI FAKULTAS (faculty_aspirations) ---

// FakAspiration merepresentasikan tabel fakultas_admin.faculty_aspirations
// Digunakan Admin Fakultas untuk mengelola Student Voice di level fakultas.
type FakAspiration struct {
	ID           uint      `gorm:"primaryKey;column:id"                       json:"id"`
	StudentID    uint      `gorm:"column:student_id;not null"                 json:"student_id"`
	Student      FakStudent `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student,omitempty"`
	Topik        string    `gorm:"column:topik;not null"                      json:"topik"`
	Deskripsi    string    `gorm:"column:deskripsi;type:text;not null"        json:"deskripsi"`
	Kategori     string    `gorm:"column:kategori"                            json:"kategori"` // Akademik, Fasilitas, dll
	Status       string    `gorm:"column:status;default:'proses'"             json:"status"`   // proses, klarifikasi, selesai, ditolak
	Response     string    `gorm:"column:response;type:text"                  json:"response"`
	ResponseDate *time.Time `gorm:"column:response_date"                      json:"response_date"`
	HandledBy    *uint     `gorm:"column:handled_by"                          json:"handled_by"` // FK ke fakultas_admin.users
	CreatedAt    time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (FakAspiration) TableName() string {
	return "fakultas_admin.faculty_aspirations"
}

// --- 11a. BEASISWA INTERNAL (internal_scholarships) ---

// FakScholarship merepresentasikan tabel fakultas_admin.internal_scholarships
// Digunakan Admin Fakultas untuk mengelola beasiswa tingkat fakultas.
type FakScholarship struct {
	ID           uint      `gorm:"primaryKey;column:id"                        json:"id"`
	NamaBeasiswa string    `gorm:"column:nama_beasiswa;not null"               json:"nama_beasiswa"`
	Penyelenggara string   `gorm:"column:penyelenggara;not null"               json:"penyelenggara"`
	Kuota        int       `gorm:"column:kuota;not null;default:0"             json:"kuota"`
	Persyaratan  string    `gorm:"column:persyaratan;type:text"                json:"persyaratan"`
	Nominal      float64   `gorm:"column:nominal;default:0"                    json:"nominal"`
	MinIPK       float64   `gorm:"column:min_ipk;default:0.00"                 json:"min_ipk"`
	TanggalBuka  time.Time `gorm:"column:tanggal_buka;not null"                json:"tanggal_buka"`
	TanggalTutup time.Time `gorm:"column:tanggal_tutup;not null"               json:"tanggal_tutup"`
	StatusBuka   bool      `gorm:"column:status_buka;default:true"             json:"status_buka"`
	CreatedAt    time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (FakScholarship) TableName() string {
	return "fakultas_admin.internal_scholarships"
}

// --- 11b. APLIKASI BEASISWA (scholarship_applications) ---

// FakScholarshipApp merepresentasikan tabel fakultas_admin.scholarship_applications
// Menyimpan riwayat pengajuan beasiswa internal oleh mahasiswa.
type FakScholarshipApp struct {
	ID               uint           `gorm:"primaryKey;column:id"                        json:"id"`
	StudentID        uint           `gorm:"column:student_id;not null"                  json:"student_id"`
	Student          FakStudent     `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student,omitempty"`
	ScholarshipID    uint           `gorm:"column:scholarship_id;not null"              json:"scholarship_id"`
	Scholarship      FakScholarship `gorm:"foreignKey:ScholarshipID;constraint:OnDelete:CASCADE" json:"scholarship,omitempty"`
	IPKSaatMendaftar float64        `gorm:"column:ipk_saat_mendaftar"                   json:"ipk_saat_mendaftar"`
	BerkasURL        string         `gorm:"column:berkas_url;type:text"                 json:"berkas_url"`
	Status           string         `gorm:"column:status;default:'Menunggu'"            json:"status"` // Menunggu, Terverifikasi, Ditolak, Diterima
	CatatanReviewer  string         `gorm:"column:catatan_reviewer;type:text"           json:"catatan_reviewer"`
	ReviewedBy       *uint          `gorm:"column:reviewed_by"                          json:"reviewed_by"` // FK ke fakultas_admin.users
	ReviewedAt       *time.Time     `gorm:"column:reviewed_at"                          json:"reviewed_at"`
	CreatedAt        time.Time      `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt        time.Time      `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (FakScholarshipApp) TableName() string {
	return "fakultas_admin.scholarship_applications"
}

// --- 12. KONSELING (counselings) ---

// FakCounseling merepresentasikan tabel fakultas_admin.counselings
// Digunakan Admin/Konselor untuk mencatat sesi konseling dengan mahasiswa.
type FakCounseling struct {
	ID               uint      `gorm:"primaryKey;column:id"                        json:"id"`
	StudentID        uint      `gorm:"column:student_id;not null"                  json:"student_id"`
	Student          FakStudent `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student,omitempty"`
	TanggalKonseling time.Time `gorm:"column:tanggal_konseling;not null"           json:"tanggal_konseling"`
	Topik            string    `gorm:"column:topik;not null"                       json:"topik"`
	Catatan          string    `gorm:"column:catatan;type:text"                    json:"catatan"`
	Status           string    `gorm:"column:status;default:'Menunggu'"            json:"status"` // Menunggu, Terverifikasi, Ditolak, Diterima
	CounselorID      *uint     `gorm:"column:counselor_id"                         json:"counselor_id"` // FK ke fakultas_admin.users
	CreatedAt        time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt        time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (FakCounseling) TableName() string {
	return "fakultas_admin.counselings"
}

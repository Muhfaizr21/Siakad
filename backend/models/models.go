package models

import (
	"time"

	"gorm.io/gorm"
)

// --- BASE ENTITIES ---

type Role struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Name      string `gorm:"unique;not null;column:nama_peran" json:"name"`
	Description string `gorm:"column:deskripsi" json:"description"`
}

func (Role) TableName() string {
	return "peran"
}

type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Email        string         `gorm:"unique;not null;column:email" json:"email"`
	PasswordHash string         `gorm:"not null;column:kata_sandi" json:"-"` // Hide password from JSON
	RoleID       uint           `gorm:"column:peran_id" json:"roleId"`
	Role         Role           `gorm:"foreignKey:RoleID" json:"role"`
	IsActive     bool           `gorm:"default:true;column:aktif" json:"isActive"`
	CreatedAt    time.Time      `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"createdAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (User) TableName() string {
	return "pengguna"
}

type Faculty struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null;column:nama_fakultas" json:"name"`
	Code      string    `gorm:"unique;not null;default:'-';column:kode_fakultas" json:"code"`
	DeanName  string    `gorm:"column:dekan" json:"deanName"`
	CreatedAt time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"createdAt"`
}

func (Faculty) TableName() string {
	return "fakultas"
}

type Major struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	FacultyID   uint      `gorm:"column:fakultas_id" json:"facultyId"`
	Faculty     Faculty   `gorm:"foreignKey:FacultyID" json:"faculty"`
	Name        string    `gorm:"not null;column:nama_prodi" json:"name"`
	Code        string    `gorm:"unique;not null;default:'-';column:kode_prodi" json:"code"`
	DegreeLevel string    `gorm:"column:jenjang" json:"degreeLevel"`
	Akreditasi  string    `gorm:"column:akreditasi" json:"akreditasi"`
	Kapasitas   int       `gorm:"column:kapasitas" json:"kapasitas"`
	CreatedAt   time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"createdAt"`
}

func (Major) TableName() string {
	return "program_studi"
}

type Lecturer struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"column:pengguna_id" json:"userId"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	NIDN      string    `gorm:"unique;column:nidn" json:"nidn"`
	Name      string    `gorm:"not null;column:nama_dosen" json:"name"`
	FacultyID uint      `gorm:"column:fakultas_id" json:"facultyId"`
	Faculty   Faculty   `gorm:"foreignKey:FacultyID" json:"faculty"`
	MajorID   uint      `gorm:"column:prodi_id" json:"majorId"`
	Major     Major     `gorm:"foreignKey:MajorID" json:"major"`
	Jabatan   string    `gorm:"column:jabatan" json:"jabatan"`
	IsDPA     bool      `gorm:"default:false;column:apakah_dpa" json:"isDpa"`
	PhotoURL  string    `gorm:"column:foto_url" json:"photoUrl"`
	CreatedAt time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"createdAt"`
}

func (Lecturer) TableName() string {
	return "dosen"
}

type Student struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `gorm:"not null;column:pengguna_id" json:"userId"`
	User            User      `gorm:"foreignKey:UserID" json:"user"`
	NIM             string    `gorm:"unique;not null;column:nim" json:"nim"`
	Name            string    `gorm:"not null;column:nama_mahasiswa" json:"name"`
	MajorID         uint      `gorm:"column:prodi_id" json:"majorId"`
	Major           Major     `gorm:"foreignKey:MajorID" json:"major"`
	DPALecturerID   *uint     `gorm:"column:dosen_pa_id" json:"dpaLecturerId"`
	DPALecturer     *Lecturer `gorm:"foreignKey:DPALecturerID" json:"dpaLecturer"`
	Status          string    `gorm:"default:'Aktif';column:status_akun" json:"status"`
	GPA             float64   `gorm:"column:ipk;default:0" json:"gpa"`
	TotalCredits    int       `gorm:"column:total_sks;default:0" json:"totalSks"`
	EntryYear       int       `gorm:"column:tahun_masuk" json:"entryYear"`
	Address         string    `gorm:"type:text;column:alamat" json:"address"`
	Phone           string    `gorm:"column:no_hp" json:"phone"`
	CreatedAt       time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"createdAt"`
	
	// Kolom tambahan — dibutuhkan oleh fitur profil & dashboard (juga ada di SQL schema 04)
	CurrentSemester int        `gorm:"column:current_semester;default:1" json:"currentSemester"`
	PhotoURL        string     `gorm:"column:foto_url" json:"photoUrl"`
	Email           string     `gorm:"column:email_personal" json:"email"` // Email personal (bukan akun)
	BirthPlace      string     `gorm:"column:tempat_lahir" json:"birthPlace"`
	BirthDate       *time.Time `gorm:"column:tanggal_lahir" json:"birthDate"`
	Gender          string     `gorm:"column:jenis_kelamin" json:"gender"`
	Religion        string     `gorm:"column:agama" json:"religion"`
	City            string     `gorm:"column:kota" json:"city"`
	ZipCode         string     `gorm:"column:kode_pos" json:"zipCode"`
	GolonganDarah   string     `gorm:"column:golongan_darah" json:"golongan_darah"`
	CreditLimit     int        `gorm:"column:credit_limit;default:24" json:"creditLimit"`
}

func (Student) TableName() string {
	return "mahasiswa"
}

// --- ACADEMIC & KRS ENTITIES ---

type PeriodeAkademik struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `gorm:"column:nama_periode;not null" json:"name"` // "Ganjil 2026/2027"
	Semester string `gorm:"column:semester" json:"semester"`        // "Ganjil", "Genap"
	IsActive bool   `gorm:"column:is_aktif;default:false" json:"is_active"`
	KRSOpen  bool   `gorm:"column:krs_buka;default:false" json:"krs_open"`
}

func (PeriodeAkademik) TableName() string {
	return "periode_akademik"
}

type MataKuliah struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Code      string `gorm:"column:kode_mk;uniqueIndex;not null" json:"code"`
	Name      string `gorm:"column:nama_mk;not null" json:"name"`
	SKS       int    `gorm:"column:sks" json:"sks"`
	Semester  int    `gorm:"column:semester" json:"semester"`
	MajorID   uint   `gorm:"column:prodi_id" json:"major_id"`
	Major     Major  `gorm:"foreignKey:MajorID" json:"major,omitempty"`
	IsAktif   bool   `gorm:"column:is_aktif;default:true" json:"is_active"`
	CreatedAt time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (MataKuliah) TableName() string {
	return "mata_kuliah"
}

type MataKuliahPrasyarat struct {
	ID            uint       `gorm:"primaryKey"`
	MataKuliahID  uint       `gorm:"index"`
	MataKuliah    MataKuliah `gorm:"foreignKey:MataKuliahID"`
	PrasyaratID   uint
	Prasyarat     MataKuliah `gorm:"foreignKey:PrasyaratID"`
}

type JadwalKuliah struct {
	ID            uint            `gorm:"primaryKey" json:"id"`
	MataKuliahID  uint            `gorm:"column:mk_id" json:"mk_id"`
	MataKuliah    MataKuliah      `gorm:"foreignKey:MataKuliahID" json:"mata_kuliah,omitempty"`
	LecturerID    uint            `gorm:"column:dosen_id" json:"lecturer_id"`
	Lecturer      Lecturer        `gorm:"foreignKey:LecturerID" json:"lecturer,omitempty"`
	PeriodeID     uint            `gorm:"column:periode_id" json:"periode_id"`
	PeriodeAkademik PeriodeAkademik `gorm:"foreignKey:PeriodeID" json:"periode,omitempty"`
	Hari          int             `gorm:"column:hari" json:"hari"` // 1-7
	JamMulai      string          `gorm:"column:jam_mulai" json:"jam_mulai"`
	JamSelesai    string          `gorm:"column:jam_selesai" json:"jam_selesai"`
	Ruang         string          `gorm:"column:ruangan" json:"ruangan"`
	Kuota         int             `gorm:"column:kuota" json:"kuota"`
	SisaKuota     int             `gorm:"column:sisa_kuota" json:"sisa_kuota"`
	TahunAkademik string          `gorm:"column:tahun_akademik" json:"tahun_akademik"`
}

func (JadwalKuliah) TableName() string {
	return "jadwal_kuliah"
}

type KHS struct {
	ID              uint            `gorm:"primaryKey"`
	StudentID       uint
	Student         Student         `gorm:"foreignKey:StudentID"`
	MataKuliahID    uint
	MataKuliah      MataKuliah      `gorm:"foreignKey:MataKuliahID"`
	PeriodeID       uint
	PeriodeAkademik PeriodeAkademik `gorm:"foreignKey:PeriodeID"`
	NilaiHuruf      string          // "A", "B", "C", "D", "E"
	Bobot           float64         // 4.0, 3.0, 2.0, 1.0, 0.0
}

type KRSHeader struct {
	ID              uint            `gorm:"primaryKey" json:"id"`
	StudentID       uint            `gorm:"column:mahasiswa_id" json:"student_id"`
	Student         Student         `gorm:"foreignKey:StudentID" json:"-"`
	PeriodeID       uint            `gorm:"column:periode_id" json:"periode_id"`
	PeriodeAkademik PeriodeAkademik `gorm:"foreignKey:PeriodeID" json:"periode,omitempty"`
	Status          string          `gorm:"column:status;default:'draft'" json:"status"` // "draft", "menunggu_approval", "disetujui", "ditolak"
	TotalSKS        int             `gorm:"column:total_sks;default:0" json:"total_sks"`
	CatatanWali     string          `gorm:"column:catatan_wali;type:text" json:"catatan_wali"`
	SubmittedAt     *time.Time      `gorm:"column:dikirim_pada" json:"submitted_at"`
}

func (KRSHeader) TableName() string {
	return "krs_header"
}

type KRSDetail struct {
	ID             uint         `gorm:"primaryKey" json:"id"`
	KRSHeaderID    uint         `gorm:"column:krs_id;index" json:"krs_id"`
	KRSHeader      KRSHeader    `gorm:"foreignKey:KRSHeaderID;constraint:OnDelete:CASCADE" json:"-"`
	JadwalKuliahID uint         `gorm:"column:jadwal_id" json:"jadwal_id"`
	JadwalKuliah   JadwalKuliah `gorm:"foreignKey:JadwalKuliahID" json:"jadwal,omitempty"`
}

func (KRSDetail) TableName() string {
	return "krs_detail"
}

// --- MODUL KENCANA (PKKMB) ---
type KencanaTahap struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	Nama           string     `gorm:"column:nama;not null" json:"nama"` // pra, inti, pasca
	Label          string     `gorm:"column:label;not null" json:"label"` // Pra-KENCANA, KENCANA Inti, Pasca-KENCANA
	Urutan         int        `gorm:"column:urutan" json:"urutan"`
	TanggalMulai   *time.Time `gorm:"column:tanggal_mulai" json:"tanggal_mulai"`
	TanggalSelesai *time.Time `gorm:"column:tanggal_selesai" json:"tanggal_selesai"`
	Status         string     `gorm:"column:status;default:'akan_datang'" json:"status"` // akan_datang, berlangsung, selesai
	IsAktif        bool       `gorm:"column:is_aktif;default:true" json:"is_aktif"`
}

func (KencanaTahap) TableName() string {
	return "kencana_tahap"
}

type KencanaMateri struct {
	ID          uint         `gorm:"primaryKey" json:"id"`
	TahapID     uint         `gorm:"column:tahap_id" json:"tahap_id"`
	Tahap       KencanaTahap `gorm:"foreignKey:TahapID" json:"tahap,omitempty"`
	Judul       string       `gorm:"column:judul;not null" json:"judul"`
	Deskripsi   string       `gorm:"column:deskripsi;type:text" json:"deskripsi"`
	FileURL     string       `gorm:"column:file_url" json:"file_url"`
	Tipe        string       `gorm:"column:tipe" json:"tipe"` // pdf, video
	Urutan      int          `gorm:"column:urutan" json:"urutan"`
	IsAktif     bool         `gorm:"column:is_aktif;default:true" json:"is_aktif"`
	CreatedAt   time.Time    `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (KencanaMateri) TableName() string {
	return "kencana_materi"
}

type KencanaKuis struct {
	ID              uint          `gorm:"primaryKey" json:"id"`
	KencanaMateriID uint          `gorm:"column:materi_id" json:"materi_id"`
	KencanaMateri   KencanaMateri `gorm:"foreignKey:KencanaMateriID" json:"materi,omitempty"`
	Judul           string        `gorm:"column:judul" json:"judul"`
	PassingGrade    int           `gorm:"column:passing_grade;default:75" json:"passing_grade"`
	BobotPersen     float64       `gorm:"column:bobot_persen;default:0" json:"bobot_persen"` 
	DurasiMenit     *int          `gorm:"column:durasi_menit" json:"durasi_menit"`
	IsAktif         bool          `gorm:"column:is_aktif;default:true" json:"is_aktif"`
}

func (KencanaKuis) TableName() string {
	return "kencana_kuis"
}

type KuisSoal struct {
	ID            uint        `gorm:"primaryKey" json:"id"`
	KencanaKuisID uint        `gorm:"column:kuis_id" json:"kuis_id"`
	KencanaKuis   KencanaKuis `gorm:"foreignKey:KencanaKuisID" json:"-"`
	Pertanyaan    string      `gorm:"column:pertanyaan;type:text" json:"pertanyaan"`
	OpsiA         string      `gorm:"column:opsi_a" json:"opsi_a"`
	OpsiB         string      `gorm:"column:opsi_b" json:"opsi_b"`
	OpsiC         string      `gorm:"column:opsi_c" json:"opsi_c"`
	OpsiD         string      `gorm:"column:opsi_d" json:"opsi_d"`
	KunciJawaban  string      `gorm:"column:kunci_jawaban" json:"-"`
	Urutan        int         `gorm:"column:urutan" json:"urutan"`
}

func (KuisSoal) TableName() string {
	return "kuis_soal"
}

type KencanaHasilKuis struct {
	ID            uint        `gorm:"primaryKey" json:"id"`
	StudentID     uint        `gorm:"column:mahasiswa_id" json:"student_id"`
	Student       Student     `gorm:"foreignKey:StudentID" json:"-"`
	KencanaKuisID uint        `gorm:"column:kuis_id" json:"kuis_id"`
	KencanaKuis   KencanaKuis `gorm:"foreignKey:KencanaKuisID" json:"-"`
	Skor          float64     `gorm:"column:skor" json:"skor"`
	JumlahBenar   int         `gorm:"column:jumlah_benar" json:"jumlah_benar"`
	TotalSoal     int         `gorm:"column:total_soal" json:"total_soal"`
	Lulus         bool        `gorm:"column:lulus" json:"lulus"`
	PercobaanKe   int         `gorm:"column:percobaan_ke" json:"percobaan_ke"`
	CreatedAt     time.Time   `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (KencanaHasilKuis) TableName() string {
	return "kencana_hasil_kuis"
}

type KencanaProgress struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	StudentID         uint      `gorm:"uniqueIndex" json:"student_id"`
	Student           Student   `gorm:"foreignKey:StudentID" json:"-"`
	NilaiKumulatif    float64   `gorm:"default:0" json:"nilai_kumulatif"`
	StatusKeseluruhan string    `gorm:"default:'belum_mulai'" json:"status_keseluruhan"` // belum_mulai, berlangsung, lulus, tidak_lulus
	LastUpdated       time.Time `json:"last_updated"`
}

type KencanaBanding struct {
	ID           uint        `gorm:"primaryKey" json:"id"`
	StudentID    uint        `json:"student_id"`
	Student      Student     `gorm:"foreignKey:StudentID" json:"-"`
	KuisID       uint        `json:"kuis_id"`
	Kuis         KencanaKuis `gorm:"foreignKey:KuisID" json:"kuis,omitempty"`
	Alasan       string      `gorm:"type:text" json:"alasan"`
	BuktiURL     string      `json:"bukti_url"`
	Status       string      `gorm:"default:'menunggu'" json:"status"` // menunggu, diproses, diterima, ditolak
	CatatanAdmin string      `gorm:"type:text" json:"catatan_admin"`
	DiprosesOleh *uint       `json:"diproses_oleh"`
	DiprosesAt   *time.Time  `json:"diproses_at"`
	CreatedAt    time.Time   `json:"created_at"`
}

type KencanaSertifikat struct {
	ID              uint    `gorm:"primaryKey"`
	StudentID       uint
	Student         Student `gorm:"foreignKey:StudentID"`
	NomorSertifikat string  `gorm:"uniqueIndex"`
	FileURL         string
	DiterbitkanAt   time.Time
}

// --- MODUL ACHIEVEMENT ---
type Achievement struct {
	ID                 uint       `gorm:"primaryKey" json:"id"`
	StudentID          uint       `gorm:"column:mahasiswa_id" json:"studentId"`
	Student            Student    `gorm:"foreignKey:StudentID" json:"student"`
	NamaLomba          string     `gorm:"not null;column:nama_prestasi" json:"title"`
	Kategori           string     `gorm:"column:bidang" json:"category"` // Akademik/Non-Akademik/Olahraga/Seni
	Penyelenggara      string     `gorm:"column:penyelenggara" json:"institution"`
	Tingkat            string     `gorm:"column:tingkat" json:"level"` // Lokal/Nasional/Internasional
	Tahun              int        `gorm:"column:tahun" json:"year"`
	Peringkat          string     `gorm:"column:peringkat" json:"rank"` // Juara 1/2/3/Finalis/Peserta
	SertifikatURL      string     `gorm:"column:sertifikat_url" json:"evidenceUrl"`
	Status             string     `gorm:"column:status;default:'MENUNGGU'" json:"status"`
	PoinSKPI           int        `gorm:"column:poin_skpi;default:0" json:"points"`
	CatatanVerifikator string     `gorm:"type:text;column:catatan" json:"notes"`
	// Kolom verifikasi — ada di SQL schema 04
	VerifiedBy         *uint      `gorm:"column:verified_by" json:"verifiedBy"`
	VerifiedAt         *time.Time `gorm:"column:verified_at" json:"verifiedAt"`
	CreatedAt          time.Time  `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"createdAt"`
}

func (Achievement) TableName() string {
	return "prestasi"
}

// --- MODUL SCHOLARSHIP ---
type Beasiswa struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	Nama              string    `gorm:"not null;column:nama_beasiswa" json:"nama"`
	Penyelenggara     string    `gorm:"column:penyelenggara" json:"penyelenggara"`
	Deskripsi         string    `gorm:"type:text;column:deskripsi" json:"deskripsi"`
	SyaratIPKMin      float64   `gorm:"column:min_ipk" json:"syarat_ipk_min"`
	Deadline          time.Time `gorm:"column:deadline" json:"deadline"`
	Kuota             int       `gorm:"column:kuota" json:"kuota"`
	Status            string    `gorm:"column:status;default:'Buka'" json:"status"`
	CreatedAt         time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
	// Kolom extended — ada di SQL schema 04
	Kategori          string    `gorm:"column:kategori" json:"kategori"` // Internal/Alumni/Mitra
	Persyaratan       string    `gorm:"type:text;column:persyaratan" json:"persyaratan"`
	NilaiBantuan      float64   `gorm:"column:nilai_bantuan" json:"nilai_bantuan"`
	SisaKuota         int       `gorm:"column:sisa_kuota" json:"sisa_kuota"`
	IsBerbasisEkonomi bool      `gorm:"column:is_berbasis_ekonomi;default:false" json:"is_berbasis_ekonomi"`
	IsAktif           bool      `gorm:"column:is_aktif;default:true" json:"is_aktif"`
}

func (Beasiswa) TableName() string {
	return "beasiswa"
}

type PengajuanBeasiswa struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	BeasiswaID     uint      `gorm:"column:beasiswa_id" json:"beasiswa_id"`
	Beasiswa       Beasiswa  `gorm:"foreignKey:BeasiswaID" json:"beasiswa,omitempty"`
	StudentID      uint      `gorm:"column:mahasiswa_id" json:"student_id"`
	Student        Student   `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	FileURL        string    `gorm:"column:dokumen_url" json:"file_url"`
	Status         string    `gorm:"column:status;default:'Proses'" json:"status"`
	CatatanAdmin   string    `gorm:"type:text;column:catatan" json:"catatan_admin"`
	SubmittedAt    time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"submitted_at"`
	// Kolom extended — ada di SQL schema 04
	NomorReferensi string    `gorm:"column:nomor_referensi;uniqueIndex" json:"nomor_referensi"`
	Motivasi       string    `gorm:"column:motivasi;type:text" json:"motivasi"`
	Prestasi       string    `gorm:"column:prestasi;type:text" json:"prestasi"`
	UpdatedAt      time.Time `gorm:"column:diupdate_pada" json:"updated_at"`
}

func (PengajuanBeasiswa) TableName() string {
	return "pendaftaran_beasiswa"
}

type PengajuanBerkas struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	PengajuanID uint      `json:"pengajuan_id"`
	TipeBerkas  string    `json:"tipe_berkas"` // foto, ktm, kk, sktm, transkrip, lainnya
	FileURL     string    `json:"file_url"`
	UploadedAt  time.Time `json:"uploaded_at"`
}

type PengajuanPipelineLog struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	PengajuanID  uint      `json:"pengajuan_id"`
	Tahap        string    `json:"tahap"`
	CatatanAdmin string    `gorm:"type:text" json:"catatan_admin"`
	DiubahOleh   uint      `json:"diubah_oleh"`
	CreatedAt    time.Time `json:"created_at"`
}

// --- MODUL COUNSELING ---
type JadwalKonseling struct {
	ID           uint   `gorm:"primaryKey"`
	Tipe         string // Akademik/Karir/Personal
	NamaKonselor string
	Tanggal      time.Time
	JamMulai     string
	JamSelesai   string
	Kuota        int
	SisaKuota    int
	Lokasi       string
	IsAktif      bool `gorm:"default:true"`
}

type BookingKonseling struct {
	ID        uint      `gorm:"primaryKey"`
	StudentID uint      `gorm:"column:mahasiswa_id"`
	Student   Student   `gorm:"foreignKey:StudentID"`
	Jenis     string    `gorm:"column:jenis"` // Akademik/Karir/Personal
	Tanggal   time.Time `gorm:"column:tanggal"`
	Jam       string    `gorm:"column:jam"`
	Status    string    `gorm:"column:status;default:'pending'"` // pending/dikonfirmasi/selesai
	Konselor  string    `gorm:"column:konselor"`
	Catatan   string    `gorm:"type:text;column:catatan"`
	CreatedAt time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP"`
	// Kolom extended — ada di SQL schema 04
	JadwalID        uint            `gorm:"column:jadwal_id"`
	JadwalKonseling JadwalKonseling `gorm:"foreignKey:JadwalID"`
	KeluhanAwal     string          `gorm:"column:keluhan_awal;type:text"`
}

func (BookingKonseling) TableName() string {
	return "konseling"
}

// --- MODUL HEALTH SCREENING ---
type HasilKesehatan struct {
	ID                    uint      `gorm:"primaryKey" json:"id"`
	StudentID             uint      `json:"student_id"`
	Student               Student   `gorm:"foreignKey:StudentID" json:"-"`
	TanggalPeriksa        time.Time `json:"tanggal_periksa"`
	TinggiBadan           float64   `json:"tinggi_badan"` // cm
	BeratBadan            float64   `json:"berat_badan"`  // kg
	BMI                   float64   `json:"bmi"`
	TekananDarahSistolik  int       `json:"sistolik"`
	TekananDarahDiastolik int       `json:"diastolik"`
	GolonganDarah         string    `json:"golongan_darah"`
	Keluhan               string    `gorm:"type:text" json:"keluhan"`
	CatatanMedis          string    `gorm:"type:text" json:"catatan_medis"`
	StatusKesehatan       string    `json:"status_kesehatan"` // sehat/perlu_perhatian/perlu_tindak_lanjut
	Sumber                string    `json:"sumber"`           // mandiri/kencana_screening/klinik_kampus
	PetugasID             *uint     `json:"petugas_id"`       // ID petugas jika dari petugas
	DiperiksaOleh         string    `json:"diperiksa_oleh"`   // Nama pemeriksa (string)
	CreatedAt             time.Time `json:"created_at"`
}

// --- MODUL STUDENT VOICE ---
// Catatan: ID menggunakan UUID (bukan SERIAL integer dari target schema awal)
// karena seluruh logic dan API endpoint sudah bergantung pada UUID.
type TiketAspirasi struct {
	ID            string               `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	NomorTiket    string               `gorm:"column:nomor_tiket;uniqueIndex;not null" json:"nomor_tiket"` // SV-YYYYMMDD-XXXX
	StudentID     uint                 `gorm:"column:mahasiswa_id" json:"student_id"`
	Student       Student              `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Judul         string               `gorm:"column:judul;size:255;not null" json:"judul"`
	Isi           string               `gorm:"column:deskripsi;type:text;not null" json:"isi"`
	Kategori      string               `gorm:"column:kategori" json:"kategori"` // Akademik | Fasilitas | Kemahasiswaan | Saran & Ide | Lainnya
	Status        string               `gorm:"column:status;default:'proses'" json:"status"`
	Tanggapan     string               `gorm:"column:tanggapan;type:text" json:"tanggapan"`
	CreatedAt     time.Time            `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt     time.Time            `gorm:"column:diupdate_pada" json:"updated_at"`
	// Kolom extended Student Voice — ada di SQL schema 04
	FakultasID    uint                 `gorm:"column:fakultas_id" json:"fakultas_id"`
	Fakultas      Faculty              `gorm:"foreignKey:FakultasID" json:"fakultas,omitempty"`
	LampiranURL   string               `gorm:"column:lampiran_url;size:500" json:"lampiran_url"`
	IsAnonim      bool                 `gorm:"column:is_anonim;default:false" json:"is_anonim"`
	LevelSaatIni  string               `gorm:"column:level_saat_ini;default:'fakultas'" json:"level_saat_ini"` // fakultas | universitas | selesai
	Timeline      []TiketTimelineEvent `gorm:"foreignKey:TiketID" json:"timeline,omitempty"`
}

func (TiketAspirasi) TableName() string {
	return "aspirasi"
}

type TiketTimelineEvent struct {
	ID            string    `gorm:"primaryKey;default:gen_random_uuid()" json:"id"`
	TiketID       string    `gorm:"not null;index" json:"tiket_id"`
	TipeEvent     string    `json:"tipe_event"` // dikirim | diterima_fakultas | respons_fakultas | diteruskan_universitas | respons_universitas | selesai | dibatalkan
	Level         string    `json:"level"`      // sistem | fakultas | universitas
	IsiRespons    string    `gorm:"type:text" json:"isi_respons"`
	DilakukanOleh *uint     `json:"dilakukan_oleh"` // Admin ID (optional)
	CreatedAt     time.Time `json:"created_at"`
}

// --- MODUL ORGANISASI ---
type RiwayatOrganisasi struct {
	ID                uint    `gorm:"primaryKey"`
	StudentID         uint
	Student           Student `gorm:"foreignKey:StudentID"`
	NamaOrganisasi    string
	Tipe              string // UKM/Himpunan/BEM/DPM/Komunitas
	Jabatan           string
	PeriodeMulai      int  // Year
	PeriodeSelesai    *int // Year
	DeskripsiKegiatan string `gorm:"type:text"`
	Apresiasi         string `gorm:"type:text" json:"apresiasi"`
	StatusVerifikasi  string // Menunggu/Diverifikasi
	CreatedAt         time.Time
}

// --- DASHBOARD & GENERAL ---

// --- DASHBOARD & GENERAL ---

type Pengumuman struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Judul       string     `gorm:"column:judul;not null" json:"judul"`
	IsiSingkat  string     `gorm:"column:isi_singkat;type:text" json:"isi_singkat"`
	IsiLengkap  string     `gorm:"column:isi_lengkap;type:text" json:"isi_lengkap"`
	Kategori    string     `gorm:"column:kategori" json:"kategori"` // Akademik, Kemahasiswaan, Umum
	IsPinned    bool       `gorm:"column:is_pinned;default:false" json:"is_pinned"`
	IsAktif     bool       `gorm:"column:is_aktif;default:true" json:"is_aktif"`
	PublishedAt *time.Time `gorm:"column:diterbitkan_pada" json:"published_at"`
	CreatedAt   time.Time  `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"column:diupdate_pada" json:"updated_at"`
}

func (Pengumuman) TableName() string {
	return "pengumuman"
}

type KegiatanKampus struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	Judul          string     `gorm:"column:judul;not null" json:"judul"`
	Deskripsi      string     `gorm:"column:deskripsi;type:text" json:"deskripsi"`
	TanggalMulai   time.Time  `gorm:"column:tanggal_mulai;not null" json:"tanggal_mulai"`
	TanggalSelesai *time.Time `gorm:"column:tanggal_selesai" json:"tanggal_selesai"`
	Kategori       string     `gorm:"column:kategori" json:"kategori"` // kencana, beasiswa, konseling, kampus, organisasi
	IsAktif        bool       `gorm:"column:is_aktif;default:true" json:"is_aktif"`
	CreatedAt      time.Time  `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (KegiatanKampus) TableName() string {
	return "kegiatan_kampus"
}

type AktivitasLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	StudentID uint      `gorm:"column:mahasiswa_id;not null" json:"student_id"`
	Student   Student   `gorm:"foreignKey:StudentID" json:"-"`
	Tipe      string    `gorm:"column:tipe;not null" json:"tipe"` // achievement, beasiswa, konseling, kencana, student_voice, organisasi
	Deskripsi string    `gorm:"column:deskripsi;not null" json:"deskripsi"`
	Link      string    `gorm:"column:tautan" json:"link"`
	CreatedAt time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (AktivitasLog) TableName() string {
	return "log_aktivitas"
}

type LoginHistory struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"column:pengguna_id;not null" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"-"`
	IPAddress string    `gorm:"column:alamat_ip" json:"ip_address"`
	UserAgent string    `gorm:"column:user_agent" json:"user_agent"`
	Status    string    `gorm:"column:status" json:"status"` // Berhasil / Gagal
	CreatedAt time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (LoginHistory) TableName() string {
	return "riwayat_login"
}

type NotificationPreference struct {
	ID               uint    `gorm:"primaryKey" json:"id"`
	UserID           uint    `gorm:"column:pengguna_id;not null" json:"user_id"`
	User             User    `gorm:"foreignKey:UserID" json:"-"`
	EmailAchievement bool    `gorm:"column:notif_prestasi;default:true" json:"email_achievement"`
	EmailBeasiswa    bool    `gorm:"column:notif_beasiswa;default:true" json:"email_beasiswa"`
	EmailCounseling  bool    `gorm:"column:notif_konseling;default:true" json:"email_konseling"`
	EmailVoice       bool    `gorm:"column:notif_aspirasi;default:true" json:"email_student_voice"`
	EmailKencana     bool    `gorm:"column:notif_kencana;default:true" json:"email_kencana"`
	EmailNews        bool    `gorm:"column:notif_pengumuman;default:true" json:"email_pengumuman"`
}

func (NotificationPreference) TableName() string {
	return "preferensi_notifikasi"
}

type Notification struct {
	ID        string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	UserID    uint      `gorm:"column:pengguna_id;not null;index" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"-"`
	Type      string    `gorm:"column:tipe;size:50;not null" json:"type"` // achievement, beasiswa, konseling, student_voice, kencana, sistem
	Title     string    `gorm:"column:judul;size:200;not null" json:"title"`
	Message   string    `gorm:"column:pesan;type:text;not null" json:"content"`
	Link      string    `gorm:"column:tautan;size:300" json:"link"`
	IsRead    bool      `gorm:"column:sudah_dibaca;default:false" json:"is_read"`
	ReadAt    *time.Time `gorm:"column:dibaca_pada" json:"read_at"`
	CreatedAt time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (Notification) TableName() string {
	return "notifikasi"
}

// --- AUDIT LOG ---

// AuditLog represents every sensitive action performed by admins
type AuditLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"column:pengguna_id" json:"userId"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	Action    string    `gorm:"column:aksi" json:"action"` // e.g. "UPDATE_ROLE", "DELETE_PROPOSAL"
	Entity    string    `gorm:"column:entitas" json:"entity"` // e.g. "users", "proposals"
	EntityID  uint      `gorm:"column:entitas_id" json:"entityId"`
	OldValue  string    `gorm:"type:text;column:nilai_lama" json:"oldValue"`
	NewValue  string    `gorm:"type:text;column:nilai_baru" json:"newValue"`
	IPAddress string    `gorm:"column:alamat_ip" json:"ipAddress"`
	UserAgent string    `gorm:"column:user_agent" json:"userAgent"`
	CreatedAt time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"createdAt"`
}

func (AuditLog) TableName() string {
	return "log_audit"
}

// AcademicSettings represents the global university state controlled by Super Admin
type AcademicSettings struct {
	ID                uint   `gorm:"primaryKey"`
	ActiveYear        string `gorm:"column:tahun_aktif" json:"activeYear"`       
	ActiveSemester    string `gorm:"column:semester_aktif" json:"activeSemester"`   
	IsKrsOpen         bool   `gorm:"default:false;column:krs_buka" json:"isKrsOpen"`
	IsGradeInputOpen  bool   `gorm:"default:false;column:nilai_buka" json:"isGradeInputOpen"`
	LastModifiedBy    uint   `gorm:"column:diubah_oleh" json:"lastModifiedBy"`
	UpdatedAt         time.Time
}

func (AcademicSettings) TableName() string {
	return "pengaturan_akademik"
}

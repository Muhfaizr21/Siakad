package models

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// ========================
// BASE
// ========================

type BaseModel struct {
	ID        uint `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

// ========================
// USER
// ========================

type User struct {
	BaseModel
	Email    string `gorm:"uniqueIndex;not null"`
	Password string `gorm:"column:password_hash;not null"`
	Role     string `gorm:"index"`

	Mahasiswa *Mahasiswa `gorm:"foreignKey:PenggunaID"`
	Dosen     *Dosen     `gorm:"foreignKey:PenggunaID"`
}

// ========================
// MASTER DATA
// ========================

type Fakultas struct {
	BaseModel
	Nama  string
	Kode  string `gorm:"uniqueIndex"`
	Dekan string
	Email string
	NoHP  string

	ProgramStudi []ProgramStudi `gorm:"foreignKey:FakultasID"`
	Dosen        []Dosen        `gorm:"foreignKey:FakultasID"`
	Mahasiswa    []Mahasiswa    `gorm:"foreignKey:FakultasID"`
	Proposals    []Proposal     `gorm:"foreignKey:FakultasID"`
}

type ProgramStudi struct {
	BaseModel
	FakultasID uint
	Fakultas   Fakultas `gorm:"foreignKey:FakultasID"`

	Nama        string
	Kode        string `gorm:"uniqueIndex"`
	Jenjang     string
	Akreditasi  string
	Kapasitas   int
	KepalaProdi string

	Dosen     []Dosen     `gorm:"foreignKey:ProgramStudiID"`
	Mahasiswa []Mahasiswa `gorm:"foreignKey:ProgramStudiID"`
}

type Dosen struct {
	BaseModel
	PenggunaID uint
	Pengguna   User `gorm:"foreignKey:PenggunaID"`

	NIDN           string `gorm:"uniqueIndex"`
	Nama           string
	FakultasID     uint `gorm:"index"`
	ProgramStudiID uint `gorm:"index"`

	Fakultas     Fakultas
	ProgramStudi ProgramStudi

	Jabatan string
	IsDPA   bool
	Email   string
	NoHP    string
	Alamat  string

	MahasiswaBimbingan []Mahasiswa `gorm:"foreignKey:DosenPAID;references:ID"`
	Konseling          []Konseling
}

type Mahasiswa struct {
	BaseModel
	PenggunaID uint
	Pengguna   User `gorm:"foreignKey:PenggunaID"`

	NIM  string `gorm:"uniqueIndex"`
	Nama string

	FakultasID     uint `gorm:"index"`
	ProgramStudiID uint `gorm:"index"`
	DosenPAID      *uint `gorm:"index"`

	Fakultas     Fakultas
	ProgramStudi ProgramStudi
	DosenPA      *Dosen `gorm:"foreignKey:DosenPAID"`

	SemesterSekarang int
	StatusAkun       string
	StatusAkademik   string

	IPK         float64
	TotalSKS    int
	CreditLimit int
	TahunMasuk  int
	JalurMasuk  string

	NIK              string
	NISN             string
	TempatLahir      string
	TanggalLahir     time.Time
	JenisKelamin     string
	Agama            string
	Kewarganegaraan  string
	StatusPernikahan string

	EmailKampus   string
	EmailPersonal string
	NoHP          string
	Alamat        string
	Kota          string
	KodePos       string

	NamaAyah        string
	NamaIbuKandung  string
	PekerjaanAyah   string
	PekerjaanIbu    string
	PenghasilanOrtu int

	AsalSekolah   string
	GolonganDarah string
	FotoURL       string
	KontakDarurat string

	Prestasi          []Prestasi            `gorm:"foreignKey:MahasiswaID"`
	Beasiswa          []BeasiswaPendaftaran `gorm:"foreignKey:MahasiswaID"`
	Aspirasi          []Aspirasi            `gorm:"foreignKey:MahasiswaID"`
	Konseling         []Konseling           `gorm:"foreignKey:MahasiswaID"`
	Kesehatan         []Kesehatan           `gorm:"foreignKey:MahasiswaID"`
	LogAktivitas      []LogAktivitas        `gorm:"foreignKey:UserID"`
	RiwayatOrganisasi []RiwayatOrganisasi   `gorm:"foreignKey:MahasiswaID"`
	PengajuanSurat    []PengajuanSurat      `gorm:"foreignKey:MahasiswaID"`
	PkkmbProgress     []PkkmbProgress       `gorm:"foreignKey:MahasiswaID"`
	PkkmbHasil        *PkkmbHasil           `gorm:"foreignKey:MahasiswaID"`
	PkkmbBanding      *PkkmbBanding         `gorm:"foreignKey:MahasiswaID"`
	PkkmbSertifikat   *PkkmbSertifikat      `gorm:"foreignKey:MahasiswaID"`
}

// ========================
// AKADEMIK
// ========================

type PengaturanAkademik struct {
	BaseModel
	TahunAkademik string
	Semester      string
	IsKRSOpen     bool
	IsNilaiOpen   bool
	IsMBKMOpen    bool
}

type ProgramMBKM struct {
	BaseModel
	NamaProgram        string
	Jenis              string
	Mitra              string
	Deskripsi          string
	SKSKonversiDefault int
	Periode            string
}

// ========================
// LAYANAN
// ========================

type Prestasi struct {
	BaseModel
	MahasiswaID uint
	Mahasiswa   Mahasiswa

	NamaKegiatan string
	Kategori     string
	Tingkat      string
	Peringkat    string
	Status       string
	Poin         int
	BuktiURL     string
}

type Beasiswa struct {
	BaseModel
	Nama          string
	Penyelenggara string
	Deskripsi     string
	Deadline      time.Time
	Kuota         int
	IPKMin        float64

	Pendaftaran []BeasiswaPendaftaran
}

type BeasiswaPendaftaran struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	BeasiswaID  uint `gorm:"index"`

	Mahasiswa Mahasiswa
	Beasiswa  Beasiswa

	Status   string
	Catatan  string
	BuktiURL string
}

type Aspirasi struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	Mahasiswa   Mahasiswa

	Judul    string
	Isi      string
	Kategori string
	Tujuan   string
	Status    string
	Prioritas string // LOW, MEDIUM, HIGH, CRITICAL
	Deadline  *time.Time
	IsAnonim bool
	Respon   string
}

type Konseling struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	DosenID     uint `gorm:"index"`

	Mahasiswa Mahasiswa
	Dosen     Dosen

	Tanggal time.Time
	Topik   string
	Status  string
	Catatan string
}

type PengajuanSurat struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	Mahasiswa   Mahasiswa

	Jenis      string
	NomorSurat string
	Status     string
	FileURL    string
	Catatan    string
}

type Kesehatan struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	Mahasiswa   Mahasiswa

	Tanggal          time.Time
	JenisPemeriksaan string // misal: Screening Tahunan, Cek Rutin
	Hasil            string // Sehat, Pantauan, Perlu Perhatian
	Catatan          string
	FileURL          string

	// Detail Medis (Completeness like Health Screening)
	TinggiBadan     float64
	BeratBadan      float64
	Sistole         int
	Diastole        int
	GulaDarah       int
	ButaWarna       string // Normal, Parsial, Total
	RiwayatPenyakit string
	StatusKesehatan string // prima, stabil, kritis
	GolonganDarah   string // A, B, AB, O
}

type LogAktivitas struct {
	BaseModel
	UserID    uint `gorm:"index"`
	User      User `gorm:"foreignKey:UserID"`
	Aktivitas string
	Deskripsi string
	IPAddress string
}

type RiwayatOrganisasi struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	OrmawaID    uint `gorm:"index"`

	Mahasiswa Mahasiswa
	Ormawa    Ormawa

	Jabatan string
	Periode string
	Status  string
}

type Notifikasi struct {
	BaseModel
	UserID uint `gorm:"index"`
	User   User

	Judul     string
	Deskripsi string
	Tipe      string
	IsRead    bool
}

// ========================
// ORMAWA
// ========================

type Ormawa struct {
	BaseModel
	Nama      string
	Deskripsi string
	Visi      string
	Misi      string
	LogoURL   string
	Email     string
	Phone     string
	Instagram string
	Website   string

	Anggota    []OrmawaAnggota     `gorm:"foreignKey:OrmawaID"`
	Kegiatan   []OrmawaKegiatan    `gorm:"foreignKey:OrmawaID"`
	Mutasi     []OrmawaMutasiSaldo `gorm:"foreignKey:OrmawaID"`
	Proposals  []Proposal          `gorm:"foreignKey:OrmawaID"`
	Pengumuman []OrmawaPengumuman  `gorm:"foreignKey:OrmawaID"`
	Divisi     []OrmawaDivisi      `gorm:"foreignKey:OrmawaID"`
	Aspirasi   []OrmawaAspirasi    `gorm:"foreignKey:OrmawaID"`
	Notifikasi []OrmawaNotifikasi  `gorm:"foreignKey:OrmawaID"`
}

type OrmawaAnggota struct {
	BaseModel
	OrmawaID    uint `gorm:"index"`
	MahasiswaID uint `gorm:"index"`

	Ormawa    Ormawa
	Mahasiswa Mahasiswa

	Role     string
	Divisi   string
	Status   string
	ParentID *uint
	JoinedAt time.Time
}

type OrmawaDivisi struct {
	BaseModel
	OrmawaID uint `gorm:"index"`
	Ormawa   Ormawa

	Nama      string
	Deskripsi string
}

type OrmawaRole struct {
	BaseModel
	Nama        string
	Deskripsi   string
	Permissions datatypes.JSON
}

type OrmawaKegiatan struct {
	BaseModel
	OrmawaID uint `gorm:"index"`
	Ormawa   Ormawa

	Judul          string
	Deskripsi      string
	TanggalMulai   time.Time
	TanggalSelesai time.Time
	Lokasi         string
	Status         string

	Kehadiran []OrmawaKehadiran `gorm:"foreignKey:KegiatanID"`
}

type OrmawaKehadiran struct {
	BaseModel
	KegiatanID  uint `gorm:"index"`
	MahasiswaID uint `gorm:"index"`

	Kegiatan  OrmawaKegiatan `gorm:"foreignKey:KegiatanID"`
	Mahasiswa Mahasiswa

	Status     string
	WaktuHadir time.Time
}

type OrmawaPengumuman struct {
	BaseModel
	OrmawaID uint `gorm:"index"`
	Ormawa   Ormawa

	Judul          string
	Isi            string
	Target         string
	TanggalMulai   time.Time
	TanggalSelesai time.Time
}

type OrmawaMutasiSaldo struct {
	BaseModel
	OrmawaID   uint  `gorm:"index"`
	ProposalID *uint `gorm:"index"`

	Ormawa   Ormawa
	Proposal *Proposal

	Tipe      string
	Nominal   float64
	Kategori  string
	Deskripsi string
	Tanggal   time.Time
}

// ========================
// PROPOSAL
// ========================

type Proposal struct {
	BaseModel
	OrmawaID    uint `gorm:"index"`
	MahasiswaID uint `gorm:"index"`
	FakultasID  uint `gorm:"index"`

	Ormawa    Ormawa
	Mahasiswa Mahasiswa
	Fakultas  Fakultas

	Judul           string
	TanggalKegiatan time.Time
	Anggaran        float64
	Jenis           string
	Status          string
	Catatan         string

	ApprovedDosenID    *uint `gorm:"index"`
	ApprovedFakultasID *uint `gorm:"index"`

	Riwayat []ProposalRiwayat           `gorm:"foreignKey:ProposalID"`
	LPJ     []LaporanPertanggungjawaban `gorm:"foreignKey:ProposalID"`
}

type ProposalRiwayat struct {
	BaseModel
	ProposalID uint `gorm:"index"`
	Proposal   Proposal

	Status    string
	Catatan   string
	CreatedBy uint
}

type LaporanPertanggungjawaban struct {
	BaseModel
	ProposalID uint `gorm:"index"`
	Proposal   Proposal

	RealisasiAnggaran float64
	Status            string
	Catatan           string
	FileURL           string
}

// ========================
// PKKMB
// ========================

type PkkmbKegiatan struct {
	BaseModel
	Judul     string
	Deskripsi string
	Tanggal   time.Time
	Lokasi    string
}

type PkkmbProgress struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	KegiatanID  uint `gorm:"index"`

	Mahasiswa Mahasiswa
	Kegiatan  PkkmbKegiatan

	Status string
}

type PkkmbHasil struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	Mahasiswa   Mahasiswa

	Nilai           float64
	StatusKelulusan string
}

type PkkmbBanding struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	Mahasiswa   Mahasiswa

	Alasan string
	Status string
}

type PkkmbSertifikat struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	Mahasiswa   Mahasiswa

	FileURL       string
	TanggalTerbit time.Time
}

// ========================
// KONTEN
// ========================

type Berita struct {
	BaseModel
	Judul     string
	Isi       string
	GambarURL string

	PenulisID uint `gorm:"index"`
	Penulis   User

	Status         string
	TanggalPublish time.Time
}

type OrmawaAspirasi struct {
	BaseModel
	OrmawaID    uint `gorm:"index"`
	MahasiswaID uint `gorm:"index"`

	Ormawa    Ormawa
	Mahasiswa Mahasiswa

	Kategori  string
	Judul     string
	Isi       string
	Status    string `gorm:"default:'pending'"` // pending, ditanggapi, diabaikan
	Tanggapan string
}

type OrmawaNotifikasi struct {
	BaseModel
	OrmawaID uint   `gorm:"index"`
	Tipe     string // approval, proposal, finance, event
	Judul    string
	Pesan    string
	IsRead   bool `gorm:"default:false"`
}

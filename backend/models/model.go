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
	Email      string `gorm:"uniqueIndex;not null" json:"email"`
	Password   string `gorm:"column:password" json:"-"`
	Role       string `gorm:"index" json:"role"`
	FakultasID *uint  `gorm:"index" json:"fakultas_id"`
	OrmawaID   *uint  `gorm:"index" json:"ormawa_id"`
	OrmawaAssign string `gorm:"size:100" json:"ormawa_assign"`

	Dosen *Dosen `gorm:"foreignKey:PenggunaID" json:"dosen,omitempty"`
}

func (User) TableName() string {
	return "public.users"
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

func (Fakultas) TableName() string {
	return "fakultas.fakultas"
}

type ProgramStudi struct {
	BaseModel
	FakultasID uint     `gorm:"index"`
	Fakultas   Fakultas `gorm:"foreignKey:FakultasID"`

	Nama             string
	Kode             string `gorm:"uniqueIndex"`
	Jenjang          string
	Akreditasi       string
	Kapasitas        int
	CurrentMahasiswa int64 `json:"CurrentMahasiswa" gorm:"-"`
	KepalaProdi      string

	Dosen     []Dosen     `gorm:"foreignKey:ProgramStudiID"`
	Mahasiswa []Mahasiswa `gorm:"foreignKey:ProgramStudiID"`
}

func (ProgramStudi) TableName() string {
	return "fakultas.program_studi"
}

type Dosen struct {
	BaseModel
	PenggunaID uint  `json:"pengguna_id"`
	Pengguna   *User `gorm:"foreignKey:PenggunaID" json:"pengguna,omitempty"`

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

func (Dosen) TableName() string {
	return "fakultas.dosen"
}

type Mahasiswa struct {
	BaseModel
	PenggunaID uint
	Pengguna   User `gorm:"foreignKey:PenggunaID;references:ID"`

	NIM  string `gorm:"uniqueIndex"`
	Nama string

	FakultasID     uint  `gorm:"index"`
	ProgramStudiID uint  `gorm:"index"`
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

func (Mahasiswa) TableName() string {
	return "mahasiswa.mahasiswa"
}

// ========================
// AKADEMIK
// ========================

type AcademicPeriod struct {
	BaseModel
	Name         string `gorm:"column:nama_periode"`
	Semester     string `gorm:"column:semester"`
	AcademicYear string `gorm:"column:tahun_ajaran"`
	IsActive     bool   `gorm:"column:is_aktif"`
	IsKRSOpen    bool   `gorm:"column:krs_buka"`
}

func (AcademicPeriod) TableName() string {
	return "fakultas.academic_periods"
}

type PengaturanAkademik struct {
	BaseModel
	TahunAkademik string
	Semester      string
	IsKRSOpen     bool
	IsNilaiOpen   bool
	IsMBKMOpen    bool
}

func (PengaturanAkademik) TableName() string {
	return "fakultas.pengaturan_akademik"
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

func (ProgramMBKM) TableName() string {
	return "fakultas.program_mbkm"
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

	RiwayatOrganisasiID *uint
	RiwayatOrganisasi   *RiwayatOrganisasi `gorm:"foreignKey:RiwayatOrganisasiID"`
}

func (Prestasi) TableName() string {
	return "mahasiswa.prestasi"
}

type Beasiswa struct {
	BaseModel
	Nama          string
	Penyelenggara string
	Deskripsi     string
	Deadline      time.Time
	Kuota         int
	IPKMin        float64
	Kategori      string
	NilaiBantuan  float64
	Anggaran      float64 `json:"anggaran"`

	Pendaftaran []BeasiswaPendaftaran
}

func (Beasiswa) TableName() string {
	return "mahasiswa.beasiswa"
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

func (BeasiswaPendaftaran) TableName() string {
	return "mahasiswa.beasiswa_pendaftaran"
}

type Aspirasi struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	Mahasiswa   Mahasiswa

	Judul     string
	Isi       string
	Kategori  string
	Tujuan    string
	Status    string
	Prioritas string // LOW, MEDIUM, HIGH, CRITICAL
	Deadline  *time.Time
	IsAnonim  bool
	Respon    string
}

func (Aspirasi) TableName() string {
	return "mahasiswa.aspirasi"
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

func (Konseling) TableName() string {
	return "mahasiswa.konseling"
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

func (PengajuanSurat) TableName() string {
	return "mahasiswa.pengajuan_surat"
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

func (Kesehatan) TableName() string {
	return "mahasiswa.kesehatan"
}

type LogAktivitas struct {
	BaseModel
	UserID    uint `gorm:"index"`
	User      User `gorm:"foreignKey:UserID"`
	Aktivitas string
	Deskripsi string
	IPAddress string
}

func (LogAktivitas) TableName() string {
	return "mahasiswa.log_aktivitas"
}

type RiwayatOrganisasi struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	OrmawaID    uint `gorm:"index"`

	Mahasiswa Mahasiswa
	Ormawa    Ormawa

	NamaOrganisasi    string
	Tipe              string
	Jabatan           string
	PeriodeMulai      int
	PeriodeSelesai    *int
	DeskripsiKegiatan string
	Apresiasi         string
	StatusVerifikasi  string `gorm:"default:'Menunggu'"`

	// Fields from nidan for compatibility
	Periode string
	Status  string

	Prestasi []Prestasi `gorm:"foreignKey:RiwayatOrganisasiID"`
}

func (RiwayatOrganisasi) TableName() string {
	return "mahasiswa.riwayat_organisasis"
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

func (Notifikasi) TableName() string {
	return "mahasiswa.notifikasi"
}

// ========================
// ORMAWA
// ========================

type Ormawa struct {
	BaseModel
	Nama      string
	Singkatan string `gorm:"size:20"`
	Deskripsi string
	FakultasID uint `gorm:"index"`
	Fakultas   Fakultas

	// Faculty Admin fields
	Status        string `gorm:"default:'Aktif'"`
	Kategori      string `gorm:"default:'Himpunan'"` // BEM, Himpunan, UKM, Komunitas, Lainnya
	JumlahAnggota int    `json:"JumlahAnggota"`

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
	Notifikasi []OrmawaNotifikasi  `gorm:"foreignKey:OrmawaID" json:"notifikasi,omitempty"`
}

func (Ormawa) TableName() string {
	return "ormawa.ormawa"
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

func (OrmawaAnggota) TableName() string {
	return "ormawa.ormawa_anggota"
}

type OrmawaDivisi struct {
	BaseModel
	OrmawaID uint `gorm:"index"`
	Ormawa   Ormawa

	Nama      string
	Deskripsi string
}

func (OrmawaDivisi) TableName() string {
	return "ormawa.ormawa_divisi"
}

type OrmawaRole struct {
	BaseModel
	Nama        string
	Deskripsi   string
	Permissions datatypes.JSON
}

func (OrmawaRole) TableName() string {
	return "ormawa.ormawa_role"
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

func (OrmawaKegiatan) TableName() string {
	return "ormawa.ormawa_kegiatan"
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

func (OrmawaKehadiran) TableName() string {
	return "ormawa.ormawa_kehadiran"
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

func (OrmawaPengumuman) TableName() string {
	return "ormawa.ormawa_pengumuman"
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

func (OrmawaMutasiSaldo) TableName() string {
	return "ormawa.ormawa_mutasi_saldo"
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

func (Proposal) TableName() string {
	return "ormawa.proposal"
}

type ProposalRiwayat struct {
	BaseModel
	ProposalID uint `gorm:"index"`
	Proposal   Proposal

	Status    string
	Catatan   string
	CreatedBy uint
}

func (ProposalRiwayat) TableName() string {
	return "ormawa.proposal_riwayat"
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

func (LaporanPertanggungjawaban) TableName() string {
	return "ormawa.laporan_pertanggungjawaban"
}

// ========================
// PKKMB
// ========================

// ========================
// KENCANA (PKKMB)
// ========================

type PkkmbTahap struct {
	BaseModel
	Label          string    `json:"label"`
	Status         string    `json:"status"` // akan_datang, berlangsung, selesai
	TanggalMulai   time.Time `json:"tanggal_mulai"`
	TanggalSelesai time.Time `json:"tanggal_selesai"`
	Order          int       `json:"order"`

	Materis []PkkmbMateri `gorm:"foreignKey:TahapID" json:"materis,omitempty"`
}

func (PkkmbTahap) TableName() string {
	return "mahasiswa.pkkmb_tahap"
}

type PkkmbMateri struct {
	BaseModel
	TahapID   uint   `gorm:"index" json:"tahap_id"`
	Judul     string `json:"judul"`
	Tipe      string `json:"tipe"` // PDF, VIDEO
	FileURL   string `json:"file_url"`
	Deskripsi string `json:"deskripsi"`
	Order     int    `json:"order"`

	Quiz *PkkmbQuiz `gorm:"foreignKey:MateriID" json:"kuis,omitempty"`
}

func (PkkmbMateri) TableName() string {
	return "mahasiswa.pkkmb_materi"
}

type PkkmbKegiatan struct {
	BaseModel
	Judul     string
	Deskripsi string
	Tanggal   time.Time
	Lokasi    string
}

func (PkkmbKegiatan) TableName() string {
	return "mahasiswa.pkkmb_kegiatan"
}

type PkkmbProgress struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	KegiatanID  uint `gorm:"index"`

	Mahasiswa Mahasiswa
	Kegiatan  PkkmbKegiatan

	Status string
}

func (PkkmbProgress) TableName() string {
	return "mahasiswa.pkkmb_progress"
}

type PkkmbHasil struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	Mahasiswa   Mahasiswa

	Nilai           float64
	StatusKelulusan string
}

func (PkkmbHasil) TableName() string {
	return "mahasiswa.pkkmb_hasil"
}

type PkkmbBanding struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	Mahasiswa   Mahasiswa

	Alasan string
	Status string
}

func (PkkmbBanding) TableName() string {
	return "mahasiswa.pkkmb_banding"
}

type PkkmbSertifikat struct {
	BaseModel
	MahasiswaID uint `gorm:"index"`
	Mahasiswa   Mahasiswa

	FileURL       string
	TanggalTerbit time.Time
}

func (PkkmbSertifikat) TableName() string {
	return "mahasiswa.pkkmb_sertifikat"
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

func (Berita) TableName() string {
	return "fakultas.berita"
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

func (OrmawaAspirasi) TableName() string {
	return "ormawa.ormawa_aspirasi"
}

type OrmawaNotifikasi struct {
	BaseModel
	OrmawaID uint   `gorm:"index"`
	Tipe     string // approval, proposal, finance, event
	Judul    string
	Pesan    string
	IsRead   bool `gorm:"default:false"`
}

func (OrmawaNotifikasi) TableName() string {
	return "ormawa.ormawa_notifikasi"
}

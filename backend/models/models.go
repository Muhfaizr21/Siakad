package models

import (
	"time"

	"gorm.io/gorm"
)

// --- BASE ENTITIES ---

type Role struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"unique;not null"`
}

type User struct {
	gorm.Model
	Email        string `gorm:"unique;not null"`
	PasswordHash string `gorm:"not null"`
	RoleID       uint
	Role         Role `gorm:"foreignKey:RoleID"`
	IsActive     bool `gorm:"default:true"`
}

type Faculty struct {
	ID       uint   `gorm:"primaryKey"`
	Name     string `gorm:"not null"`
	Code     string `gorm:"unique;not null"`
	DeanName string
}

type Major struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"not null"`
	FacultyID   uint
	Faculty     Faculty `gorm:"foreignKey:FacultyID"`
	DegreeLevel string
}

type Lecturer struct {
	ID        uint   `gorm:"primaryKey"`
	UserID    uint
	User      User   `gorm:"foreignKey:UserID"`
	NIDN      string `gorm:"unique"`
	Name      string `gorm:"not null"`
	FacultyID uint
	Faculty   Faculty `gorm:"foreignKey:FacultyID"`
	IsDPA     bool   `gorm:"default:false"`
}

type Student struct {
	ID              uint      `gorm:"primaryKey"`
	UserID          uint      `gorm:"not null"`
	User            User      `gorm:"foreignKey:UserID"`
	NIM             string    `gorm:"unique;not null;column:nim"`
	Name            string    `gorm:"not null;column:nama"`
	MajorID         uint      `gorm:"column:prodi_id"`
	Major           Major     `gorm:"foreignKey:MajorID"`
	DPALecturerID   *uint     // optional
	DPALecturer     *Lecturer `gorm:"foreignKey:DPALecturerID"`
	CurrentSemester int       `gorm:"default:1"`
	Status          string    `gorm:"default:'aktif'"`
	EntryYear       int16     `gorm:"column:angkatan"`
	PhotoURL        string    `gorm:"column:foto_url"`
	// Additional Personal Data
	Email      string
	Phone      string
	BirthPlace string
	BirthDate  *time.Time
	Gender     string // Laki-laki / Perempuan
	Religion   string
	Address    string `gorm:"type:text"`
	City       string
	ZipCode    string
	GolonganDarah string `json:"golongan_darah"` // A, B, AB, O
}

// --- ACADEMIC & KRS ENTITIES ---

type PeriodeAkademik struct {
	ID       uint   `gorm:"primaryKey"`
	Name     string `gorm:"not null"`             // e.g. "Ganjil 2026/2027"
	Semester string `gorm:"not null"`             // "Ganjil", "Genap", "Pendek"
	IsActive bool   `gorm:"default:false"`        // Is this the currently running period?
	KRSOpen  bool   `gorm:"default:false"`        // Is KRS input open?
}

type MataKuliah struct {
	ID       uint   `gorm:"primaryKey"`
	Code     string `gorm:"unique;not null"`
	Name     string `gorm:"not null;column:nama"`
	SKS      int    `gorm:"not null"`
	Semester int    // Recommended semester to take this course
	MajorID  uint   `gorm:"column:prodi_id"`
	Major    Major  `gorm:"foreignKey:MajorID"`
}

type MataKuliahPrasyarat struct {
	ID            uint       `gorm:"primaryKey"`
	MataKuliahID  uint       `gorm:"index"`
	MataKuliah    MataKuliah `gorm:"foreignKey:MataKuliahID"`
	PrasyaratID   uint
	Prasyarat     MataKuliah `gorm:"foreignKey:PrasyaratID"`
}

type JadwalKuliah struct {
	ID               uint            `gorm:"primaryKey"`
	MataKuliahID     uint
	MataKuliah       MataKuliah      `gorm:"foreignKey:MataKuliahID"`
	LecturerID       uint            // Dosen
	Lecturer         Lecturer        `gorm:"foreignKey:LecturerID"`
	PeriodeID        uint
	PeriodeAkademik  PeriodeAkademik `gorm:"foreignKey:PeriodeID"`
	Hari             int             // 1=Senin, 2=Selasa, etc.
	JamMulai         string          `gorm:"not null"` // e.g., "08:00"
	JamSelesai       string          `gorm:"not null"` // e.g., "10:30"
	Ruang            string          `gorm:"not null"`
	Kuota            int             `gorm:"not null;default:40"`
	TahunAkademik    string
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
	ID              uint            `gorm:"primaryKey"`
	StudentID       uint
	Student         Student         `gorm:"foreignKey:StudentID"`
	PeriodeID       uint
	PeriodeAkademik PeriodeAkademik `gorm:"foreignKey:PeriodeID"`
	Status          string          `gorm:"default:'draft'"` // "draft", "menunggu_approval", "disetujui", "ditolak"
	TotalSKS        int             `gorm:"default:0"`
	CatatanWali     string          `gorm:"type:text"`
	SubmittedAt     *time.Time
}

type KRSDetail struct {
	ID             uint         `gorm:"primaryKey"`
	KRSHeaderID    uint         `gorm:"index"`
	KRSHeader      KRSHeader    `gorm:"foreignKey:KRSHeaderID;constraint:OnDelete:CASCADE"`
	JadwalKuliahID uint
	JadwalKuliah   JadwalKuliah `gorm:"foreignKey:JadwalKuliahID"`
}

// --- MODUL KENCANA (PKKMB) ---
type KencanaTahap struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	Nama           string     `gorm:"not null" json:"nama"` // pra, inti, pasca
	Label          string     `gorm:"not null" json:"label"` // Pra-KENCANA, KENCANA Inti, Pasca-KENCANA
	Urutan         int        `json:"urutan"`
	TanggalMulai   *time.Time `json:"tanggal_mulai"`
	TanggalSelesai *time.Time `json:"tanggal_selesai"`
	Status         string     `gorm:"default:'akan_datang'" json:"status"` // akan_datang, berlangsung, selesai
	IsAktif        bool       `gorm:"default:true" json:"is_aktif"`
}

type KencanaMateri struct {
	ID          uint         `gorm:"primaryKey" json:"id"`
	TahapID     uint         `gorm:"column:tahap_id" json:"tahap_id"`
	Tahap       KencanaTahap `gorm:"foreignKey:TahapID" json:"tahap,omitempty"`
	Judul       string       `gorm:"not null" json:"judul"`
	Deskripsi   string       `gorm:"type:text" json:"deskripsi"`
	FileURL     string       `json:"file_url"`
	Tipe        string       `json:"tipe"` // pdf, video
	Urutan      int          `json:"urutan"`
	IsAktif     bool         `gorm:"default:true" json:"is_aktif"`
	CreatedAt   time.Time    `json:"created_at"`
}

type KencanaKuis struct {
	ID              uint          `gorm:"primaryKey" json:"id"`
	KencanaMateriID uint          `json:"materi_id"`
	KencanaMateri   KencanaMateri `gorm:"foreignKey:KencanaMateriID" json:"materi,omitempty"`
	Judul           string        `json:"judul"`
	PassingGrade    int           `gorm:"default:75" json:"passing_grade"`
	BobotPersen     float64       `gorm:"default:0" json:"bobot_persen"` // bobot kuis dalam perhitungan kumulatif
	DurasiMenit     *int          `json:"durasi_menit"` // null = tidak ada timer
	IsAktif         bool          `gorm:"default:true" json:"is_aktif"`
}

type KuisSoal struct {
	ID            uint        `gorm:"primaryKey" json:"id"`
	KencanaKuisID uint        `json:"kuis_id"`
	KencanaKuis   KencanaKuis `gorm:"foreignKey:KencanaKuisID" json:"-"`
	Pertanyaan    string      `gorm:"type:text" json:"pertanyaan"`
	OpsiA         string      `json:"opsi_a"`
	OpsiB         string      `json:"opsi_b"`
	OpsiC         string      `json:"opsi_c"`
	OpsiD         string      `json:"opsi_d"`
	KunciJawaban  string      `json:"-"` // NEVER expose ke API
	Urutan        int         `json:"urutan"`
}

type KencanaHasilKuis struct {
	ID            uint        `gorm:"primaryKey" json:"id"`
	StudentID     uint        `json:"student_id"`
	Student       Student     `gorm:"foreignKey:StudentID" json:"-"`
	KencanaKuisID uint        `json:"kuis_id"`
	KencanaKuis   KencanaKuis `gorm:"foreignKey:KencanaKuisID" json:"-"`
	Nilai         float64     `json:"nilai"`
	JumlahBenar   int         `json:"jumlah_benar"`
	TotalSoal     int         `json:"total_soal"`
	Lulus         bool        `json:"lulus"`
	AttemptKe     int         `json:"attempt_ke"`
	DikerjakanAt  time.Time   `json:"dikerjakan_at"`
	CreatedAt     time.Time   `json:"created_at"`
}

type KencanaProgress struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	StudentID          uint      `gorm:"uniqueIndex" json:"student_id"`
	Student            Student   `gorm:"foreignKey:StudentID" json:"-"`
	NilaiKumulatif     float64   `gorm:"default:0" json:"nilai_kumulatif"`
	StatusKeseluruhan  string    `gorm:"default:'belum_mulai'" json:"status_keseluruhan"` // belum_mulai, berlangsung, lulus, tidak_lulus
	LastUpdated        time.Time `json:"last_updated"`
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
	ID              uint   `gorm:"primaryKey"`
	StudentID       uint
	Student         Student `gorm:"foreignKey:StudentID"`
	NomorSertifikat string `gorm:"uniqueIndex"`
	FileURL         string
	DiterbitkanAt   time.Time
}

// --- MODUL ACHIEVEMENT ---
type Achievement struct {
	ID                 uint   `gorm:"primaryKey"`
	StudentID          uint
	Student            Student `gorm:"foreignKey:StudentID"`
	NamaLomba          string `gorm:"not null"`
	Kategori           string // Akademik/Non-Akademik/Olahraga/Seni
	Penyelenggara      string
	Tingkat            string // Lokal/Nasional/Internasional
	Tanggal            time.Time
	Peringkat          string // Juara 1/2/3/Finalis/Peserta
	SertifikatURL      string
	Status             string // Menunggu/Diverifikasi/Ditolak
	CatatanVerifikator string `gorm:"type:text"`
	VerifiedBy         *uint
	VerifiedAt         *time.Time
	CreatedAt          time.Time
}

// --- MODUL SCHOLARSHIP ---
type Beasiswa struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	Nama              string    `gorm:"not null" json:"nama"`
	Penyelenggara     string    `json:"penyelenggara"`
	Kategori          string    `json:"kategori"` // Internal/Alumni/Mitra
	Deskripsi         string    `gorm:"type:text" json:"deskripsi"`
	Persyaratan       string    `gorm:"type:text" json:"persyaratan"`
	NilaiBantuan      float64   `json:"nilai_bantuan"`
	Kuota             int       `json:"kuota"`
	SisaKuota         int       `json:"sisa_kuota"`
	Deadline          time.Time `json:"deadline"`
	SyaratIPKMin      float64   `json:"syarat_ipk_min"`
	IsBerbasisEkonomi bool      `json:"is_berbasis_ekonomi"`
	IsAktif           bool      `gorm:"default:true" json:"is_aktif"`
	CreatedAt         time.Time `json:"created_at"`
}

type PengajuanBeasiswa struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	StudentID      uint      `json:"student_id"`
	Student        Student   `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	BeasiswaID     uint      `json:"beasiswa_id"`
	Beasiswa       Beasiswa  `gorm:"foreignKey:BeasiswaID" json:"beasiswa,omitempty"`
	NomorReferensi string    `gorm:"uniqueIndex" json:"nomor_referensi"`
	Motivasi       string    `gorm:"type:text" json:"motivasi"`
	Prestasi       string    `gorm:"type:text" json:"prestasi"`
	Status         string    `gorm:"default:'dikirim'" json:"status"` // dikirim, seleksi_berkas, evaluasi, review, penetapan, diterima, ditolak
	CatatanAdmin   string    `gorm:"type:text" json:"catatan_admin"`
	SubmittedAt    time.Time `json:"submitted_at"`
	UpdatedAt      time.Time `json:"updated_at"`
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
	ID              uint   `gorm:"primaryKey"`
	StudentID       uint
	Student         Student `gorm:"foreignKey:StudentID"`
	JadwalID        uint
	JadwalKonseling JadwalKonseling `gorm:"foreignKey:JadwalID"`
	KeluhanAwal     string `gorm:"type:text"`
	Status          string // Menunggu/Dikonfirmasi/Selesai/Dibatalkan
	CatatanKonselor string `gorm:"type:text"`
	CreatedAt       time.Time
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
type TiketAspirasi struct {
	ID            string               `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	NomorTiket    string               `gorm:"uniqueIndex;not null" json:"nomor_tiket"` // SV-YYYYMMDD-XXXX
	StudentID     uint                 `json:"student_id"`
	Student       Student              `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	FakultasID    uint                 `json:"fakultas_id"` // Routing Awal
	Fakultas      Faculty              `gorm:"foreignKey:FakultasID" json:"fakultas,omitempty"`
	Kategori      string               `json:"kategori"` // Akademik | Fasilitas | Kemahasiswaan | Saran & Ide | Lainnya
	Judul         string               `gorm:"size:150;not null" json:"judul"`
	Isi           string               `gorm:"type:text;not null" json:"isi"`
	LampiranURL   string               `gorm:"size:500" json:"lampiran_url"`
	IsAnonim      bool                 `gorm:"default:false" json:"is_anonim"`
	LevelSaatIni  string               `gorm:"default:'fakultas'" json:"level_saat_ini"` // fakultas | universitas | selesai
	Status        string               `gorm:"default:'menunggu'" json:"status"`        // menunggu | diproses | ditindaklanjuti | selesai
	Timeline      []TiketTimelineEvent `gorm:"foreignKey:TiketID" json:"timeline,omitempty"`
	CreatedAt     time.Time            `json:"created_at"`
	UpdatedAt     time.Time            `json:"updated_at"`
}

type TiketTimelineEvent struct {
	ID           string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	TiketID      string    `gorm:"type:uuid;not null;index" json:"tiket_id"`
	TipeEvent    string    `json:"tipe_event"` // dikirim | diterima_fakultas | respons_fakultas | diteruskan_universitas | respons_universitas | selesai | dibatalkan
	Level        string    `json:"level"`      // sistem | fakultas | universitas
	IsiRespons   string    `gorm:"type:text" json:"isi_respons"`
	DilakukanOleh *uint     `json:"dilakukan_oleh"` // Admin ID (optional)
	CreatedAt    time.Time `json:"created_at"`
}

// --- MODUL ORGANISASI ---
type RiwayatOrganisasi struct {
	ID                 uint   `gorm:"primaryKey"`
	StudentID          uint
	Student            Student `gorm:"foreignKey:StudentID"`
	NamaOrganisasi     string
	Tipe               string // UKM/Himpunan/BEM/DPM/Komunitas
	Jabatan            string
	PeriodeMulai       int // Year
	PeriodeSelesai     *int // Year
	DeskripsiKegiatan  string `gorm:"type:text"`
	StatusVerifikasi   string // Menunggu/Diverifikasi
	CreatedAt          time.Time
}

// --- DASHBOARD & GENERAL ---

type KegiatanKampus struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Judul          string    `gorm:"not null" json:"judul"`
	Deskripsi      string    `gorm:"type:text" json:"deskripsi"`
	TanggalMulai   time.Time `gorm:"not null" json:"tanggal_mulai"`
	TanggalSelesai *time.Time `json:"tanggal_selesai"`
	Kategori       string    `json:"kategori"` // kencana, beasiswa, konseling, kampus, organisasi
	IsAktif        bool      `gorm:"default:true" json:"is_aktif"`
	CreatedAt      time.Time `json:"created_at"`
	CreatedBy      uint      `json:"created_by"`
}

type AktivitasLog struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	StudentID   uint      `gorm:"not null" json:"student_id"`
	Student     Student   `gorm:"foreignKey:StudentID" json:"-"`
	Tipe        string    `gorm:"not null" json:"tipe"` // achievement, beasiswa, konseling, kencana, student_voice, organisasi
	Deskripsi   string    `gorm:"not null" json:"deskripsi"`
	Link        string    `json:"link"`
	CreatedAt   time.Time `json:"created_at"`
}

// --- PENGUMUMAN ---
type Pengumuman struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Judul       string     `gorm:"not null" json:"judul"`
	IsiSingkat  string     `gorm:"type:text" json:"isi_singkat"`
	IsiLengkap  string     `gorm:"type:text" json:"isi_lengkap"`
	Kategori    string     `json:"kategori"` // Akademik, Kemahasiswaan, Umum
	IsPinned    bool       `gorm:"default:false" json:"is_pinned"`
	IsAktif     bool       `gorm:"default:true" json:"is_aktif"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	CreatedBy   uint       `json:"created_by"`
}

// --- PROFILE SETTINGS ---

type LoginHistory struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	StudentID   uint      `gorm:"not null" json:"student_id"`
	Student     Student   `gorm:"foreignKey:StudentID" json:"-"`
	IPAddress   string    `json:"ip_address"`
	UserAgent   string    `json:"user_agent"`
	Location    string    `json:"location"`
	Status      string    `json:"status"` // Berhasil / Gagal
	CreatedAt   time.Time `json:"created_at"`
}

type NotificationPreference struct {
	ID             uint    `gorm:"primaryKey" json:"id"`
	StudentID      uint    `gorm:"not null" json:"student_id"`
	Student        Student `gorm:"foreignKey:StudentID" json:"-"`
	EmailAchievement bool  `gorm:"default:true" json:"email_achievement"`
	EmailBeasiswa    bool  `gorm:"default:true" json:"email_beasiswa"`
	EmailCounseling bool  `gorm:"default:true" json:"email_konseling"`
	EmailVoice       bool  `gorm:"default:true" json:"email_student_voice"`
	EmailKencana     bool  `gorm:"default:true" json:"email_kencana"`
	EmailNews        bool  `gorm:"default:true" json:"email_pengumuman"`
}

// --- NOTIFIKASI ---

type Notification struct {
	ID          string     `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	StudentID   uint       `gorm:"not null;index:idx_notif_unread" json:"student_id"`
	Student     Student    `gorm:"foreignKey:StudentID" json:"-"`
	Type        string     `gorm:"size:50;not null" json:"type"` // achievement, beasiswa, konseling, student_voice, kencana, sistem
	Title       string     `gorm:"size:200;not null" json:"title"`
	Content     string     `gorm:"type:text;not null" json:"content"`
	Link        string     `gorm:"size:300" json:"link"`
	IsRead      bool       `gorm:"default:false;index:idx_notif_unread" json:"is_read"`
	ReadAt      *time.Time `json:"read_at"`
	CreatedAt   time.Time  `gorm:"default:now();index:idx_notif_created" json:"created_at"`
}

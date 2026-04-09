package models

import (
	"time"
)

// Matakuliah represents a subject in the faculty admin module
// DEPRECATED: Tabel "matakuliah" tidak ada di schema target Indonesia.
// Gunakan MataKuliah (mata_kuliah) di models.go untuk modul baru.
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
// DEPRECATED: Tabel "ruangan" tidak ada di schema target Indonesia.
// Perlu ditambahkan ke schema atau dihapus jika tidak digunakan.
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
// DEPRECATED: Tabel "schedules" tidak ada di schema target Indonesia.
// Gunakan JadwalKuliah (jadwal_kuliah) di models.go.
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
// DEPRECATED: Tabel "aspirations" (Inggris) tidak ada di schema target.
// Gunakan TiketAspirasi (aspirasi) di models.go.
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
// DEPRECATED: Tabel "letter_requests" tidak ada di schema target Indonesia.
// Perlu didesain ulang dengan nama Indonesia jika fitur ini diperlukan.
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
// DEPRECATED: Tabel "graduation_submissions" tidak ada di schema target Indonesia.
// Perlu didesain ulang dengan nama Indonesia jika fitur kelulusan diperlukan.
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
// DEPRECATED: Tabel "mbkm_programs" tidak ada di schema target Indonesia.
// Perlu didesain ulang jika fitur MBKM akan diaktifkan.
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
// DEPRECATED: Tabel "scholarships" (Inggris) tidak ada di schema target.
// Gunakan Beasiswa (beasiswa) di models.go.
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
// DEPRECATED: Tabel "scholarship_applications" (Inggris) tidak ada di schema target.
// Gunakan PengajuanBeasiswa (pendaftaran_beasiswa) di models.go.
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

// OrmawaProposal — DEPRECATED: Tabel "ormawa_proposals" tidak ada di schema utama.
// Ini dikelola oleh modul Ormawa terpisah di routes/ormawa.
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

// FacultyOrganization — DEPRECATED: Tabel "faculty_organizations" tidak ada di schema target.
// Perlu didesain ulang dengan nama Indonesia jika fitur organisasi fakultas diperlukan.
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

// Article merepresentasikan tabel `berita`.
// Selaras dengan schema target Indonesia (berita).
type Article struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"column:judul;not null" json:"title"`
	Content   string    `gorm:"column:konten;type:text" json:"content"`
	Category  string    `gorm:"column:kategori" json:"category"` // Berita, Pengumuman, Agenda
	Author    string    `gorm:"column:penulis" json:"author"`
	Status    string    `gorm:"column:status;default:'Terbit'" json:"status"` // Terbit, Draft
	CreatedAt time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"createdAt"`
	
	// Complex features kept
	Thumbnail string    `gorm:"column:thumbnail" json:"thumbnail"`
	Views     int       `gorm:"column:views;default:0" json:"views"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (Article) TableName() string {
	return "berita"
}

func (ScholarshipApplication) TableName() string {
	return "scholarship_applications"
}

type Admission struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	NomorDaftar  string    `gorm:"column:nomor_daftar;unique;not null" json:"nomorDaftar"`
	NamaLengkap  string    `gorm:"column:nama_lengkap;not null" json:"namaLengkap"`
	Email        string    `gorm:"column:email" json:"email"`
	PilihanProdi string    `gorm:"column:pilihan_prodi" json:"pilihanProdi"`
	Status       string    `gorm:"column:status;default:'Pending'" json:"status"`
	CreatedAt    time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"createdAt"`
	
	// Additional fields from logic
	NoHp         string    `gorm:"column:no_hp" json:"noHp"`
	Jalur        string    `gorm:"column:jalur" json:"jalur"` // SNBP, SNBT, Mandiri
	NilaiRapor   float64   `gorm:"column:nilai_rapor" json:"nilaiRapor"`
	TanggalDaftar time.Time `gorm:"column:tanggal_daftar" json:"tanggalDaftar"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

func (Admission) TableName() string {
	return "pendaftaran_mahasiswa_baru"
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

type ProgramScreening struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Periode    string    `gorm:"column:periode;not null" json:"periode"`
	TargetSmt  string    `gorm:"column:target_smt" json:"target_smt"`
	Status     string    `gorm:"column:status;default:'Berlangsung'" json:"status"`
	CreatedAt  time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (ProgramScreening) TableName() string {
	return "program_screening"
}

type HasilScreening struct {
	ID          uint             `gorm:"primaryKey" json:"id"`
	StudentID   uint             `gorm:"column:mahasiswa_id" json:"student_id"`
	Student     Student          `gorm:"foreignKey:StudentID" json:"-"`
	ProgramID   uint             `gorm:"column:program_id" json:"program_id"`
	Program     ProgramScreening `gorm:"foreignKey:ProgramID" json:"program,omitempty"`
	Kondisi     string           `gorm:"column:kondisi" json:"kondisi"` // Prima, Pantauan, Riwayat
	Catatan     string           `gorm:"column:catatan;type:text" json:"catatan"`
	CreatedAt   time.Time        `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (HasilScreening) TableName() string {
	return "hasil_screening"
}

type PkkmbKegiatan struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Judul       string    `gorm:"column:judul;not null" json:"judul"`
	Deskripsi   string    `gorm:"column:deskripsi;type:text" json:"deskripsi"` // [NEW] Detail agenda kegiatan
	Tanggal     time.Time `gorm:"column:tanggal" json:"tanggal"`
	JamMulai    string    `gorm:"column:jam_mulai" json:"jam_mulai"`
	JamSelesai  string    `gorm:"column:jam_selesai" json:"jam_selesai"`
	Lokasi      string    `gorm:"column:lokasi" json:"lokasi"`
	Pemateri    string    `gorm:"column:pemateri" json:"pemateri"`
	Wajib       bool      `gorm:"column:wajib;default:true" json:"wajib"` // [NEW] Flag wajib/opsional
	CreatedAt   time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (PkkmbKegiatan) TableName() string {
	return "pkkmb_kegiatan"
}

// Grade represents a student's score for a subject
// DEPRECATED: Tabel "grades" (Inggris) tidak ada di schema target Indonesia.
// Gunakan KHS (khs) di models.go untuk nilai mahasiswa.
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

// ============================================================
//  MODEL-MODEL BARU — Sesuai schema v3.0.0
// ============================================================

// PeriodeAkademikFak merepresentasikan tabel fakultas_admin.periode_akademik [NEW]
type PeriodeAkademikFak struct {
	ID             uint       `gorm:"primaryKey;column:id" json:"id"`
	NamaPeriode    string     `gorm:"column:nama_periode;not null" json:"nama_periode"`
	Semester       string     `gorm:"column:semester" json:"semester"`
	TahunAjaran    string     `gorm:"column:tahun_ajaran" json:"tahun_ajaran"`
	TanggalMulai   *time.Time `gorm:"column:tanggal_mulai" json:"tanggal_mulai"`
	TanggalSelesai *time.Time `gorm:"column:tanggal_selesai" json:"tanggal_selesai"`
	IsAktif        bool       `gorm:"column:is_aktif;default:false" json:"is_aktif"`
	KRSBuka        bool       `gorm:"column:krs_buka;default:false" json:"krs_buka"`
	DibuatPada     time.Time  `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"dibuat_pada"`
}

func (PeriodeAkademikFak) TableName() string { return "fakultas_admin.periode_akademik" }

// PkkmbMateri merepresentasikan tabel fakultas_admin.pkkmb_materi [NEW]
type PkkmbMateri struct {
	ID         uint          `gorm:"primaryKey;column:id" json:"id"`
	KegiatanID uint          `gorm:"column:kegiatan_id" json:"kegiatan_id"`
	Kegiatan   PkkmbKegiatan `gorm:"foreignKey:KegiatanID;constraint:OnDelete:CASCADE" json:"kegiatan,omitempty"`
	Judul      string        `gorm:"column:judul;not null" json:"judul"`
	Deskripsi  string        `gorm:"column:deskripsi;type:text" json:"deskripsi"`
	Tipe       string        `gorm:"column:tipe" json:"tipe"`
	FileURL    string        `gorm:"column:file_url;type:text" json:"file_url"`
	Urutan     int           `gorm:"column:urutan;default:1" json:"urutan"`
	DibuatPada time.Time     `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"dibuat_pada"`
}

func (PkkmbMateri) TableName() string { return "fakultas_admin.pkkmb_materi" }

// PkkmbTugas merepresentasikan tabel fakultas_admin.pkkmb_tugas [NEW]
type PkkmbTugas struct {
	ID         uint          `gorm:"primaryKey;column:id" json:"id"`
	KegiatanID uint          `gorm:"column:kegiatan_id" json:"kegiatan_id"`
	Kegiatan   PkkmbKegiatan `gorm:"foreignKey:KegiatanID;constraint:OnDelete:CASCADE" json:"kegiatan,omitempty"`
	Judul      string        `gorm:"column:judul;not null" json:"judul"`
	Deskripsi  string        `gorm:"column:deskripsi;type:text" json:"deskripsi"`
	Deadline   *time.Time    `gorm:"column:deadline" json:"deadline"`
	DibuatPada time.Time     `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"dibuat_pada"`
}

func (PkkmbTugas) TableName() string { return "fakultas_admin.pkkmb_tugas" }

// PkkmbKelulusan merepresentasikan tabel fakultas_admin.pkkmb_kelulusan [NEW]
type PkkmbKelulusan struct {
	ID               uint       `gorm:"primaryKey;column:id" json:"id"`
	MahasiswaID      uint       `gorm:"column:mahasiswa_id;not null" json:"mahasiswa_id"`
	Mahasiswa        FakStudent `gorm:"foreignKey:MahasiswaID;constraint:OnDelete:CASCADE" json:"mahasiswa,omitempty"`
	TahunPelaksanaan int        `gorm:"column:tahun_pelaksanaan;not null" json:"tahun_pelaksanaan"`
	NilaiAkademik    float64    `gorm:"column:nilai_akademik;default:0" json:"nilai_akademik"`
	Kehadiran        int        `gorm:"column:kehadiran;default:0" json:"kehadiran"`
	StatusKelulusan  string     `gorm:"column:status_kelulusan;default:'Tidak Lulus'" json:"status_kelulusan"`
	SertifikatURL    string     `gorm:"column:sertifikat_url;type:text" json:"sertifikat_url"`
	Catatan          string     `gorm:"column:catatan;type:text" json:"catatan"`
	DibuatPada       time.Time  `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"dibuat_pada"`
	DiperbaruiPada   time.Time  `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP" json:"diperbarui_pada"`
}

func (PkkmbKelulusan) TableName() string { return "fakultas_admin.pkkmb_kelulusan" }

// PengajuanSurat merepresentasikan tabel fakultas_admin.pengajuan_surat [NEW]
type PengajuanSurat struct {
	ID             uint       `gorm:"primaryKey;column:id" json:"id"`
	MahasiswaID    uint       `gorm:"column:mahasiswa_id;not null" json:"mahasiswa_id"`
	Mahasiswa      FakStudent `gorm:"foreignKey:MahasiswaID;constraint:OnDelete:CASCADE" json:"mahasiswa,omitempty"`
	JenisSurat     string     `gorm:"column:jenis_surat;not null" json:"jenis_surat"`
	Keperluan      string     `gorm:"column:keperluan;type:text" json:"keperluan"`
	Status         string     `gorm:"column:status;default:'diajukan'" json:"status"`
	FileURL        string     `gorm:"column:file_url;type:text" json:"file_url"`
	CatatanAdmin   string     `gorm:"column:catatan_admin;type:text" json:"catatan_admin"`
	DiprosesOleh   *uint      `gorm:"column:diproses_oleh" json:"diproses_oleh"`
	DibuatPada     time.Time  `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"dibuat_pada"`
	DiperbaruiPada time.Time  `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP" json:"diperbarui_pada"`
}

func (PengajuanSurat) TableName() string { return "fakultas_admin.pengajuan_surat" }

// ProgramMBKM merepresentasikan tabel fakultas_admin.program_mbkm [NEW]
type ProgramMBKM struct {
	ID             uint       `gorm:"primaryKey;column:id" json:"id"`
	MahasiswaID    uint       `gorm:"column:mahasiswa_id;not null" json:"mahasiswa_id"`
	Mahasiswa      FakStudent `gorm:"foreignKey:MahasiswaID;constraint:OnDelete:CASCADE" json:"mahasiswa,omitempty"`
	JenisMBKM      string     `gorm:"column:jenis_mbkm;not null" json:"jenis_mbkm"`
	MitraNama      string     `gorm:"column:mitra_nama" json:"mitra_nama"`
	DurasiBulan    int        `gorm:"column:durasi_bulan" json:"durasi_bulan"`
	SKSKonversi    int        `gorm:"column:sks_konversi;default:0" json:"sks_konversi"`
	Status         string     `gorm:"column:status;default:'terdaftar'" json:"status"`
	Catatan        string     `gorm:"column:catatan;type:text" json:"catatan"`
	DisetujuiOleh  *uint      `gorm:"column:disetujui_oleh" json:"disetujui_oleh"`
	DibuatPada     time.Time  `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"dibuat_pada"`
	DiperbaruiPada time.Time  `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP" json:"diperbarui_pada"`
}

func (ProgramMBKM) TableName() string { return "fakultas_admin.program_mbkm" }

// OrganisasiMahasiswa merepresentasikan tabel fakultas_admin.organisasi_mahasiswa [NEW]
type OrganisasiMahasiswa struct {
	ID             uint      `gorm:"primaryKey;column:id" json:"id"`
	KodeOrg        string    `gorm:"column:kode_org;uniqueIndex;not null" json:"kode_org"`
	NamaOrg        string    `gorm:"column:nama_org;not null" json:"nama_org"`
	Tipe           string    `gorm:"column:tipe" json:"tipe"`
	KetuaNama      string    `gorm:"column:ketua_nama" json:"ketua_nama"`
	JumlahAnggota  int       `gorm:"column:jumlah_anggota;default:0" json:"jumlah_anggota"`
	Status         string    `gorm:"column:status;default:'Aktif'" json:"status"`
	Deskripsi      string    `gorm:"column:deskripsi;type:text" json:"deskripsi"`
	DibuatPada     time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"dibuat_pada"`
	DiperbaruiPada time.Time `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP" json:"diperbarui_pada"`
}

func (OrganisasiMahasiswa) TableName() string { return "fakultas_admin.organisasi_mahasiswa" }

// ProposalOrmawa merepresentasikan tabel fakultas_admin.proposal_ormawa [NEW]
type ProposalOrmawa struct {
	ID             uint                `gorm:"primaryKey;column:id" json:"id"`
	OrgID          uint                `gorm:"column:org_id;not null" json:"org_id"`
	Organisasi     OrganisasiMahasiswa `gorm:"foreignKey:OrgID;constraint:OnDelete:CASCADE" json:"organisasi,omitempty"`
	PengajuID      *uint               `gorm:"column:pengaju_id" json:"pengaju_id"`
	Pengaju        *FakStudent         `gorm:"foreignKey:PengajuID" json:"pengaju,omitempty"`
	Judul          string              `gorm:"column:judul;not null" json:"judul"`
	Deskripsi      string              `gorm:"column:deskripsi;type:text" json:"deskripsi"`
	Anggaran       float64             `gorm:"column:anggaran;type:decimal(15,2);default:0" json:"anggaran"`
	DokumenURL     string              `gorm:"column:dokumen_url;type:text" json:"dokumen_url"`
	Status         string              `gorm:"column:status;default:'diajukan'" json:"status"`
	CatatanAdmin   string              `gorm:"column:catatan_admin;type:text" json:"catatan_admin"`
	DireviewOleh   *uint               `gorm:"column:direview_oleh" json:"direview_oleh"`
	DibuatPada     time.Time           `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"dibuat_pada"`
	DiperbaruiPada time.Time           `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP" json:"diperbarui_pada"`
}

func (ProposalOrmawa) TableName() string { return "fakultas_admin.proposal_ormawa" }

// ProposalFakultas merepresentasikan tabel fakultas_admin.proposal_fakultas [NEW]
type ProposalFakultas struct {
	ID              uint      `gorm:"primaryKey;column:id" json:"id"`
	PengajuID       *uint     `gorm:"column:pengaju_id" json:"pengaju_id"`
	Judul           string    `gorm:"column:judul;not null" json:"judul"`
	Deskripsi       string    `gorm:"column:deskripsi;type:text" json:"deskripsi"`
	Anggaran        float64   `gorm:"column:anggaran;type:decimal(15,2);default:0" json:"anggaran"`
	DokumenURL      string    `gorm:"column:dokumen_url;type:text" json:"dokumen_url"`
	Status          string    `gorm:"column:status;default:'diajukan'" json:"status"`
	CatatanReviewer string    `gorm:"column:catatan_reviewer;type:text" json:"catatan_reviewer"`
	DireviewOleh    *uint     `gorm:"column:direview_oleh" json:"direview_oleh"`
	DibuatPada      time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"dibuat_pada"`
	DiperbaruiPada  time.Time `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP" json:"diperbarui_pada"`
}

func (ProposalFakultas) TableName() string { return "fakultas_admin.proposal_fakultas" }

// PengumumanFak merepresentasikan tabel fakultas_admin.pengumuman [NEW]
type PengumumanFak struct {
	ID              uint       `gorm:"primaryKey;column:id" json:"id"`
	Judul           string     `gorm:"column:judul;not null" json:"judul"`
	IsiSingkat      string     `gorm:"column:isi_singkat;type:text" json:"isi_singkat"`
	IsiLengkap      string     `gorm:"column:isi_lengkap;type:text" json:"isi_lengkap"`
	Kategori        string     `gorm:"column:kategori" json:"kategori"`
	IsPinned        bool       `gorm:"column:is_pinned;default:false" json:"is_pinned"`
	IsAktif         bool       `gorm:"column:is_aktif;default:true" json:"is_aktif"`
	DibuatOleh      *uint      `gorm:"column:dibuat_oleh" json:"dibuat_oleh"`
	DiterbitkanPada *time.Time `gorm:"column:diterbitkan_pada" json:"diterbitkan_pada"`
	DibuatPada      time.Time  `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"dibuat_pada"`
	DiperbaruiPada  time.Time  `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP" json:"diperbarui_pada"`
}

func (PengumumanFak) TableName() string { return "fakultas_admin.pengumuman" }

// BeritaFak merepresentasikan tabel fakultas_admin.berita [NEW w/ thumbnail, dilihat]
type BeritaFak struct {
	ID             uint      `gorm:"primaryKey;column:id" json:"id"`
	Judul          string    `gorm:"column:judul;not null" json:"judul"`
	Konten         string    `gorm:"column:konten;type:text" json:"konten"`
	Kategori       string    `gorm:"column:kategori" json:"kategori"`
	Penulis        string    `gorm:"column:penulis" json:"penulis"`
	Status         string    `gorm:"column:status;default:'Terbit'" json:"status"`
	Thumbnail      string    `gorm:"column:thumbnail;type:text" json:"thumbnail"`
	Dilihat        int       `gorm:"column:dilihat;default:0" json:"dilihat"`
	DibuatPada     time.Time `gorm:"column:dibuat_pada;default:CURRENT_TIMESTAMP" json:"dibuat_pada"`
	DiperbaruiPada time.Time `gorm:"column:diperbarui_pada;default:CURRENT_TIMESTAMP" json:"diperbarui_pada"`
}

func (BeritaFak) TableName() string { return "fakultas_admin.berita" }

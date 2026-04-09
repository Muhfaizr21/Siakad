# BKU Student Hub (SIAKAD) — Master Architecture & RBAC Blueprint 🎓

Dokumen ini adalah cetak biru komprehensif skala produksi 100% untuk sistem **SIAKAD (Sistem Informasi Akademik)** BKU Student Hub. Sistem ini dirancang di atas arsitektur **Role-Based Access Control (RBAC)** yang ketat dan terisolasi, menjamin keamanan tingkat enterprise, ketepatan wewenang, dan mencegah terjadinya *data breach* atau *unauthorized logic execution*.

Sistem terdiri dari **5 Peran Utama (Role)**: Super Admin, Admin Fakultas, Dosen (Lecturer), Admin Ormawa, dan Mahasiswa (Student).

---

## 🔐 STRUKTUR RBAC (Role-Based Access Control) MANIFEST
Konsep RBAC di sistem ini tidak sekadar tipe akun, melainkan mapping dari spesifik *Permissions* (Wewenang) ke setiap _Role_.

### Tabel Matriks Akses (RBAC Matrix)

| Modul Data | Super Admin | Admin Fakultas | Dosen (Lecturer) | Admin Ormawa | Mahasiswa |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Management** | ✅ CRUD All | ➖ Read/Edit (Student from own Faculty) | ❌ Deny | ❌ Deny | ❌ Deny |
| **System Roles** | ✅ CRUD | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny |
| **Master Fakultas/Prodi**| ✅ CRUD | ➖ Read Only | ➖ Read Only | ➖ Read Only | ➖ Read Only |
| **Master Kurikulum/MK** | ✅ CRUD | ✅ CRUD (Own Faculty) | ➖ Read Only | ❌ Deny | ➖ Read Only |
| **Jadwal Kuliah** | ✅ CRUD | ✅ CRUD (Own Faculty) | ➖ Read (Own Classes) | ❌ Deny | ➖ Read (Enrolled) |
| **KRS (Registrasi)** | ✅ CRUD | ✅ Approve/Reject | ✅ Approve (as DPA)| ❌ Deny | ✅ Create/Submit |
| **Penilaian (KHS)** | ✅ System Override| ➖ Read Only | ✅ Input & Lock | ❌ Deny | ➖ Read Only |
| **Keuangan (UKT)** | ✅ Master Setup | ➖ Read Only | ❌ Deny | ❌ Deny | ➖ View & Pay |
| **E-Proposal Ormawa** | ✅ Final Approve | ✅ Dept. Approve | ❌ Deny | ✅ Create & Upload | ❌ Deny |
| **Fasilitas/Ruangan** | ✅ CRUD Master | ✅ Approve Booking | ➖ Request Booking | ➖ Request Booking| ➖ Request Booking |
| **Student Voice** | ✅ Monitoring All | ✅ Faculty Review | ❌ Deny | ❌ Deny | ✅ Create & Track |
| **Health Screening** | ✅ Health Analytics| ✅ View Reports | ❌ Deny | ❌ Deny | ✅ Self-Input |
| **KENCANA Hub** | ✅ Manage Stages | ✅ Monitoring | ❌ Deny | ❌ Deny | ✅ Learn & Quiz |
| **E-Persuratan** | ✅ Full Access | ✅ Process & Approve | ❌ Deny | ❌ Deny | ✅ Pengajuan |
| **Program MBKM** | ✅ Full Access | ✅ Approve/Monitor | ✅ Verify | ❌ Deny | ✅ Daftar & Track |
| **Ormawa & Proposal** | ✅ Final Approve | ✅ Dept. Approve | ❌ Deny | ✅ Create & Manage | ➖ Lihat Info |
| **Pengumuman Fakultas** | ✅ CRUD All | ✅ Publish Fakultas | ❌ Deny | ❌ Deny | ➖ Read Only |

---

## 🛠️ TECH STACK & INFRASTRUCTURE

Sistem dirancang dengan arsitektur **Decoupled Full-Stack** untuk skalabilitas tinggi.

### Backend (Engine)
- **Language**: Go (Golang) 1.26+
- **Framework**: [Fiber v2](https://gofiber.io/) (High performance, Express-like)
- **ORM**: [GORM](https://gorm.io/) (Developer friendly modeling)
- **Authentication**: JWT (JSON Web Token) with RS256/HS256
- **PDF Engine**: FPDF (Generating dynamic certificates/transcripts)
- **Database**: PostgreSQL 15+ (Relational with advanced JSONB support)

### Frontend (Interface)
- **Library**: React 19 (Latest stable)
- **Build Tool**: Vite (Ultra fast HMR)
- **Styling**: Tailwind CSS 4.0 (Utility-first with JIT)
- **State Management**: Zustand (Lightweight & Reactive)
- **Data Fetching**: TanStack React Query v5 (Auto-caching & Sync)
- **Animations**: Framer Motion (Smooth UI interactions)
- **Icons**: Lucide React
- **Validation**: Zod + React Hook Form

### Key Dependencies (Manifest)
| Component | Dependency | Purpose |
| :--- | :--- | :--- |
| **Backend** | `gofiber/fiber/v2` | Core Web Framework |
| | `gorm.io/gorm` | Database ORM |
| | `golang-jwt/jwt/v5` | Security & Tokenization |
| | `go-pdf/fpdf` | PDF Generation (Certificates) |
| | `disintegration/imaging` | Profile Photo Processing |
| **Frontend** | `@tanstack/react-query` | Server State Management |
| | `zustand` | Client State Management |
| | `framer-motion` | Smooth UI Animations |
| | `recharts` | Health & Academic Analytics |
| | `lucide-react` | Standard Icon Library |

---

## 🗄️ DATABASE SCHEMA (Extended Production Blueprint)

Sistem menggunakan **dual-schema PostgreSQL architecture**:
- **`public`** — Schema utama untuk portal mahasiswa
- **`fakultas_admin`** — Schema terisolasi untuk operasional admin fakultas

### Schema `public` — Portal Mahasiswa

#### Core & Otentikasi
- `peran` (id, nama_peran, deskripsi)
- `pengguna` (id, email, kata_sandi, peran_id, aktif, deleted_at)
- `fakultas` (id, nama_fakultas, kode_fakultas, dekan)
- `program_studi` (id, fakultas_id, nama_prodi, kode_prodi, jenjang, akreditasi)
- `dosen` (id, pengguna_id, nidn, nama_dosen, fakultas_id, prodi_id, apakah_dpa)
- `mahasiswa` (id, pengguna_id, nim, nama_mahasiswa, prodi_id, dosen_pa_id, ipk, total_sks, current_semester, foto_url, tempat_lahir, jenis_kelamin, agama, golongan_darah, credit_limit, ...)

#### Modul Akademik
- `periode_akademik` (id, nama_periode, semester, is_aktif, krs_buka)
- `mata_kuliah` (id, kode_mk, nama_mk, sks, semester, prodi_id)
- `jadwal_kuliah` (id, mk_id, dosen_id, periode_id, hari, jam_mulai, ruangan, kuota)
- `krs_header` (id, mahasiswa_id, periode_id, status, total_sks, catatan_wali)
- `krs_detail` (id, krs_id, jadwal_id)

#### Layanan Mahasiswa
- `prestasi` (id, mahasiswa_id, nama_prestasi, bidang, tingkat, tahun, status, poin_skpi, catatan, verified_by, verified_at)
- `beasiswa` (id, nama_beasiswa, min_ipk, deadline, kuota, status, kategori, nilai_bantuan, is_aktif)
- `pendaftaran_beasiswa` (id, beasiswa_id, mahasiswa_id, status, nomor_referensi, motivasi)

#### Student Voice
- `aspirasi` (id: **UUID**, nomor_tiket, mahasiswa_id, judul, deskripsi, kategori, status, fakultas_id, is_anonim, level_saat_ini)
- `tiket_timeline_events` (id: UUID, tiket_id, tipe_event, level, isi_respons, dilakukan_oleh)

#### Kesehatan & Konseling
- `konseling` (id, mahasiswa_id, jenis, tanggal, status, konselor, jadwal_id, keluhan_awal)
- `program_screening` (id, periode, target_smt, status)
- `hasil_screening` (id, mahasiswa_id, program_id, kondisi, catatan)

#### PKKMB & Kencana
- `pkkmb_kegiatan` (id, judul, tanggal, lokasi, pemateri)
- `kencana_tahap` (id, nama, label, urutan, status)
- `kencana_materi` (id, tahap_id, judul, file_url, tipe)
- `kencana_kuis` (id, materi_id, judul, passing_grade, bobot_persen, durasi_menit)
- `kuis_soal` (id, kuis_id, pertanyaan, opsi_a/b/c/d, kunci_jawaban)
- `kencana_hasil_kuis` (id, mahasiswa_id, kuis_id, skor, lulus, percobaan_ke)

#### Dashboard & Utilitas
- `berita` (id, judul, konten, status, thumbnail, views)
- `pendaftaran_mahasiswa_baru` (id, nomor_daftar, nama_lengkap, pilihan_prodi, status, jalur)
- `pengumuman` (id, judul, isi_singkat, kategori, is_pinned, is_aktif)
- `notifikasi` (id: UUID, pengguna_id, tipe, judul, pesan, sudah_dibaca)
- `riwayat_login` (id, pengguna_id, alamat_ip, status)
- `log_aktivitas` (id, mahasiswa_id, tipe, deskripsi)
- `log_audit` (id, pengguna_id, aksi, entitas, nilai_lama, nilai_baru)

---

### Schema `fakultas_admin` — Admin Fakultas (Terisolasi)

#### Core (v3.0.0 — Refactored ke Bahasa Indonesia)
- `peran`, `pengguna`, `fakultas`, `program_studi`, `dosen`, `mahasiswa`

#### Feature Tables
- `prestasi` (+ `catatan`, `diverifikasi_pada` — *NEW*)
- `pkkmb_kegiatan` (+ `deskripsi`, `wajib` — *NEW*)
- `kesehatan`, `aspirasi_fakultas`, `beasiswa_internal`, `pendaftaran_beasiswa`, `konseling`
- `periode_akademik` — *NEW*: Pengaturan tahun ajaran & semester aktif
- `pkkmb_materi` — *NEW*: File/link materi pembekalan
- `pkkmb_tugas` — *NEW*: Penugasan selama PKKMB
- `pkkmb_kelulusan` — *NEW*: Evaluasi akhir kelulusan PKKMB
- `pengajuan_surat` — *NEW*: Layanan E-Persuratan mahasiswa
- `program_mbkm` — *NEW*: Pelacakan MBKM (Merdeka Belajar)
- `organisasi_mahasiswa` — *NEW*: Master data Ormawa tingkat fakultas
- `proposal_ormawa` — *NEW*: Pengajuan anggaran/kegiatan ke Dekanat
- `proposal_fakultas` — *NEW*: Pengajuan kegiatan internal fakultas
- `pengumuman` — *NEW*: Broadcast informasi resmi
- `berita` (+ `thumbnail`, `dilihat`, `diperbarui_pada` — *NEW*)

---

## 🏗️ ARSITEKTUR KODE

### Struktur Backend
```
backend/
├── config/           # DB connection, migrations, seeders
├── database/
│   └── migrations/   # SQL migration files (01-04)
├── middleware/        # JWT auth, RBAC guards
├── models/
│   ├── models.go              # Model utama (public schema)
│   ├── admin_fakultas.go      # Model admin + model baru
│   ├── fakultas_schema.go     # Fak-admin bridge models
│   ├── student_bridge.go      # FakStudent (bridge utama)
│   └── student_sync.go        # GORM hooks sinkronisasi
└── modules/          # Handler modules per fitur
```

### Migration Files
| File | Deskripsi |
|---|---|
| `01_initial.sql` | Setup awal, extension, enum |
| `02_admin_fakultas_schema.sql` | Schema `fakultas_admin` (v3.0.0) |
| `03_student_schema_relasi.sql` | Schema legacy (referensi) |
| `04_localized_schema.sql` | **Schema Indonesia definitif** (public) |

---

## 5. 🎓 STUDENT (Pusat Pelayanan)
*Fokus Utama: Self-Service Akademik, Cek Nilai, Interaksi Kampus.*

- **Smart KRS (KRS War)**:
  - Antarmuka "Shopping Cart" untuk KRS yang interaktif. Validasasi SKS Max vs IPK sebelumnya secara otomatis.
- **Realtime KHS & Progress**:
  - Laporan hasil studi yang live dan riwayat perkuliahan. Diagram _Skill/Major progression_.
- **Student Voice (Aspirasi & Pengaduan)**:
  - **Sequential Ticket ID**: Format `SV-YYYYMMDD-XXXX`.
  - **Hierarchical Routing**: Tiket diteruskan dari Mahasiswa ➔ Admin Fakultas ➔ Super Admin (jika perlu).
  - **Anonymity Mode**: Pilihan untuk melapor secara anonim demi keamanan mahasiswa.
  - **Journey Timeline**: Visualisasi pelacakan tiket secara real-time dengan status (Menunggu, Diproses, Selesai).
  - **Evidence Upload**: Mendukung unggahan file pendukung (PDF/Images) hingga 5MB.
- **Health Screening (Skrining Kesehatan)**:
  - **Self-Assessment**: Input mandiri data kesehatan (TB, BB, Tekanan Darah).
  - **BMI Analytics**: Kalkulasi otomatis BMI dengan indikator status kesehatan (Sehat, Perhatian, Tindak Lanjut).
  - **Medical History**: Rekam jejak kesehatan periodik dari input mandiri maupun pemeriksaan klinik kampus.
- **KENCANA Hub (Orientation & Engagement)**:
  - **3-Stage Program**: Program pengenalan kampus yang terstruktur.
  - **Gamified Quizzes**: Pengerjaan modul materi diikuti dengan kuis berbobot nilai.
  - **Appeal System (Banding)**: Fitur pengajuan keberatan nilai kuis dengan tinjauan admin.
  - **Auto-Certificate**: Pembuatan sertifikat kelulusan program secara digital (PDF).
- **Digital Engagement Profile**:
  - Resume Ekstrakurikuler yang menyatu dengan transkrip nilai saat kelulusan (SKPI - Surat Keterangan Pendamping Ijazah).

---

## 🚀 ROADMAP STATUS

| Modul | Status | Progress |
|---|---|---|
| Auth & JWT | ✅ Selesai | 100% |
| Student Voice (Aspirasi) | ✅ Selesai | 100% |
| Health Screening | ✅ Selesai | 100% |
| KENCANA Program | ✅ Selesai | 100% |
| Profile & Achievement | ✅ Selesai | 100% |
| Schema Localization (Indonesia) | ✅ Selesai | 100% |
| Admin Fakultas Schema v3.0 | ✅ Selesai | 100% |
| Smart KRS | 🔧 In Progress | ~30% |
| KHS & Grading | 📋 Planned | 0% |
| E-Persuratan | 📋 Planned | 0% |
| MBKM Module | 📋 Planned | 0% |
| Ormawa & Proposal | 📋 Planned | 0% |
| Finance / UKT | 📋 Planned | 0% |

---

## 📋 CHANGELOG — Update Log Sesi Pengerjaan

### 🗓️ 09 April 2026 — Database Schema Localization & Sync (v3.0.0)

#### ✅ Sinkronisasi Schema Database (public)
**File:** `backend/models/models.go`

Selaraskan semua GORM `column:` tags agar nama kolom di database benar-benar sesuai dengan target schema Bahasa Indonesia:

- **`Student`**: Tambah column tags ke 11 extra fields → `current_semester`, `foto_url`, `email_personal`, `tempat_lahir`, `tanggal_lahir`, `jenis_kelamin`, `agama`, `kota`, `kode_pos`, `golongan_darah`, `credit_limit`
- **`Achievement`**: Hapus field `Tanggal` (dummy), tambah `gorm:"column:verified_by"` & `column:verified_at`
- **`Beasiswa`**: Tambah column tags ke `kategori`, `persyaratan`, `nilai_bantuan`, `sisa_kuota`, `is_berbasis_ekonomi`, `is_aktif`
- **`PengajuanBeasiswa`**: Tambah tags ke `nomor_referensi`, `motivasi`, `prestasi`, `diupdate_pada`
- **`TiketAspirasi`**: Tambah tags ke `fakultas_id`, `lampiran_url`, `is_anonim`, `level_saat_ini`, `diupdate_pada`. **UUID dipertahankan** (tidak diganti SERIAL)
- **`BookingKonseling`**: Tambah `column:jadwal_id` & `column:keluhan_awal`

#### ✅ Migration Baru: `04_localized_schema.sql`
**File:** `backend/database/migrations/04_localized_schema.sql`

SQL migration definitif dengan nama tabel & kolom Bahasa Indonesia (25+ tabel), mencakup:
- Semua tabel dari target schema + kolom extended yang dibutuhkan app
- Tabel `aspirasi` menggunakan **UUID primary key** (bukan SERIAL)
- Index & foreign key constraint lengkap
- Tabel baru: `periode_akademik`, `krs_header`, `krs_detail`, `kencana_*`, `notifikasi`, `riwayat_login`, `log_audit`, dll

#### ✅ Cleanup `admin_fakultas.go`
- 13 struct dengan tabel bahasa Inggris ditandai **DEPRECATED** dengan komentar pengarah ke counterpart Indonesia

---

### 🗓️ 09 April 2026 — Admin Fakultas Schema v3.0.0 (10 Tabel Baru)

#### ✅ Refactor `02_admin_fakultas_schema.sql` → v3.0.0
**File:** `backend/database/migrations/02_admin_fakultas_schema.sql`

Perubahan besar pada schema admin fakultas:
- Semua nama tabel diubah ke Bahasa Indonesia (`peran`, `pengguna`, `program_studi`, `dosen`, `mahasiswa`, dll.)
- Enum diperbarui (bahasa Indonesia)

**Kolom baru pada tabel eksisting:**
| Tabel | Kolom Baru | Fungsi |
|---|---|---|
| `mahasiswa` | `semester_sekarang` | Posisi semester aktif |
| `mahasiswa` | `diperbarui_pada` | Timestamp sinkronisasi data |
| `dosen` | `diperbarui_pada` | Pelacakan pembaruan profil |
| `prestasi` | `catatan` | Feedback dari admin/dekanat |
| `prestasi` | `diverifikasi_pada` | Timestamp resmi persetujuan |
| `pkkmb_kegiatan` | `deskripsi` | Detail agenda kegiatan |
| `pkkmb_kegiatan` | `wajib` | Flag wajib/opsional |
| `berita` | `thumbnail` | Link gambar utama |
| `berita` | `dilihat` | Counter view statistik |
| `berita` | `diperbarui_pada` | Info update artikel |

**10 Tabel baru:**
| Tabel | Fungsi |
|---|---|
| `periode_akademik` | Pengaturan tahun ajaran & semester aktif |
| `pengajuan_surat` | Layanan E-Persuratan mahasiswa |
| `program_mbkm` | Pelacakan keterlibatan mahasiswa MBKM |
| `organisasi_mahasiswa` | Master data Ormawa tingkat fakultas |
| `proposal_ormawa` | Pengajuan anggaran/kegiatan ke Dekanat |
| `proposal_fakultas` | Pengajuan kegiatan internal/struktural |
| `pkkmb_materi` | File & link materi pembekalan PKKMB |
| `pkkmb_tugas` | Pengelolaan penugasan selama PKKMB |
| `pkkmb_kelulusan` | Monitoring evaluasi akhir kelulusan PKKMB |
| `pengumuman` | Broadcast informasi resmi fakultas |
| `berita` | Portal konten artikel + tracking view |

#### ✅ GORM Models Baru
**File:** `backend/models/admin_fakultas.go`

11 struct GORM baru ditambahkan: `PeriodeAkademikFak`, `PkkmbMateri`, `PkkmbTugas`, `PkkmbKelulusan`, `PengajuanSurat`, `ProgramMBKM`, `OrganisasiMahasiswa`, `ProposalOrmawa`, `ProposalFakultas`, `PengumumanFak`, `BeritaFak`

#### ✅ Update GORM Models Existing
- **`fakultas_schema.go`** — `FakAchievement`: migrated ke `fakultas_admin.prestasi`, + field `DiverifikasiPada`
- **`student_bridge.go`** — `FakStudent`: + field `SemesterSekarang`, `DiperbaruiPada`, nama kolom diubah ke Indonesia
- **`student_sync.go`** — Fix mapping `CurrentSemester` → `SemesterSekarang`

---

### 🗓️ 07 April 2026 — Health Screening Page & HealthCharacter UI Upgrade

#### ✨ `HealthScreeningPage.jsx` — Premium UI Overhaul
**File:** `frontend/src/pages/Student/HealthScreeningPage.jsx`

- **Makeover Header "Kondisi Terakhir":** Status ditampilkan dengan ikon jam berwarna dinamis (Hijau/Rose/Amber) + badge **"Tervalidasi BKU"**
- **StatItem Cards Redesign:** 4 Card Independen bergaya *bento box* premium dengan ikon berwarna unik
- **Perluasan Status Umum Banner:** Avatar karakter diperbesar ke `w-24 h-24`, teks `text-2xl font-black`, tambah deskripsi kontekstual
- **`getStatusTheme()`:** Helper function baru — map warna berdasarkan `status_kesehatan` (emerald/rose/amber)

#### 🆕 `HealthCharacter.jsx` — Komponen SVG Karakter Dinamis Baru
**File:** `frontend/src/components/health/HealthCharacter.jsx`

Karakter wajah SVG kustom berbasis `framer-motion`, menggantikan emoji OS default.

| Kondisi | Trigger | Animasi |
| :--- | :--- | :--- |
| `hipertensi` | Sistolik ≥ 140 atau Diastolik ≥ 90 | Bergetar cepat |
| `obesitas` | BMI ≥ 30 | Bergoyang pelan + keringat jatuh |
| `kurus` | BMI < 18.5 | Melayang goyah (float) |
| `prima` | BMI 18.5-25 + tensi normal | Melayang kalem + bintang berputar |
| `perhatian` | Kondisi lain | Napas (scale pulse) |
| `nodata` | Data belum tersedia | Diam |

---

*System Architect AI: Antigravity* 🌌
*Schema Version: public v1.0 | fakultas_admin v3.0.0*
*Last Updated: 09 April 2026*

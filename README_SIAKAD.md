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

Model relasional ini mencakup seluruh modul akademik dan non-akademik:

### Core & Academic
- `users`, `roles`, `permissions`, `role_permissions` (RBAC System)
- `faculties`, `majors`, `lecturers`, `students` (Master Data)
- `courses` (Mata Kuliah), `mata_kuliah_prasyarat` (Prerequisites)
- `classes` (Jadwal), `student_krs` (Header/Detail), `student_grades` (KHS)

### Student Life & Engagement
- **Student Voice**: `tiket_aspirasis`, `tiket_timeline_events` (Tracking flow)
- **Health**: `hasil_kesehatans` (TB, BB, Tekanan Darah, BMI)
- **KENCANA**: `kencana_tahaps`, `kencana_materis`, `kencana_kuis`, `kuis_soal`, `kencana_hasil_kuis`, `kencana_progress`, `kencana_banding`, `kencana_sertifikats`
- **Scholarship**: `beasiswas`, `pengajuan_beasiswas`, `pengajuan_berkas`, `pengajuan_pipeline_logs`
- **Others**: `achievements`, `riwayat_organisasi`, `booking_konselings`, `kegiatan_kampus`, `aktivitas_logs`

### System Utilities
- `notifications` (Real-time student alerts)
- `pengumumans` (Global portal announcements)
- `login_histories` (Security & Audit trails)
- `notification_preferences` (Student self-settings)

---

## 1. 🛡️ SUPER ADMIN (Dewa / Kendali Absolut)
*Fokus Utama: Parameter Sistem, Keamanan Master, Modul Keuangan & Infrastruktur Global.*

- **Dynamic RBAC Engineering**:
  - Konfigurasi `permissions` table dan `role_permissions` secara dinamis.
  - Revoke hak akses Admin Fakultas tertentu jika terjadi kecurangan.
- **Global Academic Setup**:
  - Membuka / Menutup portal Tahun Akademik (*Academic Year / Semester Aktif*).
  - Integrasi Batch: Import/Export data Dosen dan Mahasiswa Baru (CSV/Excel via API).
- **Audit & Security (Log System)**:
  - Menyimpan *Activity Log* ber-timestamp. Menyimpan *Payload Activity* untuk mencegah manipulasi data krusial (seperti audit jejak siapa yang mengganti Nilai Mahasiswa menjadi A).
- **Financial Gateway Module**:
  - Sinkronisasi Data Tagihan UKT. Generate Virtual Account.
  - Setup Beasiswa & Keringanan Biaya/Dispensasi Pembayaran bagi mahasiswa khusus.

## 2. 🏢 FACULTY ADMIN (Pusat Operasional Fakultas)
*Fokus Utama: Birokrasi Kurikulum, Tenaga Pendidik, Validasi Syarat Kelulusan Fakultas.*
*(Catatan Keamanan RBAC: Data query selalu di-filter secara strict `WHERE faculty_id = ?`)*

- **Curriculum & Plotting Scheduling**:
  - Manajemen Prasyarat Beban SKS dari satu Mata Kuliah Ke Mata Kuliah Lain (contoh: Kalkulus II syaratnya harus lulus Kalkulus I).
  - Plotting Ruang Kelas dan Plotting Dosen Pengampu agar tidak terjadi `Schedule Clash` (Bentrok Jadwal).
- **Student Progression Administration**:
  - Manajemen Cuti Akademik (Leave of Absence) dan mutasi pertukaran Mahasiswa Antar Kampus/MBKM.
  - Proses verifikasi persyaratan dokumen Yudisium & Skripsi.
  - Cetak Transkrip Resmi yang di-_generate_ dengan _Digital Signature/QR Code_.
- **Dashboard Fakultas**:
  - Statistik *Key Performance Indicator* (KPI) Dosen berdasarkan kehadiran mengajar, dan KPI grafik distribusi IPK (Indeks Prestasi Kumulatif) mahasiswa satu fakultas.

## 3. 👨‍🏫 LECTURER / DOSEN (Baru Ditambahkan: Kunci Verifikasi Akademik)
*Fokus Utama: Delivery Pendidikan, Bimbingan KRS, & Otoritas Mutlak Penilaian Akademik.*
*(Catatan Keamanan RBAC: Data query selalu di-filter berdasarkan plot assignment dosen terkait)*

- **Dosen Pembimbing Akademik (DPA)**:
  - Melihat riwayat _Student Record_ mahasiswa perwaliannya (GPA History, SKS Sisa).
  - Menyetujui (Approve) atau Menolak dan merombak daftar pengajuan KRS Mahasiswa untuk semester ini.
- **Dosen Pengampu Mata Kuliah**:
  - Mengelola *Absensi Mahasiswa* secara real-time pada setiap sesi pertemuan.
  - **Portal Grading (Penilaian)**: Input komponen nilai (Tugas, UTS, UAS, Praktikum) yang akan menghitung skor berbobot otomatis ke dalam KHS. *Zero tolerance* untuk edit setelah tenggat waktu `Grade Lock` habis.

## 4. ⛺ ORMAWA ADMIN (Penggerak Organisasi Mahasiswa)
*Fokus Utama: E-Birokrasi Kampus, Pendanaan, & Ekstrakurikuler Ekosistem.*
*(Catatan Keamanan RBAC: Admin UKM A tidak dapat melihat database UKM B)*

- **Recruitment & HR Module**:
  - Publikasi E-Oprec via Dashboard Utama Mahasiswa.
  - Verifikasi keanggotaan dan menjabat posisi kepanitiaan (Ketua Kegiatan, Divisi Acara, dsb).
- **Smart E-Proposal & Grants**:
  - Sistem pengajuan Dokumen Proposal Kegiatan dan Form RAB (Rencana Anggaran Biaya).
  - **Approval Pipeline Flow**: `Draft` ➔ `Review Pembina` ➔ `Review Fakultas / Kemahasiswaan Pusat` ➔ `Approved / Funded`.
- **E-LPJ (Laporan Pertanggungjawaban)**:
  - Unggah rincian riil pemakaian dana dan dokumentasi acara penutup. Jika LPJ ditangguhkan, sistem akan "hold" proposal baru.
- **Facility Reservation Module**:
  - Antarmuka visual ketersediaan gedung/aula, booking secara live dan menunggu persetujuan (Ticket System).

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

## 🗄️ STRUKTUR DATABASE (Production DB Schema)

Model relasional ini menangkai interkoneksi kompleks:

```sql
-- RBAC Core
[users] (id, email, password_hash, role_id, is_active)
[roles] (id, name: super_admin, faculty_admin, lecturer, student, ormawa_admin)
[permissions] (id, name: "approve_krs", "edit_grades", "delete_users")
[role_permissions] (role_id, permission_id)

-- Master Data Hub
[faculties] (id, name, code, dean_name)
[majors] (id, name, faculty_id, degree_level)
[lecturers] (id, user_id, nidn, name, faculty_id, is_dpa)
[students] (id, user_id, nim, name, major_id, dpa_lecturer_id, current_semester, status)

-- Curriculum & Classes
[courses] (id, code, name, credits, major_id, min_semester)
[classes] (id, course_id, lecturer_id, academic_year, semester_type, room, schedule_day, start_time, end_time, quota)

-- Academic Realities
[student_krs] (id, student_id, class_id, status: "pending", "approved", "rejected")
[student_grades] (id, student_id, class_id, assignment_score, mid_score, final_score, total_score, grade_letter)

-- Non-Academic & Engagement
[ormawa] (id, user_id_admin, name, type, description)
[proposals] (id, ormawa_id, title, requested_budget, status)
[facilities] (id, name, type, capacity)
[bookings] (id, user_id, facility_id, start_time, end_time, status)

-- Student Voice (Aspirasi)
[tiket_aspirasi] (id: uuid, nomor_tiket: unique, student_id, fakultas_id, kategori, judul, isi, is_anonim, level_saat_ini, status)
[tiket_timeline_events] (id: uuid, tiket_id, tipe_event, level, isi_respons, dilakukan_oleh)

-- Health & Kencana
[hasil_kesehatans] (id, student_id, tanggal_periksa, tinggi_badan, berat_badan, bmi, sistolik, diastolik, status_kesehatan, sumber)
[kencana_tahaps] (id, nama, label, urutan, status, is_aktif)
[kencana_materis] (id, tahap_id, judul, file_url, tipe)
[kencana_kuis] (id, materi_id, judul, passing_grade, bobot_persen)
[kencana_hasil_kuis] (id, student_id, kuis_id, nilai, lulus, attempt_ke)

-- Scholarship & Achievements
[beasiswas] (id, nama, kategori, nilai_bantuan, kuota, deadline)
[pengajuan_beasiswas] (id, student_id, beasiswa_id, nomor_referensi, status)
[achievements] (id, student_id, nama_lomba, kategori, peringkat, status)
```

---

## 🚀 TAHAPAN KERJA KITA SELANJUTNYA (ROADMAP REACT IMPLEMENTATION)

Karena sistem ini masif, agar pekerjaan tidak membengkak dan sangat sistematis, alur pengerjaan pada Frontend React kita selanjutnya adalah:

1. **RBAC & Auth Foundation (Completed)**
   - Login system, JWT Auth, and Role-Based Routing.

2. **Student Experience Module (Current - 90% Done)**
   - **Student Voice**: Backend & Frontend integrasi 100%.
   - **Health Screening**: Core logic & UI Dashboard 100%.
   - **KENCANA Program**: Sertifikasi & Kuis 100%.
   - **Profile & Achievement**: Riwayat prestasi mahasiswa.

3. **Academic Core Module (Next Milestone)**
   - **Smart KRS**: Logika bentrok jadwal dan prasyarat SKS.
   - **KHS & Transcript**: Penilaian oleh dosen dan validasi fakultas.

4. **Finance & Infrastructure**
   - Generating Virtual Accounts and UKT clearance.

---

## 📋 CHANGELOG — Update Log Sesi Pengerjaan

### 🗓️ 07 April 2026 — Health Screening Page & HealthCharacter UI Upgrade

#### ✨ `HealthScreeningPage.jsx` — Premium UI Overhaul
**File:** `frontend/src/pages/Student/HealthScreeningPage.jsx`

- **Makeover Header "Kondisi Terakhir":** Desain header card utama diubah total. Status sekarang ditampilkan dengan ikon jam berwarna dinamis (Hijau/Rose/Amber) yang menyesuaikan kondisi kesehatan mahasiswa, disertai badge **"Tervalidasi BKU"** di sisi kanan.
- **StatItem Cards Redesign:** Keempat statistik kesehatan (Tinggi, Berat, Tensi, Gol. Darah) yang sebelumnya flat kini diubah menjadi **4 Card Independen** bergaya *bento box* premium:
  - Setiap card punya ikon berwarna unik (Biru untuk Tinggi, Emerald untuk Berat, Rose untuk Tensi, Merah untuk Gol. Darah).
  - Hover state menampilkan bayangan lembut (*soft shadow*) untuk kesan interaktif.
- **Perluasan Status Umum Banner:** Area "Status Umum" di bawah statistik diubah menjadi banner hero yang lebih menonjol:
  - Ukuran avatar karakter diperbesar dari `w-12 h-12` menjadi **`w-24 h-24`**.
  - Teks nama status dibesarkan ke `text-2xl font-black`.
  - Ditambahkan kalimat deskripsi kontekstual di bawah nama status.
  - Indikator Tensi Darah kini menampilkan badge berlatar warna kondisional.
- **Warna Status Dinamis via `getStatusTheme()`:** Ditambahkan helper function baru `getStatusTheme` yang memetakan warna teks dan ikon berdasarkan nilai `status_kesehatan`:
  - `sehat` → **Emerald/Hijau**
  - `perlu_tindak_lanjut` / `bahaya` → **Rose/Merah**
  - Kondisi lain (Gemuk, Pre-Hiper) → **Amber/Kuning**

---

#### 🆕 `HealthCharacter.jsx` — Komponen SVG Karakter Dinamis Baru
**File:** `frontend/src/components/health/HealthCharacter.jsx`

Komponen React sepenuhnya baru yang menggantikan penggunaan emoji default OS (Windows) dengan **Karakter Wajah SVG Kustom** yang sepenuhnya dibangun dari elemen `<svg>` dan dianimasikan menggunakan `framer-motion`.

**Logika Kondisi (dari prioritas tertinggi ke terendah):**
| Kondisi | Trigger | Wajah SVG | Animasi |
| :--- | :--- | :--- | :--- |
| `hipertensi` | Sistolik ≥ 140 atau Diastolik ≥ 90 | Mata silang, mulut ternganga | Bergetar cepat |
| `obesitas` | BMI ≥ 30 | Wajah lebar, mata mengantuk | Bergoyang pelan + keringat jatuh |
| `kurus` | BMI < 18.5 | Wajah tirus, mata sayu | Melayang goyah (float) |
| `prima` | BMI 18.5-25 + Tensi normal | Kacamata hitam 😎, senyum lebar | Melayang kalem + bintang berputar |
| `perhatian` | Kondisi di luar 4 di atas | Muka waspada dengan tanda `?` | Napas (scale pulse) |
| `nodata` | Data belum tersedia | Siluet abu-abu | Diam |

**Fitur Visual:**
- **Halo/Glow Effect:** Pancaran cahaya melayang di belakang karakter yang warnanya menyesuaikan kondisi (Merah, Amber, Cyan, Emerald).
- **No Box/Frame:** Karakter tampil murni tanpa bingkai kotak — langsung menempel secara *floating* di atas card dengan `drop-shadow-2xl`.
- **Elemen SVG Bergerak:** Uap panas di hipertensi, tetes kerigat di obesitas, dan sparkle bintang di kondisi prima semuanya dianimasikan secara independen dengan `motion.path` / `motion.text`.

---
*Analis System Architect AI: Antigravity* 🌌
*Status: 100% Comprehensive & Ready To Build.*

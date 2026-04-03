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
- **Ticketing / Helpdesk Center**:
  - Live chat / Helpdesk untuk komplain masalah nilai yang telat diinput dosen, masalah biaya kuliah, bimbingan konseling perundungan/intelektual.
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

-- Non-Academic
[ormawa] (id, user_id_admin, name, type, description)
[proposals] (id, ormawa_id, title, requested_budget, status)
[facilities] (id, name, type, capacity)
[bookings] (id, user_id, facility_id, start_time, end_time, status)
```

---

## 🚀 TAHAPAN KERJA KITA SELANJUTNYA (ROADMAP REACT IMPLEMENTATION)

Karena sistem ini masif, agar pekerjaan tidak membengkak dan sangat sistematis, alur pengerjaan pada Frontend React kita selanjutnya adalah:

1. **RBAC & Auth Foundation (Current Milestone)**
   - Menyempurnakan form `/login`.
   - Membuat `AuthContext` dan `ProtectedRoute` wrapper di `App.jsx`.
   - *Logic*: Simpan JWT Token di LocalStorage, decode JWT untuk tahu `Role_ID`, buat sistem otomatis redirect (Kalau `student` gagal masuk route `/super-admin`).

2. **Super Admin Dashboard Shell (Foundation II)**
   - Buat kerangka sidebar dinamis berdasarkan `Role` yang sedang _Logged In_.
   - Overview page layout.

3. **User Management Module (CRUD)**
   - Halaman tabel data Dosen dan Mahasiswa, fitur Search & Pagination.
   - Form _Add/Edit User_ (Modal UI/UX berkelas).
   - Fitur "Ban User" dan "Reset Password".

4. **Master Data Module**
   - CRUD Fakultas dan Jurusan.

---
*Analis System Architect AI: Antigravity* 🌌
*Status: 100% Comprehensive & Ready To Build.*

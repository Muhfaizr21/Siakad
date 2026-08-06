# Rencana & Langkah Testing SIAKAD

## Tujuan
Memverifikasi seluruh alur sistem dari Super Admin membuka pendaftaran hingga Mahasiswa menggunakan semua layanan portal.

## Alur Utama
```
Super Admin buat data NIM → Mahasiswa daftar sendiri via form → Mahasiswa login & pakai semua layanan
```

> **Penting:** Admin HANYA membuat data NIM dasar (NIM + nama + fakultas + prodi). Mahasiswa yang membuat akunnya sendiri (email + password) lewat halaman registrasi.

---

## Prekondisi

1. Server backend berjalan (`http://localhost:8000`)
2. Server frontend berjalan (`http://localhost:5173`)
3. Database telah termigrasi (AutoMigrate + Bootstrap seed berjalan otomatis saat server start)

---

## Akun Testing

| Role | Username/Email | Password | NIM (jika mahasiswa) |
|---|---|---|---|
| Super Admin | `superadmin@bku.ac.id` | `superadmin123` | - |
| Admin Farmasi | `admin.ff@bku.ac.id` | `adminfak123` | - |
| Admin Keperawatan | `admin.fk@bku.ac.id` | `adminfak123` | - |
| Admin FIK | `admin.fik@bku.ac.id` | `adminfak123` | - |
| Admin FIS | `admin.fs@bku.ac.id` | `adminfak123` | - |
| Mahasiswa 1 | `231FF01001` / `student` | `student123` | `231FF01001` |
| Mahasiswa 2 | `232FF01002` | `student123` | `232FF01002` |
| Mahasiswa 3 | `231FK01001` | `student123` | `231FK01001` |
| Mahasiswa 4 | `232FIK01001` | `student123` | `232FIK01001` |
| Ormawa (BEM) | `ormawa@bku.ac.id` | `ormawa123` | - |
| Dosen | `dosen.farmasi@bku.ac.id` | `dosen123` | - |
| Psikolog | Login via super admin panel | `psikolog123` | - |
| Tenaga Kesehatan | `tenagakes@bku.ac.id` | `tenagakes123` | - |

---

# Tahap 1: Super Admin — Persiapan Sistem

> Login sebagai **Super Admin** di `http://localhost:5173/admin`

### [SA-1] Login Super Admin
**Langkah:** Buka `/admin`, login dengan `superadmin@bku.ac.id` / `superadmin123`
**Ekspektasi:** Dashboard admin tampil dengan statistik sistem

### [SA-2] Cek Data Master Fakultas & Prodi
**Langkah:** Buka menu Fakultas & Prodi
**Ekspektasi:** 4 Fakultas (FF, FK, FIK, FS) dan 8 Prodi sudah terisi

### [SA-3] Cek Periode Akademik
**Langkah:** Buka menu Academic Periods / Pengaturan Akademik
**Ekspektasi:** Periode "Genap 2025/2026" aktif, KRS terbuka

### [SA-4] Cek Manajemen Mahasiswa
**Langkah:** Buka menu Mahasiswa / Students
**Ekspektasi:** 4 mahasiswa sample sudah terdaftar (231FF01001, dll)

### [SA-5] Buat Data NIM Mahasiswa Baru (prasyarat daftar mandiri)
**Langkah:**
1. Buka menu Mahasiswa → Tambah Mahasiswa
2. Isi data NIM (bukan buat akun penuh—hanya data dasar):
   - NIM: `TEST001`
   - Nama: `Mahasiswa Test 1`
   - Fakultas: Farmasi
   - Prodi: S1 Farmasi
   - Status Akademik: Aktif
3. Simpan
**Ekspektasi:** Data NIM `TEST001` muncul di daftar mahasiswa (nanti mahasiswa daftar sendiri via halaman registrasi)

### [SA-6] Buat Data NIM satu lagi
**Langkah:** Ulangi SA-5 dengan NIM: `TEST002`, Nama: `Mahasiswa Test 2`, Fakultas: Keperawatan, Prodi: S1 Keperawatan
**Ekspektasi:** NIM `TEST002` tercatat di daftar mahasiswa

### [SA-7] Cek Beasiswa
**Langkah:** Buka menu Beasiswa
**Ekspektasi:** Minimal 3 beasiswa terdaftar:
- Beasiswa Prestasi UBK
- Beasiswa Biaya Kuliah Internal
- Beasiswa Alumni Peduli

### [SA-8] Cek Berita / Pengumuman
**Langkah:** Buka menu News / Berita
**Ekspektasi:** Halaman berita kosong atau sudah ada sample

**Catatan tulis manual:** .........................................................

### [SA-9] Cek Psikolog
**Langkah:** Buka menu Psikolog
**Ekspektasi:** Minimal 3 psikolog terdaftar dengan jadwal

### [SA-10] Cek Tenaga Kesehatan
**Langkah:** Buka menu Tenaga Kesehatan
**Ekspektasi:** Minimal 1 tenaga kesehatan terdaftar

### [SA-11] Cek Periode Kencana (PKKMB)
**Langkah:** Buka menu Kencana Admin
**Ekspektasi:** Periode Kencana aktif, ada tahapan/stage

### [SA-12] Buat Pengumuman (untuk test dashboard mahasiswa)
**Langkah:**
1. Buka menu Berita / News → Tambah
2. Judul: `Pengumuman Test: Pembukaan KRS`
3. Isi: `KRS telah dibuka. Segera lakukan perencanaan mata kuliah.`
4. Kategori: `Akademik`
5. Publikasikan
**Ekspektasi:** Berita muncul di daftar

---

# Tahap 2: Registrasi Mahasiswa Baru

> Buka `http://localhost:5173/login` di tab incognito/private

### [REG-1] Buka Halaman Register
**Langkah:** Klik "Daftar" / "Register"
**Ekspektasi:** Form registrasi muncul: NIM, Email, Password, Nama, Fakultas, Prodi

### [REG-2] Registrasi TEST001 — Mahasiswa Daftar Sendiri
**Langkah:**
1. Masukkan data diri (NIM sudah disiapkan admin di SA-5):
   - NIM: `TEST001`
   - Email: `test001@student.bku.ac.id`
   - Password: `Test1234!`
   - Nama: `Mahasiswa Test 1`
   - Fakultas: Farmasi (opsional, bisa diisi manual)
   - Prodi: S1 Farmasi (opsional)
2. Klik Daftar
**Ekspektasi:** Registrasi berhasil, langsung login dan masuk ke dashboard mahasiswa (tanpa perlu login ulang)

### [REG-3] Logout, lalu Registrasi TEST002
**Langkah:**
1. Logout
2. Registrasi dengan NIM dari SA-6:
   - NIM: `TEST002`
   - Email: `test002@student.bku.ac.id`
   - Password: `Test1234!`
   - Nama: `Mahasiswa Test 2`
   - Fakultas: Keperawatan
   - Prodi: S1 Keperawatan
**Ekspektasi:** Berhasil login ke dashboard mahasiswa

### [REG-4] Logout, Login sebagai Mahasiswa 1 (sample)
**Langkah:** Login dengan NIM `231FF01001` / password `student123`
**Ekspektasi:** Masuk ke dashboard mahasiswa

---

# Tahap 3: Mahasiswa — Dashboard

> Login sebagai mahasiswa (gunakan TEST001 atau 231FF01001)

### [DSB-1] Dashboard Utama
**Langkah:** Buka `/student/dashboard`
**Ekspektasi:**
- Hero section menampilkan nama mahasiswa
- Kartu statistik: KENCANA, Beasiswa, Aspirasi, Kesehatan
- Quick Actions (7 akses cepat)
- Aktivitas Terbaru
- Kalender Kegiatan
- Pengumuman / Berita muncul
- Beasiswa tersedia

**Catatan tulis manual:** .........................................................

### [DSB-2] Aktivitas Terbaru
**Langkah:** Lakukan sesuatu (misal buka profil), lalu kembali ke dashboard
**Ekspektasi:** Aktivitas terbaru muncul di timeline

### [DSB-3] Kalender Kegiatan
**Langkah:** Klik tanggal di kalender
**Ekspektasi:** Popup event muncul, list kegiatan berubah sesuai tanggal

### [DSB-4] Berita / Pengumuman
**Langkah:** Scroll ke bagian Berita
**Ekspektasi:** Pengumuman dari SA-12 muncul dengan gambar header, badge kategori, "Baca Selengkapnya"

---

# Tahap 4: Mahasiswa — Profil

> Buka `/student/profile`

### [PRF-1] Tampilan Profil
**Langkah:** Buka halaman profil
**Ekspektasi:**
- Judul "Pengaturan Profil Akun" simpel
- Kartu identitas (avatar, nama, NIM, prodi, angkatan, semester)
- Tabs: Data Diri, Keamanan Akun, Preferensi Notif

**Catatan tulis manual:** .........................................................

### [PRF-2] Tab Data Diri — Lihat Data
**Langkah:** Klik tab "Data Diri"
**Ekspektasi:** Form terisi dengan data mahasiswa (NIK, NISN, TTL, alamat, dll)

### [PRF-3] Tab Data Diri — Update Data
**Langkah:** Ubah salah satu field (misal: nomor HP), lalu klik Simpan
**Ekspektasi:** Toast sukses, data tersimpan

### [PRF-4] Tab Data Diri — Validasi Error
**Langkah:** Kosongkan field wajib (misal: tempat lahir), klik Simpan
**Ekspektasi:** Error message muncul di field terkait (warna `var(--theme-primary)`)

### [PRF-5] Tab Data Diri — Field NISN
**Langkah:** Cek field NISN
**Ekspektasi:** NISN tampil sebagai input visible (bukan hidden field)

### [PRF-6] Tab Keamanan — Ganti Password
**Langkah:**
1. Klik tab "Keamanan Akun"
2. Isi password lama, baru, konfirmasi
3. Klik Perbarui Password
**Ekspektasi:** Dialog konfirmasi muncul, setelah dikonfirmasi password berubah

### [PRF-7] Tab Keamanan — Riwayat Login
**Langkah:** Scroll ke bagian Riwayat Login
**Ekspektasi:** Data riwayat login muncul dengan kolom Waktu, Perangkat, Lokasi, Status (dari log_aktivitas)

### [PRF-8] Tab Preferensi Notif
**Langkah:** Klik tab "Preferensi Notif"
**Ekspektasi:** Toggle untuk tiap kategori notifikasi (Prestasi, Beasiswa, Konseling, dll)

### [PRF-9] Upload Avatar
**Langkah:**
1. Hover avatar, klik "Ganti Foto"
2. Pilih file gambar
3. Crop
4. Simpan
**Ekspektasi:** Avatar berubah

---

# Tahap 5: Mahasiswa — Kencana (PKKMB)

> Buka `/student/kencana`

### [KCN-1] Dashboard Kencana
**Langkah:** Buka halaman Kencana
**Ekspektasi:**
- 4 kartu statistik: Periode, Progress, Nilai Univ, Remedial
- Bobot penilaian (Kognitif/Psikomotor/Afektif) dari backend (bukan hardcode)
- Donut chart dengan bobot dinamis
- Timeline tahapan Kencana
- Transparansi Status (blocker, mentor, notifikasi)

**Catatan tulis manual:** .........................................................

### [KCN-2] Timeline Stages
**Langkah:** Klik salah satu stage di timeline
**Ekspektasi:** Masuk ke halaman detail stage dengan daftar sesi

### [KCN-3] Detail Stage
**Langkah:** Di halaman stage, klik salah satu sesi
**Ekspektasi:** Masuk ke halaman sesi dengan materi, quiz, tugas

### [KCN-4] Detail Sesi — Materi
**Langkah:** Di halaman sesi, klik "Tandai Selesai" pada materi
**Ekspektasi:** Badge "Selesai" muncul, progress terupdate

### [KCN-5] Detail Sesi — Quiz
**Langkah:** Klik "Detail Quiz"
**Ekspektasi:** Masuk ke halaman quiz dengan instruksi

### [KCN-6] Kerjakan Quiz
**Langkah:**
1. Klik "Mulai Quiz"
2. Jawab soal-soal
3. Klik "Submit Jawaban"
**Ekspektasi:** Hasil quiz ditampilkan (nilai, benar/total, status lulus)

### [KCN-7] Cek Score Kencana
**Langkah:** Buka `/student/kencana/score`
**Ekspektasi:** Nilai kumulatif dan rincian komponen muncul

### [KCN-8] Cek Attendance / Presensi
**Langkah:** Buka `/student/kencana/attendance`
**Ekspektasi:** Tabel kehadiran per sesi

### [KCN-9] Undangan DP (Mentor)
**Langkah:** Buka `/student/kencana/invitations`
**Ekspektasi:** Halaman undangan DP (kosong atau ada undangan)

---

# Tahap 6: Mahasiswa — Beasiswa

> Buka `/student/scholarship`

### [BWS-1] Katalog Beasiswa
**Langkah:** Buka halaman Beasiswa
**Ekspektasi:** Daftar beasiswa yang tersedia muncul (minimal 3)

**Catatan tulis manual:** .........................................................

### [BWS-2] Detail Beasiswa
**Langkah:** Klik salah satu beasiswa
**Ekspektasi:** Detail beasiswa (nama, deskripsi, deadline, persyaratan)

### [BWS-3] Daftar Beasiswa
**Langkah:** Klik "Daftar" / "Ajukan"
**Ekspektasi:** Beasiswa terdaftar, muncul di riwayat pengajuan

### [BWS-4] Riwayat Pengajuan
**Langkah:** Buka tab/riwayat pengajuan
**Ekspektasi:** Status pengajuan muncul (Menunggu / Disetujui / Ditolak)

---

# Tahap 7: Mahasiswa — Konseling

> Buka `/student/counseling`

### [KSL-1] Halaman Konseling
**Langkah:** Buka halaman Konseling
**Ekspektasi:** Informasi layanan konseling, jadwal psikolog

**Catatan tulis manual:** .........................................................

### [KSL-2] Lihat Psikolog & Jadwal
**Langkah:** Klik daftar psikolog
**Ekspektasi:** Psikolog dan jadwal tersedia muncul

### [KSL-3] Booking Sesi Konseling
**Langkah:** Pilih psikolog, pilih jadwal, booking
**Ekspektasi:** Booking berhasil, muncul di riwayat

### [KSL-4] Riwayat Konseling
**Langkah:** Buka riwayat konseling
**Ekspektasi:** Riwayat booking (status: pending/confirmed/completed/cancelled)

---

# Tahap 8: Mahasiswa — Student Voice (Aspirasi)

> Buka `/student/voice`

### [SVC-1] Halaman Student Voice
**Langkah:** Buka halaman Student Voice
**Ekspektasi:** Daftar aspirasi yang sudah dibuat, tombol buat baru

**Catatan tulis manual:** .........................................................

### [SVC-2] Buat Aspirasi Baru
**Langkah:**
1. Klik "Buat Aspirasi"
2. Isi judul, kategori, deskripsi
3. Kirim
**Ekspektasi:** Aspirasi terkirim, muncul di daftar dengan status "Menunggu"

### [SVC-3] Detail Aspirasi
**Langkah:** Klik aspirasi yang sudah dibuat
**Ekspektasi:** Detail aspirasi tampil, bisa lihat respons admin

---

# Tahap 9: Mahasiswa — Kesehatan

> Buka `/student/health`

### [HLT-1] Dashboard Kesehatan
**Langkah:** Buka halaman Kesehatan
**Ekspektasi:** Ringkasan kesehatan, riwayat pemeriksaan

**Catatan tulis manual:** .........................................................

### [HLT-2] Buat Catatan Kesehatan Mandiri
**Langkah:**
1. Klik "Catatan Mandiri"
2. Isi keluhan, tekanan darah, dll
3. Simpan
**Ekspektasi:** Catatan tersimpan

### [HLT-3] Lihat Tips Kesehatan
**Langkah:** Buka tab/bagian Tips Kesehatan
**Ekspektasi:** Tips kesehatan muncul

### [HLT-4] Booking Tenaga Kesehatan
**Langkah:** (Jika tersedia) Pilih tenaga kesehatan, booking jadwal
**Ekspektasi:** Booking berhasil

---

# Tahap 10: Mahasiswa — Organisasi

> Buka `/student/organization`

### [ORG-1] Daftar Ormawa
**Langkah:** Buka halaman Organisasi
**Ekspektasi:** Daftar ormawa yang tersedia

**Catatan tulis manual:** .........................................................

### [ORG-2] Daftar Anggota Ormawa
**Langkah:** Cari ormawa, klik "Daftar"
**Ekspektasi:** Pendaftaran berhasil dikirim

### [ORG-3] Kelola Ormawa (jika sudah diterima)
**Langkah:** Buka ormawa yang sudah diikuti
**Ekspektasi:** Fitur CRUD kegiatan, LPJ, dll

---

# Tahap 11: Mahasiswa — Achievement (Prestasi)

> Buka `/student/achievement`

### [ACH-1] Daftar Prestasi
**Langkah:** Buka halaman Prestasi
**Ekspektasi:** Daftar prestasi yang sudah dilaporkan

**Catatan tulis manual:** .........................................................

### [ACH-2] Tambah Prestasi Baru
**Langkah:**
1. Klik "Tambah Prestasi"
2. Isi: nama prestasi, jenis, tingkat, tahun, file pendukung
3. Simpan
**Ekspektasi:** Prestasi terkirim, menunggu verifikasi admin

### [ACH-3] Detail & Edit Prestasi
**Langkah:** Klik prestasi, edit jika perlu
**Ekspektasi:** Detail tampil, edit tersimpan

### [ACH-4] Hapus Prestasi
**Langkah:** Hapus prestasi yang baru dibuat
**Ekspektasi:** Prestasi terhapus

---

# Tahap 12: Super Admin — Verifikasi & Monitoring

> Login sebagai **Super Admin** lagi

### [SA-MON-1] Cek Log Aktivitas Mahasiswa
**Langkah:** Buka halaman Audit Logs / Log Aktivitas
**Ekspektasi:** Aktivitas dari testing di atas tercatat (melihat profil, update data, buat aspirasi, dll)

**Catatan tulis manual:** .........................................................

### [SA-MON-2] Verifikasi Prestasi Mahasiswa
**Langkah:** Buka menu Achievement / Prestasi → cari prestasi dari ACH-2
**Ekspektasi:** Prestasi muncul dengan status "Menunggu", bisa diverifikasi

### [SA-MON-3] Cek Pengajuan Beasiswa
**Langkah:** Buka menu Scholarship Applications
**Ekspektasi:** Pengajuan dari BWS-3 muncul

### [SA-MON-4] Cek Aspirasi Mahasiswa
**Langkah:** Buka menu Aspirations / Student Voice
**Ekspektasi:** Aspirasi dari SVC-2 muncul, bisa direspons

### [SA-MON-5] Cek Booking Konseling
**Langkah:** Buka menu Konseling / Booking Psikolog
**Ekspektasi:** Booking dari KSL-3 muncul

### [SA-MON-6] Cek Data Kesehatan
**Langkah:** Buka menu Tenaga Kesehatan / Booking
**Ekspektasi:** Booking dari HLT-4 muncul

### [SA-MON-7] Kelola Pendaftaran Ormawa
**Langkah:** Buka menu Ormawa → lihat pendaftar baru
**Ekspektasi:** Pendaftaran dari ORG-2 muncul

---

# Ringkasan Hasil Testing

| # | Kode | Nama Test | Status (✓/✗) | Catatan Revisi |
|---|---|---|---|---|
| 1 | SA-1 | Login Super Admin | | |
| 2 | SA-2 | Data Master Fakultas & Prodi | | |
| 3 | SA-3 | Periode Akademik | | |
| 4 | SA-4 | Manajemen Mahasiswa | | |
| 5 | SA-5 | Tambah Mahasiswa Baru | | |
| 6 | SA-6 | Tambah Mahasiswa 2 | | |
| 7 | SA-7 | Cek Beasiswa | | |
| 8 | SA-8 | Cek Berita | | |
| 9 | SA-9 | Cek Psikolog | | |
| 10 | SA-10 | Cek Tenaga Kesehatan | | |
| 11 | SA-11 | Periode Kencana | | |
| 12 | SA-12 | Buat Pengumuman | | |
| 13 | REG-1 | Halaman Register | | |
| 14 | REG-2 | Registrasi TEST001 | | |
| 15 | REG-3 | Registrasi TEST002 | | |
| 16 | REG-4 | Login Mahasiswa Sample | | |
| 17 | DSB-1 | Dashboard Utama | | |
| 18 | DSB-2 | Aktivitas Terbaru | | |
| 19 | DSB-3 | Kalender Kegiatan | | |
| 20 | DSB-4 | Berita / Pengumuman | | |
| 21 | PRF-1 | Tampilan Profil | | |
| 22 | PRF-2 | Tab Data Diri Lihat | | |
| 23 | PRF-3 | Update Data Diri | | |
| 24 | PRF-4 | Validasi Error | | |
| 25 | PRF-5 | Field NISN | | |
| 26 | PRF-6 | Ganti Password | | |
| 27 | PRF-7 | Riwayat Login | | |
| 28 | PRF-8 | Preferensi Notif | | |
| 29 | PRF-9 | Upload Avatar | | |
| 30 | KCN-1 | Dashboard Kencana | | |
| 31 | KCN-2 | Timeline Stage | | |
| 32 | KCN-3 | Detail Stage | | |
| 33 | KCN-4 | Tandai Selesai Materi | | |
| 34 | KCN-5 | Detail Quiz | | |
| 35 | KCN-6 | Kerjakan Quiz | | |
| 36 | KCN-7 | Score Kencana | | |
| 37 | KCN-8 | Attendance | | |
| 38 | KCN-9 | Undangan DP | | |
| 39 | BWS-1 | Katalog Beasiswa | | |
| 40 | BWS-2 | Detail Beasiswa | | |
| 41 | BWS-3 | Daftar Beasiswa | | |
| 42 | BWS-4 | Riwayat Pengajuan | | |
| 43 | KSL-1 | Halaman Konseling | | |
| 44 | KSL-2 | Lihat Psikolog | | |
| 45 | KSL-3 | Booking Konseling | | |
| 46 | KSL-4 | Riwayat Konseling | | |
| 47 | SVC-1 | Halaman Voice | | |
| 48 | SVC-2 | Buat Aspirasi | | |
| 49 | SVC-3 | Detail Aspirasi | | |
| 50 | HLT-1 | Dashboard Kesehatan | | |
| 51 | HLT-2 | Catatan Mandiri | | |
| 52 | HLT-3 | Tips Kesehatan | | |
| 53 | HLT-4 | Booking Nakes | | |
| 54 | ORG-1 | Daftar Ormawa | | |
| 55 | ORG-2 | Daftar Anggota | | |
| 56 | ORG-3 | Kelola Ormawa | | |
| 57 | ACH-1 | Daftar Prestasi | | |
| 58 | ACH-2 | Tambah Prestasi | | |
| 59 | ACH-3 | Detail Prestasi | | |
| 60 | ACH-4 | Hapus Prestasi | | |
| 61 | SA-MON-1 | Log Aktivitas | | |
| 62 | SA-MON-2 | Verifikasi Prestasi | | |
| 63 | SA-MON-3 | Cek Pengajuan Beasiswa | | |
| 64 | SA-MON-4 | Cek Aspirasi | | |
| 65 | SA-MON-5 | Booking Konseling | | |
| 66 | SA-MON-6 | Data Kesehatan | | |
| 67 | SA-MON-7 | Pendaftaran Ormawa | | |

---

## Cara Menggunakan Dokumen Ini

1. Buka dua browser: satu untuk Super Admin (`/admin`), satu untuk Mahasiswa (tab incognito/private)
2. Ikuti langkah berurutan dari Tahap 1 sampai Tahap 12
3. Setiap kali selesai satu test case, isi kolom **Status** dengan ✓ (pass) atau ✗ (fail)
4. Jika fail/error, tulis **Catatan Revisi** — apa yang terjadi, apa yang seharusnya terjadi
5. Kumpulkan semua catatan, nanti kita bahas dan perbaiki bersama

> **Catatan Penting:**
> - Admin hanya menyiapkan data NIM (Tahap 1). Mahasiswa membuat akun sendiri (Tahap 2).
> - Setiap restart backend, data bootstrap akan di‑seed ulang. Pastikan server tetap berjalan selama testing.
> - Form registrasi sekarang sudah include field NIM, Fakultas, dan Prodi.

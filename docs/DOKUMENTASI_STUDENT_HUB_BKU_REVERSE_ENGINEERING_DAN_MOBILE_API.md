# Student Hub BKU - Reverse Engineering Web, Mobile, dan Backend API

Dokumen ini menjelaskan struktur Student Hub BKU dari sisi web, mobile Flutter, backend Go/Fiber, database, serta API contract yang disiapkan untuk integrasi mobile. Fokus utama adalah role mahasiswa, korelasinya dengan role lain, dan role psikolog yang sudah ada di website tetapi masih baru di mobile.

## 1. Gambaran Arsitektur

Student Hub BKU terdiri dari tiga aplikasi dalam satu workspace:

- `frontend/`: website React + Vite. Berisi portal mahasiswa, admin fakultas, ormawa, super admin, dan psikolog.
- `backend/`: REST API Go + Fiber + GORM + PostgreSQL. Ini adalah sumber data utama untuk website dan mobile.
- `Mobile/`: Flutter app. UI mahasiswa, ormawa, dan psikolog sudah banyak dibuat; beberapa bagian sudah punya repository API, tetapi masih banyak screen yang memakai dummy/mock.

Alur request normal:

1. User login dari web/mobile ke `POST /api/auth/login`.
2. Backend mengembalikan JWT `access_token`.
3. Web/mobile menyimpan token.
4. Request berikutnya memakai header `Authorization: Bearer <token>`.
5. Middleware `backend/middleware/jwt_middleware.go` membaca role dari token dan mengisi `Locals`: `user_id`, `student_id`, `role`, `fakultas_id`, `ormawa_id`.
6. Controller mengambil data dari schema PostgreSQL sesuai role.

## 2. Struktur Folder Penting

### Backend

- `backend/main.go`
  Entry point Fiber, CORS, static upload, route registration.

- `backend/auth/auth.go`
  Login JWT, bootstrap seed data, user default, role default. Fungsi penting:
  - `Login`
  - `EnsureBootstrapData`
  - `ensureUser`
  - `ensurePsychologistBootstrap`

- `backend/config/db_connection.go`
  Koneksi PostgreSQL.

- `backend/config/db_migrations.go`
  AutoMigrate dan pembuatan schema:
  - `public`
  - `fakultas`
  - `mahasiswa`
  - `ormawa`
  - `psikolog`

- `backend/models/model.go`
  Model global, mahasiswa, fakultas, ormawa, notifikasi mahasiswa.

- `backend/models/psychologist.go`
  Model khusus schema `psikolog`.

- `backend/routes/*.go`
  Mapping URL ke controller.

- `backend/controllers/mahasiswa/`
  Controller fitur mahasiswa.

- `backend/controllers/psychologist/`
  Controller fitur psikolog website.

- `backend/controllers/mahasiswa/psychologist_counseling_handler.go`
  API tambahan untuk mobile bridge.

### Frontend Web

- `frontend/src/App.jsx`
  Routing utama semua portal.

- `frontend/src/services/api.js`
  API client website.

- `frontend/src/pages/Student/`
  Website mahasiswa.

- `frontend/src/pages/Psychologist/`
  Website psikolog.

- `frontend/src/pages/OrmawaAdmin/`
  Website ormawa.

- `frontend/src/pages/FacultyAdmin/`
  Website admin fakultas.

- `frontend/src/pages/SuperAdmin/`
  Website super admin.

### Mobile Flutter

- `Mobile/lib/main.dart`
  App bootstrap, provider registration.

- `Mobile/lib/core/network/api_client.dart`
  Dio client dengan base URL dari `ApiGate`.

- `Mobile/lib/core/services/api_gate.dart`
  Base URL mobile. Default: `http://localhost:8000/api`.

- `Mobile/lib/core/services/auth_service.dart`
  Login mobile, penyimpanan token, mapping role.

- `Mobile/lib/features/mahasiswa/`
  Feature mahasiswa mobile.

- `Mobile/lib/features/counseling/`
  Feature konseling mahasiswa dan psikolog mobile.

- `Mobile/lib/features/ormawa/`
  Feature ormawa mobile.

## 3. Role dan Routing Website

### Mahasiswa

Web route di `frontend/src/App.jsx`:

- `/student/dashboard`
- `/student/kencana`
- `/student/achievement`
- `/student/scholarship`
- `/student/counseling`
- `/student/health`
- `/student/voice`
- `/student/organisasi`
- `/student/profile`
- `/student/notifikasi`

Backend route di `backend/routes/mahasiswa.go`:

- `/api/mahasiswa/dashboard`
- `/api/kencana/*`
- `/api/achievement/*`
- `/api/organisasi/*`
- `/api/profil/*`
- `/api/student-health/*`
- `/api/counseling/*`
- `/api/scholarship/*`
- `/api/student-voice/*`
- `/api/notifikasi/*`

### Psikolog

Web route di `frontend/src/App.jsx`:

- `/psychologist`
- `/psychologist/bookings`
- `/psychologist/schedule`
- `/psychologist/patients`
- `/psychologist/assessments`
- `/psychologist/analytics`
- `/psychologist/reports`
- `/psychologist/notifications`
- `/psychologist/settings`

Backend route di `backend/routes/psychologist.go`:

- `/api/psychologist/me`
- `/api/psychologist/profile`
- `/api/psychologist/change-password`
- `/api/psychologist/dashboard`
- `/api/psychologist/bookings`
- `/api/psychologist/schedules`
- `/api/psychologist/patients`
- `/api/psychologist/assessments`
- `/api/psychologist/analytics`
- `/api/psychologist/reports`
- `/api/psychologist/notifications`

### Ormawa

Backend route di `backend/routes/ormawa.go`:

- `/api/ormawa/profile`
- `/api/ormawa/stats`
- `/api/ormawa/proposals`
- `/api/ormawa/members`
- `/api/ormawa/events`
- `/api/ormawa/attendance`
- `/api/ormawa/announcements`
- `/api/ormawa/kas`
- `/api/ormawa/lpjs`
- `/api/ormawa/aspirations`
- `/api/ormawa/notifications`
- `/api/ormawa/kencana/*`

### Fakultas dan Super Admin

Admin fakultas memakai prefix `/api/faculty/*`, file `backend/routes/fakultas.go`.
Super admin memakai prefix `/api/admin/*`, file `backend/routes/super_admin.go`.

## 4. Database dan Korelasi Schema

### Schema `public`

- `public.users`
  Akun login semua role. Role dibaca dari kolom `role`.

### Schema `mahasiswa`

Model utama berada di `backend/models/model.go`.

Tabel penting:

- `mahasiswa.mahasiswa`
  Profil mahasiswa, relasi ke `public.users`, `fakultas.fakultas`, `fakultas.program_studi`.

- `mahasiswa.prestasi`
  Prestasi mahasiswa. Diverifikasi admin fakultas.

- `mahasiswa.beasiswa`
  Katalog beasiswa.

- `mahasiswa.beasiswa_pendaftaran`
  Pengajuan beasiswa mahasiswa. Diverifikasi admin fakultas.

- `mahasiswa.aspirasi`
  Aspirasi mahasiswa. Ditanggapi fakultas atau ormawa tergantung konteks.

- `mahasiswa.konseling`
  Konseling lama berbasis dosen/konselor.

- `mahasiswa.jadwal_konseling`
  Jadwal konseling lama untuk endpoint `/api/counseling/*`.

- `mahasiswa.kesehatan`
  Health screening.

- `mahasiswa.notifikasi`
  Notifikasi mahasiswa.

### Schema `psikolog`

Model berada di `backend/models/psychologist.go`.

Tabel:

- `psikolog.profiles`
  Profil psikolog.

- `psikolog.schedule_slots`
  Slot praktik psikolog.

- `psikolog.bookings`
  Booking mahasiswa ke psikolog. Ini bridge utama mahasiswa - psikolog.

- `psikolog.session_notes`
  Catatan sesi konseling.

- `psikolog.assessments`
  Assessment dari portal psikolog.

- `psikolog.reports`
  Laporan klinis.

- `psikolog.notifications`
  Notifikasi khusus psikolog.

### Korelasi Mahasiswa dengan Role Lain

- Mahasiswa -> Fakultas
  `mahasiswa.mahasiswa.fakultas_id` mengarah ke `fakultas.fakultas.id`. Admin fakultas melihat dan memverifikasi data mahasiswa, prestasi, beasiswa, aspirasi, surat, kesehatan.

- Mahasiswa -> Program Studi
  `mahasiswa.mahasiswa.program_studi_id` mengarah ke `fakultas.program_studi.id`.

- Mahasiswa -> Ormawa
  Keanggotaan dan riwayat organisasi tersimpan di schema `ormawa` dan `mahasiswa.riwayat_organisasis`.

- Mahasiswa -> Psikolog
  Booking baru tersimpan di `psikolog.bookings` dengan `mahasiswa_id` dan `psikolog_id`. Psikolog memproses booking, membuat session note, assessment, analytics, dan report.

- Mahasiswa -> Super Admin
  Super admin mengelola user, data master fakultas/prodi, audit, konten, dan agregasi lintas role.

## 5. Gap Mobile yang Ditemukan

Mobile Flutter sudah memiliki UI dan beberapa repository:

- `Mobile/lib/core/services/auth_service.dart` sudah login ke `/api/auth/login`.
- `Mobile/lib/features/mahasiswa/data/repositories/student_repository_impl.dart` sudah memanggil sebagian endpoint mahasiswa.
- `Mobile/lib/core/providers/student_provider.dart` masih menyimpan beberapa data mock seperti available psychologists dan jadwal.
- `Mobile/lib/features/counseling/presentation/providers/psychologist_dashboard_provider.dart` masih mock untuk role psikolog.
- Banyak screen psikolog mobile masih berbasis list lokal/static.

Gap paling besar:

1. Daftar psikolog mobile masih mock.
2. Jadwal psikolog mobile belum membaca `psikolog.schedule_slots`.
3. Booking mahasiswa ke psikolog belum memakai `psikolog.bookings`.
4. Role psikolog mobile belum punya contract yang terdokumentasi, walaupun backend website psikolog sudah tersedia.

## 6. API Mobile Bridge yang Dibuat

File baru:

- `backend/controllers/mahasiswa/psychologist_counseling_handler.go`
- `backend/routes/mahasiswa.go`

Route didaftarkan di:

- `backend/main.go memakai routes existing

Semua endpoint memakai prefix:

```text
/api
```

Semua endpoint mobile membutuhkan:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

Response standar:

```json
{
  "success": true,
  "status": "success",
  "data": {}
}
```

Error standar mengikuti Fiber error handler:

```json
{
  "success": false,
  "message": "Pesan error"
}
```

## 7. API Contract Mobile

### Login

Endpoint existing:

```http
POST /api/auth/login
```

Body:

```json
{
  "identifier": "231FF01001",
  "password": "student123"
}
```

Response penting:

```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token",
    "user": {
      "id": 1,
      "email": "231ff01001@student.bku.ac.id",
      "role": "mahasiswa"
    }
  }
}
```

Mobile menyimpan `access_token`, lalu kirim sebagai Bearer token.

### Mobile Bootstrap

```http
GET POST /api/auth/login untuk cek data.user.role
```

Fungsi:

- Mengembalikan role aktif.
- Mengembalikan user ringkas.
- Mengembalikan profile sesuai role.
- Mengembalikan navigasi mobile yang direkomendasikan.

Contoh response mahasiswa:

```json
{
  "success": true,
  "data": {
    "role": "mahasiswa",
    "user": {
      "id": 1,
      "email": "231ff01001@student.bku.ac.id",
      "role": "mahasiswa"
    },
    "profile": {
      "id": 1,
      "nim": "231FF01001",
      "name": "Mahasiswa Farmasi",
      "faculty": "Fakultas Farmasi",
      "program_studi": "Farmasi"
    },
    "navigation": []
  }
}
```

### Student Summary

```http
GET /api/mahasiswa/summary
```

Fungsi:

- Ringkasan profil mahasiswa.
- Statistik lintas fitur mahasiswa.
- Cocok untuk dashboard mobile.

Response:

```json
{
  "success": true,
  "data": {
    "profile": {
      "id": 1,
      "nim": "231FF01001",
      "name": "Mahasiswa Farmasi",
      "faculty": "Fakultas Farmasi",
      "program_studi": "Farmasi"
    },
    "stats": {
      "achievements": 1,
      "scholarship_requests": 1,
      "aspirations": 1,
      "health_records": 1,
      "psychologist_bookings": 1
    }
  }
}
```

### List Psikolog untuk Mahasiswa

```http
GET /api/counseling/psychologists
GET /api/counseling/psychologists?search=karir
```

Fungsi:

- Menggantikan daftar psikolog mock di mobile.
- Membaca dari `psikolog.profiles`.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Psikolog BKU",
      "email": "psikolog@bku.ac.id",
      "phone": "+62 812 3456 7890",
      "specialization": "Psikolog Klinis Pendidikan",
      "bio": "Berpengalaman menangani stres akademik...",
      "photo_url": "",
      "location": "Ruang Konseling Student Hub",
      "languages": ["Indonesia", "Inggris"],
      "fee": 150000,
      "is_active": true
    }
  ]
}
```

### Jadwal Psikolog

```http
GET /api/counseling/psychologists/:id/schedules
```

Fungsi:

- Membaca slot aktif dari `psikolog.schedule_slots`.
- Memberikan `next_date` agar mobile bisa langsung membuat booking tanggal terdekat dari hari slot.

Response:

```json
{
  "success": true,
  "data": {
    "psychologist": {
      "id": 1,
      "name": "Psikolog BKU"
    },
    "slots": [
      {
        "id": 1,
        "day": "Senin",
        "start": "09:00",
        "end": "12:00",
        "location": "Ruang Konseling A",
        "quota": 3,
        "is_active": true,
        "next_date": "2026-05-18",
        "display": "Senin, 09:00 - 12:00",
        "psikolog_id": 1
      }
    ]
  }
}
```

### Riwayat Booking Mahasiswa ke Psikolog

```http
GET /api/counseling/psychologist-bookings
```

Fungsi:

- Membaca booking dari `psikolog.bookings` berdasarkan mahasiswa login.
- Ini berbeda dari endpoint lama `/api/counseling/riwayat` yang memakai `mahasiswa.konseling`.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "psychologist_id": 1,
      "psychologist": {
        "id": 1,
        "name": "Psikolog BKU"
      },
      "student_id": 1,
      "date": "2026-05-14",
      "display_date": "14 May 2026",
      "start": "09:00",
      "end": "10:00",
      "topic": "Stres Akademik",
      "complaint": "Butuh pendampingan...",
      "status": "Menunggu",
      "admin_note": ""
    }
  ]
}
```

### Membuat Booking Mahasiswa ke Psikolog

```http
POST /api/counseling/psychologist-bookings
```

Body memakai `slot_id`:

```json
{
  "psikolog_id": 1,
  "slot_id": 1,
  "topic": "Stres Akademik",
  "complaint": "Saya butuh konsultasi terkait tekanan akademik."
}
```

Body manual:

```json
{
  "psikolog_id": 1,
  "date": "2026-05-18",
  "start": "09:00",
  "end": "10:00",
  "topic": "Kecemasan Ujian",
  "complaint": "Sulit tidur menjelang ujian."
}
```

Response:

```json
{
  "success": true,
  "status": "success",
  "data": {
    "id": 10,
    "psychologist_id": 1,
    "date": "2026-05-18",
    "start": "09:00",
    "end": "10:00",
    "topic": "Stres Akademik",
    "complaint": "Saya butuh konsultasi...",
    "status": "Menunggu"
  }
}
```

Side effect:

- Insert ke `psikolog.bookings`.
- Insert notifikasi ke `psikolog.notifications`.
- Psikolog bisa melihat request booking di website `/psychologist/bookings`.

### Membatalkan Booking Psikolog

```http
DELETE /api/counseling/psychologist-bookings/:id
```

Fungsi:

- Mengubah status booking menjadi `Dibatalkan`.
- Tidak menghapus row agar riwayat tetap ada.

Response:

```json
{
  "success": true,
  "data": {
    "id": 10,
    "status": "Dibatalkan"
  }
}
```

## 8. API Existing yang Bisa Langsung Dipakai Mobile

### Mahasiswa

- `GET /api/mahasiswa/dashboard`
- `GET /api/kencana/progress`
- `POST /api/kencana/check-in/:id`
- `GET /api/kencana/sertifikat`
- `GET /api/kencana/banding`
- `POST /api/kencana/banding`
- `GET /api/achievement/`
- `POST /api/achievement/`
- `GET /api/scholarship/`
- `POST /api/scholarship/:id/daftar`
- `GET /api/student-health/riwayat`
- `POST /api/student-health/record`
- `GET /api/student-voice/`
- `POST /api/student-voice/create`
- `GET /api/notifikasi/`
- `PUT /api/notifikasi/:id/baca`

### Psikolog

- `GET /api/psychologist/dashboard`
- `GET /api/psychologist/bookings`
- `GET /api/psychologist/bookings/:id`
- `PUT /api/psychologist/bookings/:id/status`
- `GET /api/psychologist/schedules`
- `PUT /api/psychologist/schedules`
- `GET /api/psychologist/patients`
- `GET /api/psychologist/patients/:id/medical-record`
- `POST /api/psychologist/patients/:id/session-notes`
- `GET /api/psychologist/assessments`
- `POST /api/psychologist/assessments`
- `GET /api/psychologist/analytics`
- `GET /api/psychologist/reports`
- `POST /api/psychologist/reports`
- `GET /api/psychologist/notifications`
- `PUT /api/psychologist/notifications/:id/read`
- `PUT /api/psychologist/notifications/read-all`
- `DELETE /api/psychologist/notifications/:id`
- `GET /api/psychologist/me`
- `PUT /api/psychologist/profile`
- `PUT /api/psychologist/change-password`

### Ormawa

Mobile ormawa repository sudah banyak mengarah ke endpoint existing:

- `GET /api/ormawa/stats`
- `GET /api/ormawa/proposals`
- `POST /api/ormawa/proposals`
- `GET /api/ormawa/members`
- `POST /api/ormawa/members`
- `GET /api/ormawa/events`
- `POST /api/ormawa/events`
- `GET /api/ormawa/kas`
- `POST /api/ormawa/kas`
- `GET /api/ormawa/lpjs`
- `POST /api/ormawa/lpjs`
- `GET /api/ormawa/notifications`
- `PUT /api/ormawa/notifications/:id/read`

## 9. Rekomendasi Integrasi Mobile

1. Jangan langsung ubah semua screen sekaligus.
2. Mulai dari `AuthService`, pastikan token tersimpan.
3. Buat repository khusus mobile untuk endpoint web yang sama.
4. Ganti mock mahasiswa counseling:
   - daftar psikolog -> `GET /api/counseling/psychologists`
   - jadwal psikolog -> `GET /api/counseling/psychologists/:id/schedules`
   - booking -> `POST /api/counseling/psychologist-bookings`
   - riwayat booking -> `GET /api/counseling/psychologist-bookings`
5. Untuk role psikolog mobile, pakai endpoint existing `/api/psychologist/*` karena sudah sesuai dengan website.
6. Untuk ormawa mobile, lanjutkan endpoint existing `/api/ormawa/*`.

## 10. Verifikasi yang Sudah Dilakukan

Backend compile:

```bash
go test ./...
```

Endpoint mobile dites dengan akun mahasiswa:

```text
GET POST /api/auth/login untuk cek data.user.role
GET /api/mahasiswa/summary
GET /api/counseling/psychologists
GET /api/counseling/psychologists/1/schedules
GET /api/counseling/psychologist-bookings
```

Hasil verifikasi lokal:

```json
{
  "role": "mahasiswa",
  "student": "Mahasiswa Farmasi",
  "psychologists": 1,
  "slots": 6,
  "bookings": 1
}
```

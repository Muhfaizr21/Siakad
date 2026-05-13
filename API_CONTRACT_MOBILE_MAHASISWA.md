# API Contract Mobile - Role Mahasiswa

Dokumen ini adalah kontrak API untuk aplikasi mobile role `mahasiswa`.

Backend yang dipakai:

```text
Mobile Flutter -> REST API Go/Fiber -> PostgreSQL student
```

## 1. Base URL

Local development:

```text
http://localhost:8000/api
```

Android Emulator:

```text
http://10.0.2.2:8000/api
```

Physical device:

```text
http://<IP-LAPTOP>:8000/api
```

Flutter base URL:

```text
Mobile/lib/core/services/api_gate.dart
```

## 2. Auth

### Login Mahasiswa

```http
POST /auth/login
```

Headers:

```http
Content-Type: application/json
Accept: application/json
```

Body:

```json
{
  "identifier": "231FF01001",
  "password": "student123"
}
```

Success response:

```json
{
  "success": true,
  "status": "success",
  "data": {
    "token": "JWT_TOKEN",
    "access_token": "JWT_TOKEN",
    "user": {
      "id": 1,
      "email": "231ff01001@student.bku.ac.id",
      "role": "mahasiswa",
      "nim": "231FF01001",
      "nama": "Mahasiswa Farmasi",
      "ormawa_id": null
    },
    "mahasiswa": {}
  }
}
```

Mobile wajib menyimpan:

```text
data.access_token
data.user.role
data.user.nim
```

### Protected Header

Semua endpoint di bawah ini wajib memakai:

```http
Authorization: Bearer <access_token>
Accept: application/json
```

Jika token tidak dikirim:

```json
{
  "status": "error",
  "message": "Missing Authorization header"
}
```

## 3. Standard Response

Backend lama belum sepenuhnya seragam. Mobile adapter sebaiknya menerima dua format:

```json
{
  "success": true,
  "data": {}
}
```

atau:

```json
{
  "status": "success",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Pesan error"
}
```

atau:

```json
{
  "status": "error",
  "message": "Pesan error"
}
```

## 4. Endpoint Bersama Web/Mobile Mahasiswa

Endpoint ini berada di route mahasiswa/counseling agar website dan mobile memakai URL yang sama.

Source code:

```text
backend/routes/mahasiswa.go
backend/controllers/mahasiswa/psychologist_counseling_handler.go
```

### 4.1 Catatan Login dan Role

Tidak ada endpoint `bootstrap` khusus mobile setelah endpoint disatukan. Mobile cukup membaca `data.user.role` dari response login, lalu mengambil data awal dari endpoint web yang sama, misalnya `/mahasiswa/summary` dan `/mahasiswa/dashboard`.

### 4.2 Summary Mahasiswa

```http
GET /mahasiswa/summary
```

Response:

```json
{
  "success": true,
  "data": {
    "profile": {
      "id": 1,
      "nim": "231FF01001",
      "name": "Mahasiswa Farmasi",
      "email": "231ff01001@student.bku.ac.id",
      "faculty": "Fakultas Farmasi",
      "program_studi": "Farmasi",
      "status": "Aktif"
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

### 4.3 List Psikolog

```http
GET /counseling/psychologists
GET /counseling/psychologists?search=karir
```

Source table:

```text
psikolog.profiles
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 12,
      "name": "Psikolog BKU",
      "email": "psikolog@bku.ac.id",
      "phone": "+62 812 3456 7890",
      "specialization": "Psikolog Klinis Pendidikan",
      "bio": "Berpengalaman menangani stres akademik.",
      "photo_url": "",
      "location": "Ruang Konseling Student Hub",
      "languages": ["Indonesia", "Inggris"],
      "fee": 150000,
      "is_active": true
    }
  ]
}
```

### 4.4 Jadwal Psikolog

```http
GET /counseling/psychologists/:id/schedules
```

Path params:

```text
id = psikolog_id
```

Source table:

```text
psikolog.schedule_slots
```

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

### 4.5 Riwayat Booking Psikolog

```http
GET /counseling/psychologist-bookings
```

Source table:

```text
psikolog.bookings
```

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
      "date": "2026-05-18",
      "display_date": "18 May 2026",
      "start": "09:00",
      "end": "10:00",
      "topic": "Stres Akademik",
      "complaint": "Butuh pendampingan.",
      "status": "Menunggu",
      "admin_note": ""
    }
  ]
}
```

### 4.6 Buat Booking Psikolog

```http
POST /counseling/psychologist-bookings
```

Body dengan `slot_id`:

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

Created response:

```json
{
  "success": true,
  "status": "success",
  "data": {
    "id": 10,
    "psychologist_id": 1,
    "student_id": 1,
    "date": "2026-05-18",
    "start": "09:00",
    "end": "10:00",
    "topic": "Kecemasan Ujian",
    "complaint": "Sulit tidur menjelang ujian.",
    "status": "Menunggu"
  }
}
```

Side effect:

- Insert ke `psikolog.bookings`.
- Insert notifikasi ke `psikolog.notifications`.
- Website psikolog bisa melihat booking di `/psychologist/bookings`.

### 4.7 Batalkan Booking Psikolog

```http
DELETE /counseling/psychologist-bookings/:id
```

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

## 5. Endpoint Website yang Bisa Dipakai Mobile Mahasiswa

Route source:

```text
backend/routes/mahasiswa.go
backend/controllers/mahasiswa/*
backend/models/model.go
backend/models/counseling_jadwal.go
```

### 5.1 Dashboard

| Method | Path | Fungsi |
|---|---|---|
| GET | `/mahasiswa/dashboard` | Dashboard mahasiswa |
| GET | `/mahasiswa/kegiatan` | Kegiatan/aktivitas mahasiswa |

### 5.2 Profil

| Method | Path | Fungsi |
|---|---|---|
| GET | `/profil/` | Ambil profil mahasiswa login |
| PUT | `/profil/data-diri` | Update data diri |
| PUT | `/profil/change-password` | Ganti password |
| POST | `/profil/foto` | Upload foto profil |
| GET | `/profil/preferensi-notif` | Ambil preferensi notifikasi |
| PUT | `/profil/preferensi-notif` | Update preferensi notifikasi |
| GET | `/profil/sesi-aktif` | Ambil sesi aktif |
| GET | `/profil/riwayat-login` | Ambil riwayat login |

Update profil body:

```json
{
  "nama": "Nama Mahasiswa",
  "email_personal": "nama@email.com",
  "no_hp": "08123456789",
  "alamat": "Bandung",
  "kota": "Bandung",
  "kode_pos": "40123"
}
```

Change password body:

```json
{
  "old_password": "password_lama",
  "new_password": "password_baru",
  "confirm_password": "password_baru"
}
```

Upload foto:

```text
multipart/form-data
field: foto
```

### 5.3 Kencana / PKKMB

| Method | Path | Fungsi |
|---|---|---|
| GET | `/kencana/progress` | Progress PKKMB mahasiswa |
| POST | `/kencana/check-in/:id` | Check-in kegiatan |
| GET | `/kencana/sertifikat` | Ambil data sertifikat |
| POST | `/kencana/sertifikat/generate` | Generate sertifikat |
| GET | `/kencana/banding` | Daftar banding |
| POST | `/kencana/banding` | Submit banding |
| GET | `/kencana/kuis/:id/soal` | Ambil soal kuis |
| POST | `/kencana/kuis/:id/submit` | Submit jawaban kuis |

Submit banding body:

```json
{
  "alasan": "Saya sudah mengikuti kegiatan namun belum tercatat.",
  "bukti_url": "/uploads/bukti.jpg"
}
```

Submit kuis body:

```json
{
  "answers": [
    {
      "question_id": 1,
      "option_id": 2
    }
  ]
}
```

### 5.4 Prestasi

| Method | Path | Fungsi |
|---|---|---|
| GET | `/achievement/` | List prestasi mahasiswa |
| GET | `/achievement/?search=...` | Search prestasi |
| POST | `/achievement/` | Tambah prestasi |
| GET | `/achievement/:id` | Detail prestasi |
| DELETE | `/achievement/:id` | Hapus prestasi status Menunggu |

Create prestasi:

```text
multipart/form-data
nama_kegiatan: string
kategori: string
tingkat: string
peringkat: string
riwayat_organisasi_id: optional
bukti: file PDF/JPG/JPEG/PNG max 5MB
```

### 5.5 Beasiswa

| Method | Path | Fungsi |
|---|---|---|
| GET | `/scholarship/` | Katalog beasiswa aktif |
| GET | `/scholarship/?kategori=Prestasi&sort=nilai_desc` | Filter/sort katalog |
| GET | `/scholarship/riwayat` | Riwayat pengajuan mahasiswa |
| GET | `/scholarship/:id` | Detail beasiswa |
| POST | `/scholarship/:id/daftar` | Daftar beasiswa |
| GET | `/scholarship/pengajuan/:id` | Detail pengajuan |

Daftar beasiswa:

```text
multipart/form-data
catatan: optional string
berkas_utama: optional file
```

### 5.6 Konseling Lama

Endpoint ini memakai model lama `mahasiswa.konseling` dan `mahasiswa.jadwal_konseling`.

| Method | Path | Fungsi |
|---|---|---|
| GET | `/counseling/status` | Status konseling mahasiswa |
| GET | `/counseling/jadwal` | Jadwal konseling lama |
| POST | `/counseling/booking` | Booking jadwal lama |
| POST | `/counseling/request` | Request konseling ke dosen |
| GET | `/counseling/riwayat` | Riwayat konseling lama |
| DELETE | `/counseling/riwayat/:id` | Batalkan booking lama |

Rekomendasi mobile:

```text
Untuk fitur psikolog baru, gunakan /counseling/*.
```

### 5.7 Health Screening

| Method | Path | Fungsi |
|---|---|---|
| GET | `/student-health/riwayat` | Riwayat kesehatan |
| GET | `/student-health/riwayat/:id` | Detail kesehatan |
| GET | `/student-health/ringkasan` | Ringkasan kesehatan |
| GET | `/student-health/tips` | Tips kesehatan |
| POST | `/student-health/record` | Tambah record kesehatan |
| POST | `/student-health/mandiri` | Screening mandiri |

Create record body:

```json
{
  "jenis_pemeriksaan": "Screening Mandiri",
  "tanggal": "2026-05-13T00:00:00Z",
  "tinggi_badan": 170,
  "berat_badan": 65,
  "tekanan_darah": "120/80",
  "keluhan": "Pusing ringan",
  "catatan": "Istirahat cukup"
}
```

### 5.8 Student Voice / Aspirasi

| Method | Path | Fungsi |
|---|---|---|
| GET | `/student-voice/stats` | Statistik aspirasi |
| GET | `/student-voice/` | List aspirasi mahasiswa |
| POST | `/student-voice/create` | Buat aspirasi |
| GET | `/student-voice/:id` | Detail aspirasi |
| PUT | `/student-voice/:id/cancel` | Batalkan aspirasi |

Create aspirasi body:

```json
{
  "judul": "Fasilitas Kantin",
  "kategori": "Fasilitas",
  "deskripsi": "Mohon penambahan tempat duduk.",
  "prioritas": "Sedang"
}
```

### 5.9 Organisasi Mahasiswa

| Method | Path | Fungsi |
|---|---|---|
| GET | `/organisasi/` | List riwayat organisasi mahasiswa |
| POST | `/organisasi/` | Tambah riwayat organisasi |
| PUT | `/organisasi/:id` | Update riwayat organisasi |
| DELETE | `/organisasi/:id` | Hapus riwayat organisasi |

Body:

```json
{
  "nama_organisasi": "BEM",
  "jabatan": "Anggota",
  "periode": "2025/2026",
  "deskripsi_kegiatan": "Kepanitiaan kampus"
}
```

### 5.10 Notifikasi

| Method | Path | Fungsi |
|---|---|---|
| GET | `/notifikasi/` | List notifikasi |
| GET | `/notifikasi/unread-count` | Jumlah belum dibaca |
| PUT | `/notifikasi/:id/baca` | Tandai dibaca |
| PUT | `/notifikasi/baca-semua` | Tandai semua dibaca |

## 6. Mapping Flutter

Folder:

```text
Mobile/lib/features/mahasiswa
Mobile/lib/features/counseling
Mobile/lib/core/providers/student_provider.dart
```

| Screen/Provider | Endpoint |
|---|---|
| Dashboard | `GET /mahasiswa/summary`, `GET /mahasiswa/dashboard` |
| Profile | `GET /profil/`, `PUT /profil/data-diri` |
| Achievement | `GET /achievement/`, `POST /achievement/` |
| Scholarship | `GET /scholarship/`, `POST /scholarship/:id/daftar` |
| Health | `GET /student-health/riwayat`, `POST /student-health/record` |
| Voice | `GET /student-voice/`, `POST /student-voice/create` |
| Kencana | `GET /kencana/progress` |
| Counseling Psikolog Baru | `GET /counseling/psychologists` |
| Booking Psikolog Baru | `POST /counseling/psychologist-bookings` |
| Notifikasi | `GET /notifikasi/` |

## 7. Quick Test Postman

1. Login:

```http
POST http://localhost:8000/api/auth/login
```

2. Copy `data.access_token`.

3. Test summary:

```http
GET http://localhost:8000/api/mahasiswa/summary
Authorization: Bearer <token_mahasiswa>
```

4. Test list psikolog:

```http
GET http://localhost:8000/api/counseling/psychologists
Authorization: Bearer <token_mahasiswa>
```

## 8. Source of Truth

Backend route:

```text
backend/routes/mahasiswa.go
```

Backend controller:

```text
backend/controllers/mahasiswa/*
backend/controllers/mahasiswa/psychologist_counseling_handler.go
```

Backend model:

```text
backend/models/model.go
backend/models/counseling_jadwal.go
backend/models/psychologist.go
```

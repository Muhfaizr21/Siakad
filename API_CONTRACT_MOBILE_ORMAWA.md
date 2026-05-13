# API Contract Mobile - Role Ormawa

Dokumen ini adalah kontrak API untuk aplikasi mobile role `ormawa`.

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

## 2. Auth

### Login Ormawa

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
  "identifier": "ormawa@bku.ac.id",
  "password": "ormawa123"
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
      "id": 20,
      "email": "ormawa@bku.ac.id",
      "role": "ormawa",
      "nama": "BEM KBK",
      "ormawa_id": 1
    }
  }
}
```

Mobile wajib menyimpan:

```text
data.access_token
data.user.role
data.user.ormawa_id
```

Jika `ormawa_id` belum ada di response login, ambil lewat:

```http
GET /ormawa/profile
```

### Protected Header

Semua endpoint di bawah ini wajib memakai:

```http
Authorization: Bearer <access_token>
Accept: application/json
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
  "status": "error",
  "message": "Pesan error"
}
```

## 4. Endpoint Ormawa

Route source:

```text
backend/routes/ormawa.go
backend/controllers/ormawa/ormawa_controller.go
backend/controllers/ormawa/pkkmb.go
backend/controllers/ormawa/pkkmb_quiz.go
backend/models/model.go
backend/models/pkkmb_quiz.go
```

Role yang diterima middleware:

```text
ormawa, ormawa_admin, mahasiswa
```

Sebagian endpoint perlu query:

```text
?ormawaId=<id>
```

### 4.1 Catatan Login dan Role

Tidak ada endpoint `bootstrap` khusus mobile setelah endpoint disatukan. Mobile cukup membaca `data.user.role` dan `data.user.ormawa_id` dari response login, lalu mengambil data awal ormawa dari `/ormawa/profile` dan `/ormawa/stats?ormawaId=...`.

### 4.2 Profile dan Dashboard

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ormawa/profile` | Profil ormawa aktif |
| GET | `/ormawa/stats?ormawaId=1` | Statistik dashboard |

Stats response:

```json
{
  "status": "success",
  "data": {
    "totalProposals": 1,
    "totalMembers": 10,
    "totalEvents": 2,
    "totalAnnouncements": 3,
    "totalKas": 1500000
  }
}
```

### 4.3 Proposal

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ormawa/proposals?ormawaId=1` | List proposal |
| GET | `/ormawa/proposals/:id/history` | Riwayat status proposal |
| POST | `/ormawa/proposals` | Buat proposal |
| PUT | `/ormawa/proposals/:id` | Update proposal/status |
| DELETE | `/ormawa/proposals/:id` | Hapus proposal |

Create body:

```json
{
  "Judul": "Seminar Kesehatan",
  "Deskripsi": "Seminar kesehatan mahasiswa",
  "OrmawaID": 1,
  "MahasiswaID": 1,
  "FakultasID": 1,
  "Anggaran": 5000000,
  "TanggalKegiatan": "2026-06-01T09:00:00Z",
  "Lokasi": "Aula Kampus"
}
```

Update body:

```json
{
  "Judul": "Seminar Kesehatan Revisi",
  "Anggaran": 4500000,
  "Status": "diajukan",
  "Catatan": "Revisi anggaran"
}
```

### 4.4 Settings Ormawa

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ormawa/settings/:id` | Ambil settings ormawa |
| PUT | `/ormawa/settings/:id` | Update settings ormawa |

Body:

```json
{
  "Nama": "BEM KBK",
  "Singkatan": "BEMKBK",
  "Deskripsi": "Organisasi mahasiswa",
  "Kategori": "BEM",
  "Status": "Aktif"
}
```

### 4.5 Kas / Keuangan

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ormawa/kas?ormawaId=1` | List mutasi kas |
| POST | `/ormawa/kas` | Tambah mutasi |
| DELETE | `/ormawa/kas/:id` | Hapus mutasi |

Create body:

```json
{
  "ormawa_id": 1,
  "tipe": "pemasukan",
  "nominal": 1000000,
  "deskripsi": "Dana kegiatan",
  "tanggal": "2026-05-13T00:00:00Z"
}
```

### 4.6 Kegiatan / Agenda

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ormawa/events?ormawaId=1` | List kegiatan |
| POST | `/ormawa/events` | Buat kegiatan |
| PUT | `/ormawa/events/:id` | Update kegiatan |
| DELETE | `/ormawa/events/:id` | Hapus kegiatan |

Create body:

```json
{
  "ormawa_id": 1,
  "nama": "Rapat Kerja",
  "deskripsi": "Rapat program kerja",
  "tanggal": "2026-06-01T09:00:00Z",
  "lokasi": "Ruang Organisasi",
  "status": "Terjadwal"
}
```

### 4.7 Absensi

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ormawa/attendance/:eventId` | List absensi kegiatan |
| POST | `/ormawa/attendance` | Submit absensi |

Submit body:

```json
{
  "event_id": 1,
  "mahasiswa_id": 1,
  "status": "Hadir"
}
```

### 4.8 Pengumuman

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ormawa/announcements?ormawaId=1` | List pengumuman |
| POST | `/ormawa/announcements` | Buat pengumuman |
| PUT | `/ormawa/announcements/:id` | Update pengumuman |
| DELETE | `/ormawa/announcements/:id` | Hapus pengumuman |

Body:

```json
{
  "ormawa_id": 1,
  "judul": "Open Recruitment",
  "isi": "Pendaftaran pengurus dibuka.",
  "status": "Published"
}
```

### 4.9 Role dan Divisi

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ormawa/roles` | List role internal |
| POST | `/ormawa/roles` | Buat role internal |
| DELETE | `/ormawa/roles/:id` | Hapus role |
| GET | `/ormawa/divisions` | List divisi |
| POST | `/ormawa/divisions` | Buat divisi |
| DELETE | `/ormawa/divisions/:id` | Hapus divisi |

Create role body:

```json
{
  "ormawa_id": 1,
  "nama": "Ketua Divisi",
  "permissions": ["proposal.read", "event.write"]
}
```

Create division body:

```json
{
  "ormawa_id": 1,
  "nama": "Divisi Acara",
  "deskripsi": "Mengelola kegiatan"
}
```

### 4.10 Anggota

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ormawa/members?ormawaId=1` | List anggota |
| POST | `/ormawa/members` | Tambah anggota |
| PUT | `/ormawa/members/:id` | Update anggota |
| DELETE | `/ormawa/members/:id` | Hapus anggota |
| GET | `/ormawa/students` | Lookup mahasiswa |

Create member body:

```json
{
  "ormawa_id": 1,
  "mahasiswa_id": 1,
  "jabatan": "Anggota",
  "divisi": "Acara",
  "status": "Aktif"
}
```

### 4.11 Notifikasi Ormawa

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ormawa/notifications?ormawaId=1` | List notifikasi |
| PUT | `/ormawa/notifications/:id/read` | Tandai dibaca |
| PUT | `/ormawa/notifications/read-all?ormawaId=1` | Tandai semua dibaca |
| DELETE | `/ormawa/notifications/:id` | Hapus notifikasi |

### 4.12 LPJ

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ormawa/lpjs?ormawaId=1` | List LPJ |
| POST | `/ormawa/lpjs` | Buat LPJ |
| PUT | `/ormawa/lpjs/:id` | Update LPJ |
| POST | `/ormawa/lpjs/:id/documents` | Upload dokumen LPJ |
| DELETE | `/ormawa/lpjs/documents/:docId` | Hapus dokumen LPJ |

Create LPJ body:

```json
{
  "proposal_id": 1,
  "ormawa_id": 1,
  "judul": "LPJ Seminar Kesehatan",
  "ringkasan": "Kegiatan telah selesai",
  "total_realisasi": 4500000,
  "status": "draft"
}
```

Upload document:

```text
multipart/form-data
file: dokumen
tipe: laporan/pdf/foto
```

### 4.13 Aspirasi Ormawa

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ormawa/aspirations?ormawaId=1` | List aspirasi |
| POST | `/ormawa/aspirations` | Buat aspirasi ormawa |
| PUT | `/ormawa/aspirations/:id` | Tanggapi/update aspirasi |

Body:

```json
{
  "ormawa_id": 1,
  "judul": "Fasilitas sekretariat",
  "deskripsi": "Perlu perbaikan fasilitas.",
  "status": "ditanggapi",
  "tanggapan": "Akan ditindaklanjuti."
}
```

### 4.14 Upload Umum

| Method | Path | Fungsi |
|---|---|---|
| POST | `/ormawa/upload` | Upload file umum |

Upload:

```text
multipart/form-data
file: file
```

### 4.15 Kencana / PKKMB Ormawa

| Method | Path | Fungsi |
|---|---|---|
| GET | `/ormawa/kencana/ringkasan` | Ringkasan PKKMB |
| GET | `/ormawa/kencana/peserta` | List peserta |
| GET | `/ormawa/kencana/kegiatan` | List kegiatan PKKMB |
| POST | `/ormawa/kencana/kegiatan` | Buat kegiatan PKKMB |
| PUT | `/ormawa/kencana/kegiatan/:id` | Update kegiatan |
| DELETE | `/ormawa/kencana/kegiatan/:id` | Hapus kegiatan |
| GET | `/ormawa/kencana/kuis` | List kuis |
| POST | `/ormawa/kencana/kuis` | Buat kuis |
| PUT | `/ormawa/kencana/kuis/:id` | Update kuis |
| DELETE | `/ormawa/kencana/kuis/:id` | Hapus kuis |
| GET | `/ormawa/kencana/kuis-hasil` | Hasil kuis |

Create kegiatan body:

```json
{
  "judul": "Pengenalan Kampus",
  "deskripsi": "Materi pengenalan kampus",
  "tanggal": "2026-06-01T08:00:00Z",
  "lokasi": "Aula",
  "tipe": "offline"
}
```

Create kuis body:

```json
{
  "judul": "Quiz Pengenalan Kampus",
  "deskripsi": "Evaluasi materi",
  "durasi_menit": 30,
  "questions": [
    {
      "question": "Apa nama kampus?",
      "options": [
        {"label": "A", "text": "BKU", "is_correct": true},
        {"label": "B", "text": "Lainnya", "is_correct": false}
      ]
    }
  ]
}
```

## 5. Korelasi dengan Mahasiswa

Fitur ormawa terhubung dengan mahasiswa lewat:

```text
ormawa.id -> anggota_ormawa.ormawa_id
mahasiswa.profiles.id -> anggota_ormawa.mahasiswa_id
ormawa.id -> proposals.ormawa_id
mahasiswa.profiles.id -> proposals.mahasiswa_id
```

Alur utama:

1. Ormawa login dan mengambil `ormawa_id`.
2. Ormawa membuka dashboard dengan `/ormawa/profile` dan `/ormawa/stats?ormawaId=...`.
3. Ormawa mengelola proposal, anggota, kegiatan, absensi, pengumuman, kas, LPJ, aspirasi, dan PKKMB.
4. Mahasiswa dapat terkait dengan ormawa sebagai anggota, peserta kegiatan, pembuat aspirasi, atau pemilik proposal.

## 6. Mapping Flutter

Folder:

```text
Mobile/lib/features/ormawa
Mobile/lib/core/providers/ormawa_provider.dart
Mobile/lib/features/ormawa/data/repositories/ormawa_repository_impl.dart
```

| Screen | Endpoint |
|---|---|
| Dashboard | `GET /ormawa/profile`, `GET /ormawa/stats?ormawaId=...` |
| Proposal | `GET /ormawa/proposals`, `POST /ormawa/proposals` |
| Anggota | `GET /ormawa/members`, `POST /ormawa/members` |
| Agenda | `GET /ormawa/events`, `POST /ormawa/events` |
| Absensi | `GET /ormawa/attendance/:eventId`, `POST /ormawa/attendance` |
| Kas | `GET /ormawa/kas`, `POST /ormawa/kas` |
| LPJ | `GET /ormawa/lpjs`, `POST /ormawa/lpjs` |
| Pengumuman | `GET /ormawa/announcements`, `POST /ormawa/announcements` |
| Aspirasi | `GET /ormawa/aspirations`, `PUT /ormawa/aspirations/:id` |
| PKKMB | `GET /ormawa/kencana/*` |
| Notifikasi | `GET /ormawa/notifications` |
| Settings | `GET /ormawa/settings/:id`, `PUT /ormawa/settings/:id` |

## 7. Quick Test Postman

1. Login:

```http
POST http://localhost:8000/api/auth/login
```

Body:

```json
{
  "identifier": "ormawa@bku.ac.id",
  "password": "ormawa123"
}
```

2. Copy `data.access_token`.

3. Test profile:

```http
GET http://localhost:8000/api/ormawa/profile
Authorization: Bearer <token_ormawa>
```

4. Test stats:

```http
GET http://localhost:8000/api/ormawa/stats?ormawaId=1
Authorization: Bearer <token_ormawa>
```

5. Test proposals:

```http
GET http://localhost:8000/api/ormawa/proposals?ormawaId=1
Authorization: Bearer <token_ormawa>
```

## 8. Source of Truth

Backend route:

```text
backend/routes/ormawa.go
```

Backend controller:

```text
backend/controllers/ormawa/ormawa_controller.go
backend/controllers/ormawa/pkkmb.go
backend/controllers/ormawa/pkkmb_quiz.go
backend/controllers/mahasiswa/psychologist_counseling_handler.go
```

Backend model:

```text
backend/models/model.go
backend/models/pkkmb_quiz.go
```

Migration:

```text
backend/config/db_migrations.go
backend/database/migrations/*
```

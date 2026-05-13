# API Contract Mobile - Role Psikolog

Dokumen ini adalah kontrak API untuk aplikasi mobile role `psikolog`.

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

### Login Psikolog

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
  "identifier": "psikolog@bku.ac.id",
  "password": "psikolog123"
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
      "id": 12,
      "email": "psikolog@bku.ac.id",
      "role": "psikolog",
      "nama": "Psikolog BKU"
    }
  }
}
```

Mobile wajib menyimpan:

```text
data.access_token
data.user.role
data.user.id
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

## 4. Endpoint Psikolog

Route source:

```text
backend/routes/psychologist.go
backend/controllers/psychologist/psychologist_handler.go
backend/models/psychologist.go
```

Semua endpoint butuh role:

```text
psikolog
```

### 4.1 Catatan Login dan Role

Tidak ada endpoint `bootstrap` khusus mobile setelah endpoint disatukan. Mobile cukup membaca `data.user.role` dari response login, lalu mengambil data awal psikolog dari `/psychologist/me` dan `/psychologist/dashboard`.

### 4.2 Profil dan Akun

| Method | Path | Fungsi |
|---|---|---|
| GET | `/psychologist/me` | Profil psikolog login |
| PUT | `/psychologist/profile` | Update profil |
| PUT | `/psychologist/change-password` | Ganti password |

Update profile body:

```json
{
  "nama": "Psikolog BKU",
  "email": "psikolog@bku.ac.id",
  "no_hp": "+62 812 3456 7890",
  "spesialisasi": "Psikolog Klinis Pendidikan",
  "bio": "Berpengalaman menangani stres akademik.",
  "lokasi": "Ruang Konseling Student Hub",
  "bahasa": "Indonesia, Inggris",
  "tarif": 150000
}
```

Change password body:

```json
{
  "old_password": "psikolog123",
  "new_password": "passwordbaru123",
  "confirm_password": "passwordbaru123"
}
```

### 4.3 Dashboard

```http
GET /psychologist/dashboard
```

Response berisi:

```text
profile, stats, waiting_count, confirmed_count, reports_count,
assessments_count, bookings, current_session, recent_activities
```

Contoh response ringkas:

```json
{
  "success": true,
  "data": {
    "profile": {
      "id": 1,
      "name": "Psikolog BKU",
      "specialization": "Psikolog Klinis Pendidikan"
    },
    "stats": {
      "bookings": 4,
      "patients": 2,
      "reports": 1,
      "assessments": 4
    },
    "bookings": []
  }
}
```

### 4.4 Booking Psikolog

| Method | Path | Fungsi |
|---|---|---|
| GET | `/psychologist/bookings` | List booking masuk |
| GET | `/psychologist/bookings/:id` | Detail booking |
| PUT | `/psychologist/bookings/:id/status` | Update status booking |

Update status body:

```json
{
  "status": "Dikonfirmasi",
  "note": "Silakan hadir 10 menit lebih awal."
}
```

Status yang dipakai:

```text
Menunggu, Dikonfirmasi, Selesai, Ditolak, Dibatalkan
```

Source table:

```text
psikolog.bookings
```

### 4.5 Jadwal Praktik

| Method | Path | Fungsi |
|---|---|---|
| GET | `/psychologist/schedules` | Ambil jadwal praktik |
| PUT | `/psychologist/schedules` | Simpan semua jadwal |

Save body:

```json
[
  {
    "day": "Senin",
    "enabled": true,
    "slots": [
      {
        "start": "09:00",
        "end": "12:00",
        "lokasi": "Ruang Konseling A",
        "quota": 3,
        "enabled": true
      }
    ]
  }
]
```

Source table:

```text
psikolog.schedule_slots
```

Catatan validasi:

- Slot tidak boleh bertabrakan pada hari yang sama.
- `start` harus lebih kecil daripada `end`.
- Slot yang `enabled: false` tidak ditampilkan ke mahasiswa.

### 4.6 Pasien dan Rekam Medis

| Method | Path | Fungsi |
|---|---|---|
| GET | `/psychologist/patients` | List mahasiswa yang pernah booking |
| GET | `/psychologist/patients/:id/medical-record` | Rekam medis mahasiswa |
| POST | `/psychologist/patients/:id/session-notes` | Buat catatan sesi |

Create session note body:

```json
{
  "complaint": "Stres akademik",
  "observation": "Mahasiswa tampak cemas namun kooperatif.",
  "recommendation": "Latihan pernapasan dan journaling.",
  "mood": "Cemas",
  "type": "Konseling Individu",
  "status": "Pemulihan"
}
```

Source table:

```text
psikolog.session_notes
```

### 4.7 Assessment

| Method | Path | Fungsi |
|---|---|---|
| GET | `/psychologist/assessments` | List assessment |
| POST | `/psychologist/assessments` | Buat assessment |

Create body:

```json
{
  "nama": "DASS-21",
  "kategori": "Kesehatan Mental",
  "deskripsi": "Screening depresi, kecemasan, dan stres"
}
```

Source table:

```text
psikolog.assessments
```

### 4.8 Analytics

```http
GET /psychologist/analytics
```

Catatan:

```text
Tidak ada tabel analytics.
Data dihitung dari psikolog.bookings, psikolog.session_notes, psikolog.assessments.
```

Response berisi:

```text
stats, monthly, top_issues, stable_percentage, recommendations, activities
```

Contoh response ringkas:

```json
{
  "success": true,
  "data": {
    "stats": {
      "total_sessions": 12,
      "active_patients": 4,
      "avg_score": 78
    },
    "monthly": [],
    "top_issues": [],
    "recommendations": []
  }
}
```

### 4.9 Reports

| Method | Path | Fungsi |
|---|---|---|
| GET | `/psychologist/reports` | List laporan |
| POST | `/psychologist/reports` | Generate laporan sederhana |

Source table:

```text
psikolog.reports
```

Create report body:

```json
{
  "title": "Laporan Bulanan Konseling",
  "period": "Mei 2026",
  "summary": "Ringkasan aktivitas konseling bulan ini."
}
```

### 4.10 Notifications

| Method | Path | Fungsi |
|---|---|---|
| GET | `/psychologist/notifications` | List notifikasi |
| PUT | `/psychologist/notifications/:id/read` | Tandai satu dibaca |
| PUT | `/psychologist/notifications/read-all` | Tandai semua dibaca |
| DELETE | `/psychologist/notifications/:id` | Hapus notifikasi |

Source table:

```text
psikolog.notifications
```

Response list:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Booking Baru",
      "message": "Mahasiswa Farmasi mengajukan booking konseling.",
      "type": "booking",
      "is_read": false,
      "created_at": "2026-05-13T09:00:00Z"
    }
  ]
}
```

## 5. Korelasi dengan Mahasiswa

Fitur psikolog terhubung dengan mahasiswa lewat:

```text
mahasiswa.profiles.id -> psikolog.bookings.student_id
psikolog.profiles.id -> psikolog.bookings.psikolog_id
psikolog.bookings.student_id -> psikolog.session_notes.student_id
```

Alur utama:

1. Mahasiswa melihat psikolog melalui `/counseling/psychologists`.
2. Mahasiswa melihat jadwal melalui `/counseling/psychologists/:id/schedules`.
3. Mahasiswa membuat booking melalui `/counseling/psychologist-bookings`.
4. Data masuk ke `psikolog.bookings`.
5. Psikolog melihat booking di `/psychologist/bookings`.
6. Psikolog mengubah status booking dan/atau membuat catatan sesi.

## 6. Mapping Flutter

Folder:

```text
Mobile/lib/features/counseling/presentation/pages/psychologist_*
Mobile/lib/features/counseling/presentation/providers/psychologist_dashboard_provider.dart
```

| Screen | Endpoint |
|---|---|
| Dashboard | `GET /psychologist/dashboard` |
| Bookings | `GET /psychologist/bookings`, `PUT /psychologist/bookings/:id/status` |
| Schedule | `GET /psychologist/schedules`, `PUT /psychologist/schedules` |
| Patients | `GET /psychologist/patients` |
| Medical Record | `GET /psychologist/patients/:id/medical-record` |
| Session Note | `POST /psychologist/patients/:id/session-notes` |
| Assessment | `GET /psychologist/assessments`, `POST /psychologist/assessments` |
| Analytics | `GET /psychologist/analytics` |
| Reports | `GET /psychologist/reports`, `POST /psychologist/reports` |
| Notifications | `GET /psychologist/notifications` |
| Settings | `GET /psychologist/me`, `PUT /psychologist/profile` |

## 7. Quick Test Postman

1. Login:

```http
POST http://localhost:8000/api/auth/login
```

Body:

```json
{
  "identifier": "psikolog@bku.ac.id",
  "password": "psikolog123"
}
```

2. Copy `data.access_token`.

3. Test dashboard:

```http
GET http://localhost:8000/api/psychologist/dashboard
Authorization: Bearer <token_psikolog>
```

4. Test bookings:

```http
GET http://localhost:8000/api/psychologist/bookings
Authorization: Bearer <token_psikolog>
```

5. Test schedules:

```http
GET http://localhost:8000/api/psychologist/schedules
Authorization: Bearer <token_psikolog>
```

## 8. Source of Truth

Backend route:

```text
backend/routes/psychologist.go
```

Backend controller:

```text
backend/controllers/psychologist/psychologist_handler.go
backend/controllers/mahasiswa/psychologist_counseling_handler.go
```

Backend model:

```text
backend/models/psychologist.go
backend/models/model.go
```

Migration:

```text
backend/config/db_migrations.go
```

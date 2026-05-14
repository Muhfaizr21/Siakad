# Audit API Mobile Semua Role - Student Hub BKU

Tanggal audit: 14 Mei 2026

Tujuan audit:

- Memastikan endpoint untuk role `mahasiswa`, `psikolog`, dan `ormawa` benar-benar terdaftar di backend.
- Mencocokkan endpoint backend dengan kebutuhan mobile Flutter.
- Menandai endpoint yang sebelumnya missing atau tidak cocok payload/response-nya.

## 1. Kesimpulan Singkat

API backend untuk tiga role sudah tersedia, tetapi sebelum audit ini ada beberapa masalah:

- Endpoint ormawa yang dipanggil mobile belum semuanya terdaftar:
  - `PUT /api/ormawa/roles/:id`
  - `GET /api/ormawa/kencana/banding`
  - `POST /api/ormawa/kencana/banding/:id/review`
- Endpoint mahasiswa ada, tetapi beberapa body mobile dikirim JSON sementara controller lama hanya membaca `form-data`:
  - `POST /api/achievement/`
  - `POST /api/student-voice/create`
- Beberapa response mahasiswa berbentuk object dengan `list`, bukan langsung array. Ini bukan route missing, tetapi perlu diperhatikan oleh mobile parser.
- Role psikolog di backend sudah punya endpoint lengkap, tetapi Flutter mobile psikolog saat audit masih banyak UI/mock dan belum memanggil backend secara nyata.

Perbaikan yang sudah dilakukan:

- Menambahkan route missing ormawa.
- Menambahkan handler banding PKKMB ormawa.
- Membuat create prestasi dan create aspirasi mahasiswa menerima JSON dan `form-data`.
- Menyatukan endpoint mobile dan web, sehingga tidak ada namespace `/api/mobile`.

## 2. Auth

Endpoint:

```http
POST /api/auth/login
```

Status:

```text
ADA
```

Catatan:

- Mobile wajib mengambil `data.access_token`.
- Semua endpoint protected wajib mengirim:

```http
Authorization: Bearer <token>
Accept: application/json
```

Catatan penting untuk Android emulator:

```text
http://localhost:8000/api
```

tidak mengarah ke laptop, tetapi ke emulator sendiri.

Gunakan:

```text
http://10.0.2.2:8000/api
```

atau jalankan Flutter dengan:

```bash
flutter run --dart-define=BASE_URL=http://10.0.2.2:8000/api
```

## 3. Role Mahasiswa

Route source:

```text
backend/routes/mahasiswa.go
backend/controllers/mahasiswa/*
backend/controllers/mahasiswa/psychologist_counseling_handler.go
```

### 3.1 Endpoint Utama

| Method | Endpoint | Status | Catatan |
|---|---|---|---|
| GET | `/api/mahasiswa/dashboard` | ADA | Dashboard lengkap web |
| GET | `/api/mahasiswa/summary` | ADA | Ringkasan mobile/web |
| GET | `/api/mahasiswa/kegiatan` | ADA | Agenda mahasiswa |
| GET | `/api/profil/` | ADA | Profil mahasiswa |
| PUT | `/api/profil/data-diri` | ADA | Update profil |
| PUT | `/api/profil/change-password` | ADA | Ganti password |
| POST | `/api/profil/foto` | ADA | Upload foto |
| GET | `/api/notifikasi/` | ADA | List notifikasi |
| GET | `/api/notifikasi/unread-count` | ADA | Count notifikasi |
| PUT | `/api/notifikasi/:id/baca` | ADA | Tandai dibaca |
| PUT | `/api/notifikasi/baca-semua` | ADA | Tandai semua dibaca |

### 3.2 Kencana / PKKMB Mahasiswa

| Method | Endpoint | Status |
|---|---|---|
| GET | `/api/kencana/progress` | ADA |
| POST | `/api/kencana/check-in/:id` | ADA |
| GET | `/api/kencana/sertifikat` | ADA |
| POST | `/api/kencana/sertifikat/generate` | ADA |
| GET | `/api/kencana/banding` | ADA |
| POST | `/api/kencana/banding` | ADA |
| GET | `/api/kencana/kuis/:id/soal` | ADA |
| POST | `/api/kencana/kuis/:id/submit` | ADA |

### 3.3 Prestasi

| Method | Endpoint | Status | Catatan |
|---|---|---|---|
| GET | `/api/achievement/` | ADA | Response `data` berbentuk object: `{ stats, list }` |
| POST | `/api/achievement/` | ADA | Sekarang menerima JSON dan multipart |
| GET | `/api/achievement/:id` | ADA | Detail |
| DELETE | `/api/achievement/:id` | ADA | Hanya status Menunggu |

Catatan mobile:

Jika memakai Flutter repository lama, parser harus membaca:

```text
response.data["data"]["list"]
```

bukan:

```text
response.data["data"]
```

### 3.4 Beasiswa

| Method | Endpoint | Status |
|---|---|---|
| GET | `/api/scholarship/` | ADA |
| GET | `/api/scholarship/riwayat` | ADA |
| GET | `/api/scholarship/:id` | ADA |
| POST | `/api/scholarship/:id/daftar` | ADA |
| GET | `/api/scholarship/pengajuan/:id` | ADA |

### 3.5 Konseling Mahasiswa

Endpoint lama:

| Method | Endpoint | Status |
|---|---|---|
| GET | `/api/counseling/status` | ADA |
| GET | `/api/counseling/jadwal` | ADA |
| POST | `/api/counseling/booking` | ADA |
| POST | `/api/counseling/request` | ADA |
| GET | `/api/counseling/riwayat` | ADA |
| DELETE | `/api/counseling/riwayat/:id` | ADA |

Endpoint mahasiswa ke psikolog:

| Method | Endpoint | Status |
|---|---|---|
| GET | `/api/counseling/psychologists` | ADA |
| GET | `/api/counseling/psychologists/:id/schedules` | ADA |
| GET | `/api/counseling/psychologist-bookings` | ADA |
| POST | `/api/counseling/psychologist-bookings` | ADA |
| DELETE | `/api/counseling/psychologist-bookings/:id` | ADA |

Catatan:

- Endpoint ini masuk ke schema `psikolog`, bukan konseling lama.
- Booking mahasiswa akan masuk ke `psikolog.bookings`.
- Psikolog dapat melihatnya di `/api/psychologist/bookings`.

### 3.6 Health

| Method | Endpoint | Status |
|---|---|---|
| GET | `/api/student-health/riwayat` | ADA |
| GET | `/api/student-health/riwayat/:id` | ADA |
| GET | `/api/student-health/ringkasan` | ADA |
| GET | `/api/student-health/tips` | ADA |
| POST | `/api/student-health/record` | ADA |
| POST | `/api/student-health/mandiri` | ADA |

### 3.7 Student Voice

| Method | Endpoint | Status | Catatan |
|---|---|---|---|
| GET | `/api/student-voice/stats` | ADA | Statistik |
| GET | `/api/student-voice/` | ADA | Response `data` berbentuk object: `{ total, page, last_page, list }` |
| POST | `/api/student-voice/create` | ADA | Sekarang menerima JSON dan form-data |
| GET | `/api/student-voice/:id` | ADA | Detail |
| PUT | `/api/student-voice/:id/cancel` | ADA | Batalkan |

Catatan mobile:

Jika memakai Flutter repository lama, parser harus membaca:

```text
response.data["data"]["list"]
```

## 4. Role Psikolog

Route source:

```text
backend/routes/psychologist.go
backend/controllers/psychologist/psychologist_handler.go
```

Semua endpoint berikut tersedia:

| Method | Endpoint | Status |
|---|---|---|
| GET | `/api/psychologist/me` | ADA |
| PUT | `/api/psychologist/profile` | ADA |
| PUT | `/api/psychologist/change-password` | ADA |
| GET | `/api/psychologist/dashboard` | ADA |
| GET | `/api/psychologist/bookings` | ADA |
| GET | `/api/psychologist/bookings/:id` | ADA |
| PUT | `/api/psychologist/bookings/:id/status` | ADA |
| GET | `/api/psychologist/schedules` | ADA |
| PUT | `/api/psychologist/schedules` | ADA |
| GET | `/api/psychologist/patients` | ADA |
| GET | `/api/psychologist/patients/:id/medical-record` | ADA |
| POST | `/api/psychologist/patients/:id/session-notes` | ADA |
| GET | `/api/psychologist/assessments` | ADA |
| POST | `/api/psychologist/assessments` | ADA |
| GET | `/api/psychologist/analytics` | ADA |
| GET | `/api/psychologist/reports` | ADA |
| POST | `/api/psychologist/reports` | ADA |
| GET | `/api/psychologist/notifications` | ADA |
| PUT | `/api/psychologist/notifications/read-all` | ADA |
| PUT | `/api/psychologist/notifications/:id/read` | ADA |
| DELETE | `/api/psychologist/notifications/:id` | ADA |

Catatan mobile:

- Backend psikolog sudah siap.
- Flutter role psikolog saat audit masih banyak mock/UI-only, terutama provider dashboard.
- Jadi jika role psikolog mobile belum tersambung, masalahnya bukan route backend missing, tetapi integrasi repository/service Flutter belum dibuat.

## 5. Role Ormawa

Route source:

```text
backend/routes/ormawa.go
backend/controllers/ormawa/*
```

Semua endpoint berikut tersedia:

| Method | Endpoint | Status |
|---|---|---|
| GET | `/api/ormawa/profile` | ADA |
| GET | `/api/ormawa/stats?ormawaId=1` | ADA |
| GET | `/api/ormawa/proposals?ormawaId=1` | ADA |
| GET | `/api/ormawa/proposals/:id/history` | ADA |
| POST | `/api/ormawa/proposals` | ADA |
| PUT | `/api/ormawa/proposals/:id` | ADA |
| DELETE | `/api/ormawa/proposals/:id` | ADA |
| GET | `/api/ormawa/settings/:id` | ADA |
| PUT | `/api/ormawa/settings/:id` | ADA |
| GET | `/api/ormawa/kas?ormawaId=1` | ADA |
| POST | `/api/ormawa/kas` | ADA |
| DELETE | `/api/ormawa/kas/:id` | ADA |
| GET | `/api/ormawa/events?ormawaId=1` | ADA |
| POST | `/api/ormawa/events` | ADA |
| PUT | `/api/ormawa/events/:id` | ADA |
| DELETE | `/api/ormawa/events/:id` | ADA |
| GET | `/api/ormawa/attendance/:eventId` | ADA |
| POST | `/api/ormawa/attendance` | ADA |
| GET | `/api/ormawa/announcements?ormawaId=1` | ADA |
| POST | `/api/ormawa/announcements` | ADA |
| PUT | `/api/ormawa/announcements/:id` | ADA |
| DELETE | `/api/ormawa/announcements/:id` | ADA |
| GET | `/api/ormawa/roles` | ADA |
| POST | `/api/ormawa/roles` | ADA |
| PUT | `/api/ormawa/roles/:id` | ADA - baru ditambahkan |
| DELETE | `/api/ormawa/roles/:id` | ADA |
| GET | `/api/ormawa/divisions` | ADA |
| POST | `/api/ormawa/divisions` | ADA |
| DELETE | `/api/ormawa/divisions/:id` | ADA |
| GET | `/api/ormawa/members?ormawaId=1` | ADA |
| POST | `/api/ormawa/members` | ADA |
| PUT | `/api/ormawa/members/:id` | ADA |
| DELETE | `/api/ormawa/members/:id` | ADA |
| GET | `/api/ormawa/students` | ADA |
| GET | `/api/ormawa/notifications?ormawaId=1` | ADA |
| PUT | `/api/ormawa/notifications/:id/read` | ADA |
| PUT | `/api/ormawa/notifications/read-all?ormawaId=1` | ADA |
| DELETE | `/api/ormawa/notifications/:id` | ADA |
| GET | `/api/ormawa/lpjs?ormawaId=1` | ADA |
| POST | `/api/ormawa/lpjs` | ADA |
| PUT | `/api/ormawa/lpjs/:id` | ADA |
| POST | `/api/ormawa/lpjs/:id/documents` | ADA |
| DELETE | `/api/ormawa/lpjs/documents/:docId` | ADA |
| GET | `/api/ormawa/aspirations?ormawaId=1` | ADA |
| POST | `/api/ormawa/aspirations` | ADA |
| PUT | `/api/ormawa/aspirations/:id` | ADA |
| POST | `/api/ormawa/upload` | ADA |

### 5.1 PKKMB Ormawa

| Method | Endpoint | Status |
|---|---|---|
| GET | `/api/ormawa/kencana/ringkasan` | ADA |
| GET | `/api/ormawa/kencana/peserta` | ADA |
| GET | `/api/ormawa/kencana/banding` | ADA - baru ditambahkan |
| POST | `/api/ormawa/kencana/banding/:id/review` | ADA - baru ditambahkan |
| GET | `/api/ormawa/kencana/kegiatan` | ADA |
| POST | `/api/ormawa/kencana/kegiatan` | ADA |
| PUT | `/api/ormawa/kencana/kegiatan/:id` | ADA |
| DELETE | `/api/ormawa/kencana/kegiatan/:id` | ADA |
| GET | `/api/ormawa/kencana/kuis` | ADA |
| POST | `/api/ormawa/kencana/kuis` | ADA |
| PUT | `/api/ormawa/kencana/kuis/:id` | ADA |
| DELETE | `/api/ormawa/kencana/kuis/:id` | ADA |
| GET | `/api/ormawa/kencana/kuis-hasil` | ADA |

## 6. Temuan Penting untuk Mahasiswa

Jika teman mobile bilang "mahasiswa ada API missing", cek empat hal ini:

1. Base URL Android emulator harus `10.0.2.2`, bukan `localhost`.
2. Token harus dikirim sebagai `Authorization: Bearer <token>`.
3. Endpoint `/api/mobile/...` sudah tidak dipakai. Gunakan endpoint web yang sama.
4. Parser mobile untuk beberapa response harus membaca `data.list`, bukan langsung `data`.

Temuan tambahan dari kode Flutter:

- `Mobile/lib/core/providers/student_provider.dart` masih memakai daftar psikolog hardcoded `P1` dan `P2`.
- `bookCounseling()` di provider mobile saat ini hanya memasukkan data ke state lokal, belum memanggil `POST /api/counseling/psychologist-bookings`.
- Jadi fitur mahasiswa untuk daftar psikolog dan booking psikolog di mobile belum benar-benar tersambung ke backend, walaupun API backend-nya sudah ada.
- Endpoint backend yang harus dipakai Flutter untuk fitur tersebut:

```text
GET  /api/counseling/psychologists
GET  /api/counseling/psychologists/:id/schedules
POST /api/counseling/psychologist-bookings
GET  /api/counseling/psychologist-bookings
```

Endpoint mahasiswa yang sering salah dipanggil:

```text
SALAH: GET /api/mobile/student/summary
BENAR: GET /api/mahasiswa/summary

SALAH: GET /api/mobile/student/counseling/psychologists
BENAR: GET /api/counseling/psychologists

SALAH: POST /api/mobile/student/counseling/psychologist-bookings
BENAR: POST /api/counseling/psychologist-bookings
```

## 7. Verifikasi Backend

Sudah dijalankan:

```bash
go test ./...
go vet ./...
```

Hasil:

```text
PASS
```

Catatan:

`golangci-lint` belum bisa dijalankan karena command tidak tersedia di environment lokal.

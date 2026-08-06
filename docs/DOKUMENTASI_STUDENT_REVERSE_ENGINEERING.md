# Dokumentasi Reverse Engineering SIAKAD (Fokus Student/Mahasiswa)

Dokumen ini disusun dari pembacaan langsung codebase backend + frontend pada repository `Siakad`, dengan fokus utama pada domain **Student/Mahasiswa** untuk mempermudah pengembangan lanjutan.

---

## 1. Ringkasan Eksekutif

- Arsitektur project sudah berbentuk **decoupled full-stack**: backend Go (Fiber + GORM + PostgreSQL) dan frontend React (Vite + Tailwind + React Query + Zustand).
- Implementasi paling matang saat ini ada pada area student: dashboard, KRS, KENCANA, scholarship, achievement, counseling, health screening, student voice, organisasi, profil, notifikasi.
- Secara UX/UI, student module sudah kaya dan siap dipakai; secara backend business logic sudah cukup luas, namun masih ada beberapa **ketidakkonsistenan teknis** yang perlu distabilkan sebelum scaling.
- Untuk fokus pengembangan Anda pada student, fondasi terbaik adalah: stabilisasi auth/API contract, konsistensi status enum, dan perapihan query/guard.

---

## 2. Scope Analisis

### In-scope
- Tech stack dan dependency yang relevan ke student.
- Arsitektur route frontend student.
- API backend student (`/api/v1/*`) dan model database terkait.
- Alur data login -> dashboard -> modul student.
- Temuan reverse engineering (bug/risiko/tech debt) khusus area student.

### Out-of-scope
- Implementasi detail role non-student (super admin/faculty/ormawa) selain yang berdampak langsung ke student.

---

## 3. Stack Teknologi (As-Is)

## 3.1 Backend
- Language: Go `1.26.1` (`backend/go.mod`)
- Framework HTTP: Fiber v2 (`github.com/gofiber/fiber/v2`)
- ORM: GORM (`gorm.io/gorm`) + PostgreSQL driver (`gorm.io/driver/postgres`)
- Auth: JWT (`github.com/golang-jwt/jwt/v5`), bcrypt (`golang.org/x/crypto/bcrypt`)
- File/image: imaging (`github.com/disintegration/imaging`)
- Env loader: godotenv (`github.com/joho/godotenv`)

## 3.2 Frontend
- Framework UI: React `19.2.4`
- Bundler/dev server: Vite `8.0.1`
- Styling: Tailwind CSS `4.2.2`
- Server state: TanStack React Query `5.96.2`
- Client state: Zustand `5.0.12` + persist middleware
- HTTP client: Axios `1.14.0`
- Form: React Hook Form + Zod
- Animasi: Framer Motion
- UI primitives: Radix UI
- Chart/date utilities: Recharts + date-fns

---

## 4. Struktur Arsitektur Student

## 4.1 Frontend Routing Student
Route student berada di `frontend/src/App.jsx` dengan parent `/student` dan layout `AppLayout`:

- `/student/dashboard`
- `/student/kencana`
- `/student/kencana/kuis/:kuisId`
- `/student/achievement`
- `/student/scholarship`
- `/student/scholarship/pengajuan/:id`
- `/student/counseling`
- `/student/health`
- `/student/voice`
- `/student/voice/tiket/:id`
- `/student/organisasi`
- `/student/krs`
- `/student/profile`
- `/student/notifikasi`

## 4.2 Backend API Namespace Student
Semua endpoint student utama dipusatkan di `backend/main.go` pada prefix `/api/v1` dan mayoritas diproteksi `middleware.AuthProtected`.

Domain endpoint student:
- Auth: `/auth/login`, `/auth/refresh`, `/auth/logout`
- Dashboard: `/mahasiswa/dashboard`, `/mahasiswa/kegiatan`
- KRS: `/krs/*`
- KENCANA: `/kencana/*`
- Achievement: `/achievement/*`
- Scholarship: `/scholarship/*`
- Counseling: `/counseling/*`
- Health: `/health/*`
- Student Voice: `/student-voice/*`
- Organisasi: `/organisasi/*`
- Profil: `/profil/*`
- Notifikasi: `/notifikasi/*`

---

## 5. Dependency Mapping Khusus Student

## 5.1 Frontend dependency -> peran di student
- `@tanstack/react-query`: query/mutation semua halaman student (`src/queries/*.js`)
- `zustand`: simpan `accessToken` + profil ringkas mahasiswa (`src/store/useAuthStore.js`)
- `axios`: HTTP client + interceptor refresh token (`src/lib/axios.js`)
- `react-hook-form` + `zod`: validasi login dan beberapa form student
- `framer-motion`: transisi/dashboard dan halaman student yang interaktif
- `recharts`: visualisasi di dashboard/health (jika dibutuhkan komponen)
- `react-hot-toast`: feedback mutation
- `lucide-react`: icon system across student pages

## 5.2 Backend dependency -> peran di student
- `fiber`: routing API student
- `gorm`: query relasi student (`Student`, `Major`, `KRS`, `Kencana`, dll)
- `jwt/v5`: token access/refresh
- `bcrypt`: cek & ubah password
- `imaging`: resize avatar profil student
- `uuid`: nama file upload/ID utilitas

---

## 6. Peta Modul Student (Frontend + API + Data)

## 6.1 Auth Student
Frontend:
- Login form: `frontend/src/pages/Auth/Login.jsx`
- Auth store: `frontend/src/store/useAuthStore.js`
- Axios interceptor: `frontend/src/lib/axios.js`

Backend:
- `POST /api/v1/auth/login` (login via NIM + password)
- `POST /api/v1/auth/refresh` (refresh access token via cookie)
- `POST /api/v1/auth/logout`

Output login memuat `access_token` + objek `mahasiswa` (id, nim, nama, prodi, foto, status, angkatan).

## 6.2 Dashboard Student
Frontend:
- Page: `frontend/src/pages/Student/BkuDashboard.jsx`
- Query: `frontend/src/queries/useDashboardQuery.js`

Backend:
- `GET /api/v1/mahasiswa/dashboard`
- `GET /api/v1/mahasiswa/kegiatan`

Data agregat:
- biodata mahasiswa ringkas
- banner pinned
- statistik KENCANA, beasiswa, student voice
- deadlines, aktivitas terbaru, kegiatan bulan ini, pengumuman

## 6.3 KRS
Frontend:
- Page: `frontend/src/pages/Student/KRS/index.jsx`
- Query: `frontend/src/queries/useKRSQuery.js`

Backend:
- `GET /api/v1/krs/periode`
- `GET /api/v1/krs/matakuliah`
- `GET /api/v1/krs/saya`
- `POST /api/v1/krs/tambah`
- `DELETE /api/v1/krs/:id`
- `POST /api/v1/krs/submit`
- `GET /api/v1/krs/cetak`

Rule validasi utama (server side):
- periode aktif & KRSOpen
- kuota kelas
- batas SKS (sementara fixed 24)
- bentrok jadwal
- prasyarat MK

## 6.4 KENCANA
Frontend:
- Pages: `KencanaPage.jsx`, `KencanaKuisPage.jsx`
- Query: `frontend/src/queries/useKencanaQuery.js`

Backend:
- `GET /api/v1/kencana/progress`
- `GET /api/v1/kencana/kuis/:kuisId/soal`
- `POST /api/v1/kencana/kuis/:kuisId/submit`
- `GET /api/v1/kencana/sertifikat`
- `POST /api/v1/kencana/sertifikat/generate`
- `GET /api/v1/kencana/banding`
- `POST /api/v1/kencana/banding`

Logic penting:
- auto-grading kuis
- nilai kumulatif berbobot
- eligibility sertifikat (`>=75`)
- banding maksimal 72 jam sejak kuis

## 6.5 Achievement
Frontend:
- Page: `frontend/src/pages/Student/AchievementPage.jsx`
- Query: `frontend/src/queries/useAchievementQuery.js`

Backend:
- `GET /api/v1/achievement`
- `GET /api/v1/achievement/:id`
- `POST /api/v1/achievement` (multipart upload sertifikat)
- `DELETE /api/v1/achievement/:id`

## 6.6 Scholarship
Frontend:
- Pages: `ScholarshipPage.jsx`, `ScholarshipDetailPage.jsx`
- Query: `frontend/src/queries/useScholarshipQuery.js`

Backend:
- `GET /api/v1/scholarship`
- `GET /api/v1/scholarship/:id`
- `GET /api/v1/scholarship/riwayat`
- `GET /api/v1/scholarship/pengajuan/:id`
- `POST /api/v1/scholarship/:id/daftar` (multipart + transaction)

Pipeline status yang didesain:
- `dikirim -> seleksi_berkas -> evaluasi -> review -> penetapan -> diterima/ditolak`

## 6.7 Counseling
Frontend:
- Page: `frontend/src/pages/Student/CounselingPage.jsx`
- Query: `frontend/src/queries/useCounselingQuery.js`

Backend:
- `GET /api/v1/counseling/jadwal`
- `GET /api/v1/counseling/riwayat`
- `POST /api/v1/counseling/booking`
- `DELETE /api/v1/counseling/riwayat/:id`

Rule penting:
- transaksi booking + lock kuota
- cegah double booking slot aktif
- cancel hanya status `Menunggu`

## 6.8 Health Screening
Frontend:
- Page: `frontend/src/pages/Student/HealthScreeningPage.jsx`
- Query: `frontend/src/queries/useHealthQuery.js`

Backend:
- `GET /api/v1/health/ringkasan`
- `GET /api/v1/health/riwayat`
- `GET /api/v1/health/riwayat/:id`
- `POST /api/v1/health/mandiri`
- `GET /api/v1/health/tips`

Rule penting:
- rate limit input mandiri: max 3/hari
- validasi range tinggi/berat
- perhitungan BMI + klasifikasi status kesehatan

## 6.9 Student Voice
Frontend:
- Pages: `StudentVoicePage.jsx`, `StudentVoiceDetailPage.jsx`
- Query utama yang dipakai halaman: `frontend/src/queries/useStudentVoiceQuery.js`

Backend:
- `GET /api/v1/student-voice`
- `GET /api/v1/student-voice/stats`
- `GET /api/v1/student-voice/:id`
- `POST /api/v1/student-voice` (multipart)
- `PUT /api/v1/student-voice/:id/cancel`

Rule penting:
- ticket format `SV-YYYYMMDD-XXXX`
- minimal isi 50 karakter, judul max 150
- lampiran max 5MB, ekstensi terbatas (pdf/jpg/jpeg/png)

## 6.10 Organisasi
Frontend:
- Page: `frontend/src/pages/Student/OrganisasiPage.jsx`
- Query: `frontend/src/queries/useOrganisasiQuery.js`

Backend:
- `GET /api/v1/organisasi`
- `POST /api/v1/organisasi`
- `PUT /api/v1/organisasi/:id`
- `DELETE /api/v1/organisasi/:id`

Rule penting:
- update/delete hanya jika `StatusVerifikasi = Menunggu`

## 6.11 Profil + Preferensi + Notifikasi
Frontend:
- Profile page + tabs: `frontend/src/pages/Student/ProfilePage.jsx`, `tabs/*.jsx`
- Notifikasi page: `frontend/src/pages/Student/NotificationPage.jsx`
- Dropdown notifikasi: `frontend/src/components/layout/NotificationDropdown.jsx`

Backend:
- Profil: `GET /profil`, `PUT /profil/data-diri`, `POST /profil/foto`, `PUT /profil/ganti-password`
- Riwayat: `GET /profil/sesi-aktif`, `GET /profil/riwayat-login`
- Preference: `GET/PUT /profil/preferensi-notif`
- Notifikasi: `GET /notifikasi`, `GET /notifikasi/unread-count`, `PUT /notifikasi/:id/baca`, `PUT /notifikasi/baca-semua`, `DELETE /notifikasi/:id`, `DELETE /notifikasi/hapus-bulk`, `DELETE /notifikasi/hapus-sudah-dibaca`

---

## 7. Data Model Kunci untuk Student

Tabel inti student yang aktif dipakai modul:

- Identity akademik: `users`, `students`, `majors`, `faculties`
- KRS/KHS: `periode_akademiks`, `mata_kuliahs`, `jadwal_kuliahs`, `krs_headers`, `krs_details`, `khs`
- KENCANA: `kencana_tahaps`, `kencana_materis`, `kencana_kuis`, `kuis_soals`, `kencana_hasil_kuis`, `kencana_progresses`, `kencana_bandings`, `kencana_sertifikats`
- Achievement: `achievements`
- Scholarship: `beasiswas`, `pengajuan_beasiswas`, `pengajuan_berkas`, `pengajuan_pipeline_logs`
- Counseling: `jadwal_konselings`, `booking_konselings`
- Health: `hasil_kesehatans`
- Student Voice: `tiket_aspirasis`, `tiket_timeline_events`
- Organisasi: `riwayat_organisasis`
- Notifikasi/Profile settings: `notifications`, `notification_preferences`, `login_histories`, `pengumumans`, `aktivitas_logs`, `kegiatan_kampuses`

---

## 8. Alur Data Utama Student (End-to-End)

1. Login mahasiswa via NIM + password.
2. Backend validasi bcrypt, kirim access token + set cookie refresh token.
3. Frontend simpan access token ke Zustand persist (`auth-storage`).
4. Axios request interceptor menyertakan header `Authorization: Bearer <token>`.
5. Jika 401, axios interceptor memanggil `/auth/refresh` dengan cookie refresh token.
6. Token baru di-set ke store, request awal di-retry otomatis.
7. Semua modul student memanggil endpoint masing-masing via React Query.

---

## 9. Temuan Reverse Engineering (Penting untuk Fokus Student)

## 9.1 Critical / High
1) **JWT secret hardcoded di source**
- Lokasi: `backend/modules/auth/auth_handler.go`, `backend/middleware/jwt_middleware.go`
- Risiko: security leak, token forgery jika source terbuka.

2) **Tidak ada route guard autentikasi di level frontend route `/student/*`**
- Lokasi: `frontend/src/App.jsx`
- Dampak: halaman student dapat diakses langsung tanpa check auth di sisi client (backend tetap proteksi API, tapi UX/security posture lemah).

3) **Student Voice memakai axios instance berbeda (tanpa interceptor auth)**
- Lokasi: `frontend/src/queries/useStudentVoiceQuery.js`
- Dampak: request cenderung gagal 401 karena backend butuh Bearer token dari `src/lib/axios.js`.

4) **Query dashboard mengacu kolom yang tidak ada (`balasan_admin`)**
- Lokasi: `backend/modules/dashboard/dashboard_handler.go`
- Tabel `tiket_aspirasis` di model tidak memiliki field `balasan_admin`.
- Dampak: potensi SQL error saat hit endpoint dashboard.

## 9.2 Medium
1) **Inkonsistensi enum/status antar modul**
- Contoh: ada lowercase (`selesai`, `dikirim`) dan TitleCase (`Menunggu`, `Dikonfirmasi`, `Diverifikasi`) campur.
- Dampak: statistik/filter rentan tidak akurat.

2) **Statistik dashboard beasiswa kemungkinan tidak sinkron dengan status real**
- Query hitung pakai nilai `Proses`/`Menunggu`, sedangkan pipeline scholarship memakai status lowercase lain.

3) **Notifikasi page bulk read tidak memakai selected IDs**
- Lokasi: `frontend/src/pages/Student/NotificationPage.jsx`
- `bulkReadMutation` memanggil `/notifikasi/baca-semua`, jadi perilaku tidak sesuai UX “pilih beberapa”.

4) **Logout UI hanya clear state lokal, tidak selalu panggil endpoint logout**
- Lokasi: sidebar/header menggunakan `logout()` store langsung.
- Dampak: refresh cookie bisa tetap aktif sampai expired.

5) **Seed role dosen berpotensi salah role**
- Seeder membuat role `Student`, lalu user dosen memakai role tersebut.
- Dampak: bila nanti role enforcement diperketat, data awal bisa menyesatkan.

---

## 10. Kesiapan Modul Student (Readiness Snapshot)

- Dashboard: **cukup siap**, cek ulang query statistik.
- KRS: **cukup matang** untuk fitur inti (draft/add/remove/submit + validasi akademik).
- KENCANA: **matang** (quiz, progress, sertifikat, banding).
- Scholarship: **matang** (catalog + apply + tracking) dengan perhatian enum status.
- Achievement: **matang** untuk CRUD student-side.
- Counseling: **matang** dengan transaction booking.
- Health: **matang** untuk self-input + riwayat.
- Student Voice: **fitur backend matang**, perlu perbaikan integrasi query FE.
- Organisasi: **siap** untuk CRUD dasar.
- Profil/Notifikasi: **siap** dengan beberapa perbaikan perilaku bulk action/logout.

---

## 11. Rekomendasi Teknis Prioritas (Agar Anda Fokus Student Lebih Aman)

### Prioritas 1 (stabilisasi fondasi)
1. Pindahkan JWT secret ke env (`JWT_SECRET`) + rotasi key.
2. Pasang frontend route guard untuk `/student/*`.
3. Konsolidasikan Student Voice query agar pakai `src/lib/axios.js`.
4. Perbaiki query dashboard yang refer kolom tidak ada.

### Prioritas 2 (konsistensi domain)
1. Standarkan enum/status lintas modul (lower_snake_case disarankan).
2. Rapikan query statistik dashboard sesuai enum final.
3. Sinkronkan bulk action notifikasi dengan endpoint (opsi by IDs).

### Prioritas 3 (hardening)
1. Tambah audit action student penting (submit KRS, submit scholarship, ajukan voice).
2. Tambah test API minimal untuk endpoint student kritis.
3. Rapikan logout flow: clear store + hit `/auth/logout`.

---

## 12. Runbook Lokal (Khusus Pengembangan Student)

## 12.1 Backend
- Start backend dari `backend/main.go`.
- Pastikan env DB tersedia (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `PORT`).
- Endpoint health: `GET /api/health`.

## 12.2 Frontend
- Gunakan `VITE_API_URL` agar tidak hardcode URL.
- Start Vite (`npm run dev`) dari folder `frontend`.

## 12.3 Akun seed student (dari seeder)
- NIM: `10123456`
- Password: `password123`
- Email: `mahasiswa@bku.ac.id`

---

## 13. Referensi File Kunci untuk Pekerjaan Anda

Backend:
- `backend/main.go`
- `backend/middleware/jwt_middleware.go`
- `backend/modules/auth/auth_handler.go`
- `backend/modules/dashboard/dashboard_handler.go`
- `backend/modules/krs/krs_handler.go`
- `backend/modules/kencana/kencana_handler.go`
- `backend/modules/scholarship/scholarship_handler.go`
- `backend/modules/voice/voice_handler.go`
- `backend/modules/health/health_handler.go`
- `backend/modules/profil/profil_handler.go`
- `backend/modules/notifikasi/notifikasi_handler.go`
- `backend/models/models.go`

Frontend:
- `frontend/src/App.jsx`
- `frontend/src/lib/axios.js`
- `frontend/src/store/useAuthStore.js`
- `frontend/src/queries/useKRSQuery.js`
- `frontend/src/queries/useKencanaQuery.js`
- `frontend/src/queries/useScholarshipQuery.js`
- `frontend/src/queries/useHealthQuery.js`
- `frontend/src/queries/useCounselingQuery.js`
- `frontend/src/queries/useAchievementQuery.js`
- `frontend/src/queries/useOrganisasiQuery.js`
- `frontend/src/queries/useStudentVoiceQuery.js`
- `frontend/src/pages/Student/*.jsx`

---

## 14. Penutup

Untuk konteks Anda yang fokus penuh di domain student, codebase ini sudah memiliki pondasi yang baik dan cakupan fitur yang relatif lengkap. Nilai terbesar yang bisa Anda dorong dalam waktu dekat bukan menambah fitur baru, melainkan **stabilisasi integrasi + konsistensi kontrak data** agar modul student menjadi solid, testable, dan siap scale.

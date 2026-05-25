# 📁 Dokumentasi Struktur Proyek BKU Hub (Siakad)

> Proyek ini terdiri dari dua bagian utama: **Backend** (Go/Fiber) dan **Mobile** (Flutter).
> Sistem ini adalah aplikasi manajemen kemahasiswaan yang mencakup fitur konseling psikolog, ormawa, beasiswa, prestasi, dan lainnya.

---

## 🗂️ Gambaran Umum Struktur

```
Siakad/
├── backend/          → REST API server (Go + Fiber + GORM + PostgreSQL)
├── Mobile/           → Aplikasi mobile (Flutter + Provider)
└── audit/            → Dokumentasi audit API
```

---

# 🔧 BACKEND (Go)

## Struktur Folder Backend

```
backend/
├── main.go
├── .env
├── go.mod / go.sum
├── auth/
├── config/
├── controllers/
│   ├── fakultas/
│   ├── mahasiswa/
│   ├── ormawa/
│   ├── pddikti/
│   ├── psychologist/
│   └── super_admin_controller.go
├── database/migrations/
├── middleware/
├── models/
├── pkg/notifikasi/
├── routes/
└── seeder/
```

---

## 📄 File-file Backend

### Root

| File | Fungsi |
|------|--------|
| `main.go` | Entry point aplikasi. Inisialisasi Fiber, koneksi DB, load routes, jalankan server |
| `.env` | Konfigurasi environment (DB host, port, JWT secret, dll) |
| `go.mod` | Dependency management Go modules |
| `scratch_check_profiles.go` | File sementara untuk debugging/cek data profil |

---

### `auth/`

| File | Fungsi |
|------|--------|
| `auth.go` | Handler login/register untuk semua role (mahasiswa, ormawa, psikolog, fakultas, super admin). Juga berisi seed data awal psikolog dan jadwal default |

---

### `config/`

| File | Fungsi |
|------|--------|
| `app_config.go` | Konfigurasi aplikasi global (baca .env, setup variabel) |
| `db_connection.go` | Koneksi ke database PostgreSQL menggunakan GORM |
| `db_migrations.go` | Auto-migrate semua model ke database (buat/update tabel otomatis) |

---

### `middleware/`

| File | Fungsi |
|------|--------|
| `jwt_middleware.go` | Middleware validasi JWT token. Cek token di header Authorization, extract user_id dan role, inject ke context Fiber |

---

### `models/`

| File | Fungsi |
|------|--------|
| `model.go` | Semua model utama: User, Mahasiswa, Fakultas, ProgramStudi, Ormawa, Proposal, Keuangan, Absensi, Beasiswa, Prestasi, Aspirasi, Notifikasi, dll |
| `psychologist.go` | Model khusus psikolog: Psikolog, PsikologScheduleSlot, PsikologBooking, PsikologSessionNote, PsikologAssessment, PsikologReport, PsikologNotification |
| `counseling_jadwal.go` | Model JadwalKonseling (jadwal konseling umum dari sisi mahasiswa) |
| `pkkmb_quiz.go` | Model untuk kuis PKKMB: PkkmbQuiz, PkkmbQuestion, PkkmbAnswer, PkkmbResult |

---

### `pkg/notifikasi/`

| File | Fungsi |
|------|--------|
| `notifikasi.go` | Helper untuk membuat dan mengirim notifikasi ke user (mahasiswa, ormawa, psikolog) |

---

### `database/migrations/`

| File | Fungsi |
|------|--------|
| `01_ormawa_schema.sql` | Schema awal tabel-tabel ormawa |
| `02_admin_fakultas_schema.sql` | Schema tabel admin fakultas |
| `03_student_schema_relasi.sql` | Schema relasi mahasiswa (FK, index) |
| `03_student_schema_relasi.md` | Dokumentasi relasi schema mahasiswa |
| `04_localized_schema.sql` | Schema untuk data lokalisasi/tambahan |

---

### `seeder/`

| File | Fungsi |
|------|--------|
| `seed_ormawa.go` | Seed data awal untuk ormawa (organisasi, divisi, anggota, dll) |

---

### `routes/`

| File | Fungsi |
|------|--------|
| `mahasiswa.go` | Daftarkan semua route mahasiswa: `/mahasiswa/*` (dashboard, profil, beasiswa, prestasi, konseling, kesehatan, aspirasi, notifikasi, kencana) |
| `psychologist.go` | Daftarkan semua route psikolog: `/psychologist/*` (profil, jadwal, booking, pasien, rekam medis, asesmen, analitik, laporan, notifikasi) |
| `ormawa.go` | Daftarkan semua route ormawa: `/ormawa/*` (dashboard, proposal, keuangan, absensi, anggota, pengumuman, PKKMB) |
| `fakultas.go` | Daftarkan semua route admin fakultas: `/fakultas/*` (profil, akademik, pelayanan, informasi, PKKMB) |
| `pddikti.go` | Daftarkan route integrasi PDDikti: `/pddikti/*` |
| `super_admin.go` | Daftarkan route super admin: `/admin/*` (kelola user, psikolog, ormawa, dll) |

---

### `controllers/mahasiswa/`

| File | Fungsi |
|------|--------|
| `auth_handler.go` | Login, register, refresh token mahasiswa |
| `base.go` | Helper function yang dipakai bersama di controller mahasiswa |
| `dashboard_handler.go` | Data dashboard mahasiswa (status akademik, agenda, berita kampus) |
| `profil_handler.go` | CRUD profil mahasiswa, upload foto profil |
| `counseling_handler.go` | Jadwal konseling umum (bukan psikolog), booking konseling |
| `counseling_service.go` | Business logic untuk konseling mahasiswa |
| `psychologist_counseling_handler.go` | List psikolog, lihat jadwal psikolog, booking ke psikolog, lihat rekam medis sendiri |
| `achievement_handler.go` | CRUD prestasi mahasiswa, upload bukti prestasi |
| `achievement_service.go` | Business logic validasi dan proses prestasi |
| `scholarship_handler.go` | Daftar beasiswa, apply beasiswa, lihat status pengajuan |
| `scholarship_service.go` | Business logic beasiswa (validasi dokumen, proses pengajuan) |
| `health_handler.go` | Rekam kesehatan mahasiswa, laporan kesehatan |
| `organisasi_handler.go` | Riwayat organisasi mahasiswa |
| `voice_handler.go` | Aspirasi/suara mahasiswa (submit, lihat status) |
| `voice_service.go` | Business logic aspirasi mahasiswa |
| `kencana_handler.go` | Fitur KENCANA (modul pembelajaran, kuis, banding nilai) |
| `notifikasi_handler.go` | Notifikasi mahasiswa (list, mark read, delete) |

---

### `controllers/psychologist/`

| File | Fungsi |
|------|--------|
| `psychologist_handler.go` | **Semua handler psikolog dalam satu file**: GetMe, UpdateProfile, ChangePassword, GetDashboard, GetBookings, GetBookingDetail, UpdateBookingStatus, GetSchedules, SaveSchedules, GetPatients, GetMedicalRecord, CreateSessionNote, GetAssessments, CreateAssessment, GetAnalytics, GetReports, CreateReport, GetNotifications, MarkNotificationRead, MarkAllNotificationsRead, DeleteNotification |

---

### `controllers/ormawa/`

| File | Fungsi |
|------|--------|
| `ormawa_controller.go` | Semua handler ormawa: dashboard, proposal, LPJ, keuangan, absensi, anggota, divisi, pengumuman, aspirasi, kalender, laporan, notifikasi, settings, RBAC |
| `pkkmb.go` | Handler PKKMB dari sisi ormawa: kelola misi, materi, peserta |
| `pkkmb_quiz.go` | Handler kuis PKKMB: buat soal, lihat hasil, leaderboard |

---

### `controllers/fakultas/`

| File | Fungsi |
|------|--------|
| `fakultas_profile.go` | Profil dan settings admin fakultas |
| `fakultas_akademik.go` | Data akademik: periode, KRS, nilai, jadwal kuliah |
| `fakultas_pelayanan.go` | Layanan mahasiswa: beasiswa, prestasi, konseling dari sisi fakultas |
| `fakultas_informasi.go` | Informasi kampus: pengumuman, berita, agenda |
| `pkkmb.go` | Kelola PKKMB dari sisi fakultas |

---

### `controllers/pddikti/`

| File | Fungsi |
|------|--------|
| `pddikti.go` | Integrasi data PDDikti (data mahasiswa, program studi dari sistem nasional) |

---

### `controllers/super_admin_controller.go`

Handler super admin: kelola semua user, buat akun psikolog, kelola ormawa, lihat semua data sistem.

---

---

# 📱 MOBILE (Flutter)

## Arsitektur

Mobile menggunakan **Clean Architecture** dengan pola:
```
Feature → Domain (entities + repository interface) → Data (models + repository impl) → Presentation (pages + providers + widgets)
```

State management menggunakan **Provider**.

## Struktur Folder Mobile

```
Mobile/lib/
├── main.dart
├── core/
│   ├── network/
│   ├── providers/
│   ├── routes/
│   ├── services/
│   ├── theme/
│   └── widgets/
└── features/
    ├── auth/
    ├── main/
    ├── mahasiswa/
    ├── counseling/        → Fitur psikolog
    ├── ormawa/
    ├── achievement/
    ├── organisasi/
    └── profile/
```

---

## 📄 File-file Mobile

### Root

| File | Fungsi |
|------|--------|
| `main.dart` | Entry point Flutter. Setup Provider, GoRouter, tema aplikasi, dan inject semua dependency |

---

### `core/network/`

| File | Fungsi |
|------|--------|
| `api_client.dart` | Singleton Dio HTTP client. Setup base URL, timeout, dan attach interceptor |
| `api_exceptions.dart` | Custom exception class untuk error HTTP (401, 404, 500, network error, dll) |
| `api_interceptors.dart` | Interceptor Dio: inject JWT token ke setiap request, handle 401 (auto logout), log request/response |

---

### `core/providers/`

| File | Fungsi |
|------|--------|
| `student_provider.dart` | Provider utama mahasiswa: profil, dashboard, data akademik |
| `achievement_provider.dart` | Provider prestasi mahasiswa: list, submit, upload bukti |
| `scholarship_provider.dart` | Provider beasiswa: list beasiswa, apply, status pengajuan |
| `ormawa_provider.dart` | Provider data ormawa yang diakses mahasiswa |
| `navigation_provider.dart` | Provider untuk state navigasi bottom nav bar |

---

### `core/routes/`

| File | Fungsi |
|------|--------|
| `app_routes.dart` | Definisi semua named routes menggunakan GoRouter. Berisi konstanta path dan konfigurasi routing seluruh aplikasi |

---

### `core/services/`

| File | Fungsi |
|------|--------|
| `auth_service.dart` | Service autentikasi: login, logout, simpan/hapus token di SharedPreferences, cek status login |
| `api_gate.dart` | Gate/wrapper untuk semua API call. Handle loading state, error handling terpusat |

---

### `core/theme/`

| File | Fungsi |
|------|--------|
| `app_colors.dart` | Definisi semua warna aplikasi (primary, secondary, background, dll) |
| `app_text_styles.dart` | Definisi semua text style (titleLg, titleMd, bodyLg, bodyMd, labelSm, dll) |

---

### `core/widgets/`

| File | Fungsi |
|------|--------|
| `bku_app_bar.dart` | Custom AppBar yang dipakai di seluruh aplikasi. Support expandable, gradient, profile image, back button, notifikasi |
| `bku_shimmer.dart` | Widget shimmer loading effect untuk placeholder konten |
| `coming_soon_screen.dart` | Screen placeholder untuk fitur yang belum tersedia |
| `custom_bottom_nav_bar.dart` | Bottom navigation bar custom dengan animasi |
| `fade_in_animation.dart` | Widget wrapper untuk animasi fade-in saat widget muncul |
| `premium_app_bar.dart` | Varian AppBar premium dengan efek glassmorphism |

---

---

## 🔐 Feature: Auth

```
features/auth/presentation/pages/
```

| File | Fungsi |
|------|--------|
| `login_screen.dart` | Halaman login. Form email/password, pilih role (mahasiswa/ormawa/psikolog/fakultas), hit API login, simpan token |
| `splash_screen.dart` | Splash screen awal. Cek token tersimpan, redirect ke halaman yang sesuai berdasarkan role |

---

## 🏠 Feature: Main

```
features/main/presentation/pages/
```

| File | Fungsi |
|------|--------|
| `main_screen.dart` | Shell utama aplikasi mahasiswa. Berisi bottom nav bar dan routing antar tab (Dashboard, Konseling, Ormawa, Profil) |

---

## 👨‍🎓 Feature: Mahasiswa

### Dashboard
| File | Fungsi |
|------|--------|
| `dashboard_screen.dart` | Halaman utama mahasiswa. Tampilkan status akademik, agenda hari ini, layanan, berita kampus |
| `student_dashboard_app_bar.dart` | AppBar khusus dashboard mahasiswa dengan info nama dan NIM |
| `student_service_grid.dart` | Grid layanan mahasiswa (Konseling, Beasiswa, Prestasi, dll) |
| `student_status_grid.dart` | Grid status akademik (SKS, IPK, Semester) |
| `student_agenda_list.dart` | List agenda/jadwal kuliah hari ini |
| `today_schedule_card.dart` | Card jadwal kuliah hari ini |

### Counseling (Mahasiswa)
| File | Fungsi |
|------|--------|
| `counseling_screen.dart` | Halaman konseling mahasiswa. Lihat riwayat sesi, rekam medis, status booking |
| `psychologist_list_screen.dart` | List psikolog yang tersedia. Filter berdasarkan spesialisasi, tampilkan status aktif/nonaktif |
| `book_counseling_screen.dart` | Form booking konseling ke psikolog. Pilih tanggal, slot waktu, topik, keluhan |

### Achievement (Mahasiswa)
| File | Fungsi |
|------|--------|
| `achievement_screen.dart` | List prestasi mahasiswa yang sudah disubmit beserta statusnya |
| `report_achievement_screen.dart` | Form lapor prestasi baru (nama, tingkat, kategori, upload bukti) |

### Scholarship
| File | Fungsi |
|------|--------|
| `scholarship_screen.dart` | List beasiswa yang tersedia dan status pengajuan mahasiswa |
| `apply_scholarship_screen.dart` | Form apply beasiswa (upload dokumen: KTM, KK, transkrip, foto) |

### Health
| File | Fungsi |
|------|--------|
| `health_screen.dart` | Rekam kesehatan mahasiswa (riwayat pemeriksaan, kondisi) |
| `report_health_screen.dart` | Form lapor kondisi kesehatan baru |

### Organisasi (Mahasiswa)
| File | Fungsi |
|------|--------|
| `organisasi_screen.dart` | Riwayat organisasi mahasiswa (jabatan, periode, nama organisasi) |

### Student Voice
| File | Fungsi |
|------|--------|
| `student_voice_screen.dart` | List aspirasi/suara mahasiswa yang sudah disubmit beserta statusnya |
| `submit_aspiration_screen.dart` | Form submit aspirasi baru (judul, isi, kategori) |

### Kencana
| File | Fungsi |
|------|--------|
| `kencana_screen.dart` | Halaman utama KENCANA (modul pembelajaran mahasiswa baru) |
| `module_detail_screen.dart` | Detail modul pembelajaran KENCANA |
| `quiz_screen.dart` | Kuis KENCANA (soal pilihan ganda, timer, submit jawaban) |
| `appeal_screen.dart` | Form banding nilai kuis KENCANA |

### Notifications (Mahasiswa)
| File | Fungsi |
|------|--------|
| `notifications_screen.dart` | List notifikasi mahasiswa |
| `student_notifications_screen.dart` | Versi lain notifikasi mahasiswa dengan filter |

### Data Layer (Mahasiswa)
| File | Fungsi |
|------|--------|
| `student_repository.dart` | Interface/kontrak semua operasi data mahasiswa |
| `student_repository_impl.dart` | Implementasi repository mahasiswa (hit API, parse response) |
| `achievement_model.dart` | Model data prestasi |
| `aspiration_model.dart` | Model data aspirasi |
| `counseling_session_model.dart` | Model data sesi konseling |
| `health_record_model.dart` | Model data rekam kesehatan |
| `mission_model.dart` | Model data misi PKKMB |
| `organization_history_model.dart` | Model riwayat organisasi |
| `scholarship_model.dart` | Model data beasiswa |

### Domain Entities (Mahasiswa)
| File | Fungsi |
|------|--------|
| `achievement.dart` | Entity prestasi |
| `aspiration.dart` | Entity aspirasi |
| `campus_news.dart` | Entity berita kampus |
| `counseling_session.dart` | Entity sesi konseling |
| `faculty_progress.dart` | Entity progress akademik |
| `health_record.dart` | Entity rekam kesehatan |
| `mission.dart` | Entity misi PKKMB |
| `organization_history.dart` | Entity riwayat organisasi |
| `scholarship.dart` | Entity beasiswa |

---

---

## 🧠 Feature: Counseling (Psikolog)

Ini adalah fitur terbesar dan paling kompleks. Menggunakan Clean Architecture penuh.

```
features/counseling/
├── data/
│   ├── models/
│   └── repositories/
├── domain/
│   ├── entities/
│   └── repositories/
└── presentation/
    ├── pages/
    ├── providers/
    └── widgets/
```

### Pages (Psikolog)

| File | Fungsi |
|------|--------|
| `psychologist_main_screen.dart` | Shell utama psikolog. Bottom nav bar dengan tab: Home, Jadwal, Pasien, Laporan, Settings |
| `psychologist_dashboard_screen.dart` | Home psikolog. Tampilkan toggle availability, ringkasan hari ini (selesai/menunggu/baru), layanan utama, jadwal mendatang, analitik, keamanan |
| `schedule_management_screen.dart` | Kelola jadwal psikolog. Calendar strip pilih tanggal, list slot waktu per hari, toggle on/off per slot, bulk action (set berhalangan/aktifkan semua), simpan ke backend |
| `add_schedule_slot_screen.dart` | Form tambah slot jadwal baru (hari, jam mulai, jam selesai, kategori, lokasi, kuota) |
| `psychologist_bookings_screen.dart` | List semua booking dari mahasiswa. Filter by status, konfirmasi/tolak booking |
| `patient_list_screen.dart` | List semua pasien (mahasiswa yang pernah booking). Lihat detail, riwayat sesi |
| `session_note_screen.dart` | Form buat catatan sesi konseling (keluhan, observasi, rekomendasi, mood, jenis sesi, status pasien) |
| `assessment_management_screen.dart` | Kelola asesmen psikologis. List asesmen, buat asesmen baru, lihat hasil |
| `assessment_screen.dart` | Halaman asesmen untuk mahasiswa. Pilih jenis asesmen (DASS-21, Stres Akademik, Kecemasan Sosial), isi kuis, submit hasil |
| `psychologist_analytics_screen.dart` | Analitik konseling. Summary cards (total pasien, sesi selesai, kasus mendesak, kepuasan), trend chart bulanan, distribusi masalah, rekomendasi sistem |
| `psychologist_reports_screen.dart` | Laporan klinis psikolog. List laporan, buat laporan baru, download |
| `psychologist_settings_screen.dart` | Settings psikolog: edit profil, ganti password, notifikasi |
| `counseling_booking_screen.dart` | Detail booking konseling (dari sisi psikolog) |
| `student_counseling_screen.dart` | Halaman konseling dari sisi mahasiswa (lihat rekam medis sendiri) |
| `create_psychologist_report_screen.dart` | Form buat laporan klinis baru |

### Providers (Psikolog)

| File | Fungsi |
|------|--------|
| `psychologist_dashboard_provider.dart` | State management dashboard psikolog: profil, stats, upcoming bookings, toggle availability, waiting/confirmed count |
| `counseling_provider.dart` | State management operasional psikolog: bookings, schedules, patients, medical records, session notes, assessments, analytics, reports, notifications |
| `student_counseling_provider.dart` | State management konseling dari sisi mahasiswa: list psikolog, booking, rekam medis |

### Widgets Dashboard (Psikolog)

| File | Fungsi |
|------|--------|
| `availability_toggle.dart` | Widget toggle on/off ketersediaan psikolog di AppBar home |
| `quick_stats_card.dart` | Card ringkasan hari ini (jumlah janji temu, selesai, menunggu, baru, rating) |
| `psychologist_service_grid.dart` | Grid layanan utama psikolog (Jadwal, Booking, Pasien, Asesmen, Analitik, Laporan) |
| `upcoming_appointments_card.dart` | Card daftar jadwal mendatang (nama mahasiswa, waktu, topik, status) |
| `psychologist_analytics_card.dart` | Card mini analitik di dashboard (preview statistik) |
| `psychologist_security_card.dart` | Card keamanan sistem (info akun, ganti password) |
| `counseling_bottom_nav_bar.dart` | Bottom navigation bar khusus psikolog |

### Domain Layer (Counseling)

| File | Fungsi |
|------|--------|
| `counseling_repository.dart` | Interface semua operasi data psikolog (getProfile, getDashboard, getBookings, getSchedules, saveSchedules, getPatients, getMedicalRecord, createSessionNote, getAssessments, getAnalytics, getReports, dll) |
| `psychologist.dart` | Entity Psychologist (id, name, nidn, specialization, isAvailable, profileImageUrl, dll) |
| `counseling_session.dart` | Entity CounselingSession (id, date, time, status, patient, note, dll) |

### Data Layer (Counseling)

| File | Fungsi |
|------|--------|
| `counseling_repository_impl.dart` | Implementasi semua method dari CounselingRepository. Hit API backend, parse response JSON |
| `counseling_models.dart` | Model data untuk parsing JSON response konseling |

---

---

## 🏛️ Feature: Ormawa

Fitur terlengkap kedua. Mencakup semua kebutuhan manajemen organisasi mahasiswa.

### Pages (Ormawa)

| File | Fungsi |
|------|--------|
| `ormawa_main_screen.dart` | Shell utama ormawa dengan bottom nav bar |
| `ormawa_dashboard_screen.dart` | Dashboard ormawa: stats, proposal terbaru, layanan |
| `ormawa_proposal_screen.dart` | List semua proposal kegiatan |
| `ormawa_proposal_detail_screen.dart` | Detail proposal (status, dokumen, komentar) |
| `create_proposal_screen.dart` | Form buat proposal baru (judul, deskripsi, anggaran, upload dokumen) |
| `ormawa_finance_screen.dart` | Manajemen keuangan ormawa (pemasukan, pengeluaran, saldo) |
| `create_transaction_screen.dart` | Form tambah transaksi keuangan baru |
| `ormawa_absensi_screen.dart` | Manajemen absensi kegiatan ormawa |
| `ormawa_anggota_screen.dart` | List anggota ormawa beserta jabatan dan divisi |
| `ormawa_aspirasi_screen.dart` | Aspirasi yang masuk dari mahasiswa |
| `ormawa_pengumuman_screen.dart` | Buat dan kelola pengumuman ormawa |
| `ormawa_kalender_screen.dart` | Kalender agenda kegiatan ormawa |
| `ormawa_agenda_detail_screen.dart` | Detail agenda kegiatan |
| `ormawa_laporan_screen.dart` | Laporan kegiatan ormawa (LPJ) |
| `ormawa_pkkmb_screen.dart` | Kelola PKKMB dari sisi ormawa |
| `ormawa_role_screen.dart` | Manajemen role/hak akses anggota (RBAC) |
| `ormawa_staff_screen.dart` | Manajemen staff/pengurus ormawa |
| `ormawa_struktur_screen.dart` | Lihat struktur organisasi ormawa |
| `manage_struktur_screen.dart` | Edit struktur organisasi |
| `ormawa_settings_screen.dart` | Settings ormawa (profil organisasi, dll) |
| `ormawa_notification_screen.dart` | Notifikasi ormawa |
| `ormawa_notifications_screen.dart` | List semua notifikasi ormawa |
| `ormawa_pkkmb_screen.dart` | Kelola misi dan materi PKKMB |

### Widgets (Ormawa)

| File | Fungsi |
|------|--------|
| `ormawa_app_bar.dart` | AppBar custom untuk halaman ormawa |
| `ormawa_bottom_nav_bar.dart` | Bottom nav bar ormawa |
| `ormawa_proposal_list.dart` | Widget list proposal di dashboard |
| `ormawa_quick_stats.dart` | Widget stats cepat di dashboard ormawa |
| `ormawa_service_grid.dart` | Grid layanan ormawa |
| `ormawa_settings_app_bar.dart` | AppBar khusus halaman settings ormawa |

### Domain Entities (Ormawa)

| File | Fungsi |
|------|--------|
| `ormawa_proposal.dart` | Entity proposal kegiatan |
| `ormawa_finance.dart` | Entity keuangan ormawa |
| `ormawa_attendance.dart` | Entity absensi |
| `ormawa_member.dart` | Entity anggota ormawa |
| `ormawa_division.dart` | Entity divisi ormawa |
| `ormawa_announcement.dart` | Entity pengumuman |
| `ormawa_agenda.dart` | Entity agenda kegiatan |
| `ormawa_lpj.dart` | Entity laporan pertanggungjawaban |
| `ormawa_aspiration.dart` | Entity aspirasi mahasiswa |
| `ormawa_notification.dart` | Entity notifikasi ormawa |
| `ormawa_pkkmb.dart` | Entity data PKKMB |
| `ormawa_role.dart` | Entity role/hak akses |
| `pkkmb_mission.dart` | Entity misi PKKMB |
| `banding_appeal.dart` | Entity banding nilai |

---

## 👤 Feature: Profile

| File | Fungsi |
|------|--------|
| `profile_screen.dart` | Halaman profil user. Tampilkan info akun, edit profil, logout |

---

## 🏆 Feature: Achievement

| File | Fungsi |
|------|--------|
| `report_achievement_screen.dart` | Form lapor prestasi (versi standalone, bisa diakses dari berbagai tempat) |

---

## 🏢 Feature: Organisasi

| File | Fungsi |
|------|--------|
| `organisasi_screen.dart` | Halaman organisasi (versi standalone untuk mahasiswa) |

---

---

# 🔄 Alur Data (Data Flow)

## Login Flow
```
LoginScreen → AuthService.login() → API /auth/login → Simpan JWT token → Redirect by role
  ├── Mahasiswa → MainScreen (bottom nav)
  ├── Ormawa → OrmawaMainScreen
  ├── Psikolog → PsychologistMainScreen
  └── Fakultas → (web admin)
```

## API Call Flow (Mobile)
```
Screen → Provider → Repository Interface → Repository Impl → ApiClient (Dio) → Backend API
                                                                    ↑
                                                          ApiInterceptor (inject JWT)
```

## Backend Request Flow
```
HTTP Request → Fiber Router → JWT Middleware → Controller Handler → GORM → PostgreSQL
                                                      ↓
                                              JSON Response
```

---

# 🗄️ Database Schema Utama

## Tabel Psikolog
```
psikolog.profiles     → Data profil psikolog (nama, NIDN, spesialisasi, is_aktif)
psikolog.schedule_slots → Slot jadwal (hari, jam_mulai, jam_selesai, kuota, is_aktif)
psikolog.bookings     → Booking dari mahasiswa (tanggal, jam, topik, status)
psikolog.session_notes → Catatan sesi konseling (keluhan, observasi, rekomendasi, mood)
psikolog.assessments  → Asesmen psikologis (nama, kategori, skor, status)
psikolog.reports      → Laporan klinis
psikolog.notifications → Notifikasi psikolog
```

## Tabel Mahasiswa
```
users                 → Akun user (email, password, role)
mahasiswas            → Data mahasiswa (NIM, nama, prodi, semester, IPK)
program_studis        → Program studi
fakultas              → Fakultas
achievements          → Prestasi mahasiswa
scholarships          → Beasiswa
health_records        → Rekam kesehatan
organization_histories → Riwayat organisasi
aspirations           → Aspirasi/suara mahasiswa
```

## Tabel Ormawa
```
ormawas               → Data organisasi mahasiswa
ormawa_members        → Anggota ormawa
ormawa_divisions      → Divisi ormawa
ormawa_proposals      → Proposal kegiatan
ormawa_finances       → Keuangan
ormawa_attendances    → Absensi
ormawa_announcements  → Pengumuman
ormawa_agendas        → Agenda kegiatan
```

---

# 🔑 Environment Variables (.env)

| Variable | Fungsi |
|----------|--------|
| `DB_HOST` | Host database PostgreSQL |
| `DB_PORT` | Port database |
| `DB_USER` | Username database |
| `DB_PASSWORD` | Password database |
| `DB_NAME` | Nama database |
| `JWT_SECRET` | Secret key untuk sign JWT token |
| `PORT` | Port server backend berjalan |
| `BASE_URL` | Base URL server (untuk generate URL file upload) |

---

# 📡 API Endpoints Utama

## Auth
```
POST /auth/login          → Login semua role
POST /auth/register       → Register mahasiswa
```

## Mahasiswa
```
GET  /mahasiswa/dashboard → Data dashboard
GET  /mahasiswa/profile   → Profil mahasiswa
PUT  /mahasiswa/profile   → Update profil
GET  /mahasiswa/psychologists → List psikolog aktif
GET  /mahasiswa/psychologists/:id/slots → Jadwal psikolog
POST /mahasiswa/bookings  → Booking konseling
GET  /mahasiswa/bookings  → Riwayat booking
GET  /mahasiswa/medical-records → Rekam medis sendiri
```

## Psikolog
```
GET  /psychologist/me           → Profil psikolog
PUT  /psychologist/profile      → Update profil (termasuk is_aktif)
GET  /psychologist/dashboard    → Data dashboard
GET  /psychologist/bookings     → List booking
PUT  /psychologist/bookings/:id/status → Update status booking
GET  /psychologist/schedules    → Jadwal psikolog
PUT  /psychologist/schedules    → Simpan jadwal
GET  /psychologist/patients     → List pasien
GET  /psychologist/patients/:id/medical-record → Rekam medis pasien
POST /psychologist/patients/:id/session-notes  → Buat catatan sesi
GET  /psychologist/assessments  → List asesmen
POST /psychologist/assessments  → Buat asesmen
GET  /psychologist/analytics    → Data analitik
GET  /psychologist/reports      → List laporan
POST /psychologist/reports      → Buat laporan
```

## Ormawa
```
GET  /ormawa/dashboard    → Dashboard ormawa
GET  /ormawa/proposals    → List proposal
POST /ormawa/proposals    → Buat proposal
GET  /ormawa/finance      → Data keuangan
POST /ormawa/finance      → Tambah transaksi
GET  /ormawa/members      → List anggota
... (dan banyak lagi)
```

---

# 🛠️ Tech Stack

## Backend
- **Language**: Go 1.21+
- **Framework**: Fiber v2
- **ORM**: GORM
- **Database**: PostgreSQL
- **Auth**: JWT (golang-jwt)
- **Password**: bcrypt

## Mobile
- **Language**: Dart
- **Framework**: Flutter
- **State Management**: Provider
- **Routing**: GoRouter
- **HTTP Client**: Dio
- **Local Storage**: SharedPreferences

---

*Dokumentasi ini dibuat otomatis berdasarkan analisis struktur proyek.*
*Last updated: Mei 2026*

# Dokumentasi Komprehensif Project SIAKAD

Dokumen ini disusun berdasarkan pembacaan langsung codebase di repository `Siakad` untuk memastikan pemahaman fitur, arsitektur, dan gaya UI/UX yang konsisten sebelum pengembangan lanjutan.

---

## 1) Ringkasan Eksekutif

Project saat ini berada pada fase **fondasi produk**:

- Frontend sudah memiliki banyak halaman dan dashboard per role dengan kualitas visual yang cukup matang.
- Backend sudah menyiapkan koneksi database PostgreSQL, model inti, migrasi otomatis, dan endpoint health-check.
- Blueprint bisnis dan RBAC sangat detail (sesuai dokumen arsitektur), namun implementasi logika bisnis real-time masih awal.

Kesimpulan: project sangat siap untuk masuk ke fase **integrasi fungsional (Auth, RBAC, CRUD modul utama, API binding)** dengan tetap menjaga konsistensi desain.

---

## 2) Struktur Project (As-Is)

### 2.1 Root

- `frontend/` — Aplikasi React + Vite + Tailwind CSS v4.
- `backend/` — API Golang (Fiber) + GORM + PostgreSQL.
- Halaman HTML statis di root (`landing.html`, `login.html`, dll) sebagai artefak atau referensi desain awal.
- Dokumen arsitektur:
  - `README_SIAKAD.md`
  - `README_SUPERADMIN.md`

### 2.2 Frontend

- Entrypoint: `frontend/src/main.jsx`
- Router: `frontend/src/App.jsx`
- Theme/token: `frontend/src/index.css`
- Halaman publik:
  - Landing (`frontend/src/pages/Landing`)
  - About (`frontend/src/pages/About`)
  - Academic (`frontend/src/pages/Academic`)
  - Services (`frontend/src/pages/Services`)
  - Login (`frontend/src/pages/Login/Login.jsx`)
- Halaman dashboard role:
  - Super Admin (`frontend/src/pages/SuperAdmin`)
  - Faculty Admin (`frontend/src/pages/FacultyAdmin`)
  - Ormawa Admin (`frontend/src/pages/OrmawaAdmin`)
  - Student (`frontend/src/pages/Student`)

### 2.3 Backend

- Entrypoint server: `backend/main.go`
- Koneksi DB + migrasi: `backend/config/database.go`
- Domain model awal: `backend/models/models.go`

---

## 3) Arsitektur Fungsional dan RBAC (Target Blueprint)

Mengacu `README_SIAKAD.md`, sistem memiliki 5 role utama:

1. Super Admin
2. Admin Fakultas
3. Dosen/Lecturer
4. Admin Ormawa
5. Mahasiswa

Blueprint sudah memetakan modul akses dan alur bisnis: user management, kurikulum, jadwal, KRS/KHS, keuangan UKT, proposal ormawa, fasilitas, approval pipeline, audit log, hingga bypass override.

Dokumen `README_SUPERADMIN.md` memperjelas dampak lintas role dari aksi super admin (kalender akademik, financial blocker, infrastruktur master, legalitas ormawa, dan immutable logs).

Status saat ini di code:

- **Blueprint siap** dan kaya konteks bisnis.
- **Implementasi backend nyata** baru sampai fondasi model + health check.

---

## 4) Fitur yang Sudah Tersedia (Implementasi Nyata)

### 4.1 Frontend (Sudah Ada)

#### Public Experience

- Landing page modular (Hero, Gateways, Features, Timeline, Footer).
- Halaman About, Academic, Services dengan pattern visual seragam.
- Navbar reusable dan Footer reusable untuk konsistensi.

#### Login

- UI login modern dengan status koneksi backend (`/api/health`).
- Belum ada autentikasi sesungguhnya (JWT/session) dan submit kredensial ke API.

#### Dashboard per Role

- Super Admin: panel analytics, quick controls, audit logs (UI statis).
- Faculty Admin: panel course management, student records, alerts (UI statis).
- Ormawa Admin: event/proposal tracker, quick actions, activity feed (UI statis).
- Student: progress akademik, jadwal, deadline, grades, advisor card, mobile bottom nav (UI statis).

### 4.2 Backend (Sudah Ada)

- Fiber app aktif dengan middleware logger + CORS.
- Endpoint `GET /api/health` untuk cek koneksi backend + DB ping.
- Koneksi PostgreSQL via env.
- AutoMigrate untuk model:
  - `Role`
  - `User`
  - `Faculty`
  - `Major`
  - `Lecturer`
  - `Student`

---

## 5) Gap Analisis (Blueprint vs Implementasi)

### 5.1 Auth & Security

Belum ada:

- endpoint login/logout,
- hashing/verification password end-to-end,
- JWT issuance/refresh,
- middleware authorize berbasis role/permission,
- proteksi route frontend.

### 5.2 Domain Modules

Belum ada endpoint/fitur nyata untuk:

- KRS/KHS,
- Jadwal kuliah,
- Kurikulum/mata kuliah,
- Keuangan UKT,
- Proposal/LPJ Ormawa,
- Booking fasilitas,
- Audit log operasional.

### 5.3 Data Binding

Dashboard saat ini masih mock/static data, belum tersambung API riil.

### 5.4 Konsistensi Token UI

Ditemukan penggunaan class semantic yang perlu distandarkan terhadap token global agar tidak drift:

- contoh class yang dipakai di banyak komponen: `text-secondary`, `bg-secondary`, `bg-surface-container-lowest`, `text-on-secondary-container`, `text-primary-fixed-variant`;
- terdapat class custom font seperti `font-plus-jakarta` di salah satu komponen yang belum menjadi token umum global.

Catatan: agar stabil lintas halaman, semua class semantic perlu satu sumber kebenaran di theme/token layer.

---

## 6) Style Memory Resmi Project (Acuan Konsistensi)

Bagian ini dijadikan standar desain yang harus dipertahankan di seluruh fitur baru.

### 6.1 Brand Direction

- Persona visual: **academic, modern, premium, clean**.
- Dominan warna biru-navy untuk authority/trust.
- Surface terang untuk keterbacaan tinggi.
- Aksen glass/blur dipakai seperlunya untuk depth, bukan berlebihan.

### 6.2 Typography

- Headline: `Plus Jakarta Sans` (tegas, modern, institusional).
- Body/Label: `Inter` (netral, terbaca baik pada data-dense dashboard).

### 6.3 Color System (Semantic First)

Gunakan semantic token dari `frontend/src/index.css`, bukan hardcoded color kecuali ada alasan khusus.

Contoh kelompok token:

- Primary family: `primary`, `primary-container`, `primary-fixed`, `on-primary`, dst.
- Surface family: `surface`, `background`, `surface-container-*`.
- Status/alert: `error`, `on-error-container`.
- Text hierarchy: `on-surface`, `on-surface-variant`, `outline`.

### 6.4 Spacing, Radius, Elevation

- Gunakan rhythm spacing konsisten (4/6/8/10/12/16 dsb).
- Radius dominan medium-large (`rounded-xl`, `rounded-2xl`, `rounded-3xl`).
- Shadow lembut (`shadow-sm` sampai `shadow-xl`) untuk layering kartu/informasi.

### 6.5 Motion dan Interaksi

- Gunakan micro-interaction halus (`hover`, `active`, `focus`) yang meaningful.
- Hindari animasi berlebihan; transisi 150-500ms sebagai baseline.
- Fokus aksesibilitas: state hover/focus harus jelas terlihat.

### 6.6 Layout Pattern

#### Public pages

- Hero besar + narrative section + CTA + footer.
- Navbar reusable.

#### Dashboard pages

- Sidebar tetap (desktop), topbar sticky/fixed, konten utama dalam card/bento sections.
- Untuk mobile, gunakan pola fallback (contoh Student bottom nav).

---

## 7) Aturan Konsistensi UI/UX (Wajib Diikuti)

1. **Token-first styling**
   - Prioritaskan class semantic token.
   - Hindari hardcoded `text-blue-900`, `bg-slate-*` bila sudah ada padanan semantic.

2. **Komponen reusable dulu**
   - Navbar, Footer, Sidebar, Topbar, Card metric, table shells, badge status.

3. **Role-based visual coherence**
   - Semua dashboard tetap satu bahasa visual, cukup beda aksen konteks konten.

4. **State standardization**
   - Status badge gunakan standar: success/pending/error/info dengan warna konsisten.

5. **Responsive baseline**
   - Minimal dukungan mobile untuk halaman yang kemungkinan dipakai harian (Student, Login, Services).

6. **Accessibility baseline**
   - Kontras warna cukup, fokus keyboard terlihat, ukuran teks minimum layak baca.

---

## 8) Backlog Implementasi Prioritas (Direkomendasikan)

### Tahap 1 — Fondasi Akses

- Implement Auth API (`/auth/login`, `/auth/me`, `/auth/logout`).
- Password hashing + token JWT.
- Frontend `AuthContext` + route guard per role.
- Redirect otomatis berdasarkan role setelah login.

### Tahap 2 — Core Admin Data

- CRUD User + Role assignment.
- CRUD Fakultas + Prodi.
- Validasi query scope per role (contoh `faculty_id`).

### Tahap 3 — Akademik Inti

- Mata kuliah + kelas + jadwal.
- KRS submit/approve/reject.
- Input nilai + lock nilai.

### Tahap 4 — Ekstensi Kampus

- Proposal ormawa + pipeline approval.
- Modul fasilitas dan booking.
- Dashboard metrics dinamis berbasis API.

### Tahap 5 — Operasional & Audit

- Activity log immutable.
- Monitoring health + error tracking.
- Hardening CORS, auth middleware, dan policy check.

---

## 9) Risiko Teknis Saat Ini

1. **Kesenjangan ekspektasi**: UI terlihat “siap produksi” tapi logic backend belum lengkap.
2. **Inkonistensi style**: campuran semantic token dan hardcoded dapat menimbulkan drift.
3. **Akses tanpa guard**: dashboard role dapat dibuka via route tanpa otorisasi.
4. **Data integrity belum terjaga**: belum ada domain validation rule di modul utama.

Mitigasi cepat: selesaikan Auth+RBAC terlebih dulu sebelum memperluas fitur CRUD.

---

## 10) Definition of Done (DoD) per Modul Baru

Setiap modul dianggap selesai bila memenuhi:

1. **Fungsional**: endpoint + UI + validasi berjalan.
2. **Keamanan**: role permission tervalidasi backend dan route guard frontend.
3. **Konsistensi UI**: memakai token/komponen standar project.
4. **Responsif**: layout tetap usable di mobile/tablet/desktop.
5. **Kualitas**: lint clean, tidak ada error runtime, handling state loading/error/empty tersedia.

---

## 11) Lampiran: Referensi File Kritis

### Frontend

- `frontend/src/App.jsx` — peta route aplikasi.
- `frontend/src/index.css` — token warna/font/utility.
- `frontend/src/pages/Login/Login.jsx` — login UI + health-check ping.
- `frontend/src/pages/Landing/*` — pola halaman publik utama.
- `frontend/src/pages/*Dashboard*` — pola dashboard role.

### Backend

- `backend/main.go` — server bootstrap + middleware + health route.
- `backend/config/database.go` — DB connection + automigrate.
- `backend/models/models.go` — model domain inti.

### Dokumen Arsitektur

- `README_SIAKAD.md` — blueprint RBAC dan roadmap.
- `README_SUPERADMIN.md` — interkoneksi kewenangan super admin.

---

## 12) Penutup

Project SIAKAD saat ini memiliki pondasi visual dan arah produk yang sangat baik. Agar siap masuk fase produksi, prioritas harus diarahkan pada **implementasi Auth+RBAC**, **integrasi API domain inti**, dan **penegakan design system berbasis semantic token** agar seluruh pengembangan berikutnya tetap konsisten, aman, dan scalable.

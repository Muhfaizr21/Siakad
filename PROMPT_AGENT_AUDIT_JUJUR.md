# PROMPT UNTUK AI AGENT — Audit Jujur BKU Hub (FE + BE + DB)

---

## INSTRUKSI UTAMA

Lakukan audit menyeluruh terhadap project BKU Hub. **Saya minta kejujuran penuh.** Jika ada masalah di frontend, backend, atau database — sebutkan apa adanya. Jangan diperhalus, jangan disembunyikan, jangan bilang "sudah bagus" kalau memang ada yang bermasalah.

Format laporan harus jelas: masalah apa, ada di mana (file + baris jika bisa), seberapa parah (kritis / sedang / minor), dan rekomendasi solusinya.

---

## KONTEKS YANG SUDAH DIKETAHUI SEBELUM AUDIT

Dari analisis awal yang sudah dilakukan, ditemukan beberapa hal yang perlu dikonfirmasi kebenarannya di lapangan:

**Frontend (React + Vite):**
- `fetchWithAuth` di `src/services/api.js` tidak menangani response `401` secara otomatis — tidak ada auto-logout atau refresh token mechanism
- `OrmawaAdmin` (16 file) masih mengimport dari `../FacultyAdmin/components/` yang seharusnya sudah dihapus
- Beberapa halaman menggunakan `catch {}` kosong tanpa penanganan error yang proper
- Tidak ada cleanup function pada beberapa `useEffect` yang fetch data, berpotensi race condition
- Tidak ada `AbortController` untuk cancel fetch saat komponen unmount

**Backend & Database:**
- Gue tidak punya akses ke source code backend, jadi agent harus audit sendiri secara menyeluruh

---

## AREA YANG HARUS DIAUDIT

### BAGIAN 1 — Frontend Audit

#### 1A. Import & Komponen

Jalankan perintah berikut dan laporkan hasilnya apa adanya:

```bash
# Cek sisa import bermasalah
grep -r "from.*FacultyAdmin/components" src/pages/ --include="*.jsx" -l
grep -r "from.*\./components/[a-z]" src/pages/ --include="*.jsx" | grep -v "Layout\|Sidebar\|TopNav\|Modal\|Delete"

# Cek build
npm run build 2>&1 | tail -20
```

Laporkan: berapa file yang masih bermasalah, apakah build sukses atau ada error.

#### 1B. Error Handling & Fetch Pattern

Cek pola fetch di semua halaman utama. Yang harus dilaporkan:

1. **Halaman mana yang pakai `catch {}` kosong** (error ditelan tanpa feedback ke user):
```bash
grep -rn "catch\s*{}" src/pages/ --include="*.jsx" | grep -v node_modules
```

2. **Halaman mana yang tidak punya loading state** saat fetch data:
```bash
# Cek halaman yang fetch tapi tidak punya setLoading
grep -rL "setLoading\|isLoading\|loading" src/pages/SuperAdmin/ src/pages/FacultyAdmin/ src/pages/OrmawaAdmin/ --include="*.jsx"
```

3. **Apakah ada AbortController atau cleanup** di useEffect yang fetch:
```bash
grep -rn "AbortController\|controller.abort\|return.*cleanup" src/pages/ --include="*.jsx" | head -20
```

4. **401 handling**: buka `src/services/api.js` — apakah `fetchWithAuth` atau `handleResponse` menangani status 401 dengan redirect ke login atau auto-logout? Laporkan apa adanya.

5. **Refresh token**: apakah ada mekanisme refresh token di `useAuthStore` atau `api.js`? Jika tidak ada, sebutkan sebagai gap kritis.

#### 1C. Data Statis / Mock yang Belum Connect ke Backend

Cari halaman yang masih pakai data hardcoded atau array statis sebagai pengganti data dari API:

```bash
grep -rn "const.*=\s*\[{" src/pages/ --include="*.jsx" | grep -v "node_modules\|columns\|tabs\|menu\|nav\|TABS\|FONTS\|preset\|filter" | head -30
```

Untuk setiap halaman yang ditemukan, sebutkan:
- Nama halaman
- Data apa yang masih statis
- Apakah endpoint API-nya sudah ada di `src/services/api.js` atau belum sama sekali

#### 1D. Halaman yang Masih Placeholder / Belum Dikerjakan

Buka dan periksa file berikut — laporkan apakah isinya sudah functional atau hanya UI kosong:
- `src/pages/SuperAdmin/GamifikasiOrmawa.jsx`
- `src/pages/FacultyAdmin/Konten.jsx`
- `src/pages/FacultyAdmin/ProdiUsers.jsx`
- `src/pages/SuperAdmin/ReportsGenerator.jsx` (atau nama file serupa)

#### 1E. Konsistensi Pola Kode

Periksa apakah ada inkonsistensi pola yang bisa menyebabkan bug:

```bash
# Halaman yang masih pakai fetch langsung (bukan service function)
grep -rn "fetch(\`\${API_BASE_URL}" src/pages/ --include="*.jsx" | grep -v "api.js" | head -20

# Halaman yang masih pakai fetchWithAuth langsung (bukan service)  
grep -rn "fetchWithAuth(\`\${API_BASE_URL}" src/pages/ --include="*.jsx" | head -20
```

Ini inkonsistensi — idealnya semua call melalui service function, bukan direct fetch dari komponen.

---

### BAGIAN 2 — Backend Audit

Buka folder backend dan lakukan audit menyeluruh. Laporkan semua temuan apa adanya.

#### 2A. Endpoint Coverage

Buat daftar semua endpoint yang dipanggil dari `src/services/api.js` di frontend, lalu bandingkan dengan route yang benar-benar ada di backend. Laporkan:

- **Endpoint yang dipanggil FE tapi TIDAK ADA di BE** — ini akan menyebabkan 404 di production
- **Endpoint yang ada di BE tapi tidak dipanggil FE** — mungkin dead code atau belum diintegrasikan

Endpoint FE yang harus ada di BE (ambil dari `src/services/api.js`):
```
/api/public/theme                    GET
/api/admin/theme                     GET, PUT
/api/admin/theme/reset               POST
/api/admin/theme/upload-logo         POST
/api/admin/theme/upload-favicon      POST
/api/admin/stats                     GET
/api/admin/audit-logs                GET
/api/admin/fakultas                  GET, POST, PUT/:id, DELETE/:id
/api/admin/prodi                     GET, POST, PUT/:id, DELETE/:id
/api/admin/students                  GET, POST, PUT/:id, DELETE/:id
/api/admin/users                     GET, POST, DELETE/:id
/api/admin/users/role                PUT
/api/admin/rbac/roles                GET
/api/admin/psychologists             GET, PUT/:id, DELETE/:id
/api/admin/psychologists/:id/schedules   GET, POST
/api/admin/tenagakes                 GET, PUT/:id, DELETE/:id
/api/admin/tenagakes/:id/schedules   GET, POST
/api/admin/ormawa                    GET, POST, PUT/:id, DELETE/:id
/api/admin/aspirations               GET
/api/admin/aspirations/:id/status    PUT
/api/admin/proposals                 GET
/api/admin/proposals/:id/approve     PUT
/api/admin/proposals/:id/reject      PUT
/api/admin/scholarships              GET, POST, PUT/:id, DELETE/:id
/api/admin/scholarship-applications  GET
/api/admin/scholarship-applications/:id/status  PUT
/api/psychologist/me                 GET
/api/psychologist/dashboard          GET
/api/psychologist/bookings           GET
/api/psychologist/bookings/:id       GET
/api/psychologist/bookings/:id/status PUT
/api/psychologist/schedules          GET, PUT
/api/psychologist/patients           GET
/api/psychologist/patients/:id/medical-record GET
/api/psychologist/patients/:id/session-notes  POST
/api/psychologist/assessments        GET, POST
/api/psychologist/analytics          GET
/api/psychologist/referrals          GET, POST
/api/psychologist/referrals/:id/send POST
/api/psychologist/referrals/:id/confirm-received POST
/api/psychologist/referrals/:id/download GET
/api/psychologist/session-notes/:id/export-pdf GET
/api/psychologist/patients/export-pdf GET
/api/psychologist/notifications      GET
/api/psychologist/notifications/:id/read PUT
/api/psychologist/notifications/read-all PUT
/api/psychologist/notifications/:id DELETE
/api/tenagakes/me                    GET
/api/tenagakes/dashboard             GET
/api/tenagakes/schedules             GET, POST, PUT/:id, DELETE/:id
/api/tenagakes/bookings              GET
/api/tenagakes/bookings/:id          GET
/api/tenagakes/bookings/:id/status   PUT
/api/tenagakes/patients              GET
/api/tenagakes/patients/:id/medical-record GET
/api/tenagakes/patients/:id/screening POST
/api/tenagakes/students/lookup       GET
/api/tenagakes/reports/export-excel  GET
/api/tenagakes/reports/export-pdf    GET
/api/ormawa/stats                    GET
/api/ormawa/events                   GET, POST, PUT/:id, DELETE/:id
/api/ormawa/members                  GET, POST, PUT/:id, DELETE/:id
/api/ormawa/divisions                GET
/api/ormawa/students                 GET
/api/ormawa/proposals                GET, POST, PUT/:id, DELETE/:id
/api/ormawa/proposals/:id/history    GET
/api/ormawa/kas                      GET, POST
/api/ormawa/lpjs                     GET, POST, PUT/:id
/api/ormawa/lpjs/:id/documents       POST
/api/ormawa/lpjs/documents/:id       DELETE
/api/ormawa/attendance/:eventId      GET
/api/ormawa/attendance               POST
/api/ormawa/aspirations              GET, POST
/api/ormawa/announcements            GET, POST, PUT/:id, DELETE/:id
/api/ormawa/notifications            GET
/api/public/theme                    GET
```

#### 2B. Keamanan & Autentikasi

Periksa hal-hal berikut di backend dan laporkan apa adanya:

1. **Apakah semua endpoint yang butuh autentikasi sudah dilindungi middleware auth?**
   - Khususnya endpoint `/api/admin/*` dan `/api/psychologist/*` — apakah ada yang lupa pakai middleware?

2. **Apakah ada validasi role?** Endpoint `/api/admin/*` seharusnya hanya bisa diakses user dengan role `super_admin`. Jika tidak ada role guard, sebutkan sebagai celah keamanan kritis.

3. **Apakah JWT secret disimpan dengan aman?** Cek apakah ada hardcoded secret di kode (bukan di `.env`).

4. **Apakah password di-hash?** Cek proses registrasi/update password — apakah menggunakan bcrypt atau sejenisnya.

5. **Apakah ada rate limiting** pada endpoint login untuk mencegah brute force?

6. **CORS**: apakah konfigurasi CORS sudah restrictive (hanya allow domain yang diperlukan) atau masih `*`?

#### 2C. Validasi Input

Periksa endpoint yang menerima input dari user (POST/PUT):

1. Apakah ada validasi input (misalnya dengan Joi, express-validator, Zod, atau sejenisnya)?
2. Apakah ada sanitasi untuk mencegah SQL injection atau XSS?
3. Untuk endpoint upload file (logo, favicon, dokumen LPJ) — apakah ada validasi tipe file dan ukuran maksimum?

#### 2D. Error Handling Backend

1. Apakah ada global error handler?
2. Apakah error message yang dikirim ke client terlalu verbose (expose stack trace atau nama tabel database)?
3. Apakah endpoint yang tidak ditemukan mengembalikan response JSON atau HTML error page?

#### 2E. Performa & Potensi N+1 Query

Periksa query database di endpoint-endpoint berikut yang berpotensi lambat:

- `/api/admin/students` — apakah melakukan join ke tabel prodi dan fakultas?
- `/api/psychologist/patients` — apakah mengambil semua booking dalam satu query atau per-pasien?
- `/api/admin/audit-logs` — apakah ada pagination atau ambil semua sekaligus?
- `/api/ormawa/members` — apakah ada lazy loading atau eager loading?

Laporkan jika ada query yang berpotensi N+1 atau query tanpa index.

---

### BAGIAN 3 — Database Audit

#### 3A. Schema & Relasi

Periksa file migration atau schema database dan laporkan:

1. **Apakah semua tabel yang dibutuhkan sudah ada?** Berdasarkan fitur yang ada di FE, tabel minimal yang harus ada:
   - `users`, `mahasiswa`, `fakultas`, `prodi`
   - `psychologists`, `psychologist_schedules`, `psychologist_bookings`
   - `tenaga_kesehatan`, `tk_schedules`, `tk_bookings`
   - `ormawa`, `ormawa_members`, `ormawa_events`, `ormawa_attendance`
   - `ormawa_proposals`, `ormawa_kas`, `ormawa_lpj`
   - `scholarships`, `scholarship_applications`
   - `aspirations`, `announcements`, `notifications`
   - `theme_settings`
   - `audit_logs`

2. **Apakah relasi foreign key sudah benar?** (misal: `psychologist_bookings.mahasiswa_id` → `mahasiswa.id`)

3. **Apakah ada tabel yang missing** yang menyebabkan endpoint backend return error?

#### 3B. Index

Periksa apakah kolom yang sering digunakan untuk filter/search sudah punya index:
- `mahasiswa.nim` — sering dicari
- `bookings.status` — sering difilter
- `bookings.mahasiswa_id` — foreign key
- `audit_logs.created_at` — sering diurutkan
- `notifications.user_id` — sering difilter per user

Jika tidak ada index pada kolom-kolom di atas, sebutkan sebagai masalah performa.

#### 3C. Data Seeding / Initial Data

1. Apakah ada seeder untuk data awal? (minimal: user super_admin default, tema default, data fakultas dan prodi UBK)
2. Jika tidak ada seeder, cara apa yang digunakan untuk setup pertama kali?

---

## FORMAT LAPORAN YANG DIMINTA

Tulis laporan dengan format berikut:

```
# LAPORAN AUDIT BKU HUB

## Ringkasan Eksekutif
[2-3 paragraf kondisi overall project — jujur]

## 🔴 Masalah Kritis (harus diperbaiki sebelum production)
[list dengan format: Masalah | Lokasi | Dampak | Solusi]

## 🟡 Masalah Sedang (penting tapi tidak blocking)
[list dengan format: Masalah | Lokasi | Dampak | Solusi]

## 🟢 Minor / Nice to Have
[list]

## Frontend — Temuan Detail
[per bagian 1A sampai 1E]

## Backend — Temuan Detail
[per bagian 2A sampai 2E]

## Database — Temuan Detail
[per bagian 3A sampai 3C]

## Kesimpulan
Apakah project ini siap untuk:
- [ ] Demo internal (ke Pa Agam dan tim)?
- [ ] UAT (User Acceptance Testing) dengan mahasiswa?
- [ ] Production deployment?

Jika belum siap, sebutkan apa yang harus diselesaikan terlebih dahulu.
```

---

## PESAN PENTING

Saya lebih suka tahu masalahnya sekarang daripada kena masalah saat demo atau production. **Tolong jangan memperhalus temuan.** Jika ada 10 endpoint yang belum ada di backend, sebutkan semua 10. Jika ada celah keamanan, sebutkan dengan jelas. Kejujuran audit ini akan menentukan prioritas pekerjaan selanjutnya.

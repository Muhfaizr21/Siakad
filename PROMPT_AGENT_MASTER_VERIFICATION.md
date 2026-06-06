# PROMPT UNTUK AI AGENT — Master Verification & Fix Semua Halaman BKU Hub

---

## ATURAN WAJIB SEBELUM MULAI

**SETIAP FASE harus selesai 100% dan laporan walkthrough sudah ditulis SEBELUM melanjutkan ke fase berikutnya.**

**Setelah setiap fase selesai, BERHENTI dan TUNGGU persetujuan dari saya (owner) sebelum lanjut.**

Format laporan wajib setiap akhir fase:
```
## ✅ FASE [N] SELESAI — [Nama Fase]

### Yang dikerjakan:
- [list konkret perubahan file per file]

### Hasil verifikasi:
- Build status: ✅ sukses / ❌ error
- Import bermasalah tersisa: [jumlah atau "tidak ada"]

### Menunggu persetujuan untuk lanjut ke Fase [N+1]: [nama fase berikutnya]
```

**JANGAN lanjut ke fase berikutnya tanpa konfirmasi eksplisit dari saya.**

---

## KONTEKS PROJECT

Project React + Vite bernama **BKU Hub** — sistem informasi kampus Universitas Bhakti Kencana. Sudah dilakukan konsolidasi komponen UI sebelumnya, namun proses tersebut **tidak sepenuhnya berhasil**. Beberapa file masih mengimport dari path yang salah dan perlu diperbaiki sebelum pengembangan fitur lanjutan.

### Sistem global komponen yang benar:
Semua komponen UI harus diimport dari `@/components/ui/` — bukan dari folder lokal per-role.

Contoh import yang **BENAR**:
```js
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
```

Contoh import yang **SALAH** (harus diperbaiki):
```js
import { Button } from './components/button'              // lokal FacultyAdmin
import { Badge } from '../FacultyAdmin/components/badge'  // lintas folder
import { Card } from '../../components/ui/card'           // path relatif bukan alias
```

---

## FASE 1 — Fix Import Bermasalah yang Tersisa

**Prioritas tertinggi.** Ditemukan bahwa konsolidasi sebelumnya tidak menyelesaikan semua file. Ada 3 kelompok file yang masih bermasalah.

### 1A — OrmawaAdmin (16 file masih import dari FacultyAdmin/components)

File-file berikut masih mengimport dari `../FacultyAdmin/components/` yang seharusnya sudah tidak boleh dipakai:

- `OrmawaDashboard.jsx`
- `AnggotaManagement.jsx`
- `ProposalManagement.jsx`
- `JadwalKegiatan.jsx`
- `AbsensiKegiatan.jsx`
- `KeuanganKas.jsx`
- `LpjManagement.jsx`
- `Pengumuman.jsx`
- `StrukturOrganisasi.jsx`
- `RoleBasedAccess.jsx`
- `Recruitment.jsx`
- `StaffManagement.jsx`
- `Settings.jsx`
- `Notifikasi.jsx`
- `AspirationManagement.jsx`

**Yang harus dilakukan:** Ganti semua import `from '../FacultyAdmin/components/X'` menjadi `from '@/components/ui/X'`.

### 1B — FacultyAdmin (beberapa file masih import lokal)

File-file berikut masih mengimport dari `./components/`:
- `ProdiRBAC.jsx` — import badge, button, card, dialog, input, label, data-table
- `Psikolog.jsx` — import avatar, select, button
- `Pkkmb.jsx` — import select, button
- `Beasiswa.jsx` — import select, button
- `Settings.jsx` — import button, input, label
- `Prodi.jsx` — import data-table, badge, dan `responsive-layout` (khusus: ganti dengan komponen global yang setara)

**Catatan untuk `responsive-layout`:** `Prodi.jsx` mengimport `PageContainer`, `PageHeader`, `ResponsiveGrid`, `ResponsiveCard` dari `./components/responsive-layout`. Komponen ini sudah dipindahkan ke `@/components/ui/ResponsiveLayout`. Ganti importnya.

### 1C — Student (1 file masih import dari FacultyAdmin)

- `PresensiPage.jsx` — masih import `Button` dan `Card` dari `../FacultyAdmin/components/`

**Yang harus dilakukan:** Ganti ke `@/components/ui/Button` dan `@/components/ui/Card`.

### Verifikasi Fase 1:
Setelah semua selesai, jalankan:
```bash
grep -r "from.*FacultyAdmin/components" src/pages/ --include="*.jsx"
grep -r "from.*\./components/[a-z]" src/pages/ --include="*.jsx" | grep -v "Layout\|Sidebar\|TopNav"
npm run build
```
Keduanya harus mengembalikan hasil kosong. Build harus sukses 0 error.

---

## FASE 2 — Verifikasi Visual SuperAdmin (20 halaman)

Buka dan periksa setiap halaman SuperAdmin. Untuk setiap halaman, pastikan:
1. Tidak ada error di console browser
2. Komponen-komponen (tabel, badge, card, dialog, button) tampil normal
3. Warna mengikuti tema (menggunakan `var(--theme-primary)` dll, bukan hardcoded)

**Daftar halaman yang harus diperiksa:**

| Route | Komponen | Yang dicek |
|-------|----------|------------|
| `/admin` | `AdminDashboard.jsx` | Stats card, chart, tabel aktivitas |
| `/admin/rbac` | `UserManagement.jsx` | DataTable, Badge status, Dialog tambah user |
| `/admin/faculties` | `KelolaFakultas.jsx` | DataTable, form tambah/edit |
| `/admin/prodi` | `KelolaProdi.jsx` | DataTable, form |
| `/admin/scholarships` | `KelolaBeasiswa.jsx` | DataTable, badge, dialog |
| `/admin/achievements` | `KelolaPrestasi.jsx` | DataTable, form |
| `/admin/organizations` | `KelolaOrganisasi.jsx` | DataTable, form |
| `/admin/students` | `StudentDirectory.jsx` | DataTable, filter |
| `/admin/psychologists` | `PsychologistDirectory.jsx` | DataTable, badge |
| `/admin/tenagakes` | `TenagaKesehatanDirectory.jsx` | DataTable, badge |
| `/admin/aspirations` | `AspirationControl.jsx` | DataTable, badge status |
| `/admin/proposals` | `ProposalPipeline.jsx` | DataTable, status flow |
| `/admin/insurance` | `InsuranceManagement.jsx` | DataTable, form |
| `/admin/announcements` | `ContentManagement.jsx` | Form editor, preview |
| `/admin/audit` | `AuditLog.jsx` | DataTable, filter tanggal |
| `/admin/security` | `SecuritySettings.jsx` | Form settings, toggle |
| `/admin/reports` | `ReportsGenerator.jsx` | Filter, export button |
| `/admin/performance` | `AdminPerformance.jsx` | Charts, stats |
| `/admin/profile` | `Profile.jsx` | Form profil, upload foto |
| `/admin/gamifikasi` | `GamifikasiOrmawa.jsx` | UI mockup (belum ada backend) |

**Untuk setiap halaman yang ditemukan masalah** (broken component, error console, layout rusak), perbaiki langsung di file tersebut.

**Laporan Fase 2 harus mencantumkan:**
- Tabel: nama halaman | status (✅ oke / ⚠️ diperbaiki / ❌ broken)
- Deskripsi singkat fix yang dilakukan per halaman yang bermasalah

---

## FASE 3 — Verifikasi Visual FacultyAdmin (17 halaman)

Sama seperti Fase 2, periksa dan perbaiki semua halaman FacultyAdmin.

| Route | File | Yang dicek |
|-------|------|------------|
| `/faculty/dashboard` | `FacultyDashboard.jsx` | Stats, tabel, chart |
| `/faculty/mahasiswa` | `Mahasiswa.jsx` | DataTable, filter, import CSV |
| `/faculty/prodi` | `Prodi.jsx` | DataTable, form CRUD |
| `/faculty/rbac` | `ProdiRBAC.jsx` | Role matrix, tabel |
| `/faculty/prodi-users` | `ProdiUsers.jsx` | DataTable |
| `/faculty/jadwal` | `TahunAkademik.jsx` | Form tahun akademik |
| `/faculty/psikolog` | `Psikolog.jsx` | DataTable psikolog |
| `/faculty/prestasi` | `Prestasi.jsx` | DataTable, badge, form |
| `/faculty/beasiswa` | `Beasiswa.jsx` | DataTable, filter, form |
| `/faculty/organisasi` | `OrganisasiFakultas.jsx` | DataTable, card |
| `/faculty/ormawa/proposals` | `OrmawaProposals.jsx` | DataTable, approval flow |
| `/faculty/pkkmb` | `Pkkmb.jsx` | DataTable, form |
| `/faculty/kesehatan` | `Kesehatan.jsx` | DataTable, stats |
| `/faculty/aspirasi` | `Aspirasi.jsx` | DataTable, status |
| `/faculty/laporan` | `Laporan.jsx` | Filter, chart, export |
| `/faculty/pengaturan` | `Settings.jsx` | Form settings |
| `/faculty/konten` | `Konten.jsx` | Form konten (UI only) |

---

## FASE 4 — Verifikasi Visual OrmawaAdmin (13 halaman)

| Route | File | Yang dicek |
|-------|------|------------|
| `/ormawa` | `OrmawaDashboard.jsx` | Stats card, aktivitas |
| `/ormawa/anggota` | `AnggotaManagement.jsx` | DataTable, avatar, form |
| `/ormawa/proposal` | `ProposalManagement.jsx` | DataTable, approval flow |
| `/ormawa/jadwal` | `JadwalKegiatan.jsx` | DataTable, calendar |
| `/ormawa/absensi` | `AbsensiKegiatan.jsx` | DataTable, avatar |
| `/ormawa/keuangan` | `KeuanganKas.jsx` | DataTable, form transaksi |
| `/ormawa/lpj` | `LpjManagement.jsx` | DataTable, upload |
| `/ormawa/pengumuman` | `Pengumuman.jsx` | Form, DataTable |
| `/ormawa/struktur` | `StrukturOrganisasi.jsx` | Tree/chart struktur, form |
| `/ormawa/rbac` | `RoleBasedAccess.jsx` | Role matrix |
| `/ormawa/notifikasi` | `Notifikasi.jsx` | List notifikasi, badge |
| `/ormawa/recruitment` | `Recruitment.jsx` | Form, DataTable |
| `/ormawa/aspirasi` | `AspirationManagement.jsx` | DataTable, status |

---

## FASE 5 — Verifikasi Visual TenagaKesehatan (8 halaman)

| Route | File | Yang dicek |
|-------|------|------------|
| `/tenagakes` | `TenagaKesehatanDashboard.jsx` | Stats, jadwal hari ini |
| `/tenagakes/bookings` | `BookingManagement.jsx` | DataTable booking, status |
| `/tenagakes/schedule` | `ScheduleManagement.jsx` | Kalender jadwal, form |
| `/tenagakes/patients` | `PatientList.jsx` | DataTable pasien |
| `/tenagakes/patients/:id/medical-record` | `PatientMedicalRecord.jsx` | Form rekam medis |
| `/tenagakes/claims` | `InsuranceReview.jsx` | DataTable klaim, approval |
| `/tenagakes/bap` | `BAPManagement.jsx` | DataTable BAP, form |
| `/tenagakes/reports` | `ReportsPage.jsx` | Filter, chart, export |

---

## FASE 6 — Audit Warna Hardcoded di Semua Halaman

Setelah semua halaman visual oke, lakukan audit kode untuk menemukan warna hardcoded yang tidak ikut ThemeStore.

**Yang harus dicari:**
```bash
grep -r "fill=\"#\|stroke=\"#\|color: '#\|backgroundColor: '" src/pages/ --include="*.jsx" | grep -v "node_modules" | grep -v "theme\|var(--"
```

**Untuk setiap warna hardcoded yang ditemukan di chart/grafik:**

Ganti `fill="#2563EB"` atau warna hardcoded lainnya pada komponen Recharts/Chart menjadi membaca dari CSS variable:

```jsx
// Sebelum (hardcoded):
<Bar dataKey="total" fill="#2563EB" />

// Sesudah (dinamis ikut tema):
<Bar dataKey="total" fill="var(--theme-primary)" />
<Line stroke="var(--theme-secondary)" />
<Pie fill="var(--theme-accent)" />
```

**Pengecualian — JANGAN diganti:**
- Warna status semantik yang memang harus tetap (seperti warna merah untuk error di chart, hijau untuk success) — ini boleh hardcoded atau pakai `var(--theme-error)` dll
- Warna di `ThemePreviewModal.jsx` dan file theme — itu memang butuh nilai eksplisit
- Warna putih/hitam murni (`#FFFFFF`, `#000000`, `#fff`, `#000`) untuk teks kontras

---

## FASE 7 — Final Build & Smoke Test

Setelah semua fase selesai:

### 7A — Build produksi
```bash
npm run build
```
Build harus sukses dengan 0 error. Warning boleh ada tapi tidak boleh ada error.

### 7B — Checklist smoke test manual

Buka browser dan lakukan test berikut secara berurutan:

1. **Test ThemeStore end-to-end:**
   - Buka `/admin/theme`
   - Ganti warna primary ke warna berbeda (contoh: `#7C3AED` ungu)
   - Simpan
   - Navigasi ke `/admin`, `/faculty/dashboard`, `/ormawa`, `/tenagakes`
   - Pastikan sidebar, tombol, dan badge di semua halaman berubah warna

2. **Test halaman dengan DataTable:**
   - Buka `/admin/rbac`
   - Pastikan tabel muncul, pagination berfungsi, badge status tampil benar

3. **Test dialog/modal:**
   - Buka `/admin/faculties`
   - Klik tombol tambah
   - Pastikan dialog muncul normal, form bisa diisi

4. **Test role switch:**
   - Login sebagai faculty_admin → akses `/faculty/dashboard`
   - Login sebagai ormawa_admin → akses `/ormawa`
   - Pastikan tidak ada halaman yang blank atau error

### 7C — Laporan final
Tulis ringkasan keseluruhan:
- Total file yang dimodifikasi
- Total import yang diperbaiki
- Halaman yang sebelumnya bermasalah dan sudah diperbaiki
- Halaman yang masih UI-only/mock (belum ada backend integration) — list saja, jangan diubah

---

## CATATAN TEKNIS PENTING

### Path alias
`@/` = `src/`. Selalu gunakan alias ini, bukan path relatif seperti `../../components/ui/`.

### Komponen yang tersedia di `@/components/ui/`
```
Button, Input, Dialog, Select, Tabs, Switch, Textarea, Label,
DataTable, EmptyState, PageHeader, StatCard, StatusBadge,
Skeleton, SkeletonGroups, Badge, Card, CardContent, CardHeader,
CardTitle, CardDescription, CardFooter, Table, Avatar, AvatarImage,
AvatarFallback, Checkbox, DropdownMenu, Tooltip, Popover, Separator,
Spinner, Progress, Form, Breadcrumb, Accordion, Alert, AlertDialog,
Calendar, Drawer, HoverCard, Pagination, RadioGroup, ScrollArea,
Sheet, Slider, Toggle, Toast, Toaster, Sonner, Field, InputGroup,
ButtonGroup, Modal, ResponsiveLayout, DeleteConfirmModal
```

### Layout components (JANGAN dipindah, biarkan di folder masing-masing)
```
FacultyLayout.jsx       → src/pages/FacultyAdmin/components/
SuperAdminLayout.jsx    → src/pages/SuperAdmin/components/
OrmawaLayout.jsx        → src/pages/OrmawaAdmin/components/
PsychologistLayout.jsx  → src/pages/Psychologist/
TenagaKesehatanLayout   → src/pages/TenagaKesehatan/
TopNavBar.jsx           → masing-masing folder (ada versi berbeda per role)
Sidebar.jsx             → src/pages/SuperAdmin/components/
```

### CSS Variables ThemeStore
```css
var(--theme-primary)       /* warna utama */
var(--theme-secondary)     /* warna kedua */
var(--theme-accent)        /* aksen/CTA */
var(--theme-bg)            /* background halaman */
var(--theme-surface)       /* background card/modal */
var(--theme-text)          /* teks utama */
var(--theme-text-muted)    /* teks subtitle */
var(--theme-border)        /* border default */
var(--theme-sidebar-bg)    /* background sidebar */
var(--theme-success)       /* hijau */
var(--theme-warning)       /* kuning */
var(--theme-error)         /* merah */
var(--theme-info)          /* biru */
```

---

## RINGKASAN FASE

| Fase | Nama | Scope | Estimasi |
|------|------|-------|----------|
| 1 | Fix import bermasalah | ~17 file | Kecil, otomatis |
| 2 | Verifikasi SuperAdmin | 20 halaman | Sedang |
| 3 | Verifikasi FacultyAdmin | 17 halaman | Sedang |
| 4 | Verifikasi OrmawaAdmin | 13 halaman | Sedang |
| 5 | Verifikasi TenagaKesehatan | 8 halaman | Kecil |
| 6 | Audit warna hardcoded | Semua halaman | Kecil |
| 7 | Final build & smoke test | - | Kecil |

**Mulai dari Fase 1. Selesaikan, tulis laporan, lalu berhenti dan tunggu persetujuan.**

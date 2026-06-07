# BKU Hub — UI Style Guide & Implementation Rules
> Dokumen ini adalah **aturan wajib** yang harus dibaca dan diikuti oleh AI agent sebelum membuat, memperbaiki, atau me-review komponen UI apapun di project BKU Hub.
> Versi: 2.0 | Status: AKTIF

---

## 0. PERINTAH AWAL UNTUK AI AGENT

Sebelum mengerjakan task apapun, kamu **wajib** melakukan langkah berikut:

1. **Buka dan analisis** halaman referensi di `http://localhost:5173/admin/faculty-prestasi` sebagai acuan visual utama. Pelajari spacing, radius, tipografi, warna, dan struktur layout-nya.
2. **Baca seluruh dokumen ini** dari awal sampai akhir tanpa melewati satupun bagian.
3. **Konfirmasi pemahamanmu** sebelum mulai menulis kode: sebutkan 3 aturan terpenting yang akan kamu terapkan pada task yang diberikan.
4. **Jangan pernah menambahkan nilai hardcoded** (hex color, pixel size, font name) langsung di komponen. Selalu gunakan CSS variable atau Tailwind token yang sudah didefinisikan.

---

## 1. REFERENSI VISUAL UTAMA

### Acuan Halaman: `/admin/faculty-prestasi` (Validasi Prestasi)

Halaman ini adalah **standar visual terbaik** yang sudah ada di project. Semua halaman baru dan perbaikan wajib menyerupai kualitas visual halaman ini. Berikut karakteristik kuncinya yang harus dipertahankan:

#### 1.1 Page Header Section
- Terdiri dari: ikon konteks (box rounded abu-abu), label kecil uppercase di atas judul, judul halaman dua warna (hitam + warna primary/aksen), dan deskripsi satu baris di bawah
- Judul menggunakan split dua warna: kata pertama warna teks gelap (`var(--theme-text)`), kata kedua/aksen warna primary (`var(--theme-primary)`) atau gold (`var(--theme-secondary)`)
- Di sisi kanan header: tombol aksi sekunder (Ekspor PDF) + tombol aksi primer (Refresh Data)
- Seluruh header dibungkus card putih dengan border tipis dan padding proporsional
- Label kecil di atas judul: uppercase, font tiny (≤12px), warna muted, dengan badge kecil notifikasi di sebelahnya

#### 1.2 Stat Cards (Summary Row)
- Grid 3 kolom, masing-masing card terpisah dengan gap seragam
- Setiap card: ikon kecil + label uppercase kecil di atas, angka besar di tengah, keterangan kecil di bawah
- Ikon menggunakan warna semantik: biru untuk total, hijau untuk sukses, kuning/orange untuk pending/warning
- Card style: border tipis, rounded `--radius-card`, background putih/transparan, shadow minimal
- Angka stat: font besar (≥28px), font weight 700, warna teks utama

#### 1.3 Data Table Section
- Header tabel: label bold kiri + sub-label muted, kontrol kanan (search + multi-dropdown filter)
- Search bar: input dengan ikon search di kiri, placeholder deskriptif
- Dropdown filter: style konsisten dengan input search (tinggi sama, radius sama)
- Kolom tabel header: uppercase, font sangat kecil (11px), warna muted, tracking wider
- Row tabel: hover subtle, padding vertikal proporsional
- Kolom aksi: ikon-only buttons (eye, check, x) di kanan
- Pagination: kiri menampilkan info "Menampilkan X dari Y", kanan tombol prev/next + nomor halaman

#### 1.4 Badge & Status Pills
- Status "NASIONAL": rounded-md, border, teks uppercase kecil, warna netral
- Status "MENUNGGU": pill rounded, background warna warning transparan, dot indicator di kiri, teks warna warning
- Tag kategori ("Prestasi", "Laporan Prestasi"): pill kecil rounded-md, warna berbeda per kategori

#### 1.5 Sidebar
- Background navy gelap (warna primary brand UBK)
- Logo + nama sistem di atas
- Menu item aktif: background putih/transparan semi, teks putih bold, border-left aksen
- Menu item non-aktif: teks putih/abu muted, hover subtle
- Section label: uppercase, sangat kecil, warna muted
- Tombol Keluar: merah solid di paling bawah, full width

#### 1.6 Top Navigation Bar
- Background putih, border bawah tipis
- Breadcrumb di kiri
- Filter kontekstual di tengah (dropdown School, Prodi, Periode)
- Icon search, notifikasi, avatar profil di kanan

---

## 2. DESIGN TOKENS (WAJIB DIGUNAKAN)

Semua nilai berikut harus didefinisikan di `src/styles/globals.css` dalam `:root {}` dan digunakan konsisten di seluruh codebase. **Dilarang keras menggunakan nilai hardcoded di luar file ini.**

### 2.1 Warna Brand (Dinamis — Dikontrol Theme Store)

```css
:root {
  /* === BRAND COLORS UBK === */
  --theme-primary: #1B3A6B;         /* Navy utama UBK — BUKAN #2563EB */
  --theme-primary-hover: #152F58;
  --theme-primary-light: #1B3A6B1A; /* 10% opacity untuk bg subtle */
  --theme-secondary: #C9A84C;       /* Gold UBK — BUKAN #EAB308 */
  --theme-secondary-hover: #B8973E;
  --theme-secondary-light: #C9A84C1A;

  /* === SEMANTIC COLORS === */
  --theme-success: #16A34A;
  --theme-success-light: #16A34A1A;
  --theme-warning: #D97706;
  --theme-warning-light: #D977061A;
  --theme-error: #DC2626;           /* BUKAN --theme-danger */
  --theme-error-light: #DC26261A;
  --theme-info: #0284C7;
  --theme-info-light: #0284C71A;

  /* === NEUTRAL / SURFACE === */
  --theme-bg: #F8FAFC;
  --theme-surface: #FFFFFF;
  --theme-text: #0F172A;
  --theme-text-muted: #64748B;
  --theme-text-subtle: #94A3B8;
  --theme-border: #E2E8F0;
  --theme-border-muted: #F1F5F9;

  /* === SIDEBAR === */
  --theme-sidebar-bg: var(--theme-primary);
  --theme-sidebar-text: #FFFFFF;
  --theme-sidebar-text-muted: rgba(255,255,255,0.6);
  --theme-sidebar-active-bg: rgba(255,255,255,0.12);
  --theme-sidebar-active-border: var(--theme-secondary);

  /* === HEADING COLORS === */
  --theme-h1: var(--theme-text);
  --theme-h2: var(--theme-text);
  --theme-h3: var(--theme-text);
  --theme-h4: var(--theme-text-muted);
}
```

> ⚠️ **PENTING:** Nilai-nilai di atas adalah **default theme**. Nilai ini akan di-override oleh Theme Store (Zustand) saat admin mengganti tema dari halaman Pengaturan Tampilan. Karena itu, **jangan pernah hardcode hex color di luar blok `:root`** ini.

### 2.2 Radius (Border Radius)

```css
:root {
  --radius-card: 1rem;         /* 16px — card, panel, page-header */
  --radius-modal: 1rem;        /* 16px — dialog, drawer */
  --radius-button: 0.75rem;    /* 12px — semua button */
  --radius-input: 0.75rem;     /* 12px — input, select, textarea */
  --radius-badge-status: 9999px; /* pill — badge status operasional */
  --radius-badge-tag: 0.375rem;  /* 6px — badge tag/kategori */
  --radius-icon-box: 0.5rem;   /* 8px — kotak ikon kecil */
}
```

**Mapping ke Tailwind:**
| Token | Tailwind Class |
|---|---|
| `--radius-card` | `rounded-2xl` |
| `--radius-modal` | `rounded-2xl` |
| `--radius-button` | `rounded-xl` |
| `--radius-input` | `rounded-xl` |
| `--radius-badge-status` | `rounded-full` |
| `--radius-badge-tag` | `rounded-md` |

### 2.3 Dimensi Komponen

```css
:root {
  --height-input: 2.5rem;        /* 40px — semua input, select */
  --height-button-default: 2.5rem; /* 40px */
  --height-button-sm: 2rem;       /* 32px — tombol aksi tabel */
  --height-button-lg: 3rem;       /* 48px — CTA utama */
  --sidebar-width: 15rem;         /* 240px */
  --topnav-height: 3.5rem;        /* 56px */
}
```

### 2.4 Tipografi

```css
:root {
  --font-headline: 'Plus Jakarta Sans', sans-serif; /* BUKAN font-jakarta */
  --font-body: 'Inter', sans-serif;                 /* BUKAN font-inter */

  --text-h1: 1.875rem;   /* 30px */
  --text-h2: 1.5rem;     /* 24px */
  --text-h3: 1.25rem;    /* 20px */
  --text-h4: 1rem;       /* 16px */
  --text-body: 0.875rem; /* 14px */
  --text-sm: 0.8125rem;  /* 13px */
  --text-xs: 0.75rem;    /* 12px */
  --text-2xs: 0.6875rem; /* 11px */
}
```

**Tailwind config aliases wajib:**
```js
// tailwind.config.js
fontFamily: {
  headline: ['Plus Jakarta Sans', 'sans-serif'],
  body: ['Inter', 'sans-serif'],
}
// Hapus alias: font-jakarta, font-inter (deprecated)
```

---

## 3. ATURAN KOMPONEN WAJIB

### 3.1 Button

**Aturan:**
- Semua button menggunakan `rounded-xl` (12px) dan tinggi `h-10` (40px)
- Button primary: `bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary-hover)]`
- Button secondary: `border border-[var(--theme-border)] bg-white text-[var(--theme-text)] hover:bg-[var(--theme-bg)]`
- Button danger: `bg-[var(--theme-error)] text-white`
- Button kecil (aksi tabel): `h-8 px-2 rounded-lg` — icon only atau icon + label pendek
- **DILARANG:** `rounded-md`, `rounded-lg`, `rounded-2xl` pada button
- **DILARANG:** hardcode warna di button selain via CSS variable

```jsx
// BENAR
<button className="h-10 px-4 rounded-xl bg-[var(--theme-primary)] text-white text-sm font-medium hover:bg-[var(--theme-primary-hover)] transition-colors">
  Simpan
</button>

// SALAH
<button className="h-9 px-4 rounded-2xl bg-[#00236F] text-white">
  Simpan
</button>
```

### 3.2 Input & Form Field

**Aturan:**
- Tinggi: `h-10` (40px) untuk semua input text, select, datepicker
- Radius: `rounded-xl` (12px)
- Border: `border border-[var(--theme-border)]`
- Background: `bg-white` atau `bg-[var(--theme-surface)]`
- Focus state: `focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:outline-none`
- Placeholder: `placeholder:text-[var(--theme-text-subtle)]`
- **DILARANG:** `h-11`, `h-9`, `rounded-lg`, `border-[#e5e5e5]`, `border-neutral-200`

```jsx
// BENAR
<input
  className="h-10 w-full rounded-xl border border-[var(--theme-border)] bg-white px-3 text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:outline-none transition-colors"
/>
```

### 3.3 Dropdown / Select

**Aturan:**
- Wajib menggunakan **Radix UI `<Select>`** — dilarang menggunakan `<select>` HTML native di halaman baru maupun yang sudah ada (kecuali yang belum dimigrasikan dan sedang dalam antrean Phase 4)
- Style wrapper: identik dengan Input (tinggi, radius, border, focus state)
- Trigger button: `h-10 rounded-xl border border-[var(--theme-border)] px-3 text-sm`
- Content/popover: `rounded-xl border border-[var(--theme-border)] shadow-md bg-white`
- Item hover: `bg-[var(--theme-primary-light)] text-[var(--theme-primary)]`

**File referensi:** Lihat implementasi di `PsychologistList.jsx` (Radix Select sudah benar di sini).

### 3.4 Card & Panel

**Aturan:**
- Card default: `rounded-2xl border border-[var(--theme-border)] bg-white shadow-sm`
- Card glass (untuk dashboard/header): `rounded-2xl border border-[var(--theme-border)] bg-white/70 backdrop-blur-md shadow-sm`
- Padding card: `p-5` (20px) untuk stat card, `p-6` (24px) untuk panel besar
- **DILARANG:** `border-[#e5e5e5]`, `border-neutral-200`, `border-slate-200` — gunakan `border-[var(--theme-border)]`
- **DILARANG:** mix antara card solid dan glass dalam satu halaman tanpa alasan desain yang jelas

### 3.5 Modal & Dialog

**Aturan KRITIS — Phase 4:**
- **Satu-satunya arsitektur modal yang diperbolehkan: Radix UI `<Dialog>`**
- Komponen `Modal.jsx` custom yang lama (`/components/ui/Modal.jsx`) harus **dimigrasi** ke Radix Dialog
- Jangan membuat modal baru menggunakan `div` + `position: absolute` + backdrop manual
- Wrapper Radix Dialog wajib menggunakan class berikut:

```jsx
// DialogContent wajib pakai class ini:
<DialogContent className="rounded-2xl shadow-2xl bg-white border border-[var(--theme-border)] max-w-lg">
  {/* Header */}
  <div className="px-6 py-5 border-b border-[var(--theme-border-muted)]">
    <DialogTitle className="text-base font-semibold text-[var(--theme-text)]">Judul Modal</DialogTitle>
  </div>
  {/* Body */}
  <div className="px-6 py-5">
    {/* konten */}
  </div>
  {/* Footer */}
  <div className="px-6 py-4 border-t border-[var(--theme-border-muted)] flex justify-end gap-3">
    <DialogClose asChild>
      <button className="h-10 px-4 rounded-xl border border-[var(--theme-border)] text-sm">Batal</button>
    </DialogClose>
    <button className="h-10 px-4 rounded-xl bg-[var(--theme-primary)] text-white text-sm">Simpan</button>
  </div>
</DialogContent>
```

**File referensi yang BENAR:** `PsychologistList.jsx` (menggunakan Radix Dialog).
**File yang harus dimigrasi:** `FacultyDashboard.jsx`, `TenagaKesehatanList.jsx`, `TenagaKesehatanDashboard.jsx`.

### 3.6 Badge & Status

**Dua jenis badge — jangan dicampur:**

| Jenis | Kapan dipakai | Class |
|---|---|---|
| **Status pill** | Status operasional: Aktif, Menunggu, Tervalidasi, Error | `rounded-full text-xs font-semibold px-2.5 py-1` |
| **Tag kategori** | Label jenis konten: Prestasi, Laporan, Beasiswa | `rounded-md text-xs font-medium px-2 py-0.5 border` |

**Warna status (via CSS variable):**
```jsx
// Contoh badge status
const statusClass = {
  aktif:      "bg-[var(--theme-success-light)] text-[var(--theme-success)]",
  menunggu:   "bg-[var(--theme-warning-light)] text-[var(--theme-warning)]",
  ditolak:    "bg-[var(--theme-error-light)] text-[var(--theme-error)]",
  nasional:   "bg-slate-100 text-slate-600 border border-slate-200",
}
```

- **DILARANG:** `rounded-lg` pada badge status — wajib `rounded-full`
- **DILARANG:** hardcode warna badge (`bg-emerald-500/10`, `text-emerald-600`) — gunakan semantic variable
- **DILARANG:** font weight `font-black` atau `font-bold` pada badge — gunakan `font-semibold`

### 3.7 Tabel Data

**Aturan:**
- Wrapper tabel: `rounded-2xl border border-[var(--theme-border)] overflow-hidden`
- Header tabel: `bg-[var(--theme-bg)]` atau `bg-slate-50`
- Teks header kolom: `text-[11px] font-semibold uppercase tracking-wider text-[var(--theme-text-muted)]`
- Row height: min `h-14` (56px)
- Row hover: `hover:bg-[var(--theme-primary-light)]` — BUKAN `hover:bg-black/[0.02]`
- Border row: hanya `border-b border-[var(--theme-border-muted)]` (tanpa border kiri/kanan per sel)
- Kolom aksi: icon-only button `h-8 w-8 rounded-lg` di ujung kanan

### 3.8 Page Header (Wajib Ada di Setiap Halaman)

Mengacu pada tampilan halaman `faculty-prestasi`, setiap halaman **wajib** memiliki page header dengan struktur berikut:

```jsx
<div className="rounded-2xl border border-[var(--theme-border)] bg-white p-6 shadow-sm">
  <div className="flex items-start justify-between gap-4">
    {/* Kiri: ikon + judul + deskripsi */}
    <div className="flex items-center gap-4">
      {/* Kotak ikon */}
      <div className="rounded-xl bg-[var(--theme-bg)] p-3 border border-[var(--theme-border)]">
        <IconComponent className="h-6 w-6 text-[var(--theme-text-muted)]" />
      </div>
      <div>
        {/* Label + badge notifikasi */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--theme-text-muted)]">
            Nama Modul
          </span>
          {/* Badge opsional */}
          <span className="rounded-full bg-[var(--theme-success-light)] text-[var(--theme-success)] text-[11px] font-semibold px-2 py-0.5">
            ● 3 Item Baru
          </span>
        </div>
        {/* Judul dua warna */}
        <h1 className="text-2xl font-bold font-headline">
          <span className="text-[var(--theme-text)]">Kata Pertama </span>
          <span className="text-[var(--theme-primary)]">Kata Kedua</span>
        </h1>
        {/* Deskripsi */}
        <p className="text-sm text-[var(--theme-text-muted)] mt-1">
          Deskripsi singkat halaman ini.
        </p>
      </div>
    </div>
    {/* Kanan: tombol aksi */}
    <div className="flex items-center gap-2 shrink-0">
      <button className="h-10 px-4 rounded-xl border border-[var(--theme-border)] text-sm font-medium text-[var(--theme-text)] hover:bg-[var(--theme-bg)] flex items-center gap-2">
        <DownloadIcon className="h-4 w-4" /> Ekspor PDF
      </button>
      <button className="h-10 px-4 rounded-xl bg-[var(--theme-primary)] text-white text-sm font-medium hover:bg-[var(--theme-primary-hover)] flex items-center gap-2">
        <RefreshIcon className="h-4 w-4" /> Refresh Data
      </button>
    </div>
  </div>
</div>
```

---

## 4. ATURAN ANTI-PATTERN (DILARANG KERAS)

Daftar berikut adalah hal-hal yang **wajib dihindari**. Jika AI agent menemukan pola ini dalam kode yang sudah ada, tandai sebagai bug dan perbaiki.

### 4.1 Hardcoded Colors
```jsx
// ❌ SEMUA INI DILARANG
className="bg-[#00236f]"
className="bg-[#00236F]"
className="text-[#00236F]"
className="border-[#e5e5e5]"
className="text-slate-900"
className="border-slate-200"
className="border-neutral-200"
className="border-slate-200/60"
className="bg-[#fafafa]"
style={{ color: '#1B3A6B' }}

// ✅ YANG BENAR
className="bg-[var(--theme-primary)]"
className="text-[var(--theme-primary)]"
className="border-[var(--theme-border)]"
className="text-[var(--theme-text)]"
```

### 4.2 Ukuran & Radius Salah
```jsx
// ❌ DILARANG pada button & input
className="rounded-md"    // → ganti rounded-xl
className="rounded-lg"    // → ganti rounded-xl (untuk button/input)
className="rounded-2xl"   // → ganti rounded-xl (untuk button/input)
className="h-9"           // → ganti h-10
className="h-11"          // → ganti h-10

// ❌ DILARANG pada badge status
className="rounded-lg"    // → ganti rounded-full
className="rounded-md"    // → ganti rounded-full (untuk status pill)
```

### 4.3 Modal Terlarang
```jsx
// ❌ DILARANG membuat modal dengan cara ini
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <div className="rounded-2xl bg-white p-6">
    {/* ini adalah Modal.jsx lama — HARUS DIMIGRASI */}
  </div>
</div>

// ✅ WAJIB menggunakan Radix UI Dialog
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@radix-ui/react-dialog'
```

### 4.4 Select Native Terlarang
```jsx
// ❌ DILARANG di halaman baru
<select className="...">
  <option>...</option>
</select>

// ✅ WAJIB Radix Select
import { Select, SelectTrigger, SelectContent, SelectItem } from '@radix-ui/react-select'
```

### 4.5 Font Alias Deprecated
```jsx
// ❌ DILARANG — alias lama
className="font-jakarta"
className="font-inter"

// ✅ GUNAKAN alias baru
className="font-headline"  // Plus Jakarta Sans
className="font-body"      // Inter
```

### 4.6 Nama Class Status Error
```jsx
// ❌ DILARANG
className="text-danger"
className="bg-danger/10"

// ✅ GUNAKAN
className="text-[var(--theme-error)]"
className="bg-[var(--theme-error-light)]"
```

---

## 5. ATURAN TEMA DINAMIS (THEME STORE)

Sistem tema BKU Hub menggunakan **Zustand Theme Store** yang dapat diubah oleh Super Admin melalui halaman Pengaturan Tampilan. Karena itu, **semua warna harus melewati CSS variable**, bukan hardcoded.

### 5.1 Cara Kerja Sistem Tema

```
Super Admin ubah tema di Pengaturan Tampilan
        ↓
Zustand themeStore.setTheme({ primary: '...', secondary: '...' })
        ↓
Store update CSS variables di document.documentElement
        ↓
Seluruh UI berubah otomatis karena semua komponen pakai var(--theme-*)
```

### 5.2 Implementasi Theme Store

```js
// src/store/themeStore.js
const applyTheme = (theme) => {
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-primary-hover', theme.primaryHover);
  root.style.setProperty('--theme-primary-light', theme.primary + '1A');
  root.style.setProperty('--theme-secondary', theme.secondary);
  root.style.setProperty('--theme-secondary-hover', theme.secondaryHover);
  root.style.setProperty('--theme-secondary-light', theme.secondary + '1A');
  root.style.setProperty('--theme-sidebar-bg', theme.sidebarBg ?? theme.primary);
  // ... dst untuk semua token yang bisa dikustomisasi
};
```

### 5.3 Token yang Boleh Dikustomisasi User

| Token | Label di UI Pengaturan |
|---|---|
| `--theme-primary` | Warna Utama (Primary) |
| `--theme-secondary` | Warna Aksen (Secondary/Gold) |
| `--theme-sidebar-bg` | Warna Background Sidebar |
| `--theme-bg` | Warna Background Halaman |
| `--theme-surface` | Warna Surface/Card |
| `--theme-text` | Warna Teks Utama |
| `--theme-border` | Warna Border |
| `--radius-card` | Gaya Sudut Card |
| `--radius-button` | Gaya Sudut Tombol |
| `--font-headline` | Font Judul |
| `--font-body` | Font Isi |

### 5.4 Token yang TIDAK Boleh Dikustomisasi User

Token semantic status (success, warning, error, info) **tidak boleh** bisa diubah oleh user karena fungsinya sebagai indikator standar sistem:
- `--theme-success`, `--theme-warning`, `--theme-error`, `--theme-info` → nilai tetap, tidak muncul di UI pengaturan

---

## 6. PHASE 4 — MIGRATION TASKS (ARSITEKTUR)

Berikut adalah task spesifik yang belum diselesaikan dan wajib dikerjakan sesuai urutan prioritas:

### Task 4.1 — Migrasi Select Native → Radix Select

**File yang harus dimigrasi:**

| File | Baris | Keterangan |
|---|---|---|
| `src/pages/SuperAdmin/psychologist/PsychologistList.jsx` | L12 | Import + penggunaan `<select>` native untuk filter |
| `src/pages/SuperAdmin/tenagakes/TenagaKesehatanList.jsx` | L738 | `<select>` native untuk dropdown filter jadwal |
| `src/pages/FacultyAdmin/FacultyDashboard.jsx` | L248 | `<select>` native untuk filter periode |

**Langkah migrasi:**
1. Buat shared component `src/components/ui/SelectField.jsx` berbasis Radix Select dengan styling sesuai Section 3.3
2. Ganti setiap `<select>` native dengan `<SelectField>` — interface props harus identik agar drop-in replacement mudah
3. Pastikan aksesibilitas: label, value, onChange tetap berfungsi

**Template SelectField:**
```jsx
// src/components/ui/SelectField.jsx
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';

export function SelectField({ value, onValueChange, placeholder, children, className }) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className={`
        h-10 flex items-center justify-between gap-2
        rounded-xl border border-[var(--theme-border)] bg-white
        px-3 text-sm text-[var(--theme-text)]
        hover:border-[var(--theme-primary)] focus:outline-none
        focus:ring-2 focus:ring-[var(--theme-primary-light)]
        transition-colors ${className ?? ''}
      `}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon><ChevronDown className="h-4 w-4 text-[var(--theme-text-muted)]" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="
          rounded-xl border border-[var(--theme-border)] bg-white
          shadow-md z-50 overflow-hidden
        ">
          <Select.Viewport className="p-1">
            {children}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export function SelectOption({ value, children }) {
  return (
    <Select.Item value={value} className="
      flex items-center gap-2 rounded-lg px-3 py-2 text-sm
      text-[var(--theme-text)] cursor-pointer outline-none
      data-[highlighted]:bg-[var(--theme-primary-light)]
      data-[highlighted]:text-[var(--theme-primary)]
    ">
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator><Check className="h-3.5 w-3.5" /></Select.ItemIndicator>
    </Select.Item>
  );
}
```

### Task 4.2 — Konsolidasi Modal → Radix Dialog

**File yang harus dimigrasi:**

| File | Kondisi Saat Ini | Target |
|---|---|---|
| `src/components/ui/Modal.jsx` | Custom div + backdrop — deprecated | Hapus / jadikan wrapper Radix Dialog |
| `src/pages/FacultyAdmin/FacultyDashboard.jsx` | Menggunakan `Modal.jsx` custom | Migrasi ke `<DialogModal>` |
| `src/pages/SuperAdmin/tenagakes/TenagaKesehatanList.jsx` | Menggunakan `Modal.jsx` custom | Migrasi ke `<DialogModal>` |
| `src/pages/SuperAdmin/tenagakes/TenagaKesehatanDashboard.jsx` | Menggunakan `Modal.jsx` custom | Migrasi ke `<DialogModal>` |

**Langkah migrasi:**
1. Buat shared wrapper `src/components/ui/DialogModal.jsx` yang membungkus Radix Dialog dengan styling standar (lihat Section 3.5)
2. Interface props: `{ open, onOpenChange, title, description?, children, footer?, maxWidth? }`
3. Ganti semua penggunaan `<Modal>` di file-file di atas dengan `<DialogModal>`
4. Setelah semua file termigrasi, hapus `Modal.jsx` yang lama

**Template DialogModal:**
```jsx
// src/components/ui/DialogModal.jsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function DialogModal({ open, onOpenChange, title, description, children, footer, maxWidth = 'max-w-lg' }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={`
          fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2
          w-full ${maxWidth} rounded-2xl bg-white shadow-2xl
          border border-[var(--theme-border)]
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
        `}>
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--theme-border-muted)]">
            <div>
              <Dialog.Title className="text-base font-semibold text-[var(--theme-text)]">{title}</Dialog.Title>
              {description && <Dialog.Description className="text-sm text-[var(--theme-text-muted)] mt-0.5">{description}</Dialog.Description>}
            </div>
            <Dialog.Close className="rounded-lg p-1 hover:bg-[var(--theme-bg)] text-[var(--theme-text-muted)] transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          {/* Body */}
          <div className="px-6 py-5">{children}</div>
          {/* Footer opsional */}
          {footer && (
            <div className="px-6 py-4 border-t border-[var(--theme-border-muted)] flex justify-end gap-3">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Task 4.3 — Sidebar Width Alignment

**File:** `src/components/layout/PortalSidebar.jsx`, `src/styles/globals.css`

- Saat ini: `w-[240px]` — tidak sesuai SOP
- Target: `w-60` (240px) dikunci via token `--sidebar-width: 15rem`
- Catatan: lebar 240px dipertahankan (tidak berubah ke 256px) karena secara visual sudah proporsional dengan konten — yang diperbaiki adalah penggunaan token-nya, bukan nilainya

```css
/* globals.css */
--sidebar-width: 15rem; /* 240px — dikunci, jangan ubah ke w-64 */
```

```jsx
// PortalSidebar.jsx
<aside className="w-[var(--sidebar-width)] h-screen flex flex-col ..." style={{ width: 'var(--sidebar-width)' }}>
```

---

## 7. CHECKLIST QA SEBELUM COMMIT

Sebelum menganggap sebuah halaman atau komponen selesai, AI agent **wajib** memverifikasi semua item berikut:

### Visual Checklist
- [ ] Tidak ada warna hardcoded di luar `globals.css (:root)` — tidak ada hex, tidak ada `text-slate-*`, `border-neutral-*`, `bg-[#...]`
- [ ] Semua button: `rounded-xl` + `h-10` (default) atau `h-8` (small)
- [ ] Semua input/select: `rounded-xl` + `h-10` + `border-[var(--theme-border)]`
- [ ] Semua card/panel: `rounded-2xl` + `border-[var(--theme-border)]`
- [ ] Semua badge status: `rounded-full` + font `font-semibold`
- [ ] Semua badge tag: `rounded-md` + `border`
- [ ] Page header ada dan mengikuti struktur Section 3.8
- [ ] Stat cards (jika ada) mengikuti struktur Section 1.2
- [ ] Row hover tabel menggunakan `hover:bg-[var(--theme-primary-light)]`

### Arsitektur Checklist
- [ ] Tidak ada `<select>` HTML native — gunakan `<SelectField>` (Radix)
- [ ] Tidak ada modal berbasis `div + fixed` — gunakan `<DialogModal>` (Radix)
- [ ] Font menggunakan alias `font-headline` atau `font-body`, bukan `font-jakarta` / `font-inter`
- [ ] Status error menggunakan `--theme-error`, bukan `danger`
- [ ] Tema berfungsi dinamis: ganti warna di Theme Store → seluruh halaman berubah tanpa ada yang "bocor"

### Aksesibilitas Checklist
- [ ] Semua tombol icon-only memiliki `aria-label`
- [ ] Semua form field memiliki `label` yang terhubung via `htmlFor`
- [ ] Modal memiliki `DialogTitle` dan `DialogDescription`
- [ ] Kontras warna teks minimal 4.5:1 terhadap background

---

## 8. URUTAN PENGERJAAN YANG DISARANKAN

Jika kamu menerima task yang melibatkan banyak file, kerjakan dengan urutan berikut:

1. **Globals dulu** — pastikan `globals.css` sudah memiliki semua token dari Section 2
2. **Shared components** — perbaiki `Button.jsx`, `Input.jsx`, `Card.jsx`, `Badge.jsx`, `SelectField.jsx`, `DialogModal.jsx`
3. **Halaman per portal** — mulai dari Super Admin → Faculty Admin → Nakes → Mahasiswa
4. **QA per halaman** — gunakan checklist Section 7 sebelum pindah ke halaman berikutnya
5. **Verifikasi tema dinamis** — test ganti tema dari Pengaturan Tampilan, pastikan tidak ada elemen yang "bocor" (warna tidak berubah)

---

*Dokumen ini dibuat berdasarkan hasil audit UI Consistency BKU Hub (Juni 2026). Update dokumen ini setiap kali ada keputusan desain baru yang disepakati bersama tim.*

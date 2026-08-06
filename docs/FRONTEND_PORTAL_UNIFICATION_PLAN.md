# Rencana Unifikasi Portal Frontend SIAKAD

**Versi:** 1.0  
**Tanggal:** 3 Juni 2026  
**Status:** Draft  
**Branch:** mei  

---

## 1. Latar Belakang & Tujuan

### 1.1 Kondisi Saat Ini

Aplikasi SIAKAD memiliki **6 portal role** yang masing-masing dibangun secara independen:

| Role | Sidebar | Layout | Font | Background |
|------|---------|--------|------|------------|
| Student | `components/layout/Sidebar.jsx` | `AppLayout.jsx` | `font-inter` | Solid `#f1f5f9` |
| FacultyAdmin | `FacultyAdmin/components/Sidebar.jsx` | `FacultyLayout.jsx` | `font-inter` | Radial gradient |
| OrmawaAdmin | `OrmawaAdmin/components/Sidebar.jsx` | `OrmawaLayout.jsx` | `font-inter` | Radial gradient |
| Kencana | `Kencana/components/KencanaSidebar.jsx` | `KencanaLayout.jsx` | `font-body` | Solid `#fafafa` |
| Psychologist | `Psychologist/components/Sidebar.jsx` | — | `font-inter` | — |
| SuperAdmin | `SuperAdmin/components/Sidebar.jsx` | `SuperAdminLayout.jsx` | `font-inter` | Radial gradient |

### 1.2 Masalah yang Ditemukan

1. **6 file sidebar berbeda** — logic menu, styling, dan struktur tersebar di banyak tempat
2. **5 file layout berbeda** — padahal pola strukturnya 95% sama
3. **Inkonsistensi visual:**
   - Background tidak seragam (radial gradient vs solid)
   - Font family tidak konsisten (ada yang `font-body`, ada yang `font-inter`)
   - Sidebar width tidak sama (`w-64` vs `w-72`)
   - Branding name portal campur aduk
   - Logout button hardcoded `red-600`, tidak theme-aware
4. **Duplikasi kode tinggi** — saat ubah struktur sidebar, harus ubah di 6 tempat
5. **Tidak ada single source of truth** untuk konfigurasi menu per role

### 1.3 Tujuan

> Membuat seluruh portal SIAKAD memiliki **satu sistem layout terpusat**, sehingga:
> - Konsisten secara visual tanpa effort manual
> - Mudah dimaintain (ubah satu tempat, semua portal terpengaruh)
> - Mudah ditambahkan role baru
> - Mudah di-customisasi per role via konfigurasi, bukan duplikasi file

---

## 2. Prinsip Desain

### 2.1 Shared Layout Architecture (Single Source of Truth)

```
frontend/src/components/layout/
├── PortalShell.jsx          # Shell utama: sidebar + topbar + content area
├── PortalSidebar.jsx        # Sidebar universal dengan menu config-driven
├── PortalTopbar.jsx         # Topbar universal
├── PortalConfig.js          # Konfigurasi menu & branding per role
└── AppLayout.jsx            # Wrapper React Router Outlet
```

### 2.2 Konfigurasi Driven, Bukan Duplikasi

Setiap role didefinisikan sebagai **konfigurasi**, bukan file baru:

```js
// portalConfig.js
export const PORTAL_CONFIG = {
  student: {
    title: 'Student Hub',
    logo: '/images/bku logo.png',
    menu: [...],       // array of menu items
    sidebarColor: 'navy',
    accentColor: 'gold',
  },
  faculty: {
    title: 'Faculty Portal',
    logo: '/images/bku logo.png',
    menu: [...],
    sidebarColor: 'navy',
    accentColor: 'gold',
  },
  // ... dst
}
```

### 2.3 Standar Visual

| Aspek | Nilai Standar |
|-------|--------------|
| Sidebar width | `w-64` (256px) |
| Font family | `font-inter` (uniform) |
| Background | Radial gradient `bg-[radial-gradient]` (uniform) |
| Primary color | CSS var `--theme-primary: #0D2B55` |
| Accent color | CSS var `--theme-secondary: #C89B3C` |
| Sidebar background | CSS var `--theme-sidebar-bg` |
| Active menu indicator | `--theme-secondary` |
| Logout button | Theme-aware (bukan hardcoded red) |

---

## 3. Rencana Implementasi

### Phase 1 — Fondasi: Shared Layout System

**Tujuan:** Membuat komponen layout universal yang bisa dipakai semua role.

#### 1.1 Buat PortalConfig.js

**File:** `frontend/src/components/layout/PortalConfig.js`

Isi:
- Export konfigurasi untuk SEMUA role: student, faculty, ormawa, kencana, psychologist, superadmin
- Masing-masing berisi: title, logo, menu items, sidebarColor, accentColor
- Menu items menggunakan struktur uniform:
  ```js
  {
    label: 'Dashboard',
    path: '/student/dashboard',
    icon: 'dashboard',
    badge?: number,
    children?: [...]  // untuk submenu
  }
  ```

**Output:** Satu file konfigurasi yang mendefinisikan semua portal.

#### 1.2 Buat PortalSidebar.jsx

**File:** `frontend/src/components/layout/PortalSidebar.jsx`

Spesifikasi:
- Terima prop `config` (berisi menu array)
- Menu di-render secara dinamis dari config
- Support: menu item aktif (highlight berdasarkan current path)
- Support: submenu expandable
- Support: badge counter
- Support: collapse/expand toggle
- Styling menggunakan CSS variables tema yang sudah ada
- Logo + portal title dari config
- Logout button dengan styling theme-aware
- Width: `w-64`, fixed, full height

**Output:** Satu sidebar component yang digunakan semua role.

#### 1.3 Buat PortalTopbar.jsx

**File:** `frontend/src/components/layout/PortalTopbar.jsx`

Spesifikasi:
- Terima prop `config` (title)
- Tampilkan: hamburger menu (mobile), breadcrumb, search, notification bell, user avatar
- Responsive: hamburger toggle sidebar di mobile
- Styling: glassmorphism atau clean white dengan shadow

**Output:** Satu topbar component yang digunakan semua role.

#### 1.4 Buat PortalShell.jsx

**File:** `frontend/src/components/layout/PortalShell.jsx`

Spesifikasi:
- Terima prop `config`
- Susun: PortalSidebar (kiri) + PortalTopbar (atas content) + `{children}` (content area)
- Handle: sidebar toggle state (collapsible)
- Handle: responsive breakpoint (sidebar overlay di mobile)
- Provide context: PortalContext (agar child pages bisa akses config)

**Output:** Satu shell component yang membungkus semua halaman portal.

#### 1.5 Update AppLayout.jsx

**File:** `frontend/src/components/layout/AppLayout.jsx`

Spesifikasi:
- Baca role user dari auth context/store
- Ambil config dari `PortalConfig.js` berdasarkan role
- Render `<PortalShell config={config}> <Outlet /> </PortalShell>`
- Handle: role yang tidak dikenal → redirect ke login

**Output:** Single entry point untuk semua portal.

---

### Phase 2 — Migrasi Bertahap per Role

**Tujuan:** Memigrate setiap portal satu per satu tanpa breaking changes.

> ⚠️ **Strategi:** TIDAK hapus file lama sekaligus. Migrasi per role, test per role.

#### Migrasi 2.1 — SuperAdmin (Role Paling Sedikit Halaman)

1. Update `frontend/src/pages/SuperAdmin/SuperAdminLayout.jsx` → import dari PortalShell
2. Update semua halaman di `pages/SuperAdmin/` → hapus sidebar/header duplikat, biarkan `{children}` di PortalShell
3. Verifikasi: semua menu SuperAdmin berfungsi, styling konsisten
4. **Baru hapus** file sidebar/layout lama SuperAdmin setelah verified

#### Migrasi 2.2 — FacultyAdmin

1. Update `pages/FacultyAdmin/components/FacultyLayout.jsx` → import dari PortalShell
2. Mapping menu existing ke struktur config
3. Update semua halaman FacultyAdmin
4. Verifikasi
5. Hapus file lama setelah verified

#### Migrasi 2.3 — OrmawaAdmin

1. Sama pola dengan 2.2
2. Perlu attention khusus: Ormawa punya banyak halaman (Absensi, Keuangan, LPJ, dll) — pastikan semua menu terpetakan

#### Migrasi 2.4 — Student

1. Student portal biasanya paling banyak halaman
2. Verifikasi: sidebar student dengan avatar, menu nim, dll tetap berfungsi

#### Migrasi 2.5 — Kencana

1. Khusus: Kencana menggunakan `font-body`, perlu update PortalConfig
2. Hapus `font-body` di KencanaLayout, biarkan uniform `font-inter`
3. Kencana sidebar punya banyak variant menu (admin/fakultas/mentor) — perlu submenu support di PortalSidebar

#### Migrasi 2.6 — Psychologist

1. Biasanya paling sederhana
2. Verifikasi: psychologist-specific menu tetap berfungsi

---

### Phase 3 — Perbaikan Visual & Polish

Setelah semua role dimigasi:

#### 3.1 Normalisasi CSS

- Update `frontend/src/index.css`:
  - Hapus variasi background per portal
  - Set uniform: `body { background: radial-gradient(...) }`
  - Set uniform: `font-family: 'Inter', sans-serif`
  - Pastikan CSS variables lengkap untuk sidebar states (hover, active, collapsed)

#### 3.2 Normalisasi Logout Button

- Sidebar logout button gunakan variabel `--theme-danger` (didefinisikan di CSS vars)
- Jika tidak ada, buat: `--theme-danger: #dc2626`

#### 3.3 Consistent Branding

- Semua portal title dirapikan:
  - Student: "Student Hub"
  - Faculty: "Faculty Portal"
  - Ormawa: "Ormawa Portal"
  - Kencana: "Kencana Portal"
  - Psychologist: "Psychologist Portal"
  - SuperAdmin: "Admin Portal"
- Logo tetap sama (`/images/bku logo.png`)

#### 3.4 Mobile Responsiveness

- Pastikan PortalShell handle responsive: sidebar overlay di < md breakpoint
- Test setiap portal di mobile view

---

### Phase 4 — Cleanup & Dokumentasi

#### 4.1 Hapus File Duplikat

Setelah semua role migrasi & verified:

```
Hapus folder/file lama:
- pages/SuperAdmin/components/Sidebar.jsx (kalau belum dihapus)
- pages/SuperAdmin/components/SuperAdminLayout.jsx
- pages/FacultyAdmin/components/Sidebar.jsx
- pages/FacultyAdmin/components/FacultyLayout.jsx
- pages/OrmawaAdmin/components/Sidebar.jsx
- pages/OrmawaAdmin/components/OrmawaLayout.jsx
- pages/Kencana/components/KencanaSidebar.jsx
- pages/Kencana/components/KencanaLayout.jsx
- components/layout/Sidebar.jsx (student sidebar lama)
- pages/Psychologist/components/Sidebar.jsx
```

#### 4.2 Update Routing

- Pastikan semua route di `App.jsx` atau `router.jsx` menggunakan `AppLayout` sebagai parent route
- Setiap child route cukup render `{children}` tanpa perlu sidebar sendiri

#### 4.3 Dokumentasi

- Update `CLAUDE.md` dengan:
  - Arsitektur portal layout yang baru
  - Cara menambahkan role baru
  - Cara menambahkan menu item
- Tambahkan comment di `PortalConfig.js` menjelaskan cara pakainya

---

## 4. Estimasi Effort

| Phase | Deskripsi | Estimasi |
|-------|-----------|----------|
| Phase 1 | Shared Layout System (PortalConfig + PortalSidebar + PortalTopbar + PortalShell) | 2–3 hari |
| Phase 2.1 | Migrasi SuperAdmin | 0.5 hari |
| Phase 2.2 | Migrasi FacultyAdmin | 0.5 hari |
| Phase 2.3 | Migrasi OrmawaAdmin | 1 hari |
| Phase 2.4 | Migrasi Student | 1 hari |
| Phase 2.5 | Migrasi Kencana | 0.5 hari |
| Phase 2.6 | Migrasi Psychologist | 0.5 hari |
| Phase 3 | Perbaikan Visual & Polish | 1 hari |
| Phase 4 | Cleanup & Dokumentasi | 0.5 hari |
| **Total** | | **8–9 hari kerja** |

---

## 5. Resiko & Mitigasi

| Resiko | Mitigation |
|--------|------------|
| Break existing portal saat migrasi | Staging branch khusus `feature/unified-layout`, merge ke `mei` setelah semua tested |
| Submenu/role-variant menu di Kencana tidak cocok dengan config-driven | PortalSidebar support `children` array untuk nested menu |
| Banyak halaman yang masing-masing punya sidebar import | Grep semua `from './Sidebar'` di setiap portal pages, pastikan dihapus saat migrasi |
| Mobile view berbeda antar portal | Test setiap portal di mobile setelah migrasi |

---

## 6. Rollback Plan

Jika ada masalah kritikal:

```bash
# Rollback ke state sebelum migrasi
git stash
git checkout HEAD~1 -- .
git commit -m "Rollback: revert unified layout migration"
```

**Pastikan** commit sebelum mulai Phase 1.

---

## 7. Checklist Sebelum Mulai

- [ ] Buat staging branch `feature/unified-layout` dari `mei`
- [ ] Commit rollback point
- [ ] Audit semua halaman portal (cek apakah ada halaman yang secara manual import Sidebar)
- [ ] Identifikasi semua menu item per role (snapshot)
- [ ] Setup testing environment (bisa jalan semua portal locally)
- [ ] Briefing tim: jadwal migrasi per role

---

## 8. Contoh Kode PortalConfig.js

```js
// frontend/src/components/layout/PortalConfig.js

export const PORTAL_CONFIG = {
  student: {
    title: 'Student Hub',
    logo: '/images/bku logo.png',
    sidebarWidth: 'w-64',
    menu: [
      {
        label: 'Dashboard',
        path: '/student/dashboard',
        icon: 'home',
      },
      {
        label: 'KRS',
        path: '/student/krs',
        icon: 'assignment',
      },
      {
        label: 'Nilai',
        path: '/student/nilai',
        icon: 'grade',
      },
      {
        label: 'Jadwal Kuliah',
        path: '/student/jadwal',
        icon: 'calendar_today',
      },
      {
        label: 'Keuangan',
        path: '/student/keuangan',
        icon: 'payments',
      },
      {
        label: 'Pengajuan',
        path: '/student/pengajuan',
        icon: 'send',
        children: [
          { label: 'Cuti', path: '/student/pengajuan/cuti' },
          { label: 'Undur Diri', path: '/student/pengajuan/undur-diri' },
        ],
      },
    ],
  },

  faculty: {
    title: 'Faculty Portal',
    logo: '/images/bku logo.png',
    sidebarWidth: 'w-64',
    menu: [
      { label: 'Dashboard', path: '/faculty/dashboard', icon: 'dashboard' },
      { label: 'Mahasiswa', path: '/faculty/mahasiswa', icon: 'group' },
      { label: 'Dosen', path: '/faculty/dosen', icon: 'school' },
      { label: 'Kelas', path: '/faculty/kelas', icon: 'class' },
      { label: 'Nilai', path: '/faculty/nilai', icon: 'grade' },
      { label: 'Pengaturan', path: '/faculty/settings', icon: 'settings' },
    ],
  },

  ormawa: {
    title: 'Ormawa Portal',
    logo: '/images/bku logo.png',
    sidebarWidth: 'w-64',
    menu: [
      { label: 'Dashboard', path: '/ormawa/dashboard', icon: 'dashboard' },
      { label: 'Keanggotaan', path: '/ormawa/anggota', icon: 'group' },
      { label: 'Absensi Kegiatan', path: '/ormawa/absensi', icon: 'event_available' },
      { label: 'Jadwal Kegiatan', path: '/ormawa/jadwal', icon: 'event' },
      { label: 'Pengelolaan Kas', path: '/ormawa/kas', icon: 'account_balance_wallet' },
      { label: 'LPJ', path: '/ormawa/lpj', icon: 'description' },
      { label: 'Proposal', path: '/ormawa/proposal', icon: 'article' },
      { label: 'Asppirasi', path: '/ormawa/aspirasi', icon: 'feedback' },
      { label: 'Pengumuman', path: '/ormawa/pengumuman', icon: 'campaign' },
      { label: 'Role & Akses', path: '/ormawa/role', icon: 'admin_panel_settings' },
      { label: 'Notifikasi', path: '/ormawa/notifikasi', icon: 'notifications' },
      { label: 'Pengaturan', path: '/ormawa/settings', icon: 'settings' },
    ],
  },

  kencana: {
    title: 'Kencana Portal',
    logo: '/images/bku logo.png',
    sidebarWidth: 'w-64',
    menu: [
      { label: 'Dashboard', path: '/kencana/dashboard', icon: 'dashboard' },
      {
        label: 'Data Peserta',
        icon: 'people',
        children: [
          { label: 'Admin', path: '/kencana/peserta/admin' },
          { label: 'Fakultas', path: '/kencana/peserta/fakultas' },
          { label: 'Mentor', path: '/kencana/peserta/mentor' },
          { label: 'Mentee', path: '/kencana/peserta/mentee' },
        ],
      },
      { label: 'Modul', path: '/kencana/modul', icon: 'menu_book' },
      { label: 'Absensi', path: '/kencana/absensi', icon: 'fact_check' },
      { label: 'Tugas', path: '/kencana/tugas', icon: 'assignment' },
      { label: 'Pelanggaran', path: '/kencana/pelanggaran', icon: 'warning' },
      { label: 'Pengaturan', path: '/kencana/settings', icon: 'settings' },
    ],
  },

  psychologist: {
    title: 'Psychologist Portal',
    logo: '/images/bku logo.png',
    sidebarWidth: 'w-64',
    menu: [
      { label: 'Dashboard', path: '/psychologist/dashboard', icon: 'dashboard' },
      { label: 'Pasien', path: '/psychologist/pasien', icon: 'people' },
      { label: 'Asesmen', path: '/psychologist/asesmen', icon: 'psychology' },
      { label: 'Jadwal', path: '/psychologist/jadwal', icon: 'calendar_today' },
      { label: 'Laporan', path: '/psychologist/laporan', icon: 'description' },
      { label: 'Pengaturan', path: '/psychologist/settings', icon: 'settings' },
    ],
  },

  superadmin: {
    title: 'Admin Portal',
    logo: '/images/bku logo.png',
    sidebarWidth: 'w-64',
    menu: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
      { label: 'Manajemen User', path: '/admin/users', icon: 'manage_accounts' },
      { label: 'Manajemen Role', path: '/admin/roles', icon: 'assignment_ind' },
      { label: 'Fakultas', path: '/admin/fakultas', icon: 'account_balance' },
      { label: 'Program Studi', path: '/admin/prodi', icon: 'school' },
      { label: 'Tahun Ajaran', path: '/admin/tahun-ajaran', icon: 'date_range' },
      { label: 'Manajemen Ormawa', path: '/admin/ormawa', icon: 'groups' },
      { label: 'Kelola Tema', path: '/admin/theme', icon: 'palette' },
      { label: 'Audit Log', path: '/admin/audit-log', icon: 'history' },
      { label: 'Pengaturan Sistem', path: '/admin/settings', icon: 'settings' },
    ],
  },
};
```

---

## 9. Checklist Progress

### Phase 1 — Shared Layout System
- [ ] `PortalConfig.js` dibuat dan semua role dikonfigurasi
- [ ] `PortalSidebar.jsx` berfungsi (menu, active state, submenu, badge, collapse)
- [ ] `PortalTopbar.jsx` berfungsi (breadcrumb, user avatar, mobile toggle)
- [ ] `PortalShell.jsx` berfungsi (sidebar + topbar + content area)
- [ ] `AppLayout.jsx` menggunakan PortalShell berdasarkan role

### Phase 2 — Migrasi per Role
- [ ] SuperAdmin dimigrasi dan verified
- [ ] FacultyAdmin dimigrasi dan verified
- [ ] OrmawaAdmin dimigrasi dan verified
- [ ] Student dimigrasi dan verified
- [ ] Kencana dimigrasi dan verified
- [ ] Psychologist dimigrasi dan verified

### Phase 3 — Perbaikan Visual
- [ ] Background seragam di semua portal
- [ ] Font family seragam
- [ ] Logout button theme-aware
- [ ] Branding name konsisten
- [ ] Mobile responsive berfungsi

### Phase 4 — Cleanup
- [ ] File sidebar/layout duplikat dihapus
- [ ] Routing di-update
- [ ] CLAUDE.md di-update
- [ ] Testing final di semua portal

---

*Dokumen ini adalah rencana awal. Detail teknis bisa disesuaikan saat implementasi dimulai.*

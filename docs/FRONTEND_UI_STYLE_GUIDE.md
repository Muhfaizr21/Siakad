# SIAKAD UI Style Guide & Component SOP

**Versi:** 1.0
**Tanggal:** 3 Juni 2026
**Branch:** mei
**Status:** Dokumen Acuan — WAJIB diikuti semua developer

---

## Daftar Isi

1. [Prinsip Dasar](#1-prinsip-dasar)
2. [Design Tokens (CSS Variables)](#2-design-tokens-css-variables)
3. [Tipografi](#3-tipografi)
4. [Warna & Warna Status](#4-warna--warna-status)
5. [Spacing & Layout](#5-spacing--layout)
6. [Komponen Dasar](#6-komponen-dasar)
7. [Struktur Halaman Portal](#7-struktur-halaman-portal)
8. [Komponen Sidebar](#8-komponen-sidebar)
9. [Komponen Header/Topbar](#9-komponen-headertopbar)
10. [Komponen Card](#10-komponen-card)
11. [Komponen Tabel](#11-komponen-tabel)
12. [Komponen Form](#12-komponen-form)
13. [Komponen Button](#13-komponen-button)
14. [Komponen Badge & Status](#14-komponen-badge--status)
15. [Komponen Modal & Dialog](#15-komponen-modal--dialog)
16. [Komponen Toast/Notifikasi](#16-komponen-toastnotifikasi)
17. [Empty State & Loading](#17-empty-state--loading)
18. [Pola Responsive](#18-pola-responsive)
19. [Yang TIDAK BOLEH (Anti-pattern)](#19-yang-tidak-boleh-anti-pattern)
20. [SuperAdmin: Konfigurasi Tema](#20-superadmin-konfigurasi-tema)

---

## 1. Prinsip Dasar

### 1.1 Philosophie

> **Satu sistem, semua portal seragam.**
>
> Semua halaman portal SIAKAD (Student, Faculty, Ormawa, Kencana, Psychologist, SuperAdmin) WAJIB menggunakan design tokens CSS yang sama. Tidak boleh ada hardcoded color, font, atau spacing.

### 1.2 Aturan Utama

```
✅ LAKUKAN → Selalu pakai CSS variables untuk warna, font, spacing
❌ JANGAN  → Jangan hardcoded warna seperti #0D2B55, #C89B3C, #fff, dll
❌ JANGAN  → Jangan inline style untuk hal yang bisa pakai Tailwind class
❌ JANGAN  → Jangan buat sidebar/layout baru per role
```

### 1.3 Prioritas Styling

```
1. Tailwind utility classes
2. CSS variables (--theme-*) untuk warna & tema
3. Inline style HANYA untuk nilai dinamis dari theme store
```

---

## 2. Design Tokens (CSS Variables)

### 2.1 Daftar Lengkap CSS Variables

```css
/* ═══ WARNA UTAMA ═══ */
--theme-primary      /* Navy - tombol, header, accent utama */
--theme-secondary    /* Gold - highlight, badge, accent kedua */
--theme-accent       /* Gold Bright - CTA, elemen spesial */

/* ═══ BACKGROUND & SURFACE ═══ */
--theme-bg           /* Background utama halaman */
--theme-surface      /* Background card, modal, komponen */

/* ═══ WARNA TEKS ═══ */
--theme-text         /* Teks utama/body */
--theme-text-muted   /* Teks subtitle, caption, label */

/* ═══ WARNA HEADING ═══ */
--theme-h1           /* Heading 1 - Judul halaman */
--theme-h2           /* Heading 2 - Section title */
--theme-h3           /* Heading 3 - Card title */
--theme-h4           /* Heading 4 - Detail kecil, table header */

/* ═══ SIDEBAR ═══ */
--theme-sidebar-bg          /* Background sidebar */
--theme-sidebar-text        /* Teks sidebar aktif */
--theme-sidebar-text-muted  /* Teks sidebar non-aktif */

/* ═══ BORDER ═══ */
--theme-border        /* Border default */
--theme-border-muted  /* Border subtle */

/* ═══ WARNA STATE (Semantic) ═══ */
--theme-success       /* Sukses/OK - Green */
--theme-warning       /* Warning/Pending - Amber */
--theme-error         /* Error/Danger - Red */
--theme-info          /* Info/Neutral - Blue */

/* ═══ TOMBOL ═══ */
--theme-btn-radius    /* Border radius tombol */

/* ═══ FONTS ═══ */
--theme-font-headline /* Font untuk heading */
--theme-font-body     /* Font untuk body */

/* ═══ ALIASES (Backward Compatibility) ═══ */
--color-primary       /* = --theme-primary */
--color-secondary     /* = --theme-secondary */
--color-accent        /* = --theme-accent */
--color-background    /* = --theme-bg */
--color-surface       /* = --theme-surface */
--color-text-primary  /* = --theme-text */
--color-text-muted    /* = --theme-text-muted */
--color-heading       /* = --theme-h1 */
--color-border        /* = --theme-border */
--color-success       /* = --theme-success */
--color-warning       /* = --theme-warning */
--color-error         /* = --theme-error */
--color-info          /* = --theme-info */

/* Font aliases */
--font-headline       /* = --theme-font-headline */
--font-body           /* = --theme-font-body */
--font-inter          /* = --theme-font-body */
--font-jakarta        /* = --theme-font-headline */
```

### 2.2 Cara Pakai

```jsx
// ✅ BENAR - Pakai CSS variable
<div style={{ color: 'var(--theme-text)' }}>
<h1 style={{ color: 'var(--theme-h1)' }}>
<button style={{ backgroundColor: 'var(--theme-primary)', borderRadius: 'var(--theme-btn-radius)' }}>

// ✅ LEBIH BAIK - Pakai Tailwind custom color class
<div className="text-[var(--theme-text)]">
<h1 className="text-heading">
<button className="rounded-[var(--theme-btn-radius)]">

// ❌ SALAH - Hardcoded color
<div style={{ color: '#0D2B55' }}>
<button style={{ backgroundColor: 'var(--theme-primary)', color: '#fff' }}>
```

### 2.3 Tailwind Color Bridge

Tailwind sudah di-bridge dengan CSS variables. Pakai prefix `bg-primary`, `text-primary`, dll:

```jsx
// Ini work karena Tailwind v4 @theme bridge
<div className="bg-primary text-secondary">...</div>
<div className="bg-surface border-border">...</div>
<div className="text-text-muted">...</div>
```

---

## 3. Tipografi

### 3.1 Font Stack

| Usage | CSS Variable | Tailwind Class |
|-------|-------------|----------------|
| Heading (H1-H6) | `--theme-font-headline` | `font-headline` |
| Body text | `--theme-font-body` | `font-body` |
| Semua teks | — | `font-inter` |

### 3.2 Heading Hierarchy

```jsx
// ✅ LAKUKAN - Pakai semantic heading dengan CSS variable color
<h1 className="text-2xl font-bold" style={{ color: 'var(--theme-h1)' }}>
  Judul Halaman
</h1>

<h2 className="text-xl font-semibold" style={{ color: 'var(--theme-h2)' }}>
  Section Title
</h2>

<h3 className="text-base font-semibold" style={{ color: 'var(--theme-h3)' }}>
  Card Title
</h3>

<h4 className="text-sm font-medium" style={{ color: 'var(--theme-h4)' }}>
  Table Header / Detail
</h4>
```

### 3.3 Body Text

```jsx
// Teks utama (paragraf, deskripsi)
<p className="text-sm" style={{ color: 'var(--theme-text)' }}>
  Deskripsi isi
</p>

// Teks muted (caption, timestamp, label)
<p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
  Caption / timestamp
</p>
```

### 3.4 Utility Classes untuk Teks

```jsx
<p className="text-body">        {/* = var(--theme-text) */}
<p className="text-muted">       {/* = var(--theme-text-muted) */}
<p className="text-on-dark">     {/* = var(--theme-sidebar-text) - untuk teks di atas sidebar gelap */}
<h1 className="heading">         {/* = var(--theme-h1) */}
<h2 className="heading-2">       {/* = var(--theme-h2) */}
<h3 className="heading-3">       {/* = var(--theme-h3) */}
<p className="heading-4">        {/* = var(--theme-h4) */}
```

---

## 4. Warna & Warna Status

### 4.1 Background

```jsx
// Background halaman utama
<div className="bg-background">  {/* = var(--theme-bg) */}

// Background card / komponen
<div className="bg-surface">     {/* = var(--theme-surface) */}
```

### 4.2 Warna Status (Semantic Colors)

```jsx
// Success - hijau
<span style={{ color: 'var(--theme-success)' }}>Berhasil</span>
<div className="bg-success/10 text-success">Aktif</div>

// Warning - kuning/amber
<span style={{ color: 'var(--theme-warning)' }}>Menunggu</span>
<div className="bg-warning/10 text-warning">Pending</div>

// Error - merah
<span style={{ color: 'var(--theme-error)' }}>Gagal</span>
<div className="bg-error/10 text-error">Error</div>

// Info - biru
<span style={{ color: 'var(--theme-info)' }}>Informasi</span>
<div className="bg-info/10 text-info">Info</div>
```

### 4.3 Border

```jsx
<div className="border border-border">         {/* = var(--theme-border) */}
<div className="border border-border-muted">  {/* = var(--theme-border-muted) */}
```

### 4.4 Sidebar Text

```jsx
// Teks di sidebar (yang background gelap)
<span className="sidebar-text">         {/* = var(--theme-sidebar-text) */}
<span className="sidebar-text-muted">    {/* = var(--theme-sidebar-text-muted) */}
<span className="text-on-dark">        {/* = var(--theme-sidebar-text) */}
```

---

## 5. Spacing & Layout

### 5.1 Standar Spacing Halaman

```
Sidebar width : w-64 (256px)
Content padding: px-4 md:px-6 lg:px-8
Section gap    : space-y-4 atau space-y-6
Card padding   : p-4 md:p-5
```

### 5.2 Container Max Width

```jsx
// Konten utama halaman
<div className="max-w-7xl mx-auto">

// Card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
```

### 5.3 Standar Gap

| Konteks | Gap |
|---------|-----|
| Card dalam grid | `gap-4 md:gap-6` |
| Item dalam list | `gap-3` atau `gap-4` |
| Form fields | `gap-4` |
| Button group | `gap-2` |
| Icon + text | `gap-2` atau `gap-3` |

---

## 6. Komponen Dasar

### 6.1 Page Header Pattern

**SETIAP halaman portal WAJIB punya page header pattern seperti ini:**

```jsx
<section
  className="rounded-xl p-5"
  style={{ backgroundColor: 'var(--theme-surface)' }}
>
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    {/* Kiri: Icon + Judul */}
    <div className="flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}
      >
        <span className="material-symbols-outlined text-xl">icon_name</span>
      </div>
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
          Judul Halaman
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
          Deskripsi singkat halaman
        </p>
      </div>
    </div>

    {/* Kanan: Action buttons */}
    <div className="flex gap-2">
      <button>...</button>
      <button>...</button>
    </div>
  </div>
</section>
```

---

## 7. Struktur Halaman Portal

### 7.1 Template Standar Halaman

```jsx
export default function NamaHalaman() {
  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-inter">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. Page Header */}
        <PageHeader />

        {/* 2. Filters / Search (jika ada) */}
        <FilterSection />

        {/* 3. Content - Cards atau Table */}
        <ContentSection />

        {/* 4. Pagination (jika ada) */}
        <Pagination />

      </div>
    </div>
  );
}
```

### 7.2 Background Halaman

```jsx
// ❌ SALAH - Background berbeda tiap portal
<div className="bg-slate-50">                    // Student
<div className="bg-[radial-gradient(...)]">        // Faculty/Ormawa

// ✅ BENAR - Pakai CSS variable, sama di semua portal
<div style={{ backgroundColor: 'var(--theme-bg)' }}>
// atau
<div className="bg-background">
```

---

## 8. Komponen Sidebar

### 8.1 Struktur Sidebar

```jsx
<div
  className="w-64 h-full flex flex-col"
  style={{ backgroundColor: 'var(--theme-sidebar-bg)' }}
>
  {/* 1. Logo & Branding */}
  <div className="flex items-center gap-3 p-5">
    <img src="/images/bku logo.png" alt="Logo" className="w-10 h-10" />
    <div>
      <p className="text-sm font-bold" style={{ color: 'var(--theme-sidebar-text)' }}>
        PORTAL NAME
      </p>
      <p className="text-xs" style={{ color: 'var(--theme-sidebar-text-muted)' }}>
        Role Name
      </p>
    </div>
  </div>

  {/* 2. Menu Navigation */}
  <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
    {menuItems.map((item) => (
      <SidebarMenuItem key={item.path} item={item} />
    ))}
  </nav>

  {/* 3. Bottom Section - User Profile & Logout */}
  <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
        <span className="text-white text-sm font-bold">AB</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--theme-sidebar-text)' }}>
          Nama User
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--theme-sidebar-text-muted)' }}>
          role@email.com
        </p>
      </div>
      <button className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        style={{ color: '#f87171' }}  // Logout icon color
      >
        <span className="material-symbols-outlined text-lg">logout</span>
      </button>
    </div>
  </div>
</div>
```

### 8.2 Menu Item States

```jsx
// Active (current page)
<div
  className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
  style={{
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderLeft: '3px solid var(--theme-secondary)',
    color: 'var(--theme-sidebar-text)',
  }}
>
  <span className="material-symbols-outlined">icon</span>
  <span className="text-sm font-medium">Menu Label</span>
</div>

// Inactive (not current page)
<div
  className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/5 transition-all cursor-pointer"
  style={{ color: 'var(--theme-sidebar-text-muted)' }}
>
  <span className="material-symbols-outlined">icon</span>
  <span className="text-sm font-medium">Menu Label</span>
</div>
```

---

## 9. Komponen Header/Topbar

### 9.1 Struktur Header

```jsx
<header
  className="h-16 flex items-center justify-between px-6 border-b"
  style={{
    backgroundColor: 'var(--theme-surface)',
    borderColor: 'var(--theme-border)',
  }}
>
  {/* Kiri: Hamburger (mobile) + Breadcrumb */}
  <div className="flex items-center gap-4">
    <button
      onClick={onMenuClick}
      className="lg:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
      style={{ color: 'var(--theme-text)' }}
    >
      <span className="material-symbols-outlined">menu</span>
    </button>

    {/* Breadcrumb */}
    <nav className="flex items-center gap-2 text-sm">
      <span style={{ color: 'var(--theme-text-muted)' }}>Home</span>
      <span style={{ color: 'var(--theme-text-muted)' }}>/</span>
      <span style={{ color: 'var(--theme-text)' }}>Current Page</span>
    </nav>
  </div>

  {/* Kanan: Search + Notifications + User */}
  <div className="flex items-center gap-3">
    {/* Search */}
    <div className="relative hidden md:block">
      <input
        type="text"
        placeholder="Cari..."
        className="w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
        style={{
          backgroundColor: 'var(--theme-bg)',
          color: 'var(--theme-text)',
          border: '1px solid var(--theme-border)',
        }}
      />
      <span
        className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg"
        style={{ color: 'var(--theme-text-muted)' }}
      >
        search
      </span>
    </div>

    {/* Notifications */}
    <button
      className="relative p-2 rounded-lg hover:bg-black/5 transition-colors"
      style={{ color: 'var(--theme-text)' }}
    >
      <span className="material-symbols-outlined">notifications</span>
      {notificationCount > 0 && (
        <span
          className="absolute top-1 right-1 w-2 h-2 rounded-full"
          style={{ backgroundColor: 'var(--theme-error)' }}
        />
      )}
    </button>

    {/* User Avatar */}
    <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-black/5 transition-colors">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: 'var(--theme-primary)' }}
      >
        AB
      </div>
    </button>
  </div>
</header>
```

---

## 10. Komponen Card

### 10.1 Card Standar

```jsx
<div
  className="rounded-xl p-4 md:p-5 hover-scale"
  style={{
    backgroundColor: 'var(--theme-surface)',
    border: '1px solid var(--theme-border)',
  }}
>
  {/* Card Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 15%, transparent)', color: 'var(--theme-secondary)' }}
      >
        <span className="material-symbols-outlined">icon</span>
      </div>
      <div>
        <h3 className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>
          Judul Card
        </h3>
        <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
          Subtitle
        </p>
      </div>
    </div>
    {/* Optional: action menu */}
    <button style={{ color: 'var(--theme-text-muted)' }}>
      <span className="material-symbols-outlined">more_vert</span>
    </button>
  </div>

  {/* Card Body */}
  <div className="text-sm" style={{ color: 'var(--theme-text)' }}>
    Isi card...
  </div>

  {/* Card Footer */}
  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--theme-border-muted)' }}>
    <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
      Footer info
    </span>
  </div>
</div>
```

### 10.2 Card Grid Pattern

```jsx
// Grid untuk cards
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">

  {/* Stat Card */}
  <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
    <div className="flex items-center justify-between mb-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)', color: 'var(--theme-primary)' }}
      >
        <span className="material-symbols-outlined">analytics</span>
      </div>
      <span
        className="text-xs font-medium px-2 py-1 rounded-full"
        style={{ backgroundColor: 'color-mix(in srgb, var(--theme-success) 10%, transparent)', color: 'var(--theme-success)' }}
      >
        +12%
      </span>
    </div>
    <p className="text-2xl font-bold mb-1" style={{ color: 'var(--theme-text)' }}>1,234</p>
    <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>Total Item</p>
  </div>

</div>
```

### 10.3 Card dengan Icon Accent Color

```jsx
// Icon menggunakan secondary color (gold) sebagai accent
<div
  className="w-12 h-12 rounded-xl flex items-center justify-center"
  style={{
    backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 12%, transparent)',
    color: 'var(--theme-secondary)',
  }}
>
  <span className="material-symbols-outlined text-xl">icon</span>
</div>
```

---

## 11. Komponen Tabel

### 11.1 Table Standar

```jsx
<div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--theme-border)' }}>
  <div className="overflow-x-auto">

    <table className="w-full">
      {/* Table Header */}
      <thead style={{ backgroundColor: 'var(--theme-bg)' }}>
        <tr>
          <th
            className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--theme-h4)' }}
          >
            Header 1
          </th>
          <th
            className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--theme-h4)' }}
          >
            Header 2
          </th>
          <th
            className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--theme-h4)' }}
          >
            Aksi
          </th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody style={{ backgroundColor: 'var(--theme-surface)' }}>
        {/* Row */}
        <tr
          className="border-t hover:bg-black/[0.02] transition-colors"
          style={{ borderColor: 'var(--theme-border-muted)' }}
        >
          <td className="px-4 py-3 text-sm" style={{ color: 'var(--theme-text)' }}>
            Data 1
          </td>
          <td className="px-4 py-3 text-sm" style={{ color: 'var(--theme-text)' }}>
            Data 2
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg hover:bg-black/5">
                <span className="material-symbols-outlined text-base" style={{ color: 'var(--theme-primary)' }}>
                  edit
                </span>
              </button>
              <button className="p-1.5 rounded-lg hover:bg-black/5">
                <span className="material-symbols-outlined text-base" style={{ color: 'var(--theme-error)' }}>
                  delete
                </span>
              </button>
            </div>
          </td>
        </tr>

        {/* Alternate row (optional zebra) */}
        <tr
          className="border-t"
          style={{ borderColor: 'var(--theme-border-muted)', backgroundColor: 'var(--theme-bg)' }}
        >
          ...
        </tr>
      </tbody>
    </table>

  </div>
</div>
```

### 11.2 Table dengan Action Dropdown

```jsx
<td className="px-4 py-3">
  <div className="relative">
    <button
      onClick={() => setOpen(!open)}
      className="p-2 rounded-lg hover:bg-black/5"
      style={{ color: 'var(--theme-text-muted)' }}
    >
      <span className="material-symbols-outlined">more_vert</span>
    </button>

    {open && (
      <div
        className="absolute right-0 mt-1 w-40 rounded-xl shadow-lg py-1 z-10 border"
        style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
      >
        <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/[0.02]"
          style={{ color: 'var(--theme-text)' }}>
          <span className="material-symbols-outlined text-base">visibility</span>
          Detail
        </button>
        <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/[0.02]"
          style={{ color: 'var(--theme-text)' }}>
          <span className="material-symbols-outlined text-base">edit</span>
          Edit
        </button>
        <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/[0.02]"
          style={{ color: 'var(--theme-error)' }}>
          <span className="material-symbols-outlined text-base">delete</span>
          Hapus
        </button>
      </div>
    )}
  </div>
</td>
```

---

## 12. Komponen Form

### 12.1 Input Field Standar

```jsx
<div className="space-y-1.5">
  <label className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
    Label Field <span style={{ color: 'var(--theme-error)' }}>*</span>
  </label>
  <input
    type="text"
    placeholder="Placeholder..."
    className="w-full px-4 py-2.5 rounded-lg text-sm transition-all"
    style={{
      backgroundColor: 'var(--theme-bg)',
      color: 'var(--theme-text)',
      border: '1px solid var(--theme-border)',
    }}
    onFocus={(e) => {
      e.target.style.borderColor = 'var(--theme-primary)';
      e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--theme-primary) 15%, transparent)';
    }}
    onBlur={(e) => {
      e.target.style.borderColor = 'var(--theme-border)';
      e.target.style.boxShadow = 'none';
    }}
  />
  <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
    Helper text
  </p>
</div>
```

### 12.2 Select Field

```jsx
<div className="space-y-1.5">
  <label className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
    Pilih Opsi
  </label>
  <div className="relative">
    <select
      className="w-full px-4 py-2.5 rounded-lg text-sm appearance-none pr-10 cursor-pointer"
      style={{
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-text)',
        border: '1px solid var(--theme-border)',
      }}
    >
      <option value="">Pilih...</option>
      <option value="1">Opsi 1</option>
      <option value="2">Opsi 2</option>
    </select>
    <span
      className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none"
      style={{ color: 'var(--theme-text-muted)' }}
    >
      expand_more
    </span>
  </div>
</div>
```

### 12.3 Textarea

```jsx
<textarea
  rows={4}
  placeholder="Deskripsi..."
  className="w-full px-4 py-3 rounded-lg text-sm resize-none"
  style={{
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-text)',
    border: '1px solid var(--theme-border)',
  }}
/>
```

### 12.4 Checkbox & Radio

```jsx
// Checkbox
<label className="flex items-center gap-3 cursor-pointer">
  <input
    type="checkbox"
    className="w-4 h-4 rounded"
    style={{ accentColor: 'var(--theme-primary)' }}
  />
  <span className="text-sm" style={{ color: 'var(--theme-text)' }}>
    Setuju dengan syarat dan ketentuan
  </span>
</label>

// Radio
<div className="flex items-center gap-6">
  {['Pria', 'Wanita'].map((gender) => (
    <label key={gender} className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name="gender"
        value={gender}
        className="w-4 h-4"
        style={{ accentColor: 'var(--theme-primary)' }}
      />
      <span className="text-sm" style={{ color: 'var(--theme-text)' }}>{gender}</span>
    </label>
  ))}
</div>
```

### 12.5 File Upload

```jsx
<label
  className="flex flex-col items-center justify-center gap-2 w-full p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-primary"
  style={{
    borderColor: 'var(--theme-border)',
    backgroundColor: 'var(--theme-bg)',
  }}
>
  <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--theme-text-muted)' }}>
    cloud_upload
  </span>
  <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
    Klik untuk upload
  </span>
  <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
    PNG, JPG, PDF. Maks 2MB
  </span>
  <input type="file" className="hidden" />
</label>
```

---

## 13. Komponen Button

### 13.1 Button Primary

```jsx
<button
  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
  style={{
    backgroundColor: 'var(--theme-primary)',
    borderRadius: 'var(--theme-btn-radius)',
  }}
  disabled={isLoading}
>
  {isLoading ? (
    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
  ) : (
    <span className="material-symbols-outlined text-sm">save</span>
  )}
  Simpan
</button>
```

### 13.2 Button Secondary/Outline

```jsx
<button
  className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:bg-black/[0.03]"
  style={{
    border: '1px solid var(--theme-border)',
    color: 'var(--theme-text)',
    borderRadius: 'var(--theme-btn-radius)',
  }}
>
  <span className="material-symbols-outlined text-sm">close</span>
  Batal
</button>
```

### 13.3 Button Ghost

```jsx
<button
  className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:bg-black/[0.03]"
  style={{ color: 'var(--theme-text-muted)' }}
>
  <span className="material-symbols-outlined text-sm">refresh</span>
  Reset
</button>
```

### 13.4 Button Danger

```jsx
<button
  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:opacity-90"
  style={{
    backgroundColor: 'var(--theme-error)',
    borderRadius: 'var(--theme-btn-radius)',
  }}
>
  <span className="material-symbols-outlined text-sm">delete</span>
  Hapus
</button>
```

### 13.5 Icon Button

```jsx
<button
  className="p-2 rounded-lg transition-colors hover:bg-black/[0.05]"
  style={{ color: 'var(--theme-text-muted)' }}
  title="Edit"
>
  <span className="material-symbols-outlined text-lg">edit</span>
</button>
```

### 13.6 Button Group

```jsx
<div className="flex items-center gap-3">
  <button className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
    style={{ backgroundColor: 'var(--theme-primary)', borderRadius: 'var(--theme-btn-radius)' }}>
    Simpan
  </button>
  <button className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold"
    style={{ border: '1px solid var(--theme-border)', color: 'var(--theme-text)', borderRadius: 'var(--theme-btn-radius)' }}>
    Batal
  </button>
</div>
```

---

## 14. Komponen Badge & Status

### 14.1 Status Badge

```jsx
// Active / Success
<span
  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
  style={{
    backgroundColor: 'color-mix(in srgb, var(--theme-success) 12%, transparent)',
    color: 'var(--theme-success)',
  }}
>
  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--theme-success)' }} />
  Aktif
</span>

// Pending / Warning
<span
  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
  style={{
    backgroundColor: 'color-mix(in srgb, var(--theme-warning) 12%, transparent)',
    color: 'var(--theme-warning)',
  }}
>
  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--theme-warning)' }} />
  Pending
</span>

// Inactive / Error
<span
  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
  style={{
    backgroundColor: 'color-mix(in srgb, var(--theme-error) 12%, transparent)',
    color: 'var(--theme-error)',
  }}
>
  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--theme-error)' }} />
  Nonaktif
</span>

// Info
<span
  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
  style={{
    backgroundColor: 'color-mix(in srgb, var(--theme-info) 12%, transparent)',
    color: 'var(--theme-info)',
  }}
>
  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--theme-info)' }} />
  Baru
</span>
```

### 14.2 Role Badge

```jsx
<span
  className="px-3 py-1 rounded-lg text-xs font-bold"
  style={{
    backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 15%, transparent)',
    color: 'var(--theme-secondary)',
  }}
>
  MAHASISWA
</span>
```

### 14.3 Counter Badge

```jsx
{count > 0 && (
  <span
    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white"
    style={{ backgroundColor: 'var(--theme-error)' }}
  >
    {count > 99 ? '99+' : count}
  </span>
)}
```

---

## 15. Komponen Modal & Dialog

### 15.1 Modal Standar

```jsx
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
          style={{ backgroundColor: 'var(--theme-surface)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--theme-border)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {children}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 border-t" style={{ borderColor: 'var(--theme-border)' }}>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}
            >
              Batal
            </button>
            <button
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
```

### 15.2 Confirm Dialog

```jsx
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Hapus', isLoading = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'color-mix(in srgb, var(--theme-error) 10%, transparent)' }}
        >
          <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--theme-error)' }}>
            warning
          </span>
        </div>
        <div>
          <p className="text-sm" style={{ color: 'var(--theme-text)' }}>{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}>
          Batal
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: 'var(--theme-error)' }}
        >
          {isLoading ? 'Menghapus...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};
```

---

## 16. Komponen Toast/Notifikasi

### 16.1 Toast Component

```jsx
const Toast = ({ type, message, onClose }) => {
  const config = {
    success: {
      bg: 'var(--theme-success)',
      icon: 'check_circle',
      bgLight: 'color-mix(in srgb, var(--theme-success) 8%, white)',
      textLight: 'var(--theme-success)',
    },
    error: {
      bg: 'var(--theme-error)',
      icon: 'error',
      bgLight: 'color-mix(in srgb, var(--theme-error) 8%, white)',
      textLight: 'var(--theme-error)',
    },
    warning: {
      bg: 'var(--theme-warning)',
      icon: 'info',
      bgLight: 'color-mix(in srgb, var(--theme-warning) 8%, white)',
      textLight: 'var(--theme-warning)',
    },
  }[type] || config.info;

  return (
    <div
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg animate-in slide-in-from-top-4 duration-300"
      style={{
        backgroundColor: config.bgLight,
        color: config.textLight,
      }}
    >
      <span className="material-symbols-outlined">{config.icon}</span>
      <span className="text-sm font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 rounded hover:bg-black/5"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
};

// Usage:
{toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
```

### 16.2 Inline Alert (bukan toast)

```jsx
<div
  className="flex items-start gap-3 p-4 rounded-xl"
  style={{
    backgroundColor: 'color-mix(in srgb, var(--theme-warning) 8%, transparent)',
    border: '1px solid color-mix(in srgb, var(--theme-warning) 25%, transparent)',
    color: 'var(--theme-warning)',
  }}
>
  <span className="material-symbols-outlined mt-0.5">info</span>
  <div>
    <p className="text-sm font-semibold">Perhatian</p>
    <p className="text-xs mt-0.5 opacity-80">Pesan peringatan di sini...</p>
  </div>
</div>
```

---

## 17. Empty State & Loading

### 17.1 Empty State

```jsx
const EmptyState = ({ icon = 'folder_open', title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--theme-text-muted) 8%, transparent)',
          color: 'var(--theme-text-muted)',
        }}
      >
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
        {title}
      </h3>
      <p className="text-sm max-w-sm mb-6" style={{ color: 'var(--theme-text-muted)' }}>
        {description}
      </p>
      {action}
    </div>
  );
};

// Usage:
<EmptyState
  icon="search_off"
  title="Data tidak ditemukan"
  description="Coba ubah filter atau kata kunci pencarian Anda."
  action={
    <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
      style={{ backgroundColor: 'var(--theme-primary)' }}>
      Reset Filter
    </button>
  }
/>
```

### 17.2 Loading Spinner

```jsx
const LoadingSpinner = ({ size = 'md', text = 'Memuat...' }) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className={`${sizes[size]} border-4 border-t-transparent rounded-full animate-spin`}
        style={{ borderColor: 'var(--theme-primary)', borderTopColor: 'transparent' }}
      />
      <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{text}</p>
    </div>
  );
};

// Full page loading:
<div className="flex items-center justify-center min-h-[60vh]">
  <LoadingSpinner />
</div>
```

### 17.3 Skeleton Loading

```jsx
const Skeleton = ({ className }) => {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: 'var(--theme-border-muted)' }}
    />
  );
};

// Usage:
<div className="space-y-4">
  <Skeleton className="h-20 w-full" />
  <Skeleton className="h-12 w-3/4" />
  <Skeleton className="h-12 w-1/2" />
</div>
```

---

## 18. Pola Responsive

### 18.1 Breakpoint Reference

| Breakpoint | Tailwind | Usage |
|-----------|----------|-------|
| Mobile | `<640px` | Default |
| Tablet | `sm: 640px+` | `sm:*` |
| Medium | `md: 768px+` | `md:*` |
| Large | `lg: 1024px+` | `lg:*` |
| Extra Large | `xl: 1280px+` | `xl:*` |

### 18.2 Grid Responsive

```jsx
// Cards: 1 col mobile → 2 col tablet → 3 col desktop → 4 col large
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">

// Stat cards: 2 col mobile → 4 col desktop
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
```

### 18.3 Sidebar Responsive

```jsx
<div className="hidden lg:block">  {/* Desktop: always visible */}
  <Sidebar />
</div>

{/* Mobile: shown with overlay when toggled */}
{mobileOpen && (
  <>
    <button onClick={() => setMobileOpen(false)} className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
    <div className="lg:hidden fixed left-0 top-0 bottom-0 z-50">
      <Sidebar />
    </div>
  </>
)}
```

---

## 19. Yang TIDAK BOLEH (Anti-pattern)

### ❌ Dilarang Keras

```jsx
// 1. Hardcoded color
<div style={{ color: '#0D2B55' }}>          // GANTI: var(--theme-primary)
<div style={{ color: '#fff' }}>              // GANTI: var(--theme-sidebar-text)
<div style={{ backgroundColor: '#C89B3C' }}>  // GANTI: var(--theme-secondary)

// 2. Tailwind arbitrary color yang tidak dari theme
<div className="text-slate-700">              // GANTI: text-[var(--theme-text)] atau .text-body
<div className="bg-slate-50">                // GANTI: bg-[var(--theme-bg)] atau .bg-background
<div className="border-slate-200">           // GANTI: border-[var(--theme-border)] atau .border

// 3. Shadow yang hardcoded
<div className="shadow-md">                   // GANTI: gunakan tailwind shadow yang sudah ada

// 4. Font family hardcoded
<div className="font-sans">                   // GANTI: font-inter atau font-body
<div className="font-serif">                 // JANGAN PAKAI di portal

// 5. Border radius berbeda dari theme
<button className="rounded">                  // GANTI: rounded-[var(--theme-btn-radius)]

// 6. Sidebar dengan warna berbeda per role
// JANGAN buat file sidebar baru untuk role lain
// GANTI: gunakan PortalSidebar.jsx dengan konfigurasi

// 7. Background halaman berbeda per portal
<StudentPage className="bg-slate-50" />
<FacultyPage className="bg-[radial-gradient(...)]" />
// GANTI: semua pakai bg-[var(--theme-bg)]

// 8. Import sidebar/layout dari folder role
import Sidebar from '../../components/layout/Sidebar'  // ✅ ini OK
import Sidebar from '../FacultyAdmin/components/Sidebar'  // ❌ ini JANGAN

// 9. Inline style untuk hal statis
<div style={{ padding: '16px' }}>           // GANTI: className="p-4"
<div style={{ marginTop: '12px' }}>         // GANTI: className="mt-3"
```

### ❌ Contoh Sebelum & Sesudah

```jsx
// SEBELUM ❌
<div
  className="bg-slate-50 p-6 rounded-lg shadow-md"
  style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
>
  <h2 className="text-xl font-bold text-slate-800 mb-2">Judul</h2>
  <p className="text-slate-600">Deskripsi</p>
</div>

// SESUDAH ✅
<div
  className="p-4 md:p-6 rounded-xl shadow-sm"
  style={{
    backgroundColor: 'var(--theme-surface)',
    color: 'var(--theme-text)',
    border: '1px solid var(--theme-border)',
  }}
>
  <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--theme-h2)' }}>
    Judul
  </h2>
  <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
    Deskripsi
  </p>
</div>
```

---

## 20. SuperAdmin: Konfigurasi Tema

### 20.1 Akses Pengaturan Tema

SuperAdmin bisa mengatur tampilan via:

```
SuperAdmin → Pengaturan → Tema / Theme
```

Sub-menu yang tersedia:
- **Warna** — Primary, Secondary, Accent, Background, Surface
- **Tipografi** — Font heading, font body
- **Branding** — Logo, favicon, nama situs
- **Komponen** — Sidebar colors, button radius
- **Status Colors** — Success, warning, error, info

### 20.2 Field yang Bisa Dikonfigurasi

| Field | CSS Variable | Efek |
|-------|-------------|------|
| Primary Color | `--theme-primary` | Tombol utama, header, active state |
| Secondary Color | `--theme-secondary` | Badge accent, highlight, icon accent |
| Accent Color | `--theme-accent` | CTA button, special elements |
| Background | `--theme-bg` | Background halaman |
| Surface | `--theme-surface` | Card, modal, input background |
| Sidebar BG | `--theme-sidebar-bg` | Background sidebar |
| Sidebar Text | `--theme-sidebar-text` | Teks aktif di sidebar |
| Sidebar Muted | `--theme-sidebar-text-muted` | Teks non-aktif di sidebar |
| Button Radius | `--theme-btn-radius` | Border radius semua tombol |
| Font Headline | `--theme-font-headline` | Font untuk H1-H6 |
| Font Body | `--theme-font-body` | Font untuk body text |

### 20.3 Auto-calculation

Sistem theme store secara otomatis menghitung:

- Text color pada background (terang/gelap otomatis)
- Muted text color
- Heading color (berdasarkan background luminance)
- Contrast ratio (WCAG compliance check)

**Developer TIDAK PERLU** menghitung manually. Cukup set base colors, sisanya auto.

---

## 21. Checklist Sebelum Merge

Sebelum push/merge, pastikan:

- [ ] Semua warna pakai CSS variables (`var(--theme-*)`)
- [ ] Tidak ada hardcoded hex color
- [ ] Font family dari CSS variables
- [ ] Border radius pakai `var(--theme-btn-radius)` untuk tombol
- [ ] Border pakai `var(--theme-border)`
- [ ] Background pakai `var(--theme-bg)` / `var(--theme-surface)`
- [ ] Teks pakai `var(--theme-text)` / `var(--theme-text-muted)`
- [ ] Heading warna dari `var(--theme-h1)` sampai `var(--theme-h4)`
- [ ] Responsive dengan breakpoint yang tepat
- [ ] Empty state tersedia untuk list/table
- [ ] Loading state tersedia untuk async operations
- [ ] Tidak ada console.error untuk error handling yang tidak perlu

---

## 22. Referensi Cepat (Cheatsheet)

```jsx
// WARNA
bg-primary      → background-color: var(--theme-primary)
bg-surface      → background-color: var(--theme-surface)
text-primary    → color: var(--theme-primary)
text-muted      → color: var(--theme-text-muted)
border-border   → border-color: var(--theme-border)
text-heading    → color: var(--theme-h1)

// TEKS
<h1 style={{ color: 'var(--theme-h1)' }}>  // Heading 1
<p className="text-body">                   // Body text
<p className="text-muted">                  // Muted text

// CARD
<div className="rounded-xl p-5" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>

// BUTTON PRIMARY
<button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: 'var(--theme-primary)' }}>

// BUTTON SECONDARY
<button className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}>

// SIDEBAR MENU ACTIVE
<div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderLeft: '3px solid var(--theme-secondary)', color: 'var(--theme-sidebar-text)' }}>

// SIDEBAR MENU INACTIVE
<div style={{ color: 'var(--theme-sidebar-text-muted)' }}>
```

---

*Dokumen ini adalah standar WAJIB untuk pengembangan frontend SIAKAD.*
*Semua pull request akan di-review berdasarkan checklist ini.*
*Update terakhir: 3 Juni 2026*
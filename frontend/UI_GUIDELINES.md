# Panduan Standar UI Siakad (Siakad UI & Style Guidelines)

Dokumen ini adalah panduan referensi terpadu (Style Guide) untuk seluruh pengembangan frontend Siakad. Panduan ini menggabungkan standar CSS/Tema, komponen Tabel (DataTable), dan komponen Kartu Statistik (StatsCard). Gunakan dokumen ini sebagai acuan utama atau instruksi kepada AI untuk memastikan konsistensi antarmuka.

---

## 1. Standar Variabel Warna & Tipografi

### Variabel Warna (Theme Tokens)
Selalu gunakan variabel CSS bawaan proyek daripada warna solid *hardcoded* (`bg-blue-500`, `text-slate-900`).
*   **Backgrounds:** `bg-[var(--theme-bg)]` (Latar utama), `bg-[var(--theme-surface)]` (Latar kartu)
*   **Teks:** `text-[var(--theme-text)]` (Judul), `text-[var(--theme-text-muted)]` (Deskripsi), `text-[var(--theme-text-subtle)]` (Placeholder)
*   **Border:** `border-[var(--theme-border)]` (Garis utama), `border-[var(--theme-border-muted)]` (Garis tipis)
*   **Primary/Brand:** `bg-[var(--theme-primary)]`, `text-[var(--theme-primary)]`, `bg-[var(--theme-primary-light)]`
*   **Status Khusus:** Gunakan akhiran `-success`, `-warning`, `-error`, `-info` beserta varian `-light` nya.

### Tipografi (Two-Font System)
*   **Font Judul (`font-headline`):** Digunakan untuk `<h1>`, `<h2>`, `<CardTitle>`, atau angka metrik besar.
*   **Font Isi (`font-body`):** Digunakan untuk teks panjang, paragraf, isi tabel, dan form input.

---

## 2. Desain Komponen Tabel (DataTable)

**DILARANG** menggunakan tag `<table>` native HTML secara manual. Selalu gunakan komponen global `<DataTable>` (`@/components/ui/DataTable`).

### Aturan Kolom & Tipografi Tabel
*   **Teks Utama:** `text-[13px] font-bold text-[var(--theme-text)] leading-tight`
*   **Teks Subjudul:** `text-[11px] font-medium text-[var(--theme-text-muted)] leading-relaxed`
*   **Badge/Status:** `px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full`

### Kolom Aksi & Konfirmasi Hapus
*   **Wajib Rata Tengah:** Tambahkan class `text-center` pada konfigurasi kolom.
*   **Tombol Aksi:** Gunakan ikon dari `lucide-react` dengan wrapper transparan `p-1.5 rounded-lg`.
*   **Konfirmasi Hapus:** Wajib menggunakan `<DeleteConfirmModal>` dari `@/components/ui/DeleteConfirmModal`.

---

## 3. Desain Komponen Kartu Statistik (StatsCard)

Gunakan komponen `<PrimaryStatsCard>` dan `<SecondaryStatsCard>` dari `@/components/ui/StatsCard` untuk menyajikan metrik dashboard. **DILARANG** membuat struktur div raksasa dengan animasi manual secara berulang.

### PrimaryStatsCard (Kartu Utama)
Kartu besar dengan efek ikon *watermark* dinamis di latar belakang saat di-hover.
*   **Props:** `title`, `value`, `icon`, `colorTheme` (info, primary, success, warning, error), `badgeText`, `badgeIcon`, `onClick`.
*   **Penting:** Komponen ini **TIDAK BOLEH** menggunakan class Tailwind *hardcoded* (`bg-blue-50`, `text-emerald-500`, dsb). Semua style *hover* dan teks harus di-map ke variabel tema seperti `bg-[var(--theme-primary-light)]`.

### SecondaryStatsCard (Kartu Ringkas/Insight)
Kartu dengan tata letak ikon dan judul sejajar, cocok untuk agregasi data pelengkap.
*   **Props:** `title`, `value`, `subtitle`, `icon`, `colorTheme` (info, primary, success, warning, error).
*   **Penting:** Sama seperti `PrimaryStatsCard`, wajib menggunakan variabel global untuk *background* (`var(--theme-surface)`), border (`var(--theme-border)`), dan teks (`var(--theme-text)`).

---

## Panduan Cepat Menginstruksikan AI
Saat meminta AI untuk mendesain atau merefaktor halaman baru, gunakan *prompt* berikut:
> *"Tolong refaktor halaman ini dengan mengikuti standar di `UI_GUIDELINES.md`. Pastikan tabel memakai DataTable, kartu metrik memakai StatsCard, dan warna-warnanya memakai palet `var(--theme-*)`."*

# PROMPT UNTUK AI AGENT — BKU Hub Component Consolidation

---

## KONTEKS PROJECT

Ini adalah project React + Vite bernama **BKU Hub**, sebuah sistem informasi kampus untuk Universitas Bhakti Kencana (UBK). Project menggunakan Tailwind CSS v4, Zustand untuk state management, dan React Router untuk routing.

Project ini memiliki sistem tema dinamis melalui `src/store/useThemeStore.js` — artinya Super Admin bisa mengganti warna, font, dan tampilan seluruh aplikasi dari panel admin. Sistem ini bekerja melalui CSS Variables yang didefinisikan di `src/index.css` seperti `--theme-primary`, `--theme-secondary`, `--theme-sidebar-bg`, dll.

---

## MASALAH YANG HARUS DISELESAIKAN

### Masalah 1: Komponen UI terduplikat di setiap role

Saat ini, setiap role (FacultyAdmin, SuperAdmin, OrmawaAdmin) menyimpan salinan komponen UI mereka sendiri secara lokal:

```
src/pages/FacultyAdmin/components/     ← punya button.jsx, input.jsx, dialog.jsx, dll
src/pages/SuperAdmin/components/ui/    ← punya button.jsx, input.jsx, dialog.jsx, dll (identik)
src/pages/OrmawaAdmin/components/ui/   ← punya button.jsx, input.jsx, dialog.jsx, dll (identik)
```

Komponen-komponen tersebut **identik satu sama lain** (sudah dicek dengan diff — hasilnya sama persis).

Padahal sudah ada folder global: `src/components/ui/` yang seharusnya menjadi satu-satunya sumber komponen UI.

### Masalah 2: Dua sistem styling yang konflik

- Komponen di `src/components/ui/` (global) → menggunakan **CSS Variables** seperti `var(--theme-primary)`, `var(--theme-btn-radius)`, dll → otomatis ikut ThemeStore
- Komponen lokal per-role (button.jsx, input.jsx, dll) → menggunakan **shadcn/CVA pattern** dengan class Tailwind seperti `bg-primary`, `text-primary-foreground` → **TIDAK ikut ThemeStore**

Akibatnya: ketika Super Admin mengganti tema dari panel, perubahan warna hanya berlaku pada halaman yang pakai komponen global, sementara halaman FacultyAdmin, SuperAdmin, dan OrmawaAdmin tetap menggunakan warna lama.

### Masalah 3: Banyak komponen penting belum ada di global

Folder `src/components/ui/` saat ini hanya berisi:
```
Button.jsx, DataTable.jsx, Dialog.jsx, EmptyState.jsx,
Input.jsx, Label.jsx, PageHeader.jsx, Select.jsx,
Skeleton.jsx, SkeletonGroups.jsx, StatCard.jsx,
StatusBadge.jsx, Switch.jsx, Tabs.jsx, Textarea.jsx, index.js
```

Padahal komponen berikut ini dipakai di banyak halaman tapi belum ada di global:
`badge`, `card`, `table`, `tooltip`, `avatar`, `checkbox`, `dropdown-menu`, `popover`, `separator`, `spinner`, `progress`, `form`, `breadcrumb`, `accordion`, `alert`, `alert-dialog`, `calendar`, `chart`, `command`, `drawer`, `hover-card`, `pagination`, `radio-group`, `scroll-area`, `sheet`, `slider`, `toggle`, `toast`, `toaster`, `sonner`, `field`, `input-group`, `button-group`, `stat-card`, `empty`, dll.

---

## TUGAS YANG HARUS DILAKUKAN

### FASE 1 — Pindahkan komponen lokal ke global

Ambil semua file dari:
- `src/pages/SuperAdmin/components/ui/` (folder ini paling lengkap, jadikan referensi utama)
- `src/pages/FacultyAdmin/components/` (ambil yang belum ada di SuperAdmin)
- `src/pages/OrmawaAdmin/components/ui/` (cek jika ada yang berbeda)

Pindahkan semua file tersebut ke `src/components/ui/`.

**Aturan penamaan:** gunakan format PascalCase untuk konsistensi dengan file yang sudah ada (misal `badge.jsx` → `Badge.jsx`, `card.jsx` → `Card.jsx`). Kecuali untuk hooks seperti `use-toast.js` dan `use-mobile.jsx` yang tetap camelCase.

**File yang TIDAK perlu dipindahkan** (ini bukan komponen UI umum, biarkan di tempatnya):
- `FacultyLayout.jsx` → biarkan di folder masing-masing role
- `SuperAdminLayout.jsx` → biarkan
- `TopNavBar.jsx` → biarkan (ada versi per-role yang sedikit berbeda)
- `DeleteConfirmModal.jsx` → pindahkan ke `src/components/ui/DeleteConfirmModal.jsx`

### FASE 2 — Update `src/components/ui/index.js`

Tambahkan export untuk semua komponen baru yang dipindahkan. Format export mengikuti pola yang sudah ada:

```js
// Untuk komponen dengan default export:
export { default as Badge } from './Badge';
export { default as Card } from './Card';

// Untuk komponen dengan named export (shadcn style):
export { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './Card';
export { Badge, badgeVariants } from './Badge';
export { Avatar, AvatarImage, AvatarFallback } from './Avatar';
// dst.
```

Cek setiap file komponen untuk mengetahui apakah mereka menggunakan default export atau named export, lalu sesuaikan.

### FASE 3 — Ganti semua import lokal menjadi import global

Cari seluruh file di `src/pages/` yang menggunakan import lokal seperti:

```js
// Pattern yang harus diganti:
import { Button } from './components/button'
import { Button } from './components/ui/button'
import { Input } from '../components/input'
import { Card, CardContent } from './components/ui/card'
import { Badge } from './components/badge'
// dst.
```

Ganti semua menjadi:

```js
// Pattern yang benar (import dari global):
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
// dst.
```

**File yang perlu dicek untuk penggantian import:**

Di `src/pages/FacultyAdmin/`:
- `ProdiRBAC.jsx`
- `FacultyDashboard.jsx`
- `Psikolog.jsx`
- `Pkkmb.jsx`
- `Beasiswa.jsx`
- `Settings.jsx`
- `TahunAkademik.jsx`
- (cek juga file lain di folder ini)

Di `src/pages/SuperAdmin/`:
- `AuditLog.jsx`
- `SecuritySettings.jsx`
- `UserManagement.jsx`
- `KelolaFakultas.jsx`
- `KelolaBeasiswa.jsx`
- `AdminDashboard.jsx`
- `ContentManagement.jsx`
- `StudentDirectory.jsx`
- `LecturerDirectory.jsx`
- `KelolaOrganisasi.jsx`
- `KelolaProdi.jsx`
- (cek juga file lain di folder ini)

Di `src/pages/OrmawaAdmin/` dan `src/pages/Psychologist/`:
- Cek semua file `.jsx` dan ganti import lokal yang ada.

### FASE 4 — Hapus folder komponen lokal yang sudah tidak dipakai

Setelah semua import sudah diganti, hapus folder-folder berikut:
```
src/pages/FacultyAdmin/components/        ← hapus seluruh folder (kecuali FacultyLayout.jsx dan sub-folder layout)
src/pages/SuperAdmin/components/ui/       ← hapus seluruh sub-folder ui/ saja
src/pages/OrmawaAdmin/components/ui/      ← hapus seluruh sub-folder ui/ saja
```

**PENTING:** Sebelum menghapus, pastikan tidak ada lagi file yang masih mengimport dari folder tersebut. Lakukan pencarian dengan grep atau find untuk memastikan.

### FASE 5 — Verifikasi akhir

Setelah semua langkah selesai:

1. Jalankan `grep -r "from.*\./components" src/pages/` — hasilnya harus kosong (tidak ada lagi import lokal ke komponen UI)
2. Jalankan `grep -r "from.*\.\.\/components" src/pages/` — cek hasilnya, pastikan yang tersisa hanya import ke `src/components/layout/` (bukan `src/components/ui/`)
3. Pastikan `src/components/ui/index.js` sudah mengekspor semua komponen
4. Pastikan tidak ada file `.jsx` yang masih mereferensikan path `./components/ui/button` atau sejenisnya

---

## CATATAN PENTING

### Jangan ubah styling komponen global yang sudah ada

File-file berikut di `src/components/ui/` sudah menggunakan CSS Variables dan sudah terintegrasi dengan ThemeStore. **JANGAN diubah, JANGAN di-replace** dengan versi shadcn/CVA:
- `Button.jsx`
- `Input.jsx`
- `Dialog.jsx`
- `Select.jsx`
- `Tabs.jsx`
- `Switch.jsx`
- `Textarea.jsx`
- `Label.jsx`

Komponen-komponen baru yang dipindahkan dari folder lokal boleh tetap menggunakan shadcn/CVA pattern — itu acceptable untuk sementara. Yang penting semua ada di satu tempat dulu.

### Alias `@/` sudah dikonfigurasi

Project ini sudah menggunakan path alias `@/` yang mengarah ke `src/`. Jadi `@/components/ui/Button` = `src/components/ui/Button.jsx`. Gunakan alias ini untuk semua import.

### Komponen shadcn menggunakan named export

Komponen dari shadcn (yang ada di folder lokal per-role) umumnya menggunakan named export:
```js
// Contoh card.jsx (shadcn):
export { Card, CardContent, CardHeader, CardTitle }

// Bukan:
export default Card
```

Pastikan export di `index.js` mengikuti pola yang sesuai dengan masing-masing file.

---

## STRUKTUR AKHIR YANG DIHARAPKAN

```
src/
├── components/
│   └── ui/
│       ├── index.js              ← export semua komponen
│       ├── Button.jsx            ← sudah ada (CSS Variables)
│       ├── Input.jsx             ← sudah ada (CSS Variables)
│       ├── Dialog.jsx            ← sudah ada (CSS Variables)
│       ├── Badge.jsx             ← BARU (dipindah dari lokal)
│       ├── Card.jsx              ← BARU (dipindah dari lokal)
│       ├── Table.jsx             ← BARU (dipindah dari lokal)
│       ├── Avatar.jsx            ← BARU (dipindah dari lokal)
│       ├── Checkbox.jsx          ← BARU (dipindah dari lokal)
│       ├── Tooltip.jsx           ← BARU (dipindah dari lokal)
│       ├── ...semua komponen lainnya
│
├── pages/
│   ├── FacultyAdmin/
│   │   ├── components/
│   │   │   └── FacultyLayout.jsx  ← tetap di sini (layout role-specific)
│   │   ├── FacultyDashboard.jsx   ← import dari @/components/ui/
│   │   └── ...
│   ├── SuperAdmin/
│   │   ├── components/
│   │   │   ├── SuperAdminLayout.jsx ← tetap di sini
│   │   │   ├── TopNavBar.jsx        ← tetap di sini
│   │   │   └── Sidebar.jsx          ← tetap di sini
│   │   │   (tidak ada lagi sub-folder ui/)
│   │   ├── AdminDashboard.jsx     ← import dari @/components/ui/
│   │   └── ...
│   └── OrmawaAdmin/
│       ├── components/
│       │   └── (hanya layout files)
│       └── ...
```

---

## PRIORITAS PENGERJAAN

Jika tidak bisa selesai sekaligus, prioritaskan urutan ini:

1. **Paling prioritas:** Pindahkan dan register `badge`, `card`, `table`, `avatar`, `checkbox`, `dropdown-menu`, `tooltip`, `spinner` — ini yang paling banyak dipakai
2. **Prioritas kedua:** Ganti import di `SuperAdmin/` dan `FacultyAdmin/` terlebih dahulu karena ini yang paling aktif dikembangkan
3. **Prioritas ketiga:** Ganti import di `OrmawaAdmin/` dan `Psychologist/`
4. **Terakhir:** Hapus folder lokal setelah semua import sudah bersih

---

Selesaikan secara sistematis, file per file. Jika ada komponen yang memiliki perbedaan kecil antara versi lokal satu role dengan role lain, gunakan versi dari `SuperAdmin/components/ui/` sebagai acuan karena folder itu yang paling lengkap dan paling up-to-date.

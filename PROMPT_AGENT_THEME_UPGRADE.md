# PROMPT UNTUK AI AGENT — Upgrade Theme Customizer BKU Hub

---

## KONTEKS PROJECT

Ini adalah project React + Vite bernama **BKU Hub**, sistem informasi kampus Universitas Bhakti Kencana (UBK). Halaman yang akan dikerjakan adalah **Pengaturan Tampilan (Theme Customizer)** yang bisa diakses oleh Super Admin di route `/admin/theme`.

### Struktur file yang relevan:
```
src/pages/SuperAdmin/theme/
├── ThemeCustomizer.jsx     ← Komponen induk (shell + tab router)
├── ThemeColors.jsx         ← Tab Warna — sudah ada tapi TIDAK terpakai
├── ThemeTypography.jsx     ← Tab Tipografi — sudah ada, sudah bagus
├── ThemeBranding.jsx       ← Tab Branding — sudah ada, sudah bagus
├── ThemeComponents.jsx     ← Tab Komponen — sudah ada, sudah bagus
├── ThemeStatusColors.jsx   ← Tab Status — sudah ada, sudah bagus
├── ThemePreviewModal.jsx   ← Modal preview — sudah ada, sudah bagus
└── index.js                ← Export semua komponen di atas
```

### Masalah utama yang perlu diperbaiki:

**ThemeCustomizer.jsx** saat ini adalah file monolitik yang merender semua tab dengan `renderContent()` di dalamnya sendiri — ia TIDAK menggunakan file-file sub-komponen yang sudah ada (`ThemeColors.jsx`, `ThemeTypography.jsx`, dll). Padahal file-file tersebut sudah lengkap dan sudah terintegrasi dengan `useThemeStore` dan `adminService`.

Akibatnya:
- Tab **Branding** di ThemeCustomizer hanya menampilkan teks "Fitur upload logo dan branding akan segera hadir" — padahal `ThemeBranding.jsx` yang sesungguhnya sudah lengkap dengan upload logo, favicon, dan preview
- Tab **Komponen** hanya menampilkan "Fitur ini sedang dalam pengembangan" — padahal `ThemeComponents.jsx` sudah lengkap dengan pengaturan sidebar color dan border radius tombol
- Tab **Warna** di ThemeCustomizer menggunakan state lokal sendiri yang tidak terhubung ke `useThemeStore` — padahal seharusnya menggunakan `ThemeColors.jsx` yang sudah ada (meski `ThemeColors.jsx` masih versi sederhana)
- Tab **Tipografi** di ThemeCustomizer hanya pakai dua `InputField` biasa — padahal `ThemeTypography.jsx` sudah jauh lebih lengkap dengan dropdown font dan typography scale preview

---

## TUGAS YANG HARUS DILAKUKAN

Pekerjaan dibagi menjadi **4 tahap** yang harus dikerjakan secara berurutan.

---

## TAHAP 1 — Refactor ThemeCustomizer.jsx menjadi Tab Router

**Tujuan:** Ubah `ThemeCustomizer.jsx` dari komponen monolitik menjadi pure tab router yang mendelegasikan rendering ke masing-masing sub-komponen.

### Yang harus dilakukan:

1. **Tambahkan import** sub-komponen yang sudah ada:
```jsx
import ThemeColors from './ThemeColors';
import ThemeTypography from './ThemeTypography';
import ThemeBranding from './ThemeBranding';
import ThemeComponents from './ThemeComponents';
import ThemeStatusColors from './ThemeStatusColors';
```

2. **Hapus semua kode dalam `renderContent()`** yang sekarang ada (case colors, typography, status, branding, components), dan ganti dengan delegasi ke sub-komponen:
```jsx
const renderContent = () => {
  switch (activeTab) {
    case 'colors':     return <ThemeColors />;
    case 'typography': return <ThemeTypography />;
    case 'branding':   return <ThemeBranding />;
    case 'components': return <ThemeComponents />;
    case 'status':     return <ThemeStatusColors />;
    default:           return <ThemeColors />;
  }
};
```

3. **Hapus semua state dan helper** yang sudah tidak dipakai setelah delegasi dilakukan:
   - Hapus `const [theme, setTheme] = useState(DEFAULT_THEME)`
   - Hapus `const [loading, setLoading] = useState(true)`
   - Hapus `const [saving, setSaving] = useState(false)`
   - Hapus `DEFAULT_THEME` constant
   - Hapus fungsi `fetchTheme()`
   - Hapus fungsi `handleColorChange()`
   - Hapus fungsi `applyPreview()`
   - Hapus fungsi `handleSave()`
   - Hapus fungsi `handleReset()`
   - Hapus komponen lokal `ColorPicker` dan `InputField` yang ada di dalam file ini

4. **Hapus tombol Reset dan Simpan** dari header ThemeCustomizer (karena setiap sub-komponen sudah punya tombol sendiri). Cukup tampilkan header dengan icon dan judul saja.

5. **Hapus section Preview** di bagian bawah (karena setiap sub-komponen sudah punya preview masing-masing, dan ada ThemePreviewModal yang bisa dipanggil dari tiap tab).

6. **Pertahankan** hanya struktur shell-nya: sidebar tab navigation di sebelah kiri, dan area konten di sebelah kanan yang me-render sub-komponen aktif.

7. **Perbarui TABS array** untuk menyesuaikan key dengan nama tab yang dipakai sub-komponen:
```jsx
const TABS = [
  { key: 'colors',     label: 'Warna',     icon: 'palette' },
  { key: 'typography', label: 'Tipografi', icon: 'text_fields' },
  { key: 'branding',   label: 'Branding',  icon: 'image' },
  { key: 'components', label: 'Komponen',  icon: 'widgets' },
  { key: 'status',     label: 'Status',    icon: 'check_circle' },
];
```

### Hasil akhir yang diharapkan dari Tahap 1:

`ThemeCustomizer.jsx` menjadi file yang ramping — hanya berisi sidebar tab navigation dan switch statement yang merender sub-komponen. Semua logika ada di sub-komponen masing-masing.

---

## TAHAP 2 — Upgrade ThemeColors.jsx

**Tujuan:** `ThemeColors.jsx` saat ini hanya versi sederhana (state lokal, tidak terhubung API). Upgrade agar setara dengan sub-komponen lain seperti `ThemeTypography.jsx` dan `ThemeStatusColors.jsx`.

### Yang harus dilakukan:

1. **Tambahkan import** yang dibutuhkan:
```jsx
import useThemeStore from '../../../store/useThemeStore';
import { adminService } from '../../../services/api';
import ThemePreviewModal from './ThemePreviewModal';
```

2. **Ganti state lokal** dengan pattern yang sama seperti sub-komponen lain:
```jsx
const { previewTheme, revertPreview, fetchTheme } = useThemeStore();
const [formData, setFormData] = useState(null);
const [loading, setLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
const [toast, setToast] = useState(null);
const [showPreview, setShowPreview] = useState(false);
```

3. **Tambahkan `useEffect`** untuk load theme dari API saat mount dan cleanup saat unmount:
```jsx
useEffect(() => {
  loadTheme();
  return () => revertPreview();
}, []);
```

4. **Tambahkan fungsi `loadTheme`**, `handleChange`, `handleReset`, `handleSave`, dan `showToast` — pola identik dengan `ThemeStatusColors.jsx`.

5. **Dalam `handleChange`**, setiap perubahan warna harus langsung memanggil `previewTheme()` agar live preview bekerja.

6. **Tambahkan Page Header** dengan tombol Reset, Preview, dan Simpan — sama seperti sub-komponen lain.

7. **Tambahkan ThemePreviewModal** agar admin bisa melihat full preview sebelum simpan.

8. **Upgrade tampilan color picker**-nya. Saat ini hanya input color + input text. Upgrade menjadi layout card yang lebih informatif:

   Setiap card warna harus menampilkan:
   - Preview kotak warna besar (klik untuk buka native color picker)
   - Nama warna dan deskripsi penggunaannya
   - Nilai hex yang bisa diedit manual
   - **Indikator kontras otomatis** (WCAG) — tampilkan rasio kontras antara warna tersebut dengan putih dan hitam, mirip dengan `SidebarColorInput` di `ThemeComponents.jsx`

9. **Daftar warna yang harus ada** di tab Warna:
   - `color_primary` — Warna utama tombol, sidebar, aksen
   - `color_secondary` — Warna aksen kedua, highlight
   - `color_accent` — Warna CTA dan badge
   - `color_background` — Latar belakang halaman
   - `color_surface` — Latar belakang card dan modal

10. **Tambahkan section "Kombinasi Warna"** di bawah color picker — tampilkan preview kombinasi pasangan warna:
    - Primary + teks putih (untuk tombol)
    - Secondary + teks gelap (untuk badge)
    - Background + Surface (untuk tampilan halaman)

### Hasil akhir yang diharapkan dari Tahap 2:

Tab Warna menjadi komponen yang fully functional: load dari API, live preview saat ganti warna, bisa reset dan simpan, ada indikator kontras WCAG, ada modal preview.

---

## TAHAP 3 — Upgrade Tab Tipografi dengan Preset Font

**Tujuan:** `ThemeTypography.jsx` sudah bagus, tapi font selection-nya masih berupa `<select>` dropdown biasa. Upgrade dengan menambahkan **visual font card picker**.

### Yang harus dilakukan:

1. **Ganti `<select>` dropdown** untuk font headline dan font body dengan **grid card picker** yang menampilkan setiap pilihan font dengan preview teks yang menggunakan font tersebut.

   Contoh tampilan card font:
   ```
   ┌─────────────────────┐
   │ Plus Jakarta Sans   │  ← nama font (Anthropic Sans)
   │                     │
   │ Aa Bb Cc            │  ← preview dengan font itu sendiri
   │ 1234567890          │
   └─────────────────────┘
   ```

   Card yang terpilih diberi border berwarna `var(--theme-primary)` dan tanda centang.

2. **Daftar font yang tersedia** (sudah ada di file `GOOGLE_FONTS` array, gunakan itu):
   Plus Jakarta Sans, Poppins, Outfit, Montserrat, Inter, Roboto, Open Sans, Lato, Nunito, Raleway, Ubuntu, Quicksand, Josefin Sans, DM Sans, Space Grotesk.

3. **Pastikan font di-inject ke DOM** saat dipilih agar preview card bisa menampilkan font yang benar. Gunakan `previewTheme()` dari store yang sudah punya mekanisme Google Font injection.

4. **Pertahankan semua fungsi yang sudah ada**: load theme, preview live, reset, save, ThemePreviewModal, dan typography scale preview di bagian bawah.

### Hasil akhir yang diharapkan dari Tahap 3:

Admin bisa memilih font secara visual — melihat langsung tampilan font sebelum menyimpan, bukan hanya memilih nama dari dropdown.

---

## TAHAP 4 — Tambah Tab Baru: "Preset Tema"

**Tujuan:** Tambahkan tab baru bernama **"Preset"** yang menyediakan tema siap pakai yang bisa diterapkan dengan satu klik. Ini untuk memudahkan admin yang tidak familiar dengan hex color.

### Yang harus dilakukan:

1. **Tambahkan tab baru** di `TABS` array di `ThemeCustomizer.jsx`:
```jsx
{ key: 'presets', label: 'Preset', icon: 'style' },
```

2. **Buat file baru** `src/pages/SuperAdmin/theme/ThemePresets.jsx`.

3. **Buat minimal 6 preset tema** yang siap pakai. Setiap preset harus mendefinisikan semua nilai tema berikut:
   - `color_primary`
   - `color_secondary`
   - `color_accent`
   - `color_background`
   - `color_surface`
   - `sidebar_bg_color`
   - `font_headline`
   - `font_body`

   **Preset yang harus dibuat:**

   | Nama | Deskripsi | Primary | Secondary |
   |------|-----------|---------|-----------|
   | UBK Original | Tema resmi navy-gold UBK | `#0D2B55` | `#C89B3C` |
   | Ocean Blue | Biru modern | `#2563EB` | `#EAB308` |
   | Forest Green | Hijau profesional | `#166534` | `#CA8A04` |
   | Royal Purple | Ungu elegan | `#7C3AED` | `#F59E0B` |
   | Slate Dark | Abu profesional gelap | `#334155` | `#0EA5E9` |
   | Rose Elegant | Merah muda profesional | `#BE185D` | `#F59E0B` |

4. **Tampilkan setiap preset** sebagai card yang menampilkan:
   - Nama dan deskripsi preset
   - Strip warna preview (primary, secondary, accent, sidebar dalam satu baris)
   - Tombol "Terapkan" yang saat diklik akan:
     - Memanggil `previewTheme(presetValues)` untuk live preview
     - Menampilkan konfirmasi "Apakah Anda yakin ingin menerapkan preset ini?"
     - Jika ya, memanggil `adminService.updateTheme(presetValues)` untuk menyimpan ke API

5. **Tandai preset aktif** — bandingkan nilai `color_primary` dari theme store dengan preset yang ada, jika cocok beri label "Aktif" pada card.

6. **Export** `ThemePresets` dari `index.js`:
```js
export { default as ThemePresets } from './ThemePresets';
```

7. **Import dan tambahkan** ke switch case di `ThemeCustomizer.jsx`:
```jsx
import ThemePresets from './ThemePresets';
// ...
case 'presets': return <ThemePresets />;
```

### Hasil akhir yang diharapkan dari Tahap 4:

Admin bisa memilih preset tema dengan satu klik tanpa harus input hex color manual. Cocok untuk situasi saat kampus ingin ganti tema cepat.

---

## CATATAN PENTING UNTUK SEMUA TAHAP

### Pola coding yang konsisten

Semua sub-komponen (`ThemeTypography.jsx`, `ThemeBranding.jsx`, `ThemeComponents.jsx`, `ThemeStatusColors.jsx`) menggunakan pola yang sama persis:

```jsx
// 1. Import
import useThemeStore from '../../../store/useThemeStore';
import { adminService } from '../../../services/api';
import ThemePreviewModal from './ThemePreviewModal';

// 2. State
const { previewTheme, revertPreview, fetchTheme } = useThemeStore();
const [formData, setFormData] = useState(null);
const [loading, setLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
const [toast, setToast] = useState(null);
const [showPreview, setShowPreview] = useState(false);

// 3. Load on mount, cleanup on unmount
useEffect(() => {
  loadTheme();
  return () => revertPreview();
}, []);

// 4. Load dari API
const loadTheme = async () => { ... };

// 5. Handle change dengan live preview
const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  previewTheme({ [field]: value });
};

// 6. Save ke API
const handleSave = async () => {
  const res = await adminService.updateTheme(formData);
};

// 7. Reset
const handleReset = async () => {
  const res = await adminService.resetTheme();
};
```

**Ikuti pola ini secara konsisten** untuk semua komponen yang dimodifikasi atau dibuat.

### Styling

Semua styling menggunakan:
- CSS Variables: `var(--theme-primary)`, `var(--theme-text)`, `var(--theme-text-muted)`, `var(--theme-bg)`, `var(--theme-surface)`, `var(--theme-border)`
- Tailwind utility classes untuk spacing, layout, dan radius
- Material Symbols Outlined untuk ikon (sudah ter-load global)
- Tidak ada hardcoded hex color kecuali untuk preview yang memang butuh nilai eksplisit

### Jangan ubah file-file berikut

File berikut sudah berfungsi dengan baik dan **tidak perlu dimodifikasi**:
- `ThemePreviewModal.jsx`
- `ThemeBranding.jsx`
- `ThemeComponents.jsx`
- `ThemeStatusColors.jsx`
- `useThemeStore.js`
- `index.js` (kecuali untuk tambah export `ThemePresets`)

---

## URUTAN PENGERJAAN

1. **Tahap 1** dulu — refactor ThemeCustomizer.jsx. Ini fondasi, harus selesai sebelum yang lain.
2. **Tahap 2** — upgrade ThemeColors.jsx. Ini tab yang paling sering dipakai.
3. **Tahap 3** — upgrade font picker di ThemeTypography.jsx.
4. **Tahap 4** — buat ThemePresets.jsx dan tab baru.

Setelah setiap tahap selesai, pastikan tidak ada error di console browser sebelum lanjut ke tahap berikutnya.

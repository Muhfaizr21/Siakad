# Analisis Keselarasan Menu Portal ORMAWA (Web vs Mobile)

Dokumen ini berisi analisis perbandingan menu dan fitur pada Portal ORMAWA di versi Web (SIAKAD/Portal Administrator) dan aplikasi Mobile (BKU Hub Mobile). Analisis ini bertujuan untuk memastikan apakah fitur-fitur yang tersedia di kedua platform sudah selaras (sinkron).

## 1. Perbandingan Struktur Menu

Secara keseluruhan, fitur yang disediakan oleh Portal ORMAWA di Web dan Mobile **sudah sangat selaras**. Hampir seluruh menu fungsional di Web telah diimplementasikan di versi Mobile, meskipun penempatannya sedikit berbeda menyesuaikan UI/UX masing-masing platform (Web menggunakan Sidebar, sedangkan Mobile menggunakan Grid Icon dan Bottom Navigation Bar).

Berikut adalah pemetaan menu antara Web dan Mobile:

| Web (PortalConfig.js - Sidebar) | Kategori di Web | Mobile (OrmawaServiceGrid - Menu Icon) | Status Keselarasan |
| :--- | :--- | :--- | :--- |
| **Dashboard** | MANAJEMEN UTAMA | **Dashboard** (Bottom Nav / Main Screen) | ✅ Selaras |
| **Anggota Aktif** | MANAJEMEN UTAMA | **Anggota** (Main Grid) | ✅ Selaras |
| **Struktur Pengurus** | MANAJEMEN UTAMA | **Struktur** & **Manaj. Staf** (Menu Lainnya) | ⚠️ Ada Perbedaan Kecil |
| **Open Recruitment** | MANAJEMEN UTAMA | **Open Recruitment** (Menu Lainnya) | ✅ Selaras |
| **Proposal & Kegiatan** | OPERASIONAL & KEGIATAN | **Proposal** (Main Grid & Bottom Nav) | ✅ Selaras |
| **Jadwal Kalender** | OPERASIONAL & KEGIATAN | **Kalender** (Main Grid) | ✅ Selaras |
| **Sistem Absensi (QR)** | OPERASIONAL & KEGIATAN | **Absensi** (Main Grid & Bottom Nav) | ✅ Selaras |
| **Pagu & Buku Keuangan** | ADMINISTRASI & KEUANGAN | **Keuangan** (Main Grid & Bottom Nav) | ✅ Selaras |
| **Laporan & LPJ** | ADMINISTRASI & KEUANGAN | **LPJ** (Main Grid) | ✅ Selaras |
| **Aspirasi Masuk** | KOMUNIKASI & SISTEM | **Aspirasi** (Menu Lainnya) | ✅ Selaras |
| **Pusat Notifikasi** | KOMUNIKASI & SISTEM | **Notifikasi** (Menu Lainnya / App Bar) | ✅ Selaras |
| **Siaran Pengumuman** | KOMUNIKASI & SISTEM | **Pengumuman** (Main Grid) | ✅ Selaras |
| **Role & Akses** | KOMUNIKASI & SISTEM | **Hak Akses** (Menu Lainnya) | ✅ Selaras |
| **Pengaturan Sistem** | KOMUNIKASI & SISTEM | **Pengaturan** (Menu Lainnya) | ✅ Selaras |

---

## 2. Analisis Perbedaan & Temuan (Gap Analysis)

Meskipun secara garis besar fitur sudah lengkap dan selaras, terdapat beberapa perbedaan kecil dalam hal struktur dan pengelompokan yang perlu diperhatikan:

### A. Pemisahan "Struktur" dan "Manajemen Staf" di Mobile
- **Di Web:** Hanya ada 1 menu yaitu **"Struktur Pengurus"** (`/ormawa/struktur`) yang kemungkinan mengatur hierarki dan daftar pengurus sekaligus.
- **Di Mobile:** Terdapat 2 menu terpisah di bagian *Modal "Lainnya"*, yaitu **"Struktur"** (`OrmawaStrukturScreen`) dan **"Manaj. Staf"** (`OrmawaStaffScreen`).
- **Saran:** Perlu dipastikan apakah pemisahan ini memang disengaja untuk UX Mobile (misal: satu untuk melihat bagan struktur, satu untuk menambah/mengedit staf) atau merupakan duplikasi fitur. Jika fungsinya sama, lebih baik disatukan agar sama persis dengan Web.

### B. Penempatan Menu Prioritas (Bottom Navigation & Main Grid)
- **Bottom Navigation Mobile:** Terdapat menu *Dashboard*, *Proposal*, *Absensi*, dan *Keuangan*. Ini menunjukkan ke-4 fitur tersebut adalah fitur yang paling sering diakses (prioritas utama).
- **Grid Menu Mobile:** Fitur operasional seperti *Kalender*, *LPJ*, *Anggota*, dan *Pengumuman* diletakkan di Main Grid agar mudah dijangkau.
- Sisanya (seperti *Aspirasi*, *Recruitment*, *Hak Akses*, *Struktur*, *Pengaturan*) disembunyikan di dalam menu **"Lainy" (Lainnya)** untuk menjaga layar tetap bersih. Ini adalah pendekatan UI/UX yang baik untuk versi Mobile dan tidak mengurangi keselarasan fitur dengan Web.

### C. Keberadaan Direktori "PKKMB" di Kode Mobile
- Berdasarkan penelusuran struktur folder (Mobile: `lib/features/ormawa/pkkmb`), ada indikasi fitur PKKMB disiapkan di bawah *domain ormawa* versi Mobile.
- Namun, pada konfigurasi Web (`PortalConfig.js`), menu **PKKMB** berada pada lingkup *Faculty Admin* dan *Super Admin (Kencana)*, bukan di *Ormawa Admin Portal*.
- Di UI Mobile saat ini, layar PKKMB tidak dimunculkan di Grid Service Ormawa.
- **Kesimpulan:** Jika ini sisa *code/file* lama, sebaiknya dirapikan. Jika memang ada rencana Ormawa tertentu (seperti BEM) mengakses modul PKKMB di Mobile, maka Web-nya belum selaras dan perlu ditambahkan di konfigurasi Web.

---

## 3. Kesimpulan

**Secara Fungsional:** Kedua platform (Web dan Mobile) **sudah sepenuhnya selaras**. Pengurus ORMAWA dapat melakukan tugas operasional dan administrasi dari platform mana pun dengan kelengkapan fitur yang sama (Proposal, LPJ, Absensi, Keuangan, Recruitment, dsb).

**Secara Tampilan (UI/UX):** Penyesuaian tata letak menu di versi Mobile (menggunakan Grid dan *More Menu*) sudah sesuai dengan standar pengembangan mobile apps tanpa mengorbankan fungsionalitas yang ada di Web.

**Tindak Lanjut yang Disarankan:**
1. Cek kembali fungsionalitas **Struktur** vs **Manaj. Staf** di Mobile, apakah bisa disatukan menyesuaikan struktur Web "Struktur Pengurus".
2. Ubah label penulisan `"Lainy"` di Mobile (`ormawa_service_grid.dart`) menjadi `"Lainnya"` agar lebih profesional dan baku.
3. Hapus folder/referensi `pkkmb` di `features/ormawa` mobile jika modul PKKMB memang difokuskan hanya untuk *Superadmin* atau buatkan perannya secara khusus jika memang diperlukan.

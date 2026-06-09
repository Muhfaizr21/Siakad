# Laporan Audit Sistem Mobile - Role Ormawa
*Tanggal Audit: 9 Juni 2026*

Dokumen ini berisi hasil audit komparasi fitur antara Web Frontend (`src/pages/OrmawaAdmin`) dan Aplikasi Mobile (`lib/features/ormawa`). Audit ini berfokus pada penemuan data *dummy*, integrasi API yang belum selesai, dan fitur yang hilang di versi Mobile.

---

## 1. Fitur yang Belum Tersedia (Missing Features)

Berdasarkan perbandingan dengan Web Frontend, terdapat satu modul besar yang belum diimplementasikan sama sekali di aplikasi Mobile:

- **Modul Rekrutmen (Open Recruitment)**
  - **Di Web**: Tersedia di file `Recruitment.jsx`.
  - **Di Mobile**: Direktori maupun fitur rekrutmen belum ada. Tidak ada antarmuka untuk menampilkan daftar pendaftar baru atau membuka form pendaftaran anggota organisasi.

---

## 2. Data Dummy (Hardcoded) & API yang Terputus

Beberapa layar dan *repository* masih menggunakan data statis tanpa melakukan pengambilan data sesungguhnya dari REST API.

### A. Modul PKKMB (Kencana)
- **File**: `lib/features/ormawa/data/repositories/ormawa_repository_impl.dart`
- **Temuan**:
  - `getPKKMBMissions()` selalu mengembalikan list statis yang berisi satu misi: *"Aturan & Tata Tertib"*.
  - `addPKKMBMission()` dan `togglePKKMBMissionStatus()` adalah fungsi kosong `{}` yang tidak melakukan request apapun ke *backend*.
- **File**: `lib/features/ormawa/pkkmb/presentation/pages/ormawa_pkkmb_screen.dart`
- **Temuan**: 
  - Variabel `_questions` dan `options` untuk pembuatan kuis dikelola sepenuhnya secara lokal tanpa status pengiriman yang konsisten ke backend (meskipun *endpoint* kuis ada, state lokalnya masih banyak *hardcode* dan belum dikelola melalui Provider dengan rapi).

### B. Pengelolaan Anggota & Staff
- **File**: `lib/features/ormawa/anggota/presentation/pages/ormawa_anggota_screen.dart`
- **Temuan**:
  - Daftar Dropdown untuk Posisi/Peran di-*hardcode*: `['KETUA', 'WAKIL KETUA', 'SEKRETARIS', 'BENDAHARA', 'ANGGOTA', 'KADIV']`.
  - Daftar Dropdown untuk Status di-*hardcode*: `['Aktif', 'Non-Aktif', 'Alumni', 'Cuti']`.
  - Idealnya, data referensi ini ditarik dari *backend* agar jika ada perubahan nama jabatan, Mobile dapat beradaptasi tanpa perlu *update* aplikasi.

### C. Keuangan (Finance)
- **File**: `lib/features/ormawa/finance/presentation/pages/create_transaction_screen.dart`
- **Temuan**:
  - Kategori transaksi di-*hardcode* di *layer presentation*: `final List<String> _categories = [...]`.

### D. Role Based Access Control (RBAC)
- **File**: `lib/features/ormawa/rbac/presentation/pages/ormawa_role_screen.dart`
- **Temuan**:
  - Daftar aksesibilitas (Permissions) seperti *CREATE_PROPOSAL*, *MANAGE_FINANCE* disediakan melalui variabel statis `_availablePermissions`. Di web, daftar *permission* divalidasi dan diambil langsung dari daftar otorisasi *backend*.

### E. Profil Organisasi (Organization Info)
- **File**: `lib/core/providers/ormawa_provider.dart`
- **Temuan**:
  - Jika nama organisasi tidak ditemukan di data *user login*, sistem secara default menggunakan nama variabel cadangan `String _orgName = "BEM KBM BHAKTI KENCANA";`.
  - Belum ada integrasi ke *endpoint* khusus `/ormawa/profile` untuk mengambil detail valid dari entitas organisasi tersebut.

---

## 3. Rekomendasi Langkah Perbaikan (Action Plan)

Untuk merapikan ketimpangan antara Web dan Mobile, berikut adalah urutan pengerjaan yang direkomendasikan:

1. **Sinkronisasi Modul PKKMB**: 
   Menghapus data statis pada `_pkkmbMissions` di `OrmawaRepositoryImpl` dan menyambungkan ketiga fungsinya (`get`, `add`, `toggle`) secara langsung dengan *endpoint* API.
   
2. **Pembersihan State & Dropdown**:
   Membuat mekanisme penarikan *Master Data* (atau menggunakan *endpoint* referensi) untuk fitur Anggota (Role/Status), Keuangan (Kategori), dan RBAC (Permissions), kemudian memasukkannya ke dalam `OrmawaProvider` agar dapat dikonsumsi oleh layar yang membutuhkan tanpa *hardcode*.

3. **Pengembangan Modul Rekrutmen**:
   Membangun fitur `recruitment` di sisi Mobile (`lib/features/ormawa/recruitment`) meliputi UI dan sambungan ke API, agar fungsionalitas Mobile benar-benar setara 100% dengan Web.

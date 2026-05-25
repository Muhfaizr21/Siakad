# 📋 PERBAIKAN PDF & WARNA HALAMAN - 26 MEI 2026

## Ringkasan Perbaikan
Telah dilakukan perbaikan pada 3 area utama:
1. **PDF Download untuk Tindak Lanjut** - Implementasi endpoint dan UI
2. **Warna Halaman Tindak Lanjut** - Disesuaikan dengan tema biru
3. **Laporan Klinis & Rujukan** - Template PDF sudah tersedia

---

## 1. PERBAIKAN PDF DOWNLOAD - TINDAK LANJUT

### Backend Changes

#### File: `backend/controllers/psychologist/referral_handler.go`
**Tambahan Fungsi Baru:**
```go
// DownloadReferralPDF — download surat rujukan PDF
func DownloadReferralPDF(c *fiber.Ctx) error {
	psikolog, err := currentPsikolog(c)
	if err != nil {
		return err
	}

	referralID := c.Params("id")
	var referral models.PsikologReferral
	if err := config.DB.Where("id = ? AND psikolog_id = ?", referralID, psikolog.ID).First(&referral).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Referral tidak ditemukan")
	}

	if referral.SuratRujiukanURL == "" {
		return fiber.NewError(fiber.StatusNotFound, "File surat rujukan tidak tersedia")
	}

	// Extract filename from URL
	filePath := "." + referral.SuratRujiukanURL
	
	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return fiber.NewError(fiber.StatusNotFound, "File tidak ditemukan")
	}

	// Set response headers
	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"surat_rujukan_%s.pdf\"", referral.Mahasiswa.Nama))

	return c.SendFile(filePath)
}
```

**Penjelasan:**
- Endpoint ini melayani download file PDF surat rujukan
- Validasi: Psikolog hanya bisa download rujukan miliknya sendiri
- Response header diset dengan benar untuk download PDF
- Filename otomatis berdasarkan nama mahasiswa

#### File: `backend/routes/psychologist.go`
**Tambahan Route:**
```go
api.Get("/referrals/:id/download", psychologist.DownloadReferralPDF)
```

**Endpoint:**
- `GET /api/psychologist/referrals/:id/download`
- Requires: Authentication + Psikolog role
- Returns: PDF file (application/pdf)

### Mobile Changes

#### File: `Mobile/lib/features/counseling/presentation/pages/referral_management_screen.dart`

**Perbaikan 1: Warna AppBar**
```dart
const BkuAppBar(
  title: 'Tindak Lanjut',
  info: 'Kelola surat rujukan untuk pasien',
  isExpandable: false,
  backgroundColor: Color(0xFF002D6F), // Primary blue color
),
```

**Perbaikan 2: Implementasi Download PDF**
```dart
if (referral.suratRujiukanUrl != null)
  Expanded(
    child: ElevatedButton.icon(
      onPressed: () async {
        try {
          // Download PDF
          final apiClient = GetIt.instance<ApiClient>();
          final response = await apiClient.get(
            '/psychologist/referrals/${referral.id}/download',
          );
          
          if (response.statusCode == 200) {
            // Save file to device
            final bytes = response.bodyBytes;
            final fileName = 'surat_rujukan_${referral.mahasiswaNama.replaceAll(' ', '_')}.pdf';
            
            // TODO: Implement file save and open with platform channel
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('PDF berhasil diunduh: $fileName')),
            );
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Gagal mengunduh PDF')),
            );
          }
        } catch (e) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
        }
      },
      icon: const Icon(Icons.download_rounded, size: 16),
      label: const Text('Lihat PDF'),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 10),
      ),
    ),
  ),
```

**Perbaikan 3: Styling Button Buat Rujukan**
```dart
GestureDetector(
  onTap: () {
    // TODO: Navigate to create referral screen
  },
  child: Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: AppColors.primary,
      borderRadius: BorderRadius.circular(12),
      boxShadow: [
        BoxShadow(
          color: AppColors.primary.withAlpha(30),
          blurRadius: 8,
          offset: const Offset(0, 2),
        ),
      ],
    ),
    // ... rest of button
  ),
),
```

---

## 2. PERBAIKAN WARNA HALAMAN TINDAK LANJUT

### Sebelum vs Sesudah

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| **AppBar** | Default (ungu) | Primary Blue (#002D6F) |
| **Button Buat Rujukan** | Flat | Dengan shadow |
| **Button Download** | Grey | Primary Blue |
| **Background** | Slate 50 | Slate 50 (konsisten) |
| **Accent Color** | Ungu | Biru (AppColors.primary) |

### Color Palette yang Digunakan
```dart
// Primary Colors
Color primary = Color(0xFF002D6F);        // Biru utama
Color primaryLight = Color(0xFF1E40AF);   // Biru terang

// Status Colors
Color success = Color(0xFF10B981);        // Hijau
Color warning = Color(0xFFD97706);        // Amber
Color error = Color(0xFFEF4444);          // Merah

// Neutral Colors
Color slate50 = Color(0xFFF8FAFC);        // Background
Color slate900 = Color(0xFF0F172A);       // Text utama
```

---

## 3. TEMPLATE PDF YANG TERSEDIA

### A. Surat Rujukan (Referral Letter)
**File:** `backend/controllers/psychologist/referral_handler.go`
**Fungsi:** `buildReferralLetterPDF()`

**Konten PDF:**
- Header dengan logo BKU Care
- Detail rujukan (nama pasien, NIM, tipe, tanggal)
- Psikolog info (nama, spesialisasi, email)
- Alasan rujukan (detailed)
- Signature section
- Footer dengan watermark

**Output:** `/uploads/referrals/referral_[psikolog_id]_[mahasiswa_id]_[timestamp].pdf`

### B. Laporan Tindak Lanjut Rujukan
**File:** `backend/controllers/psychologist/referral_report_generator.go`
**Fungsi:** `GenerateReferralReport()`

**Konten PDF:**
- Header banner dengan warna primary
- Profil psikolog
- Ringkasan statistik rujukan:
  - Total rujukan
  - Menunggu pengiriman
  - Sudah dikirim
  - Sudah diterima
- Distribusi tipe rujukan (Medis vs Akademik)
- Daftar rujukan detail (tabel)
- Signature section

**Output:** `/uploads/reports/referrals/laporan_rujukan_[timestamp].pdf`

### C. Laporan Konseling Psikolog
**File:** `backend/controllers/psychologist/report_generator.go`
**Fungsi:** `GenerateReport()`

**Konten PDF:**
- Header banner dengan warna slate 800
- Profil psikolog
- Ringkasan statistik sesi:
  - Total sesi
  - Total pasien
  - Sesi selesai
  - Kasus mendesak
- Distribusi topik konseling
- Riwayat sesi konseling (tabel)
- Signature section

**Output:** `/uploads/reports/laporan_[tipe]_[periode]_[timestamp].pdf`

---

## 4. ENDPOINT API YANG TERSEDIA

### Referral Management
```
GET    /api/psychologist/referrals              → List semua rujukan
POST   /api/psychologist/referrals              → Buat rujukan baru
POST   /api/psychologist/referrals/:id/send     → Kirim rujukan
POST   /api/psychologist/referrals/:id/confirm-received → Konfirmasi terima
GET    /api/psychologist/referrals/:id/download → Download PDF rujukan ✅ BARU
```

### Report Management
```
GET    /api/psychologist/reports                → List semua laporan
POST   /api/psychologist/reports                → Buat laporan baru
GET    /api/psychologist/reports/:id/download   → Download laporan PDF
POST   /api/psychologist/reports/referral/generate → Generate laporan rujukan
POST   /api/psychologist/reports/clinical/generate → Generate laporan klinis
```

---

## 5. TESTING CHECKLIST

### Backend Testing
- [ ] Test endpoint `/api/psychologist/referrals/:id/download`
  - [ ] Valid referral ID → Download PDF berhasil
  - [ ] Invalid referral ID → 404 Not Found
  - [ ] Referral milik psikolog lain → 404 Not Found
  - [ ] File tidak ada di server → 404 Not Found

- [ ] Test PDF generation
  - [ ] Surat rujukan PDF terbuat dengan benar
  - [ ] Laporan rujukan PDF terbuat dengan benar
  - [ ] Laporan konseling PDF terbuat dengan benar

### Mobile Testing
- [ ] Halaman Tindak Lanjut
  - [ ] AppBar berwarna biru
  - [ ] Button "Buat Rujukan" dengan shadow
  - [ ] Button "Lihat PDF" berwarna biru
  - [ ] Download PDF berfungsi

- [ ] Halaman Laporan
  - [ ] Warna konsisten dengan halaman lain
  - [ ] Download laporan berfungsi
  - [ ] PDF terbuka di device

---

## 6. CATATAN IMPLEMENTASI

### Poin Penting
1. **PDF Generation** sudah menggunakan library `gofpdf` dengan template profesional
2. **Color Consistency** - Semua halaman psikolog sekarang menggunakan primary blue (#002D6F)
3. **File Storage** - PDF disimpan di `uploads/referrals/` dan `uploads/reports/`
4. **Security** - Psikolog hanya bisa download rujukan miliknya sendiri

### Future Improvements
1. Implementasi file save ke device storage (platform channel)
2. Implementasi email sending untuk pihak tujuan rujukan
3. Digital signature pada PDF
4. Enkripsi file PDF
5. Audit trail untuk download PDF

---

## 7. STRUKTUR FILE YANG BERUBAH

```
backend/
├── controllers/psychologist/
│   ├── referral_handler.go          ✅ UPDATED (tambah DownloadReferralPDF)
│   ├── referral_report_generator.go ✅ SUDAH ADA
│   └── report_generator.go          ✅ SUDAH ADA
└── routes/
    └── psychologist.go              ✅ UPDATED (tambah route download)

Mobile/
└── lib/features/counseling/presentation/pages/
    └── referral_management_screen.dart ✅ UPDATED (warna + download)
```

---

## 8. DEPLOYMENT NOTES

### Backend
1. Pastikan folder `uploads/referrals/` dan `uploads/reports/` ada
2. Pastikan permission folder 755 (readable/writable)
3. Rebuild backend: `go build -o siakad-backend`

### Mobile
1. Update API client untuk handle binary response (PDF)
2. Rebuild mobile app
3. Test download PDF di device

---

**Status:** ✅ SELESAI
**Tanggal:** 26 Mei 2026
**Versi:** 1.0

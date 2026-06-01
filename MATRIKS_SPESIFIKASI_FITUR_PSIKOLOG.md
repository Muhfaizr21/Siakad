# MATRIKS SPESIFIKASI FITUR & MODUL PSIKOLOG (DETAIL PER MODUL)
## Sistem Informasi Akademik & Layanan Terpadu Psikolog

---

## 1. DASHBOARD PSIKOLOG

| Aspek | Detail |
|-------|--------|
| **NAMA FITUR** | Dashboard Psikolog |
| **INPUT** | • ID Psikolog (dari Session)<br>• Rentang Waktu (Filter default: hari ini)<br>• Optional: Filter bulan/tahun untuk tren |
| **PROSES** | 1. Query database `counseling_bookings` berdasarkan ID Psikolog aktif<br>2. Hitung statistik kumulatif secara real-time:<br>&nbsp;&nbsp;&nbsp;- Total pasien (unique mahasiswa)<br>&nbsp;&nbsp;&nbsp;- Sesi selesai (status = "Selesai")<br>&nbsp;&nbsp;&nbsp;- Sesi menunggu (status = "Menunggu")<br>&nbsp;&nbsp;&nbsp;- Sesi hari ini (tanggal = hari ini)<br>&nbsp;&nbsp;&nbsp;- Sesi mendatang (tanggal >= hari ini, status != "Selesai")<br>3. Kalkulasi tren bulanan (sesi selesai per bulan tahun ini)<br>4. Trigger alert jika ada sesi < 1 jam ke depan |
| **OUTPUT** | • Ringkasan angka statistik (4 kartu stat)<br>• Grafik/Chart tren sesi (line/bar chart)<br>• List 5 antrean teratas hari ini (sorted by jam_mulai)<br>• Notifikasi/Alert di layar (upcoming sessions) |
| **FIELD DATABASE** | `total_pasien` (int)<br>`sesi_selesai` (int)<br>`sesi_menunggu` (int)<br>`sesi_hari_ini` (int)<br>`sesi_mendatang` (int)<br>`antrean_list` (array of objects)<br>`tren_bulanan` (array of {bulan, jumlah}) |
| **DESKRIPSI** | Memberikan ringkasan komprehensif tentang aktivitas konseling psikolog dalam satu tampilan. Psikolog dapat melihat statistik real-time, tren bulanan, dan jadwal sesi hari ini. |

---

## 2. JADWAL KONSELING (SLOTTING)

| Aspek | Detail |
|-------|--------|
| **NAMA FITUR** | Jadwal Konseling (Slotting) |
| **INPUT** | • Hari & Tanggal (pilih dari kalender)<br>• Jam Mulai & Selesai (time picker)<br>• Kategori Masalah (dropdown: Personal, Akademik, Kesehatan)<br>• Lokasi (dropdown: Online, Offline)<br>• Kuota Pasien (integer, default 1)<br>• Catatan (optional text) |
| **PROSES** | 1. Validasi bentrokan waktu (overlap) pada tanggal yang sama<br>&nbsp;&nbsp;&nbsp;- Jika ada overlap, tampilkan error<br>&nbsp;&nbsp;&nbsp;- Jika tidak ada overlap, lanjut ke step 2<br>2. Simpan data slot ke tabel `psychologist_schedule_slots`<br>3. Tampilkan slot sebagai opsi pilihan di aplikasi mobile mahasiswa<br>4. Update status slot menjadi "Available" |
| **OUTPUT** | • Kalender/Daftar slot aktif (tampil di halaman psikolog)<br>• Slot waktu baru muncul di aplikasi mahasiswa untuk siap dibooking<br>• Konfirmasi berhasil disimpan |
| **FIELD DATABASE** | `schedule_id` (PK, UUID)<br>`psychologist_id` (FK, UUID)<br>`date` (date)<br>`start_time` (time)<br>`end_time` (time)<br>`category` (enum: Personal, Akademik, Kesehatan)<br>`location_type` (enum: Online, Offline)<br>`quota` (int)<br>`is_active` (boolean)<br>`created_at` (timestamp)<br>`updated_at` (timestamp) |
| **DESKRIPSI** | Psikolog membuat slot ketersediaan konseling. Sistem validasi overlap waktu dan menyimpan ke database. Slot yang tersedia akan ditampilkan di aplikasi mahasiswa untuk booking. |

---

## 3. KONFIRMASI BOOKING

| Aspek | Detail |
|-------|--------|
| **NAMA FITUR** | Konfirmasi Booking |
| **INPUT** | • Aksi Klik (Approve / Reject)<br>• Optional: Catatan penolakan (jika reject)<br>• Optional: Link meeting (jika approve & mode Online) |
| **PROSES** | 1. Mengubah status baris data pada tabel `counseling_bookings`<br>&nbsp;&nbsp;&nbsp;- Jika Approve: status = "Dikonfirmasi"<br>&nbsp;&nbsp;&nbsp;- Jika Reject: status = "Ditolak"<br>2. Mengurangi kuota slot pada jadwal terkait (jika approve)<br>3. Memicu push notification ke device mahasiswa target berdasarkan ID Mahasiswa<br>4. Catat timestamp perubahan status<br>5. Log audit: siapa yang approve/reject dan kapan |
| **OUTPUT** | • Status booking berubah (Dikonfirmasi / Ditolak)<br>• Push Notification terkirim ke HP mahasiswa secara real-time<br>• Konfirmasi di halaman psikolog (status updated)<br>• Email notifikasi ke mahasiswa (optional) |
| **FIELD DATABASE** | `booking_id` (PK, UUID)<br>`student_id` (FK, UUID)<br>`psychologist_id` (FK, UUID)<br>`status` (enum: Menunggu, Dikonfirmasi, Ditolak, Selesai)<br>`rejection_reason` (text, nullable)<br>`link_meeting` (string, nullable)<br>`confirmed_at` (timestamp, nullable)<br>`confirmed_by` (UUID, nullable)<br>`updated_at` (timestamp) |
| **DESKRIPSI** | Psikolog mengkonfirmasi atau menolak booking dari mahasiswa. Sistem otomatis mengirim notifikasi push ke mahasiswa dan mengupdate status booking. |

---

## 4. REKAM MEDIK KLINIS

| Aspek | Detail |
|-------|--------|
| **NAMA FITUR** | Rekam Medik Klinis |
| **INPUT** | • Keluhan Utama (longtext, required)<br>• Hasil Observasi (longtext, required)<br>• Rekomendasi (longtext, required)<br>• Mood (dropdown: Cemas, Sedih, Stabil, Marah, Lainnya)<br>• Jenis Sesi (dropdown: Konseling Baru, Follow-up, Krisis)<br>• Status Urgensi Pasien (enum: Normal, Perhatian, Mendesak) |
| **PROSES** | 1. Enkripsi teks pada kolom `keluhan` & `rekomendasi` menggunakan AES-256<br>2. Kunci data (Read-only) setelah disimpan<br>&nbsp;&nbsp;&nbsp;- Disable edit button<br>&nbsp;&nbsp;&nbsp;- Catat waktu lock & psikolog yang lock<br>3. Early Warning System: Jika status = "Mendesak", otomatis beri flagging akun mahasiswa<br>&nbsp;&nbsp;&nbsp;- Flag di dashboard fakultas<br>&nbsp;&nbsp;&nbsp;- Notifikasi ke admin fakultas<br>4. Catat ID psikolog yang input (audit trail)<br>5. Simpan timestamp pembuatan |
| **OUTPUT** | • Catatan rekam medis terenkripsi di DB<br>• Perubahan status riwayat pasien (visible di halaman pasien)<br>• Sinyal darurat (jika kondisi kritis = "Mendesak")<br>• Audit trail tercatat |
| **FIELD DATABASE** | `session_note_id` (PK, UUID)<br>`booking_id` (FK, UUID)<br>`psychologist_id` (FK, UUID)<br>`student_id` (FK, UUID)<br>`complaint_encrypted` (text, AES-256)<br>`observation` (text)<br>`recommendation_encrypted` (text, AES-256)<br>`mood` (enum: Cemas, Sedih, Stabil, Marah, Lainnya)<br>`session_type` (enum: Konseling Baru, Follow-up, Krisis)<br>`patient_status` (enum: Normal, Perhatian, Mendesak)<br>`is_locked` (boolean)<br>`locked_at` (timestamp, nullable)<br>`locked_by` (UUID, nullable)<br>`created_at` (timestamp)<br>`created_by` (UUID)<br>`audit_trail` (JSON array) |
| **DESKRIPSI** | Psikolog mencatat hasil sesi konseling dengan enkripsi data sensitif. Sistem otomatis mengunci data setelah disimpan dan memberikan flagging jika pasien dalam kondisi mendesak. |

---

## 5. TINDAK LANJUT (RUJUKAN)

| Aspek | Detail |
|-------|--------|
| **NAMA FITUR** | Tindak Lanjut (Rujukan) |
| **INPUT** | • Tipe Rujukan (enum: Medis, Akademik)<br>• Alasan / Diagnosa (longtext, required)<br>• Instansi/Pihak Tujuan (string, required)<br>• Email Tujuan (email format, required)<br>• File Lampiran (PDF, max 2MB, optional) |
| **PROSES** | 1. Unggah berkas dokumen pendukung ke cloud storage (jika ada)<br>&nbsp;&nbsp;&nbsp;- Validasi format: PDF only<br>&nbsp;&nbsp;&nbsp;- Validasi ukuran: max 2MB<br>&nbsp;&nbsp;&nbsp;- Simpan path ke database<br>2. Generate file PDF Surat Rujukan otomatis menggunakan template resmi BKU Care & Digital Signature<br>&nbsp;&nbsp;&nbsp;- Template berisi: header BKU Care, data mahasiswa, alasan rujukan, data psikolog, signature<br>&nbsp;&nbsp;&nbsp;- Simpan PDF ke folder `uploads/referrals/`<br>3. Kirim email notifikasi otomatis beserta lampiran ke pihak tujuan<br>&nbsp;&nbsp;&nbsp;- Email subject: "Surat Rujukan dari BKU Care - [Nama Mahasiswa]"<br>&nbsp;&nbsp;&nbsp;- Email body: template profesional<br>&nbsp;&nbsp;&nbsp;- Attachment: PDF surat rujukan + file pendukung (jika ada)<br>4. Update status rujukan menjadi "Sent"<br>5. Catat tanggal_dikirim |
| **OUTPUT** | • File PDF Surat Rujukan (tersimpan di server)<br>• Email keluar otomatis ke tujuan (dengan attachment)<br>• Log pelacakan rujukan (status = "Sent")<br>• Konfirmasi di halaman psikolog |
| **FIELD DATABASE** | `referral_id` (PK, UUID)<br>`session_note_id` (FK, UUID)<br>`psychologist_id` (FK, UUID)<br>`student_id` (FK, UUID)<br>`student_name` (string)<br>`student_nim` (string)<br>`referral_type` (enum: Medis, Akademik)<br>`reason` (text)<br>`destination_institution` (string)<br>`destination_email` (string)<br>`attachment_path` (string, nullable)<br>`pdf_path` (string)<br>`status` (enum: Pending, Sent, Received)<br>`created_at` (timestamp)<br>`sent_at` (timestamp, nullable)<br>`received_at` (timestamp, nullable) |
| **DESKRIPSI** | Psikolog membuat surat rujukan untuk pasien yang memerlukan penanganan khusus. Sistem otomatis generate PDF dengan template resmi dan mengirim email ke pihak tujuan. |

---

## 6. STATISTIK & LAPORAN

| Aspek | Detail |
|-------|--------|
| **NAMA FITUR** | Statistik & Laporan |
| **INPUT** | • Filter Range Tanggal (date picker: start_date - end_date)<br>• Filter Tipe (radio button: Bulanan / Tahunan)<br>• Format File (radio button: PDF / XLSX) |
| **PROSES** | 1. Query agregasi data statistik dari seluruh sesi psikolog dalam range tanggal:<br>&nbsp;&nbsp;&nbsp;- Total sesi<br>&nbsp;&nbsp;&nbsp;- Total pasien unik<br>&nbsp;&nbsp;&nbsp;- Sesi selesai<br>&nbsp;&nbsp;&nbsp;- Sesi menunggu<br>&nbsp;&nbsp;&nbsp;- Kasus mendesak<br>&nbsp;&nbsp;&nbsp;- Distribusi topik/kategori masalah<br>&nbsp;&nbsp;&nbsp;- Distribusi mood<br>2. Anonymization Proses: Menghapus data identitas pribadi (Nama & NIM) mahasiswa demi privasi<br>&nbsp;&nbsp;&nbsp;- Ganti dengan "[Anonymized]" atau nomor urut<br>3. Compile data menjadi file dokumen publik (PDF atau XLSX)<br>&nbsp;&nbsp;&nbsp;- Template laporan profesional<br>&nbsp;&nbsp;&nbsp;- Include grafik distribusi<br>&nbsp;&nbsp;&nbsp;- Include rekomendasi<br>4. Simpan laporan ke database & folder `uploads/reports/`<br>5. Generate download link |
| **OUTPUT** | • File laporan siap unduh (PDF/XLSX)<br>• Grafik rekapitulasi isu kesehatan mental kampus<br>• Statistik agregat (tanpa identitas mahasiswa)<br>• Rekomendasi berdasarkan data |
| **FIELD DATABASE** | `report_id` (PK, UUID)<br>`generated_by` (FK, UUID - psikolog ID)<br>`start_date` (date)<br>`end_date` (date)<br>`report_type` (enum: Bulanan, Tahunan)<br>`report_format` (enum: PDF, XLSX)<br>`report_file_path` (string)<br>`total_cases` (int)<br>`total_patients` (int)<br>`completed_sessions` (int)<br>`pending_sessions` (int)<br>`urgent_cases` (int)<br>`statistics` (JSON - aggregated data)<br>`created_at` (timestamp) |
| **DESKRIPSI** | Psikolog generate laporan statistik tren kesehatan mental mahasiswa. Sistem otomatis mengagregasi data, anonymize identitas, dan compile menjadi laporan PDF/XLSX yang siap unduh. |

---

## RINGKASAN FIELD PER MODUL

### Dashboard Psikolog
```
Output Fields:
- total_pasien: integer
- sesi_selesai: integer
- sesi_menunggu: integer
- sesi_hari_ini: integer
- sesi_mendatang: integer
- antrean_list: array[{id, nama, jam_mulai, jam_selesai, status, lokasi}]
- tren_bulanan: array[{bulan, jumlah_sesi}]
```

### Jadwal Konseling
```
Database Table: psychologist_schedule_slots
- schedule_id (PK)
- psychologist_id (FK)
- date
- start_time
- end_time
- category
- location_type
- quota
- is_active
- created_at
- updated_at
```

### Konfirmasi Booking
```
Database Table: counseling_bookings (update)
- booking_id (PK)
- student_id (FK)
- psychologist_id (FK)
- status (enum)
- rejection_reason
- link_meeting
- confirmed_at
- confirmed_by
- updated_at
```

### Rekam Medik Klinis
```
Database Table: psychologist_session_notes
- session_note_id (PK)
- booking_id (FK)
- psychologist_id (FK)
- student_id (FK)
- complaint_encrypted (AES-256)
- observation
- recommendation_encrypted (AES-256)
- mood
- session_type
- patient_status
- is_locked
- locked_at
- locked_by
- created_at
- created_by
- audit_trail (JSON)
```

### Tindak Lanjut (Rujukan)
```
Database Table: psychologist_referrals
- referral_id (PK)
- session_note_id (FK)
- psychologist_id (FK)
- student_id (FK)
- student_name
- student_nim
- referral_type (enum)
- reason
- destination_institution
- destination_email
- attachment_path
- pdf_path
- status (enum)
- created_at
- sent_at
- received_at
```

### Statistik & Laporan
```
Database Table: psychologist_reports
- report_id (PK)
- generated_by (FK)
- start_date
- end_date
- report_type (enum)
- report_format (enum)
- report_file_path
- total_cases
- total_patients
- completed_sessions
- pending_sessions
- urgent_cases
- statistics (JSON)
- created_at
```

---

## FLOW INTEGRASI ANTAR MODUL

```
┌─────────────────────────────────────────────────────────────────┐
│                    MAHASISWA                                    │
│  1. Lihat jadwal psikolog (dari Jadwal Konseling)               │
│  2. Booking slot konseling                                      │
│  3. Terima notifikasi konfirmasi (dari Konfirmasi Booking)      │
│  4. Hadir di sesi konseling                                     │
│  5. Terima notifikasi rujukan (dari Tindak Lanjut)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PSIKOLOG                                     │
│  1. Buat jadwal ketersediaan (Jadwal Konseling)                 │
│  2. Terima notifikasi booking baru                              │
│  3. Konfirmasi/tolak booking (Konfirmasi Booking)               │
│  4. Lihat dashboard aktivitas (Dashboard Psikolog)              │
│  5. Catat hasil sesi (Rekam Medik Klinis)                       │
│  6. Buat surat rujukan (Tindak Lanjut)                          │
│  7. Generate laporan statistik (Statistik & Laporan)            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE                                     │
│  - psychologist_schedule_slots (jadwal ketersediaan)            │
│  - counseling_bookings (booking & konfirmasi)                   │
│  - psychologist_session_notes (rekam medik terenkripsi)         │
│  - psychologist_referrals (surat rujukan)                       │
│  - psychologist_reports (laporan statistik)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## KEAMANAN & PRIVASI

### Enkripsi Data
- Kolom `complaint_encrypted` & `recommendation_encrypted` di `psychologist_session_notes` dienkripsi AES-256
- Hanya psikolog yang membuat catatan yang bisa membaca data terenkripsi
- Audit trail mencatat setiap akses ke data sensitif

### Audit Trail
- Setiap perubahan status booking dicatat dengan timestamp & ID psikolog
- Setiap catatan sesi mencatat psikolog yang membuat & waktu pembuatan
- Laporan anonymize data mahasiswa (hapus NIM/Nama)

### Notifikasi
- Push notification ke mahasiswa saat booking dikonfirmasi/ditolak
- Email notification ke pihak tujuan saat rujukan dikirim
- In-app notification untuk semua event penting

---

**Last Updated**: 26 Mei 2026  
**Status**: ✅ COMPLETE - Matriks detail per modul

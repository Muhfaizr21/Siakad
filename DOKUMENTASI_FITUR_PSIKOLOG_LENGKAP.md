# 📋 DOKUMENTASI LENGKAP FITUR PSIKOLOG - BKU CARE

## Daftar Isi
1. Dashboard Psikolog
2. Jadwal Konseling
3. Konfirmasi Booking
4. Rekam Medik
5. Tindak Lanjut (Rujukan)
6. Statistik & Laporan

---

## 1. DASHBOARD PSIKOLOG

### Tujuan
Memberikan ringkasan komprehensif tentang aktivitas konseling psikolog dalam satu tampilan.

### Alur Sistem
```
1. Psikolog login ke sistem
   ↓
2. Sistem query database booking berdasarkan ID Psikolog aktif
   ↓
3. Hitung statistik sesi:
   - Total pasien (unique mahasiswa)
   - Sesi selesai (status = Selesai)
   - Sesi pending (status = Menunggu/Dikonfirmasi)
   - Pasien baru (first-time booking hari ini)
   ↓
4. Sinkronisasi jam dengan jadwal sesi hari ini
   ↓
5. Tampilkan dashboard dengan visualisasi
```

### Data yang Ditampilkan

#### A. Statistik Ringkasan
- **Total Pasien**: Jumlah unique mahasiswa yang pernah booking (integer)
- **Sesi Selesai**: Jumlah sesi dengan status = "Selesai" (integer)
- **Menunggu**: Jumlah booking dengan status = "Menunggu" (integer)
- **Sesi Hari Ini**: Jumlah booking hari ini (semua status) (integer)
- **Sesi Mendatang**: Jumlah booking dari hari ini ke depan yang belum selesai (integer)
- **Selesai Hari Ini**: Jumlah sesi yang diselesaikan hari ini (integer)
- **Selesai Bulan Ini**: Jumlah sesi yang diselesaikan bulan ini (integer)

#### B. Visualisasi
1. **Chart Tren Konseling**
   - Grafik line/bar menunjukkan tren jumlah sesi per bulan (tahun ini)
   - X-axis: Bulan (Jan-Des)
   - Y-axis: Jumlah sesi selesai
   - Data: Booking dengan status = "Selesai" yang updated_at tahun ini

2. **List Antrean Sesi Hari Ini**
   - Sorted by waktu mulai (ascending)
   - Menampilkan: Nama mahasiswa, Jam, Status, Lokasi
   - Update real-time
   - Max 5 booking teratas

3. **Notifikasi Peringatan Sesi Mendatang**
   - Alert untuk sesi dalam 1 jam ke depan
   - Notifikasi push ke psikolog

### Output Data
```json
{
  "status": "success",
  "data": {
    "stats": [
      {
        "label": "Total Pasien",
        "value": 45,
        "progress": "100%",
        "color": "bg-blue-500"
      },
      {
        "label": "Sesi Selesai",
        "value": 32,
        "progress": "71%",
        "color": "bg-emerald-500"
      },
      {
        "label": "Menunggu",
        "value": 8,
        "progress": "18%",
        "color": "bg-amber-500"
      }
    ],
    "today_appointments": 5,
    "upcoming_appointments": 12,
    "completed_today": 3,
    "completed_this_month": 28,
    "waiting_count": 8,
    "new_today": 2,
    "bookings": [
      {
        "id": "uuid",
        "mahasiswa_id": "uuid",
        "name": "John Doe",
        "nim": "2024001",
        "email": "john@univ.ac.id",
        "phone": "081234567890",
        "prodi": "Teknik Informatika",
        "faculty": "Teknik",
        "semester": 4,
        "date": "26 May 2026",
        "date_full": "Tuesday, 26 May 2026",
        "time": "09:00 - 10:00",
        "jam_mulai": "09:00",
        "jam_selesai": "10:00",
        "issue": "Stress Akademik",
        "note": "Mahasiswa merasa tertekan dengan tugas kuliah",
        "status": "Dikonfirmasi",
        "mode": "Offline",
        "link_meeting": null,
        "avatar": "JD",
        "created_at": "2026-05-26T08:00:00Z"
      }
    ],
    "current_session": {
      "available": true,
      "id": "uuid",
      "name": "Jane Smith",
      "date": "26 May 2026",
      "time": "10:00 - 11:00",
      "issue": "Masalah Pribadi"
    },
    "recent_activities": [
      {
        "title": "Booking Dikonfirmasi",
        "description": "John Doe - Stress Akademik",
        "time": "26 May 2026",
        "type": "booking"
      }
    ]
  }
}
```

---

## 2. JADWAL KONSELING

### Tujuan
Mengelola ketersediaan slot konseling dan mencatat hasil sesi.

### Alur Sistem
```
FASE 1: PSIKOLOG MEMBUAT SLOT
1. Psikolog klik "Tambah Jadwal"
   ↓
2. Isi form:
   - Hari (Senin-Minggu)
   - Waktu mulai & selesai
   - Kategori (Personal/Akademik/Kesehatan)
   - Lokasi
   - Kuota slot (default 1)
   ↓
3. Sistem simpan ke tabel psychologist_schedule_slots
   ↓
4. Slot tersedia untuk booking mahasiswa

FASE 2: MAHASISWA BOOKING
1. Mahasiswa lihat jadwal tersedia
   ↓
2. Mahasiswa pilih slot & booking
   ↓
3. Sistem buat entry di counseling_bookings (status = Menunggu)
   ↓
4. Notifikasi ke psikolog: "Ada booking baru"

FASE 3: PSIKOLOG KONFIRMASI
1. Psikolog lihat booking di halaman Konfirmasi Booking
   ↓
2. Psikolog klik [Setujui] atau [Tolak]
   ↓
3. Sistem update status booking
   ↓
4. Jika setujui → status = "Dikonfirmasi"
   ↓
5. Notifikasi ke mahasiswa & psikolog

FASE 4: SESI BERLANGSUNG & CATAT HASIL
1. Saat sesi selesai, psikolog klik "Simpan Hasil"
   ↓
2. Isi form:
   - Keluhan (dari booking)
   - Observasi
   - Rekomendasi
   - Mood
   - Jenis Sesi
   - Status Pasien
   ↓
3. Sistem simpan ke psychologist_session_notes table
   ↓
4. Update booking status = "Selesai"
   ↓
5. Notifikasi ke mahasiswa: "Sesi selesai"
```

### Data Jadwal Konseling
```json
{
  "day": "Senin",
  "enabled": true,
  "slots": [
    {
      "id": "uuid",
      "kategori": "Personal",
      "start": "09:00",
      "end": "10:00",
      "lokasi": "Ruang Konseling A",
      "kuota": 1,
      "is_available": true
    }
  ]
}
```

### Data Hasil Sesi
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "psikolog_id": "uuid",
  "mahasiswa_id": "uuid",
  "tanggal": "2026-05-27",
  "keluhan": "Mahasiswa mengalami stress akademik",
  "observasi": "Tampak cemas dan gelisah",
  "rekomendasi": "Diberikan teknik manajemen stress dan time management",
  "mood": "Cemas",
  "jenis_sesi": "Konseling Baru",
  "status_pasien": "Perlu Perhatian",
  "created_at": "2026-05-27T10:30:00Z"
}
```

---

## 3. KONFIRMASI BOOKING

### Tujuan
Psikolog mengkonfirmasi atau menolak booking dari mahasiswa.

### Alur Sistem
```
1. Mahasiswa submit booking
   ↓
2. Sistem buat entry di counseling_bookings (status = Menunggu)
   ↓
3. Notifikasi ke psikolog: "Ada booking baru"
   ↓
4. Psikolog buka halaman "Jadwal Konseling" → tab "Booking Menunggu"
   ↓
5. Lihat daftar booking yang pending
   ↓
6. Psikolog klik [Setujui] atau [Tolak]
   ↓
7. Jika Setujui:
   - Update status booking → "Dikonfirmasi"
   - Notifikasi push ke mahasiswa & psikolog
   - Log audit: "Booking confirmed by [psikolog_name]"
   ↓
8. Jika Tolak:
   - Update status booking → "Ditolak"
   - Notifikasi ke mahasiswa: "Booking ditolak"
   - Log audit: "Booking rejected by [psikolog_name]"
```

### Data Konfirmasi Booking
```json
{
  "id": "uuid",
  "mahasiswa_id": "uuid",
  "mahasiswa_nama": "John Doe",
  "nim": "2024001",
  "email": "john@univ.ac.id",
  "phone": "081234567890",
  "prodi": "Teknik Informatika",
  "faculty": "Teknik",
  "semester": 4,
  "tanggal_booking": "2026-05-27",
  "jam_mulai": "09:00",
  "jam_selesai": "10:00",
  "status": "Menunggu",
  "topik": "Stress Akademik",
  "keluhan": "Mahasiswa merasa tertekan dengan tugas kuliah",
  "mode": "Offline",
  "lokasi": "Ruang Konseling A",
  "created_at": "2026-05-26T15:30:00Z"
}
```

### Output Konfirmasi
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "status_baru": "Dikonfirmasi",
    "notifikasi_terkirim": true,
    "audit_log": "Booking confirmed by Dr. Budi Santoso at 2026-05-26 15:30:00"
  }
}
```

---

## 4. REKAM MEDIK

### Tujuan
Mencatat data klinis pasien dengan enkripsi dan audit trail.

### Alur Sistem
```
1. Psikolog selesai sesi konseling
   ↓
2. Psikolog buka halaman "Pasien" → pilih mahasiswa
   ↓
3. Klik "Tambah Catatan Sesi"
   ↓
4. Isi form:
   - Keluhan (longtext) → Dienkripsi AES-256
   - Observasi (longtext)
   - Rekomendasi (longtext)
   - Mood (dropdown)
   - Jenis Sesi (dropdown)
   - Status Pasien (dropdown)
   ↓
5. Klik [Simpan]
   ↓
6. Sistem:
   - Enkripsi kolom keluhan & rekomendasi
   - Catat ID psikolog yang input (audit trail)
   - Simpan timestamp
   - Simpan ke psychologist_session_notes table
   ↓
7. Catatan tersimpan dan tidak bisa diedit (read-only)
```

### Data Rekam Medik
```json
{
  "id": "uuid",
  "psikolog_id": "uuid",
  "mahasiswa_id": "uuid",
  "mahasiswa_nama": "John Doe",
  "nim": "2024001",
  "keluhan": "[ENCRYPTED]",
  "observasi": "Mahasiswa tampak cemas dan gelisah",
  "rekomendasi": "[ENCRYPTED]",
  "mood": "Cemas",
  "jenis_sesi": "Konseling Baru",
  "status_pasien": "Perlu Perhatian",
  "tanggal": "2026-05-27",
  "created_at": "2026-05-27T10:30:00Z",
  "psikolog_input": "Dr. Budi Santoso",
  "audit_trail": [
    {
      "action": "Created",
      "timestamp": "2026-05-27T10:30:00Z",
      "psikolog": "Dr. Budi Santoso"
    }
  ]
}
```

### Flagging untuk Risiko Tinggi
```
Jika status_pasien = "Mendesak" atau "Perlu Perhatian":
1. Sistem otomatis flag mahasiswa
2. Notifikasi ke Dashboard Fakultas
3. Tampilkan di "Early Warning System"
4. Catat di log audit
```

---

## 5. TINDAK LANJUT (RUJUKAN)

### Tujuan
Membuat dan mengelola surat rujukan untuk pasien yang memerlukan penanganan khusus.

### Alur Sistem
```
1. Psikolog buka halaman "Tindak Lanjut"
   ↓
2. Klik "Buat Rujukan Baru"
   ↓
3. Isi form:
   - Pilih Pasien (mahasiswa)
   - Tipe Rujukan (Medis/Akademik)
   - Alasan Rujukan (text)
   - Pihak Tujuan (nama klinik/psikolog)
   - Email Tujuan
   - File Pendukung (optional, max 2MB, PDF only)
   ↓
4. Klik "Buat Rujukan"
   ↓
5. Sistem:
   - Generate Surat Rujukan PDF dengan template resmi
   - Masukkan data psikolog & mahasiswa
   - Simpan ke database (status = Pending)
   - Simpan PDF ke uploads/referrals/
   ↓
6. Psikolog klik "Kirim"
   ↓
7. Sistem:
   - Update status → "Sent"
   - Kirim email ke pihak tujuan dengan PDF attachment
   - Kirim notifikasi ke mahasiswa
   - Catat tanggal_dikirim
   ↓
8. Pihak tujuan terima email & confirm penerimaan
   ↓
9. Sistem update status → "Received"
   - Catat tanggal_diterima
   - Notifikasi ke psikolog
```

### Data Rujukan
```json
{
  "id": "uuid",
  "psikolog_id": "uuid",
  "psikolog_nama": "Dr. Budi Santoso",
  "mahasiswa_id": "uuid",
  "mahasiswa_nama": "John Doe",
  "nim": "2024001",
  "email": "john@univ.ac.id",
  "tipe": "Medis",
  "alasan": "Pasien memerlukan evaluasi medis lebih lanjut",
  "pihak_tujuan": "Klinik Kesehatan Universitas",
  "email_tujuan": "klinik@univ.ac.id",
  "file_pendukung_url": "/uploads/referrals/file_pendukung_uuid.pdf",
  "surat_rujukan_url": "/uploads/referrals/referral_uuid_timestamp.pdf",
  "status": "Sent",
  "tanggal_dibuat": "2026-05-27T10:00:00Z",
  "tanggal_dikirim": "2026-05-27T10:05:00Z",
  "tanggal_diterima": null
}
```

### Template Surat Rujukan PDF
```
┌─────────────────────────────────────────────────────────────┐
│                    SURAT RUJUKAN MEDIS/AKADEMIK             │
│                      BKU CARE - UNIVERSITAS                 │
│                                                             │
│  Nomor: [REFERRAL_ID]_[TIMESTAMP]                          │
│  Tanggal: [TANGGAL_DIBUAT]                                 │
└─────────────────────────────────────────────────────────────┘

KEPADA YTH:
[PIHAK_TUJUAN]
[EMAIL_TUJUAN]

Dengan hormat,

Kami dari BKU Care Universitas dengan ini merujuk seorang mahasiswa
untuk mendapatkan penanganan lebih lanjut.

DATA MAHASISWA:
- Nama: [MAHASISWA_NAMA]
- NIM: [NIM]
- Email: [EMAIL]
- Program Studi: [PRODI]
- Fakultas: [FAKULTAS]
- Semester: [SEMESTER]

ALASAN RUJUKAN:
[ALASAN]

TIPE RUJUKAN: [TIPE]

PSIKOLOG PENGIRIM:
- Nama: [PSIKOLOG_NAMA]
- Spesialisasi: [SPESIALISASI]
- Email: [PSIKOLOG_EMAIL]
- Tanggal Rujukan: [TANGGAL_DIKIRIM]

Demikian surat rujukan ini kami buat untuk dapat ditindaklanjuti
sesuai dengan kebutuhan mahasiswa.

Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.

Hormat kami,

[DIGITAL_SIGNATURE]
[PSIKOLOG_NAMA]
Psikolog BKU Care
```

---

## 6. STATISTIK & LAPORAN

### Tujuan
Menghasilkan laporan komprehensif tentang tren kesehatan mental mahasiswa.

### Alur Sistem
```
1. Psikolog buka halaman "Statistik & Laporan"
   ↓
2. Pilih parameter:
   - Range Tanggal (start_date - end_date)
   - Tipe Laporan (Bulanan/Tahunan)
   - Format (PDF/XLSX)
   ↓
3. Klik "Generate Laporan"
   ↓
4. Sistem:
   - Query data sesi dalam range tanggal
   - Anonymize data (hapus NIM/Nama mahasiswa)
   - Kelompokkan berdasarkan kategori masalah
   - Hitung frekuensi sesi per kategori
   - Generate grafik distribusi
   ↓
5. Generate PDF dengan template resmi
   ↓
6. Simpan ke database (reports table)
   ↓
7. Tampilkan download link
```

### Data Laporan
```json
{
  "id": "uuid",
  "psikolog_id": "uuid",
  "judul": "Laporan Tren Kesehatan Mental - Mei 2026",
  "tipe": "Bulanan",
  "range_tanggal": {
    "start": "2026-05-01",
    "end": "2026-05-31"
  },
  "format": "PDF",
  "file_url": "/uploads/reports/laporan_bulanan_mei_2026_timestamp.pdf",
  "ukuran_file": "245 KB",
  "tanggal_generate": "2026-05-27T15:04:05Z",
  "status": "Selesai",
  "statistik": {
    "total_sesi": 45,
    "total_pasien": 32,
    "sesi_selesai": 32,
    "sesi_menunggu": 8,
    "kasus_mendesak": 3,
    "kategori_masalah": {
      "Stress Akademik": 20,
      "Masalah Pribadi": 15,
      "Kesehatan Mental": 10
    },
    "distribusi_mood": {
      "Cemas": 12,
      "Sedih": 8,
      "Stabil": 25
    }
  }
}
```

### Template Laporan PDF
```
┌─────────────────────────────────────────────────────────────┐
│              LAPORAN KONSELING PSIKOLOG                     │
│              BKU Care • Laporan Bulanan                     │
│              Periode: Mei 2026                              │
│              Dibuat pada: 27 May 2026 15:04                │
└─────────────────────────────────────────────────────────────┘

PROFIL PSIKOLOG
- Nama: Dr. Budi Santoso
- Spesialisasi: Psikologi Klinis
- Email: budi@univ.ac.id
- Lokasi: Ruang Konseling A
- Periode Laporan: 01 May 2026 s/d 31 May 2026

RINGKASAN STATISTIK SESI
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│  Total Sesi      │  Total Pasien    │  Sesi Selesai    │  Kasus Mendesak  │
│  45 Sesi         │  32 Orang        │  32 Sesi         │  3 Kasus         │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘

DISTRIBUSI TOPIK KONSELING
┌─────────────────────────┬──────────┬──────────────┐
│ Topik                   │ Jumlah   │ Persentase   │
├─────────────────────────┼──────────┼──────────────┤
│ Stress Akademik         │ 20       │ 44.4%        │
│ Masalah Pribadi         │ 15       │ 33.3%        │
│ Kesehatan Mental        │ 10       │ 22.2%        │
└─────────────────────────┴──────────┴──────────────┘

RIWAYAT SESI KONSELING
┌──────────┬──────────────────┬──────────────┬────────┬──────────────────┐
│ Tanggal  │ Mahasiswa        │ Jenis Sesi   │ Mood   │ Status Pasien    │
├──────────┼──────────────────┼──────────────┼────────┼──────────────────┤
│ 27/05/26 │ [Anonymized]     │ Konseling    │ Cemas  │ Perlu Perhatian  │
│ 26/05/26 │ [Anonymized]     │ Follow-up    │ Stabil │ Membaik          │
│ 25/05/26 │ [Anonymized]     │ Konseling    │ Sedih  │ Perlu Perhatian  │
└──────────┴──────────────────┴──────────────┴────────┴──────────────────┘

REKOMENDASI
- Tingkat kasus mendesak masih dalam batas normal (6.7%)
- Mayoritas pasien menunjukkan tren positif dalam pemulihan
- Perlu peningkatan intervensi untuk kategori Stress Akademik

Disetujui & Diverifikasi,                Psikolog Penanggung Jawab,

_____________________________            _____________________________
                                        Dr. Budi Santoso
                                        Spesialisasi: Psikologi Klinis
                                        Email: budi@univ.ac.id
```

---

## RINGKASAN FITUR

| Fitur | Status | Deskripsi | Platform |
|-------|--------|-----------|----------|
| Dashboard | ✅ Implemented | Ringkasan aktivitas konseling | Web, Mobile |
| Jadwal Konseling | ✅ Implemented | Manajemen slot & hasil sesi | Web, Mobile |
| Konfirmasi Booking | ✅ Implemented | Approve/reject booking mahasiswa | Web, Mobile |
| Rekam Medik | ✅ Implemented | Catat data klinis dengan enkripsi | Web, Mobile |
| Tindak Lanjut | ✅ Implemented | Generate & manage surat rujukan | Web, Mobile |
| Statistik & Laporan | ✅ Implemented | Generate laporan PDF/XLSX | Web, Mobile |

---

## FLOW INTEGRASI SISTEM

```
┌─────────────────────────────────────────────────────────────────┐
│                    MAHASISWA                                    │
│  1. Lihat jadwal psikolog                                       │
│  2. Booking slot konseling                                      │
│  3. Terima notifikasi konfirmasi                                │
│  4. Hadir di sesi konseling                                     │
│  5. Terima notifikasi rujukan (jika ada)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PSIKOLOG                                     │
│  1. Buat jadwal ketersediaan                                    │
│  2. Terima notifikasi booking baru                              │
│  3. Konfirmasi/tolak booking                                    │
│  4. Catat hasil sesi (rekam medik)                              │
│  5. Buat surat rujukan (jika diperlukan)                        │
│  6. Generate laporan statistik                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE                                     │
│  - counseling_bookings (status: Menunggu/Dikonfirmasi/Selesai)  │
│  - psychologist_session_notes (rekam medik terenkripsi)         │
│  - psychologist_referrals (surat rujukan)                       │
│  - psychologist_schedule_slots (jadwal ketersediaan)            │
│  - psychologist_reports (laporan statistik)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## KEAMANAN & PRIVASI

### Enkripsi Data
- Kolom `keluhan` & `rekomendasi` di `psychologist_session_notes` dienkripsi AES-256
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
**Status**: ✅ COMPLETE - Semua fitur sudah diimplementasikan di Web & Mobile

# Rencana Implementasi: Fitur Tambahan Modul Tenaga Kesehatan

## Konteks
Berdasarkan request pihak kampus saat review Revisi Fitur BKU:
- Tambahkan role "Tenaga Kesehatan" dengan akses screening
- Mahasiswa tetap bisa input screening mandiri (tanpa approval)
- Tambahkan fitur "Ajukan Asuransi"
- Tambahkan "Laporan Klinis"

## Decisions
| Fitur | Decision |
|-------|----------|
| Asuransi | Keduanya: Klaim kecelakaan kampus + reimburse BPJS |
| Self-screening Mhs | Input langsung tanpa approval TK |
| Laporan Klinis | Super Admin & TK: full access; Admin Fak: aggregate only |

---

## 1. Laporan Klinis

### 1.1 Halaman Reports TK (`/tenagakes/reports`)
- **Summary Cards**: Total diperiksa, Layak, Perlu Perhatian, Tidak Layak
- **Filter Options**:
  - Periode: Hari ini / Minggu ini / Bulan ini / Custom range
  - Tipe: Semua / Reguler / Massal / Event tertentu
  - Status: Semua / Layak / Perlu Perhatian / Tidak Layak
  - Fakultas & Prodi (cascade)
- **Data Table**: Daftar pemeriksaan dengan kolum:
  - Tanggal, Nama, NIM, Prodi, TK Pemeriksa, Hasil, Status
- **Export**: Download Excel & PDF per filter

### 1.2 Halaman Reports Super Admin (`/super-admin/health-reports`)
- Same layout + filter tambahan: Pilih tenaga kesehatan
- Full detail access (semua data)
- Export per event/periode

### 1.3 Backend API
```
GET /api/tenagakes/reports?start_date&end_date&tipe&status&fakultas_id&prodi_id
GET /api/super-admin/health-reports?tenaga_kes_id&start_date&end_date
GET /api/reports/export-excel (Excel generate)
GET /api/reports/export-pdf (PDF generate)
```

---

## 2. Ajukan Asuransi

### 2.1 Tipe Asuransi
- **Asuransi Kampus**: Klaim kecelakaan kampus (biaya ditanggung kampus/budget khusus)
- **BPJS / Asuransi Swasta**: Klaim reimburse (mahasiswa klaim sendiri ke provider)

### 2.2 Flow Pengajuan
```
1. Mahasiswa buka menu "Ajukan Asuransi"
2. Pilih tipe: Campus / BPJS
3. Isi form:
   - Tanggal kejadian
   - Lokasi kejadian
   - Deskripsi kronologis
   - Estimasi biaya
   - Upload dokumen pendukung (foto, kwitansi, surat keterangan)
4. Submit → masuk ke antrean review
5. TK/Admin review → Setuju / Tolak / Minta tambahan info
6. Jika disetujui → proses klaim
7. Mahasiswa dapat notifikasi status
```

### 2.3 Database Schema
```go
type PengajuanAsuransi struct {
    ID             uint      `gorm:"primaryKey"`
    MahasiswaID    uint      `gorm:"index"`
    Tipo           string    `gorm:"index"` // "kampus" / "bpjs"
    TanggalKejadian time.Time
    LokasiKejadian string
    Deskripsi      string    // kronologis
    EstimasiBiaya  float64
    FileURL        string    // path ke dokumen
    Status         string    `gorm:"index"` // "menunggu" / "diproses" / "disetujui" / "ditolak"
    CatatanReview  string
    ReviewedBy     *uint     `gorm:"index"` // UserID reviewer
    ReviewedAt     *time.Time
    CreatedAt      time.Time
}
```

### 2.4 Hak Akses
| Role | Akses |
|------|-------|
| Mahasiswa | Create, view own |
| TK | View all (kampus only), approve/reject |
| Super Admin | View all, approve/reject |
| Admin Fak | View prodi only |

### 2.5 Frontend Pages
- `frontend/src/pages/Student/InsurancePage.jsx` - Form ajukan & list riwayat
- `frontend/src/pages/TenagaKesehatan/InsuranceReview.jsx` - Review & process
- `frontend/src/pages/SuperAdmin/InsuranceManagement.jsx` - Full management

### 2.6 Backend API
```
GET  /api/insurance                    - list (filtered by role)
POST /api/insurance                   - create new
GET  /api/insurance/:id               - detail
PUT  /api/insurance/:id/status        - approve/reject
PUT  /api/insurance/:id/review         - add note
```

---

## 3. Self-Screening Mahasiswa

### 3.1 Lokasi Menu
- `frontend/src/pages/Student/HealthScreeningPage.jsx` (sudah ada, perlu enhance)
- Integrasi dengan `HealthScreeningPage.jsx` yang sudah ada

### 3.2 Form Screening (simplified untuk mahasiswa)
- Data Vital: Suhu, Tekanan Darah, SpO2, BB, TB (IMT auto-calc)
- Keluhan Utama
- Skala Nyeri (0-10)
- Alergi Obat
- Konsumsi Obat saat ini

### 3.3 Logika Auto-Alert
- Suhu > 37.5°C → warning "Konsultasi ke Klinik direkomendasikan"
- Suhu > 38.5°C → prompt "Silakan ke Klinik untuk pemeriksaan lebih lanjut"
- SpO2 < 95% → prompt eskalasi

### 3.4 Backend API
```
POST /api/mahasiswa/self-screening     - input screening mandiri
GET  /api/mahasiswa/self-screening    - list riwayat sendiri
GET  /api/mahasiswa/self-screening/:id - detail
```

---

## 4. Modul Jadwal & Booking Enhancement

### 4.1 Repeat Jadwal (UI)
- Toggle "Jadwal Berulang"
- Jika aktif → muncul selector hari (Senin-Selasa-Rabu-Kamis-Jumat-Sabtu-Minggu)
- Backend auto-generate jadwal untuk setiap hari yang dipilih

### 4.2 Reschedule by Mahasiswa
- Mahasiswa bisa ubah tanggal booking sendiri (jika masih > 24 jam sebelum jadwal)
- Notifikasi ke TK saat mahasiswa reschedule

---

## Implementation Order

```
Phase 1: Core Foundation
├── 1. Database schema (asuransi)
├── 2. Backend API insurance (CRUD)
├── 3. Frontend: Student Insurance Page
└── 4. Self-screening API + enhance HealthScreeningPage

Phase 2: TK & Admin Features
├── 5. Frontend: TK Insurance Review
├── 6. Frontend: Super Admin Insurance Management
├── 7. Laporan Klinis - Backend
└── 8. Laporan Klinis - Frontend

Phase 3: Export & Enhancement
├── 9. Export Excel/PDF real implementation
├── 10. Repeat Jadwal UI
└── 11. Reschedule booking
```

---

## Files to Create/Modify

### Backend
- `backend/models/insurance.go` - new model
- `backend/controllers/insurance_controller.go` - new handler
- `backend/routes/insurance.go` - new routes
- `backend/routes/mahasiswa.go` - add self-screening
- `backend/routes/super_admin.go` - add health reports

### Frontend
- `frontend/src/pages/Student/InsurancePage.jsx` - new
- `frontend/src/pages/TenagaKesehatan/InsuranceReview.jsx` - new
- `frontend/src/pages/SuperAdmin/InsuranceManagement.jsx` - new
- `frontend/src/pages/TenagaKesehatan/ReportsPage.jsx` - new (Laporan Klinis)
- `frontend/src/pages/SuperAdmin/HealthReports.jsx` - new
- Enhance `frontend/src/pages/Student/HealthScreeningPage.jsx`

### API Service
- Add `insuranceService` to `api.js`
- Add `healthReportsService` to `api.js`

---

## Open Questions (remaining)

1. **Kuota asuransi**: Apakah ada batas maximum klaim per mahasiswa per semester?
2. **Approval flow asuransi**: TK bisa approve langsung atau perlu escalate ke Super Admin?
3. **Template dokumen**: Apakah ada template kwitansi/keterangan yang perlu di-upload?
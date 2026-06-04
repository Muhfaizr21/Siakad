# Rencana Final: Modul Tenaga Kesehatan BKU

## Decisions (Final)

| # | Keputusan | Detail |
|---|-----------|--------|
| 1 | **Model Terpusat** | Tabel `pengajuan_asuransi` tunggal dengan kolom `jenis_provider` (BKU Assurance, BPJS, dll) |
| 2 | **BAP Kesehatan** | Rekap per EVENT (bukan bulanan). Monthly stats: query GROUP BY, tidak perlu tabel baru |
| 3 | **Approval Flow** | Self-service → TK Verifikasi (ACC 1) → Generate PDF → TTD Manajerial (Admin) |
| 4 | **Patient Intake Flow** | Tahap 1: Mhs input subjektif (keluhan) → Tahap 2: TK lanjutkan dengan objektif (TTV) |
| 5 | **Rujukan PDF** | Hanya bisa didownload oleh Mhs SETELAH TK publish |

---

## Arsitektur Database (Final)

### Tabel: `pengajuan_asuransi`
```sql
CREATE TABLE public.pengajuan_asuransi (
  id SERIAL PRIMARY KEY,
  mahasiswa_id INT NOT NULL REFERENCES mahasiswa(id),
  jenis_provider VARCHAR(50) NOT NULL, -- 'BKU_Assurance', 'BPJS', 'Asuransi_Lain'
  tanggal_kejadian DATE NOT NULL,
  lokasi_faskes VARCHAR(255),
  deskripsi TEXT,
  estimasi_biaya DECIMAL(12,2),
  file_url VARCHAR(500), -- upload dokumen
  status VARCHAR(30) DEFAULT 'PENDING_VERIFICATION', -- PENDING_VERIFICATION, APPROVED_TK, APPROVED_FINAL, REJECTED
  catatan_review TEXT,
  reviewed_by INT,
  reviewed_at TIMESTAMP,
  surat_pengantar_url VARCHAR(500), -- generated PDF after TK approval
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabel: `berita_acara_pemeriksaan`
```sql
CREATE TABLE public.berita_acara_pemeriksaan (
  id SERIAL PRIMARY KEY,
  event_id INT REFERENCES pemeriksaan_massal(id),
  nama_kegiatan VARCHAR(255) NOT NULL,
  tanggal_pelaksanaan DATE NOT NULL,
  waktu_mulai TIME,
  waktu_selesai TIME,
  tempat VARCHAR(255),
  jumlah_peserta INT,
  jumlah_diperiksa INT,
  tk_id INT REFERENCES tenaga_kesehatan(id),
  status VARCHAR(30) DEFAULT 'DRAFT', -- DRAFT, FINAL
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabel: `self_screening` (Patient Intake Stage 1)
```sql
CREATE TABLE public.self_screening (
  id SERIAL PRIMARY KEY,
  mahasiswa_id INT NOT NULL REFERENCES mahasiswa(id),
  booking_id INT REFERENCES booking_kesehatan(id),
  keluhan_utama TEXT,
  skala_nyeri INT DEFAULT 0,
  alergi_obat TEXT,
  konsumsi_obat TEXT,
  is_completed_tk BOOLEAN DEFAULT FALSE, -- true after TK completes examination
  tk_id INT REFERENCES tenaga_kesehatan(id),
  screened_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PATIENT INTAKE FLOW                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Mahasiswa]                              [Tenaga Kesehatan]             │
│       │                                          │                      │
│       ▼                                          │                      │
│  1. Isi Keluhan Utama                            │                      │
│     (Self-Screening)                             │                      │
│       │                                          │                      │
│       ▼                                          │                      │
│  2. Status: "Self-Registered" ──────────────────►│                     │
│                                                 3. Buka data pasien     │
│                                                 4. Lengkapi TTV,        │
│                                                    Fisik, Diagnosis     │
│                                                 5. Jika perlu rujuk:    │
│                                                    "Terbitkan Rujukan"  │
│       │                                          │                      │
│       ▼                                          ▼                      │
│  6. Download PDF Rujukan                         7. Data tersimpan      │
│     (Hanya setelah published)                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        ASURANSI CLAIM FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Mahasiswa]            [TK]                 [Admin/Manager]            │
│       │                  │                        │                      │
│       ▼                  │                        │                      │
│  1. Ajukan Klaim ────────►│                        │                      │
│     (Upload dokumen)       │                        │                      │
│       │                  ▼                        │                      │
│       │            2. Review & ACC                │                      │
│       │                  │                        │                      │
│       │                  ▼                        │                      │
│       │            3. Generate Draft              │                      │
│       │            Surat Pengantar                 │                      │
│       │                  │                        ▼                      │
│       │                  │                  4. Validasi &                │
│       │                  │                      Tanda Tangan              │
│       │                  │                        │                      │
│       ▼                  ▼                        ▼                      │
│  5. Download PDF   6. Status Update         7. APPROVED_FINAL          │
│     (Setelah Approve)                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Fitur List (Priority Order)

### Phase 1: Core Infrastructure
1. [x] Database models: `pengajuan_asuransi`, `berita_acara_pemeriksaan`, `self_screening`
2. [x] Backend API: CRUD asuransi claims
3. [x] Backend API: Self-screening (mahasiswa input)
4. [x] Frontend: Student Insurance Page (form ajukan klaim + list riwayat)
5. [x] Frontend: Student Self-Screening Page

### Phase 2: TK & Admin Features
6. [ ] Backend API: BAP Kesehatan CRUD
7. [ ] Frontend: TK Insurance Review Page
8. [ ] Frontend: TK BAP Management Page
9. [ ] Frontend: Super Admin Insurance Management

### Phase 3: PDF Generation
10. [ ] Backend: PDF Generator - Formulir Rujukan Medis
11. [ ] Backend: PDF Generator - BAP Kesehatan
12. [ ] Backend: PDF Generator - Surat Pengantar Klaim Asuransi
13. [ ] Frontend: Download buttons on respective pages

### Phase 4: Reports & Export
14. [ ] Backend: Laporan Klinis API (aggregated stats)
15. [ ] Frontend: TK Reports Page (filters + export)
16. [ ] Frontend: Super Admin Health Reports Page

---

## API Endpoints (Final)

### Asuransi
```
GET    /api/insurance                    - List (filtered by role)
POST   /api/insurance                    - Create (mahasiswa)
GET    /api/insurance/:id                - Detail
PUT    /api/insurance/:id/status         - Update status (TK/Admin)
GET    /api/insurance/:id/export-pdf     - Download Surat Pengantar
```

### Self-Screening
```
POST   /api/mahasiswa/self-screening              - Create (mahasiswa)
GET    /api/mahasiswa/self-screening              - List own
GET    /api/mahasiswa/self-screening/:id          - Detail
PUT    /api/mahasiswa/self-screening/:id/complete - Mark completed by TK
```

### BAP Kesehatan
```
GET    /api/tenagakes/bap                    - List BAP
POST   /api/tenagakes/bap                    - Create BAP
GET    /api/tenagakes/bap/:id                - Detail
PUT    /api/tenagakes/bap/:id                - Update BAP
GET    /api/tenagakes/bap/:id/export-pdf     - Export BAP PDF
```

### Rujukan
```
POST   /api/tenagakes/patients/:id/rujukan   - Create rujukan
GET    /api/tenagakes/rujukan/:id            - Detail
PUT    /api/tenagakes/rujukan/:id/publish   - Publish (make available to mahasiswa)
GET    /api/mahasiswa/rujukan                - List own (published only)
GET    /api/mahasiswa/rujukan/:id/download  - Download PDF
```

### Laporan
```
GET    /api/tenagakes/reports                 - Clinical reports data
GET    /api/tenagakes/reports/export-excel    - Export Excel
GET    /api/tenagakes/reports/export-pdf      - Export PDF
```

---

## Files to Create/Modify

### Backend Models
- `backend/models/insurance.go` - new
- `backend/models/bap_kesehatan.go` - new
- `backend/models/self_screening.go` - new
- Update `backend/models/model.go` - register models

### Backend Controllers
- `backend/controllers/insurance_controller.go` - new
- `backend/controllers/bap_controller.go` - new
- `backend/controllers/self_screening_controller.go` - new
- `backend/controllers/rujukan_controller.go` - new
- `backend/controllers/pdf_controller.go` - new (all PDF generators)

### Backend Routes
- `backend/routes/insurance.go` - new
- `backend/routes/mahasiswa.go` - add self-screening routes
- `backend/routes/tenaga_kesehatan.go` - add BAP/rujukan routes

### Frontend Pages
- `frontend/src/pages/Student/InsurancePage.jsx` - new
- `frontend/src/pages/Student/SelfScreeningPage.jsx` - new
- `frontend/src/pages/TenagaKesehatan/InsuranceReview.jsx` - new
- `frontend/src/pages/TenagaKesehatan/BAPManagement.jsx` - new
- `frontend/src/pages/TenagaKesehatan/ReportsPage.jsx` - new
- `frontend/src/pages/SuperAdmin/InsuranceManagement.jsx` - new
- `frontend/src/pages/SuperAdmin/HealthReports.jsx` - new

### Frontend Services
- `frontend/src/services/api.js` - add insuranceService, bapService, reportsService
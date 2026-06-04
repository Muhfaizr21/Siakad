# Rencana Detail Implementasi: Integrasi Dokumen Medis Modul Tenaga Kesehatan BKU

Dokumen ini merinci langkah-langkah teknis, struktur database, logika backend (Go), desain PDF, dan implementasi UI frontend (React) untuk mendigitalisasi dokumen medis offline:
1. **Formulir Rujukan Pelayanan Kesehatan** (PDF Rujukan Medis)
2. **Berita Acara Pemeriksaan (BAP) Layanan Kesehatan** (PDF Rekap & BAP)
3. **Surat Pengantar Klaim BKU Assurance** (Fitur Klaim & PDF Pengantar)

---

## 💾 1. BACKEND: STRUKTUR DATABASE & MIGRASI (GO)

Kita perlu menambahkan tabel baru untuk mencatat pengajuan **Klaim Asuransi** dan data **Rujukan Medis** eksternal agar histori data tersimpan secara terstruktur.

### A. Model GORM Baru
Pada folder `/backend/models/` (atau langsung diregistrasikan di model file yang ada), kita tambahkan model berikut:

```go
package models

import (
	"time"
	"gorm.io/gorm"
)

// ClaimKesehatan mencatat data pengajuan klaim asuransi mahasiswa
type ClaimKesehatan struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	
	MahasiswaID  uint           `gorm:"not null" json:"mahasiswa_id"`
	Mahasiswa    Mahasiswa      `gorm:"foreignKey:MahasiswaID" json:"mahasiswa"`
	TanggalSakit time.Time      `gorm:"not null" json:"tanggal_sakit"`
	LokasiFaskes string         `gorm:"size:255;not null" json:"lokasi_faskes"` // RS atau Klinik tempat dirawat
	Kejadian     string         `gorm:"type:text;not null" json:"kejadian"`     // Diagnosa/kronologi singkat sakit
	NomorSurat   string         `gorm:"size:100;unique" json:"nomor_surat"`     // Auto-generate: xx/Direktorat-LK/Klaim-Assurance/2026
	Status       string         `gorm:"size:50;default:'Diajukan'" json:"status"` // Diajukan, Diproses, Selesai, Ditolak
	Catatan      string         `gorm:"type:text" json:"catatan"`
}

// RujukanKesehatan mencatat rujukan keluar ke Faskes eksternal
type RujukanKesehatan struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
	
	RekamMedisID       uint           `gorm:"not null" json:"rekam_medis_id"` // FK ke Rekam Medis (Kesehatan)
	FaskesTujuan       string         `gorm:"size:255;not null" json:"faskes_tujuan"` // RSUD, Puskesmas, Klinik UBK, dll.
	AlasanRujukan      string         `gorm:"size:255;not null" json:"alasan_rujukan"` // Penanganan Lanjutan, Pemeriksaan Penunjang, Gawat Darurat, dll.
	TenagaKesPengantar string         `gorm:"size:255" json:"tenaga_kes_pengantar"`
	CatatanTambahan    string         `gorm:"type:text" json:"catatan_tambahan"`
}
```

### B. Registrasi AutoMigrate
Daftarkan struct baru ini pada file `/backend/database/db_migrations.go` (atau di tempat fungsi GORM `AutoMigrate` dijalankan):
```go
db.AutoMigrate(
	&models.ClaimKesehatan{},
	&models.RujukanKesehatan{},
)
```

---

## 🔌 2. BACKEND: ROUTING & CONTROLLER LOGIC (GO)

### A. Routing Integrasi
Tambahkan routing baru pada handler Tenaga Kesehatan `/backend/routes/tenaga_kesehatan.go` di dalam setup group `/api/tenagakes`:

```go
func SetupTenagaKesehatanRoutes(r fiber.Router) {
	// Group auth tenagakes & super_admin
	nakes := r.Group("/tenagakes")
	
	// Referral PDF Generator
	nakes.Get("/patients/records/:recordId/export-rujukan-pdf", controllers.ExportReferralMedisPDF)
	
	// BAP PDF Generator
	nakes.Get("/reports/export-bap-pdf", controllers.ExportBapKesehatanPDF)
	
	// Insurance Claim CRUD & PDF
	nakes.Get("/claims", controllers.GetInsuranceClaims)
	nakes.Post("/claims", controllers.CreateInsuranceClaim)
	nakes.Get("/claims/:id/export-pdf", controllers.ExportClaimAssurancePDF)
}
```

### B. Controller: `ExportReferralMedisPDF`
Membaca parameter `recordId`, mengambil data dari tabel `rekam_medis_kesehatan` (atau model `Kesehatan`), melakukan preload data `Mahasiswa` (termasuk Program Studi & Fakultas), lalu menggambar PDF Portrait A4 sesuai spesifikasi *Formulir Rujukan Pelayanan Kesehatan*:

```go
func ExportReferralMedisPDF(c *fiber.Ctx) error {
	recordID := c.Params("recordId")
	
	// 1. Fetch data rekam medis BKU Kesehatan
	var record models.Kesehatan // Model Rekam Medis Fisik
	if err := db.Preload("Mahasiswa.ProgramStudi").Preload("Mahasiswa.Fakultas").Preload("TenagaKes").First(&record, recordID).Error; err != nil {
		return jsonError(c, fiber.StatusNotFound, "Rekam medis tidak ditemukan")
	}

	// 2. Initialize gofpdf
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	
	// Kop Surat Resmi UBK (Logo kiri, teks kanan)
	pdf.Image("uploads/images/bku_logo_kop.png", 10, 10, 25, 0, false, "", 0, "")
	pdf.SetFont("Arial", "B", 14)
	pdf.CellFormat(190, 6, "UNIVERSITAS BHAKTI KENCANA", "", 1, "C", false, 0, "")
	pdf.SetFont("Arial", "", 10)
	pdf.CellFormat(190, 5, "UNIT KESEHATAN KAMPUS (UKK)", "", 1, "C", false, 0, "")
	pdf.CellFormat(190, 5, "Jl. Soekarno Hatta No. 754 Bandung | Telp: 022 7830 760", "", 1, "C", false, 0, "")
	pdf.Line(10, 32, 200, 32)
	pdf.Ln(8)

	// Judul Form
	pdf.SetFont("Arial", "BU", 12)
	pdf.CellFormat(190, 6, "FORMULIR RUJUKAN PELAYANAN KESEHATAN", "", 1, "C", false, 0, "")
	pdf.Ln(4)

	// Bagian A: Identitas Pasien
	pdf.SetFont("Arial", "B", 10)
	pdf.CellFormat(190, 6, "A. IDENTITAS PASIEN", "B", 1, "L", false, 0, "")
	pdf.SetFont("Arial", "", 10)
	
	fields := [][]string{
		{"Nama Lengkap", record.Mahasiswa.Nama},
		{"NIM / NIP", record.Mahasiswa.NIM},
		{"Program Studi", record.Mahasiswa.ProgramStudi.Nama},
		{"Jenis Kelamin", record.Mahasiswa.JenisKelamin},
		{"Nomor HP Aktif", record.Mahasiswa.NoHP},
	}
	
	for _, f := range fields {
		pdf.CellFormat(50, 6, f[0], "1", 0, "L", false, 0, "")
		pdf.CellFormat(140, 6, ": "+f[1], "1", 1, "L", false, 0, "")
	}
	pdf.Ln(4)

	// Bagian B: Informasi Medis
	pdf.SetFont("Arial", "B", 10)
	pdf.CellFormat(190, 6, "B. INFORMASI MEDIS", "B", 1, "L", false, 0, "")
	pdf.SetFont("Arial", "", 10)
	
	ttvText := fmt.Sprintf("TD: %d/%d mmHg | Nadi: %d x/m | RR: %d x/m | Suhu: %.1f °C", 
		record.Sistole, record.Diastole, record.DenyutNadi, record.RR, record.SuhuTubuh)
		
	medis := [][]string{
		{"Keluhan Utama", record.Catatan},
		{"Tanda Vital (TTV)", ttvText},
		{"Tindakan Diberikan", record.TindakanDiberikan},
		{"Obat Diberikan", record.ObatDiberikan},
		{"Diagnosis Sementara", record.Hasil}, // e.g. Febris, Hipertensi
	}
	
	for _, m := range medis {
		pdf.CellFormat(50, 7, m[0], "1", 0, "L", false, 0, "")
		pdf.CellFormat(140, 7, ": "+m[1], "1", 1, "L", false, 0, "")
	}
	pdf.Ln(4)

	// Bagian C: Informasi Rujukan & TTD
	// ... (Gambar kotak checklist Faskes Rujukan & kotak TTD Nakes Pengantar) ...
	
	// Output file ke buffer/response
	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", "attachment; filename=Rujukan_"+record.Mahasiswa.NIM+".pdf")
	return pdf.Output(c.Response().BodyWriter())
}
```

### C. Controller: `ExportBapKesehatanPDF`
Menerima rentang tanggal, menghitung statistik pemeriksaan dari DB, lalu menghasilkan PDF Portrait A4 *Berita Acara Layanan Kesehatan*:
* **Statistik Dihitung**:
  * Jumlah Mahasiswa (Total `models.Kesehatan` terdaftar dalam range `start_date` s.d. `end_date`).
  * Persentase status kesehatan (`Sehat`, `Pantauan`, `Perlu Perhatian`).
  * Ringkasan tindakan yang paling sering diberikan.
* **Format TTD**:
  * Kolom tanda tangan di sebelah kiri untuk **Kepala Divisi Karir, Konseling dan Alumni** dan sebelah kanan untuk perwakilan **Tim Kesehatan/Medis**.

### D. Controller: `ExportClaimAssurancePDF`
Membaca id pengajuan klaim asuransi dari tabel `claim_kesehatans`, memformat file Kop Surat Resmi Kemahasiswaan UBK, menyisipkan rincian data sakit mahasiswa, dan mencetak surat resmi pengantar klaim asuransi:
* **Tujuan**: Ditujukan kepada **Tim BKU Assurance**.
* **Isi Surat**: Menyatakan pengajuan klaim asuransi atas nama mahasiswa bersangkutan beserta detail tanggal kejadian dan lokasi rumah sakit/klinik rujukan penanganan.

---

## 🖥️ 3. FRONTEND: INTEGRASI COMPONENT & UI (REACT)

### A. Halaman Baru: `InsuranceClaims.jsx`
Dibuat di `/frontend/src/pages/TenagaKesehatan/InsuranceClaims.jsx`. Halaman ini mengelola logs klaim asuransi mahasiswa.

```javascript
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '../SuperAdmin/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../SuperAdmin/components/ui/dialog';
import { Input } from '../SuperAdmin/components/ui/input';
import { Label } from '../SuperAdmin/components/ui/label';
import { toast } from 'react-hot-toast';
import { tenagaKesehatanService } from '../../services/api';

export default function InsuranceClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    nim: '',
    tanggal_sakit: '',
    lokasi_faskes: '',
    kejadian: '',
    catatan: ''
  });

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await tenagaKesehatanService.getInsuranceClaims();
      if (res.status === 'success') setClaims(res.data || []);
    } catch {
      toast.error("Gagal memuat log klaim asuransi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClaims(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await tenagaKesehatanService.createInsuranceClaim(form);
      if (res.status === 'success') {
        toast.success("Pengajuan klaim berhasil didaftarkan!");
        setIsModalOpen(false);
        setForm({ nim: '', tanggal_sakit: '', lokasi_faskes: '', kejadian: '', catatan: '' });
        fetchClaims();
      }
    } catch (err) {
      toast.error(err.message || "Gagal mengajukan klaim.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = (id) => {
    const url = tenagaKesehatanService.downloadClaimPDF(id);
    window.open(url, '_blank');
  };

  const columns = [
    { key: 'nomor_surat', label: 'Nomor Surat', className: 'font-bold' },
    { 
      key: 'mahasiswa', 
      label: 'Mahasiswa', 
      render: (v) => v ? `${v.Nama} (${v.NIM})` : '—' 
    },
    { 
      key: 'tanggal_sakit', 
      label: 'Tgl Kejadian', 
      render: (v) => v ? new Date(v).toLocaleDateString('id-ID') : '—' 
    },
    { key: 'lokasi_faskes', label: 'Faskes Penanganan' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold font-jakarta text-neutral-900 uppercase">Klaim Asuransi (BKU Assurance)</h1>
        <Button onClick={() => setIsModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
          Ajukan Klaim Baru
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={claims}
        loading={loading}
        searchPlaceholder="Cari berdasarkan nama/NIM..."
        actions={(row) => (
          <Button 
            onClick={() => handleDownloadPDF(row.id)} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 border-teal-200 text-teal-600 hover:bg-teal-50"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Cetak Pengantar
          </Button>
        )}
      />

      {/* Dialog Ajukan Klaim */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold uppercase font-jakarta">Pengajuan BKU Assurance</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label className="text-xs">NIM Mahasiswa</Label>
              <Input required value={form.nim} onChange={e => setForm({...form, nim: e.target.value})} placeholder="Masukkan NIM..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tanggal Kejadian / Masuk RS</Label>
              <Input type="date" required value={form.tanggal_sakit} onChange={e => setForm({...form, tanggal_sakit: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Rumah Sakit / Klinik Penanganan</Label>
              <Input required value={form.lokasi_faskes} onChange={e => setForm({...form, lokasi_faskes: e.target.value})} placeholder="Contoh: RS Hermina Bandung" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Diagnosa Medis / Kronologi</Label>
              <textarea 
                required 
                value={form.kejadian} 
                onChange={e => setForm({...form, kejadian: e.target.value})}
                placeholder="Tuliskan penyebab sakit/kecelakaan singkat..."
                className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-teal-500 min-h-[80px]"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-teal-600 text-white hover:bg-teal-700">
                {isSubmitting ? 'Mengirim...' : 'Submit Pengajuan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### B. Modifikasi Sidebar: `PortalConfig.js`
Tambahkan menu asuransi ke list menu `tenagakes`:
```javascript
      {
        group: 'PELAYANAN MEDIS',
        items: [
          { name: 'Booking Masuk', icon: 'calendar_month', path: '/tenagakes/bookings' },
          { name: 'Jadwal Praktik', icon: 'schedule', path: '/tenagakes/schedule' },
          { name: 'Daftar Mahasiswa', icon: 'people', path: '/tenagakes/patients' },
          { name: 'Klaim Asuransi', icon: 'security', path: '/tenagakes/claims' }, // NEW
        ]
      }
```

### C. Dashboard Nakes: `TenagaKesehatanDashboard.jsx`
Tambahkan dialog filter & tombol aksi **"Cetak Berita Acara (BAP)"**:
- Pengguna mengklik tombol *"Cetak BAP"*, memicu modal popup date-range (Tanggal Mulai s.d. Tanggal Selesai).
- Setelah tanggal dipilih, tombol download akan menavigasi browser ke URL `/api/tenagakes/reports/export-bap-pdf?start_date=xxx&end_date=yyy`.

### D. Rekam Medis Pasien: `PatientMedicalRecord.jsx`
Tambahkan tombol cetak rujukan di tabel riwayat periksa:
- Periksa status record, jika `tindakan_diberikan` atau `rekomendasi` mengandung kata "dirujuk" atau jika field `is_rujuk` bernilai true, tampilkan tombol **"Unduh Surat Rujukan"** dengan link download `/api/tenagakes/patients/records/:id/export-rujukan-pdf`.

---

## 🧪 4. VERIFIKASI & PENGUJIAN

1. **Uji Validasi Form**:
   * Memastikan input form klaim asuransi memvalidasi NIM mahasiswa di sistem akademik untuk menghindari input manual data salah.
2. **Kesesuaian Layout PDF**:
   * Melakukan review output visual PDF menggunakan browser simulator (Playwright/Chrome) untuk memastikan logo Kop Surat BKU sejajar, ukuran teks tepat, dan garis tabel presisi dengan batas margin kertas.

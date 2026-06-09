# Panduan Standar UI Tabel Siakad (DataTable Guidelines)

Dokumen ini adalah panduan referensi gaya (style guide) wajib untuk pembuatan atau refaktor tabel di seluruh halaman modul Siakad (Super Admin, Fakultas, maupun Kencana). 
Harap patuhi panduan ini agar seluruh tabel memiliki desain yang seragam, rapi, dan proporsional.

## 1. Gunakan Kerangka Global DataTable
**DILARANG** menggunakan tag `<table>` native HTML secara manual. Selalu gunakan komponen `DataTable` global yang sudah menyediakan fitur Search, Pagination, dan Empty State otomatis.

```jsx
import { DataTable } from '@/components/ui/DataTable'

<DataTable
  data={dataList}
  loading={isLoading}
  searchPlaceholder="Cari data..."
  searchable={true}
  columns={[
    // Definisi kolom...
  ]}
/>
```

## 2. Standar Tipografi Isi Tabel (Ukuran Font Proporsional)
Untuk menghindari teks yang terlalu besar (kebesaran) di dalam tabel, patuhi aturan ukuran kelas Tailwind berikut:

*   **Teks Utama (Nama/Judul Utama):** 
    Gunakan `text-[13px] font-bold text-[var(--theme-text)] leading-tight`
*   **Teks Deskripsi/Subjudul:** 
    Gunakan `text-[11px] font-medium text-[var(--theme-text-muted)] leading-relaxed`
*   **Teks ID / Mono:**
    Gunakan `text-[11px] text-[var(--theme-text-muted)] font-mono font-bold`

**Contoh Kolom Teks Utama:**
```jsx
{
  key: 'nama',
  label: 'Nama Kategori',
  className: 'w-[200px]',
  render: (_, item) => (
    <p className="text-[13px] font-bold text-[var(--theme-text)] leading-tight">{item.nama}</p>
  )
}
```

## 3. Desain Label / Status (Badge)
Agar tidak terlihat terlalu gemuk/chunky, padding untuk pil status atau badge harus dirampingkan.
*   **Gunakan Padding Tipis:** `px-2.5 py-1` (bukan px-3 py-1.5)
*   **Ukuran Font Badge:** `text-[10px] font-bold tracking-wide`

**Contoh Badge Status:**
```jsx
<span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--theme-secondary-light)] text-[var(--theme-secondary)] text-[10px] font-bold tracking-wide">
  Wajib
</span>
```

## 4. Gaya Minimalis Kolom Aksi & Ikon (Lucide)
Ini adalah aturan paling kritis untuk keseragaman desain tombol Edit, Hapus, Detail, dsb.

**Aturan Penjajaran (Alignment):**
Kolom aksi **HARUS** diposisikan rata tengah (`text-center`) agar posisi ikon presisi lurus dengan judul kolom.

**Aturan Visual Tombol:**
*   **JANGAN** gunakan tombol *blocky* berlatar solid (seperti `bg-[var(--theme-surface)]` dengan border).
*   **GUNAKAN** ikon transparan dan minimalis dari `lucide-react` (seperti `SquarePen`, `Trash2`, `Eye`, `Download`).
*   **UKURAN Tombol & Ikon:** Kontainer tombol gunakan `p-1.5 rounded-lg`. Ikon gunakan `w-4 h-4` dengan `strokeWidth={2.5}`.

**Implementasi Kode Kolom Aksi Standar:**
```jsx
import { SquarePen, Trash2, Eye } from 'lucide-react'

{
  key: 'actions',
  label: 'Aksi',
  className: 'w-[100px] text-center',      // <--- Wajib text-center
  cellClassName: 'text-center',            // <--- Wajib text-center
  sortable: false,
  render: (_, row) => (
    // Wajib dibungkus flex justify-center
    <div className="flex justify-center items-center gap-1"> 
      
      {/* Tombol Detail/View (Mata Dajjal) / Edit */}
      <button
        onClick={() => openEdit(row)}
        title="Edit"
        className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors flex items-center justify-center cursor-pointer"
      >
        <SquarePen className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {/* Tombol Hapus (Merah) */}
      <button
        onClick={() => openDelete(row)}
        title="Hapus"
        className="p-1.5 rounded-lg text-[var(--theme-error)] hover:bg-[var(--theme-error-light)] transition-colors flex items-center justify-center cursor-pointer"
      >
        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
      </button>

    </div>
  )
}
```

## 5. Konfirmasi Hapus & Alert (Notifikasi)
Untuk menjaga konsistensi interaksi UX, **DILARANG** membuat modal konfirmasi hapus secara manual (custom div). Gunakan komponen global yang sudah disediakan.

### Konfirmasi Hapus (DeleteConfirmModal)
Gunakan komponen `@/components/ui/DeleteConfirmModal` untuk semua aksi penghapusan data.

```jsx
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'

// Di dalam komponen:
const [deleteTarget, setDeleteTarget] = useState(null)
const [isDeleting, setIsDeleting] = useState(false)

const handleDelete = async () => {
  setIsDeleting(true)
  try {
    // Panggil API Hapus
    await api.delete(deleteTarget.id)
    toast.success('Data berhasil dihapus!')
    setDeleteTarget(null)
  } catch (error) {
    toast.error('Gagal menghapus data!')
  } finally {
    setIsDeleting(false)
  }
}

// Di dalam render/return:
<DeleteConfirmModal
  isOpen={!!deleteTarget}
  onClose={() => setDeleteTarget(null)}
  onConfirm={handleDelete}
  title="Hapus Kategori?" // Opsional (default: "Hapus Data?")
  description={`Apakah Anda yakin ingin menghapus ${deleteTarget?.nama}?`} // Opsional
  loading={isDeleting}
/>
```

### Notifikasi Berhasil / Gagal (Toast)
Untuk notifikasi (alert) hasil aksi (simpan, hapus, update), gunakan `react-hot-toast` bawaan.

```jsx
import toast from 'react-hot-toast'

// Sukses
toast.success('Data berhasil disimpan!')

// Gagal
toast.error('Terjadi kesalahan sistem!')
```

Dengan mengikuti kerangka instruksi `TABLE_README.md` ini, UI web Siakad akan selalu terasa *clean, professional, modern,* dan proporsional.

# 🔧 SOLUSI: Dropdown Filter Ormawa untuk Super Admin

## ✅ STATUS IMPLEMENTASI

### SELESAI
1. **OrmawaSelector Component** - Component reusable untuk dropdown ormawa selector
   - File: `frontend/src/pages/SuperAdmin/components/OrmawaSelector.jsx`
   - Features:
     - Auto-fetch organizations dari `/admin/ormawa`
     - Auto-select ormawa pertama
     - Styling konsisten dengan design system
     - Loading state
     - Handle both uppercase (`ID`) dan lowercase (`id`) field dari backend

2. **SuperAdminOrmawaDashboard** - Halaman dashboard ormawa dengan dropdown selector
   - File: `frontend/src/pages/SuperAdmin/SuperAdminOrmawaDashboard.jsx`
   - Features:
     - Dropdown selector ormawa di header
     - Load data berdasarkan `selectedOrmawaId`
     - Menampilkan stats, proposals, events untuk ormawa terpilih
     - Empty state ketika belum pilih ormawa
   - Route: `/admin/ormawa-dashboard`

### TODO - Halaman Lain yang Perlu Dropdown

Halaman-halaman berikut di Super Admin juga butuh dropdown selector karena menampilkan data ormawa spesifik:

1. **Anggota Management** (`/admin/ormawa-anggota`)
   - Current: Pakai `AnggotaManagement` dari `OrmawaAdmin`
   - Need: Buat `SuperAdminOrmawaAnggota.jsx` dengan dropdown

2. **Struktur Organisasi** (`/admin/ormawa-struktur`)
   - Current: Pakai `StrukturOrganisasi` dari `OrmawaAdmin`
   - Need: Buat `SuperAdminOrmawaStruktur.jsx` dengan dropdown

3. **Proposal Management** (`/admin/ormawa-proposal`)
   - Current: Pakai `ProposalManagement` dari `OrmawaAdmin`
   - Need: Buat `SuperAdminOrmawaProposal.jsx` dengan dropdown

4. **Jadwal Kegiatan** (`/admin/ormawa-jadwal`)
   - Current: Pakai `JadwalKegiatan` dari `OrmawaAdmin`
   - Need: Buat `SuperAdminOrmawaJadwal.jsx` dengan dropdown

5. **Absensi Kegiatan** (`/admin/ormawa-absensi`)
   - Current: Pakai `AbsensiKegiatan` dari `OrmawaAdmin`
   - Need: Buat `SuperAdminOrmawaAbsensi.jsx` dengan dropdown

6. **Keuangan Kas** (`/admin/ormawa-keuangan`)
   - Current: Pakai `KeuanganKas` dari `OrmawaAdmin`
   - Need: Buat `SuperAdminOrmawaKeuangan.jsx` dengan dropdown

7. **LPJ Management** (`/admin/ormawa-lpj`)
   - Current: Pakai `LpjManagement` dari `OrmawaAdmin`
   - Need: Buat `SuperAdminOrmawaLpj.jsx` dengan dropdown

8. **Aspirasi Management** (`/admin/ormawa-aspirasi`)
   - Current: Pakai `AspirationManagement` dari `OrmawaAdmin`
   - Need: Buat `SuperAdminOrmawaAspirasi.jsx` dengan dropdown

9. **Pengumuman** (`/admin/ormawa-pengumuman`)
   - Current: Pakai `Pengumuman` dari `OrmawaAdmin`
   - Need: Buat `SuperAdminOrmawaPengumuman.jsx` dengan dropdown

10. **Notifikasi** (`/admin/ormawa-notifikasi`)
    - Current: Pakai `Notifikasi` dari `OrmawaAdmin`
    - Need: Buat `SuperAdminOrmawaNotifikasi.jsx` dengan dropdown

---

## 📋 Template untuk Halaman Baru

Gunakan template berikut untuk membuat halaman Super Admin dengan dropdown ormawa:

```jsx
"use client"

import React, { useState, useEffect } from 'react'
import { OrmawaSelector } from './components/OrmawaSelector'
import { fetchWithAuth, API_BASE_URL } from '../../services/api'
// Import components lain yang diperlukan

const API = `${API_BASE_URL}/ormawa`

export default function SuperAdminOrmawaXXX() {
  const [selectedOrmawaId, setSelectedOrmawaId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState([]) // State untuk data yang akan ditampilkan

  // Load data whenever selectedOrmawaId changes
  useEffect(() => {
    if (!selectedOrmawaId) return

    const loadData = async () => {
      setIsLoading(true)
      try {
        const response = await fetchWithAuth(`${API}/endpoint?ormawaId=${selectedOrmawaId}`)
        if (response.status === 'success') {
          setData(response.data || [])
        }
      } catch (error) {
        console.error('Gagal load data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [selectedOrmawaId])

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header dengan Dropdown */}
        <section
          className="rounded-xl p-5 border border-border"
          style={{ backgroundColor: 'var(--theme-surface)' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}
              >
                <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                  [Nama Halaman] <span style={{ color: 'var(--theme-secondary)' }}>(Super Admin)</span>
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Pilih organisasi untuk melihat data
                </p>
              </div>
            </div>

            {/* Dropdown Ormawa Selector */}
            <OrmawaSelector 
              value={selectedOrmawaId} 
              onChange={setSelectedOrmawaId}
            />
          </div>
        </section>

        {/* Content - hanya tampil kalau sudah pilih ormawa */}
        {!selectedOrmawaId ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '40px' }}>
                groups
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Pilih Organisasi</h3>
            <p className="text-sm text-slate-500">
              Gunakan dropdown di atas untuk memilih organisasi yang ingin dilihat
            </p>
          </div>
        ) : (
          <>
            {/* Konten halaman di sini */}
            {isLoading ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined animate-spin text-slate-400" style={{ fontSize: '40px' }}>
                  sync
                </span>
              </div>
            ) : (
              // Render data
              <div>
                {/* Component content here */}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
```

---

## 🔄 Cara Implementasi untuk Halaman Lain

### Step 1: Copy template di atas
### Step 2: Ganti nama function dan sesuaikan:
- Function name: `SuperAdminOrmawaXXX`
- Title: Sesuaikan dengan halaman
- Icon: Sesuaikan dengan halaman
- API endpoint: Sesuaikan dengan data yang dibutuhkan

### Step 3: Import di App.jsx
```jsx
import SuperAdminOrmawaXXX from './pages/SuperAdmin/SuperAdminOrmawaXXX'
```

### Step 4: Update routing di App.jsx
```jsx
<Route path="ormawa-xxx" element={<SuperAdminOrmawaXXX />} />
```

---

## 📌 Catatan Penting

### Backend API Support
Backend sudah support query param `ormawaId` di endpoint-endpoint ormawa:
- `GET /ormawa/stats?ormawaId={id}` - Stats dashboard
- `GET /ormawa/proposals?ormawaId={id}` - Proposals
- `GET /ormawa/members?ormawaId={id}` - Members
- `GET /ormawa/events?ormawaId={id}` - Events
- `GET /ormawa/cashflow?ormawaId={id}` - Keuangan
- Dan lain-lain

### Halaman yang TIDAK Butuh Dropdown

Halaman-halaman ini show data aggregated (SEMUA ormawa), jadi tidak perlu dropdown:

1. **List Ormawa** (`/admin/organizations`) - `KelolaOrganisasi.jsx`
   - Tampilkan semua ormawa dalam table
   - Endpoint: `GET /admin/ormawa`

2. **Leaderboard Ormawa** (`/admin/gamifikasi`) - `GamifikasiOrmawa.jsx`
   - Tampilkan ranking semua ormawa
   - Endpoint: `GET /admin/ormawa/leaderboard`

3. **Proposal Global** (`/admin/ormawa`) - `ProposalPipeline.jsx`
   - Tampilkan proposal dari semua ormawa
   - Endpoint: `GET /admin/proposals`

4. **Aspirasi Global** (`/admin/aspirations`) - `AspirationControl.jsx`
   - Tampilkan aspirasi dari semua mahasiswa
   - Endpoint: `GET /admin/aspirations`

---

## 🎯 Hasil Akhir

✅ **Super Admin bisa:**
1. Lihat data semua ormawa di halaman aggregated (List, Leaderboard, Proposal Global)
2. Pilih ormawa specific dengan dropdown di halaman detail (Dashboard, Anggota, Proposal, dll)
3. Switch between ormawa dengan mudah tanpa logout/login
4. Memonitor setiap ormawa dengan lebih detail

✅ **UX Improvement:**
- Clear separation antara data aggregated vs data specific
- Dropdown selector yang intuitif dan mudah digunakan
- Empty state yang informatif ketika belum pilih ormawa
- Auto-select ormawa pertama untuk kemudahan

---

**Last Updated**: 6 Juni 2026  
**Status**: 
- ✅ Component OrmawaSelector - DONE
- ✅ SuperAdminOrmawaDashboard - DONE  
- ⏳ Halaman lain (Anggota, Struktur, Proposal, dll) - TODO

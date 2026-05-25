"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog'
import { DeleteConfirmModal } from './components/ui/DeleteConfirmModal'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const BookOpen = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>menu_book</span>;
const Layers = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>layers</span>;
const ChevronLeft = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chevron_left</span>;
const ChevronRight = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chevron_right</span>;



const JENJANG_OPTIONS = ['S1', 'S2', 'S3', 'D3', 'D4', 'Profesi', 'Spesialis']

const JENJANG_STYLES = {
  S1: 'bg-blue-500 text-white shadow-blue-200',
  S2: 'bg-indigo-500 text-white shadow-indigo-200',
  S3: 'bg-neutral-900 text-white shadow-neutral-200',
  D3: 'bg-emerald-500 text-white shadow-emerald-200',
  D4: 'bg-teal-500 text-white shadow-teal-200',
  Profesi: 'bg-rose-500 text-white shadow-rose-200',
  DEFAULT: 'bg-neutral-100 text-neutral-500 shadow-none'
}

export default function KelolaProdi() {
  const [data, setData] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ Nama: '', Kode: '', Jenjang: 'S1', FakultasID: '' })

  const fetchData = async ({ syncFromPddikti = false, showSyncToast = false } = {}) => {
    setLoading(true)
    try {
      if (syncFromPddikti) {
        await adminService.syncPddikti('Universitas Bhakti Kencana', 'all')
        if (showSyncToast) toast.success('Sinkronisasi Kurikulum Berhasil')
      }
      // Use separate fetches to ensure one failure doesn't block the other
      try {
        const prodiRes = await adminService.getAllProdi()
        if (prodiRes.status === 'success') setData(prodiRes.data || [])
      } catch (err) {
        toast.error('Gagal memuat data Prodi: ' + err.message)
      }

      try {
        const facRes = await adminService.getAllFaculties()
        if (facRes.status === 'success') setFaculties(facRes.data || [])
      } catch (err) {
        toast.error('Gagal memuat data Fakultas: ' + err.message)
      }

    } catch (err) { 
      toast.error(err.message || 'Gagal sinkronisasi cluster akademik') 
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSyncPddikti = async () => {
    setIsSyncing(true)
    try {
      await fetchData({ syncFromPddikti: true, showSyncToast: true })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleOpenAdd = () => { 
    setIsEditMode(false)
    setForm({ Nama: '', Kode: '', Jenjang: 'S1', FakultasID: '' })
    setIsCrudOpen(true) 
  }

  const handleOpenEdit = (row) => { 
    setIsEditMode(true)
    setSelected(row)
    setForm({ 
      ID: row.id || row.ID, 
      Nama: row.Nama || '', 
      Kode: row.Kode || '', 
      Jenjang: row.Jenjang || 'S1', 
      FakultasID: row.FakultasID ? String(row.FakultasID) : ''
    })
    setIsCrudOpen(true) 
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    const payload = { ...form, FakultasID: parseInt(form.FakultasID) || 0 }
    try {
      const targetId = form.ID || form.id
      const res = targetId ? await adminService.updateProdi(targetId, payload) : await adminService.createProdi(payload)
      if (res.status === 'success') { 
        toast.success(targetId ? 'Konfigurasi prodi berhasil dimodifikasi' : 'Registrasi prodi baru berhasil')
        setIsCrudOpen(false)
        fetchData() 
      } else {
        toast.error(res.message || 'Gagal menyimpan konfigurasi data')
      }
    } catch { toast.error('Kesalahan operasional internal') } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteProdi(selected.id || selected.ID)
      toast.success('Entitas program studi dihapus')
      setIsDelOpen(false)
      fetchData()
    } catch { toast.error('Gagal menghapus entitas data') } finally { setIsSubmitting(false) }
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [filterJenjang, setFilterJenjang] = useState('all')
  const [filterFakultasID, setFilterFakultasID] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchSearch = !searchTerm || [
        row.Nama, row.Kode, row.Jenjang, row.FakultasNama, row.Fakultas?.Nama
      ].some(v => v && String(v).toLowerCase().includes(searchTerm.toLowerCase()))
      const matchJenjang = filterJenjang === 'all' || row.Jenjang === filterJenjang
      const matchFakultas = filterFakultasID === 'all' || String(row.FakultasID) === filterFakultasID
      return matchSearch && matchJenjang && matchFakultas
    })
  }, [data, searchTerm, filterJenjang, filterFakultasID])

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const stats = {
    total: data.length,
    faculties: faculties.length,
    s1: data.filter(p => p.Jenjang === 'S1').length,
    d3: data.filter(p => p.Jenjang === 'D3').length
  }

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Academic Operations</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                Kelola <span className="text-primary">Program Studi</span>
              </h1>
              <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed">
                Manajemen kurikulum, jenjang pendidikan, dan sinkronisasi struktur program studi lintas fakultas melalui master database PDDIKTI.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleSyncPddikti} 
                variant="outline" 
                disabled={isSyncing}
                className="h-11 px-6 rounded-xl border-neutral-200 text-xs font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 gap-2 transition-all active:scale-95 shadow-sm"
              >
                {isSyncing ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <RefreshCw size={14} className="text-primary" />}
                {isSyncing ? 'Syncing...' : 'PDDIKTI Sync'}
              </Button>
              
              <Button 
                onClick={handleOpenAdd}
                className="h-11 px-8 rounded-xl bg-neutral-900 text-white hover:bg-primary shadow-xl shadow-neutral-900/10 gap-3 transition-all active:scale-95 border-none group"
              >
                <div className="size-5 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}  strokeWidth={3}>add</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Registrasi Prodi</span>
              </Button>
            </div>
          </div>
        </section>
        
        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-[#eef4ff] rounded-xl flex justify-center items-center text-[#00236F] flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >school</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Total Prodi</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{stats.total}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Program studi terdaftar</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-indigo-50 rounded-xl flex justify-center items-center text-indigo-600 flex-shrink-0">
                    <BookOpen size={18} />
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Fakultas</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{stats.faculties}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Unit akademik naungan</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-amber-50 rounded-xl flex justify-center items-center text-amber-600 flex-shrink-0">
                    <Layers size={18} />
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Jenjang S1</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{stats.s1}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Program sarjana strata 1</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex justify-center items-center text-[#16a34a] flex-shrink-0">
                    <BookOpen size={18} />
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Jenjang D3</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{stats.d3}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Program diploma tiga</p>
           </div>
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">

          {/* Table Toolbar */}
          <div className="p-4 md:p-5 border-b border-[#e5e5e5] bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1">
                <h2 className="font-bold text-base text-[#171717]">Daftar Program Studi</h2>
                <p className="text-xs text-[#737373] mt-0.5">Manajemen seluruh program studi yang terdaftar di universitas.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Search */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" style={{ fontSize: '14px' }} >search</span>
                  <input
                    type="text"
                    placeholder="Cari nama atau kode prodi..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="pl-9 pr-4 h-9 w-56 rounded-xl border border-[#e5e5e5] focus:outline-none focus:border-[#00236F] text-sm bg-white"
                  />
                </div>
                {/* Filter Jenjang */}
                <Select value={filterJenjang} onValueChange={v => { setFilterJenjang(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 w-36 rounded-xl border-[#e5e5e5] bg-white text-xs font-medium">
                    <SelectValue placeholder="Semua Jenjang" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-neutral-200 shadow-xl">
                    <SelectItem value="all" className="text-xs">Semua Jenjang</SelectItem>
                    {JENJANG_OPTIONS.map(j => <SelectItem key={j} value={j} className="text-xs">{j}</SelectItem>)}
                  </SelectContent>
                </Select>
                {/* Filter Fakultas */}
                <Select value={filterFakultasID} onValueChange={v => { setFilterFakultasID(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 w-44 rounded-xl border-[#e5e5e5] bg-white text-xs font-medium">
                    <SelectValue placeholder="Semua Fakultas" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-neutral-200 shadow-xl">
                    <SelectItem value="all" className="text-xs">Semua Fakultas</SelectItem>
                    {faculties.filter(f => f && (f.id || f.ID)).map((f) => (
                      <SelectItem key={f.id || f.ID} value={String(f.id || f.ID)} className="text-xs">
                        {f.Nama || f.nama || '—'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Reset */}
                {(searchTerm || filterJenjang !== 'all' || filterFakultasID !== 'all') && (
                  <button
                    onClick={() => { setSearchTerm(''); setFilterJenjang('all'); setFilterFakultasID('all'); setCurrentPage(1); }}
                    className="h-9 px-3 text-xs font-semibold text-[#dc2626] bg-[#fef2f2] rounded-xl border border-[#fecaca] hover:bg-[#fee2e2] transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#e5e5e5]">
                  <th className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider w-[50px]">#</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider w-[150px]">Kode</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider">Nama Program Studi</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider w-[110px] text-center">Jenjang</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider">Fakultas</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider text-right w-[100px]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#eef1f6]">
                      {[...Array(6)].map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-[#f5f5f5] rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-[#00236F]">
                          <span className="material-symbols-outlined" style={{ fontSize: '22px' }} >school</span>
                        </div>
                        <p className="font-bold text-sm text-[#171717]">Belum Ada Program Studi</p>
                        <p className="text-xs text-[#a3a3a3]">Klik "Registrasi Prodi" untuk menambahkan data baru.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, i) => {
                    const fakultasNama = row.FakultasNama || row.Fakultas?.Nama || '—'
                    const jenjangStyle = JENJANG_STYLES[row.Jenjang] || JENJANG_STYLES.DEFAULT
                    return (
                      <tr key={row.id || row.ID || i} className="border-b border-[#eef1f6] hover:bg-[#f7faff] transition-colors">
                        <td className="px-5 py-3.5 text-sm text-[#a3a3a3] font-medium">
                          {(currentPage - 1) * pageSize + i + 1}
                        </td>
                         <td className="px-5 py-3.5">
                          <code className="text-[12px] font-bold text-[#3b82f6] tracking-[0.1em]">
                            {row.Kode || '—'}
                          </code>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-sm text-[#171717] leading-snug">{row.Nama || '—'}</p>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={cn('inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border-none', jenjangStyle)}>
                            {row.Jenjang || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-[#525252] font-medium leading-snug">{fakultasNama}</p>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(row)}
                              className="p-1.5 text-[#a3a3a3] hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >edit</span>
                            </button>
                            <button
                              onClick={() => { setSelected(row); setIsDelOpen(true) }}
                              className="p-1.5 text-[#a3a3a3] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#525252]">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#a3a3a3]">
                Menampilkan <span className="font-bold text-[#171717]">{filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredData.length)}</span> dari <span className="font-bold text-[#00236F]">{filteredData.length}</span> data
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#a3a3a3]">Baris:</span>
                <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 w-24 rounded-lg border-[#e5e5e5] bg-white text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-neutral-200 shadow-xl">
                    {[5, 10, 15, 25, 50].map(s => (
                      <SelectItem key={s} value={String(s)} className="text-xs">{s} baris</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold border border-[#e5e5e5] rounded-lg bg-white hover:bg-[#eef4ff] disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  let p = idx + 1
                  if (totalPages > 5 && currentPage > 3) p = currentPage - 2 + idx
                  if (p > totalPages) return null
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                        currentPage === p
                          ? 'bg-[#00236F] text-white shadow-sm'
                          : 'text-[#525252] hover:bg-[#eef4ff] border border-[#e5e5e5]'
                      )}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 text-xs font-semibold border border-[#e5e5e5] rounded-lg bg-white hover:bg-[#eef4ff] disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ── CRUD Modal ───────────────────────────────────────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          <DialogHeader className="px-7 pt-7 pb-5 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#eef4ff] flex items-center justify-center text-[#00236F]">
                {isEditMode ? <span className="material-symbols-outlined" style={{ fontSize: '13px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '13px' }}  strokeWidth={3}>add</span>}
              </div>
              <span className="text-xs font-bold text-[#00236F] tracking-wide">
                {isEditMode ? 'Edit Program Studi' : 'Tambah Program Studi'}
              </span>
            </div>
            <DialogTitle className="text-xl font-bold font-jakarta tracking-tight text-[#171717]">
              {isEditMode ? 'Ubah Data Prodi' : 'Registrasi Prodi Baru'}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#737373] mt-1">
              Isi data program studi dan pilih fakultas yang menaunginya.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="px-7 py-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#525252] font-jakarta">Nama Program Studi</Label>
                <Input
                  required
                  value={form.Nama}
                  onChange={e => setForm(prev => ({ ...prev, Nama: e.target.value }))}
                  placeholder="Contoh: Farmasi"
                  className="h-10 rounded-xl border-[#e5e5e5] bg-[#fafafa] focus:bg-white text-sm font-jakarta"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#525252] font-jakarta">Kode Prodi</Label>
                <Input
                  required
                  value={form.Kode}
                  onChange={e => setForm(prev => ({ ...prev, Kode: e.target.value }))}
                  placeholder="Contoh: FM"
                  className="h-10 rounded-xl border-[#e5e5e5] bg-[#fafafa] focus:bg-white text-sm font-jakarta uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#525252] font-jakarta">Jenjang Pendidikan</Label>
                <Select value={form.Jenjang} onValueChange={v => setForm(prev => ({ ...prev, Jenjang: v }))}>
                  <SelectTrigger className="h-10 rounded-xl border-[#e5e5e5] bg-[#fafafa] text-sm font-jakarta">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl border-[#e5e5e5]">
                    {JENJANG_OPTIONS.map(j => <SelectItem key={j} value={j} className="text-sm">{j}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#525252] font-jakarta">Fakultas Naungan</Label>
                <Select
                  value={form.FakultasID}
                  onValueChange={v => setForm(prev => ({ ...prev, FakultasID: v }))}
                >
                  <SelectTrigger className="h-10 rounded-xl border-[#e5e5e5] bg-[#fafafa] text-sm font-jakarta">
                    <SelectValue placeholder="Pilih Fakultas" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl border-[#e5e5e5]">
                    {faculties.filter(f => f && (f.id || f.ID)).length > 0 ? (
                      faculties.filter(f => f && (f.id || f.ID)).map((f) => (
                        <SelectItem key={f.id || f.ID} value={String(f.id || f.ID)} className="text-sm">
                          {f.Nama || f.nama || '—'}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-6 px-2 text-center">
                        <p className="text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1">Tidak Ada Data</p>
                        <p className="text-[11px] text-[#737373]">Fakultas belum tersedia</p>
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-5 flex flex-row gap-3 border-t border-[#f0f0f0]">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCrudOpen(false)}
                className="flex-1 h-11 rounded-xl text-sm font-semibold text-[#737373] hover:bg-[#f5f5f5] hover:text-[#171717] border border-[#e5e5e5]"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] h-11 rounded-xl bg-[#00236F] text-white hover:bg-[#003399] shadow-md transition-all active:scale-95 border-none gap-2"
              >
                {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '15px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >save</span>}
                <span className="text-sm font-semibold">{isEditMode ? 'Perbarui Prodi' : 'Simpan Prodi'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Program Studi?"
        description="Data program studi ini akan dihapus secara permanen beserta seluruh relasinya. Tindakan ini tidak dapat dibatalkan."
        loading={isSubmitting}
      />
    </div>
  )
}


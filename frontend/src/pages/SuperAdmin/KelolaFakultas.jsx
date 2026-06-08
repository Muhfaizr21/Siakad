"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Phone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>phone</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const Building2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>business</span>;
const LayoutGrid = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>grid_view</span>;
const Group = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>award_star</span>;



const JENJANG_STYLES = {
  S1: 'bg-blue-500 text-white',
  S2: 'bg-indigo-500 text-white',
  S3: 'bg-neutral-900 text-white',
  D3: 'bg-emerald-500 text-white',
  D4: 'bg-teal-500 text-white',
  Profesi: 'bg-rose-500 text-white',
  DEFAULT: 'bg-neutral-100 text-neutral-500'
}

export default function KelolaFakultas() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ Nama: '', Kode: '', Email: '', NoHP: '', Dekan: '' })

  const [selectedFacultyDetails, setSelectedFacultyDetails] = useState(null)
  const [isFacultyDetailsOpen, setIsFacultyDetailsOpen] = useState(false)
  const [isAllFacultiesOpen, setIsAllFacultiesOpen] = useState(false)
  const [isAllProdiOpen, setIsAllProdiOpen] = useState(false)

  const fetchData = async ({ syncFromPddikti = false, showSyncToast = false } = {}) => {
    setLoading(true)
    try {
      if (syncFromPddikti) {
        await adminService.syncPddikti('Universitas Bhakti Kencana', 'all')
        if (showSyncToast) toast.success('Sinkronisasi Data Fakultas Berhasil')
      }
      const res = await adminService.getAllFaculties()
      if (res.status === 'success') {
        let fetchedData = res.data || []
        
        const activeFakultas = localStorage.getItem('superadmin_fakultas_id')
        if (activeFakultas && activeFakultas !== 'all') {
          fetchedData = fetchedData.filter(f => String(f.id || f.ID) === activeFakultas)
        }

        const activeProdi = localStorage.getItem('superadmin_prodi_id')
        if (activeProdi && activeProdi !== 'all') {
          fetchedData = fetchedData.map(f => {
            const prodis = f.ProgramStudi || f.program_studi || []
            const filteredProdis = prodis.filter(p => String(p.id || p.ID) === activeProdi)
            return {
              ...f,
              ProgramStudi: filteredProdis,
              ...(f.program_studi ? { program_studi: filteredProdis } : {})
            }
          }).filter(f => f.ProgramStudi.length > 0)
        }

        setData(fetchedData)
      }
      else toast.error('Gagal memuat sinkronisasi data')
    } catch { toast.error('Koneksi node terputus') } finally { setLoading(false) }
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

  const handleOpenAdd = () => { setIsEditMode(false); setForm({ Nama: '', Kode: '', Email: '', NoHP: '', Dekan: '' }); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => { setIsEditMode(true); setForm({ ID: row.id || row.ID, Nama: row.Nama || '', Kode: row.Kode || '', Email: row.Email || '', NoHP: row.NoHP || '', Dekan: row.Dekan || '' }); setIsCrudOpen(true) }
  
  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const targetId = form.ID || form.id
      const res = targetId ? await adminService.updateFaculty(targetId, form) : await adminService.createFaculty(form)
      if (res.status === 'success') { 
        toast.success(targetId ? 'Data fakultas berhasil diperbarui' : 'Registrasi fakultas baru berhasil')
        setIsCrudOpen(false)
        fetchData() 
      } else {
        toast.error(res.message || 'Gagal menyimpan konfigurasi')
      }
    } catch { toast.error('Terjadi kegagalan operasional internal') } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteFaculty(selected.id || selected.ID)
      toast.success('Entitas fakultas berhasil dihapus')
      setIsDelOpen(false)
      fetchData()
    } catch { toast.error('Gagal menghapus entitas data') } finally { setIsSubmitting(false) }
  }

  const columns = [
    { 
      key: 'Kode', 
      label: 'Kode Unit', 
      className: 'w-[120px]', 
      render: v => <Badge variant="outline" className="font-bold text-neutral-400 font-jakarta uppercase text-[9px] tracking-[0.2em] border-neutral-100 bg-neutral-50 px-2.5 py-1 rounded-lg">{v || '—'}</Badge> 
    },
    { 
      key: 'Nama', 
      label: 'Nama Fakultas', 
      className: 'min-w-[260px]', 
      render: v => <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px]">{v || '—'}</span> 
    },
    { 
      key: 'Dekan', 
      label: 'Pimpinan / Dekan', 
      className: 'w-[220px]', 
      render: v => <span className="text-[12px] font-bold text-neutral-600 font-inter tracking-tight">{v || '—'}</span> 
    },
    { 
      key: 'Email', 
      label: 'Kontak Resmi', 
      className: 'w-[200px]', 
      render: (v, row) => (
        <div className="flex flex-col leading-tight gap-1.5">
          <div className="flex items-center gap-2 text-neutral-900">
             <div className="size-4 rounded bg-primary/5 flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '10px' }} >mail</span></div>
             <span className="text-[11px] font-bold font-inter lowercase">{v || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
             <div className="size-4 rounded bg-neutral-50 flex items-center justify-center"><Phone size={10} /></div>
             <span className="text-[10px] font-bold tracking-widest">{row.NoHP || '—'}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'JumlahProdi', 
      label: 'Total Prodi', 
      className: 'w-[120px] text-center', 
      cellClassName: 'text-center', 
      render: (v, row) => (
        <div className="flex flex-col items-center gap-1">
           <span className="font-bold text-primary text-[15px] font-jakarta leading-none tabular-nums">{v || row.jumlah_prodi || 0}</span>
           <span className="text-[8px] font-bold text-neutral-300 uppercase tracking-widest">Programs</span>
        </div>
      )
    }
  ]

  // Enriched metrics calculations
  const allProdis = data.flatMap(fac => fac.ProgramStudi || fac.program_studi || [])
  const totalProdi = allProdis.length
  const kapasitasTampung = allProdis.reduce((acc, curr) => acc + (curr.Kapasitas || curr.kapasitas || 0), 0)
  const akreditasiA = allProdis.filter(p => {
    const akr = (p.Akreditasi || p.akreditasi || '').toUpperCase()
    return akr === 'A' || akr === 'UNGGUL'
  }).length

  // Sebaran Jenjang (for Donut Chart)
  const jenjangCounts = {}
  allProdis.forEach(p => {
    const j = p.Jenjang || p.jenjang || 'Lainnya'
    jenjangCounts[j] = (jenjangCounts[j] || 0) + 1
  })
  const jenjangChartData = Object.entries(jenjangCounts).map(([name, value]) => ({ name, value }))

  // Sebaran Akreditasi (for Bar Chart)
  const akreditasiCounts = {}
  allProdis.forEach(p => {
    const a = p.Akreditasi || p.akreditasi || 'Belum Terakreditasi'
    akreditasiCounts[a] = (akreditasiCounts[a] || 0) + 1
  })
  const akreditasiChartData = Object.entries(akreditasiCounts).map(([name, value]) => ({ name, value }))

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6']

  const kapasitasProdiData = useMemo(() => {
    return allProdis
      .map(p => ({
        name: p.Nama || p.nama || '—',
        kapasitas: p.Kapasitas || p.kapasitas || 0
      }))
      .sort((a, b) => b.kapasitas - a.kapasitas)
  }, [allProdis])

  const maxKapasitas = Math.max(...kapasitasProdiData.map(d => d.kapasitas), 1)

  const extraStats = useMemo(() => {
    // 1. Who - Top Faculty (biggest by prodi count)
    let topFaculty = '—'
    let topFacultyProdiCount = 0
    data.forEach(fac => {
      const prodis = fac.ProgramStudi || fac.program_studi || []
      if (prodis.length > topFacultyProdiCount) {
        topFaculty = fac.Nama || fac.nama || '—'
        topFacultyProdiCount = prodis.length
      }
    })
    
    // Shorten faculty name
    let shortTopFaculty = '—'
    if (topFaculty !== '—') {
      shortTopFaculty = topFaculty
        .replace(/Fakultas\s+/i, '')
        .replace(/Sains\s+dan\s+Teknologi/i, 'Sains & Tek')
        .replace(/Sains\s+&\s+Teknologi/i, 'Sains & Tek')
    }

    // 2. What - Top Jenjang
    const jenjangCounts = {}
    allProdis.forEach(p => {
      const j = p.Jenjang || p.jenjang || 'Lainnya'
      jenjangCounts[j] = (jenjangCounts[j] || 0) + 1
    })
    let topJenjang = '—'
    let topJenjangCount = 0
    Object.entries(jenjangCounts).forEach(([j, count]) => {
      if (count > topJenjangCount) {
        topJenjang = j
        topJenjangCount = count
      }
    })

    // 3. Why - Rasio Unggul
    const akreditasiA = allProdis.filter(p => {
      const akr = (p.Akreditasi || p.akreditasi || '').toUpperCase()
      return akr === 'A' || akr === 'UNGGUL'
    }).length
    const rasioUnggulPct = allProdis.length > 0 ? Math.round((akreditasiA / allProdis.length) * 100) : 0

    // 4. How - Rata-rata Kapasitas
    const totalKapasitas = allProdis.reduce((acc, curr) => acc + (curr.Kapasitas || curr.kapasitas || 0), 0)
    const rataKapasitas = allProdis.length > 0 ? Math.round(totalKapasitas / allProdis.length) : 0

    return {
      topFaculty: shortTopFaculty,
      topFacultyProdiCount,
      topJenjang,
      topJenjangCount,
      akreditasiA,
      rasioUnggulPct,
      rataKapasitas
    }
  }, [data, allProdis])

  return (
    <PageContent>
      <Toaster position="top-right" />
      
      <DashboardHero
        title="Kelola"
        highlightedTitle="Fakultas"
        subtitle="Manajemen struktur unit kerja dan sinkronisasi data fakultas di lingkungan Universitas Bhakti Kencana."
        icon="business"
        badges={[{ label: 'Administrative Hierarchy', active: false }]}
        actions={
          <>
            <Button 
              onClick={handleSyncPddikti} 
              variant="outline" 
              disabled={isSyncing}
              className="h-11 px-6 rounded-xl border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 gap-2 transition-all active:scale-95 shadow-sm w-full sm:w-auto flex items-center justify-center font-headline"
            >
              {isSyncing ? <span className="material-symbols-outlined animate-spin text-bku-primary" style={{ fontSize: '14px' }} >sync</span> : <RefreshCw size={14} className="text-bku-primary" />}
              {isSyncing ? 'Syncing...' : 'PDDIKTI Sync'}
            </Button>
            
            <Button 
              onClick={handleOpenAdd}
              className="h-11 px-8 rounded-xl bg-slate-900 text-white hover:bg-bku-primary shadow-xl shadow-slate-900/10 gap-3 transition-all active:scale-95 border-none group w-full sm:w-auto flex items-center justify-center font-headline"
            >
              <div className="size-5 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}  strokeWidth={3}>add</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Registrasi Unit</span>
            </Button>
          </>
        }
      />

        {/* ── Enriched Stats Grid ─────────────────────────────────── */}
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Fakultas */}
            <div
              onClick={() => setIsAllFacultiesOpen(true)}
              className="group relative bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 group-hover:-rotate-12 transition-transform duration-500 text-blue-600 pointer-events-none">
                  <Building2 size={80} />
               </div>
               <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="w-12 h-12 bg-blue-50/80 rounded-xl flex justify-center items-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                     <Building2 size={24} />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100">
                    <span className="material-symbols-outlined text-[12px]">verified</span> Active
                  </span>
               </div>
               <div className="relative z-10">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Fakultas</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{data.length}</p>
               </div>
            </div>

            {/* Card 2: Total Prodi */}
            <div
              onClick={() => setIsAllProdiOpen(true)}
              className="group relative bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-500 text-indigo-600 pointer-events-none">
                  <LayoutGrid size={80} />
               </div>
               <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="w-12 h-12 bg-indigo-50/80 rounded-xl flex justify-center items-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                     <LayoutGrid size={24} />
                  </div>
               </div>
               <div className="relative z-10">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Prodi</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{totalProdi}</p>
               </div>
            </div>

            {/* Card 3: Kapasitas Tampung */}
            <div className="group relative bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 overflow-hidden flex flex-col justify-between">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 group-hover:-rotate-12 transition-transform duration-500 text-emerald-600 pointer-events-none">
                  <Group size={80} />
               </div>
               <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="w-12 h-12 bg-emerald-50/80 rounded-xl flex justify-center items-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                     <Group size={24} />
                  </div>
               </div>
               <div className="relative z-10">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kapasitas Tampung</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{kapasitasTampung.toLocaleString('id-ID')} <span className="text-sm font-bold text-slate-400">Mhs</span></p>
               </div>
            </div>

            {/* Card 4: Prodi Unggul/A */}
            <div className="group relative bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200 transition-all duration-300 overflow-hidden flex flex-col justify-between">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-500 text-amber-600 pointer-events-none">
                  <Award size={80} />
               </div>
               <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="w-12 h-12 bg-amber-50/80 rounded-xl flex justify-center items-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                     <Award size={24} />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-[10px] font-bold text-amber-600 border border-amber-100">
                    <span className="material-symbols-outlined text-[12px]">trending_up</span> {extraStats.rasioUnggulPct}%
                  </span>
               </div>
               <div className="relative z-10">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prodi Unggul / A</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{akreditasiA}</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
             <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-cyan-50 rounded-xl flex justify-center items-center text-cyan-600 shrink-0">
                      <span className="material-symbols-outlined text-cyan-600" style={{ fontSize: '20px' }}>corporate_fare</span>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fakultas Terbesar</span>
                </div>
                <div>
                   <p className="text-xl font-black text-slate-800 truncate">{extraStats.topFaculty}</p>
                   <p className="text-xs text-slate-500 font-medium mt-1">{extraStats.topFacultyProdiCount} Program Studi</p>
                </div>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-fuchsia-50 rounded-xl flex justify-center items-center text-fuchsia-600 shrink-0">
                      <span className="material-symbols-outlined text-fuchsia-600" style={{ fontSize: '20px' }}>school</span>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jenjang Terbanyak</span>
                </div>
                <div>
                   <p className="text-xl font-black text-slate-800">{extraStats.topJenjang}</p>
                   <p className="text-xs text-slate-500 font-medium mt-1">{extraStats.topJenjangCount} Program Studi</p>
                </div>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-violet-50 rounded-xl flex justify-center items-center text-violet-600 shrink-0">
                      <span className="material-symbols-outlined text-violet-600" style={{ fontSize: '20px' }}>stars</span>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rasio Unggul</span>
                </div>
                <div>
                   <p className="text-xl font-black text-slate-800">{extraStats.rasioUnggulPct}%</p>
                   <p className="text-xs text-slate-500 font-medium mt-1">{extraStats.akreditasiA} prodi terakreditasi</p>
                </div>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-rose-50 rounded-xl flex justify-center items-center text-rose-600 shrink-0">
                      <span className="material-symbols-outlined text-rose-600" style={{ fontSize: '20px' }}>group_add</span>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rata-rata Kapasitas</span>
                </div>
                <div>
                   <p className="text-xl font-black text-slate-800">{extraStats.rataKapasitas} Mhs</p>
                   <p className="text-xs text-slate-500 font-medium mt-1">Per Program Studi</p>
                </div>
             </div>
          </div>
        </div>

        {/* ── Enriched Visual Charts Grid ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
           {/* Chart 1: Kapasitas Prodi (List) */}
           <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
              <div className="flex flex-col h-full">
                 <div className="flex items-center gap-4 mb-4 shrink-0">
                    <div className="w-12 h-12 bg-blue-50/80 rounded-xl flex justify-center items-center text-blue-600 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                       <span className="material-symbols-outlined text-[24px]">groups</span>
                    </div>
                    <div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Statistik Distribusi</span>
                       <h3 className="text-sm font-bold text-slate-800 leading-tight">Daya Tampung per Prodi</h3>
                    </div>
                 </div>
                 <div className="h-[200px] w-full mt-2 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {kapasitasProdiData.length > 0 ? (
                       kapasitasProdiData.map((item, idx) => {
                          const percentage = Math.round((item.kapasitas / maxKapasitas) * 100);
                          const colors = [
                             { bg: 'bg-blue-500', text: 'text-blue-600', iconBg: 'bg-blue-50 text-blue-600 border-blue-100' },
                             { bg: 'bg-indigo-500', text: 'text-indigo-600', iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                             { bg: 'bg-emerald-500', text: 'text-emerald-600', iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                             { bg: 'bg-amber-500', text: 'text-amber-600', iconBg: 'bg-amber-50 text-amber-600 border-amber-100' },
                             { bg: 'bg-rose-500', text: 'text-rose-600', iconBg: 'bg-rose-50 text-rose-600 border-rose-100' }
                          ];
                          const color = colors[idx % colors.length];

                          return (
                             <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between transition-colors hover:bg-white hover:border-slate-200 hover:shadow-sm cursor-default">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                   <div className="flex items-center gap-3 min-w-0">
                                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border", color.iconBg)}>
                                         <span className="material-symbols-outlined text-base">school</span>
                                      </div>
                                      <div className="text-left min-w-0">
                                         <span className="text-[11px] font-bold text-slate-800 block truncate" title={item.name}>{item.name}</span>
                                      </div>
                                   </div>
                                   <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wide shrink-0 border bg-white shadow-sm", color.text, color.iconBg)}>
                                      {item.kapasitas} Mhs
                                   </span>
                                </div>
                                
                                <div className="space-y-1">
                                   <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                                      <span>Rasio terhadap Tertinggi</span>
                                      <span className={color.text}>{percentage}%</span>
                                   </div>
                                   <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div className={cn("h-full rounded-full transition-all duration-500", color.bg)} style={{ width: `${percentage}%` }} />
                                   </div>
                                </div>
                             </div>
                          )
                       })
                    ) : (
                       <div className="py-8 text-center text-xs text-slate-400 italic">Tidak ada data program studi</div>
                    )}
                 </div>
              </div>
           </div>

           {/* Chart 2: Donut Chart - Distribusi Jenjang */}
           <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
              <div>
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-emerald-50/80 rounded-xl flex justify-center items-center text-emerald-600 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                       <span className="material-symbols-outlined text-[24px]">donut_small</span>
                    </div>
                    <div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Komposisi Pendidikan</span>
                       <h3 className="text-sm font-bold text-slate-800 leading-tight">Sebaran Jenjang Program Studi</h3>
                    </div>
                 </div>
                 <div className="h-[180px] w-full flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={jenjangChartData}
                             cx="50%"
                             cy="50%"
                             innerRadius={50}
                             outerRadius={75}
                             paddingAngle={4}
                             dataKey="value"
                             stroke="none"
                          >
                             {jenjangChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", fontSize: "11px", fontWeight: "bold" }} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                 {jenjangChartData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-md bg-slate-50 border border-slate-100 hover:bg-white transition-colors">
                       <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                       <div className="min-w-0">
                          <p className="text-[9px] font-bold text-slate-400 truncate leading-none">{item.name}</p>
                          <p className="text-sm font-black text-slate-700 leading-none mt-1">{item.value}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Chart 3: Akreditasi Prodi */}
           <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
              <div>
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-50/80 rounded-xl flex justify-center items-center text-indigo-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                       <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                    </div>
                    <div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Kualitas Mutu</span>
                       <h3 className="text-sm font-bold text-slate-800 leading-tight">Sebaran Akreditasi Nasional</h3>
                    </div>
                 </div>
                 <div className="h-[200px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={akreditasiChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <Tooltip
                             cursor={{ fill: '#f8fafc' }}
                             contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", fontSize: "11px", fontWeight: "bold" }}
                          />
                          <Bar dataKey="value" name="Jumlah Prodi" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={24} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="glass-card shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns} 
              data={data} 
              loading={loading}
              searchPlaceholder="Cari nama fakultas atau kode unit..."
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button 
                    onClick={() => {
                      setSelectedFacultyDetails(row)
                      setIsFacultyDetailsOpen(true)
                    }} 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-neutral-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-colors shadow-none"
                    title="Lihat Detail Program Studi"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >visibility</span>
                  </Button>
                  <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors shadow-none"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >edit</span></Button>
                  <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shadow-none"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >delete</span></Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

      {/* ── CRUD Modal ───────────────────────────────────────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          <DialogHeader className="p-5 md:p-8 pb-6 border-b border-neutral-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary"><Building2 size={120} /></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                  {isEditMode ? <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '12px' }}  strokeWidth={3}>add</span>}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Unit Configuration</span>
              </div>
              <DialogTitle className="text-2xl font-bold font-jakarta tracking-tight text-neutral-900">
                {isEditMode ? 'Update Fakultas' : 'Registrasi Unit'}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-neutral-400 italic">Modifikasi identitas dan pimpinan unit fakultas.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-5 md:p-8 pt-6 space-y-5 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Nama Lengkap Fakultas</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Fakultas..." className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Kode Unit</Label>
                <Input required value={form.Kode} onChange={e => setForm({ ...form, Kode: e.target.value })} placeholder="Ex: FSK" className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta uppercase" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Pimpinan Unit (Dekan)</Label>
              <Input value={form.Dekan} onChange={e => setForm({ ...form, Dekan: e.target.value })} placeholder="Lengkap dengan gelar akademik..." className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Email Korespondensi</Label>
                <Input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="fakultas@bku.ac.id" className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Hotline / Telepon</Label>
                <Input value={form.NoHP} onChange={e => setForm({ ...form, NoHP: e.target.value.replace(/\D/g, '') })} placeholder="08..." className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
              </div>
            </div>

            <div className="pt-6 flex flex-col-reverse md:flex-row gap-3 md:gap-4 border-t border-neutral-100">
               <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="flex-1 h-12 md:h-14 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:bg-neutral-50 transition-all">Abort</Button>
               <Button type="submit" disabled={isSubmitting} className="flex-[2] h-12 md:h-14 rounded-xl bg-neutral-900 text-white hover:bg-primary shadow-xl shadow-neutral-900/10 transition-all active:scale-95 border-none flex items-center justify-center gap-3">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >save</span>}
                  <span className="text-[10px] font-bold uppercase tracking-widest">Commit Database</span>
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen} 
        onClose={() => setIsDelOpen(false)} 
        onConfirm={handleDelete}
        title="Destroy Faculty Entity?" 
        description="Aksi ini akan menghapus permanen entitas fakultas dan seluruh relasi program studi di bawahnya. Prosedur ini tidak dapat dibatalkan." 
        loading={isSubmitting} 
      />

      {/* ── Faculty Program Studi Details Modal ────────────────────── */}
      <Dialog open={isFacultyDetailsOpen} onOpenChange={setIsFacultyDetailsOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          <DialogHeader className="p-6 md:p-8 pb-6 border-b border-neutral-100 relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary"><span className="material-symbols-outlined" style={{ fontSize: '120px' }}>school</span></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Fakultas {selectedFacultyDetails?.Kode || selectedFacultyDetails?.kode || ''}</span>
              </div>
              <DialogTitle className="text-xl font-bold font-jakarta tracking-tight text-neutral-900">
                {selectedFacultyDetails?.Nama || selectedFacultyDetails?.nama || 'Detail Fakultas'}
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-neutral-400 italic">
                Daftar Program Studi di bawah naungan Fakultas ini.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-6 md:p-8 max-h-[50vh] overflow-y-auto space-y-4">
            {selectedFacultyDetails?.ProgramStudi?.length > 0 || selectedFacultyDetails?.program_studi?.length > 0 ? (
              <div className="border border-neutral-200 rounded-xl overflow-x-auto shadow-sm bg-white">
                <table className="w-full min-w-[650px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200">
                      <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider w-[60px] whitespace-nowrap">#</th>
                      <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider w-[120px] whitespace-nowrap">Kode</th>
                      <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider w-[100px] text-center whitespace-nowrap">Jenjang</th>
                      <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Nama Program Studi</th>
                      <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Pimpinan / Kaprodi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedFacultyDetails?.ProgramStudi || selectedFacultyDetails?.program_studi || []).map((prodi, idx) => {
                      const jenjangStyle = JENJANG_STYLES[prodi.Jenjang || prodi.jenjang] || JENJANG_STYLES.DEFAULT
                      return (
                        <tr key={prodi.id || prodi.ID || idx} className="border-b border-neutral-100 hover:bg-[#f7faff] transition-colors">
                          <td className="px-5 py-4 text-neutral-400 font-semibold whitespace-nowrap">{idx + 1}</td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <code className="text-[11px] font-bold text-[#3b82f6] tracking-wider bg-blue-50 px-2 py-1 rounded">
                              {prodi.Kode || prodi.kode || '—'}
                            </code>
                          </td>
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-sm", jenjangStyle)}>
                              {prodi.Jenjang || prodi.jenjang || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-neutral-800 text-sm leading-snug whitespace-nowrap">{prodi.Nama || prodi.nama || '—'}</td>
                          <td className="px-5 py-4 font-semibold text-neutral-500 whitespace-nowrap">{prodi.KepalaProdi || prodi.kepala_prodi || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 border border-neutral-100 animate-pulse">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>info</span>
                </div>
                <p className="font-bold text-sm text-neutral-700">Belum Ada Program Studi</p>
                <p className="text-xs text-neutral-400">Fakultas ini belum menaungi program studi apa pun saat ini.</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
            <Button onClick={() => setIsFacultyDetailsOpen(false)} className="h-10 px-6 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-primary transition-all active:scale-95 border-none">Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── All Faculties Dialog ─────────────────────────────────── */}
      <Dialog open={isAllFacultiesOpen} onOpenChange={setIsAllFacultiesOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          <DialogHeader className="p-6 md:p-8 pb-6 border-b border-neutral-100 relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary"><span className="material-symbols-outlined" style={{ fontSize: '120px' }}>business</span></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1 bg-[#00236F] rounded-full" />
                <span className="text-[10px] font-black text-[#00236F] uppercase tracking-[0.2em]">Daftar Unit Kerja</span>
              </div>
              <DialogTitle className="text-xl font-bold font-jakarta tracking-tight text-neutral-900">
                Seluruh Fakultas Universitas Bhakti Kencana
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-neutral-400 italic">
                Daftar semua fakultas yang terdaftar dalam sistem akademik.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-6 md:p-8 max-h-[50vh] overflow-y-auto space-y-4">
            <div className="border border-neutral-200 rounded-xl overflow-x-auto shadow-sm bg-white">
              <table className="w-full min-w-[700px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider w-[60px] whitespace-nowrap">#</th>
                    <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider w-[140px] whitespace-nowrap">Kode Fakultas</th>
                    <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Nama Fakultas</th>
                    <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Pimpinan / Dekan</th>
                    <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider w-[140px] text-center whitespace-nowrap">Jumlah Prodi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((fac, idx) => (
                    <tr key={fac.id || fac.ID || idx} className="border-b border-neutral-100 hover:bg-[#f7faff] transition-colors">
                      <td className="px-5 py-4 text-neutral-400 font-semibold whitespace-nowrap">{idx + 1}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <code className="text-[11px] font-bold text-[#00236F] tracking-widest bg-[#eef4ff] px-2.5 py-1 rounded">
                          {fac.Kode || fac.kode || '—'}
                        </code>
                      </td>
                      <td className="px-5 py-4 font-bold text-neutral-800 text-sm leading-snug whitespace-nowrap">{fac.Nama || fac.nama || '—'}</td>
                      <td className="px-5 py-4 font-semibold text-neutral-500 whitespace-nowrap">{fac.Dekan || fac.dekan || '—'}</td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 rounded-full bg-primary/5 text-primary font-bold text-xs">
                          {fac.JumlahProdi || fac.jumlah_prodi || fac.ProgramStudi?.length || fac.program_studi?.length || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
            <Button onClick={() => setIsAllFacultiesOpen(false)} className="h-10 px-6 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-primary transition-all active:scale-95 border-none">Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── All Program Studies Dialog ───────────────────────────── */}
      <Dialog open={isAllProdiOpen} onOpenChange={setIsAllProdiOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          <DialogHeader className="p-6 md:p-8 pb-6 border-b border-neutral-100 relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary"><span className="material-symbols-outlined" style={{ fontSize: '120px' }}>grid_view</span></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1 bg-indigo-600 rounded-full" />
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Daftar Program Studi</span>
              </div>
              <DialogTitle className="text-xl font-bold font-jakarta tracking-tight text-neutral-900">
                Seluruh Program Studi Universitas Bhakti Kencana
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-neutral-400 italic">
                Daftar lengkap program studi lintas fakultas dalam satu tampilan.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-6 md:p-8 max-h-[50vh] overflow-y-auto space-y-4">
            <div className="border border-neutral-200 rounded-xl overflow-x-auto shadow-sm bg-white">
              <table className="w-full min-w-[650px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider w-[50px] whitespace-nowrap">#</th>
                    <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider w-[120px] whitespace-nowrap">Kode Prodi</th>
                    <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider w-[100px] text-center whitespace-nowrap">Jenjang</th>
                    <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Nama Program Studi</th>
                    <th className="px-5 py-3.5 font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Pimpinan / Kaprodi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.flatMap(fac => 
                    (fac.ProgramStudi || fac.program_studi || []).map(prodi => ({
                      ...prodi,
                      FakultasNama: fac.Nama || fac.nama,
                      FakultasKode: fac.Kode || fac.kode
                    }))
                  ).map((prodi, idx) => {
                    const jenjangStyle = JENJANG_STYLES[prodi.Jenjang || prodi.jenjang] || JENJANG_STYLES.DEFAULT
                    return (
                      <tr key={prodi.id || prodi.ID || idx} className="border-b border-neutral-100 hover:bg-[#f7faff] transition-colors">
                        <td className="px-5 py-4 text-neutral-400 font-semibold whitespace-nowrap">{idx + 1}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <code className="text-[11px] font-bold text-[#3b82f6] tracking-wider bg-blue-50 px-2 py-1 rounded">
                            {prodi.Kode || prodi.kode || '—'}
                          </code>
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-sm", jenjangStyle)}>
                            {prodi.Jenjang || prodi.jenjang || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-neutral-850 text-sm leading-snug whitespace-nowrap">{prodi.Nama || prodi.nama || '—'}</td>
                        <td className="px-5 py-4 font-semibold text-neutral-500 whitespace-nowrap">{prodi.KepalaProdi || prodi.kepala_prodi || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
            <Button onClick={() => setIsAllProdiOpen(false)} className="h-10 px-6 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-primary transition-all active:scale-95 border-none">Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContent>
  )
}

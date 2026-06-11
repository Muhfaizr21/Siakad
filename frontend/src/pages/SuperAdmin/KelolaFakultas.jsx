"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DialogModal, ModalCancelButton, ModalSaveButton } from '@/components/ui/DialogModal'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { PrimaryStatsCard, SecondaryStatsCard } from '@/components/ui/StatsCard'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'

const Phone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>phone</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const Building2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>business</span>;
const LayoutGrid = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>grid_view</span>;
const Group = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>award_star</span>;
const CorporateFare = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>corporate_fare</span>;
const School = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const Stars = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>stars</span>;
const GroupAdd = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group_add</span>;



const JENJANG_STYLES = {
  S1: 'bg-[var(--theme-info-light)] text-[var(--theme-info)] border border-[var(--theme-info)]/10',
  S2: 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border border-[var(--theme-primary)]/10',
  S3: 'bg-[var(--theme-secondary-light)] text-[var(--theme-secondary)] border border-[var(--theme-secondary)]/10',
  D3: 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border border-[var(--theme-success)]/10',
  D4: 'bg-teal-50 text-teal-700 border border-teal-200/50',
  Profesi: 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border border-[var(--theme-warning)]/10',
  DEFAULT: 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]'
}

export default function KelolaFakultas() {
  const navigate = useNavigate()
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
      render: v => <Badge variant="outline" className="font-semibold text-[var(--theme-text-muted)] font-headline uppercase text-[9px] tracking-[0.2em] border-[var(--theme-border)] bg-[var(--theme-bg)] px-2.5 py-1 rounded-md">{v || '—'}</Badge>
    },
    {
      key: 'Nama',
      label: 'Nama Fakultas',
      className: 'min-w-[260px]',
      render: v => <span className="font-semibold text-[var(--theme-text)] font-headline tracking-tight text-[14px]">{v || '—'}</span>
    },
    {
      key: 'Dekan',
      label: 'Pimpinan / Dekan',
      className: 'w-[220px]',
      render: v => <span className="text-[12px] font-medium text-[var(--theme-text-muted)] font-body tracking-tight">{v || '—'}</span>
    },
    {
      key: 'Email',
      label: 'Kontak Resmi',
      className: 'w-[200px]',
      render: (v, row) => (
        <div className="flex flex-col leading-tight gap-1.5">
          <div className="flex items-center gap-2 text-[var(--theme-text)]">
            <div className="size-4 rounded bg-[var(--theme-primary-light)] flex items-center justify-center text-[var(--theme-primary)]"><span className="material-symbols-outlined" style={{ fontSize: '10px' }} >mail</span></div>
            <span className="text-[11px] font-semibold font-body lowercase">{v || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--theme-text-subtle)]">
            <div className="size-4 rounded bg-[var(--theme-bg)] flex items-center justify-center"><Phone size={10} /></div>
            <span className="text-[10px] font-semibold tracking-widest">{row.NoHP || '—'}</span>
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
          <span className="font-semibold text-[var(--theme-primary)] text-[15px] font-headline leading-none tabular-nums">{v || row.jumlah_prodi || 0}</span>
          <span className="text-[8px] font-semibold text-[var(--theme-text-subtle)] uppercase tracking-wider">Programs</span>
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

  const prodiModalColumns = [
    {
      key: 'index',
      label: '#',
      className: 'w-[60px]',
      render: (_, __, idx) => <span className="text-[var(--theme-text-subtle)] font-semibold">{idx + 1}</span>
    },
    {
      key: 'Kode',
      label: 'Kode',
      className: 'w-[120px]',
      render: (v, row) => (
        <code className="text-[11px] font-semibold text-[var(--theme-info)] tracking-wider bg-[var(--theme-info-light)] px-2 py-1 rounded">
          {v || row.kode || '—'}
        </code>
      )
    },
    {
      key: 'Jenjang',
      label: 'Jenjang',
      className: 'w-[100px] text-center',
      cellClassName: 'text-center',
      render: (v, row) => {
        const val = v || row.jenjang || '—'
        const style = JENJANG_STYLES[val] || JENJANG_STYLES.DEFAULT
        return (
          <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider shadow-sm", style)}>
            {val}
          </span>
        )
      }
    },
    {
      key: 'Nama',
      label: 'Nama Program Studi',
      render: (v, row) => <span className="font-semibold text-[var(--theme-text)] text-sm leading-snug">{v || row.nama || '—'}</span>
    },
    {
      key: 'KepalaProdi',
      label: 'Pimpinan / Kaprodi',
      render: (v, row) => <span className="font-medium text-[var(--theme-text-muted)]">{v || row.kepala_prodi || '—'}</span>
    }
  ]

  const allFacultiesColumns = [
    {
      key: 'index',
      label: '#',
      className: 'w-[60px]',
      render: (_, __, idx) => <span className="text-[var(--theme-text-subtle)] font-semibold">{idx + 1}</span>
    },
    {
      key: 'Kode',
      label: 'Kode Fakultas',
      className: 'w-[140px]',
      render: (v, row) => (
        <code className="text-[11px] font-semibold text-[var(--theme-primary)] tracking-widest bg-[var(--theme-primary-light)] px-2.5 py-1 rounded">
          {v || row.kode || '—'}
        </code>
      )
    },
    {
      key: 'Nama',
      label: 'Nama Fakultas',
      render: (v, row) => <span className="font-semibold text-[var(--theme-text)] text-sm leading-snug">{v || row.nama || '—'}</span>
    },
    {
      key: 'Dekan',
      label: 'Pimpinan / Dekan',
      render: (v, row) => <span className="font-medium text-[var(--theme-text-muted)]">{v || row.dekan || '—'}</span>
    },
    {
      key: 'JumlahProdi',
      label: 'Jumlah Prodi',
      className: 'w-[140px] text-center',
      cellClassName: 'text-center',
      render: (v, row) => (
        <span className="inline-flex px-3 py-1 rounded-full bg-[var(--theme-primary-light)] text-[var(--theme-primary)] font-semibold text-xs">
          {v || row.jumlah_prodi || row.ProgramStudi?.length || row.program_studi?.length || 0}
        </span>
      )
    }
  ]

  const allProdiColumns = [
    {
      key: 'index',
      label: '#',
      className: 'w-[50px]',
      render: (_, __, idx) => <span className="text-[var(--theme-text-subtle)] font-semibold">{idx + 1}</span>
    },
    {
      key: 'Kode',
      label: 'Kode Prodi',
      className: 'w-[120px]',
      render: (v, row) => (
        <code className="text-[11px] font-semibold text-[var(--theme-info)] tracking-wider bg-[var(--theme-info-light)] px-2 py-1 rounded">
          {v || row.kode || '—'}
        </code>
      )
    },
    {
      key: 'Jenjang',
      label: 'Jenjang',
      className: 'w-[100px] text-center',
      cellClassName: 'text-center',
      render: (v, row) => {
        const val = v || row.jenjang || '—'
        const style = JENJANG_STYLES[val] || JENJANG_STYLES.DEFAULT
        return (
          <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider shadow-sm", style)}>
            {val}
          </span>
        )
      }
    },
    {
      key: 'Nama',
      label: 'Nama Program Studi',
      render: (v, row) => <span className="font-semibold text-[var(--theme-text)] text-sm leading-snug">{v || row.nama || '—'}</span>
    },
    {
      key: 'FakultasNama',
      label: 'Fakultas',
      render: (v, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--theme-text)] text-[11px]">{v || '—'}</span>
          <span className="text-[9px] font-semibold tracking-wider text-[var(--theme-primary)]">{row.FakultasKode || '—'}</span>
        </div>
      )
    },
    {
      key: 'KepalaProdi',
      label: 'Pimpinan / Kaprodi',
      render: (v, row) => <span className="font-medium text-[var(--theme-text-muted)]">{v || row.kepala_prodi || '—'}</span>
    }
  ]

  const flattenedProdiData = useMemo(() => {
    return data.flatMap(fac =>
      (fac.ProgramStudi || fac.program_studi || []).map(prodi => ({
        ...prodi,
        FakultasNama: fac.Nama || fac.nama,
        FakultasKode: fac.Kode || fac.kode
      }))
    )
  }, [data])

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
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }} strokeWidth={3}>add</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Registrasi Unit</span>
            </Button>
          </>
        }
      />

      {/* ── Enriched Stats Grid ─────────────────────────────────── */}
      <div className="space-y-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <PrimaryStatsCard
            title="Total Fakultas"
            value={data.length}
            icon={Building2}
            colorTheme="info"
            badgeText="Active"
            badgeIcon={<span className="material-symbols-outlined text-[12px]">verified</span>}
            onClick={() => setIsAllFacultiesOpen(true)}
          />

          <PrimaryStatsCard
            title="Total Prodi"
            value={totalProdi}
            icon={LayoutGrid}
            colorTheme="primary"
            onClick={() => setIsAllProdiOpen(true)}
          />

          <PrimaryStatsCard
            title="Kapasitas Tampung"
            value={<>{kapasitasTampung.toLocaleString('id-ID')} <span className="text-sm font-bold text-slate-400">Mhs</span></>}
            icon={Group}
            colorTheme="success"
          />

          <PrimaryStatsCard
            title="Prodi Unggul / A"
            value={akreditasiA}
            icon={Award}
            colorTheme="warning"
            badgeText={`${extraStats.rasioUnggulPct}%`}
            badgeIcon={<span className="material-symbols-outlined text-[12px]">trending_up</span>}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SecondaryStatsCard
            title="Fakultas Terbesar"
            value={extraStats.topFaculty}
            subtitle={`${extraStats.topFacultyProdiCount} Program Studi`}
            icon={CorporateFare}
            colorTheme="info"
          />

          <SecondaryStatsCard
            title="Jenjang Terbanyak"
            value={extraStats.topJenjang}
            subtitle={`${extraStats.topJenjangCount} Program Studi`}
            icon={School}
            colorTheme="primary"
          />

          <SecondaryStatsCard
            title="Rasio Unggul"
            value={`${extraStats.rasioUnggulPct}%`}
            subtitle={`${extraStats.akreditasiA} prodi terakreditasi`}
            icon={Stars}
            colorTheme="primary"
          />

          <SecondaryStatsCard
            title="Rata-rata Kapasitas"
            value={`${extraStats.rataKapasitas} Mhs`}
            subtitle="Per Program Studi"
            icon={GroupAdd}
            colorTheme="error"
          />
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
                  onClick={() => navigate(`/admin/prodi?fakultas=${row.id || row.ID}`)}
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

      <DialogModal
        open={isCrudOpen}
        onOpenChange={setIsCrudOpen}
        icon={isEditMode ? "edit" : "add"}
        subtitle="Unit Configuration"
        title={isEditMode ? 'Update Fakultas' : 'Registrasi Unit'}
        maxWidth="max-w-lg"
        footer={
          <>
            <ModalCancelButton onClick={() => setIsCrudOpen(false)} />
            <ModalSaveButton onClick={handleSave} loading={isSubmitting}>
              {isEditMode ? 'Update' : 'Simpan Perubahan'}
            </ModalSaveButton>
          </>
        }
      >
        <form id="fakultas-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider ml-1">Nama Lengkap Fakultas</Label>
              <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Fakultas..." className="h-10 rounded-xl border-[var(--theme-border)] bg-white text-[var(--theme-text)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] text-sm font-body" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider ml-1">Kode Unit</Label>
              <Input required value={form.Kode} onChange={e => setForm({ ...form, Kode: e.target.value })} placeholder="Ex: FSK" className="h-10 rounded-xl border-[var(--theme-border)] bg-white text-[var(--theme-text)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] text-sm font-body uppercase" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider ml-1">Pimpinan Unit (Dekan)</Label>
            <Input value={form.Dekan} onChange={e => setForm({ ...form, Dekan: e.target.value })} placeholder="Lengkap dengan gelar akademik..." className="h-10 rounded-xl border-[var(--theme-border)] bg-white text-[var(--theme-text)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] text-sm font-body" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider ml-1">Email Korespondensi</Label>
              <Input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="fakultas@bku.ac.id" className="h-10 rounded-xl border-[var(--theme-border)] bg-white text-[var(--theme-text)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] text-sm font-body" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider ml-1">Hotline / Telepon</Label>
              <Input value={form.NoHP} onChange={e => setForm({ ...form, NoHP: e.target.value.replace(/\D/g, '') })} placeholder="08..." className="h-10 rounded-xl border-[var(--theme-border)] bg-white text-[var(--theme-text)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] text-sm font-body" />
            </div>
          </div>
        </form>
      </DialogModal>

      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Destroy Faculty Entity?"
        description="Aksi ini akan menghapus permanen entitas fakultas dan seluruh relasi program studi di bawahnya. Prosedur ini tidak dapat dibatalkan."
        loading={isSubmitting}
      />

      <DialogModal
        open={isAllFacultiesOpen}
        onOpenChange={setIsAllFacultiesOpen}
        icon="business"
        subtitle="Daftar Unit Kerja"
        title="Seluruh Fakultas Universitas Bhakti Kencana"
        maxWidth="max-w-4xl"
        footer={
          <ModalCancelButton onClick={() => setIsAllFacultiesOpen(false)}>Tutup</ModalCancelButton>
        }
      >
        <div className="bg-white rounded-xl shadow-sm border border-[var(--theme-border)] overflow-hidden">
          <DataTable
            data={data}
            columns={allFacultiesColumns}
            searchable={true}
            searchPlaceholder="Cari unit kerja / fakultas..."
            loading={loading}
          />
        </div>
      </DialogModal>

      <DialogModal
        open={isAllProdiOpen}
        onOpenChange={setIsAllProdiOpen}
        icon="grid_view"
        subtitle="Daftar Program Studi"
        title="Seluruh Program Studi Universitas Bhakti Kencana"
        maxWidth="max-w-3xl"
        footer={
          <ModalCancelButton onClick={() => setIsAllProdiOpen(false)}>Tutup</ModalCancelButton>
        }
      >
        <div className="bg-white rounded-xl shadow-sm border border-[var(--theme-border)] overflow-hidden">
          <DataTable
            data={flattenedProdiData}
            columns={allProdiColumns}
            searchable={true}
            searchPlaceholder="Cari program studi atau prodi..."
            loading={loading}
          />
        </div>
      </DialogModal>
    </PageContent>
  )
}

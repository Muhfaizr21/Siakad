"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService, API_BASE_URL } from '../../services/api'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'

import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { toast, Toaster } from 'react-hot-toast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { DataTable } from '@/components/ui/DataTable'
import { Eye } from 'lucide-react'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Filter = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>filter_alt</span>;
const Database = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>storage</span>;
const ChevronRight = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chevron_right</span>;

const getCleanImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const baseUrl = API_BASE_URL.replace('/api', '')
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

const getShortFacultyName = (name) => {
  if (!name || name === 'Tidak ada data' || name === '—' || name === 'Institusional') return '—'
  return name
    .replace(/Fakultas\s+/i, '')
    .replace(/Sains\s+dan\s+Teknologi/i, 'Sains & Tek')
    .replace(/Sains\s+&\s+Teknologi/i, 'Sains & Tek')
}

function StudentAvatar({ src, name, className = "w-9 h-9 rounded-xl" }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const hasNoImage = !src || src.trim() === "" || src.endsWith("/profiles/") || src.endsWith("/students/") || src.endsWith("localhost:8000") || src.endsWith("localhost:8000/");

  return (
    <div className={cn("relative bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200/40 shadow-inner overflow-hidden", className)}>
      {(!loaded || error || hasNoImage) && (
        <span className="material-symbols-outlined text-slate-400/80 block select-none leading-none absolute" style={{ fontSize: className.includes('w-14') ? '28px' : '20px' }}>
          person
        </span>
      )}
      {!hasNoImage && !error && (
        <img
          src={src}
          alt={name}
          className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-200", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

const normalizeAspiration = (asp = {}) => {
  const mahasiswa = asp.Mahasiswa || asp.mahasiswa || {}
  const fakultas = asp.Fakultas || asp.fakultas || mahasiswa.Fakultas || mahasiswa.fakultas || {}
  const id = asp.ID ?? asp.id ?? ''

  return {
    ...asp,
    ID: id,
    Judul: asp.Judul ?? asp.judul ?? asp.Subjek ?? asp.subjek ?? '',
    Subjek: asp.Subjek ?? asp.subjek ?? asp.Judul ?? asp.judul ?? '',
    Isi: asp.Isi ?? asp.isi ?? '',
    Kategori: asp.Kategori ?? asp.kategori ?? 'General',
    Priority: asp.Priority ?? asp.Prioritas ?? asp.prioritas ?? 'NORMAL',
    Deadline: asp.Deadline ?? asp.deadline ?? null,
    Status: asp.Status ?? asp.status ?? 'OPEN',
    Respon: asp.Respon ?? asp.respon ?? '',
    CreatedAt: asp.CreatedAt ?? asp.created_at ?? new Date(),
    BuktiURL: asp.BuktiURL ?? asp.bukti_url ?? asp.FotoURL ?? asp.foto_url ?? asp.lampiran_url ?? asp.LampiranURL ?? '',
    Mahasiswa: {
      ...mahasiswa,
      Nama: mahasiswa.Nama ?? mahasiswa.nama ?? 'System Identity',
      NIM: mahasiswa.NIM ?? mahasiswa.nim ?? '-',
      Fakultas: {
        ...fakultas,
        Nama: fakultas.Nama ?? fakultas.nama ?? 'Institusional',
      },
      Foto: getCleanImageUrl(mahasiswa.foto_url || mahasiswa.FotoURL || mahasiswa.foto || mahasiswa.Foto || null)
    },
    Fakultas: {
      ...fakultas,
      Nama: fakultas.Nama ?? fakultas.nama ?? 'Institusional',
    },
  }
}

const AspirationControl = () => {
  const [aspirations, setAspirations] = useState([])
  const [stats, setStats] = useState({ active: 0, overdue: 0, resolved: 0 })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ status: '', respon: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [faculties, setFaculties] = useState([])
  const [periods, setPeriods] = useState([])

  const activeFacultyId = localStorage.getItem('superadmin_fakultas_id') || 'all'
  const activeProdiId = localStorage.getItem('superadmin_prodi_id') || 'all'
  const activePeriodId = localStorage.getItem('superadmin_period_id') || 'all'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [aspRes, statsRes, facRes, periodRes] = await Promise.all([
        adminService.getGlobalAspirations(),
        adminService.getStats(),
        adminService.getAllFaculties(),
        adminService.getAllAcademicPeriods()
      ])

      if (aspRes.status === 'success') {
        setAspirations((aspRes.data || []).map(normalizeAspiration))
      }
      if (statsRes.status === 'success') {
        setStats({
          active: statsRes.data.aspirasi_aktif || 0,
          overdue: statsRes.data.sla_overdue || 0,
          resolved: statsRes.data.resolved_today || 0
        })
      }
      if (facRes && facRes.status === 'success') {
        setFaculties(facRes.data || [])
      }
      if (periodRes && periodRes.status === 'success') {
        setPeriods(periodRes.data || [])
      }
    } catch (error) {
      toast.error('Gagal memuat pusat aspirasi global')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAudit = (asp) => {
    setSelected(asp)
    setForm({
      status: asp.Status || 'proses',
      respon: asp.Respon || ''
    })
  }

  const handleSubmitResolution = async (e) => {
    if (e) e.preventDefault()
    if (!form.status || !form.respon) {
      toast.error('Status dan Tanggapan harus diisi')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await adminService.updateAspirationStatus(selected.ID, form)
      if (res.status === 'success') {
        toast.success('Resolusi aspirasi berhasil diperbarui')
        setSelected(null)
        loadData()
      } else {
        toast.error(res.message || 'Gagal memperbarui status')
      }
    } catch {
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  const viewableAspirations = useMemo(() => {
    const allowedStatuses = ['disetujui fakultas', 'selesai', 'proses', 'ditinjau', 'ditolak'];
    return aspirations.filter(asp => allowedStatuses.includes((asp.Status || '').toLowerCase()))
  }, [aspirations])

  const computedStats = useMemo(() => {
    const active = viewableAspirations.filter(a => ['proses', 'disetujui fakultas', 'ditinjau'].includes((a.Status || '').toLowerCase())).length
    const resolved = viewableAspirations.filter(a => (a.Status || '').toLowerCase() === 'selesai').length
    const total = viewableAspirations.length
    const overdue = viewableAspirations.filter(a => {
      if (!a.Deadline) return false
      const isPast = new Date(a.Deadline) < new Date()
      const isPending = !['selesai', 'ditolak'].includes((a.Status || '').toLowerCase())
      return isPast && isPending
    }).length

    return { active, overdue, resolved, total }
  }, [viewableAspirations])

  const baseFilteredAspirations = viewableAspirations.filter(asp => {
    // Filter by Faculty Context
    if (activeFacultyId !== 'all') {
      const activeFaculty = faculties.find(f => String(f.id || f.ID) === String(activeFacultyId))
      const targetFacultyName = activeFaculty ? (activeFaculty.nama || activeFaculty.Nama || '').toLowerCase() : ''
      const facultyName = (asp.Fakultas?.Nama || asp.Mahasiswa?.Fakultas?.Nama || '').toLowerCase();
      if (facultyName !== targetFacultyName) return false;
    }

    // Filter by Prodi Context
    if (activeProdiId !== 'all') {
      const prodiId = asp.Mahasiswa?.ProgramStudiID || asp.Mahasiswa?.program_studi_id || '';
      if (String(prodiId) !== String(activeProdiId)) return false;
    }

    // Filter by Period Context
    if (activePeriodId !== 'all') {
      const selectedPeriod = periods.find(p => String(p.id || p.ID) === String(activePeriodId))
      if (selectedPeriod) {
        let year = 0;
        const match = selectedPeriod.AcademicYear?.match(/\d+/);
        if (match) year = parseInt(match[0]);
        if (year > 0) {
          const entryYear = asp.Mahasiswa?.TahunMasuk || asp.Mahasiswa?.tahun_masuk || 0;
          if (entryYear !== year) return false;
        }
      }
    }

    return true;
  }).map(asp => ({
    ...asp,
    FakultasNama: asp.Fakultas?.Nama || asp.Mahasiswa?.Fakultas?.Nama || '',
    StatusLower: (asp.Status || '').toLowerCase()
  }));

  // Priority mapping for UI
  const priorityStyles = {
    'CRITICAL': 'bg-rose-500 text-white shadow-lg shadow-rose-100',
    'HIGH': 'bg-amber-500 text-white shadow-lg shadow-amber-100',
    'NORMAL': 'bg-primary text-white shadow-lg shadow-primary/20',
    'LOW': 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
  }

  // ── Derived Chart Data ─────────────────────────────────────────────
  const statusDonutData = useMemo(() => {
    const counts = { proses: 0, selesai: 0, ditolak: 0, ditinjau: 0, 'disetujui fakultas': 0 }
    viewableAspirations.forEach(a => {
      const s = (a.Status || '').toLowerCase()
      if (counts[s] !== undefined) counts[s]++
    })
    return [
      { name: 'Diproses', value: counts['proses'], color: '#3b82f6' },
      { name: 'Selesai', value: counts['selesai'], color: '#10b981' },
      { name: 'Ditolak', value: counts['ditolak'], color: '#ef4444' },
      { name: 'Ditinjau', value: counts['ditinjau'], color: '#f59e0b' },
      { name: 'Acc Fakultas', value: counts['disetujui fakultas'], color: '#8b5cf6' },
    ].filter(d => d.value > 0)
  }, [viewableAspirations])

  const priorityBarData = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, NORMAL: 0, LOW: 0 }
    viewableAspirations.forEach(a => { const p = (a.Priority || 'NORMAL').toUpperCase(); if (counts[p] !== undefined) counts[p]++ })
    return [
      { name: 'Critical', value: counts.CRITICAL, fill: '#ef4444' },
      { name: 'High', value: counts.HIGH, fill: '#f59e0b' },
      { name: 'Normal', value: counts.NORMAL, fill: '#3b82f6' },
      { name: 'Low', value: counts.LOW, fill: '#10b981' },
    ]
  }, [viewableAspirations])

  const facultyTrendData = useMemo(() => {
    const map = {}
    viewableAspirations.forEach(a => {
      const fac = a.Fakultas?.Nama || a.Mahasiswa?.Fakultas?.Nama || 'Lainnya'
      const shortFac = fac.replace('Fakultas ', 'F. ').substring(0, 14)
      map[shortFac] = (map[shortFac] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0,5)
  }, [viewableAspirations])

  const extraStats = useMemo(() => {
    // 1. Who - Top Faculty
    const facultyCounts = {}
    viewableAspirations.forEach(a => {
      const fac = a.Fakultas?.Nama || a.Mahasiswa?.Fakultas?.Nama || 'Lainnya'
      if (fac !== 'Lainnya' && fac !== 'Institusional') {
        facultyCounts[fac] = (facultyCounts[fac] || 0) + 1
      }
    })
    let topFaculty = '—'
    let topFacultyCount = 0
    Object.entries(facultyCounts).forEach(([fac, count]) => {
      if (count > topFacultyCount) {
        topFaculty = fac
        topFacultyCount = count
      }
    })

    // 2. What - Top Category
    const categoryCounts = {}
    viewableAspirations.forEach(a => {
      const cat = a.Kategori || 'Umum'
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })
    let topCategory = '—'
    let topCategoryCount = 0
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > topCategoryCount) {
        topCategory = cat
        topCategoryCount = count
      }
    })

    // 3. Where/Why - Dominant Urgency
    const priorityCounts = {}
    viewableAspirations.forEach(a => {
      const prio = a.Priority || 'NORMAL'
      priorityCounts[prio] = (priorityCounts[prio] || 0) + 1
    })
    let topPriority = '—'
    let topPriorityCount = 0
    Object.entries(priorityCounts).forEach(([prio, count]) => {
      if (count > topPriorityCount) {
        topPriority = prio
        topPriorityCount = count
      }
    })
    const topPriorityPct = viewableAspirations.length > 0 ? Math.round((topPriorityCount / viewableAspirations.length) * 100) : 0

    // 4. When - Top Month/Day
    const monthCounts = {}
    viewableAspirations.forEach(a => {
      try {
        const date = new Date(a.CreatedAt)
        const monthYear = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' })
        monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1
      } catch (e) {}
    })
    let topMonth = '—'
    let topMonthCount = 0
    Object.entries(monthCounts).forEach(([m, count]) => {
      if (count > topMonthCount) {
        topMonth = m
        topMonthCount = count
      }
    })

    return {
      topFaculty,
      topFacultyCount,
      topCategory,
      topCategoryCount,
      topPriority,
      topPriorityCount,
      topPriorityPct,
      topMonth,
      topMonthCount
    }
  }, [viewableAspirations])

  const CustomDonutLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    if (percent < 0.05) return null
    const RADIAN = Math.PI / 180
    const radius = outerRadius + 28
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="#64748b" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight="700" fontFamily="monospace">
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    )
  }

  return (
    <PageContent>
      <Toaster position="top-right" />
      
      <DashboardHero
        title="Global"
        highlightedTitle="Aspiration Hub"
        subtitle="Pusat monitoring dan resolusi aspirasi mahasiswa lintas fakultas. Pastikan setiap suara mahasiswa mendapatkan penanganan sesuai SLA."
        icon="forum"
        badges={[{ label: 'Incident Management', active: false }]}
        actions={
          <Button 
            variant="outline"
            onClick={loadData}
            className="h-11 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 hover:text-bku-primary gap-2.5 transition-all active:scale-95 shadow-none cursor-pointer font-headline"
          >
            <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }}>show_chart</span>
            Live Refresh
          </Button>
        }
      />

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center text-bku-primary flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-widest">Active Tickets</span>
                </div>
                <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{computedStats.active}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Aspirasi menunggu respons</p>
             </div>

             <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 bg-rose-50 rounded-xl flex justify-center items-center text-rose-500 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-widest">SLA Overdue</span>
                </div>
                <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{computedStats.overdue}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Melewati batas waktu SLA</p>
             </div>

             <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 bg-emerald-50 rounded-xl flex justify-center items-center text-emerald-500 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-widest">Resolved Today</span>
                </div>
                <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{computedStats.resolved}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Ditangani hari ini</p>
             </div>

             <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 bg-slate-100 rounded-xl flex justify-center items-center text-slate-600 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storage</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-widest">Total Aspirasi</span>
                </div>
                <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{computedStats.total}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Seluruh aspirasi masuk</p>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none bg-white">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 bg-blue-50 rounded-xl flex justify-center items-center text-blue-600 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-widest">Fakultas Teraktif</span>
                </div>
                <p className="text-lg font-black text-slate-800 font-headline leading-none truncate">{getShortFacultyName(extraStats.topFaculty)}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">{extraStats.topFacultyCount} aspirasi masuk</p>
             </div>

             <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none bg-white">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 bg-emerald-50 rounded-xl flex justify-center items-center text-emerald-500 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-widest">Kategori Terbanyak</span>
                </div>
                <p className="text-lg font-black text-slate-800 font-headline leading-none truncate">{extraStats.topCategory}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">{extraStats.topCategoryCount} pengajuan</p>
             </div>

             <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none bg-white">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 bg-indigo-50 rounded-xl flex justify-center items-center text-indigo-600 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error_outline</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-widest">Urgensi Dominan</span>
                </div>
                <p className="text-lg font-black text-slate-800 font-headline leading-none truncate">{extraStats.topPriority}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">{extraStats.topPriorityPct}% dari total aspirasi</p>
             </div>

             <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none bg-white">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 bg-amber-50 rounded-xl flex justify-center items-center text-amber-500 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-widest">Periode Teraktif</span>
                </div>
                <p className="text-lg font-black text-slate-800 font-headline leading-none truncate">{extraStats.topMonth}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">{extraStats.topMonthCount} tiket terkumpul</p>
             </div>
          </div>
        </div>

        {/* ── Analytics Charts ─────────────────────────────────────── */}
        {!loading && aspirations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donut – Status Distribution */}
            <div className="glass-card rounded-2xl border border-slate-200/60 p-6 shadow-none flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-bku-primary/10 rounded-lg flex items-center justify-center text-bku-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>donut_large</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Distribusi Status</p>
                  <p className="text-xs font-bold text-slate-700 font-headline">Komposisi Aspirasi</p>
                </div>
              </div>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusDonutData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                    >
                      {statusDonutData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: '11px', fontWeight: '700' }}
                      formatter={(val, name) => [val + ' ticket', name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {statusDonutData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] font-bold text-slate-500 truncate">{d.name}</span>
                    <span className="text-[10px] font-black text-slate-700 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar – Priority Breakdown */}
            <div className="glass-card rounded-2xl border border-slate-200/60 p-6 shadow-none flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bar_chart</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Level Prioritas</p>
                  <p className="text-xs font-bold text-slate-700 font-headline">Urgensi Penanganan</p>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-end gap-3 mt-2">
                {priorityBarData.map((d, i) => {
                  const max = Math.max(...priorityBarData.map(x => x.value), 1)
                  const pct = Math.round((d.value / max) * 100)
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase w-16 flex-shrink-0 font-headline">{d.name}</span>
                      <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                          style={{ width: `${pct}%`, backgroundColor: d.fill, minWidth: d.value > 0 ? '28px' : '0' }}
                        >
                          {d.value > 0 && <span className="text-[9px] font-black text-white">{d.value}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bar – Faculty Distribution */}
            <div className="glass-card rounded-2xl border border-slate-200/60 p-6 shadow-none flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>school</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Top Fakultas</p>
                  <p className="text-xs font-bold text-slate-700 font-headline">Volume Aspirasi</p>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-end gap-3 mt-2">
                {facultyTrendData.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center py-8">Belum ada data</p>
                ) : facultyTrendData.map((d, i) => {
                  const max = Math.max(...facultyTrendData.map(x => x.value), 1)
                  const pct = Math.round((d.value / max) * 100)
                  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase w-20 flex-shrink-0 truncate font-headline">{d.name}</span>
                      <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                          style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length], minWidth: '28px' }}
                        >
                          <span className="text-[9px] font-black text-white">{d.value}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Main Data Table ────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          
          <DataTable
            searchable={true}
            searchPlaceholder="Cari ID, nama, subjek..."
            searchWidth="sm:w-80"
            filters={[
              ...(activeFacultyId === 'all' ? [{
                key: 'FakultasNama',
                placeholder: 'Fakultas',
                options: faculties.map(f => ({ label: f.Nama || f.nama, value: f.Nama || f.nama }))
              }] : []),
              {
                key: 'StatusLower',
                placeholder: 'Status',
                options: [
                  { label: 'On Process', value: 'proses' },
                  { label: 'Resolved', value: 'selesai' },
                  { label: 'Review', value: 'ditinjau' },
                  { label: 'Rejected', value: 'ditolak' },
                  { label: 'Disetujui Fakultas', value: 'disetujui fakultas' }
                ]
              }
            ]}
            onSearch={(data, search) => data.filter(asp => {
              const normalizedSearch = search.toLowerCase();
              const title = asp.Judul?.toString().toLowerCase() || ''
              const studentName = asp.Mahasiswa?.Nama?.toString().toLowerCase() || ''
              const facultyName = asp.Fakultas?.Nama?.toString().toLowerCase() || asp.Mahasiswa?.Fakultas?.Nama?.toString().toLowerCase() || ''
              const ticketId = asp.ID?.toString() || ''
              return title.includes(normalizedSearch) ||
                studentName.includes(normalizedSearch) ||
                facultyName.includes(normalizedSearch) ||
                ticketId.includes(search)
            })}
            data={baseFilteredAspirations}
            loading={loading}
            emptyMessage="No incident tickets found"
            columns={[
              {
                key: 'ID',
                label: 'ID Tiket',
                className: 'w-[140px]',
                render: (_, asp) => (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-blue-600 bg-blue-50/60 px-2.5 py-1 rounded-lg border border-blue-100/50 font-body w-fit">
                      #ASP-{asp.ID?.toString().padStart(4, '0') || '----'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold font-body flex items-center gap-1">
                      <span className={cn("w-1.5 h-1.5 rounded-full", 
                        asp.Priority === 'CRITICAL' ? 'bg-rose-500' : 
                        asp.Priority === 'HIGH' ? 'bg-amber-500' : 'bg-emerald-500')} />
                      {asp.Priority === 'CRITICAL' ? 'Critical' : asp.Priority === 'HIGH' ? 'High Priority' : 'Normal Priority'}
                    </span>
                  </div>
                )
              },
              {
                key: 'Judul',
                label: 'Subjek Aspirasi',
                className: 'max-w-[280px]',
                render: (_, asp) => (
                  <div className="flex flex-col max-w-[260px]">
                    <span className="text-[13px] font-bold text-slate-800 font-body truncate leading-tight">
                      {asp.Subjek || asp.Judul || 'Tanpa Subjek'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 font-body truncate mt-1">
                      Oleh: <span className="text-slate-600">{asp.Mahasiswa?.Nama || 'Mahasiswa'}</span>
                    </span>
                  </div>
                )
              },
              {
                key: 'Fakultas',
                label: 'Fakultas / Node',
                className: 'max-w-[200px]',
                render: (_, asp) => (
                  <span className="text-[12px] font-semibold text-slate-700 font-body block truncate max-w-[180px]" title={asp.Fakultas?.Nama || asp.Mahasiswa?.Fakultas?.Nama || '—'}>
                    {asp.Fakultas?.Nama || asp.Mahasiswa?.Fakultas?.Nama || '—'}
                  </span>
                )
              },
              {
                key: 'Status',
                label: 'Status Tiket',
                className: 'w-[140px]',
                render: (_, asp) => {
                  const status = (asp.Status || 'Proses').toLowerCase();
                  let style = 'bg-slate-50 text-slate-600 border-slate-200';
                  let label = asp.Status || 'Proses';
                  if (status === 'selesai') style = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                  else if (status.includes('ditolak')) style = 'bg-rose-50 text-rose-600 border-rose-100';
                  else if (status.includes('proses')) style = 'bg-blue-50 text-blue-600 border-blue-100';
                  else if (status.includes('ditinjau')) style = 'bg-amber-50 text-amber-600 border-amber-100';
                  else if (status.includes('disetujui')) style = 'bg-indigo-50 text-indigo-600 border-indigo-100';

                  return (
                    <div className="flex flex-col gap-1.5">
                      <Badge className={cn('px-2.5 py-1 rounded-lg border text-[10px] font-semibold uppercase tracking-wider shadow-none w-fit', style)}>
                        {label}
                      </Badge>
                      {asp.Deadline && (
                        <span className="text-[9px] font-semibold text-slate-400 font-body">
                          Deadline: {new Date(asp.Deadline).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}
                        </span>
                      )}
                    </div>
                  );
                }
              },
              {
                key: 'actions',
                label: 'Aksi',
                className: 'w-[100px] text-center',
                cellClassName: 'text-center',
                render: (_, asp) => (
                  <div className="flex justify-center items-center gap-1">
                    <button 
                      onClick={() => { setSelected(asp); handleOpenAudit(asp); }}
                      title="Lihat Detail"
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors inline-flex items-center justify-center cursor-pointer"
                    >
                      <Eye className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                )
              }
            ]}
          />
        </div>

      {/* ── Folder Style Aspiration Audit Modal ───────────────── */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => {
            if (!isSubmitting) setSelected(null);
          }}
        >
          <div
            className="relative w-full max-w-5xl bg-[var(--theme-bg)] rounded-2xl shadow-none border border-[var(--theme-border)] flex flex-col overflow-hidden max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Folder Header */}
            <div className="relative bg-gradient-to-br from-primary via-primary to-blue-700 pt-6 pb-7 px-8 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -bottom-6 right-16 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
              <button
                onClick={() => setSelected(null)}
                disabled={isSubmitting}
                className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 text-white border-none cursor-pointer"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span>
              </button>
              <div className="relative z-10 flex items-center gap-5 mb-5">
                <div className="w-16 h-16 rounded-2xl shadow-xl ring-2 ring-white/20 bg-white/10 flex items-center justify-center shrink-0 overflow-hidden text-white">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>security</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">
                    Incident Audit Manager
                  </p>
                  <h2 className="text-xl font-extrabold font-headline leading-tight truncate text-white">
                    {selected.Judul || selected.Subjek}
                  </h2>
                  <p className="text-xs text-blue-100 font-medium mt-1">
                    Dilaporkan oleh: {selected.Mahasiswa?.Nama || 'Mahasiswa'}
                  </p>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white font-mono tracking-wider">
                  #ASP-{selected.ID?.toString().padStart(4, '0')}
                </span>
                <span className={cn(
                  "flex items-center gap-1.5 border px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider",
                  selected.Status?.toLowerCase() === 'selesai' ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200' :
                  selected.Status?.toLowerCase() === 'proses' ? 'bg-sky-500/20 border-sky-400/30 text-sky-200' :
                  'bg-amber-500/20 border-amber-400/30 text-amber-200'
                )}>
                  Status: {selected.Status || 'OPEN'}
                </span>
              </div>
            </div>

            {/* Folder Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-[var(--theme-bg)]/20">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Reporter Profile, Content Subjek & Attachments */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {/* Reporter Profile Block */}
                  <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-sm flex flex-col md:flex-row gap-5 items-start hover:shadow-md transition-shadow">
                    <StudentAvatar src={selected.Mahasiswa?.Foto} name={selected.Mahasiswa?.Nama} className="w-16 h-16 rounded-2xl shadow-md ring-4 ring-[var(--theme-border-muted)] shrink-0" />
                    
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center justify-between border-b border-[var(--theme-border-muted)] pb-2">
                        <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Identitas Pelapor</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-bold border border-[var(--theme-border)] text-[var(--theme-text-muted)] bg-[var(--theme-bg)] uppercase tracking-wider">Verified Mahasiswa</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs text-[var(--theme-text)]">
                        <div>
                          <p className="text-[9px] font-semibold text-[var(--theme-text-subtle)] uppercase tracking-wider">Nama Lengkap</p>
                          <p className="font-bold truncate mt-0.5">{selected.Mahasiswa?.Nama}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold text-[var(--theme-text-subtle)] uppercase tracking-wider">NIM / Identifier</p>
                          <p className="font-mono font-bold mt-0.5">{selected.Mahasiswa?.NIM}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[9px] font-semibold text-[var(--theme-text-subtle)] uppercase tracking-wider">Fakultas / Node asal</p>
                          <p className="font-bold uppercase flex items-center gap-1.5 mt-1">
                            <span className="material-symbols-outlined text-[14px] text-[var(--theme-primary)]">business</span>
                            {selected.Mahasiswa?.Fakultas?.Nama || 'Institusional'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Substantive Content */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 text-[var(--theme-text-muted)]">
                      <span className="material-symbols-outlined text-[var(--theme-primary)] text-[16px]">chat</span> Substansi Aspirasi
                    </h4>
                    <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <span className="material-symbols-outlined text-[80px]" >chat</span>
                      </div>
                      <p className="text-sm text-[var(--theme-text)] font-medium leading-relaxed font-body relative z-10 whitespace-pre-wrap">
                        "{selected.Isi || 'Tidak ada deskripsi konten.'}"
                      </p>
                    </div>
                  </div>

                  {/* Visual Proof Section */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 text-[var(--theme-text-muted)]">
                      <span className="material-symbols-outlined text-[var(--theme-primary)] text-[16px]">image</span> Bukti Lampiran Visual
                    </h4>
                    
                    {selected.BuktiURL ? (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        <div className="md:col-span-5 relative aspect-video rounded-xl overflow-hidden border border-[var(--theme-border)] shadow-sm group bg-[var(--theme-bg)]">
                          <img 
                            src={getCleanImageUrl(selected.BuktiURL)} 
                            alt="Bukti Aspirasi" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <a 
                              href={getCleanImageUrl(selected.BuktiURL)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-4 py-2 bg-[var(--theme-surface)] text-[var(--theme-text)] rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-1.5 hover:bg-[var(--theme-primary)] hover:text-white transition-all active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[13px]">open_in_new</span> Full View
                            </a>
                          </div>
                        </div>
                        
                        <div className="md:col-span-7 p-5 rounded-xl bg-[var(--theme-surface)] shadow-sm border border-[var(--theme-border)] flex flex-col justify-center gap-2">
                          <p className="text-xs font-bold text-[var(--theme-text)] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[var(--theme-success)]" style={{ fontSize: '16px' }}>check_circle</span>
                            Berkas Lampiran Tersedia
                          </p>
                          <p className="text-[11px] text-[var(--theme-text-muted)] font-medium leading-relaxed">
                            Lampiran pendukung telah disertakan oleh pelapor. Pastikan gambar memuat informasi yang relevan dan dapat dipertanggungjawabkan untuk membantu proses resolusi.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 rounded-xl border border-dashed border-[var(--theme-border-muted)] flex flex-col items-center justify-center gap-3 text-[var(--theme-text-subtle)] bg-[var(--theme-surface)] shadow-sm">
                        <span className="material-symbols-outlined text-[32px] opacity-50" >image</span>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-subtle)]">Tidak ada bukti lampiran gambar</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Column: Governance Panel, Resolution Response Form */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Governance Card */}
                  <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-sm space-y-6">
                    
                    {/* Status Selection Buttons */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider ml-0.5">Ubah Status Resolusi</Label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { val: 'proses', label: 'On Process', icon: 'schedule', active: 'bg-[var(--theme-info)] text-white border-[var(--theme-info)] shadow-md shadow-[var(--theme-info)]/20' },
                          { val: 'Selesai', label: 'Resolved', icon: 'check_circle', active: 'bg-[var(--theme-success)] text-white border-[var(--theme-success)] shadow-md shadow-[var(--theme-success)]/20' },
                          { val: 'Ditinjau', label: 'Review', icon: 'show_chart', active: 'bg-[var(--theme-warning)] text-white border-[var(--theme-warning)] shadow-md shadow-[var(--theme-warning)]/20' },
                          { val: 'Ditolak', label: 'Rejected', icon: 'close', active: 'bg-[var(--theme-error)] text-white border-[var(--theme-error)] shadow-md shadow-[var(--theme-error)]/20' },
                        ].map(s => (
                          <button 
                            key={s.val} 
                            type="button"
                            onClick={() => setForm({ ...form, status: s.val })}
                            className={cn(
                              'h-10 rounded-xl flex items-center justify-center gap-1.5 border border-[var(--theme-border)] bg-[var(--theme-bg)] font-bold uppercase tracking-widest text-[9px] text-[var(--theme-text-muted)] hover:border-[var(--theme-border-muted)] hover:text-[var(--theme-text)] transition-all duration-300 cursor-pointer',
                              form.status?.toLowerCase() === s.val.toLowerCase() && s.active
                            )}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >{s.icon}</span>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Response Textarea */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider ml-0.5">Tanggapan Resmi Institusi</Label>
                      <textarea 
                        value={form.respon}
                        onChange={e => setForm({ ...form, respon: e.target.value })}
                        placeholder="Tuliskan respon resmi, klarifikasi, atau solusi yang diajukan institusi untuk menyelesaikan kendala ini..."
                        className="w-full min-h-[160px] rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg)] p-4 text-xs font-medium font-body text-[var(--theme-text)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:bg-[var(--theme-surface)] outline-none resize-none transition-all placeholder:text-[var(--theme-text-subtle)] leading-relaxed"
                      />
                    </div>

                    {/* Warning SLA Card */}
                    <div className="p-4 rounded-xl bg-[var(--theme-warning-light)] border border-[var(--theme-warning)]/30 flex items-start gap-3 shadow-sm">
                      <span className="material-symbols-outlined text-[var(--theme-warning)] shrink-0" style={{ fontSize: '18px' }} >assignment_late</span>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-[var(--theme-warning)] uppercase tracking-wider">SLA Resolution Limit</p>
                        <p className="text-[10px] text-[var(--theme-warning)]/90 font-semibold leading-normal">
                          Batas penanganan SLA standar adalah <span className="font-bold">3x24 jam</span> sejak tiket dibuat. Harap berikan resolusi secepatnya dan pastikan informasi yang disampaikan akurat.
                        </p>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </div>

            {/* Folder Footer */}
            <div className="px-8 py-5 border-t border-[var(--theme-border)] bg-[var(--theme-surface)] flex justify-end gap-3 flex-shrink-0">
              <button 
                onClick={() => setSelected(null)}
                className="h-10 px-6 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:border-[var(--theme-border-muted)] uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
              >
                Tutup Audit
              </button>
              <button 
                onClick={handleSubmitResolution}
                disabled={isSubmitting}
                className="h-10 px-6 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-bold text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 border-none shadow-md shadow-[var(--theme-primary)]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >save</span>
                )}
                Simpan & Update
              </button>
            </div>
          </div>
        </div>
      )}

    </PageContent>
  )
}

export default AspirationControl

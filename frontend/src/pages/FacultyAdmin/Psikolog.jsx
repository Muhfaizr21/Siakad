"use client"

import React, { useState, useEffect, useMemo } from "react"
import api from "../../lib/axios"
import { Avatar, AvatarFallback } from "@/components/ui/Avatar"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog"

import { API_BASE_URL } from "../../services/api"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const Layers = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>layers</span>;
const Mail = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>mail</span>;
const Phone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>phone</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Briefcase = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>work</span>;
const UserCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>how_to_reg</span>;
const Building2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>business</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;

const getFullUrl = (path) => {
  if (!path || path.trim() === "" || path === "/" || path.endsWith("/profiles/") || path.endsWith("/psychologists/")) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${path}`;
}

function PsikologAvatar({ src, name, className = "w-10 h-10 rounded-full" }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const hasNoImage = !src || src.trim() === "" || src.endsWith("/profiles/") || src.endsWith("/psychologists/") || src.endsWith("localhost:8000") || src.endsWith("localhost:8000/");

  return (
    <div className={cn("relative bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200/40 shadow-inner overflow-hidden", className)}>
      {(!loaded || error || hasNoImage) && (
        <span className="material-symbols-outlined text-slate-400/80 block select-none leading-none absolute" style={{ fontSize: className.includes('w-[60px]') ? '30px' : '22px' }}>
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


const SPESIALISASI_STYLES = {
  'Klinis': { cls: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  'Umum': { cls: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'Pendidikan': { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Perkembangan': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
}

const getSpesialisasiStyle = (sp) => {
  const s = (sp || '').toLowerCase()
  if (s.includes('klinis') && s.includes('pendidikan')) {
    return { cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' }
  }
  if (s.includes('klinis')) {
    return { cls: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' }
  }
  if (s.includes('pendidikan')) {
    return { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' }
  }
  if (s.includes('karir') || s.includes('pengembangan')) {
    return { cls: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' }
  }
  return { cls: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' }
}


const AVATAR_COLORS = [
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-sky-500',
]

const formatIDR = (num) => {
  if (num === undefined || num === null) return '—'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)
}

export default function PsikologPage() {
  const [psychologists, setPsychologists] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPsikolog, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterSpesialisasi, setFilterSpesialisasi] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: 'Nama', direction: 'asc' })

  const [activeTab, setActiveTab] = useState('profile')
  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [distribusiSpes, setDistribusiSpes] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState([])

  const fetchBookingsForPsikolog = async (psikologId) => {
    setLoadingBookings(true)
    try {
      const res = await api.get('/faculty/counseling')
      const allBookings = res?.data?.data || []
      const filteredBookings = allBookings.filter(b => b.psikolog_id === psikologId)
      setBookings(filteredBookings)
    } catch (err) {
      console.error(err)
      toast.error("Gagal memuat riwayat konseling")
    } finally {
      setLoadingBookings(false)
    }
  }

  const handleSelectPsikolog = (psikolog) => {
    setSelected(psikolog)
    setActiveTab('profile')
    if (psikolog) {
      fetchBookingsForPsikolog(psikolog.ID)
    } else {
      setBookings([])
    }
  }

  const fetchPsychologists = async () => {
    setLoading(true)
    try {
      const res = await api.get('/faculty/psychologists')
      const list = res?.data?.data || []
      setPsychologists(list.map((p, i) => ({
        ID: p.id || p.ID,
        Nama: p.nama || p.Nama || '—',
        Email: p.email || p.Email || '—',
        NoHP: p.no_hp || p.NoHP || '—',
        Spesialisasi: p.spesialisasi || p.Spesialisasi || 'Umum',
        Bio: p.bio || p.Bio || 'Tidak ada bio.',
        Foto: getFullUrl(p.foto_url || p.FotoURL || null),
        Lokasi: p.lokasi || p.Lokasi || '—',
        Bahasa: p.bahasa || p.Bahasa || 'Indonesia',
        IsAktif: p.is_aktif !== false,
        colorIdx: i % AVATAR_COLORS.length,
      })))

      // Process distribusi spesialisasi
      const spesMap = {}
      list.forEach(p => {
        const spes = p.spesialisasi || p.Spesialisasi || 'Umum'
        if (!spesMap[spes]) spesMap[spes] = 0
        spesMap[spes]++
      })
      setDistribusiSpes(Object.entries(spesMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count))
    } catch {
      toast.error("Gagal memuat data psikolog")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPsychologists()
  }, [])

  const spesialisasiList = [...new Set(psychologists.map(p => p.Spesialisasi).filter(Boolean))]

  const filtered = useMemo(() =>
    psychologists.filter(p => {
      const q = search.toLowerCase()
      const matchQ = !q || p.Nama?.toLowerCase().includes(q) || p.Email?.toLowerCase().includes(q) || p.Spesialisasi?.toLowerCase().includes(q)
      const matchS = filterSpesialisasi === 'all' || p.Spesialisasi === filterSpesialisasi
      return matchQ && matchS
    })
    , [psychologists, search, filterSpesialisasi])

  const sorted = useMemo(() => {
    let items = [...filtered]
    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        if (typeof aVal === 'string') aVal = aVal.toLowerCase()
        if (typeof bVal === 'string') bVal = bVal.toLowerCase()

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return items
  }, [filtered, sortConfig])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, currentPage, pageSize])

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / pageSize)

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
    setCurrentPage(1)
  }

  const stats = {
    total: psychologists.length,
    klinis: psychologists.filter(p => p.Spesialisasi?.toLowerCase().includes('klinis')).length,
    umum: psychologists.filter(p => p.Spesialisasi?.toLowerCase().includes('umum')).length,
    aktif: psychologists.filter(p => p.IsAktif).length,
  }

  return (
    <PageContent>
      <Toaster position="top-right" />
        <DashboardHero
          title="Direktori "
          highlightedTitle="Psikolog"
          subtitle="Database tenaga konselor profesional, spesialisasi, dan jadwal aktif penugasan bimbingan psikologi tingkat fakultas."
          icon="psychology"
          badges={[
            { label: 'Student Wellness', active: false },
            { label: `${stats.aktif} Praktisi Aktif`, active: true }
          ]}
          actions={
            <button onClick={fetchPsychologists} disabled={loading}
              className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2">
              {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }}>sync</span> : <span className="material-symbols-outlined text-primary" style={{ fontSize: 13 }}>sync</span>} Refresh Data
            </button>
          }
        />

        {/* ── Stat Cards Row 1 ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Psikolog', value: stats.total, icon: Users, bg: 'bg-[#eef4ff]', color: 'text-primary', desc: 'Konselor terdaftar' },
            { label: 'Spesialisasi Klinis', value: stats.klinis, icon: Briefcase, bg: 'bg-rose-50', color: 'text-rose-600', desc: 'Psikolog Klinis' },
            { label: 'Spesialisasi Umum', value: stats.umum, icon: Award, bg: 'bg-indigo-50', color: 'text-indigo-600', desc: 'Konselor Umum' },
            { label: 'Psikolog Aktif', value: stats.aktif, icon: UserCheck, bg: 'bg-emerald-50', color: 'text-emerald-600', desc: 'Tersedia untuk bimbingan' },
          ].map(s => (
            <div key={s.label} className="glass-card border border-slate-200/60 rounded-2xl p-5 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.bg, s.color)}>
                  <s.icon size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 leading-none tabular-nums">
                {loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span> : s.value}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* NEW: 5W1H Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* WHAT → Distribusi Spesialisasi */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>psychology</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Spesialisasi</h3>
                <p className="text-[10px] text-slate-400">Distribusi bidang ahli</p>
              </div>
            </div>
            <div className="space-y-2">
              {distribusiSpes.map((item, i) => {
                const maxCount = Math.max(...distribusiSpes.map(d => d.count), 1)
                const colors = ['bg-rose-400', 'bg-blue-400', 'bg-amber-400', 'bg-emerald-400', 'bg-violet-400']
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 w-20 truncate">{item.name}</span>
                    <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', colors[i % colors.length])} style={{width:`${(item.count/maxCount)*100}%`}}/>
                    </div>
                    <span className="text-xs font-black text-slate-700 w-6 text-right">{item.count}</span>
                  </div>
                )
              })}
            </div>
          </div>


          {/* WHERE → Lokasi Praktik */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>location_on</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Lokasi Praktik</h3>
                <p className="text-[10px] text-slate-400">Mode layanan tersedia</p>
              </div>
            </div>
            {(() => {
              const online = psychologists.filter(p => (p.Lokasi || '').toLowerCase().includes('online')).length
              const offline = psychologists.filter(p => (p.Lokasi || '').toLowerCase().includes('tatap') || (p.Lokasi || '').toLowerCase().includes('kampus')).length
              const hybrid = psychologists.length - online - offline
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <span className="text-sm font-bold text-blue-700">Online</span>
                    <span className="text-lg font-extrabold text-blue-600">{online}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                    <span className="text-sm font-bold text-emerald-700">Tatap Muka</span>
                    <span className="text-lg font-extrabold text-emerald-600">{offline}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
                    <span className="text-sm font-bold text-violet-700">Hybrid</span>
                    <span className="text-lg font-extrabold text-violet-600">{hybrid}</span>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* WHEN → Aktivitas Booking */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Status Booking</h3>
                <p className="text-[10px] text-slate-400">Kondisi jadwal aktif</p>
              </div>
            </div>
            {(() => {
              const aktif = psychologists.filter(p => p.IsAktif).length
              const nonaktif = psychologists.length - aktif
              return (
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-3xl font-extrabold text-emerald-600">{aktif}</span>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">Aktif</p>
                  </div>
                  <div className="h-12 w-px bg-slate-200"/>
                  <div className="text-center">
                    <span className="text-3xl font-extrabold text-slate-400">{nonaktif}</span>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Nonaktif</p>
                  </div>
                </div>
              )
            })()}
          </div>

          
          {/* HOW → Kontak Cepat */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>contact_phone</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Kontak Cepat</h3>
                <p className="text-[10px] text-slate-400">Info kontak tersedia</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-rose-50 rounded-lg">
                <Mail size={14} className="text-rose-600"/>
                <span className="text-xs font-medium text-slate-600">{psychologists.filter(p => p.Email && p.Email !== '—').length} Email Terdaftar</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                <Phone size={14} className="text-emerald-600"/>
                <span className="text-xs font-medium text-slate-600">{psychologists.filter(p => p.NoHP && p.NoHP !== '—').length} No. HP Terdaftar</span>
              </div>
            </div>
          </div>

          {/* WHO → Prodi/Fakultas Tersebar */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>school</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Cakupan</h3>
                <p className="text-[10px] text-slate-400">Prodi/Fakultas terlayani</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
                <span className="text-sm font-bold text-violet-700">Total Psikolog</span>
                <span className="text-lg font-extrabold text-violet-600">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                <span className="text-sm font-bold text-emerald-700">Aktif & Siap</span>
                <span className="text-lg font-extrabold text-emerald-600">{stats.aktif}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table Card ─────────────────────────────────────────── */}
        <div className="glass-card border border-slate-200/60 rounded-2xl shadow-none overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-black text-sm uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h2)' }}>Daftar Praktisi & Psikolog</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan <span className="font-bold text-slate-900">{filtered.length}</span> dari <span className="font-bold text-primary">{psychologists.length}</span> psikolog
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }} >search</span>
                <input
                  type="text"
                  placeholder="Cari nama, spesialisasi, email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-56 rounded-xl border border-slate-200/60 focus:outline-none focus:border-primary text-sm bg-white"
                />
              </div>
              {/* Filter Spesialisasi */}
              <select
                value={filterSpesialisasi}
                onChange={e => setFilterSpesialisasi(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="all">Semua Spesialisasi</option>
                {spesialisasiList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {/* Reset */}
              {(search || filterSpesialisasi !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setFilterSpesialisasi('all') }}
                  className="h-9 px-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200/60">
                  {[
                    { label: 'No', key: null, sortable: false, className: 'w-[50px]' },
                    { label: 'Identitas Psikolog', key: 'Nama', sortable: true },
                    { label: 'Lokasi & Bahasa', key: 'Lokasi', sortable: true },
                    { label: 'Spesialisasi', key: 'Spesialisasi', sortable: true, className: 'w-[240px] text-center' },

                    { label: 'Aksi', key: null, sortable: false, className: 'text-right w-[100px]' },
                  ].map(h => (
                    <th
                      key={h.label}
                      onClick={() => h.sortable && handleSort(h.key)}
                      className={cn(
                        'px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider select-none',
                        h.sortable && 'cursor-pointer hover:text-slate-900 group',
                        h.className
                      )}
                    >
                      <div className={cn('flex items-center gap-1.5', h.className?.includes('text-center') ? 'justify-center' : '', h.className?.includes('text-right') ? 'justify-end' : '')}>
                        {h.label}
                        {h.sortable && (
                          sortConfig.key === h.key ? (
                            sortConfig.direction === 'asc' ? (
                              <span className="material-symbols-outlined size-3.5 text-primary" style={{ fontSize: '14px' }}>expand_less</span>
                            ) : (
                              <span className="material-symbols-outlined size-3.5 text-primary" style={{ fontSize: '14px' }}>expand_more</span>
                            )
                          ) : (
                            <span className="material-symbols-outlined size-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '14px' }}>unfold_more</span>
                          )
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      {[...Array(5)].map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-slate-50 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined" style={{ fontSize: '22px' }} >psychology</span>
                        </div>
                        <p className="font-bold text-sm text-slate-900">Tidak Ada Data Psikolog</p>
                        <p className="text-xs text-slate-400">Coba ubah filter atau kata kunci pencarian.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {paginated.map((row, i) => {
                      const spStyle = getSpesialisasiStyle(row.Spesialisasi)
                      return (
                        <tr key={row.ID || i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors group">
                          <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3.5">
                              <PsikologAvatar src={row.Foto} name={row.Nama} className="w-10 h-10 rounded-full" />
                              <div>
                                <p className="font-bold text-sm text-slate-900 leading-snug">{row.Nama || '—'}</p>
                                <p className="text-[11px] text-slate-500 font-medium">{row.Email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-sm text-slate-600 font-medium leading-snug">{row.Lokasi || 'Online & Tatap Muka'}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Bahasa: {row.Bahasa}</p>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap',
                              spStyle.cls
                            )}>
                              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', spStyle.dot)} />
                              {row.Spesialisasi}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <button
                               onClick={() => handleSelectPsikolog(row)}
                              className="p-1.5 text-slate-400 hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {paginated.length < pageSize && Array.from({ length: pageSize - paginated.length }).map((_, idx) => (
                      <tr key={`filler-${idx}`} className="border-b border-[#f5f5f5]/30 hover:bg-transparent pointer-events-none select-none">
                        <td className="px-5 py-3.5 opacity-0"><div className="h-10" /></td>
                        <td className="px-5 py-3.5 opacity-0" />
                        <td className="px-5 py-3.5 opacity-0" />
                        <td className="px-5 py-3.5 opacity-0" />
                        <td className="px-5 py-3.5 opacity-0" />
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Modern Pagination Footer */}
          <div className="px-6 py-4 bg-transparent border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
                Menampilkan <span className="font-semibold text-slate-800">{totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> sampai <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, totalItems)}</span> dari <span className="font-semibold text-slate-800">{totalItems}</span> entri
              </p>

              <div className="hidden sm:block h-5 w-px bg-slate-200" />

              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Baris per halaman:</span>
                <Select value={String(pageSize)} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 w-24 rounded-lg border-slate-200 bg-white font-semibold text-xs shadow-sm focus:ring-primary/20 px-2.5 py-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1 font-body">
                    {[5, 10, 15, 25, 50].map((size) => (
                      <SelectItem key={size} value={String(size)} className="rounded-lg text-xs py-1.5 focus:bg-primary/5 focus:text-primary">
                        {size} Baris
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="h-8 px-3 rounded-lg border-slate-200 bg-white text-slate-600 font-semibold text-xs shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined mr-1" style={{ fontSize: '15px' }}>chevron_left</span>
                Sebelumnya
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 3 + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-8 h-8 rounded-lg font-semibold text-xs transition-all duration-200",
                        currentPage === pageNum
                          ? "bg-primary text-white shadow-md shadow-primary/25 scale-105"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading || totalPages === 0}
                className="h-8 px-3 rounded-lg border-slate-200 bg-white text-slate-600 font-semibold text-xs shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-all active:scale-95"
              >
                Berikutnya
                <span className="material-symbols-outlined ml-1" style={{ fontSize: '15px' }}>chevron_right</span>
              </Button>
            </div>
          </div>
        </div>

      {/* ── Detail Modal ──────────────────────────────────────────── */}
      <Dialog open={!!selectedPsikolog} onOpenChange={(open) => !open && handleSelectPsikolog(null)} maxWidth="max-w-2xl">
        <DialogContent className="max-w-2xl p-0 overflow-hidden border border-[var(--theme-border)] shadow-2xl rounded-2xl bg-[var(--theme-surface)] flex flex-col max-h-[90vh]">
          {/* ── Header ── */}
          <DialogHeader className="shrink-0 relative bg-[var(--theme-bg)]/50 p-6 md:p-8 pb-5 border-b border-[var(--theme-border-muted)]">
            {/* Avatar + name */}
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <PsikologAvatar src={selectedPsikolog?.Foto} name={selectedPsikolog?.Nama} className="w-[60px] h-[60px] rounded-2xl shadow-xl ring-2 ring-white/20" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">Praktisi Wellness</p>
                <DialogTitle className="text-lg font-bold font-headline leading-tight truncate text-[var(--theme-text)]">{selectedPsikolog?.Nama}</DialogTitle>
                <DialogDescription className="text-xs text-[var(--theme-text-muted)] font-medium mt-0.5">{selectedPsikolog?.Spesialisasi} Specialist</DialogDescription>
              </div>
            </div>

            {/* Info pills row */}
            <div className="relative z-10 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 bg-[var(--theme-primary-light)] border border-[var(--theme-primary)]/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-[var(--theme-primary)] uppercase tracking-wider">
                <Award size={11} />
                {selectedPsikolog?.Spesialisasi || 'Umum'}
              </span>
              <span className="flex items-center gap-1.5 bg-[var(--theme-info-light)] border border-[var(--theme-info)]/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-[var(--theme-info)] tracking-wider">
                Gratis (Di-cover Kampus)
              </span>
              <span className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border",
                selectedPsikolog?.IsAktif 
                  ? "bg-[var(--theme-success-light)] border-[var(--theme-success)]/20 text-[var(--theme-success)]" 
                  : "bg-[var(--theme-error-light)] border-[var(--theme-error)]/20 text-[var(--theme-error)]"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full bg-current", selectedPsikolog?.IsAktif && "animate-pulse")} />
                {selectedPsikolog?.IsAktif ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="flex border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]/20 px-6 pt-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                "pb-3 pt-2 text-xs font-bold uppercase tracking-wider border-b-2 mr-6 transition-all cursor-pointer",
                activeTab === 'profile'
                  ? "border-[var(--theme-primary)] text-[var(--theme-primary)]"
                  : "border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              )}
            >
              Profil Psikolog
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "pb-3 pt-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer",
                activeTab === 'history'
                  ? "border-[var(--theme-primary)] text-[var(--theme-primary)]"
                  : "border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              )}
            >
              <span className="material-symbols-outlined text-[14px]">history</span>
              Riwayat Mahasiswa Fakultas
              {bookings.length > 0 && (
                <span className="bg-[var(--theme-primary-light)] text-[var(--theme-primary)] px-1.5 py-0.5 rounded-full text-[10px] font-black">
                  {bookings.length}
                </span>
              )}
            </button>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'profile' ? (
              <>
                {/* Bio Section */}
                <div className="p-5 border-b border-[var(--theme-border-muted)]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-md bg-[var(--theme-primary-light)] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[var(--theme-primary)]" style={{ fontSize: '11px' }} >description</span>
                    </div>
                    <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Profil & Biografi</h3>
                  </div>
                  <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed italic bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl p-4">
                    "{selectedPsikolog?.Bio}"
                  </p>
                </div>

                {/* Penugasan Konselor */}
                <div className="p-5 border-b border-[var(--theme-border-muted)]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-md bg-[var(--theme-primary-light)] flex items-center justify-center">
                      <Layers size={11} className="text-[var(--theme-primary)]" />
                    </div>
                    <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Detail Praktik</h3>
                  </div>
                  <div className="space-y-1">
                    <InfoCard
                      icon={Building2}
                      label="Lokasi Praktik"
                      value={selectedPsikolog?.Lokasi}
                      accent="border-l-[var(--theme-info)]"
                    />
                    <InfoCard
                      icon={Briefcase}
                      label="Bahasa yang Dikuasai"
                      value={selectedPsikolog?.Bahasa}
                      accent="border-l-[var(--theme-primary)]"
                    />
                    <InfoCard
                      icon={Award}
                      label="Biaya Konsultasi"
                      value="Gratis (Di-cover Kampus)"
                      accent="border-l-[var(--theme-secondary)]"
                    />
                  </div>
                </div>

                {/* Informasi Kontak */}
                <div className="p-5 border-b border-[var(--theme-border-muted)]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-md bg-[var(--theme-primary-light)] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[var(--theme-primary)]" style={{ fontSize: '11px' }} >mail</span>
                    </div>
                    <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Informasi Kontak</h3>
                  </div>
                  <div className="space-y-1">
                    <InfoCard
                      icon={Mail}
                      label="Email Resmi"
                      value={selectedPsikolog?.Email}
                      accent="border-l-[var(--theme-error)]"
                      mono
                    />
                    <InfoCard
                      icon={Phone}
                      label="No. Handphone"
                      value={selectedPsikolog?.NoHP}
                      accent="border-l-[var(--theme-success)]"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border-muted)]">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--theme-text)]">
                      Catatan Konseling Mahasiswa
                    </h3>
                    <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                      Daftar riwayat bimbingan mahasiswa fakultas Anda dengan {selectedPsikolog?.Nama}
                    </p>
                  </div>
                </div>

                {loadingBookings ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[var(--theme-text-subtle)]" style={{ fontSize: '32px' }} >sync</span>
                    <p className="text-xs text-[var(--theme-text-muted)] font-semibold">Memuat riwayat...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl flex items-center justify-center text-[var(--theme-text-muted)]">
                      <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>history</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[var(--theme-text)]">Belum Ada Riwayat Konseling</p>
                      <p className="text-xs text-[var(--theme-text-muted)] max-w-sm mt-0.5">
                        Tidak ditemukan data riwayat bimbingan untuk mahasiswa dari fakultas Anda dengan psikolog ini.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((b) => {
                      const statusCls =
                        b.status === 'Selesai' ? 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success)]/20' :
                          b.status === 'Disetujui' || b.status === 'Dikonfirmasi' ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border-[var(--theme-primary)]/20' :
                            b.status === 'Menunggu' ? 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning)]/20' :
                              'bg-[var(--theme-error-light)] text-[var(--theme-error)] border-[var(--theme-error)]/20';

                      return (
                        <div key={b.id} className="p-4 bg-[var(--theme-bg)]/50 border border-[var(--theme-border)] rounded-2xl hover:bg-[var(--theme-surface)] hover:border-[var(--theme-border)]/60 transition-all space-y-3">
                          {/* Student Info & Status Row */}
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-sm text-[var(--theme-text)] leading-tight">
                                {b.mahasiswa?.nama || '—'}
                              </p>
                              <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-0.5">
                                {b.mahasiswa?.program_studi?.Nama || b.mahasiswa?.program_studi?.nama || '—'}
                              </p>
                            </div>
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider",
                              statusCls
                            )}>
                              {b.status}
                            </span>
                          </div>

                          {/* Date, Time & Mode */}
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-[var(--theme-text-muted)] bg-[var(--theme-bg)] p-2.5 rounded-xl border border-[var(--theme-border-muted)]">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[15px] text-[var(--theme-text-subtle)]">calendar_today</span>
                              {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[15px] text-[var(--theme-text-subtle)]">schedule</span>
                              {b.jam_mulai} - {b.jam_selesai} WIB
                            </div>
                            <div className="flex items-center gap-1.5 ml-auto">
                              <span className="material-symbols-outlined text-[15px] text-[var(--theme-text-subtle)]">
                                {b.mode === 'Online' ? 'videocam' : 'location_on'}
                              </span>
                              {b.mode || 'Tatap Muka'}
                            </div>
                          </div>

                          {/* Complaint Section */}
                          <div className="space-y-1 bg-[var(--theme-surface)] border border-[var(--theme-border-muted)] p-3 rounded-xl shadow-sm">
                            <div className="flex items-center gap-1.5 text-[var(--theme-text-muted)]">
                              <span className="material-symbols-outlined text-[15px] text-[var(--theme-primary)]">psychology</span>
                              <span className="text-[10px] font-semibold uppercase tracking-wider">Topik: {b.topik || 'Umum'}</span>
                            </div>
                            <p className="text-xs font-semibold text-[var(--theme-text)] mt-1 leading-relaxed">
                              {b.keluhan || 'Tidak ada catatan keluhan.'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-5 py-4 border-t border-[var(--theme-border-muted)] bg-transparent flex gap-3 flex-shrink-0 justify-end">
            <button
              onClick={() => handleSelectPsikolog(null)}
              className="h-10 px-5 rounded-xl border border-[var(--theme-border)] bg-white text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider hover:bg-[var(--theme-bg)] transition-all active:scale-95 cursor-pointer"
            >
              Tutup Detail
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContent>
  )
}

function InfoCard({ icon: Icon, label, value, accent = 'border-l-[var(--theme-border)]', mono = false }) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl bg-[var(--theme-bg)]/50 border border-[var(--theme-border)] border-l-4 hover:bg-[var(--theme-surface)] hover:border-[var(--theme-border)]/60 transition-all',
      accent
    )}>
      <div className="w-7 h-7 bg-[var(--theme-surface)] rounded-lg flex items-center justify-center text-[var(--theme-primary)] shadow-sm border border-[var(--theme-border)] flex-shrink-0">
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-[0.15em] mb-0.5">{label}</p>
        <p className={cn(
          'text-sm font-semibold text-[var(--theme-text)] truncate',
          mono && 'font-mono text-xs tracking-tight',
          (!value || value === '—') && 'text-[var(--theme-text-subtle)] italic text-xs'
        )}>
          {value || 'Belum diisi'}
        </p>
      </div>
    </div>
  )
}

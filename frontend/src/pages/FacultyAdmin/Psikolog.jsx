"use client"

import React, { useState, useEffect, useMemo } from "react"
import api from "../../lib/axios"
import { Avatar, AvatarFallback } from "./components/avatar"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/select"
import { Button } from "./components/button"

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
        Tarif: p.tarif || p.Tarif || 0,
        IsAktif: p.is_aktif !== false,
        colorIdx: i % AVATAR_COLORS.length,
      })))
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
    <div className="min-h-screen bg-[#F8FAFC] font-body">
      <Toaster position="top-right" />
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-6">

        {/* ── Page Header ────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl h-auto md:h-48 flex flex-col md:flex-row items-center group shadow-sm p-6 md:p-8 border border-slate-200/80 bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Student Wellness</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
                Direktori <span className="text-primary">Psikolog</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed">
                Database tenaga konselor profesional, spesialisasi, tarif layanan, dan jadwal aktif penugasan bimbingan psikologi.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchPsychologists}
                disabled={loading}
                className="h-11 px-6 rounded-xl border border-slate-200/60 bg-white text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50/50 gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60"
              >
                <RefreshCw size={14} className={cn("text-primary", loading && "animate-spin")} />
                Refresh Data
              </button>
            </div>
          </div>
        </section>

        {/* ── Stat Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Psikolog', value: stats.total, icon: Users, bg: 'bg-[#eef4ff]', color: 'text-primary', desc: 'Konselor terdaftar' },
            { label: 'Spesialisasi Klinis', value: stats.klinis, icon: Briefcase, bg: 'bg-rose-50', color: 'text-rose-600', desc: 'Psikolog Klinis' },
            { label: 'Spesialisasi Umum', value: stats.umum, icon: Award, bg: 'bg-indigo-50', color: 'text-indigo-600', desc: 'Konselor Umum' },
            { label: 'Psikolog Aktif', value: stats.aktif, icon: UserCheck, bg: 'bg-emerald-50', color: 'text-emerald-600', desc: 'Tersedia untuk bimbingan' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
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

        {/* ── Table Card ─────────────────────────────────────────── */}
        <div className="bg-white border border-slate-100/50 rounded-3xl shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-base text-slate-900">Daftar Praktisi & Psikolog</h2>
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
                    { label: 'Spesialisasi', key: 'Spesialisasi', sortable: true, className: 'w-[180px] text-center' },
                    { label: 'Tarif Sesi', key: 'Tarif', sortable: true, className: 'w-[150px]' },
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
                      {[...Array(6)].map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-slate-50 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
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
                      const spStyle = SPESIALISASI_STYLES[row.Spesialisasi] || SPESIALISASI_STYLES['Umum']
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
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider',
                              spStyle.cls
                            )}>
                              <span className={cn('w-1.5 h-1.5 rounded-full', spStyle.dot)} />
                              {row.Spesialisasi}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold text-slate-700">
                              {formatIDR(row.Tarif)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">per Sesi</span>
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
                        <td className="px-5 py-3.5 opacity-0" />
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Modern Pagination Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────── */}
      {selectedPsikolog && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => handleSelectPsikolog(null)}
          >
            {/* Modal box */}
            <div
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >

              {/* ── Header ── */}
              <div className="relative bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] pt-6 pb-6 px-6 overflow-hidden flex-shrink-0">
                {/* decorative circles */}
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
                <div className="absolute -bottom-6 right-16 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />

                {/* Close */}
                <button
                  onClick={() => handleSelectPsikolog(null)}
                  className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '15px' }} >close</span>
                </button>

                {/* Avatar + name */}
                <div className="relative z-10 flex items-center gap-4 mb-4">
                  <PsikologAvatar src={selectedPsikolog.Foto} name={selectedPsikolog.Nama} className="w-[60px] h-[60px] rounded-2xl shadow-xl ring-2 ring-white/20" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Praktisi Wellness</p>
                    <h2 className="text-lg font-extrabold text-white leading-tight truncate">{selectedPsikolog.Nama}</h2>
                    <p className="text-xs text-blue-200 font-medium mt-0.5">{selectedPsikolog.Spesialisasi} Specialist</p>
                  </div>
                </div>

                {/* Info pills row */}
                <div className="relative z-10 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider">
                    <Award size={11} />
                    {selectedPsikolog.Spesialisasi || 'Umum'}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white/80 tracking-wider">
                    Tarif: {formatIDR(selectedPsikolog.Tarif)}
                  </span>
                  <span className="flex items-center gap-1.5 bg-emerald-400/20 border border-emerald-300/30 px-3 py-1.5 rounded-xl text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {selectedPsikolog.IsAktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 pt-2 flex-shrink-0">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={cn(
                    "pb-3 pt-2 text-xs font-bold uppercase tracking-wider border-b-2 mr-6 transition-all",
                    activeTab === 'profile'
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  Profil Psikolog
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={cn(
                    "pb-3 pt-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5",
                    activeTab === 'history'
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  Riwayat Mahasiswa Fakultas
                  {bookings.length > 0 && (
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px] font-black">
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
                    <div className="p-5 border-b border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-md bg-[#eef4ff] flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary" style={{ fontSize: '11px' }} >description</span>
                        </div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">Profil & Biografi</h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed italic bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                        "{selectedPsikolog.Bio}"
                      </p>
                    </div>

                    {/* Penugasan Konselor */}
                    <div className="p-5 border-b border-slate-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 rounded-md bg-[#eef4ff] flex items-center justify-center">
                          <Layers size={11} className="text-primary" />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">Detail Praktik</h3>
                      </div>
                      <div className="space-y-1">
                        <InfoCard
                          icon={Building2}
                          label="Lokasi Praktik"
                          value={selectedPsikolog.Lokasi}
                          accent="border-l-blue-400"
                        />
                        <InfoCard
                          icon={Briefcase}
                          label="Bahasa yang Dikuasai"
                          value={selectedPsikolog.Bahasa}
                          accent="border-l-indigo-400"
                        />
                        <InfoCard
                          icon={Award}
                          label="Tarif Konsultasi"
                          value={`${formatIDR(selectedPsikolog.Tarif)} per Sesi`}
                          accent="border-l-amber-400"
                        />
                      </div>
                    </div>

                    {/* Informasi Kontak */}
                    <div className="p-5 border-b border-slate-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 rounded-md bg-[#eef4ff] flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary" style={{ fontSize: '11px' }} >mail</span>
                        </div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">Informasi Kontak</h3>
                      </div>
                      <div className="space-y-1">
                        <InfoCard
                          icon={Mail}
                          label="Email Resmi"
                          value={selectedPsikolog.Email}
                          accent="border-l-rose-400"
                          mono
                        />
                        <InfoCard
                          icon={Phone}
                          label="No. Handphone"
                          value={selectedPsikolog.NoHP}
                          accent="border-l-emerald-400"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-black text-slate-800">
                          Catatan Konseling Mahasiswa
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Daftar riwayat bimbingan mahasiswa fakultas Anda dengan {selectedPsikolog.Nama}
                        </p>
                      </div>
                    </div>

                    {loadingBookings ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '32px' }} >sync</span>
                        <p className="text-xs text-slate-400 font-semibold">Memuat riwayat...</p>
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>history</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">Belum Ada Riwayat Konseling</p>
                          <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                            Tidak ditemukan data riwayat bimbingan untuk mahasiswa dari fakultas Anda dengan psikolog ini.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookings.map((b) => {
                          const statusCls = 
                            b.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            b.status === 'Disetujui' || b.status === 'Dikonfirmasi' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            b.status === 'Menunggu' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-rose-50 text-rose-700 border-rose-100';

                          return (
                            <div key={b.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200/60 transition-all space-y-3">
                              {/* Student Info & Status Row */}
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-bold text-sm text-slate-900 leading-tight">
                                    {b.mahasiswa?.nama || '—'}
                                  </p>
                                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                                    {b.mahasiswa?.program_studi?.Nama || b.mahasiswa?.program_studi?.nama || '—'}
                                  </p>
                                </div>
                                <span className={cn(
                                  "px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider",
                                  statusCls
                                )}>
                                  {b.status}
                                </span>
                              </div>

                              {/* Date, Time & Mode */}
                              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500 bg-slate-100/50 p-2.5 rounded-xl border border-slate-200/30">
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[15px] text-slate-400">calendar_today</span>
                                  {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
                                  {b.jam_mulai} - {b.jam_selesai} WIB
                                </div>
                                <div className="flex items-center gap-1.5 ml-auto">
                                  <span className="material-symbols-outlined text-[15px] text-slate-400">
                                    {b.mode === 'Online' ? 'videocam' : 'location_on'}
                                  </span>
                                  {b.mode || 'Tatap Muka'}
                                </div>
                              </div>

                              {/* Complaint Section */}
                              <div className="space-y-1 bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                  <span className="material-symbols-outlined text-[15px] text-primary">psychology</span>
                                  <span className="text-[10px] font-black uppercase tracking-wider">Topik: {b.topik || 'Umum'}</span>
                                </div>
                                <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
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
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 flex-shrink-0">
                <button
                  onClick={() => handleSelectPsikolog(null)}
                  className="w-full h-11 rounded-xl border border-slate-200/60 bg-white text-xs font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                >
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function InfoCard({ icon: Icon, label, value, accent = 'border-l-slate-300', mono = false }) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 border-l-4 hover:bg-white hover:border-slate-200/60 transition-all',
      accent
    )}>
      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm border border-slate-100 flex-shrink-0">
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-0.5">{label}</p>
        <p className={cn(
          'text-sm font-semibold text-slate-900 truncate',
          mono && 'font-mono text-xs tracking-tight',
          (!value || value === '—') && 'text-[#c4c4c4] italic text-xs'
        )}>
          {value || 'Belum diisi'}
        </p>
      </div>
    </div>
  )
}

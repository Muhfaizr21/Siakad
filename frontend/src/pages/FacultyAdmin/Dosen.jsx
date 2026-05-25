"use client"

import React, { useState, useEffect, useMemo } from "react"
import api from "../../lib/axios"
import { Avatar, AvatarFallback } from "./components/avatar"
import { pddiktiService } from "../../services/api"

import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/select"
import { Button } from "./components/button"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const Layers = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>layers</span>;
const Icon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>info</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Mail = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>mail</span>;
const Phone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>phone</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const Briefcase = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>work</span>;
const UserCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>how_to_reg</span>;
const Building2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>business</span>;
const BookOpen = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>menu_book</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;



const JABATAN_STYLES = {
  'Profesor': { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Lektor Kepala': { cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  'Lektor': { cls: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'Asisten': { cls: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
}

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'

const AVATAR_COLORS = [
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-sky-500',
]

export default function DosenPage() {
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedDosen, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterJabatan, setFilterJab] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: 'Nama', direction: 'asc' })

  const fetchLecturers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/faculty/lecturers')
      const list = res?.data?.data || []
      setLecturers(list.map((d, i) => ({
        ID: d.ID,
        NIDN: d.NIDN,
        Nama: d.Nama,
        Jabatan: d.Jabatan || 'Dosen',
        ProgramStudi: d.ProgramStudi?.Nama || '—',
        Fakultas: d.Fakultas?.Nama || '—',
        Email: d.Pengguna?.Email || '—',
        NoHP: d.NoHP || '—',
        colorIdx: i % AVATAR_COLORS.length,
        Foto: d.Foto || d.Pengguna?.Foto || null,
      })))
    } catch {
      toast.error("Gagal memuat data dosen")
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await pddiktiService.fetchData('Universitas Bhakti Kencana', 'dosen')
      await fetchLecturers()
      toast.success('Sinkronisasi dosen selesai')
    } catch {
      toast.error('Gagal sinkronisasi dari PDDIKTI')
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => { fetchLecturers() }, [])

  const jabatanList = [...new Set(lecturers.map(d => d.Jabatan).filter(Boolean))]

  const filtered = useMemo(() =>
    lecturers.filter(d => {
      const q = search.toLowerCase()
      const matchQ = !q || d.Nama?.toLowerCase().includes(q) || d.NIDN?.includes(q) || d.ProgramStudi?.toLowerCase().includes(q)
      const matchJ = filterJabatan === 'all' || d.Jabatan === filterJabatan
      return matchQ && matchJ
    })
    , [lecturers, search, filterJabatan])

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
    total: lecturers.length,
    profesor: lecturers.filter(d => d.Jabatan === 'Profesor').length,
    lektor: lecturers.filter(d => d.Jabatan === 'Lektor' || d.Jabatan === 'Lektor Kepala').length,
    asisten: lecturers.filter(d => d.Jabatan === 'Asisten').length,
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-body">
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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Human Capital</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
                Direktori <span className="text-primary">Dosen</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed">
                Database tenaga pengajar, jabatan fungsional, dan penugasan akademik seluruh dosen di lingkungan fakultas.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="h-11 px-6 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60"
              >
                {isSyncing ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <RefreshCw size={14} className="text-primary" />}
                {isSyncing ? 'Syncing...' : 'PDDIKTI Sync'}
              </button>
            </div>
          </div>
        </section>

        {/* ── Stat Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Dosen', value: stats.total, icon: Users, bg: 'bg-[#eef4ff]', color: 'text-[#00236F]', desc: 'Tenaga pengajar terdaftar' },
            { label: 'Profesor', value: stats.profesor, icon: GraduationCap, bg: 'bg-amber-50', color: 'text-amber-600', desc: 'Guru Besar / Profesor' },
            { label: 'Lektor', value: stats.lektor, icon: Briefcase, bg: 'bg-indigo-50', color: 'text-indigo-600', desc: 'Lektor & Lektor Kepala' },
            { label: 'Asisten', value: stats.asisten, icon: UserCheck, bg: 'bg-slate-50', color: 'text-slate-500', desc: 'Asisten Ahli terdaftar' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.bg, s.color)}>
                  <s.icon size={18} />
                </div>
                <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] leading-none tabular-nums">
                {loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span> : s.value}
              </p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Table Card ─────────────────────────────────────────── */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-[#f0f0f0] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-base text-[#171717]">Daftar Tenaga Pengajar</h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Menampilkan <span className="font-bold text-[#171717]">{filtered.length}</span> dari <span className="font-bold text-[#00236F]">{lecturers.length}</span> dosen
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" style={{ fontSize: '14px' }} >search</span>
                <input
                  type="text"
                  placeholder="Cari nama, NIDN, prodi..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-56 rounded-xl border border-[#e5e5e5] focus:outline-none focus:border-[#00236F] text-sm bg-white"
                />
              </div>
              {/* Filter Jabatan */}
              <select
                value={filterJabatan}
                onChange={e => setFilterJab(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-[#e5e5e5] text-xs font-medium bg-white text-[#525252] focus:outline-none focus:border-[#00236F] appearance-none cursor-pointer"
              >
                <option value="all">Semua Jabatan</option>
                {jabatanList.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
              {/* Reset */}
              {(search || filterJabatan !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setFilterJab('all') }}
                  className="h-9 px-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#e5e5e5]">
                  {[
                    { label: '#', key: null, sortable: false, className: 'w-[50px]' },
                    { label: 'NIDN', key: 'NIDN', sortable: true, className: 'w-[130px]' },
                    { label: 'Identitas Dosen', key: 'Nama', sortable: true },
                    { label: 'Program Studi', key: 'ProgramStudi', sortable: true },
                    { label: 'Jabatan', key: 'Jabatan', sortable: true, className: 'w-[160px] text-center' },
                    { label: 'Aksi', key: null, sortable: false, className: 'text-right w-[100px]' },
                  ].map(h => (
                    <th
                      key={h.label}
                      onClick={() => h.sortable && handleSort(h.key)}
                      className={cn(
                        'px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider select-none',
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
                    <tr key={i} className="border-b border-[#f0f0f0]">
                      {[...Array(6)].map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-[#f5f5f5] rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-[#00236F]">
                          <span className="material-symbols-outlined" style={{ fontSize: '22px' }} >school</span>
                        </div>
                        <p className="font-bold text-sm text-[#171717]">Tidak Ada Data Dosen</p>
                        <p className="text-xs text-[#a3a3a3]">Coba ubah filter atau kata kunci pencarian.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, i) => {
                    const jabStyle = JABATAN_STYLES[row.Jabatan] || JABATAN_STYLES['Asisten']
                    return (
                      <tr key={row.ID || i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors group">
                        <td className="px-5 py-3.5 text-sm text-[#a3a3a3] font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                        <td className="px-5 py-3.5">
                          <code className="text-[12px] font-bold text-[#3b82f6] tracking-[0.08em] bg-[#eff6ff] px-2 py-1 rounded-lg border border-[#dbeafe]">
                            {row.NIDN || '—'}
                          </code>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3.5">
                            {row.Foto ? (
                              <img
                                src={row.Foto}
                                alt={row.Nama}
                                className="w-10 h-10 rounded-2xl object-cover shrink-0 shadow-sm border border-slate-200"
                                onError={(e) => { e.target.src = ''; }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-end justify-center overflow-hidden shrink-0 border border-slate-200/60 shadow-sm">
                                <svg className="w-8 h-8 text-slate-400 translate-y-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0 1 12.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-sm text-[#171717] leading-snug">{row.Nama || '—'}</p>
                              <p className="text-[11px] text-[#737373] font-medium">{row.Email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-[#525252] font-medium leading-snug">{row.ProgramStudi}</p>
                          {row.Fakultas && row.Fakultas !== '—' && (
                            <p className="text-[10px] text-[#a3a3a3] font-medium mt-0.5">{row.Fakultas}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider',
                            jabStyle.cls
                          )}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', jabStyle.dot)} />
                            {row.Jabatan}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setSelected(row)}
                            className="p-1.5 text-[#a3a3a3] hover:text-[#00236F] hover:bg-[#eef4ff] rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
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
      {selectedDosen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            {/* Modal box — stop propagation so clicks inside don't close */}
            <div
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >

              {/* ── Header ── */}
              <div className="relative bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] pt-6 pb-8 px-6 overflow-hidden flex-shrink-0">
                {/* decorative circles */}
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
                <div className="absolute -bottom-6 right-16 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />

                {/* Close */}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span>
                </button>

                {/* Avatar + name */}
                <div className="relative z-10 flex items-center gap-4 mb-5">
                  {selectedDosen.Foto ? (
                    <img
                      src={selectedDosen.Foto}
                      alt={selectedDosen.Nama}
                      className="w-[60px] h-[60px] rounded-2xl object-cover shrink-0 shadow-xl ring-2 ring-white/20"
                      onError={(e) => { e.target.src = ''; }}
                    />
                  ) : (
                    <div className="w-[60px] h-[60px] rounded-2xl bg-slate-100/90 backdrop-blur flex items-end justify-center overflow-hidden shrink-0 shadow-xl ring-2 ring-white/20">
                      <svg className="w-[46px] h-[46px] text-slate-400 translate-y-1.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0 1 12.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Tenaga Pengajar</p>
                    <h2 className="text-lg font-extrabold text-white leading-tight truncate">{selectedDosen.Nama}</h2>
                    <p className="text-xs text-blue-200 font-medium mt-0.5">{selectedDosen.ProgramStudi}</p>
                  </div>
                </div>

                {/* Info pills row */}
                <div className="relative z-10 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider">
                    <Award size={11} />
                    {selectedDosen.Jabatan || 'Dosen'}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white/80 tracking-wider font-mono">
                    NIDN {selectedDosen.NIDN || '—'}
                  </span>
                  <span className="flex items-center gap-1.5 bg-emerald-400/20 border border-emerald-300/30 px-3 py-1.5 rounded-xl text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Aktif
                  </span>
                </div>
              </div>

              {/* ── Body ── */}
              <div className="flex-1 overflow-y-auto">

                {/* Penugasan Akademik */}
                <div className="p-5 border-b border-[#f0f0f0]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-md bg-[#eef4ff] flex items-center justify-center">
                      <Layers size={11} className="text-[#00236F]" />
                    </div>
                    <h3 className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em]">Penugasan Akademik</h3>
                  </div>
                  <div className="space-y-1">
                    <InfoCard
                      icon={Building2}
                      label="Fakultas"
                      value={selectedDosen.Fakultas}
                      accent="border-l-blue-400"
                    />
                    <InfoCard
                      icon={BookOpen}
                      label="Program Studi"
                      value={selectedDosen.ProgramStudi}
                      accent="border-l-indigo-400"
                    />
                    <InfoCard
                      icon={Award}
                      label="Jabatan Fungsional"
                      value={selectedDosen.Jabatan}
                      accent="border-l-amber-400"
                    />
                  </div>
                </div>

                {/* Informasi Kontak */}
                <div className="p-5 border-b border-[#f0f0f0]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-md bg-[#eef4ff] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#00236F]" style={{ fontSize: '11px' }} >mail</span>
                    </div>
                    <h3 className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em]">Informasi Kontak</h3>
                  </div>
                  <div className="space-y-1">
                    <InfoCard
                      icon={Mail}
                      label="Email Institusi"
                      value={selectedDosen.Email}
                      accent="border-l-rose-400"
                      mono
                    />
                    <InfoCard
                      icon={Phone}
                      label="No. HP / WhatsApp"
                      value={selectedDosen.NoHP}
                      accent="border-l-emerald-400"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-md bg-[#eef4ff] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#00236F]" style={{ fontSize: '11px' }} Check >security</span>
                    </div>
                    <h3 className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em]">Status Kepegawaian</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                      <span className="block w-2 h-2 rounded-full bg-emerald-500 animate-pulse mx-auto mb-2" />
                      <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Aktif</p>
                      <p className="text-[10px] text-emerald-500/70 font-medium mt-0.5">Status Akademik</p>
                    </div>
                    <div className="bg-[#f8faff] border border-[#e8efff] rounded-2xl p-4 text-center">
                      <span className="material-symbols-outlined text-[#00236F] mx-auto mb-2" style={{ fontSize: '16px' }} >school</span>
                      <p className="text-xs font-black text-[#00236F] uppercase tracking-widest">Dosen Tetap</p>
                      <p className="text-[10px] text-[#a3a3a3] font-medium mt-0.5">Jenis Kepegawaian</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex gap-3 flex-shrink-0">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 h-11 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold text-[#525252] uppercase tracking-widest hover:bg-[#f5f5f5] transition-all active:scale-95"
                >
                  Tutup
                </button>
                <button
                  className="flex-1 h-11 rounded-xl bg-[#00236F] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#00236F]/20"
                >
                  Edit Profil
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
      'flex items-center gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#f0f0f0] border-l-4 hover:bg-white hover:border-[#e5e5e5] transition-all',
      accent
    )}>
      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#00236F] shadow-sm border border-[#f0f0f0] flex-shrink-0">
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold text-[#a3a3a3] uppercase tracking-[0.15em] mb-0.5">{label}</p>
        <p className={cn(
          'text-sm font-semibold text-[#171717] truncate',
          mono && 'font-mono text-xs tracking-tight',
          (!value || value === '—') && 'text-[#c4c4c4] italic text-xs'
        )}>
          {value || 'Belum diisi'}
        </p>
      </div>
    </div>
  )
}

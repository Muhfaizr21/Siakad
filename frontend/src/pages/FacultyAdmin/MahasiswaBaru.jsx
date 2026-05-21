"use client"

import React, { useState, useEffect, useMemo } from "react"

import { toast, Toaster } from "react-hot-toast"
import { API_BASE_URL } from "../../services/api"
import { cn } from "@/lib/utils"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/select"
import { Button } from "./components/button"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Download = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const Icon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>info</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Mail = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>mail</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const UserCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>how_to_reg</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const BookOpen = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>menu_book</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const Calendar = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;



const API = `${API_BASE_URL}/faculty`

const STATUS_STYLES = {
  'Pending':   { cls: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  'Verified':  { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Rejected':  { cls: 'bg-rose-50 text-rose-700 border-rose-200',       dot: 'bg-rose-500' },
  'Approved':  { cls: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
}

const AVATAR_COLORS = [
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-sky-500',
]

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'

const formatDate = (d) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return d }
}

const TARGET_KUOTA = 450

export default function FacultyMahasiswaBaru() {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')
  const [filterProdi, setFilterProdi] = useState('all')
  const [currentPage, setCurrentPage]   = useState(1)
  const [pageSize, setPageSize]         = useState(10)
  const [sortConfig, setSortConfig]     = useState({ key: 'createdAt', direction: 'desc' })

  const fetchBaru = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/admissions`)
      const json = await res.json()
      if (json.status === 'success') {
        setStudents((json.data || []).map((s, i) => ({ ...s, colorIdx: i % AVATAR_COLORS.length })))
      }
    } catch { toast.error("Gagal memuat data mahasiswa baru") }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBaru() }, [])

  const prodiList = [...new Set(students.map(s => s.pilihanProdi).filter(Boolean))]

  const filtered = useMemo(() =>
    students.filter(s => {
      const q = search.toLowerCase()
      const matchQ = !q || s.namaLengkap?.toLowerCase().includes(q) || s.nomorDaftar?.includes(q) || s.email?.toLowerCase().includes(q)
      const matchP = filterProdi === 'all' || s.pilihanProdi === filterProdi
      return matchQ && matchP
    })
  , [students, search, filterProdi])

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
    total:      students.length,
    verified:   students.filter(s => s.status === 'Verified' || s.status === 'Approved').length,
    pending:    students.filter(s => !s.status || s.status === 'Pending').length,
    pctFilled:  Math.min(100, Math.round((students.length / TARGET_KUOTA) * 100)),
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-body">
      <Toaster position="top-right" />
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-6">

        {/* ── Page Header ── */}
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
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Penerimaan Mahasiswa Baru</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
                Maba <span className="text-primary">Terdaftar</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">
                Database mahasiswa baru semester ganjil 2024 — pantau registrasi, verifikasi, dan pemenuhan kuota.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => alert('Mengunduh...')}
                className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm"
              >
                <Download size={14} className="text-primary" />
                Ekspor
              </button>
              <button
                onClick={fetchBaru}
                disabled={loading}
                className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60"
              >
                {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <RefreshCw size={14} className="text-primary" />}
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Registrasi Baru',  value: stats.total,    icon: Users,        bg: 'bg-[#eef4ff]', color: 'text-[#00236F]', desc: 'Total pendaftar masuk' },
            { label: 'Terverifikasi',    value: stats.verified, icon: UserCheck,    bg: 'bg-emerald-50', color: 'text-emerald-600', desc: 'Lolos verifikasi data' },
            { label: 'Menunggu Review',  value: stats.pending,  icon: Clock,        bg: 'bg-amber-50',  color: 'text-amber-600',  desc: 'Perlu tindak lanjut' },
            { label: 'Target Kuota',     value: TARGET_KUOTA,   icon: GraduationCap, bg: 'bg-indigo-50', color: 'text-indigo-600', desc: `${stats.pctFilled}% terisi` },
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

        {/* ── Kuota Progress ── */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '15px' }} >trending_up</span>
              <span className="text-sm font-bold text-[#171717]">Penyerapan Kuota</span>
            </div>
            <span className="text-sm font-black text-primary tabular-nums">{stats.total} / {TARGET_KUOTA}</span>
          </div>
          <div className="w-full h-3 bg-[#f0f0f0] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00236F] to-[#3b82f6] rounded-full transition-all duration-700"
              style={{ width: `${stats.pctFilled}%` }}
            />
          </div>
          <p className="text-xs text-[#a3a3a3] mt-2 font-medium">{stats.pctFilled}% kuota terisi — {TARGET_KUOTA - stats.total} slot tersisa</p>
        </div>

        {/* ── Table Card ── */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-[#f0f0f0] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-base text-[#171717]">Daftar Pendaftar</h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Menampilkan <span className="font-bold text-[#171717]">{filtered.length}</span> dari <span className="font-bold text-primary">{students.length}</span> pendaftar
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" style={{ fontSize: '14px' }} >search</span>
                <input
                  type="text"
                  placeholder="Cari nama, nomor daftar..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-56 rounded-xl border border-[#e5e5e5] focus:outline-none focus:border-primary text-sm bg-white"
                />
              </div>
              <select
                value={filterProdi}
                onChange={e => setFilterProdi(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-[#e5e5e5] text-xs font-medium bg-white text-[#525252] focus:outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="all">Semua Prodi</option>
                {prodiList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {(search || filterProdi !== 'all') && (
                <button onClick={() => { setSearch(''); setFilterProdi('all') }}
                  className="h-9 px-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors">
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  {[
                    { label: '#', key: null, sortable: false },
                    { label: 'Nomor Daftar', key: 'nomorDaftar', sortable: true },
                    { label: 'Identitas Pendaftar', key: 'namaLengkap', sortable: true },
                    { label: 'Pilihan Prodi', key: 'pilihanProdi', sortable: true },
                    { label: 'Status', key: 'status', sortable: true },
                    { label: 'Registrasi', key: 'createdAt', sortable: true },
                    { label: 'Aksi', key: null, sortable: false },
                  ].map(h => (
                    <th
                      key={h.label}
                      onClick={() => h.sortable && handleSort(h.key)}
                      className={cn(
                        'px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider whitespace-nowrap select-none',
                        h.sortable && 'cursor-pointer hover:text-slate-900 group',
                        h.className
                      )}
                    >
                      <div className="flex items-center gap-1.5">
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
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-[#f5f5f5] rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined" style={{ fontSize: '22px' }} >group</span>
                        </div>
                        <p className="font-bold text-sm text-[#171717]">Tidak Ada Data Pendaftar</p>
                        <p className="text-xs text-[#a3a3a3]">Coba ubah filter atau kata kunci pencarian.</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((row, i) => {
                  const st = STATUS_STYLES[row.status] || STATUS_STYLES['Pending']
                  return (
                    <tr key={row.id || i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-[#a3a3a3] font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                      <td className="px-5 py-3.5">
                        <code className="text-[11px] font-bold text-primary tracking-wide bg-[#eff6ff] px-2 py-1 rounded-lg border border-[#dbeafe]">
                          {row.nomorDaftar || 'PENDING'}
                        </code>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 shadow-sm', AVATAR_COLORS[row.colorIdx])}>
                            {getInitials(row.namaLengkap)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#171717] leading-snug">{row.namaLengkap || '—'}</p>
                            <p className="text-[10px] text-[#a3a3a3] font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined" style={{ fontSize: '9px' }} >mail</span>
                              {row.email || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-[#525252] font-medium">{row.pilihanProdi || '—'}</p>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">
                          {row.jalur || 'Mandiri'}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider', st.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', st.dot)} />
                          {row.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-[#737373] font-medium flex items-center gap-1.5">
                          <span className="material-symbols-outlined" style={{ fontSize: '11px' }} >calendar_month</span>
                          {formatDate(row.createdAt)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => setSelected(row)}
                          className="p-1.5 text-[#a3a3a3] hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
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
                          ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
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

      {/* ── Detail Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -bottom-6 right-16 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
              <button onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span>
              </button>
              <div className="relative z-10 flex items-center gap-4 mb-5">
                <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-white text-base font-black shadow-xl ring-2 ring-white/20', AVATAR_COLORS[selected.colorIdx])}>
                  {getInitials(selected.namaLengkap)}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Calon Mahasiswa Baru</p>
                  <h2 className="text-lg font-extrabold text-white leading-tight truncate">{selected.namaLengkap}</h2>
                  <p className="text-xs text-blue-200 font-medium mt-0.5">{selected.pilihanProdi || '—'}</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white font-mono tracking-wider">
                  {selected.nomorDaftar || 'No. PENDING'}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider">
                  <Award size={10} /> {selected.jalur || 'Mandiri'}
                </span>
                <span className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider',
                  (selected.status === 'Verified' || selected.status === 'Approved')
                    ? 'bg-emerald-400/20 border border-emerald-300/30 text-emerald-200'
                    : 'bg-amber-400/20 border border-amber-300/30 text-amber-200'
                )}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {selected.status || 'Pending'}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <SectionBlock icon={BookOpen} title="Data Pendaftaran">
                <InfoCard icon={GraduationCap} label="Pilihan Program Studi" value={selected.pilihanProdi} accent="border-l-blue-400" />
                <InfoCard icon={Award}        label="Jalur Masuk"           value={selected.jalur}        accent="border-l-indigo-400" />
                <InfoCard icon={Calendar}     label="Tanggal Registrasi"    value={formatDate(selected.createdAt)} accent="border-l-amber-400" />
              </SectionBlock>
              <SectionBlock icon={Mail} title="Informasi Kontak" last>
                <InfoCard icon={Mail}    label="Email"         value={selected.email}   accent="border-l-rose-400" mono />
                <InfoCard icon={Award}   label="Nomor Daftar"  value={selected.nomorDaftar} accent="border-l-slate-400" mono />
              </SectionBlock>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex gap-3 flex-shrink-0">
              <button onClick={() => setSelected(null)}
                className="flex-1 h-11 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold text-[#525252] uppercase tracking-widest hover:bg-[#f5f5f5] transition-all active:scale-95">
                Tutup
              </button>
              <button
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SectionBlock({ icon: Icon, title, children, last = false }) {
  return (
    <div className={cn('p-5', !last && 'border-b border-[#f0f0f0]')}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-md bg-[#eef4ff] flex items-center justify-center">
          <Icon size={11} className="text-[#00236F]" />
        </div>
        <h3 className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em]">{title}</h3>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function InfoCard({ icon: Icon, label, value, accent = 'border-l-slate-300', mono = false }) {
  const empty = !value || value === '—'
  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#f0f0f0] border-l-4 hover:bg-white hover:border-[#e5e5e5] transition-all', accent)}>
      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#00236F] shadow-sm border border-[#f0f0f0] flex-shrink-0">
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold text-[#a3a3a3] uppercase tracking-[0.15em] mb-0.5">{label}</p>
        <p className={cn('text-sm font-semibold text-[#171717] truncate', mono && 'font-mono text-xs', empty && 'text-[#c4c4c4] italic text-xs')}>
          {empty ? 'Belum diisi' : value}
        </p>
      </div>
    </div>
  )
}

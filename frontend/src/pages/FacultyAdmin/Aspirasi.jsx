"use client"

import React, { useState, useEffect, useMemo } from 'react'
import api from '../../lib/axios'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/select"
import { Button } from "./components/button"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Reply = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>reply</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const Send = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>send</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const AlertCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>error</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const MessageSquare = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chat</span>;
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;



const API = `${API_BASE_URL}/faculty`

const AVATAR_COLORS = [
  'from-blue-400 to-indigo-500','from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500','from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500','from-cyan-400 to-sky-500',
]
const getInitials = (n='') => n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()||'?'

const STATUS_STYLES = {
  selesai:     { cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500' },
  proses:      { cls:'bg-blue-50 text-blue-700 border-blue-200',         dot:'bg-blue-500' },
  klarifikasi: { cls:'bg-amber-50 text-amber-700 border-amber-200',      dot:'bg-amber-500' },
  ditolak:     { cls:'bg-rose-50 text-rose-700 border-rose-200',         dot:'bg-rose-500' },
  terbuka:     { cls:'bg-slate-50 text-slate-600 border-slate-200',      dot:'bg-slate-400' },
}
const getStatus = (v='') => STATUS_STYLES[(v||'terbuka').toLowerCase()] || STATUS_STYLES.terbuka

const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) } catch { return d } }

const getFullUrl = (path) => {
  if (!path || path.trim() === "" || path === "/" || path.endsWith("/profiles/") || path.endsWith("/students/")) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${path}`;
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

const STATUS_ACTIONS = [
  { status:'proses',      label:'Proses',      icon:Clock,         cls:'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { status:'klarifikasi', label:'Klarifikasi', icon:MessageSquare, cls:'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { status:'selesai',     label:'Selesaikan',  icon:CheckCircle2,  cls:'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  { status:'ditolak',     label:'Tolak',       icon:AlertCircle,   cls:'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
]

const FacultyAspirationManagement = () => {
  const [aspirations, setAspirations]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState(null)
  const [response, setResponse]         = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage]   = useState(1)
  const [pageSize, setPageSize]         = useState(10)
  const [sortConfig, setSortConfig]     = useState({ key: 'CreatedAt', direction: 'desc' })

  const normalizeAspirasi = (a, i) => {
    const m = a.mahasiswa || a.Mahasiswa || {};
    return {
      ...a,
      ID: a.id || a.ID,
      Judul: a.judul || a.Judul || '—',
      Isi: a.isi || a.Isi || '—',
      Kategori: a.kategori || a.Kategori || 'Umum',
      Status: a.status || a.Status || 'Terbuka',
      CreatedAt: a.created_at || a.CreatedAt,
      Mahasiswa: {
        Nama: m.nama || m.Nama || (a.is_anonim || a.IsAnonim ? 'Anonim' : '—'),
        NIM: m.nim || m.NIM || '—',
        ProgramStudi: {
          Nama: m.program_studi?.nama || m.program_studi?.Nama || m.ProgramStudi?.Nama || '—'
        },
        Foto: getFullUrl(m.foto_url || m.FotoURL || m.foto || m.Foto || null),
      },
      colorIdx: i % AVATAR_COLORS.length,
    };
  };

  const fetchAspirations = async () => {
    setLoading(true)
    try {
      const res = await api.get('/faculty/aspirasi')
      if (res.data.status === 'success')
        setAspirations((res.data.data||[]).map(normalizeAspirasi))
    } catch { toast.error('Gagal mengambil data aspirasi') }
    finally { setLoading(false) }
  }

  const handleUpdateStatus = async (status) => {
    setIsSubmitting(true)
    try {
      const res = await api.put(`/faculty/aspirasi/${selected.ID}`, { Status: status, tanggapan: response })
      if (res.data.status === 'success') {
        toast.success('Aspirasi berhasil diperbarui')
        setSelected(null); setResponse(''); fetchAspirations()
      } else toast.error(res.data.message || 'Gagal update status')
    } catch (e) { toast.error(e.response?.data?.message || 'Gangguan koneksi') }
    finally { setIsSubmitting(false) }
  }

  useEffect(() => { fetchAspirations() }, [])

  const filtered = useMemo(() => aspirations.filter(a => {
    const q = search.toLowerCase()
    const matchQ = !q || a.Mahasiswa?.Nama?.toLowerCase().includes(q) || a.Judul?.toLowerCase().includes(q)
    const matchS = filterStatus === 'all' || (a.Status||'terbuka').toLowerCase() === filterStatus
    return matchQ && matchS
  }), [aspirations, search, filterStatus])

  const sorted = useMemo(() => {
    let items = [...filtered]
    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        if (sortConfig.key === 'Mahasiswa.Nama') {
          aVal = a.Mahasiswa?.Nama || ''
          bVal = b.Mahasiswa?.Nama || ''
        }

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
    total:      aspirations.length,
    selesai:    aspirations.filter(a=>(a.Status||'').toLowerCase()==='selesai').length,
    proses:     aspirations.filter(a=>(a.Status||'').toLowerCase()==='proses').length,
    klarifikasi:aspirations.filter(a=>(a.Status||'').toLowerCase()==='klarifikasi').length,
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-body">
      <Toaster position="top-right" />
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-6">

        {/* Header */}
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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Student Voice</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
                Manajemen <span className="text-primary">Aspirasi</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">
                Kelola dan tanggapi keluhan serta aspirasi mahasiswa secara resmi dari portal fakultas.
              </p>
            </div>
            <button onClick={fetchAspirations} disabled={loading}
              className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-slate-50 hover:text-slate-900 gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60 shrink-0">
              {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>sync</span>} Refresh
            </button>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:'Total Masuk',   value:stats.total,       icon:MessageSquare, bg:'bg-[#eef4ff]',  color:'text-[#00236F]',   desc:'Semua aspirasi' },
            { label:'Selesai',       value:stats.selesai,     icon:CheckCircle2,  bg:'bg-emerald-50', color:'text-emerald-600', desc:'Sudah diselesaikan' },
            { label:'Dalam Proses',  value:stats.proses,      icon:Clock,         bg:'bg-blue-50',    color:'text-blue-600',    desc:'Sedang ditangani' },
            { label:'Klarifikasi',   value:stats.klarifikasi, icon:AlertCircle,   bg:'bg-amber-50',   color:'text-amber-600',   desc:'Butuh klarifikasi' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg, s.color)}>
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

        {/* Table */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0f0f0] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-base text-[#171717]">Daftar Aspirasi Mahasiswa</h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Menampilkan <span className="font-bold text-[#171717]">{filtered.length}</span> dari <span className="font-bold text-primary">{aspirations.length}</span> aspirasi
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" style={{ fontSize: '14px' }} >search</span>
                <input type="text" placeholder="Cari pengirim atau judul..." value={search} onChange={e=>setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-52 rounded-xl border border-[#e5e5e5] focus:outline-none focus:border-primary text-sm bg-white" />
              </div>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-[#e5e5e5] text-xs font-medium bg-white text-[#525252] focus:outline-none focus:border-primary appearance-none cursor-pointer">
                <option value="all">Semua Status</option>
                <option value="terbuka">Terbuka</option>
                <option value="proses">Proses</option>
                <option value="klarifikasi">Klarifikasi</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
              {(search||filterStatus!=='all') && (
                <button onClick={()=>{setSearch('');setFilterStatus('all')}}
                  className="h-9 px-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-200 hover:bg-rose-100">Reset</button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  {[
                    { label: 'No', key: null, sortable: false },
                    { label: 'Mahasiswa', key: 'Mahasiswa.Nama', sortable: true },
                    { label: 'Aspirasi & Keluhan', key: 'Judul', sortable: true },
                    { label: 'Isi Singkat', key: 'Isi', sortable: true },
                    { label: 'Status', key: 'Status', sortable: true },
                    { label: 'Tanggal', key: 'CreatedAt', sortable: true },
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
                {loading ? Array.from({length: pageSize}).map((_,i)=>(
                  <tr key={i} className="border-b border-[#f0f0f0]">
                    {[...Array(7)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-[#f5f5f5] rounded animate-pulse"/></td>)}
                  </tr>
                )) : paginated.length===0 ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >chat</span></div>
                      <p className="font-bold text-sm text-[#171717]">Tidak Ada Aspirasi</p>
                      <p className="text-xs text-[#a3a3a3]">Belum ada mahasiswa yang mengirimkan aspirasi.</p>
                    </div>
                  </td></tr>
                ) : paginated.map((row,i)=>{
                  const st = getStatus(row.Status)
                  return (
                    <tr key={row.ID||i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-[#a3a3a3] font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <StudentAvatar src={row.Mahasiswa?.Foto} name={row.Mahasiswa?.Nama} className="w-9 h-9 rounded-xl" />
                          <div>
                            <p className="font-bold text-sm text-[#171717]">{row.Mahasiswa?.Nama||'Anonim'}</p>
                            <p className="text-[10px] text-[#a3a3a3] font-medium">{row.Mahasiswa?.NIM||'—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-sm text-[#171717] max-w-[200px] truncate leading-snug">{row.Judul||'—'}</p>
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-primary bg-[#eef4ff] px-2 py-0.5 rounded-md">{row.Kategori||'Umum'}</span>
                      </td>
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <p className="text-xs text-[#737373] italic line-clamp-2">"{row.Isi}"</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider', st.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', st.dot)}/>{(row.Status||'Terbuka')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#737373] font-medium whitespace-nowrap">
                        {formatDate(row.CreatedAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={()=>{setSelected(row);setResponse(row.response||'')}}
                          className="p-1.5 text-[#a3a3a3] hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors" title="Balas">
                          <Reply size={15}/>
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

      {/* Detail + Response Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={()=>setSelected(null)}>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]"
            onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"/>
              <button onClick={()=>setSelected(null)}
                className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span>
              </button>
              <div className="relative z-10 flex items-center gap-4 mb-5">
                <StudentAvatar src={selected.Mahasiswa?.Foto} name={selected.Mahasiswa?.Nama} className="w-14 h-14 rounded-2xl shadow-xl ring-2 ring-white/20" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Aspirasi Mahasiswa</p>
                  <h2 className="text-base font-extrabold text-white leading-tight line-clamp-2">{selected.Judul}</h2>
                  <p className="text-xs text-blue-200 font-medium mt-0.5">{selected.Mahasiswa?.Nama} · {selected.Mahasiswa?.NIM}</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider">
                  {selected.Kategori||'Umum'}
                </span>
                <span className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider',
                  (selected.Status||'').toLowerCase()==='selesai' ? 'bg-emerald-400/20 border border-emerald-300/30 text-emerald-200'
                  : (selected.Status||'').toLowerCase()==='proses' ? 'bg-blue-400/20 border border-blue-300/30 text-blue-200'
                  : 'bg-amber-400/20 border border-amber-300/30 text-amber-200')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>
                  {selected.Status||'Terbuka'}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Isi aspirasi */}
              <div className="bg-[#fafafa] rounded-2xl border border-[#f0f0f0] p-4">
                <p className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.15em] mb-2">Isi Aspirasi</p>
                <p className="text-sm text-[#525252] leading-relaxed italic">"{selected.Isi}"</p>
                <p className="text-[10px] text-[#c4c4c4] mt-2 font-medium">{formatDate(selected.CreatedAt)}</p>
              </div>

              {/* Response box */}
              <div>
                <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-2">Tanggapan Resmi Fakultas</label>
                <textarea value={response} onChange={e=>setResponse(e.target.value)} rows={4}
                  placeholder="Berikan tanggapan resmi yang informatif dan solutif..."
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] focus:outline-none focus:border-primary focus:bg-white text-sm text-[#171717] transition-all resize-none" />
              </div>

              {/* Status Actions */}
              <div>
                <p className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-2">Ubah Status Penanganan</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_ACTIONS.map(a=>(
                    <button key={a.status} onClick={()=>handleUpdateStatus(a.status)} disabled={isSubmitting}
                      className={cn('flex items-center justify-center gap-2 h-11 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50', a.cls)}>
                      {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '13px' }} >sync</span> : <a.icon size={13}/>}
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex gap-3 flex-shrink-0">
              <button onClick={()=>setSelected(null)}
                className="flex-1 h-11 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold text-[#525252] uppercase tracking-widest hover:bg-[#f5f5f5] transition-all">
                Tutup
              </button>
              <button onClick={()=>handleUpdateStatus(selected.Status||'proses')} disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-[#00236F] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#00236F]/20 disabled:opacity-60 flex items-center justify-center gap-2">
                {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <Send size={14}/>}
                Kirim Tanggapan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacultyAspirationManagement

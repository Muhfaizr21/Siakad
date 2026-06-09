"use client"

import React, { useState, useEffect, useMemo } from 'react'
import api from '../../lib/axios'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Reply = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>reply</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const Send = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>send</span>;
const AlertCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>error</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const MessageSquare = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chat</span>;
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;

const AVATAR_COLORS = [
  'from-blue-400 to-indigo-500','from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500','from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500','from-cyan-400 to-sky-500',
]

const STATUS_STYLES = {
  'disetujui fakultas': { cls:'bg-blue-50 text-blue-700 border-blue-200', dot:'bg-blue-500' },
  'ditolak fakultas':   { cls:'bg-rose-50 text-rose-700 border-rose-200', dot:'bg-rose-500' },
  selesai:              { cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500' },
  proses:               { cls:'bg-blue-50 text-blue-700 border-blue-200',         dot:'bg-blue-500' },
  klarifikasi:          { cls:'bg-amber-50 text-amber-700 border-amber-200',      dot:'bg-amber-500' },
  ditolak:              { cls:'bg-rose-50 text-rose-700 border-rose-200',         dot:'bg-rose-500' },
  terbuka:              { cls:'bg-slate-50 text-slate-600 border-slate-200',      dot:'bg-slate-400' },
}
const getStatus = (v='') => STATUS_STYLES[(v||'terbuka').toLowerCase()] || STATUS_STYLES.terbuka

const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) } catch { return d } }

const getFullUrl = (path) => {
  if (!path || path.trim() === "" || path === "/" || path.endsWith("/profiles/") || path.endsWith("/students/")) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
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

const FacultyAspirationManagement = () => {
  const [aspirations, setAspirations]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState(null)
  const [form, setForm]                 = useState({ status: '', respon: '' })
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
      BuktiURL: a.BuktiURL ?? a.bukti_url ?? a.FotoURL ?? a.foto_url ?? a.lampiran_url ?? a.LampiranURL ?? '',
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
    let finalStatus = status
    if (status === 'selesai') {
      finalStatus = 'Disetujui Fakultas'
    } else if (status === 'ditolak') {
      finalStatus = 'Ditolak Fakultas'
    }

    if (!form.respon) {
      toast.error('Tanggapan harus diisi')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await api.put(`/faculty/aspirasi/${selected.ID}`, { Status: finalStatus, tanggapan: form.respon })
      if (res.data.status === 'success') {
        toast.success(finalStatus === 'Disetujui Fakultas' 
          ? 'Aspirasi disetujui & diteruskan ke Super Admin!' 
          : 'Aspirasi ditolak!'
        )
        setSelected(null)
        setForm({ status: '', respon: '' })
        fetchAspirations()
      } else {
        toast.error(res.data.message || 'Gagal update status')
      }
    } catch (e) { 
      toast.error(e.response?.data?.message || 'Gangguan koneksi') 
    } finally { 
      setIsSubmitting(false) 
    }
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

  const handleOpenAudit = (asp) => {
    setSelected(asp)
    let initialStatus = asp.Status?.toLowerCase() || 'proses'
    if (initialStatus === 'disetujui fakultas') initialStatus = 'selesai'
    if (initialStatus === 'ditolak fakultas') initialStatus = 'ditolak'
    
    setForm({
      status: initialStatus,
      respon: asp.respon || asp.Respon || ''
    })
  }

  const stats = {
    total:      aspirations.length,
    selesai:    aspirations.filter(a=>(a.Status||'').toLowerCase()==='disetujui fakultas' || (a.Status||'').toLowerCase()==='selesai').length,
    proses:     aspirations.filter(a=>(a.Status||'').toLowerCase()==='proses').length,
    klarifikasi:aspirations.filter(a=>(a.Status||'').toLowerCase()==='klarifikasi').length,
  }

  return (
    <PageContent>
      <Toaster position="top-right" />
        <DashboardHero
          title="Manajemen "
          highlightedTitle="Aspirasi"
          subtitle="Kelola dan tanggapi keluhan serta aspirasi mahasiswa secara resmi dari portal fakultas."
          icon="chat"
          badges={[
            { label: 'Student Voice', active: false },
            { label: `${stats.proses} Sedang Ditangani`, active: true }
          ]}
          actions={
            <>
              <div className="hidden lg:flex items-center gap-2 text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Masuk</span>
                <span className="text-sm font-extrabold text-primary px-2 py-0.5 rounded-md bg-[#eef4ff] border border-blue-100">{stats.total}</span>
              </div>
              <button onClick={fetchAspirations} disabled={loading}
                className="h-10 px-5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }} >sync</span> : <RefreshCw size={13} className="text-primary" />} Refresh Data
              </button>
            </>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:'Total Masuk',   value:stats.total,       icon:MessageSquare, bg:'bg-[#eef4ff]',  color:'text-primary',   desc:'Semua aspirasi' },
            { label:'Disetujui / Selesai', value:stats.selesai, icon:CheckCircle2,  bg:'bg-emerald-50', color:'text-emerald-600', desc:'Disetujui fakultas / selesai' },
            { label:'Dalam Proses',  value:stats.proses,      icon:Clock,         bg:'bg-blue-50',    color:'text-blue-600',    desc:'Sedang ditangani' },
            { label:'Klarifikasi',   value:stats.klarifikasi, icon:AlertCircle,   bg:'bg-amber-50',   color:'text-amber-600',   desc:'Butuh klarifikasi' },
          ].map(s => (
            <div key={s.label} className="glass-card border border-slate-200/60 rounded-2xl p-5 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg, s.color)}>
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

        {/* Table */}
        <div className="glass-card border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden bg-white">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="font-extrabold text-base tracking-tight text-slate-900">Daftar Aspirasi Mahasiswa</h2>
                <span className="px-2 py-0.5 rounded-md bg-primary/5 text-primary text-[10px] font-bold border border-primary/10">
                  {filtered.length} Data
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Menampilkan aspirasi masuk dari seluruh mahasiswa fakultas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Modern Search Bar */}
              <div className="relative group flex-1 sm:flex-none">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[18px]">search</span>
                <input 
                  type="text" 
                  placeholder="Cari pengirim atau judul..." 
                  value={search} 
                  onChange={e=>setSearch(e.target.value)}
                  className="pl-10 pr-4 h-10 w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-xs font-semibold transition-all" 
                />
              </div>

              {/* Status Filter */}
              <div className="relative flex-1 sm:flex-none">
                <select 
                  value={filterStatus} 
                  onChange={e=>setFilterStatus(e.target.value)}
                  className="h-10 pl-4 pr-10 w-full rounded-xl border border-slate-200 bg-slate-50/30 hover:bg-white focus:outline-none focus:border-primary/50 text-xs font-bold text-slate-700 appearance-none cursor-pointer transition-all shadow-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="terbuka">Terbuka</option>
                  <option value="proses">Proses</option>
                  <option value="klarifikasi">Klarifikasi</option>
                  <option value="disetujui fakultas">Disetujui Fakultas</option>
                  <option value="ditolak fakultas">Ditolak Fakultas</option>
                  <option value="selesai">Selesai</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {(search || filterStatus !== 'all') && (
                  <button 
                    onClick={() => {setSearch(''); setFilterStatus('all')}}
                    className="h-10 px-4 flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-100 transition-colors active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    Reset
                  </button>
                )}
                <button 
                  onClick={fetchAspirations}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-white transition-all active:scale-95 shadow-sm"
                  title="Refresh Data"
                >
                  <span className={cn("material-symbols-outlined text-[20px]", loading && "animate-spin")}>sync</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50">
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
                        'px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap select-none',
                        h.sortable && 'cursor-pointer hover:text-slate-900 group'
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
                  <tr key={i} className="border-b border-slate-100">
                    {[...Array(7)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-slate-50 rounded animate-pulse"/></td>)}
                  </tr>
                )) : paginated.length===0 ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >chat</span></div>
                      <p className="font-bold text-sm text-slate-900">Tidak Ada Aspirasi</p>
                      <p className="text-xs text-slate-400">Belum ada mahasiswa yang mengirimkan aspirasi.</p>
                    </div>
                  </td></tr>
                ) : paginated.map((row,i)=>{
                  const st = getStatus(row.Status)
                  return (
                    <tr key={row.ID||i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <StudentAvatar src={row.Mahasiswa?.Foto} name={row.Mahasiswa?.Nama} className="w-9 h-9 rounded-xl" />
                          <div>
                            <p className="font-bold text-sm text-slate-900">{row.Mahasiswa?.Nama||'Anonim'}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{row.Mahasiswa?.NIM||'—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-sm text-slate-900 max-w-[200px] truncate leading-snug">{row.Judul||'—'}</p>
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-primary bg-[#eef4ff] px-2 py-0.5 rounded-md">{row.Kategori||'Umum'}</span>
                      </td>
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <p className="text-xs text-slate-500 italic line-clamp-2">"{row.Isi}"</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider', st.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', st.dot)}/>{(row.Status||'Terbuka')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 font-medium whitespace-nowrap">
                        {formatDate(row.CreatedAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={()=>handleOpenAudit(row)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors" title="Balas">
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
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1 font-body bg-white">
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
              </Button>
            </div>
          </div>
        </div>

      {/* ── Global Aspiration Audit Dialog Popup Modal (Faculty Admin) ── */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)} maxWidth="max-w-5xl">
        <DialogContent className="max-w-5xl p-0 overflow-hidden border border-border shadow-2xl rounded-2xl bg-surface animate-in zoom-in-95 duration-200">
          <DialogHeader className="p-8 pb-5 bg-slate-50/50 border-b border-border relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined size-24 rotate-12 text-slate-800">security</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="size-8 rounded-xl bg-slate-105 flex items-center justify-center text-slate-600">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>security</span>
                </div>
                <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-slate-200 text-slate-700 border-none rounded-md">
                  FACULTY AUDIT PANEL · #ASP-{selected?.ID?.toString().padStart(4, '0')}
                </Badge>
              </div>
              <DialogTitle className="text-lg md:text-xl font-black font-headline tracking-tighter text-slate-900 truncate max-w-[500px]">
                {selected?.Judul}
              </DialogTitle>
              <DialogDescription className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Status: {selected?.Status || 'Terbuka'}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Modal Body */}
          <div className="p-8 pt-5 space-y-5 max-h-[50vh] overflow-y-auto no-scrollbar">
            {selected && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Reporter Profile, Content Subjek & Attachments */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Reporter Profile Block */}
                  <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5 items-start">
                    <StudentAvatar src={selected.Mahasiswa?.Foto} name={selected.Mahasiswa?.Nama} className="w-16 h-16 rounded-2xl shadow-md ring-4 ring-neutral-100 shrink-0" />
                    
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas Pelapor</span>
                        <span className="inline-block text-[8px] font-black text-primary bg-[#eef4ff] px-2 py-0.5 rounded-md">Verified Mahasiswa</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</p>
                          <p className="font-bold text-slate-800 truncate">{selected.Mahasiswa?.Nama}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NIM / Identifier</p>
                          <p className="font-mono font-bold text-slate-800">{selected.Mahasiswa?.NIM}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Program Studi / Node asal</p>
                          <p className="font-bold text-slate-700 uppercase flex items-center gap-1.5 mt-0.5">
                            <span className="material-symbols-outlined text-[14px] text-primary/60">business</span>
                            {selected.Mahasiswa?.ProgramStudi?.Nama || 'Institusional'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Substantive Content */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">chat</span> Substansi Aspirasi
                    </h4>
                    <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <span className="material-symbols-outlined text-[80px]" >chat</span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed font-inter relative z-10 whitespace-pre-wrap">
                        "{selected.Isi || 'Tidak ada deskripsi konten.'}"
                      </p>
                    </div>
                  </div>

                  {/* Visual Proof Section */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">image</span> Bukti Lampiran Visual
                    </h4>
                    
                    {selected.BuktiURL ? (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        <div className="md:col-span-5 relative aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-md group">
                          <img 
                            src={getFullUrl(selected.BuktiURL)} 
                            alt="Bukti Aspirasi" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <a 
                              href={getFullUrl(selected.BuktiURL)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-4 py-2 bg-white text-neutral-900 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-1.5 hover:bg-primary hover:text-white transition-all active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[13px]">open_in_new</span> Full View
                            </a>
                          </div>
                        </div>
                        
                        <div className="md:col-span-7 p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col justify-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 font-jakarta">Berkas Lampiran Laporan</p>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            Lampiran pendukung telah disertakan oleh mahasiswa. Silakan periksa gambar secara detail untuk proses pembuktian data laporan.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 rounded-xl border border-dashed border-slate-100 flex flex-col items-center justify-center gap-2 text-slate-300 bg-slate-50/20">
                        <span className="material-symbols-outlined text-[30px]" >image</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tidak ada bukti lampiran gambar</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Governance Panel, Resolution Response Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Governance Card */}
                  <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-200 shadow-sm space-y-6">
                    {/* Status Selection Buttons */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Ubah Status Penanganan</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { val: 'proses', label: 'Proses', icon: 'schedule', active: 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' },
                          { val: 'klarifikasi', label: 'Klarifikasi', icon: 'chat', active: 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-100' },
                          { val: 'selesai', label: 'Setujui & Teruskan', icon: 'check_circle', active: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100' },
                          { val: 'ditolak', label: 'Tolak', icon: 'close', active: 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-100' },
                        ].map(s => (
                          <button 
                            key={s.val} 
                            type="button"
                            onClick={() => setForm({ ...form, status: s.val })}
                            className={cn(
                              'h-12 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 bg-white font-bold uppercase tracking-widest text-[9px] hover:bg-slate-50 hover:text-slate-900 transition-all duration-300',
                              form.status === s.val && s.active
                            )}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }} >{s.icon}</span>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Response Textarea */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Tanggapan Resmi Fakultas</p>
                      <textarea 
                        value={form.respon}
                        onChange={e => setForm({ ...form, respon: e.target.value })}
                        placeholder="Tuliskan tanggapan resmi fakultas yang informatif dan solutif..."
                        className="w-full min-h-[140px] rounded-xl border border-slate-200 bg-white p-4 font-medium text-xs font-inter focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none font-bold text-xs"
                      />
                    </div>

                    {/* Warning SLA Card */}
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start gap-3">
                      <span className="material-symbols-outlined text-amber-600 shrink-0" style={{ fontSize: '16px' }} >error</span>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">SLA Resolution Limit</p>
                        <p className="text-[10px] text-amber-600 font-semibold leading-normal">
                          Proses persetujuan (Setujui & Teruskan) akan meneruskan tiket aspirasi ke Super Admin di tingkat Universitas untuk resolusi akhir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <DialogFooter className="flex flex-col md:flex-row items-center justify-end gap-3 p-8 pt-4 border-t border-slate-100 bg-slate-50/30">
            <Button 
              variant="ghost"
              onClick={() => setSelected(null)}
              className="w-full md:w-auto text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-900 px-8 h-11 rounded-xl active:scale-95 transition-all shadow-none border-none cursor-pointer font-headline uppercase"
            >
              Tutup
            </Button>
            <Button 
              onClick={() => handleUpdateStatus(form.status)}
              disabled={isSubmitting || !form.status}
              className="w-full md:w-auto h-11 px-8 rounded-xl bg-primary hover:bg-bku-hover text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-bku-primary/20 active:scale-95 transition-all gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '15px' }} >sync</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >save</span>
              )}
              Simpan Tanggapan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PageContent>
  )
}

export default FacultyAspirationManagement

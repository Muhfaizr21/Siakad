"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/select"
import { Button } from "./components/button"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const CheckCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;



const API = `${API_BASE_URL}/faculty`

const AVATAR_COLORS = ['from-blue-400 to-indigo-500','from-emerald-400 to-teal-500','from-amber-400 to-orange-500','from-rose-400 to-pink-500','from-violet-400 to-purple-500']
const getInitials = (n='') => n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()||'?'

const LUL_STATUS = {
  Lulus: {cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500'},
  Proses:{cls:'bg-amber-50 text-amber-700 border-amber-200',       dot:'bg-amber-500'},
  Gagal: {cls:'bg-rose-50 text-rose-700 border-rose-200',          dot:'bg-rose-500'},
}
const getLulus = (v='') => LUL_STATUS[v] || LUL_STATUS.Proses

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

const TABS = [
  {key:'prodi',   label:'Breakdown Prodi', icon:GraduationCap},
  {key:'students',label:'Detail Peserta',  icon:Users},
]

export default function FacultyPkkmb() {
  const [activeTab, setTab] = useState('prodi')
  const [loading, setLoading]   = useState(true)
  const [data, setData]         = useState([])
  const [students, setStudents] = useState([])
  const [summary, setSummary]   = useState({ totalMaba:0, totalLulus:0, totalProses:0, totalSertifikat:0 })
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilter]= useState('all')
  const [selected, setSelected] = useState(null)
  
  const [statsDetail, setStatsDetail] = useState(null)
  const [statsSearch, setStatsSearch] = useState('')

  const handleOpenStatsDetail = (key, label) => {
    let list = []
    if (key === 'totalMaba') {
      list = students
    } else if (key === 'totalLulus') {
      list = students.filter(s => s.StatusKelulusan === 'Lulus')
    } else if (key === 'totalSertifikat') {
      list = students.filter(s => s.Mahasiswa?.PkkmbSertifikat !== null && s.Mahasiswa?.PkkmbSertifikat !== undefined)
    } else if (key === 'totalProses') {
      list = students.filter(s => s.StatusKelulusan === 'Proses')
    }
    setStatsDetail({ label, key, list })
    setStatsSearch('')
  }

  const filteredStatsDetailList = useMemo(() => {
    if (!statsDetail) return []
    const q = statsSearch.toLowerCase()
    return statsDetail.list.filter(s => 
      !q || s.Mahasiswa?.Nama?.toLowerCase().includes(q) || s.Mahasiswa?.NIM?.includes(q) || s.Mahasiswa?.ProgramStudi?.Nama?.toLowerCase().includes(q)
    )
  }, [statsDetail, statsSearch])

  // Pagination & Sorting states
  const [currentPage, setCurrentPage]   = useState(1)
  const [pageSize, setPageSize]         = useState(10)
  const [sortConfig, setSortConfig]     = useState({ key: null, direction: 'asc' })

  // Reset pagination when active tab changes
  useEffect(() => {
    setCurrentPage(1)
    setSortConfig(activeTab === 'prodi' ? { key: 'prodi', direction: 'asc' } : { key: 'mahasiswa', direction: 'asc' })
  }, [activeTab])

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API}/ringkasan`)
      const json = await res.json()
      if (json.status === 'success') { setData(json.prodiBreakdown||[]); setSummary(json.stats||{totalMaba:0,totalLulus:0,totalProses:0,totalSertifikat:0}) }
    } catch {}
  }

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/peserta`)
      const json = await res.json()
      if (json.status === 'success') setStudents((json.data||[]).map((s,i)=>({...s, colorIdx: i % AVATAR_COLORS.length})))
    } catch { toast.error('Gagal memuat data peserta') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchSummary(); fetchStudents() }, [])

  const filteredStudents = useMemo(() => students.filter(s => {
    const q = search.toLowerCase()
    const matchQ = !q || s.Mahasiswa?.Nama?.toLowerCase().includes(q) || s.Mahasiswa?.NIM?.includes(q)
    const matchS = filterStatus==='all' || s.StatusKelulusan===filterStatus
    return matchQ && matchS
  }), [students, search, filterStatus])

  const filteredProdi = useMemo(() => data.filter(p => {
    const q = search.toLowerCase()
    return !q || p.prodi?.toLowerCase().includes(q)
  }), [data, search])

  const sortedProdi = useMemo(() => {
    let items = [...filteredProdi]
    if (sortConfig.key !== null && activeTab === 'prodi') {
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
  }, [filteredProdi, sortConfig, activeTab])

  const sortedStudents = useMemo(() => {
    let items = [...filteredStudents]
    if (sortConfig.key !== null && activeTab === 'students') {
      items.sort((a, b) => {
        let aVal, bVal;
        if (sortConfig.key === 'mahasiswa') {
          aVal = a.Mahasiswa?.Nama || ''
          bVal = b.Mahasiswa?.Nama || ''
        } else if (sortConfig.key === 'prodi') {
          aVal = a.Mahasiswa?.ProgramStudi?.Nama || ''
          bVal = b.Mahasiswa?.ProgramStudi?.Nama || ''
        } else {
          aVal = a[sortConfig.key]
          bVal = b[sortConfig.key]
        }

        if (typeof aVal === 'string') aVal = aVal.toLowerCase()
        if (typeof bVal === 'string') bVal = bVal.toLowerCase()

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return items
  }, [filteredStudents, sortConfig, activeTab])

  const paginatedProdi = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedProdi.slice(start, start + pageSize)
  }, [sortedProdi, currentPage, pageSize])

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedStudents.slice(start, start + pageSize)
  }, [sortedStudents, currentPage, pageSize])

  const totalItems = activeTab === 'prodi' ? filteredProdi.length : filteredStudents.length
  const totalPages = Math.ceil(totalItems / pageSize)

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-transparent font-inter">
      <Toaster position="top-right"/>
      <div className="w-full space-y-6">

        {/* ── Page Header ────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-slate-200/50 bg-white/70 backdrop-blur-md shadow-sm">
          {/* Subtle geometric grid background overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/40 to-slate-100/30" />
          <div className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, var(--theme-primary) 1px, transparent 1px), radial-gradient(circle at 80% 20%, var(--theme-primary) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
          {/* Accent glow blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4">
                {/* Clean visual anchor icon */}
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/[0.02] border border-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm relative overflow-hidden group/icon">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300" />
                  <span className="material-symbols-outlined text-primary relative z-10 transition-transform duration-300 group-hover/icon:scale-110" style={{ fontSize: '26px' }}>school</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                      Portal Orientasi Mahasiswa Baru
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {summary.totalMaba} Registrasi Maba
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                    Monitoring <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">PKKMB</span>
                  </h1>
                </div>
              </div>

              {/* Perfectly aligned description block */}
              <p className="text-slate-500 font-medium text-xs md:text-sm max-w-3xl leading-relaxed mt-3 pl-0 md:pl-[72px]">
                Monitor kehadiran, nilai, dan status kelulusan peserta PKKMB per prodi dan per individu.
              </p>
            </div>

            {/* Action and quick count balance box */}
            <div className="flex flex-row lg:flex-col items-end gap-3 shrink-0 self-stretch lg:self-auto justify-between lg:justify-center border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div className="flex items-center gap-2">
                <button onClick={()=>{ fetchSummary(); fetchStudents() }} disabled={loading}
                  className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2">
                  {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }} >sync</span> : <span className="material-symbols-outlined text-primary" style={{ fontSize: 13 }}>sync</span>} Refresh Data
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {key:'totalMaba',       label:'Registrasi Maba',    value:summary.totalMaba,       icon:Users,        bg:'bg-[#eef4ff]',  color:'text-primary',       desc:'Total mahasiswa baru'},
            {key:'totalLulus',      label:'Sertifikasi Lulus',  value:summary.totalLulus,      icon:CheckCircle,  bg:'bg-emerald-50', color:'text-emerald-600',   desc:'Dinyatakan lulus PKKMB'},
            {key:'totalSertifikat', label:'Sertifikat Terbit',  value:summary.totalSertifikat, icon:Award,        bg:'bg-indigo-50',  color:'text-indigo-600',    desc:'Sertifikat telah di-generate'},
            {key:'totalProses',     label:'Dalam Proses',       value:summary.totalProses,     icon:Clock,        bg:'bg-amber-50',   color:'text-amber-600',     desc:'Masih dalam penilaian'},
          ].map(s=>(
            <div
              key={s.label}
              onClick={() => handleOpenStatsDetail(s.key, s.label)}
              className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 cursor-pointer transition-all hover:scale-[1.01] duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', s.bg, s.color)}>
                      <s.icon size={18}/>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors" style={{ fontSize: '16px' }}>arrow_forward</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 leading-none tabular-nums">
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span>
                  ) : (
                    s.value
                  )}
                </p>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-3">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 glass-card border border-slate-200/60 rounded-2xl p-1.5 w-fit shadow-none">
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>{setTab(t.key);setSearch('');setFilter('all')}}
              className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                activeTab===t.key?'bg-primary text-white shadow-lg shadow-bku-primary/25':'text-slate-500 hover:bg-slate-50')}>
              <t.icon size={14}/>{t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card border border-slate-200/60 rounded-2xl shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-black text-sm uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h2)' }}>{activeTab==='prodi'?'Breakdown per Program Studi':'Daftar Peserta PKKMB'}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Menampilkan <span className="font-bold text-slate-900">{activeTab==='prodi'?filteredProdi.length:filteredStudents.length}</span> data</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }} >search</span>
                <input type="text" placeholder={activeTab==='prodi'?'Cari prodi...':'Cari nama atau NIM...'} value={search} onChange={e=>setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-48 rounded-xl border border-slate-200/60 focus:outline-none focus:border-primary text-sm bg-white"/>
              </div>
              {activeTab==='students' && (
                <select value={filterStatus} onChange={e=>setFilter(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer">
                  <option value="all">Semua Status</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Proses">Proses</option>
                  <option value="Gagal">Gagal</option>
                </select>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'prodi' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/60">
                    {[
                      { label: 'No', key: null, sortable: false },
                      { label: 'Program Studi', key: 'prodi', sortable: true },
                      { label: 'Partisipasi', key: 'partisipasi', sortable: true },
                      { label: 'Rata-rata Nilai', key: 'nilai', sortable: true },
                      { label: 'Status', key: 'status', sortable: true },
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
                  {loading?Array.from({length: pageSize}).map((_, i)=>(
                    <tr key={i} className="border-b border-slate-100">{[...Array(5)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-slate-50 rounded animate-pulse"/></td>)}</tr>
                  )):paginatedProdi.length===0?(
                    <tr><td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >school</span></div>
                        <p className="font-bold text-sm text-slate-900">Tidak Ada Prodi</p>
                      </div>
                    </td></tr>
                  ):paginatedProdi.map((row,i)=>(
                    <tr key={i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-sm text-slate-900">{row.prodi}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Sertifikasi Internal</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{width:`${row.partisipasi}%`}}/></div>
                          <span className="text-xs font-black text-slate-900 tabular-nums">{Math.round(row.partisipasi)}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-black text-sm text-slate-900 tabular-nums">{row.nilai?.toFixed(1)||'0.0'}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider',
                          row.status==='Optimal'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-amber-50 text-amber-700 border-amber-200')}>
                          <span className={cn('w-1.5 h-1.5 rounded-full',row.status==='Optimal'?'bg-emerald-500':'bg-amber-500')}/>{row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/60">
                    {[
                      { label: 'No', key: null, sortable: false },
                      { label: 'Mahasiswa', key: 'mahasiswa', sortable: true },
                      { label: 'Program Studi', key: 'prodi', sortable: true },
                      { label: 'Kehadiran', key: 'attendanceRate', sortable: true },
                      { label: 'Nilai', key: 'Nilai', sortable: true },
                      { label: 'Status', key: 'StatusKelulusan', sortable: true },
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
                  {loading?Array.from({length: pageSize}).map((_, i)=>(
                    <tr key={i} className="border-b border-slate-100">{[...Array(7)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-slate-50 rounded animate-pulse"/></td>)}</tr>
                  )):paginatedStudents.length===0?(
                    <tr><td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >group</span></div>
                        <p className="font-bold text-sm text-slate-900">Tidak Ada Peserta</p>
                      </div>
                    </td></tr>
                  ):paginatedStudents.map((row,i)=>{
                    const st = getLulus(row.StatusKelulusan)
                    return (
                      <tr key={row.ID||i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                        <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <StudentAvatar src={getFullUrl(row.Mahasiswa?.FotoURL || row.Mahasiswa?.foto_url || row.Mahasiswa?.Foto || row.Mahasiswa?.Pengguna?.Foto)} name={row.Mahasiswa?.Nama} className="w-9 h-9 rounded-xl" />
                            <div><p className="font-bold text-sm text-slate-900">{row.Mahasiswa?.Nama||'—'}</p><p className="text-[10px] text-slate-400 font-medium">{row.Mahasiswa?.NIM||'—'}</p></div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">{row.Mahasiswa?.ProgramStudi?.Nama||'—'}</td>
                        <td className="px-5 py-3.5 font-black text-sm text-slate-900 tabular-nums">{row.attendanceRate||0}%</td>
                        <td className="px-5 py-3.5 font-black text-sm text-primary tabular-nums">{row.Nilai||0}</td>
                        <td className="px-5 py-3.5">
                          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider',st.cls)}>
                            <span className={cn('w-1.5 h-1.5 rounded-full',st.dot)}/>{row.StatusKelulusan||'Proses'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={()=>setSelected(row)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >visibility</span></button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
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

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="relative w-full max-w-md glass-card rounded-2xl shadow-none border border-slate-200/60 flex flex-col overflow-hidden max-h-[90vh]" onClick={e=>e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-bku-primary to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"/>
              <button onClick={()=>setSelected(null)} className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span></button>
              <div className="relative z-10 flex items-center gap-4">
                <StudentAvatar src={getFullUrl(selected.Mahasiswa?.FotoURL || selected.Mahasiswa?.foto_url || selected.Mahasiswa?.Foto || selected.Mahasiswa?.Pengguna?.Foto)} name={selected.Mahasiswa?.Nama} className="w-14 h-14 rounded-2xl shadow-xl ring-2 ring-white/20" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Peserta PKKMB</p>
                  <h2 className="text-base font-extrabold font-headline leading-tight" style={{ color: 'var(--theme-h2)' }}>{selected.Mahasiswa?.Nama}</h2>
                  <p className="text-xs text-blue-200 font-medium mt-0.5">{selected.Mahasiswa?.NIM} · {selected.Mahasiswa?.ProgramStudi?.Nama||'—'}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {[
                {icon:Activity,      label:'Kehadiran',       value:`${selected.attendanceRate||0}%`},
                {icon:GraduationCap, label:'Nilai Akhir',     value: selected.Nilai||0},
                {icon:CheckCircle,   label:'Status Kelulusan',value: selected.StatusKelulusan||'Proses'},
              ].map(r=>(
                <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-all">
                  <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm border border-slate-100 flex-shrink-0"><r.icon size={13}/></div>
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">{r.label}</p>
                    <p className="text-sm font-semibold text-slate-900">{r.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-200/60 bg-transparent flex-shrink-0">
              <button onClick={()=>setSelected(null)} className="w-full h-11 rounded-xl bg-primary hover:bg-bku-hover text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Detail Modal */}
      {statsDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={()=>setStatsDetail(null)}>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[85vh]" onClick={e=>e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-[#00236F] to-[#003db5] pt-6 pb-6 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"/>
              <button onClick={()=>setStatsDetail(null)} className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-white" style={{ fontSize: '15px' }} >close</span></button>
              <div className="relative z-10">
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Rincian Data</p>
                <h2 className="text-lg font-extrabold text-white leading-tight">{statsDetail.label}</h2>
                <p className="text-xs text-blue-200 font-medium mt-1">Menampilkan {filteredStatsDetailList.length} mahasiswa dari total {statsDetail.list.length} entri</p>
              </div>
            </div>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '15px' }} >search</span>
                <input type="text" placeholder="Cari nama, NIM, atau prodi..." value={statsSearch} onChange={e=>setStatsSearch(e.target.value)}
                  className="pl-9 pr-4 h-10 w-full rounded-xl border border-slate-200/60 focus:outline-none focus:border-primary text-sm bg-white placeholder-slate-400 font-semibold"/>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredStatsDetailList.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >group</span></div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">Tidak ada hasil cocok</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-0.5">Coba kata kunci pencarian lain atau data sedang kosong.</p>
                  </div>
                </div>
              ) : (
                filteredStatsDetailList.map((row, i) => (
                  <div key={row.ID||i} className="p-3 bg-slate-50/50 border border-slate-100/70 rounded-2xl hover:bg-white hover:border-slate-200 transition-all flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <StudentAvatar src={getFullUrl(row.Mahasiswa?.FotoURL || row.Mahasiswa?.foto_url || row.Mahasiswa?.Foto || row.Mahasiswa?.Pengguna?.Foto)} name={row.Mahasiswa?.Nama} className="w-9 h-9 rounded-xl" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 leading-tight truncate">{row.Mahasiswa?.Nama||'—'}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{row.Mahasiswa?.NIM||'—'} · {row.Mahasiswa?.ProgramStudi?.Nama||'—'}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {statsDetail.key === 'totalSertifikat' && row.Mahasiswa?.PkkmbSertifikat ? (
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider">
                            <span className="material-symbols-outlined" style={{ fontSize: '10px' }} >check_circle</span>
                            Tersedia
                          </span>
                          {row.Mahasiswa?.PkkmbSertifikat?.FileURL && (
                            <a href={getFullUrl(row.Mahasiswa.PkkmbSertifikat.FileURL)} target="_blank" rel="noreferrer" className="text-[10px] text-primary font-bold hover:underline mt-1 flex items-center gap-0.5">
                              <span className="material-symbols-outlined" style={{ fontSize: '10px' }} >download</span> Download
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-black text-slate-800 tabular-nums">Nilai: {row.Nilai||0}</span>
                          <span className="text-[9px] font-bold text-slate-400 mt-0.5">Hadir: {row.attendanceRate||0}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
              <button onClick={()=>setStatsDetail(null)} className="w-full h-11 rounded-xl bg-primary hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-sm">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

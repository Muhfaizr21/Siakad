"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { API_BASE_URL, fetchWithAuth } from '../../services/api'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { PageContent } from '@/components/ui/page'
import Dialog, { DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/Dialog"
import { DashboardHero } from '@/components/ui/dashboard'

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
  Lulus: {cls:'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success)]/20', dot:'bg-[var(--theme-success)]'},
  Proses:{cls:'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning)]/20', dot:'bg-[var(--theme-warning)]'},
  Gagal: {cls:'bg-[var(--theme-error-light)] text-[var(--theme-error)] border-[var(--theme-error)]/20', dot:'bg-[var(--theme-error)]'},
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

const parseDay = (dateStr) => {
  if (!dateStr) return '--';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return match[3];
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return String(d.getDate()).padStart(2, '0');
  }
  return '--';
}

const formatFullDate = (dateStr) => {
  if (!dateStr) return '-';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    const year = match[1];
    const month = months[parseInt(match[2], 10) - 1] || match[2];
    const day = match[3];
    return `${day} ${month} ${year}`;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return dateStr;
}

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
  const [distribusi, setDistribusi] = useState({ Lulus: 0, Proses: 0, Gagal: 0, Total: 0 })
  const [angkatanStats, setAngkatanStats] = useState([])
  const [genderStats, setGenderStats] = useState([])
  const [nilaiDist, setNilaiDist] = useState([])
  const [kegiatanList, setKegiatanList] = useState([])
  const [batasNilai, setBatasNilai] = useState(70)

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
      const json = await fetchWithAuth(`${API}/ringkasan`)
      if (json.status === 'success') {
        setData(json.prodiBreakdown||[])
        setSummary(json.stats||{totalMaba:0,totalLulus:0,totalProses:0,totalSertifikat:0})
        setDistribusi(json.distribusi||{Lulus:0,Proses:0,Gagal:0,Total:0})
        setAngkatanStats(json.angkatanStats||[])
        setGenderStats(json.genderStats||[])
        setNilaiDist(json.nilaiDist||[])
        setKegiatanList(json.kegiatanList||[])
        setBatasNilai(json.batasNilai||70)
      }
    } catch {}
  }

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const json = await fetchWithAuth(`${API}/peserta`)
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
    <PageContent>
      <Toaster position="top-right"/>

      <DashboardHero
        icon="school"
        title="Monitoring "
        highlightedTitle="PKKMB"
        subtitle="Monitor kehadiran, nilai, dan status kelulusan peserta PKKMB per prodi dan per individu."
        badges={[
          { label: 'Portal Orientasi Mahasiswa Baru', active: false },
          { label: `${summary.totalMaba} Registrasi Maba`, active: true }
        ]}
        actions={
          <button onClick={() => { fetchSummary(); fetchStudents() }} disabled={loading}
            className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2">
            {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }}>sync</span> : <span className="material-symbols-outlined text-primary" style={{ fontSize: 13 }}>sync</span>} Refresh Data
          </button>
        }
      />
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

        {/* NEW: 5W1H Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* WHAT → Distribusi Status (Donut/Pie Chart) */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Distribusi Status</h3>

              </div>
            </div>
            {/* Simple Donut visualization */}
            <div className="flex items-center justify-center gap-4">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  {distribusi.Total > 0 ? (
                    <>
                      {/* Lulus - emerald */}
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${(distribusi.Lulus/distribusi.Total)*100} ${100-(distribusi.Lulus/distribusi.Total)*100}`} strokeDashoffset="0" transform="rotate(-90 18 18)"/>
                      {/* Proses - amber */}
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray={`${(distribusi.Proses/distribusi.Total)*100} ${100-(distribusi.Proses/distribusi.Total)*100}`} strokeDashoffset={`-${(distribusi.Lulus/distribusi.Total)*100}`} transform="rotate(-90 18 18)"/>
                      {/* Gagal - rose */}
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f43f5e" strokeWidth="3" strokeDasharray={`${(distribusi.Gagal/distribusi.Total)*100} ${100-(distribusi.Gagal/distribusi.Total)*100}`} strokeDashoffset={`-${(distribusi.Lulus/distribusi.Total + distribusi.Proses/distribusi.Total)*100}`} transform="rotate(-90 18 18)"/>
                    </>
                  ) : (
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                  )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-extrabold text-slate-900">{distribusi.Total}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"/>
                  <span className="text-xs font-medium text-slate-600">Lulus: {distribusi.Lulus}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"/>
                  <span className="text-xs font-medium text-slate-600">Proses: {distribusi.Proses}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"/>
                  <span className="text-xs font-medium text-slate-600">Gagal: {distribusi.Gagal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* WHAT → Distribusi Nilai (Bar Chart) */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Distribusi Nilai</h3>

              </div>
            </div>
            {/* Horizontal Bar Chart */}
            <div className="space-y-2">
              {nilaiDist.length > 0 ? nilaiDist.map((item, i) => {
                const maxCount = Math.max(...nilaiDist.map(d => d.count), 1)
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 w-12">{item.range}</span>
                    <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all" style={{width:`${(item.count/maxCount)*100}%`}}/>
                    </div>
                    <span className="text-xs font-black text-slate-700 w-8 text-right">{item.count}</span>
                  </div>
                )
              }) : (
                <div className="text-center py-8 text-xs text-slate-400">Tidak ada data nilai</div>
              )}
            </div>
          </div>

          {/* WHO → Breakdown Gender */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Per Gender</h3>

              </div>
            </div>
            <div className="space-y-3">
              {genderStats.filter(item => item.gender === 'Laki-laki' || item.gender === 'Perempuan').length > 0 ? genderStats.filter(item => item.gender === 'Laki-laki' || item.gender === 'Perempuan').map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.gender === 'Laki-laki' ? '♂' : item.gender === 'Perempuan' ? '♀' : '?'}</span>
                    <span className="text-sm font-bold text-slate-700">{item.gender || 'Unknown'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-slate-900">{item.total}</span>
                    <span className="text-[10px] text-emerald-600 ml-1">({item.lulus} lulus)</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-xs text-slate-400">Tidak ada data gender</div>
              )}
            </div>
          </div>

          {/* WHO → Per Angkatan */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Per Angkatan</h3>

              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {angkatanStats.length > 0 ? angkatanStats.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-bold text-slate-700">{item.angkatan}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-emerald-600 font-medium">{item.lulus} lulus</span>
                    <span className="text-sm font-extrabold text-slate-900">{item.total}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-xs text-slate-400">Tidak ada data angkatan</div>
              )}
            </div>
          </div>

          {/* WHEN → Timeline Kegiatan */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>event</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Agenda Kegiatan</h3>

              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {kegiatanList.length > 0 ? kegiatanList.map((k, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-indigo-600">{parseDay(k.tanggal)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate" title={k.nama || 'Tidak ada nama'}>{k.nama||'Tidak ada nama'}</p>
                    <p className="text-[10px] text-slate-400 truncate" title={`${formatFullDate(k.tanggal)} · ${k.lokasi || '-'}`}>{formatFullDate(k.tanggal)} · {k.lokasi||'-'}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-xs text-slate-400">Tidak ada agenda</div>
              )}
            </div>
          </div>

          {/* HOW → Batas Nilai */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>workspace_premium</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Batas Kelulusan</h3>

              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#14b8a6" strokeWidth="3" strokeDasharray="75 25" strokeDashoffset="0" transform="rotate(-90 18 18)"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-extrabold text-teal-600">{batasNilai}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3 font-medium">Nilai minimum untuk lulus</p>
              <p className="text-[10px] text-slate-400 mt-1">Di bawah ini = Gagal</p>
            </div>
          </div>
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
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider whitespace-nowrap',
                          row.status==='Optimal'?'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success)]/20':'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning)]/20')}>
                          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0',row.status==='Optimal'?'bg-[var(--theme-success)]':'bg-[var(--theme-warning)]')}/>{row.status}
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
                          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider whitespace-nowrap',st.cls)}>
                            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0',st.dot)}/>{row.StatusKelulusan||'Proses'}
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

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)} maxWidth="max-w-md">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-4">
            <StudentAvatar 
              src={getFullUrl(selected?.Mahasiswa?.FotoURL || selected?.Mahasiswa?.foto_url || selected?.Mahasiswa?.Foto || selected?.Mahasiswa?.Pengguna?.Foto)} 
              name={selected?.Mahasiswa?.Nama} 
              className="w-14 h-14 rounded-2xl shadow-xl ring-2 ring-white/20" 
            />
            <div className="min-w-0">
              <DialogTitle className="text-base font-extrabold font-headline leading-tight">{selected?.Mahasiswa?.Nama}</DialogTitle>
              <DialogDescription className="text-xs text-[var(--theme-text-muted)] font-medium mt-0.5">
                {selected?.Mahasiswa?.NIM} · {selected?.Mahasiswa?.ProgramStudi?.Nama||'—'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogContent className="p-6 space-y-3 overflow-y-auto max-h-[50vh]">
          {selected && [
            {icon:Activity,      label:'Kehadiran',       value:`${selected.attendanceRate||0}%`},
            {icon:GraduationCap, label:'Nilai Akhir',     value: selected.Nilai||0},
            {icon:CheckCircle,   label:'Status Kelulusan',value: selected.StatusKelulusan||'Proses'},
          ].map(r=>(
            <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--theme-bg)]/50 border border-[var(--theme-border)] hover:bg-white hover:shadow-sm transition-all">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[var(--theme-primary)] shadow-sm border border-[var(--theme-border)] flex-shrink-0"><r.icon size={13}/></div>
              <div className="flex-1">
                <p className="text-[9px] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.15em]">{r.label}</p>
                <p className="text-sm font-semibold text-[var(--theme-text)]">{r.value}</p>
              </div>
            </div>
          ))}
        </DialogContent>
        <DialogFooter>
          <button 
            onClick={()=>setSelected(null)} 
            className="w-full h-10 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
          >
            Tutup
          </button>
        </DialogFooter>
      </Dialog>

      {/* Stats Detail Modal */}
      <Dialog open={!!statsDetail} onOpenChange={(open) => !open && setStatsDetail(null)} maxWidth="max-w-lg">
        <DialogHeader>
          <DialogTitle>{statsDetail?.label}</DialogTitle>
          <DialogDescription>
            Menampilkan {filteredStatsDetailList.length} mahasiswa dari total {statsDetail?.list?.length || 0} entri
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]/50 flex-shrink-0">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-subtle)]" style={{ fontSize: '15px' }} >search</span>
            <input 
              type="text" 
              placeholder="Cari nama, NIM, atau prodi..." 
              value={statsSearch} 
              onChange={e=>setStatsSearch(e.target.value)}
              className="pl-9 pr-4 h-10 w-full rounded-xl border border-[var(--theme-border)] focus:outline-none focus:border-primary text-sm bg-white placeholder-[var(--theme-text-subtle)] font-semibold text-[var(--theme-text)] focus:ring-2 focus:ring-[var(--theme-primary-light)]"
            />
          </div>
        </div>
        <DialogContent className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[50vh]">
          {filteredStatsDetailList.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl flex items-center justify-center text-[var(--theme-text-subtle)]">
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }} >group</span>
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--theme-text)]">Tidak ada hasil cocok</p>
                <p className="text-xs text-[var(--theme-text-muted)] max-w-xs mt-0.5">Coba kata kunci pencarian lain atau data sedang kosong.</p>
              </div>
            </div>
          ) : (
            filteredStatsDetailList.map((row, i) => (
              <div key={row.ID||i} className="p-3 bg-[var(--theme-bg)]/50 border border-[var(--theme-border)] rounded-2xl hover:bg-white hover:border-[var(--theme-primary-hover)]/30 hover:shadow-sm transition-all flex items-center justify-between gap-3 shadow-none">
                <div className="flex items-center gap-3 min-w-0">
                  <StudentAvatar src={getFullUrl(row.Mahasiswa?.FotoURL || row.Mahasiswa?.foto_url || row.Mahasiswa?.Foto || row.Mahasiswa?.Pengguna?.Foto)} name={row.Mahasiswa?.Nama} className="w-9 h-9 rounded-xl" />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[var(--theme-text)] leading-tight truncate">{row.Mahasiswa?.Nama||'—'}</p>
                    <p className="text-[10px] text-[var(--theme-text-muted)] font-semibold mt-0.5">{row.Mahasiswa?.NIM||'—'} · {row.Mahasiswa?.ProgramStudi?.Nama||'—'}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {statsDetail?.key === 'totalSertifikat' && row.Mahasiswa?.PkkmbSertifikat ? (
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center gap-1 bg-[var(--theme-success-light)] border border-[var(--theme-success)]/20 text-[var(--theme-success)] font-semibold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider">
                        <span className="material-symbols-outlined" style={{ fontSize: '10px' }} >check_circle</span>
                        Tersedia
                      </span>
                      {row.Mahasiswa?.PkkmbSertifikat?.FileURL && (
                        <a href={getFullUrl(row.Mahasiswa.PkkmbSertifikat.FileURL)} target="_blank" rel="noreferrer" className="text-[10px] text-[var(--theme-primary)] font-semibold hover:underline mt-1 flex items-center gap-0.5">
                          <span className="material-symbols-outlined" style={{ fontSize: '10px' }} >download</span> Download
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-[var(--theme-text)] tabular-nums">Nilai: {row.Nilai||0}</span>
                      <span className="text-[9px] font-semibold text-[var(--theme-text-muted)] mt-0.5">Hadir: {row.attendanceRate||0}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </DialogContent>
        <DialogFooter>
          <button 
            onClick={()=>setStatsDetail(null)} 
            className="w-full h-10 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
          >
            Tutup
          </button>
        </DialogFooter>
      </Dialog>
    </PageContent>
  )
}

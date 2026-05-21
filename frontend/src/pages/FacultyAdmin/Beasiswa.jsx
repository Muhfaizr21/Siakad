"use client"

import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/select"
import { Button } from "./components/button"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Download = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const UserCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>how_to_reg</span>;



const API = `${API_BASE_URL}/faculty`

const AVATAR_COLORS = [
  'from-blue-400 to-indigo-500','from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500','from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500','from-cyan-400 to-sky-500',
]
const getInitials = (n='') => n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()||'?'

const APP_STATUS = {
  diterima:{ cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500', label:'Diterima' },
  ditolak: { cls:'bg-rose-50 text-rose-700 border-rose-200',         dot:'bg-rose-500',    label:'Ditolak'  },
  proses:  { cls:'bg-amber-50 text-amber-700 border-amber-200',      dot:'bg-amber-500',   label:'Proses'   },
}
const getAppStatus = (v='') => APP_STATUS[(v||'proses').toLowerCase()] || APP_STATUS.proses

const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) } catch { return d } }

export default function FacultyScholarship() {
  const [activeTab, setActiveTab]       = useState('programs')
  const [scholarships, setScholarships] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [selectedApp, setSelectedApp]   = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch]             = useState('')
  const [appForm, setAppForm]           = useState({ Status:'proses', Catatan:'' })

  const [currentPage, setCurrentPage]   = useState(1)
  const [pageSize, setPageSize]         = useState(10)
  const [sortConfig, setSortConfig]     = useState({ key: 'Nama', direction: 'asc' })

  useEffect(() => {
    setCurrentPage(1)
    setSortConfig(activeTab === 'programs' ? { key: 'Nama', direction: 'asc' } : { key: 'Mahasiswa.Nama', direction: 'asc' })
  }, [activeTab])

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'programs') {
        const res = await axios.get(`${API}/scholarships`)
        setScholarships(res.data.data || [])
      } else {
        const res = await axios.get(`${API}/scholarships/applications`)
        setApplications((res.data.data||[]).map((a,i)=>({...a, colorIdx: i % AVATAR_COLORS.length})))
      }
    } catch { toast.error('Gagal mengambil data') }
    finally { setLoading(false) }
  }

  const handleAppUpdate = async () => {
    if (!selectedApp?.ID) return
    setIsSubmitting(true)
    try {
      await axios.put(`${API}/scholarships/applications/${selectedApp.ID}`, appForm)
      toast.success('Status diperbarui')
      setSelectedApp(null); fetchData()
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal memperbarui status') }
    finally { setIsSubmitting(false) }
  }

  useEffect(() => { fetchData() }, [activeTab])

  const filteredPrograms = useMemo(() => scholarships.filter(s => {
    const q = search.toLowerCase()
    return !q || s.Nama?.toLowerCase().includes(q) || s.Penyelenggara?.toLowerCase().includes(q)
  }), [scholarships, search])

  const filteredApps = useMemo(() => applications.filter(a => {
    const q = search.toLowerCase()
    return !q || a.Mahasiswa?.Nama?.toLowerCase().includes(q) || a.Mahasiswa?.NIM?.includes(q)
  }), [applications, search])

  const sortedPrograms = useMemo(() => {
    let items = [...filteredPrograms]
    if (sortConfig.key !== null && activeTab === 'programs') {
      items.sort((a, b) => {
        let aVal = getNestedValue(a, sortConfig.key)
        let bVal = getNestedValue(b, sortConfig.key)

        if (typeof aVal === 'string') aVal = aVal.toLowerCase()
        if (typeof bVal === 'string') bVal = bVal.toLowerCase()

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return items
  }, [filteredPrograms, sortConfig, activeTab])

  const sortedApps = useMemo(() => {
    let items = [...filteredApps]
    if (sortConfig.key !== null && activeTab === 'applications') {
      items.sort((a, b) => {
        let aVal = getNestedValue(a, sortConfig.key)
        let bVal = getNestedValue(b, sortConfig.key)

        if (typeof aVal === 'string') aVal = aVal.toLowerCase()
        if (typeof bVal === 'string') bVal = bVal.toLowerCase()

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return items
  }, [filteredApps, sortConfig, activeTab])

  const paginatedPrograms = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedPrograms.slice(start, start + pageSize)
  }, [sortedPrograms, currentPage, pageSize])

  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedApps.slice(start, start + pageSize)
  }, [sortedApps, currentPage, pageSize])

  const totalItems = activeTab === 'programs' ? filteredPrograms.length : filteredApps.length
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
    totalPrograms: scholarships.length,
    aktif:         scholarships.filter(s => new Date(s.Deadline) > new Date()).length,
    pendaftar:     applications.filter(a => (a.Status||'proses').toLowerCase()==='proses').length,
    lolos:         applications.filter(a => (a.Status||'').toLowerCase()==='diterima').length,
  }

  const TABS = [
    { key:'programs',     label:'Program Beasiswa', icon:GraduationCap },
    { key:'applications', label:'Review Pendaftar',  icon:Users },
  ]

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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Program Bantuan Akademik</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
                Manajemen <span className="text-primary">Beasiswa</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">
                Kelola program beasiswa dan verifikasi pendaftaran mahasiswa di lingkungan fakultas.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => alert('Ekspor...')}
                className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm">
                <Download size={14} className="text-primary" /> Ekspor
              </button>
              <button onClick={fetchData} disabled={loading}
                className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60">
                {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <RefreshCw size={14} className="text-primary"/>}
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:'Total Beasiswa', value:stats.totalPrograms, icon:GraduationCap, bg:'bg-[#eef4ff]',  color:'text-[#00236F]',   desc:'Program terdaftar' },
            { label:'Program Aktif',  value:stats.aktif,         icon:Clock,         bg:'bg-emerald-50', color:'text-emerald-600', desc:'Deadline belum lewat' },
            { label:'Pendaftar Baru', value:stats.pendaftar,     icon:Users,         bg:'bg-amber-50',   color:'text-amber-600',   desc:'Sedang diproses' },
            { label:'Lolos Seleksi',  value:stats.lolos,         icon:UserCheck,     bg:'bg-indigo-50',  color:'text-indigo-600',  desc:'Diterima beasiswa' },
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

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-[#e5e5e5] rounded-2xl p-1.5 w-fit shadow-sm">
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setSearch('') }}
              className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                activeTab===t.key ? 'bg-[#00236F] text-white shadow-lg shadow-[#00236F]/25' : 'text-[#737373] hover:bg-[#f5f5f5]')}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0f0f0] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-base text-[#171717]">
                {activeTab==='programs' ? 'Daftar Program Beasiswa' : 'Daftar Pendaftar Beasiswa'}
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Menampilkan <span className="font-bold text-[#171717]">
                  {activeTab==='programs' ? filteredPrograms.length : filteredApps.length}
                </span> dari <span className="font-bold text-primary">
                  {activeTab==='programs' ? scholarships.length : applications.length}
                </span> data
              </p>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" style={{ fontSize: '14px' }} >search</span>
              <input type="text" placeholder={activeTab==='programs' ? 'Cari nama beasiswa...' : 'Cari mahasiswa atau NIM...'}
                value={search} onChange={e=>setSearch(e.target.value)}
                className="pl-9 pr-4 h-9 w-52 rounded-xl border border-[#e5e5e5] focus:outline-none focus:border-primary text-sm bg-white"/>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'programs' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#e5e5e5]">
                    {[
                      { label: '#', key: null, sortable: false },
                      { label: 'Program Beasiswa', key: 'Nama', sortable: true },
                      { label: 'Penyelenggara', key: 'Penyelenggara', sortable: true },
                      { label: 'Kapasitas', key: 'Kuota', sortable: true },
                      { label: 'Deadline', key: 'Deadline', sortable: true },
                      { label: 'Status', key: null, sortable: false },
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
                      {[...Array(6)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-[#f5f5f5] rounded animate-pulse"/></td>)}
                    </tr>
                  )) : paginatedPrograms.length===0 ? (
                    <tr><td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >school</span></div>
                        <p className="font-bold text-sm text-[#171717]">Tidak Ada Program Beasiswa</p>
                        <p className="text-xs text-[#a3a3a3]">Belum ada program beasiswa yang terdaftar.</p>
                      </div>
                    </td></tr>
                  ) : paginatedPrograms.map((row,i) => {
                    const isAktif = new Date(row.Deadline) > new Date()
                    return (
                      <tr key={row.ID||i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                        <td className="px-5 py-3.5 text-sm text-[#a3a3a3] font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-sm text-[#171717]">{row.Nama}</p>
                          <p className="text-[10px] text-[#a3a3a3] font-medium mt-0.5">Min. IPK {row.MinIPK||'3.00'}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-[#525252] font-medium">{row.Penyelenggara||'—'}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-black text-[#171717] tabular-nums">
                            {row.acceptedCount||0} / {row.Kuota||0}
                          </span>
                          <span className="text-[10px] text-[#a3a3a3] ml-1">slot</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                            {formatDate(row.Deadline)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider',
                            isAktif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200')}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', isAktif?'bg-emerald-500':'bg-slate-400')}/>
                            {isAktif ? 'Aktif' : 'Selesai'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#e5e5e5]">
                    {[
                      { label: '#', key: null, sortable: false },
                      { label: 'Pendaftar', key: 'Mahasiswa.Nama', sortable: true },
                      { label: 'Program Beasiswa', key: 'Beasiswa.Nama', sortable: true },
                      { label: 'Berkas', key: null, sortable: false },
                      { label: 'Status', key: 'Status', sortable: true },
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
                      {[...Array(6)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-[#f5f5f5] rounded animate-pulse"/></td>)}
                    </tr>
                  )) : paginatedApps.length===0 ? (
                    <tr><td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >group</span></div>
                        <p className="font-bold text-sm text-[#171717]">Belum Ada Pendaftar</p>
                        <p className="text-xs text-[#a3a3a3]">Tidak ada mahasiswa yang mendaftar beasiswa.</p>
                      </div>
                    </td></tr>
                  ) : paginatedApps.map((row,i) => {
                    const st = getAppStatus(row.Status)
                    return (
                      <tr key={row.ID||i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                        <td className="px-5 py-3.5 text-sm text-[#a3a3a3] font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 shadow-sm', AVATAR_COLORS[row.colorIdx])}>
                              {getInitials(row.Mahasiswa?.Nama)}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#171717]">{row.Mahasiswa?.Nama||'—'}</p>
                              <p className="text-[10px] text-[#a3a3a3] font-medium">{row.Mahasiswa?.NIM||'—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-[#525252] font-medium">{row.Beasiswa?.Nama||'—'}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          {row.FileURL ? (
                            <a href={row.FileURL} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                              <span className="material-symbols-outlined" style={{ fontSize: '13px' }} >description</span> Lihat Berkas
                            </a>
                          ) : <span className="text-xs text-[#c4c4c4] italic">Tidak ada</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider', st.cls)}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', st.dot)}/>{st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={()=>{setSelectedApp(row);setAppForm({Status:row.Status||'proses',Catatan:row.Catatan||''})}}
                            className="p-1.5 text-[#a3a3a3] hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors" title="Review">
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>chevron_right</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
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

      {/* Review Application Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={()=>setSelectedApp(null)}>
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]"
            onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"/>
              <button onClick={()=>setSelectedApp(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span>
              </button>
              <div className="relative z-10 flex items-center gap-4 mb-4">
                <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-white text-base font-black shadow-xl ring-2 ring-white/20', AVATAR_COLORS[selectedApp.colorIdx])}>
                  {getInitials(selectedApp.Mahasiswa?.Nama)}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Validasi Seleksi</p>
                  <h2 className="text-base font-extrabold text-white leading-tight">{selectedApp.Mahasiswa?.Nama}</h2>
                  <p className="text-xs text-blue-200 font-medium mt-0.5">{selectedApp.Beasiswa?.Nama||'—'}</p>
                </div>
              </div>
              {selectedApp.FileURL && (
                <div className="relative z-10">
                  <a href={selectedApp.FileURL} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white hover:bg-white/20 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '11px' }} >description</span> Lihat Berkas Pendaftaran <span className="material-symbols-outlined" style={{ fontSize: 10 }}>open_in_new</span>
                  </a>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Keputusan */}
              <div>
                <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-2">Keputusan Seleksi</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {v:'proses',   label:'Proses',   cls:'border-amber-300 bg-amber-50 text-amber-700'},
                    {v:'diterima', label:'Diterima',  cls:'border-emerald-300 bg-emerald-50 text-emerald-700'},
                    {v:'ditolak',  label:'Ditolak',   cls:'border-rose-300 bg-rose-50 text-rose-700'},
                  ].map(opt=>(
                    <button key={opt.v} onClick={()=>setAppForm(f=>({...f,Status:opt.v}))}
                      className={cn('h-11 rounded-xl border-2 text-xs font-bold uppercase tracking-wider transition-all',
                        appForm.Status===opt.v ? opt.cls+' scale-[1.02] shadow-sm' : 'border-[#e5e5e5] bg-white text-[#a3a3a3] hover:border-[#c5c5c5]')}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-2">Catatan Reviewer</label>
                <textarea value={appForm.Catatan} onChange={e=>setAppForm(f=>({...f,Catatan:e.target.value}))} rows={4}
                  placeholder="Berikan alasan keputusan atau catatan perbaikan..."
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] focus:outline-none focus:border-primary focus:bg-white text-sm text-[#171717] transition-all resize-none"/>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex gap-3 flex-shrink-0">
              <button onClick={()=>setSelectedApp(null)}
                className="flex-1 h-11 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold text-[#525252] uppercase tracking-widest hover:bg-[#f5f5f5] transition-all">
                Batal
              </button>
              <button onClick={handleAppUpdate} disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-[#00236F] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#00236F]/20 disabled:opacity-60 flex items-center justify-center gap-2">
                {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >save</span>}
                Simpan Keputusan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
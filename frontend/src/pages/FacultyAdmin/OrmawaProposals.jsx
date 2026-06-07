"use client"

import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const ExternalLink = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>open_in_new</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const FileText = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>description</span>;
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const ShieldCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>verified_user</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const XCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>cancel</span>;



const API = "/faculty"
const formatIDR = (n) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(n||0)
const formatDate = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const PROPOSAL_STATUS = {
  disetujui_fakultas: {cls:'bg-indigo-50 text-indigo-700 border-indigo-200',   dot:'bg-indigo-500',  label:'ACC Fakultas'},
  disetujui_univ:     {cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500', label:'Disyahkan Univ'},
  revisi:             {cls:'bg-blue-50 text-blue-700 border-blue-200',          dot:'bg-blue-500',    label:'Revisi'},
  ditolak:            {cls:'bg-rose-50 text-rose-700 border-rose-200',          dot:'bg-rose-500',    label:'Ditolak'},
  diajukan:           {cls:'bg-amber-50 text-amber-700 border-amber-200',       dot:'bg-amber-500',   label:'Diajukan'},
}
const getStatus = (v='') => PROPOSAL_STATUS[(v||'diajukan').toLowerCase()] || PROPOSAL_STATUS.diajukan

export default function FacultyProposalApproval() {
  const [proposals, setProposals] = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [isSubmitting, setIsSub]  = useState(false)
  const [catatan, setCatatan]     = useState('')
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilter] = useState('all')
  const [currentPage, setCurrentPage]   = useState(1)
  const [pageSize, setPageSize]         = useState(10)
  const [sortConfig, setSortConfig]     = useState({ key: 'CreatedAt', direction: 'desc' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/ormawa/proposals`)
      if (res.data.status === 'success') setProposals(res.data.data||[])
    } catch { toast.error('Gagal mengambil data proposal') }
    finally { setLoading(false) }
  }

  const handleUpdateStatus = async (status) => {
    if (!selected) return
    setIsSub(true)
    try {
      const res = await axios.put(`${API}/ormawa/proposals/${selected.id || selected.ID}`, { status: status, catatan_admin: catatan })
      if (res.data.status === 'success') { toast.success(`Proposal berhasil ${status === 'disetujui_fakultas' ? 'disetujui dan diteruskan ke Universitas' : status}`); setSelected(null); fetchData() }
      else toast.error(res.data.message||'Gagal update')
    } catch (e) { toast.error(e.response?.data?.message||'Server sibuk') }
    finally { setIsSub(false) }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = useMemo(() => proposals.filter(p => {
    const q = search.toLowerCase()
    const org = p.Ormawa||p.ormawa||p.Organisasi||{}
    const matchQ = !q || p.Judul?.toLowerCase().includes(q) || (org.Nama||org.nama||'').toLowerCase().includes(q)
    const matchS = filterStatus==='all' || (p.Status||'pending').toLowerCase()===filterStatus
    return matchQ && matchS
  }), [proposals, search, filterStatus])

  const sorted = useMemo(() => {
    let items = [...filtered]
    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        let aVal, bVal;
        if (sortConfig.key === 'ormawa') {
          const aOrg = a.Ormawa||a.ormawa||a.Organisasi||{}
          const bOrg = b.Ormawa||b.ormawa||b.Organisasi||{}
          aVal = aOrg.Nama||aOrg.nama||aOrg.NamaOrg||''
          bVal = bOrg.Nama||bOrg.nama||bOrg.NamaOrg||''
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
    total: proposals.length,
    totalBudget: proposals.reduce((a,p)=>a+(p.Anggaran||0),0),
    accFakultas: proposals.filter(p=>p.Status==='disetujui_fakultas').length,
    accUniv: proposals.filter(p=>p.Status==='disetujui_univ').length,
  }

  const approvalRate = stats.total > 0 ? Math.round(((stats.accFakultas + stats.accUniv) / stats.total) * 100) : 0

  const statusDistribution = useMemo(() => {
    const counts = {}
    proposals.forEach(p => {
      const s = (p.Status || 'pending').toLowerCase()
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts).map(([key, value]) => ({
      name: getStatus(key).label,
      value
    }))
  }, [proposals])

  const topOrmawaData = useMemo(() => {
    const counts = {}
    proposals.forEach(p => {
      const org = p.Ormawa || p.ormawa || p.Organisasi || {}
      const name = org.Nama || org.nama || org.NamaOrg || 'Unknown'
      counts[name] = (counts[name] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }))
  }, [proposals])

  const monthlyTrendData = useMemo(() => {
    const byMonth = {}
    proposals.forEach(p => {
      const date = p.created_at || p.CreatedAt
      if (!date) return
      const d = new Date(date)
      if (isNaN(d.getTime())) return
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      byMonth[key] = (byMonth[key] || 0) + 1
    })
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
    return Object.entries(byMonth)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([m, v]) => {
        const [y, mo] = m.split('-')
        return { month: `${months[parseInt(mo)-1]} ${y}`, value: v }
      })
  }, [proposals])

  const PIE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#00236f', '#ef4444']

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
                  <span className="material-symbols-outlined text-primary relative z-10 transition-transform duration-300 group-hover/icon:scale-110" style={{ fontSize: '26px' }}>description</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                      Validasi Anggaran & Kegiatan
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {stats.accFakultas} ACC Fakultas
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                    Proposal <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">ORMAWA</span>
                  </h1>
                </div>
              </div>

              {/* Perfectly aligned description block */}
              <p className="text-slate-500 font-medium text-xs md:text-sm max-w-3xl leading-relaxed mt-3 pl-0 md:pl-[72px]">
                Review dan validasi proposal program kerja serta anggaran kegiatan organisasi mahasiswa.
              </p>
            </div>

            {/* Action and quick count balance box */}
            <div className="flex flex-row lg:flex-col items-end gap-3 shrink-0 self-stretch lg:self-auto justify-between lg:justify-center border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div className="flex items-center gap-2">
                <button onClick={fetchData} disabled={loading}
                  className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2">
                  {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }} >sync</span> : <span className="material-symbols-outlined text-primary" style={{ fontSize: 13 }}>sync</span>} Refresh Data
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {label:'Total Proposal',  value:stats.total,           icon:FileText,    bg:'bg-[#eef4ff]',  color:'text-primary',   desc:'Semua pengajuan'},
            {label:'Total Anggaran',  value:formatIDR(stats.totalBudget), icon:Activity, bg:'bg-emerald-50', color:'text-emerald-600', desc:'Akumulasi budget'},
            {label:'Approval Rate',   value:`${approvalRate}%`,    icon:CheckCircle2, bg:'bg-indigo-50',  color:'text-indigo-600', desc:'Disetujui / total'},
            {label:'ACC Fakultas',    value:stats.accFakultas,     icon:ShieldCheck, bg:'bg-amber-50',   color:'text-amber-600',  desc:'Disetujui fakultas'},
            {label:'Disyahkan Univ',  value:stats.accUniv,         icon:ShieldCheck, bg:'bg-emerald-50', color:'text-emerald-600', desc:'Final disyahkan'},
          ].map(s=>(
            <div key={s.label} className="glass-card border border-slate-200/60 rounded-2xl p-5 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',s.bg,s.color)}><s.icon size={18}/></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
              </div>
              <p className={cn('font-extrabold text-slate-900 leading-none tabular-nums', String(s.value).length>10?'text-base':'text-2xl')}>
                {loading?<span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span>:s.value}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Pie: Status Distribution */}
            <div className="glass-card border border-slate-200/60 rounded-2xl p-5 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribusi Status</span>
              </div>
              <div className="h-[180px] w-full flex items-center justify-center">
                {statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                        {statusDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "10px", fontWeight: "bold" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <span className="text-xs text-slate-400 italic">Tidak ada data</span>}
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {statusDistribution.slice(0, 6).map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 truncate leading-none">{item.name}</p>
                      <p className="text-xs font-extrabold text-slate-800 leading-none mt-1">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar: Proposal per Ormawa (Top 5) */}
            <div className="glass-card border border-slate-200/60 rounded-2xl p-5 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengajuan per Ormawa (Top 5)</span>
              </div>
              <div className="h-[180px] w-full">
                {topOrmawaData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={topOrmawaData} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "10px", fontWeight: "bold" }} />
                      <Bar dataKey="value" name="Proposal" fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center"><span className="text-xs text-slate-400 italic">Tidak ada data</span></div>}
              </div>
            </div>

            {/* Line: Tren Pengajuan per Bulan */}
            <div className="glass-card border border-slate-200/60 rounded-2xl p-5 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tren Pengajuan per Bulan</span>
              </div>
              <div className="h-[180px] w-full">
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "10px", fontWeight: "bold" }} />
                      <Line type="monotone" dataKey="value" name="Proposal" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} activeDot={{ r: 5, fill: '#f59e0b' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center"><span className="text-xs text-slate-400 italic">Tidak ada data</span></div>}
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="glass-card border border-slate-200/60 rounded-2xl shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-black text-sm uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h2)' }}>Daftar Proposal Kegiatan</h2>
              <p className="text-xs text-slate-500 mt-0.5">Menampilkan <span className="font-bold text-slate-900">{filtered.length}</span> dari <span className="font-bold text-primary">{proposals.length}</span> proposal</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }} >search</span>
                <input type="text" placeholder="Cari judul atau organisasi..." value={search} onChange={e=>setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-52 rounded-xl border border-slate-200/60 focus:outline-none focus:border-primary text-sm bg-transparent"/>
              </div>
              <select value={filterStatus} onChange={e=>setFilter(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-transparent text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer">
                <option value="all">Semua Status</option>
                <option value="pending">Diajukan</option>
                <option value="revisi">Revisi</option>
                <option value="disetujui_fakultas">ACC Fakultas</option>
                <option value="disetujui_univ">Disyahkan Univ</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/60">
                  {[
                    { label: 'No', key: null, sortable: false },
                    { label: 'Program Kerja', key: 'Judul', sortable: true },
                    { label: 'Organisasi', key: 'ormawa', sortable: true },
                    { label: 'Anggaran', key: 'Anggaran', sortable: true },
                    { label: 'Status', key: 'Status', sortable: true },
                    { label: 'Aksi', key: null, sortable: false },
                  ].map(h => (
                    <th
                      key={h.label}
                      onClick={() => h.sortable && handleSort(h.key)}
                      className={cn(
                        'px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap select-none',
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
                {loading?Array.from({length: pageSize}).map((_,i)=>(
                  <tr key={i} className="border-b border-slate-100">{[...Array(6)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-slate-50 rounded animate-pulse"/></td>)}</tr>
                )):paginated.length===0?(
                  <tr><td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >description</span></div>
                      <p className="font-bold text-sm text-slate-900">Tidak Ada Proposal</p>
                    </div>
                  </td></tr>
                ):paginated.map((row,i)=>{
                  const st = getStatus(row.Status)
                  const org = row.Ormawa||row.ormawa||row.Organisasi||{}
                  return (
                    <tr key={row.ID||i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-sm text-slate-900 max-w-[200px] truncate">{row.Judul}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{formatDate(row.created_at || row.CreatedAt)}</p>
                      </td>
                      <td className="px-5 py-3.5"><span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">{org?.Nama||org?.nama||org?.NamaOrg||'—'}</span></td>
                      <td className="px-5 py-3.5 font-black text-sm text-emerald-600 tabular-nums">{formatIDR(row.Anggaran)}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap',st.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0',st.dot)}/>{st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={()=>{setSelected(row);setCatatan(row.catatan_admin||row.Catatan||'')}}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-primary bg-[#eef4ff] border border-[#c9d8ff] rounded-lg hover:bg-primary hover:text-white transition-all active:scale-95">
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >security</span> Verifikasi
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

      {/* Verification Modal / Side-by-Side Review Panel */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="relative w-full max-w-7xl bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden h-[90vh]" onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#00236F] to-[#003db5] py-4 px-6 overflow-hidden flex-shrink-0 flex items-center justify-between">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"/>
              <div className="relative z-10">
                <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.25em]">Detail Review Proposal ORMAWA</span>
                <h2 className="text-base font-extrabold text-white leading-tight line-clamp-1 mt-0.5">{selected.Judul}</h2>
              </div>
              <button onClick={()=>setSelected(null)} className="relative z-50 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Split Screen Workspace */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-slate-50">
              {/* Left Pane (60%): Document Viewer */}
              <div className="flex-1 lg:w-3/5 border-r border-slate-200/80 flex flex-col bg-slate-800">
                <div className="px-4 py-2.5 bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-wider flex items-center justify-between shrink-0">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">description</span> Naskah Proposal PDF</span>
                  {selected.FileURL && (
                    <a href={selected.FileURL} target="_blank" rel="noreferrer" className="text-primary-foreground hover:text-white flex items-center gap-1 font-bold">
                      Buka Tab Baru <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    </a>
                  )}
                </div>
                <div className="flex-1 relative bg-slate-700">
                  {selected.FileURL ? (
                    <iframe
                      src={`${selected.FileURL}#toolbar=1`}
                      className="w-full h-full border-0"
                      title="Naskah Proposal"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                      <span className="material-symbols-outlined text-4xl mb-3 text-slate-500">warning</span>
                      <p className="font-bold text-sm text-slate-300">Naskah Dokumen Tidak Dilampirkan</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs">ORMAWA belum mengunggah dokumen proposal untuk pengajuan ini.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Pane (40%): Metadata, History, Action Forms */}
              <div className="lg:w-2/5 flex flex-col overflow-y-auto bg-white min-h-0 divide-y divide-slate-100">
                {/* 1. Proposal & Proposer Details */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Identitas Pengaju</span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {selected.Jenis || "Program Kerja"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Organisasi</p>
                      <p className="font-bold text-xs text-slate-900">{(selected.Ormawa||selected.ormawa||selected.Organisasi||{})?.Nama || "ORMAWA"}</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Anggaran Pengajuan</p>
                      <p className="font-black text-xs text-emerald-600 tabular-nums">{formatIDR(selected.Anggaran)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Tanggal Pelaksanaan</p>
                      <p className="font-bold text-xs text-slate-900">{formatDate(selected.TanggalKegiatan || selected.tanggal_kegiatan)}</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Pengusul / Ketua</p>
                      <p className="font-bold text-xs text-slate-900">{(selected.Mahasiswa?.Nama) || "Perwakilan ORMAWA"}</p>
                    </div>
                  </div>

                  {/* Document & Budget Risk Warnings */}
                  {(!selected.FileURL || selected.Anggaran > 50000000) && (
                    <div className="p-3 bg-amber-50/60 border border-amber-100/60 rounded-2xl flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">warning</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Perhatian Khusus</p>
                        <ul className="list-disc pl-4 text-[10.5px] text-amber-700/90 font-medium space-y-0.5 mt-1 leading-snug">
                          {!selected.FileURL && <li>Dokumen proposal belum dilampirkan ormawa</li>}
                          {selected.Anggaran > 50000000 && <li>Anggaran melebihi batas standar fakultas (&gt; Rp 50jt)</li>}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Review Decision Form */}
                <div className="p-5 space-y-4 bg-slate-50/30">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2">Catatan Verifikasi / Instruksi Revisi</label>
                    <textarea
                      value={catatan}
                      onChange={e=>setCatatan(e.target.value)}
                      rows={3}
                      placeholder="Masukkan evaluasi detail atau arahan perbaikan berkas..."
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-white focus:outline-none focus:border-primary text-xs font-semibold text-slate-900 transition-all resize-none shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2">Pilih Keputusan Akhir</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        {s:'disetujui_fakultas', label:'Setujui', icon:CheckCircle2, cls:'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10'},
                        {s:'revisi',            label:'Revisi',   icon:Clock,       cls:'bg-blue-600 hover:bg-blue-700 shadow-blue-600/10'},
                        {s:'ditolak',           label:'Tolak',    icon:XCircle,     cls:'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'},
                      ].map(opt=>(
                        <button key={opt.s} onClick={()=>handleUpdateStatus(opt.s)} disabled={isSubmitting}
                          className={cn('flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider transition-all active:scale-[0.97] shadow-lg disabled:opacity-50', opt.cls)}>
                          {isSubmitting ? (
                            <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>sync</span>
                          ) : (
                            <opt.icon size={16}/>
                          )}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Review Timeline & Logs */}
                <div className="p-5 space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Riwayat Aliran Status</span>

                  {selected.Riwayat && selected.Riwayat.length > 0 ? (
                    <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-4.5">
                      {selected.Riwayat.map((log, idx) => {
                        const st = getStatus(log.Status)
                        return (
                          <div key={idx} className="relative">
                            {/* Marker dot */}
                            <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border bg-white flex items-center justify-center">
                              <div className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
                            </div>

                            {/* Log card */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 shadow-xs">
                              <div className="flex items-center justify-between">
                                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-bold border uppercase tracking-wider', st.cls)}>
                                  {st.label}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400">{formatDate(log.created_at || log.CreatedAt)}</span>
                              </div>
                              {log.Catatan && (
                                <p className="text-[10.5px] text-slate-600 font-medium mt-1.5 italic bg-white border border-slate-100 rounded-lg p-2 leading-relaxed">
                                  &ldquo;{log.Catatan}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                      <span className="material-symbols-outlined text-slate-300 text-lg mb-1" style={{ fontSize: '20px' }}>info</span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum ada riwayat aktivitas</p>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  )
}

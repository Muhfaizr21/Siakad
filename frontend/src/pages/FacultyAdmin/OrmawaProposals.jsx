"use client"

import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/select"
import { Button } from "./components/button"

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
const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) } catch { return d } }

const PROPOSAL_STATUS = {
  disetujui_fakultas: {cls:'bg-indigo-50 text-indigo-700 border-indigo-200',   dot:'bg-indigo-500',  label:'ACC Fakultas'},
  disetujui_univ:     {cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500', label:'Disyahkan Univ'},
  revisi:             {cls:'bg-blue-50 text-blue-700 border-blue-200',          dot:'bg-blue-500',    label:'Revisi'},
  ditolak:            {cls:'bg-rose-50 text-rose-700 border-rose-200',          dot:'bg-rose-500',    label:'Ditolak'},
  pending:            {cls:'bg-amber-50 text-amber-700 border-amber-200',       dot:'bg-amber-500',   label:'Diajukan'},
}
const getStatus = (v='') => PROPOSAL_STATUS[(v||'pending').toLowerCase()] || PROPOSAL_STATUS.pending

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body">
      <Toaster position="top-right"/>
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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Validasi Anggaran & Kegiatan</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
                Proposal <span className="text-primary">ORMAWA</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">
                Review dan validasi proposal program kerja serta anggaran kegiatan organisasi mahasiswa.
              </p>
            </div>
            <button onClick={fetchData} disabled={loading}
              className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60 shrink-0">
              {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>sync</span>} Refresh
            </button>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {label:'Total Proposal',  value:stats.total,           icon:FileText,    bg:'bg-[#eef4ff]',  color:'text-primary',   desc:'Semua pengajuan'},
            {label:'Total Anggaran',  value:formatIDR(stats.totalBudget), icon:Activity, bg:'bg-emerald-50', color:'text-emerald-600', desc:'Akumulasi budget'},
            {label:'ACC Fakultas',    value:stats.accFakultas,     icon:CheckCircle2,bg:'bg-indigo-50',  color:'text-indigo-600',  desc:'Disetujui fakultas'},
            {label:'Disyahkan Univ',  value:stats.accUniv,         icon:ShieldCheck, bg:'bg-emerald-50', color:'text-emerald-600', desc:'Final disyahkan'},
          ].map(s=>(
            <div key={s.label} className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
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

        {/* Table */}
        <div className="bg-white border border-slate-100/50 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-base text-slate-900">Daftar Proposal Kegiatan</h2>
              <p className="text-xs text-slate-500 mt-0.5">Menampilkan <span className="font-bold text-slate-900">{filtered.length}</span> dari <span className="font-bold text-primary">{proposals.length}</span> proposal</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }} >search</span>
                <input type="text" placeholder="Cari judul atau organisasi..." value={search} onChange={e=>setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-52 rounded-xl border border-slate-200/60 focus:outline-none focus:border-primary text-sm bg-white"/>
              </div>
              <select value={filterStatus} onChange={e=>setFilter(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer">
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
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{formatDate(row.CreatedAt)}</p>
                      </td>
                      <td className="px-5 py-3.5"><span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">{org?.Nama||org?.nama||org?.NamaOrg||'—'}</span></td>
                      <td className="px-5 py-3.5 font-black text-sm text-emerald-600 tabular-nums">{formatIDR(row.Anggaran)}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider',st.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full',st.dot)}/>{st.label}
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

      {/* Verification Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]" onClick={e=>e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-[#00236F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"/>
              <button onClick={()=>setSelected(null)} className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span></button>
              <div className="relative z-10">
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">{(selected.Ormawa||selected.ormawa||selected.Organisasi||{})?.Nama||'ORMAWA'}</p>
                <h2 className="text-base font-extrabold text-white leading-tight line-clamp-2">{selected.Judul}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xl font-black text-emerald-300 tabular-nums">{formatIDR(selected.Anggaran)}</span>
                  {selected.FileURL && <a href={selected.FileURL} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-white hover:bg-white/20 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '11px' }} >description</span> PDF <ExternalLink size={9}/>
                  </a>}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2">Catatan / Instruksi Revisi</label>
                <textarea value={catatan} onChange={e=>setCatatan(e.target.value)} rows={4}
                  placeholder="Tulis catatan atau instruksi perbaikan untuk ORMAWA..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-slate-50/50 focus:outline-none focus:border-primary focus:bg-white text-sm text-slate-900 transition-all resize-none"/>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2">Pilih Keputusan</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {s:'disetujui_fakultas',label:'ACC Fakultas',icon:CheckCircle2,cls:'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'},
                    {s:'revisi',            label:'Revisi',      icon:Clock,       cls:'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'},
                    {s:'ditolak',           label:'Tolak',       icon:XCircle,     cls:'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'},
                  ].map(opt=>(
                    <button key={opt.s} onClick={()=>handleUpdateStatus(opt.s)} disabled={isSubmitting}
                      className={cn('flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg disabled:opacity-50',opt.cls)}>
                      {isSubmitting?<span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span>:<opt.icon size={16}/>} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
              <button onClick={()=>setSelected(null)} className="w-full h-11 rounded-xl border border-slate-200/60 bg-white text-xs font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const CheckCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;



const API = `${API_BASE_URL}/faculty`

const AVATAR_COLORS = ['from-blue-400 to-indigo-500','from-emerald-400 to-teal-500','from-amber-400 to-orange-500','from-rose-400 to-pink-500','from-violet-400 to-purple-500']
const getInitials = (n='') => n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()||'?'

const LUL_STATUS = {
  Lulus: {cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500'},
  Proses:{cls:'bg-amber-50 text-amber-700 border-amber-200',       dot:'bg-amber-500'},
  Gagal: {cls:'bg-rose-50 text-rose-700 border-rose-200',          dot:'bg-rose-500'},
}
const getLulus = (v='') => LUL_STATUS[v] || LUL_STATUS.Proses

const TABS = [
  {key:'prodi',   label:'Breakdown Prodi', icon:GraduationCap},
  {key:'students',label:'Detail Peserta',  icon:Users},
]

export default function FacultyPkkmb() {
  const [activeTab, setTab] = useState('prodi')
  const [loading, setLoading]   = useState(true)
  const [data, setData]         = useState([])
  const [students, setStudents] = useState([])
  const [summary, setSummary]   = useState({ totalMaba:0, totalLulus:0, totalProses:0 })
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilter]= useState('all')
  const [selected, setSelected] = useState(null)

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API}/ringkasan`)
      const json = await res.json()
      if (json.status === 'success') { setData(json.prodiBreakdown||[]); setSummary(json.stats||{totalMaba:0,totalLulus:0,totalProses:0}) }
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

  return (
    <div className="min-h-screen bg-[#f8fafc] font-body">
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
              <div className="flex items-center gap-2 mb-2"><div className="h-4 w-1.5 bg-primary rounded-full"/><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Portal Orientasi Mahasiswa Baru</span></div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight">Monitoring <span className="text-primary">PKKMB</span></h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">Monitor kehadiran, nilai, dan status kelulusan peserta PKKMB per prodi dan per individu.</p>
            </div>
            <button onClick={()=>{ fetchSummary(); fetchStudents() }} disabled={loading}
              className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60">
              {loading?<span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span>:<RefreshCw size={14} className="text-primary"/>} Refresh
            </button>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {label:'Registrasi Maba',    value:summary.totalMaba,   icon:Users,        bg:'bg-[#eef4ff]',  color:'text-[#00236F]',   desc:'Total mahasiswa baru'},
            {label:'Sertifikasi Lulus',  value:summary.totalLulus,  icon:CheckCircle,  bg:'bg-emerald-50', color:'text-emerald-600', desc:'Dinyatakan lulus PKKMB'},
            {label:'Dalam Proses',       value:summary.totalProses, icon:Clock,        bg:'bg-amber-50',   color:'text-amber-600',   desc:'Masih dalam penilaian'},
          ].map(s=>(
            <div key={s.label} className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',s.bg,s.color)}><s.icon size={18}/></div>
                <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] leading-none tabular-nums">{loading?<span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span>:s.value}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-[#e5e5e5] rounded-2xl p-1.5 w-fit shadow-sm">
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>{setTab(t.key);setSearch('');setFilter('all')}}
              className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                activeTab===t.key?'bg-[#00236F] text-white shadow-lg shadow-[#00236F]/25':'text-[#737373] hover:bg-[#f5f5f5]')}>
              <t.icon size={14}/>{t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0f0f0] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-base text-[#171717]">{activeTab==='prodi'?'Breakdown per Program Studi':'Daftar Peserta PKKMB'}</h2>
              <p className="text-xs text-[#737373] mt-0.5">Menampilkan <span className="font-bold text-[#171717]">{activeTab==='prodi'?filteredProdi.length:filteredStudents.length}</span> data</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" style={{ fontSize: '14px' }} >search</span>
                <input type="text" placeholder={activeTab==='prodi'?'Cari prodi...':'Cari nama atau NIM...'} value={search} onChange={e=>setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-48 rounded-xl border border-[#e5e5e5] focus:outline-none focus:border-primary text-sm bg-white"/>
              </div>
              {activeTab==='students' && (
                <select value={filterStatus} onChange={e=>setFilter(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-xl border border-[#e5e5e5] text-xs font-medium bg-white text-[#525252] focus:outline-none focus:border-primary appearance-none cursor-pointer">
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
                <thead><tr className="border-b border-[#e5e5e5]">
                  {['#','Program Studi','Partisipasi','Rata-rata Nilai','Status'].map(h=>(
                    <th key={h} className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {loading?Array.from({length:4}).map((_,i)=>(
                    <tr key={i} className="border-b border-[#f0f0f0]">{[...Array(5)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-[#f5f5f5] rounded animate-pulse"/></td>)}</tr>
                  )):filteredProdi.map((row,i)=>(
                    <tr key={i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-[#a3a3a3] font-medium">{i+1}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-sm text-[#171717]">{row.prodi}</p>
                        <p className="text-[10px] text-[#a3a3a3] font-medium">Sertifikasi Internal</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{width:`${row.partisipasi}%`}}/></div>
                          <span className="text-xs font-black text-[#171717] tabular-nums">{Math.round(row.partisipasi)}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-black text-sm text-[#171717] tabular-nums">{row.nilai?.toFixed(1)||'0.0'}</td>
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
                <thead><tr className="border-b border-[#e5e5e5]">
                  {['#','Mahasiswa','Program Studi','Kehadiran','Nilai','Status','Aksi'].map(h=>(
                    <th key={h} className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {loading?Array.from({length:5}).map((_,i)=>(
                    <tr key={i} className="border-b border-[#f0f0f0]">{[...Array(7)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-[#f5f5f5] rounded animate-pulse"/></td>)}</tr>
                  )):filteredStudents.length===0?(
                    <tr><td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >group</span></div>
                        <p className="font-bold text-sm text-[#171717]">Tidak Ada Peserta</p>
                      </div>
                    </td></tr>
                  ):filteredStudents.map((row,i)=>{
                    const st = getLulus(row.StatusKelulusan)
                    return (
                      <tr key={row.ID||i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                        <td className="px-5 py-3.5 text-sm text-[#a3a3a3] font-medium">{i+1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 shadow-sm',AVATAR_COLORS[row.colorIdx])}>{getInitials(row.Mahasiswa?.Nama)}</div>
                            <div><p className="font-bold text-sm text-[#171717]">{row.Mahasiswa?.Nama||'—'}</p><p className="text-[10px] text-[#a3a3a3] font-medium">{row.Mahasiswa?.NIM||'—'}</p></div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#525252] font-medium">{row.Mahasiswa?.ProgramStudi?.Nama||'—'}</td>
                        <td className="px-5 py-3.5 font-black text-sm text-[#171717] tabular-nums">{row.attendanceRate||0}%</td>
                        <td className="px-5 py-3.5 font-black text-sm text-primary tabular-nums">{row.Nilai||0}</td>
                        <td className="px-5 py-3.5">
                          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider',st.cls)}>
                            <span className={cn('w-1.5 h-1.5 rounded-full',st.dot)}/>{row.StatusKelulusan||'Proses'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={()=>setSelected(row)} className="p-1.5 text-[#a3a3a3] hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >visibility</span></button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]" onClick={e=>e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-[#00236F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"/>
              <button onClick={()=>setSelected(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span></button>
              <div className="relative z-10 flex items-center gap-4">
                <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-white text-base font-black shadow-xl ring-2 ring-white/20',AVATAR_COLORS[selected.colorIdx])}>{getInitials(selected.Mahasiswa?.Nama)}</div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Peserta PKKMB</p>
                  <h2 className="text-base font-extrabold text-white leading-tight">{selected.Mahasiswa?.Nama}</h2>
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
                <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#f0f0f0] hover:bg-white transition-all">
                  <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#00236F] shadow-sm border border-[#f0f0f0] flex-shrink-0"><r.icon size={13}/></div>
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-[#a3a3a3] uppercase tracking-[0.15em]">{r.label}</p>
                    <p className="text-sm font-semibold text-[#171717]">{r.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex-shrink-0">
              <button onClick={()=>setSelected(null)} className="w-full h-11 rounded-xl bg-[#00236F] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

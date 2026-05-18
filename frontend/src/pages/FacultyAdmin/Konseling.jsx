"use client"

import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const AlertCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>error</span>;
const CalendarCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>event_available</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const Calendar = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const UserCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>how_to_reg</span>;
const Headphones = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>headset</span>;



const API = `${API_BASE_URL}/faculty`

const AVATAR_COLORS = [
  'from-blue-400 to-indigo-500','from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500','from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500','from-cyan-400 to-sky-500',
]
const getInitials = (n='') => n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()||'?'

const STATUS_STYLES = {
  pending:  { cls:'bg-amber-50 text-amber-700 border-amber-200',   dot:'bg-amber-500',   label:'Menunggu' },
  approved: { cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500', label:'Terjadwal' },
  finished: { cls:'bg-slate-50 text-slate-600 border-slate-200',   dot:'bg-slate-400',   label:'Selesai' },
}
const getStatus = (v='') => STATUS_STYLES[(v||'pending').toLowerCase()] || STATUS_STYLES.pending

const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) } catch { return d } }

export default function FacultyKonseling() {
  const [sessions, setSessions]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilter] = useState('all')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/counseling`)
      if (res.data.status === 'success')
        setSessions((res.data.data||[]).map((s,i)=>({...s, colorIdx: i % AVATAR_COLORS.length})))
    } catch { toast.error('Gagal sinkronisasi data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = useMemo(() => sessions.filter(s => {
    const q = search.toLowerCase()
    const matchQ = !q || s.Mahasiswa?.Nama?.toLowerCase().includes(q) || s.Topik?.toLowerCase().includes(q)
    const matchS = filterStatus === 'all' || (s.Status||'pending').toLowerCase() === filterStatus
    return matchQ && matchS
  }), [sessions, search, filterStatus])

  const stats = {
    pending:  sessions.filter(s=>s.Status==='pending').length,
    approved: sessions.filter(s=>s.Status==='approved').length,
    finished: sessions.filter(s=>s.Status==='finished').length,
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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Bimbingan & Konseling</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
                Manajemen <span className="text-primary">Konseling</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">
                Monitoring sesi bimbingan akademik dan konseling personal mahasiswa di fakultas.
              </p>
            </div>
            <button onClick={fetchData} disabled={loading}
              className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60">
              {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <RefreshCw size={14} className="text-primary" />}
              Refresh
            </button>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label:'Antrean Baru',  value:stats.pending,  icon:AlertCircle,  bg:'bg-amber-50',   color:'text-amber-600',   desc:'Menunggu konfirmasi' },
            { label:'Sesi Aktif',    value:stats.approved, icon:CalendarCheck, bg:'bg-emerald-50', color:'text-emerald-600', desc:'Sudah terjadwal' },
            { label:'Total Selesai', value:stats.finished, icon:CheckCircle2, bg:'bg-[#eef4ff]',  color:'text-[#00236F]',   desc:'Sesi terselesaikan' },
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
              <h2 className="font-bold text-base text-[#171717]">Daftar Sesi Konseling</h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Menampilkan <span className="font-bold text-[#171717]">{filtered.length}</span> dari <span className="font-bold text-primary">{sessions.length}</span> sesi
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" style={{ fontSize: '14px' }} >search</span>
                <input type="text" placeholder="Cari nama mahasiswa..." value={search} onChange={e=>setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-52 rounded-xl border border-[#e5e5e5] focus:outline-none focus:border-primary text-sm bg-white" />
              </div>
              <select value={filterStatus} onChange={e=>setFilter(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-[#e5e5e5] text-xs font-medium bg-white text-[#525252] focus:outline-none focus:border-primary appearance-none cursor-pointer">
                <option value="all">Semua Status</option>
                <option value="pending">Antrean</option>
                <option value="approved">Terjadwal</option>
                <option value="finished">Selesai</option>
              </select>
              {(search||filterStatus!=='all') && (
                <button onClick={()=>{setSearch('');setFilter('all')}}
                  className="h-9 px-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-200 hover:bg-rose-100">Reset</button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  {['#','Mahasiswa','Topik / Kategori','Jadwal','Status','Aksi'].map(h=>(
                    <th key={h} className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({length:5}).map((_,i)=>(
                  <tr key={i} className="border-b border-[#f0f0f0]">
                    {[...Array(6)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-[#f5f5f5] rounded animate-pulse"/></td>)}
                  </tr>
                )) : filtered.length===0 ? (
                  <tr><td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><Headphones size={22}/></div>
                      <p className="font-bold text-sm text-[#171717]">Tidak Ada Sesi Konseling</p>
                      <p className="text-xs text-[#a3a3a3]">Belum ada sesi konseling yang terdaftar.</p>
                    </div>
                  </td></tr>
                ) : filtered.map((row,i)=>{
                  const st = getStatus(row.Status)
                  return (
                    <tr key={row.ID||i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-[#a3a3a3] font-medium">{i+1}</td>
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
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-indigo-200">
                          {row.Topik||'Akademik'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-[#525252] font-medium">
                          <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontSize: '12px' }} >calendar_month</span>
                          {row.Tanggal ? new Date(row.Tanggal).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                        </div>
                        {row.jam && <div className="flex items-center gap-1.5 text-[10px] text-[#a3a3a3] font-medium mt-0.5">
                          <span className="material-symbols-outlined" style={{ fontSize: '10px' }} >schedule</span>{row.jam}
                        </div>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider', st.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', st.dot)}/>{st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={()=>setSelected(row)}
                          className="p-1.5 text-[#a3a3a3] hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors" title="Detail">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >visibility</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={()=>setSelected(null)}>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]"
            onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"/>
              <button onClick={()=>setSelected(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span>
              </button>
              <div className="relative z-10 flex items-center gap-4 mb-5">
                <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-white text-base font-black shadow-xl ring-2 ring-white/20', AVATAR_COLORS[selected.colorIdx])}>
                  {getInitials(selected.Mahasiswa?.Nama)}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Sesi Konseling</p>
                  <h2 className="text-base font-extrabold text-white leading-tight">{selected.Mahasiswa?.Nama}</h2>
                  <p className="text-xs text-blue-200 font-medium mt-0.5">{selected.Mahasiswa?.NIM} · {selected.Mahasiswa?.ProgramStudi?.Nama||'—'}</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider">
                  <Headphones size={10}/>{selected.Topik||'Akademik'}
                </span>
                <span className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider',
                  selected.Status==='approved' ? 'bg-emerald-400/20 border border-emerald-300/30 text-emerald-200'
                  : selected.Status==='finished' ? 'bg-slate-400/20 border border-slate-300/30 text-slate-200'
                  : 'bg-amber-400/20 border border-amber-300/30 text-amber-200')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>
                  {getStatus(selected.Status).label}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {[
                { icon:Calendar,  label:'Tanggal Sesi',   value: formatDate(selected.Tanggal) },
                { icon:Clock,     label:'Waktu',          value: selected.jam || '—' },
                { icon:UserCheck, label:'Konselor',       value: selected.counselor || 'Dosen PA' },
                { icon:Headphones,label:'Topik',          value: selected.Topik || '—' },
              ].map(r=>(
                <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#f0f0f0] hover:bg-white transition-all">
                  <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#00236F] shadow-sm border border-[#f0f0f0] flex-shrink-0">
                    <r.icon size={13}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-[#a3a3a3] uppercase tracking-[0.15em]">{r.label}</p>
                    <p className="text-sm font-semibold text-[#171717] truncate">{r.value}</p>
                  </div>
                </div>
              ))}

              {/* Catatan */}
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#f0f0f0]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md bg-[#eef4ff] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#00236F]" style={{ fontSize: '11px' }} >description</span>
                  </div>
                  <p className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em]">Narasi Hasil Konsultasi</p>
                </div>
                <p className="text-sm text-[#737373] leading-relaxed italic">
                  "{selected.notes || 'Sesi ini belum memiliki catatan. Data akan tersinkron setelah sesi dinyatakan selesai.'}"
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex gap-3 flex-shrink-0">
              <button onClick={()=>setSelected(null)}
                className="flex-1 h-11 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold text-[#525252] uppercase tracking-widest hover:bg-[#f5f5f5] transition-all">
                Tutup
              </button>
              <button className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >check_circle</span> Tandai Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

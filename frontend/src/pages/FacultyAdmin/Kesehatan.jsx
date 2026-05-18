"use client"

import React, { useState, useEffect, useMemo } from 'react'
import api from '../../lib/axios'
import { toast, Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Droplet = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>opacity</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const HeartPulse = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>monitor_heart</span>;
const AlertCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>error</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;
const Calendar = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const ShieldCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>verified_user</span>;



const AVATAR_COLORS = [
  'from-blue-400 to-indigo-500','from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500','from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500','from-cyan-400 to-sky-500',
]
const getInitials = (n='') => n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()||'?'

const HEALTH_STATUS = {
  prima:    { cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500' },
  stabil:   { cls:'bg-blue-50 text-blue-700 border-blue-200',         dot:'bg-blue-500' },
  pantauan: { cls:'bg-amber-50 text-amber-700 border-amber-200',      dot:'bg-amber-500' },
  kritis:   { cls:'bg-rose-50 text-rose-700 border-rose-200',         dot:'bg-rose-500' },
}
const getHealth = (v='') => HEALTH_STATUS[(v||'stabil').toLowerCase()] || HEALTH_STATUS.stabil

const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) } catch { return d } }

export default function FacultyKesehatan() {
  const [loading, setLoading]               = useState(true)
  const [healthRecords, setHealthRecords]   = useState([])
  const [statsData, setStatsData]           = useState({ total:0, condition:{ prima:0, pantauan:0 } })
  const [selected, setSelected]             = useState(null)
  const [search, setSearch]                 = useState('')
  const [filterStatus, setFilterStatus]     = useState('all')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [progRes, summaryRes] = await Promise.all([
        api.get('/faculty/health-screening'),
        api.get('/faculty/health-screening/summary')
      ])
      if (progRes.data.status === 'success')
        setHealthRecords((progRes.data.data||[]).map((r,i)=>({...r, colorIdx: i % AVATAR_COLORS.length})))
      if (summaryRes.data.status === 'success')
        setStatsData(summaryRes.data.data || { total:0, condition:{ prima:0, pantauan:0 } })
    } catch { toast.error('Gagal sinkronisasi data kesehatan') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = useMemo(() => healthRecords.filter(r => {
    const q = search.toLowerCase()
    const matchQ = !q || r.Mahasiswa?.Nama?.toLowerCase().includes(q) || r.Mahasiswa?.NIM?.includes(q)
    const matchS = filterStatus === 'all' || (r.StatusKesehatan||'').toLowerCase() === filterStatus
    return matchQ && matchS
  }), [healthRecords, search, filterStatus])

  const bmi = (r) => {
    if (!r.TinggiBadan || r.TinggiBadan <= 0) return null
    return (r.BeratBadan / Math.pow(r.TinggiBadan/100, 2)).toFixed(1)
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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Medical Monitoring System</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
                Pantau <span className="text-primary">Kesehatan</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">
                Monitoring kesehatan dan hasil skrining medis mahasiswa di lingkungan fakultas secara real-time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => alert('Ekspor rekap...')}
                className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 14 }}>download</span> Ekspor Rekap
              </button>
              <button onClick={fetchData} disabled={loading}
                className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60">
                {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined text-primary" style={{ fontSize: 14 }}>sync</span>}
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label:'Total Skrining',   value: statsData.total,               icon:Activity,   bg:'bg-[#eef4ff]',  color:'text-[#00236F]',   desc:'Semua rekam medis' },
            { label:'Kondisi Prima',    value: statsData.condition?.prima||0,  icon:HeartPulse, bg:'bg-emerald-50', color:'text-emerald-600', desc:'Status kesehatan prima' },
            { label:'Dalam Pantauan',   value: statsData.condition?.pantauan||0, icon:AlertCircle, bg:'bg-amber-50', color:'text-amber-600',  desc:'Perlu perhatian khusus' },
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
              <h2 className="font-bold text-base text-[#171717]">Rekam Medis Mahasiswa</h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Menampilkan <span className="font-bold text-[#171717]">{filtered.length}</span> dari <span className="font-bold text-primary">{healthRecords.length}</span> data
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" style={{ fontSize: '14px' }} >search</span>
                <input type="text" placeholder="Cari nama atau NIM..." value={search} onChange={e=>setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-52 rounded-xl border border-[#e5e5e5] focus:outline-none focus:border-primary text-sm bg-white" />
              </div>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-[#e5e5e5] text-xs font-medium bg-white text-[#525252] focus:outline-none focus:border-primary appearance-none cursor-pointer">
                <option value="all">Semua Status</option>
                <option value="prima">Prima</option>
                <option value="stabil">Stabil</option>
                <option value="pantauan">Pantauan</option>
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
                  {['#','Mahasiswa','Program Studi','Gol. Darah','Status Kesehatan','Tgl Periksa','Aksi'].map(h=>(
                    <th key={h} className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({length:5}).map((_,i)=>(
                  <tr key={i} className="border-b border-[#f0f0f0]">
                    {[...Array(7)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-[#f5f5f5] rounded animate-pulse"/></td>)}
                  </tr>
                )) : filtered.length===0 ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><HeartPulse size={22}/></div>
                      <p className="font-bold text-sm text-[#171717]">Tidak Ada Data Kesehatan</p>
                      <p className="text-xs text-[#a3a3a3]">Belum ada rekam medis tersimpan.</p>
                    </div>
                  </td></tr>
                ) : filtered.map((row,i)=>{
                  const hs = getHealth(row.StatusKesehatan)
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
                      <td className="px-5 py-3.5 text-sm text-[#525252] font-medium">{row.Mahasiswa?.ProgramStudi?.Nama||'—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-black">
                          {row.GolonganDarah||'?'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider', hs.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', hs.dot)}/>{row.StatusKesehatan||'—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#737373] font-medium whitespace-nowrap">{formatDate(row.Tanggal)}</td>
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
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Rekam Medis Mahasiswa</p>
                  <h2 className="text-base font-extrabold text-white leading-tight">{selected.Mahasiswa?.Nama}</h2>
                  <p className="text-xs text-blue-200 font-medium mt-0.5">{selected.Mahasiswa?.NIM} · {selected.Mahasiswa?.ProgramStudi?.Nama||'—'}</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white font-mono tracking-wider">
                  <Droplet size={10}/> Gol. {selected.GolonganDarah||'?'}
                </span>
                <span className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider',
                  selected.StatusKesehatan==='prima'    ? 'bg-emerald-400/20 border border-emerald-300/30 text-emerald-200'
                  : selected.StatusKesehatan==='pantauan' ? 'bg-amber-400/20 border border-amber-300/30 text-amber-200'
                  : 'bg-blue-400/20 border border-blue-300/30 text-blue-200')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>
                  {selected.StatusKesehatan||'Stabil'}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Data Fisik Grid */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md bg-[#eef4ff] flex items-center justify-center"><span className="material-symbols-outlined text-[#00236F]" style={{ fontSize: '11px' }} >show_chart</span></div>
                  <h3 className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em]">Data Fisik & Vital</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:'Tinggi Badan', value: selected.TinggiBadan ? `${parseFloat(selected.TinggiBadan).toFixed(1)} cm` : '—' },
                    { label:'Berat Badan',  value: selected.BeratBadan  ? `${parseFloat(selected.BeratBadan).toFixed(1)} kg`  : '—' },
                    { label:'BMI',          value: bmi(selected) || '—', highlight: bmi(selected) >= 25 },
                    { label:'Tekanan Darah', value: (selected.Sistole||selected.Diastole) ? `${selected.Sistole||0}/${selected.Diastole||0} mmHg` : '—' },
                  ].map(item=>(
                    <div key={item.label} className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-3">
                      <p className="text-[9px] font-bold text-[#a3a3a3] uppercase tracking-[0.15em] mb-1">{item.label}</p>
                      <p className={cn('text-lg font-extrabold', item.highlight ? 'text-rose-600' : 'text-[#171717]')}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Tambahan */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md bg-[#eef4ff] flex items-center justify-center"><span className="material-symbols-outlined text-[#00236F]" style={{ fontSize: '11px' }} >calendar_month</span></div>
                  <h3 className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em]">Informasi Tambahan</h3>
                </div>
                <div className="space-y-1">
                  {[
                    { icon:Calendar,       label:'Tanggal Periksa', value: formatDate(selected.Tanggal) },
                    { icon:GraduationCap,  label:'Program Studi',   value: selected.Mahasiswa?.ProgramStudi?.Nama },
                    { icon:ShieldCheck,    label:'Status',          value: selected.StatusKesehatan || 'Stabil' },
                  ].map(r=>(
                    <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#f0f0f0] hover:bg-white transition-all">
                      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#00236F] shadow-sm border border-[#f0f0f0] flex-shrink-0">
                        <r.icon size={13}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-[#a3a3a3] uppercase tracking-[0.15em]">{r.label}</p>
                        <p className="text-sm font-semibold text-[#171717]">{r.value||'—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan */}
              {selected.Catatan && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.18em] mb-1.5">Catatan Medis</p>
                  <p className="text-sm text-amber-800 leading-relaxed">{selected.Catatan}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex gap-3 flex-shrink-0">
              <button onClick={()=>window.print()}
                className="flex-1 h-11 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold text-[#525252] uppercase tracking-widest hover:bg-[#f5f5f5] transition-all">
                Cetak
              </button>
              <button onClick={()=>setSelected(null)}
                className="flex-1 h-11 rounded-xl bg-[#00236F] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#00236F]/20">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
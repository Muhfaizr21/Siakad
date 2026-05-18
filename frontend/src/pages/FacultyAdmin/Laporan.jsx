"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast, Toaster } from "react-hot-toast"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "../../services/api"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Download = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const HeartPulse = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>monitor_heart</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const Globe = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>public</span>;



const API = `${API_BASE_URL}/faculty`
const CHART_COLORS = ["#3b82f6","#10b981","#f59e0b","#6366f1","#ec4899"]

export default function LaporanFakultasPage() {
  const [data, setData] = useState({ summary:{ total:0, active:0, graduated:0, avgIPK:0, totalPrestasi:0, totalBeasiswa:0, totalKonseling:0 }, perAngkatan:[], perProdi:[], ipkDist:[] })
  const [loading, setLoading]   = useState(true)
  const [isMounted, setMounted] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/reports/summary`)
      if (res.data.status === "success") setData(res.data.data || data)
    } catch { toast.error("Gagal memuat data laporan") }
    finally { setLoading(false) }
  }

  useEffect(() => { setMounted(true); fetchData() }, [])

  const prodiWithColors = (data.perProdi||[]).map((item,i)=>({...item, nama_prodi:item.nama_prodi||"Unknown", value:item.value||0, color:CHART_COLORS[i%CHART_COLORS.length]}))

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
              <div className="flex items-center gap-2 mb-2"><div className="h-4 w-1.5 bg-primary rounded-full"/><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Monitoring Strategis</span></div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight">Laporan <span className="text-primary">Fakultas</span></h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">Dashboard analitik performa akademik dan layanan kemahasiswaan.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={()=>alert('Ekspor...')} className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm">
                <Download size={14} className="text-primary"/> Ekspor
              </button>
              <button onClick={fetchData} disabled={loading} className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60">
                {loading?<span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span>:<RefreshCw size={14} className="text-primary"/>} Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {label:'Total Mahasiswa',    value:data.summary.total,          icon:Users,     bg:'bg-[#eef4ff]',  color:'text-[#00236F]',   desc:'Terdaftar aktif'},
            {label:'Capaian Prestasi',   value:data.summary.totalPrestasi,  icon:Award,     bg:'bg-emerald-50', color:'text-emerald-600', desc:'Kompetisi & penghargaan'},
            {label:'Penerima Beasiswa',  value:data.summary.totalBeasiswa,  icon:Globe,     bg:'bg-indigo-50',  color:'text-indigo-600',  desc:'Bantuan finansial'},
            {label:'Layanan Konseling',  value:data.summary.totalKonseling, icon:HeartPulse,bg:'bg-rose-50',    color:'text-rose-600',    desc:'Sesi bimbingan'},
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

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-[#171717] mb-1">Status per Angkatan</h3>
            <p className="text-xs text-[#a3a3a3] mb-5">Distribusi akademik tiap tahun angkatan</p>
            <div className="h-64">
              {isMounted && (
                <ResponsiveContainer width="99%" height="100%" debounce={50}>
                  <BarChart data={data.perAngkatan} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <span className="material-symbols-outlined" Axis dataKey="angkatan" axisLine={false} tickLine={false} tick={{fontSize:10,fontWeight:700}}>close</span>
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize:10,fontWeight:700}}/>
                    <Tooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 10px 25px -5px rgba(0,0,0,.1)',fontSize:'11px',fontWeight:'bold'}} cursor={{fill:'#f8fafc'}}/>
                    <Bar dataKey="aktif" name="Aktif" fill="#3b82f6" radius={[4,4,0,0]} barSize={20}/>
                    <Bar dataKey="lulus" name="Lulus" fill="#10b981" radius={[4,4,0,0]} barSize={20}/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-[#171717] mb-1">Distribusi Prodi</h3>
            <p className="text-xs text-[#a3a3a3] mb-5">Persentase jumlah mahasiswa per program studi</p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-56 flex-1 min-w-0">
                {isMounted && (
                  <ResponsiveContainer width="99%" height="100%" debounce={50}>
                    <PieChart>
                      <Pie data={prodiWithColors} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                        {prodiWithColors.map((entry,i)=><Cell key={i} fill={entry.color} stroke="none"/>)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 10px 25px -5px rgba(0,0,0,.1)',fontSize:'11px',fontWeight:'bold'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex flex-col gap-2.5 min-w-[130px]">
                {prodiWithColors.map((p,i)=>(
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{backgroundColor:p.color}}/>
                    <div>
                      <p className="text-[10px] font-black text-[#171717] uppercase tracking-tight truncate max-w-[110px]">{p.nama_prodi}</p>
                      <p className="text-[9px] text-[#a3a3a3] font-bold">{p.value} Mahasiswa</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Report Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {label:'Laporan Prestasi',  icon:Award,     bg:'bg-emerald-600', light:'bg-emerald-50', stat:`${data.summary.totalPrestasi} Capaian`,  desc:'Dataset kompetisi & penghargaan mahasiswa.'},
            {label:'Laporan Beasiswa',  icon:Globe,     bg:'bg-indigo-600',  light:'bg-indigo-50',  stat:`${data.summary.totalBeasiswa} Penerima`, desc:'Transkrip penerima bantuan finansial.'},
            {label:'Laporan Konseling', icon:HeartPulse,bg:'bg-rose-600',    light:'bg-rose-50',    stat:`${data.summary.totalKonseling} Sesi`,     desc:'Monitoring layanan bimbingan & kesehatan.'},
          ].map((item,i)=>(
            <div key={i} className="bg-white border border-[#e5e5e5] rounded-2xl p-5 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-5">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg',item.bg)}><item.icon size={20}/></div>
                <span className="text-[9px] font-black text-[#a3a3a3] bg-[#f5f5f5] px-2.5 py-1 rounded-lg uppercase tracking-wider">SEM-II 2024</span>
              </div>
              <h4 className="text-base font-extrabold text-[#171717] mb-1">{item.label}</h4>
              <p className="text-xs text-[#a3a3a3] mb-5 leading-relaxed">{item.desc}</p>
              <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
                <div>
                  <p className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Master Data</p>
                  <p className="text-sm font-black text-[#171717] tabular-nums">{item.stat}</p>
                </div>
                <button className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center hover:bg-primary transition-colors active:scale-95"><Download size={15}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* Per-Prodi Table */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0f0f0]">
            <h2 className="font-bold text-base text-[#171717]">Rekap Per Program Studi</h2>
            <p className="text-xs text-[#737373] mt-0.5">Data akademik terbaru tiap prodi</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-[#e5e5e5]">
                {['Program Studi','Mahasiswa Aktif','Lulusan','Rata-rata IPK'].map(h=>(
                  <th key={h} className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {loading?Array.from({length:4}).map((_,i)=>(
                  <tr key={i} className="border-b border-[#f0f0f0]">{[...Array(4)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-[#f5f5f5] rounded animate-pulse"/></td>)}</tr>
                )):(data.perProdi||[]).map((row,i)=>(
                  <tr key={i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-sm text-[#171717]">{row.nama_prodi}</td>
                    <td className="px-5 py-3.5"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-black">{row.active||0}</span></td>
                    <td className="px-5 py-3.5"><span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg text-xs font-black">{row.graduated||0}</span></td>
                    <td className="px-5 py-3.5 font-black text-sm text-[#171717] tabular-nums">{row.avgIPK?.toFixed(2)||'0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

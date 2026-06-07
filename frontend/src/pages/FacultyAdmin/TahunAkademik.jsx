"use client"

import React, { useState, useEffect, useMemo } from "react"
import api from "../../lib/axios"
import { toast, Toaster } from "react-hot-toast"

import { cn } from "@/lib/utils"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PageContent } from "@/components/ui/page/PageContent"
import { DashboardHero } from "@/components/ui/dashboard/DashboardHero"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const ToggleRight = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>toggle_on</span>;
const ToggleLeft = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>toggle_off</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const CalendarDays = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_month</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;



export default function TahunAkademikPage() {
  const [data, setData]           = useState([])
  const [allPeriods, setAllPeriods] = useState([])
  const [loading, setLoading]     = useState(true)
  const [isCrudOpen, setCrudOpen] = useState(false)
  const [isEditMode, setEditMode] = useState(false)
  const [isSubmitting, setIsSub]  = useState(false)
  const [delTarget, setDelTarget] = useState(null)

  const [formData, setFormData] = useState({
    id: null, activeYear: '', activeSemester: 'Ganjil',
    isKrsOpen: false, isGradeInputOpen: false
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [currentRes, allRes] = await Promise.all([
        api.get("/faculty/academic-periods"),
        api.get("/faculty/academic-periods/all")
      ])
      if (currentRes.data.status === "success" && currentRes.data.data) setData([currentRes.data.data])
      if (allRes.data.status === "success" && allRes.data.data) setAllPeriods(allRes.data.data)
    } catch { toast.error("Gagal mengambil data periode") }
    finally { setLoading(false) }
  }

  const semesterDistData = useMemo(() => {
    const counts = {}
    allPeriods.forEach(p => {
      const s = p.Semester || 'Unknown'
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [allPeriods])

  const yearDistData = useMemo(() => {
    const counts = {}
    allPeriods.forEach(p => {
      const y = p.AcademicYear || 'Unknown'
      counts[y] = (counts[y] || 0) + 1
    })
    return Object.entries(counts).sort(([a],[b]) => a.localeCompare(b)).map(([name, value]) => ({ name, value }))
  }, [allPeriods])

  const activeCount = allPeriods.filter(p => p.IsActive).length
  const inactiveCount = allPeriods.length - activeCount

  const PIE_COLORS = ['#00236f', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444']

  useEffect(() => { fetchData() }, [])

  const handleOpenAdd = () => {
    setEditMode(false)
    setFormData({ id: 0, activeYear: '', activeSemester: 'Ganjil', isKrsOpen: false, isGradeInputOpen: false })
    setCrudOpen(true)
  }

  const handleOpenEdit = (row) => {
    setEditMode(true)
    setFormData({ id: row.id, activeYear: row.activeYear, activeSemester: row.activeSemester, isKrsOpen: row.isKrsOpen, isGradeInputOpen: row.isGradeInputOpen })
    setCrudOpen(true)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSub(true)
    try {
      await api.post("/faculty/academic-periods", formData)
      toast.success(isEditMode ? "Periode berhasil diperbarui" : "Periode baru diinisialisasi")
      fetchData(); setCrudOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || "Gagal menyimpan data periode") }
    finally { setIsSub(false) }
  }

  const handleDelete = async () => {
    if (!delTarget) return
    setIsSub(true)
    try {
      await api.delete(`/faculty/academic-periods/${delTarget.id}`)
      toast.success("Periode akademik berhasil dihapus")
      fetchData(); setDelTarget(null)
    } catch { toast.error("Gagal menghapus periode") }
    finally { setIsSub(false) }
  }

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }))
  const current = data[0]

  return (
    <PageContent>
      <Toaster position="top-right" />

      <DashboardHero
        title="Periode"
        highlightedTitle="Akademik"
        subtitle="Konfigurasi semester aktif, serta buka/tutup portal pendaftaran beasiswa dan pengajuan aspirasi mahasiswa."
        icon="calendar_month"
        badges={[
          { label: 'Kalender Hub', active: false },
          { label: `Siklus Aktif: ${current?.activeYear || 'IDLE'}`, active: true },
        ]}
        actions={
          <button onClick={fetchData} disabled={loading}
            className="h-10 px-5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2">
            {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }} >sync</span> : <RefreshCw size={13} className="text-primary" />} Refresh Data
          </button>
        }
      />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Siklus Aktif',  value: current?.activeYear || 'IDLE',     icon: CalendarDays, bg: 'bg-[#eef4ff]',  color: 'text-primary',   desc: 'Tahun akademik berjalan' },
            { label: 'Semester',      value: current?.activeSemester || '—',     icon: Clock,        bg: 'bg-emerald-50', color: 'text-emerald-600', desc: 'Periode semester saat ini' },
            { label: 'Portal Beasiswa', value: current?.isKrsOpen ? 'OPEN' : 'CLOSED', icon: Award, bg: current?.isKrsOpen ? 'bg-emerald-50' : 'bg-slate-50', color: current?.isKrsOpen ? 'text-emerald-600' : 'text-slate-500', desc: 'Akses pendaftaran beasiswa' },
            { label: 'Total Periode', value: allPeriods.length, icon: CalendarDays, bg: 'bg-violet-50', color: 'text-violet-600', desc: 'Riwayat semester' },
          ].map(s => (
            <div key={s.label} className="glass-card border border-slate-200/60 rounded-2xl p-5 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg, s.color)}><s.icon size={18} /></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-xl font-extrabold text-slate-900 leading-none tabular-nums uppercase">
                {loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span> : s.value}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* 5W1H Charts */}
        {!loading && allPeriods.length > 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* WHAT → Distribusi Semester */}
            <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Distribusi Semester</h3>
                  <p className="text-[10px] text-slate-400">Rasio semester Ganjil/Genap</p>
                </div>
              </div>
              <div className="h-[160px] w-full flex items-center justify-center">
                {semesterDistData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={semesterDistData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                        {semesterDistData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <span className="text-xs text-slate-400 italic">Tidak ada data</span>}
              </div>
              <div className="flex justify-center gap-3 mt-1">
                {semesterDistData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[10px] font-bold text-slate-500">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WHAT → Periode per Tahun */}
            <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Periode per Tahun</h3>
                  <p className="text-[10px] text-slate-400">Jumlah periode tiap tahun ajaran</p>
                </div>
              </div>
              <div className="h-[160px] w-full">
                {yearDistData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={yearDistData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Periode" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center"><span className="text-xs text-slate-400 italic">Tidak ada data</span></div>}
              </div>
            </div>

            {/* HOW → Status Aktif vs Tidak */}
            <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>toggle_on</span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Status Periode</h3>
                  <p className="text-[10px] text-slate-400">Aktif vs Tidak aktif</p>
                </div>
              </div>
              <div className="h-[160px] w-full flex items-center justify-center">
                {allPeriods.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={[{name:'Aktif', value:activeCount},{name:'Tidak Aktif', value:inactiveCount}]} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                        <Cell fill="#10b981" /><Cell fill="#e2e8f0" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <span className="text-xs text-slate-400 italic">Tidak ada data</span>}
              </div>
              <div className="flex justify-center gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500">Aktif: {activeCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-500">Tidak: {inactiveCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Period Card */}
        {current && !loading && (
          <div className="glass-card border border-slate-200/60 rounded-2xl shadow-none overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-sm uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h2)' }}>Periode Aktif Saat Ini</h2>
                <p className="text-xs text-slate-500 mt-0.5">Konfigurasi semester yang sedang berjalan (Read-Only)</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Tahun Akademik', value: current.activeYear },
                { label: 'Semester',       value: current.activeSemester },
                { label: 'Portal Beasiswa', value: current.isKrsOpen    ? 'TERBUKA' : 'TERTUTUP', ok: current.isKrsOpen },
                { label: 'Layanan Aspirasi', value: current.isGradeInputOpen ? 'TERBUKA' : 'TERTUTUP', ok: current.isGradeInputOpen },
              ].map(item => (
                <div key={item.label} className="bg-transparent/50 border border-slate-200/60 rounded-xl p-4">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{item.label}</p>
                  <p className={cn('text-sm font-extrabold uppercase',
                    item.ok === true  ? 'text-emerald-600' :
                    item.ok === false ? 'text-rose-500'    : 'text-slate-900')}>
                    {item.value || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Periods Timeline */}
        {!loading && allPeriods.length > 1 && (
          <div className="glass-card border border-slate-200/60 rounded-2xl shadow-none overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-sm uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h2)' }}>Riwayat Periode Akademik</h2>
                <p className="text-xs text-slate-500 mt-0.5">Semua periode yang pernah dikonfigurasi</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/60">
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Periode</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Tahun</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Semester</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">KRS</th>
                  </tr>
                </thead>
                <tbody>
                  {allPeriods.map((p, i) => (
                    <tr key={p.ID || i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5 font-bold text-sm text-slate-900">{p.Name || `${p.Semester} ${p.AcademicYear}`}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-600">{p.AcademicYear || '—'}</td>
                      <td className="px-5 py-3.5"><span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">{p.Semester || '—'}</span></td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase',
                          p.IsActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200')}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', p.IsActive ? 'bg-emerald-500' : 'bg-slate-300')} />
                          {p.IsActive ? 'Aktif' : 'Tidak'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-lg',
                          p.IsKRSOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-500')}>
                          {p.IsKRSOpen ? 'BUKA' : 'TUTUP'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && data.length === 0 && (
          <div className="glass-card rounded-2xl border border-slate-200/60 shadow-none p-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '28px' }} >calendar_month</span></div>
              <p className="font-bold text-lg text-slate-900">Belum Ada Periode Akademik</p>
              <p className="text-sm text-slate-400">Silakan hubungi Super Admin untuk menginisialisasi periode semester aktif.</p>
            </div>
          </div>
        )}
    </PageContent>
  )
}
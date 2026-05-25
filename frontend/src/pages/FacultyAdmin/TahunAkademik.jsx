"use client"

import React, { useState, useEffect } from "react"
import api from "../../lib/axios"
import { toast, Toaster } from "react-hot-toast"

import { cn } from "@/lib/utils"

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
      const res = await api.get("/faculty/academic-periods")
      if (res.data.status === "success" && res.data.data) setData([res.data.data])
    } catch { toast.error("Gagal mengambil data periode") }
    finally { setLoading(false) }
  }

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
    <div className="min-h-screen bg-[#F8FAFC] font-body">
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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Manajemen Kalender Hub</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
                Periode <span className="text-primary">Akademik</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">
                Konfigurasi semester aktif, serta buka/tutup portal pendaftaran beasiswa dan pengajuan aspirasi mahasiswa.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchData} disabled={loading}
                className="h-11 px-5 rounded-xl border border-slate-200/60 bg-white text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50/50 gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60">
                {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <RefreshCw size={14} className="text-primary" />} Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Siklus Aktif',  value: current?.activeYear || 'IDLE',     icon: CalendarDays, bg: 'bg-[#eef4ff]',  color: 'text-primary',   desc: 'Tahun akademik berjalan' },
            { label: 'Semester',      value: current?.activeSemester || '—',     icon: Clock,        bg: 'bg-emerald-50', color: 'text-emerald-600', desc: 'Periode semester saat ini' },
            { label: 'Portal Beasiswa', value: current?.isKrsOpen ? 'OPEN' : 'CLOSED', icon: Award, bg: current?.isKrsOpen ? 'bg-emerald-50' : 'bg-slate-50', color: current?.isKrsOpen ? 'text-emerald-600' : 'text-slate-500', desc: 'Akses pendaftaran beasiswa' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
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

        {/* Current Period Card */}
        {current && !loading && (
          <div className="bg-white border border-slate-100/50 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-slate-900">Periode Aktif Saat Ini</h2>
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
                <div key={item.label} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
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

        {/* Empty state */}
        {!loading && data.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '28px' }} >calendar_month</span></div>
              <p className="font-bold text-lg text-slate-900">Belum Ada Periode Akademik</p>
              <p className="text-sm text-slate-400">Silakan hubungi Super Admin untuk menginisialisasi periode semester aktif.</p>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
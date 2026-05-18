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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Manajemen Kalender Akademik</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
                Periode <span className="text-primary">Akademik</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">
                Konfigurasi semester aktif, buka/tutup portal KRS, dan input nilai mahasiswa.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchData} disabled={loading}
                className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60">
                {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <RefreshCw size={14} className="text-primary" />} Refresh
              </button>
              <button onClick={handleOpenAdd}
                className="h-11 px-5 rounded-xl bg-[#00236F] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest gap-2 flex items-center transition-all active:scale-95 shadow-lg shadow-[#00236F]/20">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >add</span> Parameter Baru
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Siklus Aktif',  value: current?.activeYear || 'IDLE',     icon: CalendarDays, bg: 'bg-[#eef4ff]',  color: 'text-[#00236F]',   desc: 'Tahun akademik berjalan' },
            { label: 'Semester',      value: current?.activeSemester || '—',     icon: Clock,        bg: 'bg-emerald-50', color: 'text-emerald-600', desc: 'Periode semester saat ini' },
            { label: 'Status KRS',    value: current?.isKrsOpen ? 'OPEN' : 'CLOSED', icon: CheckCircle2, bg: current?.isKrsOpen ? 'bg-emerald-50' : 'bg-slate-50', color: current?.isKrsOpen ? 'text-emerald-600' : 'text-slate-500', desc: 'Portal pengisian KRS' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg, s.color)}><s.icon size={18} /></div>
                <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-xl font-extrabold text-[#171717] leading-none tabular-nums uppercase">
                {loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span> : s.value}
              </p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Current Period Card */}
        {current && !loading && (
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-[#171717]">Periode Aktif Saat Ini</h2>
                <p className="text-xs text-[#737373] mt-0.5">Konfigurasi semester yang sedang berjalan</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenEdit(current)}
                  className="h-9 px-4 flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all">
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }} >edit</span> Edit
                </button>
                <button onClick={() => setDelTarget(current)}
                  className="h-9 px-4 flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-all">
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }} >delete</span> Hapus
                </button>
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Tahun Akademik', value: current.activeYear },
                { label: 'Semester',       value: current.activeSemester },
                { label: 'Portal KRS',     value: current.isKrsOpen    ? 'TERBUKA' : 'TERTUTUP', ok: current.isKrsOpen },
                { label: 'Input Nilai',    value: current.isGradeInputOpen ? 'TERBUKA' : 'TERTUTUP', ok: current.isGradeInputOpen },
              ].map(item => (
                <div key={item.label} className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-4">
                  <p className="text-[9px] font-bold text-[#a3a3a3] uppercase tracking-[0.15em] mb-1">{item.label}</p>
                  <p className={cn('text-sm font-extrabold uppercase',
                    item.ok === true  ? 'text-emerald-600' :
                    item.ok === false ? 'text-rose-500'    : 'text-[#171717]')}>
                    {item.value || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && data.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '28px' }} Days >calendar_month</span></div>
              <p className="font-bold text-lg text-[#171717]">Belum Ada Periode Akademik</p>
              <p className="text-sm text-[#a3a3a3]">Klik "Parameter Baru" untuk menginisialisasi periode semester.</p>
              <button onClick={handleOpenAdd} className="mt-2 h-11 px-6 rounded-xl bg-[#00236F] text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#001a52] transition-all shadow-lg shadow-[#00236F]/20">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >add</span> Parameter Baru
              </button>
            </div>
          </div>
        )}

      </div>

      {/* CRUD Modal */}
      {isCrudOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setCrudOpen(false)}>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-[#00236F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
              <button onClick={() => setCrudOpen(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span></button>
              <div className="relative z-10">
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">{isEditMode ? 'Edit Periode' : 'Periode Baru'}</p>
                <h2 className="text-xl font-extrabold text-white">{isEditMode ? 'Update Periode Akademik' : 'Inisialisasi Periode Baru'}</h2>
                <p className="text-xs text-blue-200 mt-1">Konfigurasi semester berjalan dan jadwal input nilai fakultas.</p>
              </div>
            </div>
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Tahun Akademik</label>
                    <input value={formData.activeYear} onChange={e => set('activeYear', e.target.value)} placeholder="Contoh: 2024/2025" required
                      className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-bold text-[#171717] focus:outline-none focus:border-primary focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Tipe Semester</label>
                    <select value={formData.activeSemester} onChange={e => set('activeSemester', e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-medium text-[#171717] focus:outline-none focus:border-primary appearance-none">
                      <option value="Ganjil">Ganjil (Odd)</option>
                      <option value="Genap">Genap (Even)</option>
                      <option value="Antara">Antara (Short)</option>
                    </select>
                  </div>
                </div>

                {/* Toggle KRS */}
                <div>
                  <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Akses Portal KRS</label>
                  <button type="button" onClick={() => set('isKrsOpen', !formData.isKrsOpen)}
                    className={cn('w-full h-14 flex items-center justify-between px-5 rounded-xl border-2 transition-all', formData.isKrsOpen ? 'border-emerald-400 bg-emerald-50' : 'border-[#e5e5e5] bg-[#fafafa] hover:border-[#c5c5c5]')}>
                    <div className="flex items-center gap-3">
                      <div className={cn('w-2.5 h-2.5 rounded-full transition-colors', formData.isKrsOpen ? 'bg-emerald-500' : 'bg-slate-300')} />
                      <span className={cn('text-sm font-bold uppercase tracking-wider', formData.isKrsOpen ? 'text-emerald-700' : 'text-[#a3a3a3]')}>
                        {formData.isKrsOpen ? 'Terbuka — Mahasiswa dapat mengisi KRS' : 'Tertutup — Portal KRS tidak aktif'}
                      </span>
                    </div>
                    {formData.isKrsOpen ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-slate-300" />}
                  </button>
                </div>

                {/* Toggle Nilai */}
                <div>
                  <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Input Nilai</label>
                  <button type="button" onClick={() => set('isGradeInputOpen', !formData.isGradeInputOpen)}
                    className={cn('w-full h-14 flex items-center justify-between px-5 rounded-xl border-2 transition-all', formData.isGradeInputOpen ? 'border-indigo-400 bg-indigo-50' : 'border-[#e5e5e5] bg-[#fafafa] hover:border-[#c5c5c5]')}>
                    <div className="flex items-center gap-3">
                      <div className={cn('w-2.5 h-2.5 rounded-full transition-colors', formData.isGradeInputOpen ? 'bg-indigo-500' : 'bg-slate-300')} />
                      <span className={cn('text-sm font-bold uppercase tracking-wider', formData.isGradeInputOpen ? 'text-indigo-700' : 'text-[#a3a3a3]')}>
                        {formData.isGradeInputOpen ? 'Terbuka — Dosen dapat mengisi nilai' : 'Tertutup — Input nilai tidak aktif'}
                      </span>
                    </div>
                    {formData.isGradeInputOpen ? <ToggleRight size={24} className="text-indigo-500" /> : <ToggleLeft size={24} className="text-slate-300" />}
                  </button>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex gap-3 flex-shrink-0">
                <button type="button" onClick={() => setCrudOpen(false)} className="flex-1 h-11 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold text-[#525252] uppercase tracking-widest hover:bg-[#f5f5f5] transition-all">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-11 rounded-xl bg-[#00236F] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#00236F]/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >save</span>}
                  {isEditMode ? 'Update Periode' : 'Inisialisasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setDelTarget(null)}>
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-4"><span className="material-symbols-outlined" style={{ fontSize: '24px' }} >delete</span></div>
            <h3 className="text-lg font-extrabold text-[#171717] mb-2">Hapus Periode?</h3>
            <p className="text-sm text-[#737373] mb-1">Periode <span className="font-bold text-[#171717]">"{delTarget.activeYear} — {delTarget.activeSemester}"</span> akan dihapus.</p>
            <p className="text-xs text-[#a3a3a3] mb-6">Tindakan ini akan menghentikan seluruh aktivitas akademik pada periode tersebut.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelTarget(null)} className="flex-1 h-11 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold text-[#525252] uppercase tracking-widest hover:bg-[#f5f5f5] transition-all">Batal</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-600/20 disabled:opacity-60 flex items-center justify-center gap-2">
                {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '13px' }} >delete</span>} Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
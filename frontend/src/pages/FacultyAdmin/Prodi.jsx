"use client"

import React, { useState, useEffect } from "react"

import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { pddiktiService, API_BASE_URL } from "../../services/api"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;



const API = `${API_BASE_URL}/faculty`

const AKRED_STYLES = {
  'Unggul':     { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Baik Sekali':{ cls: 'bg-blue-50 text-blue-700 border-blue-200',         dot: 'bg-blue-500' },
  'Baik':       { cls: 'bg-slate-50 text-slate-600 border-slate-200',       dot: 'bg-slate-400' },
  'A':          { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'B':          { cls: 'bg-blue-50 text-blue-700 border-blue-200',         dot: 'bg-blue-500' },
}

const JENJANG_COLORS = {
  'S1': 'bg-[#eef4ff] text-[#00236F]',
  'S2': 'bg-purple-50 text-purple-700',
  'D3': 'bg-amber-50 text-amber-700',
}

const EMPTY_FORM = { ID: null, FakultasID: "", Kode: "", Nama: "", Jenjang: "S1", Akreditasi: "Baik", Kapasitas: 100 }

export default function ProdiPage() {
  const [majors, setMajors]         = useState([])
  const [faculties, setFaculties]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [isModalOpen, setIsModal]   = useState(false)
  const [isEditMode, setIsEdit]     = useState(false)
  const [isSubmitting, setIsSub]    = useState(false)
  const [deleteTarget, setDelTarget]= useState(null)
  const [formData, setFormData]     = useState(EMPTY_FORM)

  const fetchMajors = async () => {
    setLoading(true)
    try {
      const res = await pddiktiService.fetchData('Bhakti Kencana', 'prodi')
      const list = res?.prodi || res?.data?.prodi || (Array.isArray(res) ? res : [])
      setMajors(list.map((p, i) => ({
        ID: p.id, Nama: p.nama, Jenjang: p.jenjang,
        Akreditasi: ['Unggul', 'Baik Sekali', 'Baik'][i % 3],
        Kapasitas: 120,
        CurrentMahasiswa: Math.floor(Math.random() * 110),
        Fakultas: { Nama: 'Univ. Bhakti Kencana' }
      })))
    } catch { toast.error("Gagal memuat data prodi") }
    finally { setLoading(false) }
  }

  const fetchFaculties = async () => {
    try {
      const res  = await fetch(`${API}/faculties`)
      const json = await res.json()
      if (json.status === 'success') setFaculties(json.data)
    } catch {}
  }

  useEffect(() => { fetchMajors(); fetchFaculties() }, [])

  const openAdd = () => { setIsEdit(false); setFormData(EMPTY_FORM); setIsModal(true) }
  const openEdit = (p) => {
    setIsEdit(true)
    setFormData({ ID: p.ID, FakultasID: String(p.FakultasID || ''), Kode: p.Kode || '', Nama: p.Nama, Jenjang: p.Jenjang || 'S1', Akreditasi: p.Akreditasi || 'Baik', Kapasitas: p.Kapasitas || 100 })
    setIsModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSub(true)
    const url    = isEditMode ? `${API}/courses/${formData.ID}` : `${API}/courses`
    const method = isEditMode ? 'PUT' : 'POST'
    try {
      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, FakultasID: parseInt(formData.FakultasID), Kapasitas: parseInt(formData.Kapasitas) }) })
      const json = await res.json()
      if (res.ok && json.status === 'success') {
        toast.success(isEditMode ? "Prodi diperbarui" : "Prodi ditambahkan")
        setIsModal(false); fetchMajors()
      } else {
        toast.error(json.message?.includes('Duplicate') ? 'Kode/Nama sudah digunakan' : json.message || 'Gagal menyimpan')
      }
    } catch { toast.error("Sistem sibuk, coba lagi") }
    finally { setIsSub(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsSub(true)
    try {
      const res  = await fetch(`${API}/courses/${deleteTarget.ID}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.status === 'success') { toast.success("Program studi dihapus"); setDelTarget(null); fetchMajors() }
      else toast.error("Gagal menghapus prodi")
    } catch { toast.error("Gagal menghapus") }
    finally { setIsSub(false) }
  }

  const set = (k, v) => setFormData(prev => ({ ...prev, [k]: v }))

  const filtered = majors.filter(m => {
    const q = search.toLowerCase()
    return !q || m.Nama?.toLowerCase().includes(q) || m.Jenjang?.toLowerCase().includes(q)
  })

  const stats = {
    total:    majors.length,
    unggul:   majors.filter(m => m.Akreditasi === 'Unggul' || m.Akreditasi === 'A').length,
    kapasitas: majors.reduce((a, m) => a + (m.Kapasitas || 0), 0),
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-body">
      <Toaster position="top-right" />
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-6">

        {/* ── Header ── */}
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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Data Master Akademik</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
                Program <span className="text-primary">Studi</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">
                Kelola program studi, jenjang pendidikan, akreditasi, dan kapasitas penerimaan mahasiswa.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchMajors} disabled={loading}
                className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60">
                {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <RefreshCw size={14} className="text-primary" />}
                Refresh
              </button>
              <button onClick={openAdd}
                className="h-11 px-5 rounded-xl bg-[#00236F] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest gap-2 flex items-center transition-all active:scale-95 shadow-lg shadow-[#00236F]/20">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >add</span>
                Tambah Prodi
              </button>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Program Studi', value: stats.total,    icon: GraduationCap, bg: 'bg-[#eef4ff]', color: 'text-[#00236F]', desc: 'Prodi terdaftar' },
            { label: 'Akreditasi Unggul',   value: stats.unggul,   icon: CheckCircle2,  bg: 'bg-emerald-50', color: 'text-emerald-600', desc: 'Prodi Unggul / A' },
            { label: 'Total Kapasitas',     value: stats.kapasitas, icon: Users,        bg: 'bg-indigo-50',  color: 'text-indigo-600', desc: 'Slot mahasiswa tersedia' },
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

        {/* ── Table ── */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-[#f0f0f0] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-base text-[#171717]">Daftar Program Studi</h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Menampilkan <span className="font-bold text-[#171717]">{filtered.length}</span> dari <span className="font-bold text-primary">{majors.length}</span> program studi
              </p>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" style={{ fontSize: '14px' }} >search</span>
              <input type="text" placeholder="Cari nama atau jenjang..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 h-9 w-56 rounded-xl border border-[#e5e5e5] focus:outline-none focus:border-primary text-sm bg-white" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  {['#', 'Program Studi', 'Jenjang', 'Akreditasi', 'Kapasitas & Mahasiswa', 'Aksi'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#f0f0f0]">
                    {[...Array(6)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-[#f5f5f5] rounded animate-pulse" /></td>)}
                  </tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >school</span></div>
                      <p className="font-bold text-sm text-[#171717]">Tidak Ada Program Studi</p>
                      <p className="text-xs text-[#a3a3a3]">Klik "Tambah Prodi" untuk mendaftarkan program studi baru.</p>
                    </div>
                  </td></tr>
                ) : filtered.map((row, i) => {
                  const ak = AKRED_STYLES[row.Akreditasi] || AKRED_STYLES['Baik']
                  const jk = JENJANG_COLORS[row.Jenjang] || 'bg-slate-50 text-slate-600'
                  const pct = Math.min(100, Math.round(((row.CurrentMahasiswa || 0) / (row.Kapasitas || 1)) * 100))
                  return (
                    <tr key={row.ID || i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-4 text-sm text-[#a3a3a3] font-medium">{i + 1}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-sm text-[#171717]">{row.Nama}</p>
                        <p className="text-[10px] text-[#a3a3a3] font-medium mt-0.5">{row.Fakultas?.Nama}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider', jk)}>
                          {row.Jenjang || 'S1'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider', ak.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', ak.dot)} />
                          {row.Akreditasi}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-[80px]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-[#a3a3a3] font-medium">{row.CurrentMahasiswa || 0} / {row.Kapasitas}</span>
                              <span className="text-[10px] font-bold text-primary">{pct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", pct > 90 ? "bg-rose-500" : "bg-gradient-to-r from-[#00236F] to-[#3b82f6]")}
                                style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(row)}
                            className="p-1.5 text-[#a3a3a3] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >edit</span>
                          </button>
                          <button onClick={() => setDelTarget(row)}
                            className="p-1.5 text-[#a3a3a3] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus">
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── CRUD Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setIsModal(false)}>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]"
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
              <button onClick={() => setIsModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span>
              </button>
              <div className="relative z-10">
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">
                  {isEditMode ? 'Edit Program Studi' : 'Tambah Program Studi'}
                </p>
                <h2 className="text-xl font-extrabold text-white">{isEditMode ? 'Update Data Prodi' : 'Registrasi Prodi Baru'}</h2>
                <p className="text-xs text-blue-200 mt-1">Isi semua data dengan benar sebelum menyimpan.</p>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {/* Fakultas */}
                <div>
                  <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Fakultas Naungan</label>
                  <select value={formData.FakultasID} onChange={e => set('FakultasID', e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-medium text-[#171717] focus:outline-none focus:border-primary focus:bg-white transition-all appearance-none">
                    <option value="">Pilih Fakultas...</option>
                    {faculties.map(f => f.ID != null && <option key={f.ID} value={String(f.ID)}>{f.Nama}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Kode / Akronim</label>
                    <input value={formData.Kode} onChange={e => set('Kode', e.target.value.toUpperCase())}
                      placeholder="TI, SI, MN..." required
                      className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-bold text-[#171717] focus:outline-none focus:border-primary focus:bg-white transition-all uppercase" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Jenjang</label>
                    <select value={formData.Jenjang} onChange={e => set('Jenjang', e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-medium text-[#171717] focus:outline-none focus:border-primary focus:bg-white transition-all appearance-none">
                      <option value="S1">S1 - Sarjana</option>
                      <option value="D3">D3 - Diploma</option>
                      <option value="S2">S2 - Magister</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Nama Lengkap Program Studi</label>
                  <input value={formData.Nama} onChange={e => set('Nama', e.target.value)}
                    placeholder="Nama resmi prodi..." required
                    className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-medium text-[#171717] focus:outline-none focus:border-primary focus:bg-white transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Akreditasi</label>
                    <select value={formData.Akreditasi} onChange={e => set('Akreditasi', e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-medium text-[#171717] focus:outline-none focus:border-primary focus:bg-white transition-all appearance-none">
                      <option value="Unggul">Unggul</option>
                      <option value="Baik Sekali">Baik Sekali</option>
                      <option value="Baik">Baik</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Kapasitas (MHS)</label>
                    <input type="number" value={formData.Kapasitas} onChange={e => set('Kapasitas', e.target.value)} min={1}
                      className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-black text-center text-[#171717] focus:outline-none focus:border-primary focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex gap-3 flex-shrink-0">
                <button type="button" onClick={() => setIsModal(false)}
                  className="flex-1 h-11 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold text-[#525252] uppercase tracking-widest hover:bg-[#f5f5f5] transition-all">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl bg-[#00236F] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#00236F]/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '15px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >save</span>}
                  {isEditMode ? 'Update Prodi' : 'Simpan Prodi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setDelTarget(null)}>
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-4">
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >delete</span>
              </div>
              <h3 className="text-lg font-extrabold text-[#171717] mb-2">Hapus Program Studi?</h3>
              <p className="text-sm text-[#737373] leading-relaxed mb-1">
                Anda akan menghapus <span className="font-bold text-[#171717]">"{deleteTarget.Nama}"</span>.
              </p>
              <p className="text-xs text-[#a3a3a3] mb-6">Tindakan ini tidak dapat dibatalkan dan berdampak pada data mahasiswa terkait.</p>
              <div className="flex gap-3">
                <button onClick={() => setDelTarget(null)}
                  className="flex-1 h-11 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold text-[#525252] uppercase tracking-widest hover:bg-[#f5f5f5] transition-all">
                  Batal
                </button>
                <button onClick={handleDelete} disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-600/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '13px' }} >delete</span>}
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

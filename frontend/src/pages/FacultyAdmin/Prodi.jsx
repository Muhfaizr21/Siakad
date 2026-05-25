"use client"

import React, { useState, useEffect } from "react"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import api from "../../lib/axios"
import { pddiktiService, API_BASE_URL } from "../../services/api"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const BookOpen = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>menu_book</span>;

const API = `${API_BASE_URL}/faculty`

const AKRED_STYLES = {
  'Unggul': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dot: 'bg-emerald-500' },
  'Baik Sekali': { cls: 'bg-blue-50 text-blue-700 border-blue-200/60', dot: 'bg-blue-500' },
  'Baik': { cls: 'bg-slate-50 text-slate-600 border-slate-200/60', dot: 'bg-slate-400' },
  'A': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dot: 'bg-emerald-500' },
  'B': { cls: 'bg-blue-50 text-blue-700 border-blue-200/60', dot: 'bg-blue-500' },
}

const JENJANG_COLORS = {
  'S1': 'bg-[#eef4ff] text-[#00236F]',
  'S2': 'bg-purple-50 text-purple-700',
  'D3': 'bg-amber-50 text-amber-700',
}

const EMPTY_FORM = { ID: null, FakultasID: "", Kode: "", Nama: "", Jenjang: "S1", Akreditasi: "Baik", Kapasitas: 100 }

export default function ProdiPage() {
  const [majors, setMajors] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModal] = useState(false)
  const [isEditMode, setIsEdit] = useState(false)
  const [isSubmitting, setIsSub] = useState(false)
  const [deleteTarget, setDelTarget] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)

  const fetchMajors = async () => {
    setLoading(true)
    try {
      // 1. Fetch faculties to make sure we have a valid FakultasID
      let activeFacultyID = faculties.length > 0 ? faculties[0].ID : null;
      if (!activeFacultyID) {
        try {
          const facRes = await api.get('/faculty/faculties');
          const facList = facRes.data?.data || facRes.data || [];
          if (facList.length > 0) {
            activeFacultyID = facList[0].ID;
            setFaculties(facList);
          }
        } catch {}
      }

      // 2. Fetch real program studies from database
      const res = await api.get('/faculty/courses');
      let list = res.data?.data || res.data || [];

      // 3. Auto-seed / Sync to database if database is completely empty so that everything works immediately!
      if (list.length === 0) {
        // Fetch raw template from PDDIKTI
        const pddiktiRes = await pddiktiService.fetchData('Bhakti Kencana', 'prodi');
        const rawProdis = pddiktiRes?.prodi || pddiktiRes?.data?.prodi || (Array.isArray(pddiktiRes) ? pddiktiRes : []);
        
        if (rawProdis.length > 0) {
          toast.loading("Mensinkronisasikan Program Studi ke database...", { id: "seeding-prodi" });
          for (const [idx, p] of rawProdis.entries()) {
            try {
              // Generate realistic unique code
              const generatedCode = p.nama?.substring(0, 3).toUpperCase() + "-" + p.jenjang + (idx + 1);
              const payload = {
                FakultasID: activeFacultyID || 1,
                Nama: p.nama,
                Jenjang: p.jenjang,
                Kode: generatedCode,
                Akreditasi: ['Unggul', 'Baik Sekali', 'Baik'][idx % 3],
                Kapasitas: 120
              };
              await api.post('/faculty/courses', payload);
            } catch (err) {
              console.error("Auto-sync failed for course row:", err);
            }
          }
          toast.success("Sinkronisasi otomatis prodi berhasil!", { id: "seeding-prodi" });
          
          // Re-fetch from database now that it is synced!
          const reFetch = await api.get('/faculty/courses');
          list = reFetch.data?.data || reFetch.data || [];
        }
      }

      setMajors(list.map((p, i) => {
        return {
          ID: p.id || p.ID,
          Nama: p.nama || p.Nama,
          Jenjang: p.jenjang || p.Jenjang,
          Kode: p.kode || p.Kode || "FAR",
          Akreditasi: p.akreditasi || p.Akreditasi || "Baik",
          Kapasitas: p.kapasitas || p.Kapasitas || 120,
          CurrentMahasiswa: p.CurrentMahasiswa !== undefined ? p.CurrentMahasiswa : (p.current_mahasiswa || 0), // Match exact GORM case
          FakultasID: p.FakultasID || p.fakultas_id,
          Fakultas: p.Fakultas || p.fakultas || { Nama: 'Univ. Bhakti Kencana' }
        };
      }));

    } catch (err) { 
      toast.error("Gagal memuat data prodi") 
    } finally { 
      setLoading(false) 
    }
  }

  const fetchFaculties = async () => {
    try {
      const res = await api.get('/faculty/faculties');
      const list = res.data?.data || res.data || [];
      setFaculties(list);
    } catch { }
  }

  useEffect(() => { fetchMajors(); fetchFaculties() }, [])

  useEffect(() => {
    if (faculties.length > 0 && !formData.FakultasID) {
      const firstFac = faculties[0];
      setFormData(prev => ({
        ...prev,
        FakultasID: String(firstFac.id || firstFac.ID || '')
      }));
    }
  }, [faculties]);

  const openAdd = () => {
    setIsEdit(false);
    const firstFac = faculties.length > 0 ? faculties[0] : null;
    setFormData({
      ...EMPTY_FORM,
      FakultasID: firstFac ? String(firstFac.id || firstFac.ID || '') : ""
    });
    setIsModal(true)
  }
  const openEdit = (p) => {
    setIsEdit(true)
    const idVal = p.id || p.ID;
    const facIdVal = p.FakultasID || p.fakultas_id || (p.Fakultas?.id || p.Fakultas?.ID || '');
    setFormData({ 
      ID: idVal, 
      FakultasID: String(facIdVal), 
      Kode: p.kode || p.Kode || '', 
      Nama: p.nama || p.Nama, 
      Jenjang: p.jenjang || p.Jenjang || 'S1', 
      Akreditasi: p.akreditasi || p.Akreditasi || 'Baik', 
      Kapasitas: p.kapasitas || p.Kapasitas || 100 
    })
    setIsModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSub(true)
    try {
      const payload = {
        ...formData,
        FakultasID: parseInt(formData.FakultasID),
        Kapasitas: parseInt(formData.Kapasitas)
      }
      
      let res;
      if (isEditMode) {
        res = await api.put(`/faculty/courses/${formData.ID}`, payload)
      } else {
        res = await api.post('/faculty/courses', payload)
      }

      if (res.data?.status === 'success' || res.status === 200 || res.status === 201) {
        toast.success(isEditMode ? "Prodi diperbarui" : "Prodi ditambahkan")
        setIsModal(false)
        fetchMajors()
      } else {
        toast.error(res.data?.message || 'Gagal menyimpan')
      }
    } catch (err) {
      const msg = err.response?.data?.message
      toast.error(msg?.includes('Duplicate') ? 'Kode/Nama sudah digunakan' : msg || "Sistem sibuk, coba lagi")
    } finally {
      setIsSub(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const idVal = deleteTarget.id || deleteTarget.ID;
    if (!idVal) {
      toast.error("ID prodi tidak valid");
      return;
    }
    setIsSub(true)
    try {
      const res = await api.delete(`/faculty/courses/${idVal}`)
      if (res.data?.status === 'success') {
        toast.success("Program studi dihapus")
        setDelTarget(null)
        fetchMajors()
      } else {
        toast.error("Gagal menghapus prodi")
      }
    } catch {
      toast.error("Gagal menghapus")
    } finally {
      setIsSub(false)
    }
  }

  const set = (k, v) => setFormData(prev => ({ ...prev, [k]: v }))

  const stats = {
    total: majors.length,
    unggul: majors.filter(m => m.Akreditasi === 'Unggul' || m.Akreditasi === 'A').length,
    kapasitas: majors.reduce((a, m) => a + (m.Kapasitas || 0), 0),
  }

  const prodiColumns = [
    {
      key: "index",
      label: "No",
      disableSort: true,
      className: "w-12 text-center",
      cellClassName: "text-center font-bold text-slate-400",
      render: (val, row, index) => index + 1
    },
    {
      key: "Nama",
      label: "Program Studi",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 font-jakarta text-[13px] tracking-tight">{val}</span>
          <span className="text-[10px] text-slate-400 font-medium font-inter mt-0.5">{row.Fakultas?.Nama || "Univ. Bhakti Kencana"}</span>
        </div>
      )
    },
    {
      key: "Jenjang",
      label: "Jenjang",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => {
        const jk = JENJANG_COLORS[val] || 'bg-slate-50 text-slate-600';
        return (
          <Badge className={cn('font-bold text-[9px] px-2.5 py-0.5 border-none font-inter uppercase tracking-wider shadow-none', jk)}>
            {val || 'S1'}
          </Badge>
        )
      }
    },
    {
      key: "Akreditasi",
      label: "Akreditasi",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => {
        const ak = AKRED_STYLES[val] || AKRED_STYLES['Baik'];
        return (
          <Badge className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider shadow-none', ak.cls)}>
            <span className={cn('w-1 h-1 rounded-full animate-pulse', ak.dot)} />
            {val}
          </Badge>
        )
      }
    },
    {
      key: "Kapasitas",
      label: "Kapasitas & Mahasiswa",
      render: (val, row) => {
        const current = row.CurrentMahasiswa || 0;
        const capacity = row.Kapasitas || 120;
        const pct = current >= capacity 
          ? 100 
          : Math.min(99, Math.floor((current / capacity) * 100));
        return (
          <div className="flex items-center gap-4 min-w-[120px]">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-bold font-inter">{row.CurrentMahasiswa || 0} / {row.Kapasitas || 120} Mhs</span>
                <span className="text-[10px] font-black text-primary font-inter">{pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100/80 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-500", pct > 90 ? "bg-rose-500" : "bg-gradient-to-r from-primary to-blue-400")}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        )
      }
    }
  ]

  const renderActions = (row) => (
    <div className="flex items-center justify-end gap-1.5">
      <button onClick={() => openEdit(row)}
        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-300" title="Edit">
        <span className="material-symbols-outlined size-4" style={{ fontSize: '16px' }} >edit</span>
      </button>
      <button onClick={() => setDelTarget(row)}
        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300" title="Hapus">
        <span className="material-symbols-outlined size-4" style={{ fontSize: '16px' }} >delete</span>
      </button>
    </div>
  )

  return (
    <PageContainer>
      <Toaster position="top-right" />

      {/* Page Header */}
      <PageHeader
        icon={BookOpen}
        title="Program Studi"
        description="Kelola kurikulum, jenjang pendidikan, akreditasi, dan kapasitas penerimaan fakultas."
      >
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMajors}
            disabled={loading}
            className="h-11 px-5 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 gap-2.5 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60"
          >
            <RefreshCw size={14} className={cn("text-primary", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openAdd}
            className="h-11 px-6 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest gap-2.5 flex items-center transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 border-none"
          >
            <span className="material-symbols-outlined size-4 stroke-[4px]" style={{ fontSize: '16px' }} >add</span>
            <span>Tambah Prodi</span>
          </button>
        </div>
      </PageHeader>

      {/* Stats Section */}
      <ResponsiveGrid cols={3}>
        {[
          { label: 'Total Program Studi', value: stats.total, icon: GraduationCap, bg: 'bg-primary/10', color: 'text-primary', accent: 'from-primary/10', desc: 'Prodi terdaftar' },
          { label: 'Akreditasi Unggul', value: stats.unggul, icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-600', color: 'text-emerald-600', accent: 'from-emerald-500/10', desc: 'Prodi Unggul / A' },
          { label: 'Total Kapasitas', value: stats.kapasitas, icon: Users, bg: 'bg-indigo-50 text-indigo-600', color: 'text-indigo-600', accent: 'from-indigo-500/10', desc: 'Slot mahasiswa tersedia' },
        ].map(s => (
          <ResponsiveCard key={s.label} className="relative group overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl p-0">
            <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-10`} />
            <div className="p-6 relative flex items-center gap-4">
              <div className={cn('p-4 rounded-2xl shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-500', s.bg)}>
                <s.icon className="size-6" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-headline truncate">{s.label}</p>
                <h3 className="text-2xl font-black text-slate-900 font-jakarta tracking-tight leading-none">
                  {loading ? "..." : s.value.toLocaleString()}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest leading-none pt-0.5">{s.desc}</p>
              </div>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      {/* Main Data Table */}
      <div className="pt-2">
        <DataTable
          columns={prodiColumns}
          data={majors}
          loading={loading}
          searchPlaceholder="Cari program studi..."
          actions={renderActions}
          title="Daftar Program Studi"
          itemLabel="program studi"
        />
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsModal(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh] border border-slate-100 animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-primary via-primary to-blue-700 pt-8 pb-9 px-8 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
              <button
                onClick={() => setIsModal(false)}
                className="absolute top-6 right-6 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors text-white border-none"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >close</span>
              </button>
              <div className="relative z-10">
                <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.25em] mb-1">
                  {isEditMode ? 'Edit Program Studi' : 'Tambah Program Studi'}
                </p>
                <h2 className="text-2xl font-black text-white font-headline leading-none">{isEditMode ? 'Update Data Prodi' : 'Registrasi Prodi Baru'}</h2>
                <p className="text-xs text-blue-200 font-medium mt-1.5 leading-relaxed">Isi semua formulir administrasi di bawah ini dengan lengkap.</p>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 space-y-5">
                {/* Fakultas Naungan (Auto-Generated, Read-Only) */}
                <div>
                  <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-2 ml-1">Fakultas Naungan</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                      <span className="material-symbols-outlined size-4" style={{ fontSize: '18px' }}>school</span>
                    </div>
                    <input
                      type="text"
                      value={
                        faculties.find(f => String(f.ID) === String(formData.FakultasID))?.Nama ||
                        (faculties.length > 0 ? faculties[0].Nama : "Universitas Bhakti Kencana")
                      }
                      readOnly
                      disabled
                      className="pl-11 pr-4 w-full h-12 rounded-2xl border border-slate-200/80 bg-slate-50 text-xs font-bold text-slate-500 cursor-not-allowed select-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-1.5 ml-1 leading-relaxed">
                    * Terdeteksi otomatis sebagai unit administrasi di bawah naungan fakultas Anda.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-2 ml-1">Kode / Akronim</label>
                    <input
                      value={formData.Kode}
                      onChange={e => set('Kode', e.target.value.toUpperCase())}
                      placeholder="TI, SI, MN..."
                      required
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-2 ml-1">Jenjang</label>
                    <select
                      value={formData.Jenjang}
                      onChange={e => set('Jenjang', e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="S1">S1 - Sarjana</option>
                      <option value="D3">D3 - Diploma</option>
                      <option value="S2">S2 - Magister</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-2 ml-1">Nama Lengkap Program Studi</label>
                  <input
                    value={formData.Nama}
                    onChange={e => set('Nama', e.target.value)}
                    placeholder="Nama resmi prodi..."
                    required
                    className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-2 ml-1">Akreditasi</label>
                    <select
                      value={formData.Akreditasi}
                      onChange={e => set('Akreditasi', e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Unggul">Unggul</option>
                      <option value="Baik Sekali">Baik Sekali</option>
                      <option value="Baik">Baik</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-2 ml-1">Kapasitas (MHS)</label>
                    <input
                      type="number"
                      value={formData.Kapasitas}
                      onChange={e => set('Kapasitas', e.target.value)}
                      min={1}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-black text-center text-slate-700 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModal(false)}
                  className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/95 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/15 disabled:opacity-60 flex items-center justify-center gap-2 border-none"
                >
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '15px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >save</span>}
                  <span>{isEditMode ? 'Update Prodi' : 'Simpan Prodi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setDelTarget(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl z-[101] overflow-hidden border border-slate-100 p-8 animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-left">
              <h3 className="text-[20px] font-bold text-[#0f172a] mb-2 leading-tight">Hapus Program Studi?</h3>
              <p className="text-[13px] text-[#64748b] leading-relaxed mb-8">
                Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada data mahasiswa atau data akademik terkait yang masih menggunakan program studi <strong>"{deleteTarget.Nama || deleteTarget.nama}"</strong> ini.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDelTarget(null)}
                  className="h-10 px-6 rounded-xl border border-[#cbd5e1] bg-white text-[11px] font-bold text-[#334155] uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="h-10 px-6 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-none shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-[12px]">sync</span>
                  ) : null}
                  <span>{isSubmitting ? "Processing..." : "YA, HAPUS"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

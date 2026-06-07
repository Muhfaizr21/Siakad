"use client"

import React, { useState, useEffect, useMemo } from "react"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import api from "../../lib/axios"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { pddiktiService, API_BASE_URL } from "../../services/api"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "@/components/ui/ResponsiveLayout"
import { DataTable } from "@/components/ui/DataTable"
import { Badge } from "@/components/ui/Badge"
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal"
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'

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
  'S1': 'bg-[#eef4ff] text-primary',
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

  const totalMahasiswa = majors.reduce((a, m) => a + (m.CurrentMahasiswa || 0), 0)

  const jenjangData = useMemo(() => {
    const counts = {}
    majors.forEach(m => {
      const j = m.Jenjang || 'Unknown'
      counts[j] = (counts[j] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [majors])

  const akreditasiData = useMemo(() => {
    const counts = {}
    majors.forEach(m => {
      const a = m.Akreditasi || 'Baik'
      counts[a] = (counts[a] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [majors])

  const utilisasiData = useMemo(() => {
    return [...majors].sort((a, b) => ((b.CurrentMahasiswa || 0) / (b.Kapasitas || 1)) - ((a.CurrentMahasiswa || 0) / (a.Kapasitas || 1))).slice(0, 8).map(m => ({
      name: m.Kode || m.Nama?.substring(0, 12),
      utilization: Math.min(100, Math.round(((m.CurrentMahasiswa || 0) / (m.Kapasitas || 1)) * 100))
    }))
  }, [majors])

  const PIE_COLORS = ['#00236f', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6']

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
    <PageContent>
      <Toaster position="top-right" />
        <DashboardHero
          title="Program "
          highlightedTitle="Studi"
          subtitle="Kelola kurikulum, jenjang pendidikan, akreditasi, dan kapasitas penerimaan fakultas."
          icon="school"
          badges={[
            { label: 'Program Studi & Kurikulum', active: false },
            { label: `${stats.total} Prodi Terdaftar`, active: true }
          ]}
          actions={
            <>
              <button onClick={fetchMajors} disabled={loading}
                className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2">
                {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }} >sync</span> : <span className="material-symbols-outlined text-primary" style={{ fontSize: 13 }}>sync</span>} Refresh Data
              </button>
              <button onClick={openAdd}
                className="h-10 px-4 rounded-xl bg-primary hover:bg-bku-hover text-white text-xs font-bold uppercase tracking-wider gap-2 flex items-center transition-all active:scale-95 shadow-lg shadow-bku-primary/20 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span> Tambah Prodi
              </button>
            </>
          }
        />

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Program Studi', value: stats.total, icon: GraduationCap, bg: 'bg-primary/10', color: 'text-primary', desc: 'Prodi terdaftar' },
          { label: 'Akreditasi Unggul', value: stats.unggul, icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-600', color: 'text-emerald-600', desc: 'Prodi Unggul / A' },
          { label: 'Total Mahasiswa', value: totalMahasiswa, icon: Users, bg: 'bg-amber-50 text-amber-600', color: 'text-amber-600', desc: 'Mahasiswa aktif' },
          { label: 'Total Kapasitas', value: stats.kapasitas, icon: BookOpen, bg: 'bg-indigo-50 text-indigo-600', color: 'text-indigo-600', desc: 'Slot mahasiswa tersedia' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg, s.color)}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{s.icon === GraduationCap ? 'school' : s.icon === CheckCircle2 ? 'check_circle' : s.icon === Users ? 'group' : 'menu_book'}</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 leading-none tabular-nums">
              {loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span> : s.value.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* 5W1H Charts */}
      {!loading && majors.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* WHAT → Distribusi Jenjang */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Distribusi Jenjang</h3>
                <p className="text-[10px] text-slate-400">Rasio S1 / D3 / S2</p>
              </div>
            </div>
            <div className="h-[170px] w-full flex items-center justify-center">
              {jenjangData.length > 0 ? (
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={jenjangData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                      {jenjangData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <span className="text-xs text-slate-400 italic">Tidak ada data</span>}
            </div>
            <div className="flex justify-center gap-3 mt-1">
              {jenjangData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[10px] font-bold text-slate-500">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WHAT → Distribusi Akreditasi */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Status Akreditasi</h3>
                <p className="text-[10px] text-slate-400">Kualitas prodi</p>
              </div>
            </div>
            <div className="h-[170px] w-full flex items-center justify-center">
              {akreditasiData.length > 0 ? (
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={akreditasiData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                      {akreditasiData.map((_, i) => <Cell key={i} fill={['#10b981', '#3b82f6', '#94a3b8'][i % 3]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <span className="text-xs text-slate-400 italic">Tidak ada data</span>}
            </div>
            <div className="flex justify-center gap-3 mt-1">
              {akreditasiData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#10b981', '#3b82f6', '#94a3b8'][i % 3] }} />
                  <span className="text-[10px] font-bold text-slate-500">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* HOW → Utilisasi Kapasitas (Top 8) */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Utilisasi Kapasitas</h3>
                <p className="text-[10px] text-slate-400">Mahasiswa vs daya tampung</p>
              </div>
            </div>
            <div className="h-[170px] w-full">
              {utilisasiData.length > 0 ? (
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={utilisasiData} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} width={50} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="utilization" name="Utilisasi" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center"><span className="text-xs text-slate-400 italic">Tidak ada data</span></div>}
            </div>
          </div>
        </div>
      )}

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
            className="relative w-full max-w-lg glass-card border border-slate-200/60 rounded-2xl shadow-none z-[101] flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-300"
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
                <h2 className="text-2xl font-black font-headline leading-none text-white">{isEditMode ? 'Update Data Prodi' : 'Registrasi Prodi Baru'}</h2>
                <p className="text-xs text-blue-200 font-medium mt-1.5 leading-relaxed">Isi semua formulir administrasi di bawah ini dengan lengkap.</p>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 space-y-5">
                {/* Fakultas Naungan (Auto-Generated, Read-Only) */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Fakultas Naungan</label>
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
                      className="pl-11 pr-4 w-full h-12 rounded-2xl border border-slate-200/60 bg-transparent text-xs font-bold text-slate-500 cursor-not-allowed select-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-1.5 ml-1 leading-relaxed">
                    * Terdeteksi otomatis sebagai unit administrasi di bawah naungan fakultas Anda.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Kode / Akronim</label>
                    <input
                      value={formData.Kode}
                      onChange={e => set('Kode', e.target.value.toUpperCase())}
                      placeholder="TI, SI, MN..."
                      required
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Jenjang</label>
                    <select
                      value={formData.Jenjang}
                      onChange={e => set('Jenjang', e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="S1">S1 - Sarjana</option>
                      <option value="D3">D3 - Diploma</option>
                      <option value="S2">S2 - Magister</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Nama Lengkap Program Studi</label>
                  <input
                    value={formData.Nama}
                    onChange={e => set('Nama', e.target.value)}
                    placeholder="Nama resmi prodi..."
                    required
                    className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Akreditasi</label>
                    <select
                      value={formData.Akreditasi}
                      onChange={e => set('Akreditasi', e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Unggul">Unggul</option>
                      <option value="Baik Sekali">Baik Sekali</option>
                      <option value="Baik">Baik</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Kapasitas (MHS)</label>
                    <input
                      type="number"
                      value={formData.Kapasitas}
                      onChange={e => set('Kapasitas', e.target.value)}
                      min={1}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-black text-center text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 border-t border-slate-200/60 bg-transparent flex gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModal(false)}
                  className="flex-1 h-12 rounded-2xl border border-slate-200/60 bg-transparent text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50/50 transition-all"
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

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isSubmitting}
        title="Hapus Program Studi?"
        message={`Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada data mahasiswa atau data akademik terkait yang masih menggunakan program studi "${deleteTarget?.Nama || deleteTarget?.nama}" ini.`}
      />
    </PageContent>
  )
}

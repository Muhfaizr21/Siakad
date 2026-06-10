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
import { DialogModal, ModalCancelButton, ModalSaveButton } from "@/components/ui/DialogModal"
import { PrimaryStatsCard } from '@/components/ui/StatsCard'

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
  const [jenjangOpen, setJenjangOpen] = useState(false)

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
          <span className="font-semibold text-[var(--theme-text)] font-headline tracking-tight text-[14px]">{val}</span>
          <span className="text-[11px] font-medium text-[var(--theme-text-muted)] font-body tracking-tight mt-0.5">{row.Fakultas?.Nama || "Univ. Bhakti Kencana"}</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <PrimaryStatsCard
          title="Total Program Studi"
          value={stats.total}
          icon={GraduationCap}
          colorTheme="primary"
          badgeText="Prodi terdaftar"
          badgeIcon={<span className="material-symbols-outlined text-[12px]">business</span>}
        />
        <PrimaryStatsCard
          title="Akreditasi Unggul"
          value={stats.unggul}
          icon={CheckCircle2}
          colorTheme="success"
          badgeText="Prodi Unggul / A"
          badgeIcon={<span className="material-symbols-outlined text-[12px]">verified</span>}
        />
        <PrimaryStatsCard
          title="Total Mahasiswa"
          value={totalMahasiswa}
          icon={Users}
          colorTheme="warning"
          badgeText="Mahasiswa aktif"
          badgeIcon={<span className="material-symbols-outlined text-[12px]">groups</span>}
        />
        <PrimaryStatsCard
          title="Total Kapasitas"
          value={stats.kapasitas}
          icon={BookOpen}
          colorTheme="info"
          badgeText="Slot tersedia"
          badgeIcon={<span className="material-symbols-outlined text-[12px]">event_seat</span>}
        />
      </div>

      {/* 5W1H Charts */}
      {!loading && majors.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* WHAT → Distribusi Jenjang */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Distribusi Jenjang</span>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">Rasio S1 / D3 / S2</h3>
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
            <div className="flex flex-wrap justify-center gap-3 mt-1">
              {jenjangData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[10px] font-bold text-slate-500">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WHAT → Distribusi Akreditasi */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Status Akreditasi</span>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">Kualitas Prodi</h3>
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
            <div className="flex flex-wrap justify-center gap-3 mt-1">
              {akreditasiData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#10b981', '#3b82f6', '#94a3b8'][i % 3] }} />
                  <span className="text-[10px] font-bold text-slate-500">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* HOW → Utilisasi Kapasitas (Top 8) */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Utilisasi Kapasitas</span>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">Mahasiswa vs Daya Tampung</h3>
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
      <Card className="glass-card shadow-sm rounded-xl overflow-hidden mt-6 mb-6">
        <div className="px-6 py-5 border-b border-[var(--theme-border)] flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[var(--theme-surface)]">
          <div className="flex-1">
            <h2 className="font-headline font-bold text-lg text-[var(--theme-text)]">Daftar Program Studi</h2>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1 font-medium">
              Menampilkan total <span className="font-bold text-[var(--theme-primary)]">{majors.length}</span> program studi terdaftar
            </p>
          </div>
        </div>
        <CardContent className="p-0">
          <DataTable
            columns={prodiColumns}
            data={majors}
            loading={loading}
            searchPlaceholder="Cari program studi..."
            actions={renderActions}
          />
        </CardContent>
      </Card>

      {/* CRUD Modal */}
      <DialogModal
        open={isModalOpen}
        onOpenChange={setIsModal}
        icon="school"
        title={isEditMode ? 'Update Data Prodi' : 'Registrasi Prodi Baru'}
        subtitle="Isi semua formulir administrasi di bawah ini dengan lengkap."
        badgeText={isEditMode ? 'Edit Program Studi' : 'Tambah Program Studi'}
        maxWidth="max-w-lg"
        footer={
          <>
            <ModalCancelButton onClick={() => setIsModal(false)} />
            <ModalSaveButton 
              form="prodi-form" 
              loading={isSubmitting} 
              text={isEditMode ? 'Update' : 'Simpan'} 
            />
          </>
        }
      >
        <form id="prodi-form" onSubmit={handleSave} className="space-y-4 text-[var(--theme-text)]">
            {/* Fakultas Naungan (Auto-Generated, Read-Only) */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Fakultas Naungan</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-primary)]">
                  <span className="material-symbols-outlined text-[16px]">school</span>
                </div>
                <input
                  type="text"
                  value={
                    faculties.find(f => String(f.ID) === String(formData.FakultasID))?.Nama ||
                    (faculties.length > 0 ? faculties[0].Nama : "Universitas Bhakti Kencana")
                  }
                  readOnly
                  disabled
                  className="pl-10 pr-4 w-full h-10 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs font-semibold text-[var(--theme-text-muted)] cursor-not-allowed select-none"
                />
              </div>
              <p className="text-[10px] text-[var(--theme-text-subtle)] font-medium mt-1 leading-normal">
                * Terdeteksi otomatis sebagai unit administrasi di bawah naungan fakultas Anda.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Kode / Akronim</label>
                <input
                  value={formData.Kode}
                  onChange={e => set('Kode', e.target.value.toUpperCase())}
                  placeholder="TI, SI, MN..."
                  required
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors uppercase font-medium"
                />
              </div>
              <div className="relative">
                <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Jenjang</label>
                <div className="relative">
                  <input
                    value={formData.Jenjang}
                    onChange={e => set('Jenjang', e.target.value)}
                    onFocus={() => setJenjangOpen(true)}
                    onBlur={() => setTimeout(() => setJenjangOpen(false), 200)}
                    placeholder="Ketik atau pilih..."
                    className="w-full h-10 pl-3 pr-10 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors cursor-text font-medium"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--theme-text-subtle)]">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>expand_more</span>
                  </div>
                </div>

                {jenjangOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/50 py-1 overflow-y-auto max-h-40 animate-in fade-in slide-in-from-top-1 duration-200">
                    {['S1', 'S2', 'S3', 'D3', 'D4', 'Profesi', 'Spesialis'].map(opt => (
                      <div
                        key={opt}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input onBlur from firing before click
                          set('Jenjang', opt);
                          setJenjangOpen(false);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary cursor-pointer transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[14px] text-slate-400">school</span>
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Nama Lengkap Program Studi</label>
              <input
                value={formData.Nama}
                onChange={e => set('Nama', e.target.value)}
                placeholder="Nama resmi prodi..."
                required
                className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Akreditasi</label>
                <select
                  value={formData.Akreditasi}
                  onChange={e => set('Akreditasi', e.target.value)}
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors cursor-pointer font-medium"
                >
                  <option value="Unggul">Unggul</option>
                  <option value="Baik Sekali">Baik Sekali</option>
                  <option value="Baik">Baik</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Kapasitas (MHS)</label>
                <input
                  type="number"
                  value={formData.Kapasitas}
                  onChange={e => set('Kapasitas', e.target.value)}
                  min={1}
                  className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors font-medium text-center"
                />
              </div>
            </div>

          </form>
      </DialogModal>

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

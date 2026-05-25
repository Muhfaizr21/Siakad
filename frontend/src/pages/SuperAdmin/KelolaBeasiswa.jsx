"use client"

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from './components/ui/data-table'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog'
import { DeleteConfirmModal } from './components/ui/DeleteConfirmModal'
import { Card, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Textarea } from './components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/select'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'
import { StatCard } from './components/ui/stat-card'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Banknote = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>payments</span>;

const StudentAvatar = ({ src, name, className = "w-9 h-9 rounded-xl" }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const hasNoImage = !src || src.trim() === "" || src.endsWith("/profiles/") || src.endsWith("/students/") || src.endsWith("localhost:8000") || src.endsWith("localhost:8000/");

  return (
    <div className={cn("relative bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200/40 shadow-inner overflow-hidden", className)}>
      {(!loaded || error || hasNoImage) && (
        <span className="material-symbols-outlined text-slate-400/80 block select-none leading-none absolute" style={{ fontSize: className && className.includes('w-14') ? '28px' : '20px' }}>
          person
        </span>
      )}
      {!hasNoImage && !error && (
        <img
          src={src}
          alt={name}
          className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-200", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return d } }
const formatDateTime = (d) => { try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB' } catch { return d } }

const APP_STATUS = {
  diterima: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Diterima' },
  ditolak: { cls: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Ditolak' },
  proses: { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Proses' },
  'disetujui fakultas': { cls: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Disetujui Fakultas' },
}

const getAppStatus = (v = '') => {
  const norm = (v || 'proses').toLowerCase();
  if (norm === 'menunggu' || norm === 'menunggu verifikasi' || norm === 'proses') return APP_STATUS.proses;
  if (norm === 'diterima' || norm === 'disetujui') return APP_STATUS.diterima;
  if (norm === 'ditolak') return APP_STATUS.ditolak;
  if (norm === 'disetujui fakultas') return APP_STATUS['disetujui fakultas'];
  return APP_STATUS.proses;
}



export default function KelolaBeasiswa() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('programs')
  const [data, setData] = useState([])
  const [appsData, setAppsData] = useState([])
  const uniqueSchNames = React.useMemo(() => {
    const map = new Map()
    data.forEach(s => {
      if (s.Nama) {
        map.set(s.Nama, s.Nama)
      }
    })
    return Array.from(map.values())
  }, [data])
  const [loading, setLoading] = useState(true)
  const [appsLoading, setAppsLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ Nama: '', Penyelenggara: '', Deskripsi: '', Deadline: '', Kuota: 0, IPKMin: 0, Anggaran: 0 })
  const [selectedApp, setSelectedApp] = useState(null)
  const [previewApp, setPreviewApp] = useState(null)
  const [appForm, setAppForm] = useState({ Status: 'Proses', Catatan: '' })
  const [appFilters, setAppFilters] = useState({})

  const handleAppUpdate = async () => {
    if (!selectedApp?.id && !selectedApp?.ID) return
    setIsSubmitting(true)
    try {
      const id = selectedApp.id || selectedApp.ID
      const payload = {
        status: appForm.Status,
        catatan: appForm.Catatan,
        Status: appForm.Status,
        Catatan: appForm.Catatan
      }
      const res = await adminService.updateScholarshipApplicationStatus(id, payload)
      if (res.status === 'success') {
        toast.success('Keputusan review berhasil disimpan')
        setSelectedApp(null)
        fetchApps()
      } else {
        toast.error(res.message || 'Gagal menyimpan keputusan')
      }
    } catch {
      toast.error('Terjadi kesalahan sistem saat menyimpan review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAllScholarships()
      if (res.status === 'success') setData(res.data || [])
      else toast.error('Gagal memuat data beasiswa')
    } catch { toast.error('Koneksi sistem terputus') } finally { setLoading(false) }
  }

  const fetchApps = async () => {
    setAppsLoading(true)
    try {
      const res = await adminService.getAllScholarshipApplications()
      if (res.status === 'success') {
        const getStandardDbStatus = (status) => {
          const s = (status || '').toLowerCase();
          if (s === 'disetujui fakultas') return 'Disetujui Fakultas';
          if (s === 'ditolak fakultas') return 'Ditolak Fakultas';
          if (s === 'diterima') return 'Diterima';
          if (s === 'ditolak') return 'Ditolak';
          return 'Proses';
        }

        const normalized = (res.data || []).map(a => {
          const m = a.Mahasiswa || a.mahasiswa || {};
          const b = a.Beasiswa || a.beasiswa || {};
          const mNama = m.Nama || m.nama || '—';
          const mNim = m.NIM || m.nim || '—';
          const bNama = b.Nama || b.nama || '—';
          const mFoto = m.Foto || m.foto || m.foto_url || null;
          return {
            ...a,
            Mahasiswa: {
              ...m,
              Nama: mNama,
              NIM: mNim,
              Foto: mFoto
            },
            Beasiswa: {
              ...b,
              Nama: bNama
            },
            MahasiswaNama: mNama,
            MahasiswaNIM: mNim,
            BeasiswaNama: bNama,
            Status: getStandardDbStatus(a.Status || a.status),
            Catatan: a.Catatan || a.catatan || '',
          }
        })

        // Super Admin only sees applications once approved by the faculty (or finalized by admin)
        const filtered = normalized.filter(a => 
          a.Status === 'Disetujui Fakultas' || 
          a.Status === 'Diterima' || 
          a.Status === 'Ditolak'
        )
        setAppsData(filtered)
      }
      else toast.error('Gagal memuat data pendaftar')
    } catch { toast.error('Koneksi sistem terputus') } finally { setAppsLoading(false) }
  }

  useEffect(() => { 
    fetchData()
    fetchApps()
  }, [])



  const handleOpenAdd = () => { setIsEditMode(false); setForm({ Nama: '', Penyelenggara: '', Deskripsi: '', Deadline: '', Kuota: 0, IPKMin: 0, Anggaran: 0 }); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setForm({ 
      ID: row.ID, 
      Nama: row.Nama || '', 
      Penyelenggara: row.Penyelenggara || '', 
      Deskripsi: row.Deskripsi || '', 
      Deadline: (row.Deadline || '').split('T')[0], 
      Kuota: row.Kuota || 0, 
      IPKMin: row.IPKMin || 0, 
      Anggaran: row.Anggaran || 0 
    })
    setIsCrudOpen(true)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    const payload = { 
      ...form, 
      Kuota: parseInt(form.Kuota) || 0, 
      IPKMin: parseFloat(form.IPKMin) || 0, 
      Anggaran: parseFloat(form.Anggaran) || 0, 
      Deadline: form.Deadline ? new Date(form.Deadline).toISOString() : null 
    }
    try {
      const res = form.ID ? await adminService.updateScholarship(form.ID, payload) : await adminService.createScholarship(payload)
      if (res.status === 'success') { 
        toast.success(form.ID ? 'Beasiswa diperbarui' : 'Beasiswa berhasil ditambahkan')
        setIsCrudOpen(false)
        fetchData() 
      } else {
        toast.error(res.message || 'Gagal menyimpan data')
      }
    } catch { toast.error('Terjadi kesalahan sistem') } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteScholarship(selected.ID)
      toast.success('Beasiswa berhasil dihapus')
      setIsDelOpen(false)
      fetchData()
    } catch { toast.error('Gagal menghapus data') } finally { setIsSubmitting(false) }
  }

  const isDeadlinePassed = (d) => d && new Date(d) < new Date()

  // Stats Calculations
  const stats = {
    totalPrograms: data.length,
    pendingApps: appsData.filter(a => a.Status === 'Menunggu' || a.Status === 'Menunggu Verifikasi' || a.Status === 'Proses').length,
    activeAwardees: appsData.filter(a => a.Status === 'Diterima' || a.Status === 'Disetujui').length,
    totalBudget: data.reduce((acc, curr) => acc + (parseFloat(curr.Anggaran) || 0), 0)
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val)
  }

  const columns = [
    { 
      key: 'Nama', 
      label: 'Program Beasiswa', 
      className: 'min-w-[260px]', 
      render: (v, row) => {
        const val = row?.created_at || row?.CreatedAt || '';
        return (
          <div className="flex flex-col py-1">
            <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px] leading-tight">{v || '—'}</span>
            <span className="text-[10px] text-neutral-400 font-semibold mt-0.5">
              Dibuat: {val ? formatDateTime(val) : '—'}
            </span>
          </div>
        )
      }
    },
    { 
      key: 'Penyelenggara', 
      label: 'Instansi', 
      className: 'w-[180px]', 
      render: v => <span className="text-[12px] font-medium text-neutral-500 font-inter">{v || '—'}</span> 
    },
    { 
      key: 'IPKMin', 
      label: 'IPK Min', 
      className: 'w-[100px] text-center', 
      cellClassName: 'text-center', 
      render: v => <span className="font-bold text-primary text-sm font-jakarta">{parseFloat(v || 0).toFixed(2)}</span> 
    },
    { 
      key: 'Anggaran', 
      label: 'Alokasi Dana', 
      className: 'w-[160px] text-right', 
      cellClassName: 'text-right', 
      render: v => <span className="font-bold text-neutral-900 text-[13px] font-jakarta">Rp {new Intl.NumberFormat('id-ID').format(v || 0)}</span> 
    },
    {
      key: 'Kuota',
      label: 'Kapasitas & Penerima',
      className: 'w-[180px]',
      render: (v, row) => {
        const current = appsData.filter(a => (a.BeasiswaID === row.ID || a.Beasiswa?.ID === row.ID) && (a.Status === 'Diterima' || a.Status === 'Disetujui')).length;
        const capacity = row.Kuota || 0;
        const pct = capacity <= 0 
          ? 0 
          : current >= capacity 
            ? 100 
            : Math.min(99, Math.floor((current / capacity) * 100));
        return (
          <div className="flex items-center gap-4 min-w-[120px]">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-neutral-400 font-bold font-inter">{current} / {capacity} Mhs</span>
                <span className="text-[10px] font-black text-primary font-inter">{pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-100/80 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", pct > 90 ? "bg-rose-500" : "bg-gradient-to-r from-primary to-blue-400")}
                  style={{ width: `${pct}%` }} 
                />
              </div>
            </div>
          </div>
        )
      }
    },
    { 
      key: 'Deadline', 
      label: 'Status Batas', 
      className: 'w-[150px] text-center', 
      cellClassName: 'text-center',
      render: v => (
        <Badge className={cn('px-3 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest', isDeadlinePassed(v) ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100')}>
          {v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '—'}
        </Badge>
      )
    }
  ]

  const appColumns = [
    { 
      key: 'Mahasiswa', 
      label: 'Profil Mahasiswa', 
      className: 'min-w-[220px]', 
      render: (v, row) => {
        const val = row?.created_at || row?.CreatedAt || '';
        return (
          <div className="flex flex-col py-1">
            <span className="font-bold text-neutral-900 text-[13px] font-jakarta leading-tight">{row.Mahasiswa?.Nama || '—'}</span>
            <div className="flex flex-col gap-0.5 mt-0.5">
              <span className="text-[11px] text-neutral-400 font-medium">{row.Mahasiswa?.NIM || '—'}</span>
              <span className="text-[10px] text-neutral-400/80 font-semibold">
                Mendaftar: {val ? formatDateTime(val) : '—'}
              </span>
            </div>
          </div>
        )
      }
    },
    { 
      key: 'Beasiswa', 
      label: 'Program Pilihan', 
      className: 'w-[200px]', 
      render: (v, row) => <span className="text-[12px] font-medium text-neutral-600 font-inter">{row.Beasiswa?.Nama || '—'}</span> 
    },
    { 
      key: 'created_at', 
      label: 'Waktu Submit', 
      className: 'w-[180px] text-center', 
      cellClassName: 'text-center',
      render: (v, row) => {
        const val = row?.created_at || row?.CreatedAt || v;
        return <span className="text-[11px] font-semibold text-neutral-500 tabular-nums">{val ? formatDateTime(val) : '—'}</span>
      }
    },
    { 
      key: 'Status', 
      label: 'Status Verifikasi', 
      className: 'w-[140px] text-center', 
      cellClassName: 'text-center',
      render: v => {
        const st = getAppStatus(v)
        return <Badge className={cn('px-3 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest', st.cls)}>{st.label || v}</Badge>
      }
    }
  ]

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-emerald-50/50 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Student Welfare</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                Manajemen <span className="text-primary">Beasiswa</span>
              </h1>
              <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed">
                Kelola program bantuan dana pendidikan, beasiswa eksternal, dan verifikasi pendaftaran mahasiswa secara terintegrasi.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {activeTab === 'programs' && (
                <Button 
                  onClick={handleOpenAdd}
                  className="h-11 px-6 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-md gap-2 transition-all active:scale-95 border-none"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}  strokeWidth={3}>add</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Tambah Program</span>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard 
            title="Total Program"
            value={stats.totalPrograms}
            description="Program beasiswa aktif"
            icon={Award}
            color="text-primary"
            bg="bg-primary/5"
            loading={loading}
           />
           <StatCard 
            title="Antrian Verifikasi"
            value={stats.pendingApps}
            description="Pendaftar butuh review"
            icon={Activity}
            color="text-amber-600"
            bg="bg-amber-50"
            loading={appsLoading}
           />
           <StatCard 
            title="Penerima Beasiswa"
            value={stats.activeAwardees}
            description="Mahasiswa tersalurkan"
            icon={Users}
            color="text-emerald-600"
            bg="bg-emerald-50"
            loading={appsLoading}
           />
           <StatCard 
            title="Total Anggaran"
            value={formatCurrency(stats.totalBudget)}
            description="Proyeksi dana global"
            icon={Banknote}
            color="text-blue-600"
            bg="bg-blue-50"
            loading={loading}
           />
        </div>

        {/* ── Tabbed Content Section ─────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="flex justify-center md:justify-start">
            <TabsList className="bg-white border border-neutral-200 p-1.5 rounded-xl h-auto shadow-sm">
              <TabsTrigger value="programs" className="rounded-lg px-8 py-2.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">
                <Award size={14} className="mr-2" /> Program Beasiswa
              </TabsTrigger>
              <TabsTrigger value="applications" className="rounded-lg px-8 py-2.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">
                <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} >group</span> Verifikasi Pendaftar
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="programs">
            <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
              <CardContent className="p-0">
                <DataTable
                  columns={columns} 
                  data={data} 
                  loading={loading}
                  searchPlaceholder="Cari nama program atau instansi..."
                  actions={(row) => (
                    <div className="flex items-center gap-1.5">
                      <Button onClick={() => setSelectedProgram(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors" title="Lihat Detail"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span></Button>
                      <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >edit</span></Button>
                      <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span></Button>
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
              <CardContent className="p-0">
                <DataTable
                  columns={appColumns} 
                  data={appsData} 
                  loading={appsLoading}
                  searchPlaceholder="Cari mahasiswa atau program..."
                  externalFilters={appFilters}
                  onExternalFilterChange={setAppFilters}
                  filters={[
                    {
                      key: 'BeasiswaNama',
                      placeholder: 'Semua Beasiswa',
                      options: uniqueSchNames.map(name => ({ label: name, value: name }))
                    }
                  ]}
                  actions={(row) => (
                    <div className="flex items-center gap-1.5">
                      <Button onClick={() => setPreviewApp(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail Pendaftaran"><span className="material-symbols-outlined" style={{ fontSize: '18px' }} >visibility</span></Button>
                      <Button onClick={() => { setSelectedApp(row); setAppForm({ Status: row.Status === 'Disetujui Fakultas' ? 'Proses' : (row.Status || 'Proses'), Catatan: row.Catatan || '' }) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Review Pendaftaran"><span className="material-symbols-outlined" style={{ fontSize: '18px' }} >edit_note</span></Button>
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>

      {/* ── Scholarship CRUD Modal ─────────────────────────────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          <DialogHeader className="p-8 pb-2 border-neutral-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-primary"><Award size={100} /></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                  {isEditMode ? <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '12px' }}  strokeWidth={3}>add</span>}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Program Registry</span>
              </div>
              <DialogTitle className="text-2xl font-bold font-jakarta tracking-tight text-neutral-900 uppercase">
                {isEditMode ? 'Update Beasiswa' : 'Tambah Beasiswa'}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-neutral-400">Pendaftaran program bantuan dana pendidikan baru.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="px-8 pt-4 pb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Nama Program</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama beasiswa..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Penyelenggara</Label>
                <Input value={form.Penyelenggara} onChange={e => setForm({ ...form, Penyelenggara: e.target.value })} placeholder="Instansi/Lembaga..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1 flex items-center gap-1.5">
                  IPK Minimal <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px' }} >show_chart</span>
                </Label>
                <Input type="number" step="0.1" value={form.IPKMin} onChange={e => setForm({ ...form, IPKMin: e.target.value })} placeholder="3.0" className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1 flex items-center gap-1.5">
                  Kuota <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px' }} >group</span>
                </Label>
                <Input type="number" value={form.Kuota} onChange={e => setForm({ ...form, Kuota: e.target.value })} placeholder="50" className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1 flex items-center gap-1.5">
                  Budget (Rp) <Banknote size={12} className="text-primary" />
                </Label>
                <Input type="number" value={form.Anggaran} onChange={e => setForm({ ...form, Anggaran: e.target.value })} placeholder="Rp..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1 flex items-center gap-1.5">
                Batas Akhir <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px' }} >calendar_month</span>
              </Label>
              <Input type="date" value={form.Deadline} onChange={e => setForm({ ...form, Deadline: e.target.value })} className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Deskripsi & Syarat</Label>
              <Textarea value={form.Deskripsi} onChange={e => setForm({ ...form, Deskripsi: e.target.value })} placeholder="Detail persyaratan beasiswa..." className="min-h-[80px] rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white p-4 font-medium text-sm font-jakarta" />
            </div>

            <div className="pt-6 flex flex-row gap-3 border-t border-neutral-100">
               <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-400">Batal</Button>
               <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-neutral-900 text-white hover:bg-primary shadow-md transition-all active:scale-95">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} >save</span>}
                  <span className="text-xs font-bold uppercase tracking-widest">Simpan Program</span>
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen} 
        onClose={() => setIsDelOpen(false)} 
        onConfirm={handleDelete}
        title="Hapus Program Beasiswa?" 
        description="Data beasiswa dan riwayat pendaftar terkait akan dihapus permanen dari sistem." 
        loading={isSubmitting} 
      />

      {/* View Program Modal */}
      {selectedProgram && (() => {
        const programApps = appsData.filter(a => a.BeasiswaID === selectedProgram.ID || a.Beasiswa?.ID === selectedProgram.ID);
        const acceptedApps = programApps.filter(a => a.Status === 'Diterima' || a.Status === 'Disetujui');
        const current = acceptedApps.length;
        const capacity = selectedProgram.Kuota || 1;
        const pct = current >= capacity ? 100 : Math.min(99, Math.floor((current / capacity) * 100));
        const first5Apps = programApps.slice(0, 5);

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedProgram(null)}>
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]"
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
                <button onClick={() => setSelectedProgram(null)}
                  className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '15px' }} >close</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Detail Program Beasiswa</p>
                    <h2 className="text-base font-extrabold text-white leading-tight">{selectedProgram.Nama}</h2>
                    <p className="text-xs text-blue-200 font-medium mt-0.5">{selectedProgram.Penyelenggara}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 font-body">
                {/* Deskripsi */}
                {selectedProgram.Deskripsi && (
                  <div className="space-y-1">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">DESKRIPSI PROGRAM</span>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100/50">
                      {selectedProgram.Deskripsi}
                    </p>
                  </div>
                )}

                {/* Tanggal & Waktu Dibuat - Full Width */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_add_on</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">TANGGAL & WAKTU DIBUAT</span>
                    <span className="text-xs font-black text-slate-700">
                      {selectedProgram.created_at || selectedProgram.CreatedAt ? formatDateTime(selectedProgram.created_at || selectedProgram.CreatedAt) : '—'}
                    </span>
                  </div>
                </div>

                {/* Deadline & IPK Requirement - Side by Side (grid-cols-2) */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>event_busy</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">DEADLINE</span>
                      <span className="text-xs font-black text-rose-600">
                        {selectedProgram.Deadline ? formatDate(selectedProgram.Deadline) : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>star</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">MINIMAL IPK</span>
                      <span className="text-xs font-black text-slate-700">{selectedProgram.IPKMin || '3.00'}</span>
                    </div>
                  </div>
                </div>

                {/* Capacity - Full Width */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">KAPASITAS & KETERISIAN</span>
                    <span className="text-xs font-black text-slate-700">{current} / {selectedProgram.Kuota || 0} Mahasiswa</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mt-2.5">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        pct > 90 
                          ? "bg-rose-500" 
                          : "bg-gradient-to-r from-primary to-blue-400"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Anggaran - Full Width */}
                {selectedProgram.Anggaran > 0 && (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>payments</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">TOTAL ANGGARAN</span>
                      <span className="text-xs font-black text-emerald-600">
                        Rp {new Intl.NumberFormat('id-ID').format(selectedProgram.Anggaran)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Applicants List */}
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Pendaftar Terkini</span>
                    <span className="text-[10px] text-slate-400 font-bold lowercase">({programApps.length} pendaftar)</span>
                  </h3>

                  {first5Apps.length === 0 ? (
                    <div className="bg-slate-50/40 p-6 rounded-2xl border border-dashed border-slate-200 text-center">
                      <p className="text-xs text-slate-400 italic">Belum ada mahasiswa mendaftar program ini</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {first5Apps.map((a) => {
                        const styleClass = 
                          a.Status === 'Diterima' || a.Status === 'Disetujui' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          a.Status === 'Ditolak' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200';
                        const label = a.Status || 'Proses';
                        return (
                          <div key={a.ID || a.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl hover:border-slate-200/80 transition-colors shadow-sm">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <StudentAvatar src={a.Mahasiswa?.Foto || a.Mahasiswa?.foto_url} name={a.MahasiswaNama} className="w-8 h-8 rounded-lg" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{a.MahasiswaNama}</p>
                                <p className="text-[9px] font-medium text-slate-400 mt-0.5">{a.MahasiswaNIM}</p>
                              </div>
                            </div>
                            <span className={cn('text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 border rounded-md flex-shrink-0', styleClass)}>
                              {label}
                            </span>
                          </div>
                        );
                      })}

                      {programApps.length > 5 && (
                        <button 
                          onClick={() => {
                            setActiveTab('applications');
                            setSelectedProgram(null);
                            setAppFilters({ BeasiswaNama: selectedProgram.Nama });
                          }}
                          className="w-full py-2.5 border border-dashed border-[#00236F]/30 hover:border-[#00236F]/60 rounded-xl text-[10px] font-bold text-[#00236F] hover:bg-[#eef4ff] uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                        >
                          Lihat Selengkapnya <span className="material-symbols-outlined" style={{ fontSize: 13 }}>chevron_right</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex gap-3 flex-shrink-0">
                <button onClick={() => setSelectedProgram(null)}
                  className="flex-1 h-11 rounded-xl bg-[#00236F] hover:bg-[#001f5c] text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95">
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit/Review Application Modal */}
      {selectedApp && (() => {
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedApp(null)}>
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]"
              onClick={e => e.stopPropagation()}>
              
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
                <button onClick={() => setSelectedApp(null)}
                  className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '15px' }} >close</span>
                </button>
                <div className="relative z-10 flex items-center gap-4">
                  <StudentAvatar src={selectedApp.Mahasiswa?.Foto || selectedApp.Mahasiswa?.foto_url} name={selectedApp.MahasiswaNama} className="w-14 h-14 rounded-2xl shadow-xl ring-2 ring-white/20" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Review Pendaftaran</p>
                    <h2 className="text-base font-extrabold text-white leading-tight truncate">{selectedApp.MahasiswaNama}</h2>
                    <p className="text-xs text-blue-200 font-medium mt-0.5">{selectedApp.MahasiswaNIM}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 font-body">
                {/* Scholarship Program */}
                <div className="space-y-1">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">PROGRAM BEASISWA</span>
                  <p className="text-xs font-black text-slate-800 bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50">
                    {selectedApp.BeasiswaNama}
                  </p>
                </div>

                {/* Status Options */}
                <div className="space-y-2">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">KEPUTUSAN SELEKSI</span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { v: 'Proses', label: 'Proses', cls: 'border-amber-300 bg-amber-50 text-amber-700' },
                      { v: 'Diterima', label: 'Diterima', cls: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
                      { v: 'Ditolak', label: 'Ditolak', cls: 'border-rose-300 bg-rose-50 text-rose-700' },
                    ].map(opt => (
                      <button key={opt.v} onClick={() => setAppForm(f => ({ ...f, Status: opt.v }))}
                        className={cn('h-11 rounded-xl border-2 text-xs font-bold uppercase tracking-wider transition-all',
                          appForm.Status === opt.v ? opt.cls + ' scale-[1.02] shadow-sm' : 'border-[#e5e5e5] bg-white text-[#a3a3a3] hover:border-[#c5c5c5]')}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Catatan */}
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">CATATAN REVIEWER</label>
                  <textarea value={appForm.Catatan} onChange={e => setAppForm(f => ({ ...f, Catatan: e.target.value }))} rows={4}
                    placeholder="Berikan alasan keputusan atau catatan perbaikan..."
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] focus:outline-none focus:border-primary focus:bg-white text-sm text-[#171717] transition-all resize-none" />
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex gap-3 flex-shrink-0">
                <button onClick={() => setSelectedApp(null)}
                  className="flex-1 h-11 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold text-[#525252] uppercase tracking-widest hover:bg-[#f5f5f5] transition-all">
                  Batal
                </button>
                <button onClick={handleAppUpdate} disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl bg-[#00236F] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#00236F]/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >save</span>}
                  Simpan Keputusan
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Read-Only Preview Application Modal */}
      {previewApp && (() => {
        const st = getAppStatus(previewApp.Status);
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setPreviewApp(null)}>
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]"
              onClick={e => e.stopPropagation()}>
              
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
                <button onClick={() => setPreviewApp(null)}
                  className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '15px' }} >close</span>
                </button>
                <div className="relative z-10 flex items-center gap-4">
                  <StudentAvatar src={previewApp.Mahasiswa?.Foto || previewApp.Mahasiswa?.foto_url} name={previewApp.MahasiswaNama} className="w-14 h-14 rounded-2xl shadow-xl ring-2 ring-white/20" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Detail Pendaftaran</p>
                    <h2 className="text-base font-extrabold text-white leading-tight truncate">{previewApp.MahasiswaNama}</h2>
                    <p className="text-xs text-blue-200 font-medium mt-0.5">{previewApp.MahasiswaNIM}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 font-body">
                {/* Scholarship Program */}
                <div className="space-y-1">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">PROGRAM BEASISWA</span>
                  <p className="text-xs font-black text-slate-800 bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50">
                    {previewApp.BeasiswaNama}
                  </p>
                </div>

                {/* Tanggal Daftar - Full Width */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_add_on</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">TANGGAL & WAKTU DAFTAR</span>
                    <span className="text-xs font-black text-slate-700">
                      {previewApp.created_at || previewApp.CreatedAt ? formatDateTime(previewApp.created_at || previewApp.CreatedAt) : '—'}
                    </span>
                  </div>
                </div>

                {/* Status Seleksi - Full Width */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", 
                    previewApp.Status === 'Diterima' || previewApp.Status === 'Disetujui' ? 'bg-emerald-50 text-emerald-600' : 
                    previewApp.Status === 'Ditolak' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600')}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">STATUS SELEKSI</span>
                    <span className={cn('inline-flex items-center text-[10px] font-black uppercase tracking-wider', 
                      previewApp.Status === 'Diterima' || previewApp.Status === 'Disetujui' ? 'text-emerald-600' : 
                      previewApp.Status === 'Ditolak' ? 'text-rose-600' : 'text-amber-600')}>
                      {st.label}
                    </span>
                  </div>
                </div>

                {/* Submitted Files */}
                <div className="space-y-1.5">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">BERKAS PENDAFTARAN</span>
                  {previewApp.FileURL || previewApp.bukti_url || previewApp.file_url ? (
                    <a href={previewApp.FileURL || previewApp.bukti_url || previewApp.file_url} target="_blank" rel="noreferrer"
                      className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-rose-500" style={{ fontSize: 20 }}>picture_as_pdf</span>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-700">Bukti Berkas Pendaftaran.pdf</p>
                          <p className="text-[9px] text-slate-400">Klik untuk melihat atau mengunduh</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 16 }}>open_in_new</span>
                    </a>
                  ) : (
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200 text-center">
                      <p className="text-xs text-slate-400 italic">Tidak ada berkas yang dilampirkan</p>
                    </div>
                  )}
                </div>

                {/* Reviewer Notes */}
                <div className="space-y-1.5">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">CATATAN REVIEWER</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50">
                    {previewApp.Catatan || previewApp.catatan || 'Belum ada catatan dari reviewer.'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex gap-3 flex-shrink-0">
                <button onClick={() => setPreviewApp(null)}
                  className="flex-1 h-11 rounded-xl bg-[#00236F] hover:bg-[#001f5c] text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95">
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  )
}

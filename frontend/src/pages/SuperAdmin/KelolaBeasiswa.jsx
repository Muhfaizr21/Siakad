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

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'
import { StatCard } from './components/ui/stat-card'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Banknote = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>payments</span>;



export default function KelolaBeasiswa() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('programs')
  const [data, setData] = useState([])
  const [appsData, setAppsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [appsLoading, setAppsLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ Nama: '', Penyelenggara: '', Deskripsi: '', Deadline: '', Kuota: 0, IPKMin: 0, Anggaran: 0 })

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
      if (res.status === 'success') setAppsData(res.data || [])
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
      render: v => <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px] leading-tight">{v || '—'}</span> 
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
      render: (v, row) => (
        <div className="flex flex-col py-1">
          <span className="font-bold text-neutral-900 text-[13px] font-jakarta leading-tight">{row.Mahasiswa?.Nama || '—'}</span>
          <span className="text-[11px] text-neutral-400 font-medium">{row.Mahasiswa?.NIM || '—'}</span>
        </div>
      )
    },
    { 
      key: 'Beasiswa', 
      label: 'Program Pilihan', 
      className: 'w-[200px]', 
      render: (v, row) => <span className="text-[12px] font-medium text-neutral-600 font-inter">{row.Beasiswa?.Nama || '—'}</span> 
    },
    { 
      key: 'CreatedAt', 
      label: 'Tgl Submit', 
      className: 'w-[140px] text-center', 
      cellClassName: 'text-center',
      render: v => <span className="text-[11px] font-medium text-neutral-400 tabular-nums">{v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '—'}</span>
    },
    { 
      key: 'Status', 
      label: 'Status Verifikasi', 
      className: 'w-[140px] text-center', 
      cellClassName: 'text-center',
      render: v => {
        const styles = {
          'Menunggu': 'bg-amber-50 text-amber-700 border-amber-100',
          'Proses': 'bg-blue-50 text-blue-700 border-blue-100',
          'Diterima': 'bg-emerald-50 text-emerald-700 border-emerald-100',
          'Ditolak': 'bg-rose-50 text-rose-700 border-rose-100'
        }
        return <Badge className={cn('px-3 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest', styles[v] || 'bg-neutral-50 text-neutral-500 border-neutral-100')}>{v}</Badge>
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
                      <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >edit</span></Button>
                      <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span></Button>
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
                  actions={(row) => (
                    <div className="flex items-center gap-1.5">
                      <Button onClick={() => navigate(`/admin/scholarships/applications/${row.ID}`)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '18px' }} >visibility</span></Button>
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
    </div>
  )
}

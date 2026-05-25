"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from './components/ui/data-table'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog'
import { DeleteConfirmModal } from './components/ui/DeleteConfirmModal'
import { Card, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Phone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>phone</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const Building2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>business</span>;
const LayoutGrid = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>grid_view</span>;



export default function KelolaFakultas() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ Nama: '', Kode: '', Email: '', NoHP: '', Dekan: '' })

  const fetchData = async ({ syncFromPddikti = false, showSyncToast = false } = {}) => {
    setLoading(true)
    try {
      if (syncFromPddikti) {
        await adminService.syncPddikti('Universitas Bhakti Kencana', 'all')
        if (showSyncToast) toast.success('Sinkronisasi Data Fakultas Berhasil')
      }
      const res = await adminService.getAllFaculties()
      if (res.status === 'success') setData(res.data || [])
      else toast.error('Gagal memuat sinkronisasi data')
    } catch { toast.error('Koneksi node terputus') } finally { setLoading(false) }
  }
  
  useEffect(() => { fetchData() }, [])

  const handleSyncPddikti = async () => {
    setIsSyncing(true)
    try {
      await fetchData({ syncFromPddikti: true, showSyncToast: true })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleOpenAdd = () => { setIsEditMode(false); setForm({ Nama: '', Kode: '', Email: '', NoHP: '', Dekan: '' }); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => { setIsEditMode(true); setForm({ ID: row.id || row.ID, Nama: row.Nama || '', Kode: row.Kode || '', Email: row.Email || '', NoHP: row.NoHP || '', Dekan: row.Dekan || '' }); setIsCrudOpen(true) }
  
  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const targetId = form.ID || form.id
      const res = targetId ? await adminService.updateFaculty(targetId, form) : await adminService.createFaculty(form)
      if (res.status === 'success') { 
        toast.success(targetId ? 'Data fakultas berhasil diperbarui' : 'Registrasi fakultas baru berhasil')
        setIsCrudOpen(false)
        fetchData() 
      } else {
        toast.error(res.message || 'Gagal menyimpan konfigurasi')
      }
    } catch { toast.error('Terjadi kegagalan operasional internal') } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteFaculty(selected.id || selected.ID)
      toast.success('Entitas fakultas berhasil dihapus')
      setIsDelOpen(false)
      fetchData()
    } catch { toast.error('Gagal menghapus entitas data') } finally { setIsSubmitting(false) }
  }

  const columns = [
    { 
      key: 'Kode', 
      label: 'Kode Unit', 
      className: 'w-[120px]', 
      render: v => <Badge variant="outline" className="font-bold text-neutral-400 font-jakarta uppercase text-[9px] tracking-[0.2em] border-neutral-100 bg-neutral-50 px-2.5 py-1 rounded-lg">{v || '—'}</Badge> 
    },
    { 
      key: 'Nama', 
      label: 'Nama Fakultas', 
      className: 'min-w-[260px]', 
      render: v => <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px]">{v || '—'}</span> 
    },
    { 
      key: 'Dekan', 
      label: 'Pimpinan / Dekan', 
      className: 'w-[220px]', 
      render: v => <span className="text-[12px] font-bold text-neutral-600 font-inter tracking-tight">{v || '—'}</span> 
    },
    { 
      key: 'Email', 
      label: 'Kontak Resmi', 
      className: 'w-[200px]', 
      render: (v, row) => (
        <div className="flex flex-col leading-tight gap-1.5">
          <div className="flex items-center gap-2 text-neutral-900">
             <div className="size-4 rounded bg-primary/5 flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '10px' }} >mail</span></div>
             <span className="text-[11px] font-bold font-inter lowercase">{v || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
             <div className="size-4 rounded bg-neutral-50 flex items-center justify-center"><Phone size={10} /></div>
             <span className="text-[10px] font-bold tracking-widest">{row.NoHP || '—'}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'JumlahProdi', 
      label: 'Total Prodi', 
      className: 'w-[120px] text-center', 
      cellClassName: 'text-center', 
      render: (v, row) => (
        <div className="flex flex-col items-center gap-1">
           <span className="font-bold text-primary text-[15px] font-jakarta leading-none tabular-nums">{v || row.jumlah_prodi || 0}</span>
           <span className="text-[8px] font-bold text-neutral-300 uppercase tracking-widest">Programs</span>
        </div>
      )
    }
  ]

  const totalProdi = data.reduce((acc, curr) => acc + (curr.JumlahProdi || curr.jumlah_prodi || 0), 0)

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-indigo-50/50 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Administrative Hierarchy</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                Kelola <span className="text-primary">Fakultas</span>
              </h1>
              <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed">
                Manajemen struktur unit kerja dan sinkronisasi data fakultas di lingkungan Universitas Bhakti Kencana.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleSyncPddikti} 
                variant="outline" 
                disabled={isSyncing}
                className="h-11 px-6 rounded-xl border-neutral-200 text-xs font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 gap-2 transition-all active:scale-95 shadow-sm"
              >
                {isSyncing ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <RefreshCw size={14} className="text-primary" />}
                {isSyncing ? 'Syncing...' : 'PDDIKTI Sync'}
              </Button>
              
              <Button 
                onClick={handleOpenAdd}
                className="h-11 px-8 rounded-xl bg-neutral-900 text-white hover:bg-primary shadow-xl shadow-neutral-900/10 gap-3 transition-all active:scale-95 border-none group"
              >
                <div className="size-5 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}  strokeWidth={3}>add</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Registrasi Unit</span>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-[#eef4ff] rounded-xl flex justify-center items-center text-[#00236F] flex-shrink-0">
                    <Building2 size={18} />
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Total Fakultas</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{data.length}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Unit akademik aktif Universitas</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-indigo-50 rounded-xl flex justify-center items-center text-indigo-600 flex-shrink-0">
                    <LayoutGrid size={18} />
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Total Prodi</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{totalProdi}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Program studi terdaftar</p>
           </div>
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns} 
              data={data} 
              loading={loading}
              searchPlaceholder="Cari nama fakultas atau kode unit..."
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors shadow-none"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >edit</span></Button>
                  <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shadow-none"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >delete</span></Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

      </div>

      {/* ── CRUD Modal ───────────────────────────────────────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          <DialogHeader className="p-8 pb-6 border-b border-neutral-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary"><Building2 size={120} /></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                  {isEditMode ? <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '12px' }}  strokeWidth={3}>add</span>}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Unit Configuration</span>
              </div>
              <DialogTitle className="text-2xl font-bold font-jakarta tracking-tight text-neutral-900">
                {isEditMode ? 'Update Fakultas' : 'Registrasi Unit'}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-neutral-400 italic">Modifikasi identitas dan pimpinan unit fakultas.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Nama Lengkap Fakultas</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Fakultas..." className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Kode Unit</Label>
                <Input required value={form.Kode} onChange={e => setForm({ ...form, Kode: e.target.value })} placeholder="Ex: FSK" className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta uppercase" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Pimpinan Unit (Dekan)</Label>
              <Input value={form.Dekan} onChange={e => setForm({ ...form, Dekan: e.target.value })} placeholder="Lengkap dengan gelar akademik..." className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Email Korespondensi</Label>
                <Input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="fakultas@bku.ac.id" className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Hotline / Telepon</Label>
                <Input value={form.NoHP} onChange={e => setForm({ ...form, NoHP: e.target.value.replace(/\D/g, '') })} placeholder="08..." className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
              </div>
            </div>

            <div className="pt-8 flex flex-col md:flex-row gap-4 border-t border-neutral-100">
               <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="flex-1 h-14 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:bg-neutral-50 transition-all">Abort</Button>
               <Button type="submit" disabled={isSubmitting} className="flex-[2] h-14 rounded-xl bg-neutral-900 text-white hover:bg-primary shadow-xl shadow-neutral-900/10 transition-all active:scale-95 border-none flex items-center justify-center gap-3">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >save</span>}
                  <span className="text-[10px] font-bold uppercase tracking-widest">Commit Database</span>
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen} 
        onClose={() => setIsDelOpen(false)} 
        onConfirm={handleDelete}
        title="Destroy Faculty Entity?" 
        description="Aksi ini akan menghapus permanen entitas fakultas dan seluruh relasi program studi di bawahnya. Prosedur ini tidak dapat dibatalkan." 
        loading={isSubmitting} 
      />
    </div>
  )
}

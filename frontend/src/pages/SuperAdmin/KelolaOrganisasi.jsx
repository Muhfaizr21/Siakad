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
import { Textarea } from './components/ui/textarea'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Building = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>business</span>;
const Layers = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>layers</span>;
const Zap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>bolt</span>;
const Phone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>phone</span>;
const Target = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>track_changes</span>;



export default function KelolaOrganisasi() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ Nama: '', Singkatan: '', Deskripsi: '', Visi: '', Misi: '', Email: '', LogoURL: '', Phone: '' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAllOrmawa()
      if (res.status === 'success') setData(res.data || [])
      else toast.error('Gagal memuat data organisasi')
    } catch { toast.error('Koneksi sistem terputus') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleOpenAdd = () => { setIsEditMode(false); setForm({ Nama: '', Singkatan: '', Deskripsi: '', Visi: '', Misi: '', Email: '', LogoURL: '', Phone: '' }); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => { 
    setIsEditMode(true)
    setForm({ 
      ID: row.id || row.ID, 
      Nama: row.Nama || '', 
      Singkatan: row.Singkatan || '', 
      Deskripsi: row.Deskripsi || '', 
      Visi: row.Visi || '', 
      Misi: row.Misi || '', 
      Email: row.Email || '', 
      LogoURL: row.LogoURL || '', 
      Phone: row.Phone || '' 
    })
    setIsCrudOpen(true) 
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const targetId = form.ID || form.id
      const res = targetId ? await adminService.updateOrmawa(targetId, form) : await adminService.createOrmawa(form)
      if (res.status === 'success') { 
        toast.success(targetId ? 'Organisasi diperbarui' : 'Organisasi berhasil didaftarkan')
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
      await adminService.deleteOrmawa(selected.id || selected.ID)
      toast.success('Organisasi berhasil dihapus')
      setIsDelOpen(false)
      fetchData()
    } catch { toast.error('Gagal menghapus data') } finally { setIsSubmitting(false) }
  }

  const columns = [
    { 
      key: 'Singkatan', 
      label: 'Kode Unit', 
      className: 'w-[120px]', 
      render: v => (
        <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-2 py-0.5 rounded-md font-black text-[10px] tracking-widest uppercase shadow-none">
          {v || 'UNIT'}
        </Badge>
      )
    },
    { 
      key: 'Nama', 
      label: 'Nama Organisasi Mahasiswa', 
      className: 'w-[450px]', 
      render: (v, row) => (
        <div className="flex flex-col gap-1 py-3 group/item">
          <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px] leading-tight uppercase group-hover/item:text-primary transition-colors">{v || '—'}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{row.Singkatan || 'Unit Kegiatan'}</span>
            <div className="size-1 rounded-full bg-neutral-200" />
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Active Community</span>
          </div>
        </div>
      )
    },
    { 
      key: 'Email', 
      label: 'Kontak Resmi', 
      className: 'w-[250px]', 
      render: v => (
        <div className="flex items-center gap-2 text-neutral-500">
          <span className="material-symbols-outlined text-neutral-300" style={{ fontSize: '12px' }} >mail</span>
          <span className="text-[12px] font-medium font-inter">{v || '—'}</span>
        </div>
      )
    },
    { 
      key: 'LogoURL', 
      label: 'Identitas Visual', 
      className: 'w-[140px] text-center', 
      cellClassName: 'text-center',
      render: v => <Badge className="bg-neutral-50 text-neutral-400 border-neutral-100 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest">{v ? 'TERSEDIA' : 'KOSONG'}</Badge> 
    }
  ]

  const totalOrmawa = data.length;
  const activeMembers = data.reduce((acc, curr) => acc + (curr.jumlah_anggota || curr.JumlahAnggota || 0), 0);
  const legalValid = data.filter(r => (r.Status || r.status || 'Aktif').toLowerCase() === 'aktif').length;
  const activityIndex = activeMembers > 50 ? 'Tinggi' : activeMembers > 0 ? 'Sedang' : 'Rendah';

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 text-primary/5 rotate-12 pointer-events-none"><Building size={280} /></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-4 w-2 bg-primary rounded-full shadow-lg shadow-blue-200" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400 font-jakarta">Student Community</span>
              </div>
              <h1 className="text-3xl font-extrabold text-neutral-900 font-jakarta tracking-tight leading-none">
                Kelola <span className="text-primary">Organisasi</span>
              </h1>
              <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed mt-2">
                Pusat pendaftaran, monitoring, dan manajemen legalitas unit kegiatan mahasiswa di lingkungan Universitas.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleOpenAdd}
                className="h-12 px-6 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 gap-2.5 transition-all active:scale-95 border-none group"
              >
                <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300" style={{ fontSize: '18px' }}  strokeWidth={3}>add</span>
                <span className="text-xs font-black uppercase tracking-widest">Daftar Ormawa</span>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex justify-center items-center text-primary flex-shrink-0">
                    <Layers size={18} />
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Total Ormawa</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{totalOrmawa}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Unit terdaftar resmi</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-blue-50 rounded-xl flex justify-center items-center text-blue-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >group</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Member Aktif</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{activeMembers}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Estimasi partisipan</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-emerald-50 rounded-xl flex justify-center items-center text-emerald-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>security</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Legalitas</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{legalValid}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Sertifikasi kemahasiswaan</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-rose-50 rounded-xl flex justify-center items-center text-rose-600 flex-shrink-0">
                    <Zap size={18} />
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Aktivitas</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{activityIndex}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Indeks gerakan mahasiswa</p>
           </div>
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns} 
              data={data} 
              loading={loading}
              searchPlaceholder="Cari Nama atau Singkatan..."
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => { setSelected(row); setIsDetailOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '18px' }} >visibility</span></Button>
                  <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >edit</span></Button>
                  <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span></Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

      </div>

      {/* ── Detail Modal ─────────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          {selected && (
            <div className="flex flex-col">
              <div className="p-10 bg-neutral-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <Badge className="font-bold text-[10px] px-3 py-1 bg-white/10 text-white border-white/20 uppercase tracking-widest">{selected.Singkatan}</Badge>
                  <h2 className="text-3xl font-bold text-white font-jakarta tracking-tight leading-tight uppercase">{selected.Nama}</h2>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2 text-white/60">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }} >mail</span>
                      <span className="text-xs font-medium font-inter">{selected.Email || 'No official email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Phone size={14} className="text-primary" />
                      <span className="text-xs font-medium font-inter">{selected.Phone || 'No contact'}</span>
                    </div>
                  </div>
                </div>
                <Building size={120} className="absolute -bottom-8 -right-8 text-white/5 rotate-12 pointer-events-none" />
              </div>
              
              <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                      <Target size={16} className="text-primary" />
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-jakarta">Visi Organisasi</span>
                   </div>
                   <p className="text-sm font-medium text-neutral-600 leading-relaxed font-inter bg-neutral-50 p-5 rounded-xl border border-neutral-100 italic">
                      "{selected.Visi || 'Visi belum dikonfigurasi.'}"
                   </p>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }} >show_chart</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-jakarta">Misi & Strategi</span>
                   </div>
                   <p className="text-sm font-medium text-neutral-600 leading-relaxed font-inter pl-6 border-l-2 border-primary/20">
                      {selected.Misi || 'Misi belum dikonfigurasi.'}
                   </p>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-neutral-100">
                  <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="h-11 px-8 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-all">Tutup</Button>
                  <Button onClick={() => { setIsDetailOpen(false); handleOpenEdit(selected) }} className="h-11 px-8 rounded-xl bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all active:scale-95">Edit Unit</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── CRUD Modal ───────────────────────────────────────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          <DialogHeader className="p-8 pb-6 border-b border-neutral-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-primary"><Building size={100} /></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                  {isEditMode ? <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '12px' }}  strokeWidth={3}>add</span>}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Institutional Registry</span>
              </div>
              <DialogTitle className="text-2xl font-bold font-jakarta tracking-tight text-neutral-900 uppercase">
                {isEditMode ? 'Update Ormawa' : 'Registrasi Ormawa'}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-neutral-400">Pendaftaran entitas organisasi mahasiswa tingkat universitas.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Nama Organisasi</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama lengkap..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta uppercase" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Kode Unit</Label>
                <Input required value={form.Singkatan} onChange={e => setForm({ ...form, Singkatan: e.target.value })} placeholder="BEM, HIMA..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta uppercase" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Email Resmi</Label>
                 <Input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="ormawa@bku.ac.id" className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
               </div>
               <div className="space-y-2">
                 <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Kontak Person</Label>
                 <Input value={form.Phone} onChange={e => setForm({ ...form, Phone: e.target.value })} placeholder="08xxx..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
               </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Deskripsi Singkat</Label>
              <Textarea value={form.Deskripsi} onChange={e => setForm({ ...form, Deskripsi: e.target.value })} placeholder="Ringkasan tentang organisasi..." className="min-h-[60px] rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white p-4 font-medium text-sm font-jakarta" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Visi</Label>
                <Textarea value={form.Visi} onChange={e => setForm({ ...form, Visi: e.target.value })} placeholder="Target masa depan..." className="min-h-[100px] rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white p-4 font-medium text-sm font-jakarta" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Misi</Label>
                <Textarea value={form.Misi} onChange={e => setForm({ ...form, Misi: e.target.value })} placeholder="Langkah strategis..." className="min-h-[100px] rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white p-4 font-medium text-sm font-jakarta" />
              </div>
            </div>

            <div className="pt-6 flex flex-row gap-3 border-t border-neutral-100">
               <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-400">Batal</Button>
               <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-neutral-900 text-white hover:bg-primary shadow-md transition-all active:scale-95">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} >save</span>}
                  <span className="text-xs font-bold uppercase tracking-widest">Simpan Unit</span>
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen} 
        onClose={() => setIsDelOpen(false)} 
        onConfirm={handleDelete}
        title="Hapus Unit Organisasi?" 
        description="Data organisasi, riwayat anggota, dan visi misi akan dihapus permanen dari sistem." 
        loading={isSubmitting} 
      />
    </div>
  )
}

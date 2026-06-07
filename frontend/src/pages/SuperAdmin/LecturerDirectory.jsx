"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../services/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Briefcase = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>work</span>;
const UserCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>how_to_reg</span>;



const EMPTY_FORM = { NIDN: '', Nama: '', Email: '', Jabatan: 'Lektor', FakultasID: '', ProgramStudiID: '' }

const JABATAN_STYLES = {
  'Asisten': 'bg-slate-50 text-slate-500 border-slate-100',
  'Lektor': 'bg-blue-50 text-blue-600 border-blue-100',
  'Lektor Kepala': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  'Profesor': 'bg-amber-50 text-amber-600 border-amber-100',
  'DEFAULT': 'bg-neutral-50 text-neutral-400 border-neutral-100'
}

const getCleanImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const baseUrl = API_BASE_URL.replace('/api', '')
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function StudentAvatar({ src, name, className = "w-9 h-9 rounded-xl" }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const hasNoImage = !src || src.trim() === "" || src.endsWith("/profiles/") || src.endsWith("/students/") || src.endsWith("localhost:8000") || src.endsWith("localhost:8000/");

  return (
    <div className={cn("relative bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200/40 shadow-inner overflow-hidden", className)}>
      {(!loaded || error || hasNoImage) && (
        <span className="material-symbols-outlined text-slate-400/80 block select-none leading-none absolute animate-in fade-in" style={{ fontSize: className.includes('w-28') ? '56px' : className.includes('w-14') ? '28px' : '20px' }}>
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

export default function LecturerDirectory() {
  const [data, setData] = useState([])
  const [faculties, setFaculties] = useState([])
  const [prodi, setProdi] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [lecRes, facRes, prodiRes] = await Promise.all([
        adminService.getAllLecturers(), 
        adminService.getAllFaculties(), 
        adminService.getAllProdi()
      ])
      if (lecRes.status === 'success') setData(lecRes.data || [])
      if (facRes.status === 'success') setFaculties(facRes.data || [])
      if (prodiRes.status === 'success') setProdi(prodiRes.data || [])
    } catch { toast.error('Gagal memuat data direktori') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleOpenAdd = () => { setIsEditMode(false); setForm(EMPTY_FORM); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setForm({ 
      ID: row.ID, 
      NIDN: row.NIDN || '', 
      Nama: row.Nama || '', 
      Email: row.Pengguna?.Email || '', 
      Jabatan: row.Jabatan || 'Lektor', 
      FakultasID: String(row.FakultasID || ''), 
      ProgramStudiID: String(row.ProgramStudiID || '') 
    })
    setIsCrudOpen(true)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    const payload = { ...form, FakultasID: parseInt(form.FakultasID) || 0, ProgramStudiID: parseInt(form.ProgramStudiID) || 0 }
    try {
      const res = form.ID ? await adminService.updateLecturer(form.ID, payload) : await adminService.createLecturer(payload)
      if (res.status === 'success') { 
        toast.success(form.ID ? 'Data dosen diperbarui' : 'Dosen berhasil didaftarkan')
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
      await adminService.deleteLecturer(selected.ID)
      toast.success('Data dosen dihapus')
      setIsDelOpen(false)
      fetchData()
    } catch { toast.error('Gagal menghapus data') } finally { setIsSubmitting(false) }
  }

  const columns = [
    {
      key: 'NIDN',
      label: 'NIDN',
      className: 'w-[140px]',
      render: v => (
        <code className="text-[12px] font-bold text-blue-600 tracking-[0.1em] bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
          {v || '—'}
        </code>
      )
    },
    { 
      key: 'Nama', 
      label: 'Identitas Dosen', 
      className: 'w-[280px]',
      render: (v, row) => (
        <div className="flex items-center gap-4 py-2 group/avatar">
          <StudentAvatar
            src={getCleanImageUrl(row.Foto || row.Pengguna?.Foto)}
            name={v}
            className="w-11 h-11 rounded-xl border-2 border-white shadow-md transition-all group-hover/avatar:scale-110"
          />
          <div className="flex flex-col">
            <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px] leading-tight">
              {v ? v.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) : '—'}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-neutral-400">
               <span className="material-symbols-outlined text-primary/60" style={{ fontSize: '10px' }} >mail</span>
               <span className="text-[10px] font-bold tracking-widest lowercase">{row.Email || row.Pengguna?.Email || '—'}</span>
            </div>
          </div>
        </div>
      )
    },
    { 
      key: 'Fakultas', 
      label: 'Fakultas', 
      className: 'w-[180px]', 
      render: v => <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight font-jakarta leading-snug block truncate" title={v?.Nama || v?.nama}>{v?.Nama || v?.nama || '—'}</span> 
    },
    { 
      key: 'ProgramStudi', 
      label: 'Program Studi', 
      className: 'w-[200px]', 
      render: v => <span className="text-[12px] font-extrabold text-neutral-700 font-jakarta tracking-tight leading-tight block truncate" title={v?.Nama || v?.nama}>{v?.Nama || v?.nama || '—'}</span> 
    },
    { 
      key: 'Jabatan', 
      label: 'Jabatan', 
      className: 'w-[140px] text-center', 
      cellClassName: 'text-center pr-4',
      render: v => (
        <Badge className={cn('px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider shadow-none', JABATAN_STYLES[v] || JABATAN_STYLES.DEFAULT)}>
          {v || 'Lektor'}
        </Badge>
      )
    }
  ]

  const stats = {
    total: data.length,
    active: data.filter(d => d.Status === 'Aktif' || !d.Status).length,
    professors: data.filter(d => d.Jabatan === 'Profesor').length
  }

  return (
    <div className="min-h-screen bg-transparent font-inter">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-8 select-none">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="glass-card rounded-2xl border border-slate-200/60 p-6 md:p-8 relative overflow-hidden shadow-none">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-bku-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-headline leading-none">Human Capital</span>
              </div>
              <h1 className="text-2xl font-black font-headline tracking-tight leading-none" style={{ color: 'var(--theme-h1)' }}>
                Direktori <span className="text-bku-primary">Dosen</span>
              </h1>
              <p className="text-slate-400 font-medium text-[11px] max-w-2xl leading-relaxed">
                Manajemen database tenaga pendidik, jabatan fungsional, dan penugasan fakultas di lingkungan Universitas.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleOpenAdd}
                className="h-11 px-6 rounded-xl bg-bku-primary text-white hover:bg-bku-primary/90 shadow-none gap-2 transition-all active:scale-95 border-none cursor-pointer font-headline"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}  strokeWidth={3}>add</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Registrasi Dosen</span>
              </Button>
            </div>
          </div>
        </section>
        
        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="glass-card p-4 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center text-bku-primary flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >group</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Total Dosen</span>
              </div>
              <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{data.length}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Tenaga pendidik terdaftar</p>
           </div>

           <div className="glass-card p-4 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex justify-center items-center text-amber-500 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >school</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Profesor</span>
              </div>
              <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{data.filter(d => d.Jabatan === 'Profesor').length}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Guru Besar Universitas</p>
           </div>

           <div className="glass-card p-4 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex justify-center items-center text-indigo-500 flex-shrink-0">
                    <Briefcase size={18} />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Lektor</span>
              </div>
              <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">
                {data.filter(d => d.Jabatan === 'Lektor' || d.Jabatan === 'Lektor Kepala').length}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Lektor & Lektor Kepala</p>
           </div>

           <div className="glass-card p-4 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-slate-500/10 rounded-xl flex justify-center items-center text-slate-500 flex-shrink-0">
                    <UserCheck size={18} />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Asisten</span>
              </div>
              <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{data.filter(d => d.Jabatan === 'Asisten').length}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Asisten Ahli terdaftar</p>
           </div>
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns} 
              data={data} 
              loading={loading}
              searchPlaceholder="Cari NIDN atau Nama..."
              filters={[
                { key: 'Jabatan', placeholder: 'Pilih Jabatan', options: [{ label: 'Asisten', value: 'Asisten' }, { label: 'Lektor', value: 'Lektor' }, { label: 'Profesor', value: 'Profesor' }] },
                { key: 'FakultasID', placeholder: 'Pilih Fakultas', options: faculties.map(f => ({ label: f.Nama || f.nama, value: f.id || f.ID })) },
                { key: 'ProgramStudiID', placeholder: 'Pilih Program Studi', options: prodi.map(p => ({ label: p.Nama || p.nama, value: p.id || p.ID })) }
              ]}
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >edit</span></Button>
                  <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span></Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

      </div>

      {/* ── CRUD Modal ───────────────────────────────────────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border border-slate-200/60 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 border-b border-slate-200/40 relative overflow-hidden bg-white/40">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-bku-primary"><span className="material-symbols-outlined" style={{ fontSize: '100px' }} >school</span></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  {isEditMode ? <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '12px' }}  strokeWidth={3}>add</span>}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-bku-primary font-headline">Academic Registry</span>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tight text-slate-800 uppercase">
                {isEditMode ? 'Update Data Dosen' : 'Registrasi Dosen'}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500 font-inter">Pendaftaran identitas dan jabatan akademik tenaga pendidik.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-500 font-headline ml-1 uppercase tracking-widest">NIDN / NIP</Label>
                <Input required value={form.NIDN} onChange={e => setForm({ ...form, NIDN: e.target.value })} placeholder="Nomor Induk..." className="h-11 rounded-lg border-slate-200/60 bg-white/50 focus:bg-white font-medium text-sm font-inter uppercase" />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-500 font-headline ml-1 uppercase tracking-widest">Nama Lengkap</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama..." className="h-11 rounded-lg border-slate-200/60 bg-white/50 focus:bg-white font-medium text-sm font-inter" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-500 font-headline ml-1 uppercase tracking-widest">Email Institusi</Label>
              <Input required type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="dosen@bku.ac.id" className="h-11 rounded-lg border-slate-200/60 bg-white/50 focus:bg-white font-medium text-sm font-inter" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-500 font-headline ml-1 uppercase tracking-widest">Jabatan</Label>
                <Select value={form.Jabatan} onValueChange={v => setForm({ ...form, Jabatan: v })}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200/60 bg-white/50 font-medium text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    {['Asisten', 'Lektor', 'Lektor Kepala', 'Profesor'].map(j => <SelectItem key={j} value={j} className="text-xs font-medium">{j}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-500 font-headline ml-1 uppercase tracking-widest">Fakultas</Label>
                <Select value={form.FakultasID} onValueChange={v => setForm({ ...form, FakultasID: v, ProgramStudiID: '' })}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200/60 bg-white/50 font-medium text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    {faculties.map(f => <SelectItem key={f.ID} value={String(f.ID)} className="text-xs font-medium uppercase">{f.Nama}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-500 font-headline ml-1 uppercase tracking-widest">Program Studi</Label>
                <Select value={form.ProgramStudiID} onValueChange={v => setForm({ ...form, ProgramStudiID: v })}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200/60 bg-white/50 font-medium text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    {prodi.filter(p => !form.FakultasID || String(p.FakultasID) === form.FakultasID).map(p => <SelectItem key={p.ID} value={String(p.ID)} className="text-xs font-medium uppercase">{p.Nama}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-6 flex flex-row gap-3 border-t border-slate-200/40">
               <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="flex-1 h-12 rounded-xl text-[10px] font-black font-headline uppercase tracking-widest text-slate-400 hover:bg-slate-100 cursor-pointer">Batal</Button>
               <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-slate-800 text-white hover:bg-slate-900 shadow-none transition-all active:scale-95 border-none cursor-pointer">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} >save</span>}
                  <span className="text-[10px] font-black font-headline uppercase tracking-widest">Simpan Data</span>
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen} 
        onClose={() => setIsDelOpen(false)} 
        onConfirm={handleDelete}
        title="Hapus Data Dosen?" 
        description="Seluruh riwayat pengajaran dan penugasan dosen ini akan dihapus permanen." 
        loading={isSubmitting} 
      />
    </div>
  )
}

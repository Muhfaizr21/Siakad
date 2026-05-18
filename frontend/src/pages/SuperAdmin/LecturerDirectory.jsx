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
import { Avatar, AvatarFallback } from './components/ui/avatar'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Briefcase = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>work</span>;
const UserCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>how_to_reg</span>;



const EMPTY_FORM = { NIDN: '', Nama: '', Email: '', Jabatan: 'Lektor', FakultasID: '', ProgramStudiID: '' }

const JABATAN_STYLES = {
  'Asisten': 'bg-[#f8fafc] text-[#64748b] border-[#f1f5f9]',
  'Lektor': 'bg-[#eff6ff] text-[#2563eb] border-[#dbeafe]',
  'Lektor Kepala': 'bg-[#eef2ff] text-[#4f46e5] border-[#e0e7ff]',
  'Profesor': 'bg-[#fffbeb] text-[#d97706] border-[#fef3c7]',
  'DEFAULT': 'bg-neutral-50 text-neutral-400 border-neutral-100'
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
        <code className="text-[12px] font-bold text-[#3b82f6] tracking-[0.1em] bg-[#eff6ff] px-2 py-1 rounded-lg border border-[#dbeafe]">
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
          <Avatar className="h-11 w-11 rounded-xl border-2 border-white shadow-md transition-all group-hover/avatar:scale-110">
            <AvatarFallback className="bg-gradient-to-br from-neutral-50 to-neutral-200 text-neutral-900 text-xs font-bold font-jakarta uppercase">
              {v?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
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
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-amber-50/50 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Human Capital</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                Direktori <span className="text-primary">Dosen</span>
              </h1>
              <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed">
                Manajemen database tenaga pendidik, jabatan fungsional, dan penugasan fakultas di lingkungan Universitas.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleOpenAdd}
                className="h-11 px-6 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-md gap-2 transition-all active:scale-95 border-none"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}  strokeWidth={3}>add</span>
                <span className="text-xs font-bold uppercase tracking-widest">Registrasi Dosen</span>
              </Button>
            </div>
          </div>
        </section>
        
        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-[#eef4ff] rounded-xl flex justify-center items-center text-[#00236F] flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >group</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Total Dosen</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{data.length}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Tenaga pendidik terdaftar</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-[#fffbeb] rounded-xl flex justify-center items-center text-amber-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >school</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Profesor</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{data.filter(d => d.Jabatan === 'Profesor').length}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Guru Besar Universitas</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-[#f5f3ff] rounded-xl flex justify-center items-center text-indigo-600 flex-shrink-0">
                    <Briefcase size={18} />
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Lektor</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">
                {data.filter(d => d.Jabatan === 'Lektor' || d.Jabatan === 'Lektor Kepala').length}
              </p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Lektor & Lektor Kepala</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-[#f8fafc] rounded-xl flex justify-center items-center text-slate-500 flex-shrink-0">
                    <UserCheck size={18} />
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Asisten</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{data.filter(d => d.Jabatan === 'Asisten').length}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Asisten Ahli terdaftar</p>
           </div>
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns} 
              data={data} 
              loading={loading}
              searchPlaceholder="Cari NIDN atau Nama..."
              filters={[
                { key: 'Jabatan', placeholder: 'FILTER JABATAN', options: [{ label: 'ASISTEN', value: 'Asisten' }, { label: 'LEKTOR', value: 'Lektor' }, { label: 'PROFESOR', value: 'Profesor' }] },
                { key: 'FakultasID', placeholder: 'FILTER FAKULTAS', options: faculties.map(f => ({ label: f.Nama || f.nama, value: f.id || f.ID })) },
                { key: 'ProgramStudiID', placeholder: 'FILTER PRODI', options: prodi.map(p => ({ label: p.Nama || p.nama, value: p.id || p.ID })) }
              ]}
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >edit</span></Button>
                  <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span></Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

      </div>

      {/* ── CRUD Modal ───────────────────────────────────────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          <DialogHeader className="p-8 pb-6 border-b border-neutral-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-primary"><span className="material-symbols-outlined" style={{ fontSize: '100px' }} >school</span></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                  {isEditMode ? <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '12px' }}  strokeWidth={3}>add</span>}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Academic Registry</span>
              </div>
              <DialogTitle className="text-2xl font-bold font-jakarta tracking-tight text-neutral-900 uppercase">
                {isEditMode ? 'Update Data Dosen' : 'Registrasi Dosen'}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-neutral-400">Pendaftaran identitas dan jabatan akademik tenaga pendidik.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">NIDN / NIP</Label>
                <Input required value={form.NIDN} onChange={e => setForm({ ...form, NIDN: e.target.value })} placeholder="Nomor Induk..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta uppercase" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Nama Lengkap</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Email Institusi</Label>
              <Input required type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="dosen@bku.ac.id" className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Jabatan</Label>
                <Select value={form.Jabatan} onValueChange={v => setForm({ ...form, Jabatan: v })}>
                  <SelectTrigger className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 font-medium text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    {['Asisten', 'Lektor', 'Lektor Kepala', 'Profesor'].map(j => <SelectItem key={j} value={j} className="text-xs font-medium">{j}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Fakultas</Label>
                <Select value={form.FakultasID} onValueChange={v => setForm({ ...form, FakultasID: v, ProgramStudiID: '' })}>
                  <SelectTrigger className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 font-medium text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    {faculties.map(f => <SelectItem key={f.ID} value={String(f.ID)} className="text-xs font-medium uppercase">{f.Nama}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Program Studi</Label>
                <Select value={form.ProgramStudiID} onValueChange={v => setForm({ ...form, ProgramStudiID: v })}>
                  <SelectTrigger className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 font-medium text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    {prodi.filter(p => !form.FakultasID || String(p.FakultasID) === form.FakultasID).map(p => <SelectItem key={p.ID} value={String(p.ID)} className="text-xs font-medium uppercase">{p.Nama}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-6 flex flex-row gap-3 border-t border-neutral-100">
               <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-400">Batal</Button>
               <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-neutral-900 text-white hover:bg-primary shadow-md transition-all active:scale-95">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} >save</span>}
                  <span className="text-xs font-bold uppercase tracking-widest">Simpan Data</span>
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



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
import { Eye, Pencil, Trash2, Loader2, Plus, Save, GraduationCap, Mail, Briefcase } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'

const EMPTY_FORM = { NIDN: '', Nama: '', Email: '', Jabatan: 'Lektor', FakultasID: '', ProgramStudiID: '' }

export default function LecturerDirectory() {
  const [data, setData] = useState([])
  const [faculties, setFaculties] = useState([])
  const [prodi, setProdi] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [lecRes, facRes, prodiRes] = await Promise.all([adminService.getAllLecturers(), adminService.getAllFaculties(), adminService.getAllProdi()])
      if (lecRes.status === 'success') setData(lecRes.data || [])
      if (facRes.status === 'success') setFaculties(facRes.data || [])
      if (prodiRes.status === 'success') setProdi(prodiRes.data || [])
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleOpenAdd = () => { setIsEditMode(false); setForm(EMPTY_FORM); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setForm({ ID: row.ID, NIDN: row.NIDN || '', Nama: row.Nama || '', Email: row.Pengguna?.Email || '', Jabatan: row.Jabatan || 'Lektor', FakultasID: String(row.FakultasID || ''), ProgramStudiID: String(row.ProgramStudiID || '') })
    setIsCrudOpen(true)
  }
  const handleSave = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    const payload = { ...form, FakultasID: parseInt(form.FakultasID) || 0, ProgramStudiID: parseInt(form.ProgramStudiID) || 0 }
    try {
      const res = form.ID ? await adminService.updateLecturer(form.ID, payload) : await adminService.createLecturer(payload)
      if (res.status === 'success') { toast.success(form.ID ? 'Dosen diperbarui' : 'Dosen ditambahkan'); setIsCrudOpen(false); fetchData() }
      else toast.error(res.message || 'Gagal menyimpan')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }
  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteLecturer(selected.ID)
      toast.success('Dosen dihapus'); setIsDelOpen(false); fetchData()
    } catch { toast.error('Gagal menghapus') } finally { setIsSubmitting(false) }
  }

  const JABATAN_COLORS = { Asisten: 'bg-slate-100 text-slate-600', Lektor: 'bg-blue-100 text-blue-700', 'Lektor Kepala': 'bg-violet-100 text-violet-700', Profesor: 'bg-amber-100 text-amber-700' }

  const columns = [
    { key: 'NIDN', label: 'NIDN', className: 'w-[160px]', render: v => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">{v || '—'}</span> },
    { key: 'Nama', label: 'Profil Dosen', className: 'min-w-[280px]',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100">
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black uppercase">{v?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{v}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1"><Mail className="size-2.5 opacity-60" />{row.Pengguna?.Email || '—'}</span>
          </div>
        </div>
      )
    },
    { key: 'Jabatan', label: 'Jabatan Fungsional', className: 'w-[180px] text-center', cellClassName: 'text-center',
      render: v => <Badge className={cn('font-black text-[10px] px-3 py-1 border-none shadow-sm', JABATAN_COLORS[v] || 'bg-slate-100 text-slate-600')}>{v || 'Lektor'}</Badge>
    },
    { key: 'Fakultas', label: 'Fakultas', className: 'w-[180px]', render: (v, row) => <span className="text-[12px] font-bold text-slate-500 font-headline uppercase">{v?.Nama || row.FakultasNama || '—'}</span> },
    { key: 'ProgramStudi', label: 'Prodi', className: 'w-[180px]', render: (v, row) => <span className="text-[12px] font-bold text-slate-500 font-headline uppercase">{v?.Nama || '—'}</span> }
  ]

  return (
    <div className="p-4 md:p-8 space-y-6">
          <Toaster position="top-right" />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Briefcase className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Direktori Dosen</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manajemen Data Tenaga Pendidik Seluruh Fakultas</p>
            </div>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={data} loading={loading}
                searchPlaceholder="Cari NIP atau Nama dosen..."
                onAdd={handleOpenAdd} addLabel="Tambah Dosen"
                filters={[
                  { key: 'Jabatan', placeholder: 'Filter Jabatan', options: ['Asisten', 'Lektor', 'Lektor Kepala', 'Profesor'].map(v => ({ label: v, value: v })) },
                  { key: 'FakultasID', placeholder: 'Filter Fakultas', options: faculties.map(f => ({ label: f.Nama, value: f.ID })) },
                  { key: 'ProgramStudiID', placeholder: 'Filter Prodi', options: prodi.map(p => ({ label: p.Nama, value: p.ID })) }
                ]}
                searchWidth="max-w-xl"
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => { setSelected(row); setIsDetailOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-xl"><Eye className="size-4" /></Button>
                    <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-600 hover:bg-amber-50 rounded-xl"><Pencil className="size-4" /></Button>
                    <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 className="size-4" /></Button>
                  </div>
                )}
              />
            </CardContent>
          </Card>

      {/* CRUD */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><GraduationCap className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}</div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Lecturer Registry</Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">{isEditMode ? 'Edit Data Dosen' : 'Tambah Dosen Baru'}</DialogTitle>
              <DialogDescription className="sr-only">Formulir manajemen data dosen dan tenaga pengajar.</DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-8 pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">NIDN</Label><Input required value={form.NIDN} onChange={e => setForm({ ...form, NIDN: e.target.value })} placeholder="Nomor Induk Dosen Nasional" className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Lengkap</Label><Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama dosen..." className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
            </div>
            <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Email</Label><Input required type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="dosen@bku.ac.id" className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Jabatan</Label>
                <Select value={form.Jabatan} onValueChange={v => setForm({ ...form, Jabatan: v })}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl p-1">
                    {['Asisten', 'Lektor', 'Lektor Kepala', 'Profesor'].map(j => <SelectItem key={j} value={j} className="rounded-xl font-bold text-[11px] p-3">{j}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Fakultas</Label>
                <Select value={form.FakultasID} onValueChange={v => setForm({ ...form, FakultasID: v })}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-xs"><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl p-1">
                    {faculties.map(f => <SelectItem key={f.ID} value={String(f.ID)} className="rounded-xl font-bold text-[11px] p-3 uppercase">{f.Nama}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Program Studi</Label>
                <Select value={form.ProgramStudiID} onValueChange={v => setForm({ ...form, ProgramStudiID: v })}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-xs"><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl p-1">
                    {prodi.filter(p => !form.FakultasID || String(p.FakultasID) === form.FakultasID).map(p => <SelectItem key={p.ID} value={String(p.ID)} className="rounded-xl font-bold text-[11px] p-3 uppercase">{p.Nama}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4 flex flex-row gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8 h-12 rounded-2xl">Batalkan</Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isEditMode ? 'Update Record' : 'Create Record'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Dosen?" description="Data dosen ini akan dihapus permanen dari sistem." loading={isSubmitting} />
    </div>
  )
}

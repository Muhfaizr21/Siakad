"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '../FacultyAdmin/components/data-table'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../FacultyAdmin/components/dialog'
import { DeleteConfirmModal } from '../FacultyAdmin/components/DeleteConfirmModal'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Input } from '../FacultyAdmin/components/input'
import { Label } from '../FacultyAdmin/components/label'
import { Pencil, Trash2, Loader2, Plus, Save, BookOpen } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'
import { adminService } from '../../services/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../FacultyAdmin/components/select'

export default function KelolaProdi() {
  const [data, setData] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ Nama: '', Kode: '', Jenjang: 'S1', FakultasID: '' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodiRes, facRes] = await Promise.all([adminService.getAllProdi(), adminService.getAllFaculties()])
      if (prodiRes.status === 'success') setData(prodiRes.data || [])
      if (facRes.status === 'success') setFaculties(facRes.data || [])
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleOpenAdd = () => { setIsEditMode(false); setForm({ Nama: '', Kode: '', Jenjang: 'S1', FakultasID: '' }); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => { setIsEditMode(true); setForm({ ID: row.ID, Nama: row.Nama || '', Kode: row.Kode || '', Jenjang: row.Jenjang || 'S1', FakultasID: String(row.FakultasID || '') }); setIsCrudOpen(true) }
  const handleSave = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    const payload = { ...form, FakultasID: parseInt(form.FakultasID) || 0 }
    try {
      const res = form.ID ? await adminService.updateProdi(form.ID, payload) : await adminService.createProdi(payload)
      if (res.status === 'success') { toast.success(form.ID ? 'Prodi diperbarui' : 'Prodi ditambahkan'); setIsCrudOpen(false); fetchData() }
      else toast.error(res.message || 'Gagal menyimpan')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }
  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteProdi(selected.ID)
      toast.success('Prodi dihapus'); setIsDelOpen(false); fetchData()
    } catch { toast.error('Gagal menghapus') } finally { setIsSubmitting(false) }
  }

  const JENJANG_COLORS = { S1: 'bg-blue-100 text-blue-700', S2: 'bg-violet-100 text-violet-700', S3: 'bg-indigo-100 text-indigo-700', D3: 'bg-amber-100 text-amber-700', D4: 'bg-emerald-100 text-emerald-700' }

  const columns = [
    { key: 'Kode', label: 'Kode', className: 'w-[100px]', render: v => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">{v || '—'}</span> },
    { key: 'Nama', label: 'Nama Program Studi', className: 'min-w-[260px]', render: v => <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{v || '—'}</span> },
    { key: 'Jenjang', label: 'Jenjang', className: 'w-[100px] text-center', cellClassName: 'text-center',
      render: v => <Badge className={cn('font-black text-[10px] px-3 py-1 border-none shadow-sm', JENJANG_COLORS[v] || 'bg-slate-100 text-slate-600')}>{v || 'S1'}</Badge>
    },
    { key: 'Fakultas', label: 'Fakultas', className: 'w-[220px]', render: (v, row) => <span className="text-[12px] font-bold text-slate-600 font-headline">{v?.Nama || row.FakultasNama || '—'}</span> }
  ]

  return (
    <div className="bg-slate-50 min-h-screen flex font-sans">
      <Sidebar />
      <main className="pl-72 pt-20 flex flex-col min-h-screen w-full">

        <TopNavBar />
        <div className="p-8 space-y-6">
          <Toaster position="top-right" />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><BookOpen className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Kelola Program Studi</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manajemen Program Studi Seluruh Fakultas</p>
            </div>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={data} loading={loading}
                searchPlaceholder="Cari nama atau kode prodi..."
                onAdd={handleOpenAdd} addLabel="Tambah Prodi"
                filters={[
                  { key: 'Jenjang', placeholder: 'Filter Jenjang', options: ['S1','S2','S3','D3','D4'].map(j => ({ label: j, value: j })) },
                  { key: 'FakultasID', placeholder: 'Filter Fakultas', options: faculties.map(f => ({ label: f.Nama, value: f.ID })) }
                ]}
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-600 hover:bg-amber-50 rounded-xl"><Pencil className="size-4" /></Button>
                    <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 className="size-4" /></Button>
                  </div>
                )}
              />

            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><BookOpen className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}</div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Prodi Registry</Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">{isEditMode ? 'Edit Prodi' : 'Tambah Prodi Baru'}</DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-8 pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Prodi</Label><Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama Program Studi..." className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Kode</Label><Input required value={form.Kode} onChange={e => setForm({ ...form, Kode: e.target.value })} placeholder="Misal: SI, TK..." className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline uppercase" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Jenjang</Label>
                <Select value={form.Jenjang} onValueChange={v => setForm({ ...form, Jenjang: v })}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl p-1">
                    {['S1','S2','S3','D3','D4'].map(j => <SelectItem key={j} value={j} className="rounded-xl font-bold text-[11px] p-3">{j}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Fakultas</Label>
                <Select value={form.FakultasID} onValueChange={v => setForm({ ...form, FakultasID: v })}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-xs"><SelectValue placeholder="Pilih Fakultas" /></SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl p-1">
                    {faculties.map(f => <SelectItem key={f.ID} value={String(f.ID)} className="rounded-xl font-bold text-[11px] p-3 uppercase">{f.Nama}</SelectItem>)}
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
        title="Hapus Program Studi?" description="Program studi ini akan dihapus permanen beserta semua data terkait." loading={isSubmitting} />
    </div>
  )
}

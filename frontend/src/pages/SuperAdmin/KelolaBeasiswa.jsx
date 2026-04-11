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
import { Eye, Pencil, Trash2, Loader2, Plus, Save, Award } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'
import { adminService } from '../../services/api'

export default function KelolaBeasiswa() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
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
    } catch { toast.error('Koneksi gagal') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleOpenAdd = () => { setIsEditMode(false); setForm({ Nama: '', Penyelenggara: '', Deskripsi: '', Deadline: '', Kuota: 0, IPKMin: 0, Anggaran: 0 }); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setForm({ ID: row.ID, Nama: row.Nama || '', Penyelenggara: row.Penyelenggara || '', Deskripsi: row.Deskripsi || '', Deadline: (row.Deadline || '').split('T')[0], Kuota: row.Kuota || 0, IPKMin: row.IPKMin || 0, Anggaran: row.Anggaran || 0 })
    setIsCrudOpen(true)
  }
  const handleSave = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    const payload = { ...form, Kuota: parseInt(form.Kuota), IPKMin: parseFloat(form.IPKMin), Anggaran: parseFloat(form.Anggaran), Deadline: form.Deadline ? new Date(form.Deadline).toISOString() : null }
    try {
      const res = form.ID ? await adminService.updateScholarship(form.ID, payload) : await adminService.createScholarship(payload)
      if (res.status === 'success') { toast.success(form.ID ? 'Beasiswa diperbarui' : 'Beasiswa ditambahkan'); setIsCrudOpen(false); fetchData() }
      else toast.error(res.message || 'Gagal menyimpan')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }
  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteScholarship(selected.ID)
      toast.success('Beasiswa dihapus'); setIsDelOpen(false); fetchData()
    } catch { toast.error('Gagal menghapus') } finally { setIsSubmitting(false) }
  }

  const isDeadlinePassed = (d) => d && new Date(d) < new Date()

  const columns = [
    { key: 'Nama', label: 'Nama Program Beasiswa', className: 'min-w-[260px]', render: v => <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{v || '—'}</span> },
    { key: 'Penyelenggara', label: 'Penyelenggara', className: 'w-[200px]', render: v => <span className="text-[12px] font-bold text-slate-600 font-headline">{v || '—'}</span> },
    { key: 'IPKMin', label: 'IPK Min', className: 'w-[100px] text-center', cellClassName: 'text-center', render: v => <span className="font-black text-primary text-sm font-headline">{parseFloat(v || 0).toFixed(2)}</span> },
    { key: 'Kuota', label: 'Kuota', className: 'w-[90px] text-center', cellClassName: 'text-center', render: v => <span className="font-black text-slate-700 text-sm font-headline">{v || 0}</span> },
    { key: 'Anggaran', label: 'Anggaran', className: 'w-[160px] text-right', cellClassName: 'text-right', 
      render: v => <span className="font-black text-slate-900 text-sm font-headline">Rp {new Intl.NumberFormat('id-ID').format(v || 0)}</span> 
    },
    { key: 'Deadline', label: 'Deadline', className: 'w-[160px] text-center', cellClassName: 'text-center',
      render: v => (
        <Badge className={cn('font-black text-[10px] px-3 py-1 border-none shadow-sm', isDeadlinePassed(v) ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')}>
          {v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </Badge>
      )
    }
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
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Award className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Program Beasiswa</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manajemen Program Beasiswa & Bantuan Studi</p>
            </div>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={data} loading={loading}
                searchPlaceholder="Cari nama program atau penyelenggara..."
                onAdd={handleOpenAdd} addLabel="Tambah Beasiswa"
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
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Award className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}</div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Scholarship Registry</Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">{isEditMode ? 'Edit Beasiswa' : 'Program Beasiswa Baru'}</DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-8 pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Program</Label><Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama beasiswa..." className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Penyelenggara</Label><Input value={form.Penyelenggara} onChange={e => setForm({ ...form, Penyelenggara: e.target.value })} placeholder="Kemendikbud, dll..." className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2 col-span-1"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">IPK Min</Label><Input type="number" step="0.01" min="0" max="4" value={form.IPKMin} onChange={e => setForm({ ...form, IPKMin: e.target.value })} placeholder="3.0" className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm" /></div>
              <div className="space-y-2 col-span-1"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Kuota</Label><Input type="number" min="1" value={form.Kuota} onChange={e => setForm({ ...form, Kuota: e.target.value })} placeholder="50" className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm" /></div>
              <div className="space-y-2 col-span-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Total Anggaran (Rp)</Label><Input type="number" min="0" value={form.Anggaran} onChange={e => setForm({ ...form, Anggaran: e.target.value })} placeholder="10000000" className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline text-emerald-600" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Deadline Pendaftaran</Label><Input required type="date" value={form.Deadline} onChange={e => setForm({ ...form, Deadline: e.target.value })} className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm" /></div>
            </div>
            <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Deskripsi</Label><Textarea value={form.Deskripsi} onChange={e => setForm({ ...form, Deskripsi: e.target.value })} placeholder="Persyaratan dan keuntungan beasiswa..." className="min-h-[80px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm leading-relaxed font-headline" /></div>
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
        title="Hapus Program Beasiswa?" description="Program beasiswa ini akan dihapus permanen dari sistem." loading={isSubmitting} />
    </div>
  )
}

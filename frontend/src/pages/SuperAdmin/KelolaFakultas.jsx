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
import { Textarea } from '../FacultyAdmin/components/textarea'
import { Pencil, Trash2, Loader2, Plus, Save, Building2 } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'
import { adminService } from '../../services/api'

export default function KelolaFakultas() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ Nama: '', Kode: '', Deskripsi: '', Dekan: '' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAllFaculties()
      if (res.status === 'success') setData(res.data || [])
      else toast.error('Gagal memuat data')
    } catch { toast.error('Koneksi gagal') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleOpenAdd = () => { setIsEditMode(false); setForm({ Nama: '', Kode: '', Deskripsi: '', Dekan: '' }); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => { setIsEditMode(true); setForm({ ID: row.ID, Nama: row.Nama || '', Kode: row.Kode || '', Deskripsi: row.Deskripsi || '', Dekan: row.Dekan || '' }); setIsCrudOpen(true) }
  const handleSave = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    try {
      const res = form.ID ? await adminService.updateFaculty(form.ID, form) : await adminService.createFaculty(form)
      if (res.status === 'success') { toast.success(form.ID ? 'Fakultas diperbarui' : 'Fakultas ditambahkan'); setIsCrudOpen(false); fetchData() }
      else toast.error(res.message || 'Gagal menyimpan')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }
  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteFaculty(selected.ID)
      toast.success('Fakultas dihapus'); setIsDelOpen(false); fetchData()
    } catch { toast.error('Gagal menghapus') } finally { setIsSubmitting(false) }
  }

  const columns = [
    { key: 'Kode', label: 'Kode', className: 'w-[120px]', render: v => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">{v || '—'}</span> },
    { key: 'Nama', label: 'Nama Fakultas', className: 'min-w-[260px]', render: v => <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{v || '—'}</span> },
    { key: 'Dekan', label: 'Dekan', className: 'w-[220px]', render: v => <span className="text-[12px] font-bold text-slate-600 font-headline">{v || '—'}</span> },
    { key: 'JumlahProdi', label: 'Total Prodi', className: 'w-[120px] text-center', cellClassName: 'text-center', render: (v, row) => <span className="font-black text-primary text-sm font-headline">{v || row.jumlah_prodi || 0}</span> }
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
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Building2 className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Kelola Fakultas</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manajemen Data Institusi & Fakultas Universitas</p>
            </div>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={data} loading={loading}
                searchPlaceholder="Cari nama atau kode fakultas..."
                onAdd={handleOpenAdd} addLabel="Tambah Fakultas"
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
            <div className="absolute top-0 right-0 p-8 opacity-5"><Building2 className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}</div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Faculty Registry</Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">{isEditMode ? 'Edit Fakultas' : 'Tambah Fakultas Baru'}</DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-8 pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Fakultas</Label><Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama resmi..." className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Kode Fakultas</Label><Input required value={form.Kode} onChange={e => setForm({ ...form, Kode: e.target.value })} placeholder="Misal: FSK, FT..." className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline uppercase" /></div>
            </div>
            <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Dekan</Label><Input value={form.Dekan} onChange={e => setForm({ ...form, Dekan: e.target.value })} placeholder="Dr. Nama Dekan, M.Si." className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
            <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Deskripsi</Label><Textarea value={form.Deskripsi} onChange={e => setForm({ ...form, Deskripsi: e.target.value })} placeholder="Deskripsi singkat..." className="min-h-[80px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm font-headline" /></div>
            <DialogFooter className="pt-4 flex flex-row gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8 h-12 rounded-2xl">Batalkan</Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isEditMode ? 'Update' : 'Simpan'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Fakultas?" description="Data fakultas beserta semua program studi terkait akan dihapus permanen." loading={isSubmitting} />
    </div>
  )
}

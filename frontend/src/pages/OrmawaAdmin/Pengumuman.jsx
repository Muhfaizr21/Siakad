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
import { Eye, Pencil, Trash2, Loader2, Plus, Save, Megaphone } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

export default function Pengumuman() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.ID || 1
  const [form, setForm] = useState({ Judul: '', Isi: '', Kategori: 'umum', OrmawaID: ormawaId })

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await fetchWithAuth(`${API}/announcements?ormawaId=${ormawaId}`)
      if (data.status === 'success') setData(data.data || [])
      else toast.error('Gagal memuat pengumuman')
    } catch { toast.error('Koneksi gagal') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleOpenAdd = () => { setIsEditMode(false); setForm({ Judul: '', Isi: '', Kategori: 'umum', OrmawaID: ormawaId }); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => { setIsEditMode(true); setForm({ ID: row.ID, Judul: row.Judul || '', Isi: row.Isi || '', Kategori: row.Kategori || 'umum', OrmawaID: ormawaId }); setIsCrudOpen(true) }
  
  const handleSave = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    const url = isEditMode ? `${API}/announcements/${form.ID}` : `${API}/announcements`
    const method = isEditMode ? 'PUT' : 'POST'
    try {
      const data = await fetchWithAuth(url, { method, body: JSON.stringify({ ...form, OrmawaID: Number(form.OrmawaID) }), headers: { 'Content-Type': 'application/json' } })
      if (data.status === 'success') { toast.success(isEditMode ? 'Pengumuman diperbarui' : 'Pengumuman diterbitkan'); setIsCrudOpen(false); fetchData() }
      else toast.error(data.message || 'Gagal menyimpan')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API}/announcements/${selected?.ID}`, { method: 'DELETE' })
      if (data.status === 'success') { toast.success('Pengumuman dihapus'); setIsDelOpen(false); fetchData() }
      else toast.error('Gagal menghapus')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const KATEGORI_COLORS = { umum: 'bg-slate-100 text-slate-600', kegiatan: 'bg-blue-100 text-blue-700', penting: 'bg-rose-100 text-rose-700', info: 'bg-indigo-100 text-indigo-700' }

  const columns = [
    { key: 'Judul', label: 'Judul Pengumuman', className: 'min-w-[300px]', render: v => <span className="font-bold text-slate-900 text-[13px] font-headline tracking-tighter">{v || '—'}</span> },
    { key: 'Kategori', label: 'Kategori', className: 'w-[140px] text-center', cellClassName: 'text-center',
      render: v => <Badge className={cn('font-black text-[10px] px-3 py-1 border-none shadow-sm ring-1 ring-slate-200/50', KATEGORI_COLORS[v] || 'bg-slate-100 text-slate-600')}>{v || 'umum'}</Badge> },
    { key: 'CreatedAt', label: 'Diterbitkan', className: 'w-[180px]',
      render: v => <span className="font-bold text-slate-400 text-[11px] font-headline">{v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span> }
  ]

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="pt-20 px-6 pb-12">
          <Toaster position="top-right" />
          <div className="flex flex-col gap-1.5 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Megaphone className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Siaran & Pengumuman</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Publikasi Informasi & Pengumuman Ormawa</p>
            </div>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={data} loading={loading}
                searchPlaceholder="Cari judul pengumuman..."
                onAdd={handleOpenAdd} addLabel="Buat Pengumuman"
                filters={[{ key: 'Kategori', placeholder: 'Filter Kategori', options: [{ label: 'Umum', value: 'umum' }, { label: 'Kegiatan', value: 'kegiatan' }, { label: 'Penting', value: 'penting' }, { label: 'Info', value: 'info' }] }]}
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
        </div>
      </main>

      {/* Detail */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl">
          {selected && (
            <div>
              <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
                <div className="relative z-10">
                  <Badge className={cn('font-black text-[9px] px-2.5 py-0.5 border-none mb-3', KATEGORI_COLORS[selected.Kategori] || 'bg-slate-100 text-slate-600')}>{selected.Kategori || 'umum'}</Badge>
                  <h2 className="text-xl font-black text-white font-headline tracking-tighter">{selected.Judul}</h2>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">{selected.CreatedAt ? new Date(selected.CreatedAt).toLocaleString('id-ID') : ''}</p>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{selected.Isi}</p>
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8 h-10 rounded-2xl">Tutup</Button>
                  <Button onClick={() => { setIsDetailOpen(false); handleOpenEdit(selected) }} className="text-[10px] font-black uppercase tracking-widest h-10 px-8 rounded-2xl bg-primary text-white">Edit</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CRUD */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Megaphone className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                </div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Announcement</Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">{isEditMode ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">Publikasikan informasi penting untuk seluruh anggota.</DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-8 pt-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Judul Pengumuman</Label>
              <Input required value={form.Judul} onChange={e => setForm({ ...form, Judul: e.target.value })} placeholder="Masukkan judul pengumuman..."
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Kategori</Label>
              <select value={form.Kategori} onChange={e => setForm({ ...form, Kategori: e.target.value })}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white transition-all">
                <option value="umum">Umum</option><option value="kegiatan">Kegiatan</option><option value="penting">Penting</option><option value="info">Info</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Isi Pengumuman</Label>
              <Textarea required value={form.Isi} onChange={e => setForm({ ...form, Isi: e.target.value })} placeholder="Tuliskan isi pengumuman di sini..."
                className="min-h-[120px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm leading-relaxed font-headline" />
            </div>
            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl">Batalkan</Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isEditMode ? 'Update Record' : 'Publish Sekarang'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Pengumuman?" description="Pengumuman ini akan dihapus permanen dan tidak dapat dikembalikan." loading={isSubmitting} />
    </div>
  )
}

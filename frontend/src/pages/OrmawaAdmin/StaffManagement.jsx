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
import { Avatar, AvatarFallback } from '../FacultyAdmin/components/avatar'
import { Eye, Pencil, Trash2, Loader2, Plus, Save, UserCog, Mail } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

const JABATAN = ['Pembina', 'Penanggung Jawab', 'Sekretaris Eksekutif', 'Koordinator Program', 'Staf Khusus']

export default function StaffManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [students, setStudents] = useState([])
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.OrmawaID || 1
  const [form, setForm] = useState({ Nama: '', MahasiswaID: '', Jabatan: 'Pembina', Email: '', NoHP: '', OrmawaID: ormawaId })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [mRes, sRes] = await Promise.all([
        fetchWithAuth(`${API}/members?ormawaId=${ormawaId}`),
        fetchWithAuth(`${API}/students`)
      ])
      if (mRes.status === 'success') setData((mRes.data || []).filter(m => ['Pembina', 'Penanggung Jawab', 'Sekretaris Eksekutif', 'Koordinator Program', 'Staf Khusus', 'Ketua', 'Wakil Ketua'].includes(m.Role)))
      if (sRes.status === 'success') setStudents(sRes.data || [])
    } catch { toast.error('Koneksi gagal') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleOpenAdd = () => { setIsEditMode(false); setForm({ Nama: '', MahasiswaID: '', Jabatan: 'Pembina', Email: '', NoHP: '', OrmawaID: ormawaId }); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setForm({ ID: row.ID, Nama: row.Mahasiswa?.Nama || '', MahasiswaID: String(row.MahasiswaID || ''), Jabatan: row.Role || 'Pembina', Email: row.Email || '', NoHP: row.NoHP || '', OrmawaID: ormawaId })
    setIsCrudOpen(true)
  }
  const handleSave = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    const url = isEditMode ? `${API}/members/${form.ID}` : `${API}/members`
    const method = isEditMode ? 'PUT' : 'POST'
    try {
      const payload = { Role: form.Jabatan, MahasiswaID: Number(form.MahasiswaID), OrmawaID: Number(form.OrmawaID) }
      const data = await fetchWithAuth(url, { method, body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
      if (data.status === 'success') { toast.success(isEditMode ? 'Data diperbarui' : 'Staf ditambahkan'); setIsCrudOpen(false); fetchData() }
      else toast.error(data.message || 'Gagal menyimpan')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }
  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API}/members/${selected?.ID}`, { method: 'DELETE' })
      if (data.status === 'success') { toast.success('Staf dihapus'); setIsDelOpen(false); fetchData() }
      else toast.error('Gagal menghapus')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const columns = [
    {
      key: 'Mahasiswa', label: 'Profil Staf', className: 'min-w-[280px]',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100">
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black uppercase">
              {row.Mahasiswa?.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{row.Mahasiswa?.Nama || '—'}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
              <Mail className="size-2.5 opacity-60" />{row.Mahasiswa?.NIM || '—'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'Role', label: 'Jabatan', className: 'w-[220px]',
      render: v => <Badge className="bg-primary/5 text-primary font-black text-[10px] border-none px-3 py-1">{v || '—'}</Badge>
    },
    {
      key: 'Divisi', label: 'Divisi', className: 'w-[160px]',
      render: v => <span className="text-xs text-slate-600 font-bold font-headline uppercase">{v || 'Umum'}</span>
    }
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
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><UserCog className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Manajemen Staf</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pengelolaan Staf & Petugas Ormawa</p>
            </div>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={data} loading={loading}
                searchPlaceholder="Cari nama atau NIM staf..."
                onAdd={handleOpenAdd} addLabel="Tambah Staf"
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

      {/* CRUD */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><UserCog className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                </div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Staff Registry</Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">{isEditMode ? 'Edit Staf' : 'Tambah Staf Baru'}</DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">Daftarkan staf dengan jabatan dan tugas yang sesuai.</DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-8 pt-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Pilih Mahasiswa</Label>
              <select required value={form.MahasiswaID} onChange={e => setForm({ ...form, MahasiswaID: e.target.value })}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white transition-all font-headline">
                <option value="">-- Pilih Mahasiswa --</option>
                {students.map(s => <option key={s.ID} value={s.ID}>{s.NIM} - {s.Nama}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Jabatan</Label>
              <select value={form.Jabatan} onChange={e => setForm({ ...form, Jabatan: e.target.value })}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white transition-all">
                {JABATAN.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Email</Label>
                <Input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="email@bku.ac.id"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">No. HP</Label>
                <Input value={form.NoHP} onChange={e => setForm({ ...form, NoHP: e.target.value })} placeholder="08xx-xxxx-xxxx"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm" />
              </div>
            </div>
            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl">Batalkan</Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isEditMode ? 'Update Record' : 'Create Record'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Staf?" description="Data staf ini akan dihapus permanen dari sistem." loading={isSubmitting} />
    </div>
  )
}

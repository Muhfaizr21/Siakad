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
import { Eye, Pencil, Trash2, Loader2, Plus, Save, Users, Mail } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

const ROLES = ['Ketua Umum', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 'Kepala Divisi', 'Staff', 'Anggota']

export default function AnggotaManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [members, setMembers] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.ID || 1
  const [form, setForm] = useState({ MahasiswaID: '', Role: 'Anggota', Divisi: '', OrmawaID: ormawaId })

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const data = await fetchWithAuth(`${API}/members?ormawaId=${ormawaId}`)
      if (data.status === 'success') setMembers(data.data || [])
      else toast.error('Gagal memuat anggota')
    } catch { toast.error('Koneksi gagal') } finally { setLoading(false) }
  }
  const fetchStudents = async () => {
    try { const data = await fetchWithAuth(`${API}/students`); if (data.status === 'success') setStudents(data.data || []) } catch {}
  }

  useEffect(() => { fetchMembers(); fetchStudents() }, [])

  const handleOpenAdd = () => {
    setIsEditMode(false); setForm({ MahasiswaID: '', Role: 'Anggota', Divisi: '', OrmawaID: ormawaId }); setIsCrudOpen(true)
  }
  const handleOpenEdit = (row) => {
    setIsEditMode(true); setForm({ ID: row.ID, MahasiswaID: String(row.MahasiswaID || ''), Role: row.Role || 'Anggota', Divisi: row.Divisi || '', OrmawaID: ormawaId }); setIsCrudOpen(true)
  }
  const handleSave = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    const url = isEditMode ? `${API}/members/${form.ID}` : `${API}/members`
    const method = isEditMode ? 'PUT' : 'POST'
    const payload = { ...form, MahasiswaID: Number(form.MahasiswaID), OrmawaID: Number(form.OrmawaID) }
    try {
      const data = await fetchWithAuth(url, { method, body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
      if (data.status === 'success') { toast.success(isEditMode ? 'Data diperbarui' : 'Anggota ditambahkan'); setIsCrudOpen(false); fetchMembers() }
      else toast.error(data.message || 'Gagal menyimpan')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }
  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API}/members/${selected.ID}`, { method: 'DELETE' })
      if (data.status === 'success') { toast.success('Anggota dihapus'); setIsDelOpen(false); fetchMembers() }
      else toast.error('Gagal menghapus')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const columns = [
    {
      key: 'Mahasiswa', label: 'Profil Anggota', className: 'min-w-[280px]',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100">
            <AvatarFallback className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase">
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
      key: 'Role', label: 'Jabatan', className: 'w-[200px]',
      render: (val) => <span className="text-xs text-slate-600 font-black font-headline uppercase">{val || '—'}</span>
    },
    {
      key: 'Divisi', label: 'Divisi', className: 'w-[180px]',
      render: (val) => val
        ? <Badge className="bg-primary/5 text-primary font-black text-[10px] border-none">{val}</Badge>
        : <span className="text-slate-300 text-xs font-bold">Umum</span>
    },
    {
      key: 'Status', label: 'Status', className: 'w-[130px] text-center', cellClassName: 'text-center',
      render: (val) => (
        <Badge className={cn('font-black text-[10px] px-3 py-1 border-none shadow-sm',
          val === 'aktif' || !val ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20' : 'bg-slate-100 text-slate-600')}>
          {val === 'aktif' || !val ? 'Aktif' : val}
        </Badge>
      )
    }
  ]

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="pt-20 px-4 lg:px-8 pb-12">
          <Toaster position="top-right" />
          <div className="flex flex-col gap-1.5 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Users className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Manajemen Anggota</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Database Keanggotaan & Struktur Ormawa</p>
            </div>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={members} loading={loading}
                searchPlaceholder="Cari nama atau NIM anggota..."
                onAdd={handleOpenAdd} addLabel="Tambah Anggota"
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

      {/* DETAIL */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl ">
          {selected && (
            <div>
              <div className="h-36 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent" />
                <div className="absolute -bottom-10 left-8 z-20 p-1.5 bg-white rounded-[1.5rem] shadow-2xl">
                  <Avatar className="h-20 w-20 rounded-[1.2rem]">
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 text-2xl font-black">
                      {selected.Mahasiswa?.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="p-8 pt-14 space-y-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">{selected.Mahasiswa?.Nama}</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selected.Mahasiswa?.NIM}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jabatan</p><p className="text-sm font-black text-slate-900 font-headline uppercase">{selected.Role || '—'}</p></div>
                  <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Divisi</p><p className="text-sm font-black text-primary font-headline uppercase">{selected.Divisi || 'Umum'}</p></div>
                </div>
                <Button onClick={() => setIsDetailOpen(false)} className="w-full h-12 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest">Tutup</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CRUD */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl ">
          <DialogHeader className="p-4 md:p-8 pb-3 md:pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Users className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-1 md:mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                </div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Anggota Registry</Badge>
              </div>
              <DialogTitle className="text-lg md:text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">{isEditMode ? 'Edit Anggota' : 'Tambah Anggota Baru'}</DialogTitle>
              <DialogDescription className="text-[10px] md:text-xs font-medium text-slate-400 mt-1">Daftarkan mahasiswa sebagai anggota aktif ormawa.</DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-4 md:p-8 pt-3 md:pt-6 space-y-3 md:space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Pilih Mahasiswa</Label>
              <select required value={form.MahasiswaID} onChange={e => setForm({ ...form, MahasiswaID: e.target.value })}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white transition-all">
                <option value="">-- Pilih Mahasiswa --</option>
                {students.map(s => <option key={s.ID} value={s.ID}>{s.Nama} ({s.NIM})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Jabatan</Label>
                <select value={form.Role} onChange={e => setForm({ ...form, Role: e.target.value })}
                  className="w-full h-10 md:h-12 rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs md:text-sm font-bold text-slate-700 focus:outline-none focus:bg-white transition-all">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Divisi</Label>
                <Input value={form.Divisi} onChange={e => setForm({ ...form, Divisi: e.target.value })} placeholder="Misal: Humas, IT, dll."
                  className="h-10 md:h-12 rounded-xl md:rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-xs md:text-sm font-headline" />
              </div>
            </div>
            <DialogFooter className="mt-4 pt-4 flex flex-col md:flex-row items-center justify-end gap-3 border-t border-slate-100 - md:-mx-8 px-4 md:px-8 bg-slate-50/30 pb-4 md:pb-0">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="w-full md:w-auto text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-10 md:h-12 rounded-xl md:rounded-2xl">Batalkan</Button>
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-10 md:h-12 px-10 rounded-xl md:rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">{isEditMode ? 'Update Record' : 'Create Record'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Anggota?" description="Data keanggotaan ini akan dihapus permanen dari sistem." loading={isSubmitting} />
    </div>
  )
}

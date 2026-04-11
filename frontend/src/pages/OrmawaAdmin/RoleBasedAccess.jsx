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
import { Shield, Plus, Save, Pencil, Trash2, Loader2, Eye } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

const PERMISSIONS = [
  'view_dashboard', 'manage_kencana', 'manage_members', 'manage_staff', 
  'manage_proposals', 'manage_calendar', 'manage_attendance', 'manage_finance', 
  'manage_lpj', 'manage_aspirations', 'manage_announcements', 'manage_structure', 
  'manage_rbac', 'view_notifications', 'manage_settings'
]

const PERM_LABELS = {
  view_dashboard: 'Akses Dashboard & Statistik',
  manage_kencana: 'KENCANA (PKKMB)',
  manage_members: 'Manajemen Anggota',
  manage_staff: 'Manajemen Staff',
  manage_proposals: 'Proposal & Kegiatan',
  manage_calendar: 'Jadwal Kalender',
  manage_attendance: 'Sistem Absensi (QR)',
  manage_finance: 'Buku Kas & Keuangan',
  manage_lpj: 'Laporan & LPJ',
  manage_aspirations: 'Aspirasi Organisasi',
  manage_announcements: 'Siaran & Pengumuman',
  manage_structure: 'Struktur Pengurus',
  manage_rbac: 'Role & Hak Akses',
  view_notifications: 'Pusat Notifikasi',
  manage_settings: 'Pengaturan Sistem'
}

export default function RoleBasedAccess() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selected, setSelected] = useState(null)
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.ID || 1
  const [form, setForm] = useState({ Nama: '', Deskripsi: '', Hak: [], OrmawaID: ormawaId })

  const fetchData = async () => {
    setLoading(true)
    try {
      const json = await fetchWithAuth(`${API}/roles?ormawaId=${ormawaId}`)
      if (json.status === 'success') setRoles(json.data || [])
      else {
        // Fallback static roles for display if API not ready
        setRoles([
          { ID: 1, Nama: 'Ketua', Deskripsi: 'Akses penuh ke semua fitur', Hak: PERMISSIONS },
          { ID: 2, Nama: 'Sekretaris', Deskripsi: 'Manajemen anggota dan dokumen', Hak: ['manage_members', 'manage_proposals', 'view_reports'] },
          { ID: 3, Nama: 'Bendahara', Deskripsi: 'Manajemen keuangan dan laporan', Hak: ['manage_kas', 'manage_lpj', 'view_reports'] },
        ])
      }
    } catch { setRoles([]) } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleOpenAdd = () => { setIsEditMode(false); setForm({ Nama: '', Deskripsi: '', Hak: [], OrmawaID: ormawaId }); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => { setIsEditMode(true); setForm({ ID: row.ID, Nama: row.Nama || '', Deskripsi: row.Deskripsi || '', Hak: row.Hak || [], OrmawaID: ormawaId }); setIsCrudOpen(true) }
  const toggleHak = (h) => setForm(f => ({ ...f, Hak: f.Hak.includes(h) ? f.Hak.filter(x => x !== h) : [...f.Hak, h] }))
  const handleSave = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    const url = isEditMode ? `${API}/roles/${form.ID}` : `${API}/roles`
    const method = isEditMode ? 'PUT' : 'POST'
    try {
      const json = await fetchWithAuth(url, { 
        method, 
        body: JSON.stringify({ ...form, OrmawaID: Number(form.OrmawaID) }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (json.status === 'success') { toast.success(isEditMode ? 'Role diperbarui' : 'Role dibuat'); setIsCrudOpen(false); fetchData() }
      else toast.error(json.message || 'Gagal menyimpan')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }
  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const json = await fetchWithAuth(`${API}/roles/${selected?.ID}`, { method: 'DELETE' })
      if (json.status === 'success') { toast.success('Role dihapus'); setIsDelOpen(false); fetchData() }
      else toast.error('Gagal menghapus')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const columns = [
    {
      key: 'Nama', label: 'Nama Role', className: 'w-[200px]',
      render: v => <span className="font-black text-slate-900 font-headline text-[13px] tracking-tighter uppercase">{v || '—'}</span>
    },
    {
      key: 'Deskripsi', label: 'Deskripsi', className: 'min-w-[240px]',
      render: v => <span className="font-medium text-slate-500 text-[12px]">{v || '—'}</span>
    },
    {
      key: 'Hak', label: 'Akses', className: 'min-w-[260px]', disableSort: true,
      render: v => (
        <div className="flex flex-wrap gap-1.5">
          {(v || []).slice(0, 3).map(h => (
            <Badge key={h} className="bg-primary/5 text-primary font-black text-[7px] border-none uppercase tracking-widest">
              {PERM_LABELS[h]?.replace('Manajemen ', '').replace('Akses ', '') || h}
            </Badge>
          ))}
          {(v || []).length > 3 && <Badge className="bg-slate-100 text-slate-500 font-black text-[8px] border-none">+{(v || []).length - 3}</Badge>}
        </div>
      )
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
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Shield className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Role & Hak Akses</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manajemen Role & Kontrol Akses Sistem</p>
            </div>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={roles} loading={loading}
                searchPlaceholder="Cari nama role..."
                onAdd={handleOpenAdd} addLabel="Buat Role Baru"
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

      {/* CRUD */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Shield className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                </div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">RBAC Registry</Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">{isEditMode ? 'Edit Role' : 'Buat Role Baru'}</DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">Definisikan role dan hak akses sistem untuk anggota ormawa.</DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-8 pt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Role</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Misal: Ketua, Bendahara..."
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Deskripsi</Label>
                <Input value={form.Deskripsi} onChange={e => setForm({ ...form, Deskripsi: e.target.value })} placeholder="Tugas singkat..."
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Pilih Hak Akses (Centang Semua yang Berlaku)</Label>
              <div className="grid grid-cols-3 gap-2">
                {PERMISSIONS.map(p => (
                  <label key={p} className={cn('flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all', form.Hak.includes(p) ? 'border-primary/30 bg-primary/5' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200')}>
                    <input type="checkbox" checked={form.Hak.includes(p)} onChange={() => toggleHak(p)} className="w-3.5 h-3.5 rounded text-primary border-slate-300 focus:ring-primary" />
                    <span className={cn('text-[9px] font-black uppercase tracking-tight leading-tight', form.Hak.includes(p) ? 'text-primary' : 'text-slate-500')}>{PERM_LABELS[p]}</span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl">Batalkan</Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isEditMode ? 'Update Role' : 'Buat Role'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Role?" description="Role ini akan dihapus permanen. Pastikan tidak ada anggota yang masih menggunakan role ini." loading={isSubmitting} />
    </div>
  )
}

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
import { Eye, Pencil, Trash2, Loader2, Plus, Save, Building, Users } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'

export default function KelolaOrganisasi() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ Nama: '', Singkatan: '', Deskripsi: '', Visi: '', Misi: '', Email: '', LogoURL: '', Phone: '' })
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAllOrmawa()
      if (res.status === 'success') setData(res.data || [])
      else toast.error('Gagal memuat data')
    } catch { toast.error('Koneksi gagal') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const fetchMembers = async (id) => {
    setMembersLoading(true)
    try {
      const res = await adminService.getOrmawaMembers(id)
      if (res.status === 'success') setMembers(res.data || [])
      else toast.error('Gagal memuat anggota')
    } catch { toast.error('Gagal koneksi anggota') } finally { setMembersLoading(false) }
  }

  const handleOpenAdd = () => { setIsEditMode(false); setForm({ Nama: '', Singkatan: '', Deskripsi: '', Visi: '', Misi: '', Email: '', LogoURL: '', Phone: '' }); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => { setIsEditMode(true); setForm({ ID: row.ID, Nama: row.Nama || '', Singkatan: row.Singkatan || '', Deskripsi: row.Deskripsi || '', Visi: row.Visi || '', Misi: row.Misi || '', Email: row.Email || '', LogoURL: row.LogoURL || '', Phone: row.Phone || '' }); setIsCrudOpen(true) }

  const handleOpenDetail = (row) => {
    setSelected(row)
    setIsDetailOpen(true)
    fetchMembers(row.ID)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    try {
      const res = form.ID ? await adminService.updateOrmawa(form.ID, form) : await adminService.createOrmawa(form)
      if (res.status === 'success') { toast.success(form.ID ? 'Ormawa diperbarui' : 'Ormawa ditambahkan'); setIsCrudOpen(false); fetchData() }
      else toast.error(res.message || 'Gagal menyimpan')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }
  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteOrmawa(selected.ID)
      toast.success('Ormawa dihapus'); setIsDelOpen(false); fetchData()
    } catch { toast.error('Gagal menghapus') } finally { setIsSubmitting(false) }
  }

  const columns = [
    { key: 'Singkatan', label: 'Kode', className: 'w-[100px]', render: v => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">{v || '—'}</span> },
    { key: 'Nama', label: 'Nama Ormawa', className: 'min-w-[260px]', render: v => <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{v || '—'}</span> },
    { key: 'Email', label: 'Kontak', className: 'w-[220px]', render: v => <span className="text-[11px] font-bold text-slate-500">{v || '—'}</span> },
    { key: 'JumlahAnggota', label: 'Anggota', className: 'w-[100px] text-center', cellClassName: 'text-center', render: (v, row) => <span className="font-black text-primary text-sm font-headline">{v || row.jumlah_anggota || 0}</span> }
  ]

  return (
    <div className="p-4 md:p-8 space-y-6">
          <Toaster position="top-right" />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0"><Building className="size-5 md:size-6" /></div>
              <h1 className="text-lg md:text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-tight">Kelola Organisasi Mahasiswa</h1>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Registri & Manajemen Seluruh Ormawa Universitas</p>
            </div>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={data} loading={loading}
                searchPlaceholder="Cari nama atau singkatan ormawa..."
                onAdd={handleOpenAdd} addLabel="Tambah Ormawa"
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleOpenDetail(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-xl"><Eye className="size-4" /></Button>
                    <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-600 hover:bg-amber-50 rounded-xl"><Pencil className="size-4" /></Button>
                    <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 className="size-4" /></Button>
                  </div>
                )}
              />
            </CardContent>
          </Card>

      {/* Detail */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent showCloseButton={false} className="max-w-[96vw] sm:max-w-4xl p-0 border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] bg-white/95 backdrop-blur-xl transition-all duration-300 max-h-[85svh]">
          {/* Accessibility: hidden title & description for screen readers */}
          <DialogTitle className="sr-only">{selected?.Nama ?? 'Detail Organisasi'}</DialogTitle>
          <DialogDescription className="sr-only">Informasi lengkap dan daftar anggota organisasi mahasiswa.</DialogDescription>
          {selected && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Premium Header */}
              <div className="p-5 md:p-8 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="font-black text-[8px] md:text-[9px] px-2.5 py-1 md:px-2.5 md:py-0.5 bg-white/10 text-white border-none uppercase tracking-widest">{selected.Singkatan}</Badge>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setIsDetailOpen(false); handleOpenEdit(selected) }} className="h-7 md:h-8 px-2.5 md:px-4 rounded-lg md:rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 text-[8px] md:text-[10px] font-black uppercase">Edit Profil</Button>
                      <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)} className="h-7 w-7 md:h-8 md:w-8 p-0 rounded-lg md:rounded-xl text-white/50 hover:text-white hover:bg-white/10 border border-white/5">✕</Button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl md:text-3xl font-black text-white font-headline tracking-tighter leading-tight">{selected.Nama}</h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
                      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-tighter">Email</span>
                        <span className="text-[10px] md:text-[11px] text-slate-300 font-bold truncate max-w-[120px] md:max-w-none">{selected.Email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Anggota</span>
                        <span className="text-[10px] md:text-[11px] text-slate-300 font-bold">{selected.jumlah_anggota || 0} Mahasiswa</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 md:p-8 pt-4 md:pt-6 space-y-4 md:space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  {selected.Visi && <div className="space-y-1.5 md:space-y-2"><p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 font-headline">Manajemen Visi</p><div className="p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border border-slate-100/50 text-[12px] md:text-sm text-slate-600 leading-relaxed font-semibold">{selected.Visi}</div></div>}
                  {selected.Misi && <div className="space-y-1.5 md:space-y-2"><p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 font-headline">Manajemen Misi</p><div className="p-4 md:p-5 rounded-xl md:rounded-3xl bg-slate-50 border border-slate-100/50 text-[12px] md:text-sm text-slate-600 leading-relaxed font-semibold">{selected.Misi}</div></div>}
                </div>

                {/* Members List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pl-1">
                    <div className="space-y-0.5">
                      <p className="text-[11px] md:text-xs font-black text-slate-900 uppercase tracking-tight font-headline">Struktur Kepengurusan & Anggota</p>
                      <p className="text-[9px] md:text-[10px] font-medium text-slate-400 uppercase tracking-widest">Daftar mahasiswa terdaftar</p>
                    </div>
                  </div>

                  <div className="rounded-2xl md:rounded-[2rem] border border-slate-100 overflow-x-auto bg-white shadow-sm scrollbar-thin scrollbar-thumb-slate-200">
                    <table className="w-full text-left border-collapse min-w-[380px] md:min-w-full">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-4 md:px-6 py-3 md:py-4 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Nama Mahasiswa / NIM</th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Jabatan</th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Bidang / Divisi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {membersLoading ? (
                          [1, 2, 3].map(i => (
                            <tr key={i} className="animate-pulse">
                              <td colSpan={3} className="px-6 py-4"><div className="h-10 bg-slate-50 rounded-xl w-full" /></td>
                            </tr>
                          ))
                        ) : members.length > 0 ? (
                          members.map((m, idx) => (
                            <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                              <td className="px-4 md:px-6 py-3 md:py-4">
                                <div className="flex flex-col">
                                  <span className="text-[12px] md:text-[13px] font-black text-slate-800 font-headline leading-tight">{m.Mahasiswa?.Nama || 'NAMA Error'}</span>
                                  <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{m.Mahasiswa?.NIM}</span>
                                </div>
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                <Badge className="bg-primary/5 text-primary border-none text-[8px] md:text-[9px] font-black px-2 md:px-3 py-0.5 md:py-1 uppercase">{m.Role}</Badge>
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-tight">{m.Divisi || 'Inti'}</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-6 py-10 md:py-16 text-center">
                              <div className="flex flex-col items-center gap-2 opacity-30">
                                <Users className="size-6 md:size-8" />
                                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Belum Ada Anggota Terdaftar</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-8 pt-4 bg-slate-50/50 border-t border-slate-100 flex justify-end shrink-0">
                <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 md:px-10 h-10 md:h-12 rounded-xl md:rounded-2xl hover:bg-white transition-all">Selesai Meninjau</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CRUD */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[1.5rem] sm:rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-5 md:p-8 pb-4 md:pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Building className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-7 md:size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{isEditMode ? <Pencil className="size-3.5 md:size-4" /> : <Plus className="size-3.5 md:size-4 stroke-[3px]" />}</div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Ormawa Registry</Badge>
              </div>
              <DialogTitle className="text-xl md:text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">{isEditMode ? 'Edit Ormawa' : 'Daftarkan Ormawa Baru'}</DialogTitle>
              <DialogDescription className="sr-only">Formulir pendaftaran dan pembaruan data organisasi mahasiswa.</DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-5 md:p-8 pt-4 md:pt-6 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <div className="space-y-2 sm:col-span-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Organisasi</Label><Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama lengkap..." className="h-11 md:h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Kode / Singkatan</Label><Input required value={form.Singkatan} onChange={e => setForm({ ...form, Singkatan: e.target.value })} placeholder="CTR, HMP, etc" className="h-11 md:h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Kontak / HP</Label><Input value={form.Phone} onChange={e => { const val = e.target.value.replace(/\D/g, ''); setForm({ ...form, Phone: val }); }} placeholder="08xxx..." className="h-11 md:h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Email Resmi</Label><Input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="email@ormawa.bku.ac.id" className="h-11 md:h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm" /></div>
            </div>
            <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Deskripsi Organisasi</Label><Textarea value={form.Deskripsi} onChange={e => setForm({ ...form, Deskripsi: e.target.value })} placeholder="Singkatan atau deskripsi singkat..." className="min-h-[60px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 text-sm font-medium font-headline" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Visi</Label><Textarea value={form.Visi} onChange={e => setForm({ ...form, Visi: e.target.value })} placeholder="Visi organisasi..." className="min-h-[70px] md:min-h-[80px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 text-sm font-medium font-headline" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Misi</Label><Textarea value={form.Misi} onChange={e => setForm({ ...form, Misi: e.target.value })} placeholder="Misi organisasi..." className="min-h-[70px] md:min-h-[80px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 text-sm font-medium font-headline" /></div>
            </div>
            <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 border-t border-slate-100 -mx-5 md:-mx-8 px-5 md:px-8 bg-slate-50/30">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 md:px-8 h-11 md:h-12 rounded-2xl w-full sm:w-auto">Batalkan</Button>
              <Button type="submit" disabled={isSubmitting} className="h-11 md:h-12 px-8 md:px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 w-full sm:w-auto">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isEditMode ? 'Update Record' : 'Create Record'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Organisasi?" description="Data organisasi mahasiswa ini akan dihapus permanen dari sistem." loading={isSubmitting} />
    </div>
  )
}

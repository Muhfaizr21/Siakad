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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Eye, Pencil, Trash2, Loader2, Plus, Save, Award, Users, Check, X, FileText, ExternalLink } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../services/api'

export default function KelolaBeasiswa() {
  const [data, setData] = useState([])
  const [appsData, setAppsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [appsLoading, setAppsLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [selectedApp, setSelectedApp] = useState(null)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isAppOpen, setIsAppOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ Nama: '', Penyelenggara: '', Deskripsi: '', Deadline: '', Kuota: 0, IPKMin: 0, Anggaran: 0 })
  const [appForm, setAppForm] = useState({ status: '', catatan: '' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAllScholarships()
      if (res.status === 'success') setData(res.data || [])
      else toast.error('Gagal memuat data beasiswa')
    } catch { toast.error('Koneksi gagal') } finally { setLoading(false) }
  }

  const fetchApps = async () => {
    setAppsLoading(true)
    try {
      const res = await adminService.getAllScholarshipApplications()
      if (res.status === 'success') setAppsData(res.data || [])
      else toast.error('Gagal memuat data pendaftar')
    } catch { toast.error('Koneksi gagal') } finally { setAppsLoading(false) }
  }

  useEffect(() => { 
    fetchData()
    fetchApps()
  }, [])

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

  const handleOpenApp = (row) => {
    setSelectedApp(row)
    setAppForm({ status: row.Status, catatan: row.Catatan || '' })
    setIsAppOpen(true)
  }

  const handleUpdateAppStatus = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    try {
      const res = await adminService.updateScholarshipApplicationStatus(selectedApp.ID, appForm)
      if (res.status === 'success') { 
        toast.success('Status pendaftaran diperbarui')
        setIsAppOpen(false)
        fetchApps()
      } else {
        toast.error(res.message || 'Gagal memperbarui status')
      }
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
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

  const appColumns = [
    { key: 'Mahasiswa', label: 'Mahasiswa', className: 'min-w-[200px]', 
      render: (v, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 text-[13px]">{row.Mahasiswa?.Nama || '—'}</span>
          <span className="text-[10px] text-slate-500 font-mono tracking-tighter">{row.Mahasiswa?.NIM || '—'}</span>
        </div>
      )
    },
    { key: 'Beasiswa', label: 'Program Beasiswa', className: 'w-[200px]', 
      render: (v, row) => <span className="text-[12px] font-bold text-slate-600">{row.Beasiswa?.Nama || '—'}</span> 
    },
    { key: 'CreatedAt', label: 'Tanggal Daftar', className: 'w-[150px] text-center', cellClassName: 'text-center',
      render: v => <span className="text-[11px] font-medium text-slate-500">{v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
    },
    { key: 'Status', label: 'Status', className: 'w-[130px] text-center', cellClassName: 'text-center',
      render: v => {
        const styles = {
          'Menunggu': 'bg-amber-100 text-amber-700',
          'Proses': 'bg-blue-100 text-blue-700',
          'Diterima': 'bg-emerald-100 text-emerald-700',
          'Ditolak': 'bg-rose-100 text-rose-700'
        }
        return <Badge className={cn('font-black text-[10px] border-none', styles[v] || 'bg-slate-100 text-slate-700')}>{v}</Badge>
      }
    }
  ]

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-10">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary"><Award className="size-6" /></div>
          <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Manajemen Beasiswa</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kelola Program & Verifikasi Pendaftaran Mahasiswa</div>
        </div>
      </div>

      <Tabs defaultValue="programs" className="w-full">
        <TabsList className="bg-white/50 backdrop-blur-md border border-slate-200 p-1 rounded-2xl mb-6">
          <TabsTrigger value="programs" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all">
            < Award className="size-4 mr-2" />
            <span className="text-[11px] font-black uppercase tracking-wider">Program Beasiswa</span>
          </TabsTrigger>
          <TabsTrigger value="applications" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all">
            < Users className="size-4 mr-2" />
            <span className="text-[11px] font-black uppercase tracking-wider">Verifikasi Pendaftar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
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
        </TabsContent>

        <TabsContent value="applications">
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={appColumns} data={appsData} loading={appsLoading}
                searchPlaceholder="Cari mahasiswa atau program beasiswa..."
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleOpenApp(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/5 rounded-xl"><Eye className="size-4" /></Button>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL: CREATE/EDIT BEASISWA */}
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
              <DialogDescription className="sr-only">Formulir untuk menambah atau mengedit data program beasiswa.</DialogDescription>
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

      {/* MODAL: VERIFIKASI PENDAFTARAN */}
      <Dialog open={isAppOpen} onOpenChange={setIsAppOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Users className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Eye className="size-4" /></div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Applicant Verification</Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">Detail Pendaftaran</DialogTitle>
              <DialogDescription className="sr-only">Lakukan verifikasi dan pembaruan status pendaftaran mahasiswa.</DialogDescription>
            </div>
          </DialogHeader>
          <div className="p-8 pt-6 space-y-6 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="group">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-headline mb-2 block">Informasi Mahasiswa</Label>
                  <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                    <p className="font-black text-slate-900 text-sm font-headline tracking-tight uppercase">{selectedApp?.Mahasiswa?.Nama}</p>
                    <p className="text-xs font-bold text-primary font-mono mt-1">{selectedApp?.Mahasiswa?.NIM}</p>
                    <div className="h-px w-full bg-slate-100 my-3" />
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fakultas / Prodi</p>
                      <p className="text-[11px] font-black text-slate-600 uppercase tracking-tight leading-tight">{selectedApp?.Mahasiswa?.Fakultas?.Nama || '—'} / {selectedApp?.Mahasiswa?.ProgramStudi?.Nama || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="group">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-headline mb-2 block">Program Beasiswa</Label>
                  <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                    <p className="font-black text-slate-900 text-sm font-headline tracking-tight uppercase leading-tight">{selectedApp?.Beasiswa?.Nama}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{selectedApp?.Beasiswa?.Penyelenggara}</p>
                    <div className="h-px w-full bg-slate-100 my-3" />
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-500 uppercase">IPK Min: {selectedApp?.Beasiswa?.IPKMin?.toFixed(2)}</span>
                       <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[9px] px-2 py-0.5 uppercase tracking-tighter">Budget Active</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <div>
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-headline mb-3 block">Dokumen Pendukung</Label>
                  {selectedApp?.BuktiURL ? (
                    <a href={`${API_BASE_URL.replace('/api', '')}${selectedApp.BuktiURL}`} target="_blank" rel="noreferrer" 
                       className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-primary hover:text-primary transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors text-slate-400"><FileText className="size-5" /></div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-black uppercase tracking-wider font-headline group-hover:text-primary">Berkas Utama Pendaftaran</p>
                          <p className="text-[10px] font-bold text-slate-400 group-hover:text-primary/60">Klik untuk melihat atau download file</p>
                        </div>
                      </div>
                      <ExternalLink className="size-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    </a>
                  ) : (
                    <div className="p-4 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5 text-slate-400">
                       <FileText className="size-6 opacity-20" />
                       <span className="text-[10px] font-black uppercase tracking-wider opacity-50">Tidak ada dokumen</span>
                    </div>
                  )}
               </div>

               <form onSubmit={handleUpdateAppStatus} className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-headline ml-1">Verifikasi Status</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { val: 'Menunggu', icon: Loader2, color: 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200', active: 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-200' },
                        { val: 'Proses', icon: Loader2, color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200', active: 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' },
                        { val: 'Diterima', icon: Check, color: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200', active: 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200' },
                        { val: 'Ditolak', icon: X, color: 'hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200', active: 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-200' },
                      ].map(s => (
                        <Button key={s.val} type="button" variant="outline" 
                          onClick={() => setAppForm({ ...appForm, status: s.val })}
                          className={cn('h-12 rounded-2xl flex flex-col items-center justify-center gap-1 border-slate-200 transition-all duration-300', s.color, appForm.status === s.val && s.active)}>
                          { s.val === 'Menunggu' && <Loader2 className={cn("size-3", appForm.status === s.val && "animate-spin")} /> }
                          { s.val === 'Proses' && <Loader2 className={cn("size-3", appForm.status === s.val && "animate-spin")} /> }
                          { s.val === 'Diterima' && <Check className="size-3" /> }
                          { s.val === 'Ditolak' && <X className="size-3" /> }
                          <span className="text-[8px] font-black uppercase tracking-[0.1em]">{s.val}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-headline ml-1">Catatan Verifikasi</Label>
                    <Textarea 
                      value={appForm.catatan} 
                      onChange={e => setAppForm({ ...appForm, catatan: e.target.value })}
                      placeholder="Misal: Berkas lengkap, atau Alasan penolakan..." 
                      className="min-h-[100px] rounded-3xl border-slate-200 bg-slate-50/30 focus:bg-white p-4 font-bold text-[13px] leading-relaxed transition-all duration-300" />
                  </div>

                  <DialogFooter className="pt-2 flex flex-row gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsAppOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8 h-12 rounded-2xl">Batal</Button>
                    <Button type="submit" disabled={isSubmitting} className="h-12 px-10 flex-1 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group">
                      {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 group-hover:rotate-12 transition-transform" />}
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Update Verification</span>
                    </Button>
                  </DialogFooter>
               </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Program Beasiswa?" description="Program beasiswa ini akan dihapus permanen dari sistem." loading={isSubmitting} />
    </div>
  )
}

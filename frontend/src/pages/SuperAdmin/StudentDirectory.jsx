

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
import { Eye, Pencil, Trash2, Loader2, Plus, Save, Users, BookOpen, Mail, GraduationCap, RefreshCw } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from './components/ui/select'

const EMPTY_FORM = { NIM: '', Nama: '', EmailKampus: '', FakultasID: '', ProgramStudiID: '', SemesterSekarang: 1, StatusAkun: 'Aktif', Alamat: '', TahunMasuk: new Date().getFullYear() }

function mapStatusAkun(statusAkun = '', statusAkademik = '') {
  const source = `${statusAkun} ${statusAkademik}`.toLowerCase()
  if (source.includes('lulus')) return 'Lulus'
  if (source.includes('cuti')) return 'Cuti'
  if (source.includes('non-aktif') || source.includes('nonaktif') || source.includes('mengundurkan') || source.includes('drop out') || source.includes('keluar')) return 'Non-Aktif'
  return 'Aktif'
}

function mapSemester(statusAkun = '', semester = 1) {
  if ((statusAkun || '').toLowerCase() === 'lulus') return 0
  const parsed = Number(semester)
  if (!Number.isInteger(parsed) || parsed < 1) return 1
  return parsed
}

function normalizeStudentRow(row = {}) {
  const normalizedStatus = mapStatusAkun(row.StatusAkun, row.StatusAkademik)
  return {
    ...row,
    StatusAkun: normalizedStatus,
    SemesterSekarang: mapSemester(normalizedStatus, row.SemesterSekarang)
  }
}

export default function StudentDirectory() {
  const [students, setStudents] = useState([])
  const [syncedNims, setSyncedNims] = useState(new Set())
  const [prodi, setProdi] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const fetchData = async ({ syncFromPddikti = false, showSyncToast = false } = {}) => {
    setLoading(true)
    try {
      let latestSyncedNims = syncedNims
      if (syncFromPddikti) {
        const syncRes = await adminService.syncPddikti('Universitas Bhakti Kencana', 'all')
        const syncedList = syncRes?.data?.mahasiswa || []
        latestSyncedNims = new Set(syncedList.map(m => String(m?.nim || '').trim()).filter(Boolean))
        setSyncedNims(latestSyncedNims)
        if (showSyncToast) {
          toast.success('Sync PDDikti selesai! Data mahasiswa seluruh fakultas diperbarui.')
        }
      }
      const [stdRes, prodiRes, facRes] = await Promise.all([adminService.getAllStudents(), adminService.getAllProdi(), adminService.getAllFaculties()])
      if (stdRes.status === 'success') {
        const allStudents = (stdRes.data || []).map(normalizeStudentRow)
        const filteredStudents = latestSyncedNims.size > 0
          ? allStudents.filter(s => latestSyncedNims.has(String(s?.NIM || '').trim()))
          : allStudents
        setStudents(filteredStudents)
      }
      if (prodiRes.status === 'success') setProdi(prodiRes.data || [])
      if (facRes.status === 'success') setFaculties(facRes.data || [])
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const [isSyncing, setIsSyncing] = useState(false)

  const handleSyncPddikti = async () => {
    setIsSyncing(true)
    try {
      await fetchData({ syncFromPddikti: true, showSyncToast: true })
    } catch {
      toast.error('Gagal sync PDDikti')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleOpenAdd = () => { setIsEditMode(false); setForm(EMPTY_FORM); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setForm({ ID: row.ID, NIM: row.NIM || '', Nama: row.Nama || '', EmailKampus: row.EmailKampus || row.Pengguna?.Email || '', FakultasID: String(row.FakultasID || ''), ProgramStudiID: String(row.ProgramStudiID || ''), SemesterSekarang: row.SemesterSekarang || 1, StatusAkun: row.StatusAkun || 'Aktif', Alamat: row.Alamat || '', TahunMasuk: row.TahunMasuk || new Date().getFullYear() })
    setIsCrudOpen(true)
  }
  const handleSave = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    const payload = { ...form, FakultasID: parseInt(form.FakultasID) || 0, ProgramStudiID: parseInt(form.ProgramStudiID) || 0, SemesterSekarang: parseInt(form.SemesterSekarang) || 1, TahunMasuk: parseInt(form.TahunMasuk) || new Date().getFullYear() }
    try {
      const res = form.ID ? await adminService.updateStudent(form.ID, payload) : await adminService.createStudent(payload)
      if (res.status === 'success') {
        toast.success(form.ID ? 'Data diperbarui' : 'Mahasiswa ditambahkan')
        setIsCrudOpen(false)
        fetchData()
      } else {
        toast.error(res.message || 'Gagal menyimpan')
      }
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteStudent(selected.ID)
      toast.success('Mahasiswa dihapus'); setIsDelOpen(false); fetchData()
    } catch { toast.error('Gagal menghapus') } finally { setIsSubmitting(false) }
  }

  const columns = [
    { key: 'NIM', label: 'NIM / ID', className: 'w-[140px]', render: v => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">{v}</span> },
    { key: 'Nama', label: 'Profil Mahasiswa', className: 'min-w-[280px]',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100">
            <AvatarFallback className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase">
              {v?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{v}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
              <Mail className="size-2.5 opacity-60" />{row.EmailKampus || row.Pengguna?.Email || '—'}
            </span>
          </div>
        </div>
      )
    },
    { key: 'Fakultas', label: 'Fakultas', className: 'w-[180px]', render: v => <span className="text-[12px] font-bold text-slate-500 font-headline uppercase">{v?.Nama || '—'}</span> },
    { key: 'ProgramStudi', label: 'Program Studi', className: 'w-[200px]', render: v => <span className="text-xs text-slate-600 font-black font-headline uppercase">{v?.Nama || '—'}</span> },
    { key: 'SemesterSekarang', label: 'Semester', className: 'w-[80px] text-center', cellClassName: 'text-center', render: (v, row) => <span className="font-bold text-slate-900 font-headline text-xs">{row.StatusAkun === 'Lulus' ? '-' : (v || 1)}</span> },
    { key: 'StatusAkun', label: 'Status', className: 'w-[120px] text-center', cellClassName: 'text-center',
      render: v => (
        <Badge className={cn('capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm',
          v === 'Aktif' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20' :
          v === 'Cuti' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-500/20' :
          v === 'Lulus' ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-500/20' :
          v === 'Non-Aktif' ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-500/20' :
          'bg-slate-100 text-slate-600')}>{v || 'Aktif'}
        </Badge>
      )
    }
  ]

  return (
    <div className="p-4 md:p-8 space-y-8">
          <Toaster position="top-right" />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><GraduationCap className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Direktori Mahasiswa</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manajemen Data Mahasiswa Seluruh Fakultas</p>
            </div>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={students} loading={loading}
                searchPlaceholder="Cari NIM atau Nama mahasiswa..."
                onAdd={handleOpenAdd} addLabel="Mahasiswa Baru"
                onExport={handleSyncPddikti} exportLabel={isSyncing ? "Menyinkronkan..." : "Sync PDDikti"}
                filters={[
                  { key: 'StatusAkun', placeholder: 'Filter Status', options: [{ label: 'Aktif', value: 'Aktif' }, { label: 'Cuti', value: 'Cuti' }, { label: 'Lulus', value: 'Lulus' }] },
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

      {/* Detail */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl">
          <DialogTitle className="sr-only">{selected?.Nama || 'Detail Mahasiswa'}</DialogTitle>
          <DialogDescription className="sr-only">Informasi lengkap mengenai biodata dan status akademik mahasiswa.</DialogDescription>
          {selected && (
            <div className="flex flex-col max-h-[85vh]">
              <div className="h-40 bg-slate-900 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent" />
                <div className="absolute -bottom-10 left-8 z-20 p-1.5 bg-white rounded-[1.5rem] shadow-2xl">
                  <Avatar className="h-20 w-20 rounded-[1.2rem]">
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 text-2xl font-black">{selected.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="overflow-y-auto p-8 pt-14 space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">{selected.Nama}</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selected.NIM}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {[ ['Program Studi', selected.ProgramStudi?.Nama], ['Semester', selected.StatusAkun === 'Lulus' ? '-' : selected.SemesterSekarang], ['Status', selected.StatusAkun], ['Email', selected.Pengguna?.Email], ['IPK', selected.IPK?.toFixed(2) || '0.00'], ['Total SKS', selected.TotalSKS || 0] ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                      <p className="text-sm font-black text-slate-900 font-headline truncate">{val || '—'}</p>
                    </div>
                  ))}
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tahun Masuk / Angkatan</p>
                    <p className="text-sm font-black text-slate-900 font-headline">{selected.TahunMasuk || '—'}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8 h-10 rounded-2xl">Tutup</Button>
                <Button onClick={() => { setIsDetailOpen(false); handleOpenEdit(selected) }} className="h-10 px-8 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest">Edit Data</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CRUD */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><GraduationCap className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}</div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Student Registry</Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">{isEditMode ? 'Update Mahasiswa' : 'Registrasi Baru'}</DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">Dokumentasi data akademik & personal mahasiswa.</DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-8 pt-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">NIM</Label><Input required value={form.NIM} onChange={e => setForm({ ...form, NIM: e.target.value })} placeholder="BKU2024001" className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline uppercase" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Lengkap</Label><Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama mahasiswa..." className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
            </div>
            <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Email Kampus</Label><Input required type="email" value={form.EmailKampus} onChange={e => setForm({ ...form, EmailKampus: e.target.value })} placeholder="email@bku.ac.id" className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Fakultas</Label>
                <Select value={String(form.FakultasID)} onValueChange={v => setForm({ ...form, FakultasID: v, ProgramStudiID: '' })}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline"><SelectValue placeholder="Pilih Fakultas" /></SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl p-1">
                    {faculties.map(f => <SelectItem key={f.ID} value={String(f.ID)} className="rounded-xl font-bold text-[11px] p-3 uppercase">{f.Nama}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Program Studi</Label>
                <Select value={String(form.ProgramStudiID)} onValueChange={v => setForm({ ...form, ProgramStudiID: v })}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline"><SelectValue placeholder="Pilih Prodi" /></SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl p-1">
                    {prodi.filter(p => !form.FakultasID || p.FakultasID === parseInt(form.FakultasID)).map(p => (
                      <SelectItem key={p.ID} value={String(p.ID)} className="rounded-xl font-bold text-[11px] p-3 uppercase">{p.Nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Status Akun</Label>
                <Select value={form.StatusAkun} onValueChange={v => setForm({ ...form, StatusAkun: v })}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl p-1">
                    {['Aktif', 'Cuti', 'Lulus', 'Nonaktif'].map(s => <SelectItem key={s} value={s} className="rounded-xl font-bold text-[11px] p-3 uppercase">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Semester Aktif</Label><Input type="number" min={1} max={14} value={form.SemesterSekarang} onChange={e => setForm({ ...form, SemesterSekarang: e.target.value })} className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
            </div>
            <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Tahun Masuk</Label><Input type="number" value={form.TahunMasuk} onChange={e => setForm({ ...form, TahunMasuk: e.target.value })} className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" /></div>
          </form>
          <div className="px-8 pb-8 pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/30">
            <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl">Batalkan</Button>
            <Button onClick={handleSave} disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
              {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isEditMode ? 'Update Record' : 'Create Record'}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Mahasiswa?" description="Data akademik mahasiswa ini akan dihapus permanen dari sistem." loading={isSubmitting} />
    </div>
  )
}

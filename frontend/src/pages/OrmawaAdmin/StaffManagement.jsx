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
import { Avatar, AvatarFallback } from './components/ui/avatar'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

const JABATAN = ['Pembina', 'Penanggung Jawab', 'Sekretaris Eksekutif', 'Koordinator Program', 'Staf Khusus']

export default function StaffManagement() {
 const [data, setData] = useState([])
 const [loading, setLoading] = useState(true)
 const [selected, setSelected] = useState(null)
 const [isDetailOpen, setIsDetailOpen] = useState(false)
 const [isCrudOpen, setIsCrudOpen] = useState(false)
 const [isDelOpen, setIsDelOpen] = useState(false)
 const [isEditMode, setIsEditMode] = useState(false)
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [students, setStudents] = useState([])
 const [searchTerm, setSearchTerm] = useState('')
 const [isDropdownOpen, setIsDropdownOpen] = useState(false)
 const dropdownRef = React.useRef(null)
 const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.OrmawaID || 1
 const [form, setForm] = useState({ Nama: '', MahasiswaID: '', Jabatan: 'Pembina', Divisi: 'Umum', Email: '', NoHP: '', OrmawaID: ormawaId })

 useEffect(() => {
 const handleClickOutside = (event) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
 setIsDropdownOpen(false)
 }
 }
 document.addEventListener("mousedown", handleClickOutside)
 return () => document.removeEventListener("mousedown", handleClickOutside)
 }, [])

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
 setForm({ 
 ID: row.ID, 
 Nama: row.Mahasiswa?.Nama || '', 
 MahasiswaID: String(row.MahasiswaID || ''), 
 Jabatan: row.Role || 'Pembina', 
 Divisi: row.Divisi || 'Umum',
 Email: row.Mahasiswa?.EmailKampus || '', 
 NoHP: row.Mahasiswa?.NoHP || '', 
 OrmawaID: ormawaId 
 })
 setIsCrudOpen(true)
 }
 const handleSave = async (e) => {
 e.preventDefault(); setIsSubmitting(true)
 const url = isEditMode ? `${API}/members/${form.ID}` : `${API}/members`
 const method = isEditMode ? 'PUT' : 'POST'
 try {
 const payload = { 
 Role: form.Jabatan, 
 Divisi: form.Divisi,
 MahasiswaID: Number(form.MahasiswaID), 
 OrmawaID: Number(form.OrmawaID),
 EmailKampus: form.Email,
 NoHP: form.NoHP
 }
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
 <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black ">
 {row.Mahasiswa?.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
 </AvatarFallback>
 </Avatar>
 <div className="flex flex-col leading-tight">
 <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{row.Mahasiswa?.Nama || '—'}</span>
 <span className="text-[10px] text-slate-400 font-bold tracking-tight flex items-center gap-1">
 <span className="material-symbols-outlined size-2.5 opacity-60" >mail</span>{row.Mahasiswa?.NIM || '—'}
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
 render: v => <span className="text-xs text-slate-600 font-bold font-headline ">{v || 'Umum'}</span>
 }
 ]

 return (
 <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
 <Toaster position="top-right" />
 
 {/* ── Welcome Banner ─────────────────────────────────────────── */}
 <section className="relative overflow-hidden rounded-3xl h-48 flex items-center group shadow-sm border border-slate-200/80">
 <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50" />
 <div className="absolute inset-0 opacity-[0.03]"
 style={{
 backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
 backgroundSize: '60px 60px'
 }}
 />
 <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
 <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

 <div className="relative z-10 px-10 flex-1">
 <div className="flex items-center gap-2 mb-3">
 <span className="h-1.5 w-6 bg-primary/40 rounded-full" />
 <span className="text-[10px] font-bold text-slate-400 tracking-[0.25em]">
 Ormawa Admin
 </span>
 </div>
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-primary/10 backdrop-blur-md rounded-xl text-primary shadow-inner">
 <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >manage_accounts</span>
 </div>
 <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">
 Manajemen Staf
 </h1>
 </div>
 <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">
 Pengelolaan staf, penugasan spesifik, dan struktur kepengurusan organisasi mahasiswa.
 </p>
 </div>
 </section>

 {/* ── Content Area ───────────────────────────────────────────── */}
 <Card className="border border-[#e5e5e5] shadow-sm overflow-hidden bg-white rounded-3xl">
 <CardContent className="p-0">
 <DataTable
 columns={columns} data={data} loading={loading}
 searchPlaceholder="Cari nama atau NIM staf..."
 onAdd={handleOpenAdd} addLabel="Tambah Staf"
 actions={(row) => (
 <div className="flex items-center gap-2">
 <Button onClick={() => { setSelected(row); setIsDetailOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-xl"><span className="material-symbols-outlined size-4" >visibility</span></Button>
 <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-600 hover:bg-amber-50 rounded-xl"><span className="material-symbols-outlined size-4" >edit</span></Button>
 <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><span className="material-symbols-outlined size-4" >delete</span></Button>
 </div>
 )}
 />
 </CardContent>
 </Card>

 {/* CRUD */}
 <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
 <DialogContent className="max-w-lg p-0 overflow-visible border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
 <DialogHeader className="p-4 md:p-8 pb-3 md:pb-6 bg-gradient-to-br from-slate-50 to-white rounded-t-[2rem] border-b border-slate-100 relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><span className="material-symbols-outlined size-24 rotate-12" >manage_accounts</span></div>
 <div className="relative z-10">
 <div className="flex items-center gap-3 mb-1 md:mb-2">
 <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
 {isEditMode ? <span className="material-symbols-outlined size-4" >edit</span> : <span className="material-symbols-outlined size-4 stroke-[3px]" >add</span>}
 </div>
 <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Staff Registry</Badge>
 </div>
 <DialogTitle className="text-lg md:text-2xl font-black font-headline tracking-tighter text-slate-900 ">{isEditMode ? 'Edit Staf' : 'Tambah Staf Baru'}</DialogTitle>
 <DialogDescription className="text-[10px] md:text-xs font-medium text-slate-400 mt-1">Daftarkan staf dengan jabatan dan tugas yang sesuai.</DialogDescription>
 </div>
 </DialogHeader>
 <form onSubmit={handleSave} className="p-4 md:p-8 pt-3 md:pt-6 space-y-3 md:space-y-5 relative">
 <div className="space-y-2 relative" ref={dropdownRef}>
 <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Pilih Mahasiswa</Label>
 <div 
 className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 flex items-center justify-between cursor-pointer focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
 >
 <span className="text-sm font-bold text-slate-700 truncate font-headline">
 {form.MahasiswaID 
 ? (() => {
 const s = students.find(x => (x?.id?.toString() || x?.ID?.toString()) === form?.MahasiswaID?.toString());
 return s ? `${s.Nama} (${s.NIM})` : '-- Pilih Mahasiswa --';
 })()
 : '-- Pilih Mahasiswa --'}
 </span>
 <span className="material-symbols-outlined" className={`size-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
 </div>

 {isDropdownOpen && (
 <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col">
 <div className="p-2 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
 <div className="relative">
 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" >search</span>
 <input 
 type="text" 
 placeholder="Cari nama atau NIM..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border-none text-xs font-bold text-slate-700 focus:ring-0 outline-none"
 onClick={(e) => e.stopPropagation()}
 />
 </div>
 </div>
 <div className="overflow-y-auto flex-1 p-1">
 {students.filter(s => s?.Nama?.toLowerCase().includes(searchTerm.toLowerCase()) || s?.NIM?.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
 <button 
 type="button"
 key={s.id || s.ID} 
 className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors ${form?.MahasiswaID?.toString() === (s?.id?.toString() || s?.ID?.toString()) ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-50'}`}
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 setForm({ ...form, MahasiswaID: s?.id?.toString() || s?.ID?.toString() });
 setIsDropdownOpen(false);
 setSearchTerm('');
 }}
 >
 {s.Nama} <span className="text-[10px] text-slate-400 font-medium ml-1">({s.NIM})</span>
 </button>
 ))}
 {students.filter(s => s?.Nama?.toLowerCase().includes(searchTerm.toLowerCase()) || s?.NIM?.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
 <div className="px-3 py-4 text-center text-xs font-medium text-slate-400">
 Pencarian tidak ditemukan
 </div>
 )}
 </div>
 </div>
 )}
 </div>

 <div className="space-y-2">
 <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Jabatan</Label>
 <select value={form.Jabatan} onChange={e => setForm({ ...form, Jabatan: e.target.value })}
 className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white transition-all font-headline">
 {JABATAN.map(j => <option key={j} value={j}>{j}</option>)}
 </select>
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Divisi</Label>
 <Input value={form.Divisi} onChange={e => setForm({ ...form, Divisi: e.target.value })} placeholder="Masukkan nama divisi..."
 className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm" />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Email</Label>
 <Input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="email@bku.ac.id"
 className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm" />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">No. HP</Label>
 <Input value={form.NoHP} onChange={e => setForm({ ...form, NoHP: e.target.value })} placeholder="08xx-xxxx-xxxx"
 className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm" />
 </div>
 </div>
 <DialogFooter className="mt-4 pt-4 flex flex-col md:flex-row items-center justify-end gap-3 border-t border-slate-100 - md:-mx-8 px-4 md:px-8 bg-slate-50/30 pb-4 md:pb-0">
 <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="w-full md:w-auto text-[9px] md:text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-900 px-8 h-10 md:h-12 rounded-xl md:rounded-2xl">Batalkan</Button>
 <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-10 md:h-12 px-10 rounded-xl md:rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
 {isSubmitting ? <span className="material-symbols-outlined animate-spin size-4 mr-2" >sync</span> : <span className="material-symbols-outlined size-4 mr-2 stroke-[3px]" >save</span>}
 <span className="text-[9px] md:text-[10px] font-black tracking-[0.2em]">{isEditMode ? 'Update Record' : 'Create Record'}</span>
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>

 <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
 title="Hapus Staf?" description="Data staf ini akan dihapus permanen dari sistem." loading={isSubmitting} />

 {/* DETAIL VIEW */}
 <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
 <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white ">
 <div className="relative">
 {/* Header / Banner */}
 <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
 
 <div className="px-8 pb-8 -mt-12 relative z-10">
 <div className="flex items-end justify-between mb-8">
 <Avatar className="size-24 rounded-[2rem] border-4 border-white shadow-xl ring-1 ring-slate-100">
 <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black ">
 {selected?.Mahasiswa?.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
 </AvatarFallback>
 </Avatar>
 <div className="flex gap-2 mb-2">
 <Badge className="bg-primary/5 text-primary font-black text-[10px] border-none px-4 py-1.5 tracking-widest">
 {selected?.Role || 'STAF'}
 </Badge>
 </div>
 </div>

 <div className="space-y-6">
 <div>
 <h2 className="text-3xl font-black text-slate-900 font-headline tracking-tight leading-tight mb-1">
 {selected?.Mahasiswa?.Nama || 'Nama Tidak Tersedia'}
 </h2>
 <p className="text-xs font-bold text-slate-400 tracking-[0.2em] font-headline">
 NIM: {selected?.Mahasiswa?.NIM || '—'}
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
 <div className="space-y-1.5">
 <p className="text-[10px] font-black text-slate-400 tracking-widest font-headline">Jabatan Struktural</p>
 <p className="text-sm font-bold text-slate-700">{selected?.Role || 'Anggota'}</p>
 </div>
 <div className="space-y-1.5">
 <p className="text-[10px] font-black text-slate-400 tracking-widest font-headline">Divisi Kerja</p>
 <p className="text-sm font-bold text-slate-700">{selected?.Divisi || 'Umum'}</p>
 </div>
 <div className="space-y-1.5">
 <p className="text-[10px] font-black text-slate-400 tracking-widest font-headline">Email Kampus</p>
 <p className="text-sm font-bold text-slate-700 underline underline-offset-4 decoration-primary/30">
 {selected?.Mahasiswa?.EmailKampus || selected?.Mahasiswa?.email_kampus || '—'}
 </p>
 </div>
 <div className="space-y-1.5">
 <p className="text-[10px] font-black text-slate-400 tracking-widest font-headline">No. WhatsApp</p>
 <p className="text-sm font-bold text-slate-700">
 {selected?.Mahasiswa?.NoHP || selected?.Mahasiswa?.no_hp || '—'}
 </p>
 </div>
 </div>

 <div className="space-y-3">
 <p className="text-[10px] font-black text-slate-400 tracking-widest font-headline ml-1">Tugas & Kontribusi</p>
 <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 italic">
"Staf bertanggung jawab dalam membantu koordinasi internal organisasi sesuai dengan jabatan yang diamanahkan."
 </p>
 </div>
 </div>
 </div>
 </div>

 <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100">
 <Button onClick={() => setIsDetailOpen(false)} className="w-full h-12 rounded-2xl bg-white text-slate-900 border border-slate-200 font-black text-[10px] tracking-[0.2em] hover:bg-slate-50 shadow-sm">
 Tutup Pratinjau
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 )
}

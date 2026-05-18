"use client"

import React, { useState, useEffect, useRef } from 'react'
import { DataTable } from '../FacultyAdmin/components/data-table'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../FacultyAdmin/components/dialog'
import { DeleteConfirmModal } from '../FacultyAdmin/components/DeleteConfirmModal'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Input } from '../FacultyAdmin/components/input'
import { Label } from '../FacultyAdmin/components/label'
import { Avatar, AvatarFallback } from '../FacultyAdmin/components/avatar'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

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
 const [searchTerm, setSearchTerm] = useState('')
 const [isDropdownOpen, setIsDropdownOpen] = useState(false)
 const dropdownRef = useRef(null)
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

 useEffect(() => {
 const handleClickOutside = (event) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
 setIsDropdownOpen(false)
 }
 }
 document.addEventListener("mousedown", handleClickOutside)
 return () => document.removeEventListener("mousedown", handleClickOutside)
 }, [])

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
 <AvatarFallback className="bg-slate-100 text-slate-800 text-[10px] font-black ">
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
 key: 'Role', label: 'Jabatan', className: 'w-[200px]',
 render: (val) => <span className="text-xs text-slate-600 font-black font-headline ">{val || '—'}</span>
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
 <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >group</span>
 </div>
 <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">
 Manajemen Anggota
 </h1>
 </div>
 <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">
 Database keanggotaan dan struktur kepengurusan organisasi mahasiswa.
 </p>
 </div>
 </section>

 {/* ── Content Area ───────────────────────────────────────────── */}
 <Card className="border border-[#e5e5e5] shadow-sm overflow-hidden bg-white rounded-3xl">
 <CardContent className="p-0">
 <DataTable
 columns={columns} data={members} loading={loading}
 searchPlaceholder="Cari nama atau NIM anggota..."
 onAdd={handleOpenAdd} addLabel="Tambah Anggota"
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

 {/* DETAIL */}
 <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
 <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white">
 {selected && (
 <div>
 <div className="h-36 bg-[#00236F] relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" />
 <div className="absolute inset-0 opacity-20"
 style={{
 backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px)`,
 backgroundSize: '40px 40px'
 }}
 />
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
 <h2 className="text-2xl font-black text-slate-900 font-headline tracking-tighter ">{selected.Mahasiswa?.Nama}</h2>
 <p className="text-xs font-bold text-slate-400 tracking-widest flex items-center gap-1 mt-1">
 <span className="material-symbols-outlined size-3" >mail</span> {selected.Mahasiswa?.NIM}
 </p>
 </div>
 <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
 <div><p className="text-[9px] font-black text-slate-400 tracking-widest">Jabatan</p><p className="text-sm font-black text-slate-900 font-headline ">{selected.Role || '—'}</p></div>
 <div><p className="text-[9px] font-black text-slate-400 tracking-widest">Divisi</p><p className="text-sm font-black text-blue-600 font-headline ">{selected.Divisi || 'Umum'}</p></div>
 </div>
 <Button onClick={() => setIsDetailOpen(false)} className="w-full h-12 rounded-2xl bg-[#00236F] hover:bg-[#003399] text-white font-black text-[10px] tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95">Tutup Profil</Button>
 </div>
 </div>
 )}
 </DialogContent>
 </Dialog>

 {/* CRUD */}
 <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
 <DialogContent className="max-w-lg p-0 overflow-visible border-none shadow-2xl rounded-[2rem] bg-white">
 <DialogHeader className="p-4 md:p-8 pb-3 md:pb-6 bg-gradient-to-br from-blue-50 to-white rounded-t-[2rem] border-b border-slate-100 relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><span className="material-symbols-outlined size-24 rotate-12 text-[#00236F]" >group</span></div>
 <div className="relative z-10">
 <div className="flex items-center gap-3 mb-1 md:mb-2">
 <div className="size-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
 {isEditMode ? <span className="material-symbols-outlined size-4" >edit</span> : <span className="material-symbols-outlined size-4 stroke-[3px]" >add</span>}
 </div>
 <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-blue-50 text-blue-600 border-none">Anggota Registry</Badge>
 </div>
 <DialogTitle className="text-lg md:text-2xl font-black font-headline tracking-tighter text-slate-900 ">{isEditMode ? 'Edit Anggota' : 'Tambah Anggota Baru'}</DialogTitle>
 <DialogDescription className="text-[10px] md:text-xs font-medium text-slate-500 mt-1">Daftarkan mahasiswa sebagai anggota aktif ormawa.</DialogDescription>
 </div>
 </DialogHeader>
 <form onSubmit={handleSave} className="p-4 md:p-8 pt-3 md:pt-6 space-y-3 md:space-y-5">
 <div className="space-y-2 relative" ref={dropdownRef}>
 <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Pilih Mahasiswa</Label>
 <div 
 className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 flex items-center justify-between cursor-pointer focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
 >
 <span className="text-sm font-bold text-slate-700 truncate">
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
 <div className="p-2 border-b border-slate-100">
 <div className="relative">
 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" >search</span>
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
 className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors ${form?.MahasiswaID?.toString() === (s?.id?.toString() || s?.ID?.toString()) ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
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
 Mahasiswa tidak ditemukan
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-[9px] md:text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Jabatan</Label>
 <select value={form.Role} onChange={e => setForm({ ...form, Role: e.target.value })}
 className="w-full h-10 md:h-12 rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs md:text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
 {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
 </select>
 </div>
 <div className="space-y-2">
 <Label className="text-[9px] md:text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Divisi</Label>
 <Input value={form.Divisi} onChange={e => setForm({ ...form, Divisi: e.target.value })} placeholder="Misal: Humas, IT, dll."
 className="h-10 md:h-12 rounded-xl md:rounded-2xl border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-xs md:text-sm font-headline" />
 </div>
 </div>
 <DialogFooter className="mt-4 pt-4 flex flex-col md:flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-4 md:-mx-8 px-4 md:px-8 bg-slate-50/50 pb-4 md:pb-8">
 <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="w-full md:w-auto text-[9px] md:text-[10px] font-black tracking-widest text-slate-500 hover:text-slate-900 px-8 h-10 md:h-12 rounded-xl md:rounded-2xl">Batalkan</Button>
 <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-10 md:h-12 px-10 rounded-xl md:rounded-2xl bg-[#00236F] text-white hover:bg-[#003399] shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-95">
 {isSubmitting ? <span className="material-symbols-outlined animate-spin size-4 mr-2" >sync</span> : <span className="material-symbols-outlined size-4 mr-2 stroke-[3px]" >save</span>}
 <span className="text-[9px] md:text-[10px] font-black tracking-[0.2em]">{isEditMode ? 'Update Record' : 'Simpan Data'}</span>
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

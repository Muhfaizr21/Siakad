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

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

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
 <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
 <Toaster position="top-right" />
 
 {/* ── Welcome Banner ─────────────────────────────────────────── */}
 <section className="relative overflow-hidden rounded-3xl h-auto md:h-48 flex flex-col md:flex-row items-center group shadow-sm p-8 md:p-0 border border-slate-200/80">
 <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50" />
 <div className="absolute inset-0 opacity-[0.03]"
 style={{
 backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
 backgroundSize: '60px 60px'
 }}
 />
 <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
 <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

 <div className="relative z-10 md:px-10 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-6">
 <div>
 <div className="flex items-center gap-2 mb-3">
 <span className="h-1.5 w-6 bg-primary/40 rounded-full" />
 <span className="text-[10px] font-bold text-slate-400 tracking-[0.25em]">
 Ormawa Admin
 </span>
 </div>
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-primary/10 backdrop-blur-md rounded-xl text-primary shadow-inner">
 <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >campaign</span>
 </div>
 <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">
 Siaran & Pengumuman
 </h1>
 </div>
 <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">
 Publikasi informasi, kebijakan, dan pengumuman penting untuk seluruh anggota.
 </p>
 </div>
 
 <Button onClick={handleOpenAdd} className="h-12 px-6 rounded-2xl bg-[#00236F] text-white hover:bg-[#003399] font-black text-[10px] tracking-widest shadow-xl shadow-blue-900/20 gap-2 w-full md:w-auto shrink-0">
 <span className="material-symbols-outlined size-4 stroke-[3px]" >add</span> Buat Pengumuman
 </Button>
 </div>
 </section>

 {/* ── Content Area ───────────────────────────────────────────── */}
 <Card className="border border-[#e5e5e5] shadow-sm overflow-hidden bg-white rounded-3xl">
 <CardContent className="p-0">
 <DataTable
 columns={columns} data={data} loading={loading}
 searchPlaceholder="Cari judul pengumuman..."
 onAdd={handleOpenAdd} addLabel="Buat Pengumuman"
 filters={[{ key: 'Kategori', placeholder: 'Filter Kategori', options: [{ label: 'Umum', value: 'umum' }, { label: 'Kegiatan', value: 'kegiatan' }, { label: 'Penting', value: 'penting' }, { label: 'Info', value: 'info' }] }]}
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

 {/* Detail */}
 <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
 <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl ">
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
 <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="text-[10px] font-black tracking-widest text-slate-400 px-8 h-10 rounded-2xl">Tutup</Button>
 <Button onClick={() => { setIsDetailOpen(false); handleOpenEdit(selected) }} className="text-[10px] font-black tracking-widest h-10 px-8 rounded-2xl bg-primary text-white">Edit</Button>
 </div>
 </div>
 </div>
 )}
 </DialogContent>
 </Dialog>

 {/* CRUD */}
 <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
 <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl ">
 <DialogHeader className="p-4 md:p-8 pb-3 md:pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><span className="material-symbols-outlined size-24 rotate-12" >campaign</span></div>
 <div className="relative z-10">
 <div className="flex items-center gap-3 mb-1 md:mb-2">
 <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
 {isEditMode ? <span className="material-symbols-outlined size-4" >edit</span> : <span className="material-symbols-outlined size-4 stroke-[3px]" >add</span>}
 </div>
 <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Announcement</Badge>
 </div>
 <DialogTitle className="text-lg md:text-2xl font-black font-headline tracking-tighter text-slate-900 ">{isEditMode ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</DialogTitle>
 <DialogDescription className="text-[10px] md:text-xs font-medium text-slate-400 mt-1">Publikasikan informasi penting untuk seluruh anggota.</DialogDescription>
 </div>
 </DialogHeader>
 <form onSubmit={handleSave} className="p-4 md:p-8 pt-3 md:pt-6 space-y-3 md:space-y-4">
 <div className="space-y-2">
 <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Judul Pengumuman</Label>
 <Input required value={form.Judul} onChange={e => setForm({ ...form, Judul: e.target.value })} placeholder="Masukkan judul pengumuman..."
 className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Kategori</Label>
 <select value={form.Kategori} onChange={e => setForm({ ...form, Kategori: e.target.value })}
 className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white transition-all">
 <option value="umum">Umum</option><option value="kegiatan">Kegiatan</option><option value="penting">Penting</option><option value="info">Info</option>
 </select>
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Isi Pengumuman</Label>
 <Textarea required value={form.Isi} onChange={e => setForm({ ...form, Isi: e.target.value })} placeholder="Tuliskan isi pengumuman di sini..."
 className="min-h-[120px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm leading-relaxed font-headline" />
 </div>
 <DialogFooter className="mt-4 pt-4 flex flex-col md:flex-row items-center justify-end gap-2 md:gap-3 border-t border-slate-100 -mx-4 md:-mx-8 px-4 md:px-8 bg-slate-50/30 pb-4 md:pb-0">
 <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="w-full md:w-auto text-[9px] md:text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-900 px-8 h-10 md:h-12 rounded-xl md:rounded-2xl">Batalkan</Button>
 <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-10 md:h-12 px-10 rounded-xl md:rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
 {isSubmitting ? <span className="material-symbols-outlined animate-spin size-4 mr-2" >sync</span> : <span className="material-symbols-outlined size-4 mr-2 stroke-[3px]" >save</span>}
 <span className="text-[9px] md:text-[10px] font-black tracking-[0.2em]">{isEditMode ? 'Update Record' : 'Publish Sekarang'}</span>
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

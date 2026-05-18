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

export default function AspirationManagement() {
 const [sidebarOpen, setSidebarOpen] = useState(false)
 const [data, setData] = useState([])
 const [loading, setLoading] = useState(true)
 const [selected, setSelected] = useState(null)
 const [isDetailOpen, setIsDetailOpen] = useState(false)
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [tanggapan, setTanggapan] = useState('')
 const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.ID || 1

 const fetchData = async () => {
 setLoading(true)
 try {
 const data = await fetchWithAuth(`${API}/aspirations?ormawaId=${ormawaId}`)
 if (data.status === 'success') setData(data.data || [])
 else toast.error('Gagal memuat aspirasi')
 } catch { toast.error('Koneksi gagal') } finally { setLoading(false) }
 }
 useEffect(() => { fetchData() }, [])

 const handleTanggapi = async () => {
 if (!tanggapan.trim()) { toast.error('Isi tanggapan terlebih dahulu'); return }
 setIsSubmitting(true)
 try {
 const data = await fetchWithAuth(`${API}/aspirations/${selected?.ID}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ Tanggapan: tanggapan, Status: 'ditanggapi' })
 })
 if (data.status === 'success') { toast.success('Tanggapan berhasil dikirim'); setIsDetailOpen(false); setTanggapan(''); fetchData() }
 else toast.error(data.message || 'Gagal mengirim tanggapan')
 } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
 }

 const columns = [
 { key: 'Judul', label: 'Topik Aspirasi', className: 'min-w-[280px]',
 render: (v, row) => (
 <div className="flex flex-col leading-tight">
 <span className="font-bold text-slate-900 text-[13px] font-headline tracking-tighter">{v || '—'}</span>
 <span className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5">{row.OrmawaNama || 'Ormawa'}</span>
 </div>
 )
 },
 { key: 'Status', label: 'Status', className: 'w-[150px] text-center', cellClassName: 'text-center',
 render: v => (
 <Badge className={cn('font-black text-[10px] px-3 py-1 border-none shadow-sm',
 v === 'ditanggapi' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20' :
 v === 'pending' || !v ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-500/20' :
 'bg-slate-100 text-slate-600')}>{v === 'ditanggapi' ? 'Ditanggapi' : v === 'pending' || !v ? 'Menunggu' : v}</Badge>
 )
 },
 { key: 'CreatedAt', label: 'Dikirim', className: 'w-[160px]',
 render: v => <span className="font-bold text-slate-400 text-[11px] font-headline">{v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
 }
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

 <div className="relative z-10 md:px-10 flex-1 flex flex-col justify-center items-start w-full gap-2">
 <div className="flex items-center gap-2 mb-3">
 <span className="h-1.5 w-6 bg-primary/40 rounded-full" />
 <span className="text-[10px] font-bold text-slate-400 tracking-[0.25em]">
 Ormawa Admin
 </span>
 </div>
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-primary/10 backdrop-blur-md rounded-xl text-primary shadow-inner">
 <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >chat</span>
 </div>
 <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">
 Aspirasi Organisasi
 </h1>
 </div>
 <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">
 Tampung dan berikan tanggapan resmi atas aspirasi dari mahasiswa.
 </p>
 </div>
 </section>

 {/* ── Content Area ───────────────────────────────────────────── */}
 <Card className="border border-[#e5e5e5] shadow-sm overflow-hidden bg-white rounded-3xl">
 <CardContent className="p-0">
 <DataTable
 columns={columns} data={data} loading={loading}
 searchPlaceholder="Cari topik aspirasi..."
 filters={[{ key: 'Status', placeholder: 'Filter Status', options: [{ label: 'Menunggu', value: 'menunggu' }, { label: 'Ditanggapi', value: 'ditanggapi' }] }]}
 actions={(row) => (
 <Button onClick={() => { setSelected(row); setTanggapan(''); setIsDetailOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-xl">
 <span className="material-symbols-outlined size-4" >visibility</span>
 </Button>
 )}
 />
 </CardContent>
 </Card>

 <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
 <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl ">
 {selected && (
 <div>
 <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
 <div className="relative z-10">
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className="text-[10px] font-black text-slate-400 tracking-widest mb-1">Aspirasi #{selected.ID}</p>
 <h2 className="text-xl font-black text-white font-headline tracking-tighter">{selected.Judul}</h2>
 </div>
 <Badge className={cn('font-black text-[9px] px-3 py-1 border-none shrink-0',
 selected.Status === 'ditanggapi' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400')}>
 {selected.Status === 'ditanggapi' ? 'Ditanggapi' : 'Menunggu'}
 </Badge>
 </div>
 </div>
 </div>
 <div className="p-6 md:p-8 space-y-4 md:space-y-6">
 <div>
 <p className="text-[9px] font-black text-slate-400 tracking-widest mb-2 font-headline">Isi Aspirasi</p>
 <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{selected.Isi || selected.Konten || '—'}</p>
 </div>
 {selected.Tanggapan && (
 <div>
 <p className="text-[9px] font-black text-emerald-600 tracking-widest mb-2 font-headline flex items-center gap-1.5"><span className="material-symbols-outlined size-3" >check_circle</span> Tanggapan Ormawa</p>
 <p className="text-sm text-slate-600 font-medium leading-relaxed bg-emerald-50 p-4 rounded-2xl border border-emerald-100">{selected.Tanggapan}</p>
 </div>
 )}
 {selected.Status !== 'ditanggapi' && (
 <div className="space-y-3">
 <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] font-headline">Tulis Tanggapan</Label>
 <Textarea rows={3} value={tanggapan} onChange={e => setTanggapan(e.target.value)}
 placeholder="Tulis balasan/tanggapan resmi ormawa..."
 className="rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm leading-relaxed resize-none" />
 <Button disabled={isSubmitting} onClick={handleTanggapi} className="w-full h-12 rounded-2xl bg-primary text-white font-black text-[10px] tracking-widest shadow-xl shadow-primary/20">
 {isSubmitting ? <span className="material-symbols-outlined size-4 animate-spin mr-2" >sync</span> : <span className="material-symbols-outlined size-4 mr-2" >check_circle</span>}
 Kirim Tanggapan
 </Button>
 </div>
 )}
 <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="w-full text-[10px] font-black tracking-widest text-slate-400 h-10 rounded-2xl">Tutup</Button>
 </div>
 </div>
 )}
 </DialogContent>
 </Dialog>
 </div>
 )
}

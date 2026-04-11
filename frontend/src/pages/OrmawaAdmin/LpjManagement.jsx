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
import { Eye, Pencil, Trash2, Loader2, Plus, Save, FileCheck, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'

import { fetchWithAuth } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = 'http://localhost:8000/api/ormawa'
const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

const STATUS_CFG = {
  draft:    { label: 'Draft',       cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-400/20' },
  diajukan: { label: 'Diajukan',    cls: 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/20' },
  disetujui:{ label: 'Disetujui',   cls: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20' },
  revisi:   { label: 'Butuh Revisi',cls: 'bg-amber-100 text-amber-700 ring-1 ring-amber-500/20' },
  ditolak:  { label: 'Ditolak',     cls: 'bg-rose-100 text-rose-700 ring-1 ring-rose-500/20' },
  selesai:  { label: 'Selesai',     cls: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-500/20' },
}

export default function LpjManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proposals, setProposals] = useState([])
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.OrmawaID || 1
  const [form, setForm] = useState({ Judul: '', RealisasiAnggaran: '', TotalAnggaran: '', Catatan: '', ProposalID: '', OrmawaID: ormawaId })

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await fetchWithAuth(`${API}/lpjs?ormawaId=${ormawaId}`)
      if (data.status === 'success') setData(data.data || [])
      else toast.error('Gagal memuat LPJ')
    } catch { toast.error('Koneksi gagal') } finally { setLoading(false) }
  }

  const fetchProposals = async () => {
    try {
      const data = await fetchWithAuth(`${API}/proposals?ormawaId=${ormawaId}`)
      if (data.status === 'success') setProposals(data.data || [])
    } catch {}
  }
  useEffect(() => { fetchData(); fetchProposals() }, [])

  const handleOpenAdd = () => { setIsEditMode(false); setForm({ Judul: '', RealisasiAnggaran: '', TotalAnggaran: '', Catatan: '', ProposalID: '', OrmawaID: ormawaId }); setIsCrudOpen(true) }
  const handleOpenEdit = (row) => { setIsEditMode(true); setForm({ ID: row.ID, Judul: row.Judul || '', RealisasiAnggaran: row.RealisasiAnggaran || '', TotalAnggaran: row.TotalAnggaran || '', Catatan: row.Catatan || '', ProposalID: String(row.ProposalID || ''), OrmawaID: ormawaId }); setIsCrudOpen(true) }
  const handleSave = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    const url = isEditMode ? `${API}/lpjs/${form.ID}` : `${API}/lpjs`
    const method = isEditMode ? 'PUT' : 'POST'
    const payload = { ...form, RealisasiAnggaran: Number(form.RealisasiAnggaran), TotalAnggaran: Number(form.TotalAnggaran), ProposalID: Number(form.ProposalID), OrmawaID: Number(form.OrmawaID) }
    try {
      const data = await fetchWithAuth(url, { method, body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
      if (data.status === 'success') { toast.success(isEditMode ? 'LPJ diperbarui' : 'LPJ diajukan'); setIsCrudOpen(false); fetchData() }
      else toast.error(data.message || 'Gagal menyimpan')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }
  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API}/lpjs/${selected?.ID}`, { method: 'DELETE' })
      if (data.status === 'success') { toast.success('LPJ dihapus'); setIsDelOpen(false); fetchData() }
      else toast.error('Gagal menghapus')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const columns = [
    {
      key: 'Judul', label: 'Nama Kegiatan', className: 'min-w-[280px]',
      render: (v, row) => (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-slate-900 text-[13px] font-headline tracking-tighter">{v || '—'}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{row.Proposal?.Judul || 'Laporan Pertanggungjawaban'}</span>
        </div>
      )
    },
    {
      key: 'TotalAnggaran', label: 'Anggaran', className: 'w-[160px]',
      render: v => <span className="font-black text-slate-600 text-[12px] font-headline">{formatRp(v)}</span>
    },
    {
      key: 'RealisasiAnggaran', label: 'Realisasi', className: 'w-[160px]',
      render: v => <span className="font-black text-emerald-600 text-[12px] font-headline">{formatRp(v)}</span>
    },
    {
      key: 'Status', label: 'Status', className: 'w-[160px] text-center', cellClassName: 'text-center',
      render: v => {
        const cfg = STATUS_CFG[v] || { label: v || 'Draft', cls: 'bg-slate-100 text-slate-600' }
        return <Badge className={cn('font-black text-[10px] px-3 py-1 border-none shadow-sm', cfg.cls)}>{cfg.label}</Badge>
      }
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
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><FileCheck className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Laporan & LPJ</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Laporan Pertanggungjawaban Kegiatan Ormawa</p>
            </div>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={data} loading={loading}
                searchPlaceholder="Cari judul laporan kegiatan..."
                onAdd={handleOpenAdd} addLabel="Buat LPJ"
                filters={[{ key: 'Status', placeholder: 'Filter Status', options: Object.entries(STATUS_CFG).map(([v, { label }]) => ({ label, value: v })) }]}
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

      {/* Detail */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl">
          {selected && (
            <div>
              <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">LPJ-{selected.ID}</p>
                      <h2 className="text-xl font-black text-white font-headline tracking-tighter">{selected.Judul}</h2>
                    </div>
                    <Badge className={cn('font-black text-[9px] px-3 py-1 border-none shrink-0', STATUS_CFG[selected.Status]?.cls || 'bg-slate-100 text-slate-600')}>
                      {STATUS_CFG[selected.Status]?.label || selected.Status || 'Draft'}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Anggaran</p><p className="text-sm font-black text-white font-headline">{formatRp(selected.TotalAnggaran)}</p></div>
                    <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Realisasi</p><p className="text-sm font-black text-emerald-400 font-headline">{formatRp(selected.RealisasiAnggaran)}</p></div>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-4">
                {selected.Catatan && (
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 font-headline">Catatan</p>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{selected.Catatan}</p>
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8 h-10 rounded-2xl">Tutup</Button>
                  <Button onClick={() => { setIsDetailOpen(false); handleOpenEdit(selected) }} className="text-[10px] font-black uppercase h-10 px-8 rounded-2xl bg-primary text-white">Edit LPJ</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CRUD */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><FileCheck className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                </div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">LPJ Registry</Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">{isEditMode ? 'Edit LPJ' : 'Buat Laporan Baru'}</DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">Dokumentasikan laporan pertanggungjawaban kegiatan.</DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-8 pt-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Pilih Proposal Kegiatan</Label>
              <select required value={form.ProposalID} onChange={e => setForm({ ...form, ProposalID: e.target.value })}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white transition-all">
                <option value="">-- Pilih Proposal --</option>
                {proposals.map(p => <option key={p.ID} value={p.ID}>{p.Judul} (Budget: {formatRp(p.Anggaran)})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Judul Laporan</Label>
              <Input required value={form.Judul} onChange={e => setForm({ ...form, Judul: e.target.value })} placeholder="Nama kegiatan yang dilaporkan..."
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Total Anggaran (Rp)</Label>
                <Input required type="number" value={form.TotalAnggaran} onChange={e => setForm({ ...form, TotalAnggaran: e.target.value })} placeholder="0"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Realisasi (Rp)</Label>
                <Input required type="number" value={form.RealisasiAnggaran} onChange={e => setForm({ ...form, RealisasiAnggaran: e.target.value })} placeholder="0"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Catatan & Evaluasi</Label>
              <Textarea required value={form.Catatan} onChange={e => setForm({ ...form, Catatan: e.target.value })} placeholder="Tuliskan evaluasi dan catatan kegiatan..."
                className="min-h-[100px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm leading-relaxed font-headline" />
            </div>
            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl">Batalkan</Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isEditMode ? 'Update Record' : 'Submit LPJ'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus LPJ?" description="Laporan pertanggungjawaban ini akan dihapus permanen." loading={isSubmitting} />
    </div>
  )
}

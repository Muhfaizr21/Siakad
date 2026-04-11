"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from './components/ui/data-table'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './components/ui/dialog'
import { DeleteConfirmModal } from './components/ui/DeleteConfirmModal'
import { Card, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Textarea } from './components/ui/textarea'
import { Eye, Pencil, Trash2, Loader2, Plus, Save, FileText, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'
import useAuthStore from '../../store/useAuthStore'
import { fetchWithAuth, API_BASE_URL } from '../../services/api'

const API = `${API_BASE_URL}/ormawa`

const STATUS_CONFIG = {
  diajukan:           { label: 'Diajukan',        cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-500/20',    icon: Clock },
  disetujui_dosen:    { label: 'ACC Dosen',        cls: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20', icon: CheckCircle2 },
  disetujui_fakultas: { label: 'ACC Fakultas',     cls: 'bg-violet-50 text-violet-700 ring-1 ring-violet-500/20', icon: CheckCircle2 },
  disetujui_univ:     { label: 'Disetujui Univ',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20', icon: CheckCircle2 },
  revisi:             { label: 'Butuh Revisi',     cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20', icon: AlertCircle },
  ditolak:            { label: 'Ditolak',          cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/20',   icon: XCircle },
  selesai:            { label: 'Selesai',          cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-400/20', icon: CheckCircle2 },
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-slate-100 text-slate-600', icon: FileText }
  return (
    <Badge className={cn('capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm', cfg.cls)}>
      {cfg.label}
    </Badge>
  )
}

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

export default function ProposalManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState([])
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [komentar, setKomentar] = useState('')
  const ormawaId = useAuthStore.getState()?.mahasiswa?.OrmawaID || useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.ID || 1
  const [formData, setFormData] = useState({ Judul: '', Catatan: '', TanggalKegiatan: '', Anggaran: '', OrmawaID: ormawaId })

  const fetchProposals = async () => {
    setLoading(true)
    try {
      const data = await fetchWithAuth(`${API}/proposals?ormawaId=${ormawaId}`)
      if (data.status === 'success') setProposals(data.data || [])
      else toast.error('Gagal memuat data proposal')
    } catch {
      toast.error('Koneksi ke server gagal')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async (proposalId) => {
    try {
      const data = await fetchWithAuth(`${API}/proposals/${proposalId}/history`)
      if (data.status === 'success') setHistory(data.data || [])
    } catch {}
  }

  useEffect(() => { fetchProposals() }, [])

  const handleOpenAdd = () => {
    setIsEditMode(false)
    setFormData({ Judul: '', Catatan: '', TanggalKegiatan: '', Anggaran: '', OrmawaID: ormawaId })
    setIsCrudOpen(true)
  }

  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setFormData({
      ID: row.ID,
      Judul: row.Judul || '',
      Catatan: row.Catatan || '',
      TanggalKegiatan: row.TanggalKegiatan ? row.TanggalKegiatan.split('T')[0] : '',
      Anggaran: row.Anggaran || '',
      OrmawaID: row.OrmawaID || ormawaId,
    })
    setIsCrudOpen(true)
  }

  const handleView = (row) => {
    setSelected(row)
    setHistory([])
    fetchHistory(row.ID)
    setIsDetailOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const url = isEditMode ? `${API}/proposals/${formData.ID}` : `${API}/proposals`
    const method = isEditMode ? 'PUT' : 'POST'
    const payload = { ...formData, Anggaran: Number(formData.Anggaran), OrmawaID: Number(formData.OrmawaID), TanggalKegiatan: formData.TanggalKegiatan ? new Date(formData.TanggalKegiatan).toISOString() : new Date().toISOString() }
    try {
      const data = await fetchWithAuth(url, { 
        method, 
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      })
      if (data.status === 'success') {
        toast.success(isEditMode ? 'Proposal diperbarui' : 'Proposal berhasil diajukan')
        setIsCrudOpen(false)
        fetchProposals()
      } else {
        toast.error(data.message || 'Gagal menyimpan proposal')
      }
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAction = async (status) => {
    if (!selected) return
    if ((status === 'revisi' || status === 'ditolak') && !komentar.trim()) {
      toast.error('Catatan/alasan wajib diisi untuk revisi atau penolakan')
      return
    }
    setIsSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API}/proposals/${selected.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: status, Catatan: komentar })
      })
      if (data.status === 'success') {
        toast.success('Status proposal diperbarui')
        setIsDetailOpen(false)
        setKomentar('')
        fetchProposals()
      } else {
        toast.error(data.message || 'Gagal memperbarui status')
      }
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selected?.ID) return
    setIsSubmitting(true)
    try {
      await fetchWithAuth(`${API}/proposals/${selected.ID}`, { method: 'DELETE' })
      toast.success('Proposal dihapus')
      setIsDelOpen(false)
      fetchProposals()
    } catch {
      toast.error('Gagal menghapus proposal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'ID',
      label: 'Kode Ref',
      className: 'w-[120px]',
      render: (val) => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">PROP-{val}</span>
    },
    {
      key: 'Judul',
      label: 'Kegiatan',
      className: 'min-w-[280px]',
      render: (val, row) => (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{val || '—'}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
            {row.TanggalKegiatan ? new Date(row.TanggalKegiatan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </span>
        </div>
      )
    },
    {
      key: 'Anggaran',
      label: 'Anggaran',
      className: 'w-[180px]',
      render: (val) => <span className="font-black text-emerald-600 text-[12px] font-headline">{formatRupiah(val)}</span>
    },
    {
      key: 'Status',
      label: 'Status',
      className: 'w-[170px] text-center',
      cellClassName: 'text-center',
      render: (val) => <StatusBadge status={val} />
    }
  ]

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="pt-20 px-4 lg:px-8 pb-12">
          <Toaster position="top-right" />

          {/* Page Header */}
          <div className="flex flex-col gap-1.5 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <FileText className="size-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Manajemen Proposal</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ajukan & Pantau Persetujuan: Dosen → Fakultas → Universitas</p>
            </div>
          </div>

          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns}
                data={proposals}
                loading={loading}
                searchPlaceholder="Cari judul atau kode proposal..."
                onAdd={handleOpenAdd}
                addLabel="Buat Proposal"
                filters={[
                  {
                    key: 'Status',
                    placeholder: 'Filter Status',
                    options: Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({ label, value }))
                  }
                ]}
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleView(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-xl">
                      <Eye className="size-4" />
                    </Button>
                    <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-600 hover:bg-amber-50 rounded-xl">
                      <Pencil className="size-4" />
                    </Button>
                    <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50 rounded-xl">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* DETAIL & REVIEW DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white h-[90dvh] md:max-h-[85vh] flex flex-col ">
          {selected && (
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Left: Detail */}
              <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-100">
                <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none pointer-events-none text-white">
                    <FileText className="size-32 rotate-12" />
                  </div>
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline mb-1">PROP-{selected.ID}</p>
                        <h2 className="text-lg font-black text-white font-headline tracking-tighter leading-tight line-clamp-2 uppercase">{selected.Judul}</h2>
                      </div>
                      <StatusBadge status={selected.Status} />
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Anggaran</p>
                        <p className="text-xs font-black text-emerald-400 font-headline">{formatRupiah(selected.Anggaran)}</p>
                      </div>
                      <div className="h-6 w-px bg-slate-700" />
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Tanggal</p>
                        <p className="text-xs font-black text-white font-headline">
                          {selected.TanggalKegiatan ? new Date(selected.TanggalKegiatan).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                  {/* Tujuan */}
                  {selected.Catatan && (
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 font-headline">Tujuan / Deskripsi</p>
                      <p className="text-[11px] font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{selected.Catatan}</p>
                    </div>
                  )}

                  {/* Alur Persetujuan */}
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 font-headline">Alur Persetujuan</p>
                    <div className="flex items-center gap-2">
                      {['disetujui_dosen', 'disetujui_fakultas', 'disetujui_univ'].map((s, i) => {
                        const active = (['disetujui_dosen', 'disetujui_fakultas', 'disetujui_univ', 'selesai'].indexOf(selected.Status) >= i)
                        return (
                          <React.Fragment key={s}>
                            <div className={cn('flex flex-col items-center gap-1', active ? '' : 'opacity-30')}>
                              <div className={cn('size-7 rounded-lg flex items-center justify-center', active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400')}>
                                <CheckCircle2 className="size-3.5" />
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 font-headline text-center leading-none">{['Dosen', 'Fakultas', 'Univ'][i]}</span>
                            </div>
                            {i < 2 && <div className={cn('flex-1 h-0.5 rounded-full', active ? 'bg-emerald-200' : 'bg-slate-100')} />}
                          </React.Fragment>
                        )
                      })}
                    </div>
                  </div>

                  {/* Histori */}
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 font-headline">Riwayat Status</p>
                    <div className="space-y-2 relative before:absolute before:left-5 before:top-4 before:bottom-0 before:w-px before:bg-slate-100">
                      {history.length === 0 && <p className="text-[10px] text-slate-400 font-bold pl-4 uppercase">Belum ada riwayat</p>}
                      {history.map((log) => (
                        <div key={log.ID} className="flex gap-4 relative z-10">
                          <div className="size-10 shrink-0 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                            <FileText className="size-4 text-primary" />
                          </div>
                          <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                              <StatusBadge status={log.Status} />
                              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">{new Date(log.CreatedAt).toLocaleString('id-ID')}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium leading-normal">{log.Catatan || 'Tanpa catatan'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Panel Aksi */}
              <div className="w-full md:w-[320px] shrink-0 flex flex-col p-6 gap-5 bg-slate-50/50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Panel Kendali Status</h3>
                <Textarea
                  rows={5}
                  placeholder="Berikan catatan atau feedback..."
                  className="rounded-xl border-slate-200 bg-white text-[11px] font-medium resize-none p-4 focus:ring-primary focus:border-primary transition-all shadow-inner"
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value)}
                />
                <div className="space-y-2">
                  {selected.Status === 'diajukan' && (
                    <Button disabled={isSubmitting} onClick={() => handleAction('disetujui_dosen')} className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest">
                      {isSubmitting ? <Loader2 className="size-3 animate-spin" /> : 'ACC TAHAP 1'}
                    </Button>
                  )}
                  {selected.Status === 'disetujui_dosen' && (
                    <Button disabled={isSubmitting} onClick={() => handleAction('disetujui_fakultas')} className="w-full h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] uppercase tracking-widest">
                      {isSubmitting ? <Loader2 className="size-3 animate-spin" /> : 'ACC TAHAP 2'}
                    </Button>
                  )}
                  {selected.Status === 'disetujui_fakultas' && (
                    <Button disabled={isSubmitting} onClick={() => handleAction('disetujui_univ')} className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest">
                      {isSubmitting ? <Loader2 className="size-3 animate-spin" /> : 'ACC FINAL (CAIR)'}
                    </Button>
                  )}
                  <Button onClick={() => handleAction('revisi')} variant="outline" className="w-full h-10 rounded-xl border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 font-black text-[10px] uppercase tracking-widest">
                    MINTA REVISI
                  </Button>
                  <Button onClick={() => handleAction('ditolak')} variant="outline" className="w-full h-10 rounded-xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-black text-[10px] uppercase tracking-widest">
                    TOLAK PERMANEN
                  </Button>
                </div>
                <div className="mt-auto pt-4">
                  <Button variant="ghost" onClick={() => { setIsDetailOpen(false); setKomentar('') }} className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 h-9 rounded-xl">
                    TUTUP PANEL
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CRUD MODAL */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl ">
          <DialogHeader className="p-4 md:p-8 pb-3 md:pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <FileText className="size-24 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-1 md:mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">
                  Proposal Registry
                </Badge>
              </div>
              <DialogTitle className="text-lg md:text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                {isEditMode ? 'Edit Proposal' : 'Buat Proposal Baru'}
              </DialogTitle>
              <DialogDescription className="text-[10px] md:text-xs font-medium text-slate-400 mt-1">
                Isi data kegiatan dan anggaran yang dibutuhkan untuk pengajuan.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-4 md:p-8 pt-3 md:pt-6 space-y-3 md:space-y-5 max-h-[60vh] md:max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            <div className="space-y-2">
              <Label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Judul / Nama Kegiatan</Label>
              <Input
                required
                value={formData.Judul}
                onChange={(e) => setFormData({ ...formData, Judul: e.target.value })}
                placeholder="Contoh: Pekan Olahraga Fakultas..."
                className="h-10 md:h-12 rounded-xl md:rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-xs md:text-sm font-headline"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Tanggal Kegiatan</Label>
                <Input
                  required
                  type="date"
                  value={formData.TanggalKegiatan}
                  onChange={(e) => setFormData({ ...formData, TanggalKegiatan: e.target.value })}
                  className="h-10 md:h-12 rounded-xl md:rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-xs md:text-sm font-headline"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Anggaran (Rp)</Label>
                <Input
                  required
                  type="number"
                  value={formData.Anggaran}
                  onChange={(e) => setFormData({ ...formData, Anggaran: e.target.value })}
                  placeholder="0"
                  className="h-10 md:h-12 rounded-xl md:rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-xs md:text-sm font-headline"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Tujuan / Deskripsi</Label>
              <Textarea
                required
                value={formData.Catatan}
                onChange={(e) => setFormData({ ...formData, Catatan: e.target.value })}
                placeholder="Deskripsikan tujuan dan manfaat kegiatan..."
                className="min-h-[80px] md:min-h-[100px] rounded-xl md:rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-3 md:p-4 font-medium text-xs md:text-sm leading-relaxed font-headline"
              />
            </div>

            <DialogFooter className="mt-4 pt-4 flex flex-col md:flex-row items-center justify-end gap-2 md:gap-3 border-t border-slate-100 - md:-mx-8 px-4 md:px-8 bg-slate-50/30 pb-4 md:pb-0">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="w-full md:w-auto text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-10 md:h-12 rounded-xl md:rounded-2xl font-headline">
                Batalkan
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-10 md:h-12 px-6 md:px-10 rounded-xl md:rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 font-headline">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] font-headline">
                  {isEditMode ? 'Update Record' : 'Create Record'}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Proposal?"
        description="Proposal dan seluruh riwayat persetujuannya akan dihapus permanen dari sistem."
        loading={isSubmitting}
      />
    </div>
  )
}

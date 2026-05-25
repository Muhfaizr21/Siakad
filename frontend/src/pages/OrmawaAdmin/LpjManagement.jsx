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

// Premium Rupiah Formatter
const formatRp = (n) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(n || 0)
}

const STATUS_CFG = {
  draft: { label: 'Draft', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
  diajukan: { label: 'Diajukan', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  disetujui: { label: 'Disetujui', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  revisi: { label: 'Butuh Revisi', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  ditolak: { label: 'Ditolak', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  selesai: { label: 'Selesai', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

export default function LpjManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proposals, setProposals] = useState([])
  
  const authState = useAuthStore((s) => s)
  const ormawaId = authState?.mahasiswa?.ormawaId || authState?.mahasiswa?.OrmawaID || authState?.user?.ormawaId || ''
  
  const [form, setForm] = useState({ 
    Judul: '', 
    RealisasiAnggaran: '', 
    TotalAnggaran: '', 
    Catatan: '', 
    ProposalID: '', 
    OrmawaID: ormawaId || '' 
  })

  const buildOrmawaQuery = () => (ormawaId ? `?ormawaId=${ormawaId}` : '')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetchWithAuth(`${API}/lpjs${buildOrmawaQuery()}`)
      if (res.status === 'success') {
        setData(res.data || [])
      } else {
        toast.error('Gagal memuat daftar LPJ')
      }
    } catch (err) {
      toast.error('Koneksi database backend gagal')
    } finally {
      setLoading(false)
    }
  }

  const fetchProposals = async () => {
    try {
      const res = await fetchWithAuth(`${API}/proposals${buildOrmawaQuery()}`)
      if (res.status === 'success') {
        setProposals(res.data || [])
      }
    } catch (err) {
      // Silent error
    }
  }

  useEffect(() => {
    fetchData()
    fetchProposals()
  }, [ormawaId])

  const handleOpenAdd = () => {
    setIsEditMode(false)
    setForm({ 
      Judul: '', 
      RealisasiAnggaran: '', 
      TotalAnggaran: '', 
      Catatan: '', 
      ProposalID: '', 
      OrmawaID: ormawaId || '' 
    })
    setIsCrudOpen(true)
  }

  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setForm({ 
      ID: row.ID, 
      Judul: row.Judul || '', 
      RealisasiAnggaran: row.RealisasiAnggaran || '', 
      TotalAnggaran: row.TotalAnggaran || '', 
      Catatan: row.Catatan || '', 
      ProposalID: String(row.ProposalID || ''), 
      OrmawaID: ormawaId || '' 
    })
    setIsCrudOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const url = isEditMode ? `${API}/lpjs/${form.ID}` : `${API}/lpjs`
    const method = isEditMode ? 'PUT' : 'POST'
    
    const payload = isEditMode
      ? { 
          Status: form.Status, 
          Catatan: form.Catatan, 
          RealisasiAnggaran: Number(form.RealisasiAnggaran), 
          TotalAnggaran: Number(form.TotalAnggaran) 
        }
      : { 
          ProposalID: Number(form.ProposalID), 
          Judul: form.Judul,
          Catatan: form.Catatan, 
          RealisasiAnggaran: Number(form.RealisasiAnggaran), 
          TotalAnggaran: Number(form.TotalAnggaran), 
          Status: 'draft' 
        }

    try {
      const res = await fetchWithAuth(url, { 
        method, 
        body: JSON.stringify(payload), 
        headers: { 'Content-Type': 'application/json' } 
      })
      if (res.status === 'success') {
        toast.success(isEditMode ? 'LPJ berhasil diperbarui!' : 'Laporan Pertanggungjawaban berhasil diajukan!')
        setIsCrudOpen(false)
        fetchData()
      } else {
        toast.error(res.message || 'Gagal menyimpan Laporan LPJ')
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi backend')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetchWithAuth(`${API}/lpjs/${selected?.ID}`, { 
        method: 'DELETE' 
      })
      if (res.status === 'success') {
        toast.success('LPJ berhasil dihapus dari sistem')
        setIsDelOpen(false)
        fetchData()
      } else {
        toast.error('Gagal menghapus Laporan LPJ')
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi backend')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-fill values based on proposal selection
  const handleProposalChange = (proposalId) => {
    const selectedProp = proposals.find(p => String(p.ID) === String(proposalId))
    if (selectedProp) {
      setForm(prev => ({
        ...prev,
        ProposalID: proposalId,
        Judul: `LPJ ${selectedProp.Judul}`,
        TotalAnggaran: selectedProp.Anggaran || '',
        RealisasiAnggaran: selectedProp.Anggaran || ''
      }))
    } else {
      setForm(prev => ({ ...prev, ProposalID: proposalId }))
    }
  }

  const columns = [
    {
      key: 'Judul', 
      label: 'Nama Kegiatan LPJ', 
      className: 'min-w-[280px]',
      render: (v, row) => (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-slate-900 text-[13px] font-headline tracking-tighter">{v || '—'}</span>
          <span className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5">
            {row.Proposal?.Judul || 'Laporan Pertanggungjawaban'}
          </span>
        </div>
      )
    },
    {
      key: 'TotalAnggaran', 
      label: 'Total Anggaran', 
      className: 'w-[160px]',
      render: v => <span className="font-bold text-slate-600 text-[12px] font-headline">{formatRp(v)}</span>
    },
    {
      key: 'RealisasiAnggaran', 
      label: 'Realisasi Anggaran', 
      className: 'w-[160px]',
      render: v => <span className="font-black text-emerald-600 text-[12px] font-headline">{formatRp(v)}</span>
    },
    {
      key: 'Status', 
      label: 'Status LPJ', 
      className: 'w-[150px] text-center', 
      cellClassName: 'text-center',
      render: v => {
        const cfg = STATUS_CFG[v] || { label: v || 'Draft', cls: 'bg-slate-50 text-slate-600 border-slate-200' }
        return (
          <Badge className={cn('font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 border rounded-full', cfg.cls)}>
            {cfg.label}
          </Badge>
        )
      }
    }
  ]

  // Calculated Stats
  const approvedLpjCount = data.filter(x => x.Status === 'disetujui' || x.Status === 'selesai').length
  const pendingLpjCount = data.filter(x => x.Status === 'diajukan' || x.Status === 'revisi').length
  const totalRealisasi = data.reduce((acc, curr) => acc + (curr.RealisasiAnggaran || 0), 0)

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
      <Toaster position="top-right" />
      
      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#00236F] to-[#1e3a8a] text-white p-8 md:p-10 shadow-xl shadow-blue-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-40 w-60 h-60 bg-blue-300/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase">Dokumen Pertanggungjawaban</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '32px' }}>task</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight font-headline">Laporan & LPJ</h1>
                <p className="text-blue-100/80 text-sm font-medium mt-1">Kelola pertanggungjawaban kegiatan, realisasi anggaran, dan evaluasi kepengurusan.</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleOpenAdd} 
            className="h-12 px-6 rounded-2xl bg-white hover:bg-white/95 text-[#00236F] hover:text-[#00236F] border-none font-bold text-xs tracking-wider shadow-lg shadow-blue-900/10 transition-all active:scale-95 shrink-0 w-full md:w-auto flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_task</span>
            <span>BUAT LPJ BARU</span>
          </Button>
        </div>
      </section>

      {/* ── Statistics Summary Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total LPJ */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-2xl bg-[#00236F]/5 flex items-center justify-center text-[#00236F]">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>assignment_turned_in</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Total Laporan LPJ</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight font-headline">{data.length}</p>
            </div>
          </CardContent>
        </Card>

        {/* Disetujui */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>check_circle</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">LPJ Disetujui</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight font-headline">{approvedLpjCount}</p>
            </div>
          </CardContent>
        </Card>

        {/* Butuh Review */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>pending_actions</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Diajukan & Revisi</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight font-headline">{pendingLpjCount}</p>
            </div>
          </CardContent>
        </Card>

        {/* Realisasi Keuangan */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>payments</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Total Realisasi Dana</p>
              <p className="text-xl font-black text-slate-900 tracking-tight font-headline">{formatRp(totalRealisasi)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── LPJ DataTable Container ─────────────────────────────────── */}
      <Card className="border border-slate-200/50 shadow-sm rounded-[2rem] overflow-hidden bg-white/70 backdrop-blur-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns} 
            data={data} 
            loading={loading}
            searchPlaceholder="Cari berdasarkan nama kegiatan atau proposal..."
            onAdd={handleOpenAdd} 
            addLabel="Buat LPJ"
            filters={[
              { 
                key: 'Status', 
                placeholder: 'Filter Status', 
                options: Object.entries(STATUS_CFG).map(([v, { label }]) => ({ label, value: v })) 
              }
            ]}
            actions={(row) => (
              <div className="flex items-center gap-1.5">
                <Button 
                  onClick={() => { setSelected(row); setIsDetailOpen(true) }} 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-[#00236F] hover:bg-blue-50 rounded-xl active:scale-95 transition-all"
                  title="Lihat Detail LPJ"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                </Button>
                <Button 
                  onClick={() => handleOpenEdit(row)} 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl active:scale-95 transition-all"
                  title="Edit Laporan"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
                </Button>
                <Button 
                  onClick={() => { setSelected(row); setIsDelOpen(true) }} 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl active:scale-95 transition-all"
                  title="Hapus LPJ"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* ── Detail View Dialog ──────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white animate-in zoom-in-95 duration-200">
          {selected && (
            <div>
              <div className="p-8 bg-gradient-to-r from-[#00236F] to-[#1e3a8a] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06)_0%,transparent_50%)]" />
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined size-24 text-white">description</span>
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-blue-200 tracking-[0.2em] uppercase font-headline">ID Laporan: LPJ-{selected.ID}</p>
                      <h2 className="text-xl font-black font-headline tracking-tighter leading-tight">{selected.Judul}</h2>
                    </div>
                    <Badge className={cn('font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 border shrink-0 rounded-full', STATUS_CFG[selected.Status]?.cls || 'bg-slate-50 text-slate-600 border-slate-200')}>
                      {STATUS_CFG[selected.Status]?.label || selected.Status || 'Draft'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-[9px] font-black text-blue-200 tracking-wider uppercase font-headline">Total Anggaran Proposal</p>
                      <p className="text-base font-black tracking-tight">{formatRp(selected.TotalAnggaran)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-blue-200 tracking-wider uppercase font-headline">Realisasi Pengeluaran LPJ</p>
                      <p className="text-base font-black text-emerald-300 tracking-tight">{formatRp(selected.RealisasiAnggaran)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                {selected.Catatan ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Catatan & Evaluasi Pengurus</p>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {selected.Catatan}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-slate-400 italic text-center py-6">Tidak ada catatan tambahan untuk laporan ini.</p>
                )}
                
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsDetailOpen(false)} 
                    className="text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl active:scale-95 transition-all"
                  >
                    TUTUP
                  </Button>
                  <Button 
                    onClick={() => { 
                      setIsDetailOpen(false)
                      handleOpenEdit(selected) 
                    }} 
                    className="text-[10px] font-black h-12 px-8 rounded-2xl bg-primary text-white hover:bg-primary/95 shadow-lg active:scale-95 transition-all border-none"
                  >
                    EDIT LAPORAN
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── CRUD Dialog Form ────────────────────────────────────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl animate-in zoom-in-95 duration-200">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined size-24 rotate-12 text-[#00236F]">description</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined stroke-[3px]" style={{ fontSize: '16px' }}>assignment_turned_in</span>
                </div>
                <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-[#00236F]/5 text-[#00236F] border-none rounded-md">LPJ REGISTRY</Badge>
              </div>
              <DialogTitle className="text-xl font-black font-headline tracking-tighter text-slate-900">
                {isEditMode ? 'Edit Laporan LPJ' : 'Buat Laporan LPJ Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-400 mt-1">
                Tautkan proposal, isi judul laporan, dan catat realisasi pengeluaran riil kegiatan.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-5">
            {/* Proposal Selection (only editable in creation mode) */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Tautkan Proposal Kegiatan</Label>
              {isEditMode ? (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-xs text-slate-500">
                  {proposals.find(p => String(p.ID) === String(form.ProposalID))?.Judul || 'Proposal Terpilih'}
                </div>
              ) : (
                <select 
                  required 
                  value={form.ProposalID} 
                  onChange={e => handleProposalChange(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-primary transition-all shadow-sm"
                >
                  <option value="">-- Pilih Proposal Acuan --</option>
                  {proposals.map(p => (
                    <option key={p.ID} value={p.ID}>
                      {p.Judul} (Pagu: {formatRp(p.Anggaran)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Judul Laporan */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Judul Laporan Pertanggungjawaban</Label>
              <Input 
                required 
                value={form.Judul} 
                onChange={e => setForm({ ...form, Judul: e.target.value })} 
                placeholder="Misal: LPJ Seminar Kepemimpinan Mahasiswa 2026..."
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm" 
              />
            </div>

            {/* Total Anggaran & Realisasi Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Total Anggaran Proposal</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                  <Input 
                    required 
                    type="number" 
                    value={form.TotalAnggaran} 
                    onChange={e => setForm({ ...form, TotalAnggaran: e.target.value })} 
                    placeholder="0"
                    className="h-12 pl-10 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm" 
                  />
                </div>
                {/* 🌟 Dynamic live points separator for budget */}
                {form.TotalAnggaran && (
                  <p className="text-[10px] font-bold text-slate-500 mt-1.5 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '13px' }}>payments</span>
                    Format: <span className="font-black tracking-tight">{formatRp(Number(form.TotalAnggaran))}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Realisasi Pengeluaran LPJ</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                  <Input 
                    required 
                    type="number" 
                    value={form.RealisasiAnggaran} 
                    onChange={e => setForm({ ...form, RealisasiAnggaran: e.target.value })} 
                    placeholder="0"
                    className="h-12 pl-10 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm" 
                  />
                </div>
                {/* 🌟 Dynamic live points separator for realisasi */}
                {form.RealisasiAnggaran && (
                  <p className="text-[10px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: '13px' }}>payments</span>
                    Format: <span className="font-black tracking-tight">{formatRp(Number(form.RealisasiAnggaran))}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Catatan & Evaluasi */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Catatan & Evaluasi Kegiatan</Label>
              <Textarea 
                required 
                value={form.Catatan} 
                onChange={e => setForm({ ...form, Catatan: e.target.value })} 
                placeholder="Tuliskan catatan pelaksanaan kegiatan, evaluasi panitia, dan ringkasan penggunaan anggaran..."
                className="min-h-[100px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-semibold text-xs leading-relaxed p-4" 
              />
            </div>

            {/* Dialog Footer Actions */}
            <DialogFooter className="mt-6 pt-6 flex flex-col md:flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30 pb-0">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsCrudOpen(false)} 
                className="w-full md:w-auto text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl active:scale-95 transition-all"
              >
                BATAL
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full md:w-auto h-12 px-8 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border-none"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin size-4" style={{ fontSize: '16px' }}>sync</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>
                )}
                <span className="text-[10px] font-black tracking-widest uppercase">
                  {isEditMode ? 'SIMPAN PERUBAHAN' : 'KIRIM LAPORAN'}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={isDelOpen} 
        onClose={() => setIsDelOpen(false)} 
        onConfirm={handleDelete}
        title="Hapus Laporan LPJ?" 
        description="Apakah Anda yakin ingin menghapus data Laporan Pertanggungjawaban ini? Tindakan ini bersifat permanen." 
        loading={isSubmitting} 
      />
    </div>
  )
}

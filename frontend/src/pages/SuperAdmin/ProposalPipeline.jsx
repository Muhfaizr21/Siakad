"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from './components/ui/data-table'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog'
import { Card, CardContent } from './components/ui/card'
import { Textarea } from './components/ui/textarea'
import { Label } from './components/ui/label'
import { Eye, Loader2, CheckCircle2, XCircle, FileText, Clock, Building2, Wallet, ShieldCheck, Filter, Search, AlertCircle } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'

const STATUS_CFG = {
  diajukan:           { label: 'DIAJUKAN',        cls: 'bg-slate-100 text-slate-700' },
  disetujui_fakultas: { label: 'ACC FAKULTAS',   cls: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-500/20' },
  disetujui_univ:     { label: 'DISYAHKAN',       cls: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20' },
  revisi:             { label: 'BUTUH REVISI',     cls: 'bg-amber-100 text-amber-700 ring-1 ring-amber-500/20' },
  ditolak:            { label: 'DITOLAK',          cls: 'bg-rose-100 text-rose-700 ring-1 ring-rose-500/20' },
}

const formatRp = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

export default function ProposalPipeline() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rejectNote, setRejectNote] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminService.getGlobalProposals()
      if (res.status === 'success') setData(res.data || [])
      else toast.error('Gagal memuat proposal global')
    } catch { toast.error('Gagal terhubung ke pusat data') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleApprove = async (id) => {
    if (!confirm('Sahkan proposal ini untuk pencairan dana?')) return
    setIsSubmitting(true)
    try {
      const res = await adminService.approveProposal(id)
      if (res.status === 'success') {
        toast.success('Proposal telah resmi disyahkan')
        fetchData()
        setIsDetailOpen(false)
      }
    } catch { toast.error('Gagal memproses pengesahan') } finally { setIsSubmitting(false) }
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    try {
      await adminService.rejectProposal(selected.ID, rejectNote)
      toast.success('Proposal ditolak dengan catatan'); 
      setIsRejectOpen(false); 
      setRejectNote(''); 
      setIsDetailOpen(false); 
      fetchData()
    } catch { toast.error('Gagal mengirim penolakan') } finally { setIsSubmitting(false) }
  }

  const pending = data.filter(p => p.Status === 'disetujui_fakultas').length

  const columns = [
    { key: 'ID', label: 'ID', className: 'w-[100px]', render: v => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">#PRP-{v}</span> },
    { key: 'Judul', label: 'Judul Proposal & Pengaju', className: 'min-w-[320px]',
      render: (v, row) => (
        <div className="flex flex-col gap-1">
          <span className="font-black text-slate-900 font-headline tracking-tighter text-sm uppercase group-hover:text-primary transition-colors">{v || '—'}</span>
          <div className="flex items-center gap-2">
            <Badge className="text-[8px] font-black bg-slate-100 text-slate-500 border-none">{row.Fakultas?.Nama || 'Institusi'}</Badge>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight">{row.Ormawa?.Nama || 'Organisasi'}</span>
          </div>
        </div>
      )
    },
    { key: 'Anggaran', label: 'Estimasi Anggaran', className: 'w-[180px]', render: v => <span className="font-black text-slate-700 text-[12px] font-headline">{formatRp(v)}</span> },
    { key: 'Status', label: 'Status Verifikasi', className: 'w-[160px] text-center', cellClassName: 'text-center',
      render: v => {
        const cfg = STATUS_CFG[v] || { label: v || '—', cls: 'bg-slate-100 text-slate-600' }
        return <Badge className={cn('font-black text-[9px] px-3 py-1 border-none shadow-sm', cfg.cls)}>{cfg.label}</Badge>
      }
    },
    { key: 'updated_at', label: 'Update Terakhir', className: 'w-[140px]', render: v => <span className="font-bold text-slate-400 text-[10px] font-black uppercase tracking-tighter">{v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '—'}</span> }
  ]

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-10">
      <Toaster position="top-right" />
          <header className="flex justify-between items-end">
             <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-xl text-white relative">
                        <FileText className="size-6" />
                        {pending > 0 && <span className="absolute -top-1.5 -right-1.5 size-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">{pending}</span>}
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter font-headline uppercase leading-none">Proposal Global Pipeline</h1>
                </div>
                <div className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                    <div className="h-1 w-10 bg-primary rounded-full" />
                    Monitoring & Pengesahan Akhir Anggaran Kegiatan Mahasiswa
                </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Menunggu Review</p>
                <div className="flex items-center justify-between">
                    <h3 className="text-4xl font-black text-slate-900 font-headline">{pending}</h3>
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Clock className="size-5" /></div>
                </div>
             </div>
             <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/10 space-y-2 col-span-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Wallet className="size-20 text-white" /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Proyeksi Anggaran</p>
                <h3 className="text-4xl font-black text-white font-headline tracking-tighter uppercase relative z-10">
                    {formatRp(data.filter(p => p.Status === 'disetujui_fakultas').reduce((acc, curr) => acc + (curr.Anggaran || 0), 0))}
                </h3>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-2">Dana Menunggu Verifikasi Univ</p>
             </div>
          </div>

          <Card className="border border-slate-100 shadow-sm rounded-[3rem] overflow-hidden bg-white">
            <CardContent className="p-0">
               <div className="p-8 bg-slate-50/30 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 size-4 stroke-[3px]" />
                        <input className="w-full bg-white border border-slate-200 pl-16 pr-8 py-4 rounded-2xl text-[13px] font-bold text-slate-900 outline-none focus:border-primary transition-all shadow-sm placeholder:text-slate-300 uppercase tracking-tight" placeholder="Cari ID, judul proposal atau ormawa..." />
                    </div>
                    <button onClick={fetchData} className="size-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                        <Loader2 className={cn("size-5", loading && "animate-spin")} />
                    </button>
               </div>
               <DataTable
                 columns={columns} data={data} loading={loading}
                 searchPlaceholder="Cari judul proposal atau ormawa..."
                 actions={(row) => (
                   <div className="flex items-center gap-2">
                     <Button onClick={() => { setSelected(row); setIsDetailOpen(true) }} variant="ghost" size="icon" className="h-10 w-10 hover:text-primary hover:bg-primary/10 rounded-2xl"><Eye className="size-5" /></Button>
                     {row.Status === 'disetujui_fakultas' && (
                       <div className="flex items-center gap-1">
                         <div className="h-4 w-[1px] bg-slate-100 mx-2" />
                         <Button onClick={() => handleApprove(row.ID)} disabled={isSubmitting} variant="ghost" size="icon" className="h-10 w-10 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl shadow-sm"><CheckCircle2 className="size-5" /></Button>
                         <Button onClick={() => { setSelected(row); setIsRejectOpen(true) }} variant="ghost" size="icon" className="h-10 w-10 hover:text-rose-600 hover:bg-rose-50 rounded-2xl"><XCircle className="size-5" /></Button>
                       </div>
                     )}
                   </div>
                 )}
               />
            </CardContent>
          </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white">
          <DialogTitle className="sr-only">Detail Proposal</DialogTitle>
          <DialogDescription className="sr-only">Rincian lengkap proposal kegiatan mahasiswa.</DialogDescription>
          {selected && (
            <div className="flex flex-col">
              <div className="p-10 bg-slate-900 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
                <div className="absolute top-0 right-0 p-10 opacity-10"><ShieldCheck className="size-40 text-white" /></div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="font-black text-[9px] px-3 py-1 bg-white/20 text-white border-none uppercase tracking-widest backdrop-blur-md">PRP-{selected.ID}</Badge>
                    <div className="h-5 w-[1px] bg-white/10" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{selected.Fakultas?.Nama || 'Institusi'}</span>
                  </div>
                  <h2 className="text-3xl font-black text-white font-headline tracking-tighter leading-tight uppercase max-w-2xl">{selected.Judul}</h2>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                    <Building2 className="size-4" />
                    {selected.Ormawa?.Nama || 'Organisasi Pengaju'}
                  </div>
                </div>
              </div>
              
              <div className="p-10 space-y-8 overflow-y-auto max-h-[60vh]">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">Total Anggaran</p>
                        <p className="text-2xl font-black text-emerald-600 font-headline">{formatRp(selected.Anggaran)}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">Status Pipeline</p>
                        <Badge className={cn('font-black text-[10px] px-3 py-1.5 border-none shadow-sm h-fit', STATUS_CFG[selected.Status]?.cls)}>
                            {STATUS_CFG[selected.Status]?.label || selected.Status}
                        </Badge>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Abstrak & Urgensi Kegiatan</Label>
                    <div className="text-sm text-slate-600 leading-relaxed bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative italic">
                        <div className="absolute top-4 left-4 text-slate-100"><FileText className="size-12" /></div>
                        <span className="relative z-10">"{selected.Deskripsi || 'Tidak ada deskripsi rincian proposal.'}"</span>
                    </div>
                 </div>

                 {selected.Catatan && (
                    <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2rem] space-y-2">
                        <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest font-headline flex items-center gap-2">
                            <div className="h-0.5 w-6 bg-rose-500 rounded-full" />
                            Dana Perlu Verifikasi Proposal
                        </div>
                        <div className="text-sm text-rose-700 font-medium">{selected.Catatan}</div>
                    </div>
                 )}
              </div>

              <div className="p-8 border-t border-slate-50 flex justify-end gap-3 bg-slate-50/50">
                <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-10 h-12 rounded-2xl">Tutup</Button>
                {selected.Status === 'disetujui_fakultas' && (
                  <>
                    <Button onClick={() => setIsRejectOpen(true)} className="h-12 px-8 rounded-2xl bg-white text-rose-500 border border-rose-100 font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-rose-50 transition-all">Kembalikan / Tolak</Button>
                    <Button onClick={() => handleApprove(selected.ID)} disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20 group">
                      {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <ShieldCheck className="size-4 mr-2 group-hover:scale-110 transition-transform" />} Sahkan Proposal
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white">
          <DialogHeader className="p-10 pb-6 bg-gradient-to-br from-rose-50 to-white border-b border-rose-100 relative overflow-hidden">
            <div className="size-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-4"><XCircle className="size-6" /></div>
            <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">Verifikasi Tolak</DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">Berikan alasan formal penangguhan dana.</DialogDescription>
          </DialogHeader>
          <div className="p-10 pt-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Justifikasi Penolakan</Label>
              <Textarea required value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Misal: Anggaran tidak realistis atau dokumen tidak lengkap..."
                className="min-h-[140px] rounded-[2rem] border-slate-200 bg-slate-50/50 focus:bg-white p-6 font-medium text-sm leading-relaxed" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsRejectOpen(false)} className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">Batalkan</Button>
              <Button onClick={handleReject} disabled={isSubmitting || !rejectNote.trim()} className="flex-1 h-14 rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20">
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Konfirmasi Tolak'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from './components/ui/data-table'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog'
import { Card, CardContent } from './components/ui/card'
import { Textarea } from './components/ui/textarea'
import { Label } from './components/ui/label'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Wallet = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>account_balance_wallet</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Building2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>business</span>;



const STATUS_CFG = {
  diajukan:           { label: 'DIAJUKAN',        cls: 'bg-neutral-50 text-neutral-500 border-neutral-100' },
  disetujui_fakultas: { label: 'ACC FAKULTAS',   cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  disetujui_univ:     { label: 'DISYAHKAN',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  revisi:             { label: 'BUTUH REVISI',     cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  ditolak:            { label: 'DITOLAK',          cls: 'bg-rose-50 text-rose-700 border-rose-100' },
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
      await adminService.rejectProposal(selected.id || selected.ID, rejectNote)
      toast.success('Proposal ditolak dengan catatan')
      setIsRejectOpen(false)
      setRejectNote('')
      setIsDetailOpen(false)
      fetchData()
    } catch { toast.error('Gagal mengirim penolakan') } finally { setIsSubmitting(false) }
  }

  const pending = data.filter(p => p.Status === 'disetujui_fakultas').length
  const totalBudget = data.filter(p => p.Status === 'disetujui_fakultas').reduce((acc, curr) => acc + (curr.Anggaran || 0), 0)

  const columns = [
    { 
      key: 'ID', 
      label: 'ID Track', 
      className: 'w-[140px]', 
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-primary/40 animate-pulse" />
          <span className="font-bold text-neutral-400 font-jakarta uppercase text-[10px] tracking-widest">#PRP-{row.id || row.ID || v}</span>
        </div>
      )
    },
    { 
      key: 'Judul', 
      label: 'Judul Proposal & Pengaju', 
      className: 'w-[400px]',
      render: (v, row) => (
        <div className="flex flex-col gap-1.5 py-3 group/title">
          <span className="font-bold text-slate-800 font-headline tracking-tight text-[14px] leading-snug uppercase group-hover/title:text-bku-primary transition-colors line-clamp-2">{v || '—'}</span>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-bku-primary/10 px-2 py-0.5 rounded-md border-none shadow-none">
               <Building2 size={10} className="text-bku-primary" />
               <span className="text-[9px] font-black text-bku-primary uppercase tracking-wider font-headline">{row.Ormawa?.Nama || 'Unit Mahasiswa'}</span>
            </div>
            <div className="size-1 rounded-full bg-slate-300" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{row.Fakultas?.Nama || 'Institusi'}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'Anggaran', 
      label: 'Estimasi Dana', 
      className: 'w-[200px]', 
      render: v => (
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 font-headline">Budget IDR</span>
          <span className="font-black text-slate-800 text-[14px] font-headline tabular-nums tracking-tight">{formatRp(v)}</span>
        </div>
      )
    },
    { 
      key: 'Status', 
      label: 'Alur Verifikasi', 
      className: 'w-[180px] text-center', 
      cellClassName: 'text-center',
      render: v => {
        const cfg = STATUS_CFG[v] || { label: v || '—', cls: 'bg-slate-100 text-slate-600' }
        return (
          <div className="flex flex-col items-center gap-1">
            <Badge className={cn('px-3 py-1 rounded-lg border-none text-[9px] font-black uppercase tracking-widest shadow-none font-headline', cfg.cls)}>
              {cfg.label}
            </Badge>
          </div>
        )
      }
    }
  ]

  return (
    <div className="px-1 py-4 md:px-2 xl:px-4 min-h-screen bg-transparent font-inter">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-8 select-none">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="glass-card rounded-2xl border border-slate-200/60 p-6 md:p-8 relative overflow-hidden shadow-none">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-bku-primary/10 to-transparent pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 text-bku-primary/5 rotate-12 pointer-events-none"><Wallet size={280} /></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-bku-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(0,102,255,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-headline leading-none">Financial Intelligence</span>
              </div>
              <h1 className="text-2xl font-black font-headline tracking-tight leading-none" style={{ color: 'var(--theme-h1)' }}>
                Proposal <span className="text-bku-primary italic">Global</span>
              </h1>
              <p className="text-slate-400 font-medium text-[11px] max-w-2xl leading-relaxed">
                Pusat pengawasan dan pengesahan akhir anggaran kegiatan mahasiswa yang telah diverifikasi di tingkat fakultas.
              </p>
            </div>
            
            <div className="flex items-center gap-6 bg-white/40 p-4 md:p-6 rounded-2xl border border-slate-200/60 shadow-none">
               <div className="flex flex-col text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-headline">Queue Priority</span>
                  <span className="text-3xl font-black text-slate-800 font-headline tracking-tighter tabular-nums leading-none">{pending} <span className="text-[10px] font-bold text-bku-primary uppercase tracking-widest ml-1">Items</span></span>
               </div>
               <div className="size-14 rounded-2xl bg-slate-800 flex items-center justify-center text-white shadow-none border-none">
                  <span className="material-symbols-outlined animate-pulse" style={{ fontSize: '28px' }}  strokeWidth={2.5}>show_chart</span>
               </div>
            </div>
          </div>
        </section>

        {/* ── Stats Summary ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="glass-card p-6 rounded-2xl border border-slate-200/60 shadow-none flex items-center justify-between group hover:border-bku-primary/20 transition-all">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Menunggu Review</p>
                 <h3 className="text-2xl font-black font-headline" style={{ color: 'var(--theme-h3)' }}>{pending}</h3>
              </div>
              <div className="p-3 bg-slate-100/50 rounded-xl text-slate-500 group-hover:bg-bku-primary/10 group-hover:text-bku-primary transition-all">
                 <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >schedule</span>
              </div>
           </div>
           
           <div className="glass-card p-6 rounded-2xl border-slate-200/60 text-slate-800 shadow-none flex items-center justify-between col-span-1 md:col-span-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-bku-primary/5 -skew-x-12 translate-x-16 pointer-events-none" />
              <div className="space-y-1 relative z-10">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Total Proyeksi Anggaran Antrian</p>
                 <h3 className="text-3xl font-black font-headline tracking-tighter uppercase leading-none" style={{ color: 'var(--theme-h3)' }}>
                    {formatRp(totalBudget)}
                 </h3>
                 <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined" style={{ fontSize: '10px' }} >trending_up</span> Validasi Universitas Diperlukan
                 </p>
              </div>
              <div className="p-4 bg-bku-primary/10 rounded-xl text-bku-primary relative z-10 shadow-none group-hover:scale-110 transition-transform">
                 <Wallet size={28} />
              </div>
           </div>
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns} 
              data={data} 
              loading={loading}
              searchPlaceholder="Cari judul proposal, ormawa, atau ID..."
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => { setSelected(row); setIsDetailOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-bku-primary hover:bg-bku-primary/10 rounded-lg transition-colors cursor-pointer shadow-none"><span className="material-symbols-outlined" style={{ fontSize: '18px' }} >visibility</span></Button>
                  {row.Status === 'disetujui_fakultas' && (
                    <>
                       <div className="h-4 w-px bg-slate-200/40 mx-1" />
                       <Button onClick={() => handleApprove(row.id || row.ID)} disabled={isSubmitting} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >check_circle</span></Button>
                       <Button onClick={() => { setSelected(row); setIsRejectOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} Circle >close</span></Button>
                    </>
                  )}
                </div>
              )}
            />
          </CardContent>
        </Card>

      </div>

      {/* ── Detail Dialog ─────────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl glass-card bg-white/95">
          {selected && (
            <div className="flex flex-col">
              <div className="p-10 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-bku-primary/30 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="font-black font-headline text-[10px] px-3 py-1 bg-white/10 text-white border-none shadow-none uppercase tracking-widest">#PRP-{selected.id || selected.ID}</Badge>
                    <div className="size-1 rounded-full bg-white/20" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{selected.Fakultas?.Nama || 'Institusi'}</span>
                  </div>
                  <h2 className="text-3xl font-black font-headline tracking-tight leading-tight uppercase max-w-2xl" style={{ color: 'var(--theme-h2)' }}>{selected.Judul}</h2>
                  <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-widest">
                    <Building2 size={14} className="text-bku-primary" />
                    {selected.Ormawa?.Nama || 'Unit Mahasiswa Pengaju'}
                  </div>
                </div>
                <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-white/5 rotate-12 pointer-events-none" style={{ fontSize: '120px' }} Check >security</span>
              </div>
              
              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card bg-white/50 p-5 rounded-2xl border border-slate-200/60 shadow-none space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Proyeksi Anggaran</p>
                        <p className="text-2xl font-black text-slate-800 font-headline tabular-nums">{formatRp(selected.Anggaran)}</p>
                    </div>
                    <div className="glass-card bg-white/50 p-5 rounded-2xl border border-slate-200/60 shadow-none space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Status Validasi</p>
                        <Badge className={cn('px-3 py-1 rounded-lg border-none shadow-none text-[9px] font-black uppercase tracking-widest font-headline', STATUS_CFG[selected.Status]?.cls)}>
                            {STATUS_CFG[selected.Status]?.label || selected.Status}
                        </Badge>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }} >description</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Ringkasan Kegiatan</span>
                    </div>
                    <div className="text-sm font-medium text-slate-600 leading-relaxed font-inter bg-slate-50/50 p-6 rounded-2xl border border-slate-200/40 italic">
                        "{selected.Deskripsi || 'Tidak ada rincian deskripsi tambahan untuk proposal ini.'}"
                    </div>
                 </div>

                 {selected.Catatan && (
                    <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl space-y-3">
                        <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest font-headline flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >error</span> Sinkronisasi Ulang Diperlukan
                        </div>
                        <div className="text-sm font-medium text-rose-700 leading-relaxed font-inter">{selected.Catatan}</div>
                    </div>
                 )}

                 <div className="pt-8 border-t border-slate-200/40 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 font-headline shadow-none cursor-pointer border-slate-200 hover:bg-slate-100">Tutup</Button>
                    {selected.Status === 'disetujui_fakultas' && (
                      <>
                        <Button onClick={() => setIsRejectOpen(true)} className="h-11 px-6 rounded-xl bg-white text-rose-500 border border-rose-200 font-black font-headline text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all shadow-none cursor-pointer">Kembalikan</Button>
                        <Button onClick={() => handleApprove(selected.id || selected.ID)} disabled={isSubmitting} className="h-11 px-8 rounded-xl bg-slate-800 text-white font-black font-headline text-[10px] uppercase tracking-widest hover:bg-slate-900 shadow-none transition-all active:scale-95 group cursor-pointer border-none">
                          {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} Check >security</span>} Sahkan Proposal
                        </Button>
                      </>
                    )}
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Reject Reason Dialog ──────────────────────────────────── */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl glass-card bg-white/95">
          <DialogHeader className="p-8 pb-6 border-b border-slate-200/40 relative overflow-hidden">
            <div className="size-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4 border border-rose-100 shadow-none"><span className="material-symbols-outlined" style={{ fontSize: '24px' }} Circle >close</span></div>
            <DialogTitle className="text-2xl font-black font-headline tracking-tight text-slate-800 uppercase">Tolak Proposal</DialogTitle>
            <DialogDescription className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-widest">Berikan alasan formal penangguhan anggaran.</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-500 font-headline uppercase tracking-widest ml-1">Justifikasi Penolakan</Label>
              <Textarea required value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Tuliskan alasan penolakan atau instruksi revisi..."
                className="min-h-[120px] rounded-2xl border-slate-200 bg-white/60 focus:bg-white focus:ring-bku-primary/20 p-4 font-medium text-sm font-inter transition-all" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsRejectOpen(false)} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 font-headline shadow-none border-slate-200 hover:bg-slate-100 cursor-pointer">Batal</Button>
              <Button onClick={handleReject} disabled={isSubmitting || !rejectNote.trim()} className="flex-1 h-12 rounded-xl bg-rose-600 text-white font-black font-headline text-[10px] uppercase tracking-widest shadow-none hover:bg-rose-700 transition-all active:scale-95 border-none cursor-pointer">
                {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : 'Konfirmasi Tolak'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

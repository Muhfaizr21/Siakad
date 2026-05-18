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
      await adminService.rejectProposal(selected.ID, rejectNote)
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
      render: v => (
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-primary/40 animate-pulse" />
          <span className="font-bold text-neutral-400 font-jakarta uppercase text-[10px] tracking-widest">#PRP-{v}</span>
        </div>
      )
    },
    { 
      key: 'Judul', 
      label: 'Judul Proposal & Pengaju', 
      className: 'w-[400px]',
      render: (v, row) => (
        <div className="flex flex-col gap-1.5 py-3 group/title">
          <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px] leading-snug uppercase group-hover/title:text-primary transition-colors line-clamp-2">{v || '—'}</span>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
               <Building2 size={10} className="text-primary" />
               <span className="text-[9px] font-black text-primary uppercase tracking-wider">{row.Ormawa?.Nama || 'Unit Mahasiswa'}</span>
            </div>
            <div className="size-1 rounded-full bg-neutral-200" />
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">{row.Fakultas?.Nama || 'Institusi'}</span>
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
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Budget IDR</span>
          <span className="font-black text-neutral-900 text-[14px] font-jakarta tabular-nums tracking-tight">{formatRp(v)}</span>
        </div>
      )
    },
    { 
      key: 'Status', 
      label: 'Alur Verifikasi', 
      className: 'w-[180px] text-center', 
      cellClassName: 'text-center',
      render: v => {
        const cfg = STATUS_CFG[v] || { label: v || '—', cls: 'bg-neutral-50 text-neutral-500 border-neutral-100' }
        return (
          <div className="flex flex-col items-center gap-1">
            <Badge className={cn('px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest shadow-none', cfg.cls)}>
              {cfg.label}
            </Badge>
          </div>
        )
      }
    }
  ]

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-50/80 to-transparent pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 text-indigo-500/5 rotate-12 pointer-events-none"><Wallet size={280} /></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-5 w-2 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200" />
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400 font-jakarta">Financial Intelligence</span>
              </div>
              <h1 className="text-4xl font-extrabold text-neutral-900 font-jakarta tracking-tight leading-none">
                Proposal <span className="text-indigo-600 italic">Global</span>
              </h1>
              <p className="text-neutral-500 font-medium text-[15px] max-w-2xl leading-relaxed">
                Pusat pengawasan dan pengesahan akhir anggaran kegiatan mahasiswa yang telah diverifikasi di tingkat fakultas.
              </p>
            </div>
            
            <div className="flex items-center gap-6 bg-neutral-50 p-6 rounded-2xl border border-neutral-100 shadow-inner">
               <div className="flex flex-col text-right">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Queue Priority</span>
                  <span className="text-3xl font-black text-neutral-900 font-jakarta tracking-tighter tabular-nums leading-none">{pending} <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest ml-1">Items</span></span>
               </div>
               <div className="size-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200 border-2 border-white">
                  <span className="material-symbols-outlined animate-pulse" style={{ fontSize: '28px' }}  strokeWidth={2.5}>show_chart</span>
               </div>
            </div>
          </div>
        </section>

        {/* ── Stats Summary ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Menunggu Review</p>
                 <h3 className="text-2xl font-bold text-neutral-900 font-jakarta">{pending}</h3>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg text-neutral-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                 <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >schedule</span>
              </div>
           </div>
           
           <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-xl flex items-center justify-between col-span-1 md:col-span-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-full bg-white/[0.02] -skew-x-12 translate-x-16 pointer-events-none" />
              <div className="space-y-1 relative z-10">
                 <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Total Proyeksi Anggaran Antrian</p>
                 <h3 className="text-3xl font-bold text-white font-jakarta tracking-tighter uppercase leading-none">
                    {formatRp(totalBudget)}
                 </h3>
                 <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined" style={{ fontSize: '10px' }} >trending_up</span> Validasi Universitas Diperlukan
                 </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl text-white/20 relative z-10 border border-white/5 group-hover:scale-110 transition-transform">
                 <Wallet size={28} />
              </div>
           </div>
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns} 
              data={data} 
              loading={loading}
              searchPlaceholder="Cari judul proposal, ormawa, atau ID..."
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => { setSelected(row); setIsDetailOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '18px' }} >visibility</span></Button>
                  {row.Status === 'disetujui_fakultas' && (
                    <>
                       <div className="h-4 w-px bg-neutral-100 mx-1" />
                       <Button onClick={() => handleApprove(row.ID)} disabled={isSubmitting} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >check_circle</span></Button>
                       <Button onClick={() => { setSelected(row); setIsRejectOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} Circle >close</span></Button>
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
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          {selected && (
            <div className="flex flex-col">
              <div className="p-10 bg-neutral-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="font-bold text-[10px] px-3 py-1 bg-white/10 text-white border-white/10 uppercase tracking-widest">#PRP-{selected.ID}</Badge>
                    <div className="size-1 rounded-full bg-white/20" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{selected.Fakultas?.Nama || 'Institusi'}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white font-jakarta tracking-tight leading-tight uppercase max-w-2xl">{selected.Judul}</h2>
                  <div className="flex items-center gap-2 text-neutral-400 font-bold text-[11px] uppercase tracking-widest">
                    <Building2 size={14} className="text-primary" />
                    {selected.Ormawa?.Nama || 'Unit Mahasiswa Pengaju'}
                  </div>
                </div>
                <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-white/5 rotate-12 pointer-events-none" style={{ fontSize: '120px' }} Check >security</span>
              </div>
              
              <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-100 space-y-2">
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-jakarta">Proyeksi Anggaran</p>
                        <p className="text-2xl font-bold text-neutral-900 font-jakarta">{formatRp(selected.Anggaran)}</p>
                    </div>
                    <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-100 space-y-2">
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-jakarta">Status Validasi</p>
                        <Badge className={cn('px-3 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest', STATUS_CFG[selected.Status]?.cls)}>
                            {STATUS_CFG[selected.Status]?.label || selected.Status}
                        </Badge>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }} >description</span>
                       <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-jakarta">Ringkasan Kegiatan</span>
                    </div>
                    <div className="text-sm font-medium text-neutral-600 leading-relaxed font-inter bg-neutral-50 p-6 rounded-xl border border-neutral-100 italic">
                        "{selected.Deskripsi || 'Tidak ada rincian deskripsi tambahan untuk proposal ini.'}"
                    </div>
                 </div>

                 {selected.Catatan && (
                    <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-xl space-y-3">
                        <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest font-jakarta flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >error</span> Sinkronisasi Ulang Diperlukan
                        </div>
                        <div className="text-sm font-medium text-rose-700 leading-relaxed font-inter">{selected.Catatan}</div>
                    </div>
                 )}

                 <div className="pt-8 border-t border-neutral-100 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="h-11 px-8 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-400">Tutup</Button>
                    {selected.Status === 'disetujui_fakultas' && (
                      <>
                        <Button onClick={() => setIsRejectOpen(true)} className="h-11 px-6 rounded-xl bg-white text-rose-500 border border-rose-200 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 transition-all">Kembalikan</Button>
                        <Button onClick={() => handleApprove(selected.ID)} disabled={isSubmitting} className="h-11 px-8 rounded-xl bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary shadow-xl shadow-primary/20 transition-all active:scale-95 group">
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
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          <DialogHeader className="p-8 pb-6 border-b border-neutral-100 relative overflow-hidden">
            <div className="size-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4 border border-rose-100"><span className="material-symbols-outlined" style={{ fontSize: '24px' }} Circle >close</span></div>
            <DialogTitle className="text-2xl font-bold font-jakarta tracking-tight text-neutral-900 uppercase">Tolak Proposal</DialogTitle>
            <DialogDescription className="text-xs font-medium text-neutral-400 mt-1 uppercase tracking-widest">Berikan alasan formal penangguhan anggaran.</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Justifikasi Penolakan</Label>
              <Textarea required value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Tuliskan alasan penolakan atau instruksi revisi..."
                className="min-h-[120px] rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white p-4 font-medium text-sm font-jakarta transition-all" />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setIsRejectOpen(false)} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-400">Batal</Button>
              <Button onClick={handleReject} disabled={isSubmitting || !rejectNote.trim()} className="flex-1 h-12 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-widest shadow-md hover:bg-rose-700 transition-all active:scale-95">
                {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : 'Konfirmasi Tolak'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

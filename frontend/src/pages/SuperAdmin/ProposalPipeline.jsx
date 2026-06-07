"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { Card, CardContent } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { PageContent, PageCard } from '@/components/ui/page'
import { DashboardHero, DashboardStatGrid, DashboardStatCard } from '@/components/ui/dashboard'

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
  const [tenggatHari, setTenggatHari] = useState(14)


  const handleApprove = async (id) => {
    setIsSubmitting(true)
    try {
      const res = await adminService.approveProposal(id, { tenggat_hari: Number(tenggatHari) || 14 })
      if (res.status === 'success') {
        toast.success('Proposal telah resmi disyahkan')
        fetchData()
        setIsDetailOpen(false)
      }
    } catch { toast.error('Gagal memproses pengesahan') } finally { setIsSubmitting(false) }
  }
  useEffect(() => { fetchData() }, [])

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

  // ── Chart data derived from live data ─────────────────────────────
  const statusChartData = useMemo(() => {
    const cfg = {
      diajukan: { label: 'Diajukan', color: '#94a3b8' },
      disetujui_fakultas: { label: 'Acc Fakultas', color: '#3b82f6' },
      disetujui_univ: { label: 'Disyahkan', color: '#10b981' },
      revisi: { label: 'Revisi', color: '#f59e0b' },
      ditolak: { label: 'Ditolak', color: '#ef4444' },
    }
    const counts = {}
    data.forEach(p => { const s = p.Status || 'diajukan'; counts[s] = (counts[s] || 0) + 1 })
    return Object.entries(counts).map(([key, value]) => ({
      name: cfg[key]?.label || key,
      value,
      color: cfg[key]?.color || '#94a3b8'
    }))
  }, [data])

  const budgetByOrmawa = useMemo(() => {
    const map = {}
    data.forEach(p => {
      const name = (p.Ormawa?.Nama || 'Lainnya').substring(0, 16)
      map[name] = (map[name] || 0) + (p.Anggaran || 0)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [data])

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
    <PageContent>
      <Toaster position="top-right" />
      
        {/* ── Page Header ─────────────────────────────────────────── */}
        <DashboardHero
          title="Proposal"
          highlightedTitle="Global"
          subtitle="Pusat pengawasan dan pengesahan akhir anggaran kegiatan mahasiswa yang telah diverifikasi di tingkat fakultas."
          icon="account_balance_wallet"
          badges={[
            { label: 'Financial Intelligence', active: true }
          ]}
          actions={
            <div className="flex items-center gap-6 bg-white/40 p-4 md:p-6 rounded-2xl border border-slate-200/60 shadow-none">
               <div className="flex flex-col text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-headline">Queue Priority</span>
                  <span className="text-3xl font-black text-slate-800 font-headline tracking-tighter tabular-nums leading-none">{pending} <span className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Items</span></span>
               </div>
               <div className="size-14 rounded-2xl bg-slate-800 flex items-center justify-center text-white shadow-none border-none">
                  <span className="material-symbols-outlined animate-pulse" style={{ fontSize: '28px' }}  strokeWidth={2.5}>show_chart</span>
               </div>
            </div>
          }
        />

        {/* ── Stats Summary ────────────────────────────────────────── */}
        <DashboardStatGrid>
          <DashboardStatCard
            title="Menunggu Review"
            value={pending}
            icon="schedule"
            iconColor="text-primary"
            iconBg="bg-primary/10"
            subtitle="Proposal masuk"
          />

          <DashboardStatCard
            title="Total Proyeksi Anggaran Antrian"
            value={formatRp(totalBudget)}
            icon="account_balance_wallet"
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            subtitle="Validasi Universitas Diperlukan"
            className="md:col-span-2"
          />
        </DashboardStatGrid>

        {/* ── Analytics Charts ─────────────────────────────────────── */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut – Status Pipeline */}
            <div className="glass-card rounded-2xl border border-slate-200/60 p-6 shadow-none">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-bku-primary/10 rounded-xl flex items-center justify-center text-bku-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>donut_large</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Pipeline Status</p>
                  <p className="text-sm font-black text-slate-800 font-headline">Distribusi Alur Proposal</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                        {statusChartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '11px', fontWeight: '700' }} formatter={(val, name) => [val + ' proposal', name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {statusChartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-[11px] font-bold text-slate-600 flex-1">{d.name}</span>
                      <span className="text-[11px] font-black text-slate-800 tabular-nums">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Horizontal Bar – Budget by Ormawa */}
            <div className="glass-card rounded-2xl border border-slate-200/60 p-6 shadow-none">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>account_balance_wallet</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Anggaran per Ormawa</p>
                  <p className="text-sm font-black text-slate-800 font-headline">Top Budget Requests</p>
                </div>
              </div>
              <div className="space-y-3">
                {budgetByOrmawa.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-8">Belum ada data anggaran</p>
                ) : budgetByOrmawa.map((d, i) => {
                  const max = Math.max(...budgetByOrmawa.map(x => x.value), 1)
                  const pct = Math.round((d.value / max) * 100)
                  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase w-24 flex-shrink-0 truncate font-headline">{d.name}</span>
                      <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full rounded-lg flex items-center px-2 transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length], minWidth: '40px' }}
                        >
                          <span className="text-[8px] font-black text-white truncate">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: 'compact', minimumFractionDigits: 0 }).format(d.value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Table Section ────────────────────────────────────────── */}
        <PageCard>
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
                       <Button onClick={() => { setSelected(row); setIsRejectOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >close</span></Button>
                    </>
                  )}
                </div>
              )}
            />
          </CardContent>
        </PageCard>

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
                  <h2 className="text-3xl font-black font-headline tracking-tight leading-tight uppercase max-w-2xl text-white">{selected.Judul}</h2>
                  <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-widest">
                    <Building2 size={14} className="text-bku-primary" />
                    {selected.Ormawa?.Nama || 'Unit Mahasiswa Pengaju'}
                  </div>
                </div>
                <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-white/5 rotate-12 pointer-events-none" style={{ fontSize: '120px' }} >security</span>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                <div className="px-8 py-8 space-y-8">
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

                  <div className="pt-8 border-t border-slate-200/40 space-y-4">
                     {selected.Status === 'disetujui_fakultas' && (
                       <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
                         <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>timer</span>
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">Tenggat LPJ:</span>
                         <input type="number" min={1} max={365}
                           value={tenggatHari}
                           onChange={e => setTenggatHari(parseInt(e.target.value) || 14)}
                           className="w-20 h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-center text-slate-800 focus:outline-none focus:border-primary" />
                         <span className="text-[10px] font-bold text-slate-500">hari setelah disahkan</span>
                       </div>
                     )}
                     <div className="flex justify-end gap-3">
                       <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 font-headline shadow-none cursor-pointer border-slate-200 hover:bg-slate-100">Tutup</Button>
                       {selected.Status === 'disetujui_fakultas' && (
                         <>
                           <Button onClick={() => setIsRejectOpen(true)} className="h-11 px-6 rounded-xl bg-white text-rose-500 border border-rose-200 font-black font-headline text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all shadow-none cursor-pointer">Kembalikan</Button>
                           <Button onClick={() => handleApprove(selected.id || selected.ID)} disabled={isSubmitting} className="h-11 px-8 rounded-xl bg-slate-800 text-white font-black font-headline text-[10px] uppercase tracking-widest hover:bg-slate-900 shadow-none transition-all active:scale-95 group cursor-pointer border-none">
                             {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} >security</span>} Sahkan Proposal
                           </Button>
                         </>
                       )}
                     </div>
                   </div>
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
            <div className="size-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4 border border-rose-100 shadow-none"><span className="material-symbols-outlined" style={{ fontSize: '24px' }} >close</span></div>
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
    </PageContent>
  )
}

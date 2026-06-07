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

  const activeFacultyId = localStorage.getItem('superadmin_fakultas_id') || 'all'
  const activeProdiId = localStorage.getItem('superadmin_prodi_id') || 'all'

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminService.getGlobalProposals()
      if (res.status === 'success') {
        setData(res.data || [])
      } else {
        toast.error('Gagal memuat data proposal')
      }
    } catch {
      toast.error('Koneksi sistem terputus')
    } finally {
      setLoading(false)
    }
  }

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

  const filteredData = useMemo(() => {
    return data.filter(p => {
      if (activeFacultyId !== 'all') {
        const fid = p.FakultasID || p.fakultas_id || p.Mahasiswa?.FakultasID || p.Mahasiswa?.fakultas_id
        if (String(fid) !== String(activeFacultyId)) return false
      }
      if (activeProdiId !== 'all') {
        const pid = p.Mahasiswa?.ProgramStudiID || p.Mahasiswa?.program_studi_id
        if (String(pid) !== String(activeProdiId)) return false
      }
      return true
    })
  }, [data, activeFacultyId, activeProdiId])

  // Pending = menunggu persetujuan Univ: bisa dari Himpunan (sudah acc_fakultas) atau BEM/UKM/MPM (diajukan, tanpa Fakultas)
  const isUnivLevelOrmawa = (p) => !p.Ormawa?.FakultasID && !p.Ormawa?.fakultas_id
  const isPendingUniv = (p) => p.Status === 'disetujui_fakultas' || (p.Status === 'diajukan' && isUnivLevelOrmawa(p))
  const pending = filteredData.filter(isPendingUniv).length
  const totalBudget = filteredData.filter(isPendingUniv).reduce((acc, curr) => acc + (curr.Anggaran || 0), 0)

  // ── Chart data derived from live data ─────────────────────────────
  // ── 5W1H Analytics Data ───────────────────────────────────────────
  
  // 1. WHAT (Jenis Kegiatan)
  const whatChartData = useMemo(() => {
    const map = {};
    filteredData.forEach(p => { const j = p.Jenis || 'Lainnya'; map[j] = (map[j] || 0) + 1 });
    const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name, value], i) => ({
      name: name.substring(0, 15), value, color: colors[i % colors.length]
    }));
  }, [filteredData]);

  // 2. WHY (Status Alur - Mengapa tertahan/lanjut)
  const whyChartData = useMemo(() => {
    const cfg = {
      diajukan: { label: 'Diajukan', color: '#94a3b8' },
      disetujui_fakultas: { label: 'Acc Fakultas', color: '#3b82f6' },
      disetujui_univ: { label: 'Disyahkan', color: '#10b981' },
      revisi: { label: 'Revisi', color: '#f59e0b' },
      ditolak: { label: 'Ditolak', color: '#ef4444' },
    }
    const counts = {}
    filteredData.forEach(p => { const s = p.Status || 'diajukan'; counts[s] = (counts[s] || 0) + 1 })
    return Object.entries(counts).map(([key, value]) => ({
      name: cfg[key]?.label || key,
      value,
      color: cfg[key]?.color || '#94a3b8'
    }));
  }, [filteredData]);

  // 3. WHO (Top Pengaju / Ormawa)
  const whoChartData = useMemo(() => {
    const map = {};
    filteredData.forEach(p => { const o = (p.Ormawa?.Nama || 'Lainnya').substring(0,20); map[o] = (map[o] || 0) + 1 });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // 4. WHEN (Bulan Pelaksanaan)
  const whenChartData = useMemo(() => {
    const map = {};
    filteredData.forEach(p => {
      if(!p.TanggalKegiatan) return;
      const d = new Date(p.TanggalKegiatan);
      const m = d.toLocaleString('id-ID', { month: 'short', year: '2-digit' });
      map[m] = (map[m] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // 5. WHERE (Sebaran Fakultas)
  const whereChartData = useMemo(() => {
    const map = {};
    filteredData.forEach(p => { const f = (p.Fakultas?.Nama || 'Lainnya').replace('Fakultas ', 'F. '); map[f] = (map[f] || 0) + 1 });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // 6. HOW (Distribusi Anggaran per Ormawa)
  const howChartData = useMemo(() => {
    const map = {}
    filteredData.forEach(p => {
      const name = (p.Ormawa?.Nama || 'Lainnya').substring(0, 16)
      map[name] = (map[name] || 0) + (p.Anggaran || 0)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [filteredData]);

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

        {/* ── 5W1H Analytics Charts ─────────────────────────────────────── */}
        {!loading && filteredData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. WHAT */}
            <div className="glass-card rounded-2xl border border-slate-200/60 p-5 shadow-none flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>category</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">WHAT</p>
                  <p className="text-xs font-black text-slate-800 font-headline">Topik Kegiatan</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie data={whatChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="value">
                        {whatChartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '10px', fontWeight: '700' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 w-1/2">
                  {whatChartData.length === 0 ? <p className="text-[10px] text-slate-400">Belum ada data</p> : whatChartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-[9px] font-bold text-slate-600 flex-1 truncate">{d.name}</span>
                      <span className="text-[9px] font-black text-slate-800 tabular-nums">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. WHY */}
            <div className="glass-card rounded-2xl border border-slate-200/60 p-5 shadow-none flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>donut_large</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">WHY</p>
                  <p className="text-xs font-black text-slate-800 font-headline">Status Validasi</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie data={whyChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="value">
                        {whyChartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '10px', fontWeight: '700' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 w-1/2">
                  {whyChartData.length === 0 ? <p className="text-[10px] text-slate-400">Belum ada data</p> : whyChartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-[9px] font-bold text-slate-600 flex-1 truncate">{d.name}</span>
                      <span className="text-[9px] font-black text-slate-800 tabular-nums">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. WHO */}
            <div className="glass-card rounded-2xl border border-slate-200/60 p-5 shadow-none flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>groups</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">WHO</p>
                  <p className="text-xs font-black text-slate-800 font-headline">Pengaju Aktif</p>
                </div>
              </div>
              <div className="flex-1 space-y-2.5 flex flex-col justify-center">
                {whoChartData.length === 0 ? <p className="text-[10px] text-slate-400">Belum ada data</p> : whoChartData.map((d, i) => {
                  const max = Math.max(...whoChartData.map(x => x.value), 1)
                  const pct = Math.round((d.value / max) * 100)
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase w-16 truncate" title={d.name}>{d.name}</span>
                      <div className="flex-1 h-3.5 bg-slate-100 rounded-md overflow-hidden">
                        <div className="h-full rounded-md bg-emerald-400 transition-all" style={{ width: `${pct}%`, minWidth: '8px' }} />
                      </div>
                      <span className="text-[9px] font-black text-slate-800 w-4 text-right">{d.value}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 4. WHEN */}
            <div className="glass-card rounded-2xl border border-slate-200/60 p-5 shadow-none flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>event</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">WHEN</p>
                  <p className="text-xs font-black text-slate-800 font-headline">Linimasa Kegiatan</p>
                </div>
              </div>
              <div className="flex-1 flex items-end">
                {whenChartData.length === 0 ? <p className="text-[10px] text-slate-400 w-full text-center">Belum ada jadwal</p> : (
                  <ResponsiveContainer width="100%" height={110}>
                    <BarChart data={whenChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '10px', fontWeight: '700' }} />
                      <Bar dataKey="value" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* 5. WHERE */}
            <div className="glass-card rounded-2xl border border-slate-200/60 p-5 shadow-none flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>pin_drop</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">WHERE</p>
                  <p className="text-xs font-black text-slate-800 font-headline">Sebaran Fakultas</p>
                </div>
              </div>
              <div className="flex-1 space-y-2.5 flex flex-col justify-center">
                {whereChartData.length === 0 ? <p className="text-[10px] text-slate-400">Belum ada data</p> : whereChartData.map((d, i) => {
                  const max = Math.max(...whereChartData.map(x => x.value), 1)
                  const pct = Math.round((d.value / max) * 100)
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase w-16 truncate" title={d.name}>{d.name}</span>
                      <div className="flex-1 h-3.5 bg-slate-100 rounded-md overflow-hidden">
                        <div className="h-full rounded-md bg-indigo-400 transition-all" style={{ width: `${pct}%`, minWidth: '8px' }} />
                      </div>
                      <span className="text-[9px] font-black text-slate-800 w-4 text-right">{d.value}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 6. HOW */}
            <div className="glass-card rounded-2xl border border-slate-200/60 p-5 shadow-none flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>account_balance_wallet</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">HOW</p>
                  <p className="text-xs font-black text-slate-800 font-headline">Alokasi Anggaran</p>
                </div>
              </div>
              <div className="flex-1 space-y-2.5 flex flex-col justify-center">
                {howChartData.length === 0 ? (
                  <p className="text-[10px] text-slate-400">Belum ada data anggaran</p>
                ) : howChartData.map((d, i) => {
                  const max = Math.max(...howChartData.map(x => x.value), 1)
                  const pct = Math.round((d.value / max) * 100)
                  const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6']
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[8px] font-bold text-slate-500 uppercase w-16 truncate" title={d.name}>{d.name}</span>
                      <div className="flex-1 h-3.5 bg-slate-100 rounded-md overflow-hidden">
                        <div
                          className="h-full rounded-md flex items-center px-1 transition-all"
                          style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length], minWidth: '30px' }}
                        >
                          <span className="text-[7px] font-black text-white truncate">
                            {new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(d.value)}
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
              data={filteredData} 
              loading={loading}
              searchPlaceholder="Cari judul proposal, ormawa, atau ID..."
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => { setSelected(row); setIsDetailOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-bku-primary hover:bg-bku-primary/10 rounded-lg transition-colors cursor-pointer shadow-none"><span className="material-symbols-outlined" style={{ fontSize: '18px' }} >visibility</span></Button>
                </div>
              )}
            />
          </CardContent>
        </PageCard>

      {/* ── Detail Dialog ─────────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen} maxWidth="max-w-[95vw] md:max-w-4xl lg:max-w-5xl">
        <DialogContent className="w-full max-h-[85vh] p-0 overflow-hidden border-none shadow-2xl rounded-3xl glass-card bg-white/95 flex flex-col">
          {selected && (
            <>
              <div className="p-6 md:p-10 bg-slate-900 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-bku-primary/30 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <Badge className="font-black font-headline text-[9px] md:text-[10px] px-2 md:px-3 py-1 bg-white/10 text-white border-none shadow-none uppercase tracking-widest">#PRP-{selected.id || selected.ID}</Badge>
                    <div className="hidden md:block size-1 rounded-full bg-white/20" />
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-300 uppercase tracking-widest">{selected.Fakultas?.Nama || 'Institusi'}</span>
                  </div>
                  <h2 className="text-xl md:text-3xl font-black font-headline tracking-tight leading-tight uppercase max-w-2xl text-white">{selected.Judul}</h2>
                  <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] md:text-[11px] uppercase tracking-widest">
                    <Building2 size={14} className="text-bku-primary shrink-0" />
                    <span className="truncate">{selected.Ormawa?.Nama || 'Unit Mahasiswa Pengaju'}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-white/5 rotate-12 pointer-events-none" style={{ fontSize: '100px' }} >security</span>
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="px-6 py-6 md:px-8 md:py-8 space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card bg-white/50 p-5 rounded-2xl border border-slate-200/60 shadow-none space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Proyeksi Anggaran</p>
                        <p className="text-2xl font-black text-slate-800 font-headline tabular-nums">{formatRp(selected.Anggaran)}</p>
                    </div>
                    <div className="glass-card bg-white/50 p-5 rounded-2xl border border-slate-200/60 shadow-none space-y-2 flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Rekening Ormawa</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="material-symbols-outlined text-slate-400" style={{fontSize: '18px'}}>account_balance</span>
                          <p className="text-sm font-bold text-slate-700 break-all">{selected.Ormawa?.rekening || selected.Ormawa?.Rekening || 'Belum diatur'}</p>
                        </div>
                    </div>
                    <div className="glass-card bg-white/50 p-5 rounded-2xl border border-slate-200/60 shadow-none space-y-2 flex flex-col items-start justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Status Validasi</p>
                        <Badge className={cn('px-3 py-1 rounded-lg border-none shadow-none text-[9px] font-black uppercase tracking-widest font-headline mt-1', STATUS_CFG[selected.Status]?.cls)}>
                            {STATUS_CFG[selected.Status]?.label || selected.Status}
                        </Badge>
                    </div>
                 </div>

                 {/* 5W1H Analysis */}
                 <div className="space-y-6">
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center gap-2">
                     <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '18px' }}>analytics</span> Analisis 5W + 1H
                   </h3>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
                     {/* WHAT */}
                     <div className="space-y-3">
                       <div className="flex items-center gap-2">
                         <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-2 shadow-none font-bold">WHAT</Badge>
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Apa Kegiatan Ini?</span>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-blue-100">
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jenis Kegiatan</p>
                           <p className="text-sm font-semibold text-slate-700">{selected.Jenis || '-'}</p>
                         </div>
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bentuk Kegiatan</p>
                           <p className="text-sm font-semibold text-slate-700">{selected.bentuk_kegiatan || selected.BentukKegiatan || '-'}</p>
                         </div>
                         <div className="sm:col-span-2">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ringkasan / Deskripsi Singkat</p>
                           <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/60 whitespace-pre-wrap mt-1">
                             {selected.Deskripsi || selected.deskripsi || '-'}
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* WHY */}
                     <div className="space-y-3">
                       <div className="flex items-center gap-2">
                         <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none px-2 shadow-none font-bold">WHY</Badge>
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Mengapa Diadakan?</span>
                       </div>
                       <div className="space-y-4 pl-4 border-l-2 border-purple-100">
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latar Belakang</p>
                           <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/60 whitespace-pre-wrap mt-1">
                             {selected.latar_belakang || selected.LatarBelakang || '-'}
                           </div>
                         </div>
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tujuan Kegiatan</p>
                           <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/60 whitespace-pre-wrap mt-1">
                             {selected.tujuan_kegiatan || selected.TujuanKegiatan || '-'}
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* WHO */}
                     <div className="space-y-3">
                       <div className="flex items-center gap-2">
                         <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-2 shadow-none font-bold">WHO</Badge>
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Siapa yang Terlibat?</span>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-emerald-100">
                         <div className="sm:col-span-2">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sasaran / Target Peserta</p>
                           <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/60 whitespace-pre-wrap mt-1">
                             {selected.sasaran_kegiatan || selected.SasaranKegiatan || '-'}
                           </div>
                         </div>
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penanggung Jawab</p>
                           <p className="text-sm font-semibold text-slate-700">{selected.pj_kegiatan || selected.PJKegiatan || '-'}</p>
                         </div>
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mitra / Kolaborator</p>
                           <p className="text-sm font-semibold text-slate-700">{selected.mitra || selected.Mitra || '-'}</p>
                         </div>
                       </div>
                     </div>

                     {/* WHEN & WHERE */}
                     <div className="space-y-3">
                       <div className="flex items-center gap-2">
                         <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-2 shadow-none font-bold">WHEN &amp; WHERE</Badge>
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Kapan &amp; Dimana?</span>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-amber-100">
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal Kegiatan</p>
                           <p className="text-sm font-semibold text-slate-700">
                             {selected.TanggalKegiatan ? new Date(selected.TanggalKegiatan).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                           </p>
                         </div>
                         <div className="sm:col-span-2">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jadwal &amp; Tempat Pelaksanaan</p>
                           <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/60 whitespace-pre-wrap mt-1">
                             {selected.jadwal_pelaksanaan || selected.JadwalPelaksanaan || '-'}
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* HOW */}
                     <div className="space-y-3 lg:col-span-2">
                       <div className="flex items-center gap-2">
                         <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-none px-2 shadow-none font-bold">HOW</Badge>
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Bagaimana Pelaksanaannya?</span>
                       </div>
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pl-4 border-l-2 border-rose-100">
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Indikator Keberhasilan</p>
                           <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/60 whitespace-pre-wrap mt-1">
                             {selected.indikator_keberhasilan || selected.IndikatorKeberhasilan || '-'}
                           </div>
                         </div>
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sumber Dana Utama</p>
                           <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/60 whitespace-pre-wrap mt-1">
                             {selected.sumber_dana || selected.SumberDana || '-'}
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Link Lampiran / Berkas */}
                 {(selected.file_url || selected.FileURL) && (
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lampiran Dokumen</p>
                       <a href={selected.file_url || selected.FileURL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-bku-primary/10 text-bku-primary px-4 py-3 rounded-xl font-bold text-sm hover:bg-bku-primary/20 transition-colors">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span> Unduh/Lihat Dokumen Proposal
                       </a>
                    </div>
                 )}

                 {selected.Catatan && (
                    <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl space-y-3">
                        <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest font-headline flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >error</span> Catatan / Revisi Sebelumnya
                        </div>
                        <div className="text-sm font-medium text-rose-700 leading-relaxed font-inter whitespace-pre-wrap">{selected.Catatan}</div>
                    </div>
                 )}

                  <div className="pt-8 border-t border-slate-200/40 space-y-4">
                     {isPendingUniv(selected) && (
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
                     {selected.Status === 'diajukan' && isUnivLevelOrmawa(selected) && (
                       <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2">
                         <span className="material-symbols-outlined text-amber-500" style={{ fontSize: '16px' }}>info</span>
                         <span className="text-[10px] font-bold text-amber-700">Ormawa Universitas (BEM/UKM/MPM) — Bypass persetujuan Fakultas</span>
                       </div>
                     )}
                     <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                       <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="w-full sm:w-auto h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 font-headline shadow-none cursor-pointer border-slate-200 hover:bg-slate-100">Tutup</Button>
                       {isPendingUniv(selected) && (
                         <>
                           <Button onClick={() => setIsRejectOpen(true)} className="w-full sm:w-auto h-11 px-6 rounded-xl bg-white text-rose-500 border border-rose-200 font-black font-headline text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all shadow-none cursor-pointer">Kembalikan</Button>
                           <Button onClick={() => handleApprove(selected.id || selected.ID)} disabled={isSubmitting} className="w-full sm:w-auto h-11 px-8 rounded-xl bg-slate-800 text-white font-black font-headline text-[10px] uppercase tracking-widest hover:bg-slate-900 shadow-none transition-all active:scale-95 group cursor-pointer border-none">
                             {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} >security</span>} Sahkan Proposal
                           </Button>
                         </>
                       )}
                     </div>
                   </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Reject Reason Dialog ──────────────────────────────────── */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen} maxWidth="max-w-md">
        <DialogContent className="w-full p-0 overflow-hidden border-none shadow-2xl rounded-3xl glass-card bg-white/95">
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

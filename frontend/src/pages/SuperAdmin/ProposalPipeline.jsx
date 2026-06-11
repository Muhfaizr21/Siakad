"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DialogModal, ModalCancelButton, ModalSaveButton } from '@/components/ui/DialogModal'

import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  RadialBarChart, RadialBar, Legend
} from 'recharts'
import { PageContent } from '@/components/ui/page'
import { DashboardHero, DashboardStatGrid, DashboardStatCard } from '@/components/ui/dashboard'
import { TitleSubtitleCell } from '@/components/ui/TableCells'
import { PrimaryStatsCard } from '@/components/ui/StatsCard'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Layers = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>description</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const AlertTriangle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>cancel</span>;
const CheckCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>verified</span>;
const Payments = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>account_balance_wallet</span>;
const Wallet = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>account_balance_wallet</span>;

const STATUS_CFG = {
  diajukan: { label: 'DIAJUKAN', cls: 'bg-neutral-50 text-neutral-500 border-neutral-100' },
  disetujui_fakultas: { label: 'ACC FAKULTAS', cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  disetujui_univ: { label: 'DISYAHKAN', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  revisi: { label: 'BUTUH REVISI', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  ditolak: { label: 'DITOLAK', cls: 'bg-rose-50 text-rose-700 border-rose-100' },
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
  useEffect(() => { fetchData() }, [activeFacultyId, activeProdiId])

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

  const isUnivLevelOrmawa = (p) => !p.Ormawa?.FakultasID && !p.Ormawa?.fakultas_id
  const isPendingUniv = (p) => p.Status === 'disetujui_fakultas' || (p.Status === 'diajukan' && isUnivLevelOrmawa(p))
  const pending = filteredData.filter(isPendingUniv).length
  const totalBudget = filteredData.filter(isPendingUniv).reduce((acc, curr) => acc + (curr.Anggaran || 0), 0)
  const totalProposal = filteredData.length
  const approvedProposal = filteredData.filter(p => p.Status === 'disetujui_univ').length
  const rejectedProposal = filteredData.filter(p => p.Status === 'ditolak').length

  // ── Chart data derived from live data ─────────────────────────────
  // ── 5W1H Analytics Data ───────────────────────────────────────────

  // 1. WHAT (Jenis Kegiatan)
  const whatChartData = useMemo(() => {
    const map = {};
    filteredData.forEach(p => { const j = p.Jenis || 'Lainnya'; map[j] = (map[j] || 0) + 1 });
    const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({
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
    filteredData.forEach(p => { const o = (p.Ormawa?.Nama || 'Lainnya').substring(0, 20); map[o] = (map[o] || 0) + 1 });
    const colors = ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'];
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({ name, value, fill: colors[i % colors.length] }));
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
      className: 'w-[120px]',
      render: (v, row) => (
        <span className="font-bold text-[var(--theme-text-muted)] text-[11px] tracking-wide">#{row.id || row.ID || v}</span>
      )
    },
    {
      key: 'Judul',
      label: 'Judul Proposal & Pengaju',
      className: 'w-[400px]',
      render: (v, row) => (
        <TitleSubtitleCell
          title={v || '—'}
          subtitle={`${row.Ormawa?.Nama || 'Unit Mahasiswa'} • ${row.Fakultas?.Nama || 'Institusi'}`}
        />
      )
    },
    {
      key: 'Anggaran',
      label: 'Estimasi Dana',
      className: 'w-[160px]',
      render: v => (
        <span className="font-bold text-[13px] text-[var(--theme-text)]">{formatRp(v)}</span>
      )
    },
    {
      key: 'Status',
      label: 'Alur Verifikasi',
      className: 'w-[160px] text-center',
      cellClassName: 'text-center',
      render: v => {
        const cfg = STATUS_CFG[v] || { label: v || '—', cls: 'bg-slate-100 text-slate-600' }
        return (
          <div className="flex justify-center">
            <Badge className={cn('px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full border-none shadow-none', cfg.cls)}>
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
          <div className="flex items-center gap-6 bg-[var(--theme-surface)] p-4 md:p-6 rounded-2xl border border-[var(--theme-border-muted)] shadow-sm">
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-bold text-[var(--theme-text-muted)] tracking-wide mb-1 uppercase">Antrian Pending</span>
              <span className="text-3xl font-bold text-[var(--theme-text)] font-headline tracking-tight tabular-nums leading-none">{pending} <span className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Unit</span></span>
            </div>
            <div className="size-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md border-none">
              <span className="material-symbols-outlined animate-pulse" style={{ fontSize: '28px' }} strokeWidth={2.5}>pending_actions</span>
            </div>
          </div>
        }
      />

      {/* ── Stats Summary ────────────────────────────────────────── */}
      <div className="space-y-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <PrimaryStatsCard
            title="Total Proposal"
            value={totalProposal}
            icon={Layers}
            colorTheme="info"
            badgeText="Semua pengajuan"
            badgeIcon={<span className="material-symbols-outlined text-[12px]">description</span>}
          />

          <PrimaryStatsCard
            title="Menunggu Review"
            value={pending}
            icon={Clock}
            colorTheme="primary"
            badgeText="Butuh aksi universitas"
            badgeIcon={<span className="material-symbols-outlined text-[12px]">pending</span>}
          />

          <PrimaryStatsCard
            title="Disetujui Universitas"
            value={approvedProposal}
            icon={CheckCircle}
            colorTheme="success"
            badgeText="Telah disyahkan"
            badgeIcon={<span className="material-symbols-outlined text-[12px]">verified</span>}
          />

          <PrimaryStatsCard
            title="Total Ditolak"
            value={rejectedProposal}
            icon={AlertTriangle}
            colorTheme="error"
            badgeText="Proposal ditolak"
            badgeIcon={<span className="material-symbols-outlined text-[12px]">cancel</span>}
          />

          <PrimaryStatsCard
            title="Anggaran Pending"
            value={formatRp(totalBudget)}
            icon={Payments}
            colorTheme="warning"
            badgeText="Menunggu persetujuan"
            badgeIcon={<span className="material-symbols-outlined text-[12px]">account_balance_wallet</span>}
          />
        </div>
      </div>

      {/* ── Analytics Charts ─────────────────────────────────────── */}
      {!loading && filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* 1. WHAT */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all relative overflow-hidden group flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>category</span>
                </div>
                <h3 className="text-[13px] font-bold text-[var(--theme-text)]">Topik Kegiatan</h3>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="w-[110px]">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={whatChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={52} paddingAngle={2} dataKey="value" stroke="none">
                      {whatChartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [value + ' Proposal', props.payload.name || 'Topik']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '10px', fontWeight: '700' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1">
                {whatChartData.length === 0 ? <p className="text-[10px] text-slate-400">Belum ada data</p> : whatChartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] font-semibold text-[var(--theme-text-muted)] flex-1 truncate">{d.name}</span>
                    <span className="text-[11px] font-bold text-[var(--theme-text)] tabular-nums">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. WHY */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all relative overflow-hidden group flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>donut_large</span>
                </div>
                <h3 className="text-[13px] font-bold text-[var(--theme-text)]">Status Validasi</h3>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="w-[110px]">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={whyChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={52} paddingAngle={2} dataKey="value" stroke="none">
                      {whyChartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [value + ' Proposal', props.payload.name || 'Status']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '10px', fontWeight: '700' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1">
                {whyChartData.length === 0 ? <p className="text-[10px] text-slate-400">Belum ada data</p> : whyChartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] font-semibold text-[var(--theme-text-muted)] flex-1 truncate">{d.name}</span>
                    <span className="text-[11px] font-bold text-[var(--theme-text)] tabular-nums">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. HOW */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all relative overflow-hidden group flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>account_balance_wallet</span>
                </div>
                <h3 className="text-[13px] font-bold text-[var(--theme-text)]">Alokasi Anggaran</h3>
              </div>
            </div>
            <div className="flex-1 flex items-end justify-center">
              {howChartData.length === 0 ? (
                <p className="text-[10px] text-slate-400">Belum ada data anggaran</p>
              ) : (
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={howChartData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#64748b', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(val) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(val)} />
                    <Tooltip labelFormatter={(label) => `Ormawa: ${label}`} cursor={{ stroke: '#fb7185', strokeWidth: 1, strokeDasharray: '3 3', fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '10px', fontWeight: '700' }} formatter={(val) => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: 'compact', maximumFractionDigits: 1 }).format(val), 'Total Anggaran']} />
                    <Area type="monotone" dataKey="value" stroke="#fb7185" strokeWidth={3} fillOpacity={1} fill="url(#colorHow)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ── Table Section ────────────────────────────────────────── */}
      <div className="glass-card mt-6">
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
      </div>

      {/* ── Detail Dialog ─────────────────────────────────────────── */}
      <DialogModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        title={selected?.Judul}
        subtitle={`Detail Proposal Kegiatan • PRP-${selected?.id || selected?.ID}`}
        description={
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">corporate_fare</span>
            Pengaju: {selected?.Ormawa?.Nama || 'Unit Mahasiswa'} | {selected?.Fakultas?.Nama || 'Institusi'}
          </span>
        }
        icon="account_balance_wallet"
        maxWidth="max-w-4xl"
        variant="default"
        bodyClassName="p-0 flex flex-col"
        footer={
          <ModalCancelButton onClick={() => setIsDetailOpen(false)}>
            TUTUP
          </ModalCancelButton>
        }
      >
        {selected && (
          <Tabs defaultValue="overview" className="w-full flex flex-col flex-grow overflow-hidden">
                <div className="px-6 md:px-8 pt-4 pb-0 bg-white border-b border-slate-100 shrink-0 z-10 relative">
                  <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100/80 p-1 rounded-xl mb-4">
                    <TabsTrigger value="overview" className="rounded-lg text-xs sm:text-sm font-semibold text-slate-600 data-[state=active]:text-blue-700 transition-colors">Overview</TabsTrigger>
                    <TabsTrigger value="administrasi" className="rounded-lg text-xs sm:text-sm font-semibold text-slate-600 data-[state=active]:text-blue-700 transition-colors">Administrasi</TabsTrigger>
                  </TabsList>
                </div>
              
                <div className="p-6 md:p-8 overflow-y-auto font-inter bg-slate-50/50 flex-grow relative">
                <TabsContent value="overview" className="mt-0 space-y-8 outline-none animate-in fade-in zoom-in-95 duration-200">
                  {/* 1. KARTU RINGKASAN ATAS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Anggaran */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl shadow-lg shadow-emerald-500/20 text-white flex flex-col justify-center transition-all hover:scale-[1.02]">
                      <div className="absolute -right-4 -bottom-4 opacity-10">
                        <span className="material-symbols-outlined text-[100px]">payments</span>
                      </div>
                      <div className="relative z-10 flex items-center gap-2 mb-3">
                        <div className="size-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px] text-white">payments</span>
                        </div>
                        <p className="text-[10px] font-black text-emerald-50 uppercase tracking-widest font-headline">Proyeksi Anggaran</p>
                      </div>
                      <p className="relative z-10 text-2xl font-black font-headline tabular-nums leading-none mb-1">{formatRp(selected.Anggaran)}</p>
                      <p className="relative z-10 text-[10px] font-medium text-emerald-100 truncate">Sumber: {selected.sumber_dana || selected.SumberDana || 'Tidak disebutkan'}</p>
                    </div>
                    {/* Rekening */}
                    <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-all hover:shadow-md hover:border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="size-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px]">account_balance</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Rekening Pencairan</p>
                      </div>
                      <p className="text-sm font-bold text-slate-800 break-all leading-tight mb-1">{selected.Ormawa?.rekening || selected.Ormawa?.Rekening || 'Belum diatur'}</p>
                      <p className="text-[10px] font-semibold text-slate-500 truncate">A.N. {selected.Ormawa?.Nama || 'Organisasi'}</p>
                    </div>
                    {/* Status */}
                    <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-all hover:shadow-md hover:border-amber-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="size-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Status Validasi</p>
                      </div>
                      <div className="mt-auto">
                        <Badge className={cn('px-3 py-1.5 rounded-lg border-none shadow-sm text-[10px] font-black uppercase tracking-widest font-headline w-fit', STATUS_CFG[selected.Status]?.cls)}>
                          {STATUS_CFG[selected.Status]?.label || selected.Status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* 2. TABEL KARTU (Sejajar Atas & Bawah) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* KIRI: Informasi Utama */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 shrink-0">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-[18px]">description</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 font-headline">Informasi Utama Kegiatan</h3>
                      </div>
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="bg-slate-50/50 rounded-xl border border-slate-100/60 overflow-hidden divide-y divide-slate-100/60 flex-grow flex flex-col shadow-inner">
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center p-5 hover:bg-white/50 transition-colors">
                            <div className="w-full sm:w-2/5 text-xs font-semibold text-slate-500 mb-1 sm:mb-0 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">category</span>
                              Jenis Kegiatan
                            </div>
                            <div className="w-full sm:w-3/5 text-sm font-bold text-slate-900">{selected.jenis_kegiatan || selected.JenisKegiatan || selected.Jenis || '-'}</div>
                          </div>
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center p-5 hover:bg-white/50 transition-colors">
                            <div className="w-full sm:w-2/5 text-xs font-semibold text-slate-500 mb-1 sm:mb-0 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">extension</span>
                              Bentuk Kegiatan
                            </div>
                            <div className="w-full sm:w-3/5 text-sm font-bold text-slate-900">{selected.bentuk_kegiatan || selected.BentukKegiatan || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* KANAN: Waktu & Lokasi */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 shrink-0">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                          <span className="material-symbols-outlined text-[18px]">event_note</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 font-headline">Pelaksanaan</h3>
                      </div>
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="bg-slate-50/50 rounded-xl border border-slate-100/60 overflow-hidden divide-y divide-slate-100/60 flex-grow flex flex-col shadow-inner">
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center p-5 hover:bg-white/50 transition-colors">
                            <div className="w-full sm:w-2/5 text-xs font-semibold text-slate-500 flex items-center gap-2 mb-1 sm:mb-0">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                              Tanggal
                            </div>
                            <div className="w-full sm:w-3/5 text-sm font-bold text-slate-900 leading-snug">
                              {selected.TanggalKegiatan ? new Date(selected.TanggalKegiatan).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center p-5 hover:bg-white/50 transition-colors">
                            <div className="w-full sm:w-2/5 text-xs font-semibold text-slate-500 flex items-center gap-2 mb-1 sm:mb-0">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                              Tempat & Waktu
                            </div>
                            <div className="w-full sm:w-3/5 text-sm font-bold text-slate-900 whitespace-pre-wrap leading-snug">
                              {selected.jadwal_pelaksanaan || selected.JadwalPelaksanaan || '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. RINCIAN & LATAR BELAKANG */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* KIRI: Rincian Kegiatan */}
                    {(selected.deskripsi || selected.Deskripsi || selected.tujuan_kegiatan || selected.TujuanKegiatan || selected.indikator_keberhasilan || selected.IndikatorKeberhasilan) && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                            <span className="material-symbols-outlined text-[18px]">notes</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-800 font-headline">Rincian Kegiatan</h3>
                        </div>
                        <div className="p-6 space-y-6">
                          {(selected.deskripsi || selected.Deskripsi) && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">subject</span> Deskripsi Singkat
                              </p>
                              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {selected.deskripsi || selected.Deskripsi}
                              </div>
                            </div>
                          )}

                          {(selected.tujuan_kegiatan || selected.TujuanKegiatan) && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">track_changes</span> Tujuan Kegiatan
                              </p>
                              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {selected.tujuan_kegiatan || selected.TujuanKegiatan}
                              </div>
                            </div>
                          )}

                          {(selected.indikator_keberhasilan || selected.IndikatorKeberhasilan) && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">analytics</span> Indikator Keberhasilan
                              </p>
                              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {selected.indikator_keberhasilan || selected.IndikatorKeberhasilan}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* KANAN: Latar Belakang */}
                    {(selected.latar_belakang || selected.LatarBelakang) && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <span className="material-symbols-outlined text-[18px]">history_edu</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-800 font-headline">Latar Belakang</h3>
                        </div>
                        <div className="p-6">
                          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {selected.latar_belakang || selected.LatarBelakang}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="administrasi" className="mt-0 space-y-8 outline-none animate-in fade-in zoom-in-95 duration-200">
                  {/* TOP SECTION: Sejajar (items-stretch) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* KIRI: Penyelenggara */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 shrink-0">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                          <span className="material-symbols-outlined text-[18px]">groups</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 font-headline">Penyelenggara</h3>
                      </div>
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="bg-slate-50/50 rounded-xl border border-slate-100/60 overflow-hidden divide-y divide-slate-100/60 flex-grow flex flex-col shadow-inner">
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center p-5 hover:bg-white/50 transition-colors">
                            <div className="w-full sm:w-2/5 text-xs font-semibold text-slate-500 flex items-center gap-2 mb-1 sm:mb-0">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                              Penanggung Jawab
                            </div>
                            <div className="w-full sm:w-3/5 text-sm font-bold text-slate-900 leading-snug">{selected.pj_kegiatan || selected.PJKegiatan || '-'}</div>
                          </div>
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center p-5 hover:bg-white/50 transition-colors">
                            <div className="w-full sm:w-2/5 text-xs font-semibold text-slate-500 flex items-center gap-2 mb-1 sm:mb-0">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">handshake</span>
                              Mitra
                            </div>
                            <div className="w-full sm:w-3/5 text-sm font-bold text-slate-900 leading-snug">{selected.mitra || selected.Mitra || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* KANAN: Berkas Pendukung */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 shrink-0">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-[18px]">folder</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 font-headline">Berkas Pendukung</h3>
                      </div>
                      <div className="p-6 flex-grow flex flex-col justify-center">
                        {selected.file_url || selected.FileURL ? (
                          <a href={selected.file_url || selected.FileURL} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-primary/5 hover:bg-primary/10 border border-primary/10 p-5 rounded-xl transition-all hover:scale-[1.02] group h-full flex-1 max-h-[120px]">
                            <div className="flex items-center gap-4">
                              <div className="size-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shrink-0">
                                <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 mb-1">Dokumen Proposal</p>
                                <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">download</span> Lihat / Unduh PDF
                                </p>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform text-2xl">arrow_forward_ios</span>
                          </a>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 h-full bg-slate-50/50 rounded-xl border border-dashed border-slate-200 min-h-[100px]">
                            <span className="material-symbols-outlined text-3xl">cancel</span>
                            <p className="text-sm font-medium">Tidak ada berkas</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FULL WIDTH: Sasaran Peserta */}
                  {(selected.sasaran_kegiatan || selected.SasaranKegiatan) && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                          <span className="material-symbols-outlined text-[18px]">target</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 font-headline">Sasaran Peserta</h3>
                      </div>
                      <div className="p-6">
                        <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-5 rounded-xl border border-slate-100 whitespace-pre-wrap">
                          {selected.sasaran_kegiatan || selected.SasaranKegiatan}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BOTTOM SECTION: Tenggat LPJ & Aksi Persetujuan (Hanya untuk isPendingUniv) */}
                  {isPendingUniv(selected) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                      {/* KIRI: Tetapkan Tenggat LPJ */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 shrink-0">
                          <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-[18px]">timer</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-800 font-headline">Tenggat Waktu LPJ</h3>
                        </div>
                        <div className="p-6 flex-grow flex flex-col justify-center">
                          <p className="text-xs font-medium text-slate-600 mb-6 leading-relaxed text-center sm:text-left">
                            Tentukan batas waktu maksimal bagi ormawa untuk mengunggah Laporan Pertanggungjawaban (LPJ) setelah kegiatan selesai.
                          </p>
                          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner max-w-xs mx-auto sm:mx-0 w-full">
                            <input type="number" min={1} max={365}
                              value={tenggatHari}
                              onChange={e => setTenggatHari(parseInt(e.target.value) || 14)}
                              className="flex-1 h-12 px-4 text-lg font-black text-center text-slate-800 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            <span className="text-sm font-bold text-slate-500 px-5 bg-slate-100 h-full flex items-center border-l border-slate-200">hari</span>
                          </div>
                        </div>
                      </div>

                      {/* KANAN: Aksi Persetujuan */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 shrink-0">
                          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <span className="material-symbols-outlined text-[18px]">verified_user</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-800 font-headline">Aksi Persetujuan</h3>
                        </div>
                        <div className="p-6 flex-grow flex flex-col justify-center items-center gap-4 bg-slate-50/20">
                          <div className="w-full flex flex-col gap-3">
                            <Button
                              type="button"
                              onClick={() => handleApprove(selected.id || selected.ID)}
                              disabled={isSubmitting}
                              className="w-full h-12 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border-none font-black text-[10px] tracking-widest uppercase"
                            >
                              {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>security</span>}
                              SAHKAN PROPOSAL
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsRejectOpen(true)}
                              className="w-full h-12 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-black text-[10px] tracking-widest uppercase transition-all active:scale-95 flex items-center justify-center gap-2 bg-white"
                            >
                              <span className="material-symbols-outlined text-[18px]">cancel</span>
                              TOLAK / KEMBALIKAN
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Catatan Revisi & Peringatan (Jika Ada) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {selected.Catatan && (
                      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 text-rose-600 mb-3">
                          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                            <span className="material-symbols-outlined text-[16px]">feedback</span>
                          </div>
                          <h3 className="text-xs font-black uppercase tracking-widest font-headline">Catatan Revisi</h3>
                        </div>
                        <div className="text-sm font-medium text-rose-700 leading-relaxed whitespace-pre-wrap bg-white/60 p-4 rounded-xl border border-rose-200 shadow-inner">
                          {selected.Catatan}
                        </div>
                      </div>
                    )}

                    {selected.Status === 'diajukan' && isUnivLevelOrmawa(selected) && (
                      <div className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                        <div className="size-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
                          <span className="material-symbols-outlined text-[16px]">info</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 font-headline">Peringatan</p>
                          <p className="text-xs font-medium text-amber-800 leading-relaxed">
                            Ormawa tingkat Universitas (BEM/UKM/MPM). Proposal ini <strong>langsung diajukan ke Rektorat</strong> tanpa validasi Fakultas.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
        )}
      </DialogModal>

      {/* ── Reject Reason Dialog ──────────────────────────────────── */ }
      <DialogModal
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        title="Tolak Proposal"
        subtitle="Tolak Proposal"
        description="Berikan alasan formal penangguhan anggaran."
        icon="error"
        variant="danger"
        maxWidth="max-w-md"
        footer={
          <>
            <ModalCancelButton onClick={() => setIsRejectOpen(false)}>
              Batal
            </ModalCancelButton>
            <ModalSaveButton 
              onClick={handleReject} 
              disabled={isSubmitting || !rejectNote.trim()} 
              loading={isSubmitting} 
              icon="save" 
              className="bg-rose-600 hover:bg-rose-700 border-none shadow-xl shadow-rose-600/20 text-white"
            >
              KONFIRMASI TOLAK
            </ModalSaveButton>
          </>
        }
      >
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-500 font-headline uppercase tracking-widest ml-1">Justifikasi Penolakan</Label>
          <Textarea 
            required 
            value={rejectNote} 
            onChange={e => setRejectNote(e.target.value)} 
            placeholder="Tuliskan alasan penolakan atau instruksi revisi..."
            className="min-h-[120px] rounded-xl border-slate-200 bg-white shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 p-4 font-medium text-xs font-inter transition-all" 
          />
        </div>
      </DialogModal>
    </PageContent >
  )
}

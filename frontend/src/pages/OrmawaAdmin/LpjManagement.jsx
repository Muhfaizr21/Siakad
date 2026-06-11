"use client"
import React, { useState, useEffect } from 'react';
import { PageContent } from '@/components/ui/page';
import { DashboardHero } from '@/components/ui/dashboard';
import { DataTable } from '@/components/ui/DataTable'



import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DialogModal, ModalCancelButton, ModalSaveButton } from '@/components/ui/DialogModal'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { PrimaryStatsCard } from '@/components/ui/StatsCard'
import { SelectField, SelectOption } from '@/components/ui/SelectField'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import { getOrmawaId } from '../../utils/getOrmawaId'

const API = `${API_BASE_URL}/ormawa`

const AssignmentTurnedInIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>assignment_turned_in</span>;
const CheckCircleIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const PendingActionsIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>pending_actions</span>;
const PaymentsIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>payments</span>;
const SavingsIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>savings</span>;

// Premium Rupiah Formatter
const formatRp = (n) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(n || 0)
}

const STATUS_CFG = {
  draft: { label: 'Draft', cls: 'bg-slate-50 text-slate-600 border-border', icon: 'edit_document' },
  diajukan: { label: 'Diajukan', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'send' },
  disetujui: { label: 'Disetujui', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'verified' },
  revisi: { label: 'Butuh Revisi', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'rate_review' },
  ditolak: { label: 'Ditolak', cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'cancel' },
  selesai: { label: 'Selesai', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: 'task_alt' },
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
  const ormawaId = getOrmawaId()

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
        const mapped = (res.data || []).map(item => {
          const total = item.TotalAnggaran || 0
          const real = item.RealisasiAnggaran || 0

          let katAnggaran = 'besar'
          if (total < 1000000) katAnggaran = 'mikro'
          else if (total <= 5000000) katAnggaran = 'kecil'
          else if (total <= 10000000) katAnggaran = 'menengah'

          let kinerja = 'pas'
          if (real < total) kinerja = 'hemat'
          else if (real > total) kinerja = 'over'

          return {
            ...item,
            KategoriAnggaran: katAnggaran,
            KinerjaRealisasi: kinerja,
            Efisiensi: total - real
          }
        })
        setData(mapped)
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
      OrmawaID: ormawaId || '',
      Status: row.Status || row.status || 'draft'
    })
    setIsCrudOpen(true)
  }

  const handleSave = async (e, statusOverride) => {
    if (e && e.preventDefault) e.preventDefault()
    setIsSubmitting(true)

    const url = isEditMode ? `${API}/lpjs/${form.ID}` : `${API}/lpjs`
    const method = isEditMode ? 'PUT' : 'POST'

    let targetStatus = 'draft'
    if (statusOverride) {
      targetStatus = statusOverride
    } else if (isEditMode) {
      targetStatus = form.Status || 'draft'
    }

    const payload = isEditMode
      ? {
        Status: targetStatus,
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
        Status: targetStatus
      }

    try {
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.status === 'success') {
        toast.success((isEditMode && targetStatus !== 'diajukan') ? 'LPJ berhasil diperbarui!' : 'Laporan Pertanggungjawaban berhasil diajukan!')
        setIsCrudOpen(false)
        fetchData()
      } else {
        toast.error(res.message || 'Gagal menyimpan Laporan LPJ')
      }
    } catch (err) {
      console.error(err); toast.error(err.message || 'Terjadi kesalahan koneksi backend')
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
      console.error(err); toast.error(err.message || 'Terjadi kesalahan koneksi backend')
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
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>assignment</span>
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-bold text-slate-900 text-[13px] font-headline tracking-tighter truncate">{v || '—'}</span>
            <span className="text-[10px] text-slate-500 font-bold tracking-tight mt-0.5 truncate flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>topic</span>
              {row.Proposal?.Judul || 'Laporan Pertanggungjawaban'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'TotalAnggaran',
      label: 'Total Anggaran',
      className: 'w-[140px]',
      render: v => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pagu Awal</span>
          <span className="font-bold text-slate-600 text-[12px] font-headline">{formatRp(v)}</span>
        </div>
      )
    },
    {
      key: 'RealisasiAnggaran',
      label: 'Realisasi Anggaran',
      className: 'w-[140px]',
      render: v => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Digunakan</span>
          <span className="font-black text-slate-900 text-[12px] font-headline">{formatRp(v)}</span>
        </div>
      )
    },
    {
      key: 'Efisiensi',
      label: 'Efisiensi / Status',
      className: 'w-[180px]',
      render: (v, row) => {
        const diff = (row.TotalAnggaran || 0) - (row.RealisasiAnggaran || 0)
        const pct = row.TotalAnggaran ? Math.round((diff / row.TotalAnggaran) * 100) : 0
        if (diff > 0) {
          return (
            <div className="flex flex-col gap-1 py-1">
              <span className="font-bold text-emerald-600 text-[12px] font-headline">+{formatRp(diff)}</span>
              <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider w-fit border border-emerald-100/50">
                <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>eco</span> HEMAT {pct}%
              </div>
            </div>
          )
        } else if (diff < 0) {
          return (
            <div className="flex flex-col gap-1 py-1">
              <span className="font-bold text-rose-600 text-[12px] font-headline">-{formatRp(Math.abs(diff))}</span>
              <div className="flex items-center gap-1 text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase tracking-wider w-fit border border-rose-100/50">
                <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>warning</span> OVER {Math.abs(pct)}%
              </div>
            </div>
          )
        } else {
          return (
            <div className="flex flex-col gap-1 py-1">
              <span className="font-bold text-slate-500 text-[12px] font-headline">Rp0</span>
              <div className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider w-fit border border-blue-100/50">
                <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>check_circle</span> 100% EFISIEN
              </div>
            </div>
          )
        }
      }
    },
    {
      key: 'TenggatLPJ',
      label: 'Tenggat LPJ',
      className: 'w-[140px]',
      render: (v, row) => {
        const val = row.Proposal?.tenggat_lpj || row.Proposal?.TenggatLPJ || v;
        if (!val) return <span className="text-[10px] text-slate-300 italic">—</span>
        const tenggat = new Date(val)
        const now = new Date()
        const diffDays = Math.ceil((tenggat - now) / (1000 * 60 * 60 * 24))
        const isLate = diffDays < 0
        const isUrgent = diffDays >= 0 && diffDays <= 3
        return (
          <div className="flex flex-col gap-1 py-1">
            <span className={cn('text-[11px] font-bold', isLate ? 'text-rose-600' : isUrgent ? 'text-amber-600' : 'text-slate-700')}>
              {tenggat.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
            </span>
            <div className={cn(
              "flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded w-fit border",
              isLate ? 'text-rose-600 bg-rose-50 border-rose-100/50' : isUrgent ? 'text-amber-600 bg-amber-50 border-amber-100/50' : 'text-emerald-600 bg-emerald-50 border-emerald-100/50'
            )}>
              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>
                {isLate ? 'error' : isUrgent ? 'schedule' : 'task_alt'}
              </span>
              {isLate ? `Telat ${Math.abs(diffDays)} hr` : isUrgent ? `Sisa ${diffDays} hr` : `${diffDays} hr lagi`}
            </div>
          </div>
        )
      }
    },
    {
      key: 'Status',
      label: 'Status LPJ',
      className: 'w-[150px] text-center',
      cellClassName: 'text-center',
      render: v => {
        const cfg = STATUS_CFG[v] || { label: v || 'Draft', cls: 'bg-slate-50 text-slate-600 border-border', icon: 'edit_document' }
        return (
          <Badge className={cn('inline-flex items-center justify-center gap-1 font-bold text-[10px] uppercase tracking-wider px-3 py-1 border rounded-full', cfg.cls)}>
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{cfg.icon}</span>
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
  const totalSavings = data.reduce((acc, curr) => {
    const diff = (curr.TotalAnggaran || 0) - (curr.RealisasiAnggaran || 0)
    return diff > 0 ? acc + diff : acc
  }, 0)

  return (
    <PageContent className="font-body">
      <Toaster position="top-right" />

      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <DashboardHero
        title="Laporan &"
        highlightedTitle="LPJ"
        subtitle="Kelola pertanggungjawaban kegiatan, realisasi anggaran, dan evaluasi kepengurusan."
        icon="task"
        badges={[{ label: 'Laporan Pertanggungjawaban', active: true }]}
        actions={
          <Button
            onClick={handleOpenAdd}
            className="h-11 px-6 rounded-xl bg-slate-900 text-white hover:bg-bku-primary shadow-xl shadow-slate-900/10 gap-3 transition-all active:scale-95 border-none group w-full sm:w-auto flex items-center justify-center font-headline"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_task</span>
            <span className="text-xs font-bold uppercase tracking-widest">BUAT LPJ BARU</span>
          </Button>
        }
      />

      {/* ── Statistics Summary Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
        <PrimaryStatsCard
          title="Total Laporan LPJ"
          value={data.length}
          icon={AssignmentTurnedInIcon}
          colorTheme="primary"
          badgeText="Total"
          badgeIcon={<span className="material-symbols-outlined text-[12px]">folder</span>}
        />

        <PrimaryStatsCard
          title="LPJ Disetujui"
          value={approvedLpjCount}
          icon={CheckCircleIcon}
          colorTheme="success"
          badgeText="Disetujui"
          badgeIcon={<span className="material-symbols-outlined text-[12px]">verified</span>}
        />

        <PrimaryStatsCard
          title="Diajukan & Revisi"
          value={pendingLpjCount}
          icon={PendingActionsIcon}
          colorTheme="warning"
          badgeText="Pending"
          badgeIcon={<span className="material-symbols-outlined text-[12px]">schedule</span>}
        />

        <PrimaryStatsCard
          title="Realisasi Anggaran"
          value={formatRp(totalRealisasi)}
          icon={PaymentsIcon}
          colorTheme="info"
          badgeText="Pengeluaran"
          badgeIcon={<span className="material-symbols-outlined text-[12px]">receipt_long</span>}
        />

        <PrimaryStatsCard
          title="Sisa Saldo Efisiensi"
          value={formatRp(totalSavings)}
          icon={SavingsIcon}
          colorTheme="primary"
          badgeText="Hemat"
          badgeIcon={<span className="material-symbols-outlined text-[12px]">eco</span>}
        />
      </div>

      {/* ── LPJ DataTable Container ─────────────────────────────────── */}
      <Card className="glass-card shadow-sm rounded-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500 delay-300 mb-6">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            searchPlaceholder="Cari berdasarkan nama kegiatan atau proposal..."
            filters={[
              {
                key: 'Status',
                placeholder: 'Status LPJ',
                options: Object.entries(STATUS_CFG).map(([v, { label }]) => ({ label, value: v }))
              },
              {
                key: 'KategoriAnggaran',
                placeholder: 'Skala Anggaran',
                options: [
                  { label: 'Mikro (< Rp 1jt)', value: 'mikro' },
                  { label: 'Kecil (Rp 1jt - 5jt)', value: 'kecil' },
                  { label: 'Menengah (Rp 5jt - 10jt)', value: 'menengah' },
                  { label: 'Besar (> Rp 10jt)', value: 'besar' }
                ]
              },
              {
                key: 'KinerjaRealisasi',
                placeholder: 'Kinerja Realisasi',
                options: [
                  { label: 'Hemat (Efisien)', value: 'hemat' },
                  { label: 'Pas Pagu (100%)', value: 'pas' },
                  { label: 'Over Budget', value: 'over' }
                ]
              }
            ]}
            actions={(row) => (
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => { setSelected(row); setIsDetailOpen(true) }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[var(--theme-text-subtle)] hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] rounded-xl active:scale-95 transition-all"
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

      <DialogModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        title={selected?.Judul || 'Detail LPJ'}
        subtitle={`ID Laporan: LPJ-${selected?.ID}`}
        icon="description"
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <ModalCancelButton onClick={() => setIsDetailOpen(false)}>TUTUP</ModalCancelButton>
            <Button
              variant="primary"
              onClick={() => {
                setIsDetailOpen(false)
                handleOpenEdit(selected)
              }}
              className="h-11 px-6 sm:px-8 rounded-xl bg-primary text-white hover:bg-primary/95 shadow-lg active:scale-95 transition-all border-none font-black text-[11px] uppercase tracking-[0.1em] flex items-center justify-center cursor-pointer hover:-translate-y-0.5"
            >
              EDIT LAPORAN
            </Button>
          </div>
        }
      >
        {selected && (
              <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar">
                <div className="flex justify-end -mt-4 mb-2">
                  <Badge className={cn('font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 border shrink-0 rounded-full', STATUS_CFG[selected.Status]?.cls || 'bg-slate-50 text-slate-600 border-border')}>
                    {STATUS_CFG[selected.Status]?.label || selected.Status || 'Draft'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase font-headline">Total Anggaran Proposal</p>
                    <p className="text-base font-black text-slate-800 tracking-tight">{formatRp(selected.TotalAnggaran)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase font-headline">Realisasi Pengeluaran LPJ</p>
                    <p className="text-base font-black text-emerald-600 tracking-tight">{formatRp(selected.RealisasiAnggaran)}</p>
                  </div>
                </div>

                {/* 🌟 Advanced Budget Utilization Progress Bar Analysis */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3.5">
                  <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Analisis Efisiensi Anggaran</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Penyerapan Anggaran</span>
                      <span>{selected.TotalAnggaran ? Math.round((selected.RealisasiAnggaran / selected.TotalAnggaran) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          selected.RealisasiAnggaran > selected.TotalAnggaran ? "bg-rose-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${selected.TotalAnggaran ? Math.min(100, (selected.RealisasiAnggaran / selected.TotalAnggaran) * 100) : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9.5px] font-bold mt-1">
                      {selected.RealisasiAnggaran > selected.TotalAnggaran ? (
                        <span className="text-rose-600 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">warning</span> BENGKAK {Math.round((selected.RealisasiAnggaran / selected.TotalAnggaran) * 100) - 100}% DARI PAGU</span>
                      ) : (
                        <span className="text-emerald-600 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">lightbulb</span> EFISIEN / SISA: {formatRp(selected.TotalAnggaran - selected.RealisasiAnggaran)} ({100 - Math.round((selected.RealisasiAnggaran / selected.TotalAnggaran) * 100)}% Hemat)</span>
                      )}
                    </div>
                  </div>
                </div>

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
              </div>

        )}
      </DialogModal>
      <DialogModal
        open={isCrudOpen}
        onOpenChange={setIsCrudOpen}
        title={isEditMode ? 'Edit Laporan LPJ' : 'Buat Laporan LPJ Baru'}
        subtitle="Lengkapi data laporan dan catat realisasi pengeluaran."
        icon="assignment_turned_in"
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <ModalCancelButton onClick={() => setIsCrudOpen(false)} />
            {(!isEditMode || form.Status === 'draft' || form.Status === 'revisi') ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={(e) => handleSave(e, 'draft')}
                  className="h-11 px-6 sm:px-8 rounded-xl text-slate-700 font-black text-[11px] uppercase tracking-[0.1em] transition-all duration-300 flex items-center justify-center cursor-pointer shadow-none hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 border-none"
                  style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
                >
                  SIMPAN DRAFT
                </Button>
                <ModalSaveButton loading={isSubmitting} onClick={(e) => handleSave(e, 'diajukan')}>
                  KIRIM LAPORAN
                </ModalSaveButton>
              </>
            ) : (
              <ModalSaveButton loading={isSubmitting} onClick={(e) => handleSave(e, form.Status)}>
                SIMPAN PERUBAHAN
              </ModalSaveButton>
            )}
          </div>
        }
      >
        <form id="lpj-form" onSubmit={handleSave} className="flex flex-col">
            <div className="p-6 space-y-5 max-h-[50vh] overflow-y-auto no-scrollbar">
              {/* Proposal Selection (only editable in creation mode) */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Tautkan Proposal Kegiatan</Label>
                {isEditMode ? (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-xs text-slate-500">
                    {proposals.find(p => String(p.ID) === String(form.ProposalID))?.Judul || 'Proposal Terpilih'}
                  </div>
                ) : (
                  <SelectField
                    value={form.ProposalID}
                    onValueChange={handleProposalChange}
                    placeholder="-- Pilih Proposal Acuan --"
                  >
                    {proposals.map(p => (
                      <SelectOption key={p.ID} value={String(p.ID)}>
                        {p.Judul} (Pagu: {formatRp(p.Anggaran)})
                      </SelectOption>
                    ))}
                  </SelectField>
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
                  className="h-12 rounded-2xl border-border bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm"
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
                      className="h-12 pl-10 rounded-2xl border-border bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm"
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
                      className="h-12 pl-10 rounded-2xl border-border bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm"
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
                  className="min-h-[100px] rounded-2xl border-border bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-semibold text-xs leading-relaxed p-4"
                />
              </div>
            </div>
          </form>
      </DialogModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Laporan LPJ?"
        description="Apakah Anda yakin ingin menghapus data Laporan Pertanggungjawaban ini? Tindakan ini bersifat permanen."
        loading={isSubmitting}
      />
    </PageContent>
  )
}

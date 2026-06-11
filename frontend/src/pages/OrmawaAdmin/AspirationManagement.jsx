"use client"
import React, { useState, useEffect } from 'react';
import { PageContent } from '@/components/ui/page';
import { DashboardHero } from '@/components/ui/dashboard';

import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DialogModal, ModalCancelButton } from '@/components/ui/DialogModal'
import { PrimaryStatsCard } from '@/components/ui/StatsCard'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'


import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import { getOrmawaId } from '../../utils/getOrmawaId'

const API = `${API_BASE_URL}/ormawa`

const QuestionAnswerIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>question_answer</span>;
const MarkChatReadIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>mark_chat_read</span>;
const QuickreplyIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>quickreply</span>;
const TrendingUpIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>trending_up</span>;

export default function AspirationManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tanggapan, setTanggapan] = useState('')

  const ormawaId = getOrmawaId()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetchWithAuth(`${API}/aspirations?ormawaId=${ormawaId}`)
      if (res.status === 'success') {
        setData(res.data || [])
      } else {
        toast.error('Gagal memuat aspirasi')
      }
    } catch (err) {
      toast.error('Koneksi ke database backend gagal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [ormawaId])

  const handleTanggapi = async () => {
    if (!tanggapan.trim()) {
      toast.error('Isi tanggapan terlebih dahulu')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetchWithAuth(`${API}/aspirations/${selected?.id || selected?.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Tanggapan: tanggapan, Status: 'ditanggapi' })
      })
      if (res.status === 'success') {
        toast.success('Tanggapan resmi berhasil dikirim!')
        setIsDetailOpen(false)
        setTanggapan('')
        fetchData()
      } else {
        toast.error(res.message || 'Gagal mengirim tanggapan')
      }
    } catch (err) {
      toast.error('Koneksi ke backend gagal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'Judul',
      label: 'Topik Aspirasi',
      className: 'min-w-[280px]',
      render: (v, row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>forum</span>
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-bold text-slate-900 text-[13px] font-headline tracking-tighter truncate">{v || '—'}</span>
            <span className="text-[10px] text-slate-500 font-bold tracking-tight mt-0.5 truncate flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>group</span>
              {row.OrmawaNama || 'Organisasi Mahasiswa'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'Status',
      label: 'Status',
      className: 'w-[150px] text-center',
      cellClassName: 'text-center',
      render: v => {
        const isDitanggapi = v === 'ditanggapi'
        return (
          <Badge className={cn(
            'inline-flex items-center justify-center gap-1 font-bold text-[10px] uppercase tracking-wider px-3 py-1 border rounded-full',
            isDitanggapi 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          )}>
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
              {isDitanggapi ? 'mark_chat_read' : 'quickreply'}
            </span>
            {isDitanggapi ? 'Ditanggapi' : 'Menunggu'}
          </Badge>
        )
      }
    },
    {
      key: 'CreatedAt',
      label: 'Tanggal Dikirim',
      className: 'w-[160px]',
      render: v => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Masuk Pada</span>
          <span className="font-bold text-slate-700 text-[12px] font-headline">
            {v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </span>
        </div>
      )
    }
  ]

  // Calculated Stats
  const totalAspirasi = data.length
  const answeredAspirasi = data.filter(x => x.Status === 'ditanggapi').length
  const pendingAspirasi = data.filter(x => x.Status === 'pending' || !x.Status).length
  const responseRatio = totalAspirasi > 0 ? Math.round((answeredAspirasi / totalAspirasi) * 100) : 0

  return (
    <PageContent className="font-body">
      <Toaster position="top-right" />

      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <DashboardHero
        title="Aspirasi"
        highlightedTitle="Organisasi"
        subtitle="Kelola semua aspirasi, kritik, dan saran dari mahasiswa untuk pengembangan Ormawa yang lebih baik."
        icon="forum"
        badges={[
          { label: 'Pusat Aspirasi', active: true }
        ]}
      />

      {/* ── Statistics Summary Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <PrimaryStatsCard
          title="Total Aspirasi Masuk"
          value={totalAspirasi}
          icon={QuestionAnswerIcon}
          colorTheme="primary"
          badgeText="Semua"
          badgeIcon={<span className="material-symbols-outlined text-[12px]">forum</span>}
        />

        <PrimaryStatsCard
          title="Sudah Ditanggapi"
          value={answeredAspirasi}
          icon={MarkChatReadIcon}
          colorTheme="success"
          badgeText="Selesai"
          badgeIcon={<span className="material-symbols-outlined text-[12px]">verified</span>}
        />

        <PrimaryStatsCard
          title="Menunggu Tanggapan"
          value={pendingAspirasi}
          icon={QuickreplyIcon}
          colorTheme="warning"
          badgeText="Pending"
          badgeIcon={<span className="material-symbols-outlined text-[12px]">schedule</span>}
        />

        <PrimaryStatsCard
          title="Rasio Respon"
          value={`${responseRatio}%`}
          icon={TrendingUpIcon}
          colorTheme="info"
          badgeText="Performa"
          badgeIcon={<span className="material-symbols-outlined text-[12px]">analytics</span>}
        />
      </div>

      {/* ── DataTable Container ──────────────────────────────────────── */}
      <div className="glass-card mb-8 animate-in slide-in-from-bottom-4 duration-500 fade-in border border-white/20 overflow-hidden">
        <div className="p-0">
          <DataTable
            containerClassName="border-0 shadow-none rounded-none"
            columns={columns} 
            data={data} 
            loading={loading}
            searchPlaceholder="Cari topik atau konten aspirasi..."
            filters={[
              { 
                key: 'Status', 
                placeholder: 'Filter Status', 
                options: [
                  { label: 'Menunggu', value: 'pending' }, 
                  { label: 'Ditanggapi', value: 'ditanggapi' }
                ] 
              }
            ]}
            actions={(row) => (
              <Button 
                onClick={() => { setSelected(row); setTanggapan(''); setIsDetailOpen(true) }} 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-[var(--theme-text-subtle)] hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] rounded-xl active:scale-95 transition-all"
                title="Lihat Detail & Tanggapi"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
              </Button>
            )}
          />
        </div>
      </div>

      <DialogModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        title={selected ? selected.Judul : 'Detail Aspirasi'}
        subtitle={selected ? `ASP-${selected.id || selected.ID} • ${selected.Status === 'ditanggapi' ? 'DITANGGAPI' : 'MENUNGGU'}` : 'Detail'}
        icon="forum"
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <ModalCancelButton onClick={() => setIsDetailOpen(false)}>TUTUP</ModalCancelButton>
            {!selected?.Tanggapan && (
              <Button 
                onClick={handleTanggapi}
                disabled={isSubmitting}
                className="h-11 px-6 sm:px-8 rounded-xl bg-[var(--theme-primary)] text-white hover:opacity-90 shadow-lg active:translate-y-0 transition-all border-none font-black text-[11px] uppercase tracking-[0.1em] flex items-center justify-center cursor-pointer hover:-translate-y-0.5"
              >
                {isSubmitting ? 'MENGIRIM...' : 'KIRIM TANGGAPAN RESMI'}
              </Button>
            )}
          </div>
        }
      >
        {selected && (
          <div className="flex flex-col">
              <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar">
                {/* Content Box */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Konten & Uraian Aspirasi</Label>
                  <div className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    {selected.Isi || selected.Konten || '—'}
                  </div>
                </div>

                {/* Response / Tanggapan Box */}
                {selected.Tanggapan ? (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <Label className="text-[10px] font-black text-emerald-600 tracking-[0.2em] ml-1 uppercase font-headline flex items-center gap-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>check_circle</span>
                      Tanggapan Resmi Pengurus
                    </Label>
                    <div className="text-sm font-medium text-slate-600 leading-relaxed bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                      {selected.Tanggapan}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 pt-2">
                    <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Berikan Balasan / Tanggapan Resmi</Label>
                    <Textarea 
                      rows={3} 
                      value={tanggapan} 
                      onChange={e => setTanggapan(e.target.value)}
                      placeholder="Ketik tanggapan atau resolusi resmi dari pengurus organisasi..."
                      className="min-h-[100px] rounded-xl border border-border bg-slate-50/50 focus:bg-white focus:ring-primary/20 focus:outline-none focus:border-primary shadow-none transition-all font-semibold text-xs leading-relaxed p-4" 
                    />

                  </div>
                )}
              </div>
          </div>
        )}
      </DialogModal>
    </PageContent>
  )
}

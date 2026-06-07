"use client"
import React, { useState, useEffect } from 'react';
import { PageContent, PageHeader } from '@/components/ui/page';



import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { Card, CardContent } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'


import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import { getOrmawaId } from '../../utils/getOrmawaId'

const API = `${API_BASE_URL}/ormawa`

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
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-slate-900 text-[13px] font-headline tracking-tighter">{v || '—'}</span>
          <span className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5">{row.OrmawaNama || 'Organisasi Mahasiswa'}</span>
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
            'font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 border rounded-full',
            isDitanggapi 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          )}>
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
        <span className="font-bold text-slate-400 text-[11px] font-headline">
          {v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
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
      <PageHeader 
        title="Aspirasi Organisasi"
        subtitle="Tampung gagasan, kritik, dan berikan tanggapan resmi atas aspirasi dari mahasiswa."
        icon="forum"
       
        breadcrumbs={[ { label: 'Dashboard', path: '/ormawa' }, { label: 'Aspirasi Organisasi', path: '#' } ]} 
      />

      {/* ── Statistics Summary Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Aspirasi */}
        <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-surface hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-2xl bg-[var(--theme-primary-light)] flex items-center justify-center text-[var(--theme-primary)]">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>question_answer</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-[var(--theme-text-muted)] tracking-wider uppercase font-headline">Total Aspirasi Masuk</p>
              <p className="text-2xl font-black text-[var(--theme-text)] tracking-tight font-headline">{totalAspirasi}</p>
            </div>
          </CardContent>
        </Card>

        {/* Ditanggapi */}
        <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-surface hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>mark_chat_read</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-[var(--theme-text-muted)] tracking-wider uppercase font-headline">Sudah Ditanggapi</p>
              <p className="text-2xl font-black text-[var(--theme-text)] tracking-tight font-headline">{answeredAspirasi}</p>
            </div>
          </CardContent>
        </Card>

        {/* Menunggu */}
        <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-surface hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>quickreply</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-[var(--theme-text-muted)] tracking-wider uppercase font-headline">Menunggu Tanggapan</p>
              <p className="text-2xl font-black text-[var(--theme-text)] tracking-tight font-headline">{pendingAspirasi}</p>
            </div>
          </CardContent>
        </Card>

        {/* Rasio Respon */}
        <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-surface hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>trending_up</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-[var(--theme-text-muted)] tracking-wider uppercase font-headline">Rasio Respon</p>
              <p className="text-2xl font-black text-[var(--theme-text)] tracking-tight font-headline">{responseRatio}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── DataTable Container ──────────────────────────────────────── */}
      <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-surface">
        <CardContent className="p-6">
          <DataTable
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
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border border-border shadow-2xl rounded-2xl bg-surface animate-in zoom-in-95 duration-200">
          {selected && (
            <div>
              {/* Header Gradient */}
              <div className="p-8 bg-[var(--theme-primary)] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06)_0%,transparent_50%)]" />
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined size-24 text-white">chat</span>
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-blue-200 tracking-[0.2em] uppercase font-headline">Aspirasi ID: ASP-{selected.id || selected.ID}</p>
                      <h2 className="text-xl font-black font-headline tracking-tighter leading-tight">{selected.Judul}</h2>
                    </div>
                    <Badge className={cn(
                      'font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 border shrink-0 rounded-full',
                      selected.Status === 'ditanggapi' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                    )}>
                      {selected.Status === 'ditanggapi' ? 'Ditanggapi' : 'Menunggu'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Dialog Content Grid */}
              <div className="p-8 space-y-5">
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
                      className="min-h-[100px] rounded-xl border border-border bg-[var(--theme-bg)] focus:bg-white focus:ring-[var(--theme-primary-light)] focus:outline-none focus:border-[var(--theme-primary)] shadow-none transition-all font-semibold text-xs leading-relaxed p-4" 
                    />

                    <Button 
                      disabled={isSubmitting} 
                      onClick={handleTanggapi} 
                      className="w-full h-12 rounded-2xl bg-primary text-white hover:bg-primary/95 shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                    >
                      {isSubmitting ? (
                        <span className="material-symbols-outlined animate-spin size-4" style={{ fontSize: '16px' }}>sync</span>
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                      )}
                      <span className="text-[10px] font-black tracking-widest uppercase">KIRIM TANGGAPAN RESMI</span>
                    </Button>
                  </div>
                )}

                {/* Footer close button */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsDetailOpen(false)} 
                    className="text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl active:scale-95 transition-all"
                  >
                    TUTUP DIALOG
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContent>
  )
}

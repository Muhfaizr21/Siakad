"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { DataTable } from "./components/data-table"
import {
  Plus,
  CheckCircle2,
  XCircle,
  Calendar,
  Wallet,
  FileText,
  Activity,
  Clock,
  Loader2,
  Save,
  ShieldCheck
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/dialog"
import { Label } from "./components/label"
import { Textarea } from "./components/textarea"
import { toast, Toaster } from "react-hot-toast"

export default function FacultyInternalProposals() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewForm, setReviewForm] = useState({ status: '', notes: '' })

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get('http://localhost:8000/api/faculty/internal/proposals')
      if (res.data.status === 'success') {
        setData(res.data.data)
      }
    } catch {
      toast.error("Gagal mengambil data proposal internal")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleOpenReview = (row) => {
    setSelectedProposal(row)
    setReviewForm({ status: row.status, notes: row.catatan_reviewer || '' })
    setIsReviewOpen(true)
  }

  const handleSaveReview = async () => {
    setIsSubmitting(true)
    try {
      const res = await axios.put(`http://localhost:8000/api/faculty/internal/proposals/${selectedProposal.ID}`, {
        Status: reviewForm.status,
        catatan_reviewer: reviewForm.notes
      })
      if (res.data.status === 'success') {
        toast.success("Persetujuan anggaran berhasil diperbarui")
        setIsReviewOpen(false)
        fetchData()
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal menyimpan perubahan"
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: "Judul",
      label: "Unit Kerja / Kegiatan",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{val}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{row.Deskripsi?.substring(0, 30)}...</span>
        </div>
      )
    },
    {
      key: "CreatedAt",
      label: "Tanggal Pengajuan",
      render: (val) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 font-headline">
          <Calendar className="size-3 text-primary opacity-60" />
          {val ? new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
        </div>
      )
    },
    {
      key: "Anggaran",
      label: "Pagu Anggaran",
      render: (val) => <span className="font-black text-emerald-600 text-[13px] tabular-nums font-headline tracking-tighter">{formatIDR(val)}</span>
    },
    {
      key: "Status",
      label: "Status",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => (
        <Badge variant={val?.toLowerCase() === 'disetujui' ? 'success' : val?.toLowerCase() === 'diajukan' ? 'warning' : 'destructive'} className="capitalize font-black text-[9px] px-3">
          {val}
        </Badge>
      )
    }
  ]

  const statsData = [
    { label: 'Total Pengajuan', value: data.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Anggaran Berjalan', value: formatIDR(data.reduce((acc, p) => acc + p.anggaran, 0)), icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { label: 'Disetujui Dekanat', value: data.filter(p => p.status === 'disetujui').length, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500/10 to-indigo-500/5' },
    { label: 'Menunggu Review', value: data.filter(p => p.status === 'diajukan').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5' },
  ]

  return (
    <PageContainer>
      <Toaster position="top-right" />

      <PageHeader
        icon={FileText}
        title="Proposal Fakultas"
        description="Tinjau & Validasi Penggunaan Dana Internal Unit Kerja"
      >
        <Button
          className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-6 shadow-xl shadow-primary/20 flex items-center gap-2 group transition-all duration-300 active:scale-95 border-none font-headline"
        >
          <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-90 transition-transform duration-500">
            <Plus className="size-4" />
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest">Ajukan Baru</span>
        </Button>
      </PageHeader>

      <ResponsiveGrid cols={3}>
        {[
          { label: 'Total Pengajuan Anggaran', value: formatIDR(data.reduce((acc, p) => acc + (p.Anggaran || 0), 0)), icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500/10 to-indigo-500/5' },
          { label: 'Proposal Menunggu', value: data.filter(p => p.Status?.toLowerCase() === 'diajukan').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5' },
          { label: 'Disetujui Dekanat', value: data.filter(p => p.Status?.toLowerCase() === 'disetujui').length, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
        ].map((stat, i) => (
          <ResponsiveCard key={i} className="relative group p-0 min-h-[140px]">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
            <div className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="size-5" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest leading-none">
                  <Activity className="size-2.5" />
                  Live
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 font-headline">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className={`${stat.label.includes('Anggaran') ? 'text-xl' : 'text-3xl'} font-black text-slate-900 font-headline tracking-tighter uppercase whitespace-nowrap`}>
                    {loading ? "..." : stat.value}
                  </h3>
                </div>
              </div>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      <ResponsiveCard noPadding>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchPlaceholder="Cari Unit atau Kegiatan..."
          onSync={fetchData}
          filters={[
            {
              key: 'Status',
              placeholder: 'Filter Status',
              options: [
                { label: 'Diajukan', value: 'diajukan' },
                { label: 'Disetujui', value: 'disetujui' },
                { label: 'Ditolak', value: 'ditolak' },
              ]
            }
          ]}
          actions={(row) => (
            <div className="flex items-center justify-end pr-2">
              <Button
                onClick={() => handleOpenReview(row)}
                variant="outline"
                className="h-9 px-4 rounded-xl border-slate-200 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group shadow-sm bg-white"
              >
                <ShieldCheck className="size-3.5 transition-transform group-hover:scale-110" />
                Review
              </Button>
            </div>
          )}
        />
      </ResponsiveCard>

      {/* REVIEW DIALOG */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Wallet className="size-24 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                  <ShieldCheck className="size-4" />
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none font-headline">
                  Fakultas Finance & Compliance
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                Keputusan Anggaran
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1 uppercase font-headline">
                Validasi pengajuan dana berdasarkan kebutuhan mendesak & ketersediaan pagi.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-8 pt-6 space-y-6">
            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 relative group overflow-hidden shadow-inner font-headline">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Identitas Kegiatan</p>
                  <h4 className="font-bold text-slate-900 font-headline text-lg tracking-tight leading-snug uppercase">{selectedProposal?.Judul}</h4>
                  <p className="text-[10px] font-bold text-primary font-headline tracking-tighter uppercase italic">"{selectedProposal?.Deskripsi?.substring(0, 50)}..."</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Nominal Pagu</p>
                  <p className="text-2xl font-black text-emerald-600 font-headline tracking-tighter leading-none">{formatIDR(selectedProposal?.Anggaran || 0)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Keputusan Akhir</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['disetujui', 'ditolak'].map((s) => (
                    <div
                      key={s}
                      onClick={() => setReviewForm({ ...reviewForm, status: s })}
                      className={`flex items-center justify-center h-14 rounded-2xl border text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all font-headline ${reviewForm.status === s
                          ? (s === 'disetujui' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-500/20 scale-[1.02]' : 'bg-rose-600 border-rose-600 text-white shadow-xl shadow-rose-500/20 scale-[1.02]')
                          : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                        }`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Observasi Reviewer</Label>
                <Textarea
                  value={reviewForm.notes}
                  onChange={e => setReviewForm({ ...reviewForm, notes: e.target.value })}
                  className="min-h-[100px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-black text-[11px] p-4 leading-relaxed uppercase"
                  placeholder="Berikan catatan tambahan untuk unit pengaju atau alasan penolakan anggaran..."
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30 rounded-b-[2rem]">
              <button onClick={() => setIsReviewOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl font-headline transition-all border-none bg-transparent cursor-pointer font-headline">
                Batalkan
              </button>
              <Button onClick={handleSaveReview} disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 border-none font-headline">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-3" /> : <Save className="size-4 mr-3 stroke-[3px]" />}
                <span className="text-[10px] font-black uppercase tracking-[0.15em] font-headline">Authorize Budget</span>
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>

  )
}

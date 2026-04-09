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
      const res = await axios.put(`http://localhost:8000/api/faculty/internal/proposals/${selectedProposal.id}`, {
        status: reviewForm.status,
        catatan_reviewer: reviewForm.notes
      })
      if (res.data.status === 'success') {
        toast.success("Persetujuan anggaran berhasil diperbarui")
        setIsReviewOpen(false)
        fetchData()
      }
    } catch {
      toast.error("Gagal menyimpan perubahan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: "judul",
      label: "Unit Kerja / Kegiatan",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{val}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{row.deskripsi?.substring(0, 30)}...</span>
        </div>
      )
    },
    {
      key: "created_at",
      label: "Tanggal Pengajuan",
      render: (val) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 font-headline">
          <Calendar className="size-3 text-primary opacity-60" />
          {new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    {
      key: "anggaran",
      label: "Pagu Anggaran",
      render: (val) => <span className="font-black text-emerald-600 text-[13px] tabular-nums font-headline tracking-tighter">{formatIDR(val)}</span>
    },
    {
      key: "status",
      label: "Status",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => (
        <Badge variant={val === 'disetujui' ? 'success' : val === 'diajukan' ? 'warning' : 'destructive'} className="capitalize font-black text-[9px] px-3">
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
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pt-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <FileText className="size-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Proposal Fakultas</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tinjau & Validasi Penggunaan Dana Internal Unit Kerja</p>
          </div>
        </div>

        <Button
          className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 py-6 shadow-lg shadow-primary/20 flex items-center gap-2 group transition-all duration-300 active:scale-95"
        >
          <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-90 transition-transform duration-500">
            <Plus className="size-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">Ajukan Proposal Baru</span>
        </Button>
      </div>


      {/* MAIN TABLE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {[
          { label: 'Total Pengajuan Anggaran', value: formatIDR(data.reduce((acc, p) => acc + (p.anggaran || 0), 0)), icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Proposal Menunggu', value: data.filter(p => p.status === 'diajukan').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Disetujui Dekanat', value: data.filter(p => p.status === 'disetujui').length, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden relative group">
            <CardContent className="p-6 relative">
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
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{stat.label}</p>
                <h3 className={`${stat.label.includes('Anggaran') ? 'text-xl' : 'text-3xl'} font-black text-slate-900 font-headline tracking-tighter`}>
                  {loading ? "..." : stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-slate-200 shadow-sm mt-4 overflow-hidden rounded-2xl bg-white/50 backdrop-blur-md">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            searchPlaceholder="Cari Unit atau Kegiatan..."
            actions={(row) => (
              <Button
                onClick={() => handleOpenReview(row)}
                variant="ghost"
                className="h-9 px-4 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-[10px] font-black uppercase tracking-widest"
              >
                Review Anggaran
              </Button>
            )}
          />
        </CardContent>
      </Card>

      {/* REVIEW DIALOG */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Wallet className="size-24 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                  <ShieldCheck className="size-4" />
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">
                  Fakultas Finance & Compliance
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                Keputusan Anggaran
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">
                Validasi pengajuan dana berdasarkan kebutuhan mendesak & ketersediaan pagi.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-8 pt-6 space-y-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Identitas Kegiatan</p>
                  <h4 className="font-bold text-slate-900 font-headline text-lg tracking-tight leading-snug">{selectedProposal?.judul}</h4>
                  <p className="text-xs font-bold text-primary font-headline tracking-tighter uppercase">{selectedProposal?.deskripsi?.substring(0, 50)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Nominal</p>
                  <p className="text-2xl font-black text-emerald-600 font-headline tracking-tighter leading-none">{formatIDR(selectedProposal?.anggaran || 0)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keputusan Akhir</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['disetujui', 'ditolak'].map((s) => (
                    <div
                      key={s}
                      onClick={() => setReviewForm({ ...reviewForm, status: s })}
                      className={`flex items-center justify-center h-14 rounded-2xl border text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${reviewForm.status === s
                          ? (s === 'disetujui' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-500/20')
                          : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                        }`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observasi Reviewer</Label>
                <Textarea
                  value={reviewForm.notes}
                  onChange={e => setReviewForm({ ...reviewForm, notes: e.target.value })}
                  className="min-h-[100px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium text-sm p-4 leading-relaxed"
                  placeholder="Berikan catatan tambahan untuk unit pengaju..."
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30">
              <button onClick={() => setIsReviewOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl transition-all">
                Batalkan
              </button>
              <Button onClick={handleSaveReview} disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-3" /> : <Save className="size-4 mr-3 stroke-[3px]" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Authorize Budget</span>
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

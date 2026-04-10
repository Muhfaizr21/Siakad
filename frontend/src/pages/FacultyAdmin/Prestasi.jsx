"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card"
import { CheckCircle2, XCircle, Eye, Calendar, Award, TrendingUp, User, AlertCircle, Trophy, GraduationCap, MapPin, Building, FileText, ExternalLink, ShieldCheck, Star, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./components/dialog"
import { Avatar, AvatarFallback } from "./components/avatar"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"

export default function FacultyPrestasi() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:8000/api/faculty/prestasi')
      const json = await res.json()
      if (json.status === "success") {
        setAchievements(json.data)
      }
    } catch (err) {
      toast.error("Gagal sinkronisasi data prestasi")
    } finally {
      setLoading(false)
    }
  }

  const handleValidation = async (id, status) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`http://localhost:8000/api/faculty/prestasi/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Status: status,
          Poin: status === 'verified' ? 5 : 0,
          Catatan: status === 'verified' ? 'Prestasi terverifikasi oleh fakultas.' : 'Berkas tidak sesuai kriteria.'
        })
      })
      const json = await res.json()
      if (json.status === 'success') {
        toast.success(status === 'verified' ? 'Prestasi disetujui' : 'Prestasi ditolak')
        setIsModalOpen(false)
        fetchData()
      } else {
        toast.error(`Gagal perbarui status: ${json.message || 'Error response'}`)
      }
    } catch (err) {
      const msg = status === 'verified' ? 'validasi' : 'penolakan'
      toast.error(`Sistem sibuk: Gagal melakukan ${msg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusConfig = (status) => {
    switch(status) {
      case 'verified': return { label: 'TERVERIFIKASI', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50', ring: 'ring-emerald-500/20', icon: <CheckCircle2 className="size-3.5" /> }
      case 'rejected': return { label: 'DITOLAK', color: 'bg-rose-500', textColor: 'text-rose-700', bgColor: 'bg-rose-50', ring: 'ring-rose-500/20', icon: <XCircle className="size-3.5" /> }
      default: return { label: 'MENUNGGU', color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50', ring: 'ring-amber-500/20', icon: <AlertCircle className="size-3.5" /> }
    }
  }

  const getTingkatColor = (tingkat) => {
    switch(tingkat?.toLowerCase()) {
      case 'internasional': return 'bg-violet-50 text-violet-700 ring-violet-200/60'
      case 'nasional': return 'bg-blue-50 text-blue-700 ring-blue-200/60'
      case 'regional': return 'bg-cyan-50 text-cyan-700 ring-cyan-200/60'
      default: return 'bg-slate-50 text-slate-600 ring-slate-200/60'
    }
  }

  const columns = [
    {
      key: "Mahasiswa",
      label: "Mahasiswa",
      render: (val) => (
        <div className="flex flex-col text-left leading-tight">
          <span className="font-bold text-slate-900 font-headline tracking-tighter uppercase text-[13px]">{val?.Nama || '-'}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{val?.NIM || '-'}</span>
        </div>
      )
    },
    {
      key: "NamaKegiatan",
      label: "Prestasi / Penghargaan",
      render: (val, row) => (
        <div className="flex flex-col text-left leading-tight">
          <span className="font-bold text-slate-800 text-[12px] font-headline uppercase tracking-tight">{val}</span>
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1 w-fit bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">{row.Kategori}</span>
        </div>
      ),
    },
    {
      key: "CreatedAt",
      label: "Tahun",
      render: (val) => (
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 font-headline uppercase">
          <Calendar className="size-3 text-slate-400" />
          {val ? new Date(val).getFullYear() : '-'}
        </div>
      )
    },
    {
      key: "Status",
      label: "Validasi",
      render: (val) => (
        <Badge
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline uppercase",
            val === 'verified' ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
              val === 'pending' ? "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20" :
                val === 'rejected' ? "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20" :
                  "bg-slate-100 text-slate-700 ring-1 ring-slate-500/20"
          )}
        >
          {val || 'PENDING'}
        </Badge>
      ),
    }
  ]

  const sel = selectedAchievement
  const statusCfg = sel ? getStatusConfig(sel.Status) : getStatusConfig()

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Award className="size-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">Validasi Prestasi</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Portal Verifikasi Capaian Mahasiswa</p>
        </div>
      </div>

      <Card className="border-none shadow-sm flex flex-col overflow-hidden bg-white/50 backdrop-blur-md rounded-3xl">
        <CardContent className="p-0 font-headline">
          <DataTable
            columns={columns}
            data={achievements}
            loading={loading}
            searchPlaceholder="Cari Nama atau Prestasi..."
            onSync={fetchData}
            onExport={() => alert("Ekspor Rekap Prestasi...")}
            exportLabel="Download Rekap"
            filters={[
              {
                key: 'Status',
                placeholder: 'Filter Status',
                options: [
                  { label: 'Disetujui', value: 'verified' },
                  { label: 'Menunggu', value: 'pending' },
                  { label: 'Ditolak', value: 'rejected' },
                ]
              }
            ]}
            actions={(row) => (
              <div className="flex items-center gap-2">
                <Button onClick={() => { setSelectedAchievement(row); setIsModalOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all">
                  <Eye className="size-4" />
                </Button>
                <Button onClick={() => handleValidation(row.ID, 'verified')} variant="ghost" size="icon" className="h-9 w-9 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all">
                  <CheckCircle2 className="size-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* ===== PREMIUM DETAIL + VERIFICATION DIALOG ===== */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl sm:left-[58%] p-0 overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white font-headline">
          {sel && (
            <div className="relative flex flex-col h-[88vh]">

              {/* ── HEADER HERO ── */}
              <div className="h-48 bg-slate-900 relative shrink-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)', backgroundSize: '16px 16px' }} />
                {/* Decorative trophy watermark */}
                <div className="absolute -right-6 -bottom-6 opacity-[0.04]">
                  <Trophy className="size-56 text-white" />
                </div>

                <div className="absolute inset-y-0 left-10 flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 rounded-2xl border-4 border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                      <AvatarFallback className="bg-white/10 backdrop-blur-xl text-white text-2xl font-black rounded-2xl border border-white/10">
                        {sel.Mahasiswa?.Nama?.split(" ")?.map(n => n[0]).join("")?.substring(0, 2) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("absolute -bottom-1.5 -right-1.5 size-8 rounded-xl border-2 border-slate-900 flex items-center justify-center text-white shadow-lg",
                      statusCfg.color
                    )}>
                      {statusCfg.icon}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 text-white">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="outline" className="text-[8px] font-black border-white/20 text-white/60 bg-white/5 px-2 py-0.5 rounded tracking-widest uppercase">
                        Achievement Record
                      </Badge>
                      <div className="h-3 w-px bg-white/10" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ID: {sel.ID?.toString().padStart(6, '0')}</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter leading-none uppercase drop-shadow-md">
                      {sel.Mahasiswa?.Nama || '-'}
                    </h2>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                        <GraduationCap className="size-3 text-white/50" />
                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-tight">{sel.Mahasiswa?.NIM || '-'}</span>
                      </div>
                      {sel.Mahasiswa?.ProgramStudi?.Nama && (
                        <>
                          <div className="size-1 rounded-full bg-white/20" />
                          <div className="flex items-center gap-1.5">
                            <Building className="size-3 text-white/40" />
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-tight">{sel.Mahasiswa.ProgramStudi.Nama}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10">
                  <X className="size-5" />
                </button>
              </div>

              {/* ── CONTENT AREA ── */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-10 space-y-8">

                  {/* Status Alert for Rejected */}
                  {sel.Status === 'rejected' && (
                    <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-4">
                      <div className="size-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                        <XCircle className="size-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-rose-700 uppercase tracking-widest mb-1">Pengajuan Ditolak</p>
                        <p className="text-[13px] font-bold text-rose-600/80 leading-relaxed">Berkas tidak sesuai kriteria verifikasi fakultas. Mahasiswa dapat mengajukan ulang dengan dokumen yang telah diperbaiki.</p>
                      </div>
                    </div>
                  )}

                  {/* ── DETAIL GRID ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* LEFT: Competition Details */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg transform -rotate-3 transition-transform hover:rotate-0">
                          <Trophy className="size-4" />
                        </div>
                        <h3 className="font-black text-[12px] uppercase tracking-[0.2em] text-slate-900">Detail Kompetisi</h3>
                      </div>

                      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-50">
                          <DetailRow label="Nama Kegiatan" value={sel.NamaKegiatan} primary />
                          <DetailRow label="Kategori" value={
                            <Badge className="bg-blue-50 text-blue-700 border-none font-black text-[10px] px-3 py-1 ring-1 ring-blue-200/50 uppercase tracking-widest">
                              {sel.Kategori || '-'}
                            </Badge>
                          } />
                          <DetailRow label="Tingkat" value={
                            <Badge className={cn("border-none font-black text-[10px] px-3 py-1 ring-1 uppercase tracking-widest", getTingkatColor(sel.Tingkat))}>
                              {sel.Tingkat || '-'}
                            </Badge>
                          } />
                          <DetailRow label="Peringkat" value={
                            <div className="flex items-center gap-2">
                              <Star className="size-4 text-amber-500 fill-amber-500" />
                              <span className="font-black text-slate-900 text-[14px] uppercase tracking-tight">{sel.Peringkat || '-'}</span>
                            </div>
                          } />

                          <DetailRow label="Tanggal Submit" value={
                            <div className="flex items-center gap-2">
                              <Calendar className="size-3.5 text-slate-400" />
                              <span className="font-bold text-slate-700 text-[12px]">
                                {sel.CreatedAt ? new Date(sel.CreatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                              </span>
                            </div>
                          } />
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Document & Status */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg transform rotate-3 transition-transform hover:rotate-0">
                          <FileText className="size-4" />
                        </div>
                        <h3 className="font-black text-[12px] uppercase tracking-[0.2em] text-slate-900">Dokumen & Status</h3>
                      </div>

                      {/* Status Card */}
                      <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Verifikasi</span>
                          <Badge className={cn("font-black text-[10px] px-4 py-1.5 border-none ring-1 uppercase tracking-widest", statusCfg.bgColor, statusCfg.textColor, statusCfg.ring)}>
                            {statusCfg.icon}
                            <span className="ml-1.5">{statusCfg.label}</span>
                          </Badge>
                        </div>

                        <div className="h-px bg-slate-100" />

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Record</span>
                          <span className="font-mono font-black text-[12px] text-primary tracking-widest">#{sel.ID?.toString().padStart(6, '0')}</span>
                        </div>
                      </div>

                      {/* Certificate / Evidence Card */}
                      <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 rounded-full bg-primary/40 shadow-sm" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bukti / Sertifikat</span>
                        </div>

                        {sel.BuktiURL ? (
                          <a
                            href={`http://localhost:8000${sel.BuktiURL}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/20 transition-all group cursor-pointer"
                          >
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                              <FileText className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-black text-primary uppercase tracking-tight">Lihat Dokumen Sertifikat</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">{sel.BuktiURL}</p>
                            </div>
                            <ExternalLink className="size-4 text-primary/40 group-hover:text-primary transition-colors shrink-0" />
                          </a>
                        ) : (
                          <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                              <FileText className="size-5" />
                            </div>
                            <div>
                              <p className="text-[12px] font-black text-slate-400 uppercase tracking-tight">Tidak Ada Lampiran</p>
                              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Mahasiswa belum mengupload bukti</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── FOOTER: Verification Actions ── */}
              <div className="h-24 px-10 flex items-center justify-between border-t border-slate-100 bg-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="size-5 rounded-lg bg-slate-900 flex items-center justify-center text-white scale-90">
                      <ShieldCheck className="size-3" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Faculty Verification</span>
                  </div>
                  <div className="h-4 w-px bg-slate-200" />
                  <Badge className={cn("font-black text-[9px] px-2.5 py-0.5 border-none uppercase tracking-widest", statusCfg.bgColor, statusCfg.textColor)}>
                    {statusCfg.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 h-12 px-6 rounded-2xl transition-all"
                  >
                    Tutup
                  </Button>
                  <Button
                    onClick={() => handleValidation(sel.ID, 'rejected')}
                    disabled={isSubmitting}
                    variant="outline"
                    className="h-12 px-8 rounded-2xl bg-white border-2 border-slate-100 text-slate-500 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all duration-300 font-headline active:scale-95"
                  >
                    <XCircle className="size-4 mr-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Tolak</span>
                  </Button>
                  <Button
                    onClick={() => handleValidation(sel.ID, 'verified')}
                    disabled={isSubmitting}
                    className="h-12 px-10 rounded-2xl bg-slate-950 text-white hover:bg-primary transition-all duration-300 font-headline active:scale-95 shadow-2xl shadow-slate-900/20"
                  >
                    <CheckCircle2 className="size-4 mr-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Validasi Prestasi</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}

// ── Helper Component ──
function DetailRow({ label, value, primary = false }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 group hover:bg-slate-50/50 transition-colors">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mr-4">{label}</span>
      <div className="text-right">
        {typeof value === 'string' ? (
          <span className={cn(
            "font-headline uppercase tracking-tight",
            primary ? "font-black text-slate-900 text-[14px]" : "font-bold text-slate-700 text-[12px]"
          )}>{value || '-'}</span>
        ) : value}
      </div>
    </div>
  )
}

"use client"

import React, { useState, useEffect, useMemo } from "react"
import { DataTable } from "./components/ui/data-table"
import { Badge } from "./components/ui/badge"
import { Button } from "./components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./components/ui/dialog"
import { Card, CardContent } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Textarea } from "./components/ui/textarea"
import { StatCard } from "./components/ui/stat-card"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { adminService, API_BASE_URL } from "../../services/api"

// Material Symbol Icons
const Trophy = ({ size = 20, className }) => <span className={cn("material-symbols-outlined shrink-0", className)} style={{ fontSize: size }}>emoji_events</span>
const Clock = ({ size = 20, className }) => <span className={cn("material-symbols-outlined shrink-0", className)} style={{ fontSize: size }}>schedule</span>
const CheckCircle2 = ({ size = 20, className }) => <span className={cn("material-symbols-outlined shrink-0", className)} style={{ fontSize: size }}>check_circle</span>
const CloseIcon = ({ size = 20, className }) => <span className={cn("material-symbols-outlined shrink-0", className)} style={{ fontSize: size }}>close</span>
const Star = ({ size = 16, className }) => <span className={cn("material-symbols-outlined shrink-0", className)} style={{ fontSize: size }}>star</span>
const Award = ({ size = 16, className }) => <span className={cn("material-symbols-outlined shrink-0", className)} style={{ fontSize: size }}>military_tech</span>
const Calendar = ({ size = 16, className }) => <span className={cn("material-symbols-outlined shrink-0", className)} style={{ fontSize: size }}>calendar_today</span>
const GraduationCap = ({ size = 16, className }) => <span className={cn("material-symbols-outlined shrink-0", className)} style={{ fontSize: size }}>school</span>
const RefreshCw = ({ size = 16, className, animate }) => <span className={cn("material-symbols-outlined shrink-0", animate && "animate-spin", className)} style={{ fontSize: size }}>sync</span>
const ExternalLink = ({ size = 16, className }) => <span className={cn("material-symbols-outlined shrink-0", className)} style={{ fontSize: size }}>open_in_new</span>
const Apartment = ({ size = 16, className }) => <span className={cn("material-symbols-outlined shrink-0", className)} style={{ fontSize: size }}>apartment</span>

const AVATAR_COLORS = [
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-sky-500",
]

const getInitials = (name = "") => {
  return name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "?"
}

const formatDate = (dateString) => {
  if (!dateString) return "—"
  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return dateString
  }
}

export default function KelolaPrestasi() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isVerifyOpen, setIsVerifyOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Verification Form State
  const [verifyStatus, setVerifyStatus] = useState("verified")
  const [verifyPoin, setVerifyPoin] = useState(5)
  const [verifyCatatan, setVerifyCatatan] = useState("")

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAllAchievements()
      if (res.status === "success") {
        setData((res.data || []).map((item, i) => ({
          ...item,
          colorIdx: i % AVATAR_COLORS.length
        })))
      } else {
        toast.error("Gagal memuat data prestasi")
      }
    } catch (err) {
      toast.error("Koneksi ke server gagal")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenVerify = (row, status) => {
    setSelected(row)
    setVerifyStatus(status)
    setVerifyPoin(status === "verified" ? 5 : 0)
    setVerifyCatatan(status === "verified" ? "Prestasi tervalidasi oleh Super Admin." : "Berkas tidak sesuai kriteria.")
    setIsVerifyOpen(true)
  }

  const handleVerifySubmit = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        Status: verifyStatus,
        Poin: parseInt(verifyPoin) || 0,
        Catatan: verifyCatatan
      }
      const res = await adminService.verifyAchievement(selected.id || selected.ID, payload)
      if (res.status === "success") {
        toast.success(verifyStatus === "verified" ? "Prestasi berhasil disetujui! ✅" : "Prestasi berhasil ditolak ❌")
        setIsVerifyOpen(false)
        setIsDetailOpen(false)
        fetchData()
      } else {
        toast.error(res.message || "Gagal memperbarui status verifikasi")
      }
    } catch {
      toast.error("Koneksi gagal saat menyimpan verifikasi")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Stats Calculations
  const stats = useMemo(() => {
    const total = data.length
    const pending = data.filter(item => (item.status || "").toLowerCase() === "menunggu").length
    const verified = data.filter(item => ["verified", "terverifikasi", "disetujui"].includes((item.status || "").toLowerCase())).length
    const totalPoin = data.reduce((acc, item) => acc + (item.poin || 0), 0)
    return { total, pending, verified, totalPoin }
  }, [data])

  const columns = [
    {
      key: "mahasiswa",
      label: "Mahasiswa",
      className: "min-w-[240px]",
      render: (v, row) => {
        const mhs = row.mahasiswa || {}
        const name = mhs.Nama || mhs.nama || "—"
        const nim = mhs.NIM || mhs.nim || "—"
        return (
          <div className="flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 shadow-sm", AVATAR_COLORS[row.colorIdx])}>
              {getInitials(name)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-neutral-900 text-[13px] font-jakarta leading-tight">{name}</span>
              <span className="text-[11px] text-neutral-400 font-medium">{nim}</span>
            </div>
          </div>
        )
      }
    },
    {
      key: "nama_kegiatan",
      label: "Prestasi / Penghargaan",
      className: "min-w-[200px]",
      render: (v, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-neutral-900 text-[13px] font-jakarta leading-tight truncate max-w-[220px]" title={row.nama_kegiatan}>
            {row.nama_kegiatan || "—"}
          </span>
          <span className="inline-block self-start mt-1 text-[9px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
            {row.kategori || "Umum"}
          </span>
        </div>
      )
    },
    {
      key: "tingkat",
      label: "Tingkat",
      className: "w-[120px] text-center",
      cellClassName: "text-center",
      render: (v) => {
        const tingkat = (v || "").toLowerCase()
        const styles = {
          internasional: "bg-violet-50 text-violet-700 border-violet-100",
          nasional: "bg-blue-50 text-blue-700 border-blue-100",
          regional: "bg-cyan-50 text-cyan-700 border-cyan-100",
        }
        return (
          <Badge className={cn("px-2.5 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider", styles[tingkat] || "bg-slate-50 text-slate-600 border-slate-100")}>
            {v || "Lokal"}
          </Badge>
        )
      }
    },
    {
      key: "status",
      label: "Status",
      className: "w-[140px] text-center",
      cellClassName: "text-center",
      render: (v) => {
        const status = (v || "").toLowerCase()
        const isVerified = ["verified", "terverifikasi", "disetujui"].includes(status)
        const isRejected = ["rejected", "ditolak"].includes(status)

        let cls = "bg-amber-50 text-amber-700 border-amber-100"
        let dot = "bg-amber-500"
        let label = "Menunggu"

        if (isVerified) {
          cls = "bg-emerald-50 text-emerald-700 border-emerald-100"
          dot = "bg-emerald-500"
          label = "Terverifikasi"
        } else if (isRejected) {
          cls = "bg-rose-50 text-rose-700 border-rose-100"
          dot = "bg-rose-500"
          label = "Ditolak"
        }

        return (
          <Badge className={cn("px-2.5 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider gap-1.5 inline-flex items-center", cls)}>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
            {label}
          </Badge>
        )
      }
    },
    {
      key: "poin",
      label: "Poin",
      className: "w-[90px] text-center",
      cellClassName: "text-center",
      render: (v) => <span className="font-bold text-neutral-900 text-[13px] font-jakarta">{v != null ? `${v} Pts` : "—"}</span>
    }
  ]

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />

      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl p-8 border border-neutral-100 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.08),transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
              backgroundSize: "60px 60px"
            }}
          />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 right-48 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-1.5 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Kemahasiswaan Portal</span>
              </div>
              <h1 className="text-3xl font-black text-white font-headline tracking-tight leading-tight">
                Kelola <span className="text-blue-400">Prestasi Mahasiswa</span>
              </h1>
              <p className="text-slate-400 font-medium text-xs max-w-xl leading-relaxed mt-1.5">
                Audit, verifikasi, dan validasi seluruh portofolio prestasi akademik/non-akademik mahasiswa serta berikan poin apresiasi secara dinamis.
              </p>
            </div>
            
            <div className="flex items-center gap-3 self-end md:self-auto">
              <Button onClick={fetchData} disabled={loading} variant="outline" className="h-10 px-5 rounded-xl border-neutral-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95 text-xs font-bold uppercase tracking-widest gap-2">
                <RefreshCw size={14} animate={loading} className="text-blue-400" />
                Refresh Data
              </Button>
            </div>
          </div>
        </section>

        {/* ── Stat Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Portofolio"
            value={stats.total}
            description="Prestasi terdaftar"
            icon={Trophy}
            color="text-indigo-600"
            bg="bg-indigo-50"
            loading={loading}
          />
          <StatCard
            title="Menunggu Review"
            value={stats.pending}
            description="Perlu tindakan verifikasi"
            icon={Clock}
            color="text-amber-600"
            bg="bg-amber-50"
            loading={loading}
          />
          <StatCard
            title="Terverifikasi"
            value={stats.verified}
            description="Disetujui universitas"
            icon={CheckCircle2}
            color="text-emerald-600"
            bg="bg-emerald-50"
            loading={loading}
          />
          <StatCard
            title="Apresiasi Poin"
            value={`${stats.totalPoin} Pts`}
            description="Total poin mahasiswa"
            icon={Award}
            color="text-violet-600"
            bg="bg-violet-50"
            loading={loading}
          />
        </div>

        {/* ── Data Table Section ───────────────────────────────────── */}
        <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={data}
              loading={loading}
              searchPlaceholder="Cari mahasiswa, judul kegiatan, kategori..."
              filters={[
                {
                  key: "status",
                  placeholder: "Status",
                  options: [
                    { label: "Menunggu", value: "Menunggu" },
                    { label: "Terverifikasi", value: "verified" },
                    { label: "Ditolak", value: "rejected" },
                  ]
                },
                {
                  key: "tingkat",
                  placeholder: "Tingkat",
                  options: [
                    { label: "Internasional", value: "internasional" },
                    { label: "Nasional", value: "nasional" },
                    { label: "Regional", value: "regional" },
                    { label: "Lokal", value: "lokal" },
                  ]
                }
              ]}
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => { setSelected(row); setIsDetailOpen(true) }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    title="Lihat Detail"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>visibility</span>
                  </Button>
                  {(row.status || "").toLowerCase() === "menunggu" && (
                    <>
                      <Button
                        onClick={() => handleOpenVerify(row, "verified")}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Setujui"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check_circle</span>
                      </Button>
                      <Button
                        onClick={() => handleOpenVerify(row, "rejected")}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Tolak"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>cancel</span>
                      </Button>
                    </>
                  )}
                </div>
              )}
            />
          </CardContent>
        </Card>

      </div>

      {/* ── Detail Modal ───────────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {selected && (
          <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white">
            <DialogHeader className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] pt-8 pb-7 px-8 overflow-hidden flex-shrink-0 text-white">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex items-center gap-4 mb-6">
                <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-white text-base font-black shadow-xl ring-4 ring-white/10", AVATAR_COLORS[selected.colorIdx])}>
                  {getInitials(selected.mahasiswa?.Nama || selected.mahasiswa?.nama)}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.25em] mb-1">Capaian Prestasi</p>
                  <DialogTitle className="text-lg font-black text-white leading-tight font-headline">{selected.nama_kegiatan}</DialogTitle>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    {selected.mahasiswa?.Nama || selected.mahasiswa?.nama} · NIM {selected.mahasiswa?.NIM || selected.mahasiswa?.nim}
                  </p>
                </div>
              </div>
              
              <div className="relative z-10 flex flex-wrap gap-2">
                {selected.kategori && (
                  <Badge className="bg-white/10 border border-white/20 px-3 py-1 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider gap-1.5">
                    <Award size={12} className="text-blue-400" />
                    {selected.kategori}
                  </Badge>
                )}
                {selected.tingkat && (
                  <Badge className="bg-white/10 border border-white/20 px-3 py-1 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider gap-1.5">
                    <Star size={12} className="text-amber-400" />
                    {selected.tingkat}
                  </Badge>
                )}
                <Badge className={cn("px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider gap-1.5 border border-white/10",
                  ["verified", "terverifikasi", "disetujui"].includes((selected.status || "").toLowerCase())
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : (selected.status || "").toLowerCase() === "menunggu"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full bg-current", (selected.status || "").toLowerCase() === "menunggu" && "animate-pulse")} />
                  {["verified", "terverifikasi", "disetujui"].includes((selected.status || "").toLowerCase()) ? "Terverifikasi" : (selected.status || "").toLowerCase() === "menunggu" ? "Menunggu" : "Ditolak"}
                </Badge>
              </div>
            </DialogHeader>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto font-jakarta">
              {/* Reject Alert / Note */}
              {(selected.status || "").toLowerCase() === "rejected" && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-rose-600 flex-shrink-0" style={{ fontSize: "18px" }}>cancel</span>
                  <div>
                    <p className="font-bold text-rose-800 text-sm">Pengajuan Ditolak</p>
                    <p className="text-rose-600 text-xs mt-0.5">Pengajuan ini tidak disetujui. Silakan periksa berkas atau data terkait.</p>
                  </div>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: GraduationCap, label: "Program Studi", value: selected.mahasiswa?.ProgramStudi?.Nama || selected.mahasiswa?.program_studi?.nama },
                  { icon: Apartment, label: "Fakultas", value: selected.mahasiswa?.Fakultas?.Nama || selected.mahasiswa?.fakultas?.nama },
                  { icon: Award, label: "Peringkat", value: selected.peringkat || "—" },
                  { icon: Calendar, label: "Diajukan Pada", value: formatDate(selected.created_at || selected.CreatedAt) },
                  { icon: CheckCircle2, label: "Poin Apresiasi", value: selected.poin != null ? `${selected.poin} Poin` : "—" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100 hover:bg-neutral-100/30 transition-all">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm border border-neutral-100 flex-shrink-0">
                      <item.icon size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-xs font-bold text-neutral-800 truncate">{item.value || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bukti Dokumen */}
              <div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Bukti Fisik / Sertifikat</p>
                {selected.bukti_url ? (
                  <a
                    href={`${API_BASE_URL.replace("/api", "")}${selected.bukti_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3.5 p-4 rounded-xl border border-neutral-200 bg-white hover:bg-blue-50/20 hover:border-blue-300 transition-all group"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-100">
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-neutral-900 group-hover:text-blue-600 text-sm transition-colors">Lihat Dokumen Sertifikat</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{selected.bukti_url}</p>
                    </div>
                    <ExternalLink size={16} className="text-neutral-300 group-hover:text-blue-500 transition-colors" />
                  </a>
                ) : (
                  <div className="flex items-center gap-3.5 p-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50">
                    <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-300 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>description</span>
                    </div>
                    <p className="text-xs text-neutral-400 font-medium italic">Tidak ada berkas sertifikat yang diunggah.</p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="px-8 py-5 border-t border-neutral-100 bg-neutral-50/50 flex gap-3 flex-shrink-0">
              <Button
                onClick={() => setIsDetailOpen(false)}
                variant="outline"
                className="flex-1 h-11 rounded-xl border-neutral-200 bg-white text-xs font-bold text-neutral-600 uppercase tracking-widest hover:bg-neutral-50"
              >
                Tutup
              </Button>
              {(selected.status || "").toLowerCase() === "menunggu" && (
                <>
                  <Button
                    onClick={() => handleOpenVerify(selected, "rejected")}
                    className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-rose-600/10 border-none"
                  >
                    Tolak Pengajuan
                  </Button>
                  <Button
                    onClick={() => handleOpenVerify(selected, "verified")}
                    className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-emerald-600/10 border-none"
                  >
                    Setujui & Validasi
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ── Verification Action Dialog ─────────────────────────────── */}
      <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
        {selected && (
          <DialogContent className="max-w-md p-6 overflow-hidden border-none shadow-2xl rounded-2xl bg-white font-jakarta">
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-base font-black text-neutral-900 font-headline leading-tight">
                {verifyStatus === "verified" ? "Setujui Pengajuan Prestasi" : "Tolak Pengajuan Prestasi"}
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-400 font-medium">
                {verifyStatus === "verified" 
                  ? "Tentukan poin apresiasi dan berikan catatan verifikasi kelayakan untuk mahasiswa."
                  : "Berikan alasan penolakan berkas agar mahasiswa dapat memperbaiki pengajuannya."
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleVerifySubmit} className="space-y-5 mt-4">
              {verifyStatus === "verified" && (
                <div className="space-y-1.5">
                  <Label htmlFor="verify_poin" className="text-xs font-bold uppercase tracking-widest text-neutral-400">Poin Apresiasi</Label>
                  <Input
                    id="verify_poin"
                    type="number"
                    min="0"
                    max="100"
                    value={verifyPoin}
                    onChange={(e) => setVerifyPoin(e.target.value)}
                    className="h-10 rounded-xl border-neutral-200 focus:border-primary shadow-none text-xs font-bold bg-neutral-50/50 focus:bg-white"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="verify_catatan" className="text-xs font-bold uppercase tracking-widest text-neutral-400">Catatan Verifikator</Label>
                <Textarea
                  id="verify_catatan"
                  placeholder="Masukkan catatan alasan verifikasi..."
                  value={verifyCatatan}
                  onChange={(e) => setVerifyCatatan(e.target.value)}
                  className="rounded-xl border-neutral-200 focus:border-primary shadow-none text-xs bg-neutral-50/50 focus:bg-white min-h-[90px] p-3"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVerifyOpen(false)}
                  className="flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-500"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn("flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-widest border-none text-white",
                    verifyStatus === "verified" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  )}
                >
                  {isSubmitting ? "Menyimpan..." : verifyStatus === "verified" ? "Validasi" : "Tolak"}
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

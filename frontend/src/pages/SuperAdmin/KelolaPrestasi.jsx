"use client"

import React, { useState, useEffect, useMemo } from "react"
import { DataTable } from "@/components/ui/DataTable"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import { StatCard } from "@/components/ui/StatCard"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { adminService, API_BASE_URL } from "../../services/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

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

const getShortFacultyName = (name) => {
  if (!name || name === 'Tidak ada data' || name === '—') return '—'
  return name
    .replace(/Fakultas\s+/i, '')
    .replace(/Sains\s+dan\s+Teknologi/i, 'Sains & Tek')
    .replace(/Sains\s+&\s+Teknologi/i, 'Sains & Tek')
}

export default function KelolaPrestasi() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isVerifyOpen, setIsVerifyOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedFaculty, setExpandedFaculty] = useState(null)
  const [chartFacultyFilter, setChartFacultyFilter] = useState("all")
  const [tableFilters, setTableFilters] = useState({})

  const [allFaculties, setAllFaculties] = useState([])
  const [allProdi, setAllProdi] = useState([])

  // Verification Form State
  const [verifyStatus, setVerifyStatus] = useState("verified")
  const [verifyCatatan, setVerifyCatatan] = useState("")
  const [verifyPoin, setVerifyPoin] = useState(5)
  const [verifyDanaDisetujui, setVerifyDanaDisetujui] = useState("")

  const fetchData = async () => {
    setLoading(true)
    try {
      const [res, facRes, prodRes] = await Promise.all([
        adminService.getAllAchievements(),
        adminService.getAllFaculties(),
        adminService.getAllProdi()
      ])
      if (res.status === "success") {
        setData((res.data || []).map((item, i) => {
          const mhs = item.mahasiswa || {}
          const prodi = mhs.program_studi || mhs.ProgramStudi || {}
          const fakultas = prodi.fakultas || prodi.Fakultas || mhs.fakultas || mhs.Fakultas || {}
          return {
            ...item,
            colorIdx: i % AVATAR_COLORS.length,
            fakultas_id: String(fakultas.id || fakultas.ID || ''),
            fakultas_nama: String(fakultas.nama || fakultas.Nama || ''),
            prodi_id: String(prodi.id || prodi.ID || ''),
            prodi_nama: String(prodi.nama || prodi.Nama || ''),
            kategori_filter: String(item.kategori || ''),
            semester_filter: mhs.SemesterSekarang || mhs.semester_sekarang ? String(mhs.SemesterSekarang || mhs.semester_sekarang) : '',
            periode_filter: item.tanggal || item.Tanggal ? String(new Date(item.tanggal || item.Tanggal).getFullYear()) : (item.created_at || item.CreatedAt ? String(new Date(item.created_at || item.CreatedAt).getFullYear()) : ''),
            Tipe: item.tipe || item.Tipe || 'Laporan Prestasi',
            DanaDiajukan: item.dana_diajukan || item.DanaDiajukan || 0,
            DanaDisetujui: item.dana_disetujui || item.DanaDisetujui || 0,
            CatatanVerifikator: item.catatan_verifikator || item.CatatanVerifikator || ''
          }
        }))
      } else {
        toast.error("Gagal memuat data prestasi")
      }
      if (facRes && facRes.status === "success") {
        setAllFaculties(facRes.data || [])
      }
      if (prodRes && prodRes.status === "success") {
        setAllProdi(prodRes.data || [])
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
    const isFunding = (row.Tipe || row.tipe) === "Pengajuan Dana"
    setVerifyCatatan(status === "verified" ? (isFunding ? "Pengajuan dana disetujui." : "Prestasi tervalidasi oleh Super Admin.") : "Berkas tidak sesuai kriteria.")
    setVerifyPoin(isFunding ? 0 : 5)
    setVerifyDanaDisetujui(isFunding ? String(row.DanaDiajukan || row.dana_diajukan || 0) : "")
    setIsVerifyOpen(true)
  }

  const handleVerifySubmit = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        Status: verifyStatus === 'verified' ? 'Diverifikasi' : 'Ditolak',
        Poin: Number(verifyPoin) || 0,
        Catatan: verifyCatatan,
        DanaDisetujui: Number(verifyDanaDisetujui) || 0
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
    const verified = data.filter(item => ["verified", "terverifikasi", "disetujui", "diverifikasi"].includes((item.status || "").toLowerCase())).length
    const rejected = data.filter(item => ["rejected", "ditolak"].includes((item.status || "").toLowerCase())).length
    return { total, pending, verified, rejected }
  }, [data])

  const extraStats = useMemo(() => {
    const facultyCounts = {}
    data.forEach(item => {
      const fac = item.fakultas_nama || 'Lainnya'
      facultyCounts[fac] = (facultyCounts[fac] || 0) + 1
    })
    let topFaculty = '—'
    let topFacultyCount = 0
    Object.entries(facultyCounts).forEach(([fac, count]) => {
      if (count > topFacultyCount && fac !== 'Lainnya') {
        topFaculty = fac
        topFacultyCount = count
      }
    })
    if (topFaculty === '—' && facultyCounts['Lainnya']) {
      topFaculty = 'Lainnya'
      topFacultyCount = facultyCounts['Lainnya']
    }

    const categoryCounts = {}
    data.forEach(item => {
      const cat = item.kategori || 'Umum'
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })
    let topCategory = '—'
    let topCategoryCount = 0
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > topCategoryCount) {
        topCategory = cat
        topCategoryCount = count
      }
    })

    const tingkatCounts = {}
    data.forEach(item => {
      const t = item.tingkat || 'Lokal'
      tingkatCounts[t] = (tingkatCounts[t] || 0) + 1
    })
    let topTingkat = '—'
    let topTingkatCount = 0
    Object.entries(tingkatCounts).forEach(([t, count]) => {
      if (count > topTingkatCount) {
        topTingkat = t
        topTingkatCount = count
      }
    })
    const topTingkatPct = data.length > 0 ? Math.round((topTingkatCount / data.length) * 100) : 0

    const yearCounts = {}
    data.forEach(item => {
      const yr = item.periode_filter
      if (yr) yearCounts[yr] = (yearCounts[yr] || 0) + 1
    })
    let topYear = '—'
    let topYearCount = 0
    Object.entries(yearCounts).forEach(([yr, count]) => {
      if (count > topYearCount) {
        topYear = yr
        topYearCount = count
      }
    })

    const totalDanaDisetujui = data.reduce((acc, curr) => acc + (parseFloat(curr.DanaDisetujui) || 0), 0)

    return {
      topFaculty,
      topFacultyCount,
      topCategory,
      topCategoryCount,
      topTingkat,
      topTingkatCount,
      topTingkatPct,
      topYear,
      topYearCount,
      totalDanaDisetujui
    }
  }, [data])

  const leaderboardData = useMemo(() => {
    const counts = {}
    data.forEach(item => {
      const facName = item.fakultas_nama || 'Lainnya'
      counts[facName] = (counts[facName] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  const prodiBreakdown = useMemo(() => {
    const mapping = {}

    // Initialize mapping structure with all master faculties and prodis
    allFaculties.forEach(fac => {
      const facName = fac.nama || fac.Nama
      if (facName) {
        mapping[facName] = {}
        const facId = fac.id || fac.ID
        allProdi.forEach(prod => {
          const prodFid = prod.FakultasID || prod.fakultas_id
          const prodName = prod.nama || prod.Nama
          if (String(prodFid) === String(facId) && prodName) {
            mapping[facName][prodName] = { total: 0, pending: 0, verified: 0 }
          }
        })
      }
    })

    // Populate counts from achievements data
    data.forEach(item => {
      const facName = item.fakultas_nama || 'Lainnya'
      const prodName = item.prodi_nama || 'Lainnya'
      const status = (item.status || '').toLowerCase()
      const isVerified = ["verified", "terverifikasi", "disetujui", "diverifikasi"].includes(status)
      const isPending = !isVerified && !["rejected", "ditolak"].includes(status)

      if (!mapping[facName]) {
        mapping[facName] = {}
      }
      if (!mapping[facName][prodName]) {
        mapping[facName][prodName] = { total: 0, pending: 0, verified: 0 }
      }
      
      mapping[facName][prodName].total += 1
      if (isPending) mapping[facName][prodName].pending += 1
      if (isVerified) mapping[facName][prodName].verified += 1
    })
    return mapping
  }, [allFaculties, allProdi, data])

  const fakultasOptions = useMemo(() => {
    const list = []
    const ids = new Set()
    
    // Add all faculties from master data
    allFaculties.forEach(fac => {
      const fid = String(fac.id || fac.ID || '')
      const fnama = String(fac.nama || fac.Nama || '')
      if (fid && fnama && !ids.has(fid)) {
        ids.add(fid)
        list.push({ label: fnama.toUpperCase(), value: fid })
      }
    })

    // Fallback/Supplement from achievements data
    data.forEach(item => {
      const fid = item.fakultas_id
      const fnama = item.fakultas_nama
      if (fid && fnama && !ids.has(fid)) {
        ids.add(fid)
        list.push({ label: fnama.toUpperCase(), value: fid })
      }
    })
    return list
  }, [allFaculties, data])

  const chartData = useMemo(() => {
    if (chartFacultyFilter === "all") {
      return leaderboardData
    } else {
      const counts = {}
      data.forEach(item => {
        if (item.fakultas_id === chartFacultyFilter) {
          const prodName = item.prodi_nama || 'Lainnya'
          counts[prodName] = (counts[prodName] || 0) + 1
        }
      })
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    }
  }, [chartFacultyFilter, leaderboardData, data])

  const prodiOptions = useMemo(() => {
    const list = []
    const ids = new Set()

    const selectedFakultasId = tableFilters.fakultas_id
    const filteredProdis = selectedFakultasId && selectedFakultasId !== "all"
      ? allProdi.filter(p => String(p.FakultasID || p.fakultas_id || '') === String(selectedFakultasId))
      : allProdi

    filteredProdis.forEach(prod => {
      const pid = String(prod.id || prod.ID || '')
      const pnama = String(prod.nama || prod.Nama || '')
      if (pid && pnama && !ids.has(pid)) {
        ids.add(pid)
        list.push({ label: pnama.toUpperCase(), value: pid })
      }
    })

    // Fallback/Supplement from achievements data
    data.forEach(item => {
      const pid = item.prodi_id
      const pnama = item.prodi_nama
      const fid = item.fakultas_id
      if (selectedFakultasId && selectedFakultasId !== "all" && fid !== selectedFakultasId) {
        return
      }
      if (pid && pnama && !ids.has(pid)) {
        ids.add(pid)
        list.push({ label: pnama.toUpperCase(), value: pid })
      }
    })

    return list
  }, [allProdi, data, tableFilters.fakultas_id])

  const kategoriOptions = useMemo(() => {
    const list = []
    const cats = new Set()
    data.forEach(item => {
      const cat = item.kategori
      if (cat && !cats.has(cat)) {
        cats.add(cat)
        list.push({ label: cat.toUpperCase(), value: cat })
      }
    })
    return list
  }, [data])

  const semesterOptions = useMemo(() => {
    const list = []
    const semesters = new Set()
    data.forEach(item => {
      const sem = item.semester_filter
      if (sem && !semesters.has(sem)) {
        semesters.add(sem)
        list.push({ label: `SEMESTER ${sem}`, value: sem })
      }
    })
    return list.sort((a, b) => Number(a.value) - Number(b.value))
  }, [data])

  const periodeOptions = useMemo(() => {
    const list = []
    const periods = new Set()
    data.forEach(item => {
      const per = item.periode_filter
      if (per && !periods.has(per)) {
        periods.add(per)
        list.push({ label: `PERIODE ${per}`, value: per })
      }
    })
    return list.sort((a, b) => Number(b.value) - Number(a.value))
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
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="inline-block text-[9px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {row.kategori || "Umum"}
            </span>
            <span className={cn("inline-block text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider", row.Tipe === 'Pengajuan Dana' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200')}>
              {row.Tipe || 'Laporan Prestasi'}
            </span>
          </div>
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
        const isVerified = ["verified", "terverifikasi", "disetujui", "diverifikasi"].includes(status)
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
    }
  ]

  return (
    <div className="min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />

      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl p-8 border border-slate-200/60 bg-white shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.04),transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
              backgroundSize: "60px 60px"
            }}
          />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 right-48 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-1.5 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600">Kemahasiswaan Portal</span>
              </div>
              <h1 className="text-3xl font-black text-neutral-900 font-headline tracking-tight leading-tight">
                Kelola <span className="text-blue-600">Prestasi Mahasiswa</span>
              </h1>
              <p className="text-neutral-500 font-medium text-xs max-w-xl leading-relaxed mt-1.5">
                Audit, verifikasi, dan validasi seluruh portofolio prestasi akademik/non-akademik mahasiswa secara terintegrasi.
              </p>
            </div>
            
            <div className="flex items-center gap-3 self-end md:self-auto">
              <Button onClick={fetchData} disabled={loading} variant="outline" className="h-10 px-5 rounded-xl border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-all active:scale-95 text-xs font-bold uppercase tracking-widest gap-2">
                <RefreshCw size={14} animate={loading} className="text-blue-500" />
                Refresh Data
              </Button>
            </div>
          </div>
        </section>

        {/* ── Stat Cards ──────────────────────────────────────────── */}
        <div className="space-y-4 md:space-y-5">
          {/* Row 1: Status Portofolio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Total Portofolio"
              value={stats.total}
              description="Prestasi terdaftar"
              icon="emoji_events"
              color="text-primary"
              bg="bg-primary/10"
              loading={loading}
            />
            <StatCard
              label="Menunggu Review"
              value={stats.pending}
              description="Perlu tindakan verifikasi"
              icon="schedule"
              color="text-warning"
              bg="bg-warning/10"
              loading={loading}
            />
            <StatCard
              label="Terverifikasi"
              value={stats.verified}
              description="Disetujui universitas"
              icon="check_circle"
              color="text-success"
              bg="bg-success/10"
              loading={loading}
            />
            <StatCard
              label="Total Ditolak"
              value={stats.rejected}
              description="Pengajuan tidak sesuai kriteria"
              icon="close"
              color="text-error"
              bg="bg-error/10"
              loading={loading}
            />
          </div>

          {/* Row 2: 5W 1H Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Fakultas Teraktif"
              value={getShortFacultyName(extraStats.topFaculty)}
              description={`${extraStats.topFacultyCount} prestasi terdaftar`}
              icon="group"
              color="text-primary"
              bg="bg-primary/10"
              loading={loading}
            />
            <StatCard
              label="Kategori Terbanyak"
              value={extraStats.topCategory}
              description={`${extraStats.topCategoryCount} pengajuan`}
              icon="military_tech"
              color="text-emerald-600"
              bg="bg-emerald-50"
              loading={loading}
            />
            <StatCard
              label="Tingkat Dominan"
              value={extraStats.topTingkat}
              description={`${extraStats.topTingkatPct}% dari total prestasi`}
              icon="public"
              color="text-indigo-600"
              bg="bg-indigo-50"
              loading={loading}
            />
            <StatCard
              label="Periode Teraktif"
              value={extraStats.topYear !== '—' ? `Tahun ${extraStats.topYear}` : '—'}
              description={`${extraStats.topYearCount} prestasi diajukan`}
              icon="calendar_today"
              color="text-amber-600"
              bg="bg-amber-50"
              loading={loading}
            />
          </div>
        </div>

        {/* ── Analitik & Distribusi Section ────────────────────────── */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Bar Chart: Leaderboard Fakultas */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex justify-center items-center text-blue-600 flex-shrink-0">
                      <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '18px' }} >bar_chart</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline block">Kontribusi Prestasi</span>
                      <h3 className="text-sm font-extrabold text-slate-800 leading-tight">
                        {chartFacultyFilter === "all" ? "Fakultas Paling Berprestasi" : "Program Studi Teraktif"}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Select Filter Fakultas */}
                  <div className="w-full sm:w-[200px] shrink-0">
                    <Select value={chartFacultyFilter} onValueChange={setChartFacultyFilter}>
                      <SelectTrigger className="w-full h-9 rounded-xl border-[#e5e5e5] bg-[#fafafa] text-xs">
                        <SelectValue placeholder="Filter Fakultas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Fakultas</SelectItem>
                        {fakultasOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 font-medium mb-6">
                  {chartFacultyFilter === "all" 
                    ? "Peringkat kontribusi jumlah prestasi mahasiswa per Fakultas secara riil." 
                    : "Peringkat kontribusi jumlah prestasi mahasiswa per Program Studi pada Fakultas terpilih."}
                </p>
              </div>
              
              <div className="h-[240px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        formatter={v => [v, 'Jumlah Prestasi']}
                        contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: "bold" }}
                      />
                      <Bar dataKey="value" name="Prestasi" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-400 italic">Tidak ada data kontribusi</div>
                )}
              </div>
            </div>

            {/* Rekapitulasi per Fakultas & Prodi */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex justify-center items-center text-indigo-600 flex-shrink-0">
                    <span className="material-symbols-outlined text-indigo-600" style={{ fontSize: '18px' }} >analytics</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline block">Distribusi Akademik</span>
                    <h3 className="text-sm font-extrabold text-slate-800 leading-tight">Rekap Fakultas & Prodi</h3>
                  </div>
                </div>
                
                <p className="text-xs text-neutral-500 font-medium mb-4">Klik nama fakultas untuk melihat rincian jumlah portofolio per Program Studi.</p>
                
                <div className="space-y-2.5 overflow-y-auto max-h-[240px] pr-1">
                  {Object.keys(prodiBreakdown).length > 0 ? (
                    Object.entries(prodiBreakdown).map(([facName, prodis]) => {
                      const totalFac = Object.values(prodis).reduce((sum, p) => sum + p.total, 0)
                      const pendingFac = Object.values(prodis).reduce((sum, p) => sum + p.pending, 0)
                      const verifiedFac = Object.values(prodis).reduce((sum, p) => sum + p.verified, 0)
                      const isExpanded = expandedFaculty === facName

                      return (
                        <div key={facName} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                          <button
                            type="button"
                            onClick={() => setExpandedFaculty(isExpanded ? null : facName)}
                            className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-100/50 transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-extrabold text-slate-800 text-[11px] tracking-tight block truncate uppercase">{facName}</span>
                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{Object.keys(prodis).length} Program Studi</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 shrink-0">
                              {pendingFac > 0 && (
                                <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded" title="Menunggu Review">
                                  {pendingFac} P
                                </span>
                              )}
                              <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded" title="Sudah Terverifikasi">
                                {verifiedFac} V
                              </span>
                              <span className="text-[9px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded" title="Total Portofolio">
                                {totalFac} T
                              </span>
                              <span className="material-symbols-outlined text-slate-400 transition-transform duration-200" style={{ fontSize: 16, transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                                keyboard_arrow_down
                              </span>
                            </div>
                          </button>
                          
                          {isExpanded && (
                            <div className="border-t border-slate-100 bg-white p-3 space-y-2 animate-in fade-in duration-200">
                              {Object.entries(prodis).map(([prodName, metrics]) => (
                                <div key={prodName} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                                  <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{prodName}</span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {metrics.pending > 0 && (
                                      <span className="text-[8px] font-extrabold text-amber-700 bg-amber-50 px-1 rounded">
                                        {metrics.pending} Pending
                                      </span>
                                    )}
                                    <span className="text-[8px] font-extrabold text-emerald-700 bg-emerald-50 px-1 rounded">
                                      {metrics.verified} Verif
                                    </span>
                                    <span className="text-[8px] font-extrabold text-slate-500 bg-slate-50 px-1 rounded">
                                      {metrics.total} Total
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-xs text-neutral-400 italic">Belum ada sebaran Fakultas/Prodi</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Data Table Section ───────────────────────────────────── */}
        <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={data}
              loading={loading}
              searchPlaceholder="Cari mahasiswa, judul kegiatan, kategori..."
              externalFilters={tableFilters}
              onExternalFilterChange={setTableFilters}
              filters={[
                {
                  key: "status",
                  placeholder: "Status",
                  options: [
                    { label: "Menunggu", value: "menunggu" },
                    { label: "Terverifikasi", value: "diverifikasi" },
                    { label: "Ditolak", value: "ditolak" },
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
                },
                {
                  key: "kategori_filter",
                  placeholder: "Kategori",
                  options: kategoriOptions
                },
                {
                  key: "fakultas_id",
                  placeholder: "Fakultas",
                  options: fakultasOptions
                },
                {
                  key: "prodi_id",
                  placeholder: "Program Studi",
                  options: prodiOptions
                },
                {
                  key: "semester_filter",
                  placeholder: "Semester",
                  options: semesterOptions
                },
                {
                  key: "periode_filter",
                  placeholder: "Periode",
                  options: periodeOptions
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
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.25em] mb-1">
                    {selected.Tipe === 'Pengajuan Dana' ? 'Pengajuan Dana Lomba' : 'Capaian Prestasi'}
                  </p>
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
                  ["verified", "terverifikasi", "disetujui", "diverifikasi"].includes((selected.status || "").toLowerCase())
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : (selected.status || "").toLowerCase() === "menunggu"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full bg-current", (selected.status || "").toLowerCase() === "menunggu" && "animate-pulse")} />
                  {["verified", "terverifikasi", "disetujui", "diverifikasi"].includes((selected.status || "").toLowerCase()) ? "Terverifikasi" : (selected.status || "").toLowerCase() === "menunggu" ? "Menunggu" : "Ditolak"}
                </Badge>
              </div>
            </DialogHeader>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto font-jakarta">
              {/* Reject Alert / Note */}
              {((selected.status || "").toLowerCase() === "rejected" || (selected.status || "").toLowerCase() === "ditolak") && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-rose-600 flex-shrink-0" style={{ fontSize: "18px" }}>cancel</span>
                  <div>
                    <p className="font-bold text-rose-800 text-sm">Pengajuan Ditolak</p>
                    <p className="text-rose-600 text-xs mt-0.5">{selected.CatatanVerifikator || 'Pengajuan ini tidak disetujui. Silakan periksa berkas atau data terkait.'}</p>
                  </div>
                </div>
              )}

              {/* Verified Note (Non-Reject) */}
              {["verified", "terverifikasi", "disetujui", "diverifikasi"].includes((selected.status || "").toLowerCase()) && selected.CatatanVerifikator && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-600 flex-shrink-0" style={{ fontSize: "18px" }}>check_circle</span>
                  <div>
                    <p className="font-bold text-emerald-800 text-sm">Catatan Verifikator</p>
                    <p className="text-emerald-600 text-xs mt-0.5">{selected.CatatanVerifikator}</p>
                  </div>
                </div>
              )}

              {/* 5W 1H Breakdown */}
              <div className="space-y-6">
                {/* 1. WHO (Siapa) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>person</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">WHO — Profil Mahasiswa</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Nama Lengkap</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5">{selected.mahasiswa?.Nama || selected.mahasiswa?.nama || "—"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase">NIM</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5">{selected.mahasiswa?.NIM || selected.mahasiswa?.nim || "—"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Fakultas</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{selected.fakultas_nama || "—"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Program Studi</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{selected.prodi_nama || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* 2. WHAT (Apa) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>emoji_events</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">WHAT — Rincian Kegiatan & Prestasi</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50 md:col-span-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Nama Kegiatan / Kompetisi</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5">{selected.nama_kegiatan}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Kategori Prestasi</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{selected.kategori || "—"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Peringkat / Juara</p>
                      <p className="text-xs font-extrabold text-primary mt-0.5">{selected.peringkat || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* 3. WHERE (Di mana) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>public</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">WHERE — Lokasi & Penyelenggara</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Penyelenggara / Institusi</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{selected.penyelenggara || "—"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Tingkat Kompetisi</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5 uppercase">{selected.tingkat || "Lokal"}</p>
                    </div>
                  </div>
                </div>

                {/* 4. WHEN (Kapan) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>calendar_today</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">WHEN — Waktu & Periode</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Tanggal Pelaksanaan / Lomba</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{formatDate(selected.tanggal)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Periode Akademik / Pengajuan</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">Tahun {selected.periode_filter}</p>
                    </div>
                  </div>
                </div>

                {/* 5. WHY (Mengapa) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>contact_support</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">WHY — Verifikasi & Kelayakan</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/50 space-y-2">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Catatan Keputusan / Verifikator</p>
                      <p className="text-xs font-bold text-slate-700 mt-1">
                        {selected.CatatanVerifikator || "Belum ada catatan keputusan dari verifikator."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 6. HOW (Bagaimana) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>payments</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">HOW — Pendanaan, Poin & Berkas</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selected.Tipe === 'Pengajuan Dana' ? (
                      <>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Dana Diajukan</p>
                          <p className="text-xs font-extrabold text-amber-600 mt-0.5">Rp {(selected.DanaDiajukan || 0).toLocaleString('id-ID')}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Dana Disetujui</p>
                          <p className="text-xs font-extrabold text-emerald-600 mt-0.5">Rp {(selected.DanaDisetujui || 0).toLocaleString('id-ID')}</p>
                        </div>
                      </>
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50 md:col-span-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Poin SKPI Didapat</p>
                        <p className="text-xs font-extrabold text-emerald-600 mt-0.5">{(selected.poin !== undefined ? selected.poin : selected.Poin) ?? 0} Poin</p>
                      </div>
                    )}
                  </div>

                  {/* Bukti File */}
                  <div className="mt-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Dokumen Pendukung</p>
                    {selected.bukti_url ? (
                      <a
                        href={`${API_BASE_URL.replace("/api", "")}${selected.bukti_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-white hover:bg-blue-50/20 hover:border-blue-300 transition-all group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-100">
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>description</span>
                          </div>
                          <span className="font-bold text-neutral-900 group-hover:text-blue-600 text-xs transition-colors truncate max-w-[200px]">
                            {selected.Tipe === 'Pengajuan Dana' ? 'Proposal / Dokumen Pengajuan' : 'Sertifikat Bukti Prestasi'}
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-blue-600 flex items-center gap-1">
                          Buka File <span className="material-symbols-outlined" style={{ fontSize: 12 }}>open_in_new</span>
                        </span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/30">
                        <span className="material-symbols-outlined text-slate-300" style={{ fontSize: "18px" }}>description</span>
                        <p className="text-xs text-slate-400 font-medium italic">Tidak ada berkas yang diunggah.</p>
                      </div>
                    )}
                  </div>
                </div>
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
                {verifyStatus === "verified" 
                  ? (selected.Tipe === 'Pengajuan Dana' ? 'Setujui Pengajuan Dana' : 'Setujui Pengajuan Prestasi') 
                  : (selected.Tipe === 'Pengajuan Dana' ? 'Tolak Pengajuan Dana' : 'Tolak Pengajuan Prestasi')
                }
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-400 font-medium">
                {verifyStatus === "verified" 
                  ? "Berikan catatan verifikasi kelayakan untuk mahasiswa."
                  : "Berikan alasan penolakan berkas agar mahasiswa dapat memperbaiki pengajuannya."
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleVerifySubmit} className="space-y-5 mt-4">

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

              {selected.Tipe === "Pengajuan Dana" ? (
                verifyStatus === "verified" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="verify_dana" className="text-xs font-bold uppercase tracking-widest text-neutral-400">Dana yang Disetujui (Rp)</Label>
                    <Input
                      id="verify_dana"
                      type="number"
                      value={verifyDanaDisetujui}
                      onChange={(e) => setVerifyDanaDisetujui(e.target.value)}
                      className="rounded-xl border-neutral-200 focus:border-primary text-xs"
                      placeholder="Cth: 1200000"
                      required
                    />
                  </div>
                )
              ) : (
                verifyStatus === "verified" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="verify_poin" className="text-xs font-bold uppercase tracking-widest text-neutral-400">Poin SKPI Didapat</Label>
                    <Input
                      id="verify_poin"
                      type="number"
                      value={verifyPoin}
                      onChange={(e) => setVerifyPoin(e.target.value)}
                      className="rounded-xl border-neutral-200 focus:border-primary text-xs"
                      required
                    />
                  </div>
                )
              )}

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

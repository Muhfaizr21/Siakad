import React, { useState, useEffect } from 'react'

import { cn } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'
import { adminService } from '../../services/api'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../store/useAuthStore'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Icon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>info</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const MessageSquare = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chat</span>;
const AlertTriangle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>warning</span>;
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const FileText = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>description</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Building2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>business</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const BookOpen = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>menu_book</span>;
const Shield = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>security</span>;
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;
const Lock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>lock</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const ExternalLink = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>open_in_new</span>;
const Zap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>bolt</span>;



// ─── Skeleton Component ────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={cn('animate-pulse bg-neutral-100 rounded-lg', className)} />
)

// ─── Stat Card ─────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, route, description, color, bg, loading }) => (
  <Link to={route || '#'} className="group block h-full">
    <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm hover:border-[#c9d8ff] hover:shadow-md transition-all duration-200 h-full flex flex-col">
      {loading ? (
        <div className="p-4 space-y-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-16 mt-2" />
          <Skeleton className="h-3 w-28" />
        </div>
      ) : (
        <>
          <div className="p-4 flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
                <Icon size={18} className={color} />
              </div>
              <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest leading-tight">{label}</span>
            </div>
            <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">
              {value ?? '0'}
            </p>
            <p className="text-xs text-[#a3a3a3] font-medium mt-1.5 leading-snug line-clamp-2">
              {description}
            </p>
          </div>
          <div className="px-4 py-3 border-t border-[#f5f5f5] flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#00236F] group-hover:underline uppercase tracking-widest">Lihat Detail</span>
            <span className="material-symbols-outlined text-[#00236F] transform group-hover:translate-x-1 transition-transform" style={{ fontSize: '12px' }} >arrow_forward</span>
          </div>
        </>
      )}
    </div>
  </Link>
)

// ─── Quick Action Link ──────────────────────────────────────────────
const QuickLink = ({ icon: Icon, label, href, color, bg }) => (
  <Link
    to={href}
    className="flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-200 bg-white hover:border-primary/20 hover:shadow-md hover:bg-[#f7faff] transition-all group"
  >
    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm', bg)}>
      <Icon className={cn('size-6', color)} />
    </div>
    <span className="text-sm font-medium text-neutral-700 font-jakarta group-hover:text-primary text-center leading-tight transition-colors">
      {label}
    </span>
  </Link>
)

// ─── Action Badge ───────────────────────────────────────────────────
const getActionStyles = (action = '') => {
  const act = action.toUpperCase()
  if (act.includes('LOGIN')) return 'bg-emerald-50 text-emerald-600 border-emerald-100'
  if (act.includes('DELETE')) return 'bg-rose-50 text-rose-600 border-rose-100'
  if (act.includes('CREATE')) return 'bg-blue-50 text-blue-600 border-blue-100'
  if (act.includes('UPDATE')) return 'bg-amber-50 text-amber-600 border-amber-100'
  return 'bg-neutral-50 text-neutral-500 border-neutral-100'
}

// ─── Main Component ─────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)

  // Filter States
  const [selectedPeriodID, setSelectedPeriodID] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedFakultasID, setSelectedFakultasID] = useState("")
  const [selectedProdiID, setSelectedProdiID] = useState("")
  const [facultiesList, setFacultiesList] = useState([])
  const [prodiList, setProdiList] = useState([])
  const [periodsList, setPeriodsList] = useState([])

  // Drill-down List States
  const [detailMhs, setDetailMhs] = useState([])
  const [detailAsp, setDetailAsp] = useState([])
  const [detailProp, setDetailProp] = useState([])
  const [activeDetailTab, setActiveDetailTab] = useState("mahasiswa")

  // Search & Pagination States for Drill-down Details
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [detailFakultasFilter, setDetailFakultasFilter] = useState("")
  const [detailProdiFilter, setDetailProdiFilter] = useState("")
  const [detailSemesterFilter, setDetailSemesterFilter] = useState("")

  useEffect(() => {
    setSearchQuery("")
    setDetailFakultasFilter("")
    setDetailProdiFilter("")
    setDetailSemesterFilter("")
    setCurrentPage(1)
  }, [activeDetailTab])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, pageSize, detailFakultasFilter, detailProdiFilter, detailSemesterFilter])

  // Get active dataset
  const getActiveSourceData = React.useMemo(() => {
    if (activeDetailTab === "mahasiswa") return detailMhs || []
    if (activeDetailTab === "aspirasi") return detailAsp || []
    return detailProp || []
  }, [activeDetailTab, detailMhs, detailAsp, detailProp])

  // Extract unique options for filter dropdowns based on the active source data
  const detailFilterOptions = React.useMemo(() => {
    const data = getActiveSourceData
    
    const faculties = new Set()
    const prodis = new Set()
    const semesters = new Set()

    data.forEach(item => {
      // Fakultas
      let fac = ""
      if (activeDetailTab === "mahasiswa") {
        fac = item.Fakultas?.Nama || item.Fakultas?.nama || ""
      } else if (activeDetailTab === "aspirasi") {
        fac = item.mahasiswa?.Fakultas?.Nama || item.mahasiswa?.Fakultas?.nama || item.mahasiswa?.fakultas?.Nama || item.mahasiswa?.fakultas?.nama || ""
      } else {
        fac = item.Ormawa?.Fakultas?.Nama || item.Ormawa?.Fakultas?.nama || item.Ormawa?.fakultas?.Nama || item.Ormawa?.fakultas?.nama || ""
      }
      if (fac) faculties.add(fac)

      // Prodi
      let prd = ""
      if (activeDetailTab === "mahasiswa") {
        prd = item.ProgramStudi?.Nama || item.ProgramStudi?.nama || ""
      } else if (activeDetailTab === "aspirasi") {
        prd = item.mahasiswa?.ProgramStudi?.Nama || item.mahasiswa?.ProgramStudi?.nama || item.mahasiswa?.program_studi?.Nama || item.mahasiswa?.program_studi?.nama || ""
      } else {
        prd = item.Ormawa?.ProgramStudi?.Nama || item.Ormawa?.ProgramStudi?.nama || item.Ormawa?.program_studi?.Nama || item.Ormawa?.program_studi?.nama || ""
      }
      
      if (prd) {
        if (detailFakultasFilter) {
          if (fac === detailFakultasFilter) {
            prodis.add(prd)
          }
        } else {
          prodis.add(prd)
        }
      }

      // Semester
      let sem = ""
      if (activeDetailTab === "mahasiswa") {
        sem = item.SemesterSekarang || item.semester_sekarang || ""
      } else if (activeDetailTab === "aspirasi") {
        sem = item.mahasiswa?.SemesterSekarang || item.mahasiswa?.semester_sekarang || ""
      }
      if (sem !== undefined && sem !== null && sem !== "") semesters.add(String(sem))
    })

    return {
      faculties: [...faculties].sort(),
      prodis: [...prodis].sort(),
      semesters: [...semesters].sort((a, b) => Number(a) - Number(b))
    }
  }, [getActiveSourceData, activeDetailTab, detailFakultasFilter])

  // Filter and Paginate helper
  const getFilteredAndPaginatedData = () => {
    const sourceData = getActiveSourceData

    // Filter
    const filtered = sourceData.filter(item => {
      // 1. Search Query Filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        let matchSearch = false
        if (activeDetailTab === "mahasiswa") {
          const name = (item.Nama || item.nama || "").toLowerCase()
          const nim = (item.NIM || item.nim || "").toLowerCase()
          const prodi = (item.ProgramStudi?.Nama || item.ProgramStudi?.nama || "").toLowerCase()
          const fakultas = (item.Fakultas?.Nama || item.Fakultas?.nama || "").toLowerCase()
          matchSearch = name.includes(q) || nim.includes(q) || prodi.includes(q) || fakultas.includes(q)
        } else if (activeDetailTab === "aspirasi") {
          const title = (item.judul || "").toLowerCase()
          const category = (item.kategori || "").toLowerCase()
          const sender = (item.mahasiswa?.Nama || item.mahasiswa?.nama || "umum").toLowerCase()
          matchSearch = title.includes(q) || category.includes(q) || sender.includes(q)
        } else {
          const title = (item.Judul || item.judul || "").toLowerCase()
          const ormawa = (item.Ormawa?.Nama || item.Ormawa?.nama || "").toLowerCase()
          const status = (item.Status || item.status || "").toLowerCase()
          matchSearch = title.includes(q) || ormawa.includes(q) || status.includes(q)
        }
        if (!matchSearch) return false
      }

      // 2. Fakultas Filter
      if (detailFakultasFilter) {
        let fac = ""
        if (activeDetailTab === "mahasiswa") {
          fac = item.Fakultas?.Nama || item.Fakultas?.nama || ""
        } else if (activeDetailTab === "aspirasi") {
          fac = item.mahasiswa?.Fakultas?.Nama || item.mahasiswa?.Fakultas?.nama || item.mahasiswa?.fakultas?.Nama || item.mahasiswa?.fakultas?.nama || ""
        } else {
          fac = item.Ormawa?.Fakultas?.Nama || item.Ormawa?.Fakultas?.nama || item.Ormawa?.fakultas?.Nama || item.Ormawa?.fakultas?.nama || ""
        }
        if (fac !== detailFakultasFilter) return false
      }

      // 3. Prodi Filter
      if (detailProdiFilter) {
        let prd = ""
        if (activeDetailTab === "mahasiswa") {
          prd = item.ProgramStudi?.Nama || item.ProgramStudi?.nama || ""
        } else if (activeDetailTab === "aspirasi") {
          prd = item.mahasiswa?.ProgramStudi?.Nama || item.mahasiswa?.ProgramStudi?.nama || item.mahasiswa?.program_studi?.Nama || item.mahasiswa?.program_studi?.nama || ""
        } else {
          prd = item.Ormawa?.ProgramStudi?.Nama || item.Ormawa?.ProgramStudi?.nama || item.Ormawa?.program_studi?.Nama || item.Ormawa?.program_studi?.nama || ""
        }
        if (prd !== detailProdiFilter) return false
      }

      // 4. Semester Filter
      if (detailSemesterFilter) {
        let sem = ""
        if (activeDetailTab === "mahasiswa") {
          sem = item.SemesterSekarang || item.semester_sekarang || ""
        } else if (activeDetailTab === "aspirasi") {
          sem = item.mahasiswa?.SemesterSekarang || item.mahasiswa?.semester_sekarang || ""
        }
        if (String(sem) !== detailSemesterFilter) return false
      }

      return true
    })

    // Paginate
    const totalItems = filtered.length
    const totalPages = Math.ceil(totalItems / pageSize) || 1
    const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
    const endIndex = Math.min(currentPage * pageSize, totalItems)
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    return {
      data: paginated,
      totalItems,
      totalPages,
      startIndex,
      endIndex
    }
  }

  const { data: displayData, totalItems, totalPages, startIndex, endIndex } = getFilteredAndPaginatedData()

  const [stats, setStats] = useState({
    total_mahasiswa: 0,
    aspirasi_aktif: 0,
    sla_overdue: 0,
    resolved_today: 0,
    antrean_proposal: 0,
    total_anggota_ormawa: 0
  })
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam'
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // Load faculties list
  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const res = await adminService.getAllFaculties()
        if (res.status === 'success') {
          setFacultiesList(res.data || [])
        }
      } catch (err) {
        console.error('Gagal memuat daftar fakultas', err)
      }
    }
    loadFaculties()
  }, [])

  // Handle Faculty change
  const handleFakultasChange = (e) => {
    const facId = e.target.value
    setSelectedFakultasID(facId)
    setSelectedProdiID("") // Reset prodi when faculty changes
    if (facId === "") {
      setProdiList([])
    } else {
      const facObj = facultiesList.find(f => f.id === parseInt(facId))
      setProdiList(facObj?.ProgramStudi || facObj?.program_studi || [])
    }
  }

  const handlePeriodChange = (val) => {
    setSelectedPeriodID(val)
    if (val !== "") {
      setStartDate("")
      setEndDate("")
    }
  }

  const handleDateChange = (type, val) => {
    if (type === 'start') {
      setStartDate(val)
    } else {
      setEndDate(val)
    }
    setSelectedPeriodID("")
  }

  const handleResetFilters = () => {
    setSelectedPeriodID("")
    setStartDate("")
    setEndDate("")
    setSelectedFakultasID("")
    setSelectedProdiID("")
    setProdiList([])
  }

  const fetchData = async (showRefresh = false, useFilters = true) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const params = useFilters ? {
        period_id: selectedPeriodID,
        start_date: startDate,
        end_date: endDate,
        fakultas_id: selectedFakultasID,
        program_studi_id: selectedProdiID
      } : {}

      const [statsRes, logsRes] = await Promise.all([
        adminService.getStats(params),
        adminService.getAuditLogs()
      ])

      if (statsRes.status === 'success') {
        setStats(statsRes.data)
        if (statsRes.data.periods) {
          setPeriodsList(statsRes.data.periods)
        }
        setDetailMhs(statsRes.data.detail_mahasiswa || [])
        setDetailAsp(statsRes.data.detail_aspirasi || [])
        setDetailProp(statsRes.data.detail_proposal || [])
      }
      if (logsRes.status === 'success') setLogs(logsRes.data?.slice(0, 8) || [])
    } catch {
      toast.error('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Re-fetch stats when filters change
  useEffect(() => {
    fetchData()
  }, [selectedPeriodID, startDate, endDate, selectedFakultasID, selectedProdiID])

  // ── Data ──────────────────────────────────────────────────────────
  const statCards = [
    { label: 'Total Mahasiswa',   value: stats.total_mahasiswa?.toLocaleString('id-ID'),  icon: GraduationCap, color: 'text-indigo-600',  bg: 'bg-indigo-50/50', route: '/admin/students',      description: 'Data mahasiswa aktif Universitas Bhakti Kencana' },
    { label: 'Aspirasi Masuk',    value: stats.aspirasi_aktif,                             icon: MessageSquare,  color: 'text-sky-600',     bg: 'bg-sky-50/50',    route: '/admin/aspirations',   description: 'Laporan masuk yang memerlukan penanganan' },
    { label: 'SLA Overdue',       value: stats.sla_overdue,                                icon: AlertTriangle,  color: 'text-rose-600',    bg: 'bg-rose-50/50',   route: '/admin/aspirations',   description: 'Melewati batas waktu respon sistem' },
    { label: 'Penyelesaian Hari Ini', value: stats.resolved_today,                          icon: CheckCircle2,   color: 'text-emerald-600', bg: 'bg-emerald-50/50',route: '/admin/audit',         description: 'Kasus yang berhasil ditangani hari ini' },
    { label: 'Antrean Proposal',  value: stats.antrean_proposal,                           icon: FileText,       color: 'text-amber-600',   bg: 'bg-amber-50/50',  route: '/admin/proposals',     description: 'Dokumen kegiatan menunggu otorisasi' },
    { label: 'Anggota Ormawa',    value: stats.total_anggota_ormawa?.toLocaleString('id-ID'), icon: Users,          color: 'text-violet-600',  bg: 'bg-violet-50/50', route: '/admin/organizations', description: 'Total partisipasi mahasiswa organisasi' },
  ]

  const quickLinks = [
    { label: 'Mahasiswa', icon: GraduationCap, href: '/admin/students',       color: 'text-[#00236f]',  bg: 'bg-[#eef4ff]' },
    { label: 'Fakultas',  icon: Building2,     href: '/admin/faculties',      color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Beasiswa',  icon: Award,         href: '/admin/scholarships',   color: 'text-amber-600',  bg: 'bg-amber-50' },
    { label: 'Aspirasi',  icon: MessageSquare, href: '/admin/aspirations',    color: 'text-rose-600',   bg: 'bg-rose-50' },
    { label: 'Proposal',  icon: FileText,      href: '/admin/proposals',      color: 'text-emerald-600',bg: 'bg-emerald-50' },
    { label: 'Berita',    icon: BookOpen,      href: '/admin/announcements',  color: 'text-violet-600', bg: 'bg-violet-50' },
  ]

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <div className="max-w-[1600px] mx-auto space-y-10">

        {/* ── Welcome Header ───────────────────────────────────────── */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm group">
          
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                  <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  System Live
                </span>
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest">{dateStr}</span>
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold font-jakarta text-neutral-900 tracking-tight leading-tight">
                  {greeting}, <span className="text-primary">{user?.Nama?.split(' ')[0] || 'Admin'}</span>! 👋
                </h1>
                <p className="text-neutral-500 font-medium text-sm md:text-base max-w-2xl leading-relaxed">
                  Pusat kendali operasional Universitas Bhakti Kencana. Kelola data dan efisiensi birokrasi dalam satu dashboard terpadu.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => fetchData(true)}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#171717] text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all active:scale-95 disabled:opacity-50 shadow-md"
                >
                  <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                  {refreshing ? 'Sinkronisasi...' : 'Sync Data'}
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-600">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }} >security</span>
                  Security: Protected
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-center gap-3">
              <div className="size-24 bg-white border border-neutral-200 rounded-xl shadow-sm flex items-center justify-center p-4">
                <img src="/images/bku logo.png" alt="BKU Logo" className="w-full h-full object-contain" />
              </div>
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Master Console</p>
            </div>
          </div>
        </section>

        {/* ── Filters Section ──────────────────────────────────────── */}
        <section className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary font-bold" style={{ fontSize: '20px' }}>filter_alt</span>
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest font-jakarta">Filter Data Dashboard</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Periode Akademik */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Periode Akademik</label>
              <select
                value={selectedPeriodID}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:border-primary focus:bg-white transition-all outline-none"
              >
                <option value="">Semua Periode</option>
                {periodsList.map((p) => (
                  <option key={p.id} value={p.id}>{p.Name || p.nama_periode || `${p.AcademicYear || p.tahun_ajaran} - ${p.Semester || p.semester}`}</option>
                ))}
              </select>
            </div>

            {/* Rentang Tanggal */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Rentang Tanggal</label>
              <div className="flex items-center gap-1.5 w-full">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="w-1/2 px-2.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold focus:border-primary focus:bg-white transition-all outline-none cursor-pointer"
                />
                <span className="text-neutral-400 text-xs font-bold">—</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="w-1/2 px-2.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold focus:border-primary focus:bg-white transition-all outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Fakultas */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Fakultas</label>
              <select
                value={selectedFakultasID}
                onChange={handleFakultasChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:border-primary focus:bg-white transition-all outline-none"
              >
                <option value="">Semua Fakultas</option>
                {facultiesList.map((fac) => (
                  <option key={fac.id} value={fac.id}>{fac.Nama || fac.nama}</option>
                ))}
              </select>
            </div>

            {/* Program Studi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Program Studi</label>
              <select
                value={selectedProdiID}
                onChange={(e) => setSelectedProdiID(e.target.value)}
                disabled={!selectedFakultasID}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:border-primary focus:bg-white transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Semua Program Studi</option>
                {prodiList.map((prodi) => (
                  <option key={prodi.id} value={prodi.id}>{prodi.Nama || prodi.nama} ({prodi.Jenjang || prodi.jenjang || '—'})</option>
                ))}
              </select>
            </div>
          </div>
          {(selectedPeriodID || startDate || endDate || selectedFakultasID || selectedProdiID) && (
            <div className="flex justify-end pt-1">
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors uppercase tracking-widest flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>clear_all</span>
                Reset Filter
              </button>
            </div>
          )}
        </section>

        {/* ── Quick Links ───────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-1.5 bg-primary rounded-full" />
            <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest font-jakarta">Akses Cepat</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {quickLinks.map((ql, i) => <QuickLink key={i} {...ql} />)}
          </div>
        </section>

        {/* ── Stat Cards ────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1.5 bg-primary rounded-full" />
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest font-jakarta">Overview Strategis</h2>
            </div>
            <Link to="/admin/audit" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest">
              Audit Logs <ExternalLink size={10} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {statCards.map((card, i) => (
              <StatCard key={i} {...card} loading={loading} />
            ))}
          </div>
        </section>

        {/* ── Main Bento Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Audit Log — spans 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary size-5" >show_chart</span>
                <h2 className="text-lg font-bold text-neutral-900 font-jakarta tracking-tight">Audit Log Sistem</h2>
              </div>
              <Link to="/admin/audit" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">
                Semua Log
              </Link>
            </div>

            <div className="divide-y divide-neutral-50 flex-1 max-h-[500px] overflow-y-auto">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-5 flex items-start gap-4">
                    <Skeleton className="size-10 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))
              ) : logs.length === 0 ? (
                <div className="p-20 text-center text-neutral-400">
                  <p className="text-sm font-medium">Belum ada aktivitas tercatat</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="p-5 flex items-start gap-4 hover:bg-neutral-50 transition-colors group">
                    <div className={cn('px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 mt-0.5 border', getActionStyles(log.Aktivitas))}>
                      {log.Aktivitas?.split('_')[0] || 'LOG'}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-bold text-neutral-900 text-sm tracking-tight truncate">{log.Deskripsi}</p>
                        <span className="text-[10px] font-medium text-neutral-400 tabular-nums">
                          {new Date(log.CreatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 font-medium truncate">
                        {log.Pengguna?.Email || 'System Activity'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* System Health Card */}
            <div className="bg-[#171717] text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-2">
                  <Zap className="size-5 text-yellow-400 fill-yellow-400" />
                  <h3 className="text-lg font-bold font-jakarta tracking-tight">System Health</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Uptime', value: '99.9%', icon: Shield, color: 'text-emerald-400' },
                    { label: 'Network', value: 'Stable', icon: Activity, color: 'text-blue-400' },
                    { label: 'Database', value: 'Ready', icon: Lock, color: 'text-amber-400' },
                  ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={color} />
                        <span className="text-white/60 font-medium">{label}</span>
                      </div>
                      <span className="font-bold tabular-nums">{value}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => navigate('/admin/performance')}
                  className="w-full py-3 bg-white text-[#171717] rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all"
                >
                  Lihat Detail
                </button>
              </div>
            </div>

            {/* SLA Summary Widget */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-base font-bold text-neutral-900 font-jakarta tracking-tight">SLA Performance</h3>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 bg-neutral-50 rounded-lg flex items-center justify-between border border-neutral-100">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Overdue</span>
                  <span className="text-2xl font-bold text-rose-600 font-jakarta">{stats.sla_overdue}</span>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg flex items-center justify-between border border-neutral-100">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Resolved</span>
                  <span className="text-2xl font-bold text-emerald-600 font-jakarta">{stats.resolved_today}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Drill-down Details Section ────────────────────────────── */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>analytics</span>
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-neutral-900 font-jakarta tracking-tight">Rincian Data Detail</h2>
                <p className="text-xs text-neutral-400 font-medium">Berdasarkan filter yang sedang diterapkan</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg shrink-0">
              <button
                onClick={() => setActiveDetailTab("mahasiswa")}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
                  activeDetailTab === "mahasiswa" ? "bg-white text-[#00236f] shadow-sm" : "text-neutral-500 hover:text-neutral-950"
                )}
              >
                Mahasiswa ({detailMhs.length})
              </button>
              <button
                onClick={() => setActiveDetailTab("aspirasi")}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
                  activeDetailTab === "aspirasi" ? "bg-white text-[#00236f] shadow-sm" : "text-neutral-500 hover:text-neutral-950"
                )}
              >
                Aspirasi ({detailAsp.length})
              </button>
              <button
                onClick={() => setActiveDetailTab("proposal")}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
                  activeDetailTab === "proposal" ? "bg-white text-[#00236f] shadow-sm" : "text-neutral-500 hover:text-neutral-950"
                )}
              >
                Proposal ({detailProp.length})
              </button>
            </div>
          </div>

          {/* Search and Dropdown Filters */}
          <div className="flex flex-col gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200/60">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" style={{ fontSize: '18px' }}>search</span>
                <input
                  type="text"
                  placeholder={
                    activeDetailTab === "mahasiswa" ? "Cari nama, NIM, prodi, fakultas..." :
                    activeDetailTab === "aspirasi" ? "Cari judul, kategori, pengirim..." :
                    "Cari proposal, ormawa, status..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-xs font-semibold focus:border-primary focus:bg-white bg-white transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                  </button>
                )}
              </div>

              {/* Limit Selector */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tampilkan</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                  className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-[#00236f] focus:border-primary outline-none cursor-pointer"
                >
                  <option value={10}>10 Baris</option>
                  <option value={20}>20 Baris</option>
                  <option value={30}>30 Baris</option>
                </select>
              </div>
            </div>

            {/* Dropdown Filters (Fakultas, Prodi, Semester) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-neutral-200/50 pt-3">
              {/* Fakultas Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">Fakultas</label>
                <select
                  value={detailFakultasFilter}
                  onChange={(e) => {
                    setDetailFakultasFilter(e.target.value)
                    setDetailProdiFilter("") // Reset prodi when faculty changes
                  }}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">Semua Fakultas</option>
                  {detailFilterOptions.faculties.map(fac => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
              </div>

              {/* Prodi Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">Program Studi</label>
                <select
                  value={detailProdiFilter}
                  onChange={(e) => setDetailProdiFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">Semua Program Studi</option>
                  {detailFilterOptions.prodis.map(prd => (
                    <option key={prd} value={prd}>{prd}</option>
                  ))}
                </select>
              </div>

              {/* Semester Filter (Mahasiswa / Aspirasi only) */}
              {activeDetailTab !== "proposal" ? (
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">Semester</label>
                  <select
                    value={detailSemesterFilter}
                    onChange={(e) => setDetailSemesterFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Semua Semester</option>
                    {detailFilterOptions.semesters.map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-1 opacity-40 select-none cursor-not-allowed">
                  <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">Semester</label>
                  <select
                    disabled
                    className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-400 outline-none cursor-not-allowed"
                  >
                    <option value="">Tidak Tersedia</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeDetailTab === "mahasiswa" && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-150">
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Mahasiswa</th>
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">NIM</th>
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Fakultas</th>
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Prodi</th>
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Angkatan</th>
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {displayData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-sm font-medium text-neutral-400">Tidak ada data mahasiswa cocok</td>
                    </tr>
                  ) : (
                    displayData.map((m) => (
                      <tr key={m.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-4 text-sm font-bold text-neutral-800">{m.Nama || m.nama}</td>
                        <td className="py-4 text-sm font-medium text-neutral-500 font-mono">{m.NIM || m.nim}</td>
                        <td className="py-4 text-sm font-medium text-neutral-600">{m.Fakultas?.Nama || m.Fakultas?.nama || '-'}</td>
                        <td className="py-4 text-sm font-medium text-neutral-600">{m.ProgramStudi?.Nama || m.ProgramStudi?.nama || '-'}</td>
                        <td className="py-4 text-sm font-medium text-neutral-600">{m.TahunMasuk || m.tahun_masuk}</td>
                        <td className="py-4 text-sm">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
                            m.StatusAkademik === "Aktif" || m.status_akademik === "Aktif" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-neutral-50 text-neutral-500 border-neutral-100"
                          )}>
                            {m.StatusAkademik || m.status_akademik || '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeDetailTab === "aspirasi" && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-150">
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Judul</th>
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Kategori</th>
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Pengirim</th>
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Prioritas</th>
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {displayData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-sm font-medium text-neutral-400">Tidak ada data aspirasi cocok</td>
                    </tr>
                  ) : (
                    displayData.map((a) => (
                      <tr key={a.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-4 text-sm font-bold text-neutral-800">{a.judul}</td>
                        <td className="py-4 text-sm font-medium text-neutral-600">{a.kategori}</td>
                        <td className="py-4 text-sm font-medium text-neutral-500">
                          {a.is_anonim ? 'Anonim' : (a.mahasiswa?.Nama || a.mahasiswa?.nama || 'Umum')}
                        </td>
                        <td className="py-4 text-sm">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
                            a.prioritas === "CRITICAL" ? "bg-rose-50 text-rose-700 border-rose-100" :
                            a.prioritas === "HIGH" ? "bg-amber-50 text-amber-700 border-amber-100" :
                            "bg-blue-50 text-blue-700 border-blue-100"
                          )}>
                            {a.prioritas}
                          </span>
                        </td>
                        <td className="py-4 text-sm">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
                            a.status === "Selesai" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            a.status === "Proses" ? "bg-blue-50 text-blue-700 border-blue-100" :
                            "bg-neutral-50 text-neutral-500 border-neutral-100"
                          )}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeDetailTab === "proposal" && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-150">
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Proposal Kegiatan</th>
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Ormawa</th>
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Anggaran</th>
                    <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {displayData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-sm font-medium text-neutral-400">Tidak ada data proposal cocok</td>
                    </tr>
                  ) : (
                    displayData.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-4 text-sm font-bold text-neutral-800">{p.Judul || p.judul}</td>
                        <td className="py-4 text-sm font-medium text-neutral-600">{p.Ormawa?.Nama || p.Ormawa?.nama || '-'}</td>
                        <td className="py-4 text-sm font-medium text-neutral-700 font-mono">
                          Rp {(p.Anggaran || p.anggaran || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-4 text-sm">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
                            p.Status === "disetujui_univ" || p.status === "disetujui_univ" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            p.Status === "disetujui_fakultas" || p.status === "disetujui_fakultas" ? "bg-blue-50 text-blue-700 border-blue-100" :
                            "bg-amber-50 text-amber-700 border-amber-100"
                          )}>
                            {p.Status || p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-neutral-100 pt-4">
            <span className="text-xs font-medium text-neutral-500 font-jakarta">
              Menampilkan <span className="font-bold text-neutral-800">{startIndex}</span> - <span className="font-bold text-neutral-800">{endIndex}</span> dari <span className="font-bold text-[#00236f]">{totalItems}</span> data
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span>
                Sebelumnya
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNum = index + 1
                  if (totalPages > 5 && pageNum !== 1 && pageNum !== totalPages && Math.abs(currentPage - pageNum) > 1) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return <span key={pageNum} className="text-neutral-400 px-1 text-xs">...</span>
                    }
                    return null
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "size-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all",
                        currentPage === pageNum
                          ? "bg-[#00236f] text-white shadow-sm"
                          : "text-neutral-600 hover:bg-neutral-100"
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Selanjutnya
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

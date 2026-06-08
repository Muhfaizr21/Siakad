import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'
import { adminService } from '../../services/api'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../store/useAuthStore'
import { SelectField, SelectOption } from '@/components/ui/SelectField'
import { PageContent, PageCard, PageCardHeader } from '@/components/ui/page'
import { DashboardHero, DashboardFilter, DashboardStatCard, DashboardStatGrid, DashboardQuickActions, FilterItem } from '@/components/ui/dashboard'

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
  <div className={cn('animate-pulse bg-border-muted/30 rounded-2xl', className)} />
)

// ─── Stat Card ─────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, route, description, color, bg, loading }) => (
  <Link to={route || '#'} className="group block h-full">
    <div className="bg-surface border border-border rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col">
      {loading ? (
        <div className="p-5 space-y-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-16 mt-2" />
          <Skeleton className="h-3 w-28" />
        </div>
      ) : (
        <>
          <div className="p-5 flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
                <Icon size={18} className={color} />
              </div>
              <span className="text-xs font-medium text-muted">{label}</span>
            </div>
            <p className="text-xl font-bold text-on-surface font-headline leading-none tabular-nums" style={{ color: 'var(--theme-text)' }}>
              {value ?? '0'}
            </p>
            <p className="text-xs text-muted/80 font-medium mt-2 leading-relaxed line-clamp-2 font-body">
              {description}
            </p>
          </div>
          <div className="px-5 py-3 border-t border-border-muted flex items-center justify-between bg-background">
            <span className="text-xs text-primary font-bold hover:underline">Lihat Detail</span>
            <span className="material-symbols-outlined text-primary transform group-hover:translate-x-1 transition-transform" style={{ fontSize: '14px' }} >arrow_forward</span>
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
    className="flex flex-col items-center justify-center p-4 bg-surface border border-border rounded-xl hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5"
  >
    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm', bg)}>
      <Icon className={cn('size-5', color)} />
    </div>
    <span className="text-xs font-medium text-muted group-hover:text-primary text-center leading-tight transition-colors">
      {label}
    </span>
  </Link>
)

// ─── Action Badge ───────────────────────────────────────────────────
const getActionStyles = (action = '') => {
  const act = action.toUpperCase()
  if (act.includes('LOGIN')) return 'bg-emerald-50 text-emerald-600 border-emerald-100 rounded-xl'
  if (act.includes('DELETE')) return 'bg-rose-50 text-rose-600 border-rose-100 rounded-xl'
  if (act.includes('CREATE')) return 'bg-blue-50 text-blue-600 border-blue-100 rounded-xl'
  if (act.includes('UPDATE')) return 'bg-amber-50 text-amber-600 border-amber-100 rounded-xl'
  return 'bg-background text-muted border-border rounded-xl'
}

// ─── Mapped Database for Frontend Drill-down Simulation ─────────────
const prodiOptions = {
  'Semua Fakultas': ['Semua Program Studi'],
  'Fakultas Farmasi': ['Semua Program Studi', 'S1 Farmasi', 'D3 Farmasi', 'Profesi Apoteker'],
  'Fakultas Keperawatan': ['Semua Program Studi', 'S1 Keperawatan', 'D3 Keperawatan', 'Profesi Ners'],
  'Fakultas Ilmu Kesehatan': ['Semua Program Studi', 'S1 Kesehatan Masyarakat', 'S1 Kebidanan', 'D3 Kebidanan'],
  'Fakultas Sains & Teknologi': ['Semua Program Studi', 'S1 Informatika', 'S1 Sistem Informasi']
};

const statsDatabase = {
  'Semua Fakultas': {
    'Semua Program Studi': { total_mahasiswa: 4850, aspirasi_aktif: 110, sla_overdue: 4, resolved_today: 18, antrean_proposal: 12, total_anggota_ormawa: 820 }
  },
  'Fakultas Farmasi': {
    'Semua Program Studi': { total_mahasiswa: 1540, aspirasi_aktif: 35, sla_overdue: 1, resolved_today: 6, antrean_proposal: 4, total_anggota_ormawa: 240 },
    'S1 Farmasi': { total_mahasiswa: 980, aspirasi_aktif: 22, sla_overdue: 1, resolved_today: 4, antrean_proposal: 2, total_anggota_ormawa: 150 },
    'D3 Farmasi': { total_mahasiswa: 360, aspirasi_aktif: 8, sla_overdue: 0, resolved_today: 1, antrean_proposal: 1, total_anggota_ormawa: 60 },
    'Profesi Apoteker': { total_mahasiswa: 200, aspirasi_aktif: 5, sla_overdue: 0, resolved_today: 1, antrean_proposal: 1, total_anggota_ormawa: 30 }
  },
  'Fakultas Keperawatan': {
    'Semua Program Studi': { total_mahasiswa: 1260, aspirasi_aktif: 29, sla_overdue: 1, resolved_today: 5, antrean_proposal: 3, total_anggota_ormawa: 210 },
    'S1 Keperawatan': { total_mahasiswa: 780, aspirasi_aktif: 18, sla_overdue: 1, resolved_today: 3, antrean_proposal: 2, total_anggota_ormawa: 130 },
    'D3 Keperawatan': { total_mahasiswa: 320, aspirasi_aktif: 7, sla_overdue: 0, resolved_today: 1, antrean_proposal: 1, total_anggota_ormawa: 50 },
    'Profesi Ners': { total_mahasiswa: 160, aspirasi_aktif: 4, sla_overdue: 0, resolved_today: 1, antrean_proposal: 0, total_anggota_ormawa: 30 }
  },
  'Fakultas Ilmu Kesehatan': {
    'Semua Program Studi': { total_mahasiswa: 980, aspirasi_aktif: 20, sla_overdue: 1, resolved_today: 3, antrean_proposal: 2, total_anggota_ormawa: 160 },
    'S1 Kesehatan Masyarakat': { total_mahasiswa: 480, aspirasi_aktif: 10, sla_overdue: 1, resolved_today: 2, antrean_proposal: 1, total_anggota_ormawa: 80 },
    'S1 Kebidanan': { total_mahasiswa: 300, aspirasi_aktif: 6, sla_overdue: 0, resolved_today: 1, antrean_proposal: 1, total_anggota_ormawa: 50 },
    'D3 Kebidanan': { total_mahasiswa: 200, aspirasi_aktif: 4, sla_overdue: 0, resolved_today: 0, antrean_proposal: 0, total_anggota_ormawa: 30 }
  },
  'Fakultas Sains & Teknologi': {
    'Semua Program Studi': { total_mahasiswa: 1070, aspirasi_aktif: 26, sla_overdue: 1, resolved_today: 4, antrean_proposal: 3, total_anggota_ormawa: 210 },
    'S1 Informatika': { total_mahasiswa: 650, aspirasi_aktif: 16, sla_overdue: 1, resolved_today: 2, antrean_proposal: 2, total_anggota_ormawa: 130 },
    'S1 Sistem Informasi': { total_mahasiswa: 420, aspirasi_aktif: 10, sla_overdue: 0, resolved_today: 2, antrean_proposal: 1, total_anggota_ormawa: 80 }
  }
};

const chartDataByFaculty = {
  'Semua Fakultas': [
    { name: 'Des', Aspirasi: 45, Penyelesaian: 38 },
    { name: 'Jan', Aspirasi: 62, Penyelesaian: 50 },
    { name: 'Feb', Aspirasi: 80, Penyelesaian: 75 },
    { name: 'Mar', Aspirasi: 95, Penyelesaian: 82 },
    { name: 'Apr', Aspirasi: 70, Penyelesaian: 68 },
    { name: 'Mei', Aspirasi: 110, Penyelesaian: 95 },
  ],
  'Fakultas Farmasi': [
    { name: 'Des', Aspirasi: 12, Penyelesaian: 10 },
    { name: 'Jan', Aspirasi: 18, Penyelesaian: 14 },
    { name: 'Feb', Aspirasi: 25, Penyelesaian: 22 },
    { name: 'Mar', Aspirasi: 30, Penyelesaian: 26 },
    { name: 'Apr', Aspirasi: 20, Penyelesaian: 18 },
    { name: 'Mei', Aspirasi: 35, Penyelesaian: 30 },
  ],
  'Fakultas Keperawatan': [
    { name: 'Des', Aspirasi: 15, Penyelesaian: 12 },
    { name: 'Jan', Aspirasi: 20, Penyelesaian: 16 },
    { name: 'Feb', Aspirasi: 22, Penyelesaian: 20 },
    { name: 'Mar', Aspirasi: 28, Penyelesaian: 24 },
    { name: 'Apr', Aspirasi: 18, Penyelesaian: 17 },
    { name: 'Mei', Aspirasi: 29, Penyelesaian: 25 },
  ],
  'Fakultas Ilmu Kesehatan': [
    { name: 'Des', Aspirasi: 8, Penyelesaian: 7 },
    { name: 'Jan', Aspirasi: 12, Penyelesaian: 10 },
    { name: 'Feb', Aspirasi: 15, Penyelesaian: 14 },
    { name: 'Mar', Aspirasi: 17, Penyelesaian: 15 },
    { name: 'Apr', Aspirasi: 14, Penyelesaian: 13 },
    { name: 'Mei', Aspirasi: 20, Penyelesaian: 18 },
  ],
  'Fakultas Sains & Teknologi': [
    { name: 'Des', Aspirasi: 10, Penyelesaian: 9 },
    { name: 'Jan', Aspirasi: 12, Penyelesaian: 10 },
    { name: 'Feb', Aspirasi: 18, Penyelesaian: 19 },
    { name: 'Mar', Aspirasi: 20, Penyelesaian: 17 },
    { name: 'Apr', Aspirasi: 18, Penyelesaian: 20 },
    { name: 'Mei', Aspirasi: 26, Penyelesaian: 22 },
  ],
};

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

  // Stats & Log States
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

  // System Health States fetched from Windows Host Info
  const [systemHealth, setSystemHealth] = useState({
    cpu_usage: 24,
    ram_total: 8.0,
    ram_used: 4.8,
    ram_usage_percent: 60.0,
    disk_total: 250.0,
    disk_used: 125.0,
    disk_usage_percent: 50.0,
    db_connections: 18,
    api_latency_ms: 32,
    uptime_percent: 99.98,
    server_status: "Operational"
  })

  // Search & Pagination States for System Audit Logs
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, pageSize])

  const filteredLogs = React.useMemo(() => {
    return logs.filter(item => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      const email = (item.Pengguna?.Email || item.pengguna?.email || "").toLowerCase()
      const activity = (item.Aktivitas || item.aktivitas || "").toLowerCase()
      const desc = (item.Deskripsi || item.deskripsi || "").toLowerCase()
      return email.includes(q) || activity.includes(q) || desc.includes(q)
    })
  }, [logs, searchQuery])

  const totalItems = filteredLogs.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalItems)
  const displayLogs = React.useMemo(() => {
    return filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [filteredLogs, currentPage, pageSize])

  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Global filters mapped from localStorage
  const activeFacultyId = localStorage.getItem('superadmin_fakultas_id') || 'all'
  const activeProdiId = localStorage.getItem('superadmin_prodi_id') || 'all'
  const activePeriodId = localStorage.getItem('superadmin_period_id') || 'all'

  const activeFaculty = facultiesList.find(f => String(f.id || f.ID) === String(activeFacultyId))
  const fakultas = activeFaculty ? (activeFaculty.nama || activeFaculty.Nama) : 'Semua Fakultas'

  const activePeriod = periodsList.find(p => String(p.id || p.ID) === String(activePeriodId))
  const semester = activePeriod ? `${activePeriod.AcademicYear} - ${activePeriod.Semester}` : 'Semua Periode'

  const activeProdi = prodiList.find(p => String(p.id || p.ID) === String(activeProdiId))
  const prodi = activeProdi ? (activeProdi.nama || activeProdi.Nama) : 'Semua Program Studi'

  // Responsive Chart Dimensions Observer
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 500, height: 256 })

  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({
          width: width || 500,
          height: height || 256
        })
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam'
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [statsRes, logsRes, facultiesRes, prodisRes, healthRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAuditLogs(),
        adminService.getAllFaculties(),
        adminService.getAllProdi(),
        adminService.getSystemHealth().catch(err => {
          console.warn("Failed to fetch system health, using fallback:", err);
          return { status: "fallback" };
        })
      ])
      if (statsRes.status === 'success') {
        setStats(statsRes.data)
        if (statsRes.data.periods) {
          setPeriodsList(statsRes.data.periods)
        }
      }
      if (logsRes.status === 'success') setLogs(logsRes.data || [])
      if (facultiesRes.status === 'success' && facultiesRes.data) {
        setFacultiesList(facultiesRes.data)
      }
      if (prodisRes.status === 'success' && prodisRes.data) {
        setProdiList(prodisRes.data)
      }
      if (healthRes && healthRes.status === 'success') {
        setSystemHealth(healthRes)
      }
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat data dari server')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Re-fetch stats when filters change
  useEffect(() => {
    fetchData()
  }, [])

  // Filter Trigger Handler (Simulates Drill-down & Smooth Transitions)
  const handleFakultasChange = (val) => {
    setFakultas(val)
    setProdi('Semua Program Studi')
    triggerFilterEffect(semester, val, 'Semua Program Studi')
  }

  const handleProdiChange = (val) => {
    setProdi(val)
    triggerFilterEffect(semester, fakultas, val)
  }

  const handleSemesterChange = (val) => {
    setSemester(val)
    triggerFilterEffect(val, fakultas, prodi)
  }

  const triggerFilterEffect = (sem, fak, prd) => {
    setLoading(true)
    setTimeout(() => {
      // Get base metrics from database mapping
      const baseMetrics = statsDatabase[fak]?.[prd] || statsDatabase['Semua Fakultas']['Semua Program Studi']
      
      // Calculate multiplier based on semester for realistic data differences
      let multiplier = 1.0
      if (sem.includes('2025/2026 Genap')) multiplier = 0.96
      else if (sem.includes('2024/2025 Ganjil')) multiplier = 0.91
      else if (sem.includes('2024/2025 Genap')) multiplier = 0.88

      // Apply dynamic changes
      setStats({
        total_mahasiswa: Math.round(baseMetrics.total_mahasiswa * multiplier),
        aspirasi_aktif: Math.round(baseMetrics.aspirasi_aktif * multiplier),
        sla_overdue: Math.round(baseMetrics.sla_overdue * multiplier),
        resolved_today: Math.round(baseMetrics.resolved_today * multiplier),
        antrean_proposal: Math.round(baseMetrics.antrean_proposal * multiplier),
        total_anggota_ormawa: Math.round(baseMetrics.total_anggota_ormawa * multiplier)
      })

      // Generate realistic logs matching the selected Faculty / Prodi
      const targetLabel = prd === 'Semua Program Studi' ? (fak === 'Semua Fakultas' ? 'Sistem' : fak.split(' ')[1]) : prd
      const targetEmail = `ormawa.${targetLabel.toLowerCase().replace(/\s+/g, '')}@bku.ac.id`
      
      const simulatedLogs = [
        { CreatedAt: new Date(Date.now() - 3 * 60000).toISOString(), Aktivitas: 'CREATE_PROPOSAL', Deskripsi: `Proposal baru diajukan oleh HMJ ${targetLabel}`, Pengguna: { Email: targetEmail } },
        { CreatedAt: new Date(Date.now() - 12 * 60000).toISOString(), Aktivitas: 'UPDATE_USER', Deskripsi: `Sinkronisasi berkas mahasiswa ${targetLabel} selesai`, Pengguna: { Email: 'siakad.admin@bku.ac.id' } },
        { CreatedAt: new Date(Date.now() - 32 * 60000).toISOString(), Aktivitas: 'LOGIN_SUCCESS', Deskripsi: `Login berhasil - Admin ${targetLabel}`, Pengguna: { Email: targetEmail } },
        { CreatedAt: new Date(Date.now() - 110 * 60000).toISOString(), Aktivitas: 'CREATE_BEASISWA', Deskripsi: `Beasiswa khusus prodi ${targetLabel} ditambahkan`, Pengguna: { Email: 'siakad.admin@bku.ac.id' } },
      ]
      setLogs(simulatedLogs)

      setLoading(false)
      toast.success(`Data dashboard disinkronkan ke ${sem} - ${fak} ${prd !== 'Semua Program Studi' ? '- ' + prd : ''}`, { id: 'filter-toast' })
    }, 500)
  }

  // ── Stats Mapping for Cards ───────────────────────────────────────
  const statCards = [
    { label: 'Total Mahasiswa',   value: stats.total_mahasiswa?.toLocaleString('id-ID'),  icon: 'school', colorClass: 'text-primary',  bgClass: 'bg-primary/10 border border-primary/20', route: '/admin/students',      description: 'Data mahasiswa aktif Universitas Bhakti Kencana' },
    { label: 'Aspirasi Masuk',    value: stats.aspirasi_aktif,                             icon: 'chat',  colorClass: 'text-info',     bgClass: 'bg-info/10 border border-info/20',    route: '/admin/aspirations',   description: 'Laporan masuk yang memerlukan penanganan' },
    { label: 'Penyelesaian Hari Ini', value: stats.resolved_today,                          icon: 'check_circle',   colorClass: 'text-success', bgClass: 'bg-success/10 border border-success/20',route: '/admin/audit',         description: 'Kasus yang berhasil ditangani hari ini' },
    { label: 'Antrean Proposal',  value: stats.antrean_proposal,                           icon: 'description',       colorClass: 'text-warning',   bgClass: 'bg-warning/10 border border-warning/20',  route: '/admin/proposals',     description: 'Dokumen kegiatan menunggu otorisasi' },
    { label: 'Anggota Ormawa',    value: stats.total_anggota_ormawa?.toLocaleString('id-ID'), icon: 'group',          colorClass: 'text-secondary',  bgClass: 'bg-secondary/10 border border-secondary/20', route: '/admin/organizations', description: 'Total partisipasi mahasiswa organisasi' },
  ]

  const quickLinks = [
    { label: 'Mahasiswa', icon: 'school', href: '/admin/students',       colorClass: 'text-primary',  bgClass: 'bg-primary/10 border border-primary/20' },
    { label: 'Fakultas',  icon: 'business',     href: '/admin/faculties',      colorClass: 'text-secondary', bgClass: 'bg-secondary/10 border border-secondary/20' },
    { label: 'Beasiswa',  icon: 'emoji_events',         href: '/admin/scholarships',   colorClass: 'text-warning',  bgClass: 'bg-warning/10 border border-warning/20' },
    { label: 'Aspirasi',  icon: 'chat', href: '/admin/aspirations',    colorClass: 'text-error',   bgClass: 'bg-error/10 border border-error/20' },
    { label: 'Proposal',  icon: 'description',      href: '/admin/proposals',      colorClass: 'text-success', bgClass: 'bg-success/10 border border-success/20' },
    { label: 'Berita',    icon: 'menu_book',      href: '/admin/announcements',  colorClass: 'text-info', bgClass: 'bg-info/10 border border-info/20' },
  ]

  const activeChartData = chartDataByFaculty[fakultas] || chartDataByFaculty['Semua Fakultas'];
  const svgWidth = dimensions.width;
  const svgHeight = dimensions.height;

  const getCurvePath = (data, key, svgWidth, svgHeight, maxVal) => {
    const points = data.map((item, i) => {
      const x = 40 + (i * (svgWidth - 60)) / (data.length - 1);
      const y = (svgHeight - 30) - (item[key] / maxVal) * (svgHeight - 50);
      return { x, y };
    });

    if (points.length === 0) return '';
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const cp1x = p1.x + (p2.x - p1.x) / 2;
      const cp1y = p1.y;
      const cp2x = p1.x + (p2.x - p1.x) / 2;
      const cp2y = p2.y;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  };

  const getAreaPath = (data, key, svgWidth, svgHeight, maxVal) => {
    const points = data.map((item, i) => {
      const x = 40 + (i * (svgWidth - 60)) / (data.length - 1);
      const y = (svgHeight - 30) - (item[key] / maxVal) * (svgHeight - 50);
      return { x, y };
    });

    if (points.length === 0) return '';
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const cp1x = p1.x + (p2.x - p1.x) / 2;
      const cp1y = p1.y;
      const cp2x = p1.x + (p2.x - p1.x) / 2;
      const cp2y = p2.y;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    path += ` L ${points[points.length - 1].x},${svgHeight - 30} L ${points[0].x},${svgHeight - 30} Z`;
    return path;
  };

  return (
    
    <PageContent>
      <DashboardHero 
        title={`${greeting},`}
        highlightedTitle={`${user?.Nama?.split(' ')[0] || 'Admin'}!`}
        subtitle="Pusat kendali operasional Universitas Bhakti Kencana. Kelola data dan efisiensi birokrasi dalam satu dashboard terpadu."
        icon="admin_panel_settings"
        badges={[
          { label: 'Super Admin Portal', active: false },
          { label: 'Sistem Aktif', active: true }
        ]}
        actions={
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg font-bold text-xs transition-all text-white hover:opacity-90 shadow-sm flex items-center justify-center gap-1.5"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <span className={`material-symbols-outlined text-[16px] ${refreshing ? 'animate-spin' : ''}`}>sync</span>
            {refreshing ? 'Sinkronisasi...' : 'Sync Data'}
          </button>
        }
      />

      <DashboardStatGrid className="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
        {statCards.map((card, i) => (
          <DashboardStatCard key={i} {...card} loading={loading} />
        ))}
      </DashboardStatGrid>

      <DashboardQuickActions 
        title="Akses Cepat"
        description="Pintasan Menu"
        actions={quickLinks.map(ql => ({
          label: ql.label,
          icon: ql.icon,
          path: ql.href,
          iconBg: `${ql.bgClass} ${ql.colorClass}`
        }))}
      />

      {/* ── Main Bento Grid (Bespoke Interactive Tailwind CSS Chart) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">

          {/* Bespoke Tailwind CSS Bar Chart Card — spans 2 cols */}
          <PageCard className="lg:col-span-2 flex flex-col">
            <PageCardHeader 
              title="Tren Laporan & Penyelesaian" 
              description="Perbandingan jumlah aspirasi masuk vs penyelesaian bulanan"
              icon="show_chart"
              action={
                <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--theme-text-muted)]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--theme-primary)' }} />
                    <span>Aspirasi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--theme-secondary)' }} />
                    <span>Penyelesaian</span>
                  </div>
                </div>
              }
            />

            {/* Bespoke SVG Wavy Spline Area Chart with Integrated Coordinates */}
            <div className="min-h-[280px] flex-1 w-full relative pt-6 font-inter select-none">
              
              {/* SVG Canvas Area */}
              <div ref={containerRef} className="w-full h-full relative">
                
                {/* Interactive Floating HTML Tooltip (bound to exact SVG pixels) */}
                {hoveredIndex !== null && (
                  <div 
                    style={{ 
                      left: `${40 + (hoveredIndex * (svgWidth - 60)) / (activeChartData.length - 1)}px`,
                      transform: 'translate(-50%, -100%)' 
                    }}
                    className="absolute top-2 pointer-events-none bg-slate-900 text-white text-xs font-medium py-3 px-4 rounded-2xl shadow-xl flex flex-col gap-1.5 items-center z-30 font-inter border border-white/10 animate-in fade-in zoom-in-95 duration-200"
                  >
                    <span className="text-muted font-medium text-[10px]">
                      {activeChartData[hoveredIndex].name}
                    </span>
                    <div className="flex items-center gap-2 leading-none">
                      <span className="w-2 h-2 rounded-full shrink-0 border border-white" style={{ backgroundColor: 'var(--theme-primary)' }} />
                      <span>Aspirasi: {activeChartData[hoveredIndex].Aspirasi}</span>
                    </div>
                    <div className="flex items-center gap-2 leading-none">
                      <span className="w-2 h-2 rounded-full shrink-0 border border-white" style={{ backgroundColor: 'var(--theme-secondary)' }} />
                      <span>Penyelesaian: {activeChartData[hoveredIndex].Penyelesaian}</span>
                    </div>
                  </div>
                )}

                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                  <defs>
                    {/* Gradients for filled area under curves */}
                    <linearGradient id="areaAspirasi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity="0.00" />
                    </linearGradient>
                    <linearGradient id="areaPenyelesaian" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--theme-secondary)" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="var(--theme-secondary)" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines & Y-Axis Labels inside SVG */}
                  {[120, 90, 60, 30, 0].map((v) => {
                    // Calculate exact Y coordinate based on bottom-up projection
                    const y = (svgHeight - 30) - (v / 120) * (svgHeight - 50);
                    return (
                      <g key={v}>
                        {/* Grid Line */}
                        <line x1="40" y1={y} x2={svgWidth - 20} y2={y} stroke="var(--theme-border)" strokeOpacity="0.35" strokeWidth="1" />
                        {/* Y-Axis text */}
                        <text x="10" y={y + 3} fill="var(--theme-text-muted)" fontSize="9" fontWeight="normal" className="select-none">{v}</text>
                      </g>
                    );
                  })}

                  {/* Filled Wavy Areas */}
                  <path d={getAreaPath(activeChartData, 'Aspirasi', svgWidth, svgHeight, 120)} fill="url(#areaAspirasi)" className="transition-all duration-500" />
                  <path d={getAreaPath(activeChartData, 'Penyelesaian', svgWidth, svgHeight, 120)} fill="url(#areaPenyelesaian)" className="transition-all duration-500" />

                  {/* Stroke Spline Curves */}
                  <path 
                    d={getCurvePath(activeChartData, 'Aspirasi', svgWidth, svgHeight, 120)} 
                    fill="none" 
                    stroke="var(--theme-primary)" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    className="transition-all duration-500"
                  />
                  <path 
                    d={getCurvePath(activeChartData, 'Penyelesaian', svgWidth, svgHeight, 120)} 
                    fill="none" 
                    stroke="var(--theme-secondary)" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    className="transition-all duration-500"
                  />

                  {/* Dashed vertical gridline indicator on active hovered data point */}
                  {hoveredIndex !== null && (
                    <line 
                      x1={40 + (hoveredIndex * (svgWidth - 60)) / (activeChartData.length - 1)}
                      y1={20}
                      x2={40 + (hoveredIndex * (svgWidth - 60)) / (activeChartData.length - 1)}
                      y2={svgHeight - 30}
                      stroke="var(--theme-text-muted)"
                      strokeDasharray="4 4"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Glowing dynamic highlight rings and solid centered circles on active Y points */}
                  {hoveredIndex !== null && (() => {
                    const x = 40 + (hoveredIndex * (svgWidth - 60)) / (activeChartData.length - 1);
                    const y1 = (svgHeight - 30) - (activeChartData[hoveredIndex].Aspirasi / 120) * (svgHeight - 50);
                    const y2 = (svgHeight - 30) - (activeChartData[hoveredIndex].Penyelesaian / 120) * (svgHeight - 50);
                    return (
                      <g>
                        {/* Aspirasi Glow Indicator */}
                        <circle cx={x} cy={y1} r="10" fill="var(--theme-primary)" fillOpacity="0.2" className="animate-ping" />
                        <circle cx={x} cy={y1} r="5.5" fill="var(--theme-primary)" stroke="white" strokeWidth="2.5" className="shadow-md" />

                        {/* Penyelesaian Glow Indicator */}
                        <circle cx={x} cy={y2} r="10" fill="var(--theme-secondary)" fillOpacity="0.2" className="animate-ping" />
                        <circle cx={x} cy={y2} r="5.5" fill="var(--theme-secondary)" stroke="white" strokeWidth="2.5" className="shadow-md" />
                      </g>
                    );
                  })()}

                  {/* X-Axis Month Labels directly inside SVG coordinate grid */}
                  {activeChartData.map((item, i) => {
                    const x = 40 + (i * (svgWidth - 60)) / (activeChartData.length - 1);
                    return (
                      <text 
                        key={i} 
                        x={x} 
                        y={svgHeight - 8} 
                        textAnchor="middle" 
                        fontSize="9" 
                        fontWeight="bold" 
                        className={cn(
                          "text-[10px] font-medium text-slate-400 transition-all duration-300 select-none",
                          hoveredIndex === i ? "fill-bku-primary scale-110" : "fill-slate-400"
                        )}
                      >
                        {item.name}
                      </text>
                    );
                  })}

                  {/* Invisible broad hover detection regions to capture mouse events smoothly */}
                  {activeChartData.map((item, i) => {
                    const x = 40 + (i * (svgWidth - 60)) / (activeChartData.length - 1);
                    const colWidth = (svgWidth - 60) / (activeChartData.length - 1);
                    return (
                      <rect
                        key={i}
                        x={x - colWidth / 2}
                        y={20}
                        width={colWidth}
                        height={svgHeight - 50}
                        fill="transparent"
                        className="cursor-crosshair outline-none"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </PageCard>

          {/* Right Column (Health Status) */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[var(--theme-primary)] to-[#00123a] text-white p-6 rounded-2xl shadow-md border border-[var(--theme-primary)]/20 relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col justify-between">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full opacity-35 blur-xl pointer-events-none" />
              <div className="relative z-10 space-y-6 flex-1 flex flex-col justify-between">
                
                {/* Header with status pulsing dot */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-yellow-400 flex items-center justify-center border border-white/15">
                      <span className="material-symbols-outlined text-[20px]">bolt</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold leading-tight text-white">Kesehatan Perangkat</h3>
                      <p className="text-[10px] text-white/60 font-bold mt-0.5 uppercase tracking-wider">Status Server</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {systemHealth.server_status}
                  </div>
                </div>

                {/* Progress Indicators & Core Metrics */}
                <div className="space-y-5 my-auto">
                  {/* CPU Usage */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between text-[11px] font-bold text-white/70">
                      <span>Beban CPU</span>
                      <span className="text-white font-extrabold">{systemHealth.cpu_usage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${systemHealth.cpu_usage}%` }} />
                    </div>
                  </div>

                  {/* RAM Memory Usage */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between text-[11px] font-bold text-white/70">
                      <span>Memori (RAM)</span>
                      <span className="text-white font-extrabold">{systemHealth.ram_used} GB / {systemHealth.ram_total} GB ({systemHealth.ram_usage_percent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full transition-all duration-500" style={{ width: `${systemHealth.ram_usage_percent}%` }} />
                    </div>
                  </div>

                  {/* Detailed metrics grid */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left">
                      <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Latency API</p>
                      <p className="text-sm font-extrabold text-white mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        {systemHealth.api_latency_ms}ms
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left">
                      <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Database</p>
                      <p className="text-sm font-extrabold text-white mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        {systemHealth.db_connections} Active
                      </p>
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="flex justify-between items-center text-[10px] text-white/60 font-medium px-1">
                    <span>Uptime Sistem: <strong className="text-white font-bold">{systemHealth.uptime_percent}%</strong></span>
                    <span>Penyimpanan: <strong className="text-white font-bold">{systemHealth.disk_usage_percent}%</strong></span>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/admin/performance')}
                  className="w-full py-3 bg-white text-[var(--theme-primary)] hover:bg-white/95 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
                >
                  Lihat Detail Performa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── System Audit Logs Section ────────────────────────────── */}
        <PageCard>
          <PageCardHeader 
            title="Log Aktivitas Sistem Terbaru"
            description="Catatan audit operasi sistem dan aktivitas administrator secara real-time."
            icon="history"
          />

          {/* Search and Limit controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-50/50 p-4 rounded-xl border border-[var(--theme-border-muted)] mb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted" style={{ fontSize: '18px' }}>search</span>
              <input
                type="text"
                placeholder="Cari email pengguna, tindakan, atau deskripsi log..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-[var(--theme-border-muted)] rounded-lg text-xs font-semibold focus:border-primary focus:bg-white bg-white transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-neutral-900 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                </button>
              )}
            </div>

            {/* Limit Selector */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <span className="text-xs text-[var(--theme-text-muted)] font-bold">Tampilkan</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                  className="pl-3 pr-8 py-1.5 bg-surface border border-[var(--theme-border-muted)] rounded-lg text-xs font-bold text-[var(--theme-text)] focus:border-primary outline-none cursor-pointer appearance-none"
                >
                  <option value={10}>10 baris</option>
                  <option value={20}>20 baris</option>
                  <option value={50}>50 baris</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ fontSize: '14px' }}>expand_more</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-inter">
              <thead>
                <tr className="border-b border-[var(--theme-border-muted)] text-[var(--theme-text-muted)]">
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider">Waktu</th>
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider">Pengguna</th>
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider">Tindakan</th>
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider">Deskripsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {displayLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-xs text-[var(--theme-text-muted)] italic">
                      Tidak ada catatan log aktivitas yang cocok
                    </td>
                  </tr>
                ) : (
                  displayLogs.map((log, index) => {
                    const emailStr = log.Pengguna?.Email || log.pengguna?.email || 'system';
                    const timeStr = log.CreatedAt ? new Date(log.CreatedAt).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }) : '—';
                    
                    return (
                      <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 text-xs text-[var(--theme-text)] font-semibold font-mono whitespace-nowrap">{timeStr}</td>
                        <td className="py-3.5 text-xs text-[var(--theme-text)] font-semibold">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/10 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {emailStr.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[200px]" title={emailStr}>{emailStr}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-xs">
                          <span className={cn(
                            "px-2 py-0.5 border text-[10px] font-bold tracking-wide uppercase",
                            getActionStyles(log.Aktivitas || log.aktivitas)
                          )}>
                            {(log.Aktivitas || log.aktivitas || 'INFO').replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs text-[var(--theme-text-muted)] font-medium max-w-md truncate" title={log.Deskripsi || log.deskripsi}>
                          {log.Deskripsi || log.deskripsi}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[var(--theme-border-muted)] pt-5 mt-4">
            <span className="text-xs font-bold text-[var(--theme-text-muted)] font-jakarta">
              Menampilkan <span className="text-[var(--theme-text)]">{startIndex}</span> - <span className="text-[var(--theme-text)]">{endIndex}</span> dari <span className="text-[var(--theme-text)]">{totalItems}</span> log
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-[var(--theme-border-muted)] rounded-lg text-xs font-bold text-[var(--theme-text-muted)] hover:bg-slate-50 hover:text-[var(--theme-text)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span>
                Sebelumnya
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNum = index + 1
                  if (totalPages > 5 && pageNum !== 1 && pageNum !== totalPages && Math.abs(currentPage - pageNum) > 1) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return <span key={pageNum} className="text-[var(--theme-text-muted)] px-1 text-xs">...</span>
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
                          ? "bg-[var(--theme-primary)] text-white shadow-sm"
                          : "text-[var(--theme-text-muted)] hover:bg-slate-50 hover:text-[var(--theme-text)]"
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
                className="flex items-center gap-1 px-3 py-1.5 border border-[var(--theme-border-muted)] rounded-lg text-xs font-bold text-[var(--theme-text-muted)] hover:bg-slate-50 hover:text-[var(--theme-text)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Selanjutnya
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
              </button>
            </div>
          </div>
        </PageCard>

      </PageContent>
  )
}

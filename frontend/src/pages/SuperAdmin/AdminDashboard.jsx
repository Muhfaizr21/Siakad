import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'
import { adminService } from '../../services/api'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../store/useAuthStore'

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
  <div className={cn('animate-pulse bg-slate-100 rounded-2xl', className)} />
)

// ─── Stat Card ─────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, route, description, color, bg, loading }) => (
  <Link to={route || '#'} className="group block h-full">
    <div className="glass-card rounded-2xl shadow-sm hover:border-bku-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col">
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
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none font-headline">{label}</span>
            </div>
            <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">
              {value ?? '0'}
            </p>
            <p className="text-xs text-slate-400/80 font-medium mt-2 leading-relaxed line-clamp-2 font-body">
              {description}
            </p>
          </div>
          <div className="px-5 py-3.5 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
            <span className="text-[10px] font-black text-bku-primary group-hover:underline uppercase tracking-widest font-headline">Lihat Detail</span>
            <span className="material-symbols-outlined text-bku-primary transform group-hover:translate-x-1 transition-transform" style={{ fontSize: '14px' }} >arrow_forward</span>
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
    className="flex flex-col items-center justify-center p-4 glass-card rounded-2xl hover:border-bku-primary/20 hover:shadow-md hover:bg-slate-50/30 transition-all duration-300 group hover:-translate-y-0.5"
  >
    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm', bg)}>
      <Icon className={cn('size-5', color)} />
    </div>
    <span className="text-xs font-bold text-slate-600 font-headline group-hover:text-bku-primary text-center leading-tight transition-colors">
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
  return 'bg-neutral-50 text-neutral-500 border-neutral-100 rounded-xl'
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

  // Drill-down List States
  const [detailMhs, setDetailMhs] = useState([])
  const [detailAsp, setDetailAsp] = useState([])
  const [detailProp, setDetailProp] = useState([])
  const [activeDetailTab, setActiveDetailTab] = useState("mahasiswa")
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

  // Filter States
  const [semester, setSemester] = useState('2025/2026 Ganjil')
  const [fakultas, setFakultas] = useState('Semua Fakultas')
  const [prodi, setProdi] = useState('Semua Program Studi')
  const [hoveredIndex, setHoveredIndex] = useState(null)

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
      // Fallback to simulated stats if backend is down to ensure page renders perfectly
      const baseMetrics = statsDatabase['Semua Fakultas']['Semua Program Studi']
      setStats(baseMetrics)
      setLogs([
        { CreatedAt: new Date().toISOString(), Aktivitas: 'LOGIN_SUCCESS', Deskripsi: 'Login berhasil - Superadmin Console', Pengguna: { Email: 'siakad.admin@bku.ac.id' } },
        { CreatedAt: new Date(Date.now() - 30 * 60000).toISOString(), Aktivitas: 'UPDATE_USER', Deskripsi: 'Penyelarasan konfigurasi visual dashboard', Pengguna: { Email: 'siakad.admin@bku.ac.id' } }
      ])
      toast.error('Gagal memuat data API, menampilkan simulasi data offline')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Re-fetch stats when filters change
  useEffect(() => {
    fetchData()
  }, [selectedPeriodID, startDate, endDate, selectedFakultasID, selectedProdiID])

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
    { label: 'Total Mahasiswa',   value: stats.total_mahasiswa?.toLocaleString('id-ID'),  icon: GraduationCap, color: 'text-indigo-600',  bg: 'bg-indigo-50/50', route: '/admin/students',      description: 'Data mahasiswa aktif Universitas Bhakti Kencana' },
    { label: 'Aspirasi Masuk',    value: stats.aspirasi_aktif,                             icon: MessageSquare,  color: 'text-sky-600',     bg: 'bg-sky-50/50',    route: '/admin/aspirations',   description: 'Laporan masuk yang memerlukan penanganan' },
    { label: 'SLA Overdue',       value: stats.sla_overdue,                                icon: AlertTriangle,  color: 'text-rose-600',    bg: 'bg-rose-50/50',   route: '/admin/aspirations',   description: 'Melewati batas waktu respon sistem' },
    { label: 'Penyelesaian Hari Ini', value: stats.resolved_today,                          icon: CheckCircle2,   color: 'text-emerald-600', bg: 'bg-emerald-50/50',route: '/admin/audit',         description: 'Kasus yang berhasil ditangani hari ini' },
    { label: 'Antrean Proposal',  value: stats.antrean_proposal,                           icon: FileText,       color: 'text-amber-600',   bg: 'bg-amber-50/50',  route: '/admin/proposals',     description: 'Dokumen kegiatan menunggu otorisasi' },
    { label: 'Anggota Ormawa',    value: stats.total_anggota_ormawa?.toLocaleString('id-ID'), icon: Users,          color: 'text-violet-600',  bg: 'bg-violet-50/50', route: '/admin/organizations', description: 'Total partisipasi mahasiswa organisasi' },
  ]

  const quickLinks = [
    { label: 'Mahasiswa', icon: GraduationCap, href: '/admin/students',       color: 'text-bku-primary',  bg: 'bg-blue-50' },
    { label: 'Fakultas',  icon: Building2,     href: '/admin/faculties',      color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Beasiswa',  icon: Award,         href: '/admin/scholarships',   color: 'text-amber-600',  bg: 'bg-amber-50' },
    { label: 'Aspirasi',  icon: MessageSquare, href: '/admin/aspirations',    color: 'text-rose-600',   bg: 'bg-rose-50' },
    { label: 'Proposal',  icon: FileText,      href: '/admin/proposals',      color: 'text-emerald-600',bg: 'bg-emerald-50' },
    { label: 'Berita',    icon: BookOpen,      href: '/admin/announcements',  color: 'text-violet-600', bg: 'bg-violet-50' },
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
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-transparent font-inter">
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">

        {/* ── Welcome Header ───────────────────────────────────────── */}
        <section className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm group">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100 font-headline font-extrabold">
                  <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  System Live
                </span>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest font-headline">{dateStr}</span>
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-black font-jakarta tracking-tight leading-tight" style={{ color: 'var(--theme-h1)' }}>
                  {greeting}, <span style={{ color: 'var(--theme-primary)' }}>{user?.Nama?.split(' ')[0] || 'Admin'}</span>! 👋
                </h1>
                <p className="font-semibold text-xs md:text-sm max-w-2xl leading-relaxed font-inter" style={{ color: 'var(--theme-text-muted)' }}>
                  Pusat kendali operasional Universitas Bhakti Kencana. Kelola data dan efisiensi birokrasi dalam satu dashboard terpadu.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => fetchData(true)}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-bku-primary transition-all active:scale-95 disabled:opacity-50 shadow-md font-headline font-extrabold"
                >
                  <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                  {refreshing ? 'Sinkronisasi...' : 'Sync Data'}
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-600 font-headline font-extrabold">
                  <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '14px' }} >security</span>
                  Security: Protected
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-center gap-3">
              <div className="size-24 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-300">
                <img src="/images/bku logo.png" alt="BKU Logo" className="w-full h-full object-contain" />
              </div>
              <p className="text-[9px] font-black text-bku-primary uppercase tracking-[0.3em] font-headline">Master Console</p>
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
            <div className="w-10 h-10 rounded-xl bg-bku-primary/5 text-bku-primary flex items-center justify-center border border-bku-primary/10">
              <span className="material-symbols-outlined text-[20px]" style={{ fontSize: '20px' }}>filter_alt</span>
            </div>
            <div>
              <h3 className="text-xs font-bold font-headline uppercase tracking-wider font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>Filter Data Strategis</h3>
              <p className="text-[10px] text-slate-400 font-inter mt-1.5">Batasi data dashboard berdasarkan instansi akademik</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Semester Filter */}
            <div className="flex flex-col gap-1 w-full sm:w-44">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-headline font-extrabold">Periode Akademik</label>
              <select
                value={semester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-bku-primary/20 focus:border-bku-primary outline-none transition-all cursor-pointer font-inter"
              >
                <option value="2025/2026 Ganjil">2025/2026 Ganjil</option>
                <option value="2025/2026 Genap">2025/2026 Genap</option>
                <option value="2024/2025 Ganjil">2024/2025 Ganjil</option>
                <option value="2024/2025 Genap">2024/2025 Genap</option>
              </select>
            </div>

            {/* Fakultas Filter */}
            <div className="flex flex-col gap-1 w-full sm:w-48">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-headline font-extrabold">Fakultas</label>
              <select
                value={fakultas}
                onChange={(e) => handleFakultasChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-bku-primary/20 focus:border-bku-primary outline-none transition-all cursor-pointer font-inter"
              >
                <option value="Semua Fakultas">Semua Fakultas</option>
                <option value="Fakultas Farmasi">Fakultas Farmasi</option>
                <option value="Fakultas Keperawatan">Fakultas Keperawatan</option>
                <option value="Fakultas Ilmu Kesehatan">Fakultas Ilmu Kesehatan</option>
                <option value="Fakultas Sains & Teknologi">Fakultas Sains & Teknologi</option>
              </select>
            </div>

            {/* Prodi Filter */}
            <div className="flex flex-col gap-1 w-full sm:w-56">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-headline font-extrabold">Program Studi</label>
              <select
                value={prodi}
                onChange={(e) => handleProdiChange(e.target.value)}
                disabled={fakultas === 'Semua Fakultas'}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-bku-primary/20 focus:border-bku-primary outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-inter"
              >
                {prodiOptions[fakultas]?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── Stat Cards (Overview Strategis) ─────────────────────────── */}
        <section className="space-y-4 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1.5 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }} />
              <h2 className="text-xs font-bold uppercase tracking-widest font-headline font-extrabold" style={{ color: 'var(--theme-h2)' }}>Overview Strategis</h2>
            </div>
            <Link to="/admin/audit" className="text-[10px] font-black flex items-center gap-1 uppercase tracking-widest font-headline" style={{ color: 'var(--theme-primary)' }}>
              Audit Logs <ExternalLink size={10} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {statCards.map((card, i) => (
              <StatCard key={i} {...card} loading={loading} />
            ))}
          </div>
        </section>

        {/* ── Quick Links (Akses Cepat) ────────────────────────────────── */}
        <section className="space-y-4 animate-in fade-in duration-500">
          <div className="flex items-center gap-3">
            <div className="h-4 w-1.5 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }} />
            <h2 className="text-xs font-bold uppercase tracking-widest font-headline font-extrabold" style={{ color: 'var(--theme-h2)' }}>Akses Cepat</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {quickLinks.map((ql, i) => <QuickLink key={i} {...ql} />)}
          </div>
        </section>


        {/* ── Main Bento Grid (Bespoke Interactive Tailwind CSS Chart) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">

          {/* Bespoke Tailwind CSS Bar Chart Card — spans 2 cols */}
          <div className="lg:col-span-2 glass-card rounded-2xl shadow-sm overflow-hidden flex flex-col p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)', color: 'var(--theme-primary)', borderColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)' }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontSize: '20px', color: 'var(--theme-primary)' }}>show_chart</span>
                </div>
                <div>
                  <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>Tren Laporan & Penyelesaian</h3>
                  <p className="text-[10px] font-inter mt-1.5" style={{ color: 'var(--theme-text-muted)' }}>Perbandingan jumlah aspirasi masuk vs penyelesaian bulanan</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-[9px] font-extrabold uppercase tracking-widest font-headline font-extrabold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-bku-primary shrink-0" />
                  <span className="text-slate-600">Aspirasi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
                  <span className="text-slate-600">Penyelesaian</span>
                </div>
              </div>
            </div>

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
                    className="absolute top-2 pointer-events-none bg-slate-900 text-white text-[9px] font-bold py-2.5 px-3.5 rounded-2xl shadow-xl flex flex-col gap-1.5 items-center z-30 font-inter border border-white/10 animate-in fade-in zoom-in-95 duration-200"
                  >
                    <span className="text-slate-400 font-headline font-extrabold uppercase tracking-widest text-[8px]">
                      {activeChartData[hoveredIndex].name}
                    </span>
                    <div className="flex items-center gap-2 leading-none">
                      <span className="w-2 h-2 rounded-full bg-bku-primary shrink-0 border border-white" />
                      <span>Aspirasi: {activeChartData[hoveredIndex].Aspirasi}</span>
                    </div>
                    <div className="flex items-center gap-2 leading-none">
                      <span className="w-2 h-2 rounded-full bg-[#3b82f6] shrink-0 border border-white" />
                      <span>Penyelesaian: {activeChartData[hoveredIndex].Penyelesaian}</span>
                    </div>
                  </div>
                )}

                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                  <defs>
                    {/* Gradients for filled area under curves */}
                    <linearGradient id="areaAspirasi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00236f" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#00236f" stopOpacity="0.00" />
                    </linearGradient>
                    <linearGradient id="areaPenyelesaian" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines & Y-Axis Labels inside SVG */}
                  {[120, 90, 60, 30, 0].map((v) => {
                    // Calculate exact Y coordinate based on bottom-up projection
                    const y = (svgHeight - 30) - (v / 120) * (svgHeight - 50);
                    return (
                      <g key={v}>
                        {/* Grid Line */}
                        <line x1="40" y1={y} x2={svgWidth - 20} y2={y} stroke="#cbd5e1" strokeOpacity="0.35" strokeWidth="1" />
                        {/* Y-Axis text */}
                        <text x="10" y={y + 3} fill="#94a3b8" fontSize="8" fontWeight="bold" className="font-headline font-extrabold select-none">{v}</text>
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
                    stroke="#00236f" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    className="transition-all duration-500"
                  />
                  <path 
                    d={getCurvePath(activeChartData, 'Penyelesaian', svgWidth, svgHeight, 120)} 
                    fill="none" 
                    stroke="#3b82f6" 
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
                      stroke="#94a3b8"
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
                        <circle cx={x} cy={y1} r="10" fill="#00236f" fillOpacity="0.2" className="animate-ping" />
                        <circle cx={x} cy={y1} r="5.5" fill="#00236f" stroke="white" strokeWidth="2.5" className="shadow-md" />

                        {/* Penyelesaian Glow Indicator */}
                        <circle cx={x} cy={y2} r="10" fill="#3b82f6" fillOpacity="0.2" className="animate-ping" />
                        <circle cx={x} cy={y2} r="5.5" fill="#3b82f6" stroke="white" strokeWidth="2.5" className="shadow-md" />
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
                          "uppercase tracking-widest font-headline font-extrabold transition-all duration-300 select-none",
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
          </div>

          {/* Right Column (Health & SLA Statuses) */}
          <div className="space-y-8">
            {/* System Health Card */}
            <div className="bg-gradient-to-br from-bku-primary to-[#00123a] text-white p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-2">
                  <Zap className="size-5 text-yellow-400 fill-yellow-400" />
                  <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>System Health</h3>
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
                        <span className="text-white/60 font-medium font-inter">{label}</span>
                      </div>
                      <span className="font-bold tabular-nums font-inter">{value}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => navigate('/admin/performance')}
                  className="w-full py-3 bg-white text-bku-primary rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all font-headline shadow-md font-extrabold"
                >
                  Lihat Detail
                </button>
              </div>
            </div>

            {/* SLA Summary Widget */}
            <div className="glass-card rounded-2xl shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-rose-50/50 text-rose-600 flex items-center justify-center border border-rose-100/55">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>SLA Performance</h3>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 bg-slate-50/30 rounded-xl flex items-center justify-between border border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-headline font-extrabold">Overdue</span>
                  <span className="text-2xl font-bold text-rose-600 font-jakarta leading-none">{stats.sla_overdue}</span>
                </div>
                <div className="p-4 bg-slate-50/30 rounded-xl flex items-center justify-between border border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-headline font-extrabold">Resolved</span>
                  <span className="text-2xl font-bold text-emerald-600 font-jakarta leading-none">{stats.resolved_today}</span>
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
                  {detailMhs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-sm font-medium text-neutral-400">Tidak ada data mahasiswa cocok</td>
                    </tr>
                  ) : (
                    detailMhs.map((m) => (
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
                  {detailAsp.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-sm font-medium text-neutral-400">Tidak ada data aspirasi cocok</td>
                    </tr>
                  ) : (
                    detailAsp.map((a) => (
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
                  {detailProp.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-sm font-medium text-neutral-400">Tidak ada data proposal cocok</td>
                    </tr>
                  ) : (
                    detailProp.map((p) => (
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
        </section>

      </div>
    </div>
  )
}

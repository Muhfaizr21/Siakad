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

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [statsRes, logsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAuditLogs()
      ])
      if (statsRes.status === 'success') setStats(statsRes.data)
      if (logsRes.status === 'success') setLogs(logsRes.data?.slice(0, 8) || [])
    } catch {
      toast.error('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

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

      </div>
    </div>
  )
}

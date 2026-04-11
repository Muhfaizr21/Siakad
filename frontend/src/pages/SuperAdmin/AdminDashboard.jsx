
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './components/ui/card'
import {
  Users, MessageSquare, FileText, LayoutDashboard,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
  Shield, ArrowRight, Activity, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/api'
import { toast } from 'react-hot-toast'

const StatCard = ({ label, value, icon: Icon, color, bg, trend, route, description }) => (
  <Link to={route || '#'}>
    <Card className="border-none shadow-sm bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group h-full border border-slate-100/50">
      <CardContent className="p-7">
        <div className="flex items-start justify-between mb-5">
          <div className={cn('p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-110 duration-300', bg)}>
            <Icon className={cn('size-6', color)} />
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Detail</span>
            <ArrowRight className="size-3 text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] font-headline">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className={cn('text-3xl font-black font-headline tracking-tighter', color)}>{value}</p>
            {trend && <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5"><TrendingUp className="size-3" />+8%</span>}
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-tight mt-2 italic">{description}</p>
        </div>
      </CardContent>
    </Card>
  </Link>
)

export default function AdminDashboard() {
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

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, logsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAuditLogs()
      ])
      if (statsRes.status === 'success') setStats(statsRes.data)
      if (logsRes.status === 'success') setLogs(logsRes.data?.slice(0, 10) || [])
    } catch (err) {
      toast.error("Gagal sinkronisasi data dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const statCards = [
    { label: 'Total Mahasiswa', value: stats.total_mahasiswa?.toLocaleString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', route: '/admin/students', description: 'Total basis data mahasiswa aktif terpantau' },
    { label: 'Aspirasi Aktif', value: stats.aspirasi_aktif, icon: MessageSquare, color: 'text-sky-600', bg: 'bg-sky-50', route: '/admin/aspirations', description: 'Keluhan & saran masuk dalam antrean' },
    { label: 'SLA Overdue', value: stats.sla_overdue, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', route: '/admin/aspirations', description: 'Layanan melewati batas waktu respon' },
    { label: 'Selesai Hari Ini', value: stats.resolved_today, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', route: '/admin/audit', description: 'Aspirasi sukses ditangani hari ini' },
    { label: 'Antrean Proposal', value: stats.antrean_proposal, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', route: '/admin/proposals', description: 'Proposal membutuhkan validasi akhir' },
    { label: 'Anggota Ormawa', value: stats.total_anggota_ormawa?.toLocaleString(), icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50', route: '/admin/organizations', description: 'Keterlibatan aktif dalam organisasi' },
  ]

  const getActionStyles = (action = '') => {
    const act = action.toUpperCase()
    if (act.includes('LOGIN')) return 'bg-blue-100 text-blue-700 border-blue-200'
    if (act.includes('DELETE')) return 'bg-rose-100 text-rose-700 border-rose-200'
    if (act.includes('CREATE')) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    return 'bg-slate-100 text-slate-600 border-slate-200'
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 space-y-6 lg:space-y-10 max-w-[1600px] mx-auto">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden bg-white border border-slate-200 p-6 md:p-10 rounded-[2rem] lg:rounded-[4rem] shadow-sm">
            <div className="absolute top-0 right-0 p-10 opacity-10"><Activity className="size-40 text-primary" /></div>
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 bg-primary rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Strategic Overview</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-headline leading-none">
                Layanan <span className="text-primary italic">BKU</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium max-w-xl mt-2">
                Pantau integritas data operasional dan efisiensi birokrasi kemahasiswaan Universitas Bhakti Kencana secara real-time melalui dasbor agregat terpadu.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {loading ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-white border-2 border-slate-50 rounded-[2.5rem] animate-pulse" />
            )) : statCards.map((card, i) => (
              <StatCard key={i} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Audit Logs */}
            <Card className="lg:col-span-2 border-none shadow-sm rounded-[3.5rem] bg-white overflow-hidden border border-slate-100">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 rounded-2xl text-white shadow-lg"><Clock className="size-4" /></div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Audit Log Sistem</h2>
                </div>
                <Link to="/admin/audit" className="p-3 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-primary hover:text-white transition-all">Lihat Lengkap</Link>
              </div>
              <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto no-scrollbar">
                {logs.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center gap-4">
                    <Shield className="size-16 text-slate-200" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest decoration-dotted underline underline-offset-8">Belum ada jejak audit terdeteksi</p>
                  </div>
                ) : logs.map((log, i) => (
                  <div key={i} className="p-6 flex items-start gap-5 hover:bg-slate-50/50 transition-all cursor-default">
                    <div className={cn('px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest shrink-0 mt-1', getActionStyles(log.Aktivitas))}>
                      {log.Aktivitas?.split('_')[0] || 'LOG'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-bold text-slate-800 text-sm tracking-tight truncate">{log.Deskripsi}</p>
                        <span className="text-[10px] font-black text-slate-400 shrink-0 uppercase tracking-tighter">
                          {new Date(log.CreatedAt).toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="size-1 bg-slate-200 rounded-full" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.Pengguna?.Email || 'System Entity'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Support Aggregat */}
            <div className="space-y-6">
              <Card className="border-none shadow-xl bg-slate-900 text-white p-10 rounded-[3.5rem] relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700"><Zap className="size-60" /></div>
                <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl font-black font-headline tracking-tighter leading-tight uppercase">Infrastruktur<br />Digital BKU</h3>
                  <div className="h-1.5 w-16 bg-primary rounded-full" />
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Status terkini kesehatan server dan validasi data terpadu se-Universitas.</p>

                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Uptime Portal</span>
                      <span className="text-xs font-black text-emerald-400">99.98%</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Api Response</span>
                      <span className="text-xs font-black text-blue-400">120ms</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Security Patch</span>
                      <div className="flex items-center gap-2">
                        <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-white">Updated</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-6 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg">
                    Buka Monitoring Performa
                  </button>
                </div>
              </Card>
            </div>
        </div>
    </div>
  )
}


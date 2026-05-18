"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts"
import { API_BASE_URL, fetchWithAuth } from "../../services/api"
import useAuthStore from '../../store/useAuthStore';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const BarChart3 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>bar_chart</span>;
const UserCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>how_to_reg</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Layers = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>layers</span>;
const Trophy = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const HeartPulse = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>monitor_heart</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const MessageSquare = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chat</span>;
const FileText = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>description</span>;
const Calendar = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;



export default function FacultyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [summaryData, setSummaryData] = useState({
    totalStudents: 0,
    totalLecturers: 0,
    totalPrestasi: 0,
    totalProdi: 0,
    statusCounts: [],
    prodiDistribution: [],
    trendData: [],
    recentActivity: [],
    activePeriod: null
  });

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin';

  useEffect(() => {
    setIsMounted(true);
    const fetchDashboardData = async () => {
      try {
        const result = await fetchWithAuth(`${API_BASE_URL}/faculty/summary`);
        if (result.status === 'success') {
          setSummaryData(result.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statusColors = {
    'Aktif': '#22c55e',
    'Cuti': '#eab308',
    'Lulus': '#3b82f6',
    'DO': '#ef4444',
  };

  const allStatusNames = [...new Set(['Aktif', 'Cuti', 'Lulus', 'DO', ...(summaryData.statusCounts?.map(s => s.status) || [])])];
  const dynamicStatusData = allStatusNames.map(name => {
    const found = summaryData.statusCounts?.find(s => s.status === name);
    return { name, value: found ? found.count : 0, color: statusColors[name] || '#cbd5e1' };
  });

  const statCards = [
    {
      label: "Total Mahasiswa",
      icon: Users,
      value: summaryData.totalStudents || 0,
      desc: "mahasiswa terdaftar",
      color: "text-blue-600",
      bg: "bg-blue-50",
      accent: "from-blue-500/10",
      path: "/faculty/mahasiswa"
    },
    {
      label: "Tenaga Pendidik",
      icon: GraduationCap,
      value: summaryData.totalLecturers || 0,
      desc: "dosen aktif",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      accent: "from-emerald-500/10",
      path: "/faculty/dosen"
    },
    {
      label: "Prestasi Baru",
      icon: Award,
      value: summaryData.totalPrestasi || 0,
      desc: "menunggu validasi",
      color: "text-amber-600",
      bg: "bg-amber-50",
      accent: "from-amber-500/10",
      path: "/faculty/prestasi"
    },
    {
      label: "Unit Akademik",
      icon: Layers,
      value: summaryData.totalProdi || 0,
      desc: "program studi aktif",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      accent: "from-indigo-500/10",
      path: "/faculty/prodi"
    },
  ];

  const quickActions = [
    { label: 'Validasi Prestasi', icon: Trophy, path: '/faculty/prestasi', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
    { label: 'Monitor PKKMB', icon: CheckCircle2, path: '/faculty/pkkmb', color: 'bg-indigo-500', shadow: 'shadow-indigo-500/20' },
    { label: 'Screening Kesehatan', icon: HeartPulse, path: '/faculty/kesehatan', color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
    { label: 'Aspirasi Mahasiswa', icon: MessageSquare, path: '/faculty/aspirasi', color: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
    { label: 'Proposal ORMAWA', icon: FileText, path: '/faculty/ormawa/proposals', color: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
    { label: 'Jadwal Konseling', icon: Calendar, path: '/faculty/konseling', color: 'bg-teal-500', shadow: 'shadow-teal-500/20' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-body">
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8">

        {/* ── Welcome Banner ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl h-52 flex items-center group">
          {/* Background */}
          <div className="absolute inset-0 bg-primary-container" />
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
          {/* Glowing orbs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 right-40 w-48 h-48 bg-indigo-300/20 rounded-full blur-2xl" />

          {/* Content */}
          <div className="relative z-10 px-10 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-6 bg-white/40 rounded-full" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.25em]">
                {summaryData.activePeriod || "Portal Akademik Fakultas"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
              Selamat datang, <span className="text-blue-200">{firstName}!</span>
            </h1>
            <p className="text-blue-100/80 font-medium text-sm max-w-md leading-relaxed">
              Kelola data akademik, pantau kinerja mahasiswa, dan verifikasi layanan kampus dari satu panel terpusat.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => navigate('/faculty/mahasiswa')}
                className="bg-white text-[#00236F] px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Lihat Data Mahasiswa
              </button>
              <button
                onClick={() => navigate('/faculty/laporan')}
                className="bg-white/15 backdrop-blur-md text-white border border-white/20 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-white/25 transition-all active:scale-95"
              >
                Unduh Laporan
              </button>
            </div>
          </div>

          {/* Right decoration */}
          <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 gap-4">
            {[
              { label: 'Mahasiswa', value: loading ? '—' : (summaryData.totalStudents || 0).toLocaleString() },
              { label: 'Dosen', value: loading ? '—' : (summaryData.totalLecturers || 0).toLocaleString() },
              { label: 'Prodi', value: loading ? '—' : (summaryData.totalProdi || 0).toLocaleString() },
            ].map(item => (
              <div key={item.label} className="text-center bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10">
                <p className="text-2xl font-black text-white leading-none">{item.value}</p>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stat Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <button
              key={s.label}
              onClick={() => navigate(s.path)}
              className="group bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${s.accent} to-transparent rounded-bl-full opacity-40`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform duration-300`}>
                    <s.icon size={18} />
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                    <span className="material-symbols-outlined" style={{ fontSize: '9px' }} >show_chart</span>
                    Live
                  </div>
                </div>
                <p className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.15em] mb-1">{s.label}</p>
                <p className="text-3xl font-black text-[#171717] leading-none tabular-nums">
                  {loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '20px' }} >sync</span> : s.value.toLocaleString()}
                </p>
                <p className="text-[10px] text-[#a3a3a3] font-medium mt-1">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Main Bento Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Chart: Mahasiswa per Prodi — col-8 */}
          <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center justify-between">
              <div>
                <h2 className="font-black text-[#171717] text-base tracking-tight">Distribusi Mahasiswa per Prodi</h2>
                <p className="text-[11px] text-[#a3a3a3] font-medium mt-0.5">Jumlah mahasiswa aktif berdasarkan program studi</p>
              </div>
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                <BarChart3 size={16} />
              </div>
            </div>
            <div className="p-6 h-[280px]">
              {isMounted && (
                <ResponsiveContainer width="99%" height={240} debounce={50}>
                  <BarChart data={summaryData.prodiDistribution} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <span className="material-symbols-outlined" Axis type="number" hide>close</span>
                    <YAxis dataKey="name" type="category" width={120}
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "bold" }}
                    />
                    <Bar dataKey="jumlah" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Status Mahasiswa — col-4 */}
          <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center justify-between">
              <div>
                <h2 className="font-black text-[#171717] text-base tracking-tight">Status Akademik</h2>
                <p className="text-[11px] text-[#a3a3a3] font-medium mt-0.5">Kondisi mahasiswa saat ini</p>
              </div>
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                <UserCheck size={16} />
              </div>
            </div>
            <div className="p-4">
              {isMounted && (
                <ResponsiveContainer width="99%" height={180} debounce={50}>
                  <PieChart>
                    <Pie data={dynamicStatusData} cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80}
                      paddingAngle={6} dataKey="value" stroke="none"
                    >
                      {dynamicStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "bold" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {dynamicStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 p-2 rounded-xl bg-[#fafafa] border border-[#f0f0f0]">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest truncate">{item.name}</p>
                      <p className="text-sm font-black text-[#171717] leading-none tabular-nums">{item.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Trend + Activity ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Trend Pendaftaran — col-8 */}
          <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center justify-between">
              <div>
                <h2 className="font-black text-[#171717] text-base tracking-tight">Tren Penerimaan Mahasiswa Baru</h2>
                <p className="text-[11px] text-[#a3a3a3] font-medium mt-0.5">Perbandingan pendaftar vs. diterima per tahun</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                <span className="material-symbols-outlined" style={{ fontSize: '11px' }} >trending_up</span> Trend
              </div>
            </div>
            <div className="p-6 h-[260px]">
              {isMounted && (
                <ResponsiveContainer width="99%" height={230} debounce={50}>
                  <LineChart data={summaryData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <span className="material-symbols-outlined" Axis dataKey="tahun" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }}>close</span>
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "bold" }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '16px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                    <Line type="monotone" dataKey="pendaftar" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} name="Pendaftar" />
                    <Line type="monotone" dataKey="diterima" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} name="Diterima" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Aktivitas Terbaru — col-4 */}
          <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center justify-between">
              <div>
                <h2 className="font-black text-[#171717] text-base tracking-tight">Aktivitas Terbaru</h2>
                <p className="text-[11px] text-[#a3a3a3] font-medium mt-0.5">Log aktivitas sistem</p>
              </div>
              <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >schedule</span>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-[260px] overflow-y-auto">
              {summaryData.recentActivity?.length > 0
                ? summaryData.recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#f0f0f0] group hover:border-[#e5e5e5] hover:bg-white transition-all">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] flex-shrink-0">
                      {activity.avatar || '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#171717] truncate">{activity.user}</p>
                      <p className="text-[10px] text-[#737373] leading-relaxed">{activity.action}</p>
                    </div>
                    <span className="text-[9px] font-bold text-[#a3a3a3] uppercase whitespace-nowrap">{activity.time}</span>
                  </div>
                ))
                : (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 bg-[#f5f5f5] rounded-2xl flex items-center justify-center text-[#a3a3a3] mx-auto mb-3">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >notifications</span>
                    </div>
                    <p className="text-[11px] font-black text-[#a3a3a3] uppercase tracking-widest">Belum ada aktivitas</p>
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-4 w-1.5 bg-primary rounded-full" />
            <h2 className="font-black text-[#171717] text-base tracking-tight">Aksi Cepat</h2>
            <span className="text-[10px] font-bold text-[#a3a3a3] uppercase tracking-widest ml-auto">Pintasan Menu</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className={cn(
                  "group flex flex-col items-center justify-center p-4 rounded-2xl text-white transition-all duration-300 hover:scale-[1.04] active:scale-95 shadow-lg",
                  item.color,
                  item.shadow
                )}
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
                  <item.icon size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

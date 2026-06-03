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
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summaryData, setSummaryData] = useState({
    totalStudents: 0,
    totalLecturers: 0,
    totalPrestasi: 0,
    totalProdi: 0,
    statusCounts: [],
    prodiDistribution: [],
    trendData: [],
    recentActivity: [],
    activePeriod: null,
    periods: []
  });

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin';

  const fetchDashboardData = React.useCallback(async (periodId, start, end) => {
    Promise.resolve().then(() => setLoading(true));
    try {
      let url = `${API_BASE_URL}/faculty/summary`;
      const params = [];
      if (start && end) {
        params.push(`start_date=${start}`);
        params.push(`end_date=${end}`);
      } else if (periodId && periodId !== 'all') {
        params.push(`period_id=${periodId}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      const result = await fetchWithAuth(url);
      if (result.status === 'success') {
        setSummaryData(result.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
    } finally {
      Promise.resolve().then(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData(filterPeriod, startDate, endDate);
  }, [filterPeriod, startDate, endDate, fetchDashboardData]);

  const handlePeriodChange = (val) => {
    setFilterPeriod(val);
    if (val !== 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleDateChange = (type, val) => {
    if (type === 'start') {
      setStartDate(val);
    } else {
      setEndDate(val);
    }
    setFilterPeriod('all');
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilterPeriod('all');
  };

  const statusColors = {
    'Aktif': '#22c55e',
    'Cuti': '#eab308',
    'Lulus': '#3b82f6',
    'DO': '#ef4444',
    'NON-AKTIF': '#94a3b8',
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
      label: "Program Studi",
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
    { label: 'Validasi Prestasi', icon: Trophy, path: '/faculty/prestasi', iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50', hoverShadow: 'hover:shadow-emerald-500/5 hover:border-emerald-200/50' },
    { label: 'Monitor PKKMB', icon: CheckCircle2, path: '/faculty/pkkmb', iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100/50', hoverShadow: 'hover:shadow-indigo-500/5 hover:border-indigo-200/50' },
    { label: 'Screening Kesehatan', icon: HeartPulse, path: '/faculty/kesehatan', iconBg: 'bg-amber-50 text-amber-600 border border-amber-100/50', hoverShadow: 'hover:shadow-amber-500/5 hover:border-amber-200/50' },
    { label: 'Aspirasi Mahasiswa', icon: MessageSquare, path: '/faculty/aspirasi', iconBg: 'bg-rose-50 text-rose-600 border border-rose-100/50', hoverShadow: 'hover:shadow-rose-500/5 hover:border-rose-200/50' },
    { label: 'Proposal ORMAWA', icon: FileText, path: '/faculty/ormawa/proposals', iconBg: 'bg-blue-50 text-blue-600 border border-blue-100/50', hoverShadow: 'hover:shadow-blue-500/5 hover:border-blue-200/50' },
    { label: 'Jadwal Konseling', icon: Calendar, path: '/faculty/konseling', iconBg: 'bg-teal-50 text-teal-600 border border-teal-100/50', hoverShadow: 'hover:shadow-teal-500/5 hover:border-teal-200/50' },
  ];

  return (
    <div className="min-h-screen bg-transparent font-inter">
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Utama</h1>
            <p className="text-xs font-semibold text-slate-400">Ikhtisar data akademik dan statistik fakultas</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200/50 p-3 rounded-2xl shadow-sm">
            {/* Period Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Periode:</span>
              <div className="relative min-w-[170px]">
                <select
                  value={filterPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 text-xs font-bold py-2 pl-3 pr-8 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="all">Pilih Semua</option>
                  {summaryData.periods?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.Name || p.nama_periode}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </div>
              </div>
            </div>

            {/* Divider line for desktop */}
            <span className="hidden md:inline-block h-6 w-[1px] bg-slate-200" />

            {/* Custom Date Range Picker */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Rentang Tanggal:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="bg-slate-50 border border-slate-200/80 text-slate-800 text-xs font-bold py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                />
                <span className="text-slate-400 text-xs font-bold">—</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="bg-slate-50 border border-slate-200/80 text-slate-800 text-xs font-bold py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                />
                {(startDate || endDate) && (
                  <button
                    onClick={handleResetFilters}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center"
                    title="Reset filter tanggal"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Welcome Banner ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl h-52 flex items-center group">
          {/* Background */}
          <div 
            className="absolute inset-0" 
            style={{ background: 'linear-gradient(160deg, var(--theme-primary) 0%, color-mix(in srgb, var(--theme-primary) 70%, var(--theme-secondary) 30%) 100%)' }}
          />
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
          {/* Glowing orbs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ backgroundColor: 'var(--theme-secondary)' }} />
          <div className="absolute -bottom-10 right-40 w-48 h-48 rounded-full blur-2xl opacity-20" style={{ backgroundColor: 'var(--theme-surface)' }} />

          {/* Content */}
          <div className="relative z-10 px-10 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-6 bg-white/40 rounded-full" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.25em]">
                {summaryData.activePeriod || "Portal Akademik Fakultas"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
              Selamat datang, <span style={{ color: 'var(--theme-secondary)' }}>{firstName}!</span>
            </h1>
            <p className="text-white/80 font-medium text-sm max-w-md leading-relaxed">
              Kelola data akademik, pantau kinerja mahasiswa, dan verifikasi layanan kampus dari satu panel terpusat.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => navigate('/faculty/mahasiswa')}
                className="bg-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95"
                style={{ color: 'var(--theme-primary)' }}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <button
              key={s.label}
              onClick={() => navigate(s.path)}
              className="group glass-card rounded-2xl shadow-sm p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
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
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{s.label}</p>
                <p className="text-3xl font-black text-slate-900 leading-none tabular-nums">
                  {loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '20px' }} >sync</span> : s.value.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Main Bento Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Chart: Mahasiswa per Prodi — col-8 */}
          <div className="lg:col-span-8 glass-card border border-slate-200/60 rounded-2xl shadow-none overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-sm uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h2)' }}>Distribusi Mahasiswa per Prodi</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Jumlah mahasiswa aktif berdasarkan program studi</p>
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
                    <XAxis type="number" hide domain={[0, 'dataMax']} />
                    <YAxis dataKey="name" type="category" width={240}
                      tick={({ y, payload }) => (
                        <text x={0} y={y} dy={4} textAnchor="start" fill="#475569" fontSize={9.5} fontWeight={700}>
                          {payload.value}
                        </text>
                      )}
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
          <div className="lg:col-span-4 glass-card border border-slate-200/60 rounded-2xl shadow-none overflow-hidden">
            <div className="p-6 border-b border-slate-100/50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h2 className="font-black text-sm uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h2)' }}>Status Akademik</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Kondisi mahasiswa saat ini</p>
              </div>
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                <UserCheck size={16} />
              </div>
            </div>
            <div className="p-4">
              {isMounted && (
                <ResponsiveContainer width="99%" height={180} debounce={50}>
                  <PieChart>
                    <Pie data={dynamicStatusData.filter(d => d.value > 0)} cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80}
                      paddingAngle={6} dataKey="value" stroke="none"
                    >
                      {dynamicStatusData.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "bold" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {dynamicStatusData.map((item, idx) => (
                  <div
                    key={item.name}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-xl bg-slate-50/50 border border-slate-100",
                      dynamicStatusData.length % 2 !== 0 && idx === dynamicStatusData.length - 1 && "col-span-2"
                    )}
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{item.name}</p>
                      <p className="text-sm font-black text-slate-900 leading-none tabular-nums">{item.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Activity Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Aktivitas Terbaru — col-12 */}
          <div className="lg:col-span-12 bg-white border border-slate-100/50 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-900 text-base tracking-tight">Aktivitas Terbaru</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Log aktivitas sistem terbaru di tingkat fakultas</p>
              </div>
              <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >schedule</span>
              </div>
            </div>
            <div className="p-6">
              {summaryData.recentActivity?.length > 0
                ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summaryData.recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group hover:border-slate-200/60 hover:bg-white transition-all shadow-sm hover:shadow">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs flex-shrink-0">
                          {activity.avatar || '—'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{activity.user}</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{activity.action}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap self-start">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                )
                : (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-3">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >notifications</span>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Belum ada aktivitas</p>
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <div className="glass-card border border-slate-200/60 rounded-2xl shadow-none p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-4 w-1.5 bg-primary rounded-full" />
            <h2 className="font-black text-sm uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h2)' }}>Aksi Cepat</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">Pintasan Menu</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className={cn(
                  "group flex flex-col items-center justify-center p-5 rounded-2xl glass-card border border-slate-200/60 transition-all duration-300 hover:-translate-y-1 active:scale-95 shadow-none hover:shadow-md",
                  item.hoverShadow
                )}
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110", item.iconBg)}>
                  <item.icon size={20} className="transition-transform duration-300 group-hover:rotate-6" />
                </div>
                <span className="text-[10.5px] font-black uppercase tracking-wider text-center leading-snug text-[#334155] group-hover:text-primary transition-colors">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
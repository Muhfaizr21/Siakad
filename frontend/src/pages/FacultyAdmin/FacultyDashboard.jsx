"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"
import { API_BASE_URL, fetchWithAuth } from "../../services/api"
import useAuthStore from '../../store/useAuthStore';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const BarChart3 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>bar_chart</span>;
const UserCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>how_to_reg</span>;
const Layers = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>layers</span>;
const Trophy = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const HeartPulse = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>monitor_heart</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const MessageSquare = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chat</span>;
const FileText = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>description</span>;
const Calendar = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;

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
    setIsMounted(true);
  }, []);

  useEffect(() => {
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
    'Aktif': 'var(--theme-success)',
    'Cuti': 'var(--theme-warning)',
    'Lulus': 'var(--theme-info)',
    'DO': 'var(--theme-error)',
    'NON-AKTIF': 'var(--theme-text-muted)',
  };

  const allStatusNames = [...new Set(['Aktif', 'Cuti', 'Lulus', 'DO', ...(summaryData.statusCounts?.map(s => s.status) || [])])];
  const dynamicStatusData = allStatusNames.map(name => {
    const found = summaryData.statusCounts?.find(s => s.status === name);
    return { name, value: found ? found.count : 0, color: statusColors[name] || 'var(--theme-border)' };
  });

  const statCards = [
    {
      label: "Total Mahasiswa",
      icon: Users,
      value: summaryData.totalStudents || 0,
      desc: "mahasiswa terdaftar",
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20 border",
      accent: "from-primary/10",
      path: "/faculty/mahasiswa"
    },
    {
      label: "Prestasi Baru",
      icon: Award,
      value: summaryData.totalPrestasi || 0,
      desc: "menunggu validasi",
      color: "text-secondary",
      bg: "bg-secondary/10 border-secondary/20 border",
      accent: "from-secondary/10",
      path: "/faculty/prestasi"
    },
    {
      label: "Program Studi",
      icon: Layers,
      value: summaryData.totalProdi || 0,
      desc: "program studi aktif",
      color: "text-info",
      bg: "bg-info/10 border-info/20 border",
      accent: "from-info/10",
      path: "/faculty/prodi"
    },
  ];

  const quickActions = [
    { label: 'Validasi Prestasi', icon: Trophy, path: '/faculty/prestasi', iconBg: 'bg-success/10 text-success border border-success/20', hoverShadow: 'hover:shadow-success/5 hover:border-success/30' },
    { label: 'Monitor PKKMB', icon: CheckCircle2, path: '/faculty/pkkmb', iconBg: 'bg-primary/10 text-primary border border-primary/20', hoverShadow: 'hover:shadow-primary/5 hover:border-primary/30' },
    { label: 'Screening Kesehatan', icon: HeartPulse, path: '/faculty/kesehatan', iconBg: 'bg-warning/10 text-warning border border-warning/20', hoverShadow: 'hover:shadow-warning/5 hover:border-warning/30' },
    { label: 'Aspirasi Mahasiswa', icon: MessageSquare, path: '/faculty/aspirasi', iconBg: 'bg-error/10 text-error border border-error/20', hoverShadow: 'hover:shadow-error/5 hover:border-error/30' },
    { label: 'Proposal ORMAWA', icon: FileText, path: '/faculty/ormawa/proposals', iconBg: 'bg-info/10 text-info border border-info/20', hoverShadow: 'hover:shadow-info/5 hover:border-info/30' },
    { label: 'Jadwal Konseling', icon: Calendar, path: '/faculty/konseling', iconBg: 'bg-secondary/10 text-secondary border border-secondary/20', hoverShadow: 'hover:shadow-secondary/5 hover:border-secondary/30' },
  ];

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <section
          className="rounded-xl p-5 border border-border"
          style={{ backgroundColor: 'var(--theme-surface)' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}
              >
                <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                  Selamat datang, <span style={{ color: 'var(--theme-secondary)' }}>{firstName}!</span>
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Kelola data akademik, pantau kinerja mahasiswa, dan verifikasi layanan kampus dari satu panel terpusat.
                </p>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => navigate('/faculty/mahasiswa')}
                className="flex-1 md:flex-initial px-4 py-2 rounded-lg font-bold text-xs transition-all text-white hover:opacity-90 shadow-sm"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                Lihat Data Mahasiswa
              </button>
              <button
                onClick={() => navigate('/faculty/laporan')}
                className="flex-1 md:flex-initial border px-4 py-2 rounded-lg font-bold text-xs transition-all hover:bg-black/[0.02]"
                style={{
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                  backgroundColor: 'var(--theme-surface)'
                }}
              >
                Unduh Laporan
              </button>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary font-headline">Filterasi Data</h3>
                <p className="text-[10px] text-muted mt-0.5">Filter data berdasarkan periode akademik</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Periode */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-muted">Periode Akademik</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary" style={{ fontSize: '14px' }}>calendar_month</span>
                <select
                  value={filterPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-lg text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  <option value="all">Pilih Semua</option>
                  {summaryData.periods?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.Name || p.nama_periode}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rentang Tanggal */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-muted">Rentang Tanggal</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="flex-1 pl-9 pr-3 py-2.5 bg-background border border-border rounded-lg text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                  style={{ backgroundImage: 'none' }}
                />
                <span className="text-muted text-sm shrink-0">—</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="flex-1 pr-3 py-2.5 bg-background border border-border rounded-lg text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                  style={{ backgroundImage: 'none' }}
                />
                {(startDate || endDate) && (
                  <button
                    onClick={handleResetFilters}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {statCards.map((s) => (
            <button
              key={s.label}
              onClick={() => navigate(s.path)}
              className="group bg-surface border border-border rounded-xl shadow-sm p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${s.accent} to-transparent rounded-bl-full opacity-40`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform duration-300`}>
                    <s.icon size={18} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined" style={{ fontSize: '9px' }} >show_chart</span>
                    Live
                  </div>
                </div>
                <p className="text-xs font-medium text-muted mb-1">{s.label}</p>
                <p className="text-2xl font-black text-on-surface leading-none tabular-nums" style={{ color: 'var(--theme-text)' }}>
                  {loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '20px' }} >sync</span> : s.value.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted font-medium mt-1">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart: Mahasiswa per Prodi — col-8 */}
          <div className="lg:col-span-8 bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary font-headline">Distribusi Mahasiswa per Prodi</h2>
                <p className="text-[10px] text-muted mt-0.5">Jumlah mahasiswa aktif berdasarkan program studi</p>
              </div>
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                <BarChart3 size={16} />
              </div>
            </div>
            <div className="p-5 h-[280px]">
              {isMounted && (
                <ResponsiveContainer width="99%" height={240} debounce={50}>
                  <BarChart data={summaryData.prodiDistribution} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--theme-border-muted)" />
                    <XAxis type="number" hide domain={[0, 'dataMax']} />
                    <YAxis dataKey="name" type="category" width={240}
                      tick={({ y, payload }) => (
                        <text x={0} y={y} dy={4} textAnchor="start" fill="var(--theme-text)" fontSize={9.5} fontWeight={700}>
                          {payload.value}
                        </text>
                      )}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip cursor={{ fill: 'var(--theme-bg)' }}
                      contentStyle={{ backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "bold", color: "var(--theme-text)" }}
                    />
                    <Bar dataKey="jumlah" fill="var(--theme-primary)" radius={[0, 10, 10, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Status Mahasiswa — col-4 */}
          <div className="lg:col-span-4 bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex justify-between items-center bg-background/10">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary font-headline">Status Akademik</h2>
                <p className="text-[10px] text-muted mt-0.5">Kondisi mahasiswa saat ini</p>
              </div>
              <div className="w-9 h-9 bg-success/10 rounded-xl flex items-center justify-center text-success border border-success/20">
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
                    <Tooltip contentStyle={{ backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "bold", color: "var(--theme-text)" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {dynamicStatusData.map((item, idx) => (
                  <div
                    key={item.name}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg bg-background border border-border-muted",
                      dynamicStatusData.length % 2 !== 0 && idx === dynamicStatusData.length - 1 && "col-span-2"
                    )}
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-muted truncate">{item.name}</p>
                      <p className="text-xs font-semibold text-on-surface leading-none tabular-nums" style={{ color: 'var(--theme-text)' }}>{item.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Aktivitas Terbaru — col-12 */}
          <div className="lg:col-span-12 bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary font-headline">Aktivitas Terbaru</h2>
                <p className="text-[10px] text-muted mt-0.5">Log aktivitas sistem terbaru di tingkat fakultas</p>
              </div>
              <div className="w-9 h-9 bg-background border border-border-muted rounded-xl flex items-center justify-center text-muted">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >schedule</span>
              </div>
            </div>
            <div className="p-5">
              {summaryData.recentActivity?.length > 0
                ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summaryData.recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3.5 p-4 rounded-xl bg-background border border-border-muted group hover:border-border hover:bg-surface transition-all shadow-sm hover:shadow">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs flex-shrink-0 border border-primary/20">
                          {activity.avatar || '—'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-on-surface truncate" style={{ color: 'var(--theme-text)' }}>{activity.user}</p>
                          <p className="text-[10px] text-muted leading-relaxed mt-0.5">{activity.action}</p>
                        </div>
                        <span className="text-[10px] font-medium text-muted self-start">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                )
                : (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 bg-background border border-border-muted rounded-xl flex items-center justify-center text-muted mx-auto mb-3">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >notifications</span>
                    </div>
                    <p className="text-xs font-medium text-muted">Belum ada aktivitas</p>
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary font-headline">Aksi Cepat</h2>
            <span className="text-xs font-medium text-muted ml-auto">Pintasan Menu</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className={cn(
                  "group flex flex-col items-center justify-center p-5 rounded-xl bg-surface border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95",
                  item.hoverShadow
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110", item.iconBg)}>
                  <item.icon size={20} className="transition-transform duration-300 group-hover:rotate-6" />
                </div>
                <span className="text-xs font-medium text-center leading-snug text-muted group-hover:text-primary transition-colors">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
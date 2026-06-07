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
import { SelectField, SelectOption } from '../../components/ui/SelectField';
import { PageContent, PageCard, PageCardHeader } from '@/components/ui/page'
import { DashboardHero, DashboardFilter, DashboardStatCard, DashboardStatGrid, DashboardQuickActions, FilterItem } from '@/components/ui/dashboard'

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterProdi, setFilterProdi] = useState('all');
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData(filterPeriod, startDate, endDate, filterProdi);
  }, [filterPeriod, startDate, endDate, filterProdi, fetchDashboardData]);

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
    setFilterProdi('all');
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
      icon: 'group',
      value: summaryData.totalStudents || 0,
      description: "mahasiswa terdaftar",
      colorClass: "text-primary",
      bgClass: "bg-primary/10 border-primary/20",
      route: "/faculty/mahasiswa"
    },
    {
      label: "Prestasi Baru",
      icon: 'emoji_events',
      value: summaryData.totalPrestasi || 0,
      description: "menunggu validasi",
      colorClass: "text-secondary",
      bgClass: "bg-secondary/10 border-secondary/20",
      route: "/faculty/prestasi"
    },
    {
      label: "Program Studi",
      icon: 'layers',
      value: summaryData.totalProdi || 0,
      description: "program studi aktif",
      colorClass: "text-info",
      bgClass: "bg-info/10 border-info/20",
      route: "/faculty/prodi"
    },
  ];

  const quickActions = [
    { label: 'Validasi Prestasi', icon: 'emoji_events', path: '/faculty/prestasi', iconBg: 'bg-success/10 text-success border border-success/20' },
    { label: 'Monitor PKKMB', icon: 'check_circle', path: '/faculty/pkkmb', iconBg: 'bg-primary/10 text-primary border border-primary/20' },
    { label: 'Screening Kesehatan', icon: 'monitor_heart', path: '/faculty/kesehatan', iconBg: 'bg-warning/10 text-warning border border-warning/20' },
    { label: 'Aspirasi Mahasiswa', icon: 'chat', path: '/faculty/aspirasi', iconBg: 'bg-error/10 text-error border border-error/20' },
    { label: 'Proposal ORMAWA', icon: 'description', path: '/faculty/ormawa/proposals', iconBg: 'bg-info/10 text-info border border-info/20' },
    { label: 'Jadwal Konseling', icon: 'calendar_today', path: '/faculty/konseling', iconBg: 'bg-secondary/10 text-secondary border border-secondary/20' },
  ];

  return (
    <PageContent>
      {/* ── Page Header ────────────────────────────────────────── */}
      <DashboardHero 
        title="Selamat datang,"
        highlightedTitle={`${firstName}!`}
        subtitle="Kelola data akademik, pantau kinerja mahasiswa, dan verifikasi layanan kampus dari satu panel terpusat."
        icon="admin_panel_settings"
        badges={[
          { label: 'SIAKAD Portal', active: false },
          { label: 'Active Session', active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/faculty/mahasiswa')}
              className="h-10 px-4 rounded-xl text-white text-xs font-bold uppercase tracking-wider gap-2 flex items-center transition-all active:scale-95 shadow-lg shrink-0"
              style={{
                backgroundColor: 'var(--theme-primary)',
                boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--theme-primary) 30%, transparent)'
              }}>
              Lihat Data Mahasiswa
            </button>
            <button onClick={() => navigate('/faculty/laporan')}
              className="h-10 px-4 rounded-xl border border-[var(--theme-border)] bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)]/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer">
              Unduh Laporan
            </button>
          </div>
        }
      />

      {/* Filter Section */}
      <DashboardFilter 
        title="Filterasi Data"
        description="Filter data berdasarkan periode akademik"
        icon="filter_list"
        activeFiltersCount={(filterPeriod !== 'all' ? 1 : 0) + (filterProdi !== 'all' ? 1 : 0) + (startDate || endDate ? 1 : 0)}
        onResetFilters={handleResetFilters}
      >
        <FilterItem label="Periode Akademik" icon="calendar_month">
          <SelectField
            value={filterPeriod}
            onValueChange={(val) => handlePeriodChange(val)}
            className="w-full pl-9 h-10"
          >
            <SelectOption value="all">Pilih Semua</SelectOption>
            {summaryData.periods?.map((p) => (
              <SelectOption key={p.id} value={String(p.id)}>
                {p.Name || p.nama_periode}
              </SelectOption>
            ))}
          </SelectField>
        </FilterItem>

        <FilterItem label="Program Studi" icon="layers">
          <SelectField
            value={filterProdi}
            onValueChange={(val) => setFilterProdi(val)}
            className="w-full h-10"
          >
            <SelectOption value="all">Semua Prodi</SelectOption>
            {summaryData.prodis?.map((p) => (
              <SelectOption key={p.id} value={String(p.id)}>
                {p.Nama || p.nama} ({p.Jenjang || p.jenjang})
              </SelectOption>
            ))}
          </SelectField>
        </FilterItem>
        
        <FilterItem label="Rentang Tanggal" icon="date_range">
          <div className="flex items-center gap-2 w-full">
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="flex-1 px-3 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-lg text-xs font-semibold text-[var(--theme-text)] focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] outline-none transition-all cursor-pointer"
            />
            <span className="text-muted text-xs">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="flex-1 px-3 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-lg text-xs font-semibold text-[var(--theme-text)] focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] outline-none transition-all cursor-pointer"
            />
          </div>
        </FilterItem>
      </DashboardFilter>

      {/* Stat Cards */}
      <DashboardStatGrid>
        {statCards.map((card, i) => (
          <DashboardStatCard key={i} {...card} loading={loading} />
        ))}
      </DashboardStatGrid>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Chart: Mahasiswa per Prodi */}
        <div className="lg:col-span-8">
          <PageCard className="h-full">
            <PageCardHeader title="Distribusi Mahasiswa per Prodi" description="Jumlah mahasiswa aktif berdasarkan program studi" icon="bar_chart" />
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
          </PageCard>
        </div>

        {/* Status Mahasiswa */}
        <div className="lg:col-span-4">
          <PageCard className="h-full">
            <PageCardHeader title="Status Akademik" description="Kondisi mahasiswa saat ini" icon="how_to_reg" />
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
                    "flex items-center gap-2 p-2 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border-muted)]",
                    dynamicStatusData.length % 2 !== 0 && idx === dynamicStatusData.length - 1 && "col-span-2"
                  )}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-[var(--theme-text-muted)] truncate">{item.name}</p>
                    <p className="text-xs font-semibold text-[var(--theme-text)] leading-none tabular-nums">{item.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </PageCard>
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Aktivitas Terbaru */}
        <div className="lg:col-span-12">
          <PageCard>
            <PageCardHeader title="Aktivitas Terbaru" description="Log aktivitas sistem terbaru di tingkat fakultas" icon="schedule" />
          <div className="p-5">
            {summaryData.recentActivity?.length > 0
              ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summaryData.recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 p-4 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border-muted)] group hover:border-[var(--theme-border)] hover:bg-[var(--theme-surface)] transition-all shadow-sm hover:shadow">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 border" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)', color: 'var(--theme-primary)', borderColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)' }}>
                        {activity.avatar || '—'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[var(--theme-text)] truncate">{activity.user}</p>
                        <p className="text-[10px] text-[var(--theme-text-muted)] leading-relaxed mt-0.5">{activity.action}</p>
                      </div>
                      <span className="text-[10px] font-medium text-[var(--theme-text-muted)] self-start">{activity.time}</span>
                    </div>
                  ))}
                </div>
              )
              : (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 bg-[var(--theme-bg)] border border-[var(--theme-border-muted)] rounded-xl flex items-center justify-center text-[var(--theme-text-muted)] mx-auto mb-3">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >notifications</span>
                  </div>
                  <p className="text-xs font-medium text-[var(--theme-text-muted)]">Belum ada aktivitas</p>
                </div>
              )
            }
          </div>
          </PageCard>
        </div>
      </div>

      {/* Quick Actions */}
      <DashboardQuickActions 
        title="Aksi Cepat"
        description="Pintasan Menu"
        actions={quickActions.map(ql => ({
          label: ql.label,
          icon: ql.icon,
          path: ql.path,
          iconBg: ql.iconBg
        }))}
      />
    </PageContent>
  );
}

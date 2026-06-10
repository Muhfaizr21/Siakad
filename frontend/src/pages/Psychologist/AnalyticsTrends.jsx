import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;



const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const STAT_SKINS = [
  { icon: 'group', color: 'text-primary', bg: 'bg-primary/10', ring: 'ring-primary/10' },
  { icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
  { icon: 'error', color: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-100' },
  { icon: 'show_chart', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100' },
];

const SOURCE_TABLES = [
  { table: 'psikolog.bookings', note: 'isu dominan dan pasien unik' },
  { table: 'psikolog.session_notes', note: 'sesi, tren bulanan, stabilitas' },
  { table: 'psikolog.assessments', note: 'kasus mendesak' },
];

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatValue(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value ?? '-';
  return new Intl.NumberFormat('id-ID').format(numeric);
}

export default function AnalyticsTrends() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProdi, setSelectedProdi] = useState('');
  const [selectedFakultas, setSelectedFakultas] = useState('');

  // Lookup lists state
  const [prodiList, setProdiList] = useState([]);
  const [fakultasList, setFakultasList] = useState([]);

  // Load lookup data
  useEffect(() => {
    psychologistService.getProdiList().then(res => setProdiList(res.data || res)).catch(console.error);
    psychologistService.getFakultasList().then(res => setFakultasList(res.data || res)).catch(console.error);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (selectedProdi) params.prodi_id = selectedProdi;
      if (selectedFakultas) params.fakultas_id = selectedFakultas;

      const res = await psychologistService.getAnalytics(params);
      setAnalytics(res.data ?? res);
    } catch (err) {
      setError(err?.message || 'Gagal memuat data analitik.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedProdi, selectedFakultas]);

  // Load analytics when filters change
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const stats = useMemo(() => {
    const rawStats = Array.isArray(analytics?.stats) ? analytics.stats : [];
    return rawStats.map((stat, index) => ({
      ...stat,
      value: formatValue(stat.value),
      icon: STAT_SKINS[index]?.icon || Activity,
      color: STAT_SKINS[index]?.color || 'text-primary',
      bg: STAT_SKINS[index]?.bg || 'bg-primary/10',
      ring: STAT_SKINS[index]?.ring || 'ring-primary/10',
    }));
  }, [analytics]);

  const monthly = useMemo(() => {
    const source = Array.isArray(analytics?.monthly) ? analytics.monthly : [];
    return MONTHS.map((month, index) => ({
      name: month,
      sesi: toNumber(source[index])
    }));
  }, [analytics]);

  const topIssues = Array.isArray(analytics?.top_issues) ? analytics.top_issues : [];
  const recommendations = Array.isArray(analytics?.recommendations) ? analytics.recommendations : [];
  const activities = Array.isArray(analytics?.activities) ? analytics.activities : [];
  const maxMonthly = Math.max(...monthly.map(m => m.sesi), 1);
  const totalMonthlySessions = monthly.reduce((sum, item) => sum + item.sesi, 0);
  const stablePercentage = Math.max(0, Math.min(100, toNumber(analytics?.stable_percentage)));
  const hasAnalytics = Boolean(analytics) && !loading;

  // New analytics values
  const prodiPopularity = Array.isArray(analytics?.prodi_popularity) ? analytics.prodi_popularity : [];
  const academicCount = analytics?.academic_count ?? 0;
  const nonAcademicCount = analytics?.non_academic_count ?? 0;
  const academicPercentage = analytics?.academic_percentage ?? 0;
  const nonAcademicPercentage = analytics?.non_academic_percentage ?? 0;

  const issueCategoriesData = [
    { name: 'Akademik', value: academicCount, fill: '#3b82f6' },
    { name: 'Non-Akademik', value: nonAcademicCount, fill: '#f59e0b' }
  ];
  const dailyTrends = Array.isArray(analytics?.daily_trends) ? analytics.daily_trends : [];
  const maxDaily = Math.max(...dailyTrends.map(d => toNumber(d.count)), 1);

  return (
    <>
      <div className="w-full relative space-y-6 scroll-smooth">
          {/* ── Welcome Banner ─────────────────────────────────────────── */}
          <section className="relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col xl:flex-row xl:items-center gap-6 group shadow-sm border border-slate-200/60 bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-slate-50/80" />
            <div className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 left-20 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl" />

            <div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/[0.02] border border-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm relative overflow-hidden">
                    <span className="material-symbols-outlined text-primary relative z-10" style={{ fontSize: '26px' }}>analytics</span>
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                        Schema psikolog
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                      Analitik & Tren
                    </h1>
                    <p className="mt-2 text-xs md:text-sm font-medium text-slate-500 leading-relaxed max-w-xl">
                      Ringkasan real-time dari booking, catatan sesi, dan asesmen yang tersimpan di database.
                    </p>
                 </div>
              </div>
            </div>
            
            <div className="relative z-10 shrink-0 mt-2 xl:mt-0">
              <button
                type="button"
                onClick={fetchAnalytics}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full xl:w-auto px-5 py-3 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm hover:text-primary hover:border-primary/30 transition-all disabled:cursor-wait disabled:opacity-60"
              >
                <span className={`material-symbols-outlined text-[18px] shrink-0 ${loading ? 'animate-spin' : ''}`}>sync</span>
                Muat Ulang
              </button>
            </div>
          </section>

          {/* ── Filter Bar Card ──────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-5 relative overflow-hidden group">
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-50 bg-primary/5 transition-opacity group-hover:opacity-100" />
            
            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="material-symbols-outlined text-[20px] text-primary">filter_list</span>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 font-headline">Filter Data Analitik</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Tanggal Mulai */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-base">event</span>
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                {/* Tanggal Selesai */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-base">event</span>
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                {/* Fakultas */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-base">domain</span>
                    Fakultas
                  </label>
                  <select
                    value={selectedFakultas}
                    onChange={(e) => {
                      setSelectedFakultas(e.target.value);
                      setSelectedProdi('');
                    }}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 cursor-pointer"
                  >
                    <option value="">Semua Fakultas</option>
                    {fakultasList.map((f) => (
                      <option key={f.id} value={f.id}>{f.nama}</option>
                    ))}
                  </select>
                </div>

                {/* Program Studi */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-base">school</span>
                    Program Studi
                  </label>
                  <select
                    value={selectedProdi}
                    onChange={(e) => setSelectedProdi(e.target.value)}
                    disabled={!selectedFakultas}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Semua Prodi</option>
                    {prodiList
                      .filter((p) => !selectedFakultas || p.fakultas_id === Number(selectedFakultas))
                      .map((p) => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                  <span className="text-[10px] font-bold text-slate-400">Pilih kriteria untuk menyaring data</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSelectedProdi('');
                    setSelectedFakultas('');
                  }}
                  disabled={!(startDate || endDate || selectedProdi || selectedFakultas)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  Reset Filter
                </button>
              </div>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-3 rounded-3xl border border-rose-100 bg-rose-50 px-5 py-4 text-rose-700">
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-lg">error</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Data belum bisa dimuat</p>
                <p className="mt-1 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading && !analytics
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-36 animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="mb-5 size-12 rounded-2xl bg-slate-100" />
                    <div className="mb-3 h-7 w-20 rounded bg-slate-100" />
                    <div className="h-3 w-32 rounded bg-slate-100" />
                  </div>
                ))
              : stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label || index}
                      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <div className={`flex size-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} ring-1 ${stat.ring}`}>
                          <span className="material-symbols-outlined text-2xl shrink-0">{Icon}</span>
                        </div>
                        <span className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Live
                        </span>
                      </div>
                      <p className="font-headline text-3xl font-black tracking-tight text-slate-950">{stat.value}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                    </div>
                  );
                })}
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <div className="rounded-2xl border shadow-sm p-5 sm:p-5" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary">
                      <span className="material-symbols-outlined text-lg shrink-0">bar_chart</span>
                      Tren Sesi Bulanan
                    </h2>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Total {formatValue(totalMonthlySessions)} sesi dari catatan sesi tersimpan
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-sm shrink-0">calendar_month</span>
                    Jan-Des
                  </div>
                </div>

                <div className="h-72">
                  {hasAnalytics && totalMonthlySessions === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Belum ada sesi selesai</p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">Grafik akan terisi dari `psikolog.session_notes`.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthly} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                          <RechartsTooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="sesi" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Tren Harian Bulan Ini */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-5">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary">
                      <span className="material-symbols-outlined text-lg shrink-0">show_chart</span>
                      Tren Konseling Bulan Ini (Harian)
                    </h2>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Grafik harian aktivitas konseling pada bulan berjalan
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-sm shrink-0">calendar_today</span>
                    Harian
                  </div>
                </div>

                <div className="h-64 overflow-x-auto pb-4 scrollbar-thin">
                  {dailyTrends.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
                      <p className="text-xs font-semibold text-slate-400">Belum ada aktivitas harian pada bulan ini.</p>
                    </div>
                  ) : (
                    <div className="h-full w-full min-w-[500px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyTrends} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}
                            labelStyle={{ color: '#64748b' }}
                          />
                          <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest font-headline" style={{ color: 'var(--theme-h3)' }}>Isu Dominan</h3>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Dihitung dari topik booking</p>
                    </div>
                    <span className="material-symbols-outlined text-white/30 text-3xl shrink-0">psychology</span>
                  </div>

                  <div className="space-y-5">
                    {topIssues.length > 0 ? (
                      topIssues.map((issue, index) => (
                        <div key={`${issue.name}-${index}`}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="truncate text-[11px] font-black uppercase tracking-wider">{issue.name || 'Tanpa Topik'}</span>
                            <span className="text-[11px] font-black text-white/70">{toNumber(issue.percentage)}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, toNumber(issue.percentage))}%` }} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center">
                        <p className="text-xs font-black uppercase tracking-widest text-white/70">Belum ada topik booking</p>
                        <p className="mt-1 text-xs font-semibold text-white/40">Data muncul setelah ada booking mahasiswa.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto mb-5 flex size-36 items-center justify-center rounded-full bg-slate-50">
                    <div
                      className="flex size-28 items-center justify-center rounded-full"
                      style={{ background: `conic-gradient(#10b981 ${stablePercentage * 3.6}deg, #e2e8f0 0deg)` }}
                    >
                      <div className="flex size-20 flex-col items-center justify-center rounded-full bg-white">
                        <span className="font-headline text-2xl font-black text-slate-950">{stablePercentage}%</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Stabil</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest font-headline" style={{ color: 'var(--theme-h3)' }}>Stabilitas Pasien</h3>
                  <p className="mx-auto mt-2 max-w-xs text-xs font-semibold leading-relaxed text-slate-400">
                    Persentase status Stabil, Pemulihan, atau Membaik dari `psikolog.session_notes`.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Jurusan/Prodi Terbanyak */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-950">Prodi Terbanyak</h3>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Distribusi mahasiswa per prodi</p>
                    </div>
                    <span className="material-symbols-outlined text-primary/30 text-3xl shrink-0">domain</span>
                  </div>

                  <div className="space-y-4">
                    {prodiPopularity.length > 0 ? (
                      prodiPopularity.map((prodi, index) => (
                        <div key={`${prodi.name}-${index}`}>
                          <div className="mb-1.5 flex items-center justify-between gap-3">
                            <span className="truncate text-[10px] font-black uppercase tracking-wider text-slate-700">{prodi.name}</span>
                            <span className="text-[10px] font-black text-slate-900">{prodi.count} Sesi ({prodi.percentage}%)</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${prodi.percentage}%` }} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Belum ada data prodi</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kategori Masalah: Akademik vs Non-Akademik */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-950">Kategori Masalah</h3>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Akademik vs Non-Akademik</p>
                      </div>
                      <span className="material-symbols-outlined text-primary/30 text-3xl shrink-0">category</span>
                    </div>

                    <div className="h-64 w-full flex flex-col items-center justify-center mt-4 pb-4">
                      {(academicCount === 0 && nonAcademicCount === 0) ? (
                        <p className="text-xs font-semibold text-slate-400">Belum ada data kategori.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={issueCategoriesData}
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {issueCategoriesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, paddingTop: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Total Kasus Terdata:</span>
                    <span className="text-slate-950 font-black text-xs">{academicCount + nonAcademicCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6 xl:col-span-4">
              <div className="rounded-2xl border shadow-sm p-5" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                <h3 className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                  <span className="material-symbols-outlined text-lg shrink-0">database</span>
                  Sumber Data
                </h3>
                <div className="space-y-3">
                  {SOURCE_TABLES.map((source) => (
                    <div key={source.table} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-black text-slate-900">{source.table}</p>
                      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">{source.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                  <span className="material-symbols-outlined text-lg shrink-0">trending_up</span>
                  Rekomendasi
                </h3>
                <div className="space-y-3">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec, index) => {
                      const positive = rec.type === 'positive';
                      return (
                        <div
                          key={`${rec.title}-${index}`}
                          className={`rounded-2xl border px-4 py-3 ${positive ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-amber-50'}`}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            {positive ? <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0">check_circle</span> : <span className="material-symbols-outlined text-amber-600 text-sm shrink-0">error</span>}
                            <p className={`text-[10px] font-black uppercase tracking-widest ${positive ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {rec.title}
                            </p>
                          </div>
                          <p className="text-xs font-semibold leading-relaxed text-slate-600">{rec.description}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-xs font-semibold text-slate-400">
                      Belum ada rekomendasi dari data saat ini.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                  <span className="material-symbols-outlined text-lg shrink-0">schedule</span>
                  Aktivitas Terakhir
                </h3>
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div key={`${activity.title}-${index}`} className="flex gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                          <span className="material-symbols-outlined text-lg shrink-0">chat</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black uppercase tracking-wide text-slate-950">{activity.title}</p>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{activity.time}</p>
                          <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">{activity.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-xs font-semibold text-slate-400">
                      Belum ada aktivitas sesi.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </section>
        </div>
    </>
  );
}

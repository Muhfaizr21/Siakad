import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
    return MONTHS.map((_, index) => toNumber(source[index]));
  }, [analytics]);

  const topIssues = Array.isArray(analytics?.top_issues) ? analytics.top_issues : [];
  const recommendations = Array.isArray(analytics?.recommendations) ? analytics.recommendations : [];
  const activities = Array.isArray(analytics?.activities) ? analytics.activities : [];
  const maxMonthly = Math.max(...monthly, 1);
  const totalMonthlySessions = monthly.reduce((sum, item) => sum + item, 0);
  const stablePercentage = Math.max(0, Math.min(100, toNumber(analytics?.stable_percentage)));
  const hasAnalytics = Boolean(analytics) && !loading;

  // New analytics values
  const prodiPopularity = Array.isArray(analytics?.prodi_popularity) ? analytics.prodi_popularity : [];
  const academicCount = analytics?.academic_count ?? 0;
  const nonAcademicCount = analytics?.non_academic_count ?? 0;
  const academicPercentage = analytics?.academic_percentage ?? 0;
  const nonAcademicPercentage = analytics?.non_academic_percentage ?? 0;
  const dailyTrends = Array.isArray(analytics?.daily_trends) ? analytics.daily_trends : [];
  const maxDaily = Math.max(...dailyTrends.map(d => toNumber(d.count)), 1);

  return (
    <>
      <div className="w-full relative space-y-6 scroll-smooth">
          <section className="overflow-hidden rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center lg:p-5">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="material-symbols-outlined text-sm shrink-0">database</span>
                  Schema psikolog
                </div>
                <div>
                  <h1 className="font-headline text-2xl font-black uppercase tracking-tight text-primary sm:text-3xl">
                    Analitik & Tren
                  </h1>
                  <p className="mt-1 max-w-2xl text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Ringkasan real-time dari booking, catatan sesi, dan asesmen yang tersimpan di database.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchAnalytics}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition hover:border-primary/30 hover:text-primary disabled:cursor-wait disabled:opacity-60"
              >
                {loading ? <span className="material-symbols-outlined animate-spin text-base shrink-0">sync</span> : <span className="material-symbols-outlined text-base shrink-0">sync</span>}
                Muat Ulang
              </button>
            </div>
          </section>

          {/* Filters Bar */}
          <section className="rounded-2xl border shadow-sm p-5" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">filter_alt</span>
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Filter Data Analitik</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-primary/5 transition-all"
                  style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-primary/5 transition-all"
                  style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Fakultas</label>
                  <select
                    value={selectedFakultas}
                    onChange={(e) => {
                      setSelectedFakultas(e.target.value);
                      setSelectedProdi('');
                    }}
                    className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer"
                  style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
                  >
                    <option value="">Semua Fakultas</option>
                    {fakultasList.map((f) => (
                      <option key={f.id} value={f.id}>{f.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Program Studi</label>
                  <select
                    value={selectedProdi}
                    onChange={(e) => setSelectedProdi(e.target.value)}
                    className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer"
                  style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
                  >
                    <option value="">Semua Program Studi</option>
                    {prodiList
                      .filter((p) => !selectedFakultas || p.fakultas_id === Number(selectedFakultas))
                      .map((p) => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSelectedProdi('');
                    setSelectedFakultas('');
                  }}
                  className="px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                >
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
                    <div className="grid h-full grid-cols-12 items-end gap-2 sm:gap-3">
                      {monthly.map((value, index) => {
                        const height = value > 0 ? Math.max(8, Math.round((value / maxMonthly) * 100)) : 2;
                        return (
                          <div key={MONTHS[index]} className="group flex h-full min-w-0 flex-col items-center justify-end gap-2">
                            <div className="relative flex h-full w-full items-end rounded-full bg-slate-50">
                              <div
                                className="w-full rounded-full bg-primary transition-all duration-500 group-hover:bg-indigo-600"
                                style={{ height: `${height}%` }}
                              />
                              <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-slate-950 px-2 py-1 text-[9px] font-black text-white opacity-0 transition group-hover:opacity-100">
                                {value}
                              </span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{MONTHS[index]}</span>
                          </div>
                        );
                      })}
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
                    <div className="h-full min-w-[700px] flex items-end gap-1.5 sm:gap-2 px-2">
                      {dailyTrends.map((item, index) => {
                        const height = item.count > 0 ? Math.max(8, Math.round((item.count / maxDaily) * 100)) : 2;
                        return (
                          <div key={`${item.date}-${index}`} className="group flex h-full flex-1 min-w-0 flex-col items-center justify-end gap-1">
                            <div className="relative flex h-full w-full items-end rounded-full bg-slate-50">
                              <div
                                className="w-full rounded-full bg-emerald-500 transition-all duration-300 group-hover:bg-emerald-600"
                                style={{ height: `${height}%` }}
                              />
                              <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-950 px-2 py-1 text-[8px] font-black text-white opacity-0 transition group-hover:opacity-100 whitespace-nowrap z-10 shadow-lg">
                                {item.count} Sesi
                              </span>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-tight text-slate-400 mt-1 whitespace-nowrap rotate-45 origin-left">{item.date}</span>
                          </div>
                        );
                      })}
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

                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">
                          <span>Akademik</span>
                          <span className="text-primary font-bold">{academicCount} Kasus ({academicPercentage}%)</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${academicPercentage}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">
                          <span>Non-Akademik</span>
                          <span className="text-amber-500 font-bold">{nonAcademicCount} Kasus ({nonAcademicPercentage}%)</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${nonAcademicPercentage}%` }} />
                        </div>
                      </div>
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

import React from 'react';
import { Link } from 'react-router-dom';
import { useKencanaDashboardQuery, useKencanaTimelineQuery } from '../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, PrimaryButton, ProgressBar, StatusBadge, fmtDate } from './Kencana/components';
import { PrimaryStatsCard } from '@/components/ui/StatsCard';
import { DashboardHero } from '@/components/ui/dashboard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../../store/useAuthStore';
import { cn } from '@/lib/utils';

export default function KencanaPage() {
  const user = useAuthStore(state => state.user);
  const { data: dashboardData, isLoading: isLoadingDashboard, isError: isErrorDashboard } = useKencanaDashboardQuery();
  const { data: timelineData, isLoading: isLoadingTimeline, isError: isErrorTimeline } = useKencanaTimelineQuery();

  if (isLoadingDashboard || isLoadingTimeline) return <KencanaShell title="Dashboard Kencana"><LoadingPanel /></KencanaShell>;
  if (isErrorDashboard || isErrorTimeline) return <KencanaShell title="Dashboard Kencana"><ErrorPanel message="Gagal memuat dashboard Kencana." /></KencanaShell>;

  const blockers = dashboardData?.blockers || [];
  const notifications = dashboardData?.notifications || [];

  // Sort stages: active first, then by order_number
  const sortedStages = [...(timelineData?.stages || [])].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (b.status === 'active' && a.status !== 'active') return 1;
    return (a.order_number || 0) - (b.order_number || 0);
  });


  return (
    <KencanaShell
      title="Dashboard"
      highlightedTitle="Kencana"
      subtitle={`Tahap aktif: ${dashboardData?.active_stage?.name || 'Menunggu jadwal admin'}. Timeline, sesi, quiz, dan tugas mengikuti data yang dipublish pengelola.`}
      badges={[
        { label: dashboardData?.period?.name || 'Kencana', active: false },
        { label: `Status: ${dashboardData?.graduation_status?.replaceAll('_', ' ') || 'Belum Mulai'}`, active: true }
      ]}
      actions={
        <div className="flex items-center gap-6 bg-[var(--theme-surface)] p-4 md:p-6 rounded-2xl border border-[var(--theme-border-muted)] shadow-sm">
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-bold text-[var(--theme-text-muted)] tracking-wide mb-1 uppercase">Nilai Kencana</span>
            <span className="text-3xl font-bold text-[var(--theme-text)] font-headline tracking-tight tabular-nums leading-none">
              {Number(dashboardData?.temporary_final_score || 0).toFixed(1)}
            </span>
          </div>
          <div className="size-14 rounded-2xl bg-[var(--theme-primary)] flex items-center justify-center text-white shadow-md border-none">
            <span className="material-symbols-outlined animate-pulse" style={{ fontSize: '28px' }} strokeWidth={2.5}>grade</span>
          </div>
        </div>
      }
    >

      {/* Metrics */}
      <section className="grid gap-4 md:grid-cols-4 mb-6">
        <PrimaryStatsCard
          title="Periode"
          value={dashboardData?.period?.year || '-'}
          badgeText={dashboardData?.period?.name}
          icon={({ size }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>calendar_month</span>}
          colorTheme="primary"
        />
        <PrimaryStatsCard
          title="Progress"
          value={`${dashboardData?.progress_total || 0}%`}
          badgeText="Selesai"
          icon={({ size }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>trending_up</span>}
          colorTheme="success"
        />
        <PrimaryStatsCard
          title="Nilai Univ"
          value={Number(dashboardData?.temporary_final_score || 0).toFixed(1)}
          badgeText="Bobot 25/35/40"
          icon={({ size }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>grade</span>}
          colorTheme="warning"
        />
        <PrimaryStatsCard
          title="Remedial"
          value={dashboardData?.needs_remedial ? 'Perlu' : 'Tidak'}
          badgeText="Status"
          icon={({ size }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>rule</span>}
          colorTheme={dashboardData?.needs_remedial ? "error" : "success"}
        />
      </section>

      {/* ── Enriched Visual Charts Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart 1: Komponen Nilai (List) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4 shrink-0">
              <div className="w-12 h-12 bg-blue-50/80 rounded-xl flex justify-center items-center text-blue-600 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                <span className="material-symbols-outlined text-[24px]">grade</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Komponen Nilai</span>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">Bobot Penilaian Kencana</h3>
              </div>
            </div>
            <div className="h-[200px] w-full mt-2 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {[
                { name: 'Tugas', bobot: 40, color: 'bg-violet-500', text: 'text-violet-600', iconBg: 'bg-violet-50 text-violet-600 border-violet-100', icon: 'assignment' },
                { name: 'Kuis', bobot: 35, color: 'bg-emerald-500', text: 'text-emerald-600', iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: 'quiz' },
                { name: 'Kehadiran', bobot: 25, color: 'bg-blue-500', text: 'text-blue-600', iconBg: 'bg-blue-50 text-blue-600 border-blue-100', icon: 'fact_check' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between transition-colors hover:bg-white hover:border-slate-200 hover:shadow-sm cursor-default">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border", item.iconBg)}>
                        <span className="material-symbols-outlined text-base">{item.icon}</span>
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-[11px] font-bold text-slate-800 block truncate">{item.name}</span>
                      </div>
                    </div>
                    <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wide shrink-0 border bg-white shadow-sm", item.text, item.iconBg)}>
                      {item.bobot}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-500", item.color)} style={{ width: `${item.bobot}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Donut Chart - Sebaran Nilai */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-50/80 rounded-xl flex justify-center items-center text-emerald-600 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                <span className="material-symbols-outlined text-[24px]">donut_small</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Komposisi Nilai</span>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">Sebaran Bobot Maksimal</h3>
              </div>
            </div>
            <div className="h-[180px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Tugas', value: 40 },
                      { name: 'Kuis', value: 35 },
                      { name: 'Kehadiran', value: 25 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {[
                      { name: 'Tugas', value: 40 },
                      { name: 'Kuis', value: 35 },
                      { name: 'Kehadiran', value: 25 },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#8b5cf6', '#10b981', '#3b82f6'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", fontSize: "11px", fontWeight: "bold" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { name: 'Tugas', value: 40 },
              { name: 'Kuis', value: 35 },
              { name: 'Kehadiran', value: 25 },
            ].map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-md bg-slate-50 border border-slate-100 hover:bg-white transition-colors">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ['#8b5cf6', '#10b981', '#3b82f6'][idx % 3] }} />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-slate-400 truncate leading-none">{item.name}</p>
                  <p className="text-sm font-black text-slate-700 leading-none mt-1">{item.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Tahap Aktif / Criteria */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-50/80 rounded-xl flex justify-center items-center text-indigo-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Syarat & Status</span>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">Criteria Kelulusan Kencana</h3>
              </div>
            </div>
            <div className="h-[200px] w-full mt-2 flex flex-col justify-center gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <span className="text-3xl font-black text-indigo-600">{dashboardData?.active_stage?.name || '-'}</span>
                <p className="text-xs font-bold text-indigo-400 mt-1 uppercase tracking-widest">Tahap Aktif Saat Ini</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xl font-black text-slate-700">70.0</span>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Nilai Minimum</p>
                </div>
                <div className={cn("text-center p-3 rounded-xl border", dashboardData?.needs_remedial ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100")}>
                  <span className={cn("text-xl font-black", dashboardData?.needs_remedial ? "text-rose-600" : "text-emerald-600")}>{dashboardData?.needs_remedial ? 'Perlu' : 'Tidak'}</span>
                  <p className={cn("text-[10px] font-bold mt-1 uppercase tracking-widest", dashboardData?.needs_remedial ? "text-rose-400" : "text-emerald-400")}>Remedial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {/* Timeline Cards */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[var(--theme-text)] font-headline">Timeline Tahapan Kencana</h3>
                <p className="text-sm font-medium text-[var(--theme-text-muted)] mt-1">Pilih tahapan untuk melihat sesi, materi, tugas, dan kuis.</p>
              </div>
            </div>

            <div className="space-y-4">
              {sortedStages.map((stage, index) => {
                const CardComponent = user?.role === 'super_admin' ? 'div' : Link;
                const linkProps = user?.role === 'super_admin' ? {} : { to: stage.phase_type === 'pasca_kencana' ? '/student/kencana/score' : `/student/kencana/stage/${stage.id}` };
                return (
                  <CardComponent
                    key={stage.id}
                    {...linkProps}
                    className={`group relative grid gap-4 rounded-2xl border ${stage.status === 'active' ? 'border-bku-primary/30 bg-blue-50/80 shadow-md' : 'border-slate-200/60 bg-white/60'} p-5 transition-all ${user?.role === 'super_admin' ? '' : 'hover:-translate-y-1 hover:shadow-lg'} md:grid-cols-[auto_1fr_auto]`}
                  >
                    {stage.status === 'active' && (
                      <div className="absolute -top-2 -right-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--theme-success)] text-white shadow-lg animate-pulse">
                          <span className="material-symbols-outlined text-[12px]">bolt</span>
                        </span>
                      </div>
                    )}
                    <div className={`grid size-12 place-items-center rounded-xl ${stage.status === 'active' ? 'bg-[var(--theme-primary)] text-[var(--theme-text-on-primary)] shadow-md' : 'bg-[var(--theme-border-muted)] text-[var(--theme-text-muted)]'} text-lg font-bold font-headline`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-base font-bold font-headline ${stage.status === 'active' ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text)]'}`}>{stage.name}</h4>
                        <StatusBadge status={stage.status} />
                      </div>
                      <p className="mt-1 text-sm font-medium text-[var(--theme-text-muted)] line-clamp-2">{stage.description}</p>
                      {stage.phase_type !== 'pasca_kencana' && (
                        <p className="mt-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--theme-text-subtle)] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {fmtDate(stage.start_date)} - {fmtDate(stage.end_date)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 self-center border-t border-[var(--theme-border-muted)] pt-4 md:border-t-0 md:pt-0">
                      {stage.phase_type === 'pasca_kencana' ? (
                        <div className="rounded-xl bg-[var(--theme-primary)]/10 px-4 py-2 flex items-center gap-2 border border-[var(--theme-primary)]/20">
                          <span className="material-symbols-outlined text-[var(--theme-primary)]">workspace_premium</span>
                          <span className="text-xs font-bold text-[var(--theme-primary)] uppercase tracking-widest font-headline">Lihat Nilai</span>
                        </div>
                      ) : (
                        <>
                          <Mini label="Sesi" value={stage.session_count} active={stage.status === 'active'} />
                          <Mini label="Materi/Tugas" value={(stage.quiz_count || 0) + (stage.assignment_count || 0)} active={stage.status === 'active'} />
                        </>
                      )}
                    </div>
                  </CardComponent>
                );
              })}
              {sortedStages.length === 0 && (
                <div className="text-center py-10 rounded-2xl border-2 border-dashed border-border bg-[var(--theme-border-muted)]">
                  <span className="material-symbols-outlined text-4xl text-[var(--theme-text-subtle)] mb-2">calendar_month</span>
                  <p className="text-[var(--theme-text-subtle)] font-bold font-headline">Timeline belum tersedia.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Menus */}
          {user?.role !== 'super_admin' && (
            <div className="grid gap-4 md:grid-cols-3">
              <Link to="/student/kencana/score" className="group glass-card p-5 transition hover:bg-slate-50/80 hover:-translate-y-1 hover:shadow-md">
                <div className="grid size-12 place-items-center rounded-xl bg-[var(--theme-warning)] text-white mb-4 shadow-sm">
                  <span className="material-symbols-outlined">workspace_premium</span>
                </div>
                <h4 className="font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-warning)] transition-colors font-headline">Pasca-Kencana</h4>
                <p className="text-[11px] font-semibold text-[var(--theme-text-muted)] mt-1">Rekap Nilai & Sertifikat</p>
              </Link>

              <Link to="/student/kencana/invitations" className="group glass-card p-5 transition hover:bg-slate-50/80 hover:-translate-y-1 hover:shadow-md">
                <div className="grid size-12 place-items-center rounded-xl bg-[var(--theme-primary)] text-[var(--theme-text-on-primary)] mb-4 shadow-sm">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <h4 className="font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-primary)] transition-colors font-headline">Undangan DP</h4>
                <p className="text-[11px] font-semibold text-[var(--theme-text-muted)] mt-1">Pembimbing Kencana</p>
              </Link>

              <Link to="/student/kencana/attendance" className="group glass-card p-5 transition hover:bg-slate-50/80 hover:-translate-y-1 hover:shadow-md">
                <div className="grid size-12 place-items-center rounded-xl bg-[var(--theme-info)] text-white mb-4 shadow-sm">
                  <span className="material-symbols-outlined">fact_check</span>
                </div>
                <h4 className="font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-info)] transition-colors font-headline">Log Presensi</h4>
                <p className="text-[11px] font-semibold text-[var(--theme-text-muted)] mt-1">Kehadiran tiap sesi</p>
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Last Activity */}
          {user?.role !== 'super_admin' && dashboardData?.last_activity?.id && (
            <div className="glass-card p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--theme-primary)]"></div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--theme-text-subtle)]">Aktivitas Terakhir</p>
              <h4 className="text-lg font-bold text-[var(--theme-text)] mt-2 leading-tight font-headline">{dashboardData.last_activity.title}</h4>
              <div className="mt-4">
                <PrimaryButton to={`/student/kencana/session/${dashboardData.last_activity.id}`} className="w-full justify-center">
                  Lanjutkan Belajar <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* Transparansi Status */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-[var(--theme-text)] font-headline">Transparansi Status</h3>
            {dashboardData?.mentor ? (
              <div className="mt-4 rounded-2xl bg-[var(--theme-success)]/10 border border-[var(--theme-success)]/20 p-4 flex items-center gap-3 text-sm font-bold text-[var(--theme-success)]">
                <span className="material-symbols-outlined text-[var(--theme-success)]">supervised_user_circle</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-success)]">Dewan Pembimbing Aktif</p>
                  <p className="mt-0.5 leading-tight font-headline">{dashboardData.mentor.name}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-[var(--theme-warning)]/10 border border-[var(--theme-warning)]/20 p-4 flex items-center gap-3 text-sm font-bold text-[var(--theme-warning)]">
                <span className="material-symbols-outlined text-[var(--theme-warning)]">warning</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-warning)]">Dewan Pembimbing</p>
                  <p className="mt-0.5 leading-tight font-headline">Belum ada pembimbing aktif. Segera terima undangan DP.</p>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {blockers.length === 0 ? (
                <div className="rounded-2xl bg-[var(--theme-success)]/10 border border-[var(--theme-success)]/20 p-4 text-sm font-bold text-[var(--theme-success)] flex items-center gap-3">
                  <span className="material-symbols-outlined text-[var(--theme-success)] text-xl">check_circle</span>
                  <span className="leading-tight">Tidak ada penghalang kelulusan terdeteksi.</span>
                </div>
              ) : (
                blockers.map((b) => (
                  <div key={b} className="rounded-2xl bg-[var(--theme-error)]/10 border border-[var(--theme-error)]/20 p-4 text-sm font-bold text-[var(--theme-error)] flex items-start gap-3">
                    <span className="material-symbols-outlined text-[var(--theme-error)] text-xl mt-0.5">cancel</span>
                    <span className="leading-tight">{b}</span>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-subtle)] border-b border-border pb-2 font-headline">Pengumuman & Notifikasi</h4>
                {notifications.map((n, i) => (
                  <div key={i} className="rounded-2xl border border-border p-4 bg-[var(--theme-border-muted)]">
                    <p className="font-bold text-[var(--theme-text)] text-sm leading-tight font-headline">{n.title}</p>
                    <p className="text-[13px] font-medium text-[var(--theme-text-muted)] mt-1.5 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </KencanaShell>
  );
}

function Mini({ label, value, active }) {
  return (
    <div className={`rounded-xl px-3 py-2 text-center min-w-[64px] border ${active
      ? 'bg-[var(--theme-surface)] shadow-sm border-[var(--theme-primary)]/20'
      : 'bg-[var(--theme-border-muted)] border-border'
      }`}>
      <p className={`text-lg font-bold font-headline ${active ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text)]'}`}>{value || 0}</p>
      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mt-0.5">{label}</p>
    </div>
  );
}

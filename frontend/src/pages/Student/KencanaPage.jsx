import React from 'react';
import { Link } from 'react-router-dom';
import { useKencanaDashboardQuery, useKencanaTimelineQuery } from '../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, MetricCard, PrimaryButton, ProgressBar, StatusBadge, fmtDate } from './Kencana/components';
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
      title="Dashboard Kencana"
      subtitle="Pantau seluruh tahapan orientasi, pembinaan, nilai, remedial, dan sertifikat Kencana dari satu tempat."
    >
      {/* Overview Section */}
      <section className="overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-primary)] text-[var(--theme-text-on-primary)] shadow-xl mb-6">
        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_0.8fr] md:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--theme-muted-on-primary)]">{dashboardData?.period?.name || 'Kencana'}</p>
            <h2 className="mt-2 text-2xl font-black md:text-3xl font-headline">Status: {dashboardData?.graduation_status ? <span>{dashboardData.graduation_status.replaceAll('_', ' ')}</span> : 'Belum Mulai'}</h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[var(--theme-muted-on-primary)]">Tahap aktif: {dashboardData?.active_stage?.name || 'Menunggu jadwal admin'}. Timeline, sesi, quiz, dan tugas mengikuti data yang dipublish pengelola.</p>
            <div className="mt-5 max-w-xl">
              <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-widest text-[var(--theme-muted-on-primary)]"><span>Progress Total</span><span>{dashboardData?.progress_total || 0}%</span></div>
              <ProgressBar value={dashboardData?.progress_total || 0} />
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur flex flex-col justify-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--theme-muted-on-primary)] font-headline">Nilai Kencana University</p>
            <p className="mt-2 text-4xl font-black font-headline">{Number(dashboardData?.temporary_final_score || 0).toFixed(1)}</p>
            <div className="mt-3"><StatusBadge status={dashboardData?.graduation_status} /></div>
            <p className="mt-3 text-sm font-semibold text-[var(--theme-muted-on-primary)]">{dashboardData?.needs_remedial ? 'Ada komponen yang perlu diperbaiki.' : 'Tidak ada remedial aktif saat ini.'}</p>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid gap-4 md:grid-cols-4 mb-6">
        <MetricCard label="Periode" value={dashboardData?.period?.year || '-'} hint={dashboardData?.period?.name} icon="calendar_month" />
        <MetricCard label="Progress" value={`${dashboardData?.progress_total || 0}%`} hint="Sesi dan materi selesai" icon="trending_up" />
        <MetricCard label="Nilai Univ" value={Number(dashboardData?.temporary_final_score || 0).toFixed(1)} hint="Bobot 25/35/40" icon="grade" />
        <MetricCard label="Remedial" value={dashboardData?.needs_remedial ? 'Perlu' : 'Tidak'} hint="Berdasarkan status saat ini" icon="rule" />
      </section>

      {/* NEW: 5W1H Charts Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* WHAT → Komponen Nilai */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>grade</span>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Komponen Nilai</h3>
              <p className="text-[10px] text-slate-400">WHAT: Bobot penilaian</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Kehadiran', bobot: 25, color: 'bg-blue-400' },
              { name: 'Kuis', bobot: 35, color: 'bg-emerald-400' },
              { name: 'Tugas', bobot: 40, color: 'bg-violet-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 w-20">{item.name}</span>
                <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', item.color)} style={{width:`${item.bobot}%`}}/>
                </div>
                <span className="text-xs font-black text-slate-700 w-8 text-right">{item.bobot}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHEN → Tahapan Berikutnya */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>event</span>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tahap Aktif</h3>
              <p className="text-[10px] text-slate-400">WHEN: Tahapan saat ini</p>
            </div>
          </div>
          <div className="text-center py-4">
            <span className="text-2xl font-extrabold text-indigo-600">{dashboardData?.active_stage?.name || '-'}</span>
            <p className="text-xs text-slate-500 mt-2">
              {dashboardData?.active_stage ? `Batas: ${fmtDate(dashboardData.active_stage.end_date)}` : 'Menunggu jadwal'}
            </p>
          </div>
        </div>

        {/* HOW → Criteria Kelulusan */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Criteria</h3>
              <p className="text-[10px] text-slate-400">HOW: Syarat kelulusan</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
              <span className="text-xs font-medium text-emerald-700">Nilai Minimum</span>
              <span className="text-sm font-extrabold text-emerald-600">70.0</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
              <span className="text-xs font-medium text-blue-700">Remedial</span>
              <span className="text-sm font-extrabold text-blue-600">{dashboardData?.needs_remedial ? 'Perlu' : 'Tidak'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {/* Timeline Cards */}
          <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)]/85 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-[var(--theme-text)] font-headline">Timeline Tahapan Kencana</h3>
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
                    className={`group relative grid gap-4 rounded-2xl border ${stage.status === 'active' ? 'border-[var(--theme-primary)] bg-[var(--theme-primary-light)] shadow-md' : 'border-[var(--theme-border)] bg-[var(--theme-surface)]'} p-5 transition-all ${user?.role === 'super_admin' ? '' : 'hover:-translate-y-1 hover:shadow-lg'} md:grid-cols-[auto_1fr_auto]`}
                  >
                    {stage.status === 'active' && (
                      <div className="absolute -top-2 -right-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg animate-pulse">
                          <span className="material-symbols-outlined text-[12px]">bolt</span>
                        </span>
                      </div>
                    )}
                    <div className={`grid size-12 place-items-center rounded-xl ${stage.status === 'active' ? 'bg-[var(--theme-primary)] text-[var(--theme-text-on-primary)] shadow-md' : 'bg-[var(--theme-border-muted)] text-[var(--theme-text-muted)]'} text-lg font-black font-headline`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-base font-black font-headline ${stage.status === 'active' ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text)]'}`}>{stage.name}</h4>
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
                        <div className="rounded-xl bg-[var(--theme-primary-light)] px-4 py-2 flex items-center gap-2 border border-[var(--theme-primary)]/20">
                          <span className="material-symbols-outlined text-[var(--theme-primary)]">workspace_premium</span>
                          <span className="text-xs font-black text-[var(--theme-primary)] uppercase tracking-widest font-headline">Lihat Nilai</span>
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
                <div className="text-center py-10 rounded-2xl border-2 border-dashed border-[var(--theme-border)] bg-[var(--theme-border-muted)]">
                  <span className="material-symbols-outlined text-4xl text-[var(--theme-text-subtle)] mb-2">calendar_month</span>
                  <p className="text-[var(--theme-text-subtle)] font-bold font-headline">Timeline belum tersedia.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Menus */}
          {user?.role !== 'super_admin' && (
            <div className="grid gap-4 md:grid-cols-3">
              <Link to="/student/kencana/score" className="group rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 transition hover:bg-[var(--theme-border-muted)] hover:-translate-y-1 hover:shadow-sm">
                <div className="grid size-12 place-items-center rounded-xl bg-[var(--theme-warning)] text-white mb-4 shadow-sm">
                  <span className="material-symbols-outlined">workspace_premium</span>
                </div>
                <h4 className="font-black text-[var(--theme-text)] group-hover:text-[var(--theme-warning)] transition-colors font-headline">Pasca-Kencana</h4>
                <p className="text-[11px] font-semibold text-[var(--theme-text-muted)] mt-1">Rekap Nilai & Sertifikat</p>
              </Link>
              
              <Link to="/student/kencana/invitations" className="group rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 transition hover:bg-[var(--theme-border-muted)] hover:-translate-y-1 hover:shadow-sm">
                <div className="grid size-12 place-items-center rounded-xl bg-[var(--theme-primary)] text-[var(--theme-text-on-primary)] mb-4 shadow-sm">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <h4 className="font-black text-[var(--theme-text)] group-hover:text-[var(--theme-primary)] transition-colors font-headline">Undangan DP</h4>
                <p className="text-[11px] font-semibold text-[var(--theme-text-muted)] mt-1">Pembimbing Kencana</p>
              </Link>

              <Link to="/student/kencana/attendance" className="group rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 transition hover:bg-[var(--theme-border-muted)] hover:-translate-y-1 hover:shadow-sm">
                <div className="grid size-12 place-items-center rounded-xl bg-[var(--theme-info)] text-white mb-4 shadow-sm">
                  <span className="material-symbols-outlined">fact_check</span>
                </div>
                <h4 className="font-black text-[var(--theme-text)] group-hover:text-[var(--theme-info)] transition-colors font-headline">Log Presensi</h4>
                <p className="text-[11px] font-semibold text-[var(--theme-text-muted)] mt-1">Kehadiran tiap sesi</p>
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Last Activity */}
          {user?.role !== 'super_admin' && dashboardData?.last_activity?.id && (
            <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--theme-primary)]"></div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--theme-text-subtle)]">Aktivitas Terakhir</p>
              <h4 className="text-lg font-black text-[var(--theme-text)] mt-2 leading-tight font-headline">{dashboardData.last_activity.title}</h4>
              <div className="mt-4">
                <PrimaryButton to={`/student/kencana/session/${dashboardData.last_activity.id}`} className="w-full justify-center">
                  Lanjutkan Belajar <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* Transparansi Status */}
          <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-sm">
            <h3 className="text-xl font-black text-[var(--theme-text)] font-headline">Transparansi Status</h3>
            {dashboardData?.mentor ? (
              <div className="mt-4 rounded-2xl bg-[var(--theme-success-light)] border border-[var(--theme-success)]/20 p-4 flex items-center gap-3 text-sm font-bold text-[var(--theme-success)]">
                <span className="material-symbols-outlined text-[var(--theme-success)]">supervised_user_circle</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[var(--theme-success)]">Dewan Pembimbing Aktif</p>
                  <p className="mt-0.5 leading-tight font-headline">{dashboardData.mentor.name}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-[var(--theme-warning-light)] border border-[var(--theme-warning)]/20 p-4 flex items-center gap-3 text-sm font-bold text-[var(--theme-warning)]">
                <span className="material-symbols-outlined text-[var(--theme-warning)]">warning</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[var(--theme-warning)]">Dewan Pembimbing</p>
                  <p className="mt-0.5 leading-tight font-headline">Belum ada pembimbing aktif. Segera terima undangan DP.</p>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {blockers.length === 0 ? (
                <div className="rounded-2xl bg-[var(--theme-success-light)] border border-[var(--theme-success)]/20 p-4 text-sm font-bold text-[var(--theme-success)] flex items-center gap-3">
                  <span className="material-symbols-outlined text-[var(--theme-success)] text-xl">check_circle</span>
                  <span className="leading-tight">Tidak ada penghalang kelulusan terdeteksi.</span>
                </div>
              ) : (
                blockers.map((b) => (
                  <div key={b} className="rounded-2xl bg-[var(--theme-error-light)] border border-[var(--theme-error)]/20 p-4 text-sm font-bold text-[var(--theme-error)] flex items-start gap-3">
                    <span className="material-symbols-outlined text-[var(--theme-error)] text-xl mt-0.5">cancel</span>
                    <span className="leading-tight">{b}</span>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--theme-text-subtle)] border-b border-[var(--theme-border)] pb-2 font-headline">Pengumuman & Notifikasi</h4>
                {notifications.map((n, i) => (
                  <div key={i} className="rounded-2xl border border-[var(--theme-border)] p-4 bg-[var(--theme-border-muted)]">
                    <p className="font-black text-[var(--theme-text)] text-sm leading-tight font-headline">{n.title}</p>
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
    <div className={`rounded-xl px-3 py-2 text-center min-w-[64px] border ${
      active 
        ? 'bg-[var(--theme-surface)] shadow-sm border-[var(--theme-primary)]/20' 
        : 'bg-[var(--theme-border-muted)] border-[var(--theme-border)]'
    }`}>
      <p className={`text-lg font-black font-headline ${active ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text)]'}`}>{value || 0}</p>
      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--theme-text-muted)] mt-0.5">{label}</p>
    </div>
  );
}
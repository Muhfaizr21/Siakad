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
      <section className="overflow-hidden rounded-[2rem] border border-blue-200 bg-blue-700 text-white shadow-xl mb-6">
        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_0.8fr] md:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">{dashboardData?.period?.name || 'Kencana'}</p>
            <h2 className="mt-2 text-2xl font-black md:text-3xl">Status: {dashboardData?.graduation_status ? <span>{dashboardData.graduation_status.replaceAll('_', ' ')}</span> : 'Belum Mulai'}</h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-blue-100">Tahap aktif: {dashboardData?.active_stage?.name || 'Menunggu jadwal admin'}. Timeline, sesi, quiz, dan tugas mengikuti data yang dipublish pengelola.</p>
            <div className="mt-5 max-w-xl">
              <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-widest text-blue-100"><span>Progress Total</span><span>{dashboardData?.progress_total || 0}%</span></div>
              <ProgressBar value={dashboardData?.progress_total || 0} />
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur flex flex-col justify-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-200">Nilai Kencana University</p>
            <p className="mt-2 text-4xl font-black">{Number(dashboardData?.temporary_final_score || 0).toFixed(1)}</p>
            <div className="mt-3"><StatusBadge status={dashboardData?.graduation_status} /></div>
            <p className="mt-3 text-sm font-semibold text-blue-100">{dashboardData?.needs_remedial ? 'Ada komponen yang perlu diperbaiki.' : 'Tidak ada remedial aktif saat ini.'}</p>
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
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-800">Timeline Tahapan Kencana</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Pilih tahapan untuk melihat sesi, materi, tugas, dan kuis.</p>
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
                    className={`group relative grid gap-4 rounded-2xl border ${stage.status === 'active' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 bg-white'} p-5 transition-all ${user?.role === 'super_admin' ? '' : 'hover:-translate-y-1 hover:shadow-lg'} md:grid-cols-[auto_1fr_auto]`}
                  >
                    {stage.status === 'active' && (
                      <div className="absolute -top-2 -right-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg animate-pulse">
                          <span className="material-symbols-outlined text-[12px]">bolt</span>
                        </span>
                      </div>
                    )}
                    <div className={`grid size-12 place-items-center rounded-xl ${stage.status === 'active' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'} text-lg font-black`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-base font-black ${stage.status === 'active' ? 'text-blue-700' : 'text-slate-800'}`}>{stage.name}</h4>
                        <StatusBadge status={stage.status} />
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-500 line-clamp-2">{stage.description}</p>
                      {stage.phase_type !== 'pasca_kencana' && (
                        <p className="mt-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span> 
                          {fmtDate(stage.start_date)} - {fmtDate(stage.end_date)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 self-center border-t border-slate-100 pt-4 md:border-t-0 md:pt-0">
                      {stage.phase_type === 'pasca_kencana' ? (
                        <div className="rounded-xl bg-blue-50 px-4 py-2 flex items-center gap-2 border border-blue-100">
                          <span className="material-symbols-outlined text-blue-600">workspace_premium</span>
                          <span className="text-xs font-black text-blue-800 uppercase tracking-widest">Lihat Nilai</span>
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
                <div className="text-center py-10 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">calendar_month</span>
                  <p className="text-slate-400 font-bold">Timeline belum tersedia.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Menus */}
          {user?.role !== 'super_admin' && (
            <div className="grid gap-4 md:grid-cols-3">
              <Link to="/student/kencana/score" className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:bg-slate-50 hover:-translate-y-1 hover:shadow-sm">
                <div className="grid size-12 place-items-center rounded-xl bg-amber-500 text-white mb-4">
                  <span className="material-symbols-outlined">workspace_premium</span>
                </div>
                <h4 className="font-black text-slate-800 group-hover:text-amber-600 transition-colors">Pasca-Kencana</h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-1">Rekap Nilai & Sertifikat</p>
              </Link>
              
              <Link to="/student/kencana/invitations" className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:bg-blue-50 hover:-translate-y-1 hover:shadow-sm">
                <div className="grid size-12 place-items-center rounded-xl bg-blue-600 text-white mb-4">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <h4 className="font-black text-slate-800 group-hover:text-blue-700 transition-colors">Undangan DP</h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-1">Pembimbing Kencana</p>
              </Link>

              <Link to="/student/kencana/attendance" className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:bg-blue-50 hover:-translate-y-1 hover:shadow-sm">
                <div className="grid size-12 place-items-center rounded-xl bg-indigo-600 text-white mb-4">
                  <span className="material-symbols-outlined">fact_check</span>
                </div>
                <h4 className="font-black text-slate-800 group-hover:text-indigo-700 transition-colors">Log Presensi</h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-1">Kehadiran tiap sesi</p>
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Last Activity */}
          {user?.role !== 'super_admin' && dashboardData?.last_activity?.id && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Aktivitas Terakhir</p>
              <h4 className="text-lg font-black text-slate-800 mt-2 leading-tight">{dashboardData.last_activity.title}</h4>
              <div className="mt-4">
                <PrimaryButton to={`/student/kencana/session/${dashboardData.last_activity.id}`} className="w-full justify-center">
                  Lanjutkan Belajar <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* Transparansi Status */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-800">Transparansi Status</h3>
            {dashboardData?.mentor ? (
              <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-center gap-3 text-sm font-bold text-emerald-800">
                <span className="material-symbols-outlined text-emerald-600">supervised_user_circle</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Dewan Pembimbing Aktif</p>
                  <p className="mt-0.5 leading-tight">{dashboardData.mentor.name}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-100 p-4 flex items-center gap-3 text-sm font-bold text-amber-800">
                <span className="material-symbols-outlined text-amber-600">warning</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">Dewan Pembimbing</p>
                  <p className="mt-0.5 leading-tight">Belum ada pembimbing aktif. Segera terima undangan DP.</p>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {blockers.length === 0 ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm font-bold text-emerald-700 flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                  <span className="leading-tight">Tidak ada penghalang kelulusan terdeteksi.</span>
                </div>
              ) : (
                blockers.map((b) => (
                  <div key={b} className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm font-bold text-rose-800 flex items-start gap-3">
                    <span className="material-symbols-outlined text-rose-600 text-xl mt-0.5">cancel</span>
                    <span className="leading-tight">{b}</span>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-2">Pengumuman & Notifikasi</h4>
                {notifications.map((n, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                    <p className="font-black text-slate-800 text-sm leading-tight">{n.title}</p>
                    <p className="text-[13px] font-medium text-slate-500 mt-1.5 leading-relaxed">{n.message}</p>
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
    <div className={`rounded-xl px-3 py-2 text-center min-w-[64px] ${active ? 'bg-white shadow-sm border border-[#0f4c5c]/10' : 'bg-[#f7f1e5]'}`}>
      <p className={`text-lg font-black ${active ? 'text-[#0f4c5c]' : 'text-[#1d1b16]'}`}>{value || 0}</p>
      <p className="text-[9px] font-black uppercase tracking-widest text-[#9b8f7a] mt-0.5">{label}</p>
    </div>
  );
}
import React from 'react';
import { useKencanaAttendanceQuery, useKencanaDashboardQuery } from '../../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, ProgressBar, StatusBadge, fmtTime, fmtLongDate, isToday } from './components';
import { PrimaryStatsCard } from '@/components/ui/StatsCard';

export default function KencanaAttendancePage() {
  const { data, isLoading, isError } = useKencanaAttendanceQuery();
  const { data: dashboardData } = useKencanaDashboardQuery();

  if (isLoading) return <KencanaShell title="Log Presensi" highlightedTitle="Kencana" breadcrumbs={[{ label: 'Kehadiran' }]}><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Log Presensi" highlightedTitle="Kencana" breadcrumbs={[{ label: 'Kehadiran' }]}><ErrorPanel message="Gagal memuat kehadiran." /></KencanaShell>;

  const summary = data?.summary || {};
  const details = data?.details || [];

  return (
    <KencanaShell 
      title="Log Presensi" 
      highlightedTitle="Kencana"
      subtitle="Kehadiran wajib 100% pada sesi yang diaktifkan sebagai syarat kelulusan penuh Kencana."
      breadcrumbs={[{ label: 'Kehadiran' }]}
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
      <section className="grid gap-4 md:grid-cols-3 mb-6">
        <PrimaryStatsCard
          title="Sesi Wajib"
          value={summary.required_sessions || 0}
          badgeText="Total"
          icon={({ size }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>event</span>}
          colorTheme="primary"
        />
        <PrimaryStatsCard
          title="Dihadiri"
          value={summary.attended_sessions || 0}
          badgeText="Presensi"
          icon={({ size }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>how_to_reg</span>}
          colorTheme="success"
        />
        <PrimaryStatsCard
          title="Persentase"
          value={`${summary.percentage || 0}%`}
          badgeText="Kehadiran"
          icon={({ size }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>percent</span>}
          colorTheme={summary.percentage >= 100 ? "success" : "warning"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2 items-start mb-6">
        <section className="glass-card p-6 group hover:shadow-md transition-all duration-300 h-full">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50/80 rounded-xl flex justify-center items-center text-blue-600 group-hover:scale-110 transition-all duration-300">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest block mb-0.5">Penilaian</span>
                <h3 className="text-sm font-bold text-[var(--theme-text)] leading-tight">Status Kehadiran</h3>
              </div>
            </div>
            <StatusBadge status={summary.percentage >= 100 ? 'completed' : 'not_eligible'} />
          </div>
          <div className="mt-5"><ProgressBar value={summary.percentage || 0} /></div>
          <p className="mt-4 text-sm font-medium text-[var(--theme-text-muted)]">
            {summary.percentage >= 100 
              ? 'Selamat! Persyaratan kehadiran Anda sudah terpenuhi sepenuhnya.' 
              : 'Harap menghadiri seluruh sesi wajib yang tersisa.'}
          </p>
        </section>

        <section className="glass-card p-6 group hover:shadow-md transition-all duration-300 h-full">
          <div className="flex items-center gap-4 mb-6 border-b border-[var(--theme-border-muted)] pb-4">
            <div className="w-12 h-12 bg-indigo-50/80 rounded-xl flex justify-center items-center text-indigo-600 group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-[24px]">list_alt</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest block mb-0.5">Rincian</span>
              <h3 className="text-sm font-bold text-[var(--theme-text)] leading-tight">Riwayat Kehadiran Sesi</h3>
            </div>
          </div>
          {details.length === 0 ? (
            <p className="text-sm font-bold text-[var(--theme-text-subtle)] p-6 text-center border border-dashed border-[var(--theme-border-muted)] rounded-2xl bg-[var(--theme-surface)]/50">
              Belum ada sesi wajib yang dijadwalkan.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--theme-border-muted)]">
              <table className="w-full text-left border-collapse min-w-[500px] bg-[var(--theme-surface)]">
                <thead>
                  <tr className="border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)] text-[10px] font-black uppercase tracking-wider text-[var(--theme-text-muted)]">
                    <th className="py-4 px-5">Sesi Kencana</th>
                    <th className="py-4 px-5">Tanggal Sesi</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Waktu Presensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--theme-border-muted)] text-sm">
                  {details.map((item) => (
                    <tr key={item.session_id} className="hover:bg-[var(--theme-bg)] transition-colors group">
                      <td className="py-4 px-5 font-bold text-[var(--theme-text)]">
                        <div className="flex items-center gap-2">
                          <span>{item.title}</span>
                          {isToday(item.start_date) && (
                            <span className="inline-flex items-center rounded-lg bg-[var(--theme-warning)]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--theme-warning)] border border-[var(--theme-warning)]/20">
                              Hari Ini
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 font-semibold text-[var(--theme-text-muted)]">
                        {fmtLongDate(item.start_date)}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border ${
                          item.status === 'present' 
                            ? 'bg-[var(--theme-success)]/10 text-[var(--theme-success)] border-[var(--theme-success)]/20' 
                            : 'bg-[var(--theme-error)]/10 text-[var(--theme-error)] border-[var(--theme-error)]/20'
                        }`}>
                          {item.status === 'present' ? 'Hadir' : 'Tidak Hadir'}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-[var(--theme-text)]">
                        {item.status === 'present' && item.checked_at ? (
                          <div className="flex items-center gap-1.5 text-[var(--theme-success)]">
                            <span className="material-symbols-outlined text-base">schedule</span>
                            {fmtTime(item.checked_at)}
                          </div>
                        ) : (
                          <span className="text-[var(--theme-text-subtle)] font-bold">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </KencanaShell>
  );
}

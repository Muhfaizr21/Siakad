import React from 'react';
import { useKencanaAttendanceQuery } from '../../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, MetricCard, ProgressBar, StatusBadge } from './components';

export default function KencanaAttendancePage() {
  const { data, isLoading, isError } = useKencanaAttendanceQuery();
  if (isLoading) return <KencanaShell title="Kehadiran"><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Kehadiran"><ErrorPanel message="Gagal memuat kehadiran." /></KencanaShell>;
  return (
    <KencanaShell title="Kehadiran Kencana" subtitle="Kehadiran wajib 100% sebagai syarat lulus penuh.">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Sesi Wajib" value={data?.required_sessions || 0} icon="event" />
        <MetricCard label="Dihadiri" value={data?.attended_sessions || 0} icon="how_to_reg" />
        <MetricCard label="Persentase" value={`${data?.percentage || 0}%`} icon="percent" />
      </section>
      <section className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Status Kehadiran</h2><StatusBadge status={(data?.percentage || 0) >= 100 ? 'completed' : 'not_eligible'} /></div>
        <div className="mt-5"><ProgressBar value={data?.percentage || 0} /></div>
        <p className="mt-4 text-sm font-semibold text-[#756b5a]">{data?.status || 'Belum Lengkap'}</p>
      </section>
    </KencanaShell>
  );
}

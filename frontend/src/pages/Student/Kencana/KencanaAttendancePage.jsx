import React from 'react';
import { useKencanaAttendanceQuery } from '../../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, MetricCard, ProgressBar, StatusBadge, fmtTime, fmtLongDate, isToday } from './components';

export default function KencanaAttendancePage() {
  const { data, isLoading, isError } = useKencanaAttendanceQuery();

  if (isLoading) return <KencanaShell title="Kehadiran Kencana" breadcrumbs={[{ label: 'Kehadiran' }]}><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Kehadiran Kencana" breadcrumbs={[{ label: 'Kehadiran' }]}><ErrorPanel message="Gagal memuat kehadiran." /></KencanaShell>;

  const summary = data?.summary || {};
  const details = data?.details || [];

  return (
    <KencanaShell 
      title="Kehadiran Kencana" 
      subtitle="Kehadiran wajib 100% pada sesi yang diaktifkan sebagai syarat kelulusan penuh Kencana."
      breadcrumbs={[{ label: 'Kehadiran' }]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Sesi Wajib" value={summary.required_sessions || 0} icon="event" />
        <MetricCard label="Dihadiri" value={summary.attended_sessions || 0} icon="how_to_reg" />
        <MetricCard label="Persentase" value={`${summary.percentage || 0}%`} icon="percent" />
      </section>

      <section className="rounded-2xl border border-border bg-white/85 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black text-[#1d1b16]">Status Kehadiran</h2>
          <StatusBadge status={summary.percentage >= 100 ? 'completed' : 'not_eligible'} />
        </div>
        <div className="mt-5"><ProgressBar value={summary.percentage || 0} /></div>
        <p className="mt-4 text-sm font-semibold text-[#756b5a]">
          {summary.percentage >= 100 
            ? 'Selamat! Persyaratan kehadiran Anda sudah terpenuhi sepenuhnya.' 
            : 'Harap menghadiri seluruh sesi wajib yang tersisa.'}
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-white/85 p-6 shadow-sm">
        <h2 className="text-xl font-black text-[#1d1b16] mb-4">Riwayat Kehadiran Sesi</h2>
        {details.length === 0 ? (
          <p className="text-sm font-bold text-[#756b5a] p-4 text-center border border-dashed border-border rounded-2xl bg-[#fffaf0]">
            Belum ada sesi wajib yang dijadwalkan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-xs font-black uppercase tracking-wider text-[#9b8f7a]">
                  <th className="py-3 px-4">Sesi Kencana</th>
                  <th className="py-3 px-4">Tanggal Sesi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Waktu Presensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8dfcf] text-sm">
                {details.map((item) => (
                  <tr key={item.session_id} className="hover:bg-[#fffaf0]/40 transition-colors">
                    <td className="py-4 px-4 font-black text-[#1d1b16]">
                      <div className="flex items-center gap-2">
                        <span>{item.title}</span>
                        {isToday(item.start_date) && (
                          <span className="inline-flex items-center rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-800 ring-1 ring-inset ring-amber-600/20">
                            Hari Ini
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#6f6759]">
                      {fmtLongDate(item.start_date)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                        item.status === 'present' 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-100 text-rose-700 border-rose-200'
                      }`}>
                        {item.status === 'present' ? 'Hadir' : 'Tidak Hadir'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black text-[#1d1b16]">
                      {item.status === 'present' && item.checked_at ? (
                        <div className="flex items-center gap-1.5 text-emerald-700">
                          <span className="material-symbols-outlined text-base">schedule</span>
                          {fmtTime(item.checked_at)}
                        </div>
                      ) : (
                        <span className="text-[#8d826d] font-bold">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </KencanaShell>
  );
}

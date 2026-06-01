import React from 'react';
import { Link } from 'react-router-dom';
import { useKencanaDashboardQuery } from '../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, MetricCard, PrimaryButton, ProgressBar, StatusBadge } from './Kencana/components';

export default function KencanaPage() {
  const { data, isLoading, isError } = useKencanaDashboardQuery();

  if (isLoading) return <KencanaShell title="Dashboard Kencana"><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Dashboard Kencana"><ErrorPanel message="Gagal memuat dashboard Kencana." /></KencanaShell>;

  const blockers = data?.blockers || [];
  const notifications = data?.notifications || [];

  return (
    <KencanaShell
      title="Dashboard Kencana"
      subtitle="Pantau seluruh tahapan orientasi, pembinaan, nilai, remedial, dan sertifikat Kencana dari satu tempat."
      actions={<PrimaryButton to="/student/kencana/timeline">Lihat Timeline <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span></PrimaryButton>}
    >
      <section className="overflow-hidden rounded-[2rem] border border-[#d8c9ad] bg-[#1d1b16] text-white shadow-xl">
        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_0.8fr] md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#d8a84f]">{data?.period?.name || 'Kencana'}</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">Status: {data?.graduation_status ? <span>{data.graduation_status.replaceAll('_', ' ')}</span> : 'Belum Mulai'}</h2>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-[#e8dfcf]">Tahap aktif: {data?.active_stage?.name || 'Menunggu jadwal admin'}. Timeline, sesi, quiz, dan tugas mengikuti data yang dipublish pengelola.</p>
            <div className="mt-6 max-w-xl">
              <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-widest text-[#e8dfcf]"><span>Progress Total</span><span>{data?.progress_total || 0}%</span></div>
              <ProgressBar value={data?.progress_total || 0} />
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d8a84f]">Nilai Akhir Sementara</p>
            <p className="mt-3 text-6xl font-black">{Number(data?.temporary_final_score || 0).toFixed(1)}</p>
            <div className="mt-4"><StatusBadge status={data?.graduation_status} /></div>
            <p className="mt-4 text-sm font-semibold text-[#e8dfcf]">{data?.needs_remedial ? 'Ada komponen yang perlu diperbaiki.' : 'Tidak ada remedial aktif saat ini.'}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Periode" value={data?.period?.year || '-'} hint={data?.period?.name} icon="calendar_month" />
        <MetricCard label="Progress" value={`${data?.progress_total || 0}%`} hint="Sesi dan materi selesai" icon="trending_up" />
        <MetricCard label="Nilai" value={Number(data?.temporary_final_score || 0).toFixed(1)} hint="Bobot 25/35/40" icon="grade" />
        <MetricCard label="Remedial" value={data?.needs_remedial ? 'Perlu' : 'Tidak'} hint="Berdasarkan status saat ini" icon="rule" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
          <h3 className="text-xl font-black">Lanjutkan Kegiatan</h3>
          {data?.last_activity?.id ? (
            <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-[#f7f1e5] p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#9b8f7a]">Aktivitas Terakhir</p>
                <p className="mt-1 text-lg font-black">{data.last_activity.title}</p>
              </div>
              <PrimaryButton to={`/student/kencana/session/${data.last_activity.id}`}>Buka Sesi</PrimaryButton>
            </div>
          ) : (
            <p className="mt-4 text-sm font-semibold text-[#756b5a]">Belum ada sesi aktif. Cek timeline untuk melihat jadwal yang dipublish admin.</p>
          )}
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <Link className="rounded-2xl border border-[#0f4c5c] bg-[#0f4c5c] p-4 text-sm font-black text-white hover:bg-[#123f4b]" to="/student/kencana/invitations">Terima Undangan DP</Link>
            <Link className="rounded-2xl border border-[#e8dfcf] p-4 text-sm font-black hover:bg-[#f7f1e5]" to="/student/kencana/handbook">Handbook</Link>
            <Link className="rounded-2xl border border-[#e8dfcf] p-4 text-sm font-black hover:bg-[#f7f1e5]" to="/student/kencana/attendance">Kehadiran</Link>
            <Link className="rounded-2xl border border-[#e8dfcf] p-4 text-sm font-black hover:bg-[#f7f1e5]" to="/student/kencana/score">Nilai</Link>
          </div>
        </div>

        <div className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
          <h3 className="text-xl font-black">Transparansi Status</h3>
          {data?.mentor && <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">Dewan Pembimbing aktif: {data.mentor.name}</div>}
          <div className="mt-4 space-y-3">
            {blockers.length === 0 ? <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">Tidak ada penghalang kelulusan terdeteksi.</p> : blockers.map((b) => <p key={b} className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">{b}</p>)}
          </div>
          <div className="mt-5 space-y-3">
            {notifications.map((n, i) => <div key={i} className="rounded-2xl border border-[#e8dfcf] p-4"><p className="font-black">{n.title}</p><p className="text-sm font-medium text-[#756b5a]">{n.message}</p></div>)}
          </div>
        </div>
      </section>
    </KencanaShell>
  );
}

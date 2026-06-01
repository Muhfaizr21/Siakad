import React from 'react';
import { Link } from 'react-router-dom';
import { useKencanaTimelineQuery } from '../../../queries/useKencanaQuery';
import { ErrorPanel, fmtDate, KencanaShell, LoadingPanel, ProgressBar, StatusBadge } from './components';

export default function KencanaTimelinePage() {
  const { data, isLoading, isError } = useKencanaTimelineQuery();
  if (isLoading) return <KencanaShell title="Timeline Kencana"><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Timeline Kencana"><ErrorPanel message="Gagal memuat timeline." /></KencanaShell>;
  const stages = data?.stages || [];
  return (
    <KencanaShell title="Timeline Kencana" subtitle="Tahapan berasal dari jadwal yang dibuat dan dipublish admin, tanpa durasi hardcode.">
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <Link key={stage.id} to={`/student/kencana/stage/${stage.id}`} className="group grid gap-4 rounded-3xl border border-[#e8dfcf] bg-white/85 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[80px_1fr_auto]">
            <div className="grid size-16 place-items-center rounded-3xl bg-[#0f4c5c] text-xl font-black text-white">{index + 1}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black">{stage.name}</h2><StatusBadge status={stage.status} /></div>
              <p className="mt-2 text-sm font-medium text-[#756b5a]">{stage.description}</p>
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-[#9b8f7a]">{fmtDate(stage.start_date)} - {fmtDate(stage.end_date)}</p>
              <div className="mt-4 max-w-md"><ProgressBar value={stage.progress || 0} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center md:w-72">
              <Mini label="Sesi" value={stage.session_count} />
              <Mini label="Quiz" value={stage.quiz_count} />
              <Mini label="Tugas" value={stage.assignment_count} />
            </div>
          </Link>
        ))}
      </div>
    </KencanaShell>
  );
}

function Mini({ label, value }) {
  return <div className="rounded-2xl bg-[#f7f1e5] p-3"><p className="text-lg font-black">{value || 0}</p><p className="text-[10px] font-black uppercase tracking-widest text-[#9b8f7a]">{label}</p></div>;
}

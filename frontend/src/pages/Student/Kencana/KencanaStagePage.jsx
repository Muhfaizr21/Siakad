import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useKencanaStageQuery } from '../../../queries/useKencanaQuery';
import { ErrorPanel, fmtDate, KencanaShell, LoadingPanel, ProgressBar, StatusBadge } from './components';

export default function KencanaStagePage() {
  const { stageId } = useParams();
  const { data, isLoading, isError } = useKencanaStageQuery(stageId);
  if (isLoading) return <KencanaShell title="Detail Tahap"><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Detail Tahap"><ErrorPanel message="Tahap tidak ditemukan atau belum dibuka." /></KencanaShell>;
  return (
    <KencanaShell title={data?.name || 'Detail Tahap'} subtitle={data?.description}>
      <section className="grid gap-4 md:grid-cols-4">
        <Info label="Status" value={<StatusBadge status={data?.status} />} />
        <Info label="Tanggal Mulai" value={fmtDate(data?.start_date)} />
        <Info label="Tanggal Selesai" value={fmtDate(data?.end_date)} />
        <Info label="Progress" value={`${data?.progress || 0}%`} />
      </section>
      <section className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
        <h2 className="text-2xl font-black">Daftar Sesi</h2>
        <div className="mt-5 grid gap-4">
          {(data?.sessions || []).map((session) => (
            <Link key={session.id} to={`/student/kencana/session/${session.id}`} className="rounded-3xl border border-[#e8dfcf] bg-[#fffaf0] p-5 transition hover:bg-[#f7f1e5]">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{session.title}</h3><StatusBadge status={session.status} /></div>
                  <p className="mt-2 text-sm font-medium text-[#756b5a]">{session.description}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-widest text-[#9b8f7a]">Deadline: {fmtDate(session.deadline)}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 md:w-64">
                  <Mini label="Materi" value={session.material_count} />
                  <Mini label="Quiz" value={session.quiz_count} />
                  <Mini label="Tugas" value={session.assignment_count} />
                </div>
              </div>
              <div className="mt-4"><ProgressBar value={session.progress || 0} /></div>
            </Link>
          ))}
        </div>
      </section>
    </KencanaShell>
  );
}

function Info({ label, value }) { return <div className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-5"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#9b8f7a]">{label}</p><div className="mt-2 text-xl font-black">{value}</div></div>; }
function Mini({ label, value }) { return <div className="rounded-2xl bg-white p-3 text-center"><p className="font-black">{value || 0}</p><p className="text-[9px] font-black uppercase tracking-widest text-[#9b8f7a]">{label}</p></div>; }

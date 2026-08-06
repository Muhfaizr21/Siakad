import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useKencanaStageQuery } from '../../../queries/useKencanaQuery';
import { ErrorPanel, fmtDate, KencanaShell, LoadingPanel, ProgressBar, StatusBadge } from './components';

export default function KencanaStagePage() {
  const { stageId } = useParams();
  const { data, isLoading, isError } = useKencanaStageQuery(stageId);
  if (isLoading) return <KencanaShell title="Detail Tahap" breadcrumbs={[{ label: 'Dashboard', to: '/student/kencana' }, { label: 'Detail Tahap' }]}><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Detail Tahap" breadcrumbs={[{ label: 'Dashboard', to: '/student/kencana' }, { label: 'Detail Tahap' }]}><ErrorPanel message="Tahap tidak ditemukan atau belum dibuka." /></KencanaShell>;
  return (
    <KencanaShell title={data?.name || 'Detail Tahap'} subtitle={data?.description} breadcrumbs={[{ label: 'Dashboard', to: '/student/kencana' }, { label: data?.name || 'Detail Tahap' }]}>
      <section className="grid gap-4 md:grid-cols-4">
        <Info label="Status" value={<StatusBadge status={data?.status} />} />
        <Info label="Tanggal Mulai" value={fmtDate(data?.start_date)} />
        <Info label="Tanggal Selesai" value={fmtDate(data?.end_date)} />
        <Info label="Progress" value={`${data?.progress || 0}%`} />
      </section>
      
      {(data?.group || data?.mentor) && (
        <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Kelompok</p>
              <h3 className="mt-1 text-xl font-black text-emerald-900">Kelompok {data.group?.number || '-'} - {data.group?.name || '-'} <span className="text-sm font-bold text-emerald-700">({data.group?.code || '-'})</span></h3>
            </div>
            {data.mentor && (
              <div className="md:text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Dewan Pembimbing</p>
                <h3 className="mt-1 text-lg font-black text-emerald-900">{data.mentor.name}</h3>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm mt-6">
        <h2 className="text-xl font-black text-slate-800">Daftar Sesi</h2>
        <div className="mt-5 grid gap-4">
          {(data?.sessions || []).map((session) => (
            <Link key={session.id} to={`/student/kencana/session/${session.id}`} className="rounded-2xl border border-border bg-slate-50 p-5 transition hover:bg-blue-50 hover:border-blue-200">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-slate-800">{session.title}</h3><StatusBadge status={session.status} /></div>
                  <p className="mt-2 text-sm font-medium text-slate-500">{session.description}</p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Deadline: {fmtDate(session.deadline)}</p>
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
          {(!data?.sessions || data.sessions.length === 0) && (
            <div className="text-center py-10 rounded-2xl border-2 border-dashed border-border bg-slate-50">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inbox</span>
              <p className="text-slate-400 font-bold">Belum ada sesi pada tahap ini.</p>
            </div>
          )}
        </div>
      </section>
    </KencanaShell>
  );
}

function Info({ label, value }) { return <div className="rounded-2xl border border-border bg-surface p-5"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p><div className="mt-2 text-lg font-black text-slate-800">{value}</div></div>; }
function Mini({ label, value }) { return <div className="rounded-2xl bg-surface border border-slate-100 p-3 text-center"><p className="font-black text-slate-800">{value || 0}</p><p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p></div>; }

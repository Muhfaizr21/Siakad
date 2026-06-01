import React from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCompleteMaterialMutation, useKencanaSessionQuery } from '../../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, PrimaryButton, StatusBadge } from './components';

export default function KencanaSessionPage() {
  const { sessionId } = useParams();
  const { data, isLoading, isError } = useKencanaSessionQuery(sessionId);
  const completeMaterial = useCompleteMaterialMutation();
  if (isLoading) return <KencanaShell title="Detail Sesi"><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Detail Sesi"><ErrorPanel message="Sesi tidak ditemukan atau terkunci." /></KencanaShell>;
  
  // Periksa apakah masih ada quiz di sesi ini yang belum dikerjakan (attempts_used === 0)
  const hasPendingQuizzes = (data?.quizzes || []).some(q => q.attempts_used === 0);

  return (
    <KencanaShell title={data?.title || 'Detail Sesi'} subtitle={data?.description}>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
          <h2 className="text-2xl font-black">Materi</h2>
          <div className="mt-5 space-y-4">
            {(data?.materials || []).map((m) => (
              <article key={m.id} className="rounded-3xl bg-[#fffaf0] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{m.title}</h3><StatusBadge status={m.status === 'completed' ? 'completed' : 'not_started'} /></div>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-[#756b5a]">{m.content || m.file_url || 'Materi belum memiliki konten.'}</p>
                    {m.file_url && <a className="mt-3 inline-block text-sm font-black text-[#0f4c5c]" href={m.file_url} target="_blank" rel="noreferrer">Buka Lampiran</a>}
                  </div>
                  {m.status !== 'completed' && (
                    <div className="flex flex-col items-end gap-1">
                      <button 
                        onClick={() => completeMaterial.mutate(m.id, { onSuccess: () => toast.success('Materi selesai') })} 
                        disabled={hasPendingQuizzes}
                        className={`rounded-2xl px-4 py-2 text-sm font-black text-white transition-all ${hasPendingQuizzes ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#0f4c5c] hover:bg-[#0b3a47]'}`}
                      >
                        Tandai Selesai
                      </button>
                      {hasPendingQuizzes && (
                        <span className="text-[10px] font-bold text-rose-500">Kerjakan Kuis Terlebih Dahulu</span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
            {!(data?.materials || []).length && <Empty label="Belum ada materi" desc="Materi akan tampil di sini setelah admin menambahkannya." />}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
            <h2 className="text-2xl font-black">Quiz</h2>
            <div className="mt-5 space-y-3">
              {(data?.quizzes || []).map((q) => (
                <div key={q.id} className="rounded-2xl bg-[#f7f1e5] p-4">
                  <p className="font-black">{q.title}</p>
                  <p className="text-xs font-semibold text-[#756b5a]">Durasi {q.duration_minutes} menit · Percobaan {q.attempts_used}/{q.max_attempts}</p>
                  <PrimaryButton to={`/student/kencana/quiz/${q.id}`}>Mulai Quiz</PrimaryButton>
                </div>
              ))}
              {!(data?.quizzes || []).length && <Empty label="Belum ada quiz" desc="Quiz belum tersedia untuk sesi ini." />}
            </div>
          </section>
          <section className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
            <h2 className="text-2xl font-black">Tugas</h2>
            <div className="mt-5 space-y-3">
              {(data?.assignments || []).map((a) => (
                <Link key={a.id} to={`/student/kencana/assignment/${a.id}`} className="block rounded-2xl bg-[#f7f1e5] p-4 hover:bg-[#efe2c8]">
                  <div className="flex items-center justify-between gap-2"><p className="font-black">{a.title}</p><StatusBadge status={a.submission_status || 'not_started'} /></div>
                  <p className="mt-1 text-xs font-semibold text-[#756b5a]">Tipe: {a.submission_type}</p>
                </Link>
              ))}
              {!(data?.assignments || []).length && <Empty label="Belum ada tugas" desc="Tugas belum tersedia untuk sesi ini." />}
            </div>
          </section>
        </aside>
      </div>
    </KencanaShell>
  );
}

function Empty({ label, desc }) {
  return <div className="rounded-2xl border border-dashed border-[#d8c9ad] bg-[#fffaf0] p-5 text-sm font-bold text-[#756b5a]"><p className="text-[#1d1b16]">{label}</p><p className="mt-1 font-medium">{desc}</p></div>;
}

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useKencanaQuizQuery, useStartQuizMutation, useSubmitQuizMutation } from '../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, PrimaryButton, StatusBadge } from './Kencana/components';

export default function KencanaKuisPage() {
  const { kuisId, quizId } = useParams();
  const id = quizId || kuisId;
  const navigate = useNavigate();
  const { data, isLoading, isError } = useKencanaQuizQuery(id);
  const startQuiz = useStartQuizMutation();
  const submitQuiz = useSubmitQuizMutation();
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [result, setResult] = useState(null);

  const questions = data?.questions || [];
  const flatAnswers = useMemo(() => Object.entries(answers).map(([questionId, selectedOptionId]) => ({ question_id: Number(questionId), selected_option_id: Number(selectedOptionId) })), [answers]);

  useEffect(() => {
    if (!attempt || timeLeft === null || result) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [attempt, timeLeft, result]);

  const handleStart = () => {
    startQuiz.mutate(id, {
      onSuccess: (res) => {
        setAttempt(res);
        setTimeLeft((data?.duration_minutes || 30) * 60);
        toast.success('Quiz dimulai');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Gagal memulai quiz'),
    });
  };

  const handleSubmit = () => {
    if (!attempt) return;
    submitQuiz.mutate({ attemptId: attempt.id || attempt.ID, answers: flatAnswers }, {
      onSuccess: setResult,
      onError: (err) => toast.error(err.response?.data?.message || 'Gagal submit quiz'),
    });
  };

  const fmt = (s) => `${String(Math.floor((s || 0) / 60)).padStart(2, '0')}:${String((s || 0) % 60).padStart(2, '0')}`;

  if (isLoading) return <KencanaShell title="Quiz Kencana"><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Quiz Kencana"><ErrorPanel message="Quiz tidak ditemukan atau belum tersedia." /></KencanaShell>;

  if (result) {
    return (
      <KencanaShell title="Hasil Quiz" subtitle="Nilai quiz otomatis masuk ke komponen kognitif.">
        <section className="mx-auto max-w-xl rounded-[2rem] border border-[#e8dfcf] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-700"><span className="material-symbols-outlined" style={{ fontSize: 42 }}>check_circle</span></div>
          <h2 className="mt-5 text-3xl font-black">Nilai Quiz: {Number(result.score || result.nilai || 0).toFixed(1)}</h2>
          <p className="mt-2 text-sm font-semibold text-[#756b5a]">Benar {result.correct_count || result.jumlah_benar || 0} dari {result.total_questions || result.total_soal || 0} soal.</p>
          <div className="mt-5"><StatusBadge status={result.graduation_status} /></div>
          <div className="mt-6"><PrimaryButton onClick={() => navigate('/student/kencana/score')}>Lihat Nilai Kencana</PrimaryButton></div>
        </section>
      </KencanaShell>
    );
  }

  if (!attempt) {
    return (
      <KencanaShell title={data?.title || 'Quiz Kencana'} subtitle={data?.description}>
        <section className="rounded-[2rem] border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
          <StatusBadge status={data?.can_start ? 'active' : 'locked'} />
          <h2 className="mt-4 text-2xl font-black">Instruksi Quiz</h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-[#756b5a]">{data?.instruction}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <Mini label="Jumlah Soal" value={questions.length} />
            <Mini label="Durasi" value={`${data?.duration_minutes}m`} />
            <Mini label="Percobaan" value={`${data?.attempts_used}/${data?.max_attempts}`} />
            <Mini label="Nilai" value={data?.show_score ? 'Tampil' : 'Ditahan'} />
          </div>
          {data?.lock_reason && <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">{data.lock_reason}</p>}
          <div className="mt-6"><PrimaryButton onClick={handleStart} disabled={!data?.can_start || startQuiz.isPending}>Mulai Quiz</PrimaryButton></div>
        </section>
      </KencanaShell>
    );
  }

  return (
    <KencanaShell title={data?.title || 'Quiz Kencana'} subtitle={`Sisa waktu ${fmt(timeLeft)} · ${Object.keys(answers).length}/${questions.length} soal terjawab`}>
      <section className="space-y-4">
        {questions.map((q, idx) => (
          <article key={q.id} className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
            <h3 className="text-lg font-black">{idx + 1}. {q.question_text}</h3>
            <div className="mt-5 grid gap-3">
              {(q.options || []).map((opt) => (
                <label key={opt.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${Number(answers[q.id]) === Number(opt.id) ? 'border-[#0f4c5c] bg-[#e8f0ef]' : 'border-[#e8dfcf] bg-[#fffaf0]'}`}>
                  <input className="mt-1" type="radio" name={`q-${q.id}`} checked={Number(answers[q.id]) === Number(opt.id)} onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))} />
                  <span className="text-sm font-bold text-[#3d3529]">{opt.option_text}</span>
                </label>
              ))}
            </div>
          </article>
        ))}
        <div className="sticky bottom-4 rounded-3xl border border-[#e8dfcf] bg-white/90 p-4 shadow-xl backdrop-blur flex items-center justify-between gap-4">
          <p className="text-sm font-black text-[#756b5a]">Timer: {fmt(timeLeft)}</p>
          <PrimaryButton onClick={handleSubmit} disabled={submitQuiz.isPending}>Submit Jawaban</PrimaryButton>
        </div>
      </section>
    </KencanaShell>
  );
}

function Mini({ label, value }) { return <div className="rounded-2xl bg-[#f7f1e5] p-4"><p className="text-xl font-black">{value}</p><p className="text-[10px] font-black uppercase tracking-widest text-[#9b8f7a]">{label}</p></div>; }

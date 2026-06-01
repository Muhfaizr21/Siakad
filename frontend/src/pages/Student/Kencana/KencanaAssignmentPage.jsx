import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useKencanaAssignmentQuery, useSubmitAssignmentMutation } from '../../../queries/useKencanaQuery';
import { ErrorPanel, fmtDate, KencanaShell, LoadingPanel, PrimaryButton, StatusBadge } from './components';

export default function KencanaAssignmentPage() {
  const { assignmentId } = useParams();
  const { data, isLoading, isError } = useKencanaAssignmentQuery(assignmentId);
  const submit = useSubmitAssignmentMutation();
  const [answerText, setAnswerText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  if (isLoading) return <KencanaShell title="Tugas Kencana"><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Tugas Kencana"><ErrorPanel message="Tugas tidak ditemukan." /></KencanaShell>;
  const assignment = data?.assignment || {};
  const submission = data?.submission || {};
  const handleSubmit = () => submit.mutate({ assignmentId, payload: { answer_text: answerText, link_url: linkUrl, file_url: fileUrl } }, { onSuccess: () => toast.success('Tugas dikumpulkan') });
  return (
    <KencanaShell title={assignment.title || 'Tugas Kencana'} subtitle={assignment.description}>
      <section className="grid gap-5 lg:grid-cols-[1fr_0.6fr]">
        <div className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
          <h2 className="text-2xl font-black">Form Pengumpulan</h2>
          <div className="mt-5 space-y-4">
            <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} rows={7} placeholder="Tulis jawaban/refleksi tugas..." className="w-full rounded-2xl border border-[#e8dfcf] bg-[#fffaf0] p-4 text-sm font-medium outline-none focus:border-[#0f4c5c]" />
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Link pengumpulan (opsional)" className="w-full rounded-2xl border border-[#e8dfcf] bg-[#fffaf0] p-4 text-sm font-bold outline-none focus:border-[#0f4c5c]" />
            <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="URL file upload (sementara sampai upload endpoint tersedia)" className="w-full rounded-2xl border border-[#e8dfcf] bg-[#fffaf0] p-4 text-sm font-bold outline-none focus:border-[#0f4c5c]" />
            <PrimaryButton onClick={handleSubmit} disabled={submit.isPending}>Kumpulkan Tugas</PrimaryButton>
          </div>
        </div>
        <aside className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
          <h2 className="text-2xl font-black">Status</h2>
          <div className="mt-4"><StatusBadge status={submission.status || 'not_started'} /></div>
          <p className="mt-4 text-sm font-bold text-[#756b5a]">Deadline: {fmtDate(assignment.due_date)}</p>
          <p className="mt-2 text-sm font-bold text-[#756b5a]">Tipe: {assignment.submission_type}</p>
          {submission.score !== undefined && submission.score !== null && <p className="mt-4 text-3xl font-black">{submission.score}</p>}
          {submission.feedback && <p className="mt-4 rounded-2xl bg-[#f7f1e5] p-4 text-sm font-semibold">{submission.feedback}</p>}
        </aside>
      </section>
    </KencanaShell>
  );
}

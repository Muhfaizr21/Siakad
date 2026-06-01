import React, { useState } from 'react';
import { useKencanaMentorInvitationsQuery, useRespondMentorInvitationMutation } from '../../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, StatusBadge } from './components';

export default function KencanaMentorInvitationsPage() {
  const { data, isLoading, isError } = useKencanaMentorInvitationsQuery();
  const respond = useRespondMentorInvitationMutation();
  const [message, setMessage] = useState('');

  if (isLoading) return <KencanaShell title="Undangan Dewan Pembimbing"><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Undangan Dewan Pembimbing"><ErrorPanel message="Gagal memuat undangan pembimbing." /></KencanaShell>;

  const invitations = data?.invitations || [];
  const activeMentor = data?.active_mentor;
  const invitationList = Array.isArray(invitations) ? invitations : [];
  const universityInvitations = invitationList.filter((inv) => (inv.mentor?.scope_type || inv.Mentor?.ScopeType) === 'university');
  const facultyInvitations = invitationList.filter((inv) => (inv.mentor?.scope_type || inv.Mentor?.ScopeType) === 'faculty');

  const handleRespond = async (id, action) => {
    setMessage('');
    try {
      await respond.mutateAsync({ id, action });
      setMessage(action === 'accept' ? 'Undangan diterima. Dewan Pembimbing sudah aktif.' : 'Undangan ditolak.');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Gagal memperbarui undangan.');
    }
  };

  return (
    <KencanaShell title="Undangan Dewan Pembimbing" subtitle="Konfirmasi undangan sebelum Dewan Pembimbing masuk ke daftar bimbingan aktif.">
      {activeMentor && (
        <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <p className="text-xs font-black uppercase tracking-[0.24em]">Dewan Pembimbing Aktif</p>
          <h2 className="mt-2 text-2xl font-black">{activeMentor.name}</h2>
          <p className="mt-1 text-sm font-bold">{activeMentor.email || '-'} {activeMentor.phone ? `- ${activeMentor.phone}` : ''}</p>
        </section>
      )}

      {message && <p className="rounded-2xl bg-[#f7f1e5] p-4 text-sm font-black text-[#1d1b16]">{message}</p>}

      <InvitationSection title="Undangan DP Kencana Universitas" description="Undangan dari Dewan Pembimbing lingkup universitas." items={universityInvitations} activeMentor={activeMentor} respond={respond} handleRespond={handleRespond} />
      <InvitationSection title="Undangan DP Kencana Fakultas" description="Undangan dari Dewan Pembimbing khusus fakultas kamu." items={facultyInvitations} activeMentor={activeMentor} respond={respond} handleRespond={handleRespond} />
      {!invitationList.length && <p className="rounded-[2rem] border border-[#e8dfcf] bg-white/85 p-8 text-center text-sm font-bold text-[#756b5a]">Belum ada undangan Dewan Pembimbing.</p>}
    </KencanaShell>
  );
}

function InvitationSection({ title, description, items, activeMentor, respond, handleRespond }) {
  return (
    <section className="rounded-[2rem] border border-[#e8dfcf] bg-white/60 p-5">
      <div className="mb-4">
        <h2 className="text-xl font-black text-[#1d1b16]">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-[#756b5a]">{description}</p>
      </div>
      <div className="grid gap-4">
        {items.map((inv) => {
          const mentor = inv.mentor || inv.Mentor || {};
          const status = inv.status || inv.Status;
          return (
            <article key={inv.id || inv.ID} className="rounded-[2rem] border border-[#e8dfcf] bg-white/90 p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9b8f7a]">Undangan Pembimbing</p>
                  <h3 className="mt-2 text-2xl font-black text-[#1d1b16]">{mentor.name || mentor.Name || 'Dewan Pembimbing'}</h3>
                  <p className="mt-1 text-sm font-bold text-[#756b5a]">{mentor.email || mentor.Email || '-'}</p>
                  <p className="mt-1 text-sm font-semibold text-[#756b5a]">Scope: {mentor.scope_type || mentor.ScopeType || '-'}</p>
                </div>
                <StatusBadge status={status} />
              </div>
              {status === 'pending' && !activeMentor && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => handleRespond(inv.id || inv.ID, 'accept')} disabled={respond.isPending} className="rounded-2xl bg-[#0f4c5c] px-5 py-3 text-sm font-black text-white disabled:bg-slate-300">Terima Undangan</button>
                  <button onClick={() => handleRespond(inv.id || inv.ID, 'reject')} disabled={respond.isPending} className="rounded-2xl border border-[#d8c9ad] px-5 py-3 text-sm font-black text-[#1d1b16] disabled:opacity-50">Tolak</button>
                </div>
              )}
            </article>
          );
        })}
        {!items.length && <p className="rounded-2xl border border-[#e8dfcf] bg-white/70 p-5 text-sm font-bold text-[#756b5a]">Belum ada undangan pada kategori ini.</p>}
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  useKencanaMentorInvitationsQuery, 
  useRespondMentorInvitationMutation,
  useRespondGroupInvitationMutation 
} from '../../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, StatusBadge } from './components';

export default function KencanaMentorInvitationsPage() {
  const { data, isLoading, isError } = useKencanaMentorInvitationsQuery();
  const respondMentor = useRespondMentorInvitationMutation();
  const respondGroup = useRespondGroupInvitationMutation();
  const [message, setMessage] = useState('');

  if (isLoading) return <KencanaShell title="Undangan Dewan Pembimbing" breadcrumbs={[{ label: 'Undangan Pembimbing' }]}><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Undangan Dewan Pembimbing" breadcrumbs={[{ label: 'Undangan Pembimbing' }]}><ErrorPanel message="Gagal memuat undangan pembimbing." /></KencanaShell>;

  const invitations = data?.invitations || [];
  const groupInvitations = data?.group_invitations || [];
  const activeMentor = data?.active_mentor;
  
  const invitationList = Array.isArray(invitations) ? invitations : [];
  const groupList = Array.isArray(groupInvitations) ? groupInvitations : [];
  
  // The old 1-on-1 invitations
  const facultyInvitations = invitationList.filter((inv) => (inv.mentor?.scope_type || inv.Mentor?.ScopeType) === 'faculty');
  const oldUniversityInvitations = invitationList.filter((inv) => (inv.mentor?.scope_type || inv.Mentor?.ScopeType) === 'university');

  const universityGroupList = groupList.filter(inv => (inv.group?.scope_type || inv.Group?.ScopeType) === 'university');
  const facultyGroupList = groupList.filter(inv => (inv.group?.scope_type || inv.Group?.ScopeType) === 'faculty');

  const handleRespondMentor = async (id, action) => {
    setMessage('');
    try {
      await respondMentor.mutateAsync({ id, action });
      setMessage(action === 'accept' ? 'Undangan diterima. Dewan Pembimbing sudah aktif.' : 'Undangan ditolak.');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Gagal memperbarui undangan.');
    }
  };

  const handleRespondGroup = async (id, action) => {
    setMessage('');
    try {
      await respondGroup.mutateAsync({ id, action });
      setMessage(action === 'accept' ? 'Berhasil bergabung dengan kelompok.' : 'Undangan kelompok ditolak.');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Gagal memperbarui undangan kelompok.');
    }
  };

  return (
    <KencanaShell title="Undangan Dewan Pembimbing" subtitle="Konfirmasi undangan sebelum bergabung dengan kelompok atau Dewan Pembimbing aktif." breadcrumbs={[{ label: 'Undangan Pembimbing' }]}>
      {activeMentor && (
        <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <p className="text-xs font-black uppercase tracking-[0.24em]">Dewan Pembimbing Aktif (1-on-1 Lama)</p>
          <h2 className="mt-2 text-2xl font-black">{activeMentor.name}</h2>
          <p className="mt-1 text-sm font-bold">{activeMentor.email || '-'} {activeMentor.phone ? `- ${activeMentor.phone}` : ''}</p>
        </section>
      )}

      {message && <p className="rounded-2xl bg-[#f7f1e5] p-4 text-sm font-black text-[#1d1b16]">{message}</p>}

      <GroupInvitationSection 
        title="Undangan Kelompok DP Kencana Universitas" 
        description="Undangan bergabung ke dalam kelompok Dewan Pembimbing universitas." 
        items={universityGroupList} 
        hasActive={universityGroupList.some(i => i.status === 'active' || i.Status === 'active')}
        respond={respondGroup} 
        handleRespond={handleRespondGroup} 
      />

      <GroupInvitationSection 
        title="Undangan Kelompok DP Kencana Fakultas" 
        description="Undangan bergabung ke dalam kelompok Dewan Pembimbing khusus fakultas." 
        items={facultyGroupList} 
        hasActive={facultyGroupList.some(i => i.status === 'active' || i.Status === 'active')}
        respond={respondGroup} 
        handleRespond={handleRespondGroup} 
      />

      <InvitationSection 
        title="Undangan DP Kencana Fakultas (1-on-1)" 
        description="Undangan dari Dewan Pembimbing khusus fakultas kamu (Format Lama)." 
        items={facultyInvitations} 
        activeMentor={activeMentor} 
        respond={respondMentor} 
        handleRespond={handleRespondMentor} 
      />

      {oldUniversityInvitations.length > 0 && (
        <InvitationSection 
          title="Undangan DP Kencana Universitas (Lama)" 
          description="Undangan dari Dewan Pembimbing lingkup universitas (Format Lama)." 
          items={oldUniversityInvitations} 
          activeMentor={activeMentor} 
          respond={respondMentor} 
          handleRespond={handleRespondMentor} 
        />
      )}

      {(!invitationList.length && !groupList.length) && (
        <p className="rounded-[2rem] border border-[#e8dfcf] bg-white/85 p-8 text-center text-sm font-bold text-[#756b5a]">Belum ada undangan Dewan Pembimbing.</p>
      )}
    </KencanaShell>
  );
}

function GroupDetailModal({ isOpen, onClose, group }) {
  if (!isOpen || !group) return null;

  const mentor = group.mentor || group.Mentor || {};
  const members = group.members || group.Members || [];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-[#fdfcf9] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0f4c5c] to-emerald-500"></div>
        <button onClick={onClose} className="absolute right-6 top-6 text-[#9b8f7a] hover:text-[#1d1b16]">
          <span className="material-symbols-rounded">close</span>
        </button>

        <h2 className="text-2xl font-black text-[#1d1b16]">Detail Kelompok</h2>
        <p className="text-sm font-semibold text-[#756b5a] mt-1">{group.name || group.Name || '-'}</p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[#e8dfcf] bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9b8f7a]">Dewan Pembimbing</p>
            <p className="mt-2 text-lg font-bold text-[#1d1b16]">{mentor.name || mentor.Name || '-'}</p>
            <p className="text-sm text-[#756b5a]">{mentor.email || mentor.Email || '-'}</p>
          </div>

          <div className="rounded-2xl border border-[#e8dfcf] bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9b8f7a]">Informasi Grup</p>
            <p className="mt-2 text-sm font-bold text-[#1d1b16]">Kode: {group.code || group.Code || '-'}</p>
            <p className="mt-1 text-sm font-bold text-[#1d1b16]">Lingkup: {(group.scope_type || group.ScopeType) === 'faculty' ? 'Fakultas' : 'Universitas'}</p>
            <p className="mt-1 text-sm font-bold text-[#1d1b16]">Jumlah Anggota: {members.length}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9b8f7a] mb-3">Daftar Anggota Saat Ini</p>
          <div className="max-h-48 overflow-y-auto rounded-2xl border border-[#e8dfcf] bg-white">
            {members.length > 0 ? (
              <ul className="divide-y divide-[#e8dfcf]">
                {members.map((m, idx) => {
                  const student = m.student || m.Student || {};
                  return (
                    <li key={idx} className="p-3 text-sm flex items-center justify-between">
                      <span className="font-bold text-[#1d1b16]">{student.nama || student.Nama || `Mahasiswa ${m.student_id}`}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${
                        (m.status || m.Status) === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        (m.status || m.Status) === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {m.status || m.Status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="p-4 text-center text-sm text-[#756b5a] font-medium">Belum ada anggota.</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="rounded-xl border border-[#d8c9ad] bg-white px-5 py-2.5 text-sm font-black text-[#1d1b16] hover:bg-[#f7f1e5]">
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function GroupInvitationSection({ title, description, items, hasActive, respond, handleRespond }) {
  const [selectedGroup, setSelectedGroup] = React.useState(null);

  if (!items.length) return null; // Only render if there are items to prevent clutter
  return (
    <section className="rounded-[2rem] border border-[#e8dfcf] bg-white/60 p-5">
      <div className="mb-4">
        <h2 className="text-xl font-black text-[#1d1b16]">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-[#756b5a]">{description}</p>
      </div>
      <div className="grid gap-4">
        {items.map((inv) => {
          const group = inv.group || inv.Group || {};
          const mentor = group.mentor || group.Mentor || {};
          const status = inv.status || inv.Status;
          
          return (
            <article key={inv.id || inv.ID} className="rounded-[2rem] border border-[#e8dfcf] bg-white/90 p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9b8f7a]">Undangan Kelompok</p>
                  <h3 className="mt-2 text-2xl font-black text-[#1d1b16]">{group.name || group.Name || 'Kelompok'}</h3>
                  <p className="mt-1 text-sm font-bold text-[#756b5a]">Kode: {group.code || group.Code || '-'}</p>
                  <div className="mt-3 p-3 bg-[#f7f1e5] rounded-xl border border-[#d8c9ad]/30">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#9b8f7a]">Dewan Pembimbing</p>
                    <p className="font-bold text-[#1d1b16]">{mentor.name || mentor.Name || '-'}</p>
                  </div>
                  <button onClick={() => setSelectedGroup(group)} className="mt-4 text-sm font-bold text-[#0f4c5c] hover:underline flex items-center gap-1">
                    <span className="material-symbols-rounded text-[18px]">info</span>
                    Lihat Detail Kelompok
                  </button>
                </div>
                <StatusBadge status={status} />
              </div>
              {status === 'pending' && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => handleRespond(inv.id || inv.ID, 'accept')} disabled={respond.isPending || hasActive} className="rounded-2xl bg-[#0f4c5c] px-5 py-3 text-sm font-black text-white disabled:bg-slate-300">Terima Undangan</button>
                  <button onClick={() => handleRespond(inv.id || inv.ID, 'reject')} disabled={respond.isPending} className="rounded-2xl border border-[#d8c9ad] px-5 py-3 text-sm font-black text-[#1d1b16] disabled:opacity-50">Tolak</button>
                </div>
              )}
            </article>
          );
        })}
      </div>
      
      <GroupDetailModal 
        isOpen={!!selectedGroup} 
        group={selectedGroup} 
        onClose={() => setSelectedGroup(null)} 
      />
    </section>
  );
}

function InvitationSection({ title, description, items, activeMentor, respond, handleRespond }) {
  if (!items.length) return null;
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
              {status === 'pending' && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => handleRespond(inv.id || inv.ID, 'accept')} disabled={respond.isPending || !!activeMentor} className="rounded-2xl bg-[#0f4c5c] px-5 py-3 text-sm font-black text-white disabled:bg-slate-300">Terima Undangan</button>
                  <button onClick={() => handleRespond(inv.id || inv.ID, 'reject')} disabled={respond.isPending} className="rounded-2xl border border-[#d8c9ad] px-5 py-3 text-sm font-black text-[#1d1b16] disabled:opacity-50">Tolak</button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

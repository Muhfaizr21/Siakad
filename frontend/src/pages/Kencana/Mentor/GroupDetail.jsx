import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useMentorGroupQuery,
  useMentorRemoveGroupMemberMutation,
} from '../../../queries/useKencanaMentorQuery';
import { PageHeader } from '../../../components/ui/page/PageHeader';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: group, isLoading } = useMentorGroupQuery(id);
  const removeMember = useMentorRemoveGroupMemberMutation();

  if (isLoading) return <div className="p-8 text-center font-bold text-[var(--theme-text-muted)]">Memuat detail kelompok...</div>;
  if (!group) return <div className="p-8 text-center font-bold text-[var(--theme-text-muted)]">Kelompok tidak ditemukan atau bukan milik Anda.</div>;

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-body max-w-7xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate('/kencana-mentor/groups')} className="text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors">
          ← Kembali ke Kelompok Saya
        </button>
      </div>

      <PageHeader
        icon="groups"
        title={
          <>
            <span className="text-[var(--theme-text)]">Detail </span>
            <span className="text-[var(--theme-primary)]">{group.name}</span>
          </>
        }
        subtitle={group.description || 'Kelola anggota mahasiswa kelompok Anda.'}
        breadcrumbs={[
          { label: 'Kencana Mentor', path: '/kencana-mentor/groups' },
          { label: group.name }
        ]}
        action={
          <div className="flex flex-col sm:flex-row gap-3 text-center min-w-[200px]">
            <div className="bg-white rounded-xl px-4 py-2 border border-[var(--theme-border)]">
              <p className="text-lg font-bold text-[var(--theme-text)]">{group.members_count || 0}</p>
              <p className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Anggota</p>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 border border-[var(--theme-border)]">
              <p className="text-lg font-bold text-[var(--theme-text)]">{group.capacity || 0}</p>
              <p className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Kapasitas</p>
            </div>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--theme-border-muted)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--theme-bg)]">
          <div>
            <h2 className="text-base font-bold text-[var(--theme-text)]">Anggota Kelompok</h2>
            <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Mahasiswa yang sudah masuk kelompok ini atau sedang diundang.</p>
          </div>
          <button 
            onClick={() => navigate('/kencana-mentor/invite')} 
            className="h-10 px-5 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Undang Mahasiswa
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--theme-border)] bg-[var(--theme-bg)]/50">
                <th className="py-3 px-5 text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">NIM</th>
                <th className="py-3 px-5 text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Nama</th>
                <th className="py-3 px-5 text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Prodi</th>
                <th className="py-3 px-5 text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Status</th>
                <th className="py-3 px-5 text-right text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--theme-border-muted)]">
              {group.members?.map(member => (
                <tr key={member.id} className="hover:bg-[var(--theme-bg)]/40 transition-colors">
                  <td className="py-4 px-5 font-bold text-[var(--theme-text)] text-sm">{member.student?.nim || '-'}</td>
                  <td className="py-4 px-5">
                    <p className="font-bold text-[var(--theme-text)] text-sm">{member.student?.nama || '-'}</p>
                    <p className="text-xs text-[var(--theme-text-muted)] font-semibold">{member.student?.fakultas_name || '-'}</p>
                  </td>
                  <td className="py-4 px-5 text-sm font-semibold text-[var(--theme-text-muted)]">{member.student?.program_studi_name || '-'}</td>
                  <td className="py-4 px-5">
                    {member.status === 'active' ? (
                      <span className="px-2.5 py-1 bg-[var(--theme-success-light)] text-[var(--theme-success)] border border-[var(--theme-success-light)] rounded-full text-[10px] font-bold uppercase tracking-wider">Aktif</span>
                    ) : member.status === 'pending' ? (
                      <span className="px-2.5 py-1 bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border border-[var(--theme-warning-light)] rounded-full text-[10px] font-bold uppercase tracking-wider">Menunggu ACC</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-[var(--theme-danger-light)] text-[var(--theme-danger)] border border-[var(--theme-danger-light)] rounded-full text-[10px] font-bold uppercase tracking-wider">Ditolak</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right flex items-center justify-end gap-2">
                    {group.scope_type !== 'faculty' && (
                      <>
                        <button
                          onClick={() => navigate(`/kencana-mentor/students/${member.student_id}?tab=progress`)}
                          className="h-8 px-3 rounded-lg bg-[var(--theme-primary-light)] text-[var(--theme-primary)] text-xs font-bold hover:bg-[var(--theme-primary-light)]/85 transition-colors border border-[var(--theme-primary-light)]"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => navigate(`/kencana-mentor/students/${member.student_id}?tab=form`)}
                          className="h-8 px-3 rounded-lg bg-[var(--theme-success-light)] text-[var(--theme-success)] text-xs font-bold hover:bg-[var(--theme-success-light)]/85 transition-colors border border-[var(--theme-success-light)]"
                        >
                          Nilai
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => {
                        if (confirm(`Yakin ingin mengeluarkan ${member.student?.nama} dari kelompok?`)) {
                          removeMember.mutate({ groupId: id, studentId: member.student_id });
                        }
                      }} 
                      className="h-8 px-3 rounded-lg bg-[var(--theme-danger-light)] text-[var(--theme-danger)] text-xs font-bold hover:bg-[var(--theme-danger-light)]/85 transition-colors border border-[var(--theme-danger-light)]"
                    >
                      Keluarkan
                    </button>
                  </td>
                </tr>
              ))}
              {!group.members?.length && <tr><td colSpan="5" className="py-12 text-center text-[var(--theme-text-muted)] font-bold">Belum ada anggota.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;

import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useAddGroupMembersMutation,
  useGroupQuery,
  useParticipantsQuery,
  useRemoveGroupMemberMutation,
} from '../../../queries/useKencanaAdminQuery';
import useAuthStore from '../../../store/useAuthStore';
import { PageHeader } from '../../../components/ui/page/PageHeader';

const GroupDetail = () => {
  const { id, facultyId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const portal = String(user?.role || '').toLowerCase() === 'kencana_fakultas' ? 'fakultas' : 'admin';
  const basePath = window.location.pathname.startsWith('/kencana-fakultas') ? '/kencana-fakultas' : window.location.pathname.startsWith('/kencana-fakult') ? '/kencana-fakult' : '/kencana-admin';
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const { data: group, isLoading } = useGroupQuery(id, portal);
  const { data: participantsRes } = useParticipantsQuery({ limit: 500, search, ...(group?.period_id && { period_id: group.period_id }), ...(facultyId && { fakultas_id: facultyId }) });
  const addMembers = useAddGroupMembersMutation(portal);
  const removeMember = useRemoveGroupMemberMutation(portal);

  const memberStudentIds = useMemo(() => new Set((group?.members || []).map(m => Number(m.student_id))), [group]);
  const availableStudents = useMemo(() => {
    const rows = Array.isArray(participantsRes?.data) ? participantsRes.data : [];
    return rows.filter(s => !memberStudentIds.has(Number(s.id)));
  }, [participantsRes, memberStudentIds]);

  const toggleStudent = (studentId) => {
    setSelectedIds(prev => prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]);
  };

  const submitMembers = () => {
    if (!selectedIds.length) return;
    addMembers.mutate({ groupId: id, student_ids: selectedIds.map(Number) }, { onSuccess: () => setSelectedIds([]) });
  };

  if (isLoading) return <div className="p-8 text-center font-bold text-[var(--theme-text-subtle)]">Memuat detail kelompok...</div>;
  if (!group) return <div className="p-8 text-center font-bold text-[var(--theme-text-subtle)]">Kelompok tidak ditemukan.</div>;

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-body max-w-7xl mx-auto space-y-6">
      
      <div>
        <button
          onClick={() => navigate(facultyId ? `${basePath}/${basePath.includes('fakult') ? 'stages' : 'faculty-stages'}/${facultyId}?tab=groups` : `${basePath}/groups`)}
          className="text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
        >
          ← Kembali ke Kelola Kelompok
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-primary-hover)] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-[var(--theme-secondary)]/10 blur-3xl rounded-full" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-black text-[var(--theme-secondary)] uppercase tracking-[0.28em]">{group.code || 'Kelompok'}</p>
            <h1 className="text-3xl md:text-4xl font-black mt-2">{group.name}</h1>
            <p className="text-sm text-white/80 mt-2 max-w-2xl">{group.description || 'Kelola anggota mahasiswa dan mentor/DP kelompok.'}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center min-w-[320px]">
            <div className="bg-white/10 rounded-xl p-4 border border-white/10">
              <p className="text-2xl font-black">{group.members_count || 0}</p>
              <p className="text-[9px] font-bold text-white/70 uppercase mt-0.5">Anggota</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border border-white/10">
              <p className="text-2xl font-black">{group.capacity || 0}</p>
              <p className="text-[9px] font-bold text-white/70 uppercase mt-0.5">Kapasitas</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border border-white/10 flex flex-col justify-center items-center">
              <p className="text-xs font-bold truncate max-w-[95px]" title={group.mentor_name}>{group.mentor_name || '-'}</p>
              <p className="text-[9px] font-bold text-white/70 uppercase mt-1">Mentor/DP</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        {/* Members List Card */}
        <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
            <h2 className="text-base font-bold text-[var(--theme-text)]">Anggota Kelompok</h2>
            <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Daftar mahasiswa yang terdaftar dalam kelompok ini.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
                  <th className="py-3.5 px-5 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider">NIM</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider">Nama</th>
                  <th className="py-3.5 px-5 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider">Prodi</th>
                  <th className="py-3.5 px-5 text-right text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border-muted)]">
                {group.members?.map(member => (
                  <tr key={member.id} className="hover:bg-[var(--theme-bg)] transition-colors">
                    <td className="py-3.5 px-5 text-sm font-semibold text-[var(--theme-text)]">
                      <span className="font-bold text-[var(--theme-text)] bg-[var(--theme-bg)] px-2 py-0.5 rounded-lg border border-[var(--theme-border)]">{member.student?.nim || '-'}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-sm text-[var(--theme-text)]">{member.student?.nama || '-'}</p>
                      <p className="text-xs font-semibold text-[var(--theme-text-muted)]">{member.student?.fakultas_name || '-'}</p>
                    </td>
                    <td className="py-3.5 px-5 text-xs font-semibold text-[var(--theme-text-muted)]">
                      {member.student?.program_studi_name || '-'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => removeMember.mutate({ groupId: id, studentId: member.student_id })}
                        className="px-3 py-1.5 rounded-lg bg-[var(--theme-error-light)] text-[var(--theme-error)] text-xs font-bold transition-colors hover:bg-[var(--theme-error-light)]/85"
                      >
                        Keluarkan
                      </button>
                    </td>
                  </tr>
                ))}
                {!group.members?.length && (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-[var(--theme-text-subtle)] font-bold">
                      Belum ada anggota kelompok yang terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Student Card */}
        <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden h-fit flex flex-col">
          <div className="p-5 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
            <h2 className="text-base font-bold text-[var(--theme-text)]">Tambah Mahasiswa</h2>
            <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Pilih mahasiswa yang belum bergabung ke kelompok lain.</p>
          </div>
          <div className="p-5 space-y-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama atau NIM..."
              className="w-full h-10 px-4 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]"
            />
            <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
              {availableStudents.map(student => (
                <label key={student.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--theme-border)] hover:bg-[var(--theme-bg)] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    className="rounded text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]"
                  />
                  <div>
                    <p className="text-sm font-bold text-[var(--theme-text)]">{student.nama}</p>
                    <p className="text-xs font-semibold text-[var(--theme-text-muted)]">{student.nim} • {student.program_studi_name || '-'}</p>
                  </div>
                </label>
              ))}
              {!availableStudents.length && (
                <p className="py-8 text-center text-sm font-bold text-[var(--theme-text-subtle)]">Tidak ada mahasiswa tersedia.</p>
              )}
            </div>
            <button
              onClick={submitMembers}
              disabled={!selectedIds.length || addMembers.isPending}
              className="w-full h-10 px-5 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-md"
            >
              Tambah {selectedIds.length || ''} Mahasiswa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;

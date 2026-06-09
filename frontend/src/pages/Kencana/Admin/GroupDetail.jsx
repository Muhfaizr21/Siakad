import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useAddGroupMembersMutation,
  useGroupQuery,
  useParticipantsQuery,
  useRemoveGroupMemberMutation,
} from '../../../queries/useKencanaAdminQuery';
import useAuthStore from '../../../store/useAuthStore';
import { DashboardHero } from '@/components/ui/dashboard';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent } from '@/components/ui/Card';
import { UserInfoCell, TitleSubtitleCell, ActionButton } from '@/components/ui/TableCells';

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

  const memberColumns = [
    {
      key: 'student',
      label: 'Informasi Mahasiswa',
      render: (v, member) => <UserInfoCell name={member.student?.nama} subtitle={member.student?.nim} avatarUrl={member.student?.foto_url || member.student?.foto} />
    },
    {
      key: 'prodi',
      label: 'Prodi & Fakultas',
      render: (v, member) => <TitleSubtitleCell title={member.student?.program_studi_name} subtitle={member.student?.fakultas_name} />
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (v, member) => (
        <div className="flex justify-end">
          <button
            onClick={() => removeMember.mutate({ groupId: id, studentId: member.student_id })}
            className="px-3 py-1.5 rounded-lg bg-[var(--theme-error-light)] text-[var(--theme-error)] text-xs font-bold transition-colors hover:bg-[var(--theme-error-light)]/85 border-none cursor-pointer"
          >
            Keluarkan
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="bg-transparent font-body max-w-7xl mx-auto space-y-6">
      
      <div>
        <button
          onClick={() => navigate(facultyId ? `${basePath}/${basePath.includes('fakult') ? 'stages' : 'faculty-stages'}/${facultyId}?tab=groups` : `${basePath}/groups`)}
          className="text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors bg-transparent border-none cursor-pointer"
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
        <Card className="glass-card shadow-sm rounded-xl overflow-hidden border-slate-100/60 flex flex-col h-fit">
          <div className="p-5 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
            <h2 className="text-base font-bold text-[var(--theme-text)]">Anggota Kelompok</h2>
            <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Daftar mahasiswa yang terdaftar dalam kelompok ini.</p>
          </div>
          <CardContent className="p-0 border-none shadow-none bg-transparent flex-1">
            <DataTable
              columns={memberColumns}
              data={group.members || []}
              searchable={true}
              searchPlaceholder="Cari anggota kelompok..."
              emptyMessage="Belum ada anggota kelompok yang terdaftar."
              emptyIcon="group"
              pagination={true}
              pageSize={10}
            />
          </CardContent>
        </Card>

        {/* Add Student Card */}
        <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden h-fit flex flex-col">
          <div className="p-5 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
            <h2 className="text-base font-bold text-[var(--theme-text)]">Tambah Mahasiswa</h2>
            <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Pilih mahasiswa yang belum bergabung ke kelompok lain.</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-[var(--theme-text-muted)]">search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama atau NIM..."
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-[var(--theme-border)] text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all"
              />
            </div>
            
            <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {availableStudents.map(student => (
                <label key={student.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--theme-border)] hover:bg-[var(--theme-primary-light)] cursor-pointer transition-colors group">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    className="rounded text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-primary)] transition-colors">{student.nama}</p>
                    <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-0.5">{student.nim} • {student.program_studi_name || '-'}</p>
                  </div>
                </label>
              ))}
              {!availableStudents.length && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-4xl text-[var(--theme-text-muted)] mb-2">person_off</span>
                  <p className="text-sm font-bold text-[var(--theme-text-subtle)]">Tidak ada mahasiswa tersedia.</p>
                </div>
              )}
            </div>
            <button
              onClick={submitMembers}
              disabled={!selectedIds.length || addMembers.isPending}
              className="w-full h-11 px-5 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Tambah {selectedIds.length > 0 ? selectedIds.length : ''} Mahasiswa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;

import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useAddGroupMembersMutation,
  useGroupQuery,
  useParticipantsQuery,
  useRemoveGroupMemberMutation,
} from '../../../queries/useKencanaAdminQuery';
import useAuthStore from '../../../store/useAuthStore';

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

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-400">Memuat detail kelompok...</div>;
  if (!group) return <div className="p-8 text-center font-bold text-slate-400">Kelompok tidak ditemukan.</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <button onClick={() => navigate(facultyId ? `${basePath}/${basePath.includes('fakult') ? 'stages' : 'faculty-stages'}/${facultyId}?tab=groups` : `${basePath}/groups`)} className="text-sm font-bold text-slate-500 hover:text-slate-800">← Kembali ke Kelola Kelompok</button>

      <div className="bg-gradient-to-br from-slate-950 to-emerald-950 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.28em]">{group.code || 'Kelompok'}</p>
            <h1 className="text-3xl md:text-4xl font-black mt-2">{group.name}</h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">{group.description || 'Kelola anggota mahasiswa dan mentor/DP kelompok.'}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center min-w-[320px]">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10"><p className="text-2xl font-black">{group.members_count || 0}</p><p className="text-[10px] font-bold text-slate-300">Anggota</p></div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10"><p className="text-2xl font-black">{group.capacity || 0}</p><p className="text-[10px] font-bold text-slate-300">Kapasitas</p></div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10"><p className="text-xs font-black mt-2">{group.mentor_name || '-'}</p><p className="text-[10px] font-bold text-slate-300">Mentor/DP</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100"><h2 className="text-lg font-black text-slate-800">Anggota Kelompok</h2><p className="text-xs font-semibold text-slate-500 mt-1">Mahasiswa yang sudah masuk kelompok ini.</p></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-slate-100 bg-slate-50"><th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase">NIM</th><th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase">Nama</th><th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase">Prodi</th><th className="py-4 px-5 text-right text-[10px] font-black text-slate-400 uppercase">Aksi</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {group.members?.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="py-4 px-5 font-black text-slate-700">{member.student?.nim || '-'}</td>
                    <td className="py-4 px-5"><p className="font-bold text-slate-800">{member.student?.nama || '-'}</p><p className="text-xs text-slate-500">{member.student?.fakultas_name || '-'}</p></td>
                    <td className="py-4 px-5 text-sm font-semibold text-slate-600">{member.student?.program_studi_name || '-'}</td>
                    <td className="py-4 px-5 text-right"><button onClick={() => removeMember.mutate({ groupId: id, studentId: member.student_id })} className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-black">Keluarkan</button></td>
                  </tr>
                ))}
                {!group.members?.length && <tr><td colSpan="4" className="py-12 text-center text-slate-400 font-bold">Belum ada anggota.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="p-5 border-b border-slate-100"><h2 className="text-lg font-black text-slate-800">Tambah Mahasiswa</h2><p className="text-xs font-semibold text-slate-500 mt-1">Pilih mahasiswa yang belum ada di kelompok ini.</p></div>
          <div className="p-5 space-y-4">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama/NIM..." className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold" />
            <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
              {availableStudents.map(student => (
                <label key={student.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" checked={selectedIds.includes(student.id)} onChange={() => toggleStudent(student.id)} />
                  <div><p className="text-sm font-black text-slate-800">{student.nama}</p><p className="text-xs font-semibold text-slate-500">{student.nim} • {student.program_studi_name || '-'}</p></div>
                </label>
              ))}
              {!availableStudents.length && <p className="py-8 text-center text-sm font-bold text-slate-400">Tidak ada mahasiswa tersedia.</p>}
            </div>
            <button onClick={submitMembers} disabled={!selectedIds.length || addMembers.isPending} className="w-full px-5 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-black disabled:opacity-50">Tambah {selectedIds.length || ''} Mahasiswa</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useMentorGroupQuery,
  useMentorRemoveGroupMemberMutation,
} from '../../../queries/useKencanaMentorQuery';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: group, isLoading } = useMentorGroupQuery(id);
  const removeMember = useMentorRemoveGroupMemberMutation();

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-400">Memuat detail kelompok...</div>;
  if (!group) return <div className="p-8 text-center font-bold text-slate-400">Kelompok tidak ditemukan atau bukan milik Anda.</div>;

  return (
    <div className="md:max-w-7xl mx-auto space-y-6">
      <button onClick={() => navigate('/kencana-mentor/groups')} className="text-sm font-bold text-slate-500 hover:text-slate-800">
        ← Kembali ke Kelompok Saya
      </button>

      <div className="bg-gradient-to-br from-slate-950 to-violet-950 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-black text-violet-300 uppercase tracking-[0.28em]">{group.code || 'Kelompok'}</p>
            <h1 className="text-3xl md:text-4xl font-black mt-2">{group.name}</h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">{group.description || 'Kelola anggota mahasiswa kelompok Anda.'}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center min-w-[200px]">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <p className="text-2xl font-black">{group.members_count || 0}</p>
              <p className="text-[10px] font-bold text-slate-300">Total Anggota</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <p className="text-2xl font-black">{group.capacity || 0}</p>
              <p className="text-[10px] font-bold text-slate-300">Kapasitas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800">Anggota Kelompok</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Mahasiswa yang sudah masuk kelompok ini atau sedang diundang.</p>
          </div>
          <button 
            onClick={() => navigate('/kencana-mentor/invite')} 
            className="px-5 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-black transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined size-5">person_add</span>
            Undang Mahasiswa
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase">NIM</th>
                <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase">Nama</th>
                <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase">Prodi</th>
                <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase">Status</th>
                <th className="py-4 px-5 text-right text-[10px] font-black text-slate-400 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {group.members?.map(member => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="py-4 px-5 font-black text-slate-700">{member.student?.nim || '-'}</td>
                  <td className="py-4 px-5">
                    <p className="font-bold text-slate-800">{member.student?.nama || '-'}</p>
                    <p className="text-xs text-slate-500">{member.student?.fakultas_name || '-'}</p>
                  </td>
                  <td className="py-4 px-5 text-sm font-semibold text-slate-600">{member.student?.program_studi_name || '-'}</td>
                  <td className="py-4 px-5">
                    {member.status === 'active' ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Aktif</span>
                    ) : member.status === 'pending' ? (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Menunggu ACC</span>
                    ) : (
                      <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">Ditolak</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right flex items-center justify-end gap-2">
                    {group.scope_type !== 'faculty' && (
                      <>
                        <button
                          onClick={() => navigate(`/kencana-mentor/students/${member.student_id}?tab=progress`)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-black hover:bg-indigo-100 transition-colors"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => navigate(`/kencana-mentor/students/${member.student_id}?tab=form`)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black hover:bg-emerald-100 transition-colors"
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
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-black hover:bg-rose-100 transition-colors"
                    >
                      Keluarkan
                    </button>
                  </td>
                </tr>
              ))}
              {!group.members?.length && <tr><td colSpan="5" className="py-12 text-center text-slate-400 font-bold">Belum ada anggota.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;

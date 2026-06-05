import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useMentorAddGroupMembersMutation,
  useMentorGroupsQuery,
  useMentorAvailableStudentsQuery,
} from '../../../queries/useKencanaMentorQuery';

const Invite = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const { data: groups, isLoading: isGroupsLoading } = useMentorGroupsQuery();
  
  // Available students who are not in any group or whose mentor allows them to be pulled
  const { data: availableStudentsRes, isLoading: isStudentsLoading } = useMentorAvailableStudentsQuery({ search });
  const addMembers = useMentorAddGroupMembersMutation();

  const uniqueFaculties = useMemo(() => {
    if (!availableStudentsRes) return [];
    const faculties = availableStudentsRes.map(s => s.fakultas).filter(Boolean);
    return [...new Set(faculties)].sort();
  }, [availableStudentsRes]);

  const filteredStudents = useMemo(() => {
    if (!availableStudentsRes) return [];
    if (!facultyFilter) return availableStudentsRes;
    return availableStudentsRes.filter(s => s.fakultas === facultyFilter);
  }, [availableStudentsRes, facultyFilter]);

  // If there's only 1 group, auto-select it. Or if selected, find it.
  const activeGroup = useMemo(() => {
    if (!groups?.length) return null;
    if (selectedGroupId) return groups.find(g => String(g.id) === String(selectedGroupId));
    return groups[0];
  }, [groups, selectedGroupId]);

  // Effect to auto-select if 1 group
  React.useEffect(() => {
    if (groups?.length === 1 && !selectedGroupId) {
      setSelectedGroupId(String(groups[0].id));
    }
  }, [groups, selectedGroupId]);

  const toggleStudent = (studentId) => {
    setSelectedIds(prev => prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]);
  };

  const submitMembers = () => {
    if (!selectedIds.length || !activeGroup) return;
    addMembers.mutate({ groupId: activeGroup.id, student_ids: selectedIds.map(Number) }, { 
      onSuccess: () => {
        setSelectedIds([]);
        alert(`Berhasil mengirimkan undangan ke ${selectedIds.length} mahasiswa.`);
        navigate(`/kencana-mentor/groups/${activeGroup.id}`);
      },
      onError: (err) => {
        const data = err.response?.data || {};
        const conflictIds = data.conflict_student_ids || [];
        const invitedCount = data.invited_count || 0;
        if (conflictIds.length) {
          alert(`Sebagian mahasiswa tidak bisa diundang karena sudah aktif di kelompok/mentor lain. Berhasil dikirim: ${invitedCount}. Konflik ID: ${conflictIds.join(', ')}`);
          return;
        }
        alert(data.message || err.message || 'Gagal mengirim undangan mahasiswa.');
      }
    });
  };

  if (isGroupsLoading) return <div className="p-8 text-center font-bold text-slate-400">Memuat data kelompok...</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-slate-950 to-violet-950 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <h1 className="text-3xl md:text-4xl font-black mt-2">Undang Mahasiswa</h1>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl">Cari dan undang mahasiswa untuk bergabung ke dalam kelompok bimbingan Anda.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-sm font-semibold text-amber-800">
          Jika mahasiswa sudah aktif di mentor/kelompok lain, sistem akan memblokir undangan baru. Jika ada kesalahan penempatan, admin perlu memindahkan atau menghapus assignment aktif terlebih dahulu.
        </div>

        <div>
          <label className="block text-sm font-black text-slate-800 mb-2">Pilih Kelompok Tujuan</label>
          <select 
            value={activeGroup?.id || ''} 
            onChange={e => setSelectedGroupId(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-violet-500 outline-none"
          >
            <option value="" disabled>-- Pilih Kelompok --</option>
            {groups?.map(g => (
              <option key={g.id} value={g.id}>{g.name} ({g.code || '-'})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black text-slate-800 mb-2">Cari Mahasiswa</label>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Cari nama atau NIM..." 
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-violet-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-black text-slate-800 mb-2">Filter Fakultas</label>
            <select
              value={facultyFilter}
              onChange={e => setFacultyFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-violet-500 outline-none"
            >
              <option value="">Semua Fakultas</option>
              {uniqueFaculties.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 border-b border-slate-200 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) {
                          const validIds = filteredStudents.filter(s => !s.already_has_mentor).map(s => s.id);
                          setSelectedIds(prev => [...new Set([...prev, ...validIds])]);
                        } else {
                          const currentIds = filteredStudents.map(s => s.id);
                          setSelectedIds(prev => prev.filter(id => !currentIds.includes(id)));
                        }
                      }}
                      className="w-4 h-4 text-violet-600 rounded cursor-pointer" 
                    />
                  </th>
                  <th className="p-4 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">Mahasiswa</th>
                  <th className="p-4 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">NIM</th>
                  <th className="p-4 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">Program Studi / Fakultas</th>
                  <th className="p-4 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isStudentsLoading && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-sm font-bold text-slate-400">Mencari mahasiswa...</td>
                  </tr>
                )}
                {!isStudentsLoading && filteredStudents?.map(student => (
                  <tr 
                    key={student.id} 
                    className={`transition-colors ${student.already_has_mentor ? 'bg-slate-50/50 opacity-70 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                  >
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        disabled={student.already_has_mentor}
                        checked={selectedIds.includes(student.id)} 
                        onChange={() => !student.already_has_mentor && toggleStudent(student.id)} 
                        className="w-4 h-4 text-violet-600 rounded disabled:opacity-50 cursor-pointer" 
                      />
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-black text-slate-800">{student.name || student.nama}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-600">{student.nim}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-600">{student.program_studi || student.program_studi_name || '-'}</p>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">{student.fakultas}</p>
                    </td>
                    <td className="p-4">
                      {student.already_has_mentor ? (
                        <span className="text-[10px] px-2 py-1 bg-amber-100 text-amber-700 font-bold rounded-lg whitespace-nowrap">
                          {student.mentor_name || 'Sudah terdaftar'}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg whitespace-nowrap">
                          Tersedia
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {!isStudentsLoading && (!filteredStudents || filteredStudents.length === 0) && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-sm font-bold text-slate-400">Tidak ada mahasiswa yang sesuai pencarian.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <button 
          onClick={submitMembers} 
          disabled={!selectedIds.length || !activeGroup || addMembers.isPending} 
          className="w-full px-5 py-4 rounded-2xl bg-violet-600 text-white text-sm font-black disabled:opacity-50 hover:bg-violet-700 transition-colors"
        >
          Kirim Undangan ke {selectedIds.length || 0} Mahasiswa
        </button>
      </div>
    </div>
  );
};

export default Invite;

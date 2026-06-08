import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useMentorAddGroupMembersMutation,
  useMentorGroupsQuery,
  useMentorAvailableStudentsQuery,
} from '../../../queries/useKencanaMentorQuery';
import { PageHeader } from '../../../components/ui/page/PageHeader';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';

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
    if (!facultyFilter || facultyFilter === 'all') return availableStudentsRes;
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

  if (isGroupsLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-transparent font-body max-w-5xl mx-auto space-y-6">
      <PageHeader
        icon="person_add"
        title={
          <>
            <span className="text-[var(--theme-text)]">Undang </span>
            <span className="text-[var(--theme-primary)]">Mahasiswa</span>
          </>
        }
        subtitle="Cari dan undang mahasiswa untuk bergabung ke dalam kelompok bimbingan Anda."
        breadcrumbs={[
          { label: 'Kencana Mentor', path: '/kencana-mentor/groups' },
          { label: 'Undang Mahasiswa' }
        ]}
      />

      <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm p-6 space-y-5">
        <div className="rounded-xl bg-[var(--theme-warning-light)] border border-[var(--theme-warning-light)] p-4 text-xs font-bold text-[var(--theme-warning)] leading-relaxed">
          Jika mahasiswa sudah aktif di mentor/kelompok lain, sistem akan memblokir undangan baru. Jika ada kesalahan penempatan, admin perlu memindahkan atau menghapus assignment aktif terlebih dahulu.
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Pilih Kelompok Tujuan *</label>
          <SelectField 
            value={selectedGroupId || (activeGroup?.id ? String(activeGroup.id) : '')} 
            onValueChange={setSelectedGroupId}
            className="w-full"
            placeholder="Pilih Kelompok..."
          >
            {groups?.map(g => (
              <SelectOption key={g.id} value={String(g.id)}>{g.name} ({g.code || '-'})</SelectOption>
            ))}
          </SelectField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Cari Mahasiswa</label>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Cari nama atau NIM..." 
              className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Filter Fakultas</label>
            <SelectField
              value={facultyFilter}
              onValueChange={setFacultyFilter}
              className="w-full"
              placeholder="Semua Fakultas"
            >
              <SelectOption value="all">Semua Fakultas</SelectOption>
              {uniqueFaculties.map(f => (
                <SelectOption key={f} value={f}>{f}</SelectOption>
              ))}
            </SelectField>
          </div>
        </div>

        <div className="border border-[var(--theme-border)] rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--theme-bg)] sticky top-0 z-10 shadow-sm">
                <tr className="border-b border-[var(--theme-border)]">
                  <th className="p-4 w-12 text-center">
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
                      className="w-4 h-4 text-[var(--theme-primary)] rounded cursor-pointer border-[var(--theme-border)] focus:ring-[var(--theme-primary)]" 
                    />
                  </th>
                  <th className="p-4 text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Mahasiswa</th>
                  <th className="p-4 text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">NIM</th>
                  <th className="p-4 text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Program Studi / Fakultas</th>
                  <th className="p-4 text-[var(--theme-text-muted)] text-right text-xs font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border-muted)]">
                {isStudentsLoading && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-sm font-bold text-[var(--theme-text-muted)]">Mencari mahasiswa...</td>
                  </tr>
                )}
                {!isStudentsLoading && filteredStudents?.map(student => (
                  <tr 
                    key={student.id} 
                    className={`transition-colors text-sm font-semibold text-[var(--theme-text)] ${student.already_has_mentor ? 'bg-[var(--theme-bg)]/20 opacity-70 cursor-not-allowed' : 'hover:bg-[var(--theme-bg)]/40'}`}
                  >
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        disabled={student.already_has_mentor}
                        checked={selectedIds.includes(student.id)} 
                        onChange={() => !student.already_has_mentor && toggleStudent(student.id)} 
                        className="w-4 h-4 text-[var(--theme-primary)] rounded disabled:opacity-50 cursor-pointer border-[var(--theme-border)] focus:ring-[var(--theme-primary)]" 
                      />
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-[var(--theme-text)]">{student.name || student.nama}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-[var(--theme-text-muted)]">{student.nim}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-[var(--theme-text)]">{student.program_studi || student.program_studi_name || '-'}</p>
                      <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-0.5">{student.fakultas}</p>
                    </td>
                    <td className="p-4 text-right">
                      {student.already_has_mentor ? (
                        <span className="text-[10px] px-2.5 py-1 bg-[var(--theme-warning-light)] text-[var(--theme-warning)] font-bold rounded-lg border border-[var(--theme-warning-light)] whitespace-nowrap">
                          {student.mentor_name || 'Sudah terdaftar'}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2.5 py-1 bg-[var(--theme-success-light)] text-[var(--theme-success)] font-bold rounded-lg border border-[var(--theme-success-light)] whitespace-nowrap">
                          Tersedia
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {!isStudentsLoading && (!filteredStudents || filteredStudents.length === 0) && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-sm font-bold text-[var(--theme-text-muted)]">Tidak ada mahasiswa yang sesuai pencarian.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <button 
          onClick={submitMembers} 
          disabled={!selectedIds.length || !activeGroup || addMembers.isPending} 
          className="w-full h-12 rounded-xl bg-[var(--theme-primary)] text-white text-xs font-bold disabled:opacity-50 hover:bg-[var(--theme-primary-hover)] transition-colors shadow-md"
        >
          Kirim Undangan ke {selectedIds.length || 0} Mahasiswa
        </button>
      </div>
    </div>
  );
};

export default Invite;

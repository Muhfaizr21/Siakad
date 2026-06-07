import React, { useState, useMemo } from 'react';
import { useMentorAvailableStudentsQuery, useMentorInviteMutation } from '../../../queries/useKencanaMentorQuery';
import { PageHeader } from '../../../components/ui/page/PageHeader';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';

const AvailableStudents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'available', 'assigned'
  const [fakultasFilter, setFakultasFilter] = useState('all');
  
  const { data: available, isLoading } = useMentorAvailableStudentsQuery();
  const inviteMutation = useMentorInviteMutation();
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');

  const rows = Array.isArray(available) ? available : [];

  // Extract unique fakultas for the dropdown
  const uniqueFakultas = useMemo(() => {
    const list = rows.map(r => r.fakultas).filter(Boolean);
    return [...new Set(list)].sort();
  }, [rows]);

  // Client-side filtering
  const filteredRows = useMemo(() => {
    return rows.filter(student => {
      // 1. Search Filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        (student.nama || student.name)?.toLowerCase().includes(searchLower) ||
        student.nim?.toLowerCase().includes(searchLower) ||
        student.program_studi?.toLowerCase().includes(searchLower);

      // 2. Status Filter
      let matchesStatus = true;
      if (statusFilter === 'available') matchesStatus = !student.already_has_mentor;
      if (statusFilter === 'assigned') matchesStatus = student.already_has_mentor;

      // 3. Fakultas Filter
      let matchesFakultas = true;
      if (fakultasFilter !== 'all') matchesFakultas = student.fakultas === fakultasFilter;

      return matchesSearch && matchesStatus && matchesFakultas;
    });
  }, [rows, searchTerm, statusFilter, fakultasFilter]);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleInvite = () => {
    if(selected.length === 0) return;
    setMessage('');
    inviteMutation.mutate({ student_ids: selected }, {
      onSuccess: (res) => {
        setSelected([]);
        setMessage(res?.message || 'Undangan berhasil dikirim. Menunggu konfirmasi mahasiswa.');
      },
      onError: (err) => setMessage(err?.response?.data?.message || 'Gagal mengirim undangan.')
    });
  };

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-body max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon="person_search"
        title={
          <>
            <span className="text-[var(--theme-text)]">Cari </span>
            <span className="text-[var(--theme-primary)]">Mahasiswa</span>
          </>
        }
        subtitle="Pilih mahasiswa untuk diundang sebagai bimbingan Anda."
        breadcrumbs={[
          { label: 'Kencana Mentor', path: '/kencana-mentor/groups' },
          { label: 'Cari Mahasiswa' }
        ]}
        action={
          <button 
            onClick={handleInvite}
            disabled={selected.length === 0 || inviteMutation.isPending}
            className="h-10 px-5 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {inviteMutation.isPending ? 'Mengundang...' : `Undang (${selected.length}) Mahasiswa`}
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
        
        {/* Filters Area */}
        <div className="p-5 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)] flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari NIM, Nama, atau Prodi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-white border border-[var(--theme-border)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] font-semibold transition-all outline-none"
            />
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-lg text-[var(--theme-text-muted)]">search</span>
          </div>
          
          <SelectField 
            value={statusFilter} 
            onValueChange={setStatusFilter}
            className="min-w-[200px]"
          >
            <SelectOption value="all">Semua Status Mentor</SelectOption>
            <SelectOption value="available">Belum Punya Mentor</SelectOption>
            <SelectOption value="assigned">Sudah Punya Mentor</SelectOption>
          </SelectField>

          <SelectField 
            value={fakultasFilter} 
            onValueChange={setFakultasFilter}
            className="min-w-[200px]"
          >
            <SelectOption value="all">Semua Fakultas</SelectOption>
            {uniqueFakultas.map(fak => (
              <SelectOption key={fak} value={fak}>{fak}</SelectOption>
            ))}
          </SelectField>
        </div>

        {/* Content Area */}
        <div className="p-5">
          {message && <p className="mb-4 rounded-xl bg-[var(--theme-primary-light)] p-3 text-xs font-bold text-[var(--theme-primary)] border border-[var(--theme-primary-light)]">{message}</p>}
          
          {isLoading ? (
            <div className="py-12 flex justify-center bg-transparent">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--theme-border)] text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider bg-[var(--theme-bg)]/50">
                    <th className="py-3 px-4 w-10"></th>
                    <th className="py-3 px-4">NIM</th>
                    <th className="py-3 px-4">Nama Mahasiswa</th>
                    <th className="py-3 px-4">Fakultas / Prodi</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--theme-border-muted)]">
                  {filteredRows.map((student) => (
                    <tr key={student.id} className={`hover:bg-[var(--theme-bg)]/40 transition-colors text-sm font-semibold text-[var(--theme-text)] ${student.already_has_mentor ? 'opacity-70 bg-[var(--theme-bg)]/20' : ''}`}>
                      <td className="py-4 px-4">
                        <input 
                          type="checkbox" 
                          checked={selected.includes(student.id)} 
                          disabled={student.already_has_mentor}
                          onChange={() => toggleSelect(student.id)}
                          className="w-4 h-4 text-[var(--theme-primary)] rounded border-[var(--theme-border)] focus:ring-[var(--theme-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </td>
                      <td className="py-4 px-4 font-bold text-[var(--theme-primary)]">{student.nim}</td>
                      <td className="py-4 px-4 text-[var(--theme-text)] font-bold">{student.nama || student.name}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-[var(--theme-text)] font-semibold">{student.fakultas || '-'}</span>
                          <span className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase mt-0.5">{student.program_studi || '-'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {student.already_has_mentor ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--theme-warning-light)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--theme-warning)] border border-[var(--theme-warning-light)]">
                            <span className="material-symbols-outlined text-[12px]">lock</span>
                            Mentor: {student.mentor_name || 'Menunggu'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--theme-success-light)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--theme-success)] border border-[var(--theme-success-light)]">
                             Tersedia
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!filteredRows.length && (
                    <tr>
                      <td colSpan="5" className="py-16 text-center text-[var(--theme-text-muted)] font-semibold">
                        <span className="material-symbols-outlined text-4xl mb-3 block opacity-50">search_off</span>
                        Tidak ada mahasiswa yang sesuai dengan filter Anda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableStudents;

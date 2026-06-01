import React, { useState, useMemo } from 'react';
import { useMentorAvailableStudentsQuery, useMentorInviteMutation } from '../../../queries/useKencanaMentorQuery';

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
    <div className="p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cari Mahasiswa</h1>
          <p className="text-sm font-semibold text-slate-500">Pilih mahasiswa untuk diundang sebagai bimbingan Anda.</p>
        </div>
        <button 
          onClick={handleInvite}
          disabled={selected.length === 0 || inviteMutation.isPending}
          className="whitespace-nowrap bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          {inviteMutation.isPending ? 'Mengundang...' : `Undang (${selected.length}) Mahasiswa`}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Filters Area */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari NIM, Nama, atau Prodi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-medium"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none font-medium text-slate-700 min-w-[200px]"
          >
            <option value="all">Semua Status Mentor</option>
            <option value="available">Belum Punya Mentor</option>
            <option value="assigned">Sudah Punya Mentor</option>
          </select>

          <select 
            value={fakultasFilter} 
            onChange={(e) => setFakultasFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none font-medium text-slate-700 min-w-[200px]"
          >
            <option value="all">Semua Fakultas</option>
            {uniqueFakultas.map(fak => (
              <option key={fak} value={fak}>{fak}</option>
            ))}
          </select>
        </div>

        {/* Content Area */}
        <div className="p-6 relative">
          {message && <p className="mb-4 rounded-xl bg-violet-50 p-3 text-sm font-bold text-violet-700">{message}</p>}
          
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 w-10"></th>
                  <th className="pb-3 px-4">NIM</th>
                  <th className="pb-3 px-4">Nama Mahasiswa</th>
                  <th className="pb-3 px-4">Fakultas / Prodi</th>
                  <th className="pb-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((student) => (
                  <tr key={student.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors ${student.already_has_mentor ? 'bg-slate-50/40' : ''}`}>
                    <td className="py-4">
                      <input 
                        type="checkbox" 
                        checked={selected.includes(student.id)} 
                        disabled={student.already_has_mentor}
                        onChange={() => toggleSelect(student.id)}
                        className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">{student.nim}</td>
                    <td className="py-4 px-4 text-slate-800 font-bold">{student.nama || student.name}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-slate-600 font-semibold">{student.fakultas || '-'}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase">{student.program_studi || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {student.already_has_mentor ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-700 border border-amber-200/60">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                          Mentor: {student.mentor_name || 'Menunggu'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 border border-emerald-200/60">
                           Tersedia
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {!filteredRows.length && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-500 font-medium">
                      <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      Tidak ada mahasiswa yang sesuai dengan filter Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableStudents;

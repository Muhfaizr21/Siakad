import React, { useState, useMemo } from 'react';
import { useParticipantsQuery } from '../../../queries/useKencanaAdminQuery';

const Participants = () => {
  const { data: participants, isLoading } = useParticipantsQuery();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [fakultasFilter, setFakultasFilter] = useState('all');

  const rows = Array.isArray(participants) ? participants : [];

  // Extract unique fakultas for the dropdown
  const uniqueFakultas = useMemo(() => {
    const list = rows
      .map(r => r.fakultas_name)
      .filter(f => typeof f === 'string' && f.trim() !== '');
    return [...new Set(list)].sort();
  }, [rows]);

  // Client-side filtering
  const filteredRows = useMemo(() => {
    return rows.filter(p => {
      // 1. Search Filter
      const searchLower = searchTerm.toLowerCase();
      const nama = p.nama || '';
      const nim = p.nim || '';
      const prodi = p.program_studi_name || '';
      
      const matchesSearch = !searchTerm || 
        nama.toLowerCase().includes(searchLower) ||
        nim.toLowerCase().includes(searchLower) ||
        prodi.toLowerCase().includes(searchLower);

      // 2. Fakultas Filter
      const fakultasVal = p.fakultas_name;
      let matchesFakultas = true;
      if (fakultasFilter !== 'all') {
        matchesFakultas = fakultasVal === fakultasFilter;
      }

      return matchesSearch && matchesFakultas;
    });
  }, [rows, searchTerm, fakultasFilter]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Data Peserta Orientasi</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Pantau dan cari daftar seluruh mahasiswa baru yang tergabung dalam Kencana.
          </p>
        </div>
        <div className="bg-sky-50 text-sky-700 px-4 py-2 rounded-xl font-black text-sm border border-sky-100">
          Total: {filteredRows.length} Peserta
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Filters Area */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari NIM, Nama, atau Program Studi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-medium outline-none transition-all"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          
          <select 
            value={fakultasFilter} 
            onChange={(e) => setFakultasFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none font-medium text-slate-700 min-w-[220px]"
          >
            <option value="all">Semua Fakultas</option>
            {uniqueFakultas.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-slate-400">
              <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <p className="font-bold">Tidak ada peserta ditemukan.</p>
              {searchTerm && <p className="text-sm mt-1">Coba gunakan kata kunci pencarian yang berbeda.</p>}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">NIM / Akun</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Informasi Mahasiswa</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Prodi & Fakultas</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Mentor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((p) => {
                  const nama = p.nama || '-';
                  const nim = p.nim || '-';
                  const fakultas = p.fakultas_name || '-';
                  const prodi = p.program_studi_name || '-';
                  const email = p.email_kampus || p.email_personal || 'Email belum tersedia';
                  const mentor = p.mentor_name && p.mentor_name !== '-' ? p.mentor_name : 'Menunggu';
                  const hasMentor = mentor !== 'Menunggu';
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm">{nim}</span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{nama}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{email}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-700 text-sm line-clamp-1">{prodi}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1">{fakultas}</p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${hasMentor ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {hasMentor ? (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{mentor}</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{mentor}</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default Participants;

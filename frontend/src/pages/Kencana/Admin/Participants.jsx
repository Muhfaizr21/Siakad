import React, { useState, useMemo } from 'react';
import { useParticipantsQuery, useFakultasListQuery, useProgramStudiListQuery, useGroupsQuery } from '../../../queries/useKencanaAdminQuery';
import useAuthStore from '../../../store/useAuthStore';

const Participants = () => {
  const user = useAuthStore(state => state.user);
  const role = String(user?.role || '').toLowerCase();
  const isFacultyScoped = role === 'kencana_fakultas';
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTermInput, setSearchTermInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fakultasFilter, setFakultasFilter] = useState('all');
  const [programStudiFilter, setProgramStudiFilter] = useState('all');
  const [mentorFilter, setMentorFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');

  const { data: faculties } = useFakultasListQuery();
  const { data: majors } = useProgramStudiListQuery(fakultasFilter);
  const { data: groups } = useGroupsQuery({ scope_type: isFacultyScoped ? 'faculty' : 'all' }, isFacultyScoped ? 'fakultas' : 'admin');

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchTermInput);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTermInput]);

  const { data: resData, isLoading, error } = useParticipantsQuery({ 
    page, 
    limit, 
    search: searchTerm, 
    fakultas_id: isFacultyScoped ? undefined : fakultasFilter,
    program_studi_id: programStudiFilter,
    mentor_status: mentorFilter,
    group_id: groupFilter,
  });
  
  // if useQuery fails completely, data is undefined. But if it succeeds with success: false, it's in resData
  const data = error?.response?.data || resData;
  
  const rows = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta || { current_page: 1, total_pages: 1, total_data: 0 };

  // Note: Extracting unique fakultas from all DB rows is no longer possible client-side 
  // without a separate endpoint, but we can keep standard list or remove if unused.
  // For now, if we want dropdown we should ideally fetch it. But we'll leave it as input or simple text for now, 
  // or use hardcoded faculties if available. 
  // Actually, super admin scope can just type search or we leave it.


  return (
    <div className="md:max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Data Peserta Orientasi</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            {isFacultyScoped ? 'Pantau peserta Kencana khusus fakultas Anda.' : 'Pantau peserta Kencana University dan Kencana Fakultas dari satu halaman.'}
          </p>
        </div>
        <div className="bg-sky-50 text-sky-700 px-4 py-2 rounded-xl font-black text-sm border border-sky-100">
          Total: {meta.total_data} Peserta
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
              value={searchTermInput}
              onChange={(e) => setSearchTermInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-medium outline-none transition-all"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          {!isFacultyScoped && (
            <select 
              value={fakultasFilter} 
              onChange={(e) => {
                setFakultasFilter(e.target.value);
                setProgramStudiFilter('all');
                setPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none font-medium text-slate-700 min-w-[200px]"
            >
              <option value="all">Semua Fakultas</option>
              {faculties?.map(f => (
                <option key={f.id} value={f.id}>{f.nama || f.Nama}</option>
              ))}
            </select>
          )}
          <select 
            value={programStudiFilter} 
            onChange={(e) => {
              setProgramStudiFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none font-medium text-slate-700 min-w-[200px]"
          >
            <option value="all">Semua Program Studi</option>
            {majors?.map(m => (
              <option key={m.id} value={m.id}>{m.nama || m.Nama}</option>
            ))}
          </select>
          <select 
            value={mentorFilter} 
            onChange={(e) => {
              setMentorFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none font-medium text-slate-700 min-w-[180px]"
          >
            <option value="all">Semua Status Mentor</option>
            <option value="assigned">Sudah Ada Mentor</option>
            <option value="unassigned">Belum Ada Mentor</option>
          </select>
          <select 
            value={groupFilter} 
            onChange={(e) => {
              setGroupFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none font-medium text-slate-700 min-w-[180px]"
          >
            <option value="all">Semua Kelompok</option>
            {groups?.map(g => (
              <option key={g.id} value={g.id}>Kelompok {g.group_number || '-'} - {g.name}</option>
            ))}
          </select>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : data && !data.success ? (
            <div className="flex flex-col justify-center items-center h-64 text-red-500">
              <p className="font-bold">Error dari server:</p>
              <p>{data.message || 'Terjadi kesalahan'}</p>
            </div>
          ) : rows.length === 0 ? (
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
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Kelompok</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Mentor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((p) => {
                  const nama = p.nama || '-';
                  const nim = p.nim || '-';
                  const fakultas = p.fakultas_name || '-';
                  const prodi = p.program_studi_name || '-';
                  const email = p.email_kampus || p.email_personal || 'Email belum tersedia';
                  const mentor = p.mentor_name && p.mentor_name !== '-' ? p.mentor_name : 'Menunggu';
                  const hasMentor = mentor !== 'Menunggu';
                  const groupName = p.group_name && p.group_name !== '-' ? p.group_name : 'Belum Ada';
                  
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
                      <td className="py-4 px-6">
                        <div className={`inline-flex flex-col px-3 py-1.5 rounded-xl text-xs font-bold border ${groupName === 'Belum Ada' ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          <span className="uppercase text-[10px] tracking-widest opacity-80">KELOMPOK {p.group_number || '-'}</span>
                          <span className="text-sm">{groupName}</span>
                        </div>
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
        
        {/* Pagination Footer */}
        {!isLoading && meta.total_pages > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">
              Halaman {meta.current_page} dari {meta.total_pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={meta.current_page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Prev
              </button>
              <button
                disabled={meta.current_page >= meta.total_pages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Participants;

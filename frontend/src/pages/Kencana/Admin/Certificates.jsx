import React, { useState, useEffect } from 'react';
import { useCertificatesQuery, usePeriodsQuery, useGenerateCertificateMutation, useGroupsQuery } from '../../../queries/useKencanaAdminQuery';
import useAuthStore from '../../../store/useAuthStore';

const Certificates = () => {
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTermInput, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');

  const user = useAuthStore(state => state.user);
  const isFacultyScoped = String(user?.role || '').toLowerCase() === 'kencana_fakultas';

  const { data: periods } = usePeriodsQuery();
  const { data: groups } = useGroupsQuery({ scope_type: isFacultyScoped ? 'faculty' : 'all' }, isFacultyScoped ? 'fakultas' : 'admin');

  useEffect(() => {
    if (periods?.length && !selectedPeriodId) {
      const active = periods.find(p => p.status === 'active' || p.status === 'published');
      setSelectedPeriodId(active ? String(active.id) : String(periods[0].id));
    }
  }, [periods, selectedPeriodId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchTermInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTermInput]);

  const { data: res, isLoading } = useCertificatesQuery({
    period_id: selectedPeriodId || undefined,
    page,
    limit,
    search: searchTerm,
    group_id: groupFilter !== 'all' ? groupFilter : undefined,
  });
  
  const rows = res?.data || [];
  const meta = res?.meta || { current_page: 1, total_pages: 1, total_data: 0 };

  const generateMut = useGenerateCertificateMutation();

  const handleGenerate = (studentId) => {
    if (!selectedPeriodId) return;
    generateMut.mutate({ period_id: parseInt(selectedPeriodId), student_id: studentId });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Sertifikat Kelulusan</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">Kelola dan pantau sertifikat kelulusan peserta orientasi Kencana.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriodId}
            onChange={e => setSelectedPeriodId(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Pilih Periode...</option>
            {periods?.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari mahasiswa berdasarkan nama atau NIM..."
              value={searchTermInput}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 font-medium outline-none transition-all"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <select 
            value={groupFilter} 
            onChange={e => { setGroupFilter(e.target.value); setPage(1); }} 
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 min-w-[200px] outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          >
            <option value="all">Semua Kelompok</option>
            {groups?.map(group => <option key={group.id} value={group.id}>Kelompok {group.group_number || '-'} - {group.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-slate-400">
              <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="font-bold">Tidak ada sertifikat ditemukan.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Nomor Sertifikat</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Mahasiswa</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Kelompok</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Mentor</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tanggal Terbit</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-sm text-slate-600">{r.certificate_number || '-'}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{r.student?.Nama}</div>
                      <div className="text-xs text-slate-500">{r.student?.NIM}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-700 text-sm">{r.group_name || '-'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-600 text-sm">{r.mentor_name || '-'}</div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-600">{r.issued_at ? new Date(r.issued_at).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="py-4 px-6">
                      {r.file_url ? (
                        <a href={r.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors">
                          <span className="material-symbols-outlined text-[16px]">visibility</span> Lihat
                        </a>
                      ) : (
                        <button 
                          onClick={() => handleGenerate(r.student_id)}
                          disabled={generateMut.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[16px]">print</span>
                          {generateMut.isPending ? 'Mencetak...' : 'Generate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && meta.total_pages > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">
              Halaman {meta.current_page} dari {meta.total_pages} (Total: {meta.total_data})
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

export default Certificates;

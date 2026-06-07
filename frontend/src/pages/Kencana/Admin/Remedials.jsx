import React, { useState, useEffect } from 'react';
import { useRemedialsQuery, usePeriodsQuery } from '../../../queries/useKencanaAdminQuery';

const Remedials = () => {
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTermInput, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: periods } = usePeriodsQuery();

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

  const { data: res, isLoading } = useRemedialsQuery(
    selectedPeriodId ? { period_id: selectedPeriodId, page, limit, search: searchTerm } : { page, limit, search: searchTerm }
  );
  
  const rows = res?.data || [];
  const meta = res?.meta || { current_page: 1, total_pages: 1, total_data: 0 };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Program Remedial</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">Kelola data peserta yang harus mengikuti perbaikan nilai.</p>
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
        </div>

        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-slate-400">
              <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <p className="font-bold">Tidak ada data remedial ditemukan.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">NIM / Nama</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Prodi & Fakultas</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{r.student?.Nama || r.student?.nama || '-'}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{r.student?.NIM || r.student?.nim || '-'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-700 text-sm">{r.student?.program_studi?.nama || r.student?.ProgramStudi?.Nama || '-'}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{r.student?.fakultas?.nama || r.student?.Fakultas?.Nama || '-'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold uppercase">{r.status || 'Remedial'}</span>
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

export default Remedials;

import React, { useState, useEffect } from 'react';
import { useRemedialsQuery, usePeriodsQuery } from '../../../queries/useKencanaAdminQuery';
import { PageHeader } from '../../../components/ui/page/PageHeader';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';

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
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-body max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <PageHeader
        icon="assignment_late"
        title={
          <>
            <span className="text-[var(--theme-text)]">Program </span>
            <span className="text-[var(--theme-primary)]">Remedial</span>
          </>
        }
        subtitle="Pantau dan kelola data peserta orientasi yang harus mengikuti program perbaikan nilai."
        breadcrumbs={[
          { label: 'Kencana Admin', path: '#' },
          { label: 'Remedial' }
        ]}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--theme-text-muted)] whitespace-nowrap">Periode:</span>
            <SelectField
              value={selectedPeriodId}
              onValueChange={setSelectedPeriodId}
              placeholder="Pilih Periode..."
              className="min-w-[160px]"
            >
              {periods?.map(p => (
                <SelectOption key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectOption>
              ))}
            </SelectField>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-5 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)] flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari mahasiswa berdasarkan nama atau NIM..."
              value={searchTermInput}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-white border border-[var(--theme-border)] rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all"
            />
            <svg className="w-4 h-4 text-[var(--theme-text-subtle)] absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-[var(--theme-surface)]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-[var(--theme-text-subtle)] bg-[var(--theme-surface)]">
              <svg className="w-12 h-12 mb-4 text-[var(--theme-text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <p className="font-bold text-sm text-[var(--theme-text)]">Tidak ada data remedial ditemukan.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse bg-[var(--theme-surface)]">
              <thead>
                <tr className="border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
                  <th className="py-3.5 px-6 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider whitespace-nowrap">NIM / Nama</th>
                  <th className="py-3.5 px-6 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider whitespace-nowrap">Prodi & Fakultas</th>
                  <th className="py-3.5 px-6 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border-muted)] text-sm font-semibold">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--theme-bg)] transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-[var(--theme-text)]">{r.student?.Nama || r.student?.nama || '-'}</p>
                      <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-0.5">NIM: {r.student?.NIM || r.student?.nim || '-'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-[var(--theme-text)] text-sm">{r.student?.program_studi?.nama || r.student?.ProgramStudi?.Nama || '-'}</p>
                      <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-0.5">{r.student?.fakultas?.nama || r.student?.Fakultas?.Nama || '-'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-3 py-1 bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border border-[var(--theme-warning-light)] rounded-lg text-xs font-bold uppercase tracking-wider">
                        {r.status || 'Remedial'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && meta.total_pages > 0 && (
          <div className="p-4 border-t border-[var(--theme-border-muted)] bg-[var(--theme-bg)] flex items-center justify-between">
            <span className="text-sm text-[var(--theme-text-muted)] font-semibold">
              Halaman {meta.current_page} dari {meta.total_pages} (Total: {meta.total_data})
            </span>
            <div className="flex gap-2">
              <button
                disabled={meta.current_page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border border-[var(--theme-border)] bg-white text-[var(--theme-text-muted)] rounded-xl text-xs font-bold hover:bg-[var(--theme-bg)] disabled:opacity-50 transition-colors"
              >
                Prev
              </button>
              <button
                disabled={meta.current_page >= meta.total_pages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-[var(--theme-border)] bg-white text-[var(--theme-text-muted)] rounded-xl text-xs font-bold hover:bg-[var(--theme-bg)] disabled:opacity-50 transition-colors"
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

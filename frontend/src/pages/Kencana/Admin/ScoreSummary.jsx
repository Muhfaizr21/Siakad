import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/axios';
import { usePeriodsQuery } from '../../../queries/useKencanaAdminQuery';
import { PageHeader } from '../../../components/ui/page/PageHeader';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';

const unwrap = (res) => res.data;

const useScoreSummaryQuery = (periodId) => useQuery({
  queryKey: ['kencana-admin', 'scores-summary', periodId],
  queryFn: async () => unwrap(await api.get('/kencana-admin/scores/summary', { params: { period_id: periodId } })),
  enabled: !!periodId,
});

const pct = (val, total) => total > 0 ? Math.round((val / total) * 100) : 0;

const ScoreSummary = () => {
  const navigate = useNavigate();
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const { data: periods } = usePeriodsQuery();

  const [groupSearch, setGroupSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'group_number', direction: 'asc' });

  useEffect(() => {
    if (periods?.length && !selectedPeriodId) {
      const active = periods.find(p => p.status === 'active' || p.status === 'published');
      setSelectedPeriodId(active ? String(active.id) : String(periods[0].id));
    }
  }, [periods, selectedPeriodId]);

  const { data: res, isLoading } = useScoreSummaryQuery(selectedPeriodId);
  const rawRows = res?.data || [];
  const totals = res?.totals || {};

  const sortedAndFilteredRows = useMemo(() => {
    // 1. Filter
    let filtered = [...rawRows];
    if (groupSearch.trim()) {
      const q = groupSearch.toLowerCase();
      filtered = rawRows.filter(r => 
        (r.group_name && r.group_name.toLowerCase().includes(q)) || 
        (r.fakultas_name && r.fakultas_name.toLowerCase().includes(q))
      );
    }
    
    // 2. Sort
    const { key, direction } = sortConfig;
    filtered.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      // Handle strings
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [rawRows, groupSearch, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' }; // default desc for numbers
    });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="material-symbols-outlined text-[14px] text-[var(--theme-text-subtle)] opacity-0 group-hover:opacity-100 transition-opacity">unfold_more</span>;
    }
    return (
      <span className="material-symbols-outlined text-[14px] text-[var(--theme-primary)]">
        {sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    );
  };

  const Th = ({ label, columnKey, className = "" }) => (
    <th 
      className={`py-3 px-4 text-xs font-bold text-[var(--theme-text-muted)] cursor-pointer select-none group hover:bg-[var(--theme-bg)] transition-colors ${className}`}
      onClick={() => handleSort(columnKey)}
    >
      <div className={`flex items-center gap-1 ${className.includes('text-center') ? 'justify-center' : ''}`}>
        {label}
        <SortIcon columnKey={columnKey} />
      </div>
    </th>
  );

  return (
    <div className="bg-transparent font-body max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <PageHeader
        icon="summarize"
        title={
          <>
            <span className="text-[var(--theme-text)]">Rekap Kencana </span>
            <span className="text-[var(--theme-primary)]">Universitas</span>
          </>
        }
        subtitle="Ringkasan kelulusan seluruh peserta Kencana Universitas per kelompok pembimbingan."
        breadcrumbs={[
          { label: 'Kencana Admin', path: '#' },
          { label: 'Rekap Universitas' }
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
                <SelectOption key={p.id} value={String(p.id)}>{p.name}</SelectOption>
              ))}
            </SelectField>
          </div>
        }
      />

      {/* Stats Cards - Clean UI */}
      {!isLoading && totals.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Lulus', value: totals.lulus, pct: pct(totals.lulus, totals.total), theme: 'success' },
            { label: 'Lulus Bersyarat', value: totals.bersyarat, pct: pct(totals.bersyarat, totals.total), theme: 'warning' },
            { label: 'Tidak Lulus', value: totals.tidak_lulus, pct: pct(totals.tidak_lulus, totals.total), theme: 'error' },
            { label: 'Belum Lengkap', value: totals.belum_mulai, pct: pct(totals.belum_mulai, totals.total), theme: 'subtle' },
            { label: 'Keluar', value: totals.keluar, pct: pct(totals.keluar, totals.total), theme: 'subtle' },
            { label: 'Total Peserta', value: totals.total, pct: 100, theme: 'primary' },
          ].map(card => {
            const colors = {
              success: 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success-light)]',
              warning: 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning-light)]',
              error: 'bg-[var(--theme-error-light)] text-[var(--theme-error)] border-[var(--theme-error-light)]',
              primary: 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border-[var(--theme-primary-light)]',
              subtle: 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border-[var(--theme-border)]'
            };
            return (
              <div key={card.label} className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-center ${colors[card.theme] || colors.subtle}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-90">{card.label}</p>
                <div className="flex items-end gap-1.5">
                  <p className="text-2xl font-bold">{card.value ?? 0}</p>
                  {card.label !== 'Total Peserta' && (
                    <p className="text-xs font-semibold opacity-70 mb-0.5">({card.pct}%)</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-[var(--theme-text)]">Detail Per Kelompok</h2>
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-subtle)] text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Cari kelompok..." 
              value={groupSearch}
              onChange={e => setGroupSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-10 text-sm bg-white border border-[var(--theme-border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] font-semibold"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-[var(--theme-surface)]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
          </div>
        ) : sortedAndFilteredRows.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-[var(--theme-text-subtle)] bg-[var(--theme-surface)]">
            <span className="material-symbols-outlined text-4xl mb-3 text-[var(--theme-text-subtle)]">inbox</span>
            <p className="font-semibold text-sm">Data kelompok tidak ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-[var(--theme-surface)]">
              <thead>
                <tr className="border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
                  <th className="py-3 px-4 text-xs font-bold text-[var(--theme-text-subtle)] text-center w-14">No</th>
                  <Th label="Kelompok" columnKey="group_name" />
                  <Th label="Lulus" columnKey="lulus" className="text-center" />
                  <Th label="Tdk Lulus" columnKey="tidak_lulus" className="text-center" />
                  <Th label="Bersyarat" columnKey="bersyarat" className="text-center" />
                  <Th label="Belum Lengkap" columnKey="belum_mulai" className="text-center" />
                  <Th label="Keluar" columnKey="keluar" className="text-center" />
                  <Th label="Total" columnKey="total" className="text-center" />
                  <th className="py-3 px-4 text-xs font-bold text-[var(--theme-text-subtle)] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border-muted)] text-sm font-semibold">
                {sortedAndFilteredRows.map((row, idx) => (
                  <tr key={row.group_id} className="hover:bg-[var(--theme-bg)] transition-colors">
                    <td className="py-3 px-4 text-center text-xs text-[var(--theme-text-muted)]">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-[var(--theme-text)] text-sm">{row.group_name}</p>
                      {row.fakultas_name && (
                        <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">{row.fakultas_name}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-sm font-medium text-[var(--theme-text)]">{row.lulus || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm font-medium text-[var(--theme-text)]">{row.tidak_lulus || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm font-medium text-[var(--theme-text)]">{row.bersyarat || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm font-medium text-[var(--theme-text)]">{row.belum_mulai || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm font-medium text-[var(--theme-text)]">{row.keluar || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm font-bold text-[var(--theme-primary)]">{row.total}</td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => navigate(`/kencana-admin/scores?group_id=${row.group_id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[var(--theme-text-muted)] bg-white border border-[var(--theme-border)] rounded-lg hover:bg-[var(--theme-bg)] hover:text-[var(--theme-text)] transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Totals Row */}
              {totals.total > 0 && !groupSearch && (
                <tfoot>
                  <tr className="border-t-2 border-[var(--theme-border)] bg-[var(--theme-bg)] font-bold">
                    <td className="py-4 px-4 text-center text-sm text-[var(--theme-text)]" colSpan={2}>TOTAL</td>
                    <td className="py-4 px-4 text-center text-[var(--theme-text)] text-sm">{totals.lulus ?? 0}</td>
                    <td className="py-4 px-4 text-center text-[var(--theme-text)] text-sm">{totals.tidak_lulus ?? 0}</td>
                    <td className="py-4 px-4 text-center text-[var(--theme-text)] text-sm">{totals.bersyarat ?? 0}</td>
                    <td className="py-4 px-4 text-center text-[var(--theme-text)] text-sm">{totals.belum_mulai ?? 0}</td>
                    <td className="py-4 px-4 text-center text-[var(--theme-text)] text-sm">{totals.keluar ?? 0}</td>
                    <td className="py-4 px-4 text-center text-[var(--theme-primary)] text-sm">{totals.total ?? 0}</td>
                    <td></td>
                  </tr>
                  <tr className="bg-[var(--theme-bg)]/50 border-t border-[var(--theme-border-muted)]">
                    <td className="py-2 px-4 text-center text-xs text-[var(--theme-text-muted)] font-semibold" colSpan={2}>Persentase</td>
                    <td className="py-2 px-4 text-center text-xs text-[var(--theme-text-muted)] font-semibold">{pct(totals.lulus, totals.total)}%</td>
                    <td className="py-2 px-4 text-center text-xs text-[var(--theme-text-muted)] font-semibold">{pct(totals.tidak_lulus, totals.total)}%</td>
                    <td className="py-2 px-4 text-center text-xs text-[var(--theme-text-muted)] font-semibold">{pct(totals.bersyarat, totals.total)}%</td>
                    <td className="py-2 px-4 text-center text-xs text-[var(--theme-text-muted)] font-semibold">{pct(totals.belum_mulai, totals.total)}%</td>
                    <td className="py-2 px-4 text-center text-xs text-[var(--theme-text-muted)] font-semibold">{pct(totals.keluar, totals.total)}%</td>
                    <td className="py-2 px-4 text-center text-xs text-[var(--theme-text-muted)] font-semibold">100%</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreSummary;

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/axios';
import { usePeriodsQuery } from '../../../queries/useKencanaAdminQuery';

const unwrap = (res) => res.data;

const useScoreSummaryQuery = (periodId) => useQuery({
  queryKey: ['kencana-admin', 'scores-summary', periodId],
  queryFn: async () => unwrap(await api.get('/kencana-admin/scores/summary', { params: { period_id: periodId } })),
  enabled: !!periodId,
});

const pct = (val, total) => total > 0 ? Math.round((val / total) * 100) : 0;

const ScoreSummary = () => {
  const navigate = useNavigate();
  const basePath = window.location.pathname.startsWith('/admin/kencana-univ') ? '/admin/kencana-univ' : window.location.pathname.startsWith('/admin/kencana-fakultas-admin') ? '/admin/kencana-fakultas-admin' : window.location.pathname.startsWith('/kencana-fakultas') ? '/kencana-fakultas' : window.location.pathname.startsWith('/kencana-fakult') ? '/kencana-fakult' : '/kencana-admin';
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
    let filtered = rawRows;
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
      return { key, direction: 'desc' }; // default desc for numbers, but we handle logic
    });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="material-symbols-outlined text-[14px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">unfold_more</span>;
    }
    return (
      <span className="material-symbols-outlined text-[14px] text-slate-600">
        {sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    );
  };

  const Th = ({ label, columnKey, className = "" }) => (
    <th 
      className={`py-3 px-4 text-xs font-bold text-slate-600 cursor-pointer select-none group hover:bg-slate-100 transition-colors ${className}`}
      onClick={() => handleSort(columnKey)}
    >
      <div className={`flex items-center gap-1 ${className.includes('text-center') ? 'justify-center' : ''}`}>
        {label}
        <SortIcon columnKey={columnKey} />
      </div>
    </th>
  );

  return (
    <div className="md:max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Rekap Kencana Universitas</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan kelulusan seluruh peserta Kencana Universitas per kelompok.</p>
        </div>
        <select
          value={selectedPeriodId}
          onChange={e => setSelectedPeriodId(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="">Pilih Periode...</option>
          {periods?.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards - Clean UI */}
      {!isLoading && totals.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: 'Lulus', value: totals.lulus, pct: pct(totals.lulus, totals.total) },
            { label: 'Lulus Bersyarat', value: totals.bersyarat, pct: pct(totals.bersyarat, totals.total) },
            { label: 'Tidak Lulus', value: totals.tidak_lulus, pct: pct(totals.tidak_lulus, totals.total) },
            { label: 'Belum Lengkap', value: totals.belum_mulai, pct: pct(totals.belum_mulai, totals.total) },
            { label: 'Keluar', value: totals.keluar, pct: pct(totals.keluar, totals.total) },
            { label: 'Total Peserta', value: totals.total, pct: 100 },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{card.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-slate-800">{card.value ?? 0}</p>
                {card.label !== 'Total Peserta' && (
                  <p className="text-sm font-medium text-slate-400 mb-0.5">({card.pct}%)</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-slate-700">Detail Per Kelompok</h2>
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Cari kelompok..." 
              value={groupSearch}
              onChange={e => setGroupSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
          </div>
        ) : sortedAndFilteredRows.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-3">inbox</span>
            <p className="font-medium">Data kelompok tidak ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 text-center w-14">No</th>
                  <Th label="Kelompok" columnKey="group_name" />
                  <Th label="Lulus" columnKey="lulus" className="text-center" />
                  <Th label="Tdk Lulus" columnKey="tidak_lulus" className="text-center" />
                  <Th label="Bersyarat" columnKey="bersyarat" className="text-center" />
                  <Th label="Belum Lengkap" columnKey="belum_mulai" className="text-center" />
                  <Th label="Keluar" columnKey="keluar" className="text-center" />
                  <Th label="Total" columnKey="total" className="text-center" />
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedAndFilteredRows.map((row, idx) => (
                  <tr key={row.group_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center text-sm text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-700 text-sm">{row.group_name}</p>
                      {row.fakultas_name && (
                        <p className="text-xs text-slate-500 mt-0.5">{row.fakultas_name}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-sm font-medium text-slate-700">{row.lulus || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm font-medium text-slate-700">{row.tidak_lulus || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm font-medium text-slate-700">{row.bersyarat || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm font-medium text-slate-700">{row.belum_mulai || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm font-medium text-slate-700">{row.keluar || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm font-bold text-slate-800">{row.total}</td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => navigate(`${basePath}/scores?group_id=${row.group_id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
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
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                    <td className="py-4 px-4 text-center text-sm text-slate-600" colSpan={2}>TOTAL</td>
                    <td className="py-4 px-4 text-center text-slate-800 text-sm">{totals.lulus ?? 0}</td>
                    <td className="py-4 px-4 text-center text-slate-800 text-sm">{totals.tidak_lulus ?? 0}</td>
                    <td className="py-4 px-4 text-center text-slate-800 text-sm">{totals.bersyarat ?? 0}</td>
                    <td className="py-4 px-4 text-center text-slate-800 text-sm">{totals.belum_mulai ?? 0}</td>
                    <td className="py-4 px-4 text-center text-slate-800 text-sm">{totals.keluar ?? 0}</td>
                    <td className="py-4 px-4 text-center text-slate-900 text-sm">{totals.total ?? 0}</td>
                    <td></td>
                  </tr>
                  <tr className="bg-slate-100/50 border-t border-slate-200">
                    <td className="py-2 px-4 text-center text-xs text-slate-500 font-semibold" colSpan={2}>Persentase</td>
                    <td className="py-2 px-4 text-center text-xs text-slate-600 font-semibold">{pct(totals.lulus, totals.total)}%</td>
                    <td className="py-2 px-4 text-center text-xs text-slate-600 font-semibold">{pct(totals.tidak_lulus, totals.total)}%</td>
                    <td className="py-2 px-4 text-center text-xs text-slate-600 font-semibold">{pct(totals.bersyarat, totals.total)}%</td>
                    <td className="py-2 px-4 text-center text-xs text-slate-600 font-semibold">{pct(totals.belum_mulai, totals.total)}%</td>
                    <td className="py-2 px-4 text-center text-xs text-slate-600 font-semibold">{pct(totals.keluar, totals.total)}%</td>
                    <td className="py-2 px-4 text-center text-xs text-slate-600 font-semibold">100%</td>
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

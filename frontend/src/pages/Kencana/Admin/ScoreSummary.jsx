import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/axios';
import { usePeriodsQuery } from '../../../queries/useKencanaAdminQuery';
import { DashboardHero } from '@/components/ui/dashboard';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent } from '@/components/ui/Card';
import { TitleSubtitleCell, ActionButton } from '@/components/ui/TableCells';

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

  useEffect(() => {
    if (periods?.length && !selectedPeriodId) {
      const active = periods.find(p => p.status === 'active' || p.status === 'published');
      setSelectedPeriodId(active ? String(active.id) : String(periods[0].id));
    }
  }, [periods, selectedPeriodId]);

  const { data: res, isLoading } = useScoreSummaryQuery(selectedPeriodId);
  const rawRows = res?.data || [];
  const totals = res?.totals || {};

  const columns = [
    {
      key: 'no',
      label: 'No',
      className: 'w-14 text-center',
      cellClassName: 'text-center text-[var(--theme-text-muted)]',
      render: (v, r, idx) => idx + 1
    },
    {
      key: 'group_name',
      label: 'Kelompok',
      sortable: true,
      render: (v, row) => <TitleSubtitleCell title={row.group_name} subtitle={row.fakultas_name} />
    },
    {
      key: 'lulus',
      label: 'Lulus',
      sortable: true,
      className: 'text-center',
      cellClassName: 'text-center font-medium',
      render: v => v || '-'
    },
    {
      key: 'tidak_lulus',
      label: 'Tdk Lulus',
      sortable: true,
      className: 'text-center',
      cellClassName: 'text-center font-medium',
      render: v => v || '-'
    },
    {
      key: 'bersyarat',
      label: 'Bersyarat',
      sortable: true,
      className: 'text-center',
      cellClassName: 'text-center font-medium',
      render: v => v || '-'
    },
    {
      key: 'belum_mulai',
      label: 'Belum Lengkap',
      sortable: true,
      className: 'text-center',
      cellClassName: 'text-center font-medium',
      render: v => v || '-'
    },
    {
      key: 'keluar',
      label: 'Keluar',
      sortable: true,
      className: 'text-center',
      cellClassName: 'text-center font-medium',
      render: v => v || '-'
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      className: 'text-center',
      cellClassName: 'text-center font-bold text-[var(--theme-primary)]'
    },
    {
      key: 'actions',
      label: 'Aksi',
      className: 'text-center',
      cellClassName: 'text-center',
      render: (v, row) => (
        <div className="flex justify-center">
          <ActionButton 
            icon="visibility" 
            label="Detail" 
            onClick={() => navigate(`/admin/kencana-univ/scores?group_id=${row.group_id}`)} 
          />
        </div>
      )
    }
  ];

  const tableFooter = totals.total > 0 ? (
    <tfoot>
      <tr className="border-t-2 border-[var(--theme-border)] bg-[var(--theme-bg)] font-bold">
        <td className="py-4 px-6 text-center text-sm text-[var(--theme-text)]" colSpan={2}>TOTAL</td>
        <td className="py-4 px-6 text-center text-[var(--theme-text)] text-sm">{totals.lulus ?? 0}</td>
        <td className="py-4 px-6 text-center text-[var(--theme-text)] text-sm">{totals.tidak_lulus ?? 0}</td>
        <td className="py-4 px-6 text-center text-[var(--theme-text)] text-sm">{totals.bersyarat ?? 0}</td>
        <td className="py-4 px-6 text-center text-[var(--theme-text)] text-sm">{totals.belum_mulai ?? 0}</td>
        <td className="py-4 px-6 text-center text-[var(--theme-text)] text-sm">{totals.keluar ?? 0}</td>
        <td className="py-4 px-6 text-center text-[var(--theme-primary)] text-sm">{totals.total ?? 0}</td>
        <td></td>
      </tr>
      <tr className="bg-[var(--theme-bg)]/50 border-t border-[var(--theme-border-muted)]">
        <td className="py-3 px-6 text-center text-xs text-[var(--theme-text-muted)] font-semibold" colSpan={2}>Persentase</td>
        <td className="py-3 px-6 text-center text-xs text-[var(--theme-text-muted)] font-semibold">{pct(totals.lulus, totals.total)}%</td>
        <td className="py-3 px-6 text-center text-xs text-[var(--theme-text-muted)] font-semibold">{pct(totals.tidak_lulus, totals.total)}%</td>
        <td className="py-3 px-6 text-center text-xs text-[var(--theme-text-muted)] font-semibold">{pct(totals.bersyarat, totals.total)}%</td>
        <td className="py-3 px-6 text-center text-xs text-[var(--theme-text-muted)] font-semibold">{pct(totals.belum_mulai, totals.total)}%</td>
        <td className="py-3 px-6 text-center text-xs text-[var(--theme-text-muted)] font-semibold">{pct(totals.keluar, totals.total)}%</td>
        <td className="py-3 px-6 text-center text-xs text-[var(--theme-text-muted)] font-semibold">100%</td>
        <td></td>
      </tr>
    </tfoot>
  ) : null;

  return (
    <div className="bg-transparent font-body max-w-7xl mx-auto space-y-6">
      <DashboardHero
        title="Rekap Kencana"
        highlightedTitle="Universitas"
        subtitle="Ringkasan kelulusan seluruh peserta Kencana Universitas per kelompok pembimbingan."
        icon="summarize"
        badges={[
          { label: 'Kencana Admin', active: false },
          { label: 'Rekap Universitas', active: true }
        ]}
        actions={
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-md">
            <span className="text-xs font-bold text-white whitespace-nowrap">Periode:</span>
            <SelectField
              value={selectedPeriodId}
              onValueChange={setSelectedPeriodId}
              placeholder="Pilih Periode..."
              className="min-w-[160px] h-8 bg-white/90 border-0"
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
      <Card className="glass-card shadow-sm rounded-xl overflow-hidden border-slate-100/60">
        <div className="p-5 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-[var(--theme-text)]">Detail Per Kelompok</h2>
        </div>
        
        <CardContent className="p-0 border-none shadow-none bg-transparent">
          <DataTable
            columns={columns}
            data={rawRows}
            loading={isLoading}
            searchable={true}
            searchPlaceholder="Cari kelompok..."
            pagination={true}
            pageSize={10}
            emptyMessage="Data kelompok tidak ditemukan."
            emptyIcon="inbox"
            tableFooter={tableFooter}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreSummary;

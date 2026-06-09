import React, { useState, useEffect } from 'react';
import { useCertificatesQuery, usePeriodsQuery, useGenerateCertificateMutation, useGroupsQuery } from '../../../queries/useKencanaAdminQuery';
import useAuthStore from '../../../store/useAuthStore';
import { DashboardHero } from '@/components/ui/dashboard';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent } from '@/components/ui/Card';
import { UserInfoCell } from '@/components/ui/TableCells';

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

  const columns = [
    {
      key: 'certificate_number',
      label: 'Nomor Sertifikat',
      cellClassName: 'font-mono text-sm text-[var(--theme-text-muted)]',
      render: (v) => v || '-'
    },
    {
      key: 'student',
      label: 'Mahasiswa',
      render: (v, r) => <UserInfoCell name={r.student?.Nama} subtitle={`NIM: ${r.student?.NIM}`} avatarUrl={r.student?.FotoURL || r.student?.foto_url || r.student?.Foto || r.student?.foto} />
    },
    {
      key: 'group_name',
      label: 'Kelompok',
      cellClassName: 'text-sm font-semibold text-[var(--theme-text-muted)]',
      render: (v) => v || '-'
    },
    {
      key: 'mentor_name',
      label: 'Mentor',
      cellClassName: 'text-sm font-semibold text-[var(--theme-text-muted)]',
      render: (v) => v || '-'
    },
    {
      key: 'issued_at',
      label: 'Tanggal Terbit',
      cellClassName: 'text-sm font-semibold text-[var(--theme-text-muted)]',
      render: (v) => v ? new Date(v).toLocaleDateString('id-ID') : '-'
    },
    {
      key: 'actions',
      label: 'Aksi',
      sortable: false,
      render: (v, r) => r.file_url ? (
        <a href={r.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--theme-primary-light)] text-[var(--theme-primary)] font-bold text-xs hover:bg-[var(--theme-primary-light)]/80 transition-colors">
          <span className="material-symbols-outlined text-[16px]">visibility</span> Lihat
        </a>
      ) : (
        <button 
          onClick={() => handleGenerate(r.student_id)}
          disabled={generateMut.isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--theme-success-light)] text-[var(--theme-success)] font-bold text-xs hover:bg-[var(--theme-success-light)]/80 transition-colors disabled:opacity-50 cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-[16px]">print</span>
          {generateMut.isPending ? 'Mencetak...' : 'Generate'}
        </button>
      )
    }
  ];

  return (
    <div className="bg-transparent font-body max-w-7xl mx-auto space-y-6">
      <DashboardHero
        title="Sertifikat"
        highlightedTitle="Kelulusan"
        subtitle="Unduh atau buat ulang sertifikat kelulusan peserta orientasi Kencana yang telah memenuhi kriteria kelulusan."
        icon="workspace_premium"
        badges={[
          { label: 'Kencana Admin', active: false },
          { label: 'Sertifikat', active: true }
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
                <SelectOption key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectOption>
              ))}
            </SelectField>
          </div>
        }
      />

      <Card className="glass-card shadow-sm rounded-xl overflow-hidden border-slate-100/60">
        <CardContent className="p-0 border-none shadow-none bg-transparent">
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            searchable={true}
            searchPlaceholder="Cari berdasarkan nama atau sertifikat..."
            serverPagination={true}
            totalData={meta.total_data}
            currentPage={meta.current_page}
            onPageChange={setPage}
            onSearchChange={setSearchQuery}
            emptyMessage="Tidak ada sertifikat ditemukan."
            emptyIcon="workspace_premium"
            actions={
              <SelectField 
                value={groupFilter} 
                onValueChange={val => { setGroupFilter(val); setPage(1); }} 
                placeholder="Semua Kelompok"
                className="w-full sm:w-48 h-9 text-xs rounded-lg border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none"
              >
                <SelectOption value="all">Semua Kelompok</SelectOption>
                {groups?.map(group => (
                  <SelectOption key={group.id} value={String(group.id)}>
                    Kelompok {group.group_number || '-'} - {group.name}
                  </SelectOption>
                ))}
              </SelectField>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Certificates;

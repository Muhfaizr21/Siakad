import React, { useState, useMemo } from 'react';
import { useParticipantsQuery, useFakultasListQuery, useProgramStudiListQuery, useGroupsQuery } from '../../../queries/useKencanaAdminQuery';
import useAuthStore from '../../../store/useAuthStore';
import { DashboardHero } from '@/components/ui/dashboard';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent } from '@/components/ui/Card';
import { UserInfoCell, TitleSubtitleCell, PillBadgeCell } from '@/components/ui/TableCells';

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
  
  const data = error?.response?.data || resData;
  const rows = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta || { current_page: 1, total_pages: 1, total_data: 0 };

  const columns = [
    {
      key: 'nama',
      label: 'Informasi Mahasiswa',
      render: (v, p) => <UserInfoCell name={p.nama || '-'} subtitle={p.nim || p.email_kampus || p.email_personal || '-'} avatarUrl={p.foto_url || p.foto} />
    },
    {
      key: 'prodi',
      label: 'Prodi & Fakultas',
      render: (v, p) => <TitleSubtitleCell title={p.program_studi_name} subtitle={p.fakultas_name} />
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (v, p) => (
        <span className="text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
          {p.jenis_kelamin || p.JenisKelamin || '-'}
        </span>
      )
    },
    {
      key: 'kontak',
      label: 'Kontak',
      render: (v, p) => <TitleSubtitleCell title={p.telepon || p.Telepon || p.no_hp || '-'} subtitle={p.email_kampus || p.email_personal || p.email || '-'} />
    },
    {
      key: 'group_name',
      label: 'Kelompok',
      render: (v, p) => {
        const groupName = p.group_name && p.group_name !== '-' ? p.group_name : 'Belum Ada';
        return <PillBadgeCell title={groupName} subtitle={`KELOMPOK ${p.group_number || '-'}`} active={groupName !== 'Belum Ada'} />;
      }
    },
    {
      key: 'mentor_name',
      label: 'Mentor',
      className: 'text-right',
      render: (v, p) => {
        const mentor = p.mentor_name && p.mentor_name !== '-' ? p.mentor_name : 'Menunggu';
        const hasMentor = mentor !== 'Menunggu';
        return (
          <div className="flex justify-end">
            <PillBadgeCell title={mentor} icon={hasMentor ? 'verified' : 'pending'} active={hasMentor} />
          </div>
        );
      }
    }
  ];

  return (
    <div className="bg-transparent font-body max-w-7xl mx-auto space-y-6">
      <DashboardHero
        title="Data Peserta"
        highlightedTitle="Orientasi"
        subtitle={isFacultyScoped ? 'Pantau peserta Kencana khusus fakultas Anda.' : 'Pantau peserta Kencana University dan Kencana Fakultas dari satu halaman.'}
        icon="school"
        badges={[
          { label: 'Kencana Admin', active: false },
          { label: 'Peserta Orientasi', active: true }
        ]}
        actions={
          <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] px-4 py-2 rounded-xl text-center shrink-0">
            <p className="text-[9px] font-bold text-[var(--theme-secondary)] uppercase tracking-wider">Total Peserta</p>
            <p className="text-sm font-bold text-[var(--theme-text)] mt-0.5">
              {meta.total_data} Orang
            </p>
          </div>
        }
      />

      <div>
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            searchable={true}
            searchPlaceholder="Cari berdasarkan nama, NIM, email, dsb..."
            serverPagination={true}
            totalData={meta.total_data}
            currentPage={meta.current_page}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            onSearchChange={setSearchTermInput}
            emptyMessage="Tidak ada data mahasiswa orientasi Kencana yang ditemukan."
            emptyIcon="groups"
            actions={
              <div className="flex flex-wrap items-center gap-2">
                {!isFacultyScoped && (
                  <SelectField 
                    value={fakultasFilter} 
                    onValueChange={(val) => {
                      setFakultasFilter(val);
                      setProgramStudiFilter('all');
                      setPage(1);
                    }}
                    placeholder="Semua Fakultas"
                    className="min-w-[160px] h-9 text-xs rounded-lg border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none hidden md:flex"
                  >
                    <SelectOption value="all">Semua Fakultas</SelectOption>
                    {faculties?.map(f => (
                      <SelectOption key={f.id} value={String(f.id)}>{f.nama || f.Nama}</SelectOption>
                    ))}
                  </SelectField>
                )}
                <SelectField 
                  value={programStudiFilter} 
                  onValueChange={(val) => {
                    setProgramStudiFilter(val);
                    setPage(1);
                  }}
                  placeholder="Semua Prodi"
                  className="min-w-[160px] h-9 text-xs rounded-lg border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none hidden lg:flex"
                >
                  <SelectOption value="all">Semua Prodi</SelectOption>
                  {majors?.map(m => (
                    <SelectOption key={m.id} value={String(m.id)}>{m.nama || m.Nama}</SelectOption>
                  ))}
                </SelectField>
                <SelectField 
                  value={mentorFilter} 
                  onValueChange={(val) => {
                    setMentorFilter(val);
                    setPage(1);
                  }}
                  placeholder="Status Mentor"
                  className="min-w-[140px] h-9 text-xs rounded-lg border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none flex"
                >
                  <SelectOption value="all">Status Mentor</SelectOption>
                  <SelectOption value="assigned">Sudah Ada</SelectOption>
                  <SelectOption value="unassigned">Belum Ada</SelectOption>
                </SelectField>
                <SelectField 
                  value={groupFilter} 
                  onValueChange={(val) => {
                    setGroupFilter(val);
                    setPage(1);
                  }}
                  placeholder="Kelompok"
                  className="min-w-[140px] h-9 text-xs rounded-lg border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none flex"
                >
                  <SelectOption value="all">Kelompok</SelectOption>
                  {groups?.map(g => (
                    <SelectOption key={g.id} value={String(g.id)}>Kelompok {g.group_number || '-'} - {g.name}</SelectOption>
                  ))}
                </SelectField>
              </div>
            }
          />
      </div>
    </div>
  );
};

export default Participants;

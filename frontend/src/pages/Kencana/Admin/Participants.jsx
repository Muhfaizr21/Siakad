import React, { useState, useMemo } from 'react';
import { useParticipantsQuery, useFakultasListQuery, useProgramStudiListQuery, useGroupsQuery } from '../../../queries/useKencanaAdminQuery';
import useAuthStore from '../../../store/useAuthStore';
import { PageHeader } from '../../../components/ui/page/PageHeader';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';

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

  return (
    <div className="bg-transparent font-body max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <PageHeader
        icon="school"
        title={
          <>
            <span className="text-[var(--theme-text)]">Data Peserta </span>
            <span className="text-[var(--theme-primary)]">Orientasi</span>
          </>
        }
        subtitle={isFacultyScoped ? 'Pantau peserta Kencana khusus fakultas Anda.' : 'Pantau peserta Kencana University dan Kencana Fakultas dari satu halaman.'}
        breadcrumbs={[
          { label: 'Kencana Admin', path: '#' },
          { label: 'Peserta Orientasi' }
        ]}
        action={
          <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] px-4 py-2 rounded-xl text-center shrink-0">
            <p className="text-[9px] font-bold text-[var(--theme-secondary)] uppercase tracking-wider">Total Peserta</p>
            <p className="text-sm font-bold text-[var(--theme-text)] mt-0.5">
              {meta.total_data} Orang
            </p>
          </div>
        }
      />

      {/* Content */}
      <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Filters Area */}
        <div className="p-5 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)] flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Cari NIM, Nama, atau Program Studi..."
              value={searchTermInput}
              onChange={(e) => setSearchTermInput(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-white border border-[var(--theme-border)] rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all"
            />
            <svg className="w-4 h-4 text-[var(--theme-text-subtle)] absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          {!isFacultyScoped && (
            <SelectField 
              value={fakultasFilter} 
              onValueChange={(val) => {
                setFakultasFilter(val);
                setProgramStudiFilter('all');
                setPage(1);
              }}
              placeholder="Semua Fakultas"
              className="min-w-[180px]"
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
            placeholder="Semua Program Studi"
            className="min-w-[180px]"
          >
            <SelectOption value="all">Semua Program Studi</SelectOption>
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
            placeholder="Semua Status Mentor"
            className="min-w-[180px]"
          >
            <SelectOption value="all">Semua Status Mentor</SelectOption>
            <SelectOption value="assigned">Sudah Ada Mentor</SelectOption>
            <SelectOption value="unassigned">Belum Ada Mentor</SelectOption>
          </SelectField>

          <SelectField 
            value={groupFilter} 
            onValueChange={(val) => {
              setGroupFilter(val);
              setPage(1);
            }}
            placeholder="Semua Kelompok"
            className="min-w-[180px]"
          >
            <SelectOption value="all">Semua Kelompok</SelectOption>
            {groups?.map(g => (
              <SelectOption key={g.id} value={String(g.id)}>Kelompok {g.group_number || '-'} - {g.name}</SelectOption>
            ))}
          </SelectField>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-[var(--theme-surface)]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
            </div>
          ) : data && !data.success ? (
            <div className="flex flex-col justify-center items-center h-64 text-[var(--theme-error)] bg-[var(--theme-surface)]">
              <p className="font-bold">Error dari server:</p>
              <p className="text-sm mt-1">{data.message || 'Terjadi kesalahan'}</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-[var(--theme-text-subtle)] bg-[var(--theme-surface)]">
              <svg className="w-12 h-12 mb-4 text-[var(--theme-text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <p className="font-bold text-base text-[var(--theme-text)]">Tidak ada peserta ditemukan.</p>
              {searchTerm && <p className="text-xs mt-1">Coba gunakan kata kunci pencarian yang berbeda.</p>}
            </div>
          ) : (
            <table className="w-full text-left border-collapse bg-[var(--theme-surface)]">
              <thead>
                <tr className="border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
                  <th className="py-3.5 px-6 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider whitespace-nowrap">NIM / Akun</th>
                  <th className="py-3.5 px-6 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider whitespace-nowrap">Informasi Mahasiswa</th>
                  <th className="py-3.5 px-6 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider whitespace-nowrap">Prodi & Fakultas</th>
                  <th className="py-3.5 px-6 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider whitespace-nowrap">Kelompok</th>
                  <th className="py-3.5 px-6 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider whitespace-nowrap text-right">Mentor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border-muted)]">
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
                    <tr key={p.id} className="hover:bg-[var(--theme-bg)] transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-[var(--theme-text)] bg-[var(--theme-bg)] border border-[var(--theme-border)] px-3 py-1 rounded-lg text-sm">{nim}</span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-[var(--theme-text)] text-sm">{nama}</p>
                        <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-0.5">{email}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-[var(--theme-text)] text-sm line-clamp-1">{prodi}</p>
                        <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-0.5 line-clamp-1">{fakultas}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`inline-flex flex-col px-3 py-1.5 rounded-xl text-xs font-bold border ${groupName === 'Belum Ada' ? 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border-[var(--theme-border)]' : 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success-light)]'}`}>
                          <span className="uppercase text-[9px] tracking-wider opacity-85">KELOMPOK {p.group_number || '-'}</span>
                          <span className="text-sm font-bold mt-0.5">{groupName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${hasMentor ? 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success-light)]' : 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border-[var(--theme-border)]'}`}>
                          {hasMentor ? (
                            <>
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="truncate max-w-[120px]">{mentor}</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="p-4 border-t border-[var(--theme-border-muted)] bg-[var(--theme-bg)] flex items-center justify-between">
            <span className="text-sm text-[var(--theme-text-muted)] font-semibold">
              Halaman {meta.current_page} dari {meta.total_pages}
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

export default Participants;

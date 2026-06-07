import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  useScoresQuery, 
  usePeriodsQuery, 
  useCalculateAllScoresMutation,
  useAdminScoreItemsQuery,
  useBulkUpsertScoreItemsMutation,
  useParticipantsQuery,
  useGroupsQuery,
  useSessionsByPeriodQuery
} from '../../../queries/useKencanaAdminQuery';
import useAuthStore from '../../../store/useAuthStore';
import { PageHeader } from '../../../components/ui/page/PageHeader';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';
import { DialogModal } from '../../../components/ui/DialogModal';



const STATIC_SCORE_DEFINITIONS = {
  psychomotor: [
    { key: 'Taat Peraturan & Tatib (Makanan)', label: 'Taat Peraturan & Tatib', manual: true },
    { key: 'Twibon', label: 'Twibon', manual: true },
    { key: 'Video Perkenalan (Analog)', label: 'Video Perkenalan', manual: true },
    { key: 'Atribut sesuai Ketentuan', label: 'Atribut Sesuai Ketentuan', manual: true },
    { key: 'Kreativitas Individu (name tag, mind map & video rekap)', label: 'Kreativitas Individu', manual: true },
    { key: 'Kreativitas Kelompok (Tongkat & yelyel)', label: 'Kreativitas Kelompok', manual: true },
    { key: 'Memelihara Fasilitas UBK', label: 'Memelihara Fasilitas UBK', manual: true },
  ],
  affective: [
    { key: 'Etika terhadap panitia & civitas', label: 'Etika terhadap Panitia/Civitas', manual: true },
    { key: 'Empati', label: 'Empati', manual: true },
    { key: 'Tanggung Jawab', label: 'Tanggung Jawab', manual: true },
    { key: 'Disiplin', label: 'Disiplin', manual: true },
    { key: 'Adil', label: 'Adil', manual: true },
  ],
  // Handbook masuk sebagai item kognitif manual
  cognitive_static: [
    { key: 'Handbook', label: 'Handbook', manual: true },
  ],
  requirements: [
    { key: 'Kehadiran', label: 'Kehadiran (Manual Override)', manual: true },
  ],
};

const Scores = () => {
  const user = useAuthStore(state => state.user);
  const isFacultyScoped = String(user?.role || '').toLowerCase() === 'kencana_fakultas';
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchParams] = useSearchParams();
  const [searchTermInput, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState(searchParams.get('group_id') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('nama');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modals / Editing States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showBulkInputModal, setShowBulkInputModal] = useState(false);
  const [bulkSelectedStudentId, setBulkSelectedStudentId] = useState('');
  
  // Local score input states (key is `component__itemName`)
  const [scoresInput, setScoresInput] = useState({});

  // Queries
  const { data: periods } = usePeriodsQuery();
  const { data: groups } = useGroupsQuery({ scope_type: isFacultyScoped ? 'faculty' : 'all' }, isFacultyScoped ? 'fakultas' : 'admin');

  // Auto-select active period on mount
  useEffect(() => {
    if (Array.isArray(periods) && periods.length > 0 && !selectedPeriodId) {
      const active = periods.find(p => p.status === 'active');
      setSelectedPeriodId(active ? active.id : periods[0].id);
    }
  }, [periods, selectedPeriodId]);

  const { data: sessionsRes } = useSessionsByPeriodQuery(selectedPeriodId, isFacultyScoped ? 'faculty' : 'kencana_universitas');

  const SCORE_DEFINITIONS = useMemo(() => {
    const cognitive = [];
    if (Array.isArray(sessionsRes)) {
      sessionsRes
        .filter(session => session.status === 'active' || session.status === 'published')
        .forEach(session => {
          if (session.quizzes) {
            session.quizzes
              .filter(quiz => quiz.status === 'active' || quiz.status === 'published')
              .forEach(quiz => {
                cognitive.push({
                  key: `Quiz #${quiz.id}`,
                  label: `Post Test (${quiz.title})`,
                  manual: false
                });
              });
          }
        });
    }
    // Tambahkan item kognitif manual (Handbook)
    STATIC_SCORE_DEFINITIONS.cognitive_static.forEach(item => cognitive.push(item));
    return {
      cognitive,
      ...STATIC_SCORE_DEFINITIONS
    };
  }, [sessionsRes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchTermInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTermInput]);

  const { data: scoresRes, isLoading: loadingScores } = useScoresQuery(
    selectedPeriodId ? { period_id: selectedPeriodId, page, limit, search: searchTerm, group_id: groupFilter, status: statusFilter !== 'all' ? statusFilter : undefined, sort_by: sortBy, sort_order: sortOrder } : { page, limit, search: searchTerm, group_id: groupFilter, status: statusFilter !== 'all' ? statusFilter : undefined, sort_by: sortBy, sort_order: sortOrder }
  );
  
  const scores = scoresRes?.data || [];
  const meta = scoresRes?.meta || { current_page: 1, total_pages: 1, total_data: 0 };

  const { data: detailedItems, isLoading: loadingDetails } = useAdminScoreItemsQuery(
    selectedStudent ? { student_id: selectedStudent.id, period_id: selectedPeriodId } : {}
  );

  // We also query the details for the bulk input dropdown
  const { data: bulkDetailedItems, isLoading: loadingBulkDetails } = useAdminScoreItemsQuery(
    bulkSelectedStudentId ? { student_id: bulkSelectedStudentId, period_id: selectedPeriodId } : {}
  );

  const { data: participants } = useParticipantsQuery(
    selectedPeriodId ? { period_id: selectedPeriodId } : {}
  );

  // Mutations
  const calculateMutation = useCalculateAllScoresMutation();
  const bulkUpsertMutation = useBulkUpsertScoreItemsMutation();

  // Pre-fill score input when detailed items load for single student editing
  useEffect(() => {
    if (isEditing && detailedItems?.items) {
      const map = {};
      detailedItems.items.forEach(item => {
        map[`${item.component}__${item.item_name}`] = item.score;
      });
      setScoresInput(map);
    }
  }, [detailedItems, isEditing]);

  // Pre-fill score input when detailed items load for bulk input modal selection
  useEffect(() => {
    if (showBulkInputModal && bulkDetailedItems?.items) {
      const map = {};
      bulkDetailedItems.items.forEach(item => {
        map[`${item.component}__${item.item_name}`] = item.score;
      });
      setScoresInput(map);
    }
  }, [bulkDetailedItems, showBulkInputModal]);

  const handleScoreChange = (component, itemName, value) => {
    const parsed = value === '' ? '' : Math.min(100, Math.max(0, parseFloat(value) || 0));
    setScoresInput(prev => ({
      ...prev,
      [`${component}__${itemName}`]: parsed
    }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="opacity-30 ml-1">↕</span>;
    return <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  // Save edits for single student (inside detail modal)
  const handleSaveSingleEdit = (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    saveScores(selectedStudent.id, () => {
      setIsEditing(false);
      alert('✅ Nilai mahasiswa berhasil diperbarui!');
    });
  };

  // Save edits in the bulk input modal
  const handleSaveBulkInput = (e) => {
    e.preventDefault();
    if (!bulkSelectedStudentId) return;
    saveScores(bulkSelectedStudentId, () => {
      setBulkSelectedStudentId('');
      setScoresInput({});
      setShowBulkInputModal(false);
      alert('✅ Nilai mahasiswa berhasil disimpan!');
    });
  };

  // Reusable save score caller
  const saveScores = (studentId, callback) => {
    const items = [];
    Object.entries(SCORE_DEFINITIONS).forEach(([component, list]) => {
      list.forEach(def => {
        const val = scoresInput[`${component}__${def.key}`];
        // Only upload manual items or keep manual ones. System items are handled by backend quiz/handbook
        if (def.manual) {
          items.push({
            student_id: Number(studentId),
            component,
            item_name: def.key,
            score: val === '' || val === undefined ? 0 : Number(val),
            notes: 'Diinput melalui Rekap Nilai Admin'
          });
        }
      });
    });

    bulkUpsertMutation.mutate(
      { period_id: Number(selectedPeriodId), items },
      {
        onSuccess: callback,
        onError: (err) => alert('❌ Gagal menyimpan nilai: ' + (err.response?.data?.message || err.message))
      }
    );
  };

  const handleCalculateAll = () => {
    if (!selectedPeriodId) return;
    if (window.confirm('Apakah Anda yakin ingin menghitung ulang nilai seluruh mahasiswa pada periode ini?')) {
      calculateMutation.mutate(
        { period_id: selectedPeriodId },
        {
          onSuccess: () => alert('✅ Kalkulasi nilai berhasil diselesaikan!'),
          onError: (err) => alert('❌ Gagal melakukan kalkulasi: ' + (err.response?.data?.message || err.message))
        }
      );
    }
  };

  const handleSetKeluar = (studentId) => {
    if (!window.confirm('Yakin ingin menetapkan status Keluar untuk mahasiswa ini? Status ini akan membongkar status kelulusan lamanya.')) return;
    bulkUpsertMutation.mutate(
      {
        period_id: parseInt(selectedPeriodId),
        items: [
          {
            student_id: studentId,
            component: 'requirements',
            item_name: 'Keluar',
            score: 100,
            notes: 'Manual Override Keluar'
          }
        ]
      },
      {
        onSuccess: () => {
          // Trigger recalculation immediately to apply 'dropped_out' status
          calculateMutation.mutate({ period_id: selectedPeriodId });
        }
      }
    );
  };

  // Summary counts (for current page data)
  const totalCount = scores.length;
  const passedCount = scores.filter(s => s.graduation_status === 'passed').length;
  const conditionalPassCount = scores.filter(s => s.graduation_status === 'conditional_pass').length;
  const notEligibleCount = scores.filter(s => s.graduation_status === 'not_eligible').length;
  const inProgressCount = totalCount - passedCount - conditionalPassCount - notEligibleCount;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <PageHeader
        icon="percent"
        title={
          <>
            <span className="text-[var(--theme-text)]">Rekapitulasi &amp; </span>
            <span className="text-[var(--theme-primary)]">Kelola Nilai Kencana</span>
          </>
        }
        subtitle={isFacultyScoped ? 'Review dan input nilai untuk peserta fakultas Anda.' : 'Review nilai komponen, input nilai manual mahasiswa, dan lakukan kalkulasi kelulusan.'}
        breadcrumbs={[
          { label: 'Kencana Admin', path: '#' },
          { label: 'Rekap Nilai' }
        ]}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--theme-text-muted)] whitespace-nowrap">Periode:</span>
              <SelectField
                value={selectedPeriodId ? String(selectedPeriodId) : ""}
                onValueChange={val => {
                  setSelectedPeriodId(val);
                  setSelectedStudent(null);
                  setBulkSelectedStudentId('');
                }}
                placeholder="Pilih Periode..."
                className="min-w-[160px]"
              >
                {periods?.map(p => (
                  <SelectOption key={p.id} value={String(p.id)}>
                    {p.name} {p.status === 'active' || p.status === 'published' ? '(Aktif)' : ''}
                  </SelectOption>
                ))}
              </SelectField>
            </div>

            {/* Input Nilai Button */}
            <button
              onClick={() => {
                setScoresInput({});
                setBulkSelectedStudentId('');
                setShowBulkInputModal(true);
              }}
              disabled={!selectedPeriodId}
              className="h-10 px-4 rounded-xl bg-[var(--theme-success)] hover:opacity-85 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              ✏️ Input Nilai Mahasiswa
            </button>

            {/* Calculate Button */}
            <button
              onClick={handleCalculateAll}
              disabled={calculateMutation.isPending || !selectedPeriodId}
              className="h-10 px-4 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-all"
            >
              {calculateMutation.isPending && (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
              )}
              🔄 Hitung Ulang Semua Nilai
            </button>
          </div>
        }
      />

      {/* Summary dashboard statistics (Current Page) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-border)] shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-widest block">Total (Halaman Ini)</span>
          <span className="text-2xl font-bold text-[var(--theme-text)]">{totalCount}</span>
        </div>
        <div className="bg-[var(--theme-success-light)] p-5 rounded-2xl border border-[var(--theme-success-light)] shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-[var(--theme-success)] uppercase tracking-widest block">Lulus</span>
          <span className="text-2xl font-bold text-[var(--theme-success)]">{passedCount}</span>
        </div>
        <div className="bg-[var(--theme-warning-light)] p-5 rounded-2xl border border-[var(--theme-warning-light)] shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-[var(--theme-warning)] uppercase tracking-widest block">Lulus Bersyarat</span>
          <span className="text-2xl font-bold text-[var(--theme-warning)]">{conditionalPassCount}</span>
        </div>
        <div className="bg-[var(--theme-error-light)] p-5 rounded-2xl border border-[var(--theme-error-light)] shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-[var(--theme-error)] uppercase tracking-widest block">Tidak Lulus</span>
          <span className="text-2xl font-bold text-[var(--theme-error)]">{notEligibleCount}</span>
        </div>
        <div className="bg-[var(--theme-bg)] p-5 rounded-2xl border border-[var(--theme-border)] shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-widest block">Belum Lengkap</span>
          <span className="text-2xl font-bold text-[var(--theme-text-muted)]">{inProgressCount}</span>
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden space-y-4 p-6">
        {/* Search input bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-1 gap-2 border border-[var(--theme-border)] rounded-xl px-4 py-2 bg-[var(--theme-bg)] focus-within:bg-[var(--theme-surface)] focus-within:ring-2 focus-within:ring-[var(--theme-primary-light)] focus-within:border-[var(--theme-primary)] transition-all">
            <span className="text-[var(--theme-text-subtle)] mt-2">🔍</span>
            <input
              type="text"
              placeholder="Cari mahasiswa berdasarkan nama atau NIM..."
              value={searchTermInput}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold text-[var(--theme-text)] bg-transparent focus:outline-none py-2"
            />
          </div>
          <SelectField 
            value={statusFilter} 
            onValueChange={val => { setStatusFilter(val); setPage(1); }} 
            placeholder="Semua Status"
            className="w-full sm:w-[180px]"
          >
            <SelectOption value="all">Semua Status</SelectOption>
            <SelectOption value="passed">Lulus</SelectOption>
            <SelectOption value="conditional_pass">Lulus Bersyarat</SelectOption>
            <SelectOption value="not_eligible">Tidak Lulus</SelectOption>
            <SelectOption value="belum_lengkap">Belum Lengkap</SelectOption>
            <SelectOption value="dropped_out">Keluar</SelectOption>
          </SelectField>
          <SelectField 
            value={groupFilter ? String(groupFilter) : "all"} 
            onValueChange={val => { setGroupFilter(val); setPage(1); }} 
            placeholder="Semua Kelompok"
            className="min-w-[200px]"
          >
            <SelectOption value="all">Semua Kelompok</SelectOption>
            {groups?.map(group => (
              <SelectOption key={group.id} value={String(group.id)}>
                Kelompok {group.group_number || '-'} - {group.name}
              </SelectOption>
            ))}
          </SelectField>
        </div>

        {/* Scores Table */}
        {loadingScores ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--theme-primary)]"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]/30">
                  <th onClick={() => handleSort('nama')} className="cursor-pointer hover:text-[var(--theme-primary)] py-4 px-4 text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Mahasiswa <SortIcon field="nama"/></th>
                  <th className="py-4 px-4 text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Kelompok</th>
                  <th onClick={() => handleSort('cognitive')} className="cursor-pointer hover:text-[var(--theme-primary)] py-4 px-4 text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Kognitif (25%) <SortIcon field="cognitive"/></th>
                  <th onClick={() => handleSort('psychomotor')} className="cursor-pointer hover:text-[var(--theme-primary)] py-4 px-4 text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Psikomotor (35%) <SortIcon field="psychomotor"/></th>
                  <th onClick={() => handleSort('affective')} className="cursor-pointer hover:text-[var(--theme-primary)] py-4 px-4 text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Afektif (40%) <SortIcon field="affective"/></th>
                  <th onClick={() => handleSort('final_score')} className="cursor-pointer hover:text-[var(--theme-primary)] py-4 px-4 text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Nilai Akhir <SortIcon field="final_score"/></th>
                  <th onClick={() => handleSort('status')} className="cursor-pointer hover:text-[var(--theme-primary)] py-4 px-4 text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Status Evaluasi <SortIcon field="status"/></th>
                  <th className="py-4 px-4 text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border-muted)] text-sm font-semibold">
                {scores.map((s, i) => (
                  <tr key={s.id || s.student_id || `score-${i}`} className="hover:bg-[var(--theme-primary-light)] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-[var(--theme-text)]">{s.student?.Nama || s.student?.nama || '-'}</div>
                      <div className="text-[10px] text-[var(--theme-text-muted)] font-semibold">NIM: {s.student?.NIM || s.student?.nim || '-'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[var(--theme-text)] text-xs">{s.group_name || '-'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[var(--theme-text)]">{s.cognitive_average?.toFixed(1) || '0.0'}</div>
                      <div className="text-[10px] text-[var(--theme-text-muted)] font-semibold">Weighted: {s.cognitive_weighted?.toFixed(1) || '0.0'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[var(--theme-text)]">{s.psychomotor_average?.toFixed(1) || '0.0'}</div>
                      <div className="text-[10px] text-[var(--theme-text-muted)] font-semibold">Weighted: {s.psychomotor_weighted?.toFixed(1) || '0.0'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[var(--theme-text)]">{s.affective_average?.toFixed(1) || '0.0'}</div>
                      <div className="text-[10px] text-[var(--theme-text-muted)] font-semibold">Weighted: {s.affective_weighted?.toFixed(1) || '0.0'}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-[var(--theme-primary)] text-base">{s.final_score?.toFixed(1) || '0.0'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        s.graduation_status === 'passed' ? 'bg-[var(--theme-success-light)] text-[var(--theme-success)]' :
                        s.graduation_status === 'conditional_pass' ? 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)]' :
                        s.graduation_status === 'not_eligible' ? 'bg-[var(--theme-error-light)] text-[var(--theme-error)]' : 
                        s.graduation_status === 'dropped_out' ? 'bg-[var(--theme-text)] text-[var(--theme-surface)]' : 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)]'
                      }`}>
                        {s.graduation_status === 'passed' ? 'Lulus' :
                         s.graduation_status === 'conditional_pass' ? 'Lulus Bersyarat' :
                         s.graduation_status === 'not_eligible' ? 'Tidak Lulus' : 
                         s.graduation_status === 'dropped_out' ? 'Keluar' : 'Belum Lengkap'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(s.student);
                            setIsEditing(false);
                          }}
                          className="h-8 px-3 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-bg)] text-[var(--theme-text-muted)] text-xs font-semibold shadow-sm transition-all"
                        >
                          🔎 Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!scores.length && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-[var(--theme-text-muted)] italic font-semibold text-xs">
                      Tidak ada data nilai mahasiswa untuk kriteria ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination Footer */}
        {!loadingScores && meta.total_pages > 0 && (
          <div className="p-4 border-t border-[var(--theme-border-muted)] bg-[var(--theme-bg)] flex items-center justify-between">
            <span className="text-sm text-[var(--theme-text-muted)] font-medium">
              Halaman {meta.current_page} dari {meta.total_pages} (Total: {meta.total_data})
            </span>
            <div className="flex gap-2">
              <button
                disabled={meta.current_page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text-muted)] rounded-xl text-sm font-bold hover:bg-[var(--theme-bg)] disabled:opacity-50 transition-colors"
              >
                Prev
              </button>
              <button
                disabled={meta.current_page >= meta.total_pages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text-muted)] rounded-xl text-sm font-bold hover:bg-[var(--theme-bg)] disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Detail Student Score Items */}
      <DialogModal
        open={!!selectedStudent}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setSelectedStudent(null);
            setIsEditing(false);
          }
        }}
        title={isEditing ? '✏️ Edit Nilai Mahasiswa' : 'Rincian Nilai Komponen'}
        subtitle={selectedStudent ? `${selectedStudent.Nama || selectedStudent.nama} (${selectedStudent.NIM || selectedStudent.nim})` : ''}
        maxWidth="max-w-2xl"
        footer={
          isEditing ? (
            <div className="flex justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="h-10 px-4 rounded-xl border border-[var(--theme-border)] text-sm font-medium text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="single-edit-form"
                disabled={bulkUpsertMutation.isPending}
                className="h-10 px-4 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-semibold text-sm disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                {bulkUpsertMutation.isPending && (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                )}
                Simpan Perubahan
              </button>
            </div>
          ) : null
        }
      >
        <div className="p-6 bg-[var(--theme-bg)]/20">
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--theme-primary)]"></div>
            </div>
          ) : isEditing ? (
            /* EDIT FORM */
            <form id="single-edit-form" onSubmit={handleSaveSingleEdit} className="space-y-6">
              {['cognitive', 'psychomotor', 'affective', 'requirements'].map((component) => {
                const list = SCORE_DEFINITIONS[component] || [];
                const titles = { cognitive: 'I. Kognitif (Bobot 25%)', psychomotor: 'II. Psikomotor (Bobot 35%)', affective: 'III. Afektif (Bobot 40%)', requirements: 'IV. Persyaratan & Override (Tidak Masuk Bobot)' };
                return (
                  <div key={component} className="space-y-3 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-border)] shadow-sm">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-muted)]">{titles[component]}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {list.map(def => {
                        const key = `${component}__${def.key}`;
                        const val = scoresInput[key] ?? '';
                        return (
                          <div key={def.key} className="space-y-1">
                            <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] block">{def.label}</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={val}
                              onChange={e => handleScoreChange(component, def.key, e.target.value)}
                              disabled={!def.manual}
                              className={`w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                                def.manual 
                                  ? `border-[var(--theme-border)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)]` 
                                  : 'border-[var(--theme-border-muted)] bg-[var(--theme-bg)] text-[var(--theme-text-subtle)] cursor-not-allowed font-medium'
                              }`}
                              placeholder="0"
                            />
                            {!def.manual && (
                              <span className="text-[9px] text-[var(--theme-text-subtle)] block font-semibold">Tersinkronisasi dari sistem</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </form>
          ) : (
            /* READ ONLY BREAKDOWN */
            <div className="space-y-6">
              {/* Custom header buttons for read-only view */}
              {selectedStudent && (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetKeluar(selectedStudent.id || selectedStudent.ID)}
                    disabled={bulkUpsertMutation.isPending}
                    className="h-8 px-3 rounded-lg border border-[var(--theme-error)] bg-[var(--theme-error-light)] text-[var(--theme-error)] text-xs font-semibold hover:opacity-80 transition-all"
                  >
                    Keluar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="h-8 px-3 rounded-lg border border-[var(--theme-primary)] bg-[var(--theme-primary-light)] text-[var(--theme-primary)] text-xs font-semibold hover:opacity-80 transition-all"
                  >
                    ✏️ Edit Nilai
                  </button>
                </div>
              )}

              {/* Summary row */}
              {detailedItems?.score && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-[var(--theme-primary-light)] rounded-2xl border border-[var(--theme-primary)]/20 bg-surface">
                  <div className="text-center">
                    <span className="text-[9px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider block">Kognitif (Avg)</span>
                    <span className="text-base font-bold text-[var(--theme-text)]">{detailedItems.score.cognitive_average?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider block">Psikomotor (Avg)</span>
                    <span className="text-base font-bold text-[var(--theme-text)]">{detailedItems.score.psychomotor_average?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider block">Afektif (Avg)</span>
                    <span className="text-base font-bold text-[var(--theme-text)]">{detailedItems.score.affective_average?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              )}

              {/* Blockers */}
              {detailedItems?.blockers?.length > 0 && (
                <div className="p-4 bg-[var(--theme-error-light)] border border-[var(--theme-error-light)] rounded-2xl text-[var(--theme-error)] space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--theme-error)] block">⚠️ Kendala Kelulusan:</span>
                  <ul className="list-disc pl-5 text-xs font-semibold space-y-0.5">
                    {detailedItems.blockers.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              )}

              {/* Items breakdown list */}
              <div className="space-y-4">
                {['cognitive', 'psychomotor', 'affective', 'requirements'].map(comp => {
                  const itemsFromDb = detailedItems?.items?.filter(it => it.component.toLowerCase() === comp) ?? [];
                  const definedItems = SCORE_DEFINITIONS[comp] || [];
                  
                  return (
                    <div key={comp} className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-muted)] flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${comp === 'cognitive' ? 'bg-[var(--theme-info)]' : comp === 'psychomotor' ? 'bg-[var(--theme-primary)]' : comp === 'requirements' ? 'bg-[var(--theme-secondary)]' : 'bg-[var(--theme-error)]'}`}></span>
                        {comp}
                      </h4>
                      <div className="border border-[var(--theme-border)] rounded-2xl overflow-hidden divide-y divide-[var(--theme-border-muted)] text-xs bg-surface">
                        {definedItems.map(def => {
                          const dbItem = itemsFromDb.find(it => it.item_name === def.key);
                          return (
                            <div key={def.key} className="p-3 flex items-center justify-between bg-[var(--theme-surface)] hover:bg-[var(--theme-bg)] transition-colors">
                              <div>
                                <div className="font-bold text-[var(--theme-text)]">{def.label}</div>
                                {dbItem?.notes && <div className="text-[10px] text-[var(--theme-text-subtle)] italic mt-0.5">Note: {dbItem.notes}</div>}
                                {!dbItem && def.manual && <div className="text-[10px] text-[var(--theme-error)] italic mt-0.5">Belum diinput</div>}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`font-bold text-sm ${dbItem ? 'text-[var(--theme-text)]' : 'text-[var(--theme-text-subtle)]'}`}>
                                  {dbItem ? dbItem.score : '0'}
                                </span>
                                <span className="text-[9px] font-semibold bg-[var(--theme-bg)] text-[var(--theme-text-muted)] rounded px-1.5 py-0.5 uppercase">
                                  {dbItem ? dbItem.source_type : (def.manual ? 'manual' : 'system')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogModal>

      {/* MODAL 2: Standalone Student Score Entry */}
      <DialogModal
        open={showBulkInputModal}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setShowBulkInputModal(false);
            setBulkSelectedStudentId('');
            setScoresInput({});
          }
        }}
        title="Input Nilai Mahasiswa"
        description="Pilih salah satu mahasiswa untuk mulai mengisi sub-item komponen nilai."
        maxWidth="max-w-2xl"
        footer={
          bulkSelectedStudentId ? (
            <div className="flex justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setShowBulkInputModal(false);
                  setBulkSelectedStudentId('');
                  setScoresInput({});
                }}
                className="h-10 px-4 rounded-xl border border-[var(--theme-border)] text-sm font-medium text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="bulk-input-form"
                disabled={bulkUpsertMutation.isPending}
                className="h-10 px-4 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-semibold text-sm disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                {bulkUpsertMutation.isPending && (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                )}
                Simpan Nilai
              </button>
            </div>
          ) : null
        }
      >
        <div className="p-6 bg-[var(--theme-bg)]/20 space-y-6">
          {/* Dropdown Selection */}
          <div className="space-y-1.5 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-border)] shadow-sm">
            <label className="text-xs font-semibold text-[var(--theme-text-muted)] block">Nama / NIM Mahasiswa</label>
            <SelectField
              value={bulkSelectedStudentId ? String(bulkSelectedStudentId) : ""}
              onValueChange={val => {
                setBulkSelectedStudentId(val);
                setScoresInput({});
              }}
              placeholder="Pilih Mahasiswa..."
              className="w-full"
            >
              {participants?.data?.map(s => (
                <SelectOption key={s.id} value={String(s.id)}>
                  {s.nama || s.Nama} — NIM: {s.nim || s.NIM}
                </SelectOption>
              ))}
            </SelectField>
          </div>

          {bulkSelectedStudentId && (
            loadingBulkDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--theme-primary)]"></div>
              </div>
            ) : (
              /* Form */
              <form id="bulk-input-form" onSubmit={handleSaveBulkInput} className="space-y-6">
                {['cognitive', 'psychomotor', 'affective', 'requirements'].map((component) => {
                  const list = SCORE_DEFINITIONS[component] || [];
                  const titles = { cognitive: 'I. Kognitif (Bobot 25%)', psychomotor: 'II. Psikomotor (Bobot 35%)', affective: 'III. Afektif (Bobot 40%)', requirements: 'IV. Persyaratan & Override (Tidak Masuk Bobot)' };
                  return (
                    <div key={component} className="space-y-3 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-border)] shadow-sm">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-muted)]">{titles[component]}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {list.map(def => {
                          const key = `${component}__${def.key}`;
                          const val = scoresInput[key] ?? '';
                          return (
                            <div key={def.key} className="space-y-1">
                              <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] block">{def.label}</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="any"
                                value={val}
                                onChange={e => handleScoreChange(component, def.key, e.target.value)}
                                disabled={!def.manual}
                                className={`w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                                  def.manual 
                                    ? `border-[var(--theme-border)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)]` 
                                    : 'border-[var(--theme-border-muted)] bg-[var(--theme-bg)] text-[var(--theme-text-subtle)] cursor-not-allowed font-medium'
                                }`}
                                placeholder="0"
                              />
                              {!def.manual && (
                                <span className="text-[9px] text-[var(--theme-text-subtle)] block font-semibold">Tersinkronisasi dari sistem</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </form>
            )
          )}
        </div>
      </DialogModal>
    </div>
  );
};

export default Scores;

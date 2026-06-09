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
import { DashboardHero } from '@/components/ui/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { UserInfoCell, ScoreCell, StatusBadgeCell, ActionButton } from '@/components/ui/TableCells';
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
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const isFacultyScoped = String(user?.role || '').toLowerCase() === 'kencana_fakultas';
  const [openStudentSelect, setOpenStudentSelect] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
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

  const handleSortChange = ({ key, direction }) => {
    let apiField = key;
    if (key === 'student') apiField = 'nama';
    if (key === 'status') apiField = 'status';
    setSortBy(apiField);
    setSortOrder(direction);
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

  const columns = [
    {
      key: 'student',
      label: 'Mahasiswa',
      sortable: true,
      render: (v, s) => <UserInfoCell name={s.student?.Nama || s.student?.nama} subtitle={`NIM: ${s.student?.NIM || s.student?.nim || '-'}`} avatarUrl={s.student?.FotoURL || s.student?.foto_url || s.student?.Foto || s.student?.foto} />
    },
    {
      key: 'group_name',
      label: 'Kelompok',
      sortable: false,
      render: (v, s) => <div className="font-semibold text-[var(--theme-text)] text-xs">{s.group_name || '-'}</div>
    },
    {
      key: 'cognitive',
      label: 'Kognitif (25%)',
      sortable: true,
      render: (v, s) => <ScoreCell value={s.cognitive_average?.toFixed(1)} subtitle={`Weighted: ${s.cognitive_weighted?.toFixed(1) || '0.0'}`} />
    },
    {
      key: 'psychomotor',
      label: 'Psikomotor (35%)',
      sortable: true,
      render: (v, s) => <ScoreCell value={s.psychomotor_average?.toFixed(1)} subtitle={`Weighted: ${s.psychomotor_weighted?.toFixed(1) || '0.0'}`} />
    },
    {
      key: 'affective',
      label: 'Afektif (40%)',
      sortable: true,
      render: (v, s) => <ScoreCell value={s.affective_average?.toFixed(1)} subtitle={`Weighted: ${s.affective_weighted?.toFixed(1) || '0.0'}`} />
    },
    {
      key: 'final_score',
      label: 'Nilai Akhir',
      sortable: true,
      render: (v, s) => <ScoreCell value={s.final_score?.toFixed(1)} highlight={true} />
    },
    {
      key: 'status',
      label: 'Status Evaluasi',
      sortable: true,
      render: (v, s) => {
        let st = 'default';
        if (s.graduation_status === 'passed') st = 'success';
        if (s.graduation_status === 'conditional_pass') st = 'warning';
        if (s.graduation_status === 'not_eligible') st = 'error';

        let lb = 'Belum Lengkap';
        if (s.graduation_status === 'passed') lb = 'Lulus';
        if (s.graduation_status === 'conditional_pass') lb = 'Lulus Bersyarat';
        if (s.graduation_status === 'not_eligible') lb = 'Tidak Lulus';
        if (s.graduation_status === 'dropped_out') lb = 'Keluar';

        return <StatusBadgeCell status={st} label={lb} />;
      }
    },
    {
      key: 'actions',
      label: 'Aksi',
      sortable: false,
      className: 'text-right',
      render: (v, s) => (
        <ActionButton
          icon="visibility"
          label="Detail"
          onClick={() => { setSelectedStudent(s.student); setIsEditing(false); }}
        />
      )
    }
  ];

  return (
    <div className="bg-transparent font-body max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <DashboardHero
        icon="percent"
        title="Rekapitulasi &"
        highlightedTitle="Kelola Nilai Kencana"
        subtitle={isFacultyScoped ? 'Review dan input nilai untuk peserta fakultas Anda.' : 'Review nilai komponen, input nilai manual mahasiswa, dan lakukan kalkulasi kelulusan.'}
        badges={[
          { label: 'Kencana Admin', active: false },
          { label: 'Rekap Nilai', active: true }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-md">
              <span className="text-xs font-bold text-white whitespace-nowrap">Periode:</span>
              <SelectField
                value={selectedPeriodId ? String(selectedPeriodId) : ""}
                onValueChange={val => {
                  setSelectedPeriodId(val);
                  setSelectedStudent(null);
                  setBulkSelectedStudentId('');
                }}
                placeholder="Pilih Periode..."
                className="min-w-[160px] h-8 bg-white/90 border-0"
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
              className="h-9 px-4 rounded-xl bg-[var(--theme-success)] hover:bg-[var(--theme-success)]/90 disabled:opacity-50 text-white font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all border-none cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">edit_document</span>
              Input Nilai
            </button>

            {/* Calculate Button */}
            <button
              onClick={handleCalculateAll}
              disabled={calculateMutation.isPending || !selectedPeriodId}
              className="h-9 px-4 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] disabled:opacity-50 text-white font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all border-none cursor-pointer shadow-sm"
            >
              {calculateMutation.isPending ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <span className="material-symbols-outlined text-[16px]">sync</span>
              )}
              Kalkulasi Ulang
            </button>
          </div>
        }
      />

      {/* Summary dashboard statistics (Current Page) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-border)] shadow-sm flex flex-col relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-[64px] opacity-10 select-none pointer-events-none" style={{ color: 'var(--theme-text-muted)' }}>groups</span>
          <span className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-widest block relative z-10">Total (Halaman Ini)</span>
          <span className="text-2xl font-bold text-[var(--theme-text)] mt-1 relative z-10">{totalCount}</span>
        </div>
        <div className="bg-[var(--theme-success-light)] p-5 rounded-2xl border border-[var(--theme-success-light)] shadow-sm flex flex-col relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-[64px] opacity-20 select-none pointer-events-none" style={{ color: 'var(--theme-success)' }}>check_circle</span>
          <span className="text-[10px] font-semibold text-[var(--theme-success)] uppercase tracking-widest block relative z-10">Lulus</span>
          <span className="text-2xl font-bold text-[var(--theme-success)] mt-1 relative z-10">{passedCount}</span>
        </div>
        <div className="bg-[var(--theme-warning-light)] p-5 rounded-2xl border border-[var(--theme-warning-light)] shadow-sm flex flex-col relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-[64px] opacity-20 select-none pointer-events-none" style={{ color: 'var(--theme-warning)' }}>stars</span>
          <span className="text-[10px] font-semibold text-[var(--theme-warning)] uppercase tracking-widest block relative z-10">Lulus Bersyarat</span>
          <span className="text-2xl font-bold text-[var(--theme-warning)] mt-1 relative z-10">{conditionalPassCount}</span>
        </div>
        <div className="bg-[var(--theme-error-light)] p-5 rounded-2xl border border-[var(--theme-error-light)] shadow-sm flex flex-col relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-[64px] opacity-20 select-none pointer-events-none" style={{ color: 'var(--theme-error)' }}>cancel</span>
          <span className="text-[10px] font-semibold text-[var(--theme-error)] uppercase tracking-widest block relative z-10">Tidak Lulus</span>
          <span className="text-2xl font-bold text-[var(--theme-error)] mt-1 relative z-10">{notEligibleCount}</span>
        </div>
        <div className="bg-[var(--theme-bg)] p-5 rounded-2xl border border-[var(--theme-border)] shadow-sm flex flex-col relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-[64px] opacity-[0.08] select-none pointer-events-none" style={{ color: 'var(--theme-text)' }}>pending_actions</span>
          <span className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-widest block relative z-10">Belum Lengkap</span>
          <span className="text-2xl font-bold text-[var(--theme-text-muted)] mt-1 relative z-10">{inProgressCount}</span>
        </div>
      </div>

      {/* Main List Container */}
      <Card className="glass-card shadow-sm rounded-xl overflow-hidden border-slate-100/60 flex flex-col min-h-[500px]">
        <CardContent className="p-0 border-none shadow-none bg-transparent flex-1 flex flex-col">
          <DataTable
            columns={columns}
            data={scores}
            loading={loadingScores}
            searchable={true}
            searchPlaceholder="Cari mahasiswa berdasarkan nama atau NIM..."
            onSearchChange={setSearchQuery}
            serverPagination={true}
            serverSort={true}
            totalData={meta.total_data}
            currentPage={meta.current_page}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            onSortChange={handleSortChange}
            emptyMessage="Tidak ada data nilai mahasiswa untuk kriteria ini."
            emptyIcon="school"
            actions={
              <>
                <SelectField
                  value={statusFilter}
                  onValueChange={val => { setStatusFilter(val); setPage(1); }}
                  placeholder="Semua Status"
                  className="min-w-[140px] h-9 text-xs rounded-lg border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none flex"
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
                  className="min-w-[160px] h-9 text-xs rounded-lg border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] focus:ring-1 focus:ring-[var(--theme-primary)] outline-none flex"
                >
                  <SelectOption value="all">Semua Kelompok</SelectOption>
                  {groups?.map(group => (
                    <SelectOption key={group.id} value={String(group.id)}>
                      Kelompok {group.group_number || '-'} - {group.name}
                    </SelectOption>
                  ))}
                </SelectField>
              </>
            }
          />
        </CardContent>
      </Card>

      {/* MODAL 1: Detail Student Score Items (Folder Style) */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => {
            if (!bulkUpsertMutation.isPending) {
              setSelectedStudent(null);
              setIsEditing(false);
            }
          }}
        >
          <div
            className="relative w-full max-w-2xl bg-[var(--theme-bg)] rounded-2xl shadow-none border border-[var(--theme-border)] flex flex-col overflow-hidden max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Folder Header */}
            <div className="relative bg-gradient-to-br from-primary via-primary to-blue-700 pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -bottom-6 right-16 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setIsEditing(false);
                }}
                disabled={bulkUpsertMutation.isPending}
                className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 text-white border-none cursor-pointer"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span>
              </button>
              <div className="relative z-10 flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl shadow-xl ring-2 ring-white/20 bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedStudent.foto_url || selectedStudent.foto ? (
                    <img src={selectedStudent.foto_url || selectedStudent.foto} alt={selectedStudent.Nama || selectedStudent.nama} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-white/80" style={{ fontSize: '28px' }}>person</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">
                    {isEditing ? 'Mode Edit Nilai' : 'Profil & Nilai Mahasiswa'}
                  </p>
                  <h2 className="text-lg font-extrabold font-headline leading-tight truncate text-white">{selectedStudent.Nama || selectedStudent.nama}</h2>
                  <p className="text-xs text-blue-100 font-medium mt-0.5">{selectedStudent.ProgramStudi?.Nama || selectedStudent.program_studi || 'Kencana Univ'}</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white font-mono tracking-wider">
                  NIM {selectedStudent.NIM || selectedStudent.nim}
                </span>
                {selectedStudent.Kelompok && (
                  <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider">
                    Kelompok {selectedStudent.Kelompok}
                  </span>
                )}
              </div>
            </div>

            {/* Folder Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-[var(--theme-bg)]/20">
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
                                  className={`w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${def.manual
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

            {/* Folder Footer */}
            <div className="px-5 py-4 border-t border-[var(--theme-border)] bg-[var(--theme-surface)] flex justify-end gap-3 flex-shrink-0">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="h-10 px-4 rounded-xl border border-[var(--theme-border)] text-xs font-bold uppercase tracking-wider text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    form="single-edit-form"
                    disabled={bulkUpsertMutation.isPending}
                    className="h-10 px-4 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5 transition-colors border-none cursor-pointer"
                  >
                    {bulkUpsertMutation.isPending && (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                    )}
                    Simpan Perubahan
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 sm:flex-none sm:w-32 h-10 rounded-xl border border-[var(--theme-primary)] bg-[var(--theme-primary)] text-xs font-bold text-white hover:bg-[var(--theme-primary-hover)] uppercase tracking-widest transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                    Edit Nilai
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setIsEditing(false);
                    }}
                    className="flex-1 sm:flex-none sm:w-32 h-10 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] uppercase tracking-widest hover:bg-[var(--theme-bg)] transition-all active:scale-95 cursor-pointer"
                  >
                    Tutup
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Standalone Student Score Entry (Folder Style) */}
      {showBulkInputModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => {
            if (!bulkUpsertMutation.isPending) {
              setShowBulkInputModal(false);
              setBulkSelectedStudentId('');
              setScoresInput({});
            }
          }}
        >
          <div
            className="relative w-full max-w-2xl bg-[var(--theme-bg)] rounded-2xl shadow-none border border-[var(--theme-border)] flex flex-col overflow-hidden max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Folder Header */}
            <div className="relative bg-gradient-to-br from-primary via-primary to-blue-700 pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -bottom-6 right-16 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
              <button
                onClick={() => {
                  setShowBulkInputModal(false);
                  setBulkSelectedStudentId('');
                  setScoresInput({});
                }}
                disabled={bulkUpsertMutation.isPending}
                className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 text-white border-none cursor-pointer"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span>
              </button>
              <div className="relative z-10 flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl shadow-xl ring-2 ring-white/20 bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  <span className="material-symbols-outlined text-white/80" style={{ fontSize: '24px' }}>edit_document</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">
                    Mode Input Nilai
                  </p>
                  <h2 className="text-xl font-extrabold font-headline leading-tight truncate text-white">Input Nilai Mahasiswa</h2>
                  <p className="text-xs text-blue-100 font-medium mt-0.5">Pilih salah satu mahasiswa untuk mulai mengisi sub-item komponen nilai.</p>
                </div>
              </div>
            </div>

            {/* Folder Body */}
            <div className="p-6 bg-[var(--theme-bg)]/20 space-y-6">
              {/* Dropdown Selection */}
              <div className="space-y-1.5 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-border)] shadow-sm">
                <label className="text-xs font-semibold text-[var(--theme-text-muted)] block">Nama / NIM Mahasiswa</label>
                <div className="relative z-[1000]" onBlurCapture={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setOpenStudentSelect(false);
                  }
                }}>
                  <div className="flex items-center w-full bg-white border border-[var(--theme-border)] rounded-xl focus-within:border-[var(--theme-primary)] focus-within:ring-2 focus-within:ring-[var(--theme-primary-light)] transition-all overflow-hidden h-11 shadow-sm">
                    <span className="material-symbols-outlined text-[var(--theme-text-muted)] pl-4 pr-2 text-[20px]">search</span>
                    <input
                      type="text"
                      className="flex-1 h-full bg-transparent !border-none !outline-none !ring-0 focus:!border-none focus:!outline-none focus:!ring-0 text-sm font-semibold text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)] px-0 m-0"
                      placeholder={bulkSelectedStudentId ? (() => {
                        const s = participants?.data?.find(st => String(st.id || st.ID) === String(bulkSelectedStudentId));
                        return s ? `${s.nama || s.Nama} — NIM: ${s.nim || s.NIM}` : "Ketik nama atau NIM...";
                      })() : "Ketik nama atau NIM..."}
                      value={studentSearchQuery}
                      onChange={(e) => {
                        setStudentSearchQuery(e.target.value);
                        if (!openStudentSelect) setOpenStudentSelect(true);
                        if (bulkSelectedStudentId && e.target.value !== '') {
                          setBulkSelectedStudentId('');
                          setScoresInput({});
                        }
                      }}
                      onFocus={() => setOpenStudentSelect(true)}
                    />
                    <button
                      type="button"
                      onClick={() => setOpenStudentSelect(!openStudentSelect)}
                      className="px-4 h-full flex items-center justify-center text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {openStudentSelect ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>

                  {openStudentSelect && (
                    <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[var(--theme-border)] shadow-md rounded-xl max-h-[250px] overflow-y-auto z-[1000] p-1 animate-in fade-in zoom-in-95 duration-100">
                      {(() => {
                        if (!studentSearchQuery || studentSearchQuery.trim().length === 0) {
                          return <div className="py-6 text-center text-sm text-[var(--theme-text-muted)]">Mulai ketik nama atau NIM...</div>;
                        }

                        const filtered = participants?.data?.filter(s => {
                          const q = studentSearchQuery.toLowerCase();
                          return (s.nama || s.Nama)?.toLowerCase().includes(q) || (s.nim || s.NIM)?.toLowerCase().includes(q);
                        });

                        if (!filtered || filtered.length === 0) {
                          return <div className="py-6 text-center text-sm text-[var(--theme-text-muted)]">Mahasiswa tidak ditemukan.</div>;
                        }

                        return filtered.map(s => (
                          <button
                            key={s.id || s.ID}
                            type="button"
                            onClick={() => {
                              setBulkSelectedStudentId(String(s.id || s.ID));
                              setStudentSearchQuery('');
                              setScoresInput({});
                              setOpenStudentSelect(false);
                            }}
                            className="w-full text-left relative flex items-center gap-2 rounded-lg py-2.5 pl-8 pr-2 text-sm text-[var(--theme-text)] cursor-pointer outline-none hover:bg-[var(--theme-primary-light)] hover:text-[var(--theme-primary)] transition-colors"
                          >
                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                              {String(bulkSelectedStudentId) === String(s.id || s.ID) && (
                                <span className="material-symbols-outlined text-[16px]">check</span>
                              )}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold truncate">{s.nama || s.Nama}</span>
                              <span className="text-[10px] text-[var(--theme-text-muted)] font-semibold uppercase tracking-wider group-hover:text-[var(--theme-primary)]">
                                NIM: {s.nim || s.NIM}
                              </span>
                            </div>
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>
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
                                    className={`w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${def.manual
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

            {/* Folder Footer */}
            <div className="px-5 py-4 border-t border-[var(--theme-border)] bg-[var(--theme-surface)] flex justify-end gap-3 flex-shrink-0">
              {bulkSelectedStudentId ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkInputModal(false);
                      setBulkSelectedStudentId('');
                      setScoresInput({});
                    }}
                    className="h-10 px-4 rounded-xl border border-[var(--theme-border)] text-xs font-bold uppercase tracking-wider text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    form="bulk-input-form"
                    disabled={bulkUpsertMutation.isPending}
                    className="h-10 px-4 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5 transition-colors border-none cursor-pointer"
                  >
                    {bulkUpsertMutation.isPending && (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                    )}
                    Simpan Nilai
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowBulkInputModal(false);
                    setBulkSelectedStudentId('');
                    setScoresInput({});
                  }}
                  className="flex-1 sm:flex-none sm:w-32 h-10 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] uppercase tracking-widest hover:bg-[var(--theme-bg)] transition-all active:scale-95 cursor-pointer"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scores;

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Rekapitulasi &amp; Kelola Nilai Kencana</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">{isFacultyScoped ? 'Review dan input nilai untuk peserta fakultas Anda.' : 'Review nilai komponen, input nilai manual mahasiswa, dan lakukan kalkulasi kelulusan.'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Periode:</span>
            <select
              value={selectedPeriodId}
              onChange={e => {
                setSelectedPeriodId(e.target.value);
                setSelectedStudent(null);
                setBulkSelectedStudentId('');
              }}
              className="px-4 py-2 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Pilih Periode...</option>
              {periods?.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.status === 'active' || p.status === 'published' ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* New Input Nilai Button */}
          <button
            onClick={() => {
              setScoresInput({});
              setBulkSelectedStudentId('');
              setShowBulkInputModal(true);
            }}
            disabled={!selectedPeriodId}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-100 flex items-center gap-1.5 transition-all"
          >
            ✏️ Input Nilai Mahasiswa
          </button>

          <button
            onClick={handleCalculateAll}
            disabled={calculateMutation.isPending || !selectedPeriodId}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all"
          >
            {calculateMutation.isPending && (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
            )}
            🔄 Hitung Ulang Semua Nilai
          </button>
        </div>
      </div>

      {/* Summary dashboard statistics (Current Page) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total (Halaman Ini)</span>
          <span className="text-2xl font-black text-slate-800">{totalCount}</span>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 shadow-sm">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Lulus</span>
          <span className="text-2xl font-black text-emerald-700">{passedCount}</span>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 shadow-sm">
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">Lulus Bersyarat</span>
          <span className="text-2xl font-black text-amber-700">{conditionalPassCount}</span>
        </div>
        <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100/50 shadow-sm">
          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block">Tidak Lulus</span>
          <span className="text-2xl font-black text-red-700">{notEligibleCount}</span>
        </div>
        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/50 shadow-sm">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Belum Lengkap</span>
          <span className="text-2xl font-black text-slate-700">{inProgressCount}</span>
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-6">
        {/* Search input bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-1 gap-2 border border-slate-200 rounded-2xl px-4 py-2 bg-slate-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
            <span className="text-slate-400 mt-2">🔍</span>
            <input
              type="text"
              placeholder="Cari mahasiswa berdasarkan nama atau NIM..."
              value={searchTermInput}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-transparent focus:outline-none py-2"
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }} 
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 w-full sm:w-[180px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="all">Semua Status</option>
            <option value="passed">Lulus</option>
            <option value="conditional_pass">Lulus Bersyarat</option>
            <option value="not_eligible">Tidak Lulus</option>
            <option value="belum_lengkap">Belum Lengkap</option>
            <option value="dropped_out">Keluar</option>
          </select>
          <select 
            value={groupFilter} 
            onChange={e => { setGroupFilter(e.target.value); setPage(1); }} 
            className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 min-w-[200px]"
          >
            <option value="all">Semua Kelompok</option>
            {groups?.map(group => <option key={group.id} value={group.id}>Kelompok {group.group_number || '-'} - {group.name}</option>)}
          </select>
        </div>

        {/* Scores Table */}
        {loadingScores ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th onClick={() => handleSort('nama')} className="cursor-pointer hover:text-slate-600 py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Mahasiswa <SortIcon field="nama"/></th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Kelompok</th>
                  <th onClick={() => handleSort('cognitive')} className="cursor-pointer hover:text-slate-600 py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Kognitif (25%) <SortIcon field="cognitive"/></th>
                  <th onClick={() => handleSort('psychomotor')} className="cursor-pointer hover:text-slate-600 py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Psikomotor (35%) <SortIcon field="psychomotor"/></th>
                  <th onClick={() => handleSort('affective')} className="cursor-pointer hover:text-slate-600 py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Afektif (40%) <SortIcon field="affective"/></th>
                  <th onClick={() => handleSort('final_score')} className="cursor-pointer hover:text-slate-600 py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Nilai Akhir <SortIcon field="final_score"/></th>
                  <th onClick={() => handleSort('status')} className="cursor-pointer hover:text-slate-600 py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status Evaluasi <SortIcon field="status"/></th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                {scores.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-black text-slate-800">{s.student?.Nama || s.student?.nama || '-'}</div>
                      <div className="text-[10px] text-slate-400 font-bold">NIM: {s.student?.NIM || s.student?.nim || '-'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-700 text-xs">{s.group_name || '-'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800">{s.cognitive_average?.toFixed(1) || '0.0'}</div>
                      <div className="text-[10px] text-slate-400 font-bold">Weighted: {s.cognitive_weighted?.toFixed(1) || '0.0'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800">{s.psychomotor_average?.toFixed(1) || '0.0'}</div>
                      <div className="text-[10px] text-slate-400 font-bold">Weighted: {s.psychomotor_weighted?.toFixed(1) || '0.0'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800">{s.affective_average?.toFixed(1) || '0.0'}</div>
                      <div className="text-[10px] text-slate-400 font-bold">Weighted: {s.affective_weighted?.toFixed(1) || '0.0'}</div>
                    </td>
                    <td className="py-4 px-4 font-black text-indigo-600 text-base">{s.final_score?.toFixed(1) || '0.0'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        s.graduation_status === 'passed' ? 'bg-emerald-100 text-emerald-700' :
                        s.graduation_status === 'conditional_pass' ? 'bg-amber-100 text-amber-700' :
                        s.graduation_status === 'not_eligible' ? 'bg-red-100 text-red-700' : 
                        s.graduation_status === 'dropped_out' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
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
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 shadow-sm transition-all"
                        >
                          🔎 Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!scores.length && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400 italic font-semibold text-xs">
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

      {/* MODAL 1: Detail Student Score Items */}
      {selectedStudent && (
        <div className="fixed inset-0 lg:left-72 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
                  {isEditing ? '✏️ Edit Nilai Mahasiswa' : 'Rincian Nilai Komponen'}
                </h3>
                <p className="text-xs font-semibold text-slate-400">{selectedStudent.Nama || selectedStudent.nama} ({selectedStudent.NIM || selectedStudent.nim})</p>
              </div>
              <div className="flex items-center gap-3">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => handleSetKeluar(selectedStudent.id || selectedStudent.ID)}
                      disabled={bulkUpsertMutation.isPending}
                      className="px-3.5 py-1.5 bg-red-50 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-bold text-red-600 transition-all"
                    >
                      Keluar
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl text-xs font-bold text-indigo-700 transition-all"
                    >
                      ✏️ Edit Nilai
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setIsEditing(false);
                  }}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : isEditing ? (
                /* EDIT FORM */
                <form onSubmit={handleSaveSingleEdit} className="space-y-6">
                  {['cognitive', 'psychomotor', 'affective', 'requirements'].map((component) => {
                    const list = SCORE_DEFINITIONS[component] || [];
                    const titles = { cognitive: 'I. Kognitif (Bobot 25%)', psychomotor: 'II. Psikomotor (Bobot 35%)', affective: 'III. Afektif (Bobot 40%)', requirements: 'IV. Persyaratan & Override (Tidak Masuk Bobot)' };
                    const colors = { cognitive: 'sky', psychomotor: 'violet', affective: 'rose', requirements: 'amber' };
                    const c = colors[component];
                    return (
                      <div key={component} className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">{titles[component]}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {list.map(def => {
                            const key = `${component}__${def.key}`;
                            const val = scoresInput[key] ?? '';
                            return (
                              <div key={def.key} className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-600 block">{def.label}</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="any"
                                  value={val}
                                  onChange={e => handleScoreChange(component, def.key, e.target.value)}
                                  disabled={!def.manual}
                                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none transition-all ${
                                    def.manual 
                                      ? `border-slate-200 focus:border-${c}-500 focus:ring-2 focus:ring-${c}-100` 
                                      : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed font-medium'
                                  }`}
                                  placeholder="0"
                                />
                                {!def.manual && (
                                  <span className="text-[9px] text-slate-400 block font-semibold">Tersinkronisasi dari sistem</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 bg-transparent">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={bulkUpsertMutation.isPending}
                      className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-xs flex items-center gap-1.5 shadow-md transition-all"
                    >
                      {bulkUpsertMutation.isPending && (
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                      )}
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              ) : (
                /* READ ONLY BREAKDOWN */
                <div className="space-y-6">
                  {/* Summary row */}
                  {detailedItems?.score && (
                    <div className="grid grid-cols-3 gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 bg-white">
                      <div className="text-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Kognitif (Avg)</span>
                        <span className="text-base font-black text-slate-800">{detailedItems.score.cognitive_average?.toFixed(1) || '0.0'}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Psikomotor (Avg)</span>
                        <span className="text-base font-black text-slate-800">{detailedItems.score.psychomotor_average?.toFixed(1) || '0.0'}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Afektif (Avg)</span>
                        <span className="text-base font-black text-slate-800">{detailedItems.score.affective_average?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  )}

                  {/* Blockers */}
                  {detailedItems?.blockers?.length > 0 && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block">⚠️ Kendala Kelulusan:</span>
                      <ul className="list-disc pl-5 text-xs font-bold space-y-0.5">
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
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${comp === 'cognitive' ? 'bg-sky-400' : comp === 'psychomotor' ? 'bg-violet-400' : comp === 'requirements' ? 'bg-amber-400' : 'bg-rose-400'}`}></span>
                            {comp}
                          </h4>
                          <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs bg-white">
                            {definedItems.map(def => {
                              const dbItem = itemsFromDb.find(it => it.item_name === def.key);
                              return (
                                <div key={def.key} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50/50 transition-colors">
                                  <div>
                                    <div className="font-bold text-slate-800">{def.label}</div>
                                    {dbItem?.notes && <div className="text-[10px] text-slate-400 italic mt-0.5">Note: {dbItem.notes}</div>}
                                    {!dbItem && def.manual && <div className="text-[10px] text-rose-400 italic mt-0.5">Belum diinput</div>}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`font-black text-sm ${dbItem ? 'text-slate-800' : 'text-slate-300'}`}>
                                      {dbItem ? dbItem.score : '0'}
                                    </span>
                                    <span className="text-[9px] font-black bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 uppercase">
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
          </div>
        </div>
      )}

      {/* MODAL 2: Standalone Student Score Entry */}
      {showBulkInputModal && (
        <div className="fixed inset-0 lg:left-72 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Input Nilai Mahasiswa</h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Pilih salah satu mahasiswa untuk mulai mengisi sub-item komponen nilai.</p>
              </div>
              <button
                onClick={() => {
                  setShowBulkInputModal(false);
                  setBulkSelectedStudentId('');
                  setScoresInput({});
                }}
                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-6">
              {/* Dropdown Selection */}
              <div className="space-y-1.5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <label className="text-xs font-bold text-slate-600 block">Nama / NIM Mahasiswa</label>
                <select
                  value={bulkSelectedStudentId}
                  onChange={e => {
                    setBulkSelectedStudentId(e.target.value);
                    setScoresInput({});
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Pilih Mahasiswa...</option>
                  {participants?.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama || s.Nama} — NIM: {s.nim || s.NIM}
                    </option>
                  ))}
                </select>
              </div>

              {bulkSelectedStudentId && (
                loadingBulkDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  /* Form */
                  <form onSubmit={handleSaveBulkInput} className="space-y-6">
                    {['cognitive', 'psychomotor', 'affective', 'requirements'].map((component) => {
                      const list = SCORE_DEFINITIONS[component] || [];
                      const titles = { cognitive: 'I. Kognitif (Bobot 25%)', psychomotor: 'II. Psikomotor (Bobot 35%)', affective: 'III. Afektif (Bobot 40%)', requirements: 'IV. Persyaratan & Override (Tidak Masuk Bobot)' };
                      const colors = { cognitive: 'sky', psychomotor: 'violet', affective: 'rose', requirements: 'amber' };
                      const c = colors[component];
                      return (
                        <div key={component} className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">{titles[component]}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {list.map(def => {
                              const key = `${component}__${def.key}`;
                              const val = scoresInput[key] ?? '';
                              return (
                                <div key={def.key} className="space-y-1">
                                  <label className="text-[11px] font-bold text-slate-600 block">{def.label}</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="any"
                                    value={val}
                                    onChange={e => handleScoreChange(component, def.key, e.target.value)}
                                    disabled={!def.manual}
                                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none transition-all ${
                                      def.manual 
                                        ? `border-slate-200 focus:border-${c}-500 focus:ring-2 focus:ring-${c}-100` 
                                        : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed font-medium'
                                    }`}
                                    placeholder="0"
                                  />
                                  {!def.manual && (
                                    <span className="text-[9px] text-slate-400 block font-semibold">Tersinkronisasi dari sistem</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 bg-transparent">
                      <button
                        type="button"
                        onClick={() => {
                          setShowBulkInputModal(false);
                          setBulkSelectedStudentId('');
                          setScoresInput({});
                        }}
                        className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 text-xs"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={bulkUpsertMutation.isPending}
                        className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-xs flex items-center gap-1.5 shadow-md transition-all"
                      >
                        {bulkUpsertMutation.isPending && (
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                        )}
                        Simpan Nilai
                      </button>
                    </div>
                  </form>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scores;

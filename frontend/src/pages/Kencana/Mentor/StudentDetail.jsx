import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  useMentorStudentProgressQuery, 
  useMentorStudentScoreQuery,
  useMentorStudentAttendanceQuery,
  useMentorStudentHandbookQuery,
  useMentorUpsertBulkScoreItemsMutation,
  useMentorReviewHandbookMutation
} from '../../../queries/useKencanaMentorQuery';

const STATIC_SCORE_DEFINITIONS = {
  cognitive: [
    { key: 'Handbook', label: 'Handbook', manual: true },
  ],
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
    { key: 'Etika terhadap panitia & civitas', label: 'Etika terhadap Panitia & Civitas', manual: true },
    { key: 'Empati', label: 'Empati', manual: true },
    { key: 'Tanggung Jawab', label: 'Tanggung Jawab', manual: true },
    { key: 'Disiplin', label: 'Disiplin', manual: true },
    { key: 'Adil', label: 'Adil', manual: true },
  ],
  requirements: [
    { key: 'Kehadiran', label: 'Kehadiran (Manual Override)', manual: true },
  ],
};

const validTabs = new Set(['progress', 'form', 'handbook']);

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(validTabs.has(searchParams.get('tab')) ? searchParams.get('tab') : 'progress');
  const [scoresInput, setScoresInput] = useState({});
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Parallel Queries
  const { data: progressData, isLoading: loadingProgress } = useMentorStudentProgressQuery(studentId);
  const { data: scoreData, isLoading: loadingScore } = useMentorStudentScoreQuery(studentId);
  const { data: attendanceData, isLoading: loadingAttendance } = useMentorStudentAttendanceQuery(studentId);
  const { data: handbookData, isLoading: loadingHandbook } = useMentorStudentHandbookQuery(studentId);

  // Mutations
  const saveScoresMutation = useMentorUpsertBulkScoreItemsMutation();
  const reviewHandbookMutation = useMentorReviewHandbookMutation();

  const isLoading = loadingProgress || loadingScore || loadingAttendance || loadingHandbook;

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (validTabs.has(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Initialize scores state from existing database values
  useEffect(() => {
    if (scoreData?.items) {
      const map = {};
      scoreData.items.forEach(item => {
        map[`${item.component}__${item.item_name}`] = item.score;
      });
      setScoresInput(map);
    }
  }, [scoreData]);

  // Initialize review form state from existing database values
  useEffect(() => {
    if (handbookData) {
      setReviewStatus(handbookData.status === 'approved' ? 'approved' : 'rejected');
      setReviewFeedback(handbookData.feedback || '');
    }
  }, [handbookData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <span className="ml-3 font-semibold text-slate-600">Memuat detail mahasiswa...</span>
      </div>
    );
  }

  const student = progressData?.student || scoreData?.student || {};
  const score = scoreData?.score || {};
  const scoreItems = scoreData?.items || [];
  const blockers = scoreData?.blockers || [];
  const progress = progressData?.progress_total || 0;
  const attendance = attendanceData || { percentage: 0, present_count: 0, required_sessions: 0 };
  const attendanceOverrideItem = scoreItems.find(item =>
    String(item.component || '').toLowerCase() === 'requirements' &&
    String(item.item_name || '').toLowerCase() === 'kehadiran'
  );
  const attendancePercentage = attendanceOverrideItem ? Number(attendanceOverrideItem.score || 0) : Number(attendance.percentage || 0);
  const attendanceStatus = attendancePercentage >= 100 ? 'Lengkap' : 'Kurang';
  const handbookScoreItem = scoreItems.find(item =>
    ['cognitive', 'requirements'].includes(String(item.component || '').toLowerCase()) &&
    String(item.item_name || '').toLowerCase() === 'handbook'
  );
  const isHandbookScored = Number(handbookScoreItem?.score || 0) > 0;
  const handbookStatusLabel = isHandbookScored
    ? 'Sudah Diisi'
    : !handbookData || handbookData.status === 'not_started' ? 'Belum Diisi' :
      handbookData.status === 'draft' ? 'Draft Mahasiswa' :
      handbookData.status === 'submitted' ? 'Menunggu Review' :
      handbookData.status === 'approved' ? 'Disetujui' : 'Perlu Perbaikan';
  const handbookStatusMeta = isHandbookScored
    ? `Nilai handbook: ${handbookScoreItem.score}`
    : handbookData?.reviewed_at ? `Direview: ${new Date(handbookData.reviewed_at).toLocaleDateString('id-ID')}` : 'Belum dievaluasi';
  const SCORE_DEFINITIONS = {
    ...STATIC_SCORE_DEFINITIONS,
    cognitive: [
      ...(scoreData?.score_definitions?.cognitive || []),
      ...STATIC_SCORE_DEFINITIONS.cognitive,
    ],
  };
  const cognitiveDefinitions = SCORE_DEFINITIONS.cognitive || [];

  const handleScoreChange = (component, key, val) => {
    const parsed = val === '' ? '' : Math.min(100, Math.max(0, parseFloat(val) || 0));
    setScoresInput(prev => ({
      ...prev,
      [`${component}__${key}`]: parsed
    }));
  };

  const handleSaveScores = (e) => {
    e.preventDefault();
    const items = [];
    Object.entries(SCORE_DEFINITIONS).forEach(([component, list]) => {
      list.forEach(def => {
        if (def.manual) {
          const val = scoresInput[`${component}__${def.key}`];
          items.push({
            component,
            item_name: def.key,
            score: val === '' || val === undefined ? 0 : val,
            notes: `Diisi oleh Mentor/DP`
          });
        }
      });
    });

    saveScoresMutation.mutate(
      { studentId, items },
      {
        onSuccess: () => {
          alert('✅ Nilai mahasiswa bimbingan berhasil disimpan!');
        },
        onError: (err) => {
          alert('❌ Gagal menyimpan nilai: ' + (err.response?.data?.message || err.message));
        }
      }
    );
  };

  const handleSaveReview = (e) => {
    e.preventDefault();
    if (!handbookData || handbookData.status === 'not_started') {
      alert('⚠️ Mahasiswa belum membuat atau mengirimkan handbook.');
      return;
    }

    reviewHandbookMutation.mutate(
      { studentId, status: reviewStatus, feedback: reviewFeedback },
      {
        onSuccess: () => {
          alert('✅ Review handbook berhasil disimpan!');
        },
        onError: (err) => {
          alert('❌ Gagal menyimpan review handbook: ' + (err.response?.data?.message || err.message));
        }
      }
    );
  };

  // Group items by component for presentation
  const cognitiveItems = scoreItems.filter(i => i.component.toLowerCase() === 'cognitive');
  const psychomotorItems = scoreItems.filter(i => i.component.toLowerCase() === 'psychomotor');
  const affectiveItems = scoreItems.filter(i => i.component.toLowerCase() === 'affective');

  // Parse handbook JSON securely
  let handbookContent = null;
  if (handbookData?.content_json) {
    try {
      handbookContent = typeof handbookData.content_json === 'string' 
        ? JSON.parse(handbookData.content_json) 
        : handbookData.content_json;
    } catch (e) {
      handbookContent = handbookData.content_json;
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-slate-50 rounded-2xl text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100"
          >
            &larr; Kembali
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              {student.Nama || student.nama || student.NAMA || student.Name || 'Detail Mahasiswa'}
            </h1>
            <p className="text-xs font-semibold text-slate-400">
              NIM: {student.NIM || student.nim || '-'} &bull; {student.ProgramStudi?.Nama || student.program_studi?.Nama || student.program_studi?.nama || '-'} &bull; {student.Fakultas?.Nama || student.fakultas?.Nama || student.fakultas?.nama || '-'}
            </p>
          </div>
        </div>

        {/* Graduation badge status inside header */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status Kelulusan</span>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              score.graduation_status === 'passed' ? 'bg-emerald-100 text-emerald-700' :
              score.graduation_status === 'conditional_pass' ? 'bg-amber-100 text-amber-700' :
              score.graduation_status === 'remedial' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
            }`}>
              {score.graduation_status === 'passed' ? 'LULUS' :
               score.graduation_status === 'conditional_pass' ? 'LULUS BERSYARAT' :
               score.graduation_status === 'remedial' ? 'REMEDIAL' : 'BELUM EVALUASI'}
            </span>
          </div>
          <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 text-center">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Nilai Akhir</span>
            <span className="text-2xl font-black text-indigo-700">{score.final_score?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-slate-100 pb-px">
        <button
          onClick={() => switchTab('progress')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all rounded-t-xl ${
            activeTab === 'progress' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
          }`}
        >
          📈 Informasi &amp; Rincian Nilai
        </button>
        <button
          onClick={() => switchTab('form')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all rounded-t-xl ${
            activeTab === 'form' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
          }`}
        >
          📝 Input &amp; Edit Nilai
        </button>
        <button
          onClick={() => switchTab('handbook')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all rounded-t-xl ${
            activeTab === 'handbook' 
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
          }`}
        >
          📘 Review &amp; Persetujuan Handbook
        </button>
      </div>

      {/* TAB CONTENT: PROGRESS */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blockers / Warnings */}
            {blockers.length > 0 && (
              <div className="md:col-span-3 p-5 bg-rose-50 border border-rose-100 rounded-3xl text-rose-800">
                <h4 className="text-sm font-black uppercase tracking-wider mb-2 flex items-center gap-2">
                  ⚠️ Syarat Kelulusan Belum Terpenuhi
                </h4>
                <ul className="list-disc pl-5 text-xs font-bold space-y-1">
                  {blockers.map((b, idx) => <li key={idx}>{b}</li>)}
                </ul>
              </div>
            )}

            {/* Attendance widget */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Persentase Kehadiran</span>
                <span className="text-3xl font-black text-slate-800">{attendancePercentage}%</span>
                <span className="text-xs font-semibold text-slate-500 block mt-1">
                  {attendanceOverrideItem ? 'Diambil dari nilai manual Kehadiran' : `Sesi: ${attendance.attended_sessions} / ${attendance.required_sessions}`}
                </span>
              </div>
              <div className={`p-4 rounded-2xl ${attendancePercentage >= 100 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                <span className="font-black text-lg">{attendanceStatus}</span>
              </div>
            </div>

            {/* Progress widget */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Progress Materi</span>
                <span className="text-3xl font-black text-slate-800">{progress}%</span>
                <span className="text-xs font-semibold text-slate-500 block mt-1">Materi &amp; Tugas diselesaikan</span>
              </div>
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                <span className="font-black text-lg">Aktif</span>
              </div>
            </div>

            {/* Handbook Status widget */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status Handbook</span>
                <span className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  {handbookStatusLabel}
                </span>
                <span className="text-xs font-semibold text-slate-500 block mt-1">
                  {handbookStatusMeta}
                </span>
              </div>
              <div className={`p-3 rounded-2xl font-black text-xs ${
                isHandbookScored || handbookData?.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                handbookData?.status === 'submitted' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 animate-pulse' :
                'bg-slate-50 text-slate-600 border border-slate-100'
              }`}>
                {isHandbookScored || handbookData?.status === 'approved' ? 'SUDAH' : 'PENDING'}
              </div>
            </div>
          </div>

          {/* Detailed Score Overview Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs">Rincian Nilai Berdasarkan Formula Form Resmi</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/20">
                    <th className="py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Komponen Penilaian</th>
                    <th className="py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Bobot</th>
                    <th className="py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Rata-Rata</th>
                    <th className="py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Nilai Berbobot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                  {/* COGNITIVE */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-6 align-top">
                      <span className="font-black text-slate-700 block mb-2">KOGNITIF</span>
                      <div className="space-y-1.5 pl-4 text-xs font-semibold text-slate-500 border-l-2 border-sky-400">
                        {cognitiveDefinitions.length > 0 ? cognitiveDefinitions.map(def => {
                          const item = cognitiveItems.find(i => i.item_name === def.key);
                          const isQuiz = def.key.startsWith('Quiz #') || def.key.startsWith('Post Test');
                          const displayName = def.label || def.key;
                          return (
                            <div key={def.key} className="flex justify-between max-w-sm gap-4">
                              <span>{displayName} {isQuiz && <span className="ml-2 text-[8px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Quiz</span>}</span>
                              <span className="font-bold text-slate-800">{item?.score ?? '-'}</span>
                            </div>
                          );
                        }) : <span className="italic">Belum ada item kognitif</span>}
                      </div>
                    </td>
                    <td className="py-5 px-6 font-black text-slate-400 text-lg align-top">25%</td>
                    <td className="py-5 px-6 font-black text-slate-700 text-lg align-top">{score.cognitive_average?.toFixed(1) || '0.0'}</td>
                    <td className="py-5 px-6 font-black text-sky-600 text-lg align-top">{score.cognitive_weighted?.toFixed(1) || '0.0'}</td>
                  </tr>

                  {/* PSYCHOMOTOR */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-6 align-top">
                      <span className="font-black text-slate-700 block mb-2">PSIKOMOTOR</span>
                      <div className="space-y-1.5 pl-4 text-xs font-semibold text-slate-500 border-l-2 border-violet-400">
                        {psychomotorItems.length > 0 ? psychomotorItems.map(item => (
                          <div key={item.id} className="flex justify-between max-w-sm">
                            <span>{item.item_name}</span>
                            <span className="font-bold text-slate-800">{item.score}</span>
                          </div>
                        )) : <span className="italic">Belum ada item psikomotor</span>}
                      </div>
                    </td>
                    <td className="py-5 px-6 font-black text-slate-400 text-lg align-top">35%</td>
                    <td className="py-5 px-6 font-black text-slate-700 text-lg align-top">{score.psychomotor_average?.toFixed(1) || '0.0'}</td>
                    <td className="py-5 px-6 font-black text-violet-600 text-lg align-top">{score.psychomotor_weighted?.toFixed(1) || '0.0'}</td>
                  </tr>

                  {/* AFFECTIVE */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-6 align-top">
                      <span className="font-black text-slate-700 block mb-2">AFEKTIF</span>
                      <div className="space-y-1.5 pl-4 text-xs font-semibold text-slate-500 border-l-2 border-rose-400">
                        {affectiveItems.length > 0 ? affectiveItems.map(item => (
                          <div key={item.id} className="flex justify-between max-w-sm">
                            <span>{item.item_name}</span>
                            <span className="font-bold text-slate-800">{item.score}</span>
                          </div>
                        )) : <span className="italic">Belum ada item afektif</span>}
                      </div>
                    </td>
                    <td className="py-5 px-6 font-black text-slate-400 text-lg align-top">40%</td>
                    <td className="py-5 px-6 font-black text-slate-700 text-lg align-top">{score.affective_average?.toFixed(1) || '0.0'}</td>
                    <td className="py-5 px-6 font-black text-rose-600 text-lg align-top">{score.affective_weighted?.toFixed(1) || '0.0'}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-100">
                  <tr className="font-black">
                    <td colSpan="3" className="py-4 px-6 text-right text-slate-500 uppercase tracking-widest text-xs">Total Nilai Akhir (100%)</td>
                    <td className="py-4 px-6 text-indigo-700 text-2xl">{score.final_score?.toFixed(1) || '0.0'}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: GRADE INPUT FORM */}
      {activeTab === 'form' && (
        <form onSubmit={handleSaveScores} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <div>
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Form Pengisian Nilai Mahasiswa</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Masukkan nilai dari 0 hingga 100 untuk sub-item manual. Nilai tes otomatis ditampilkan sebagai referensi.</p>
          </div>

          <div className="space-y-6">
            {/* Cognitive */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-sky-500">I. Komponen Kognitif (Bobot 25%)</h4>
              {!SCORE_DEFINITIONS.cognitive.length && (
                <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-xs font-bold text-slate-500">
                  Belum ada post test aktif dari Kencana University. Nilai post test akan muncul otomatis setelah kuis aktif dan dikerjakan mahasiswa.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SCORE_DEFINITIONS.cognitive.map(def => {
                  const key = `cognitive__${def.key}`;
                  const currentVal = scoresInput[key] ?? '';
                  return (
                    <div key={def.key} className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">{def.label}</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="Nilai (0-100)"
                        value={currentVal}
                        onChange={e => handleScoreChange('cognitive', def.key, e.target.value)}
                        disabled={!def.manual}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none transition-all ${
                          def.manual 
                            ? 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100' 
                            : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed font-medium'
                        }`}
                      />
                      {!def.manual && (
                        <span className="text-[10px] font-semibold text-slate-400 block">Dihitung otomatis oleh sistem</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Psychomotor */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-violet-500">II. Komponen Psikomotor (Bobot 35%)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SCORE_DEFINITIONS.psychomotor.map(def => {
                  const key = `psychomotor__${def.key}`;
                  const currentVal = scoresInput[key] ?? '';
                  return (
                    <div key={def.key} className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block" title={def.key}>
                        {def.label}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="Nilai (0-100)"
                        value={currentVal}
                        onChange={e => handleScoreChange('psychomotor', def.key, e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-semibold focus:outline-none transition-all"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Affective */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-500">III. Komponen Afektif (Bobot 40%)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SCORE_DEFINITIONS.affective.map(def => {
                  const key = `affective__${def.key}`;
                  const currentVal = scoresInput[key] ?? '';
                  return (
                    <div key={def.key} className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">{def.label}</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="Nilai (0-100)"
                        value={currentVal}
                        onChange={e => handleScoreChange('affective', def.key, e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-semibold focus:outline-none transition-all"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Requirements Override */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">IV. Persyaratan Kelulusan (Manual Override)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SCORE_DEFINITIONS.requirements.map(def => {
                  const key = `requirements__${def.key}`;
                  const currentVal = scoresInput[key] ?? '';
                  return (
                    <div key={def.key} className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">{def.label}</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="Nilai (0-100)"
                        value={currentVal}
                        onChange={e => handleScoreChange('requirements', def.key, e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-semibold focus:outline-none transition-all"
                      />
                      <span className="text-[10px] font-semibold text-slate-400 block">Isi 100 untuk menyatakan lengkap/lulus.</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saveScoresMutation.isPending}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all text-sm flex items-center gap-2"
            >
              {saveScoresMutation.isPending && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              )}
              Simpan Semua Nilai
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT: HANDBOOK REVIEW */}
      {activeTab === 'handbook' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content panel */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="border-b border-slate-50 pb-4">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Lembar Pengisian Handbook Mahasiswa</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">Review isian handbook yang telah dikumpulkan mahasiswa bimbingan.</p>
            </div>

            {!handbookData || handbookData.status === 'not_started' ? (
              <div className="p-8 text-center text-slate-500 italic">
                Mahasiswa belum mengisi handbook pada periode ini.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status Pengiriman</span>
                    <span className="font-black text-slate-700 uppercase">{handbookData.status}</span>
                  </div>
                  {handbookData.submitted_at && (
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Submit</span>
                      <span className="font-semibold text-slate-600 text-xs">{new Date(handbookData.submitted_at).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Isi Ringkasan Handbook:</h4>
                  {handbookContent ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {Object.entries(handbookContent).map(([section, value]) => (
                        <div key={section} className="p-4 rounded-2xl border border-slate-100 bg-white">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block mb-1">{section.replace(/_/g, ' ')}</span>
                          <p className="text-sm font-semibold text-slate-700 whitespace-pre-wrap">{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '-')}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 text-slate-500 text-xs italic rounded-2xl">
                      Format isian handbook kosong atau tidak valid.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Approval review Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 self-start">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Keputusan Evaluasi</h3>
            <p className="text-xs font-semibold text-slate-400">Sebagai DP/Mentor, Anda wajib memverifikasi keabsahan handbook sebelum menyetujuinya.</p>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Status Persetujuan</label>
                <select
                  value={reviewStatus}
                  onChange={e => setReviewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-bold text-slate-700 bg-white focus:outline-none transition-all"
                >
                  <option value="approved">✅ Setujui (Approved)</option>
                  <option value="rejected">❌ Perlu Perbaikan (Rejected)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Feedback / Catatan</label>
                <textarea
                  rows="4"
                  placeholder="Tuliskan catatan perbaikan atau feedback untuk mahasiswa..."
                  value={reviewFeedback}
                  onChange={e => setReviewFeedback(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-semibold text-slate-700 focus:outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={reviewHandbookMutation.isPending || !handbookData || handbookData.status === 'not_started'}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
              >
                {reviewHandbookMutation.isPending && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                )}
                Simpan Evaluasi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;

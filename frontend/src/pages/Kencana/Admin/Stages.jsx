import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  usePeriodsQuery, useStagesQuery, useCreateStageMutation, useUpdateStageMutation,
  useSessionsQuery, useCreateSessionMutation, useUpdateSessionMutation, useCreateQuizMutation,
  useCreateMaterialMutation, useUploadMaterialMutation, useUpdateMaterialMutation, useDeleteMaterialMutation,
  useCreateAssignmentMutation, useUpdateAssignmentMutation, useDeleteAssignmentMutation,
  useParticipantsQuery, usePeriodPhasesQuery,
} from '../../../queries/useKencanaAdminQuery';

// ──── Constants ────────────────────────────────────────────────────────────────
const SCORE_DEFINITIONS = {
  cognitive: [
    { key: 'Handbook', label: 'Handbook' },
    { key: 'Post Test 1', label: 'Post Test 1' },
    { key: 'Post Test 2', label: 'Post Test 2' },
  ],
  psychomotor: [
    { key: 'Taat Peraturan & Tatib (Makanan)', label: 'Taat Peraturan & Tatib' },
    { key: 'Twibon', label: 'Twibon' },
    { key: 'Video Perkenalan (Analog)', label: 'Video Perkenalan' },
    { key: 'Atribut sesuai Ketentuan', label: 'Atribut Sesuai Ketentuan' },
    { key: 'Kreativitas Individu (name tag, mind map & video rekap)', label: 'Kreativitas Individu' },
    { key: 'Kreativitas Kelompok (Tongkat & yelyel)', label: 'Kreativitas Kelompok' },
    { key: 'Memelihara Fasilitas UBK', label: 'Memelihara Fasilitas UBK' },
  ],
  affective: [
    { key: 'Etika terhadap panitia & civitas', label: 'Etika' },
    { key: 'Empati', label: 'Empati' },
    { key: 'Tanggung Jawab', label: 'Tanggung Jawab' },
    { key: 'Disiplin', label: 'Disiplin' },
    { key: 'Adil', label: 'Adil' },
  ],
};

const BACKEND_URL = 'http://localhost:8000';

const PHASE_CONFIG = {
  pra_kencana: {
    title: 'Pra-Kencana',
    subtitle: 'Kelola sesi persiapan, materi awal, tugas pembuka, dan kuis pra-orientasi.',
    empty: 'Buat tahap Pra-Kencana pertama untuk menyusun materi persiapan mahasiswa.',
    color: 'violet',
  },
  kencana_universitas: {
    title: 'Kencana Universitas',
    subtitle: 'Kelola sesi utama universitas, materi kebijakan kampus, tugas, dan kuis orientasi pusat.',
    empty: 'Buat tahap Kencana Universitas pertama untuk menyusun orientasi tingkat universitas.',
    color: 'emerald',
  },
  pasca_kencana: {
    title: 'Pasca-Kencana',
    subtitle: 'Kelola sesi refleksi, tugas akhir, kuis evaluasi, dan penutupan setelah orientasi utama.',
    empty: 'Buat tahap Pasca-Kencana pertama untuk finalisasi orientasi.',
    color: 'amber',
  },
};

// ──── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    published: 'bg-emerald-100 text-emerald-700',
    active: 'bg-emerald-100 text-emerald-700',
    locked: 'bg-slate-100 text-slate-600',
    draft: 'bg-amber-100 text-amber-700',
    completed: 'bg-blue-100 text-blue-700',
  };
  const labelMap = { published: 'Aktif', active: 'Aktif', locked: 'Terkunci', draft: 'Draft', completed: 'Selesai' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {labelMap[status] || status}
    </span>
  );
};

const PhaseStatusBadge = ({ active, status }) => {
  const completed = status === 'completed';
  const label = active ? 'Aktif' : completed ? 'Selesai' : 'Belum Aktif';
  const classes = active
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : completed
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-slate-100 text-slate-600 border-slate-200';
  return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${classes}`}>{label}</span>;
};

const formatDate = (date, options = { day: '2-digit', month: 'short', year: 'numeric' }) => (
  date ? new Date(date).toLocaleDateString('id-ID', options) : '-'
);

const getContentCount = (session, key) => session?.[key]?.length || session?.[key.charAt(0).toUpperCase() + key.slice(1)]?.length || 0;

const formatApiDate = (d) => {
  if (!d) return null;
  if (d.includes('T')) return d;
  return `${d}T00:00:00Z`;
};

// ──── Timeline Bar ─────────────────────────────────────────────────────────
const TimelineBar = ({ stages }) => {
  if (!stages?.length) return null;
  const datesWithData = stages.filter(s => s.start_date && s.end_date);
  if (!datesWithData.length) return null;
  const earliest = new Date(Math.min(...datesWithData.map(s => new Date(s.start_date))));
  const latest = new Date(Math.max(...datesWithData.map(s => new Date(s.end_date))));
  const totalMs = latest - earliest || 1;
  const colors = ['bg-violet-500', 'bg-indigo-500', 'bg-blue-500', 'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500'];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Timeline Tahapan</h3>
      <div className="relative h-10 bg-slate-100 rounded-full overflow-hidden">
        {datesWithData.map((stage, i) => {
          const start = (new Date(stage.start_date) - earliest) / totalMs * 100;
          const width = (new Date(stage.end_date) - new Date(stage.start_date)) / totalMs * 100;
          return (
            <div
              key={stage.id}
              className={`absolute top-0 h-full ${colors[i % colors.length]} opacity-80 flex items-center px-2 overflow-hidden`}
              style={{ left: `${start}%`, width: `${Math.max(width, 2)}%` }}
              title={`${stage.name}\n${new Date(stage.start_date).toLocaleDateString('id-ID')} – ${new Date(stage.end_date).toLocaleDateString('id-ID')}`}
            >
              <span className="text-white text-[9px] font-black truncate">{stage.name}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5">
        <span>{earliest.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        <span>{latest.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
  );
};

// ──── File Icon ─────────────────────────────────────────────────────────────
const FileIcon = ({ type }) => {
  const icons = {
    pdf: '📄', video: '🎬', file: '📎', text: '📝',
  };
  return <span className="text-base">{icons[type] || '📎'}</span>;
};

// ScoreInputPanel has been moved to Scores.jsx

// ──── Main Component ────────────────────────────────────────────────────────
const Stages = ({ phaseType = 'kencana_universitas' }) => {
  const navigate = useNavigate();
  const phaseConfig = PHASE_CONFIG[phaseType] || PHASE_CONFIG.kencana_universitas;
  const { data: periods, isLoading: loadingPeriods } = usePeriodsQuery();
  const [selectedPeriodId, setSelectedPeriodId] = useState('');

  useEffect(() => {
    if (periods?.length > 0 && !selectedPeriodId) {
      const active = periods.find(p => p.is_active || p.status === 'active' || p.status === 'published') || periods[0];
      setSelectedPeriodId(active.id);
    }
  }, [periods, selectedPeriodId]);

  const { data: stages, isLoading: loadingStages } = useStagesQuery(selectedPeriodId, { type: phaseType });
  const { data: phaseData } = usePeriodPhasesQuery(selectedPeriodId);
  const { data: participants } = useParticipantsQuery(selectedPeriodId ? { period_id: selectedPeriodId } : {});

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showEditSessionModal, setShowEditSessionModal] = useState(false);
  const [showSessionDetailModal, setShowSessionDetailModal] = useState(false);
  const [showAddQuizModal, setShowAddQuizModal] = useState(false);

  // Active state
  const [activeStage, setActiveStage] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTab, setSessionTab] = useState('materi'); // materi | tugas | nilai

  // Forms
  const [stageForm, setStageForm] = useState({ name: '', type: phaseType, status: 'locked', description: '', start_date: '', end_date: '' });
  const [sessionForm, setSessionForm] = useState({ title: '', description: '', status: 'locked', is_required: true, start_date: '', end_date: '' });
  const [quizForm, setQuizForm] = useState({ title: '', duration_minutes: 30, max_attempts: 1, status: 'draft' });
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'text', content: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', submission_type: 'text', due_date: '', status: 'published', is_required: true });
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const fileInputRef = useRef();

  // Mutations
  const createStageMutation = useCreateStageMutation();
  const updateStageMutation = useUpdateStageMutation();
  const createSessionMutation = useCreateSessionMutation();
  const updateSessionMutation = useUpdateSessionMutation();
  const createQuizMutation = useCreateQuizMutation();
  const createMaterialMutation = useCreateMaterialMutation();
  const uploadMaterialMutation = useUploadMaterialMutation();
  const updateMaterialMutation = useUpdateMaterialMutation();
  const deleteMaterialMutation = useDeleteMaterialMutation();
  const createAssignmentMutation = useCreateAssignmentMutation();
  const updateAssignmentMutation = useUpdateAssignmentMutation();
  const deleteAssignmentMutation = useDeleteAssignmentMutation();

  const { data: detailedSessions, isLoading: loadingSessions } = useSessionsQuery(activeStage?.id);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleCreateStage = (e) => {
    e.preventDefault();
    if (!selectedPeriodId) return;
    createStageMutation.mutate(
      { ...stageForm, type: phaseType, period_id: Number(selectedPeriodId) },
      { onSuccess: () => { setShowAddModal(false); setStageForm({ name: '', type: phaseType, status: 'locked', description: '', start_date: '', end_date: '' }); } }
    );
  };

  const handleUpdateStage = (e) => {
    e.preventDefault();
    const payload = { ...stageForm, type: phaseType };
    payload.start_date = formatApiDate(payload.start_date);
    payload.end_date = formatApiDate(payload.end_date);
    
    updateStageMutation.mutate(
      { id: activeStage.id, ...payload },
      { onSuccess: () => { setShowEditModal(false); setActiveStage(null); } }
    );
  };

  const ensurePhaseStage = async () => {
    if (!selectedPeriodId) return null;
    const timeline = phaseData?.timeline_phases?.find(item => item.phase_type === phaseType);
    
    if (stages?.length) {
      const stage = stages[0];
      const tStart = timeline?.start_date ? timeline.start_date.slice(0, 10) : '';
      const tEnd = timeline?.end_date ? timeline.end_date.slice(0, 10) : '';
      const sStart = stage.start_date ? stage.start_date.slice(0, 10) : '';
      const sEnd = stage.end_date ? stage.end_date.slice(0, 10) : '';
      
      if (['pra_kencana', 'kencana_universitas'].includes(phaseType) && (tStart !== sStart || tEnd !== sEnd)) {
        updateStageMutation.mutate({
          id: stage.id,
          start_date: formatApiDate(tStart),
          end_date: formatApiDate(tEnd)
        });
      }
      return stage;
    }

    return createStageMutation.mutateAsync({
      name: phaseConfig.title,
      type: phaseType,
      period_id: Number(selectedPeriodId),
      status: timeline?.is_active ? 'active' : 'locked',
      is_published: Boolean(timeline?.is_active),
      description: phaseConfig.subtitle,
      start_date: formatApiDate(timeline?.start_date ? timeline.start_date.slice(0, 10) : null),
      end_date: formatApiDate(timeline?.end_date ? timeline.end_date.slice(0, 10) : null),
    });
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!activeStage) return;
    
    const payload = { ...sessionForm, stage_id: activeStage.id };
    payload.start_date = formatApiDate(payload.start_date);
    payload.end_date = formatApiDate(payload.end_date);

    createSessionMutation.mutate(
      payload,
      { onSuccess: () => { setShowAddSessionModal(false); setSessionForm({ title: '', description: '', status: 'locked', is_required: true, start_date: '', end_date: '' }); } }
    );
  };

  const handleUpdateSession = (e) => {
    e.preventDefault();
    if (!activeSession) return;
    const payload = { ...sessionForm };
    payload.start_date = formatApiDate(payload.start_date);
    payload.end_date = formatApiDate(payload.end_date);
    updateSessionMutation.mutate(
      { id: activeSession.id, ...payload },
      { onSuccess: () => { setShowEditSessionModal(false); setActiveSession(null); } }
    );
  };

  const handleAddQuizSubmit = (e) => {
    e.preventDefault();
    if (!activeSession) return;
    createQuizMutation.mutate({ ...quizForm, session_id: activeSession.id }, {
      onSuccess: () => { setShowAddQuizModal(false); setQuizForm({ title: '', duration_minutes: 30, max_attempts: 1, status: 'draft' }); }
    });
  };

  const handleAddTextMaterial = (e) => {
    e.preventDefault();
    if (!activeSession) return;
    createMaterialMutation.mutate({ ...materialForm, session_id: activeSession.id }, {
      onSuccess: () => setMaterialForm({ title: '', type: 'text', content: '' })
    });
  };

  const handleUploadFile = () => {
    if (!uploadFile || !activeSession) return;
    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('session_id', activeSession.id);
    fd.append('title', uploadFile.name.replace(/\.[^/.]+$/, ''));
    uploadMaterialMutation.mutate(fd, {
      onSuccess: () => { setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }
    });
  };

  const handleDeleteMaterial = (id) => {
    if (!confirm('Hapus materi ini?')) return;
    deleteMaterialMutation.mutate(id);
  };

  const handleSaveAssignment = (e) => {
    e.preventDefault();
    if (!activeSession) return;
    if (editingAssignment) {
      updateAssignmentMutation.mutate({ id: editingAssignment.id, ...assignmentForm }, {
        onSuccess: () => { setEditingAssignment(null); setAssignmentForm({ title: '', description: '', submission_type: 'text', due_date: '', status: 'published', is_required: true }); }
      });
    } else {
      createAssignmentMutation.mutate({ ...assignmentForm, session_id: activeSession.id }, {
        onSuccess: () => setAssignmentForm({ title: '', description: '', submission_type: 'text', due_date: '', status: 'published', is_required: true })
      });
    }
  };

  const handleDeleteAssignment = (id) => {
    if (!confirm('Hapus tugas ini?')) return;
    deleteAssignmentMutation.mutate(id);
  };

  const openEditStage = (stage) => {
    setActiveStage(stage);
    setStageForm({
      name: stage.name, type: stage.type || phaseType, status: stage.status, description: stage.description || '',
      start_date: stage.start_date ? stage.start_date.slice(0, 10) : '',
      end_date: stage.end_date ? stage.end_date.slice(0, 10) : '',
    });
    setShowEditModal(true);
  };

  const openAddSession = async (stage = null) => {
    const targetStage = stage || await ensurePhaseStage();
    if (!targetStage) return;
    const timeline = phaseData?.timeline_phases?.find(item => item.phase_type === phaseType);
    setActiveStage(targetStage);
    setSessionForm({
      title: '',
      description: '',
      status: timeline?.is_active ? 'active' : 'locked',
      is_required: true,
      start_date: timeline?.start_date ? timeline.start_date.slice(0, 10) : '',
      end_date: timeline?.end_date ? timeline.end_date.slice(0, 10) : '',
    });
    setShowAddSessionModal(true);
  };

  const openEditSession = (session) => {
    setActiveSession(session);
    setSessionForm({
      title: session.title,
      description: session.description || '',
      status: session.status,
      is_required: session.is_required,
      start_date: session.start_date ? session.start_date.slice(0, 10) : '',
      end_date: session.end_date ? session.end_date.slice(0, 10) : '',
    });
    setShowEditSessionModal(true);
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  const fullSession = detailedSessions?.find(s => s.id === activeSession?.id) || activeSession;
  const phaseTimeline = phaseData?.timeline_phases?.find(item => item.phase_type === phaseType);
  const phaseStage = stages?.[0] || null;
  const phaseSessions = stages?.flatMap(stage => (stage.sessions || []).map(session => ({ ...session, stage }))) || [];
  const totalMaterials = phaseSessions.reduce((sum, session) => sum + getContentCount(session, 'materials'), 0);
  const totalQuizzes = phaseSessions.reduce((sum, session) => sum + getContentCount(session, 'quizzes'), 0);
  const totalAssignments = phaseSessions.reduce((sum, session) => sum + getContentCount(session, 'assignments'), 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-7 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.28em]">Konten Fase</p>
              <PhaseStatusBadge active={phaseTimeline?.is_active} status={phaseTimeline?.status} />
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-800">{phaseConfig.title}</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium mt-2 leading-relaxed">{phaseConfig.subtitle}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="w-full sm:w-64 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-cyan-500 transition-colors"
              disabled={loadingPeriods}
            >
              <option value="" disabled className="text-slate-800">Pilih Periode...</option>
              {periods?.map(p => <option key={p.id} value={p.id} className="text-slate-800">{p.name} {p.status === 'active' || p.status === 'published' ? '(Aktif)' : ''}</option>)}
            </select>
            <button
              onClick={() => openAddSession(phaseStage)}
              disabled={!selectedPeriodId || createStageMutation.isPending}
              className="whitespace-nowrap bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-2xl text-sm font-black shadow-md disabled:opacity-50 transition-all"
            >
              + Tambah Sesi
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</p>
          <p className="text-sm font-black text-slate-800 mt-2">{formatDate(phaseTimeline?.start_date)} - {formatDate(phaseTimeline?.end_date)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sesi</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{phaseSessions.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Materi & Kuis</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{totalMaterials + totalQuizzes}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tugas</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{totalAssignments}</p>
        </div>
      </div>

      {/* Content */}
      {loadingStages ? (
        <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-violet-600"></div></div>
      ) : !selectedPeriodId ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center text-amber-800 font-bold">Silakan pilih periode terlebih dahulu.</div>
      ) : phaseSessions.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-lg font-black text-slate-700 mb-2">Belum Ada Sesi</h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">Timeline fase ini sudah disiapkan dari Kelola Timeline. Mulai susun materi, kuis, dan tugas dengan membuat sesi pertama.</p>
          <button onClick={() => openAddSession(phaseStage)} disabled={createStageMutation.isPending} className="mt-6 px-6 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black disabled:opacity-50">+ Tambah Sesi Pertama</button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800">Sesi {phaseConfig.title}</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">Kelola materi, kuis, dan tugas per sesi. Tahap dipakai sebagai wadah teknis fase ini.</p>
            </div>
            {phaseStage && <button onClick={() => openEditStage(phaseStage)} className="text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl">Atur Wadah Konten</button>}
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {phaseSessions.map((session) => (
              <div key={session.id} className="border border-slate-100 rounded-2xl p-5 hover:border-cyan-200 hover:shadow-md transition-all bg-white relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="font-black text-slate-800 line-clamp-2">{session.title}</h4>
                    <div className="shrink-0"><StatusBadge status={session.status} /></div>
                  </div>
                  <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-3">{session.description || 'Tidak ada deskripsi.'}</p>
                  <div className="flex flex-wrap gap-2 text-[10px] font-black text-slate-500">
                    <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700">Materi {getContentCount(session, 'materials')}</span>
                    <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700">Kuis {getContentCount(session, 'quizzes')}</span>
                    <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700">Tugas {getContentCount(session, 'assignments')}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-4">
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{session.is_required ? 'Wajib' : 'Opsional'}</span>
                    <button onClick={() => openEditSession(session)} className="text-[10px] font-black text-cyan-600 bg-cyan-50 hover:bg-cyan-100 px-2 py-1 rounded">Edit Sesi</button>
                  </div>
                  <button onClick={() => navigate(`/kencana-admin/sessions/${session.id}/content`)} className="text-xs font-black text-slate-700 hover:text-cyan-700 transition-colors">Kelola Konten →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-800 mb-4">Tambah Sesi</h3>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Judul Sesi</label>
                <input type="text" required value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-sm font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi</label>
                <textarea rows="3" value={sessionForm.description} onChange={e => setSessionForm({...sessionForm, description: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Mulai (Start Date)</label>
                  <input type="date" value={sessionForm.start_date} onChange={e => setSessionForm({...sessionForm, start_date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Berakhir (End Date)</label>
                  <input type="date" value={sessionForm.end_date} onChange={e => setSessionForm({...sessionForm, end_date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-sm font-semibold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                  <select value={sessionForm.status} onChange={e => setSessionForm({...sessionForm, status: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-sm font-semibold">
                    <option value="active">Aktif</option>
                    <option value="locked">Terkunci</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Sifat</label>
                  <select value={sessionForm.is_required} onChange={e => setSessionForm({...sessionForm, is_required: e.target.value === 'true'})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-sm font-semibold">
                    <option value="true">Wajib</option>
                    <option value="false">Opsional</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddSessionModal(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Batal</button>
                <button type="submit" disabled={createSessionMutation.isPending} className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-black rounded-xl">Simpan Sesi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-800 mb-4">Edit Sesi</h3>
            <form onSubmit={handleUpdateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Judul Sesi</label>
                <input type="text" required value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-sm font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi</label>
                <textarea rows="3" value={sessionForm.description} onChange={e => setSessionForm({...sessionForm, description: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Mulai (Start Date)</label>
                  <input type="date" value={sessionForm.start_date} onChange={e => setSessionForm({...sessionForm, start_date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Berakhir (End Date)</label>
                  <input type="date" value={sessionForm.end_date} onChange={e => setSessionForm({...sessionForm, end_date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-sm font-semibold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                  <select value={sessionForm.status} onChange={e => setSessionForm({...sessionForm, status: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-sm font-semibold">
                    <option value="active">Aktif</option>
                    <option value="locked">Terkunci</option>
                    <option value="published">Diterbitkan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Sifat</label>
                  <select value={sessionForm.is_required} onChange={e => setSessionForm({...sessionForm, is_required: e.target.value === 'true'})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-sm font-semibold">
                    <option value="true">Wajib</option>
                    <option value="false">Opsional</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEditSessionModal(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Batal</button>
                <button type="submit" disabled={updateSessionMutation.isPending} className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-black rounded-xl">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stages;

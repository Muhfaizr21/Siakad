import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  usePeriodsQuery, useStagesQuery, useCreateStageMutation, useUpdateStageMutation,
  useSessionsQuery, useCreateSessionMutation, useUpdateSessionMutation, useCreateQuizMutation,
  useCreateMaterialMutation, useUploadMaterialMutation, useUpdateMaterialMutation, useDeleteMaterialMutation,
  useCreateAssignmentMutation, useUpdateAssignmentMutation, useDeleteAssignmentMutation,
  useParticipantsQuery, usePeriodPhasesQuery,
} from '../../../queries/useKencanaAdminQuery';
import { PageHeader } from '../../../components/ui/page/PageHeader';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';
import { DialogModal } from '../../../components/ui/DialogModal';

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
    published: 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success-light)]',
    active: 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success-light)]',
    locked: 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border-[var(--theme-border)]',
    draft: 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning-light)]',
    completed: 'bg-[var(--theme-info-light)] text-[var(--theme-info)] border-[var(--theme-info-light)]',
  };
  const labelMap = { published: 'Aktif', active: 'Aktif', locked: 'Terkunci', draft: 'Draft', completed: 'Selesai' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[status] || 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border-[var(--theme-border)]'}`}>
      {labelMap[status] || status}
    </span>
  );
};

const PhaseStatusBadge = ({ active, status }) => {
  const completed = status === 'completed';
  const label = active ? 'Aktif' : completed ? 'Selesai' : 'Belum Aktif';
  const classes = active
    ? 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success-light)]'
    : completed
      ? 'bg-[var(--theme-info-light)] text-[var(--theme-info)] border-[var(--theme-info-light)]'
      : 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border-[var(--theme-border)]';
  return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${classes}`}>{label}</span>;
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

// ──── Main Component ────────────────────────────────────────────────────────
const Stages = ({ phaseType = 'kencana_universitas' }) => {
  const navigate = useNavigate();
  const phaseConfig = PHASE_CONFIG[phaseType] || PHASE_CONFIG.kencana_universitas;
  const { data: periods, isLoading: loadingPeriods } = usePeriodsQuery();
  const [selectedPeriodId, setSelectedPeriodId] = useState('');

  useEffect(() => {
    if (periods?.length > 0 && !selectedPeriodId) {
      const active = periods.find(p => p.is_active || p.status === 'active' || p.status === 'published') || periods[0];
      setSelectedPeriodId(String(active.id));
    }
  }, [periods, selectedPeriodId]);

  const { data: stages, isLoading: loadingStages } = useStagesQuery(selectedPeriodId, { type: phaseType });
  const { data: phaseData } = usePeriodPhasesQuery(selectedPeriodId);

  // Modal states
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showEditSessionModal, setShowEditSessionModal] = useState(false);

  // Active state
  const [activeStage, setActiveStage] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  // Forms
  const [sessionForm, setSessionForm] = useState({ title: '', description: '', status: 'locked', is_required: true, start_date: '', end_date: '' });

  // Mutations
  const createStageMutation = useCreateStageMutation();
  const updateStageMutation = useUpdateStageMutation();
  const createSessionMutation = useCreateSessionMutation();
  const updateSessionMutation = useUpdateSessionMutation();

  // ─── Handlers ───────────────────────────────────────────────────────────
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
  const phaseTimeline = phaseData?.timeline_phases?.find(item => item.phase_type === phaseType);
  const phaseStage = stages?.[0] || null;
  const phaseSessions = stages?.flatMap(stage => (stage.sessions || []).map(session => ({ ...session, stage }))) || [];
  const totalMaterials = phaseSessions.reduce((sum, session) => sum + getContentCount(session, 'materials'), 0);
  const totalQuizzes = phaseSessions.reduce((sum, session) => sum + getContentCount(session, 'quizzes'), 0);
  const totalAssignments = phaseSessions.reduce((sum, session) => sum + getContentCount(session, 'assignments'), 0);

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-body max-w-7xl mx-auto space-y-6">

      {/* Page Header */}
      <PageHeader
        icon="book_open"
        title={
          <>
            <span className="text-[var(--theme-text)]">Sesi & Konten </span>
            <span className="text-[var(--theme-primary)]">{phaseConfig.title}</span>
          </>
        }
        subtitle={phaseConfig.subtitle}
        breadcrumbs={[
          { label: 'Kencana Admin', path: '#' },
          { label: phaseConfig.title }
        ]}
        action={
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
            <div className="flex items-center gap-2 pr-2">
              <PhaseStatusBadge active={phaseTimeline?.is_active} status={phaseTimeline?.status} />
            </div>
            <SelectField
              value={selectedPeriodId}
              onValueChange={setSelectedPeriodId}
              placeholder="Pilih Periode..."
              className="min-w-[200px]"
              disabled={loadingPeriods}
            >
              {periods?.map(p => (
                <SelectOption key={p.id} value={String(p.id)}>
                  {p.name} {p.status === 'active' || p.status === 'published' ? '(Aktif)' : ''}
                </SelectOption>
              ))}
            </SelectField>
            <button
              onClick={() => openAddSession(phaseStage)}
              disabled={!selectedPeriodId || createStageMutation.isPending}
              className="h-10 px-5 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all shrink-0"
            >
              + Tambah Sesi
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[var(--theme-border)] p-5 shadow-sm">
          <p className="text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-widest">Timeline</p>
          <p className="text-sm font-bold text-[var(--theme-text)] mt-2">{formatDate(phaseTimeline?.start_date)} - {formatDate(phaseTimeline?.end_date)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--theme-border)] p-5 shadow-sm">
          <p className="text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-widest">Total Sesi</p>
          <p className="text-2xl font-bold text-[var(--theme-text)] mt-1">{phaseSessions.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--theme-border)] p-5 shadow-sm">
          <p className="text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-widest">Materi & Kuis</p>
          <p className="text-2xl font-bold text-[var(--theme-text)] mt-1">{totalMaterials + totalQuizzes}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--theme-border)] p-5 shadow-sm">
          <p className="text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-widest">Tugas Utama</p>
          <p className="text-2xl font-bold text-[var(--theme-text)] mt-1">{totalAssignments}</p>
        </div>
      </div>

      {/* Content */}
      {loadingStages ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
        </div>
      ) : !selectedPeriodId ? (
        <div className="bg-[var(--theme-warning-light)] border border-[var(--theme-warning-light)] rounded-2xl p-8 text-center text-[var(--theme-warning)] font-bold">
          Silakan pilih periode terlebih dahulu.
        </div>
      ) : phaseSessions.length === 0 ? (
        <div className="bg-white border border-dashed border-[var(--theme-border)] rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-lg font-bold text-[var(--theme-text)] mb-2">Belum Ada Sesi</h2>
          <p className="text-[var(--theme-text-muted)] font-medium max-w-xl mx-auto text-sm">
            Timeline fase ini sudah disiapkan dari Kelola Timeline. Mulai susun materi, kuis, dan tugas dengan membuat sesi pertama.
          </p>
          <button
            onClick={() => openAddSession(phaseStage)}
            disabled={createStageMutation.isPending}
            className="mt-6 h-10 px-6 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold disabled:opacity-50 transition-all"
          >
            + Tambah Sesi Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--theme-border-muted)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-bg)]">
            <div>
              <h2 className="text-base font-bold text-[var(--theme-text)]">Daftar Sesi {phaseConfig.title}</h2>
              <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Kelola materi, kuis, dan tugas per sesi.</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 bg-[var(--theme-surface)]">
            {phaseSessions.map((session) => (
              <div key={session.id} className="border border-[var(--theme-border)] rounded-xl p-5 hover:border-[var(--theme-primary-hover)] hover:shadow-md transition-all bg-white relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--theme-primary)]"></div>
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="font-bold text-[var(--theme-text)] line-clamp-2 text-sm">{session.title}</h4>
                    <div className="shrink-0"><StatusBadge status={session.status} /></div>
                  </div>
                  <p className="text-xs font-semibold text-[var(--theme-text-muted)] line-clamp-2 mb-3 leading-relaxed">{session.description || 'Tidak ada deskripsi.'}</p>
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                    <span className="px-2 py-1 rounded-lg bg-[var(--theme-info-light)] text-[var(--theme-info)]">Materi {getContentCount(session, 'materials')}</span>
                    <span className="px-2 py-1 rounded-lg bg-[var(--theme-warning-light)] text-[var(--theme-warning)]">Kuis {getContentCount(session, 'quizzes')}</span>
                    <span className="px-2 py-1 rounded-lg bg-[var(--theme-error-light)] text-[var(--theme-error)]">Tugas {getContentCount(session, 'assignments')}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--theme-border-muted)] mt-4">
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider">{session.is_required ? 'Wajib' : 'Opsional'}</span>
                    <button onClick={() => openEditSession(session)} className="text-[10px] font-bold text-[var(--theme-primary)] bg-[var(--theme-primary-light)] hover:bg-[var(--theme-primary-light)]/80 px-2 py-1 rounded-lg transition-colors">Edit Sesi</button>
                  </div>
                  <button onClick={() => navigate(`/kencana-admin/sessions/${session.id}/content`)} className="text-xs font-bold text-[var(--theme-text)] hover:text-[var(--theme-primary)] transition-colors">Kelola Konten →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      <DialogModal
        open={showAddSessionModal}
        onOpenChange={setShowAddSessionModal}
        title="Tambah Sesi Baru"
        description="Lengkapi detail sesi untuk ditambahkan ke tahap orientasi aktif."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSession} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Judul Sesi</label>
            <input type="text" required value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-primary)] text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Deskripsi</label>
            <textarea rows="3" value={sessionForm.description} onChange={e => setSessionForm({...sessionForm, description: e.target.value})} className="w-full p-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-primary)] text-sm font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Mulai</label>
              <input type="date" value={sessionForm.start_date} onChange={e => setSessionForm({...sessionForm, start_date: e.target.value})} className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-primary)] text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Berakhir</label>
              <input type="date" value={sessionForm.end_date} onChange={e => setSessionForm({...sessionForm, end_date: e.target.value})} className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-primary)] text-sm font-semibold" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Status</label>
              <SelectField
                value={sessionForm.status}
                onValueChange={(val) => setSessionForm({ ...sessionForm, status: val })}
                className="w-full"
              >
                <SelectOption value="active">Aktif</SelectOption>
                <SelectOption value="locked">Terkunci</SelectOption>
              </SelectField>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Sifat</label>
              <SelectField
                value={String(sessionForm.is_required)}
                onValueChange={(val) => setSessionForm({ ...sessionForm, is_required: val === 'true' })}
                className="w-full"
              >
                <SelectOption value="true">Wajib</SelectOption>
                <SelectOption value="false">Opsional</SelectOption>
              </SelectField>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--theme-border-muted)]">
            <button type="button" onClick={() => setShowAddSessionModal(false)} className="px-4 py-2 text-xs font-bold text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] rounded-xl transition-colors">Batal</button>
            <button type="submit" disabled={createSessionMutation.isPending} className="px-5 py-2 h-10 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold rounded-xl shadow-md transition-colors">Simpan Sesi</button>
          </div>
        </form>
      </DialogModal>

      {/* Edit Session Modal */}
      <DialogModal
        open={showEditSessionModal}
        onOpenChange={setShowEditSessionModal}
        title="Edit Detail Sesi"
        description="Perbarui informasi dan parameter waktu untuk sesi orientasi."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateSession} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Judul Sesi</label>
            <input type="text" required value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-primary)] text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Deskripsi</label>
            <textarea rows="3" value={sessionForm.description} onChange={e => setSessionForm({...sessionForm, description: e.target.value})} className="w-full p-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-primary)] text-sm font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Mulai</label>
              <input type="date" value={sessionForm.start_date} onChange={e => setSessionForm({...sessionForm, start_date: e.target.value})} className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-primary)] text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Berakhir</label>
              <input type="date" value={sessionForm.end_date} onChange={e => setSessionForm({...sessionForm, end_date: e.target.value})} className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-primary)] text-sm font-semibold" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Status</label>
              <SelectField
                value={sessionForm.status}
                onValueChange={(val) => setSessionForm({ ...sessionForm, status: val })}
                className="w-full"
              >
                <SelectOption value="active">Aktif</SelectOption>
                <SelectOption value="locked">Terkunci</SelectOption>
                <SelectOption value="published">Diterbitkan</SelectOption>
              </SelectField>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Sifat</label>
              <SelectField
                value={String(sessionForm.is_required)}
                onValueChange={(val) => setSessionForm({ ...sessionForm, is_required: val === 'true' })}
                className="w-full"
              >
                <SelectOption value="true">Wajib</SelectOption>
                <SelectOption value="false">Opsional</SelectOption>
              </SelectField>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--theme-border-muted)]">
            <button type="button" onClick={() => setShowEditSessionModal(false)} className="px-4 py-2 text-xs font-bold text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] rounded-xl transition-colors">Batal</button>
            <button type="submit" disabled={updateSessionMutation.isPending} className="px-5 py-2 h-10 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold rounded-xl shadow-md transition-colors">Simpan Perubahan</button>
          </div>
        </form>
      </DialogModal>
    </div>
  );
};

export default Stages;

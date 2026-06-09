import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import {
  usePeriodsQuery, useStagesQuery, useCreateStageMutation, useUpdateStageMutation,
  useCreateSessionMutation, useUpdateSessionMutation,
  usePeriodPhasesQuery,
} from '../../../queries/useKencanaAdminQuery';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';
import { DashboardHero } from '@/components/ui/dashboard';
import { DialogModal } from '@/components/ui/DialogModal';

// ──── Constants ────────────────────────────────────────────────────────────────
const PHASE_CONFIG = {
  pra_kencana: {
    title: 'Pra-Kencana',
    subtitle: 'Kelola sesi persiapan, materi awal, tugas pembuka, dan kuis pra-orientasi.',
  },
  kencana_universitas: {
    title: 'Kencana Universitas',
    subtitle: 'Kelola sesi utama universitas, materi kebijakan kampus, tugas, dan kuis orientasi pusat.',
  },
  pasca_kencana: {
    title: 'Pasca-Kencana',
    subtitle: 'Kelola sesi refleksi, tugas akhir, kuis evaluasi, dan penutupan setelah orientasi utama.',
  },
};

const StatusBadge = ({ status }) => {
  const map = {
    published: 'bg-emerald-50 text-emerald-700',
    active: 'bg-emerald-50 text-emerald-700',
    locked: 'bg-slate-50 text-slate-600',
    draft: 'bg-amber-50 text-amber-700',
    completed: 'bg-indigo-50 text-indigo-700',
  };
  const labelMap = { published: 'Aktif', active: 'Aktif', locked: 'Terkunci', draft: 'Draft', completed: 'Selesai' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider', map[status] || 'bg-slate-50 text-slate-600')}>
      <span className={cn('w-1.5 h-1.5 rounded-full', status === 'active' || status === 'published' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
      {labelMap[status] || status}
    </span>
  );
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

  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showEditSessionModal, setShowEditSessionModal] = useState(false);
  const [activeStage, setActiveStage] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({ title: '', description: '', status: 'locked', is_required: true, start_date: '', end_date: '' });

  const createStageMutation = useCreateStageMutation();
  const updateStageMutation = useUpdateStageMutation();
  const createSessionMutation = useCreateSessionMutation();
  const updateSessionMutation = useUpdateSessionMutation();

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

  const set = (k, v) => setSessionForm(prev => ({ ...prev, [k]: v }));

  const phaseTimeline = phaseData?.timeline_phases?.find(item => item.phase_type === phaseType);
  const phaseStage = stages?.[0] || null;
  const phaseSessions = stages?.flatMap(stage => (stage.sessions || []).map(session => ({ ...session, stage }))) || [];
  const totalMaterials = phaseSessions.reduce((sum, session) => sum + getContentCount(session, 'materials'), 0);
  const totalQuizzes = phaseSessions.reduce((sum, session) => sum + getContentCount(session, 'quizzes'), 0);
  const totalAssignments = phaseSessions.reduce((sum, session) => sum + getContentCount(session, 'assignments'), 0);

  return (
    <div className="font-body max-w-7xl mx-auto space-y-4 pb-12">
      
      {/* Page Header (using Faculty Admin DashboardHero) */}
      <DashboardHero
        title="Sesi "
        highlightedTitle={phaseConfig.title}
        subtitle={phaseConfig.subtitle}
        icon="view_kanban"
        badges={[
          { label: 'Kencana Admin', active: false },
          { label: phaseTimeline?.is_active ? 'Fase Berjalan' : 'Fase Terkunci', active: true }
        ]}
        actions={
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-[220px]">
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                disabled={loadingPeriods}
                className="w-full h-9 px-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] shadow-sm appearance-none cursor-pointer transition-colors"
              >
                <option value="" disabled>Pilih Periode...</option>
                {periods?.map(p => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name} {p.status === 'active' || p.status === 'published' ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>expand_more</span>
              </div>
            </div>
            <button
              onClick={() => openAddSession(phaseStage)}
              disabled={!selectedPeriodId || createStageMutation.isPending}
              className="h-10 px-4 rounded-xl bg-primary hover:bg-bku-hover text-white text-xs font-bold uppercase tracking-wider gap-2 flex items-center transition-all active:scale-95 shadow-lg shadow-bku-primary/20 shrink-0 w-full sm:w-auto justify-center"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span> Tambah Sesi
            </button>
          </div>
        }
      />

      {/* Stats Section (using Faculty Admin Stat Card styling) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Timeline', value: `${formatDate(phaseTimeline?.start_date)} - ${formatDate(phaseTimeline?.end_date)}`, icon: 'event', bg: 'bg-primary/10', color: 'text-primary', desc: 'Jadwal pelaksanaan' },
          { label: 'Total Sesi', value: phaseSessions.length, icon: 'view_agenda', bg: 'bg-emerald-50 text-emerald-600', color: 'text-emerald-600', desc: 'Sesi pembelajaran' },
          { label: 'Materi & Kuis', value: totalMaterials + totalQuizzes, icon: 'library_books', bg: 'bg-amber-50 text-amber-600', color: 'text-amber-600', desc: 'Konten aktif' },
          { label: 'Tugas', value: totalAssignments, icon: 'assignment', bg: 'bg-indigo-50 text-indigo-600', color: 'text-indigo-600', desc: 'Tagihan utama' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg, s.color)}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{s.icon}</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
            </div>
            <p className={`font-extrabold text-slate-900 leading-none tabular-nums ${s.label === 'Timeline' ? 'text-sm mt-1' : 'text-2xl'}`}>
              {loadingStages ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span> : s.value}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-2">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="mt-8">
        {loadingStages ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !selectedPeriodId ? (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center text-slate-500 font-medium">
            Silakan pilih periode di atas.
          </div>
        ) : phaseSessions.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-4 text-slate-300">📚</div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Sesi</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              Sesi akan menjadi wadah untuk materi, tugas, dan kuis. Buat sesi pertama Anda untuk memulai.
            </p>
            <button
              onClick={() => openAddSession(phaseStage)}
              disabled={createStageMutation.isPending}
              className="h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2"
            >
              Tambah Sesi Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {phaseSessions.map((session) => (
              <div key={session.id} className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h4 className="font-bold text-slate-800 font-jakarta text-[14px] tracking-tight line-clamp-2">{session.title}</h4>
                    <StatusBadge status={session.status} />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium font-inter mt-0.5 line-clamp-2 mb-4 leading-relaxed">
                    {session.description || 'Tidak ada deskripsi untuk sesi ini.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                    <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200">Materi: {getContentCount(session, 'materials')}</span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200">Kuis: {getContentCount(session, 'quizzes')}</span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200">Tugas: {getContentCount(session, 'assignments')}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 mt-5 border-t border-slate-100/50">
                  <button onClick={() => openEditSession(session)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">edit</span> Edit
                  </button>
                  <button onClick={() => navigate(`/kencana-admin/sessions/${session.id}/content`)} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity flex items-center gap-1.5">
                    Kelola Konten <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Session Custom Modal (from Faculty Admin style) */}
      <DialogModal
        open={showAddSessionModal}
        onOpenChange={setShowAddSessionModal}
        title="Buat Sesi Baru"
        subtitle="Isi semua detail sesi di bawah ini dengan lengkap."
        icon={<span className="material-symbols-outlined">add_box</span>}
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowAddSessionModal(false)}
              className="px-5 h-10 rounded-xl border border-[var(--theme-border)] text-xs font-bold uppercase tracking-wider text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              form="createSessionForm"
              disabled={createSessionMutation.isPending}
              className="px-6 h-10 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white shadow-md active:scale-95 transition-all flex items-center gap-2"
            >
              {createSessionMutation.isPending ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span> : <span className="material-symbols-outlined text-[16px]">save</span>}
              <span>Simpan Sesi</span>
            </button>
          </>
        }
      >
        <form id="createSessionForm" onSubmit={handleCreateSession} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Judul Sesi</label>
            <input
              value={sessionForm.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Contoh: Sesi 1 - Pengenalan Kampus..."
              required
              className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Deskripsi Sesi</label>
            <textarea
              value={sessionForm.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Materi yang akan dibahas..."
              rows="3"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Tanggal Mulai</label>
              <input
                type="date"
                value={sessionForm.start_date}
                onChange={e => set('start_date', e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Tanggal Berakhir</label>
              <input
                type="date"
                value={sessionForm.end_date}
                onChange={e => set('end_date', e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Status Sesi</label>
              <select
                value={sessionForm.status}
                onChange={e => set('status', e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
              >
                <option value="active">Aktif</option>
                <option value="locked">Terkunci</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Sifat Sesi</label>
              <select
                value={String(sessionForm.is_required)}
                onChange={e => set('is_required', e.target.value === 'true')}
                className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
              >
                <option value="true">Wajib</option>
                <option value="false">Opsional</option>
              </select>
            </div>
          </div>
        </form>
      </DialogModal>

      {/* Edit Session Custom Modal */}
      <DialogModal
        open={showEditSessionModal}
        onOpenChange={setShowEditSessionModal}
        title="Update Detail Sesi"
        subtitle="Perbarui informasi sesi di bawah ini."
        icon={<span className="material-symbols-outlined">edit_square</span>}
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowEditSessionModal(false)}
              className="px-5 h-10 rounded-xl border border-[var(--theme-border)] text-xs font-bold uppercase tracking-wider text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              form="editSessionForm"
              disabled={updateSessionMutation.isPending}
              className="px-6 h-10 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white shadow-md active:scale-95 transition-all flex items-center gap-2"
            >
              {updateSessionMutation.isPending ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span> : <span className="material-symbols-outlined text-[16px]">save</span>}
              <span>Update Sesi</span>
            </button>
          </>
        }
      >
        <form id="editSessionForm" onSubmit={handleUpdateSession} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Judul Sesi</label>
            <input
              value={sessionForm.title}
              onChange={e => set('title', e.target.value)}
              required
              className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Deskripsi Sesi</label>
            <textarea
              value={sessionForm.description}
              onChange={e => set('description', e.target.value)}
              rows="3"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Tanggal Mulai</label>
              <input
                type="date"
                value={sessionForm.start_date}
                onChange={e => set('start_date', e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Tanggal Berakhir</label>
              <input
                type="date"
                value={sessionForm.end_date}
                onChange={e => set('end_date', e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Status Sesi</label>
              <select
                value={sessionForm.status}
                onChange={e => set('status', e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
              >
                <option value="active">Aktif</option>
                <option value="locked">Terkunci</option>
                <option value="published">Diterbitkan</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2 ml-1">Sifat Sesi</label>
              <select
                value={String(sessionForm.is_required)}
                onChange={e => set('is_required', e.target.value === 'true')}
                className="w-full h-12 px-4 rounded-2xl border border-slate-200/60 bg-transparent/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-transparent focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
              >
                <option value="true">Wajib</option>
                <option value="false">Opsional</option>
              </select>
            </div>
          </div>
        </form>
      </DialogModal>
    </div>
  );
};

export default Stages;

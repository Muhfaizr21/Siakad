import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePeriodsQuery, usePeriodPhasesQuery } from '../../../queries/useKencanaAdminQuery';
import {
  useCompleteFakultasPhaseMutation,
  useCreateFakultasSessionMutation,
  useCreateFakultasStageMutation,
  useFakultasPhaseQuery,
  useFakultasStagesQuery,
  useStartFakultasPhaseMutation,
  useUpdateFakultasPhaseMutation,
  useUpdateFakultasStageMutation,
} from '../../../queries/useKencanaFakultasQuery';
import { adminService } from '../../../services/api';
import useAuthStore from '../../../store/useAuthStore';
import Mentors from '../Admin/Mentors';
import Groups from '../Admin/Groups';
import { PageHeader } from '../../../components/ui/page/PageHeader';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';
import { DialogModal } from '../../../components/ui/DialogModal';

const badgeClass = {
  not_open: 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border-[var(--theme-border)]',
  ready: 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning-light)]',
  active: 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success-light)]',
  completed: 'bg-[var(--theme-info-light)] text-[var(--theme-info)] border-[var(--theme-info-light)]',
  locked: 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border-[var(--theme-border)]',
};

const badgeLabel = {
  not_open: 'Belum Dibuka',
  ready: 'Belum Aktif',
  active: 'Aktif',
  completed: 'Selesai',
  locked: 'Terkunci',
};

const Badge = ({ status }) => (
  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeClass[status] || 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border-[var(--theme-border)]'}`}>
    {badgeLabel[status] || status}
  </span>
);

const formatDate = (date) => date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const formatApiDate = (d) => {
  if (!d) return null;
  if (d.includes('T')) return d;
  return `${d}T00:00:00Z`;
};

const Stages = () => {
  const navigate = useNavigate();
  const basePath = window.location.pathname.startsWith('/kencana-fakultas') ? '/kencana-fakultas/stages' : '/kencana-admin/faculty-stages';
  const { facultyId } = useParams();
  const user = useAuthStore(state => state.user);
  const role = String(user?.role || '').toLowerCase();
  const canPickFaculty = role === 'super_admin' || role === 'kencana_admin';
  const { data: periods } = usePeriodsQuery();
  const [faculties, setFaculties] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(facultyId || '');
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [showStageModal, setShowStageModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [activeStage, setActiveStage] = useState(null);
  const [stageForm, setStageForm] = useState({ name: '', description: '', status: 'locked', start_date: '', end_date: '', is_published: false });
  const [sessionForm, setSessionForm] = useState({ title: '', description: '', status: 'locked', start_date: '', end_date: '', is_required: true, is_published: false });
  const [phaseForm, setPhaseForm] = useState({ start_date: '', end_date: '', theme: '', is_published: true });
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'stages');

  useEffect(() => {
    if (searchParams.get('tab') !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  useEffect(() => {
    setSelectedFacultyId(facultyId || '');
  }, [facultyId]);

  useEffect(() => {
    if (!canPickFaculty) return;
    adminService.getAllFaculties().then(res => {
      const rows = res?.data || [];
      setFaculties(rows);
    }).catch(() => setFaculties([]));
  }, [canPickFaculty]);

  useEffect(() => {
    if (periods?.length && !selectedPeriodId) {
      const active = periods.find(p => p.status === 'active' || p.university_phase_status === 'completed') || periods[0];
      setSelectedPeriodId(String(active.id));
    }
  }, [periods, selectedPeriodId]);

  const { data: periodPhasesData } = usePeriodPhasesQuery(selectedPeriodId);
  const allFacultyPhases = periodPhasesData?.faculty_phases || [];
  
  const scopeParams = canPickFaculty && selectedFacultyId ? { fakultas_id: selectedFacultyId } : {};
  const { data: phaseData } = useFakultasPhaseQuery(selectedPeriodId, scopeParams);
  const { data: stages, isLoading } = useFakultasStagesQuery(selectedPeriodId, scopeParams);
  const updatePhase = useUpdateFakultasPhaseMutation();
  const startPhase = useStartFakultasPhaseMutation();
  const completePhase = useCompleteFakultasPhaseMutation();
  const createStage = useCreateFakultasStageMutation();
  const updateStage = useUpdateFakultasStageMutation();
  const createSession = useCreateFakultasSessionMutation();

  const period = phaseData?.period;
  const phase = phaseData?.phase;
  const universityCompleted = true;
  const canManage = !!phase;

  useEffect(() => {
    if (phase) {
      setPhaseForm({
        start_date: phase.start_date ? phase.start_date.slice(0, 10) : '',
        end_date: phase.end_date ? phase.end_date.slice(0, 10) : '',
        theme: phase.theme || '',
        is_published: phase.is_published ?? true,
      });
    }
  }, [phase?.id]);

  const savePhase = () => {
    updatePhase.mutate({
      period_id: Number(selectedPeriodId),
      ...scopeParams,
      start_date: phaseForm.start_date || null,
      end_date: phaseForm.end_date || null,
      theme: phaseForm.theme,
      status: phase?.status === 'not_open' ? 'ready' : phase?.status,
      is_published: phaseForm.is_published,
    });
  };

  const openNewStage = () => {
    setActiveStage(null);
    setStageForm({ name: '', description: '', status: 'locked', start_date: '', end_date: '', is_published: false });
    setShowStageModal(true);
  };

  const openEditStage = (stage) => {
    setActiveStage(stage);
    setStageForm({
      name: stage.name || '',
      description: stage.description || '',
      status: stage.status || 'locked',
      start_date: stage.start_date ? stage.start_date.slice(0, 10) : '',
      end_date: stage.end_date ? stage.end_date.slice(0, 10) : '',
      is_published: Boolean(stage.is_published),
    });
    setShowStageModal(true);
  };

  const saveStage = (e) => {
    e.preventDefault();
    const payload = { ...stageForm, period_id: Number(selectedPeriodId), type: 'faculty', ...(selectedFacultyId ? { fakultas_id: Number(selectedFacultyId) } : {}) };
    if (activeStage) {
      updateStage.mutate({ id: activeStage.id, ...payload }, { onSuccess: () => setShowStageModal(false) });
    } else {
      createStage.mutate(payload, { onSuccess: () => setShowStageModal(false) });
    }
  };

  const ensureFacultyStage = async () => {
    if (stages?.length) return stages[0];
    if (!selectedPeriodId) return null;
    return createStage.mutateAsync({
      name: 'Kencana Fakultas',
      description: 'Wadah konten sesi Kencana Fakultas.',
      period_id: Number(selectedPeriodId),
      type: 'faculty',
      status: phase?.status === 'active' ? 'active' : 'locked',
      start_date: formatApiDate(phase?.start_date ? phase.start_date.slice(0, 10) : null),
      end_date: formatApiDate(phase?.end_date ? phase.end_date.slice(0, 10) : null),
      is_published: phase?.status === 'active',
      ...(selectedFacultyId ? { fakultas_id: Number(selectedFacultyId) } : {}),
    });
  };

  const openSession = async (stage = null) => {
    const targetStage = stage || await ensureFacultyStage();
    if (!targetStage) return;
    setActiveStage(targetStage);
    setSessionForm({
      title: '',
      description: '',
      status: phase?.status === 'active' ? 'active' : 'locked',
      start_date: phase?.start_date ? phase.start_date.slice(0, 10) : '',
      end_date: phase?.end_date ? phase.end_date.slice(0, 10) : '',
      is_required: true,
      is_published: phase?.status === 'active',
    });
    setShowSessionModal(true);
  };

  const saveSession = (e) => {
    e.preventDefault();
    const payload = { ...sessionForm, stage_id: activeStage.id };
    payload.start_date = formatApiDate(payload.start_date);
    payload.end_date = formatApiDate(payload.end_date);
    createSession.mutate(payload, { onSuccess: () => setShowSessionModal(false) });
  };

  const phaseStage = stages?.[0] || null;
  const sessions = stages?.flatMap(stage => (stage.sessions || []).map(session => ({ ...session, stage }))) || [];

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-body max-w-7xl mx-auto space-y-6">
      
      <PageHeader
        icon="school"
        title={
          <>
            <span className="text-[var(--theme-text)]">Kencana </span>
            <span className="text-[var(--theme-primary)]">Fakultas</span>
          </>
        }
        subtitle={
          selectedFacultyId 
            ? (faculties.find(f => String(f.id) === String(selectedFacultyId))?.Nama || faculties.find(f => String(f.id) === String(selectedFacultyId))?.nama || 'Sesi & Konten Fakultas') 
            : 'Kelola sesi, materi, kuis, dan tugas untuk Kencana Fakultas.'
        }
        breadcrumbs={[
          { label: 'Kencana Admin', path: '#' },
          { label: 'Kencana Fakultas' }
        ]}
        action={
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
            <SelectField
              value={selectedPeriodId}
              onValueChange={setSelectedPeriodId}
              placeholder="Pilih Periode..."
              className="min-w-[200px]"
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

      {canPickFaculty && !selectedFacultyId ? (
        <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden p-6">
          <div className="mb-6">
            <h2 className="text-base font-bold text-[var(--theme-text)]">Daftar Fakultas</h2>
            <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Pilih fakultas untuk mengelola sesi dan melihat status Kencana Fakultas mereka.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {faculties.map(faculty => {
              const fp = allFacultyPhases.find(p => p.fakultas_id === faculty.id) || null;
              return (
                <div key={faculty.id} className="p-5 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] hover:bg-white hover:border-[var(--theme-primary)] hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h3 className="font-bold text-[var(--theme-text)] text-sm leading-tight">{faculty.Nama || faculty.nama || `Fakultas ID ${faculty.id}`}</h3>
                      <div className="shrink-0"><Badge status={fp?.status || 'not_open'} /></div>
                    </div>
                    <div className="space-y-1 mb-4">
                      <p className="text-xs font-semibold text-[var(--theme-text-muted)] flex justify-between"><span>Mulai:</span> <span>{formatDate(fp?.start_date)}</span></p>
                      <p className="text-xs font-semibold text-[var(--theme-text-muted)] flex justify-between"><span>Selesai:</span> <span>{formatDate(fp?.end_date)}</span></p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`${basePath}/${faculty.id}?tab=stages`)} className="w-full h-9 bg-[var(--theme-primary-light)] hover:bg-[var(--theme-primary-light)]/80 text-[var(--theme-primary)] text-xs font-bold rounded-xl transition-colors">
                    Kelola Kencana Fakultas →
                  </button>
                </div>
              );
            })}
            {faculties.length === 0 && (
              <div className="col-span-full p-8 text-center text-[var(--theme-text-muted)] font-bold">Belum ada data fakultas.</div>
            )}
          </div>
        </div>
      ) : (
        <>
          {canPickFaculty && (
            <button onClick={() => navigate(basePath)} className="flex items-center gap-2 text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors mb-2">
              <span>←</span> Kembali ke Daftar Fakultas
            </button>
          )}

          <div className="flex gap-4 border-b border-[var(--theme-border-muted)] mb-6">
            <button onClick={() => setActiveTab('stages')} className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'stages' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'}`}>Sesi & Tahapan</button>
            <button onClick={() => setActiveTab('mentors')} className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'mentors' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'}`}>Dewan Pembimbing</button>
            <button onClick={() => setActiveTab('groups')} className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'groups' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'}`}>Kelompok Mahasiswa</button>
          </div>

          {activeTab === 'stages' && (
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-widest">Status Fase</p>
                    <h2 className="text-base font-bold text-[var(--theme-text)] mt-1">{period?.name || 'Periode Kencana'}</h2>
                  </div>
                  <Badge status={phase?.status || 'not_open'} />
                </div>
                {!universityCompleted && (
                  <div className="p-4 rounded-xl bg-[var(--theme-warning-light)] border border-[var(--theme-warning-light)] text-xs font-bold text-[var(--theme-warning)] leading-relaxed">Menunggu Kencana University selesai. Timeline fakultas belum bisa dimulai.</div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={phaseForm.start_date} disabled={!universityCompleted} onChange={e => setPhaseForm({ ...phaseForm, start_date: e.target.value })} className="px-3 h-10 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold disabled:opacity-50" />
                  <input type="date" value={phaseForm.end_date} disabled={!universityCompleted} onChange={e => setPhaseForm({ ...phaseForm, end_date: e.target.value })} className="px-3 h-10 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <input type="text" placeholder="Tema / Slogan Kencana Fakultas" value={phaseForm.theme} disabled={!universityCompleted} onChange={e => setPhaseForm({ ...phaseForm, theme: e.target.value })} className="w-full px-3 h-10 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold disabled:opacity-50 placeholder:text-[var(--theme-text-subtle)]" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={savePhase} disabled={!universityCompleted || updatePhase.isPending} className="h-10 rounded-xl bg-[var(--theme-text)] hover:bg-[var(--theme-text)]/90 text-white text-xs font-bold disabled:opacity-40 transition-colors">Simpan Jadwal Fakultas</button>
                  <button onClick={() => startPhase.mutate({ periodId: selectedPeriodId, ...scopeParams })} disabled={!universityCompleted || phase?.status === 'active' || startPhase.isPending} className="h-10 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold disabled:opacity-40 transition-colors">Mulai Kencana Fakultas</button>
                  <button onClick={() => completePhase.mutate({ periodId: selectedPeriodId, ...scopeParams })} disabled={phase?.status !== 'active' || completePhase.isPending} className="h-10 rounded-xl bg-[var(--theme-success)] hover:bg-[var(--theme-success)]/90 text-white text-xs font-bold disabled:opacity-40 transition-colors">Selesaikan Kencana Fakultas</button>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[var(--theme-text)]">Sesi Fakultas</h2>
                  <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Timeline fase: {formatDate(phase?.start_date)} - {formatDate(phase?.end_date)}. Tahap dipakai sebagai wadah teknis konten.</p>
                </div>
                <button onClick={() => openSession(phaseStage)} disabled={!canManage || createStage.isPending} className="h-10 px-5 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold disabled:opacity-40 transition-colors">+ Tambah Sesi</button>
              </div>

              {isLoading ? (
                <div className="p-12 text-center text-[var(--theme-text-muted)] font-bold">Memuat sesi...</div>
              ) : !sessions.length ? (
                <div className="bg-white border border-dashed border-[var(--theme-border)] rounded-2xl p-12 text-center shadow-sm">
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="text-base font-bold text-[var(--theme-text)]">Belum Ada Sesi Fakultas</h3>
                  <p className="text-xs font-semibold text-[var(--theme-text-muted)] max-w-xl mx-auto mt-2">Gunakan tombol Tambah Sesi untuk mulai menyusun konten Kencana Fakultas berdasarkan timeline fakultas terpilih.</p>
                  <button onClick={() => openSession(phaseStage)} disabled={!canManage || createStage.isPending} className="mt-6 h-10 px-6 rounded-xl bg-[var(--theme-text)] text-white text-xs font-bold disabled:opacity-40 transition-colors">+ Tambah Sesi Pertama</button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-[var(--theme-border-muted)] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--theme-bg)]">
                    <div>
                      <h3 className="text-base font-bold text-[var(--theme-text)]">Daftar Sesi</h3>
                      <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">{sessions.length} sesi dalam Kencana Fakultas.</p>
                    </div>
                    {phaseStage && <button onClick={() => openEditStage(phaseStage)} disabled={!canManage} className="h-9 px-4 rounded-xl bg-[var(--theme-primary-light)] text-[var(--theme-primary)] text-xs font-bold disabled:opacity-40 transition-colors">Atur Wadah Konten</button>}
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {sessions.map(session => (
                      <div key={session.id} className="p-5 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] hover:bg-white hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-bold text-[var(--theme-text)] text-sm line-clamp-2">{session.title}</p>
                            <div className="shrink-0"><Badge status={session.status} /></div>
                          </div>
                          <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-2 line-clamp-2">{session.description || 'Tidak ada deskripsi.'}</p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--theme-border-muted)] mt-4">
                          <span className="text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider">{session.is_required ? 'Wajib' : 'Opsional'}</span>
                          <button onClick={() => navigate(`${window.location.pathname.startsWith('/kencana-fakultas') ? '/kencana-fakultas' : window.location.pathname.startsWith('/kencana-fakult') ? '/kencana-fakult' : '/kencana-admin'}/sessions/${session.id}/content`)} className="h-8 px-3.5 text-xs font-bold text-[var(--theme-primary)] bg-[var(--theme-primary-light)] hover:bg-[var(--theme-primary-light)]/80 rounded-lg transition-colors cursor-pointer">Kelola Konten →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
          {activeTab === 'mentors' && (
            <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm p-2">
              <Mentors portal="fakultas" facultyId={selectedFacultyId} />
            </div>
          )}
          {activeTab === 'groups' && (
            <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm p-2">
              <Groups portal="fakultas" facultyId={selectedFacultyId} />
            </div>
          )}
        </>
      )}

      <DialogModal
        open={showStageModal}
        onOpenChange={setShowStageModal}
        title={activeStage ? 'Edit Tahap Fakultas' : 'Tambah Tahap Fakultas'}
        subtitle="Atur identitas, jadwal, dan status tahap wadah konten."
      >
        <form onSubmit={saveStage} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Nama Tahap *</label>
            <input 
              required 
              value={stageForm.name} 
              onChange={e => setStageForm({ ...stageForm, name: e.target.value })} 
              placeholder="Nama tahap" 
              className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Deskripsi</label>
            <textarea 
              rows="2" 
              value={stageForm.description} 
              onChange={e => setStageForm({ ...stageForm, description: e.target.value })} 
              placeholder="Deskripsi" 
              className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] resize-y transition-all" 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Mulai</label>
              <input 
                type="date" 
                value={stageForm.start_date} 
                onChange={e => setStageForm({ ...stageForm, start_date: e.target.value })} 
                className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Selesai</label>
              <input 
                type="date" 
                value={stageForm.end_date} 
                onChange={e => setStageForm({ ...stageForm, end_date: e.target.value })} 
                className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Status</label>
              <SelectField 
                value={stageForm.status} 
                onValueChange={val => setStageForm({ ...stageForm, status: val })} 
                className="w-full"
              >
                <SelectOption value="locked">Terkunci</SelectOption>
                <SelectOption value="active">Aktif</SelectOption>
                <SelectOption value="completed">Selesai</SelectOption>
              </SelectField>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer h-10 px-4 border border-[var(--theme-border)] rounded-xl bg-[var(--theme-bg)] hover:bg-[var(--theme-border-muted)] transition-colors">
                <input 
                  type="checkbox" 
                  checked={stageForm.is_published} 
                  onChange={e => setStageForm({ ...stageForm, is_published: e.target.checked })} 
                  className="w-4 h-4 text-[var(--theme-primary)] rounded focus:ring-[var(--theme-primary)]" 
                />
                <span className="text-sm font-semibold text-[var(--theme-text)]">Publish</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--theme-border-muted)]">
            <button type="button" onClick={() => setShowStageModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] text-xs transition-colors">Batal</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs transition-colors">Simpan</button>
          </div>
        </form>
      </DialogModal>

      <DialogModal
        open={showSessionModal}
        onOpenChange={setShowSessionModal}
        title="Tambah Sesi Fakultas"
        subtitle="Buat sesi baru sebagai bagian dari tahapan Kencana Fakultas."
      >
        <form onSubmit={saveSession} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Judul Sesi *</label>
            <input 
              required 
              value={sessionForm.title} 
              onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })} 
              placeholder="Judul sesi" 
              className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Deskripsi</label>
            <textarea 
              rows="2" 
              value={sessionForm.description} 
              onChange={e => setSessionForm({ ...sessionForm, description: e.target.value })} 
              placeholder="Deskripsi" 
              className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] resize-y transition-all" 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Mulai</label>
              <input 
                type="date" 
                value={sessionForm.start_date} 
                onChange={e => setSessionForm({ ...sessionForm, start_date: e.target.value })} 
                className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Selesai</label>
              <input 
                type="date" 
                value={sessionForm.end_date} 
                onChange={e => setSessionForm({ ...sessionForm, end_date: e.target.value })} 
                className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Status</label>
              <SelectField 
                value={sessionForm.status} 
                onValueChange={val => setSessionForm({ ...sessionForm, status: val })} 
                className="w-full"
              >
                <SelectOption value="locked">Terkunci</SelectOption>
                <SelectOption value="active">Aktif</SelectOption>
                <SelectOption value="published">Published</SelectOption>
              </SelectField>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer h-10 px-4 border border-[var(--theme-border)] rounded-xl bg-[var(--theme-bg)] hover:bg-[var(--theme-border-muted)] transition-colors">
                <input 
                  type="checkbox" 
                  checked={sessionForm.is_published} 
                  onChange={e => setSessionForm({ ...sessionForm, is_published: e.target.checked })} 
                  className="w-4 h-4 text-[var(--theme-primary)] rounded focus:ring-[var(--theme-primary)]" 
                />
                <span className="text-sm font-semibold text-[var(--theme-text)]">Publish</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--theme-border-muted)]">
            <button type="button" onClick={() => setShowSessionModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] text-xs transition-colors">Batal</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs transition-colors">Simpan</button>
          </div>
        </form>
      </DialogModal>
    </div>
  );
};

export default Stages;

import React, { useEffect, useMemo, useState } from 'react';
import {
  useCreatePeriodMutation,
  useUpdatePeriodMutation,
  useUploadMediaMutation,
  useOpenFacultyPhasesMutation,
  usePeriodPhasesQuery,
  usePeriodsQuery,
  useUpdateTimelinePhaseMutation,
  useUpdateUniversityPhaseMutation,
} from '../../../queries/useKencanaAdminQuery';
import toast from 'react-hot-toast';
import { PageHeader } from '../../../components/ui/page/PageHeader';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';
import { DialogModal } from '../../../components/ui/DialogModal';

const phases = [
  { key: 'pra_kencana', title: 'Pra-Kencana', hint: 'Persiapan, briefing awal, handbook, dan tugas pembuka.', tone: 'violet' },
  { key: 'kencana_universitas', title: 'Kencana University', hint: 'Orientasi utama tingkat universitas.', tone: 'emerald' },
  { key: 'kencana_fakultas', title: 'Kencana Fakultas', hint: 'Orientasi per fakultas setelah University selesai.', tone: 'sky' },
  { key: 'pasca_kencana', title: 'Pasca-Kencana', hint: 'Refleksi, remedial, penutupan, dan sertifikat.', tone: 'amber' },
];

const statusClass = {
  active: 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success-light)]',
  completed: 'bg-[var(--theme-info-light)] text-[var(--theme-info)] border-[var(--theme-info-light)]',
  inactive: 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border-[var(--theme-border)]',
  not_open: 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border-[var(--theme-border)]',
};

const statusLabel = {
  active: 'Aktif',
  completed: 'Selesai',
  inactive: 'Nonaktif',
  not_open: 'Belum Aktif',
};

const toneClass = {
  violet: 'from-[var(--theme-primary-light)] to-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-primary)]',
  emerald: 'from-[var(--theme-success-light)] to-[var(--theme-surface)] border-[var(--theme-success-light)] text-[var(--theme-success)]',
  sky: 'from-[var(--theme-info-light)] to-[var(--theme-surface)] border-[var(--theme-info-light)] text-[var(--theme-info)]',
  amber: 'from-[var(--theme-warning-light)] to-[var(--theme-surface)] border-[var(--theme-warning-light)] text-[var(--theme-warning)]',
};

const Badge = ({ status }) => (
  <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${statusClass[status] || statusClass.inactive}`}>
    {statusLabel[status] || 'Belum Aktif'}
  </span>
);

const fmtDate = (value) => value ? new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Belum diatur';

const Periods = () => {
  const { data: periods, isLoading } = usePeriodsQuery();
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [activePhase, setActivePhase] = useState('pra_kencana');
  const [phaseDraft, setPhaseDraft] = useState(() => phases.reduce((acc, item) => ({ ...acc, [item.key]: { start: '', end: '' } }), {}));
  const [form, setForm] = useState({ name: '', year: new Date().getFullYear(), description: '', start_date: '', end_date: '', status: 'draft', theme: '', banner_url: '', guidebook_url: '', passing_grade: 0, remedial_grade: 0, intro_video_url: '' });

  const { data: phaseData, isLoading: loadingPhases } = usePeriodPhasesQuery(selectedPeriodId);
  const createPeriod = useCreatePeriodMutation();
  const updatePeriod = useUpdatePeriodMutation();
  const uploadMedia = useUploadMediaMutation();
  const updateTimelinePhase = useUpdateTimelinePhaseMutation();
  const updateUniversityPhase = useUpdateUniversityPhaseMutation();
  const openFacultyPhases = useOpenFacultyPhasesMutation();

  useEffect(() => {
    if (periods?.length && !selectedPeriodId) {
      const active = periods.find(p => p.status === 'active' || p.university_phase_status === 'active') || periods[0];
      setSelectedPeriodId(String(active.id));
    }
  }, [periods, selectedPeriodId]);

  const selectedPeriod = phaseData?.period || periods?.find(p => String(p.id) === String(selectedPeriodId));
  const facultyPhases = phaseData?.faculty_phases || [];
  const timelinePhases = phaseData?.timeline_phases || [];
  const universityStatus = selectedPeriod?.university_phase_status || 'draft';
  const savedTimeline = useMemo(() => timelinePhases.reduce((acc, phase) => ({ ...acc, [phase.phase_type]: phase }), {}), [timelinePhases]);
  const activeSavedPhase = useMemo(() => timelinePhases.find(phase => phase.is_active)?.phase_type || '', [timelinePhases]);
  const activePhaseMeta = useMemo(() => phases.find(phase => phase.key === activePhase) || phases[0], [activePhase]);
  const activePhaseTimeline = savedTimeline[activePhase] || null;

  useEffect(() => {
    if (!timelinePhases.length) return;
    setPhaseDraft(prev => {
      const next = { ...prev };
      timelinePhases.forEach(phase => {
        next[phase.phase_type] = {
          start: phase.start_date ? phase.start_date.slice(0, 10) : '',
          end: phase.end_date ? phase.end_date.slice(0, 10) : '',
        };
      });
      return next;
    });
  }, [timelinePhases]);

  useEffect(() => {
    if (activeSavedPhase) setActivePhase(activeSavedPhase);
  }, [activeSavedPhase]);

  const phaseState = useMemo(() => ({
    pra_kencana: savedTimeline.pra_kencana?.is_active ? 'active' : 'inactive',
    kencana_universitas: savedTimeline.kencana_universitas?.is_active ? 'active' : universityStatus === 'completed' ? 'completed' : 'inactive',
    kencana_fakultas: savedTimeline.kencana_fakultas?.is_active ? 'active' : 'inactive',
    pasca_kencana: savedTimeline.pasca_kencana?.is_active ? 'active' : 'inactive',
  }), [savedTimeline, universityStatus]);

  const handleCreate = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      year: Number(form.year) || new Date().getFullYear(),
      passing_grade: Number(form.passing_grade) || 0,
      remedial_grade: Number(form.remedial_grade) || 0,
      start_date: form.start_date ? `${form.start_date}T00:00:00Z` : null,
      end_date: form.end_date ? `${form.end_date}T00:00:00Z` : null,
    };
    const onSuccess = (period) => {
      setShowCreate(false);
      setForm({ id: null, name: '', year: new Date().getFullYear(), description: '', start_date: '', end_date: '', status: 'draft', theme: '', banner_url: '', guidebook_url: '', passing_grade: 0, remedial_grade: 0, intro_video_url: '' });
      if (period?.id) setSelectedPeriodId(String(period.id));
      toast.success(form.id ? 'Periode berhasil diperbarui!' : 'Periode berhasil dibuat!');
    };

    if (form.id) {
      updatePeriod.mutate(payload, { onSuccess });
    } else {
      createPeriod.mutate(payload, { onSuccess });
    }
  };

  const openEdit = () => {
    if (!selectedPeriod) return;
    setForm({
      id: selectedPeriod.id,
      name: selectedPeriod.name || '',
      year: selectedPeriod.year || new Date().getFullYear(),
      description: selectedPeriod.description || '',
      start_date: selectedPeriod.start_date ? selectedPeriod.start_date.slice(0, 10) : '',
      end_date: selectedPeriod.end_date ? selectedPeriod.end_date.slice(0, 10) : '',
      status: selectedPeriod.status || 'draft',
      theme: selectedPeriod.theme || '',
      banner_url: selectedPeriod.banner_url || '',
      guidebook_url: selectedPeriod.guidebook_url || '',
      passing_grade: selectedPeriod.passing_grade || 0,
      remedial_grade: selectedPeriod.remedial_grade || 0,
      intro_video_url: selectedPeriod.intro_video_url || '',
    });
    setShowCreate(true);
  };

  const updateDraft = (key, field, value) => {
    setPhaseDraft(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const saveTimeline = (makeActive = false) => {
    if (!selectedPeriod) {
      toast.error('Pilih periode terlebih dahulu.');
      return;
    }
    if (!phaseDraft[activePhase]?.start || !phaseDraft[activePhase]?.end) {
      toast.error('Tanggal mulai dan selesai wajib diisi.');
      return;
    }
    const keepActive = Boolean(savedTimeline[activePhase]?.is_active);
    updateTimelinePhase.mutate({
      periodId: selectedPeriod.id,
      phaseType: activePhase,
      start_date: phaseDraft[activePhase]?.start || null,
      end_date: phaseDraft[activePhase]?.end || null,
      status: makeActive || keepActive ? 'active' : 'draft',
      is_active: makeActive || keepActive,
    }, {
      onSuccess: () => toast.success(makeActive ? 'Timeline disimpan dan fase diaktifkan.' : 'Timeline berhasil disimpan.'),
      onError: (err) => toast.error(err?.response?.data?.message || err?.message || 'Gagal menyimpan timeline.'),
    });
  };

  return (
    <div className="bg-transparent font-body max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <PageHeader
        icon="calendar_month"
        title={
          <>
            <span className="text-[var(--theme-text)]">Kelola </span>
            <span className="text-[var(--theme-primary)]">Timeline</span>
          </>
        }
        subtitle="Atur periode, rentang waktu Pra-Kencana, Kencana University, Kencana Fakultas, dan Pasca-Kencana. Pilih fase yang sedang aktif agar alur orientasi lebih jelas."
        breadcrumbs={[
          { label: 'Kencana Admin', path: '#' },
          { label: 'Kelola Timeline' }
        ]}
        action={
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
            <SelectField
              value={selectedPeriodId}
              onValueChange={setSelectedPeriodId}
              placeholder="Pilih Periode"
              className="min-w-[200px]"
            >
              {(periods || []).map(period => (
                <SelectOption key={period.id} value={String(period.id)}>
                  {period.name}
                </SelectOption>
              ))}
            </SelectField>
            {selectedPeriod && (
              <button onClick={openEdit} className="h-10 rounded-xl border border-[var(--theme-border)] bg-white px-5 text-xs font-semibold text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors">
                Edit Periode
              </button>
            )}
            <button
              onClick={() => {
                setForm({ id: null, name: '', year: new Date().getFullYear(), description: '', start_date: '', end_date: '', status: 'draft', theme: '', banner_url: '', guidebook_url: '', passing_grade: 0, remedial_grade: 0, intro_video_url: '' });
                setShowCreate(true);
              }}
              className="h-10 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] px-5 text-xs font-bold text-white shadow-md transition-colors"
            >
              + Buat Periode
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--theme-border)] bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-text-subtle)]">Periode & Tahap Aktif</p>
            <h2 className="mt-2 text-base font-bold text-[var(--theme-text)] break-words">{selectedPeriod?.name || 'Belum dipilih'}</h2>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-[var(--theme-text-muted)]">{selectedPeriod?.description || 'Pilih periode untuk mengatur timeline Kencana.'}</p>
            {selectedPeriod?.theme && (
              <div className="mt-4 p-3 rounded-xl bg-[var(--theme-info-light)] border border-[var(--theme-info-light)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-info)]">Tema Kencana</p>
                <p className="mt-1 text-xs font-bold text-[var(--theme-text)] leading-relaxed italic">"{selectedPeriod.theme}"</p>
                {selectedPeriod.passing_grade > 0 && <p className="mt-2 text-[10px] font-bold text-[var(--theme-text-muted)]">Passing Grade: <span className="text-[var(--theme-info)] font-bold">{selectedPeriod.passing_grade}</span></p>}
                {selectedPeriod.remedial_grade > 0 && <p className="mt-1 text-[10px] font-bold text-[var(--theme-text-muted)]">Batas Remedial: <span className="text-[var(--theme-warning)] font-bold">{selectedPeriod.remedial_grade}</span></p>}
              </div>
            )}
            <div className="mt-4 rounded-xl border border-[var(--theme-success-light)] bg-[var(--theme-success-light)] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-bold text-[var(--theme-success)]">{activePhaseMeta?.title}</span>
                <Badge status={phaseState[activePhase]} />
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-relaxed text-[var(--theme-success)] opacity-90">{activePhaseMeta?.hint}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-bold text-[var(--theme-text-muted)]">
              <div className="rounded-xl bg-[var(--theme-bg)] p-3 min-w-0"><span className="block text-[var(--theme-text-subtle)] text-[10px] uppercase font-bold mb-0.5">Mulai Tahap</span><span className="break-words text-[var(--theme-text)]">{fmtDate(activePhaseTimeline?.start_date || phaseDraft[activePhase]?.start)}</span></div>
              <div className="rounded-xl bg-[var(--theme-bg)] p-3 min-w-0"><span className="block text-[var(--theme-text-subtle)] text-[10px] uppercase font-bold mb-0.5">Selesai Tahap</span><span className="break-words text-[var(--theme-text)]">{fmtDate(activePhaseTimeline?.end_date || phaseDraft[activePhase]?.end)}</span></div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--theme-border)] bg-white p-2 shadow-sm space-y-1">
            {phases.map(phase => (
              <button key={phase.key} onClick={() => setActivePhase(phase.key)} className={`w-full rounded-xl p-3 text-left transition-all ${activePhase === phase.key ? 'bg-[var(--theme-primary)] text-white shadow-md' : 'text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)]'}`}>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="text-xs font-bold truncate">{phase.title}</span>
                  <Badge status={phaseState[phase.key]} />
                </div>
                <p className={`mt-1 line-clamp-2 text-[11px] font-semibold leading-relaxed ${activePhase === phase.key ? 'text-white/80' : 'text-[var(--theme-text-subtle)]'}`}>{phase.hint}</p>
              </button>
            ))}
          </div>
        </aside>

        <main className="space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
            {phases.map(phase => (
              <div key={phase.key} className={`rounded-2xl border bg-gradient-to-br p-4 min-w-0 ${toneClass[phase.tone]}`}>
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <h3 className="text-xs font-bold truncate">{phase.title}</h3>
                  <Badge status={phaseState[phase.key]} />
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-[var(--theme-text-subtle)] opacity-70">Timeline</p>
                <p className="mt-1 text-xs font-bold break-words leading-relaxed">
                  {phaseDraft[phase.key]?.start || 'Mulai?'} - {phaseDraft[phase.key]?.end || 'Selesai?'}
                </p>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-[var(--theme-border)] bg-white p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 border-b border-[var(--theme-border-muted)] pb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-text-subtle)]">Pengaturan Fase</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--theme-text)]">{phases.find(p => p.key === activePhase)?.title}</h2>
                <p className="mt-1 text-xs font-semibold text-[var(--theme-text-muted)]">Tentukan rentang waktu dan status aktif untuk fase ini.</p>
              </div>
              <Badge status={phaseState[activePhase]} />
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
              {activePhase === 'pasca_kencana' ? (
                <div className="col-span-full rounded-xl bg-[var(--theme-info-light)] p-6 text-center border border-[var(--theme-info-light)]">
                  <span className="material-symbols-outlined text-[var(--theme-info)] text-4xl mb-3">verified</span>
                  <h3 className="text-lg font-bold text-[var(--theme-info)]">Rekapitulasi Nilai & Kelulusan</h3>
                  <p className="mt-2 text-sm font-medium text-[var(--theme-text-muted)] max-w-lg mx-auto">
                    Fase Pasca-Kencana tidak membutuhkan pengaturan tanggal atau status aktif. Fase ini otomatis menampilkan rekapan nilai dan sertifikat berdasarkan data dari tahap sebelumnya.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--theme-text-muted)]">Tanggal Mulai</span>
                      <input type="date" value={phaseDraft[activePhase]?.start || ''} onChange={e => updateDraft(activePhase, 'start', e.target.value)} className="h-10 w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--theme-text-muted)]">Tanggal Selesai</span>
                      <input type="date" value={phaseDraft[activePhase]?.end || ''} onChange={e => updateDraft(activePhase, 'end', e.target.value)} className="h-10 w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
                    </label>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {activePhase === 'kencana_universitas' ? (
                      <>
                        <button disabled={!selectedPeriod} onClick={() => { saveTimeline(true); updateUniversityPhase.mutate({ periodId: selectedPeriod.id, action: 'start' }); }} className="h-10 w-full rounded-xl bg-[var(--theme-success)] hover:bg-[var(--theme-success)]/90 text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 transition-colors">Set University Aktif</button>
                        <button disabled={!selectedPeriod || universityStatus !== 'active'} onClick={() => updateUniversityPhase.mutate({ periodId: selectedPeriod.id, action: 'complete' })} className="h-10 w-full rounded-xl bg-[var(--theme-info)] hover:bg-[var(--theme-info)]/90 text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 transition-colors">Selesaikan University</button>
                      </>
                    ) : activePhase === 'kencana_fakultas' ? (
                      <>
                        <button onClick={() => saveTimeline(true)} disabled={!selectedPeriod} className="h-10 w-full rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 transition-colors">Set Fakultas Aktif</button>
                        <button disabled={!selectedPeriod || universityStatus !== 'completed'} onClick={() => openFacultyPhases.mutate(selectedPeriod.id)} className="h-10 w-full rounded-xl bg-[var(--theme-info)] hover:bg-[var(--theme-info)]/90 text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 transition-colors">Buka Semua Fakultas</button>
                      </>
                    ) : (
                      <button onClick={() => saveTimeline(true)} className="h-10 w-full rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Set Fase Aktif</button>
                    )}
                    <button onClick={() => saveTimeline(false)} disabled={updateTimelinePhase.isPending} className="h-10 w-full rounded-xl border border-[var(--theme-border)] bg-white text-[var(--theme-text-muted)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--theme-bg)] disabled:opacity-40 transition-colors">{updateTimelinePhase.isPending ? 'Menyimpan...' : 'Simpan Timeline'}</button>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--theme-border)] bg-white shadow-sm overflow-hidden">
            <div className="border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)] px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--theme-text)]">Timeline Kencana Fakultas</h3>
                <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Super admin dapat memantau status setiap fakultas dari sini.</p>
              </div>
              {loadingPhases && <span className="text-xs font-bold text-[var(--theme-text-subtle)]">Memuat...</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6 bg-[var(--theme-surface)]">
              {facultyPhases.map(phase => (
                <div key={phase.id} className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg)] p-4 min-w-0">
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--theme-text)]">{phase.fakultas?.Nama || phase.fakultas?.nama || `Fakultas #${phase.fakultas_id}`}</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--theme-text-muted)]">{fmtDate(phase.start_date)} - {fmtDate(phase.end_date)}</p>
                    </div>
                    <Badge status={phase.status} />
                  </div>
                </div>
              ))}
              {!facultyPhases.length && <p className="col-span-full py-8 text-center text-sm font-semibold text-[var(--theme-text-subtle)]">Belum ada timeline fakultas untuk periode ini.</p>}
            </div>
          </section>
        </main>
      </div>

      <DialogModal
        open={showCreate}
        onOpenChange={setShowCreate}
        title={form.id ? 'Edit Periode Kencana' : 'Buat Periode Kencana'}
        description="Lengkapi data periode di bawah untuk mengatur parameter Kencana."
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kolom Kiri */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--theme-text-subtle)] mb-2 border-b border-[var(--theme-border-muted)] pb-2">Informasi Dasar</h3>
              <label className="block space-y-1">
                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest pl-1">Nama Periode</span>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Kencana 2026" className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest pl-1">Tahun Ajaran</span>
                <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="Contoh: 2026" className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest pl-1">Deskripsi Singkat</span>
                <textarea rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Tuliskan deskripsi periode..." className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest pl-1">Mulai Periode</span>
                  <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest pl-1">Selesai Periode</span>
                  <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
                </label>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--theme-text-subtle)] mb-2 border-b border-[var(--theme-border-muted)] pb-2">Pengaturan Ekstra</h3>
              <label className="block space-y-1">
                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest pl-1">Tema / Slogan Kencana (Opsional)</span>
                <input value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} placeholder="Contoh: Semangat Generasi Emas" className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest pl-1">Batas Kelulusan / Passing Grade</span>
                <input type="number" step="0.1" value={form.passing_grade} onChange={e => setForm({ ...form, passing_grade: parseFloat(e.target.value) || 0 })} placeholder="Contoh: 75" className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest pl-1">Batas Remedial (Minimal Nilai)</span>
                <input type="number" step="0.1" value={form.remedial_grade} onChange={e => setForm({ ...form, remedial_grade: parseFloat(e.target.value) || 0 })} placeholder="Contoh: 50" className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--theme-border-muted)]">
            <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2.5 rounded-xl font-bold text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] transition-colors">Batal</button>
            <button disabled={createPeriod.isPending || updatePeriod.isPending} className="px-6 py-2.5 rounded-xl font-bold bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white shadow-md disabled:opacity-50 transition-colors">
              {form.id ? 'Perbarui Periode' : 'Simpan Periode'}
            </button>
          </div>
        </form>
      </DialogModal>
    </div>
  );
};

export default Periods;

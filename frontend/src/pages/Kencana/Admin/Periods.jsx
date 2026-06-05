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

const phases = [
  { key: 'pra_kencana', title: 'Pra-Kencana', hint: 'Persiapan, briefing awal, handbook, dan tugas pembuka.', tone: 'violet' },
  { key: 'kencana_universitas', title: 'Kencana University', hint: 'Orientasi utama tingkat universitas.', tone: 'emerald' },
  { key: 'kencana_fakultas', title: 'Kencana Fakultas', hint: 'Orientasi per fakultas setelah University selesai.', tone: 'sky' },
  { key: 'pasca_kencana', title: 'Pasca-Kencana', hint: 'Refleksi, remedial, penutupan, dan sertifikat.', tone: 'amber' },
];

const statusClass = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  not_open: 'bg-slate-100 text-slate-500 border-slate-200',
};

const statusLabel = {
  active: 'Aktif',
  completed: 'Selesai',
  inactive: 'Nonaktif',
  not_open: 'Belum Aktif',
};

const toneClass = {
  violet: 'from-violet-50 to-white border-violet-100 text-violet-700',
  emerald: 'from-emerald-50 to-white border-emerald-100 text-emerald-700',
  sky: 'from-sky-50 to-white border-sky-100 text-sky-700',
  amber: 'from-amber-50 to-white border-amber-100 text-amber-700',
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

  const facultyStats = useMemo(() => facultyPhases.reduce((acc, phase) => {
    acc[phase.status] = (acc[phase.status] || 0) + 1;
    return acc;
  }, {}), [facultyPhases]);

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

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadMedia.mutateAsync(formData);
      if (res?.url) {
        setForm(prev => ({ ...prev, [field]: res.url }));
        toast.success('File berhasil diunggah!');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal mengunggah file.');
    }
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">Kencana Timeline Center</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Kelola Timeline</h1>
            <p className="mt-2 max-w-3xl text-xs md:text-sm font-semibold leading-relaxed text-slate-500">
              Atur periode, rentang waktu Pra-Kencana, Kencana University, Kencana Fakultas, dan Pasca-Kencana. Pilih fase yang sedang aktif agar alur orientasi lebih jelas.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={selectedPeriodId} onChange={e => setSelectedPeriodId(e.target.value)} className="h-11 min-w-[240px] rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100">
              <option value="">Pilih Periode</option>
              {(periods || []).map(period => <option key={period.id} value={period.id}>{period.name}</option>)}
            </select>
            {selectedPeriod && (
              <button onClick={openEdit} className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors">Edit Periode</button>
            )}
            <button onClick={() => { setForm({ id: null, name: '', year: new Date().getFullYear(), description: '', start_date: '', end_date: '', status: 'draft', theme: '', banner_url: '', guidebook_url: '', passing_grade: 0, remedial_grade: 0, intro_video_url: '' }); setShowCreate(true); }} className="h-11 rounded-2xl bg-slate-900 px-5 text-xs font-black text-white shadow-lg shadow-slate-900/10 hover:bg-emerald-700 transition-colors">+ Buat Periode</button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-5">
        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Periode & Tahap Aktif</p>
            <h2 className="mt-2 text-base font-black text-slate-900 break-words">{selectedPeriod?.name || 'Belum dipilih'}</h2>
            <p className="mt-1 line-clamp-3 text-xs font-semibold leading-relaxed text-slate-500">{selectedPeriod?.description || 'Pilih periode untuk mengatur timeline Kencana.'}</p>
            {selectedPeriod?.theme && (
              <div className="mt-3 p-3 rounded-2xl bg-sky-50 border border-sky-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">Tema Kencana</p>
                <p className="mt-1 text-xs font-bold text-slate-800 leading-relaxed italic">"{selectedPeriod.theme}"</p>
                {selectedPeriod.passing_grade > 0 && <p className="mt-2 text-[10px] font-black text-slate-500">Passing Grade: <span className="text-sky-700">{selectedPeriod.passing_grade}</span></p>}
                {selectedPeriod.remedial_grade > 0 && <p className="mt-1 text-[10px] font-black text-slate-500">Batas Remedial: <span className="text-amber-600">{selectedPeriod.remedial_grade}</span></p>}
              </div>
            )}
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-black text-emerald-900">{activePhaseMeta?.title}</span>
                <Badge status={phaseState[activePhase]} />
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-relaxed text-emerald-700/80">{activePhaseMeta?.hint}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-black text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-3 min-w-0"><span className="block text-slate-400">Mulai Tahap</span><span className="break-words">{fmtDate(activePhaseTimeline?.start_date || phaseDraft[activePhase]?.start)}</span></div>
              <div className="rounded-2xl bg-slate-50 p-3 min-w-0"><span className="block text-slate-400">Selesai Tahap</span><span className="break-words">{fmtDate(activePhaseTimeline?.end_date || phaseDraft[activePhase]?.end)}</span></div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
            {phases.map(phase => (
              <button key={phase.key} onClick={() => setActivePhase(phase.key)} className={`w-full rounded-2xl p-3 text-left transition-all ${activePhase === phase.key ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-600 hover:bg-slate-50'}`}>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="text-xs font-black truncate">{phase.title}</span>
                  <Badge status={phaseState[phase.key]} />
                </div>
                <p className={`mt-1 line-clamp-2 text-[11px] font-semibold leading-relaxed ${activePhase === phase.key ? 'text-slate-300' : 'text-slate-400'}`}>{phase.hint}</p>
              </button>
            ))}
          </div>
        </aside>

        <main className="space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-3">
            {phases.map(phase => (
              <div key={phase.key} className={`rounded-3xl border bg-gradient-to-br p-4 min-w-0 ${toneClass[phase.tone]}`}>
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <h3 className="text-xs font-black text-slate-900 truncate">{phase.title}</h3>
                  <Badge status={phaseState[phase.key]} />
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Timeline</p>
                <p className="mt-1 text-xs font-black text-slate-700 break-words leading-relaxed">
                  {phaseDraft[phase.key]?.start || 'Mulai?'} - {phaseDraft[phase.key]?.end || 'Selesai?'}
                </p>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 border-b border-slate-100 pb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pengaturan Fase</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">{phases.find(p => p.key === activePhase)?.title}</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">Tentukan rentang waktu dan status aktif untuk fase ini.</p>
              </div>
              <Badge status={phaseState[activePhase]} />
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
              {activePhase === 'pasca_kencana' ? (
                <div className="col-span-full rounded-2xl bg-blue-50/50 p-6 text-center border border-blue-100">
                  <span className="material-symbols-outlined text-blue-300 text-4xl mb-3">verified</span>
                  <h3 className="text-lg font-black text-blue-900">Rekapitulasi Nilai & Kelulusan</h3>
                  <p className="mt-2 text-sm font-medium text-blue-700/80 max-w-lg mx-auto">
                    Fase Pasca-Kencana tidak membutuhkan pengaturan tanggal atau status aktif. Fase ini otomatis menampilkan rekapan nilai dan sertifikat berdasarkan data dari tahap sebelumnya.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-2">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Tanggal Mulai</span>
                      <input type="date" value={phaseDraft[activePhase]?.start || ''} onChange={e => updateDraft(activePhase, 'start', e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-100" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Tanggal Selesai</span>
                      <input type="date" value={phaseDraft[activePhase]?.end || ''} onChange={e => updateDraft(activePhase, 'end', e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-100" />
                    </label>
                  </div>
                  <div className="space-y-3">
                    {activePhase === 'kencana_universitas' ? (
                      <>
                        <button disabled={!selectedPeriod} onClick={() => { saveTimeline(true); updateUniversityPhase.mutate({ periodId: selectedPeriod.id, action: 'start' }); }} className="h-11 w-full rounded-2xl bg-emerald-600 px-4 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-40">Set University Aktif</button>
                        <button disabled={!selectedPeriod || universityStatus !== 'active'} onClick={() => updateUniversityPhase.mutate({ periodId: selectedPeriod.id, action: 'complete' })} className="h-11 w-full rounded-2xl bg-blue-600 px-4 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-40">Selesaikan University</button>
                      </>
                    ) : activePhase === 'kencana_fakultas' ? (
                      <>
                        <button onClick={() => saveTimeline(true)} disabled={!selectedPeriod} className="h-11 w-full rounded-2xl bg-slate-900 px-4 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-40">Set Fakultas Aktif</button>
                        <button disabled={!selectedPeriod || universityStatus !== 'completed'} onClick={() => openFacultyPhases.mutate(selectedPeriod.id)} className="h-11 w-full rounded-2xl bg-sky-600 px-4 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-40">Buka Semua Fakultas</button>
                      </>
                    ) : (
                      <button onClick={() => saveTimeline(true)} className="h-11 w-full rounded-2xl bg-slate-900 px-4 text-[10px] font-black uppercase tracking-widest text-white">Set Fase Aktif</button>
                    )}
                    <button onClick={() => saveTimeline(false)} disabled={updateTimelinePhase.isPending} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 disabled:opacity-40">{updateTimelinePhase.isPending ? 'Menyimpan...' : 'Simpan Timeline'}</button>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Timeline Kencana Fakultas</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Super admin dapat memantau status setiap fakultas dari sini.</p>
              </div>
              {loadingPhases && <span className="text-xs font-black text-slate-400">Memuat...</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
              {facultyPhases.map(phase => (
                <div key={phase.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 min-w-0">
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">{phase.fakultas?.Nama || phase.fakultas?.nama || `Fakultas #${phase.fakultas_id}`}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{fmtDate(phase.start_date)} - {fmtDate(phase.end_date)}</p>
                    </div>
                    <Badge status={phase.status} />
                  </div>
                </div>
              ))}
              {!facultyPhases.length && <p className="col-span-full py-8 text-center text-sm font-semibold text-slate-500">Belum ada timeline fakultas untuk periode ini.</p>}
            </div>
          </section>
        </main>
      </div>

      {showCreate && (
        <div className="fixed inset-0 lg:left-72 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800">{form.id ? 'Edit Periode Kencana' : 'Buat Periode Kencana'}</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">x</button>
            </div>
            <form onSubmit={handleCreate} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Kolom Kiri */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 pb-2">Informasi Dasar</h3>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Periode</span>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Kencana 2026" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tahun Ajaran</span>
                    <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="Contoh: 2026" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Deskripsi Singkat</span>
                    <textarea rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Tuliskan deskripsi periode..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500" />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mulai Periode</span>
                      <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500" />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Selesai Periode</span>
                      <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500" />
                    </label>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 pb-2">Pengaturan Ekstra</h3>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tema / Slogan Kencana (Opsional)</span>
                    <input value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} placeholder="Contoh: Semangat Generasi Emas" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Batas Kelulusan / Passing Grade</span>
                    <input type="number" step="0.1" value={form.passing_grade} onChange={e => setForm({ ...form, passing_grade: parseFloat(e.target.value) || 0 })} placeholder="Contoh: 75" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Batas Remedial (Minimal Nilai)</span>
                    <input type="number" step="0.1" value={form.remedial_grade} onChange={e => setForm({ ...form, remedial_grade: parseFloat(e.target.value) || 0 })} placeholder="Contoh: 50" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Batal</button>
                <button disabled={createPeriod.isPending || updatePeriod.isPending} className="px-6 py-3 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-colors">
                  {form.id ? 'Perbarui Periode' : 'Simpan Periode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Periods;

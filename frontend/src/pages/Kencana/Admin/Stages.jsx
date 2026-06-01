import React, { useState, useEffect } from 'react';
import { 
  usePeriodsQuery, 
  useStagesQuery, 
  useCreateStageMutation, 
  useUpdateStageMutation,
  useSessionsQuery,
  useCreateSessionMutation,
  useCreateQuizMutation
} from '../../../queries/useKencanaAdminQuery';

const Stages = () => {
  const { data: periods, isLoading: loadingPeriods } = usePeriodsQuery();
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  
  useEffect(() => {
    if (periods?.length > 0 && !selectedPeriodId) {
      const active = periods.find(p => p.is_active) || periods[0];
      setSelectedPeriodId(active.id);
    }
  }, [periods, selectedPeriodId]);

  const { data: stages, isLoading: loadingStages } = useStagesQuery(selectedPeriodId);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showSessionDetailModal, setShowSessionDetailModal] = useState(false);
  const [showAddQuizModal, setShowAddQuizModal] = useState(false);
  
  // Active states
  const [activeStage, setActiveStage] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  // Forms state
  const [stageForm, setStageForm] = useState({ name: '', type: 'university', status: 'locked' });
  const [sessionForm, setSessionForm] = useState({ title: '', description: '', status: 'locked', is_required: true });
  const [quizForm, setQuizForm] = useState({ title: '', duration_minutes: 30, max_attempts: 1, status: 'draft' });

  // Mutations
  const createStageMutation = useCreateStageMutation();
  const updateStageMutation = useUpdateStageMutation();
  const createSessionMutation = useCreateSessionMutation();
  const createQuizMutation = useCreateQuizMutation();

  // Queries
  // Fetch detailed sessions for the active stage when viewing a session
  const { data: detailedSessions, isLoading: loadingSessions } = useSessionsQuery(activeStage?.id);

  // Handlers
  const handleCreateStage = (e) => {
    e.preventDefault();
    if (!selectedPeriodId) return;
    createStageMutation.mutate(
      { ...stageForm, period_id: Number(selectedPeriodId) },
      {
        onSuccess: () => {
          setShowAddModal(false);
          setStageForm({ name: '', type: 'university', status: 'locked' });
        }
      }
    );
  };

  const handleUpdateStage = (e) => {
    e.preventDefault();
    updateStageMutation.mutate(
      { id: activeStage.id, ...stageForm },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setActiveStage(null);
        }
      }
    );
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!activeStage) return;
    createSessionMutation.mutate(
      { ...sessionForm, stage_id: activeStage.id },
      {
        onSuccess: () => {
          setShowAddSessionModal(false);
          setSessionForm({ title: '', description: '', status: 'locked', is_required: true });
        }
      }
    );
  };

  const handleAddQuizSubmit = (e) => {
    e.preventDefault();
    if(!activeSession) return;
    createQuizMutation.mutate({ ...quizForm, session_id: activeSession.id }, {
      onSuccess: () => {
        setShowAddQuizModal(false);
        setQuizForm({ title: '', duration_minutes: 30, max_attempts: 1, status: 'draft' });
      }
    });
  };

  const openEditStage = (stage) => {
    setActiveStage(stage);
    setStageForm({ name: stage.name, type: stage.type, status: stage.status });
    setShowEditModal(true);
  };

  const openAddSession = (stage) => {
    setActiveStage(stage);
    setSessionForm({ title: '', description: '', status: 'locked', is_required: true });
    setShowAddSessionModal(true);
  };

  const openSessionDetail = (stage, session) => {
    setActiveStage(stage);
    setActiveSession(session);
    setShowSessionDetailModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
      case 'active':
        return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Aktif</span>;
      case 'locked':
        return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Terkunci</span>;
      default:
        return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Tahap & Sesi Orientasi</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">Kelola tahapan kegiatan dan sesi materi untuk PKKMB Kencana.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none">
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-violet-500 outline-none"
              disabled={loadingPeriods}
            >
              <option value="" disabled>Pilih Periode...</option>
              {periods?.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.is_active ? '(Aktif)' : ''}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setStageForm({ name: '', type: 'university', status: 'locked' });
              setShowAddModal(true);
            }}
            disabled={!selectedPeriodId}
            className="whitespace-nowrap bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Tambah Tahap
          </button>
        </div>
      </div>

      {/* Content */}
      {loadingStages ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-violet-600"></div>
        </div>
      ) : !selectedPeriodId ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center text-amber-800 font-bold">
          Silakan pilih periode terlebih dahulu untuk mengelola tahap.
        </div>
      ) : stages?.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-16 text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <h2 className="text-lg font-black text-slate-700 mb-2">Belum Ada Tahapan</h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto">Periode ini belum memiliki tahapan PKKMB. Silakan buat tahap pertama untuk mulai menyusun materi.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {stages?.map((stage, idx) => (
            <div key={stage.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group">
              {/* Stage Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-xl flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-lg font-black text-slate-800">{stage.name}</h2>
                      {getStatusBadge(stage.status)}
                      <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {stage.type === 'university' ? 'Universitas' : 'Fakultas'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                      {stage.start_date ? new Date(stage.start_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}) : '-'} s/d {stage.end_date ? new Date(stage.end_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}) : '-'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => openEditStage(stage)}
                  className="text-sm font-bold text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-xl transition-colors"
                >
                  Edit Tahap
                </button>
              </div>

              {/* Sessions List */}
              <div className="p-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Sesi dalam Tahap ini</h3>
                
                {!stage.sessions?.length ? (
                  <div className="bg-slate-50 rounded-2xl p-6 text-center text-slate-500 font-medium text-sm border border-slate-100 border-dashed">
                    Belum ada sesi materi atau tugas pada tahap ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stage.sessions.map((session) => (
                      <div key={session.id} className="border border-slate-100 rounded-2xl p-5 hover:border-violet-200 hover:shadow-md transition-all bg-white relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
                        <div>
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h4 className="font-bold text-slate-800 line-clamp-2">{session.title}</h4>
                            <div className="shrink-0">{getStatusBadge(session.status)}</div>
                          </div>
                          <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-4">{session.description || 'Tidak ada deskripsi.'}</p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                             {session.is_required ? 'Wajib' : 'Opsional'}
                           </span>
                           <button 
                            onClick={() => openSessionDetail(stage, session)}
                            className="text-xs font-bold text-slate-600 hover:text-violet-600 transition-colors"
                           >
                             Lihat Detail &rarr;
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4">
                  <button 
                    onClick={() => openAddSession(stage)}
                    className="text-sm font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Tambah Sesi Baru
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      
      {/* 1. Add/Edit Stage Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">
                {showEditModal ? 'Edit Tahap' : 'Buat Tahap Baru'}
              </h2>
              <button onClick={() => {setShowAddModal(false); setShowEditModal(false);}} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={showEditModal ? handleUpdateStage : handleCreateStage} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Tahap</label>
                <input 
                  type="text" 
                  required
                  value={stageForm.name}
                  onChange={e => setStageForm({...stageForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="Contoh: Pra-Kencana, Hari Pertama, dll"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cakupan</label>
                  <select 
                    value={stageForm.type}
                    onChange={e => setStageForm({...stageForm, type: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                  >
                    <option value="university">Universitas</option>
                    <option value="faculty">Fakultas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    value={stageForm.status}
                    onChange={e => setStageForm({...stageForm, status: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                  >
                    <option value="locked">Terkunci (Locked)</option>
                    <option value="active">Aktif (Active)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => {setShowAddModal(false); setShowEditModal(false);}}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={createStageMutation.isPending || updateStageMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {(createStageMutation.isPending || updateStageMutation.isPending) ? 'Menyimpan...' : 'Simpan Tahap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Session Modal */}
      {showAddSessionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800">Buat Sesi Baru</h2>
                <p className="text-xs font-bold text-violet-600 mt-1 uppercase tracking-wider">Tahap: {activeStage?.name}</p>
              </div>
              <button onClick={() => setShowAddSessionModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleCreateSession} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Sesi</label>
                <input 
                  type="text" 
                  required
                  value={sessionForm.title}
                  onChange={e => setSessionForm({...sessionForm, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="Contoh: Pengenalan Kampus"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</label>
                <textarea 
                  rows="3"
                  value={sessionForm.description}
                  onChange={e => setSessionForm({...sessionForm, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="Opsional: Deskripsi singkat materi sesi ini"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    value={sessionForm.status}
                    onChange={e => setSessionForm({...sessionForm, status: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                  >
                    <option value="locked">Terkunci (Locked)</option>
                    <option value="active">Aktif (Active)</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-xl bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={sessionForm.is_required}
                      onChange={e => setSessionForm({...sessionForm, is_required: e.target.checked})}
                      className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                    />
                    <span className="text-sm font-bold text-slate-700">Sesi Wajib</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddSessionModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={createSessionMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {createSessionMutation.isPending ? 'Menyimpan...' : 'Buat Sesi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. View Session Detail Modal */}
      {showSessionDetailModal && activeSession && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-white/60">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-gradient-to-br from-violet-50 via-white to-slate-50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-black text-slate-800">{activeSession.title}</h2>
                  {getStatusBadge(activeSession.status)}
                </div>
                <p className="text-sm font-medium text-slate-600 max-w-xl">{activeSession.description || 'Tidak ada deskripsi.'}</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] font-black text-violet-600 bg-violet-100 px-2 py-1 rounded-md uppercase tracking-wider">Tahap: {activeStage?.name}</span>
                  <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">{activeSession.is_required ? 'Wajib' : 'Opsional'}</span>
                </div>
              </div>
              <button onClick={() => setShowSessionDetailModal(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50/60 flex-1">
              {loadingSessions ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Detailed Data from backend: Since backend ListSessions preloads Materials, Quizzes, Assignments, we extract it from detailedSessions matching this ID */}
                  {(() => {
                    const fullSession = detailedSessions?.find(s => s.id === activeSession.id) || activeSession;
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Materials */}
                        <div className="border border-blue-100 rounded-3xl p-5 bg-white shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                              Materi Pembelajaran
                            </h3>
                            <span className="text-xs font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{fullSession.materials?.length || 0}</span>
                          </div>
                          {!fullSession.materials?.length ? (
                            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 font-bold">Belum ada materi ditambahkan.</p>
                          ) : (
                            <ul className="space-y-2">
                              {fullSession.materials.map(m => (
                                <li key={m.id} className="text-sm font-semibold text-slate-700 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{m.title}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Quizzes */}
                        <div className="border border-amber-100 rounded-3xl p-5 bg-white shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              Kuis
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{fullSession.quizzes?.length || 0}</span>
                              <button onClick={() => setShowAddQuizModal(true)} className="text-xs font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors border border-amber-200">
                                + Tambah
                              </button>
                            </div>
                          </div>
                          {!fullSession.quizzes?.length ? (
                            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 font-bold">Belum ada kuis ditambahkan.</p>
                          ) : (
                            <ul className="space-y-2">
                              {fullSession.quizzes.map(q => (
                                <li key={q.id} className="text-sm font-semibold text-slate-700 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                                  <span>{q.title}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400">{q.duration_minutes}m</span>
                                    <button 
                                      onClick={() => window.location.href = `/kencana-admin/quiz/${q.id}/builder`}
                                      className="text-xs font-bold text-violet-600 hover:text-violet-700 hover:bg-violet-50 px-2 py-1 rounded transition-colors"
                                    >
                                      Edit Soal &rarr;
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Assignments */}
                        <div className="border border-rose-100 rounded-3xl p-5 md:col-span-2 bg-white shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                              <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                              Tugas (Assignments)
                            </h3>
                            <span className="text-xs font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">{fullSession.assignments?.length || 0}</span>
                          </div>
                          {!fullSession.assignments?.length ? (
                            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 font-bold">Belum ada tugas ditambahkan.</p>
                          ) : (
                            <ul className="space-y-2">
                              {fullSession.assignments.map(a => (
                                <li key={a.id} className="text-sm font-semibold text-slate-700 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex justify-between">
                                  <span>{a.title}</span>
                                  <span className="text-xs font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded">{a.submission_type}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowSessionDetailModal(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
              >
                Tutup Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Add Quiz Modal */}
      {showAddQuizModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden scale-in">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-800">Buat Kuis Baru</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Tambahkan kuis evaluasi untuk sesi <span className="font-bold">{activeSession?.title}</span>.</p>
            </div>
            
            <form onSubmit={handleAddQuizSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Judul Kuis</label>
                  <input 
                    type="text" 
                    required
                    value={quizForm.title}
                    onChange={e => setQuizForm({...quizForm, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all font-semibold outline-none"
                    placeholder="Contoh: Kuis Pemahaman Visi Misi"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Durasi (Menit)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={quizForm.duration_minutes}
                      onChange={e => setQuizForm({...quizForm, duration_minutes: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Maksimal Percobaan</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={quizForm.max_attempts}
                      onChange={e => setQuizForm({...quizForm, max_attempts: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all font-semibold outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Status Kuis</label>
                  <select 
                    value={quizForm.status}
                    onChange={e => setQuizForm({...quizForm, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none font-semibold"
                  >
                    <option value="draft">Draft (Belum Ditampilkan)</option>
                    <option value="published">Dipublikasikan</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddQuizModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={createQuizMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 transition-colors"
                >
                  {createQuizMutation.isPending ? 'Menyimpan...' : 'Simpan Kuis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Stages;

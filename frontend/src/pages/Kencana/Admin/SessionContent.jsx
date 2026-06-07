import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useSessionDetailQuery, useDeleteMaterialMutation, useDeleteAssignmentMutation, useUpdateSessionMutation, useUpdateQuizMutation, useDeleteQuizMutation
} from '../../../queries/useKencanaAdminQuery';

const BACKEND_URL = 'http://localhost:8000';

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

const FileIcon = ({ type }) => {
  const icons = { pdf: '📄', video: '🎬', file: '📎', text: '📝', link: '🔗' };
  return <span className="text-xl">{icons[type] || '📎'}</span>;
};

const SessionContent = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [sessionTab, setSessionTab] = useState('materi');
  const basePath = window.location.pathname.startsWith('/kencana-fakultas') ? '/kencana-fakultas' : window.location.pathname.startsWith('/kencana-fakult') ? '/kencana-fakult' : '/kencana-admin';

  const { data: session, isLoading } = useSessionDetailQuery(sessionId);
  const deleteMaterialMutation = useDeleteMaterialMutation();
  const deleteAssignmentMutation = useDeleteAssignmentMutation();

  const [showEditSessionModal, setShowEditSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({ title: '', description: '', status: 'locked', is_required: true, start_date: '', end_date: '' });
  const updateSessionMutation = useUpdateSessionMutation();
  const updateQuizMutation = useUpdateQuizMutation();
  const deleteQuizMutation = useDeleteQuizMutation();

  const handleDeleteQuiz = (quizId) => {
    if (window.confirm('Hapus kuis ini? Semua soal di dalamnya akan ikut terhapus.')) {
      deleteQuizMutation.mutate(quizId);
    }
  };

  const [showEditQuizModal, setShowEditQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ 
    title: '', 
    duration_minutes: 30, 
    max_attempts: 1, 
    open_at: '',
    close_at: '',
    status: 'draft' 
  });

  const openEditSession = () => {
    if (!session) return;
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

  const formatApiDate = (d) => {
    if (!d) return null;
    if (d.includes('T')) {
      if (d.length === 16) return d + ':00Z';
      if (d.length === 19) return d + 'Z';
      return d;
    }
    return `${d}T00:00:00Z`;
  };

  const handleUpdateSession = (e) => {
    e.preventDefault();
    if (!session) return;
    const payload = { ...sessionForm };
    payload.start_date = formatApiDate(payload.start_date);
    payload.end_date = formatApiDate(payload.end_date);
    updateSessionMutation.mutate(
      { id: session.id, ...payload },
      { onSuccess: () => { setShowEditSessionModal(false); } }
    );
  };

  const openEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      duration_minutes: quiz.duration_minutes || 30,
      max_attempts: quiz.max_attempts || 1,
      open_at: quiz.open_at ? quiz.open_at.slice(0, 16) : '',
      close_at: quiz.close_at ? quiz.close_at.slice(0, 16) : '',
      status: quiz.status || 'draft'
    });
    setShowEditQuizModal(true);
  };

  const handleUpdateQuiz = (e) => {
    e.preventDefault();
    if (!editingQuiz) return;
    const payload = { ...quizForm };
    payload.open_at = formatApiDate(payload.open_at);
    payload.close_at = formatApiDate(payload.close_at);
    
    updateQuizMutation.mutate(
      { id: editingQuiz.id, ...payload },
      { onSuccess: () => { setShowEditQuizModal(false); setEditingQuiz(null); } }
    );
  };

  const handleDeleteMaterial = (id) => {
    if (window.confirm('Hapus materi ini?')) {
      deleteMaterialMutation.mutate(id);
    }
  };

  const handleDeleteAssignment = (id) => {
    if (window.confirm('Hapus tugas ini?')) {
      deleteAssignmentMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-violet-600"></div></div>;
  }

  const handleBack = () => {
    if (!session?.stage?.type) {
      navigate(-1);
      return;
    }
    const type = session.stage.type;
    const isFakultasPortal = basePath.includes('fakult');
    if (type === 'faculty') navigate(`${basePath}/${isFakultasPortal ? 'stages' : 'faculty-stages'}` + (session.stage.fakultas_id ? `?faculty=${session.stage.fakultas_id}` : ''));
    else if (type === 'pra_kencana') navigate(`${basePath}/pre-kencana`);
    else if (type === 'pasca_kencana') navigate(`${basePath}/post-kencana`);
    else navigate(`${basePath}/university`);
  };

  if (!session) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Sesi Tidak Ditemukan</h2>
          <p className="text-slate-500">Sesi yang Anda cari tidak ada atau telah dihapus.</p>
          <button onClick={() => navigate(basePath)} className="mt-6 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm">Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-br from-violet-50 via-white to-slate-50 relative">
          <button onClick={handleBack} className="absolute top-6 left-6 text-slate-400 hover:text-slate-700 transition-colors">
            ← Kembali
          </button>
          <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-800">{session.title}</h1>
                <StatusBadge status={session.status} />
                <button onClick={openEditSession} className="text-[10px] font-black text-violet-600 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded">Edit Sesi</button>
              </div>
              <p className="text-sm md:text-base text-slate-600 max-w-2xl">{session.description || 'Tidak ada deskripsi untuk sesi ini.'}</p>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs font-bold text-slate-500">
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl">Wajib: {session.is_required ? 'Ya' : 'Tidak'}</span>
              <span>{session.start_date ? new Date(session.start_date).toLocaleDateString('id-ID') : '-'} s/d {session.end_date ? new Date(session.end_date).toLocaleDateString('id-ID') : '-'}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 bg-white border-b border-slate-100 overflow-x-auto">
          {[
            { key: 'materi', label: '📚 Materi', count: session?.materials?.length },
            { key: 'quiz', label: '📝 Kuis', count: session?.quizzes?.length },
            { key: 'tugas', label: '📋 Tugas', count: session?.assignments?.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSessionTab(tab.key)}
              className={`px-5 py-3 rounded-t-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                sessionTab === tab.key 
                  ? 'bg-violet-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${sessionTab === tab.key ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                {tab.count || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 bg-slate-50/50 min-h-[400px]">
          {/* TAB: Materi */}
          {sessionTab === 'materi' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800">Daftar Materi</h3>
                <button 
                  onClick={() => navigate(`${basePath}/sessions/${session.id}/material/create`)} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all"
                >
                  + Tambah Materi
                </button>
              </div>

              {!session.materials?.length ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="font-bold">Belum ada materi</p>
                  <p className="text-sm">Mulai tambahkan materi bacaan, video, atau file presentasi.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.materials.map(m => (
                    <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between">
                      <div className="flex gap-4 items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <FileIcon type={m.type} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 truncate" title={m.title}>{m.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">{m.type}</p>
                          {m.original_file_name && <p className="text-xs text-slate-500 truncate mt-1">{m.original_file_name}</p>}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-50">
                        {m.file_url && (
                          <a href={`${BACKEND_URL}${m.file_url}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                            Buka File
                          </a>
                        )}
                        <button onClick={() => navigate(`${basePath}/sessions/${session.id}/material/${m.id}/edit`)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteMaterial(m.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors">
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Kuis */}
          {sessionTab === 'quiz' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800">Daftar Kuis</h3>
                <button 
                  onClick={() => navigate(`${basePath}/sessions/${session.id}/quiz/create`)} 
                  className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all"
                >
                  + Tambah Kuis
                </button>
              </div>

              {!session.quizzes?.length ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500">
                  <div className="text-4xl mb-3">⏱️</div>
                  <p className="font-bold">Belum ada kuis</p>
                  <p className="text-sm">Uji pemahaman peserta dengan menambahkan kuis.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.quizzes.map(q => (
                    <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-slate-800 line-clamp-2">{q.title}</h4>
                        <StatusBadge status={q.status} />
                      </div>
                      <div className="flex gap-4 mb-4">
                        <div className="flex flex-col bg-slate-50 rounded-lg p-2 flex-1 items-center border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Durasi</span>
                          <span className="text-sm font-black text-slate-700">{q.duration_minutes} Menit</span>
                        </div>
                        <div className="flex flex-col bg-slate-50 rounded-lg p-2 flex-1 items-center border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Max Coba</span>
                          <span className="text-sm font-black text-slate-700">{q.max_attempts}x</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-50 mt-4">
                        <button onClick={() => navigate(`${basePath}/sessions/${session.id}/quiz/${q.id}/edit`)} className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors flex-1 md:flex-none text-center">
                          Edit Kuis
                        </button>
                        <button onClick={() => navigate(`${basePath}/quiz/${q.id}/builder`)} className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-sm flex-1 md:flex-none text-center">
                          Kelola Soal →
                        </button>
                        <button onClick={() => handleDeleteQuiz(q.id)} className="px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Tugas */}
          {sessionTab === 'tugas' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800">Daftar Tugas</h3>
                <button 
                  onClick={() => navigate(`${basePath}/sessions/${session.id}/assignment/create`)} 
                  className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all"
                >
                  + Tambah Tugas
                </button>
              </div>

              {!session.assignments?.length ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="font-bold">Belum ada tugas</p>
                  <p className="text-sm">Berikan tugas proyek atau individu untuk peserta.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {session.assignments.map(a => (
                    <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-rose-300 hover:shadow-lg transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-bold text-slate-800 line-clamp-2">{a.title}</h4>
                          <StatusBadge status={a.status} />
                        </div>
                        <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-3">{a.description || 'Tidak ada instruksi.'}</p>
                        <div className="space-y-2 mt-4">
                          <div className="flex items-center justify-between text-xs font-bold bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-400">Tipe Pengumpulan</span>
                            <span className="text-slate-700 uppercase">{a.submission_type}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-bold bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-400">Tenggat Waktu</span>
                            <span className={new Date(a.due_date) < new Date() ? 'text-rose-600' : 'text-emerald-600'}>
                              {a.due_date ? new Date(a.due_date).toLocaleString('id-ID') : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-50 mt-4">
                        <button onClick={() => navigate(`${basePath}/sessions/${session.id}/assignment/${a.id}/edit`)} className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors flex-1 md:flex-none text-center">
                          Edit Tugas
                        </button>
                        <button onClick={() => handleDeleteAssignment(a.id)} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-rose-600 transition-colors">
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
                <button type="submit" disabled={updateSessionMutation.isPending} className="px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-black rounded-xl">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl my-8">
            <h3 className="text-lg font-black text-slate-800 mb-6">Edit Pengaturan Kuis</h3>
            <form onSubmit={handleUpdateQuiz} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Judul Kuis</label>
                <input type="text" required value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm font-semibold" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Durasi (Menit)</label>
                  <input type="number" required min="1" value={quizForm.duration_minutes} onChange={e => setQuizForm({...quizForm, duration_minutes: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Maksimal Percobaan</label>
                  <input type="number" required min="1" value={quizForm.max_attempts} onChange={e => setQuizForm({...quizForm, max_attempts: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm font-semibold" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Waktu Buka (Open At)</label>
                  <input type="datetime-local" value={quizForm.open_at} onChange={e => setQuizForm({...quizForm, open_at: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Tenggat (Close At)</label>
                  <input type="datetime-local" value={quizForm.close_at} onChange={e => setQuizForm({...quizForm, close_at: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm font-semibold" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Status</label>
                <select value={quizForm.status} onChange={e => setQuizForm({...quizForm, status: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm font-semibold">
                  <option value="draft">Draft (Disembunyikan)</option>
                  <option value="published">Diterbitkan (Aktif)</option>
                  <option value="closed">Ditutup</option>
                </select>
                <p className="text-[11px] text-amber-600 mt-2 font-bold">Pastikan status "Diterbitkan (Aktif)" agar kuis bisa dikerjakan.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowEditQuizModal(false)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={updateQuizMutation.isPending} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-black rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center gap-2">
                  {updateQuizMutation.isPending ? 'Menyimpan...' : 'Simpan Kuis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionContent;

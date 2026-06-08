import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useSessionDetailQuery, useDeleteMaterialMutation, useDeleteAssignmentMutation, useUpdateSessionMutation, useUpdateQuizMutation, useDeleteQuizMutation
} from '../../../queries/useKencanaAdminQuery';
import { PageHeader } from '../../../components/ui/page/PageHeader';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';
import { DialogModal } from '../../../components/ui/DialogModal';

const BACKEND_URL = 'http://localhost:8000';

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[var(--theme-border)]">
          <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">Sesi Tidak Ditemukan</h2>
          <p className="text-[var(--theme-text-muted)] font-medium text-sm">Sesi yang Anda cari tidak ada atau telah dihapus.</p>
          <button onClick={() => navigate(basePath)} className="mt-6 h-10 px-6 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-bold text-xs transition-colors">Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent font-body max-w-5xl mx-auto space-y-6">
      
      {/* Back button */}
      <div>
        <button onClick={handleBack} className="text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors">
          ← Kembali ke Wadah Konten
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 border-b border-[var(--theme-border-muted)] bg-gradient-to-br from-[var(--theme-primary-light)] via-white to-[var(--theme-bg)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-[var(--theme-text)]">{session.title}</h1>
                <StatusBadge status={session.status} />
                <button onClick={openEditSession} className="text-[10px] font-bold text-[var(--theme-primary)] bg-[var(--theme-primary-light)] hover:bg-[var(--theme-primary-light)]/80 px-2 py-0.5 rounded transition-colors">Edit Sesi</button>
              </div>
              <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-2 max-w-2xl leading-relaxed">{session.description || 'Tidak ada deskripsi untuk sesi ini.'}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 text-[10px] font-bold text-[var(--theme-text-muted)]">
              <span className="bg-[var(--theme-bg)] border border-[var(--theme-border)] px-2.5 py-1 rounded-lg">Sifat: {session.is_required ? 'Wajib' : 'Opsional'}</span>
              <span>{session.start_date ? new Date(session.start_date).toLocaleDateString('id-ID') : '-'} s/d {session.end_date ? new Date(session.end_date).toLocaleDateString('id-ID') : '-'}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 bg-white border-b border-[var(--theme-border-muted)] overflow-x-auto">
          {[
            { key: 'materi', label: '📚 Materi', count: session?.materials?.length },
            { key: 'quiz', label: '📝 Kuis', count: session?.quizzes?.length },
            { key: 'tugas', label: '📋 Tugas', count: session?.assignments?.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSessionTab(tab.key)}
              className={`px-5 py-3 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
                sessionTab === tab.key 
                  ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] bg-[var(--theme-bg)]' 
                  : 'border-transparent text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)]'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${sessionTab === tab.key ? 'bg-[var(--theme-primary)] text-white' : 'bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]'}`}>
                {tab.count || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 bg-[var(--theme-bg)]/20 min-h-[400px]">
          {/* TAB: Materi */}
          {sessionTab === 'materi' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-[var(--theme-text)]">Daftar Materi</h3>
                <button 
                  onClick={() => navigate(`${basePath}/sessions/${session.id}/material/create`)} 
                  className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  + Tambah Materi
                </button>
              </div>

              {!session.materials?.length ? (
                <div className="bg-white border border-dashed border-[var(--theme-border)] rounded-2xl p-12 text-center text-[var(--theme-text-subtle)]">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="font-bold text-sm text-[var(--theme-text)]">Belum ada materi</p>
                  <p className="text-xs text-[var(--theme-text-muted)] mt-1">Mulai tambahkan materi bacaan, video, atau file presentasi.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.materials.map(m => (
                    <div key={m.id} className="bg-white p-5 rounded-2xl border border-[var(--theme-border)] hover:border-[var(--theme-primary)] hover:shadow-md transition-all flex flex-col justify-between">
                      <div className="flex gap-4 items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--theme-primary-light)] text-[var(--theme-primary)] flex items-center justify-center shrink-0">
                          <FileIcon type={m.type} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-[var(--theme-text)] text-sm truncate" title={m.title}>{m.title}</h4>
                          <p className="text-[10px] text-[var(--theme-text-subtle)] mt-1 uppercase tracking-wider font-bold">{m.type}</p>
                          {m.original_file_name && <p className="text-xs text-[var(--theme-text-muted)] truncate mt-1">{m.original_file_name}</p>}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-[var(--theme-border-muted)]">
                        {m.file_url && (
                          <a href={`${BACKEND_URL}${m.file_url}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border border-[var(--theme-border)] hover:bg-[var(--theme-bg)] transition-colors">
                            Buka File
                          </a>
                        )}
                        <button onClick={() => navigate(`${basePath}/sessions/${session.id}/material/${m.id}/edit`)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--theme-primary-light)] text-[var(--theme-primary)] hover:opacity-85 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteMaterial(m.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--theme-error-light)] text-[var(--theme-error)] hover:opacity-85 transition-colors">
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
                <h3 className="text-base font-bold text-[var(--theme-text)]">Daftar Kuis</h3>
                <button 
                  onClick={() => navigate(`${basePath}/sessions/${session.id}/quiz/create`)} 
                  className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  + Tambah Kuis
                </button>
              </div>

              {!session.quizzes?.length ? (
                <div className="bg-white border border-dashed border-[var(--theme-border)] rounded-2xl p-12 text-center text-[var(--theme-text-subtle)]">
                  <div className="text-4xl mb-3">⏱️</div>
                  <p className="font-bold text-sm text-[var(--theme-text)]">Belum ada kuis</p>
                  <p className="text-xs text-[var(--theme-text-muted)] mt-1">Uji pemahaman peserta dengan menambahkan kuis evaluasi.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.quizzes.map(q => (
                    <div key={q.id} className="bg-white p-5 rounded-2xl border border-[var(--theme-border)] hover:border-[var(--theme-secondary)] hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <h4 className="font-bold text-[var(--theme-text)] text-sm line-clamp-2">{q.title}</h4>
                        <StatusBadge status={q.status} />
                      </div>
                      <div className="flex gap-4 mb-4">
                        <div className="flex flex-col bg-[var(--theme-bg)] rounded-xl p-2 flex-1 items-center border border-[var(--theme-border)]">
                          <span className="text-[9px] text-[var(--theme-text-subtle)] font-bold uppercase tracking-wider mb-1">Durasi</span>
                          <span className="text-xs font-bold text-[var(--theme-text)]">{q.duration_minutes} Menit</span>
                        </div>
                        <div className="flex flex-col bg-[var(--theme-bg)] rounded-xl p-2 flex-1 items-center border border-[var(--theme-border)]">
                          <span className="text-[9px] text-[var(--theme-text-subtle)] font-bold uppercase tracking-wider mb-1">Max Coba</span>
                          <span className="text-xs font-bold text-[var(--theme-text)]">{q.max_attempts}x</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-[var(--theme-border-muted)] mt-4">
                        <button onClick={() => navigate(`${basePath}/sessions/${session.id}/quiz/${q.id}/edit`)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border border-[var(--theme-border)] hover:bg-[var(--theme-bg)] transition-colors">
                          Edit Kuis
                        </button>
                        <button onClick={() => navigate(`${basePath}/quiz/${q.id}/builder`)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary-hover)] transition-colors shadow-sm">
                          Kelola Soal →
                        </button>
                        <button onClick={() => handleDeleteQuiz(q.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--theme-error-light)] text-[var(--theme-error)] hover:opacity-85 transition-colors">
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
                <h3 className="text-base font-bold text-[var(--theme-text)]">Daftar Tugas</h3>
                <button 
                  onClick={() => navigate(`${basePath}/sessions/${session.id}/assignment/create`)} 
                  className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  + Tambah Tugas
                </button>
              </div>

              {!session.assignments?.length ? (
                <div className="bg-white border border-dashed border-[var(--theme-border)] rounded-2xl p-12 text-center text-[var(--theme-text-subtle)]">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="font-bold text-sm text-[var(--theme-text)]">Belum ada tugas</p>
                  <p className="text-xs text-[var(--theme-text-muted)] mt-1">Berikan tugas proyek atau individu untuk peserta.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.assignments.map(a => (
                    <div key={a.id} className="bg-white p-5 rounded-2xl border border-[var(--theme-border)] hover:border-[var(--theme-primary)] hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-bold text-[var(--theme-text)] text-sm line-clamp-2">{a.title}</h4>
                          <StatusBadge status={a.status} />
                        </div>
                        <p className="text-xs font-semibold text-[var(--theme-text-muted)] line-clamp-2 mb-3 leading-relaxed">{a.description || 'Tidak ada instruksi.'}</p>
                        <div className="space-y-2 mt-4">
                          <div className="flex items-center justify-between text-xs font-bold bg-[var(--theme-bg)] p-2 rounded-lg border border-[var(--theme-border)]">
                            <span className="text-[var(--theme-text-subtle)]">Tipe Pengumpulan</span>
                            <span className="text-[var(--theme-text)] uppercase">{a.submission_type}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-bold bg-[var(--theme-bg)] p-2 rounded-lg border border-[var(--theme-border)]">
                            <span className="text-[var(--theme-text-subtle)]">Tenggat Waktu</span>
                            <span className={new Date(a.due_date) < new Date() ? 'text-[var(--theme-error)]' : 'text-[var(--theme-success)]'}>
                              {a.due_date ? new Date(a.due_date).toLocaleString('id-ID') : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-[var(--theme-border-muted)] mt-4">
                        <button onClick={() => navigate(`${basePath}/sessions/${session.id}/assignment/${a.id}/edit`)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--theme-primary-light)] text-[var(--theme-primary)] hover:opacity-85 transition-colors">
                          Edit Tugas
                        </button>
                        <button onClick={() => handleDeleteAssignment(a.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--theme-error-light)] text-[var(--theme-error)] hover:opacity-85 transition-colors">
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

      {/* Edit Session Modal */}
      <DialogModal
        open={showEditSessionModal}
        onOpenChange={setShowEditSessionModal}
        title="Edit Sesi"
        description="Perbarui informasi dan batas tanggal untuk sesi orientasi."
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
            <button type="submit" disabled={updateSessionMutation.isPending} className="px-5 py-2 h-10 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold rounded-xl shadow-md transition-colors">Simpan Sesi</button>
          </div>
        </form>
      </DialogModal>

      {/* Edit Quiz Modal */}
      <DialogModal
        open={showEditQuizModal}
        onOpenChange={setShowEditQuizModal}
        title="Edit Pengaturan Kuis"
        description="Perbarui informasi waktu dan batasan pengerjaan kuis."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUpdateQuiz} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Judul Kuis</label>
            <input type="text" required value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-primary)] text-sm font-semibold" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Durasi (Menit)</label>
              <input type="number" required min="1" value={quizForm.duration_minutes} onChange={e => setQuizForm({...quizForm, duration_minutes: Number(e.target.value)})} className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-primary)] text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Maksimal Percobaan</label>
              <input type="number" required min="1" value={quizForm.max_attempts} onChange={e => setQuizForm({...quizForm, max_attempts: Number(e.target.value)})} className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-primary)] text-sm font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Waktu Buka (Open At)</label>
              <input type="datetime-local" value={quizForm.open_at} onChange={e => setQuizForm({...quizForm, open_at: e.target.value})} className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-primary)] text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Tenggat (Close At)</label>
              <input type="datetime-local" value={quizForm.close_at} onChange={e => setQuizForm({...quizForm, close_at: e.target.value})} className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-primary)] text-sm font-semibold" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Status Kuis</label>
            <SelectField
              value={quizForm.status}
              onValueChange={(val) => setQuizForm({ ...quizForm, status: val })}
              className="w-full"
            >
              <SelectOption value="draft">Draft (Disembunyikan)</SelectOption>
              <SelectOption value="published">Diterbitkan (Aktif)</SelectOption>
              <SelectOption value="closed">Ditutup</SelectOption>
            </SelectField>
            <p className="text-[10px] text-[var(--theme-warning)] mt-1.5 font-bold">Pastikan status "Diterbitkan (Aktif)" agar kuis bisa dikerjakan.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--theme-border-muted)]">
            <button type="button" onClick={() => setShowEditQuizModal(false)} className="px-4 py-2 text-xs font-bold text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] rounded-xl transition-colors">Batal</button>
            <button type="submit" disabled={updateQuizMutation.isPending} className="px-5 py-2 h-10 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold rounded-xl shadow-md transition-colors">{updateQuizMutation.isPending ? 'Menyimpan...' : 'Simpan Kuis'}</button>
          </div>
        </form>
      </DialogModal>
    </div>
  );
};

export default SessionContent;

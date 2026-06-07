import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateQuizMutation, useSessionsQuery, useUpdateQuizMutation } from '../../../queries/useKencanaAdminQuery';
import toast from 'react-hot-toast';

const QuizForm = () => {
  const { sessionId, quizId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(quizId);
  const basePath = window.location.pathname.startsWith('/admin/kencana-univ') ? '/admin/kencana-univ' : window.location.pathname.startsWith('/admin/kencana-fakultas-admin') ? '/admin/kencana-fakultas-admin' : window.location.pathname.startsWith('/kencana-fakultas') ? '/kencana-fakultas' : window.location.pathname.startsWith('/kencana-fakult') ? '/kencana-fakult' : '/kencana-admin';
  
  const { data: detailedSessions, isLoading: isLoadingSessions } = useSessionsQuery(null);
  const session = detailedSessions?.find(s => s.id === Number(sessionId));
  const existingQuiz = session?.quizzes?.find(q => q.id === Number(quizId));

  const [form, setForm] = useState({ 
    title: '', 
    duration_minutes: 30, 
    max_attempts: 1, 
    open_at: '',
    close_at: '',
    status: 'draft' 
  });

  const createQuizMutation = useCreateQuizMutation();
  const updateQuizMutation = useUpdateQuizMutation();

  useEffect(() => {
    if (!isEditing || !existingQuiz) return;
    setForm({
      title: existingQuiz.title || '',
      duration_minutes: existingQuiz.duration_minutes || 30,
      max_attempts: existingQuiz.max_attempts || 1,
      open_at: existingQuiz.open_at ? existingQuiz.open_at.slice(0, 16) : '',
      close_at: existingQuiz.close_at ? existingQuiz.close_at.slice(0, 16) : '',
      status: existingQuiz.status || 'draft',
    });
  }, [isEditing, existingQuiz]);

  const handleSaveQuiz = (e, continueToBuilder = false) => {
    if (e) e.preventDefault();
    if (!session) return;
    const payload = { ...form };
    const formatApiDate = (d) => {
      if (!d) return null;
      if (d.length === 16) return d + ':00Z';
      return d;
    };
    payload.open_at = formatApiDate(payload.open_at);
    payload.close_at = formatApiDate(payload.close_at);

    if (isEditing) {
      updateQuizMutation.mutate({ id: Number(quizId), ...payload }, {
        onSuccess: () => {
          if (continueToBuilder) {
            navigate(`${basePath}/quiz/${quizId}/builder`);
          } else {
            navigate(`${basePath}/sessions/${sessionId}/content`);
          }
        },
        onError: () => toast.error('Gagal menyimpan kuis')
      });
      return;
    }

    createQuizMutation.mutate({ ...payload, session_id: session.id }, {
      onSuccess: (res) => {
        const id = res?.data?.data?.id || res?.id;
        if (continueToBuilder && id) {
          navigate(`${basePath}/quiz/${id}/builder`);
        } else {
          navigate(`${basePath}/sessions/${sessionId}/content`);
        }
      },
      onError: () => toast.error('Gagal membuat kuis')
    });
  };

  const isSaving = createQuizMutation.isPending || updateQuizMutation.isPending;

  if (isLoadingSessions) {
    return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-amber-600"></div></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <button onClick={() => navigate(`${basePath}/sessions/${sessionId}/content`)} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
        ← Kembali ke Konten Sesi
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <aside className="bg-amber-950 text-white rounded-3xl p-6 shadow-xl h-fit sticky top-6">
          <p className="text-[10px] font-black text-amber-200 uppercase tracking-[0.28em]">Kuis</p>
          <h1 className="text-2xl font-black mt-3">{isEditing ? 'Edit Kuis' : 'Tambah Kuis Baru'}</h1>
          <p className="text-sm text-amber-100/90 mt-3 leading-relaxed">Atur identitas, jadwal, durasi, dan status kuis. Setelah dibuat, lanjutkan ke builder untuk menyusun soal.</p>
          <div className="mt-6 rounded-2xl bg-white/10 border border-white/10 p-4">
            <p className="text-[10px] font-black text-amber-200 uppercase tracking-widest">Sesi</p>
            <p className="text-sm font-bold mt-1">{session?.title || '-'}</p>
          </div>
        </aside>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-br from-amber-50 to-white">
            <h2 className="text-xl font-black text-slate-800">Pengaturan Kuis</h2>
            <p className="text-sm text-slate-500 mt-2">Field yang jelas membantu peserta melihat kuis sesuai jadwal dan status.</p>
        </div>

        <form onSubmit={e => handleSaveQuiz(e, true)} className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Kuis *</label>
            <input 
              type="text" 
              required 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })} 
              placeholder="Contoh: Kuis Evaluasi Visi Misi" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Durasi Pengerjaan (Menit)</label>
              <input 
                type="number" 
                required 
                min="1"
                value={form.duration_minutes} 
                onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Maksimal Percobaan</label>
              <input 
                type="number" 
                required 
                min="1"
                value={form.max_attempts} 
                onChange={e => setForm({ ...form, max_attempts: Number(e.target.value) })} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Waktu Mulai (Open At)</label>
              <input 
                type="datetime-local" 
                value={form.open_at} 
                onChange={e => setForm({ ...form, open_at: e.target.value })} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tenggat Waktu (Close At)</label>
              <input 
                type="datetime-local" 
                value={form.close_at} 
                onChange={e => setForm({ ...form, close_at: e.target.value })} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status Awal</label>
            <select 
              value={form.status} 
              onChange={e => setForm({ ...form, status: e.target.value })} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            >
              <option value="draft">Draft (Disembunyikan, sedang dibuat)</option>
              <option value="published">Diterbitkan (Peserta bisa mengakses)</option>
              <option value="closed">Ditutup (Akses dihentikan)</option>
            </select>
            <p className="text-xs text-slate-400 mt-2">Anda bisa mengubah status kuis kapan saja setelah menyusun soal.</p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-8">
            <button type="button" onClick={() => navigate(`${basePath}/sessions/${sessionId}/content`)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
            <button type="button" onClick={() => handleSaveQuiz(null, false)} disabled={isSaving} className="px-6 py-3 border-2 border-amber-500 text-amber-600 hover:bg-amber-50 rounded-xl font-black transition-colors">
              Simpan Draft
            </button>
            <button type="submit" disabled={isSaving} className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-amber-200 disabled:opacity-50 transition-all flex items-center gap-2">
              {isSaving ? 'Menyimpan...' : isEditing ? 'Simpan Kuis' : 'Lanjut Susun Soal →'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;

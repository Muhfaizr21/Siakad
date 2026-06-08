import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateQuizMutation, useSessionsQuery, useUpdateQuizMutation } from '../../../queries/useKencanaAdminQuery';
import toast from 'react-hot-toast';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';

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
    return (
      <div className="flex justify-center items-center py-20 bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-transparent font-body max-w-6xl mx-auto space-y-6">
      
      {/* Back button */}
      <div>
        <button onClick={() => navigate(`${basePath}/sessions/${sessionId}/content`)} className="text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors">
          ← Kembali ke Konten Sesi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <aside className="bg-[var(--theme-primary)] text-white rounded-2xl p-6 shadow-md h-fit sticky top-6">
          <p className="text-[10px] font-black text-[var(--theme-secondary)] uppercase tracking-[0.28em]">Kuis Orientasi</p>
          <h1 className="text-xl font-bold mt-3">{isEditing ? 'Edit Kuis' : 'Tambah Kuis Baru'}</h1>
          <p className="text-xs text-white/80 mt-3 leading-relaxed">Atur identitas, jadwal, durasi, dan status kuis. Setelah dibuat, lanjutkan ke builder untuk menyusun soal kuis.</p>
          <div className="mt-6 rounded-xl bg-white/10 border border-white/10 p-4">
            <p className="text-[9px] font-bold text-[var(--theme-secondary)] uppercase tracking-wider">Sesi Aktif</p>
            <p className="text-xs font-bold mt-1 truncate">{session?.title || '-'}</p>
          </div>
        </aside>

        <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
            <h2 className="text-base font-bold text-[var(--theme-text)]">Pengaturan Parameter Kuis</h2>
            <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Lengkapi form di bawah untuk mengatur jadwal dan batas pengerjaan kuis.</p>
          </div>

          <form onSubmit={e => handleSaveQuiz(e, true)} className="p-6 md:p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Judul Kuis *</label>
              <input 
                type="text" 
                required 
                value={form.title} 
                onChange={e => setForm({ ...form, title: e.target.value })} 
                placeholder="Contoh: Kuis Evaluasi Visi Misi" 
                className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Durasi Pengerjaan (Menit)</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={form.duration_minutes} 
                  onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} 
                  className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Maksimal Percobaan</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={form.max_attempts} 
                  onChange={e => setForm({ ...form, max_attempts: Number(e.target.value) })} 
                  className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Waktu Mulai (Open At)</label>
                <input 
                  type="datetime-local" 
                  value={form.open_at} 
                  onChange={e => setForm({ ...form, open_at: e.target.value })} 
                  className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Tenggat Waktu (Close At)</label>
                <input 
                  type="datetime-local" 
                  value={form.close_at} 
                  onChange={e => setForm({ ...form, close_at: e.target.value })} 
                  className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Status Akses Kuis</label>
              <SelectField 
                value={form.status} 
                onValueChange={val => setForm({ ...form, status: val })} 
                className="w-full"
              >
                <SelectOption value="draft">Draft (Disembunyikan, sedang dibuat)</SelectOption>
                <SelectOption value="published">Diterbitkan (Peserta bisa mengakses)</SelectOption>
                <SelectOption value="closed">Ditutup (Akses dihentikan)</SelectOption>
              </SelectField>
              <p className="text-xs text-[var(--theme-text-subtle)] mt-2 font-semibold">Anda bisa mengubah status kuis kapan saja setelah menyusun soal.</p>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[var(--theme-border-muted)] mt-8">
              <button type="button" onClick={() => navigate(`${basePath}/sessions/${sessionId}/content`)} className="px-5 py-2.5 rounded-xl font-bold text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] transition-colors text-xs">Batal</button>
              <button type="button" onClick={() => handleSaveQuiz(null, false)} disabled={isSaving} className="px-5 py-2.5 border border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] rounded-xl font-bold transition-colors text-xs">
                Simpan Draft
              </button>
              <button type="submit" disabled={isSaving} className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white px-6 py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 transition-all flex items-center gap-2 text-xs">
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

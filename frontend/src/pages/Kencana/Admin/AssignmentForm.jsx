import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useSessionsQuery, useCreateAssignmentMutation, useUpdateAssignmentMutation
} from '../../../queries/useKencanaAdminQuery';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';

const AssignmentForm = () => {
  const { sessionId, assignmentId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(assignmentId);
  const basePath = window.location.pathname.startsWith('/admin/kencana-univ') ? '/admin/kencana-univ' : window.location.pathname.startsWith('/admin/kencana-fakultas-admin') ? '/admin/kencana-fakultas-admin' : window.location.pathname.startsWith('/kencana-fakultas') ? '/kencana-fakultas' : window.location.pathname.startsWith('/kencana-fakult') ? '/kencana-fakult' : '/kencana-admin';

  const { data: detailedSessions, isLoading: isLoadingSessions } = useSessionsQuery(null);
  const session = detailedSessions?.find(s => s.id === Number(sessionId));
  const existingAssignment = session?.assignments?.find(a => a.id === Number(assignmentId));

  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    submission_type: 'text', 
    open_at: '',
    due_date: '', 
    status: 'published', 
    is_required: true 
  });

  const createAssignmentMutation = useCreateAssignmentMutation();
  const updateAssignmentMutation = useUpdateAssignmentMutation();

  useEffect(() => {
    if (isEditing && existingAssignment) {
      setForm({
        title: existingAssignment.title,
        description: existingAssignment.description || '',
        submission_type: existingAssignment.submission_type || 'text',
        open_at: existingAssignment.open_at ? existingAssignment.open_at.slice(0, 16) : '',
        due_date: existingAssignment.due_date ? existingAssignment.due_date.slice(0, 16) : '',
        status: existingAssignment.status || 'published',
        is_required: existingAssignment.is_required ?? true,
      });
    }
  }, [isEditing, existingAssignment]);

  const handleSaveAssignment = (e) => {
    e.preventDefault();
    if (!session) return;

    const payload = { ...form };
    const formatApiDate = (d) => {
      if (!d) return null;
      if (d.length === 16) return d + ':00Z';
      return d;
    };
    payload.open_at = formatApiDate(payload.open_at);
    payload.due_date = formatApiDate(payload.due_date);

    if (isEditing) {
      updateAssignmentMutation.mutate({ id: Number(assignmentId), ...payload }, {
        onSuccess: () => navigate(`${basePath}/sessions/${sessionId}/content`)
      });
    } else {
      createAssignmentMutation.mutate({ ...payload, session_id: session.id }, {
        onSuccess: () => navigate(`${basePath}/sessions/${sessionId}/content`)
      });
    }
  };

  const isSaving = createAssignmentMutation.isPending || updateAssignmentMutation.isPending;

  if (isLoadingSessions) {
    return (
      <div className="flex justify-center items-center py-20 bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-body max-w-6xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate(`${basePath}/sessions/${sessionId}/content`)} className="text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors">
          ← Kembali ke Konten Sesi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <aside className="bg-[var(--theme-primary)] text-white rounded-2xl p-6 shadow-md h-fit sticky top-6">
          <p className="text-[10px] font-black text-[var(--theme-secondary)] uppercase tracking-[0.28em]">Tugas</p>
          <h1 className="text-xl font-bold mt-3">{isEditing ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h1>
          <p className="text-xs text-white/80 mt-3 leading-relaxed">Tulis instruksi, tipe pengumpulan, jadwal buka, tenggat, dan status tugas dalam satu halaman yang mudah dibaca.</p>
          <div className="mt-6 rounded-xl bg-white/10 border border-white/10 p-4">
            <p className="text-[9px] font-bold text-[var(--theme-secondary)] uppercase tracking-wider">Sesi Aktif</p>
            <p className="text-xs font-bold mt-1 truncate">{session?.title || '-'}</p>
          </div>
        </aside>

        <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
            <h2 className="text-base font-bold text-[var(--theme-text)]">Detail Tugas</h2>
            <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Pastikan instruksi dan tenggat jelas agar peserta tidak salah mengumpulkan.</p>
          </div>

          <form onSubmit={handleSaveAssignment} className="p-6 md:p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Judul Tugas *</label>
              <input 
                type="text" 
                required 
                value={form.title} 
                onChange={e => setForm({ ...form, title: e.target.value })} 
                placeholder="Contoh: Tugas Essay Kepemimpinan" 
                className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Instruksi / Deskripsi Tugas</label>
              <textarea 
                rows="4" 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })} 
                placeholder="Jelaskan apa yang harus dilakukan peserta..." 
                className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] resize-y transition-all" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Tipe Pengumpulan</label>
                <SelectField 
                  value={form.submission_type} 
                  onValueChange={val => setForm({ ...form, submission_type: val })} 
                  className="w-full"
                >
                  <SelectOption value="text">Teks Online</SelectOption>
                  <SelectOption value="file">Unggah File (PDF/Doc/dll)</SelectOption>
                  <SelectOption value="link">Tautan (Link URL)</SelectOption>
                  <SelectOption value="media">Media (Gambar/Video)</SelectOption>
                </SelectField>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 cursor-pointer h-10 px-4 border border-[var(--theme-border)] rounded-xl bg-[var(--theme-bg)] hover:bg-[var(--theme-border-muted)] transition-colors">
                  <input 
                    type="checkbox" 
                    checked={form.is_required} 
                    onChange={e => setForm({ ...form, is_required: e.target.checked })} 
                    className="w-4 h-4 text-[var(--theme-primary)] rounded focus:ring-[var(--theme-primary)]" 
                  />
                  <span className="text-sm font-semibold text-[var(--theme-text)]">Tugas Wajib Diselesaikan</span>
                </label>
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
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Tenggat Waktu (Due Date)</label>
                <input 
                  type="datetime-local" 
                  value={form.due_date} 
                  onChange={e => setForm({ ...form, due_date: e.target.value })} 
                  className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Status</label>
              <SelectField 
                value={form.status} 
                onValueChange={val => setForm({ ...form, status: val })} 
                className="w-full"
              >
                <SelectOption value="draft">Draft (Disembunyikan)</SelectOption>
                <SelectOption value="published">Diterbitkan (Terlihat)</SelectOption>
                <SelectOption value="closed">Ditutup (Tidak menerima submission)</SelectOption>
              </SelectField>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[var(--theme-border-muted)] mt-8">
              <button type="button" onClick={() => navigate(`${basePath}/sessions/${sessionId}/content`)} className="px-5 py-2.5 rounded-xl font-bold text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] transition-colors text-xs">Batal</button>
              <button type="submit" disabled={isSaving} className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white px-6 py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 transition-all text-xs">
                {isSaving ? 'Menyimpan...' : 'Simpan Tugas'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentForm;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useSessionsQuery, useCreateAssignmentMutation, useUpdateAssignmentMutation
} from '../../../queries/useKencanaAdminQuery';

const AssignmentForm = () => {
  const { sessionId, assignmentId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(assignmentId);

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
        onSuccess: () => navigate(`/kencana-admin/sessions/${sessionId}/content`)
      });
    } else {
      createAssignmentMutation.mutate({ ...payload, session_id: session.id }, {
        onSuccess: () => navigate(`/kencana-admin/sessions/${sessionId}/content`)
      });
    }
  };

  const isSaving = createAssignmentMutation.isPending || updateAssignmentMutation.isPending;

  if (isLoadingSessions) {
    return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-rose-600"></div></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <button onClick={() => navigate(`/kencana-admin/sessions/${sessionId}/content`)} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
        ← Kembali ke Konten Sesi
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <aside className="bg-rose-950 text-white rounded-3xl p-6 shadow-xl h-fit sticky top-6">
          <p className="text-[10px] font-black text-rose-200 uppercase tracking-[0.28em]">Tugas</p>
          <h1 className="text-2xl font-black mt-3">{isEditing ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h1>
          <p className="text-sm text-rose-100/90 mt-3 leading-relaxed">Tulis instruksi, tipe pengumpulan, jadwal buka, tenggat, dan status tugas dalam satu halaman yang mudah dibaca.</p>
          <div className="mt-6 rounded-2xl bg-white/10 border border-white/10 p-4">
            <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest">Sesi</p>
            <p className="text-sm font-bold mt-1">{session?.title || '-'}</p>
          </div>
        </aside>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-br from-rose-50 to-white">
            <h2 className="text-xl font-black text-slate-800">Detail Tugas</h2>
            <p className="text-sm text-slate-500 mt-2">Pastikan instruksi dan tenggat jelas agar peserta tidak salah mengumpulkan.</p>
          </div>

        <form onSubmit={handleSaveAssignment} className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Tugas *</label>
            <input 
              type="text" 
              required 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })} 
              placeholder="Contoh: Tugas Essay Kepemimpinan" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Instruksi / Deskripsi Tugas</label>
            <textarea 
              rows="4" 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
              placeholder="Jelaskan apa yang harus dilakukan peserta..." 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none resize-y transition-all" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipe Pengumpulan</label>
              <select 
                value={form.submission_type} 
                onChange={e => setForm({ ...form, submission_type: e.target.value })} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              >
                <option value="text">Teks Online</option>
                <option value="file">Unggah File (PDF/Doc/dll)</option>
                <option value="link">Tautan (Link URL)</option>
                <option value="media">Media (Gambar/Video)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Waktu Mulai (Open At)</label>
              <input 
                type="datetime-local" 
                value={form.open_at} 
                onChange={e => setForm({ ...form, open_at: e.target.value })} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tenggat Waktu (Due Date)</label>
              <input 
                type="datetime-local" 
                value={form.due_date} 
                onChange={e => setForm({ ...form, due_date: e.target.value })} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
              <select 
                value={form.status} 
                onChange={e => setForm({ ...form, status: e.target.value })} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              >
                <option value="draft">Draft (Disembunyikan)</option>
                <option value="published">Diterbitkan (Terlihat)</option>
                <option value="closed">Ditutup (Tidak menerima submission)</option>
              </select>
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer p-3.5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={form.is_required} 
                  onChange={e => setForm({ ...form, is_required: e.target.checked })} 
                  className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500" 
                />
                <span className="text-sm font-bold text-slate-700">Tugas Wajib Diselesaikan</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-8">
            <button type="button" onClick={() => navigate(`/kencana-admin/sessions/${sessionId}/content`)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
            <button type="submit" disabled={isSaving} className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-rose-200 disabled:opacity-50 transition-all">
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

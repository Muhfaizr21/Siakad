import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useSessionsQuery, useCreateMaterialMutation, useUpdateMaterialMutation, useUploadMediaMutation
} from '../../../queries/useKencanaAdminQuery';
import toast from 'react-hot-toast';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';

const MaterialForm = () => {
  const { sessionId, materialId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(materialId);
  const basePath = window.location.pathname.startsWith('/admin/kencana-univ') ? '/admin/kencana-univ' : window.location.pathname.startsWith('/admin/kencana-fakultas-admin') ? '/admin/kencana-fakultas-admin' : window.location.pathname.startsWith('/kencana-fakultas') ? '/kencana-fakultas' : window.location.pathname.startsWith('/kencana-fakult') ? '/kencana-fakult' : '/kencana-admin';

  const { data: detailedSessions, isLoading: isLoadingSessions } = useSessionsQuery(null);
  const session = detailedSessions?.find(s => s.id === Number(sessionId));
  const existingMaterial = session?.materials?.find(m => m.id === Number(materialId));

  const [form, setForm] = useState({ title: '', type: 'text', content: '', link_url: '', is_required: true });
  const [uploadFile, setUploadFile] = useState(null);
  const fileInputRef = useRef();

  const createMaterialMutation = useCreateMaterialMutation();
  const updateMaterialMutation = useUpdateMaterialMutation();
  const uploadMedia = useUploadMediaMutation();

  useEffect(() => {
    if (isEditing && existingMaterial) {
      setForm({
        title: existingMaterial.title || '',
        type: existingMaterial.type || 'text',
        content: existingMaterial.content || '',
        link_url: existingMaterial.link_url || '',
        is_required: existingMaterial.is_required ?? true,
      });
    }
  }, [isEditing, existingMaterial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;
    
    let fileUrl = existingMaterial?.file_url || '';
    let originalFileName = existingMaterial?.original_file_name || '';

    try {
      if (uploadFile) {
        const fd = new FormData();
        fd.append('file', uploadFile);
        const res = await uploadMedia.mutateAsync(fd);
        if (res?.url) {
          fileUrl = res.url;
          originalFileName = uploadFile.name;
        }
      }

      const payload = {
        title: form.title || originalFileName.replace(/\.[^/.]+$/, '') || 'Materi Kencana',
        type: uploadFile ? 'file' : form.type,
        content: form.content,
        link_url: form.link_url,
        file_url: fileUrl,
        original_file_name: originalFileName,
        session_id: session.id,
        is_required: form.is_required,
      };

      if (isEditing) {
        await updateMaterialMutation.mutateAsync({ id: Number(materialId), ...payload });
        toast.success('Materi berhasil diperbarui!');
      } else {
        await createMaterialMutation.mutateAsync(payload);
        toast.success('Materi berhasil dibuat!');
      }
      navigate(`${basePath}/sessions/${sessionId}/content`);
    } catch (err) {
      toast.error('Gagal menyimpan materi');
    }
  };

  const isUploading = uploadMedia.isPending || createMaterialMutation.isPending || updateMaterialMutation.isPending;

  if (isLoadingSessions) {
    return (
      <div className="flex justify-center items-center py-20 bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-transparent font-body max-w-6xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate(`${basePath}/sessions/${sessionId}/content`)} className="text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors">
          ← Kembali ke Konten Sesi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <aside className="bg-[var(--theme-primary)] text-white rounded-2xl p-6 shadow-md h-fit sticky top-6">
          <p className="text-[10px] font-black text-[var(--theme-secondary)] uppercase tracking-[0.28em]">Materi</p>
          <h1 className="text-xl font-bold mt-3">{isEditing ? 'Edit Materi' : 'Tambah Materi Baru'}</h1>
          <p className="text-xs text-white/80 mt-3 leading-relaxed">Simpan materi sebagai teks, tautan, atau file. Peserta akan melihat daftar materi ini di halaman sesi.</p>
          <div className="mt-6 rounded-xl bg-white/10 border border-white/10 p-4">
            <p className="text-[9px] font-bold text-[var(--theme-secondary)] uppercase tracking-wider">Sesi Aktif</p>
            <p className="text-xs font-bold mt-1 truncate">{session?.title || '-'}</p>
          </div>
          {existingMaterial?.original_file_name && (
            <div className="mt-3 rounded-xl bg-white/10 border border-white/10 p-4">
              <p className="text-[9px] font-bold text-[var(--theme-secondary)] uppercase tracking-wider">File Saat Ini</p>
              <p className="text-xs font-bold mt-1 break-words">{existingMaterial.original_file_name}</p>
            </div>
          )}
        </aside>

        <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
            <h2 className="text-base font-bold text-[var(--theme-text)]">Detail Materi</h2>
            <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Isi form sesuai jenis materi. Teks dan link bisa digabung dengan file jika diperlukan.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Judul Materi *</label>
              <input 
                type="text" 
                required 
                value={form.title} 
                onChange={e => setForm({ ...form, title: e.target.value })} 
                placeholder="Contoh: Panduan Orientasi Mahasiswa" 
                className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Jenis Materi</label>
                <SelectField 
                  value={form.type} 
                  onValueChange={val => setForm({ ...form, type: val })} 
                  className="w-full"
                >
                  <SelectOption value="text">Teks</SelectOption>
                  <SelectOption value="link">Link URL</SelectOption>
                  <SelectOption value="file">File / Dokumen</SelectOption>
                  <SelectOption value="video">Video</SelectOption>
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
                  <span className="text-sm font-semibold text-[var(--theme-text)]">Materi wajib dibaca</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Deskripsi / Teks Materi</label>
              <textarea 
                rows="4" 
                value={form.content} 
                onChange={e => setForm({ ...form, content: e.target.value })} 
                placeholder="Tambahkan teks penjelasan jika perlu..." 
                className="w-full px-4 py-3 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] resize-y transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Tautan (URL Eksternal)</label>
              <input 
                type="url" 
                value={form.link_url} 
                onChange={e => setForm({ ...form, link_url: e.target.value })} 
                placeholder="https://..." 
                className="w-full h-10 px-4 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Upload File Dokumen / Video</label>
              <div className="border-2 border-dashed border-[var(--theme-border)] rounded-2xl p-6 bg-[var(--theme-bg)] hover:bg-[var(--theme-border-muted)] transition-colors text-center">
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.xls,.jpg,.jpeg,.png,.mp4" 
                  onChange={e => setUploadFile(e.target.files[0])} 
                  className="mx-auto block text-xs text-[var(--theme-text)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-[var(--theme-primary)] file:text-white hover:file:bg-[var(--theme-primary-hover)] cursor-pointer" 
                />
                {existingMaterial?.original_file_name && !uploadFile && (
                  <p className="text-xs text-[var(--theme-primary)] font-bold mt-3 border-t border-[var(--theme-border-muted)] pt-3">File Tersimpan: {existingMaterial.original_file_name}</p>
                )}
                <p className="text-xs text-[var(--theme-text-muted)] font-semibold mt-3">Kosongkan jika tidak ingin melampirkan file.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[var(--theme-border-muted)] mt-8">
              <button type="button" onClick={() => navigate(`${basePath}/sessions/${sessionId}/content`)} className="px-5 py-2.5 rounded-xl font-bold text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] transition-colors text-xs">Batal</button>
              <button type="submit" disabled={isUploading} className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white px-6 py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 transition-all flex items-center justify-center min-w-[140px] text-xs">
                {isUploading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : 'Simpan Materi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaterialForm;

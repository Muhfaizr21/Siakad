import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useSessionsQuery, useCreateMaterialMutation, useUpdateMaterialMutation, useUploadMediaMutation
} from '../../../queries/useKencanaAdminQuery';
import toast from 'react-hot-toast';

const MaterialForm = () => {
  const { sessionId, materialId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(materialId);

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
      navigate(`/kencana-admin/sessions/${sessionId}/content`);
    } catch (err) {
      toast.error('Gagal menyimpan materi');
    }
  };

  const isUploading = uploadMedia.isPending || createMaterialMutation.isPending || updateMaterialMutation.isPending;

  if (isLoadingSessions) {
    return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <button onClick={() => navigate(`/kencana-admin/sessions/${sessionId}/content`)} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
        ← Kembali ke Konten Sesi
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <aside className="bg-blue-950 text-white rounded-3xl p-6 shadow-xl h-fit sticky top-6">
          <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.28em]">Materi</p>
          <h1 className="text-2xl font-black mt-3">{isEditing ? 'Edit Materi' : 'Tambah Materi Baru'}</h1>
          <p className="text-sm text-blue-100/90 mt-3 leading-relaxed">Simpan materi sebagai teks, tautan, atau file. Peserta akan melihat daftar materi ini di halaman sesi.</p>
          <div className="mt-6 rounded-2xl bg-white/10 border border-white/10 p-4">
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Sesi</p>
            <p className="text-sm font-bold mt-1">{session?.title || '-'}</p>
          </div>
          {existingMaterial?.original_file_name && (
            <div className="mt-3 rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">File Saat Ini</p>
              <p className="text-xs font-semibold mt-1 break-words">{existingMaterial.original_file_name}</p>
            </div>
          )}
        </aside>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white">
            <h2 className="text-xl font-black text-slate-800">Detail Materi</h2>
            <p className="text-sm text-slate-500 mt-2">Isi form sesuai jenis materi. Teks dan link bisa digabung dengan file jika diperlukan.</p>
          </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Materi *</label>
            <input 
              type="text" 
              required 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })} 
              placeholder="Contoh: Panduan Orientasi Mahasiswa" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jenis Materi</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="text">Teks</option>
                <option value="link">Link URL</option>
                <option value="file">File / Dokumen</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer p-3.5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <input type="checkbox" checked={form.is_required} onChange={e => setForm({ ...form, is_required: e.target.checked })} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-sm font-bold text-slate-700">Materi wajib dibaca</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi / Teks Materi</label>
            <textarea 
              rows="4" 
              value={form.content} 
              onChange={e => setForm({ ...form, content: e.target.value })} 
              placeholder="Tambahkan teks penjelasan jika perlu..." 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-y" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tautan (URL Eksternal)</label>
            <input 
              type="url" 
              value={form.link_url} 
              onChange={e => setForm({ ...form, link_url: e.target.value })} 
              placeholder="https://..." 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload File Dokumen / Video</label>
            <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 bg-blue-50 hover:bg-blue-100 transition-colors text-center">
              <input 
                ref={fileInputRef} 
                type="file" 
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.xls,.jpg,.jpeg,.png,.mp4" 
                onChange={e => setUploadFile(e.target.files[0])} 
                className="mx-auto block text-sm text-slate-700 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" 
              />
              {existingMaterial?.original_file_name && !uploadFile && (
                <p className="text-xs text-blue-700 font-bold mt-3 border-t border-blue-200/50 pt-3">File Tersimpan: {existingMaterial.original_file_name}</p>
              )}
              <p className="text-xs text-blue-600/70 font-medium mt-3">Kosongkan jika tidak ingin melampirkan file.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => navigate(`/kencana-admin/sessions/${sessionId}/content`)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Batal</button>
            <button type="submit" disabled={isUploading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-blue-200 disabled:opacity-50 transition-all flex items-center justify-center min-w-[160px]">
              {isUploading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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

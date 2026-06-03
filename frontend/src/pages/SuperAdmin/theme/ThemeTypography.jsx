import React, { useState, useEffect } from 'react';
import useThemeStore from '../../../store/useThemeStore';
import { adminService } from '../../../services/api';
import ThemePreviewModal from './ThemePreviewModal';

const GOOGLE_FONTS = [
  'Plus Jakarta Sans',
  'Poppins',
  'Outfit',
  'Montserrat',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Nunito',
  'Raleway',
  'Ubuntu',
  'Quicksand',
  'Josefin Sans',
  'DM Sans',
  'Space Grotesk',
];

export default function ThemeTypography() {
  const { previewTheme, revertPreview, fetchTheme } = useThemeStore();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTheme();
    return () => revertPreview();
  }, []);

  const loadTheme = async () => {
    setLoading(true);
    try {
      const data = await fetchTheme();
      if (data) setFormData(data);
    } catch {
      showToast('error', 'Gagal memuat pengaturan tema');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    previewTheme({ [field]: value });
  };

  const handleReset = async () => {
    if (!window.confirm('Reset tipografi ke default?')) return;
    try {
      const res = await adminService.resetTheme();
      if (res.success) {
        showToast('success', 'Tipografi berhasil di-reset');
        const data = await fetchTheme();
        if (data) setFormData(data);
      }
    } catch {
      showToast('error', 'Gagal mereset');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await adminService.updateTheme(formData);
      if (res.success) {
        showToast('success', 'Tipografi berhasil disimpan');
        await fetchTheme();
      }
    } catch (err) {
      showToast('error', err.message || 'Gagal menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>Memuat...</p>
        </div>
      </div>
    );
  }

  const fontHeadline = formData.font_headline || 'Plus Jakarta Sans';
  const fontBody = formData.font_body || 'Inter';

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-transparent font-inter">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Page Header */}
        <section className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}>
                <span className="material-symbols-outlined text-xl">text_fields</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                  Pengaturan Tipografi
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Font dan gaya teks untuk heading dan body
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-slate-50"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Reset
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-slate-50"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                <span className="material-symbols-outlined text-sm mr-1">visibility</span>
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                {isSaving ? (
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">save</span>
                )}
                Simpan
              </button>
            </div>
          </div>
        </section>

        {/* Preview Modal */}
        <ThemePreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} theme={formData} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Section: Font Headline */}
          <section className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}>
                <span className="material-symbols-outlined text-base">title</span>
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>Font Judul</h2>
                <p className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>Untuk H1, H2, H3 dan heading</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--theme-text)' }}>Keluarga Font</label>
              <select
                value={formData.font_headline}
                onChange={(e) => handleChange('font_headline', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
              >
                {GOOGLE_FONTS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--theme-bg)' }}>
              <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--theme-text-muted)' }}>PREVIEW</p>
              <p className="text-2xl font-bold" style={{ fontFamily: `'${fontHeadline}', sans-serif`, color: 'var(--theme-h1)' }}>
                Heading One
              </p>
              <p className="text-lg font-semibold mt-1" style={{ fontFamily: `'${fontHeadline}', sans-serif`, color: 'var(--theme-h2)' }}>
                Heading Two
              </p>
              <p className="text-base font-medium mt-1" style={{ fontFamily: `'${fontHeadline}', sans-serif`, color: 'var(--theme-h3)' }}>
                Heading Three
              </p>
            </div>
          </section>

          {/* Section: Font Body */}
          <section className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-text)', color: 'white' }}>
                <span className="material-symbols-outlined text-base">notes</span>
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>Font Body</h2>
                <p className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>Untuk teks isi dan paragraf</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--theme-text)' }}>Keluarga Font</label>
              <select
                value={formData.font_body}
                onChange={(e) => handleChange('font_body', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
              >
                {GOOGLE_FONTS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--theme-bg)' }}>
              <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--theme-text-muted)' }}>PREVIEW</p>
              <p className="text-base" style={{ fontFamily: `'${fontBody}', sans-serif`, color: 'var(--theme-text)' }}>
                The quick brown fox jumps over the lazy dog.
              </p>
              <p className="text-sm mt-2" style={{ fontFamily: `'${fontBody}', sans-serif`, color: 'var(--theme-text-muted)' }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 1234567890
              </p>
            </div>
          </section>

          {/* Section: Typography Scale */}
          <section className="bg-white rounded-xl p-5 shadow-sm xl:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}>
                <span className="material-symbols-outlined text-base">format_size</span>
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>Skala Tipografi</h2>
                <p className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>Ukuran teks standar yang digunakan</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Display', size: '3rem', weight: '800', style: 'var(--theme-h1)' },
                { label: 'Heading 1', size: '2rem', weight: '700', style: 'var(--theme-h1)' },
                { label: 'Heading 2', size: '1.5rem', weight: '600', style: 'var(--theme-h2)' },
                { label: 'Heading 3', size: '1.25rem', weight: '600', style: 'var(--theme-h3)' },
                { label: 'Body Large', size: '1rem', weight: '400', style: 'var(--theme-text)' },
                { label: 'Body', size: '0.875rem', weight: '400', style: 'var(--theme-text)' },
                { label: 'Caption', size: '0.75rem', weight: '400', style: 'var(--theme-text-muted)' },
              ].map(({ label, size, weight, style }) => (
                <div key={label} className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--theme-bg)' }}>
                  <div className="w-24 shrink-0">
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--theme-text-muted)' }}>{label}</span>
                    <p className="text-xs font-mono" style={{ color: 'var(--theme-text-muted)' }}>{size} / {weight}</p>
                  </div>
                  <div
                    className="text-base font-bold truncate"
                    style={{ fontSize: size, fontWeight: weight, fontFamily: `'${fontHeadline}', sans-serif`, color: style }}
                  >
                    Perancis
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
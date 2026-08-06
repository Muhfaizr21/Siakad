import React, { useState, useEffect } from 'react';
import useThemeStore from '../../../store/useThemeStore';
import { adminService } from '../../../services/api';
import ThemePreviewModal from './ThemePreviewModal';

// Helper: Normalize Hex
const normalizeHex = (color) => {
  if (!color) return '#000000';
  if (color.startsWith('#') && color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return color;
};

// Helper: Hex to RGB
const hexToRgb = (hex) => {
  const normalized = normalizeHex(hex);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Helper: Get Luminance
const getLuminance = (rgb) => {
  if (!rgb) return 0.5;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Helper: Get Contrast Ratio
const getContrastRatio = (fg, bg) => {
  const rgb1 = hexToRgb(fg);
  const rgb2 = hexToRgb(bg);
  if (!rgb1 || !rgb2) return 1;

  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

// Helper: Get Contrast Rating
const getContrastRating = (ratio) => {
  if (ratio >= 7) return { label: 'AAA', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (ratio >= 4.5) return { label: 'AA', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (ratio >= 3) return { label: 'AA Large', color: 'text-amber-600', bg: 'bg-amber-50' };
  return { label: 'FAIL', color: 'text-red-600', bg: 'bg-red-50' };
};

// Helper: Auto Text Color
const getAutoTextColor = (bgColor, threshold = 0.179) => {
  const rgb = hexToRgb(bgColor);
  const luminance = getLuminance(rgb);
  return luminance < threshold ? '#FFFFFF' : '#1B1C1C';
};

export default function ThemeMobileColors() {
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
      showToast('error', 'Gagal memuat pengaturan warna mobile');
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
    const overrides = { [field]: value };
    setFormData(updated);
    previewTheme(overrides);
  };

  const handleReset = async () => {
    if (!window.confirm('Reset semua warna mobile ke default?')) return;
    try {
      const res = await adminService.resetTheme();
      if (res.success) {
        showToast('success', 'Warna mobile berhasil di-reset');
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
        showToast('success', 'Warna mobile berhasil disimpan');
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
          <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>Memuat warna mobile...</p>
        </div>
      </div>
    );
  }

  const primaryColors = [
    { key: 'mobile_color_primary', label: 'Primary', desc: 'Warna utama untuk AppBar, tombol, dan aksen utama', preview: '#002068' },
    { key: 'mobile_color_primary_container', label: 'Primary Container', desc: 'Warna untuk container/background aksen', preview: '#003399' },
  ];

  const secondaryColors = [
    { key: 'mobile_color_secondary', label: 'Secondary', desc: 'Warna kedua untuk elemen pendukung', preview: '#745B00' },
    { key: 'mobile_color_secondary_container', label: 'Secondary Container', desc: 'Warna container untuk elemen secondary', preview: '#FDD355' },
  ];

  const surfaceColors = [
    { key: 'mobile_color_background', label: 'Background', desc: 'Warna latar belakang utama aplikasi', preview: '#FBF9F8' },
    { key: 'mobile_color_surface', label: 'Surface', desc: 'Warna untuk kartu dan komponen di atas background', preview: '#FFFFFF' },
    { key: 'mobile_color_on_surface', label: 'On Surface', desc: 'Warna teks utama di atas surface', preview: '#1B1C1C' },
    { key: 'mobile_color_on_surface_variant', label: 'On Surface Variant', desc: 'Warna teks sekunder di atas surface', preview: '#444653' },
    { key: 'mobile_color_outline', label: 'Outline', desc: 'Warna border dan garis pembatas', preview: '#747684' },
    { key: 'mobile_color_outline_variant', label: 'Outline Variant', desc: 'Warna border secondary', preview: '#C4C5D5' },
  ];

  const gradientColors = [
    { key: 'mobile_gradient_start', label: 'Gradient Start', desc: 'Warna awal gradient AppBar', preview: '#00164E' },
    { key: 'mobile_gradient_middle', label: 'Gradient Middle', desc: 'Warna tengah gradient AppBar', preview: '#002068' },
    { key: 'mobile_gradient_end', label: 'Gradient End', desc: 'Warna akhir gradient AppBar', preview: '#003399' },
  ];

  const gradientSecondaryColors = [
    { key: 'mobile_gradient_secondary_start', label: 'Secondary Gradient Start', desc: 'Warna awal gradient variant secondary', preview: '#745B00' },
    { key: 'mobile_gradient_secondary_middle', label: 'Secondary Gradient Middle', desc: 'Warna tengah gradient secondary', preview: '#B48A00' },
    { key: 'mobile_gradient_secondary_end', label: 'Secondary Gradient End', desc: 'Warna akhir gradient secondary', preview: '#FDD355' },
  ];

  const ColorPickerCard = ({ color }) => {
    const value = formData[color.key] || color.preview;
    const whiteRatio = getContrastRatio(value, '#FFFFFF');
    const blackRatio = getContrastRatio(value, '#000000');
    const whiteRating = getContrastRating(whiteRatio);
    const blackRating = getContrastRating(blackRatio);

    return (
      <section className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{color.label}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{color.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-inner">
            <input
              type="color"
              value={value}
              onChange={(e) => handleChange(color.key, e.target.value)}
              className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
            />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(color.key, e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-mono border border-slate-200/80 focus:border-slate-400 focus:outline-none"
            style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
            placeholder="#HEXCODE"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-50">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold ${whiteRating.bg} ${whiteRating.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white border border-slate-200"></span>
            <span>Putih: {whiteRatio.toFixed(1)}:1</span>
            <span className="px-1 rounded bg-black/5">{whiteRating.label}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold ${blackRating.bg} ${blackRating.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            <span>Hitam: {blackRatio.toFixed(1)}:1</span>
            <span className="px-1 rounded bg-black/5">{blackRating.label}</span>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500">phone_android</span>
            Warna Tema Mobile
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi warna spesifik untuk aplikasi mobile (Flutter). Warna ini akan berlaku untuk semua role.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-slate-50"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Reset
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-slate-50 flex items-center gap-1"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 flex items-center gap-1.5"
            style={{ backgroundColor: formData.mobile_color_primary || 'var(--theme-primary)' }}
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

      {/* Mobile Preview Modal */}
      <ThemePreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} theme={formData} />

      {/* Primary Colors Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: formData.mobile_color_primary }}>
            <span className="material-symbols-outlined text-white text-base">palette</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Warna Primary</h3>
            <p className="text-[11px] text-slate-500">Warna utama yang digunakan di seluruh aplikasi mobile</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {primaryColors.map(color => <ColorPickerCard key={color.key} color={color} />)}
        </div>
      </section>

      {/* Secondary Colors Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: formData.mobile_color_secondary }}>
            <span className="material-symbols-outlined text-white text-base">gradient</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Warna Secondary</h3>
            <p className="text-[11px] text-slate-500">Warna pendukung untuk elemen aksen sekunder</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {secondaryColors.map(color => <ColorPickerCard key={color.key} color={color} />)}
        </div>
      </section>

      {/* Surface Colors Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200" style={{ backgroundColor: formData.mobile_color_surface }}>
            <span className="material-symbols-outlined text-slate-500 text-base">layers</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Warna Surface & Text</h3>
            <p className="text-[11px] text-slate-500">Warna background, surface, dan teks</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {surfaceColors.map(color => <ColorPickerCard key={color.key} color={color} />)}
        </div>
      </section>

      {/* Primary Gradient Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${formData.mobile_gradient_start}, ${formData.mobile_gradient_middle}, ${formData.mobile_gradient_end})`
            }}
          >
            <span className="material-symbols-outlined text-white text-base">gradient</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Gradient Primary (AppBar)</h3>
            <p className="text-[11px] text-slate-500">Gradient untuk AppBar dan header utama</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gradientColors.map(color => <ColorPickerCard key={color.key} color={color} />)}
        </div>

        {/* Gradient Preview */}
        <div className="mt-4 p-4 rounded-xl border border-slate-100" style={{ backgroundColor: formData.mobile_color_background }}>
          <div
            className="h-20 rounded-xl shadow-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${formData.mobile_gradient_start}, ${formData.mobile_gradient_middle}, ${formData.mobile_gradient_end})`
            }}
          >
            <span className="text-white font-bold text-lg">AppBar Preview</span>
          </div>
          <div className="mt-3 p-4 rounded-lg border border-slate-100/50" style={{ backgroundColor: formData.mobile_color_surface }}>
            <p style={{ color: formData.mobile_color_on_surface }} className="text-sm font-semibold">Contoh Teks di Surface</p>
            <p style={{ color: formData.mobile_color_on_surface_variant }} className="text-xs mt-1">Teks sekunder untuk deskripsi</p>
          </div>
        </div>
      </section>

      {/* Secondary Gradient Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${formData.mobile_gradient_secondary_start}, ${formData.mobile_gradient_secondary_middle}, ${formData.mobile_gradient_secondary_end})`
            }}
          >
            <span className="material-symbols-outlined text-white text-base">gradient</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Gradient Secondary (Variant)</h3>
            <p className="text-[11px] text-slate-500">Gradient alternatif untuk elemen spesifik</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gradientSecondaryColors.map(color => <ColorPickerCard key={color.key} color={color} />)}
        </div>

        {/* Secondary Gradient Preview */}
        <div className="mt-4 p-4 rounded-xl border border-slate-100" style={{ backgroundColor: formData.mobile_color_background }}>
          <div
            className="h-20 rounded-xl shadow-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${formData.mobile_gradient_secondary_start}, ${formData.mobile_gradient_secondary_middle}, ${formData.mobile_gradient_secondary_end})`
            }}
          >
            <span className="text-white font-bold text-lg">Secondary AppBar Preview</span>
          </div>
        </div>
      </section>

      {/* Info Box */}
      <div className="p-4 rounded-xl border border-blue-100 bg-blue-50">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600">info</span>
          <div>
            <h4 className="text-sm font-bold text-blue-800">Informasi</h4>
            <p className="text-xs text-blue-700 mt-1">
              Pengaturan warna mobile akan langsung berlaku untuk semua pengguna aplikasi mobile.
              Aplikasi mobile akan mengambil warna terbaru saat pengguna membuka aplikasi.
              Perubahan akan di-cache untuk performa optimal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import useThemeStore from '../../../store/useThemeStore';
import { adminService } from '../../../services/api';

// Helper: Hitung luminance
const getLuminance = (hex) => {
  const rgb = hex?.replace('#', '').match(/.{2}/g);
  if (!rgb || rgb.length < 3) return 0.5;

  const r = parseInt(rgb[0], 16) / 255;
  const g = parseInt(rgb[1], 16) / 255;
  const b = parseInt(rgb[2], 16) / 255;

  const lumR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const lumG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const lumB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * lumR + 0.7152 * lumG + 0.0722 * lumB;
};

// Helper: Auto-calculate text color based on BACKGROUND
const getTextColor = (bgColor, threshold = 0.179) => {
  const luminance = getLuminance(bgColor);
  return luminance < threshold ? '#FFFFFF' : '#1B1C1C';
};

// Helper: Auto-calculate muted text color
const getMutedColor = (textColor) => {
  return textColor === '#FFFFFF' ? '#E2E8F0' : '#64748B';
};

// Helper: Validate hex
const isValidHex = (color) => {
  if (!color) return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Normalize hex
const normalizeHex = (color) => {
  if (!color) return '#000000';
  if (color.startsWith('#') && color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return color;
};

// Color Input Component
const ColorInput = ({ label, value, onChange, description }) => {
  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-lg border-2 flex items-center justify-center"
          style={{ backgroundColor: value, borderColor: 'var(--theme-border)' }}
        >
          <span className="text-xs font-bold" style={{ color: getTextColor(value) }}>A</span>
        </div>
        <div>
          <label className="text-sm font-bold block" style={{ color: 'var(--theme-text)' }}>{label}</label>
          {description && <p className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>{description}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg cursor-pointer border"
          style={{ borderColor: 'var(--theme-border)' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 rounded-lg text-sm font-mono"
          style={{ backgroundColor: 'var(--theme-surface)', color: 'var(--theme-text)', border: '1px solid var(--theme-border)' }}
        />
      </div>
    </div>
  );
};

export default function ThemeColors() {
  const { previewTheme, revertPreview, fetchTheme } = useThemeStore();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadTheme();
    return () => revertPreview();
  }, []);

  const loadTheme = async () => {
    setLoading(true);
    try {
      const data = await fetchTheme();
      if (data) {
        setFormData({
          color_primary: data.color_primary || '#0D2B55',
          color_secondary: data.color_secondary || '#C89B3C',
          color_accent: data.color_accent || '#E8B84B',
          color_background: data.color_background || '#F9F6F0',
          color_surface: data.color_surface || '#FFFFFF',
        });
      }
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
    const normalizedValue = normalizeHex(value);
    const newFormData = { ...formData, [field]: normalizedValue };
    setFormData(newFormData);

    if (isValidHex(normalizedValue)) {
      const previewData = generateAllColors(newFormData);
      previewTheme(previewData);
    }
  };

  // Generate all theme colors based on base colors
  // FIX: Teks & Heading berdasarkan BACKGROUND, bukan PRIMARY
  const generateAllColors = (colors) => {
    if (!colors) return {};

    const primary = colors.color_primary || '#0D2B55';
    const secondary = colors.color_secondary || '#C89B3C';
    const accent = colors.color_accent || '#E8B84B';
    const background = colors.color_background || '#F9F6F0';
    const surface = colors.color_surface || '#FFFFFF';

    // Text berdasarkan BACKGROUND (FIX - tidak ikut primary)
    const textOnBg = getTextColor(background);
    const mutedOnBg = getMutedColor(textOnBg);

    // Text untuk surface
    const textOnSurface = getTextColor(surface);
    const mutedOnSurface = getMutedColor(textOnSurface);

    // Heading = sama dengan teks (berdasarkan bg) - FIX
    const headingColor = textOnBg; // Heading ikut teks background, bukan primary!

    // Sidebar selalu gelap
    const sidebarBg = primary; // Sidebar pakai primary
    const sidebarText = '#FFFFFF'; // Sidebar teks putih

    return {
      color_primary: primary,
      color_secondary: secondary,
      color_accent: accent,
      color_background: background,
      color_surface: surface,
      // Text berdasarkan BACKGROUND
      color_text_primary: textOnBg,
      color_text_muted: mutedOnBg,
      // Heading = teks background (FIX)
      color_h1: headingColor,
      color_h2: headingColor,
      color_h3: headingColor,
      color_h4: headingColor,
      // Sidebar
      sidebar_bg_color: sidebarBg,
      sidebar_text_color: sidebarText,
    };
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const allColors = generateAllColors(formData);
      const res = await adminService.updateTheme(allColors);
      if (res.success) {
        showToast('success', 'Pengaturan warna berhasil disimpan');

        // Update formData dari response API (bukan fetch ulang)
        if (res.data) {
          setFormData({
            color_primary: res.data.color_primary || formData.color_primary,
            color_secondary: res.data.color_secondary || formData.color_secondary,
            color_accent: res.data.color_accent || formData.color_accent,
            color_background: res.data.color_background || formData.color_background,
            color_surface: res.data.color_surface || formData.color_surface,
          });
        }
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

  // Preview colors
  const preview = {
    textColor: getTextColor(formData.color_background),
    mutedColor: getMutedColor(getTextColor(formData.color_background)),
    surfaceText: getTextColor(formData.color_surface),
    headingColor: getTextColor(formData.color_background), // FIX: heading = teks bg
    sidebarText: '#FFFFFF',
    textOnPrimary: getTextColor(formData.color_primary, 0.6), // Threshold khusus untuk primary
  };

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-transparent font-inter">
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Page Header */}
        <section className="rounded-xl p-5" style={{ backgroundColor: 'var(--theme-surface)' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}>
                <span className="material-symbols-outlined text-xl">palette</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                  Pengaturan Warna
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Ubah warna utama. Teks & heading otomatis menyesuaikan dengan background.
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:opacity-90"
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
        </section>

        {/* Color Pickers */}
        <section className="rounded-xl p-5" style={{ backgroundColor: 'var(--theme-surface)' }}>
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--theme-text)' }}>
            Warna Utama
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ColorInput
              label="Primary"
              value={formData.color_primary}
              onChange={(v) => handleChange('color_primary', v)}
              description="Warna tombol, border, accents"
            />
            <ColorInput
              label="Secondary"
              value={formData.color_secondary}
              onChange={(v) => handleChange('color_secondary', v)}
              description="Warna aksen kedua"
            />
            <ColorInput
              label="Accent"
              value={formData.color_accent}
              onChange={(v) => handleChange('color_accent', v)}
              description="Warna highlight/CTA"
            />
            <ColorInput
              label="Background"
              value={formData.color_background}
              onChange={(v) => handleChange('color_background', v)}
              description="Warna latar halaman"
            />
            <ColorInput
              label="Surface"
              value={formData.color_surface}
              onChange={(v) => handleChange('color_surface', v)}
              description="Warna card/modal"
            />
          </div>
        </section>

        {/* Preview Section */}
        <section className="rounded-xl p-5 overflow-hidden" style={{ backgroundColor: 'var(--theme-bg)' }}>
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--theme-text)' }}>
            Preview Warna
          </h2>

          {/* Hero Preview */}
          <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'linear-gradient(160deg, var(--theme-primary) 0%, color-mix(in srgb, var(--theme-primary) 70%, var(--theme-secondary) 30%) 100%)' }}>
            <div className="p-6 text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)', color: 'var(--theme-secondary)', border: '1px solid color-mix(in srgb, var(--theme-secondary) 30%, transparent)' }}>
                Portal Akademik
              </span>
              <h1 className="text-xl font-bold mb-2" style={{ color: preview.textOnPrimary }}>
                Membangun Karir Unggul & Berdaya Saing
              </h1>
              <p className="text-xs" style={{ color: preview.mutedOnPrimary }}>
                Deskripsi singkat portal akademik dengan kurikulum berbasis industri.
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'var(--theme-bg)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--theme-secondary)' }}>
              SECTION HEADER
            </span>
            <h2 className="text-base font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
              Eksplorasi Program Studi
            </h2>
            <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
              Deskripsi section dengan kurikulum berbasis kompetensi.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Card 1 - Surface */}
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
              <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)', color: 'var(--theme-secondary)' }}>
                <span>🎓</span>
              </div>
              <h3 className="text-xs font-bold mb-1" style={{ color: 'var(--theme-text)' }}>Fakultas Farmasi</h3>
              <p className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>Program studi unggul</p>
            </div>
            {/* Card 2 - Surface */}
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
              <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)', color: 'var(--theme-secondary)' }}>
                <span>🏥</span>
              </div>
              <h3 className="text-xs font-bold mb-1" style={{ color: 'var(--theme-text)' }}>Fakultas Keperawatan</h3>
              <p className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>Standar internasional</p>
            </div>
          </div>

          {/* Button Preview */}
          <div className="flex gap-2 mb-2">
            <button className="px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-secondary)' }}>
              Button Primary
            </button>
            <button className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}>
              Button Outline
            </button>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2">
            <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)', color: 'var(--theme-secondary)' }}>
              Featured
            </span>
            <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-success) 10%, transparent)', color: 'var(--theme-success)' }}>
              Success
            </span>
            <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-warning) 10%, transparent)', color: 'var(--theme-warning)' }}>
              Warning
            </span>
          </div>
        </section>

        {/* Info */}
        <div className="text-center py-4">
          <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
            💡 Teks dan heading menyesuaikan secara otomatis berdasarkan warna background.
          </p>
        </div>

      </div>
    </div>
  );
}
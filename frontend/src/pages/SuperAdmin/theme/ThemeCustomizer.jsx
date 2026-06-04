import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const TABS = [
  { key: 'colors', label: 'Warna', icon: 'palette' },
  { key: 'typography', label: 'Tipografi', icon: 'text_fields' },
  { key: 'branding', label: 'Branding', icon: 'image' },
  { key: 'components', label: 'Komponen', icon: 'widgets' },
  { key: 'status', label: 'Status', icon: 'check_circle' },
];

// Default colors
const DEFAULT_THEME = {
  colors: {
    color_primary: '#2563EB',
    color_secondary: '#EAB308',
    color_accent: '#FDE047',
    color_background: '#F8FAFC',
    color_surface: '#FFFFFF',
  },
  typography: {
    font_headline: 'Plus Jakarta Sans',
    font_body: 'Inter',
  },
  status: {
    color_success: '#22C55E',
    color_warning: '#EAB308',
    color_error: '#EF4444',
    color_info: '#3B82F6',
  },
};

// Color Picker Component
function ColorPicker({ label, description, value, onChange }) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleColorInput = (color) => {
    setInputValue(color);
    onChange(color);
  };

  const handleTextInput = (text) => {
    setInputValue(text);
    if (/^#[0-9A-Fa-f]{6}$/.test(text)) {
      onChange(text);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-lg border-2 border-slate-200 flex items-center justify-center shrink-0"
          style={{ backgroundColor: value }}
        >
          <span className="text-xs font-bold" style={{ color: value === '#FFFFFF' || value === '#fff' ? '#000' : '#fff' }}>A</span>
        </div>
        <div>
          <label className="text-sm font-bold block" style={{ color: 'var(--theme-text)' }}>{label}</label>
          <p className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>{description}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => handleColorInput(e.target.value)}
          className="w-12 h-10 rounded-lg cursor-pointer border border-slate-200 bg-white"
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleTextInput(e.target.value)}
          className="flex-1 px-3 rounded-lg text-sm font-mono border border-slate-200 bg-white"
        />
      </div>
    </div>
  );
}

// Input Field Component
function InputField({ label, description, value, onChange }) {
  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
      <label className="text-sm font-bold block mb-2" style={{ color: 'var(--theme-text)' }}>{label}</label>
      <p className="text-[10px] mb-3" style={{ color: 'var(--theme-text-muted)' }}>{description}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white"
      />
    </div>
  );
}

// Main Component
export default function ThemeCustomizer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'colors';

  // State for theme settings
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current theme on mount
  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/public/theme');
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          setTheme({
            colors: {
              color_primary: data.data.color_primary || DEFAULT_THEME.colors.color_primary,
              color_secondary: data.data.color_secondary || DEFAULT_THEME.colors.color_secondary,
              color_accent: data.data.color_accent || DEFAULT_THEME.colors.color_accent,
              color_background: data.data.color_background || DEFAULT_THEME.colors.color_background,
              color_surface: data.data.color_surface || DEFAULT_THEME.colors.color_surface,
            },
            typography: {
              font_headline: data.data.font_headline || DEFAULT_THEME.typography.font_headline,
              font_body: data.data.font_body || DEFAULT_THEME.typography.font_body,
            },
            status: {
              color_success: data.data.color_success || DEFAULT_THEME.status.color_success,
              color_warning: data.data.color_warning || DEFAULT_THEME.status.color_warning,
              color_error: data.data.color_error || DEFAULT_THEME.status.color_error,
              color_info: data.data.color_info || DEFAULT_THEME.status.color_info,
            },
          });
        }
      }
    } catch (err) {
      console.error('Error fetching theme:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (category, key, value) => {
    setTheme(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));

    // Live preview
    applyPreview(key, value);
  };

  const applyPreview = (key, value) => {
    const root = document.documentElement.style;

    // Map keys to CSS variables
    const cssVarMap = {
      color_primary: '--theme-primary',
      color_secondary: '--theme-secondary',
      color_accent: '--theme-accent',
      color_background: '--theme-bg',
      color_surface: '--theme-surface',
      color_success: '--theme-success',
      color_warning: '--theme-warning',
      color_error: '--theme-error',
      color_info: '--theme-info',
    };

    if (cssVarMap[key]) {
      root.setProperty(cssVarMap[key], value);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...theme.colors,
          ...theme.status,
          ...theme.typography,
        }),
      });

      if (res.ok) {
        toast.success('Pengaturan warna berhasil disimpan!');
        // Reload to ensure consistency
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error('Gagal menyimpan pengaturan');
      }
    } catch (err) {
      console.error('Error saving theme:', err);
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm('Yakin ingin reset ke pengaturan default? Semua perubahan akan hilang.');
    if (confirmed) {
      // Apply to preview
      const root = document.documentElement.style;

      Object.entries(DEFAULT_THEME.colors).forEach(([key, value]) => {
        if (key.startsWith('color_')) {
          applyPreview(key, value);
        }
      });
      Object.entries(DEFAULT_THEME.status).forEach(([key, value]) => {
        if (key.startsWith('color_')) {
          applyPreview(key, value);
        }
      });

      // Reset state
      setTheme(DEFAULT_THEME);
      toast.success('Pengaturan direset ke default');
    }
  };

  const handleTabChange = (tab) => {
    navigate(`/admin/theme?tab=${tab}`, { replace: true });
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'colors':
        return (
          <div className="space-y-6">
            <h2 className="text-base font-bold" style={{ color: 'var(--theme-text)' }}>Warna Utama</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'color_primary', label: 'Primary', desc: 'Warna utama tombol dan aksen' },
                { key: 'color_secondary', label: 'Secondary', desc: 'Warna aksen kedua' },
                { key: 'color_accent', label: 'Accent', desc: 'Warna highlight dan CTA' },
                { key: 'color_background', label: 'Background', desc: 'Warna latar halaman' },
                { key: 'color_surface', label: 'Surface', desc: 'Warna card dan modal' },
              ].map((field) => (
                <ColorPicker
                  key={field.key}
                  label={field.label}
                  description={field.desc}
                  value={theme.colors[field.key]}
                  onChange={(val) => handleColorChange('colors', field.key, val)}
                />
              ))}
            </div>
          </div>
        );

      case 'typography':
        return (
          <div className="space-y-6">
            <h2 className="text-base font-bold" style={{ color: 'var(--theme-text)' }}>Pengaturan Tipografi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Font Heading"
                description="Font untuk judul"
                value={theme.typography.font_headline}
                onChange={(val) => handleColorChange('typography', 'font_headline', val)}
              />
              <InputField
                label="Font Body"
                description="Font untuk teks isi"
                value={theme.typography.font_body}
                onChange={(val) => handleColorChange('typography', 'font_body', val)}
              />
            </div>
          </div>
        );

      case 'status':
        return (
          <div className="space-y-6">
            <h2 className="text-base font-bold" style={{ color: 'var(--theme-text)' }}>Warna Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'color_success', label: 'Success', desc: 'Status berhasil' },
                { key: 'color_warning', label: 'Warning', desc: 'Status peringatan' },
                { key: 'color_error', label: 'Error', desc: 'Status error' },
                { key: 'color_info', label: 'Info', desc: 'Status informasi' },
              ].map((field) => (
                <ColorPicker
                  key={field.key}
                  label={field.label}
                  description={field.desc}
                  value={theme.status[field.key]}
                  onChange={(val) => handleColorChange('status', field.key, val)}
                />
              ))}
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-6">
            <h2 className="text-base font-bold" style={{ color: 'var(--theme-text)' }}>Pengaturan Branding</h2>
            <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
              Fitur upload logo dan branding akan segera hadir.
            </p>
          </div>
        );

      case 'components':
        return (
          <div className="space-y-6">
            <h2 className="text-base font-bold" style={{ color: 'var(--theme-text)' }}>Pengaturan Komponen</h2>
            <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
              Fitur ini sedang dalam pengembangan.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: 'var(--theme-primary)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar Tabs */}
      <div className="w-56 shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-3 space-y-1 sticky top-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 mb-3">Pengaturan Tampilan</h3>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-300
                ${activeTab === tab.key ? 'text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
              `}
              style={activeTab === tab.key ? { backgroundColor: 'var(--theme-primary)' } : {}}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}>
                <span className="material-symbols-outlined text-2xl">palette</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>Pengaturan Tampilan</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Kustomisasi warna dan tema aplikasi
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:opacity-90 bg-slate-400"
                onClick={handleReset}
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Reset
              </button>
              <button
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--theme-primary)' }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">save</span>
                )}
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          {renderContent()}
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Preview</h2>
          <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(160deg, var(--theme-primary) 0%, var(--theme-h3) 100%)' }}>
            <div className="p-6 text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ backgroundColor: 'var(--theme-secondary)', color: '#1E293B' }}>
                Portal Akademik
              </span>
              <h1 className="text-xl font-bold mb-2 text-white">Membangun Karir Unggul & Berdaya Saing</h1>
              <p className="text-white/70 text-xs mb-4">Deskripsi singkat portal akademik dengan kurikulum berbasis industri.</p>
              <button className="px-4 py-2 rounded-lg text-sm font-bold mr-2" style={{ backgroundColor: 'var(--theme-secondary)', color: '#1E293B' }}>
                Tombol Primary
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-bold" style={{ backgroundColor: 'var(--theme-accent)', color: '#1E293B' }}>
                Tombol Accent
              </button>
            </div>
          </div>
          {/* Status Badge Preview */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--theme-success)', color: 'white' }}>Success</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--theme-warning)', color: '#1E293B' }}>Warning</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--theme-error)', color: 'white' }}>Error</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--theme-info)', color: 'white' }}>Info</span>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ThemeColors from './ThemeColors';
import ThemeTypography from './ThemeTypography';
import ThemeBranding from './ThemeBranding';
import ThemeComponents from './ThemeComponents';
import ThemeStatusColors from './ThemeStatusColors';
import ThemePresets from './ThemePresets';

const TABS = [
  { key: 'colors', label: 'Warna', icon: 'palette' },
  { key: 'typography', label: 'Tipografi', icon: 'text_fields' },
  { key: 'branding', label: 'Branding', icon: 'image' },
  { key: 'components', label: 'Komponen', icon: 'widgets' },
  { key: 'status', label: 'Status', icon: 'check_circle' },
  { key: 'presets', label: 'Preset', icon: 'style' },
];

export default function ThemeCustomizer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'colors';

  const handleTabChange = (tab) => {
    navigate(`/admin/theme?tab=${tab}`, { replace: true });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'colors':
        return <ThemeColors />;
      case 'typography':
        return <ThemeTypography />;
      case 'branding':
        return <ThemeBranding />;
      case 'components':
        return <ThemeComponents />;
      case 'status':
        return <ThemeStatusColors />;
      case 'presets':
        return <ThemePresets />;
      default:
        return <ThemeColors />;
    }
  };

  return (
    <div className="flex gap-6 h-full font-inter">
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
        {/* Page Header (Ramping, tanpa tombol simpan/reset global) */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}>
                <span className="material-symbols-outlined text-2xl">palette</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>Pengaturan Tampilan</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Kustomisasi warna, font, branding, dan komponen aplikasi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
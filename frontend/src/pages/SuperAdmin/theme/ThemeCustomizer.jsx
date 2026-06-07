import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ThemeColors from './ThemeColors';
import ThemeTypography from './ThemeTypography';
import ThemeBranding from './ThemeBranding';
import ThemeComponents from './ThemeComponents';
import ThemeStatusColors from './ThemeStatusColors';
import ThemePresets from './ThemePresets';
import { PageContent } from '@/components/ui/page';
import { DashboardHero } from '@/components/ui/dashboard';

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
    <PageContent>
      <div className="max-w-[1600px] mx-auto space-y-8 select-none">
        <DashboardHero
          title="Theme"
          highlightedTitle="Customizer"
          subtitle="Kustomisasi warna, font, branding, dan komponen aplikasi untuk seluruh portal."
          icon="palette"
          badges={[
            { label: 'System Configuration', active: true }
          ]}
        />
        
        <div className="flex flex-col lg:flex-row gap-6 font-inter items-start">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-56 shrink-0">
            <div className="glass-card rounded-2xl border border-slate-200/60 p-3 space-y-1 lg:sticky lg:top-6 shadow-none">
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
          <div className="flex-1 min-w-0">
            {/* Tab Content */}
            <div className="glass-card rounded-2xl border border-slate-200/60 p-6 shadow-none">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </PageContent>
  );
}
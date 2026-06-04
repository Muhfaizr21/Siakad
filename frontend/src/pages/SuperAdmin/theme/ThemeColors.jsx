import React, { useState, useEffect } from 'react';

export default function ThemeColors() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    color_primary: '#0D2B55',
    color_secondary: '#C89B3C',
    color_accent: '#E8B84B',
    color_background: '#F9F6F0',
    color_surface: '#FFFFFF',
  });

  useEffect(() => {
    console.log('[ThemeColors] Component mounted');
    setLoading(false);
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#0D2B55', color: 'white' }}>
          <span className="material-symbols-outlined text-xl">palette</span>
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
            Pengaturan Warna
          </h2>
          <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
            Ubah warna tema aplikasi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { key: 'color_primary', label: 'Primary', desc: 'Warna utama' },
          { key: 'color_secondary', label: 'Secondary', desc: 'Warna kedua' },
          { key: 'color_accent', label: 'Accent', desc: 'Warna aksen' },
          { key: 'color_background', label: 'Background', desc: 'Warna latar' },
          { key: 'color_surface', label: 'Surface', desc: 'Warna card' },
        ].map(color => (
          <div key={color.key} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="text-sm font-bold block mb-2" style={{ color: 'var(--theme-text)' }}>
              {color.label}
            </label>
            <p className="text-xs mb-3" style={{ color: 'var(--theme-text-muted)' }}>
              {color.desc}
            </p>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData[color.key]}
                onChange={(e) => handleChange(color.key, e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formData[color.key]}
                onChange={(e) => handleChange(color.key, e.target.value)}
                className="flex-1 px-3 rounded-lg text-sm font-mono border border-slate-200"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-700">
          Demo: Component ThemeColors berhasil dimuat!
          Ini versi simpel untuk testing. Component lengkap dengan API integration ada di versi sebelumnya.
        </p>
      </div>
    </div>
  );
}
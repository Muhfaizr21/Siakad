import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemePreviewModal({ isOpen, onClose, theme }) {
  if (!theme) return null;

  const {
    color_primary = '#0D2B55',
    color_secondary = '#C89B3C',
    color_accent = '#E8B84B',
    color_background = '#F9F6F0',
    color_surface = '#FFFFFF',
    color_text_primary = '#1B1C1C',
    color_text_muted = '#64748B',
    color_h1 = '#0D2B55',
    color_h2 = '#0D2B55',
    color_h3 = '#1E3A5F',
    color_h4 = '#475569',
    color_border = '#E2E8F0',
    color_border_muted = '#F1F5F9',
    sidebar_bg_color = '#0D2B55',
    sidebar_text_color = '#E2E8F0',
    sidebar_text_muted_color = 'rgba(255,255,255,0.5)',
    color_success = '#16a34a',
    color_warning = '#d97706',
    color_error = '#dc2626',
    color_info = '#2563eb',
    button_radius = '12px',
    font_headline = 'Plus Jakarta Sans',
    font_body = 'Inter',
    site_name = 'Universitas Bhakti Kencana',
    logo_url,
    favicon_url,
  } = theme;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 z-[101] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--theme-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color_primary, color: 'white' }}>
                  <span className="material-symbols-outlined">preview</span>
                </div>
                <div>
                  <h2 className="font-bold" style={{ fontFamily: `'${font_headline}', sans-serif`, color: color_text_primary }}>Preview Tampilan Lengkap</h2>
                  <p className="text-xs" style={{ color: color_text_muted }}>Pratinjau bagaimana portal akan terlihat</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ color: color_text_muted }}>close</span>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: color_background }}>
              {/* Browser Mockup */}
              <div className="max-w-6xl mx-auto space-y-6">

                {/* Browser Window */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border" style={{ borderColor: 'var(--theme-border)' }}>
                  {/* Browser Header */}
                  <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: color_primary }}>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-white/30"></div>
                      <div className="w-3 h-3 rounded-full bg-white/30"></div>
                      <div className="w-3 h-3 rounded-full bg-white/30"></div>
                    </div>
                    <div className="flex-1 flex items-center gap-2 px-4 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <span className="material-symbols-outlined text-white/70" style={{ fontSize: '14px' }}>search</span>
                      <span className="text-white/70 text-xs">{site_name}.ac.id</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="material-symbols-outlined text-white/50" style={{ fontSize: '16px' }}>more_horiz</span>
                    </div>
                  </div>

                  {/* App Layout */}
                  <div className="flex" style={{ minHeight: '500px' }}>
                    {/* Sidebar */}
                    <div className="w-64 p-4 flex flex-col" style={{ backgroundColor: sidebar_bg_color }}>
                      {/* Logo */}
                      <div className="flex items-center gap-3 pb-4 mb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          {logo_url ? (
                            <img src={logo_url} alt="Logo" className="w-8 h-8 object-contain brightness-0 invert" />
                          ) : (
                            <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>school</span>
                          )}
                        </div>
                        <span className="font-bold text-white text-sm" style={{ fontFamily: `'${font_headline}', sans-serif` }}>
                          {site_name.split(' ').slice(0, 2).join(' ')}
                        </span>
                      </div>

                      {/* Menu */}
                      <div className="space-y-1 flex-1">
                        <div className="px-3 py-2.5 rounded-xl bg-white/15 text-white text-xs font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: color_accent }}>dashboard</span>
                          Dashboard
                        </div>
                        <div className="px-3 py-2 rounded-lg text-white/70 text-xs flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>school</span>
                          Akademik
                        </div>
                        <div className="px-3 py-2 rounded-lg text-white/70 text-xs flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>group</span>
                          Mahasiswa
                        </div>
                        <div className="px-3 py-2 rounded-lg text-white/70 text-xs flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>assessment</span>
                          Laporan
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: sidebar_text_muted_color }}>Pengaturan</p>
                        <div className="space-y-1">
                          <div className="px-3 py-2 rounded-lg text-white/70 text-xs flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>settings</span>
                            Pengaturan
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6" style={{ backgroundColor: color_background }}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h1 className="text-xl font-bold" style={{ fontFamily: `'${font_headline}', sans-serif`, color: color_h1 }}>
                            Dashboard Super Admin
                          </h1>
                          <p className="text-sm" style={{ color: color_text_muted }}>Selamat datang di panel kontrol</p>
                        </div>
                        <button
                          className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md"
                          style={{ backgroundColor: color_primary, borderRadius: button_radius, fontFamily: `'${font_headline}', sans-serif` }}
                        >
                          + Tambah Baru
                        </button>
                      </div>

                      {/* Stats Cards */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="p-4 rounded-xl shadow-sm border" style={{ backgroundColor: color_surface, borderColor: 'var(--theme-border)' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color_primary}15`, color: color_primary }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>group</span>
                            </div>
                            <span className="text-xs font-medium" style={{ color: color_text_muted }}>Mahasiswa</span>
                          </div>
                          <p className="text-2xl font-bold" style={{ fontFamily: `'${font_headline}', sans-serif`, color: color_text_primary }}>4,850</p>
                        </div>
                        <div className="p-4 rounded-xl shadow-sm border" style={{ backgroundColor: color_surface, borderColor: 'var(--theme-border)' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color_success}15`, color: color_success }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                            </div>
                            <span className="text-xs font-medium" style={{ color: color_text_muted }}>Aktif</span>
                          </div>
                          <p className="text-2xl font-bold" style={{ fontFamily: `'${font_headline}', sans-serif`, color: color_success }}>98%</p>
                        </div>
                        <div className="p-4 rounded-xl shadow-sm border" style={{ backgroundColor: color_surface, borderColor: 'var(--theme-border)' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color_warning}15`, color: color_warning }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                            </div>
                            <span className="text-xs font-medium" style={{ color: color_text_muted }}>Pending</span>
                          </div>
                          <p className="text-2xl font-bold" style={{ fontFamily: `'${font_headline}', sans-serif`, color: color_text_primary }}>24</p>
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="p-5 rounded-xl shadow-sm border" style={{ backgroundColor: color_surface, borderColor: 'var(--theme-border)' }}>
                        <h2 className="text-base font-bold mb-3" style={{ fontFamily: `'${font_headline}', sans-serif`, color: color_h2 }}>
                          Aktivitas Terbaru
                        </h2>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: color_background }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color_success}15` }}>
                              <span className="material-symbols-outlined text-sm" style={{ color: color_success }}>check</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium" style={{ color: color_text_primary }}>Proposal disetujui</p>
                              <p className="text-xs" style={{ color: color_text_muted }}>2 menit yang lalu</p>
                            </div>
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${color_success}15`, color: color_success }}>
                              Success
                            </span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: color_background }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color_warning}15` }}>
                              <span className="material-symbols-outlined text-sm" style={{ color: color_warning }}>schedule</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium" style={{ color: color_text_primary }}>Menunggu review</p>
                              <p className="text-xs" style={{ color: color_text_muted }}>15 menit yang lalu</p>
                            </div>
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${color_warning}15`, color: color_warning }}>
                              Pending
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Buttons Preview */}
                      <div className="mt-6">
                        <h3 className="text-sm font-bold mb-3" style={{ color: color_text_muted }}>TOMBOL</h3>
                        <div className="flex flex-wrap gap-3">
                          <button
                            className="px-5 py-2.5 text-white text-xs font-bold shadow-md"
                            style={{ backgroundColor: color_primary, borderRadius: button_radius }}
                          >
                            Primary
                          </button>
                          <button
                            className="px-5 py-2.5 text-xs font-bold border-2 bg-white"
                            style={{ borderColor: color_primary, color: color_primary, borderRadius: button_radius }}
                          >
                            Outline
                          </button>
                          <button
                            className="px-5 py-2.5 text-xs font-bold"
                            style={{ backgroundColor: color_secondary, color: 'white', borderRadius: button_radius }}
                          >
                            Secondary
                          </button>
                          <button
                            className="px-5 py-2.5 text-xs font-bold"
                            style={{ backgroundColor: color_success, color: 'white', borderRadius: button_radius }}
                          >
                            Success
                          </button>
                          <button
                            className="px-5 py-2.5 text-xs font-bold"
                            style={{ backgroundColor: color_error, color: 'white', borderRadius: button_radius }}
                          >
                            Error
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Palette Preview */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border p-6" style={{ borderColor: 'var(--theme-border)' }}>
                  <h3 className="font-bold mb-4" style={{ fontFamily: `'${font_headline}', sans-serif`, color: color_text_primary }}>Palet Warna</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-xl shadow-inner" style={{ backgroundColor: color_primary }}></div>
                      <p className="text-[10px] font-bold mt-1" style={{ color: color_text_primary }}>Primary</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-xl shadow-inner" style={{ backgroundColor: color_secondary }}></div>
                      <p className="text-[10px] font-bold mt-1" style={{ color: color_text_primary }}>Secondary</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-xl shadow-inner" style={{ backgroundColor: color_accent }}></div>
                      <p className="text-[10px] font-bold mt-1" style={{ color: color_text_primary }}>Accent</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-xl shadow-inner" style={{ backgroundColor: color_success }}></div>
                      <p className="text-[10px] font-bold mt-1" style={{ color: color_text_primary }}>Success</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-xl shadow-inner" style={{ backgroundColor: color_warning }}></div>
                      <p className="text-[10px] font-bold mt-1" style={{ color: color_text_primary }}>Warning</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-xl shadow-inner" style={{ backgroundColor: color_error }}></div>
                      <p className="text-[10px] font-bold mt-1" style={{ color: color_text_primary }}>Error</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-xl shadow-inner border" style={{ backgroundColor: color_info, borderColor: 'var(--theme-border)' }}></div>
                      <p className="text-[10px] font-bold mt-1" style={{ color: color_text_primary }}>Info</p>
                    </div>
                  </div>
                </div>

                {/* Typography Preview */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border p-6" style={{ borderColor: 'var(--theme-border)' }}>
                  <h3 className="font-bold mb-4" style={{ fontFamily: `'${font_headline}', sans-serif`, color: color_text_primary }}>Tipografi</h3>
                  <div className="space-y-3">
                    <p className="text-2xl font-black" style={{ fontFamily: `'${font_headline}', sans-serif`, color: color_h1 }}>Heading 1 - {font_headline}</p>
                    <p className="text-xl font-bold" style={{ fontFamily: `'${font_headline}', sans-serif`, color: color_h2 }}>Heading 2 - {font_headline}</p>
                    <p className="text-lg font-semibold" style={{ fontFamily: `'${font_headline}', sans-serif`, color: color_h3 }}>Heading 3 - {font_headline}</p>
                    <p className="text-base" style={{ fontFamily: `'${font_body}', sans-serif`, color: color_text_primary }}>
                      Body Text - {font_body} - Ini adalah teks tubuh/paragraf yang menggunakan font body untuk membaca yang nyaman.
                    </p>
                    <p className="text-sm" style={{ fontFamily: `'${font_body}', sans-serif`, color: color_text_muted }}>
                      Caption / Muted Text - {font_body} - Teks keterangan kecil atau teks yang kurang penting.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--theme-border)' }}>
              <p className="text-xs" style={{ color: color_text_muted }}>
                Preview mencerminkan pengaturan tema saat ini. Simpan untuk menerapkan perubahan.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-white text-sm font-bold rounded-xl shadow-md transition-all hover:opacity-90"
                style={{ backgroundColor: color_primary, fontFamily: `'${font_headline}', sans-serif` }}
              >
                Tutup Preview
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
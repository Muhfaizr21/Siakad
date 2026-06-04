import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

export default function HeroCard({ data }) {
  const { mahasiswa, pesan_kontekstual, link_kontekstual } = data;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Selamat Pagi';
    if (hour >= 12 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const currentStatus = mahasiswa?.status?.toLowerCase() || 'alumni';
  const firstName = mahasiswa?.nama_depan || mahasiswa?.nama || 'Mahasiswa';

  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${path}`;
  };

  return (
    <section
      className="rounded-xl p-5 border border-border shadow-sm"
      style={{ backgroundColor: 'var(--theme-surface)' }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left: Avatar + Title */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl border border-border overflow-hidden flex items-center justify-center bg-slate-50" style={{ backgroundColor: 'var(--theme-border-muted)' }}>
              {mahasiswa?.foto_url ? (
                <img src={getFullUrl(mahasiswa.foto_url)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full text-white flex items-center justify-center text-lg font-bold font-jakarta"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  {firstName.charAt(0)}
                </div>
              )}
            </div>
            {/* Status dot */}
            {currentStatus === 'aktif' && (
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" style={{ borderColor: 'var(--theme-surface)' }} />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
              {getGreeting()}, <span style={{ color: 'var(--theme-secondary)' }}>{firstName}!</span>
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
              {mahasiswa?.nim ? `${mahasiswa.nim} · ` : ''}{mahasiswa?.prodi || ''}{mahasiswa?.semester ? ` · Semester ${mahasiswa.semester}` : ''} · {dateStr}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
          {pesan_kontekstual && (
            <NavLink
              to={link_kontekstual || '#'}
              className="flex-1 md:flex-initial text-center px-4 py-2 rounded-lg text-xs font-bold text-white hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-1.5"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              {pesan_kontekstual}
              <ChevronRight size={14} />
            </NavLink>
          )}
          
          {/* Subtle badges for metadata, replacing the bulky boxes in the gradient version */}
          {mahasiswa?.nim && (
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-muted border border-border px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--theme-border-muted)', color: 'var(--theme-text-muted)' }}>
              <span className="material-symbols-outlined text-xs">badge</span>
              <span>NIM: {mahasiswa.nim}</span>
            </div>
          )}
          {mahasiswa?.prodi && (
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-muted border border-border px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--theme-border-muted)', color: 'var(--theme-text-muted)' }}>
              <span className="material-symbols-outlined text-xs">school</span>
              <span>Prodi: {mahasiswa.prodi.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
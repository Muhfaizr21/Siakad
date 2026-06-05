import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const statusLabels = {
  not_started: 'Belum Dikerjakan',
  in_progress: 'Sedang Berjalan',
  waiting_schedule: 'Menunggu Jadwal',
  completed: 'Selesai',
  passed: 'Lulus',
  conditional_pass: 'Lulus Bersyarat',
  remedial: 'Remedial',
  not_eligible: 'Belum Memenuhi Syarat',
  active: 'Aktif',
  locked: 'Terkunci',
  not_open: 'Belum Dibuka',
  submitted: 'Sudah Dikirim',
  approved: 'Disetujui',
  draft: 'Draft',
  pending: 'Menunggu Konfirmasi',
  rejected: 'Ditolak',
};

export function fmtDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

export function fmtTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta'
  }).format(new Date(value)) + ' WIB';
}

export function fmtLongDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));
}

export function isToday(value) {
  if (!value) return false;
  const d1 = new Date(value);
  const d2 = new Date();
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
}

export function KencanaShell({ title, subtitle, actions, breadcrumbs, children }) {
  const { pathname } = useLocation();
  const isDashboard = pathname === '/student/kencana';

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#1d1b16] px-4 py-5 md:px-8 md:py-8">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-[#d8a84f]/20 blur-3xl" />
        <div className="absolute top-56 -left-24 h-72 w-72 rounded-full bg-[#0f4c5c]/10 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto space-y-6">
        <header className="space-y-3">
          {/* Active Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs font-bold text-[#8d826d] flex-wrap">
            <Link to="/student" className="hover:text-[#0f4c5c] transition-colors">Portal</Link>
            <span>/</span>
            <Link to="/student/kencana" className={`hover:text-[#0f4c5c] transition-colors ${isDashboard ? 'text-[#0f4c5c] font-black' : ''}`}>Kencana</Link>
            
            {breadcrumbs ? (
              breadcrumbs.map((bc, i) => (
                <React.Fragment key={i}>
                  <span>/</span>
                  {bc.to ? (
                    <Link to={bc.to} className="hover:text-[#0f4c5c] transition-colors">{bc.label}</Link>
                  ) : (
                    <span className="text-[#1d1b16] font-black uppercase tracking-wider">{bc.label}</span>
                  )}
                </React.Fragment>
              ))
            ) : (
              !isDashboard && (
                <>
                  <span>/</span>
                  <span className="text-[#1d1b16] font-black uppercase tracking-wider">{title}</span>
                </>
              )
            )}
          </nav>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mt-1">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1d1b16]">{title}</h1>
              {subtitle && <p className="mt-2 max-w-2xl text-sm font-medium text-[#6f6759] leading-relaxed">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const s = status || 'not_started';
  const tone = s === 'passed' || s === 'approved' || s === 'completed' || s === 'active'
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : s === 'remedial' || s === 'not_eligible' || s === 'rejected'
      ? 'bg-rose-100 text-rose-700 border-rose-200'
      : s === 'conditional_pass' || s === 'submitted' || s === 'pending'
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : 'bg-stone-100 text-stone-600 border-stone-200';
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${tone}`}>{statusLabels[s] || s}</span>;
}

export function MetricCard({ label, value, hint, icon = 'analytics' }) {
  return (
    <div className="rounded-3xl border border-[#e8dfcf] bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#9b8f7a]">{label}</p>
          <p className="mt-2 text-3xl font-black text-[#1d1b16]">{value}</p>
          {hint && <p className="mt-1 text-xs font-semibold text-[#756b5a]">{hint}</p>}
        </div>
        <div className="grid size-11 place-items-center rounded-2xl bg-[#0f4c5c] text-white">
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

export function ProgressBar({ value = 0 }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-[#eadfca]">
      <div className="h-full rounded-full bg-gradient-to-r from-[#0f4c5c] to-[#d8a84f] transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function LoadingPanel() {
  return <div className="rounded-3xl border border-[#e8dfcf] bg-white/70 p-8 text-sm font-bold text-[#756b5a]">Memuat data Kencana...</div>;
}

export function ErrorPanel({ message = 'Data belum tersedia.' }) {
  return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm font-bold text-rose-700">{message}</div>;
}

export function PrimaryButton({ to, children, onClick, disabled }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${disabled ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-[#0f4c5c] text-white hover:bg-[#123f4b]'}`;
  if (to && !disabled) return <Link to={to} className={cls}>{children}</Link>;
  return <button onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

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
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] px-4 py-5 md:px-8 md:py-8">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-[var(--theme-secondary-light)] blur-3xl" />
        <div className="absolute top-56 -left-24 h-72 w-72 rounded-full bg-[var(--theme-primary-light)] blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto space-y-6">
        <header className="space-y-3">
          {/* Active Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs font-bold text-[var(--theme-text-muted)] flex-wrap">
            <Link to="/student" className="hover:text-[var(--theme-primary)] transition-colors">Portal</Link>
            <span>/</span>
            <Link to="/student/kencana" className={`hover:text-[var(--theme-primary)] transition-colors ${isDashboard ? 'text-[var(--theme-primary)] font-black' : ''}`}>Kencana</Link>
            
            {breadcrumbs ? (
              breadcrumbs.map((bc, i) => (
                <React.Fragment key={i}>
                  <span>/</span>
                  {bc.to ? (
                    <Link to={bc.to} className="hover:text-[var(--theme-primary)] transition-colors">{bc.label}</Link>
                  ) : (
                    <span className="text-[var(--theme-text)] font-black uppercase tracking-wider">{bc.label}</span>
                  )}
                </React.Fragment>
              ))
            ) : (
              !isDashboard && (
                <>
                  <span>/</span>
                  <span className="text-[var(--theme-text)] font-black uppercase tracking-wider">{title}</span>
                </>
              )
            )}
          </nav>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mt-1">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--theme-text)] font-headline">{title}</h1>
              {subtitle && <p className="mt-2 max-w-2xl text-sm font-medium text-[var(--theme-text-muted)] leading-relaxed">{subtitle}</p>}
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
    ? 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success)]/20'
    : s === 'remedial' || s === 'not_eligible' || s === 'rejected'
      ? 'bg-[var(--theme-error-light)] text-[var(--theme-error)] border-[var(--theme-error)]/20'
      : s === 'conditional_pass' || s === 'submitted' || s === 'pending'
        ? 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning)]/20'
        : 'bg-[var(--theme-border-muted)] text-[var(--theme-text-muted)] border-[var(--theme-border)]';
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${tone}`}>{statusLabels[s] || s}</span>;
}

export function MetricCard({ label, value, hint, icon = 'analytics' }) {
  return (
    <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)]/80 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--theme-text-muted)]">{label}</p>
          <p className="mt-2 text-3xl font-black text-[var(--theme-text)] font-headline">{value}</p>
          {hint && <p className="mt-1 text-xs font-semibold text-[var(--theme-text-muted)]">{hint}</p>}
        </div>
        <div className="grid size-11 place-items-center rounded-xl bg-[var(--theme-primary)] text-[var(--theme-text-on-primary)] shadow-sm">
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

export function ProgressBar({ value = 0 }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-[var(--theme-border-muted)]">
      <div className="h-full rounded-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function LoadingPanel() {
  return <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)]/70 p-8 text-sm font-bold text-[var(--theme-text-muted)]">Memuat data Kencana...</div>;
}

export function ErrorPanel({ message = 'Data belum tersedia.' }) {
  return <div className="rounded-2xl border border-[var(--theme-error)]/25 bg-[var(--theme-error-light)] p-8 text-sm font-bold text-[var(--theme-error)]">{message}</div>;
}

export function PrimaryButton({ to, children, onClick, disabled }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition ${disabled ? 'bg-[var(--theme-border-muted)] text-[var(--theme-text-subtle)] cursor-not-allowed' : 'bg-[var(--theme-primary)] text-[var(--theme-text-on-primary)] hover:bg-[var(--theme-primary-hover)] shadow-sm'}`;
  if (to && !disabled) return <Link to={to} className={cls}>{children}</Link>;
  return <button onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

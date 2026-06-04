import React from 'react';

/**
 * Button — Standar button dengan variant: primary, secondary, danger, ghost, icon
 *
 * Aturan (dari FRONTEND_UI_STYLE_GUIDE.md):
 * - Primary: bg var(--theme-primary), text white, borderRadius var(--theme-btn-radius)
 * - Secondary: border var(--theme-border), color var(--theme-text)
 * - Danger: bg var(--theme-error), text white
 * - Ghost: hover bg-black/[0.03], color var(--theme-text-muted)
 * - Radius: var(--theme-btn-radius) untuk SEMUA tombol
 */
export default function Button({
  children,
  variant = 'primary', // primary | secondary | danger | ghost | icon
  icon,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseClasses = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: {
      style: {
        backgroundColor: 'var(--theme-primary)',
        color: 'white',
        border: 'none',
      },
      hover: 'hover:opacity-90 hover:shadow-md',
    },
    secondary: {
      style: {
        backgroundColor: 'var(--theme-surface)',
        color: 'var(--theme-text)',
        border: '1px solid var(--theme-border)',
      },
      hover: 'hover:bg-black/[0.03] hover:shadow-sm',
    },
    danger: {
      style: {
        backgroundColor: 'var(--theme-error)',
        color: 'white',
        border: 'none',
      },
      hover: 'hover:opacity-90 hover:shadow-md',
    },
    ghost: {
      style: {
        backgroundColor: 'transparent',
        color: 'var(--theme-text-muted)',
        border: 'none',
      },
      hover: 'hover:bg-black/[0.03] hover:text-[var(--theme-text)]',
    },
    icon: {
      style: {
        backgroundColor: 'transparent',
        color: 'var(--theme-text-muted)',
        border: 'none',
        padding: '0.625rem',
      },
      hover: 'hover:bg-black/[0.05] hover:text-[var(--theme-text)]',
    },
  };

  const v = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${v.hover} ${className}`}
      style={v.style}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
      ) : icon ? (
        <span className="material-symbols-outlined text-sm">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
import React from 'react'
import { cn } from '@/lib/utils'

export function PrimaryStatsCard({
  title,
  value,
  icon: Icon,
  colorTheme = 'primary',
  badgeText,
  badgeIcon,
  onClick,
  className,
  subtitle
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-border)] shadow-sm transition-all duration-300 overflow-hidden flex flex-col justify-between",
        onClick && "cursor-pointer hover:shadow-xl hover:border-[var(--theme-primary-light)]",
        className
      )}
    >
      <div className={cn(
        "absolute top-0 right-0 p-4 opacity-5 transition-transform duration-500 pointer-events-none group-hover:scale-150",
        colorTheme === 'primary' && "text-[var(--theme-primary)] group-hover:-rotate-12",
        colorTheme === 'info' && "text-[var(--theme-info)] group-hover:rotate-12",
        colorTheme === 'success' && "text-[var(--theme-success)] group-hover:-rotate-12",
        colorTheme === 'warning' && "text-[var(--theme-warning)] group-hover:rotate-12",
        colorTheme === 'error' && "text-[var(--theme-error)] group-hover:-rotate-12"
      )}>
        {Icon && <Icon size={80} />}
      </div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={cn(
          "w-12 h-12 rounded-xl flex justify-center items-center transition-colors duration-300 shadow-sm",
          colorTheme === 'primary' && "bg-[var(--theme-primary-light)] text-[var(--theme-primary)] group-hover:bg-[var(--theme-primary)] group-hover:text-white",
          colorTheme === 'info' && "bg-[var(--theme-info-light)] text-[var(--theme-info)] group-hover:bg-[var(--theme-info)] group-hover:text-white",
          colorTheme === 'success' && "bg-[var(--theme-success-light)] text-[var(--theme-success)] group-hover:bg-[var(--theme-success)] group-hover:text-white",
          colorTheme === 'warning' && "bg-[var(--theme-warning-light)] text-[var(--theme-warning)] group-hover:bg-[var(--theme-warning)] group-hover:text-white",
          colorTheme === 'error' && "bg-[var(--theme-error-light)] text-[var(--theme-error)] group-hover:bg-[var(--theme-error)] group-hover:text-white"
        )}>
          {Icon && <Icon size={24} />}
        </div>
        
        {badgeText && (
          <span className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border",
            colorTheme === 'primary' && "bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border-[var(--theme-border-muted)]",
            colorTheme === 'info' && "bg-[var(--theme-info-light)] text-[var(--theme-info)] border-[var(--theme-border-muted)]",
            colorTheme === 'success' && "bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-border-muted)]",
            colorTheme === 'warning' && "bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-border-muted)]",
            colorTheme === 'error' && "bg-[var(--theme-error-light)] text-[var(--theme-error)] border-[var(--theme-border-muted)]"
          )}>
            {badgeIcon}
            {badgeText}
          </span>
        )}
      </div>
      
      <div className="relative z-10 w-full min-w-0">
        <p className="text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest mb-1 truncate">{title}</p>
        <p className="text-2xl font-black text-[var(--theme-text)] tracking-tight font-headline truncate">
          {value}
        </p>
        {subtitle && <p className="text-[9px] text-[var(--theme-text-subtle)] font-bold mt-1 truncate">{subtitle}</p>}
      </div>
    </div>
  )
}

export function SecondaryStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorTheme = 'primary',
  className
}) {
  return (
    <div className={cn(
      "bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-border)] shadow-sm hover:shadow-md hover:border-[var(--theme-primary-light)] transition-all flex flex-col justify-between",
      className
    )}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex justify-center items-center shrink-0",
          colorTheme === 'primary' && "bg-[var(--theme-primary-light)] text-[var(--theme-primary)]",
          colorTheme === 'info' && "bg-[var(--theme-info-light)] text-[var(--theme-info)]",
          colorTheme === 'success' && "bg-[var(--theme-success-light)] text-[var(--theme-success)]",
          colorTheme === 'warning' && "bg-[var(--theme-warning-light)] text-[var(--theme-warning)]",
          colorTheme === 'error' && "bg-[var(--theme-error-light)] text-[var(--theme-error)]"
        )}>
          {Icon && <Icon size={20} />}
        </div>
        <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest">{title}</span>
      </div>
      <div>
        <p className="text-xl font-black text-[var(--theme-text)] truncate font-headline">{value}</p>
        {subtitle && <p className="text-xs text-[var(--theme-text-subtle)] font-medium mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

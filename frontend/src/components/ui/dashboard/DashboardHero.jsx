import React from 'react';
import { cn } from '../../../lib/utils';

export function DashboardHero({ 
  title, 
  highlightedTitle, 
  subtitle, 
  icon = 'admin_panel_settings',
  badges = [], // Array of { label, active: boolean, color: 'emerald' | 'primary' }
  actions, // ReactNode for buttons
  className 
}) {
  return (
    <section className={cn(
      "relative overflow-hidden rounded-2xl p-6 md:p-8 border border-border bg-surface shadow-sm mb-6",
      className
    )}>
      {/* Subtle geometric grid background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-background/40 to-background/30" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, var(--theme-primary) 1px, transparent 1px), radial-gradient(circle at 80% 20%, var(--theme-primary) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Accent glow blobs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl animate-pulse pointer-events-none" 
        style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)' }} />
      <div className="absolute -bottom-10 right-40 w-48 h-48 rounded-full blur-2xl pointer-events-none" 
        style={{ backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)' }} />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-4">
            {/* Visual Anchor Icon */}
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden group/icon" 
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)', 
                borderColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)', 
                color: 'var(--theme-primary)' 
              }}>
              <div className="absolute inset-0 opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300" 
                style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)' }} />
              <span className="material-symbols-outlined relative z-10 transition-transform duration-300 group-hover/icon:scale-110" 
                style={{ fontSize: '26px' }}>{icon}</span>
            </div>

            <div className="space-y-1">
              {/* Badges */}
              {badges && badges.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {badges.map((badge, idx) => (
                    <span key={idx} className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border",
                      badge.active 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : "bg-primary/5 text-primary border-primary/10"
                    )}>
                      {badge.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {badge.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight font-headline leading-none">
                {title} {highlightedTitle && (
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {highlightedTitle}
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-muted font-medium text-xs md:text-sm max-w-3xl leading-relaxed mt-3 md:pl-[72px]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Button Area */}
        {actions && (
          <div className="flex flex-row lg:flex-col items-end gap-3 shrink-0 self-stretch lg:self-auto justify-between lg:justify-center border-t lg:border-t-0 pt-4 lg:pt-0 border-border-muted">
            <div className="flex items-center gap-2">
              {actions}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

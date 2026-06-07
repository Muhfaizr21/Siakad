import React from 'react';
import { cn } from '../../../lib/utils';
import { Link } from 'react-router-dom';

export function PageHeader({ 
  title, 
  subtitle, 
  icon = 'dashboard', 
  breadcrumbs = [], 
  action,
  className,
  ...props 
}) {
  return (
    <div 
      className={cn(
        "rounded-2xl border border-[var(--theme-border)] bg-surface p-5 md:p-6 shadow-sm mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
        className
      )} 
      {...props}
    >
      <div className="flex items-center gap-4">
        {/* Icon Anchor */}
        {icon && (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[var(--theme-bg)] border border-[var(--theme-border)]">
            <span className="material-symbols-outlined text-[24px] text-[var(--theme-text-muted)]">{icon}</span>
          </div>
        )}
        
        <div className="space-y-0.5">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--theme-text-muted)] mb-1 font-headline">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {crumb.path ? (
                    <Link to={crumb.path} className="hover:text-[var(--theme-primary)] transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-[var(--theme-primary)]">{crumb.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && (
                    <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>chevron_right</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-xl font-bold tracking-tight text-[var(--theme-text)] font-headline leading-tight">
            {title}
          </h1>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs font-medium text-[var(--theme-text-muted)] max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Action Button/Area */}
      {action && (
        <div className="flex shrink-0 items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}


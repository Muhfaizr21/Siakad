import React from 'react';
import { cn } from '../../../lib/utils';

export function PageCard({ children, className, noPadding = false, ...props }) {
  return (
    <div 
      className={cn(
        "bg-surface border border-border rounded-2xl shadow-sm overflow-hidden",
        !noPadding && "p-5 sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageCardHeader({ title, description, icon, action, className }) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary-light)] text-[var(--theme-primary)] flex items-center justify-center border border-[var(--theme-primary)]/20 shrink-0">
            <span className="material-symbols-outlined text-lg">{icon}</span>
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-on-surface font-headline leading-tight">{title}</h2>
          {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

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
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-2", className)} {...props}>
      <div className="flex items-start gap-4">
        {/* Icon Anchor */}
        {icon && (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border" 
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)', 
              color: 'var(--theme-primary)',
              borderColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)' 
            }}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
          </div>
        )}
        
        <div className="space-y-1">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted mb-1 font-headline">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {crumb.path ? (
                    <Link to={crumb.path} className="hover:text-primary transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-primary">{crumb.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && (
                    <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>chevron_right</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-2xl font-bold tracking-tight text-on-surface font-headline leading-tight">
            {title}
          </h1>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm font-medium text-muted max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Action Button/Area */}
      {action && (
        <div className="flex shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

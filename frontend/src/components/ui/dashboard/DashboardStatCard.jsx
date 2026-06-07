import React from 'react';
import { cn } from '../../../lib/utils';
import { Link } from 'react-router-dom';

export function DashboardStatCard({ 
  label, 
  title,
  value, 
  description, 
  subtitle,
  icon = "show_chart", 
  route,
  loading = false,
  badge, // { text, icon: "show_chart" }
  colorClass = "text-[var(--theme-primary)]",
  iconColor,
  bgClass = "bg-[var(--theme-primary-light)] border-[var(--theme-primary)]/20 border",
  iconBg,
  accentGradient = "from-[var(--theme-primary)]/10",
  className,
  ...props
}) {
  const displayLabel = label || title;
  const displayDescription = description || subtitle;
  const displayColorClass = iconColor || colorClass;
  const displayBgClass = iconBg || bgClass;

  const CardWrapper = route ? Link : 'div';
  const wrapperProps = route ? { to: route } : {};

  return (
    <CardWrapper
      {...wrapperProps}
      {...props}
      className={cn(
        "group block bg-surface border border-border rounded-2xl shadow-sm text-left hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden",
        (route || props.onClick) && "hover:shadow-md cursor-pointer",
        className
      )}
    >
      {/* Decorative gradient blob at bottom left */}
      <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl to-transparent rounded-bl-full opacity-40 pointer-events-none", accentGradient)} />
      
      {loading ? (
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center mb-2">
             <div className="h-10 w-10 animate-pulse bg-border-muted/50 rounded-xl" />
          </div>
          <div className="h-4 w-24 animate-pulse bg-border-muted/50 rounded-md" />
          <div className="h-8 w-16 animate-pulse bg-border-muted/50 rounded-md mt-1" />
          <div className="h-3 w-32 animate-pulse bg-border-muted/50 rounded-md mt-2" />
        </div>
      ) : (
        <div className="p-5 relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110", displayBgClass, displayColorClass)}>
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
            
            {badge && (
              <div className="flex items-center gap-1 text-[10px] font-semibold text-[var(--theme-success)] bg-[var(--theme-success-light)] border border-[var(--theme-success)]/20 px-2 py-0.5 rounded-full shrink-0">
                {badge.icon && <span className="material-symbols-outlined" style={{ fontSize: '9px' }}>{badge.icon}</span>}
                {badge.text}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-xs font-medium text-muted mb-1 line-clamp-1">{displayLabel}</p>
            <p className="text-2xl font-bold text-on-surface leading-none tabular-nums font-headline truncate">
              {value}
            </p>
            {displayDescription && (
              <p className="text-[10px] text-muted font-medium mt-2 line-clamp-2 leading-relaxed">
                {displayDescription}
              </p>
            )}
          </div>
        </div>
      )}
    </CardWrapper>
  );
}

export function DashboardStatGrid({ children, className }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6", className)}>
      {children}
    </div>
  );
}

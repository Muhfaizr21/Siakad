import React from 'react';
import { cn } from '../../../lib/utils';
import { Link } from 'react-router-dom';

export function DashboardQuickActions({ title = "Aksi Cepat", description = "Pintasan Menu", actions = [], className }) {
  if (!actions || actions.length === 0) return null;
  
  return (
    <div className={cn("bg-surface border border-border rounded-2xl shadow-sm p-5 mb-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-primary font-headline">{title}</h2>
        {description && <span className="text-xs font-medium text-muted ml-auto">{description}</span>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {actions.map((item, i) => {
          const Wrapper = item.path ? Link : 'button';
          const props = item.path ? { to: item.path } : { onClick: item.onClick };
          
          return (
            <Wrapper
              key={i}
              {...props}
              className="group flex flex-col items-center justify-center p-4 md:p-5 rounded-xl bg-surface border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[var(--theme-primary)]/30 active:scale-95 text-left w-full"
            >
              <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4 transition-all duration-300 group-hover:scale-110 shadow-sm", item.iconBg || "bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border border-[var(--theme-primary)]/20")}>
                <span className="material-symbols-outlined text-[20px] md:text-[24px] transition-transform duration-300 group-hover:rotate-6">{item.icon}</span>
              </div>
              <span className="text-[11px] md:text-xs font-medium text-center leading-snug text-muted group-hover:text-primary transition-colors line-clamp-2">{item.label}</span>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}

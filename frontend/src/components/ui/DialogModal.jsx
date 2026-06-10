import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DialogModal({
  open,
  onOpenChange,
  onClose,
  title,
  description,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = 'max-w-lg',
  className,
  bodyClassName,
  variant = 'default'
}) {
  const handleOpenChange = (isOpen) => {
    onOpenChange?.(isOpen);
    if (!isOpen) {
      onClose?.();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={cn(
          "fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 w-full max-h-[95vh] flex flex-col rounded-[2rem] bg-[var(--theme-bg)]/95 backdrop-blur-xl shadow-2xl border border-[var(--theme-border)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden",
          maxWidth,
          className
        )}>
          {/* ── Premium Dynamic Header ────────────────────────────────────── */}
          <div className={cn(
            "relative pt-8 pb-8 px-8 overflow-hidden flex-shrink-0 border-b border-white/10 bg-gradient-to-br",
            variant === 'success' ? 'from-emerald-500 via-emerald-600 to-teal-800' :
              variant === 'info' ? 'from-sky-500 via-blue-600 to-indigo-800' :
                variant === 'danger' ? 'from-rose-500 via-rose-600 to-red-900' :
                  variant === 'warning' ? 'from-amber-500 via-orange-500 to-amber-700' :
                    'from-primary via-primary to-blue-700'
          )}>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
            
            {/* Optional Header Watermark Icon */}
            {icon && typeof icon === 'string' && (
              <div className="absolute -top-6 -right-2 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[140px] drop-shadow-xl">{icon}</span>
              </div>
            )}
            
            <Dialog.Close asChild>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); handleOpenChange(false); }} 
                className="absolute z-50 top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all text-white border border-white/20 cursor-pointer shadow-xl hover:scale-105 active:scale-95"
              >
                <X className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </Dialog.Close>

            <div className="relative z-10 flex gap-5 items-start">
              {/* Premium Icon Box */}
              {icon && (
                <div className="hidden sm:flex flex-shrink-0 w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md items-center justify-center shadow-inner">
                  {typeof icon === 'string' ? (
                    <span className="material-symbols-outlined text-white text-[32px] drop-shadow-md transition-transform group-hover:scale-110">{icon}</span>
                  ) : (
                    <div className="text-white drop-shadow-md transition-transform group-hover:scale-110 [&>svg]:w-8 [&>svg]:h-8 [&>span]:text-[32px]">
                      {icon}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  {subtitle && (
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-full px-3 py-1 backdrop-blur-md shadow-inner">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
                        <div className="text-[10px] font-black text-white/90 uppercase tracking-widest">
                          {subtitle}
                        </div>
                      </div>
                    </div>
                  )}
                  {title && (
                    <Dialog.Title className="text-xl sm:text-2xl font-black font-headline tracking-tighter text-white leading-tight drop-shadow-sm pr-12">
                      {title}
                    </Dialog.Title>
                  )}
                  {description && (
                    <Dialog.Description className="text-sm font-medium text-white/80 font-inter mt-1.5 pr-8">
                      {description}
                    </Dialog.Description>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* ── Body ────────────────────────────────────────────── */}
          <div className={cn("flex-1 overflow-y-auto bg-[var(--theme-bg)]/20", bodyClassName || "p-6 sm:p-8 space-y-6")}>
            {children}
          </div>
          
          {/* ── Footer ───────────────────────────────────────────── */}
          {footer && (
            <div className="px-6 sm:px-8 py-5 border-t border-[var(--theme-border)] bg-[var(--theme-surface)]/80 backdrop-blur-md flex justify-end gap-3 flex-shrink-0">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ModalCancelButton({ onClick, children = "Batal", className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 px-6 sm:px-8 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[11px] font-black text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:border-[var(--theme-border-muted)] hover:bg-[var(--theme-bg)] uppercase tracking-[0.1em] transition-all duration-300 active:scale-95 cursor-pointer shadow-sm",
        className
      )}
    >
      {children}
    </button>
  );
}

export function ModalSaveButton({ onClick, disabled, loading, children = "Simpan", icon = "task_alt", className }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "group relative h-11 px-6 sm:px-8 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 text-white font-black text-[11px] uppercase tracking-[0.1em] transition-all duration-300 flex items-center justify-center gap-2 border border-transparent shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none" />
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white relative z-10"></div>
      ) : icon ? (
        <span className="material-symbols-outlined relative z-10 group-hover:scale-110 transition-transform duration-300" style={{ fontSize: '18px' }} >{icon}</span>
      ) : null}
      <span className="relative z-10">{children}</span>
    </button>

  );
}

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
                <Dialog.Content 
                    aria-describedby={undefined}
                    className={cn(
                    "fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 w-full max-h-[95vh] flex flex-col rounded-[2rem] bg-[var(--theme-bg)]/95 backdrop-blur-xl shadow-2xl border border-[var(--theme-border)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden",
                    maxWidth,
                    className
                )}>
                    {/* ── Premium Dynamic Header ────────────────────────────────────── */}
                    <div className={cn(
                        "relative pt-8 pb-8 px-8 overflow-hidden flex-shrink-0 border-b border-white/10 bg-gradient-to-br",
                        variant === 'success' ? 'from-emerald-500 to-emerald-700' :
                            variant === 'info' ? 'from-blue-500 to-blue-700' :
                                variant === 'danger' ? 'from-rose-500 to-rose-700' :
                                    variant === 'warning' ? 'from-amber-500 to-amber-700' :
                                        'bg-[var(--theme-primary)] from-white/15 to-black/20'
                    )}>
                        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full pointer-events-none" />
                        <div className="absolute -bottom-6 right-16 w-28 h-28 bg-white/10 rounded-full pointer-events-none" />

                        {/* Optional Header Watermark Icon */}
                        {icon && typeof icon === 'string' && (
                            <div className="absolute -top-6 -right-2 opacity-10 pointer-events-none">
                                <span className="material-symbols-outlined -rotate-12 text-white" style={{ fontSize: "140px" }}>{icon}</span>
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

            <div className="relative z-10">
              {(icon || subtitle) && (
                <div className="flex items-center gap-3 mb-2">
                  {icon && (
                    <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm border border-white/20 shadow-inner flex-shrink-0">
                      {typeof icon === 'string' ? (
                        <span className="material-symbols-outlined stroke-[3px] whitespace-nowrap" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24" }}>
                          {icon}
                        </span>
                      ) : (
                        <div className="[&>svg]:w-4 [&>svg]:h-4">
                          {icon}
                        </div>
                      )}
                    </div>
                  )}
                  {subtitle && (
                    <div className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-white/10 text-white border border-white/20 rounded-md backdrop-blur-sm shadow-sm uppercase">
                      {subtitle}
                    </div>
                  )}
                </div>
              )}
              
              <Dialog.Title className="text-xl font-black text-white font-headline tracking-tighter pr-8 drop-shadow-sm">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-xs font-semibold text-white/70 mt-1 max-w-xl">
                  {description}
                </Dialog.Description>
              )}
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
                "group h-11 px-6 sm:px-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-[0.1em] transition-all duration-300 flex items-center justify-center cursor-pointer hover:-translate-y-0.5 active:translate-y-0 border-none",
                className
            )}
        >
            <span>{children}</span>
        </button>
    );
}

export function ModalSaveButton({ onClick, disabled, loading, text, children = "Simpan", icon = "task_alt", className, form, type }) {
    return (
        <button
            type={type || (form ? "submit" : "button")}
            form={form}
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
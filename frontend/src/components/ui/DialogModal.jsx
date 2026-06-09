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
  className
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
          "fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 w-full max-h-[90vh] flex flex-col rounded-2xl bg-[var(--theme-bg)] shadow-2xl border border-[var(--theme-border)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden",
          maxWidth,
          className
        )}>
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 px-6 py-6 border-b border-blue-800 flex-shrink-0">
            {/* Dekorasi abstrak */}
            <div className="absolute top-0 right-0 w-32 h-full bg-white opacity-5 skew-x-12 translate-x-8 pointer-events-none"></div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full border-4 border-white/10 pointer-events-none"></div>
            
            <Dialog.Close asChild>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); handleOpenChange(false); }} 
                className="absolute top-4 right-4 rounded-lg p-1.5 hover:bg-white/20 text-white/70 hover:text-white transition-colors z-20 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>

            <div className="flex items-center gap-4 relative z-10">
              {icon && (
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md shadow-inner shrink-0 [&>svg]:w-6 [&>svg]:h-6">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <Dialog.Title className="text-xl font-extrabold font-headline leading-tight truncate text-white">
                    {title}
                  </Dialog.Title>
                )}
                {(description || subtitle) && (
                  <Dialog.Description className="text-xs text-blue-100 font-medium mt-0.5">
                    {description || subtitle}
                  </Dialog.Description>
                )}
              </div>
            </div>
          </div>
          
          {/* Body - scrollable */}
          <div className="flex-1 overflow-y-auto p-6 bg-[var(--theme-bg)]/20 space-y-6">
            {children}
          </div>
          
          {/* Footer opsional */}
          {footer && (
            <div className="px-5 py-4 border-t border-[var(--theme-border)] bg-[var(--theme-surface)] flex justify-end gap-3 flex-shrink-0">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

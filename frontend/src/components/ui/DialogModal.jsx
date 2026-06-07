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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-[var(--theme-border)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden",
          maxWidth,
          className
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--theme-border-muted)] shrink-0">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 bg-[var(--theme-primary-light)] rounded-xl flex items-center justify-center text-[var(--theme-primary)] shrink-0">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <Dialog.Title className="text-base font-semibold text-[var(--theme-text)] font-headline">
                    {title}
                  </Dialog.Title>
                )}
                {(description || subtitle) && (
                  <Dialog.Description className="text-sm text-[var(--theme-text-muted)] mt-0.5">
                    {description || subtitle}
                  </Dialog.Description>
                )}
              </div>
            </div>
            <Dialog.Close className="rounded-lg p-1 hover:bg-[var(--theme-bg)] text-[var(--theme-text-muted)] transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          
          {/* Body - scrollable */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
          
          {/* Footer opsional */}
          {footer && (
            <div className="px-6 py-4 border-t border-[var(--theme-border-muted)] flex justify-end gap-3 shrink-0">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import React from 'react';

/**
 * Dialog — Modal dialog standar
 *
 * Aturan (dari FRONTEND_UI_STYLE_GUIDE.md):
 * - Overlay: fixed inset-0 bg-black/40 backdrop-blur-sm
 * - Modal: rounded-2xl, bg var(--theme-surface), border var(--theme-border)
 * - Header: flex justify-between items-center, border-b var(--theme-border)
 * - Close button: absolute right-4 top-4
 * - Radius: rounded-2xl
 */
function DialogPortal({ children }) {
  return typeof document !== 'undefined' ? React.createElement('div', null, children) : null;
}

function DialogOverlay({ children }) {
  return children;
}

export function DialogContent({ className = '', children, ...props }) {
  return (
    <div className={`p-0 overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DialogHeader({ className = '', ...props }) {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-6 pb-0 ${className}`}
      {...props}
    />
  );
}

export function DialogTitle({ className = '', ...props }) {
  return (
    <h2
      className={`text-lg font-bold leading-none tracking-tight text-[#171717] font-headline ${className}`}
      {...props}
    />
  );
}

export function DialogDescription({ className = '', ...props }) {
  return (
    <p
      className={`text-sm text-muted font-medium ${className}`}
      {...props}
    />
  );
}

export function DialogClose({ ...props }) {
  return null;
}

export default function Dialog({ open, onOpenChange, children }) {
  const isOpen = open;
  const handleClose = () => onOpenChange && onOpenChange(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <DialogPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="relative w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 bg-white border border-[#e5e5e5]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 rounded-lg transition-colors hover:bg-black/[0.05] z-10"
              style={{ color: '#a3a3a3' }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {children}
          </div>
        </div>
      </DialogPortal>
    </>
  );
}
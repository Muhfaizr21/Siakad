import React, { useEffect } from 'react'

import { cn } from '@/lib/utils'

/**
 * Modal - Custom fixed overlay modal (no Radix UI, no CSS conflict)
 * Replaces <Dialog> + <DialogContent> pattern across FacultyAdmin pages.
 * 
 * Usage:
 *   <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Judul Modal" maxWidth="max-w-2xl">
 *     {children}
 *   </Modal>
 */
export function Modal({ open, onClose, title, subtitle, icon, children, maxWidth = 'max-w-2xl', className }) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div
        className={cn(
          'bg-white w-full rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200',
          maxWidth,
          className
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200/60 shrink-0">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 bg-[#eef4ff] rounded-xl flex items-center justify-center text-primary shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && <h2 className="text-lg font-extrabold font-headline" style={{ color: 'var(--theme-h2)' }}>{title}</h2>}
              {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors p-1 rounded-lg hover:bg-slate-50"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >close</span>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * ModalFooter - Standard footer for Modal with action buttons
 */
export function ModalFooter({ children, className }) {
  return (
    <div className={cn(
      'px-6 py-4 border-t border-slate-200/60 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-2xl shrink-0',
      className
    )}>
      {children}
    </div>
  )
}

/**
 * ModalBody - Standard padded body content area
 */
export function ModalBody({ children, className }) {
  return (
    <div className={cn('p-6 space-y-5', className)}>
      {children}
    </div>
  )
}

/**
 * Pre-built button styles for modal actions
 */
export function ModalBtn({ variant = 'default', children, className, ...props }) {
  const base = 'px-5 py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5'
  const variants = {
    default:   'bg-primary text-white hover:bg-[#0B4FAE]',
    outline:   'border border-slate-200/60 text-slate-600 bg-white hover:bg-slate-50',
    danger:    'border border-[#fecaca] text-[#dc2626] bg-white hover:bg-[#fef2f2]',
    ghost:     'text-slate-600 hover:bg-slate-50',
    success:   'bg-[#16a34a] text-white hover:bg-[#15803d]',
  }
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}

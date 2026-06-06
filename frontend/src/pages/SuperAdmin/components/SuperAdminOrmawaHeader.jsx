import React from 'react'
import { OrmawaSelector } from './OrmawaSelector'
import { useSuperAdminOrmawa } from '../../../contexts/SuperAdminOrmawaContext'

/**
 * Header component untuk halaman ormawa di Super Admin
 * Menampilkan dropdown selector ormawa
 */
export function SuperAdminOrmawaHeader({ title = "Manajemen Ormawa" }) {
  let selectedOrmawa, selectedOrmawaId
  
  // Safe context usage
  try {
    const context = useSuperAdminOrmawa()
    selectedOrmawa = context.selectedOrmawa
    selectedOrmawaId = context.selectedOrmawaId
  } catch (error) {
    console.error('SuperAdminOrmawaHeader: Context not available')
    selectedOrmawa = null
    selectedOrmawaId = null
  }

  return (
    <section
      className="rounded-xl p-5 border border-border mb-6"
      style={{ backgroundColor: 'var(--theme-surface)' }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}
          >
            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
              {title} <span style={{ color: 'var(--theme-secondary)' }}>(Super Admin)</span>
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
              {selectedOrmawa ? (
                <>
                  Mengelola data <span className="font-bold">{selectedOrmawa.Nama}</span>
                  {selectedOrmawa.Singkatan && ` (${selectedOrmawa.Singkatan})`}
                </>
              ) : (
                'Pilih organisasi untuk melihat dan mengelola data'
              )}
            </p>
          </div>
        </div>

        {/* Dropdown Ormawa Selector */}
        <OrmawaSelector />
      </div>
    </section>
  )
}

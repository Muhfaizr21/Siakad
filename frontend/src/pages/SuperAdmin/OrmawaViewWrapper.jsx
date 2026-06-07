import React, { useState, useEffect } from 'react'
import { OrmawaSelector } from './components/OrmawaSelector'

/**
 * Wrapper component untuk halaman ormawa di Super Admin
 * Menambahkan dropdown selector ormawa di header
 */
export function OrmawaViewWrapper({ children, title = "Dashboard Ormawa" }) {
  const [selectedOrmawaId, setSelectedOrmawaId] = useState(null)

  // Pass selectedOrmawaId ke children component via React context or props
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { ormawaIdOverride: selectedOrmawaId })
    }
    return child
  })

  return (
    <div className="min-h-screen bg-transparent font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header dengan Dropdown Ormawa Selector */}
        <section
          className="rounded-xl p-5 border border-border"
          style={{ backgroundColor: 'var(--theme-surface)' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}
              >
                <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                  {title}
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Sebagai Super Admin, pilih organisasi untuk melihat data spesifik
                </p>
              </div>
            </div>

            {/* Right: Ormawa Selector */}
            <OrmawaSelector 
              value={selectedOrmawaId} 
              onChange={setSelectedOrmawaId}
              className="w-full md:w-auto"
            />
          </div>
        </section>

        {/* Content dari halaman ormawa */}
        {selectedOrmawaId ? (
          childrenWithProps
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '32px' }}>
                groups
              </span>
            </div>
            <p className="text-sm font-medium text-slate-600">
              Pilih organisasi untuk melihat dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

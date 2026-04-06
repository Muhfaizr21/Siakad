import React from 'react'

/**
 * AdminLayout - Content wrapper untuk child pages di dalam FacultyDashboard.
 * Hanya memberikan padding konsisten. Sidebar & TopNavBar sudah ada di FacultyDashboard (parent).
 */
export function AdminLayout({ children }) {
  return (
    <div className="p-8 space-y-6 min-h-[calc(100vh-56px)]">
      {children}
    </div>
  )
}

export default AdminLayout

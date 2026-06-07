import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const SuperAdminOrmawaContext = createContext()

export function useSuperAdminOrmawa() {
  const context = useContext(SuperAdminOrmawaContext)
  if (!context) {
    throw new Error('useSuperAdminOrmawa must be used within SuperAdminOrmawaProvider')
  }
  return context
}

export function SuperAdminOrmawaProvider({ children }) {
  const [selectedOrmawaId, setSelectedOrmawaId] = useState(() => {
    return localStorage.getItem('superadmin_ormawa_id') || null
  })
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrmawa, setSelectedOrmawa] = useState(null)

  // Fetch list ormawa saat mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true)
      try {
        const res = await axios.get('/admin/ormawa')
        if (res.data.status === 'success') {
          const orgs = res.data.data || []
          setOrganizations(orgs)
          
          const savedId = localStorage.getItem('superadmin_ormawa_id')
          if (savedId) {
            const matched = orgs.find(o => String(o.ID || o.id) === String(savedId))
            if (matched) {
              setSelectedOrmawaId(matched.ID || matched.id)
              setSelectedOrmawa(matched)
              return
            }
          }

          // Auto-select ormawa pertama jika tidak ada di localStorage atau tidak match
          if (orgs.length > 0) {
            const firstId = orgs[0].ID || orgs[0].id
            setSelectedOrmawaId(firstId)
            setSelectedOrmawa(orgs[0])
            localStorage.setItem('superadmin_ormawa_id', String(firstId))
          }
        }
      } catch (err) {
        console.error('Gagal load ormawa:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrganizations()
  }, [])

  // Sync selectedOrmawa ketika selectedOrmawaId atau organizations berubah
  useEffect(() => {
    if (selectedOrmawaId && organizations.length > 0) {
      const ormawa = organizations.find(o => String(o.ID || o.id) === String(selectedOrmawaId))
      setSelectedOrmawa(ormawa || null)
    }
  }, [selectedOrmawaId, organizations])

  // Listener untuk sinkronisasi antartab/komponen saat storage berubah
  useEffect(() => {
    const handleStorageChange = () => {
      const savedId = localStorage.getItem('superadmin_ormawa_id')
      if (savedId && String(savedId) !== String(selectedOrmawaId)) {
        setSelectedOrmawaId(savedId)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [selectedOrmawaId])

  const handleOrmawaChange = (newOrmawaId) => {
    setSelectedOrmawaId(newOrmawaId)
    if (newOrmawaId) {
      localStorage.setItem('superadmin_ormawa_id', String(newOrmawaId))
    } else {
      localStorage.removeItem('superadmin_ormawa_id')
    }
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <SuperAdminOrmawaContext.Provider
      value={{
        selectedOrmawaId,
        setSelectedOrmawaId: handleOrmawaChange,
        organizations,
        loading,
        selectedOrmawa
      }}
    >
      {children}
    </SuperAdminOrmawaContext.Provider>
  )
}


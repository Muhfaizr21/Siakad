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
  const [selectedOrmawaId, setSelectedOrmawaId] = useState(null)
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
          // Auto-select ormawa pertama
          if (orgs.length > 0) {
            const firstId = orgs[0].ID || orgs[0].id
            setSelectedOrmawaId(firstId)
            setSelectedOrmawa(orgs[0])
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

  // Update selectedOrmawa ketika selectedOrmawaId berubah
  useEffect(() => {
    if (selectedOrmawaId && organizations.length > 0) {
      const ormawa = organizations.find(o => (o.ID || o.id) === selectedOrmawaId)
      setSelectedOrmawa(ormawa || null)
    }
  }, [selectedOrmawaId, organizations])

  const handleOrmawaChange = (newOrmawaId) => {
    setSelectedOrmawaId(newOrmawaId)
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

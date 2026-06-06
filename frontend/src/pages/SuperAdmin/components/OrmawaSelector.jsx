import React from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select"
import { useSuperAdminOrmawa } from '../../../contexts/SuperAdminOrmawaContext'

export function OrmawaSelector({ className = "" }) {
  let selectedOrmawaId, setSelectedOrmawaId, organizations, loading
  
  // Safe context usage
  try {
    const context = useSuperAdminOrmawa()
    selectedOrmawaId = context.selectedOrmawaId
    setSelectedOrmawaId = context.setSelectedOrmawaId
    organizations = context.organizations
    loading = context.loading
  } catch (error) {
    console.error('OrmawaSelector: Context not available', error)
    return null
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
        Pilih Organisasi:
      </span>
      <Select 
        value={selectedOrmawaId?.toString()} 
        onValueChange={(val) => setSelectedOrmawaId && setSelectedOrmawaId(Number(val))}
        disabled={loading}
      >
        <SelectTrigger className="w-72 h-10 bg-white border-slate-200 rounded-xl text-sm font-medium shadow-sm hover:border-primary transition-colors">
          <SelectValue placeholder={loading ? "Memuat..." : "-- Pilih Ormawa --"} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
          {organizations.map((org) => {
            const orgId = org.ID || org.id
            const singkatan = org.Singkatan || org.Kode || ''
            const nama = org.Nama || ''
            
            return (
              <SelectItem 
                key={orgId} 
                value={orgId.toString()}
                className="rounded-lg py-2.5 cursor-pointer hover:bg-primary/5"
              >
                <div className="flex items-center gap-2">
                  {singkatan && (
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase">
                      {singkatan}
                    </span>
                  )}
                  <span className="text-slate-900 font-medium">{nama}</span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}

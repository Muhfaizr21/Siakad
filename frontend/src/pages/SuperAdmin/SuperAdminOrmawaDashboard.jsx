"use client"

import React, { useState, useEffect } from 'react'
import { useSuperAdminOrmawa } from '../../contexts/SuperAdminOrmawaContext'
import useAuthStore from '../../store/useAuthStore'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import { PageContent, PageCard, PageCardHeader } from '@/components/ui/page'
import { DashboardHero, DashboardStatCard, DashboardStatGrid } from '@/components/ui/dashboard'

const API = `${API_BASE_URL}/ormawa`
const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, notation: 'compact' }).format(n || 0)

const STATUS_PROPOSAL = { 
  diajukan: 'bg-info/10 text-info border border-info/20', 
  disetujui_dosen: 'bg-primary/10 text-primary border border-primary/20', 
  disetujui_univ: 'bg-success/10 text-success border border-success/20', 
  revisi: 'bg-warning/10 text-warning border border-warning/20', 
  ditolak: 'bg-error/10 text-error border border-error/20' 
}

export default function SuperAdminOrmawaDashboard() {
  let selectedOrmawaId, selectedOrmawa
  
  // Safe context usage
  try {
    const context = useSuperAdminOrmawa()
    selectedOrmawaId = context.selectedOrmawaId
    selectedOrmawa = context.selectedOrmawa
  } catch (error) {
    console.error('SuperAdminOrmawaDashboard: Context not available')
    // Fallback to auth store
    const user = useAuthStore.getState()?.user
    selectedOrmawaId = user?.ormawa_id || user?.OrmawaID || null
    selectedOrmawa = null
  }
  
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({ totalProposals: 0, totalMembers: 0, totalKas: 0, totalEvents: 0 })
  const [proposals, setProposals] = useState([])
  const [members, setMembers] = useState([])
  const [events, setEvents] = useState([])
  const [identity, setIdentity] = useState({ Nama: 'Portal Ormawa' })
  const [gamifikasi, setGamifikasi] = useState({ poin: 0, peringkat: 0, total_ormawa: 0, riwayat: [] })
  
  const navigate = useNavigate()

  // Load data whenever selectedOrmawaId changes
  useEffect(() => {
    if (!selectedOrmawaId) return

    const load = async () => {
      setIsLoading(true)
      try {
        const [settingsJson, statsJson, proposalJson, memberJson, eventJson, gamJson] = await Promise.all([
          fetchWithAuth(`${API}/settings/${selectedOrmawaId}`),
          fetchWithAuth(`${API}/stats?ormawaId=${selectedOrmawaId}`),
          fetchWithAuth(`${API}/proposals?ormawaId=${selectedOrmawaId}`),
          fetchWithAuth(`${API}/members?ormawaId=${selectedOrmawaId}`),
          fetchWithAuth(`${API}/events?ormawaId=${selectedOrmawaId}`),
          fetchWithAuth(`${API}/gamifikasi?ormawaId=${selectedOrmawaId}`)
        ])
        if (settingsJson.status === 'success') setIdentity(settingsJson.data || { Nama: 'Portal Ormawa' })
        if (statsJson.status === 'success') setStats(statsJson.data || {})
        if (proposalJson.status === 'success') setProposals((proposalJson.data || []).slice(0, 5))
        if (memberJson.status === 'success') setMembers((memberJson.data || []).slice(0, 5))
        if (eventJson.status === 'success') setEvents((eventJson.data || []).slice(0, 4))
        if (gamJson.status === 'success') setGamifikasi(gamJson.data || { poin: 0, peringkat: 0, riwayat: [] })
      } catch {} finally { setIsLoading(false) }
    }
    load()
  }, [selectedOrmawaId])

  const statCards = [
    { label: 'Total Proposal', value: stats.totalProposals || proposals.length, icon: 'description', colorClass: 'text-primary', bgClass: 'bg-primary/10 border-primary/20 border', accentGradient: 'from-primary/10', route: '/admin/ormawa-proposal' },
    { label: 'Total Anggota', value: stats.totalMembers || members.length, icon: 'group', colorClass: 'text-secondary', bgClass: 'bg-secondary/10 border-secondary/20 border', accentGradient: 'from-secondary/10', route: '/admin/ormawa-anggota' },
    { label: 'PAGU', value: formatRp(stats.totalKas), icon: 'attach_money', colorClass: 'text-success', bgClass: 'bg-success/10 border-success/20 border', accentGradient: 'from-success/10', route: '/admin/ormawa-keuangan' },
    { label: 'Kegiatan Aktif', value: stats.totalEvents || events.length, icon: 'calendar_today', colorClass: 'text-warning', bgClass: 'bg-warning/10 border-warning/20 border', accentGradient: 'from-warning/10', route: '/admin/ormawa-jadwal' },
  ]

  return (
    <PageContent>
      {/* Page Header dengan Dropdown */}
      <DashboardHero 
        title="Dashboard Ormawa"
        highlightedTitle="(Super Admin)"
        subtitle="Gunakan filter di bagian atas untuk memilih organisasi dan melihat data"
        icon="admin_panel_settings"
        badges={[
          { label: 'Super Admin Portal', active: false },
          { label: 'Sistem Aktif', active: true }
        ]}
      />

      {/* Content - hanya tampil kalau sudah pilih ormawa */}
      {!selectedOrmawaId ? (
        <div className="text-center py-20 bg-surface border border-border rounded-xl shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '40px' }}>
              groups
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Pilih Organisasi</h3>
          <p className="text-sm text-slate-500">
            Gunakan dropdown di atas untuk memilih organisasi yang ingin dilihat
          </p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <DashboardStatGrid>
            {statCards.map((card, i) => (
              <DashboardStatCard key={i} {...card} loading={isLoading} />
            ))}
          </DashboardStatGrid>

          {/* Info Card - Nama Ormawa */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-border rounded-xl shadow-sm p-6 my-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-2xl">corporate_fare</span>
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider">Organisasi Terpilih</p>
                <h2 className="text-lg font-bold text-on-surface mt-1" style={{ color: 'var(--theme-text)' }}>
                  {selectedOrmawa?.Nama || identity.Nama || 'Memuat...'}
                </h2>
                {selectedOrmawa?.Singkatan && (
                  <p className="text-xs text-muted mt-0.5">
                    {selectedOrmawa.Singkatan} • ID: {selectedOrmawaId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Proposals & Events Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Proposal Terbaru */}
            <PageCard>
              <PageCardHeader 
                title="Proposal Terbaru" 
                description="Status pengajuan proposal" 
                icon="description"
              />
              <div className="divide-y divide-border-muted max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center"><span className="material-symbols-outlined animate-spin">sync</span></div>
                ) : proposals.length === 0 ? (
                  <div className="p-8 text-center"><p className="text-xs text-muted">Belum ada proposal</p></div>
                ) : proposals.map((p) => (
                  <div key={p.id || p.ID} className="p-4 flex items-center gap-4 hover:bg-background transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--theme-text)' }}>{p.Judul}</p>
                      <p className="text-[10px] text-muted mt-0.5">PROP-{p.id || p.ID}</p>
                    </div>
                    <Badge className={cn('text-[9px] px-2.5 py-0.5', STATUS_PROPOSAL[p.Status] || 'bg-background border text-muted')}>
                      {p.Status || 'draft'}
                    </Badge>
                  </div>
                ))}
              </div>
            </PageCard>

            {/* Agenda Kegiatan */}
            <PageCard>
              <PageCardHeader 
                title="Agenda Kegiatan" 
                description="Jadwal acara mendatang" 
                icon="calendar_month"
              />
              <div className="divide-y divide-border-muted max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center"><span className="material-symbols-outlined animate-spin">sync</span></div>
                ) : events.length === 0 ? (
                  <div className="p-8 text-center"><p className="text-xs text-muted">Belum ada kegiatan</p></div>
                ) : events.map((ev) => {
                  const d = ev.TanggalMulai ? new Date(ev.TanggalMulai) : null
                  return (
                    <div key={ev.id || ev.ID} className="p-4 flex items-center gap-4 hover:bg-background transition-colors">
                      {d && (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center border border-primary/20">
                          <span className="text-[11px] font-black text-primary">{d.getDate()}</span>
                          <span className="text-[8px] font-bold text-primary/75">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: 'var(--theme-text)' }}>{ev.Judul}</p>
                        <p className="text-[10px] text-muted truncate">{ev.Lokasi || 'TBA'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </PageCard>
          </div>
        </>
      )}
    </PageContent>
  )
}

"use client"

import React, { useState, useEffect } from 'react'
import { OrmawaSelector } from './components/OrmawaSelector'
import { useSuperAdminOrmawa } from '../../contexts/SuperAdminOrmawaContext'
import useAuthStore from '../../store/useAuthStore'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { fetchWithAuth, API_BASE_URL, ormawaService } from '../../services/api'

// Auto-injected Material Symbol fallbacks
const FileText = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>description</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const DollarSign = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>attach_money</span>;
const Calendar = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;

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
  const [gamifikasiTab, setGamifikasiTab] = useState('history')
  
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
    { label: 'Total Proposal', value: stats.totalProposals || proposals.length, icon: FileText, color: 'text-primary', bg: 'bg-primary/10 border-primary/20 border', accent: 'from-primary/10', route: '/admin/ormawa-proposal' },
    { label: 'Total Anggota', value: stats.totalMembers || members.length, icon: Users, color: 'text-secondary', bg: 'bg-secondary/10 border-secondary/20 border', accent: 'from-secondary/10', route: '/admin/ormawa-anggota' },
    { label: 'PAGU', value: formatRp(stats.totalKas), icon: DollarSign, color: 'text-success', bg: 'bg-success/10 border-success/20 border', accent: 'from-success/10', route: '/admin/ormawa-keuangan' },
    { label: 'Kegiatan Aktif', value: stats.totalEvents || events.length, icon: Calendar, color: 'text-warning', bg: 'bg-warning/10 border-warning/20 border', accent: 'from-warning/10', route: '/admin/ormawa-jadwal' },
  ]

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header dengan Dropdown */}
        <section
          className="rounded-xl p-5 border border-border"
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
                  Dashboard Ormawa <span style={{ color: 'var(--theme-secondary)' }}>(Super Admin)</span>
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Pilih organisasi untuk melihat dashboard dan statistik lengkapnya
                </p>
              </div>
            </div>

            {/* Dropdown Ormawa Selector */}
            <OrmawaSelector />
          </div>
        </section>

        {/* Content - hanya tampil kalau sudah pilih ormawa */}
        {!selectedOrmawaId ? (
          <div className="text-center py-20">
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((s) => (
                <button
                  key={s.label}
                  onClick={() => navigate(s.route)}
                  className="group bg-surface border border-border rounded-xl shadow-sm p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${s.accent} to-transparent rounded-bl-full opacity-40`} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform duration-300`}>
                        <s.icon size={18} />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-medium text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined" style={{ fontSize: '9px' }} >show_chart</span>
                        Live
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1 font-headline">{s.label}</p>
                    <p className="text-xl font-bold text-on-surface leading-none tabular-nums font-headline" style={{ color: 'var(--theme-text)' }}>
                      {isLoading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '20px' }} >sync</span> : s.value}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Info Card - Nama Ormawa */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-border rounded-xl shadow-sm p-6">
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
            </Card>

            {/* Proposals & Events Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Proposal Terbaru */}
              <Card className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-primary font-headline">Proposal Terbaru</h2>
                      <p className="text-[10px] text-muted mt-0.5">Status pengajuan proposal</p>
                    </div>
                  </div>
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
                </CardContent>
              </Card>

              {/* Agenda Kegiatan */}
              <Card className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-primary font-headline">Agenda Kegiatan</h2>
                      <p className="text-[10px] text-muted mt-0.5">Jadwal acara mendatang</p>
                    </div>
                  </div>
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
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

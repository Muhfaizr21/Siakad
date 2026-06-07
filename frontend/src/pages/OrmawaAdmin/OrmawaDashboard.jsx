"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

import { fetchWithAuth, API_BASE_URL, ormawaService } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import { getOrmawaId } from '../../utils/getOrmawaId'
import { PageContent, PageCard, PageCardHeader } from '@/components/ui/page'
import { DashboardHero, DashboardStatCard, DashboardStatGrid } from '@/components/ui/dashboard'

const API = `${API_BASE_URL}/ormawa`
const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, notation: 'compact' }).format(n || 0)

const getProposalStatusStyle = (status) => {
  const s = String(status || 'draft').toLowerCase().trim();
  const styles = {
    diajukan: 'bg-[var(--theme-info)]/10 text-[var(--theme-info)] border border-[var(--theme-info)]/20',
    disetujui_dosen: 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20',
    disetujui_fakultas: 'bg-[var(--theme-secondary)]/10 text-[var(--theme-secondary)] border border-[var(--theme-secondary)]/20',
    disetujui_univ: 'bg-[var(--theme-success)]/10 text-[var(--theme-success)] border border-[var(--theme-success)]/20',
    revisi: 'bg-[var(--theme-warning)]/10 text-[var(--theme-warning)] border border-[var(--theme-warning)]/20',
    ditolak: 'bg-[var(--theme-error)]/10 text-[var(--theme-error)] border border-[var(--theme-error)]/20'
  };
  return styles[s] || 'bg-background border border-[var(--theme-border-muted)] text-muted';
};

const getEventStatusStyle = (status) => {
  const s = String(status || 'terjadwal').toLowerCase().trim();
  const styles = {
    terjadwal: 'bg-[var(--theme-info)]/10 text-[var(--theme-info)] border border-[var(--theme-info)]/20',
    persiapan: 'bg-[var(--theme-warning)]/10 text-[var(--theme-warning)] border border-[var(--theme-warning)]/20',
    berlangsung: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    selesai: 'bg-[var(--theme-success)]/10 text-[var(--theme-success)] border border-[var(--theme-success)]/20',
    dibatalkan: 'bg-[var(--theme-error)]/10 text-[var(--theme-error)] border border-[var(--theme-error)]/20'
  };
  return styles[s] || 'bg-background border border-[var(--theme-border-muted)] text-muted';
};

export default function OrmawaDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ totalProposals: 0, totalMembers: 0, totalKas: 0, totalEvents: 0 })
  const [proposals, setProposals] = useState([])
  const [members, setMembers] = useState([])
  const [events, setEvents] = useState([])
  const [identity, setIdentity] = useState({ Nama: 'Portal Ormawa' })
  const [gamifikasi, setGamifikasi] = useState({ poin: 0, peringkat: 0, total_ormawa: 0, riwayat: [] })
  const [gamifikasiTab, setGamifikasiTab] = useState('history') // 'history' or 'rules'
  
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  const ormawaId = getOrmawaId()

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const [settingsJson, statsJson, proposalJson, memberJson, eventJson, gamJson] = await Promise.all([
          fetchWithAuth(`${API}/settings/${ormawaId}`),
          fetchWithAuth(`${API}/stats?ormawaId=${ormawaId}`),
          fetchWithAuth(`${API}/proposals?ormawaId=${ormawaId}`),
          fetchWithAuth(`${API}/members?ormawaId=${ormawaId}`),
          fetchWithAuth(`${API}/events?ormawaId=${ormawaId}`),
          ormawaService.getGamifikasiSummary()
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
  }, [ormawaId])

  const approvalRate = proposals.length > 0
    ? Math.round((proposals.filter(p => ['disetujui_fakultas', 'disetujui_univ', 'selesai'].includes(p.Status)).length / proposals.length) * 100)
    : 0

  const proposalStatusData = useMemo(() => {
    const counts = {}
    proposals.forEach(p => {
      const s = p.Status || 'diajukan'
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [proposals])

  const roleDistData = useMemo(() => {
    const counts = {}
    members.forEach(m => {
      const r = m.Role || 'Anggota'
      counts[r] = (counts[r] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [members])

  const monthlyActivityData = useMemo(() => {
    const byMonth = {}
    const addToMonth = (arr, key) => {
      arr.forEach(item => {
        const d = item.TanggalMulai || item.TanggalKegiatan || item.created_at || item.CreatedAt
        if (!d) return
        const date = new Date(d)
        if (isNaN(date.getTime())) return
        const k = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`
        if (!byMonth[k]) byMonth[k] = { kegiatan: 0, proposal: 0 }
        byMonth[k][key] = (byMonth[k][key] || 0) + 1
      })
    }
    addToMonth(events, 'kegiatan')
    addToMonth(proposals, 'proposal')
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
    return Object.entries(byMonth).sort(([a],[b]) => a.localeCompare(b)).slice(-6).map(([m, v]) => {
      const [y, mo] = m.split('-')
      return { month: `${months[parseInt(mo)-1]}`, kegiatan: v.kegiatan || 0, proposal: v.proposal || 0 }
    })
  }, [events, proposals])

  const topAnggaranData = useMemo(() => {
    return [...proposals].sort((a, b) => (b.Anggaran || 0) - (a.Anggaran || 0)).slice(0, 5)
      .map(p => ({ name: p.Judul?.substring(0, 15) || 'Proposal', value: p.Anggaran || 0 }))
  }, [proposals])

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  const statCards = [
    { label: 'Total Proposal', value: stats.totalProposals || proposals.length, icon: 'description', colorClass: 'text-primary', bgClass: 'bg-primary/10 border-primary/20 border', accentGradient: 'from-primary/10', route: '/ormawa/proposal', badge: { text: 'Live', icon: 'show_chart' } },
    { label: 'Total Anggota', value: stats.totalMembers || members.length, icon: 'group', colorClass: 'text-secondary', bgClass: 'bg-secondary/10 border-secondary/20 border', accentGradient: 'from-secondary/10', route: '/ormawa/anggota', badge: { text: 'Live', icon: 'show_chart' } },
    { label: 'PAGU', value: formatRp(stats.totalKas), icon: 'attach_money', colorClass: 'text-success', bgClass: 'bg-success/10 border-success/20 border', accentGradient: 'from-success/10', route: '/ormawa/keuangan', badge: { text: 'Live', icon: 'show_chart' } },
    { label: 'Kegiatan Aktif', value: stats.totalEvents || events.length, icon: 'calendar_today', colorClass: 'text-warning', bgClass: 'bg-warning/10 border-warning/20 border', accentGradient: 'from-warning/10', route: '/ormawa/jadwal', badge: { text: 'Live', icon: 'show_chart' } },
    { label: 'Approval Rate', value: `${approvalRate}%`, icon: 'checklist', colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50 border-indigo-200 border', accentGradient: 'from-indigo-500/10', route: '/ormawa/proposal', badge: { text: proposals.length > 0 ? `${proposals.filter(p => ['disetujui_fakultas','disetujui_univ','selesai'].includes(p.Status)).length}/${proposals.length}` : '0/0', icon: 'trending_up' } },
  ]

  const firstName = user?.Email?.split('@')[0] || 'Admin';

  return (
    <PageContent>
      {/* Page Header */}
      <DashboardHero 
        title="Halo,"
        highlightedTitle={`${firstName}!`}
        subtitle="Kelola kegiatan, ajukan proposal, kelola keuangan, dan pantau anggota organisasi dengan mudah dari satu tempat."
        icon="groups"
        badges={[
          { label: 'Portal Ormawa', active: false },
          { label: 'Active Session', active: true }
        ]}
        actions={
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => navigate('/ormawa/proposal')}
              className="flex-1 md:flex-initial px-4 py-2 rounded-lg font-bold text-xs transition-all text-white hover:opacity-90 shadow-sm"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              Ajukan Proposal
            </button>
            <button
              onClick={() => navigate('/ormawa/anggota')}
              className="flex-1 md:flex-initial border px-4 py-2 rounded-lg font-bold text-xs transition-all hover:bg-black/[0.02]"
              style={{
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
                backgroundColor: 'var(--theme-surface)'
              }}
            >
              Data Anggota
            </button>
          </div>
        }
      />

      {/* Stat Cards */}
      <DashboardStatGrid>
        {statCards.map((card, i) => (
          <DashboardStatCard key={i} {...card} loading={isLoading} />
        ))}
      </DashboardStatGrid>

      {/* ── 5W1H Charts ─────────────────────────────────────────────── */}
      {!isLoading && (
        <>
          {/* WHEN → Line: Aktivitas Bulanan (full width) */}
          {monthlyActivityData.length > 0 && (
            <div className="bg-white border border-[var(--theme-border)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span>
                </div>
                <span className="text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest font-headline">Aktivitas Bulanan</span>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyActivityData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="proposal" name="Proposal" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="kegiatan" name="Kegiatan" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* WHAT + WHO: 3 charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* WHAT → Pie: Status Proposal */}
            <div className="bg-white border border-[var(--theme-border)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
                </div>
                <span className="text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest font-headline">Status Proposal</span>
              </div>
              <div className="h-[170px] w-full flex items-center justify-center">
                {proposalStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie data={proposalStatusData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                        {proposalStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <span className="text-xs text-slate-400 italic">Belum ada proposal</span>}
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {proposalStatusData.slice(0, 6).map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 truncate leading-none">{item.name.replace(/_/g, ' ')}</p>
                      <p className="text-xs font-extrabold text-slate-800 leading-none mt-1">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WHAT → Bar: Anggaran per Proposal */}
            <div className="bg-white border border-[var(--theme-border)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
                </div>
                <span className="text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest font-headline">Anggaran per Proposal (Top 5)</span>
              </div>
              <div className="h-[170px] w-full">
                {topAnggaranData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart data={topAnggaranData} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip formatter={(v) => formatRp(v)} />
                      <Bar dataKey="value" name="Anggaran" fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center"><span className="text-xs text-slate-400 italic">Belum ada data</span></div>}
              </div>
            </div>

            {/* WHO → Pie: Sebaran Role Anggota */}
            <div className="bg-white border border-[var(--theme-border)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
                </div>
                <span className="text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest font-headline">Sebaran Role Anggota</span>
              </div>
              <div className="h-[170px] w-full flex items-center justify-center">
                {roleDistData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie data={roleDistData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                        {roleDistData.map((_, i) => <Cell key={i} fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 5]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <span className="text-xs text-slate-400 italic">Belum ada anggota</span>}
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {roleDistData.slice(0, 5).map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 5] }} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 truncate leading-none">{item.name}</p>
                      <p className="text-xs font-extrabold text-slate-800 leading-none mt-1">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proposal Terbaru */}
        <PageCard>
          <PageCardHeader 
            title="Proposal Terbaru" 
            description="Status pengajuan proposal kegiatan" 
            icon="description"
            action={
              <button 
                onClick={() => navigate('/ormawa/proposal')} 
                className="text-xs font-bold hover:underline transition-colors tracking-wider"
                style={{ color: 'var(--theme-primary)' }}
              >
                Lihat Semua
              </button>
            }
          />
          <div className="divide-y divide-[var(--theme-border-muted)]">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 flex items-center gap-4 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-3/4" /><div className="h-4 bg-slate-100 rounded w-16 ml-auto" />
              </div>
            )) : proposals.length === 0 ? (
              <div className="p-8 text-center"><p className="text-xs font-medium text-[var(--theme-text-muted)]">Belum ada proposal</p></div>
            ) : proposals.map((p) => (
              <div key={p.id || p.ID} className="p-4 flex items-center gap-4 hover:bg-[var(--theme-bg)] transition-colors cursor-pointer" onClick={() => navigate('/ormawa/proposal')}>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--theme-text)] text-sm truncate">{p.Judul}</p>
                  <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">PROP-{p.id || p.ID}</p>
                </div>
                <Badge className={cn('font-black text-[9px] px-2.5 py-0.5 border shrink-0 tracking-widest', getProposalStatusStyle(p.Status))}>
                  {(p.Status || 'draft').replace(/_/g, ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </PageCard>

        {/* Agenda Kegiatan */}
        <PageCard>
          <PageCardHeader 
            title="Agenda Kegiatan" 
            description="Jadwal acara dalam waktu dekat" 
            icon="calendar_month"
            action={
              <button 
                onClick={() => navigate('/ormawa/jadwal')} 
                className="text-xs font-bold hover:underline transition-colors tracking-wider"
                style={{ color: 'var(--theme-primary)' }}
              >
                Lihat Semua
              </button>
            }
          />
          <div className="divide-y divide-[var(--theme-border-muted)]">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 animate-pulse flex gap-3">
                <div className="size-10 bg-slate-100 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2"><div className="h-3 bg-slate-100 rounded w-3/4" /><div className="h-2 bg-slate-100 rounded w-1/2" /></div>
              </div>
            )) : events.length === 0 ? (
              <div className="p-8 text-center"><p className="text-xs font-medium text-[var(--theme-text-muted)]">Belum ada kegiatan</p></div>
            ) : events.map((ev) => {
              const d = ev.TanggalMulai ? new Date(ev.TanggalMulai) : null
              return (
                <div key={ev.id || ev.ID} className="p-4 flex items-center gap-4 hover:bg-[var(--theme-bg)] transition-colors cursor-pointer" onClick={() => navigate('/ormawa/jadwal')}>
                  {d ? (
                    <div className="size-10 shrink-0 rounded-lg flex flex-col items-center justify-center border" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--theme-secondary) 20%, transparent)' }}>
                      <span className="text-[11px] font-black text-[var(--theme-secondary)] leading-none">{d.toLocaleDateString('id-ID', { day: '2-digit' })}</span>
                      <span className="text-[8px] font-bold text-[var(--theme-secondary)]/75 mt-0.5">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                    </div>
                  ) : <div className="size-10 shrink-0 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border-muted)]" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--theme-text)] text-sm truncate">{ev.Judul}</p>
                    <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5 truncate">{ev.Lokasi || 'Lokasi belum ditentukan'}</p>
                  </div>
                  <Badge className={cn('font-black text-[9px] px-2.5 py-0.5 border shrink-0 tracking-widest', getEventStatusStyle(ev.Status))}>
                    {ev.Status || 'terjadwal'}
                  </Badge>
                </div>
              )
            })}
          </div>
        </PageCard>

        {/* Gamifikasi Poin & Riwayat */}
        <PageCard>
          <PageCardHeader 
            title="Gamifikasi Ormawa" 
            description="Poin dan peringkat keaktifan unit" 
            icon="emoji_events"
          />
          <div className="flex flex-col h-full">
            {/* Points & Rank display */}
            <div className="p-5 border-b border-[var(--theme-border)] space-y-3 bg-slate-50/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider font-headline">Akumulasi Poin</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-headline leading-none text-warning">{gamifikasi.poin}</span>
                    <span className="text-[10px] font-medium text-[var(--theme-text-muted)]">Pts</span>
                  </div>
                </div>
                <div className="space-y-1 border-l border-[var(--theme-border)] pl-4">
                  <p className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider font-headline">Peringkat</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-headline leading-none text-[var(--theme-primary)]">#{gamifikasi.peringkat}</span>
                    {gamifikasi.total_ormawa > 0 && (
                      <span className="text-[10px] font-medium text-[var(--theme-text-muted)]">dari {gamifikasi.total_ormawa}</span>
                    )}
                  </div>
                </div>
              </div>
              {/* Rank Progress Bar */}
              {gamifikasi.total_ormawa > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Posisi Keaktifan</span>
                    <span className="text-[9px] font-bold" style={{ color: 'var(--theme-primary)' }}>
                      {Math.round(((gamifikasi.total_ormawa - gamifikasi.peringkat + 1) / gamifikasi.total_ormawa) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, ((gamifikasi.total_ormawa - gamifikasi.peringkat + 1) / gamifikasi.total_ormawa) * 100)}%`,
                        backgroundColor: gamifikasi.peringkat === 1 ? '#f59e0b' : 'var(--theme-primary)'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-[var(--theme-border)] bg-slate-50/20 p-1">
              <button
                type="button"
                onClick={() => setGamifikasiTab('history')}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                  gamifikasiTab === 'history' ? "bg-white shadow-sm border border-[var(--theme-border)]" : "text-muted hover:text-on-surface"
                )}
                style={{ color: gamifikasiTab === 'history' ? 'var(--theme-primary)' : 'inherit' }}
              >
                Riwayat
              </button>
              <button
                type="button"
                onClick={() => setGamifikasiTab('rules')}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                  gamifikasiTab === 'rules' ? "bg-white shadow-sm border border-[var(--theme-border)]" : "text-muted hover:text-on-surface"
                )}
                style={{ color: gamifikasiTab === 'rules' ? 'var(--theme-primary)' : 'inherit' }}
              >
                Panduan Poin
              </button>
            </div>

            {/* Tab Content */}
            {gamifikasiTab === 'history' ? (
              <div className="flex-1 divide-y divide-[var(--theme-border)] overflow-y-auto custom-scrollbar max-h-[220px]">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                      <div className="h-3 bg-slate-100 rounded w-10 ml-auto" />
                    </div>
                  ))
                ) : !gamifikasi.riwayat || gamifikasi.riwayat.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--theme-text-muted)] italic">Belum ada riwayat poin.</div>
                ) : (
                  gamifikasi.riwayat.slice(0, 5).map((hist) => (
                    <div key={hist.id || hist.ID} className="p-4 px-5 flex items-center justify-between hover:bg-black/[0.01] transition-colors">
                      <div className="min-w-0 pr-3">
                        <p className="font-bold text-sm leading-tight truncate max-w-[170px]" style={{ color: 'var(--theme-text)' }}>{hist.deskripsi}</p>
                        <p className="text-[9px] text-[var(--theme-text-muted)] mt-1">
                          {hist.created_at ? new Date(hist.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                        </p>
                      </div>
                      <span className={cn(
                        "font-bold text-xs px-2 py-0.5 rounded-lg border shrink-0",
                        hist.tipe === 'tambah' 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      )}>
                        {hist.tipe === 'tambah' ? '+' : '-'}{hist.poin}
                      </span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-4 space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar text-xs">
                <div className="flex items-center justify-between border-b border-[var(--theme-border-muted)] pb-1.5">
                  <span className="font-medium text-neutral-600">🏆 LPJ Disetujui Univ</span>
                  <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px]">+100 Pts</span>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--theme-border-muted)] pb-1.5">
                  <span className="font-medium text-neutral-600">🏅 Prestasi Terverifikasi</span>
                  <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px]">+100 Pts</span>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--theme-border-muted)] pb-1.5">
                  <span className="font-medium text-neutral-600">📅 Kegiatan Selesai</span>
                  <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px]">+50 Pts</span>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--theme-border-muted)] pb-1.5">
                  <span className="font-medium text-neutral-600">📝 Proposal Disetujui</span>
                  <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px]">+20 Pts</span>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--theme-border-muted)] pb-1.5">
                  <span className="font-medium text-neutral-600">💬 Aspirasi Diselesaikan</span>
                  <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px]">+10 Pts</span>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span className="font-medium text-neutral-600">⚠️ Peringatan LPJ Terlambat</span>
                  <span className="font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md text-[10px]">-50 Pts</span>
                </div>
              </div>
            )}
          </div>
        </PageCard>
      </div>

      {/* Anggota Terbaru */}
      <div className="mt-6 mb-8">
        <PageCard>
          <PageCardHeader 
            title="Anggota Organisasi" 
            description="Daftar anggota aktif terbaru" 
            icon="group"
            action={
              <button 
                onClick={() => navigate('/ormawa/anggota')} 
                className="text-xs font-bold hover:underline transition-colors tracking-wider"
                style={{ color: 'var(--theme-secondary)' }}
              >
                Lihat Semua
              </button>
            }
          />
          <div className="p-5 flex flex-wrap gap-4">
            {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 w-12 bg-[var(--theme-bg)] border border-[var(--theme-border-muted)] rounded-lg animate-pulse" />) :
              members.length === 0 ? <p className="text-xs font-medium text-[var(--theme-text-muted)]">Belum ada anggota terdaftar</p> :
              members.map((m) => (
                <div key={m.id || m.ID} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => navigate('/ormawa/anggota')}>
                  <div className="w-12 h-12 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border-muted)] text-[var(--theme-text-muted)] flex items-center justify-center text-xs font-bold group-hover:bg-[var(--theme-primary)] group-hover:text-white group-hover:border-[var(--theme-primary)] transition-all shadow-sm">
                    {m.Mahasiswa?.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                  </div>
                  <span className="text-[9px] font-bold text-[var(--theme-text-muted)] tracking-wider max-w-[64px] truncate text-center group-hover:text-[var(--theme-primary)] transition-colors">{m.Mahasiswa?.Nama?.split(' ')[0]}</span>
                </div>
              ))
            }
          </div>
        </PageCard>
      </div>
    </PageContent>
  )
}

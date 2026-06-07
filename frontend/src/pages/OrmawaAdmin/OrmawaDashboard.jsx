"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

import { fetchWithAuth, API_BASE_URL, ormawaService } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import { getOrmawaId } from '../../utils/getOrmawaId'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const FileText = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>description</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const DollarSign = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>attach_money</span>;
const Calendar = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;

const API = `${API_BASE_URL}/ormawa`
const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, notation: 'compact' }).format(n || 0)

const getProposalStatusStyle = (status) => {
  const s = String(status || 'draft').toLowerCase().trim();
  const styles = {
    diajukan: 'bg-info/10 text-info border border-info/20',
    disetujui_dosen: 'bg-primary/10 text-primary border border-primary/20',
    disetujui_fakultas: 'bg-violet-500/10 text-violet-600 border border-violet-500/20',
    disetujui_univ: 'bg-success/10 text-success border border-success/20',
    revisi: 'bg-warning/10 text-warning border border-warning/20',
    ditolak: 'bg-error/10 text-error border border-error/20'
  };
  return styles[s] || 'bg-background border border-border-muted text-muted';
};

const getEventStatusStyle = (status) => {
  const s = String(status || 'terjadwal').toLowerCase().trim();
  const styles = {
    terjadwal: 'bg-info/10 text-info border border-info/20',
    persiapan: 'bg-warning/10 text-warning border border-warning/20',
    berlangsung: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    selesai: 'bg-success/10 text-success border border-success/20',
    dibatalkan: 'bg-error/10 text-error border border-error/20'
  };
  return styles[s] || 'bg-background border border-border-muted text-muted';
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

  const statCards = [
    { label: 'Total Proposal', value: stats.totalProposals || proposals.length, icon: FileText, color: 'text-primary', bg: 'bg-primary/10 border-primary/20 border', accent: 'from-primary/10', route: '/ormawa/proposal' },
    { label: 'Total Anggota', value: stats.totalMembers || members.length, icon: Users, color: 'text-secondary', bg: 'bg-secondary/10 border-secondary/20 border', accent: 'from-secondary/10', route: '/ormawa/anggota' },
    { label: 'PAGU', value: formatRp(stats.totalKas), icon: DollarSign, color: 'text-success', bg: 'bg-success/10 border-success/20 border', accent: 'from-success/10', route: '/ormawa/keuangan' },
    { label: 'Kegiatan Aktif', value: stats.totalEvents || events.length, icon: Calendar, color: 'text-warning', bg: 'bg-warning/10 border-warning/20 border', accent: 'from-warning/10', route: '/ormawa/jadwal' },
  ]

  const firstName = user?.Email?.split('@')[0] || 'Admin';

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
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
                <span className="material-symbols-outlined text-xl">groups</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                  Halo, <span style={{ color: 'var(--theme-secondary)' }}>{firstName}!</span>
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Kelola kegiatan, ajukan proposal, kelola keuangan, dan pantau anggota organisasi dengan mudah dari satu tempat.
                </p>
              </div>
            </div>

            {/* Right: Action buttons */}
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
          </div>
        </section>

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

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Proposal Terbaru */}
          <Card className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-primary font-headline">Proposal Terbaru</h2>
                  <p className="text-[10px] text-muted mt-0.5">Status pengajuan proposal kegiatan</p>
                </div>
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => navigate('/ormawa/proposal')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >description</span>
                </div>
              </div>
              <div className="divide-y divide-border-muted">
                {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-5 flex items-center gap-4 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-3/4" /><div className="h-4 bg-slate-100 rounded w-16 ml-auto" />
                  </div>
                )) : proposals.length === 0 ? (
                  <div className="p-8 text-center"><p className="text-xs font-medium text-muted">Belum ada proposal</p></div>
                ) : proposals.map((p) => (
                  <div key={p.id || p.ID} className="p-4 flex items-center gap-4 hover:bg-background transition-colors cursor-pointer" onClick={() => navigate('/ormawa/proposal')}>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface text-sm truncate" style={{ color: 'var(--theme-text)' }}>{p.Judul}</p>
                      <p className="text-[10px] text-muted mt-0.5">PROP-{p.id || p.ID}</p>
                    </div>
                    <Badge className={cn('font-black text-[9px] px-2.5 py-0.5 border shrink-0 tracking-widest', getProposalStatusStyle(p.Status))}>
                      {(p.Status || 'draft').replace(/_/g, ' ')}
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
                  <p className="text-[10px] text-muted mt-0.5">Jadwal acara dalam waktu dekat</p>
                </div>
                <div className="w-9 h-9 bg-warning/10 rounded-xl flex items-center justify-center text-warning border border-warning/20 cursor-pointer hover:bg-warning/20 transition-colors" onClick={() => navigate('/ormawa/jadwal')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >calendar_month</span>
                </div>
              </div>
              <div className="divide-y divide-border-muted">
                {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-5 animate-pulse flex gap-3">
                    <div className="size-10 bg-slate-100 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2"><div className="h-3 bg-slate-100 rounded w-3/4" /><div className="h-2 bg-slate-100 rounded w-1/2" /></div>
                  </div>
                )) : events.length === 0 ? (
                  <div className="p-8 text-center"><p className="text-xs font-medium text-muted">Belum ada kegiatan</p></div>
                ) : events.map((ev) => {
                  const d = ev.TanggalMulai ? new Date(ev.TanggalMulai) : null
                  return (
                    <div key={ev.id || ev.ID} className="p-4 flex items-center gap-4 hover:bg-background transition-colors cursor-pointer" onClick={() => navigate('/ormawa/jadwal')}>
                      {d ? (
                        <div className="size-10 shrink-0 rounded-lg bg-warning/10 flex flex-col items-center justify-center border border-warning/20">
                          <span className="text-[11px] font-black text-warning leading-none">{d.toLocaleDateString('id-ID', { day: '2-digit' })}</span>
                          <span className="text-[8px] font-bold text-warning/75 mt-0.5">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                        </div>
                      ) : <div className="size-10 shrink-0 rounded-lg bg-background border border-border-muted" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface text-sm truncate" style={{ color: 'var(--theme-text)' }}>{ev.Judul}</p>
                        <p className="text-[10px] text-muted mt-0.5 truncate">{ev.Lokasi || 'Lokasi belum ditentukan'}</p>
                      </div>
                      <Badge className={cn('font-black text-[9px] px-2.5 py-0.5 border shrink-0 tracking-widest', getEventStatusStyle(ev.Status))}>
                        {ev.Status || 'terjadwal'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Gamifikasi Poin & Riwayat */}
          <Card className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-primary font-headline">Gamifikasi Ormawa</h2>
                  <p className="text-[10px] text-muted mt-0.5 font-medium">Poin dan peringkat keaktifan unit</p>
                </div>
                <div className="w-9 h-9 bg-warning/10 rounded-xl flex items-center justify-center text-warning border border-warning/20">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                </div>
              </div>

              {/* Points & Rank display */}
              <div className="p-5 border-b border-border space-y-3 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider font-headline">Akumulasi Poin</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-headline leading-none text-warning">{gamifikasi.poin}</span>
                      <span className="text-[10px] font-medium text-muted">Pts</span>
                    </div>
                  </div>
                  <div className="space-y-1 border-l border-border pl-4">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider font-headline">Peringkat</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-headline leading-none text-primary">#{gamifikasi.peringkat}</span>
                      {gamifikasi.total_ormawa > 0 && (
                        <span className="text-[10px] font-medium text-muted">dari {gamifikasi.total_ormawa}</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Rank Progress Bar */}
                {gamifikasi.total_ormawa > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Posisi Keaktifan</span>
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
              <div className="flex border-b border-border bg-slate-50/20 p-1">
                <button
                  type="button"
                  onClick={() => setGamifikasiTab('history')}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                    gamifikasiTab === 'history' ? "bg-white text-primary shadow-sm border border-border" : "text-muted hover:text-on-surface"
                  )}
                >
                  Riwayat
                </button>
                <button
                  type="button"
                  onClick={() => setGamifikasiTab('rules')}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                    gamifikasiTab === 'rules' ? "bg-white text-primary shadow-sm border border-border" : "text-muted hover:text-on-surface"
                  )}
                >
                  Panduan Poin
                </button>
              </div>

              {/* Tab Content */}
              {gamifikasiTab === 'history' ? (
                <div className="flex-1 divide-y divide-border overflow-y-auto custom-scrollbar max-h-[220px]">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                        <div className="h-3 bg-slate-100 rounded w-2/3" />
                        <div className="h-3 bg-slate-100 rounded w-10 ml-auto" />
                      </div>
                    ))
                  ) : !gamifikasi.riwayat || gamifikasi.riwayat.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted italic">Belum ada riwayat poin.</div>
                  ) : (
                    gamifikasi.riwayat.slice(0, 5).map((hist) => (
                      <div key={hist.id || hist.ID} className="p-4 px-5 flex items-center justify-between hover:bg-black/[0.01] transition-colors">
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-sm leading-tight truncate max-w-[170px]" style={{ color: 'var(--theme-text)' }}>{hist.deskripsi}</p>
                          <p className="text-[9px] text-muted mt-1">
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
                  <div className="flex items-center justify-between border-b border-border-muted pb-1.5">
                    <span className="font-medium text-neutral-600">🏆 LPJ Disetujui Univ</span>
                    <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px]">+100 Pts</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border-muted pb-1.5">
                    <span className="font-medium text-neutral-600">🏅 Prestasi Terverifikasi</span>
                    <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px]">+100 Pts</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border-muted pb-1.5">
                    <span className="font-medium text-neutral-600">📅 Kegiatan Selesai</span>
                    <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px]">+50 Pts</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border-muted pb-1.5">
                    <span className="font-medium text-neutral-600">📝 Proposal Disetujui</span>
                    <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px]">+20 Pts</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border-muted pb-1.5">
                    <span className="font-medium text-neutral-600">💬 Aspirasi Diselesaikan</span>
                    <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px]">+10 Pts</span>
                  </div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="font-medium text-neutral-600">⚠️ Peringatan LPJ Terlambat</span>
                    <span className="font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md text-[10px]">-50 Pts</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Anggota Terbaru */}
        <Card className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden mb-8">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary font-headline">Anggota Organisasi</h2>
                <p className="text-[10px] text-muted mt-0.5">Daftar anggota aktif terbaru</p>
              </div>
              <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary border border-secondary/20 cursor-pointer hover:bg-secondary/20 transition-colors" onClick={() => navigate('/ormawa/anggota')}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >group</span>
              </div>
            </div>
            <div className="p-5 flex flex-wrap gap-4">
              {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 w-12 bg-background border border-border-muted rounded-lg animate-pulse" />) :
                members.length === 0 ? <p className="text-xs font-medium text-muted">Belum ada anggota terdaftar</p> :
                members.map((m) => (
                  <div key={m.id || m.ID} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => navigate('/ormawa/anggota')}>
                    <div className="w-12 h-12 rounded-lg bg-background border border-border-muted text-muted flex items-center justify-center text-xs font-bold group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
                      {m.Mahasiswa?.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                    </div>
                    <span className="text-[9px] font-bold text-muted tracking-wider max-w-[64px] truncate text-center group-hover:text-primary transition-colors">{m.Mahasiswa?.Nama?.split(' ')[0]}</span>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

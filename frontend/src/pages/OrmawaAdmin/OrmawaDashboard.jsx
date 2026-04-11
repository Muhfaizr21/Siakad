"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Bell, FileText, DollarSign, Users, Calendar, CheckCircle2, FileCheck, LayoutDashboard, TrendingUp, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'
import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`
const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, notation: 'compact' }).format(n || 0)

const STATUS_PROPOSAL = { diajukan: 'bg-blue-100 text-blue-700', disetujui_dosen: 'bg-indigo-100 text-indigo-700', disetujui_univ: 'bg-emerald-100 text-emerald-700', revisi: 'bg-amber-100 text-amber-700', ditolak: 'bg-rose-100 text-rose-700' }

export default function OrmawaDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ totalProposals: 0, totalMembers: 0, totalKas: 0, totalEvents: 0 })
  const [proposals, setProposals] = useState([])
  const [members, setMembers] = useState([])
  const [events, setEvents] = useState([])
  const [identity, setIdentity] = useState({ Nama: 'Portal Ormawa' })
  const navigate = useNavigate()
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.ID || 1;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const [settingsJson, statsJson, proposalJson, memberJson, eventJson] = await Promise.all([
          fetchWithAuth(`${API}/settings/${ormawaId}`),
          fetchWithAuth(`${API}/stats?ormawaId=${ormawaId}`),
          fetchWithAuth(`${API}/proposals?ormawaId=${ormawaId}`),
          fetchWithAuth(`${API}/members?ormawaId=${ormawaId}`),
          fetchWithAuth(`${API}/events?ormawaId=${ormawaId}`),
        ])
        if (settingsJson.status === 'success') setIdentity(settingsJson.data || { Nama: 'Portal Ormawa' })
        if (statsJson.status === 'success') setStats(statsJson.data || {})
        if (proposalJson.status === 'success') setProposals((proposalJson.data || []).slice(0, 5))
        if (memberJson.status === 'success') setMembers((memberJson.data || []).slice(0, 5))
        if (eventJson.status === 'success') setEvents((eventJson.data || []).slice(0, 4))
      } catch {} finally { setIsLoading(false) }
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Proposal', value: stats.totalProposals || proposals.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', route: '/ormawa/proposal' },
    { label: 'Total Anggota', value: stats.totalMembers || members.length, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', route: '/ormawa/anggota' },
    { label: 'Saldo Kas', value: formatRp(stats.totalKas), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', route: '/ormawa/keuangan' },
    { label: 'Kegiatan Aktif', value: stats.totalEvents || events.length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', route: '/ormawa/jadwal' },
  ]

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="pt-20 px-4 lg:px-8 pb-12 space-y-6">

          {/* Page Header */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><LayoutDashboard className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">{identity.Nama || 'Portal Ormawa'}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ringkasan Aktivitas & Statistik Organisasi</p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color, bg, route }) => (
              <Card key={label} onClick={() => navigate(route)} className="border-none shadow-sm bg-white/50 backdrop-blur-md cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn('p-3 rounded-2xl', bg)}>
                      <Icon className={cn('size-5', color)} />
                    </div>
                    <ArrowRight className="size-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-headline">{label}</p>
                  <p className={cn('text-2xl font-black font-headline tracking-tighter', color)}>{isLoading ? '...' : value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Proposal Terbaru */}
            <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
              <CardContent className="p-0">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest font-headline">Proposal Terbaru</h2>
                  </div>
                  <Button onClick={() => navigate('/ormawa/proposal')} variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 h-8 px-3 rounded-xl">Lihat Semua</Button>
                </div>
                <div className="divide-y divide-slate-50">
                  {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-5 flex items-center gap-4 animate-pulse">
                      <div className="h-4 bg-slate-100 rounded w-3/4" /><div className="h-4 bg-slate-100 rounded w-16 ml-auto" />
                    </div>
                  )) : proposals.length === 0 ? (
                    <div className="p-8 text-center"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum ada proposal</p></div>
                  ) : proposals.map((p) => (
                    <div key={p.ID} className="p-5 flex items-center gap-4 hover:bg-slate-50/80 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-[12px] font-headline truncate">{p.Judul}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">PROP-{p.ID}</p>
                      </div>
                      <Badge className={cn('font-black text-[8px] px-2 py-0.5 border-none shrink-0', STATUS_PROPOSAL[p.Status] || 'bg-slate-100 text-slate-600')}>
                        {p.Status || 'draft'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Kegiatan Mendatang */}
            <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
              <CardContent className="p-0">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-primary" />
                    <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest font-headline">Agenda Kegiatan</h2>
                  </div>
                  <Button onClick={() => navigate('/ormawa/jadwal')} variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 h-8 px-3 rounded-xl">Lihat Semua</Button>
                </div>
                <div className="divide-y divide-slate-50">
                  {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-5 animate-pulse flex gap-3">
                      <div className="size-10 bg-slate-100 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-2"><div className="h-3 bg-slate-100 rounded w-3/4" /><div className="h-2 bg-slate-100 rounded w-1/2" /></div>
                    </div>
                  )) : events.length === 0 ? (
                    <div className="p-8 text-center"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum ada kegiatan</p></div>
                  ) : events.map((ev) => {
                    const d = ev.TanggalMulai ? new Date(ev.TanggalMulai) : null
                    return (
                      <div key={ev.ID} className="p-5 flex items-center gap-4 hover:bg-slate-50/80 transition-colors">
                        {d ? (
                          <div className="size-10 shrink-0 rounded-2xl bg-primary/10 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-primary leading-none">{d.toLocaleDateString('id-ID', { day: '2-digit' })}</span>
                            <span className="text-[8px] font-bold text-primary/60 uppercase">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                          </div>
                        ) : <div className="size-10 shrink-0 rounded-2xl bg-slate-100" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-[12px] font-headline truncate">{ev.Judul}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{ev.Lokasi || 'Lokasi belum ditentukan'}</p>
                        </div>
                        <Badge className={cn('font-black text-[8px] px-2 py-0.5 border-none shrink-0',
                          ev.Status === 'berlangsung' ? 'bg-emerald-100 text-emerald-700' :
                          ev.Status === 'terjadwal' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600')}>
                          {ev.Status || 'terjadwal'}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Anggota Terbaru */}
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest font-headline">Anggota Aktif</h2>
                </div>
                <Button onClick={() => navigate('/ormawa/anggota')} variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 h-8 px-3 rounded-xl">Kelola Anggota</Button>
              </div>
              <div className="p-6 flex flex-wrap gap-3">
                {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 w-10 bg-slate-100 rounded-2xl animate-pulse" />) :
                  members.length === 0 ? <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum ada anggota terdaftar</p> :
                  members.map((m) => (
                    <div key={m.ID} className="flex flex-col items-center gap-1.5 group cursor-default">
                      <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black uppercase font-headline group-hover:bg-primary group-hover:text-white transition-all">
                        {m.Mahasiswa?.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest max-w-[60px] truncate text-center">{m.Mahasiswa?.Nama?.split(' ')[0]}</span>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

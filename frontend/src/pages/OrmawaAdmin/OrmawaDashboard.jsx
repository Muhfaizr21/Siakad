"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Card, CardContent } from '../FacultyAdmin/components/card'

import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const FileText = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>description</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const DollarSign = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>attach_money</span>;
const Calendar = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;



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
 const user = useAuthStore(state => state.user)
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
 { label: 'Total Proposal', value: stats.totalProposals || proposals.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', accent: 'from-blue-500/10', route: '/ormawa/proposal' },
 { label: 'Total Anggota', value: stats.totalMembers || members.length, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', accent: 'from-violet-500/10', route: '/ormawa/anggota' },
 { label: 'Saldo Kas', value: formatRp(stats.totalKas), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'from-emerald-500/10', route: '/ormawa/keuangan' },
 { label: 'Kegiatan Aktif', value: stats.totalEvents || events.length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', accent: 'from-amber-500/10', route: '/ormawa/jadwal' },
 ]

 const firstName = user?.Email?.split('@')[0] || 'Admin';

 return (
 <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">

 {/* ── Welcome Banner ─────────────────────────────────────────── */}
 <section className="relative overflow-hidden rounded-3xl h-52 flex items-center group shadow-sm">
 {/* Background */}
 <div className="absolute inset-0 bg-primary-container" />
 {/* Pattern overlay */}
 <div className="absolute inset-0 opacity-10"
 style={{
 backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
 backgroundSize: '60px 60px'
 }}
 />
 {/* Glowing orbs */}
 <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
 <div className="absolute -bottom-10 right-40 w-48 h-48 bg-indigo-300/20 rounded-full blur-2xl" />

 {/* Content */}
 <div className="relative z-10 px-10 flex-1">
 <div className="flex items-center gap-2 mb-3">
 <span className="h-1.5 w-6 bg-white/40 rounded-full" />
 <span className="text-[10px] font-bold text-white/60 tracking-[0.25em]">
 {identity.Nama || 'Portal Ormawa'}
 </span>
 </div>
 <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2 font-headline">
 Halo, <span className="text-blue-200">{firstName}!</span>
 </h1>
 <p className="text-blue-100/80 font-medium text-sm max-w-md leading-relaxed">
 Kelola kegiatan, ajukan proposal, kelola keuangan, dan pantau anggota organisasi dengan mudah dari satu tempat.
 </p>
 <div className="mt-5 flex gap-3">
 <button
 onClick={() => navigate('/ormawa/proposal')}
 className="bg-white text-[#00236F] px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95"
 >
 Ajukan Proposal
 </button>
 <button
 onClick={() => navigate('/ormawa/anggota')}
 className="bg-white/15 backdrop-blur-md text-white border border-white/20 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-white/25 transition-all active:scale-95"
 >
 Data Anggota
 </button>
 </div>
 </div>

 {/* Right decoration */}
 <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 gap-4">
 {[
 { label: 'Anggota', value: isLoading ? '—' : (stats.totalMembers || members.length) },
 { label: 'Proposal', value: isLoading ? '—' : (stats.totalProposals || proposals.length) },
 { label: 'Kegiatan', value: isLoading ? '—' : (stats.totalEvents || events.length) },
 ].map(item => (
 <div key={item.label} className="text-center bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10">
 <p className="text-2xl font-black text-white leading-none font-headline">{item.value}</p>
 <p className="text-[10px] text-white/60 font-bold tracking-widest mt-1">{item.label}</p>
 </div>
 ))}
 </div>
 </section>

 {/* ── Stat Cards ─────────────────────────────────────────────── */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {statCards.map((s) => (
 <button
 key={s.label}
 onClick={() => navigate(s.route)}
 className="group bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
 >
 <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${s.accent} to-transparent rounded-bl-full opacity-40`} />
 <div className="relative">
 <div className="flex items-center justify-between mb-4">
 <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform duration-300`}>
 <s.icon size={18} />
 </div>
 <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full tracking-widest">
 <span className="material-symbols-outlined" style={{ fontSize: '9px' }} >show_chart</span>
 Live
 </div>
 </div>
 <p className="text-[10px] font-black text-[#a3a3a3] tracking-[0.15em] mb-1 font-headline">{s.label}</p>
 <p className="text-3xl font-black text-[#171717] leading-none tabular-nums font-headline">
 {isLoading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '20px' }} >sync</span> : s.value}
 </p>
 </div>
 </button>
 ))}
 </div>

 {/* ── Main Bento Grid ─────────────────────────────────────────── */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Proposal Terbaru */}
 <Card className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
 <CardContent className="p-0">
 <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center justify-between">
 <div>
 <h2 className="font-black text-[#171717] text-base tracking-tight font-headline">Proposal Terbaru</h2>
 <p className="text-[11px] text-[#a3a3a3] font-medium mt-0.5">Status pengajuan proposal kegiatan</p>
 </div>
 <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => navigate('/ormawa/proposal')}>
 <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >description</span>
 </div>
 </div>
 <div className="divide-y divide-[#f0f0f0]">
 {isLoading ? Array.from({ length: 4 }).map((_, i) => (
 <div key={i} className="p-5 flex items-center gap-4 animate-pulse">
 <div className="h-4 bg-slate-100 rounded w-3/4" /><div className="h-4 bg-slate-100 rounded w-16 ml-auto" />
 </div>
 )) : proposals.length === 0 ? (
 <div className="p-8 text-center"><p className="text-[10px] font-black text-[#a3a3a3] tracking-widest">Belum ada proposal</p></div>
 ) : proposals.map((p) => (
 <div key={p.id || p.ID} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate('/ormawa/proposal')}>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-[#171717] text-[13px] font-headline truncate">{p.Judul}</p>
 <p className="text-[10px] text-[#a3a3a3] font-bold mt-0.5">PROP-{p.id || p.ID}</p>
 </div>
 <Badge className={cn('font-black text-[9px] px-2.5 py-0.5 border-none shrink-0 tracking-widest', STATUS_PROPOSAL[p.Status] || 'bg-slate-100 text-slate-600')}>
 {p.Status || 'draft'}
 </Badge>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Kegiatan Mendatang */}
 <Card className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
 <CardContent className="p-0">
 <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center justify-between">
 <div>
 <h2 className="font-black text-[#171717] text-base tracking-tight font-headline">Agenda Kegiatan</h2>
 <p className="text-[11px] text-[#a3a3a3] font-medium mt-0.5">Jadwal acara dalam waktu dekat</p>
 </div>
 <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => navigate('/ormawa/jadwal')}>
 <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >calendar_month</span>
 </div>
 </div>
 <div className="divide-y divide-[#f0f0f0]">
 {isLoading ? Array.from({ length: 4 }).map((_, i) => (
 <div key={i} className="p-5 animate-pulse flex gap-3">
 <div className="size-10 bg-slate-100 rounded-2xl shrink-0" />
 <div className="flex-1 space-y-2"><div className="h-3 bg-slate-100 rounded w-3/4" /><div className="h-2 bg-slate-100 rounded w-1/2" /></div>
 </div>
 )) : events.length === 0 ? (
 <div className="p-8 text-center"><p className="text-[10px] font-black text-[#a3a3a3] tracking-widest">Belum ada kegiatan</p></div>
 ) : events.map((ev) => {
 const d = ev.TanggalMulai ? new Date(ev.TanggalMulai) : null
 return (
 <div key={ev.id || ev.ID} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate('/ormawa/jadwal')}>
 {d ? (
 <div className="size-10 shrink-0 rounded-2xl bg-indigo-50 flex flex-col items-center justify-center border border-indigo-100/50">
 <span className="text-[11px] font-black text-indigo-600 leading-none">{d.toLocaleDateString('id-ID', { day: '2-digit' })}</span>
 <span className="text-[8px] font-bold text-indigo-500 ">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
 </div>
 ) : <div className="size-10 shrink-0 rounded-2xl bg-slate-100" />}
 <div className="flex-1 min-w-0">
 <p className="font-bold text-[#171717] text-[13px] font-headline truncate">{ev.Judul}</p>
 <p className="text-[10px] text-[#a3a3a3] font-medium mt-0.5 truncate">{ev.Lokasi || 'Lokasi belum ditentukan'}</p>
 </div>
 <Badge className={cn('font-black text-[9px] px-2.5 py-0.5 border-none shrink-0 tracking-widest',
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
 <Card className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden mb-8">
 <CardContent className="p-0">
 <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center justify-between">
 <div>
 <h2 className="font-black text-[#171717] text-base tracking-tight font-headline">Anggota Organisasi</h2>
 <p className="text-[11px] text-[#a3a3a3] font-medium mt-0.5">Daftar anggota aktif terbaru</p>
 </div>
 <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center text-violet-500 cursor-pointer hover:bg-violet-100 transition-colors" onClick={() => navigate('/ormawa/anggota')}>
 <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >group</span>
 </div>
 </div>
 <div className="p-6 flex flex-wrap gap-4">
 {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 w-12 bg-slate-100 rounded-2xl animate-pulse" />) :
 members.length === 0 ? <p className="text-[10px] font-black text-[#a3a3a3] tracking-widest">Belum ada anggota terdaftar</p> :
 members.map((m) => (
 <div key={m.id || m.ID} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => navigate('/ormawa/anggota')}>
 <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#525252] flex items-center justify-center text-[13px] font-black font-headline group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
 {m.Mahasiswa?.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
 </div>
 <span className="text-[9px] font-bold text-[#737373] tracking-widest max-w-[64px] truncate text-center group-hover:text-primary transition-colors">{m.Mahasiswa?.Nama?.split(' ')[0]}</span>
 </div>
 ))
 }
 </div>
 </CardContent>
 </Card>
 </div>
 )
}

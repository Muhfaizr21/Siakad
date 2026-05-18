"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Card, CardContent } from '../FacultyAdmin/components/card'

import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const FileText = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>description</span>;
const Calendar = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const DollarSign = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>attach_money</span>;
const Megaphone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>campaign</span>;
const Bell = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>notifications</span>;



const API = `${API_BASE_URL}/ormawa`

const ICON_MAP = { proposal: FileText, kegiatan: Calendar, anggota: Users, keuangan: DollarSign, pengumuman: Megaphone }

export default function Notifikasi() {
 const [sidebarOpen, setSidebarOpen] = useState(false)
 const [notifications, setNotifications] = useState([])
 const [loading, setLoading] = useState(true)
 const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.ID || 1

 const fetchData = async () => {
 setLoading(true)
 try {
 const json = await fetchWithAuth(`${API}/notifications?ormawaId=${ormawaId}`)
 if (json.status === 'success') setNotifications(json.data || [])
 else {
 // Fallback demo notifications
 setNotifications([
 { ID: 1, Judul: 'Proposal diajukan', Pesan: 'Proposal"Webinar Nasional" telah diajukan ke dosen pembina.', Tipe: 'proposal', IsRead: false, CreatedAt: new Date().toISOString() },
 { ID: 2, Judul: 'Kegiatan baru dijadwalkan', Pesan: 'Latihan rutin telah ditambahkan ke jadwal minggu ini.', Tipe: 'kegiatan', IsRead: true, CreatedAt: new Date(Date.now() - 86400000).toISOString() },
 { ID: 3, Judul: 'Anggota baru bergabung', Pesan: '3 mahasiswa baru telah bergabung sebagai anggota aktif.', Tipe: 'anggota', IsRead: false, CreatedAt: new Date(Date.now() - 172800000).toISOString() },
 ])
 }
 } catch { setNotifications([]) } finally { setLoading(false) }
 }

 const handleMarkAllRead = async () => {
 try {
 await fetchWithAuth(`${API}/notifications/read-all`, { method: 'PUT', body: JSON.stringify({ OrmawaID: ormawaId }) })
 setNotifications(n => n.map(item => ({ ...item, IsRead: true })))
 } catch {}
 }

 const handleMarkRead = async (id) => {
 try {
 await fetchWithAuth(`${API}/notifications/${id}/read`, { method: 'PUT' })
 setNotifications(n => n.map(item => item.ID === id ? { ...item, IsRead: true } : item))
 } catch {}
 }

 useEffect(() => { fetchData() }, [])

 const unreadCount = notifications.filter(n => !n.IsRead).length

 return (
 <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
 
 {/* ── Welcome Banner ─────────────────────────────────────────── */}
 <section className="relative overflow-hidden rounded-3xl h-auto md:h-48 flex flex-col md:flex-row items-center group shadow-sm p-8 md:p-0 border border-slate-200/80">
 <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50" />
 <div className="absolute inset-0 opacity-[0.03]"
 style={{
 backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
 backgroundSize: '60px 60px'
 }}
 />
 <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
 <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

 <div className="relative z-10 md:px-10 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-6">
 <div>
 <div className="flex items-center gap-2 mb-3">
 <span className="h-1.5 w-6 bg-primary/40 rounded-full" />
 <span className="text-[10px] font-bold text-slate-400 tracking-[0.25em]">
 Ormawa Admin
 </span>
 </div>
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-inner relative">
 <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >notifications</span>
 {unreadCount > 0 && <span className="absolute -top-1 -right-1 size-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{unreadCount}</span>}
 </div>
 <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">
 Pusat Notifikasi
 </h1>
 </div>
 <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">
 Manajemen notifikasi dan peringatan sistem bagi anggota Ormawa.
 </p>
 </div>
 
 {unreadCount > 0 && (
 <Button onClick={handleMarkAllRead} className="h-12 px-6 rounded-2xl bg-[#00236F] text-white hover:bg-[#003399] font-black text-[10px] tracking-widest shadow-xl shadow-blue-900/20 gap-2 w-full md:w-auto shrink-0">
 <span className="material-symbols-outlined size-4 stroke-[3px]" >done_all</span> Tandai Semua Dibaca
 </Button>
 )}
 </div>
 </section>

 {/* ── Content Area ───────────────────────────────────────────── */}
 <Card className="border border-[#e5e5e5] shadow-sm overflow-hidden bg-white rounded-3xl">
 <CardContent className="p-0">
 {loading ? (
 <div className="divide-y divide-slate-50">
 {Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="p-6 flex items-start gap-4 animate-pulse">
 <div className="size-12 bg-slate-100 rounded-2xl shrink-0" />
 <div className="flex-1 space-y-2"><div className="h-3 bg-slate-100 rounded w-1/3" /><div className="h-2 bg-slate-100 rounded w-2/3" /></div>
 </div>
 ))}
 </div>
 ) : notifications.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-20 gap-4">
 <div className="size-16 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
 <span className="material-symbols-outlined size-8 stroke-[1.5px]" >notifications</span>
 </div>
 <div className="text-center">
 <p className="font-black text-[11px] tracking-widest text-slate-900 font-headline">Semua Sudah Dibaca</p>
 <p className="text-[10px] font-black text-slate-400 tracking-widest mt-1">Tidak ada notifikasi baru saat ini</p>
 </div>
 </div>
 ) : (
 <div className="divide-y divide-slate-50">
 {notifications.map((notif) => {
 const Icon = ICON_MAP[notif.Tipe] || Bell
 const colors = { proposal: 'bg-blue-50 text-blue-600', kegiatan: 'bg-amber-50 text-amber-600', anggota: 'bg-violet-50 text-violet-600', keuangan: 'bg-emerald-50 text-emerald-600', pengumuman: 'bg-rose-50 text-rose-600' }
 const iconColor = colors[notif.Tipe] || 'bg-slate-50 text-slate-500'
 return (
 <div key={notif.ID} onClick={() => handleMarkRead(notif.ID)}
 className={cn('p-6 flex items-start gap-4 transition-colors cursor-pointer', notif.IsRead ? 'bg-white/0 hover:bg-slate-50/80' : 'bg-primary/[0.02] hover:bg-primary/[0.04]')}>
 <div className={cn('size-12 rounded-2xl flex items-center justify-center shrink-0 border border-white shadow-sm', iconColor)}>
 <Icon className="size-5" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className={cn('font-black text-[12px] font-headline', notif.IsRead ? 'text-slate-600' : 'text-slate-900')}>{notif.Judul}</p>
 <p className="text-[11px] font-medium text-slate-400 mt-0.5 leading-relaxed">{notif.Pesan}</p>
 </div>
 <div className="flex flex-col items-end gap-1.5 shrink-0">
 {!notif.IsRead && <div className="size-2.5 rounded-full bg-primary shadow-lg shadow-primary/30" />}
 <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
 {notif.CreatedAt ? new Date(notif.CreatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '—'}
 </span>
 </div>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 )
}

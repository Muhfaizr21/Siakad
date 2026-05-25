"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Card, CardContent } from '../FacultyAdmin/components/card'

import { cn } from '@/lib/utils'
import { toast, Toaster } from 'react-hot-toast'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

// Auto-injected Material Symbol fallbacks for Lucide icons
const FileText = ({ size, className, style, ...props }) => (
  <span className={cn('material-symbols-outlined', className)} style={{ fontSize: size || 24, ...style }} {...props}>
    description
  </span>
)
const Calendar = ({ size, className, style, ...props }) => (
  <span className={cn('material-symbols-outlined', className)} style={{ fontSize: size || 24, ...style }} {...props}>
    calendar_today
  </span>
)
const Users = ({ size, className, style, ...props }) => (
  <span className={cn('material-symbols-outlined', className)} style={{ fontSize: size || 24, ...style }} {...props}>
    group
  </span>
)
const DollarSign = ({ size, className, style, ...props }) => (
  <span className={cn('material-symbols-outlined', className)} style={{ fontSize: size || 24, ...style }} {...props}>
    attach_money
  </span>
)
const Megaphone = ({ size, className, style, ...props }) => (
  <span className={cn('material-symbols-outlined', className)} style={{ fontSize: size || 24, ...style }} {...props}>
    campaign
  </span>
)
const Bell = ({ size, className, style, ...props }) => (
  <span className={cn('material-symbols-outlined', className)} style={{ fontSize: size || 24, ...style }} {...props}>
    notifications
  </span>
)

const API = `${API_BASE_URL}/ormawa`
const ICON_MAP = { 
  proposal: FileText, 
  kegiatan: Calendar, 
  anggota: Users, 
  keuangan: DollarSign, 
  pengumuman: Megaphone 
}

const TIPE_COLORS = {
  proposal: 'bg-blue-50 text-blue-600 border-blue-100',
  kegiatan: 'bg-amber-50 text-amber-600 border-amber-100',
  anggota: 'bg-violet-50 text-violet-600 border-violet-100',
  keuangan: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  pengumuman: 'bg-rose-50 text-rose-600 border-rose-100',
}

export default function Notifikasi() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  
  const authState = useAuthStore((s) => s)
  const ormawaId = authState?.mahasiswa?.ormawaId || authState?.mahasiswa?.OrmawaID || authState?.user?.ormawaId || 1

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetchWithAuth(`${API}/notifications?ormawaId=${ormawaId}`)
      if (res.status === 'success') {
        setNotifications(res.data || [])
      } else {
        // Fallback demo notifications for design preview
        setNotifications([
          { ID: 1, Judul: 'Proposal diajukan', Pesan: 'Proposal "Webinar Nasional" telah diajukan ke dosen pembina.', Tipe: 'proposal', IsRead: false, CreatedAt: new Date().toISOString() },
          { ID: 2, Judul: 'Kegiatan baru dijadwalkan', Pesan: 'Latihan rutin telah ditambahkan ke jadwal minggu ini.', Tipe: 'kegiatan', IsRead: true, CreatedAt: new Date(Date.now() - 86400000).toISOString() },
          { ID: 3, Judul: 'Anggota baru bergabung', Pesan: '3 mahasiswa baru telah bergabung sebagai anggota aktif.', Tipe: 'anggota', IsRead: false, CreatedAt: new Date(Date.now() - 172800000).toISOString() },
        ])
      }
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const res = await fetchWithAuth(`${API}/notifications/read-all`, { 
        method: 'PUT', 
        body: JSON.stringify({ OrmawaID: ormawaId }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.status === 'success') {
        setNotifications(n => n.map(item => ({ ...item, IsRead: true })))
        toast.success('Semua notifikasi ditandai telah dibaca')
      }
    } catch (err) {
      toast.error('Gagal memperbarui status notifikasi')
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await fetchWithAuth(`${API}/notifications/${id}/read`, { method: 'PUT' })
      setNotifications(n => n.map(item => item.ID === id ? { ...item, IsRead: true } : item))
    } catch {}
  }

  useEffect(() => {
    fetchData()
  }, [ormawaId])

  const unreadCount = notifications.filter(n => !n.IsRead).length
  const totalCount = notifications.length
  const proposalCount = notifications.filter(n => n.Tipe === 'proposal').length
  const infoCount = notifications.filter(n => n.Tipe !== 'proposal').length

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
      <Toaster position="top-right" />
      
      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#00236F] to-[#1e3a8a] text-white p-8 md:p-10 shadow-xl shadow-blue-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-40 w-60 h-60 bg-blue-300/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <span className="h-1.5 w-1.5 bg-[#4338ca] bg-indigo-400 rounded-full animate-ping" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase">Kotak Masuk Notifikasi</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner relative">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '32px' }}>notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 size-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce border-2 border-[#00236F]">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight font-headline">Pusat Notifikasi</h1>
                <p className="text-blue-100/80 text-sm font-medium mt-1">Pantau perkembangan proposal, perubahan jadwal, dan pembukuan keuangan ormawa.</p>
              </div>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              onClick={handleMarkAllRead} 
              className="h-12 px-6 rounded-2xl bg-white hover:bg-white/95 text-[#00236F] hover:text-[#00236F] border-none font-bold text-xs tracking-wider shadow-lg shadow-blue-900/10 transition-all active:scale-95 shrink-0 w-full md:w-auto flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>done_all</span>
              <span>TANDAI SEMUA DIBACA</span>
            </Button>
          )}
        </div>
      </section>

      {/* ── Content Area ───────────────────────────────────────────── */}
      <Card className="border border-slate-200/50 shadow-sm rounded-[2rem] overflow-hidden bg-white/70 backdrop-blur-md">
        <CardContent className="p-6">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-5 first:pt-0 last:pb-0 flex items-start gap-4 animate-pulse">
                  <div className="size-12 bg-slate-100 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="size-16 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>notifications_off</span>
              </div>
              <div className="text-center space-y-1">
                <p className="font-black text-[13px] tracking-widest text-slate-900 uppercase font-headline">Semua Sudah Dibaca</p>
                <p className="text-xs font-semibold text-slate-400">Tidak ada notifikasi baru untuk kepengurusan Anda saat ini.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => {
                const Icon = ICON_MAP[notif.Tipe] || Bell
                const iconColor = TIPE_COLORS[notif.Tipe] || 'bg-slate-50 text-slate-500 border-slate-100'
                
                return (
                  <div 
                    key={notif.ID} 
                    onClick={() => handleMarkRead(notif.ID)}
                    className={cn(
                      'py-5 first:pt-0 last:pb-0 flex items-start gap-4 transition-all duration-200 cursor-pointer group',
                      notif.IsRead 
                        ? 'bg-transparent hover:bg-slate-50/50' 
                        : 'bg-blue-50/20 hover:bg-blue-50/40'
                    )}
                  >
                    {/* Icon Container */}
                    <div className={cn('size-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105 duration-200', iconColor)}>
                      <Icon size={20} />
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className={cn(
                            'font-headline tracking-tight text-[13px] transition-colors',
                            notif.IsRead 
                              ? 'text-slate-600 font-bold' 
                              : 'text-slate-900 font-black'
                          )}>
                            {notif.Judul}
                          </p>
                          <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-4xl">
                            {notif.Pesan}
                          </p>
                        </div>

                        {/* Status Pin & Time */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {!notif.IsRead && (
                            <span className="h-2 w-2 rounded-full bg-[#00236F] shadow-lg shadow-blue-900/40 animate-pulse" />
                          )}
                          <span className="text-[10px] font-bold text-slate-400 tracking-tight">
                            {notif.CreatedAt ? new Date(notif.CreatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
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

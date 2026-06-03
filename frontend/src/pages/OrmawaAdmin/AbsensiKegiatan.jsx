"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '../FacultyAdmin/components/data-table'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../FacultyAdmin/components/dialog'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Avatar, AvatarFallback } from '../FacultyAdmin/components/avatar'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

export default function AbsensiKegiatan() {
  const [events, setEvents] = useState([])
  const [attendance, setAttendance] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingAtt, setLoadingAtt] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isQrOpen, setIsQrOpen] = useState(false)
  const [qrUrl, setQrUrl] = useState('')
  
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.ID || 1

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const data = await fetchWithAuth(`${API}/events?ormawaId=${ormawaId}`)
      if (data.status === 'success') {
        setEvents(data.data || [])
      }
    } catch (err) {
      toast.error('Gagal memuat daftar kegiatan')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendance = async (eventId) => {
    setLoadingAtt(true)
    try {
      const data = await fetchWithAuth(`${API}/attendance/${eventId}`)
      if (data.status === 'success') {
        setAttendance(data.data || [])
      }
    } catch (err) {
      // Slient fail
    } finally {
      setLoadingAtt(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleSelectEvent = (event) => {
    setSelectedEvent(event)
    const data = `${window.location.origin}/student/presensi?eventId=${event.ID}`
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`)
    fetchAttendance(event.ID)
  }

  const handleRecordAttendance = async (studentId, status) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          KegiatanID: selectedEvent.id || selectedEvent.ID, 
          MahasiswaID: studentId, 
          Status: status, 
          OrmawaID: ormawaId 
        })
      })
      if (data.status === 'success') {
        toast.success(status === 'hadir' ? 'Kehadiran berhasil dicatat!' : 'Ketidakhadiran berhasil dicatat')
        fetchAttendance(selectedEvent.ID)
      } else {
        toast.error(data.message || 'Gagal mencatat kehadiran')
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi backend')
    } finally {
      setIsSubmitting(false)
    }
  }

  const eventColumns = [
    {
      key: 'Judul', 
      label: 'Nama Kegiatan', 
      className: 'min-w-[260px]',
      render: (v, row) => (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-slate-900 text-[13px] font-headline tracking-tighter">{v || '—'}</span>
          <span className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5">
            {row.TanggalMulai ? new Date(row.TanggalMulai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </span>
        </div>
      )
    },
    {
      key: 'Status', 
      label: 'Status', 
      className: 'w-[140px] text-center', 
      cellClassName: 'text-center',
      render: (v) => {
        const colors = { 
          terjadwal: 'bg-blue-50 text-blue-700 border-blue-100', 
          berlangsung: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
          selesai: 'bg-slate-50 text-slate-600 border-slate-100', 
          dibatalkan: 'bg-rose-50 text-rose-700 border-rose-100' 
        }
        return (
          <Badge className={cn('font-bold text-[10px] uppercase tracking-wider px-3 py-1 border rounded-full', colors[v] || 'bg-slate-50 text-slate-600 border-slate-100')}>
            {v || 'terjadwal'}
          </Badge>
        )
      }
    }
  ]

  const attendedCount = attendance.filter(a => a.Status === 'hadir').length
  const absentCount = attendance.filter(a => a.Status === 'tidak_hadir').length
  const attendanceRate = attendance.length > 0 ? Math.round((attendedCount / attendance.length) * 100) : 0

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
      <Toaster position="top-right" />
      
      {/* ── Keyframe Animations for QR Beam Scanner ───────────────── */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 0.8; }
        }
        .animate-scan {
          animation: scan 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white p-8 md:p-10 shadow-sm border border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.02)_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, var(--theme-primary) 1px, transparent 1px), radial-gradient(circle at 80% 20%, var(--theme-primary) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ backgroundColor: 'var(--theme-secondary)' }} />
        <div className="absolute -bottom-10 right-40 w-60 h-60 rounded-full blur-2xl opacity-10" style={{ backgroundColor: 'var(--theme-surface)' }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ backgroundColor: 'var(--theme-primary)' }} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-600">Modul Kehadiran</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner" style={{ color: 'var(--theme-primary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>qr_code_scanner</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight font-headline text-slate-900">Absensi Kegiatan</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Kelola data presensi anggota dan buat kode pemindaian QR absensi instan.</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={fetchEvents}
              className="h-11 px-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 font-bold text-xs tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-sm"
              style={{ color: 'var(--theme-primary)' }}
            >
              <span className="material-symbols-outlined size-4" style={{ fontSize: '16px' }}>sync</span>
              <span>REFRESH</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Overview Statistics Cards Grid ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Kegiatan */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-2xl bg-bku-primary/5 flex items-center justify-center text-bku-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>layers</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Total Sesi Kegiatan</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight font-headline">{events.length}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Anggota Terdaftar */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>group</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Anggota Terdaftar</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight font-headline">
                {selectedEvent ? attendance.length : 0}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Kehadiran Terpenuhi */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>check_circle</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Hadir / Tidak Hadir</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight font-headline">
                {selectedEvent ? `${attendedCount} / ${absentCount}` : '0 / 0'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Kehadiran Rate */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>percent</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Rasio Kehadiran</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight font-headline">
                {selectedEvent ? `${attendanceRate}%` : '0%'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Content Grid Area ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Events List (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-200/50 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="font-black text-[15px] font-headline uppercase tracking-wider" style={{ color: 'var(--theme-h2)' }}>Daftar Kegiatan</h2>
                <p className="text-[11px] text-slate-400 font-bold">Pilih salah satu sesi kegiatan di bawah ini</p>
              </div>
              <Badge className="bg-bku-primary/5 text-bku-primary px-2.5 py-1 border-none font-bold text-[10px] rounded-lg">
                {events.length} Sesi
              </Badge>
            </div>
            
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <DataTable
                columns={eventColumns} 
                data={events} 
                loading={loading}
                searchPlaceholder="Cari nama sesi..."
                title=""
                actions={(row) => {
                  const isSelected = selectedEvent?.ID === row.ID
                  return (
                    <Button 
                      onClick={() => handleSelectEvent(row)} 
                      size="sm" 
                      className={cn(
                        'h-8 px-4 rounded-xl text-[10px] font-bold border-none transition-all hover:scale-105 active:scale-95', 
                        isSelected 
                          ? 'bg-bku-primary text-white shadow-md shadow-blue-900/10' 
                          : 'bg-bku-primary/5 text-bku-primary hover:bg-bku-primary/10'
                      )}
                    >
                      {isSelected ? 'Dipilih' : 'Pilih'}
                    </Button>
                  )
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Attendance Dashboard Control (7 Cols) */}
        <div className="lg:col-span-7">
          {!selectedEvent ? (
            <Card className="border border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 p-12 text-center shadow-none flex flex-col items-center justify-center min-h-[460px] transition-all hover:bg-slate-50">
              <div className="w-16 h-16 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-sm border border-white">
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>qr_code_scanner</span>
              </div>
              <h3 className="font-black text-sm font-headline tracking-wider uppercase" style={{ color: 'var(--theme-h3)' }}>Belum Ada Kegiatan Terpilih</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed font-medium">
                Pilih salah satu sesi kegiatan dari daftar sebelah kiri untuk memproses absensi QR Code dan memasukkan data absensi secara manual.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Event Quick Info Banner */}
              <div className="p-6 bg-gradient-to-r from-bku-primary/5 via-bku-primary/5 to-transparent rounded-[2rem] border border-blue-900/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-bku-primary tracking-widest uppercase font-headline">Sesi Aktif</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 text-[8px] font-black tracking-wider uppercase rounded-full">
                      Ready
                    </Badge>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 font-headline tracking-tighter leading-tight">
                    {selectedEvent.Judul}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>calendar_today</span>
                    {selectedEvent.TanggalMulai ? new Date(selectedEvent.TanggalMulai).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                  {/* Dynamic mini QR box inside dashboard */}
                  <div 
                    onClick={() => setIsQrOpen(true)}
                    className="p-1.5 bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all group relative shrink-0"
                    title="Perbesar QR Code"
                  >
                    <img src={qrUrl} alt="Mini QR" className="size-11 object-contain" />
                    <div className="absolute inset-0 bg-bku-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                      <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '14px' }}>zoom_in</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setIsQrOpen(true)} 
                    className="flex-1 sm:flex-initial h-11 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>qr_code_2</span>
                    <span>BUKA SCANNER</span>
                  </Button>
                </div>
              </div>

              {/* Attendance Checklist Control List */}
              <div className="bg-white rounded-[2rem] border border-slate-200/50 shadow-sm overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-black text-xs font-headline tracking-wider uppercase" style={{ color: 'var(--theme-h3)' }}>Konfirmasi Kehadiran Anggota</h3>
                    <p className="text-[11px] text-slate-400 font-bold">Cek lis secara manual untuk memperbarui status</p>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-3 text-[10px] font-black tracking-wider uppercase">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {attendedCount} Hadir
                    </span>
                    <span className="flex items-center gap-1 text-rose-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      {absentCount} Alpa
                    </span>
                  </div>
                </div>

                {loadingAtt ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="material-symbols-outlined size-6 animate-spin text-bku-primary" style={{ fontSize: '28px' }}>sync</span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Memuat absensi...</p>
                  </div>
                ) : attendance.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
                    <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '32px' }}>group_off</span>
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Belum ada anggota terdaftar</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-100 scrollbar-track-transparent">
                    {attendance.map((att, idx) => {
                      const isAttended = att.Status === 'hadir'
                      const isAbsent = att.Status === 'tidak_hadir'
                      
                      // HSL Tailored color arrays to give stunning dynamic avatars
                      const bgAvatars = ['bg-blue-50 text-blue-600', 'bg-indigo-50 text-indigo-600', 'bg-purple-50 text-purple-600', 'bg-teal-50 text-teal-600']
                      const avatarStyle = bgAvatars[idx % bgAvatars.length]

                      return (
                        <div 
                          key={att.ID} 
                          className={cn(
                            "flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300",
                            isAttended && "bg-emerald-50/20 border-emerald-100/50",
                            isAbsent && "bg-rose-50/10 border-rose-100/40"
                          )}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <Avatar className="h-10 w-10 rounded-2xl shrink-0 shadow-sm">
                              <AvatarFallback className={cn("text-[11px] font-black uppercase font-headline", avatarStyle)}>
                                {att.Mahasiswa?.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 space-y-0.5">
                              <p className="font-bold text-slate-900 text-xs font-headline truncate leading-none">
                                {att.Mahasiswa?.Nama || '—'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold leading-none">
                                NIM. {att.Mahasiswa?.NIM || '—'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Attended Check Button */}
                            <button 
                              onClick={() => handleRecordAttendance(att.StudentID || att.MahasiswaID || att.id || att.ID, 'hadir')}
                              disabled={isSubmitting}
                              className={cn(
                                'h-9 w-9 rounded-xl flex items-center justify-center transition-all border border-transparent active:scale-90', 
                                isAttended 
                                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                  : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                              )}
                              title="Set Hadir"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                            </button>
                            
                            {/* Absent Alpa Button */}
                            <button 
                              onClick={() => handleRecordAttendance(att.StudentID || att.MahasiswaID || att.id || att.ID, 'tidak_hadir')}
                              disabled={isSubmitting}
                              className={cn(
                                'h-9 w-9 rounded-xl flex items-center justify-center transition-all border border-transparent active:scale-90', 
                                isAbsent 
                                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                                  : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                              )}
                              title="Set Alpa"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── QR Scanner Popup Dialog ───────────────────────────────── */}
      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white animate-in zoom-in-95 duration-200">
          <div className="p-8 flex flex-col items-center gap-6 relative">
            <div className="text-center space-y-1.5">
              <span className="text-[9px] font-black text-bku-primary tracking-[0.25em] uppercase font-headline">PEMINDAI QR PRESENSI</span>
              <h3 className="text-xl font-black text-slate-900 font-headline tracking-tighter leading-tight">
                {selectedEvent?.Judul}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider">Arahkan kamera mahasiswa ke kode QR di bawah ini</p>
            </div>
            
            {/* Elegant QR display with high-tech laser beam animation effect */}
            <div className="size-72 p-6 bg-slate-50 rounded-[2.5rem] border-4 border-slate-100 flex items-center justify-center relative overflow-hidden shadow-inner group">
              <img src={qrUrl} alt="QR Code Absensi" className="size-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105" />
              
              {/* Animated laser scan beam line */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-bku-primary to-transparent shadow-[0_0_12px_#00236F] animate-scan top-0 z-20 pointer-events-none" />
              
              {/* Outer decorative scanner corners */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-bku-primary rounded-tl-xl" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-bku-primary rounded-tr-xl" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-bku-primary rounded-bl-xl" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-bku-primary rounded-br-xl" />
            </div>

            <div className="w-full space-y-4">
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-900/5 text-center flex items-center justify-center gap-2.5">
                <span className="material-symbols-outlined text-bku-primary animate-pulse" style={{ fontSize: '18px' }}>verified_user</span>
                <div className="text-left space-y-0.5">
                  <p className="text-[9px] font-black text-bku-primary tracking-widest uppercase leading-none">Security Encryption Active</p>
                  <p className="text-[10px] font-bold text-slate-500 leading-none">Sistem memvalidasi NIM dan waktu secara real-time</p>
                </div>
              </div>
              
              <Button 
                onClick={() => setIsQrOpen(false)} 
                className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] tracking-[0.2em] uppercase active:scale-95 transition-all shadow-lg"
              >
                TUTUP SCANNER
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

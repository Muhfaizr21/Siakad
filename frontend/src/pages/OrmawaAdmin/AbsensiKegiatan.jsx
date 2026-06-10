"use client"
import React, { useState, useEffect } from 'react';
import { PageContent, PageHeader } from '@/components/ui/page';



import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { Card, CardContent } from '@/components/ui/Card'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import { getOrmawaId } from '../../utils/getOrmawaId'

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

  const ormawaId = getOrmawaId()

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
  }, [ormawaId])

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
      className: 'min-w-[140px] max-w-[200px]',
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
      className: 'w-[90px] text-center',
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
    <PageContent className="font-body">
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
      <PageHeader 
        title="Absensi Kegiatan"
        subtitle="Kelola data presensi anggota dan buat kode pemindaian QR absensi instan."
        icon="qr_code_scanner"
        action={
          <button
            onClick={fetchEvents}
            className="h-10 px-5 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-bg)] border border-border font-bold text-xs tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-sm"
            style={{ color: 'var(--theme-primary)' }}
          >
            <span className="material-symbols-outlined size-4" style={{ fontSize: '16px' }}>sync</span>
            <span>REFRESH</span>
          </button>
        }
       
        breadcrumbs={[ { label: 'Dashboard', path: '/ormawa' }, { label: 'Absensi Kegiatan', path: '#' } ]} 
      />

      {/* ── Overview Statistics Cards Grid ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Kegiatan */}
        <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden bg-[var(--theme-surface)] hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-xl bg-[var(--theme-primary-light)] flex items-center justify-center text-[var(--theme-primary)] border border-[var(--theme-primary)]/20">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>layers</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-wider uppercase font-headline">Total Sesi Kegiatan</p>
              <p className="text-2xl font-black text-[var(--theme-text)] tracking-tight font-headline">{events.length}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Anggota Terdaftar */}
        <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden bg-[var(--theme-surface)] hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-xl bg-[var(--theme-primary-light)] flex items-center justify-center text-[var(--theme-primary)] border border-[var(--theme-primary)]/20">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>group</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-wider uppercase font-headline">Anggota Terdaftar</p>
              <p className="text-2xl font-black text-[var(--theme-text)] tracking-tight font-headline">
                {selectedEvent ? attendance.length : 0}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Kehadiran Terpenuhi */}
        <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden bg-[var(--theme-surface)] hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-xl bg-[var(--theme-success-light)] flex items-center justify-center text-[var(--theme-success)] border border-[var(--theme-success)]/20">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>check_circle</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-wider uppercase font-headline">Hadir / Tidak Hadir</p>
              <p className="text-2xl font-black text-[var(--theme-text)] tracking-tight font-headline">
                {selectedEvent ? `${attendedCount} / ${absentCount}` : '0 / 0'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Kehadiran Rate */}
        <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden bg-[var(--theme-surface)] hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-4.5">
            <div className="w-12 h-12 rounded-xl bg-[var(--theme-warning-light)] flex items-center justify-center text-[var(--theme-warning)] border border-[var(--theme-warning)]/20">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>percent</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-wider uppercase font-headline">Rasio Kehadiran</p>
              <p className="text-2xl font-black text-[var(--theme-text)] tracking-tight font-headline">
                {selectedEvent ? `${attendanceRate}%` : '0%'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Content Grid Area ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Events List (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-border shadow-sm overflow-hidden p-5 flex flex-col h-full">
            <div className="flex items-center justify-between px-1 mb-4 shrink-0">
              <div className="space-y-0.5">
                <h2 className="font-black text-[15px] font-headline uppercase tracking-wider" style={{ color: 'var(--theme-h2)' }}>Daftar Kegiatan</h2>
                <p className="text-[11px] text-[var(--theme-text-subtle)] font-bold">Pilih sesi kegiatan</p>
              </div>
              <Badge className="bg-[var(--theme-primary-light)] text-[var(--theme-primary)] px-2.5 py-1 border-none font-bold text-[10px] rounded-lg">
                {events.length} Sesi
              </Badge>
            </div>

            <div className="border border-border/50 rounded-2xl overflow-hidden">
              <DataTable
                columns={eventColumns}
                data={events}
                loading={loading}
                searchPlaceholder="Cari kegiatan..."
                title=""
                actions={(row) => {
                  const isSelected = selectedEvent?.ID === row.ID
                  return (
                    <Button
                      onClick={() => handleSelectEvent(row)}
                      size="sm"
                      className={cn(
                        'h-8 px-4 rounded-xl text-[10px] font-bold border-none transition-all hover:scale-105 active:scale-95 cursor-pointer',
                        isSelected
                          ? 'bg-[var(--theme-primary)] text-white shadow-md shadow-[var(--theme-primary)]/10'
                          : 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)]/80'
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
        <div className="lg:col-span-7 flex flex-col">
          {!selectedEvent ? (
            <Card className="border border-dashed border-border rounded-2xl bg-[var(--theme-bg)] p-12 text-center shadow-none flex flex-col items-center justify-center h-full min-h-[460px] transition-all hover:bg-[var(--theme-bg)]/80">
              <div className="w-16 h-16 rounded-2xl bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-text-subtle)] mb-4 shadow-sm border border-border/50">
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>qr_code_scanner</span>
              </div>
              <h3 className="font-black text-sm font-headline tracking-wider uppercase" style={{ color: 'var(--theme-h3)' }}>Belum Ada Kegiatan Terpilih</h3>
              <p className="text-xs text-[var(--theme-text-subtle)] max-w-sm mx-auto mt-2 leading-relaxed font-medium">
                Pilih salah satu sesi kegiatan dari daftar sebelah kiri untuk memproses absensi QR Code dan memasukkan data absensi secara manual.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col h-full space-y-6">
              {/* Event Quick Info Banner */}
              <div className="relative overflow-hidden p-6 bg-gradient-to-br from-primary via-primary to-blue-700 rounded-2xl border-none shadow-lg shadow-[var(--theme-primary)]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shrink-0">
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
                <div className="absolute -bottom-6 right-32 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <span className="material-symbols-outlined size-24 rotate-12 text-white">qr_code_scanner</span>
                </div>

                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white/80 tracking-widest uppercase font-headline">Sesi Aktif</span>
                    <Badge className="bg-white text-[var(--theme-primary)] px-2 py-0.5 text-[8px] font-black tracking-wider uppercase rounded-full border-none shadow-sm">
                      Ready
                    </Badge>
                  </div>
                  <h3 className="text-lg font-black text-white font-headline tracking-tighter leading-tight">
                    {selectedEvent.Judul}
                  </h3>
                  <p className="text-[11px] text-white/70 font-bold flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>calendar_today</span>
                    {selectedEvent.TanggalMulai ? new Date(selectedEvent.TanggalMulai).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-3 w-full sm:w-auto shrink-0">
                  {/* Dynamic mini QR box inside dashboard */}
                  <div
                    onClick={() => setIsQrOpen(true)}
                    className="p-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all group relative shrink-0"
                    title="Perbesar QR Code"
                  >
                    <div className="bg-white rounded-lg p-1">
                      <img src={qrUrl} alt="Mini QR" className="size-10 object-contain" />
                    </div>
                    <div className="absolute inset-0 bg-[var(--theme-primary)]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                      <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>zoom_in</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsQrOpen(true)}
                    className="flex-1 sm:flex-initial h-12 px-6 rounded-2xl bg-white hover:bg-slate-50 text-[var(--theme-primary)] font-black text-[10px] tracking-wider gap-2 shadow-lg active:scale-95 transition-all border-none"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>qr_code_2</span>
                    <span>BUKA SCANNER</span>
                  </Button>
                </div>
              </div>

              {/* Attendance Checklist Control List */}
              <div className="bg-[var(--theme-surface)] rounded-2xl border border-border shadow-sm overflow-hidden p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between shrink-0 mb-4">
                  <div className="space-y-0.5">
                    <h3 className="font-black text-xs font-headline tracking-wider uppercase" style={{ color: 'var(--theme-h3)' }}>Konfirmasi Kehadiran Anggota</h3>
                    <p className="text-[11px] text-[var(--theme-text-subtle)] font-bold">Cek lis secara manual untuk memperbarui status</p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-3 text-[10px] font-black tracking-wider uppercase">
                    <span className="flex items-center gap-1 text-[var(--theme-success)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--theme-success)]" />
                      {attendedCount} Hadir
                    </span>
                    <span className="flex items-center gap-1 text-[var(--theme-error)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--theme-error)]" />
                      {absentCount} Alpa
                    </span>
                  </div>
                </div>

                {loadingAtt ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="material-symbols-outlined size-6 animate-spin text-[var(--theme-primary)]" style={{ fontSize: '28px' }}>sync</span>
                    <p className="text-[10px] font-black text-[var(--theme-text-subtle)] uppercase tracking-widest animate-pulse">Memuat absensi...</p>
                  </div>
                ) : attendance.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] gap-4 border-2 border-dashed border-border/60 rounded-2xl bg-[var(--theme-bg)]/40 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--theme-surface)]/50 pointer-events-none" />
                    <div className="size-16 rounded-3xl bg-[var(--theme-surface)] shadow-sm border border-border/80 flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 duration-300">
                      <span className="material-symbols-outlined text-[var(--theme-text-subtle)]" style={{ fontSize: '32px' }}>group_off</span>
                    </div>
                    <div className="text-center relative z-10 space-y-1">
                      <p className="text-xs font-black text-[var(--theme-text)] tracking-wider uppercase font-headline">Belum Ada Anggota Terdaftar</p>
                      <p className="text-[11px] font-bold text-[var(--theme-text-subtle)]">Tidak ada data kehadiran yang masuk untuk sesi kegiatan ini.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[var(--theme-border)] scrollbar-track-transparent">
                    {attendance.map((att, idx) => {
                      const isAttended = att.Status === 'hadir'
                      const isAbsent = att.Status === 'tidak_hadir'

                      // Dynamic themed avatars
                      const bgAvatars = [
                        'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border border-[var(--theme-primary)]/20',
                        'bg-[var(--theme-secondary-light)] text-[var(--theme-secondary)] border border-[var(--theme-secondary)]/20',
                        'bg-[var(--theme-info-light)] text-[var(--theme-info)] border border-[var(--theme-info)]/20',
                        'bg-[var(--theme-success-light)] text-[var(--theme-success)] border border-[var(--theme-success)]/20'
                      ]
                      const avatarStyle = bgAvatars[idx % bgAvatars.length]

                      return (
                        <div
                          key={att.ID}
                          className={cn(
                            "flex items-center justify-between p-3.5 rounded-2xl border border-border/50 shadow-sm transition-all duration-300",
                            isAttended && "bg-[var(--theme-success-light)]/20 border-[var(--theme-success)]/20",
                            isAbsent && "bg-[var(--theme-error-light)]/10 border-[var(--theme-error)]/20"
                          )}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <Avatar className="h-10 w-10 rounded-2xl shrink-0 shadow-sm">
                              <AvatarFallback className={cn("text-[11px] font-black uppercase font-headline", avatarStyle)}>
                                {att.Mahasiswa?.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 space-y-0.5">
                              <p className="font-bold text-[var(--theme-text)] text-xs font-headline truncate leading-none">
                                {att.Mahasiswa?.Nama || '—'}
                              </p>
                              <p className="text-[10px] text-[var(--theme-text-subtle)] font-bold leading-none">
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
                                'h-9 w-9 rounded-xl flex items-center justify-center transition-all border border-transparent active:scale-90 cursor-pointer',
                                isAttended
                                  ? 'bg-[var(--theme-success)] text-white shadow-lg shadow-[var(--theme-success)]/20'
                                  : 'bg-[var(--theme-bg)] text-[var(--theme-text-subtle)] hover:bg-[var(--theme-success-light)] hover:text-[var(--theme-success)] hover:border-[var(--theme-success)]/20'
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
                                'h-9 w-9 rounded-xl flex items-center justify-center transition-all border border-transparent active:scale-90 cursor-pointer',
                                isAbsent
                                  ? 'bg-[var(--theme-error)] text-white shadow-lg shadow-[var(--theme-error)]/20'
                                  : 'bg-[var(--theme-bg)] text-[var(--theme-text-subtle)] hover:bg-[var(--theme-error-light)] hover:text-[var(--theme-error)] hover:border-[var(--theme-error)]/20'
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
      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen} maxWidth="max-w-md">
        <DialogContent className="w-full h-full p-0 overflow-hidden border-none shadow-none rounded-2xl bg-white animate-in zoom-in-95 duration-200">
          <DialogHeader className="relative bg-gradient-to-br from-primary via-primary to-blue-700 pt-6 pb-7 px-6 overflow-hidden flex-shrink-0 border-b-0 text-left">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute -bottom-6 right-16 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute -top-6 -right-2 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined -rotate-12 text-white" style={{ fontSize: '140px' }}>qr_code_scanner</span>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
                  <span className="material-symbols-outlined stroke-[3px]" style={{ fontSize: '16px' }}>qr_code_2</span>
                </div>
                <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-white/10 text-white border-none rounded-md backdrop-blur-sm">QR PRESENSI</Badge>
              </div>
              <DialogTitle className="text-xl font-black font-headline tracking-tighter text-white pr-8">
                {selectedEvent?.Judul || 'Memuat Kegiatan...'}
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-white/70 mt-1">Arahkan kamera ke kode QR di bawah ini</DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-8 flex flex-col items-center gap-6 relative">
            {/* Elegant QR display with high-tech laser beam animation effect */}
            <div className="size-72 p-6 bg-slate-50 rounded-2xl border-4 border-slate-200 flex items-center justify-center relative overflow-hidden shadow-inner group">
              <img src={qrUrl} alt="QR Code Absensi" className="size-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105" />

              {/* Animated laser scan beam line */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent shadow-[0_0_12px_var(--theme-primary)] animate-scan top-0 z-20 pointer-events-none" />

              {/* Outer decorative scanner corners */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-[var(--theme-primary)] rounded-tl-xl" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-[var(--theme-primary)] rounded-tr-xl" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-[var(--theme-primary)] rounded-bl-xl" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-[var(--theme-primary)] rounded-br-xl" />
            </div>

            <div className="w-full space-y-4">
              <div className="p-4 bg-[var(--theme-primary-light)]/40 rounded-2xl border border-[var(--theme-primary)]/10 text-center flex items-center justify-center gap-2.5">
                <span className="material-symbols-outlined text-[var(--theme-primary)] animate-pulse" style={{ fontSize: '18px' }}>verified_user</span>
                <div className="text-left space-y-0.5">
                  <p className="text-[9px] font-black text-[var(--theme-primary)] tracking-widest uppercase leading-none">Security Encryption Active</p>
                  <p className="text-[10px] font-bold text-slate-450 leading-none">Sistem memvalidasi NIM dan waktu secara real-time</p>
                </div>
              </div>

              <Button
                onClick={() => setIsQrOpen(false)}
                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] tracking-[0.2em] uppercase active:scale-95 transition-all shadow-lg border-none"
              >
                TUTUP SCANNER
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContent>
  )
}

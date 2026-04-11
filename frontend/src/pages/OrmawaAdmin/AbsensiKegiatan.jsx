"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '../FacultyAdmin/components/data-table'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../FacultyAdmin/components/dialog'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Avatar, AvatarFallback } from '../FacultyAdmin/components/avatar'
import { ScanLine, CheckCircle2, XCircle, Loader2, Users, CalendarCheck } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

export default function AbsensiKegiatan() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
      if (data.status === 'success') setEvents(data.data || [])
    } catch { toast.error('Gagal memuat kegiatan') } finally { setLoading(false) }
  }

  const fetchAttendance = async (eventId) => {
    setLoadingAtt(true)
    try {
      const data = await fetchWithAuth(`${API}/attendance/${eventId}`)
      if (data.status === 'success') setAttendance(data.data || [])
    } catch {} finally { setLoadingAtt(false) }
  }

  useEffect(() => { fetchEvents() }, [])

  const handleSelectEvent = (event) => {
    setSelectedEvent(event)
    const data = JSON.stringify({ type: 'absensi', event_id: event.ID, ormawa_id: ormawaId, timestamp: Date.now() })
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`)
    fetchAttendance(event.ID)
  }

  const handleRecordAttendance = async (studentId, status) => {
    setIsSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API}/absensi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ KegiatanID: selectedEvent.ID, MahasiswaID: studentId, Status: status, OrmawaID: ormawaId })
      })
      if (data.status === 'success') { toast.success('Kehadiran dicatat'); fetchAttendance(selectedEvent.ID) }
      else toast.error(data.message || 'Gagal mencatat')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const eventColumns = [
    {
      key: 'Judul', label: 'Nama Kegiatan', className: 'min-w-[260px]',
      render: (v, row) => (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-slate-900 text-[13px] font-headline tracking-tighter">{v || '—'}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{row.TanggalMulai ? new Date(row.TanggalMulai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
        </div>
      )
    },
    {
      key: 'Status', label: 'Status', className: 'w-[150px] text-center', cellClassName: 'text-center',
      render: (v) => {
        const colors = { terjadwal: 'bg-blue-100 text-blue-700', berlangsung: 'bg-emerald-100 text-emerald-700', selesai: 'bg-slate-100 text-slate-600', dibatalkan: 'bg-rose-100 text-rose-700' }
        return <Badge className={cn('font-black text-[10px] px-3 py-1 border-none', colors[v] || 'bg-slate-100 text-slate-600')}>{v || 'terjadwal'}</Badge>
      }
    }
  ]

  const attendedCount = attendance.filter(a => a.Status === 'hadir').length
  const absentCount = attendance.filter(a => a.Status === 'tidak_hadir').length

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="pt-20 px-4 lg:px-8 pb-12">
          <Toaster position="top-right" />
          <div className="flex flex-col gap-1.5 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><CalendarCheck className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Sistem Absensi (QR)</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manajemen Kehadiran Anggota per Kegiatan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daftar Kegiatan */}
            <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
              <CardContent className="p-0">
                <DataTable
                  columns={eventColumns} data={events} loading={loading}
                  searchPlaceholder="Cari kegiatan..."
                  actions={(row) => (
                    <Button onClick={() => handleSelectEvent(row)} size="sm" className={cn('h-8 px-4 rounded-xl text-[10px] font-black uppercase', selectedEvent?.ID === row.ID ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20')}>
                      {selectedEvent?.ID === row.ID ? 'Dipilih' : 'Pilih'}
                    </Button>
                  )}
                />
              </CardContent>
            </Card>

            {/* Panel Absensi */}
            <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
              <CardContent className="p-6">
                {!selectedEvent ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-300 gap-4">
                    <CalendarCheck className="size-12 stroke-[1px]" />
                    <p className="text-[11px] font-black uppercase tracking-widest text-center text-slate-400">Pilih kegiatan untuk<br />melihat & mencatat absensi</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl border border-primary/10 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                      <div>
                        <h3 className="font-black text-slate-900 font-headline tracking-tighter">{selectedEvent.Judul}</h3>
                        <div className="flex gap-4 mt-2">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Hadir: {attendedCount}</span>
                          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Tidak Hadir: {absentCount}</span>
                        </div>
                      </div>
                      <Button onClick={() => setIsQrOpen(true)} className="w-full sm:w-auto h-10 px-6 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 gap-2 shadow-xl shadow-slate-900/20">
                        <ScanLine className="size-4" /> <span className="text-[10px] font-black uppercase">Buka QR Code</span>
                      </Button>
                    </div>
                    {loadingAtt ? (
                      <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
                    ) : attendance.length === 0 ? (
                      <div className="flex flex-col items-center py-8 gap-2">
                        <Users className="size-8 text-slate-300" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum ada data absensi</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        {attendance.map((att) => (
                          <div key={att.ID} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                             <Avatar className="h-9 w-9 rounded-xl shrink-0">
                               <AvatarFallback className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase">
                                 {att.Mahasiswa?.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                               </AvatarFallback>
                             </Avatar>
                             <div className="flex-1 min-w-0">
                               <p className="font-bold text-slate-900 text-[12px] font-headline truncate">{att.Mahasiswa?.Nama || '—'}</p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase">{att.Mahasiswa?.NIM}</p>
                             </div>
                            <div className="flex gap-1.5">
                              <button onClick={() => handleRecordAttendance(att.StudentID || att.MahasiswaID, 'hadir')}
                                className={cn('size-8 rounded-xl flex items-center justify-center transition-all', att.Status === 'hadir' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600')}>
                                <CheckCircle2 className="size-4" />
                              </button>
                              <button onClick={() => handleRecordAttendance(att.StudentID || att.MahasiswaID, 'tidak_hadir')}
                                className={cn('size-8 rounded-xl flex items-center justify-center transition-all', att.Status === 'tidak_hadir' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25' : 'bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600')}>
                                <XCircle className="size-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white ">
          <div className="p-8 flex flex-col items-center gap-6">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900 font-headline tracking-tighter uppercase">{selectedEvent?.Judul}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan QR ini untuk melakukan presensi</p>
            </div>
            
            <div className="size-64 p-4 bg-slate-50 rounded-[2rem] border-4 border-slate-100 flex items-center justify-center relative group">
              <img src={qrUrl} alt="QR Code Absensi" className="size-full object-contain" />
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[1.8rem]">
                <ScanLine className="size-12 text-primary animate-pulse" />
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Kode Keamanan Aktif</p>
                <p className="text-[11px] font-bold text-slate-600 mt-1 uppercase tracking-tighter">Berlaku untuk seluruh anggota terdaftar</p>
              </div>
              <Button onClick={() => setIsQrOpen(false)} className="w-full h-12 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest">Tutup QR</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

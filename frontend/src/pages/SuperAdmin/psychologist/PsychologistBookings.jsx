"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { Card, CardContent } from '@/components/ui/Card'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../../services/api'
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'

const getCleanImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const baseUrl = API_BASE_URL.replace('/api', '')
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function PsychologistBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const bkRes = await adminService.getPsychologistBookings()
      if (bkRes.status === 'success') {
        // Flatten nested mahasiswa.fakultas & semester for DataTable filter compatibility
        const flattened = (bkRes.data || []).map(item => {
          const mhs = item.mahasiswa || item.Mahasiswa;
          return {
            ...item,
            _fakultas: mhs?.fakultas?.Nama || mhs?.Fakultas?.Nama || mhs?.fakultas?.nama || mhs?.Fakultas?.nama || '',
            _semester: mhs?.SemesterSekarang || mhs?.semester_sekarang || ''
          };
        })
        setBookings(flattened)
      } else {
        toast.error('Gagal memuat data booking')
      }
    } catch (err) {
      console.error(err)
      toast.error('Koneksi sistem terputus / Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Compute unique fakultas & semester options
  const fakultasOptions = useMemo(() => {
    const unique = [...new Set(bookings.map(i => i._fakultas).filter(Boolean))].sort()
    return unique.map(f => ({ label: f.toUpperCase(), value: f }))
  }, [bookings])

  const semesterOptions = useMemo(() => {
    const unique = [...new Set(bookings.map(i => i._semester).filter(v => v !== '' && v !== undefined && v !== null))].sort((a, b) => Number(a) - Number(b))
    return unique.map(s => ({ label: `SEMESTER ${s}`, value: String(s) }))
  }, [bookings])

  const bookingColumns = [
    {
      key: 'mahasiswa',
      label: 'Mahasiswa',
      className: 'w-[250px]',
      render: (v, row) => {
        const mhs = row.mahasiswa || row.Mahasiswa;
        return (
          <div className="flex flex-col py-1 font-jakarta">
            <span className="font-bold text-neutral-900 text-xs">{mhs?.Nama || mhs?.nama || '—'}</span>
            <span className="text-[10px] text-neutral-400 font-bold">{mhs?.NIM || mhs?.nim || '—'}</span>
            <span className="text-[9px] text-neutral-400 font-medium tracking-wide uppercase">{mhs?.program_studi?.nama || mhs?.ProgramStudi?.Nama || mhs?.program_studi?.Nama || '—'}</span>
            <div className="flex items-center gap-2 mt-0.5">
              {row._fakultas && <span className="text-[8px] text-bku-primary font-bold bg-bku-primary/10 px-1.5 py-0.5 rounded">{row._fakultas}</span>}
              {row._semester && <span className="text-[8px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Sem {row._semester}</span>}
            </div>
          </div>
        )
      }
    },
    {
      key: 'psikolog',
      label: 'Konselor / Psikolog',
      className: 'w-[200px]',
      render: (v, row) => (
        <div className="flex flex-col py-1 font-jakarta">
          <span className="font-bold text-neutral-800 text-xs">{row.psikolog?.nama || '—'}</span>
          <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{row.psikolog?.spesialisasi || '—'}</span>
        </div>
      )
    },
    {
      key: 'tanggal',
      label: 'Jadwal Konseling',
      className: 'w-[220px]',
      render: (v, row) => {
        const formattedDate = v ? new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        return (
          <div className="flex flex-col py-1 font-jakarta">
            <span className="font-bold text-neutral-800 text-xs">{formattedDate}</span>
            <span className="text-[10px] text-neutral-500 font-medium">{row.jam_mulai} - {row.jam_selesai}</span>
            <span className="text-[9px] font-bold text-bku-primary bg-bku-primary/10 px-1 py-0.5 rounded w-fit mt-0.5 uppercase">{row.topik || 'Personal'}</span>
          </div>
        )
      }
    },
    {
      key: 'mode',
      label: 'Metode',
      className: 'w-[120px]',
      render: v => (
        <Badge className={cn('px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border font-jakarta shadow-none', 
          v === 'Online' ? 'bg-bku-primary/10 text-bku-primary border-bku-primary/20' : 'bg-slate-50 text-slate-600 border-slate-200'
        )}>
          {v || 'Tatap Muka'}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      className: 'w-[140px]',
      render: v => {
        const statusLower = String(v || '').toLowerCase()
        let bg = 'bg-neutral-50 text-neutral-600 border-neutral-100'
        if (statusLower === 'dikonfirmasi' || statusLower === 'selesai' || statusLower === 'disetujui') {
          bg = 'bg-emerald-50 text-emerald-600 border-emerald-100'
        } else if (statusLower === 'menunggu konfirmasi' || statusLower === 'waiting' || statusLower === 'pending' || statusLower === 'menunggu') {
          bg = 'bg-amber-50 text-amber-600 border-amber-100'
        } else if (statusLower === 'ditolak' || statusLower === 'dibatalkan') {
          bg = 'bg-rose-50 text-rose-600 border-rose-100'
        }
        return (
          <Badge className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border font-jakarta shadow-none', bg)}>
            {v || 'Menunggu'}
          </Badge>
        )
      }
    }
  ]

  const handleOpenDetail = (item) => {
    setDetailItem(item)
    setIsDetailOpen(true)
  }

  return (
    <PageContent>
      <Toaster position="top-right" />
      
      <DashboardHero
        title="Booking"
        highlightedTitle="Konseling"
        subtitle="Log janji temu konseling mahasiswa dengan psikolog, termasuk verifikasi status, mode layanan, dan detail keluhan."
        icon="psychology"
        badges={[{ label: 'Layanan Konseling Kampus', active: false }]}
        actions={
          <div className="px-4 py-2 bg-bku-primary/5 border border-bku-primary/20 rounded-xl flex items-center gap-3 w-full lg:w-auto justify-center">
             <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }}>calendar_month</span>
             <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold text-bku-primary/70 uppercase tracking-widest">Akses Validasi</span>
                <span className="text-[12px] font-bold text-bku-primary font-jakarta">Super Admin Portal</span>
             </div>
          </div>
        }
      />

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
          <CardContent className="p-0 animate-in fade-in duration-300">
            <DataTable
              columns={bookingColumns}
              data={bookings}
              loading={loading}
              searchPlaceholder="Cari Nama Mahasiswa, NIM, atau Topik..."
              filters={[
                { key: '_fakultas', placeholder: 'Pilih Fakultas', options: fakultasOptions },
                { key: '_semester', placeholder: 'Pilih Semester', options: semesterOptions },
                { key: 'status', placeholder: 'Pilih Status', options: [{ label: 'Menunggu', value: 'menunggu' }, { label: 'Disetujui', value: 'disetujui' }, { label: 'Selesai', value: 'selesai' }, { label: 'Dibatalkan', value: 'dibatalkan' }] },
                { key: 'mode', placeholder: 'Pilih Mode', options: [{ label: 'Tatap Muka', value: 'Tatap Muka' }, { label: 'Online', value: 'Online' }] }
              ]}
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => handleOpenDetail(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-bku-primary hover:bg-bku-primary/10 rounded-lg transition-colors" title="Lihat Detail"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span></Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

      {/* ── Detail Modal ─────────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen} maxWidth="max-w-2xl">
        <DialogContent>
          <DialogHeader className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-bku-primary"><span className="material-symbols-outlined rotate-12" style={{ fontSize: '100px' }} >calendar_month</span></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  <span className="material-symbols-outlined text-[12px]" >visibility</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-bku-primary font-jakarta">Detail Booking Sesi</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black font-jakarta tracking-tight text-slate-800 uppercase">
                Informasi Booking Konseling
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm font-medium text-slate-500 font-inter">Detail reservasi sesi bimbingan konseling.</DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-6 md:p-8 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar font-jakarta">
            {detailItem && (
              <>
                {/* Mahasiswa Info Section */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-3">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Identitas Mahasiswa</h4>
                  {(() => {
                    const mhs = detailItem.mahasiswa || detailItem.Mahasiswa;
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold block">Nama Lengkap</span>
                          <span className="text-sm font-bold text-neutral-800">{mhs?.Nama || mhs?.nama || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold block">NIM (Nomor Induk Mahasiswa)</span>
                          <span className="text-sm font-bold text-neutral-800">{mhs?.NIM || mhs?.nim || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold block">Program Studi</span>
                          <span className="text-xs font-semibold text-neutral-700">{mhs?.program_studi?.nama || mhs?.ProgramStudi?.Nama || mhs?.program_studi?.Nama || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold block">Fakultas</span>
                          <span className="text-xs font-semibold text-neutral-700">{mhs?.fakultas?.Nama || mhs?.Fakultas?.Nama || mhs?.fakultas?.nama || mhs?.Fakultas?.nama || '—'}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Psychologist Info Section */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-3">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Tenaga Profesional</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">Nama Psikolog</span>
                      <span className="text-sm font-bold text-neutral-800">{detailItem.psikolog?.nama || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">Spesialisasi</span>
                      <span className="text-xs font-bold text-bku-primary uppercase tracking-wide">{detailItem.psikolog?.spesialisasi || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">Tanggal Konseling</span>
                      <span className="text-xs font-bold text-neutral-800">
                        {detailItem.tanggal ? new Date(detailItem.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">Waktu Sesi</span>
                      <span className="text-xs font-bold text-neutral-800">{detailItem.jam_mulai} - {detailItem.jam_selesai}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">Mode Konseling</span>
                      <Badge className="px-2 py-0.5 mt-1 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 font-jakarta">
                        {detailItem.mode || 'Tatap Muka'}
                      </Badge>
                    </div>
                    {detailItem.mode === 'Online' && (
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold block">Link Meeting</span>
                        {detailItem.link_meeting ? (
                          <a href={detailItem.link_meeting} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-bku-primary hover:underline flex items-center gap-1 mt-1">
                            Gabung Google Meet/Zoom <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                          </a>
                        ) : (
                          <span className="text-xs font-semibold text-neutral-400 block mt-1">Belum disediakan</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-neutral-400 font-bold block">Topik Konseling</span>
                    <p className="text-xs font-bold text-neutral-800 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100">{detailItem.topik || '—'}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-neutral-400 font-bold block">Detail Keluhan Mahasiswa</span>
                    <p className="text-xs font-medium text-neutral-600 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100 whitespace-pre-wrap leading-relaxed">{detailItem.keluhan || '—'}</p>
                  </div>

                  {detailItem.catatan_admin && (
                    <div className="space-y-2">
                      <span className="text-[10px] text-neutral-400 font-bold block">Catatan Administrator</span>
                      <p className="text-xs font-medium text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">{detailItem.catatan_admin}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsDetailOpen(false)}
              className="flex-1 sm:flex-initial h-12 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 font-jakarta cursor-pointer"
            >
              Tutup Detail
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContent>
  )
}

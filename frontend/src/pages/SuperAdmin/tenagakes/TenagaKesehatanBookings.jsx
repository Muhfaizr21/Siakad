"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../../services/api'

export default function TenagaKesehatanBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const bkRes = await adminService.getTenagaKesehatanBookings()
      if (bkRes.status === 'success') {
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
        toast.error('Gagal memuat data booking janji temu')
      }
    } catch (err) {
      console.error(err)
      toast.error('Koneksi sistem terputus / Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const PointColor = 'bku-primary'

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
      key: 'tenaga_kes',
      label: 'Tenaga Medis',
      className: 'w-[200px]',
      render: (v, row) => (
        <div className="flex flex-col py-1 font-jakarta">
          <span className="font-bold text-neutral-800 text-xs">{row.jadwal?.tenaga_kes?.nama || '—'}</span>
          <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{row.jadwal?.tenaga_kes?.spesialisasi || '—'}</span>
        </div>
      )
    },
    {
      key: 'tanggal',
      label: 'Tanggal & Layanan',
      className: 'w-[220px]',
      render: (v, row) => {
        const formattedDate = row.jadwal?.tanggal ? new Date(row.jadwal.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        return (
          <div className="flex flex-col py-1 font-jakarta">
            <span className="font-bold text-neutral-800 text-xs">{formattedDate}</span>
            <span className="text-[10px] text-neutral-500 font-medium">{row.jadwal?.jam_mulai} - {row.jadwal?.jam_selesai}</span>
            <span className="text-[9px] font-bold text-bku-primary bg-bku-primary/10 px-1 py-0.5 rounded w-fit mt-0.5 uppercase">{row.jadwal?.tipe_layanan || 'Pemeriksaan'}</span>
          </div>
        )
      }
    },
    {
      key: 'keluhan',
      label: 'Keluhan',
      className: 'w-[250px]',
      render: (v, row) => (
        <div className="flex flex-col py-1 max-w-[220px] font-jakarta">
          <span className="text-xs text-neutral-800 font-medium block leading-normal line-clamp-2" title={row.keluhan}>{row.keluhan || '—'}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      className: 'w-[140px]',
      render: v => {
        const statusLower = String(v || '').toLowerCase()
        let bg = 'bg-neutral-50 text-neutral-600 border-neutral-100'
        if (statusLower === 'dikonfirmasi' || statusLower === 'selesai') {
          bg = 'bg-emerald-50 text-emerald-600 border-emerald-100'
        } else if (statusLower === 'menunggu konfirmasi' || statusLower === 'waiting' || statusLower === 'pending') {
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

  return (
    <div className="min-h-screen bg-[#fafafa] font-body p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="bg-white border border-neutral-200 rounded-xl p-5 md:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-bku-primary/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-1 w-full lg:w-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-bku-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Klinik Kesehatan Kampus</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                Booking <span className="text-bku-primary italic font-semibold">Janji Temu</span>
              </h1>
              <p className="text-neutral-500 font-medium text-xs md:text-sm max-w-2xl leading-relaxed">
                Log janji temu klinik mahasiswa dengan tenaga medis, verifikasi kuota, serta status pelayanan.
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="px-4 py-2 bg-bku-primary/5 border border-bku-primary/20 rounded-xl flex items-center gap-3 w-full lg:w-auto justify-center">
                 <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }}>calendar_month</span>
                 <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-bold text-bku-primary/70 uppercase tracking-widest">Akses Validasi</span>
                    <span className="text-[12px] font-bold text-bku-primary font-jakarta">Super Admin Portal</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
          <CardContent className="p-0 animate-in fade-in duration-300">
            <DataTable
              columns={bookingColumns}
              data={bookings}
              loading={loading}
              searchPlaceholder="Cari Nama Mahasiswa, NIM, atau Keluhan..."
              filters={[
                { key: '_fakultas', placeholder: 'Pilih Fakultas', options: fakultasOptions },
                { key: '_semester', placeholder: 'Pilih Semester', options: semesterOptions },
                { key: 'status', placeholder: 'Pilih Status', options: [{ label: 'Menunggu', value: 'menunggu' }, { label: 'Dikonfirmasi', value: 'dikonfirmasi' }, { label: 'Selesai', value: 'selesai' }, { label: 'Dibatalkan', value: 'dibatalkan' }] }
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

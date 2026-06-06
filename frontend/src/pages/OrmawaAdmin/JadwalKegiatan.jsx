"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

const STATUS_CFG = {
  terjadwal: { label: 'Terjadwal', cls: 'bg-blue-50 text-blue-700 border-blue-100/60 shadow-sm', icon: 'schedule' },
  berlangsung: { label: 'Berlangsung', cls: 'bg-amber-50 text-amber-700 border-amber-100/60 shadow-sm', icon: 'pending' },
  selesai: { label: 'Selesai', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100/60 shadow-sm', icon: 'check_circle' },
  dibatalkan: { label: 'Dibatalkan', cls: 'bg-rose-50 text-rose-700 border-rose-100/60 shadow-sm', icon: 'cancel' },
}

const formatRp = (n) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(n || 0)
}

const formatRupiahInput = (value) => {
  if (!value) return ''
  const numberString = value.toString().replace(/[^,\d]/g, '')
  const split = numberString.split(',')
  const sisa = split[0].length % 3
  let rupiah = split[0].substr(0, sisa)
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi)

  if (ribuan) {
    const separator = sisa ? '.' : ''
    rupiah += separator + ribuan.join('.')
  }

  rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah
  return rupiah
}

const parseRupiahInput = (value) => {
  if (!value) return 0
  return Number(value.toString().replace(/[^0-9]/g, ''))
}


export default function JadwalKegiatan() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const userObj = useAuthStore.getState()?.user
  const mhsObj = useAuthStore.getState()?.mahasiswa
  const ormawaId = userObj?.ormawa_id || userObj?.OrmawaID || userObj?.ormawaId || mhsObj?.ormawaId || mhsObj?.OrmawaID || 1
  const [form, setForm] = useState({
    Judul: '',
    Deskripsi: '',
    TanggalMulai: '',
    TanggalSelesai: '',
    Lokasi: '',
    Status: 'terjadwal',
    OrmawaID: ormawaId,
    LandasanKegiatan: '',
    BentukKegiatan: '',
    Mitra: '',
    LatarBelakang: '',
    TujuanKegiatan: '',
    JadwalPelaksanaan: '',
    SasaranKegiatan: '',
    IndikatorKeberhasilan: '',
    SumberDana: '',
    EstimasiDana: '',
    PJKegiatan: ''
  })

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const res = await fetchWithAuth(`${API}/events?ormawaId=${ormawaId}`)
      if (res.status === 'success') setData(res.data || [])
      else toast.error('Gagal memuat jadwal')
    } catch {
      toast.error('Koneksi gagal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleOpenAdd = () => {
    setIsEditMode(false)
    setForm({
      Judul: '',
      Deskripsi: '',
      Lokasi: '',
      TanggalMulai: '',
      TanggalSelesai: '',
      Status: 'terjadwal',
      OrmawaID: ormawaId,
      LandasanKegiatan: '',
      BentukKegiatan: '',
      Mitra: '',
      LatarBelakang: '',
      TujuanKegiatan: '',
      JadwalPelaksanaan: '',
      SasaranKegiatan: '',
      IndikatorKeberhasilan: '',
      SumberDana: '',
      EstimasiDana: '',
      PJKegiatan: ''
    })
    setIsCrudOpen(true)
  }

  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setForm({
      ID: row.id || row.ID,
      Judul: row.Judul || row.judul || '',
      Deskripsi: row.Deskripsi || row.deskripsi || '',
      Lokasi: row.Lokasi || row.lokasi || '',
      TanggalMulai: row.TanggalMulai ? row.TanggalMulai.split('T')[0] : (row.tanggalMulai ? row.tanggalMulai.split('T')[0] : ''),
      TanggalSelesai: row.TanggalSelesai ? row.TanggalSelesai.split('T')[0] : (row.tanggalSelesai ? row.tanggalSelesai.split('T')[0] : ''),
      Status: row.Status || row.status || 'terjadwal',
      OrmawaID: ormawaId,

      LandasanKegiatan: row.LandasanKegiatan || row.landasan_kegiatan || '',
      BentukKegiatan: row.BentukKegiatan || row.bentuk_kegiatan || '',
      Mitra: row.Mitra || row.mitra || '',
      LatarBelakang: row.LatarBelakang || row.latar_belakang || '',
      TujuanKegiatan: row.TujuanKegiatan || row.tujuan_kegiatan || '',
      JadwalPelaksanaan: row.JadwalPelaksanaan || row.jadwal_pelaksanaan || '',
      SasaranKegiatan: row.SasaranKegiatan || row.sasaran_kegiatan || '',
      IndikatorKeberhasilan: row.IndikatorKeberhasilan || row.indikator_keberhasilan || '',
      SumberDana: row.SumberDana || row.sumber_dana || '',
      EstimasiDana: row.EstimasiDana || row.estimasi_dana || '',
      PJKegiatan: row.PJKegiatan || row.pj_kegiatan || '',
    })
    setIsCrudOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (form.TanggalSelesai && new Date(form.TanggalSelesai) < new Date(form.TanggalMulai)) {
      toast.error('Tanggal selesai tidak boleh sebelum tanggal mulai')
      return
    }

    setIsSubmitting(true)
    const url = isEditMode ? `${API}/events/${form.ID || form.id}` : `${API}/events`
    const method = isEditMode ? 'PUT' : 'POST'
    const payload = {
      ...form,
      OrmawaID: Number(form.OrmawaID),
      EstimasiDana: Number(form.EstimasiDana || 0),
      TanggalMulai: form.TanggalMulai ? new Date(form.TanggalMulai).toISOString() : null,
      TanggalSelesai: form.TanggalSelesai ? new Date(form.TanggalSelesai).toISOString() : null
    }
    try {
      const data = await fetchWithAuth(url, { method, body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
      if (data.status === 'success') {
        toast.success(isEditMode ? 'Kegiatan diperbarui' : 'Kegiatan dijadwalkan')
        setIsCrudOpen(false)
        fetchEvents()
      } else {
        toast.error(data.message || 'Gagal menyimpan')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API}/events/${selected.id || selected.ID}`, { method: 'DELETE' })
      if (data.status === 'success') {
        toast.success('Kegiatan dibatalkan')
        setIsDelOpen(false)
        fetchEvents()
      } else {
        toast.error('Gagal menghapus')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'Judul',
      label: 'Nama Kegiatan',
      className: 'min-w-[280px]',
      render: (v, row) => (
        <div className="flex flex-col leading-tight">
          <span className="font-black text-slate-900 text-[13px] font-headline tracking-tighter uppercase">{v || '—'}</span>
          <span className="text-[10px] text-slate-400 font-bold tracking-tight mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined normal-case text-[12px] opacity-60">location_on</span>
            <span>{row.Lokasi || 'Belum ditentukan'}</span>
          </span>
        </div>
      )
    },
    {
      key: 'TanggalMulai',
      label: 'Jadwal Pelaksanaan',
      className: 'w-[240px]',
      render: (v, row) => {
        const start = v || row.tanggalMulai
        const end = row.TanggalSelesai || row.tanggalSelesai
        return (
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-700 text-[11px] font-headline">
              {start ? new Date(start).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
            </span>
            {end && (
              <span className="text-[9px] text-slate-400 font-black tracking-wider uppercase mt-0.5">
                s/d {new Date(end).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        )
      }
    },
    {
      key: 'Status',
      label: 'Status Agenda',
      className: 'w-[160px] text-center',
      cellClassName: 'text-center',
      render: (v) => {
        const cfg = STATUS_CFG[v] || { label: v, cls: 'bg-slate-100 text-slate-600', icon: 'info' }
        return (
          <div className="flex justify-center">
            <Badge className={cn('font-black text-[9px] tracking-wider uppercase px-2.5 py-1 border flex items-center gap-1 shadow-sm', cfg.cls)}>
              <span className="material-symbols-outlined normal-case text-[10px]">{cfg.icon}</span>
              <span>{cfg.label}</span>
            </Badge>
          </div>
        )
      }
    }
  ]

  const totalEvents = data.length
  const activeEvents = data.filter(e => (e.Status || e.status) === 'berlangsung').length
  const upcomingEvents = data.filter(e => (e.Status || e.status) === 'terjadwal').length
  const completedEvents = data.filter(e => (e.Status || e.status) === 'selesai').length

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
      <Toaster position="top-right" />

      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 md:p-10 shadow-sm border border-slate-200">
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, var(--theme-primary) 1px, transparent 1px), radial-gradient(circle at 80% 20%, var(--theme-primary) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ backgroundColor: 'var(--theme-secondary)' }} />
        <div className="absolute -bottom-16 right-36 w-64 h-64 rounded-full blur-2xl opacity-10" style={{ backgroundColor: 'var(--theme-surface)' }} />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-6 rounded-full" style={{ backgroundColor: 'var(--theme-secondary)' }} />
              <span className="text-[10px] font-black tracking-[0.25em] uppercase font-headline" style={{ color: 'var(--theme-secondary)' }}>
                Agenda & Kegiatan
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200 shadow-inner" style={{ color: 'var(--theme-primary)' }}>
                <span className="material-symbols-outlined normal-case" style={{ fontSize: '22px' }}>calendar_month</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none font-headline text-slate-900">
                Jadwal Kegiatan
              </h1>
            </div>
            <p className="text-slate-500 font-medium text-xs md:text-sm max-w-2xl leading-relaxed mt-2.5">
              Manajemen agenda operasional, sinkronisasi jadwal kegiatan, serta pemantauan jadwal program kerja rutin ormawa.
            </p>
          </div>

          <Button 
            onClick={handleOpenAdd} 
            className="h-12 px-6 rounded-2xl text-white hover:bg-opacity-90 font-black text-[10px] tracking-widest shadow-lg shadow-black/10 gap-2 w-full md:w-auto shrink-0 border border-transparent uppercase transition-all duration-150 active:scale-95"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <span className="material-symbols-outlined normal-case text-[16px] stroke-[3px]">add</span> Tambah Kegiatan Baru
          </Button>
        </div>
      </section>

      {/* ── Stats Overview ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50">
            <span className="material-symbols-outlined normal-case" style={{ fontSize: '24px' }}>calendar_month</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Total Kegiatan</p>
            <h3 className="text-2xl font-black text-slate-900 font-headline mt-0.5 leading-none">{totalEvents}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/50">
            <span className="material-symbols-outlined normal-case" style={{ fontSize: '24px' }}>pending</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Berlangsung</p>
            <h3 className="text-2xl font-black text-slate-900 font-headline mt-0.5 leading-none">{activeEvents}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100/50">
            <span className="material-symbols-outlined normal-case" style={{ fontSize: '24px' }}>schedule</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Terjadwal</p>
            <h3 className="text-2xl font-black text-slate-900 font-headline mt-0.5 leading-none">{upcomingEvents}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50">
            <span className="material-symbols-outlined normal-case" style={{ fontSize: '24px' }}>check_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Selesai</p>
            <h3 className="text-2xl font-black text-slate-900 font-headline mt-0.5 leading-none">{completedEvents}</h3>
          </div>
        </div>
      </div>

      {/* ── Content Area ───────────────────────────────────────────── */}
      <Card className="border border-[#e5e5e5] shadow-sm overflow-hidden bg-white rounded-3xl">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            searchPlaceholder="Cari nama atau lokasi kegiatan..."
            onAdd={handleOpenAdd}
            addLabel="Tambah Kegiatan"
            filters={[{ key: 'Status', placeholder: 'Filter Status', options: Object.entries(STATUS_CFG).map(([v, { label }]) => ({ label, value: v })) }]}
            actions={(row) => (
              <div className="flex items-center gap-2">
                <Button onClick={() => { setSelected(row); setIsDetailOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-xl"><span className="material-symbols-outlined normal-case text-[18px]">visibility</span></Button>
                <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-600 hover:bg-amber-50 rounded-xl"><span className="material-symbols-outlined normal-case text-[18px]">edit</span></Button>
                <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><span className="material-symbols-outlined normal-case text-[18px]">delete</span></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white">
          {selected && (
            <div className="flex flex-col">
              {/* Header */}
              <div 
                className="p-8 text-white relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, var(--theme-primary) 0%, color-mix(in srgb, var(--theme-primary) 70%, var(--theme-secondary) 30%) 100%)' }}
              >
                <div className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 10% 20%, white 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}
                />
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-2xl opacity-20" style={{ backgroundColor: 'var(--theme-secondary)' }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black tracking-[0.2em] uppercase font-headline" style={{ color: 'var(--theme-secondary)' }}>Detail Agenda</span>
                      <h2 className="text-xl md:text-2xl font-black text-white font-headline tracking-tight uppercase leading-snug">{selected.Judul}</h2>
                    </div>
                    <Badge className={cn('font-black text-[9px] tracking-wider uppercase px-2.5 py-1 border shrink-0 flex items-center gap-1 shadow-sm border-none', STATUS_CFG[selected.Status]?.cls || 'bg-slate-100 text-slate-600')}>
                      <span className="material-symbols-outlined normal-case text-[10px]">{STATUS_CFG[selected.Status]?.icon || 'info'}</span>
                      <span>{STATUS_CFG[selected.Status]?.label || 'Terjadwal'}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0 shadow-sm">
                      <span className="material-symbols-outlined normal-case" style={{ fontSize: '20px' }}>calendar_today</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-400 tracking-wider uppercase">Mulai Pelaksanaan</p>
                      <p className="text-xs font-black text-slate-800 font-headline mt-0.5">
                        {selected.TanggalMulai ? new Date(selected.TanggalMulai).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shrink-0 shadow-sm">
                      <span className="material-symbols-outlined normal-case" style={{ fontSize: '20px' }}>event_available</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-400 tracking-wider uppercase">Selesai Pelaksanaan</p>
                      <p className="text-xs font-black text-slate-800 font-headline mt-0.5">
                        {selected.TanggalSelesai ? new Date(selected.TanggalSelesai).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0 shadow-sm">
                      <span className="material-symbols-outlined normal-case" style={{ fontSize: '20px' }}>location_on</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-400 tracking-wider uppercase">Lokasi Kegiatan</p>
                      <p className="text-xs font-black text-slate-800 font-headline mt-0.5">
                        {selected.Lokasi || 'Belum ditentukan'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0 shadow-sm">
                      <span className="material-symbols-outlined normal-case" style={{ fontSize: '20px' }}>payments</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-400 tracking-wider uppercase">Estimasi Dana</p>
                      <p className="text-xs font-black text-emerald-600 font-headline mt-0.5">
                        {selected.EstimasiDana || selected.estimasi_dana ? formatRp(selected.EstimasiDana || selected.estimasi_dana) : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detail Fields Grid */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 space-y-4">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-headline">Informasi Detail Kegiatan</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Landasan Kegiatan</p>
                      <p className="font-bold text-slate-900">{selected.LandasanKegiatan || selected.landasan_kegiatan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Bentuk Kegiatan</p>
                      <p className="font-bold text-slate-900">{selected.BentukKegiatan || selected.bentuk_kegiatan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Mitra Kerja</p>
                      <p className="font-bold text-slate-900">{selected.Mitra || selected.mitra || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">PJ Kegiatan</p>
                      <p className="font-bold text-slate-900">{selected.PJKegiatan || selected.pj_kegiatan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Jadwal Pelaksanaan</p>
                      <p className="font-bold text-slate-900">{selected.JadwalPelaksanaan || selected.jadwal_pelaksanaan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sasaran Kegiatan</p>
                      <p className="font-bold text-slate-900">{selected.SasaranKegiatan || selected.sasaran_kegiatan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sumber Dana</p>
                      <p className="font-bold text-slate-900">{selected.SumberDana || selected.sumber_dana || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Indikator Keberhasilan</p>
                      <p className="font-bold text-slate-900">{selected.IndikatorKeberhasilan || selected.indikator_keberhasilan || "—"}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Latar Belakang</p>
                    <p className="font-medium leading-relaxed whitespace-pre-line">{selected.LatarBelakang || selected.latar_belakang || "—"}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tujuan Kegiatan</p>
                    <p className="font-medium leading-relaxed whitespace-pre-line">{selected.TujuanKegiatan || selected.tujuan_kegiatan || "—"}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Deskripsi Kegiatan</p>
                    <p className="font-medium leading-relaxed whitespace-pre-line">{selected.Deskripsi || selected.deskripsi || "—"}</p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 -mx-8 px-8 bg-slate-50/20">
                  <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="text-[10px] font-black text-slate-400 tracking-[0.15em] px-6 h-11 rounded-2xl hover:bg-slate-100 uppercase transition-all duration-150">
                    Tutup
                  </Button>
                  <Button onClick={() => { setIsDetailOpen(false); handleOpenEdit(selected) }} className="text-[10px] font-black tracking-[0.15em] h-11 px-8 rounded-2xl bg-[#00236F] hover:bg-[#001f60] text-white shadow-lg shadow-blue-900/10 uppercase transition-all duration-150 active:scale-95 flex items-center gap-1.5">
                    <span className="material-symbols-outlined normal-case text-[14px]">edit</span> Edit Agenda
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white">
          <DialogHeader className="p-8 pb-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <span className="material-symbols-outlined size-24 rotate-12">calendar_month</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-9 rounded-2xl bg-[#00236F]/10 flex items-center justify-center text-[#00236F] shadow-inner">
                  {isEditMode ? <span className="material-symbols-outlined normal-case text-[18px]">edit</span> : <span className="material-symbols-outlined normal-case text-[18px] stroke-[2px]">add</span>}
                </div>
                <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-[#00236F]/5 text-[#00236F] border-none uppercase">Event Registry</Badge>
              </div>
              <DialogTitle className="text-xl md:text-2xl font-black font-headline tracking-tight text-slate-900 leading-none">{isEditMode ? 'EDIT KEGIATAN' : 'JADWALKAN KEGIATAN'}</DialogTitle>
              <DialogDescription className="text-[10px] md:text-xs font-medium text-slate-400 mt-1.5">Tambahkan agenda dan jadwal pelaksanaan kegiatan resmi organisasi.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase">Nama Kegiatan</Label>
              <Input
                required
                value={form.Judul}
                onChange={e => setForm({ ...form, Judul: e.target.value })}
                placeholder="Contoh: Pekan Olahraga Mahasiswa..."
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all font-bold text-sm font-headline"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Landasan Kegiatan *</Label>
                <Input
                  required
                  value={form.LandasanKegiatan}
                  onChange={e => setForm({ ...form, LandasanKegiatan: e.target.value })}
                  placeholder="Contoh: Program Kerja Himpunan 2026..."
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Bentuk Kegiatan</Label>
                <Input
                  value={form.BentukKegiatan}
                  onChange={e => setForm({ ...form, BentukKegiatan: e.target.value })}
                  placeholder="Contoh: Kompetisi & Seminar..."
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Mitra **</Label>
                <Input
                  value={form.Mitra}
                  onChange={e => setForm({ ...form, Mitra: e.target.value })}
                  placeholder="Contoh: PT. Djarum, Pemda..."
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">PJ Kegiatan</Label>
                <Input
                  value={form.PJKegiatan}
                  onChange={e => setForm({ ...form, PJKegiatan: e.target.value })}
                  placeholder="Contoh: Budi Santoso (Ketua Panitia)..."
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Jadwal Pelaksanaan (Hari, Tanggal Bulan Tahun, Waktu)</Label>
                <Input
                  value={form.JadwalPelaksanaan}
                  onChange={e => setForm({ ...form, JadwalPelaksanaan: e.target.value })}
                  placeholder="Contoh: Senin, 15 Juli 2026, 09.00 - 15.00 WIB..."
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Sasaran Kegiatan</Label>
                <Input
                  value={form.SasaranKegiatan}
                  onChange={e => setForm({ ...form, SasaranKegiatan: e.target.value })}
                  placeholder="Contoh: Seluruh Mahasiswa Fakultas Teknik..."
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Sumber Dana</Label>
                <Input
                  value={form.SumberDana}
                  onChange={e => setForm({ ...form, SumberDana: e.target.value })}
                  placeholder="Contoh: Dana Kemahasiswaan & Sponsor..."
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Indikator Keberhasilan</Label>
                <Input
                  value={form.IndikatorKeberhasilan}
                  onChange={e => setForm({ ...form, IndikatorKeberhasilan: e.target.value })}
                  placeholder="Contoh: Target 200 Peserta Hadir..."
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Estimasi Dana (Rp)</Label>
                <Input
                  required
                  type="text"
                  value={formatRupiahInput(form.EstimasiDana)}
                  onChange={e => {
                    const rawVal = parseRupiahInput(e.target.value)
                    setForm({ ...form, EstimasiDana: rawVal })
                  }}
                  placeholder="Cth: 10.000.000"
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Status Agenda</Label>
                <select
                  value={form.Status}
                  onChange={e => setForm({ ...form, Status: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all"
                >
                  {Object.entries(STATUS_CFG).map(([v, { label }]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Tanggal Mulai</Label>
                <Input
                  required
                  type="date"
                  value={form.TanggalMulai}
                  onChange={e => setForm({ ...form, TanggalMulai: e.target.value })}
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all font-bold text-xs font-headline cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Tanggal Selesai</Label>
                <Input
                  type="date"
                  value={form.TanggalSelesai}
                  onChange={e => setForm({ ...form, TanggalSelesai: e.target.value })}
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all font-bold text-xs font-headline cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Lokasi Kegiatan</Label>
              <Input
                value={form.Lokasi}
                onChange={e => setForm({ ...form, Lokasi: e.target.value })}
                placeholder="Contoh: Gedung Rektorat Lt. 3..."
                className="h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all font-bold text-xs font-headline"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Latar Belakang</Label>
              <Textarea
                value={form.LatarBelakang}
                onChange={e => setForm({ ...form, LatarBelakang: e.target.value })}
                placeholder="Deskripsikan latar belakang pengajuan kegiatan..."
                className="min-h-[80px] rounded-2xl border-slate-200 bg-slate-50 focus:bg-white p-4 font-medium text-xs leading-relaxed font-headline"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Tujuan Kegiatan</Label>
              <Textarea
                value={form.TujuanKegiatan}
                onChange={e => setForm({ ...form, TujuanKegiatan: e.target.value })}
                placeholder="Deskripsikan tujuan dari kegiatan..."
                className="min-h-[80px] rounded-2xl border-slate-200 bg-slate-50 focus:bg-white p-4 font-medium text-xs leading-relaxed font-headline"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline uppercase font-bold">Deskripsi Detail Kegiatan</Label>
              <Textarea
                value={form.Deskripsi}
                onChange={e => setForm({ ...form, Deskripsi: e.target.value })}
                placeholder="Deskripsikan rincian detail/mekanisme kegiatan..."
                className="min-h-[80px] rounded-2xl border-slate-200 bg-slate-50 focus:bg-white p-4 font-medium text-xs leading-relaxed font-headline"
              />
            </div>

            <DialogFooter className="mt-6 pt-5 flex flex-col md:flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="w-full md:w-auto text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl uppercase transition-all duration-150">
                Batalkan
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-12 px-10 rounded-2xl bg-[#00236F] text-white hover:bg-[#001f60] shadow-xl shadow-blue-900/10 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5">
                {isSubmitting ? (
                  <span className="material-symbols-outlined normal-case animate-spin text-[16px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined normal-case text-[16px] stroke-[3px]">save</span>
                )}
                <span className="text-[10px] font-black tracking-[0.2em] uppercase">{isSubmitting ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Jadwalkan Agenda')}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Kegiatan?" description="Data kegiatan ini akan dihapus permanen dari jadwal." loading={isSubmitting} />
    </div>
  )
}

"use client"
import React, { useState, useEffect } from 'react';
import { PageContent, PageHeader } from '@/components/ui/page';
import { DataTable } from '@/components/ui/DataTable'



import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { SelectField, SelectOption } from '@/components/ui/SelectField'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Calendar } from '@/components/ui/Calendar'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import { getOrmawaId } from '../../utils/getOrmawaId'

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
  const [proposals, setProposals] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFilterDate, setSelectedFilterDate] = useState(null)
  const ormawaId = getOrmawaId()
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
      const [resEv, resProp, resAnn] = await Promise.all([
        fetchWithAuth(`${API}/events?ormawaId=${ormawaId}`),
        fetchWithAuth(`${API}/proposals?ormawaId=${ormawaId}`),
        fetchWithAuth(`${API}/announcements?ormawaId=${ormawaId}`)
      ])
      if (resEv.status === 'success') setData(resEv.data || [])
      if (resProp.status === 'success') setProposals(resProp.data || [])
      if (resAnn.status === 'success') setAnnouncements(resAnn.data || [])
    } catch {
      toast.error('Koneksi gagal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [ormawaId])

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

  const eventDates = React.useMemo(() => {
    const dates = [];
    data.forEach(d => {
      const dStr = d.TanggalMulai || d.tanggalMulai;
      if (dStr) dates.push(new Date(dStr));
    });
    proposals.forEach(p => {
      const pStr = p.TanggalKegiatan || p.tanggal_kegiatan || p.CreatedAt || p.created_at;
      if (pStr) dates.push(new Date(pStr));
    });
    announcements.forEach(a => {
      const aStr = a.TanggalMulai || a.CreatedAt || a.created_at || a.createdat;
      if (aStr) dates.push(new Date(aStr));
    });
    return dates;
  }, [data, proposals, announcements]);

  const modifiers = {
    event: eventDates,
  }

  const modifiersClassNames = {
    event: 'has-events after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-[var(--theme-primary)] after:rounded-full font-bold [&:not([data-selected-single=true])]:text-[var(--theme-primary)] [&:not([data-selected-single=true])]:bg-[var(--theme-primary)]/5',
  }

  const displayedData = React.useMemo(() => {
    if (!selectedFilterDate) return data;
    return data.filter(d => {
      const startStr = d.TanggalMulai || d.tanggalMulai;
      const endStr = d.TanggalSelesai || d.tanggalSelesai;

      if (!startStr || String(startStr).startsWith('0001')) return false;

      const start = new Date(startStr);
      const end = (endStr && !String(endStr).startsWith('0001')) ? new Date(endStr) : start;
      
      const target = new Date(selectedFilterDate);
      target.setHours(0, 0, 0, 0);
      
      const s = new Date(start);
      s.setHours(0, 0, 0, 0);
      
      const e = new Date(end);
      e.setHours(23, 59, 59, 999);
      
      return target >= s && target <= e;
    });
  }, [data, selectedFilterDate]);

  const selectedDateEvents = React.useMemo(() => {
    if (!selectedFilterDate) return [];
    
    const target = new Date(selectedFilterDate);
    target.setHours(0, 0, 0, 0);

    const isMatch = (startStr, endStr) => {
      if (!startStr || String(startStr).startsWith('0001')) return false;
      const s = new Date(startStr);
      s.setHours(0, 0, 0, 0);
      const e = (endStr && !String(endStr).startsWith('0001')) ? new Date(endStr) : new Date(s);
      e.setHours(23, 59, 59, 999);
      return target >= s && target <= e;
    };

    const evs = data.filter(d => isMatch(d.TanggalMulai || d.tanggalMulai, d.TanggalSelesai || d.tanggalSelesai)).map(d => ({ ...d, typeLabel: 'Kegiatan', typeCls: 'bg-blue-100 text-blue-700' }));
    const props = proposals.filter(p => isMatch(p.TanggalKegiatan || p.tanggal_kegiatan || p.CreatedAt || p.created_at, null)).map(p => ({ ...p, Judul: p.JudulKegiatan || p.judul_kegiatan || 'Proposal', typeLabel: 'Proposal', typeCls: 'bg-amber-100 text-amber-700' }));
    const anns = announcements.filter(a => isMatch(a.TanggalMulai || a.CreatedAt || a.created_at || a.createdat, a.TanggalSelesai)).map(a => ({ ...a, typeLabel: 'Pengumuman', typeCls: 'bg-emerald-100 text-emerald-700' }));

    return [...evs, ...props, ...anns];
  }, [data, proposals, announcements, selectedFilterDate]);

  return (
    <PageContent className="font-body">
      <Toaster position="top-right" />

            {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <PageHeader 
        title="Jadwal Kegiatan"
        subtitle="Manajemen agenda operasional, sinkronisasi jadwal kegiatan, serta pemantauan jadwal program kerja rutin ormawa."
        icon="groups"
        action={
          <Button
            onClick={handleOpenAdd}
            className="h-10 px-5 rounded-xl text-white hover:bg-opacity-90 font-bold text-[10px] tracking-widest gap-2 w-full md:w-auto shrink-0 border border-transparent uppercase transition-all duration-150 active:scale-95 shadow-lg"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <span className="material-symbols-outlined normal-case text-[16px] stroke-[3px]">add</span> Tambah Kegiatan Baru
          </Button>
        }
       
        breadcrumbs={[ { label: 'Dashboard', path: '/ormawa' }, { label: 'Jadwal Kegiatan', path: '#' } ]} 
      />

      {/* ── Stats Overview ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50">
            <span className="material-symbols-outlined normal-case" style={{ fontSize: '24px' }}>calendar_month</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Total Kegiatan</p>
            <h3 className="text-2xl font-black text-slate-900 font-headline mt-0.5 leading-none">{totalEvents}</h3>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/50">
            <span className="material-symbols-outlined normal-case" style={{ fontSize: '24px' }}>pending</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Berlangsung</p>
            <h3 className="text-2xl font-black text-slate-900 font-headline mt-0.5 leading-none">{activeEvents}</h3>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100/50">
            <span className="material-symbols-outlined normal-case" style={{ fontSize: '24px' }}>schedule</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Terjadwal</p>
            <h3 className="text-2xl font-black text-slate-900 font-headline mt-0.5 leading-none">{upcomingEvents}</h3>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-4">
        <Card className="xl:col-span-1 border border-border shadow-sm overflow-hidden bg-surface rounded-2xl h-fit">
          <CardHeader className="bg-slate-50/50 border-b border-border p-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black font-headline tracking-tight uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
              Kalender Kegiatan
            </CardTitle>
            {selectedFilterDate && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedFilterDate(null)} className="h-7 text-[10px] uppercase tracking-wider text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2 rounded-lg font-bold">
                Reset Filter
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-3 sm:p-4 flex flex-col items-center overflow-x-auto no-scrollbar w-full">
            <Calendar
              mode="single"
              selected={selectedFilterDate}
              onSelect={setSelectedFilterDate}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="mx-auto w-max rounded-xl border border-slate-100 shadow-sm p-4 bg-white"
            />
            {selectedFilterDate && (
              <div className="w-full mt-4 flex flex-col gap-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 border-b border-slate-100 pb-2 text-center">
                  Acara pada {new Date(selectedFilterDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                </h4>
                <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
                  {selectedDateEvents.length > 0 ? selectedDateEvents.map((d, idx) => (
                    <div key={idx} onClick={() => { if(d.typeLabel === 'Kegiatan') { setSelected(d); setIsDetailOpen(true); } }} className={cn("bg-slate-50 border border-slate-100 rounded-lg p-3 text-left transition-colors", d.typeLabel === 'Kegiatan' ? 'hover:bg-slate-100 cursor-pointer' : '')}>
                      <div className="flex items-center justify-between mb-1">
                        <Badge className={cn('text-[8px] px-1.5 py-0 uppercase border-none tracking-wider', d.typeCls)}>{d.typeLabel}</Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">{d.Judul || d.judul}</p>
                      {d.Lokasi && (
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">location_on</span>
                          {d.Lokasi || d.lokasi || 'Belum ditentukan'}
                        </p>
                      )}
                    </div>
                  )) : (
                    <p className="text-[10px] text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">Tidak ada agenda</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 border border-border shadow-sm overflow-hidden bg-surface rounded-2xl">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={displayedData}
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
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border border-border shadow-2xl rounded-2xl bg-surface animate-in zoom-in-95 duration-200">
          {selected && (
            <div className="flex flex-col">
              {/* Header */}
              <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined size-24 text-slate-800">calendar_today</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black tracking-[0.2em] uppercase font-headline text-slate-400">Detail Agenda</span>
                      <DialogTitle className="text-xl md:text-2xl font-black text-slate-955 font-headline tracking-tight uppercase leading-snug">{selected.Judul}</DialogTitle>
                    </div>
                    <Badge className={cn('font-black text-[9px] tracking-wider uppercase px-2.5 py-1 border shrink-0 flex items-center gap-1 shadow-sm border-none', STATUS_CFG[selected.Status]?.cls || 'bg-slate-50 text-slate-650')}>
                      <span className="material-symbols-outlined normal-case text-[10px]">{STATUS_CFG[selected.Status]?.icon || 'info'}</span>
                      <span>{STATUS_CFG[selected.Status]?.label || 'Terjadwal'}</span>
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              {/* Quick Info Grid */}
              <div className="p-8 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 shrink-0 shadow-sm">
                      <span className="material-symbols-outlined normal-case" style={{ fontSize: '20px' }}>calendar_today</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-450 tracking-wider uppercase">Mulai Pelaksanaan</p>
                      <p className="text-xs font-black text-slate-800 font-headline mt-0.5">
                        {selected.TanggalMulai ? new Date(selected.TanggalMulai).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 shrink-0 shadow-sm">
                      <span className="material-symbols-outlined normal-case" style={{ fontSize: '20px' }}>event_available</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-450 tracking-wider uppercase">Selesai Pelaksanaan</p>
                      <p className="text-xs font-black text-slate-800 font-headline mt-0.5">
                        {selected.TanggalSelesai ? new Date(selected.TanggalSelesai).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 shrink-0 shadow-sm">
                      <span className="material-symbols-outlined normal-case" style={{ fontSize: '20px' }}>location_on</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-450 tracking-wider uppercase">Lokasi Kegiatan</p>
                      <p className="text-xs font-black text-slate-800 font-headline mt-0.5">
                        {selected.Lokasi || 'Belum ditentukan'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-650 flex items-center justify-center border border-slate-200 shrink-0 shadow-sm">
                      <span className="material-symbols-outlined normal-case" style={{ fontSize: '20px' }}>payments</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-450 tracking-wider uppercase">Estimasi Dana</p>
                      <p className="text-xs font-black text-emerald-600 font-headline mt-0.5">
                        {selected.EstimasiDana || selected.estimasi_dana ? formatRp(selected.EstimasiDana || selected.estimasi_dana) : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detail Fields Grid */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest font-headline">Informasi Detail Kegiatan</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-500">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Landasan Kegiatan</p>
                      <p className="font-bold text-slate-700">{selected.LandasanKegiatan || selected.landasan_kegiatan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Bentuk Kegiatan</p>
                      <p className="font-bold text-slate-700">{selected.BentukKegiatan || selected.bentuk_kegiatan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Mitra Kerja</p>
                      <p className="font-bold text-slate-700">{selected.Mitra || selected.mitra || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">PJ Kegiatan</p>
                      <p className="font-bold text-slate-700">{selected.PJKegiatan || selected.pj_kegiatan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Jadwal Pelaksanaan</p>
                      <p className="font-bold text-slate-700">{selected.JadwalPelaksanaan || selected.jadwal_pelaksanaan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sasaran Kegiatan</p>
                      <p className="font-bold text-slate-700">{selected.SasaranKegiatan || selected.sasaran_kegiatan || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sumber Dana</p>
                      <p className="font-bold text-slate-700">{selected.SumberDana || selected.sumber_dana || "—"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Indikator Keberhasilan</p>
                      <p className="font-bold text-slate-700">{selected.IndikatorKeberhasilan || selected.indikator_keberhasilan || "—"}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Latar Belakang</p>
                    <p className="font-medium leading-relaxed whitespace-pre-line text-slate-700">{selected.LatarBelakang || selected.latar_belakang || "—"}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tujuan Kegiatan</p>
                    <p className="font-medium leading-relaxed whitespace-pre-line text-slate-700">{selected.TujuanKegiatan || selected.tujuan_kegiatan || "—"}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Deskripsi Kegiatan</p>
                    <p className="font-medium leading-relaxed whitespace-pre-line text-slate-700">{selected.Deskripsi || selected.deskripsi || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <DialogFooter className="p-8 pt-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
                <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="text-[10px] font-black text-slate-400 tracking-[0.15em] px-6 h-11 rounded-2xl hover:bg-slate-150 uppercase transition-all duration-150">
                  Tutup
                </Button>
                <Button onClick={() => { setIsDetailOpen(false); handleOpenEdit(selected) }} className="text-[10px] font-black tracking-[0.15em] h-11 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg active:scale-95 transition-all flex items-center gap-1.5 border-none">
                  <span className="material-symbols-outlined normal-case text-[14px]">edit</span> Edit Agenda
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border border-border shadow-2xl rounded-2xl bg-surface animate-in zoom-in-95 duration-200">
          <DialogHeader className="p-8 pb-5 bg-slate-50/50 border-b border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <span className="material-symbols-outlined size-24 rotate-12">calendar_month</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-650 shadow-inner">
                  {isEditMode ? <span className="material-symbols-outlined normal-case text-[18px]">edit</span> : <span className="material-symbols-outlined normal-case text-[18px] stroke-[2px]">add</span>}
                </div>
                <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-slate-200 text-slate-700 border-none uppercase">Event Registry</Badge>
              </div>
              <DialogTitle className="text-xl md:text-2xl font-black font-headline tracking-tight text-slate-900 leading-none">{isEditMode ? 'EDIT KEGIATAN' : 'JADWALKAN KEGIATAN'}</DialogTitle>
              <DialogDescription className="text-[10px] md:text-xs font-medium text-slate-400 mt-1.5">Tambahkan agenda dan jadwal pelaksanaan kegiatan resmi organisasi.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex flex-col">
            <div className="p-8 pt-5 space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase">Nama Kegiatan</Label>
              <Input
                required
                value={form.Judul}
                onChange={e => setForm({ ...form, Judul: e.target.value })}
                placeholder="Contoh: Pekan Olahraga Mahasiswa..."
                className="h-12 rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all font-bold text-sm font-headline"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Landasan Kegiatan *</Label>
                <Input
                  required
                  value={form.LandasanKegiatan}
                  onChange={e => setForm({ ...form, LandasanKegiatan: e.target.value })}
                  placeholder="Contoh: Program Kerja Himpunan 2026..."
                  className="h-11 rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Bentuk Kegiatan</Label>
                <Input
                  value={form.BentukKegiatan}
                  onChange={e => setForm({ ...form, BentukKegiatan: e.target.value })}
                  placeholder="Contoh: Kompetisi & Seminar..."
                  className="h-11 rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Mitra **</Label>
                <Input
                  value={form.Mitra}
                  onChange={e => setForm({ ...form, Mitra: e.target.value })}
                  placeholder="Contoh: PT. Djarum, Pemda..."
                  className="h-11 rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">PJ Kegiatan</Label>
                <Input
                  value={form.PJKegiatan}
                  onChange={e => setForm({ ...form, PJKegiatan: e.target.value })}
                  placeholder="Contoh: Budi Santoso (Ketua Panitia)..."
                  className="h-11 rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Jadwal Pelaksanaan (Hari, Tanggal Bulan Tahun, Waktu)</Label>
                <Input
                  value={form.JadwalPelaksanaan}
                  onChange={e => setForm({ ...form, JadwalPelaksanaan: e.target.value })}
                  placeholder="Contoh: Senin, 15 Juli 2026, 09.00 - 15.00 WIB..."
                  className="h-11 rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Sasaran Kegiatan</Label>
                <Input
                  value={form.SasaranKegiatan}
                  onChange={e => setForm({ ...form, SasaranKegiatan: e.target.value })}
                  placeholder="Contoh: Seluruh Mahasiswa Fakultas Teknik..."
                  className="h-11 rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Sumber Dana</Label>
                <Input
                  value={form.SumberDana}
                  onChange={e => setForm({ ...form, SumberDana: e.target.value })}
                  placeholder="Contoh: Dana Kemahasiswaan & Sponsor..."
                  className="h-11 rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Indikator Keberhasilan</Label>
                <Input
                  value={form.IndikatorKeberhasilan}
                  onChange={e => setForm({ ...form, IndikatorKeberhasilan: e.target.value })}
                  placeholder="Contoh: Target 200 Peserta Hadir..."
                  className="h-11 rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Estimasi Dana (Rp)</Label>
                <Input
                  required
                  type="text"
                  value={formatRupiahInput(form.EstimasiDana)}
                  onChange={e => {
                     const rawVal = parseRupiahInput(e.target.value)
                     setForm({ ...form, EstimasiDana: rawVal })
                  }}
                  placeholder="Cth: 10.000.000"
                  className="h-11 rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all font-bold text-xs font-headline"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Status Agenda</Label>
                <SelectField
                  value={form.Status}
                  onValueChange={val => setForm({ ...form, Status: val })}
                >
                  {Object.entries(STATUS_CFG).map(([v, { label }]) => (
                    <SelectOption key={v} value={v}>{label}</SelectOption>
                  ))}
                </SelectField>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Tanggal Mulai</Label>
                <Input
                  required
                  type="date"
                  value={form.TanggalMulai}
                  onChange={e => setForm({ ...form, TanggalMulai: e.target.value })}
                  className="h-11 rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all font-bold text-xs font-headline cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Tanggal Selesai</Label>
                <Input
                  type="date"
                  value={form.TanggalSelesai}
                  onChange={e => setForm({ ...form, TanggalSelesai: e.target.value })}
                  className="h-11 rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all font-bold text-xs font-headline cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Lokasi Kegiatan</Label>
              <Input
                value={form.Lokasi}
                onChange={e => setForm({ ...form, Lokasi: e.target.value })}
                placeholder="Contoh: Gedung Rektorat Lt. 3..."
                className="h-11 rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all font-bold text-xs font-headline"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Latar Belakang</Label>
              <Textarea
                value={form.LatarBelakang}
                onChange={e => setForm({ ...form, LatarBelakang: e.target.value })}
                placeholder="Deskripsikan latar belakang pengajuan kegiatan..."
                className="min-h-[80px] rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white p-4 font-medium text-xs leading-relaxed font-headline"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Tujuan Kegiatan</Label>
              <Textarea
                value={form.TujuanKegiatan}
                onChange={e => setForm({ ...form, TujuanKegiatan: e.target.value })}
                placeholder="Deskripsikan tujuan dari kegiatan..."
                className="min-h-[80px] rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white p-4 font-medium text-xs leading-relaxed font-headline"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline uppercase font-bold">Deskripsi Detail Kegiatan</Label>
              <Textarea
                value={form.Deskripsi}
                onChange={e => setForm({ ...form, Deskripsi: e.target.value })}
                placeholder="Deskripsikan rincian detail/mekanisme kegiatan..."
                className="min-h-[80px] rounded-2xl border-border bg-[var(--theme-bg)] focus:bg-white p-4 font-medium text-xs leading-relaxed font-headline"
              />
            </div>
            </div>

            <DialogFooter className="p-8 pt-5 flex flex-col md:flex-row items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/30">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="w-full md:w-auto text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl uppercase transition-all duration-150">
                Batalkan
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 border-none">
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
    </PageContent>
  )
}

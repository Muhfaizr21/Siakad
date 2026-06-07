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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../../services/api'

// Fallback Icons
const BrainCircuit = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>psychology</span>;

const getCleanImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const baseUrl = API_BASE_URL.replace('/api', '')
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function StudentAvatar({ src, name, className = "w-9 h-9 rounded-xl" }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const hasNoImage = !src || src.trim() === "" || src.endsWith("/profiles/") || src.endsWith("/students/") || src.endsWith("localhost:8000") || src.endsWith("localhost:8000/");

  return (
    <div className={cn("relative bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200/40 shadow-inner overflow-hidden", className)}>
      {(!loaded || error || hasNoImage) && (
        <span className="material-symbols-outlined text-slate-400/80 block select-none leading-none absolute animate-in fade-in" style={{ fontSize: className.includes('w-28') ? '56px' : className.includes('w-14') ? '28px' : '20px' }}>
          person
        </span>
      )}
      {!hasNoImage && !error && (
        <img
          src={src}
          alt={name}
          className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-200", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

const defaultSchedule = [
  { day: 'Senin', enabled: true, slots: [{ kategori: 'Personal', start: '09:00', end: '12:00', lokasi: 'Ruang Konseling A', kuota: 3 }, { kategori: 'Akademik', start: '13:00', end: '16:00', lokasi: 'Ruang Konseling A', kuota: 3 }] },
  { day: 'Selasa', enabled: true, slots: [{ kategori: 'Karir', start: '10:00', end: '15:00', lokasi: 'Ruang Konseling A', kuota: 4 }] },
  { day: 'Rabu', enabled: true, slots: [{ kategori: 'Personal', start: '09:00', end: '12:00', lokasi: 'Ruang Konseling B', kuota: 3 }] },
  { day: 'Kamis', enabled: false, slots: [] },
  { day: 'Jumat', enabled: true, slots: [{ kategori: 'Akademik', start: '08:00', end: '11:00', lokasi: 'Ruang Konseling A', kuota: 2 }] },
  { day: 'Sabtu', enabled: false, slots: [] },
  { day: 'Minggu', enabled: false, slots: [] },
];

const scheduleTypes = ['Personal', 'Akademik', 'Karir'];

const normalizeSchedule = (items) => {
  const byDay = new Map((items || []).map((item) => [item.day || item.Day, item]));

  return defaultSchedule.map((fallback) => {
    const source = byDay.get(fallback.day) || fallback;
    return {
      ...fallback,
      ...source,
      enabled: source.enabled ?? source.Enabled ?? fallback.enabled,
      slots: (source.slots || source.Slots || []).map((slot) => ({
        kategori: slot.kategori || slot.Kategori || 'Personal',
        start: slot.start || slot.JamMulai || '09:00',
        end: slot.end || slot.JamSelesai || '10:00',
        lokasi: slot.lokasi || slot.Lokasi || 'Ruang Konseling A',
        kuota: Number(slot.kuota || slot.Kuota || 1),
        is_available: slot.is_available ?? slot.IsAvailable ?? true,
      })),
    };
  });
};

const toMinutes = (value) => {
  const [hours, minutes] = String(value || '00:00').split(':').map(Number);
  return hours * 60 + minutes;
};

export default function PsychologistList() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ Nama: '', Email: '', Password: '' })
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Schedule Management States
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [scheduleData, setScheduleData] = useState([])
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [isSavingSchedule, setIsSavingSchedule] = useState(false)
  const [selectedDay, setSelectedDay] = useState('Senin')

  const [form, setForm] = useState({
    ID: '', Nama: '', Spesialisasi: 'Umum', Lokasi: '', IsAktif: true,
    Email: '', NoHP: '', Bio: '', Bahasa: '', FotoURL: ''
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const psRes = await adminService.getAllPsychologists()
      if (psRes.status === 'success') setData(psRes.data || [])
      else toast.error('Gagal memuat data psikolog')
    } catch (err) {
      console.error(err)
      toast.error('Koneksi sistem terputus / Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleOpenEdit = (row) => {
    setForm({
      ID: row.id || row.ID,
      Nama: row.nama || '',
      Spesialisasi: row.spesialisasi || 'Umum',
      Lokasi: row.lokasi || '',
      IsAktif: row.is_aktif ?? true,
      Email: row.email || '',
      NoHP: row.no_hp || '',
      Bio: row.bio || '',
      Bahasa: row.bahasa || '',
      FotoURL: row.foto_url || row.FotoURL || ''
    })
    setIsEditOpen(true)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        nama: form.Nama,
        spesialisasi: form.Spesialisasi,
        lokasi: form.Lokasi,
        is_aktif: form.IsAktif,
        email: form.Email,
        no_hp: form.NoHP,
        bio: form.Bio,
        bahasa: form.Bahasa,
        foto_url: form.FotoURL
      }
      const targetId = form.ID || form.id
      const res = await adminService.updatePsychologist(targetId, payload)
      if (res.status === 'success') {
        toast.success('Profil Psikolog diperbarui')
        setIsEditOpen(false)
        fetchData()
      } else {
        toast.error(res.message || 'Gagal menyimpan data')
      }
    } catch { toast.error('Terjadi kesalahan sistem') } finally { setIsSubmitting(false) }
  }

  const handleAdd = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        Role: 'psikolog',
        Nama: addForm.Nama,
        Email: addForm.Email,
        Password: addForm.Password
      }
      const res = await adminService.createUser(payload)
      if (res.status === 'success') {
        toast.success('Psikolog baru berhasil didaftarkan')
        setIsAddOpen(false)
        setAddForm({ Nama: '', Email: '', Password: '' })
        fetchData()
      } else {
        toast.error(res.message || 'Gagal mendaftarkan psikolog')
      }
    } catch (err) {
      toast.error(err?.message || 'Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deletePsychologist(selected.id || selected.ID)
      toast.success('Psikolog berhasil dihapus')
      setIsDelOpen(false)
      fetchData()
    } catch { toast.error('Gagal menghapus data') } finally { setIsSubmitting(false) }
  }

  // Schedule Management Handlers
  const handleOpenSchedule = async (row) => {
    setSelected(row)
    setIsScheduleOpen(true)
    setScheduleLoading(true)
    try {
      const res = await adminService.getPsychologistSchedules(row.id || row.ID)
      if (res.status === 'success') {
        setScheduleData(normalizeSchedule(res.data))
      } else {
        toast.error('Gagal memuat jadwal')
      }
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat jadwal')
    } finally {
      setScheduleLoading(false)
    }
  }

  const resetScheduleChanges = async () => {
    if (!selected) return;
    setScheduleLoading(true)
    try {
      const res = await adminService.getPsychologistSchedules(selected.id || selected.ID)
      if (res.status === 'success') {
        setScheduleData(normalizeSchedule(res.data))
        toast.success('Data jadwal dikembalikan')
      }
    } catch {
      toast.error('Gagal memuat ulang jadwal')
    } finally {
      setScheduleLoading(false)
    }
  }

  const toggleDay = (dayName) => {
    setScheduleData(prev => prev.map(d => d.day === dayName ? { ...d, enabled: !d.enabled } : d))
  }

  const addSlot = (dayName) => {
    setScheduleData(prev => prev.map(d => {
      if (d.day === dayName) {
        return {
          ...d,
          slots: [...d.slots, { kategori: 'Personal', start: '09:00', end: '10:00', lokasi: 'Ruang Konseling A', kuota: 1 }]
        }
      }
      return d
    }))
  }

  const removeSlot = (dayName, idx) => {
    setScheduleData(prev => prev.map(d => {
      if (d.day === dayName) {
        return {
          ...d,
          slots: d.slots.filter((_, i) => i !== idx)
        }
      }
      return d
    }))
  }

  const updateSlot = (dayName, idx, field, val) => {
    setScheduleData(prev => prev.map(d => {
      if (d.day === dayName) {
        const slots = [...d.slots]
        slots[idx] = { ...slots[idx], [field]: val }
        return { ...d, slots }
      }
      return d
    }))
  }

  const saveSchedule = async () => {
    // Validate time inputs
    let hasError = false;
    scheduleData.forEach((day) => {
      if (day.enabled) {
        day.slots.forEach((slot) => {
          if (toMinutes(slot.end) <= toMinutes(slot.start)) {
            hasError = true;
          }
        });
      }
    });

    if (hasError) {
      toast.error('Gagal menyimpan. Harap pastikan jam selesai diatur setelah jam mulai pada setiap slot.');
      return;
    }

    setIsSavingSchedule(true)
    try {
      const payload = scheduleData.map((d) => ({
        day: d.day,
        enabled: d.enabled,
        slots: d.slots.map((s) => ({
          kategori: s.kategori,
          start: s.start,
          end: s.end,
          lokasi: s.lokasi,
          kuota: Number(s.kuota),
        })),
      }))

      const res = await adminService.updatePsychologistSchedules(selected.id || selected.ID, payload)
      if (res.status === 'success') {
        toast.success('Jadwal praktik psikolog berhasil diperbarui')
        setIsScheduleOpen(false)
      } else {
        toast.error(res.message || 'Gagal memperbarui jadwal')
      }
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan sistem')
    } finally {
      setIsSavingSchedule(false)
    }
  }

  const currentDayData = scheduleData.find(d => d.day === selectedDay) || { enabled: false, slots: [] }

  const columns = [
    {
      key: 'nama',
      label: 'Nama Psikolog',
      className: 'w-[300px]',
      render: (v, row) => (
        <div className="flex items-center gap-4 py-2 group/avatar">
          <StudentAvatar
            src={getCleanImageUrl(row.FotoURL || row.foto_url)}
            name={v}
            className="w-11 h-11 rounded-xl border-2 border-white shadow-md transition-all group-hover/avatar:scale-110"
          />
          <div className="flex flex-col">
            <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px] leading-tight">
              {v ? v.toUpperCase() : '—'}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-neutral-400">
              <BrainCircuit size={10} className="text-bku-primary/60" />
              <span className="text-[10px] font-bold tracking-widest uppercase">{row.spesialisasi || 'Umum'}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Kontak',
      className: 'w-[250px]',
      render: (v, row) => (
        <div className="flex flex-col text-neutral-500 gap-0.5 font-jakarta">
          <span className="text-xs font-semibold text-neutral-800">{v || '—'}</span>
          <span className="text-[10px] font-medium text-neutral-400">{row.no_hp || '—'}</span>
        </div>
      )
    },
    {
      key: 'lokasi',
      label: 'Lokasi Praktik',
      className: 'w-[250px]',
      render: v => (
        <div className="flex items-center gap-2 text-neutral-500">
          <span className="material-symbols-outlined text-neutral-400" style={{ fontSize: '12px' }} >location_on</span>
          <span className="text-[12px] font-medium truncate font-jakarta" title={v}>{v || 'Klinik Kampus BKU'}</span>
        </div>
      )
    },
    {
      key: 'is_aktif',
      label: 'Status',
      className: 'w-[140px] text-center',
      cellClassName: 'text-center pr-4',
      render: v => (
        <Badge className={cn(
          'px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider shadow-none font-jakarta',
          v ? 'bg-success/10 text-success border-success/20' : 'bg-rose-50 text-rose-600 border-rose-100'
        )}>
          {v ? 'Aktif Tersedia' : 'Non-Aktif'}
        </Badge>
      )
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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Layanan Konseling Kampus</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                Direktori <span className="text-bku-primary italic font-semibold">Psikolog</span>
              </h1>
              <p className="text-neutral-500 font-medium text-xs md:text-sm max-w-2xl leading-relaxed">
                Manajemen data psikolog terdaftar, lokasi praktik, spesialisasi klinis, dan pengelolaan jadwal ketersediaan.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="px-4 py-2 bg-bku-primary/5 border border-bku-primary/20 rounded-xl flex items-center gap-3 w-full lg:w-auto justify-center">
                <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }}>verified_user</span>
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
              columns={columns}
              data={data}
              loading={loading}
              searchPlaceholder="Cari Nama atau Spesialisasi..."
              onAdd={() => {
                setAddForm({ Nama: '', Email: '', Password: '' })
                setIsAddOpen(true)
              }}
              addLabel="Tambah Psikolog"
              filters={[
                { key: 'Spesialisasi', placeholder: 'Pilih Bidang', options: [{ label: 'Psikolog Umum', value: 'Umum' }, { label: 'Klinis', value: 'Klinis' }, { label: 'Pendidikan', value: 'Pendidikan' }] }
              ]}
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => handleOpenSchedule(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-bku-primary hover:bg-bku-primary/10 rounded-lg transition-colors" title="Kelola Jadwal"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >calendar_month</span></Button>
                  <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Profil"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >edit</span></Button>
                  <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span></Button>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white animate-in slide-in-from-bottom-4 duration-300">
          <DialogHeader className="p-6 sm:p-8 pb-4 sm:pb-6 border-b border-neutral-100 relative overflow-hidden bg-neutral-50/50">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-bku-primary"><BrainCircuit size={100} /></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-bku-primary">Clinical Registry</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold font-jakarta tracking-tight text-neutral-900 uppercase">
                Edit Profil Psikolog
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm font-medium text-neutral-400">Pembaruan kualifikasi dan pengaturan operasional tenaga ahli.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-6 sm:p-8 pt-4 sm:pt-6 space-y-4 sm:space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Nama Lengkap & Gelar</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama psikolog..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta uppercase" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Spesialisasi Klinis</Label>
                <Input value={form.Spesialisasi} onChange={e => setForm({ ...form, Spesialisasi: e.target.value })} placeholder="Bidang keahlian..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Email</Label>
                <Input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="Email psikolog..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">No. HP / WhatsApp</Label>
                <Input value={form.NoHP} onChange={e => setForm({ ...form, NoHP: e.target.value })} placeholder="Contoh: 08123456789" className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Titik Lokasi Praktek</Label>
                <Input value={form.Lokasi} onChange={e => setForm({ ...form, Lokasi: e.target.value })} placeholder="Klinik / Ruang Konseling..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Bahasa Layanan</Label>
                <Input value={form.Bahasa} onChange={e => setForm({ ...form, Bahasa: e.target.value })} placeholder="Contoh: Indonesia, Inggris" className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Status Operasional</Label>
                <Select value={form.IsAktif ? "1" : "0"} onValueChange={v => setForm({ ...form, IsAktif: v === "1" })}>
                  <SelectTrigger className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 font-medium text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="1" className="text-xs font-medium uppercase">Aktif Tersedia</SelectItem>
                    <SelectItem value="0" className="text-xs font-medium uppercase text-rose-500">Non-Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Foto URL / Avatar</Label>
              <Input value={form.FotoURL} onChange={e => setForm({ ...form, FotoURL: e.target.value })} placeholder="https://example.com/foto.jpg atau path lokal..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Bio / Deskripsi Singkat</Label>
              <textarea value={form.Bio} onChange={e => setForm({ ...form, Bio: e.target.value })} placeholder="Tulis deskripsi keahlian, pengalaman, atau latar belakang akademis..." rows={3} className="w-full p-3 rounded-lg border border-neutral-200 bg-neutral-50/30 focus:bg-white text-sm font-medium font-jakarta outline-none focus:border-bku-primary focus:ring-4 focus:ring-bku-primary/10 transition-all resize-none" />
            </div>

            <div className="pt-6 flex flex-col-reverse sm:flex-row gap-3 border-t border-neutral-100">
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="w-full sm:w-auto h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-400">Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:flex-1 h-12 rounded-xl bg-neutral-900 text-white hover:bg-bku-primary shadow-md transition-all active:scale-95 flex items-center justify-center">
                {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} >save</span>}
                <span className="text-xs font-bold uppercase tracking-widest">Update Profil</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Add Modal ───────────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white animate-in slide-in-from-bottom-4 duration-300">
          <DialogHeader className="p-6 sm:p-8 pb-4 sm:pb-6 border-b border-neutral-100 relative overflow-hidden bg-neutral-50/50">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-bku-primary"><BrainCircuit size={100} /></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >add_circle</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-bku-primary">Registry System</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold font-jakarta tracking-tight text-neutral-900 uppercase">
                Tambah Psikolog Baru
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm font-medium text-neutral-400">Registrasi akun baru untuk psikolog.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleAdd} className="p-6 sm:p-8 pt-4 sm:pt-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Nama Lengkap & Gelar</Label>
              <Input required value={addForm.Nama} onChange={e => setAddForm({ ...addForm, Nama: e.target.value })} placeholder="Contoh: Budi Santoso, M.Psi." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta uppercase" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Email</Label>
              <Input type="email" required value={addForm.Email} onChange={e => setAddForm({ ...addForm, Email: e.target.value })} placeholder="Contoh: psikolog.budi@bku.ac.id" className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Password</Label>
              <Input type="password" required value={addForm.Password} onChange={e => setAddForm({ ...addForm, Password: e.target.value })} placeholder="Password..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
            </div>

            <div className="pt-6 flex flex-col-reverse sm:flex-row gap-3 border-t border-neutral-100">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="w-full sm:w-auto h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-400">Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:flex-1 h-12 rounded-xl bg-bku-primary text-white hover:bg-bku-primary/90 shadow-md transition-all active:scale-95 flex items-center justify-center border-none">
                {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} >save</span>}
                <span className="text-xs font-bold uppercase tracking-widest">Daftarkan Akun</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Data Psikolog?"
        description="Profil profesional dan seluruh riwayat praktik psikolog ini akan dihapus permanen dari sistem."
        loading={isSubmitting}
      />

      {/* ── Schedule Management Modal ────────────────────────────── */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white animate-in slide-in-from-bottom-4 duration-300">
          <DialogHeader className="p-6 border-b border-neutral-100 relative overflow-hidden bg-neutral-50/50">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-bku-primary"><span className="material-symbols-outlined text-[100px]">calendar_month</span></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >calendar_month</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-bku-primary">Jadwal Praktik</span>
                </div>
                <DialogTitle className="text-xl font-bold font-jakarta tracking-tight text-neutral-900 uppercase">
                  Kelola Jadwal: {selected?.nama}
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-neutral-400">Atur ketersediaan slot konseling mingguan untuk psikolog.</DialogDescription>
              </div>
              <div className="flex items-center gap-2 md:pr-12">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetScheduleChanges}
                  disabled={isSavingSchedule || scheduleLoading}
                  className="h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-bku-primary hover:bg-slate-50 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined mr-1.5" style={{ fontSize: '14px' }}>history</span>
                  Reset
                </Button>
                <Button
                  type="button"
                  onClick={saveSchedule}
                  disabled={isSavingSchedule || scheduleLoading}
                  className="h-10 rounded-xl bg-bku-primary hover:bg-bku-primary/90 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center px-4 border-none shadow-md shadow-bku-primary/10 hover:shadow-bku-primary/20 transition-all"
                >
                  {isSavingSchedule ? <span className="material-symbols-outlined animate-spin mr-1.5" style={{ fontSize: '14px' }}>sync</span> : <span className="material-symbols-outlined mr-1.5" style={{ fontSize: '14px' }}>save</span>}
                  {isSavingSchedule ? 'Menyimpan...' : 'Simpan Jadwal'}
                </Button>
              </div>
            </div>
          </DialogHeader>

          {scheduleLoading ? (
            <div className="h-[450px] flex items-center justify-center flex-col gap-3 bg-white">
              <span className="material-symbols-outlined animate-spin text-bku-primary" style={{ fontSize: '40px' }}>sync</span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Memuat Jadwal...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 h-[480px] bg-white">
              {/* Day Selector Aside */}
              <aside className="md:col-span-3 border-r border-neutral-100 p-4 bg-slate-50/30 overflow-y-auto space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block px-2 mb-2">Pilih Hari</span>
                {scheduleData.map((item) => {
                  const isSelected = selectedDay === item.day;
                  return (
                    <button
                      key={item.day}
                      type="button"
                      onClick={() => setSelectedDay(item.day)}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left transition-all duration-200 relative overflow-hidden flex flex-col gap-1.5",
                        isSelected
                          ? "border-bku-primary bg-bku-primary/10 text-bku-primary shadow-sm"
                          : "border-neutral-200/60 bg-white text-neutral-600 hover:border-bku-primary/30"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold uppercase font-jakarta">{item.day}</span>
                        <span className={cn("size-2 rounded-full", item.enabled ? "bg-emerald-500" : "bg-neutral-300")} />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                        {item.enabled ? `${item.slots?.length || 0} slot aktif` : 'Tidak Aktif'}
                      </span>
                    </button>
                  );
                })}
              </aside>

              {/* Slot Editor Area */}
              <section className="md:col-span-9 p-6 overflow-y-auto h-full">
                {currentDayData.enabled ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900 font-jakarta flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }}>schedule</span>
                          Slot Hari {selectedDay}
                        </h3>
                        <p className="text-[10px] font-medium text-neutral-400">Tentukan jam mulai, selesai, jenis layanan, lokasi, dan kuota.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => toggleDay(selectedDay)}
                          className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest text-rose-600 border-rose-100 hover:bg-rose-50 hover:text-rose-700"
                        >
                          Nonaktifkan Hari
                        </Button>
                        <Button
                          type="button"
                          onClick={() => addSlot(selectedDay)}
                          className="h-8 rounded-lg bg-bku-primary/10 text-bku-primary hover:bg-bku-primary hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center px-3 border border-bku-primary/20"
                        >
                          <span className="material-symbols-outlined mr-1" style={{ fontSize: '12px' }}>add</span>
                          Tambah Slot
                        </Button>
                      </div>
                    </div>

                    {currentDayData.slots.length === 0 ? (
                      <div className="h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl bg-slate-50/50 text-center p-6">
                        <span className="material-symbols-outlined text-neutral-300 mb-2" style={{ fontSize: '32px' }}>schedule</span>
                        <h4 className="text-xs font-bold uppercase tracking-tight text-neutral-800">Belum Ada Slot Waktu</h4>
                        <p className="text-[11px] text-neutral-400 mt-1 max-w-xs">Tambahkan slot waktu praktik agar mahasiswa dapat memilih hari ini.</p>
                        <Button
                          type="button"
                          onClick={() => addSlot(selectedDay)}
                          className="mt-4 h-9 bg-bku-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-widest"
                        >
                          Tambah Slot Pertama
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentDayData.slots.map((slot, index) => {
                          const invalidTime = toMinutes(slot.end) <= toMinutes(slot.start);
                          return (
                            <div key={index} className={cn("border rounded-xl p-4 bg-slate-50/30 transition-all hover:bg-white hover:shadow-sm", invalidTime ? "border-amber-200 bg-amber-50/20" : "border-neutral-200/60")}>
                              <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full">
                                  <div className="space-y-1">
                                    <Label className="text-[9px] font-bold text-neutral-400 uppercase">Mulai</Label>
                                    <Input
                                      type="time"
                                      value={slot.start}
                                      onChange={(e) => updateSlot(selectedDay, index, 'start', e.target.value)}
                                      className="h-9 rounded-lg border-neutral-200 text-xs font-bold"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[9px] font-bold text-neutral-400 uppercase">Selesai</Label>
                                    <Input
                                      type="time"
                                      value={slot.end}
                                      onChange={(e) => updateSlot(selectedDay, index, 'end', e.target.value)}
                                      className="h-9 rounded-lg border-neutral-200 text-xs font-bold"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[9px] font-bold text-neutral-400 uppercase">Jenis</Label>
                                    <Select value={slot.kategori} onValueChange={(val) => updateSlot(selectedDay, index, 'kategori', val)}>
                                      <SelectTrigger className="h-9 rounded-lg border-neutral-200 text-xs font-bold"><SelectValue /></SelectTrigger>
                                      <SelectContent className="rounded-lg shadow-lg">
                                        {scheduleTypes.map((type) => (
                                          <SelectItem key={type} value={type} className="text-xs font-semibold">{type}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[9px] font-bold text-neutral-400 uppercase">Lokasi</Label>
                                    <Input
                                      value={slot.lokasi}
                                      placeholder="Lokasi..."
                                      onChange={(e) => updateSlot(selectedDay, index, 'lokasi', e.target.value)}
                                      className="h-9 rounded-lg border-neutral-200 text-xs font-bold"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[9px] font-bold text-neutral-400 uppercase">Kuota</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={slot.kuota}
                                      onChange={(e) => updateSlot(selectedDay, index, 'kuota', parseInt(e.target.value) || 1)}
                                      className="h-9 rounded-lg border-neutral-200 text-xs font-bold"
                                    />
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => removeSlot(selectedDay, index)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                                </Button>
                              </div>
                              {invalidTime && (
                                <p className="mt-2 text-[9px] font-black uppercase tracking-wider text-amber-700">Jam selesai harus setelah jam mulai.</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-neutral-300 mb-4 border border-neutral-100">
                      <span className="material-symbols-outlined text-[32px]">dark_mode</span>
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-tight text-neutral-800">Hari Ini Tidak Aktif</h3>
                    <p className="text-[11px] text-neutral-400 mt-1 max-w-xs leading-normal">
                      Psikolog tidak akan menerima pendaftaran sesi konseling pada hari {selectedDay}. Aktifkan hari ini jika ingin membuka slot praktek.
                    </p>
                    <Button
                      type="button"
                      onClick={() => toggleDay(selectedDay)}
                      className="mt-5 h-9 bg-bku-primary hover:bg-bku-primary/90 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest"
                    >
                      Aktifkan Hari {selectedDay}
                    </Button>
                  </div>
                )}
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

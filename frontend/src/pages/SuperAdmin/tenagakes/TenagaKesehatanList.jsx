"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DialogModal, ModalCancelButton, ModalSaveButton } from '@/components/ui/DialogModal'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { SelectField, SelectOption } from '@/components/ui/SelectField'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../../services/api'
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'

// Fallback Icons
const MedicalServices = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>medical_services</span>;

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
          onLive={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

const SERVICE_TYPES = [
  'Pemeriksaan Umum',
  'Konsultasi Gizi',
  'Screening Khusus',
  'Pemeriksaan Gigi',
  'Rujukan Eksternal',
  'Lainnya'
];

const REPEAT_DAYS_OPTIONS = [
  { label: 'Senin', value: 'Monday' },
  { label: 'Selasa', value: 'Tuesday' },
  { label: 'Rabu', value: 'Wednesday' },
  { label: 'Kamis', value: 'Thursday' },
  { label: 'Jumat', value: 'Friday' },
  { label: 'Sabtu', value: 'Saturday' },
  { label: 'Minggu', value: 'Sunday' }
];

export default function TenagaKesehatanList() {
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
  const [showScheduleAddForm, setShowScheduleAddForm] = useState(false)
  const [editingScheduleSlot, setEditingScheduleSlot] = useState(null)
  const [scheduleForm, setScheduleForm] = useState({
    tanggal: '',
    jam_mulai: '08:00',
    jam_selesai: '12:00',
    kuota: 10,
    lokasi: 'Klinik Kampus BKU',
    tipe_layanan: 'Pemeriksaan Umum',
    catatan: '',
    is_repeat: false,
    repeat_days: []
  })

  const [form, setForm] = useState({
    ID: '', Nama: '', Spesialisasi: 'Pemeriksaan Umum', Lokasi: 'Klinik Kampus BKU', IsAktif: true,
    Email: '', NoHP: '', FotoURL: ''
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const tkRes = await adminService.getAllTenagaKesehatan()
      if (tkRes.status === 'success') setData(tkRes.data || [])
      else toast.error('Gagal memuat data tenaga kesehatan')
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
      Spesialisasi: row.spesialisasi || 'Pemeriksaan Umum',
      Lokasi: row.lokasi || 'Klinik Kampus BKU',
      IsAktif: row.is_aktif ?? true,
      Email: row.email || '',
      NoHP: row.no_hp || '',
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
        foto_url: form.FotoURL
      }
      const targetId = form.ID || form.id
      const res = await adminService.updateTenagaKesehatan(targetId, payload)
      if (res.status === 'success') {
        toast.success('Profil Tenaga Medis diperbarui')
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
        Role: 'tenaga_kesehatan',
        Nama: addForm.Nama,
        Email: addForm.Email,
        Password: addForm.Password
      }
      const res = await adminService.createUser(payload)
      if (res.status === 'success') {
        toast.success('Tenaga Medis baru berhasil didaftarkan')
        setIsAddOpen(false)
        setAddForm({ Nama: '', Email: '', Password: '' })
        fetchData()
      } else {
        toast.error(res.message || 'Gagal mendaftarkan tenaga medis')
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
      await adminService.deleteTenagaKesehatan(selected.id || selected.ID)
      toast.success('Tenaga Medis berhasil dihapus')
      setIsDelOpen(false)
      fetchData()
    } catch { toast.error('Gagal menghapus data') } finally { setIsSubmitting(false) }
  }

  // Schedule Management Handlers
  const handleOpenSchedule = async (row) => {
    setSelected(row)
    setIsScheduleOpen(true)
    setScheduleLoading(true)
    setShowScheduleAddForm(false)
    setEditingScheduleSlot(null)
    try {
      const res = await adminService.getTenagaKesehatanSchedules(row.id || row.ID)
      if (res.status === 'success') {
        setScheduleData(res.data || [])
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

  const loadSchedules = async (tkId) => {
    setScheduleLoading(true)
    try {
      const res = await adminService.getTenagaKesehatanSchedules(tkId)
      if (res.status === 'success') {
        setScheduleData(res.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setScheduleLoading(false)
    }
  }

  const handleOpenAddScheduleSlot = () => {
    setEditingScheduleSlot(null)
    setScheduleForm({
      tanggal: new Date().toISOString().split('T')[0],
      jam_mulai: '08:00',
      jam_selesai: '12:00',
      kuota: 10,
      lokasi: selected?.lokasi || 'Klinik Kampus BKU',
      tipe_layanan: 'Pemeriksaan Umum',
      catatan: '',
      is_repeat: false,
      repeat_days: []
    })
    setShowScheduleAddForm(true)
  }

  const handleOpenEditScheduleSlot = (slot) => {
    setEditingScheduleSlot(slot)
    const rawDate = slot.tanggal ? slot.tanggal.split('T')[0] : ''
    setScheduleForm({
      tanggal: rawDate,
      jam_mulai: slot.jam_mulai || '08:00',
      jam_selesai: slot.jam_selesai || '12:00',
      kuota: slot.kuota || 10,
      lokasi: slot.lokasi || 'Klinik Kampus BKU',
      tipe_layanan: slot.tipe_layanan || 'Pemeriksaan Umum',
      catatan: slot.catatan || '',
      is_repeat: slot.is_repeat || false,
      repeat_days: slot.repeat_days ? slot.repeat_days.split(',') : []
    })
    setShowScheduleAddForm(true)
  }

  const handleToggleRepeatDay = (dayValue) => {
    setScheduleForm(prev => {
      const repeat_days = prev.repeat_days.includes(dayValue)
        ? prev.repeat_days.filter(d => d !== dayValue)
        : [...prev.repeat_days, dayValue]
      return { ...prev, repeat_days }
    })
  }

  const handleSaveScheduleSlot = async (e) => {
    e.preventDefault()
    if (!scheduleForm.tanggal) {
      toast.error('Harap pilih tanggal.')
      return
    }
    if (scheduleForm.jam_selesai <= scheduleForm.jam_mulai) {
      toast.error('Jam selesai harus setelah jam mulai.')
      return
    }

    const payload = {
      tanggal: scheduleForm.tanggal,
      jam_mulai: scheduleForm.jam_mulai,
      jam_selesai: scheduleForm.jam_selesai,
      kuota: Number(scheduleForm.kuota),
      lokasi: scheduleForm.lokasi,
      tipe_layanan: scheduleForm.tipe_layanan,
      catatan: scheduleForm.catatan,
      is_repeat: scheduleForm.is_repeat,
      repeat_days: scheduleForm.is_repeat ? scheduleForm.repeat_days.join(',') : ''
    }

    setIsSavingSchedule(true)
    try {
      const tkId = selected.id || selected.ID
      if (editingScheduleSlot) {
        await adminService.updateTenagaKesehatanSchedule(editingScheduleSlot.id, payload)
        toast.success('Slot jadwal diperbarui')
      } else {
        await adminService.createTenagaKesehatanSchedule(tkId, payload)
        toast.success('Slot jadwal baru dibuat')
      }
      setShowScheduleAddForm(false)
      loadSchedules(tkId)
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan slot jadwal')
    } finally {
      setIsSavingSchedule(false)
    }
  }

  const handleDeleteScheduleSlot = async (slotId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus slot jadwal ini?')) return
    try {
      await adminService.deleteTenagaKesehatanSchedule(slotId)
      toast.success('Slot jadwal berhasil dihapus')
      loadSchedules(selected.id || selected.ID)
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus slot jadwal')
    }
  }

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '-'
    const cleanStr = dateStr.split('T')[0]
    const date = new Date(cleanStr)
    if (isNaN(date)) return cleanStr
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const columns = [
    {
      key: 'nama',
      label: 'Nama Tenaga Medis',
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
              {v ? v.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) : '—'}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-neutral-400">
              <MedicalServices size={10} className="text-bku-primary/60" />
              <span className="text-[10px] font-bold tracking-widest uppercase">{row.spesialisasi || 'Tenaga Medis'}</span>
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
      label: 'Lokasi Pemeriksaan',
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
          {v ? 'Aktif Tugas' : 'Non-Aktif'}
        </Badge>
      )
    }
  ]

  return (
    <PageContent>
      <Toaster position="top-right" />

      <DashboardHero
        title="Direktori"
        highlightedTitle="Tenaga Medis"
        subtitle="Manajemen data dokter, perawat, bidang keahlian spesialisasi, lokasi klinik, serta pengelolaan jadwal operasional."
        icon="verified_user"
        badges={[{ label: 'Klinik Kesehatan Kampus', active: false }]}
        actions={
          <div className="px-4 py-2 bg-bku-primary/5 border border-bku-primary/20 rounded-xl flex items-center gap-3 w-full lg:w-auto justify-center">
            <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }}>verified_user</span>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold text-bku-primary/70 uppercase tracking-widest">Akses Validasi</span>
              <span className="text-[12px] font-bold text-bku-primary font-jakarta">Super Admin Portal</span>
            </div>
          </div>
        }
      />

      {/* ── Table Section ────────────────────────────────────────── */}
      <Card className="glass-card shadow-sm rounded-xl overflow-hidden">
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
            addLabel="Tambah Tenaga Medis"
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

      {/* ── Edit Modal ───────────────────────────────────────────── */}
      <DialogModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Profil Tenaga Medis"
        description="Pembaruan kualifikasi dan pengaturan operasional tenaga medis klinik."
        icon="edit"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave}>
          <div className="p-6 md:p-8 space-y-5 max-h-[50vh] overflow-y-auto no-scrollbar font-jakarta">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Nama Lengkap & Gelar</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama lengkap..." className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-800 focus:border-bku-primary font-jakarta uppercase" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Spesialisasi / Jabatan</Label>
                <Input value={form.Spesialisasi} onChange={e => setForm({ ...form, Spesialisasi: e.target.value })} placeholder="Contoh: Dokter Umum, Perawat..." className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-800 focus:border-bku-primary font-jakarta" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Email</Label>
                <Input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="Email dinas..." className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-800 focus:border-bku-primary font-jakarta" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">No. HP / WhatsApp</Label>
                <Input value={form.NoHP} onChange={e => setForm({ ...form, NoHP: e.target.value })} placeholder="Contoh: 08123456789" className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-800 focus:border-bku-primary font-jakarta" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Lokasi Pemeriksaan</Label>
                <Input value={form.Lokasi} onChange={e => setForm({ ...form, Lokasi: e.target.value })} placeholder="Klinik / Ruang..." className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-800 focus:border-bku-primary font-jakarta" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Status Operasional</Label>
                <SelectField
                  value={form.IsAktif ? "1" : "0"}
                  onValueChange={v => setForm({ ...form, IsAktif: v === "1" })}
                  className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/30 font-semibold text-sm text-slate-800 focus:border-bku-primary"
                >
                  <SelectOption value="1">Aktif Tugas</SelectOption>
                  <SelectOption value="0">Non-Aktif</SelectOption>
                </SelectField>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Foto URL / Avatar</Label>
              <Input value={form.FotoURL} onChange={e => setForm({ ...form, FotoURL: e.target.value })} placeholder="https://example.com/foto.jpg..." className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-800 focus:border-bku-primary font-jakarta" />
            </div>
          </div>

          <div className="flex gap-3 justify-end p-6 bg-slate-50 border-t border-slate-200">
            <ModalCancelButton onClick={() => setIsEditOpen(false)} />
            <ModalSaveButton isSubmitting={isSubmitting} text="Update Profil" />
          </div>
        </form>
      </DialogModal>

      {/* ── Add Modal ───────────────────────────────────────────── */}
      <DialogModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Tenaga Medis Baru"
        description="Registrasi akun baru untuk dokter atau perawat."
        icon="add_circle"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAdd}>
          <div className="p-6 md:p-8 space-y-5 max-h-[50vh] overflow-y-auto no-scrollbar font-jakarta">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Nama Lengkap & Gelar</Label>
              <Input required value={addForm.Nama} onChange={e => setAddForm({ ...addForm, Nama: e.target.value })} placeholder="Contoh: dr. Ahmad Fauzi" className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-800 focus:border-bku-primary font-jakarta uppercase" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Email</Label>
              <Input type="email" required value={addForm.Email} onChange={e => setAddForm({ ...addForm, Email: e.target.value })} placeholder="Contoh: medis.ahmad@bku.ac.id" className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-800 focus:border-bku-primary font-jakarta" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Password</Label>
              <Input type="password" required value={addForm.Password} onChange={e => setAddForm({ ...addForm, Password: e.target.value })} placeholder="Password..." className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-800 focus:border-bku-primary font-jakarta" />
            </div>
          </div>

          <div className="flex gap-3 justify-end p-6 bg-slate-50 border-t border-slate-200">
            <ModalCancelButton onClick={() => setIsAddOpen(false)} />
            <ModalSaveButton isSubmitting={isSubmitting} text="Daftarkan Akun" icon="add" />
          </div>
        </form>
      </DialogModal>

      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Data Tenaga Medis?"
        description="Profil dan seluruh rekam praktik tenaga medis ini akan dihapus permanen dari sistem."
        loading={isSubmitting}
      />

      {/* ── Schedule Management Modal ────────────────────────────── */}
      <DialogModal
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        title="Kelola Jadwal Praktik"
        description={`Tenaga Medis: ${selected?.nama || '-'}`}
        icon="calendar_month"
        maxWidth="max-w-4xl"
        bodyClassName="p-0 font-jakarta overflow-hidden bg-white"
        footer={
          <div className="flex justify-end w-full gap-3">
            <ModalCancelButton onClick={() => setIsScheduleOpen(false)}>Tutup Panel</ModalCancelButton>
          </div>
        }
      >
        <div className="flex flex-col h-full max-h-[75vh]">
          <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Slot Praktik</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Kelola hari dan jam layanan medis</p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddScheduleSlot}
              className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-bold text-xs uppercase tracking-widest h-10 px-5 rounded-xl flex items-center gap-2 shadow-sm border-none cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Tambah Slot</span>
            </button>
          </div>

          <div className="p-6 md:p-8 overflow-y-auto no-scrollbar space-y-6 flex-1">
            {showScheduleAddForm && (
              <form onSubmit={handleSaveScheduleSlot} className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-200 font-jakarta">
                <div className="text-xs font-bold text-bku-primary uppercase tracking-wider mb-2">
                  {editingScheduleSlot ? 'Edit Slot Jadwal' : 'Buat Slot Jadwal Baru'}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#737373]">Tanggal Praktik</Label>
                    <input
                      type="date"
                      required
                      value={scheduleForm.tanggal}
                      onChange={e => setScheduleForm(prev => ({ ...prev, tanggal: e.target.value }))}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#737373]">Jam Mulai</Label>
                    <input
                      type="time"
                      required
                      value={scheduleForm.jam_mulai}
                      onChange={e => setScheduleForm(prev => ({ ...prev, jam_mulai: e.target.value }))}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#737373]">Jam Selesai</Label>
                    <input
                      type="time"
                      required
                      value={scheduleForm.jam_selesai}
                      onChange={e => setScheduleForm(prev => ({ ...prev, jam_selesai: e.target.value }))}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#737373]">Tipe Layanan</Label>
                    <SelectField
                      value={scheduleForm.tipe_layanan}
                      onValueChange={val => setScheduleForm(prev => ({ ...prev, tipe_layanan: val }))}
                      className="w-full h-10"
                    >
                      {SERVICE_TYPES.map(type => (
                        <SelectOption key={type} value={type}>{type}</SelectOption>
                      ))}
                    </SelectField>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#737373]">Kuota Pasien</Label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={scheduleForm.kuota}
                      onChange={e => setScheduleForm(prev => ({ ...prev, kuota: e.target.value }))}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#737373]">Lokasi Pemeriksaan</Label>
                    <input
                      type="text"
                      required
                      value={scheduleForm.lokasi}
                      onChange={e => setScheduleForm(prev => ({ ...prev, lokasi: e.target.value }))}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-bku-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-[#737373]">Catatan / Keterangan</Label>
                  <input
                    type="text"
                    value={scheduleForm.catatan}
                    onChange={e => setScheduleForm(prev => ({ ...prev, catatan: e.target.value }))}
                    placeholder="Bawa KTM..."
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-bku-primary"
                  />
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={scheduleForm.is_repeat}
                      onChange={e => setScheduleForm(prev => ({ ...prev, is_repeat: e.target.checked }))}
                      className="rounded text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] size-4 border-slate-300"
                    />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Ulangi Jadwal Tiap Minggu</span>
                  </label>

                  {scheduleForm.is_repeat && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pilih Hari Berulang</label>
                      <div className="flex flex-wrap gap-2">
                        {REPEAT_DAYS_OPTIONS.map((day) => {
                          const active = scheduleForm.repeat_days.includes(day.value);
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => handleToggleRepeatDay(day.value)}
                              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${active
                                ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-bku-primary/30'
                                }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-slate-200/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowScheduleAddForm(false)}
                    className="h-9 px-4 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-500 border border-slate-200 hover:bg-slate-100"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSavingSchedule}
                    className="h-9 px-4 text-xs font-bold uppercase tracking-wider rounded-lg bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-content)] flex items-center gap-1 border-none"
                  >
                    {isSavingSchedule && <span className="material-symbols-outlined animate-spin text-xs">sync</span>}
                    {editingScheduleSlot ? 'Simpan Slot' : 'Tambah Slot'}
                  </Button>
                </div>
              </form>
            )}

            {scheduleLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-[var(--theme-text-muted)]">
                <span className="material-symbols-outlined text-3xl animate-spin text-[var(--theme-primary)]/50">sync</span>
                <p className="text-[10px] font-black uppercase tracking-widest">Memuat jadwal...</p>
              </div>
            ) : scheduleData.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-[var(--theme-border-muted)] rounded-2xl p-6">
                <span className="material-symbols-outlined text-[var(--theme-text-muted)] text-4xl">event_busy</span>
                <h3 className="mt-2 text-xs font-bold uppercase tracking-wide text-[var(--theme-text)]">Belum Ada Slot Jadwal Praktik</h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-1">Tenaga medis ini belum memiliki jadwal praktik terdaftar.</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="py-3 px-4">Tanggal Pelayanan</th>
                      <th className="py-3 px-4">Waktu</th>
                      <th className="py-3 px-4">Layanan</th>
                      <th className="py-3 px-4">Lokasi</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                    {scheduleData.map((sch) => (
                      <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-800">
                          {formatDisplayDate(sch.tanggal)}
                          {sch.is_repeat && (
                            <div className="mt-1 text-[8px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit uppercase tracking-widest">
                              Mingguan
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-700">{sch.jam_mulai} - {sch.jam_selesai}</td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-bold uppercase tracking-wider text-[9px]">
                            {sch.tipe_layanan}
                          </span>
                        </td>
                        <td className="py-4 px-4">{sch.lokasi}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex gap-1">
                            <button onClick={() => handleOpenEditScheduleSlot(sch)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"><span className="material-symbols-outlined text-sm">edit</span></button>
                            <button onClick={() => handleDeleteScheduleSlot(sch.id)} className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DialogModal>
    </PageContent>
  )
}

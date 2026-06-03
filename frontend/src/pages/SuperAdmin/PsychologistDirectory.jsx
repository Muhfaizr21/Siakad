"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from './components/ui/data-table'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog'
import { DeleteConfirmModal } from './components/ui/DeleteConfirmModal'
import { Card, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../services/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const BrainCircuit = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>psychology</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Stethoscope = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>medical_services</span>;
const ClipboardCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>assignment_turned_in</span>;
const Heart = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>favorite</span>;



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
  return (hours * 60) + minutes;
};

export default function PsychologistDirectory() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ Nama: '', Email: '', Password: '' })
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Tab State
  const [activeTab, setActiveTab] = useState('directory')
  
  // Reporting Data States
  const [bookings, setBookings] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])
  const [referrals, setReferrals] = useState([])

  // Detail Modal States
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailType, setDetailType] = useState('') // 'booking', 'medical_record', 'referral'
  const [detailItem, setDetailItem] = useState(null)

  // Schedule Management States
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [scheduleData, setScheduleData] = useState(defaultSchedule)
  const [savedScheduleSnapshot, setSavedScheduleSnapshot] = useState(JSON.stringify(defaultSchedule))
  const [selectedDay, setSelectedDay] = useState('Senin')
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [isSavingSchedule, setIsSavingSchedule] = useState(false)
  
  const [form, setForm] = useState({ 
    ID: '', Nama: '', Spesialisasi: 'Umum', Lokasi: '', Tarif: 0, IsAktif: true,
    Email: '', NoHP: '', Bio: '', Bahasa: '', FotoURL: ''
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [psRes, bkRes, mrRes, rfRes] = await Promise.all([
        adminService.getAllPsychologists(),
        adminService.getPsychologistBookings(),
        adminService.getPsychologistMedicalRecords(),
        adminService.getPsychologistReferrals()
      ])
      
      if (psRes.status === 'success') setData(psRes.data || [])
      else toast.error('Gagal memuat data psikolog')

      if (bkRes.status === 'success') setBookings(bkRes.data || [])
      if (mrRes.status === 'success') setMedicalRecords(mrRes.data || [])
      if (rfRes.status === 'success') setReferrals(rfRes.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Koneksi sistem terputus / Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const getTodayBookingsCount = () => {
    return bookings.filter(b => {
      const d = b.tanggal || b.Tanggal
      if (!d) return false
      const bd = new Date(d)
      const today = new Date()
      return bd.getFullYear() === today.getFullYear() &&
             bd.getMonth() === today.getMonth() &&
             bd.getDate() === today.getDate()
    }).length
  }

  useEffect(() => { fetchData() }, [])

  const handleOpenEdit = (row) => {
    setForm({ 
      ID: row.id || row.ID, 
      Nama: row.nama || '', 
      Spesialisasi: row.spesialisasi || 'Umum', 
      Lokasi: row.lokasi || '',
      Tarif: row.tarif || 0,
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
        tarif: parseInt(form.Tarif) || 0,
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
        toast.success('Profil psikolog diperbarui')
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
    const targetId = row.id || row.ID
    console.log("handleOpenSchedule for psychologist targetId:", targetId, "row:", row)
    setSelected(row)
    setIsScheduleOpen(true)
    setScheduleLoading(true)
    setSelectedDay('Senin')
    try {
      const res = await adminService.getPsychologistSchedules(targetId)
      console.log("getPsychologistSchedules response:", res)
      const nextSchedule = Array.isArray(res.data) && res.data.length > 0
        ? normalizeSchedule(res.data)
        : defaultSchedule
      setScheduleData(nextSchedule)
      setSavedScheduleSnapshot(JSON.stringify(nextSchedule))
    } catch (err) {
      console.error("Gagal memuat jadwal:", err)
      toast.error(err?.message || 'Gagal memuat jadwal psikolog')
      setScheduleData(defaultSchedule)
      setSavedScheduleSnapshot(JSON.stringify(defaultSchedule))
    } finally {
      setScheduleLoading(false)
    }
  }

  const toggleDay = (day) => {
    setScheduleData((prev) => prev.map((item) => {
      if (item.day !== day) return item
      const nextEnabled = !item.enabled
      return {
        ...item,
        enabled: nextEnabled,
        slots: nextEnabled && (!item.slots || item.slots.length === 0)
          ? [{ kategori: 'Personal', start: '09:00', end: '12:00', lokasi: 'Ruang Konseling A', kuota: 1, is_available: true }]
          : (item.slots || []).map((s) => ({ ...s, is_available: nextEnabled }))
      }
    }))
  }

  const addSlot = (day) => {
    setScheduleData((prev) => prev.map((item) => item.day === day
      ? { ...item, enabled: true, slots: [...(item.slots || []), { kategori: 'Personal', start: '09:00', end: '10:00', lokasi: 'Ruang Konseling A', kuota: 1, is_available: true }] }
      : item))
  }

  const removeSlot = (day, index) => {
    setScheduleData((prev) => prev.map((item) => item.day === day
      ? { ...item, slots: (item.slots || []).filter((_, slotIndex) => slotIndex !== index) }
      : item))
  }

  const updateSlot = (day, index, key, value) => {
    setScheduleData((prev) => prev.map((item) => item.day === day
      ? { ...item, slots: (item.slots || []).map((slot, slotIndex) => slotIndex === index ? { ...slot, [key]: value } : slot) }
      : item))
  }

  const resetScheduleChanges = () => {
    const restored = JSON.parse(savedScheduleSnapshot)
    setScheduleData(restored)
    toast.success('Perubahan jadwal dikembalikan ke versi tersimpan.')
  }

  const saveSchedule = async () => {
    const invalidSlot = scheduleData
      .flatMap((item) => (item.slots || []).map((slot, index) => ({ ...slot, day: item.day, index, enabled: item.enabled })))
      .find((slot) => slot.enabled && toMinutes(slot.end) <= toMinutes(slot.start))

    if (invalidSlot) {
      toast.error(`${invalidSlot.day} slot ${invalidSlot.index + 1}: jam selesai harus setelah jam mulai.`)
      return
    }

    setIsSavingSchedule(true)
    try {
      const payload = scheduleData.map(item => ({
        day: item.day,
        enabled: item.enabled,
        slots: (item.slots || []).map(slot => ({
          kategori: slot.kategori,
          start: slot.start,
          end: slot.end,
          lokasi: slot.lokasi,
          kuota: slot.kuota,
          is_available: item.enabled ? (slot.is_available ?? true) : false
        }))
      }))
      const targetId = selected.id || selected.ID
      console.log("Saving schedule for targetId:", targetId, "payload:", payload)
      const res = await adminService.savePsychologistSchedules(targetId, payload)
      console.log("savePsychologistSchedules response:", res)
      const nextSchedule = Array.isArray(res.data) ? normalizeSchedule(res.data) : scheduleData
      setScheduleData(nextSchedule)
      setSavedScheduleSnapshot(JSON.stringify(nextSchedule))
      toast.success('Jadwal psikolog berhasil diperbarui.')
    } catch (error) {
      console.error("Gagal menyimpan jadwal:", error)
      toast.error(error?.message || 'Gagal menyimpan jadwal. Coba lagi.')
    } finally {
      setIsSavingSchedule(false)
    }
  }

  const currentDayData = scheduleData.find((item) => item.day === selectedDay) || { day: selectedDay, enabled: false, slots: [] }

  const columns = [
    { 
      key: 'nama', 
      label: 'Tenaga Profesional', 
      className: 'w-[300px]',
      render: (v, row) => (
        <div className="flex items-center gap-4 py-2 group/avatar">
          <StudentAvatar
            src={getCleanImageUrl(row.Foto || row.Pengguna?.Foto || row.foto || row.pengguna?.foto)}
            name={v}
            className="w-11 h-11 rounded-xl border-2 border-white shadow-md transition-all group-hover/avatar:scale-110"
          />
          <div className="flex flex-col">
            <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px] leading-tight">
              {v ? v.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) : '—'}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-neutral-400">
               <Stethoscope size={10} className="text-teal-500/60" />
               <span className="text-[10px] font-bold tracking-widest uppercase">{row.spesialisasi || 'Psikolog Umum'}</span>
            </div>
          </div>
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
          <span className="text-[12px] font-medium truncate font-jakarta" title={v}>{v || 'Rumah Sakit Universitas'}</span>
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
          'px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider shadow-none', 
          v ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-rose-50 text-rose-600 border-rose-100'
        )}>
          {v ? 'Aktif Praktek' : 'Cuti / Libur'}
        </Badge>
      )
    }
  ]

  const bookingColumns = [
    {
      key: 'mahasiswa',
      label: 'Mahasiswa',
      className: 'w-[250px]',
      render: (v, row) => (
        <div className="flex flex-col py-1">
          <span className="font-bold text-neutral-900 font-jakarta text-xs">{row.mahasiswa?.nama || '—'}</span>
          <span className="text-[10px] text-neutral-400 font-bold">{row.mahasiswa?.nim || '—'}</span>
          <span className="text-[9px] text-neutral-400 font-medium tracking-wide uppercase">{row.mahasiswa?.program_studi?.nama || '—'}</span>
        </div>
      )
    },
    {
      key: 'psikolog',
      label: 'Psikolog',
      className: 'w-[200px]',
      render: (v, row) => (
        <div className="flex flex-col py-1">
          <span className="font-bold text-neutral-800 text-xs">{row.psikolog?.nama || '—'}</span>
          <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{row.psikolog?.spesialisasi || '—'}</span>
        </div>
      )
    },
    {
      key: 'tanggal',
      label: 'Tanggal & Waktu',
      className: 'w-[180px]',
      render: (v, row) => {
        const formattedDate = row.tanggal ? new Date(row.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        return (
          <div className="flex flex-col py-1">
            <span className="font-bold text-neutral-800 text-xs">{formattedDate}</span>
            <span className="text-[10px] text-neutral-500 font-medium">{row.jam_mulai} - {row.jam_selesai}</span>
          </div>
        )
      }
    },
    {
      key: 'topik',
      label: 'Topik / Keluhan',
      className: 'w-[250px]',
      render: (v, row) => (
        <div className="flex flex-col py-1 max-w-[220px]">
          <span className="font-bold text-neutral-800 text-xs truncate" title={row.topik}>{row.topik || '—'}</span>
          <span className="text-[10px] text-neutral-400 truncate" title={row.keluhan}>{row.keluhan || '—'}</span>
        </div>
      )
    },
    {
      key: 'mode',
      label: 'Mode',
      className: 'w-[100px]',
      render: v => (
        <Badge className={cn(
          'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shadow-none',
          v === 'Online' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'
        )}>
          {v || 'Tatap Muka'}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      className: 'w-[100px]',
      render: v => {
        const statusLower = String(v || '').toLowerCase()
        let bg = 'bg-neutral-50 text-neutral-600 border-neutral-100'
        if (statusLower === 'disetujui' || statusLower === 'confirmed' || statusLower === 'selesai' || statusLower === 'completed') {
          bg = 'bg-emerald-50 text-emerald-600 border-emerald-100'
        } else if (statusLower === 'menunggu' || statusLower === 'waiting' || statusLower === 'pending') {
          bg = 'bg-amber-50 text-amber-600 border-amber-100'
        } else if (statusLower === 'dibatalkan' || statusLower === 'cancelled' || statusLower === 'rejected') {
          bg = 'bg-rose-50 text-rose-600 border-rose-100'
        }
        return (
          <Badge className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border shadow-none', bg)}>
            {v || 'Menunggu'}
          </Badge>
        )
      }
    }
  ]

  const medicalRecordColumns = [
    {
      key: 'mahasiswa',
      label: 'Mahasiswa',
      className: 'w-[250px]',
      render: (v, row) => (
        <div className="flex flex-col py-1">
          <span className="font-bold text-neutral-900 font-jakarta text-xs">{row.mahasiswa?.nama || '—'}</span>
          <span className="text-[10px] text-neutral-400 font-bold">{row.mahasiswa?.nim || '—'}</span>
          <span className="text-[9px] text-neutral-400 font-medium tracking-wide uppercase">{row.mahasiswa?.program_studi?.nama || '—'}</span>
        </div>
      )
    },
    {
      key: 'psikolog',
      label: 'Psikolog',
      className: 'w-[200px]',
      render: (v, row) => (
        <div className="flex flex-col py-1">
          <span className="font-bold text-neutral-800 text-xs">{row.psikolog?.nama || '—'}</span>
          <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{row.psikolog?.spesialisasi || '—'}</span>
        </div>
      )
    },
    {
      key: 'tanggal',
      label: 'Tanggal Sesi',
      className: 'w-[150px]',
      render: v => v ? new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
    },
    {
      key: 'mood',
      label: 'Mood & Status',
      className: 'w-[150px]',
      render: (v, row) => (
        <div className="flex flex-col py-1">
          <Badge className="w-fit px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold uppercase tracking-wider mb-1">
            Mood: {row.mood || '—'}
          </Badge>
          <Badge className={cn(
            'w-fit px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-neutral-200 bg-neutral-50 text-neutral-600',
            row.status_pasien?.toLowerCase() === 'selesai' && 'bg-emerald-50 text-emerald-600 border-emerald-100',
            row.status_pasien?.toLowerCase() === 'dirujuk' && 'bg-rose-50 text-rose-600 border-rose-100'
          )}>
            Status: {row.status_pasien || '—'}
          </Badge>
        </div>
      )
    },
    {
      key: 'keluhan',
      label: 'Keluhan & Observasi',
      className: 'w-[300px]',
      render: (v, row) => (
        <div className="flex flex-col py-1 max-w-[280px]">
          <span className="text-xs font-semibold text-neutral-800 truncate" title={row.keluhan}>Keluhan: {row.keluhan || '—'}</span>
          <span className="text-[10px] text-neutral-500 font-medium truncate" title={row.observasi}>Obs: {row.observasi || '—'}</span>
        </div>
      )
    }
  ]

  const referralColumns = [
    {
      key: 'mahasiswa',
      label: 'Mahasiswa',
      className: 'w-[250px]',
      render: (v, row) => (
        <div className="flex flex-col py-1">
          <span className="font-bold text-neutral-900 font-jakarta text-xs">{row.mahasiswa?.nama || '—'}</span>
          <span className="text-[10px] text-neutral-400 font-bold">{row.mahasiswa?.nim || '—'}</span>
          <span className="text-[9px] text-neutral-400 font-medium tracking-wide uppercase">{row.mahasiswa?.program_studi?.nama || '—'}</span>
        </div>
      )
    },
    {
      key: 'psikolog',
      label: 'Psikolog Asal',
      className: 'w-[200px]',
      render: (v, row) => (
        <div className="flex flex-col py-1">
          <span className="font-bold text-neutral-800 text-xs">{row.psikolog?.nama || '—'}</span>
          <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{row.psikolog?.spesialisasi || '—'}</span>
        </div>
      )
    },
    {
      key: 'pihak_tujuan',
      label: 'Tujuan Rujukan',
      className: 'w-[200px]',
      render: (v, row) => (
        <div className="flex flex-col py-1">
          <span className="font-bold text-neutral-800 text-xs">{row.pihak_tujuan || '—'}</span>
          <span className="text-[10px] text-neutral-400 font-medium">{row.email_tujuan || '—'}</span>
        </div>
      )
    },
    {
      key: 'tipe',
      label: 'Tipe & Alasan',
      className: 'w-[250px]',
      render: (v, row) => (
        <div className="flex flex-col py-1 max-w-[220px]">
          <Badge className="w-fit px-1.5 py-0.5 rounded bg-teal-50 text-teal-600 border border-teal-100 text-[9px] font-bold uppercase tracking-wider mb-1">
            Tipe: {row.tipe || '—'}
          </Badge>
          <span className="text-[10px] text-neutral-400 truncate" title={row.alasan}>{row.alasan || '—'}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      className: 'w-[100px]',
      render: v => {
        const statusLower = String(v || '').toLowerCase()
        let bg = 'bg-neutral-50 text-neutral-600 border-neutral-100'
        if (statusLower === 'dikirim' || statusLower === 'sent') {
          bg = 'bg-blue-50 text-blue-600 border-blue-100'
        } else if (statusLower === 'diterima' || statusLower === 'received' || statusLower === 'confirmed') {
          bg = 'bg-emerald-50 text-emerald-600 border-emerald-100'
        } else if (statusLower === 'draft') {
          bg = 'bg-neutral-50 text-neutral-400 border-neutral-200'
        }
        return (
          <Badge className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border shadow-none', bg)}>
            {v || 'Draft'}
          </Badge>
        )
      }
    }
  ]

  const handleOpenDetail = (type, item) => {
    setDetailType(type)
    setDetailItem(item)
    setIsDetailOpen(true)
  }

  return (
    <div className="px-1 py-4 md:px-2 xl:px-4 min-h-screen bg-transparent font-inter">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-8 select-none">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="glass-card rounded-2xl border border-slate-200/60 p-5 md:p-8 relative overflow-hidden shadow-none">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-bku-primary/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2 w-full lg:w-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-bku-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-headline leading-none">Professional Health</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-headline tracking-tight leading-none" style={{ color: 'var(--theme-h1)' }}>
                Direktori <span className="text-bku-primary italic">Psikolog</span>
              </h1>
              <p className="text-slate-400 font-medium text-[11px] max-w-2xl leading-relaxed">
                Manajemen data tenaga ahli psikologi, jadwal praktek, dan lokasi pelayanan kesehatan mental mahasiswa.
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="px-4 py-2 bg-bku-primary/5 border border-bku-primary/20 rounded-xl flex items-center gap-3 w-full lg:w-auto justify-center">
                 <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }}>security</span>
                 <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-black text-bku-primary/70 uppercase tracking-widest font-headline">Verification Status</span>
                    <span className="text-[12px] font-black text-bku-primary font-headline">Verified Practitioners</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center text-bku-primary flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >group</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Total Psikolog</span>
              </div>
              <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{data.length}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Tenaga ahli terdaftar</p>
           </div>

           <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-blue-50 rounded-xl flex justify-center items-center text-blue-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >calendar_month</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Booking Hari Ini</span>
                 {getTodayBookingsCount() > 0 && (
                   <span className="bg-rose-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse ml-auto">LIVE</span>
                 )}
              </div>
              <p className="text-3xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">
                {getTodayBookingsCount()}
              </p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Mahasiswa booking hari ini</p>
           </div>

           <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-emerald-50 rounded-xl flex justify-center items-center text-emerald-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >medical_services</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Rekam Medis</span>
              </div>
              <p className="text-3xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{medicalRecords.length}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Catatan sesi & kondisi klinis</p>
           </div>

           <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-indigo-50 rounded-xl flex justify-center items-center text-indigo-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >forward_to_inbox</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Tindak Lanjut</span>
              </div>
              <p className="text-3xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{referrals.length}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Surat rujukan dikirim</p>
           </div>
        </div>

        {/* ── Tab Navigation ────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-neutral-200 overflow-x-auto pb-1">
          {[
            { id: 'directory', label: 'Direktori Psikolog', icon: 'group' },
            { 
              id: 'bookings', 
              label: 'Booking Konseling', 
              icon: 'calendar_month', 
              count: getTodayBookingsCount()
            },
            { id: 'medical_records', label: 'Rekam Medis', icon: 'medical_services' },
            { id: 'referrals', label: 'Tindak Lanjut (Rujukan)', icon: 'forward_to_inbox' }
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 font-jakarta",
                  isActive
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-neutral-400 hover:text-neutral-700 hover:border-neutral-300"
                )}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500 text-white animate-pulse">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
          <CardContent className="p-0 animate-in fade-in duration-300">
            {activeTab === 'directory' && (
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
                  { key: 'Spesialisasi', placeholder: 'FILTER BIDANG', options: [{ label: 'PSIKOLOG UMUM', value: 'Umum' }, { label: 'KLINIS', value: 'Klinis' }, { label: 'PENDIDIKAN', value: 'Pendidikan' }] }
                ]}
                actions={(row) => (
                  <div className="flex items-center gap-1.5">
                    <Button onClick={() => handleOpenSchedule(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Kelola Jadwal"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >calendar_month</span></Button>
                    <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Profil"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >edit</span></Button>
                    <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span></Button>
                  </div>
                )}
              />
            )}

            {activeTab === 'bookings' && (
              <DataTable
                columns={bookingColumns}
                data={bookings}
                loading={loading}
                searchPlaceholder="Cari Nama Mahasiswa, NIM, atau Topik..."
                filters={[
                  { key: 'status', placeholder: 'STATUS', options: [{ label: 'MENUNGGU', value: 'menunggu' }, { label: 'DISETUJUI', value: 'disetujui' }, { label: 'SELESAI', value: 'selesai' }, { label: 'DIBATALKAN', value: 'dibatalkan' }] },
                  { key: 'mode', placeholder: 'MODE', options: [{ label: 'TATAP MUKA', value: 'Tatap Muka' }, { label: 'ONLINE', value: 'Online' }] }
                ]}
                actions={(row) => (
                  <div className="flex items-center gap-1.5">
                    <Button onClick={() => handleOpenDetail('booking', row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Lihat Detail"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span></Button>
                  </div>
                )}
              />
            )}

            {activeTab === 'medical_records' && (
              <DataTable
                columns={medicalRecordColumns}
                data={medicalRecords}
                loading={loading}
                searchPlaceholder="Cari Nama Mahasiswa, Keluhan, atau Observasi..."
                filters={[
                  { key: 'status_pasien', placeholder: 'STATUS PASIEN', options: [{ label: 'SELESAI', value: 'selesai' }, { label: 'DIRUJUK', value: 'dirujuk' }, { label: 'KONSULTASI LANJUTAN', value: 'konsultasi lanjutan' }] }
                ]}
                actions={(row) => (
                  <div className="flex items-center gap-1.5">
                    <Button onClick={() => handleOpenDetail('medical_record', row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Lihat Detail"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span></Button>
                  </div>
                )}
              />
            )}

            {activeTab === 'referrals' && (
              <DataTable
                columns={referralColumns}
                data={referrals}
                loading={loading}
                searchPlaceholder="Cari Nama Mahasiswa, Penerima, atau Alasan..."
                filters={[
                  { key: 'status', placeholder: 'STATUS RUJUKAN', options: [{ label: 'DRAFT', value: 'draft' }, { label: 'DIKIRIM', value: 'dikirim' }, { label: 'DITERIMA', value: 'diterima' }] }
                ]}
                actions={(row) => (
                  <div className="flex items-center gap-1.5">
                    <Button onClick={() => handleOpenDetail('referral', row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Lihat Detail"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span></Button>
                  </div>
                )}
              />
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── Edit Modal ───────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-xl p-0 overflow-hidden border border-slate-200/60 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300">
          <DialogHeader className="p-6 sm:p-8 pb-4 sm:pb-6 border-b border-slate-200/40 relative overflow-hidden bg-white/40">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-bku-primary"><BrainCircuit size={100} /></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-bku-primary font-headline">Clinical Registry</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black font-headline tracking-tight text-slate-800 uppercase">
                Edit Profil Psikolog
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm font-medium text-slate-500 font-inter">Pembaruan kualifikasi dan pengaturan operasional tenaga ahli.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-6 sm:p-8 pt-4 sm:pt-6 space-y-4 sm:space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-500 font-headline ml-1 uppercase tracking-widest">Nama Lengkap & Gelar</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama psikolog..." className="h-11 rounded-lg border-slate-200/60 bg-white/50 focus:bg-white font-medium text-sm font-inter uppercase" />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-500 font-headline ml-1 uppercase tracking-widest">Spesialisasi Klinis</Label>
                <Input value={form.Spesialisasi} onChange={e => setForm({ ...form, Spesialisasi: e.target.value })} placeholder="Bidang keahlian..." className="h-11 rounded-lg border-slate-200/60 bg-white/50 focus:bg-white font-medium text-sm font-inter" />
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
                <Label className="text-[11px] font-black text-slate-500 font-headline ml-1 uppercase tracking-widest">Tarif Layanan (Rp)</Label>
                <Input type="number" value={form.Tarif} onChange={e => setForm({ ...form, Tarif: e.target.value })} className="h-11 rounded-lg border-slate-200/60 bg-white/50 focus:bg-white font-medium text-sm font-inter" />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-500 font-headline ml-1 uppercase tracking-widest">Status Operasional</Label>
                <Select value={form.IsAktif ? "1" : "0"} onValueChange={v => setForm({ ...form, IsAktif: v === "1" })}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200/60 bg-white/50 font-medium text-sm"><SelectValue /></SelectTrigger>
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
              <textarea value={form.Bio} onChange={e => setForm({ ...form, Bio: e.target.value })} placeholder="Tulis deskripsi keahlian, pengalaman, atau latar belakang akademis..." rows={3} className="w-full p-3 rounded-lg border border-neutral-200 bg-neutral-50/30 focus:bg-white text-sm font-medium font-jakarta outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all resize-none" />
            </div>

            <div className="pt-6 flex flex-col-reverse sm:flex-row gap-3 border-t border-neutral-100">
               <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="w-full sm:w-auto h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-400">Batal</Button>
               <Button type="submit" disabled={isSubmitting} className="w-full sm:flex-1 h-12 rounded-xl bg-neutral-900 text-white hover:bg-teal-600 shadow-md transition-all active:scale-95 flex items-center justify-center">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} >save</span>}
                  <span className="text-[10px] font-black font-headline uppercase tracking-widest">Update Profil</span>
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Add Modal ───────────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white animate-in slide-in-from-bottom-4 duration-300">
          <DialogHeader className="p-6 sm:p-8 pb-4 sm:pb-6 border-b border-neutral-100 relative overflow-hidden bg-neutral-50/50">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-teal-600"><BrainCircuit size={100} /></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >add_circle</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Registry System</span>
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
               <Button type="submit" disabled={isSubmitting} className="w-full sm:flex-1 h-12 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all active:scale-95 flex items-center justify-center border-none">
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
            <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-600"><span className="material-symbols-outlined text-[100px]">calendar_month</span></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="size-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >calendar_month</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Jadwal Praktik</span>
                </div>
                <DialogTitle className="text-xl font-bold font-jakarta tracking-tight text-neutral-900 uppercase">
                  Kelola Jadwal: {selected?.nama}
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-neutral-400">Atur ketersediaan slot konseling mingguan untuk psikolog.</DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetScheduleChanges}
                  disabled={isSavingSchedule || scheduleLoading}
                  className="h-10 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-indigo-600"
                >
                  <span className="material-symbols-outlined mr-1.5" style={{ fontSize: '14px' }}>history</span>
                  Reset
                </Button>
                <Button
                  type="button"
                  onClick={saveSchedule}
                  disabled={isSavingSchedule || scheduleLoading}
                  className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center px-4 border-none shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all"
                >
                  {isSavingSchedule ? <span className="material-symbols-outlined animate-spin mr-1.5" style={{ fontSize: '14px' }}>sync</span> : <span className="material-symbols-outlined mr-1.5" style={{ fontSize: '14px' }}>save</span>}
                  {isSavingSchedule ? 'Menyimpan...' : 'Simpan Jadwal'}
                </Button>
              </div>
            </div>
          </DialogHeader>

          {scheduleLoading ? (
            <div className="h-[450px] flex items-center justify-center flex-col gap-3 bg-white">
              <span className="material-symbols-outlined animate-spin text-indigo-600" style={{ fontSize: '40px' }}>sync</span>
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
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-neutral-200/60 bg-white text-neutral-600 hover:border-indigo-200"
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
                          <span className="material-symbols-outlined text-indigo-600" style={{ fontSize: '16px' }}>schedule</span>
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
                          className="h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center px-3 border border-indigo-100"
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
                          className="mt-4 h-9 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest"
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
                      className="mt-5 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest"
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

      {/* ── Detail Modal ─────────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white animate-in slide-in-from-bottom-4 duration-300">
          <DialogHeader className="p-6 sm:p-8 pb-4 sm:pb-6 border-b border-neutral-100 relative overflow-hidden bg-neutral-50/50">
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-teal-50 flex items-center justify-center text-teal-600">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >visibility</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
                  {detailType === 'booking' && 'Detail Booking Sesi'}
                  {detailType === 'medical_record' && 'Detail Catatan Sesi'}
                  {detailType === 'referral' && 'Detail Surat Rujukan'}
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold font-jakarta tracking-tight text-neutral-900 uppercase">
                {detailType === 'booking' && 'Informasi Booking Konseling'}
                {detailType === 'medical_record' && 'Rekam Medis Mahasiswa'}
                {detailType === 'referral' && 'Tindak Lanjut & Rujukan'}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto font-jakarta">
            {detailItem && (
              <>
                {/* Mahasiswa Info Section */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-3">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Identitas Mahasiswa</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">Nama Lengkap</span>
                      <span className="text-sm font-bold text-neutral-800">{detailItem.mahasiswa?.nama || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">NIM (Nomor Induk Mahasiswa)</span>
                      <span className="text-sm font-bold text-neutral-800">{detailItem.mahasiswa?.nim || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">Program Studi</span>
                      <span className="text-xs font-semibold text-neutral-700">{detailItem.mahasiswa?.program_studi?.nama || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block">Fakultas</span>
                      <span className="text-xs font-semibold text-neutral-700">{detailItem.mahasiswa?.program_studi?.fakultas?.nama || detailItem.mahasiswa?.fakultas?.nama || '—'}</span>
                    </div>
                  </div>
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
                      <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">{detailItem.psikolog?.spesialisasi || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Main Content Sections based on Type */}
                {detailType === 'booking' && (
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
                        <Badge className="px-2 py-0.5 mt-1 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {detailItem.mode || 'Tatap Muka'}
                        </Badge>
                      </div>
                      {detailItem.mode === 'Online' && (
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold block">Link Meeting</span>
                          {detailItem.link_meeting ? (
                            <a href={detailItem.link_meeting} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-1">
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
                )}

                {detailType === 'medical_record' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold block">Tanggal Sesi</span>
                        <span className="text-xs font-bold text-neutral-800">
                          {detailItem.tanggal ? new Date(detailItem.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold block">Mood Mahasiswa</span>
                        <span className="text-xs font-bold text-indigo-600">{detailItem.mood || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold block">Status Pasien</span>
                        <Badge className="px-2 py-0.5 mt-1 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {detailItem.status_pasien || '—'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-neutral-400 font-bold block">Keluhan Konseling</span>
                      <p className="text-xs font-medium text-neutral-700 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100 whitespace-pre-wrap leading-relaxed">{detailItem.keluhan || '—'}</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-neutral-400 font-bold block">Hasil Observasi Psikolog</span>
                      <p className="text-xs font-medium text-neutral-700 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100 whitespace-pre-wrap leading-relaxed">{detailItem.observasi || '—'}</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-neutral-400 font-bold block">Rekomendasi Tindak Lanjut</span>
                      <p className="text-xs font-medium text-teal-700 bg-teal-50/50 p-3 rounded-lg border border-teal-100 whitespace-pre-wrap leading-relaxed">{detailItem.rekomendasi || '—'}</p>
                    </div>
                  </div>
                )}

                {detailType === 'referral' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold block">Tipe Tindak Lanjut</span>
                        <Badge className="px-2 py-0.5 mt-1 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-50 text-teal-600 border border-teal-100">
                          {detailItem.tipe || 'Rujukan Medis'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold block">Status Rujukan</span>
                        <Badge className="px-2 py-0.5 mt-1 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                          {detailItem.status || 'Draft'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold block">Pihak Penerima Rujukan</span>
                        <span className="text-xs font-bold text-neutral-800">{detailItem.pihak_tujuan || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold block">Email Pihak Tujuan</span>
                        <span className="text-xs font-semibold text-neutral-600">{detailItem.email_tujuan || '—'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-neutral-400 font-bold block">Alasan Rujukan / Kondisi Klinis</span>
                      <p className="text-xs font-medium text-neutral-700 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100 whitespace-pre-wrap leading-relaxed">{detailItem.alasan || '—'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {detailItem.surat_rujiukan_url && (
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold block mb-1">Surat Rujukan Resmi</span>
                          <a href={getCleanImageUrl(detailItem.surat_rujiukan_url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                            Download Surat Rujukan
                          </a>
                        </div>
                      )}
                      {detailItem.file_pendukung_url && (
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold block mb-1">Dokumen Pendukung</span>
                          <a href={getCleanImageUrl(detailItem.file_pendukung_url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">cloud_download</span>
                            Download Lampiran
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="p-6 border-t border-neutral-100 bg-neutral-50/50">
            <Button onClick={() => setIsDetailOpen(false)} className="h-10 px-5 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-900">
              Tutup Detail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

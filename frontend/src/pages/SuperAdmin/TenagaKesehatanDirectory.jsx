"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { DataTable } from './components/ui/data-table'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog'
import { DeleteConfirmModal } from './components/ui/DeleteConfirmModal'
import { Card, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

import { StatCard } from './components/ui/stat-card'

// Auto-injected Material Symbol fallbacks
const MedicalServices = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>medical_services</span>;
const CalendarMonth = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_month</span>;
const History = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>history</span>;
const Info = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>info</span>;
const Group = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;

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

export default function TenagaKesehatanDirectory() {
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

  // Detail Modal States
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)

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
      const [tkRes, bkRes, mrRes] = await Promise.all([
        adminService.getAllTenagaKesehatan(),
        adminService.getTenagaKesehatanBookings(),
        adminService.getTenagaKesehatanMedicalRecords()
      ])
      
      if (tkRes.status === 'success') setData(tkRes.data || [])
      else toast.error('Gagal memuat data tenaga kesehatan')

      // Flatten nested mahasiswa.fakultas & semester for DataTable filter compatibility
      const flattenMahasiswaFields = (items) => (items || []).map(item => {
        const mhs = item.mahasiswa || item.Mahasiswa;
        return {
          ...item,
          _fakultas: mhs?.fakultas?.Nama || mhs?.Fakultas?.Nama || mhs?.fakultas?.nama || mhs?.Fakultas?.nama || '',
          _semester: mhs?.SemesterSekarang || mhs?.semester_sekarang || ''
        };
      })

      if (bkRes.status === 'success') setBookings(flattenMahasiswaFields(bkRes.data))
      if (mrRes.status === 'success') setMedicalRecords(flattenMahasiswaFields(mrRes.data))
    } catch (err) {
      console.error(err)
      toast.error('Koneksi sistem terputus / Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const getTodayBookingsCount = () => {
    return bookings.filter(b => {
      const d = b.jadwal?.tanggal || b.Jadwal?.Tanggal
      if (!d) return false
      const bd = new Date(d)
      const today = new Date()
      return bd.getFullYear() === today.getFullYear() &&
             bd.getMonth() === today.getMonth() &&
             bd.getDate() === today.getDate()
    }).length
  }

  useEffect(() => { fetchData() }, [])

  // Compute unique fakultas & semester options from all screening/booking data
  const fakultasOptions = useMemo(() => {
    const allItems = [...bookings, ...medicalRecords]
    const unique = [...new Set(allItems.map(i => i._fakultas).filter(Boolean))].sort()
    return unique.map(f => ({ label: f.toUpperCase(), value: f }))
  }, [bookings, medicalRecords])

  const semesterOptions = useMemo(() => {
    const allItems = [...bookings, ...medicalRecords]
    const unique = [...new Set(allItems.map(i => i._semester).filter(v => v !== '' && v !== undefined && v !== null))].sort((a, b) => Number(a) - Number(b))
    return unique.map(s => ({ label: `SEMESTER ${s}`, value: String(s) }))
  }, [bookings, medicalRecords])

  const serviceChartData = useMemo(() => {
    const counts = {}
    bookings.forEach(b => {
      const t = b.jadwal?.tipe_layanan || b.tipe_layanan || 'Pemeriksaan Umum'
      const normalized = t.trim()
      counts[normalized] = (counts[normalized] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [bookings])

  const statusChartData = useMemo(() => {
    const counts = { 'Selesai/Dikonfirmasi': 0, 'Menunggu': 0, 'Batal/Ditolak': 0 }
    bookings.forEach(b => {
      const s = String(b.status || '').toLowerCase()
      if (s === 'dikonfirmasi' || s === 'selesai') {
        counts['Selesai/Dikonfirmasi']++
      } else if (s === 'menunggu konfirmasi' || s === 'waiting' || s === 'pending') {
        counts['Menunggu']++
      } else if (s === 'ditolak' || s === 'dibatalkan') {
        counts['Batal/Ditolak']++
      } else {
        counts['Menunggu']++
      }
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
  }, [bookings])

  const PIE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981']

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
        toast.success('Profil Tenaga Kesehatan diperbarui')
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
        toast.success('Tenaga Kesehatan baru berhasil didaftarkan')
        setIsAddOpen(false)
        setAddForm({ Nama: '', Email: '', Password: '' })
        fetchData()
      } else {
        toast.error(res.message || 'Gagal mendaftarkan tenaga kesehatan')
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
      toast.success('Tenaga Kesehatan berhasil dihapus')
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
                <MedicalServices size={10} className="text-primary/60" />
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
        <div className="flex flex-col text-neutral-500 gap-0.5">
          <span className="text-xs font-semibold text-neutral-800">{v || '—'}</span>
          <span className="text-[10px] font-medium text-neutral-400">{row.no_hp || '—'}</span>
        </div>
      )
    },
    { 
      key: 'lokasi', 
      label: 'Lokasi Pelayanan', 
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
          'px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider shadow-none', 
          v ? 'bg-success/10 text-success border-success/20' : 'bg-rose-50 text-rose-600 border-rose-100'
        )}>
          {v ? 'Aktif Pelayanan' : 'Nonaktif / Libur'}
        </Badge>
      )
    }
  ]

  const bookingColumns = [
    {
      key: 'mahasiswa',
      label: 'Mahasiswa',
      className: 'w-[250px]',
      render: (v, row) => {
        const mhs = row.mahasiswa || row.Mahasiswa;
        return (
          <div className="flex flex-col py-1">
            <span className="font-bold text-neutral-900 font-jakarta text-xs">{mhs?.Nama || mhs?.nama || '—'}</span>
            <span className="text-[10px] text-neutral-400 font-bold">{mhs?.NIM || mhs?.nim || '—'}</span>
            <span className="text-[9px] text-neutral-400 font-medium tracking-wide uppercase">{mhs?.program_studi?.nama || mhs?.ProgramStudi?.Nama || mhs?.program_studi?.Nama || '—'}</span>
            <div className="flex items-center gap-2 mt-0.5">
              {row._fakultas && <span className="text-[8px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">{row._fakultas}</span>}
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
        <div className="flex flex-col py-1">
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
          <div className="flex flex-col py-1">
            <span className="font-bold text-neutral-800 text-xs">{formattedDate}</span>
            <span className="text-[10px] text-neutral-500 font-medium">{row.jadwal?.jam_mulai} - {row.jadwal?.jam_selesai}</span>
            <span className="text-[9px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded w-fit mt-0.5 uppercase">{row.jadwal?.tipe_layanan || 'Pemeriksaan'}</span>
          </div>
        )
      }
    },
    {
      key: 'keluhan',
      label: 'Keluhan',
      className: 'w-[250px]',
      render: (v, row) => (
        <div className="flex flex-col py-1 max-w-[220px]">
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
      render: (v, row) => {
        const mhs = row.mahasiswa || row.Mahasiswa;
        return (
          <div className="flex flex-col py-1">
            <span className="font-bold text-neutral-900 font-jakarta text-xs">{mhs?.Nama || mhs?.nama || '—'}</span>
            <span className="text-[10px] text-neutral-400 font-bold">{mhs?.NIM || mhs?.nim || '—'}</span>
            <span className="text-[9px] text-neutral-400 font-medium tracking-wide uppercase">{mhs?.program_studi?.nama || mhs?.ProgramStudi?.Nama || mhs?.program_studi?.Nama || '—'}</span>
            <div className="flex items-center gap-2 mt-0.5">
              {row._fakultas && <span className="text-[8px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">{row._fakultas}</span>}
              {row._semester && <span className="text-[8px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Sem {row._semester}</span>}
            </div>
          </div>
        )
      }
    },
    {
      key: 'tenaga_kes',
      label: 'Tenaga Medis',
      className: 'w-[180px]',
      render: (v, row) => (
        <div className="flex flex-col py-1">
          <span className="font-bold text-neutral-800 text-xs">{row.tenaga_kes?.nama || '—'}</span>
          <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{row.tenaga_kes?.spesialisasi || '—'}</span>
        </div>
      )
    },
    {
      key: 'tanggal',
      label: 'Pemeriksaan',
      className: 'w-[150px]',
      render: (v, row) => {
        const formattedDate = v ? new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        return (
          <div className="flex flex-col">
            <span className="font-bold text-xs text-neutral-800">{formattedDate}</span>
            <span className="text-[9px] text-neutral-400 font-bold uppercase">{row.jenis_pemeriksaan || 'Screening'}</span>
          </div>
        )
      }
    },
    {
      key: 'hasil',
      label: 'Kondisi & Hasil',
      className: 'w-[180px]',
      render: (v, row) => (
        <div className="flex flex-col py-1 gap-1">
          <Badge className={cn(
            'w-fit px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border',
            v?.toLowerCase() === 'sehat' && 'bg-emerald-50 text-emerald-600 border-emerald-100',
            v?.toLowerCase() === 'pantauan' && 'bg-amber-50 text-amber-600 border-amber-100',
            v?.toLowerCase() === 'perlu perhatian' && 'bg-rose-50 text-rose-600 border-rose-100'
          )}>
            Hasil: {v || '—'}
          </Badge>
          <Badge className={cn(
            'w-fit px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-neutral-50 text-neutral-600 border-neutral-200',
            row.status_kesehatan?.toLowerCase() === 'prima' && 'bg-success/10 text-success border-success/20',
            row.status_kesehatan?.toLowerCase() === 'stabil' && 'bg-blue-50 text-blue-600 border-blue-100',
            row.status_kesehatan?.toLowerCase() === 'kritis' && 'bg-rose-50 text-rose-600 border-rose-100'
          )}>
            Kesehatan: {row.status_kesehatan || '—'}
          </Badge>
        </div>
      )
    },
    {
      key: 'tindakan_diberikan',
      label: 'Tindakan & Rekomendasi',
      className: 'w-[250px]',
      render: (v, row) => (
        <div className="flex flex-col py-1 max-w-[220px]">
          <span className="text-xs font-semibold text-neutral-800 truncate" title={v}>Tindakan: {v || '—'}</span>
          <span className="text-[10px] text-neutral-500 font-medium truncate" title={row.rekomendasi}>Rekomendasi: {row.rekomendasi || '—'}</span>
        </div>
      )
    }
  ]

  const handleOpenDetail = (item) => {
    setDetailItem(item)
    setIsDetailOpen(true)
  }

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="bg-white border border-neutral-200 rounded-xl p-5 md:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-1 w-full lg:w-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Layanan Klinik Kampus</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                Direktori <span className="text-primary italic font-semibold">Tenaga Kesehatan</span>
              </h1>
              <p className="text-neutral-500 font-medium text-xs md:text-sm max-w-2xl leading-relaxed">
                Manajemen data petugas medis, jadwal ketersediaan konsultasi/pemeriksaan reguler, screening, dan rekam klinis mahasiswa.
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3 w-full lg:w-auto justify-center">
                 <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>verified_user</span>
                 <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Akses Validasi</span>
                    <span className="text-[12px] font-bold text-primary font-jakarta">Super Admin Portal</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Tenaga Medis"
            value={data.length}
            description="Petugas terdaftar aktif"
            icon={Group}
            color="text-primary"
            bg="bg-primary/10"
            loading={loading}
          />
          <StatCard
            title="Booking Hari Ini"
            value={getTodayBookingsCount()}
            description="Booking antrean pasien hari ini"
            icon={CalendarMonth}
            color="text-info"
            bg="bg-info/10"
            loading={loading}
            badge={getTodayBookingsCount() > 0 && (
              <span className="bg-rose-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">LIVE</span>
            )}
          />
          <StatCard
            title="Catatan Medis & Screening"
            value={medicalRecords.length}
            description="Riwayat pemeriksaan terinput"
            icon={MedicalServices}
            color="text-success"
            bg="bg-success/10"
            loading={loading}
          />
        </div>

        {/* ── Charts Section ──────────────────────────────────────── */}
        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Bar Chart: Jenis Layanan Kesehatan Terpopuler */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex justify-center items-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }} >bar_chart</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Layanan Kesehatan Terpopuler</span>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 8.5, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: "bold" }}
                    />
                    <Bar dataKey="value" name="Jumlah Janji Temu" fill="var(--theme-primary, #00236f)" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Status Janji Temu */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-none flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-success/10 rounded-xl flex justify-center items-center text-success flex-shrink-0">
                  <span className="material-symbols-outlined text-success" style={{ fontSize: '18px' }} >pie_chart</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Status Janji Temu</span>
              </div>
              <div className="h-[140px] w-full flex items-center justify-center">
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "10px", fontWeight: "bold" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-xs text-slate-400 italic">Tidak ada data</span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-1.5 mt-2">
                {statusChartData.slice(0, 4).map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="text-[10px] font-bold text-slate-500 leading-none">{item.name}</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 leading-none">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Navigation ────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-neutral-200 overflow-x-auto pb-1">
          {[
            { id: 'directory', label: 'Direktori Tenaga Medis', icon: 'group' },
            { 
              id: 'bookings', 
              label: 'Booking Janji Temu', 
              icon: 'calendar_month', 
              count: getTodayBookingsCount()
            },
            { id: 'medical_records', label: 'Rekam Medis & Screening', icon: 'medical_services' }
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 font-jakarta",
                  isActive
                    ? "border-primary text-primary"
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

        {/* ── Tab Contents ────────────────────────────────────────── */}
        <div className="mt-6 font-jakarta">
          {activeTab === 'directory' && (
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
                  addLabel="Tambah Tenaga Medis"
                  filters={[
                    { key: 'Spesialisasi', placeholder: 'Pilih Bidang', options: [{ label: 'Pemeriksaan Umum', value: 'Pemeriksaan Umum' }, { label: 'Konsultasi Gizi', value: 'Konsultasi Gizi' }, { label: 'Pemeriksaan Gigi', value: 'Pemeriksaan Gigi' }] }
                  ]}
                  actions={(row) => (
                    <div className="flex items-center gap-1.5">
                      <Button onClick={() => handleOpenSchedule(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Kelola Jadwal"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >calendar_month</span></Button>
                      <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Profil"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >edit</span></Button>
                      <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span></Button>
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'bookings' && (
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
                    { key: 'status', placeholder: 'Pilih Status', options: [{ label: 'Menunggu Konfirmasi', value: 'Menunggu Konfirmasi' }, { label: 'Dikonfirmasi', value: 'Dikonfirmasi' }, { label: 'Selesai', value: 'Selesai' }, { label: 'Ditolak', value: 'Ditolak' }] }
                  ]}
                  actions={(row) => (
                    <div className="flex items-center gap-1.5">
                      <Button onClick={() => handleOpenDetail(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Lihat Detail"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span></Button>
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'medical_records' && (
            <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
              <CardContent className="p-0 animate-in fade-in duration-300">
                <DataTable
                  columns={medicalRecordColumns}
                  data={medicalRecords}
                  loading={loading}
                  searchPlaceholder="Cari Nama Mahasiswa, Tindakan, atau Hasil..."
                  filters={[
                    { key: '_fakultas', placeholder: 'Pilih Fakultas', options: fakultasOptions },
                    { key: 'hasil', placeholder: 'Pilih Hasil Screening', options: [{ label: 'Sehat', value: 'Sehat' }, { label: 'Pantauan', value: 'Pantauan' }, { label: 'Perlu Perhatian', value: 'Perlu Perhatian' }] },
                    { key: 'status_kesehatan', placeholder: 'Pilih Status Kesehatan', options: [{ label: 'Prima', value: 'prima' }, { label: 'Stabil', value: 'stabil' }, { label: 'Kritis', value: 'kritis' }] }
                  ]}
                  actions={(row) => (
                    <div className="flex items-center gap-1.5">
                      <Button onClick={() => handleOpenDetail(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Lihat Detail Medis"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span></Button>
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          )}
        </div>
        </div>

      {/* ── Add Tenaga Medis Dialog ────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md bg-white border rounded-2xl shadow-xl overflow-hidden p-0 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] px-6 py-5 text-white">
            <DialogTitle className="text-base font-bold uppercase tracking-wider font-jakarta text-white">Daftar Tenaga Medis Baru</DialogTitle>
            <DialogDescription className="text-white/70 text-xs mt-1">Daftarkan akun petugas kesehatan baru di sistem BKU.</DialogDescription>
          </div>
          <form onSubmit={handleAdd} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#737373]">Nama Lengkap</Label>
              <Input
                required
                value={addForm.Nama}
                onChange={e => setAddForm(prev => ({ ...prev, Nama: e.target.value }))}
                placeholder="dr. Ahmad Sujatmiko, Sp.PD"
                className="h-11 rounded-xl text-xs font-semibold outline-none border border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary bg-neutral-50/50"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#737373]">Alamat Email (Kampus/Klinik)</Label>
              <Input
                type="email"
                required
                value={addForm.Email}
                onChange={e => setAddForm(prev => ({ ...prev, Email: e.target.value }))}
                placeholder="ahmad.medis@bku.ac.id"
                className="h-11 rounded-xl text-xs font-semibold outline-none border border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary bg-neutral-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#737373]">Password Akun</Label>
              <Input
                type="password"
                required
                value={addForm.Password}
                onChange={e => setAddForm(prev => ({ ...prev, Password: e.target.value }))}
                placeholder="••••••••"
                className="h-11 rounded-xl text-xs font-semibold outline-none border border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary bg-neutral-50/50"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 h-11"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest h-11 transition-all"
              >
                {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Akun'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Profil Dialog ─────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg bg-white border rounded-2xl shadow-xl overflow-hidden p-0 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] px-6 py-5 text-white">
            <DialogTitle className="text-base font-bold uppercase tracking-wider font-jakarta text-white">Edit Profil Tenaga Medis</DialogTitle>
            <DialogDescription className="text-white/70 text-xs mt-1">Perbarui informasi profil dan spesialisasi petugas kesehatan.</DialogDescription>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#737373]">Nama Lengkap</Label>
                <Input
                  required
                  value={form.Nama}
                  onChange={e => setForm(prev => ({ ...prev, Nama: e.target.value }))}
                  className="h-11 rounded-xl text-xs font-semibold focus:border-primary bg-neutral-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#737373]">Spesialisasi</Label>
                <select
                  value={form.Spesialisasi}
                  onChange={e => setForm(prev => ({ ...prev, Spesialisasi: e.target.value }))}
                  className="w-full h-11 px-3 bg-neutral-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-primary focus:bg-white"
                >
                  <option value="Pemeriksaan Umum">Pemeriksaan Umum</option>
                  <option value="Konsultasi Gizi">Konsultasi Gizi</option>
                  <option value="Pemeriksaan Gigi">Pemeriksaan Gigi</option>
                  <option value="Dokter Spesialis">Dokter Spesialis</option>
                  <option value="Perawat / Paramedis">Perawat / Paramedis</option>
                  <option value="Umum / Lainnya">Umum / Lainnya</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#737373]">Email</Label>
                <Input
                  type="email"
                  required
                  value={form.Email}
                  onChange={e => setForm(prev => ({ ...prev, Email: e.target.value }))}
                  className="h-11 rounded-xl text-xs font-semibold focus:border-primary bg-neutral-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#737373]">Nomor HP</Label>
                <Input
                  value={form.NoHP}
                  onChange={e => setForm(prev => ({ ...prev, NoHP: e.target.value }))}
                  className="h-11 rounded-xl text-xs font-semibold focus:border-primary bg-neutral-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#737373]">Lokasi Praktik</Label>
                <Input
                  value={form.Lokasi}
                  onChange={e => setForm(prev => ({ ...prev, Lokasi: e.target.value }))}
                  className="h-11 rounded-xl text-xs font-semibold focus:border-primary bg-neutral-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#737373]">Foto URL (Opsional)</Label>
                <Input
                  value={form.FotoURL}
                  onChange={e => setForm(prev => ({ ...prev, FotoURL: e.target.value }))}
                  className="h-11 rounded-xl text-xs font-semibold focus:border-primary bg-neutral-50/50"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.IsAktif}
                  onChange={e => setForm(prev => ({ ...prev, IsAktif: e.target.checked }))}
                  className="rounded text-primary focus:ring-primary size-4 border-neutral-300"
                />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Akun Aktif / Buka Pelayanan</span>
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 h-11"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest h-11 transition-all"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Profil Tenaga Medis"
        description={`Apakah Anda yakin ingin menghapus profil tenaga medis '${selected?.nama}'? Tindakan ini tidak dapat dibatalkan.`}
        loading={isSubmitting}
      />

      {/* ── Kelola Jadwal Dialog (Drawer-like Modal) ────────────── */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="max-w-4xl bg-white border rounded-2xl shadow-xl overflow-hidden p-0 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] px-6 py-5 pr-16 text-white flex justify-between items-center">
            <div>
              <DialogTitle className="text-base font-bold uppercase tracking-wider font-jakarta text-white">Kelola Jadwal Praktik</DialogTitle>
              <DialogDescription className="text-white/70 text-xs mt-1">Tenaga Medis: {selected?.nama}</DialogDescription>
            </div>
            <Button
              onClick={handleOpenAddScheduleSlot}
              className="bg-white hover:bg-slate-50 text-primary font-bold font-jakarta text-xs uppercase tracking-wider h-9 px-3 rounded-lg flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Tambah Slot
            </Button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
            {showScheduleAddForm && (
              <form onSubmit={handleSaveScheduleSlot} className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-200">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
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
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#737373]">Jam Mulai</Label>
                    <input
                      type="time"
                      required
                      value={scheduleForm.jam_mulai}
                      onChange={e => setScheduleForm(prev => ({ ...prev, jam_mulai: e.target.value }))}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#737373]">Jam Selesai</Label>
                    <input
                      type="time"
                      required
                      value={scheduleForm.jam_selesai}
                      onChange={e => setScheduleForm(prev => ({ ...prev, jam_selesai: e.target.value }))}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#737373]">Tipe Layanan</Label>
                    <select
                      value={scheduleForm.tipe_layanan}
                      onChange={e => setScheduleForm(prev => ({ ...prev, tipe_layanan: e.target.value }))}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-primary"
                    >
                      {SERVICE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#737373]">Kuota Pasien</Label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={scheduleForm.kuota}
                      onChange={e => setScheduleForm(prev => ({ ...prev, kuota: e.target.value }))}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#737373]">Lokasi Pemeriksaan</Label>
                    <input
                      type="text"
                      required
                      value={scheduleForm.lokasi}
                      onChange={e => setScheduleForm(prev => ({ ...prev, lokasi: e.target.value }))}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-primary"
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
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-primary"
                  />
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={scheduleForm.is_repeat}
                      onChange={e => setScheduleForm(prev => ({ ...prev, is_repeat: e.target.checked }))}
                      className="rounded text-primary focus:ring-primary size-4 border-slate-300"
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
                              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                                active
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-primary/30'
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
                    className="h-9 px-4 text-xs font-bold uppercase tracking-wider rounded-lg bg-primary text-white hover:bg-primary/90 flex items-center gap-1"
                  >
                    {isSavingSchedule && <span className="material-symbols-outlined animate-spin text-xs">sync</span>}
                    {editingScheduleSlot ? 'Simpan Slot' : 'Tambah Slot'}
                  </Button>
                </div>
              </form>
            )}

            {scheduleLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                <span className="material-symbols-outlined text-3xl animate-spin text-primary/50">sync</span>
                <p className="text-[10px] font-black uppercase tracking-widest">Memuat jadwal...</p>
              </div>
            ) : scheduleData.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl p-6">
                <span className="material-symbols-outlined text-slate-300 text-4xl">event_busy</span>
                <h3 className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-600">Belum Ada Slot Jadwal Praktik</h3>
                <p className="text-xs text-slate-400 mt-1">Tenaga medis ini belum memiliki jadwal praktik terdaftar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="py-3 px-4">Tanggal Pelayanan</th>
                      <th className="py-3 px-4">Waktu Praktik</th>
                      <th className="py-3 px-4">Tipe Layanan</th>
                      <th className="py-3 px-4">Lokasi</th>
                      <th className="py-3 px-4">Kuota</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                    {scheduleData.map((sch) => (
                      <tr key={sch.id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-4 font-bold text-slate-800">
                          {formatDisplayDate(sch.tanggal)}
                          {sch.is_repeat && (
                            <div className="mt-1 text-[8px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit uppercase tracking-widest">
                              Berulang: {sch.repeat_days}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-700">
                          {sch.jam_mulai} - {sch.jam_selesai}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20 font-bold uppercase tracking-wider text-[9px]">
                            {sch.tipe_layanan}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-500">{sch.lokasi || '-'}</td>
                        <td className="py-4 px-4 font-bold text-slate-850">{sch.kuota} Pasien</td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleOpenEditScheduleSlot(sch)}
                              className="inline-flex size-8 items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                              title="Edit Jadwal"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteScheduleSlot(sch.id)}
                              className="inline-flex size-8 items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-100 transition-colors"
                              title="Hapus Jadwal"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <DialogFooter className="p-6 border-t border-slate-100">
            <Button
              onClick={() => setIsScheduleOpen(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold font-jakarta text-xs uppercase tracking-wider h-11 rounded-xl"
            >
              Tutup Panel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detail Rekam Medis / Screening Dialog ─────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl bg-white border rounded-2xl shadow-xl overflow-hidden p-0 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] px-6 py-5 text-white">
            <DialogTitle className="text-base font-bold uppercase tracking-wider font-jakarta text-white">Detail Pemeriksaan & Screening</DialogTitle>
            <DialogDescription className="text-white/70 text-xs mt-1">Informasi lengkap hasil pemeriksaan fisik mahasiswa.</DialogDescription>
          </div>
          
          {detailItem && (
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Mahasiswa Info Card */}
              <div className="flex gap-4 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl">
                <StudentAvatar
                  src={getCleanImageUrl(detailItem.mahasiswa?.foto_url || detailItem.mahasiswa?.FotoURL)}
                  name={detailItem.mahasiswa?.Nama || detailItem.mahasiswa?.nama}
                  className="w-14 h-14 rounded-xl border border-neutral-200"
                />
                <div className="flex flex-col justify-center">
                  <div className="text-sm font-bold text-neutral-800 font-jakarta">{detailItem.mahasiswa?.Nama || detailItem.mahasiswa?.nama}</div>
                  <div className="text-xs text-neutral-400 font-bold mt-0.5">NIM: {detailItem.mahasiswa?.NIM || detailItem.mahasiswa?.nim}</div>
                  <div className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide mt-0.5">
                    {detailItem.mahasiswa?.program_studi?.nama || detailItem.mahasiswa?.ProgramStudi?.Nama} • {detailItem.mahasiswa?.fakultas?.Nama || detailItem.mahasiswa?.fakultas?.nama}
                  </div>
                </div>
              </div>

              {/* Vital Signs Grid */}
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#737373] mb-3">Tanda-Tanda Vital (Vital Signs)</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white border p-3 rounded-xl flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">Suhu Tubuh</span>
                    <span className="text-base font-black text-neutral-800 font-jakarta mt-0.5">{detailItem.suhu_tubuh || '—'} °C</span>
                  </div>
                  <div className="bg-white border p-3 rounded-xl flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">Tekanan Darah</span>
                    <span className="text-base font-black text-neutral-800 font-jakarta mt-0.5">{detailItem.sistole}/{detailItem.diastole || '—'} mmHg</span>
                  </div>
                  <div className="bg-white border p-3 rounded-xl flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">Denyut Nadi</span>
                    <span className="text-base font-black text-neutral-800 font-jakarta mt-0.5">{detailItem.denyut_nadi || '—'} bpm</span>
                  </div>
                  <div className="bg-white border p-3 rounded-xl flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">Saturasi Oksigen</span>
                    <span className="text-base font-black text-neutral-800 font-jakarta mt-0.5">{detailItem.spo2 || '—'} %</span>
                  </div>
                </div>
              </div>

              {/* Physical Measurements */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-neutral-100 p-3.5 rounded-xl bg-neutral-50/20">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase">Tinggi Badan</span>
                  <div className="text-sm font-bold text-neutral-800 font-jakarta mt-1">{detailItem.tinggi_badan || '—'} cm</div>
                </div>
                <div className="border border-neutral-100 p-3.5 rounded-xl bg-neutral-50/20">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase">Berat Badan</span>
                  <div className="text-sm font-bold text-neutral-800 font-jakarta mt-1">{detailItem.berat_badan || '—'} kg</div>
                </div>
                <div className="border border-neutral-100 p-3.5 rounded-xl bg-neutral-50/20">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase">Golongan Darah</span>
                  <div className="text-sm font-bold text-neutral-800 font-jakarta mt-1">{detailItem.golongan_darah || '—'}</div>
                </div>
              </div>

              {/* Clinical Details */}
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#737373] border-b pb-1">Detail Diagnosis & Tindakan</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">Keluhan Pasien</span>
                    <p className="text-xs text-neutral-750 font-medium leading-relaxed mt-1">{detailItem.catatan || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">Alergi Obat</span>
                    <p className="text-xs text-neutral-750 font-medium leading-relaxed mt-1">{detailItem.alergi_obat || 'Tidak Ada'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">Tindakan Diberikan</span>
                    <p className="text-xs text-neutral-750 font-medium leading-relaxed mt-1">{detailItem.tindakan_diberikan || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">Obat Diberikan</span>
                    <p className="text-xs text-neutral-750 font-medium leading-relaxed mt-1">{detailItem.obat_diberikan || '—'}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase">Rekomendasi / Saran Medis</span>
                  <p className="text-xs text-neutral-750 font-medium leading-relaxed mt-1 bg-primary/5 p-3 border border-primary/20 rounded-xl">
                    {detailItem.rekomendasi || '—'}
                  </p>
                </div>
              </div>

              {/* Officer / Practitioner Info */}
              <div className="border-t pt-4 flex justify-between items-center text-neutral-400 text-[10px] font-medium font-jakarta">
                <span>Pemeriksa: <strong className="text-neutral-700">{detailItem.tenaga_kes?.nama || 'Petugas Medis'}</strong></span>
                <span>Tanggal Sesi: <strong className="text-neutral-700">{new Date(detailItem.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
              </div>
            </div>
          )}

          <DialogFooter className="p-6 border-t border-slate-100">
            <Button
              onClick={() => setIsDetailOpen(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold font-jakarta text-xs uppercase tracking-wider h-11 rounded-xl"
            >
              Tutup Detail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

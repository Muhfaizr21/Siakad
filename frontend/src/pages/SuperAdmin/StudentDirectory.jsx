"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../services/api'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/Select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const UserX = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person_off</span>;
const UserIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const Building2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>business</span>;



const EMPTY_FORM = {
  NIM: '', Nama: '', EmailKampus: '', password: '', FakultasID: '',
  ProgramStudiID: '', SemesterSekarang: 1, StatusAkun: 'Aktif',
  Alamat: '', TahunMasuk: new Date().getFullYear()
}

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

function mapStatusAkun(statusAkun = '', statusAkademik = '') {
  const source = `${statusAkun} ${statusAkademik}`.toLowerCase()
  if (source.includes('lulus')) return 'Lulus'
  if (source.includes('cuti')) return 'Cuti'
  if (source.includes('non-aktif') || source.includes('nonaktif') || source.includes('mengundurkan') || source.includes('drop out') || source.includes('keluar')) return 'Non-Aktif'
  return 'Aktif'
}

function mapSemester(statusAkun = '', semester = 1) {
  if ((statusAkun || '').toLowerCase() === 'lulus') return 0
  const parsed = Number(semester)
  if (!Number.isInteger(parsed) || parsed < 1) return 1
  return parsed
}

function normalizeStudentRow(row = {}) {
  const normalizedStatus = mapStatusAkun(row.StatusAkun, row.StatusAkademik)
  return {
    ...row,
    StatusAkun: normalizedStatus,
    SemesterSekarang: mapSemester(normalizedStatus, row.SemesterSekarang)
  }
}

export default function StudentDirectory() {
  const [students, setStudents] = useState([])
  const [syncedNims, setSyncedNims] = useState(new Set())
  const [prodi, setProdi] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSyncing, setIsSyncing] = useState(false)

  const [activeTab, setActiveTab] = useState('profile')
  const [tabData, setTabData] = useState({
    kencana: null,
    counseling: null,
    healthBookings: null,
    healthRecords: null,
    scholarships: null,
    achievements: null,
    organisasi: null,
    aspirasi: null
  })
  const [tabLoading, setTabLoading] = useState({
    kencana: false,
    counseling: false,
    health: false,
    scholarships: false,
    achievements: false,
    organisasi: false,
    aspirasi: false
  })

  const fetchTabContext = async (tab, studentId) => {
    if (!studentId) return;
    const config = {
      headers: {
        'X-Student-ID': String(studentId)
      }
    };

    if (tab === 'kencana' && !tabData.kencana) {
      setTabLoading(prev => ({ ...prev, kencana: true }))
      try {
        const res = await api.get('/kencana/progress', config)
        if (res.data?.success || res.data) {
          setTabData(prev => ({ ...prev, kencana: res.data?.data || res.data }))
        }
      } catch (err) {
        console.error("Gagal memuat data PKKMB:", err)
      } finally {
        setTabLoading(prev => ({ ...prev, kencana: false }))
      }
    }

    if (tab === 'counseling_health' && (!tabData.counseling || !tabData.healthBookings || !tabData.healthRecords)) {
      setTabLoading(prev => ({ ...prev, health: true }))
      try {
        const [counsRes, hbRes, hrRes] = await Promise.allSettled([
          api.get('/counseling/psychologist-bookings', config),
          api.get('/student-health/bookings', config),
          api.get('/student-health/riwayat', config)
        ])

        const counselingData = counsRes.status === 'fulfilled' ? (counsRes.value.data?.data || counsRes.value.data) : []
        const healthBookingsData = hbRes.status === 'fulfilled' ? (hbRes.value.data?.data || hbRes.value.data) : []
        const healthRecordsData = hrRes.status === 'fulfilled' ? (hrRes.value.data?.data || hrRes.value.data) : []

        setTabData(prev => ({
          ...prev,
          counseling: counselingData,
          healthBookings: healthBookingsData,
          healthRecords: healthRecordsData
        }))
      } catch (err) {
        console.error("Gagal memuat data konseling & kesehatan:", err)
      } finally {
        setTabLoading(prev => ({ ...prev, health: false }))
      }
    }

    if (tab === 'akademik_beasiswa' && (!tabData.scholarships || !tabData.achievements)) {
      setTabLoading(prev => ({ ...prev, scholarships: true }))
      try {
        const [schRes, achRes] = await Promise.allSettled([
          api.get('/scholarship/riwayat', config),
          api.get('/achievement', config)
        ])

        const scholarshipsData = schRes.status === 'fulfilled' ? (schRes.value.data?.data || schRes.value.data) : []
        const achievementsData = achRes.status === 'fulfilled' ? (achRes.value.data?.data || achRes.value.data) : []

        setTabData(prev => ({
          ...prev,
          scholarships: scholarshipsData,
          achievements: achievementsData
        }))
      } catch (err) {
        console.error("Gagal memuat data beasiswa & prestasi:", err)
      } finally {
        setTabLoading(prev => ({ ...prev, scholarships: false }))
      }
    }

    if (tab === 'organisasi_aspirasi' && (!tabData.organisasi || !tabData.aspirasi)) {
      setTabLoading(prev => ({ ...prev, organisasi: true }))
      try {
        const [orgRes, aspRes] = await Promise.allSettled([
          api.get('/organisasi/pendaftaran', config),
          api.get('/student-voice', config)
        ])

        const organisasiData = orgRes.status === 'fulfilled' ? (orgRes.value.data?.data || orgRes.value.data) : []
        const aspirasiData = aspRes.status === 'fulfilled' ? (aspRes.value.data?.data || aspRes.value.data) : []

        setTabData(prev => ({
          ...prev,
          organisasi: organisasiData,
          aspirasi: aspirasiData
        }))
      } catch (err) {
        console.error("Gagal memuat data organisasi & aspirasi:", err)
      } finally {
        setTabLoading(prev => ({ ...prev, organisasi: false }))
      }
    }
  }

  const handleOpenDetail = (row) => {
    setSelected(row)
    setActiveTab('profile')
    setTabData({
      kencana: null,
      counseling: null,
      healthBookings: null,
      healthRecords: null,
      scholarships: null,
      achievements: null,
      organisasi: null,
      aspirasi: null
    })
    setIsDetailOpen(true)
  }

  const fetchData = async ({ syncFromPddikti = false, showSyncToast = false } = {}) => {
    setLoading(true)
    try {
      let latestSyncedNims = syncedNims
      if (syncFromPddikti) {
        const syncRes = await adminService.syncPddikti('Universitas Bhakti Kencana', 'all')
        const syncedList = syncRes?.data?.mahasiswa || []
        latestSyncedNims = new Set(syncedList.map(m => String(m?.nim || '').trim()).filter(Boolean))
        setSyncedNims(latestSyncedNims)
        if (showSyncToast) {
          toast.success('Sinkronisasi PDDikti Cluster Berhasil')
        }
      }
      const [stdRes, prodiRes, facRes] = await Promise.all([
        adminService.getAllStudents(),
        adminService.getAllProdi(),
        adminService.getAllFaculties()
      ])
      if (stdRes.status === 'success') {
        const allStudents = (stdRes.data || []).map(normalizeStudentRow)
        const filteredStudents = latestSyncedNims.size > 0
          ? allStudents.filter(s => latestSyncedNims.has(String(s?.NIM || '').trim()))
          : allStudents
        setStudents(filteredStudents)
      }
      if (prodiRes.status === 'success') setProdi(prodiRes.data || [])
      if (facRes.status === 'success') setFaculties(facRes.data || [])
    } catch {
      toast.error('Gagal memuat sinkronisasi cluster')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSyncPddikti = async () => {
    setIsSyncing(true)
    try {
      await fetchData({ syncFromPddikti: true, showSyncToast: true })
    } catch {
      toast.error('Gagal sinkronisasi PDDikti master-node')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleOpenAdd = () => { setIsEditMode(false); setForm(EMPTY_FORM); setIsCrudOpen(true) }

  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setForm({
      ID: row.id || row.ID,
      NIM: row.NIM || '',
      Nama: row.Nama || '',
      EmailKampus: row.EmailKampus || row.Pengguna?.Email || '',
      password: '',
      FakultasID: String(row.FakultasID || ''),
      ProgramStudiID: String(row.ProgramStudiID || ''),
      SemesterSekarang: row.SemesterSekarang || 1,
      StatusAkun: row.StatusAkun || 'Aktif',
      Alamat: row.Alamat || '',
      TahunMasuk: row.TahunMasuk || new Date().getFullYear()
    })
    setIsCrudOpen(true)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    const payload = {
      ...form,
      FakultasID: parseInt(form.FakultasID) || 0,
      ProgramStudiID: parseInt(form.ProgramStudiID) || 0,
      SemesterSekarang: parseInt(form.SemesterSekarang) || 1,
      TahunMasuk: parseInt(form.TahunMasuk) || new Date().getFullYear()
    }
    try {
      const targetId = form.ID || form.id
      const res = targetId ? await adminService.updateStudent(targetId, payload) : await adminService.createStudent(payload)
      if (res.status === 'success') {
        toast.success(targetId ? 'Profil mahasiswa berhasil diperbarui' : 'Registrasi mahasiswa baru berhasil')
        setIsCrudOpen(false)
        fetchData()
      } else {
        toast.error(res.message || 'Gagal menyimpan konfigurasi data')
      }
    } catch (err) {
      toast.error(err.message || 'Kesalahan operasional internal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteStudent(selected.id || selected.ID)
      toast.success('Entitas mahasiswa berhasil dihapus')
      setIsDelOpen(false)
      fetchData()
    } catch {
      toast.error('Gagal menghapus entitas data')
    } finally {
      setIsSubmitting(false)
    }
  }

  const STATUS_STYLES = {
    'Aktif': 'bg-green-50 text-green-600 border-green-100 shadow-none',
    'Cuti': 'bg-amber-50 text-amber-600 border-amber-100 shadow-none',
    'Lulus': 'bg-blue-50 text-blue-600 border-blue-100 shadow-none',
    'Non-Aktif': 'bg-red-50 text-red-600 border-red-100 shadow-none',
    'DEFAULT': 'bg-neutral-50 text-neutral-400 border-neutral-100'
  }

  const columns = [
    {
      key: 'NIM',
      label: 'ID / NIM',
      className: 'w-[120px]',
      render: v => (
        <code className="text-[12px] font-bold text-blue-600 tracking-[0.1em] bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
          {v || '—'}
        </code>
      )
    },
    {
      key: 'Nama',
      label: 'Identitas Mahasiswa',
      className: 'w-[280px]',
      render: (v, row) => (
        <div className="flex items-center gap-4 py-2 group/avatar">
          <StudentAvatar
            src={getCleanImageUrl(row.FotoURL || row.foto_url || row.Foto || row.Pengguna?.Foto || row.foto || row.pengguna?.foto)}
            name={v}
            className="w-11 h-11 rounded-xl border-2 border-white shadow-md transition-all group-hover/avatar:scale-110"
          />
          <div className="flex flex-col">
            <span className="font-black text-slate-800 font-headline tracking-tight text-[14px] leading-tight">
              {v ? v.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) : '—'}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-slate-400">
              <span className="material-symbols-outlined text-bku-primary/60" style={{ fontSize: '10px' }} >mail</span>
              <span className="text-[10px] font-black font-headline tracking-widest lowercase">{row.EmailKampus || row.Pengguna?.Email || '—'}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'Fakultas',
      label: 'Fakultas',
      className: 'w-[180px]',
      render: v => <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight font-headline leading-snug block truncate" title={v?.Nama || v?.nama}>{v?.Nama || v?.nama || '—'}</span>
    },
    {
      key: 'ProgramStudi',
      label: 'Program Studi',
      className: 'w-[200px]',
      render: v => <span className="text-[12px] font-black text-slate-700 font-headline tracking-tight leading-tight block truncate" title={v?.Nama || v?.nama}>{v?.Nama || v?.nama || '—'}</span>
    },
    {
      key: 'SemesterSekarang',
      label: 'Smstr',
      className: 'w-[60px] text-center',
      cellClassName: 'text-center',
      render: (v, row) => (
        <div className="flex flex-col items-center">
          <span className="font-black text-slate-800 font-headline text-sm tabular-nums leading-none">{row.StatusAkun === 'Lulus' ? '—' : (v || 1)}</span>
          {row.StatusAkun !== 'Lulus' && <span className="text-[8px] font-black text-slate-300 font-headline uppercase tracking-widest mt-1">Active</span>}
        </div>
      )
    },
    {
      key: 'StatusAkun',
      label: 'Status',
      className: 'w-[140px] text-center',
      cellClassName: 'text-center pr-4',
      render: v => (
        <Badge className={cn('px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider shadow-none', STATUS_STYLES[v] || STATUS_STYLES.DEFAULT)}>
          {v || 'Aktif'}
        </Badge>
      )
    }
  ]

  const studentStatusData = useMemo(() => {
    const counts = {}
    students.forEach(s => {
      const status = s.StatusAkun || 'Aktif'
      counts[status] = (counts[status] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [students])

  const studentFacultyData = useMemo(() => {
    const counts = {}
    students.forEach(s => {
      const facName = s.Fakultas?.Nama || s.Fakultas?.nama || 'Lainnya'
      const shortName = facName.replace('Fakultas ', '')
      counts[shortName] = (counts[shortName] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [students])

  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

  return (
    <div className="px-1 py-4 md:px-2 xl:px-4 min-h-screen bg-transparent font-inter">
      <Toaster position="top-right" />

      <div className="max-w-[1600px] mx-auto space-y-8 select-none">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="glass-card border border-slate-200/60 rounded-2xl p-5 md:p-8 relative overflow-hidden shadow-none">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-bku-primary/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2 w-full lg:w-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-bku-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-headline leading-none">Enrollment Governance</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-headline tracking-tight leading-none" style={{ color: 'var(--theme-h1)' }}>
                Direktori <span className="text-bku-primary">Mahasiswa</span>
              </h1>
              <p className="text-slate-400 font-medium text-[11px] max-w-2xl leading-relaxed">
                Database pusat manajemen akademik, sinkronisasi PDDikti cluster, dan verifikasi status aktif seluruh civitas akademika Universitas Bhakti Kencana.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <Button
                onClick={handleSyncPddikti}
                variant="outline"
                disabled={isSyncing}
                className="h-11 px-6 w-full sm:w-auto rounded-xl border-slate-200 text-[10px] font-black font-headline uppercase tracking-widest text-slate-600 hover:bg-slate-50 gap-2 transition-all active:scale-95 shadow-none justify-center cursor-pointer"
              >
                {isSyncing ? <span className="material-symbols-outlined animate-spin text-bku-primary" style={{ fontSize: '14px' }} >sync</span> : <RefreshCw size={14} className="text-bku-primary" />}
                {isSyncing ? 'Syncing...' : 'PDDIKTI Sync'}
              </Button>

              <Button
                onClick={handleOpenAdd}
                className="h-11 px-6 w-full sm:w-auto rounded-xl bg-slate-800 text-white hover:bg-bku-primary shadow-none gap-2 transition-all active:scale-95 border-none justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} strokeWidth={3}>add</span>
                <span className="text-[10px] font-black font-headline uppercase tracking-widest">New Registration</span>
              </Button>
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
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline animate-in fade-in">Total Mahasiswa</span>
            </div>
            <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{students.length}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Seluruh mahasiswa terdaftar</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex justify-center items-center text-emerald-600 flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >school</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline animate-in fade-in">Mahasiswa Aktif</span>
            </div>
            <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{students.filter(s => s.StatusAkun === 'Aktif').length}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Sedang menempuh studi</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex justify-center items-center text-blue-500 flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >trending_up</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline animate-in fade-in">Lulus</span>
            </div>
            <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{students.filter(s => s.StatusAkun === 'Lulus').length}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Telah menyelesaikan studi</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex justify-center items-center text-rose-500 flex-shrink-0">
                <UserX size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline animate-in fade-in">Non-Aktif</span>
            </div>
            <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{students.filter(s => s.StatusAkun !== 'Aktif' && s.StatusAkun !== 'Lulus').length}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Cuti / Keluar / DO</p>
          </div>
        </div>

        {/* ── Charts Section ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart: Mahasiswa per Fakultas */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-none">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center text-bku-primary flex-shrink-0">
                <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '18px' }} >bar_chart</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline animate-in fade-in">Distribusi Mahasiswa per Fakultas</span>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentFacultyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 8.5, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: "bold" }}
                  />
                  <Bar dataKey="count" name="Jumlah Mahasiswa" fill="var(--theme-primary, #00236f)" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Status Akademik */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-none flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex justify-center items-center text-emerald-600 flex-shrink-0">
                <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '18px' }} >pie_chart</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline animate-in fade-in">Status Akademik</span>
            </div>
            <div className="h-[140px] w-full flex items-center justify-center">
              {studentStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {studentStatusData.map((entry, index) => (
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
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {studentStatusData.slice(0, 4).map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 truncate leading-none">{item.name}</p>
                    <p className="text-xs font-extrabold text-slate-800 leading-none mt-1">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={students}
              loading={loading}
              searchPlaceholder="Search by NIM, Name, or Academic Status..."
              searchWidth="max-w-md"
              filters={[
                { key: 'StatusAkun', placeholder: 'Pilih Status', options: [{ label: 'Aktif', value: 'Aktif' }, { label: 'Cuti', value: 'Cuti' }, { label: 'Lulus', value: 'Lulus' }] },
                { key: 'FakultasID', placeholder: 'Pilih Fakultas', options: faculties.map(f => ({ label: f.Nama || f.nama, value: f.id || f.ID })) },
                { key: 'ProgramStudiID', placeholder: 'Pilih Program Studi', options: prodi.map(p => ({ label: p.Nama || p.nama, value: p.id || p.ID })) }
              ]}
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => handleOpenDetail(row)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-bku-primary hover:bg-bku-primary/5 rounded-lg transition-colors shadow-none cursor-pointer"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >visibility</span></Button>
                  <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-bku-primary hover:bg-bku-primary/5 rounded-lg transition-colors shadow-none cursor-pointer"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >edit</span></Button>
                  <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shadow-none cursor-pointer"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >delete</span></Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Detail Profile Modal ─────────────────────────────────── */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-4xl p-0 overflow-hidden border border-slate-200/60 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl animate-in zoom-in-95 duration-300">
            <DialogTitle className="sr-only">Profil Mahasiswa</DialogTitle>
            <DialogDescription className="sr-only">Informasi lengkap biodata mahasiswa</DialogDescription>
            {selected && (
              <div className="flex flex-col">
                {/* Profile Header Pattern */}
                <div className="h-24 sm:h-32 bg-slate-900 relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-bku-primary/30 to-transparent" />
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-white"><span className="material-symbols-outlined rotate-12" style={{ fontSize: '140px' }} >school</span></div>
                  <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 flex items-center gap-2">
                    <Badge className={cn("px-3 py-1 rounded-lg border-none text-[9px] font-black uppercase tracking-widest font-headline", STATUS_STYLES[selected.StatusAkun] || STATUS_STYLES.DEFAULT)}>
                      {selected.StatusAkun}
                    </Badge>
                  </div>
                </div>

                {/* Profile Content Section */}
                <div className="px-6 sm:px-10 relative">
                  <div className="relative -mt-10 sm:-mt-12 mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
                    <StudentAvatar
                      src={getCleanImageUrl(selected.FotoURL || selected.foto_url || selected.Foto || selected.Pengguna?.Foto || selected.foto || selected.pengguna?.foto)}
                      name={selected.Nama}
                      className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-[4px] sm:border-[6px] border-white shadow-2xl bg-white"
                    />
                    <div className="pb-1 sm:pb-2 space-y-1">
                      <h2 className="text-xl sm:text-2xl font-black font-headline tracking-tight leading-none text-slate-800">{selected.Nama}</h2>
                      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-slate-400">
                        <span className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] uppercase font-headline">{selected.NIM}</span>
                        <div className="hidden sm:block size-1 bg-slate-200 rounded-full" />
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest italic font-headline">{selected.ProgramStudi?.Nama}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tabs Implementation */}
                  <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); fetchTabContext(val, selected.id || selected.ID) }} className="w-full">
                    <TabsList className="w-full flex border-b border-slate-200 bg-slate-50/50 p-1 rounded-none justify-start overflow-x-auto gap-2">
                      <TabsTrigger value="profile" className="px-4 py-2 text-xs font-bold font-headline uppercase tracking-wider gap-1.5 cursor-pointer">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person</span>
                        Profile
                      </TabsTrigger>
                      <TabsTrigger value="kencana" className="px-4 py-2 text-xs font-bold font-headline uppercase tracking-wider gap-1.5 cursor-pointer">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>school</span>
                        PKKMB (Kencana)
                      </TabsTrigger>
                      <TabsTrigger value="counseling_health" className="px-4 py-2 text-xs font-bold font-headline uppercase tracking-wider gap-1.5 cursor-pointer">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>psychology</span>
                        Layanan (Konseling & Sehat)
                      </TabsTrigger>
                      <TabsTrigger value="akademik_beasiswa" className="px-4 py-2 text-xs font-bold font-headline uppercase tracking-wider gap-1.5 cursor-pointer">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>payments</span>
                        Beasiswa & Prestasi
                      </TabsTrigger>
                      <TabsTrigger value="organisasi_aspirasi" className="px-4 py-2 text-xs font-bold font-headline uppercase tracking-wider gap-1.5 cursor-pointer">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>groups</span>
                        Organisasi & Aspirasi
                      </TabsTrigger>
                    </TabsList>

                    <div className="py-6 max-h-[50vh] overflow-y-auto">
                      <TabsContent value="profile" className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4">
                            <div className="group">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 font-headline">Institutional Location</p>
                              <div className="flex items-start gap-3">
                                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-bku-primary transition-colors"><Building2 size={14} /></div>
                                <p className="text-[13px] font-black font-headline text-slate-700 leading-snug">{selected.Fakultas?.Nama || '—'}</p>
                              </div>
                            </div>
                            <div className="group">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 font-headline">Academic Cycle</p>
                              <div className="flex items-start gap-3">
                                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-bku-primary transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '14px' }} >schedule</span></div>
                                <p className="text-[13px] font-black font-headline text-slate-700 leading-snug">Semester {selected.StatusAkun === 'Lulus' ? 'Complete' : selected.SemesterSekarang} <span className="text-slate-400 mx-1">•</span> Batch {selected.TahunMasuk}</p>
                              </div>
                            </div>
                            <div className="group">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 font-headline">Academic Advisor (PA)</p>
                              <div className="flex items-start gap-3">
                                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-bku-primary transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '14px' }} >local_library</span></div>
                                <p className="text-[13px] font-black font-headline text-slate-700 leading-snug">{selected.DosenPA?.Nama || 'Advisor unassigned'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="group">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 font-headline">Digital Identity</p>
                              <div className="flex items-start gap-3">
                                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-bku-primary transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '14px' }} >mail</span></div>
                                <p className="text-[13px] font-black font-headline text-slate-700 leading-snug lowercase">{selected.EmailKampus || selected.Pengguna?.Email || '—'}</p>
                              </div>
                            </div>
                            <div className="group">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 font-headline">Residence</p>
                              <div className="flex items-start gap-3">
                                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-bku-primary transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '14px' }} >location_on</span></div>
                                <p className="text-[13px] font-black font-headline text-slate-700 leading-snug italic">{selected.Alamat || 'Residence unassigned'}</p>
                              </div>
                            </div>
                            <div className="group">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 font-headline">Parent / Guardian</p>
                              <div className="flex items-start gap-3">
                                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-bku-primary transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '14px' }} >family_restroom</span></div>
                                <p className="text-[13px] font-black font-headline text-slate-700 leading-snug">
                                  {selected.NamaOrangTua || '—'}
                                  {selected.TeleponOrangTua && <span className="text-slate-400 font-medium block text-[11px] mt-0.5">{selected.TeleponOrangTua}</span>}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="kencana">
                        {tabLoading.kencana ? (
                          <div className="space-y-4 py-8 flex flex-col items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined animate-spin text-bku-primary" style={{ fontSize: '28px' }}>sync</span>
                            <p className="text-xs font-semibold uppercase tracking-widest font-headline">Memuat Progres PKKMB...</p>
                          </div>
                        ) : tabData.kencana ? (
                          <div className="space-y-6">
                            {/* Overview Card */}
                            <div className={cn("p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
                              tabData.kencana.status_keseluruhan === 'lulus' ? 'bg-emerald-50/50 border-emerald-100' :
                                tabData.kencana.status_keseluruhan === 'berlangsung' ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50/50 border-slate-100'
                            )}>
                              <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Status Kelulusan Kencana</p>
                                <div className="flex items-center gap-2">
                                  <span className={cn("text-sm font-black font-headline uppercase tracking-wider px-2 py-0.5 rounded-lg",
                                    tabData.kencana.status_keseluruhan === 'lulus' ? 'bg-emerald-100 text-emerald-700' :
                                      tabData.kencana.status_keseluruhan === 'berlangsung' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                                  )}>
                                    {tabData.kencana.status_keseluruhan === 'lulus' ? 'Lulus' : tabData.kencana.status_keseluruhan === 'berlangsung' ? 'Berlangsung' : 'Belum Mulai'}
                                  </span>
                                  {tabData.kencana.has_sertifikat && (
                                    <span className="text-[9px] font-black uppercase tracking-widest font-headline text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">Sertifikat Terbit</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-left sm:text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Nilai Kumulatif</p>
                                <p className="text-2xl font-black font-headline text-slate-800">{tabData.kencana.nilai_kumulatif ? tabData.kencana.nilai_kumulatif.toFixed(1) : '0.0'}<span className="text-xs text-slate-400 font-bold"> / 100</span></p>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs font-bold font-headline text-slate-500">
                                <span>PROGRES KUIS ({tabData.kencana.kuis_selesai} / {tabData.kencana.total_kuis})</span>
                                <span>{tabData.kencana.total_kuis > 0 ? Math.round((tabData.kencana.kuis_selesai / tabData.kencana.total_kuis) * 100) : 0}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-bku-primary h-full rounded-full transition-all duration-300"
                                  style={{ width: `${tabData.kencana.total_kuis > 0 ? (tabData.kencana.kuis_selesai / tabData.kencana.total_kuis) * 100 : 0}%` }}
                                />
                              </div>
                            </div>

                            {/* Tahapan List */}
                            <div className="space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline">Tahapan PKKMB</p>
                              {tabData.kencana.tahaps && tabData.kencana.tahaps.length > 0 ? (
                                <div className="space-y-3">
                                  {tabData.kencana.tahaps.map((t, idx) => (
                                    <div key={idx} className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex justify-between items-center mb-3">
                                        <span className="font-bold text-slate-700 text-sm font-headline">{t.label}</span>
                                        <Badge className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-none border-none",
                                          t.status === 'selesai' ? 'bg-emerald-50 text-emerald-600' :
                                            t.status === 'berlangsung' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                                        )}>
                                          {t.status}
                                        </Badge>
                                      </div>
                                      {t.materis && t.materis.length > 0 ? (
                                        <div className="space-y-2">
                                          {t.materis.map((m, mIdx) => (
                                            <div key={mIdx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50/50">
                                              <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }}>
                                                  {m.tipe === 'video' ? 'movie' : m.tipe === 'pdf' ? 'picture_as_pdf' : 'description'}
                                                </span>
                                                <span className="font-semibold text-slate-600">{m.judul}</span>
                                              </div>
                                              {m.kuis && (
                                                <div className="flex items-center gap-3">
                                                  <span className="text-[10px] font-bold text-slate-400">Kuis: {m.kuis.judul_kuis}</span>
                                                  <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                    m.kuis.status === 'lulus' ? 'bg-emerald-100 text-emerald-700' :
                                                      m.kuis.status === 'tidak_lulus' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                                  )}>
                                                    {m.kuis.status === 'lulus' ? `Lulus (${m.kuis.nilai_terbaik})` : m.kuis.status === 'tidak_lulus' ? `Gagal (${m.kuis.nilai_terbaik})` : 'Belum'}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-[10px] font-semibold text-slate-400 italic">Tidak ada materi pada tahap ini</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs font-semibold text-slate-400 italic">Belum ada tahapan terdaftar</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-slate-400 italic">Data PKKMB tidak ditemukan</p>
                        )}
                      </TabsContent>

                      <TabsContent value="counseling_health">
                        {tabLoading.health ? (
                          <div className="space-y-4 py-8 flex flex-col items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined animate-spin text-bku-primary" style={{ fontSize: '28px' }}>sync</span>
                            <p className="text-xs font-semibold uppercase tracking-widest font-headline">Memuat Layanan Kesehatan & Konseling...</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Sesi Konseling */}
                            <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '14px' }}>psychology</span>
                                Riwayat Booking Konseling (Psikolog)
                              </p>
                              {tabData.counseling && tabData.counseling.length > 0 ? (
                                <div className="space-y-2">
                                  {tabData.counseling.map((c, idx) => (
                                    <div key={idx} className="border border-slate-100 rounded-xl p-3 bg-white hover:bg-slate-50/30 transition-colors flex justify-between items-center text-xs">
                                      <div className="space-y-1">
                                        <p className="font-bold text-slate-700">{c.Psychologist?.Nama || 'Psikolog BKU'}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Jadwal: {c.JadwalSesi ? new Date(c.JadwalSesi).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
                                        {c.LinkMeeting && <a href={c.LinkMeeting} target="_blank" rel="noreferrer" className="text-blue-500 font-bold hover:underline block text-[10px]">Link Konseling Online</a>}
                                      </div>
                                      <Badge className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-none border-none",
                                        c.Status === 'Selesai' || c.Status === 'selesai' ? 'bg-emerald-50 text-emerald-600' :
                                          c.Status === 'Menunggu' || c.Status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                      )}>
                                        {c.Status}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs font-semibold text-slate-400 italic p-3 border border-dashed border-slate-100 rounded-xl bg-slate-50/20">Belum ada booking konseling</p>
                              )}
                            </div>

                            {/* Riwayat Kesehatan */}
                            <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '14px' }}>favorite</span>
                                Bookings & Rekam Medis Kesehatan
                              </p>
                              {tabData.healthBookings && tabData.healthBookings.length > 0 ? (
                                <div className="space-y-2">
                                  {tabData.healthBookings.map((h, idx) => (
                                    <div key={idx} className="border border-slate-100 rounded-xl p-3 bg-white hover:bg-slate-50/30 transition-colors flex justify-between items-center text-xs">
                                      <div className="space-y-1">
                                        <p className="font-bold text-slate-700">Pemeriksaan: {h.HealthWorker?.Nama || 'Tenaga Kesehatan'}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Tanggal: {h.TanggalBooking ? new Date(h.TanggalBooking).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
                                        {h.Keluhan && <p className="text-[10px] text-slate-500 italic">"Keluhan: {h.Keluhan}"</p>}
                                      </div>
                                      <Badge className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-none border-none",
                                        h.Status === 'Selesai' || h.Status === 'selesai' ? 'bg-emerald-50 text-emerald-600' :
                                          h.Status === 'Menunggu' || h.Status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                      )}>
                                        {h.Status}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs font-semibold text-slate-400 italic p-3 border border-dashed border-slate-100 rounded-xl bg-slate-50/20">Belum ada riwayat layanan kesehatan</p>
                              )}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="akademik_beasiswa">
                        {tabLoading.scholarships ? (
                          <div className="space-y-4 py-8 flex flex-col items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined animate-spin text-bku-primary" style={{ fontSize: '28px' }}>sync</span>
                            <p className="text-xs font-semibold uppercase tracking-widest font-headline">Memuat Data Beasiswa & Prestasi...</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Riwayat Beasiswa */}
                            <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '14px' }}>payments</span>
                                Pengajuan Beasiswa
                              </p>
                              {tabData.scholarships && tabData.scholarships.length > 0 ? (
                                <div className="space-y-2">
                                  {tabData.scholarships.map((s, idx) => (
                                    <div key={idx} className="border border-slate-100 rounded-xl p-3 bg-white hover:bg-slate-50/30 transition-colors flex justify-between items-center text-xs">
                                      <div className="space-y-1">
                                        <p className="font-bold text-slate-700">{s.Scholarship?.Judul || s.Scholarship?.Nama || 'Program Beasiswa'}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Tanggal Daftar: {s.CreatedAt ? new Date(s.CreatedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
                                        {s.Catatan && <p className="text-[10px] text-slate-500">Keterangan: {s.Catatan}</p>}
                                      </div>
                                      <Badge className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-none border-none",
                                        s.Status === 'Disetujui' || s.Status === 'disetujui' || s.Status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                          s.Status === 'Menunggu' || s.Status === 'menunggu' || s.Status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                      )}>
                                        {s.Status}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs font-semibold text-slate-400 italic p-3 border border-dashed border-slate-100 rounded-xl bg-slate-50/20">Belum ada pengajuan beasiswa</p>
                              )}
                            </div>

                            {/* Daftar Prestasi */}
                            <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '14px' }}>emoji_events</span>
                                Prestasi Mahasiswa
                              </p>
                              {tabData.achievements && tabData.achievements.length > 0 ? (
                                <div className="space-y-2">
                                  {tabData.achievements.map((a, idx) => (
                                    <div key={idx} className="border border-slate-100 rounded-xl p-3 bg-white hover:bg-slate-50/30 transition-colors flex justify-between items-center text-xs">
                                      <div className="space-y-1">
                                        <p className="font-bold text-slate-700">{a.NamaKegiatan || a.NamaPrestasi}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Tingkat: {a.Tingkat} | Kategori: {a.Kategori}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Tahun: {a.Tahun || a.TahunPrestasi}</p>
                                      </div>
                                      <Badge className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-none border-none",
                                        a.StatusVerifikasi === 'Disetujui' || a.StatusVerifikasi === 'disetujui' || a.StatusVerifikasi === 'Approved' || a.IsVerified ? 'bg-emerald-50 text-emerald-600' :
                                          a.StatusVerifikasi === 'Menunggu' || a.StatusVerifikasi === 'menunggu' || a.StatusVerifikasi === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                      )}>
                                        {a.StatusVerifikasi || (a.IsVerified ? 'Disetujui' : 'Menunggu')}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs font-semibold text-slate-400 italic p-3 border border-dashed border-slate-100 rounded-xl bg-slate-50/20">Belum ada prestasi yang tercatat</p>
                              )}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="organisasi_aspirasi">
                        {tabLoading.organisasi ? (
                          <div className="space-y-4 py-8 flex flex-col items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined animate-spin text-bku-primary" style={{ fontSize: '28px' }}>sync</span>
                            <p className="text-xs font-semibold uppercase tracking-widest font-headline">Memuat Data Keanggotaan & Aspirasi...</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Keikutsertaan Ormawa */}
                            <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '14px' }}>groups</span>
                                Keikutsertaan Organisasi (Ormawa)
                              </p>
                              {tabData.organisasi && tabData.organisasi.length > 0 ? (
                                <div className="space-y-2">
                                  {tabData.organisasi.map((o, idx) => (
                                    <div key={idx} className="border border-slate-100 rounded-xl p-3 bg-white hover:bg-slate-50/30 transition-colors flex justify-between items-center text-xs">
                                      <div className="space-y-1">
                                        <p className="font-bold text-slate-700">{o.Ormawa?.Nama || o.NamaOrganisasi || 'Organisasi'}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Jabatan / Role: {o.Jabatan || 'Anggota'}</p>
                                      </div>
                                      <Badge className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-none border-none",
                                        o.Status === 'Aktif' || o.Status === 'aktif' || o.Status === 'Disetujui' ? 'bg-emerald-50 text-emerald-600' :
                                          o.Status === 'Menunggu' || o.Status === 'menunggu' || o.Status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                      )}>
                                        {o.Status}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs font-semibold text-slate-400 italic p-3 border border-dashed border-slate-100 rounded-xl bg-slate-50/20">Belum tergabung dalam organisasi</p>
                              )}
                            </div>

                            {/* Aspirasi Mahasiswa */}
                            <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-headline flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '14px' }}>campaign</span>
                                Aspirasi / Pengaduan Mahasiswa
                              </p>
                              {tabData.aspirasi && tabData.aspirasi.length > 0 ? (
                                <div className="space-y-2">
                                  {tabData.aspirasi.map((a, idx) => (
                                    <div key={idx} className="border border-slate-100 rounded-xl p-3 bg-white hover:bg-slate-50/30 transition-colors flex justify-between items-center text-xs">
                                      <div className="space-y-1">
                                        <p className="font-bold text-slate-700">{a.Judul || a.Subjek}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Kategori: {a.Kategori} | Tanggal: {a.CreatedAt ? new Date(a.CreatedAt).toLocaleDateString('id-ID') : '—'}</p>
                                        {a.Deskripsi && <p className="text-[10px] text-slate-500 truncate max-w-md">{a.Deskripsi}</p>}
                                      </div>
                                      <Badge className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-none border-none",
                                        a.Status === 'Selesai' || a.Status === 'selesai' || a.Status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' :
                                          a.Status === 'Diproses' || a.Status === 'diproses' || a.Status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                      )}>
                                        {a.Status || 'Menunggu'}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs font-semibold text-slate-400 italic p-3 border border-dashed border-slate-100 rounded-xl bg-slate-50/20">Belum pernah menyampaikan aspirasi</p>
                              )}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                {/* Footer Controls */}
                <footer className="p-6 sm:p-8 border-t border-slate-200/40 bg-white/40 flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="w-full sm:w-auto h-12 px-6 rounded-xl text-[10px] font-black font-headline uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all cursor-pointer">Dismiss</Button>
                  <Button onClick={() => { setIsDetailOpen(false); handleOpenEdit(selected) }} className="w-full sm:w-auto h-12 px-8 rounded-xl bg-slate-800 text-white text-[10px] font-black font-headline uppercase tracking-widest hover:bg-bku-primary shadow-none transition-all active:scale-95 border-none flex items-center justify-center gap-2 cursor-pointer font-headline">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >edit</span>
                    Modify Profile
                  </Button>
                </footer>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ── CRUD Modal ───────────────────────────────────────────── */}
        <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
          <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-xl p-0 overflow-hidden border border-slate-200/60 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300">
            <DialogHeader className="p-6 sm:p-8 pb-4 sm:pb-6 border-b border-slate-200/40 relative overflow-hidden bg-white/40">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-bku-primary"><UserIcon size={140} /></div>
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                    {isEditMode ? <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '12px' }} strokeWidth={3}>add</span>}
                  </div>
                  <span className="text-[10px] font-black font-headline uppercase tracking-widest text-bku-primary/60">Registry Engine</span>
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-black font-headline tracking-tight text-slate-800">
                  {isEditMode ? 'Update Identity' : 'Enroll Student'}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm font-medium text-slate-500 font-inter">
                  Lengkapi parameter identitas akademik untuk sinkronisasi database.
                </DialogDescription>
              </div>
            </DialogHeader>

            <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-5 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">NIM / Student ID</Label>
                  <Input required value={form.NIM} onChange={e => setForm({ ...form, NIM: e.target.value })} placeholder="BKU..." className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-800 focus:border-bku-primary font-jakarta tabular-nums" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Full Legal Name</Label>
                  <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Full name..." className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-800 focus:border-bku-primary font-jakarta" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Academic Email</Label>
                  <Input required type="email" value={form.EmailKampus} onChange={e => setForm({ ...form, EmailKampus: e.target.value })} placeholder="id@bku.ac.id" className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-800 focus:border-bku-primary font-jakarta" />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">
                    {isEditMode ? 'New Password (Optional)' : 'Account Password'}
                  </Label>
                  <Input
                    required={!isEditMode}
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder={isEditMode ? "Leave blank to keep current..." : "Set password..."}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-800 focus:border-bku-primary font-jakarta"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Faculty Branch</Label>
                  <Select value={String(form.FakultasID)} onValueChange={v => setForm({ ...form, FakultasID: v, ProgramStudiID: '' })}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/30 font-semibold text-slate-700 text-sm font-jakarta"><SelectValue placeholder="Pilih Fakultas" /></SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                      {faculties.map(f => <SelectItem key={f.id || f.ID} value={String(f.id || f.ID)} className="text-xs font-semibold text-slate-700 font-jakarta">{f.Nama}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Academic Program</Label>
                  <Select value={String(form.ProgramStudiID)} onValueChange={v => setForm({ ...form, ProgramStudiID: v })}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/30 font-semibold text-slate-700 text-sm font-jakarta"><SelectValue placeholder="Pilih Prodi" /></SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                      {prodi.filter(p => !form.FakultasID || parseInt(p.FakultasID) === parseInt(form.FakultasID)).map(p => (
                        <SelectItem key={p.id || p.ID} value={String(p.id || p.ID)} className="text-xs font-semibold text-slate-700 font-jakarta">{p.Nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Account Status</Label>
                  <Select value={form.StatusAkun} onValueChange={v => setForm({ ...form, StatusAkun: v })}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/30 font-semibold text-slate-700 text-sm font-jakarta"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                      {['Aktif', 'Cuti', 'Lulus', 'Nonaktif'].map(s => <SelectItem key={s} value={s} className="text-xs font-semibold text-slate-700 font-jakarta">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Current Semester</Label>
                  <Input type="number" min={1} max={14} value={form.SemesterSekarang} onChange={e => setForm({ ...form, SemesterSekarang: e.target.value })} className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-850 focus:border-bku-primary font-jakarta tabular-nums" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 font-jakarta">Admission Batch (Year)</Label>
                  <Input type="number" value={form.TahunMasuk} onChange={e => setForm({ ...form, TahunMasuk: e.target.value })} className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-semibold text-sm text-slate-850 focus:border-bku-primary font-jakarta tabular-nums" />
                </div>
              </div>
            </form>

            <footer className="p-6 sm:p-8 border-t border-slate-200/40 bg-white/40 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="w-full sm:w-auto h-12 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 font-jakarta hover:bg-slate-100 transition-all cursor-pointer">Batal</Button>
              <Button onClick={handleSave} disabled={isSubmitting} className="w-full sm:w-auto h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-bku-primary shadow-none transition-all active:scale-95 border-none flex items-center justify-center gap-2 cursor-pointer font-jakarta">
                {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '15px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >save</span>}
                <span className="text-xs font-bold uppercase tracking-wider">{isEditMode ? 'Simpan Perubahan' : 'Daftarkan Mahasiswa'}</span>
              </Button>
            </footer>
          </DialogContent>
        </Dialog>

        <DeleteConfirmModal
          isOpen={isDelOpen}
          onClose={() => setIsDelOpen(false)}
          onConfirm={handleDelete}
          title="Destroy Student Entity?"
          description="Seluruh data akademik, riwayat registrasi, dan kaitan entitas mahasiswa ini akan dihapus permanen dari basis data sistem. Prosedur ini tidak dapat dibatalkan."
          loading={isSubmitting}
        />
      </div>
    </div>
  )
}

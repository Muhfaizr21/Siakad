"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { toast, Toaster } from 'react-hot-toast'
import { adminService } from '../../../services/api'
import { PageContent, PageCard, PageCardHeader } from '@/components/ui/page'
import { DashboardHero, DashboardStatCard, DashboardStatGrid, DashboardFilter, DashboardQuickActions, FilterItem } from '@/components/ui/dashboard'
import { SelectField, SelectOption } from '@/components/ui/SelectField'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { Card, CardContent } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"

export default function PsychologistDashboard() {
  const [data, setData] = useState([])
  const [bookings, setBookings] = useState([])
  const [referrals, setReferrals] = useState([])
  const [periods, setPeriods] = useState([])
  const [faculties, setFaculties] = useState([])
  const [prodis, setProdis] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [insightsTab, setInsightsTab] = useState('list')

  const [activeFilters, setActiveFilters] = useState({
    facultyId: localStorage.getItem('superadmin_fakultas_id') || 'all',
    prodiId: localStorage.getItem('superadmin_prodi_id') || 'all',
    periodId: localStorage.getItem('superadmin_period_id') || 'all'
  })

  useEffect(() => {
    const handleStorageChange = () => {
      setActiveFilters({
        facultyId: localStorage.getItem('superadmin_fakultas_id') || 'all',
        prodiId: localStorage.getItem('superadmin_prodi_id') || 'all',
        periodId: localStorage.getItem('superadmin_period_id') || 'all'
      })
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [psRes, bkRes, rfRes, periodsRes, facRes, prodiRes] = await Promise.all([
        adminService.getAllPsychologists(),
        adminService.getPsychologistBookings(),
        adminService.getPsychologistReferrals(),
        adminService.getAllAcademicPeriods(),
        adminService.getAllFaculties(),
        adminService.getAllProdi()
      ])

      if (psRes.status === 'success') setData(psRes.data || [])
      if (bkRes.status === 'success') setBookings(bkRes.data || [])
      if (rfRes.status === 'success') setReferrals(rfRes.data || [])
      if (periodsRes.status === 'success') setPeriods(periodsRes.data || [])
      if (facRes.status === 'success') setFaculties(facRes.data || [])
      if (prodiRes.status === 'success') setProdis(prodiRes.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Koneksi sistem terputus / Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const isDateInPeriod = (dateStr, period) => {
    if (!dateStr || !period) return false
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    const years = (period.AcademicYear || period.tahun_ajaran || '')?.split('/') || []
    if (years.length !== 2) return false
    const startYear = parseInt(years[0])
    const endYear = parseInt(years[1])

    const sem = period.Semester || period.semester || ''
    if (sem === 'Ganjil') {
      return (year === startYear && month >= 8 && month <= 12) || (year === endYear && month === 1)
    } else if (sem === 'Genap') {
      return (year === endYear && month >= 2 && month <= 7)
    }
    return false
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const mhs = b.mahasiswa || b.Mahasiswa
      if (!mhs) return false

      if (activeFilters.facultyId !== 'all') {
        const mhsFacId = String(mhs.FakultasID || mhs.fakultas_id || mhs.Fakultas?.id || mhs.Fakultas?.ID || mhs.fakultas?.id || mhs.fakultas?.ID || '')
        if (mhsFacId !== String(activeFilters.facultyId)) return false
      }

      if (activeFilters.prodiId !== 'all') {
        const mhsProdiId = String(mhs.ProgramStudiID || mhs.program_studi_id || mhs.ProgramStudi?.id || mhs.ProgramStudi?.ID || mhs.program_studi?.id || mhs.program_studi?.ID || '')
        if (mhsProdiId !== String(activeFilters.prodiId)) return false
      }

      if (activeFilters.periodId !== 'all') {
        const selectedPeriod = periods.find(p => String(p.id || p.ID) === String(activeFilters.periodId))
        if (selectedPeriod) {
          const dateStr = b.tanggal || b.Tanggal
          if (!isDateInPeriod(dateStr, selectedPeriod)) return false
        }
      }

      return true
    })
  }, [bookings, activeFilters, periods])

  const filteredReferrals = useMemo(() => {
    return referrals.filter(r => {
      const mhs = r.mahasiswa || r.Mahasiswa
      if (!mhs) return false

      if (activeFilters.facultyId !== 'all') {
        const mhsFacId = String(mhs.FakultasID || mhs.fakultas_id || mhs.Fakultas?.id || mhs.Fakultas?.ID || mhs.fakultas?.id || mhs.fakultas?.ID || '')
        if (mhsFacId !== String(activeFilters.facultyId)) return false
      }

      if (activeFilters.prodiId !== 'all') {
        const mhsProdiId = String(mhs.ProgramStudiID || mhs.program_studi_id || mhs.ProgramStudi?.id || mhs.ProgramStudi?.ID || mhs.program_studi?.id || mhs.program_studi?.ID || '')
        if (mhsProdiId !== String(activeFilters.prodiId)) return false
      }

      if (activeFilters.periodId !== 'all') {
        const selectedPeriod = periods.find(p => String(p.id || p.ID) === String(activeFilters.periodId))
        if (selectedPeriod) {
          const dateStr = r.tanggal_dibuat || r.TanggalDibuat || r.CreatedAt || r.created_at
          if (!isDateInPeriod(dateStr, selectedPeriod)) return false
        }
      }

      return true
    })
  }, [referrals, activeFilters, periods])

  const getTodayBookingsCount = () => {
    return filteredBookings.filter(b => {
      const d = b.tanggal || b.Tanggal
      if (!d) return false
      const bd = new Date(d)
      const today = new Date()
      return bd.getFullYear() === today.getFullYear() &&
        bd.getMonth() === today.getMonth() &&
        bd.getDate() === today.getDate()
    }).length
  }

  const topicChartData = useMemo(() => {
    const counts = {}
    filteredBookings.forEach(b => {
      const t = b.topik || b.Topik || 'Lainnya'
      const normalized = t.trim()
      counts[normalized] = (counts[normalized] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [filteredBookings])

  const modeChartData = useMemo(() => {
    const counts = { 'Online': 0, 'Tatap Muka': 0 }
    filteredBookings.forEach(b => {
      const m = b.mode || b.Mode || 'Tatap Muka'
      const key = m === 'Online' ? 'Online' : 'Tatap Muka'
      counts[key]++
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
  }, [filteredBookings])

  const specializationData = useMemo(() => {
    const counts = {}
    data.forEach(p => {
      const sp = p.spesialisasi || p.Spesialisasi || 'Umum'
      counts[sp] = (counts[sp] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  const monthlyBookingData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const counts = Array(12).fill(0)
    filteredBookings.forEach(b => {
      const d = b.tanggal || b.Tanggal
      if (d) {
        const date = new Date(d)
        counts[date.getMonth()]++
      }
    })
    return months.map((name, index) => ({
      name,
      'Jumlah Booking': counts[index]
    }))
  }, [filteredBookings])

  const stats = useMemo(() => {
    const totalBookings = filteredBookings.length
    const selesaiBookings = filteredBookings.filter(b => {
      const statusLower = String(b.status || b.Status || '').toLowerCase()
      return statusLower === 'selesai' || statusLower === 'completed' || statusLower === 'disetujui' || statusLower === 'confirmed'
    }).length
    const tingkatPenyelesaian = totalBookings > 0 ? ((selesaiBookings / totalBookings) * 100).toFixed(0) + '%' : '0%'

    const activePsychologists = data.filter(p => p.is_aktif ?? p.IsAktif).length
    const rerataBebanKerja = activePsychologists > 0 ? (totalBookings / activePsychologists).toFixed(1) : '0'

    return {
      tingkatPenyelesaian,
      rerataBebanKerja
    }
  }, [filteredBookings, data])

  const topStudentsData = useMemo(() => {
    const studentCounts = {}
    filteredBookings.forEach(b => {
      const mhs = b.mahasiswa || b.Mahasiswa
      if (!mhs) return
      const nim = mhs.NIM || mhs.nim || ''
      const name = mhs.Nama || mhs.nama || '—'
      const prodi = mhs.program_studi?.nama || mhs.ProgramStudi?.Nama || mhs.program_studi?.Nama || '—'
      const fakultas = mhs.fakultas?.Nama || mhs.Fakultas?.Nama || mhs.fakultas?.nama || mhs.Fakultas?.nama || ''
      if (!nim) return

      if (!studentCounts[nim]) {
        studentCounts[nim] = {
          nim,
          name,
          prodi,
          fakultas,
          count: 0
        }
      }
      studentCounts[nim].count++
    })

    return Object.values(studentCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filteredBookings])

  const psychologistWorkload = useMemo(() => {
    const counts = {}
    filteredBookings.forEach(b => {
      const psId = b.psikolog_id || b.PsikologID || b.psikolog?.id || b.psikolog?.ID || ''
      if (psId) {
        counts[psId] = (counts[psId] || 0) + 1
      }
    })
    return counts
  }, [filteredBookings])

  const bookingColumns = [
    {
      key: 'mahasiswa',
      label: 'Mahasiswa',
      className: 'w-[220px]',
      render: (v, row) => {
        const mhs = row.mahasiswa || row.Mahasiswa;
        return (
          <div className="flex flex-col py-1 font-inter">
            <span className="font-bold text-[var(--theme-text)] text-xs">{mhs?.Nama || mhs?.nama || '—'}</span>
            <span className="text-[10px] text-[var(--theme-text-muted)] font-bold">{mhs?.NIM || mhs?.nim || '—'}</span>
            <span className="text-[9px] text-[var(--theme-text-muted)]/80 font-medium tracking-wide uppercase">{mhs?.program_studi?.nama || mhs?.ProgramStudi?.Nama || '—'}</span>
          </div>
        )
      }
    },
    {
      key: 'psikolog',
      label: 'Psikolog / Konselor',
      className: 'w-[200px]',
      render: (v, row) => (
        <div className="flex flex-col py-1 font-inter">
          <span className="font-bold text-[var(--theme-text)] text-xs">{row.psikolog?.nama || '—'}</span>
          <span className="text-[9px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider">{row.psikolog?.spesialisasi || '—'}</span>
        </div>
      )
    },
    {
      key: 'tanggal',
      label: 'Jadwal',
      className: 'w-[180px]',
      render: (v, row) => {
        const formattedDate = v ? new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        return (
          <div className="flex flex-col py-1 font-inter">
            <span className="font-bold text-[var(--theme-text)] text-xs">{formattedDate}</span>
            <span className="text-[10px] text-[var(--theme-text-muted)] font-semibold">{row.jam_mulai} - {row.jam_selesai}</span>
          </div>
        )
      }
    },
    {
      key: 'topik',
      label: 'Topik',
      className: 'w-[120px]',
      render: v => <span className="text-[9px] font-bold text-[var(--theme-primary)] bg-[var(--theme-primary-light)] px-2.5 py-0.5 rounded-lg border border-[var(--theme-primary)]/10">{v || 'Lainnya'}</span>
    },
    {
      key: 'mode',
      label: 'Metode',
      className: 'w-[120px]',
      render: v => (
        <Badge className={cn('px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shadow-none bg-surface',
          v === 'Online' ? 'text-[var(--theme-primary)] border-[var(--theme-primary)]/20 bg-[var(--theme-primary-light)]' : 'text-slate-600 border-slate-200 bg-slate-50'
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
        let bg = 'text-neutral-600 border-neutral-100 bg-neutral-50'
        if (statusLower === 'dikonfirmasi' || statusLower === 'selesai' || statusLower === 'disetujui') {
          bg = 'text-emerald-600 border-emerald-100 bg-emerald-50'
        } else if (statusLower === 'menunggu konfirmasi' || statusLower === 'waiting' || statusLower === 'pending' || statusLower === 'menunggu') {
          bg = 'text-amber-600 border-amber-100 bg-amber-50'
        } else if (statusLower === 'ditolak' || statusLower === 'dibatalkan') {
          bg = 'text-rose-600 border-rose-100 bg-rose-50'
        }
        return (
          <Badge className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border shadow-none', bg)}>
            {v || 'Menunggu'}
          </Badge>
        )
      }
    }
  ]

  const PIE_COLORS = ['var(--theme-primary)', 'var(--theme-secondary)', 'var(--theme-warning)', 'var(--theme-success)']

  return (
    <PageContent>
      <Toaster position="top-right" />

      {/* ── Page Header ─────────────────────────────────────────── */}
      <DashboardHero
        title="Dashboard"
        highlightedTitle="Psikologi"
        subtitle="Analisis data booking konseling, beban kerja psikolog, dan statistik performa layanan bimbingan mahasiswa."
        icon="analytics"
        badges={[
          { label: 'Akses Validasi', active: false },
          { label: 'Super Admin Portal', active: true }
        ]}
      />

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center gap-4 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-sm">
          <span className="material-symbols-outlined animate-spin text-[var(--theme-primary)]" style={{ fontSize: '40px' }}>sync</span>
          <span className="text-sm font-bold text-[var(--theme-text-muted)] uppercase tracking-widest">Memuat Dashboard...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Stats Grid ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Card 1: Total Psikolog */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">group</span>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Total Psikolog</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[var(--theme-text)] font-headline">{data.length}</span>
                  <span className="text-[10px] font-semibold text-[var(--theme-text-muted)]">Ahli</span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--theme-text-muted)]/70 font-medium mt-3 leading-normal border-t border-[var(--theme-border-muted)] pt-2.5">
                Tenaga ahli terdaftar
              </p>
            </div>

            {/* Card 2: Tingkat Penyelesaian */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-info/10 text-info border border-info/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">task_alt</span>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Penyelesaian</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[var(--theme-text)] font-headline">{stats.tingkatPenyelesaian}</span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--theme-text-muted)]/70 font-medium mt-3 leading-normal border-t border-[var(--theme-border-muted)] pt-2.5">
                Rasio sesi konseling selesai
              </p>
            </div>

            {/* Card 3: Rerata Beban Kerja */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-success/10 text-success border border-success/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">analytics</span>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Beban Kerja</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[var(--theme-text)] font-headline">{stats.rerataBebanKerja}</span>
                  <span className="text-[10px] font-semibold text-[var(--theme-text-muted)]">Sesi/Aktif</span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--theme-text-muted)]/70 font-medium mt-3 leading-normal border-t border-[var(--theme-border-muted)] pt-2.5">
                Sesi / psikolog aktif
              </p>
            </div>

            {/* Card 4: Rujukan Eksternal */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">forward_to_inbox</span>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Rujukan</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[var(--theme-text)] font-headline">{filteredReferrals.length}</span>
                  <span className="text-[10px] font-semibold text-[var(--theme-text-muted)]">Surat</span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--theme-text-muted)]/70 font-medium mt-3 leading-normal border-t border-[var(--theme-border-muted)] pt-2.5">
                Surat rujukan dikirim
              </p>
            </div>

            {/* Card 5: Booking Hari Ini */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-error/10 text-error border border-error/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">calendar_month</span>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Hari Ini</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[var(--theme-text)] font-headline">{getTodayBookingsCount()}</span>
                  <span className="text-[10px] font-semibold text-[var(--theme-text-muted)]">Sesi</span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--theme-text-muted)]/70 font-medium mt-3 leading-normal border-t border-[var(--theme-border-muted)] pt-2.5">
                Janji temu hari ini
              </p>
            </div>
          </div>

          {/* ── Quick Actions Panel ─────────────────────────────────── */}
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--theme-border)] bg-[var(--theme-bg)] flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--theme-primary)] font-headline">Akses Cepat Pengelolaan</h2>
              <span className="text-xs font-medium text-[var(--theme-text-muted)]">Pintasan Menu Utama</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-[var(--theme-border)]">
              <Link to="/admin/psychologists/list" className="p-6 hover:bg-[var(--theme-bg)] transition-all duration-300 group text-left flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
                    <span className="material-symbols-outlined text-xl">groups</span>
                  </div>
                  <h3 className="font-bold text-[var(--theme-text)] text-sm mb-1 group-hover:text-primary transition-colors font-headline">Direktori Psikolog</h3>
                  <p className="text-xs text-[var(--theme-text-muted)] font-medium leading-relaxed">Kelola akun, penugasan, dan status aktif tenaga ahli psikologi.</p>
                </div>
              </Link>

              <Link to="/admin/psychologists/bookings" className="p-6 hover:bg-[var(--theme-bg)] transition-all duration-300 group text-left flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-info/10 text-info border border-info/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
                    <span className="material-symbols-outlined text-xl">calendar_month</span>
                  </div>
                  <h3 className="font-bold text-[var(--theme-text)] text-sm mb-1 group-hover:text-info transition-colors font-headline">Booking Konseling</h3>
                  <p className="text-xs text-[var(--theme-text-muted)] font-medium leading-relaxed">Pantau agenda jadwal dan verifikasi status janji temu mahasiswa.</p>
                </div>
              </Link>

              <Link to="/admin/psychologists/medical-records" className="p-6 hover:bg-[var(--theme-bg)] transition-all duration-300 group text-left flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning border border-warning/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
                    <span className="material-symbols-outlined text-xl">medical_services</span>
                  </div>
                  <h3 className="font-bold text-[var(--theme-text)] text-sm mb-1 group-hover:text-warning transition-colors font-headline">Rekam Medis</h3>
                  <p className="text-xs text-[var(--theme-text-muted)] font-medium leading-relaxed">Akses log konsultasi klinis, rekap screening, dan catatan sesi.</p>
                </div>
              </Link>

              <Link to="/admin/psychologists/referrals" className="p-6 hover:bg-[var(--theme-bg)] transition-all duration-300 group text-left flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
                    <span className="material-symbols-outlined text-xl">forward_to_inbox</span>
                  </div>
                  <h3 className="font-bold text-[var(--theme-text)] text-sm mb-1 group-hover:text-secondary transition-colors font-headline">Surat Rujukan</h3>
                  <p className="text-xs text-[var(--theme-text-muted)] font-medium leading-relaxed">Pantau rujukan eksternal mahasiswa ke fasilitas kesehatan luar.</p>
                </div>
              </Link>
            </div>
          </div>

          {/* ── Main Charts Grid ────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {/* Line Chart: Tren Booking Bulanan */}
            <div className="lg:col-span-2">
              <PageCard className="h-full">
                <PageCardHeader title="Tren Booking Bulanan" icon="show_chart" />
                <div className="h-[240px] w-full mt-4">
                  {filteredBookings.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={monthlyBookingData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border-muted)" />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: "bold", color: "var(--theme-text)" }}
                        />
                        <Line type="monotone" dataKey="Jumlah Booking" stroke="var(--theme-primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'var(--theme-surface)' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-[var(--theme-text-muted)] italic">Tidak ada data booking</div>
                  )}
                </div>
              </PageCard>
            </div>

            {/* Pie Chart: Metode Konseling */}
            <div className="lg:col-span-1">
              <PageCard className="h-full flex flex-col justify-between">
                <PageCardHeader title="Metode Konseling" icon="pie_chart" />
                <div className="h-[140px] w-full flex items-center justify-center mt-4">
                  {modeChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie
                          data={modeChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {modeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "10px", fontWeight: "bold", color: "var(--theme-text)" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-[var(--theme-text-muted)] italic">Tidak ada data</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {modeChartData.slice(0, 4).map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border-muted)]">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-[var(--theme-text-muted)] truncate leading-none">{item.name}</p>
                        <p className="text-xs font-extrabold text-[var(--theme-text)] leading-none mt-1">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </PageCard>
            </div>
          </div>

          {/* ── Insights Bento Grid 2 ───────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {/* Left Column (span 2): Toggleable Card (Daftar Psikolog vs Sebaran Spesialisasi) */}
            <div className="lg:col-span-2">
              <PageCard className="h-full flex flex-col">
                <PageCardHeader 
                  title={insightsTab === 'list' ? "Daftar Psikolog & Beban Kerja" : "Sebaran Spesialisasi Psikolog"} 
                  icon={insightsTab === 'list' ? "supervisor_account" : "badge"}
                  action={
                    <div className="flex items-center gap-1 bg-[var(--theme-bg)] border border-[var(--theme-border-muted)] p-1 rounded-xl">
                      <button
                        onClick={() => setInsightsTab('list')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                          insightsTab === 'list'
                            ? "bg-[var(--theme-surface)] text-[var(--theme-primary)] shadow-sm border border-[var(--theme-border)]"
                            : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border border-transparent"
                        )}
                      >
                        Daftar Psikolog
                      </button>
                      <button
                        onClick={() => setInsightsTab('distribution')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                          insightsTab === 'distribution'
                            ? "bg-[var(--theme-surface)] text-[var(--theme-primary)] shadow-sm border border-[var(--theme-border)]"
                            : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border border-transparent"
                        )}
                      >
                        Sebaran
                      </button>
                    </div>
                  }
                />
                
                {insightsTab === 'list' ? (
                  <div className="mt-4 space-y-3 flex-1">
                    {data.length > 0 ? (
                      data.map((p) => {
                        const psId = p.id || p.ID;
                        const workload = psychologistWorkload[psId] || 0;
                        const isActive = p.is_aktif ?? p.IsAktif;
                        return (
                          <div 
                            key={psId} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[var(--theme-bg)] border border-[var(--theme-border-muted)] hover:border-[var(--theme-primary)]/30 hover:bg-slate-50/50 transition-all duration-200 gap-3 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center font-bold text-sm shrink-0 border border-[var(--theme-primary)]/10">
                                {p.nama?.charAt(0).toUpperCase() || 'P'}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-xs font-bold text-[var(--theme-text)] truncate">{p.nama}</h4>
                                  <Badge className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border shadow-none",
                                    isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"
                                  )}>
                                    {isActive ? "Aktif" : "Non-Aktif"}
                                  </Badge>
                                </div>
                                <p className="text-[10px] text-[var(--theme-text-muted)] font-medium mt-0.5">{p.spesialisasi || 'Spesialis Umum'}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[9px] text-[var(--theme-text-muted)]/70">
                                  <span className="flex items-center gap-0.5"><span className="material-symbols-outlined !text-[10px]">mail</span>{p.email || '—'}</span>
                                  <span className="flex items-center gap-0.5"><span className="material-symbols-outlined !text-[10px]">phone</span>{p.no_hp || '—'}</span>
                                  <span className="flex items-center gap-0.5"><span className="material-symbols-outlined !text-[10px]">location_on</span>{p.lokasi || 'Klinik Kampus'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0 sm:self-center bg-[var(--theme-surface)] border border-[var(--theme-border-muted)] px-3 py-2 rounded-xl text-center min-w-[120px]">
                              <div className="w-full text-center">
                                <span className="text-[8px] font-black text-[var(--theme-text-muted)] uppercase block leading-none">Beban Kerja</span>
                                <span className="text-xs font-extrabold text-[var(--theme-primary)] mt-1.5 block leading-none">{workload} Sesi</span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="py-12 text-center text-xs text-[var(--theme-text-muted)] italic">
                        Tidak ada data psikolog terdaftar
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 space-y-4 flex-1">
                    {specializationData.length > 0 ? (
                      specializationData.map((item, idx) => {
                        const percentage = data.length > 0 ? Math.round((item.value / data.length) * 100) : 0;
                        // Dynamic colors matching theme gradients
                        const barColors = [
                          'bg-[var(--theme-primary)]',
                          'bg-[var(--theme-secondary)]',
                          'bg-[var(--theme-info)]',
                          'bg-[var(--theme-warning)]',
                          'bg-[var(--theme-success)]'
                        ];
                        const textColorClasses = [
                          'text-[var(--theme-primary)]',
                          'text-[var(--theme-secondary)]',
                          'text-[var(--theme-info)]',
                          'text-[var(--theme-warning)]',
                          'text-[var(--theme-success)]'
                        ];
                        const colorClass = barColors[idx % barColors.length];
                        const textColorClass = textColorClasses[idx % textColorClasses.length];

                        return (
                          <div key={item.name} className="space-y-1.5 text-left font-inter">
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className="text-[var(--theme-text)] font-bold truncate max-w-[320px]" title={item.name}>{item.name}</span>
                              <span className={cn("font-black text-[10px] shrink-0", textColorClass)}>{item.value} Ahli ({percentage}%)</span>
                            </div>
                            <div className="w-full h-2 bg-[var(--theme-border-muted)] rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full rounded-full transition-all duration-500", colorClass)} 
                                style={{ width: `${percentage}%` }} 
                              />
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="py-8 text-center text-xs text-[var(--theme-text-muted)] italic">Tidak ada data spesialisasi</div>
                    )}
                  </div>
                )}
              </PageCard>
            </div>

            {/* Right Column (span 1): Mahasiswa Teraktif */}
            <div className="lg:col-span-1">
              <PageCard className="h-full flex flex-col">
                <PageCardHeader title="Mahasiswa Teraktif" icon="group" />
                <div className="mt-4 space-y-3 flex-1">
                  {topStudentsData.length > 0 ? (
                    topStudentsData.map((item) => (
                      <div 
                        key={item.nim} 
                        className="flex items-center justify-between p-3 rounded-2xl bg-[var(--theme-bg)] border border-[var(--theme-border-muted)] hover:border-[var(--theme-primary)]/30 hover:bg-slate-50/50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar Circle */}
                          <div className="w-9 h-9 rounded-xl bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center font-bold text-xs shrink-0 border border-[var(--theme-primary)]/10">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[var(--theme-text)] truncate">{item.name}</p>
                            <p className="text-[10px] text-[var(--theme-text-muted)] font-bold mt-0.5 truncate">{item.nim}</p>
                            <p className="text-[9px] text-[var(--theme-text-muted)]/70 font-medium mt-0.5 truncate">{item.prodi}</p>
                          </div>
                        </div>
                        
                        {/* Sessions Count Pill */}
                        <div className="px-2 py-0.5 rounded-lg bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 text-[var(--theme-primary)] text-[10px] font-extrabold tracking-wide shrink-0">
                          {item.count} Sesi
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-center text-xs text-[var(--theme-text-muted)] italic">
                      <span className="material-symbols-outlined text-3xl opacity-40">person_off</span>
                      <span>Tidak ada data mahasiswa</span>
                    </div>
                  )}
                </div>
              </PageCard>
            </div>
          </div>

          {/* ── Detailed Booking History Table ─────────────────────── */}
          <PageCard>
            <PageCardHeader title="Riwayat & Agenda Booking Konseling" icon="calendar_month" />
            <div className="mt-4 animate-in fade-in duration-300">
              <DataTable
                columns={bookingColumns}
                data={filteredBookings}
                loading={loading}
                searchPlaceholder="Cari Nama Mahasiswa, NIM, atau Topik..."
                onRowClick={(row) => { setDetailItem(row); setIsDetailOpen(true); }}
                actions={(row) => (
                  <button
                    onClick={() => { setDetailItem(row); setIsDetailOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-[var(--theme-primary-light)] text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-all"
                    title="Lihat Detail"
                  >
                    <span className="material-symbols-outlined text-base">visibility</span>
                  </button>
                )}
              />
            </div>
          </PageCard>
        </div>
      )}

      {/* ── Booking Detail Dialog Modal ───────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white animate-in slide-in-from-bottom-4 duration-300">
          <DialogHeader className="p-6 sm:p-8 pb-4 sm:pb-6 border-b border-neutral-100 relative overflow-hidden bg-neutral-50/50">
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >visibility</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-bku-primary">
                  Detail Booking Sesi
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold font-jakarta tracking-tight text-neutral-900 uppercase">
                Informasi Booking Konseling
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto font-jakarta">
            {detailItem && (
              <>
                {/* Mahasiswa Info Section */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-3">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left">Identitas Mahasiswa</h4>
                  {(() => {
                    const mhs = detailItem.mahasiswa || detailItem.Mahasiswa;
                    return (
                      <div className="grid grid-cols-2 gap-4 text-left">
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
                          <span className="text-xs font-semibold text-neutral-700">{mhs?.program_studi?.nama || mhs?.ProgramStudi?.Nama || '—'}</span>
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
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left">Tenaga Profesional</h4>
                  <div className="grid grid-cols-2 gap-4 text-left">
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

                <div className="space-y-4 text-left">
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

          <DialogFooter className="p-6 border-t border-neutral-100 bg-neutral-50/50">
            <Button onClick={() => setIsDetailOpen(false)} className="h-10 px-5 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-900">
              Tutup Detail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContent>
  )
}
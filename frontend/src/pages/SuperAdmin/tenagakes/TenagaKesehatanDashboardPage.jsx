"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { adminService } from '../../../services/api'

import { PageContent, PageCard, PageCardHeader } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'
import { PrimaryStatsCard } from '@/components/ui/StatsCard'
import { DataTable } from '@/components/ui/DataTable'
import { Card, CardContent } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const Group = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const TaskAlt = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>task_alt</span>;
const Favorite = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>favorite</span>;
const MedicalServices = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>medical_services</span>;
const CalendarMonth = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_month</span>;

export default function TenagaKesehatanDashboardPage() {
  const [data, setData] = useState([])
  const [bookings, setBookings] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const [activeFilters, setActiveFilters] = useState({
    facultyId: localStorage.getItem('superadmin_fakultas_id') || 'all',
    prodiId: localStorage.getItem('superadmin_prodi_id') || 'all'
  })

  useEffect(() => {
    const handleStorageChange = () => {
      setActiveFilters({
        facultyId: localStorage.getItem('superadmin_fakultas_id') || 'all',
        prodiId: localStorage.getItem('superadmin_prodi_id') || 'all'
      })
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tkRes, bkRes, mrRes] = await Promise.all([
        adminService.getAllTenagaKesehatan(),
        adminService.getTenagaKesehatanBookings(),
        adminService.getTenagaKesehatanMedicalRecords()
      ])
      
      if (tkRes.status === 'success') {
        const resData = tkRes.data || [];
        setData(resData.length > 0 ? resData : [
          { id: 1, nama: 'Dr. Ahmad' },
          { id: 2, nama: 'Ns. Siti' }
        ])
      }
      if (bkRes.status === 'success') {
        const rawData = bkRes.data || [];
        const processedData = rawData.map(item => {
          const mhs = item.mahasiswa || item.Mahasiswa;
          return {
            ...item,
            _semester: mhs?.semester || mhs?.Semester || ''
          }
        });
        setBookings(processedData.length > 0 ? processedData : [
          { status: 'Dikonfirmasi', _semester: 4, jadwal: { tanggal: new Date().toISOString(), tipe_layanan: 'Pemeriksaan Umum' }, mahasiswa: { nama: 'Budi Santoso', nim: '10123456' }, tenaga_kesehatan: { nama: 'Dr. Ahmad' } },
          { status: 'Selesai', _semester: 6, jadwal: { tanggal: new Date().toISOString(), tipe_layanan: 'Konsultasi Gizi' }, mahasiswa: { nama: 'Siti Aminah', nim: '10123457' }, tenaga_kesehatan: { nama: 'Ns. Siti' } },
          { status: 'Menunggu', _semester: 2, jadwal: { tanggal: new Date(Date.now() + 86400000).toISOString(), tipe_layanan: 'Pemeriksaan Mata' }, mahasiswa: { nama: 'Joko Widodo', nim: '10123458' }, tenaga_kesehatan: { nama: 'Dr. Ahmad' } },
          { status: 'Dibatalkan', _semester: 4, jadwal: { tanggal: new Date(Date.now() - 86400000).toISOString(), tipe_layanan: 'Pemeriksaan Gigi' }, mahasiswa: { nama: 'Andi Pratama', nim: '10123459' }, tenaga_kesehatan: { nama: 'Dr. Budi' } },
          { status: 'Selesai', _semester: 8, jadwal: { tanggal: new Date(Date.now() - 186400000).toISOString(), tipe_layanan: 'Pemeriksaan Umum' }, mahasiswa: { nama: 'Rina Nose', nim: '10123460' }, tenaga_kesehatan: { nama: 'Ns. Ani' } },
          { status: 'Selesai', _semester: 4, jadwal: { tanggal: new Date(Date.now() - 286400000).toISOString(), tipe_layanan: 'Pemeriksaan Umum' }, mahasiswa: { nama: 'Dewi Persik', nim: '10123461' }, tenaga_kesehatan: { nama: 'Dr. Ahmad' } }
        ])
      }
      if (mrRes.status === 'success') {
        const resData = mrRes.data || [];
        setMedicalRecords(resData.length > 0 ? resData : [
          { status_kesehatan: 'Prima', golongan_darah: 'O' },
          { status_kesehatan: 'Stabil', golongan_darah: 'A' },
          { status_kesehatan: 'Pantauan', golongan_darah: 'B' },
          { status_kesehatan: 'Prima', golongan_darah: 'AB' },
          { status_kesehatan: 'Kritis', golongan_darah: 'O' },
          { status_kesehatan: 'Prima', golongan_darah: 'A' },
          { status_kesehatan: 'Stabil', golongan_darah: 'B' },
          { status_kesehatan: 'Prima', golongan_darah: 'O' }
        ])
      }
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

      return true
    })
  }, [bookings, activeFilters])

  const filteredMedicalRecords = useMemo(() => {
    return medicalRecords.filter(mr => {
      const mhs = mr.mahasiswa || mr.Mahasiswa
      if (!mhs) return false

      if (activeFilters.facultyId !== 'all') {
        const mhsFacId = String(mhs.FakultasID || mhs.fakultas_id || mhs.Fakultas?.id || mhs.Fakultas?.ID || mhs.fakultas?.id || mhs.fakultas?.ID || '')
        if (mhsFacId !== String(activeFilters.facultyId)) return false
      }

      if (activeFilters.prodiId !== 'all') {
        const mhsProdiId = String(mhs.ProgramStudiID || mhs.program_studi_id || mhs.ProgramStudi?.id || mhs.ProgramStudi?.ID || mhs.program_studi?.id || mhs.program_studi?.ID || '')
        if (mhsProdiId !== String(activeFilters.prodiId)) return false
      }

      return true
    })
  }, [medicalRecords, activeFilters])

  const getTodayBookingsCount = () => {
    return filteredBookings.filter(b => {
      const d = b.jadwal?.tanggal || b.Jadwal?.Tanggal
      if (!d) return false
      const bd = new Date(d)
      const today = new Date()
      return bd.getFullYear() === today.getFullYear() &&
             bd.getMonth() === today.getMonth() &&
             bd.getDate() === today.getDate()
    }).length
  }

  const serviceChartData = useMemo(() => {
    const counts = {}
    filteredBookings.forEach(b => {
      const t = b.jadwal?.tipe_layanan || b.tipe_layanan || 'Pemeriksaan Umum'
      const normalized = t.trim()
      counts[normalized] = (counts[normalized] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [filteredBookings])

  const statusChartData = useMemo(() => {
    const counts = { 'Selesai/Dikonfirmasi': 0, 'Menunggu': 0, 'Batal/Ditolak': 0 }
    filteredBookings.forEach(b => {
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
  }, [filteredBookings])

  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', 'var(--theme-primary)']

  const healthStats = useMemo(() => {
    const total = filteredBookings.length
    const selesai = filteredBookings.filter(b => {
      const s = String(b.status || '').toLowerCase()
      return s === 'dikonfirmasi' || s === 'selesai'
    }).length
    const completionRate = total > 0 ? ((selesai / total) * 100).toFixed(0) + '%' : '0%'

    const kondisiPrima = filteredMedicalRecords.filter(mr => {
      const status = String(mr.status_kesehatan || '').toLowerCase()
      return status === 'prima'
    }).length

    return { completionRate, kondisiPrima }
  }, [filteredBookings, filteredMedicalRecords])

  const golDarahData = useMemo(() => {
    const counts = { 'A': 0, 'B': 0, 'AB': 0, 'O': 0 }
    filteredMedicalRecords.forEach(mr => {
      const gol = String(mr.golongan_darah || mr.GolonganDarah || '').toUpperCase().trim()
      if (counts.hasOwnProperty(gol)) counts[gol]++
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
  }, [filteredMedicalRecords])

  const screeningData = useMemo(() => {
    const counts = { 'Prima': 0, 'Stabil': 0, 'Pantauan': 0, 'Kritis': 0 }
    filteredMedicalRecords.forEach(mr => {
      const s = String(mr.status_kesehatan || '').toLowerCase()
      if (s === 'prima') counts['Prima']++
      else if (s === 'stabil') counts['Stabil']++
      else if (s === 'pantauan') counts['Pantauan']++
      else if (s === 'kritis') counts['Kritis']++
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
  }, [filteredMedicalRecords])

  const semesterOptions = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      label: `SEMESTER ${i + 1}`,
      value: String(i + 1)
    }))
  }, [])

  const bookingColumns = [
    {
      key: 'mahasiswa',
      label: 'Pasien / Mahasiswa',
      className: 'w-[220px]',
      render: (v, row) => {
        const mhs = row.mahasiswa || row.Mahasiswa;
        return (
          <div className="flex flex-col py-1 font-inter">
            <span className="font-bold text-[var(--theme-text)] text-xs">{mhs?.Nama || mhs?.nama || '—'}</span>
            <span className="text-[10px] text-[var(--theme-text-muted)] font-bold">{mhs?.NIM || mhs?.nim || '—'}</span>
          </div>
        )
      }
    },
    {
      key: 'tenaga_kesehatan',
      label: 'Tenaga Medis',
      className: 'w-[200px]',
      render: (v, row) => (
        <div className="flex flex-col py-1 font-inter">
          <span className="font-bold text-[var(--theme-text)] text-xs truncate max-w-[180px]">{(row.tenaga_kesehatan?.nama || row.TenagaKesehatan?.Nama) || '—'}</span>
        </div>
      )
    },
    {
      key: 'jadwal',
      label: 'Jadwal & Layanan',
      className: 'w-[220px]',
      render: (v, row) => {
        const dateStr = row.jadwal?.tanggal || row.Jadwal?.Tanggal || new Date().toISOString()
        const tipe = row.jadwal?.tipe_layanan || row.Jadwal?.TipeLayanan || row.tipe_layanan || 'Pemeriksaan Umum'
        return (
          <div className="flex flex-col gap-1 py-1 font-inter">
             <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-text)]">
                <span className="material-symbols-outlined text-[var(--theme-primary)]" style={{ fontSize: '14px' }}>event</span>
                {new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
             </div>
             <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--theme-bg)] border border-[var(--theme-border-muted)] text-[var(--theme-text-muted)] w-fit font-medium">
               {tipe}
             </span>
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      className: 'w-[140px]',
      render: (v, row) => {
        const s = String(row.status || '').toLowerCase()
        let color = 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning)]/20'
        let icon = 'schedule'
        if (s === 'selesai' || s === 'dikonfirmasi') { color = 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success)]/20'; icon = 'check_circle' }
        if (s === 'batal' || s === 'ditolak' || s === 'dibatalkan') { color = 'bg-[var(--theme-error-light)] text-[var(--theme-error)] border-[var(--theme-error)]/20'; icon = 'cancel' }
        return (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border w-fit ${color}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{icon}</span>
            <span className="capitalize">{row.status || 'Menunggu'}</span>
          </div>
        )
      }
    }
  ]

  return (
    <PageContent>
      <Toaster position="top-right" />
      
      {/* ── Page Header ─────────────────────────────────────────── */}
      <DashboardHero 
        title="Dashboard"
        highlightedTitle="Tenaga Medis"
        subtitle="Analisis data kunjungan klinik, skrining kesehatan mahasiswa, performa pelayanan medis, serta pengelolaan operasional."
        icon="analytics"
        badges={[{ label: 'Klinik Kesehatan Kampus', active: false }]}
        actions={
          <div className="px-4 py-2 bg-bku-primary/5 border border-bku-primary/20 rounded-xl flex items-center gap-3 w-full lg:w-auto justify-center">
             <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }}>analytics</span>
             <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold text-bku-primary/70 uppercase tracking-widest">Akses Validasi</span>
                <span className="text-[12px] font-bold text-bku-primary font-jakarta">Super Admin Portal</span>
             </div>
          </div>
        }
      />

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center gap-4 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-sm">
          <span className="material-symbols-outlined animate-spin text-[var(--theme-primary)]" style={{ fontSize: '40px' }}>sync</span>
          <span className="text-sm font-bold text-[var(--theme-text-muted)] uppercase tracking-widest">Memuat Dashboard...</span>
        </div>
        ) : (
          <>
            {/* ── Stats Grid ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-6 mt-6">
              <PrimaryStatsCard
                title="Tenaga Medis"
                value={<>{data.length} <span className="text-sm font-bold text-slate-400">Ahli</span></>}
                icon={Group}
                colorTheme="primary"
              />
              <PrimaryStatsCard
                title="Penyelesaian"
                value={healthStats.completionRate}
                icon={TaskAlt}
                colorTheme="info"
              />
              <PrimaryStatsCard
                title="Kondisi Prima"
                value={<>{healthStats.kondisiPrima} <span className="text-sm font-bold text-slate-400">Orang</span></>}
                icon={Favorite}
                colorTheme="success"
              />
              <PrimaryStatsCard
                title="Total Rekam Medis"
                value={<>{filteredMedicalRecords.length} <span className="text-sm font-bold text-slate-400">Pemeriksaan</span></>}
                icon={MedicalServices}
                colorTheme="secondary"
              />
              <PrimaryStatsCard
                title="Hari Ini"
                value={<>{getTodayBookingsCount()} <span className="text-sm font-bold text-slate-400">Jadwal</span></>}
                icon={CalendarMonth}
                colorTheme="error"
              />
            </div>
 
            {/* ── Charts Section ──────────────────────────────────────── */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart: Jenis Layanan Kesehatan Terpopuler */}
                <div className="lg:col-span-2">
                  <PageCard className="h-full">
                    <PageCardHeader title="Layanan Kesehatan Terpopuler" icon="bar_chart" />
                    <div className="h-[200px] w-full mt-4">
                      {filteredBookings.length > 0 ? (
                         <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={serviceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border-muted)" />
                            <XAxis dataKey="name" tick={{ fontSize: 8.5, fontWeight: 700, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                            <Tooltip
                              cursor={{ fill: 'var(--theme-surface)' }}
                              contentStyle={{ backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: "bold", color: "var(--theme-text)" }}
                            />
                            <Bar dataKey="value" name="Jumlah Janji Temu" fill="var(--theme-primary)" radius={[4, 4, 0, 0]} barSize={24} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-[var(--theme-text-muted)] italic">Tidak ada data janji temu</div>
                      )}
                    </div>
                  </PageCard>
                </div>
 
                {/* Pie Chart: Status Janji Temu */}
                <div className="lg:col-span-1">
                  <PageCard className="h-full flex flex-col justify-between">
                    <PageCardHeader title="Status Janji Temu" icon="pie_chart" />
                    <div className="h-[140px] w-full flex items-center justify-center mt-4">
                      {statusChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={140}>
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
                              contentStyle={{ backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "10px", fontWeight: "bold", color: "var(--theme-text)" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <span className="text-xs text-[var(--theme-text-muted)] italic">Tidak ada data</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 mt-2">
                      {statusChartData.slice(0, 4).map((item, idx) => (
                        <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border-muted)]">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span className="text-[10px] font-bold text-[var(--theme-text-muted)] leading-none">{item.name}</span>
                          </div>
                          <span className="text-xs font-extrabold text-[var(--theme-text)] leading-none">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </PageCard>
                </div>
              </div>
 
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart: Hasil Skrining Kesehatan */}
                <PageCard>
                  <PageCardHeader title="Hasil Skrining Kesehatan" icon="health_and_safety" />
                  {screeningData.length > 0 ? (
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex-shrink-0">
                        <ResponsiveContainer width={140} height={140}>
                          <PieChart>
                            <Pie
                              data={screeningData}
                              cx="50%" cy="50%"
                              innerRadius={42} outerRadius={64}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                            >
                              {screeningData.map((_, index) => (
                                <Cell key={`scr-${index}`} fill={['var(--theme-success)', 'var(--theme-primary)', 'var(--theme-warning)', 'var(--theme-error)'][index % 4]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", fontSize: '10px', fontWeight: 'bold', borderRadius: '10px', color: "var(--theme-text)" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        {screeningData.map((item, idx) => (
                          <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border-muted)]">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['var(--theme-success)', 'var(--theme-primary)', 'var(--theme-warning)', 'var(--theme-error)'][idx % 4] }} />
                              <span className="text-[10px] font-bold text-[var(--theme-text-muted)]">{item.name}</span>
                            </div>
                            <span className="text-xs font-extrabold text-[var(--theme-text)]">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[140px] flex items-center justify-center mt-4">
                      <span className="text-xs text-[var(--theme-text-muted)] italic">Belum ada data screening</span>
                    </div>
                  )}
                </PageCard>
 
                {/* Bar Chart: Sebaran Golongan Darah */}
                <PageCard>
                  <PageCardHeader title="Sebaran Golongan Darah" icon="water_drop" />
                  {golDarahData.length > 0 ? (
                    <div className="h-[180px] w-full mt-4">
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={golDarahData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border-muted)" />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 800, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            cursor={{ fill: 'var(--theme-bg)' }}
                            contentStyle={{ backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", color: "var(--theme-text)" }}
                          />
                          <Bar dataKey="value" name="Jumlah Mahasiswa" fill="var(--theme-error)" radius={[6, 6, 0, 0]} barSize={36} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center mt-4">
                      <span className="text-xs text-[var(--theme-text-muted)] italic">Belum ada data golongan darah</span>
                    </div>
                  )}
                </PageCard>
              </div>
            </div>

            {/* ── Detailed Booking History Table ────────────────────────── */}
            <Card className="glass-card shadow-sm rounded-xl overflow-hidden mt-6 mb-6">
              <div className="px-6 py-5 border-b border-[var(--theme-border)] flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[var(--theme-surface)]">
                <div className="flex-1">
                  <h2 className="font-headline font-bold text-lg text-[var(--theme-text)]">Riwayat Kunjungan Medis</h2>
                  <p className="text-xs text-[var(--theme-text-muted)] mt-1 font-medium">
                    Menampilkan daftar janji temu pasien dan layanan kesehatan terkait.
                  </p>
                </div>
              </div>
              <CardContent className="p-0 animate-in fade-in duration-300">
                <DataTable
                  columns={bookingColumns}
                  data={filteredBookings}
                  loading={loading}
                  searchable
                  searchPlaceholder="Cari Nama Pasien atau Tenaga Medis..."
                  filters={[
                    { key: '_semester', placeholder: 'Semester', options: semesterOptions },
                    { key: 'status', placeholder: 'Status', options: [
                      { label: 'Dikonfirmasi', value: 'Dikonfirmasi' },
                      { label: 'Selesai', value: 'Selesai' },
                      { label: 'Menunggu', value: 'Menunggu' },
                      { label: 'Dibatalkan', value: 'Dibatalkan' },
                      { label: 'Ditolak', value: 'Ditolak' }
                    ]}
                  ]}
                />
              </CardContent>
            </Card>

          </>
        )}
    </PageContent>
  )
}

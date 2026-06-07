"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { adminService } from '../../../services/api'
import { PageContent, PageCard, PageCardHeader } from '@/components/ui/page'
import { DashboardHero, DashboardStatCard, DashboardStatGrid } from '@/components/ui/dashboard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"

export default function PsychologistDashboard() {
  const [data, setData] = useState([])
  const [bookings, setBookings] = useState([])
  const [referrals, setReferrals] = useState([])
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(true)

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
      const [psRes, bkRes, rfRes, periodsRes] = await Promise.all([
        adminService.getAllPsychologists(),
        adminService.getPsychologistBookings(),
        adminService.getPsychologistReferrals(),
        adminService.getAllAcademicPeriods()
      ])

      if (psRes.status === 'success') setData(psRes.data || [])
      if (bkRes.status === 'success') setBookings(bkRes.data || [])
      if (rfRes.status === 'success') setReferrals(rfRes.data || [])
      if (periodsRes.status === 'success') setPeriods(periodsRes.data || [])
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
          <>
            {/* ── Stats Grid ──────────────────────────────────────────── */}
            <DashboardStatGrid>
              <DashboardStatCard 
                label="Total Psikolog" 
                value={data.length} 
                icon="group" 
                colorClass="text-primary" 
                bgClass="bg-primary/10 border border-primary/20" 
                accentGradient="from-primary/10" 
                badge={{ text: 'Tenaga ahli terdaftar' }} 
              />
              <DashboardStatCard 
                label="Tingkat Penyelesaian" 
                value={stats.tingkatPenyelesaian} 
                icon="task_alt" 
                colorClass="text-info" 
                bgClass="bg-info/10 border border-info/20" 
                accentGradient="from-info/10" 
                badge={{ text: 'Rasio sesi konseling selesai' }} 
              />
              <DashboardStatCard 
                label="Rerata Beban Kerja" 
                value={stats.rerataBebanKerja} 
                icon="analytics" 
                colorClass="text-success" 
                bgClass="bg-success/10 border border-success/20" 
                accentGradient="from-success/10" 
                badge={{ text: 'Sesi / psikolog aktif' }} 
              />
              <DashboardStatCard 
                label="Rujukan Eksternal" 
                value={filteredReferrals.length} 
                icon="forward_to_inbox" 
                colorClass="text-secondary" 
                bgClass="bg-secondary/10 border border-secondary/20" 
                accentGradient="from-secondary/10" 
                badge={{ text: 'Surat rujukan dikirim' }} 
              />
              <DashboardStatCard 
                label="Booking Hari Ini" 
                value={getTodayBookingsCount()} 
                icon="calendar_month" 
                colorClass="text-error" 
                bgClass="bg-error/10 border border-error/20" 
                accentGradient="from-error/10" 
                badge={{ text: 'Janji temu hari ini' }} 
              />
            </DashboardStatGrid>

            {/* ── Charts Section ──────────────────────────────────────── */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Horizontal Bar Chart: Sebaran Spesialisasi Psikolog */}
                <PageCard>
                  <PageCardHeader title="Sebaran Spesialisasi Psikolog" icon="badge" />
                  <div className="h-[220px] w-full mt-4">
                    {specializationData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart layout="vertical" data={specializationData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--theme-border-muted)" />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: "bold", color: "var(--theme-text)" }}
                          />
                          <Bar dataKey="value" name="Jumlah Praktisi" fill="var(--theme-secondary)" radius={[0, 4, 4, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-[var(--theme-text-muted)] italic">Tidak ada data spesialisasi</div>
                    )}
                  </div>
                </PageCard>

                {/* Bar Chart: Topik Konseling Terpopuler */}
                <PageCard>
                  <PageCardHeader title="Topik Konseling Terpopuler" icon="bar_chart" />
                  <div className="h-[220px] w-full mt-4">
                    {topicChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={topicChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border-muted)" />
                          <XAxis dataKey="name" tick={{ fontSize: 8.5, fontWeight: 700, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            cursor={{ fill: 'var(--theme-border-muted)' }}
                            contentStyle={{ backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: "bold", color: "var(--theme-text)" }}
                          />
                          <Bar dataKey="value" name="Jumlah Sesi" fill="var(--theme-primary)" radius={[4, 4, 0, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-[var(--theme-text-muted)] italic">Tidak ada data topik</div>
                    )}
                  </div>
                </PageCard>

                {/* Card: Mahasiswa Teraktif Konseling */}
                <PageCard className="flex flex-col justify-between h-full">
                  <PageCardHeader title="Mahasiswa Teraktif Konseling" icon="group" />
                  <div className="flex-1 mt-4 space-y-3">
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
                          <div className="px-2.5 py-1 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 text-[var(--theme-primary)] text-[10px] font-extrabold tracking-wide uppercase shrink-0">
                            {item.count} Sesi
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full min-h-[180px] flex flex-col items-center justify-center gap-2 text-center text-xs text-[var(--theme-text-muted)] italic">
                        <span className="material-symbols-outlined text-3xl opacity-40">person_off</span>
                        <span>Tidak ada data mahasiswa</span>
                      </div>
                    )}
                  </div>
                </PageCard>
              </div>
            </div>
          </>
        )}
    </PageContent>
  )
}

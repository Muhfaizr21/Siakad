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
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [psRes, bkRes, rfRes] = await Promise.all([
        adminService.getAllPsychologists(),
        adminService.getPsychologistBookings(),
        adminService.getPsychologistReferrals()
      ])

      if (psRes.status === 'success') setData(psRes.data || [])
      if (bkRes.status === 'success') setBookings(bkRes.data || [])
      if (rfRes.status === 'success') setReferrals(rfRes.data || [])
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

  const topicChartData = useMemo(() => {
    const counts = {}
    bookings.forEach(b => {
      const t = b.topik || b.Topik || 'Lainnya'
      const normalized = t.trim()
      counts[normalized] = (counts[normalized] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [bookings])

  const modeChartData = useMemo(() => {
    const counts = { 'Online': 0, 'Tatap Muka': 0 }
    bookings.forEach(b => {
      const m = b.mode || b.Mode || 'Tatap Muka'
      const key = m === 'Online' ? 'Online' : 'Tatap Muka'
      counts[key]++
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
  }, [bookings])

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
    bookings.forEach(b => {
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
  }, [bookings])

  const stats = useMemo(() => {
    const totalBookings = bookings.length
    const selesaiBookings = bookings.filter(b => {
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
  }, [bookings, data])

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
                value={referrals.length} 
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
                      {bookings.length > 0 ? (
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              </div>
            </div>
          </>
        )}
    </PageContent>
  )
}

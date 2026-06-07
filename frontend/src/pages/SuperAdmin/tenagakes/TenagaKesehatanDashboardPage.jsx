"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { adminService } from '../../../services/api'
import { PageContent, PageCard, PageCardHeader } from '@/components/ui/page'
import { DashboardHero, DashboardStatCard, DashboardStatGrid } from '@/components/ui/dashboard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function TenagaKesehatanDashboardPage() {
  const [data, setData] = useState([])
  const [bookings, setBookings] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tkRes, bkRes, mrRes] = await Promise.all([
        adminService.getAllTenagaKesehatan(),
        adminService.getTenagaKesehatanBookings(),
        adminService.getTenagaKesehatanMedicalRecords()
      ])
      
      if (tkRes.status === 'success') setData(tkRes.data || [])
      if (bkRes.status === 'success') setBookings(bkRes.data || [])
      if (mrRes.status === 'success') setMedicalRecords(mrRes.data || [])
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

  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', 'var(--theme-primary)']

  const healthStats = useMemo(() => {
    const total = bookings.length
    const selesai = bookings.filter(b => {
      const s = String(b.status || '').toLowerCase()
      return s === 'dikonfirmasi' || s === 'selesai'
    }).length
    const completionRate = total > 0 ? ((selesai / total) * 100).toFixed(0) + '%' : '0%'

    const kondisiPrima = medicalRecords.filter(mr => {
      const status = String(mr.status_kesehatan || '').toLowerCase()
      return status === 'prima'
    }).length

    return { completionRate, kondisiPrima }
  }, [bookings, medicalRecords])

  const golDarahData = useMemo(() => {
    const counts = { 'A': 0, 'B': 0, 'AB': 0, 'O': 0 }
    medicalRecords.forEach(mr => {
      const gol = String(mr.golongan_darah || mr.GolonganDarah || '').toUpperCase().trim()
      if (counts.hasOwnProperty(gol)) counts[gol]++
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
  }, [medicalRecords])

  const screeningData = useMemo(() => {
    const counts = { 'Prima': 0, 'Stabil': 0, 'Pantauan': 0, 'Kritis': 0 }
    medicalRecords.forEach(mr => {
      const s = String(mr.status_kesehatan || '').toLowerCase()
      if (s === 'prima') counts['Prima']++
      else if (s === 'stabil') counts['Stabil']++
      else if (s === 'pantauan') counts['Pantauan']++
      else if (s === 'kritis') counts['Kritis']++
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
  }, [medicalRecords])

  return (
    <PageContent>
      <Toaster position="top-right" />
      
      {/* ── Page Header ─────────────────────────────────────────── */}
      <DashboardHero 
        title="Dashboard"
        highlightedTitle="Medis"
        subtitle="Analisis data kunjungan klinik, skrining kesehatan mahasiswa, dan performa pelayanan medis."
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
                label="Tenaga Medis" 
                value={data.length} 
                icon="group" 
                colorClass="text-primary" 
                bgClass="bg-primary/10 border border-primary/20" 
                accentGradient="from-primary/10" 
                badge={{ text: 'Dokter & Perawat aktif' }} 
              />
              <DashboardStatCard 
                label="Tingkat Penyelesaian" 
                value={healthStats.completionRate} 
                icon="task_alt" 
                colorClass="text-info" 
                bgClass="bg-info/10 border border-info/20" 
                accentGradient="from-info/10" 
                badge={{ text: 'Rasio janji temu selesai' }} 
              />
              <DashboardStatCard 
                label="Kondisi Prima" 
                value={healthStats.kondisiPrima} 
                icon="favorite" 
                colorClass="text-success" 
                bgClass="bg-success/10 border border-success/20" 
                accentGradient="from-success/10" 
                badge={{ text: 'Mahasiswa status prima' }} 
              />
              <DashboardStatCard 
                label="Total Rekam Medis" 
                value={medicalRecords.length} 
                icon="medical_services" 
                colorClass="text-secondary" 
                bgClass="bg-secondary/10 border border-secondary/20" 
                accentGradient="from-secondary/10" 
                badge={{ text: 'Riwayat pemeriksaan terlog' }} 
              />
              <DashboardStatCard 
                label="Janji Temu Hari Ini" 
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
                {/* Bar Chart: Jenis Layanan Kesehatan Terpopuler */}
                <div className="lg:col-span-2">
                  <PageCard className="h-full">
                    <PageCardHeader title="Layanan Kesehatan Terpopuler" icon="bar_chart" />
                    <div className="h-[200px] w-full mt-4">
                      {bookings.length > 0 ? (
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
          </>
        )}
    </PageContent>
  )
}

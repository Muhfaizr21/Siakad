"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { toast, Toaster } from 'react-hot-toast'
import { adminService } from '../../../services/api'
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

  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#00236f']

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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Klinik Kesehatan Kampus</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                Dashboard <span className="text-bku-primary italic font-semibold">Medis</span>
              </h1>
              <p className="text-neutral-500 font-medium text-xs md:text-sm max-w-2xl leading-relaxed">
                Analisis data kunjungan klinik, skrining kesehatan mahasiswa, dan performa pelayanan medis.
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="px-4 py-2 bg-bku-primary/5 border border-bku-primary/20 rounded-xl flex items-center gap-3 w-full lg:w-auto justify-center">
                 <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }}>analytics</span>
                 <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-bold text-bku-primary/70 uppercase tracking-widest">Akses Validasi</span>
                    <span className="text-[12px] font-bold text-bku-primary font-jakarta">Super Admin Portal</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-4 bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <span className="material-symbols-outlined animate-spin text-bku-primary" style={{ fontSize: '40px' }}>sync</span>
            <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Memuat Dashboard...</span>
          </div>
        ) : (
          <>
            {/* ── Stats Grid ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-jakarta">
               <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center text-bku-primary flex-shrink-0">
                        <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '18px' }} >group</span>
                     </div>
                     <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Tenaga Medis</span>
                  </div>
                  <p className="text-3xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{data.length}</p>
                  <p className="text-xs text-[#a3a3a3] font-medium mt-1">Dokter & Perawat aktif</p>
               </div>

               <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center text-bku-primary flex-shrink-0">
                        <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '18px' }} >task_alt</span>
                     </div>
                     <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Tingkat Penyelesaian</span>
                  </div>
                  <p className="text-3xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{healthStats.completionRate}</p>
                  <p className="text-xs text-[#a3a3a3] font-medium mt-1">Rasio janji temu selesai</p>
               </div>

               <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex justify-center items-center text-[#16a34a] flex-shrink-0">
                        <span className="material-symbols-outlined text-[#16a34a]" style={{ fontSize: '18px' }} >favorite</span>
                     </div>
                     <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Kondisi Prima</span>
                  </div>
                  <p className="text-3xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{healthStats.kondisiPrima}</p>
                  <p className="text-xs text-[#a3a3a3] font-medium mt-1">Mahasiswa status prima</p>
               </div>

               <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-rose-50 rounded-xl flex justify-center items-center text-rose-600 flex-shrink-0">
                        <span className="material-symbols-outlined text-rose-600" style={{ fontSize: '18px' }} >medical_services</span>
                     </div>
                     <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Total Rekam Medis</span>
                  </div>
                  <p className="text-3xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{medicalRecords.length}</p>
                  <p className="text-xs text-[#a3a3a3] font-medium mt-1">Riwayat pemeriksaan terlog</p>
               </div>

               <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center text-bku-primary flex-shrink-0">
                        <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '18px' }} >calendar_month</span>
                     </div>
                     <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Janji Temu Hari Ini</span>
                     {getTodayBookingsCount() > 0 && (
                       <span className="bg-rose-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse ml-auto">LIVE</span>
                     )}
                  </div>
                  <p className="text-3xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{getTodayBookingsCount()}</p>
                  <p className="text-xs text-[#a3a3a3] font-medium mt-1">Janji temu hari ini</p>
               </div>
            </div>
 
            {/* ── Charts Section ──────────────────────────────────────── */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart: Jenis Layanan Kesehatan Terpopuler */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center text-bku-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '18px' }} >bar_chart</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Layanan Kesehatan Terpopuler</span>
                  </div>
                  <div className="h-[200px] w-full">
                    {bookings.length > 0 ? (
                       <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={serviceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 8.5, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: "bold" }}
                          />
                          <Bar dataKey="value" name="Jumlah Janji Temu" fill="#00236f" radius={[4, 4, 0, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-neutral-400 italic">Tidak ada data janji temu</div>
                    )}
                  </div>
                </div>
 
                {/* Pie Chart: Status Janji Temu */}
                <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center text-bku-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '18px' }} >pie_chart</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Status Janji Temu</span>
                  </div>
                  <div className="h-[140px] w-full flex items-center justify-center">
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
 
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart: Hasil Skrining Kesehatan */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex justify-center items-center text-emerald-600 flex-shrink-0">
                      <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '18px' }} >health_and_safety</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Hasil Skrining Kesehatan</span>
                  </div>
                  {screeningData.length > 0 ? (
                    <div className="flex items-center gap-4">
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
                                <Cell key={`scr-${index}`} fill={['#10b981', '#00236f', '#f59e0b', '#ef4444'][index % 4]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ fontSize: '10px', fontWeight: 'bold', borderRadius: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        {screeningData.map((item, idx) => (
                          <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#10b981', '#00236f', '#f59e0b', '#ef4444'][idx % 4] }} />
                              <span className="text-[10px] font-bold text-slate-600">{item.name}</span>
                            </div>
                            <span className="text-xs font-extrabold text-slate-800">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[140px] flex items-center justify-center">
                      <span className="text-xs text-slate-400 italic">Belum ada data screening</span>
                    </div>
                  )}
                </div>
 
                {/* Bar Chart: Sebaran Golongan Darah */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex justify-center items-center text-rose-600 flex-shrink-0">
                      <span className="material-symbols-outlined text-rose-600" style={{ fontSize: '18px' }} >water_drop</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Sebaran Golongan Darah</span>
                  </div>
                  {golDarahData.length > 0 ? (
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={golDarahData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 800, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            cursor={{ fill: '#fef2f2' }}
                            contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #fecaca", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}
                          />
                          <Bar dataKey="value" name="Jumlah Mahasiswa" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={36} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center">
                      <span className="text-xs text-slate-400 italic">Belum ada data golongan darah</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

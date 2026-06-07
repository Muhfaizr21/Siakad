"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { toast, Toaster } from 'react-hot-toast'
import { adminService } from '../../../services/api'
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

  const PIE_COLORS = ['#2563EB', '#4f46e5', '#f59e0b', '#10b981']

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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Layanan Konseling Kampus</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                Dashboard <span className="text-bku-primary italic font-semibold">Psikologi</span>
              </h1>
              <p className="text-neutral-500 font-medium text-xs md:text-sm max-w-2xl leading-relaxed">
                Analisis data booking konseling, beban kerja psikolog, dan statistik performa layanan bimbingan mahasiswa.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
               <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center text-bku-primary flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >group</span>
                     </div>
                     <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Total Psikolog</span>
                  </div>
                  <p className="text-3xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{data.length}</p>
                  <p className="text-xs text-[#a3a3a3] font-medium mt-1">Tenaga ahli terdaftar</p>
               </div>

               <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-blue-50 rounded-xl flex justify-center items-center text-blue-600 flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >task_alt</span>
                     </div>
                     <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Tingkat Penyelesaian</span>
                  </div>
                  <p className="text-3xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{stats.tingkatPenyelesaian}</p>
                  <p className="text-xs text-[#a3a3a3] font-medium mt-1">Rasio sesi konseling selesai</p>
               </div>

               <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-emerald-50 rounded-xl flex justify-center items-center text-emerald-600 flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >analytics</span>
                     </div>
                     <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Rerata Beban Kerja</span>
                  </div>
                  <p className="text-3xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{stats.rerataBebanKerja}</p>
                  <p className="text-xs text-[#a3a3a3] font-medium mt-1">Sesi / psikolog aktif</p>
               </div>

               <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-indigo-50 rounded-xl flex justify-center items-center text-indigo-600 flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >forward_to_inbox</span>
                     </div>
                     <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Rujukan Eksternal</span>
                  </div>
                  <p className="text-3xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{referrals.length}</p>
                  <p className="text-xs text-[#a3a3a3] font-medium mt-1">Surat rujukan dikirim</p>
               </div>

               <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-rose-50 rounded-xl flex justify-center items-center text-rose-600 flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >calendar_month</span>
                     </div>
                     <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Booking Hari Ini</span>
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
                {/* Line Chart: Tren Booking Bulanan */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center text-bku-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '18px' }} >show_chart</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Tren Booking Bulanan</span>
                  </div>
                  <div className="h-[240px] w-full">
                    {bookings.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={monthlyBookingData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: "bold" }}
                          />
                          <Line type="monotone" dataKey="Jumlah Booking" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-neutral-400 italic">Tidak ada data booking</div>
                    )}
                  </div>
                </div>

                {/* Pie Chart: Metode Konseling */}
                <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex justify-center items-center text-indigo-600 flex-shrink-0">
                      <span className="material-symbols-outlined text-indigo-600" style={{ fontSize: '18px' }} >pie_chart</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Metode Konseling</span>
                  </div>
                  <div className="h-[140px] w-full flex items-center justify-center">
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
                            contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "10px", fontWeight: "bold" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Tidak ada data</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {modeChartData.slice(0, 4).map((item, idx) => (
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Horizontal Bar Chart: Sebaran Spesialisasi Psikolog */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex justify-center items-center text-amber-600 flex-shrink-0">
                      <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '18px' }} >badge</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Sebaran Spesialisasi Psikolog</span>
                  </div>
                  <div className="h-[220px] w-full">
                    {specializationData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart layout="vertical" data={specializationData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: "bold" }}
                          />
                          <Bar dataKey="value" name="Jumlah Praktisi" fill="#eab308" radius={[0, 4, 4, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-neutral-400 italic">Tidak ada data spesialisasi</div>
                    )}
                  </div>
                </div>

                {/* Bar Chart: Topik Konseling Terpopuler */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center text-bku-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '18px' }} >bar_chart</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Topik Konseling Terpopuler</span>
                  </div>
                  <div className="h-[220px] w-full">
                    {topicChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={topicChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 8.5, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: "bold" }}
                          />
                          <Bar dataKey="value" name="Jumlah Sesi" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-neutral-400 italic">Tidak ada data topik</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

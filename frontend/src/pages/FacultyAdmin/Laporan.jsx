"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast, Toaster } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/card"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import {
  Users,
  TrendingUp,
  Download,
  BarChart3,
  Award,
  HeartPulse,
  Globe,
  FileText
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { DataTable } from "./components/data-table"
import { cn } from "@/lib/utils"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

const CHART_COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#6366f1", // indigo-500
  "#ec4899", // pink-500
];

export default function LaporanFakultasPage() {
  const [data, setData] = useState({
    summary: {
      total: 0,
      active: 0,
      graduated: 0,
      avgIPK: 0,
      totalPrestasi: 0,
      totalBeasiswa: 0,
      totalKonseling: 0
    },
    perAngkatan: [],
    perProdi: [],
    ipkDist: []
  })
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/faculty/reports/summary")
      if (res.data.status === "success") {
        setData(res.data.data || {
          summary: { total: 0, active: 0, graduated: 0, avgIPK: 0, totalPrestasi: 0, totalBeasiswa: 0, totalKonseling: 0 },
          perAngkatan: [],
          perProdi: [],
          ipkDist: []
        })
      }
    } catch (error) {
      toast.error("Gagal memuat data laporan")
    } finally {
      setLoading(false)
    }
  }

  const prodiWithColors = (data.perProdi || []).map((item, index) => ({
    ...item,
    nama_prodi: item.nama_prodi || "Unknown",
    value: item.value || 0,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }))

  const columns = [
    {
      key: "nama_prodi",
      label: "Program Studi",
      render: (val) => (
        <div className="flex flex-col text-left">
          <span className="font-black text-slate-900 font-headline uppercase text-[12px] tracking-tight leading-none">{val}</span>
        </div>
      )
    },
    {
      key: "active",
      label: "Aktif",
      render: (val) => <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[10px] px-3 py-1 font-headline uppercase">{val || 0}</Badge>
    },
    {
      key: "graduated",
      label: "Lulus",
      render: (val) => <Badge className="bg-blue-100 text-blue-700 border-none font-black text-[10px] px-3 py-1 font-headline uppercase">{val || 0}</Badge>
    },
    {
      key: "avgIPK",
      label: "Avg IPK",
      render: (val) => <span className="font-black text-slate-900 font-headline text-xs tabular-nums tracking-tighter">{val?.toFixed(2) || "0.00"}</span>
    }
  ]

  const statsData = [
    { label: 'Total Mahasiswa', value: data.summary.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Capaian Prestasi', value: data.summary.totalPrestasi, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Penerima Beasiswa', value: data.summary.totalBeasiswa, icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Layanan Konseling', value: data.summary.totalKonseling, icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50' },
  ]

  return (
    <PageContainer>
      <Toaster position="top-right" />
      
      <PageHeader
        icon={BarChart3}
        title="Laporan Fakultas"
        description="Monitoring Strategis & Performa Akademik"
      />

      <ResponsiveGrid cols={4}>
        {statsData.map((stat, i) => (
          <ResponsiveCard key={i} className="flex flex-row items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div className="flex flex-col font-headline leading-tight">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
              <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">{loading ? '...' : stat.value}</span>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <ResponsiveCard>
            <div className="flex flex-col mb-6">
                <span className="text-base font-black text-slate-900 font-headline uppercase tracking-tight">Status per Angkatan</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Distribusi akademik tiap tahun angkatan</span>
            </div>
            <div className="h-72 relative w-full min-w-0">
              {isMounted && (
                <ResponsiveContainer width="99%" height={288} debounce={50}>
                  <BarChart data={data.perAngkatan}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="angkatan" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                    <Bar dataKey="aktif" name="Aktif" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="lulus" name="Lulus" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
        </ResponsiveCard>

        <ResponsiveCard>
            <div className="flex flex-col mb-6">
                <span className="text-base font-black text-slate-900 font-headline uppercase tracking-tight">Distribusi Prodi</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Persentase jumlah mahasiswa per prodi</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-64 flex-1 relative w-full min-w-0">
                {isMounted && (
                  <ResponsiveContainer width="99%" height={256} debounce={50}>
                    <PieChart>
                      <Pie
                        data={prodiWithColors}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {prodiWithColors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex flex-col gap-3 min-w-[120px]">
                {prodiWithColors.map((prodi, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: prodi.color }} />
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate max-w-[100px]">{prodi.nama_prodi}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{prodi.value} MHS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </ResponsiveCard>
      </div>

      {/* Strategic Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {[
          { label: 'Laporan Prestasi', icon: Award, desc: 'Dataset kompetisi & penghargaan mahasiswa.', color: 'bg-emerald-600', bg: 'bg-emerald-50', stats: `${data.summary.totalPrestasi} Capaian` },
          { label: 'Laporan Beasiswa', icon: Globe, desc: 'Transkrip penerima bantuan finansial.', color: 'bg-indigo-600', bg: 'bg-indigo-50', stats: `${data.summary.totalBeasiswa} Penerima` },
          { label: 'Laporan Konseling', icon: HeartPulse, desc: 'Monitoring layanan bimbingan & kesehatan.', color: 'bg-rose-600', bg: 'bg-rose-50', stats: `${data.summary.totalKonseling} Sesi` },
        ].map((item, i) => (
          <ResponsiveCard key={i} className="group hover:shadow-2xl transition-all duration-500">
              <div className="flex items-start justify-between mb-8">
                <div className={cn("p-4 rounded-[1.5rem] shadow-xl text-white shadow-current/20", item.color)}>
                  <item.icon className="size-6" />
                </div>
                <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[9px] px-3 py-1 uppercase font-headline">SEM-II 2024</Badge>
              </div>
              <div className="space-y-2 mb-8">
                <h4 className="text-xl font-black font-headline tracking-tighter uppercase text-slate-900">{item.label}</h4>
                <p className="text-[11px] font-bold text-slate-400/80 leading-relaxed uppercase tracking-tight">{item.desc}</p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Master Data</span>
                  <span className="text-sm font-black text-slate-700 tabular-nums font-headline">{item.stats}</span>
                </div>
                <Button className="h-12 w-12 rounded-2xl bg-slate-900 text-white hover:bg-primary transition-all shadow-xl shadow-slate-900/10 border-none group-hover:scale-105">
                  <Download className="size-4" />
                </Button>
              </div>
          </ResponsiveCard>
        ))}
      </div>

      <ResponsiveCard noPadding className="mt-6">
          <DataTable
            columns={columns}
            data={data.perProdi}
            loading={loading}
            onExport={() => alert("Mencetak Laporan Utama Fakultas...")}
            exportLabel="Ekspor Master Laporan"
            filters={[
              {
                key: 'nama_prodi',
                placeholder: 'Filter Prodi',
                options: (data.perProdi || [])
                  .filter(p => p.nama_prodi && p.nama_prodi.trim() !== "")
                  .map(p => ({ label: p.nama_prodi, value: p.nama_prodi }))
              }
            ]}
          />
      </ResponsiveCard>
    </PageContainer>
  )
}

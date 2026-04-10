"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast, Toaster } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/card"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import {
  Users,
  GraduationCap,
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
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-xs font-headline shadow-lg shadow-slate-950/20">
            {val ? val.substring(0, 2).toUpperCase() : "??"}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 font-headline uppercase text-[11px] tracking-tight leading-none mb-1">{val}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Master Dataset</span>
          </div>
        </div>
      )
    },
    {
      key: "active",
      label: "Aktif",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => (
        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-3 py-1 font-headline shadow-sm inline-flex justify-center min-w-[32px]">
          {val || 0}
        </Badge>
      )
    },
    {
      key: "leave",
      label: "Cuti",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => (
        <Badge className="bg-amber-50 text-amber-500 border-none font-black text-[10px] px-3 py-1 font-headline shadow-sm inline-flex justify-center min-w-[32px]">
          {val || 0}
        </Badge>
      )
    },
    {
      key: "graduated",
      label: "Lulus",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => (
        <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] px-3 py-1 font-headline shadow-sm inline-flex justify-center min-w-[32px]">
          {val || 0}
        </Badge>
      )
    },
    {
      key: "avgIPK",
      label: "Avg IPK",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => {
        const gpa = val || 0;
        let color = "bg-rose-500";
        if (gpa >= 3.5) color = "bg-emerald-500";
        else if (gpa >= 3.0) color = "bg-blue-500";
        else if (gpa >= 2.5) color = "bg-amber-500";
        
        return (
          <div className="flex flex-col items-center gap-1.5 mx-auto max-w-[80px]">
            <span className="font-black text-slate-900 font-headline text-xs tracking-tighter">{gpa.toFixed(2)}</span>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${(gpa / 4) * 100}%` }} />
            </div>
          </div>
        )
      }
    },

  ]


  const statsData = [
    { label: 'Total Mahasiswa', value: data.summary.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5', desc: 'terdaftar semester ini' },
    { label: 'Total Prestasi', value: data.summary.totalPrestasi, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5', desc: 'capaian mahasiswa' },
    { label: 'Total Beasiswa', value: data.summary.totalBeasiswa, icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500/10 to-indigo-500/5', desc: 'penerima bantuan' },
    { label: 'Total Konseling', value: data.summary.totalKonseling, icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50', gradient: 'from-rose-500/10 to-rose-500/5', desc: 'aduan & layanan' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 pt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <BarChart3 className="size-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 font-headline tracking-tighter uppercase">Laporan Fakultas</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ekspor Data & Monitoring Strategis Semesteran</p>
        </div>
      </div>

      {/* Summary Stats Row - Keeping UI Same as requested */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-headline">
        {statsData.map((stat, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 rounded-2xl">
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", stat.gradient)} />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("rounded-xl p-2.5 shadow-sm group-hover:scale-110 transition-transform duration-500", stat.bg, stat.color)}>
                  <stat.icon className="size-5" />
                </div>
                <div className={cn("flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest leading-none", stat.bg, stat.color)}>
                  <TrendingUp className="size-2.5" />
                  Live
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 font-headline tracking-tighter leading-none">{loading ? "..." : stat.value.toLocaleString()}</h3>
                <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-tight">{stat.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row - Keeping UI Same as requested */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200 shadow-sm shadow-slate-200/40 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-900 font-headline uppercase tracking-tight">Status per Angkatan</CardTitle>
            <CardDescription className="text-[11px] font-bold text-slate-400 uppercase">Distribusi akademik tiap tahun angkatan</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>

        </Card>

        <Card className="border border-slate-200 shadow-sm shadow-slate-200/40 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-900 font-headline uppercase tracking-tight">Distribusi Prodi</CardTitle>
            <CardDescription className="text-[11px] font-bold text-slate-400 uppercase">Persentase jumlah mahasiswa per prodi</CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="flex flex-col gap-3">
                {prodiWithColors.map((prodi, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: prodi.color }} />
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{prodi.nama_prodi}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{prodi.value} MHS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Report Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
                label: 'Laporan Prestasi', 
                icon: Award, 
                desc: 'Dataset kompetisi & penghargaan mahasiswa berprestasi.', 
                color: 'bg-emerald-600', 
                bg: 'bg-emerald-50',
                stats: `${data.summary.totalPrestasi} Capaian`
            },
            { 
                label: 'Laporan Beasiswa', 
                icon: Globe, 
                desc: 'Transkrip penerima bantuan finansial & beasiswa internal.', 
                color: 'bg-indigo-600', 
                bg: 'bg-indigo-50',
                stats: `${data.summary.totalBeasiswa} Penerima`
            },
            { 
                label: 'Laporan Konseling', 
                icon: HeartPulse, 
                desc: 'Monitoring layanan bimbingan & kesehatan mahasiswa.', 
                color: 'bg-rose-600', 
                bg: 'bg-rose-50',
                stats: `${data.summary.totalKonseling} Konsultasi`
            },
          ].map((item, i) => (
            <Card key={i} className="border border-slate-200 shadow-sm rounded-[2rem] bg-white overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-6">
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
                </CardContent>
            </Card>
          ))}
      </div>

      <Card className="border border-slate-200 shadow-sm shadow-slate-200/40 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-md">
        <CardHeader className="bg-white/80 border-b border-slate-100 pb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                        <FileText className="size-5" />
                    </div>
                    <CardTitle className="text-lg font-black font-headline uppercase tracking-tight">Ringkasan Capaian Prodi</CardTitle>
                </div>
                <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] px-3 py-1 uppercase font-headline">Verified Data</Badge>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data.perProdi}
            loading={loading}
            onExport={() => alert("Mencetak Laporan Utama Fakultas...")}
            exportLabel="Ekspor Master Laporan"
            filters={[
              {
                key: 'nama_prodi',
                placeholder: 'Program Studi',
                options: (data.perProdi || [])
                  .filter(p => p.nama_prodi && p.nama_prodi.trim() !== "")
                  .map(p => ({ label: p.nama_prodi, value: p.nama_prodi }))
              }
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

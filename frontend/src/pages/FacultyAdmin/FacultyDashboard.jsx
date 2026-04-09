"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/card"
import { Button } from "./components/button"
import { Avatar, AvatarFallback } from "./components/avatar"
import { Badge } from "./components/badge"
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Clock,
  FileText,
  Loader2,
  LayoutDashboard,
  Layers,
  Award,
  Trophy
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
  LineChart,
  Line,
  Legend,
} from "recharts"
import { DataTable } from "./components/data-table"

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [summaryData, setSummaryData] = useState({

    totalStudents: 0,
    totalLecturers: 0,
    totalCourses: 0,
    totalProdi: 0,
    statusCounts: [],
    prodiDistribution: [],
    trendData: [],
    recentActivity: []
  });

  const normalizeSummaryData = (data = {}) => ({
    totalStudents: Number(data.totalStudents || 0),
    totalLecturers: Number(data.totalLecturers || 0),
    totalCourses: Number(data.totalCourses || 0),
    totalProdi: Number(data.totalProdi || 0),
    totalPrestasi: Number(data.totalPrestasi || 0),
    statusCounts: Array.isArray(data.statusCounts) ? data.statusCounts : [],
    prodiDistribution: Array.isArray(data.prodiDistribution) ? data.prodiDistribution : [],
    trendData: Array.isArray(data.trendData) ? data.trendData : [],
    recentActivity: Array.isArray(data.recentActivity) ? data.recentActivity : [],
  });

  useEffect(() => {
    setIsMounted(true);
    const fetchDashboardData = async () => {

      try {
        const response = await fetch('http://localhost:8000/api/faculty/summary');
        const result = await response.json();
        if (result.status === 'success') {
          setSummaryData(normalizeSummaryData(result.data));
        }
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statusColors = {
    'Aktif': '#22c55e',
    'Cuti': '#eab308',
    'Lulus': '#3b82f6',
    'DO': '#ef4444',
  };

  const defaultStatuses = ['Aktif', 'Cuti', 'Lulus', 'DO'];
  const dynamicStatusData = defaultStatuses.map(status => {
    const found = summaryData.statusCounts?.find(s => s.status === status);
    return {
      name: status,
      value: found ? found.count : 0,
      color: statusColors[status] || '#cbd5e1'
    };
  });

  const dynamicStats = [
    {
      key: "totalStudents",
      title: "Total Mahasiswa",
      icon: Users,
      description: "mahasiswa terdaftar",
      value: (summaryData.totalStudents || 0).toLocaleString(),
      color: "text-blue-600",
      bg: "bg-blue-50",
      gradient: "from-blue-500/10 to-blue-500/5"
    },
    {
      key: "totalLecturers",
      title: "Tenaga Pendidik",
      icon: BookOpen,
      description: "dosen aktif",
      value: (summaryData.totalLecturers || 0).toLocaleString(),
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      gradient: "from-emerald-500/10 to-emerald-500/5"
    },
    {
      key: "totalPrestasi",
      title: "Prestasi Baru",
      icon: Award,
      description: "menunggu validasi",
      value: (summaryData.totalPrestasi || 0).toLocaleString(),
      color: "text-amber-600",
      bg: "bg-amber-50",
      gradient: "from-amber-500/10 to-amber-500/5"
    },
    {
      key: "totalProdi",
      title: "Unit Akademik",
      icon: Layers,
      description: "program studi aktif",
      value: (summaryData.totalProdi || 0).toLocaleString(),
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      gradient: "from-indigo-500/10 to-indigo-500/5"
    },
  ];

  const prodiColumns = [
    {
      key: "name",
      label: "Program Studi",
      render: (val) => <span className="font-bold text-slate-800 font-headline uppercase text-[11px] tracking-tight">{val}</span>
    },
    {
        key: "akreditasi",
        label: "Akreditasi",
        render: (val) => (
            <Badge className={cn(
                "font-black text-[10px] px-3 py-0.5 border-none shadow-sm font-headline",
                val === 'A' || val === 'Unggul' ? "bg-emerald-100 text-emerald-700" :
                val === 'B' || val === 'Baik Sekali' ? "bg-blue-100 text-blue-700" :
                "bg-slate-100 text-slate-700"
            )}>
                {val || '-'}
            </Badge>
        )
    },
    {
      key: "jumlah",
      label: "Mhs",
      className: "text-center",
      cellClassName: "text-center font-black text-slate-700 font-headline",
    },
    {
      key: "active",
      label: "Aktif",
      className: "text-center",
      cellClassName: "text-center font-bold text-emerald-600",
      render: (val) => (
        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-2 py-0 font-headline">{val || 0}</Badge>
      )
    },
    {
      key: "graduated",
      label: "Lulus",
      className: "text-center",
      cellClassName: "text-center font-bold text-blue-600",
      render: (val) => (
        <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] px-2 py-0 font-headline">{val || 0}</Badge>
      )
    },
    {
      key: "avgGpa",
      label: "Avg IPK",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => (
        <span className="font-black text-amber-600 font-headline text-xs">{val?.toFixed(2) || '0.00'}</span>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 mb-8 pt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <LayoutDashboard className="size-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 font-headline tracking-tighter uppercase flex items-center gap-3">
            Dashboard
            <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black tracking-widest rounded-full not-italic border border-primary/20">SISTEM AKTIF</div>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pusat Kendali Akademik Fakultas</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map((stat) => (
          <Card key={stat.title} className="border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 rounded-2xl bg-white">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="size-5" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">
                    <TrendingUp className="size-2.5" />
                    Live
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 font-headline tracking-tighter">
                    {loading ? "..." : stat.value}
                  </h3>
                </div>
                <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-tight">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mahasiswa per Prodi Chart */}
        <Card className="border border-slate-200 shadow-sm shadow-slate-200/40 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black font-headline tracking-tight uppercase">Mahasiswa per Prodi</CardTitle>
                <CardDescription className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Distribusi jumlah mahasiswa aktif
                </CardDescription>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <Users className="size-4 text-slate-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-4 relative w-full min-w-0">
              {isMounted && (
                <ResponsiveContainer width="99%" height={300} debounce={50}>



                <BarChart data={Array.isArray(summaryData.prodiDistribution) ? summaryData.prodiDistribution : []} layout="vertical" margin={{ left: 20, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "bold" }}
                  />
                  <Bar dataKey="jumlah" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </CardContent>

        </Card>

        {/* Status Mahasiswa Pie Chart */}
        <Card className="border border-slate-200 shadow-sm shadow-slate-200/40 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black font-headline tracking-tight uppercase">Status Akademik</CardTitle>
                <CardDescription className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Kondisi status mahasiswa saat ini
                </CardDescription>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                <UserCheck className="size-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative w-full min-w-0">
              {isMounted && (
                <ResponsiveContainer width="99%" height={300} debounce={50}>



                <PieChart>
                  <Pie
                    data={dynamicStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {dynamicStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "bold" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pb-2">
              {dynamicStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <Badge 
                    className={cn(
                        "font-black text-[9px] px-2 py-0 border-none font-headline uppercase",
                        item.name === 'Aktif' ? "bg-emerald-50 text-emerald-600" :
                        item.name === 'Cuti' ? "bg-amber-50 text-amber-600" :
                        item.name === 'Lulus' ? "bg-blue-50 text-blue-600" :
                        "bg-rose-50 text-rose-600"
                    )}
                  >
                    <div className="size-1.5 rounded-full bg-current mr-1.5" />
                    {item.name}: {item.value.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Studi Performance Table */}
      <Card className="border border-slate-200 shadow-sm shadow-slate-200/40 rounded-3xl bg-white overflow-hidden">
        <CardHeader className="pb-6 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Award className="size-5" />
                </div>
                <div>
                <CardTitle className="text-lg font-black font-headline tracking-tight uppercase text-primary">Akreditasi & Performansi Prodi</CardTitle>
                <CardDescription className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-headline">Statistik operasional terintegrasi</CardDescription>
                </div>
            </div>
            <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] px-3 py-1 font-headline uppercase">{summaryData.totalProdi} Prodi Aktif</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={prodiColumns}
            data={summaryData.prodiDistribution}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Trend & Activity Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend Pendaftaran */}
        <Card className="lg:col-span-2 border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50">
            <div className="flex items-center justify-between">
                <CardTitle className="text-base font-black font-headline uppercase tracking-tight text-slate-700">Trend Pendaftaran Mahasiswa Baru</CardTitle>
                <TrendingUp className="size-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] relative w-full min-w-0">
              {isMounted && (
                <ResponsiveContainer width="99%" height={300} debounce={50}>



                <LineChart data={Array.isArray(summaryData.trendData) ? summaryData.trendData : []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="tahun" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "bold" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                  <Line type="monotone" dataKey="pendaftar" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} name="Pendaftar" />
                  <Line type="monotone" dataKey="diterima" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} name="Diterima" />
                </LineChart>
              </ResponsiveContainer>
              )}
            </div>
          </CardContent>

        </Card>

        {/* Aktivitas Terbaru */}
        <Card className="border border-slate-200 shadow-sm shadow-slate-200/40 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-black font-headline tracking-tight uppercase text-slate-700">Aktivitas Sistem</CardTitle>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <Clock className="size-4 text-slate-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              {summaryData.recentActivity?.length > 0 ? summaryData.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4 relative group">
                  <div className="absolute left-4 top-8 bottom-[-24px] w-[1px] bg-slate-100 last:hidden" />
                  <Avatar className="size-9 rounded-2xl shadow-sm border-2 border-white group-hover:scale-110 transition-transform duration-300">
                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">{activity.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[10px] font-black text-slate-900 font-headline uppercase truncate tracking-tight">{activity.user}</p>
                      <span className="text-[8px] font-black text-slate-300 uppercase">{activity.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{activity.action}</p>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center opacity-30">
                  <span className="text-[10px] font-black uppercase tracking-widest">Belum ada aktivitas</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4">
        {[
            { label: 'Validasi Prestasi', icon: Trophy, path: '/faculty/prestasi', color: 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700' },
            { label: 'Monitor PKKMB', icon: UserCheck, path: '/faculty/pkkmb', color: 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700' },
            { label: 'Screening Kesehatan', icon: BookOpen, path: '/faculty/kesehatan', color: 'bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600' },
            { label: 'Aspirasi Mahasiswa', icon: FileText, path: '/faculty/aspirasi', color: 'bg-rose-600 text-white shadow-rose-600/20 hover:bg-rose-700' },
        ].map((item, i) => (
            <Button 
                key={i} 
                onClick={() => navigate(item.path)} 
                variant="outline" 
                className={cn(
                    "h-16 rounded-2xl border-none shadow-xl flex items-center justify-start gap-4 px-6 transition-all hover:scale-[1.02] active:scale-95",
                    item.color
                )}
            >
                <div className="size-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <item.icon className="size-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </Button>
        ))}
      </div>
    </div>
  )
}

"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/card"
import { Button } from "./components/button"
import { Avatar, AvatarFallback } from "./components/avatar"
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Calendar,
  Clock,
  FileText,
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

// We will use state for these now, but keeping structures for mapping
const statsConfig = [
  {
    key: "totalStudents",
    title: "Total Mahasiswa",
    icon: Users,
    description: "mahasiswa terdaftar",
  },
  {
    key: "totalLecturers",
    title: "Total Dosen",
    icon: BookOpen,
    description: "dosen aktif",
  },
  {
    key: "totalCourses",
    title: "Matakuliah",
    icon: GraduationCap,
    description: "total sks aktif",
  },
  {
    key: "activeSchedules",
    title: "Jadwal Aktif",
    icon: Calendar,
    description: "perkuliahan hari ini",
  },
]

const statsData = [
  {
    title: "Total Mahasiswa",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    description: "dari tahun lalu",
  },
  {
    title: "Mahasiswa Aktif",
    value: "2,634",
    change: "+8.2%",
    trend: "up",
    icon: UserCheck,
    description: "92.5% dari total",
  },
  {
    title: "Program Studi",
    value: "8",
    change: "+2",
    trend: "up",
    icon: GraduationCap,
    description: "prodi aktif",
  },
  {
    title: "Total Dosen",
    value: "156",
    change: "+5.1%",
    trend: "up",
    icon: BookOpen,
    description: "dosen aktif",
  },
]

const mahasiswaPerProdi = [
  { name: "Teknik Informatika", jumlah: 520 },
  { name: "Sistem Informasi", jumlah: 480 },
  { name: "Teknik Elektro", jumlah: 380 },
  { name: "Teknik Mesin", jumlah: 350 },
  { name: "Teknik Sipil", jumlah: 420 },
  { name: "Arsitektur", jumlah: 280 },
  { name: "Teknik Industri", jumlah: 310 },
  { name: "Teknik Kimia", jumlah: 107 },
]

const statusMahasiswa = [
  { name: "Aktif", value: 2634, color: "#22c55e" },
  { name: "Cuti", value: 89, color: "#eab308" },
  { name: "Lulus", value: 98, color: "#3b82f6" },
  { name: "DO", value: 26, color: "#ef4444" },
]

const trendPendaftaran = [
  { tahun: "2020", pendaftar: 1200, diterima: 820 },
  { tahun: "2021", pendaftar: 1350, diterima: 890 },
  { tahun: "2022", pendaftar: 1480, diterima: 920 },
  { tahun: "2023", pendaftar: 1650, diterima: 980 },
  { tahun: "2024", pendaftar: 1820, diterima: 1050 },
  { tahun: "2025", pendaftar: 2100, diterima: 1180 },
]

const aktivitasTerbaru = [
  {
    id: 1,
    user: "Dr. Ahmad Yani",
    action: "menginput nilai Algoritma",
    time: "5 menit lalu",
    avatar: "AY",
  },
  {
    id: 2,
    user: "Staff TU",
    action: "memvalidasi KRS mahasiswa",
    time: "15 menit lalu",
    avatar: "ST",
  },
  {
    id: 3,
    user: "Kaprodi TI",
    action: "mengupdate kurikulum",
    time: "1 jam lalu",
    avatar: "KT",
  },
  {
    id: 4,
    user: "Admin PMB",
    action: "menambah pendaftar baru",
    time: "2 jam lalu",
    avatar: "AP",
  },
  {
    id: 5,
    user: "Dr. Siti Rahayu",
    action: "mengupload materi kuliah",
    time: "3 jam lalu",
    avatar: "SR",
  },
]

const jadwalHariIni = [
  {
    matakuliah: "Algoritma & Pemrograman",
    jam: "08:00 - 10:30",
    ruangan: "Lab Komputer 1",
    dosen: "Dr. Ahmad Yani",
  },
  {
    matakuliah: "Basis Data",
    jam: "10:30 - 13:00",
    ruangan: "R.301",
    dosen: "Dr. Budi Santoso",
  },
  {
    matakuliah: "Jaringan Komputer",
    jam: "13:00 - 15:30",
    ruangan: "Lab Jaringan",
    dosen: "Dr. Rina Wijaya",
  },
  {
    matakuliah: "Kecerdasan Buatan",
    jam: "15:30 - 18:00",
    ruangan: "R.405",
    dosen: "Dr. Hendra Kusuma",
  },
]

export default function DashboardPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    totalStudents: 0,
    totalLecturers: 0,
    totalCourses: 0,
    activeSchedules: 0,
    recentSchedules: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/faculty/summary');
        const result = await response.json();
        if (result.status === 'success') {
          setSummaryData(result.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute Chart Data from students (if we fetched them)
  // For now, using mock but mapping logic can be added here
  // Let's at least make the Status Chart dynamic based on our seeded data
  const dynamicStatusData = [
    { name: "Aktif", value: summaryData.totalStudents, color: "#22c55e" },
    { name: "Cuti", value: 0, color: "#eab308" },
    { name: "Lulus", value: 0, color: "#3b82f6" },
  ];

  // Map backend counts to the stats UI structure
  const dynamicStats = statsConfig.map(config => ({
    ...config,
    value: summaryData[config.key]?.toLocaleString() || "0",
    trend: "up",
    change: "Live"
  }));

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen font-body">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 px-4 lg:px-8">
          <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Selamat datang di SIAKAD Fakultas. Berikut ringkasan data akademik terkini.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {dynamicStats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="size-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? "..." : stat.value}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <TrendingUp className="size-3 text-green-500" />
                      <span className="text-green-500">
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground">{stat.description}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Special Ormawa Stat Card */}
              <Card className="border-primary/20 bg-primary/5 shadow-lg shadow-primary/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-primary uppercase tracking-widest">
                    Proposal Pending
                  </CardTitle>
                  <FileText className="size-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-primary">
                    {loading ? "..." : summaryData.pendingProposals}
                  </div>
                  <div className="flex items-center gap-1 text-xs mt-1">
                    <span className="text-primary/70 font-medium">Butuh Approval Fakultas</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Mahasiswa per Prodi Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Mahasiswa per Program Studi</CardTitle>
                  <CardDescription>
                    Distribusi jumlah mahasiswa aktif di setiap prodi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mahasiswaPerProdi} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={100}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Bar dataKey="jumlah" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Status Mahasiswa Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Mahasiswa</CardTitle>
                  <CardDescription>
                    Persentase status mahasiswa saat ini
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dynamicStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {dynamicStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-4">
                    {dynamicStatusData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="size-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.name}: {item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trend & Activity Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Trend Pendaftaran */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Trend Pendaftaran Mahasiswa Baru</CardTitle>
                  <CardDescription>
                    Perbandingan pendaftar dan yang diterima per tahun
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendPendaftaran}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tahun" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="pendaftar"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name="Pendaftar"
                        />
                        <Line
                          type="monotone"
                          dataKey="diterima"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name="Diterima"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Aktivitas Terbaru */}
              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas Terbaru</CardTitle>
                  <CardDescription>Aktivitas pengguna sistem</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {aktivitasTerbaru.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {activity.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span>{" "}
                            <span className="text-muted-foreground">
                              {activity.action}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Jadwal Hari Ini */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Jadwal Kuliah Hari Ini</CardTitle>
                  <CardDescription>
                    Jadwal perkuliahan yang berlangsung hari ini
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 size-4" />
                  Lihat Semua Jadwal
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {loading ? (
                    <div className="col-span-full py-10 text-center text-muted-foreground">
                      Memuat jadwal...
                    </div>
                  ) : summaryData.recentSchedules.length > 0 ? (
                    summaryData.recentSchedules.map((jadwal, index) => (
                      <div
                        key={index}
                        className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <Clock className="size-4 text-primary" />
                          <span className="text-sm font-medium text-primary">
                            {jadwal.hari}, {jadwal.jam_mulai} - {jadwal.jam_selesai}
                          </span>
                        </div>
                        <h4 className="font-medium text-balance">{jadwal.mata_kuliah?.nama_mk || "Matakuliah"}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {jadwal.ruangan || "Ruangan TBA"}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                              {jadwal.dosen?.name ? jadwal.dosen.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "DS"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {jadwal.dosen?.name || "Dosen Pengampu"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center text-muted-foreground">
                      Tidak ada jadwal kuliah hari ini.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>Pintasan untuk tugas yang sering dilakukan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <Button onClick={() => navigate('/faculty/mahasiswa/baru')} variant="outline" className="h-auto flex-col gap-2 p-4">
                    <Users className="size-6 text-primary" />
                    <span className="text-sm">Tambah Mahasiswa</span>
                  </Button>
                  <Button onClick={() => navigate('/faculty/krs')} variant="outline" className="h-auto flex-col gap-2 p-4">
                    <FileText className="size-6 text-primary" />
                    <span className="text-sm">Validasi KRS</span>
                  </Button>
                  <Button onClick={() => navigate('/faculty/jadwal')} variant="outline" className="h-auto flex-col gap-2 p-4">
                    <Calendar className="size-6 text-primary" />
                    <span className="text-sm">Atur Jadwal</span>
                  </Button>
                  <Button onClick={() => navigate('/faculty/laporan')} variant="outline" className="h-auto flex-col gap-2 p-4">
                    <ArrowUpRight className="size-6 text-primary" />
                    <span className="text-sm">Export Laporan</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/card"
import { Button } from "components/button"
import Sidebar from "components/Sidebar"
import TopNavBar from "components/TopNavBar"
import { Avatar, AvatarFallback } from "components/avatar"
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
  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar />
      <TopNavBar />
      <main className="ml-64 min-h-screen">
        <div className="pt-24 pb-12 px-8">
      <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di SIAKAD Fakultas. Berikut ringkasan data akademik terkini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="glass-card hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-none bg-background/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.trend === "up" ? (
                  <TrendingUp className="size-3 text-green-500" />
                ) : (
                  <TrendingDown className="size-3 text-destructive" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-destructive"}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mahasiswa per Prodi Chart */}
        <Card className="glass-card hover:shadow-md transition-all duration-300 border-none bg-background/60 backdrop-blur-md">
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
        <Card className="glass-card hover:shadow-md transition-all duration-300 border-none bg-background/60 backdrop-blur-md">
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
                    data={statusMahasiswa}
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
                    {statusMahasiswa.map((entry, index) => (
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
              {statusMahasiswa.map((item) => (
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
        <Card className="lg:col-span-2 glass-card border-none bg-background/60 backdrop-blur-md hover:shadow-md transition-all duration-300">
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
        <Card className="glass-card border-none bg-background/60 backdrop-blur-md hover:shadow-md transition-all duration-300">
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
      <Card className="glass-card border-none bg-background/60 backdrop-blur-md hover:shadow-md transition-all duration-300">
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
            {jadwalHariIni.map((jadwal, index) => (
              <div
                key={index}
                className="rounded-lg border border-white/20 bg-white/40 dark:bg-black/20 p-4 transition-all hover:bg-white/60 hover:-translate-y-1 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {jadwal.jam}
                  </span>
                </div>
                <h4 className="font-medium text-balance">{jadwal.matakuliah}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {jadwal.ruangan}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                      {jadwal.dosen
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {jadwal.dosen}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-card border-none bg-background/60 backdrop-blur-md hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>Pintasan untuk tugas yang sering dilakukan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Users className="size-6 text-primary" />
              <span className="text-sm">Tambah Mahasiswa</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <FileText className="size-6 text-primary" />
              <span className="text-sm">Validasi KRS</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Calendar className="size-6 text-primary" />
              <span className="text-sm">Atur Jadwal</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
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

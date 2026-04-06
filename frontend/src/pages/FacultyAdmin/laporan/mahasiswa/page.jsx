"use client"

import Sidebar from "../../components/Sidebar"
import TopNavBar from "../../components/TopNavBar"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/card"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select"
import {
  Users,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
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
  AreaChart,
  Area,
} from "recharts"

const mahasiswaPerAngkatan = [
  { angkatan: "2020", aktif: 45, cuti: 5, lulus: 120, nonAktif: 10 },
  { angkatan: "2021", aktif: 156, cuti: 12, lulus: 45, nonAktif: 8 },
  { angkatan: "2022", aktif: 198, cuti: 8, lulus: 0, nonAktif: 5 },
  { angkatan: "2023", aktif: 215, cuti: 3, lulus: 0, nonAktif: 2 },
  { angkatan: "2024", aktif: 242, cuti: 0, lulus: 0, nonAktif: 0 },
]

const mahasiswaPerProdi = [
  { name: "Teknik Informatika", value: 456, color: "hsl(var(--chart-1))" },
  { name: "Sistem Informasi", value: 398, color: "hsl(var(--chart-2))" },
  { name: "Teknik Elektro", value: 234, color: "hsl(var(--chart-3))" },
  { name: "Teknik Mesin", value: 189, color: "hsl(var(--chart-4))" },
]

const trendMahasiswa = [
  { tahun: "2020", masuk: 180, lulus: 150 },
  { tahun: "2021", masuk: 195, lulus: 165 },
  { tahun: "2022", masuk: 210, lulus: 175 },
  { tahun: "2023", masuk: 225, lulus: 180 },
  { tahun: "2024", masuk: 250, lulus: 185 },
]

const ipkDistribusi = [
  { range: "< 2.0", jumlah: 15 },
  { range: "2.0-2.5", jumlah: 45 },
  { range: "2.5-3.0", jumlah: 180 },
  { range: "3.0-3.5", jumlah: 420 },
  { range: "3.5-4.0", jumlah: 196 },
]

export default function LaporanMahasiswaPage() {
  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar />
      <TopNavBar />
      <main className="ml-64 min-h-screen">
        <div className="pt-24 pb-12 px-8">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Statistik Mahasiswa</h1>
            <p className="text-muted-foreground">Laporan dan analisis data mahasiswa</p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="2024-1">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-1">2024/2025 Ganjil</SelectItem>
                <SelectItem value="2023-2">2023/2024 Genap</SelectItem>
                <SelectItem value="2023-1">2023/2024 Ganjil</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Mahasiswa</p>
                  <p className="text-3xl font-bold">1,277</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+8.2%</span>
                <span className="text-xs text-muted-foreground">dari tahun lalu</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mahasiswa Aktif</p>
                  <p className="text-3xl font-bold">856</p>
                </div>
                <div className="rounded-lg bg-success/10 p-3">
                  <Users className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+5.4%</span>
                <span className="text-xs text-muted-foreground">dari semester lalu</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lulusan Tahun Ini</p>
                  <p className="text-3xl font-bold">185</p>
                </div>
                <div className="rounded-lg bg-info/10 p-3">
                  <GraduationCap className="h-6 w-6 text-info" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+2.8%</span>
                <span className="text-xs text-muted-foreground">dari tahun lalu</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">IPK Rata-rata</p>
                  <p className="text-3xl font-bold">3.28</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-3">
                  <TrendingUp className="h-6 w-6 text-warning" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+0.05</span>
                <span className="text-xs text-muted-foreground">dari semester lalu</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Mahasiswa per Angkatan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mahasiswa per Angkatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mahasiswaPerAngkatan}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="angkatan" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="aktif" name="Aktif" fill="hsl(var(--chart-1))" stackId="a" />
                    <Bar dataKey="cuti" name="Cuti" fill="hsl(var(--chart-3))" stackId="a" />
                    <Bar dataKey="lulus" name="Lulus" fill="hsl(var(--chart-2))" stackId="a" />
                    <Bar dataKey="nonAktif" name="Non-Aktif" fill="hsl(var(--chart-5))" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Mahasiswa per Prodi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribusi per Program Studi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-72 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mahasiswaPerProdi}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {mahasiswaPerProdi.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {mahasiswaPerProdi.map((prodi, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: prodi.color }}
                      />
                      <div>
                        <p className="text-sm font-medium">{prodi.value}</p>
                        <p className="text-xs text-muted-foreground">{prodi.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Trend Mahasiswa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trend Mahasiswa Masuk & Lulus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendMahasiswa}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="tahun" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="masuk"
                      name="Mahasiswa Masuk"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="lulus"
                      name="Mahasiswa Lulus"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* IPK Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribusi IPK Mahasiswa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ipkDistribusi} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis
                      dataKey="range"
                      type="category"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      width={60}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="jumlah" name="Jumlah" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ringkasan per Program Studi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Program Studi</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Total</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Aktif</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Cuti</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Lulus</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">IPK Rata-rata</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-3 font-medium">Teknik Informatika</td>
                    <td className="px-4 py-3 text-center">456</td>
                    <td className="px-4 py-3 text-center text-success">412</td>
                    <td className="px-4 py-3 text-center text-warning">18</td>
                    <td className="px-4 py-3 text-center text-info">26</td>
                    <td className="px-4 py-3 text-center font-medium">3.35</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="bg-success/20 text-success">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        +5.2%
                      </Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-3 font-medium">Sistem Informasi</td>
                    <td className="px-4 py-3 text-center">398</td>
                    <td className="px-4 py-3 text-center text-success">365</td>
                    <td className="px-4 py-3 text-center text-warning">15</td>
                    <td className="px-4 py-3 text-center text-info">18</td>
                    <td className="px-4 py-3 text-center font-medium">3.28</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="bg-success/20 text-success">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        +3.8%
                      </Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-3 font-medium">Teknik Elektro</td>
                    <td className="px-4 py-3 text-center">234</td>
                    <td className="px-4 py-3 text-center text-success">210</td>
                    <td className="px-4 py-3 text-center text-warning">8</td>
                    <td className="px-4 py-3 text-center text-info">16</td>
                    <td className="px-4 py-3 text-center font-medium">3.18</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="bg-destructive/20 text-destructive">
                        <TrendingDown className="mr-1 h-3 w-3" />
                        -1.2%
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Teknik Mesin</td>
                    <td className="px-4 py-3 text-center">189</td>
                    <td className="px-4 py-3 text-center text-success">169</td>
                    <td className="px-4 py-3 text-center text-warning">7</td>
                    <td className="px-4 py-3 text-center text-info">13</td>
                    <td className="px-4 py-3 text-center font-medium">3.12</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="bg-success/20 text-success">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        +2.1%
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
        </div>
      </main>
    </div>
  )
}

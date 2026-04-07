"use client"

import React, { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar"
import TopNavBar from "../../components/TopNavBar"
import axios from "axios"
import { toast, Toaster } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/card"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table"
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

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8b5cf6",
  "#ec4899"
];

export default function LaporanMahasiswaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [data, setData] = useState({
    summary: { total: 0, active: 0, graduated: 0, avgGpa: 0 },
    perAngkatan: [],
    perProdi: [],
    ipkDist: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/faculty/reports/summary")
      if (res.data.status === "success") {
        setData(res.data.data)
      }
    } catch (error) {
      toast.error("Gagal memuat data laporan")
    } finally {
      setLoading(false)
    }
  }

  // Map colors to perProdi data
  const prodiWithColors = data.perProdi.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }))
  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <TopNavBar setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-medium">Statistik Mahasiswa</h1>
            <p className="text-on-surface-variant">Laporan dan analisis data mahasiswa</p>
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
                  <p className="text-sm text-on-surface-variant">Total Mahasiswa</p>
                  <p className="text-3xl font-medium">{data.summary.total.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+0%</span>
                <span className="text-xs text-on-surface-variant">dari tahun lalu</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-on-surface-variant">Mahasiswa Aktif</p>
                  <p className="text-3xl font-medium">{data.summary.active.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-success/10 p-3">
                  <Users className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+0%</span>
                <span className="text-xs text-on-surface-variant">dari semester lalu</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-on-surface-variant">Lulusan Keseluruhan</p>
                  <p className="text-3xl font-medium">{data.summary.graduated.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-info/10 p-3">
                  <GraduationCap className="h-6 w-6 text-info" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+0%</span>
                <span className="text-xs text-on-surface-variant">dari tahun lalu</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-on-surface-variant">IPK Rata-rata</p>
                  <p className="text-3xl font-medium">{data.summary.avgGpa?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-3">
                  <TrendingUp className="h-6 w-6 text-warning" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+0</span>
                <span className="text-xs text-on-surface-variant">dari semester lalu</span>
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
                  <BarChart data={data.perAngkatan}>
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
                        data={prodiWithColors}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {prodiWithColors.map((entry, index) => (
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
                  {prodiWithColors.map((prodi, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: prodi.color }}
                      />
                      <div>
                        <p className="text-sm font-medium">{prodi.value}</p>
                        <p className="text-xs text-on-surface-variant">{prodi.name}</p>
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
                  <AreaChart data={data.perAngkatan}>
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
                  <BarChart data={data.ipkDist} layout="vertical">
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
        <div className="bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#fcfcfd] hover:bg-[#fcfcfd] border-b border-outline-variant/5">
                <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Program Studi</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Total</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Aktif</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Cuti</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Lulus</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">IPK Rata-rata</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prodiWithColors.map((prodi, index) => (
                <TableRow key={index} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5">
                  <TableCell className="px-8 py-6 font-medium text-[14px] text-on-surface">{prodi.name}</TableCell>
                  <TableCell className="px-8 py-6 text-center font-medium">{prodi.value}</TableCell>
                  <TableCell className="px-8 py-6 text-center text-success font-medium">{prodi.active}</TableCell>
                  <TableCell className="px-8 py-6 text-center text-warning font-medium">{prodi.leave}</TableCell>
                  <TableCell className="px-8 py-6 text-center text-info font-medium">{prodi.graduated}</TableCell>
                  <TableCell className="px-8 py-6 text-center font-medium">{prodi.avgGpa?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell className="px-8 py-6 text-center">
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Stable
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {prodiWithColors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">Pilih periode untuk melihat data</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
        </div>
      </main>
    </div>
  )
}

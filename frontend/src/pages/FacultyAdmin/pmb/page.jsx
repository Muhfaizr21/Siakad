"use client"

import React, { useState } from "react"
import Sidebar from "../components/Sidebar"
import TopNavBar from "../components/TopNavBar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card"
import { Button } from "../components/button"
import { Badge } from "../components/badge"
import { Input } from "../components/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  UserPlus,
  FileText,
  Download,
  Filter,
  Calendar,
  Users,
  ClipboardList,
  TrendingUp,
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
} from "recharts"

const pendaftarData = [
  {
    id: "PMB001",
    nama: "Ahmad Fauzi",
    email: "ahmad.fauzi@email.com",
    noHp: "081234567890",
    prodi: "Teknik Informatika",
    jalur: "SNBP",
    status: "Diterima",
    tanggalDaftar: "2024-02-15",
    nilaiRapor: 85.5,
  },
  {
    id: "PMB002",
    nama: "Siti Nurhaliza",
    email: "siti.nurhaliza@email.com",
    noHp: "081234567891",
    prodi: "Sistem Informasi",
    jalur: "SNBT",
    status: "Verifikasi",
    tanggalDaftar: "2024-02-16",
    nilaiRapor: 82.3,
  },
  {
    id: "PMB003",
    nama: "Budi Santoso",
    email: "budi.santoso@email.com",
    noHp: "081234567892",
    prodi: "Teknik Elektro",
    jalur: "Mandiri",
    status: "Pending",
    tanggalDaftar: "2024-02-17",
    nilaiRapor: 78.8,
  },
  {
    id: "PMB004",
    nama: "Dewi Kartika",
    email: "dewi.kartika@email.com",
    noHp: "081234567893",
    prodi: "Teknik Informatika",
    jalur: "SNBP",
    status: "Diterima",
    tanggalDaftar: "2024-02-18",
    nilaiRapor: 88.2,
  },
  {
    id: "PMB005",
    nama: "Eko Prasetyo",
    email: "eko.prasetyo@email.com",
    noHp: "081234567894",
    prodi: "Teknik Mesin",
    jalur: "SNBT",
    status: "Ditolak",
    tanggalDaftar: "2024-02-19",
    nilaiRapor: 65.5,
  },
  {
    id: "PMB006",
    nama: "Fitri Handayani",
    email: "fitri.handayani@email.com",
    noHp: "081234567895",
    prodi: "Arsitektur",
    jalur: "Mandiri",
    status: "Verifikasi",
    tanggalDaftar: "2024-02-20",
    nilaiRapor: 80.0,
  },
]

const pendaftarPerProdi = [
  { prodi: "Teknik Informatika", jumlah: 450, kuota: 200 },
  { prodi: "Sistem Informasi", jumlah: 320, kuota: 150 },
  { prodi: "Teknik Elektro", jumlah: 180, kuota: 100 },
  { prodi: "Teknik Mesin", jumlah: 150, kuota: 100 },
  { prodi: "Arsitektur", jumlah: 120, kuota: 80 },
]

const statusDistribusi = [
  { name: "Diterima", value: 420, color: "#22c55e" },
  { name: "Verifikasi", value: 280, color: "#f59e0b" },
  { name: "Pending", value: 350, color: "#3b82f6" },
  { name: "Ditolak", value: 150, color: "#ef4444" },
]

const gelombangPMB = [
  { id: 1, nama: "Gelombang 1 - SNBP", mulai: "2024-01-15", selesai: "2024-02-28", status: "Selesai" },
  { id: 2, nama: "Gelombang 2 - SNBT", mulai: "2024-03-01", selesai: "2024-04-15", status: "Aktif" },
  { id: 3, nama: "Gelombang 3 - Mandiri", mulai: "2024-04-20", selesai: "2024-06-30", status: "Belum Mulai" },
]

export default function PMBPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [jalurFilter, setJalurFilter] = useState("all")

  const filteredPendaftar = pendaftarData.filter((p) => {
    const matchSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === "all" || p.status === statusFilter
    const matchJalur = jalurFilter === "all" || p.jalur === jalurFilter
    return matchSearch && matchStatus && matchJalur
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "Diterima":
        return <Badge className="bg-success/10 text-success">Diterima</Badge>
      case "Verifikasi":
        return <Badge className="bg-warning/10 text-warning-foreground">Verifikasi</Badge>
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>
      case "Ditolak":
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getGelombangBadge = (status) => {
    switch (status) {
      case "Aktif":
        return <Badge className="bg-success/10 text-success">Aktif</Badge>
      case "Selesai":
        return <Badge variant="secondary">Selesai</Badge>
      case "Belum Mulai":
        return <Badge variant="outline">Belum Mulai</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen font-body">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 px-4 lg:px-8">
          <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Penerimaan Mahasiswa Baru</h1>
          <p className="text-muted-foreground">
            Kelola pendaftaran dan seleksi calon mahasiswa baru
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 size-4" />
                Tambah Pendaftar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pendaftar Manual</DialogTitle>
                <DialogDescription>
                  Input data pendaftar secara manual
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input placeholder="Nama Lengkap" />
                <Input placeholder="Email" type="email" />
                <Input placeholder="No. HP" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Program Studi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ti">Teknik Informatika</SelectItem>
                    <SelectItem value="si">Sistem Informasi</SelectItem>
                    <SelectItem value="te">Teknik Elektro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline">Batal</Button>
                <Button>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pendaftar</p>
              <p className="text-2xl font-bold">1,200</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="size-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Diterima</p>
              <p className="text-2xl font-bold">420</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-warning/10">
              <ClipboardList className="size-6 text-warning-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verifikasi</p>
              <p className="text-2xl font-bold">280</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-accent/10">
              <TrendingUp className="size-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rasio Diterima</p>
              <p className="text-2xl font-bold">35%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gelombang PMB */}
      <Card>
        <CardHeader>
          <CardTitle>Gelombang Pendaftaran</CardTitle>
          <CardDescription>Jadwal dan status gelombang PMB</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {gelombangPMB.map((g) => (
              <Card key={g.id} className="border-2">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{g.nama}</span>
                    {getGelombangBadge(g.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>{g.mulai} - {g.selesai}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pendaftar" className="w-full">
        <TabsList>
          <TabsTrigger value="pendaftar">Daftar Pendaftar</TabsTrigger>
          <TabsTrigger value="statistik">Statistik</TabsTrigger>
        </TabsList>

        <TabsContent value="pendaftar" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari pendaftar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="Diterima">Diterima</SelectItem>
                      <SelectItem value="Verifikasi">Verifikasi</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Ditolak">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={jalurFilter} onValueChange={setJalurFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Jalur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="SNBP">SNBP</SelectItem>
                      <SelectItem value="SNBT">SNBT</SelectItem>
                      <SelectItem value="Mandiri">Mandiri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead className="hidden md:table-cell">Program Studi</TableHead>
                      <TableHead className="hidden sm:table-cell">Jalur</TableHead>
                      <TableHead className="hidden lg:table-cell">Nilai Rapor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPendaftar.map((pendaftar) => (
                      <TableRow key={pendaftar.id}>
                        <TableCell className="font-mono text-sm">{pendaftar.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{pendaftar.nama}</p>
                            <p className="text-sm text-muted-foreground">{pendaftar.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{pendaftar.prodi}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{pendaftar.jalur}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{pendaftar.nilaiRapor}</TableCell>
                        <TableCell>{getStatusBadge(pendaftar.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 size-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 size-4" />
                                Lihat Berkas
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 size-4" />
                                Terima
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <XCircle className="mr-2 size-4" />
                                Tolak
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistik" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pendaftar per Prodi */}
            <Card>
              <CardHeader>
                <CardTitle>Pendaftar per Program Studi</CardTitle>
                <CardDescription>Perbandingan jumlah pendaftar dan kuota</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pendaftarPerProdi} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="prodi" type="category" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="jumlah" name="Pendaftar" fill="hsl(var(--primary))" />
                      <Bar dataKey="kuota" name="Kuota" fill="hsl(var(--muted))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Status</CardTitle>
                <CardDescription>Komposisi status pendaftar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribusi}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {statusDistribusi.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
        </div>
      </main>
    </div>
  )
}

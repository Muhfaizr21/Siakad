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

const statusColors = {
  Diterima: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  Verifikasi: "bg-amber-50 text-amber-600 border border-amber-100",
  Pending: "bg-blue-50 text-blue-600 border border-blue-100",
  Ditolak: "bg-rose-50 text-rose-600 border border-rose-100",
}

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

  return (
    <div className="bg-surface text-on-surface min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-on-surface font-headline uppercase leading-tight">Penerimaan Mahasiswa Baru</h1>
              <p className="text-on-surface-variant text-sm mt-1 font-medium">Kelola pendaftaran, seleksi berkas, dan pengumuman kelulusan calon mahasiswa.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-full px-6 h-11 border-outline-variant/20 font-medium text-[11px] uppercase tracking-widest hover:bg-slate-50">
                <Download className="mr-2 size-4" />
                Export Data
              </Button>
              <Dialog>
                 <DialogTrigger asChild>
                    <Button className="rounded-full px-6 h-11 bg-primary text-white shadow-lg shadow-primary/20 font-medium text-[11px] uppercase tracking-widest hover:bg-primary-fixed">
                       <UserPlus className="mr-2 size-4" />
                       Tambah Pendaftar
                    </Button>
                 </DialogTrigger>
                 <DialogContent className="rounded-[2.5rem] p-10 border-none shadow-2xl">
                    <DialogHeader className="mb-6">
                       <DialogTitle className="text-xl font-medium uppercase tracking-tight">Tambah Pendaftar Manual</DialogTitle>
                       <DialogDescription className="text-sm font-medium text-on-surface-variant">Input data calon mahasiswa baru secara manual ke sistem PMB.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5">
                       <Input placeholder="Nama Lengkap" className="rounded-xl h-11" />
                       <Input placeholder="Email Institusi/Pribadi" type="email" className="rounded-xl h-11" />
                       <Input placeholder="Nomor WhatsApp (Aktif)" className="rounded-xl h-11" />
                       <Select>
                          <SelectTrigger className="rounded-xl h-11 font-medium text-[11px] uppercase tracking-widest">
                             <SelectValue placeholder="Pilih Program Studi" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                             <SelectItem value="ti">TEKNIK INFORMATIKA</SelectItem>
                             <SelectItem value="si">SISTEM INFORMASI</SelectItem>
                             <SelectItem value="te">TEKNIK ELEKTRO</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <DialogFooter className="mt-8 gap-3">
                       <Button variant="outline" className="rounded-xl px-6 h-11 font-medium text-[11px] uppercase tracking-widest border-outline-variant/20">Batal</Button>
                       <Button className="rounded-xl px-8 h-11 bg-primary text-white font-medium text-[11px] uppercase tracking-widest">Simpan Data</Button>
                    </DialogFooter>
                 </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                   <Users className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-2xl font-medium text-on-surface">1,200</p>
                   <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Total Pendaftar</p>
                </div>
             </Card>
             <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                   <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-2xl font-medium text-on-surface">420</p>
                   <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Diterima</p>
                </div>
             </Card>
             <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                   <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-2xl font-medium text-on-surface">280</p>
                   <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Verifikasi</p>
                </div>
             </Card>
             <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                   <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-2xl font-medium text-on-surface">35%</p>
                   <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Passing Rate</p>
                </div>
             </Card>
          </div>

          {/* Gelombang PMB - Premium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             {gelombangPMB.map((g) => (
                <div key={g.id} className="bg-white border border-outline-variant/10 rounded-3xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all hover:shadow-lg">
                   <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[9px] font-medium tracking-widest text-primary bg-primary/5 px-2.5 py-1 rounded-sm uppercase">GELOMBANG {g.id}</span>
                         <span className={`px-3 py-1 rounded-full text-[9px] font-medium uppercase tracking-widest ${
                            g.status === 'Aktif' ? 'bg-emerald-100 text-emerald-600' : 
                            g.status === 'Selesai' ? 'bg-slate-100 text-on-surface-variant/60' : 
                            'bg-amber-100 text-amber-600'
                         }`}>{g.status}</span>
                      </div>
                      <h4 className="font-medium text-on-surface leading-tight mb-2">{g.nama}</h4>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-on-surface-variant opacity-60">
                         <Calendar className="size-3.5" />
                         <span>{g.mulai} — {g.selesai}</span>
                      </div>
                   </div>
                   <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                </div>
             ))}
          </div>

          {/* Main Content Area with Tabs */}
          <Tabs defaultValue="pendaftar" className="w-full">
            <TabsList className="bg-surface-container-high p-1.5 rounded-2xl mb-8 border border-outline-variant/10 inline-flex w-auto">
              <TabsTrigger value="pendaftar" className="rounded-xl px-10 py-2.5 text-[11px] font-medium uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white shadow-none data-[state=active]:shadow-lg transition-all">Daftar Pendaftar</TabsTrigger>
              <TabsTrigger value="statistik" className="rounded-xl px-10 py-2.5 text-[11px] font-medium uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white shadow-none data-[state=active]:shadow-lg transition-all">Statistik & Laporan</TabsTrigger>
            </TabsList>

            <TabsContent value="pendaftar" className="mt-0 space-y-6">
              <div className="bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="px-8 py-6 border-b border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="relative flex-1 sm:max-w-md">
                     <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50" />
                     <Input
                        placeholder="Cari Nama, Email atau ID Pendaftar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 rounded-xl border-outline-variant/20 focus:ring-primary/20"
                     />
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                     <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40 h-11 rounded-xl border-outline-variant/20 font-medium text-[11px] uppercase tracking-widest">
                           <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                           <SelectItem value="all">SEMUA STATUS</SelectItem>
                           <SelectItem value="Diterima">DITERIMA</SelectItem>
                           <SelectItem value="Verifikasi">VERIFIKASI</SelectItem>
                           <SelectItem value="Pending">PENDING</SelectItem>
                           <SelectItem value="Ditolak">DITOLAK</SelectItem>
                        </SelectContent>
                     </Select>
                     <Select value={jalurFilter} onValueChange={setJalurFilter}>
                        <SelectTrigger className="w-40 h-11 rounded-xl border-outline-variant/20 font-medium text-[11px] uppercase tracking-widest">
                           <SelectValue placeholder="Jalur" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                           <SelectItem value="all">SEMUA JALUR</SelectItem>
                           <SelectItem value="SNBP">SNBP</SelectItem>
                           <SelectItem value="SNBT">SNBT</SelectItem>
                           <SelectItem value="Mandiri">MANDIRI</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#fcfcfd] hover:bg-[#fcfcfd] border-b border-outline-variant/5">
                      <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">ID & Pendaftar</TableHead>
                      <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Pilihan Prodi</TableHead>
                      <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Jalur</TableHead>
                      <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Nilai</TableHead>
                      <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Status</TableHead>
                      <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPendaftar.map((pendaftar) => (
                      <TableRow key={pendaftar.id} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5">
                        <TableCell className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/5 border border-primary/10 text-primary flex items-center justify-center font-medium text-[10px] uppercase">
                                 {pendaftar.nama.charAt(0)}
                              </div>
                              <div>
                                 <span className="block font-medium text-[14px] text-on-surface leading-tight mb-0.5">{pendaftar.nama}</span>
                                 <span className="text-[11px] font-medium text-on-surface-variant opacity-70 font-mono uppercase tracking-widest">{pendaftar.id} • {pendaftar.email}</span>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                           <span className="font-medium text-[13px] text-on-surface-variant">{pendaftar.prodi}</span>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                          <span className="text-[10px] font-medium text-primary bg-primary/5 border border-primary/10 px-2.5 py-1 rounded uppercase tracking-widest">{pendaftar.jalur}</span>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                           <span className="font-medium text-on-surface text-[14px]">{pendaftar.nilaiRapor}</span>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                           <span className={`px-3.5 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap ${statusColors[pendaftar.status]}`}>
                              {pendaftar.status}
                           </span>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-primary/5 text-on-surface-variant">
                                <MoreHorizontal className="size-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl p-2 border-outline-variant/10">
                              <DropdownMenuItem className="rounded-xl font-medium text-[10px] uppercase tracking-widest p-3">
                                <Eye className="mr-3 size-4 text-primary" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl font-medium text-[10px] uppercase tracking-widest p-3">
                                <FileText className="mr-3 size-4 text-primary" />
                                Review Berkas
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl font-medium text-[10px] uppercase tracking-widest p-3 text-emerald-600">
                                <CheckCircle className="mr-3 size-4" />
                                Terima
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl font-medium text-[10px] uppercase tracking-widest p-3 text-rose-600">
                                <XCircle className="mr-3 size-4" />
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
            </TabsContent>

            <TabsContent value="statistik" className="mt-0">
              <div className="grid gap-8 lg:grid-cols-2">
                <Card className="rounded-[2rem] border border-outline-variant/10 shadow-sm p-8 bg-white overflow-hidden">
                  <div className="mb-8">
                     <h4 className="font-medium text-on-surface uppercase tracking-tight">Pendaftar per Program Studi</h4>
                     <p className="text-sm font-medium text-on-surface-variant opacity-60">Visualisasi minat calon mahasiswa terhadap program studi.</p>
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pendaftarPerProdi} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="prodi" type="category" width={140} tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--on-surface-variant))' }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="jumlah" name="Pendaftar" fill="#00236f" radius={[0, 4, 4, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="rounded-[2rem] border border-outline-variant/10 shadow-sm p-8 bg-white overflow-hidden">
                  <div className="mb-8">
                     <h4 className="font-medium text-on-surface uppercase tracking-tight">Distribusi Status Pendaftar</h4>
                     <p className="text-sm font-medium text-on-surface-variant opacity-60">Persentase kelulusan seleksi administrasi.</p>
                  </div>
                  <div className="h-[350px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribusi}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusDistribusi.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Middle Text for Pie Chart */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                       <p className="text-3xl font-medium text-on-surface leading-none">1.2K</p>
                       <p className="text-[10px] font-medium text-on-surface-variant opacity-40 uppercase tracking-widest mt-1">Total</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

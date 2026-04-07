"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast, Toaster } from "react-hot-toast"
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
  Trash2,
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

export default function PMBPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [jalurFilter, setJalurFilter] = useState("all")
  
  // API State
  const [admissions, setAdmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    noHp: "",
    prodi: "",
    jalur: "SNBP",
    nilaiRapor: 0,
  })

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/faculty/pmb/admissions")
      if (res.data.status === "success") {
        setAdmissions(res.data.data)
      }
    } catch (error) {
      console.error("Gagal ambil data PMB:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Ensure numeric conversion for NilaiRapor
      const submissionData = {
        ...formData,
        nilaiRapor: parseFloat(formData.nilaiRapor)
      }
      await axios.post("http://localhost:8000/api/faculty/pmb/admissions", submissionData)
      toast.success("Pendaftar berhasil ditambahkan")
      setIsModalOpen(false)
      setFormData({ nama: "", email: "", noHp: "", prodi: "", jalur: "SNBP", nilaiRapor: 0 })
      fetchData()
    } catch (error) {
      toast.error("Gagal menyimpan data")
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:8000/api/faculty/pmb/admissions/${id}`, { status: newStatus })
      toast.success(`Status diperbarui ke ${newStatus}`)
      fetchData()
    } catch (error) {
      toast.error("Gagal memperbarui status")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data pendaftar ini?")) return
    try {
      await axios.delete(`http://localhost:8000/api/faculty/pmb/admissions/${id}`)
      toast.success("Pendaftar dihapus")
      fetchData()
    } catch (error) {
      toast.error("Gagal menghapus")
    }
  }

  const filteredPendaftar = admissions.filter((p) => {
    const matchSearch = (p.nama || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.pendaftarId || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === "all" || p.status === statusFilter
    const matchJalur = jalurFilter === "all" || p.jalur === jalurFilter
    return matchSearch && matchStatus && matchJalur
  })

  // Chart Logic
  const pendaftarPerProdi = Object.values(admissions.reduce((acc, curr) => {
    acc[curr.prodi] = acc[curr.prodi] || { prodi: curr.prodi, jumlah: 0 }
    acc[curr.prodi].jumlah++
    return acc
  }, {}))

  const statusDistribusi = [
    { name: "Diterima", value: admissions.filter(p => p.status === 'Diterima').length, color: "#22c55e" },
    { name: "Verifikasi", value: admissions.filter(p => p.status === 'Verifikasi').length, color: "#f59e0b" },
    { name: "Pending", value: admissions.filter(p => p.status === 'Pending').length, color: "#3b82f6" },
    { name: "Ditolak", value: admissions.filter(p => p.status === 'Ditolak').length, color: "#ef4444" },
  ]

  const statusColors = {
    Diterima: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    Verifikasi: "bg-amber-50 text-amber-600 border border-amber-100",
    Pending: "bg-blue-50 text-blue-600 border border-blue-100",
    Ditolak: "bg-rose-50 text-rose-600 border border-rose-100",
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-sans">
      <Toaster />
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
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                    <form onSubmit={handleSubmit} className="grid gap-5">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-slate-400">Nama Lengkap</label>
                          <Input value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} placeholder="Nama Calon Mahasiswa" className="rounded-xl h-11 bg-slate-50/50" required />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-slate-400">Email</label>
                             <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@domain.com" type="email" className="rounded-xl h-11 bg-slate-50/50" required />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-slate-400">No. WhatsApp</label>
                             <Input value={formData.noHp} onChange={(e) => setFormData({...formData, noHp: e.target.value})} placeholder="0812..." className="rounded-xl h-11 bg-slate-50/50" required />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-slate-400">Jalur Masuk</label>
                             <Select value={formData.jalur} onValueChange={(v) => setFormData({...formData, jalur: v})}>
                                <SelectTrigger className="rounded-xl h-11 font-medium text-[11px] uppercase tracking-widest bg-slate-50/50">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                   <SelectItem value="SNBP">SNBP</SelectItem>
                                   <SelectItem value="SNBT">SNBT</SelectItem>
                                   <SelectItem value="Mandiri">MANDIRI</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-slate-400">Nilai Rapor / Skor</label>
                             <Input value={formData.nilaiRapor} onChange={(e) => setFormData({...formData, nilaiRapor: e.target.value})} type="number" step="0.01" className="rounded-xl h-11 bg-slate-50/50" required />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-slate-400">Program Studi Pilihan</label>
                          <Select value={formData.prodi} onValueChange={(v) => setFormData({...formData, prodi: v})}>
                             <SelectTrigger className="rounded-xl h-11 font-medium text-[11px] uppercase tracking-widest bg-slate-50/50">
                                <SelectValue placeholder="Pilih Program Studi" />
                             </SelectTrigger>
                             <SelectContent className="rounded-2xl">
                                <SelectItem value="Teknik Informatika">TEKNIK INFORMATIKA</SelectItem>
                                <SelectItem value="Sistem Informasi">SISTEM INFORMASI</SelectItem>
                                <SelectItem value="Teknik Elektro">TEKNIK ELEKTRO</SelectItem>
                                <SelectItem value="Teknik Mesin">TEKNIK MESIN</SelectItem>
                                <SelectItem value="Arsitektur">ARSITEKTUR</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                       <DialogFooter className="mt-8 gap-3">
                          <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6 h-11 font-medium text-[11px] uppercase tracking-widest border-outline-variant/20">Batal</Button>
                          <Button type="submit" className="rounded-xl px-8 h-11 bg-primary text-white font-medium text-[11px] uppercase tracking-widest">Simpan Data</Button>
                       </DialogFooter>
                    </form>
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
                   <p className="text-2xl font-medium text-on-surface">{admissions.length}</p>
                   <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Total Pendaftar</p>
                </div>
             </Card>
             <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                   <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-2xl font-medium text-on-surface">{admissions.filter(p => p.status === 'Diterima').length}</p>
                   <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Diterima</p>
                </div>
             </Card>
             <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                   <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-2xl font-medium text-on-surface">{admissions.filter(p => p.status === 'Verifikasi').length}</p>
                   <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Verifikasi</p>
                </div>
             </Card>
             <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                   <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-2xl font-medium text-on-surface">
                     {admissions.length > 0 ? ((admissions.filter(p => p.status === 'Diterima').length / admissions.length) * 100).toFixed(0) : 0}%
                   </p>
                   <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Passing Rate</p>
                </div>
             </Card>
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
                        placeholder="Cari Nama, Email atau ID PMB..."
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

                <div className="overflow-x-auto">
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
                        {loading ? (
                          <TableRow><TableCell colSpan={6} className="text-center py-20 font-medium text-slate-400">Memuat data pendaftar...</TableCell></TableRow>
                        ) : filteredPendaftar.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="text-center py-20 font-medium text-slate-400">Data tidak ditemukan</TableCell></TableRow>
                        ) : filteredPendaftar.map((pendaftar) => (
                          <TableRow key={pendaftar.id} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5">
                            <TableCell className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-primary/5 border border-primary/10 text-primary flex items-center justify-center font-medium text-[10px] uppercase">
                                     {(pendaftar.nama || "P").charAt(0)}
                                  </div>
                                  <div>
                                     <span className="block font-medium text-[14px] text-on-surface leading-tight mb-0.5">{pendaftar.nama}</span>
                                     <span className="text-[11px] font-medium text-on-surface-variant opacity-70 font-mono uppercase tracking-widest">{pendaftar.pendaftarId} • {pendaftar.email}</span>
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
                               <span className={`px-3.5 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap ${statusColors[pendaftar.status] || statusColors.Pending}`}>
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
                                <DropdownMenuContent align="end" className="rounded-2xl p-2 border-outline-variant/10 shadow-xl">
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(pendaftar.id, "Diterima")} className="rounded-xl font-medium text-[10px] uppercase tracking-widest p-3 text-emerald-600">
                                    <CheckCircle className="mr-3 size-4" />
                                    Terima
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(pendaftar.id, "Ditolak")} className="rounded-xl font-medium text-[10px] uppercase tracking-widest p-3 text-rose-600">
                                    <XCircle className="mr-3 size-4" />
                                    Tolak
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(pendaftar.id, "Verifikasi")} className="rounded-xl font-medium text-[10px] uppercase tracking-widest p-3 text-amber-600">
                                    <ClipboardList className="mr-3 size-4" />
                                    Verifikasi
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(pendaftar.id)} className="rounded-xl font-medium text-[10px] uppercase tracking-widest p-3 text-slate-400">
                                    <Trash2 className="mr-3 size-4" />
                                    Hapus Data
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                   </Table>
                </div>
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
                  <div className="h-[350px] relative text-center">
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
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                       <p className="text-3xl font-medium text-on-surface leading-none">{admissions.length}</p>
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

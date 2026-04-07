"use client"

import { useState } from "react"
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
import { Textarea } from "../components/textarea"
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
  Plus,
  Pencil,
  Trash2,
  Eye,
  Bell,
  FileText,
  Calendar,
  Megaphone,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

const pengumumanData = [
  {
    id: 1,
    judul: "Jadwal UAS Semester Genap 2023/2024",
    kategori: "Akademik",
    tanggal: "2024-05-15",
    status: "Published",
    views: 1250,
    prioritas: "Tinggi",
  },
  {
    id: 2,
    judul: "Pendaftaran Wisuda Periode Juni 2024",
    kategori: "Wisuda",
    tanggal: "2024-05-10",
    status: "Published",
    views: 890,
    prioritas: "Tinggi",
  },
  {
    id: 3,
    judul: "Libur Hari Raya Idul Fitri 1445 H",
    kategori: "Umum",
    tanggal: "2024-04-08",
    status: "Published",
    views: 2100,
    prioritas: "Normal",
  },
  {
    id: 4,
    judul: "Workshop Machine Learning untuk Mahasiswa",
    kategori: "Kegiatan",
    tanggal: "2024-05-20",
    status: "Draft",
    views: 0,
    prioritas: "Normal",
  },
  {
    id: 5,
    judul: "Perubahan Jadwal Kuliah Prodi TI",
    kategori: "Akademik",
    tanggal: "2024-05-18",
    status: "Published",
    views: 450,
    prioritas: "Tinggi",
  },
]

const kalenderData = [
  {
    id: 1,
    kegiatan: "UTS Semester Genap",
    tanggalMulai: "2024-03-18",
    tanggalSelesai: "2024-03-29",
    status: "Selesai",
  },
  {
    id: 2,
    kegiatan: "Libur Hari Raya",
    tanggalMulai: "2024-04-08",
    tanggalSelesai: "2024-04-14",
    status: "Selesai",
  },
  {
    id: 3,
    kegiatan: "UAS Semester Genap",
    tanggalMulai: "2024-06-03",
    tanggalSelesai: "2024-06-14",
    status: "Akan Datang",
  },
  {
    id: 4,
    kegiatan: "Wisuda Periode I",
    tanggalMulai: "2024-06-28",
    tanggalSelesai: "2024-06-29",
    status: "Akan Datang",
  },
  {
    id: 5,
    kegiatan: "Perkuliahan Semester Ganjil",
    tanggalMulai: "2024-09-02",
    tanggalSelesai: "2024-12-20",
    status: "Akan Datang",
  },
]

const templateData = [
  { id: 1, nama: "Surat Keterangan Aktif", kategori: "Akademik", penggunaan: 156 },
  { id: 2, nama: "Surat Rekomendasi", kategori: "Akademik", penggunaan: 89 },
  { id: 3, nama: "Surat Izin Cuti", kategori: "Administrasi", penggunaan: 45 },
  { id: 4, nama: "Surat Pengantar PKL", kategori: "PKL/Magang", penggunaan: 234 },
  { id: 5, nama: "Surat Pengantar Skripsi", kategori: "Skripsi", penggunaan: 178 },
]

import Sidebar from "../components/Sidebar"
import TopNavBar from "../components/TopNavBar"

export default function KontenPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [kategoriFilter, setKategoriFilter] = useState("all")

  const filteredPengumuman = pengumumanData.filter((p) => {
    const matchSearch = p.judul.toLowerCase().includes(searchTerm.toLowerCase())
    const matchKategori = kategoriFilter === "all" || p.kategori === kategoriFilter
    return matchSearch && matchKategori
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "Published":
        return <Badge className="bg-success/10 text-success">Published</Badge>
      case "Draft":
        return <Badge variant="secondary">Draft</Badge>
      case "Scheduled":
        return <Badge className="bg-primary/10 text-primary">Scheduled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getKalenderBadge = (status) => {
    switch (status) {
      case "Selesai":
        return <Badge variant="secondary">Selesai</Badge>
      case "Berlangsung":
        return <Badge className="bg-success/10 text-success">Berlangsung</Badge>
      case "Akan Datang":
        return <Badge className="bg-primary/10 text-primary">Akan Datang</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPrioritasBadge = (prioritas) => {
    switch (prioritas) {
      case "Tinggi":
        return <Badge variant="destructive">Tinggi</Badge>
      case "Normal":
        return <Badge variant="outline">Normal</Badge>
      default:
        return <Badge variant="outline">{prioritas}</Badge>
    }
  }

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <TopNavBar setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Manajemen Konten</h1>
          <p className="text-on-surface-variant">
            Kelola pengumuman, kalender akademik, dan template dokumen
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <Megaphone className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Total Pengumuman</p>
              <p className="text-2xl font-medium">{pengumumanData.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="size-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Published</p>
              <p className="text-2xl font-medium">
                {pengumumanData.filter((p) => p.status === "Published").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="size-6 text-warning-foreground" />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Draft</p>
              <p className="text-2xl font-medium">
                {pengumumanData.filter((p) => p.status === "Draft").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-accent/10">
              <Calendar className="size-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Kegiatan Mendatang</p>
              <p className="text-2xl font-medium">
                {kalenderData.filter((k) => k.status === "Akan Datang").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pengumuman" className="w-full">
        <TabsList>
          <TabsTrigger value="pengumuman">Pengumuman</TabsTrigger>
          <TabsTrigger value="kalender">Kalender Akademik</TabsTrigger>
          <TabsTrigger value="template">Template Dokumen</TabsTrigger>
        </TabsList>

        <TabsContent value="pengumuman" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input
                    placeholder="Cari pengumuman..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="Akademik">Akademik</SelectItem>
                      <SelectItem value="Wisuda">Wisuda</SelectItem>
                      <SelectItem value="Kegiatan">Kegiatan</SelectItem>
                      <SelectItem value="Umum">Umum</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 size-4" />
                        Buat Pengumuman
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Buat Pengumuman Baru</DialogTitle>
                        <DialogDescription>
                          Isi detail pengumuman yang akan dipublikasikan
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Input placeholder="Judul Pengumuman" />
                        <div className="grid grid-cols-2 gap-4">
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="akademik">Akademik</SelectItem>
                              <SelectItem value="wisuda">Wisuda</SelectItem>
                              <SelectItem value="kegiatan">Kegiatan</SelectItem>
                              <SelectItem value="umum">Umum</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Prioritas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tinggi">Tinggi</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Textarea placeholder="Isi pengumuman..." rows={6} />
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Simpan Draft</Button>
                        <Button>Publish</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul</TableHead>
                      <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                      <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                      <TableHead className="hidden lg:table-cell">Views</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPengumuman.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.judul}</span>
                            {item.prioritas === "Tinggi" && (
                              <AlertCircle className="size-4 text-destructive" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{item.kategori}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{item.tanggal}</TableCell>
                        <TableCell className="hidden lg:table-cell">{item.views.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="mr-2 size-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 size-4" />
                                Hapus
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

        <TabsContent value="kalender" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Kalender Akademik</CardTitle>
                <CardDescription>Jadwal kegiatan akademik tahun ajaran berjalan</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 size-4" />
                Tambah Kegiatan
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kegiatan</TableHead>
                      <TableHead>Tanggal Mulai</TableHead>
                      <TableHead>Tanggal Selesai</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kalenderData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.kegiatan}</TableCell>
                        <TableCell>{item.tanggalMulai}</TableCell>
                        <TableCell>{item.tanggalSelesai}</TableCell>
                        <TableCell>{getKalenderBadge(item.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Pencil className="mr-2 size-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 size-4" />
                                Hapus
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

        <TabsContent value="template" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Template Dokumen</CardTitle>
                <CardDescription>Kelola template surat dan dokumen akademik</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 size-4" />
                Tambah Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templateData.map((template) => (
                  <Card key={template.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="size-5 text-primary" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 size-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="mr-2 size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 size-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <h3 className="mb-1 font-medium">{template.nama}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{template.kategori}</Badge>
                        <span className="text-sm text-on-surface-variant">
                          {template.penggunaan}x digunakan
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
              </div>
        </div>
      </main>
    </div>
  )
}

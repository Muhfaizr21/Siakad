"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast, Toaster } from "react-hot-toast"
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

import Sidebar from "../components/Sidebar"
import TopNavBar from "../components/TopNavBar"

export default function KontenPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [kategoriFilter, setKategoriFilter] = useState("all")

  // API State
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Akademik",
    thumbnail: "",
    author: "Admin Fakultas",
    status: "Published"
  })

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/faculty/news")
      if (res.data.status === "success") {
        setArticles(res.data.data)
      }
    } catch (error) {
      console.error("Gagal ambil berita:", error)
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
      if (editingArticle) {
        await axios.put(`http://localhost:8000/api/faculty/news/${editingArticle.id}`, formData)
        toast.success("Pengumuman diperbarui")
      } else {
        await axios.post("http://localhost:8000/api/faculty/news", formData)
        toast.success("Pengumuman dipublikasikan")
      }
      setIsModalOpen(false)
      setEditingArticle(null)
      setFormData({ title: "", content: "", category: "Akademik", thumbnail: "", author: "Admin Fakultas", status: "Published" })
      fetchData()
    } catch (error) {
      toast.error("Gagal menyimpan data")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus pengumuman ini?")) return
    try {
      await axios.delete(`http://localhost:8000/api/faculty/news/${id}`)
      toast.success("Berhasil dihapus")
      fetchData()
    } catch (error) {
      toast.error("Gagal menghapus")
    }
  }

  const openEdit = (art) => {
    setEditingArticle(art)
    setFormData({
      title: art.title,
      content: art.content,
      category: art.category,
      thumbnail: art.thumbnail,
      author: art.author,
      status: art.status
    })
    setIsModalOpen(true)
  }

  const filteredPengumuman = articles.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchKategori = kategoriFilter === "all" || p.category === kategoriFilter
    return matchSearch && matchKategori
  })

  // Dummy data for Kalender & Template (Optional integration later)
  const kalenderData = [
    { id: 1, kegiatan: "UAS Semester Genap", tanggalMulai: "2024-06-03", tanggalSelesai: "2024-06-14", status: "Akan Datang" }
  ]
  const templateData = [
    { id: 1, nama: "Surat Keterangan Aktif", kategori: "Akademik", penggunaan: 156 }
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case "Published":
        return <Badge className="bg-success/10 text-success border-none">Published</Badge>
      case "Draft":
        return <Badge variant="secondary">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Toaster />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <TopNavBar setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Manajemen Konten</h1>
                <p className="text-on-surface-variant text-sm">
                  Kelola pengumuman, kalender akademik, dan template dokumen fakultas.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none shadow-sm bg-white/50 backdrop-blur-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Megaphone className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Konten</p>
                    <p className="text-2xl font-black">{articles.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white/50 backdrop-blur-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                    <CheckCircle className="size-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published</p>
                    <p className="text-2xl font-black">{articles.filter(a => a.status === 'Published').length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white/50 backdrop-blur-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10">
                    <Clock className="size-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Draft</p>
                    <p className="text-2xl font-black">{articles.filter(a => a.status === 'Draft').length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white/50 backdrop-blur-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10">
                    <Eye className="size-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Views</p>
                    <p className="text-2xl font-black">{articles.reduce((acc, curr) => acc + (curr.views || 0), 0)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="pengumuman" className="w-full">
              <TabsList className="bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="pengumuman" className="rounded-lg font-bold text-xs uppercase tracking-widest">Pengumuman</TabsTrigger>
                <TabsTrigger value="kalender" className="rounded-lg font-bold text-xs uppercase tracking-widest">Kalender Akademik</TabsTrigger>
                <TabsTrigger value="template" className="rounded-lg font-bold text-xs uppercase tracking-widest">Template Dokumen</TabsTrigger>
              </TabsList>

              <TabsContent value="pengumuman" className="mt-6">
                <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden rounded-[2rem]">
                  <CardHeader className="pb-4 bg-white">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="relative flex-1 sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          placeholder="Cari judul konten..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 bg-slate-50 border-none rounded-xl font-medium"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                          <SelectTrigger className="w-40 bg-slate-50 border-none rounded-xl font-bold text-xs uppercase tracking-widest">
                            <SelectValue placeholder="Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            <SelectItem value="Akademik">Akademik</SelectItem>
                            <SelectItem value="Wisuda">Wisuda</SelectItem>
                            <SelectItem value="Kegiatan">Kegiatan</SelectItem>
                            <SelectItem value="Umum">Umum</SelectItem>
                          </SelectContent>
                        </Select>
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                          <DialogTrigger asChild>
                            <Button onClick={() => { setEditingArticle(null); setFormData({ title: "", content: "", category: "Akademik", thumbnail: "", author: "Admin Fakultas", status: "Published" }) }} className="rounded-xl bg-slate-900 hover:bg-primary font-bold text-xs uppercase tracking-widest py-6 px-6 shadow-lg shadow-slate-900/10 transition-all">
                              <Plus className="mr-2 size-4" />
                              Publikasi Baru
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl rounded-[2.5rem] p-10">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-black tracking-tight">{editingArticle ? 'Edit Pengumuman' : 'Publikasi Konten Baru'}</DialogTitle>
                              <DialogDescription className="font-medium text-slate-400">
                                Isi detail informasi yang ingin disampaikan kepada civitas akademika.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-6 py-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Pengumuman</label>
                                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-slate-50 border-none p-6 rounded-2xl font-bold" placeholder="Contoh: Jadwal UAS Semester Genap..." required />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger className="bg-slate-50 border-none p-6 h-auto rounded-2xl font-bold">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Akademik">Akademik</SelectItem>
                                      <SelectItem value="Wisuda">Wisuda</SelectItem>
                                      <SelectItem value="Kegiatan">Kegiatan</SelectItem>
                                      <SelectItem value="Umum">Umum</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger className="bg-slate-50 border-none p-6 h-auto rounded-2xl font-bold">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Published">Published</SelectItem>
                                      <SelectItem value="Draft">Draft</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thumbnail URL (Opsional)</label>
                                <Input value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} className="bg-slate-50 border-none p-6 rounded-2xl font-medium" placeholder="https://image-url.com/news.jpg" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konten Lengkap</label>
                                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="bg-slate-50 border-none p-6 rounded-2xl font-medium min-h-[150px]" placeholder="Tuliskan isi pengumuman di sini..." required />
                              </div>
                              <DialogFooter className="gap-3 mt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold text-slate-400 uppercase tracking-widest px-8">Batal</Button>
                                <Button type="submit" className="bg-slate-900 rounded-xl font-black text-xs uppercase tracking-[0.2em] px-10 h-14">Simpan & Publikasikan</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest pl-8 py-5">Judul Konten</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5">Kategori</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5 hidden md:table-cell">Tanggal</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5 hidden lg:table-cell">Views</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5">Status</TableHead>
                          <TableHead className="w-20 pr-8"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow><TableCell colSpan={6} className="text-center py-20 font-medium text-slate-400 italic">Memuat data konten...</TableCell></TableRow>
                        ) : filteredPengumuman.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="text-center py-20 font-medium text-slate-400 italic">Belum ada pengumuman yang sesuai.</TableCell></TableRow>
                        ) : filteredPengumuman.map((item) => (
                          <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                            <TableCell className="pl-8 py-6">
                              <span className="font-bold text-slate-700 block line-clamp-1">{item.title}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.author}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-500 font-bold text-[10px] py-1">{item.category}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs font-bold text-slate-400">
                              {new Date(item.CreatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                <Eye className="size-3" />
                                {item.views || 0}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell className="pr-8">
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="size-8 rounded-lg hover:bg-rose-50 hover:text-rose-500">
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="kalender" className="mt-6">
                <Card className="border-none shadow-xl rounded-[2rem] p-10 text-center py-32">
                  <Calendar className="size-16 text-slate-200 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-slate-700">Fitur Kalender Akademik</h3>
                  <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">Modulo ini sedang dikembangkan untuk sinkronisasi jadwal semester otomatis.</p>
                </Card>
              </TabsContent>

              <TabsContent value="template" className="mt-6">
                <Card className="border-none shadow-xl rounded-[2rem] p-10 text-center py-32">
                  <FileText className="size-16 text-slate-200 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-slate-700">Manajemen Template Surat</h3>
                  <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">Anda dapat mengunggah file .docx atau .pdf yang akan menjadi standar surat mahasiswa di sini (Coming Soon).</p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

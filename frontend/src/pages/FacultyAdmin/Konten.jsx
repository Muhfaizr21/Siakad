"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast, Toaster } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/card"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { Input } from "./components/input"
import { Textarea } from "./components/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs"
import { DataTable } from "./components/data-table"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/select"
import { Label } from "./components/label"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/dialog"
import {
  Megaphone,
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  Save,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye
} from "lucide-react"

export default function KontenPage() {
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState([])
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [selectedArticleId, setSelectedArticleId] = useState(null)

  const [formData, setFormData] = useState({
    id: null, title: "", content: "", category: "Akademik", thumbnail: "", author: "Admin Fakultas", status: "Published"
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/faculty/news")
      if (res.data.status === "success") {
        setArticles(res.data.data)
      }
    } catch (error) {
      toast.error("Gagal mengambil data konten")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenAdd = () => {
    setIsEditMode(false)
    setFormData({ id: null, title: "", content: "", category: "Akademik", thumbnail: "", author: "Admin Fakultas", status: "Published" })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (article) => {
    setIsEditMode(true)
    setFormData({
      id: article.id,
      title: article.title,
      content: article.content,
      category: article.category,
      thumbnail: article.thumbnail || "",
      author: article.author || "Admin Fakultas",
      status: article.status || "Published"
    })
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedArticleId) return
    setIsSubmitting(true)
    try {
      await axios.delete(`/api/faculty/news/${selectedArticleId}`)
      toast.success("Konten berhasil dihapus")
      setIsDelOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Gagal menghapus konten")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      if (isEditMode) {
        await axios.put(`/api/faculty/news/${formData.id}`, formData)
        toast.success("Konten diperbarui")
      } else {
        await axios.post("/api/faculty/news", formData)
        toast.success("Konten dipublikasikan")
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Gagal menyimpan konten")
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: "title",
      label: "Informasi Konten",
      render: (value, row) => (
        <div className="flex flex-col text-left">
          <span className="font-bold text-slate-900 line-clamp-1 uppercase tracking-tight text-[13px]">{value}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{row.author || "Admin"} — {new Date(row.CreatedAt).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: "category",
      label: "Kategori",
      render: (value) => <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border-none shadow-none">{value}</Badge>
    },
    {
      key: "views",
      label: "Views",
      className: "text-center",
      cellClassName: "text-center",
      render: (value) => <span className="text-[11px] font-black text-slate-500 font-headline">{value || 0}</span>
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge 
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline uppercase",
            val === 'Published' ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
            "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20"
          )}
        >
          {val}
        </Badge>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Megaphone className="size-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">Manajemen Konten</h1>
          </div>
          <div className="flex items-center gap-2">
             <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Portal Publikasi & Informasi Kampus</p>
          </div>
        </div>


      <Tabs defaultValue="pengumuman" className="w-full">
        <TabsList className="bg-white border-slate-200/60 border rounded-2xl p-1.5 h-auto gap-1.5 shadow-sm">
          <TabsTrigger 
            value="pengumuman" 
            className="rounded-2xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold text-[13px] gap-3 transition-all duration-300"
          >
            <Megaphone className="size-[18px]" />
            Pengumuman
          </TabsTrigger>
          <TabsTrigger 
            value="kalender" 
            className="rounded-2xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold text-[13px] gap-3 transition-all duration-300"
          >
            <Calendar className="size-[18px]" />
            Kalender Akademik
          </TabsTrigger>
          <TabsTrigger 
            value="template" 
            className="rounded-2xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold text-[13px] gap-3 transition-all duration-300"
          >
            <FileText className="size-[18px]" />
            Template Dokumen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pengumuman" className="mt-4">
          <Card className="border-none shadow-sm overflow-hidden rounded-3xl bg-white">
            <CardContent className="p-0 font-headline">
               <DataTable 
                  columns={columns}
                  data={articles}
                  loading={loading}
                  searchPlaceholder="Cari berita..."
                  onSync={fetchData}
                  syncLabel="Refresh Data"
                  onAdd={handleOpenAdd}
                  addLabel="Publikasi Baru"
                  filters={[
                    {
                      key: 'category',
                      placeholder: 'Filter Kategori',
                      options: [
                        { label: 'Akademik', value: 'Akademik' },
                        { label: 'Wisuda', value: 'Wisuda' },
                        { label: 'Kegiatan', value: 'Kegiatan' },
                        { label: 'Umum', value: 'Umum' },
                      ]
                    }
                  ]}
                  actions={(row) => (
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-9 w-9 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-all">
                        <Pencil className="size-4" />
                      </Button>
                      <Button onClick={() => { setSelectedArticleId(row.id); setIsDelOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all text-slate-400">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
               />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kalender">
           <Card className="border-none shadow-sm shadow-slate-200/50 min-h-[400px] flex items-center justify-center text-center bg-white/50 backdrop-blur-md rounded-[2rem] relative overflow-hidden group font-headline">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="space-y-6 relative z-10">
                 <div className="size-20 rounded-[2rem] bg-primary/5 flex items-center justify-center mx-auto border border-primary/10 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-primary/5">
                    <Calendar className="size-10 text-primary/40" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Coming Soon</p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">Fitur Kalender Akademik Terintegrasi</p>
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="template">
           <Card className="border-none shadow-sm shadow-slate-200/50 min-h-[400px] flex items-center justify-center text-center bg-white/50 backdrop-blur-md rounded-[2rem] relative overflow-hidden group font-headline">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
              <div className="space-y-6 relative z-10">
                 <div className="size-20 rounded-[2rem] bg-indigo-50/50 flex items-center justify-center mx-auto border border-indigo-100 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-indigo-500/5">
                    <FileText className="size-10 text-indigo-400/40" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-500">Repository</p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">Manajemen Template Surat Menyurat</p>
                 </div>
                 <Button variant="outline" className="h-12 rounded-2xl px-8 border-indigo-100 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all font-headline border-none ring-1 ring-indigo-100">Upload Template</Button>
              </div>
           </Card>
        </TabsContent>
      </Tabs>

      {/* CRUD Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl p-0 border-none shadow-2xl overflow-hidden rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 border-b border-slate-100 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
               <Megaphone className="size-32 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col items-start translate-x-0.5">
               <div className="flex items-center gap-3 mb-3">
                  <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group transition-all duration-500 hover:rotate-6">
                     {isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                  </div>
                  <div className="flex flex-col">
                    <Badge variant="secondary" className="w-fit text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-primary/5 text-primary border-none mb-1 font-headline">
                       Content Registry Protocol
                    </Badge>
                  </div>
               </div>
               <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase leading-none">
                  {isEditMode ? 'Edit Informasi' : 'Publikasi Baru'}
               </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
            <div className="space-y-4">
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5 font-headline">
                     <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-0.5 font-headline">Judul Utama Konten</Label>
                     <Input 
                        value={formData.title} 
                        onChange={(e) => setFormData({...formData, title: e.target.value})} 
                        placeholder="Masukkan judul artikel yang deskriptif..." 
                        required 
                        className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline uppercase tracking-tight"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 font-headline">
                     <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-0.5 font-headline">Kategori</Label>
                     <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                        <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 font-bold font-headline text-[11px] px-4">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-2xl font-headline overflow-hidden p-1 font-headline">
                           <SelectItem value="Akademik" className="text-[10px] font-bold uppercase rounded-lg mb-0.5 focus:bg-primary/5 font-headline">Akademik</SelectItem>
                           <SelectItem value="Wisuda" className="text-[10px] font-bold uppercase rounded-lg mb-0.5 focus:bg-primary/5 font-headline">Wisuda</SelectItem>
                           <SelectItem value="Kegiatan" className="text-[10px] font-bold uppercase rounded-lg mb-0.5 focus:bg-primary/5 font-headline">Kegiatan</SelectItem>
                           <SelectItem value="Umum" className="text-[10px] font-bold uppercase rounded-lg focus:bg-primary/5 font-headline">Umum</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-1.5 font-headline">
                     <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-0.5 font-headline">Status Publikasi</Label>
                     <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                        <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 font-bold font-headline text-[11px] px-4">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-2xl font-headline overflow-hidden p-1 font-headline">
                           <SelectItem value="Published" className="text-[10px] font-black uppercase rounded-lg mb-0.5 focus:bg-emerald-50 text-emerald-600 font-headline">Published</SelectItem>
                           <SelectItem value="Draft" className="text-[10px] font-black uppercase rounded-lg focus:bg-slate-50 text-slate-500 font-headline">Draft</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               <div className="space-y-1.5 font-headline">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-0.5 font-headline">Thumbnail URL</Label>
                  <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                        <FileText className="size-3.5" />
                     </div>
                     <Input 
                        value={formData.thumbnail} 
                        onChange={(e) => setFormData({...formData, thumbnail: e.target.value})} 
                        placeholder="https://images.unsplash.com/..." 
                        className="pl-11 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-[11px] font-headline"
                     />
                  </div>
               </div>

               <div className="space-y-1.5 font-headline">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-0.5 font-headline">Narasi Konten Lengkap</Label>
                  <Textarea 
                     value={formData.content} 
                     onChange={(e) => setFormData({...formData, content: e.target.value})} 
                     className="min-h-[140px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-black text-[10px] p-4 leading-relaxed focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 font-headline uppercase" 
                     placeholder="Tuliskan isi pengumuman secara lengkap..." 
                     required 
                  />
               </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/10 rounded-b-[2rem]">
               <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-6 h-12 rounded-xl transition-all font-headline">
                  Batalkan
               </Button>
               <Button type="submit" disabled={isSubmitting} className="px-8 h-12 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 border-none font-headline">
                  {isSubmitting ? (
                    <Loader2 className="animate-spin size-4 mr-2"/>
                  ) : (
                    <Save className="size-4 mr-2 stroke-[3px]"/>
                  )}
                  <span className="text-[9px] font-black uppercase tracking-[0.15em]">
                    {isEditMode ? 'Simpan' : 'Terbitkan Sekarang'}
                  </span>
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Konten Publikasi?"
        description="Konten yang dihapus akan segera hilang dari portal informasi fakultas dan aplikasi mobile mahasiswa."
        loading={isSubmitting}
      />
    </div>
  )
}

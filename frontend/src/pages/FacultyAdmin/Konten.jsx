"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { Input } from "./components/input"
import { Textarea } from "./components/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs"
import { DataTable } from "./components/data-table"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import { toast, Toaster } from "react-hot-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/select"
import { Label } from "./components/label"
import { cn } from "@/lib/utils"
import { Modal, ModalBody, ModalFooter, ModalBtn } from "./components/Modal"


import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"
import { API_BASE_URL } from "../../services/api"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Eye = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>visibility</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Megaphone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>campaign</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;



const API = "/faculty"

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
      const res = await axios.get(`${API}/news`)
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
      const res = await axios.delete(`${API}/news/${selectedArticleId}`)
      if (res.data.status === "success") {
        toast.success("Konten berhasil dihapus")
        setIsDelOpen(false)
        fetchData()
      } else {
        toast.error(`Gagal hapus: ${res.data.message || 'Response gagal'}`)
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Gangguan server'
      toast.error(`Gagal menghapus konten: ${msg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = isEditMode 
        ? `${API}/news/${formData.id}` 
        : `${API}/news`
      const method = isEditMode ? "put" : "post"
      
      const res = await axios({ method, url, data: formData })
      
      if (res.data.status === "success") {
        toast.success(isEditMode ? "Konten diperbarui" : "Konten dipublikasikan")
        setIsModalOpen(false)
        fetchData()
      } else {
        toast.error(`Gagal simpan: ${res.data.message || 'Gagal menyimpan'}`)
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Batas waktu habis'
      const action = isEditMode ? "simpan" : "terbitkan"
      toast.error(`Gagal ${action} konten: ${msg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: "title",
      label: "Publikasi",
      render: (value, row) => (
        <div className="flex flex-col text-left">
          <span className="font-bold text-slate-800 font-jakarta text-[14px] leading-tight truncate max-w-[200px]">{value}</span>
          <span className="text-[10px] font-medium text-slate-400 font-inter mt-1 leading-none">{row.author || "Admin"} — {new Date(row.CreatedAt).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: "category",
      label: "Klasifikasi",
      render: (value) => <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider bg-slate-50 text-slate-500 border-none shadow-none font-inter px-2 py-0.5">{value}</Badge>
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge 
          className={cn(
            "capitalize font-semibold text-[9px] px-2 py-0.5 border-none shadow-sm font-inter uppercase tracking-wider",
            val === 'Published' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          )}
        >
          {val}
        </Badge>
      )
    }
  ]

  const statsData = [
    { label: 'Total Publikasi', value: articles.length, icon: Megaphone, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Views Akumulasi', value: articles.reduce((acc, a) => acc + (a.views || 0), 0), icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Draft Tersimpan', value: articles.filter(a => a.status === 'Draft').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <PageContainer className="min-h-screen bg-transparent font-inter">
      <Toaster position="top-right" />
      
      <PageHeader
        icon={Megaphone}
        title="Manajemen Konten"
        description="Portal Publikasi & Informasi Internal"
      />

      <ResponsiveGrid cols={3}>
        {statsData.map((stat, i) => (
          <ResponsiveCard key={i} className="flex flex-row items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-inter">{stat.label}</span>
              <span className="text-xl font-bold text-slate-900 font-jakarta tracking-tight">{loading ? '...' : stat.value}</span>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      <Tabs defaultValue="pengumuman" className="w-full">
        <TabsList className="glass-card border border-slate-200/60 rounded-2xl p-1.5 h-auto gap-1.5 shadow-none mt-6">
          <TabsTrigger 
            value="pengumuman" 
            className="rounded-2xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold text-[13px] gap-3 transition-all duration-300 font-inter"
          >
            <span className="material-symbols-outlined size-[18px]" >campaign</span>
            Pengumuman
          </TabsTrigger>
          <TabsTrigger 
            value="kalender" 
            className="rounded-2xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold text-[13px] gap-3 transition-all duration-300 font-inter"
          >
            <span className="material-symbols-outlined size-[18px]" >calendar_month</span>
            Kalender Akademik
          </TabsTrigger>
          <TabsTrigger 
            value="template" 
            className="rounded-2xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold text-[13px] gap-3 transition-all duration-300 font-inter"
          >
            <span className="material-symbols-outlined size-[18px]" >description</span>
            Template Dokumen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pengumuman" className="mt-4">
          <ResponsiveCard noPadding>
               <DataTable 
                  columns={columns}
                  data={articles}
                  loading={loading}
                  searchPlaceholder="Cari berita..."
                  onSync={fetchData}
                  syncLabel="Refresh Data"
                  onAdd={handleOpenAdd}
                  addLabel="Publikasi Baru"
                  title="Daftar Konten Informasi"
                  itemLabel="artikel / berita"
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
                    <div className="flex items-center justify-end gap-2 pr-2">
                      <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-9 w-9 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-all">
                        <span className="material-symbols-outlined size-4" >edit</span>
                      </Button>
                      <Button onClick={() => { setSelectedArticleId(row.id); setIsDelOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all text-slate-400">
                        <span className="material-symbols-outlined size-4" >delete</span>
                      </Button>
                    </div>
                  )}
               />
          </ResponsiveCard>
        </TabsContent>

        <TabsContent value="kalender">
           <ResponsiveCard className="min-h-[400px] flex items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="space-y-6 relative z-10">
                 <div className="size-20 rounded-[2rem] bg-primary/5 flex items-center justify-center mx-auto border border-primary/10 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-primary/5">
                    <span className="material-symbols-outlined size-10 text-primary/40" >calendar_month</span>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-primary font-inter">Coming Soon</p>
                    <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider max-w-[200px] mx-auto leading-relaxed font-inter">Fitur Kalender Akademik Terintegrasi</p>
                 </div>
              </div>
           </ResponsiveCard>
        </TabsContent>

        <TabsContent value="template">
           <ResponsiveCard className="min-h-[400px] flex items-center justify-center text-center relative overflow-hidden group font-headline">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
              <div className="space-y-6 relative z-10">
                 <div className="size-20 rounded-[2rem] bg-indigo-50/50 flex items-center justify-center mx-auto border border-indigo-100 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-indigo-500/5">
                    <span className="material-symbols-outlined size-10 text-indigo-400/40" >description</span>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-500">Repository</p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">Manajemen Template Surat Menyurat</p>
                 </div>
                 <Button variant="outline" className="h-12 rounded-2xl px-8 border-indigo-100 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all font-headline border-none ring-1 ring-indigo-100">Upload Template</Button>
              </div>
           </ResponsiveCard>
        </TabsContent>
      </Tabs>

      {/* CRUD Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Informasi' : 'Publikasi Baru'}
        subtitle="Manajemen distribusi informasi dan publikasi artikel resmi fakultas."
        icon={isEditMode ? <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >add</span>}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 font-inter">Judul Utama Konten</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masukkan judul artikel yang deskriptif..."
                    required
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-semibold text-sm font-inter tracking-tight"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 font-inter">Kategori</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-semibold font-inter text-[13px] px-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-inter overflow-hidden">
                      <SelectItem value="Akademik" className="text-[11px] font-bold uppercase rounded-lg mb-0.5 focus:bg-primary/5">Akademik</SelectItem>
                      <SelectItem value="Wisuda" className="text-[11px] font-bold uppercase rounded-lg mb-0.5 focus:bg-primary/5">Wisuda</SelectItem>
                      <SelectItem value="Kegiatan" className="text-[11px] font-bold uppercase rounded-lg mb-0.5 focus:bg-primary/5">Kegiatan</SelectItem>
                      <SelectItem value="Umum" className="text-[11px] font-bold uppercase rounded-lg focus:bg-primary/5">Umum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 font-inter">Status Publikasi</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-semibold font-inter text-[13px] px-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-inter overflow-hidden">
                      <SelectItem value="Published" className="text-[11px] font-bold uppercase rounded-lg mb-0.5 focus:bg-emerald-50 text-emerald-600">Published</SelectItem>
                      <SelectItem value="Draft" className="text-[11px] font-bold uppercase rounded-lg focus:bg-slate-50 text-slate-500">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 font-inter">Thumbnail URL</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined size-3.5" >description</span>
                  </div>
                  <Input
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="pl-11 h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-semibold text-[12px] font-inter"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 font-inter">Narasi Konten Lengkap</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-[140px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-semibold text-[13px] p-4 leading-relaxed focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 font-inter"
                  placeholder="Tuliskan isi pengumuman secara lengkap..."
                  required
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <ModalBtn variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Batalkan
            </ModalBtn>
            <ModalBtn type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin size-4" >sync</span>
              ) : (
                <span className="material-symbols-outlined stroke-[3px]" style={{ fontSize: '14px' }} >save</span>
              )}
              <span className="uppercase tracking-[0.1em]">{isEditMode ? "Update Changes" : "Publish Content"}</span>
            </ModalBtn>
          </ModalFooter>
        </form>
      </Modal>

      <DeleteConfirmModal 
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Konten Publikasi?"
        description="Konten yang dihapus akan segera hilang dari portal informasi fakultas dan aplikasi mobile mahasiswa."
        loading={isSubmitting}
      />
    </PageContainer>
  )
}

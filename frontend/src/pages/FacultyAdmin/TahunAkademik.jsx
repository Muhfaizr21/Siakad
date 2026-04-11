"use client"

import React, { useState, useEffect } from "react"
import api from "../../lib/axios"
import { toast, Toaster } from "react-hot-toast"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { DataTable } from "./components/data-table"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Save,
  Loader2,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./components/dialog"
import { Input } from "./components/input"
import { Label } from "./components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/select"
import { cn } from "@/lib/utils"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

export default function TahunAkademikPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [selectedPeriodId, setSelectedPeriodId] = useState(null)

  const [formData, setFormData] = useState({
    id: null,
    activeYear: "",
    activeSemester: "Ganjil",
    isKrsOpen: false,
    isGradeInputOpen: false
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get("/faculty/academic-periods")
      if (res.data.status === "success" && res.data.data) {
        setData([res.data.data])
      }
    } catch {
      toast.error("Gagal mengambil data periode")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenAdd = () => {
    setIsEditMode(false)
    setFormData({ id: 0, activeYear: "", activeSemester: "Ganjil", isKrsOpen: false, isGradeInputOpen: false })
    setIsCrudOpen(true)
  }

  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setFormData({
        id: row.id,
        activeYear: row.activeYear,
        activeSemester: row.activeSemester,
        isKrsOpen: row.isKrsOpen,
        isGradeInputOpen: row.isGradeInputOpen
    })
    setIsCrudOpen(true)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post("/faculty/academic-periods", formData)
      toast.success(isEditMode ? "Periode berhasil diperbarui" : "Periode baru diinisialisasi")
      fetchData()
      setIsCrudOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan data periode")
    } finally {
      setIsSubmitting(false)
    }
  }

    const handleDelete = async () => {
    if (!selectedPeriodId) return
    setIsSubmitting(true)
    try {
      await api.delete(`/faculty/academic-periods/${selectedPeriodId}`)
      toast.success("Periode akademik berhasil dihapus")
      fetchData()
      setIsDelOpen(false)
    } catch {
      toast.error("Gagal menghapus periode")
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: "activeYear",
      label: "Siklus Akademik",
      render: (value, row) => (
        <div className="flex flex-col text-left">
          <span className="font-black text-slate-900 font-headline uppercase text-[12px] tracking-tight leading-none">{value}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-none">{row.activeSemester} (Global)</span>
        </div>
      )
    },
    {
      key: "isKrsOpen",
      label: "Akses Portal",
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <Badge className={cn("text-[9px] font-black px-2 py-0.5 border-none shadow-sm uppercase font-headline tracking-widest", val ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
            KRS: {val ? "OPEN" : "CLOSE"}
          </Badge>
          <Badge className={cn("text-[9px] font-black px-2 py-0.5 border-none shadow-sm uppercase font-headline tracking-widest", row.isGradeInputOpen ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500")}>
            NILAI: {row.isGradeInputOpen ? "OPEN" : "CLOSE"}
          </Badge>
        </div>
      )
    }
  ]

  const statsData = [
    { label: 'Siklus Aktif', value: data[0]?.activeYear || 'IDLE', icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Semester', value: data[0]?.activeSemester || '...', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'KRS Status', value: data[0]?.isKrsOpen ? 'OPEN' : 'CLOSED', icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  return (
    <PageContainer>
      <Toaster position="top-right" />
      
      <PageHeader
        icon={CalendarDays}
        title="Periode Akademik"
        description="Manajemen Kalender & Parameter Sistem"
      />

      <ResponsiveGrid cols={3}>
        {statsData.map((stat, i) => (
          <ResponsiveCard key={i} className="flex flex-row items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div className="flex flex-col font-headline leading-tight">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
              <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">{loading ? '...' : stat.value}</span>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      <ResponsiveCard noPadding className="mt-6">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            searchPlaceholder="Cari Tahun..."
            onAdd={handleOpenAdd}
            addLabel="Parameter Baru"
            actions={(row) => (
              <div className="flex items-center justify-end gap-2 pr-2">
                <Button 
                  onClick={() => handleOpenEdit(row)}
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button 
                  onClick={() => { setSelectedPeriodId(row.id); setIsDelOpen(true); }}
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all text-slate-400"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          />
      </ResponsiveCard>

      {/* CRUD MODAL */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Calendar className="size-24 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col items-start">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                  {isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">
                  Academic Cycle Registry
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                {isEditMode ? 'Update Periode' : 'Inisialisasi Periode'}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1 uppercase leading-none font-headline">
                Konfigurasi semester berjalan dan jadwal input nilai fakultas.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Tahun Akademik</Label>
                  <Input
                    value={formData.activeYear}
                    onChange={(e) => setFormData({ ...formData, activeYear: e.target.value })}
                    placeholder="Contoh: 2024/2025"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Tipe Semester</Label>
                  <Select value={formData.activeSemester} onValueChange={(val) => setFormData({ ...formData, activeSemester: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold font-headline text-xs px-4">
                      <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                      <SelectItem value="Ganjil" className="rounded-xl font-bold text-[11px] p-3 uppercase tracking-widest font-headline">Ganjil (Odd)</SelectItem>
                      <SelectItem value="Genap" className="rounded-xl font-bold text-[11px] p-3 uppercase tracking-widest font-headline">Genap (Even)</SelectItem>
                      <SelectItem value="Antara" className="rounded-xl font-bold text-[11px] p-3 uppercase tracking-widest font-headline">Antara (Short)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Akses Portal</Label>
                  <div
                    onClick={() => setFormData({ ...formData, isKrsOpen: !formData.isKrsOpen })}
                    className={`flex items-center justify-between p-4 h-14 rounded-2xl border transition-all cursor-pointer group font-headline ${
                      formData.isKrsOpen 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`size-2 rounded-full ${formData.isKrsOpen ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest font-headline ${formData.isKrsOpen ? 'text-primary' : 'text-slate-400'}`}>
                        {formData.isKrsOpen ? "Terbuka (KRS)" : "Tertutup (KRS)"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Input Nilai</Label>
                  <div
                    onClick={() => setFormData({ ...formData, isGradeInputOpen: !formData.isGradeInputOpen })}
                    className={`flex items-center justify-between p-4 h-14 rounded-2xl border transition-all cursor-pointer group font-headline ${
                      formData.isGradeInputOpen 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`size-2 rounded-full ${formData.isGradeInputOpen ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest font-headline ${formData.isGradeInputOpen ? 'text-primary' : 'text-slate-400'}`}>
                        {formData.isGradeInputOpen ? "Terbuka (Grade)" : "Tertutup (Grade)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30 rounded-b-[2rem]">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl font-headline">
                Batalkan
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 border-none font-headline">
                {isSubmitting ? (
                  <Loader2 className="animate-spin size-4 mr-3" />
                ) : (
                  <Save className="size-4 mr-3 stroke-[3px]" />
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] font-headline">{isEditMode ? 'Authorize Update' : 'Initialize Cycle'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus / Nonaktifkan?"
        description="Menghapus periode akan menghentikan seluruh aktivitas akademik dan portal mahasiswa pada rentang waktu tersebut."
        loading={isSubmitting}
      />
    </PageContainer>
  )
}
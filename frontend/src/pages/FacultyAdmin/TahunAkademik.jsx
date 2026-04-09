"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast, Toaster } from "react-hot-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/card"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { DataTable } from "./components/data-table"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Save,
  Loader2,
  Clock,
  CheckCircle2,
  Settings,
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
      const res = await axios.get("/api/faculty/academic-periods")
      if (res.data.status === "success") {
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
    setFormData({ id: null, year: "", semester: "Ganjil", startDate: "", endDate: "", isActive: true })
    setIsCrudOpen(true)
  }

  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setFormData(row)
    setIsCrudOpen(true)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      if (isEditMode) {
        await axios.post(`/api/faculty/academic-periods`, formData)
        toast.success("Periode berhasil diperbarui")
      } else {
        await axios.post("/api/faculty/academic-periods", formData)
        toast.success("Periode baru telah ditambahkan")
      }
      fetchData()
      setIsCrudOpen(false)
    } catch {
      toast.error("Gagal menyimpan data")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPeriodId) return
    setIsSubmitting(true)
    try {
      await axios.delete(`/api/faculty/academic-periods/${selectedPeriodId}`)
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
      label: "Tahun Ajaran",
      render: (value) => (
        <span className="font-bold text-primary text-[13px] font-headline tracking-tighter uppercase">{value}</span>
      )
    },
    {
      key: "activeSemester",
      label: "Semester",
      render: (value) => (
        <span className="font-black text-slate-600 uppercase text-[10px] tracking-widest font-headline">
          {value}
        </span>
      )
    },
    {
      key: "isKrsOpen",
      label: "Status KRS",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => (
        <Badge
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline uppercase",
            val ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
            "bg-slate-100 text-slate-700 ring-1 ring-slate-500/20"
          )}
        >
          {val ? "Terbuka" : "Tertutup"}
        </Badge>
      )
    }
  ]



  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      {/* HEADER */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Settings className="size-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Konfigurasi Periode</h1>
          </div>
          <div className="flex items-center gap-2">
             <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kalender Akademik & Parameter Sistem</p>
          </div>
        </div>

      {/* CARD PERIODE AKTIF */}
      <Card className="border-none shadow-sm overflow-hidden bg-primary text-white relative rounded-3xl">
        <div className="absolute right-0 top-0 p-8 opacity-20 pointer-events-none text-white">
          <Calendar className="size-32" />
        </div>

        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/10 border border-white/20">
              <Calendar className="size-5" />
            </div>
            <div className="font-headline">
              <CardTitle className="text-lg font-black uppercase tracking-tight text-white leading-none">
                Periode Terpilih
              </CardTitle>
              <CardDescription className="text-white/60 font-medium text-[10px] uppercase tracking-widest mt-1">
                {data[0]?.activeYear || "IDLE"} / {data[0]?.activeSemester || "PENDING"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
             <div className="bg-white/10 border border-white/10 p-4 rounded-xl space-y-2 hover:bg-white/20 transition-all font-headline">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Status KRS</p>
                <p className="text-[11px] font-black truncate text-white uppercase">{data[0]?.isKrsOpen ? "TERBUKA" : "TERTUTUP"}</p>
                <Badge className={cn("text-[8px] h-5 border-none shadow-none font-black uppercase px-2 rounded-md", data[0]?.isKrsOpen ? "bg-emerald-400" : "bg-white/20")}>
                    {data[0]?.isKrsOpen ? "OPEN" : "CLOSED"}
                </Badge>
             </div>
             <div className="bg-white/10 border border-white/10 p-4 rounded-xl space-y-2 hover:bg-white/20 transition-all font-headline">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Input Nilai</p>
                <p className="text-[11px] font-black truncate text-white uppercase">{data[0]?.isGradeInputOpen ? "TERBUKA" : "TERTUTUP"}</p>
                <Badge className={cn("text-[8px] h-5 border-none shadow-none font-black uppercase px-2 rounded-md", data[0]?.isGradeInputOpen ? "bg-emerald-400" : "bg-white/20")}>
                    {data[0]?.isGradeInputOpen ? "OPEN" : "CLOSED"}
                </Badge>
             </div>
             <div className="bg-white/10 border border-white/10 p-4 rounded-xl space-y-2 hover:bg-white/20 transition-all font-headline">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Periode</p>
                <p className="text-[11px] font-black truncate text-white uppercase">{data[0]?.activeSemester || "REGULER"}</p>
                <Badge className="text-[8px] h-5 border-none shadow-none font-black uppercase px-2 rounded-md bg-white/20 text-white">GLOBAL</Badge>
             </div>
             <div className="bg-white/10 border border-white/10 p-4 rounded-xl space-y-2 hover:bg-white/20 transition-all font-headline">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Update Terakhir</p>
                <p className="text-[11px] font-black truncate text-white uppercase">{data[0]?.updatedAt ? new Date(data[0].updatedAt).toLocaleDateString() : "-"}</p>
                <Badge className="text-[8px] h-5 border-none shadow-none font-black uppercase px-2 rounded-md bg-white/20 text-white">SYSTEM</Badge>
             </div>
          </div>
        </CardContent>
      </Card>


      {/* TABLE */}
      <Card className="border-none shadow-sm mt-4 overflow-hidden rounded-3xl bg-white">
        <CardContent className="p-0 font-headline">
          <DataTable
            columns={columns}
            data={data}
            loading={false}
            searchPlaceholder="Cari Tahun..."
            onAdd={handleOpenAdd}
            addLabel="Konfigurasi Periode"
            actions={(row) => (
              <div className="flex items-center gap-2">
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
        </CardContent>
      </Card>

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
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">
                Konfigurasi parameter waktu dan status siklus akademik.
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
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Akses KRS</Label>
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
                        {formData.isKrsOpen ? "Terbuka" : "Tertutup"}
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
                        {formData.isGradeInputOpen ? "Terbuka" : "Tertutup"}
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
    </div>
  )
}
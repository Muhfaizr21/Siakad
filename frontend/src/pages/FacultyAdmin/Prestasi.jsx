"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card"
import { CheckCircle2, XCircle, Eye, Calendar, Award, TrendingUp, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./components/dialog"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"

export default function FacultyPrestasi() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/faculty/prestasi')
      const json = await res.json()
      if (json.status === "success") {
        setAchievements(json.data)
      }
    } catch (err) {
      toast.error("Gagal sinkronisasi data prestasi")
    } finally {
      setLoading(false)
    }
  }

  const handleValidation = async (id, status) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/faculty/prestasi/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: status,
          poin_skpi: status === 'Diverifikasi' ? 5 : 0,
          catatan: status === 'Diverifikasi' ? 'Prestasi terverifikasi oleh fakultas.' : 'Berkas tidak sesuai kriteria.'
        })
      })
      const json = await res.json()
      if (json.status === 'success') {
        toast.success(status === 'Diverifikasi' ? 'Prestasi disetujui' : 'Prestasi ditolak')
        setIsModalOpen(false)
        fetchData()
      }
    } catch (err) {
      toast.error("Gagal memperbarui status")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedAchievement?.ID) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/faculty/prestasi/${selectedAchievement.ID}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.status === 'success') {
        toast.success("Data dihapus")
        setIsDelOpen(false)
        fetchData()
      }
    } catch (err) {
      toast.error("Gagal menghapus")
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
       key: "Mahasiswa",
       label: "Mahasiswa",
       render: (val) => (
          <div className="flex flex-col text-left leading-tight">
             <span className="font-bold text-slate-900 font-headline tracking-tighter uppercase text-[13px]">{val?.Nama || '-'}</span>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{val?.NIM || '-'}</span>
          </div>
       )
    },
    {
      key: "NamaKegiatan",
      label: "Prestasi / Penghargaan",
      render: (val, row) => (
         <div className="flex flex-col text-left leading-tight">
            <span className="font-bold text-slate-800 text-[12px] font-headline uppercase tracking-tight">{val}</span>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1 w-fit bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">{row.Kategori}</span>
         </div>
      ),
    },
    {
       key: "CreatedAt",
       label: "Tahun",
       render: (val) => (
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 font-headline uppercase">
             <Calendar className="size-3 text-slate-400" />
             {new Date(val).getFullYear()}
          </div>
       )
    },
    {
      key: "Status",
      label: "Validasi",
      render: (val) => (
         <Badge 
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline uppercase",
            val === 'DISETUJUI' || val === 'Diverifikasi' ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
            val === 'MENUNGGU' || val === 'Menunggu' ? "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20" :
            val === 'DITOLAK' || val === 'Ditolak' ? "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20" :
            "bg-slate-100 text-slate-700 ring-1 ring-slate-500/20"
          )}
        >
          {val}
        </Badge>
      ),
    }
  ]

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Award className="size-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">Validasi Prestasi</h1>
          </div>
          <div className="flex items-center gap-2">
             <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Portal Verifikasi Capaian Mahasiswa</p>
          </div>
        </div>

      <Card className="border-none shadow-sm flex flex-col overflow-hidden bg-white/50 backdrop-blur-md rounded-3xl">
        <CardContent className="p-0 font-headline">
          <DataTable 
            columns={columns}
            data={achievements}
            loading={loading}
            searchPlaceholder="Cari Nama atau Prestasi..."
            onSync={fetchData}
            onExport={() => alert("Ekspor Rekap Prestasi...")}
            exportLabel="Download Rekap"
            filters={[
              {
                key: 'Status',
                placeholder: 'Filter Status',
                options: [
                  { label: 'Disetujui', value: 'Diverifikasi' },
                  { label: 'Menunggu', value: 'Menunggu' },
                  { label: 'Ditolak', value: 'Ditolak' },
                ]
              }
            ]}
            actions={(row) => (
              <div className="flex items-center gap-2">
                 <Button onClick={() => { setSelectedAchievement(row); setIsModalOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all">
                    <Eye className="size-4" />
                 </Button>
                 <Button onClick={() => handleValidation(row.ID, 'Diverifikasi')} variant="ghost" size="icon" className="h-9 w-9 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all">
                    <CheckCircle2 className="size-4" />
                 </Button>
                 <Button onClick={() => { setSelectedAchievement(row); setIsDelOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all text-slate-400">
                    <Trash2 className="size-4" />
                 </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Verification Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
           <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Award className="size-24 rotate-12" />
              </div>
              <div className="relative z-10 flex flex-col items-start translate-x-0.5">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs">
                       <Award className="size-4" />
                    </div>
                    <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none font-headline">
                       Achievement Verification
                    </Badge>
                 </div>
                 <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                    Verifikasi Capaian
                 </DialogTitle>
              </div>
           </DialogHeader>

           <div className="p-8 pt-6 space-y-6">
              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between font-headline">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none font-headline">{selectedAchievement?.Mahasiswa?.NIM}</p>
                       <h4 className="font-black text-slate-900 font-headline text-lg tracking-tighter leading-none uppercase">{selectedAchievement?.Mahasiswa?.Nama}</h4>
                    </div>
                    <Badge variant="outline" className="uppercase font-black text-[9px] border-slate-200 bg-white shadow-sm font-headline">
                       {selectedAchievement?.Status}
                    </Badge>
                 </div>
                 <div className="pt-5 border-t border-slate-200/60 space-y-2 font-headline">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Judul Prestasi / Penghargaan</p>
                    <p className="font-black text-slate-700 text-[13px] leading-tight uppercase bg-white/80 p-4 rounded-2xl border border-white shadow-sm italic">"{selectedAchievement?.NamaKegiatan || '-'}"</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                 <Button onClick={() => handleValidation(selectedAchievement?.ID, 'Diverifikasi')} disabled={isSubmitting} className="h-14 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 group font-headline border-none">
                    <CheckCircle2 className="size-4 group-hover:scale-125 transition-transform mr-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Validasi Berkas</span>
                 </Button>
                 <Button onClick={() => handleValidation(selectedAchievement?.ID, 'Ditolak')} disabled={isSubmitting} className="h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-500/20 group font-headline border-none">
                    <XCircle className="size-4 group-hover:rotate-12 transition-transform mr-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Tolak Data</span>
                 </Button>
              </div>
              
              <DialogFooter className="pt-4 flex flex-row items-center justify-end -mx-8 px-8 bg-slate-50/30 border-t border-slate-100 rounded-b-[2rem]">
                   <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-10 h-12 rounded-2xl font-headline transition-all">
                      Tutup Panel
                   </Button>
              </DialogFooter>
           </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Data Prestasi?"
        description="Record prestasi mahasiswa akan dihapus permanen. Hal ini akan berdampak pada akumulasi poin SKPI mahasiswa terkait."
        loading={isSubmitting}
      />
    </div>
  )
}

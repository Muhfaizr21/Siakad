"use client"

import React, { useState, useEffect } from "react"
import api from "../../lib/axios"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { Avatar, AvatarFallback, AvatarImage } from "./components/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/dialog"
import { Card, CardContent } from "./components/card"
import {
  Eye,
  Mail,
  BookOpen,
  Users,
  ShieldCheck,
  Award,
  Phone,
  Layout
} from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"

export default function DosenPage() {
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDosen, setSelectedDosen] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const fetchLecturers = async () => {
    setLoading(true)
    try {
      const res = await api.get("/faculty/lecturers")
      if (res.data.status === 'success') {
        setLecturers(res.data.data)
      }
    } catch (err) {
      toast.error("Gagal mengambil data dosen")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLecturers()
  }, [])

  const handleView = (dosen) => {
    setSelectedDosen(dosen)
    setIsDetailOpen(true)
  }

  const columns = [
    {
      key: "NIDN",
      label: "NIDN",
      className: "w-[120px]",
      render: (value) => <span className="font-medium text-slate-500 text-[11px] tracking-tight">{value || '-'}</span>
    },
    {
      key: "Nama",
      label: "Dosen",
      className: "w-auto min-w-[250px]",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-lg border border-slate-200 bg-white">
            <AvatarImage src={row.AvatarURL} />
            <AvatarFallback className="bg-white text-slate-800 text-[10px] font-bold uppercase transition-transform group-hover:scale-110">
              {value?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-[13px] tracking-tight">{value}</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{row.Jabatan || 'Dosen'}</span>
          </div>
        </div>
      )
    },
    {
      key: "IsDPA",
      label: "DPA",
      className: "w-[100px] text-center",
      cellClassName: "text-center",
      render: (value) => (
        value ? (
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-none">AKTIF</Badge>
        ) : (
          <span className="text-[9px] font-bold text-slate-300">TIDAK</span>
        )
      )
    }
  ]

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex flex-col gap-1 mb-8">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-slate-100 rounded-lg">
              <BookOpen className="size-5 text-slate-900" />
           </div>
           <h1 className="text-xl font-bold text-slate-900 tracking-tight">Direktori Dosen</h1>
        </div>
        <p className="text-[11px] text-slate-400 font-medium ml-1">Database tenaga pengajar dan staf ahli fakultas.</p>
      </div>

      <Card className="border shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={lecturers}
            loading={loading}
            searchPlaceholder="Cari Nama, NIDN atau Jabatan..."
            actions={(row) => (
              <Button
                  onClick={() => handleView(row)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-slate-900"
                >
                  <Eye className="size-4" />
              </Button>
            )}
          />
        </CardContent>
      </Card>

      {/* DETAIL DIALOG - CLEAN DATA SHEET STYLE */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          {selectedDosen && (
            <div className="flex flex-col max-h-[90vh]">
               <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-4">
                     <Avatar className="h-12 w-12 rounded-xl border border-slate-200 shadow-sm bg-white">
                        <AvatarImage src={selectedDosen.AvatarURL} />
                        <AvatarFallback className="text-slate-900 font-bold bg-white">{selectedDosen.Nama?.[0]}</AvatarFallback>
                     </Avatar>
                     <div className="flex flex-col">
                        <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                           {selectedDosen.Nama}
                        </DialogTitle>
                        <span className="text-[10px] font-black text-primary mt-1 uppercase tracking-[0.15em]">{selectedDosen.Jabatan || 'Dosen Pengajar'}</span>
                     </div>
                     <Badge className="ml-auto bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-lg">
                        NIDN: {selectedDosen.NIDN}
                     </Badge>
                  </div>
               </DialogHeader>

               <div className="overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  {/* SEKSI: PENUGASAN */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-slate-900">
                        <Layout className="size-4 opacity-40" />
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.1em]">Penugasan Akademik</h4>
                     </div>
                     <div className="grid grid-cols-2 gap-x-12 gap-y-4 border-l-2 border-slate-100 pl-4 py-1">
                        <DataField label="Program Studi" value={selectedDosen.ProgramStudi?.Nama} />
                        <DataField label="Fakultas" value={selectedDosen.Fakultas?.Nama || selectedDosen.ProgramStudi?.Fakultas?.Nama} />
                        <DataField label="Jabatan Fungsional" value={selectedDosen.Jabatan} />
                        <DataField label="Email Institusi" value={selectedDosen.Pengguna?.Email} isPrimary />
                     </div>
                  </div>

                  {/* SEKSI: VERIFIKASI */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-slate-900">
                        <ShieldCheck className="size-4 opacity-40" />
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.1em]">Status & Wewenang</h4>
                     </div>
                     <div className="grid grid-cols-2 gap-x-12 gap-y-4 border-l-2 border-slate-100 pl-4 py-1">
                        <div className="flex flex-col gap-1">
                           <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Status Wali (DPA)</span>
                           <Badge className={cn(
                              "w-fit text-[9px] font-bold px-2.5 py-0.5 border shadow-none",
                              selectedDosen.IsDPA ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                           )}>
                              {selectedDosen.IsDPA ? 'AKTIF' : 'NON-DPA'}
                           </Badge>
                        </div>
                        <DataField label="Nomor Kontak (HP/WA)" value={selectedDosen.NoHP || '-'} isPrimary />
                     </div>
                  </div>
               </div>

               <div className="p-6 border-t border-slate-100 flex justify-end shrink-0">
                  <Button
                     onClick={() => setIsDetailOpen(false)}
                     className="bg-slate-900 text-white text-[11px] font-bold px-8 h-10 rounded-lg hover:bg-slate-800 transition-all uppercase tracking-widest"
                  >
                     Tutup
                  </Button>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DataField({ label, value, isPrimary = false }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{label}</span>
      <span className={cn(
         "text-[12px] font-bold tracking-tight uppercase truncate",
         isPrimary ? "text-primary italic" : "text-slate-700"
      )}>
         {value || '—'}
      </span>
    </div>
  )
}

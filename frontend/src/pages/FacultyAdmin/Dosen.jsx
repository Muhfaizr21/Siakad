"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { Avatar, AvatarFallback, AvatarImage } from "./components/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/dialog"
import { Card, CardContent } from "./components/card"
import {
  Eye,
  Mail,
  BookOpen,
  Users,
  Award,
  ShieldCheck,
  UserCheck
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
      const res = await fetch('http://localhost:8000/api/faculty/lecturers')
      const json = await res.json()
      if (json.status === 'success') {
        setLecturers(json.data)
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
      className: "w-[150px]",
      render: (value) => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">{value || '-'}</span>
    },
    {
      key: "Nama",
      label: "Profil Dosen",
      className: "w-auto min-w-[280px]",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100 uppercase font-black text-slate-800">
            <AvatarImage src={row.AvatarURL} />
            <AvatarFallback className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase">
              {value?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{value}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
              <Mail className="size-2.5 opacity-60" />
              {row.Pengguna?.Email || '-'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "ProgramStudi",
      label: "Program Studi",
      className: "w-auto min-w-[200px]",
      render: (value) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700">{value?.Nama || '-'}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{value?.Fakultas?.Nama || '-'}</span>
        </div>
      )
    },
    {
      key: "Jabatan",
      label: "Jabatan",
      className: "w-[180px]",
      render: (value) => (
        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-bold px-2 py-1 rounded-lg">
          {value || 'Dosen Pengajar'}
        </Badge>
      )
    },
    {
      key: "IsDPA",
      label: "DPA",
      className: "w-[120px] text-center",
      cellClassName: "text-center",
      render: (value) => (
        value ? (
          <Badge className="bg-emerald-100 text-emerald-700 border-none shadow-none text-[9px] font-black px-2.5 py-1">TERDAFTAR</Badge>
        ) : (
          <Badge variant="ghost" className="text-slate-300 text-[9px] font-bold border-none">TIDAK</Badge>
        )
      )
    }
  ]

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pt-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Users className="size-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Daftar Dosen</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informasi Tenaga Pengajar & Pimpinan Fakultas</p>
          </div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <Card className="border-none shadow-sm mt-4 overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={lecturers}
            loading={loading}
            searchPlaceholder="Cari Nama, NIDN atau Jabatan..."
            actions={(row) => (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleView(row)}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Eye className="size-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* DETAIL DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          {selectedDosen && (
            <div className="flex flex-col max-h-[90vh]">
              {/* Premium Header Logic Style */}
              <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Award className="size-24 rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                      <ShieldCheck className="size-4" />
                    </div>
                    <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">
                      Verified Academic Profile
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                    Detail Profil Dosen
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider font-bold">
                    Arsip Profil tenaga pengajar fakultas.
                  </DialogDescription>
                </div>
              </DialogHeader>

              {/* Content Styling */}
              <div className="overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Profile Identity Card */}
                <div className="flex items-center gap-6 p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                  <Avatar className="h-20 w-20 rounded-2xl border-4 border-white shadow-lg shrink-0">
                    <AvatarImage src={selectedDosen.AvatarURL} />
                    <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800 text-2xl font-black uppercase">
                      {selectedDosen.Nama?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-tight">{selectedDosen.Nama}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{selectedDosen.Jabatan || 'Dosen Pengajar'}</span>
                       <span className="size-1 rounded-full bg-slate-300" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NIDN: {selectedDosen.NIDN}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Academic Assignment */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <BookOpen className="size-3 text-blue-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Penugasan Akademik</span>
                    </div>
                    <div className="space-y-3">
                      <InfoBlock label="Program Studi" value={selectedDosen.ProgramStudi?.Nama} />
                      <InfoBlock label="Fakultas" value={selectedDosen.Fakultas?.Nama || selectedDosen.ProgramStudi?.Fakultas?.Nama} />
                    </div>
                  </div>

                  {/* Verification & Status */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <UserCheck className="size-3 text-emerald-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Verifikasi</span>
                    </div>
                    <div className="space-y-3">
                      <InfoBlock label="Email Institusi" value={selectedDosen.Pengguna?.Email} />
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Wewenang DPA</span>
                        <Badge className={cn(
                          "w-fit text-[9px] font-black px-3 py-1 border-none",
                          selectedDosen.IsDPA ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                        )}>
                          {selectedDosen.IsDPA ? 'AKTIF' : 'TIDAK AKTIF'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Action */}
              <div className="p-6 px-8 flex items-center justify-end border-t border-slate-100 bg-slate-50/50 shrink-0">
                <Button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-sm hover:bg-slate-50 active:scale-95 transition-all font-headline"
                >
                  Tutup Arsip
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoBlock({ label, value }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-[11px] font-black text-slate-800 uppercase font-headline truncate">{value || '—'}</span>
    </div>
  )
}

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
} from "./components/dialog"
import { Card, CardContent } from "./components/card"
import {
  Eye,
  Mail,
  BookOpen,
  Loader2,
  Users,
  Award,
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
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl">
          {selectedDosen && (
            <div className="relative flex flex-col max-h-[90vh]">
              {/* Header Profile Section */}
              <div className="h-44 bg-slate-900 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent transition-transform duration-700" />
                <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
                  <Award className="size-48 rotate-12 text-white" />
                </div>

                <div className="absolute top-8 right-8 z-20">
                  <Badge
                    className={cn(
                      "capitalize text-[10px] font-black px-4 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-xl",
                      "bg-primary/20 text-white font-headline tracking-tighter italic"
                    )}
                  >
                    <span className="size-2 rounded-full bg-current mr-2 animate-pulse" />
                    {selectedDosen.Jabatan || 'Dosen Pengajar'}
                  </Badge>
                </div>

                <div className="absolute -bottom-12 left-10 z-20 p-2 bg-white rounded-[2.2rem] shadow-2xl shadow-slate-900/10">
                  <Avatar className="h-32 w-32 rounded-[1.8rem] border-4 border-slate-50">
                    <AvatarImage src={selectedDosen.AvatarURL} />
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 text-4xl font-black font-headline">
                      {selectedDosen.Nama?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-10 pt-16 space-y-10 custom-scrollbar">
                <div className="flex flex-col gap-1">
                  <h2 className="text-4xl font-black text-slate-900 font-headline tracking-tighter leading-none uppercase">{selectedDosen.Nama}</h2>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-[10px] font-black bg-primary/5 text-primary border-none px-3 py-1 rounded-md tracking-wider">
                      FACULTY LECTURER
                    </Badge>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] font-headline">NIDN: {selectedDosen.NIDN}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  {/* Academic Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="size-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <BookOpen className="size-4" />
                      </div>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 font-headline">Distribusi Akademik</h3>
                    </div>
                    <div className="space-y-4 px-1">
                      <DetailItem label="Program Studi" value={selectedDosen.ProgramStudi?.Nama} />
                      <DetailItem label="Fakultas" value={selectedDosen.Fakultas?.Nama || selectedDosen.ProgramStudi?.Fakultas?.Nama} />
                      <DetailItem label="Jabatan Akademik" value={selectedDosen.Jabatan} />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="size-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Mail className="size-4" />
                      </div>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 font-headline">Data Kontak Resmi</h3>
                    </div>
                    <div className="space-y-4 px-1">
                      <DetailItem label="Email Resmi" value={selectedDosen.Pengguna?.Email} />
                      <DetailItem
                        label="Status DPA"
                        value={selectedDosen.IsDPA ? 'Protokol DPA Aktif' : 'Non-DPA Staff'}
                        isHighlight={selectedDosen.IsDPA}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-8 px-10 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0 bg-slate-50/50">
                <Button
                  variant="ghost"
                  onClick={() => setIsDetailOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl font-headline"
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

function DetailItem({ label, value, isHighlight = false }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">{label}</span>
      <span className={cn(
        "text-[12px] font-bold font-headline uppercase truncate",
        isHighlight ? "text-primary tracking-tight" : "text-slate-700"
      )}>
        {value || '—'}
      </span>
    </div>
  )
}

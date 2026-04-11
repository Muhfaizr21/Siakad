"use client"

import React, { useState, useEffect } from "react"
import api from "../../lib/axios"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { Avatar, AvatarFallback } from "./components/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/dialog"
import { Card, CardContent } from "./components/card"
import { Eye, Mail, GraduationCap, MapPin, Phone, User, BookOpen, Heart, FileText, Users } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"

export default function MahasiswaPage() {
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [studentData, setStudentData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await api.get("/faculty/students")
      if (res.data.status === 'success') {
        setStudentData(res.data.data)
      }
    } catch (err) {
      toast.error("Gagal mengambil data mahasiswa")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleView = (mahasiswa) => {
    setSelectedMahasiswa(mahasiswa)
    setIsDetailOpen(true)
  }

  const columns = [
    {
      key: "NIM",
      label: "NIM",
      className: "w-[120px]",
      render: (value) => <span className="font-medium text-slate-500 text-[11px] tracking-tight">{value}</span>
    },
    {
      key: "Nama",
      label: "Mahasiswa",
      className: "w-auto min-w-[250px]",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-lg border border-slate-200">
            <AvatarFallback className="bg-slate-50 text-slate-600 text-[10px] font-bold uppercase">
              {value?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-[13px] tracking-tight">{value}</span>
            <span className="text-[10px] text-slate-400 font-medium">{row.ProgramStudi?.Nama || '-'}</span>
          </div>
        </div>
      )
    },
    {
      key: "SemesterSekarang",
      label: "Smt",
      className: "w-[80px] text-center",
      cellClassName: "text-center",
      render: (value) => <span className="font-bold text-slate-700 text-xs">{value || 1}</span>
    },
    {
      key: "StatusAkun",
      label: "Status",
      className: "w-[120px] text-center",
      cellClassName: "text-center",
      render: (val) => (
        <Badge
          className={cn(
            "capitalize font-bold text-[9px] px-2.5 py-0.5 rounded-full border shadow-none",
            (val === 'active' || val === 'Aktif') ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
              (val === 'leave' || val === 'Cuti') ? "bg-amber-50 text-amber-600 border-amber-100" :
                "bg-slate-50 text-slate-600 border-slate-200"
          )}
        >
          {val || 'Aktif'}
        </Badge>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-1 mb-8">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-slate-100 rounded-lg">
              <Users className="size-5 text-slate-900" />
           </div>
           <h1 className="text-xl font-bold text-slate-900 tracking-tight">Database Mahasiswa</h1>
        </div>
        <p className="text-[11px] text-slate-400 font-medium ml-1">Manajemen data dan arsip akademik mahasiswa fakultas.</p>
      </div>

      <Card className="border shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={studentData}
            loading={loading}
            searchPlaceholder="Cari NIM atau Nama..."
            actions={(row) => (
              <Button onClick={() => handleView(row)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                <Eye className="size-4" />
              </Button>
            )}
          />
        </CardContent>
      </Card>

      {/* DETAIL DIALOG - CLEAN DATA SHEET STYLE */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          {selectedMahasiswa && (
            <div className="flex flex-col max-h-[90vh]">
               <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-4">
                     <Avatar className="h-12 w-12 rounded-xl border border-slate-200 shadow-sm bg-white">
                        <AvatarFallback className="text-slate-900 font-bold bg-white">{selectedMahasiswa.Nama?.[0]}</AvatarFallback>
                     </Avatar>
                     <div className="flex flex-col">
                        <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                           {selectedMahasiswa.Nama}
                        </DialogTitle>
                        <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{selectedMahasiswa.NIM}</span>
                     </div>
                     <Badge className="ml-auto bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-lg">
                        {selectedMahasiswa.StatusAkun || 'Aktif'}
                     </Badge>
                  </div>
               </DialogHeader>

               <div className="overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  {/* SEKSI: AKADEMIK */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-slate-900">
                        <BookOpen className="size-4 opacity-40" />
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.1em]">Informasi Akademik</h4>
                     </div>
                     <div className="grid grid-cols-2 gap-x-12 gap-y-4 border-l-2 border-slate-100 pl-4 py-1">
                        <DataField label="Program Studi" value={selectedMahasiswa.ProgramStudi?.Nama} />
                        <DataField label="Semester / Angkatan" value={`${selectedMahasiswa.SemesterSekarang || 1} / ${selectedMahasiswa.TahunMasuk || '-'}`} />
                        <DataField label="Dosen Wali (DPA)" value={selectedMahasiswa.DosenPA?.Nama || 'Belum Ditentukan'} isPrimary />
                        <DataField label="Jalur Masuk" value={selectedMahasiswa.JalurMasuk || 'Mandiri'} />
                     </div>
                  </div>

                  {/* SEKSI: ORANG TUA */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-slate-900">
                        <Heart className="size-4 opacity-40" />
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.1em]">Data Orang Tua</h4>
                     </div>
                     <div className="grid grid-cols-2 gap-x-12 gap-y-4 border-l-2 border-slate-100 pl-4 py-1">
                        <DataField label="Nama Ayah" value={selectedMahasiswa.NamaAyah} />
                        <DataField label="Nama Ibu" value={selectedMahasiswa.NamaIbuKandung} />
                        <DataField label="Pekerjaan Ortu" value={selectedMahasiswa.PekerjaanAyah || selectedMahasiswa.PekerjaanIbu} />
                        <DataField label="Penghasilan" value={selectedMahasiswa.PenghasilanOrtu ? `Rp ${selectedMahasiswa.PenghasilanOrtu.toLocaleString('id-ID')}` : '-'} />
                     </div>
                  </div>

                  {/* SEKSI: BIODATA & KONTAK */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-slate-900">
                        <FileText className="size-4 opacity-40" />
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.1em]">Biodata & Kontak</h4>
                     </div>
                     <div className="grid grid-cols-2 gap-x-12 gap-y-4 border-l-2 border-slate-100 pl-4 py-1">
                        <DataField label="Tempat, Tgl Lahir" value={`${selectedMahasiswa.TempatLahir || '-'}, ${selectedMahasiswa.TanggalLahir ? new Date(selectedMahasiswa.TanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}`} />
                        <DataField label="Nomor WhatsApp" value={selectedMahasiswa.NoHP} isPrimary />
                        <DataField label="NIK" value={selectedMahasiswa.NIK} />
                        <DataField label="Email Institusi" value={selectedMahasiswa.EmailKampus || selectedMahasiswa.Pengguna?.Email} />
                     </div>
                     <div className="border-l-2 border-slate-100 pl-4 py-1 mt-2">
                        <DataField label="Alamat Lengkap" value={selectedMahasiswa.Alamat} isFull />
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

function DataField({ label, value, isPrimary = false, isFull = false }) {
  return (
    <div className={cn("flex flex-col gap-0.5", isFull ? "col-span-2" : "")}>
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{label}</span>
      <span className={cn(
         "text-[12px] font-bold tracking-tight",
         isPrimary ? "text-primary italic" : "text-slate-700"
      )}>
         {value || '—'}
      </span>
    </div>
  )
}

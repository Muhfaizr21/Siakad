"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { Avatar, AvatarFallback } from "./components/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/dialog"
import { Card, CardContent } from "./components/card"
import { Eye, Mail, BookOpen, GraduationCap, Users, UserCheck, ShieldCheck, MapPin, Phone } from "lucide-react"
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
      const res = await fetch('http://localhost:8000/api/faculty/students')
      const json = await res.json()
      if (json.status === 'success') {
        setStudentData(json.data)
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
      label: "NIM / ID",
      className: "w-[150px]",
      render: (value) => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">{value}</span>
    },
    {
      key: "Nama",
      label: "Profil Mahasiswa",
      className: "w-auto min-w-[300px]",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100 uppercase font-black text-slate-800">
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
      className: "w-[250px]",
      render: (value) => <span className="text-xs text-slate-600 font-black font-headline uppercase">{value?.Nama || "-"}</span>
    },
    {
      key: "SemesterSekarang",
      label: "Semester",
      className: "w-[100px] text-center",
      cellClassName: "text-center",
      render: (value) => <span className="font-bold text-slate-900 font-headline text-sm tracking-tighter">{value || 1}</span>
    },
    {
      key: "StatusAkun",
      label: "Status",
      className: "w-[150px] text-center",
      cellClassName: "text-center",
      render: (val) => (
        <Badge
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline",
            (val === 'active' || val === 'Aktif') ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
              (val === 'leave' || val === 'Cuti') ? "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20" :
                (val === 'graduated' || val === 'Lulus') ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-500/20" :
                  "bg-slate-100 text-slate-700 ring-1 ring-slate-500/20"
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
      <div className="flex flex-col gap-1.5 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <GraduationCap className="size-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Daftar Mahasiswa</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informasi Akademik & Database Mahasiswa Fakultas</p>
        </div>
      </div>


      <Card className="border-none shadow-sm flex flex-col overflow-hidden bg-white/50 backdrop-blur-md">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={studentData}
            loading={loading}
            searchPlaceholder="Cari NIM atau Nama..."
            onExport={() => alert("Ekspor Seluruh Mahasiswa...")}
            exportLabel="Download Master"
            filters={[
              {
                key: 'StatusAkun',
                placeholder: 'Filter Status',
                options: [
                  { label: 'Aktif', value: 'Aktif' },
                  { label: 'Cuti', value: 'Cuti' },
                  { label: 'Lulus', value: 'Lulus' },
                ]
              }
            ]}
            actions={(row) => (
              <div className="flex items-center gap-2">
                <Button onClick={() => handleView(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-xl">
                  <Eye className="size-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* DETAIL DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl">
          {selectedMahasiswa && (
            <div className="flex flex-col max-h-[90vh]">
               {/* Premium Header Logic Style */}
               <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <GraduationCap className="size-24 rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                      <ShieldCheck className="size-4" />
                    </div>
                    <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">
                      Integrated Student Master data
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                    Detail Mahasiswa
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider font-bold">
                    Arsip lengkap database akademik & personal.
                  </DialogDescription>
                </div>
              </DialogHeader>

              {/* Content Styling */}
              <div className="overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Identity Header */}
                <div className="flex items-center gap-6 p-6 rounded-[1.8rem] bg-slate-50 border border-slate-100 shadow-inner">
                  <Avatar className="h-24 w-24 rounded-2xl border-4 border-white shadow-xl flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800 text-3xl font-black uppercase">
                      {selectedMahasiswa.Nama?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <h3 className="text-3xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">{selectedMahasiswa.Nama}</h3>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="font-bold text-slate-400 uppercase tracking-widest text-[11px] font-headline">{selectedMahasiswa.NIM}</span>
                       <Badge className={cn(
                          "uppercase text-[9px] font-black px-3 py-0.5 border-none",
                          selectedMahasiswa.StatusAkun === 'Aktif' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                       )}>
                          {selectedMahasiswa.StatusAkun || 'Aktif'}
                       </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                   {/* Col 1: Academic */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-2 px-1 border-b border-slate-100 pb-2">
                        <BookOpen className="size-3 text-primary" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Akademik</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <InfoItem label="Program Studi" value={selectedMahasiswa.ProgramStudi?.Nama} />
                        <div className="grid grid-cols-2 gap-4">
                           <InfoItem label="Semester" value={selectedMahasiswa.SemesterSekarang} />
                           <InfoItem label="Tahun Masuk" value={selectedMahasiswa.TahunMasuk || selectedMahasiswa.NIM?.substring(3, 7)} />
                        </div>
                        <InfoItem label="Dosen Wali (DPA)" value={selectedMahasiswa.DosenPA?.Nama || 'Belum Ditentukan'} highlight />
                        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 border-dashed mt-2">
                           <div className="flex-1 flex flex-col items-center border-r border-primary/20 pr-3">
                              <span className="text-[8px] font-black text-primary/50 uppercase tracking-tighter">IPK</span>
                              <span className="text-xl font-black text-primary font-headline tracking-tighter leading-none">{selectedMahasiswa.IPK?.toFixed(2) || '0.00'}</span>
                           </div>
                           <div className="flex-1 flex flex-col items-center">
                              <span className="text-[8px] font-black text-primary/50 uppercase tracking-tighter">TOTAL SKS</span>
                              <span className="text-xl font-black text-primary font-headline tracking-tighter leading-none">{selectedMahasiswa.TotalSKS || '0'}</span>
                           </div>
                        </div>
                      </div>
                   </div>

                   {/* Col 2: Info & Contact */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-2 px-1 border-b border-slate-100 pb-2">
                        <UserCheck className="size-3 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kontak & Domisili</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                         <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-primary transition-all group">
                            <Mail className="size-4 text-slate-300 group-hover:text-primary transition-colors" />
                            <div className="flex flex-col">
                               <span className="text-[8px] font-bold text-slate-400 uppercase">Email Kampus</span>
                               <span className="text-[11px] font-bold text-slate-700">{selectedMahasiswa.EmailKampus || selectedMahasiswa.Pengguna?.Email}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-primary transition-all group">
                            <Phone className="size-4 text-slate-300 group-hover:text-primary transition-colors" />
                            <div className="flex flex-col">
                               <span className="text-[8px] font-bold text-slate-400 uppercase">Handphone</span>
                               <span className="text-[11px] font-bold text-slate-700">{selectedMahasiswa.NoHP || '—'}</span>
                            </div>
                         </div>
                         <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-primary transition-all group">
                            <MapPin className="size-4 text-slate-300 mt-1 group-hover:text-primary transition-colors" />
                            <div className="flex flex-col">
                               <span className="text-[8px] font-bold text-slate-400 uppercase">Alamat Lengkap</span>
                               <span className="text-[11px] font-bold text-slate-700 leading-tight">{selectedMahasiswa.Alamat || '—'}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                 {/* Personal Grid Section */}
                 <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-2 px-1 border-b border-slate-100 pb-2">
                      <Users className="size-3 text-indigo-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Biodata Pribadi</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                       <InfoItem label="Tempat Lahir" value={selectedMahasiswa.TempatLahir} />
                       <InfoItem label="Tanggal Lahir" value={selectedMahasiswa.TanggalLahir ? new Date(selectedMahasiswa.TanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
                       <InfoItem label="Jenis Kelamin" value={selectedMahasiswa.JenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
                       <InfoItem label="NIK" value={selectedMahasiswa.NIK} />
                    </div>
                 </div>
              </div>

              {/* Close Action */}
              <div className="p-8 px-10 flex items-center justify-end border-t border-slate-100 bg-slate-50/50 shrink-0">
                <Button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest h-12 px-12 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-sm hover:bg-slate-50 active:scale-95 transition-all font-headline"
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

function InfoItem({ label, value, highlight = false }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className={cn(
        "text-[11px] font-black uppercase font-headline truncate",
        highlight ? "text-primary tracking-tight" : "text-slate-800"
      )}>
        {value || '—'}
      </span>
    </div>
  )
}

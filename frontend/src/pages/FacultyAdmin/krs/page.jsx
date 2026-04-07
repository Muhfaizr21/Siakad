"use client"

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Avatar, AvatarFallback } from "../components/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/dialog"
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Check,
  X,
  AlertCircle,
  BookOpen,
} from "lucide-react"

const krsData = [
  {
    id: 1,
    nim: "20230001",
    nama: "Ahmad Fauzi Rahman",
    prodi: "Teknik Informatika",
    semester: 3,
    ipkTerakhir: 3.75,
    batasSks: 24,
    sksDiambil: 21,
    status: "Menunggu",
    tanggalPengajuan: "15 Jan 2025, 08:30",
    mataKuliah: [
      { kode: "TI301", nama: "Basis Data", sks: 4 },
      { kode: "TI302", nama: "Pemrograman Berorientasi Objek", sks: 3 },
      { kode: "TI303", nama: "Statistika", sks: 3 },
      { kode: "TI304", nama: "Matematika Diskrit", sks: 3 },
      { kode: "TI305", nama: "Sistem Operasi", sks: 4 },
      { kode: "TI306", nama: "Bahasa Inggris III", sks: 2 },
      { kode: "TI307", nama: "Pancasila", sks: 2 },
    ],
  },
  {
    id: 2,
    nim: "20230015",
    nama: "Siti Rahayu Putri",
    prodi: "Sistem Informasi",
    semester: 3,
    ipkTerakhir: 3.82,
    batasSks: 24,
    sksDiambil: 24,
    status: "Menunggu",
    tanggalPengajuan: "15 Jan 2025, 09:15",
    mataKuliah: [
      { kode: "SI301", nama: "Sistem Informasi Manajemen", sks: 3 },
      { kode: "SI302", nama: "Basis Data", sks: 4 },
      { kode: "SI303", nama: "Analisis Sistem", sks: 3 },
      { kode: "SI304", nama: "Pemrograman Web", sks: 3 },
      { kode: "SI305", nama: "Statistika Bisnis", sks: 3 },
      { kode: "SI306", nama: "Manajemen Proyek TI", sks: 3 },
      { kode: "SI307", nama: "Etika Profesi", sks: 2 },
      { kode: "SI308", nama: "Kewirausahaan", sks: 3 },
    ],
  },
  {
    id: 3,
    nim: "20220042",
    nama: "Budi Santoso",
    prodi: "Teknik Informatika",
    semester: 5,
    ipkTerakhir: 3.45,
    batasSks: 22,
    sksDiambil: 18,
    status: "Disetujui",
    tanggalPengajuan: "14 Jan 2025, 14:00",
    mataKuliah: [
      { kode: "TI501", nama: "Kecerdasan Buatan", sks: 3 },
      { kode: "TI502", nama: "Jaringan Komputer", sks: 3 },
      { kode: "TI503", nama: "Rekayasa Perangkat Lunak", sks: 4 },
      { kode: "TI504", nama: "Keamanan Sistem", sks: 3 },
      { kode: "TI505", nama: "Pengolahan Citra Digital", sks: 3 },
      { kode: "TI506", nama: "Bahasa Indonesia", sks: 2 },
    ],
  },
  {
    id: 4,
    nim: "20230089",
    nama: "Dewi Lestari",
    prodi: "Sistem Informasi",
    semester: 3,
    ipkTerakhir: 2.85,
    batasSks: 20,
    sksDiambil: 22,
    status: "Ditolak",
    tanggalPengajuan: "14 Jan 2025, 10:30",
    keterangan: "Melebihi batas SKS",
    mataKuliah: [
      { kode: "SI301", nama: "Sistem Informasi Manajemen", sks: 3 },
      { kode: "SI302", nama: "Basis Data", sks: 4 },
      { kode: "SI303", nama: "Analisis Sistem", sks: 3 },
      { kode: "SI304", nama: "Pemrograman Web", sks: 3 },
      { kode: "SI305", nama: "Statistika Bisnis", sks: 3 },
      { kode: "SI306", nama: "Manajemen Proyek TI", sks: 3 },
      { kode: "SI307", nama: "Etika Profesi", sks: 3 },
    ],
  },
];

const statusColors = {
  Menunggu: "bg-amber-50 text-amber-600 border border-amber-100",
  Disetujui: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  Ditolak: "bg-rose-50 text-rose-600 border border-rose-100",
}

const statusIcons = {
  Menunggu: Clock,
  Disetujui: CheckCircle2,
  Ditolak: XCircle,
}

export default function KRSPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedKRS, setSelectedKRS] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")

  const handleView = (krs) => {
    setSelectedKRS(krs)
    setIsDetailOpen(true)
  }

  const filteredData = krsData.filter(
    (item) => filterStatus === "all" || item.status.toLowerCase() === filterStatus
  )

  return (
    <div className="text-on-surface bg-surface min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-8">
           {/* Page Header */}
           <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div>
                 <h1 className="text-2xl font-medium tracking-tight text-on-surface font-headline uppercase leading-tight">KRS & Perwalian</h1>
                 <p className="text-on-surface-variant text-sm mt-1 font-medium">Validasi Kartu Rencana Studi dan bimbingan akademik mahasiswa.</p>
              </div>
           </div>

           {/* Stats Cards */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-2xl font-medium text-on-surface">256</p>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Total Pengajuan</p>
                 </div>
              </Card>
              <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Clock className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-2xl font-medium text-on-surface">45</p>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Menunggu</p>
                 </div>
              </Card>
              <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-2xl font-medium text-on-surface">198</p>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Disetujui</p>
                 </div>
              </Card>
              <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <XCircle className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-2xl font-medium text-on-surface">13</p>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Ditolak</p>
                 </div>
              </Card>
           </div>

           {/* Main Table Section */}
           <div className="bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="px-8 py-6 border-b border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <h3 className="font-medium text-lg font-headline text-on-surface uppercase tracking-tight">Antrian Perwalian</h3>
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                       <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50" />
                       <Input placeholder="Cari NIM atau Nama..." className="pl-10 h-10 rounded-xl border-outline-variant/20" />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                       <SelectTrigger className="w-40 h-10 rounded-xl border-outline-variant/20 font-medium text-[11px] uppercase tracking-widest">
                          <SelectValue placeholder="Status" />
                       </SelectTrigger>
                       <SelectContent className="rounded-2xl">
                          <SelectItem value="all">SEMUA STATUS</SelectItem>
                          <SelectItem value="menunggu">MENUNGGU</SelectItem>
                          <SelectItem value="disetujui">DISETUJUI</SelectItem>
                          <SelectItem value="ditolak">DITOLAK</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              <Table>
                 <TableHeader>
                    <TableRow className="bg-[#fcfcfd] hover:bg-[#fcfcfd] border-b border-outline-variant/5">
                       <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Mahasiswa & NIM</TableHead>
                       <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Smtr</TableHead>
                       <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">IPK</TableHead>
                       <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Beban SKS</TableHead>
                       <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Status</TableHead>
                       <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-right w-[150px]">Aksi</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {filteredData.map((item) => (
                       <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5">
                          <TableCell className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border border-outline-variant/10">
                                   <AvatarFallback className="bg-primary/5 text-primary font-medium text-xs">
                                      {item.nama.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                   </AvatarFallback>
                                </Avatar>
                                <div>
                                   <span className="block font-medium text-[14px] text-on-surface leading-tight mb-0.5">{item.nama}</span>
                                   <span className="text-[11px] font-medium text-on-surface-variant opacity-70 font-mono tracking-widest uppercase">{item.nim} • {item.prodi}</span>
                                </div>
                             </div>
                          </TableCell>
                          <TableCell className="px-8 py-6 text-center text-[13px] font-medium text-on-surface">{item.semester}</TableCell>
                          <TableCell className="px-8 py-6 text-center">
                             <span className={`text-[13px] font-medium ${item.ipkTerakhir >= 3.5 ? "text-emerald-600" : "text-on-surface"}`}>{item.ipkTerakhir.toFixed(2)}</span>
                          </TableCell>
                          <TableCell className="px-8 py-6 text-center">
                             <div className="flex flex-col gap-0.5">
                                <span className={`text-[13px] font-medium ${item.sksDiambil > item.batasSks ? "text-rose-600" : "text-primary"}`}>{item.sksDiambil} / {item.batasSks}</span>
                                <span className="text-[9px] font-medium text-on-surface-variant/50 uppercase tracking-widest">SKS Diambil</span>
                             </div>
                          </TableCell>
                          <TableCell className="px-8 py-6 text-center">
                             <span className={`px-3.5 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap ${statusColors[item.status]}`}>
                                {item.status}
                             </span>
                          </TableCell>
                          <TableCell className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button
                                   onClick={() => handleView(item)}
                                   className="h-9 w-9 rounded-xl bg-slate-50 text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center border border-slate-100"
                                >
                                   <Eye className="h-4 w-4" />
                                </button>
                                {item.status === "Menunggu" && (
                                   <>
                                      <button className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center border border-emerald-100">
                                         <Check className="h-4 w-4" />
                                      </button>
                                      <button className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center border border-rose-100">
                                         <X className="h-4 w-4" />
                                      </button>
                                   </>
                                )}
                             </div>
                          </TableCell>
                       </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </div>
        </div>

        {/* Detail Dialog - Premium Styling */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-primary p-8 text-white relative h-40">
               <div className="relative z-10 flex justify-between items-end h-full">
                  <div className="flex items-end gap-6">
                     <Avatar className="h-28 w-28 border-4 border-white shadow-xl -mb-14">
                        <AvatarFallback className="bg-[#00236f] text-white text-3xl font-medium">
                           {selectedKRS?.nama.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                     </Avatar>
                     <div className="pb-2">
                        <DialogTitle className="text-2xl font-medium uppercase tracking-tight leading-none mb-2">{selectedKRS?.nama}</DialogTitle>
                        <p className="text-white/70 font-medium uppercase tracking-[0.2em] text-[10px]">{selectedKRS?.nim} • SEMESTER {selectedKRS?.semester}</p>
                     </div>
                  </div>
                  <div className="pb-2 text-right">
                     <Badge variant="outline" className={`bg-white/10 text-white border-white/20 px-4 py-1.5 rounded-full font-medium text-[10px] uppercase tracking-widest`}>
                        {selectedKRS?.status}
                     </Badge>
                  </div>
               </div>
               {/* Aesthetic Background Shape */}
               <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 -translate-x-16 pointer-events-none"></div>
            </div>

            <div className="p-10 pt-20 space-y-8">
               {/* Info Tiles */}
               <div className="grid grid-cols-4 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <p className="text-[10px] font-medium text-on-surface-variant/50 uppercase tracking-widest mb-1">IPK Terakhir</p>
                     <p className="font-medium text-emerald-600 text-lg leading-none">{selectedKRS?.ipkTerakhir.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <p className="text-[10px] font-medium text-on-surface-variant/50 uppercase tracking-widest mb-1">Batas SKS</p>
                     <p className="font-medium text-on-surface text-lg leading-none">{selectedKRS?.batasSks} SKS</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <p className="text-[10px] font-medium text-on-surface-variant/50 uppercase tracking-widest mb-1">SKS Diambil</p>
                     <p className={`font-medium text-lg leading-none ${selectedKRS?.sksDiambil > selectedKRS?.batasSks ? "text-rose-600" : "text-primary"}`}>{selectedKRS?.sksDiambil} SKS</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <p className="text-[10px] font-medium text-on-surface-variant/50 uppercase tracking-widest mb-1">Pengajuan</p>
                     <p className="font-medium text-on-surface text-xs leading-none mt-1 uppercase">{selectedKRS?.tanggalPengajuan.split(",")[0]}</p>
                  </div>
               </div>

               {/* Course List */}
               <div className="rounded-[1.5rem] bg-[#fcfcfd] border border-outline-variant/10 overflow-hidden max-h-[300px] overflow-y-auto shadow-inner">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-[#fcfcfd]">
                      <TableRow className="border-b border-outline-variant/5">
                        <TableHead className="px-6 py-4 font-medium text-[10px] uppercase tracking-widest text-on-surface-variant/60">Kode MK</TableHead>
                        <TableHead className="px-6 py-4 font-medium text-[10px] uppercase tracking-widest text-on-surface-variant/60">Nama Mata Kuliah</TableHead>
                        <TableHead className="px-6 py-4 font-medium text-[10px] uppercase tracking-widest text-on-surface-variant/60 text-center w-24">SKS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedKRS?.mataKuliah.map((mk, index) => (
                        <TableRow key={index} className="hover:bg-white transition-colors border-b border-outline-variant/5">
                          <TableCell className="px-6 py-4 font-mono text-[11px] font-medium text-on-surface-variant">{mk.kode}</TableCell>
                          <TableCell className="px-6 py-4 font-medium text-[13px] text-on-surface">{mk.nama}</TableCell>
                          <TableCell className="px-6 py-4 text-center font-medium text-[13px] text-primary">{mk.sks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
               </div>

               {selectedKRS?.keterangan && (
                 <div className="flex items-start gap-4 rounded-2xl bg-rose-50 border border-rose-100 p-5">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                       <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-rose-600 uppercase tracking-widest mb-0.5">Alasan Penolakan</p>
                      <p className="text-sm font-medium text-on-surface-variant">{selectedKRS.keterangan}</p>
                    </div>
                 </div>
               )}

               <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/10">
                  <Button variant="outline" className="rounded-2xl px-8 h-12 font-medium text-[11px] uppercase tracking-widest border-outline-variant/20 hover:bg-slate-50" onClick={() => setIsDetailOpen(false)}>
                    Tutup
                  </Button>
                  {selectedKRS?.status === "Menunggu" && (
                    <>
                      <Button variant="outline" className="rounded-2xl px-8 h-12 border-rose-100 text-rose-600 font-medium text-[11px] uppercase tracking-widest hover:bg-rose-50">
                        Tolak KRS
                      </Button>
                      <Button className="rounded-2xl px-10 h-12 bg-primary text-white shadow-xl shadow-primary/30 font-medium text-[11px] uppercase tracking-widest">
                        Setujui KRS
                      </Button>
                    </>
                  )}
               </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

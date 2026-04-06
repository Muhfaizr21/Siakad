"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card"
import { Button } from "../../components/button"
import { Input } from "../../components/input"
import { Badge } from "../../components/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/dialog"
import { Label } from "../../components/label"
import { Search, Plus, BookOpen, FileText, Download, Pencil, Trash2, GraduationCap } from "lucide-react"

const kurikulumData = {
  "Teknik Informatika": {
    tahun: "2020",
    totalSKS: 144,
    semester: [
      { semester: 1, matakuliah: [
        { kode: "TI101", nama: "Algoritma & Pemrograman", sks: 4, jenis: "Wajib" },
        { kode: "TI102", nama: "Matematika Diskrit", sks: 3, jenis: "Wajib" },
        { kode: "TI103", nama: "Pengantar Teknologi Informasi", sks: 2, jenis: "Wajib" },
        { kode: "MKU101", nama: "Bahasa Indonesia", sks: 2, jenis: "Wajib" },
        { kode: "MKU102", nama: "Pendidikan Pancasila", sks: 2, jenis: "Wajib" },
        { kode: "TI104", nama: "Kalkulus I", sks: 3, jenis: "Wajib" },
      ]},
      { semester: 2, matakuliah: [
        { kode: "TI201", nama: "Struktur Data", sks: 4, jenis: "Wajib" },
        { kode: "TI202", nama: "Basis Data", sks: 4, jenis: "Wajib" },
        { kode: "TI203", nama: "Pemrograman Web", sks: 3, jenis: "Wajib" },
        { kode: "TI204", nama: "Statistika", sks: 3, jenis: "Wajib" },
        { kode: "MKU201", nama: "Bahasa Inggris", sks: 2, jenis: "Wajib" },
        { kode: "TI205", nama: "Kalkulus II", sks: 3, jenis: "Wajib" },
      ]},
      { semester: 3, matakuliah: [
        { kode: "TI301", nama: "Pemrograman Berorientasi Objek", sks: 4, jenis: "Wajib" },
        { kode: "TI302", nama: "Sistem Operasi", sks: 3, jenis: "Wajib" },
        { kode: "TI303", nama: "Jaringan Komputer", sks: 3, jenis: "Wajib" },
        { kode: "TI304", nama: "Analisis & Perancangan Sistem", sks: 3, jenis: "Wajib" },
        { kode: "TI305", nama: "Aljabar Linear", sks: 3, jenis: "Wajib" },
      ]},
      { semester: 4, matakuliah: [
        { kode: "TI401", nama: "Rekayasa Perangkat Lunak", sks: 4, jenis: "Wajib" },
        { kode: "TI402", nama: "Kecerdasan Buatan", sks: 3, jenis: "Wajib" },
        { kode: "TI403", nama: "Interaksi Manusia & Komputer", sks: 3, jenis: "Wajib" },
        { kode: "TI404", nama: "Keamanan Sistem Informasi", sks: 3, jenis: "Wajib" },
        { kode: "TI405", nama: "Pemrograman Mobile", sks: 3, jenis: "Pilihan" },
      ]},
    ],
  },
}

import Sidebar from "../../components/Sidebar"
import TopNavBar from "../../components/TopNavBar"

export default function KurikulumPage() {
  const [selectedProdi, setSelectedProdi] = useState("Teknik Informatika")
  const [searchTerm, setSearchTerm] = useState("")
  const currentKurikulum = kurikulumData["Teknik Informatika"]

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar />
      <TopNavBar />
      <main className="ml-64 min-h-screen">
        <div className="pt-24 pb-12 px-8">
          <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kurikulum</h1>
          <p className="text-muted-foreground">Kelola kurikulum dan struktur mata kuliah per program studi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-2 size-4" />Export PDF</Button>
          <Dialog>
            <DialogTrigger asChild><Button><Plus className="mr-2 size-4" />Tambah Kurikulum</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah Kurikulum Baru</DialogTitle><DialogDescription>Buat kurikulum baru untuk program studi</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2"><Label>Program Studi</Label><Select><SelectTrigger><SelectValue placeholder="Pilih program studi" /></SelectTrigger><SelectContent><SelectItem value="ti">Teknik Informatika</SelectItem><SelectItem value="si">Sistem Informasi</SelectItem><SelectItem value="te">Teknik Elektro</SelectItem></SelectContent></Select></div>
                <div className="flex flex-col gap-2"><Label>Tahun Kurikulum</Label><Input placeholder="2024" /></div>
                <div className="flex flex-col gap-2"><Label>Total SKS Wajib</Label><Input type="number" placeholder="144" /></div>
              </div>
              <DialogFooter><Button variant="outline">Batal</Button><Button>Simpan</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 gap-4">
            <Select value={selectedProdi} onValueChange={setSelectedProdi}>
              <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Pilih Program Studi" /></SelectTrigger>
              <SelectContent><SelectItem value="Teknik Informatika">Teknik Informatika</SelectItem><SelectItem value="Sistem Informasi">Sistem Informasi</SelectItem><SelectItem value="Teknik Elektro">Teknik Elektro</SelectItem><SelectItem value="Teknik Mesin">Teknik Mesin</SelectItem></SelectContent>
            </Select>
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cari mata kuliah..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 p-4"><div className="flex size-12 items-center justify-center rounded-lg bg-primary/10"><GraduationCap className="size-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">Program Studi</p><p className="font-semibold">{selectedProdi}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4"><div className="flex size-12 items-center justify-center rounded-lg bg-accent/10"><FileText className="size-6 text-accent" /></div><div><p className="text-sm text-muted-foreground">Tahun Kurikulum</p><p className="font-semibold">{currentKurikulum.tahun}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4"><div className="flex size-12 items-center justify-center rounded-lg bg-success/10"><BookOpen className="size-6 text-success" /></div><div><p className="text-sm text-muted-foreground">Total SKS</p><p className="font-semibold">{currentKurikulum.totalSKS} SKS</p></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Struktur Kurikulum</CardTitle><CardDescription>Daftar mata kuliah per semester untuk {selectedProdi}</CardDescription></CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {currentKurikulum.semester.map((sem) => (
              <AccordionItem key={sem.semester} value={`semester-${sem.semester}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="font-mono">Semester {sem.semester}</Badge>
                    <span className="text-sm text-muted-foreground">{sem.matakuliah.length} mata kuliah - {sem.matakuliah.reduce((acc, mk) => acc + mk.sks, 0)} SKS</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader><TableRow><TableHead className="w-24">Kode</TableHead><TableHead>Mata Kuliah</TableHead><TableHead className="w-20 text-center">SKS</TableHead><TableHead className="w-24">Jenis</TableHead><TableHead className="w-20 text-right">Aksi</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {sem.matakuliah.map((mk) => (
                          <TableRow key={mk.kode}>
                            <TableCell className="font-mono text-sm">{mk.kode}</TableCell>
                            <TableCell className="font-medium">{mk.nama}</TableCell>
                            <TableCell className="text-center">{mk.sks}</TableCell>
                            <TableCell><Badge variant={mk.jenis === "Wajib" ? "default" : "secondary"} className={mk.jenis === "Wajib" ? "bg-primary/10 text-primary" : ""}>{mk.jenis}</Badge></TableCell>
                            <TableCell className="text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="size-7"><Pencil className="size-3" /></Button><Button variant="ghost" size="icon" className="size-7 text-destructive"><Trash2 className="size-3" /></Button></div></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-3 flex justify-end"><Button variant="outline" size="sm"><Plus className="mr-2 size-4" />Tambah Mata Kuliah</Button></div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
              </div>
        </div>
      </main>
    </div>
  )
}

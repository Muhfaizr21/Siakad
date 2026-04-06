"use client"

import Sidebar from "../../components/Sidebar"
import TopNavBar from "../../components/TopNavBar"
import { DataTable } from "../../components/data-table"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import { Card, CardContent } from "../../components/card"
import { Eye, Pencil, Trash2, BookOpen, Clock, Users } from "lucide-react"

const dataMataKuliah = [
  {
    id: 1,
    kode: "TI101",
    nama: "Algoritma & Pemrograman",
    sks: 4,
    semester: 1,
    prodi: "Teknik Informatika",
    jenis: "Wajib",
    prasyarat: "-",
    dosenPengampu: "Dr. Ir. Andi Wijaya, M.T.",
    peserta: 120,
  },
  {
    id: 2,
    kode: "TI201",
    nama: "Struktur Data",
    sks: 3,
    semester: 2,
    prodi: "Teknik Informatika",
    jenis: "Wajib",
    prasyarat: "TI101",
    dosenPengampu: "Dr. Citra Dewi, M.Kom.",
    peserta: 115,
  },
  {
    id: 3,
    kode: "TI301",
    nama: "Basis Data",
    sks: 4,
    semester: 3,
    prodi: "Teknik Informatika",
    jenis: "Wajib",
    prasyarat: "TI201",
    dosenPengampu: "Prof. Dr. Budi Hartono, M.Sc.",
    peserta: 98,
  },
  {
    id: 4,
    kode: "SI201",
    nama: "Sistem Informasi Manajemen",
    sks: 3,
    semester: 3,
    prodi: "Sistem Informasi",
    jenis: "Wajib",
    prasyarat: "-",
    dosenPengampu: "Dr. Eko Prasetyo, M.T.",
    peserta: 85,
  },
  {
    id: 5,
    kode: "TI401",
    nama: "Pemrograman Web",
    sks: 3,
    semester: 4,
    prodi: "Teknik Informatika",
    jenis: "Wajib",
    prasyarat: "TI301",
    dosenPengampu: "Farah Amalia, M.Kom.",
    peserta: 92,
  },
  {
    id: 6,
    kode: "TI501",
    nama: "Kecerdasan Buatan",
    sks: 3,
    semester: 5,
    prodi: "Teknik Informatika",
    jenis: "Pilihan",
    prasyarat: "TI201",
    dosenPengampu: "Dr. Ir. Andi Wijaya, M.T.",
    peserta: 67,
  },
  {
    id: 7,
    kode: "TI502",
    nama: "Jaringan Komputer",
    sks: 3,
    semester: 5,
    prodi: "Teknik Informatika",
    jenis: "Wajib",
    prasyarat: "-",
    dosenPengampu: "Dr. Citra Dewi, M.Kom.",
    peserta: 89,
  },
  {
    id: 8,
    kode: "SI401",
    nama: "Enterprise Resource Planning",
    sks: 3,
    semester: 6,
    prodi: "Sistem Informasi",
    jenis: "Pilihan",
    prasyarat: "SI201",
    dosenPengampu: "Dr. Eko Prasetyo, M.T.",
    peserta: 45,
  },
  {
    id: 9,
    kode: "TI601",
    nama: "Machine Learning",
    sks: 3,
    semester: 6,
    prodi: "Teknik Informatika",
    jenis: "Pilihan",
    prasyarat: "TI501",
    dosenPengampu: "Dr. Ir. Andi Wijaya, M.T.",
    peserta: 52,
  },
  {
    id: 10,
    kode: "TI701",
    nama: "Skripsi",
    sks: 6,
    semester: 8,
    prodi: "Teknik Informatika",
    jenis: "Wajib",
    prasyarat: "Minimal 120 SKS",
    dosenPengampu: "-",
    peserta: 78,
  },
]

const jenisColors = {
  Wajib: "bg-primary/20 text-primary",
  Pilihan: "bg-secondary text-foreground",
}

const columns = [
  {
    key: "kode",
    label: "Kode",
    render: (value) => <span className="font-mono text-sm font-medium">{value}</span>,
  },
  {
    key: "nama",
    label: "Nama Mata Kuliah",
    render: (value, row) => (
      <div>
        <p className="font-medium">{value}</p>
        <p className="text-xs text-muted-foreground">{row.dosenPengampu}</p>
      </div>
    ),
  },
  {
    key: "sks",
    label: "SKS",
    className: "text-center",
    cellClassName: "text-center",
    render: (value) => (
      <Badge variant="outline" className="font-mono">
        {value}
      </Badge>
    ),
  },
  {
    key: "semester",
    label: "Semester",
    className: "text-center",
    cellClassName: "text-center",
    render: (value) => <span className="text-sm">{value}</span>,
  },
  {
    key: "prodi",
    label: "Prodi",
    render: (value) => <span className="text-sm">{value}</span>,
  },
  {
    key: "jenis",
    label: "Jenis",
    className: "text-center",
    cellClassName: "text-center",
    render: (value) => (
      <Badge variant="outline" className={jenisColors[value]}>
        {value}
      </Badge>
    ),
  },
  {
    key: "peserta",
    label: "Peserta",
    className: "text-center",
    cellClassName: "text-center",
    render: (value) => <span className="text-sm">{value}</span>,
  },
]

const filters = [
  {
    key: "prodi",
    placeholder: "Program Studi",
    defaultValue: "all",
    options: [
      { value: "all", label: "Semua Prodi" },
      { value: "ti", label: "Teknik Informatika" },
      { value: "si", label: "Sistem Informasi" },
    ],
  },
  {
    key: "semester",
    placeholder: "Semester",
    defaultValue: "all",
    options: [
      { value: "all", label: "Semua Semester" },
      { value: "1", label: "Semester 1" },
      { value: "2", label: "Semester 2" },
      { value: "3", label: "Semester 3" },
      { value: "4", label: "Semester 4" },
      { value: "5", label: "Semester 5" },
      { value: "6", label: "Semester 6" },
      { value: "7", label: "Semester 7" },
      { value: "8", label: "Semester 8" },
    ],
  },
  {
    key: "jenis",
    placeholder: "Jenis",
    defaultValue: "all",
    options: [
      { value: "all", label: "Semua Jenis" },
      { value: "wajib", label: "Wajib" },
      { value: "pilihan", label: "Pilihan" },
    ],
  },
]

export default function MataKuliahPage() {
  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar />
      <TopNavBar />
      <main className="ml-64 min-h-screen">
        <div className="pt-24 pb-12 px-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Mata Kuliah</h1>
          <p className="text-muted-foreground">Kelola data mata kuliah program studi</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Total MK</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-success/10 p-2">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">144</p>
                <p className="text-sm text-muted-foreground">Total SKS</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-info/10 p-2">
                <BookOpen className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">98</p>
                <p className="text-sm text-muted-foreground">MK Wajib</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-warning/10 p-2">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">58</p>
                <p className="text-sm text-muted-foreground">MK Pilihan</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <DataTable
          title="Daftar Mata Kuliah"
          description="Seluruh mata kuliah yang ditawarkan"
          columns={columns}
          data={dataMataKuliah}
          searchPlaceholder="Cari kode atau nama mata kuliah..."
          filters={filters}
          onAdd={() => {}}
          addLabel="Tambah Mata Kuliah"
          actions={(row) => (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        />
      </div>
            </div>
      </main>
    </div>
  )
}

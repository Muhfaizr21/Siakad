"use client"

import { useState } from "react"
import Sidebar from "../components/Sidebar"
import TopNavBar from "../components/TopNavBar"
import { DataTable } from "../components/data-table"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Avatar, AvatarFallback } from "../components/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "../components/card"
import { Eye, Pencil, Trash2, Mail, Phone, GraduationCap, Users, BookOpen, Award } from "lucide-react"

const dataDosen = [
  {
    id: 1,
    nidn: "0301038501",
    nama: "Dr. Ir. Andi Wijaya, M.T.",
    email: "andi.wijaya@univ.ac.id",
    phone: "081234567801",
    prodi: "Teknik Informatika",
    jabatan: "Lektor Kepala",
    status: "Tetap",
    bidangKeahlian: "Artificial Intelligence",
    mahasiswaWali: 25,
    mataKuliahDiampu: 3,
  },
  {
    id: 2,
    nidn: "0415067802",
    nama: "Prof. Dr. Budi Hartono, M.Sc.",
    email: "budi.hartono@univ.ac.id",
    phone: "081234567802",
    prodi: "Sistem Informasi",
    jabatan: "Guru Besar",
    status: "Tetap",
    bidangKeahlian: "Database Systems",
    mahasiswaWali: 30,
    mataKuliahDiampu: 2,
  },
  {
    id: 3,
    nidn: "0520098903",
    nama: "Dr. Citra Dewi, M.Kom.",
    email: "citra.dewi@univ.ac.id",
    phone: "081234567803",
    prodi: "Teknik Informatika",
    jabatan: "Lektor",
    status: "Tetap",
    bidangKeahlian: "Computer Networks",
    mahasiswaWali: 22,
    mataKuliahDiampu: 4,
  },
  {
    id: 4,
    nidn: "0612079004",
    nama: "Dr. Eko Prasetyo, M.T.",
    email: "eko.prasetyo@univ.ac.id",
    phone: "081234567804",
    prodi: "Sistem Informasi",
    jabatan: "Lektor",
    status: "Tetap",
    bidangKeahlian: "Software Engineering",
    mahasiswaWali: 28,
    mataKuliahDiampu: 3,
  },
  {
    id: 5,
    nidn: "0708089105",
    nama: "Farah Amalia, M.Kom.",
    email: "farah.amalia@univ.ac.id",
    phone: "081234567805",
    prodi: "Teknik Informatika",
    jabatan: "Asisten Ahli",
    status: "Tetap",
    bidangKeahlian: "Web Development",
    mahasiswaWali: 18,
    mataKuliahDiampu: 3,
  },
  {
    id: 6,
    nidn: "",
    nama: "Gunawan Setiawan, M.Kom.",
    email: "gunawan.s@univ.ac.id",
    phone: "081234567806",
    prodi: "Sistem Informasi",
    jabatan: "-",
    status: "Tidak Tetap",
    bidangKeahlian: "Mobile Development",
    mahasiswaWali: 0,
    mataKuliahDiampu: 2,
  },
  {
    id: 7,
    nidn: "0809078606",
    nama: "Hendra Kusuma, M.T.",
    email: "hendra.kusuma@univ.ac.id",
    phone: "081234567807",
    prodi: "Teknik Informatika",
    jabatan: "Lektor",
    status: "Tetap",
    bidangKeahlian: "Cyber Security",
    mahasiswaWali: 20,
    mataKuliahDiampu: 2,
  },
  {
    id: 8,
    nidn: "",
    nama: "Irma Wati, M.Si.",
    email: "irma.wati@univ.ac.id",
    phone: "081234567808",
    prodi: "Sistem Informasi",
    jabatan: "-",
    status: "Tidak Tetap",
    bidangKeahlian: "Data Analytics",
    mahasiswaWali: 0,
    mataKuliahDiampu: 1,
  },
]

const statusColors = {
  Tetap: "bg-success/20 text-success border-success/30",
  "Tidak Tetap": "bg-warning/20 text-warning border-warning/30",
}

const jabatanColors = {
  "Guru Besar": "bg-primary/20 text-primary",
  "Lektor Kepala": "bg-info/20 text-info",
  Lektor: "bg-secondary text-foreground",
  "Asisten Ahli": "bg-secondary text-foreground",
  "-": "bg-secondary text-muted-foreground",
}

const columns = [
  {
    key: "nidn",
    label: "NIDN",
    render: (value) => (
      <span className="font-mono text-sm">{value || "-"}</span>
    ),
  },
  {
    key: "nama",
    label: "Nama Dosen",
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {value.split(" ").filter(n => !["Dr.", "Prof.", "Ir.", "M.T.", "M.Kom.", "M.Sc.", "M.Si."].includes(n)).map((n) => n[0]).join("").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "prodi",
    label: "Program Studi",
    render: (value) => <span className="text-sm">{value}</span>,
  },
  {
    key: "jabatan",
    label: "Jabatan",
    render: (value) => (
      <Badge variant="outline" className={jabatanColors[value]}>
        {value}
      </Badge>
    ),
  },
  {
    key: "bidangKeahlian",
    label: "Bidang Keahlian",
    render: (value) => <span className="text-sm">{value}</span>,
  },
  {
    key: "status",
    label: "Status",
    className: "text-center",
    cellClassName: "text-center",
    render: (value) => (
      <Badge variant="outline" className={statusColors[value]}>
        {value}
      </Badge>
    ),
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
    key: "status",
    placeholder: "Status",
    defaultValue: "all",
    options: [
      { value: "all", label: "Semua Status" },
      { value: "tetap", label: "Tetap" },
      { value: "tidak-tetap", label: "Tidak Tetap" },
    ],
  },
]

export default function DosenPage() {
  const [selectedDosen, setSelectedDosen] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleView = (dosen) => {
    setSelectedDosen(dosen)
    setIsDetailOpen(true)
  }

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar />
      <TopNavBar />
      <main className="ml-64 min-h-screen">
        <div className="pt-24 pb-12 px-8">
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold">Manajemen Dosen</h1>
              <p className="text-muted-foreground">Kelola data dosen fakultas</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
              <Card className="glass-card hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-none bg-background/60 backdrop-blur-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">87</p>
                    <p className="text-sm text-muted-foreground">Total Dosen</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-none bg-background/60 backdrop-blur-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-success/10 p-2">
                    <Award className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">72</p>
                    <p className="text-sm text-muted-foreground">Dosen Tetap</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-none bg-background/60 backdrop-blur-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-warning/10 p-2">
                    <Users className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">15</p>
                    <p className="text-sm text-muted-foreground">Dosen Tidak Tetap</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-none bg-background/60 backdrop-blur-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-info/10 p-2">
                    <BookOpen className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-muted-foreground">Mata Kuliah</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <DataTable
              title="Data Dosen"
              description="Daftar seluruh dosen yang terdaftar"
              columns={columns}
              data={dataDosen}
              searchPlaceholder="Cari NIDN, nama, atau email..."
              filters={filters}
              onAdd={() => { }}
              addLabel="Tambah Dosen"
              actions={(row) => (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleView(row)}
                  >
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

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Detail Dosen</DialogTitle>
                  <DialogDescription>Informasi lengkap dosen</DialogDescription>
                </DialogHeader>
                {selectedDosen && (
                  <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {selectedDosen.nama.split(" ").filter(n => !["Dr.", "Prof.", "Ir.", "M.T.", "M.Kom.", "M.Sc.", "M.Si."].includes(n)).map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedDosen.nama}</h3>
                        <p className="text-muted-foreground">{selectedDosen.nidn || "Dosen Tidak Tetap"}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className={statusColors[selectedDosen.status]}>
                            {selectedDosen.status}
                          </Badge>
                          <Badge variant="outline" className={jabatanColors[selectedDosen.jabatan]}>
                            {selectedDosen.jabatan}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="glass-card border-none bg-white/40 dark:bg-black/20 shadow-sm backdrop-blur-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Informasi Akademik
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedDosen.prodi}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Bidang Keahlian</span>
                            <span className="font-medium text-sm">{selectedDosen.bidangKeahlian}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Mata Kuliah Diampu</span>
                            <span className="font-medium">{selectedDosen.mataKuliahDiampu}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Mahasiswa Wali</span>
                            <span className="font-medium">{selectedDosen.mahasiswaWali}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glass-card border-none bg-white/40 dark:bg-black/20 shadow-sm backdrop-blur-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Informasi Kontak
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedDosen.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedDosen.phone}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                        Tutup
                      </Button>
                      <Button>Edit Data</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  )
}

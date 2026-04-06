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
import { Eye, Pencil, Trash2, Mail, Phone, MapPin, Calendar, BookOpen } from "lucide-react"

// Sample data mahasiswa
const dataMahasiswa = [
  {
    id: 1,
    nim: "20230001",
    nama: "Ahmad Fauzi Rahman",
    email: "ahmad.fauzi@student.ac.id",
    phone: "081234567890",
    prodi: "Teknik Informatika",
    angkatan: "2023",
    semester: 3,
    ipk: 3.75,
    status: "Aktif",
    alamat: "Jl. Merdeka No. 123, Jakarta Selatan",
    tanggalLahir: "15 Maret 2004",
    dosenWali: "Dr. Ir. Andi Wijaya",
  },
  {
    id: 2,
    nim: "20230015",
    nama: "Siti Rahayu Putri",
    email: "siti.rahayu@student.ac.id",
    phone: "081234567891",
    prodi: "Sistem Informasi",
    angkatan: "2023",
    semester: 3,
    ipk: 3.82,
    status: "Aktif",
    alamat: "Jl. Sudirman No. 45, Jakarta Pusat",
    tanggalLahir: "22 Juli 2004",
    dosenWali: "Prof. Budi Hartono",
  },
  {
    id: 3,
    nim: "20220042",
    nama: "Budi Santoso",
    email: "budi.santoso@student.ac.id",
    phone: "081234567892",
    prodi: "Teknik Informatika",
    angkatan: "2022",
    semester: 5,
    ipk: 3.45,
    status: "Aktif",
    alamat: "Jl. Gatot Subroto No. 78, Bandung",
    tanggalLahir: "10 Januari 2003",
    dosenWali: "Dr. Citra Dewi",
  },
  {
    id: 4,
    nim: "20210089",
    nama: "Dewi Lestari",
    email: "dewi.lestari@student.ac.id",
    phone: "081234567893",
    prodi: "Sistem Informasi",
    angkatan: "2021",
    semester: 7,
    ipk: 3.91,
    status: "Aktif",
    alamat: "Jl. Asia Afrika No. 12, Bandung",
    tanggalLahir: "5 September 2002",
    dosenWali: "Dr. Eko Prasetyo",
  },
  {
    id: 5,
    nim: "20230102",
    nama: "Rizki Pratama",
    email: "rizki.pratama@student.ac.id",
    phone: "081234567894",
    prodi: "Teknik Informatika",
    angkatan: "2023",
    semester: 3,
    ipk: 3.28,
    status: "Cuti",
    alamat: "Jl. Diponegoro No. 56, Surabaya",
    tanggalLahir: "18 November 2004",
    dosenWali: "Dr. Ir. Andi Wijaya",
  },
  {
    id: 6,
    nim: "20200156",
    nama: "Maya Indah Sari",
    email: "maya.indah@student.ac.id",
    phone: "081234567895",
    prodi: "Sistem Informasi",
    angkatan: "2020",
    semester: 8,
    ipk: 3.67,
    status: "Lulus",
    alamat: "Jl. Pemuda No. 89, Semarang",
    tanggalLahir: "3 April 2001",
    dosenWali: "Prof. Budi Hartono",
  },
  {
    id: 7,
    nim: "20230078",
    nama: "Fajar Nugroho",
    email: "fajar.nugroho@student.ac.id",
    phone: "081234567896",
    prodi: "Teknik Informatika",
    angkatan: "2023",
    semester: 3,
    ipk: 3.55,
    status: "Aktif",
    alamat: "Jl. Ahmad Yani No. 34, Yogyakarta",
    tanggalLahir: "27 Juni 2004",
    dosenWali: "Dr. Citra Dewi",
  },
  {
    id: 8,
    nim: "20220134",
    nama: "Anisa Fitriani",
    email: "anisa.fitriani@student.ac.id",
    phone: "081234567897",
    prodi: "Sistem Informasi",
    angkatan: "2022",
    semester: 5,
    ipk: 3.72,
    status: "Aktif",
    alamat: "Jl. Pahlawan No. 67, Malang",
    tanggalLahir: "12 Februari 2003",
    dosenWali: "Dr. Eko Prasetyo",
  },
  {
    id: 9,
    nim: "20210045",
    nama: "Hendri Setiawan",
    email: "hendri.setiawan@student.ac.id",
    phone: "081234567898",
    prodi: "Teknik Informatika",
    angkatan: "2021",
    semester: 7,
    ipk: 2.95,
    status: "Non-Aktif",
    alamat: "Jl. Veteran No. 23, Medan",
    tanggalLahir: "8 Agustus 2002",
    dosenWali: "Dr. Ir. Andi Wijaya",
  },
  {
    id: 10,
    nim: "20230189",
    nama: "Putri Wulandari",
    email: "putri.wulandari@student.ac.id",
    phone: "081234567899",
    prodi: "Sistem Informasi",
    angkatan: "2023",
    semester: 3,
    ipk: 3.88,
    status: "Aktif",
    alamat: "Jl. Kartini No. 45, Denpasar",
    tanggalLahir: "30 Desember 2004",
    dosenWali: "Prof. Budi Hartono",
  },
]

const statusColors = {
  Aktif: "bg-success/20 text-success border-success/30",
  Cuti: "bg-warning/20 text-warning border-warning/30",
  "Non-Aktif": "bg-destructive/20 text-destructive border-destructive/30",
  Lulus: "bg-info/20 text-info border-info/30",
}

const columns = [
  {
    key: "nim",
    label: "NIM",
    render: (value) => <span className="font-mono text-sm">{value}</span>,
  },
  {
    key: "nama",
    label: "Nama Mahasiswa",
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {value.split(" ").map((n) => n[0]).join("").slice(0, 2)}
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
    key: "angkatan",
    label: "Angkatan",
    className: "text-center",
    cellClassName: "text-center",
    render: (value) => <Badge variant="outline">{value}</Badge>,
  },
  {
    key: "semester",
    label: "Semester",
    className: "text-center",
    cellClassName: "text-center",
    render: (value) => <span className="text-sm">{value}</span>,
  },
  {
    key: "ipk",
    label: "IPK",
    className: "text-center",
    cellClassName: "text-center",
    render: (value) => (
      <span className={`font-medium ${value >= 3.5 ? "text-success" : value >= 3.0 ? "text-foreground" : "text-warning"}`}>
        {value.toFixed(2)}
      </span>
    ),
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
    key: "angkatan",
    placeholder: "Angkatan",
    defaultValue: "all",
    options: [
      { value: "all", label: "Semua Angkatan" },
      { value: "2024", label: "2024" },
      { value: "2023", label: "2023" },
      { value: "2022", label: "2022" },
      { value: "2021", label: "2021" },
      { value: "2020", label: "2020" },
    ],
  },
  {
    key: "status",
    placeholder: "Status",
    defaultValue: "all",
    options: [
      { value: "all", label: "Semua Status" },
      { value: "aktif", label: "Aktif" },
      { value: "cuti", label: "Cuti" },
      { value: "non-aktif", label: "Non-Aktif" },
      { value: "lulus", label: "Lulus" },
    ],
  },
]

export default function MahasiswaPage() {
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleView = (mahasiswa) => {
    setSelectedMahasiswa(mahasiswa)
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
              <h1 className="text-2xl font-bold">Manajemen Mahasiswa</h1>
              <p className="text-muted-foreground">Kelola data mahasiswa fakultas</p>
            </div>

            {/* Data Table */}
            <DataTable
              title="Data Mahasiswa"
              description="Daftar seluruh mahasiswa yang terdaftar"
              columns={columns}
              data={dataMahasiswa}
              searchPlaceholder="Cari NIM, nama, atau email..."
              filters={filters}
              onAdd={() => { }}
              addLabel="Tambah Mahasiswa"
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
                  <DialogTitle>Detail Mahasiswa</DialogTitle>
                  <DialogDescription>Informasi lengkap mahasiswa</DialogDescription>
                </DialogHeader>
                {selectedMahasiswa && (
                  <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {selectedMahasiswa.nama.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedMahasiswa.nama}</h3>
                        <p className="text-muted-foreground">{selectedMahasiswa.nim}</p>
                        <Badge variant="outline" className={statusColors[selectedMahasiswa.status]}>
                          {selectedMahasiswa.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Informasi Akademik
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedMahasiswa.prodi}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Angkatan</span>
                            <span className="font-medium">{selectedMahasiswa.angkatan}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Semester</span>
                            <span className="font-medium">{selectedMahasiswa.semester}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">IPK</span>
                            <span className="font-semibold text-success">{selectedMahasiswa.ipk.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Dosen Wali</span>
                            <span className="font-medium text-sm">{selectedMahasiswa.dosenWali}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Informasi Kontak
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedMahasiswa.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedMahasiswa.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedMahasiswa.tanggalLahir}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-sm">{selectedMahasiswa.alamat}</span>
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

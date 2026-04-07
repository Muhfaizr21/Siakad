"use client"

import React, { useState, useEffect } from "react"
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
import { useNavigate } from "react-router-dom"

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
            {value ? value.split(" ").filter(n => !["Dr.", "Prof.", "Ir.", "M.T.", "M.Kom.", "M.Sc.", "M.Si."].includes(n)).map((n) => n[0]).join("").slice(0, 2) : "DS"}
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
      <Badge variant="outline" className={jabatanColors[value] || jabatanColors["-"]}>
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
      <Badge variant="outline" className={statusColors[value] || statusColors["Tetap"]}>
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
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedDosen, setSelectedDosen] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [dosenList, setDosenList] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDosen = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/faculty/lecturers')
      const json = await res.json()
      if (json.status === 'success') {
        const mapped = json.data.map(d => ({
          ...d,
          nama: d.name,
          nidn: d.nidn || "-",
          email: d.user?.email || "-",
          phone: d.phone || "-", 
          prodi: d.faculty?.name || "TBA",
          jabatan: d.position || "-",
          status: d.status || "Tetap",
          bidangKeahlian: d.expertize || "-",
          mahasiswaWali: d.menteeCount || 0,
          mataKuliahDiampu: d.subjectCount || 0
        }))
        setDosenList(mapped)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDosen()
  }, [])

  const handleView = (dosen) => {
    setSelectedDosen(dosen)
    setIsDetailOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus dosen ini? Akun user terkait juga akan dihapus.")) {
      try {
        const res = await fetch(`http://localhost:8000/api/faculty/lecturers/${id}`, {
          method: 'DELETE'
        })
        const json = await res.json()
        if (json.status === 'success') {
          alert("Dosen berhasil dihapus")
          fetchDosen()
        } else {
          alert("Gagal menghapus: " + json.message)
        }
      } catch (err) {
        alert("Terjadi kesalahan sistem")
      }
    }
  }

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <TopNavBar setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold">Manajemen Dosen</h1>
              <p className="text-muted-foreground">Kelola data dosen fakultas</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
              <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-none bg-white shadow-sm">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dosenList.length}</p>
                    <p className="text-sm text-muted-foreground">Total Dosen</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-none bg-white shadow-sm">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-success/10 p-2">
                    <Award className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dosenList.filter(d => d.status === "Tetap").length}</p>
                    <p className="text-sm text-muted-foreground">Dosen Tetap</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-none bg-white shadow-sm">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-warning/10 p-2">
                    <Users className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dosenList.filter(d => d.isDpa).length}</p>
                    <p className="text-sm text-muted-foreground">Dosen Wali (DPA)</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-none bg-white shadow-sm">
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
              data={loading ? [] : dosenList}
              searchPlaceholder="Cari NIDN, nama, atau email..."
              filters={filters}
              onAdd={() => navigate('/faculty/dosen/tambah')}
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => navigate(`/faculty/dosen/edit/${row.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            />

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
              <DialogContent className="max-w-2xl bg-white">
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
                          {selectedDosen.nama ? selectedDosen.nama.split(" ").filter(n => !["Dr.", "Prof.", "Ir.", "M.T.", "M.Kom.", "M.Sc.", "M.Si."].includes(n)).map((n) => n[0]).join("").slice(0, 2) : "DS"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedDosen.nama}</h3>
                        <p className="text-muted-foreground">{selectedDosen.nidn || "Dosen Tidak Tetap"}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className={statusColors[selectedDosen.status] || statusColors["Tetap"]}>
                            {selectedDosen.status}
                          </Badge>
                          <Badge variant="outline" className={jabatanColors[selectedDosen.jabatan] || jabatanColors["-"]}>
                            {selectedDosen.jabatan}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="border-none bg-slate-50 shadow-sm">
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
                            <span className="text-sm text-muted-foreground">Status DPA</span>
                            <span className="font-medium">{selectedDosen.isDpa ? "Ya" : "Tidak"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none bg-slate-50 shadow-sm">
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
                      <Button onClick={() => {
                        setIsDetailOpen(false)
                        navigate(`/faculty/dosen/edit/${selectedDosen.id}`)
                      }}>
                        Edit Data
                      </Button>
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

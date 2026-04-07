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
import { Eye, Pencil, Trash2, Mail, Phone, MapPin, Calendar, BookOpen, Loader2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const statusColors = {
  Aktif: "bg-success/20 text-success border-success/30",
  Cuti: "bg-warning/20 text-warning border-warning/30",
  "Non-Aktif": "bg-destructive/20 text-destructive border-destructive/30",
  Lulus: "bg-info/20 text-info border-info/30",
}

export default function MahasiswaPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus mahasiswa ini? Semua data user terkait juga akan dihapus.")) return
    
    try {
      const res = await fetch(`http://localhost:8000/api/faculty/students/${id}`, {
        method: 'DELETE'
      })
      const json = await res.json()
      if (json.status === 'success') {
        alert("Mahasiswa berhasil dihapus")
        fetchStudents()
      } else {
        alert("Gagal menghapus: " + json.message)
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem")
    }
  }

  const handleView = (mahasiswa) => {
    setSelectedMahasiswa(mahasiswa)
    setIsDetailOpen(true)
  }

  const getStatusCapitalized = (status) => {
    if (!status) return "Aktif"
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

    const columns = [
        {
          key: "nim",
          label: "NIM",
          render: (value) => <span className="font-mono text-[13px] font-bold text-on-surface-variant uppercase tracking-widest">{value}</span>
        },
        {
          key: "name",
          label: "Nama Mahasiswa",
          render: (value, row) => (
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border border-outline-variant/10 shadow-sm">
                <AvatarFallback className="bg-primary/5 text-primary font-medium text-xs">
                  {value?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                 <span className="block font-medium text-[14px] text-on-surface leading-tight mb-0.5">{value}</span>
                 <span className="text-[11px] font-medium text-on-surface-variant opacity-70 uppercase tracking-widest">{row.user?.email || '-'}</span>
              </div>
            </div>
          )
        },
        {
          key: "major",
          label: "Program Studi",
          render: (value) => <span className="text-[13px] font-medium text-on-surface-variant">{value?.name || "Belum ada prodi"}</span>
        },
        {
          key: "currentSemester",
          label: "Semester",
          className: "text-center",
          cellClassName: "text-center",
          render: (value) => (
            <div className="flex flex-col items-center">
              <span className="text-[13px] font-medium text-on-surface">{value || 1}</span>
              <span className="text-[9px] font-medium text-on-surface-variant/50 uppercase tracking-widest mt-0.5">SMT</span>
            </div>
          )
        },
        {
          key: "status",
          label: "Status",
          className: "text-center",
          cellClassName: "text-center",
          render: (value) => (
             <span className={`px-3.5 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap ${getStatusCapitalized(value) === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : getStatusCapitalized(value) === 'Lulus' ? 'bg-blue-50 text-blue-600' : getStatusCapitalized(value) === 'Cuti' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                {getStatusCapitalized(value)}
             </span>
          )
        }
    ]

  return (
    <div className="text-on-surface bg-surface min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-8">
           {/* Page Header */}
           <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div>
                 <h1 className="text-2xl font-medium tracking-tight text-on-surface font-headline uppercase leading-tight">Manajemen Mahasiswa</h1>
                 <p className="text-on-surface-variant text-sm mt-1 font-medium">Kelola data mahasiswa dan administrasi akademik fakultas.</p>
              </div>
           </div>

           <DataTable 
             title="Data Mahasiswa Terdaftar"
             description="Daftar seluruh mahasiswa yang aktif terdaftar di fakultas."
             columns={columns}
             data={studentData}
             loading={loading}
             searchPlaceholder="Cari NIM atau Nama..."
             onAdd={() => navigate('/faculty/mahasiswa/tambah')}
             addLabel="Tambah Mahasiswa"
             actions={(row) => (
                <>
                  <button 
                    onClick={() => handleView(row)}
                    className="h-9 w-9 rounded-xl bg-slate-50 text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center border border-slate-100"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => navigate(`/faculty/mahasiswa/edit/${row.id}`)}
                    className="h-9 w-9 rounded-xl bg-slate-50 text-on-surface-variant hover:text-[#00236f] hover:bg-[#00236f]/5 transition-all flex items-center justify-center border border-slate-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(row.id)}
                    className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center border border-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
             )}
           />

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
              <DialogContent className="max-w-2xl bg-white shadow-2xl rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle>Detail Mahasiswa</DialogTitle>
                  <DialogDescription>Informasi lengkap mahasiswa</DialogDescription>
                </DialogHeader>
                {selectedMahasiswa && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {selectedMahasiswa.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedMahasiswa.name}</h3>
                        <p className="text-on-surface-variant">{selectedMahasiswa.nim}</p>
                        <Badge variant="outline" className={statusColors[getStatusCapitalized(selectedMahasiswa.status)] || "bg-primary/20 text-primary border-primary/30"}>
                          {getStatusCapitalized(selectedMahasiswa.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="border-none bg-slate-50 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-on-surface-variant">
                            Informasi Akademik
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-on-surface-variant" />
                            <span className="text-sm">{selectedMahasiswa.major?.name || '-'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-on-surface-variant">Angkatan</span>
                            <span className="font-medium">{new Date(selectedMahasiswa.createdAt || Date.now()).getFullYear()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-on-surface-variant">Semester</span>
                            <span className="font-medium">{selectedMahasiswa.currentSemester || 1}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-on-surface-variant">Dosen Wali</span>
                            <span className="font-medium text-sm">{selectedMahasiswa.dpaLecturer?.name || '-'}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none bg-slate-50 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-on-surface-variant">
                            Informasi Kontak
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-on-surface-variant" />
                            <span className="text-sm">{selectedMahasiswa.user?.email || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-on-surface-variant" />
                            <span className="text-sm">{selectedMahasiswa.phone || '-'}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-on-surface-variant shrink-0 mt-0.5" />
                            <span className="text-sm text-xs leading-relaxed">{selectedMahasiswa.address || '-'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                        Tutup
                      </Button>
                      <Button onClick={() => {
                        setIsDetailOpen(false)
                        navigate(`/faculty/mahasiswa/edit/${selectedMahasiswa.id}`)
                      }}>
                        Edit Data
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
        </div>
      </main>
    </div>
  )
}

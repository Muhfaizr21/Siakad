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
  Tetap: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  "Tidak Tetap": "bg-amber-50 text-amber-600 border border-amber-100",
}

const jabatanColors = {
  "Guru Besar": "bg-primary/10 text-primary",
  "Lektor Kepala": "bg-info/10 text-info",
  Lektor: "bg-slate-100 text-on-surface-variant",
  "Asisten Ahli": "bg-slate-100 text-on-surface-variant",
  "-": "bg-slate-100 text-on-surface-variant/50",
}

const columns = [
  {
    key: "nidn",
    label: "NIDN",
    render: (value) => (
      <span className="font-mono text-[13px] font-bold text-on-surface-variant uppercase tracking-widest">{value || "-"}</span>
    ),
  },
  {
    key: "nama",
    label: "Nama Dosen",
    render: (value, row) => (
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10 border border-outline-variant/10 shadow-sm">
          <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
            {value ? value.split(" ").filter(n => !["Dr.", "Prof.", "Ir.", "M.T.", "M.Kom.", "M.Sc.", "M.Si."].includes(n)).map((n) => n[0]).join("").slice(0, 2) : "DS"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-[14px] text-on-surface leading-tight mb-0.5">{value}</p>
          <p className="text-[11px] font-medium text-on-surface-variant opacity-70 uppercase tracking-widest">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "prodi",
    label: "Program Studi",
    render: (value) => <span className="text-[13px] font-medium text-on-surface-variant">{value}</span>,
  },
  {
    key: "jabatan",
    label: "Jabatan",
    className: "text-center",
    cellClassName: "text-center",
    render: (value) => (
      <Badge variant="outline" className={`rounded-lg py-1 text-[10px] uppercase font-medium tracking-wider border-none ${jabatanColors[value] || jabatanColors["-"]}`}>
        {value}
      </Badge>
    ),
  },
  {
    key: "bidangKeahlian",
    label: "Bidang Keahlian",
    render: (value) => <span className="text-[13px] font-medium text-on-surface-variant">{value}</span>,
  },
  {
    key: "status",
    label: "Status",
    className: "text-center",
    cellClassName: "text-center",
    render: (value) => (
      <span className={`px-3.5 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap ${statusColors[value] || statusColors["Tetap"]}`}>
        {value}
      </span>
    ),
  },
]

const filters = [
  {
    key: "status",
    placeholder: "Status",
    defaultValue: "all",
    options: [
      { value: "all", label: "SEMUA STATUS" },
      { value: "Tetap", label: "TETAP" },
      { value: "Tidak Tetap", label: "TIDAK TETAP" },
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
    <div className="text-on-surface bg-surface min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <TopNavBar setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-on-surface font-headline uppercase leading-tight">Manajemen Dosen</h1>
              <p className="text-on-surface-variant text-sm mt-1 font-medium">Kelola data tenaga pendidik dan administrasi kepegawaian.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-medium text-on-surface">{dosenList.length}</p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Total Dosen</p>
              </div>
            </Card>
            <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-medium text-on-surface">{dosenList.filter(d => d.status === "Tetap").length}</p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Dosen Tetap</p>
              </div>
            </Card>
            <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-medium text-on-surface">{dosenList.filter(d => d.isDpa).length}</p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Dosen Wali</p>
              </div>
            </Card>
            <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-on-surface-variant flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-medium text-on-surface">156</p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Mata Kuliah</p>
              </div>
            </Card>
          </div>

          <DataTable
            title="Daftar Tenaga Pendidik"
            description="Informasi lengkap seluruh dosen yang terdaftar di fakultas."
            columns={columns}
            data={loading ? [] : dosenList}
            loading={loading}
            searchPlaceholder="Cari NIDN, nama, atau email..."
            filters={filters}
            onAdd={() => navigate('/faculty/dosen/tambah')}
            addLabel="Tambah Dosen"
            actions={(row) => (
              <>
                <button
                   onClick={() => handleView(row)}
                   className="h-9 w-9 rounded-xl bg-slate-50 text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center border border-slate-100"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => navigate(`/faculty/dosen/edit/${row.id}`)}
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
      </main>
    </div>
  )
}

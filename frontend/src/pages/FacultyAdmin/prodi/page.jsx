import React, { useState, useEffect } from "react"


import Sidebar from "../components/Sidebar"
import TopNavBar from "../components/TopNavBar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Progress } from "../components/progress"
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  ArrowRight,
  Plus,
  Pencil,
  Award,
  Trash2,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const akreditasiColors = {
  A: "bg-success/20 text-success border-success/30",
  B: "bg-info/20 text-info border-info/30",
  C: "bg-warning/20 text-warning border-warning/30",
}

export default function ProdiPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [majors, setMajors] = useState([])
  const [summary, setSummary] = useState({ totalStudents: 0, totalCourses: 0 })
  const [loading, setLoading] = useState(true)

  const fetchMajors = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/faculty/majors')
      const json = await res.json()
      if (json.status === 'success') {
        setMajors(json.data)
        if (json.summary) setSummary(json.summary)
      }
    } catch (err) {
      console.error("Failed to fetch majors:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMajors()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus program studi ini?")) {
      try {
        const res = await fetch(`http://localhost:8000/api/faculty/majors/${id}`, {
          method: 'DELETE'
        })
        const json = await res.json()
        if (json.status === 'success') {
          alert("Program studi berhasil dihapus")
          fetchMajors()
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Program Studi</h1>
                <p className="text-on-surface-variant">Kelola data program studi fakultas</p>
              </div>
              <Button onClick={() => navigate('/faculty/prodi/tambah')}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Prodi
              </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{majors.length}</p>
                    <p className="text-sm text-on-surface-variant">Program Studi</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-success/10 p-2">
                    <Award className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{majors.filter(m => m.akreditasi === 'A').length || 0}</p>
                    <p className="text-sm text-on-surface-variant">Akreditasi A</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-info/10 p-2">
                    <Users className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summary.totalStudents.toLocaleString()}</p>
                    <p className="text-sm text-on-surface-variant">Total Mahasiswa</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-warning/10 p-2">
                    <BookOpen className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summary.totalCourses}</p>
                    <p className="text-sm text-on-surface-variant">Mata Kuliah</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prodi Cards */}
            {loading ? (
              <div className="flex justify-center py-12">
                <p>Memuat data...</p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {majors.map((prodi) => (
                  <Card key={prodi.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                            {prodi.name ? prodi.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'PS'}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{prodi.name}</CardTitle>
                            <CardDescription>{prodi.degreeLevel || "S1"} - {prodi.faculty?.name || "Fakultas"}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className={akreditasiColors[prodi.akreditasi] || akreditasiColors['B']}>
                          Akreditasi {prodi.akreditasi || '-'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-lg bg-secondary/50 p-3 text-center">
                          <p className="text-xl font-bold">{prodi.mahasiswaAktif || 0}</p>
                          <p className="text-xs text-on-surface-variant">Mahasiswa</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3 text-center">
                          <p className="text-xl font-bold">{prodi.dosenCount || 0}</p>
                          <p className="text-xs text-on-surface-variant">Dosen</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3 text-center">
                          <p className="text-xl font-bold">{prodi.mataKuliah || 0}</p>
                          <p className="text-xs text-on-surface-variant">Mata Kuliah</p>
                        </div>
                      </div>

                      {/* Capacity Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-on-surface-variant">Kapasitas Mahasiswa</span>
                          <span className="font-medium">
                            {prodi.mahasiswaAktif || 0} / {prodi.kapasitas || 0}
                          </span>
                        </div>
                        <Progress
                          value={prodi.kapasitas ? ((prodi.mahasiswaAktif || 0) / prodi.kapasitas) * 100 : 0}
                          className="h-2"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Link to="/faculty/prodi/kurikulum">
                            <Button variant="outline" size="sm">
                              <BookOpen className="mr-2 h-4 w-4" />
                              Kurikulum
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/faculty/prodi/edit/${prodi.id}`)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(prodi.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm">
                          Detail
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {majors.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">Belum ada data program studi.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/faculty/prodi/tambah')}>
                  Tambah Sekarang
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

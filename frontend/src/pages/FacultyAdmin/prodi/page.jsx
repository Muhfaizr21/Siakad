// React Router component

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
  Settings,
  TrendingUp,
  Award,
} from "lucide-react"
import { Link } from "react-router-dom"

const dataProdi = [
  {
    id: 1,
    kode: "TI",
    nama: "Teknik Informatika",
    jenjang: "S1",
    akreditasi: "A",
    kaprodi: "Dr. Ir. Andi Wijaya, M.T.",
    mahasiswaAktif: 456,
    dosenTetap: 24,
    dosenTidakTetap: 8,
    mataKuliah: 68,
    kurikulum: "2023",
    kapasitas: 500,
  },
  {
    id: 2,
    kode: "SI",
    nama: "Sistem Informasi",
    jenjang: "S1",
    akreditasi: "A",
    kaprodi: "Prof. Dr. Budi Hartono, M.Sc.",
    mahasiswaAktif: 398,
    dosenTetap: 20,
    dosenTidakTetap: 7,
    mataKuliah: 62,
    kurikulum: "2023",
    kapasitas: 450,
  },
  {
    id: 3,
    kode: "TE",
    nama: "Teknik Elektro",
    jenjang: "S1",
    akreditasi: "B",
    kaprodi: "Dr. Eko Prasetyo, M.T.",
    mahasiswaAktif: 234,
    dosenTetap: 15,
    dosenTidakTetap: 5,
    mataKuliah: 58,
    kurikulum: "2022",
    kapasitas: 300,
  },
  {
    id: 4,
    kode: "TM",
    nama: "Teknik Mesin",
    jenjang: "S1",
    akreditasi: "B",
    kaprodi: "Dr. Hendra Kusuma, M.T.",
    mahasiswaAktif: 189,
    dosenTetap: 12,
    dosenTidakTetap: 4,
    mataKuliah: 54,
    kurikulum: "2022",
    kapasitas: 250,
  },
]

const akreditasiColors = {
  A: "bg-success/20 text-success border-success/30",
  B: "bg-info/20 text-info border-info/30",
  C: "bg-warning/20 text-warning border-warning/30",
}

export default function ProdiPage() {
  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar />
      <TopNavBar />
      <main className="ml-64 min-h-screen">
        <div className="pt-24 pb-12 px-8">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Program Studi</h1>
                <p className="text-muted-foreground">Kelola data program studi fakultas</p>
              </div>
              <Button>
                <Building2 className="mr-2 h-4 w-4" />
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
                    <p className="text-2xl font-bold">4</p>
                    <p className="text-sm text-muted-foreground">Program Studi</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-success/10 p-2">
                    <Award className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-muted-foreground">Akreditasi A</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-info/10 p-2">
                    <Users className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1,277</p>
                    <p className="text-sm text-muted-foreground">Total Mahasiswa</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-warning/10 p-2">
                    <BookOpen className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">242</p>
                    <p className="text-sm text-muted-foreground">Mata Kuliah</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prodi Cards */}
            <div className="grid gap-6 lg:grid-cols-2">
              {dataProdi.map((prodi) => (
                <Card key={prodi.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                          {prodi.kode}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{prodi.nama}</CardTitle>
                          <CardDescription>{prodi.jenjang} - Kurikulum {prodi.kurikulum}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className={akreditasiColors[prodi.akreditasi]}>
                        Akreditasi {prodi.akreditasi}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Kaprodi */}
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Kaprodi:</span>
                      <span className="font-medium">{prodi.kaprodi}</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-secondary/50 p-3 text-center">
                        <p className="text-xl font-bold">{prodi.mahasiswaAktif}</p>
                        <p className="text-xs text-muted-foreground">Mahasiswa</p>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-3 text-center">
                        <p className="text-xl font-bold">{prodi.dosenTetap + prodi.dosenTidakTetap}</p>
                        <p className="text-xs text-muted-foreground">Dosen</p>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-3 text-center">
                        <p className="text-xl font-bold">{prodi.mataKuliah}</p>
                        <p className="text-xs text-muted-foreground">Mata Kuliah</p>
                      </div>
                    </div>

                    {/* Capacity Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Kapasitas Mahasiswa</span>
                        <span className="font-medium">
                          {prodi.mahasiswaAktif} / {prodi.kapasitas}
                        </span>
                      </div>
                      <Progress
                        value={(prodi.mahasiswaAktif / prodi.kapasitas) * 100}
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
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
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
          </div>
        </div>
      </main>
    </div>
  )
}

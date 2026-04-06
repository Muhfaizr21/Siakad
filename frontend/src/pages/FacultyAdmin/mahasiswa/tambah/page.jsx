// React Router component

import { useState } from "react"
import Sidebar from "../../components/Sidebar"
import TopNavBar from "../../components/TopNavBar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card"
import { Button } from "../../components/button"
import { Input } from "../../components/input"
import { Label } from "../../components/label"
import { Textarea } from "../../components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select"
import { Separator } from "../../components/separator"
import { ArrowLeft, Save, User, BookOpen, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

export default function TambahMahasiswaPage() {
  const [formData, setFormData] = useState({
    nim: "",
    nama: "",
    email: "",
    phone: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    agama: "",
    alamat: "",
    prodi: "",
    angkatan: "",
    dosenWali: "",
  })

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
  }

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar />
      <TopNavBar />
      <main className="ml-64 min-h-screen">
        <div className="pt-24 pb-12 px-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Link to="/faculty/mahasiswa">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Tambah Mahasiswa Baru</h1>
            <p className="text-muted-foreground">Isi formulir untuk mendaftarkan mahasiswa baru</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Data Pribadi */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle>Data Pribadi</CardTitle>
                  </div>
                  <CardDescription>Informasi identitas mahasiswa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nim">NIM</Label>
                      <Input
                        id="nim"
                        placeholder="Masukkan NIM"
                        value={formData.nim}
                        onChange={(e) => handleChange("nim", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Lengkap</Label>
                      <Input
                        id="nama"
                        placeholder="Masukkan nama lengkap"
                        value={formData.nama}
                        onChange={(e) => handleChange("nama", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@student.ac.id"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">No. Telepon</Label>
                      <Input
                        id="phone"
                        placeholder="08xxxxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="tempatLahir">Tempat Lahir</Label>
                      <Input
                        id="tempatLahir"
                        placeholder="Masukkan tempat lahir"
                        value={formData.tempatLahir}
                        onChange={(e) => handleChange("tempatLahir", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                      <Input
                        id="tanggalLahir"
                        type="date"
                        value={formData.tanggalLahir}
                        onChange={(e) => handleChange("tanggalLahir", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                      <Select
                        value={formData.jenisKelamin}
                        onValueChange={(value) => handleChange("jenisKelamin", value)}
                      >
                        <SelectTrigger id="jenisKelamin">
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Laki-laki</SelectItem>
                          <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agama">Agama</Label>
                      <Select
                        value={formData.agama}
                        onValueChange={(value) => handleChange("agama", value)}
                      >
                        <SelectTrigger id="agama">
                          <SelectValue placeholder="Pilih agama" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="islam">Islam</SelectItem>
                          <SelectItem value="kristen">Kristen</SelectItem>
                          <SelectItem value="katolik">Katolik</SelectItem>
                          <SelectItem value="hindu">Hindu</SelectItem>
                          <SelectItem value="buddha">Buddha</SelectItem>
                          <SelectItem value="konghucu">Konghucu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alamat */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle>Alamat</CardTitle>
                  </div>
                  <CardDescription>Alamat domisili mahasiswa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="alamat">Alamat Lengkap</Label>
                    <Textarea
                      id="alamat"
                      placeholder="Masukkan alamat lengkap"
                      rows={3}
                      value={formData.alamat}
                      onChange={(e) => handleChange("alamat", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Akademik */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle>Data Akademik</CardTitle>
                  </div>
                  <CardDescription>Informasi program studi dan akademik</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="prodi">Program Studi</Label>
                      <Select
                        value={formData.prodi}
                        onValueChange={(value) => handleChange("prodi", value)}
                      >
                        <SelectTrigger id="prodi">
                          <SelectValue placeholder="Pilih program studi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ti">Teknik Informatika</SelectItem>
                          <SelectItem value="si">Sistem Informasi</SelectItem>
                          <SelectItem value="te">Teknik Elektro</SelectItem>
                          <SelectItem value="tm">Teknik Mesin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="angkatan">Angkatan</Label>
                      <Select
                        value={formData.angkatan}
                        onValueChange={(value) => handleChange("angkatan", value)}
                      >
                        <SelectTrigger id="angkatan">
                          <SelectValue placeholder="Pilih tahun angkatan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2020">2020</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dosenWali">Dosen Wali</Label>
                    <Select
                      value={formData.dosenWali}
                      onValueChange={(value) => handleChange("dosenWali", value)}
                    >
                      <SelectTrigger id="dosenWali">
                        <SelectValue placeholder="Pilih dosen wali" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Dr. Ir. Andi Wijaya</SelectItem>
                        <SelectItem value="2">Prof. Budi Hartono</SelectItem>
                        <SelectItem value="3">Dr. Citra Dewi</SelectItem>
                        <SelectItem value="4">Dr. Eko Prasetyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Simpan Data</CardTitle>
                  <CardDescription>Pastikan semua data sudah benar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button type="submit" className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Mahasiswa
                  </Button>
                  <Button type="button" variant="outline" className="w-full">
                    Simpan & Tambah Lagi
                  </Button>
                  <Link to="/faculty/mahasiswa">
                    <Button type="button" variant="ghost" className="w-full">
                      Batal
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>- NIM harus unik dan belum terdaftar</li>
                    <li>- Email akan digunakan untuk login</li>
                    <li>- Password default akan dikirim via email</li>
                    <li>- Dosen wali dapat diubah kemudian</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
            </div>
      </main>
    </div>
  )
}

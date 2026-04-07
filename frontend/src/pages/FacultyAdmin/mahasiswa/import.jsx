"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card"
import { Button } from "../components/button"
import { Progress } from "../components/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/table"
import { Badge } from "../components/badge"
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  File,
  Trash2,
} from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../components/alert"

const samplePreviewData = [
  { nim: "2024001001", nama: "Andi Wijaya", prodi: "Teknik Informatika", angkatan: "2024", status: "valid" },
  { nim: "2024001002", nama: "Budi Setiawan", prodi: "Sistem Informasi", angkatan: "2024", status: "valid" },
  { nim: "2024001003", nama: "Citra Dewi", prodi: "Teknik Elektro", angkatan: "2024", status: "valid" },
  { nim: "2024001004", nama: "", prodi: "Teknik Mesin", angkatan: "2024", status: "error" },
  { nim: "2024001005", nama: "Eka Putri", prodi: "Invalid Prodi", angkatan: "2024", status: "warning" },
]

export default function ImportMahasiswaPage() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setIsUploading(true)
      // Simulate upload progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setShowPreview(true)
        }
      }, 200)
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setShowPreview(false)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "valid":
        return (
          <Badge className="bg-success/10 text-success">
            <CheckCircle2 className="mr-1 size-3" />
            Valid
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-destructive/10 text-destructive">
            <XCircle className="mr-1 size-3" />
            Error
          </Badge>
        )
      case "warning":
        return (
          <Badge className="bg-warning/10 text-warning-foreground">
            <AlertCircle className="mr-1 size-3" />
            Warning
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Data Mahasiswa</h1>
        <p className="text-on-surface-variant">
          Import data mahasiswa dari file Excel atau CSV
        </p>
      </div>

      {/* Instructions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Upload file Excel (.xlsx) atau CSV (.csv) yang berisi data mahasiswa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!uploadedFile ? (
              <label
                htmlFor="file-upload"
                className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary/50 hover:bg-muted"
              >
                <Upload className="mb-4 size-12 text-on-surface-variant" />
                <p className="mb-2 text-sm font-medium">
                  Drag & drop file disini atau klik untuk memilih
                </p>
                <p className="text-xs text-on-surface-variant">
                  Format yang didukung: .xlsx, .xls, .csv (Maks. 10MB)
                </p>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                />
              </label>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 rounded-lg border bg-muted/50 p-4">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileSpreadsheet className="size-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-on-surface-variant">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={resetUpload}
                      className="text-on-surface-variant hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
                {isUploading && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Mengupload...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template File</CardTitle>
            <CardDescription>
              Download template untuk format yang benar
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="outline" className="justify-start">
              <FileSpreadsheet className="mr-2 size-4 text-success" />
              Template Excel (.xlsx)
              <Download className="ml-auto size-4" />
            </Button>
            <Button variant="outline" className="justify-start">
              <File className="mr-2 size-4 text-primary" />
              Template CSV (.csv)
              <Download className="ml-auto size-4" />
            </Button>
            <div className="mt-4 rounded-lg bg-muted p-4">
              <h4 className="mb-2 text-sm font-medium">Kolom yang diperlukan:</h4>
              <ul className="space-y-1 text-xs text-on-surface-variant">
                <li>- NIM (wajib)</li>
                <li>- Nama Lengkap (wajib)</li>
                <li>- Program Studi (wajib)</li>
                <li>- Angkatan (wajib)</li>
                <li>- Email</li>
                <li>- No. Telepon</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Data */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Data</CardTitle>
            <CardDescription>
              Periksa data sebelum melakukan import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="size-4" />
              <AlertTitle>Validasi Data</AlertTitle>
              <AlertDescription>
                Ditemukan 3 data valid, 1 error, dan 1 warning. Perbaiki error sebelum import.
              </AlertDescription>
            </Alert>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>NIM</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Program Studi</TableHead>
                    <TableHead>Angkatan</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {samplePreviewData.map((row, index) => (
                    <TableRow
                      key={index}
                      className={
                        row.status === "error"
                          ? "bg-destructive/5"
                          : row.status === "warning"
                          ? "bg-warning/5"
                          : ""
                      }
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-mono">{row.nim}</TableCell>
                      <TableCell>
                        {row.nama || (
                          <span className="text-destructive">Data kosong</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.prodi === "Invalid Prodi" ? (
                          <span className="text-warning-foreground">{row.prodi}</span>
                        ) : (
                          row.prodi
                        )}
                      </TableCell>
                      <TableCell>{row.angkatan}</TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-4 text-success" />
                  Valid: 3
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle className="size-4 text-warning" />
                  Warning: 1
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="size-4 text-destructive" />
                  Error: 1
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetUpload}>
                  Batal
                </Button>
                <Button>Import Data Valid</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Import</CardTitle>
          <CardDescription>
            Daftar import data yang pernah dilakukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama File</TableHead>
                  <TableHead>Total Data</TableHead>
                  <TableHead>Berhasil</TableHead>
                  <TableHead>Gagal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>2024-03-15 10:30</TableCell>
                  <TableCell>data_maba_2024.xlsx</TableCell>
                  <TableCell>150</TableCell>
                  <TableCell className="text-success">148</TableCell>
                  <TableCell className="text-destructive">2</TableCell>
                  <TableCell>
                    <Badge className="bg-success/10 text-success">Selesai</Badge>
                  </TableCell>
                  <TableCell>Admin Fakultas</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2024-03-10 14:20</TableCell>
                  <TableCell>update_status_mhs.csv</TableCell>
                  <TableCell>50</TableCell>
                  <TableCell className="text-success">50</TableCell>
                  <TableCell className="text-destructive">0</TableCell>
                  <TableCell>
                    <Badge className="bg-success/10 text-success">Selesai</Badge>
                  </TableCell>
                  <TableCell>Staff TU</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { GraduationCap, Pencil, Trash2, Plus, Save, Loader2, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/dialog"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card"
import { Input } from "./components/input"
import { Label } from "./components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/select"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"

export default function ProdiPage() {
  const [majors, setMajors] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)

  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [selectedProdiId, setSelectedProdiId] = useState(null)

  const [formData, setFormData] = useState({
    ID: null, FakultasID: "", Kode: "", Nama: "", Jenjang: "S1", Akreditasi: "B", Kapasitas: 100
  })

  const fetchMajors = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/faculty/courses')
      const json = await res.json()
      if (json.status === 'success') {
        setMajors(json.data)
      }
    } catch (err) {
      toast.error("Gagal mengambil data program studi")
    } finally {
      setLoading(false)
    }
  }

  const fetchFaculties = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/faculty/faculties')
      const json = await res.json()
      if (json.status === 'success') {
        setFaculties(json.data)
      }
    } catch (err) { }
  }

  useEffect(() => {
    fetchMajors()
    fetchFaculties()
  }, [])

  const handleOpenAdd = () => {
    setIsEditMode(false)
    setFormData({ ID: null, FakultasID: "", Kode: "", Nama: "", Jenjang: "S1", Akreditasi: "B", Kapasitas: 100 })
    setIsCrudOpen(true)
  }

  const handleOpenEdit = (prodi) => {
    setIsEditMode(true)
    setFormData({
      ID: prodi.ID, FakultasID: prodi.FakultasID.toString(), Kode: prodi.Kode || "", Nama: prodi.Nama, Jenjang: prodi.Jenjang || "S1", Akreditasi: prodi.Akreditasi || "B", Kapasitas: prodi.Kapasitas || 100
    })
    setIsCrudOpen(true)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    const url = isEditMode ? `http://localhost:8000/api/faculty/courses/${formData.ID}` : 'http://localhost:8000/api/faculty/courses'
    const method = isEditMode ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, FakultasID: parseInt(formData.FakultasID), Kapasitas: parseInt(formData.Kapasitas) })
      })

      const json = await res.json()
      if (res.ok && json.status === 'success') {
        toast.success(isEditMode ? "Prodi diperbarui" : "Prodi ditambahkan")
        setIsCrudOpen(false)
        fetchMajors()
      } else {
        let errorMsg = json.message || ""
        if (errorMsg.includes("Duplicate entry") || errorMsg.includes("unique constraint")) {
          errorMsg = "Kode Prodi atau Nama sudah digunakan."
        }

        const actionName = isEditMode ? "memperbarui prodi" : "menambah prodi"
        toast.error(`Gagal ${actionName}: ${errorMsg}`)
      }
    } catch (err) {
      const actionName = isEditMode ? "perbarui prodi" : "tambah prodi"
      toast.error(`Sistem sibuk: Gagal ${actionName}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProdiId) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`http://localhost:8000/api/faculty/courses/${selectedProdiId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.status === 'success') {
        toast.success("Program studi telah dihapus")
        setIsDelOpen(false)
        fetchMajors()
      }
    } catch (err) {
      toast.error("Gagal menghapus")
    } finally {
      setIsSubmitting(false)
    }
  }

  const statsData = [
    { label: 'Total Program Studi', value: majors.length, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Akreditasi Unggul/A', value: majors.filter(m => m.Akreditasi === 'Unggul' || m.Akreditasi === 'A').length, icon: Save, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { label: 'Total Kapasitas', value: majors.reduce((acc, m) => acc + (m.Kapasitas || 0), 0), icon: Plus, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500/10 to-indigo-500/5' },
  ]

  const columns = [
    {
      key: "Nama",
      label: "Program Studi",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 font-headline tracking-tight uppercase text-[13px]">{value}</span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">{row.Jenjang || 'S1'} — {row.Fakultas?.Nama || 'FAKULTAS'}</span>
        </div>
      ),
    },
    {
      key: "Akreditasi",
      label: "Akreditasi",
      className: "text-center",
      cellClassName: "text-center",
      render: (value) => (
        <Badge
          className={cn(
            "font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline uppercase",
            (value === 'A' || value === 'Unggul') ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
              (value === 'B' || value === 'Baik Sekali') ? "bg-blue-100 text-blue-700 ring-1 ring-blue-500/20" :
                "bg-slate-100 text-slate-700 ring-1 ring-slate-500/20"
          )}
        >
          {value || 'B'}
        </Badge>
      ),
    },
    {
      key: "CurrentMahasiswa",
      label: "Slot Kapasitas",
      className: "text-center",
      cellClassName: "text-center",
      render: (value, row) => (
        <div className="flex flex-col items-center">
          <span className="font-black text-slate-700 font-headline text-sm tracking-tight">{value || 0} <span className="text-slate-300 font-medium">/</span> {row.Kapasitas || 0}</span>
          <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.min(((value || 0) / (row.Kapasitas || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <GraduationCap className="size-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Master Program Studi</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Portal Akademik & Manajemen Kurikulum</p>
        </div>
      </div>

      <Card className="border-none shadow-sm flex flex-col overflow-hidden bg-white/50 backdrop-blur-md rounded-3xl">
        <CardContent className="p-0 font-headline">
          <DataTable
            columns={columns}
            data={majors}
            loading={loading}
            searchPlaceholder="Cari Nama Prodi atau Jenjang..."
            onAdd={handleOpenAdd}
            onSync={fetchMajors}
            addLabel="Registrasi Prodi"
            actions={(row) => (
              <div className="flex items-center gap-2">
                <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-9 w-9 hover:text-blue-600 rounded-xl hover:bg-blue-50">
                  <Pencil className="size-4" />
                </Button>
                <Button onClick={() => { setSelectedProdiId(row.ID); setIsDelOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 hover:text-rose-600 rounded-xl hover:bg-rose-50">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* CRUD MODAL */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <GraduationCap className="size-24 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                  {isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">
                  Academic Unit Registry
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                {isEditMode ? 'Update Program Studi' : 'Registrasi Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">
                Manajemen identitas & parameter akademik program studi fakultas.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Fakultas Naungan</Label>
                <Select value={formData.FakultasID} onValueChange={(val) => setFormData({ ...formData, FakultasID: val })}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold font-headline text-xs focus:bg-white transition-all">
                    <SelectValue placeholder="Pilih Instansi Fakultas" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                    {faculties.map(f => (
                      (f.ID !== undefined && f.ID !== null && f.ID !== "") && (
                        <SelectItem key={f.ID} value={String(f.ID)} className="rounded-xl font-bold text-[11px] p-3 focus:bg-primary/5 focus:text-primary uppercase font-headline">{f.Nama}</SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Akronim / Kode</Label>
                  <Input
                    value={formData.Kode}
                    onChange={(e) => setFormData({ ...formData, Kode: e.target.value.toUpperCase() })}
                    placeholder="E.G. TI, SI, MN..."
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline uppercase"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Jenjang Pendidikan</Label>
                  <Select value={formData.Jenjang} onValueChange={(val) => setFormData({ ...formData, Jenjang: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold font-headline text-xs focus:bg-white transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                      <SelectItem value="S1" className="rounded-xl font-bold text-[11px] p-3 uppercase font-headline">S1 - Sarjana</SelectItem>
                      <SelectItem value="D3" className="rounded-xl font-bold text-[11px] p-3 uppercase font-headline">D3 - Diploma</SelectItem>
                      <SelectItem value="S2" className="rounded-xl font-bold text-[11px] p-3 uppercase font-headline">S2 - Magister</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Lengkap Program Studi</Label>
                <Input
                  value={formData.Nama}
                  onChange={(e) => setFormData({ ...formData, Nama: e.target.value })}
                  placeholder="Masukkan nama resmi prodi..."
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Status Akreditasi</Label>
                  <Select value={formData.Akreditasi} onValueChange={(val) => setFormData({ ...formData, Akreditasi: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold font-headline text-xs focus:bg-white transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                      <SelectItem value="Unggul" className="rounded-xl font-bold text-[11px] p-3 focus:bg-emerald-50 text-emerald-600 font-headline">Unggul (Excellence)</SelectItem>
                      <SelectItem value="A" className="rounded-xl font-bold text-[11px] p-3 focus:bg-emerald-50 text-emerald-600 font-black font-headline">A</SelectItem>
                      <SelectItem value="B" className="rounded-xl font-bold text-[11px] p-3 font-black font-headline">B</SelectItem>
                      <SelectItem value="C" className="rounded-xl font-bold text-[11px] p-3 font-black text-rose-500 font-headline">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Kapasitas Slot (MHS)</Label>
                  <Input
                    type="number"
                    value={formData.Kapasitas}
                    onChange={(e) => setFormData({ ...formData, Kapasitas: e.target.value })}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-black font-headline text-center"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-200 -mx-8 px-8 bg-slate-50/30 rounded-b-[2rem]">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl font-headline">
                Batalkan
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 border-none font-headline">
                {isSubmitting ? (
                  <Loader2 className="animate-spin size-4 mr-3" />
                ) : (
                  <Save className="size-4 mr-3 stroke-[3px]" />
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] font-headline">{isEditMode ? 'Update Major' : 'Save Record'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Program Studi?"
        description="Menghapus basis program studi akan berdampak pada kurikulum dan data mahasiswa terkait di masa depan."
        loading={isSubmitting}
      />
    </div>
  )
}

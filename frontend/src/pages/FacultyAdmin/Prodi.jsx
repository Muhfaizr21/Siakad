"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { GraduationCap, Pencil, Trash2, Plus, Save, Loader2, CheckCircle2, Users } from "lucide-react"
import { Modal, ModalBody, ModalFooter, ModalBtn } from "./components/Modal"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card"
import { Input } from "./components/input"
import { Label } from "./components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/select"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

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

  // Stats for prodi
  const stats = [
    { label: 'Total Prodi', value: majors.length, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Akreditasi A', value: majors.filter(m => m.Akreditasi === 'Unggul' || m.Akreditasi === 'A').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Kapasitas', value: majors.reduce((acc, m) => acc + (m.Kapasitas || 0), 0), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

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

  const columns = [
    {
      key: "Nama",
      label: "Program Studi",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900 font-headline tracking-tighter uppercase text-[13px] leading-tight">{value}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{row.Jenjang || 'S1'} — {row.Fakultas?.Nama || 'FAKULTAS'}</span>
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
            "font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline uppercase tracking-widest",
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
      label: "Kapasitas",
      className: "text-right",
      cellClassName: "text-right",
      render: (value, row) => (
        <div className="flex flex-col items-end">
          <span className="font-black text-slate-700 font-headline text-sm tracking-tighter uppercase whitespace-nowrap">{value || 0} / {row.Kapasitas || 0} MHS</span>
          <div className="w-20 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
            <div
              className={cn("h-full", (value/row.Kapasitas > 0.9) ? "bg-rose-500" : "bg-primary")}
              style={{ width: `${Math.min(((value || 0) / (row.Kapasitas || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
      )
    }
  ]

  return (
    <PageContainer>
      <Toaster position="top-right" />
      
      <PageHeader
        icon={GraduationCap}
        title="Master Program Studi"
        description="Portal Akademik & Manajemen Kurikulum"
      />

      <ResponsiveGrid cols={3}>
        {stats.map((s, i) => (
          <ResponsiveCard key={i} className="flex flex-row items-center gap-5">
            <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}>
              <s.icon className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
              <h3 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">{loading ? '...' : s.value}</h3>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      <ResponsiveCard noPadding>
        <DataTable
          columns={columns}
          data={majors}
          loading={loading}
          onSync={fetchMajors}
          onAdd={handleOpenAdd}
          addLabel="Registrasi Prodi"
          searchPlaceholder="Cari Nama Prodi atau Jenjang..."
          actions={(row) => (
            <div className="flex items-center justify-end gap-2">
              <Button onClick={() => handleOpenEdit(row)} variant="outline" size="sm" className="h-9 px-3 border-slate-200 rounded-xl hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200">
                <Pencil className="size-3.5" />
              </Button>
              <Button onClick={() => { setSelectedProdiId(row.ID); setIsDelOpen(true); }} variant="outline" size="sm" className="h-9 px-3 border-slate-200 rounded-xl hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200">
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
        />
      </ResponsiveCard>

      {/* CRUD MODAL */}
      <Modal
        open={isCrudOpen}
        onClose={() => setIsCrudOpen(false)}
        title={isEditMode ? 'Update Program Studi' : 'Registrasi Baru'}
        subtitle="Manajemen identitas & parameter akademik program studi fakultas."
        icon={<GraduationCap size={18} />}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave}>
          <ModalBody>
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
          </ModalBody>

          <ModalFooter>
            <ModalBtn variant="ghost" type="button" onClick={() => setIsCrudOpen(false)}>
              Batalkan
            </ModalBtn>
            <ModalBtn type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                <Save size={14} className="stroke-[3px]" />
              )}
              <span className="uppercase tracking-[0.1em]">{isEditMode ? 'Update Major' : 'Save Record'}</span>
            </ModalBtn>
          </ModalFooter>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Program Studi?"
        description="Menghapus basis program studi akan berdampak pada kurikulum dan data mahasiswa terkait di masa depan."
        loading={isSubmitting}
      />
    </PageContainer>
  )
}

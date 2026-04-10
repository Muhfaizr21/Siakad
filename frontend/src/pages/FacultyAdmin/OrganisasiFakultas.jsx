"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { DataTable } from "./components/data-table"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import { Plus, Users2, Pencil, Trash2, CheckCircle2, ShieldCheck, Loader2, Save, X } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/dialog"
import { Input } from "./components/input"
import { Label } from "./components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/select"
import { cn } from "@/lib/utils"

export default function FacultyOrganisasi() {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState(null)

  const [formData, setFormData] = useState({
    kode_org: '', nama_org: '', ketua_nama: '', jumlah_anggota: 0, status: 'Aktif'
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/faculty/organizations')
      if (res.data.status === 'success') {
        setOrganizations(res.data.data)
      }
    } catch (error) {
      toast.error("Gagal mengambil data organisasi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingOrg) {
        await axios.put(`/api/faculty/organizations/${editingOrg.id}`, formData)
        toast.success("Organisasi diperbarui")
      } else {
        await axios.post('/api/faculty/organizations', formData)
        toast.success("Organisasi ditambahkan")
      }
      setShowModal(false)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedOrgId) return
    setIsSubmitting(true)
    try {
      await axios.delete(`/api/faculty/organizations/${selectedOrgId}`)
      toast.success("Organisasi dihapus")
      setIsDelOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Gagal menghapus")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (org) => {
    setEditingOrg(org)
    setFormData({
      kode_org: org.kode_org,
      nama_org: org.nama_org,
      ketua_nama: org.ketua_nama,
      jumlah_anggota: org.jumlah_anggota,
      status: org.status
    })
    setShowModal(true)
  }

  const columns = [
    {
      key: "kode_org",
      label: "Kode",
      render: (val) => <span className="font-mono font-black text-primary text-[11px] tracking-widest leading-none uppercase text-left">{val}</span>
    },
    {
      key: "nama_org",
      label: "Nama Organisasi",
      render: (val) => <span className="font-bold text-slate-900 font-headline uppercase text-[12px] tracking-tight">{val}</span>
    },
    {
      key: "ketua_nama",
      label: "Ketua Umum",
      render: (val) => (
        <div className="flex items-center gap-3 text-left">
          <div className="size-8 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-800 border-2 border-white shadow-sm ring-1 ring-slate-100 uppercase">
            {val?.charAt(0)}
          </div>
          <span className="text-[11px] font-bold text-slate-600 uppercase font-headline">{val}</span>
        </div>
      )
    },
    {
      key: "jumlah_anggota",
      label: "Anggota",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => <span className="font-black text-slate-800 font-headline text-[13px]">{val} <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest ml-1">AKTIF</span></span>
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline uppercase",
            val === 'Aktif' ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
              "bg-slate-100 text-slate-700 ring-1 ring-slate-500/20"
          )}
        >
          {val}
        </Badge>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Users2 className="size-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">Organisasi Fakultas</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Master Data & Legalitas ORMAWA</p>
        </div>
      </div>

      <Card className="border-none shadow-sm h-full overflow-hidden bg-white/50 backdrop-blur-md rounded-3xl">
        <CardContent className="p-0 font-headline">
          <DataTable
            columns={columns}
            data={organizations}
            loading={loading}
            searchPlaceholder="Cari Nama atau Kode..."
            onAdd={() => { setEditingOrg(null); setFormData({ kode_org: '', nama_org: '', ketua_nama: '', jumlah_anggota: 0, status: 'Aktif' }); setShowModal(true); }}
            addLabel="Tambah ORMAWA"
            actions={(row) => (
              <div className="flex items-center gap-2">
                <Button onClick={() => openEdit(row)} variant="ghost" size="icon" className="h-9 w-9 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-all">
                  <Pencil className="size-4" />
                </Button>
                <Button onClick={() => { setSelectedOrgId(row.id); setIsDelOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all text-slate-400">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Modal Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl font-headline">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Users2 className="size-24 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col items-start translate-x-0.5">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                  {editingOrg ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">
                  ORMAWA Registry
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                {editingOrg ? 'Update Organisasi' : 'Registrasi Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1 uppercase leading-none">
                Manajemen identitas & legalitas organisasi mahasiswa fakultas.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Kode Akronim</Label>
                  <Input
                    value={formData.kode_org}
                    onChange={(e) => setFormData({ ...formData, kode_org: e.target.value.toUpperCase() })}
                    placeholder="E.G. BEM-FT"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-black text-sm font-headline uppercase tracking-widest"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Status Operasional</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-black font-headline text-[11px] px-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                      <SelectItem value="Aktif" className="rounded-xl font-bold text-[11px] p-3 focus:bg-emerald-50 text-emerald-600 uppercase font-headline">Aktif (Active)</SelectItem>
                      <SelectItem value="Pembekuan" className="rounded-xl font-bold text-[11px] p-3 focus:bg-rose-50 text-rose-600 uppercase font-headline">Pembekuan (Frozen)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Panjang Organisasi</Label>
                <Input
                  value={formData.nama_org}
                  onChange={(e) => setFormData({ ...formData, nama_org: e.target.value })}
                  placeholder="Masukkan nama resmi organisasi secara lengkap..."
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline uppercase italic"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Ketua Umum</Label>
                  <Input
                    value={formData.ketua_nama}
                    onChange={(e) => setFormData({ ...formData, ketua_nama: e.target.value })}
                    placeholder="Entry Nama Ketua..."
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline uppercase"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Jumlah Anggota</Label>
                  <Input
                    type="number"
                    value={formData.jumlah_anggota}
                    onChange={(e) => setFormData({ ...formData, jumlah_anggota: parseInt(e.target.value) })}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-black font-headline text-center"
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30 rounded-b-[2rem]">
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl transition-all font-headline">
                Batalkan
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 border-none font-headline">
                {isSubmitting ? (
                  <Loader2 className="animate-spin size-4 mr-3" />
                ) : (
                  <Save className="size-4 mr-3 stroke-[3px]" />
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{editingOrg ? 'Update Data' : 'Submit Data'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Data ORMAWA?"
        description="Eksistensi organisasi ini akan dihapus dari record resmi fakultas. Pastikan seluruh laporan pertanggungjawaban telah diarsipkan."
        loading={isSubmitting}
      />
    </div>
  )
}

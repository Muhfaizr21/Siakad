"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { DataTable } from "./components/data-table"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import { toast, Toaster } from 'react-hot-toast'
import { RefreshCw, CheckCircle2, Trash2, ShieldCheck, ExternalLink, Loader2, Save, FileText, Mail } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/dialog"
import { Input } from "./components/input"
import { Label } from "./components/label"
import { Textarea } from "./components/textarea"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/select"

export default function FacultyPersuratan() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)

  const [adminData, setAdminData] = useState({
    status: 'diproses',
    catatan_admin: '',
    file_url: ''
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8000/api/faculty/surat')
      if (response.data.status === 'success') {
        setRequests(response.data.data)
      }
    } catch (error) {
      toast.error('Gagal mengambil data pengajuan surat')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true)
    try {
      const response = await axios.put(`http://localhost:8000/api/faculty/surat/${selectedItem.id}`, adminData)
      if (response.data.status === 'success') {
        toast.success('Status surat diperbarui')
        setShowModal(false)
        fetchRequests()
      }
    } catch (error) {
      toast.error('Gagal memperbarui data')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem?.id) return
    setIsSubmitting(true)
    try {
      const response = await axios.delete(`http://localhost:8000/api/faculty/surat/${selectedItem.id}`)
      if (response.data.status === 'success') {
        toast.success('Pengajuan dihapus')
        setIsDelOpen(false)
        fetchRequests()
      }
    } catch (error) {
      toast.error('Gagal menghapus data')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: "id",
      label: "ID & Tanggal",
      render: (v, row) => (
        <div className="flex flex-col leading-tight text-left">
          <span className="font-mono text-primary font-black text-[11px] tracking-widest leading-none">#SRT-{v}</span>
          <span className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-tight font-headline">
            {new Date(row.created_at).toLocaleDateString('id-ID')}
          </span>
        </div>
      )
    },
    {
      key: "mahasiswa",
      label: "Identitas Pengusul",
      render: (v) => (
        <div className="flex items-center gap-3 text-left">
          <div className="size-9 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[10px] uppercase text-slate-800 border-2 border-white shadow-sm ring-1 ring-slate-100">
            {v?.nama_mahasiswa?.charAt(0) || '?'}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-900 font-headline tracking-tighter uppercase text-[13px]">{v?.nama_mahasiswa || 'Anonim'}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{v?.nim || '-'}</span>
          </div>
        </div>
      )
    },
    {
      key: "jenis_surat",
      label: "Klasifikasi Surat",
      render: (v, row) => (
        <div className="flex flex-col leading-tight text-left">
          <span className="font-black text-slate-900 font-headline text-[12px] uppercase tracking-tight">{v}</span>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide line-clamp-1 mt-0.5">"{row.keperluan}"</p>
        </div>
      )
    },
    {
      key: "status",
      label: "Status Progress",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => (
        <Badge
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline uppercase",
            val === 'selesai' ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
            val === 'ditolak' ? "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20" :
            val === 'diproses' ? "bg-blue-100 text-blue-700 ring-1 ring-blue-500/20" :
            val === 'siap_ambil' ? "bg-sky-100 text-sky-700 ring-1 ring-sky-500/20" :
            "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20"
          )}
        >
          {val?.replace('_', ' ')}
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
              <Mail className="size-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">E-Persuratan</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 bg-primary rounded-full" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Antrean & Monitoring Dokumen Digital</p>
          </div>
        </div>

      <Card className="border-none shadow-sm flex flex-col overflow-hidden bg-white/50 backdrop-blur-md rounded-3xl">
        <CardContent className="p-0 text-slate-600 font-headline">
          <DataTable
            columns={columns}
            data={requests}
            loading={loading}
            searchPlaceholder="Cari NIM, Nama, atau Jenis Surat..."
            onSync={fetchRequests}
            syncLabel="Refresh Data"
            onExport={() => alert("Ekspor Rekap Persuratan...")}
            exportLabel="Download Rekap"
            filters={[
              {
                key: 'status',
                placeholder: 'Filter Status',
                options: [
                  { label: 'Antrean', value: 'diajukan' },
                  { label: 'Proses', value: 'diproses' },
                  { label: 'Siap Ambil', value: 'siap_ambil' },
                  { label: 'Selesai', value: 'selesai' },
                  { label: 'Ditolak', value: 'ditolak' },
                ]
              }
            ]}
            actions={(row) => (
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => { setSelectedItem(row); setAdminData({ status: row.status, catatan_admin: row.catatan_admin || '', file_url: row.file_url || '' }); setShowModal(true); }}
                  variant="ghost" size="icon" className="h-9 w-9 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                >
                  <ShieldCheck className="size-4 stroke-[2.5px]" />
                </Button>
                <Button
                  onClick={() => { setSelectedItem(row); setIsDelOpen(true); }}
                  variant="ghost" size="icon" className="h-9 w-9 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-slate-400"
                >
                  <Trash2 className="size-4 stroke-[2.5px]" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden text-left">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck className="size-24 rotate-12" />
             </div>
             <div className="relative z-10 flex flex-col items-start translate-x-0.5">
                <div className="flex items-center gap-3 mb-2">
                   <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                      <ShieldCheck className="size-4" />
                   </div>
                   <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none font-headline">
                      Verification Panel
                   </Badge>
                </div>
                <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                   Verifikasi & Keputusan
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-400 mt-1 uppercase leading-none font-headline">
                   Otorisasi dokumen & pembaruan status progress administratif.
                </DialogDescription>
             </div>
          </DialogHeader>

          <div className="p-8 pt-6 space-y-6">
            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 relative group overflow-hidden shadow-inner">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative z-10 space-y-2 font-headline">
                  <div className="flex items-center gap-2">
                     <FileText className="size-3.5 text-primary" />
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none">Detail Permohonan</p>
                  </div>
                  <h4 className="font-bold text-slate-900 font-headline text-lg tracking-tight leading-none uppercase">{selectedItem?.jenis_surat}</h4>
                  <p className="text-[11px] font-bold text-slate-500 italic mt-3 bg-white/80 p-4 rounded-2xl border border-white shadow-sm uppercase">"{selectedItem?.keperluan}"</p>
               </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Status Progress Terkini</Label>
                <Select
                  value={adminData.status}
                  onValueChange={(val) => setAdminData({ ...adminData, status: val })}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-black font-headline text-[11px] focus:ring-4 focus:ring-primary/5 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                    <SelectItem value="diajukan" className="rounded-xl font-bold text-[11px] p-3 focus:bg-primary/5 focus:text-primary uppercase font-headline">Diterima (Antrean)</SelectItem>
                    <SelectItem value="diproses" className="rounded-xl font-bold text-[11px] p-3 focus:bg-primary/5 focus:text-primary uppercase font-headline">Sedang Diproses</SelectItem>
                    <SelectItem value="siap_ambil" className="rounded-xl font-bold text-[11px] p-3 focus:bg-primary/5 focus:text-primary uppercase font-headline">Siap Diambil (Fisik)</SelectItem>
                    <SelectItem value="selesai" className="rounded-xl font-bold text-[11px] p-3 focus:bg-emerald-50 text-emerald-600 uppercase font-headline">Selesai (Digital Terbit)</SelectItem>
                    <SelectItem value="ditolak" className="rounded-xl font-bold text-[11px] p-3 focus:bg-rose-50 text-rose-600 uppercase font-headline">Tolak Pengajuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Lampiran Digital (Cloud storage)</Label>
                <div className="relative group">
                  <Input
                    value={adminData.file_url}
                    onChange={(e) => setAdminData({ ...adminData, file_url: e.target.value })}
                    className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-black font-headline text-[11px] pr-12 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                    placeholder="https://drive.google.com/..."
                  />
                  <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Feedback Administratif</Label>
                <Textarea
                  value={adminData.catatan_admin}
                  onChange={(e) => setAdminData({ ...adminData, catatan_admin: e.target.value })}
                  className="min-h-[100px] rounded-[1.5rem] border-slate-100 bg-slate-50/50 font-black text-[11px] p-4 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all uppercase"
                  placeholder="Informasikan detail pengambilan atau alasan penolakan..."
                />
              </div>

              <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30 rounded-b-[2rem]">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl font-headline transition-all">
                   Tutup
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 border-none font-headline">
                  {isSubmitting ? (
                    <Loader2 className="animate-spin size-4 mr-3" />
                  ) : (
                    <CheckCircle2 className="size-4 mr-3 stroke-[3px]" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-[0.15em]">Verifikasi & Simpan</span>
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Permohonan Surat?"
        description="Data permohonan surat akan dihapus permanen dari antrean administratif fakultas."
        loading={isSubmitting}
      />
    </div>
  )
}

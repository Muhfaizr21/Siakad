"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { toast, Toaster } from 'react-hot-toast'
import { RefreshCw, Reply, Trash2, X, MessageSquare, CheckCircle2, Clock, AlertCircle, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/dialog"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import { Textarea } from "./components/textarea"
import { Label } from "./components/label"
import { DataTable } from "./components/data-table"
import { cn } from "@/lib/utils"

const FacultyAspirationManagement = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [aspirations, setAspirations] = useState([])
  const [loading, setLoading] = useState(true)
  const [adminResponse, setAdminResponse] = useState('')
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchAspirations()
  }, [])

  const fetchAspirations = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8000/api/faculty/aspirasi')
      if (response.data.status === 'success') {
        setAspirations(response.data.data)
      }
    } catch (error) {
      toast.error('Gagal mengambil data aspirasi')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (status) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/faculty/aspirasi/${selectedItem.id}`, {
        status,
        tanggapan: adminResponse
      })
      if (response.data.status === 'success') {
        toast.success('Aspirasi berhasil diperbarui')
        setIsModalOpen(false)
        setAdminResponse('')
        fetchAspirations()
      }
    } catch (error) {
      toast.error('Gagal memperbarui status')
    }
  }

  const handleDelete = async () => {
    if (!selectedItem?.id) return
    setIsSubmitting(true)
    try {
      const response = await axios.delete(`http://localhost:8000/api/faculty/aspirasi/${selectedItem.id}`)
      if (response.data.status === 'success') {
        toast.success('Aspirasi dihapus')
        setIsDelOpen(false)
        fetchAspirations()
      }
    } catch (error) {
      toast.error('Gagal menghapus aspirasi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredAspirations = activeTab === 'all'
    ? (aspirations || [])
    : (aspirations || []).filter(a => a.status === activeTab)

  const statsData = [
    { label: 'Total Masuk', value: (aspirations || []).length, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Selesai', value: (aspirations || []).filter(a => a.status === 'selesai').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { label: 'Dalam Proses', value: (aspirations || []).filter(a => a.status === 'proses').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5' },
    { label: 'Klarifikasi', value: (aspirations || []).filter(a => a.status === 'klarifikasi').length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', gradient: 'from-rose-500/10 to-rose-500/5' },
  ]

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-1.5 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <MessageSquare className="size-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">Manajemen Aspirasi</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Pusat Keluhan & Saran Mahasiswa</p>
        </div>
      </div>


      <div className="flex items-center justify-between">
        <div className="flex p-1.5 bg-white border border-slate-200/60 rounded-2xl shadow-sm w-fit gap-1">
          {['all', 'proses', 'klarifikasi', 'selesai', 'ditolak'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-0.5' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-none shadow-sm mt-4 overflow-hidden rounded-3xl bg-white">
        <CardContent className="p-0 font-headline">
          <DataTable
            columns={[{
              key: "student",
              label: "Mahasiswa",
              render: (val) => (
                <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[10px] uppercase text-slate-800 font-headline shadow-inner border border-white">
                        {val?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="font-bold text-slate-900 font-headline tracking-tighter uppercase text-[13px]">{val?.nama_mahasiswa || 'Anonim'}</span>
                        <span className="text-[10px] text-slate-400 font-headline font-bold uppercase tracking-widest mt-0.5">{val?.nim || '-'}</span>
                    </div>
                </div>
              )
            }, {
              key: "judul",
              label: "Aspirasi & Keluhan",
              render: (val, row) => (
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[9px] font-black text-blue-600 font-headline uppercase tracking-widest w-fit px-2 py-0.5 bg-blue-50/50 rounded-md border border-blue-100/30">{row.category || 'Umum'}</span>
                  <span className="font-bold text-slate-900 text-xs font-headline line-clamp-1 uppercase tracking-tight">{val}</span>
                </div>
              )
            }, {
              key: "isi",
              label: "Informasi",
              render: (val) => <p className="text-[11px] text-slate-500 line-clamp-1 italic font-bold font-headline max-w-[250px] uppercase">"{val}"</p>
            }, {
              key: "status",
              label: "Status",
              className: "text-center",
              cellClassName: "text-center",
              render: (val) => (
                <Badge
                  className={cn(
                    "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline",
                    val === 'selesai' ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
                    val === 'ditolak' ? "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20" :
                    val === 'klarifikasi' ? "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20" :
                    val === 'proses' ? "bg-blue-100 text-blue-700 ring-1 ring-blue-500/20" :
                    "bg-slate-100 text-slate-700 ring-1 ring-slate-500/20"
                  )}
                >
                  {val || 'Pending'}
                </Badge>
              )
            }]}
            data={aspirations}
            loading={loading}
            searchPlaceholder="Cari Pengirim atau Judul..."
            onSync={fetchAspirations}
            syncLabel="Refresh Data"
            filters={[
              {
                key: 'status',
                placeholder: 'Filter Status',
                options: [
                  { label: 'Proses', value: 'proses' },
                  { label: 'Klarifikasi', value: 'klarifikasi' },
                  { label: 'Selesai', value: 'selesai' },
                  { label: 'Ditolak', value: 'ditolak' },
                ]
              }
            ]}
            actions={(row) => (
              <div className="flex items-center gap-1">
                <Button onClick={() => { setSelectedItem(row); setAdminResponse(row.response || ''); setIsModalOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all">
                  <Reply className="size-4" />
                </Button>
                <Button onClick={() => { setSelectedItem(row); setIsDelOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all text-slate-400">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <MessageSquare className="size-24 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col items-start translate-x-0.5">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Reply className="size-4" />
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-blue-50 text-blue-600 border-none font-headline">
                  {selectedItem?.category || 'Umum'}
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                Tanggapi Aspirasi
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1 font-headline uppercase leading-none">
                Update status dan kirim tanggapan resmi fakultas.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-8 pt-6 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 relative group overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-100" />
              <div className="relative z-10 space-y-3 font-headline">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Keluhan Utama</p>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{selectedItem && new Date(selectedItem.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 font-headline text-lg tracking-tight leading-snug uppercase">{selectedItem?.judul}</h4>
                  <p className="text-[11px] font-bold text-slate-500 italic mt-3 leading-relaxed bg-white/80 p-4 rounded-2xl border border-white shadow-sm uppercase">"{selectedItem?.isi}"</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Respon Resmi Fakultas</Label>
              <Textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="min-h-[120px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-xs p-4 leading-relaxed uppercase"
                placeholder="Tuliskan tanggapan Anda di sini secara informatif..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handleUpdateStatus('proses')} variant="outline" className="h-16 flex-col gap-1 rounded-2xl border-blue-100 bg-blue-50/10 hover:bg-blue-50 text-blue-700 transition-all hover:scale-[1.02] active:scale-95 group border-none font-headline">
                <Clock className="size-4 group-hover:rotate-12 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Diproses</span>
              </Button>
              <Button onClick={() => handleUpdateStatus('klarifikasi')} variant="outline" className="h-16 flex-col gap-1 rounded-2xl border-amber-100 bg-amber-50/10 hover:bg-amber-50 text-amber-700 transition-all hover:scale-[1.02] active:scale-95 group border-none font-headline">
                <MessageSquare className="size-4 group-hover:rotate-12 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Klarifikasi</span>
              </Button>
              <Button onClick={() => handleUpdateStatus('selesai')} variant="outline" className="h-16 flex-col gap-1 rounded-2xl border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50 text-emerald-700 transition-all hover:scale-[1.02] active:scale-95 group border-none font-headline">
                <CheckCircle2 className="size-4 group-hover:scale-125 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Selesaikan</span>
              </Button>
              <Button onClick={() => handleUpdateStatus('ditolak')} variant="outline" className="h-16 flex-col gap-1 rounded-2xl border-rose-100 bg-rose-50/10 hover:bg-rose-50 text-rose-700 transition-all hover:scale-[1.02] active:scale-95 group border-none font-headline">
                <AlertCircle className="size-4 group-hover:rotate-12 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Tolak</span>
              </Button>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end -mx-8 px-8 bg-slate-50/30 border-t border-slate-100 rounded-b-[2rem]">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-10 h-14 rounded-2xl transition-all font-headline">
                Batalkan Penanganan
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Aspirasi?"
        description="Aspirasi atau keluhan mahasiswa akan dihapus secara permanen dari basis data fakultas."
        loading={isSubmitting}
      />
    </div>
  )
}

export default FacultyAspirationManagement

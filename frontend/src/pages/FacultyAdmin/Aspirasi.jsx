"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { toast, Toaster } from 'react-hot-toast'
import { RefreshCw, Reply, Archive, X, MessageSquare, CheckCircle2, Clock, AlertCircle, Search, User } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/dialog"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import { Textarea } from "./components/textarea"
import { Label } from "./components/label"
import { DataTable } from "./components/data-table"
import { cn } from "@/lib/utils"

const FacultyAspirationManagement = () => {
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
      const response = await axios.put(`http://localhost:8000/api/faculty/aspirasi/${selectedItem.ID}`, {
        Status: status,
        tanggapan: adminResponse
      })
      if (response.data.status === 'success') {
        toast.success('Aspirasi berhasil diperbarui')
        setIsModalOpen(false)
        setAdminResponse('')
        fetchAspirations()
      } else {
        toast.error(`Gagal perbarui status: ${response.data.message || 'Error tidak diketahui'}`)
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Gangguan koneksi'
      toast.error(`Gagal perbarui status: ${msg}`)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem?.ID) return
    setIsSubmitting(true)
    try {
      const response = await axios.delete(`http://localhost:8000/api/faculty/aspirasi/${selectedItem.ID}`)
      if (response.data.status === 'success') {
        toast.success('Aspirasi diarsipkan')
        setIsDelOpen(false)
        fetchAspirations()
      } else {
        toast.error(`Gagal arsipkan: ${response.data.message || 'Response gagal'}`)
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Server sibuk'
      toast.error(`Gagal arsipkan aspirasi: ${msg}`)
    } finally {
      setIsSubmitting(false)
    }
  }



  const statsData = [
    { label: 'Total Masuk', value: (aspirations || []).length, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Selesai', value: (aspirations || []).filter(a => a.Status === 'selesai').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { label: 'Dalam Proses', value: (aspirations || []).filter(a => a.Status === 'proses').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5' },
    { label: 'Klarifikasi', value: (aspirations || []).filter(a => a.Status === 'klarifikasi').length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', gradient: 'from-rose-500/10 to-rose-500/5' },
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


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2">
        {statsData.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden rounded-3xl group hover:shadow-md transition-all duration-500 bg-white">
            <CardContent className="p-0">
              <div className={cn("p-6 flex items-start justify-between relative overflow-hidden", stat.bg)}>
                <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br -mr-16 -mt-16 rounded-full opacity-20 transition-transform duration-700 group-hover:scale-110", stat.gradient)} />
                <div className="relative z-10 flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 font-headline">{stat.label}</span>
                  <div className="flex items-baseline gap-2">
                    <span className={cn("text-3xl font-black font-headline tracking-tighter", stat.color)}>{stat.value.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Record</span>
                  </div>
                </div>
                <div className={cn("relative z-10 p-3 rounded-2xl shadow-sm bg-white/50 backdrop-blur-sm border border-white/50", stat.color)}>
                  <stat.icon className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


      <Card className="border-none shadow-sm mt-4 overflow-hidden rounded-3xl bg-white">
        <CardContent className="p-0 font-headline">
          <DataTable
            columns={[{
              key: "Mahasiswa",
              label: "Mahasiswa",
              render: (val) => (
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[10px] uppercase text-slate-800 font-headline shadow-inner border border-white">
                    {val?.Nama?.charAt(0) || '?'}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-slate-900 font-headline tracking-tighter uppercase text-[13px]">{val?.Nama || 'Anonim'}</span>
                    <span className="text-[10px] text-slate-400 font-headline font-bold uppercase tracking-widest mt-0.5">{val?.NIM || '-'}</span>
                  </div>
                </div>
              )
            }, {
              key: "Judul",
              label: "Aspirasi & Keluhan",
              render: (val, row) => (
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[9px] font-black text-blue-600 font-headline uppercase tracking-widest w-fit px-2 py-0.5 bg-blue-50/50 rounded-md border border-blue-100/30">{row.Kategori || 'Umum'}</span>
                  <span className="font-bold text-slate-900 text-xs font-headline line-clamp-1 uppercase tracking-tight">{val}</span>
                </div>
              )
            }, {
              key: "Isi",
              label: "Informasi",
              render: (val) => <p className="text-[11px] text-slate-500 line-clamp-1 italic font-bold font-headline max-w-[250px] uppercase">"{val}"</p>
            }, {
              key: "Status",
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
                key: 'Status',
                placeholder: 'Filter Status...',
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
                <Button onClick={() => { setSelectedItem(row); setIsDelOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-all text-slate-400" title="Arsipkan">
                  <Archive className="size-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white font-headline">
          {selectedItem && (
            <div className="relative flex flex-col h-[85vh]">
              {/* Premium Header */}
              <div className="h-40 bg-slate-900 relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 opacity-95" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />

                <div className="absolute inset-y-0 left-12 flex items-center gap-6">
                  <div className="relative group">
                    <div className="size-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center font-black text-2xl text-white shadow-2xl transition-transform group-hover:scale-105">
                      {selectedItem.Mahasiswa?.Nama?.charAt(0) || '?'}
                    </div>
                    <div className="absolute -bottom-2 -right-2 size-8 bg-blue-500 rounded-xl border-2 border-slate-900 flex items-center justify-center text-white shadow-lg">
                      <Reply className="size-4" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 text-white">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500/20 text-blue-400 border-none px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase">
                        {selectedItem.Kategori || 'UMUM'}
                      </Badge>
                      <div className="h-3 w-px bg-white/10" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Aspiration ID: {selectedItem.ID?.toString().padStart(6, '0')}</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter leading-none uppercase max-w-[500px] truncate">
                      {selectedItem.Judul}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-2">
                        <User className="size-3 text-white/40" />
                        <span className="text-[11px] font-bold text-white/80 uppercase tracking-tight">{selectedItem.Mahasiswa?.Nama}</span>
                      </div>
                      <div className="size-1 rounded-full bg-white/10" />
                      <span className="text-[11px] font-bold text-white/40 uppercase tracking-tight">{selectedItem.Mahasiswa?.NIM}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
                  <X className="size-6" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/10">
                <div className="p-10 space-y-10">
                  {/* Summary Card */}
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:rotate-12 transition-transform duration-700">
                      <MessageSquare className="size-40 text-slate-900" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="size-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Keluhan & Aspirasi</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          {new Date(selectedItem.CreatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[14px] font-bold text-slate-600 leading-relaxed italic bg-slate-50 p-8 rounded-[2rem] border border-slate-100 font-headline uppercase">
                        "{selectedItem.Isi}"
                      </p>
                    </div>
                  </div>

                  {/* Response Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <Reply className="size-5 text-primary" />
                        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Respon Resmi Fakultas</h3>
                      </div>
                      {selectedItem.Status && (
                        <Badge className={cn(
                          "capitalize font-black text-[9px] px-3 py-1 border-none tracking-widest",
                          selectedItem.Status === 'selesai' ? "bg-emerald-50 text-emerald-600" :
                            selectedItem.Status === 'proses' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"
                        )}>
                          Current Status: {selectedItem.Status}
                        </Badge>
                      )}
                    </div>
                    <Textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      className="min-h-[160px] rounded-[2rem] border-slate-100 bg-white focus:bg-white shadow-sm ring-1 ring-slate-100 focus:ring-primary/20 transition-all font-bold text-[13px] p-8 leading-relaxed placeholder:text-slate-300 placeholder:italic uppercase"
                      placeholder="Berikan tanggapan resmi fakultas yang informatif dan solutif..."
                    />
                  </div>

                  {/* Action Grid */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 px-2">
                      <div className="size-1.5 rounded-full bg-slate-300" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Pilih Status Penanganan Baru:</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatusButton
                        onClick={handleUpdateStatus}
                        status="proses"
                        icon={<Clock />}
                        label="PROSES"
                        color="blue"
                      />
                      <StatusButton
                        onClick={handleUpdateStatus}
                        status="klarifikasi"
                        icon={<MessageSquare />}
                        label="KLARIFIKASI"
                        color="amber"
                      />
                      <StatusButton
                        onClick={handleUpdateStatus}
                        status="selesai"
                        icon={<CheckCircle2 />}
                        label="SELESAIKAN"
                        color="emerald"
                      />
                      <StatusButton
                        onClick={handleUpdateStatus}
                        status="ditolak"
                        icon={<AlertCircle />}
                        label="TOLAK"
                        color="rose"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-8 px-10 flex items-center justify-between border-t border-slate-100 shrink-0 bg-white">
                <div className="flex items-center gap-4">
                  <div className="size-9 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <Reply className="size-5" />
                  </div>
                  <div className="flex flex-col leading-none gap-1">
                    <span className="text-[11px] font-black uppercase text-slate-900 tracking-tight">E-Aspiration System</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Faculty Official Record Portal</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl font-headline">
                    BATALKAN
                  </Button>
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    className="text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-2xl shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 font-headline"
                  >
                    TUTUP PENANGANAN
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Arsipkan Aspirasi?"
        description="Aspirasi akan diarsipkan dan tidak lagi tampil di daftar aktif. Data tidak dihapus permanen."
        loading={isSubmitting}
      />
    </div>
  )
}

const StatusButton = ({ onClick, status, icon, label, color }) => {
  const colorMap = {
    blue: "text-blue-700 bg-blue-50/50 hover:bg-blue-100 ring-blue-200/50",
    amber: "text-amber-700 bg-amber-50/50 hover:bg-amber-100 ring-amber-200/50",
    emerald: "text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 ring-emerald-200/50",
    rose: "text-rose-700 bg-rose-50/50 hover:bg-rose-100 ring-rose-200/50",
  }

  return (
    <Button
      onClick={() => onClick(status)}
      variant="outline"
      className={cn(
        "h-20 flex flex-col items-center justify-center gap-2 rounded-2xl border-none ring-1 transition-all hover:scale-[1.05] active:scale-95 group font-headline shadow-sm",
        colorMap[color]
      )}
    >
      <div className="p-1.5 rounded-lg bg-white/80 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { className: "size-4" })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </Button>
  )
}

export default FacultyAspirationManagement

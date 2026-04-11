"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { toast, Toaster } from 'react-hot-toast'
import { RefreshCw, Reply, MessageSquare, CheckCircle2, Clock, AlertCircle, X, User } from 'lucide-react'
import { Modal, ModalBody, ModalFooter, ModalBtn } from "./components/Modal"


import { Textarea } from "./components/textarea"
import { Label } from "./components/label"
import { DataTable } from "./components/data-table"
import { cn } from "@/lib/utils"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

const FacultyAspirationManagement = () => {
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [aspirations, setAspirations] = useState([])
  const [loading, setLoading] = useState(true)
  const [adminResponse, setAdminResponse] = useState('')
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


  const statsData = [
    { label: 'Total Masuk', value: (aspirations || []).length, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Selesai', value: (aspirations || []).filter(a => (a.Status || '').toLowerCase() === 'selesai').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { label: 'Dalam Proses', value: (aspirations || []).filter(a => (a.Status || '').toLowerCase() === 'proses').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5' },
    { label: 'Klarifikasi', value: (aspirations || []).filter(a => (a.Status || '').toLowerCase() === 'klarifikasi').length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', gradient: 'from-rose-500/10 to-rose-500/5' },
  ]

  return (
    <PageContainer>
      <Toaster position="top-right" />

      <PageHeader
        icon={MessageSquare}
        title="Manajemen Aspirasi"
        description="Pusat Keluhan & Saran Mahasiswa"
      />

      <ResponsiveGrid cols={4}>
        {statsData.map((stat, i) => (
          <ResponsiveCard key={i} className="relative group p-0 min-h-[120px]">
            <div className={cn("p-6 flex items-start justify-between relative overflow-hidden h-full rounded-[2rem]", stat.bg)}>
              <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br -mr-16 -mt-16 rounded-full opacity-20 transition-transform duration-700 group-hover:scale-110", stat.gradient)} />
              <div className="relative z-10 flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2rem] mb-1 font-headline">{stat.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-3xl font-black font-headline tracking-tighter uppercase", stat.color)}>{loading ? '...' : stat.value.toLocaleString()}</span>
                </div>
              </div>
              <div className={cn("relative z-10 p-3 rounded-2xl shadow-sm bg-white/50 backdrop-blur-sm border border-white/50 group-hover:rotate-12 transition-transform duration-500", stat.color)}>
                <stat.icon className="size-5" />
              </div>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      <ResponsiveCard noPadding>
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
                  <span className="font-black text-slate-900 font-headline tracking-tighter uppercase text-[13px]">{val?.Nama || 'Anonim'}</span>
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
            render: (val) => {
              const s = (val || 'terbuka').toLowerCase();
              const config =
                s === 'selesai' ? { label: 'SELESAI', class: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" } :
                  s === 'ditolak' ? { label: 'DITOLAK', class: "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20" } :
                    s === 'klarifikasi' ? { label: 'KLARIFIKASI', class: "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20" } :
                      s === 'proses' ? { label: 'PROSES', class: "bg-blue-100 text-blue-700 ring-1 ring-blue-500/20" } :
                        { label: 'TERBUKA', class: "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20 shadow-inner" };

              return (
                <Badge className={cn("capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline uppercase", config.class)}>
                  {config.label}
                </Badge>
              );
            }
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
            <div className="flex items-center justify-end gap-1">
              <Button onClick={() => { setSelectedItem(row); setAdminResponse(row.response || ''); setIsModalOpen(true); }} variant="outline" size="icon" className="h-9 w-9 border-slate-200 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                <Reply className="size-4" />
              </Button>
            </div>
          )}
        />
      </ResponsiveCard>
      {/* Response Dialog */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem?.Mahasiswa?.Nama || 'Student Voice'}
        subtitle={`NIM: ${selectedItem?.Mahasiswa?.NIM || '-'} • ${selectedItem?.Kategori || 'General'}`}
        icon={<MessageSquare size={18} />}
        maxWidth="max-w-3xl"
      >
        <div className="flex flex-col h-full font-headline">
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
            {/* Summary Card */}
            <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 shadow-inner relative overflow-hidden group">
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
                    {selectedItem?.CreatedAt ? new Date(selectedItem.CreatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </span>
                </div>
                <p className="text-[14px] font-bold text-slate-600 leading-relaxed italic bg-white p-8 rounded-[2rem] border border-slate-100 font-headline uppercase">
                  "{selectedItem?.Isi}"
                </p>
              </div>
            </div>

            {/* Response Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <Reply className="size-4 text-primary" />
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Respon Resmi Fakultas</h3>
                </div>
                {selectedItem?.Status && (
                  <Badge className={cn(
                    "capitalize font-black text-[9px] px-3 py-1 border-none tracking-widest",
                    selectedItem.Status === 'selesai' ? "bg-emerald-50 text-emerald-600" :
                      selectedItem.Status === 'proses' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"
                  )}>
                    CURRENT: {selectedItem.Status.toUpperCase()}
                  </Badge>
                )}
              </div>
              <Textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="min-h-[160px] rounded-[2rem] border-slate-100 bg-white focus:bg-white shadow-sm ring-1 ring-slate-100 focus:ring-primary/20 transition-all font-black text-[11px] p-8 leading-relaxed placeholder:text-slate-300 placeholder:italic uppercase"
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

          <ModalFooter>
            <div className="flex items-center gap-4">
              <div className="size-9 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                <Reply className="size-4" />
              </div>
              <div className="flex flex-col leading-none gap-1">
                <span className="text-[11px] font-black uppercase text-slate-900 tracking-tight">E-Aspiration System</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Faculty Official Record Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ModalBtn variant="ghost" onClick={() => setIsModalOpen(false)}>
                BATALKAN
              </ModalBtn>
              <ModalBtn onClick={() => setIsModalOpen(false)}>
                TUTUP VIEW
              </ModalBtn>
            </div>
          </ModalFooter>
        </div>
      </Modal>


    </PageContainer>
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

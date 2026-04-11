"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { CheckCircle2, XCircle, Eye, Calendar, Award, AlertCircle, Trophy, GraduationCap, Building, FileText, ExternalLink, ShieldCheck, Star, Clock, X } from "lucide-react"
import { Modal, ModalBody, ModalFooter, ModalBtn } from "./components/Modal"

import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

export default function FacultyPrestasi() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:8000/api/faculty/prestasi')
      const json = await res.json()
      if (json.status === "success") {
        setAchievements(json.data)
      }
    } catch (err) {
      toast.error("Gagal sinkronisasi data prestasi")
    } finally {
      setLoading(false)
    }
  }

  const handleValidation = async (id, status) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`http://localhost:8000/api/faculty/prestasi/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Status: status,
          Poin: status === 'verified' ? 5 : 0,
          Catatan: status === 'verified' ? 'Prestasi terverifikasi oleh fakultas.' : 'Berkas tidak sesuai kriteria.'
        })
      })
      const json = await res.json()
      if (json.status === 'success') {
        toast.success(status === 'verified' ? 'Prestasi disetujui' : 'Prestasi ditolak')
        setIsModalOpen(false)
        fetchData()
      } else {
        toast.error(`Gagal perbarui status: ${json.message || 'Error response'}`)
      }
    } catch (err) {
      const msg = status === 'verified' ? 'validasi' : 'penolakan'
      toast.error(`Sistem sibuk: Gagal melakukan ${msg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusConfig = (status) => {
    switch(status) {
      case 'verified': return { label: 'TERVERIFIKASI', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50', ring: 'ring-emerald-500/20', icon: <CheckCircle2 className="size-3.5" /> }
      case 'rejected': return { label: 'DITOLAK', color: 'bg-rose-500', textColor: 'text-rose-700', bgColor: 'bg-rose-50', ring: 'ring-rose-500/20', icon: <XCircle className="size-3.5" /> }
      default: return { label: 'MENUNGGU', color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50', ring: 'ring-amber-500/20', icon: <AlertCircle className="size-3.5" /> }
    }
  }

  const getTingkatColor = (tingkat) => {
    switch(tingkat?.toLowerCase()) {
      case 'internasional': return 'bg-violet-50 text-violet-700 ring-violet-200/60'
      case 'nasional': return 'bg-blue-50 text-blue-700 ring-blue-200/60'
      case 'regional': return 'bg-cyan-50 text-cyan-700 ring-cyan-200/60'
      default: return 'bg-slate-50 text-slate-600 ring-slate-200/60'
    }
  }

  const columns = [
    {
      key: "Mahasiswa",
      label: "Mahasiswa",
      render: (val) => (
        <div className="flex flex-col text-left leading-tight">
          <span className="font-black text-slate-900 font-headline tracking-tighter uppercase text-[13px]">{val?.Nama || '-'}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{val?.NIM || '-'}</span>
        </div>
      )
    },
    {
      key: "NamaKegiatan",
      label: "Prestasi / Penghargaan",
      render: (val, row) => (
        <div className="flex flex-col text-left leading-tight">
          <span className="font-bold text-slate-800 text-[12px] font-headline uppercase tracking-tight">{val}</span>
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1 w-fit bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">{row.Kategori}</span>
        </div>
      ),
    },
    {
      key: "CreatedAt",
      label: "Tahun",
      render: (val) => (
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 font-headline uppercase">
          <Calendar className="size-3 text-slate-400" />
          {val ? new Date(val).getFullYear() : '-'}
        </div>
      )
    },
    {
      key: "Status",
      label: "Validasi",
      render: (val) => {
        const s = (val || 'pending').toLowerCase();
        const config = 
          s === 'verified' || s === 'terverifikasi' || s === 'disetujui' ? { label: 'TERVERIFIKASI', class: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" } :
          s === 'rejected' || s === 'ditolak' ? { label: 'DITOLAK', class: "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20" } :
          { label: 'MENUNGGU', class: "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20" };
        
        return (
          <Badge className={cn("capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline uppercase tracking-widest", config.class)}>
            {config.label}
          </Badge>
        );
      },
    }
  ]

  const statsData = [
    { label: 'Total Pengajuan', value: achievements.length, icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tervalidasi', value: achievements.filter(a => {
        const s = (a.Status || '').toLowerCase();
        return s === 'verified' || s === 'terverifikasi' || s === 'disetujui';
    }).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Menunggu', value: achievements.filter(a => {
        const s = (a.Status || '').toLowerCase();
        return s !== 'verified' && s !== 'terverifikasi' && s !== 'disetujui' && s !== 'rejected' && s !== 'ditolak';
    }).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const sel = selectedAchievement
  const statusCfg = sel ? getStatusConfig(sel.Status) : getStatusConfig()

  return (
    <PageContainer>
      <Toaster position="top-right" />
      
      <PageHeader
        icon={Award}
        title="Validasi Prestasi"
        description="Portal Verifikasi Capaian Mahasiswa"
      />

      <ResponsiveGrid cols={3}>
        {statsData.map((stat, i) => (
          <ResponsiveCard key={i} className="flex flex-row items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
              <span className="text-xl font-black text-slate-900 font-headline tracking-tighter leading-none uppercase">{loading ? '...' : stat.value}</span>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      <ResponsiveCard noPadding>
        <DataTable
          columns={columns}
          data={achievements}
          loading={loading}
          searchPlaceholder="Cari Nama atau Prestasi..."
          onSync={fetchData}
          onExport={() => alert("Ekspor Rekap Prestasi...")}
          exportLabel="Download Rekap"
          filters={[
            {
              key: 'Status',
              placeholder: 'Filter Status',
              options: [
                { label: 'Disetujui', value: 'verified' },
                { label: 'Menunggu', value: 'pending' },
                { label: 'Ditolak', value: 'rejected' },
              ]
            }
          ]}
          actions={(row) => (
            <div className="flex items-center justify-end gap-2">
              <Button onClick={() => { setSelectedAchievement(row); setIsModalOpen(true); }} variant="outline" size="icon" className="h-9 w-9 border-slate-200 hover:text-blue-600 rounded-xl hover:bg-blue-50 shadow-sm transition-all">
                <Eye className="size-4" />
              </Button>
              <Button onClick={() => handleValidation(row.ID, 'verified')} variant="outline" size="icon" className="h-9 w-9 border-slate-200 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 shadow-sm transition-all">
                <CheckCircle2 className="size-4" />
              </Button>
            </div>
          )}
        />
      </ResponsiveCard>

      {/* ===== DETAIL MODAL ===== */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={sel?.NamaKegiatan || 'Detail Prestasi'}
        subtitle={`${sel?.Mahasiswa?.Nama || '-'} · ${sel?.Mahasiswa?.NIM || '-'} • Kategori: ${sel?.Kategori || 'Umum'}`}
        icon={<Trophy size={18} />}
        maxWidth="max-w-2xl"
      >
        <ModalBody>
          <div className="space-y-5">

            {/* Rejected Alert */}
            {(sel?.Status || '').toLowerCase() === 'rejected' && (
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 flex items-start gap-3">
                <XCircle size={18} className="text-[#dc2626] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#dc2626] text-sm">Pengajuan Ditolak</p>
                  <p className="text-[#991b1b] text-sm mt-0.5">Berkas tidak sesuai kriteria. Mahasiswa dapat mengajukan ulang.</p>
                </div>
              </div>
            )}

            {/* Info Table */}
            <div className="bg-[#f4f8ff] rounded-xl p-5">
              <p className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-4">Detail Kompetisi</p>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-[#e5e5e5]">
                  <tr>
                    <td className="py-2.5 font-semibold text-[#a3a3a3] w-2/5">Nama Kegiatan</td>
                    <td className="py-2.5 font-bold text-[#171717]">{sel?.NamaKegiatan || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-[#a3a3a3]">Prodi</td>
                    <td className="py-2.5 font-bold text-[#171717]">{sel?.Mahasiswa?.ProgramStudi?.Nama || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-[#a3a3a3]">Kategori</td>
                    <td className="py-2.5 font-bold text-[#171717]">{sel?.Kategori || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-[#a3a3a3]">Tingkat</td>
                    <td className="py-2.5 font-bold text-[#171717]">{sel?.Tingkat || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-[#a3a3a3]">Peringkat</td>
                    <td className="py-2.5 font-bold text-[#00236F]">{sel?.Peringkat || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-[#a3a3a3]">Tanggal</td>
                    <td className="py-2.5 font-bold text-[#171717]">{sel?.CreatedAt ? new Date(sel.CreatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-[#a3a3a3]">Status</td>
                    <td className="py-2.5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        (sel?.Status||'').toLowerCase().includes('verif') ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]' :
                        (sel?.Status||'').toLowerCase().includes('tolak') || (sel?.Status||'').toLowerCase() === 'rejected' ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]' :
                        'bg-[#eef4ff] text-[#00236F] border-[#c9d8ff]'
                      }`}>{sel?.Status || 'Menunggu'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-[#a3a3a3]">Poin</td>
                    <td className="py-2.5 font-bold text-[#171717]">{sel?.Poin || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Certificate */}
            <div>
              <p className="text-xs font-bold text-[#a3a3a3] uppercase tracking-wider mb-3">Bukti / Sertifikat</p>
              {sel?.BuktiURL ? (
                <a href={`http://localhost:8000${sel.BuktiURL}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-4 border border-[#e5e5e5] rounded-xl hover:bg-[#eef4ff] hover:border-[#00236F] transition-colors">
                  <div className="w-10 h-10 bg-[#eef4ff] rounded-xl flex items-center justify-center text-[#00236F] shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#00236F] text-sm">Lihat Dokumen Sertifikat</p>
                    <p className="text-xs text-[#a3a3a3] truncate mt-0.5">{sel.BuktiURL}</p>
                  </div>
                  <ExternalLink size={16} className="text-[#00236F]/40 shrink-0" />
                </a>
              ) : (
                <div className="flex items-center gap-3 p-4 border border-[#e5e5e5] rounded-xl bg-[#fafafa]">
                  <div className="w-10 h-10 bg-[#f5f5f5] rounded-xl flex items-center justify-center text-[#a3a3a3] shrink-0">
                    <FileText size={18} />
                  </div>
                  <p className="text-sm text-[#a3a3a3] font-semibold italic">Tidak ada lampiran. Mahasiswa belum mengupload bukti.</p>
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <span className="text-xs font-semibold text-[#a3a3a3] mr-auto">Faculty Verification Panel</span>
          <ModalBtn variant="ghost" onClick={() => setIsModalOpen(false)}>
            Tutup
          </ModalBtn>
          <ModalBtn variant="danger" onClick={() => handleValidation(sel?.ID, 'rejected')} disabled={isSubmitting}>
            <XCircle size={14} /> Tolak
          </ModalBtn>
          <ModalBtn onClick={() => handleValidation(sel?.ID, 'verified')} disabled={isSubmitting}>
            <CheckCircle2 size={14} /> Validasi
          </ModalBtn>
        </ModalFooter>
      </Modal>

    </PageContainer>
  )
}

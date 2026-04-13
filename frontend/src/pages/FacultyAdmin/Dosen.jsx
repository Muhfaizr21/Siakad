"use client"

import React, { useState, useEffect } from "react"
import api from "../../lib/axios"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { Avatar, AvatarFallback, AvatarImage } from "./components/avatar"
import { Modal, ModalBtn } from "./components/Modal"
import { pddiktiService } from "../../services/api"

import { Card, CardContent } from "./components/card"
import {
  Eye,
  Mail,
  BookOpen,
  Users,
  ShieldCheck,
  Award,
  Phone,
  Layout
} from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { PageContainer, PageHeader, ResponsiveCard } from "./components/responsive-layout"

export default function DosenPage() {
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedDosen, setSelectedDosen] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const mapLecturer = (d) => ({
    ID: d.ID,
    NIDN: d.NIDN,
    Nama: d.Nama,
    Jabatan: d.Jabatan || 'Dosen',
    ProgramStudi: d.ProgramStudi ? { Nama: d.ProgramStudi.Nama } : { Nama: '-' },
    Fakultas: d.Fakultas,
    Status: 'AKTIF',
    AvatarURL: null,
    Pengguna: d.Pengguna,
    NoHP: d.NoHP
  })

  const fetchLecturers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/faculty/lecturers')
      const dosenList = res?.data?.data || []
      setLecturers(dosenList.map(mapLecturer))
    } catch (err) {
      toast.error("Gagal memuat data dosen")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await pddiktiService.fetchData('Universitas Bhakti Kencana', 'dosen')
      await fetchLecturers()
      toast.success('Sinkronisasi dosen selesai')
    } catch (err) {
      toast.error('Gagal sinkronisasi data dosen dari PDDIKTI')
      console.error(err)
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    fetchLecturers()
  }, [])

  const handleView = (dosen) => {
    setSelectedDosen(dosen)
    setIsDetailOpen(true)
  }

  const columns = [
    {
      key: "NIDN",
      label: "NIDN",
      className: "w-[120px]",
      render: (value) => <span className="font-bold text-slate-500 text-[11px] tracking-tight">{value || '-'}</span>
    },
    {
      key: "Nama",
      label: "Dosen",
      className: "w-auto min-w-[250px]",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-xl border border-slate-200 bg-white shadow-sm">
            <AvatarImage src={row.AvatarURL} />
            <AvatarFallback className="bg-white text-slate-800 text-[10px] font-black uppercase">
              {value?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 text-[13px] tracking-tight uppercase">{value}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{row.Jabatan || 'Dosen'}</span>
          </div>
        </div>
      )
    },
    {
      key: "Status",
      label: "Status",
      className: "w-[100px] text-center",
      cellClassName: "text-center",
      render: (value) => (
        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-none">
          {value || 'AKTIF'}
        </Badge>
      )
    }
  ]

  return (
    <PageContainer>
      <Toaster position="top-right" />

      <PageHeader
        icon={BookOpen}
        title="Direktori Dosen"
        description="Database tenaga pengajar dan staf ahli fakultas"
      >
        <div className="hidden md:flex items-center gap-2">
          <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest">
            {lecturers.length} DOSEN
          </Badge>
        </div>
      </PageHeader>

      <ResponsiveCard noPadding>
        <DataTable
          columns={columns}
          data={lecturers}
          loading={loading || isSyncing}
          onSync={handleSync}
          searchPlaceholder="Cari Nama, NIDN atau Jabatan..."
          actions={(row) => (
            <Button
              onClick={() => handleView(row)}
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-xl border-slate-200 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 group shadow-sm bg-white"
            >
              <Eye className="size-4 transition-transform group-hover:scale-110" />
              Detail
            </Button>
          )}
        />
      </ResponsiveCard>

      <Modal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedDosen?.Nama}
        subtitle={selectedDosen?.Jabatan || 'Dosen Pengajar'}
        maxWidth="max-w-xl"
      >
        {selectedDosen && (
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-lg">
                NIDN: {selectedDosen.NIDN}
              </Badge>
            </div>

            {/* SEKSI: PENUGASAN */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <Layout className="size-4 opacity-40" />
                <h4 className="text-[11px] font-bold uppercase tracking-[0.1em]">Penugasan Akademik</h4>
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 border-l-2 border-slate-100 pl-4 py-1">
                <DataField label="Program Studi" value={selectedDosen.ProgramStudi?.Nama} />
                <DataField label="Fakultas" value={selectedDosen.Fakultas?.Nama || selectedDosen.ProgramStudi?.Fakultas?.Nama} />
                <DataField label="Jabatan Fungsional" value={selectedDosen.Jabatan} />
                <DataField label="Email Institusi" value={selectedDosen.Pengguna?.Email} isPrimary />
              </div>
            </div>

            {/* SEKSI: VERIFIKASI */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <ShieldCheck className="size-4 opacity-40" />
                <h4 className="text-[11px] font-bold uppercase tracking-[0.1em]">Status & Wewenang</h4>
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 border-l-2 border-slate-100 pl-4 py-1">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Status Akademik</span>
                  <Badge className={cn(
                    "w-fit text-[9px] font-bold px-2.5 py-0.5 border shadow-none",
                    selectedDosen.Status === 'AKTIF' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                  )}>
                    {selectedDosen.Status || 'AKTIF'}
                  </Badge>
                </div>
                <DataField label="Nomor Kontak (HP/WA)" value={selectedDosen.NoHP || '-'} isPrimary />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <ModalBtn variant="default" onClick={() => setIsDetailOpen(false)}>Tutup</ModalBtn>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}

function DataField({ label, value, isPrimary = false }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{label}</span>
      <span className={cn(
        "text-[12px] font-bold tracking-tight uppercase truncate",
        isPrimary ? "text-primary italic" : "text-slate-700"
      )}>
        {value || '—'}
      </span>
    </div>
  )
}

"use client"

import React, { useState, useEffect } from "react"
import api from "../../lib/axios"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { Avatar, AvatarFallback } from "./components/avatar"
import { Modal, ModalBody, ModalFooter, ModalBtn } from "./components/Modal"
import { pddiktiService } from "../../services/api"


import { Card, CardContent } from "./components/card"
import { Eye, Mail, GraduationCap, MapPin, Phone, User, BookOpen, Heart, FileText, Users } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

export default function MahasiswaPage() {
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [studentData, setStudentData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await pddiktiService.fetchData('Universitas Bhakti Kencana', 'mhs')
      // Backend now returns: { status: 'success', data: { mahasiswa: [...], dosen: [...], prodi: [...] } }
      const mhsList = res?.data?.mahasiswa || []

      const mappedData = mhsList.map(m => {
        const isLulus = (m.status_akun || '').toLowerCase() === 'lulus'
        return {
          ID: m.id,
          NIM: m.nim,
          Nama: m.nama,
          ProgramStudi: { Nama: m.nama_prodi || '-' },
          SemesterSekarang: isLulus ? 0 : (Number.isInteger(m.semester_saat_ini) && m.semester_saat_ini > 0 ? m.semester_saat_ini : 1),
          StatusAkun: m.status_akun || 'Aktif',
          StatusAkademik: m.status_saat_ini || '-',
          TahunMasuk: m.tanggal_masuk ? new Date(m.tanggal_masuk).getFullYear().toString() : (m.nim ? '20' + m.nim.substring(0, 2) : '2023'),
          NoHP: "-",
          JalurMasuk: 'PDDIKTI SYNC'
        }
      })
      setStudentData(mappedData)
    } catch (err) {
      toast.error("Gagal sinkronisasi data dari PDDIKTI")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleView = (mahasiswa) => {
    setSelectedMahasiswa(mahasiswa)
    setIsDetailOpen(true)
  }

  const columns = [
    {
      key: "NIM",
      label: "NIM",
      className: "w-[120px]",
      render: (value) => <span className="font-bold text-slate-500 text-[11px] tracking-tight">{value}</span>
    },
    {
      key: "Nama",
      label: "Mahasiswa",
      className: "w-auto min-w-[250px]",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-xl border border-slate-200 bg-white shadow-sm">
            <AvatarFallback className="bg-slate-50 text-slate-600 text-[10px] font-black uppercase">
              {value?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 text-[13px] tracking-tight uppercase">{value}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{row.ProgramStudi?.Nama || '-'}</span>
          </div>
        </div>
      )
    },
    {
      key: "SemesterSekarang",
      label: "Smt",
      className: "w-[80px] text-center",
      cellClassName: "text-center",
      render: (value, row) => <span className="font-black text-slate-700 text-xs">{row.StatusAkun === 'Lulus' ? '-' : (value || 1)}</span>
    },
    {
      key: "StatusAkun",
      label: "Status",
      className: "w-[120px] text-center",
      cellClassName: "text-center",
      render: (val) => (
        <Badge
          className={cn(
            "capitalize font-bold text-[9px] px-3 py-1 border shadow-none uppercase tracking-widest",
            (val === 'active' || val === 'Aktif') ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
              (val === 'leave' || val === 'Cuti') ? "bg-amber-50 text-amber-600 border-amber-100" :
                (val === 'Lulus') ? "bg-sky-50 text-sky-600 border-sky-100" :
                  (val === 'Non-Aktif') ? "bg-rose-50 text-rose-600 border-rose-100" :
                    "bg-slate-50 text-slate-600 border-slate-200"
          )}
        >
          {val || 'Aktif'}
        </Badge>
      )
    }
  ]

  return (
    <PageContainer>
      <Toaster position="top-right" />

      <PageHeader
        icon={Users}
        title="Database Mahasiswa"
        description="Manajemen data dan arsip akademik mahasiswa fakultas"
      >
        <div className="hidden md:flex items-center gap-2">
          <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold px-3 py-1.5 rounded-xl">
            TOTAL: {studentData.length} MHS
          </Badge>
        </div>
      </PageHeader>

      <ResponsiveCard noPadding>
        <DataTable
          columns={columns}
          data={studentData}
          loading={loading}
          searchPlaceholder="Cari NIM atau Nama..."
          onSync={fetchStudents}
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
      {/* Detail Modal */}
      <Modal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedMahasiswa?.Nama || 'Mahasiswa'}
        subtitle={selectedMahasiswa?.NIM || '-'}
        icon={<User size={18} />}
        maxWidth="max-w-2xl"
      >
        {selectedMahasiswa && (
          <div className="flex flex-col font-headline">
            <ModalBody>
              <div className="space-y-8">
                {/* SEKSI: AKADEMIK */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <BookOpen className="size-4 opacity-40" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.1em] font-headline">Informasi Akademik</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4 border-l-2 border-slate-100 pl-4 py-1">
                    <DataField label="Program Studi" value={selectedMahasiswa.ProgramStudi?.Nama} />
                    <DataField label="Semester / Angkatan" value={`${selectedMahasiswa.StatusAkun === 'Lulus' ? '-' : (selectedMahasiswa.SemesterSekarang || 1)} / ${selectedMahasiswa.TahunMasuk || '-'}`} />
                    <DataField label="Status Akademik PDDIKTI" value={selectedMahasiswa.StatusAkademik || '-'} />
                    <DataField label="Dosen Wali (DPA)" value={selectedMahasiswa.DosenPA?.Nama || 'Belum Ditentukan'} isPrimary />
                    <DataField label="Jalur Masuk" value={selectedMahasiswa.JalurMasuk || 'Mandiri'} />
                  </div>
                </div>

                {/* SEKSI: ORANG TUA */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Heart className="size-4 opacity-40" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.1em] font-headline">Data Orang Tua</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4 border-l-2 border-slate-100 pl-4 py-1">
                    <DataField label="Nama Ayah" value={selectedMahasiswa.NamaAyah} />
                    <DataField label="Nama Ibu" value={selectedMahasiswa.NamaIbuKandung} />
                    <DataField label="Pekerjaan Ortu" value={selectedMahasiswa.PekerjaanAyah || selectedMahasiswa.PekerjaanIbu} />
                    <DataField label="Penghasilan" value={selectedMahasiswa.PenghasilanOrtu ? `Rp ${selectedMahasiswa.PenghasilanOrtu.toLocaleString('id-ID')}` : '-'} />
                  </div>
                </div>

                {/* SEKSI: BIODATA & KONTAK */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <FileText className="size-4 opacity-40" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.1em] font-headline">Biodata & Kontak</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4 border-l-2 border-slate-100 pl-4 py-1">
                    <DataField label="Tempat, Tgl Lahir" value={`${selectedMahasiswa.TempatLahir || '-'}, ${selectedMahasiswa.TanggalLahir ? new Date(selectedMahasiswa.TanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}`} />
                    <DataField label="Nomor WhatsApp" value={selectedMahasiswa.NoHP} isPrimary />
                    <DataField label="NIK" value={selectedMahasiswa.NIK} />
                    <DataField label="Email Institusi" value={selectedMahasiswa.EmailKampus || selectedMahasiswa.Pengguna?.Email} />
                  </div>
                  <div className="border-l-2 border-slate-100 pl-4 py-1 mt-2">
                    <DataField label="Alamat Lengkap" value={selectedMahasiswa.Alamat} isFull />
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <ModalBtn onClick={() => setIsDetailOpen(false)}>
                Tutup Detail
              </ModalBtn>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}

function DataField({ label, value, isPrimary = false, isFull = false }) {
  return (
    <div className={cn("flex flex-col gap-0.5", isFull ? "col-span-2" : "")}>
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{label}</span>
      <span className={cn(
        "text-[12px] font-bold tracking-tight",
        isPrimary ? "text-primary italic" : "text-slate-700"
      )}>
        {value || '—'}
      </span>
    </div>
  )
}

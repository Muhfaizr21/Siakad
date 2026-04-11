"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { Avatar, AvatarFallback } from "./components/avatar"
import { Calendar, Download, Users, UserCheck, Clock, GraduationCap, Mail } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

export default function FacultyMahasiswaBaru() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBaru = async () => {
      setLoading(true)
      try {
        const res = await fetch('http://localhost:8000/api/faculty/admissions')
        const json = await res.json()
        if (json.status === 'success') {
          setStudents(json.data)
        }
      } catch (err) {
        toast.error("Gagal Sinkronisasi Database")
      } finally {
        setLoading(false)
      }
    }
    fetchBaru()
  }, [])

  const statsData = [
    { label: 'Registrasi Baru', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Terverifikasi', value: students.length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Menunggu PKKMB', value: students.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Target Kuota', value: '450', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  const columns = [
    {
      key: "nomorDaftar",
      label: "Nomor Daftar",
      render: (value) => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">{value || 'PENDING'}</span>,
    },
    {
      key: "namaLengkap",
      label: "Identitas Pendaftar",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100 uppercase font-black text-slate-800">
            <AvatarFallback className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase">
              {value?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-black text-slate-900 font-headline tracking-tighter text-[13px] uppercase">{value}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
              <Mail className="size-2.5 opacity-60" />
              {row.email || '-'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "pilihanProdi",
      label: "Pilihan Prodi",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-700 font-headline tracking-tighter uppercase">{value || "BELUM DITENTUKAN"}</span>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Jalur: {row.jalur || 'Mandiri'}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      className: "text-center",
      cellClassName: "text-center",
      render: (value) => (
        <Badge variant="warning" className="capitalize font-black text-[9px] px-3 py-1 border-none bg-amber-50 text-amber-600 tracking-widest uppercase font-headline">
          {value || 'Pending'}
        </Badge>
      )
    },
    {
      key: "createdAt",
      label: "Registrasi",
      className: "text-right",
      cellClassName: "text-right",
      render: (value) => (
        <div className="inline-flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
          <Calendar className="size-3 opacity-60" />
          {new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      )
    }
  ]

  return (
    <PageContainer>
      <Toaster position="top-right" />
      
      <PageHeader
        icon={Users}
        title="Maba Terdaftar"
        description="Database Mahasiswa Semester Ganjil 2024"
      />

      <ResponsiveGrid cols={4}>
        {statsData.map((stat, i) => (
          <ResponsiveCard key={i} className="flex flex-row items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
              <span className="text-xl font-black text-slate-900 font-headline tracking-tighter leading-none">{loading ? '...' : stat.value}</span>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      <ResponsiveCard noPadding>
        <DataTable
          columns={columns}
          data={students}
          loading={loading}
          searchPlaceholder="Cari Nama atau NIM..."
          onSync={() => window.location.reload()}
          exportLabel="Ekspor Database Maba"
          onExport={() => alert("Downloading...")}
          filters={[
            {
              key: 'pilihanProdi',
              placeholder: 'Filter Prodi',
              options: [
                { label: 'Informatika', value: 'Informatika' },
                { label: 'Sistem Informasi', value: 'Sistem Informasi' },
                { label: 'Teknik Sipil', value: 'Teknik Sipil' },
              ]
            }
          ]}
        />
      </ResponsiveCard>

    </PageContainer>
  )
}

"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card"
import { Button } from "./components/button"
import { Avatar, AvatarFallback } from "./components/avatar"
import { Calendar, Download, Users, UserCheck, Clock, GraduationCap, Mail } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"

export default function FacultyMahasiswaBaru() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBaru = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/faculty/admissions')
        const json = await res.json()
        if (json.status === 'success') {
          setStudents(json.data)
          toast.success("Database Maba Berhasil Dimuat", {
            style: {
              borderRadius: '1rem',
              background: '#0f172a',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }
          })
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
    { label: 'Registrasi Baru', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Terverifikasi', value: students.length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { label: 'Menunggu PKKMB', value: students.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5' },
    { label: 'Target Kuota', value: '450', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500/10 to-indigo-500/5' },
  ]

  const columns = [
    {
      key: "nomorDaftar",
      label: "Nomor Daftar",
      className: "w-[150px]",
      render: (value) => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">{value || 'PENDING'}</span>,
    },
    {
      key: "namaLengkap",
      label: "Identitas Pendaftar",
      className: "w-auto min-w-[300px]",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100 uppercase font-black text-slate-800">
            <AvatarFallback className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase">
              {value?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{value}</span>
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
      className: "w-[250px]",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700 font-headline tracking-tight">{value || "BELUM DITENTUKAN"}</span>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Jalur: {row.jalur || 'Mandiri'}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status Review",
      className: "w-[180px] text-center",
      cellClassName: "text-center",
      render: (value) => (
        <Badge variant="warning" className="capitalize font-black text-[9px] px-3 py-1 border-none bg-amber-50 text-amber-600">
          {value || 'Pending'}
        </Badge>
      )
    },
    {
      key: "createdAt",
      label: "Tgl Registrasi",
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
    <div className="space-y-6">
      <Toaster position="top-right" />
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pt-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Users className="size-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Maba Terdaftar</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Database Mahasiswa Semester Ganjil 2024</p>
          </div>
        </div>

      </div>


      {/* MAIN TABLE */}
      <Card className="border-none shadow-sm mt-4 overflow-hidden rounded-3xl bg-white/50 backdrop-blur-md">
        <CardContent className="p-0">
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
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import React, { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/card"
import { Button } from "./components/button"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/dialog"
import { toast, Toaster } from 'react-hot-toast'
import { cn } from "@/lib/utils"
import { HeartPulse, Activity, AlertCircle, Eye } from 'lucide-react'

const fmtDate = (value) => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID')
}

const normalizeHealthRow = (item = {}) => ({
  id: item.id || item.ID || 0,
  tanggal_periksa: item.tanggal_periksa || item.Tanggal || item.tanggal || item.created_at || item.CreatedAt || null,
  mahasiswa_id: item.mahasiswa_id || item.MahasiswaID || 0,
  nim: item.nim || item.NIM || item?.Mahasiswa?.NIM || '-',
  nama_mahasiswa: item.nama_mahasiswa || item.NamaMahasiswa || item?.Mahasiswa?.Nama || '-',
  prodi: item.prodi || item?.Mahasiswa?.ProgramStudi?.Nama || '-',
  status_kesehatan: item.status_kesehatan || item.StatusKesehatan || 'sehat',
  golongan_darah: item.golongan_darah || item.GolonganDarah || '-',
  sumber: item.sumber || item.Sumber || 'kencana_screening',
  tinggi_badan: Number(item.tinggi_badan ?? item.TinggiBadan ?? 0),
  berat_badan: Number(item.berat_badan ?? item.BeratBadan ?? 0),
  sistolik: Number(item.sistolik ?? item.Sistole ?? 0),
  diastolik: Number(item.diastolik ?? item.Diastole ?? 0),
  bmi: Number(item.bmi ?? 0),
  catatan_medis: item.catatan_medis || item.Catatan || '-',
})

export default function FacultyKesehatan() {
  const [loading, setLoading] = useState(true)
  const [screeningPrograms, setScreeningPrograms] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [statsData, setStatsData] = useState({
    total: 0,
    prima: 0,
    pantauan: 0
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [progRes, summaryRes] = await Promise.all([
        api.get('/faculty/health-screening'),
        api.get('/faculty/health-screening/summary')
      ])

      if (progRes.data.status === 'success') {
        const rows = Array.isArray(progRes.data.data) ? progRes.data.data.map(normalizeHealthRow) : []
        setScreeningPrograms(rows)
      }
      if (summaryRes.data.status === 'success') {
        setStatsData(summaryRes.data.data || { total: 0, distribution: {} })
      }
    } catch (error) {
      toast.error("Gagal sinkronisasi data kesehatan")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const stats = [
    { label: 'Screening Selesai', value: (statsData.total || 0).toLocaleString(), icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Golongan Darah O', value: (statsData.distribution?.bloodO || 0).toLocaleString(), icon: HeartPulse, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { label: 'Status Pantauan', value: (statsData.status?.pantauan || 0).toLocaleString(), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5' },
  ]

  const columns = [
    {
      key: "tanggal_periksa",
      label: "Tanggal Periksa",
      render: (value) => (
         <div className="flex flex-col">
            <span className="font-bold text-slate-800 font-headline tracking-tight">{fmtDate(value)}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Official Record</span>
         </div>
      )
    },
    {
      key: "nama_mahasiswa",
      label: "Mahasiswa",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 font-headline tracking-tight text-[13px]">{value || '-'}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{row.nim || '-'} • {row.prodi || '-'}</span>
        </div>
      )
    },
    {
      key: "status_kesehatan",
      label: "Status Review",
      render: (val) => (
        <Badge 
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline",
            val === 'prima' || val === 'sehat' ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
            val === 'pantauan' || val === 'perlu_perhatian' ? "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20" :
            "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20"
          )}
        >
          {val?.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: "golongan_darah",
      label: "Gol. Darah",
      render: (value) => <span className="font-bold text-slate-500 font-headline text-[13px] uppercase tracking-widest">{value || '-'}</span>
    },
    {
      key: "sumber",
      label: "Sumber Data",
      className: "text-right",
      cellClassName: "text-right",
      render: (val) => (
        <Badge 
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline",
            val === 'kencana_screening' ? "bg-blue-100 text-blue-700 ring-1 ring-blue-500/20" :
            "bg-slate-100 text-slate-700 ring-1 ring-slate-500/20"
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
              <HeartPulse className="size-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Status Kesehatan</h1>
          </div>
          <div className="flex items-center gap-2">
             <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pusat Screening & Monitoring Mahasiswa</p>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 rounded-2xl">
             <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
             <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon className="size-5" />
                   </div>
                   <div className="flex items-center gap-1 text-[10px] font-black text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest leading-none">
                      <HeartPulse className="size-2.5" />
                      Live Status
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{stat.label}</p>
                   <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-black text-slate-900 font-headline tracking-tighter leading-none">
                         {loading ? "..." : stat.value}
                      </h3>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-tight">Kondisi Kumulatif</p>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-slate-200 shadow-sm flex flex-col overflow-hidden bg-white/50 backdrop-blur-md rounded-2xl">
        <CardContent className="p-0 font-headline">
          <DataTable
            columns={columns}
            data={screeningPrograms}
            loading={loading}
            onSync={fetchData}
            onExport={() => alert("Ekspor Data Kesehatan...")}
            exportLabel="Download Laporan"
            actions={(row) => (
              <Button
                onClick={() => {
                  setSelectedRecord(row)
                  setIsDetailOpen(true)
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-xl"
              >
                <Eye className="size-4" />
              </Button>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Health Screening</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <DetailItem label="Tanggal" value={fmtDate(selectedRecord.tanggal_periksa)} />
              <DetailItem label="Status" value={String(selectedRecord.status_kesehatan || '-').replace('_', ' ')} />
              <DetailItem label="Mahasiswa" value={selectedRecord.nama_mahasiswa || '-'} />
              <DetailItem label="NIM" value={selectedRecord.nim || '-'} />
              <DetailItem label="Program Studi" value={selectedRecord.prodi || '-'} />
              <DetailItem label="Gol. Darah" value={selectedRecord.golongan_darah || '-'} />
              <DetailItem label="Tinggi Badan" value={`${selectedRecord.tinggi_badan || 0} cm`} />
              <DetailItem label="Berat Badan" value={`${selectedRecord.berat_badan || 0} kg`} />
              <DetailItem label="Tekanan Darah" value={`${selectedRecord.sistolik || 0}/${selectedRecord.diastolik || 0} mmHg`} />
              <DetailItem label="BMI" value={selectedRecord.bmi || 0} />
              <DetailItem label="Sumber" value={String(selectedRecord.sumber || '-').replace('_', ' ')} />
              <DetailItem label="Catatan" value={selectedRecord.catatan_medis || '-'} full />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailItem({ label, value, full = false }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-1 break-words">{value}</p>
    </div>
  )
}

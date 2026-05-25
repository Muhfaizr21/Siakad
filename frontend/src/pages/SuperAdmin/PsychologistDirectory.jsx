"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from './components/ui/data-table'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog'
import { DeleteConfirmModal } from './components/ui/DeleteConfirmModal'
import { Card, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../services/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const BrainCircuit = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>psychology</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Stethoscope = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>medical_services</span>;
const ClipboardCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>assignment_turned_in</span>;
const Heart = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>favorite</span>;



const getCleanImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const baseUrl = API_BASE_URL.replace('/api', '')
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function StudentAvatar({ src, name, className = "w-9 h-9 rounded-xl" }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const hasNoImage = !src || src.trim() === "" || src.endsWith("/profiles/") || src.endsWith("/students/") || src.endsWith("localhost:8000") || src.endsWith("localhost:8000/");

  return (
    <div className={cn("relative bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200/40 shadow-inner overflow-hidden", className)}>
      {(!loaded || error || hasNoImage) && (
        <span className="material-symbols-outlined text-slate-400/80 block select-none leading-none absolute animate-in fade-in" style={{ fontSize: className.includes('w-28') ? '56px' : className.includes('w-14') ? '28px' : '20px' }}>
          person
        </span>
      )}
      {!hasNoImage && !error && (
        <img
          src={src}
          alt={name}
          className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-200", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

export default function PsychologistDirectory() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [form, setForm] = useState({ 
    ID: '', Nama: '', Spesialisasi: 'Umum', Lokasi: '', Tarif: 0, IsAktif: true 
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAllPsychologists()
      if (res.status === 'success') setData(res.data || [])
      else toast.error('Gagal memuat data psikolog')
    } catch { toast.error('Koneksi sistem terputus') } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleOpenEdit = (row) => {
    setForm({ 
      ID: row.id || row.ID, 
      Nama: row.nama || '', 
      Spesialisasi: row.spesialisasi || 'Umum', 
      Lokasi: row.lokasi || '',
      Tarif: row.tarif || 0,
      IsAktif: row.is_aktif ?? true
    })
    setIsEditOpen(true)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = { 
        nama: form.Nama,
        spesialisasi: form.Spesialisasi,
        lokasi: form.Lokasi,
        tarif: parseInt(form.Tarif) || 0,
        is_aktif: form.IsAktif 
      }
      const targetId = form.ID || form.id
      const res = await adminService.updatePsychologist(targetId, payload)
      if (res.status === 'success') { 
        toast.success('Profil psikolog diperbarui')
        setIsEditOpen(false)
        fetchData() 
      } else {
        toast.error(res.message || 'Gagal menyimpan data')
      }
    } catch { toast.error('Terjadi kesalahan sistem') } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deletePsychologist(selected.id || selected.ID)
      toast.success('Psikolog berhasil dihapus')
      setIsDelOpen(false)
      fetchData()
    } catch { toast.error('Gagal menghapus data') } finally { setIsSubmitting(false) }
  }

  const columns = [
    { 
      key: 'nama', 
      label: 'Tenaga Profesional', 
      className: 'w-[300px]',
      render: (v, row) => (
        <div className="flex items-center gap-4 py-2 group/avatar">
          <StudentAvatar
            src={getCleanImageUrl(row.Foto || row.Pengguna?.Foto || row.foto || row.pengguna?.foto)}
            name={v}
            className="w-11 h-11 rounded-xl border-2 border-white shadow-md transition-all group-hover/avatar:scale-110"
          />
          <div className="flex flex-col">
            <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px] leading-tight">
              {v ? v.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) : '—'}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-neutral-400">
               <Stethoscope size={10} className="text-teal-500/60" />
               <span className="text-[10px] font-bold tracking-widest uppercase">{row.spesialisasi || 'Psikolog Umum'}</span>
            </div>
          </div>
        </div>
      )
    },
    { 
      key: 'lokasi', 
      label: 'Lokasi Praktik', 
      className: 'w-[250px]',
      render: v => (
        <div className="flex items-center gap-2 text-neutral-500">
          <span className="material-symbols-outlined text-neutral-400" style={{ fontSize: '12px' }} >location_on</span>
          <span className="text-[12px] font-medium truncate font-jakarta" title={v}>{v || 'Rumah Sakit Universitas'}</span>
        </div>
      )
    },
    { 
      key: 'is_aktif', 
      label: 'Status', 
      className: 'w-[140px] text-center', 
      cellClassName: 'text-center pr-4',
      render: v => (
        <Badge className={cn(
          'px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider shadow-none', 
          v ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-rose-50 text-rose-600 border-rose-100'
        )}>
          {v ? 'Aktif Praktek' : 'Cuti / Libur'}
        </Badge>
      )
    }
  ]

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-teal-50/50 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-teal-500 rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Professional Health</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                Direktori <span className="text-teal-600 italic">Psikolog</span>
              </h1>
              <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed">
                Manajemen data tenaga ahli psikologi, jadwal praktek, dan lokasi pelayanan kesehatan mental mahasiswa.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-teal-50 border border-teal-100 rounded-xl flex items-center gap-3">
                 <span className="material-symbols-outlined text-teal-600" style={{ fontSize: '16px' }} Check >security</span>
                 <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Verification Status</span>
                    <span className="text-[12px] font-bold text-teal-700 font-jakarta">Verified Practitioners</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-teal-50 rounded-xl flex justify-center items-center text-teal-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >group</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Total Psikolog</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{data.length}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Tenaga ahli terdaftar</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-blue-50 rounded-xl flex justify-center items-center text-blue-600 flex-shrink-0">
                    <ClipboardCheck size={18} />
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Aktif Praktek</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{data.filter(d => d.is_aktif).length}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Psikolog tersedia hari ini</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-rose-50 rounded-xl flex justify-center items-center text-rose-600 flex-shrink-0">
                    <Heart size={18} />
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Layanan Mental</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">24/7</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Standar pelayanan universitas</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-neutral-50 rounded-xl flex justify-center items-center text-neutral-500 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >show_chart</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Update Data</span>
                 <Badge className="bg-neutral-100 text-neutral-500 border-none text-[8px] font-bold px-1.5 ml-auto">REALTIME</Badge>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">100%</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Sinkronisasi database pusat</p>
           </div>
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns} 
              data={data} 
              loading={loading}
              searchPlaceholder="Cari Nama atau Spesialisasi..."
              filters={[
                { key: 'Spesialisasi', placeholder: 'FILTER BIDANG', options: [{ label: 'PSIKOLOG UMUM', value: 'Umum' }, { label: 'KLINIS', value: 'Klinis' }, { label: 'PENDIDIKAN', value: 'Pendidikan' }] }
              ]}
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >edit</span></Button>
                  <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span></Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

      </div>

      {/* ── Edit Modal ───────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
          <DialogHeader className="p-8 pb-6 border-b border-neutral-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-teal-600"><BrainCircuit size={100} /></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-teal-50 flex items-center justify-center text-teal-600">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">Clinical Registry</span>
              </div>
              <DialogTitle className="text-2xl font-bold font-jakarta tracking-tight text-neutral-900 uppercase">
                Edit Profil Psikolog
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-neutral-400">Pembaruan kualifikasi dan pengaturan operasional tenaga ahli.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Nama Lengkap & Gelar</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama psikolog..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta uppercase" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Spesialisasi Klinis</Label>
                <Input value={form.Spesialisasi} onChange={e => setForm({ ...form, Spesialisasi: e.target.value })} placeholder="Bidang keahlian..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Titik Lokasi Praktek</Label>
              <Input value={form.Lokasi} onChange={e => setForm({ ...form, Lokasi: e.target.value })} placeholder="Klinik / Ruang Konseling..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Tarif Layanan (Rp)</Label>
                <Input type="number" value={form.Tarif} onChange={e => setForm({ ...form, Tarif: e.target.value })} className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Status Operasional</Label>
                <Select value={form.IsAktif ? "1" : "0"} onValueChange={v => setForm({ ...form, IsAktif: v === "1" })}>
                  <SelectTrigger className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 font-medium text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="1" className="text-xs font-medium uppercase">Aktif Tersedia</SelectItem>
                    <SelectItem value="0" className="text-xs font-medium uppercase text-rose-500">Non-Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-6 flex flex-row gap-3 border-t border-neutral-100">
               <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-400">Batal</Button>
               <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-neutral-900 text-white hover:bg-teal-600 shadow-md transition-all active:scale-95">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} >save</span>}
                  <span className="text-xs font-bold uppercase tracking-widest">Update Profil</span>
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen} 
        onClose={() => setIsDelOpen(false)} 
        onConfirm={handleDelete}
        title="Hapus Data Psikolog?" 
        description="Profil profesional dan seluruh riwayat praktik psikolog ini akan dihapus permanen dari sistem." 
        loading={isSubmitting} 
      />
    </div>
  )
}

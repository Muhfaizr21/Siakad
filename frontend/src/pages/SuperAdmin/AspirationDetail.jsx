"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Label } from './components/ui/label'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../services/api'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const ImageIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>image</span>;
const FileImage = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>image</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const ArrowLeft = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>arrow_back</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const User = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person</span>;
const Building2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>business</span>;
const ExternalLink = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>open_in_new</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;
const X = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>close</span>;



const normalizeAspiration = (asp = {}) => {
  const mahasiswa = asp.Mahasiswa || asp.mahasiswa || {}
  const fakultas = asp.Fakultas || asp.fakultas || mahasiswa.Fakultas || mahasiswa.fakultas || {}
  const id = asp.ID ?? asp.id ?? ''

  return {
    ...asp,
    ID: id,
    Judul: asp.Judul ?? asp.judul ?? asp.Subjek ?? asp.subjek ?? '',
    Subjek: asp.Subjek ?? asp.subjek ?? asp.Judul ?? asp.judul ?? '',
    Isi: asp.Isi ?? asp.isi ?? '',
    Kategori: asp.Kategori ?? asp.kategori ?? 'General',
    Priority: asp.Priority ?? asp.Prioritas ?? asp.prioritas ?? 'NORMAL',
    Deadline: asp.Deadline ?? asp.deadline ?? null,
    Status: asp.Status ?? asp.status ?? 'OPEN',
    Respon: asp.Respon ?? asp.respon ?? '',
    CreatedAt: asp.CreatedAt ?? asp.created_at ?? new Date(),
    BuktiURL: asp.BuktiURL ?? asp.bukti_url ?? asp.FotoURL ?? asp.foto_url ?? '',
    Mahasiswa: {
      ...mahasiswa,
      Nama: mahasiswa.Nama ?? mahasiswa.nama ?? 'System Identity',
      NIM: mahasiswa.NIM ?? mahasiswa.nim ?? '-',
      Fakultas: {
        ...fakultas,
        Nama: fakultas.Nama ?? fakultas.nama ?? 'Institusional',
      },
      User: mahasiswa.User || mahasiswa.user || {}
    },
    Fakultas: {
      ...fakultas,
      Nama: fakultas.Nama ?? fakultas.nama ?? 'Institusional',
    },
  }
}

export default function AspirationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ status: '', respon: '' })

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await adminService.getGlobalAspirations()
      if (res.status === 'success') {
        const rawDetail = (res.data || []).find(item => String(item.ID ?? item.id) === String(id))
        if (rawDetail) {
          const detail = normalizeAspiration(rawDetail)
          setData(detail)
          setForm({ 
            status: detail.Status || 'proses', 
            respon: detail.Respon || '' 
          })
        } else {
          toast.error('Data aspirasi tidak ditemukan')
          navigate('/admin/aspirations')
        }
      }
    } catch (err) {
      toast.error('Gagal memuat detail aspirasi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [id])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!form.status || !form.respon) {
      toast.error('Status dan Tanggapan harus diisi')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await adminService.updateAspirationStatus(id, form)
      if (res.status === 'success') {
        toast.success('Resolusi aspirasi berhasil diperbarui')
        fetchDetail()
      } else {
        toast.error(res.message || 'Gagal memperbarui status')
      }
    } catch {
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <span className="material-symbols-outlined animate-spin text-primary size-10" >sync</span>
      </div>
    )
  }

  if (!data) return null

  // Priority mapping for UI
  const priorityStyles = {
    'CRITICAL': 'bg-rose-500 text-white shadow-lg shadow-rose-100',
    'HIGH': 'bg-amber-500 text-white shadow-lg shadow-amber-100',
    'NORMAL': 'bg-primary text-white shadow-lg shadow-primary/20',
    'LOW': 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
  }

  const getCleanImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const baseUrl = API_BASE_URL.replace('/api', '')
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
  }

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />
      
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* ── Breadcrumbs & Back ────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin/aspirations')}
              className="group h-10 w-10 p-0 rounded-xl hover:bg-white hover:shadow-sm transition-all"
            >
              <ArrowLeft size={18} className="text-neutral-400 group-hover:text-primary transition-colors" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-jakarta">
                <Link to="/admin" className="hover:text-primary">Dashboard</Link>
                <span>/</span>
                <Link to="/admin/aspirations" className="hover:text-primary">Aspirasi</Link>
                <span>/</span>
                <span className="text-primary/60">Audit Detail</span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">Detail Audit Aspirasi Mahasiswa</h2>
            </div>
          </div>

          <Badge className={cn(
            'px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest shadow-sm',
            data.Status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
            data.Status === 'Proses' ? 'bg-blue-50 text-blue-700 border-blue-100' :
            'bg-amber-50 text-amber-700 border-amber-100'
          )}>
            Status Tiket: {data.Status || 'OPEN'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          
          {/* ── Left Column: Reporter & Content Info ─────────────────── */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Header Status Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">ID Incident</span>
                  <span className="text-sm font-black text-neutral-900 font-jakarta">#ASP-{data.ID?.toString().padStart(4, '0')}</span>
               </div>
               <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Priority Node</span>
                  <Badge className={cn('w-fit h-5 px-2 text-[8px] border-none', priorityStyles[data.Priority || 'NORMAL'])}>{data.Priority || 'NORMAL'}</Badge>
               </div>
               <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Kategori</span>
                  <span className="text-sm font-bold text-neutral-600 truncate">{data.Kategori || 'General'}</span>
               </div>
               <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Waktu Masuk</span>
                  <span className="text-sm font-bold text-neutral-600">{new Date(data.CreatedAt).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})}</span>
               </div>
            </div>

            {/* Reporter Profile Card */}
            <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white overflow-hidden">
               <div className="p-6 border-b border-neutral-100 bg-neutral-50/20 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                    <User size={16} className="text-primary" /> Identitas Pelapor
                  </h4>
                  <Badge variant="outline" className="text-[9px] font-bold text-neutral-400 border-neutral-200">Verified Identity</Badge>
               </div>
               <CardContent className="p-8 flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-3">
                     <div className="size-24 rounded-2xl bg-neutral-50 border-2 border-neutral-100 flex items-center justify-center text-primary text-3xl font-black shadow-inner">
                        {data.Mahasiswa?.Nama?.[0]}
                     </div>
                  </div>
                  <div className="flex-1 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Nama Lengkap</p>
                           <p className="text-base font-bold text-neutral-900 font-jakarta">{data.Mahasiswa?.Nama}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">NIM / Identifier</p>
                           <p className="text-base font-bold text-neutral-900 font-jakarta">{data.Mahasiswa?.NIM}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Fakultas / Node</p>
                           <p className="text-sm font-bold text-neutral-600 flex items-center gap-2 uppercase">
                              <Building2 size={14} className="text-primary/40" />
                              {data.Mahasiswa?.Fakultas?.Nama || 'Institusional'}
                           </p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Kontak Email</p>
                           <p className="text-sm font-bold text-neutral-600 flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary/40" style={{ fontSize: '14px' }} >mail</span>
                              {data.Mahasiswa?.User?.Email || '-'}
                           </p>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Aspiration Content Card */}
            <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white overflow-hidden">
               <div className="p-6 border-b border-neutral-100 flex items-center gap-3 bg-neutral-50/20">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }} >chat</span>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Substansi Aspirasi</h4>
               </div>
               <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                     <h3 className="text-2xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight italic">
                        "{data.Judul || data.Subjek}"
                     </h3>
                     <div className="p-8 rounded-2xl bg-neutral-50 border border-neutral-100 shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined" style={{ fontSize: '100px' }} >chat</span></div>
                        <p className="text-base text-neutral-600 font-medium leading-relaxed font-inter relative z-10 whitespace-pre-wrap">
                           {data.Isi || 'Tidak ada deskripsi konten.'}
                        </p>
                     </div>
                  </div>

                  {/* Attachment Section */}
                  <div className="space-y-4">
                     <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                        <ImageIcon size={14} className="text-primary" /> Bukti Lampiran Visual
                     </h4>
                     {data.BuktiURL ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="relative aspect-video rounded-2xl overflow-hidden border border-neutral-200 shadow-lg group">
                              <img 
                                 src={getCleanImageUrl(data.BuktiURL)} 
                                 alt="Bukti Aspirasi" 
                                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <a 
                                    href={getCleanImageUrl(data.BuktiURL)} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-6 py-3 bg-white text-neutral-900 rounded-xl font-bold text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 hover:bg-primary hover:text-white transition-all active:scale-95"
                                 >
                                    <ExternalLink size={14} /> Full View
                                 </a>
                              </div>
                           </div>
                           <div className="p-6 rounded-2xl bg-neutral-50 border border-dashed border-neutral-200 flex flex-col justify-center gap-4">
                              <div className="space-y-1">
                                 <p className="text-sm font-bold text-neutral-900 font-jakarta">Informasi Berkas</p>
                                 <p className="text-xs text-neutral-500 font-medium leading-relaxed">Mahasiswa telah menyertakan bukti visual untuk mendukung aspirasi mereka. Silakan periksa detail gambar untuk memvalidasi laporan.</p>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] font-bold text-neutral-400 uppercase">
                                 <FileImage size={14} /> IMAGE_PROOF.JPG
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="p-16 rounded-2xl border-2 border-dashed border-neutral-100 flex flex-col items-center justify-center gap-4 text-neutral-300">
                           <div className="size-20 rounded-full bg-neutral-50 flex items-center justify-center opacity-40"><ImageIcon size={40} strokeWidth={1} /></div>
                           <div className="text-center space-y-1">
                              <p className="text-sm font-bold uppercase tracking-[0.2em]">Tidak Ada Lampiran</p>
                              <p className="text-[11px] font-medium">Mahasiswa tidak menyertakan foto atau dokumen pendukung.</p>
                           </div>
                        </div>
                     )}
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* ── Right Column: Resolution Control Panel ───────────────── */}
          <div className="space-y-8 sticky top-8">
            <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white overflow-hidden border-none shadow-2xl">
               <div className="p-6 border-b border-neutral-100 flex items-center gap-3 bg-neutral-900 text-white">
                  <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center text-white"><span className="material-symbols-outlined" style={{ fontSize: '18px' }} Check >security</span></div>
                  <h4 className="text-xs font-bold uppercase tracking-widest">Incident Governance</h4>
               </div>
               <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                     <Label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest ml-1">Status Resolusi</Label>
                     <div className="grid grid-cols-2 gap-3">
                        {[
                           { val: 'proses', label: 'ON PROCESS', icon: Clock, color: 'hover:bg-blue-50 hover:text-blue-700', active: 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' },
                           { val: 'Selesai', label: 'RESOLVED', icon: CheckCircle2, color: 'hover:bg-emerald-50 hover:text-emerald-700', active: 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' },
                           { val: 'Ditinjau', label: 'REVIEW', icon: Activity, color: 'hover:bg-amber-50 hover:text-amber-700', active: 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-100' },
                           { val: 'Ditolak', label: 'REJECTED', icon: X, color: 'hover:bg-rose-50 hover:text-rose-700', active: 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-100' },
                        ].map(s => (
                           <button 
                              key={s.val} 
                              type="button"
                              onClick={() => setForm({ ...form, status: s.val })}
                              className={cn(
                                 'h-14 rounded-xl flex flex-col items-center justify-center gap-1 border border-neutral-100 transition-all duration-300 font-bold uppercase tracking-widest text-[9px]',
                                 s.color,
                                 form.status === s.val && s.active
                              )}
                           >
                              <s.icon size={14} />
                              {s.label}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <Label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest ml-1">Tanggapan Institusi</Label>
                     <textarea 
                        value={form.respon}
                        onChange={e => setForm({ ...form, respon: e.target.value })}
                        placeholder="Berikan jawaban atau solusi terkait aspirasi ini..."
                        className="w-full min-h-[180px] rounded-2xl border-neutral-200 bg-neutral-50/50 focus:bg-white p-6 font-medium text-sm font-inter transition-all shadow-inner focus:ring-2 focus:ring-primary/10 outline-none"
                     />
                  </div>

                  <div className="pt-2">
                     <Button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full h-14 rounded-2xl bg-neutral-900 text-white hover:bg-primary font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-neutral-900/10 active:scale-95 transition-all group"
                     >
                        {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '18px' }} >sync</span> : <span className="material-symbols-outlined mr-3 group-hover:rotate-12 transition-transform" style={{ fontSize: '18px' }} >save</span>} 
                        Commit Resolution
                     </Button>
                  </div>
               </CardContent>
            </Card>

            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-4">
               <span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5" style={{ fontSize: '18px' }} >error</span>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">SLA Information</p>
                  <p className="text-[11px] text-amber-600 font-medium leading-relaxed">
                     Aspirasi ini memiliki batas penanganan dalam 3x24 jam sejak tiket dibuat. Pastikan resolusi diberikan secara objektif.
                  </p>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

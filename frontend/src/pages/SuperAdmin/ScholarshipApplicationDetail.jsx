"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Label } from './components/ui/label'
import { Textarea } from './components/ui/textarea'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../services/api'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const ArrowLeft = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>arrow_back</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const BookOpen = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>menu_book</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const History = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>history</span>;
const ExternalLink = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>open_in_new</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Loader2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;
const Check = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check</span>;
const X = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>close</span>;



export default function ScholarshipApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ status: '', catatan: '' })

  const fetchDetail = async () => {
    setLoading(true)
    try {
      // We'll use the same API or a specific one if available
      // For now, let's assume we fetch all and filter, or a specific endpoint
      const res = await adminService.getAllScholarshipApplications()
      if (res.status === 'success') {
        const detail = res.data.find(item => String(item.ID) === id)
        if (detail) {
          setData(detail)
          setForm({ status: detail.Status, catatan: detail.Catatan || '' })
        } else {
          toast.error('Data pendaftar tidak ditemukan')
          navigate('/admin/scholarships')
        }
      }
    } catch (err) {
      toast.error('Gagal memuat detail pendaftar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [id])

  const handleUpdateStatus = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await adminService.updateScholarshipApplicationStatus(id, form)
      if (res.status === 'success') {
        toast.success('Status pendaftaran berhasil diperbarui')
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

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />
      
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* ── Breadcrumbs & Back ────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin/scholarships')}
              className="group h-10 w-10 p-0 rounded-xl hover:bg-white hover:shadow-sm transition-all"
            >
              <ArrowLeft size={18} className="text-neutral-400 group-hover:text-primary transition-colors" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-jakarta">
                <Link to="/admin" className="hover:text-primary">Dashboard</Link>
                <span>/</span>
                <Link to="/admin/scholarships" className="hover:text-primary">Beasiswa</Link>
                <span>/</span>
                <span className="text-primary/60">Detail Verifikasi</span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 font-jakarta tracking-tight">Detail Verifikasi Pendaftar</h2>
            </div>
          </div>

          <Badge className={cn(
            'px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest shadow-sm',
            data.Status === 'Menunggu' ? 'bg-amber-50 text-amber-700 border-amber-100' :
            data.Status === 'Proses' ? 'bg-blue-50 text-blue-700 border-blue-100' :
            data.Status === 'Diterima' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
            'bg-rose-50 text-rose-700 border-rose-100'
          )}>
            Status: {data.Status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* ── Left Column: Student & Program Info ─────────────────── */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Student Profile Card */}
            <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white overflow-hidden">
              <div className="p-8 border-b border-neutral-100 bg-neutral-50/30 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="size-16 rounded-2xl bg-white border-2 border-primary/10 flex items-center justify-center text-primary text-2xl font-black shadow-sm">
                    {data.Mahasiswa?.Nama?.[0]}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-neutral-900 font-jakarta tracking-tight leading-none uppercase">{data.Mahasiswa?.Nama}</h3>
                    <p className="text-sm font-medium text-neutral-400 font-inter">{data.Mahasiswa?.NIM} • Angkatan {data.Mahasiswa?.TahunMasuk || '-'}</p>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                   <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">IPK Terakhir</p>
                   <p className="text-2xl font-black text-primary font-jakarta tabular-nums leading-none">3.85</p>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.15em] flex items-center gap-2">
                        <BookOpen size={14} className="text-primary" /> Informasi Akademik
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-100 space-y-1">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Fakultas / Unit</p>
                          <p className="text-sm font-bold text-neutral-700 uppercase leading-tight">{data.Mahasiswa?.Fakultas?.Nama || 'Universitas Bhakti Kencana'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-100 space-y-1">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Program Studi</p>
                          <p className="text-sm font-bold text-neutral-700">{data.Mahasiswa?.ProgramStudi?.Nama || '-'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.15em] flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }} >mail</span> Kontak Mahasiswa
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-100 space-y-1">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Email</p>
                          <p className="text-xs font-bold text-neutral-700 truncate">{data.Mahasiswa?.User?.Email || '-'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-100 space-y-1">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">WhatsApp</p>
                          <p className="text-xs font-bold text-neutral-700">{data.Mahasiswa?.Phone || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 border-l border-neutral-100 md:pl-10">
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.15em] flex items-center gap-2">
                        <Award size={14} className="text-emerald-500" /> Detail Program Beasiswa
                      </h4>
                      <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Nama Program</p>
                          <p className="text-lg font-bold text-neutral-900 font-jakarta leading-tight">{data.Beasiswa?.Nama}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">IPK Minimal</p>
                              <p className="text-sm font-bold text-neutral-700">{data.Beasiswa?.IPKMin?.toFixed(2)}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Batas Akhir</p>
                              <p className="text-sm font-bold text-neutral-700">{data.Beasiswa?.Deadline ? new Date(data.Beasiswa.Deadline).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.15em] flex items-center gap-2">
                        <History size={14} className="text-primary" /> Log Pendaftaran
                      </h4>
                      <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-100 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-neutral-400" style={{ fontSize: '16px' }} >calendar_month</span>
                            <div className="flex flex-col">
                               <p className="text-[9px] font-bold text-neutral-400 uppercase">Waktu Submit</p>
                               <p className="text-xs font-bold text-neutral-700">{new Date(data.CreatedAt).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Verification Card */}
            <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white overflow-hidden">
               <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/20">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }} >description</span> Validasi Dokumen Pendukung
                  </h4>
               </div>
               <CardContent className="p-8">
                  {data.BuktiURL ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                       <div className="md:col-span-3 flex items-center gap-5 p-5 rounded-2xl bg-neutral-50 border border-neutral-200 shadow-sm group">
                          <div className="size-14 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform"><span className="material-symbols-outlined" style={{ fontSize: '28px' }}  strokeWidth={1.5}>description</span></div>
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                             <p className="text-sm font-bold text-neutral-900 font-jakarta truncate">Berkas_Pendaftaran_Beasiswa.pdf</p>
                             <p className="text-[11px] font-medium text-neutral-400">Pastikan untuk memeriksa seluruh halaman dokumen secara teliti.</p>
                          </div>
                       </div>
                       <a 
                          href={`${API_BASE_URL.replace('/api', '')}${data.BuktiURL}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="h-14 flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 text-white hover:bg-primary transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-neutral-200 active:scale-95"
                       >
                          <ExternalLink size={16} /> Buka Berkas
                       </a>
                    </div>
                  ) : (
                    <div className="p-12 rounded-2xl border-2 border-dashed border-neutral-100 flex flex-col items-center justify-center gap-4 text-neutral-300">
                       <div className="size-20 rounded-full bg-neutral-50 flex items-center justify-center opacity-40"><span className="material-symbols-outlined" style={{ fontSize: '40px' }}  strokeWidth={1}>description</span></div>
                       <div className="text-center space-y-1">
                          <p className="text-sm font-bold uppercase tracking-[0.2em]">Dokumen Kosong</p>
                          <p className="text-[11px] font-medium">Mahasiswa belum mengunggah berkas persyaratan.</p>
                       </div>
                    </div>
                  )}
               </CardContent>
            </Card>
          </div>

          {/* ── Right Column: Verification Controls ──────────────────── */}
          <div className="space-y-8">
            <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white sticky top-8">
               <div className="p-6 border-b border-neutral-100 flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '18px' }} >show_chart</span></div>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Panel Keputusan</h4>
               </div>
               <CardContent className="p-6 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest ml-1">Update Status Verifikasi</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: 'Menunggu', icon: Loader2, color: 'hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200', active: 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-200' },
                        { val: 'Proses', icon: Activity, color: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200', active: 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' },
                        { val: 'Diterima', icon: Check, color: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200', active: 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200' },
                        { val: 'Ditolak', icon: X, color: 'hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200', active: 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-200' },
                      ].map(s => (
                        <button key={s.val} type="button" 
                          onClick={() => setForm({ ...form, status: s.val })}
                          className={cn('h-14 rounded-xl flex flex-col items-center justify-center gap-1 border border-neutral-100 transition-all duration-500 font-bold uppercase tracking-[0.1em] text-[9px]', s.color, form.status === s.val && s.active)}>
                          <s.icon size={16} className={cn(form.status === s.val && s.val === 'Menunggu' && "animate-spin")} />
                          {s.val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest ml-1">Catatan Peninjauan</Label>
                    <Textarea 
                      value={form.catatan} 
                      onChange={e => setForm({ ...form, catatan: e.target.value })} 
                      placeholder="Contoh: Berkas tidak lengkap, atau instruksi tindak lanjut..." 
                      className="min-h-[150px] rounded-2xl border-neutral-200 bg-neutral-50/50 focus:bg-white p-5 font-medium text-sm font-jakarta transition-all shadow-inner" 
                    />
                  </div>

                  <div className="pt-2">
                     <Button 
                        onClick={handleUpdateStatus} 
                        disabled={isSubmitting} 
                        className="w-full h-14 rounded-2xl bg-neutral-900 text-white hover:bg-primary font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-neutral-200 active:scale-[0.98] transition-all group"
                     >
                        {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '18px' }} >sync</span> : <span className="material-symbols-outlined mr-3 group-hover:rotate-12 transition-transform" style={{ fontSize: '18px' }} >save</span>} 
                        Update & Simpan Data
                     </Button>
                  </div>
               </CardContent>
            </Card>

            <div className="p-6 rounded-2xl bg-neutral-900 text-white shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700"><span className="material-symbols-outlined" style={{ fontSize: '100px' }} >show_chart</span></div>
               <div className="relative z-10 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-widest opacity-60">Panduan Verifikator</h5>
                  <p className="text-xs font-medium leading-relaxed">Pastikan berkas telah diverifikasi secara fisik jika diperlukan sebelum menekan tombol <b>Diterima</b>.</p>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

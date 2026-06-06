"use client"

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService, API_BASE_URL } from '../../services/api'

import { Badge } from './components/ui/badge'
import { cn } from '@/lib/utils'
import { toast, Toaster } from 'react-hot-toast'
import { Card } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Filter = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>filter_alt</span>;
const Database = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>storage</span>;
const ChevronRight = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chevron_right</span>;

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
        <span className="material-symbols-outlined text-slate-400/80 block select-none leading-none absolute" style={{ fontSize: className.includes('w-14') ? '28px' : '20px' }}>
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
    BuktiURL: asp.BuktiURL ?? asp.bukti_url ?? asp.FotoURL ?? asp.foto_url ?? asp.lampiran_url ?? asp.LampiranURL ?? '',
    Mahasiswa: {
      ...mahasiswa,
      Nama: mahasiswa.Nama ?? mahasiswa.nama ?? 'System Identity',
      NIM: mahasiswa.NIM ?? mahasiswa.nim ?? '-',
      Fakultas: {
        ...fakultas,
        Nama: fakultas.Nama ?? fakultas.nama ?? 'Institusional',
      },
      Foto: getCleanImageUrl(mahasiswa.foto_url || mahasiswa.FotoURL || mahasiswa.foto || mahasiswa.Foto || null)
    },
    Fakultas: {
      ...fakultas,
      Nama: fakultas.Nama ?? fakultas.nama ?? 'Institusional',
    },
  }
}

const AspirationControl = () => {
  const [aspirations, setAspirations] = useState([])
  const [stats, setStats] = useState({ active: 0, overdue: 0, resolved: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ status: '', respon: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [faculties, setFaculties] = useState([])
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [aspRes, statsRes, facRes] = await Promise.all([
        adminService.getGlobalAspirations(),
        adminService.getStats(),
        adminService.getAllFaculties()
      ])

      if (aspRes.status === 'success') {
        setAspirations((aspRes.data || []).map(normalizeAspiration))
      }
      if (statsRes.status === 'success') {
        setStats({
          active: statsRes.data.aspirasi_aktif || 0,
          overdue: statsRes.data.sla_overdue || 0,
          resolved: statsRes.data.resolved_today || 0
        })
      }
      if (facRes && facRes.status === 'success') {
        setFaculties(facRes.data || [])
      }
    } catch (error) {
      toast.error('Gagal memuat pusat aspirasi global')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAudit = (asp) => {
    setSelected(asp)
    setForm({
      status: asp.Status || 'proses',
      respon: asp.Respon || ''
    })
  }

  const handleSubmitResolution = async (e) => {
    if (e) e.preventDefault()
    if (!form.status || !form.respon) {
      toast.error('Status dan Tanggapan harus diisi')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await adminService.updateAspirationStatus(selected.ID, form)
      if (res.status === 'success') {
        toast.success('Resolusi aspirasi berhasil diperbarui')
        setSelected(null)
        loadData()
      } else {
        toast.error(res.message || 'Gagal memperbarui status')
      }
    } catch {
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  const normalizedSearch = searchTerm.toLowerCase()
  const filteredAspirations = aspirations.filter(asp => {
    const statusLower = (asp.Status || '').toLowerCase();
    const allowedStatuses = ['disetujui fakultas', 'selesai', 'proses', 'ditinjau', 'ditolak'];
    if (!allowedStatuses.includes(statusLower)) {
      return false;
    }

    // Filter by Faculty
    if (selectedFaculty) {
      const facultyName = (asp.Fakultas?.Nama || asp.Mahasiswa?.Fakultas?.Nama || '').toLowerCase();
      if (facultyName !== selectedFaculty.toLowerCase()) {
        return false;
      }
    }

    // Filter by Status
    if (selectedStatus) {
      if (statusLower !== selectedStatus.toLowerCase()) {
        return false;
      }
    }

    const title = asp.Judul?.toString().toLowerCase() || ''
    const studentName = asp.Mahasiswa?.Nama?.toString().toLowerCase() || ''
    const facultyName = asp.Fakultas?.Nama?.toString().toLowerCase() || asp.Mahasiswa?.Fakultas?.Nama?.toString().toLowerCase() || ''
    const ticketId = asp.ID?.toString() || ''

    return title.includes(normalizedSearch) ||
      studentName.includes(normalizedSearch) ||
      facultyName.includes(normalizedSearch) ||
      ticketId.includes(searchTerm)
  })

  // Priority mapping for UI
  const priorityStyles = {
    'CRITICAL': 'bg-rose-500 text-white shadow-lg shadow-rose-100',
    'HIGH': 'bg-amber-500 text-white shadow-lg shadow-amber-100',
    'NORMAL': 'bg-primary text-white shadow-lg shadow-primary/20',
    'LOW': 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
  }

  return (
    <div className="px-1 py-4 md:px-2 xl:px-4 min-h-screen bg-transparent font-inter">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-8 select-none">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="glass-card rounded-2xl border border-slate-200/60 p-6 md:p-8 relative overflow-hidden shadow-none">
            <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-bku-primary/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 w-1.5 bg-bku-primary rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-headline leading-none">Incident Management</span>
                    </div>
                    <h1 className="text-2xl font-black font-headline tracking-tight leading-none" style={{ color: 'var(--theme-h1)' }}>
                        Global <span className="text-bku-primary">Aspiration Hub</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-[11px] max-w-2xl leading-relaxed">
                        Pusat monitoring dan resolusi aspirasi mahasiswa lintas fakultas. Pastikan setiap suara mahasiswa mendapatkan penanganan sesuai SLA.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline"
                        onClick={loadData}
                        className="h-11 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 hover:text-bku-primary gap-2.5 transition-all active:scale-95 shadow-none cursor-pointer font-headline"
                    >
                        <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }} >show_chart</span>
                        Live Refresh
                    </Button>
                </div>
            </div>
        </section>

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-bku-primary/10 rounded-xl flex justify-center items-center text-bku-primary flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >chat</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-widest">Active Tickets</span>
              </div>
              <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{stats.active}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Aspirasi menunggu respons</p>
           </div>

           <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-rose-50 rounded-xl flex justify-center items-center text-rose-500 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >error</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-widest">SLA Overdue</span>
              </div>
              <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{stats.overdue}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Melewati batas waktu SLA</p>
           </div>

           <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-emerald-50 rounded-xl flex justify-center items-center text-emerald-500 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >check_circle</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-widest">Resolved Today</span>
              </div>
              <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{stats.resolved}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Ditangani hari ini</p>
           </div>

           <div className="glass-card p-5 rounded-2xl border border-slate-200/60 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-slate-100 rounded-xl flex justify-center items-center text-slate-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >storage</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-widest">Total Aspirasi</span>
              </div>
              <p className="text-2xl font-black text-slate-800 font-headline leading-none tabular-nums">{stats.total ?? (stats.active + stats.overdue + stats.resolved)}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Seluruh aspirasi masuk</p>
           </div>
        </div>

        {/* ── Main Data Table ────────────────────────────────────── */}
        <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200/40 bg-white/40 flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 stroke-[3px] group-focus-within:text-bku-primary transition-colors" >search</span>
                  <Input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/60 border-slate-200 h-11 pl-11 rounded-xl text-[11px] font-bold text-slate-700 focus:ring-bku-primary/20 uppercase tracking-widest placeholder:text-slate-400" 
                    placeholder="Search incident ID, student name, or faculty node..." 
                  />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                {/* Faculty Filter */}
                <div className="relative w-full sm:w-[200px]">
                  <select
                    value={selectedFaculty}
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary cursor-pointer appearance-none"
                  >
                    <option value="">Semua Fakultas</option>
                    {faculties.map((fac) => (
                      <option key={fac.id || fac.ID} value={fac.nama || fac.Nama}>
                        {fac.nama || fac.Nama}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ fontSize: '16px' }}>expand_more</span>
                </div>

                {/* Status Filter */}
                <div className="relative w-full sm:w-[160px]">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bku-primary cursor-pointer appearance-none"
                  >
                    <option value="">Semua Status</option>
                    <option value="proses">On Process</option>
                    <option value="Selesai">Resolved</option>
                    <option value="Ditinjau">Review</option>
                    <option value="Ditolak">Rejected</option>
                    <option value="disetujui fakultas">Disetujui Fakultas</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ fontSize: '16px' }}>expand_more</span>
                </div>
              </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black font-headline uppercase tracking-widest text-slate-500 border-b border-slate-200/40">
                  <th className="px-6 py-4">Incident Ticket</th>
                  <th className="px-6 py-4">Faculty / Sub-Unit</th>
                  <th className="px-6 py-4 text-center">Priority</th>
                  <th className="px-6 py-4">SLA / Status</th>
                  <th className="px-6 py-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {loading ? (
                    <tr>
                        <td colSpan="5" className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <span className="material-symbols-outlined size-8 animate-spin text-primary" >sync</span>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Synchronizing Global Nodes...</p>
                            </div>
                        </td>
                    </tr>
                ) : filteredAspirations.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
                                <Database size={48} className="text-neutral-300" />
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">No incident tickets found</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    filteredAspirations.map((asp, index) => (
                        <tr key={asp.ID || `aspiration-${index}`} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-800 uppercase tracking-tight text-sm font-headline group-hover:text-bku-primary transition-colors">
                                    #ASP-{asp.ID?.toString().padStart(4, '0') || '----'}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium uppercase truncate max-w-[220px]">
                                    {asp.Subjek || asp.Judul || 'Untranslated Subject'}
                                    </p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-slate-800 uppercase tracking-tight font-headline">
                                        {asp.Fakultas?.Nama || 'Institusional Node'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                        {asp.Mahasiswa?.Nama || 'Unknown Identity'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <Badge className={cn('px-2.5 py-1 rounded-lg border-none text-[9px] font-bold uppercase tracking-widest shadow-none', 
                                    asp.Priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 
                                    asp.Priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')}>
                                    {asp.Priority || 'NORMAL'}
                                </Badge>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-2.5 max-w-[140px]">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className={cn('text-[9px] font-bold uppercase tracking-widest', asp.Deadline && new Date(asp.Deadline) < new Date() ? 'text-rose-500' : 'text-slate-400')}>
                                            {asp.Deadline ? `DL: ${new Date(asp.Deadline).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}` : 'SLA Standard'}
                                        </span>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-headline">{asp.Status || 'OPEN'}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={cn('h-full transition-all duration-1000 rounded-full', 
                                            asp.Status === 'Selesai' ? 'w-full bg-emerald-500' : 
                                            asp.Status === 'Proses' ? 'w-[60%] bg-bku-primary' : 
                                            asp.Status === 'Disetujui Fakultas' ? 'w-[40%] bg-blue-500' : 'w-[20%] bg-slate-300')} />
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Button 
                                variant="outline"
                                onClick={() => handleOpenAudit(asp)}
                                className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 text-[10px] font-black font-headline uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all gap-2 shadow-none cursor-pointer"
                                >
                                    Audit Detail
                                    <ChevronRight size={12} strokeWidth={3} />
                                </Button>
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── Global Aspiration Audit Dialog Popup Modal ───────────────── */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh] animate-scale-up"
            onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 pt-6 pb-6 px-8 overflow-hidden flex-shrink-0 flex items-center justify-between">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"/>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >security</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-[0.25em]">
                    <span>Incident Audit Manager</span>
                    <span>·</span>
                    <span className="text-amber-400">#ASP-{selected.ID?.toString().padStart(4, '0')}</span>
                  </div>
                  <h2 className="text-lg font-black font-headline leading-tight uppercase truncate max-w-[500px] mt-0.5 text-white">
                    {selected.Judul || selected.Subjek}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className={cn(
                  'px-3.5 py-1.5 rounded-xl border text-[9px] font-extrabold uppercase tracking-widest shadow-sm',
                  selected.Status === 'Selesai' ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200' :
                  selected.Status === 'Proses' ? 'bg-blue-500/20 border-blue-400/30 text-blue-200' :
                  'bg-amber-500/20 border-amber-400/30 text-amber-200'
                )}>
                  Status: {selected.Status || 'OPEN'}
                </Badge>
                
                <button onClick={() => setSelected(null)}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all active:scale-95 text-white">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >close</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-5 gap-8 custom-scrollbar">
              
              {/* Left Column: Reporter Profile, Content Subjek & Attachments */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Reporter Profile Block */}
                <div className="p-6 rounded-2xl bg-neutral-50/50 border border-neutral-100 shadow-sm flex flex-col md:flex-row gap-5 items-start">
                  <StudentAvatar src={selected.Mahasiswa?.Foto} name={selected.Mahasiswa?.Nama} className="w-16 h-16 rounded-2xl shadow-md ring-4 ring-neutral-100 shrink-0" />
                  
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Identitas Pelapor</span>
                      <Badge variant="outline" className="text-[8px] font-black text-neutral-400 uppercase tracking-widest border-neutral-200 px-2 py-0.5">Verified Mahasiswa</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Nama Lengkap</p>
                        <p className="font-bold text-neutral-800 truncate">{selected.Mahasiswa?.Nama}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">NIM / Identifier</p>
                        <p className="font-mono font-bold text-neutral-800">{selected.Mahasiswa?.NIM}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Fakultas / Node asal</p>
                        <p className="font-bold text-neutral-700 uppercase flex items-center gap-1.5 mt-0.5">
                          <span className="material-symbols-outlined text-[14px] text-primary/60">business</span>
                          {selected.Mahasiswa?.Fakultas?.Nama || 'Institusional'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Substantive Content */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black font-headline uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--theme-h4)' }}>
                    <span className="material-symbols-outlined text-primary text-[16px]">chat</span> Substansi Aspirasi
                  </h4>
                  <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <span className="material-symbols-outlined text-[80px]" >chat</span>
                    </div>
                    <p className="text-sm text-neutral-600 font-medium leading-relaxed font-inter relative z-10 whitespace-pre-wrap">
                      "{selected.Isi || 'Tidak ada deskripsi konten.'}"
                    </p>
                  </div>
                </div>

                {/* Visual Proof Section */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black font-headline uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--theme-h4)' }}>
                    <span className="material-symbols-outlined text-primary text-[16px]">image</span> Bukti Lampiran Visual
                  </h4>
                  
                  {selected.BuktiURL ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      <div className="md:col-span-5 relative aspect-video rounded-xl overflow-hidden border border-neutral-200 shadow-md group">
                        <img 
                          src={getCleanImageUrl(selected.BuktiURL)} 
                          alt="Bukti Aspirasi" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a 
                            href={getCleanImageUrl(selected.BuktiURL)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-4 py-2 bg-white text-neutral-900 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-1.5 hover:bg-primary hover:text-white transition-all active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[13px]">open_in_new</span> Full View
                          </a>
                        </div>
                      </div>
                      
                      <div className="md:col-span-7 p-4 rounded-xl bg-neutral-50 border border-dashed border-neutral-200 flex flex-col justify-center gap-1.5">
                        <p className="text-xs font-bold text-neutral-900 font-jakarta">Berkas Lampiran Laporan</p>
                        <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                          Lampiran pendukung telah disertakan oleh mahasiswa. Silakan periksa gambar secara detail untuk proses pembuktian data laporan.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-neutral-100 flex flex-col items-center justify-center gap-2 text-neutral-300 bg-neutral-50/20">
                      <span className="material-symbols-outlined text-[30px]" >image</span>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Tidak ada bukti lampiran gambar</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Governance Panel, Resolution Response Form */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Governance Card */}
                <div className="p-6 rounded-2xl bg-[#fafafa] border border-neutral-200/80 shadow-sm space-y-6">
                  
                  {/* Status Selection Buttons */}
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-0.5">Ubah Status Resolusi</Label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { val: 'proses', label: 'On Process', icon: 'schedule', active: 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' },
                        { val: 'Selesai', label: 'Resolved', icon: 'check_circle', active: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100' },
                        { val: 'Ditinjau', label: 'Review', icon: 'show_chart', active: 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-100' },
                        { val: 'Ditolak', label: 'Rejected', icon: 'close', active: 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-100' },
                      ].map(s => (
                        <button 
                          key={s.val} 
                          type="button"
                          onClick={() => setForm({ ...form, status: s.val })}
                          className={cn(
                            'h-12 rounded-xl flex items-center justify-center gap-1.5 border border-neutral-200/80 bg-white font-bold uppercase tracking-widest text-[9px] hover:bg-neutral-50 hover:text-neutral-900 transition-all duration-300',
                            form.status?.toLowerCase() === s.val.toLowerCase() && s.active
                          )}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }} >{s.icon}</span>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Response Textarea */}
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-0.5">Tanggapan Resmi Universitas</Label>
                    <textarea 
                      value={form.respon}
                      onChange={e => setForm({ ...form, respon: e.target.value })}
                      placeholder="Tuliskan respon resmi, klarifikasi, atau solusi yang diajukan institusi..."
                      className="w-full min-h-[140px] rounded-xl border border-neutral-200 bg-white p-4 font-medium text-xs font-inter focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none"
                    />
                  </div>

                  {/* Warning SLA Card */}
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600 shrink-0" style={{ fontSize: '16px' }} >error</span>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">SLA Resolution Limit</p>
                      <p className="text-[10px] text-amber-600 font-semibold leading-normal">
                        Batas penanganan standar adalah 3x24 jam sejak tiket dibuat. Harap berikan resolusi secara objektif dan akurat.
                      </p>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-end gap-3 flex-shrink-0">
              <Button 
                variant="outline"
                onClick={() => setSelected(null)}
                className="h-11 px-6 rounded-xl border-neutral-200 text-neutral-600 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-100 active:scale-95 transition-all"
              >
                Close Audit
              </Button>
              <Button 
                onClick={handleSubmitResolution}
                disabled={isSubmitting}
                className="h-11 px-6 rounded-xl bg-neutral-900 text-white hover:bg-primary font-black text-[10px] uppercase tracking-widest shadow-lg shadow-neutral-900/10 active:scale-95 transition-all gap-1.5"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '15px' }} >sync</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >save</span>
                )}
                Save & Commit Resolution
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default AspirationControl

"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from './components/ui/data-table'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog'
import { DeleteConfirmModal } from './components/ui/DeleteConfirmModal'
import { Card, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from './components/ui/select'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const UserX = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person_off</span>;
const UserIcon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const Building2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>business</span>;



const EMPTY_FORM = { 
  NIM: '', Nama: '', EmailKampus: '', FakultasID: '', 
  ProgramStudiID: '', SemesterSekarang: 1, StatusAkun: 'Aktif', 
  Alamat: '', TahunMasuk: new Date().getFullYear() 
}

function mapStatusAkun(statusAkun = '', statusAkademik = '') {
  const source = `${statusAkun} ${statusAkademik}`.toLowerCase()
  if (source.includes('lulus')) return 'Lulus'
  if (source.includes('cuti')) return 'Cuti'
  if (source.includes('non-aktif') || source.includes('nonaktif') || source.includes('mengundurkan') || source.includes('drop out') || source.includes('keluar')) return 'Non-Aktif'
  return 'Aktif'
}

function mapSemester(statusAkun = '', semester = 1) {
  if ((statusAkun || '').toLowerCase() === 'lulus') return 0
  const parsed = Number(semester)
  if (!Number.isInteger(parsed) || parsed < 1) return 1
  return parsed
}

function normalizeStudentRow(row = {}) {
  const normalizedStatus = mapStatusAkun(row.StatusAkun, row.StatusAkademik)
  return {
    ...row,
    StatusAkun: normalizedStatus,
    SemesterSekarang: mapSemester(normalizedStatus, row.SemesterSekarang)
  }
}

export default function StudentDirectory() {
  const [students, setStudents] = useState([])
  const [syncedNims, setSyncedNims] = useState(new Set())
  const [prodi, setProdi] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSyncing, setIsSyncing] = useState(false)

  const fetchData = async ({ syncFromPddikti = false, showSyncToast = false } = {}) => {
    setLoading(true)
    try {
      let latestSyncedNims = syncedNims
      if (syncFromPddikti) {
        const syncRes = await adminService.syncPddikti('Universitas Bhakti Kencana', 'all')
        const syncedList = syncRes?.data?.mahasiswa || []
        latestSyncedNims = new Set(syncedList.map(m => String(m?.nim || '').trim()).filter(Boolean))
        setSyncedNims(latestSyncedNims)
        if (showSyncToast) {
          toast.success('Sinkronisasi PDDikti Cluster Berhasil')
        }
      }
      const [stdRes, prodiRes, facRes] = await Promise.all([
        adminService.getAllStudents(), 
        adminService.getAllProdi(), 
        adminService.getAllFaculties()
      ])
      if (stdRes.status === 'success') {
        const allStudents = (stdRes.data || []).map(normalizeStudentRow)
        const filteredStudents = latestSyncedNims.size > 0
          ? allStudents.filter(s => latestSyncedNims.has(String(s?.NIM || '').trim()))
          : allStudents
        setStudents(filteredStudents)
      }
      if (prodiRes.status === 'success') setProdi(prodiRes.data || [])
      if (facRes.status === 'success') setFaculties(facRes.data || [])
    } catch { 
      toast.error('Gagal memuat sinkronisasi cluster') 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSyncPddikti = async () => {
    setIsSyncing(true)
    try {
      await fetchData({ syncFromPddikti: true, showSyncToast: true })
    } catch {
      toast.error('Gagal sinkronisasi PDDikti master-node')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleOpenAdd = () => { setIsEditMode(false); setForm(EMPTY_FORM); setIsCrudOpen(true) }
  
  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setForm({ 
      ID: row.ID, 
      NIM: row.NIM || '', 
      Nama: row.Nama || '', 
      EmailKampus: row.EmailKampus || row.Pengguna?.Email || '', 
      FakultasID: String(row.FakultasID || ''), 
      ProgramStudiID: String(row.ProgramStudiID || ''), 
      SemesterSekarang: row.SemesterSekarang || 1, 
      StatusAkun: row.StatusAkun || 'Aktif', 
      Alamat: row.Alamat || '', 
      TahunMasuk: row.TahunMasuk || new Date().getFullYear() 
    })
    setIsCrudOpen(true)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    const payload = { 
      ...form, 
      FakultasID: parseInt(form.FakultasID) || 0, 
      ProgramStudiID: parseInt(form.ProgramStudiID) || 0, 
      SemesterSekarang: parseInt(form.SemesterSekarang) || 1, 
      TahunMasuk: parseInt(form.TahunMasuk) || new Date().getFullYear() 
    }
    try {
      const res = form.ID ? await adminService.updateStudent(form.ID, payload) : await adminService.createStudent(payload)
      if (res.status === 'success') {
        toast.success(form.ID ? 'Profil mahasiswa berhasil diperbarui' : 'Registrasi mahasiswa baru berhasil')
        setIsCrudOpen(false)
        fetchData()
      } else {
        toast.error(res.message || 'Gagal menyimpan konfigurasi data')
      }
    } catch (err) {
      toast.error(err.message || 'Kesalahan operasional internal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteStudent(selected.ID)
      toast.success('Entitas mahasiswa berhasil dihapus')
      setIsDelOpen(false)
      fetchData()
    } catch { 
      toast.error('Gagal menghapus entitas data') 
    } finally { 
      setIsSubmitting(false) 
    }
  }

  const STATUS_STYLES = {
    'Aktif': 'bg-[#ecfdf5] text-[#059669] border-[#d1fae5] shadow-none',
    'Cuti': 'bg-[#fffbeb] text-[#d97706] border-[#fef3c7] shadow-none',
    'Lulus': 'bg-[#eff6ff] text-[#2563eb] border-[#dbeafe] shadow-none',
    'Non-Aktif': 'bg-[#fef2f2] text-[#dc2626] border-[#fee2e2] shadow-none',
    'DEFAULT': 'bg-neutral-50 text-neutral-400 border-neutral-100'
  }

  const columns = [
    { 
      key: 'NIM', 
      label: 'ID / NIM', 
      className: 'w-[120px]', 
      render: v => (
        <code className="text-[12px] font-bold text-[#3b82f6] tracking-[0.1em] bg-[#eff6ff] px-2 py-1 rounded-lg border border-[#dbeafe]">
          {v || '—'}
        </code>
      )
    },
    { 
      key: 'Nama', 
      label: 'Identitas Mahasiswa', 
      className: 'w-[280px]',
      render: (v, row) => (
        <div className="flex items-center gap-4 py-2 group/avatar">
          <Avatar className="h-11 w-11 rounded-xl border-2 border-white shadow-md transition-all group-hover/avatar:scale-110 overflow-hidden">
            {row.Foto || row.Pengguna?.Foto ? (
              <AvatarImage src={row.Foto || row.Pengguna?.Foto} className="object-cover size-full" />
            ) : (
              <AvatarFallback className="bg-slate-100 flex items-end justify-center overflow-hidden size-full rounded-none">
                <svg className="w-9 h-9 text-slate-400 translate-y-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0 1 12.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                </svg>
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px] leading-tight">
              {v ? v.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) : '—'}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-neutral-400">
               <span className="material-symbols-outlined text-primary/60" style={{ fontSize: '10px' }} >mail</span>
               <span className="text-[10px] font-bold tracking-widest lowercase">{row.EmailKampus || row.Pengguna?.Email || '—'}</span>
            </div>
          </div>
        </div>
      )
    },
    { 
      key: 'Fakultas', 
      label: 'Fakultas', 
      className: 'w-[180px]', 
      render: v => <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight font-jakarta leading-snug block truncate" title={v?.Nama || v?.nama}>{v?.Nama || v?.nama || '—'}</span> 
    },
    { 
      key: 'ProgramStudi', 
      label: 'Program Studi', 
      className: 'w-[200px]', 
      render: v => <span className="text-[12px] font-extrabold text-neutral-700 font-jakarta tracking-tight leading-tight block truncate" title={v?.Nama || v?.nama}>{v?.Nama || v?.nama || '—'}</span> 
    },
    { 
      key: 'SemesterSekarang', 
      label: 'Smstr', 
      className: 'w-[60px] text-center', 
      cellClassName: 'text-center', 
      render: (v, row) => (
        <div className="flex flex-col items-center">
           <span className="font-bold text-neutral-900 font-jakarta text-sm tabular-nums leading-none">{row.StatusAkun === 'Lulus' ? '—' : (v || 1)}</span>
           {row.StatusAkun !== 'Lulus' && <span className="text-[8px] font-bold text-neutral-300 uppercase tracking-widest mt-1">Active</span>}
        </div>
      )
    },
    { 
      key: 'StatusAkun', 
      label: 'Status', 
      className: 'w-[140px] text-center', 
      cellClassName: 'text-center pr-4', 
      render: v => (
        <Badge className={cn('px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider shadow-none', STATUS_STYLES[v] || STATUS_STYLES.DEFAULT)}>
          {v || 'Aktif'}
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
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Enrollment Governance</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                Direktori <span className="text-primary">Mahasiswa</span>
              </h1>
              <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed">
                Database pusat manajemen akademik, sinkronisasi PDDikti cluster, dan verifikasi status aktif seluruh civitas akademika Universitas Bhakti Kencana.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleSyncPddikti} 
                variant="outline" 
                disabled={isSyncing}
                className="h-11 px-6 rounded-xl border-neutral-200 text-xs font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 gap-2 transition-all active:scale-95 shadow-sm"
              >
                {isSyncing ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <RefreshCw size={14} className="text-primary" />}
                {isSyncing ? 'Syncing...' : 'PDDIKTI Sync'}
              </Button>
              
              <Button 
                onClick={handleOpenAdd}
                className="h-11 px-6 rounded-xl bg-neutral-900 text-white hover:bg-primary shadow-xl shadow-neutral-900/10 gap-2 transition-all active:scale-95 border-none"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}  strokeWidth={3}>add</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[10px]">New Registration</span>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-[#eef4ff] rounded-xl flex justify-center items-center text-[#00236F] flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >group</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Total Mahasiswa</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{students.length}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Seluruh mahasiswa terdaftar</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex justify-center items-center text-[#16a34a] flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >school</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Mahasiswa Aktif</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{students.filter(s => s.StatusAkun === 'Aktif').length}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Sedang menempuh studi</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-amber-50 rounded-xl flex justify-center items-center text-amber-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >trending_up</span>
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Lulus</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{students.filter(s => s.StatusAkun === 'Lulus').length}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Telah menyelesaikan studi</p>
           </div>

           <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 bg-rose-50 rounded-xl flex justify-center items-center text-rose-600 flex-shrink-0">
                    <UserX size={18} />
                 </div>
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Non-Aktif</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] font-jakarta leading-none tabular-nums">{students.filter(s => s.StatusAkun !== 'Aktif' && s.StatusAkun !== 'Lulus').length}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">Cuti / Keluar / DO</p>
           </div>
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns} 
              data={students} 
              loading={loading}
              searchPlaceholder="Search by NIM, Name, or Academic Status..."
              searchWidth="max-w-md"
              filters={[
                { key: 'StatusAkun', placeholder: 'FILTER STATUS', options: [{ label: 'AKTIF', value: 'Aktif' }, { label: 'CUTI', value: 'Cuti' }, { label: 'LULUS', value: 'Lulus' }] },
                { key: 'FakultasID', placeholder: 'FILTER FAKULTAS', options: faculties.map(f => ({ label: f.Nama || f.nama, value: f.id || f.ID })) },
                { key: 'ProgramStudiID', placeholder: 'FILTER PRODI', options: prodi.map(p => ({ label: p.Nama || p.nama, value: p.id || p.ID })) }
              ]}
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button onClick={() => { setSelected(row); setIsDetailOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors shadow-none"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >visibility</span></Button>
                  <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors shadow-none"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >edit</span></Button>
                  <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shadow-none"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >delete</span></Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Detail Profile Modal ─────────────────────────────────── */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white animate-in zoom-in-95 duration-300">
            <DialogTitle className="sr-only">Profil Mahasiswa</DialogTitle>
            <DialogDescription className="sr-only">Informasi lengkap biodata mahasiswa</DialogDescription>
            {selected && (
              <div className="flex flex-col">
                {/* Profile Header Pattern */}
                <div className="h-32 bg-neutral-900 relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-white"><span className="material-symbols-outlined rotate-12" style={{ fontSize: '140px' }} >school</span></div>
                  <div className="absolute bottom-4 right-6 flex items-center gap-2">
                     <Badge className={cn("px-3 py-1 rounded-lg border-none text-[9px] font-bold uppercase tracking-widest", STATUS_STYLES[selected.StatusAkun] || STATUS_STYLES.DEFAULT)}>
                        {selected.StatusAkun}
                     </Badge>
                  </div>
                </div>
                
                {/* Profile Content Section */}
                <div className="px-10 pb-10 relative">
                  <div className="relative -mt-12 mb-8 flex items-end gap-6">
                    <Avatar className="h-28 w-28 rounded-2xl border-[6px] border-white shadow-2xl bg-white overflow-hidden">
                      {selected.Foto || selected.Pengguna?.Foto ? (
                        <AvatarImage src={selected.Foto || selected.Pengguna?.Foto} className="object-cover size-full" />
                      ) : (
                        <AvatarFallback className="bg-slate-100 flex items-end justify-center overflow-hidden size-full rounded-none">
                          <svg className="w-20 h-20 text-slate-400 translate-y-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0 1 12.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                          </svg>
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="pb-2 space-y-1">
                      <h2 className="text-2xl font-bold text-neutral-900 font-jakarta tracking-tight leading-none">{selected.Nama}</h2>
                      <div className="flex items-center gap-2 text-neutral-400">
                         <span className="text-[11px] font-bold tracking-[0.2em] uppercase">{selected.NIM}</span>
                         <div className="size-1 bg-neutral-200 rounded-full" />
                         <span className="text-[11px] font-bold uppercase tracking-widest italic">{selected.ProgramStudi?.Nama}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <div className="group">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-1">Institutional Location</p>
                          <div className="flex items-start gap-3">
                             <div className="size-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-primary transition-colors"><Building2 size={14} /></div>
                             <p className="text-[13px] font-bold text-neutral-700 leading-snug">{selected.Fakultas?.Nama || '—'}</p>
                          </div>
                       </div>
                       <div className="group">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-1">Academic Cycle</p>
                          <div className="flex items-start gap-3">
                             <div className="size-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-primary transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '14px' }} >schedule</span></div>
                             <p className="text-[13px] font-bold text-neutral-700 leading-snug">Semester {selected.StatusAkun === 'Lulus' ? 'Complete' : selected.SemesterSekarang} <span className="text-neutral-400 mx-1">•</span> Batch {selected.TahunMasuk}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="group">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-1">Digital Identity</p>
                          <div className="flex items-start gap-3">
                             <div className="size-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-primary transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '14px' }} >mail</span></div>
                             <p className="text-[13px] font-bold text-neutral-700 leading-snug lowercase">{selected.EmailKampus || selected.Pengguna?.Email || '—'}</p>
                          </div>
                       </div>
                       <div className="group">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-1">Residence</p>
                          <div className="flex items-start gap-3">
                             <div className="size-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-primary transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '14px' }} >location_on</span></div>
                             <p className="text-[13px] font-bold text-neutral-700 leading-snug italic">{selected.Alamat || 'Residence unassigned'}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <footer className="p-8 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="h-12 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:bg-neutral-100 transition-all">Dismiss</Button>
                  <Button onClick={() => { setIsDetailOpen(false); handleOpenEdit(selected) }} className="h-12 px-8 rounded-xl bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary shadow-xl shadow-neutral-900/10 transition-all active:scale-95 border-none flex items-center gap-2">
                     <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >edit</span>
                     Modify Profile
                  </Button>
                </footer>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ── CRUD Modal ───────────────────────────────────────────── */}
        <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
          <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white animate-in slide-in-from-bottom-4 duration-300">
            <DialogHeader className="p-8 pb-6 border-b border-neutral-100 relative overflow-hidden bg-neutral-50/50">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary"><UserIcon size={140} /></div>
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                    {isEditMode ? <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '12px' }}  strokeWidth={3}>add</span>}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Registry Engine</span>
                </div>
                <DialogTitle className="text-2xl font-bold font-jakarta tracking-tight text-neutral-900">
                  {isEditMode ? 'Update Identity' : 'Enroll Student'}
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-neutral-400">
                  Lengkapi parameter identitas akademik untuk sinkronisasi database.
                </DialogDescription>
              </div>
            </DialogHeader>

            <form onSubmit={handleSave} className="p-10 pt-8 space-y-6 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">NIM / Student ID</Label>
                  <Input required value={form.NIM} onChange={e => setForm({ ...form, NIM: e.target.value })} placeholder="BKU..." className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta tabular-nums" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Full Legal Name</Label>
                  <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Full name..." className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Academic Email</Label>
                <Input required type="email" value={form.EmailKampus} onChange={e => setForm({ ...form, EmailKampus: e.target.value })} placeholder="id@bku.ac.id" className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Faculty Branch</Label>
                  <Select value={String(form.FakultasID)} onValueChange={v => setForm({ ...form, FakultasID: v, ProgramStudiID: '' })}>
                    <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-xs uppercase tracking-widest"><SelectValue placeholder="SELECT FACULTY" /></SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-neutral-100">
                      {faculties.map(f => <SelectItem key={f.ID} value={String(f.ID)} className="text-[10px] font-bold uppercase tracking-widest">{f.Nama}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Academic Program</Label>
                  <Select value={String(form.ProgramStudiID)} onValueChange={v => setForm({ ...form, ProgramStudiID: v })}>
                    <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-xs uppercase tracking-widest"><SelectValue placeholder="SELECT PRODI" /></SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-neutral-100">
                      {prodi.filter(p => !form.FakultasID || p.FakultasID === parseInt(form.FakultasID)).map(p => (
                        <SelectItem key={p.ID} value={String(p.ID)} className="text-[10px] font-bold uppercase tracking-widest">{p.Nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Account Status</Label>
                  <Select value={form.StatusAkun} onValueChange={v => setForm({ ...form, StatusAkun: v })}>
                    <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-xs uppercase tracking-widest"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-neutral-100">
                      {['Aktif', 'Cuti', 'Lulus', 'Nonaktif'].map(s => <SelectItem key={s} value={s} className="text-[10px] font-bold uppercase tracking-widest">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Current Semester</Label>
                  <Input type="number" min={1} max={14} value={form.SemesterSekarang} onChange={e => setForm({ ...form, SemesterSekarang: e.target.value })} className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-sm tabular-nums" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Admission Batch (Year)</Label>
                <Input type="number" value={form.TahunMasuk} onChange={e => setForm({ ...form, TahunMasuk: e.target.value })} className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-sm tabular-nums" />
              </div>
            </form>

            <footer className="p-8 border-t border-neutral-100 bg-neutral-50/50 flex flex-col md:flex-row gap-4">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="flex-1 h-14 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:bg-neutral-100 transition-all">Abort</Button>
              <Button onClick={handleSave} disabled={isSubmitting} className="flex-[2] h-14 rounded-xl bg-neutral-900 text-white hover:bg-primary shadow-xl shadow-neutral-900/10 transition-all active:scale-95 border-none flex items-center justify-center gap-3">
                {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >save</span>}
                <span className="text-[10px] font-bold uppercase tracking-widest">{isEditMode ? 'Commit Identity Update' : 'Initialize Enrollment'}</span>
              </Button>
            </footer>
          </DialogContent>
        </Dialog>

        <DeleteConfirmModal 
          isOpen={isDelOpen} 
          onClose={() => setIsDelOpen(false)} 
          onConfirm={handleDelete}
          title="Destroy Student Entity?" 
          description="Seluruh data akademik, riwayat registrasi, dan kaitan entitas mahasiswa ini akan dihapus permanen dari basis data sistem. Prosedur ini tidak dapat dibatalkan." 
          loading={isSubmitting} 
        />
      </div>
    </div>
  )
}

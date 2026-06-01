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
import { adminService, API_BASE_URL } from '../../services/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const KeyRound = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>vpn_key</span>;



const ROLES = ['super_admin', 'faculty_admin', 'ormawa_admin', 'ormawa', 'mahasiswa', 'psikolog', 'kencana_admin', 'kencana_fakultas', 'kencana_mentor']

const ROLE_DETAILS = {
  super_admin: {
    label: 'Super Admin',
    cls: 'bg-rose-500 text-white shadow-rose-200',
    desc: 'Otoritas penuh infrastruktur, audit log, dan tata kelola keamanan sistem.',
    perms: ['Full Root Access', 'System Config', 'RBAC Management', 'Audit Forensics']
  },
  SUPER_ADMIN: { label: 'Super Admin', cls: 'bg-rose-500 text-white shadow-rose-200', desc: 'Otoritas penuh', perms: ['Full Access'] },
  faculty_admin: {
    label: 'Admin Fakultas',
    cls: 'bg-indigo-500 text-white shadow-indigo-200',
    desc: 'Yurisdiksi data akademik, dosen, dan mahasiswa di level fakultas.',
    perms: ['Faculty Data', 'Student Mgmt', 'Lecturer Mgmt', 'Academic Mapping']
  },
  ormawa_admin: {
    label: 'Admin Ormawa',
    cls: 'bg-blue-500 text-white shadow-blue-200',
    desc: 'Manajemen organisasi kemahasiswaan, anggaran, dan alur proposal.',
    perms: ['Ormawa Engine', 'Proposal Review', 'Fiscal Tracking', 'Member Governance']
  },
  ormawa: {
    label: 'Pengurus Ormawa',
    cls: 'bg-sky-500 text-white shadow-sky-200',
    desc: 'Anggota aktif pengurus ormawa dengan akses operasional internal organisasi.',
    perms: ['Proposal Access', 'Event Management', 'Attendance Tracking', 'Member View']
  },

  mahasiswa: {
    label: 'Mahasiswa',
    cls: 'bg-emerald-500 text-white shadow-emerald-200',
    desc: 'Akses layanan mandiri, pengajuan proposal, dan portal aspirasi.',
    perms: ['Self Service', 'Aspiration Engine', 'Proposal Cluster', 'Student Analytics']
  },
  psikolog: {
    label: 'Psikolog',
    cls: 'bg-teal-500 text-white shadow-teal-200',
    desc: 'Otoritas klinis pengelolaan layanan kesehatan mental mahasiswa.',
    perms: ['Clinical Counseling', 'Psychological Assessment', 'Case Reports', 'Booking System']
  },
  kencana_admin: {
    label: 'Admin Kencana',
    cls: 'bg-amber-600 text-white shadow-amber-200',
    desc: 'Otoritas pusat untuk periode, materi, quiz, remedial, mentor, dan sertifikat Kencana.',
    perms: ['Kencana Config', 'Timeline Builder', 'Mentor Override', 'Certificate Gate']
  },
  kencana_fakultas: {
    label: 'Admin Kencana Fakultas',
    cls: 'bg-cyan-700 text-white shadow-cyan-200',
    desc: 'Mengelola kegiatan Kencana yang dibatasi pada mahasiswa dan sesi fakultas terkait.',
    perms: ['Faculty Kencana', 'Scoped Participants', 'Attendance Review', 'Handbook Review']
  },
  kencana_mentor: {
    label: 'Dewan Pembimbing',
    cls: 'bg-stone-800 text-white shadow-stone-200',
    desc: 'Akun khusus pembimbing Kencana dengan scope universitas atau fakultas.',
    perms: ['Mentor Dashboard', 'Student Invite', 'Progress Notes', 'Affective Score']
  }
}

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

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [faculties, setFaculties] = useState([])
  const [allProdi, setAllProdi] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isRoleOpen, setIsRoleOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isPermsOpen, setIsPermsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [newOrmawaId, setNewOrmawaId] = useState('')
  const [newOrmawaAssign, setNewOrmawaAssign] = useState('')
  const [newFakultasId, setNewFakultasId] = useState('')
  const [newKencanaScopeType, setNewKencanaScopeType] = useState('faculty')
  const [ormawas, setOrmawas] = useState([])
  const [form, setForm] = useState({ 
    Email: '', 
    Password: '', 
    Role: 'mahasiswa',
    Nama: '',
    FakultasID: '',
    ProgramStudiID: '',
    OrmawaAssign: '',
    OrmawaID: '',
    KencanaScopeType: 'faculty',
    Phone: ''
  })

  const handleEmailChange = (emailVal) => {
    setForm(prev => {
      let updatedPassword = prev.Password;
      if (prev.Role === 'mahasiswa') {
        const parts = emailVal.split('@');
        const nim = parts[0].trim();
        if (nim) {
          updatedPassword = `pass${nim}`;
        }
      }
      return {
        ...prev,
        Email: emailVal,
        Password: updatedPassword
      };
    });
  };

  const handleRoleChange = (roleVal) => {
    setForm(prev => {
      let updatedPassword = prev.Password;
      if (roleVal === 'mahasiswa') {
        const parts = prev.Email.split('@');
        const nim = parts[0].trim();
        if (nim) {
          updatedPassword = `pass${nim}`;
        }
      }
      return {
        ...prev,
        Role: roleVal,
        Password: updatedPassword
      };
    });
  };

  const fetchData = async () => {
    setLoading(true)
    try {
      const [userRes, facRes, prodiRes, ormawaRes] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllFaculties(),
        adminService.getAllProdi(),
        adminService.getAllOrmawa()
      ])

      if (userRes?.status === 'success') setUsers(userRes.data || [])
      if (facRes?.status === 'success') setFaculties(facRes.data || [])
      if (prodiRes?.status === 'success') setAllProdi(prodiRes.data || [])
      if (ormawaRes?.status === 'success') setOrmawas(ormawaRes.data || [])
    } catch (err) { 
      toast.error('Gagal sinkronisasi data master-node') 
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    try {
      const payload = {
        ...form,
        Email: String(form.Email || '').trim(),
        Password: String(form.Password || ''),
        Role: String(form.Role || '').trim(),
        Nama: String(form.Nama || '').trim(),
        FakultasID: Number(form.FakultasID) || 0,
        ProgramStudiID: Number(form.ProgramStudiID) || 0,
        OrmawaAssign: String(form.OrmawaAssign || '').trim(),
        OrmawaID: Number(form.OrmawaID) || 0,
        KencanaScopeType: String(form.KencanaScopeType || 'faculty').trim(),
        Phone: String(form.Phone || '').trim(),
      }
      const res = await adminService.createUser(payload)
      if (res.status === 'success') { 
        toast.success('Identitas digital berhasil diregistrasi')
        setIsCrudOpen(false)
        fetchData() 
      } else {
        toast.error(res.message || 'Gagal menginisialisasi akun')
      }
    } catch (err) { toast.error(err?.message || 'Kesalahan operasional internal') } finally { setIsSubmitting(false) }
  }

  const handleUpdateRole = async () => {
    if (!newRole) { toast.error('Seleksi level akses diperlukan'); return }
    setIsSubmitting(true)
    try {
      const res = await adminService.updateUserRole({ 
        userId: selected?.id || selected?.ID, 
        role: newRole,
        ormawaId: Number(newOrmawaId) || 0,
        ormawaAssign: String(newOrmawaAssign || '').trim(),
        fakultasId: Number(newFakultasId) || 0,
        kencanaScopeType: String(newKencanaScopeType || 'faculty').trim()
      })
      if (res.status === 'success') { 
        toast.success('Level otorisasi berhasil diperbarui')
        setIsRoleOpen(false)
        fetchData() 
      } else {
        toast.error(res.message || 'Gagal memperbarui otorisasi')
      }
    } catch (err) { 
      toast.error(err.message || 'Kegagalan sinkronisasi RBAC') 
    } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteUser(selected?.id || selected?.ID)
      toast.success('Entitas akun berhasil dicabut')
      setIsDelOpen(false)
      fetchData()
    } catch { 
      toast.error('Gagal mencabut entitas akun') 
    } finally { 
      setIsSubmitting(false) 
    }
  }

  const columns = [
    {
      key: 'email', label: 'Identitas Digital', className: 'min-w-[320px]',
      render: (v, row) => {
        const linkedName = row.identity_name || (row.role === 'super_admin' ? 'System Administrator' : 'Pending Identity')
        return (
          <div className="flex items-center gap-4 py-2 group/avatar">
            <StudentAvatar
              src={getCleanImageUrl(row.foto_url || row.FotoURL || row.Foto || row.Pengguna?.Foto || row.foto || row.pengguna?.foto)}
              name={linkedName}
              className="w-11 h-11 rounded-xl border-2 border-white shadow-md transition-all group-hover/avatar:scale-110"
            />
            <div className="flex flex-col">
              <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px] leading-tight group-hover:text-primary transition-colors">{linkedName}</span>
              <div className="flex items-center gap-1.5 mt-1 text-neutral-400">
                 <span className="material-symbols-outlined text-primary/60" style={{ fontSize: '10px' }} >mail</span>
                 <span className="text-[10px] font-bold tracking-widest lowercase">{v || row.email || '—'}</span>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'fakultas_nama', label: 'Cluster Afiliasi', className: 'w-[240px]',
      render: (v, row) => {
        const role = (row.role || '').toLowerCase()
        let context = '-'
        let subContext = ''

        if (role === 'super_admin') {
          context = 'Universitas (Global)'
        } else if (role === 'faculty_admin') {
          context = v || 'Cluster Unassigned'
        } else if (role === 'ormawa_admin') {
          context = row.ormawa_assign || row.ormawa_nama || 'Org Unassigned'
          subContext = v ? `Managed at ${v}` : ''
        } else if (role === 'mahasiswa') {
          context = row.prodi_nama || '-'
          subContext = v || ''
        } else if (role === 'psikolog') {
          context = 'Psychological Wing'
          subContext = 'BKU Clinical Unit'
        } else if (role === 'kencana_admin') {
          context = 'Kencana University'
          subContext = 'Global LMS Operations'
        } else if (role === 'kencana_fakultas') {
          context = v || 'Kencana Fakultas'
          subContext = 'Scoped faculty operations'
        } else if (role === 'kencana_mentor') {
          context = row.kencana_scope_type === 'university' ? 'Mentor Universitas' : (v || 'Mentor Fakultas')
          subContext = row.kencana_scope_type === 'university' ? 'All faculties' : 'Faculty scoped'
        }
        
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-bold text-neutral-800 font-jakarta leading-tight tracking-tight">{context}</span>
            {subContext && <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mt-1">{subContext}</span>}
          </div>
        )
      }
    },
    {
      key: 'role', label: 'Authorization', className: 'w-[160px]',
      render: (v, row) => {
        const r = v || row.role || ''
        const cfg = ROLE_DETAILS[r] || { label: r, cls: 'bg-neutral-100 text-neutral-500 shadow-none' }
        return (
          <Badge className={cn('font-bold text-[9px] px-3 py-1 border-none shadow-sm uppercase tracking-[0.15em] rounded-lg', cfg.cls)}>
            {cfg.label}
          </Badge>
        )
      }
    },
    {
      key: 'created_at', label: 'Audit Trail', className: 'w-[140px]',
      render: (v, row) => {
        const d = v || row.created_at
        return (
          <div className="flex flex-col text-right">
            <span className="font-bold text-neutral-900 text-[11px] font-jakarta tabular-nums">{d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
            <span className="text-[9px] text-neutral-300 font-bold uppercase tracking-widest mt-0.5">Registration</span>
          </div>
        )
      }
    }
  ]

  return (
    <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-rose-50/50 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Security & OIDC Cluster</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                Identity <span className="text-primary">Governance</span>
              </h1>
              <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed">
                Kendali akses terpusat berbasis RBAC untuk seluruh entitas sistem. Kelola hak istimewa, kaitan identitas, dan otorisasi infrastruktur.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-8 pr-8 border-r border-neutral-100">
                <div className="text-right">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Identity</p>
                  <p className="text-2xl font-bold text-neutral-900 font-jakarta tabular-nums leading-none">{users.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Privileged Nodes</p>
                  <p className="text-2xl font-bold text-rose-600 font-jakarta tabular-nums leading-none">{users.filter(u => u.role?.includes('admin')).length}</p>
                </div>
              </div>

              <Button 
                onClick={() => setIsPermsOpen(true)}
                variant="outline"
                className="h-11 px-6 rounded-xl border-neutral-200 text-xs font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 gap-2 transition-all active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }} >security</span>
                Access Matrix
              </Button>
            </div>
          </div>
        </section>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns} 
              data={users} 
              loading={loading}
              searchPlaceholder="Search by identity handle, email, or authorization level..."
              onAdd={() => { setForm({ Email: '', Password: '', Role: 'mahasiswa', Nama: '', FakultasID: '', ProgramStudiID: '', OrmawaAssign: '', OrmawaID: '', KencanaScopeType: 'faculty', Phone: '' }); setIsCrudOpen(true) }} 
              addLabel="New Identity"
              filters={[{ key: 'role', placeholder: 'FILTER BY LEVEL', options: ROLES.map(r => ({ label: ROLE_DETAILS[r]?.label || r, value: r })) }]}
              searchWidth="max-w-md"
              actions={(row) => (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => { 
                      setSelected(row); 
                      setNewRole(row.role || row.Role || ''); 
                      setNewOrmawaId(row.ormawa_id || row.OrmawaID || '');
                      setNewOrmawaAssign(row.ormawa_assign || row.OrmawaAssign || '');
                      setNewFakultasId(row.fakultas_id || row.FakultasID || '');
                      setNewKencanaScopeType(row.kencana_scope_type || row.KencanaScopeType || 'faculty');
                      setIsRoleOpen(true) 
                    }} 
                    variant="ghost" 
                    className="h-8 px-4 gap-2 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] transition-all border-none shadow-none"
                  >
                    <KeyRound size={12} strokeWidth={2.5} /> Otoritas
                  </Button>
                  <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shadow-none"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >delete</span></Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

      </div>

      {/* ── Access Matrix Modal ──────────────────────────────────── */}
      <Dialog open={isPermsOpen} onOpenChange={setIsPermsOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white animate-in zoom-in-95 duration-300">
          <DialogTitle className="sr-only">Matriks Hak Akses</DialogTitle>
          <DialogDescription className="sr-only">Panduan detail mengenai level otorisasi sistem</DialogDescription>
          
          <div className="p-10 bg-neutral-900 text-white relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
            <div className="absolute top-0 right-0 p-10 opacity-[0.05] text-white"><span className="material-symbols-outlined" style={{ fontSize: '160px' }} >security</span></div>
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Protocol Documentation</span>
              <h2 className="text-3xl font-bold font-jakarta tracking-tight leading-none">RBAC Governance Matrix</h2>
              <p className="text-neutral-400 text-[13px] max-w-md font-medium leading-relaxed mt-2 italic">Standard Operasional Prosedur untuk delegasi otoritas dan batasan operasional cluster pengguna.</p>
            </div>
          </div>
          
          <div className="p-10 space-y-6 max-h-[55vh] overflow-y-auto custom-scrollbar">
            {ROLES.map(role => (
              <div key={role} className="p-6 rounded-2xl border border-neutral-100 bg-neutral-50/40 flex flex-col md:flex-row gap-8 items-start group hover:border-primary/20 transition-all">
                <div className="w-full md:w-52 shrink-0 space-y-3">
                  <Badge className={cn("font-bold text-[9px] px-3 py-1 border-none shadow-sm uppercase tracking-[0.2em] rounded-lg", ROLE_DETAILS[role].cls)}>{ROLE_DETAILS[role].label}</Badge>
                  <p className="text-[11px] font-bold text-neutral-500 leading-relaxed uppercase tracking-tight italic">{ROLE_DETAILS[role].desc}</p>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  {ROLE_DETAILS[role].perms.map(p => (
                    <div key={p} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-100 group-hover:shadow-sm transition-all">
                      <div className="size-6 rounded-lg bg-primary/5 flex items-center justify-center text-primary/40"><span className="material-symbols-outlined" style={{ fontSize: '12px' }} Check >security</span></div>
                      <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-widest">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <footer className="p-8 border-t border-neutral-100 flex justify-end bg-neutral-50/50">
             <Button onClick={() => setIsPermsOpen(false)} className="px-10 h-12 rounded-xl bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-all border-none">Dismiss Matrix</Button>
          </footer>
        </DialogContent>
      </Dialog>

      {/* ── Create User Modal ───────────────────────────────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white animate-in slide-in-from-bottom-4 duration-300">
          <DialogHeader className="p-10 pb-8 border-b border-neutral-100 relative overflow-hidden bg-neutral-50/50">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-primary"><span className="material-symbols-outlined" style={{ fontSize: '140px' }} >manage_accounts</span></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}  strokeWidth={4}>add</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Account Provisioning</span>
              </div>
              <DialogTitle className="text-2xl font-bold font-jakarta tracking-tight text-neutral-900">Initialize New Identity</DialogTitle>
              <DialogDescription className="text-sm font-medium text-neutral-400 italic">Daftarkan identitas digital baru dan tentukan level otoritas sistem.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreate} className="p-10 pt-8 space-y-6">
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Identity Handle (Email)</Label>
                   <Input required type="email" value={form.Email} onChange={e => handleEmailChange(e.target.value)} placeholder="email@bku.ac.id" className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Default Authentication</Label>
                   <Input required type="password" value={form.Password} onChange={e => setForm({ ...form, Password: e.target.value })} placeholder="••••••••" className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
                   {form.Role === 'mahasiswa' && (
                     <span className="text-[9px] font-bold text-emerald-600 block mt-1 pl-1">
                       💡 Auto-generate: pass(NIM)
                     </span>
                   )}
                 </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Full Legal Name</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Full name for ID mapping..." className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Authorization Level</Label>
                <Select value={form.Role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-xs uppercase tracking-[0.1em]"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl border-neutral-100">
                    {ROLES.map(r => <SelectItem key={r} value={r} className="text-[10px] font-bold uppercase tracking-widest">{ROLE_DETAILS[r]?.label || r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {form.Role !== 'super_admin' && form.Role !== 'psikolog' && form.Role !== 'kencana_admin' && !(form.Role === 'kencana_mentor' && form.KencanaScopeType === 'university') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Fakultas</Label>
                    <Select 
                      value={form.FakultasID ? String(form.FakultasID) : undefined} 
                      onValueChange={v => setForm({ ...form, FakultasID: v, ProgramStudiID: '' })}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-xs uppercase tracking-[0.1em]">
                        <SelectValue placeholder="PILIH FAKULTAS" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-neutral-100 max-h-[200px] overflow-y-auto">
                        {faculties.map(f => (
                          <SelectItem key={f.ID || f.id} value={String(f.ID || f.id)} className="text-[10px] font-bold uppercase tracking-widest">
                            {f.Nama || f.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Program Studi</Label>
                    <Select 
                      disabled={!form.FakultasID}
                      value={form.ProgramStudiID ? String(form.ProgramStudiID) : undefined} 
                      onValueChange={v => setForm({ ...form, ProgramStudiID: v })}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-xs uppercase tracking-[0.1em]">
                        <SelectValue placeholder={form.FakultasID ? "PILIH PRODI" : "PILIH FAKULTAS DULU"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-neutral-100 max-h-[200px] overflow-y-auto">
                        {allProdi
                          .filter(p => String(p.FakultasID || p.fakultas_id) === String(form.FakultasID))
                          .map(p => (
                            <SelectItem key={p.ID || p.id} value={String(p.ID || p.id)} className="text-[10px] font-bold uppercase tracking-widest">
                              {p.Nama || p.nama}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {form.Role === 'kencana_mentor' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Kencana Scope</Label>
                    <Select value={form.KencanaScopeType} onValueChange={v => setForm({ ...form, KencanaScopeType: v, FakultasID: v === 'university' ? '' : form.FakultasID })}>
                      <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-xs uppercase tracking-[0.1em]"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-neutral-100">
                        <SelectItem value="faculty" className="text-[10px] font-bold uppercase tracking-widest">Fakultas</SelectItem>
                        <SelectItem value="university" className="text-[10px] font-bold uppercase tracking-widest">Universitas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Phone</Label>
                    <Input value={form.Phone} onChange={e => setForm({ ...form, Phone: e.target.value })} placeholder="Nomor kontak mentor" className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
                  </div>
                </div>
              )}

              {(form.Role === 'ormawa_admin' || form.Role === 'ormawa') && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Assign Ormawa</Label>
                  <Select 
                    value={form.OrmawaID ? String(form.OrmawaID) : undefined} 
                    onValueChange={v => {
                      const selectedOrm = ormawas.find(o => String(o.id || o.ID) === String(v));
                      setForm({ ...form, OrmawaID: v, OrmawaAssign: selectedOrm ? selectedOrm.Nama || selectedOrm.nama : '' });
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-xs uppercase tracking-[0.1em]">
                      <SelectValue placeholder="PILIH ORGANISASI MAHASISWA" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-neutral-100 max-h-[200px] overflow-y-auto">
                      {ormawas.map(o => (
                        <SelectItem key={o.id || o.ID} value={String(o.id || o.ID)} className="text-[10px] font-bold uppercase tracking-widest">
                          {o.nama || o.Nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <footer className="pt-8 flex flex-col md:flex-row gap-4 border-t border-neutral-100">
               <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="flex-1 h-14 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:bg-neutral-50 transition-all">Abort</Button>
               <Button type="submit" disabled={isSubmitting} className="flex-[2] h-14 rounded-xl bg-neutral-900 text-white hover:bg-primary shadow-xl shadow-neutral-900/10 transition-all active:scale-95 border-none flex items-center justify-center gap-3">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >save</span>}
                  <span className="text-[10px] font-bold uppercase tracking-widest">Commit New Account</span>
               </Button>
            </footer>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Update Role Modal ────────────────────────────────────── */}
      <Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white animate-in zoom-in-95 duration-300">
          <DialogHeader className="p-8 pb-6 border-b border-neutral-100 bg-neutral-50/50">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20"><KeyRound size={24} strokeWidth={2.5} /></div>
              <div>
                <h2 className="text-xl font-bold font-jakarta tracking-tight text-neutral-900 leading-none">Modify Otoritas</h2>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5">Override account privilege nodes.</p>
              </div>
            </div>
          </DialogHeader>
          <div className="p-10 space-y-8">
             <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
               <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between group">
                  <div className="space-y-1">
                     <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Target Identity</p>
                     <p className="text-[13px] font-bold font-jakarta text-neutral-900 truncate max-w-[200px] lowercase">{selected?.Email || selected?.email}</p>
                  </div>
                  <Badge className={cn("font-bold text-[8px] px-2.5 py-1 border-none shadow-sm uppercase rounded-lg group-hover:scale-105 transition-transform", ROLE_DETAILS[selected?.role]?.cls)}>
                     {ROLE_DETAILS[selected?.role]?.label || selected?.role}
                  </Badge>
               </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Target Authorization Level</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-[10px] uppercase tracking-widest text-neutral-600"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-neutral-100">
                      {ROLES.map(r => <SelectItem key={r} value={r} className="text-[10px] font-bold uppercase tracking-widest">{ROLE_DETAILS[r]?.label || r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {(newRole === 'ormawa_admin' || newRole === 'ormawa') && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Assign Ormawa</Label>
                    <Select 
                      value={newOrmawaId ? String(newOrmawaId) : undefined} 
                      onValueChange={v => {
                        const selectedOrm = ormawas.find(o => String(o.id || o.ID) === String(v));
                        setNewOrmawaId(v);
                        setNewOrmawaAssign(selectedOrm ? selectedOrm.Nama || selectedOrm.nama : '');
                      }}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-[10px] uppercase tracking-widest text-neutral-600">
                        <SelectValue placeholder="PILIH ORGANISASI MAHASISWA" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-neutral-100 max-h-[200px] overflow-y-auto">
                        {ormawas.map(o => (
                          <SelectItem key={o.id || o.ID} value={String(o.id || o.ID)} className="text-[10px] font-bold uppercase tracking-widest">
                            {o.nama || o.Nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(newRole === 'kencana_fakultas' || (newRole === 'kencana_mentor' && newKencanaScopeType === 'faculty')) && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Fakultas Kencana</Label>
                    <Select value={newFakultasId ? String(newFakultasId) : undefined} onValueChange={setNewFakultasId}>
                      <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-[10px] uppercase tracking-widest text-neutral-600">
                        <SelectValue placeholder="PILIH FAKULTAS" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-neutral-100 max-h-[200px] overflow-y-auto">
                        {faculties.map(f => (
                          <SelectItem key={f.ID || f.id} value={String(f.ID || f.id)} className="text-[10px] font-bold uppercase tracking-widest">
                            {f.Nama || f.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newRole === 'kencana_mentor' && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Mentor Scope</Label>
                    <Select value={newKencanaScopeType} onValueChange={v => { setNewKencanaScopeType(v); if (v === 'university') setNewFakultasId('') }}>
                      <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-[10px] uppercase tracking-widest text-neutral-600"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-neutral-100">
                        <SelectItem value="faculty" className="text-[10px] font-bold uppercase tracking-widest">Fakultas</SelectItem>
                        <SelectItem value="university" className="text-[10px] font-bold uppercase tracking-widest">Universitas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
             </div>

             <footer className="flex gap-4 pt-4 border-t border-neutral-100">
                <Button variant="ghost" onClick={() => setIsRoleOpen(false)} className="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-400">Abort</Button>
                <Button onClick={handleUpdateRole} disabled={isSubmitting} className="flex-[2] h-12 rounded-xl bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-neutral-900/10 active:scale-[0.98] transition-all border-none flex items-center justify-center gap-2">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >security</span>} 
                  Commit Authority
                </Button>
             </footer>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen} 
        onClose={() => setIsDelOpen(false)} 
        onConfirm={handleDelete}
        title="Destroy Identity Entity?" 
        description="Aksi ini akan mencabut seluruh hak akses, identitas digital, dan kaitan entitas pengguna ini secara permanen. Prosedur ini tidak dapat dibatalkan." 
        loading={isSubmitting} 
      />

    </div>
  )
}

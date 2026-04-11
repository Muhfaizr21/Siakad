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
import { Avatar, AvatarFallback } from './components/ui/avatar'
import { 
  Eye, Pencil, Trash2, Loader2, Plus, Save, 
  UserCheck, Mail, KeyRound, ShieldAlert, 
  Fingerprint, Info, ShieldCheck, UserCog,
  LayoutGrid, Database, ClipboardList, Activity,
  ArrowRight
} from 'lucide-react'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'
import { adminService } from '../../services/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'

const ROLES = ['super_admin', 'faculty_admin', 'ormawa_admin', 'dosen', 'mahasiswa']

const ROLE_DETAILS = {
  super_admin: {
    label: 'Super Admin',
    cls: 'bg-rose-100 text-rose-700 ring-1 ring-rose-500/20',
    desc: 'Akses penuh ke seluruh sistem, audit log, dan konfigurasi infrastruktur.',
    perms: ['Full Access', 'System Config', 'RBAC Management', 'Audit Access']
  },
  SUPER_ADMIN: { label: 'Super Admin', cls: 'bg-rose-100 text-rose-700 ring-1 ring-rose-500/20', desc: 'Akses penuh', perms: ['Full Access'] },
  faculty_admin: {
    label: 'Admin Fakultas',
    cls: 'bg-violet-100 text-violet-700 ring-1 ring-violet-500/20',
    desc: 'Mengelola data akademik, dosen, dan mahasiswa di tingkat fakultas.',
    perms: ['Faculty Data', 'Student Mgmt', 'Lecturer Mgmt', 'Prodi Control']
  },
  ADMINFAKULTAS: { label: 'Admin Fakultas', cls: 'bg-violet-100 text-violet-700 ring-1 ring-violet-500/20', desc: 'Fakultas', perms: ['Faculty Data'] },
  "ADMIN FAKULTAS": { label: 'Admin Fakultas', cls: 'bg-violet-100 text-violet-700 ring-1 ring-violet-500/20', desc: 'Fakultas', perms: ['Faculty Data'] },
  ormawa_admin: {
    label: 'Admin Ormawa',
    cls: 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/20',
    desc: 'Otoritas pengelolaan organisasi mahasiswa, anggaran, dan proposal.',
    perms: ['Ormawa Mgmt', 'Proposal Review', 'Fund Tracking', 'Member Approval']
  },
  ADMINORMAWA: { label: 'Admin Ormawa', cls: 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/20', desc: 'Ormawa', perms: ['Ormawa Mgmt'] },
  dosen: {
    label: 'Dosen',
    cls: 'bg-amber-100 text-amber-700 ring-1 ring-amber-500/20',
    desc: 'Akses ke modul bimbingan, konseling, dan validasi akademik mahasiswa.',
    perms: ['Academic Advising', 'Counseling', 'Grade Entry', 'Attendance']
  },
  DOSEN: { label: 'Dosen', cls: 'bg-amber-100 text-amber-700 ring-1 ring-amber-500/20', desc: 'Dosen', perms: ['Dosen Access'] },
  mahasiswa: {
    label: 'Mahasiswa',
    cls: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20',
    desc: 'Pengguna akhir dengan akses ke layanan mandiri, pengajuan, dan aspirasi.',
    perms: ['Self Service', 'Aspiration', 'Proposal Submit', 'Profile View']
  },
  MAHASISWA: { label: 'Mahasiswa', cls: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20', desc: 'Mahasiswa', perms: ['Self Service'] }
}


export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isRoleOpen, setIsRoleOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isPermsOpen, setIsPermsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [form, setForm] = useState({ Email: '', Password: '', Role: 'mahasiswa' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAllUsers()
      if (res && res.status === 'success') {
        setUsers(res.data || [])
      } else {
        toast.error(res?.message || 'Gagal memuat pengguna')
      }
    } catch (err) { 
      console.error("RBAC Fetch Error:", err)
      toast.error(err.message || 'Koneksi gagal - Pastikan backend berjalan di port 8000') 
    } finally { setLoading(false) }
  }


  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    try {
      const res = await adminService.createUser(form)
      if (res.status === 'success') { toast.success('Pengguna dibuat'); setIsCrudOpen(false); fetchData() }
      else toast.error(res.message || 'Gagal membuat pengguna')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const handleUpdateRole = async () => {
    if (!newRole) { toast.error('Pilih role terlebih dahulu'); return }
    setIsSubmitting(true)
    try {
      const res = await adminService.updateUserRole({ userId: selected.ID, role: newRole })
      if (res.status === 'success') { 
        toast.success('Role diperbarui')
        setIsRoleOpen(false)
        fetchData() 
      } else {
        toast.error(res.message || 'Gagal memperbarui role')
      }
    } catch (err) { 
      toast.error(err.message || 'Terjadi kesalahan') 
    } finally { setIsSubmitting(false) }

  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteUser(selected.ID)
      toast.success('Pengguna dihapus'); setIsDelOpen(false); fetchData()
    } catch { toast.error('Gagal menghapus') } finally { setIsSubmitting(false) }
  }

  const columns = [
    {
      key: 'email', label: 'Pengguna & Identitas', className: 'min-w-[320px]',
      render: (v, row) => {
        const linkedName = row.Dosen?.Nama || (row.Role === 'super_admin' ? 'System Administrator' : 'Account Identity')
        const isLinked = !!row.Dosen || row.Role === 'super_admin'
        return (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100">
                <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 text-[10px] font-black uppercase">
                  {(v || row.Email || '').split('@')[0].substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={cn("absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center", isLinked ? "bg-emerald-500" : "bg-slate-300")}>
                <Fingerprint className="size-2 text-white" />
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-black text-slate-900 font-headline tracking-tighter text-[13px] uppercase">{linkedName}</span>
              <span className="text-[10px] text-slate-400 font-bold tracking-tight opacity-80">{v || row.Email || '—'}</span>
            </div>
          </div>
        )
      }
    },

    {
      key: 'role', label: 'Level Akses', className: 'w-[180px]',
      render: (v, row) => {
        const r = v || row.Role || ''
        const cfg = ROLE_DETAILS[r] || { label: r, cls: 'bg-slate-100 text-slate-600' }
        return (
          <div className="flex flex-col gap-1.5">
             <Badge className={cn('font-black text-[9px] px-3 py-1 border-none shadow-sm uppercase tracking-widest w-fit', cfg.cls)}>{cfg.label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'created_at', label: 'Tgl Registrasi', className: 'w-[140px]',
      render: (v, row) => {
        const d = v || row.CreatedAt || row.created_at
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-[11px] font-headline">{d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase">{d ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </div>
        )
      }
    }
  ]

  return (
    <div className="bg-slate-50 min-h-screen flex font-sans">
      <Sidebar />
      <main className="pl-72 pt-20 flex flex-col min-h-screen w-full transition-all duration-300">

        <TopNavBar />
        
        <div className="p-10 space-y-10">
          <Toaster position="top-right" />

          {/* Header & Stats Summary */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-2 space-y-2">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/10"><ShieldAlert className="size-6" /></div>
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">RBAC System Control</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                       <div className="h-1 w-8 bg-primary rounded-full" />
                       Governance & Identity Access Management
                    </p>
                  </div>
               </div>
            </div>
            
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
               <div className="size-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner"><ShieldCheck className="size-6" /></div>
               <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Admin Active</p>
                  <p className="text-2xl font-black text-slate-900 font-headline">{users.filter(u => u.Role?.includes('admin')).length}</p>
               </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 cursor-pointer hover:bg-slate-50 transition-all group" onClick={() => setIsPermsOpen(true)}>
               <div className="size-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-amber-100"><Info className="size-6" /></div>
               <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Permissions Guide</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-slate-900 uppercase">View Matrix</p>
                    <ArrowRight className="size-3 text-amber-600" />
                  </div>
               </div>
            </div>
          </div>

          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md rounded-[3.5rem] border border-slate-100/50">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={users} loading={loading}
                searchPlaceholder="Cari identitas, email atau level akses..."
                onAdd={() => { setForm({ Email: '', Password: '', Role: 'mahasiswa' }); setIsCrudOpen(true) }} addLabel="Registrasi Akun"
                filters={[{ key: 'role', placeholder: 'Pilih Level Akses', options: ROLES.map(r => ({ label: ROLE_DETAILS[r]?.label || r, value: r })) }]}
                searchWidth="max-w-xl"
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => { setSelected(row); setNewRole(row.role || row.Role || ''); setIsRoleOpen(true) }} variant="ghost" className="h-10 px-4 gap-2 hover:text-primary hover:bg-primary/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                      <KeyRound className="size-4" /> Reset / Edit Role
                    </Button>
                    <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-10 w-10 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 className="size-4" /></Button>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Permissions Matrix Info Modal */}
      <Dialog open={isPermsOpen} onOpenChange={setIsPermsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white">
          <div className="p-10 bg-slate-900 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10"><ShieldCheck className="size-40" /></div>
             <div className="relative z-10">
                <Badge className="bg-primary text-white border-none font-black text-[9px] px-3 py-1 mb-4">RBAC DOCUMENTATION 1.0</Badge>
                <h2 className="text-3xl font-black font-headline tracking-tighter uppercase leading-none">Role Permissions Matrix</h2>
                <p className="text-slate-400 text-sm mt-3 max-w-sm">Daftar hak akses dan limitasi per level pengguna dalam ekosistem sistem informasi akademik.</p>
             </div>
          </div>
          <div className="p-10 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar">
            {ROLES.map(role => (
              <div key={role} className="group p-6 rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row gap-6 items-start">
                 <div className="shrink-0 w-40">
                    <Badge className={cn("font-black text-[9px] px-3 py-1 border-none shadow-sm uppercase mb-3", ROLE_DETAILS[role].cls)}>{ROLE_DETAILS[role].label}</Badge>
                    <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">{ROLE_DETAILS[role].desc}</p>
                 </div>
                 <div className="flex-1 grid grid-cols-2 gap-3">
                    {ROLE_DETAILS[role].perms.map(p => (
                      <div key={p} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-50 shadow-sm shadow-slate-100/50">
                        <ShieldCheck className="size-3 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{p}</span>
                      </div>
                    ))}
                 </div>
              </div>
            ))}
          </div>
          <div className="p-8 border-t border-slate-50 flex justify-center bg-slate-50/50">
             <Button onClick={() => setIsPermsOpen(false)} className="px-10 h-12 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20">Tutup Panduan</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Registration */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white">
          <DialogHeader className="p-10 pb-8 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5"><UserCog className="size-32 rotate-12" /></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><Plus className="size-6 stroke-[3px]" /></div>
                <div>
                  <h2 className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase leading-none">System Registration</h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                    <Activity className="size-3" /> Mandatory Security Enrollment
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleCreate} className="p-10 space-y-6">
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Identity (Email Handle)</Label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                <Input required type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="nama.pengguna@bku.ac.id" 
                  className="h-14 pl-14 pr-6 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm tracking-tight placeholder:text-slate-300 shadow-inner outline-none focus:ring-4 focus:ring-primary/5 transition-all text-slate-900" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Account Level</Label>
                  <Select value={form.Role} onValueChange={v => setForm({ ...form, Role: v })}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-black font-headline text-[11px] uppercase tracking-tighter shadow-inner px-6 text-slate-900"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-3xl shadow-2xl p-2 border-slate-100">
                      {ROLES.map(r => (
                        <SelectItem key={r} value={r} className="rounded-2xl font-black text-[10px] p-4 uppercase tracking-tighter cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors mb-1 last:mb-0">
                           <div className="flex flex-col gap-0.5">
                              <span>{ROLE_DETAILS[r]?.label || r}</span>
                              <span className="text-[8px] font-medium text-slate-400 normal-case">{ROLE_DETAILS[r]?.desc.substring(0, 30)}...</span>
                           </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Access Key</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                    <Input required type="password" value={form.Password} onChange={e => setForm({ ...form, Password: e.target.value })} placeholder="Minimal 8 char" 
                      className="h-14 pl-14 pr-6 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm tracking-tight placeholder:text-slate-300 shadow-inner text-slate-900" />
                  </div>
               </div>
            </div>
            
            <div className="pt-8 flex flex-row gap-4 border-t border-slate-50">
               <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-10 h-14 rounded-2xl flex-1 hover:bg-slate-50 transition-all">Batalkan</Button>
               <Button type="submit" disabled={isSubmitting} className="h-14 px-10 rounded-2xl bg-slate-900 text-white hover:bg-primary shadow-xl shadow-slate-900/20 flex-1 hover:shadow-primary/30 transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Sahkan Akun Baru</span>
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Role Modal - Refined */}
      <Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white">
          <DialogHeader className="p-10 pb-8 bg-gradient-to-br from-primary/5 to-white border-b border-primary/10">
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"><KeyRound className="size-6" /></div>
                  <div>
                    <h2 className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase leading-none">Update Privilege</h2>
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                       <Fingerprint className="size-3" /> Security Level Override
                    </p>
                  </div>
               </div>
            </div>
          </DialogHeader>
          <div className="p-10 space-y-8">
             <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">User Context</p>
                   <p className="text-[13px] font-black font-headline text-slate-900 uppercase tracking-tight leading-none">{selected?.Email || selected?.email}</p>
                </div>
                <div className="text-right">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Existing Role</p>
                   <Badge className={cn("font-black text-[9px] px-3 py-1 border-none shadow-sm uppercase shrink-0", ROLE_DETAILS[selected?.Role || selected?.role]?.cls )}>
                      {ROLE_DETAILS[selected?.Role || selected?.role]?.label || selected?.Role || selected?.role}
                   </Badge>
                </div>
             </div>

             <div className="space-y-4">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 font-headline">Select New Level Authorization</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-black font-headline text-[11px] uppercase tracking-tighter px-6 shadow-inner text-slate-900"><SelectValue placeholder="Pilih authorization baru" /></SelectTrigger>
                  <SelectContent className="rounded-[2rem] shadow-2xl p-2 border-slate-100 pointer-events-auto">
                    {ROLES.map(r => (
                      <SelectItem key={r} value={r} className="rounded-xl font-black text-[10px] p-4 uppercase cursor-pointer hover:bg-primary/5 focus:bg-primary/5 focus:text-primary transition-all mb-1 last:mb-0">
                         {ROLE_DETAILS[r]?.label || r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>

             <div className="flex gap-4 pt-4">
                <Button variant="ghost" onClick={() => setIsRoleOpen(false)} className="flex-1 h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all font-headline">Batal</Button>
                <Button onClick={handleUpdateRole} disabled={isSubmitting} className="flex-1 h-14 rounded-2xl bg-[#00236f] text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                  {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <ShieldCheck className="size-4 mr-2" />} Assign Privileges
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Otorisasi Penghapusan Akun?" description="Seluruh hak akses dan keterkaitan data identitas pengguna ini akan dicabut permanen dari infrastruktur sistem." loading={isSubmitting} />

      <style jsx>{`
         .no-scrollbar::-webkit-scrollbar { display: none; }
         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

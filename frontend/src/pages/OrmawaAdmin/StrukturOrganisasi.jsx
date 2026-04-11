"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../FacultyAdmin/components/dialog'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Input } from '../FacultyAdmin/components/input'
import { Label } from '../FacultyAdmin/components/label'
import { Avatar, AvatarFallback } from '../FacultyAdmin/components/avatar'
import { Network, Plus, Save, Loader2, Pencil, Trash2 } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { DeleteConfirmModal } from '../FacultyAdmin/components/DeleteConfirmModal'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

const OrgCard = ({ member, color = 'bg-primary/10', textColor = 'text-primary', size = 'md' }) => {
  if (!member) return null
  const sizes = { lg: 'p-4 gap-3', md: 'p-3 gap-2', sm: 'p-2.5 gap-1.5' }
  const avatarSizes = { lg: 'size-14 rounded-2xl text-lg', md: 'size-10 rounded-xl text-sm', sm: 'size-8 rounded-xl text-[10px]' }
  const nameSizes = { lg: 'text-sm', md: 'text-[12px]', sm: 'text-[10px]' }
  return (
    <div className={cn('flex items-center bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all', sizes[size])}>
      <Avatar className={cn(avatarSizes[size], color)}>
        <AvatarFallback className={cn('font-black uppercase', color, textColor)}>
          {(member.Mahasiswa?.Nama || member.Nama || '—').split(' ').map(n => n[0]).join('').substring(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className={cn('font-black font-headline tracking-tighter text-slate-900 truncate max-w-[140px]', nameSizes[size])}>{member.Mahasiswa?.Nama || member.Nama || '—'}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{member.Role}</p>
      </div>
    </div>
  )
}

export default function StrukturOrganisasi() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [members, setMembers] = useState([])
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddDivOpen, setIsAddDivOpen] = useState(false)
  const [divName, setDivName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [delDiv, setDelDiv] = useState(null)
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.OrmawaID || 1

  const fetchData = async () => {
    setLoading(true)
    try {
      const [memberJson, divJson] = await Promise.all([
        fetchWithAuth(`${API}/members?ormawaId=${ormawaId}`),
        fetchWithAuth(`${API}/divisions?ormawaId=${ormawaId}`)
      ])
      if (memberJson.status === 'success') setMembers(memberJson.data || [])
      if (divJson.status === 'success') setDivisions(divJson.data || [])
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleAddDivision = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    try {
      const json = await fetchWithAuth(`${API}/divisions`, { 
        method: 'POST', 
        body: JSON.stringify({ Nama: divName, OrmawaID: Number(ormawaId) }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (json.status === 'success') { toast.success('Divisi ditambahkan'); setIsAddDivOpen(false); setDivName(''); fetchData() }
      else toast.error(json.message || 'Gagal menambahkan divisi')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }
  const handleDeleteDivision = async () => {
    setIsSubmitting(true)
    try {
      const json = await fetchWithAuth(`${API}/divisions/${delDiv?.ID}`, { method: 'DELETE' })
      if (json.status === 'success') { toast.success('Divisi dihapus'); setDelDiv(null); fetchData() }
      else toast.error('Gagal menghapus')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const ketua = members.find(m => m.Role?.toLowerCase().includes('ketua') && !m.ParentID) || members[0]
  const wakil = members.find(m => m.Role?.toLowerCase().includes('wakil')) || null
  const pengurusInti = members.filter(m => m.ID !== ketua?.ID && m.ID !== wakil?.ID && (!m.Divisi || m.Divisi === '' || m.Divisi === 'INTI'))

  const getDivisionMembers = (divName) => members.filter(m => m.Divisi === divName)

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="pt-20 px-6 pb-12">
          <Toaster position="top-right" />
          <div className="flex flex-col gap-1.5 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><Network className="size-6" /></div>
                <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Struktur Pengurus</h1>
              </div>
              <Button onClick={() => setIsAddDivOpen(true)} className="h-10 px-6 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 gap-2">
                <Plus className="size-4 stroke-[3px]" /> Tambah Divisi
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hierarki & Bagan Organisasi Ormawa</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64"><div className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : (
            <div className="space-y-8">
              {/* Root: Ketua */}
              <div className="flex flex-col items-center gap-4">
                {ketua && (
                  <OrgCard member={ketua} color="bg-primary/10" textColor="text-primary" size="lg" />
                )}
                {/* Connector */}
                {wakil && <div className="h-8 w-px bg-slate-200" />}
                {wakil && <OrgCard member={wakil} color="bg-violet-100" textColor="text-violet-600" size="md" />}
              </div>

              {/* Pengurus Inti */}
              {pengurusInti.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-100" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-headline">Pengurus Inti</p>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {pengurusInti.map(m => <OrgCard key={m.ID} member={m} color="bg-blue-50" textColor="text-blue-600" size="sm" />)}
                  </div>
                </div>
              )}

              {/* Divisi-Divisi */}
              {divisions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-100" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-headline">Divisi</p>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {divisions.map((div) => {
                      const divMembers = getDivisionMembers(div.Nama)
                      return (
                        <Card key={div.ID} className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-black text-slate-900 font-headline tracking-tighter text-sm uppercase">{div.Nama}</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{divMembers.length} anggota</p>
                              </div>
                              <Button onClick={() => setDelDiv(div)} variant="ghost" size="icon" className="h-7 w-7 hover:text-rose-600 hover:bg-rose-50 rounded-xl">
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {divMembers.length === 0
                                ? <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Belum ada anggota</p>
                                : divMembers.map(m => (
                                  <div key={m.ID} className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-2.5 py-1.5 border border-slate-100">
                                    <div className="size-5 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[8px] font-black uppercase">
                                      {(m.Mahasiswa?.Nama || '—').split(' ').map(n => n[0]).join('').substring(0, 2)}
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase font-headline">{m.Mahasiswa?.Nama?.split(' ')[0] || '—'}</span>
                                  </div>
                                ))
                              }
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {divisions.length === 0 && pengurusInti.length === 0 && !ketua && (
                <Card className="border-none shadow-sm bg-white/50 backdrop-blur-md">
                  <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
                    <Network className="size-12 text-slate-300 stroke-[1px]" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Belum ada data struktur organisasi.<br />Tambahkan anggota terlebih dahulu.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Division Dialog */}
      <Dialog open={isAddDivOpen} onOpenChange={setIsAddDivOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Network className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Plus className="size-4 stroke-[3px]" /></div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Division Registry</Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">Tambah Divisi Baru</DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">Buat divisi baru untuk pembagian tugas organisasi.</DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleAddDivision} className="p-8 pt-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Divisi</Label>
              <Input required value={divName} onChange={e => setDivName(e.target.value)} placeholder="Misal: Humas, Akademik, IT..."
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
            </div>
            <DialogFooter className="pt-4 flex flex-row gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30">
              <Button type="button" variant="ghost" onClick={() => setIsAddDivOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl flex-1">Batalkan</Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-8 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all flex-1">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Simpan Divisi</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={!!delDiv} onClose={() => setDelDiv(null)} onConfirm={handleDeleteDivision}
        title={`Hapus Divisi ${delDiv?.name}?`} description="Divisi ini akan dihapus. Anggota yang berada di divisi ini tidak akan ikut terhapus." loading={isSubmitting} />
    </div>
  )
}

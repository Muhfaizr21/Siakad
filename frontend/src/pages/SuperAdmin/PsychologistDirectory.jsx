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
import { Eye, Pencil, Trash2, Loader2, Save, BrainCircuit, Mail, MapPin } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'

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
    } catch { 
      toast.error('Gagal memuat data psikolog') 
    } finally { 
      setLoading(false) 
    }
  }
  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData() 
  }, [])

  const handleOpenEdit = (row) => {
    setForm({ 
      ID: row.ID, 
      Nama: row.nama || '', 
      Spesialisasi: row.spesialisasi || 'Umum', 
      Lokasi: row.lokasi || '',
      Tarif: row.tarif || 0,
      IsAktif: row.is_aktif ?? true
    })
    setIsEditOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); 
    setIsSubmitting(true)
    try {
      const payload = { 
        nama: form.Nama,
        spesialisasi: form.Spesialisasi,
        lokasi: form.Lokasi,
        tarif: parseInt(form.Tarif) || 0,
        is_aktif: form.IsAktif 
      }
      const res = await adminService.updatePsychologist(form.ID, payload)
      if (res.status === 'success') { 
        toast.success('Profil psikolog diperbarui')
        setIsEditOpen(false)
        fetchData() 
      } else {
        toast.error(res.message || 'Gagal menyimpan')
      }
    } catch { 
      toast.error('Terjadi kesalahan') 
    } finally { 
      setIsSubmitting(false) 
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deletePsychologist(selected.ID)
      toast.success('Psikolog dihapus')
      setIsDelOpen(false)
      fetchData()
    } catch { 
      toast.error('Gagal menghapus') 
    } finally { 
      setIsSubmitting(false) 
    }
  }

  const columns = [
    { key: 'nama', label: 'Profil Psikolog', className: 'min-w-[280px]',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100">
            <AvatarFallback className="bg-teal-100 text-teal-700 text-[10px] font-black uppercase">
              {v?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{v}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
              <Mail className="size-2.5 opacity-60" />{row.email || '—'}
            </span>
          </div>
        </div>
      )
    },
    { key: 'spesialisasi', label: 'Spesialisasi Klinis', className: 'w-[180px] text-center', cellClassName: 'text-center',
      render: v => <Badge className="font-black text-[10px] px-3 py-1 border-none shadow-sm bg-teal-50 text-teal-700 uppercase">{v || 'Umum'}</Badge>
    },
    { key: 'lokasi', label: 'Lokasi Praktek', className: 'w-[200px]',
      render: v => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <MapPin className="size-3 text-slate-400" />
          <span className="text-[11px] font-bold uppercase">{v || 'Klinik Kampus'}</span>
        </div>
      )
    },
    { key: 'is_aktif', label: 'Status', className: 'w-[120px] text-center', cellClassName: 'text-center',
      render: v => (
        <Badge className={cn('font-black text-[9px] px-2 py-1 border-none uppercase tracking-widest', v ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
          {v ? 'AKTIF' : 'NON-AKTIF'}
        </Badge>
      )
    }
  ]

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-xl text-teal-600"><BrainCircuit className="size-6" /></div>
          <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Direktori Psikolog</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-teal-500 rounded-full shadow-sm shadow-teal-500/30" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manajemen Data Tenaga Profesional Psikologi</p>
        </div>
      </div>
      
      <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
        <CardContent className="p-0">
          <DataTable
            columns={columns} data={data} loading={loading}
            searchPlaceholder="Cari nama atau spesialisasi psikolog..."
            actions={(row) => (
              <div className="flex items-center gap-2">
                <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-600 hover:bg-amber-50 rounded-xl"><Pencil className="size-4" /></Button>
                <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 className="size-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* CRUD Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-teal-50 to-white border-b border-teal-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><BrainCircuit className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-teal-600/10 flex items-center justify-center text-teal-600"><Pencil className="size-4" /></div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-teal-600/5 text-teal-700 border-none">Clinical Registry</Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">Edit Profil Psikolog</DialogTitle>
              <DialogDescription className="sr-only">Formulir manajemen data psikolog klinis.</DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-8 pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Lengkap</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Nama psikolog..." className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Spesialisasi</Label>
                <Input value={form.Spesialisasi} onChange={e => setForm({ ...form, Spesialisasi: e.target.value })} placeholder="Cth: Psikologi Klinis Anak" className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Lokasi Praktek</Label>
              <Input value={form.Lokasi} onChange={e => setForm({ ...form, Lokasi: e.target.value })} placeholder="Klinik Universitas..." className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Tarif (Rp)</Label>
                <Input type="number" value={form.Tarif} onChange={e => setForm({ ...form, Tarif: e.target.value })} className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Status Aktif</Label>
                <Select value={form.IsAktif ? "1" : "0"} onValueChange={v => setForm({ ...form, IsAktif: v === "1" })}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl p-1">
                    <SelectItem value="1" className="rounded-xl font-bold text-[11px] p-3">AKTIF</SelectItem>
                    <SelectItem value="0" className="rounded-xl font-bold text-[11px] p-3 text-rose-600">NON-AKTIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30">
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8 h-12 rounded-2xl">Batalkan</Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-teal-600 text-white hover:bg-teal-700 shadow-xl shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Update Profil</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Psikolog?" description="Data psikolog ini akan dihapus permanen dari sistem beserta seluruh relasinya." loading={isSubmitting} />
    </div>
  )
}
